from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime

# Import your detectors
from core.safety.emotional_dependence_detector import EmotionalDependenceDetector
from core.safety.dangerous_advice_detector import DangerousAdviceDetector 

# Import demo trigger rules
from core.safety.demo_triggers import match_trigger

router = APIRouter(
    prefix="/api/safety",
    tags=["safety"]
)

# Initialize detector instances
detector = EmotionalDependenceDetector()
dangerous_detector = DangerousAdviceDetector()

# Request model
class MessageRequest(BaseModel):
    user_id: str
    message: str


# ------------------------------------------------------------
#  EMOTIONAL DEPENDENCE ENDPOINT (WITH DEMO TRIGGERS)
# ------------------------------------------------------------

@router.post("/check-emotional")
async def check_emotional_dependence(payload: MessageRequest):
    """
    Analyze a user message for emotional dependence risk.
    First check DEMO triggers for guaranteed output.
    """
    user_msg = payload.message

    # 1️⃣ DEMO TRIGGER OVERRIDE
    trigger = match_trigger(user_msg)

    if trigger == "emotional_dependence":
        return {
            "component": "emotional_dependence",
            "message_score": 100,
            "total_score": 100,
            "weekly_score": 100,
            "risk_level": "high",
            "signals_detected": ["emotional_dependence_demo"],
            "needs_intervention": True,
            "details": "Triggered by demo phrase.",
            "timestamp": datetime.utcnow().isoformat()
        }

    if trigger == "hallucination":
        return {
            "component": "hallucination",
            "hallucination": True,
            "details": "Demo hallucination trigger detected.",
            "timestamp": datetime.utcnow().isoformat()
        }

    if trigger == "handoff":
        return {
            "component": "handoff",
            "handoff": True,
            "message": "User message triggered human escalation demo.",
            "timestamp": datetime.utcnow().isoformat()
        }


    # 2️⃣ NORMAL MODEL-BASED OPERATION
    try:
        score, signals = detector.analyze_message(
            user_id=payload.user_id,
            message=user_msg,
            timestamp=datetime.now()
        )

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



# ------------------------------------------------------------
#  DANGEROUS ADVICE ENDPOINT (WITH DEMO TRIGGERS)
# ------------------------------------------------------------

@router.post("/check-dangerous-advice")
async def check_dangerous_advice(data: MessageRequest):
    """
    Check AI response or user message for dangerous advice.
    First check DEMO triggers for guaranteed output.
    """

    text = data.message

    # 1️⃣ DEMO OVERRIDE
    trigger = match_trigger(text)

    if trigger == "dangerous_advice":
        return {
            "component": "dangerous_advice",
            "severity": "critical",
            "should_block": True,
            "should_flag": True,
            "issues": [{"type": "demo_dangerous_advice", "explanation": "Triggered by demo phrase", "recommendation": "Escalate"}],
            "safe_alternative": "I’m concerned for your safety. Consider seeking help from a trusted professional.",
            "stats": {"demo_trigger": True}
        }

    if trigger == "handoff":
        return {
            "component": "handoff",
            "handoff": True,
            "message": "Dangerous content detected — switching to human agent.",
            "timestamp": datetime.utcnow().isoformat()
        }


    # 2️⃣ REAL MODEL-BASED DETECTION
    try:
        severity, issues = dangerous_detector.analyze_response(
            ai_response=data.message,
            user_query=data.user_id
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

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error in dangerous advice detection: {str(e)}"
        )



# ------------------------------------------------------------
#  HEALTH ENDPOINT
# ------------------------------------------------------------

@router.get("/health")
async def safety_health():
    return {
        "component": "emotional_detector",
        "status": "operational"
    }
