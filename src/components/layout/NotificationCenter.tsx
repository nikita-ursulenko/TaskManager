"use client";

import { useStore } from "@/lib/store";
import { Bell, Check, Circle, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { useRouter } from "next/navigation";

export function NotificationCenter({ onClose }: { onClose?: () => void }) {
    const { notifications, markAsRead, tasks, projects } = useStore();
    const router = useRouter();

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const handleNotificationClick = async (n: any) => {
        await markAsRead(n.id);
        if (n.taskId) {
            const task = tasks.find(t => t.id === n.taskId);
            const project = projects.find(p => p.id === task?.projectId);
            if (project) {
                router.push(`/${project.slug}/task/${n.taskId}`);
            }
        }
        if (onClose) onClose();
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 w-4 h-4 bg-primary text-[10px] font-bold text-primary-foreground rounded-full flex items-center justify-center border-2 border-background animate-pulse">
                            {unreadCount}
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0 bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl" align="end">
                <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{unreadCount} Unread</span>
                </div>
                <div className="max-h-[400px] overflow-y-auto">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center space-y-2">
                            <Bell className="w-8 h-8 text-muted/20 mx-auto" />
                            <p className="text-xs text-muted-foreground">All caught up!</p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            {notifications.slice(0, 5).map((n) => (
                                <button
                                    key={n.id}
                                    onClick={() => handleNotificationClick(n)}
                                    className={cn(
                                        "p-4 text-left hover:bg-muted/50 transition-colors border-b border-border/10 last:border-0 flex gap-3 group relative",
                                        !n.isRead && "bg-primary/5"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                                        n.type === 'comment' ? "bg-blue-500/10 text-blue-500" :
                                            n.type === 'assignment' ? "bg-green-500/10 text-green-500" :
                                                "bg-purple-500/10 text-purple-500"
                                    )}>
                                        {n.type === 'comment' ? <MessageSquare className="w-4 h-4" /> :
                                            n.type === 'assignment' ? <Bell className="w-4 h-4" /> :
                                                <Check className="w-4 h-4" />}
                                    </div>
                                    {(() => {
                                        const task = n.taskId ? tasks.find(t => t.id === n.taskId) : null;
                                        return (
                                            <div className="space-y-0.5 overflow-hidden">
                                                <p className={cn("text-xs leading-tight line-clamp-1", !n.isRead ? "text-foreground font-semibold" : "text-muted-foreground")}>
                                                    {task ? task.title : n.content}
                                                </p>
                                                <div className="flex items-center gap-2">
                                                    {n.taskId && (
                                                        <p className="text-[9px] text-primary font-bold uppercase shrink-0">
                                                            #{n.taskId.slice(0, 4)}
                                                        </p>
                                                    )}
                                                    <p className="text-[9px] text-muted-foreground/60 italic">
                                                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                                                    </p>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                    {!n.isRead && (
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-primary" />
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
                {notifications.length > 0 && (
                    <div className="p-3 border-t text-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-[10px] uppercase font-bold text-muted-foreground hover:text-primary w-full"
                            onClick={() => {
                                router.push('/notifications');
                                if (onClose) onClose();
                            }}
                        >
                            View All Notifications
                        </Button>
                    </div>
                )}
            </PopoverContent>
        </Popover>
    );
}
