'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Calendar, Clock } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { articles } from '@/lib/data';
import { Skeleton } from '@/components/ui/skeleton';

interface Article {
  id: string;
  title: string;
  category: string;
  summary: string;
  content?: string;
  imageUrl: string;
  imageHint?: string;
  createdAt?: any;
  author?: string;
}

export default function ArticleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const articleId = params.id as string;
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadArticle();
  }, [articleId]);

  const loadArticle = async () => {
    setLoading(true);
    try {
      // Try to load from Firestore first
      const articleDoc = await getDoc(doc(db, 'articles', articleId));
      
      if (articleDoc.exists()) {
        const data = articleDoc.data();
        setArticle({
          id: articleDoc.id,
          title: data.title || 'Untitled',
          category: data.category || 'General',
          summary: data.summary || '',
          content: data.content || '',
          imageUrl: data.imageUrl || getDefaultImage(data.category),
          createdAt: data.createdAt,
          author: data.author || 'EmpowerHer Team',
        });
      } else {
        // Fallback to static articles
        const staticArticle = articles.find(a => a.id === articleId);
        if (staticArticle) {
          setArticle({
            ...staticArticle,
            content: getArticleContent(staticArticle.id),
          });
        } else {
          setArticle(null);
        }
      }
    } catch (error) {
      console.error('Error loading article:', error);
      // Fallback to static articles on error
      const staticArticle = articles.find(a => a.id === articleId);
      if (staticArticle) {
        setArticle({
          ...staticArticle,
          content: getArticleContent(staticArticle.id),
        });
      } else {
        setArticle(null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto grid gap-8">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-64 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto grid gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Article Not Found</CardTitle>
            <CardDescription>The article you're looking for doesn't exist.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild>
              <Link href="/knowledge-hub">Back to Knowledge Hub</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return null;
    try {
      const date = timestamp?.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto grid gap-8">
      <Button variant="ghost" asChild className="w-fit">
        <Link href="/knowledge-hub">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Knowledge Hub
        </Link>
      </Button>

      <article className="grid gap-8">
        <div>
          <Badge variant="secondary" className="mb-4">{article.category}</Badge>
          <h1 className="text-4xl font-bold tracking-tight mb-4">{article.title}</h1>
          {formatDate(article.createdAt) && (
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{formatDate(article.createdAt)}</span>
              </div>
              {article.author && (
                <div className="flex items-center gap-2">
                  <span>By {article.author}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {article.imageUrl && (
          <div className="relative w-full h-96 rounded-lg overflow-hidden">
            <Image
              src={article.imageUrl}
              alt={article.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        <Card>
          <CardContent className="pt-6">
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <p className="text-lg text-muted-foreground mb-6">{article.summary}</p>
              <div className="whitespace-pre-line">
                {article.content || getArticleContent(article.id)}
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-between items-center pt-6 border-t">
          <Button variant="outline" asChild>
            <Link href="/knowledge-hub">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to All Articles
            </Link>
          </Button>
        </div>
      </article>
    </div>
  );
}

function getDefaultImage(category: string): string {
  const imageMap: Record<string, string> = {
    'Medical': 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop',
    'Nutrition': 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=800&h=600&fit=crop',
    'Fitness': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
    'Mental Health': 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&h=600&fit=crop',
  };
  return imageMap[category] || 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=800&h=600&fit=crop';
}

function getArticleContent(articleId: string): string {
  const contentMap: Record<string, string> = {
    'what-is-pcos': ` What is PCOS?

Polycystic Ovary Syndrome (PCOS) is one of the most common hormonal disorders affecting women of reproductive age, with an estimated 1 in 10 women experiencing it. Despite its name, PCOS involves much more than just ovarian cysts.

Understanding PCOS

PCOS is a complex condition that affects multiple body systems. It's characterized by:

- Hormonal Imbalances: Women with PCOS often have higher than normal levels of androgens (male hormones), insulin resistance, and irregular hormone patterns.
- Irregular Menstrual Cycles: Many women with PCOS experience infrequent, irregular, or prolonged menstrual periods.
- Ovarian Cysts: While not all women with PCOS have cysts, the name comes from the appearance of enlarged ovaries with multiple small cysts.
- Metabolic Issues: Insulin resistance is common in PCOS, which can lead to weight gain and increased risk of type 2 diabetes.

Common Symptoms

The symptoms of PCOS can vary significantly from person to person:

- Irregular or absent menstrual periods
- Excessive hair growth (hirsutism) on face, chest, or back
- Acne or oily skin
- Hair loss or thinning on the scalp
- Weight gain or difficulty losing weight
- Dark patches of skin (acanthosis nigricans)
- Skin tags
- Fertility challenges

Causes and Risk Factors

While the exact cause of PCOS is unknown, several factors may contribute:

- Genetics: PCOS often runs in families, suggesting a genetic component.
- Insulin Resistance: When your body doesn't use insulin effectively, it can lead to increased androgen production.
- Inflammation: Low-grade inflammation may contribute to androgen production.
- Lifestyle Factors: Poor diet and lack of exercise may worsen symptoms.

Diagnosis

Diagnosing PCOS typically involves:

1. Review of symptoms and medical history
2. Physical examination
3. Blood tests to check hormone levels
4. Pelvic ultrasound to examine the ovaries

Treatment and Management

While there's no cure for PCOS, symptoms can be managed through:

- Lifestyle changes (diet and exercise)
- Medications to regulate menstrual cycles
- Hormone therapy
- Fertility treatments if needed
- Treatment of specific symptoms (acne, hair growth, etc.)

Living with PCOS

Managing PCOS is a long-term commitment. With the right treatment and lifestyle changes, most women with PCOS can lead healthy, fulfilling lives. Regular check-ups with healthcare providers are essential for monitoring and managing the condition effectively.

Remember, you're not alone in this journey. Many resources and communities are available to support women with PCOS.`,

    'diet-for-pcos': ` The PCOS Diet: A Comprehensive Guide

Managing PCOS through diet is one of the most effective ways to control symptoms and improve your overall health. What you eat directly impacts your insulin levels, hormones, and weight—all key factors in PCOS management.

Understanding the PCOS-Diet Connection

Women with PCOS often experience insulin resistance, which means your body doesn't use insulin effectively. This can lead to:
- Increased androgen production
- Weight gain
- Difficulty losing weight
- Increased risk of type 2 diabetes

A PCOS-friendly diet focuses on:
- Stabilizing blood sugar levels
- Reducing insulin resistance
- Supporting hormonal balance
- Promoting healthy weight management

Foods to Emphasize

1. High-Fiber Foods
Fiber helps slow down digestion and prevents rapid spikes in blood sugar:
- Whole grains (quinoa, brown rice, oats)
- Legumes (lentils, chickpeas, black beans)
- Vegetables (broccoli, spinach, kale)
- Fruits (berries, apples, pears)

2. Lean Proteins
Protein helps maintain muscle mass and keeps you feeling full:
- Chicken breast
- Fish (salmon, tuna, cod)
- Eggs
- Greek yogurt
- Tofu and tempeh

3. Healthy Fats
Essential for hormone production and overall health:
- Avocado
- Nuts and seeds (almonds, walnuts, chia seeds)
- Olive oil
- Fatty fish

4. Anti-Inflammatory Foods
- Berries
- Green leafy vegetables
- Turmeric
- Ginger
- Green tea

Foods to Limit or Avoid

1. Refined Carbohydrates
These cause rapid blood sugar spikes:
- White bread and pasta
- White rice
- Sugary cereals
- Pastries and baked goods

2. Added Sugars
- Soda and sugary drinks
- Candy and sweets
- Processed snacks
- High-sugar fruits (in excess)

3. Processed Foods
- Fast food
- Packaged snacks
- Processed meats
- Foods with artificial additives

4. Trans Fats
- Fried foods
- Margarine
- Some baked goods

Sample Meal Planning

Breakfast Ideas
- Greek yogurt with berries and nuts
- Oatmeal with fruit and almond butter
- Scrambled eggs with vegetables
- Smoothie with protein powder, spinach, and berries

Lunch Ideas
- Grilled chicken salad with olive oil dressing
- Quinoa bowl with vegetables and chickpeas
- Turkey and vegetable wrap
- Lentil soup with whole grain bread

Dinner Ideas
- Baked salmon with roasted vegetables
- Chicken stir-fry with brown rice
- Turkey meatballs with whole grain pasta
- Grilled tofu with quinoa and vegetables

Key Dietary Principles

1. Balance Your Meals: Include protein, healthy fats, and fiber in every meal
2. Regular Meal Timing: Eat every 3-4 hours to stabilize blood sugar
3. Portion Control: Be mindful of portion sizes
4. Stay Hydrated: Drink plenty of water throughout the day
5. Plan Ahead: Meal prep can help you stay on track

Supplements to Consider

Some supplements may be beneficial for PCOS management:
- Inositol (can improve insulin sensitivity)
- Vitamin D (many women with PCOS are deficient)
- Omega-3 fatty acids (anti-inflammatory)
- Magnesium (supports insulin function)
- Chromium (may improve insulin sensitivity)

Always consult with a healthcare provider before starting any supplements.

Making Sustainable Changes

Remember, dietary changes for PCOS are long-term commitments. Start with small, manageable changes rather than completely overhauling your diet overnight. Find foods you enjoy that also support your health goals.

Working with a registered dietitian who specializes in PCOS can provide personalized guidance tailored to your specific needs and preferences.`,

    'exercise-and-pcos': ` Exercise as Medicine for PCOS

Regular physical activity is one of the most powerful tools for managing PCOS symptoms. Exercise helps improve insulin sensitivity, reduce inflammation, manage weight, and boost mood—all crucial for PCOS management.

Why Exercise Matters for PCOS

1. Improves Insulin Sensitivity
Exercise helps your body use insulin more effectively, which can:
- Reduce androgen production
- Lower blood sugar levels
- Decrease diabetes risk
- Improve hormone balance

2. Supports Weight Management
While weight loss can be challenging with PCOS, regular exercise:
- Increases metabolism
- Builds muscle mass
- Burns calories
- Helps maintain weight loss

3. Reduces Inflammation
Chronic inflammation is common in PCOS. Exercise can:
- Lower inflammatory markers
- Improve overall health
- Reduce disease risk

4. Enhances Mental Health
Exercise releases endorphins and can help:
- Reduce stress and anxiety
- Improve mood
- Boost self-esteem
- Increase energy levels

Best Types of Exercise for PCOS

1. Cardiovascular Exercise
Aim for 150 minutes of moderate-intensity cardio per week:
- Walking or brisk walking
- Cycling (outdoor or stationary)
- Swimming
- Dancing
- Aerobics classes

2. Strength Training
Build muscle 2-3 times per week:
- Weight lifting
- Bodyweight exercises
- Resistance bands
- Pilates

Benefits of Strength Training:
- Increases muscle mass (burns more calories at rest)
- Improves insulin sensitivity
- Builds bone density
- Boosts metabolism

3. High-Intensity Interval Training (HIIT)
Short bursts of intense activity followed by rest:
- 20-30 minutes, 2-3 times per week
- Can be very effective for insulin sensitivity
- Examples: sprint intervals, circuit training

4. Yoga and Flexibility
Great for stress management and flexibility:
- Reduces cortisol levels
- Improves body awareness
- Enhances relaxation
- Supports hormonal balance

Creating Your Exercise Plan

Starting Out
If you're new to exercise or haven't exercised in a while:

1. Start Slowly: Begin with 10-15 minutes of activity
2. Choose Activities You Enjoy: You're more likely to stick with it
3. Gradually Increase: Add 5 minutes each week
4. Listen to Your Body: Rest when needed

Recommended Weekly Schedule

Beginner:
- 30 minutes of moderate cardio, 3-4 times per week
- 2 strength training sessions (20-30 minutes each)
- Daily walking (aim for 10,000 steps)

Intermediate:
- 30-45 minutes of cardio, 4-5 times per week
- 3 strength training sessions
- 1-2 yoga/flexibility sessions

Advanced:
- 45-60 minutes of cardio, 5-6 times per week
- 3-4 strength training sessions
- HIIT workouts 2-3 times per week

Exercise Tips for PCOS

1. Consistency Over Intensity: Regular moderate exercise is better than occasional intense workouts
2. Morning Workouts: Some research suggests morning exercise improves insulin sensitivity better
3. Find Your Rhythm: Exercise when you feel most energetic
4. Mix It Up: Vary your workouts to prevent boredom
5. Track Your Progress: Keep a workout log to stay motivated

Overcoming Exercise Challenges

Fatigue
PCOS can cause fatigue. To manage:
- Start with shorter, lighter sessions
- Exercise at your peak energy times
- Stay hydrated and eat balanced meals
- Get adequate sleep

Joint Pain
Some women with PCOS experience joint issues:
- Low-impact exercises (swimming, cycling)
- Proper warm-up and cool-down
- Strength training to support joints
- Consult a physical therapist if needed

Motivation
Stay motivated by:
- Setting realistic goals
- Finding an exercise buddy
- Joining a class or group
- Tracking your progress
- Celebrating small wins

Safety Considerations

1. Consult Your Doctor: Especially if you have other health conditions
2. Start Gradually: Don't push too hard too fast
3. Stay Hydrated: Drink water before, during, and after exercise
4. Warm Up and Cool Down: Prevent injury and aid recovery
5. Listen to Your Body: Stop if you feel pain or unwell

Measuring Success

Success isn't just about weight loss. Look for:
- Increased energy levels
- Better sleep quality
- Improved mood
- Easier weight management
- Better blood sugar control
- Improved strength and endurance

Remember, any movement is better than no movement. Start where you are, and build from there. Consistency is key to reaping the benefits of exercise for PCOS management.`,

    'stress-management-pcos': ` Managing Stress with PCOS

Stress and PCOS have a complex, bidirectional relationship. Stress can worsen PCOS symptoms, and PCOS symptoms can increase stress—creating a challenging cycle. Learning to manage stress effectively is crucial for PCOS management.

The Stress-PCOS Connection

How Stress Affects PCOS

1. Hormonal Impact
   - Increases cortisol production
   - Can raise insulin levels
   - May increase androgen production
   - Disrupts hormonal balance

2. Inflammation
   - Chronic stress increases inflammation
   - Worsens PCOS symptoms
   - Affects overall health

3. Behavioral Effects
   - May lead to emotional eating
   - Can disrupt sleep patterns
   - Might reduce motivation for self-care

How PCOS Affects Stress

- Physical symptoms can cause stress
- Fertility concerns
- Body image issues
- Managing the condition daily
- Social and emotional impacts

Effective Stress Management Techniques

1. Mindfulness and Meditation

Benefits:
- Reduces cortisol levels
- Improves emotional regulation
- Enhances self-awareness
- Promotes relaxation

Getting Started:
- Start with 5-10 minutes daily
- Use guided meditation apps
- Practice deep breathing
- Focus on the present moment

Simple Breathing Exercise:
1. Sit comfortably
2. Inhale for 4 counts
3. Hold for 4 counts
4. Exhale for 4 counts
5. Repeat 5-10 times

2. Yoga

Yoga combines physical movement with mindfulness:

Types Beneficial for PCOS:
- Hatha yoga (gentle and slow)
- Restorative yoga (very relaxing)
- Yin yoga (passive stretching)
- Vinyasa (more active, flow-based)

Benefits:
- Reduces stress hormones
- Improves flexibility
- Enhances body awareness
- Supports hormonal balance

3. Regular Exercise

Physical activity is a powerful stress reliever:
- Releases endorphins (feel-good hormones)
- Reduces cortisol
- Improves mood
- Boosts energy
- Helps with sleep

4. Adequate Sleep

Poor sleep increases stress and worsens PCOS:

Sleep Hygiene Tips:
- Maintain a consistent sleep schedule
- Create a relaxing bedtime routine
- Keep bedroom cool and dark
- Avoid screens before bed
- Limit caffeine, especially in afternoon

5. Time Management

Feeling overwhelmed increases stress:

- Prioritize tasks
- Break large tasks into smaller steps
- Learn to say no
- Delegate when possible
- Schedule breaks and downtime

6. Social Support

Connecting with others is crucial:

- Talk to friends and family
- Join PCOS support groups
- Find a therapist or counselor
- Share your experiences
- Ask for help when needed

7. Creative Outlets

Engaging in creative activities:
- Writing or journaling
- Art or crafts
- Music (listening or playing)
- Cooking or baking
- Gardening

8. Nature Therapy

Spending time in nature:
- Reduces cortisol
- Improves mood
- Lowers blood pressure
- Enhances well-being

Building a Stress Management Routine

Daily Practices
- Morning meditation (5-10 minutes)
- Breathing exercises throughout the day
- Regular exercise
- Evening relaxation routine

Weekly Practices
- Yoga class or session
- Time in nature
- Social activities
- Creative pursuits

As Needed
- Deep breathing when stressed
- Short walk to reset
- Talking to a friend
- Taking a break

Recognizing Stress Signals

Physical signs:
- Headaches
- Muscle tension
- Fatigue
- Sleep problems
- Digestive issues

Emotional signs:
- Anxiety or worry
- Irritability
- Feeling overwhelmed
- Mood swings
- Difficulty concentrating

When to Seek Professional Help

Consider professional support if:
- Stress feels unmanageable
- It's affecting daily life significantly
- You're experiencing anxiety or depression
- Stress is impacting relationships
- You're using unhealthy coping mechanisms

Types of Support:
- Therapy or counseling
- Support groups
- Stress management programs
- Medical consultation

Self-Compassion

Managing PCOS is challenging. Be kind to yourself:

- Acknowledge your efforts
- Accept that some days are harder
- Don't compare yourself to others
- Celebrate small victories
- Practice self-care regularly

Creating Your Stress Management Plan

1. Identify Your Stressors: What causes you the most stress?
2. Choose Techniques: What appeals to you?
3. Start Small: Pick 1-2 techniques to begin
4. Be Consistent: Practice regularly
5. Adjust as Needed: Find what works for you
6. Be Patient: Stress management is a skill that develops over time

Remember, managing stress is an ongoing process, not a destination. Every effort you make to reduce stress supports your PCOS management and overall well-being.`,
  };

  return contentMap[articleId] || articleId;
}

