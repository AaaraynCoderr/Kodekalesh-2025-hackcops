'use server';
/**
 * @fileOverview Analyzes and compares the dimensions of a product against reference images.
 *
 * - analyzeProductDimensions - A function that takes an inspection image and reference images and compares their dimensions.
 * - AnalyzeProductDimensionsInput - The input type for the analyzeProductDimensions function.
 * - AnalyzeProductDimensionsOutput - The return type for the analyzeProductDimensions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeProductDimensionsInputSchema = z.object({
  productImageDataUri: z
    .string()
    .describe(
      "A photo of a product on the assembly line to be inspected, as a data URI that must include a MIME type and use Base64 encoding."
    ),
  referenceImageDataUris: z.array(z.string()).describe(
      "An array of data URIs for 'good' reference images of the product. These images serve as the baseline for size comparison."
  ),
  productType: z.string().describe('The type of product being inspected.'),
});
export type AnalyzeProductDimensionsInput = z.infer<
  typeof AnalyzeProductDimensionsInputSchema
>;

const AnalyzeProductDimensionsOutputSchema = z.object({
  isSizeCorrect: z.boolean().describe('Whether the product dimensions match the reference.'),
  detectedDimensions: z.string().describe('The detected dimensions of the inspected product (e.g., "10cm x 5cm x 2cm").'),
  analysis: z.string().describe('A brief analysis of the size comparison.'),
});

export type AnalyzeProductDimensionsOutput = z.infer<
  typeof AnalyzeProductDimensionsOutputSchema
>;

export async function analyzeProductDimensions(
  input: AnalyzeProductDimensionsInput
): Promise<AnalyzeProductDimensionsOutput> {
  return analyzeProductDimensionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeProductDimensionsPrompt',
  input: {schema: AnalyzeProductDimensionsInputSchema},
  output: {schema: AnalyzeProductDimensionsOutputSchema},
  prompt: `You are a precision measurement specialist in an automated quality control system. Your task is to perform a strict dimensional analysis of a product image against reference "golden" images.

You are inspecting a product of type: {{{productType}}}.

**Step 1: Establish Baseline Dimensions**
First, establish the exact baseline size from the following reference images of a **correctly sized** product.
{{#each referenceImageDataUris}}
Reference Image: {{media url=this}}
{{/each}}

**Step 2: Measure the Inspection Image**
Now, carefully measure the dimensions (width, height, depth if possible) of the product in the following inspection image. The environment and camera angle are consistent between all images. Assume the largest object in the foreground is the product.

Inspection Image: {{media url=productImageDataUri}}

**Step 3: Strict Comparison and Analysis**
Directly compare the measured dimensions from the Inspection Image to the baseline established in Step 1.

- If the dimensions are within a strict 2% tolerance of the reference, set 'isSizeCorrect' to true.
- If there is any deviation greater than 2%, set 'isSizeCorrect' to false.
- Provide the estimated dimensions of the inspected product in the 'detectedDimensions' field.
- Provide a concise summary of your findings in the 'analysis' field (e.g., "Matches reference dimensions." or "Product is 5% wider than reference.").
`,
});

const analyzeProductDimensionsFlow = ai.defineFlow(
  {
    name: 'analyzeProductDimensionsFlow',
    inputSchema: AnalyzeProductDimensionsInputSchema,
    outputSchema: AnalyzeProductDimensionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
