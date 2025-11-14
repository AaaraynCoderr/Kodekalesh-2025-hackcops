"use client";

import { useState, useTransition } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Thermometer, Droplets, Activity, Sun, Settings, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { runThresholdAdjustment } from '@/lib/actions';
import { Separator } from '@/components/ui/separator';

interface ControlPanelProps {
  currentThreshold: number;
  onThresholdChange: (value: number) => void;
}

export default function ControlPanel({ currentThreshold, onThresholdChange }: ControlPanelProps) {
  const [isPending, startTransition] = useTransition();
  const { toast } = useToast();

  const [temperature, setTemperature] = useState(22);
  const [humidity, setHumidity] = useState(45);
  const [vibration, setVibration] = useState(0.1);
  const [lightLevel, setLightLevel] = useState(800);
  
  const [adjustedThreshold, setAdjustedThreshold] = useState<number | null>(null);
  const [reason, setReason] = useState<string | null>(null);

  const handleAdjustment = () => {
    startTransition(async () => {
        const result = await runThresholdAdjustment({
            temperature,
            humidity,
            vibration,
            lightLevel,
            defectSeverity: 'High', // Example value
            currentThreshold,
        });

        if (result.success && result.data) {
            setAdjustedThreshold(result.data.adjustedThreshold);
            setReason(result.data.reason);
            toast({
                title: "Threshold Suggestion Updated",
                description: "AI has provided a new threshold based on current conditions.",
            });
        } else {
            toast({
                variant: 'destructive',
                title: "Adjustment Failed",
                description: result.error,
            });
        }
    });
  };
  
  const applyAdjustment = () => {
    if (adjustedThreshold !== null) {
      onThresholdChange(adjustedThreshold);
      setAdjustedThreshold(null);
      setReason(null);
      toast({
        title: "Threshold Applied",
        description: `Defect detection threshold is now ${adjustedThreshold.toFixed(2)}.`,
      });
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-primary" />
          <CardTitle>Control Panel</CardTitle>
        </div>
        <CardDescription>Adjust quality control parameters.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
            <h4 className="text-sm font-medium mb-4">Environmental Conditions</h4>
            <div className="space-y-4">
              <div className="grid gap-2">
                  <Label htmlFor="temperature" className="flex items-center gap-2"><Thermometer className="h-4 w-4 text-muted-foreground"/> Temperature: {temperature}°C</Label>
                  <Slider id="temperature" value={[temperature]} onValueChange={([v]) => setTemperature(v)} min={-10} max={50} step={1} />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="humidity" className="flex items-center gap-2"><Droplets className="h-4 w-4 text-muted-foreground"/> Humidity: {humidity}%</Label>
                  <Slider id="humidity" value={[humidity]} onValueChange={([v]) => setHumidity(v)} min={0} max={100} step={1} />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="vibration" className="flex items-center gap-2"><Activity className="h-4 w-4 text-muted-foreground"/> Vibration: {vibration.toFixed(2)} RMS</Label>
                  <Slider id="vibration" value={[vibration]} onValueChange={([v]) => setVibration(v)} min={0} max={2} step={0.05} />
              </div>
              <div className="grid gap-2">
                  <Label htmlFor="lightLevel" className="flex items-center gap-2"><Sun className="h-4 w-4 text-muted-foreground"/> Light Level: {lightLevel} Lux</Label>
                  <Slider id="lightLevel" value={[lightLevel]} onValueChange={([v]) => setLightLevel(v)} min={100} max={2000} step={50} />
              </div>
            </div>
        </div>
        
        <Separator/>

        <div>
            <h4 className="text-sm font-medium mb-2">Dynamic Thresholding</h4>
            <div className="p-3 bg-muted/50 rounded-lg space-y-3">
              <div className="text-sm">Current Threshold: <span className="font-bold">{currentThreshold.toFixed(2)}</span></div>
              <Button onClick={handleAdjustment} disabled={isPending} className="w-full">
                {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                Get AI Suggestion
              </Button>
              {adjustedThreshold !== null && reason && (
                <div className="p-3 bg-primary/10 rounded-md border border-primary/20 space-y-3">
                  <p className="text-sm">Suggested Threshold: <span className="font-bold text-primary">{adjustedThreshold.toFixed(2)}</span></p>
                  <p className="text-xs italic text-muted-foreground">Reason: {reason}</p>
                  <Button onClick={applyAdjustment} size="sm" className="w-full">Apply Suggestion</Button>
                </div>
              )}
            </div>
        </div>

      </CardContent>
    </Card>
  );
}
