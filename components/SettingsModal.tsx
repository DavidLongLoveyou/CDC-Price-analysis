
import React, { useState, useEffect } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon, SparklesIcon } from './Icons';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  accessPassword: string;
  setAccessPassword: (val: string) => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  accessPassword,
  setAccessPassword,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [localPass, setLocalPass] = useState(accessPassword);

  // Sync internal state when props change or modal opens
  useEffect(() => {
    if (isOpen) {
      setLocalPass(accessPassword);
    }
  }, [isOpen, accessPassword]);

  const handleSave = () => {
    setAccessPassword(localPass);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-slate-800 w-full max-w-md rounded-xl border border-slate-600 shadow-2xl flex flex-col overflow-hidden animate-fade-in">
        
        <div className="flex items-center justify-between p-4 border-b border-slate-700 bg-slate-900/50">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <SparklesIcon className="w-5 h-5 text-indigo-400" />
            Cấu hình AI
          </h3>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-lg">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-300">
              Mã truy cập đặc biệt
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={localPass}
                onChange={(e) => setLocalPass(e.target.value)}
                placeholder="Nhập mã bảo mật..."
                className="w-full p-3 pr-10 bg-slate-900 border border-slate-600 rounded-lg text-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeSlashIcon className="w-5 h-5" /> : <EyeIcon className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-xs text-slate-500">
              Nhập mã nội bộ để kích hoạt các tính năng nâng cao (AI).
            </p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-700 bg-slate-900/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 text-slate-300 hover:text-white font-medium hover:bg-slate-800 rounded-lg transition-colors"
          >
            Hủy bỏ
          </button>
          <button 
            onClick={handleSave}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg transition-colors shadow-lg"
          >
            Lưu cài đặt
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;
