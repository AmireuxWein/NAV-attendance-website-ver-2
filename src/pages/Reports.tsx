import {
  Calendar,
  ChevronDown,
  ChevronRight,
  FileSpreadsheet,
  FileText,
  Eye,
  Settings2,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';
import { useData } from '../contexts/DataContext';
import { useState, useMemo, useEffect } from 'react';
import { sortStudentsGlobal } from '../lib/utils';

export default function Reports() {
  const { students, fetchLogsByDateRange } = useData();
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];

  const [fromDate, setFromDate] = useState(firstDay);
  const [toDate, setToDate] = useState(lastDay);
  const [selectedGroup, setSelectedGroup] = useState('Tất cả các nhóm');
  const [reportLogs, setReportLogs] = useState<any[]>([]);

  useEffect(() => {
    const fetchLogs = async () => {
      if (fromDate && toDate) {
        const logs = await fetchLogsByDateRange(fromDate, toDate);
        setReportLogs(logs);
      }
    };
    fetchLogs();
  }, [fromDate, toDate, fetchLogsByDateRange]);

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

    defaultOrder.forEach(g => {
      if (!extractedGroups.includes(g)) extractedGroups.push(g);
    });

    return ['Tất cả các nhóm', ...extractedGroups];
  }, [students]);

  const filteredStudents = useMemo(() => {
    let filtered = [...students];
    if (selectedGroup !== 'Tất cả các nhóm') {
      filtered = filtered.filter(s => s.group === selectedGroup);
    }

    filtered = sortStudentsGlobal(filtered);

    return filtered.map(student => {
      const studentLogs = reportLogs.filter(log =>
        log.studentId === student.id &&
        log.date >= fromDate &&
        log.date <= toDate
      );

      const start = new Date(fromDate);
      const end = new Date(toDate);
      const daysDiff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      // Tránh chia cho số 0
      const totalDays = Math.max(1, daysDiff + 1);

      const present = studentLogs.length;

      const timeAttended = studentLogs
        .slice()
        .sort((a, b) => a.timestamp - b.timestamp)
        .map(log => `${new Date(log.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ${new Date(log.timestamp).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}`)
        .join(', ');

      return {
        name: student.name,
        group: student.group,
        present,
        logs: studentLogs,
        timeAttended
      };
    });
  }, [students, reportLogs, fromDate, toDate, selectedGroup]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      <div>
        <h2 className="text-3xl font-bold text-on-surface">Xuất Báo Cáo Chuyên Cần</h2>
        <p className="text-on-surface-variant mt-2 max-w-2xl font-medium">
          Cấu hình các tham số bên dưới để trích xuất dữ liệu tham gia của khóa sinh.
          Hệ thống hỗ trợ định dạng Excel và PDF.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-4 space-y-6 print:hidden">
          <div className="bg-surface-container-lowest rounded-3xl p-8 custom-shadow">
            <h3 className="text-xl font-bold text-on-surface mb-8 flex items-center gap-2">
              <Settings2 size={24} className="text-tertiary" />
              Tham số báo cáo
            </h3>

            <div className="space-y-6">
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-extrabold tracking-[0.2em] text-on-surface-variant uppercase mb-2 block">TỪ NGÀY</label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-tertiary outline-none rounded-t-xl px-4 py-4 text-sm font-bold transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] font-extrabold tracking-[0.2em] text-on-surface-variant uppercase mb-2 block">ĐẾN NGÀY</label>
                  <div className="relative group">
                    <input
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-tertiary outline-none rounded-t-xl px-4 py-4 text-sm font-bold transition-all"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-extrabold tracking-[0.2em] text-on-surface-variant uppercase mb-2 block">NHÓM KHÓA SINH</label>
                <div className="relative group">
                  <select
                    value={selectedGroup}
                    onChange={(e) => setSelectedGroup(e.target.value)}
                    className="w-full bg-surface-container-low border-b-2 border-transparent focus:border-tertiary outline-none rounded-t-xl px-5 py-4 text-sm font-bold appearance-none transition-all"
                  >
                    {groups.map(g => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none" size={20} />
                </div>
              </div>
            </div>

            <div className="pt-10 mt-6 border-t border-primary-container/10 space-y-3">
              <button
                onClick={() => {
                  import('xlsx').then(({ utils, writeFile }) => {
                    const headers = ['Họ và tên', 'Nhóm', 'Có mặt', 'Thời gian điểm danh'];

                    const data = filteredStudents.map(s => {
                      return [s.name, s.group, s.present, s.timeAttended];
                    });

                    const ws = utils.aoa_to_sheet([headers, ...data]);
                    const wb = utils.book_new();
                    utils.book_append_sheet(wb, ws, "BaoCao");
                    writeFile(wb, `bao_cao_chuyen_can_${fromDate}_${toDate}.xlsx`);
                  });
                }}
                className="w-full bg-tertiary text-white font-bold py-4 rounded-full flex items-center justify-center gap-3 shadow-lg shadow-tertiary/20 hover:opacity-90 active:scale-95 transition-all outline-none"
              >
                <FileSpreadsheet size={18} />
                Xuất Excel (.xlsx)
              </button>
              <button
                onClick={() => window.print()}
                className="w-full bg-transparent border-2 border-tertiary text-tertiary font-bold py-4 rounded-full flex items-center justify-center gap-3 hover:bg-tertiary/5 active:scale-95 transition-all outline-none"
              >
                <FileText size={18} />
                In báo cáo (PDF)
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 print:col-span-12">
          <div className="bg-surface-container-lowest rounded-3xl overflow-hidden custom-shadow border border-primary-container/5 print:border-none print:shadow-none">
            <div className="p-8 flex justify-between items-center border-b border-primary-container/10 print:hidden">
              <div>
                <h3 className="text-xl font-bold text-on-surface">Xem trước dữ liệu</h3>
                <p className="text-xs text-on-surface-variant mt-1 font-bold tracking-wide uppercase">Số lượng: {filteredStudents.length} khóa sinh</p>
              </div>
              <Eye size={32} className="text-primary-container/30" />
            </div>

            {/* Header for print only */}
            <div className="hidden print:block mb-8 text-center">
              <h2 className="text-2xl font-bold mb-2">BÁO CÁO CHUYÊN CẦN</h2>
              <p className="text-sm">Từ ngày: {fromDate} - Đến ngày: {toDate}</p>
              <p className="text-sm">Nhóm: {selectedGroup}</p>
            </div>

            <div className="overflow-x-auto max-h-[600px] print:max-h-none print:overflow-visible">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-surface-container-low print:bg-transparent">
                  <tr className="bg-surface-container-low text-[10px] font-bold tracking-[0.1em] text-on-surface-variant uppercase print:border-b-2 print:border-black print:text-black">
                    <th className="py-5 px-8">Họ và tên</th>
                    <th className="py-5 px-8 min-w-[120px]">Nhóm</th>
                    <th className="py-5 px-8 text-center">Có mặt</th>
                    <th className="py-5 px-8">Thời gian điểm danh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-container/5 text-sm font-medium print:text-black print:divide-gray-300">
                  {filteredStudents.map((row, i) => (
                    <tr key={i} className="hover:bg-surface transition-colors print:hover:bg-transparent print:break-inside-avoid">
                      <td className="py-5 px-8 font-bold text-on-surface print:text-black">{row.name}</td>
                      <td className="py-5 px-8 text-on-surface-variant font-medium print:text-black">{row.group}</td>
                      <td className="py-5 px-8 text-center text-tertiary font-bold print:text-black">{row.present}</td>
                      <td className="py-5 px-8 text-on-surface-variant print:text-black text-xs max-w-[250px] leading-relaxed">{row.timeAttended}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-6 bg-surface-bright/50 flex items-center justify-center text-on-surface-variant/70 border-t border-primary-container/5 print:hidden">
              <div className="flex items-center gap-2">
                <Info size={16} />
                <span className="text-xs font-medium italic">Bạn có thể ấn nút xuất PDF để lưu hoặc in bảng dữ liệu này.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
