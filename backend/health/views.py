
from django.utils import timezone

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status

from .models import HealthRecord


def serialize_health_record(record):
    """Convert a HealthRecord model instance into JSON-safe data."""
    return {
        "id": record.id,
        "name": record.name,
        "record_type": record.record_type,
        "description": record.description,
        "document": (
            record.document.url if record.document else None
        ),
        "extracted_text": record.extracted_text,
        "structured_data": record.structured_data,
        "extraction_status": record.extraction_status,
        "extraction_error": record.extraction_error,
        "extracted_at": record.extracted_at,
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_summary(request):
    records = HealthRecord.objects.filter(
        user=request.user
    ).order_by("-created_at")

    total_records = records.count()

    return Response({
        "total_records": total_records,
        "recent_records": [
            {
                "id": record.id,
                "name": record.name,
                "record_type": record.record_type,
                "created_at": record.created_at,
                "extraction_status": record.extraction_status,
            }
            for record in records[:5]
        ],
    })


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def health_records(request):
    if request.method == "GET":
        records = HealthRecord.objects.filter(
            user=request.user
        ).order_by("-created_at")

        return Response([
            serialize_health_record(record)
            for record in records
        ])

    # POST: Upload and save a health record.
    name = request.data.get("name", "").strip()
    record_type = request.data.get("record_type", "other")
    description = request.data.get("description", "").strip()
    document = request.FILES.get("document")

    if not name:
        return Response(
            {"name": ["Please enter a report name."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    allowed_types = {
        choice[0] for choice in HealthRecord.RECORD_TYPES
    }

    if record_type not in allowed_types:
        return Response(
            {"record_type": ["Invalid record type."]},
            status=status.HTTP_400_BAD_REQUEST,
        )

    if document:
        allowed_extensions = {
            ".pdf", ".jpg", ".jpeg", ".png", ".webp"
        }
        filename = document.name.lower()

        if not any(
            filename.endswith(ext)
            for ext in allowed_extensions
        ):
            return Response(
                {
                    "document": [
                        "Upload a PDF, JPG, JPEG, PNG, or WEBP file."
                    ]
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        if document.size > 10 * 1024 * 1024:
            return Response(
                {"document": ["Maximum file size is 10 MB."]},
                status=status.HTTP_400_BAD_REQUEST,
            )

    record = HealthRecord.objects.create(
        user=request.user,
        name=name,
        record_type=record_type,
        description=description,
        document=document,
        extraction_status="pending",
    )

    return Response(
        serialize_health_record(record),
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def saved_health_summary(request, record_id):
    record = HealthRecord.objects.filter(
        id=record_id,
        user=request.user,
    ).first()

    if not record:
        return Response(
            {"detail": "Health record not found."},
            status=status.HTTP_404_NOT_FOUND,
        )

    if record.extraction_status != "completed":
        return Response(
            {
                "detail": "This report has not been analyzed successfully yet.",
                "extraction_status": record.extraction_status,
            },
            status=status.HTTP_409_CONFLICT,
        )

    return Response({
        "id": record.id,
        "name": record.name,
        "extracted_text": record.extracted_text,
        "structured_data": record.structured_data,
        "extraction_status": record.extraction_status,
        "extracted_at": record.extracted_at,
    })
