
import React, { useState } from 'react';
import { XMarkIcon, ComputerDesktopIcon, ChartIcon, DownloadIcon } from './Icons';

interface GuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const GuideModal: React.FC<GuideModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'install' | 'usage'>('install');

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

        {/* Tabs */}
        <div className="flex border-b border-slate-700">
          <button
            className={`flex-1 py-3 px-4 text-sm font-bold text-center transition-colors ${activeTab === 'install' ? 'bg-cyan-900/30 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            onClick={() => setActiveTab('install')}
          >
            1. Cài đặt vào máy
          </button>
          <button
            className={`flex-1 py-3 px-4 text-sm font-bold text-center transition-colors ${activeTab === 'usage' ? 'bg-cyan-900/30 text-cyan-400 border-b-2 border-cyan-400' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
            onClick={() => setActiveTab('usage')}
          >
            2. Cách sử dụng
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 text-slate-300 space-y-4">
          {activeTab === 'install' ? (
            <div className="space-y-6">
              <div className="bg-cyan-900/20 p-4 rounded-lg border border-cyan-800/50">
                <h4 className="font-bold text-cyan-200 mb-2 flex items-center gap-2">
                   <ComputerDesktopIcon className="w-5 h-5" />
                   Dùng riêng biệt, không cần vào web?
                </h4>
                <p className="text-sm mb-2">
                  Hoàn toàn được! Công nghệ này hoạt động giống như bạn tải Zalo hay Chrome về máy.
                </p>
                <ul className="list-disc pl-5 text-sm space-y-1">
                    <li>Bạn chỉ cần vào link này <strong>1 lần duy nhất</strong> để cài đặt.</li>
                    <li>Sau khi cài, một biểu tượng (Icon) sẽ xuất hiện trên màn hình Desktop của bạn.</li>
                    <li>Từ lần sau, bạn mở nó từ Desktop. Nó sẽ chạy trong cửa sổ riêng (giống phần mềm), không còn thanh địa chỉ web và <strong>không cần mạng Internet</strong>.</li>
                </ul>
              </div>

              <div className="space-y-4">
                <h4 className="font-bold text-white">Các bước cài ra Desktop:</h4>
                
                <div className="flex gap-4 items-start">
                  <div className="bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">1</div>
                  <div>
                    <p className="mb-2">Tìm nút <strong>"Cài đặt ngay"</strong> màu trắng ở trang chính và bấm vào.</p>
                    <p className="text-sm text-slate-400 italic">Nếu không thấy nút đó, hãy làm theo bước 2.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">2</div>
                  <div>
                    <p className="mb-2">Nhìn lên góc trên cùng bên phải của trình duyệt, bấm vào biểu tượng máy tính <DownloadIcon className="w-4 h-4 inline"/> hoặc dấu 3 chấm.</p>
                  </div>
                </div>

                <div className="flex gap-4 items-start">
                  <div className="bg-slate-700 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">3</div>
                  <div>
                    <p>Chọn dòng chữ <strong>"Cài đặt Chuyên gia Phân tích..."</strong> hoặc <strong>"Install App"</strong>.</p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
               <div className="space-y-4">
                <h4 className="font-bold text-white text-lg">Cách nhập số liệu</h4>
                <p>Bạn có thể nhập dãy số theo bất kỳ cách nào bạn muốn, phần mềm đủ thông minh để hiểu:</p>
                
                <ul className="list-disc pl-5 space-y-2 text-slate-300">
                  <li><span className="text-cyan-400">Cách 1:</span> Copy từ Excel và dán vào.</li>
                  <li><span className="text-cyan-400">Cách 2:</span> Nhập các số cách nhau bằng dấu phẩy (ví dụ: 10, 20, 30).</li>
                  <li><span className="text-cyan-400">Cách 3:</span> Nhập mỗi số một dòng.</li>
                </ul>

                <div className="bg-slate-900 p-4 rounded border border-slate-700 font-mono text-sm text-slate-400 mt-2">
                  Ví dụ hợp lệ:<br/>
                  150<br/>
                  200, 300<br/>
                  5.5 10.2
                </div>
              </div>

              <div className="space-y-2">
                 <h4 className="font-bold text-white text-lg">Xuất báo cáo</h4>
                 <p>Sau khi có kết quả, bạn có thể bấm nút <strong>"Lưu báo cáo"</strong> để tải về máy một file văn bản chứa toàn bộ kết quả thống kê, giúp bạn dễ dàng lưu trữ hoặc gửi email.</p>
              </div>
            </div>
          )}
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
