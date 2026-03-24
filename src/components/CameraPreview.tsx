import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Camera, CameraOff, RefreshCw, User, Scan } from 'lucide-react';
import { cn } from '../lib/utils';

export const CameraPreview: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setIsActive(true);
    } catch (err) {
      console.error("Error accessing camera:", err);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      setIsActive(false);
    }
  };

  const runScan = () => {
    if (!isActive) return;
    setIsScanning(true);
    setScanProgress(0);
    
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsScanning(false), 1000);
          return 100;
        }
        return prev + 2;
      });
    }, 50);
  };

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  return (
    <div className="glass-card p-6 flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h3 className="text-2xl font-display font-bold flex items-center gap-3">
          <Camera className="text-medical-blue" />
          Facial Health Scan
        </h3>
        <div className="flex gap-2">
          {!isActive ? (
            <button 
              onClick={startCamera}
              className="px-4 py-2 bg-medical-blue text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-medical-blue/90 transition-all"
            >
              <Camera size={16} />
              Enable Camera
            </button>
          ) : (
            <button 
              onClick={stopCamera}
              className="px-4 py-2 bg-red-500/10 text-red-400 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-red-500/20 transition-all"
            >
              <CameraOff size={16} />
              Disable
            </button>
          )}
        </div>
      </div>

      <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-white/10 shadow-2xl group">
        <AnimatePresence mode="wait">
          {isActive ? (
            <motion.div 
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full relative"
            >
              <video 
                ref={videoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover mirror"
              />
              
              {/* Scan Overlay */}
              <AnimatePresence>
                {isScanning && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 pointer-events-none"
                  >
                    <div className="absolute inset-0 border-2 border-medical-teal/50 m-8 rounded-xl animate-pulse" />
                    <motion.div 
                      className="absolute left-0 right-0 h-1 bg-medical-teal shadow-[0_0_15px_rgba(45,212,191,0.8)] z-10"
                      initial={{ top: "0%" }}
                      animate={{ top: "100%" }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    />
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-medical-teal/20 backdrop-blur-md px-4 py-2 rounded-full border border-medical-teal/30 text-medical-teal font-bold text-xs uppercase tracking-widest">
                      Analyzing Vital Signs... {scanProgress}%
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Camera HUD */}
              <div className="absolute top-4 left-4 flex gap-2">
                <div className="px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg border border-white/10 text-[10px] font-bold text-medical-teal flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-medical-teal animate-pulse" />
                  LIVE FEED
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full flex flex-col items-center justify-center gap-4 text-slate-500"
            >
              <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <User size={40} className="opacity-20" />
              </div>
              <p className="text-sm font-medium">Camera is currently offline</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex flex-col gap-4">
        <button 
          disabled={!isActive || isScanning}
          onClick={runScan}
          className={cn(
            "w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all shadow-xl",
            isActive && !isScanning 
              ? "bg-gradient-to-r from-medical-blue to-medical-teal text-white shadow-medical-blue/20 hover:scale-[1.02] active:scale-95" 
              : "bg-white/5 text-slate-500 cursor-not-allowed"
          )}
        >
          {isScanning ? (
            <>
              <RefreshCw size={20} className="animate-spin" />
              Processing Scan...
            </>
          ) : (
            <>
              <Scan size={20} />
              Start Health Analysis
            </>
          )}
        </button>
        
        <p className="text-[10px] text-slate-500 text-center uppercase tracking-widest leading-relaxed">
          Our AI analyzes facial micro-expressions and skin tone variations to detect early signs of fatigue, dehydration, or respiratory stress.
        </p>
      </div>

      <style>{`
        .mirror {
          transform: scaleX(-1);
        }
      `}</style>
    </div>
  );
};
