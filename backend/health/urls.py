
from django.urls import path
from rest_framework.authtoken.views import obtain_auth_token

from . import views
from .summary_views import summarize_health_record

urlpatterns = [
    path("login/", obtain_auth_token, name="api-login"),
    path("dashboard/", views.dashboard_summary, name="dashboard-summary"),
    path("records/", views.health_records, name="health-records"),
    path(
        "records/<int:record_id>/summarize/",
        summarize_health_record,
        name="summarize-health-record",
    ),
    path(
        "records/<int:record_id>/saved-summary/",
        views.saved_health_summary,
        name="saved-health-summary",
    ),
]
