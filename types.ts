export enum ViewState {
  DASHBOARD = 'DASHBOARD',
  OPERATIONAL = 'OPERATIONAL',
  MANAGEMENT = 'MANAGEMENT',
  WORKFLOW = 'WORKFLOW',
  QUALITY_VISION = 'QUALITY_VISION',
  MACHINES = 'MACHINES',
  TRACEABILITY = 'TRACEABILITY',
  REPORTS = 'REPORTS',
  FERMENTATION = 'FERMENTATION',
  DRYING = 'DRYING',
  PROCESSING = 'PROCESSING',
  YIELD_LOSS = 'YIELD_LOSS',
  SAFETY = 'SAFETY',
  COMPLIANCE = 'COMPLIANCE',
  EFFICIENCY = 'EFFICIENCY',
  AUDIT = 'AUDIT',
  DEPLOYMENT = 'DEPLOYMENT'
}

export enum UserRole {
  OPERATOR = 'Operator',
  PLANT_MANAGER = 'Plant Manager'
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  user: string;
  role: UserRole;
  action: string;
  resource: string;
  details: string;
  status: 'Success' | 'Failed' | 'Denied';
  ipHash: string;
}

export interface Metric {
  label: string;
  value: string | number;
  unit: string;
  trend: number;
  status: 'good' | 'warning' | 'critical';
  description?: string;
}

export interface BoundingBox {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
  color: string;
}

export interface BatchData {
  id: string;
  product: string;
  timestamp: string;
  qualityScore: number;
  defectRate?: number;
  stage: string;
  riskScore?: number;
  complianceStatus?: 'Compliant' | 'Pending' | 'Non-Compliant' | 'Review Required';
  weight?: number;
  outputWeight?: number;
  moisture?: number;
  temp?: number;
  fermHours?: number;
  supplier?: string;
  vibration?: number;
  machineId?: string;
  bags?: number;
  qty?: number;
  beanWeight?: number;
  timeDuration?: number;
  shellLevel?: number;
  admixture?: number;
  sieve?: number;
  cluster?: number;
  residue?: number;
  fermentedMold?: number;
  freeFattyAcids?: number;
  validationStatus?: 'AI Predicted' | 'Human Verified' | 'Flagged';
  validatedBy?: string;
  validationDate?: string;
  contaminationRisk?: {
    biological: number;
    chemical: number;
    physical: number;
    status: 'Safe' | 'Monitor' | 'Quarantined';
  };
}

export interface BatchTraceabilityData {
  batchId: string;
  productId: string;
  productName: string;
  origin: string;
  overallQuality: number;
  overallRisk: number;
  complianceStatus: 'Compliant' | 'Review Required' | 'Non-Compliant';
  timeline: BatchTimelineStage[];
}

export interface BatchTimelineStage {
  stage: 'Arrival' | 'Fermentation' | 'Drying' | 'Roasting' | 'Grinding' | 'Packing';
  status: 'Completed' | 'In Progress' | 'Pending' | 'Issue';
  timestamp: string;
  location: string;
  operator: string;
  qualityScore: number;
  riskScore: number;
}

export interface MaintenanceTicket {
  id: string;
  machineId: string;
  type: 'Preventive' | 'Corrective' | 'Predictive';
  description: string;
  status: 'Open' | 'In Progress' | 'Resolved' | 'Approval Pending';
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
  createdDate: string;
}

export interface MachineHealth {
  id: string;
  name: string;
  type: 'Roaster' | 'Grinder' | 'Conveyor' | 'Dryer' | 'Press';
  status: 'Optimal' | 'Maintenance Due' | 'Critical';
  healthScore: number;
  lastMaintenance: string;
  nextScheduledMaintenance: string;
  sensors: {
    vibration: number;
    temperature: number;
    noiseLevel: number;
    powerDraw: number;
  };
  aiAnalysis: {
    prediction: string;
    confidence: number;
    recommendedAction: string;
  };
  history: { 
    time: string; 
    vibration: number; 
    temp: number;
    power: number;
  }[];
  predictedFailureDate?: string;
  rulHours?: number;
  failureProbability?: number;
  mtbf?: number;
  sparePartsStatus?: 'Available' | 'Low Stock' | 'Unavailable';
  maintenanceTickets?: MaintenanceTicket[];
}

