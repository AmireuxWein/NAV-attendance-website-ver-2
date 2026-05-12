import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  QrCode, 
  Users, 
  FileText, 
  Leaf
} from 'lucide-react';
import { cn } from '@/src/lib/utils';

const navItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/' },
  { name: 'Attendance', icon: QrCode, path: '/attendance' },
  { name: 'Participants', icon: Users, path: '/participants' },
  { name: 'Reports', icon: FileText, path: '/reports' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="fixed left-0 top-0 h-full w-64 bg-surface-container-lowest border-r border-outline-variant/30 px-4 py-8 hidden md:flex flex-col z-50">
      <div className="flex items-center gap-3 mb-10 px-2">
        <div className="w-10 h-10 rounded-xl bg-primary-container/20 flex items-center justify-center">
          <Leaf className="text-primary" size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-black text-primary leading-none tracking-tighter">Niềm An Vui</h1>
          <p className="text-[10px] text-outline font-bold tracking-widest uppercase mt-1">Management Portal</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-300",
                isActive 
                  ? "bg-primary/10 text-primary" 
                  : "text-outline hover:text-primary hover:bg-surface-container"
              )}
            >
              <item.icon size={20} className={isActive ? "stroke-[3px]" : ""} />
              {item.name}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
