
export enum Grade {
  Primary1 = "小学一年级",
  Primary2 = "小学二年级",
  Primary3 = "小学三年级",
  Primary4 = "小学四年级",
  Primary5 = "小学五年级",
  Primary6 = "小学六年级",
  Junior1 = "初中一年级 (七年级)",
  Junior2 = "初中二年级 (八年级)",
  Junior3 = "初中三年级 (九年级)"
}

export interface KnowledgeAnalysis {
  coveredPoints: string[];
  missingPoints: string[];
  summary: string;
}

export interface Question {
  id: string;
  type: 'choice' | 'blank' | 'application';
  content: string;
  options?: string[]; // Only for choice
  answer: string;
  explanation: string;
  points: number;
}

export interface ExamPaper {
  title: string;
  grade: Grade;
  totalPoints: number;
  sections: {
    choices: Question[];
    blanks: Question[];
    applications: Question[];
  };
}

export interface AnalysisResult {
  analysis: KnowledgeAnalysis;
  exam: ExamPaper;
}
