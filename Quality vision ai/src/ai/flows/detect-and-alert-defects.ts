'use server';
/**
 * @fileOverview Detects defects in products from images and alerts operators.
 *
 * - detectAndAlertDefects - A function that takes an image of a product and identifies defects.
 * - DetectAndAlertDefectsInput - The input type for the detectAndAlertDefects function.
 * - DetectAndAlertDefectsOutput - The return type for the detectAndAlertDefects function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectAndAlertDefectsInputSchema = z.object({
  productImageDataUri: z
    .string()
    .describe(
      "A photo of a product on the assembly line to be inspected, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  referenceImageDataUris: z.array(z.string()).describe(
      "An array of data URIs for 'good' reference images of the product. These images serve as the baseline for quality. Each must include a MIME type and use Base64 encoding."
  ),
  productType: z.string().describe('The type of product being inspected.'),
  threshold: z
    .number()
    .describe(
      'The minimum confidence score for a defect to be considered valid.'
    ),
});
export type DetectAndAlertDefectsInput = z.infer<
  typeof DetectAndAlertDefectsInputSchema
>;

const DetectAndAlertDefectsOutputSchema = z.object({
  hasDefect: z.boolean().describe('Whether a defect was detected.'),
  defectDescription: z
    .string()
    .describe('A description of the defect, if any.'),
  confidenceScore: z
    .number()
    .describe(
      'The confidence score of the defect detection (0 to 1, higher is better)'
    ),
  alertMessage: z.string().optional().describe('An alert message for the operator, if a defect is detected.')
});

export type DetectAndAlertDefectsOutput = z.infer<
  typeof DetectAndAlertDefectsOutputSchema
>;

export async function detectAndAlertDefects(
  input: DetectAndAlertDefectsInput
): Promise<DetectAndAlertDefectsOutput> {
  return detectAndAlertDefectsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectAndAlertDefectsPrompt',
  input: {schema: DetectAndAlertDefectsInputSchema},
  output: {schema: DetectAndAlertDefectsOutputSchema},
  prompt: `You are a meticulous quality control inspector on an assembly line. Your task is to perform a strict visual comparison.

You are inspecting a product identified as: {{{productType}}}.

**Step 1: Analyze the Golden Standard**
These are your reference images. They represent a **perfect, non-defective** product. Study their every detail.
{{#each referenceImageDataUris}}
Reference Image: {{media url=this}}
{{/each}}

**Step 2: Inspect the New Product**
This is the new image from the assembly line.
Inspection Image: {{media url=productImageDataUri}}

**Step 3: Strict Comparison and Defect Identification**
Compare the Inspection Image directly against the Reference Images. Identify any **physical flaws, inconsistencies, or deviations**. Ignore minor changes in lighting or camera angle. Focus ONLY on differences in the product's physical structure (scratches, dents, missing parts, discoloration, incorrect assembly).

- If you find a clear physical defect, set 'hasDefect' to true.
- Describe the specific flaw in 'defectDescription'.
- Assign a 'confidenceScore' based on how certain you are of the defect.
- If the inspected product perfectly matches the reference images, set 'hasDefect' to false.

The minimum confidence to report a defect is {{{threshold}}}. If your confidence is below this, consider it a pass.
Generate a concise alert message for the operator if a defect is found.
`,
});

const detectAndAlertDefectsFlow = ai.defineFlow(
  {
    name: 'detectAndAlertDefectsFlow',
    inputSchema: DetectAndAlertDefectsInputSchema,
    outputSchema: DetectAndAlertDefectsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);

    // Add alert message if defect is detected
    if (output?.hasDefect) {
        output.alertMessage = `DEFECT DETECTED: ${output.defectDescription}. Confidence: ${output.confidenceScore.toFixed(2)}`;
    }

    return output!;
  }
);
