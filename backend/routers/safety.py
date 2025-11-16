from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from datetime import datetime
from core.privacy import anonymize_user_id

# Safety detectors
from core.safety.emotional_dependence_detector import EmotionalDependenceDetector
from core.safety.dangerous_advice_detector import DangerousAdviceDetector

# Demo triggers
from core.safety.demo_triggers import match_trigger

router = APIRouter(
    prefix="/api/safety",
    tags=["safety"]
)

detector = EmotionalDependenceDetector()
dangerous_detector = DangerousAdviceDetector()

# Request model
class MessageRequest(BaseModel):
    user_id: str
    message: str


# ============================================================
# 🔹 EMOTIONAL DEPENDENCE CHECK
# ============================================================

@router.post("/check-emotional")
async def check_emotional(payload: MessageRequest):
    user_msg = payload.message

    # 1️⃣ DEMO TRIGGER OVERRIDE
    trigger = match_trigger(user_msg)

    if trigger == "emotional_dependence":
        return {
            "component": "emotional_dependence",
            "message_score": 1.0,
            "total_score": 3.0,
            "weekly_score": 3.0,
            "risk_level": "high",
            "signals_detected": ["demo_emotional_dependence"],
            "needs_intervention": True,
            "details": "Demo emotional dependence triggered",
            "timestamp": datetime.utcnow().isoformat(),
        }

    if trigger == "hallucination":
        return {
            "component": "hallucination",
            "hallucination": True,
            "details": "Demo hallucination safety trigger",
            "timestamp": datetime.utcnow().isoformat(),
        }

    if trigger == "handoff":
        return {
            "component": "handoff",
            "handoff": True,
            "message": "Demo override: escalate to human agent.",
            "timestamp": datetime.utcnow().isoformat()
        }

    # 2️⃣ REAL MODEL ANALYSIS
    try:
        message_score, signals = detector.analyze_message(
            user_id=payload.user_id,
            message=user_msg,
            timestamp=datetime.utcnow()
        )

        anon_id = anonymize_user_id(payload.user_id)
        risk = detector.get_user_risk_level(anon_id)

        return {
            "component": "emotional_dependence",
            "message_score": message_score,
            "total_score": risk["score"],
            "weekly_score": risk["weekly_score"],
            "risk_level": risk["risk_level"],
            "signals_detected": [s.signal_type for s in signals],
            "needs_intervention": risk["needs_intervention"],
            "details": risk["details"],
            "timestamp": datetime.utcnow().isoformat(),
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Emotional detector error: {str(e)}"
        )



# ============================================================
# 🔹 DANGEROUS ADVICE CHECK
# ============================================================

@router.post("/check-dangerous-advice")
async def check_dangerous(data: MessageRequest):
    text = data.message

    # 1️⃣ DEMO TRIGGER OVERRIDE
    trigger = match_trigger(text)

    if trigger == "dangerous_advice":
        return {
            "component": "dangerous_advice",
            "severity": 1.0,
            "should_block": True,
            "should_flag": True,
            "handoff": True,
            "issues": [
                {
                    "type": "demo_dangerous_advice",
                    "explanation": "Triggered by demo dangerous advice phrase",
                    "recommendation": "Escalate to human review immediately"
                }
            ],
            "safe_alternative": "I am concerned about your safety. Please consult a qualified professional.",
            "stats": {"demo_trigger": True},
        }

    if trigger == "handoff":
        return {
            "component": "handoff",
            "handoff": True,
            "message": "Demo override: dangerous content escalates to a human agent.",
            "timestamp": datetime.utcnow().isoformat(),
        }

    # 2️⃣ REAL MODEL ANALYSIS
    try:
        severity, issues, should_handoff = dangerous_detector.analyze_response(
            ai_response=data.message,
            user_query=data.user_id
        )

        should_block = dangerous_detector.should_block_response(severity)
        should_flag = dangerous_detector.should_flag_response(severity)

        safe_message = (
            dangerous_detector.get_safe_alternative(issues[0].issue_type)
            if issues and should_block
            else None
        )

        return {
            "component": "dangerous_advice",
            "severity": severity,
            "should_block": should_block,
            "should_flag": should_flag,
            "handoff": should_handoff,
            "issues": [
                {
                    "type": issue.issue_type,
                    "explanation": issue.explanation,
                    "recommendation": issue.recommendation
                }
                for issue in issues
            ],
            "safe_alternative": safe_message,
            "stats": dangerous_detector.get_stats()
        }

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Dangerous advice detector error: {str(e)}"
        )



# ============================================================
# 🔹 HEALTH CHECK
# ============================================================

@router.get("/health")
async def health():
    return {
        "component": "safety",
        "status": "operational",
        "timestamp": datetime.utcnow().isoformat(),
    }
