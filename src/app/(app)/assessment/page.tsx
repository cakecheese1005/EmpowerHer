'use client';

import { useState } from 'react';
import { useForm, FormProvider, FieldPath } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { predictPCOS, PredictionRequest, PredictionResult } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { getPersonalizedRecommendations } from '@/app/actions';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Simplified schema for demonstration
const assessmentSchema = z.object({
  age: z.coerce.number().min(12, 'Age must be at least 12').max(60, 'Age must be at most 60'),
  weight: z.coerce.number().min(30, 'Weight must be at least 30kg').max(200, 'Weight must be at most 200kg'),
  height: z.coerce.number().min(100, 'Height must be at least 100cm').max(250, 'Height must be at most 250cm'),
  cycleRegularity: z.enum(['regular', 'irregular'], { required_error: 'Please select an option.'}),
  exerciseFrequency: z.enum(['none', '1-2_week', '3-4_week', '5-plus_week'], { required_error: 'Please select an option.'}),
  diet: z.enum(['balanced', 'unhealthy', 'other'], { required_error: 'Please select an option.'}),
  medicalHistory: z.string().optional(),
});

type AssessmentFormValues = z.infer<typeof assessmentSchema>;

const Step1 = () => (
  <div className="space-y-4">
    <FormField
      name="age"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Age (years)</FormLabel>
          <FormControl>
            <Input type="number" placeholder="e.g., 28" {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
    <div className="grid grid-cols-2 gap-4">
      <FormField
        name="weight"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Weight (kg)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="e.g., 65" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        name="height"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Height (cm)</FormLabel>
            <FormControl>
              <Input type="number" placeholder="e.g., 165" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  </div>
);

const Step2 = () => (
    <div className="space-y-6">
        <FormField
        name="cycleRegularity"
        render={({ field }) => (
            <FormItem className="space-y-3">
            <FormLabel>Is your menstrual cycle regular?</FormLabel>
            <FormControl>
                <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="flex flex-col space-y-1"
                >
                <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                    <RadioGroupItem value="regular" />
                    </FormControl>
                    <FormLabel className="font-normal">Regular</FormLabel>
                </FormItem>
                <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                    <RadioGroupItem value="irregular" />
                    </FormControl>
                    <FormLabel className="font-normal">Irregular</FormLabel>
                </FormItem>
                </RadioGroup>
            </FormControl>
            <FormMessage />
            </FormItem>
        )}
        />
        <FormField
            name="exerciseFrequency"
            render={({ field }) => (
                <FormItem>
                <FormLabel>How often do you exercise?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select frequency" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="none">Rarely or never</SelectItem>
                        <SelectItem value="1-2_week">1-2 times a week</SelectItem>
                        <SelectItem value="3-4_week">3-4 times a week</SelectItem>
                        <SelectItem value="5-plus_week">5 or more times a week</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
        <FormField
            name="diet"
            render={({ field }) => (
                <FormItem>
                <FormLabel>How would you describe your diet?</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Select diet type" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="balanced">Balanced</SelectItem>
                        <SelectItem value="unhealthy">Mostly unhealthy</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
        />
    </div>
);

const steps = [
  { id: '01', name: 'Personal Details', component: Step1, fields: ['age', 'weight', 'height'] },
  { id: '02', name: 'Lifestyle', component: Step2, fields: ['cycleRegularity', 'exerciseFrequency', 'diet'] },
];

export default function AssessmentPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);

  const form = useForm<AssessmentFormValues>({
    resolver: zodResolver(assessmentSchema),
    defaultValues: {
      age: '' as any,
      weight: '' as any,
      height: '' as any,
      cycleRegularity: undefined,
      exerciseFrequency: undefined,
      diet: undefined,
      medicalHistory: '',
    },
  });

  // Generate recommendations in the background (non-blocking)
  const generateRecommendationsInBackground = async (assessmentId: string, result: PredictionResult, input: any) => {
    // Run in background - don't block the UI
    (async () => {
      try {
        // Quick check if recommendations already exist
        const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
        if (assessmentDoc.exists() && assessmentDoc.data().recommendations) {
          return; // Already generated
        }
        
        // Generate recommendations (fallback is instant, AI might take time)
        const riskLabel = result.label || 'No Risk';
        const age = input?.age || 25;
        const height = input?.height || 165;
        const weight = input?.weight || 65;
        const medicalHistory = input?.medicalHistory || 'Not provided';
        
        const lifestyleParts = [];
        if (input?.cycleRegularity) lifestyleParts.push(`Cycle: ${input.cycleRegularity}`);
        if (input?.exerciseFrequency) lifestyleParts.push(`Exercise: ${input.exerciseFrequency}`);
        if (input?.diet) lifestyleParts.push(`Diet: ${input.diet}`);
        const lifestyle = lifestyleParts.length > 0 ? lifestyleParts.join(', ') : 'Not provided';
        
        const recommendations = await getPersonalizedRecommendations({
          pcosRiskAssessmentResult: riskLabel,
          age: Number(age),
          height: Number(height),
          weight: Number(weight),
          medicalHistory: medicalHistory,
          lifestyle: lifestyle,
        });
        
        // Store recommendations in Firestore
        await updateDoc(doc(db, 'assessments', assessmentId), {
          recommendations: recommendations,
          recommendationsGeneratedAt: new Date(),
        });
      } catch (e) {
        console.error('Background recommendation generation failed:', e);
        // Silent fail - recommendations can be generated when user views the page
      }
    })();
  };

  async function processForm(data: AssessmentFormValues) {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to complete the assessment.',
        variant: 'destructive',
      });
      router.push('/login');
      return;
    }

    try {
      setLoading(true);

      // Ensure auth token is ready before calling
      if (!user) {
        throw new Error('User not authenticated');
      }
      
      // Get auth token to ensure it's fresh
      await user.getIdToken();

      // Calculate BMI
      const bmi = data.weight / Math.pow(data.height / 100, 2);

      // Prepare request data matching the API interface
      const requestData: PredictionRequest = {
        age: Number(data.age),
        weight: Number(data.weight),
        height: Number(data.height),
        bmi: parseFloat(bmi.toFixed(2)),
        cycleRegularity: data.cycleRegularity,
        exerciseFrequency: data.exerciseFrequency,
        diet: data.diet,
        medicalHistory: data.medicalHistory || undefined,
      };
      
      // Call Firebase Function (has built-in 10-second timeout with instant mock fallback)
      const result = await predictPCOS(requestData);
      
      // Validate result structure
      if (!result?.data) {
        throw new Error('Invalid response from prediction service');
      }
      
      // Get the assessment ID from Firestore (assessment was saved by the Firebase Function)
      let assessmentId: string | null = null;
      if (user) {
        try {
          const { collection, query, where, orderBy, limit, getDocs } = await import('firebase/firestore');
          const { db } = await import('@/lib/firebase');
          const q = query(
            collection(db, "assessments"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            assessmentId = snapshot.docs[0].id;
            
            // Generate recommendations immediately in the background (non-blocking)
            // This ensures they're ready when user views the recommendations page
            generateRecommendationsInBackground(assessmentId, result.data, data);
          }
        } catch (e) {
          console.warn('Failed to get assessment ID:', e);
          // Continue without ID - recommendations can be generated later
        }
      }
      
      // Store result in sessionStorage for the result page
      // Clear any old cached results first
      sessionStorage.removeItem('lastAssessmentResult');
      sessionStorage.setItem('lastAssessmentResult', JSON.stringify({
        ...result.data,
        input: data,
        assessmentId: assessmentId, // Store the assessment ID
        timestamp: Date.now(), // Add timestamp to track when result was generated
      }));

      // Navigate to result page immediately (don't wait for recommendations)
      router.push('/assessment/result');
    } catch (error: any) {
      // Extract error information safely
      let errorMessage = 'Failed to process assessment. Please try again.';
      const errorCode = error?.code || 'unknown';
      
      // Handle specific Firebase Function error codes
      if (errorCode === 'functions/internal') {
        errorMessage = 'Internal server error. Please try again in a moment. If the problem persists, check if Firebase Functions are properly deployed.';
      } else if (errorCode === 'functions/unavailable') {
        errorMessage = 'Service temporarily unavailable. Please check your internet connection and try again.';
      } else if (errorCode === 'functions/deadline-exceeded' || errorMessage.includes('timeout') || errorMessage.includes('timed out')) {
        errorMessage = 'Request timed out. Please try again.';
      } else if (errorCode === 'functions/permission-denied' || errorCode === 'permission-denied') {
        errorMessage = 'Permission denied. Please make sure you are logged in.';
      } else if (errorCode === 'functions/unauthenticated' || errorCode === 'unauthenticated') {
        errorMessage = 'Authentication required. Please log in and try again.';
      } else if (error?.message) {
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }
      
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }

  const nextStep = async () => {
    const fields = steps[currentStep].fields;
    const isValid = await form.trigger(fields as FieldPath<AssessmentFormValues>[], { shouldFocus: true });
    
    if(isValid) {
        if (currentStep < steps.length - 1) {
            setCurrentStep((prev) => prev + 1);
        } else {
            await form.handleSubmit(processForm)();
        }
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };
  
  const progress = ((currentStep + 1) / steps.length) * 100;
  const CurrentStepComponent = steps[currentStep].component;

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <div className="mb-4">
            <p className="text-sm text-primary">Step {steps[currentStep].id} of {steps.length.toString().padStart(2, '0')}</p>
            <CardTitle className="text-2xl">{steps[currentStep].name}</CardTitle>
            <CardDescription>Please fill in the details below.</CardDescription>
          </div>
          <Progress value={progress} className="w-full" />
        </CardHeader>
        <CardContent>
          <FormProvider {...form}>
            <form className="space-y-8" onSubmit={(e) => e.preventDefault()}>
                <CurrentStepComponent />
            </form>
          </FormProvider>
        </CardContent>
        <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={prevStep} disabled={currentStep === 0}>
              Back
            </Button>
            <Button onClick={nextStep} disabled={loading}>
              {loading 
                ? 'Processing...' 
                : currentStep === steps.length - 1 
                  ? 'See Results' 
                  : 'Next'}
            </Button>
        </CardFooter>
      </Card>
      <p className="mt-4 text-center text-xs text-muted-foreground">
        Disclaimer: This assessment is not a diagnosis. Please consult a healthcare professional for clinical advice.
      </p>
    </div>
  );
}
