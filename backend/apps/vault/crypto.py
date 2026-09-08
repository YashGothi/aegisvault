"""
Cryptographic and Security Utilities for Password Vault.
Implements AES-256 Fernet symmetric encryption for at-rest password protection.
"""

import base64
import os
import re
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from django.conf import settings

def get_fernet_suite() -> Fernet:
    """
    Returns a configured Fernet suite using settings.ENCRYPTION_KEY or
    derives a deterministic key from SECRET_KEY if not configured.
    """
    key = getattr(settings, 'ENCRYPTION_KEY', None)
    if key and len(key) == 44:
        try:
            return Fernet(key.encode('utf-8') if isinstance(key, str) else key)
        except Exception:
            pass

    # Fallback to key derived from Django SECRET_KEY via PBKDF2
    salt = b"vault_master_salt_2026"
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100_000,
    )
    derived_key = base64.urlsafe_b64encode(kdf.derive(settings.SECRET_KEY.encode('utf-8')))
    return Fernet(derived_key)


def encrypt_password(plain_text: str) -> str:
    """
    Encrypts a plaintext password string into a Fernet ciphertext token.
    """
    if not plain_text:
        return ""
    fernet = get_fernet_suite()
    encrypted_bytes = fernet.encrypt(plain_text.encode('utf-8'))
    return encrypted_bytes.decode('utf-8')


def decrypt_password(cipher_text: str) -> str:
    """
    Decrypts a Fernet ciphertext token back into the original plaintext password.
    """
    if not cipher_text:
        return ""
    try:
        fernet = get_fernet_suite()
        decrypted_bytes = fernet.decrypt(cipher_text.encode('utf-8'))
        return decrypted_bytes.decode('utf-8')
    except Exception as e:
        return f"[Decryption Error: {str(e)}]"


def calculate_password_strength(password: str) -> dict:
    """
    Analyzes password complexity and returns a strength score (0-4), label, and feedback.
    """
    if not password:
        return {'score': 0, 'label': 'Very Weak', 'color': '#ef4444', 'suggestions': ['Password is empty']}

    score = 0
    suggestions = []

    length = len(password)
    if length >= 8:
        score += 1
    else:
        suggestions.append('Make password at least 8 characters long')

    if length >= 14:
        score += 1

    if re.search(r'[a-z]', password) and re.search(r'[A-Z]', password):
        score += 1
    else:
        suggestions.append('Use a mix of uppercase and lowercase letters')

    if re.search(r'\d', password):
        score += 1
    else:
        suggestions.append('Include at least one number')

    if re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        score += 1
    else:
        suggestions.append('Include special characters (!@#$%^&*)')

    # Normalize score to 0..4
    normalized_score = min(4, max(0, score - 1)) if length >= 8 else 0

    labels = {
        0: ('Very Weak', '#ef4444'),
        1: ('Weak', '#f97316'),
        2: ('Fair', '#eab308'),
        3: ('Good', '#3b82f6'),
        4: ('Strong', '#10b981')
    }

    label, color = labels.get(normalized_score, ('Weak', '#ef4444'))

    return {
        'score': normalized_score,
        'label': label,
        'color': color,
        'length': length,
        'suggestions': suggestions
    }
