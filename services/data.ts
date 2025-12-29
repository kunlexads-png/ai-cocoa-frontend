import { MachineLog, BatchData, IntakeRecord, FermentationBatch, DryingBatch, RoastingBatch, YieldBatch, SafetyAlert, ZoneRisk, MachineHealth, ProductionStage, ComplianceDocument, SystemNotification, BatchTraceabilityData, DowntimeEvent, MachineOEE, EnergyMetric, BatchRecord, SensorReadingRecord, QCResultRecord, DefectDetectionRecord, QualityBenchmark, HACCPLog, WorkerSafetyMetric, ExportBatch } from '../types';

export const MOCK_MACHINE_LOGS: MachineLog[] = Array.from({ length: 20 }, (_, i) => ({
  time: `${10 + Math.floor(i / 2)}:${(i % 2) * 30}`.padStart(5, '0'),
  temperature: 140 + Math.random() * 15,
  vibration: 2.0 + Math.random() * 1.5,
  pressure: 80 + Math.random() * 10,
}));

export const CAMERA_FEEDS = [
  { id: 'CAM-01', name: 'Intake Conveyor A', stage: 'intake', image: 'https://images.unsplash.com/photo-1542843137-8791a6904d14?q=80&w=1000&auto=format&fit=crop', status: 'Active' },
  { id: 'CAM-02', name: 'Fermentation Box 4', stage: 'fermentation', image: 'https://plus.unsplash.com/premium_photo-1664302152996-0329c3a3bb6a?q=80&w=1000&auto=format&fit=crop', status: 'Active' },
  { id: 'CAM-03', name: 'Solar Dryer Tunnel', stage: 'drying', image: 'https://images.unsplash.com/photo-1621956530693-0130985223c2?q=80&w=1000&auto=format&fit=crop', status: 'Active' },
  { id: 'CAM-04', name: 'Final Grading Table', stage: 'grading', image: 'https://images.unsplash.com/photo-1614961909013-1e2212a5ca9e?q=80&w=1000&auto=format&fit=crop', status: 'Standby' },
];

export const BATCH_HISTORY: BatchData[] = [
  { 
    id: 'BATCH-2023-884', product: 'Cocoa Liquor A', supplier: 'Ohene Cocoa Farms', timestamp: '2023-10-24 08:30', 
    qualityScore: 98.2, defectRate: 0.5, stage: 'Conching', riskScore: 12, complianceStatus: 'Compliant', 
    validationStatus: 'Human Verified', moisture: 7.1, fermHours: 144, temp: 45,
    contaminationRisk: { biological: 2, chemical: 0, physical: 1, status: 'Safe' }
  },
  { 
    id: 'BATCH-2023-885', product: 'Cocoa Butter', supplier: 'Golden Pod Co-op', timestamp: '2023-10-24 09:15', 
    qualityScore: 96.5, defectRate: 1.2, stage: 'Pressing', riskScore: 8, complianceStatus: 'Compliant', 
    validationStatus: 'AI Predicted', moisture: 7.3, fermHours: 138, temp: 46,
    contaminationRisk: { biological: 5, chemical: 1, physical: 0, status: 'Safe' }
  },
  { 
    id: 'BATCH-2023-886', product: 'Nibs Premium', supplier: 'Ohene Cocoa Farms', timestamp: '2023-10-24 10:00', 
    qualityScore: 99.1, defectRate: 0.1, stage: 'Roasting', riskScore: 5, complianceStatus: 'Compliant', 
    validationStatus: 'Human Verified', moisture: 6.9, fermHours: 146, temp: 44,
    contaminationRisk: { biological: 0, chemical: 0, physical: 0, status: 'Safe' }
  },
];

export const MOCK_WORKFLOW_STAGES: ProductionStage[] = [
  { id: 'STG-01', name: 'Intake & Grading', status: 'Complete' },
  { id: 'STG-02', name: 'Fermentation', status: 'Active' },
  { id: 'STG-03', name: 'Solar Drying', status: 'Active' },
  { id: 'STG-04', name: 'Roasting', status: 'Pending' },
  { id: 'STG-05', name: 'Grinding & Pressing', status: 'Pending' },
  { id: 'STG-06', name: 'Packing & Export', status: 'Pending' }
];

