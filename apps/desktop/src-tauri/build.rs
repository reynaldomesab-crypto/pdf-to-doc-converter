// Build script for Tauri - handles Python sidecar bundling

fn main() {
    // Tell cargo to rerun if Python files change
    println!("cargo:rerun-if-changed=../../../backend/src/");
    
    // In production, this would:
    // 1. Build Python with PyInstaller
    // 2. Copy tessdata files
    // 3. Bundle as sidecar
    
    // For now, just ensure the backend directory exists
    let backend_path = std::path::Path::new("../../../backend/src");
    if backend_path.exists() {
        println!("cargo:warning=Backend source found at {:?}", backend_path);
    } else {
        println!("cargo:warning=Backend source NOT found at {:?}", backend_path);
    }
}