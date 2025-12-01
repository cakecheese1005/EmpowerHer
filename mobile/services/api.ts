import {httpsCallable} from "firebase/functions";
import {functions} from "@/config/firebase";

export interface PredictionRequest {
  age: number;
  weight: number;
  height: number;
  cycleRegularity: "regular" | "irregular";
  exerciseFrequency: "none" | "1-2_week" | "3-4_week" | "5-plus_week";
  diet: "balanced" | "unhealthy" | "other";
  medicalHistory?: string;
  [key: string]: any;
}

export interface PredictionResult {
  label: "No Risk" | "Early" | "High";
  probabilities: {
    NoRisk: number;
    Early: number;
    High: number;
  };
  topContributors: Array<{
    feature: string;
    contribution: number;
    explanation: string;
  }>;
}

export const predictPCOS = httpsCallable<PredictionRequest, PredictionResult>(
  functions,
  "predict"
);

export const exportUserData = httpsCallable(functions, "exportUser");
export const deleteUserData = httpsCallable(functions, "deleteUser");
export const classifyFood = httpsCallable(functions, "foodClassify");

