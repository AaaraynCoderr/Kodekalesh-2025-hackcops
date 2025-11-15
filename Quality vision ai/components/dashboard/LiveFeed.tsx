"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Camera, ScanLine, Cpu, FileQuestion, Loader2, Video, VideoOff, BookImage, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { ProductInfo } from "./Dashboard";
import { AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '../ui/input';


interface LiveFeedProps {
  onInspect: (imageDataUri: string) => void;
  isInspecting: boolean;
  productInfo: ProductInfo;
  onAddReference: (imageDataUri: string) => void;
  referenceImageCount: number;
}

export default function LiveFeed({ onInspect, isInspecting, productInfo, onAddReference, referenceImageCount }: LiveFeedProps) {
  const { toast } = useToast();
  const liveVideoRef = useRef<HTMLVideoElement>(null);
  const uploadedVideoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [activeTab, setActiveTab] = useState('camera');
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [isFeedActive, setIsFeedActive] = useState(true);
  const [uploadedVideoUrl, setUploadedVideoUrl] = useState<string | null>(null);


  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        // Request permission and get a stream to enumerate devices
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoInputs = devices.filter(device => device.kind === 'videoinput');
        setVideoDevices(videoInputs);
        
        if (videoInputs.length > 0) {
            const preferredDeviceId = localStorage.getItem('preferredCameraId') || videoInputs[0].deviceId;
            setSelectedDeviceId(videoInputs.find(d => d.deviceId === preferredDeviceId) ? preferredDeviceId : videoInputs[0].deviceId);
        }
        
        // Stop the initial stream, we'll start a new one with the selected device
        stream.getTracks().forEach(track => track.stop());

      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this app.',
        });
      }
    };

    if (activeTab === 'camera') {
        getCameraPermission();
    }
  }, [toast, activeTab]);

  useEffect(() => {
    let stream: MediaStream | null = null;
    
    if (activeTab === 'camera' && selectedDeviceId && isFeedActive) {
      const constraints = {
        video: { deviceId: { exact: selectedDeviceId } }
      };
      navigator.mediaDevices.getUserMedia(constraints).then(s => {
        stream = s;
        if (liveVideoRef.current) {
          liveVideoRef.current.srcObject = stream;
        }
      }).catch(error => {
        console.error('Error switching camera:', error);
        toast({ variant: 'destructive', title: 'Camera Error', description: 'Could not switch to the selected camera.' });
      });
      
      // Store preference
      localStorage.setItem('preferredCameraId', selectedDeviceId);

    } else {
        // Stop stream if feed is not active or tab is changed
         if (liveVideoRef.current && liveVideoRef.current.srcObject) {
          (liveVideoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    }

    // Cleanup
    return () => {
        if (stream) {
            stream.getTracks().forEach(track => track.stop());
        }
    }
  }, [selectedDeviceId, isFeedActive, toast, activeTab]);

  const captureImage = (): string | null => {
    const videoEl = activeTab === 'camera' ? liveVideoRef.current : uploadedVideoRef.current;

    if (videoEl && canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = videoEl.videoWidth;
      canvas.height = videoEl.videoHeight;
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(videoEl, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg');
      }
    }
    return null;
  };

  const handleInspectClick = () => {
    const dataUri = captureImage();
    if (dataUri) {
      onInspect(dataUri);
    }
  };
  
  const handleAddReferenceClick = () => {
    const dataUri = captureImage();
    if (dataUri) {
      onAddReference(dataUri);
    }
  }

  const toggleFeed = () => setIsFeedActive(prev => !prev);
  
  const handleVideoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && uploadedVideoRef.current) {
      const url = URL.createObjectURL(file);
      setUploadedVideoUrl(url);
      uploadedVideoRef.current.src = url;
    }
  }

  const isActionDisabled = isInspecting || (activeTab === 'camera' && !isFeedActive) || (activeTab === 'video' && !uploadedVideoUrl);

  return (
    <Card className="overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div className="flex items-center gap-3">
          <Camera className="h-6 w-6 text-primary" />
          <CardTitle>Live Assembly Line Feed</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6 flex justify-between items-center">
                 <TabsList>
                    <TabsTrigger value="camera">Live Camera</TabsTrigger>
                    <TabsTrigger value="video">Upload Video</TabsTrigger>
                </TabsList>
                {activeTab === 'camera' && (
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={toggleFeed} title={isFeedActive ? "Stop Feed" : "Start Feed"}>
                        {isFeedActive ? <Video className="h-5 w-5"/> : <VideoOff className="h-5 w-5"/>}
                    </Button>
                    {videoDevices.length > 1 && (
                        <Select value={selectedDeviceId} onValueChange={setSelectedDeviceId} disabled={!isFeedActive}>
                            <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Select camera" />
                            </SelectTrigger>
                            <SelectContent>
                            {videoDevices.map(device => (
                                <SelectItem key={device.deviceId} value={device.deviceId}>{device.label || `Camera ${videoDevices.indexOf(device) + 1}`}</SelectItem>
                            ))}
                            </SelectContent>
                        </Select>
                    )}
                    <div className={`flex items-center gap-2 text-sm text-muted-foreground pt-1 ${hasCameraPermission === false ? 'text-red-500' : ''}`}>
                        <div className={`h-2 w-2 rounded-full ${isFeedActive && hasCameraPermission ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                        <span>{isFeedActive && hasCameraPermission ? 'CAM Online' : 'CAM Offline'}</span>
                    </div>
                </div>
                )}
            </div>

            <div className="relative aspect-video bg-muted mt-4">
                <TabsContent value="camera" className="m-0 h-full w-full">
                    {hasCameraPermission === null ? (
                      <div className="flex items-center justify-center h-full">
                          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : hasCameraPermission === false ? (
                      <div className="flex items-center justify-center h-full">
                        <Alert variant="destructive" className="w-auto">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Camera Access Required</AlertTitle>
                            <AlertDescription>
                                Please allow camera access to use this feature.
                            </AlertDescription>
                        </Alert>
                      </div>
                    ) : (
                        <>
                            <video ref={liveVideoRef} className={`w-full h-full object-cover ${isFeedActive ? '' : 'hidden'}`} autoPlay muted playsInline />
                            {!isFeedActive && (
                                <div className="w-full h-full flex items-center justify-center flex-col gap-2 text-muted-foreground">
                                    <VideoOff className="h-12 w-12" />
                                    <p>Video feed is off</p>
                                </div>
                            )}
                        </>
                    )}
                </TabsContent>
                <TabsContent value="video" className="m-0 h-full w-full">
                    {!uploadedVideoUrl ? (
                         <div className="w-full h-full flex items-center justify-center flex-col gap-4 text-muted-foreground">
                            <Upload className="h-12 w-12" />
                            <p>Upload a video to begin inspection</p>
                            <Button onClick={() => fileInputRef.current?.click()}>
                                Select Video File
                            </Button>
                            <Input ref={fileInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                        </div>
                    ) : null}
                    <video ref={uploadedVideoRef} className={`w-full h-full object-cover ${!uploadedVideoUrl ? 'hidden' : ''}`} controls autoPlay loop />

                </TabsContent>
                <canvas ref={canvasRef} className="hidden"></canvas>
            </div>
        </Tabs>
        <div className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Button onClick={handleAddReferenceClick} disabled={(activeTab === 'camera' && !isFeedActive) || (activeTab === 'video' && !uploadedVideoUrl)} size="lg" variant="outline">
                    <BookImage className="mr-2 h-5 w-5" />
                    Add Reference Image
                </Button>

                <Button onClick={handleInspectClick} disabled={isActionDisabled} size="lg">
                    {isInspecting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <ScanLine className="mr-2 h-5 w-5" />
                    )}
                    {isInspecting ? 'Analyzing...' : 'Scan Product'}
                </Button>
            </div>
             <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center justify-center p-4 bg-muted/50 rounded-lg">
                     <div className="flex items-center gap-3">
                        <BookImage className="h-6 w-6 text-muted-foreground" />
                        <div>
                            <p className="font-semibold">Reference Images</p>
                            <div className="text-sm text-muted-foreground">
                                <Badge variant={referenceImageCount > 0 ? "default" : "secondary"}>{referenceImageCount} images</Badge> for baseline
                            </div>
                        </div>
                    </div>
                </div>
                
                <Card className="flex items-center p-4 bg-muted/50">
                    {isInspecting && !productInfo ? (
                        <div className="flex items-center gap-3 animate-pulse">
                            <FileQuestion className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Identifying Product...</p>
                                <p className="text-sm text-muted-foreground">Please wait.</p>
                            </div>
                        </div>
                    ) : productInfo ? (
                        <div className="flex items-center gap-3">
                            <Cpu className="h-6 w-6 text-primary" />
                            <div>
                                <p className="font-semibold">{productInfo.productType}</p>
                                <p className="text-sm text-muted-foreground truncate" title={productInfo.productDetails}>
                                    {productInfo.productDetails}
                                </p>
                            </div>
                        </div>
                    ) : (
                       <div className="flex items-center gap-3">
                            <FileQuestion className="h-6 w-6 text-muted-foreground" />
                            <div>
                                <p className="font-semibold">Awaiting Scan</p>
                                <p className="text-sm text-muted-foreground">Press button to identify.</p>
                            </div>
                        </div>
                    )}
                </Card>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}

    
