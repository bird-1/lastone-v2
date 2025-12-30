
import React from 'react';
import { ExamPaper, Question } from '../types';

interface ExamPaperViewProps {
  paper: ExamPaper;
}

const QuestionItem: React.FC<{ q: Question; index: number }> = ({ q, index }) => (
  <div className="mb-6 pb-4 border-b border-slate-100 last:border-0">
    <div className="flex items-start gap-2">
      <span className="font-bold text-slate-700">{index + 1}.</span>
      <div className="flex-1">
        <p className="text-slate-800 leading-relaxed mb-3 whitespace-pre-wrap">{q.content}</p>
        
        {q.options && q.options.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-3">
            {q.options.map((opt, i) => (
              <div key={i} className="text-slate-600">
                {String.fromCharCode(65 + i)}. {opt}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4 p-3 bg-slate-50 rounded-lg text-sm no-print">
          <p className="font-semibold text-indigo-600 mb-1">答案与解析：</p>
          <p className="text-slate-700"><span className="font-medium">答案：</span>{q.answer}</p>
          <p className="text-slate-500 mt-1"><span className="font-medium">解析：</span>{q.explanation}</p>
        </div>
      </div>
      <span className="text-xs font-medium text-slate-400">({q.points}分)</span>
    </div>
  </div>
);

export const ExamPaperView: React.FC<ExamPaperViewProps> = ({ paper }) => {
  return (
    <div className="bg-white p-8 md:p-12 rounded-xl shadow-lg border border-slate-200 print:shadow-none print:border-0 print:p-0">
      <div className="text-center mb-10 border-b-2 border-slate-900 pb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 mb-2">{paper.title}</h1>
        <div className="flex justify-center gap-8 text-slate-600 font-medium">
          <span>适用年级：{paper.grade}</span>
          <span>总分：{paper.totalPoints}分</span>
          <span>考试时间：90分钟</span>
        </div>
      </div>

      <div className="space-y-12">
        {/* Section 1: Choices */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">一</span>
            选择题 (共5小题，每题4分，共20分)
          </h2>
          <div className="pl-4">
            {paper.sections.choices.map((q, i) => (
              <QuestionItem key={q.id} q={q} index={i} />
            ))}
          </div>
        </section>

        {/* Section 2: Blanks */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">二</span>
            填空题 (共5小题，每题4分，共20分)
          </h2>
          <div className="pl-4">
            {paper.sections.blanks.map((q, i) => (
              <QuestionItem key={q.id} q={q} index={i} />
            ))}
          </div>
        </section>

        {/* Section 3: Applications */}
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <span className="bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center text-sm">三</span>
            应用题 (共6小题，每题10分，共60分)
          </h2>
          <div className="pl-4">
            {paper.sections.applications.map((q, i) => (
              <QuestionItem key={q.id} q={q} index={i} />
            ))}
          </div>
        </section>
      </div>

      <div className="mt-12 text-center text-slate-400 text-sm italic print:mt-24">
        --- 试卷结束 ---
      </div>
    </div>
  );
};
