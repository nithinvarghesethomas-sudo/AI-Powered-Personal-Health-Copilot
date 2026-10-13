
from pathlib import Path

import pytesseract
from PIL import Image, ImageOps
from pypdf import PdfReader


TESSERACT_PATH = (
    r"C:\Program Files\Tesseract-OCR\tesseract.exe"
)

# Change this path if Tesseract was installed elsewhere.
if Path(TESSERACT_PATH).exists():
    pytesseract.pytesseract.tesseract_cmd = TESSERACT_PATH


def extract_report_text(file_path):
    path = Path(file_path)
    extension = path.suffix.lower()

    if extension == ".pdf":
        reader = PdfReader(str(path))

        if reader.is_encrypted:
            raise ValueError("Password-protected PDFs are not supported.")

        pages_text = [
            page.extract_text() or ""
            for page in reader.pages
        ]
        text = "\n".join(pages_text).strip()

        # Use OCR when the PDF has no extractable text.
        if text:
            return text[:15000]

        raise ValueError(
            "This appears to be a scanned PDF. "
            "PDF-to-image conversion is not configured yet."
        )

    if extension in {".jpg", ".jpeg", ".png", ".webp"}:
        with Image.open(path) as image:
            image = ImageOps.exif_transpose(image).convert("RGB")
            text = pytesseract.image_to_string(
                image,
                lang="eng",
                timeout=30,
            ).strip()

        if not text:
            raise ValueError("No readable text found in this image.")

        return text[:15000]

    raise ValueError("Unsupported file format.")
