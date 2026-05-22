import React, { useState, useMemo, useCallback } from 'react';
import { motion } from 'motion/react';
import { useData, Student } from '../contexts/DataContext';
import { sortStudentsGlobal } from '../lib/utils';
import { DEFAULT_GROUPS } from '../lib/constants';

import { ParticipantStats } from '../features/participants/ParticipantStats';
import { ParticipantFilters } from '../features/participants/ParticipantFilters';
import { ParticipantList } from '../features/participants/ParticipantList';
import { ParticipantModals } from '../features/participants/ParticipantModals';

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image()
    image.addEventListener('load', () => resolve(image))
    image.addEventListener('error', (error) => reject(error))
    image.src = url
  })

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: any
): Promise<string> => {
  const image = await createImage(imageSrc)
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('No 2d context')
  }

  canvas.width = 150
  canvas.height = 150

  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    150,
    150
  )

  return canvas.toDataURL('image/jpeg', 0.6)
}

export default function Participants() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterGroup, setFilterGroup] = useState('all');
  const { students, todaysLogs, deleteStudent, addStudent, updateStudent, settings, fetchLastLogForStudent } = useData();

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

    defaultOrder.forEach(g => {
      if (!extractedGroups.includes(g)) extractedGroups.push(g);
    });

    return ['all', ...extractedGroups];
  }, [students]);

  const formGroups = useMemo(() => groups.filter(g => g !== 'all'), [groups]);

  const [modalState, setModalState] = useState<'view' | 'qr' | 'edit' | 'add' | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({ name: '', dh: '', group: 'Sen Non', phone: '', dob: '', joinDate: '' });
  const [lastLog, setLastLog] = useState<any>(null);

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleOpenModal = (type: 'view' | 'qr' | 'edit' | 'add', student?: Student) => {
    setSelectedStudent(student || null);
    setModalState(type);
    if (type === 'edit' && student) {
      setFormData({ name: student.name, dh: student.dh, group: student.group, phone: student.phone, dob: student.dob, joinDate: student.joinDate || '' });
    } else if (type === 'add') {
      setFormData({ name: '', dh: '', group: 'Sen Non', phone: '', dob: '', joinDate: '' });
    }

    if (type === 'view' && student) {
      fetchLastLogForStudent(student.id).then(log => setLastLog(log));
    } else {
      setLastLog(null);
    }
  };

  const handleCloseModal = () => {
    setModalState(null);
    setSelectedStudent(null);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (modalState === 'edit' && selectedStudent) {
      updateStudent(selectedStudent.id, formData);
    } else if (modalState === 'add') {
      addStudent({ ...formData, avatar: null });
    }
    handleCloseModal();
  };

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleUploadAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && selectedStudent) {
      if (file.size > 20 * 1024 * 1024) {
        alert("Kích thước ảnh không được vượt quá 20MB");
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        setImageToCrop(event.target?.result as string);
        e.target.value = '';
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropConfirm = async () => {
    if (!imageToCrop || !croppedAreaPixels || !selectedStudent) return;
    try {
      const croppedImageBase64 = await getCroppedImg(imageToCrop, croppedAreaPixels);
      await updateStudent(selectedStudent.id, { avatar: croppedImageBase64 });
      setSelectedStudent({ ...selectedStudent, avatar: croppedImageBase64 });
      setImageToCrop(null);
    } catch (e) {
      console.error(e);
      alert('Có lỗi xảy ra khi lưu ảnh. Vui lòng thử lại.');
    }
  };

  const handleDelete = (id: string) => {
    if (settings.requireDeleteConfirm) {
      if (window.confirm('Bạn có chắc chắn muốn xóa khóa sinh này?')) {
        deleteStudent(id);
      }
    } else {
      deleteStudent(id);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const attendedIds = new Set<string>(todaysLogs.map(log => log.studentId));

  const filteredStudents = students.filter(s => {
    const isAttended = attendedIds.has(s.id);

    const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.dh.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm) ||
      s.id.includes(searchTerm);

    const matchesStatus = filterStatus === 'all' ? true :
      (filterStatus === 'attended' ? isAttended : !isAttended);

    const matchesGroup = filterGroup === 'all' ? true : s.group === filterGroup;

    return matchesSearch && matchesStatus && matchesGroup;
  });

  const sortedStudents = useMemo(() => {
    return sortStudentsGlobal(filteredStudents);
  }, [filteredStudents]);

  let currentGroup = '';
  let currentStt = 0;
  const studentsWithStt = sortedStudents.map(student => {
    if (student.group !== currentGroup) {
      currentGroup = student.group;
      currentStt = 1;
    } else {
      currentStt++;
    }
    return { ...student, stt: currentStt };
  });

  const totalParticipants = students.length;
  const groupStats = useMemo(() => {
    const stats: Record<string, number> = {};
    DEFAULT_GROUPS.forEach(g => stats[g] = 0);
    students.forEach(s => {
      if (s.group) {
        stats[s.group] = (stats[s.group] || 0) + 1;
      }
    });
    return stats;
  }, [students]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="h-full flex flex-col"
    >
      <div className="mb-8">
        <p className="text-[10px] font-bold tracking-[0.2em] text-outline uppercase mb-2">Management Portal / Participants</p>
        <h2 className="text-3xl font-bold text-on-surface">Quản lý Khóa sinh</h2>
      </div>

      <ParticipantStats 
        totalParticipants={totalParticipants} 
        groupStats={groupStats} 
        defaultOrder={DEFAULT_GROUPS} 
      />

      <ParticipantFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
        filterGroup={filterGroup}
        setFilterGroup={setFilterGroup}
        groups={groups}
        onAddClick={() => handleOpenModal('add')}
      />

      <ParticipantList
        studentsWithStt={studentsWithStt}
        attendedIds={attendedIds}
        onOpenModal={handleOpenModal}
        onDelete={handleDelete}
      />

      <ParticipantModals
        modalState={modalState}
        selectedStudent={selectedStudent}
        formData={formData}
        setFormData={setFormData}
        lastLog={lastLog}
        imageToCrop={imageToCrop}
        crop={crop}
        setCrop={setCrop}
        zoom={zoom}
        setZoom={setZoom}
        onClose={handleCloseModal}
        onSubmit={handleFormSubmit}
        onUploadAvatar={handleUploadAvatar}
        onCropComplete={onCropComplete}
        onCropConfirm={handleCropConfirm}
        setImageToCrop={setImageToCrop}
        formGroups={formGroups}
      />
    </motion.div>
  );
}
