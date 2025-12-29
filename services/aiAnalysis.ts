

import { BoundingBox } from '../types';

// --- C. Anomaly Detection (Z-Score Algorithm) ---

/**
 * Detects anomalies in a time-series dataset using the Z-Score method.
 * A data point is considered an anomaly if it deviates from the mean by more than `thresholdSigma` standard deviations.
 * 
 * @param readings Array of numerical sensor readings
 * @param thresholdSigma Number of standard deviations to trigger alert (default 3)
 */
export const detectSensorAnomalies = (
  readings: number[], 
  thresholdSigma: number = 3
): { index: number; value: number; zScore: number }[] => {
  if (readings.length === 0) return [];
  
  // 1. Calculate Mean
  const mean = readings.reduce((a, b) => a + b, 0) / readings.length;
  
  // 2. Calculate Standard Deviation
  const variance = readings.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / readings.length;
  const stdDev = Math.sqrt(variance);

  if (stdDev === 0) return [];

  // 3. Identify Outliers
  return readings
    .map((value, index) => ({ index, value, zScore: (value - mean) / stdDev }))
    .filter(item => Math.abs(item.zScore) > thresholdSigma);
};


// --- B. Quality Prediction (Time-Series / Feature based) ---

/**
 * Predicts the final quality score of a batch based on key process features.
 * Simulates a trained XGBoost/LightGBM model.
 * 
 * Features:
 * - fermentationHours: Duration of fermentation (Ideal ~144h)
 * - avgTemp: Average fermentation temperature (Ideal ~45-50°C)
 * - moisture: Current moisture content (Ideal -> 7%)
 * - defectRate: Current visual defect rate
 */
export const predictBatchQuality = (
  fermentationHours: number,
  avgTemp: number,
  moisture: number,
  defectRate: number = 0
): number => {
  // Base Score
  let score = 98.0; 
  
  // 1. Fermentation Deviation Penalty (Weighted)
  const fermIdeal = 144; // 6 days
  const fermDiff = Math.abs(fermentationHours - fermIdeal);
  // Penalty: 0.05 points per hour deviation
  score -= (fermDiff * 0.05); 

  // 2. Temperature Penalty (Non-linear)
  // Ideal range 44-52. Drop sharply if outside.
  if (avgTemp < 40) score -= (40 - avgTemp) * 1.5; // Under-fermented
  else if (avgTemp > 55) score -= (avgTemp - 55) * 2.0; // Over-heating/Bacteria death

  // 3. Moisture Penalty (Target 7%)
  // If moisture is high, quality is 'potential', not actual. 
  // If moisture is < 6% (over-dried), quality suffers (brittle).
  if (moisture < 6.0) score -= (6.0 - moisture) * 5; 
  // Note: High moisture during process is normal, so we check trend. 
  // Assuming this is 'Predicted Final Quality', we assume standard drying continues, 
  // but penalize if it's currently stuck high.

  // 4. Visual Defect Penalty
  score -= (defectRate * 2.5);

  // Clamp 0-100
  return Math.max(0, Math.min(100, Math.round(score * 10) / 10));
};


// --- A. Visual Defect Detection (YOLOv8 Simulation) ---

const DEFECT_CLASSES_BY_STAGE: Record<string, { label: string, color: string }[]> = {
  intake: [
    { label: 'Stone', color: '#64748b' }, // Slate-500
    { label: 'Pod', color: '#10b981' }, // Emerald-500
    { label: 'Foreign', color: '#ef4444' }, // Red-500
  ],
  fermentation: [
    { label: 'Mold', color: '#ef4444' },
    { label: 'Underripe', color: '#eab308' }, // Yellow-500
  ],
  drying: [
    { label: 'Mold', color: '#ef4444' },
    { label: 'Clumping', color: '#f97316' }, // Orange-500
  ],
  grading: [
    { label: 'Broken', color: '#eab308' },
    { label: 'Slaty', color: '#64748b' },
    { label: 'Insect', color: '#ef4444' },
  ]
};

const DEFAULT_DEFECTS = [
  { label: 'Unknown', color: '#94a3b8' }
];

/**
 * Simulates the output of a YOLOv8 object detection model running on a live feed.
 * Returns random bounding boxes representing defects.
 */
export const simulateDefectDetection = (stage: string = 'grading', intensity: number = 0.3): BoundingBox[] => {
  const boxes: BoundingBox[] = [];
  const classes = DEFECT_CLASSES_BY_STAGE[stage] || DEFAULT_DEFECTS;
  
  // Random chance to spawn defects
  if (Math.random() < intensity) {
    const numDefects = Math.floor(Math.random() * 4) + 1;
    
    for (let i = 0; i < numDefects; i++) {
      const defectType = classes[Math.floor(Math.random() * classes.length)];
      
      // Generate somewhat realistic coordinates
      // Avoid edges to make it look like objects on a belt/table
      const x = 15 + Math.random() * 70;
      const y = 15 + Math.random() * 70;
      
      boxes.push({
        id: `box-${Date.now()}-${i}`,
        x: x, 
        y: y,
        width: 8 + Math.random() * 12, 
        height: 8 + Math.random() * 12,
        label: defectType.label,
        confidence: 0.75 + (Math.random() * 0.24), // 0.75 - 0.99
        color: defectType.color
      });
    }
  }
  
  return boxes;
};