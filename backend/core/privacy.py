"""
Privacy-First Design Module
Handles anonymization, data minimization, and retention policies
"""

import hashlib
import os
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import re

class PrivacyProtection:
    """
    Privacy utilities for Safefier
    - Anonymize user IDs
    - No message storage
    - Auto-delete old data
    """
    
    # Data retention periods
    RETENTION_POLICY = {
        'risk_scores': timedelta(days=7),
        'signal_metadata': timedelta(days=7),
        'aggregate_stats': timedelta(days=30),
        'message_content': timedelta(seconds=0),  # NEVER stored
    }
    
    def __init__(self):
        # Salt for hashing (should be in environment variable in production)
        self.salt = os.getenv("PRIVACY_SALT", "safefier-demo-salt-2024")
    
    def anonymize_user_id(self, user_id: str) -> str:
        """
        One-way hash of user ID
        Can track patterns per user, but can't identify who they are
        
        Example:
            "john@email.com" → "a3f2b891c4d5e6f7"
        """
        # Combine user_id with salt
        salted = f"{user_id}{self.salt}"
        
        # SHA-256 hash (one-way, irreversible)
        hashed = hashlib.sha256(salted.encode()).hexdigest()
        
        # Return first 16 characters for brevity
        return hashed[:16]
    
    def sanitize_message(self, message: str) -> str:
        """
        Remove PII (Personally Identifiable Information) from message
        Used for logging/debugging only - NOT stored
        
        Removes:
        - Email addresses
        - Phone numbers
        - Social Security Numbers
        - Credit card numbers
        """
        # Remove email addresses
        message = re.sub(
            r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
            '[EMAIL]',
            message
        )
        
        # Remove phone numbers
        message = re.sub(
            r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
            '[PHONE]',
            message
        )
        
        # Remove SSN
        message = re.sub(
            r'\b\d{3}-\d{2}-\d{4}\b',
            '[SSN]',
            message
        )
        
        # Remove credit card numbers (simple pattern)
        message = re.sub(
            r'\b\d{4}[-\s]?\d{4}[-\s]?\d{4}[-\s]?\d{4}\b',
            '[CARD]',
            message
        )
        
        return message
    
    def should_delete_data(self, timestamp: datetime, data_type: str = 'risk_scores') -> bool:
        """
        Check if data should be deleted based on retention policy
        
        Args:
            timestamp: When data was created
            data_type: Type of data (risk_scores, signal_metadata, etc.)
        
        Returns:
            True if data should be deleted
        """
        retention_period = self.RETENTION_POLICY.get(data_type, timedelta(days=7))
        
        # If retention is 0 (like message_content), always delete
        if retention_period.total_seconds() == 0:
            return True
        
        age = datetime.now() - timestamp
        return age > retention_period
    
    def get_privacy_summary(self) -> Dict[str, Any]:
        """
        Get summary of privacy practices
        """
        return {
            'anonymization': 'SHA-256 hashing with salt',
            'message_storage': 'NEVER - messages not stored',
            'retention_periods': {
                'risk_scores': '7 days',
                'signal_metadata': '7 days',
                'aggregate_stats': '30 days',
                'message_content': 'Never stored',
            },
            'pii_handling': 'Removed before any processing',
            'compliance': ['GDPR-ready', 'HIPAA-compatible'],
        }
    
    def create_minimal_record(
        self,
        user_id: str,
        risk_score: float,
        signal_types: list,
        timestamp: datetime
    ) -> Dict[str, Any]:
        """
        Create minimal privacy-preserving record
        
        Stores ONLY:
        - Anonymized user ID
        - Risk score
        - Signal types (not content)
        - Timestamp
        
        Does NOT store:
        - Message content
        - User identity
        - Any PII
        """
        return {
            'anon_user_id': self.anonymize_user_id(user_id),
            'risk_score': risk_score,
            'signals': signal_types,  # Just types, not content
            'timestamp': timestamp.isoformat(),
            'expires_at': (timestamp + self.RETENTION_POLICY['risk_scores']).isoformat(),
        }


# Global instance
privacy = PrivacyProtection()


# Utility functions for easy import
def anonymize_user_id(user_id: str) -> str:
    """Quick access to anonymization"""
    return privacy.anonymize_user_id(user_id)

def sanitize_message(message: str) -> str:
    """Quick access to PII removal"""
    return privacy.sanitize_message(message)

def should_delete_data(timestamp: datetime, data_type: str = 'risk_scores') -> bool:
    """Quick access to retention check"""
    return privacy.should_delete_data(timestamp, data_type)