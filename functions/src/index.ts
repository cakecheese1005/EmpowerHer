import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import {predictHandler} from "./handlers/predict";
import {exportUserHandler} from "./handlers/export-user";
import {deleteUserHandler} from "./handlers/delete-user";
import {foodClassifyHandler} from "./handlers/food-classify";
import {healthHandler} from "./handlers/health";

// Initialize Firebase Admin with error handling
try {
  if (admin.apps.length === 0) {
    admin.initializeApp();
    functions.logger.info("Firebase Admin initialized successfully");
  } else {
    functions.logger.info("Firebase Admin already initialized");
  }
} catch (error: any) {
  functions.logger.error("Failed to initialize Firebase Admin", {
    error: error?.message || "Unknown error",
    stack: error?.stack,
  });
  // Continue anyway - it might already be initialized
}

// Health check endpoint
export const health = functions.https.onRequest(healthHandler);

// ML Prediction HTTP endpoint (with explicit CORS for fallback)
export const predictHttp = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 60,
    memory: "512MB",
  })
  .https.onRequest(async (req, res) => {
    // Enable CORS
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle preflight OPTIONS request
    if (req.method === 'OPTIONS') {
      res.status(204).send('');
      return;
    }

    try {
      functions.logger.info("HTTP endpoint called", {
        method: req.method,
        hasAuth: !!req.headers.authorization,
      });

      // Get auth token from header
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ error: 'Unauthorized', code: 'unauthenticated' });
        return;
      }

      const token = authHeader.split('Bearer ')[1];
      
      // Verify token and get user
      const decodedToken = await admin.auth().verifyIdToken(token);
      const userId = decodedToken.uid;

      // Parse request body
      let requestData = req.body;
      if (typeof requestData === 'string') {
        try {
          requestData = JSON.parse(requestData);
        } catch (e) {
          res.status(400).json({ error: 'Invalid JSON in request body' });
          return;
        }
      }

      // Extract data from { data: {...} } format or use body directly
      const data = requestData.data || requestData;

      // Create a mock context for the handler
      const context = {
        auth: {
          uid: userId,
          token: decodedToken,
        },
        rawRequest: req,
      } as any;

      // Call the handler
      const result = await predictHandler(data, context);
      res.status(200).json({ result });
    } catch (error: any) {
      functions.logger.error('HTTP endpoint error:', error);
      
      // If it's an HttpsError, extract code and message
      if (error instanceof functions.https.HttpsError) {
        res.status(400).json({ 
          error: error.message,
          code: error.code
        });
        return;
      }
      
      res.status(500).json({ 
        error: error.message || 'Internal server error',
        code: error.code || 'internal'
      });
    }
  });

// ML Prediction endpoint
export const predict = functions
  .region("us-central1")
  .runWith({
    timeoutSeconds: 60,
    memory: "512MB",
  })
  .https.onCall(async (data, context) => {
    // Wrap the handler to catch any errors before they reach the handler
    try {
      functions.logger.info("=== PREDICT FUNCTION INVOKED (top level) ===", {
        hasData: !!data,
        hasContext: !!context,
        hasAuth: !!context?.auth,
        timestamp: new Date().toISOString(),
      });
      
      return await predictHandler(data, context);
    } catch (error: any) {
      // Log any errors that occur before the handler's try-catch
      functions.logger.error("=== TOP LEVEL ERROR IN PREDICT ===", {
        error: error?.message || "Unknown error",
        name: error?.name || "Error",
        code: error?.code || "unknown",
        stack: error?.stack || "No stack trace",
        isHttpsError: error instanceof functions.https.HttpsError,
      });
      
      // Re-throw if it's already an HttpsError
      if (error instanceof functions.https.HttpsError) {
        throw error;
      }
      
      // Otherwise wrap in HttpsError
      throw new functions.https.HttpsError(
        "internal",
        "An unexpected error occurred while processing your request.",
        { originalError: error?.message || "Unknown error" }
      );
    }
  });

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

