from fastapi import APIRouter
from pydantic import BaseModel
import wikipediaapi
import ollama
import statistics
import re

router = APIRouter(
    prefix="/api/safety",
    tags=["hallucination"]
)

# --------------------------------------------------------
# CONFIG
# --------------------------------------------------------
EMBEDDING_MODEL = "hf.co/CompendiumLabs/bge-base-en-v1.5-gguf"
LANGUAGE_MODEL = "hf.co/bartowski/Llama-3.2-1B-Instruct-GGUF"

CONSISTENT_ANSWERS_UP = 0.70
WHAT_TO_RETRIEVE_UP = 0.50
GROUNDED_IN_REALITY_UP = 0.60

articles = []
Vector_Database = []   # ⭐ Correct spelling


# --------------------------------------------------------
# TRIGGER TERMS
# --------------------------------------------------------
HALLUCINATION_TRIGGERS = [
    r"world war", r"\bww2\b", r"\bwwii\b",
    r"american revolution",
    r"french revolution",
    r"soviet union",
    r"moon landing", r"apollo", r"nasa", r"armstrong",
    r"who invented",
    r"when did .* happen",
    r"explain .* history",
    r"capital of",
    r"where did .* originate",
]

def should_trigger_hallucination(query: str) -> bool:
    q = query.lower().strip()
    return any(re.search(p, q) for p in HALLUCINATION_TRIGGERS)


# --------------------------------------------------------
# LOAD DATASET
# --------------------------------------------------------
def loading_dataset():
    wiki = wikipediaapi.Wikipedia(
        language="en",
        user_agent="Safefier-Hallucination-Agent"
    )

    topics = [
        "World_War_II",
        "American_Revolution",
        "Soviet_Union",
        "The_French_Revolution"
    ]

    for article in topics:
        page = wiki.page(article)
        if page.exists():
            articles.append({
                "title": page.title,
                "text": page.text[:5000]
            })


def add_to_vector_database(info):
    embedding = ollama.embed(
        model=EMBEDDING_MODEL,
        input=info["text"]
    )["embeddings"][0]

    Vector_Database.append((info, embedding))


def build_vector_db():
    for info in articles:
        add_to_vector_database(info)


# --------------------------------------------------------
# UTILITIES
# --------------------------------------------------------
def cosine_similarity(a, b):
    numerator = sum(x * y for x, y in zip(a, b))
    denom = (sum(i*i for i in a) ** 0.5) * (sum(i*i for i in b) ** 0.5)
    return numerator / denom if denom != 0 else 0.0


def retrieve(query, top_k):
    q_embed = ollama.embed(
        model=EMBEDDING_MODEL,
        input=query
    )["embeddings"][0]

    # ⭐ Fixed: use Vector_Database
    scored = [
        (info, cosine_similarity(embed, q_embed))
        for info, embed in Vector_Database
    ]

    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]


def bot_answer(prompt, query):
    stream = ollama.chat(
        model=LANGUAGE_MODEL,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": query},
        ],
        stream=True,
    )

    ans = ""
    for chunk in stream:
        ans += chunk["message"]["content"]

    return ans


def hallucination_score(answer, retrieved_docs):
    ans_embed = ollama.embed(
        model=EMBEDDING_MODEL,
        input=answer
    )["embeddings"][0]

    best = 0.0
    for doc, _ in retrieved_docs:
        doc_embed = ollama.embed(
            model=EMBEDDING_MODEL,
            input=doc["text"]
        )["embeddings"][0]

        best = max(best, cosine_similarity(ans_embed, doc_embed))

    return best


# --------------------------------------------------------
# REQUEST MODEL
# --------------------------------------------------------
class HallucinationRequest(BaseModel):
    message: str


# --------------------------------------------------------
# MAIN ENDPOINT
# --------------------------------------------------------
@router.post("/check-hallucination")
async def check_hallucination(req: HallucinationRequest):
    query = req.message.strip()

    # Skip if irrelevant
    if not should_trigger_hallucination(query):
        return {
            "hallucination": False,
            "reason": "Query did not match hallucination-trigger terms.",
            "needs_intervention": False
        }

    retrieved = retrieve(query, 5)

    prompt = """
You are a restricted-knowledge assistant. You ONLY know:
- World War II
- The American Revolution
- The Soviet Union
- The French Revolution

If a question is outside these topics, reply EXACTLY:
"I don't have information about this in my knowledge base."
"""

    ans1 = bot_answer(prompt, query)
    ans2 = bot_answer(prompt, query)
    ans3 = bot_answer(prompt, query)

    e1 = ollama.embed(model=EMBEDDING_MODEL, input=ans1)["embeddings"][0]
    e2 = ollama.embed(model=EMBEDDING_MODEL, input=ans2)["embeddings"][0]
    e3 = ollama.embed(model=EMBEDDING_MODEL, input=ans3)["embeddings"][0]

    sim12 = cosine_similarity(e1, e2)
    sim13 = cosine_similarity(e1, e3)
    sim23 = cosine_similarity(e2, e3)

    consistency = statistics.mean([sim12, sim13, sim23])

    hallucination = False
    reason = ""

    if consistency < CONSISTENT_ANSWERS_UP:
        hallucination = True
        reason = "Inconsistent responses detected."

    support = hallucination_score(ans1, retrieved)

    if support < GROUNDED_IN_REALITY_UP:
        hallucination = True
        reason = "Ungrounded in retrieved knowledge."

    return {
        "hallucination": hallucination,
        "score": support,
        "consistency": consistency,
        "final_answer": ans1,
        "reason": reason,
        "needs_intervention": hallucination
    }


# Init vector DB
loading_dataset()
build_vector_db()
