import {z} from "zod";
import {AssessmentInputSchema} from "../types";
import * as functions from "firebase-functions";

export function validateAssessmentInput(data: unknown): z.infer<typeof AssessmentInputSchema> {
  try {
    return AssessmentInputSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const message = error.errors.map((e) => `${e.path.join(".")}: ${e.message}`).join(", ");
      throw new functions.https.HttpsError("invalid-argument", `Validation failed: ${message}`);
    }
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

