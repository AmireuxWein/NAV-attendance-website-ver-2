import { Shield, Trash2 } from 'lucide-react';
import { Admin, Settings } from '../../contexts/DataContext';

interface AdminManagerProps {
  admins: Admin[];
  addAdmin: (email: string) => void;
  removeAdmin: (email: string) => void;
  settings: Settings;
}

export function AdminManager({ admins, addAdmin, removeAdmin, settings }: AdminManagerProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 custom-shadow">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Shield size={20} className="text-secondary shrink-0" />
          <h3 className="text-lg sm:text-xl font-bold text-on-surface truncate">Quản lý Huynh trưởng (Admins)</h3>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="email"
          placeholder="Nhập email huynh trưởng..."
          className="flex-1 bg-surface-container-low border-none rounded-2xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none w-full"
          id="admin-email-input"
        />
        <button
          onClick={() => {
            const input = document.getElementById('admin-email-input') as HTMLInputElement;
            if (input && input.value) {
              addAdmin(input.value);
              input.value = '';
            }
          }}
          className="bg-secondary text-on-secondary px-6 py-3 rounded-2xl text-sm font-bold shadow-lg shadow-secondary/20 hover:opacity-90 active:scale-95 transition-all w-full sm:w-auto"
        >
          Thêm
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
              <Shield size={14} className="text-secondary" />
            </div>
            <div className="truncate">
              <h4 className="text-sm font-bold text-on-surface truncate">tantaitanthoi@gmail.com</h4>
              <p className="text-[10px] text-tertiary font-bold tracking-widest uppercase">Admin gốc</p>
            </div>
          </div>
        </div>
        {admins.filter(a => a.email !== 'tantaitanthoi@gmail.com').map(admin => (
          <div key={admin.id} className="flex items-center justify-between p-3 rounded-xl border border-outline-variant/30 bg-surface group hover:border-error/20 transition-all">
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold text-on-surface-variant">{admin.email.charAt(0).toUpperCase()}</span>
              </div>
              <div className="truncate">
                <h4 className="text-sm font-bold text-on-surface truncate pr-2">{admin.email}</h4>
              </div>
            </div>
            <button
              onClick={() => {
                if (settings.requireDeleteConfirm) {
                  if (window.confirm('Bạn có chắc chắn muốn xóa quyền huynh trưởng này?')) {
                    removeAdmin(admin.email);
                  }
                } else {
                  removeAdmin(admin.email);
                }
              }}
              className="text-outline hover:text-error opacity-0 group-hover:opacity-100 transition-all"
              title="Xóa quyền"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
