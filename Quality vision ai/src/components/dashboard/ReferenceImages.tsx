"use client";

import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookImage, X, Upload } from "lucide-react";
import { ScrollArea } from "../ui/scroll-area";
import React, { useRef } from "react";
import { Input } from "../ui/input";
import { useToast } from "@/hooks/use-toast";


interface ReferenceImagesProps {
  images: string[];
  onRemove: (index: number) => void;
  onAdd: (imageDataUri: string) => void;
}

export default function ReferenceImages({ images, onRemove, onAdd }: ReferenceImagesProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUri = e.target?.result as string;
          if (dataUri) {
            onAdd(dataUri);
          }
        };
        reader.readAsDataURL(file);
      } else {
        toast({
            variant: "destructive",
            title: "Invalid File Type",
            description: "Please upload an image file.",
        });
      }
    }
     // Reset file input to allow uploading the same file again
    if(fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
            <BookImage className="h-6 w-6 text-primary" />
            <CardTitle>Reference Images</CardTitle>
            </div>
            <Button variant="outline" size="sm" onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4" />
                Upload
            </Button>
            <Input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*"
                onChange={handleFileChange}
            />
        </div>
        <CardDescription>
            These are the "golden standard" images for quality checks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-48">
            {images.length === 0 ? (
            <div className="text-center text-muted-foreground py-10">
                <p>No reference images added yet.</p>
                <p className="text-xs">Use the "Add Reference Image" or "Upload" button.</p>
            </div>
            ) : (
            <div className="grid grid-cols-3 gap-4">
                {images.map((src, index) => (
                <div key={index} className="relative group">
                    <Image
                        src={src}
                        alt={`Reference ${index + 1}`}
                        width={100}
                        height={100}
                        className="rounded-md object-cover w-full aspect-square"
                    />
                    <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => onRemove(index)}
                    >
                    <X className="h-4 w-4" />
                    </Button>
                </div>
                ))}
            </div>
            )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
