use std::process::Command;
use tauri::command;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct OCRConfig {
    pub languages: Vec<String>,
    pub output_format: String,
    pub quality: String,
    pub preserve_layout: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct OCRResult {
    pub success: bool,
    pub output_path: Option<String>,
    pub error: Option<String>,
    pub page_count: usize,
    pub processing_time_ms: u64,
}

#[command]
async fn ocr_pdf(input_path: String, config: OCRConfig) -> Result<OCRResult, String> {
    let start = std::time::Instant::now();
    
    // Validate input file
    if !std::path::Path::new(&input_path).exists() {
        return Ok(OCRResult {
            success: false,
            output_path: None,
            error: Some("Input file not found".to_string()),
            page_count: 0,
            processing_time_ms: 0,
        });
    }
    
    // Build Python command
    let python_exe = if cfg!(target_os = "windows") {
        "python.exe"
    } else {
        "python3"
    };
    
    // In production, use bundled Python sidecar
    // For development, use system Python
    let script = format!(
        r#"
import sys
sys.path.insert(0, '{}')
from ocr.processor import process_pdf_to_docx
import asyncio

async def main():
    result = await process_pdf_to_docx(
        input_path=r'{}',
        languages={},
        output_format='{}',
        quality='{}',
        preserve_layout={},
        progress_callback=lambda p, m: print(f"PROGRESS:{p}:{m}")
    )
    print(f"RESULT:{result}")

asyncio.run(main())
"#,
        std::env::var("CARGO_MANIFEST_DIR").unwrap_or_default() + "/../../../backend/src",
        input_path,
        serde_json::to_string(&config.languages).unwrap(),
        config.output_format,
        config.quality,
        config.preserve_layout
    );
    
    let output = Command::new(python_exe)
        .arg("-c")
        .arg(&script)
        .output()
        .map_err(|e| format!("Failed to execute Python: {}", e))?;
    
    let stdout = String::from_utf8_lossy(&output.stdout);
    let stderr = String::from_utf8_lossy(&output.stderr);
    
    if !output.status.success() {
        return Ok(OCRResult {
            success: false,
            output_path: None,
            error: Some(format!("Python error: {}", stderr)),
            page_count: 0,
            processing_time_ms: start.elapsed().as_millis() as u64,
        });
    }
    
    // Parse result from stdout
    let result_line = stdout.lines()
        .find(|l| l.starts_with("RESULT:"))
        .map(|l| l.strip_prefix("RESULT:").unwrap())
        .unwrap_or("");
    
    let output_path = if result_line.starts_with("/") || result_line.contains(":") {
        Some(result_line.to_string())
    } else {
        None
    };
    
    Ok(OCRResult {
        success: output_path.is_some(),
        output_path,
        error: if output_path.is_none() { Some("Conversion failed".to_string()) } else { None },
        page_count: 0, // Would parse from output
        processing_time_ms: start.elapsed().as_millis() as u64,
    })
}

#[command]
async fn get_supported_languages() -> Vec<String> {
    vec![
        "spa".to_string(),
        "eng".to_string(),
        "fra".to_string(),
        "deu".to_string(),
        "ita".to_string(),
        "por".to_string(),
        "rus".to_string(),
        "chi_sim".to_string(),
        "jpn".to_string(),
        "kor".to_string(),
        "ara".to_string(),
        "hin".to_string(),
    ]
}

#[command]
async fn pick_file() -> Result<Option<String>, String> {
    // This would use tauri-plugin-dialog in the frontend
    // Backend command for future use
    Ok(None)
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_os::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .invoke_handler(tauri::generate_handler![
            ocr_pdf,
            get_supported_languages,
            pick_file,
        ])
        .setup(|app| {
            #[cfg(debug_assertions)]
            {
                let window = app.get_webview_window("main").unwrap();
                window.open_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}