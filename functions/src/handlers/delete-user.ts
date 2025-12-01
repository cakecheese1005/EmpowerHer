import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {verifyAuth, verifyAdmin} from "../utils/auth";

export async function deleteUserHandler(
  data: {userId: string; confirm: boolean},
  context: functions.https.CallableContext
): Promise<{success: boolean; message: string}> {
  try {
    const requesterId = await verifyAuth(context);
    const targetUserId = data.userId;

    // Users can only delete their own account unless they're admin
    if (targetUserId !== requesterId) {
      await verifyAdmin(requesterId);
    }

    if (!data.confirm) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Deletion must be confirmed"
      );
    }

    // Delete user data from Firestore
    const batch = admin.firestore().batch();

    // Delete assessments
    const assessmentsSnapshot = await admin.firestore()
      .collection("assessments")
      .where("userId", "==", targetUserId)
      .get();
    assessmentsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete profile
    const profileRef = admin.firestore().collection("profiles").doc(targetUserId);
    batch.delete(profileRef);

    await batch.commit();

    // Delete user from Auth (only if deleting own account or admin)
    if (targetUserId === requesterId || (await verifyAdmin(requesterId).then(() => true).catch(() => false))) {
      try {
        await admin.auth().deleteUser(targetUserId);
      } catch (error: any) {
        functions.logger.warn("Could not delete auth user", {error: error.message});
      }
    }

    functions.logger.info("User data deleted", {
      userId: targetUserId.substring(0, 8) + "...",
      requesterId: requesterId.substring(0, 8) + "...",
    });

    return {
      success: true,
      message: "User data deleted successfully",
    };
  } catch (error: any) {
    functions.logger.error("Delete error", {error: error.message});
    if (error instanceof functions.https.HttpsError) {
      throw error;
    }
    throw new functions.https.HttpsError("internal", "Failed to delete user data");
  }
}

