'use server'

import { summarizeAssessmentResults, SummarizeAssessmentResultsInput } from '@/ai/flows/summarize-assessment-results';
import { generatePersonalizedRecommendations, PersonalizedRecommendationsInput } from '@/ai/flows/generate-personalized-recommendations';

export async function getAssessmentSummary(input: SummarizeAssessmentResultsInput) {
    try {
        const summary = await summarizeAssessmentResults(input);
        return summary;
    } catch (error) {
        console.error("Error generating assessment summary:", error);
        throw new Error("Failed to generate assessment summary.");
    }
}

export async function getPersonalizedRecommendations(input: PersonalizedRecommendationsInput) {
     try {
        const recommendations = await generatePersonalizedRecommendations(input);
        return recommendations;
    } catch (error) {
        console.error("Error generating recommendations:", error);
        throw new Error("Failed to generate personalized recommendations.");
    }
}
