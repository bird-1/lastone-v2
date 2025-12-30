
import React, { useState } from 'react';
import { Grade, AnalysisResult } from './types';
import { pdfToImages } from './services/pdfService';
import { analyzeAndGenerate } from './services/geminiService';
import { ExamPaperView } from './components/ExamPaperView';

const App: React.FC = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [grade, setGrade] = useState<Grade>(Grade.Primary5_1);
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
    setProgress('初始化分析环境...');

    try {
      let allImages: string[] = [];
      
      for (let i = 0; i < files.length; i++) {
        setProgress(`正在深度解析 PDF: ${files[i].name} (${i + 1}/${files.length})...`);
        const imgs = await pdfToImages(files[i]);
        allImages = [...allImages, ...imgs];
        
        // Safety: Limit total images to 15 to avoid token overflow
        if (allImages.length >= 15) {
          allImages = allImages.slice(0, 15);
          break;
        }
      }

      setProgress(`正在对接江苏苏教版大纲，分析 ${grade} 知识图谱...`);
      const response = await analyzeAndGenerate(allImages, grade);
      setResult(response);
    } catch (err: any) {
      console.error(err);
      setError(`处理失败: ${err.message || 'AI 分析超时或格式错误，请尝试减少上传页数'}`);
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
    <div className="max-w-6xl mx-auto px-4 py-8 lg:py-12">
      {/* Brand Header */}
      <header className="mb-12 text-center no-print">
        <div className="inline-block px-3 py-1 rounded-full bg-indigo-100 text-indigo-700 text-xs font-bold mb-4 uppercase tracking-widest">
          Jiangsu Math Education Edition
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-4 tracking-tight">
          苏教版数学 <span className="text-indigo-600">智能提优系统</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          上传错题集或练习册PDF，基于江苏大纲精准定位知识盲区，生成专属强化卷。
        </p>
      </header>

      {!result ? (
        <div className="bg-white rounded-3xl shadow-2xl p-8 lg:p-12 border border-slate-100 no-print">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Left: Upload Section */}
            <div className="lg:col-span-3 space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">1</div>
                  <h2 className="text-xl font-bold text-slate-800">上传题目 PDF 资料</h2>
                </div>
                
                <div 
                  className={`relative group border-2 border-dashed rounded-2xl p-12 transition-all text-center ${
                    files.length > 0 ? 'border-indigo-400 bg-indigo-50/50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="file"
                    multiple
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="space-y-4">
                    <div className="text-6xl group-hover:scale-110 transition-transform duration-300">📚</div>
                    <div>
                      {files.length > 0 ? (
                        <div className="text-indigo-600 font-bold text-lg">
                          已准备好 {files.length} 份分析资料
                        </div>
                      ) : (
                        <>
                          <div className="text-slate-600 font-medium text-lg">点击选择或拖拽多个PDF文件</div>
                          <div className="text-slate-400 text-sm mt-1">支持课后练习、往年试卷或错题汇编</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {files.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 p-2 bg-slate-100 rounded-lg text-xs text-slate-600 truncate border border-slate-200">
                        <span className="shrink-0">📄</span>
                        <span className="truncate">{f.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right: Configuration */}
            <div className="lg:col-span-2 flex flex-col justify-between space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm">2</div>
                  <h2 className="text-xl font-bold text-slate-800">确定目标学段</h2>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest">
                      苏教版大纲范围
                    </label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value as Grade)}
                      className="w-full bg-white border-2 border-slate-100 rounded-2xl px-5 py-4 text-slate-700 font-semibold focus:outline-none focus:border-indigo-500 shadow-sm transition-all appearance-none"
                    >
                      {Object.values(Grade).map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3 italic">
                    <span className="text-amber-500">💡</span>
                    <p className="text-amber-800 text-xs leading-relaxed">
                      AI 将精准匹配该学期的苏教版知识图谱，包括计算、几何、逻辑等所有核心模块。
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleStartProcess}
                disabled={loading || files.length === 0}
                className={`group w-full py-5 rounded-2xl font-black text-lg text-white transition-all shadow-xl hover:shadow-indigo-300/50 relative overflow-hidden ${
                  loading || files.length === 0 
                    ? 'bg-slate-300 cursor-not-allowed' 
                    : 'bg-indigo-600 hover:bg-indigo-700 transform hover:-translate-y-1'
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span className="text-sm font-medium">{progress}</span>
                  </span>
                ) : (
                  <>
                    <span className="relative z-10">开始苏教版深度分析</span>
                    <div className="absolute inset-0 bg-white/10 translate-x-full group-hover:translate-x-0 transition-transform duration-500 skew-x-12"></div>
                  </>
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-8 p-5 bg-red-50 text-red-700 rounded-2xl border border-red-100 text-sm flex items-start gap-3 animate-shake">
              <span className="text-lg">🚨</span>
              <div>
                <p className="font-bold mb-1">分析过程遇到问题</p>
                <p className="opacity-80">{error}</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="animate-fadeIn space-y-12">
          {/* Analysis Dashboard */}
          <div className="bg-slate-900 rounded-3xl shadow-2xl overflow-hidden no-print">
            <div className="p-8 lg:p-12">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
                <div>
                  <h2 className="text-3xl font-black text-white mb-2">苏教版大纲比对报告</h2>
                  <p className="text-slate-400 font-medium">{grade} · 学习画像</p>
                </div>
                <button 
                  onClick={reset}
                  className="px-6 py-2 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 rounded-xl transition-all border border-slate-700 text-sm font-bold"
                >
                  重新上传资料
                </button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Covered */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xl font-bold">✓</div>
                    <h3 className="text-xl font-bold text-white">样卷覆盖知识点</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.coveredPoints.map((p, i) => (
                      <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-lg border border-emerald-500/20">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing */}
                <div className="bg-slate-800/50 rounded-2xl p-6 border border-slate-700/50">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center text-xl font-bold">!</div>
                    <h3 className="text-xl font-bold text-white">大纲重点遗漏 (针对性强化目标)</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {result.analysis.missingPoints.map((p, i) => (
                      <span key={i} className="px-3 py-1.5 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-lg border border-amber-500/30">
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-indigo-500/10 rounded-2xl border border-indigo-500/20">
                <div className="flex gap-4">
                  <span className="text-2xl">👩‍🏫</span>
                  <div>
                    <h4 className="text-indigo-400 font-bold mb-1">特级教师评语</h4>
                    <p className="text-slate-300 text-sm leading-relaxed italic">
                      "{result.analysis.summary}"
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 no-print px-4">
            <p className="text-slate-500 font-medium">✨ 下方为您生成的苏教版同步强化卷，可直接打印进行练习。</p>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl hover:shadow-indigo-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>
              打印定制试卷
            </button>
          </div>

          {/* Paper Rendering */}
          <ExamPaperView paper={result.exam} />
        </div>
      )}

      {/* Footer */}
      <footer className="mt-24 py-12 border-t border-slate-200 text-center no-print">
        <p className="text-slate-400 text-sm font-medium">
          &copy; 2024 SmartExam Builder AI · 专注江苏苏教版数学提优
        </p>
        <p className="text-slate-300 text-xs mt-2 uppercase tracking-tighter">
          Powered by Gemini 3 Pro Education Engine
        </p>
      </footer>

      <style>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.4s ease-in-out; }
        .animate-fadeIn { animation: fadeIn 0.8s ease-out forwards; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default App;
