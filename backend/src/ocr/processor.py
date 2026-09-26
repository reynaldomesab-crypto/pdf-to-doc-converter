"""PDF OCR processing pipeline using PyMuPDF and Tesseract."""

import fitz  # PyMuPDF
from pdf2docx import Converter
from pathlib import Path
from typing import Callable, Optional
import logging

logger = logging.getLogger(__name__)


async def process_pdf_to_docx(
    input_path: str,
    languages: list[str],
    output_format: str,
    quality: str,
    preserve_layout: bool,
    progress_callback: Optional[Callable[[int, str], None]] = None,
) -> str:
    """
    Process PDF with OCR and convert to DOCX.
    
    Args:
        input_path: Path to input PDF file
        languages: List of language codes for OCR
        output_format: Output format (docx, pdf, md, json)
        quality: OCR quality (fast, balanced, best)
        preserve_layout: Whether to preserve document layout
        progress_callback: Callback for progress updates (0-100, message)
    
    Returns:
        Path to output file
    """
    input_file = Path(input_path)
    output_file = input_file.parent / f"{input_file.stem}_ocr.{output_format}"
    
    # Language string for Tesseract
    lang_string = "+".join(languages)
    
    def update_progress(progress: int, message: str = ""):
        if progress_callback:
            progress_callback(progress, message)
    
    try:
        # Step 1: Open PDF with PyMuPDF
        update_progress(10, "Opening PDF document...")
        doc = fitz.open(input_path)
        page_count = len(doc)
        logger.info(f"Processing PDF with {page_count} pages, languages: {lang_string}")
        
        # Step 2: Apply OCR to each page
        update_progress(20, "Analyzing pages for OCR...")
        
        # Configure OCR based on quality
        ocr_config = _get_ocr_config(quality)
        
        for page_num in range(page_count):
            page = doc[page_num]
            progress = 20 + int((page_num / page_count) * 60)
            update_progress(progress, f"Processing page {page_num + 1}/{page_count}...")
            
            # Check if page needs OCR (has images but no extractable text)
            if _page_needs_ocr(page):
                # Get text page with OCR
                textpage = page.get_textpage_ocr(
                    language=lang_string,
                    dpi=ocr_config["dpi"],
                    full=ocr_config["full_page"],
                )
                # Apply OCR results to page
                page.apply_ocr(language=lang_string, dpi=ocr_config["dpi"])
        
        # Step 3: Save OCR'd PDF
        update_progress(80, "Saving OCR-processed PDF...")
        ocr_pdf_path = input_file.parent / f"{input_file.stem}_ocr.pdf"
        doc.save(str(ocr_pdf_path))
        doc.close()
        
        # Step 4: Convert to DOCX using pdf2docx
        update_progress(85, "Converting to DOCX...")
        
        if output_format == "docx":
            cv = Converter(str(ocr_pdf_path))
            cv.convert(str(output_file), start=0, end=None)
            cv.close()
        elif output_format == "pdf":
            # Already saved as searchable PDF
            import shutil
            shutil.copy2(ocr_pdf_path, output_file)
        elif output_format in ("md", "json"):
            # Use PyMuPDF4LLM for markdown/json
            import pymupdf4llm
            if output_format == "md":
                md_text = pymupdf4llm.to_markdown(str(ocr_pdf_path))
                output_file.write_text(md_text)
            else:
                json_data = pymupdf4llm.to_json(str(ocr_pdf_path))
                output_file.write_text(json_data)
        
        update_progress(100, "Conversion completed!")
        logger.info(f"Conversion completed: {output_file}")
        
        return str(output_file)
        
    except Exception as e:
        logger.error(f"Conversion failed: {e}")
        raise


def _get_ocr_config(quality: str) -> dict:
    """Get OCR configuration based on quality setting."""
    configs = {
        "fast": {
            "dpi": 150,
            "full_page": False,
        },
        "balanced": {
            "dpi": 300,
            "full_page": False,
        },
        "best": {
            "dpi": 400,
            "full_page": True,
        },
    }
    return configs.get(quality, configs["balanced"])


def _page_needs_ocr(page: fitz.Page) -> bool:
    """
    Check if page needs OCR.
    Returns True if page has images but little/no extractable text.
    """
    # Get text length
    text = page.get_text()
    text_length = len(text.strip())
    
    # Get images
    images = page.get_images(full=True)
    has_images = len(images) > 0
    
    # If page has substantial text, skip OCR
    if text_length > 100:
        return False
    
    # If page has images but little text, needs OCR
    if has_images and text_length < 50:
        return True
    
    return False


def get_supported_languages() -> list[str]:
    """Get list of supported language codes."""
    return [
        "spa", "eng", "fra", "deu", "ita", "por",
        "rus", "chi_sim", "jpn", "kor", "ara", "hin"
    ]


def validate_languages(languages: list[str]) -> list[str]:
    """Validate and filter language codes."""
    supported = get_supported_languages()
    return [lang for lang in languages if lang in supported]