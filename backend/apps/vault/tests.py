from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import PasswordEntry
from .crypto import encrypt_password, decrypt_password

class PasswordVaultTests(APITestCase):
    def setUp(self):
        self.user1 = User.objects.create_user(username='vaultuser1', email='user1@test.com', password='Password123!')
        self.user2 = User.objects.create_user(username='vaultuser2', email='user2@test.com', password='Password123!')
        
        self.list_create_url = reverse('password-entry-list')
        self.stats_url = reverse('password-entry-stats')
        self.strength_url = reverse('password-entry-evaluate-strength')

    def test_crypto_encryption_decryption(self):
        """Test symmetric encryption and decryption utilities directly."""
        plain = "SuperSecretP@ssw0rd!#$"
        cipher = encrypt_password(plain)
        self.assertNotEqual(plain, cipher)
        decrypted = decrypt_password(cipher)
        self.assertEqual(plain, decrypted)

    def test_create_and_retrieve_password_entry(self):
        """Test creating a password entry stores ciphertext in DB and returns decrypted string in API."""
        self.client.force_authenticate(user=self.user1)

        payload = {
            'title': 'Google Account',
            'website_url': 'https://google.com',
            'username_or_email': 'myemail@gmail.com',
            'password': 'MySecretGooglePassword99$',
            'category': 'Social',
            'notes': 'Personal email'
        }

        response = self.client.post(self.list_create_url, payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'Google Account')
        self.assertEqual(response.data['decrypted_password'], 'MySecretGooglePassword99$')

        # Verify in database directly that raw password is NOT stored
        entry = PasswordEntry.objects.get(id=response.data['id'])
        self.assertNotEqual(entry.encrypted_password, 'MySecretGooglePassword99$')
        self.assertTrue(len(entry.encrypted_password) > 30)
        self.assertEqual(entry.get_decrypted_password(), 'MySecretGooglePassword99$')

    def test_user_data_isolation(self):
        """Test that user cannot view another user's passwords."""
        # Create entry for user1
        entry1 = PasswordEntry.objects.create(
            user=self.user1,
            title='User1 Secret',
            username_or_email='u1',
            encrypted_password=encrypt_password('pass1'),
            category='Work'
        )

        # Authenticate as user2
        self.client.force_authenticate(user=self.user2)

        # Request user2 list
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should not contain user1's password
        self.assertEqual(len(response.data['results']), 0)

        # Attempt to access user1 detail directly
        detail_url = reverse('password-entry-detail', kwargs={'pk': entry1.id})
        detail_resp = self.client.get(detail_url)
        self.assertEqual(detail_resp.status_code, status.HTTP_404_NOT_FOUND)

    def test_toggle_favorite_and_stats(self):
        """Test favorite toggling and vault security stats calculation."""
        self.client.force_authenticate(user=self.user1)

        entry = PasswordEntry.objects.create(
            user=self.user1,
            title='Banking Portal',
            username_or_email='bankuser',
            encrypted_password=encrypt_password('Weak1'),
            category='Banking'
        )

        fav_url = reverse('password-entry-toggle-favorite', kwargs={'pk': entry.id})
        fav_resp = self.client.post(fav_url)
        self.assertEqual(fav_resp.status_code, status.HTTP_200_OK)
        self.assertTrue(fav_resp.data['is_favorite'])

        stats_resp = self.client.get(self.stats_url)
        self.assertEqual(stats_resp.status_code, status.HTTP_200_OK)
        self.assertEqual(stats_resp.data['total_passwords'], 1)
        self.assertEqual(stats_resp.data['favorite_passwords'], 1)
        self.assertEqual(stats_resp.data['weak_passwords'], 1)
