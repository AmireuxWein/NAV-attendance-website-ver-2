import { Cake } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Student } from '../../contexts/DataContext';

interface BirthdayListProps {
  birthdays: Student[];
  selectedQuarter: number | 'all';
  onSelectQuarter: (q: number) => void;
  onShowAll: () => void;
  todayDateObj: Date;
  getMonthDay: (dob: string) => { m: number, d: number };
}

export function BirthdayList({
  birthdays,
  selectedQuarter,
  onSelectQuarter,
  onShowAll,
  todayDateObj,
  getMonthDay
}: BirthdayListProps) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 custom-shadow">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div className="flex items-center gap-2">
          <Cake className="text-tertiary" size={20} />
          <h3 className="text-xl font-bold text-on-surface">Sinh nhật khóa sinh</h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-surface-container p-1 rounded-full text-[10px] font-bold">
            {[1, 2, 3, 4].map((q) => (
              <button
                key={q}
                onClick={() => onSelectQuarter(q)}
                className={cn(
                  "px-3 py-1 rounded-full transition-colors",
                  selectedQuarter === q ? "bg-primary text-white" : "text-on-surface-variant hover:bg-surface-container-lowest"
                )}
              >
                QUÝ {q}
              </button>
            ))}
          </div>
          <button
            onClick={onShowAll}
            className="text-sm font-bold text-primary hover:opacity-80 whitespace-nowrap"
          >
            Xem tất cả
          </button>
        </div>
      </div>
      <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {birthdays.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-4">Không có sinh nhật nào trong quý này.</p>
        ) : (
          birthdays.map((p) => {
            const { d, m } = getMonthDay(p.dob);
            const isToday = d === todayDateObj.getDate() && m === (todayDateObj.getMonth() + 1);

            return (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-container-low transition-colors group">
                {p.avatar ? (
                  <img src={p.avatar} alt={p.name} className="w-10 h-10 rounded-full object-cover border border-outline-variant" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-surface-container-highest border border-outline-variant flex items-center justify-center text-outline">
                    {p.name.charAt(0)}
                  </div>
                )}
                <div className="flex-1">
                  <h4 className="font-bold text-on-surface">{p.name}</h4>
                  <p className="text-xs text-on-surface-variant font-medium">{p.group}</p>
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className={cn("block text-sm font-bold", isToday ? "text-tertiary" : "text-on-surface")}>{p.dob}</span>
                  {isToday && <span className="text-[10px] uppercase font-bold text-on-surface-variant tracking-wider">Hôm nay</span>}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