export const MOCK_BATCH_TRACEABILITY: Record<string, BatchTraceabilityData> = {
  'BATCH-2023-886': {
    batchId: 'BATCH-2023-886',
    productId: 'CO-PR-886',
    productName: 'Nibs Premium (Grand Cru)',
    origin: 'Kumasi North, Ghana',
    overallQuality: 99.1,
    overallRisk: 4,
    complianceStatus: 'Compliant',
    timeline: [
      { stage: 'Arrival', status: 'Completed', timestamp: '2023-10-24 08:00', location: 'Intake Gate 2', operator: 'K. Mensah', qualityScore: 98, riskScore: 2 },
      { stage: 'Fermentation', status: 'Completed', timestamp: '2023-10-27 10:00', location: 'Box A-42', operator: 'S. Boateng', qualityScore: 99, riskScore: 3 },
      { stage: 'Drying', status: 'Completed', timestamp: '2023-10-31 14:30', location: 'Tunnel 1', operator: 'A. Owusu', qualityScore: 99, riskScore: 1 },
      { stage: 'Roasting', status: 'Completed', timestamp: '2023-11-01 09:15', location: 'Roaster 01', operator: 'M. Tetteh', qualityScore: 99, riskScore: 2 },
      { stage: 'Grinding', status: 'Completed', timestamp: '2023-11-01 16:45', location: 'Grinder 04', operator: 'K. Mensah', qualityScore: 99, riskScore: 1 },
      { stage: 'Packing', status: 'In Progress', timestamp: '2023-11-02 08:00', location: 'Packing Line 2', operator: 'J. Addo', qualityScore: 99, riskScore: 1 }
    ]
  }
};

export const MOCK_MACHINE_HEALTH: MachineHealth[] = [
  {
    id: 'MCH-01', name: 'Main Roaster A1', type: 'Roaster', status: 'Optimal', healthScore: 94, lastMaintenance: '2023-09-12', nextScheduledMaintenance: '2023-12-12',
    sensors: { vibration: 0.12, temperature: 142, noiseLevel: 68, powerDraw: 4500 },
    aiAnalysis: { prediction: 'Normal Wear', confidence: 0.98, recommendedAction: 'No immediate action required.' },
    history: Array.from({ length: 10 }, (_, i) => ({ time: `${i}:00`, vibration: 0.1 + Math.random() * 0.05, temp: 140 + Math.random() * 5, power: 4400 + Math.random() * 200 }))
  },
  {
    id: 'MCH-02', name: 'Grinder G-04', type: 'Grinder', status: 'Maintenance Due', healthScore: 68, lastMaintenance: '2023-06-15', nextScheduledMaintenance: '2023-10-15',
    sensors: { vibration: 0.85, temperature: 82, noiseLevel: 94, powerDraw: 5200 },
    aiAnalysis: { prediction: 'Bearing Degradation', confidence: 0.82, recommendedAction: 'Schedule bearing replacement within 72 hours.' },
    history: Array.from({ length: 10 }, (_, i) => ({ time: `${i}:00`, vibration: 0.7 + Math.random() * 0.3, temp: 75 + Math.random() * 10, power: 5000 + Math.random() * 400 }))
  }
];

export const MOCK_YIELD_DATA: YieldBatch[] = [
  { stage: 'Intake', inputWeight: 5000, outputWeight: 4980, lossWeight: 20, lossPercentage: 0.4, targetLossPercentage: 0.5, status: 'Optimal' },
  { stage: 'Fermentation', inputWeight: 4980, outputWeight: 4850, lossWeight: 130, lossPercentage: 2.6, targetLossPercentage: 3.0, status: 'Optimal' },
  { stage: 'Drying', inputWeight: 4850, outputWeight: 4400, lossWeight: 450, lossPercentage: 9.3, targetLossPercentage: 8.5, status: 'Warning' },
  { stage: 'Roasting', inputWeight: 4400, outputWeight: 4250, lossWeight: 150, lossPercentage: 3.4, targetLossPercentage: 4.0, status: 'Optimal' }
];

