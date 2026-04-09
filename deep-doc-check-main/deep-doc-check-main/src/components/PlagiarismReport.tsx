import { ArrowLeft, FileText, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { generateReportPDF } from '@/lib/generate-report-pdf';
import { SimilarityDonut } from './SimilarityDonut';
import { SourceBreakdown } from './SourceBreakdown';
import { HighlightedDocument } from './HighlightedDocument';
import type { AnalysisReport } from '@/lib/plagiarism-analysis';

interface PlagiarismReportProps {
  report: AnalysisReport;
  onReset: () => void;
}

export function PlagiarismReport({ report, onReset }: PlagiarismReportProps) {
  const isClean = report.similarityIndex < 15;

  return (
    <div className="animate-fade-in-up">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <Button variant="ghost" onClick={onReset} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          New Analysis
        </Button>
        <div className="flex items-center gap-3">
          <Button
            variant="default"
            onClick={() => generateReportPDF(report)}
            className="gap-2"
          >
            <Download className="w-4 h-4" />
            Download Report
          </Button>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <FileText className="w-4 h-4" />
            {report.fileName}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="space-y-8">
          {/* Similarity Index Card */}
          <div className="bg-card rounded-lg border border-border p-6 text-center">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-sans font-semibold">
              Similarity Index
            </h2>
            <SimilarityDonut percentage={report.similarityIndex} />
            <div className="mt-4 flex items-center justify-center gap-2">
              {isClean ? (
                <>
                  <CheckCircle className="w-4 h-4 text-similarity-none" />
                  <span className="text-sm font-medium text-similarity-none">Low Risk</span>
                </>
              ) : (
                <>
                  <AlertTriangle className="w-4 h-4 text-similarity-high" />
                  <span className="text-sm font-medium text-similarity-high">Review Required</span>
                </>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="bg-card rounded-lg border border-border p-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Sentences</span>
              <span className="font-semibold text-foreground">{report.totalSentences}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Flagged Sentences</span>
              <span className="font-semibold text-similarity-high">{report.plagiarisedSentences}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Original Sentences</span>
              <span className="font-semibold text-similarity-none">
                {report.totalSentences - report.plagiarisedSentences}
              </span>
            </div>
          </div>

          {/* Source Breakdown */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-sans font-semibold">
              Sources Detected
            </h2>
            <SourceBreakdown report={report} />
          </div>

          {/* Legend */}
          <div className="bg-card rounded-lg border border-border p-6">
            <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-3 font-sans font-semibold">
              Highlight Legend
            </h2>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded-full bg-similarity-high" />
                <span className="text-muted-foreground">High similarity (≥70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded-full bg-similarity-medium" />
                <span className="text-muted-foreground">Moderate (55-70%)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-4 h-2 rounded-full bg-similarity-low" />
                <span className="text-muted-foreground">Low (45-55%)</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main content - highlighted document */}
        <main>
          <h2 className="text-xs uppercase tracking-widest text-muted-foreground mb-4 font-sans font-semibold">
            Document with Annotations
          </h2>
          <HighlightedDocument sentences={report.sentences} />
        </main>
      </div>
    </div>
  );
}
