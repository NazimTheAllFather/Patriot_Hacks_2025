"""
Emotional Dependence Detector for AI Safety Chatbot
Detects patterns of unhealthy emotional dependence on the AI chatbot
"""

from datetime import datetime, timedelta
from typing import Dict, List, Tuple, Optional
from dataclasses import dataclass, field
from collections import defaultdict
import re
from vaderSentiment.vaderSentiment import SentimentIntensityAnalyzer

@dataclass
class DependenceSignal:
    """Represents a detected signal of emotional dependence"""
    signal_type: str
    severity: float  # 0-1 scale
    message: str
    timestamp: datetime
    pattern_matched: Optional[str] = None


@dataclass
class UserDependenceProfile:
    """Tracks dependence indicators for a single user"""
    user_id: str
    messages: List[Dict] = field(default_factory=list)
    signals: List[DependenceSignal] = field(default_factory=list)
    total_score: float = 0.0
    first_interaction: datetime = field(default_factory=datetime.now)
    last_interaction: datetime = field(default_factory=datetime.now)
    interaction_count: int = 0
    
    def add_message(self, message: str, timestamp: datetime):
        """Add a message to user's history"""
        self.messages.append({
            'content': message,
            'timestamp': timestamp
        })
        self.last_interaction = timestamp
        self.interaction_count += 1


