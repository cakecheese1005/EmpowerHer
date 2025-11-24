import {AssessmentInput, PredictionResult} from "../types";

// Mock ML model - replace with actual model loading
// In production, load from Firebase Storage or Cloud Storage
const DEV_MODE = process.env.DEV_MODE === "true" || !process.env.MODEL_PATH;

/**
 * Mock prediction function - replace with actual model inference
 * In production, this would:
 * 1. Load the model from storage (basic_pcos_model.pkl)
 * 2. Load the imputer (basic_imputer.pkl)
 * 3. Transform input features
 * 4. Run prediction
 * 5. Calculate SHAP values for explainability
 */
export async function predictPCOSRisk(
  input: AssessmentInput
): Promise<PredictionResult> {
  if (DEV_MODE) {
    // Deterministic mock response for development
    return getMockPrediction(input);
  }

  // Production path: Load actual model
  // For now, we'll use a Python microservice or call a deployed model
  // This is a placeholder for the actual implementation
  throw new Error("Production model not yet integrated. Set DEV_MODE=true for testing.");
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

