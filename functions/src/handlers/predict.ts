import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {verifyAuth} from "../utils/auth";
import {validateAssessmentInput, sanitizeLogData} from "../utils/validation";
import {checkRateLimit} from "../utils/rateLimiter";
import {predictPCOSRisk} from "../utils/mlModel";
import {AssessmentInput, PredictionResult} from "../types";

export async function predictHandler(
  data: unknown,
  context: functions.https.CallableContext
): Promise<PredictionResult> {
  const startTime = Date.now();

  try {
    // Verify authentication
    const userId = await verifyAuth(context);

    // Get IP address
    const ip = context.rawRequest?.ip || context.rawRequest?.connection?.remoteAddress || "unknown";

    // Check rate limits
    await checkRateLimit(userId, ip);

    // Validate input
    const assessmentInput = validateAssessmentInput(data);

    // Log request (sanitized)
    functions.logger.info("Prediction request", {
      userId: userId.substring(0, 8) + "...",
      ip: ip.substring(0, 8) + "...",
      hasLabValues: !!(assessmentInput.fsh || assessmentInput.lh),
      timestamp: new Date().toISOString(),
    });

    // Run prediction
    const result = await predictPCOSRisk(assessmentInput);

    // Save assessment to Firestore
    const assessmentRef = admin.firestore().collection("assessments").doc();
    await assessmentRef.set({
      userId,
      input: sanitizeLogData(assessmentInput),
      result: {
        label: result.label,
        probabilities: result.probabilities,
        topContributors: result.topContributors,
      },
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      ip: ip.substring(0, 8) + "...", // Partial IP for logging
    });

    // Log performance
    const duration = Date.now() - startTime;
    functions.logger.info("Prediction completed", {
      userId: userId.substring(0, 8) + "...",
      label: result.label,
      duration: `${duration}ms`,
    });

    return result;
  } catch (error: any) {
    functions.logger.error("Prediction error", {
      error: error.message,
      stack: error.stack,
    });

    if (error instanceof functions.https.HttpsError) {
      throw error;
    }

    throw new functions.https.HttpsError(
      "internal",
      "An error occurred while processing your request"
    );
  }
}

