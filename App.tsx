import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, BatchData, UserRole, MaintenanceTicket, ExportBatch, ExportDocument, ProductionStage, MachineOEE, BatchTraceabilityData, MachineHealth, YieldBatch, SafetyAlert, ZoneRisk } from './types';
import { OFISidebar } from './components/Sidebar';
import { KPICard } from './components/KPICard';
import { QualityVisionPanel } from './components/QualityVisionPanel';
import { UploadQueueWidget } from './components/UploadQueueWidget';
import { AuditLogViewer } from './components/AuditLogViewer';
import { DeploymentChecklist } from './components/DeploymentChecklist';
import { BulkUploadModal } from './components/BulkUploadModal';
import { generatePlantReport } from './services/geminiService';
import { auditService } from './services/auditService';
import { 
  BATCH_HISTORY, MOCK_SAFETY_ALERTS, MOCK_WORKFLOW_STAGES, 
  MOCK_ENERGY_DATA, MOCK_MACHINE_HEALTH, 
  MOCK_MANAGEMENT_DATA, EFFICIENCY_DATA,
  MOCK_YIELD_DATA, MOCK_ZONE_RISKS, MOCK_MACHINE_OEE
} from './services/data';
import { AIChatAssistant } from './components/AIChatAssistant';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area,
  BarChart, Bar, Cell, PieChart, Pie, Legend, ComposedChart, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts';
import { 
  Search, AlertTriangle, RefreshCw, 
  Activity, Menu, Droplet, ShieldAlert,
  ThermometerSun, Wind, ArrowRight,
  Sun, Flame, TrendingDown,
  Truck, Upload, Microscope, Gauge, AlertCircle, PlusCircle,
  Factory, Sparkles, MonitorPlay, FileCheck, ClipboardList, FileText, Scan, CheckCircle, 
  Globe, Plane, Stamp, FileBadge, XCircle, Download, BookOpen, Scale, Wrench, Clock, Settings, PenTool, CheckSquare, History, Box, Timer, Sliders, TrendingUp, UserCheck, ShieldCheck, Lock, Users, Biohazard, TestTube, HardHat, FileSignature, LayoutDashboard, ChevronRight, MapPin, Database, Zap,
  FileWarning, FileSearch, ShieldX, Ship, Eye, Calendar, FilePen, User, Presentation, ListChecks, ArrowDownRight, Workflow, ActivitySquare, Cpu, CheckCircle2, Loader2, Info, X, FlaskConical, Printer, CloudRain, Fan
} from 'lucide-react';

const ROLE_PERMISSIONS: Record<UserRole, ViewState[]> = {
  [UserRole.OPERATOR]: Object.values(ViewState),
  [UserRole.PLANT_MANAGER]: Object.values(ViewState)
};

