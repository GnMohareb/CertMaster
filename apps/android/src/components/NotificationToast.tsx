import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Sparkles } from 'lucide-react';

export const NotificationToast: React.FC = () => {
  const { toastMessage } = useAuth();

  if (!toastMessage) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
      <div className="flex items-center space-x-2.5 px-4 py-3 rounded-xl bg-slate-900 border border-blue-500/50 shadow-2xl shadow-blue-500/20 text-xs font-bold text-white">
        <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
        <span>{toastMessage}</span>
      </div>
    </div>
  );
};
