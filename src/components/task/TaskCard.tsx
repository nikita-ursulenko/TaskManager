import { Task } from "@/lib/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useStore } from "@/lib/store";
import { Badge } from "@/components/ui/badge";
import { Calendar, Paperclip, MessageSquare } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCardProps {
    task: Task;
    onClick: (task: Task) => void;
}

const statusColors = {
    'New': 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20',
    'In Progress': 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20',
    'Review': 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20',
    'Done': 'bg-green-500/10 text-green-500 hover:bg-green-500/20',
};

export function TaskCard({ task, onClick }: TaskCardProps) {
    const { allProfiles } = useStore();
    const assignee = allProfiles.find(p => p.id === task.assigneeId);

    return (
        <motion.div
            layoutId={task.id}
            onClick={() => onClick(task)}
            className="group p-5 rounded-xl border bg-card hover:bg-accent/50 hover:border-accent transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
            <div className="flex justify-between items-start mb-3">
                <span className="text-sm font-mono text-muted-foreground">#{task.id.slice(0, 4)}</span>
                <Badge variant="outline" className={cn("border-0 text-xs px-2 py-1", statusColors[task.status])}>
                    {task.status}
                </Badge>
            </div>

            <h3 className="font-semibold text-base mb-4 line-clamp-2 leading-snug">{task.title}</h3>

            <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-4">
                    {task.deadline && (
                        <div className="flex items-center gap-1.5">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(task.deadline).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</span>
                        </div>
                    )}
                    {(task.attachments.length > 0 || task.evidence) && (
                        <div className="flex items-center gap-1.5">
                            <Paperclip className="w-4 h-4" />
                            <span>{task.attachments.length + (task.evidence ? 1 : 0)}</span>
                        </div>
                    )}
                    {task.notes && (
                        <div className="flex items-center gap-1.5">
                            <MessageSquare className="w-4 h-4" />
                        </div>
                    )}
                </div>
                <div className="flex items-center gap-3">
                    {assignee && (
                        <div className="flex items-center gap-1.5 bg-muted/50 px-2 py-0.5 rounded-full text-[10px] font-bold border border-border/50">
                            <span className="text-primary opacity-70">EXE</span>
                            <span>{assignee.name.split(' ').map(n => n[0]).join('')}</span>
                        </div>
                    )}
                    <div className="font-bold text-foreground text-base">
                        {formatCurrency(task.budget)}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
