'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart, Heart, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAssessmentSummary, getPersonalizedRecommendations } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { PredictionResult } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { doc, updateDoc, getDoc } from 'firebase/firestore';

function ResultContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [input, setInput] = useState<any>(null);
  const [assessmentId, setAssessmentId] = useState<string | null>(null);
  const [recommendationsGenerated, setRecommendationsGenerated] = useState(false);

  useEffect(() => {
    // Check if assessmentId is in URL params (for viewing old assessments)
    const idFromUrl = searchParams.get('id');
    
    if (idFromUrl && user) {
      // Load assessment from Firestore
      loadAssessmentFromFirestore(idFromUrl);
    } else {
      // Get result from sessionStorage (most recent assessment)
      const storedResult = sessionStorage.getItem('lastAssessmentResult');
      
      if (!storedResult) {
        setError('No assessment result found. Please complete an assessment first.');
        setLoading(false);
        return;
      }

      try {
        const data = JSON.parse(storedResult);
        // Show results immediately - don't wait for summary or recommendations
        setResult(data);
        setInput(data.input);
        setAssessmentId(data.assessmentId || null);
        setLoading(false); // Stop loading immediately so results show
        
        // Get risk label and probability
        const riskLabel = data.label || 'No Risk';
        // Get the correct probability based on the label
        let probability = 0;
        if (riskLabel === 'High' && data.probabilities?.High) {
          probability = data.probabilities.High;
        } else if (riskLabel === 'Early' && data.probabilities?.Early) {
          probability = data.probabilities.Early;
        } else if (riskLabel === 'No Risk' && data.probabilities?.NoRisk) {
          probability = data.probabilities.NoRisk;
        }
        // Fallback: use the highest probability available
        if (probability === 0) {
          const probs = data.probabilities || {};
          probability = Math.max(probs.High || 0, probs.Early || 0, probs.NoRisk || 0);
        }
        
        // Generate summary in background (non-blocking)
        fetchSummary(riskLabel, probability, data.topContributors || [], data.input?.medicalHistory);
        
        // Generate and store recommendations in background (non-blocking)
        if (data.assessmentId && user) {
          generateAndStoreRecommendations(data.assessmentId, data, data.input);
        } else {
          // Mark as generated so button is enabled even without ID
          setRecommendationsGenerated(true);
        }
      } catch (e) {
        setError('Failed to load assessment result.');
        setLoading(false);
      }
    }
  }, [searchParams, user]);

  const loadAssessmentFromFirestore = async (id: string) => {
    try {
      setLoading(true);
      const assessmentDoc = await getDoc(doc(db, 'assessments', id));
      
      if (!assessmentDoc.exists()) {
        setError('Assessment not found.');
        setLoading(false);
        return;
      }
      
      const data = assessmentDoc.data();
      if (data.userId !== user?.uid) {
        setError('You do not have access to this assessment.');
        setLoading(false);
        return;
      }
      
      // Show results immediately
      setResult(data.result as PredictionResult);
      setInput(data.input);
      setAssessmentId(id);
      setLoading(false); // Stop loading immediately
      
      // Generate summary in background (non-blocking)
      const riskLabel = data.result?.label || 'No Risk';
      let probability = 0;
      if (riskLabel === 'High' && data.result?.probabilities?.High) {
        probability = data.result.probabilities.High;
      } else if (riskLabel === 'Early' && data.result?.probabilities?.Early) {
        probability = data.result.probabilities.Early;
      } else if (riskLabel === 'No Risk' && data.result?.probabilities?.NoRisk) {
        probability = data.result.probabilities.NoRisk;
      }
      if (probability === 0) {
        const probs = data.result?.probabilities || {};
        probability = Math.max(probs.High || 0, probs.Early || 0, probs.NoRisk || 0);
      }
      
      fetchSummary(riskLabel, probability, data.result?.topContributors || [], data.input?.medicalHistory);
      
      // Check if recommendations already exist, if not generate them in background
      if (!data.recommendations) {
        generateAndStoreRecommendations(id, data.result, data.input);
      } else {
        setRecommendationsGenerated(true);
      }
    } catch (e) {
      setError('Failed to load assessment.');
      setLoading(false);
    }
  };

  const generateAndStoreRecommendations = async (id: string, result: PredictionResult, input: any) => {
    // Generate recommendations in the background (non-blocking)
    // Don't await - let it run asynchronously
    (async () => {
      try {
        // Check if recommendations already exist
        const assessmentDoc = await getDoc(doc(db, 'assessments', id));
        if (assessmentDoc.exists() && assessmentDoc.data().recommendations) {
          setRecommendationsGenerated(true);
          return;
        }
        
        // Generate recommendations (this uses fallback which is instant)
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
        await updateDoc(doc(db, 'assessments', id), {
          recommendations: recommendations,
          recommendationsGeneratedAt: new Date(),
        });
        
        setRecommendationsGenerated(true);
      } catch (e) {
        console.error('Failed to generate recommendations:', e);
        // Still mark as generated so user can try to view (will show error if not ready)
        setRecommendationsGenerated(true);
      }
    })();
  };

  async function fetchSummary(riskLabel: string, probability: number, contributors: any[], medicalHistory?: string) {
    // Generate summary in background - don't block UI
    try {
      // Create feature importance map from contributors
      const featureImportance: Record<string, number> = {};
      contributors.forEach((c: any) => {
        featureImportance[c.feature] = c.contribution || 0;
      });

      const lifestyleFactors = `Cycle: ${input?.cycleRegularity || 'N/A'}, Exercise: ${input?.exerciseFrequency || 'N/A'}`;
      
      const result = await getAssessmentSummary({
        assessmentResult: {
          riskLabel,
          probability,
          featureImportance,
        },
        medicalHistory: medicalHistory || 'Not provided',
        lifestyleFactors,
      });
      setSummary(result.summary);
    } catch (e) {
      console.error('Failed to generate summary:', e);
      // Don't show error to user - summary is optional
      // Set a simple fallback summary
      setSummary(`Based on your assessment, you have a ${riskLabel} risk level (${(probability * 100).toFixed(0)}% probability). The key factors influencing this assessment include ${contributors.slice(0, 3).map((c: any) => c.feature).join(', ')}. Please consult with a healthcare professional for a formal diagnosis and personalized treatment plan.`);
    }
  }

  if (!result) {
    return (
      <div className="max-w-4xl mx-auto grid gap-8">
        <Alert variant="destructive">
          <AlertTitle>No Results Found</AlertTitle>
          <AlertDescription>
            {error || 'Please complete an assessment first.'}
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/assessment">Take Assessment</Link>
        </Button>
      </div>
    );
  }

  const riskLabel = result.label || 'No Risk';
  // Get the correct probability based on the label
  let probability = 0;
  if (riskLabel === 'High' && result.probabilities?.High) {
    probability = result.probabilities.High;
  } else if (riskLabel === 'Early' && result.probabilities?.Early) {
    probability = result.probabilities.Early;
  } else if (riskLabel === 'No Risk' && result.probabilities?.NoRisk) {
    probability = result.probabilities.NoRisk;
  }
  // Fallback: use the highest probability available
  if (probability === 0) {
    const probs = result.probabilities || {};
    probability = Math.max(probs.High || 0, probs.Early || 0, probs.NoRisk || 0);
  }
  const getRiskColor = (label: string) => {
    if (label === 'High') return 'text-destructive';
    if (label === 'Early') return 'text-yellow-500';
    return 'text-green-500';
  };

  return (
    <div className="max-w-4xl mx-auto grid gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Assessment Result</h1>
        <p className="text-muted-foreground">Here is the analysis of the information you provided.</p>
      </div>

      <Alert variant="destructive">
        <Stethoscope className="h-4 w-4" />
        <AlertTitle>Not a Medical Diagnosis</AlertTitle>
        <AlertDescription>
          This result is based on an AI model and is for informational purposes only. Please consult a healthcare professional for a formal diagnosis.
        </AlertDescription>
      </Alert>

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Overall Risk</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className={`text-2xl font-bold ${getRiskColor(riskLabel)}`}>{riskLabel}</p>
            <p className={`text-5xl font-extrabold mt-2 ${getRiskColor(riskLabel)}`}>
              {(probability * 100).toFixed(0)}%
            </p>
            <p className="text-muted-foreground">Probability</p>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart /> Summary & Key Factors</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            )}
            {error && <p className="text-destructive">{error}</p>}
            {summary && <p className="text-muted-foreground whitespace-pre-line">{summary}</p>}
            
            {result.topContributors && result.topContributors.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-sm font-semibold">Top Contributing Factors:</p>
                <ul className="space-y-2">
                  {result.topContributors.map((contributor, idx) => (
                    <li key={idx} className="text-sm">
                      <span className="font-medium">{contributor.feature}:</span>{' '}
                      <span className="text-muted-foreground">{contributor.explanation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card className="bg-primary/10 border-primary">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Heart/> What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <p className="text-muted-foreground">
            Based on your results, we've generated a personalized lifestyle plan to help you improve your health.
            {!recommendationsGenerated && assessmentId && (
              <span className="block text-sm mt-1 text-muted-foreground/80">
                Recommendations are being prepared in the background...
              </span>
            )}
          </p>
          <Button asChild size="lg">
            <Link href={assessmentId ? `/recommendations?id=${assessmentId}` : '/recommendations'}>
              View My Recommendations
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}


export default function ResultPage() {
    return (
        <Suspense fallback={<p>Loading results...</p>}>
            <ResultContent />
        </Suspense>
    )
}
