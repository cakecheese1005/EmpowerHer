import {AssessmentInput, PredictionResult} from "../types";
import * as functions from "firebase-functions";

// Get configuration from Firebase Functions config or environment variables
// Firebase Functions v2 uses functions.config(), but we also support env vars for local dev
let config: any = {};
try {
  config = functions.config();
} catch (e) {
  // If config is not available (e.g., in local emulator), use env vars
  config = {};
}

// DEV_MODE: Use config from Firebase Functions or environment variables
// Set to "false" to use real ML service, "true" for mock predictions
const DEV_MODE = config.ml_service?.dev_mode === "true" || process.env.DEV_MODE === "true";
const ML_SERVICE_URL = config.ml_service?.url || process.env.ML_SERVICE_URL || "http://localhost:8000";

// Log configuration on module load
console.log("ML Model Configuration:", {
  devMode: DEV_MODE,
  mlServiceUrl: ML_SERVICE_URL,
  configDevMode: config.ml_service?.dev_mode,
  envDevMode: process.env.DEV_MODE,
  usingRealML: !DEV_MODE,
});

/**
 * Predict PCOS risk using the ML model service
 * In production, this calls the Python FastAPI microservice
 */
export async function predictPCOSRisk(
  input: AssessmentInput
): Promise<PredictionResult> {
  console.log("predictPCOSRisk called, DEV_MODE:", DEV_MODE);
  
  if (DEV_MODE) {
    console.log("Using mock prediction (DEV_MODE enabled)");
    // Deterministic mock response for development
    return getMockPrediction(input);
  }

  // Production path: Call the ML microservice
  try {
    console.log(`Calling ML service at: ${ML_SERVICE_URL}/predict`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout (faster fail)
    
    const response = await fetch(`${ML_SERVICE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`ML service HTTP error: ${response.status} - ${errorText}`);
      throw new Error(`ML service error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("ML service response received successfully");
    
    // Validate and transform the response
    return {
      label: result.label as "No Risk" | "Early" | "High",
      probabilities: {
        NoRisk: result.probabilities?.NoRisk || result.probabilities?.noRisk || 0,
        Early: result.probabilities?.Early || result.probabilities?.early || 0,
        High: result.probabilities?.High || result.probabilities?.high || 0,
      },
      topContributors: result.topContributors || result.top_contributors || [],
    };
  } catch (error: any) {
    // Log the error and fallback to mock
    console.error("ML service error, falling back to mock:", {
      message: error.message,
      name: error.name,
      stack: error.stack,
      mlServiceUrl: ML_SERVICE_URL,
    });
    
    // Fallback to mock if service is unavailable
    return getMockPrediction(input);
  }
}

function getMockPrediction(input: AssessmentInput): PredictionResult {
  // Simple rule-based mock that provides deterministic results
  let riskScore = 0;
  const contributors: Array<{feature: string; contribution: number}> = [];

  // Age factor
  if (input.age > 30) {
    riskScore += 0.2;
    contributors.push({feature: "Age", contribution: 0.2});
  }

  // BMI calculation
  const bmi = input.bmi || (input.weight / Math.pow(input.height / 100, 2));
  if (bmi > 25) {
    riskScore += 0.3;
    contributors.push({feature: "BMI", contribution: 0.3});
  }

  // Cycle regularity
  if (input.cycleRegularity === "irregular") {
    riskScore += 0.4;
    contributors.push({feature: "Cycle Regularity", contribution: 0.4});
  }

  // Exercise
  if (input.exerciseFrequency === "none") {
    riskScore += 0.2;
    contributors.push({feature: "Exercise Frequency", contribution: 0.2});
  }

  // Diet
  if (input.diet === "unhealthy") {
    riskScore += 0.15;
    contributors.push({feature: "Diet", contribution: 0.15});
  }

  // Normalize risk score to 0-1
  riskScore = Math.min(1, riskScore);

  // Determine label
  let label: "No Risk" | "Early" | "High";
  if (riskScore < 0.3) {
    label = "No Risk";
  } else if (riskScore < 0.6) {
    label = "Early";
  } else {
    label = "High";
  }

  // Calculate probabilities
  const probabilities = {
    NoRisk: label === "No Risk" ? 0.7 : label === "Early" ? 0.2 : 0.1,
    Early: label === "Early" ? 0.6 : label === "High" ? 0.2 : 0.1,
    High: label === "High" ? 0.7 : label === "Early" ? 0.2 : 0.1,
  };

  // Normalize probabilities
  const sum = probabilities.NoRisk + probabilities.Early + probabilities.High;
  probabilities.NoRisk /= sum;
  probabilities.Early /= sum;
  probabilities.High /= sum;

  // Get top 3 contributors
  const topContributors = contributors
    .sort((a, b) => b.contribution - a.contribution)
    .slice(0, 3)
    .map((c) => ({
      feature: c.feature,
      contribution: c.contribution,
      explanation: getFeatureExplanation(c.feature, c.contribution),
    }));

  return {
    label,
    probabilities,
    topContributors,
  };
}

function getFeatureExplanation(feature: string, contribution: number): string {
  const explanations: Record<string, string> = {
    "Age": "Age can be a factor in PCOS risk, especially for women over 30.",
    "BMI": "Higher BMI is associated with increased PCOS risk. Maintaining a healthy weight can help manage symptoms.",
    "Cycle Regularity": "Irregular menstrual cycles are a key indicator of PCOS. Regular cycles suggest lower risk.",
    "Exercise Frequency": "Regular exercise helps manage PCOS symptoms and reduces risk factors.",
    "Diet": "A balanced diet rich in whole foods can help manage PCOS symptoms and improve overall health.",
  };

  return explanations[feature] || `${feature} contributes to your risk assessment.`;
}

