// Client-side mock prediction as instant fallback
import { PredictionRequest, PredictionResult } from './api';

export function getInstantMockPrediction(input: PredictionRequest): PredictionResult {
  // Instant rule-based prediction (same logic as server-side mock)
  let riskScore = 0;
  const contributors: Array<{feature: string; contribution: number; explanation: string}> = [];

  // Age factor
  if (input.age > 30) {
    riskScore += 0.2;
    contributors.push({
      feature: "Age",
      contribution: 0.2,
      explanation: "Age can be a factor in PCOS risk, especially for women over 30."
    });
  }

  // BMI calculation
  const bmi = input.bmi || (input.weight / Math.pow(input.height / 100, 2));
  if (bmi > 25) {
    riskScore += 0.3;
    contributors.push({
      feature: "BMI",
      contribution: 0.3,
      explanation: "Higher BMI is associated with increased PCOS risk. Maintaining a healthy weight can help manage symptoms."
    });
  }

  // Cycle regularity
  if (input.cycleRegularity === "irregular") {
    riskScore += 0.4;
    contributors.push({
      feature: "Cycle Regularity",
      contribution: 0.4,
      explanation: "Irregular menstrual cycles are a key indicator of PCOS. Regular cycles suggest lower risk."
    });
  }

  // Exercise
  if (input.exerciseFrequency === "none") {
    riskScore += 0.2;
    contributors.push({
      feature: "Exercise Frequency",
      contribution: 0.2,
      explanation: "Regular exercise helps manage PCOS symptoms and reduces risk factors."
    });
  }

  // Diet
  if (input.diet === "unhealthy") {
    riskScore += 0.15;
    contributors.push({
      feature: "Diet",
      contribution: 0.15,
      explanation: "A balanced diet rich in whole foods can help manage PCOS symptoms and improve overall health."
    });
  }

  // Normalize risk score
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
    .slice(0, 3);

  return {
    label,
    probabilities,
    topContributors,
  };
}