export const MOCK_SAFETY_ALERTS: SafetyAlert[] = [
  { id: 'AL-101', type: 'Dust Levels', severity: 'Medium', location: 'Grinding Room', timestamp: '2023-10-24 11:20', description: 'Dust concentration exceeding threshold. Ventilation boost required.', status: 'Active' },
  { id: 'AL-102', type: 'Proximity', severity: 'Critical', location: 'Conveyor 03', timestamp: '2023-10-24 10:45', description: 'Unauthorized personnel detected in restricted zone.', status: 'Resolved' }
];

export const MOCK_ZONE_RISKS: ZoneRisk[] = [
  { zone: 'Intake Area', riskLevel: 'Low', lastInspection: '2023-10-20' },
  { zone: 'Fermentation', riskLevel: 'Medium', lastInspection: '2023-10-22' },
  { zone: 'Roasting Floor', riskLevel: 'Low', lastInspection: '2023-10-23' },
  { zone: 'Grinding Room', riskLevel: 'High', lastInspection: '2023-10-24' }
];

export const MOCK_ENERGY_DATA: EnergyMetric[] = Array.from({ length: 24 }, (_, i) => ({
  timestamp: `${i}:00`,
  consumption: 120 + Math.random() * 50,
  cost: 45 + Math.random() * 15
}));

export const MOCK_MACHINE_OEE: MachineOEE[] = [
  { machineId: 'ROAST-01', availability: 98, performance: 95, quality: 99, oee: 92.2 },
  { machineId: 'GRIND-04', availability: 88, performance: 92, quality: 96, oee: 77.6 },
  { machineId: 'PRESS-02', availability: 94, performance: 88, quality: 98, oee: 81.1 }
];

export const EFFICIENCY_DATA = Array.from({ length: 12 }, (_, i) => ({
  time: `${i + 8}:00`,
  oee: 85 + Math.random() * 10,
  throughput: 40 + Math.random() * 15,
  loss: 2 + Math.random() * 3
}));

export const MOCK_MODEL_METRICS = Array.from({ length: 30 }, (_, i) => ({
  day: i + 1,
  accuracy: 94 + Math.sin(i / 5) * 5,
  mae: 0.15 + Math.random() * 0.05
}));

export const MOCK_FERMENTATION_BATCHES = [
  { id: 'FERM-884', startTime: '2023-10-20 08:00', expectedEndTime: '2023-10-26 08:00', currentTemp: 48.5, status: 'Active', boxId: 'BOX-01', progress: 85, history: [] }
];
export const MOCK_DRYING_BATCHES = [
  { id: 'DRY-201', currentMoisture: 12.4, targetMoisture: 7.0, method: 'Solar Tunnel A', status: 'Drying', tunnelId: 'TNL-01', progress: 68, history: [] }
];
export const MOCK_ROASTING_BATCHES = [
  { id: 'RST-901', roasterId: 'UNIT-01', temp: 142.5, duration: 45, profile: 'Medium-Dark', status: 'Roasting', history: [], drumSpeed: 55, burnerIntensity: 82, coolingStatus: 'Idle' }
];
export const MOCK_EXPORT_BATCHES = [];
export const MOCK_COMPLIANCE_DOCS = [];
export const MOCK_DOWNTIME_LOGS = [];
export const MOCK_MANAGEMENT_DATA = { throughput: { current: 450, unit: 'MT', trend: 5 }, forecast: [], qualityDistribution: [] };
export const MOCK_SUPPLIER_BENCHMARKS = [];
export const MOCK_HACCP_LOGS = [];
export const MOCK_WORKER_SAFETY = [];
export const SQL_BATCHES = [];