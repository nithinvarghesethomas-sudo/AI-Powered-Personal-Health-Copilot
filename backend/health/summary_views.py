
import re

from django.utils import timezone
from rest_framework.authentication import TokenAuthentication
from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import HealthRecord
from .ocr_service import extract_report_text


DATE_PATTERN = re.compile(
    r"\b(?:\d{1,2}[/-]\d{1,2}[/-]\d{2,4}"
    r"|\d{4}-\d{1,2}-\d{1,2}"
    r"|\d{1,2}\s+"
    r"(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|"
    r"May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:tember)?|"
    r"Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)"
    r"\s+\d{4})\b",
    re.IGNORECASE,
)

DOSAGE_PATTERN = re.compile(
    r"\b\d+(?:\.\d+)?\s*"
    r"(?:mg|mcg|μg|g|ml|mL|iu|units?|%|mg/ml|mcg/ml)\b",
    re.IGNORECASE,
)

FREQUENCY_PATTERN = re.compile(
    r"\b(?:once|twice|thrice|daily|nightly|weekly|"
    r"bd|tds|qid|od|bid|tid|qhs|prn|"
    r"\d+\s+times?\s+(?:a|per)\s+day)\b",
    re.IGNORECASE,
)

MEDICINE_HINTS = (
    "tablet", "capsule", "syrup", "medicine", "medication",
    "prescription", "take ", "dose", "dosage", "injection",
    "mg", "mcg", "ml",
)

DIAGNOSIS_LABELS = (
    "diagnosis", "clinical impression", "final impression",
    "impression:", "conclusion:", "findings:",
)

LAB_HINTS = (
    "hemoglobin", "haemoglobin", "glucose", "cholesterol",
    "creatinine", "platelet", "wbc", "rbc", "vitamin",
    "urea", "bilirubin", "sodium", "potassium", "calcium",
    "tsh", "hba1c", "triglyceride", "blood pressure",
    "neutrophil", "lymphocyte", "hematocrit", "haematocrit",
)


def clean_line(line):
    return re.sub(r"\s+", " ", line).strip(" \t:-")


def extract_dates(text):
    return list(dict.fromkeys(
        match.group(0)
        for match in DATE_PATTERN.finditer(text)
    ))


def extract_medicines(lines):
    medicines = []

    for line in lines:
        lower = line.lower()

        if not any(hint in lower for hint in MEDICINE_HINTS):
            continue

        dosage_matches = DOSAGE_PATTERN.findall(line)
        frequency_matches = FREQUENCY_PATTERN.findall(line)

        medicines.append({
            "source_text": line,
            "dosage": dosage_matches[0] if dosage_matches else None,
            "frequency": (
                frequency_matches[0] if frequency_matches else None
            ),
            "verification_needed": True,
        })

    return medicines[:30]


def extract_diagnoses(lines):
    diagnoses = []

    for line in lines:
        lower = line.lower()

        for label in DIAGNOSIS_LABELS:
            position = lower.find(label)

            if position >= 0:
                value = clean_line(line[position + len(label):])

                if value:
                    diagnoses.append({
                        "source_text": line,
                        "text": value,
                        "verification_needed": True,
                    })
                break

    return diagnoses[:20]


def extract_lab_results(lines):
    results = []

    result_pattern = re.compile(
        r"^(?P<name>[A-Za-z][A-Za-z0-9 ()/%_.-]{1,60}?)"
        r"\s*[:=]?\s+"
        r"(?P<value>[<>]?\s*-?\d+(?:\.\d+)?)"
        r"\s*(?P<unit>"
        r"mg/dL|mmol/L|g/dL|g/L|mg/L|"
        r"mIU/L|μIU/mL|uIU/mL|IU/L|"
        r"10\^?\d*/?[uμ]?L|"
        r"cells/uL|cells/μL|"
        r"mm/hr|mmol/mol|%|fL|pg|ng/mL|"
        r"μg/dL|mcg/dL|U/L|mEq/L|"
        r"mmHg|bpm|mL/min(?:/1\.73m2)?"
        r")?"
        r"(?:\s*[\[(]\s*"
        r"(?P<range_low>-?\d+(?:\.\d+)?)"
        r"\s*[-–]\s*"
        r"(?P<range_high>-?\d+(?:\.\d+)?)"
        r"\s*[\])])?"
        r"(?:\s+(?P<flag>H|L|HIGH|LOW|ABNORMAL))?"
        r"\s*$",
        re.IGNORECASE,
    )

    for line in lines:
        match = result_pattern.match(line)

        if not match:
            continue

        name = clean_line(match.group("name"))

        if not any(hint in name.lower() for hint in LAB_HINTS):
            continue

        raw_value = match.group("value").replace(" ", "")
        numeric_value = None

        try:
            numeric_value = float(raw_value.lstrip("<>"))
        except ValueError:
            pass

        low = match.group("range_low")
        high = match.group("range_high")
        flag = match.group("flag")

        status = "not_assessed"

        if flag:
            flag = flag.upper()

            if flag in ("H", "HIGH"):
                status = "high"
            elif flag in ("L", "LOW"):
                status = "low"
            elif flag == "ABNORMAL":
                status = "flagged_abnormal"

        elif low is not None and high is not None:
            low_value = float(low)
            high_value = float(high)

            if numeric_value is not None:
                if numeric_value < low_value:
                    status = "below_reported_range"
                elif numeric_value > high_value:
                    status = "above_reported_range"
                else:
                    status = "within_reported_range"

        results.append({
            "test_name": name,
            "value": raw_value,
            "unit": match.group("unit"),
            "reference_range": (
                {"low": low, "high": high}
                if low is not None and high is not None
                else None
            ),
            "status": status,
            "source_text": line,
            "verification_needed": True,
        })

    return results[:100]


