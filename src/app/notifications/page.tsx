"use client";

import { useStore } from "@/lib/store";
import { Bell, MessageSquare, CheckCircle2, UserPlus, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function NotificationsPage() {
    const { notifications, markAsRead, tasks, projects, allProfiles } = useStore();
    const router = useRouter();

    const handleNotificationClick = async (n: any) => {
        await markAsRead(n.id);
        if (n.taskId) {
            const task = tasks.find(t => t.id === n.taskId);
            const project = projects.find(p => p.id === task?.projectId);
            if (project) {
                router.push(`/${project.slug}/task/${n.taskId}`);
            }
        }
    };

    const getActorName = (actorId?: string) => {
        const profile = allProfiles.find(p => p.id === actorId);
        return profile?.name || "Someone";
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href="/">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                    </Button>
                    <div>
                        <h1 className="text-3xl font-black tracking-tight">Notifications</h1>
                        <p className="text-muted-foreground">Stay updated with your latest activities</p>
                    </div>
                </div>
                <div className="bg-primary/10 text-primary px-4 py-2 rounded-2xl border border-primary/20 text-sm font-bold">
                    {notifications.filter(n => !n.isRead).length} Unread
                </div>
            </div>

            <div className="grid gap-4">
                {notifications.length === 0 ? (
                    <div className="bg-card/50 border rounded-3xl p-12 text-center space-y-4">
                        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center mx-auto">
                            <Bell className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <div className="space-y-1">
                            <h3 className="font-bold">No notifications yet</h3>
                            <p className="text-sm text-muted-foreground">We'll let you know when something important happens.</p>
                        </div>
                    </div>
                ) : (
                    notifications.map((n) => {
                        const actorName = getActorName(n.actorId);
                        const task = n.taskId ? tasks.find(t => t.id === n.taskId) : null;

                        return (
                            <div
                                key={n.id}
                                onClick={() => handleNotificationClick(n)}
                                className={cn(
                                    "p-6 rounded-3xl border transition-all cursor-pointer group hover:bg-muted/30 relative",
                                    !n.isRead ? "bg-primary/5 border-primary/20 shadow-lg shadow-primary/5" : "bg-card border-border/50"
                                )}
                            >
                                <div className="flex gap-4">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner",
                                        n.type === 'comment' ? "bg-blue-500/10 text-blue-500" :
                                            n.type === 'assignment' ? "bg-green-500/10 text-green-500" :
                                                "bg-purple-500/10 text-purple-500"
                                    )}>
                                        {n.type === 'comment' ? <MessageSquare className="w-5 h-5" /> :
                                            n.type === 'assignment' ? <UserPlus className="w-5 h-5" /> :
                                                <Bell className="w-5 h-5" />}
                                    </div>
                                    <div className="flex-1 space-y-1.5 min-w-0">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className={cn("font-bold text-lg leading-tight", !n.isRead ? "text-foreground" : "text-muted-foreground group-hover:text-foreground")}>
                                                    {n.content}
                                                </p>
                                                {task && (
                                                    <p className="text-xs text-primary font-bold uppercase tracking-wider">
                                                        Task: {task.title}
                                                    </p>
                                                )}
                                            </div>
                                            <span className="text-xs text-muted-foreground/60 whitespace-nowrap bg-muted/50 px-2 py-1 rounded-lg">
                                                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <div className="w-1.5 h-1.5 rounded-full bg-primary/40" />
                                            <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-widest">
                                                By {actorName}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                                {!n.isRead && (
                                    <div className="absolute right-6 top-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-primary shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                                )}
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
