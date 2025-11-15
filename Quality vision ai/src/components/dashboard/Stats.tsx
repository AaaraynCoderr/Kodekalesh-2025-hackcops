"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { InspectionResult } from "./Dashboard";
import { useMemo } from 'react';
import { Package, Percent, AlertTriangle } from "lucide-react";

interface StatsProps {
    inspectionLog: InspectionResult[];
}

export default function Stats({ inspectionLog }: StatsProps) {
    const { total, defects, defectRate, chartData } = useMemo(() => {
        const total = inspectionLog.length;
        const defects = inspectionLog.filter(item => item.status === 'Fail').length;
        const defectRate = total > 0 ? (defects / total) * 100 : 0;
        
        const groupedByProduct = inspectionLog.reduce((acc, item) => {
            if (!acc[item.productType]) {
                acc[item.productType] = { name: item.productType, inspections: 0, defects: 0 };
            }
            acc[item.productType].inspections += 1;
            if (item.status === 'Fail') {
                acc[item.productType].defects += 1;
            }
            return acc;
        }, {} as Record<string, {name: string, inspections: number, defects: number}>);

        return {
            total,
            defects,
            defectRate,
            chartData: Object.values(groupedByProduct),
        };
    }, [inspectionLog]);

    return (
        <div>
            <div className="grid gap-4 md:grid-cols-3 mb-6">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Inspections</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{total}</div>
                        <p className="text-xs text-muted-foreground">Total products scanned</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Defects Found</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{defects}</div>
                        <p className="text-xs text-muted-foreground">Total defects identified</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Defect Rate</CardTitle>
                        <Percent className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{defectRate.toFixed(1)}%</div>
                        <p className="text-xs text-muted-foreground">Overall defect percentage</p>
                    </CardContent>
                </Card>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Production Analysis</CardTitle>
                    <CardDescription>Breakdown of inspections and defects by product type.</CardDescription>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                            <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} />
                            <Tooltip
                                cursor={{ fill: 'hsl(var(--muted))' }}
                                contentStyle={{
                                    backgroundColor: "hsl(var(--card))",
                                    borderColor: "hsl(var(--border))",
                                    borderRadius: "var(--radius)",
                                }}
                            />
                            <Legend wrapperStyle={{fontSize: "0.8rem"}}/>
                            <Bar dataKey="inspections" fill="hsl(var(--primary))" name="Total Inspected" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="defects" fill="hsl(var(--destructive))" name="Defects Found" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    );
}
