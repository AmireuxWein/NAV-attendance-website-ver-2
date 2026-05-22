/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import TopBar from './components/TopBar';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Participants = lazy(() => import('./pages/Participants'));
const Reports = lazy(() => import('./pages/Reports'));

import { DataProvider, useData } from './contexts/DataContext';
import { signInWithGoogle } from './lib/firebase';
import { LogIn, LogOut, ShieldAlert } from 'lucide-react';
import { auth } from './lib/firebase';
import { signOut } from 'firebase/auth';
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const { user, isAdmin, isAuthReady } = useData();

  if (!isAuthReady) {
    return <div className="min-h-screen bg-background flex items-center justify-center">Đang tải...</div>;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <LogIn className="text-primary w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Niềm An Vui</h1>
          <p className="text-on-surface-variant text-sm mb-8">Vui lòng đăng nhập để tiếp tục</p>
          <button 
            onClick={signInWithGoogle}
            className="w-full bg-primary text-white font-bold py-3 px-6 rounded-full shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all outline-none"
          >
            Đăng nhập với Google
          </button>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface-container-lowest flex items-center justify-center p-4">
        <div className="bg-surface-container-lowest border border-outline-variant/20 p-8 rounded-3xl shadow-xl max-w-sm w-full text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShieldAlert className="text-error w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface mb-2">Quyền truy cập bị từ chối</h1>
          <p className="text-on-surface-variant text-sm mb-6">
            Tài khoản <strong>{user.email}</strong> chưa được cấp quyền để truy cập hệ thống. Vui lòng liên hệ quản trị viên.
          </p>
          <button 
            onClick={() => signOut(auth)}
            className="w-full bg-surface-container-high text-on-surface font-bold py-3 px-6 rounded-full hover:bg-surface-container-highest active:scale-95 transition-all outline-none flex items-center justify-center gap-2"
          >
            <LogOut size={18} />
            Đăng xuất
          </button>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-background flex">
        <div className="print:hidden">
          <Sidebar />
        </div>
        <div className="flex-1 flex flex-col md:pl-64 print:pl-0 min-w-0">
          <div className="print:hidden">
            <TopBar />
          </div>
          <main className="flex-1 px-6 pb-6 pt-24 md:px-10 md:pb-10 md:pt-28 mb-24 md:mb-0 print:m-0 print:p-0 max-w-7xl mx-auto w-full print:max-w-none">
            <Suspense fallback={
              <div className="flex h-full min-h-[50vh] items-center justify-center">
                <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin"></div>
              </div>
            }>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/attendance" element={<Attendance />} />
                <Route path="/participants" element={<Participants />} />
                <Route path="/reports" element={<Reports />} />
              </Routes>
            </Suspense>
          </main>
          <div className="print:hidden">
            <BottomNav />
          </div>
        </div>
      </div>
    </Router>
  );
}

export default function App() {
  return (
    <DataProvider>
      <AppContent />
      <Toaster position="top-center" />
    </DataProvider>
  );
}