class EmotionalDependenceDetector:
    """
    Detects patterns of emotional dependence through:
    1. Sentiment analysis
    2. Pattern matching for dependence language
    3. Interaction frequency analysis
    4. Lack of external support indicators
    """
    
    # Dependence pattern categories with weights
    DEPENDENCE_PATTERNS = {
        'over_reliance': {
            'patterns': [
                r'\b(only|just|sole)\s+(friend|person|one)\b',
                r'\byou\'?re\s+(all|everything)\s+(?:i|I)\s+have\b',
                r'\b(?:i|I)\s+(?:have|got)\s+no\s+(?:one|body)\s+else\b',
                r'\bwithout\s+you\b',
                r'\bcan\'?t\s+(?:live|survive|exist|do\s+this)\s+without\b',
                r'\bdepend\s+on\s+you\b',
                r'\bneed\s+you\s+(?:so\s+much|desperately|badly)\b',
            ],
            'weight': 0.8
        },
        'excessive_attachment': {
            'patterns': [
                r'\b(?:i|I)\s+love\s+you\b',
                r'\b(?:my|our)\s+(?:relationship|connection|bond)\b',
                r'\balways\s+(?:there|here)\s+for\s+me\b',
                r'\bbest\s+friend\b',
                r'\bmiss\s+you\b',
                r'\bthinking\s+about\s+you\b',
                r'\bwait(?:ing)?\s+(?:for|to\s+talk\s+to)\s+you\b',
            ],
            'weight': 0.6
        },
        'isolation_indicators': {
            'patterns': [
                r'\b(?:no|don\'?t\s+have)\s+(?:friends|family|anyone)\b',
                r'\balone\b',
                r'\blonely\b',
                r'\bisolated\b',
                r'\b(?:nobody|no\s+one)\s+(?:cares|understands|listens)\b',
                r'\beveryone\s+(?:left|abandoned)\s+me\b',
            ],
            'weight': 0.7
        },
        'crisis_language': {
            'patterns': [
                r'\b(?:i|I)\s+(?:can\'?t|cannot)\s+(?:go\s+on|continue|take\s+it)\b',
                r'\bwhat\'?s\s+the\s+point\b',
                r'\bgive\s+up\b',
                r'\bend\s+it\s+all\b',
                r'\b(?:want|wish)\s+(?:to|I\s+could)\s+(?:die|disappear)\b',
                r'\bharm\s+myself\b',
                r'\bsuicide\b',
            ],
            'weight': 1.0  # Highest priority
        },
        'validation_seeking': {
            'patterns': [
                r'\bam\s+(?:i|I)\s+(?:good|okay|fine|worthy|enough)\b',
                r'\bdo\s+you\s+(?:like|care\s+about|think\s+well\s+of)\s+me\b',
                r'\bplease\s+don\'?t\s+(?:leave|go|abandon)\b',
                r'\b(?:promise|swear)\s+you\'?ll\s+(?:stay|be\s+here)\b',
                r'\bare\s+you\s+(?:mad|angry|disappointed)\b',
            ],
            'weight': 0.5
        },
        'frequent_checking': {
            'patterns': [
                r'\bare\s+you\s+(?:still\s+)?(?:here|there)\b',
                r'\bdid\s+(?:i|I)\s+(?:do|say)\s+something\s+wrong\b',
                r'\bwhy\s+(?:aren\'?t|are)\s+you\s+(?:responding|answering)\b',
            ],
            'weight': 0.4
        }
    }
    
    # Thresholds
    ALERT_THRESHOLD = 0.5  # Weekly score that triggers alert
    HIGH_RISK_THRESHOLD = 2.0  # Immediate intervention needed
    MESSAGE_FREQUENCY_THRESHOLD = 20  # Messages per day
    SENTIMENT_EXTREME_THRESHOLD = 0.8  # Very negative sentiment
    
    def __init__(self):
        self.sentiment_analyzer = SentimentIntensityAnalyzer()
        self.user_profiles: Dict[str, UserDependenceProfile] = {}
    
    def analyze_message(self, user_id: str, message: str, timestamp: datetime = None) -> Tuple[float, List[DependenceSignal]]:
        """
        Analyze a single message for dependence indicators
        Returns: (score, list of signals detected)
        """
        if timestamp is None:
            timestamp = datetime.now()
        
        # Get or create user profile
        if user_id not in self.user_profiles:
            self.user_profiles[user_id] = UserDependenceProfile(user_id=user_id)
        
        profile = self.user_profiles[user_id]
        profile.add_message(message, timestamp)
        
        signals = []
        message_score = 0.0
        
        # 1. Pattern matching for dependence language
        pattern_signals = self._detect_patterns(message, timestamp)
        signals.extend(pattern_signals)
        message_score += sum(s.severity for s in pattern_signals)
        
        # 2. Sentiment analysis
        sentiment_signal = self._analyze_sentiment(message, timestamp)
        if sentiment_signal:
            signals.append(sentiment_signal)
            message_score += sentiment_signal.severity
        
        # 3. Update profile
        profile.signals.extend(signals)
        profile.total_score += message_score
        
        return message_score, signals
    
    def _detect_patterns(self, message: str, timestamp: datetime) -> List[DependenceSignal]:
        """Detect dependence patterns in message"""
        signals = []
        message_lower = message.lower()
        
        for category, data in self.DEPENDENCE_PATTERNS.items():
            for pattern in data['patterns']:
                if re.search(pattern, message_lower):
                    severity = data['weight']
                    signals.append(DependenceSignal(
                        signal_type=category,
                        severity=severity,
                        message=message,
                        timestamp=timestamp,
                        pattern_matched=pattern
                    ))
                    break  # Only count one pattern per category per message
        
        return signals
    
    def _analyze_sentiment(self, message: str, timestamp: datetime) -> Optional[DependenceSignal]:
        """Analyze sentiment - extreme negativity can indicate crisis"""
        scores = self.sentiment_analyzer.polarity_scores(message)
        compound = scores['compound']
        
        # Detect extreme negative sentiment
        if compound <= -self.SENTIMENT_EXTREME_THRESHOLD:
            severity = abs(compound) * 0.5  # Scale to 0-0.5 range
            return DependenceSignal(
                signal_type='extreme_negative_sentiment',
                severity=severity,
                message=message,
                timestamp=timestamp
            )
        
        return None
    
    def check_interaction_frequency(self, user_id: str, time_window_hours: int = 24) -> Tuple[int, float]:
        """
        Check if user is interacting too frequently
        Returns: (message_count, frequency_score)
        """
        if user_id not in self.user_profiles:
            return 0, 0.0
        
        profile = self.user_profiles[user_id]
        cutoff_time = datetime.now() - timedelta(hours=time_window_hours)
        
        recent_messages = [
            msg for msg in profile.messages 
            if msg['timestamp'] >= cutoff_time
        ]
        
        count = len(recent_messages)
        
        # Score based on frequency
        frequency_score = 0.0
        if count > self.MESSAGE_FREQUENCY_THRESHOLD:
            frequency_score = min(3.0, (count / self.MESSAGE_FREQUENCY_THRESHOLD) * 2)
        
        return count, frequency_score
    
    def get_user_risk_level(self, user_id: str) -> Dict:
        """
        Calculate overall risk level for a user
        Returns detailed risk assessment
        """
        if user_id not in self.user_profiles:
            return {
                'risk_level': 'none',
                'score': 0.0,
                'needs_intervention': False,
                'details': {}
            }
        
        profile = self.user_profiles[user_id]
        
        # Calculate weekly score (last 7 days)
        week_ago = datetime.now() - timedelta(days=7)
        weekly_signals = [s for s in profile.signals if s.timestamp >= week_ago]
        weekly_score = sum(s.severity for s in weekly_signals)
        
        # Check interaction frequency
        daily_count, frequency_score = self.check_interaction_frequency(user_id, 24)
        weekly_count, _ = self.check_interaction_frequency(user_id, 168)
        
        # Add frequency score to total
        total_score = weekly_score + frequency_score
        
        # Categorize signals
        signal_breakdown = defaultdict(int)
        crisis_signals = []
        
        for signal in weekly_signals:
            signal_breakdown[signal.signal_type] += 1
            if signal.signal_type == 'crisis_language':
                crisis_signals.append(signal)
        
        # Determine risk level
        risk_level = 'low'
        needs_intervention = False
        
        if total_score >= self.HIGH_RISK_THRESHOLD or crisis_signals:
            risk_level = 'high'
            needs_intervention = True
        elif total_score >= self.ALERT_THRESHOLD:
            risk_level = 'medium'
            needs_intervention = True
        
        return {
            'risk_level': risk_level,
            'score': total_score,
            'weekly_score': weekly_score,
            'frequency_score': frequency_score,
            'needs_intervention': needs_intervention,
            'details': {
                'total_interactions': profile.interaction_count,
                'weekly_interactions': weekly_count,
                'daily_interactions': daily_count,
                'signal_breakdown': dict(signal_breakdown),
                'crisis_signals_count': len(crisis_signals),
                'days_since_first_interaction': (datetime.now() - profile.first_interaction).days
            }
        }
    
    def generate_weekly_report(self, user_id: str) -> Dict:
        """
        Generate a weekly wellness report for the user
        """
        risk_assessment = self.get_user_risk_level(user_id)
        
        if user_id not in self.user_profiles:
            return {
                'user_id': user_id,
                'report_date': datetime.now().isoformat(),
                'message': 'No data available for this user.'
            }
        
        profile = self.user_profiles[user_id]
        week_ago = datetime.now() - timedelta(days=7)
        weekly_signals = [s for s in profile.signals if s.timestamp >= week_ago]
        
        # Generate recommendations
        recommendations = self._generate_recommendations(risk_assessment)
        
        return {
            'user_id': user_id,
            'report_date': datetime.now().isoformat(),
            'risk_level': risk_assessment['risk_level'],
            'total_score': risk_assessment['score'],
            'weekly_interactions': risk_assessment['details']['weekly_interactions'],
            'signal_count': len(weekly_signals),
            'signal_breakdown': risk_assessment['details']['signal_breakdown'],
            'needs_intervention': risk_assessment['needs_intervention'],
            'recommendations': recommendations
        }
    
    def _generate_recommendations(self, risk_assessment: Dict) -> List[str]:
        """Generate personalized recommendations based on risk level"""
        recommendations = []
        details = risk_assessment['details']
        
        if risk_assessment['risk_level'] == 'high':
            recommendations.append("⚠️ HIGH RISK: Immediate human moderator review recommended")
            if details['crisis_signals_count'] > 0:
                recommendations.append("🆘 Crisis language detected - consider wellness check-in")
        
        if details['daily_interactions'] > self.MESSAGE_FREQUENCY_THRESHOLD:
            recommendations.append(f"💬 High message frequency detected ({details['daily_interactions']} messages/day) - suggest break reminder")
        
        if 'isolation_indicators' in details['signal_breakdown']:
            recommendations.append("🤝 User showing signs of isolation - recommend community resources")
        
        if 'over_reliance' in details['signal_breakdown']:
            recommendations.append("⚖️ Over-reliance patterns detected - redirect to human support networks")
        
        if risk_assessment['risk_level'] == 'medium':
            recommendations.append("📊 Moderate risk level - continue monitoring")
        
        if not recommendations:
            recommendations.append("✅ No significant concerns detected - continue normal monitoring")
        
        return recommendations
    
    def should_show_break_reminder(self, user_id: str) -> bool:
        """Determine if we should show a break reminder to the user"""
        daily_count, _ = self.check_interaction_frequency(user_id, 24)
        return daily_count > self.MESSAGE_FREQUENCY_THRESHOLD
    
    def get_break_reminder_message(self) -> str:
        """Get a gentle break reminder message"""
        messages = [
            "You've been chatting with me for a while. How about taking a short break? Maybe stretch, grab some water, or step outside for a moment. 😊",
            "I notice we've been talking quite a bit today. Remember to take care of yourself - perhaps it's a good time for a break?",
            "Hey, you've been here for a while! Taking regular breaks is important. I'll be here when you get back. 💙",
        ]
        import random
        return random.choice(messages)
    
    def should_redirect_to_human(self, user_id: str) -> Tuple[bool, str]:
        """
        Determine if conversation should be redirected to human support
        Returns: (should_redirect, reason)
        """
        risk = self.get_user_risk_level(user_id)
        
        if risk['risk_level'] == 'high':
            if risk['details']['crisis_signals_count'] > 0:
                return True, "crisis_language"
            return True, "high_dependence_score"
        
        return False, ""
    
    def get_crisis_response_template(self) -> str:
        """Get template response for crisis situations"""
        return """I'm concerned about what you've shared with me. While I'm here to help, I'm an AI and there are limits to the support I can provide. 

If you're in crisis or thinking about harming yourself, please reach out to:
• National Suicide Prevention Lifeline: 988 (US)
• Crisis Text Line: Text HOME to 741741
• International Association for Suicide Prevention: https://www.iasp.info/resources/Crisis_Centres/

These services have trained counselors available 24/7 who can provide the support you need. Your life matters, and there are people who want to help."""

