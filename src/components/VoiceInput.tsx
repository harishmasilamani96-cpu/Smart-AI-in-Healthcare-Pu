import React, { useState, useEffect, useCallback } from 'react';
import { Mic, MicOff, Volume2, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../lib/utils';
import { Symptoms, HealthData } from '../lib/predictionEngine';

interface VoiceInputProps {
  lang: string;
  t: any;
  onSymptomToggle: (key: keyof Symptoms) => void;
  onHealthDataUpdate: (data: Partial<HealthData>) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ lang, t, onSymptomToggle, onHealthDataUpdate }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);

  const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = SpeechRecognition ? new SpeechRecognition() : null;

  if (recognition) {
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = lang;
  }

  const processTranscript = useCallback((text: string) => {
    const lowerText = text.toLowerCase();
    
    // Process Symptoms
    const symptomKeys: (keyof Symptoms)[] = [
      'fever', 'cough', 'headache', 'fatigue', 'bodyAche', 
      'soreThroat', 'runnyNose', 'chestPain', 'breathingDifficulty', 'nausea'
    ];

    symptomKeys.forEach(key => {
      const translatedSymptom = t[key]?.toLowerCase();
      if (translatedSymptom && lowerText.includes(translatedSymptom)) {
        onSymptomToggle(key);
      }
    });

    // Process Health Data
    // Age
    const ageMatch = lowerText.match(/age\s+(\d+)/i) || lowerText.match(/வயது\s+(\d+)/) || lowerText.match(/आयु\s+(\d+)/) || lowerText.match(/వయస్సు\s+(\d+)/) || lowerText.match(/年齢\s+(\d+)/) || lowerText.match(/나이\s+(\d+)/);
    if (ageMatch) {
      onHealthDataUpdate({ age: parseInt(ageMatch[1]) });
    }

    // Temperature
    const tempMatch = lowerText.match(/temp(?:erature)?\s+(\d+(?:\.\d+)?)/i) || lowerText.match(/வெப்பநிலை\s+(\d+(?:\.\d+)?)/) || lowerText.match(/तापमान\s+(\d+(?:\.\d+)?)/) || lowerText.match(/ఉష్ణోగ్రత\s+(\d+(?:\.\d+)?)/) || lowerText.match(/体温\s+(\d+(?:\.\d+)?)/) || lowerText.match(/체온\s+(\d+(?:\.\d+)?)/);
    if (tempMatch) {
      onHealthDataUpdate({ temperature: parseFloat(tempMatch[1]) });
    }

    // Gender
    if (lowerText.includes(t.male.toLowerCase())) onHealthDataUpdate({ gender: 'male' });
    if (lowerText.includes(t.female.toLowerCase())) onHealthDataUpdate({ gender: 'female' });
    if (lowerText.includes(t.other.toLowerCase())) onHealthDataUpdate({ gender: 'other' });

    // Mental Health
    if (lowerText.includes(t.normal.toLowerCase())) onHealthDataUpdate({ mentalHealth: 'normal' });
    if (lowerText.includes(t.stress.toLowerCase())) onHealthDataUpdate({ mentalHealth: 'stress' });
    if (lowerText.includes(t.anxiety.toLowerCase())) onHealthDataUpdate({ mentalHealth: 'anxiety' });

  }, [t, onSymptomToggle, onHealthDataUpdate]);

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event: any) => {
      const current = event.resultIndex;
      const resultTranscript = event.results[current][0].transcript;
      setTranscript(resultTranscript);
      
      if (event.results[current].isFinal) {
        processTranscript(resultTranscript);
      }
    };

    recognition.onerror = (event: any) => {
      setError(event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    return () => {
      recognition.stop();
    };
  }, [recognition, processTranscript]);

  const toggleListening = () => {
    if (!recognition) {
      alert('Speech recognition is not supported in this browser.');
      return;
    }

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setError(null);
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <div className="glass-card p-6 bg-medical-blue/5 border-medical-blue/10">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold flex items-center gap-2">
          <Volume2 size={18} className="text-medical-blue" />
          {t.voiceInput}
        </h3>
        <button
          onClick={toggleListening}
          className={cn(
            "p-3 rounded-full transition-all duration-300",
            isListening 
              ? "bg-red-500 text-white animate-pulse" 
              : "bg-medical-blue/10 text-medical-blue hover:bg-medical-blue/20"
          )}
        >
          {isListening ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
      </div>

      <AnimatePresence mode="wait">
        {isListening ? (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            className="space-y-2"
          >
            <div className="flex items-center gap-2 text-medical-blue text-sm font-bold">
              <div className="flex gap-1">
                {[1, 2, 3].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [4, 12, 4] }}
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-1 bg-medical-blue rounded-full"
                  />
                ))}
              </div>
              {t.listening}
            </div>
            <p className="text-sm text-slate-300 italic">"{transcript || '...'}"</p>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-start gap-3 p-3 bg-white/5 rounded-lg border border-white/5"
          >
            <Info size={16} className="text-slate-500 shrink-0 mt-0.5" />
            <p className="text-xs text-slate-400 leading-relaxed">
              {t.voiceHelp}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-2 text-[10px] text-red-400 font-mono">
          Error: {error}
        </p>
      )}
    </div>
  );
};
