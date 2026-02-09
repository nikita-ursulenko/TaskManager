"use client";

import { useStore } from "@/lib/store";
import { formatCurrency, cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowUpRight, CheckCircle2, Circle, Clock, LayoutDashboard, Folder, Wallet, Receipt, CreditCard, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function DashboardPage() {
  const { tasks, projects, currentUser } = useStore();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  const totalTasks = tasks.length;
  const doneTasks = tasks.filter(t => t.status === 'Done').length;
  const pendingTasks = tasks.filter(t => t.status !== 'Done').length;
  const recentTasks = [...tasks].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()).slice(0, 5);

  const isAdmin = currentUser.role === 'admin';

  // Admin Metrics
  const totalExpenses = tasks.reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalPaid = tasks.filter(t => t.isPaid).reduce((sum, t) => sum + (t.budget || 0), 0);
  const totalDebt = tasks.filter(t => !t.isPaid).reduce((sum, t) => sum + (t.budget || 0), 0);
  const unpaidDoneCount = tasks.filter(t => t.status === 'Done' && !t.isPaid).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight mb-2">Welcome back, {currentUser.name.split(' ')[0]}</h1>
        <p className="text-lg text-muted-foreground">Here's what's happening across your projects today.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Task Stats */}
        <Card className="relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Tasks</CardTitle>
            <Circle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{pendingTasks}</div>
            <p className="text-xs text-muted-foreground mt-1">across {projects.length} projects</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{doneTasks}</div>
            <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 transition-all duration-500"
                  style={{ width: `${totalTasks > 0 ? (doneTasks / totalTasks) * 100 : 0}%` }}
                />
              </div>
              {totalTasks > 0 ? Math.round((doneTasks / totalTasks) * 100) : 0}% rate
            </div>
          </CardContent>
        </Card>

        {/* Financial Stats */}
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Wallet className="w-12 h-12" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isAdmin ? 'Total Expenses' : 'Total Budget'}</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground mt-1">overall financial volume</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <AlertCircle className="w-12 h-12 text-destructive" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isAdmin ? 'Total Debt' : 'Outstanding'}</CardTitle>
            <CreditCard className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-destructive">{formatCurrency(totalDebt)}</div>
            <p className="text-xs text-muted-foreground mt-1">{isAdmin ? 'to be paid' : 'expected income'}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Receipt className="w-12 h-12 text-green-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isAdmin ? 'Total Paid' : 'Received'}</CardTitle>
            <Receipt className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{formatCurrency(totalPaid)}</div>
            <p className="text-xs text-muted-foreground mt-1">{isAdmin ? 'transferred to devs' : 'already in pocket'}</p>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden group border-orange-500/20 bg-orange-500/5">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform">
            <Clock className="w-12 h-12 text-orange-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{isAdmin ? 'Ready to Pay' : 'Ready for Payment'}</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-500">{unpaidDoneCount}</div>
            <p className="text-xs text-muted-foreground mt-1">completed but unpaid tasks</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              You have {pendingTasks} tasks remaining across {projects.length} projects.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTasks.map(task => {
                const project = projects.find(p => p.id === task.projectId);
                return (
                  <div key={task.id} className="flex items-center justify-between p-2 hover:bg-muted/50 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <div className={cn("w-2 h-2 rounded-full", {
                        'bg-blue-500': task.status === 'New',
                        'bg-yellow-500': task.status === 'In Progress',
                        'bg-purple-500': task.status === 'Review',
                        'bg-green-500': task.status === 'Done'
                      })} />
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none">{task.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span className="font-mono text-xs">#{task.id.slice(0, 4)}</span>
                          <span>•</span>
                          <span>{project?.name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn("text-sm font-bold", task.isPaid ? "text-green-500" : "text-destructive")}>
                        {formatCurrency(task.budget)}
                      </p>
                      <Badge variant="outline" className={cn("text-[10px] uppercase font-bold px-1.5 py-0", {
                        'border-green-500/50 text-green-500 bg-green-500/5': task.isPaid,
                        'border-destructive/50 text-destructive bg-destructive/5': !task.isPaid && task.status === 'Done',
                        'border-muted text-muted-foreground': !task.isPaid && task.status !== 'Done'
                      })}>
                        {task.isPaid ? 'Paid' : (task.status === 'Done' ? 'Unpaid' : 'Pending')}
                      </Badge>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Projects</CardTitle>
            <CardDescription>
              Quick access to your workspaces.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projects.map(project => {
                const count = tasks.filter(t => t.projectId === project.id && t.status !== 'Done').length;
                return (
                  <Link
                    key={project.id}
                    href={`/${project.slug}`}
                    className="flex items-center justify-between p-4 rounded-xl border bg-card hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Folder className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{project.name}</p>
                        <p className="text-xs text-muted-foreground">workspace</p>
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {count} active
                    </Badge>
                  </Link>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
