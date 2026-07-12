import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { collection, onSnapshot, doc, setDoc, deleteDoc, query, getDocs, where, writeBatch, serverTimestamp, getDoc, arrayUnion, runTransaction } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType, auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';

export interface Student {
  id: string;
  name: string;
  dh: string;
  group: string;
  phone: string;
  dob: string;
  joinDate?: string;
  sessions: number;
  avatar: string | null;
  qr_link: string;
  createdAt?: number;
  updatedAt?: number;
}

export interface AttendanceLog {
  id: string;
  studentId: string;
  studentName: string;
  dh: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  type: 'check-in' | 'check-out';
  createdAt?: number;
}

export interface Announcement {
  id: string;
  content: string;
  isCompleted: boolean;
  createdAt?: number;
}

export interface Admin {
  id: string; // The email
  email: string;
  createdAt: number;
}

export interface Settings {
  theme: 'light' | 'dark';
  requireDeleteConfirm: boolean;
}

import { User } from 'firebase/auth';

interface DataContextType {
  students: Student[];
  todaysLogs: AttendanceLog[];
  totalSessions: number;
  announcements: Announcement[];
  admins: Admin[];
  user: User | null;
  isAdmin: boolean;
  isAuthReady: boolean;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  addStudent: (student: Omit<Student, 'id' | 'sessions' | 'qr_link'>) => Promise<void>;
  recordAttendance: (studentId: string) => Promise<{ success: boolean; message: string; student?: Student; isDuplicate?: boolean }>;
  deleteAttendance: (studentId: string, date: string) => Promise<{ success: boolean; message: string }>;
  deleteStudent: (id: string) => Promise<void>;
  updateStudent: (id: string, data: Partial<Student>) => Promise<void>;
  addAdmin: (email: string) => Promise<void>;
  removeAdmin: (email: string) => Promise<void>;
  addAnnouncement: (content: string) => Promise<void>;
  updateAnnouncement: (id: string, data: Partial<Announcement>) => Promise<void>;
  deleteAnnouncement: (id: string) => Promise<void>;
  fetchLogsByDates: (dates: string[]) => Promise<AttendanceLog[]>;
  fetchLogsByDateRange: (startDate: string, endDate: string) => Promise<AttendanceLog[]>;
  fetchLastLogForStudent: (studentId: string) => Promise<AttendanceLog | null>;
}

const generateQR = (id: string) => `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${id}`;

const DataContext = createContext<DataContextType | undefined>(undefined);

