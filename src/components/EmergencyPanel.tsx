import React from 'react';
import { motion } from 'motion/react';
import { Phone, AlertTriangle } from 'lucide-react';

export const EmergencyPanel: React.FC<{ t: any }> = ({ t }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card p-8 border-red-500/30 bg-red-500/5 flex flex-col items-center text-center gap-6"
    >
      <div className="w-20 h-20 rounded-full bg-red-500/20 flex items-center justify-center relative">
        <AlertTriangle size={40} className="text-red-500" />
        <div className="absolute inset-0 rounded-full border-2 border-red-500 animate-ping opacity-20"></div>
      </div>

      <div>
        <h2 className="text-2xl font-display font-bold text-red-500 mb-2">{t.immediateAttention}</h2>
        <p className="text-slate-400 max-w-md">
          Based on your reported symptoms, we recommend seeking immediate medical help. 
          Emergency services are available 24/7.
        </p>
      </div>

      <a 
        href="tel:108" 
        className="w-full max-w-sm py-4 bg-red-500 hover:bg-red-600 text-white font-bold rounded-2xl flex items-center justify-center gap-3 shadow-xl shadow-red-500/20 active:scale-95 transition-all"
      >
        <Phone size={24} />
        {t.callAmbulance}
      </a>
    </motion.div>
  );
};
