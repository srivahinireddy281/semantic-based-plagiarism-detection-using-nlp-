import { Globe, BookOpen, GraduationCap } from 'lucide-react';
import type { AnalysisReport } from '@/lib/plagiarism-analysis';

interface SourceBreakdownProps {
  report: AnalysisReport;
}

export function SourceBreakdown({ report }: SourceBreakdownProps) {
  const { internet, publications, student } = report.sourceBreakdown;

  const categories = [
    {
      label: 'Internet Sources',
      icon: Globe,
      percentage: internet.percentage,
      sources: internet.sources,
      colorClass: 'bg-chart-internet',
      textClass: 'text-chart-internet',
    },
    {
      label: 'Publications',
      icon: BookOpen,
      percentage: publications.percentage,
      sources: publications.sources,
      colorClass: 'bg-chart-publications',
      textClass: 'text-chart-publications',
    },
    {
      label: 'Student Papers',
      icon: GraduationCap,
      percentage: student.percentage,
      sources: student.sources,
      colorClass: 'bg-chart-student',
      textClass: 'text-chart-student',
    },
  ];

  return (
    <div className="space-y-6">
      {categories.map((cat) => (
        <div key={cat.label}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <cat.icon className={`w-4 h-4 ${cat.textClass}`} />
              <span className="text-sm font-semibold text-foreground">{cat.label}</span>
            </div>
            <span className={`text-sm font-bold ${cat.textClass}`}>{cat.percentage}%</span>
          </div>
          
          {/* Progress bar */}
          <div className="h-2 rounded-full bg-muted overflow-hidden mb-3">
            <div
              className={`h-full rounded-full ${cat.colorClass} transition-all duration-700`}
              style={{ width: `${cat.percentage}%` }}
            />
          </div>

          {/* Source list */}
          {cat.sources.length > 0 && (
            <ul className="space-y-1 ml-6">
              {cat.sources.map((source, i) => (
                <li key={source.id} className="text-xs text-muted-foreground flex items-start gap-1.5">
                  <span className={`${cat.textClass} font-bold mt-0.5`}>{i + 1}.</span>
                  <span>{source.title}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}
