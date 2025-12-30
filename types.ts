
export enum Grade {
  Primary1_1 = "小学一年级上学期",
  Primary1_2 = "小学一年级下学期",
  Primary2_1 = "小学二年级上学期",
  Primary2_2 = "小学二年级下学期",
  Primary3_1 = "小学三年级上学期",
  Primary3_2 = "小学三年级下学期",
  Primary4_1 = "小学四年级上学期",
  Primary4_2 = "小学四年级下学期",
  Primary5_1 = "小学五年级上学期",
  Primary5_2 = "小学五年级下学期",
  Primary6_1 = "小学六年级上学期",
  Primary6_2 = "小学六年级下学期",
  Junior1_1 = "初中一年级(七年级)上学期",
  Junior1_2 = "初中一年级(七年级)下学期",
  Junior2_1 = "初中二年级(八年级)上学期",
  Junior2_2 = "初中二年级(八年级)下学期",
  Junior3_1 = "初中三年级(九年级)上学期",
  Junior3_2 = "初中三年级(九年级)下学期"
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
  grade: string;
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
