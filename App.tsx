
import React, { useState, useCallback } from 'react';
import { Grade, AnalysisResult } from './types';
import { pdfToImages } from './services/pdfService';
import { analyzeAndGenerate } from './services/geminiService';
import { ExamPaperView } from './components/ExamPaperView';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [grade, setGrade] = useState<Grade>(Grade.Primary5);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState('');
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles(Array.from(e.target.files));
    }
  };

  const handleStartProcess = async () => {
    if (files.length === 0) {
      setError('请至少上传一个PDF文件');
      return;
    }

    setLoading(true);
    setError(null);
    setProgress('正在准备分析资料...');

    try {
      let allImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        setProgress(`正在解析第 ${i + 1}/${files.length} 个 PDF 文件...`);
        const imgs = await pdfToImages(files[i]);
        allImages = [...allImages, ...imgs];
      }

      setProgress('AI 正在基于苏教版大纲分析知识点并生成试卷...');
      const response = await analyzeAndGenerate(allImages, grade);
      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(`处理失败: ${err.message || '未知错误'}`);
    } finally {
      setLoading(false);
      setProgress('');
    }
  };

  const reset = () => {
    setResult(null);
    setFiles([]);
    setError(null);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-12 text-center no-print">
        <h1 className="text-4xl font-black text-slate-900 mb-4 tracking-tight">
          SmartExam <span className="text-indigo-600">Builder AI</span>
        </h1>
        <p className="text-slate-600 text-lg">
          专注 <span className="text-indigo-600 font-semibold">江苏苏教版数学</span>，智能查缺补漏
        </p>
      </header>

      {!result ? (
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-slate-200 no-print">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {/* Step 1: Upload */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  1. 上传题目 PDF
                </label>
                <div 
                  className={`relative border-2 border-dashed rounded-xl p-8 transition-colors text-center ${
                    files.length > 0 ? 'border-indigo-400 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-2">
                    <div className="text-4xl">📄</div>
                    {files.length > 0 ? (
                      <div className="text-indigo-700 font-medium">
                        已选择 {files.length} 个文件
                      </div>
                    ) : (
                      <div className="text-slate-400">点击或拖拽 PDF 文件至此处</div>
                    )}
                  </div>
                </div>
                {files.length > 0 && (
                  <div className="mt-3 space-y-1">
                    {files.map((f, i) => (
                      <div key={i} className="text-xs text-slate-500 truncate">
                        • {f.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Step 2: Settings */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-2 uppercase tracking-wider">
                  2. 选择目标年级 (苏教版)
                </label>
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value as Grade)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  {Object.values(Grade).map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
                <p className="mt-2 text-xs text-slate-400">目前仅支持小学及初中苏教版数学大纲分析</p>
              </div>

              <div className="pt-4">
                <button
                  onClick={handleStartProcess}
                  disabled={loading || files.length === 0}
                  className={`w-full py-4 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-indigo-200/50 ${
                    loading || files.length === 0 
                      ? 'bg-slate-300 cursor-not-allowed' 
                      : 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-1'
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {progress}
                    </span>
                  ) : '开始智能生成'}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-4 bg-red-50 text-red-700 rounded-xl border border-red-200 text-sm">
              ⚠️ {error}
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fadeIn">
          {/* Analysis Result Header */}
          <div className="bg-white rounded-2xl shadow-md p-8 mb-8 border border-slate-200 no-print">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-slate-800">苏教版知识点覆盖分析</h2>
              <button 
                onClick={reset}
                className="text-slate-500 hover:text-indigo-600 transition-colors text-sm font-medium"
              >
                重新选择文件
              </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="p-5 bg-emerald-50 rounded-xl border border-emerald-100">
                <h3 className="text-emerald-800 font-bold mb-3 flex items-center gap-2">
                  <span className="text-xl">✅</span> 样卷已涵盖
                </h3>
                <ul className="space-y-1">
                  {result.analysis.coveredPoints.map((p, i) => (
                    <li key={i} className="text-emerald-700 text-sm flex items-center gap-2">
                      <div className="w-1 h-1 bg-emerald-400 rounded-full"></div> {p}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="p-5 bg-amber-50 rounded-xl border border-amber-100">
                <h3 className="text-amber-800 font-bold mb-3 flex items-center gap-2">
                  <span className="text-xl">🎯</span> 大纲遗漏/需强化
                </h3>
                <ul className="space-y-1">
                  {result.analysis.missingPoints.map((p, i) => (
                    <li key={i} className="text-amber-700 text-sm flex items-center gap-2 font-medium">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full"></div> {p}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 italic text-slate-600 text-sm leading-relaxed">
              <span className="font-bold text-slate-700 not-italic">针对性建议：</span>
              {result.analysis.summary}
            </div>
          </div>

          <div className="flex justify-end gap-4 mb-6 no-print">
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-6 py-2 bg-slate-800 text-white rounded-lg font-semibold hover:bg-slate-900 transition-all shadow-md"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              导出/打印新试卷
            </button>
          </div>

          <ExamPaperView paper={result.exam} />
        </div>
      )}

      <footer className="mt-20 py-8 border-t border-slate-200 text-center text-slate-400 text-sm no-print">
        &copy; 2024 SmartExam Builder AI. 基于苏教版数学大纲与 Gemini 3 Pro 驱动。
      </footer>
    </div>
  );
};

export default App;
