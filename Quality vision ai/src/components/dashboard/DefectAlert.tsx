import { AlertCircle, CheckCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { DefectInfo } from './Dashboard';

interface DefectAlertProps {
  defectInfo: DefectInfo;
}

export default function DefectAlert({ defectInfo }: DefectAlertProps) {
  if (!defectInfo) return null;

  if (!defectInfo.hasDefect) {
    return (
      <Alert variant="default" className="bg-green-500/10 border-green-500/50 text-green-700 dark:text-green-400">
        <CheckCircle className="h-4 w-4 !text-green-500" />
        <AlertTitle className="font-bold">Inspection Passed</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>No defects found on this product.</span>
          <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
            Confidence: {(defectInfo.confidenceScore * 100).toFixed(0)}%
          </Badge>
        </AlertDescription>
      </Alert>
    );
  }
  
  return (
    <Alert variant="destructive" className="animate-pulse-slow border-2">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle className="font-bold text-lg">{defectInfo.alertMessage || "Defect Detected!"}</AlertTitle>
      <AlertDescription className="flex items-center justify-between">
        <span className="font-medium">{defectInfo.defectDescription}</span>
        <Badge variant="destructive" className="text-base">
          Confidence: {(defectInfo.confidenceScore * 100).toFixed(0)}%
        </Badge>
      </AlertDescription>
    </Alert>
  );
}
