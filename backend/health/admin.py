
from django.contrib import admin
from .models import HealthRecord


@admin.register(HealthRecord)
class HealthRecordAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "name",
        "record_type",
        "user",
        "created_at",
    )
    list_filter = ("record_type", "created_at")
    search_fields = ("name", "description", "user__username")
