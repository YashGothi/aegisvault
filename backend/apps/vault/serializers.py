from rest_framework import serializers
from .models import PasswordEntry
from .crypto import encrypt_password, decrypt_password, calculate_password_strength

class PasswordEntrySerializer(serializers.ModelSerializer):
    """
    Serializer for PasswordEntry model.
    Handles transparent encryption on write and decryption on read.
    """
    password = serializers.CharField(
        write_only=True,
        required=False,
        style={'input_type': 'password'},
        help_text="Plaintext password to be encrypted and stored"
    )
    decrypted_password = serializers.SerializerMethodField()
    masked_password = serializers.SerializerMethodField()
    strength = serializers.SerializerMethodField()

    class Meta:
        model = PasswordEntry
        fields = [
            'id',
            'title',
            'website_url',
            'username_or_email',
            'password',
            'decrypted_password',
            'masked_password',
            'strength',
            'category',
            'notes',
            'is_favorite',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_decrypted_password(self, obj) -> str:
        return obj.get_decrypted_password()

    def get_masked_password(self, obj) -> str:
        decrypted = obj.get_decrypted_password()
        length = len(decrypted) if decrypted else 8
        return '•' * min(length, 16)

    def get_strength(self, obj) -> dict:
        decrypted = obj.get_decrypted_password()
        return calculate_password_strength(decrypted)

    def validate(self, attrs):
        # If creating new entry, password is required
        if self.instance is None and 'password' not in attrs:
            raise serializers.ValidationError({"password": "Password field is required when creating a new entry."})
        return attrs

    def create(self, validated_data):
        raw_password = validated_data.pop('password', '')
        user = self.context['request'].user
        
        entry = PasswordEntry(
            user=user,
            encrypted_password=encrypt_password(raw_password),
            **validated_data
        )
        entry.save()
        return entry

    def update(self, instance, validated_data):
        raw_password = validated_data.pop('password', None)
        if raw_password is not None:
            instance.encrypted_password = encrypt_password(raw_password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
