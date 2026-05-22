import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, QrCode, ScanLine, AlertCircle, Camera as CameraIcon, Flashlight, SwitchCamera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { useData } from '../contexts/DataContext';

export default function Attendance() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; studentName?: string; dh?: string; isDuplicate?: boolean; timestamp?: number } | null>(null);
  
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const { recordAttendance } = useData();

  useEffect(() => {
    return () => {
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, []);

  const startScanner = async (mode = facingMode) => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }

      setIsScanning(true);
      setScanResult(null);
      setIsFlashOn(false);

      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader");
      }

      await scannerRef.current.start(
        { facingMode: mode },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        (decodedText) => {
          handleScan(decodedText);
        },
        (errorMessage) => {
          // Ignore general scanning errors
        }
      );
    } catch (err) {
      console.error(err);
      setIsScanning(false);
      setScanResult({
        success: false,
        message: 'Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập.'
      });
      toast.error('Không thể truy cập camera!');
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current && scannerRef.current.isScanning) {
      await scannerRef.current.stop();
      if (scannerRef.current.clear) scannerRef.current.clear();
    }
    setIsScanning(false);
    setIsFlashOn(false);
  };

  const toggleCamera = async () => {
    const newMode = facingMode === "environment" ? "user" : "environment";
    setFacingMode(newMode);
    if (isScanning) {
      await startScanner(newMode);
    }
  };

  const toggleFlash = async () => {
    if (scannerRef.current && isScanning) {
      try {
        const newFlashState = !isFlashOn;
        await scannerRef.current.applyVideoConstraints({
          advanced: [{ torch: newFlashState }]
        } as any);
        setIsFlashOn(newFlashState);
      } catch (err) {
        console.error("Flash error:", err);
        toast.error('Camera hiện tại không hỗ trợ đèn Flash');
      }
    }
  };

  const handleScan = async (studentId: string) => {
    // Stop scanning once we get a result temporarily
    await stopScanner();
    const result = await recordAttendance(studentId);
    
    setScanResult({
      success: result.success,
      message: result.message,
      studentName: result.student?.name,
      dh: result.student?.dh,
      isDuplicate: result.isDuplicate,
      timestamp: Date.now()
    });

    if (result.success && !result.isDuplicate) {
       toast.success('Điểm danh thành công');
    }

    // Reset after 3 seconds and resume scanning
    setTimeout(() => {
      setScanResult(null);
      if (!isScanning) {
         startScanner(facingMode);
      }
    }, 3000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-md mx-auto py-8 flex flex-col items-center h-full"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Điểm Danh</h1>
        <p className="text-on-surface-variant font-medium">Hướng camera vào mã QR của khóa sinh</p>
      </div>

      <div className="relative w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white bg-surface-container group">
        
        {/* The scanner element */}
        <div id="reader" className="w-full h-full object-cover"></div>

        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-high/60 backdrop-blur-sm z-[5]">
             <ScanLine size={48} className="text-primary mb-4 opacity-70" />
             <p className="text-sm font-bold text-on-surface-variant">Nhấn "Quét mã" để bắt đầu</p>
          </div>
        )}
        
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-[5]">
            <div className="absolute inset-10 border-2 border-white/20 rounded-3xl">
              <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-primary rounded-tl-2xl" />
              <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-primary rounded-tr-2xl" />
              <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-primary rounded-bl-2xl" />
              <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-primary rounded-br-2xl" />
              
              <motion.div 
                animate={{ top: ['10%', '90%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(77,101,73,0.8)]"
              />
            </div>
            
            {/* Overlay Buttons for Camera controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4 pointer-events-auto">
              <button 
                onClick={toggleFlash}
                className={`p-3 rounded-full shadow-lg transition-all ${isFlashOn ? 'bg-primary text-white' : 'bg-surface-container-lowest/80 text-on-surface backdrop-blur-md hover:bg-surface-container-lowest'}`}
                title="Bật/Tắt Flash"
              >
                <Flashlight size={20} />
              </button>
              <button 
                onClick={toggleCamera}
                className="p-3 bg-surface-container-lowest/80 text-on-surface backdrop-blur-md rounded-full shadow-lg hover:bg-surface-container-lowest transition-all"
                title="Đổi Camera"
              >
                <SwitchCamera size={20} />
              </button>
            </div>
          </div>
        )}

        <AnimatePresence>
          {scanResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className={`absolute bottom-6 left-6 right-6 bg-surface-container-lowest/95 backdrop-blur-xl p-5 rounded-2xl shadow-xl flex items-center gap-4 border z-10 ${scanResult.success ? (scanResult.isDuplicate ? 'border-amber-500/20' : 'border-primary/10') : 'border-error/10'}`}
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${scanResult.success ? (scanResult.isDuplicate ? 'bg-amber-500/10' : 'bg-primary/10') : 'bg-error/10'}`}>
                {scanResult.success ? (
                  scanResult.isDuplicate ? <AlertCircle className="text-amber-500" size={24} /> : <CheckCircle className="text-primary" size={24} />
                ) : (
                  <AlertCircle className="text-error" size={24} />
                )}
              </div>
              <div>
                <span className={`text-[10px] font-bold tracking-[0.2em] uppercase block mb-1 ${scanResult.success ? (scanResult.isDuplicate ? 'text-amber-600' : 'text-primary') : 'text-error'}`}>
                  {scanResult.success ? (scanResult.isDuplicate ? 'THÔNG BÁO' : 'THÀNH CÔNG') : 'LỖI'}
                </span>
                <h4 className="text-sm font-bold text-on-surface leading-tight mb-1">
                  {scanResult.success ? scanResult.dh || scanResult.studentName : 'Lỗi Điểm Danh'}
                </h4>
                {scanResult.success ? (
                  <div className="flex flex-col gap-0.5">
                    <p className="text-xs text-on-surface-variant font-medium">
                      {scanResult.isDuplicate ? 'Khóa sinh đã điểm danh trong ngày hôm nay' : 'Bản ghi điểm danh đã được cập nhật'}
                    </p>
                    <p className="text-xs text-primary font-bold">
                      {new Date(scanResult.timestamp || Date.now()).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - {new Date(scanResult.timestamp || Date.now()).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant font-medium">
                    {scanResult.message}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {!isScanning ? (
        <button 
          onClick={() => startScanner(facingMode)}
          className="mt-12 bg-primary text-white font-bold text-lg py-5 px-12 rounded-full shadow-xl shadow-primary/20 flex items-center gap-3 hover:scale-105 active:scale-95 transition-all outline-none"
        >
          <QrCode size={24} />
          Bật máy quét
        </button>
      ) : (
        <button 
          onClick={stopScanner}
          className="mt-12 bg-surface-container-high text-on-surface font-bold text-lg py-5 px-12 rounded-full shadow-xl flex items-center gap-3 hover:scale-105 active:scale-95 transition-all outline-none"
        >
          Dừng máy quét
        </button>
      )}

    </motion.div>
  );
}
