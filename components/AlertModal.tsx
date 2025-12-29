
import React from 'react';
import { AlertOctagon, X, ArrowRight, CheckCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  action: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({ isOpen, onClose, title, message, action }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border-t-4 border-rose-500">
        
        {/* Header */}
        <div className="bg-rose-50 p-6 flex items-start space-x-4">
          <div className="p-3 bg-white rounded-full shadow-sm shrink-0">
             <AlertOctagon size={32} className="text-rose-600 animate-pulse" />
          </div>
          <div className="flex-1">
             <h3 className="text-lg font-bold text-rose-800">{title}</h3>
             <p className="text-sm text-rose-700 mt-1">{message}</p>
          </div>
          <button onClick={onClose} className="text-rose-400 hover:text-rose-700">
             <X size={20} />
          </button>
        </div>

        {/* Action Body */}
        <div className="p-6">
           <h4 className="text-xs font-bold text-slate-500 uppercase mb-3">Recommended AI Action</h4>
           
           <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start">
              <div className="mt-1 mr-3 text-blue-600">
                 <ArrowRight size={20} />
              </div>
              <p className="text-slate-800 font-medium text-sm leading-relaxed">{action}</p>
           </div>

           <div className="mt-6 flex space-x-3">
              <button 
                onClick={onClose}
                className="flex-1 py-3 border border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-colors"
              >
                Dismiss
              </button>
              <button 
                onClick={onClose}
                className="flex-1 py-3 bg-rose-600 text-white rounded-xl font-bold hover:bg-rose-700 transition-colors shadow-lg shadow-rose-200 flex items-center justify-center"
              >
                <CheckCircle size={18} className="mr-2" />
                Execute Action
              </button>
           </div>
        </div>
      </div>
    </div>
  );
};
