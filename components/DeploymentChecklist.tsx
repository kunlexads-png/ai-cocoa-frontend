import React, { useState } from 'react';
import { CheckSquare, Square, ArrowRight, Upload, FileSpreadsheet, Shield, FileText, Rocket, CheckCircle2, Loader2 } from 'lucide-react';

interface ChecklistItem {
  id: number;
  title: string;
  description: string;
  icon: React.FC<any>;
  completed: boolean;
  actionLabel: string;
}

interface DeploymentChecklistProps {
  onInitialize: () => void;
}

export const DeploymentChecklist: React.FC<DeploymentChecklistProps> = ({ onInitialize }) => {
  const [isInitializing, setIsInitializing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [items, setItems] = useState<ChecklistItem[]>([
    {
      id: 1,
      title: "Prepare Data Import Files",
      description: "Format your production data (BatchID, Supplier, Weight, Stage, Moisture, Temp) using the CSV template. No live sensors required.",
      icon: FileSpreadsheet,
      completed: false,
      actionLabel: "Get Template"
    },
    {
      id: 2,
      title: "Upload Initial Batch Data",
      description: "Use the 'Import Data' feature to populate the dashboard with historical or current shift data.",
      icon: Upload,
      completed: false,
      actionLabel: "Import CSV"
    },
    {
      id: 3,
      title: "Validate Data Schema",
      description: "Automatic validation of columns. Ensure CSV matches the required format for correct KPI calculation.",
      icon: Shield,
      completed: true,
      actionLabel: "Auto-Validated"
    },
    {
      id: 4,
      title: "Test AI Reports",
      description: "Generate an executive summary report to verify the AI analysis on your uploaded dataset.",
      icon: FileText,
      completed: false,
      actionLabel: "Run Report"
    }
  ]);

  const toggleItem = (id: number) => {
    setItems(items.map(item => item.id === id ? { ...item, completed: !item.completed } : item));
  };

  const handleInitialize = () => {
    setIsInitializing(true);
    // Simulate system bootstrapping
    setTimeout(() => {
      setIsInitializing(false);
      setIsComplete(true);
      // Allow user to read success message before redirecting
      setTimeout(() => {
        onInitialize();
      }, 2000);
    }, 2000);
  };

  const progress = Math.round((items.filter(i => i.completed).length / items.length) * 100);

  if (isComplete) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] animate-fade-in p-6 text-center">
        <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={48} className="text-emerald-600" />
        </div>
        <h2 className="text-3xl font-black text-[#3E2723] mb-2">System Initialized!</h2>
        <p className="text-slate-500 text-lg">Redirecting to live dashboard...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto pb-12 px-4 md:px-0">
      {/* Header */}
      <div className="bg-[#3E2723] text-white p-6 md:p-8 rounded-2xl shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D9A441]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center relative z-10 gap-6">
          <div className="w-full md:w-2/3">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight mb-2">Initiative Dashboard Setup</h1>
            <p className="text-gray-300 text-sm md:text-base">Complete this checklist to validate the dashboard configuration and enable full responsiveness for the manual data mode.</p>
          </div>
          <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/10 text-center min-w-[120px] self-start md:self-auto">
            <span className="block text-3xl font-bold text-[#D9A441]">{progress}%</span>
            <span className="text-xs uppercase tracking-wider font-bold opacity-80">Readiness</span>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="mt-8 bg-black/30 h-3 rounded-full overflow-hidden backdrop-blur-sm">
          <div 
            className="h-full bg-gradient-to-r from-[#D9A441] to-[#E6007E] transition-all duration-700 ease-out relative"
            style={{ width: `${progress}%` }}
          >
            <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Checklist Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <div 
              key={item.id}
              className={`group flex flex-col sm:flex-row items-start sm:items-center p-5 bg-white rounded-xl border-2 transition-all duration-200 shadow-sm hover:shadow-md ${
                item.completed ? 'border-emerald-500/50 bg-emerald-50/10' : 'border-transparent hover:border-slate-200'
              }`}
            >
              {/* Icon & Checkbox */}
              <div className="flex items-center shrink-0 mb-3 sm:mb-0 sm:mr-4 w-full sm:w-auto">
                  <button 
                    onClick={() => toggleItem(item.id)}
                    className={`transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E6007E] rounded ${item.completed ? 'text-emerald-500' : 'text-slate-300 group-hover:text-slate-400'}`}
                  >
                    {item.completed ? <CheckSquare size={28} /> : <Square size={28} />}
                  </button>

                  <div className={`ml-3 p-2.5 rounded-full transition-colors ${
                    item.completed ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500 group-hover:bg-[#E6007E]/10 group-hover:text-[#E6007E]'
                  }`}>
                    <Icon size={20} />
                  </div>
              </div>

              {/* Text Details */}
              <div className="flex-1 min-w-0 mb-4 sm:mb-0">
                <h3 className={`font-bold text-base mb-1 ${item.completed ? 'text-emerald-900' : 'text-slate-800'}`}>
                  {item.title}
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
              </div>

              {/* Action Button */}
              <div className="w-full sm:w-auto sm:ml-4 shrink-0">
                <button 
                    onClick={() => toggleItem(item.id)}
                    className={`w-full sm:w-auto px-4 py-2 rounded-lg font-bold text-xs sm:text-sm flex items-center justify-center transition-all ${
                    item.completed 
                    ? 'bg-transparent text-emerald-600 cursor-default' 
                    : 'bg-slate-50 text-slate-600 hover:bg-[#3E2723] hover:text-[#D9A441] border border-slate-100'
                }`}>
                    {item.completed ? 'Done' : item.actionLabel}
                    {!item.completed && <ArrowRight size={14} className="ml-2" />}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer CTA */}
      <div className="mt-8 text-center pt-4 border-t border-dashed border-slate-200">
        <button 
          onClick={handleInitialize}
          disabled={progress < 100 || isInitializing}
          className={`w-full md:w-auto px-8 py-4 rounded-xl font-bold text-lg shadow-xl transition-all flex items-center justify-center mx-auto transform active:scale-95 ${
            progress === 100 && !isInitializing
              ? 'bg-[#E6007E] text-white hover:bg-pink-700 hover:shadow-2xl hover:-translate-y-1' 
              : 'bg-slate-200 text-slate-400 cursor-not-allowed'
          }`}
        >
          {isInitializing ? (
            <>
              <Loader2 size={24} className="animate-spin mr-3" />
              Initializing System...
            </>
          ) : (
            <>
              <Rocket size={24} className={`mr-3 ${progress === 100 ? 'animate-pulse' : ''}`} />
              Initialize Dashboard
            </>
          )}
        </button>
        {progress < 100 && (
          <p className="text-slate-400 text-sm mt-4 bg-slate-50 inline-block px-4 py-2 rounded-lg">
            Complete all tasks above to unlock the dashboard initialization.
          </p>
        )}
      </div>
    </div>
  );
};