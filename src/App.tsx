import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Activity, 
  Stethoscope, 
  MapPin, 
  ShieldAlert, 
  Globe, 
  ChevronRight, 
  Heart,
  Thermometer,
  Brain,
  User,
  CheckCircle2,
  AlertCircle,
  Camera
} from 'lucide-react';
import { cn } from './lib/utils';
import { translations, Language } from './lib/i18n';
import { Symptoms, HealthData, predictDisease, PredictionResult } from './lib/predictionEngine';
import { FaceDetection } from './components/FaceDetection';
import { HospitalMap } from './components/HospitalMap';
import { ResultCard } from './components/ResultCard';
import { EmergencyPanel } from './components/EmergencyPanel';
import { ProjectReport } from './components/ProjectReport';
import { VoiceInput } from './components/VoiceInput';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const t = translations[lang];
  
  const [step, setStep] = useState<'hero' | 'form' | 'results'>('hero');
  
  const [symptoms, setSymptoms] = useState<Symptoms>({
    fever: false,
    cough: false,
    headache: false,
    fatigue: false,
    bodyAche: false,
    soreThroat: false,
    runnyNose: false,
    chestPain: false,
    breathingDifficulty: false,
    nausea: false,
  });

  const [healthData, setHealthData] = useState<HealthData>({
    temperature: 36.6,
    mentalHealth: 'normal',
    age: 25,
    gender: 'male',
    faceAnalysis: {
      tiredness: false,
      stress: false,
      redness: false,
      dehydration: false,
      heartFeelings: false,
      confusion: false,
    }
  });

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const toggleSymptom = (key: keyof Symptoms) => {
    setSymptoms(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePredict = () => {
    const result = predictDisease(symptoms, healthData);
    setPrediction(result);
    setStep('results');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const progress = Object.values(symptoms).filter(Boolean).length * 10;

  return (
    <div className="min-h-screen pb-20">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-medical-dark/50 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setStep('hero')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-medical-blue to-medical-teal flex items-center justify-center">
              <Activity className="text-white" />
            </div>
            <span className="text-xl font-display font-bold tracking-tight">{t.title}</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
              <a href="#about" className="hover:text-white transition-colors">{t.about}</a>
              <a href="#camera" className="hover:text-white transition-colors">Camera</a>
              <a href="#predict" className="hover:text-white transition-colors">{t.predict}</a>
              <a href="#hospitals" className="hover:text-white transition-colors">{t.hospitals}</a>
              <a href="https://harishmasilamani.lovable.app" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors text-medical-teal">Developer</a>
            </div>
            <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
              <Globe size={16} className="ml-2 text-slate-500" />
              <select 
                value={lang} 
                onChange={(e) => setLang(e.target.value as Language)}
                className="bg-transparent text-xs font-bold outline-none pr-2 py-1"
              >
                <option value="en">EN</option>
                <option value="ta">TA</option>
                <option value="hi">HI</option>
                <option value="te">TE</option>
                <option value="ja">JA</option>
                <option value="ko">KO</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      <main className="pt-20 max-w-7xl mx-auto px-6">
        <AnimatePresence mode="wait">
          {step === 'hero' && (
            <motion.section 
              key="hero"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-20 flex flex-col items-center text-center"
            >
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-6 px-4 py-1.5 rounded-full bg-medical-blue/10 border border-medical-blue/20 text-medical-blue text-xs font-bold tracking-widest uppercase"
              >
                AI-Powered Healthcare Prediction
              </motion.div>
              <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tighter mb-8 leading-[0.9]">
                Your Health, <br />
                <span className="text-gradient">Intelligently Predicted.</span>
              </h1>
              <p className="text-xl text-slate-400 max-w-2xl mb-12 leading-relaxed">
                Smart Health AI uses advanced rule-based classification to analyze your symptoms, 
                facial indicators, and health data to provide early disease detection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <button onClick={() => setStep('form')} className="btn-primary flex items-center gap-2">
                  {t.getStarted} <ChevronRight size={18} />
                </button>
                <a href="#camera" className="btn-secondary flex items-center gap-2">
                  <Camera size={18} /> Enable Camera Monitor
                </a>
                <a href="#about" className="btn-secondary">
                  Learn More
                </a>
              </div>

              {/* Live Camera Feed on Landing Page */}
              <div id="camera" className="mt-20 w-full max-w-2xl">
                <div className="text-left mb-8">
                  <h2 className="text-4xl font-display font-bold mb-4">Live <span className="text-gradient">Health Monitor</span></h2>
                  <p className="text-slate-400">Enable your camera to see real-time facial health indicators and vital sign analysis.</p>
                </div>
                <FaceDetection 
                  t={t} 
                  onAnalysis={(results) => setHealthData(prev => ({ ...prev, faceAnalysis: results }))} 
                />
              </div>

              {/* Stats/Features Grid */}
              <div id="about" className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-32 w-full">
                {[
                  { icon: Stethoscope, title: 'AI Analysis', desc: 'Symptom-based diagnosis' },
                  { icon: Activity, title: 'Monitoring', desc: 'Real-time health tracking' },
                  { icon: ShieldAlert, title: 'Smart Diagnosis', desc: 'Rule-based classification' },
                  { icon: Heart, title: 'Precautions', desc: 'Personalized health tips' },
                ].map((item, i) => (
                  <motion.div 
                    key={i}
                    initial={{ y: 20, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="glass-card p-8 glass-card-hover text-left"
                  >
                    <div className="w-12 h-12 rounded-xl bg-medical-blue/10 flex items-center justify-center mb-6">
                      <item.icon className="text-medical-blue" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </motion.div>
                ))}
              </div>

              {/* Project Report Download Section */}
              <div className="mt-32 w-full max-w-2xl">
                <ProjectReport />
              </div>

              {/* Live Hospital Map Section */}
              <div id="hospitals" className="mt-32 w-full">
                <div className="text-left mb-8">
                  <h2 className="text-4xl font-display font-bold mb-4">Live <span className="text-gradient">Hospital Finder</span></h2>
                  <p className="text-slate-400">Real-time GPS-based tracking of medical facilities in your immediate vicinity.</p>
                </div>
                <HospitalMap t={t} />
              </div>
            </motion.section>
          )}

          {step === 'form' && (
            <motion.section 
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="py-12"
              id="predict"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Symptoms Form */}
                <div className="lg:col-span-2 space-y-8">
                  <div className="glass-card p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h2 className="text-2xl font-display font-bold flex items-center gap-3">
                        <Stethoscope className="text-medical-blue" />
                        {t.symptoms}
                      </h2>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono text-slate-400">{progress}% Complete</span>
                        <div className="w-24 h-1.5 bg-white/5 rounded-full overflow-hidden">
                          <motion.div 
                            className="h-full bg-medical-teal"
                            animate={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.keys(symptoms).map((key) => (
                        <button
                          key={key}
                          onClick={() => toggleSymptom(key as keyof Symptoms)}
                          className={cn(
                            "flex items-center justify-between p-4 rounded-xl border transition-all duration-300",
                            symptoms[key as keyof Symptoms] 
                              ? "bg-medical-blue/10 border-medical-blue text-white shadow-[0_0_15px_rgba(14,165,233,0.1)]" 
                              : "bg-white/5 border-white/5 text-slate-400 hover:bg-white/10"
                          )}
                        >
                          <span className="font-medium">{(t as any)[key]}</span>
                          {symptoms[key as keyof Symptoms] ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] rounded-full border-2 border-white/10" />}
                        </button>
                      ))}
                    </div>

                    {/* Critical Warning */}
                    {(symptoms.chestPain || symptoms.breathingDifficulty) && (
                      <motion.div 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-4 text-red-400"
                      >
                        <AlertCircle className="shrink-0" />
                        <p className="text-sm font-bold">{t.immediateAttention}</p>
                      </motion.div>
                    )}
                  </div>

                  <div className="glass-card p-8">
                    <h2 className="text-2xl font-display font-bold flex items-center gap-3 mb-8">
                      <Activity className="text-medical-teal" />
                      Additional Health Data
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <Thermometer size={16} /> {t.temp}
                        </label>
                        <input 
                          type="range" min="35" max="42" step="0.1"
                          value={healthData.temperature}
                          onChange={(e) => setHealthData(prev => ({ ...prev, temperature: parseFloat(e.target.value) }))}
                          className="w-full accent-medical-blue"
                        />
                        <div className="flex justify-between font-mono text-xl font-bold text-medical-blue">
                          <span>35°C</span>
                          <span>{healthData.temperature}°C</span>
                          <span>42°C</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <Brain size={16} /> {t.mentalHealth}
                        </label>
                        <div className="flex gap-2">
                          {['normal', 'stress', 'anxiety'].map((status) => (
                            <button
                              key={status}
                              onClick={() => setHealthData(prev => ({ ...prev, mentalHealth: status as any }))}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                                healthData.mentalHealth === status 
                                  ? "bg-medical-teal/10 border-medical-teal text-medical-teal" 
                                  : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                              )}
                            >
                              {(t as any)[status]}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <User size={16} /> {t.age}
                        </label>
                        <input 
                          type="number"
                          value={healthData.age}
                          onChange={(e) => setHealthData(prev => ({ ...prev, age: parseInt(e.target.value) }))}
                          className="w-full bg-white/5 border border-white/10 rounded-xl p-3 outline-none focus:border-medical-blue transition-all"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <User size={16} /> {t.gender}
                        </label>
                        <div className="flex gap-2">
                          {['male', 'female', 'other'].map((g) => (
                            <button
                              key={g}
                              onClick={() => setHealthData(prev => ({ ...prev, gender: g }))}
                              className={cn(
                                "flex-1 py-2 rounded-lg text-xs font-bold border transition-all",
                                healthData.gender === g 
                                  ? "bg-medical-blue/10 border-medical-blue text-medical-blue" 
                                  : "bg-white/5 border-white/5 text-slate-500 hover:bg-white/10"
                              )}
                            >
                              {(t as any)[g]}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Column: Face Detection & Actions */}
                <div className="space-y-8">
                  <VoiceInput 
                    lang={lang} 
                    t={t} 
                    onSymptomToggle={toggleSymptom} 
                    onHealthDataUpdate={(data) => setHealthData(prev => ({ ...prev, ...data }))} 
                  />
                  
                  <FaceDetection 
                    t={t} 
                    onAnalysis={(results) => setHealthData(prev => ({ ...prev, faceAnalysis: results }))} 
                  />
                  
                  <button 
                    onClick={handlePredict}
                    className="w-full py-6 btn-primary text-xl flex items-center justify-center gap-3 group"
                  >
                    {t.predict}
                    <ChevronRight className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <div className="glass-card p-6 bg-medical-blue/5 border-medical-blue/10">
                    <h4 className="font-bold mb-2 flex items-center gap-2">
                      <ShieldAlert size={16} className="text-medical-blue" />
                      Privacy Note
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      All analysis is performed locally on your device. Your health data and camera feed are never uploaded to any server.
                    </p>
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {step === 'results' && prediction && (
            <motion.section 
              key="results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-12 space-y-8"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-display font-bold">{t.results}</h2>
                <button onClick={() => setStep('form')} className="btn-secondary text-sm">
                  Retake Test
                </button>
              </div>

              {prediction.severity === 'Critical' && <EmergencyPanel t={t} />}

              <ResultCard result={prediction} t={t} />

              <div id="hospitals">
                <HospitalMap t={t} />
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-medical-blue to-medical-teal flex items-center justify-center">
            <Activity size={12} className="text-white" />
          </div>
          <span className="font-display font-bold">{t.title}</span>
        </div>
        <p className="text-xs text-slate-500 uppercase tracking-widest flex items-center justify-center gap-4">
          <span>Developed by <a href="https://harishmasilamani.lovable.app" target="_blank" rel="noopener noreferrer" className="text-medical-teal hover:underline">Harish Masilamani</a> &copy; 2026</span>
          <span className="w-1 h-1 bg-slate-700 rounded-full"></span>
          <button onClick={() => {
            const reportBtn = document.querySelector('button:has(svg.lucide-download)');
            if (reportBtn instanceof HTMLButtonElement) reportBtn.click();
          }} className="text-medical-blue hover:underline">Download PDF Report</button>
        </p>
        <p className="text-[10px] text-slate-600 mt-2">
          Powered by Artificial Intelligence & Machine Learning
        </p>
      </footer>
    </div>
  );
}
