import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { cn } from '../../lib/utils';

interface AttendanceChartProps {
  pieData: { name: string; value: number; color: string }[];
  presentRate: number;
  presentCount: number;
  absentCount: number;
  attendanceData: { name: string; value: number; active: boolean }[];
  groups: string[];
  selectedGroup: string;
  onSelectGroup: (group: string) => void;
}

export function AttendanceChart({
  pieData,
  presentRate,
  presentCount,
  absentCount,
  attendanceData,
  groups,
  selectedGroup,
  onSelectGroup
}: AttendanceChartProps) {
  return (
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
                onClick={() => onSelectGroup(tab)}
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
      </div>
    </div>
  );
}
