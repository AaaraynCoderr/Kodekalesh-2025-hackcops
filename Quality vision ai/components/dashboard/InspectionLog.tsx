import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, Check, X } from "lucide-react";
import type { InspectionResult } from "./Dashboard";
import Image from "next/image";

interface InspectionLogProps {
  log: InspectionResult[];
}

export default function InspectionLog({ log }: InspectionLogProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <FileText className="h-6 w-6 text-primary" />
          <CardTitle>Inspection Log</CardTitle>
        </div>
        <CardDescription>History of recent product inspections.</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-96">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {log.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No inspections yet. Start by scanning a product.
                  </TableCell>
                </TableRow>
              )}
              {log.map(item => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-3">
                        <Image src={item.imageUrl} alt={item.productType} width={40} height={40} className="rounded-md object-cover border" />
                        <span className="truncate">{item.productType}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {item.status === 'Pass' ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900">
                        <Check className="mr-1 h-3 w-3" /> Pass
                      </Badge>
                    ) : (
                      <Badge variant="destructive" title={item.defectDescription}>
                        <X className="mr-1 h-3 w-3" /> Fail
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground text-xs">{item.timestamp}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
