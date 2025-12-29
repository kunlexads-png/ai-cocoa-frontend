
import React, { useEffect, useState } from 'react';
import { queueService, QueueItem } from '../services/queueService';
import { Loader2, CheckCircle, AlertCircle, X } from 'lucide-react';

export const UploadQueueWidget: React.FC = () => {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    // Correctly capture and return the cleanup function to ensure useEffect returns void or a Destructor
    const unsubscribe = queueService.subscribe((updatedQueue) => {
      setItems(updatedQueue);
      if (updatedQueue.length > 0) setIsOpen(true);
    });
    return () => unsubscribe();
  }, []);

  if (items.length === 0) return null;

  return (
    <div className={`fixed bottom-6 left-6 z-50 transition-all duration-300 ${isOpen ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0 pointer-events-none'}`}>
      <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-80 overflow-hidden">
        <div className="bg-[#3E2723] px-4 py-3 flex justify-between items-center">
           <h4 className="text-white text-xs font-bold uppercase tracking-wider">Processing Queue ({items.length})</h4>
           <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white"><X size={14}/></button>
        </div>
        <div className="max-h-64 overflow-y-auto custom-scrollbar bg-slate-50">
           {items.map(item => (
             <div key={item.id} className="p-3 border-b border-slate-100 last:border-0 bg-white flex items-center space-x-3">
                <div className="shrink-0">
                   {item.status === 'processing' && <Loader2 size={18} className="text-blue-500 animate-spin"/>}
                   {item.status === 'completed' && <CheckCircle size={18} className="text-emerald-500"/>}
                   {item.status === 'failed' && <AlertCircle size={18} className="text-rose-500"/>}
                   {item.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-slate-200"/>}
                </div>
                <div className="flex-1 min-w-0">
                   <p className="text-xs font-bold text-slate-700 truncate">{item.title}</p>
                   <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                      <div 
                        className={`h-full transition-all duration-300 ${
                            item.status === 'failed' ? 'bg-rose-500' : 
                            item.status === 'completed' ? 'bg-emerald-500' : 'bg-blue-500'
                        }`} 
                        style={{width: `${item.progress}%`}}
                      />
                   </div>
                </div>
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};
