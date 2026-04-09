import { useState } from 'react';
import type { SentenceAnalysis } from '@/lib/plagiarism-analysis';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface HighlightedDocumentProps {
  sentences: SentenceAnalysis[];
}

function getHighlightClass(similarity: number, isPlagiarised: boolean): string {
  if (!isPlagiarised) return '';
  if (similarity >= 0.7) return 'highlight-high';
  if (similarity >= 0.55) return 'highlight-medium';
  return 'highlight-low';
}

function getSimilarityLabel(similarity: number): string {
  if (similarity >= 0.7) return 'High similarity';
  if (similarity >= 0.55) return 'Moderate similarity';
  return 'Low similarity';
}

export function HighlightedDocument({ sentences }: HighlightedDocumentProps) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <div className="bg-card rounded-lg border border-border p-6 md:p-8 leading-relaxed text-[15px] font-sans">
      <div className="prose prose-sm max-w-none">
        {sentences.map((sentence) => {
          const hlClass = getHighlightClass(sentence.similarity, sentence.isPlagiarised);
          
          if (!sentence.isPlagiarised) {
            return (
              <span key={sentence.index}>
                {sentence.text}{' '}
              </span>
            );
          }

          return (
            <Tooltip key={sentence.index}>
              <TooltipTrigger asChild>
                <span
                  className={`${hlClass} cursor-help rounded-sm px-0.5 py-0.5 transition-opacity ${
                    hoveredIndex !== null && hoveredIndex !== sentence.index ? 'opacity-60' : ''
                  }`}
                  onMouseEnter={() => setHoveredIndex(sentence.index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                >
                  {sentence.text}
                </span>
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-semibold text-xs">
                    {getSimilarityLabel(sentence.similarity)} ({Math.round(sentence.similarity * 100)}%)
                  </p>
                  {sentence.matches.map((m) => (
                    <p key={m.id} className="text-xs text-muted-foreground">
                      → {m.title}
                    </p>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          );
        })}
      </div>
    </div>
  );
}
