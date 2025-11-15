'use server';
/**
 * @fileOverview This file implements a Genkit flow that identifies the product type from an image
 * and provides the product information to downstream tools for automated quality control adjustments.
 *
 * - identifyAndAdaptToProductType - The main function that orchestrates product identification and adaptation.
 * - IdentifyAndAdaptToProductTypeInput - The input type for the identifyAndAdaptToProductType function.
 * - IdentifyAndAdaptToProductTypeOutput - The output type for the identifyAndAdaptToProductType function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyAndAdaptToProductTypeInputSchema = z.object({
  productImageUri: z
    .string()
    .describe(
      'A photo of the product under inspection, as a data URI that must include a MIME type and use Base64 encoding. Expected format: \'data:<mimetype>;base64,<encoded_data>\'.' // Corrected typo here
    ),
});
export type IdentifyAndAdaptToProductTypeInput = z.infer<typeof IdentifyAndAdaptToProductTypeInputSchema>;

const IdentifyAndAdaptToProductTypeOutputSchema = z.object({
  productType: z.string().describe('The identified type of the product.'),
  productDetails: z.string().describe('Detailed information about the product relevant to quality control.'),
});
export type IdentifyAndAdaptToProductTypeOutput = z.infer<typeof IdentifyAndAdaptToProductTypeOutputSchema>;

export async function identifyAndAdaptToProductType(
  input: IdentifyAndAdaptToProductTypeInput
): Promise<IdentifyAndAdaptToProductTypeOutput> {
  return identifyAndAdaptToProductTypeFlow(input);
}

const productIdentificationPrompt = ai.definePrompt({
  name: 'productIdentificationPrompt',
  input: {schema: IdentifyAndAdaptToProductTypeInputSchema},
  output: {schema: IdentifyAndAdaptToProductTypeOutputSchema},
  prompt: `You are an AI assistant specializing in identifying products from images and providing relevant details for quality control.

  Analyze the image of the product and determine its type. Provide detailed information about the product that would be useful for quality control processes, such as key features to inspect, common defects for this product type, and relevant tolerances.

  Image: {{media url=productImageUri}}
  `,
});

const identifyAndAdaptToProductTypeFlow = ai.defineFlow(
  {
    name: 'identifyAndAdaptToProductTypeFlow',
    inputSchema: IdentifyAndAdaptToProductTypeInputSchema,
    outputSchema: IdentifyAndAdaptToProductTypeOutputSchema,
  },
  async input => {
    const {output} = await productIdentificationPrompt(input);
    return output!;
  }
);
