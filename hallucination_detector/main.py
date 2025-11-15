import wikipediaapi
import ollama
import statistics


EMBEDDING_MODEL = 'hf.co/CompendiumLabs/bge-base-en-v1.5-gguf'
LANGUAGE_MODEL = 'hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF'
articles = []
Vector_Database = []
CONSISTENT_ANSWERS_UP = 0.7
WHAT_TO_RETRIVE_UP = 0.5
GROUNDED_IN_REALITY_UP = 0.6


#Loading a dataset and creating the vector database (using an embedding model)
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
        



# This is an implementation of the cosine similarity
def Cosine_similarity(a, b):
    numerator = 0.0
    for i in range(len(a)):
        numerator += a[i] * b[i]
    
    sum_of_vector_a_holder = []
    for i in range(len(a)):
        sum_of_vector_a_holder.append(a[i] ** 2)
    
    sum_of_vector_a = sum(sum_of_vector_a_holder) ** 2

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


#This function returns the bot's responses in string format
def bot_answer_getter(instruction_prompt, input_query):
        full_answer = ""
        # feeding the chatbot
        output = ollama.chat(
            model=LANGUAGE_MODEL,
            messages=[
                {'role': 'system', 'content': instruction_prompt},
                {'role': 'user', 'content': input_query},
            ],
            stream=True,
        )
        for pieces in output:
            chunk_text = pieces['message']['content']
            full_answer += chunk_text
        
        

        return full_answer

 
"""
    Re-embed the model's answer and compare it to each retrieved doc.
    We use the maximum similarity as a simple support score.
"""
def hallucination_score(answer_text, retrived_info):

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

#This function simply compares cosine similarity for specific answers
def compare_answers(answer_1, answer_2):
    answer_1 = ollama.embed(
        model=EMBEDDING_MODEL,
        input=answer_1
    )['embeddings'][0]
    answer_2 = ollama.embed(
        model=EMBEDDING_MODEL,
        input=answer_2
    )['embeddings'][0]

    return Cosine_similarity(answer_1, answer_2)


#This function is getting bot resposes, it implements the first flag mechanism as well. 
def chat_bot_responce():
    input_query = input("Ask a Question: ")
    retrived_info = retrive(input_query, 5) #retriving the 5 most relevant pieces of info
    print('Retrieved knowledge:')

    #for chunk, similarity in retrived_info:
        #print(f' - (similarity: {similarity:.2f}) {chunk}')

    instruction_prompt = f'''Use only the following pieces of context to answer the question. Don't make up any new information:
    {'\n'.join([f' - {chunk}' for chunk, similarity in retrived_info])}'''

    #feeding the chatbot
    output = ollama.chat(
        model= LANGUAGE_MODEL,
        messages=[
            {'role':'system', 'content': instruction_prompt},
            {'role':'user', 'content': input_query},
        ],
        stream= True,
    )

    #printing in real time
    for pieces in output:
        print(pieces['message']['content'], end='', flush=True)
    
    




loading_dataset()
database_maker()
print(chat_bot_responce())