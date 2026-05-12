import React, { useState, useMemo, useCallback } from 'react';
import Cropper from 'react-easy-crop';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: any
): Promise<string> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  canvas.width = 150
  canvas.height = 150

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    150,
    150
  )

  return canvas.toDataURL('image/jpeg', 0.6)
}
import {
  Search,
  Filter,
  UserPlus,
  Smile,
  Leaf,
  Eye,
  QrCode,
  Edit2,
  Trash2,
  X,
  Camera,
  ArrowDown
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useData, Student } from '../contexts/DataContext';
import { cn } from '../lib/utils';

export default function Participants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const { students, todaysLogs, deleteStudent, addStudent, updateStudent, settings, fetchLastLogForStudent } = useData();

  const groups = useMemo(() => {
    const defaultOrder = ['Sen Non', 'Sen Hồng', 'Sen Xanh'];
    const extractedGroups = Array.from(new Set(students.map(s => s.group))).filter((g): g is string => !!g);

    extractedGroups.sort((a, b) => {
      const indexA = defaultOrder.indexOf(a);
      const indexB = defaultOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
    });

    // Always include defaults if they are missing from extraction
    defaultOrder.forEach(g => {
      if (!extractedGroups.includes(g)) extractedGroups.push(g);
    });

    return ['all', ...extractedGroups];
  }, [students]);

  const formGroups = useMemo(() => groups.filter(g => g !== 'all'), [groups]);

  const [modalState, setModalState] = useState<'view' | 'qr' | 'edit' | 'add' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', dh: '', group: 'Sen Non', phone: '', dob: '', joinDate: '' });
  const [lastLog, setLastLog] = useState<any>(null);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleOpenModal = (type: 'view' | 'qr' | 'edit' | 'add', student?: Student) => {
    setSelectedStudent(student || null);
    setModalState(type);
    if (type === 'edit' && student) {
      setFormData({ name: student.name, dh: student.dh, group: student.group, phone: student.phone, dob: student.dob, joinDate: student.joinDate || '' });
    } else if (type === 'add') {
      setFormData({ name: '', dh: '', group: 'Sen Non', phone: '', dob: '', joinDate: '' });
    }

    if (type === 'view' && student) {
      fetchLastLogForStudent(student.id).then(log => setLastLog(log));
    } else {
      setLastLog(null);
    }
  };

  const handleCloseModal = () => {
    setModalState(null);
    setSelectedStudent(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalState === 'edit' && selectedStudent) {
      updateStudent(selectedStudent.id, formData);
    } else if (modalState === 'add') {
      addStudent({ ...formData, avatar: null });
    }
    handleCloseModal();
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedStudent) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 20MB");
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageToCrop(event.target?.result as string);
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels || !selectedStudent) return;
    try {
      const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
      await updateStudent(selectedStudent.id, { avatar: croppedImageBase64 });
      setSelectedStudent({ ...selectedStudent, avatar: croppedImageBase64 });
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi lưu ảnh. Vui lòng thử lại.');
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const attendedIds = new Set(todaysLogs.map(log => log.studentId));

  const filteredStudents = students.filter(s => {
    const isAttended = attendedIds.has(s.id);

    // Search term filter
    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.id.includes(searchTerm);

    // Status filter
    const matchesStatus = filterStatus === 'all' ? true :
      (filterStatus === 'attended' ? isAttended : !isAttended);

    // Group filter
    const matchesGroup = filterGroup === 'all' ? true : s.group === filterGroup;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em] text-outline uppercase mb-2">Management Portal / Participants</p>
        <h2 className="text-3xl font-bold text-on-surface">Quản lý Khóa sinh</h2>
      </div>

      <div className="flex flex-col sm:flex-row bg-surface-container-lowest rounded-3xl p-4 sm:p-6 custom-shadow mb-8 gap-4 items-stretch sm:items-center justify-between">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 flex-1">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors" size={18} />
            <input
              type="text"
              placeholder="Tìm kiếm..."
              className="w-full bg-surface-container-low border-none rounded-2xl pl-12 pr-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0 hide-scrollbar scroll-smooth">
            <div className="relative group shrink-0">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="bg-surface-container-low pl-4 pr-10 py-3 border-none outline-none rounded-2xl text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-high transition-colors appearance-none cursor-pointer whitespace-nowrap"
              >
                <option value="all">Tất cả trạng thái</option>
                <option value="attended">Đã điểm danh</option>
                <option value="absent">Chưa điểm danh</option>
              </select>
              <ArrowDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            </div>
            <div className="relative group shrink-0">
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="bg-surface-container-low pl-4 pr-10 py-3 border-none outline-none rounded-2xl text-[11px] font-bold uppercase tracking-wider text-on-surface-variant hover:bg-surface-container-high transition-colors appearance-none cursor-pointer whitespace-nowrap"
              >
                {groups.map(g => (
                  <option key={g} value={g}>{g === 'all' ? 'Tất cả nhóm' : g}</option>
                ))}
              </select>
              <ArrowDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
            </div>
          </div>
        </div>
        <button
          onClick={() => handleOpenModal('add')}
          className="bg-primary text-on-primary px-6 sm:px-8 py-3.5 rounded-2xl sm:rounded-full text-[11px] font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
        >
          <UserPlus size={18} />
          <span>THÊM KHÓA SINH</span>
        </button>
      </div>

      <div className="flex-1 overflow-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-4 text-[10px] font-bold tracking-widest text-outline uppercase border-b border-outline-variant">
          <div className="col-span-3">Thông tin Khóa sinh</div>
          <div className="col-span-2 text-center">Nhóm</div>
          <div className="col-span-2 text-center">Liên hệ</div>
          <div className="col-span-1 text-center">Số buổi</div>
          <div className="col-span-2 text-center">Điểm danh</div>
          <div className="col-span-2 text-right">Thao tác</div>
        </div>

        <div className="space-y-3 sm:space-y-4 py-4">
          {filteredStudents.map((p, i) => {
            const isAttended = attendedIds.has(p.id);
            return (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-6 sm:grid sm:grid-cols-12 flex flex-col gap-4 sm:gap-4 items-stretch sm:items-center group hover:shadow-xl hover:shadow-primary/5 transition-all border border-outline-variant/10 hover:border-primary/20"
              >
                {/* Info & Avatar */}
                <div className="sm:col-span-3 flex items-center gap-4">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center text-outline shrink-0 shadow-inner">
                    {p.avatar ? (
                      <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Smile size={24} className="opacity-40" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-on-surface truncate leading-tight">{p.name}</h4>
                    <p className="text-[11px] text-outline font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">
                      <Leaf size={10} className="text-primary/60" /> {p.dh || 'Chưa có pháp danh'}
                    </p>
                  </div>
                </div>

                {/* Mobile: Row for Group & Sessions */}
                <div className="sm:hidden flex justify-between items-center bg-surface-container-low/50 p-3 rounded-xl">
                  <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold border border-primary/10">
                    {p.group}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold text-outline uppercase tracking-tight">Số buổi:</span>
                    <span className="text-sm font-bold text-on-surface">{p.sessions}</span>
                  </div>
                </div>

                {/* Desktop columns */}
                <div className="hidden sm:col-span-2 sm:flex justify-center">
                  <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold border border-primary/10 whitespace-nowrap">
                    {p.group}
                  </span>
                </div>

                <div className="hidden sm:col-span-2 sm:block text-center">
                  <p className="text-sm font-bold text-on-surface whitespace-nowrap">{p.phone}</p>
                  <p className="text-[11px] text-outline font-medium whitespace-nowrap">{p.dob}</p>
                </div>

                <div className="hidden sm:col-span-1 sm:block text-center text-sm font-bold text-on-surface-variant">
                  {p.sessions}
                </div>

                {/* Attendance Status */}
                <div className="sm:col-span-2 flex sm:justify-center items-center">
                  <div className={cn(
                    "flex items-center gap-2 px-3 py-1.5 rounded-full border w-full sm:w-auto sm:justify-center",
                    isAttended ? "bg-primary/5 border-primary/20 text-primary" : "bg-outline-variant/5 border-outline-variant/20 text-outline-variant"
                  )}>
                    <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", isAttended ? "bg-primary" : "bg-outline-variant")} />
                    <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none">
                      {isAttended ? 'Đã điểm danh' : 'Chưa điểm danh'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="sm:col-span-2 flex justify-between sm:justify-end gap-2 bg-surface-container-low/30 sm:bg-transparent p-1 sm:p-0 rounded-xl">
                  <div className="flex gap-1">
                    <button onClick={() => handleOpenModal('view', p)} className="p-2 sm:p-3 hover:bg-white rounded-lg transition-colors text-outline hover:text-primary">
                      <Eye size={18} />
                    </button>
                    <button onClick={() => handleOpenModal('qr', p)} className="p-2 sm:p-3 hover:bg-white rounded-lg transition-colors text-outline hover:text-primary">
                      <QrCode size={18} />
                    </button>
                    <button onClick={() => handleOpenModal('edit', p)} className="p-2 sm:p-3 hover:bg-white rounded-lg transition-colors text-outline hover:text-secondary">
                      <Edit2 size={18} />
                    </button>
                  </div>

                  <button
                    className="p-2 sm:p-3 hover:bg-error/10 rounded-lg transition-colors text-outline hover:text-error"
                    onClick={() => {
                      if (settings.requireDeleteConfirm) {
                        if (window.confirm('Bạn có chắc chắn muốn xóa khóa sinh này?')) {
                          deleteStudent(p.id);
                        }
                      } else {
                        deleteStudent(p.id);
                      }
                    }}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            )
          })}

          {filteredStudents.length === 0 && (
            <div className="py-20 text-center flex flex-col items-center">
              <div className="w-16 h-16 bg-surface-container rounded-full flex items-center justify-center text-outline/30 mb-4 outline outline-4 outline-outline-variant/10">
                <Search size={32} />
              </div>
              <h3 className="text-lg font-bold text-on-surface">Không tìm thấy kết quả</h3>
              <p className="text-sm text-on-surface-variant max-w-xs mx-auto mt-2 text-center">Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc để tìm thấy khóa sinh bạn cần.</p>
            </div>
          )}

          <div className="py-12 flex flex-col items-center justify-center opacity-20 select-none">
            <Leaf size={40} className="text-outline mb-3" />
            <p className="text-[10px] uppercase font-black tracking-[0.3em]">Thanh tịnh - Niềm vui</p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {modalState && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-surface-container-lowest rounded-3xl p-6 md:p-8 shadow-2xl w-full max-w-md relative"
            >
              <button
                onClick={handleCloseModal}
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
                        onChange={handleUploadAvatar}
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
                  <form onSubmit={handleFormSubmit} className="space-y-4">
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
                    onClick={handleCropConfirm}
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
    </motion.div>
  );
}
