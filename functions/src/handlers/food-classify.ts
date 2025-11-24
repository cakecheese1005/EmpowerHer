import * as functions from "firebase-functions";
import {verifyAuth} from "../utils/auth";

export async function foodClassifyHandler(
  data: {imageUrl: string},
  context: functions.https.CallableContext
): Promise<{food: string; calories: number; category: string}> {
  try {
    await verifyAuth(context);

    // Mock implementation - replace with actual food classification model
    // In production, this would:
    // 1. Download image from Firebase Storage
    // 2. Preprocess image
    // 3. Run food classification model
    // 4. Return food name, estimated calories, and category

    functions.logger.info("Food classification request", {
      imageUrl: data.imageUrl?.substring(0, 50) + "...",
    });

    // Mock response
    return {
      food: "Grilled Chicken Salad",
      calories: 350,
      category: "Healthy",
    };
  } catch (error: any) {
    functions.logger.error("Food classification error", {error: error.message});
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to classify food");
  }
}

