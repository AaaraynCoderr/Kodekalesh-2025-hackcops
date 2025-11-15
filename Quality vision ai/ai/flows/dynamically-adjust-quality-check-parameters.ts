'use server';

/**
 * @fileOverview Dynamically adjusts quality check parameters based on real-time environmental data.
 *
 * - dynamicallyAdjustQualityCheckParameters - A function that adjusts quality check parameters.
 * - DynamicAdjustmentInput - The input type for the dynamicallyAdjustQualityCheckParameters function.
 * - DynamicAdjustmentOutput - The return type for the dynamicallyAdjustQualityCheckParameters function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DynamicAdjustmentInputSchema = z.object({
  temperature: z
    .number()
    .describe('The current temperature in Celsius.'),
  humidity: z.number().describe('The current relative humidity (percentage).'),
  vibration: z.number().describe('The current vibration level (RMS value).'),
  lightLevel: z.number().describe('The current light level (Lux).'),
  defectSeverity: z
    .string()
    .describe('The severity of the defect being checked.'),
  currentThreshold: z
    .number()
    .describe('The current threshold value for the quality check.'),
});
export type DynamicAdjustmentInput = z.infer<typeof DynamicAdjustmentInputSchema>;

const DynamicAdjustmentOutputSchema = z.object({
  adjustedThreshold: z
    .number()
    .describe('The adjusted threshold value for the quality check.'),
  reason: z
    .string()
    .describe('The reasoning behind the threshold adjustment.'),
});
export type DynamicAdjustmentOutput = z.infer<typeof DynamicAdjustmentOutputSchema>;

export async function dynamicallyAdjustQualityCheckParameters(
  input: DynamicAdjustmentInput
): Promise<DynamicAdjustmentOutput> {
  return dynamicallyAdjustQualityCheckParametersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'dynamicAdjustmentPrompt',
  input: {schema: DynamicAdjustmentInputSchema},
  output: {schema: DynamicAdjustmentOutputSchema},
  prompt: `You are an expert quality control engineer tasked with dynamically adjusting quality check parameters based on real-time environmental data.

  Based on the following environmental conditions and the current quality check threshold, determine an adjusted threshold value and explain your reasoning. The goal is to minimize false positives and false negatives.

  Current Temperature: {{temperature}} Celsius
  Current Humidity: {{humidity}}%
  Current Vibration Level: {{vibration}} RMS
  Current Light Level: {{lightLevel}} Lux
  Defect Severity: {{defectSeverity}}
  Current Threshold: {{currentThreshold}}

  Consider how each environmental factor might affect the accuracy of the quality check.
  For example, high temperature or vibration might cause sensors to be less accurate, requiring a wider threshold.  Low light might make visual inspections more difficult, also requiring a wider threshold.

  Return the adjusted threshold value and a brief explanation of your reasoning.
  Be concise.
  `,
});

const dynamicallyAdjustQualityCheckParametersFlow = ai.defineFlow(
  {
    name: 'dynamicallyAdjustQualityCheckParametersFlow',
    inputSchema: DynamicAdjustmentInputSchema,
    outputSchema: DynamicAdjustmentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
