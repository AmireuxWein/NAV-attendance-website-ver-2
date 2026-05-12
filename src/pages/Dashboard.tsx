import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie
} from 'recharts';
import { 
  ArrowUp, 
  ArrowDown, 
  Cake, 
  Megaphone, 
  CalendarDays, 
  Shirt, 
  Send,
  Shield,
  Trash2,
  X,
  CheckCircle2,
  Circle,
  Edit2,
  Plus,
  Check
} from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { useMemo, useState, useEffect } from 'react';
import { cn } from '../lib/utils';

// Helper to safely extract month and day
const getMonthDay = (dob: string) => {
  let m = -1, d = -1;
  if (!dob) return { m, d };
  
  if (dob.includes('/')) {
    const parts = dob.split('/');
    if (parts.length >= 2) {
      d = parseInt(parts[0], 10);
      m = parseInt(parts[1], 10);
    }
  } else if (dob.includes('-')) {
    const parts = dob.split('-');
    if (parts.length === 3) {
      if (parts[0].length === 4) {
        // YYYY-MM-DD
        m = parseInt(parts[1], 10);
        d = parseInt(parts[2], 10);
      } else {
        // DD-MM-YYYY
        d = parseInt(parts[0], 10);
        m = parseInt(parts[1], 10);
      }
    }
  }
  return { m, d };
};

