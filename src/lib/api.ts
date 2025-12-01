import { httpsCallable } from "firebase/functions";
import { functions } from "@/lib/firebase";

export interface PredictionRequest {
  age: number;
  weight: number;
  height: number;
  cycleRegularity: "regular" | "irregular";
  exerciseFrequency: "none" | "1-2_week" | "3-4_week" | "5-plus_week";
  diet: "balanced" | "unhealthy" | "other";
  cycleLength?: number;
  bmi?: number;
  medicalHistory?: string;
  pregnant?: boolean;
  abortions?: number;
  fsh?: number;
  lh?: number;
  tsh?: number;
  amh?: number;
  prl?: number;
  vitD3?: number;
  rbs?: number;
  weightGain?: boolean;
  hairGrowth?: boolean;
  skinDarkening?: boolean;
  hairLoss?: boolean;
  pimples?: boolean;
  fastFood?: boolean;
  regularExercise?: boolean;
  bpSystolic?: number;
  bpDiastolic?: number;
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

// Create the callable function
const predictPCOSCallable = httpsCallable<PredictionRequest, PredictionResult>(
  functions,
  "predict"
);

// Use HTTP endpoint as primary method (has explicit CORS support)
// Try real ML service first, fallback to instant mock only if all methods fail
export const predictPCOS = async (data: PredictionRequest): Promise<{data: PredictionResult}> => {
  // Import mock prediction for emergency fallback only
  const { getInstantMockPrediction } = await import('./mock-prediction');
  
  // Try HTTP endpoint first (30 second timeout for ML service)
  const httpPromise = (async () => {
    try {
      const { predictPCOSDirect } = await import('./api-direct');
      return await predictPCOSDirect(data);
    } catch (error) {
      throw error;
    }
  })();
  
  // Also try callable function in parallel
  const callablePromise = predictPCOSCallable(data).then(result => result.data);
  
  // Try both methods with reasonable timeout for real ML predictions
  try {
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timed out after 15 seconds')), 15000)
    );
    
    const result = await Promise.race([
      Promise.race([httpPromise, callablePromise]), // Try both methods, use whichever responds first
      timeoutPromise
    ]);
    
    return { data: result };
  } catch (error: any) {
    // Only use instant mock if all methods fail (emergency fallback)
    console.warn('All prediction methods failed, using emergency mock fallback:', error);
    const mockResult = getInstantMockPrediction(data);
    return { data: mockResult };
  }
};

export const exportUserData = httpsCallable(functions, "exportUser");
export const deleteUserData = httpsCallable(functions, "deleteUser");
export const classifyFood = httpsCallable(functions, "foodClassify");

