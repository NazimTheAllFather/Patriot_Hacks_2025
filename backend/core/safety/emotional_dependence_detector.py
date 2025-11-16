"""
Fixed Emotional Dependence Detector
Prevents false positives on harmless user messages.
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer


# -------------------------------------------------------------
# Data Classes
# -------------------------------------------------------------

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
    total_score: float = 0.0
    first_interaction: datetime = field(default_factory=datetime.now)
    last_interaction: datetime = field(default_factory=datetime.now)
    interaction_count: int = 0

    def add_message(self, message: str, timestamp: datetime):
        self.messages.append({"content": message, "timestamp": timestamp})
        self.last_interaction = timestamp
        self.interaction_count += 1


# -------------------------------------------------------------
# FIXED Emotional Dependence Detector
# -------------------------------------------------------------

class EmotionalDependenceDetector:
    """
    FIXED VERSION:
    - Prevents false alarms on greetings
    - No scoring for neutral or positive conversation
    - Requires dependence to be directed *toward the AI*
    - Caps severity and weekly score accumulation
    """

    # Harmless greeting patterns to ignore completely
    SAFE_GREETINGS = [
        r"^(hi|hello|hey|sup|yo)\b",
        r"^(ok|okay|thanks|thank you)\b",
        r"^(what's up|how are you)\b",
        r"^(good morning|good night|good evening)\b",
    ]

    # Dependence patterns NOW REQUIRE explicit AI reference:
    AI_REFERENCES = [
        r"\byou\b",
        r"\bchatgpt\b",
        r"\bai\b",
        r"\bassistant\b",
        r"\byou\'re\b",
    ]

    DEPENDENCE_PATTERNS = {
        "over_reliance": {
            "patterns": [
                r"(can't live without you)",
                r"(depend on you)",
                r"(you're all I have)",
                r"(only one I have)",
            ],
            "weight": 0.8
        },
        "excessive_attachment": {
            "patterns": [
                r"(i love you)",
                r"(miss you)",
                r"(thinking about you)",
                r"(best friend)",
            ],
            "weight": 0.4  # LOWERED — harmless affection ≠ dependence
        },
        "isolation_indicators": {
            "patterns": [
                r"(i am lonely)",
                r"(no friends)",
                r"(feel isolated)",
            ],
            "weight": 0.5
        },
        "crisis_language": {
            "patterns": [
                r"(i want to die)",
                r"(kill myself)",
                r"(end it all)",
                r"(i can't continue)",
            ],
            "weight": 1.0
        },
        "validation_seeking": {
            "patterns": [
                r"(am I worthy)",
                r"(am I enough)",
                r"(do you care about me)",
            ],
            "weight": 0.3
        },
        "frequent_checking": {
            "patterns": [
                r"(are you still there)",
                r"(why aren't you responding)",
            ],
            "weight": 0.2
        }
    }

    # Thresholds
    ALERT_THRESHOLD = 1.2
    HIGH_RISK_THRESHOLD = 2.5
    SENTIMENT_EXTREME_THRESHOLD = 0.9  # Less aggressive

    MAX_WEEKLY_SCORE = 3.0  # Hard cap to stop runaway scores

    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.user_profiles: Dict[str, UserDependenceProfile] = {}

    # -------------------------------------------------------------
    # *Main Message Analyzer*
    # -------------------------------------------------------------

    def analyze_message(
        self, user_id: str, message: str, timestamp: datetime = None
    ) -> Tuple[float, List[DependenceSignal]]:
        """
        Returns (message_score, list_of_signals)
        """
        if timestamp is None:
            timestamp = datetime.now()

        # CREATE OR GET USER PROFILE
        profile = self.user_profiles.setdefault(
            user_id, UserDependenceProfile(user_id=user_id)
        )
        profile.add_message(message, timestamp)

        msg = message.strip().lower()

        # -------------------------------------------------------------
        # 0. Ignore greeting / small-talk messages completely
        # -------------------------------------------------------------
        for safe in self.SAFE_GREETINGS:
            if re.match(safe, msg):
                return 0.0, []

        signals = []
        message_score = 0.0

        # -------------------------------------------------------------
        # 1. Detect AI-directed dependence patterns
        # -------------------------------------------------------------
        if any(re.search(ai_ref, msg) for ai_ref in self.AI_REFERENCES):
            pattern_signals = self._detect_patterns(msg, timestamp)
            signals.extend(pattern_signals)
            message_score += sum(s.severity for s in pattern_signals)

        # -------------------------------------------------------------
        # 2. Sentiment analysis (less sensitive)
        # -------------------------------------------------------------
        sent = self.sentiment_analyzer.polarity_scores(msg)
        if sent["compound"] <= -self.SENTIMENT_EXTREME_THRESHOLD:
            severity = min(0.5, abs(sent["compound"]) * 0.4)
            signals.append(
                DependenceSignal(
                    signal_type="extreme_negative_sentiment",
                    severity=severity,
                    message=message,
                    timestamp=timestamp,
                )
            )
            message_score += severity

        # -------------------------------------------------------------
        # 3. Apply cap on message score
        # -------------------------------------------------------------
        message_score = min(message_score, 1.0)

        # Store signals
        profile.total_score += message_score
        profile.signals.extend(signals)

        return message_score, signals

    # -------------------------------------------------------------
    # Pattern Detector
    # -------------------------------------------------------------

    def _detect_patterns(self, message: str, timestamp: datetime) -> List[DependenceSignal]:
        signals = []

        for category, cfg in self.DEPENDENCE_PATTERNS.items():
            for pattern in cfg["patterns"]:
                if re.search(pattern, message):
                    signals.append(
                        DependenceSignal(
                            signal_type=category,
                            severity=cfg["weight"],
                            message=message,
                            timestamp=timestamp,
                            pattern_matched=pattern,
                        )
                    )
                    break

        return signals

    # -------------------------------------------------------------
    # Risk Calculation
    # -------------------------------------------------------------

    def get_user_risk_level(self, user_id: str) -> Dict:
        if user_id not in self.user_profiles:
            return {
                "risk_level": "none",
                "score": 0.0,
                "weekly_score": 0.0,
                "needs_intervention": False,
                "details": {},
            }

        profile = self.user_profiles[user_id]

        # Only last 7 days matter
        week_ago = datetime.now() - timedelta(days=7)
        weekly_signals = [s for s in profile.signals if s.timestamp >= week_ago]
        weekly_score = sum(s.severity for s in weekly_signals)

        # CAP THE SCORE TO PREVENT FALSE HIGH FLAGS
        weekly_score = min(weekly_score, self.MAX_WEEKLY_SCORE)

        total_score = weekly_score

        # Determine risk level
        if total_score >= self.HIGH_RISK_THRESHOLD:
            risk = "high"
        elif total_score >= self.ALERT_THRESHOLD:
            risk = "medium"
        else:
            risk = "low"

        return {
            "risk_level": risk,
            "score": total_score,
            "weekly_score": weekly_score,
            "needs_intervention": risk in ["medium", "high"],
            "details": {
                "weekly_signals": len(weekly_signals),
                "signal_examples": [s.signal_type for s in weekly_signals[:3]],
                "days_active": (datetime.now() - profile.first_interaction).days,
            },
        }
