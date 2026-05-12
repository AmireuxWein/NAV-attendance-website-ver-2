import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  QrCode, 
  User, 
  Folder 
} from 'lucide-react';
import { cn } from '@/src/lib/utils';
import { motion } from 'motion/react';

export default function BottomNav() {
  const location = useLocation();

  const navItems = [
    { label: 'Home', icon: Home, path: '/' },
    { label: 'Scan', icon: QrCode, path: '/attendance' },
    { label: 'Users', icon: User, path: '/participants' },
    { label: 'Files', icon: Folder, path: '/reports' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full md:hidden bg-surface-container-lowest/80 backdrop-blur-xl border-t border-outline-variant/10 px-6 pt-2 pb-6 flex justify-between items-center z-50 rounded-t-[2.5rem] shadow-[0_-10px_40px_rgba(0,0,0,0.08)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path;
        
        return (
          <Link
            key={item.path}
            to={item.path}
            className="relative flex flex-col items-center justify-center min-w-[64px] h-12 outline-none group"
          >
            {isActive && (
              <motion.div
                layoutId="nav-active"
                className="absolute -top-6 w-14 h-14 bg-primary rounded-full shadow-xl shadow-primary/30 ring-4 ring-surface-container-lowest z-0"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            
            <div className={cn(
              "relative z-10 flex flex-col items-center gap-1.5 transition-all duration-300",
              isActive ? "text-white -translate-y-6" : "text-outline/70"
            )}>
              <item.icon size={isActive ? 24 : 20} strokeWidth={isActive ? 3 : 2} />
              {!isActive && (
                <span className="text-[9px] font-extrabold tracking-widest uppercase opacity-40">
                  {item.label}
                </span>
              )}
            </div>
          </Link>
        );
      })}
    </nav>
  );
}
