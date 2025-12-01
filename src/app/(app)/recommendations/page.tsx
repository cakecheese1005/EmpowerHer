'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PersonalizedRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dumbbell, Salad, Sparkles, Stethoscope, Calendar } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, getDocs, doc, getDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { PredictionResult } from '@/lib/api';
import { getPersonalizedRecommendations } from '@/app/actions';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function RecommendationsPage() {
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [assessmentData, setAssessmentData] = useState<{ result: PredictionResult; input: any; id: string; createdAt?: Timestamp } | null>(null);
  const [availableAssessments, setAvailableAssessments] = useState<Array<{ id: string; label: string; createdAt: Timestamp }>>([]);
  const [selectedAssessmentId, setSelectedAssessmentId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading) {
      const assessmentId = searchParams.get('id');
      if (assessmentId) {
        setSelectedAssessmentId(assessmentId);
        loadRecommendationsForAssessment(assessmentId);
      } else {
        loadAssessmentData();
      }
      loadAvailableAssessments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, authLoading, searchParams]);

  const loadAvailableAssessments = async () => {
    if (!user) return;
    
    try {
      const q = query(
        collection(db, "assessments"),
        where("userId", "==", user.uid),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      const snapshot = await getDocs(q);
      const assessments = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          label: `${data.result?.label || 'Unknown'} - ${data.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown date'}`,
          createdAt: data.createdAt as Timestamp,
        };
      });
      setAvailableAssessments(assessments);
    } catch (e) {
      console.error('Failed to load assessments:', e);
    }
  };

  const loadRecommendationsForAssessment = async (assessmentId: string) => {
    if (!user) return;
    
    try {
      setLoading(true);
      const assessmentDoc = await getDoc(doc(db, 'assessments', assessmentId));
      
      if (!assessmentDoc.exists()) {
        setError('Assessment not found.');
        setLoading(false);
        return;
      }
      
      const data = assessmentDoc.data();
      if (data.userId !== user.uid) {
        setError('You do not have access to this assessment.');
        setLoading(false);
        return;
      }
      
      setAssessmentData({
        result: data.result as PredictionResult,
        input: data.input,
        id: assessmentId,
        createdAt: data.createdAt as Timestamp,
      });
      
      // Load recommendations if they exist, otherwise generate them
      if (data.recommendations) {
        setRecommendations(data.recommendations as PersonalizedRecommendationsOutput);
        setLoading(false);
      } else {
        // Generate recommendations on the fly (fallback is instant, non-blocking)
        generateRecommendationsForAssessment(assessmentId, data.result as PredictionResult, data.input);
        // Don't await - let it run in background, will update state when done
      }
    } catch (e) {
      setError('Failed to load recommendations.');
      console.error(e);
      setLoading(false);
    }
  };

  const generateRecommendationsForAssessment = async (assessmentId: string, result: PredictionResult, input: any) => {
    try {
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
      
      // Set recommendations in state immediately (show to user)
      setRecommendations(recommendations);
      setLoading(false);
      
      // Store recommendations in Firestore in background (non-blocking)
      updateDoc(doc(db, 'assessments', assessmentId), {
        recommendations: recommendations,
        recommendationsGeneratedAt: new Date(),
      }).catch((e) => {
        console.error('Failed to save recommendations to Firestore:', e);
        // Don't show error - recommendations are already displayed
      });
    } catch (e) {
      console.error('Failed to generate recommendations:', e);
      setError('Failed to generate recommendations. Please try again.');
      setLoading(false);
    }
  };

  const loadAssessmentData = async () => {
    try {
      setLoading(true);
      
      // First, try to get from sessionStorage (most recent assessment)
      let assessmentId: string | null = null;
      let assessmentResult: PredictionResult | null = null;
      let assessmentInput: any = null;
      
      if (typeof window !== 'undefined') {
        const storedResult = sessionStorage.getItem('lastAssessmentResult');
        if (storedResult) {
          try {
            const data = JSON.parse(storedResult);
            assessmentResult = data;
            assessmentInput = data.input;
            assessmentId = data.assessmentId || null;
          } catch (e) {
            console.warn('Failed to parse sessionStorage data:', e);
          }
        }
      }

      // If not in sessionStorage, try to get from Firestore
      if (!assessmentResult && user) {
        try {
          const q = query(
            collection(db, "assessments"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            const doc = snapshot.docs[0];
            const docData = doc.data();
            assessmentResult = docData.result as PredictionResult;
            assessmentInput = docData.input;
            assessmentId = doc.id;
          }
        } catch (firestoreError: any) {
          console.warn('Failed to load from Firestore:', firestoreError);
        }
      }

      if (!assessmentResult) {
        setError('No assessment found. Please complete an assessment first to get personalized recommendations.');
        setLoading(false);
        return;
      }

      // If we have assessment data but no ID, try to get ID from Firestore
      if (assessmentResult && !assessmentId && user) {
        try {
          const q = query(
            collection(db, "assessments"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc"),
            limit(1)
          );
          const snapshot = await getDocs(q);
          if (!snapshot.empty) {
            assessmentId = snapshot.docs[0].id;
          }
        } catch (e) {
          console.warn('Failed to get assessment ID from Firestore:', e);
        }
      }

      // Store assessment data for display
      setAssessmentData({ 
        result: assessmentResult, 
        input: assessmentInput,
        id: assessmentId || 'unknown',
      });

      // Load or generate recommendations
      if (assessmentId && assessmentId !== 'unknown') {
        await loadRecommendationsForAssessment(assessmentId);
      } else if (assessmentResult && assessmentInput) {
        // Generate recommendations on the fly if we have the data but no ID
        // Don't save to Firestore since we don't have an ID
        try {
          const riskLabel = assessmentResult.label || 'No Risk';
          const age = assessmentInput?.age || 25;
          const height = assessmentInput?.height || 165;
          const weight = assessmentInput?.weight || 65;
          const medicalHistory = assessmentInput?.medicalHistory || 'Not provided';
          
          const lifestyleParts = [];
          if (assessmentInput?.cycleRegularity) lifestyleParts.push(`Cycle: ${assessmentInput.cycleRegularity}`);
          if (assessmentInput?.exerciseFrequency) lifestyleParts.push(`Exercise: ${assessmentInput.exerciseFrequency}`);
          if (assessmentInput?.diet) lifestyleParts.push(`Diet: ${assessmentInput.diet}`);
          const lifestyle = lifestyleParts.length > 0 ? lifestyleParts.join(', ') : 'Not provided';
          
          const recommendations = await getPersonalizedRecommendations({
            pcosRiskAssessmentResult: riskLabel,
            age: Number(age),
            height: Number(height),
            weight: Number(weight),
            medicalHistory: medicalHistory,
            lifestyle: lifestyle,
          });
          
          setRecommendations(recommendations);
        } catch (e) {
          console.error('Failed to generate recommendations:', e);
          setError('Failed to generate recommendations. Please try again.');
        } finally {
          setLoading(false);
        }
      } else {
        setError('Assessment ID not found. Please complete a new assessment.');
        setLoading(false);
      }
    } catch (e) {
      setError('Failed to load recommendations. Please try again.');
      console.error(e);
      setLoading(false);
    }
  };

  const handleAssessmentChange = (newAssessmentId: string) => {
    setSelectedAssessmentId(newAssessmentId);
    router.push(`/recommendations?id=${newAssessmentId}`);
  };

  const RecommendationCard = ({ icon, title, content }: { icon: React.ReactNode, title: string, content: string | undefined }) => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
            <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
            </div>
        ) : (
            <p className="text-muted-foreground whitespace-pre-line">{content}</p>
        )}
      </CardContent>
    </Card>
  );

  if (error && !assessmentData) {
    return (
      <div className="grid gap-8 max-w-4xl mx-auto">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Your Personalized Plan</h1>
          <p className="text-muted-foreground">A tailored lifestyle plan to help you achieve your health goals.</p>
        </div>
        <Alert variant="destructive">
          <Stethoscope className="h-4 w-4" />
          <AlertTitle>Assessment Required</AlertTitle>
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
        <Button asChild>
          <Link href="/assessment">Take Assessment</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="grid gap-8 max-w-4xl mx-auto">
      <div>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Your Personalized Plan</h1>
            <p className="text-muted-foreground">
              A tailored lifestyle plan based on your{' '}
              {assessmentData?.result?.label ? (
                <span className="font-semibold text-primary">{assessmentData.result.label}</span>
              ) : (
                'latest'
              )}{' '}
              risk assessment to help you achieve your health goals.
            </p>
          </div>
          {availableAssessments.length > 1 && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedAssessmentId || assessmentData?.id || ''} onValueChange={handleAssessmentChange}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue placeholder="Select assessment" />
                </SelectTrigger>
                <SelectContent>
                  {availableAssessments.map((assessment) => (
                    <SelectItem key={assessment.id} value={assessment.id}>
                      {assessment.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {assessmentData?.createdAt && (
          <p className="text-sm text-muted-foreground mt-2">
            Assessment date: {assessmentData.createdAt.toDate().toLocaleDateString()}
          </p>
        )}
      </div>

       <Alert>
        <Stethoscope className="h-4 w-4" />
        <AlertTitle>Professional Advice Recommended</AlertTitle>
        <AlertDescription>
          These recommendations are AI-generated and should not replace professional medical advice. Always consult your doctor before making significant lifestyle changes.
        </AlertDescription>
      </Alert>

      {error && <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>}

      <div className="grid md:grid-cols-2 gap-6">
        <RecommendationCard 
            icon={<Salad className="text-green-500"/>} 
            title="Diet Recommendations" 
            content={recommendations?.dietRecommendations} 
        />
        <RecommendationCard 
            icon={<Dumbbell className="text-blue-500"/>} 
            title="Exercise Suggestions" 
            content={recommendations?.exerciseSuggestions}
        />
        <RecommendationCard 
            icon={<Sparkles className="text-yellow-500" />} 
            title="Stress Management" 
            content={recommendations?.stressManagementTechniques}
        />
        <RecommendationCard 
            icon={<Stethoscope className="text-red-500"/>} 
            title="Follow-up Actions" 
            content={recommendations?.followUpSuggestions}
        />
      </div>
      
       <Card>
        <CardHeader>
            <CardTitle>Track Your Progress</CardTitle>
            <CardDescription>Consistency is key. Remember to log your activities and cycles to monitor your progress.</CardDescription>
        </CardHeader>
        <CardContent>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
        </CardContent>
       </Card>

    </div>
  );
}
