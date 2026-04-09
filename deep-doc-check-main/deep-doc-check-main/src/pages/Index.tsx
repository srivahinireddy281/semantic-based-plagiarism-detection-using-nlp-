import { useState, useCallback } from 'react';
import { Shield } from 'lucide-react';
import { FileUpload } from '@/components/FileUpload';
import { AnalysisLoader } from '@/components/AnalysisLoader';
import { PlagiarismReport } from '@/components/PlagiarismReport';
import { extractTextFromPDF, splitIntoSentences } from '@/lib/pdf-extract';
import { analyzePlagiarism, type AnalysisReport } from '@/lib/plagiarism-analysis';

type AppState = 'upload' | 'processing' | 'report';

const Index = () => {
  const [state, setState] = useState<AppState>('upload');
  const [loadingStep, setLoadingStep] = useState('');
  const [report, setReport] = useState<AnalysisReport | null>(null);

  const handleFileSelect = useCallback(async (file: File) => {
    setState('processing');

    try {
      setLoadingStep('Extracting text from PDF...');
      await new Promise(r => setTimeout(r, 800));
      const text = await extractTextFromPDF(file);

      setLoadingStep('Splitting into sentences...');
      await new Promise(r => setTimeout(r, 500));
      const sentences = splitIntoSentences(text);

      setLoadingStep('Computing sentence embeddings...');
      await new Promise(r => setTimeout(r, 1000));

      setLoadingStep('Running cosine similarity against reference corpus...');
      await new Promise(r => setTimeout(r, 1200));

      setLoadingStep('Generating originality report...');
      await new Promise(r => setTimeout(r, 600));
      const result = analyzePlagiarism(sentences, file.name);

      setReport(result);
      setState('report');
    } catch (error) {
      console.error('Analysis failed:', error);
      setState('upload');
    }
  }, []);

  const handleReset = useCallback(() => {
    setReport(null);
    setState('upload');
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <header className="border-b border-border bg-card">
        <div className="container max-w-6xl mx-auto px-6 py-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-serif font-bold text-foreground leading-tight">
              PlagiarismGuard
            </h1>
            <p className="text-xs text-muted-foreground">Semantic Plagiarism Detection</p>
          </div>
        </div>
      </header>

      <main className="container max-w-6xl mx-auto px-6 py-10">
        {state === 'upload' && (
          <div className="max-w-2xl mx-auto text-center animate-fade-in-up">
            <h2 className="text-3xl font-serif font-bold text-foreground mb-3">
              Analyze Your Document
            </h2>
            <p className="text-muted-foreground mb-10 max-w-lg mx-auto">
              Upload a PDF to detect semantic plagiarism using NLP-powered sentence embeddings 
              and cosine similarity analysis against Internet sources, publications, and student papers.
            </p>
            <FileUpload onFileSelect={handleFileSelect} isProcessing={false} />
          </div>
        )}

        {state === 'processing' && (
          <AnalysisLoader step={loadingStep} />
        )}

        {state === 'report' && report && (
          <PlagiarismReport report={report} onReset={handleReset} />
        )}
      </main>
    </div>
  );
};

export default Index;
