'use server'

import { summarizeAssessmentResults, SummarizeAssessmentResultsInput } from '@/ai/flows/summarize-assessment-results';
import { generatePersonalizedRecommendations, PersonalizedRecommendationsInput } from '@/ai/flows/generate-personalized-recommendations';
import { isAIEnabled } from '@/ai/genkit';

// Fallback summary generator
function generateFallbackSummary(input: SummarizeAssessmentResultsInput) {
    const { riskLabel, probability } = input.assessmentResult;
    const topFeatures = Object.entries(input.assessmentResult.featureImportance || {})
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([name]) => name);

    return {
        summary: `Based on your assessment, you have a ${riskLabel} risk level (${(probability * 100).toFixed(0)}% probability). The key factors influencing this assessment include ${topFeatures.join(', ')}. ${input.medicalHistory ? `Your medical history: ${input.medicalHistory}.` : ''} ${input.lifestyleFactors ? `Lifestyle factors: ${input.lifestyleFactors}.` : ''} Please consult with a healthcare professional for a formal diagnosis and personalized treatment plan.`
    };
}

// Fallback recommendations generator
function generateFallbackRecommendations(input: PersonalizedRecommendationsInput) {
    const riskLevel = input.pcosRiskAssessmentResult.toLowerCase();
    const isHighRisk = riskLevel.includes('high');
    const isEarlyRisk = riskLevel.includes('early');
    const isNoRisk = riskLevel.includes('no') || riskLevel.includes('low');
    const bmi = input.weight / Math.pow(input.height / 100, 2);
    const isOverweight = bmi >= 25;
    const isUnderweight = bmi < 18.5;
    
    // Extract lifestyle info
    const hasIrregularCycle = input.lifestyle?.toLowerCase().includes('irregular');
    const hasLowExercise = input.lifestyle?.toLowerCase().includes('none') || input.lifestyle?.toLowerCase().includes('1-2');
    const hasUnhealthyDiet = input.lifestyle?.toLowerCase().includes('unhealthy');

    // Diet Recommendations - Different for each risk level
    let dietRecommendations = '';
    if (isHighRisk) {
        dietRecommendations = `**Priority: Insulin Management Diet**
        
Focus on a low-glycemic index diet to help manage insulin resistance:
• Eat regular, balanced meals every 3-4 hours to stabilize blood sugar
• Prioritize whole foods: lean proteins (chicken, fish, legumes), complex carbs (quinoa, brown rice, sweet potatoes)
• Include healthy fats: avocados, nuts, olive oil
• Increase fiber intake: aim for 25-30g daily from vegetables, fruits, and whole grains
• Limit or avoid: processed foods, added sugars, refined carbohydrates, and sugary beverages
• Consider: Anti-inflammatory foods like leafy greens, berries, and fatty fish
${isOverweight ? '\n• Weight management: Focus on portion control and nutrient-dense foods to support healthy weight loss.' : ''}
${hasUnhealthyDiet ? '\n• Dietary transition: Gradually reduce fast food and processed meals. Meal prep can help maintain consistency.' : ''}`;
    } else if (isEarlyRisk) {
        dietRecommendations = `**Preventive Nutrition Plan**
        
Adopt a balanced, nutrient-rich diet to support hormonal health:
• Maintain regular meal timing to support metabolic health
• Include a variety of whole foods: lean proteins, whole grains, colorful vegetables and fruits
• Choose complex carbohydrates over simple sugars
• Incorporate healthy fats from sources like nuts, seeds, and olive oil
• Stay hydrated: aim for 8-10 glasses of water daily
• Limit processed foods and added sugars
${isOverweight ? '\n• Weight awareness: Monitor portion sizes and focus on nutrient quality.' : ''}
${hasUnhealthyDiet ? '\n• Dietary improvements: Start by replacing one processed meal per day with a whole-food alternative.' : ''}`;
    } else {
        dietRecommendations = `**Maintenance Nutrition**
        
Continue your healthy eating habits:
• Maintain a balanced diet with variety: lean proteins, whole grains, fruits, and vegetables
• Stay hydrated throughout the day
• Enjoy treats in moderation
• Focus on nutrient-dense foods to support overall wellness
${isOverweight || isUnderweight ? '\n• Weight maintenance: Continue monitoring your weight and adjust portions as needed for your activity level.' : ''}`;
    }

    // Exercise Suggestions - Different for each risk level
    let exerciseSuggestions = '';
    if (isHighRisk) {
        exerciseSuggestions = `**Comprehensive Exercise Program**
        
Aim for at least 150-180 minutes of moderate-intensity exercise per week:
• **Cardiovascular**: 30-45 minutes, 4-5 times/week (brisk walking, cycling, swimming, dancing)
• **Strength Training**: 2-3 times/week focusing on major muscle groups (helps improve insulin sensitivity)
• **Flexibility**: Include stretching or yoga 2-3 times/week
• Start gradually if you're new to exercise - even 10 minutes daily is a good beginning
• Consider: High-intensity interval training (HIIT) 1-2 times/week after building baseline fitness
• Important: Consult with a healthcare provider before beginning a new routine, especially if you have joint issues
${hasLowExercise ? '\n• Getting started: Begin with 10-15 minute walks daily and gradually increase duration and intensity.' : ''}`;
    } else if (isEarlyRisk) {
        exerciseSuggestions = `**Regular Activity Plan**
        
Aim for at least 120-150 minutes of moderate-intensity exercise per week:
• **Cardiovascular**: 30 minutes, 4-5 times/week (walking, jogging, cycling, swimming)
• **Strength Training**: 2 times/week to build muscle and support metabolism
• **Flexibility**: Include stretching or yoga 1-2 times/week
• Find activities you enjoy to maintain consistency
• Mix it up: Variety helps prevent boredom and works different muscle groups
${hasLowExercise ? '\n• Building the habit: Start with 20-30 minute sessions 3 times per week and gradually increase frequency.' : ''}`;
    } else {
        exerciseSuggestions = `**Maintenance Activity**
        
Continue your current exercise routine:
• Aim for at least 30 minutes of moderate exercise most days of the week (150 minutes/week minimum)
• Include activities you enjoy: walking, cycling, dancing, sports, or gym workouts
• Add variety: Mix cardiovascular, strength, and flexibility exercises
• Listen to your body and adjust intensity as needed
• Stay consistent: Regular activity supports overall health and hormonal balance`;
    }

    // Stress Management - More intensive for higher risk
    let stressManagementTechniques = '';
    if (isHighRisk) {
        stressManagementTechniques = `**Comprehensive Stress Management**
        
High stress can worsen PCOS symptoms. Prioritize stress reduction:
• **Sleep**: Ensure 7-9 hours of quality sleep nightly. Maintain a consistent sleep schedule
• **Mindfulness**: Practice daily meditation, deep breathing exercises, or progressive muscle relaxation
• **Physical relaxation**: Yoga, tai chi, or gentle stretching can reduce cortisol levels
• **Time management**: Prioritize tasks and learn to say no to reduce overwhelm
• **Social support**: Maintain connections with friends and family. Consider joining a support group
• **Professional help**: Consider therapy or counseling if stress is significantly impacting your life
• **Hobbies**: Engage in activities that bring joy and relaxation`;
    } else if (isEarlyRisk) {
        stressManagementTechniques = `**Stress Reduction Strategies**
        
Manage stress to support hormonal balance:
• **Sleep**: Aim for 7-9 hours of quality sleep per night
• **Relaxation techniques**: Practice deep breathing, meditation, or yoga regularly
• **Physical activity**: Exercise itself is a great stress reliever
• **Work-life balance**: Set boundaries and take breaks when needed
• **Social connections**: Maintain relationships and seek support when needed
• **Enjoyable activities**: Make time for hobbies and activities that relax you`;
    } else {
        stressManagementTechniques = `**Maintain Healthy Stress Levels**
        
Continue your stress management practices:
• Ensure adequate sleep (7-9 hours per night)
• Practice stress-reduction techniques such as deep breathing, meditation, or yoga
• Maintain social connections and engage in hobbies you enjoy
• If stress becomes overwhelming, consider talking to a therapist or counselor
• Regular exercise helps manage stress naturally`;
    }

    // Follow-up Actions - Different urgency for each risk level
    let followUpSuggestions = '';
    if (isHighRisk) {
        followUpSuggestions = `**Immediate Medical Follow-up Recommended**
        
Schedule an appointment with a healthcare provider within the next 2-4 weeks:
• **Preferred specialists**: Gynecologist or endocrinologist with PCOS experience
• **Recommended tests**: 
  - Blood tests: Hormone levels (LH, FSH, testosterone, DHEA-S), glucose tolerance test, insulin levels, lipid panel, thyroid function
  - Ultrasound: To check for ovarian cysts and endometrial thickness
• **Preparation**: Keep a symptom diary documenting menstrual cycles, symptoms, and lifestyle factors
• **Questions to ask**: Treatment options, lifestyle modifications, monitoring plan, and when to follow up
• **Lifestyle tracking**: Continue monitoring your diet, exercise, and symptoms to share with your doctor`;
    } else if (isEarlyRisk) {
        followUpSuggestions = `**Preventive Health Monitoring**
        
Schedule a check-up with your healthcare provider within the next 1-2 months:
• **Discussion points**: Share your assessment results and any concerns about your menstrual cycle or symptoms
• **Optional tests**: Your doctor may recommend baseline hormone tests or glucose screening
• **Monitoring**: Track your menstrual cycles and any new or changing symptoms
• **Follow-up**: Plan regular check-ups (every 6-12 months) to monitor your health
• **Lifestyle focus**: Continue implementing the recommended lifestyle changes and track your progress`;
    } else {
        followUpSuggestions = `**Ongoing Health Maintenance**
        
Continue monitoring your health:
• Maintain regular check-ups with your healthcare provider (annual or as recommended)
• Stay aware of any changes in your menstrual cycle, symptoms, or overall health
• If you notice new symptoms or changes, consult a doctor promptly
• Continue following healthy lifestyle habits to maintain your current health status
• Keep track of your health metrics and assessments over time`;
    }

    return {
        dietRecommendations: dietRecommendations.trim(),
        exerciseSuggestions: exerciseSuggestions.trim(),
        stressManagementTechniques: stressManagementTechniques.trim(),
        followUpSuggestions: followUpSuggestions.trim()
    };
}

export async function getAssessmentSummary(input: SummarizeAssessmentResultsInput) {
    try {
        if (!isAIEnabled) {
            return generateFallbackSummary(input);
        }
        const summary = await summarizeAssessmentResults(input);
        return summary;
    } catch (error) {
        console.error("Error generating assessment summary:", error);
        // Return fallback instead of throwing
        return generateFallbackSummary(input);
    }
}

export async function getPersonalizedRecommendations(input: PersonalizedRecommendationsInput) {
    try {
        if (!isAIEnabled) {
            return generateFallbackRecommendations(input);
        }
        const recommendations = await generatePersonalizedRecommendations(input);
        return recommendations;
    } catch (error) {
        console.error("Error generating recommendations:", error);
        // Return fallback instead of throwing
        return generateFallbackRecommendations(input);
    }
}
