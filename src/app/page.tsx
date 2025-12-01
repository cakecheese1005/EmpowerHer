import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, CheckCircle, HeartPulse, Stethoscope, TestTube2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { LandingHeader } from '@/components/landing-header';
import { Footer } from '@/components/footer';

export default function LandingPage() {
  const heroImage = PlaceHolderImages.find((img) => img.id === 'empower-hero');

  const features = [
    {
      icon: <Stethoscope className="size-8 text-primary" />,
      title: 'AI-Powered Risk Assessment',
      description: 'Our advanced AI analyzes your health data to provide an accurate PCOS risk assessment.',
      image: PlaceHolderImages.find((img) => img.id === 'feature-assessment'),
    },
    {
      icon: <HeartPulse className="size-8 text-primary" />,
      title: 'Personalized Lifestyle Plan',
      description: 'Receive tailored diet, exercise, and stress management recommendations to improve your well-being.',
      image: PlaceHolderImages.find((img) => img.id === 'feature-recommendations'),
    },
    {
      icon: <TestTube2 className="size-8 text-primary" />,
      title: 'Progress Tracking',
      description: 'Monitor your health metrics and track your progress over time with our intuitive dashboard.',
      image: PlaceHolderImages.find((img) => img.id === 'feature-tracking'),
    },
  ];

  const testimonials = [
    {
      name: 'Priya S.',
      role: 'User',
      text: 'EmpowerHer has been a game-changer for me. The personalized recommendations are easy to follow and have made a real difference in my life.',
      avatar: PlaceHolderImages.find((img) => img.id === 'avatar-1'),
    },
    {
      name: 'Dr. Anjali M.',
      role: 'Gynecologist',
      text: "A fantastic tool for early-stage PCOS awareness. I recommend EmpowerHer to my patients to help them understand and manage their health proactively.",
      avatar: PlaceHolderImages.find((img) => img.id === 'avatar-2'),
    },
     {
      name: 'Sneha K.',
      role: 'User',
      text: 'The assessment was so detailed and the results page explained everything clearly. I feel more in control of my health now.',
      avatar: PlaceHolderImages.find((img) => img.id === 'avatar-3'),
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <LandingHeader />

      <main className="flex-1">
        <section className="relative py-20 md:py-32">
          <div
            aria-hidden="true"
            className="absolute inset-0 top-0 -z-10 h-1/2 w-full bg-gradient-to-b from-primary/10 to-transparent"
          />
          <div className="container mx-auto px-4 text-center">
            <div className="mx-auto max-w-3xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl md:text-6xl">
                Take Control of Your Health with{' '}
                <span className="text-primary">EmpowerHer</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground md:text-xl">
                Get an AI-powered PCOS risk assessment and personalized lifestyle
                recommendations. Start your journey to a healthier you today.
              </p>
              <div className="mt-8 flex justify-center gap-4">
                <Button asChild size="lg">
                  <Link href="/signup">
                    Get Started Free <ArrowRight className="ml-2 size-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="#features">Learn More</Link>
                </Button>
              </div>
            </div>
            {heroImage && (
              <div className="mt-12">
                <Image
                  src={heroImage.imageUrl}
                  alt={heroImage.description}
                  width={1200}
                  height={600}
                  className="rounded-xl shadow-2xl"
                  data-ai-hint={heroImage.imageHint}
                  priority
                />
              </div>
            )}
          </div>
        </section>

        <section id="features" className="bg-background py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Features Designed For You
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Everything you need to understand your body and manage your health effectively.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {features.map((feature, index) => (
                <Card key={index} className="flex flex-col overflow-hidden transition-transform duration-300 hover:scale-105 hover:shadow-xl">
                  {feature.image && (
                    <Image
                      src={feature.image.imageUrl}
                      alt={feature.image.description}
                      width={600}
                      height={400}
                      className="h-48 w-full object-cover"
                      data-ai-hint={feature.image.imageHint}
                    />
                  )}
                  <CardHeader>
                    <div className="flex items-center gap-4">
                      {feature.icon}
                      <CardTitle className="text-xl">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-1">
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
        
        <section className="py-20 sm:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                What Our Users Say
              </h2>
              <p className="mt-4 text-lg text-muted-foreground">
                Trusted by women and healthcare professionals.
              </p>
            </div>
            <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
              {testimonials.map((testimonial, index) => (
                <Card key={index} className="bg-card/50 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <p className="italic">"{testimonial.text}"</p>
                    <div className="mt-4 flex items-center gap-4">
                      {testimonial.avatar && (
                         <Avatar>
                            <AvatarImage src={testimonial.avatar.imageUrl} alt={testimonial.name} data-ai-hint={testimonial.avatar.imageHint} />
                            <AvatarFallback>{testimonial.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-primary/5 py-20 sm:py-24">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Ready to Start Your Journey?
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              Join thousands of women who are taking control of their health with EmpowerHer.
            </p>
            <div className="mt-8">
              <Button asChild size="lg">
                <Link href="/signup">
                  Sign Up for Free <ArrowRight className="ml-2 size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
