
import React from 'react';
import { XMarkIcon, ComputerDesktopIcon, ChartIcon, DownloadIcon } from './Icons';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 w-full max-w-2xl rounded-xl border border-slate-600 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            Hướng dẫn sử dụng
          </h3>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-300 space-y-6">
            <div className="space-y-4">
            <h4 className="font-bold text-white text-lg">1. Cách nhập số liệu</h4>
            <p>Bạn có thể nhập dãy số theo bất kỳ cách nào bạn muốn, phần mềm đủ thông minh để hiểu:</p>
            
            <ul className="list-disc pl-5 space-y-2 text-slate-300">
                <li><span className="text-cyan-400">Copy từ Excel/Word:</span> Chỉ cần Copy và Dán (Paste) vào ô nhập.</li>
                <li><span className="text-cyan-400">Nhập tay:</span> Nhập các số cách nhau bằng dấu phẩy (10, 20) hoặc dấu cách.</li>
                <li><span className="text-cyan-400">Số thập phân:</span> Dùng dấu chấm (ví dụ: 10.5).</li>
            </ul>

            <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-400 mt-2">
                Ví dụ hợp lệ:<br/>
                150<br/>
                200, 300<br/>
                5.5 10.2
            </div>
            </div>

            <div className="space-y-2">
                <h4 className="font-bold text-white text-lg">2. Đề xuất giá thầu</h4>
                <p>Sau khi phân tích, phần mềm sẽ tự động tính toán và gợi ý cho bạn một <strong>"Khoảng giá hợp lý"</strong>. Đây là mức giá xuất hiện nhiều nhất trong dữ liệu quá khứ, giúp bạn đưa ra quyết định an toàn.</p>
            </div>

            <div className="space-y-2">
                <h4 className="font-bold text-white text-lg">3. Xuất báo cáo</h4>
                <p>Bấm nút <strong>"Lưu báo cáo về máy"</strong> để tải về file kết quả chi tiết.</p>
            </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-end">
          <button 
            onClick={onClose}
            className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-lg transition-colors"
          >
            Đã hiểu
          </button>
        </div>

      </div>
    </div>
  );
};

export default GuideModal;
