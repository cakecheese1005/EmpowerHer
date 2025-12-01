import {z} from "zod";
import {AssessmentInputSchema} from "../types";
import * as functions from "firebase-functions";

export function validateAssessmentInput(data: unknown): z.infer<typeof AssessmentInputSchema> {
  try {
    // Normalize input data
    const inputData = data as any;
    
    // Calculate BMI if not provided but weight and height are available
    if (!inputData.bmi && inputData.weight && inputData.height) {
      inputData.bmi = parseFloat((inputData.weight / Math.pow(inputData.height / 100, 2)).toFixed(2));
    }
    
    // Ensure numbers are actually numbers
    if (typeof inputData.age === 'string') inputData.age = parseFloat(inputData.age);
    if (typeof inputData.weight === 'string') inputData.weight = parseFloat(inputData.weight);
    if (typeof inputData.height === 'string') inputData.height = parseFloat(inputData.height);
    
    functions.logger.info("Validating input", {
      hasAge: !!inputData.age,
      hasWeight: !!inputData.weight,
      hasHeight: !!inputData.height,
      hasCycleRegularity: !!inputData.cycleRegularity,
      hasExerciseFrequency: !!inputData.exerciseFrequency,
      hasDiet: !!inputData.diet,
      bmi: inputData.bmi,
    });
    
    return AssessmentInputSchema.parse(inputData);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      functions.logger.error("Validation error", { 
        errors: error.errors, 
        inputKeys: Object.keys(data as any),
        inputData: JSON.stringify(data).substring(0, 1000),
      });
      throw new functions.https.HttpsError("invalid-argument", `Validation failed: ${message}`);
    }
    functions.logger.error("Validation error (non-Zod)", { error, input: data });
    throw new functions.https.HttpsError("internal", "Validation error");
  }
}

export function sanitizeLogData(data: any): any {
  // Remove PII from logs
  const sanitized = {...data};
  if (sanitized.email) sanitized.email = "***";
  if (sanitized.phone) sanitized.phone = "***";
  if (sanitized.name) sanitized.name = "***";
  return sanitized;
}

