import { useState, useEffect, useRef, useCallback } from 'react';
import { CheckCircle, QrCode, ScanLine, AlertCircle, Camera as CameraIcon, Flashlight, SwitchCamera } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Html5Qrcode } from 'html5-qrcode';
import toast from 'react-hot-toast';
import { useData } from '../contexts/DataContext';

export default function Attendance() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<{ success: boolean; message: string; studentName?: string; dh?: string; isDuplicate?: boolean; timestamp?: number } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [facingMode, setFacingMode] = useState<"environment" | "user">("environment");
  const [isFlashOn, setIsFlashOn] = useState(false);
  
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const scanTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processingRef = useRef(false);
  const { recordAttendance } = useData();

  useEffect(() => {
    return () => {
      // Cleanup scanner on unmount
      if (scanTimeoutRef.current) {
        clearTimeout(scanTimeoutRef.current);
      }
      if (scannerRef.current) {
        if (scannerRef.current.isScanning) {
          scannerRef.current.stop().catch(console.error);
        }
        scannerRef.current.clear().catch(console.error);
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

      // iOS-specific camera configuration for better focus
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      
      const config = {
        fps: 10,
        qrbox: { width: 280, height: 280 }, // Slightly larger QR box for better scanning
        aspectRatio: 1.0, // Force square aspect ratio for QR codes
        // Improved camera constraints for iOS
        videoConstraints: {
          facingMode: mode,
          width: { ideal: 1920 }, // Higher resolution for better coverage
          height: { ideal: 1920 }, // Square resolution for full coverage
          // Better focus mode for iOS
          advanced: [
            { focusMode: { ideal: "continuous" } },
            { exposureMode: { ideal: "continuous" } }
          ]
        }
      };

      await scannerRef.current.start(
        { facingMode: mode },
        config,
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
    if (processingRef.current) return; // Prevent during processing
    
    try {
      const newMode = facingMode === "environment" ? "user" : "environment";
      setFacingMode(newMode);
      if (isScanning) {
        await startScanner(newMode);
      }
    } catch (error) {
      console.error("Camera toggle error:", error);
      toast.error('Không thể đổi camera');
    }
  };

  const toggleFlash = async () => {
    if (processingRef.current || !scannerRef.current || !isScanning) return;
    
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
  };

  const extractStudentIdFromQR = (qrData: string): string => {
    // If QR contains URL with data parameter, extract it
    if (qrData.includes('api.qrserver.com') && qrData.includes('data=')) {
      const url = new URL(qrData);
      const studentId = url.searchParams.get('data');
      if (studentId) return studentId;
    }
    // Otherwise, return the raw data (for backward compatibility)
    return qrData;
  };

  const handleScan = async (qrData: string) => {
    // Prevent multiple simultaneous scans
    if (processingRef.current || isProcessing) {
      return;
    }

    processingRef.current = true;
    setIsProcessing(true);

    // Clear any existing timeout
    if (scanTimeoutRef.current) {
      clearTimeout(scanTimeoutRef.current);
    }

    try {
      // Stop scanning once we get a result temporarily
      await stopScanner();
      
      // Extract student ID from QR data (handles both URL and raw ID)
      const studentId = extractStudentIdFromQR(qrData);
      
      // Add timeout for network operation
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Timeout')), 30000); // 30 second timeout
      });
      
      const result = await Promise.race([
        recordAttendance(studentId),
        timeoutPromise
      ]) as any;
      
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
      scanTimeoutRef.current = setTimeout(() => {
        setScanResult(null);
        setIsProcessing(false);
        processingRef.current = false;
        if (!isScanning) {
           startScanner(facingMode);
        }
      }, 3000);
    } catch (error) {
      console.error('Scan error:', error);
      setScanResult({
        success: false,
        message: 'Có lỗi xảy ra khi điểm danh. Vui lòng thử lại.',
        timestamp: Date.now()
      });
      toast.error('Lỗi điểm danh!');
      
      // Reset after 2 seconds on error
      scanTimeoutRef.current = setTimeout(() => {
        setScanResult(null);
        setIsProcessing(false);
        processingRef.current = false;
        if (!isScanning) {
           startScanner(facingMode);
        }
      }, 2000);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto py-8 flex flex-col items-center h-full"
    >
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-on-surface mb-2">Điểm Danh</h1>
        <p className="text-on-surface-variant font-medium">Hướng camera vào mã QR của khóa sinh</p>
      </div>

      <div className="relative w-full aspect-square rounded-[40px] overflow-hidden shadow-2xl shadow-primary/10 border-8 border-white bg-surface-container group">
        
        {/* The scanner element */}
        <div id="reader" className="w-full h-full aspect-square rounded-[32px]"></div>

        {!isScanning && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-surface-container-high/60 backdrop-blur-sm z-[5]">
             <ScanLine size={48} className="text-primary mb-4 opacity-70" />
             <p className="text-sm font-bold text-on-surface-variant">Nhấn "Quét mã" để bắt đầu</p>
          </div>
        )}
        
        {isScanning && (
          <div className="absolute inset-0 pointer-events-none z-[5]">
            <div className="absolute inset-6 border-2 border-white/20 rounded-2xl">
              <div className="absolute top-0 left-0 w-10 h-10 border-t-4 border-l-4 border-primary rounded-tl-xl" />
              <div className="absolute top-0 right-0 w-10 h-10 border-t-4 border-r-4 border-primary rounded-tr-xl" />
              <div className="absolute bottom-0 left-0 w-10 h-10 border-b-4 border-l-4 border-primary rounded-bl-xl" />
              <div className="absolute bottom-0 right-0 w-10 h-10 border-b-4 border-r-4 border-primary rounded-br-xl" />
              
              <motion.div 
                animate={{ top: ['10%', '90%'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                className="absolute left-0 w-full h-0.5 bg-primary shadow-[0_0_15px_rgba(77,101,73,0.8)]"
                style={{ willChange: 'transform' }}
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
          {isProcessing && !scanResult && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="absolute bottom-6 left-6 right-6 bg-surface-container-lowest/95 backdrop-blur-xl p-5 rounded-2xl shadow-xl flex items-center gap-4 border border-primary/30 z-10"
            >
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-primary/10">
                <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <div>
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase block mb-1 text-primary">ĐANG XỬ LÝ</span>
                <h4 className="text-sm font-bold text-on-surface leading-tight">Đang điểm danh...</h4>
              </div>
            </motion.div>
          )}
          
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