export default function Dashboard() {
  const { students, todaysLogs, totalSessions, fetchLogsByDates, announcements, admins, addAdmin, removeAdmin, settings, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const todayDateObj = new Date();
  const today = new Date(todayDateObj.getTime() - todayDateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  
  const [selectedDate, setSelectedDate] = useState(today);
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [dashboardLogs, setDashboardLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      const selectedDateObj = new Date(selectedDate);
      const year = selectedDateObj.getFullYear();
      const month = selectedDateObj.getMonth();

      let firstDay = new Date(year, month, 1);
      let daysUntilSunday = (7 - firstDay.getDay()) % 7;
      let firstSunday = new Date(year, month, 1 + daysUntilSunday);

      const sundays: string[] = [];
      let currentSunday = firstSunday;
      while (currentSunday.getMonth() === month) {
        const d = new Date(currentSunday.getTime() - currentSunday.getTimezoneOffset() * 60000);
        sundays.push(d.toISOString().split('T')[0]);
        currentSunday = new Date(currentSunday.getFullYear(), currentSunday.getMonth(), currentSunday.getDate() + 7);
      }

      const yesterdayDateObj = new Date(selectedDate);
      yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
      const yesterdayStr = new Date(yesterdayDateObj.getTime() - yesterdayDateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];

      const requiredDates = Array.from(new Set([yesterdayStr, ...sundays]));
      const logs = await fetchLogsByDates(requiredDates);
      setDashboardLogs(logs);
    };
    fetchLogs();
  }, [selectedDate, fetchLogsByDates]);

  const [selectedQuarter, setSelectedQuarter] = useState<number | 'all'>(Math.ceil((new Date().getMonth() + 1) / 3));
  const [showAllBirthdaysModal, setShowAllBirthdaysModal] = useState(false);

  // Note/Announcement states
  const [newNoteContent, setNewNoteContent] = useState('');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingNoteContent, setEditingNoteContent] = useState('');

  const groups = useMemo(() => {
    const defaultOrder = ['Sen Non', 'Sen Hồng', 'Sen Xanh'];
    const extractedGroups = Array.from(new Set(students.map(s => s.group))).filter((g): g is string => !!g);
    
    // Sort extracted groups based on defaultOrder, unknown groups come after
    extractedGroups.sort((a, b) => {
      const indexA = defaultOrder.indexOf(a);
      const indexB = defaultOrder.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB; // Both in defaultOrder
      if (indexA !== -1) return -1; // a is in defaultOrder
      if (indexB !== -1) return 1; // b is in defaultOrder
      return a.localeCompare(b); // Neither in defaultOrder, sort alphabetically
    });
    
    return ['all', ...extractedGroups];
  }, [students]);

  const filteredStudents = useMemo(() => {
    if (selectedGroup === 'all') return students;
    return students.filter(s => s.group === selectedGroup);
  }, [students, selectedGroup]);

  const selectedDateAttendance = selectedDate === today ? todaysLogs : dashboardLogs.filter(log => log.date === selectedDate);
  
  const presentCount = selectedDateAttendance.filter(log => filteredStudents.some(s => s.id === log.studentId)).length;
  const totalCount = filteredStudents.length;
  const absentCount = totalCount - presentCount;
  const presentRate = totalCount > 0 ? Math.round((presentCount / totalCount) * 100) : 0;

  const yesterdayDateObj = new Date(selectedDate);
  yesterdayDateObj.setDate(yesterdayDateObj.getDate() - 1);
  const yesterdayStr = new Date(yesterdayDateObj.getTime() - yesterdayDateObj.getTimezoneOffset() * 60000).toISOString().split('T')[0];
  const yesterdayLogCount = dashboardLogs.filter(log => log.date === yesterdayStr && filteredStudents.some(s => s.id === log.studentId)).length;
  const yesterdayRate = totalCount > 0 ? Math.round((yesterdayLogCount / totalCount) * 100) : 0;
  const todayChange = presentRate - yesterdayRate;

  // Tổng số buổi
  // totalSessions is fetched from context

  // Chuyên cần nhất
  const mostDiligentStudent = useMemo(() => {
    if (filteredStudents.length === 0) return null;
    return filteredStudents.reduce((prev, current) => 
      (prev.sessions > current.sessions) ? prev : current
    );
  }, [filteredStudents]);

  const summaryStats = [
    { 
        label: 'HÔM NAY', 
        value: `${presentRate}%`, 
        change: `${todayChange > 0 ? '+' : ''}${todayChange}%`, 
        trend: todayChange >= 0 ? 'up' : 'down',
        subtext: 'So với buổi trước'
    },
    { 
        label: 'ĐÃ TỔ CHỨC', 
        value: `${totalSessions}`, 
        change: '', 
        trend: 'neutral',
        subtext: 'Tổng số buổi'
    },
    { 
        label: 'CHUYÊN CẦN NHẤT', 
        value: mostDiligentStudent ? (mostDiligentStudent.dh || mostDiligentStudent.name) : 'N/A', 
        change: mostDiligentStudent ? `${mostDiligentStudent.sessions} lần` : '', 
        trend: 'neutral',
        subtext: 'Nhiều lượt tham gia nhất'
    }
  ];

  const pieData = useMemo(() => [
    { name: 'Hiện diện', value: presentCount, color: '#4d6549' },
    { name: 'Vắng mặt', value: absentCount, color: '#e3e2de' },
  ], [presentCount, absentCount]);

  const attendanceData = useMemo(() => {
    const selectedDateObj = new Date(selectedDate);
    const year = selectedDateObj.getFullYear();
    const month = selectedDateObj.getMonth();

    // Find all Sundays in the selected month
    let firstDay = new Date(year, month, 1);
    let daysUntilSunday = (7 - firstDay.getDay()) % 7;
    let firstSunday = new Date(year, month, 1 + daysUntilSunday);

    const sundays: Date[] = [];
    let currentSunday = firstSunday;
    while (currentSunday.getMonth() === month) {
      sundays.push(new Date(currentSunday));
      currentSunday = new Date(currentSunday.getFullYear(), currentSunday.getMonth(), currentSunday.getDate() + 7);
    }

    return sundays.map((date) => {
      // Need local date string to avoid timezone issues when converting to ISOString
      const d = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
      const dateStr = d.toISOString().split('T')[0];
      const logsToUse = dateStr === today ? todaysLogs : dashboardLogs;
      const logsCount = logsToUse.filter(log => log.date === dateStr && filteredStudents.some(s => s.id === log.studentId)).length;
      const value = totalCount > 0 ? Math.round((logsCount / totalCount) * 100) : 0;
      return {
        name: `${date.getDate()}/${date.getMonth() + 1}`,
        value: value,
        active: dateStr === selectedDate
      };
    });
  }, [dashboardLogs, todaysLogs, totalCount, selectedDate, filteredStudents, today]);

  // Sinh nhật quý này
  const birthdays = useMemo(() => {
    let filtered = students;

    if (selectedQuarter !== 'all') {
      filtered = students.filter(s => {
        const { m } = getMonthDay(s.dob);
        if (m >= 1 && m <= 12) {
          return Math.ceil(m / 3) === selectedQuarter;
        }
        return false;
      });
    }
    
    // Sort by month then day
    return filtered.sort((a, b) => {
      const dateA = getMonthDay(a.dob);
      const dateB = getMonthDay(b.dob);
      
      if (dateA.m !== dateB.m) return dateA.m - dateB.m;
      return dateA.d - dateB.d;
    });
  }, [students, selectedQuarter]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div>
          <p className="text-[10px] font-bold tracking-[0.2em] text-primary uppercase mb-2">Hệ thống quản lý điểm danh</p>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-on-surface">Tổng quan</h2>
          <p className="text-on-surface-variant mt-1 text-sm font-medium">Cập nhật tình hình khóa tu hôm nay</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <div className="relative flex-1">
                <select 
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant pl-4 pr-10 py-3 sm:py-2 rounded-2xl sm:rounded-full text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer appearance-none"
                >
                  {groups.map(g => (
                    <option key={g} value={g}>{g === 'all' ? 'Tất cả nhóm' : g}</option>
                  ))}
                </select>
                <ArrowDown size={14} className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" />
              </div>
              <div className="relative flex-1">
                <input 
                  type="date" 
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full bg-surface-container-lowest border border-outline-variant px-4 py-3 sm:py-2 rounded-2xl sm:rounded-full text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                />
              </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {summaryStats.map((stat, i) => (
          <div key={i} className="bg-surface-container-lowest p-5 sm:p-6 rounded-3xl custom-shadow border border-outline-variant/10 flex flex-col justify-between group hover:border-primary/20 transition-all">
            <span className="text-[10px] font-black tracking-widest text-outline uppercase">{stat.label}</span>
            <div className="flex items-baseline gap-2 mt-3">
              <span className="text-2xl sm:text-3xl font-extrabold text-on-surface">{stat.value}</span>
              {stat.change && (
                <span className={cn(
                  "text-[11px] font-black flex items-center px-1.5 py-0.5 rounded-full",
                  stat.trend === 'up' ? "bg-primary/10 text-primary" : stat.trend === 'down' ? "bg-error/10 text-error" : "bg-tertiary/10 text-tertiary"
                )}>
                  {stat.trend === 'up' && <ArrowUp size={12} />}
                  {stat.trend === 'down' && <ArrowDown size={12} />}
                  {stat.change}
                </span>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-2 font-bold uppercase tracking-tight opacity-60">{stat.subtext}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 bg-surface-container-lowest rounded-2xl p-4 sm:p-6 custom-shadow">
          <h3 className="text-xl font-bold text-on-surface mb-6">Hiện diện hôm nay</h3>
          <div className="h-48 relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  startAngle={90}
                  endAngle={450}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={10} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-3xl font-bold text-on-surface">{presentRate}%</span>
              <span className="text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">CÓ MẶT</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div className="bg-surface p-3 rounded-xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-primary tracking-widest uppercase">Hiện diện</span>
              <span className="text-xl font-bold text-on-surface">{presentCount}</span>
            </div>
            <div className="bg-surface p-3 rounded-xl flex flex-col items-center">
              <span className="text-[10px] font-bold text-secondary tracking-widest uppercase">Vắng mặt</span>
              <span className="text-xl font-bold text-on-surface">{absentCount}</span>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 bg-surface-container-lowest rounded-2xl p-4 sm:p-6 custom-shadow">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
            <h3 className="text-xl font-bold text-on-surface">Tỉ lệ chuyên cần trong tháng</h3>
            <div className="flex gap-1 bg-surface-container p-1 rounded-full text-[10px] font-bold overflow-x-auto flex-nowrap hide-scrollbar whitespace-nowrap max-w-full">
              {groups.map((tab) => (
                <button 
                  key={tab}
                  onClick={() => setSelectedGroup(tab)}
                  className={cn(
                    "px-4 py-1.5 rounded-full transition-all whitespace-nowrap shrink-0",
                    selectedGroup === tab ? "bg-primary text-white shadow-sm" : "text-on-surface-variant hover:bg-surface-container-lowest"
                  )}
                >
                  {tab === 'all' ? 'TẤT CẢ' : tab.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <Bar dataKey="value">
                  {attendanceData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.active ? '#4d6549' : '#cfeac7'} 
                      radius={[4, 4, 0, 0]}
                    />
                  ))}
                </Bar>
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 12, fontWeight: 500, fill: '#747970' }}
                  dy={10}
                />
                <Tooltip 
                  cursor={{ fill: 'transparent' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      return (
                        <div className="bg-inverse-surface text-inverse-on-surface px-2 py-1 rounded text-xs">
                          {payload[0].value}%
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div >
      </div >

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                    onClick={() => setSelectedQuarter(q)}
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
                onClick={() => setShowAllBirthdaysModal(true)}
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
              birthdays.map((p, i) => {
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

        <div className="bg-surface-container-lowest rounded-2xl p-4 sm:p-6 custom-shadow flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-secondary" size={20} />
              <h3 className="text-xl font-bold text-on-surface">Ghi chú công việc</h3>
            </div>
          </div>
          <div className="space-y-3 flex-1 overflow-y-auto max-h-[400px] custom-scrollbar pr-2">
            {announcements.slice().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).map((n) => (
              <div key={n.id} className="flex gap-3 p-3 rounded-xl bg-surface border border-outline-variant/30 hover:border-primary/20 transition-all group">
                <button 
                  onClick={() => updateAnnouncement(n.id, { isCompleted: !n.isCompleted })}
                  className="mt-0.5 text-outline hover:text-primary transition-colors flex-shrink-0"
                >
                  {n.isCompleted ? <CheckCircle2 size={18} className="text-primary" /> : <Circle size={18} />}
                </button>
                <div className="flex-1">
                  {editingNoteId === n.id ? (
                    <input
                      type="text"
                      value={editingNoteContent}
                      onChange={(e) => setEditingNoteContent(e.target.value)}
                      onBlur={() => {
                        if (editingNoteContent.trim()) {
                          updateAnnouncement(n.id, { content: editingNoteContent.trim() });
                        }
                        setEditingNoteId(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          if (editingNoteContent.trim()) {
                            updateAnnouncement(n.id, { content: editingNoteContent.trim() });
                          }
                          setEditingNoteId(null);
                        } else if (e.key === 'Escape') {
                           setEditingNoteId(null);
                        }
                      }}
                      autoFocus
                      className="w-full bg-transparent border-b border-primary/30 focus:border-primary outline-none text-sm font-medium"
                    />
                  ) : (
                    <p className={cn("text-sm font-medium transition-all", n.isCompleted ? "text-outline-variant line-through" : "text-on-surface")}>
                      {n.content}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => {
                      setEditingNoteId(n.id);
                      setEditingNoteContent(n.content);
                    }}
                    className="p-1 rounded-full hover:bg-surface-container text-outline hover:text-primary transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => {
                      if (window.confirm('Xóa ghi chú này?')) {
                        deleteAnnouncement(n.id);
                      }
                    }}
                    className="p-1 rounded-full hover:bg-error/10 text-outline hover:text-error transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="text-center py-8">
                <p className="text-sm font-medium text-outline-variant">Chưa có ghi chú nào.</p>
              </div>
            )}
          </div>
          
          <div className="mt-6 flex gap-2">
            <input
              type="text"
              placeholder="Thêm ghi chú công việc..."
              value={newNoteContent}
              onChange={(e) => setNewNoteContent(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && newNoteContent.trim()) {
                  addAnnouncement(newNoteContent.trim());
                  setNewNoteContent('');
                }
              }}
              className="flex-1 bg-surface-container-low border border-outline-variant/30 rounded-xl px-4 py-2 text-sm font-medium focus:border-primary/50 focus:ring-2 focus:ring-primary/20 outline-none transition-all"
            />
            <button 
              onClick={() => {
                if (newNoteContent.trim()) {
                  addAnnouncement(newNoteContent.trim());
                  setNewNoteContent('');
                }
              }}
              disabled={!newNoteContent.trim()}
              className="bg-primary hover:opacity-90 disabled:opacity-50 text-white p-3 rounded-xl transition-all shadow-md shadow-primary/20 disabled:shadow-none shrink-0"
            >
              <Plus size={18} />
            </button>
          </div>
        </div>
      </div>

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

      {/* Modal Toàn bộ sinh nhật */}
      {showAllBirthdaysModal && (
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
                onClick={() => setShowAllBirthdaysModal(false)}
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
      )}
    </motion.div>
  );
}
