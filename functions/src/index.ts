import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {predictHandler} from "./handlers/predict";
import {exportUserHandler} from "./handlers/export-user";
import {deleteUserHandler} from "./handlers/delete-user";
import {foodClassifyHandler} from "./handlers/food-classify";
import {healthHandler} from "./handlers/health";

admin.initializeApp();

// Health check endpoint
export const health = functions.https.onRequest(healthHandler);

// ML Prediction endpoint
export const predict = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 60,
    memory: "512MB",
  })
  .https.onCall(predictHandler);

// User data export endpoint
export const exportUser = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 540,
    memory: "1GB",
  })
  .https.onCall(exportUserHandler);

// User data deletion endpoint
export const deleteUser = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 540,
    memory: "1GB",
  })
  .https.onCall(deleteUserHandler);

// Food classification endpoint (mock for now)
export const foodClassify = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 60,
    memory: "512MB",
  })
  .https.onCall(foodClassifyHandler);

