
import React from 'react';
import { LightBulbIcon } from './Icons';
import type { AnalysisResult } from '../types';

interface RecommendationSectionProps {
  result: AnalysisResult;
}

const RecommendationSection: React.FC<RecommendationSectionProps> = ({ result }) => {
  const { mode, mean, histogram } = result;

  // Check if we have valid modes
  const hasMode = mode.length > 0 && !isNaN(mode[0].average);

  return (
    <div className="mb-8 bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border border-emerald-500/30 rounded-2xl p-6 shadow-lg relative overflow-hidden">
      {/* Decorative background accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none"></div>

      <div className="flex flex-col md:flex-row gap-6 relative z-10">
        <div className="flex-shrink-0">
          <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 border border-emerald-500/30 shadow-inner">
            <LightBulbIcon className="w-8 h-8" />
          </div>
        </div>

        <div className="flex-1">
          <h3 className="text-xl font-bold text-white mb-2">Đề xuất Giá thầu Hợp lý</h3>
          
          <div className="space-y-4 text-slate-200">
            {hasMode ? (
              <>
                <div>
                  <p className="mb-1 text-emerald-200/80 text-sm font-semibold uppercase tracking-wider">Khoảng giá tối ưu nhất</p>
                  <div className="text-3xl md:text-4xl font-bold text-emerald-400 text-shadow">
                    {mode.map(m => m.range).join('  hoặc  ')}
                  </div>
                </div>
                
                <p className="text-base leading-relaxed">
                  <strong className="text-emerald-300">Tại sao?</strong> Dựa trên dữ liệu bạn cung cấp, đây là khoảng giá có <strong>tần suất xuất hiện nhiều nhất</strong>. 
                  Việc chọn mức giá trong khoảng này đồng nghĩa với việc bạn đang chào mức giá "thị trường" được chấp nhận rộng rãi nhất, tăng khả năng trúng thầu hoặc được chấp thuận.
                </p>
              </>
            ) : (
              <>
                <div>
                   <p className="mb-1 text-emerald-200/80 text-sm font-semibold uppercase tracking-wider">Giá trị tham khảo (Trung bình)</p>
                   <div className="text-3xl md:text-4xl font-bold text-emerald-400">
                    ~ {mean.toFixed(2)}
                  </div>
                </div>
                <p className="text-base leading-relaxed">
                  <strong className="text-yellow-300">Lưu ý:</strong> Dữ liệu của bạn phân tán quá đều (không có khoảng giá nào nổi trội). 
                  Trong trường hợp này, hãy cân nhắc sử dụng giá trị trung bình hoặc xem xét lại các yếu tố khác ngoài giá.
                </p>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RecommendationSection;
