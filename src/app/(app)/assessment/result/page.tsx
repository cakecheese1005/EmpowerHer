'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { BarChart, Heart, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getAssessmentSummary } from '@/app/actions';
import { Skeleton } from '@/components/ui/skeleton';
import Link from 'next/link';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

function ResultContent() {
  const searchParams = useSearchParams();
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Mocked prediction result
  const riskLabel = 'High Risk';
  const probability = 0.85;

  useEffect(() => {
    async function fetchSummary() {
      try {
        setLoading(true);
        const assessmentData = {
          riskLabel,
          probability,
          featureImportance: { 'BMI': 0.4, 'Cycle(R/I)': 0.3, 'Age': 0.15 },
          medicalHistory: searchParams.get('medicalHistory') || 'Not provided',
          lifestyleFactors: `Cycle: ${searchParams.get('cycleRegularity')}, Exercise: ${searchParams.get('exerciseFrequency')}`
        };
        const result = await getAssessmentSummary({
            assessmentResult: {
                riskLabel: assessmentData.riskLabel,
                probability: assessmentData.probability,
                featureImportance: assessmentData.featureImportance
            },
            medicalHistory: assessmentData.medicalHistory,
            lifestyleFactors: assessmentData.lifestyleFactors
        });
        setSummary(result.summary);
      } catch (e) {
        setError('Failed to generate summary. Please try again.');
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchSummary();
  }, [searchParams]);

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
            <p className="text-2xl font-bold text-destructive">{riskLabel}</p>
            <p className="text-5xl font-extrabold text-destructive mt-2">{(probability * 100).toFixed(0)}%</p>
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
                {summary && <p className="text-muted-foreground">{summary}</p>}
            </CardContent>
        </Card>
      </div>
      
      <Card className="bg-primary/10 border-primary">
        <CardHeader>
            <CardTitle className="flex items-center gap-2"><Heart/> What's Next?</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <p className="text-muted-foreground">Based on your results, we've generated a personalized lifestyle plan to help you improve your health.</p>
            <Button asChild size="lg">
                <Link href="/recommendations">View My Recommendations</Link>
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
