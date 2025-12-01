import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore, connectFirestoreEmulator, enableNetwork } from "firebase/firestore";
import { getFunctions, Functions, connectFunctionsEmulator } from "firebase/functions";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "YOUR_API_KEY",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "YOUR_AUTH_DOMAIN",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "YOUR_PROJECT_ID",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "YOUR_STORAGE_BUCKET",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "YOUR_SENDER_ID",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "YOUR_APP_ID",
};

// Initialize Firebase App (safe on server, just creates the app instance)
let app: FirebaseApp;
if (getApps().length === 0) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (error: any) {
    console.error("Firebase app initialization error:", error?.message || error);
    // Create a minimal app instance to prevent crashes
    throw new Error("Failed to initialize Firebase. Please check your configuration.");
  }
} else {
  app = getApps()[0];
}

// Initialize services (safe to initialize even on server)
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);
export const functions: Functions = getFunctions(app, "us-central1");

// Client-side only operations
if (typeof window !== "undefined") {
  // Connect to emulators in development if enabled
  if (process.env.NEXT_PUBLIC_USE_EMULATOR === "true") {
    if (process.env.NODE_ENV === "development") {
      try {
        connectFirestoreEmulator(db, "localhost", 8080);
        connectFunctionsEmulator(functions, "localhost", 5001);
        console.log("🔌 Connected to Firebase emulators");
      } catch (error) {
        // Emulators already connected
        console.log("Emulators already connected or not available");
      }
    }
  } else {
    // Ensure Firestore is online - retry if it fails
    const ensureFirestoreOnline = async () => {
      try {
        await enableNetwork(db);
        console.log("✅ Firestore network enabled");
      } catch (error: any) {
        console.warn("Failed to enable Firestore network, retrying...", error);
        // Retry after a short delay
        setTimeout(() => {
          enableNetwork(db).catch((err) => {
            console.error("Failed to enable Firestore network after retry:", err);
          });
        }, 1000);
      }
    };
    
    // Enable network immediately and also after a delay to handle race conditions
    ensureFirestoreOnline();
    setTimeout(ensureFirestoreOnline, 500);
  }
}

export default app;

