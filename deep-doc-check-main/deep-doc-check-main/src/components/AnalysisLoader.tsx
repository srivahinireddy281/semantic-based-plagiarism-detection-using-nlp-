import { FileSearch } from 'lucide-react';

interface AnalysisLoaderProps {
  step: string;
}

export function AnalysisLoader({ step }: AnalysisLoaderProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 animate-fade-in-up">
      <div className="relative">
        <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-pulse-ring">
          <FileSearch className="w-10 h-10 text-primary" />
        </div>
      </div>
      <div className="text-center">
        <p className="font-semibold text-foreground">{step}</p>
        <p className="text-sm text-muted-foreground mt-1">This may take a moment...</p>
      </div>
    </div>
  );
}
