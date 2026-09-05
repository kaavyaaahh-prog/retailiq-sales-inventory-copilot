import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info';
  title: string;
  description?: string;
}

interface ToastProps {
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastProps> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          id={`toast-${toast.id}`}
          className="pointer-events-auto flex items-start gap-3 p-4 rounded-2xl shadow-2xl border backdrop-blur-xl bg-slate-900/95 transition-all duration-300 animate-in fade-in slide-in-from-bottom-3 border-slate-700/80 text-white"
        >
          {toast.type === 'success' && (
            <div className="p-1 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'error' && (
            <div className="p-1 rounded-xl bg-rose-500/10 text-rose-400 shrink-0 border border-rose-500/20">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {toast.type === 'info' && (
            <div className="p-1 rounded-xl bg-cyan-500/10 text-cyan-400 shrink-0 border border-cyan-500/20">
              <Info className="w-5 h-5" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">{toast.title}</p>
            {toast.description && (
              <p className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{toast.description}</p>
            )}
          </div>

          <button
            id={`dismiss-toast-${toast.id}`}
            onClick={() => onDismiss(toast.id)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
