import { Smile, Leaf, Eye, QrCode, Edit2, Trash2, Search } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Student } from '../../contexts/DataContext';

interface ParticipantListProps {
  studentsWithStt: (Student & { stt: number })[];
  attendedIds: Set<string>;
  onOpenModal: (type: 'view' | 'qr' | 'edit', student: Student) => void;
  onDelete: (id: string) => void;
}

export function ParticipantList({
  studentsWithStt,
  attendedIds,
  onOpenModal,
  onDelete
}: ParticipantListProps) {
  return (
    <div className="flex-1 overflow-auto custom-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
      <div className="hidden sm:flex gap-4 px-8 py-4 text-[10px] font-bold tracking-widest text-outline uppercase border-b border-outline-variant">
        <div className="flex-1 min-w-[150px]">Thông tin Khóa sinh</div>
        <div className="shrink-0 w-[80px] text-center">Nhóm</div>
        <div className="shrink-0 w-[120px] text-center hidden lg:block">Liên hệ</div>
        <div className="shrink-0 w-[60px] text-center hidden md:block">Số buổi</div>
        <div className="shrink-0 w-[120px] text-center">Điểm danh</div>
        <div className="shrink-0 w-[180px] text-right">Thao tác</div>
      </div>

      <div className="space-y-3 sm:space-y-4 py-4">
        {studentsWithStt.map((p, i) => {
          const isAttended = attendedIds.has(p.id);
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="bg-surface-container-lowest rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-4 items-stretch sm:items-center group hover:shadow-xl hover:shadow-primary/5 transition-all border border-outline-variant/10 hover:border-primary/20"
            >
              {/* Info & Avatar */}
              <div className="flex-1 min-w-[150px] flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-surface-container-highest flex items-center justify-center text-outline shrink-0 shadow-inner">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-full h-full object-cover" />
                  ) : (
                    <Smile size={24} className="opacity-40" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="font-bold text-on-surface leading-tight break-words">{p.name}</h4>
                  <p className="text-[11px] text-outline font-bold flex items-center gap-1 mt-1 uppercase tracking-wider">
                    <Leaf size={10} className="text-primary/60 shrink-0" /> <span className="truncate">{p.dh || 'Chưa có pháp danh'}</span>
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
              <div className="hidden sm:flex shrink-0 w-[80px] justify-center">
                <span className="px-3 py-1 rounded-full bg-primary-container/20 text-primary text-[10px] font-bold border border-primary/10 whitespace-nowrap">
                  {p.group}
                </span>
              </div>

              <div className="hidden lg:block shrink-0 w-[120px] text-center">
                <p className="text-sm font-bold text-on-surface whitespace-nowrap">{p.phone}</p>
                <p className="text-[11px] text-outline font-medium whitespace-nowrap">{p.dob}</p>
              </div>

              <div className="hidden md:block shrink-0 w-[60px] text-center text-sm font-bold text-on-surface-variant">
                {p.sessions}
              </div>

              {/* Attendance Status */}
              <div className="shrink-0 w-full sm:w-[120px] flex sm:justify-center items-center">
                <div className={cn(
                  "flex items-center gap-2 px-3 py-1.5 rounded-full border w-full sm:w-auto sm:justify-center",
                  isAttended ? "bg-primary/5 border-primary/20 text-primary" : "bg-outline-variant/5 border-outline-variant/20 text-outline-variant"
                )}>
                  <div className={cn("w-1.5 h-1.5 rounded-full shrink-0 animate-pulse", isAttended ? "bg-primary" : "bg-outline-variant")} />
                  <span className="text-[10px] font-extrabold uppercase tracking-widest leading-none whitespace-nowrap">
                    {isAttended ? 'Đã điểm danh' : 'Chưa điểm danh'}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="shrink-0 w-full sm:w-[180px] flex justify-between sm:justify-end gap-2 bg-surface-container-low/30 sm:bg-transparent p-1 sm:p-0 rounded-xl">
                <div className="flex gap-1">
                  <button onClick={() => onOpenModal('view', p)} className="p-2 sm:p-3 hover:bg-white rounded-lg transition-colors text-outline hover:text-primary">
                    <Eye size={18} />
                  </button>
                  <button onClick={() => onOpenModal('qr', p)} className="p-2 sm:p-3 hover:bg-white rounded-lg transition-colors text-outline hover:text-primary">
                    <QrCode size={18} />
                  </button>
                  <button onClick={() => onOpenModal('edit', p)} className="p-2 sm:p-3 hover:bg-white rounded-lg transition-colors text-outline hover:text-secondary">
                    <Edit2 size={18} />
                  </button>
                </div>

                <button
                  className="p-2 sm:p-3 hover:bg-error/10 rounded-lg transition-colors text-outline hover:text-error"
                  onClick={() => onDelete(p.id)}
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </motion.div>
          )
        })}

        {studentsWithStt.length === 0 && (
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
  );
}
