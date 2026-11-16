from pathlib import Path
from uuid import uuid4

from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

BASE_DIR = Path(__file__).resolve().parent
UPLOAD_DIR = BASE_DIR / "data" / "uploads"
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

ALLOWED_VIDEO_TYPES = {
    "video/mp4",
    "video/webm",
    "video/quicktime",
    "video/x-matroska",
}
MAX_UPLOAD_BYTES = 500 * 1024 * 1024

app = FastAPI(title="ClipForge API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/upload")
async def upload_video(video: UploadFile = File(...)) -> dict[str, str | int]:
    if video.content_type not in ALLOWED_VIDEO_TYPES:
        raise HTTPException(status_code=415, detail="Unsupported video type")

    extension = Path(video.filename or "video.mp4").suffix.lower() or ".mp4"
    target = UPLOAD_DIR / f"{uuid4().hex}{extension}"
    total = 0

    try:
        with target.open("wb") as output:
            while chunk := await video.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(status_code=413, detail="Video exceeds 500 MB limit")
                output.write(chunk)
    except HTTPException:
        target.unlink(missing_ok=True)
        raise
    except OSError as exc:
        target.unlink(missing_ok=True)
        raise HTTPException(status_code=500, detail="Could not save upload") from exc
    finally:
        await video.close()

    return {"job_id": target.stem, "filename": video.filename or target.name, "bytes": total}
