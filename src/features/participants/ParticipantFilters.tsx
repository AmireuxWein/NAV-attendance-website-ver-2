import { Search, ArrowDown, UserPlus } from 'lucide-react';

interface ParticipantFiltersProps {
  searchTerm: string;
  setSearchTerm: (val: string) => void;
  filterStatus: string;
  setFilterStatus: (val: string) => void;
  filterGroup: string;
  setFilterGroup: (val: string) => void;
  groups: string[];
  onAddClick: () => void;
}

export function ParticipantFilters({
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  filterGroup,
  setFilterGroup,
  groups,
  onAddClick
}: ParticipantFiltersProps) {
  return (
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
        onClick={onAddClick}
        className="bg-primary text-on-primary px-6 sm:px-8 py-3.5 rounded-2xl sm:rounded-full text-[11px] font-bold tracking-[0.1em] uppercase flex items-center justify-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all"
      >
        <UserPlus size={18} />
        <span>THÊM KHÓA SINH</span>
      </button>
    </div>
  );
}
