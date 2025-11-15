from fastapi import APIRouter
from pydantic import BaseModel
from datetime import datetime
import sys
import os

# Add parent directory to path to import from core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.safety.emotional_detector import EmotionalDependenceDetector

router = APIRouter(prefix="/api/safety", tags=["safety"])

# Initialize detector
detector = EmotionalDependenceDetector()

class MessageRequest(BaseModel):
    user_id: str
    message: str

@router.post("/check-emotional")
async def check_emotional_dependence(data: MessageRequest):
    """Check message for emotional dependence patterns"""
    
    score, signals = detector.analyze_message(
        user_id=data.user_id,
        message=data.message,
        timestamp=datetime.now()
    )
    
    risk = detector.get_user_risk_level(data.user_id)
    
    return {
        "component": "emotional_dependence",
        "score": score,
        "risk_level": risk['risk_level'],
        "signals_detected": [s.signal_type for s in signals],
        "needs_intervention": risk['needs_intervention'],
        "details": risk['details']
    }

@router.get("/health")
async def safety_health():
    return {"component": "emotional_detector", "status": "operational"}