
from django.db import models
from django.contrib.auth.models import User


class HealthRecord(models.Model):
    RECORD_TYPES = [
        ("lab_report", "Lab Report"),
        ("prescription", "Prescription"),
        ("medical_record", "Medical Record"),
        ("health_update", "Health Update"),
        ("other", "Other"),
    ]

    EXTRACTION_STATUS = [
        ("pending", "Pending"),
        ("completed", "Completed"),
        ("failed", "Failed"),
    ]

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="health_records",
    )

    name = models.CharField(max_length=255)

    record_type = models.CharField(
        max_length=30,
        choices=RECORD_TYPES,
        default="other",
    )

    description = models.TextField(blank=True)

    document = models.FileField(
        upload_to="health_records/",
        blank=True,
        null=True,
    )

    # OCR-extracted text from the uploaded document
    extracted_text = models.TextField(blank=True, default="")

    # Structured extraction output:
    # dates, lab_results, medicines and diagnoses
    structured_data = models.JSONField(
        default=dict,
        blank=True,
    )

    extraction_status = models.CharField(
        max_length=20,
        choices=EXTRACTION_STATUS,
        default="pending",
    )

    extraction_error = models.TextField(blank=True, default="")

    extracted_at = models.DateTimeField(
        null=True,
        blank=True,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.user.username})"
