import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {verifyAuth} from "../utils/auth";
import {validateAssessmentInput, sanitizeLogData} from "../utils/validation";
import {checkRateLimit} from "../utils/rateLimiter";
import {predictPCOSRisk} from "../utils/mlModel";
import {PredictionResult} from "../types";

export async function predictHandler(
  data: unknown,
  context: functions.https.CallableContext
): Promise<PredictionResult> {
  // Log immediately - this should be the first thing that happens
  console.log("=== PREDICT FUNCTION CALLED (console.log) ===");
  functions.logger.info("=== PREDICT FUNCTION CALLED ===");
  
  const startTime = Date.now();

  // Wrap everything in a try-catch to catch any unexpected errors
  try {
    functions.logger.info("=== PREDICT FUNCTION CALLED (inside try) ===", {
      hasAuth: !!context.auth,
      authUid: context.auth?.uid?.substring(0, 8) || "none",
      dataKeys: data ? Object.keys(data as any) : [],
      dataType: typeof data,
      contextKeys: context ? Object.keys(context) : [],
    });

    // Verify authentication
    let userId: string;
    try {
      userId = await verifyAuth(context);
      functions.logger.info("Auth verified", { userId: userId.substring(0, 8) });
    } catch (authError: any) {
      functions.logger.error("Auth verification failed", { error: authError.message });
      throw authError; // This is already an HttpsError
    }

    // Get IP address
    const ip = context.rawRequest?.ip || context.rawRequest?.connection?.remoteAddress || "unknown";

    // Check rate limits
    try {
      await checkRateLimit(userId, ip);
      functions.logger.info("Rate limit check passed");
    } catch (rateLimitError: any) {
      functions.logger.error("Rate limit check failed", { error: rateLimitError.message });
      throw rateLimitError; // This should be HttpsError now
    }

    // Validate input
    let assessmentInput;
    try {
      assessmentInput = validateAssessmentInput(data);
      functions.logger.info("Input validated successfully");
    } catch (validationError: any) {
      functions.logger.error("Validation failed", { error: validationError.message, data });
      throw validationError; // This is already an HttpsError
    }

    // Log request (sanitized)
    functions.logger.info("Prediction request", {
      userId: userId.substring(0, 8) + "...",
      ip: ip.substring(0, 8) + "...",
      hasLabValues: !!(assessmentInput.fsh || assessmentInput.lh),
      timestamp: new Date().toISOString(),
    });

    // Run prediction
    let result: PredictionResult;
    try {
      functions.logger.info("Starting prediction...");
      result = await predictPCOSRisk(assessmentInput);
      functions.logger.info("Prediction completed", { label: result.label });
    } catch (predictionError: any) {
      functions.logger.error("Prediction failed", { error: predictionError.message, stack: predictionError.stack });
      throw predictionError;
    }

    // Save assessment to Firestore
    try {
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
      functions.logger.info("Assessment saved to Firestore");
    } catch (firestoreError: any) {
      functions.logger.error("Failed to save to Firestore", { error: firestoreError.message });
      // Don't fail the request if Firestore save fails - user still gets prediction
      // But log it for debugging
    }

    // Log performance
    const duration = Date.now() - startTime;
    functions.logger.info("Prediction completed", {
      userId: userId.substring(0, 8) + "...",
      label: result.label,
      duration: `${duration}ms`,
    });

    return result;
  } catch (error: any) {
    // Log comprehensive error information
    const errorInfo = {
      error: error?.message || "Unknown error",
      name: error?.name || "Error",
      code: error?.code || "unknown",
      stack: error?.stack || "No stack trace",
      type: typeof error,
      isHttpsError: error instanceof functions.https.HttpsError,
      dataPreview: data ? JSON.stringify(data).substring(0, 500) : "No data",
    };
    
    functions.logger.error("=== PREDICTION ERROR ===", errorInfo);

    // If it's already an HttpsError, throw it as-is (but log it first)
    if (error instanceof functions.https.HttpsError) {
      functions.logger.error("Throwing existing HttpsError", {
        code: error.code,
        message: error.message,
        details: error.details,
      });
      throw error;
    }

    // Provide more specific error messages based on error type
    let errorMessage = "An error occurred while processing your request. Please try again.";
    let errorCode: functions.https.FunctionsErrorCode = "internal";

    // Check for specific error types
    if (error?.message?.includes("ML service") || error?.message?.includes("fetch")) {
      errorMessage = "The prediction service is temporarily unavailable. Please try again.";
      errorCode = "unavailable";
    } else if (error?.message?.includes("validation") || error?.message?.includes("Invalid") || error?.message?.includes("Zod")) {
      errorMessage = "Invalid input data. Please check your assessment form.";
      errorCode = "invalid-argument";
    } else if (error?.message?.includes("rate limit") || error?.message?.includes("Rate limit")) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
      errorCode = "resource-exhausted";
    } else if (error?.message?.includes("auth") || error?.message?.includes("unauthenticated")) {
      errorMessage = "Authentication required. Please log in and try again.";
      errorCode = "unauthenticated";
    } else if (error?.message) {
      // Use the error message if available
      errorMessage = error.message;
    }

    // Log what we're about to throw
    functions.logger.error("Throwing new HttpsError", {
      code: errorCode,
      message: errorMessage,
      originalError: error?.message,
    });

    throw new functions.https.HttpsError(
      errorCode,
      errorMessage,
      { 
        originalError: error?.message || "Unknown error",
        originalCode: error?.code,
        originalName: error?.name,
      }
    );
  }
}

