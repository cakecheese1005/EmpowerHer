import {z} from "zod";

// Assessment input schema
export const AssessmentInputSchema = z.object({
  // Demographics
  age: z.number().min(12).max(60),
  weight: z.number().min(30).max(200),
  height: z.number().min(100).max(250),
  
  // Clinical
  cycleRegularity: z.enum(["regular", "irregular"]),
  cycleLength: z.number().min(1).max(50).optional(),
  bmi: z.number().min(10).max(50).optional(),
  
  // Lifestyle
  exerciseFrequency: z.enum(["none", "1-2_week", "3-4_week", "5-plus_week"]),
  diet: z.enum(["balanced", "unhealthy", "other"]),
  
  // Medical History
  medicalHistory: z.string().optional(),
  pregnant: z.boolean().optional(),
  abortions: z.number().min(0).optional(),
  
  // Lab values (optional)
  fsh: z.number().optional(),
  lh: z.number().optional(),
  tsh: z.number().optional(),
  amh: z.number().optional(),
  prl: z.number().optional(),
  vitD3: z.number().optional(),
  rbs: z.number().optional(),
  
  // Symptoms
  weightGain: z.boolean().optional(),
  hairGrowth: z.boolean().optional(),
  skinDarkening: z.boolean().optional(),
  hairLoss: z.boolean().optional(),
  pimples: z.boolean().optional(),
  
  // Additional
  fastFood: z.boolean().optional(),
  regularExercise: z.boolean().optional(),
  bpSystolic: z.number().optional(),
  bpDiastolic: z.number().optional(),
});

export type AssessmentInput = z.infer<typeof AssessmentInputSchema>;

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

export interface RateLimitInfo {
  userId: string;
  ip: string;
  timestamp: number;
}

