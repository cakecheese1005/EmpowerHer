import { 
  GoogleAuthProvider, 
  signInWithPopup, 
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';

// Google Authentication
export async function signInWithGoogle() {
  try {
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account'
    });
    
    const result = await signInWithPopup(auth, provider);
    const user = result.user;
    
    // Create or update user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    
    try {
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          name: user.displayName || 'User',
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: new Date(),
          provider: 'google',
        });
      }
    } catch (firestoreError: any) {
      // If offline error, try to create anyway (it will sync when online)
      if (firestoreError.code === 'failed-precondition' || firestoreError.message?.includes('offline')) {
        console.warn('Firestore offline, creating profile in background:', firestoreError);
        // Create document anyway - it will sync when online
        setDoc(userRef, {
          name: user.displayName || 'User',
          email: user.email,
          photoURL: user.photoURL || null,
          createdAt: new Date(),
          provider: 'google',
        }).catch(err => console.warn('Failed to create user profile:', err));
      } else {
        throw firestoreError;
      }
    }
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

// Phone Authentication - Setup Recaptcha
let recaptchaVerifier: RecaptchaVerifier | null = null;

export function setupRecaptcha(containerId: string = 'recaptcha-container'): RecaptchaVerifier {
  if (typeof window === 'undefined') {
    throw new Error('Recaptcha can only be initialized in the browser');
  }
  
  // Clear existing verifier if any
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
  }
  
  recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
    size: 'normal',
    callback: () => {
      console.log('reCAPTCHA verified');
    },
    'expired-callback': () => {
      console.log('reCAPTCHA expired');
    }
  });
  
  return recaptchaVerifier;
}

// Send verification code
export async function sendPhoneVerificationCode(
  phoneNumber: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<ConfirmationResult> {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return confirmationResult;
  } catch (error: any) {
    console.error('Phone verification error:', error);
    throw error;
  }
}

// Verify phone code and sign in
export async function verifyPhoneCode(
  confirmationResult: ConfirmationResult,
  code: string
) {
  try {
    const result = await confirmationResult.confirm(code);
    const user = result.user;
    
    // Create or update user profile in Firestore
    const userRef = doc(db, 'users', user.uid);
    
    try {
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        await setDoc(userRef, {
          phoneNumber: user.phoneNumber,
          createdAt: new Date(),
          provider: 'phone',
        });
      }
    } catch (firestoreError: any) {
      // If offline error, try to create anyway (it will sync when online)
      if (firestoreError.code === 'failed-precondition' || firestoreError.message?.includes('offline')) {
        console.warn('Firestore offline, creating profile in background:', firestoreError);
        // Create document anyway - it will sync when online
        setDoc(userRef, {
          phoneNumber: user.phoneNumber,
          createdAt: new Date(),
          provider: 'phone',
        }).catch(err => console.warn('Failed to create user profile:', err));
      } else {
        throw firestoreError;
      }
    }
    
    return { success: true, user };
  } catch (error: any) {
    console.error('Phone code verification error:', error);
    throw error;
  }
}

// Cleanup recaptcha
export function cleanupRecaptcha() {
  if (recaptchaVerifier) {
    recaptchaVerifier.clear();
    recaptchaVerifier = null;
  }
}

