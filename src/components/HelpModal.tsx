import { X, Users, QrCode, ClipboardList, Settings, Shield } from 'lucide-react';

interface HelpModalProps {
  onClose: () => void;
}

export default function HelpModal({ onClose }: HelpModalProps) {
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-surface-container-lowest rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
        <div className="p-6 border-b border-outline-variant/20 flex justify-between items-center">
          <h2 className="text-xl font-bold text-on-surface">Hướng dẫn sử dụng hệ thống</h2>
          <button onClick={onClose} className="p-2 hover:bg-surface-container rounded-full transition-colors">
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>
        
        <div className="p-6 max-h-[70vh] overflow-y-auto space-y-6">
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Chào mừng bạn đến với Hệ thống Quản lý khóa sinh Niềm An Vui. Dưới đây là các tính năng chính của phần mềm:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 text-primary">
                <Users size={20} />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">1. Quản lý Khóa sinh</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Thêm mới, sửa, xóa thông tin khóa sinh. Một mã QR tự động sẽ được cấp cho mỗi người để phục vụ điểm danh.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-tertiary/10 flex items-center justify-center flex-shrink-0 text-tertiary">
                <QrCode size={20} />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">2. Điểm danh mã QR</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Quét mã QR của khóa sinh để ghi nhận sự có mặt. Hệ thống tự động phát hiện nếu quét trùng 2 lần trong ngày.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-secondary/10 flex items-center justify-center flex-shrink-0 text-secondary">
                <ClipboardList size={20} />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">3. Thống kê & Báo cáo</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Theo dõi tỷ lệ chuyên cần, xem chi tiết lịch sử điểm danh theo từng ngày và xuất ra file nếu cần.</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-error/10 flex items-center justify-center flex-shrink-0 text-error">
                <Shield size={20} />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">4. Quản lý Quyền truy cập</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Phân quyền cho các Huynh trưởng khác bằng email Google. Chỉ những người có tên trong danh sách mới vào được hệ thống.</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-outline/10 flex items-center justify-center flex-shrink-0 text-outline">
                <Settings size={20} />
              </div>
              <div>
                <h3 className="font-bold text-on-surface mb-1">5. Cài đặt Cảnh báo</h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">Bạn có thể tùy chỉnh Bật/Tắt chế độ cảnh báo trước khi xóa để thao tác nhanh hơn hoặc an toàn hơn.</p>
              </div>
            </div>
          </div>
          
          <div className="bg-surface-container-low p-4 rounded-xl mt-6 border border-outline-variant/30">
            <p className="text-xs font-medium text-on-surface text-center">
              Nếu gặp khó khăn trong quá trình sử dụng, vui lòng liên hệ Admin gốc (tantaitanthoi@gmail.com).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
