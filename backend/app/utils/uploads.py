import os
import secrets
import time
from pathlib import PurePosixPath

from fastapi import UploadFile

from app.core.config import settings
from app.core.errors import ApiError

# SVG is intentionally excluded: an `.svg` served with `image/svg+xml` can carry
# embedded scripts (stored XSS) and magic-byte checks cannot reliably distinguish
# a safe SVG from a malicious one.
ALLOWED_MIME = {
    # Images
    "image/jpeg", "image/png", "image/webp", "image/gif", "image/avif",
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
    ".jpg", ".jpeg", ".png", ".webp", ".gif", ".avif", ".tiff", ".tif", ".bmp",
    ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".ppt", ".pptx", ".txt", ".csv",
    ".mp4", ".webm", ".ogg",
    ".zip", ".rar", ".7z", ".gz", ".tar",
}

# Subfolders that callers may store uploads in (allowlist — never trust user input).
ALLOWED_SUBFOLDERS = {
    "careers",
    "misc",
    "media",
    "projects",
    "events",
    "blog",
    "downloads",
}

# Maps a declared MIME type to a predicate over the file's leading bytes.
_MAGIC_PREDICATES = {
    "image/jpeg": lambda b: b[:3] == b"\xff\xd8\xff",
    "image/png": lambda b: b[:8] == b"\x89PNG\r\n\x1a\n",
    "image/gif": lambda b: b[:6] in (b"GIF87a", b"GIF89a"),
    "image/bmp": lambda b: b[:2] == b"BM",
    "image/tiff": lambda b: b[:4] in (b"II*\x00", b"MM\x00*"),
    "image/webp": lambda b: len(b) >= 12 and b[:4] == b"RIFF" and b[8:12] == b"WEBP",
    "image/avif": lambda b: len(b) >= 12 and b[4:12] == b"ftypavif",
    "application/pdf": lambda b: b[:4] == b"%PDF",
    "application/msword": lambda b: b[:8] == b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document": lambda b: b[:4] == b"PK\x03\x04",
    "application/vnd.ms-excel": lambda b: b[:8] == b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": lambda b: b[:4] == b"PK\x03\x04",
    "application/vnd.ms-powerpoint": lambda b: b[:8] == b"\xd0\xcf\x11\xe0\xa1\xb1\x1a\xe1",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation": lambda b: b[:4] == b"PK\x03\x04",
    "video/mp4": lambda b: len(b) >= 12 and b[4:8] == b"ftyp",
    "video/webm": lambda b: b[:4] == b"\x1aE\xdf\xa3",
    "video/ogg": lambda b: b[:4] == b"OggS",
    "application/zip": lambda b: b[:4] == b"PK\x03\x04",
    "application/x-zip-compressed": lambda b: b[:4] == b"PK\x03\x04",
    "application/x-rar-compressed": lambda b: b[:7] == b"Rar!\x1a\x07",
    "application/x-7z-compressed": lambda b: b[:6] == b"7z\xbc\xaf\x27\x1c",
    "application/gzip": lambda b: b[:2] == b"\x1f\x8b",
}

# Extensions accepted as `text/*` — content cannot be reliably magic-verified.
_TEXT_MIME = {"text/plain", "text/csv"}

UPLOAD_ROOT = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), settings.upload_dir)


def _verify_magic(mime_type: str, contents: bytes) -> bool:
    if mime_type in _TEXT_MIME:
        # Reject NUL bytes and non-UTF-8 payloads masquerading as text.
        if b"\x00" in contents:
            return False
        try:
            contents.decode("utf-8")
        except UnicodeDecodeError:
            return False
        return True
    predicate = _MAGIC_PREDICATES.get(mime_type)
    if predicate is None:
        return False
    return predicate(contents)


async def save_upload(file: UploadFile, subfolder: str) -> str:
    if file.content_type not in ALLOWED_MIME:
        raise ApiError.bad_request(f"Unsupported file type: {file.content_type}")

    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise ApiError.bad_request(f"Unsupported file extension: {ext}")

    safe_subfolder = PurePosixPath(subfolder or "").parts
    subfolder_name = "/".join(safe_subfolder) if safe_subfolder else "misc"
    if subfolder_name not in ALLOWED_SUBFOLDERS:
        raise ApiError.bad_request(f"Unsupported upload folder: {subfolder_name}")

    contents = await file.read()
    if len(contents) > settings.max_file_size_mb * 1024 * 1024:
        raise ApiError.bad_request(f"File exceeds the {settings.max_file_size_mb}MB limit")

    if not _verify_magic(file.content_type, contents):
        raise ApiError.bad_request("File content does not match its declared file type")

    dest_dir = os.path.join(UPLOAD_ROOT, subfolder_name)
    os.makedirs(dest_dir, exist_ok=True)

    filename = f"{int(time.time())}-{secrets.token_hex(8)}{ext}"
    dest_path = os.path.join(dest_dir, filename)

    with open(dest_path, "wb") as f:
        f.write(contents)

    return f"/uploads/{subfolder_name}/{filename}"
