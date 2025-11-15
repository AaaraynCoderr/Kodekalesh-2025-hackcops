"use client";

import { useState, useTransition } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  runProductIdentification,
  runDefectDetection,
  runDimensionAnalysis,
} from "@/lib/actions";

import LiveFeed from "./LiveFeed";
import ControlPanel from "./ControlPanel";
import Stats from "./Stats";
import InspectionLog from "./InspectionLog";
import DefectAlert from "./DefectAlert";
import { Skeleton } from "@/components/ui/skeleton";
import ReferenceImages from "./ReferenceImages";
import DimensionCheck from "./DimensionCheck";


export type InspectionResult = {
  id: string;
  timestamp: string;
  productType: string;
  status: 'Pass' | 'Fail';
  defectDescription?: string;
  confidence?: number;
  imageUrl: string;
};

export type ProductInfo = {
  productType: string;
  productDetails: string;
} | null;

export type DefectInfo = {
  hasDefect: boolean;
  defectDescription: string;
  confidenceScore: number;
  alertMessage?: string;
} | null;

export type DimensionInfo = {
    isSizeCorrect: boolean;
    detectedDimensions: string;
    analysis: string;
} | null;

export default function Dashboard() {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [productInfo, setProductInfo] = useState<ProductInfo>(null);
  const [defectInfo, setDefectInfo] = useState<DefectInfo>(null);
  const [dimensionInfo, setDimensionInfo] = useState<DimensionInfo>(null);
  const [inspectionLog, setInspectionLog] = useState<InspectionResult[]>([]);
  const [isInspecting, setIsInspecting] = useState(false);
  const [threshold, setThreshold] = useState(0.85);
  const [lastCapturedImage, setLastCapturedImage] = useState<string | null>(null);
  const [referenceImages, setReferenceImages] = useState<string[]>([]);

  const handleInspection = async (imageDataUri: string) => {
    if (referenceImages.length === 0) {
      toast({
        variant: "destructive",
        title: "Training Required",
        description: "Please add at least one reference image of a good product before scanning.",
      });
      return;
    }
    
    setIsInspecting(true);
    setProductInfo(null);
    setDefectInfo(null);
    setDimensionInfo(null);
    setLastCapturedImage(imageDataUri);

    startTransition(async () => {
      // 1. Identify Product
      const identResult = await runProductIdentification({ productImageUri: imageDataUri });
      if (!identResult.success || !identResult.data) {
        toast({
          variant: "destructive",
          title: "Error",
          description: identResult.error || "Could not identify product.",
        });
        setIsInspecting(false);
        return;
      }
      setProductInfo(identResult.data);

      // 2. Run parallel checks for defects and dimensions
      const [defectResult, dimensionResult] = await Promise.all([
        runDefectDetection({
            productImageDataUri: imageDataUri,
            referenceImageDataUris: referenceImages,
            productType: identResult.data.productType,
            threshold: threshold,
        }),
        runDimensionAnalysis({
            productImageDataUri: imageDataUri,
            referenceImageDataUris: referenceImages,
            productType: identResult.data.productType,
        })
      ]);


      if (!defectResult.success || !defectResult.data) {
        toast({
          variant: "destructive",
          title: "Error",
          description: defectResult.error || "Could not perform defect detection.",
        });
        // Continue even if one check fails
      } else {
        setDefectInfo(defectResult.data);
      }

      if (!dimensionResult.success || !dimensionResult.data) {
         toast({
          variant: "destructive",
          title: "Error",
          description: dimensionResult.error || "Could not perform dimension analysis.",
        });
      } else {
        setDimensionInfo(dimensionResult.data);
      }
      
      const finalDefect = defectResult.data?.hasDefect || !dimensionResult.data?.isSizeCorrect;

      // 3. Log Result
      const newLog: InspectionResult = {
        id: new Date().toISOString(),
        timestamp: new Date().toLocaleString(),
        productType: identResult.data.productType,
        status: finalDefect ? 'Fail' : 'Pass',
        defectDescription: [defectResult.data?.defectDescription, !dimensionResult.data?.isSizeCorrect ? dimensionResult.data?.analysis : null].filter(Boolean).join('; '),
        confidence: defectResult.data?.confidenceScore,
        imageUrl: imageDataUri,
      };
      setInspectionLog(prev => [newLog, ...prev].slice(0, 20)); // Keep log to 20 items
      
      // After a brief moment, allow inspection again
      setTimeout(() => setIsInspecting(false), finalDefect ? 4000 : 1000);
    });
  };

  const handleAddReferenceImage = (imageDataUri: string) => {
    setReferenceImages(prev => [...prev, imageDataUri]);
    toast({
      title: "Reference Image Added",
      description: "This image will be used as a baseline for good quality.",
    });
  };

  const handleRemoveReferenceImage = (index: number) => {
    setReferenceImages(prev => prev.filter((_, i) => i !== index));
     toast({
      title: "Reference Image Removed",
    });
  };


  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
      <div className="lg:col-span-2 space-y-6">
        <LiveFeed
          onInspect={handleInspection}
          isInspecting={isInspecting || isPending}
          productInfo={productInfo}
          onAddReference={handleAddReferenceImage}
          referenceImageCount={referenceImages.length}
        />
        {(isPending || isInspecting) && !defectInfo && !dimensionInfo &&(
            <div className="space-y-4 rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                <Skeleton className="h-8 w-1/3" />
                <Skeleton className="h-6 w-full" />
                <Skeleton className="h-6 w-1/2" />
            </div>
        )}
        {defectInfo && <DefectAlert defectInfo={defectInfo} />}
        {dimensionInfo && <DimensionCheck dimensionInfo={dimensionInfo} />}
        <Stats inspectionLog={inspectionLog} />
      </div>
      <div className="space-y-6">
        <ControlPanel currentThreshold={threshold} onThresholdChange={setThreshold} />
        <ReferenceImages images={referenceImages} onRemove={handleRemoveReferenceImage} onAdd={handleAddReferenceImage} />
        <InspectionLog log={inspectionLog} />
      </div>
    </div>
  );
}