// --- YIELD & LOSS VIEW ---
const YieldLossView: React.FC<{ batchData: BatchData[] }> = ({ batchData }) => {
  const yieldMetrics = useMemo(() => {
    const totalInput = batchData.reduce((acc, b) => acc + (b.weight || 0), 0);
    const totalOutput = batchData.reduce((acc, b) => acc + (b.outputWeight || (b.weight ? b.weight * 0.85 : 0)), 0);
    const totalLoss = totalInput - totalOutput;
    const efficiency = totalInput > 0 ? (totalOutput / totalInput) * 100 : 0;
    
    // Map data for charts
    const chartData = batchData.slice(-10).map(b => ({
      id: b.id,
      input: b.weight || 0,
      output: b.outputWeight || (b.weight ? b.weight * 0.85 : 0),
      loss: (b.weight || 0) - (b.outputWeight || (b.weight ? b.weight * 0.85 : 0))
    }));

    return { totalInput, totalOutput, totalLoss, efficiency, chartData };
  }, [batchData]);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#3E2723] flex items-center">
            <PieChart className="mr-3 text-[#E6007E]" size={28}/> Yield & Loss Analysis
          </h2>
          <p className="text-slate-500 text-sm">Processing {batchData.length} batches from uploaded data.</p>
        </div>
        <button className="w-full md:w-auto px-4 py-2 bg-[#3E2723] text-white rounded-xl text-sm font-bold flex items-center justify-center shadow-md">
          <Download size={16} className="mr-2"/> Export Report
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard metric={{ label: "Total Input", value: yieldMetrics.totalInput.toLocaleString(), unit: "kg", trend: 0, status: 'good' }} />
        <KPICard metric={{ label: "Total Output", value: yieldMetrics.totalOutput.toLocaleString(), unit: "kg", trend: 0, status: 'good' }} />
        <KPICard metric={{ label: "Overall Loss", value: yieldMetrics.totalLoss.toLocaleString(), unit: "kg", trend: 1.2, status: yieldMetrics.efficiency < 85 ? 'warning' : 'good' }} />
        <KPICard metric={{ label: "Efficiency Score", value: yieldMetrics.efficiency.toFixed(1), unit: "%", trend: -0.5, status: yieldMetrics.efficiency < 85 ? 'warning' : 'good' }} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <h3 className="font-bold text-[#3E2723] mb-6 flex items-center">
            <TrendingUp size={18} className="mr-2 text-emerald-500"/> Mass Balance (Recent Batches)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={yieldMetrics.chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                <XAxis dataKey="id" hide />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}}/>
                <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}/>
                <Bar dataKey="input" fill="#e2e8f0" radius={[6, 6, 0, 0]} name="Input (kg)"/>
                <Bar dataKey="output" fill="#E6007E" radius={[6, 6, 0, 0]} name="Output (kg)"/>
                <Line type="monotone" dataKey="loss" stroke="#f59e0b" strokeWidth={3} name="Loss (kg)"/>
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
          <h3 className="font-bold text-[#3E2723] mb-4">Batch Efficiency Tracking</h3>
          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            {batchData.slice(0, 10).map((batch, idx) => (
              <div key={idx} className="p-4 bg-slate-50 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className={`p-2 rounded-lg text-white ${batch.qualityScore > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}>
                    <Activity size={16}/>
                  </div>
                  <div>
                    <p className="font-bold text-[#3E2723] truncate w-32 md:w-48">{batch.id}</p>
                    <p className="text-[10px] text-slate-400 uppercase font-black">Moisture: {batch.moisture}%</p>
                  </div>
                </div>
                <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Quality</p>
                    <p className={`font-black ${batch.qualityScore < 90 ? 'text-rose-500' : 'text-emerald-600'}`}>{batch.qualityScore}%</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${batch.qualityScore > 90 ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                    {batch.qualityScore > 90 ? 'OPTIMAL' : 'RECOVERY'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// --- SAFETY VIEW ---
const SafetyView: React.FC<{ batchData: BatchData[] }> = ({ batchData }) => {
  // Generate dynamic alerts based on batch data
  const dynamicAlerts = useMemo(() => {
    const alerts: SafetyAlert[] = [...MOCK_SAFETY_ALERTS];
    batchData.forEach(batch => {
      if ((batch.moisture || 0) > 8.5) {
        alerts.push({
          id: `DYN-AL-${batch.id}`,
          type: 'Moisture Hazard',
          severity: 'High',
          location: 'Drying Floor',
          timestamp: 'Live',
          description: `Batch ${batch.id} moisture level (${batch.moisture}%) exceeds safe storage threshold. Risk of mold proliferation.`,
          status: 'Active'
        });
      }
    });
    return alerts;
  }, [batchData]);

  const riskScore = useMemo(() => {
    const highMoistureBatches = batchData.filter(b => (b.moisture || 0) > 8).length;
    const baseScore = 95;
    return Math.max(60, baseScore - (highMoistureBatches * 5));
  }, [batchData]);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#3E2723] flex items-center">
            <ShieldAlert className="mr-3 text-rose-600" size={28}/> Occupational Safety & Hazards
          </h2>
          <p className="text-slate-500 text-sm">Monitoring hazards based on {batchData.length} active process records.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button className="flex-1 md:flex-none px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-rose-200 uppercase tracking-widest">Acknowledge All</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-full">
            <h3 className="font-bold text-[#3E2723] mb-6 flex items-center">
              <Zap size={18} className="mr-2 text-amber-500"/> Active Safety Alerts
            </h3>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar max-h-[600px]">
              {dynamicAlerts.map((alert) => (
                <div key={alert.id} className="p-5 border border-slate-100 rounded-2xl bg-white hover:border-rose-200 transition-all flex flex-col sm:flex-row gap-4">
                  <div className={`w-12 h-12 shrink-0 rounded-xl flex items-center justify-center ${alert.severity === 'Critical' || alert.severity === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-amber-100 text-amber-600'}`}>
                    <AlertTriangle size={24}/>
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{alert.timestamp}</span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${alert.severity === 'Critical' ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>{alert.severity}</span>
                    </div>
                    <h4 className="font-black text-[#3E2723]">{alert.type}</h4>
                    <p className="text-sm text-slate-500 mt-1">{alert.description}</p>
                    <div className="flex items-center text-xs text-slate-400 mt-3 font-bold">
                      <MapPin size={12} className="mr-1"/> {alert.location}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button className="px-4 py-2 bg-[#3E2723] text-white rounded-xl text-xs font-bold hover:bg-black transition-colors">Resolve</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-[#1A1A1A] p-6 rounded-3xl text-white shadow-xl">
            <h3 className="font-bold text-[#D9A441] mb-6 flex items-center">
              <Biohazard size={18} className="mr-2"/> Zone Risk Matrix
            </h3>
            <div className="space-y-4">
              {MOCK_ZONE_RISKS.map((zone, idx) => (
                <div key={idx} className="flex justify-between items-center p-3 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-sm font-bold">{zone.zone}</p>
                    <p className="text-[10px] text-white/40 uppercase tracking-widest mt-0.5">Last Checked: {zone.lastInspection}</p>
                  </div>
                  <span className={`px-2 py-1 rounded text-[10px] font-black uppercase ${
                    zone.riskLevel === 'Low' ? 'text-emerald-400 bg-emerald-500/10' :
                    zone.riskLevel === 'Medium' ? 'text-amber-400 bg-amber-500/10' : 'text-rose-400 bg-rose-500/10'
                  }`}>{zone.riskLevel} Risk</span>
                </div>
              ))}
            </div>
            <button className="w-full mt-8 py-3 bg-[#D9A441] text-[#3E2723] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white transition-all">Download Safety Audit</button>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm relative overflow-hidden">
            <h3 className="font-bold text-[#3E2723] mb-4">Plant Safety Score</h3>
            <div className="flex items-center justify-center py-6">
              <div className="text-center z-10">
                <p className="text-5xl font-black text-[#3E2723]">{riskScore}</p>
                <p className="text-xs text-slate-400 uppercase font-black tracking-widest mt-1">
                  {riskScore > 90 ? 'Excellent' : riskScore > 75 ? 'Good' : 'Needs Review'}
                </p>
              </div>
              <div className="absolute inset-0 opacity-5 flex items-center justify-center">
                <HardHat size={160} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- MACHINE HEALTH VIEW ---
const MachineHealthView: React.FC<{ batchData: BatchData[] }> = ({ batchData }) => {
  const [selectedMachineId, setSelectedMachineId] = useState<string | null>(MOCK_MACHINE_HEALTH[0].id);
  const selectedMachine = MOCK_MACHINE_HEALTH.find(m => m.id === selectedMachineId);

  // Derive utilization metrics from batch throughput
  const plantThroughput = useMemo(() => batchData.reduce((acc, b) => acc + (b.weight || 0), 0), [batchData]);

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in h-full pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#3E2723] flex items-center">
            <Cpu className="mr-3 text-indigo-600" size={28}/> Asset Health Monitoring
          </h2>
          <p className="text-slate-500 text-sm">Predictive analytics synchronized with current floor volume.</p>
        </div>
        <button className="w-full md:w-auto px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-100 uppercase tracking-widest">Create Work Order</button>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-72 space-y-4 shrink-0">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest px-1">Equipment Registry</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-4">
            {MOCK_MACHINE_HEALTH.map(machine => (
              <button
                key={machine.id}
                onClick={() => setSelectedMachineId(machine.id)}
                className={`w-full p-4 rounded-2xl border text-left transition-all relative overflow-hidden ${
                  selectedMachineId === machine.id 
                    ? 'bg-white border-indigo-600 ring-4 ring-indigo-50 shadow-md lg:translate-x-1' 
                    : 'bg-white border-slate-100 hover:border-slate-200'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{machine.id}</span>
                  <span className={`w-2 h-2 rounded-full ${machine.status === 'Optimal' ? 'bg-emerald-500' : 'bg-rose-500 animate-pulse'}`}></span>
                </div>
                <h4 className="font-bold text-[#3E2723]">{machine.name}</h4>
                <p className="text-[10px] text-indigo-400 font-black uppercase mt-1">Utilization: {(plantThroughput > 0 ? (plantThroughput / 50000) * 100 : 0).toFixed(1)}%</p>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 space-y-6">
          {selectedMachine ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: 'Vibration', value: selectedMachine.sensors.vibration, unit: 'mm/s', icon: Activity, color: 'text-blue-500' },
                  { label: 'Temp', value: selectedMachine.sensors.temperature, unit: '°C', icon: ThermometerSun, color: 'text-amber-500' },
                  { label: 'Noise', value: selectedMachine.sensors.noiseLevel, unit: 'dB', icon: Wind, color: 'text-indigo-500' },
                  { label: 'Power', value: selectedMachine.sensors.powerDraw, unit: 'W', icon: Zap, color: 'text-emerald-500' }
                ].map((s, idx) => (
                  <div key={idx} className="bg-white p-4 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
                    <div className={`p-3 bg-slate-50 rounded-2xl ${s.color} mb-3`}><s.icon size={20}/></div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{s.label}</p>
                    <p className="text-xl font-black text-slate-800">{s.value} <span className="text-xs font-normal text-slate-400">{s.unit}</span></p>
                  </div>
                ))}
              </div>

              <div className="bg-white p-6 md:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
                <h3 className="text-lg font-black text-[#3E2723] mb-6 flex items-center">
                  Predictive Analysis Curve <ArrowRight size={16} className="ml-2 text-slate-300"/>
                </h3>
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedMachine.history}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                      <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}}/>
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}}/>
                      <Tooltip contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}/>
                      <Line type="monotone" dataKey="vibration" stroke="#6366f1" strokeWidth={3} dot={false} name="Vibration"/>
                      <Line type="monotone" dataKey="temp" stroke="#f59e0b" strokeWidth={3} dot={false} name="Temp"/>
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-[#1A1A1A] p-6 rounded-3xl text-white shadow-xl">
                  <h4 className="font-black text-indigo-400 mb-4 flex items-center">
                    <Sparkles size={18} className="mr-2"/> AI Predictive Diagnosis
                  </h4>
                  <div className="space-y-4">
                    <div>
                      <p className="text-xs text-white/50 uppercase font-black tracking-widest">Prediction</p>
                      <p className="text-lg font-black">{selectedMachine.aiAnalysis.prediction}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/50 uppercase font-black tracking-widest">Confidence Score</p>
                      <div className="flex items-center gap-3 mt-1">
                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{width: `${selectedMachine.aiAnalysis.confidence * 100}%`}}></div>
                        </div>
                        <span className="font-black text-sm">{(selectedMachine.aiAnalysis.confidence * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
                   <h4 className="font-black text-[#3E2723] mb-4">Maintenance Summary</h4>
                   <div className="space-y-4">
                      <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500 font-bold uppercase">Last Service</span>
                        <span className="text-sm font-black text-slate-800">{selectedMachine.lastMaintenance}</span>
                      </div>
                      <div className="flex items-center justify-between py-2 border-b border-slate-50">
                        <span className="text-xs text-slate-500 font-bold uppercase">Health Score</span>
                        <span className={`text-sm font-black ${selectedMachine.healthScore > 90 ? 'text-emerald-600' : 'text-amber-600'}`}>{selectedMachine.healthScore}%</span>
                      </div>
                      <div className="flex items-center justify-between py-2">
                        <span className="text-xs text-slate-500 font-bold uppercase">Status</span>
                        <span className="text-sm font-black text-indigo-600 uppercase">{selectedMachine.status}</span>
                      </div>
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="h-full min-h-[400px] flex items-center justify-center text-slate-300 border-2 border-dashed border-slate-200 rounded-3xl">
              <p className="font-bold uppercase tracking-widest">Select an asset to view diagnostics</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// --- REPORTS VIEW ---
const ReportsView: React.FC<{ batchData: BatchData[] }> = ({ batchData }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [reportText, setReportText] = useState<string | null>(null);

  const handleGenerate = async (type: string) => {
    setIsGenerating(true);
    try {
      const data = { 
        batches: batchData, 
        oee: MOCK_MACHINE_OEE, 
        efficiency: EFFICIENCY_DATA,
        timestamp: new Date().toISOString()
      };
      const report = await generatePlantReport(data, type as any);
      setReportText(report);
      auditService.log('Current User', UserRole.PLANT_MANAGER, 'REPORT_GENERATE', 'Reports', `Generated dynamic ${type} report for ${batchData.length} batches`);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in max-w-6xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-black text-[#3E2723] flex items-center">
            <FileText className="mr-3 text-blue-600" size={28}/> AI Report Center
          </h2>
          <p className="text-slate-500 text-sm">Dynamic insights synthesized from your uploaded dataset.</p>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
        {[
          { label: 'Daily Ops', type: 'DAILY_SUMMARY', icon: LayoutDashboard, color: 'text-emerald-500' },
          { label: 'Quality Audit', type: 'QUALITY', icon: CheckSquare, color: 'text-pink-500' },
          { label: 'Forecasting', type: 'FORECAST', icon: Zap, color: 'text-amber-500' },
          { label: 'Maintenance', type: 'MAINTENANCE', icon: Wrench, color: 'text-indigo-500' }
        ].map((item, idx) => (
          <button
            key={idx}
            disabled={isGenerating}
            onClick={() => handleGenerate(item.type)}
            className="p-4 md:p-6 bg-white rounded-2xl md:rounded-3xl border border-slate-200 shadow-sm hover:border-blue-500 transition-all flex flex-col items-center text-center group disabled:opacity-50"
          >
            <div className={`p-3 md:p-4 bg-slate-50 rounded-xl md:rounded-2xl ${item.color} mb-3 md:mb-4 group-hover:scale-110 transition-transform`}><item.icon size={24}/></div>
            <h3 className="font-black text-[#3E2723] text-[10px] md:text-sm uppercase tracking-wider">{item.label}</h3>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <h3 className="font-bold text-[#3E2723]">Dynamic Report Output</h3>
          {reportText && (
            <div className="flex gap-2">
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Printer size={18}/></button>
              <button className="p-2 hover:bg-slate-100 rounded-lg text-slate-400"><Download size={18}/></button>
            </div>
          )}
        </div>
        
        <div className="flex-1 p-6 md:p-12 relative overflow-y-auto max-h-[600px] custom-scrollbar">
          {isGenerating ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 z-10">
              <Loader2 size={48} className="text-blue-500 animate-spin mb-4"/>
              <p className="font-black text-[#3E2723] animate-pulse uppercase tracking-widest text-center">Analyzing Data Schema...</p>
            </div>
          ) : reportText ? (
            <div className="prose prose-slate max-w-none">
               <div className="whitespace-pre-wrap font-serif leading-relaxed text-slate-700 text-base md:text-lg">
                 {reportText}
               </div>
            </div>
          ) : (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-slate-300 text-center p-6">
              <FileSearch size={64} className="mb-4 opacity-10"/>
              <p className="font-bold uppercase tracking-widest text-sm md:text-base">Select a dynamic report category to analyze current data</p>
            </div>
          )}
        </div>
        
        <div className="p-4 bg-slate-50 border-t border-slate-100 text-center">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest flex items-center justify-center">
            <Sparkles size={12} className="mr-1 text-blue-400"/> Context-Aware reports generated from active shift data
          </p>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [role, setRole] = useState<UserRole | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.DASHBOARD);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeBatchData, setActiveBatchData] = useState<BatchData[]>(BATCH_HISTORY);
  const [showBulkUpload, setShowBulkUpload] = useState(false);

  const handleRoleSelect = (selectedRole: UserRole) => {
    setRole(selectedRole);
    const defaultView = selectedRole === UserRole.OPERATOR ? ViewState.OPERATIONAL : ViewState.MANAGEMENT;
    setCurrentView(defaultView);
  };

  const toggleRole = () => {
    if (!role) return;
    const nextRole = role === UserRole.OPERATOR ? UserRole.PLANT_MANAGER : UserRole.OPERATOR;
    handleRoleSelect(nextRole);
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.DASHBOARD:
      case ViewState.OPERATIONAL: return <OperationalView batchData={activeBatchData} />;
      case ViewState.MANAGEMENT: return <ManagementView batchData={activeBatchData} />;
      case ViewState.QUALITY_VISION: return <div className="p-4 md:p-6"><QualityVisionPanel /></div>;
      case ViewState.COMPLIANCE: return <div className="p-6 text-slate-400 flex flex-col items-center justify-center h-full"><ShieldCheck size={64} className="mb-4 opacity-10"/><p className="font-black uppercase tracking-widest">Compliance Center Live</p></div>;
      case ViewState.AUDIT: return <div className="p-6"><AuditLogViewer /></div>;
      case ViewState.TRACEABILITY: return <div className="p-6 text-slate-400 flex flex-col items-center justify-center h-full"><Activity size={64} className="mb-4 opacity-10"/><p className="font-black uppercase tracking-widest">Traceability Map Live</p></div>;
      case ViewState.DEPLOYMENT: return <div className="p-6"><DeploymentChecklist onInitialize={() => setCurrentView(ViewState.OPERATIONAL)} /></div>;
      case ViewState.FERMENTATION: return <div className="p-6 text-slate-400 flex flex-col items-center justify-center h-full"><ThermometerSun size={64} className="mb-4 opacity-10"/><p className="font-black uppercase tracking-widest">Fermentation Console Live</p></div>;
      case ViewState.DRYING: return <div className="p-6 text-slate-400 flex flex-col items-center justify-center h-full"><Sun size={64} className="mb-4 opacity-10"/><p className="font-black uppercase tracking-widest">Solar Control Live</p></div>;
      case ViewState.PROCESSING: return <div className="p-6 text-slate-400 flex flex-col items-center justify-center h-full"><Flame size={64} className="mb-4 opacity-10"/><p className="font-black uppercase tracking-widest">Processing Console Live</p></div>;
      case ViewState.YIELD_LOSS: return <YieldLossView batchData={activeBatchData} />;
      case ViewState.EFFICIENCY: return <div className="p-6 text-slate-400 flex flex-col items-center justify-center h-full"><Gauge size={64} className="mb-4 opacity-10"/><p className="font-black uppercase tracking-widest">Efficiency Dashboard Live</p></div>;
      case ViewState.REPORTS: return <ReportsView batchData={activeBatchData} />;
      case ViewState.MACHINES: return <MachineHealthView batchData={activeBatchData} />;
      case ViewState.SAFETY: return <SafetyView batchData={activeBatchData} />;
      case ViewState.WORKFLOW: return <div className="p-6 text-slate-400 flex flex-col items-center justify-center h-full"><Workflow size={64} className="mb-4 opacity-10"/><p className="font-black uppercase tracking-widest">Workflow Canvas Live</p></div>;
      default: return <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400"><p>Module {currentView} is initializing...</p></div>;
    }
  };

  if (!role) return <RoleSelectionScreen onSelect={handleRoleSelect} />;

  return (
    <div className="flex h-screen bg-[#F8F9FA] overflow-hidden font-sans text-slate-800">
      <OFISidebar currentView={currentView} onNavigate={setCurrentView} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} allowedViews={ROLE_PERMISSIONS[role]} />
      <div className="flex-1 flex flex-col min-w-0 h-screen relative">
        <header className="bg-white border-b border-slate-200 h-16 px-4 md:px-6 flex items-center justify-between shrink-0 z-20">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden mr-4 text-slate-500"><Menu size={24} /></button>
            <h1 className="text-xl font-bold text-[#3E2723] hidden md:block capitalize">{currentView.replace('_', ' ').toLowerCase()}</h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
             <button 
                onClick={toggleRole}
                className="hidden sm:flex items-center px-4 py-2 bg-[#3E2723] text-[#D9A441] text-xs font-bold rounded-xl border border-[#D9A441]/30 hover:bg-black transition-all shadow-md active:scale-95"
             >
                <User size={14} className="mr-2"/>
                Switch Role
             </button>

             <button onClick={() => setShowBulkUpload(true)} className="flex items-center px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-lg border border-emerald-100 hover:bg-emerald-100 transition-colors">
                <Upload size={14} className="mr-2"/> Import
             </button>

             <div className="h-8 w-px bg-slate-200 mx-2"></div>
             
             <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-[#E6007E] rounded-full border-2 border-white flex items-center justify-center text-white font-black shadow-lg shadow-pink-200 uppercase tracking-tighter">
                  {role[0]}
                </div>
             </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto custom-scrollbar relative z-0">{renderContent()}<div className="h-24"></div></main>
        <AIChatAssistant currentView={currentView} userRole={role} contextData={{ view: currentView, data: activeBatchData }} />
        <UploadQueueWidget />
        {showBulkUpload && (
          <BulkUploadModal 
            onClose={() => setShowBulkUpload(false)} 
            onImport={(newData) => {
              setActiveBatchData([...newData, ...activeBatchData]);
              setShowBulkUpload(false);
              auditService.log('Current User', role, 'BATCH_IMPORT', 'System', `Imported ${newData.length} records`);
            }}
          />
        )}
      </div>
    </div>
  );
};

export default App;

const OperationalView: React.FC<{ batchData: BatchData[] }> = ({ batchData }) => {
  const stats = useMemo(() => {
    const totalQty = batchData.reduce((acc, b) => acc + (b.weight || 0), 0);
    const avgMC = batchData.length > 0 ? batchData.reduce((acc, b) => acc + (b.moisture || 0), 0) / batchData.length : 0;
    const avgQuality = batchData.length > 0 ? batchData.reduce((acc, b) => acc + (b.qualityScore || 0), 0) / batchData.length : 0;
    return { totalQty, avgMC, avgQuality };
  }, [batchData]);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <KPICard metric={{ label: "Active Batches", value: batchData.length, unit: "Running", trend: 0, status: 'good' }} />
        <KPICard metric={{ label: "Total Volume", value: stats.totalQty.toLocaleString(), unit: "kg", trend: 4.5, status: 'good' }} />
        <KPICard metric={{ label: "Avg Moisture", value: stats.avgMC.toFixed(1), unit: "%", trend: -0.2, status: stats.avgMC > 8 ? 'warning' : 'good' }} />
        <KPICard metric={{ label: "Avg Quality", value: stats.avgQuality.toFixed(1), unit: "%", trend: 2.1, status: stats.avgQuality < 90 ? 'warning' : 'good' }} />
      </div>
      <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <h3 className="font-bold text-[#3E2723] mb-4">Floor Batch Queue</h3>
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-slate-400 font-bold border-b border-slate-50 uppercase text-[10px] tracking-widest">
                <tr><th className="pb-3 px-2">Batch ID</th><th className="pb-3 px-2">Stage</th><th className="pb-3 px-2">Moisture</th><th className="pb-3 px-2 text-right">Quality</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {batchData.map(b => (
                  <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-2 font-mono font-bold text-slate-700">{b.id}</td>
                    <td className="py-4 px-2">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md text-[10px] font-bold uppercase">{b.stage}</span>
                    </td>
                    <td className="py-4 px-2 text-slate-500 font-mono">{b.moisture}%</td>
                    <td className="py-4 px-2 font-black text-right text-emerald-600">{b.qualityScore}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const ManagementView: React.FC<{ batchData: BatchData[] }> = ({ batchData }) => {
  const dynamicKPIs = useMemo(() => {
    const avgQuality = batchData.length > 0 ? batchData.reduce((acc, b) => acc + (b.qualityScore || 0), 0) / batchData.length : 0;
    const totalWeight = batchData.reduce((acc, b) => acc + (b.weight || 0), 0);
    const avgFFA = batchData.length > 0 ? batchData.reduce((acc, b) => acc + (b.freeFattyAcids || 0), 0) / batchData.length : 0;
    
    return { avgQuality, totalWeight, avgFFA };
  }, [batchData]);

  return (
    <div className="p-4 md:p-6 space-y-6 pb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        <KPICard metric={{ label: "Plant OEE", value: 89.4, unit: "%", trend: 2.1, status: 'good' }} />
        <KPICard metric={{ label: "Avg Quality", value: dynamicKPIs.avgQuality.toFixed(1), unit: "%", trend: 0.5, status: dynamicKPIs.avgQuality < 90 ? 'warning' : 'good' }} />
        <KPICard metric={{ label: "Daily Intake", value: dynamicKPIs.totalWeight.toLocaleString(), unit: "kg", trend: 1.2, status: 'good' }} />
        <KPICard metric={{ label: "Avg FFA", value: dynamicKPIs.avgFFA.toFixed(2), unit: "idx", trend: 0.5, status: dynamicKPIs.avgFFA > 1.75 ? 'critical' : 'good' }} />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="font-bold text-[#3E2723] mb-6 flex items-center">
            <ActivitySquare size={18} className="mr-2 text-indigo-500"/> Volume Distribution (MT)
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={batchData.slice(-15).map(b => ({ time: b.id.slice(-4), volume: b.weight || 0 }))}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9"/>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}}/>
                  <YAxis hide />
                  <Tooltip />
                  <Area type="monotone" dataKey="volume" stroke="#6366f1" fill="#6366f1" fillOpacity={0.1}/>
                </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="font-bold text-[#3E2723] mb-4">Executive Synthesis</h3>
          <div className="flex-1 bg-slate-50 rounded-2xl p-6 relative overflow-hidden">
              <p className="text-sm text-slate-700 leading-relaxed relative z-10 italic">
                "Based on the {batchData.length} batches currently indexed, the plant is operating at a quality baseline of {dynamicKPIs.avgQuality.toFixed(1)}%. We've observed {batchData.filter(b => (b.moisture || 0) > 8).length} anomalies in moisture levels that require active storage monitoring. Overall throughput remains aligned with seasonal targets."
              </p>
              <div className="absolute bottom-4 right-4 opacity-5">
                <Presentation size={100} />
              </div>
          </div>
          <button className="mt-4 w-full py-3 bg-[#3E2723] text-[#D9A441] rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all">Generate Strategy Audit</button>
        </div>
      </div>
    </div>
  );
};

const RoleSelectionScreen: React.FC<{ onSelect: (role: UserRole) => void }> = ({ onSelect }) => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-[#FBCFE8] gap-8 p-6 overflow-hidden relative">
    {/* Decorative background blobs */}
    <div className="absolute top-0 left-0 w-96 h-96 bg-pink-400 rounded-full blur-[120px] -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
    <div className="absolute bottom-0 right-0 w-96 h-96 bg-amber-400 rounded-full blur-[120px] translate-x-1/2 translate-y-1/2 opacity-30"></div>
    
    <div className="flex flex-col items-center mb-8 relative z-10">
      <h1 className="text-8xl font-black text-[#D9A441] tracking-tighter mb-2 drop-shadow-sm">ofi</h1>
      <p className="text-[#3E2723]/80 uppercase tracking-[0.3em] font-black text-sm text-center">Cocoa Processing Intelligence</p>
    </div>
    <div className="flex flex-col md:flex-row gap-8 w-full max-w-4xl relative z-10">
      <button 
        onClick={() => onSelect(UserRole.OPERATOR)} 
        className="flex-1 group p-8 md:p-12 bg-white rounded-[2.5rem] shadow-2xl hover:ring-8 ring-pink-500/20 transition-all text-left flex flex-col relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 p-8 text-slate-50 opacity-10 group-hover:scale-125 transition-transform duration-500">
           <MonitorPlay size={120} />
        </div>
        <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl w-fit mb-6">
           <MonitorPlay size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black text-[#3E2723] mb-2">Operator Portal</h2>
        <p className="text-slate-500 leading-relaxed text-sm md:text-base">Real-time floor monitoring, intake grading, and batch control.</p>
        <div className="mt-8 flex items-center font-bold text-[#E6007E]">
           Enter Floor Console <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform"/>
        </div>
      </button>

      <button 
        onClick={() => onSelect(UserRole.PLANT_MANAGER)} 
        className="flex-1 group p-8 md:p-12 bg-[#3E2723] rounded-[2.5rem] shadow-2xl hover:ring-8 ring-amber-500/20 transition-all text-left flex flex-col relative overflow-hidden text-white"
      >
        <div className="absolute top-0 right-0 p-8 text-white opacity-5 group-hover:scale-125 transition-transform duration-500">
           <Presentation size={120} />
        </div>
        <div className="p-4 bg-[#D9A441] text-[#3E2723] rounded-2xl w-fit mb-6">
           <Presentation size={32} />
        </div>
        <h2 className="text-2xl md:text-3xl font-black mb-2 text-[#D9A441]">Management View</h2>
        <p className="text-white/60 leading-relaxed text-sm md:text-base">Executive KPIs, plant-wide OEE, compliance audits, and AI reports.</p>
        <div className="mt-8 flex items-center font-bold text-[#D9A441]">
           Access Strategy Hub <ArrowRight size={18} className="ml-2 group-hover:translate-x-2 transition-transform"/>
        </div>
      </button>
    </div>
  </div>
);
