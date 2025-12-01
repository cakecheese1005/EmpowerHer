import * as admin from "firebase-admin";
import * as functions from "firebase-functions";

export async function verifyAuth(context: functions.https.CallableContext): Promise<string> {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "User must be authenticated"
    );
  }
  return context.auth.uid;
}

export async function verifyAdmin(uid: string): Promise<void> {
  const userRecord = await admin.auth().getUser(uid);
  const claims = userRecord.customClaims || {};
  
  if (claims.role !== "admin" && claims.role !== "clinician") {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Admin or clinician role required"
    );
  }
}

export async function getUserRole(uid: string): Promise<string | null> {
  try {
    const userRecord = await admin.auth().getUser(uid);
    return (userRecord.customClaims as any)?.role || null;
  } catch {
    return null;
  }
}

