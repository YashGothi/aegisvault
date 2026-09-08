from collections import Counter
from django.db.models import Q
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import PasswordEntry
from .serializers import PasswordEntrySerializer
from .crypto import calculate_password_strength

class PasswordEntryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for PasswordEntry CRUD operations with encryption, search, filtering, and stats.
    """
    serializer_class = PasswordEntrySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'username_or_email', 'website_url', 'notes', 'category']
    ordering_fields = ['title', 'category', 'is_favorite', 'created_at', 'updated_at']
    ordering = ['-is_favorite', '-updated_at']

    def get_queryset(self):
        """Only return passwords belonging to the authenticated user."""
        user = self.request.user
        queryset = PasswordEntry.objects.filter(user=user)

        # Optional filter by category
        category = self.request.query_params.get('category')
        if category and category.lower() != 'all':
            queryset = queryset.filter(category__iexact=category)

        # Optional filter by favorite status
        is_favorite = self.request.query_params.get('is_favorite')
        if is_favorite is not None:
            if is_favorite.lower() in ('true', '1'):
                queryset = queryset.filter(is_favorite=True)
            elif is_favorite.lower() in ('false', '0'):
                queryset = queryset.filter(is_favorite=False)

        # Optional manual search query param
        query = self.request.query_params.get('q')
        if query:
            queryset = queryset.filter(
                Q(title__icontains=query) |
                Q(username_or_email__icontains=query) |
                Q(website_url__icontains=query) |
                Q(category__icontains=query) |
                Q(notes__icontains=query)
            )

        return queryset

    @action(detail=True, methods=['post'], url_path='toggle-favorite')
    def toggle_favorite(self, request, pk=None):
        """Toggle favorite status for a password entry."""
        entry = self.get_object()
        entry.is_favorite = not entry.is_favorite
        entry.save(update_fields=['is_favorite', 'updated_at'])
        return Response({
            'id': entry.id,
            'is_favorite': entry.is_favorite,
            'message': f"Marked as {'favorite' if entry.is_favorite else 'unfavorite'}."
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], url_path='stats')
    def stats(self, request):
        """
        Calculates vault security analytics:
        - Total passwords
        - Favorites count
        - Weak vs Strong breakdown
        - Reused passwords detection
        - Category breakdown
        """
        entries = PasswordEntry.objects.filter(user=request.user)
        total_count = entries.count()
        favorite_count = entries.filter(is_favorite=True).count()

        categories_counter = Counter()
        passwords_list = []
        weak_count = 0
        strong_count = 0

        for entry in entries:
            categories_counter[entry.category] += 1
            decrypted = entry.get_decrypted_password()
            passwords_list.append(decrypted)
            strength = calculate_password_strength(decrypted)
            if strength['score'] <= 1:
                weak_count += 1
            elif strength['score'] >= 3:
                strong_count += 1

        # Reused passwords detection
        reused_count = sum(1 for count in Counter(passwords_list).values() if count > 1)

        # Health score (0-100)
        if total_count > 0:
            health_score = int(max(0, 100 - (weak_count / total_count * 60) - (reused_count * 15)))
        else:
            health_score = 100

        return Response({
            'total_passwords': total_count,
            'favorite_passwords': favorite_count,
            'weak_passwords': weak_count,
            'strong_passwords': strong_count,
            'reused_passwords': reused_count,
            'health_score': health_score,
            'categories': dict(categories_counter),
        }, status=status.HTTP_200_OK)

    @action(detail=False, methods=['post'], url_path='evaluate-strength')
    def evaluate_strength(self, request):
        """Evaluates strength for a given raw password candidate."""
        password = request.data.get('password', '')
        result = calculate_password_strength(password)
        return Response(result, status=status.HTTP_200_OK)