export interface ExportDocument {
  id: string;
  type: string;
  status: 'Complete' | 'Missing' | 'Expired';
  uploadDate?: string;
  expiryDate?: string;
  fileUrl?: string;
  originatingBatchId: string;
}

export interface ExportBatch {
  id: string;
  batchId: string;
  product: string;
  weight: number;
  destination: string;
  client: string;
  status: 'Ready' | 'Pending' | 'Flagged' | 'Shipped';
  qualityScore: number;
  departureDate: string;
  documents: ExportDocument[];
  alerts: string[];
}

export interface MachineLog {
  time: string;
  temperature: number;
  vibration: number;
  pressure: number;
}

export interface IntakeRecord {
  id: string;
  supplier: string;
  weight: number;
  moisture: number;
  timestamp: string;
  status: string;
}

export interface FermentationBatch {
  id: string;
  startTime: string;
  expectedEndTime: string;
  currentTemp: number;
  status: 'Active' | 'Completed' | 'Alert';
}

export interface DryingBatch {
  id: string;
  currentMoisture: number;
  targetMoisture: number;
  method: string;
  status: 'Drying' | 'Completed' | 'Alert';
}

export interface RoastingBatch {
  id: string;
  temp: number;
  duration: number;
  profile: string;
  status: string;
}

export interface YieldBatch {
  stage: string;
  inputWeight: number;
  outputWeight: number;
  lossWeight: number;
  lossPercentage: number;
  targetLossPercentage: number;
  status: 'Optimal' | 'Warning' | 'Critical';
}

export interface SafetyAlert {
  id: string;
  type: string;
  severity: 'Low' | 'Medium' | 'High' | 'Critical';
  location: string;
  timestamp: string;
  description: string;
  status: 'Active' | 'Resolved';
}

export interface ZoneRisk {
  zone: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  lastInspection: string;
}

export interface ProductionStage {
  id: string;
  name: string;
  status: 'Active' | 'Pending' | 'Complete' | 'Alert';
}

export interface ComplianceDocument {
  id: string;
  type: string;
  batchId: string;
  status: 'Complete' | 'Pending' | 'Expired';
  expiryDate?: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'info' | 'warning' | 'critical' | 'success';
  source: string;
  read: boolean;
}

export interface DowntimeEvent {
  id: string;
  machineId: string;
  startTime: string;
  endTime?: string;
  reason: string;
  severity: 'Minor' | 'Major' | 'Critical';
}

export interface MachineOEE {
  machineId: string;
  availability: number;
  performance: number;
  quality: number;
  oee: number;
}

export interface EnergyMetric {
  timestamp: string;
  consumption: number;
  cost: number;
}

export interface BatchRecord {
  id: string;
  data: any;
}

export interface SensorReadingRecord {
  timestamp: string;
  value: number;
  sensorId: string;
}

export interface QCResultRecord {
  batchId: string;
  test: string;
  result: number;
  passed: boolean;
}

export interface DefectDetectionRecord {
  timestamp: string;
  type: string;
  confidence: number;
}

export interface QualityBenchmark {
  parameter: string;
  min: number;
  max: number;
  average: number;
}

export interface HACCPLog {
  id: string;
  point: string;
  reading: string;
  status: string;
}

export interface WorkerSafetyMetric {
  incidentCount: number;
  nearMisses: number;
  trainingCompletion: number;
}

export interface IntakeAnalysisResult {
  qualityScore: number;
  riskLevel: 'Low' | 'Medium' | 'High';
  recommendations: string[];
  detectedDefects: Array<{ type: string; severity: string; confidence: number }>;
  summary: string;
}