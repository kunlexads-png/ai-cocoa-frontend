
import { GoogleGenAI } from "@google/genai";
import { MachineHealth } from "../types";
import { cacheService } from "./cacheService";

/**
 * World-class initialization of Google GenAI SDK.
 * Exclusively using process.env.API_KEY as the configuration source.
 */
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generatePlantReport = async (
  dataContext: any, 
  reportType: 'DAILY_SUMMARY' | 'QUALITY' | 'FORECAST' | 'MAINTENANCE' | 'CUSTOM',
  customPrompt?: string
): Promise<string> => {
  const cacheKey = `REPORT_${reportType}_${new Date().getHours()}`;
  const cached = cacheService.get<string>(cacheKey);
  
  if (cached) {
    return cached;
  }

  try {
    let systemInstruction = "";
    let userPrompt = "";

    switch (reportType) {
      case 'DAILY_SUMMARY':
        systemInstruction = "You are the Plant Manager. Generate a 'Daily Processing Executive Summary'. Focus on total intake volume, processing throughput, key downtime events, and overall efficiency. Keep it under 200 words.";
        userPrompt = `Analyze this daily data: ${JSON.stringify(dataContext)}`;
        break;
      case 'QUALITY':
        systemInstruction = "You are the QA Director. Generate a 'Daily Quality Assurance Report'. Highlight average quality scores, defect rates, specific batches that were rejected or require review, and sensory profile trends.";
        userPrompt = `Analyze this quality data: ${JSON.stringify(dataContext)}`;
        break;
      case 'FORECAST':
        systemInstruction = "You are a Supply Chain Analyst. Generate a '7-Day Production Forecast'. Analyze the provided trend data to predict potential bottlenecks and suggest resource allocation adjustments.";
        userPrompt = `Analyze this forecast data: ${JSON.stringify(dataContext)}`;
        break;
      case 'MAINTENANCE':
        systemInstruction = "You are the Chief Engineer. Generate a 'Critical Maintenance & Safety Report'. Summarize active machine alerts, health scores, and safety risks. Prioritize urgent actions.";
        userPrompt = `Analyze this machine/safety data: ${JSON.stringify(dataContext)}`;
        break;
      default:
        systemInstruction = "You are an AI Assistant for a Cocoa Plant.";
        userPrompt = `Context: ${JSON.stringify(dataContext)}. User Request: ${customPrompt}`;
    }

    // Call generateContent with systemInstruction in the config as per the latest @google/genai guidelines.
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
      contents: userPrompt,
    });

    const text = response.text || "Unable to generate report at this time.";
    
    if (text.length > 50) {
      cacheService.set(cacheKey, text, 15);
    }

    return text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Could not connect to AI service. Please check API Key configuration.";
  }
};

export const analyzeQualityImage = async (gradingData: any): Promise<string> => {
    try {
        const prompt = `
          You are a Chief Quality Officer AI for a Cocoa Processing Plant equipped with Computer Vision.
          Analyze the following automated grading input from the vision sensors.
          
          Input Data:
          ${JSON.stringify(gradingData, null, 2)}
          
          Detect the following defects if present in the data context: 
          Mold, Defective beans, Foreign materials, Underripe/overripe beans, Slaty beans, Broken nibs, Color anomalies, Packaging defects.

          RETURN A VALID JSON OBJECT ONLY. Do not use Markdown formatting. Structure:
          {
            "qualityScore": number, // 0-100
            "detectedDefects": [
              { "type": "string", "severity": "Low" | "Medium" | "High" | "Critical", "confidence": number }
            ],
            "suggestedAction": "string", // Actionable instruction for the floor
            "summary": "string" // Technical summary
          }
        `;
    
        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: prompt,
        });
    
        return response.text || "{}";
      } catch (error) {
        console.error("Gemini API Error:", error);
        return JSON.stringify({ summary: "System Offline: AI Analysis unavailable.", qualityScore: 0, detectedDefects: [] });
      }
}