def build_report_summary(text):
    lines = list(dict.fromkeys(
        clean_line(line)
        for line in text.splitlines()
        if clean_line(line)
    ))

    key_lines = []

    for line in lines:
        lower_line = line.lower()

        if (
            re.search(r"\d", line)
            or any(hint in lower_line for hint in LAB_HINTS)
            or any(label in lower_line for label in DIAGNOSIS_LABELS)
        ):
            key_lines.append(line)

    return {
        "overview": (
            "Text extraction completed. Review the extracted fields "
            "and original report carefully. OCR and rule-based "
            "extraction can contain errors."
        ),
        "key_lines": key_lines[:20],
        "structured_data": {
            "dates": extract_dates(text),
            "lab_results": extract_lab_results(lines),
            "medicines": extract_medicines(lines),
            "diagnoses": extract_diagnoses(lines),
        },
        "doctor_questions": [
            "Which findings need follow-up?",
            "Are any results outside the reference ranges printed in this report?",
            "Should any result be repeated or reviewed?",
        ],
        "limitations": (
            "This is rule-based extraction, not an AI diagnosis. "
            "Some medicines, dosages, diagnoses or test values may "
            "not be detected correctly. A clinician should interpret "
            "the report. Range comparisons use only ranges detected "
            "in the report and are not a clinical assessment."
        ),
    }


def save_extraction_failure(record, message):
    record.extraction_status = "failed"
    record.extraction_error = message
    record.save(update_fields=[
        "extraction_status",
        "extraction_error",
        "updated_at",
    ])


@api_view(["POST"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def summarize_health_record(request, record_id):
    try:
        record = HealthRecord.objects.get(
            id=record_id,
            user=request.user,
        )
    except HealthRecord.DoesNotExist:
        return Response(
            {"error": "Health record not found."},
            status=404,
        )

    if not record.document:
        return Response(
            {"error": "This record has no uploaded document."},
            status=400,
        )

    try:
        extracted_text = extract_report_text(record.document.path)

        if not extracted_text or not extracted_text.strip():
            message = "No readable text was found in this document."
            save_extraction_failure(record, message)

            return Response(
                {"error": message},
                status=422,
            )

        truncated = len(extracted_text) > 15000
        extracted_text = extracted_text[:15000]

        # Extract structured information.
        summary = build_report_summary(extracted_text)

        # Persist the extraction result in the database.
        record.extracted_text = extracted_text
        record.structured_data = summary["structured_data"]
        record.extraction_status = "completed"
        record.extraction_error = ""
        record.extracted_at = timezone.now()

        record.save(update_fields=[
            "extracted_text",
            "structured_data",
            "extraction_status",
            "extraction_error",
            "extracted_at",
            "updated_at",
        ])

        return Response({
            "record_id": record.id,
            "record_name": record.name,
            "extracted_text": record.extracted_text,
            "truncated": truncated,
            "summary": summary,
            "extraction_status": record.extraction_status,
            "extracted_at": record.extracted_at,
            "message": "Report extracted and saved successfully.",
        })

    except ValueError as error:
        save_extraction_failure(record, str(error))
        return Response(
            {"error": str(error)},
            status=400,
        )

    except Exception:
        save_extraction_failure(
            record,
            "Document extraction failed. Check the file and OCR configuration.",
        )

        return Response(
            {
                "error": (
                    "Unable to read this document. "
                    "Please check the file and OCR configuration."
                )
            },
            status=400,
        )

from rest_framework.decorators import (
    api_view,
    authentication_classes,
    permission_classes,
)
from rest_framework.authentication import TokenAuthentication
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import HealthRecord


@api_view(["GET"])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def saved_health_summary(request, record_id):
    try:
        record = HealthRecord.objects.get(
            id=record_id,
            user=request.user,
        )
    except HealthRecord.DoesNotExist:
        return Response(
            {"error": "Health record not found."},
            status=404,
        )

    if record.extraction_status != "completed":
        return Response(
            {
                "error": "This report has not been analyzed yet.",
                "extraction_status": record.extraction_status,
            },
            status=404,
        )

    return Response({
        "record_id": record.id,
        "record_name": record.name,
        "extracted_text": record.extracted_text,
        "structured_data": record.structured_data,
        "extraction_status": record.extraction_status,
        "extracted_at": record.extracted_at,
        "message": "Saved report summary retrieved successfully.",
    })
