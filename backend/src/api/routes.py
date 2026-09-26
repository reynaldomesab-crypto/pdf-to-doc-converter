"""API routes for PDF OCR Converter."""

from fastapi import APIRouter, UploadFile, File, Form, HTTPException, BackgroundTasks
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import Optional
import uuid
import os
import shutil
from pathlib import Path

from ...core.config import settings
from ...ocr.processor import process_pdf_to_docx

router = APIRouter()


class LanguageResponse(BaseModel):
    """Supported language response."""
    code: str
    name: str
    native_name: str
    is_rtl: bool


class ConvertRequest(BaseModel):
    """PDF conversion request."""
    languages: list[str] = Field(default=["spa", "eng"])
    output_format: str = Field(default="docx", pattern="^(docx|pdf|md|json)$")
    quality: str = Field(default="balanced", pattern="^(fast|balanced|best)$")
    preserve_layout: bool = True


class ConvertResponse(BaseModel):
    """PDF conversion response."""
    job_id: str
    status: str
    message: str


class JobStatusResponse(BaseModel):
    """Job status response."""
    job_id: str
    status: str  # pending, processing, completed, failed
    progress: int
    result: Optional[dict] = None
    error: Optional[str] = None


# In-memory job storage (replace with Redis in production)
jobs: dict[str, dict] = {}


@router.get("/languages", response_model=list[LanguageResponse])
async def get_languages():
    """Get supported OCR languages."""
    language_names = {
        "spa": ("Spanish", "Español", False),
        "eng": ("English", "English", False),
        "fra": ("French", "Français", False),
        "deu": ("German", "Deutsch", False),
        "ita": ("Italian", "Italiano", False),
        "por": ("Portuguese", "Português", False),
        "rus": ("Russian", "Русский", False),
        "chi_sim": ("Chinese (Simplified)", "中文 (简体)", False),
        "jpn": ("Japanese", "日本語", False),
        "kor": ("Korean", "한국어", False),
        "ara": ("Arabic", "العربية", True),
        "hin": ("Hindi", "हिन्दी", False),
    }
    
    return [
        LanguageResponse(
            code=code,
            name=name,
            native_name=native,
            is_rtl=rtl
        )
        for code, (name, native, rtl) in language_names.items()
        if code in settings.SUPPORTED_LANGUAGES
    ]


@router.post("/convert", response_model=ConvertResponse)
async def convert_pdf(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    languages: str = Form("spa,eng"),
    output_format: str = Form("docx"),
    quality: str = Form("balanced"),
    preserve_layout: str = Form("true"),
):
    """
    Convert scanned PDF to DOCX using OCR.
    
    - **file**: PDF file to convert (max 100MB)
    - **languages**: Comma-separated language codes (e.g., "spa,eng,fra")
    - **output_format**: Output format (docx, pdf, md, json)
    - **quality**: OCR quality (fast, balanced, best)
    - **preserve_layout**: Preserve document layout (true/false)
    """
    # Validate file
    if file.content_type not in settings.ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid file type. Allowed: {settings.ALLOWED_MIME_TYPES}"
        )
    
    # Read file content to check size
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail=f"File too large. Maximum size: {settings.MAX_FILE_SIZE / (1024*1024)} MB"
        )
    
    # Parse languages
    lang_list = [lang.strip() for lang in languages.split(",") if lang.strip()]
    invalid_langs = [l for l in lang_list if l not in settings.SUPPORTED_LANGUAGES]
    if invalid_langs:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported languages: {invalid_langs}. Supported: {settings.SUPPORTED_LANGUAGES}"
        )
    
    # Create job
    job_id = str(uuid.uuid4())
    jobs[job_id] = {
        "status": "pending",
        "progress": 0,
        "result": None,
        "error": None,
    }
    
    # Save uploaded file
    upload_dir = Path(settings.UPLOAD_DIR)
    upload_dir.mkdir(parents=True, exist_ok=True)
    input_path = upload_dir / f"{job_id}_input.pdf"
    
    with open(input_path, "wb") as f:
        f.write(content)
    
    # Start background processing
    background_tasks.add_task(
        process_conversion_job,
        job_id,
        str(input_path),
        lang_list,
        output_format,
        quality,
        preserve_layout.lower() == "true",
    )
    
    return ConvertResponse(
        job_id=job_id,
        status="pending",
        message="Conversion started. Use /jobs/{job_id} to check status.",
    )


@router.get("/jobs/{job_id}", response_model=JobStatusResponse)
async def get_job_status(job_id: str):
    """Get conversion job status."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    return JobStatusResponse(
        job_id=job_id,
        status=job["status"],
        progress=job["progress"],
        result=job["result"],
        error=job["error"],
    )


async def process_conversion_job(
    job_id: str,
    input_path: str,
    languages: list[str],
    output_format: str,
    quality: str,
    preserve_layout: bool,
):
    """Background task to process PDF conversion."""
    try:
        jobs[job_id]["status"] = "processing"
        jobs[job_id]["progress"] = 10
        
        # Process PDF
        output_path = await process_pdf_to_docx(
            input_path=input_path,
            languages=languages,
            output_format=output_format,
            quality=quality,
            preserve_layout=preserve_layout,
            progress_callback=lambda p, msg: update_job_progress(job_id, p, msg),
        )
        
        jobs[job_id]["status"] = "completed"
        jobs[job_id]["progress"] = 100
        jobs[job_id]["result"] = {
            "download_url": f"/api/v1/download/{job_id}",
            "file_name": f"converted_{job_id}.{output_format}",
            "file_size": os.path.getsize(output_path),
        }
        
    except Exception as e:
        jobs[job_id]["status"] = "failed"
        jobs[job_id]["error"] = str(e)
    finally:
        # Cleanup input file
        try:
            os.remove(input_path)
        except OSError:
            pass


def update_job_progress(job_id: str, progress: int, message: str = ""):
    """Update job progress."""
    if job_id in jobs:
        jobs[job_id]["progress"] = min(100, max(0, progress))
        if message:
            jobs[job_id]["message"] = message


@router.get("/download/{job_id}")
async def download_result(job_id: str):
    """Download converted file."""
    if job_id not in jobs:
        raise HTTPException(status_code=404, detail="Job not found")
    
    job = jobs[job_id]
    if job["status"] != "completed" or not job["result"]:
        raise HTTPException(status_code=400, detail="Conversion not completed")
    
    # In production, serve from cloud storage with signed URL
    # For now, return info about where to download
    return JSONResponse(
        content={
            "message": "In production, this would return a signed URL to download from cloud storage",
            "job_id": job_id,
            "result": job["result"],
        }
    )