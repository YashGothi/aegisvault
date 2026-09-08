"""
Root URL Configuration for vault_project.
"""

from django.contrib import admin
from django.urls import path, include
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

@api_view(['GET'])
@permission_classes([AllowAny])
def health_check(request):
    """Health check and API metadata endpoint."""
    return Response({
        'status': 'healthy',
        'service': 'Secure Password Vault REST API',
        'version': '1.0.0',
        'endpoints': {
            'auth': '/api/auth/',
            'vault': '/api/vault/',
            'admin': '/admin/'
        }
    })

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', health_check, name='health-check'),
    path('api/auth/', include('apps.authentication.urls')),
    path('api/vault/', include('apps.vault.urls')),
]
