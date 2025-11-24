'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getPersonalizedRecommendations } from '@/app/actions';
import type { PersonalizedRecommendationsOutput } from '@/ai/flows/generate-personalized-recommendations';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dumbbell, Salad, Sparkles, Stethoscope } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { userProfile } from '@/lib/data';

export default function RecommendationsPage() {
  const [recommendations, setRecommendations] = useState<PersonalizedRecommendationsOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setLoading(true);
        const result = await getPersonalizedRecommendations({
          pcosRiskAssessmentResult: 'High',
          age: userProfile.age,
          height: userProfile.height,
          weight: userProfile.weight,
          medicalHistory: userProfile.medicalHistory,
          lifestyle: userProfile.lifestyle,
        });
        setRecommendations(result);
      } catch (e) {
        setError('Failed to generate recommendations. Please try again.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchRecommendations();
  }, []);

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

  return (
    <div className="grid gap-8 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Personalized Plan</h1>
        <p className="text-muted-foreground">A tailored lifestyle plan to help you achieve your health goals.</p>
      </div>

       <Alert>
        <Stethoscope className="h-4 w-4" />
        <AlertTitle>Professional Advice Recommended</AlertTitle>
        <AlertDescription>
          These recommendations are AI-generated and should not replace professional medical advice. Always consult your doctor before making significant lifestyle changes.
        </AlertDescription>
      </Alert>

      {error && <p className="text-destructive">{error}</p>}

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
            <Button>Go to Dashboard</Button>
        </CardContent>
       </Card>

    </div>
  );
}
