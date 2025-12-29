
import React, { useState, useRef, useMemo } from 'react';
import { X, Upload, FileText, FileSpreadsheet, CheckCircle, AlertCircle, Download, RefreshCw, BarChart3, Table as TableIcon, BrainCircuit, ArrowRight, Gauge, Layers, FlaskConical } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  LineChart, Line, AreaChart, Area, Legend
} from 'recharts';

interface BulkUploadModalProps {
  onClose: () => void;
  onImport: (data: any[]) => void;
}

// Updated interface to match specific Batch Data Analysis requirements
interface ProcessedRow {
  id: string;
  batchId: string;
  bags: number;
  qty: number;
  beanWeight: number; // BW
  timeDuration: number; // TM-E
  shellLevel: number; // SL
  moisture: number; // MC
  admixture: number;
  sieve: number;
  cluster: number;
  residue: number;
  fermentedMold: number; // F/M
  freeFattyAcids: number; // FFA
  // Computed / System Fields
  qualityScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export const BulkUploadModal: React.FC<BulkUploadModalProps> = ({ onClose, onImport }) => {
  const [stage, setStage] = useState<'upload' | 'processing' | 'results'>('upload');
  const [data, setData] = useState<ProcessedRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState<'table' | 'trends'>('table');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const downloadTemplate = (type: 'csv' | 'json') => {
    let content = '';
    let mime = '';
    let filename = '';

    if (type === 'csv') {
      content = "BatchID,Bags,Qty,BW,TM-E,SL,MC,Admixture,Sieve,Cluster,Residue,F/M,FFA\nBATCH-2023-001,50,3200,1.2,45,12.5,7.2,0.5,98,2.1,0.3,1.5,1.2\nBATCH-2023-002,45,2800,1.15,48,13.0,7.8,0.8,96,2.5,0.4,2.0,1.5\nBATCH-2023-003,60,3800,1.22,42,11.8,6.9,0.4,99,1.8,0.2,0.5,0.9";
      mime = 'text/csv';
      filename = 'template_batch_analysis.csv';
    } else {
      content = JSON.stringify([
        { "BatchID": "BATCH-2023-001", "Bags": 50, "Qty": 3200, "BW": 1.2, "TM-E": 45, "SL": 12.5, "MC": 7.2, "Admixture": 0.5, "Sieve": 98, "Cluster": 2.1, "Residue": 0.3, "F/M": 1.5, "FFA": 1.2 },
        { "BatchID": "BATCH-2023-002", "Bags": 45, "Qty": 2800, "BW": 1.15, "TM-E": 48, "SL": 13.0, "MC": 7.8, "Admixture": 0.8, "Sieve": 96, "Cluster": 2.5, "Residue": 0.4, "F/M": 2.0, "FFA": 1.5 }
      ], null, 2);
      mime = 'application/json';
      filename = 'template_batch_analysis.json';
    }

    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setStage('processing');
    setProgress(10);
    setErrorMsg('');

    await new Promise(r => setTimeout(r, 600));
    setProgress(30);

    const reader = new FileReader();

    reader.onload = async (e) => {
      const text = e.target?.result as string;
      let parsedData: any[] = [];

      try {
        if (file.name.endsWith('.json')) {
          parsedData = JSON.parse(text);
        } else if (file.name.endsWith('.csv')) {
          const lines = text.split('\n').filter(l => l.trim());
          // Normalized headers parsing
          const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''));
          
          parsedData = lines.slice(1).map(line => {
            const values = line.split(',');
            const row: any = {};
            headers.forEach((h, i) => {
              const val = values[i]?.trim();
              row[h] = isNaN(Number(val)) ? val : Number(val);
            });
            return row;
          });
        } else {
          // Mock Data Generation for Excel/Demo
          parsedData = Array.from({ length: 20 }, (_, i) => ({
            batchid: `BATCH-IMP-${202300 + i}`,
            bags: Math.floor(40 + Math.random() * 40),
            qty: Math.floor(2500 + Math.random() * 2000),
            bw: 1.1 + Math.random() * 0.2,
            tme: 40 + Math.random() * 10,
            sl: 10 + Math.random() * 5,
            mc: 6.5 + Math.random() * 2.5,
            admixture: Math.random() * 2,
            sieve: 90 + Math.random() * 10,
            cluster: Math.random() * 3,
            residue: Math.random() * 1,
            fm: Math.random() * 4,
            ffa: 0.5 + Math.random() * 2.0
          }));
        }

        setProgress(70);
        
        const analyzed: ProcessedRow[] = parsedData.map((row, idx) => {
          // Map flexible headers to schema
          const batchId = row.batchid || row.id || `UNK-${idx}`;
          const bags = Number(row.bags || 0);
          const qty = Number(row.qty || row.weight || 0);
          const beanWeight = Number(row.bw || row.beanweight || 0);
          const timeDuration = Number(row.tme || row.time || 0);
          const shellLevel = Number(row.sl || row.shell || 0);
          const moisture = Number(row.mc || row.moisture || 0);
          const admixture = Number(row.admixture || 0);
          const sieve = Number(row.sieve || 0);
          const cluster = Number(row.cluster || 0);
          const residue = Number(row.residue || 0);
          const fermentedMold = Number(row.fm || row.fermentedmold || 0);
          const freeFattyAcids = Number(row.ffa || row.freefattyacids || 0);

          // Calculate Quality Score (Simplified logic)
          // Base 100, penalize for high MC, FFA, F/M
          let score = 100;
          if (moisture > 8.0) score -= (moisture - 8.0) * 5;
          if (freeFattyAcids > 1.75) score -= (freeFattyAcids - 1.75) * 10;
          if (fermentedMold > 3.0) score -= (fermentedMold - 3.0) * 3;
          score = Math.max(0, Math.min(100, Math.round(score)));

          let risk: 'Low' | 'Medium' | 'High' = 'Low';
          if (score < 80) risk = 'Medium';
          if (score < 60 || moisture > 9.0 || freeFattyAcids > 3.0) risk = 'High';

          return {
            id: `row-${idx}`,
            batchId: String(batchId),
            bags,
            qty,
            beanWeight,
            timeDuration,
            shellLevel,
            moisture,
            admixture,
            sieve,
            cluster,
            residue,
            fermentedMold,
            freeFattyAcids,
            qualityScore: score,
            riskLevel: risk
          };
        });

        await new Promise(r => setTimeout(r, 600));
        setData(analyzed);
        setProgress(100);
        setTimeout(() => setStage('results'), 500);

      } catch (error) {
        console.error("Parse error", error);
        setErrorMsg("Failed to parse file. Please ensure columns match required schema.");
        setStage('upload');
      }
    };

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      reader.dispatchEvent(new Event('load')); 
    } else {
      reader.readAsText(file);
    }
  };

  const handleExport = () => {
    const headers = "BatchID,Bags,Qty,BW,TM-E,SL,MC,Admixture,Sieve,Cluster,Residue,F/M,FFA,QualityScore,Risk\n";
    const csvContent = data.map(r => 
      `${r.batchId},${r.bags},${r.qty},${r.beanWeight},${r.timeDuration},${r.shellLevel},${r.moisture},${r.admixture},${r.sieve},${r.cluster},${r.residue},${r.fermentedMold},${r.freeFattyAcids},${r.qualityScore},${r.riskLevel}`
    ).join("\n");
    
    const blob = new Blob([headers + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Batch_Analysis_Results.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleApply = () => {
    // Convert to general BatchData format for main app
    const appData = data.map(r => ({
      id: r.batchId,
      product: 'Cocoa Beans',
      timestamp: new Date().toISOString(),
      qualityScore: r.qualityScore,
      stage: 'Analysis',
      moisture: r.moisture,
      weight: r.qty,
      bags: r.bags,
      beanWeight: r.beanWeight,
      timeDuration: r.timeDuration,
      shellLevel: r.shellLevel,
      admixture: r.admixture,
      sieve: r.sieve,
      cluster: r.cluster,
      residue: r.residue,
      fermentedMold: r.fermentedMold,
      freeFattyAcids: r.freeFattyAcids,
      riskScore: r.riskLevel === 'High' ? 85 : r.riskLevel === 'Medium' ? 50 : 10
    }));
    onImport(appData);
  };

  const metrics = useMemo(() => {
    const totalQty = data.reduce((sum, r) => sum + r.qty, 0);
    const totalBags = data.reduce((sum, r) => sum + r.bags, 0);
    const avgMC = data.length ? data.reduce((sum, r) => sum + r.moisture, 0) / data.length : 0;
    const avgFFA = data.length ? data.reduce((sum, r) => sum + r.freeFattyAcids, 0) / data.length : 0;
    return { totalQty, totalBags, avgMC, avgFFA };
  }, [data]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-[#3E2723] p-5 text-white flex justify-between items-center shrink-0">
          <div>
            <h2 className="text-xl font-bold flex items-center">
              <Upload size={24} className="mr-3 text-[#D9A441]" />
              Batch Data Analysis Import
            </h2>
            <p className="text-xs text-gray-300 mt-1">Manual File Upload Mode • Supports CSV, JSON, Excel</p>
          </div>
          <button onClick={onClose} className="hover:bg-white/10 p-2 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-hidden flex flex-col bg-slate-50 relative">
          
          {/* Error Message */}
          {errorMsg && (
            <div className="absolute top-0 left-0 right-0 z-20 bg-rose-50 p-4 border-b border-rose-100 flex items-center text-rose-700 text-sm font-bold shadow-sm">
               <AlertCircle size={18} className="mr-2"/> {errorMsg}
               <button onClick={() => setErrorMsg('')} className="ml-auto hover:text-rose-900"><X size={14}/></button>
            </div>
          )}
          
          {/* Stage 1: Upload */}
          {stage === 'upload' && (
            <div className="flex-1 flex flex-col items-center justify-center p-6 overflow-y-auto">
              <div className="w-full max-w-2xl border-2 border-dashed border-slate-300 rounded-3xl bg-white hover:bg-slate-50 transition-colors relative p-12 flex flex-col items-center shadow-sm group">
                <input 
                  type="file" 
                  ref={fileInputRef}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  accept=".csv,.json,.xlsx,.xls"
                  onChange={(e) => {
                    if (e.target.files?.[0]) processFile(e.target.files[0]);
                  }}
                />
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Upload size={36} className="text-blue-500" />
                </div>
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Upload Batch File</h3>
                <p className="text-slate-500 mb-8 text-center max-w-md">
                  Drag & drop or click to upload your production data.<br/>
                  <span className="text-xs mt-2 block text-slate-400">Supported: CSV, JSON, Excel</span>
                </p>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-slate-400 font-mono bg-slate-100 p-4 rounded-xl w-full">
                   <div>• BatchID</div><div>• Bags</div><div>• Qty</div><div>• BW</div>
                   <div>• TM-E</div><div>• SL</div><div>• MC</div><div>• Admixture</div>
                   <div>• Sieve</div><div>• Cluster</div><div>• Residue</div><div>• F/M</div>
                </div>
              </div>

              <div className="mt-8 flex gap-4">
                 <button onClick={() => downloadTemplate('csv')} className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-[#E6007E] transition-colors">
                    <FileText size={14} className="mr-2 text-emerald-600"/> CSV Template
                 </button>
                 <button onClick={() => downloadTemplate('json')} className="flex items-center px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-[#E6007E] transition-colors">
                    <BrainCircuit size={14} className="mr-2 text-purple-600"/> JSON Template
                 </button>
              </div>
            </div>
          )}

          {/* Stage 2: Processing */}
          {stage === 'processing' && (
            <div className="flex-1 flex flex-col items-center justify-center p-12">
              <RefreshCw size={64} className="text-[#E6007E] animate-spin mb-8" />
              <h3 className="text-2xl font-bold text-[#3E2723] mb-2">Analyzing {fileName}</h3>
              <p className="text-slate-500 mb-8">Validating fields and calculating risk scores...</p>
              <div className="w-full max-w-md bg-slate-200 h-4 rounded-full overflow-hidden shadow-inner">
                <div className="h-full bg-[#E6007E] transition-all duration-300 ease-out" style={{ width: `${progress}%` }}></div>
              </div>
            </div>
          )}

          {/* Stage 3: Results */}
          {stage === 'results' && (
            <div className="flex-1 flex flex-col h-full overflow-hidden">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-b border-slate-200 bg-white shrink-0">
                 <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                    <p className="text-xs font-bold text-blue-400 uppercase">Avg Moisture (MC)</p>
                    <p className="text-2xl font-black text-blue-700">{metrics.avgMC.toFixed(2)}%</p>
                 </div>
                 <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                    <p className="text-xs font-bold text-purple-400 uppercase">Avg FFA</p>
                    <p className="text-2xl font-black text-purple-700">{metrics.avgFFA.toFixed(2)}</p>
                 </div>
                 <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
                    <p className="text-xs font-bold text-amber-400 uppercase">Total Bags</p>
                    <p className="text-2xl font-black text-amber-700">{metrics.totalBags.toLocaleString()}</p>
                 </div>
                 <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
                    <p className="text-xs font-bold text-emerald-400 uppercase">Total Qty (kg)</p>
                    <p className="text-2xl font-black text-emerald-700">{metrics.totalQty.toLocaleString()}</p>
                 </div>
              </div>

              {/* Toolbar */}
              <div className="bg-slate-50 border-b border-slate-200 p-3 flex justify-between items-center shrink-0">
                 <div className="flex space-x-1 bg-white border border-slate-200 rounded-lg p-1">
                    <button onClick={() => setActiveTab('table')} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center transition-all ${activeTab === 'table' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                       <TableIcon size={14} className="mr-2"/> Table View
                    </button>
                    <button onClick={() => setActiveTab('trends')} className={`px-4 py-1.5 rounded-md text-xs font-bold flex items-center transition-all ${activeTab === 'trends' ? 'bg-[#3E2723] text-white shadow-sm' : 'text-slate-500 hover:bg-slate-100'}`}>
                       <BarChart3 size={14} className="mr-2"/> Trend Analysis
                    </button>
                 </div>
                 <div className="flex space-x-3">
                    <button onClick={handleExport} className="flex items-center px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-600 hover:border-[#E6007E] transition-colors">
                       <Download size={14} className="mr-2"/> Export CSV
                    </button>
                    <button onClick={handleApply} className="flex items-center px-4 py-1.5 bg-[#E6007E] text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition-colors shadow-lg shadow-pink-200">
                       Import Data <ArrowRight size={14} className="ml-2"/>
                    </button>
                 </div>
              </div>

              {/* Main Content Area */}
              <div className="flex-1 overflow-auto bg-slate-100 p-4">
                {activeTab === 'table' && (
                  <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead className="bg-slate-50 text-slate-500 font-bold uppercase border-b border-slate-200">
                          <tr>
                            <th className="p-3 sticky left-0 bg-slate-50 z-10">Batch ID</th>
                            <th className="p-3">Bags</th>
                            <th className="p-3">Qty</th>
                            <th className="p-3">BW</th>
                            <th className="p-3">TM-E</th>
                            <th className="p-3">SL</th>
                            <th className="p-3">MC</th>
                            <th className="p-3">Admix</th>
                            <th className="p-3">Sieve</th>
                            <th className="p-3">Cluster</th>
                            <th className="p-3">Residue</th>
                            <th className="p-3">F/M</th>
                            <th className="p-3">FFA</th>
                            <th className="p-3 text-right">Risk</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {data.map((row, i) => (
                            <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 font-bold text-slate-700 sticky left-0 bg-white border-r border-slate-100">{row.batchId}</td>
                              <td className="p-3">{row.bags}</td>
                              <td className="p-3 font-mono">{row.qty}</td>
                              <td className="p-3">{row.beanWeight.toFixed(2)}</td>
                              <td className="p-3">{row.timeDuration}</td>
                              <td className="p-3">{row.shellLevel.toFixed(1)}</td>
                              <td className={`p-3 font-bold ${row.moisture > 8 ? 'text-rose-600' : 'text-slate-700'}`}>{row.moisture.toFixed(1)}%</td>
                              <td className="p-3">{row.admixture.toFixed(1)}</td>
                              <td className="p-3">{row.sieve}</td>
                              <td className="p-3">{row.cluster.toFixed(1)}</td>
                              <td className="p-3">{row.residue.toFixed(1)}</td>
                              <td className="p-3">{row.fermentedMold.toFixed(1)}</td>
                              <td className={`p-3 font-bold ${row.freeFattyAcids > 1.75 ? 'text-amber-600' : 'text-slate-700'}`}>{row.freeFattyAcids.toFixed(2)}</td>
                              <td className="p-3 text-right">
                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                  row.riskLevel === 'Low' ? 'bg-emerald-100 text-emerald-700' : 
                                  row.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'
                                }`}>
                                  {row.riskLevel}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {activeTab === 'trends' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                    {/* MC Trend */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-[#3E2723] flex items-center"><Gauge size={18} className="mr-2 text-blue-500"/> Moisture Content (MC) Trend</h4>
                        <span className="text-xs font-bold text-slate-400 uppercase">Target: &lt; 8.0%</span>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={data}>
                            <defs>
                              <linearGradient id="colorMC" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1}/>
                                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="batchId" hide />
                            <YAxis domain={[0, 15]} hide />
                            <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}}/>
                            <Area type="monotone" dataKey="moisture" stroke="#3b82f6" fillOpacity={1} fill="url(#colorMC)" strokeWidth={2} name="MC %"/>
                            <Line type="monotone" dataKey={() => 8.0} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} dot={false} name="Limit"/>
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* FFA Trend */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                      <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-[#3E2723] flex items-center"><FlaskConical size={18} className="mr-2 text-purple-500"/> Free Fatty Acids (FFA) Trend</h4>
                        <span className="text-xs font-bold text-slate-400 uppercase">Target: &lt; 1.75</span>
                      </div>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="batchId" hide />
                            <YAxis domain={[0, 5]} hide />
                            <Tooltip contentStyle={{borderRadius: '8px', fontSize: '12px'}}/>
                            <Line type="monotone" dataKey="freeFattyAcids" stroke="#8b5cf6" strokeWidth={3} dot={false} name="FFA"/>
                            <Line type="monotone" dataKey={() => 1.75} stroke="#ef4444" strokeDasharray="3 3" strokeWidth={1} dot={false} name="Limit"/>
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Bean Weight Trend */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 lg:col-span-2">
                       <h4 className="font-bold text-[#3E2723] mb-6 flex items-center"><Layers size={18} className="mr-2 text-[#D9A441]"/> Bean Weight (BW) Consistency</h4>
                       <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                            <XAxis dataKey="batchId" tick={{fontSize: 10}} interval={0} angle={-45} textAnchor="end" height={60}/>
                            <YAxis domain={[0, 2]} hide/>
                            <Tooltip cursor={{fill: 'transparent'}} contentStyle={{borderRadius: '8px', fontSize: '12px'}}/>
                            <Bar dataKey="beanWeight" fill="#D9A441" radius={[4, 4, 0, 0]} name="Bean Weight (g)" barSize={20} />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
