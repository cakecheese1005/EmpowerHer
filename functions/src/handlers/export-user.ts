import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {verifyAuth} from "../utils/auth";

export async function exportUserHandler(
  data: {userId?: string},
  context: functions.https.CallableContext
): Promise<{data: any; format: string}> {
  try {
    const requesterId = await verifyAuth(context);
    const targetUserId = data.userId || requesterId;

    // Users can only export their own data unless they're admin
    if (targetUserId !== requesterId) {
      const userRecord = await admin.auth().getUser(requesterId);
      const claims = userRecord.customClaims || {};
      if (claims.role !== "admin") {
        throw new functions.https.HttpsError(
          "permission-denied",
          "You can only export your own data"
        );
      }
    }

    // Collect all user data
    const [userDoc, assessmentsSnapshot, profileDoc] = await Promise.all([
      admin.auth().getUser(targetUserId),
      admin.firestore().collection("assessments")
        .where("userId", "==", targetUserId)
        .get(),
      admin.firestore().collection("profiles").doc(targetUserId).get(),
    ]);

    const exportData = {
      user: {
        uid: userDoc.uid,
        email: userDoc.email,
        displayName: userDoc.displayName,
        createdAt: userDoc.metadata.creationTime,
        lastSignIn: userDoc.metadata.lastSignInTime,
      },
      profile: profileDoc.exists ? profileDoc.data() : null,
      assessments: assessmentsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })),
      exportedAt: new Date().toISOString(),
    };

    functions.logger.info("User data exported", {
      userId: targetUserId.substring(0, 8) + "...",
      requesterId: requesterId.substring(0, 8) + "...",
    });

    return {
      data: exportData,
      format: "json",
    };
  } catch (error: any) {
    functions.logger.error("Export error", {error: error.message});
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to export user data");
  }
}

