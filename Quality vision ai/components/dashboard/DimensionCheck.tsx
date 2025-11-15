'use client';

import { AlertCircle, CheckCircle, Ruler } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { DimensionInfo } from './Dashboard';

interface DimensionCheckProps {
  dimensionInfo: DimensionInfo;
}

export default function DimensionCheck({ dimensionInfo }: DimensionCheckProps) {
  if (!dimensionInfo) return null;

  if (dimensionInfo.isSizeCorrect) {
    return (
      <Alert variant="default" className="bg-blue-500/10 border-blue-500/50 text-blue-700 dark:text-blue-400">
        <Ruler className="h-4 w-4 !text-blue-500" />
        <AlertTitle className="font-bold">Dimension Check Passed</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{dimensionInfo.analysis}</span>
           <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300">
            {dimensionInfo.detectedDimensions}
          </Badge>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive">
      <Ruler className="h-4 w-4" />
      <AlertTitle className="font-bold text-lg">Dimension Anomaly Detected!</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="font-medium">{dimensionInfo.analysis}</span>
        <Badge variant="destructive" className="text-base">
            {dimensionInfo.detectedDimensions}
        </Badge>
      </AlertDescription>
    </Alert>
  );
}
