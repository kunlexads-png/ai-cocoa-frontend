

import React, { useState, useEffect, useRef } from 'react';
import { Camera, Scan, AlertCircle, RefreshCw, ChevronDown, Monitor, CheckCircle2, PlayCircle, Maximize2 } from 'lucide-react';
import { BoundingBox } from '../types';
import { simulateDefectDetection } from '../services/aiAnalysis';
import { CAMERA_FEEDS } from '../services/data';

export const QualityVisionPanel: React.FC = () => {
  const [selectedFeedId, setSelectedFeedId] = useState(CAMERA_FEEDS[0].id);
  const [isScanning, setIsScanning] = useState(false);
  const [boxes, setBoxes] = useState<BoundingBox[]>([]);
  const [feedStatus, setFeedStatus] = useState<'Live' | 'Analyzing' | 'Idle'>('Live');
  
  const selectedFeed = CAMERA_FEEDS.find(f => f.id === selectedFeedId) || CAMERA_FEEDS[0];

  // Auto-scan simulation when feed changes
  useEffect(() => {
    setBoxes([]);
    setFeedStatus('Live');
  }, [selectedFeedId]);

  const handleScan = () => {
    setIsScanning(true);
    setFeedStatus('Analyzing');
    
    // Simulate API delay
    setTimeout(() => {
      const newBoxes = simulateDefectDetection(selectedFeed.stage, 0.8); // High intensity for demo
      setBoxes(newBoxes);
      setIsScanning(false);
      setFeedStatus(newBoxes.length > 0 ? 'Idle' : 'Live');
    }, 1200);
  };

  const detectedCounts = boxes.reduce((acc, box) => {
    acc[box.label] = (acc[box.label] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-[600px] animate-fade-in">
      
      {/* LEFT: Camera Feeds List */}
      <div className="w-full lg:w-64 flex flex-col gap-3 shrink-0">
         <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-1 px-1">Active Cameras</h3>
         {CAMERA_FEEDS.map(feed => (
           <button
             key={feed.id}
             onClick={() => setSelectedFeedId(feed.id)}
             className={`p-3 rounded-xl border text-left transition-all hover:shadow-md group relative overflow-hidden ${
               selectedFeedId === feed.id 
                 ? 'bg-slate-800 border-slate-700 text-white shadow-lg' 
                 : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
             }`}
           >
             <div className="flex justify-between items-start mb-2 relative z-10">
               <span className={`text-xs font-bold px-2 py-0.5 rounded uppercase ${
                 selectedFeedId === feed.id ? 'bg-slate-700 text-slate-300' : 'bg-slate-100 text-slate-500'
               }`}>
                 {feed.id}
               </span>
               {selectedFeedId === feed.id && <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"/>}
             </div>
             <div className="relative z-10">
               <p className="font-bold text-sm truncate">{feed.name}</p>
               <p className={`text-xs mt-0.5 ${selectedFeedId === feed.id ? 'text-slate-400' : 'text-slate-400'}`}>
                 Stage: <span className="capitalize">{feed.stage}</span>
               </p>
             </div>
             {/* Thumbnail background for inactive state maybe? Keeping it simple for now */}
           </button>
         ))}
         
         <div className="mt-auto bg-blue-50 p-4 rounded-xl border border-blue-100">
           <div className="flex items-center text-blue-800 font-bold mb-2">
             <Monitor size={16} className="mr-2"/> System Status
           </div>
           <p className="text-xs text-blue-600">
             All 4 cameras online. <br/>
             Model: YOLOv8-COCOA-V2<br/>
             Latency: 45ms
           </p>
         </div>
      </div>

      {/* CENTER: Main Feed View */}
      <div className="flex-1 bg-black rounded-2xl overflow-hidden relative group shadow-2xl flex flex-col">
         {/* Top Overlay Bar */}
         <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/80 to-transparent z-20 flex justify-between items-start pointer-events-none">
            <div>
               <h2 className="text-white font-bold text-lg flex items-center">
                 <Camera size={20} className="mr-2 text-emerald-500"/> {selectedFeed.name}
               </h2>
               <p className="text-white/60 text-xs font-mono mt-1">
                 LIVE FEED • 1920x1080 • 30FPS
               </p>
            </div>
            <div className="flex items-center space-x-2">
               <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${
                 feedStatus === 'Analyzing' ? 'bg-blue-600 text-white animate-pulse' : 'bg-red-600 text-white'
               }`}>
                 {feedStatus === 'Analyzing' ? 'AI PROCESSING' : 'LIVE'}
               </span>
            </div>
         </div>

         {/* Image Area */}
         <div className="relative flex-1 bg-slate-900 overflow-hidden">
            <img 
               src={selectedFeed.image} 
               alt="Feed" 
               className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-transform duration-700"
            />
            
            {/* Scan Line Animation */}
            {isScanning && (
               <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/20 to-transparent z-10 animate-scan pointer-events-none"></div>
            )}

            {/* Bounding Boxes */}
            {boxes.map(box => (
              <div
                key={box.id}
                className="absolute border-2 z-10 animate-scale-in"
                style={{
                  left: `${box.x}%`,
                  top: `${box.y}%`,
                  width: `${box.width}%`,
                  height: `${box.height}%`,
                  borderColor: box.color,
                  boxShadow: `0 0 15px ${box.color}60`
                }}
              >
                <div 
                  className="absolute -top-6 left-0 text-[10px] font-bold text-white px-2 py-1 rounded-sm whitespace-nowrap shadow-sm flex items-center"
                  style={{ backgroundColor: box.color }}
                >
                  {box.label} <span className="opacity-70 ml-1">{(box.confidence * 100).toFixed(0)}%</span>
                </div>
              </div>
            ))}
         </div>

         {/* Bottom Control Bar */}
         <div className="bg-slate-900 p-4 flex justify-between items-center z-20 border-t border-slate-800">
             <div className="flex space-x-4">
                <button 
                  onClick={handleScan} 
                  disabled={isScanning}
                  className="bg-[#E6007E] hover:bg-pink-600 disabled:opacity-50 text-white px-6 py-2 rounded-lg font-bold flex items-center transition-all"
                >
                  {isScanning ? <RefreshCw className="animate-spin mr-2" size={18}/> : <Scan className="mr-2" size={18}/>}
                  {isScanning ? 'Scanning...' : 'Run Analysis'}
                </button>
             </div>
             <div className="text-slate-400 text-xs font-mono">
               {boxes.length} OBJECTS DETECTED
             </div>
         </div>
      </div>

      {/* RIGHT: Analysis Results Panel */}
      <div className="w-full lg:w-72 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col overflow-hidden shrink-0">
         <div className="p-4 border-b border-slate-100 bg-slate-50/50">
            <h3 className="font-bold text-[#3E2723] flex items-center">
              <AlertCircle size={18} className="mr-2 text-[#E6007E]"/> Detection Summary
            </h3>
         </div>
         
         <div className="flex-1 p-4 overflow-y-auto">
            {boxes.length === 0 ? (
               <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
                  <Scan size={48} className="mb-4 opacity-20"/>
                  <p className="text-sm">Run analysis to detect defects in the current frame.</p>
               </div>
            ) : (
               <div className="space-y-6">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 gap-3">
                     {Object.entries(detectedCounts).map(([label, count]) => (
                        <div key={label} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                           <p className="text-xs text-slate-500 uppercase font-bold">{label}</p>
                           <p className="text-xl font-black text-slate-800">{count}</p>
                        </div>
                     ))}
                  </div>

                  {/* List of Detections */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-3">Detailed Log</h4>
                    <div className="space-y-2">
                      {boxes.map((box, idx) => (
                        <div key={box.id} className="flex items-center justify-between text-sm p-2 hover:bg-slate-50 rounded border border-transparent hover:border-slate-100 transition-colors">
                           <div className="flex items-center">
                              <div className="w-2 h-2 rounded-full mr-2" style={{backgroundColor: box.color}}/>
                              <span className="font-medium text-slate-700">{box.label}</span>
                           </div>
                           <span className="font-mono text-slate-400 text-xs">{(box.confidence * 100).toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  {/* Action Recommendation */}
                  <div className={`p-4 rounded-xl border ${
                    boxes.some(b => b.label === 'Foreign' || b.label === 'Mold') 
                      ? 'bg-rose-50 border-rose-100' 
                      : 'bg-emerald-50 border-emerald-100'
                  }`}>
                     <h4 className={`text-xs font-bold uppercase mb-1 ${
                        boxes.some(b => b.label === 'Foreign' || b.label === 'Mold') ? 'text-rose-600' : 'text-emerald-600'
                     }`}>AI Recommendation</h4>
                     <p className={`text-sm font-medium ${
                        boxes.some(b => b.label === 'Foreign' || b.label === 'Mold') ? 'text-rose-800' : 'text-emerald-800'
                     }`}>
                        {boxes.some(b => b.label === 'Foreign') ? 'STOP LINE: Foreign Object Detected' : 
                         boxes.some(b => b.label === 'Mold') ? 'FLAG BATCH: High Mold Content' : 
                         'Batch quality within acceptable limits.'}
                     </p>
                  </div>
               </div>
            )}
         </div>
      </div>

    </div>
  );
};