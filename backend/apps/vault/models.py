from django.db import models
from django.contrib.auth.models import User
from .crypto import encrypt_password, decrypt_password

class PasswordEntry(models.Model):
    """
    Model representing an encrypted password item stored securely in the database.
    """
    CATEGORY_CHOICES = [
        ('General', 'General'),
        ('Social', 'Social Media'),
        ('Banking', 'Banking & Finance'),
        ('Work', 'Work & Productivity'),
        ('Entertainment', 'Entertainment & Streaming'),
        ('Shopping', 'E-Commerce & Shopping'),
        ('Email', 'Email & Communication'),
        ('Development', 'Developer & Tech'),
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='passwords')
    title = models.CharField(max_length=255, help_text="e.g. Google Account, GitHub, Bank of America")
    website_url = models.CharField(max_length=500, blank=True, default="", help_text="https://example.com")
    username_or_email = models.CharField(max_length=255, help_text="Username, Email or Identifier")
    encrypted_password = models.TextField(help_text="AES-256 Fernet Encrypted ciphertext")
    category = models.CharField(max_length=50, choices=CATEGORY_CHOICES, default='General')
    notes = models.TextField(blank=True, default="", help_text="Optional encrypted/plain notes")
    is_favorite = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-is_favorite', '-updated_at']
        verbose_name = 'Password Entry'
        verbose_name_plural = 'Password Entries'

    def __str__(self):
        return f"{self.title} ({self.username_or_email}) - {self.user.username}"

    def set_password(self, raw_password: str):
        """Encrypts and sets the raw password into encrypted_password field."""
        self.encrypted_password = encrypt_password(raw_password)

    def get_decrypted_password(self) -> str:
        """Returns the decrypted plaintext password."""
        return decrypt_password(self.encrypted_password)
