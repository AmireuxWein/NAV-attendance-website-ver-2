import React from 'react';
import { Smile, X, Camera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Cropper from 'react-easy-crop';
import { Student } from '../../contexts/DataContext';

interface FormData {
  name: string;
  dh: string;
  group: string;
  phone: string;
  dob: string;
  joinDate: string;
}

interface ParticipantModalsProps {
  modalState: 'view' | 'qr' | 'edit' | 'add' | null;
  selectedStudent: Student | null;
  formData: FormData;
  setFormData: (data: FormData) => void;
  lastLog: any;
  imageToCrop: string | null;
  crop: { x: number, y: number };
  setCrop: (crop: { x: number, y: number }) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onUploadAvatar: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onCropComplete: (croppedArea: any, croppedAreaPixels: any) => void;
  onCropConfirm: () => void;
  setImageToCrop: (img: string | null) => void;
  formGroups: string[];
}

export function ParticipantModals({
  modalState,
  selectedStudent,
  formData,
  setFormData,
  lastLog,
  imageToCrop,
  crop,
  setCrop,
  zoom,
  setZoom,
  onClose,
  onSubmit,
  onUploadAvatar,
  onCropComplete,
  onCropConfirm,
  setImageToCrop,
  formGroups
}: ParticipantModalsProps) {
  return (
    <AnimatePresence>
      {modalState && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-md relative"
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 bg-surface-container hover:bg-surface-container-high rounded-full transition-colors text-on-surface-variant"
            >
              <X size={20} />
            </button>

            {modalState === 'view' && selectedStudent && (
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-6">Thông tin chi tiết</h3>
                <div className="flex flex-col items-center mb-6">
                  <div className="w-24 h-24 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center text-outline mb-3 relative group">
                    {selectedStudent.avatar ? <img src={selectedStudent.avatar} alt={selectedStudent.name} className="w-full h-full object-cover" /> : <Smile size={48} />}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                      <Camera className="text-white" size={24} />
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 opacity-0 cursor-pointer"
                      onChange={onUploadAvatar}
                      title="Đổi ảnh đại diện"
                    />
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold border border-primary/10">
                    {selectedStudent.group}
                  </span>
                </div>
                <div className="space-y-4">
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">Họ và tên</span>
                    <span className="text-sm font-bold text-on-surface">{selectedStudent.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">Pháp danh</span>
                    <span className="text-sm font-bold text-on-surface">{selectedStudent.dh || '---'}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">Số điện thoại</span>
                    <span className="text-sm font-bold text-on-surface">{selectedStudent.phone || '---'}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">Ngày sinh</span>
                    <span className="text-sm font-bold text-on-surface">{selectedStudent.dob || '---'}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">Ngày tham gia khóa tu</span>
                    <span className="text-sm font-bold text-on-surface">{selectedStudent.joinDate || '---'}</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/30 pb-2">
                    <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">Số buổi tham gia</span>
                    <span className="text-sm font-bold text-primary">{selectedStudent.sessions}</span>
                  </div>
                  <div className="flex justify-between pb-2 items-center">
                    <span className="text-xs font-bold text-outline-variant uppercase tracking-wider">Lần điểm danh cuối</span>
                    <span className="text-sm font-bold text-tertiary">
                      {(() => {
                        if (lastLog) {
                          return `${new Date(lastLog.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ngày ${new Date(lastLog.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`;
                        }
                        return 'Chưa tham gia / Đang tải...';
                      })()}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {modalState === 'qr' && selectedStudent && (
              <div className="text-center pb-4">
                <h3 className="text-xl font-bold text-on-surface mb-6">Mã QR Điểm Danh</h3>
                <div className="flex justify-center mb-6">
                  <img src={selectedStudent.qr_link} alt="QR Code" className="w-56 h-56 rounded-xl border border-outline-variant p-2 bg-white" />
                </div>
                <h4 className="font-bold text-xl text-on-surface">{selectedStudent.name}</h4>
                <p className="text-sm text-outline font-medium mt-1">{selectedStudent.dh}</p>
              </div>
            )}

            {(modalState === 'add' || modalState === 'edit') && (
              <div>
                <h3 className="text-xl font-bold text-on-surface mb-6">
                  {modalState === 'add' ? 'Thêm Khóa Sinh' : 'Sửa Thông Tin'}
                </h3>
                <form onSubmit={onSubmit} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 block">Họ và tên</label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 block">Pháp danh</label>
                    <input
                      type="text"
                      value={formData.dh}
                      onChange={(e) => setFormData({ ...formData, dh: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 block">Số điện thoại</label>
                      <input
                        type="text"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 block">Ngày sinh</label>
                      <input
                        type="text"
                        placeholder="DD/MM/YYYY"
                        value={formData.dob}
                        onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                        className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 block">Ngày tham gia khóa tu</label>
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      value={formData.joinDate}
                      onChange={(e) => setFormData({ ...formData, joinDate: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase mb-1 block">Nhóm</label>
                    <select
                      value={formData.group}
                      onChange={(e) => setFormData({ ...formData, group: e.target.value })}
                      className="w-full bg-surface-container-low border border-outline-variant/50 rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none appearance-none"
                    >
                      {formGroups.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <button type="submit" className="w-full bg-primary text-white py-3 rounded-full font-bold shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all mt-8">
                    {modalState === 'add' ? 'Lưu & Khởi tạo QR' : 'Cập nhật thông tin'}
                  </button>
                </form>
              </div>
            )}
          </motion.div>
        </div>
      )}
      {imageToCrop && (
        <div className="fixed inset-0 z-[110] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="bg-surface-container-lowest rounded-3xl w-full max-w-md overflow-hidden custom-shadow"
          >
            <div className="p-6 border-b border-primary-container/10 flex justify-between items-center">
              <h3 className="text-xl font-bold text-on-surface">Cắt ảnh đại diện</h3>
              <button onClick={() => setImageToCrop(null)} className="p-2 hover:bg-surface-container-low rounded-full transition-colors">
                <X size={20} className="text-on-surface-variant" />
              </button>
            </div>

            <div className="relative w-full h-[300px] bg-black">
              <Cropper
                image={imageToCrop}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-6">
              <div className="mb-6">
                <label className="text-xs font-bold text-on-surface-variant mb-2 block">Thu phóng</label>
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full h-2 bg-surface-container-high rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => setImageToCrop(null)}
                  className="flex-1 py-3 font-bold rounded-xl border-2 border-outline-variant/30 text-on-surface-variant hover:bg-surface-container-low transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={onCropConfirm}
                  className="flex-1 py-3 font-bold rounded-xl bg-primary text-white shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
                >
                  Lưu Ảnh
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
