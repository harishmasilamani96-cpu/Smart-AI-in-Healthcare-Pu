import React, { useState, useEffect, useRef } from 'react';
import { Camera, RefreshCw, Activity, Settings2, Sliders, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';

interface FaceDetectionProps {
  onAnalysis: (results: { 
    tiredness: boolean; 
    stress: boolean; 
    redness: boolean; 
    dehydration: boolean;
    heartFeelings: boolean;
    confusion: boolean;
  }) => void;
  t: any;
}

type AnalysisParam = 'tiredness' | 'stress' | 'redness' | 'dehydration' | 'pulse' | 'heartFeelings' | 'confusion';

export const FaceDetection: React.FC<FaceDetectionProps> = ({ onAnalysis, t }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isManualMode, setIsManualMode] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [percentages, setPercentages] = useState<Record<AnalysisParam, number>>({ 
    tiredness: 0, 
    stress: 0, 
    redness: 0,
    dehydration: 0,
    pulse: 72,
    heartFeelings: 0,
    confusion: 0
  });
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (stream && videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      video.onloadedmetadata = () => {
        video.play().catch(e => {
          console.error("Error playing video:", e);
        });
      };
    }
  }, [stream]);

  const startCamera = async () => {
    try {
      setCameraError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      setStream(mediaStream);
      setIsManualMode(false);
    } catch (err) {
      console.error("Error accessing camera:", err);
      if (err instanceof DOMException && err.name === 'NotAllowedError') {
        setCameraError("Camera access denied. Please allow camera permissions in your browser settings.");
      } else {
        setCameraError("Could not access camera. Please ensure no other app is using it.");
      }
    }
  };

  useEffect(() => {
    // Attempt to auto-start camera on mount
    startCamera();
    return () => stopCamera();
  }, []);

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleManualChange = (param: AnalysisParam, value: number) => {
    const newPercentages = { ...percentages, [param]: value };
    setPercentages(newPercentages);
    
    onAnalysis({
      tiredness: newPercentages.tiredness > 70,
      stress: newPercentages.stress > 80,
      redness: newPercentages.redness > 90,
      dehydration: newPercentages.dehydration > 60,
      heartFeelings: newPercentages.heartFeelings > 75,
      confusion: newPercentages.confusion > 50
    });
  };

  useEffect(() => {
    let interval: any;
    if (stream && !isManualMode) {
      setIsAnalyzing(true);
      interval = setInterval(() => {
        const newPercentages = {
          tiredness: Math.floor(Math.random() * 100),
          stress: Math.floor(Math.random() * 100),
          redness: Math.floor(Math.random() * 100),
          dehydration: Math.floor(Math.random() * 100),
          pulse: 60 + Math.floor(Math.random() * 40),
          heartFeelings: Math.floor(Math.random() * 100),
          confusion: Math.floor(Math.random() * 100)
        };
        setPercentages(newPercentages);
        
        onAnalysis({
          tiredness: newPercentages.tiredness > 70,
          stress: newPercentages.stress > 80,
          redness: newPercentages.redness > 90,
          dehydration: newPercentages.dehydration > 60,
          heartFeelings: newPercentages.heartFeelings > 75,
          confusion: newPercentages.confusion > 50
        });
      }, 3000);
    } else if (!isManualMode) {
      setIsAnalyzing(false);
      setPercentages({ 
        tiredness: 0, 
        stress: 0, 
        redness: 0, 
        dehydration: 0, 
        pulse: 72,
        heartFeelings: 0,
        confusion: 0
      });
    }
    return () => clearInterval(interval);
  }, [stream, isManualMode, onAnalysis]);

  const params: { id: AnalysisParam; label: string; icon: any }[] = [
    { id: 'tiredness', label: 'Tiredness', icon: Activity },
    { id: 'stress', label: 'Stress Level', icon: Zap },
    { id: 'redness', label: 'Skin Redness', icon: Activity },
    { id: 'dehydration', label: 'Dehydration', icon: Activity },
    { id: 'pulse', label: 'Pulse Rate', icon: Activity },
    { id: 'heartFeelings', label: 'Heart Feelings', icon: Activity },
    { id: 'confusion', label: 'Confusion', icon: Activity },
  ];

  return (
    <div className="glass-card p-6 flex flex-col items-center gap-6">
      <div className="flex items-center justify-between w-full">
        <h3 className="text-xl font-display font-bold flex items-center gap-2">
          <Camera className="text-medical-blue" />
          {t.faceDetection}
        </h3>
        <div className="flex gap-2">
          <button 
            onClick={() => setIsManualMode(!isManualMode)}
            className={cn(
              "p-2 rounded-lg transition-all border",
              isManualMode ? "bg-medical-teal/20 border-medical-teal text-medical-teal" : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
            )}
            title="Manual Override Mode"
          >
            <Sliders size={16} />
          </button>
          {stream && (
            <div className="flex items-center gap-2 px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-xs font-bold animate-pulse">
              <span className="w-2 h-2 bg-red-500 rounded-full"></span>
              {t.live}
            </div>
          )}
        </div>
      </div>

      <div className="relative w-full aspect-video bg-black/40 rounded-xl overflow-hidden border border-white/10 shadow-inner">
        <AnimatePresence mode="wait">
          {isManualMode ? (
            <motion.div 
              key="manual"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center p-8 bg-medical-dark/80 backdrop-blur-sm"
            >
              <Settings2 className="w-12 h-12 text-medical-teal mb-4 opacity-50" />
              <p className="text-sm text-slate-400 text-center mb-2 font-bold uppercase tracking-widest">Manual Override Active</p>
              <p className="text-xs text-slate-500 text-center max-w-[200px]">Adjust the sliders below to simulate facial health indicators without a camera.</p>
            </motion.div>
          ) : !stream ? (
            <motion.div 
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex flex-col items-center justify-center gap-4"
            >
              <div className="w-16 h-16 rounded-full bg-medical-blue/10 flex items-center justify-center">
                <Camera className="w-8 h-8 text-medical-blue" />
              </div>
              <button onClick={startCamera} className="btn-primary">
                Enable Camera
              </button>
              {cameraError && (
                <p className="text-xs text-red-400 mt-2 font-mono">{cameraError}</p>
              )}
            </motion.div>
          ) : (
            <motion.div 
              key="video"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="w-full h-full"
            >
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover scale-x-[-1]"
              />
              <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                <div className="absolute top-0 left-0 w-full h-1 bg-medical-blue/50 shadow-[0_0_15px_rgba(14,165,233,0.5)] animate-scan z-10"></div>
                <svg className="w-full h-full text-medical-blue/20" viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice">
                  <defs>
                    <mask id="face-mask">
                      <rect width="100%" height="100%" fill="white" />
                      <path d="M200,50 C140,50 100,100 100,160 C100,220 140,260 200,260 C260,260 300,220 300,160 C300,100 260,50 200,50 Z" fill="black" />
                    </mask>
                  </defs>
                  <rect width="100%" height="100%" fill="currentColor" mask="url(#face-mask)" />
                  <path d="M200,50 C140,50 100,100 100,160 C100,220 140,260 200,260 C260,260 300,220 300,160 C300,100 260,50 200,50 Z" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="10 5" className="text-medical-blue/40" />
                </svg>
                <div className="absolute top-10 left-10 w-8 h-8 border-t-2 border-l-2 border-medical-blue/40 rounded-tl-lg"></div>
                <div className="absolute top-10 right-10 w-8 h-8 border-t-2 border-r-2 border-medical-blue/40 rounded-tr-lg"></div>
                <div className="absolute bottom-10 left-10 w-8 h-8 border-b-2 border-l-2 border-medical-blue/40 rounded-bl-lg"></div>
                <div className="absolute bottom-10 right-10 w-8 h-8 border-b-2 border-r-2 border-medical-blue/40 rounded-br-lg"></div>
              </div>
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end z-20">
                <div className="glass-card px-3 py-2 text-xs font-mono text-medical-teal">
                  {isAnalyzing ? t.scanning : 'Ready'}
                </div>
                <button onClick={stopCamera} className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-all">
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full">
        {params.map((param) => (
          <div key={param.id} className="glass-card p-4 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <param.icon className="w-4 h-4 text-medical-teal/50" />
                <span className="text-[10px] uppercase tracking-widest font-bold text-slate-400">{param.label}</span>
              </div>
              <span className="text-sm font-mono font-bold text-medical-teal">
                {percentages[param.id]}{param.id === 'pulse' ? ' BPM' : '%'}
              </span>
            </div>
            
            {isManualMode ? (
              <input 
                type="range"
                min={param.id === 'pulse' ? 40 : 0}
                max={param.id === 'pulse' ? 180 : 100}
                value={percentages[param.id]}
                onChange={(e) => handleManualChange(param.id, parseInt(e.target.value))}
                className="w-full accent-medical-teal h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
              />
            ) : (
              <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  className="h-full bg-medical-teal"
                  animate={{ width: (isAnalyzing || isManualMode) ? `${param.id === 'pulse' ? (percentages[param.id] / 180) * 100 : percentages[param.id]}%` : '0%' }}
                  transition={{ duration: 0.5 }}
                />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
