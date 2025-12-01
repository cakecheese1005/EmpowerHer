'use client';

import { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { BarChart, Calendar, FilePlus2, HeartPulse, LineChart, Target } from "lucide-react";
import Link from 'next/link';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartConfig } from "@/components/ui/chart";
import { Bar, BarChart as RechartsBarChart, CartesianGrid, XAxis, YAxis, ResponsiveContainer, Line, LineChart as RechartsLineChart } from "recharts";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, orderBy, limit, getDocs, Timestamp } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { CycleLogDialog } from "@/components/cycle-log-dialog";

const riskHistoryData = [
  { month: "Jan", risk: 0.3 },
  { month: "Feb", risk: 0.4 },
  { month: "Mar", risk: 0.35 },
  { month: "Apr", risk: 0.5 },
  { month: "May", risk: 0.45 },
  { month: "Jun", risk: 0.6 },
];

const weightHistoryData = [
  { month: "Jan", weight: 72 },
  { month: "Feb", weight: 71 },
  { month: "Mar", weight: 71.5 },
  { month: "Apr", weight: 70 },
  { month: "May", weight: 69 },
  { month: "Jun", weight: 68.5 },
];

const chartConfig: ChartConfig = {
  risk: {
    label: "PCOS Risk",
    color: "hsl(var(--primary))",
  },
  weight: {
    label: "Weight (kg)",
    color: "hsl(var(--accent))",
  },
};

interface Assessment {
  id: string;
  result?: {
    label?: string;
    probabilities?: {
      High?: number;
      Early?: number;
      NoRisk?: number;
    };
    topContributors?: Array<{
      feature: string;
      contribution: number;
    }>;
  };
  input?: {
    weight?: number;
    cycleRegularity?: string;
    exerciseFrequency?: string;
  };
  createdAt?: Timestamp;
}

interface CycleLog {
  startDate: string;
  loggedAt: string;
  userId: string;
}

