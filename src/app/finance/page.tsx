"use client";

import { useStore } from "@/lib/store";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useEffect, useState } from "react";
import { TrendingUp, Clock, CheckCircle2 } from "lucide-react";

export default function FinancePage() {
    const { tasks } = useStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    const doneTasks = tasks.filter(t => t.status === 'Done');
    const totalPaid = doneTasks.filter(t => t.isPaid).reduce((acc, t) => acc + t.budget, 0);
    const totalPending = doneTasks.filter(t => !t.isPaid).reduce((acc, t) => acc + t.budget, 0);
    const totalEarned = totalPaid + totalPending;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Finance Dashboard</h1>
                <p className="text-muted-foreground">Overview of earnings and payments.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-card/50 backdrop-blur-sm border-muted/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalEarned)}</div>
                        <p className="text-xs text-muted-foreground">
                            Across {doneTasks.length} completed tasks
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-green-500/5 border-green-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-green-500">Paid</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">{formatCurrency(totalPaid)}</div>
                        <p className="text-xs text-green-500/80">
                            Already processed
                        </p>
                    </CardContent>
                </Card>

                <Card className="bg-yellow-500/5 border-yellow-500/20">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-yellow-500">Pending Payment</CardTitle>
                        <Clock className="h-4 w-4 text-yellow-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-yellow-500">{formatCurrency(totalPending)}</div>
                        <p className="text-xs text-yellow-500/80">
                            Completed tasks awaiting payment
                        </p>
                    </CardContent>
                </Card>
            </div>

            <div className="rounded-md border bg-card">
                <div className="p-4 border-b">
                    <h3 className="font-semibold text-sm">Recent Transactions</h3>
                </div>
                <div className="divide-y relative max-h-[400px] overflow-y-auto">
                    {doneTasks.length === 0 ? (
                        <div className="p-8 text-center text-muted-foreground text-sm">No completed tasks yet.</div>
                    ) : (
                        doneTasks.map(task => (
                            <div key={task.id} className="p-4 flex items-center justify-between hover:bg-muted/50 transition-colors">
                                <div>
                                    <div className="font-medium text-sm">{task.title}</div>
                                    <div className="text-xs text-muted-foreground flex items-center gap-2">
                                        <span>#{task.id.slice(0, 4)}</span>
                                        <span>•</span>
                                        <span>{new Date(task.updatedAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <Badge variant={task.isPaid ? 'success' : 'warning'}>
                                        {task.isPaid ? 'PAID' : 'PENDING'}
                                    </Badge>
                                    <span className="font-mono font-bold w-20 text-right">
                                        {formatCurrency(task.budget)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
