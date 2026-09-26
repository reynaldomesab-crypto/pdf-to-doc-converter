# PyInstaller spec file for bundling Python OCR backend

block_cipher = None

a = Analysis(
    ['../../../backend/src/main.py'],
    pathex=[],
    binaries=[],
    datas=[
        ('../../../backend/src/ocr', 'ocr'),
        ('/usr/share/tesseract-ocr/5/tessdata', 'tessdata'),
    ],
    hiddenimports=[
        'fitz',
        'pdf2docx',
        'pymupdf4llm',
        'uvicorn',
        'fastapi',
        'pydantic',
        'pydantic_settings',
        'python_multipart',
        'PIL',
        'magic',
        'httpx',
        'dotenv',
        'loguru',
    ],
    hookspath=[],
    hooksconfig={},
    runtime_hooks=[],
    excludes=[],
    win_no_prefer_redirects=False,
    win_private_assemblies=False,
    cipher=block_cipher,
    noarchive=False,
)

pyz = PYZ(a.pure, a.zipped_data, cipher=block_cipher)

exe = EXE(
    pyz,
    a.scripts,
    a.binaries,
    a.zipfiles,
    a.datas,
    [],
    name='pdf-ocr-backend',
    debug=False,
    bootloader_ignore_signals=False,
    strip=False,
    upx=True,
    upx_exclude=[],
    runtime_tmpdir=None,
    console=False,
    disable_windowed_traceback=False,
    argv_emulation=False,
    target_arch=None,
    codesign_identity=None,
    entitlements_file=None,
)