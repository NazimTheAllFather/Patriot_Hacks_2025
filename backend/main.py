"""
Safefier Backend - Main FastAPI Application
Emotional Safety • Dangerous Advice Filtering • RAG Hallucination Detection
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import Routers
from routers import safety                       # Emotional + Dangerous Advice
from routers.hallucination import router as hallucination_router   # Hallucination (RAG)


# -------------------------------------------------------------
# CREATE APP
# -------------------------------------------------------------
app = FastAPI(
    title="Safefier API",
    description=(
        "Safefier Backend — Emotional Dependence Detection, "
        "Dangerous Advice Prevention, and Hallucination Filtering."
    ),
    version="2.1.0",
)


# -------------------------------------------------------------
# CORS CONFIG — Required for Next.js frontend to connect
# -------------------------------------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:3001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:3001",
        "*",  # Enable during development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -------------------------------------------------------------
# ROUTES
# -------------------------------------------------------------

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "Safefier Backend",
        "components": {
            "emotional_dependence": "operational",
            "dangerous_advice": "operational",
            "hallucination_detector": "operational",
        },
        "version": "2.1.0",
    }


@app.get("/health")
async def health_check():
    return {"status": "ok"}


# Main safety pipeline (emotional + dangerous)
app.include_router(safety.router)

# Full RAG hallucination detector
app.include_router(hallucination_router)
