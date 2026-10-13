
from pathlib import Path

from rest_framework import serializers

from .models import HealthRecord


ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png", ".webp"}
MAX_FILE_SIZE = 10 * 1024 * 1024


class HealthRecordSerializer(serializers.ModelSerializer):
    type = serializers.CharField(
        source="get_record_type_display",
        read_only=True,
    )
    date = serializers.SerializerMethodField()
    format = serializers.SerializerMethodField()

    class Meta:
        model = HealthRecord
        fields = [
            "id",
            "name",
            "record_type",
            "description",
            "document",
            "created_at",
            "updated_at",
            "type",
            "date",
            "format",
            "extracted_text",
            "structured_data",
            "extraction_status",
            "extraction_error",
            "extracted_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "type",
            "date",
            "format",
            "extracted_text",
            "structured_data",
            "extraction_status",
            "extraction_error",
            "extracted_at",
        ]

    def get_date(self, obj):
        return obj.created_at.date().isoformat()

    def get_format(self, obj):
        if not obj.document:
            return "Document"

        return (
            Path(obj.document.name).suffix.lstrip(".").upper()
            or "Document"
        )

    def validate_document(self, document):
        if not document:
            return document

        extension = Path(document.name).suffix.lower()

        if extension not in ALLOWED_EXTENSIONS:
            raise serializers.ValidationError(
                "PDF, JPG, JPEG, PNG, WEBP files mattum upload pannunga."
            )

        if document.size > MAX_FILE_SIZE:
            raise serializers.ValidationError(
                "Maximum file size is 10 MB."
            )

        return document