const defaultSettings: Settings = {
  theme: 'light',
  requireDeleteConfirm: true
};

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [students, setStudents] = useState<Student[]>([]);
  const [todaysLogs, setTodaysLogs] = useState<AttendanceLog[]>([]);
  const [totalSessions, setTotalSessions] = useState<number>(0);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  
  const [settings, setSettingsState] = useState<Settings>(() => {
    const saved = localStorage.getItem('appSettings');
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettingsState(prev => {
      const updated = { ...prev, ...newSettings };
      localStorage.setItem('appSettings', JSON.stringify(updated));
      return updated;
    });
  };

  useEffect(() => {
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [settings.theme]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.email) {
        if (currentUser.email === 'tantaitanthoi@gmail.com') {
           setIsAdmin(true);
        } else {
           try {
             const { getDoc, doc } = await import('firebase/firestore');
             const docSnap = await getDoc(doc(db, 'admins', currentUser.email));
             setIsAdmin(docSnap.exists());
           } catch {
             setIsAdmin(false);
           }
        }
      } else {
        setIsAdmin(false);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !isAdmin) return;

    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const data: Student[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Student));
      setStudents(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'students');
    });

    const todayDate = format(new Date(), 'yyyy-MM-dd');
    const qTodaysLogs = query(collection(db, 'attendanceLogs'), where('date', '==', todayDate));
    const unsubLogs = onSnapshot(qTodaysLogs, (snapshot) => {
      const data: AttendanceLog[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as AttendanceLog));
      setTodaysLogs(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'attendanceLogs');
    });

    const fetchTotalSessions = async () => {
      try {
        const statsRef = doc(db, 'stats', 'attendance');
        const statsSnap = await getDoc(statsRef);
        if (statsSnap.exists()) {
          const dates = statsSnap.data().sessionDates || [];
          setTotalSessions(dates.length);
        } else {
          const logsSnap = await getDocs(collection(db, 'attendanceLogs'));
          const uniqueDates = new Set<string>();
          logsSnap.forEach(doc => {
            const data = doc.data();
            if (data.date) uniqueDates.add(data.date);
          });
          const datesArray = Array.from(uniqueDates);
          await setDoc(statsRef, { sessionDates: datesArray });
          setTotalSessions(datesArray.length);
        }
      } catch (error) {
        console.error('Error fetching total sessions:', error);
      }
    };
    fetchTotalSessions();

    const unsubAnnouncements = onSnapshot(collection(db, 'announcements'), (snapshot) => {
      const data: Announcement[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Announcement));
      setAnnouncements(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'announcements');
    });

    const unsubAdmins = onSnapshot(collection(db, 'admins'), (snapshot) => {
      const data: Admin[] = [];
      snapshot.forEach(doc => data.push({ id: doc.id, ...doc.data() } as Admin));
      setAdmins(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'admins');
    });

    return () => {
      unsubStudents();
      unsubLogs();
      unsubAnnouncements();
      unsubAdmins();
    };
  }, [user, isAdmin]);

  const addStudent = async (studentData: Omit<Student, 'id' | 'sessions' | 'qr_link'>) => {
    try {
      const newId = doc(collection(db, 'students')).id;
      const newStudent = {
        ...studentData,
        qr_link: generateQR(newId),
        sessions: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        avatar: studentData.avatar || '',
        dh: studentData.dh || '',
        phone: studentData.phone || '',
        dob: studentData.dob || '',
        joinDate: studentData.joinDate || ''
      };
      await setDoc(doc(db, 'students', newId), newStudent);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'students');
    }
  };

  const recordAttendance = async (studentId: string) => {
    try {
      const student = students.find((s) => s.id === studentId);
      if (!student) {
        return { success: false, message: 'Không tìm thấy khóa sinh' };
      }

      // Convert local date string reliably
      const todayDate = format(new Date(), 'yyyy-MM-dd');

      // First check local state for speed
      const alreadyAttendedLocal = todaysLogs.some(
        (log) => log.studentId === studentId
      );

      if (alreadyAttendedLocal) {
        return { success: true, message: 'Đã điểm danh hôm nay', student, isDuplicate: true };
      }

      // Use deterministic ID for attendance log to enforce uniqueness per day
      const logId = `${studentId}_${todayDate}`;
      const logRef = doc(db, 'attendanceLogs', logId);
      const studentRef = doc(db, 'students', studentId);

      await runTransaction(db, async (transaction) => {
        // Read operations must come first
        const logDoc = await transaction.get(logRef);
        if (logDoc.exists()) {
          throw new Error('ALREADY_ATTENDED');
        }

        const studentDoc = await transaction.get(studentRef);
        if (!studentDoc.exists()) {
          throw new Error('STUDENT_NOT_FOUND');
        }

        // Write operations
        const newLog: Omit<AttendanceLog, 'id'> = {
          studentId,
          studentName: studentDoc.data().name,
          dh: studentDoc.data().dh || '',
          date: todayDate,
          timestamp: Date.now(),
          type: 'check-in',
          createdAt: Date.now()
        };

        transaction.set(logRef, newLog);
        
        transaction.update(studentRef, { 
          sessions: (studentDoc.data().sessions || 0) + 1,
          updatedAt: Date.now()
        });
      });

      return { success: true, message: 'Điểm danh thành công', student };
    } catch (error: any) {
      if (error.message === 'ALREADY_ATTENDED') {
        const student = students.find((s) => s.id === studentId);
        return { success: true, message: 'Đã điểm danh hôm nay', student, isDuplicate: true };
      }
      if (error.message === 'STUDENT_NOT_FOUND') {
        return { success: false, message: 'Không tìm thấy khóa sinh trong database' };
      }
      handleFirestoreError(error, OperationType.CREATE, 'attendanceLogs');
      return { success: false, message: 'Có lỗi xảy ra khi đồng bộ' };
    }
  };

  const deleteAttendance = async (studentId: string, date: string) => {
    try {
      const logId = `${studentId}_${date}`;
      const logRef = doc(db, 'attendanceLogs', logId);
      const studentRef = doc(db, 'students', studentId);

      await runTransaction(db, async (transaction) => {
        const logDoc = await transaction.get(logRef);
        if (!logDoc.exists()) {
          throw new Error('LOG_NOT_FOUND');
        }

        const studentDoc = await transaction.get(studentRef);
        if (!studentDoc.exists()) {
          throw new Error('STUDENT_NOT_FOUND');
        }

        // Delete the attendance log
        transaction.delete(logRef);
        
        // Decrement session count
        const currentSessions = studentDoc.data().sessions || 0;
        transaction.update(studentRef, { 
          sessions: Math.max(0, currentSessions - 1),
          updatedAt: Date.now()
        });
      });

      return { success: true, message: 'Đã xóa điểm danh thành công' };
    } catch (error: any) {
      if (error.message === 'LOG_NOT_FOUND') {
        return { success: false, message: 'Không tìm thấy bản ghi điểm danh' };
      }
      if (error.message === 'STUDENT_NOT_FOUND') {
        return { success: false, message: 'Không tìm thấy khóa sinh trong database' };
      }
      handleFirestoreError(error, OperationType.DELETE, 'attendanceLogs');
      return { success: false, message: 'Có lỗi xảy ra khi xóa điểm danh' };
    }
  };

  const fetchLogsByDates = useCallback(async (dates: string[]) => {
    if (dates.length === 0) return [];
    try {
      const q = query(collection(db, 'attendanceLogs'), where('date', 'in', dates));
      const snap = await getDocs(q);
      const data: AttendanceLog[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as AttendanceLog));
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const fetchLogsByDateRange = useCallback(async (startDate: string, endDate: string) => {
    try {
      const q = query(collection(db, 'attendanceLogs'), where('date', '>=', startDate), where('date', '<=', endDate));
      const snap = await getDocs(q);
      const data: AttendanceLog[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as AttendanceLog));
      return data;
    } catch (error) {
      console.error(error);
      return [];
    }
  }, []);

  const fetchLastLogForStudent = useCallback(async (studentId: string) => {
    try {
      const q = query(collection(db, 'attendanceLogs'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      const data: AttendanceLog[] = [];
      snap.forEach(doc => data.push({ id: doc.id, ...doc.data() } as AttendanceLog));
      data.sort((a, b) => b.timestamp - a.timestamp);
      return data.length > 0 ? data[0] : null;
    } catch (error) {
      console.error(error);
      return null;
    }
  }, []);

  const deleteStudent = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      
      // Also clean up their attendance logs
      const logsQ = query(collection(db, 'attendanceLogs'), where('studentId', '==', id));
      const logsSnapshot = await getDocs(logsQ);
      const batch = writeBatch(db);
      logsSnapshot.forEach((docSnap) => {
        batch.delete(docSnap.ref);
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `students/${id}`);
    }
  };

  const updateStudent = async (id: string, data: Partial<Student>) => {
    try {
      const currentStudent = students.find(s => s.id === id);
      if(!currentStudent) return;
      
      const updatedData = { 
        ...currentStudent, 
        ...data, 
        qr_link: generateQR(id), 
        updatedAt: Date.now(),
        avatar: data.avatar ?? currentStudent.avatar ?? '',
        dh: data.dh ?? currentStudent.dh ?? '',
        phone: data.phone ?? currentStudent.phone ?? '',
        dob: data.dob ?? currentStudent.dob ?? ''
      };
      const { id: _, ...updatePayload } = updatedData as any;
      await setDoc(doc(db, 'students', id), updatePayload);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `students/${id}`);
    }
  };

  const addAdmin = async (email: string) => {
    try {
      const adminRef = doc(db, 'admins', email);
      await setDoc(adminRef, {
        email,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'admins');
    }
  };

  const removeAdmin = async (email: string) => {
    if (email === 'tantaitanthoi@gmail.com') return; // Cannot remove main admin
    try {
      await deleteDoc(doc(db, 'admins', email));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `admins/${email}`);
    }
  };

  const addAnnouncement = async (content: string) => {
    try {
      const newRef = doc(collection(db, 'announcements'));
      await setDoc(newRef, {
        content,
        isCompleted: false,
        createdAt: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'announcements');
    }
  };

  const updateAnnouncement = async (id: string, data: Partial<Announcement>) => {
    try {
      const currentAnnouncement = announcements.find(a => a.id === id);
      if (!currentAnnouncement) return;
      
      const { id: _, ...updatePayload } = { ...currentAnnouncement, ...data };
      await setDoc(doc(db, 'announcements', id), updatePayload as any);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `announcements/${id}`);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'announcements', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `announcements/${id}`);
    }
  };

  return (
    <DataContext.Provider value={{ students, todaysLogs, totalSessions, announcements, admins, user, isAdmin, isAuthReady, settings, updateSettings, addStudent, recordAttendance, deleteAttendance, deleteStudent, updateStudent, addAdmin, removeAdmin, addAnnouncement, updateAnnouncement, deleteAnnouncement, fetchLogsByDates, fetchLogsByDateRange, fetchLastLogForStudent }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
