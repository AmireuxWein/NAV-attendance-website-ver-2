import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowDown } from 'lucide-react';
import { useData, Student } from '../contexts/DataContext';
import { sortStudentsGlobal } from '../lib/utils';
import { DEFAULT_GROUPS } from '../lib/constants';

import { SummaryStats } from '../features/dashboard/SummaryStats';
import { AttendanceChart } from '../features/dashboard/AttendanceChart';
import { BirthdayList } from '../features/dashboard/BirthdayList';
import { TodoList } from '../features/dashboard/TodoList';
import { AdminManager } from '../features/dashboard/AdminManager';
import { AllBirthdaysModal } from '../features/dashboard/AllBirthdaysModal';

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
  const { 
    students, 
    todaysLogs, 
    totalSessions, 
    fetchLogsByDates, 
    announcements, 
    admins, 
    addAdmin, 
    removeAdmin, 
    settings, 
    addAnnouncement, 
    updateAnnouncement, 
    deleteAnnouncement 
  } = useData();

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

  const groups = useMemo(() => {
    const defaultOrder = DEFAULT_GROUPS;
    const extractedGroups = Array.from(new Set(students.map(s => s.group))).filter((g): g is string => !!g);

    extractedGroups.sort((a, b) => {
      const indexA = defaultOrder.indexOf(a);
      const indexB = defaultOrder.indexOf(b);

      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA !== -1) return -1;
      if (indexB !== -1) return 1;
      return a.localeCompare(b);
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
      trend: (todayChange > 0 ? 'up' : todayChange < 0 ? 'down' : 'neutral') as 'up' | 'down' | 'neutral',
      subtext: 'So với buổi trước'
    },
    {
      label: 'ĐÃ TỔ CHỨC',
      value: `${totalSessions}`,
      change: '',
      trend: 'neutral' as const,
      subtext: 'Tổng số buổi'
    },
    {
      label: 'CHUYÊN CẦN NHẤT',
      value: mostDiligentStudent ? (mostDiligentStudent.dh || mostDiligentStudent.name) : 'N/A',
      change: mostDiligentStudent ? `${mostDiligentStudent.sessions} lần` : '',
      trend: 'neutral' as const,
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

    const preSorted = sortStudentsGlobal<Student>(filtered);

    return preSorted.sort((a, b) => {
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

      <SummaryStats stats={summaryStats} />

      <AttendanceChart
        pieData={pieData}
        presentRate={presentRate}
        presentCount={presentCount}
        absentCount={absentCount}
        attendanceData={attendanceData}
        groups={groups}
        selectedGroup={selectedGroup}
        onSelectGroup={setSelectedGroup}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <BirthdayList 
          birthdays={birthdays}
          selectedQuarter={selectedQuarter}
          onSelectQuarter={setSelectedQuarter}
          onShowAll={() => setShowAllBirthdaysModal(true)}
          todayDateObj={todayDateObj}
          getMonthDay={getMonthDay}
        />
        <TodoList 
          announcements={announcements}
          addAnnouncement={addAnnouncement}
          updateAnnouncement={updateAnnouncement}
          deleteAnnouncement={deleteAnnouncement}
        />
      </div>

      <AdminManager 
        admins={admins}
        addAdmin={addAdmin}
        removeAdmin={removeAdmin}
        settings={settings}
      />

      <AnimatePresence>
        {showAllBirthdaysModal && (
          <AllBirthdaysModal 
            students={students}
            onClose={() => setShowAllBirthdaysModal(false)}
            todayDateObj={todayDateObj}
            getMonthDay={getMonthDay}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
