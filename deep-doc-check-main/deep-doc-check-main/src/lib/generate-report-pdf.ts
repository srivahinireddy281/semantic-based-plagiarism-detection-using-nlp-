import jsPDF from 'jspdf';
import type { AnalysisReport } from './plagiarism-analysis';

export function generateReportPDF(report: AnalysisReport) {
  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  const addPageIfNeeded = (needed: number) => {
    if (y + needed > pageHeight - margin) {
      doc.addPage();
      y = margin;
    }
  };

  // ─── COVER / HEADER ───
  doc.setFillColor(26, 35, 50); // primary navy
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('Originality Report', margin, 18);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`File: ${report.fileName}`, margin, 26);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`, margin, 32);
  doc.text(`Total Sentences Analyzed: ${report.totalSentences}`, margin, 38);

  y = 52;

  // ─── SIMILARITY INDEX BOX ───
  doc.setTextColor(40, 40, 40);
  doc.setFillColor(245, 245, 248);
  doc.roundedRect(margin, y, contentWidth, 30, 3, 3, 'F');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SIMILARITY INDEX', margin + 6, y + 10);

  // Colored percentage
  const pct = report.similarityIndex;
  if (pct >= 50) doc.setTextColor(220, 50, 50);
  else if (pct >= 25) doc.setTextColor(220, 140, 20);
  else if (pct >= 10) doc.setTextColor(200, 170, 30);
  else doc.setTextColor(50, 160, 80);

  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.text(`${pct}%`, margin + 6, y + 24);

  // Stats on the right
  doc.setTextColor(80, 80, 80);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const statsX = margin + contentWidth - 60;
  doc.text(`Flagged: ${report.plagiarisedSentences} sentences`, statsX, y + 12);
  doc.text(`Original: ${report.totalSentences - report.plagiarisedSentences} sentences`, statsX, y + 18);
  doc.text(`Threshold: 45% cosine similarity`, statsX, y + 24);

  y += 38;

  // ─── SOURCE BREAKDOWN ───
  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('SOURCE BREAKDOWN', margin, y);
  y += 7;

  const { internet, publications, student } = report.sourceBreakdown;
  const categories = [
    { label: 'Internet Sources', pct: internet.percentage, sources: internet.sources, color: [41, 150, 200] as [number, number, number] },
    { label: 'Publications', pct: publications.percentage, sources: publications.sources, color: [120, 80, 180] as [number, number, number] },
    { label: 'Student Papers', pct: student.percentage, sources: student.sources, color: [220, 160, 30] as [number, number, number] },
  ];

  for (const cat of categories) {
    addPageIfNeeded(20 + cat.sources.length * 5);

    // Category header with bar
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...cat.color);
    doc.text(`${cat.label}  —  ${cat.pct}%`, margin, y);
    y += 3;

    // Progress bar
    doc.setFillColor(230, 230, 235);
    doc.roundedRect(margin, y, contentWidth, 3, 1, 1, 'F');
    if (cat.pct > 0) {
      doc.setFillColor(...cat.color);
      doc.roundedRect(margin, y, Math.max(2, (cat.pct / 100) * contentWidth), 3, 1, 1, 'F');
    }
    y += 6;

    // Source list
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    cat.sources.forEach((src, i) => {
      addPageIfNeeded(5);
      doc.text(`${i + 1}. ${src.title}`, margin + 4, y);
      y += 4.5;
    });
    y += 4;
  }

  // ─── HIGHLIGHTED DOCUMENT ───
  addPageIfNeeded(20);
  doc.setDrawColor(200, 200, 205);
  doc.line(margin, y, margin + contentWidth, y);
  y += 8;

  doc.setTextColor(40, 40, 40);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENT WITH ANNOTATIONS', margin, y);
  y += 3;

  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(140, 140, 140);
  doc.text('Highlighted sentences indicate detected semantic similarity to reference corpus.', margin, y);
  y += 7;

  // Render sentences
  doc.setFontSize(9);
  const lineHeight = 4.5;

  for (const sentence of report.sentences) {
    // Wrap text
    const lines = doc.splitTextToSize(sentence.text, contentWidth - 4);
    const blockHeight = lines.length * lineHeight + 2;
    addPageIfNeeded(blockHeight + 2);

    if (sentence.isPlagiarised) {
      // Highlight background
      let bgColor: [number, number, number];
      if (sentence.similarity >= 0.7) bgColor = [255, 210, 210];
      else if (sentence.similarity >= 0.55) bgColor = [255, 230, 190];
      else bgColor = [255, 245, 200];

      doc.setFillColor(...bgColor);
      doc.roundedRect(margin, y - 1, contentWidth, blockHeight, 1, 1, 'F');

      // Left color strip
      let stripColor: [number, number, number];
      if (sentence.similarity >= 0.7) stripColor = [220, 50, 50];
      else if (sentence.similarity >= 0.55) stripColor = [220, 140, 20];
      else stripColor = [200, 170, 30];

      doc.setFillColor(...stripColor);
      doc.rect(margin, y - 1, 1.5, blockHeight, 'F');

      doc.setTextColor(60, 30, 30);
    } else {
      doc.setTextColor(50, 50, 50);
    }

    doc.setFont('helvetica', 'normal');
    doc.text(lines, margin + 3, y + 3);
    y += blockHeight + 1.5;
  }

  // ─── FOOTER on last page ───
  doc.setFontSize(7);
  doc.setTextColor(160, 160, 160);
  doc.text(
    'Generated by PlagiarismGuard — Semantic Plagiarism Detection',
    pageWidth / 2,
    pageHeight - 8,
    { align: 'center' }
  );

  // Save
  const safeName = report.fileName.replace(/\.pdf$/i, '');
  doc.save(`${safeName}_originality_report.pdf`);
}
