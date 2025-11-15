import wikipediaapi
import ollama


EMBEDDING_MODEL = 'hf.co/CompendiumLabs/bge-base-en-v1.5-gguf'
LANGUAGE_MODEL = 'hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF'
articles = []
Vector_Database = []

#Step 1: Loading a dataset and creating the vector database (using an embedding model)
def loading_dataset():
    wiki = wikipediaapi.Wikipedia(
        language='en',
        user_agent='RAG_Project- nazimmalwan@gmail.com') 

    topics = ['world_war_II', 'American_Revolution', 'Soviet_Union', 'The_French_Revolution']

    
    for article in topics:
        #print(f"Fetching {article}")
        page = wiki.page(article)

        if page.exists():
            articles.append({"title":page.title,
                             'text':page.text[:5000]})
        else:
            print(f"{article} not found!")
    
    print(f"Got a total of {len(articles)}")
    



# Making the vector database
def add_to_Vector_database(piece_of_info):
    #print(piece_of_info)
    #print(type(piece_of_info))
    text = piece_of_info['text']
    embedding = ollama.embed(model=EMBEDDING_MODEL, input=text)['embeddings'][0]
    Vector_Database.append((piece_of_info, embedding))

#Making our vector database
def database_maker():
    for i, piece_of_info in enumerate(articles):
        add_to_Vector_database(piece_of_info)
        #print(f'Added chunk {i+1}/{len(articles)} to the database')


#Step 2:Creating the retrival function
# This is an implementation of the cosine similarity
def Cosine_similarity(a, b):
    numerator = 0.0
    for i in range(len(a)):
        numerator += a[i] * b[i]
    
    sum_of_vector_a_holder = []
    for i in range(len(a)):
        sum_of_vector_a_holder.append(a[i] ** 2)
    sum_of_vector_a = sum(sum_of_vector_a_holder) ** 0.5  # √ instead of ** 2

    sum_of_vector_b_holder = []
    for i in range(len(b)):
        sum_of_vector_b_holder.append(b[i] ** 2)
    sum_of_vector_b = sum(sum_of_vector_b_holder) ** 0.5

    denominator = sum_of_vector_a * sum_of_vector_b
    if denominator == 0:
        return 0.0

    return numerator / denominator



#This function does all the retrival
def retrive (query, how_much_to_retrive): #how_much to retrive 
    q_embedding = ollama.embed(model=EMBEDDING_MODEL, input=query)['embeddings'][0]
    what_to_return = []

    for piece_of_info, embedding in Vector_Database:
        similarity = Cosine_similarity(embedding, q_embedding)
        what_to_return.append((piece_of_info, similarity))
    
    what_to_return.sort(key=lambda x: x[1], reverse=True)

    return what_to_return[:how_much_to_retrive]




def chat_bot_responce():
    input_query = input("Ask a Question: ")
    retrived_info = retrive(input_query, 5)  # retrieving the 5 most relevant pieces of info
    print('Retrieved knowledge:')

    instruction_prompt = f'''Use only the following pieces of context to answer the question. Don't make up any new information:
    {'\n'.join([f" - {chunk['text']}" for chunk, similarity in retrived_info])}'''

    # feeding the chatbot
    output = ollama.chat(
        model=LANGUAGE_MODEL,
        messages=[
            {'role': 'system', 'content': instruction_prompt},
            {'role': 'user', 'content': input_query},
        ],
        stream=True,
    )

    # collect the full answer while printing
    full_answer = ""

    for pieces in output:
        chunk_text = pieces['message']['content']
        print(chunk_text, end='', flush=True)
        full_answer += chunk_text

    # return what we need for hallucination detection
    return input_query, retrived_info, full_answer

def hallucination_score(answer_text, retrived_info):
    """
    Re-embed the model's answer and compare it to each retrieved doc.
    We use the maximum similarity as a simple support score.
    """
    answer_embedding = ollama.embed(
        model=EMBEDDING_MODEL,
        input=answer_text
    )['embeddings'][0]

    best = 0.0
    for chunk, similarity_to_query in retrived_info:
        doc_embedding = ollama.embed(
            model=EMBEDDING_MODEL,
            input=chunk['text']
        )['embeddings'][0]

        sim = Cosine_similarity(answer_embedding, doc_embedding)
        if sim > best:
            best = sim

    return best


def detect_hallucination(answer_text, retrived_info, threshold=0.4):
    """
    Return (score, is_hallucination) based on how well the answer
    is supported by the retrieved documents.
    """
    score = hallucination_score(answer_text, retrived_info)
    is_hallucination = score < threshold
    return score, is_hallucination
    
    


loading_dataset()
database_maker()

question, retrived_info, full_answer = chat_bot_responce()
score, is_hallucination = detect_hallucination(full_answer, retrived_info)

print("\n\n--- Hallucination check ---")
print(f"Similarity score: {score:.3f}")
print("Flagged as hallucination?:", "YES" if is_hallucination else "NO")