export const analyzeNewIntake = async (formData: any): Promise<string> => {
  try {
    const prompt = `
      You are an AI assistant powering the New Intake Record Module of a Cocoa Processing Dashboard.
      Your goal is to analyze, validate, and score newly arrived cocoa bean batches based on strict business logic.

      Data Provided:
      ${JSON.stringify(formData, null, 2)}
      
      BEHAVIOR INSTRUCTIONS:
      1. If essential information (Supplier, Weight, Moisture) is missing, ask the user to supply it in the 'recommendations' list and 'summary'.
      2. If moisture > 8%, you MUST warn about mold risk in 'recommendations'.
      3. If foreign matter > 1% (based on defects or notes provided), flag contamination risk.
      4. If slaty beans or mold defects are present (in visualContext or defect list), lower the 'qualityScore' significantly (<80).
      5. If image quality is poor (simulated based on context), ask for a clearer photo in recommendations.

      RETURN A VALID JSON OBJECT ONLY. NO MARKDOWN. Structure:
      {
        "qualityScore": number,
        "riskLevel": "Low" | "Medium" | "High",
        "recommendations": ["string", "string"],
        "detectedDefects": [
           { "type": "string", "severity": "Low" | "Medium" | "High", "confidence": number }
        ],
        "summary": "string"
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "{}";
  } catch (error) {
    console.error("Gemini API Error (Intake):", error);
    return JSON.stringify({ 
        qualityScore: 0, 
        riskLevel: 'High', 
        recommendations: ["System Offline - Manual Inspection Required"], 
        detectedDefects: [], 
        summary: "AI Analysis unavailable." 
    });
  }
};

export const diagnoseMachine = async (machineData: MachineHealth): Promise<string> => {
  try {
    const prompt = `
      You are a Senior Reliability Engineer AI (OFI Maintenance Team).
      Analyze the specific sensor data for this machine and generate a Maintenance Work Order.
      
      Machine Data:
      ${JSON.stringify(machineData, null, 2)}
      
      Task:
      1. Diagnose the root cause of the anomaly (Vibration, Temp, Power).
      2. Predict Estimated Time to Failure (ETF).
      3. List specific tools and parts required for repair.
      4. Provide step-by-step repair instructions.

      Format as a technical work order. Keep it concise.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Diagnostic failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "System Offline: Predictive Maintenance AI unavailable.";
  }
};

export const generateComplianceDoc = async (
  docType: string,
  batchDetails: any,
  client: string
): Promise<string> => {
  try {
    const prompt = `
      You are a Trade Compliance Officer for OFI (Olam Food Ingredients).
      Generate the text content for a formal ${docType}.
      
      Client: ${client}
      Batch Details: ${JSON.stringify(batchDetails)}
      Date: ${new Date().toLocaleDateString()}
      
      Requirements:
      - Use formal legal/technical language appropriate for international cocoa trade.
      - Include standard ISO/FCC quality parameters if applicable.
      - Include placeholder sections for [Signature] and [Stamp].
      - Do NOT include markdown formatting like **bold** or # headings, just plain text formatted as a document.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return response.text || "Document generation failed.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: AI Service Unavailable.";
  }
};

export const chatWithAssistant = async (
  message: string, 
  contextData: any,
  chatHistory: { role: 'user' | 'model', text: string }[]
): Promise<string> => {
  try {
    const userRole = contextData.role || 'Operator';
    const currentView = contextData.view || 'Dashboard';
    
    const systemInstruction = `
      You are the **OFI CocoaInsight Assistant**, an operational guide for the Cocoa Processing Dashboard.
      
      **CONTEXT:**
      - User Role: ${userRole}
      - Current Module: ${currentView}
      - App Version: v2.4.0 (Batch Import Mode)
      
      **RULES:**
      - If the user asks for help, explain the features available in the current module (${currentView}).
      - If they ask to perform an action (like "Import data"), guide them to the button in the header.
      - Maintain a professional, helpful, yet technically accurate tone.
      - Address safety risks immediately if mentioned in the context data.
      - NEVER mention that you are an AI or a language model unless directly asked about your nature.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: systemInstruction,
      },
      contents: message,
    });

    return response.text || "I'm having trouble processing that right now.";
  } catch (error) {
    console.error("Gemini API Error (Chat):", error);
    return "I'm sorry, I encountered an error. Please try again later.";
  }
};
