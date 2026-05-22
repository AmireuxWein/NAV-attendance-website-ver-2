import { Cake, X } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { Student } from '../../contexts/DataContext';

interface AllBirthdaysModalProps {
  students: Student[];
  onClose: () => void;
  todayDateObj: Date;
  getMonthDay: (dob: string) => { m: number, d: number };
}

export function AllBirthdaysModal({ students, onClose, todayDateObj, getMonthDay }: AllBirthdaysModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-surface-container-lowest rounded-3xl p-6 w-full max-w-2xl max-h-[90vh] flex flex-col custom-shadow"
      >
        <div className="flex justify-between items-center mb-6 border-b border-outline-variant/30 pb-4">
          <div className="flex items-center gap-3">
            <Cake className="text-tertiary" size={24} />
            <h2 className="text-xl font-bold text-on-surface">Toàn bộ sinh nhật khóa sinh</h2>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-surface-container hover:bg-surface-container-high flex items-center justify-center transition-colors"
          >
            <X size={20} className="text-on-surface-variant" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-3 pb-4">
          {students
            .slice()
            .sort((a, b) => {
              const dateA = getMonthDay(a.dob);
              const dateB = getMonthDay(b.dob);
              if (dateA.m !== dateB.m) return dateA.m - dateB.m;
              return dateA.d - dateB.d;
            })
            .map((p) => {
              const { d, m } = getMonthDay(p.dob);
              const isToday = d === todayDateObj.getDate() && m === (todayDateObj.getMonth() + 1);

              return (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low border border-transparent hover:border-outline-variant/30 transition-all">
                  {p.avatar ? (
                    <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-outline-variant" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-surface-container border border-outline-variant flex items-center justify-center text-outline">
                      {p.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1">
                    <h4 className="font-bold text-on-surface text-sm">{p.name}</h4>
                    <div className="flex gap-2 text-xs text-on-surface-variant font-medium mt-0.5">
                      <span>{p.group}</span>
                      {p.dh && (
                        <>
                          <span>•</span>
                          <span>PD: {p.dh}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right whitespace-nowrap">
                    <span className={cn("block text-base font-bold", isToday ? "text-tertiary" : "text-on-surface")}>{p.dob}</span>
                    {isToday && <span className="text-[10px] uppercase font-bold text-tertiary tracking-wider bg-tertiary/10 px-2 py-0.5 rounded-full inline-block mt-1">Hôm nay</span>}
                  </div>
                </div>
              );
            })}
        </div>
      </motion.div>
    </div>
  );
}
