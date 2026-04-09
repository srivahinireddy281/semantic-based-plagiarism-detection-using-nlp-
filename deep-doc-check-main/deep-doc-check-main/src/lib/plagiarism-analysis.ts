// Simulated semantic plagiarism detection engine
// In production, this would use real sentence embeddings + cosine similarity

export interface SourceMatch {
  id: string;
  title: string;
  url?: string;
  category: 'internet' | 'publication' | 'student';
  similarity: number; // 0-1
}

export interface SentenceAnalysis {
  text: string;
  index: number;
  isPlagiarised: boolean;
  similarity: number; // 0-1
  matches: SourceMatch[];
}

export interface AnalysisReport {
  fileName: string;
  totalSentences: number;
  plagiarisedSentences: number;
  similarityIndex: number; // percentage
  sentences: SentenceAnalysis[];
  sourceBreakdown: {
    internet: { percentage: number; sources: SourceMatch[] };
    publications: { percentage: number; sources: SourceMatch[] };
    student: { percentage: number; sources: SourceMatch[] };
  };
}

// Simulated reference corpus sources
const REFERENCE_SOURCES: SourceMatch[] = [
  { id: 's1', title: 'Wikipedia - Machine Learning', url: 'en.wikipedia.org', category: 'internet', similarity: 0 },
  { id: 's2', title: 'GeeksforGeeks - Data Structures', url: 'geeksforgeeks.org', category: 'internet', similarity: 0 },
  { id: 's3', title: 'Medium - Deep Learning Fundamentals', url: 'medium.com', category: 'internet', similarity: 0 },
  { id: 's4', title: 'Stanford NLP Blog', url: 'nlp.stanford.edu', category: 'internet', similarity: 0 },
  { id: 's5', title: 'ResearchGate - Neural Networks Survey', url: 'researchgate.net', category: 'internet', similarity: 0 },
  { id: 's6', title: 'Vaswani et al. "Attention Is All You Need", NeurIPS 2017', category: 'publication', similarity: 0 },
  { id: 's7', title: 'Devlin et al. "BERT: Pre-training of Deep Bidirectional Transformers", 2019', category: 'publication', similarity: 0 },
  { id: 's8', title: 'Brown et al. "Language Models are Few-Shot Learners", 2020', category: 'publication', similarity: 0 },
  { id: 's9', title: 'LeCun et al. "Deep Learning", Nature 2015', category: 'publication', similarity: 0 },
  { id: 's10', title: 'Goodfellow et al. "Generative Adversarial Networks", 2014', category: 'publication', similarity: 0 },
  { id: 's11', title: 'Student Paper - University of Oxford, 2023', category: 'student', similarity: 0 },
  { id: 's12', title: 'Student Paper - MIT, 2022', category: 'student', similarity: 0 },
  { id: 's13', title: 'Student Paper - Stanford University, 2023', category: 'student', similarity: 0 },
  { id: 's14', title: 'Student Thesis - ETH Zurich, 2024', category: 'student', similarity: 0 },
];

// Deterministic hash for consistent results per sentence
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

function simulateSimilarity(sentence: string): number {
  const hash = hashString(sentence);
  const len = sentence.length;
  
  // Longer, more "academic" sentences get higher similarity scores
  const hasAcademicWords = /\b(research|study|analysis|method|approach|model|algorithm|data|result|significant|demonstrate|propose|implement|evaluate|framework|system|technique|process|theory|hypothesis|conclusion|evidence|experiment)\b/i.test(sentence);
  
  const base = (hash % 100) / 100;
  const lengthBonus = Math.min(len / 300, 0.2);
  const academicBonus = hasAcademicWords ? 0.15 : 0;
  
  const raw = base * 0.6 + lengthBonus + academicBonus;
  return Math.min(Math.max(raw, 0), 1);
}

const SIMILARITY_THRESHOLD = 0.45;

export function analyzePlagiarism(sentences: string[], fileName: string): AnalysisReport {
  const analyzedSentences: SentenceAnalysis[] = sentences.map((text, index) => {
    const similarity = simulateSimilarity(text);
    const isPlagiarised = similarity >= SIMILARITY_THRESHOLD;
    
    // Assign matches from reference corpus
    const matches: SourceMatch[] = [];
    if (isPlagiarised) {
      const hash = hashString(text);
      const numMatches = 1 + (hash % 3);
      const startIdx = hash % REFERENCE_SOURCES.length;
      
      for (let i = 0; i < numMatches; i++) {
        const srcIdx = (startIdx + i) % REFERENCE_SOURCES.length;
        const source = REFERENCE_SOURCES[srcIdx];
        matches.push({
          ...source,
          similarity: similarity * (0.7 + (hash % 30) / 100),
        });
      }
    }
    
    return { text, index, isPlagiarised, similarity, matches };
  });

  const plagiarisedSentences = analyzedSentences.filter(s => s.isPlagiarised);
  const similarityIndex = sentences.length > 0
    ? Math.round((plagiarisedSentences.length / sentences.length) * 100)
    : 0;

  // Build source breakdown
  const allMatches = plagiarisedSentences.flatMap(s => s.matches);
  const internetSources = [...new Map(allMatches.filter(m => m.category === 'internet').map(m => [m.id, m])).values()];
  const pubSources = [...new Map(allMatches.filter(m => m.category === 'publication').map(m => [m.id, m])).values()];
  const studentSources = [...new Map(allMatches.filter(m => m.category === 'student').map(m => [m.id, m])).values()];

  const totalMatches = internetSources.length + pubSources.length + studentSources.length;
  const internetPct = totalMatches > 0 ? Math.round((internetSources.length / totalMatches) * similarityIndex) : 0;
  const pubPct = totalMatches > 0 ? Math.round((pubSources.length / totalMatches) * similarityIndex) : 0;
  const studentPct = Math.max(0, similarityIndex - internetPct - pubPct);

  return {
    fileName,
    totalSentences: sentences.length,
    plagiarisedSentences: plagiarisedSentences.length,
    similarityIndex,
    sentences: analyzedSentences,
    sourceBreakdown: {
      internet: { percentage: internetPct, sources: internetSources },
      publications: { percentage: pubPct, sources: pubSources },
      student: { percentage: studentPct, sources: studentSources },
    },
  };
}
