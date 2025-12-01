'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { signInWithGoogle } from '@/lib/auth-helpers';
import { PhoneAuthDialog } from '@/components/phone-auth-dialog';

const formSchema = z.object({
  name: z.string().min(1, { message: 'Name is required.' }),
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(8, { message: 'Password must be at least 8 characters.' }),
});

export default function SignupPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [phoneDialogOpen, setPhoneDialogOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setLoading(true);
      console.log('Starting signup for:', values.email);
      console.log('Firebase app:', auth.app?.options?.authDomain || 'Not available');
      
      // Create user account with timeout
      const authPromise = createUserWithEmailAndPassword(auth, values.email, values.password);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Signup timed out. Please check your internet connection and try again.')), 10000)
      );
      
      const userCredential = await Promise.race([authPromise, timeoutPromise]) as any;
      console.log('User created:', userCredential.user?.uid);
      
      // Update display name
      try {
        await updateProfile(userCredential.user, {
          displayName: values.name,
        });
        console.log('Profile updated');
      } catch (profileError) {
        console.warn('Failed to update profile:', profileError);
        // Continue even if profile update fails
      }

      // Create user profile in Firestore
      try {
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          name: values.name,
          email: values.email,
          createdAt: new Date(),
        });
        console.log('User profile created in Firestore');
      } catch (firestoreError) {
        console.warn('Failed to create Firestore profile:', firestoreError);
        // Continue even if Firestore fails - user account is still created
      }

      toast({
        title: 'Success!',
        description: 'Your account has been created successfully.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      console.error('Signup error:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      
      let errorMessage = 'Failed to create account. Please try again.';
      
      if (error.message?.includes('timeout')) {
        errorMessage = 'Connection timeout. Please check your internet and try again.';
      } else if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'This email is already registered. Please log in instead.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please use a stronger password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your connection and ensure Email/Password auth is enabled in Firebase Console.';
      } else if (error.message) {
        errorMessage = error.message;
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

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-2xl">Create an Account</CardTitle>
        <CardDescription>
          Start your journey to better health today.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Your Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-center text-sm">
          Already have an account?{' '}
          <Link href="/login" className="underline text-primary">
            Log in
          </Link>
        </div>
        <div className="relative mt-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            onClick={async () => {
              try {
                setLoading(true);
                await signInWithGoogle();
                toast({
                  title: 'Success!',
                  description: 'Signed in with Google successfully.',
                });
                router.push('/dashboard');
              } catch (error: any) {
                toast({
                  title: 'Error',
                  description: error.message || 'Failed to sign in with Google',
                  variant: 'destructive',
                });
              } finally {
                setLoading(false);
              }
            }}
            disabled={loading}
          >
            Google
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setPhoneDialogOpen(true)}
            disabled={loading}
          >
            Phone
          </Button>
        </div>
      </CardContent>
      <PhoneAuthDialog
        open={phoneDialogOpen}
        onOpenChange={setPhoneDialogOpen}
        onSuccess={() => router.push('/dashboard')}
      />
    </Card>
  );
}
