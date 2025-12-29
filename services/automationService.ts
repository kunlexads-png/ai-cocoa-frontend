
import { BatchData, DryingBatch, SafetyAlert, SystemNotification } from '../types';

interface RuleResult {
  alerts: SafetyAlert[];
  notifications: SystemNotification[];
  popupMessage?: { title: string; message: string; action: string };
}

export const evaluateAutomationRules = (
  dryingBatches: DryingBatch[],
  batchHistory: BatchData[],
  predictedQuality: number
): RuleResult => {
  const result: RuleResult = { alerts: [], notifications: [] };

  // Rule 1: Moisture Alert
  // If avg_moisture > target + 0.5% → High-priority alert
  dryingBatches.forEach(batch => {
    // Check if moisture exceeds target + 0.5%
    if (batch.currentMoisture > (batch.targetMoisture + 0.5) && batch.status === 'Drying') {
      const alert: SafetyAlert = {
        id: `AUTO-MST-${batch.id}-${Date.now()}`,
        type: 'Process Control',
        severity: 'High',
        location: batch.method,
        timestamp: 'Just now',
        description: `Batch ${batch.id} moisture (${batch.currentMoisture}%) exceeds target by >0.5%.`,
        status: 'Active'
      };
      result.alerts.push(alert);
      
      // Trigger Popup for this high priority rule
      if (!result.popupMessage) {
        result.popupMessage = {
          title: 'Critical Moisture Deviation',
          message: `Batch ${batch.id} is drying too slowly (${batch.currentMoisture}%). Risk of mold development.`,
          action: 'Extend drying cycle by 2 hours & Increase fan speed to 1400 RPM.'
        };
      }
    }
  });

  // Rule 2: Defect Rate Alert
  // If defect_rate > 2% for 3 consecutive batches → Hold & notify QA
  // Using slice(0, 3) because index 0 is typically the newest in time-ordered lists
  const recentBatches = batchHistory.slice(0, 3);
  if (recentBatches.length === 3) {
    const allHighDefects = recentBatches.every(b => (b.defectRate || 0) > 2.0);
    
    // Simulate this condition for demo if mock data isn't perfect, 
    // but relying on data.ts updates for real behavior
    if (allHighDefects) {
       const alert: SafetyAlert = {
        id: `AUTO-DEF-${Date.now()}`,
        type: 'Quality',
        severity: 'Critical',
        location: 'Grading Line',
        timestamp: 'Just now',
        description: 'High defect rate (>2%) detected in last 3 consecutive batches.',
        status: 'Active'
      };
      result.alerts.push(alert);
      result.notifications.push({
        id: `NOTIF-QA-${Date.now()}`,
        title: 'QA Hold Triggered',
        message: 'System has auto-placed active batches on HOLD. QA Manager notified.',
        timestamp: 'Just now',
        type: 'critical',
        source: 'System',
        read: false
      });
    }
  }

  // Rule 3: Predicted Quality Alert
  // If predicted_quality < threshold (e.g. 90) → Auto-create rework job
  if (predictedQuality < 90) {
     result.notifications.push({
        id: `NOTIF-REWORK-${Date.now()}`,
        title: 'Rework Job Created',
        message: `Predicted quality ${predictedQuality} below threshold (90). Rework Job #RW-${Math.floor(Math.random()*1000)} auto-generated.`,
        timestamp: 'Just now',
        type: 'warning',
        source: 'AI Watchdog',
        read: false
     });
  }

  return result;
};