export default function DashboardPage() {
  const { user, loading: authLoading } = useAuth();
  const [lastAssessment, setLastAssessment] = useState<Assessment | null>(null);
  const [assessmentHistory, setAssessmentHistory] = useState<Assessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [cycleDialogOpen, setCycleDialogOpen] = useState(false);
  const [cycleLogs, setCycleLogs] = useState<CycleLog[]>([]);

  // Load cycle logs from localStorage
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      try {
        const logs = JSON.parse(localStorage.getItem('cycleLogs') || '[]') as CycleLog[];
        // Filter to current user's logs and sort by date (newest first)
        const userLogs = logs
          .filter(log => log.userId === user.uid)
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setCycleLogs(userLogs);
      } catch (e) {
        console.warn('Failed to load cycle logs:', e);
      }
    }
  }, [user]);

  // Refresh cycle logs when dialog closes (in case a new one was added)
  useEffect(() => {
    if (!cycleDialogOpen && user && typeof window !== 'undefined') {
      try {
        const logs = JSON.parse(localStorage.getItem('cycleLogs') || '[]') as CycleLog[];
        const userLogs = logs
          .filter(log => log.userId === user.uid)
          .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
        setCycleLogs(userLogs);
      } catch (e) {
        // Ignore errors
      }
    }
  }, [cycleDialogOpen, user]);

  useEffect(() => {
    if (user && !authLoading) {
      loadDashboardData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [user, authLoading]);

  // Refresh dashboard when page becomes visible (e.g., returning from assessment)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && user && !authLoading) {
        loadDashboardData();
      }
    };
    
    const handleFocus = () => {
      if (user && !authLoading) {
        loadDashboardData();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [user, authLoading]);

  const loadDashboardData = async () => {
    if (!user) return;
    
    // First, try to get from sessionStorage for instant display
    if (typeof window !== 'undefined') {
      const storedResult = sessionStorage.getItem('lastAssessmentResult');
      if (storedResult) {
        try {
          const data = JSON.parse(storedResult);
          // Create a Timestamp from the timestamp if available
          let createdAt: Timestamp | undefined;
          if (data.timestamp) {
            const date = new Date(data.timestamp);
            createdAt = Timestamp.fromDate(date);
          }
          
          setLastAssessment({
            id: data.assessmentId || 'temp',
            result: {
              label: data.label,
              probabilities: data.probabilities,
              topContributors: data.topContributors,
            },
            input: data.input,
            createdAt: createdAt,
          } as Assessment);
          setLoading(false); // Show immediately
        } catch (e) {
          console.warn('Failed to parse sessionStorage:', e);
        }
      }
    }
    
    // Then load from Firestore in background for accurate data
    // Use try-catch to silently handle permission errors and index errors
    (async () => {
      try {
        // First try with index (userId + createdAt)
        const q = query(
          collection(db, "assessments"),
          where("userId", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(20) // Get last 20 assessments for better trend data
        );
        const snapshot = await getDocs(q);
        if (!snapshot.empty) {
          const assessments = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as Assessment[];
          
          // Update with latest from Firestore
          setLastAssessment(assessments[0]);
          setAssessmentHistory(assessments);
        }
      } catch (error: any) {
        // If index error or failed-precondition, try without orderBy (fallback)
        if (error.code === 'failed-precondition' || error.message?.includes('index')) {
          try {
            const qSimple = query(
              collection(db, "assessments"),
              where("userId", "==", user.uid),
              limit(50) // Get more, then sort and limit client-side
            );
            const snapshot = await getDocs(qSimple);
            if (!snapshot.empty) {
              const assessments = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data(),
                createdAt: doc.data().createdAt instanceof Timestamp 
                  ? doc.data().createdAt 
                  : Timestamp.fromDate(doc.data().createdAt?.toDate?.() || new Date()),
              })) as Assessment[];
              
              // Sort by createdAt manually (newest first)
              assessments.sort((a, b) => {
                const dateA = a.createdAt?.toMillis() || 0;
                const dateB = b.createdAt?.toMillis() || 0;
                return dateB - dateA;
              });
              
              // Take first 20
              const recentAssessments = assessments.slice(0, 20);
              setLastAssessment(recentAssessments[0]);
              setAssessmentHistory(recentAssessments);
            }
          } catch (e) {
            // Silently fail - sessionStorage data is already shown
          }
        }
        // Silently handle all other errors - permission-denied, offline, etc.
      }
    })();
  };

  const formatAssessmentDate = (timestamp?: Timestamp) => {
    if (!timestamp) {
      return 'No assessment yet';
    }
    const date = timestamp.toDate();
    return date.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const getRiskLabel = () => {
    if (lastAssessment?.result?.label) {
      return lastAssessment.result.label;
    }
    return 'No assessment';
  };

  const getRiskProbability = () => {
    if (!lastAssessment?.result?.probabilities) return '0';
    const label = lastAssessment.result.label;
    if (label === 'High' && lastAssessment.result.probabilities.High) {
      return (lastAssessment.result.probabilities.High * 100).toFixed(0);
    } else if (label === 'Early' && lastAssessment.result.probabilities.Early) {
      return (lastAssessment.result.probabilities.Early * 100).toFixed(0);
    } else if (label === 'No Risk' && lastAssessment.result.probabilities.NoRisk) {
      return (lastAssessment.result.probabilities.NoRisk * 100).toFixed(0);
    }
    // Fallback to highest probability
    const probs = lastAssessment.result.probabilities;
    const maxProb = Math.max(probs.High || 0, probs.Early || 0, probs.NoRisk || 0);
    return (maxProb * 100).toFixed(0);
  };

  // Generate real trend data from assessment history
  const getRiskHistoryData = () => {
    // Combine sessionStorage data with Firestore history
    let allAssessments = [...assessmentHistory];
    
    // Add latest from sessionStorage if not already in history
    if (lastAssessment && lastAssessment.id !== 'temp' && !allAssessments.find(a => a.id === lastAssessment.id)) {
      allAssessments = [lastAssessment, ...allAssessments];
    } else if (lastAssessment && lastAssessment.id === 'temp') {
      // If only sessionStorage data, use it
      allAssessments = [lastAssessment];
    }
    
    if (allAssessments.length === 0) {
      return riskHistoryData; // Fallback to mock data
    }
    
    // Sort by date (newest first), then reverse to show chronological order
    const sortedAssessments = [...allAssessments]
      .filter(a => a.createdAt) // Only include assessments with dates
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate().getTime() || 0;
        const dateB = b.createdAt?.toDate().getTime() || 0;
        return dateB - dateA; // Newest first
      })
      .slice(0, 10) // Get last 10 assessments
      .reverse(); // Reverse to show oldest to newest
    
    if (sortedAssessments.length === 0) {
      return riskHistoryData; // Fallback if no valid dates
    }
    
    return sortedAssessments.map((assessment) => {
      const date = assessment.createdAt?.toDate();
      const month = date 
        ? `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`
        : 'Unknown';
      
      // Calculate overall risk probability (weighted by label)
      let risk = 0;
      if (assessment.result?.probabilities) {
        const probs = assessment.result.probabilities;
        // Weighted risk: High risk contributes more to overall risk score
        risk = (probs.High || 0) * 1.0 + (probs.Early || 0) * 0.5 + (probs.NoRisk || 0) * 0.1;
        // Normalize to 0-1 range
        risk = Math.min(1, risk);
      }
      
      return { month, risk, date: date?.toISOString() || '' };
    });
  };

  // Generate real weight history data
  const getWeightHistoryData = () => {
    // Combine sessionStorage data with Firestore history
    let allAssessments = [...assessmentHistory];
    
    // Add latest from sessionStorage if not already in history
    if (lastAssessment && lastAssessment.id !== 'temp' && !allAssessments.find(a => a.id === lastAssessment.id)) {
      allAssessments = [lastAssessment, ...allAssessments];
    } else if (lastAssessment && lastAssessment.id === 'temp') {
      // If only sessionStorage data, use it
      allAssessments = [lastAssessment];
    }
    
    if (allAssessments.length === 0) {
      return weightHistoryData; // Fallback to mock data
    }
    
    // Sort by date (newest first), then reverse to show chronological order
    const sortedAssessments = [...allAssessments]
      .filter(a => a.createdAt && a.input?.weight) // Only include assessments with dates and weight
      .sort((a, b) => {
        const dateA = a.createdAt?.toDate().getTime() || 0;
        const dateB = b.createdAt?.toDate().getTime() || 0;
        return dateB - dateA; // Newest first
      })
      .slice(0, 10) // Get last 10 assessments
      .reverse(); // Reverse to show oldest to newest
    
    if (sortedAssessments.length === 0) {
      return weightHistoryData; // Fallback if no valid data
    }
    
    return sortedAssessments.map((assessment) => {
      const date = assessment.createdAt?.toDate();
      const month = date 
        ? `${date.toLocaleDateString('en-US', { month: 'short' })} ${date.getDate()}`
        : 'Unknown';
      const weight = assessment.input?.weight || 0;
      
      return { month, weight, date: date?.toISOString() || '' };
    });
  };

  const getRiskColor = (label?: string) => {
    if (!label || label === 'No assessment') return 'text-muted-foreground';
    if (label === 'High') return 'text-destructive';
    if (label === 'Early') return 'text-yellow-500';
    return 'text-green-500';
  };

  if (authLoading || loading) {
    return (
      <div className="grid gap-8">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
          <Skeleton className="h-48" />
        </div>
      </div>
    );
  }

  const userName = user?.displayName || user?.email?.split('@')[0] || 'User';

  return (
    <div className="grid gap-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back, {userName}! Here's your health summary.</p>
        </div>
        <Button asChild>
          <Link href="/assessment"><FilePlus2 className="mr-2"/> New Assessment</Link>
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/80 to-primary text-primary-foreground">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-foreground/90">
                <Target /> Current PCOS Risk
            </CardTitle>
            <CardDescription className="text-primary-foreground/80">
              {lastAssessment 
                ? `Based on your last assessment on ${formatAssessmentDate(lastAssessment.createdAt)}`
                : 'Complete an assessment to see your risk level'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {lastAssessment ? (
              <>
                <p className="text-4xl font-bold">{getRiskLabel()}</p>
                <p className="text-lg">{getRiskProbability()}% Probability</p>
              </>
            ) : (
              <>
                <p className="text-2xl font-bold">No Assessment Yet</p>
                <p className="text-sm mt-2">Take your first assessment to get started</p>
              </>
            )}
          </CardContent>
           <CardFooter>
            <p className="text-sm text-primary-foreground/80">Consult a doctor for a formal diagnosis.</p>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HeartPulse/> Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <Button 
              variant="outline" 
              className="flex-col h-24"
              onClick={() => setCycleDialogOpen(true)}
            >
              <Calendar className="mb-2"/>
              Log Cycle
            </Button>
            <Button variant="outline" className="flex-col h-24" asChild>
              <Link href="/recommendations">
                <HeartPulse className="mb-2"/>
                My Plan
              </Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Calendar/> Cycle History</CardTitle>
            <CardDescription>Your recent menstrual cycle start dates</CardDescription>
          </CardHeader>
          <CardContent>
            {cycleLogs.length > 0 ? (
              <div className="space-y-3">
                {cycleLogs.slice(0, 5).map((log, idx) => {
                  const date = new Date(log.startDate);
                  const formattedDate = date.toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  });
                  
                  // Calculate days since this cycle started
                  const daysSince = Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={idx} className="flex items-center justify-between p-2 rounded-md bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary" />
                        <div>
                          <p className="text-sm font-medium">{formattedDate}</p>
                          <p className="text-xs text-muted-foreground">
                            {daysSince === 0 
                              ? 'Today' 
                              : daysSince === 1 
                              ? '1 day ago' 
                              : `${daysSince} days ago`}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
                {cycleLogs.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    Showing 5 of {cycleLogs.length} logged cycles
                  </p>
                )}
              </div>
            ) : (
              <div className="text-center py-6">
                <Calendar className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-3">No cycle logs yet</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setCycleDialogOpen(true)}
                >
                  Log Your First Cycle
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
        
        <CycleLogDialog 
          open={cycleDialogOpen} 
          onOpenChange={setCycleDialogOpen}
          onCycleLogged={() => {
            // Reload cycle logs when a new one is logged
            if (user && typeof window !== 'undefined') {
              try {
                const logs = JSON.parse(localStorage.getItem('cycleLogs') || '[]') as CycleLog[];
                const userLogs = logs
                  .filter(log => log.userId === user.uid)
                  .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
                setCycleLogs(userLogs);
              } catch (e) {
                // Ignore errors
              }
            }
          }}
        />

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart/> Key Risk Factors</CardTitle>
            <CardDescription>From your latest assessment.</CardDescription>
          </CardHeader>
          <CardContent>
            {lastAssessment?.result?.topContributors && lastAssessment.result.topContributors.length > 0 ? (
              <ul className="space-y-2 text-sm">
                {lastAssessment.result.topContributors.slice(0, 3).map((contributor, idx) => (
                  <li key={idx} className="flex justify-between">
                    <span>{contributor.feature}</span>
                    <span className="font-semibold">
                      {(contributor.contribution * 100).toFixed(0)}%
                    </span>
                  </li>
                ))}
              </ul>
            ) : lastAssessment ? (
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span>Cycle Regularity</span>
                  <span className="font-semibold">
                    {lastAssessment.input?.cycleRegularity === 'irregular' ? 'Irregular' : 'Regular'}
                  </span>
                </li>
                <li className="flex justify-between">
                  <span>Exercise Frequency</span>
                  <span className="font-semibold">
                    {lastAssessment.input?.exerciseFrequency?.replace('_', ' ') || 'N/A'}
                  </span>
                </li>
                {lastAssessment.input?.weight && (
                  <li className="flex justify-between">
                    <span>Weight</span>
                    <span className="font-semibold">{lastAssessment.input.weight} kg</span>
                  </li>
                )}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground">Complete an assessment to see your risk factors.</p>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><LineChart/> Risk Trend</CardTitle>
            <CardDescription>
              {assessmentHistory.length > 0 || lastAssessment
                ? `Your PCOS risk probability over ${Math.max(assessmentHistory.length, lastAssessment ? 1 : 0)} assessment${Math.max(assessmentHistory.length, lastAssessment ? 1 : 0) > 1 ? 's' : ''}.`
                : 'Your PCOS risk probability over time. Complete assessments to see your trend.'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const riskData = getRiskHistoryData();
              return riskData.length > 0 ? (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <ResponsiveContainer>
                    <RechartsLineChart data={riskData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={[0, 1]} />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: any) => [`${(value * 100).toFixed(1)}%`, 'Risk Probability']}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="risk" 
                        stroke="var(--color-risk)" 
                        strokeWidth={2} 
                        dot={{r: 4, fill: "var(--color-risk)"}}
                        activeDot={{r: 6}}
                      />
                    </RechartsLineChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Complete assessments to see your risk trend</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><BarChart/> Weight Journey</CardTitle>
             <CardDescription>
               {(() => {
                 const weightData = getWeightHistoryData();
                 const count = weightData.length > 0 && weightData[0].weight > 0 ? weightData.length : assessmentHistory.length;
                 return count > 0
                   ? `Your weight changes from ${count} assessment${count > 1 ? 's' : ''}.`
                   : 'Your weight changes over time. Complete assessments to track your weight.';
               })()}
             </CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const weightData = getWeightHistoryData();
              return weightData.length > 0 && weightData.some(d => d.weight > 0) ? (
                <ChartContainer config={chartConfig} className="h-64 w-full">
                  <ResponsiveContainer>
                    <RechartsBarChart data={weightData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="month" 
                        angle={-45}
                        textAnchor="end"
                        height={60}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={['auto', 'auto']} />
                      <ChartTooltip 
                        content={<ChartTooltipContent />}
                        formatter={(value: any) => [`${value} kg`, 'Weight']}
                      />
                      <Bar dataKey="weight" fill="var(--color-weight)" radius={[4, 4, 0, 0]} />
                    </RechartsBarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              ) : (
                <div className="h-64 flex items-center justify-center text-muted-foreground">
                  <p>Complete assessments to see your weight journey</p>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
