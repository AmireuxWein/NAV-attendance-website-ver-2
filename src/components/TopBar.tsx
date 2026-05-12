import { Search, Bell, Settings, UserCircle, HelpCircle, LogOut, Leaf, ScrollText } from 'lucide-react';
import { useData } from '../contexts/DataContext';
import { useState, useRef, useEffect } from 'react';
import { auth } from '../lib/firebase';
import { signOut } from 'firebase/auth';
import HelpModal from './HelpModal';
import SettingsModal from './SettingsModal';
import { motion, AnimatePresence } from 'motion/react';

export default function TopBar() {
  const { user, announcements, updateAnnouncement } = useData();
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const pendingCount = announcements.filter(a => !a.isCompleted).length;

  return (
    <>
      <header className="fixed top-0 right-0 left-0 md:left-64 h-20 bg-surface-container-lowest/80 backdrop-blur-xl border-b border-outline-variant/10 px-6 sm:px-10 flex justify-between items-center z-40 transition-all">
        <div className="flex items-center gap-3 md:hidden">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center rotate-3">
             <Leaf className="text-primary" size={24} />
          </div>
          <h1 className="text-xl font-extrabold text-on-surface tracking-tighter">Niềm An Vui</h1>
        </div>

        <div className="hidden md:flex items-center relative group max-w-xs w-full">
          <Search className="absolute left-4 text-outline" size={16} />
          <input 
            type="text" 
            placeholder="Tìm kiếm..."
            className="w-full bg-surface-container-low rounded-full pl-10 pr-4 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>

        <div className="flex items-center gap-3">
          <div className="relative" ref={notificationsRef}>
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-3 rounded-xl hover:bg-surface-container-high transition-colors relative group"
            >
              <Bell size={20} className="text-outline group-hover:text-primary transition-colors" />
              {pendingCount > 0 && (
                <span className="absolute top-3 right-3 w-2.5 h-2.5 bg-primary border-2 border-white rounded-full" />
              )}
            </button>

            <AnimatePresence>
              {showNotifications && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute right-0 mt-2 w-[calc(100vw-2rem)] sm:w-96 bg-surface-container-lowest rounded-3xl shadow-xl border border-outline-variant/10 overflow-hidden z-50 transform origin-top-right"
                >
                  <div className="p-5 border-b border-outline-variant/10 flex justify-between items-center bg-surface-container-low/30">
                    <h3 className="font-bold text-on-surface flex items-center gap-2">
                       <ScrollText size={18} className="text-primary" />
                       Ghi chú công việc
                    </h3>
                    <span className="text-[10px] font-bold tracking-widest uppercase bg-primary/10 text-primary px-2 py-1 rounded-md">{pendingCount} việc cần làm</span>
                  </div>
                  <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                    {announcements.length > 0 ? (
                      <div className="divide-y divide-outline-variant/5">
                        {announcements.slice().sort((a,b) => b.createdAt - a.createdAt).map((a) => (
                          <div key={a.id} className="p-5 hover:bg-surface-container-low transition-colors group flex gap-3 items-start">
                            <button 
                              onClick={() => updateAnnouncement(a.id, { isCompleted: !a.isCompleted })}
                              className="mt-0.5 text-outline hover:text-primary transition-colors flex-shrink-0"
                            >
                              {a.isCompleted ? <div className="w-4 h-4 rounded-full bg-primary" /> : <div className="w-4 h-4 rounded-full border-2 border-outline" />}
                            </button>
                            <div>
                              <p className={`text-sm font-medium leading-relaxed ${a.isCompleted ? 'line-through text-outline' : 'text-on-surface'}`}>
                                {a.content}
                              </p>
                              <p className="text-[10px] text-outline font-bold mt-2 uppercase tracking-wide">
                                {new Date(a.createdAt).toLocaleDateString('vi-VN')} lúc {new Date(a.createdAt).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center text-outline flex flex-col items-center">
                        <ScrollText size={32} className="opacity-20 mb-3" />
                        <p className="text-sm font-medium">Chưa có ghi chú nào.</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          <div className="relative" ref={dropdownRef}>
            <button 
              onClick={() => setShowDropdown(!showDropdown)}
              className="ml-2 flex items-center gap-2 p-1.5 rounded-2xl hover:bg-surface-container-high transition-all border border-transparent hover:border-outline-variant/30 group" 
              title={user?.email || 'User Avatar'}
            >
              <div className="w-9 h-9 rounded-xl overflow-hidden border border-outline-variant/30 flex items-center justify-center bg-surface-container cursor-pointer transition-all">
                {user?.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="w-full h-full object-cover pointer-events-none" referrerPolicy="no-referrer" />
                ) : (
                  <UserCircle className="text-outline w-full h-full pointer-events-none group-hover:text-primary" />
                )}
              </div>
              <div className="hidden sm:block text-left mr-2">
                <p className="text-xs font-black text-on-surface leading-none">{user?.displayName?.split(' ').pop() || 'ADMIN'}</p>
                <div className="w-full h-1 bg-primary/20 rounded-full mt-1 overflow-hidden">
                   <div className="w-2/3 h-full bg-primary" />
                </div>
              </div>
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-64 bg-surface-container-lowest rounded-2xl shadow-xl overflow-hidden border border-outline-variant/20 py-2 z-50">
                <div className="px-4 py-3 border-b border-outline-variant/20">
                  <p className="text-sm font-bold text-on-surface truncate">{user?.displayName || 'Huynh trưởng'}</p>
                  <p className="text-xs text-on-surface-variant truncate mt-0.5">{user?.email}</p>
                </div>
                
                <div className="py-2">
                  <button 
                    onClick={() => { setShowHelp(true); setShowDropdown(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-on-surface hover:bg-surface-container flex items-center gap-3 transition-colors"
                  >
                    <HelpCircle size={16} className="text-outline" />
                    Hướng dẫn sử dụng
                  </button>
                  <button 
                    onClick={() => { setShowSettings(true); setShowDropdown(false); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-on-surface hover:bg-surface-container flex items-center gap-3 transition-colors"
                  >
                    <Settings size={16} className="text-outline" />
                    Cài đặt hệ thống
                  </button>
                </div>
                
                <div className="border-t border-outline-variant/20 py-2">
                  <button 
                    onClick={() => { setShowDropdown(false); signOut(auth); }}
                    className="w-full px-4 py-2.5 text-left text-sm font-bold text-error hover:bg-error/10 flex items-center gap-3 transition-colors"
                  >
                    <LogOut size={16} />
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}
      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </>
  );
}
