import { useState } from 'react';
import { Button, cn } from '@pdf-ocr-converter/ui';
import { downloadBlob } from '@pdf-ocr-converter/utils';
import { convertPdf, downloadResult } from '@pdf-ocr-converter/api-client';
import { Upload, FileText, Languages, Settings, Download, CheckCircle } from 'lucide-react';

const SUPPORTED_LANGUAGES = [
  { code: 'spa', name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { code: 'eng', name: 'English', native: 'English', flag: '🇺🇸' },
  { code: 'fra', name: 'French', native: 'Français', flag: '🇫🇷' },
  { code: 'deu', name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { code: 'ita', name: 'Italian', native: 'Italiano', flag: '🇮🇹' },
  { code: 'por', name: 'Portuguese', native: 'Português', flag: '🇵🇹' },
  { code: 'rus', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'chi_sim', name: 'Chinese (Simplified)', native: '中文 (简体)', flag: '🇨🇳' },
  { code: 'jpn', name: 'Japanese', native: '日本語', flag: '🇯🇵' },
  { code: 'kor', name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { code: 'ara', name: 'Arabic', native: 'العربية', flag: '🇸🇦', rtl: true },
  { code: 'hin', name: 'Hindi', native: 'हिन्दी', flag: '🇮🇳' },
];

const STEPS = [
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'analyze', label: 'Analyze', icon: FileText },
  { id: 'ocr', label: 'OCR', icon: Languages },
  { id: 'convert', label: 'Convert', icon: Settings },
  { id: 'done', label: 'Done', icon: CheckCircle },
];

function App() {
  const [currentStep, setCurrentStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(['spa', 'eng']);
  const [outputFormat, setOutputFormat] = useState<'docx' | 'pdf' | 'md' | 'json'>('docx');
  const [quality, setQuality] = useState<'fast' | 'balanced' | 'best'>('balanced');
  const [preserveLayout, setPreserveLayout] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ url: string; fileName: string } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type === 'application/pdf') {
        setFile(droppedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        setError(null);
      } else {
        setError('Please upload a PDF file');
      }
    }
  };

  const toggleLanguage = (code: string) => {
    setSelectedLanguages(prev => 
      prev.includes(code) 
        ? prev.filter(l => l !== code) 
        : [...prev, code]
    );
  };

  const processFile = async () => {
    if (!file) return;
    
    setError(null);
    setResult(null);
    setCurrentStep(1);
    
    const steps = [20, 40, 60, 80, 100];
    for (const step of steps) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setProgress(step);
      setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
    }
    
    try {
      // Call the backend API for actual conversion
      const result = await convertPdf(file, {
        languages: selectedLanguages,
        outputFormat,
        quality,
        preserveLayout,
      });
      
      if (result.downloadUrl) {
        setResult({
          url: result.downloadUrl,
          fileName: result.fileName,
        });
      } else {
        throw new Error('No download URL returned from server');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Conversion failed');
      setCurrentStep(0);
    }
  };

  const reset = () => {
    setFile(null);
    setCurrentStep(0);
    setProgress(0);
    setError(null);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <FileText className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">PDF to DOC Converter</span>
          </div>
          <nav className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Download App</Button>
            <Button variant="ghost" size="sm">Documentation</Button>
            <Button variant="ghost" size="sm">GitHub</Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => (
              <div key={step.id} className="flex flex-col items-center relative">
                {index < STEPS.length - 1 && (
                  <div className="absolute top-5 left-1/2 w-full h-1 bg-muted -translate-x-1/2 z-0" />
                )}
                <div className={cn(
                  'relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all',
                  index < currentStep
                    ? 'bg-primary border-primary text-primary-foreground'
                    : index === currentStep
                    ? 'border-primary text-primary bg-background'
                    : 'border-muted text-muted-foreground bg-background'
                )}>
                  {index < currentStep ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <step.icon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  'mt-1 text-xs font-medium',
                  index <= currentStep ? 'text-foreground' : 'text-muted-foreground'
                )}>
                  {step.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="max-w-3xl mx-auto">
          {/* Step 1: Upload */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div className="text-center">
                <h1 className="text-3xl font-bold tracking-tight">Convert Scanned PDF to Word</h1>
                <p className="mt-2 text-muted-foreground">
                  Upload a scanned PDF document and convert it to an editable Word document (.docx) 
                  using advanced OCR with support for 10+ languages.
                </p>
              </div>

              <div
                className={cn(
                  'relative border-2 border-dashed rounded-lg p-8 text-center transition-all',
                  dragActive && 'border-primary bg-primary/5',
                  file && 'border-green-500 bg-green-50 dark:bg-green-900/20'
                )}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  id="file-upload"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  {file ? (
                    <div className="flex flex-col items-center gap-2">
                      <FileText className="h-12 w-12 text-green-500" />
                      <p className="font-medium">{file.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button variant="outline" size="sm" onClick={(e) => { e.preventDefault(); setFile(null); }}>
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-4">
                      <Upload className="h-12 w-12 text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">Drop your PDF here or click to browse</p>
                        <p className="text-sm text-muted-foreground">Maximum file size: 100 MB</p>
                      </div>
                    </div>
                  )}
                </label>
              </div>

              {error && (
                <div className="rounded-lg border border-destructive bg-destructive/10 p-4 text-destructive text-sm" role="alert">
                  {error}
                </div>
              )}

              <Button 
                className="w-full" 
                size="lg" 
                onClick={processFile}
                disabled={!file}
              >
                Start Conversion
              </Button>
            </div>
          )}

          {/* Steps 2-5: Processing */}
          {currentStep > 0 && currentStep < STEPS.length - 1 && (
            <div className="space-y-6 text-center">
              <div className="relative h-4 w-full overflow-hidden rounded-full bg-muted">
                <div 
                  className="h-full bg-primary animate-progress" 
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-lg font-medium">{STEPS[currentStep].label}...</p>
              <p className="text-muted-foreground">{progress}% complete</p>
            </div>
          )}

          {/* Step 6: Done */}
          {currentStep === STEPS.length - 1 && result && (
            <div className="space-y-6">
              <div className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <h2 className="mt-4 text-2xl font-bold">Conversion Complete!</h2>
                <p className="mt-2 text-muted-foreground">
                  Your document has been converted and is ready to download.
                </p>
              </div>

              <div className="rounded-lg border bg-card p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <FileText className="h-10 w-10 text-primary" />
                    <div>
                      <p className="font-medium">{result.fileName}</p>
                      <p className="text-sm text-muted-foreground">DOCX Document</p>
                    </div>
                  </div>
<Button onClick={async () => {
                      if (!result?.url) return;
                      try {
                        const response = await downloadResult(result.url);
                        downloadBlob(response, result.fileName);
                      } catch (err) {
                        console.error('Download failed:', err);
                        setError('Failed to download file');
                      }
                    }}>
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                </div>
              </div>

              <div className="flex gap-4">
                <Button variant="outline" onClick={reset} className="flex-1">
                  Convert Another
                </Button>
                <Button onClick={reset} className="flex-1">
                  Done
                </Button>
              </div>
            </div>
          )}

          {/* Settings Panel (when file selected) */}
          {file && currentStep === 0 && (
            <div className="mt-8 rounded-lg border bg-card p-6">
              <h3 className="text-lg font-semibold mb-4">Conversion Settings</h3>
              
              <div className="space-y-4">
                {/* Languages */}
                <div>
                  <label className="block text-sm font-medium mb-2">OCR Languages</label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORTED_LANGUAGES.map(lang => (
                      <button
                        key={lang.code}
                        type="button"
                        onClick={() => toggleLanguage(lang.code)}
                        className={cn(
                          'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-medium transition-all',
                          selectedLanguages.includes(lang.code)
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-secondary text-secondary-foreground border-transparent hover:bg-secondary/80'
                        )}
                      >
                        <span>{lang.flag}</span>
                        <span>{lang.native}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Output Format */}
                <div>
                  <label className="block text-sm font-medium mb-2">Output Format</label>
                  <div className="flex gap-2">
                    {['docx', 'pdf', 'md', 'json'].map(fmt => (
                      <button
                        key={fmt}
                        type="button"
                        onClick={() => setOutputFormat(fmt as any)}
                        className={cn(
                          'flex-1 rounded-lg border p-3 text-center transition-all',
                          outputFormat === fmt
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-accent'
                        )}
                      >
                        <p className="font-medium uppercase">{fmt.toUpperCase()}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Quality */}
                <div>
                  <label className="block text-sm font-medium mb-2">OCR Quality</label>
                  <div className="flex gap-2">
                    {['fast', 'balanced', 'best'].map(q => (
                      <button
                        key={q}
                        type="button"
                        onClick={() => setQuality(q as any)}
                        className={cn(
                          'flex-1 rounded-lg border p-3 text-center transition-all',
                          quality === q
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:bg-accent'
                        )}
                      >
                        <p className="font-medium capitalize">{q}</p>
                        <p className="text-xs text-muted-foreground">
                          {q === 'fast' && '150 DPI, partial OCR'}
                          {q === 'balanced' && '300 DPI, hybrid OCR'}
                          {q === 'best' && '400 DPI, full page OCR'}
                        </p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Preserve Layout */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Preserve Layout</p>
                    <p className="text-sm text-muted-foreground">Maintain tables, images, and formatting</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={preserveLayout}
                      onChange={(e) => setPreserveLayout(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className={cn(
                      'w-11 h-6 rounded-full border-2 transition-colors',
                      preserveLayout ? 'bg-primary border-primary' : 'bg-muted border-border'
                    )}>
                      <span className={cn(
                        'absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white transition-transform',
                        preserveLayout && 'translate-x-5'
                      )} />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 mt-12">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>PDF to DOC Converter - Open Source OCR Document Conversion</p>
          <p className="mt-1">
            <a href="https://github.com/reynaldomesab-crypto/pdf-to-doc-converter" className="hover:underline" target="_blank" rel="noopener">
              GitHub
            </a> •
            <a href="#" className="hover:underline ml-2">License (MIT)</a> •
            <a href="#" className="hover:underline ml-2">Privacy</a>
          </p>
        </div>
      </footer>

      {/* PWA Install Prompt */}
      <script
        dangerouslySetInnerHTML={{
          __html: `
            let deferredPrompt;
            window.addEventListener('beforeinstallprompt', (e) => {
              e.preventDefault();
              deferredPrompt = e;
              // Show install button
            });
          `
        }}
      />
    </div>
  );
}

export default App;