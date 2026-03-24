import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, Pill, Utensils, ShieldCheck, HeartPulse } from 'lucide-react';
import { PredictionResult } from '../lib/predictionEngine';

interface ResultCardProps {
  result: PredictionResult;
  t: any;
}

export const ResultCard: React.FC<ResultCardProps> = ({ result, t }) => {
  const severityColors = {
    Low: 'text-green-400 bg-green-400/10 border-green-400/20',
    Moderate: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
    High: 'text-orange-400 bg-orange-400/10 border-orange-400/20',
    Critical: 'text-red-400 bg-red-400/10 border-red-400/20',
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-8 relative overflow-hidden"
    >
      <div className="absolute top-0 right-0 p-8 opacity-5">
        <HeartPulse size={120} className="animate-heartbeat" />
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h2 className="text-3xl font-display font-bold text-gradient mb-2">{result.disease}</h2>
          <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold border ${severityColors[result.severity]}`}>
            <AlertCircle size={14} />
            {result.severity} Severity
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-sm text-slate-400 mb-1">Confidence Level</span>
          <div className="flex items-center gap-3">
            <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${result.confidence}%` }}
                className="h-full bg-medical-blue"
              />
            </div>
            <span className="text-xl font-mono font-bold text-medical-blue">{result.confidence}%</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="glass-card p-5 bg-white/5">
          <h3 className="flex items-center gap-2 font-bold mb-4 text-medical-teal">
            <Pill size={18} />
            Suggested Medicines
          </h3>
          <ul className="space-y-2">
            {result.medicines.map((m, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-medical-teal mt-1.5 shrink-0" />
                {m}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5 bg-white/5">
          <h3 className="flex items-center gap-2 font-bold mb-4 text-medical-blue">
            <Utensils size={18} />
            Recommended Foods
          </h3>
          <ul className="space-y-2">
            {result.foods.map((f, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-medical-blue mt-1.5 shrink-0" />
                {f}
              </li>
            ))}
          </ul>
        </div>

        <div className="glass-card p-5 bg-white/5">
          <h3 className="flex items-center gap-2 font-bold mb-4 text-orange-400">
            <ShieldCheck size={18} />
            Precautionary Tips
          </h3>
          <ul className="space-y-2">
            {result.precautions.map((p, i) => (
              <li key={i} className="text-sm text-slate-300 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-1.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-8 p-4 bg-red-500/5 border border-red-500/10 rounded-xl">
        <p className="text-[10px] text-red-400/60 leading-relaxed text-center uppercase tracking-widest">
          Disclaimer: This AI prediction is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician.
        </p>
      </div>
    </motion.div>
  );
};
