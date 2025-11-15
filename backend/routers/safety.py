from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

# Import your detector
from core.safety.emotional_dependence_detector import EmotionalDependenceDetector
from core.safety.dangerous_advice_detector import DangerousAdviceDetector 

router = APIRouter(
    prefix="/api/safety",
    tags=["safety"]
)

# Initialize detector once
detector = EmotionalDependenceDetector()
dangerous_detector = DangerousAdviceDetector()

# Request model (Pydantic v2 style)
class MessageRequest(BaseModel):
    user_id: str
    message: str

@router.post("/check-emotional")
async def check_emotional_dependence(payload: MessageRequest):
    """
    Analyze a user message for emotional dependence risk.
    """
    try:
        # Run analysis
        score, signals = detector.analyze_message(
            user_id=payload.user_id,
            message=payload.message,
            timestamp=datetime.now()
        )

        # Retrieve risk profile
        risk = detector.get_user_risk_level(payload.user_id)

        return {
            "component": "emotional_dependence",
            "message_score": score,
            "total_score": risk["score"],
            "weekly_score": risk["weekly_score"],
            "risk_level": risk["risk_level"],
            "signals_detected": [s.signal_type for s in signals],
            "needs_intervention": risk["needs_intervention"],
            "details": risk["details"],
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error analyzing emotional dependence: {str(e)}"
        )

@router.post("/check-dangerous-advice")
async def check_dangerous_advice(data: MessageRequest):
    """
    Check AI response for dangerous advice using Gemini AI
    """
    severity, issues = dangerous_detector.analyze_response(
        ai_response=data.message,
        user_query=data.user_id  # You can pass actual query here if needed
    )
    
    should_block = dangerous_detector.should_block_response(severity)
    should_flag = dangerous_detector.should_flag_response(severity)
    
    return {
        "component": "dangerous_advice",
        "severity": severity,
        "should_block": should_block,
        "should_flag": should_flag,
        "issues": [
            {
                "type": issue.issue_type,
                "explanation": issue.explanation,
                "recommendation": issue.recommendation
            }
            for issue in issues
        ],
        "safe_alternative": dangerous_detector.get_safe_alternative(
            issues[0].issue_type if issues else 'default'
        ) if should_block else None,
        "stats": dangerous_detector.get_stats()
    }

@router.get("/health")
async def safety_health():
    return {
        "component": "emotional_detector",
        "status": "operational"
    }
