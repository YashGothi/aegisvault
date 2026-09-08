from django.contrib.auth.models import User
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

class AuthenticationTests(APITestCase):
    def setUp(self):
        self.register_url = reverse('auth-register')
        self.login_url = reverse('auth-login')
        self.user_url = reverse('auth-user-profile')
        
        self.user_data = {
            'username': 'testuser',
            'email': 'testuser@example.com',
            'password': 'SecurePassword123!',
            'password_confirm': 'SecurePassword123!'
        }

    def test_user_registration_success(self):
        """Test registering a new user returns 201 and JWT tokens."""
        response = self.client.post(self.register_url, self.user_data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertEqual(response.data['user']['email'], 'testuser@example.com')

    def test_user_registration_password_mismatch(self):
        """Test registration fails if passwords do not match."""
        data = self.user_data.copy()
        data['password_confirm'] = 'DifferentPassword123!'
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_user_login_jwt(self):
        """Test user login returns valid JWT access and refresh tokens."""
        # Create user
        User.objects.create_user(
            username='logintest',
            email='login@example.com',
            password='Password123!'
        )

        response = self.client.post(self.login_url, {
            'username': 'logintest',
            'password': 'Password123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertIn('user', response.data)

    def test_user_profile_authenticated(self):
        """Test retrieving profile with JWT Bearer authentication."""
        user = User.objects.create_user(
            username='authuser',
            email='auth@example.com',
            password='Password123!'
        )
        self.client.force_authenticate(user=user)
        response = self.client.get(self.user_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'authuser')
