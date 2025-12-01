'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { setupRecaptcha, sendPhoneVerificationCode, verifyPhoneCode, cleanupRecaptcha } from '@/lib/auth-helpers';
import { ConfirmationResult } from 'firebase/auth';

interface PhoneAuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export function PhoneAuthDialog({ open, onOpenChange, onSuccess }: PhoneAuthDialogProps) {
  const { toast } = useToast();
  const [phoneNumber, setPhoneNumber] = useState('');
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaReady, setRecaptchaReady] = useState(false);

  useEffect(() => {
    if (open && !recaptchaReady) {
      try {
        setupRecaptcha('recaptcha-container');
        setRecaptchaReady(true);
      } catch (error) {
        console.error('Recaptcha setup error:', error);
      }
    }

    return () => {
      if (!open) {
        cleanupRecaptcha();
        setRecaptchaReady(false);
        setConfirmationResult(null);
        setPhoneNumber('');
        setCode('');
      }
    };
  }, [open, recaptchaReady]);

  const handleSendCode = async () => {
    if (!phoneNumber) {
      toast({
        title: 'Error',
        description: 'Please enter a phone number',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);
      const verifier = setupRecaptcha('recaptcha-container');
      const result = await sendPhoneVerificationCode(`+${phoneNumber.replace(/\D/g, '')}`, verifier);
      setConfirmationResult(result);
      toast({
        title: 'Code Sent!',
        description: 'Please check your phone for the verification code.',
      });
    } catch (error: any) {
      console.error('Send code error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to send verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || !confirmationResult) return;

    try {
      setLoading(true);
      await verifyPhoneCode(confirmationResult, code);
      toast({
        title: 'Success!',
        description: 'Phone authentication successful!',
      });
      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      console.error('Verify code error:', error);
      toast({
        title: 'Error',
        description: error.message || 'Invalid verification code',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Phone Authentication</DialogTitle>
          <DialogDescription>
            Enter your phone number to receive a verification code
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {!confirmationResult ? (
            <>
              <div>
                <Input
                  placeholder="+1234567890"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Include country code (e.g., +1 for US)
                </p>
              </div>
              <div id="recaptcha-container" />
              <Button onClick={handleSendCode} disabled={loading} className="w-full">
                {loading ? 'Sending...' : 'Send Verification Code'}
              </Button>
            </>
          ) : (
            <>
              <div>
                <Input
                  placeholder="Enter 6-digit code"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  disabled={loading}
                  maxLength={6}
                />
              </div>
              <Button onClick={handleVerifyCode} disabled={loading || !code} className="w-full">
                {loading ? 'Verifying...' : 'Verify Code'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setConfirmationResult(null);
                  setCode('');
                }}
                className="w-full"
              >
                Use Different Number
              </Button>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}


