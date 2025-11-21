
import React, { useState, useCallback, useEffect } from 'react';
import { analyzeData } from './services/analysisService';
import { findProductSynonyms } from './services/geminiService';
import type { AnalysisResult, ModalInfo } from './types';
import StatCard from './components/StatCard';
import HistogramChart from './components/HistogramChart';
import GuideModal from './components/GuideModal';
import RecommendationSection from './components/RecommendationSection';
import SettingsModal from './components/SettingsModal';
import { verifyAccess } from './utils/crypto';
import { ChartIcon, SigmaIcon, HashIcon, UpDownIcon, TrendingUpIcon, AlertIcon, DownloadIcon, QuestionMarkCircleIcon, DocumentArrowDownIcon, SparklesIcon, Cog6ToothIcon } from './components/Icons';

const App: React.FC = () => {
  const [inputText, setInputText] = useState<string>('110, 125, 125, 130, 145, 150, 160, 160, 175, 180, 190, 205, 210, 210, 225, 230, 240, 250, 250, 250, 265, 270, 280, 290, 300');
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Security & Settings State
  // Mặc định là rỗng, không lưu vào localStorage để đảm bảo F5 là mất (Reset session)
  const [accessPassword, setAccessPassword] = useState<string>('');
  const [userApiKey, setUserApiKey] = useState<string>('');

  // AI Search States
  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [synonymResults, setSynonymResults] = useState<string[]>([]);
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  // Clear cache & storage on mount (F5 reset)
  useEffect(() => {
    localStorage.clear();
    sessionStorage.clear();
    console.log("Session reset.");
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleAnalyze = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setAnalysisResult(null);

    // Simulate a short delay for better UX
    setTimeout(() => {
      try {
        const result = analyzeData(inputText);
        setAnalysisResult(result);
      } catch (e) {
        if (e instanceof Error) {
          setError(e.message);
        } else {
          setError('Đã xảy ra lỗi không xác định.');
        }
      } finally {
        setIsLoading(false);
      }
    }, 500);
  }, [inputText]);
  
  const handleAiSearch = async () => {
      if (!productSearchTerm.trim()) return;
      
      setIsAiLoading(true);
      setAiError(null);
      setSynonymResults([]);

      // Logic xác thực Key:
      // 1. Ưu tiên dùng User API Key nếu có nhập
      // 2. Nếu không, dùng System Key (qua Password)
      let activeKey = '';

      if (userApiKey && userApiKey.trim().length > 10) {
          activeKey = userApiKey.trim();
      } else {
          // Kiểm tra pass
          const systemKey = verifyAccess(accessPassword);
          if (systemKey) {
              activeKey = systemKey;
          }
      }

      if (!activeKey) {
          setAiError('Yêu cầu xác thực: Vui lòng nhập "Mã truy cập đặc biệt" HOẶC "API Key cá nhân" trong phần Cài đặt (Bánh răng).');
          setIsAiLoading(false);
          return;
      }

      try {
          const synonyms = await findProductSynonyms(productSearchTerm, activeKey);
          setSynonymResults(synonyms);
          if (synonyms.length === 0) {
              setAiError('Không tìm thấy kết quả tương tự nào.');
          }
      } catch (e) {
          if (e instanceof Error) {
              setAiError(e.message);
          } else {
              setAiError('Lỗi kết nối với AI.');
          }
      } finally {
          setIsAiLoading(false);
      }
  };

  const formatModeValue = (mode: ModalInfo[]): string => {
    if (!mode || mode.length === 0) {
        return 'N/A';
    }

    return mode.map(m => {
        // Handle the "no mode" case
        if (isNaN(m.average)) {
            return m.range;
        }

        // Check if the range is a single number
        if (!m.range.includes(' - ')) {
            return m.range; // Just show the number, no need for average
        }

        // It's a range, show the average
        return `${m.range} (TB: ${m.average.toFixed(1)})`;
    }).join(', ');
  };

  const handleExportReport = () => {
    if (!analysisResult) return;

    const modeText = formatModeValue(analysisResult.mode);
    const today = new Date().toLocaleString('vi-VN');

    // Recommendation Text Logic
    let recommendation = "";
    const hasMode = analysisResult.mode.length > 0 && !isNaN(analysisResult.mode[0].average);
    
    if (hasMode) {
        const ranges = analysisResult.mode.map(m => m.range).join(' hoặc ');
        recommendation = `ĐỀ XUẤT GIÁ THẦU HỢP LÝ:\n- Khoảng giá tối ưu: ${ranges}\n- Lý do: Đây là khoảng giá xuất hiện nhiều nhất trong dữ liệu (Giá thị trường phổ biến).`;
    } else {
        recommendation = `ĐỀ XUẤT GIÁ THẦU HỢP LÝ:\n- Giá trị tham khảo: Khoảng ${analysisResult.mean.toFixed(2)}\n- Lý do: Dữ liệu phân tán đều, nên sử dụng giá trị trung bình.`;
    }

    const reportContent = `
BÁO CÁO PHÂN TÍCH DỮ LIỆU
Ngày tạo: ${today}
----------------------------------------

${recommendation}

----------------------------------------
CHI TIẾT KẾT QUẢ TỔNG HỢP:
- Tổng số lượng mẫu: ${analysisResult.count}
- Giá trị nhỏ nhất: ${analysisResult.min.toLocaleString()}
- Giá trị lớn nhất: ${analysisResult.max.toLocaleString()}
- Giá trị trung bình: ${analysisResult.mean.toFixed(2)}
- Giá trị phổ biến (Mode): ${modeText}

PHÂN PHỐI TẦN SUẤT:
${analysisResult.histogram.map(item => `${item.name.padEnd(15)}: ${item.count}`).join('\n')}

----------------------------------------
Được tạo bởi Chuyên gia Phân tích Dữ liệu (Contact: PhanHuy)
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Bao_cao_Gia_thau_${Date.now()}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };


  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 font-sans p-4 sm:p-6 lg:p-8">
      <GuideModal isOpen={isGuideOpen} onClose={() => setIsGuideOpen(false)} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)}
        accessPassword={accessPassword}
        setAccessPassword={setAccessPassword}
        userApiKey={userApiKey}
        setUserApiKey={setUserApiKey}
      />
      
      <div className="max-w-7xl mx-auto">
        
        {/* Header Bar with Help and Settings Button */}
        <div className="flex justify-end mb-4 gap-3">
          <button
            onClick={() => setIsGuideOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 rounded-full border border-slate-600 transition-all shadow-sm text-sm font-bold"
          >
            <QuestionMarkCircleIcon className="w-5 h-5" />
            Hướng dẫn
          </button>
          
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-indigo-400 rounded-full border border-slate-600 transition-all shadow-sm text-sm font-bold relative"
            title="Cấu hình"
          >
            <Cog6ToothIcon className="w-5 h-5" />
            {(accessPassword || userApiKey) && (
                <span className="absolute top-0 right-0 -mt-1 -mr-1 w-3 h-3 bg-green-500 rounded-full border border-slate-900"></span>
            )}
          </button>
        </div>

        {/* Install Banner/Button - Only visible if installable */}
        {installPrompt && (
          <div className="mb-8 p-5 bg-gradient-to-r from-cyan-950 to-blue-950 rounded-2xl border border-cyan-800 flex flex-col sm:flex-row items-center justify-between shadow-xl gap-5 relative overflow-hidden group">
            {/* Decorative glow */}
            <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-cyan-500/20 rounded-full blur-2xl group-hover:bg-cyan-400/30 transition-all"></div>
            
            <div className="flex items-center gap-4 relative z-10">
              <div className="p-3 bg-cyan-500/20 rounded-xl text-cyan-300 ring-1 ring-cyan-500/30">
                <DownloadIcon className="w-8 h-8" />
              </div>
              <div>
                <h3 className="font-bold text-xl text-white">Cài đặt phần mềm vào máy</h3>
                <p className="text-sm text-cyan-200/80 mt-1">Chạy độc lập trên Desktop, không cần mạng Internet. Nhấn cài đặt ngay.</p>
              </div>
            </div>
            <button 
              onClick={handleInstallClick}
              className="relative z-10 px-6 py-3 bg-white text-cyan-900 font-bold rounded-xl hover:bg-cyan-50 transition-transform active:scale-95 shadow-lg whitespace-nowrap w-full sm:w-auto flex items-center justify-center gap-2"
            >
              <DownloadIcon className="w-5 h-5" />
              Cài đặt ngay
            </button>
          </div>
        )}

        <header className="text-center mb-10">
          <div className="inline-flex items-center justify-center gap-4 mb-3">
             <div className="p-2 bg-cyan-900/30 rounded-2xl border border-cyan-800/50">
               <ChartIcon className="w-10 h-10 text-cyan-400" />
             </div>
             <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white">
              Chuyên gia Phân tích Dữ liệu
            </h1>
          </div>
          <p className="mt-2 text-lg text-slate-400 max-w-2xl mx-auto">
            Nhập số liệu thầu/giá để tìm ra mức giá hợp lý nhất. (Contact: PhanHuy)
          </p>
        </header>

        <main>
          {/* Gemini AI Synonym Search Section */}
          <div className="bg-indigo-950/30 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-indigo-800/50 mb-8 relative overflow-hidden">
             <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
             
             <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-indigo-200 flex items-center gap-2">
                        <SparklesIcon className="w-6 h-6 text-indigo-400" />
                        Tra cứu tên tương đương (AI)
                    </h3>
                    <p className="text-indigo-200/70 mt-1 text-sm">Nhập tên thuốc/vật tư để AI tìm các tên gọi khác thường dùng trong thầu.</p>
                  </div>
                  
                  {/* Quick status indicator */}
                  <div className={`text-xs px-3 py-1 rounded-full border ${
                      (userApiKey || verifyAccess(accessPassword)) 
                      ? "border-green-500/30 bg-green-900/30 text-green-300" 
                      : "border-slate-500/30 bg-slate-900/30 text-slate-400"
                  }`}>
                    {(userApiKey || verifyAccess(accessPassword)) ? "Đã kết nối AI" : "Chưa kết nối"}
                  </div>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-grow">
                        <input 
                            type="text"
                            value={productSearchTerm}
                            onChange={(e) => setProductSearchTerm(e.target.value)}
                            placeholder="Ví dụ: Que thử đường huyết..."
                            className="w-full p-3 bg-slate-900/80 border border-indigo-700/50 rounded-xl text-white placeholder-slate-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
                            onKeyDown={(e) => e.key === 'Enter' && handleAiSearch()}
                        />
                    </div>
                    <button 
                        onClick={handleAiSearch}
                        disabled={isAiLoading || !productSearchTerm.trim()}
                        className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap"
                    >
                        {isAiLoading ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <SparklesIcon className="w-5 h-5" />
                        )}
                        Tìm kiếm AI
                    </button>
                </div>

                {/* AI Results Area */}
                {aiError && (
                    <div className="mt-4 text-red-400 text-sm bg-red-900/20 p-3 rounded-lg border border-red-900/50 flex items-center gap-2">
                        <AlertIcon className="w-5 h-5 flex-shrink-0" />
                        <span>{aiError}</span>
                    </div>
                )}

                {synonymResults.length > 0 && (
                    <div className="mt-6 animate-fade-in">
                        <p className="text-sm font-semibold text-indigo-300 mb-3 uppercase tracking-wider">Các tên gọi tương tự tìm thấy:</p>
                        <div className="flex flex-wrap gap-2">
                            {synonymResults.map((item, index) => (
                                <div key={index} className="bg-indigo-900/50 hover:bg-indigo-800/70 border border-indigo-700/50 text-indigo-100 px-4 py-2 rounded-lg transition-colors select-all cursor-pointer" title="Click để chọn văn bản">
                                    {item}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
             </div>
          </div>


          {/* Main Analysis Section */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700">
            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-end">
                <label htmlFor="data-input" className="text-lg font-bold text-white flex items-center gap-2">
                  <div className="w-1 h-6 bg-cyan-500 rounded-full"></div>
                  Nhập dữ liệu (Giá/Số lượng)
                </label>
                <button 
                  onClick={() => setInputText('')}
                  className="text-sm text-slate-400 hover:text-white underline decoration-slate-600 hover:decoration-white transition-all"
                >
                  Xóa trắng
                </button>
              </div>
              
              <textarea
                id="data-input"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Ví dụ: 1000000, 1200000, 1500000..."
                rows={6}
                className="w-full p-4 bg-slate-900/80 border border-slate-600 rounded-xl text-slate-200 text-lg focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all duration-200 resize-y font-mono shadow-inner"
              />
              
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-2">
                <p className="text-sm text-slate-500 italic hidden sm:block">
                  * Hỗ trợ copy từ Excel hoặc nhập tay.
                </p>
                <button
                  onClick={handleAnalyze}
                  disabled={isLoading}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-lg rounded-xl shadow-lg hover:shadow-cyan-500/20 hover:from-cyan-500 hover:to-blue-500 disabled:from-slate-700 disabled:to-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-3 transform active:scale-95"
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <ChartIcon className="w-6 h-6" />
                      Phân tích ngay
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="mt-8 bg-red-900/20 border border-red-500/50 text-red-200 px-6 py-4 rounded-xl flex items-center gap-4 shadow-lg animate-pulse" role="alert">
              <div className="p-2 bg-red-500/20 rounded-full text-red-500">
                <AlertIcon className="w-6 h-6"/>
              </div>
              <span className="font-medium text-lg">{error}</span>
            </div>
          )}

          {analysisResult && (
            <div className="mt-10 animate-fade-in pb-10">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-cyan-400 rounded-full"></div>
                  <h2 className="text-3xl font-bold text-white">Kết quả Phân tích</h2>
                </div>
                <button 
                  onClick={handleExportReport}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg border border-slate-500 flex items-center gap-2 transition-colors shadow-sm"
                >
                  <DocumentArrowDownIcon className="w-5 h-5" />
                  Lưu báo cáo về máy
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5 mb-8">
                <StatCard title="Tổng số lượng" value={analysisResult.count} icon={<HashIcon />} />
                <StatCard title="Giá trị nhỏ nhất" value={analysisResult.min.toLocaleString()} icon={<UpDownIcon orientation="down" />} />
                <StatCard title="Giá trị lớn nhất" value={analysisResult.max.toLocaleString()} icon={<UpDownIcon orientation="up" />} />
                <StatCard title="Giá trị trung bình" value={analysisResult.mean.toFixed(2)} icon={<SigmaIcon />} />
                <StatCard title="Phổ biến nhất (Mode)" value={formatModeValue(analysisResult.mode)} icon={<TrendingUpIcon />} />
              </div>

              {/* Recommendation Section - Highlighting Best Bid */}
              <RecommendationSection result={analysisResult} />

              <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-xl p-6 border border-slate-700">
                 <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <ChartIcon className="w-5 h-5 text-cyan-400"/>
                    Biểu đồ Phân phối
                 </h3>
                 <div className="h-[400px] w-full">
                    <HistogramChart data={analysisResult.histogram} />
                 </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
