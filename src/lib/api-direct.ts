// Direct API call fallback to bypass CORS issues
import { auth } from "./firebase";

export interface PredictionRequest {
  age: number;
  weight: number;
  height: number;
  cycleRegularity: "regular" | "irregular";
  exerciseFrequency: "none" | "1-2_week" | "3-4_week" | "5-plus_week";
  diet: "balanced" | "unhealthy" | "other";
  cycleLength?: number;
  bmi?: number;
  medicalHistory?: string;
  pregnant?: boolean;
  abortions?: number;
  fsh?: number;
  lh?: number;
  tsh?: number;
  amh?: number;
  prl?: number;
  vitD3?: number;
  rbs?: number;
  weightGain?: boolean;
  hairGrowth?: boolean;
  skinDarkening?: boolean;
  hairLoss?: boolean;
  pimples?: boolean;
  fastFood?: boolean;
  regularExercise?: boolean;
  bpSystolic?: number;
  bpDiastolic?: number;
}

export interface PredictionResult {
  label: "No Risk" | "Early" | "High";
  probabilities: {
    NoRisk: number;
    Early: number;
    High: number;
  };
  topContributors: Array<{
    feature: string;
    contribution: number;
    explanation: string;
  }>;
}

// Helper function to add timeout to fetch
function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number = 30000): Promise<Response> {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => {
      reject(new Error(`Request timed out after ${timeoutMs}ms`));
    }, timeoutMs);

    fetch(url, options)
      .then((response) => {
        clearTimeout(timeoutId);
        resolve(response);
      })
      .catch((error) => {
        clearTimeout(timeoutId);
        reject(error);
      });
  });
}

// Direct fetch implementation as fallback
export async function predictPCOSDirect(
  data: PredictionRequest
): Promise<PredictionResult> {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("User must be authenticated");
  }

  // Get auth token
  const token = await user.getIdToken();
  
  // Use ML Service directly (bypassing Firebase Function for faster response)
  const mlServiceUrl = `https://empowerher-ml-service-893349237440.europe-west1.run.app/predict`;
  const functionUrl = `https://us-central1-studio-9165758963-a10e4.cloudfunctions.net/predictHttp`;
  
  // Try ML service directly first (faster, no Firebase Function overhead)
  try {
    const directResponse = await fetchWithTimeout(
      mlServiceUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      },
      10000 // 10 second timeout for direct ML service
    );

    if (directResponse.ok) {
      const directResult = await directResponse.json();
      return directResult;
    } else {
      throw new Error(`Direct ML service returned ${directResponse.status}`);
    }
  } catch (directError: any) {
    // If direct call fails, try through Firebase Function
    console.log("Direct ML service call failed, trying Firebase Function:", directError?.message);
  }
  
  // Fallback to Firebase Function endpoint
  try {
    // Add 10 second timeout to prevent hanging
    const response = await fetchWithTimeout(
      functionUrl,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ data }),
      },
      30000 // 30 second timeout
    );

    if (!response.ok) {
      let errorText = '';
      try {
        const errorData = await response.json();
        errorText = errorData.error || errorData.message || '';
      } catch {
        errorText = await response.text();
      }
      throw new Error(errorText || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result = await response.json();

    // Extract data from HTTP endpoint response format
    if (result.result) {
      return result.result;
    }
    return result;
  } catch (error: any) {
    // Check if it's a timeout error
    if (error.message?.includes('timeout')) {
      throw new Error('Request timed out. The service may be slow. Please try again.');
    }
    // Re-throw with more context
    throw new Error(`Failed to call prediction service: ${error.message || String(error)}`);
  }
}

