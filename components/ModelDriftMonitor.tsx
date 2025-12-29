
import React, { useState } from 'react';
import { MOCK_MODEL_METRICS } from '../services/data';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, AlertTriangle, RefreshCw, CheckCircle, BrainCircuit, Database, Layers } from 'lucide-react';

export const ModelDriftMonitor: React.FC = () => {
  const [isRetraining, setIsRetraining] = useState(false);
  const [modelStatus, setModelStatus] = useState<'Active' | 'Drift Detected' | 'Retraining'>('Drift Detected');

  // Detect recent drift
  const latestMetric = MOCK_MODEL_METRICS[MOCK_MODEL_METRICS.length - 1];
  const isDrifting = latestMetric.accuracy < 90;

  const handleRetrain = () => {
    setIsRetraining(true);
    setModelStatus('Retraining');
    setTimeout(() => {
      setIsRetraining(false);
      setModelStatus('Active');
    }, 4000); // Simulate 4s retraining
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Banner */}
      <div className={`p-4 rounded-xl border flex justify-between items-center ${
        modelStatus === 'Drift Detected' ? 'bg-amber-50 border-amber-200' : 
        modelStatus === 'Retraining' ? 'bg-blue-50 border-blue-200' : 'bg-emerald-50 border-emerald-200'
      }`}>
        <div className="flex items-center space-x-3">
           <div className={`p-2 rounded-full ${
             modelStatus === 'Drift Detected' ? 'bg-amber-100 text-amber-600' :
             modelStatus === 'Retraining' ? 'bg-blue-100 text-blue-600 animate-spin' : 'bg-emerald-100 text-emerald-600'
           }`}>
             {modelStatus === 'Retraining' ? <RefreshCw size={24}/> : modelStatus === 'Drift Detected' ? <AlertTriangle size={24}/> : <CheckCircle size={24}/>}
           </div>
           <div>
             <h3 className={`font-bold ${
               modelStatus === 'Drift Detected' ? 'text-amber-800' : 'text-slate-800'
             }`}>
               Model Status: {modelStatus}
             </h3>
             <p className="text-xs text-slate-500">
               {modelStatus === 'Drift Detected' ? 'Performance drop >10% detected in last 5 days.' : 
                modelStatus === 'Retraining' ? 'Ingesting recent labeled data and updating weights...' : 'Model performing within optimal parameters.'}
             </p>
           </div>
        </div>
        {modelStatus === 'Drift Detected' && (
          <button 
            onClick={handleRetrain}
            className="px-4 py-2 bg-amber-600 text-white font-bold rounded-lg hover:bg-amber-700 transition-colors shadow-sm flex items-center"
          >
            <RefreshCw size={16} className="mr-2"/> Trigger Retrain
          </button>
        )}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Performance Chart */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-200">
           <h4 className="font-bold text-[#3E2723] mb-4 flex items-center">
             <Activity size={20} className="mr-2 text-[#E6007E]"/> 30-Day Accuracy Trend
           </h4>
           <div className="h-64">
             <ResponsiveContainer width="100%" height="100%">
               <LineChart data={MOCK_MODEL_METRICS}>
                 <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                 <XAxis dataKey="day" hide />
                 <YAxis domain={[80, 100]} />
                 <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                   itemStyle={{ color: '#3E2723', fontWeight: 'bold' }}
                 />
                 <ReferenceLine y={90} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Drift Threshold (90%)', position: 'insideBottomLeft', fill: '#ef4444', fontSize: 12 }} />
                 <Line type="monotone" dataKey="accuracy" stroke="#E6007E" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
               </LineChart>
             </ResponsiveContainer>
           </div>
        </div>

        {/* Right: MLOps Stats & Guidance */}
        <div className="space-y-6">
           
           {/* Current Metrics Card */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Current Validation Metrics</h4>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Accuracy</p>
                    <p className={`text-xl font-bold ${isDrifting ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {latestMetric.accuracy}%
                    </p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">MAE (Error)</p>
                    <p className="text-xl font-bold text-slate-700">{latestMetric.mae}</p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Precision</p>
                    <p className="text-xl font-bold text-slate-700">0.89</p>
                 </div>
                 <div className="p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-400">Recall</p>
                    <p className="text-xl font-bold text-slate-700">0.92</p>
                 </div>
              </div>
           </div>

           {/* Dataset Info Card */}
           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <h4 className="text-xs font-bold text-slate-500 uppercase mb-4">Training Dataset Health</h4>
              <ul className="space-y-3">
                 <li className="flex items-center text-sm text-slate-700">
                    <Database size={16} className="mr-3 text-blue-500"/>
                    <span>Total Labeled Images: <span className="font-bold">2,450</span></span>
                 </li>
                 <li className="flex items-center text-sm text-slate-700">
                    <Layers size={16} className="mr-3 text-purple-500"/>
                    <span>Defect Classes: <span className="font-bold">4</span></span>
                 </li>
                 <li className="flex items-center text-sm text-slate-700">
                    <BrainCircuit size={16} className="mr-3 text-pink-500"/>
                    <span>Last Training: <span className="font-bold">5 days ago</span></span>
                 </li>
              </ul>
           </div>

        </div>
      </div>

      {/* Practical Guidance Section */}
      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
         <h4 className="font-bold text-[#3E2723] mb-3">MLOps Practical Guidance</h4>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-slate-600">
            <div>
               <strong className="block text-slate-800 mb-1">Dataset Requirements</strong>
               <p>For robust defect detection, ensure minimum 2,000 annotated images. Use augmentation (rotation, blur) to expand small datasets 5x.</p>
            </div>
            <div>
               <strong className="block text-slate-800 mb-1">Drift Monitoring Strategy</strong>
               <p>We save 'Prediction vs Actual' for every batch. If accuracy drops >10% over a 30-day window, immediate retraining is recommended using the latest "drifted" data.</p>
            </div>
         </div>
      </div>
    </div>
  );
};
