import { X } from 'lucide-react';
import { useData } from '../contexts/DataContext';

interface SettingsModalProps {
  onClose: () => void;
}

export default function SettingsModal({ onClose }: SettingsModalProps) {
  const { settings, updateSettings } = useData();

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface-container-lowest rounded-3xl w-full max-w-md shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-on-surface">Cài đặt</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-on-surface">Giao diện (Theme)</h3>
              <p className="text-xs text-on-surface-variant mt-1">Chuyển đổi giữa chế độ Sáng và Tối</p>
            </div>
            <select
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value as 'light' | 'dark' })}
              className="bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
            >
              <option value="light">Sáng (Light)</option>
              <option value="dark">Tối (Dark)</option>
            </select>
          </div>

          <div className="flex items-center justify-between">
            <div className="pr-4">
              <h3 className="text-sm font-bold text-on-surface">Cảnh báo trước khi xóa</h3>
              <p className="text-xs text-on-surface-variant mt-1">Hiện hộp thoại xác nhận mỗi khi bạn thực hiện thao tác xóa dữ liệu</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
              <input 
                type="checkbox" 
                value="" 
                className="sr-only peer" 
                checked={settings.requireDeleteConfirm}
                onChange={(e) => updateSettings({ requireDeleteConfirm: e.target.checked })}
              />
              <div className="w-11 h-6 bg-surface-container-high peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
