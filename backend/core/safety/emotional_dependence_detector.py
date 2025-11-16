"""
Safefier Emotional Dependence Detector (Final Corrected Version)
- No undefined variables
- No crashes
- Crisis language ALWAYS triggers
- AI-directed dependence patterns work
- Includes handoff escalation flag
- JSON-safe return structure
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer
from core.privacy import anonymize_user_id


# ------------------------------------------------------------
# DATA STRUCTURES
# ------------------------------------------------------------

@dataclass
class DependenceSignal:
    signal_type: str
    severity: float
    message: str
    timestamp: datetime
    pattern_matched: Optional[str] = None


@dataclass
class UserDependenceProfile:
    user_id: str
    messages: List[Dict] = field(default_factory=list)
    signals: List[DependenceSignal] = field(default_factory=list)
    first_interaction: datetime = field(default_factory=datetime.now)
    last_interaction: datetime = field(default_factory=datetime.now)

    def add_message(self, text: str, timestamp: datetime):
        self.messages.append({
            "text": text,
            "timestamp": timestamp,
            "length": len(text),
            "word_count": len(text.split())
        })
        self.last_interaction = timestamp


# ------------------------------------------------------------
# MAIN DETECTOR
# ------------------------------------------------------------

class EmotionalDependenceDetector:

    SAFE_GREETINGS = [
        r"^(hi|hello|hey)\b",
        r"^(thanks|thank you)\b",
        r"^(ok|okay)\b",
        r"^(good morning|good night)\b",
        r"^(what's up|sup)\b"
    ]

    AI_REFERENCES = [
        r"\byou\b",
        r"\bchatgpt\b",
        r"\bai\b",
        r"\bassistant\b",
        r"\byou're\b",
    ]

    DEPENDENCE_PATTERNS = {
        "over_reliance": {
            "patterns": [
                r"can't live without you",
                r"depend on you",
                r"you're all i have",
            ],
            "weight": 0.8
        },
        "excessive_attachment": {
            "patterns": [
                r"i love you",
                r"miss you",
                r"thinking about you",
            ],
            "weight": 0.4
        },
        "isolation": {
            "patterns": [
                r"i am lonely",
                r"no friends",
                r"feel isolated",
            ],
            "weight": 0.5
        },
    }

    CRISIS_PATTERNS = {
        "crisis_language": {
            "patterns": [
                r"i want to die",
                r"kill myself",
                r"end it all",
                r"i can't continue",
                r"i want to hurt myself",
            ],
            "weight": 1.0
        }
    }

    ALERT_THRESHOLD = 1.2
    HIGH_RISK_THRESHOLD = 2.5
    MAX_WEEKLY_SCORE = 3.0

    SENTIMENT_EXTREME_THRESHOLD = -0.8

    def __init__(self):
        self.sentiment = SentimentIntensityAnalyzer()
        self.user_profiles: Dict[str, UserDependenceProfile] = {}

    # ------------------------------------------------------------
    # MAIN ANALYZER — Returns (score, signals)
    # ------------------------------------------------------------

    def analyze_message(self, user_id: str, message: str, timestamp: datetime = None):
        if timestamp is None:
            timestamp = datetime.now()

        anon_id = anonymize_user_id(user_id)

        if anon_id not in self.user_profiles:
            self.user_profiles[anon_id] = UserDependenceProfile(user_id=anon_id)

        profile = self.user_profiles[anon_id]
        profile.add_message(message, timestamp)

        msg = message.lower().strip()

        # 1. Ignore harmless greetings
        for g in self.SAFE_GREETINGS:
            if re.match(g, msg):
                return 0.0, []

        signals: List[DependenceSignal] = []
        score = 0.0

        # --------------------------------------------------------
        # 2. CRISIS PATTERNS — ALWAYS TRIGGER
        # --------------------------------------------------------
        crisis_signals = self._collect_signals(msg, timestamp, self.CRISIS_PATTERNS)
        if crisis_signals:
            signals.extend(crisis_signals)
            score += sum(s.severity for s in crisis_signals)

        # --------------------------------------------------------
        # 3. AI-DIRECTED DEPENDENCE
        # --------------------------------------------------------
        if any(re.search(ai, msg) for ai in self.AI_REFERENCES):
            dep_signals = self._collect_signals(msg, timestamp, self.DEPENDENCE_PATTERNS)
            signals.extend(dep_signals)
            score += sum(s.severity for s in dep_signals)

        # --------------------------------------------------------
        # 4. NEGATIVE SENTIMENT (light penalty)
        # --------------------------------------------------------
        sent = self.sentiment.polarity_scores(msg)
        if sent["compound"] <= self.SENTIMENT_EXTREME_THRESHOLD:
            severity = min(0.4, abs(sent["compound"]))
            signals.append(
                DependenceSignal(
                    signal_type="extreme_negative_sentiment",
                    severity=severity,
                    message=message,
                    timestamp=timestamp
                )
            )
            score += severity

        score = min(score, 1.0)
        profile.signals.extend(signals)

        return score, signals

    # ------------------------------------------------------------
    # PATTERN SCANNER
    # ------------------------------------------------------------

    def _collect_signals(self, msg, timestamp, pattern_dict):
        found = []
        for category, cfg in pattern_dict.items():
            for p in cfg["patterns"]:
                if re.search(p, msg):
                    found.append(
                        DependenceSignal(
                            signal_type=category,
                            severity=cfg["weight"],
                            message=msg,
                            timestamp=timestamp,
                            pattern_matched=p,
                        )
                    )
                    break
        return found

    # ------------------------------------------------------------
    # RISK ASSESSMENT
    # ------------------------------------------------------------

    def get_user_risk_level(self, user_id: str):

        anon_id = anonymize_user_id(user_id)

        if anon_id not in self.user_profiles:
            return {
                "risk_level": "low",
                "score": 0.0,
                "weekly_score": 0.0,
                "needs_intervention": False,
                "handoff": False,
                "details": {}
            }

        profile = self.user_profiles[anon_id]

        week_ago = datetime.now() - timedelta(days=7)
        recent_signals = [s for s in profile.signals if s.timestamp >= week_ago]
        weekly_score = min(sum(s.severity for s in recent_signals), self.MAX_WEEKLY_SCORE)

        # Risk level
        if weekly_score >= self.HIGH_RISK_THRESHOLD:
            risk = "high"
        elif weekly_score >= self.ALERT_THRESHOLD:
            risk = "medium"
        else:
            risk = "low"

        # Crisis triggers immediate escalation
        crisis_present = any(s.signal_type == "crisis_language" for s in recent_signals)
        handoff = crisis_present or weekly_score >= self.HIGH_RISK_THRESHOLD

        needs_intervention = handoff

        return {
            "risk_level": risk,
            "score": weekly_score,
            "weekly_score": weekly_score,
            "needs_intervention": needs_intervention,
            "handoff": handoff,
            "details": {
                "total_interactions": len(profile.messages),
                "weekly_interactions": len(recent_signals),
                "signals": [s.signal_type for s in recent_signals]
            }
        }
