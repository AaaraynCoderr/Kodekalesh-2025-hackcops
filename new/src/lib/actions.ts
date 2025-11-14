'use server';

import {
  identifyAndAdaptToProductType,
  type IdentifyAndAdaptToProductTypeInput,
} from '@/ai/flows/identify-and-adapt-to-product-type';
import {
  detectAndAlertDefects,
  type DetectAndAlertDefectsInput,
} from '@/ai/flows/detect-and-alert-defects';
import {
  dynamicallyAdjustQualityCheckParameters,
  type DynamicAdjustmentInput,
} from '@/ai/flows/dynamically-adjust-quality-check-parameters';
import {
  analyzeProductDimensions,
  type AnalyzeProductDimensionsInput,
} from '@/ai/flows/analyze-product-dimensions';


export async function runProductIdentification(
  input: IdentifyAndAdaptToProductTypeInput
) {
  try {
    const result = await identifyAndAdaptToProductType(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in product identification:', error);
    return { success: false, error: 'Failed to identify product.' };
  }
}

export async function runDefectDetection(input: DetectAndAlertDefectsInput) {
  try {
    const result = await detectAndAlertDefects(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in defect detection:', error);
    return { success: false, error: 'Failed to detect defects.' };
  }
}

export async function runThresholdAdjustment(input: DynamicAdjustmentInput) {
  try {
    const result = await dynamicallyAdjustQualityCheckParameters(input);
    return { success: true, data: result };
  } catch (error) {
    console.error('Error in threshold adjustment:', error);
    return { success: false, error: 'Failed to adjust threshold.' };
  }
}

export async function runDimensionAnalysis(input: AnalyzeProductDimensionsInput) {
    try {
        const result = await analyzeProductDimensions(input);
        return { success: true, data: result };
    } catch (error) {
        console.error('Error in dimension analysis:', error);
        return { success: false, error: 'Failed to analyze dimensions.' };
    }
}
