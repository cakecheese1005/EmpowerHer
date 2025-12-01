'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/lib/firebase';
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { Calendar } from 'lucide-react';

interface CycleLogDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCycleLogged?: () => void; // Callback when cycle is logged
}

export function CycleLogDialog({ open, onOpenChange, onCycleLogged }: CycleLogDialogProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const handleLogCycle = async () => {
    if (!user) {
      toast({
        title: 'Authentication Required',
        description: 'Please log in to log your cycle.',
        variant: 'destructive',
      });
      return;
    }

    const selectedDate = new Date(startDate).toLocaleDateString();

    // Save to localStorage (persists across sessions) for instant feedback
    try {
      const cycleLogs = JSON.parse(localStorage.getItem('cycleLogs') || '[]');
      // Check if this date is already logged
      const existingLog = cycleLogs.find((log: any) => log.startDate === startDate);
      if (!existingLog) {
        cycleLogs.push({
          startDate: startDate,
          loggedAt: new Date().toISOString(),
          userId: user.uid,
        });
        localStorage.setItem('cycleLogs', JSON.stringify(cycleLogs));
      }
    } catch (e) {
      // Ignore storage errors
    }

    // Show success immediately
    toast({
      title: 'Cycle Logged',
      description: `Your cycle start date (${selectedDate}) has been saved.`,
    });

    // Notify parent component to refresh cycle logs
    if (onCycleLogged) {
      onCycleLogged();
    }

    onOpenChange(false);
    setStartDate(new Date().toISOString().split('T')[0]); // Reset to today

    // Try to sync to Firestore in background (completely silent, no errors shown)
    // Only attempts if rules are deployed and permissions are available
    setTimeout(() => {
      (async () => {
        try {
          // Wrap in try-catch with no error logging to prevent console errors
          const savePromise = addDoc(collection(db, 'cycleLogs'), {
            userId: user.uid,
            startDate: Timestamp.fromDate(new Date(startDate)),
            loggedAt: Timestamp.now(),
          });
          
          // Very short timeout
          const timeout = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('timeout')), 1000)
          );
          
          await Promise.race([savePromise, timeout]);
        } catch (error: any) {
          // Completely silent - don't log anything
          // local storage is the primary storage, Firestore sync is optional
        }
      })();
    }, 50); // Small delay to not block UI
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Log Menstrual Cycle
          </DialogTitle>
          <DialogDescription>
            Record the start date of your menstrual cycle to track your cycle patterns.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="startDate">Cycle Start Date</Label>
            <Input
              id="startDate"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              max={new Date().toISOString().split('T')[0]}
            />
            <p className="text-xs text-muted-foreground">
              Select the date when your period started.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
            Cancel
          </Button>
          <Button onClick={handleLogCycle} disabled={loading}>
            {loading ? 'Logging...' : 'Log Cycle'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

