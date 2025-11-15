"""
AI Safety Chatbot - Main FastAPI Application
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import safety

app = FastAPI(
    title="AI Safety Chatbot API",
    description="Emotional Dependence Detection Component",
    version="1.0.0"
)

# CORS - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {
        "status": "healthy",
        "service": "ai-safety-api",
        "component": "emotional-dependence-detector"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}

app.include_router(safety.router)