import os
import secrets
import time

from fastapi import UploadFile

from app.core.config import settings
from app.core.errors import ApiError

ALLOWED_MIME = {
    # Images
    "image/jpeg", "image/png", "image/webp", "image/svg+xml", "image/gif", "image/avif",
    "image/tiff", "image/bmp",
    # Documents
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "text/plain", "text/csv",
    # Videos
    "video/mp4", "video/webm", "video/ogg",
    # Archives
    "application/zip", "application/x-zip-compressed",
    "application/x-rar-compressed",
    "application/x-7z-compressed",
    "application/gzip",
}

ALLOWED_EXTENSIONS = {
    ".jpg", ".jpeg", ".png", ".webp", ".svg", ".gif", ".avif", ".tiff", ".tif", ".bmp",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv",
    ".mp4", ".webm", ".ogg",
    ".zip", ".rar", ".7z", ".gz", ".tar",
}

UPLOAD_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), settings.upload_dir)


async def save_upload(file: UploadFile, subfolder: str) -> str:
    if file.content_type not in ALLOWED_MIME:
        raise ApiError.bad_request(f"Unsupported file type: {file.content_type}")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ApiError.bad_request(f"Unsupported file extension: {ext}")

    contents = await file.read()
    if len(contents) > settings.max_file_size_mb * 1024 * 1024:
        raise ApiError.bad_request(f"File exceeds the {settings.max_file_size_mb}MB limit")

    dest_dir = os.path.join(UPLOAD_ROOT, subfolder)
    os.makedirs(dest_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1]
    filename = f"{int(time.time())}-{secrets.token_hex(8)}{ext}"
    dest_path = os.path.join(dest_dir, filename)

    with open(dest_path, "wb") as f:
        f.write(contents)

    return f"/uploads/{subfolder}/{filename}"
