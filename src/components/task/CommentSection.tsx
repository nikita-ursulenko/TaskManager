"use client";

import { useState, useRef, useEffect } from "react";
import { useStore } from "@/lib/store";
import { User, MessageSquare, Send, CornerDownRight, Reply, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import { Comment } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";

export function CommentSection({ taskId }: { taskId: string }) {
    const { comments, allProfiles, addComment, currentUser } = useStore();
    const [newComment, setNewComment] = useState("");
    const [replyTo, setReplyTo] = useState<Comment | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Grouping logic: Root comments and their immediate replies
    const taskComments = comments.filter(c => c.taskId === taskId);

    // Sort comments by date to ensure consistent order (Oldest first)
    const sortedComments = [...taskComments].sort((a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    const rootComments = sortedComments.filter(c => !c.parentId);

    // Map replies to parents
    const repliesMap = sortedComments.reduce((acc, comment) => {
        if (comment.parentId) {
            if (!acc[comment.parentId]) acc[comment.parentId] = [];
            acc[comment.parentId].push(comment);
        }
        return acc;
    }, {} as Record<string, Comment[]>);

    const handleReplyClick = (comment: Comment) => {
        setReplyTo(comment);
        textareaRef.current?.focus();
        textareaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            await addComment(taskId, newComment, replyTo?.id);
            setNewComment("");
            setReplyTo(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderComment = (comment: Comment, depth = 0) => {
        const author = allProfiles.find(p => p.id === comment.userId);
        const isMe = comment.userId === currentUser.id;
        const authorInitials = author?.name.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
        const itemReplies = repliesMap[comment.id] || [];

        // Find parent for the "reply to" hint
        const parentComment = comment.parentId ? sortedComments.find(c => c.id === comment.parentId) : null;
        const parentAuthor = parentComment ? allProfiles.find(p => p.id === parentComment.userId) : null;

        return (
            <div key={comment.id} className={cn("space-y-4", depth > 0 && "mt-2")}>
                <div className={cn(
                    "flex gap-3 items-start",
                    isMe ? "flex-row-reverse" : "flex-row"
                )}>
                    {/* User Avatar */}
                    <div className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-[10px] font-bold shadow-sm mt-1",
                        isMe ? "bg-primary/20 border-primary/30 text-primary" : "bg-muted/30 border-border/50 text-muted-foreground"
                    )}>
                        {authorInitials}
                    </div>

                    <div className={cn(
                        "max-w-[75%] md:max-w-[85%] flex flex-col group min-w-0",
                        isMe ? "items-end" : "items-start"
                    )}>
                        {/* Meta info above bubble */}
                        <div className={cn(
                            "flex items-center gap-2 px-1 mb-1",
                            isMe ? "flex-row-reverse" : "flex-row"
                        )}>
                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                {author?.name || comment.userName || 'Unknown'}
                            </span>
                            <span className="text-[10px] text-muted-foreground/60 italic">
                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                            </span>
                        </div>

                        {/* Message Bubble */}
                        <div className={cn(
                            "p-4 rounded-2xl text-sm leading-relaxed relative border shadow-sm transition-all break-words break-all overflow-hidden min-w-0",
                            isMe
                                ? "bg-primary text-primary-foreground border-primary/20 rounded-tr-none"
                                : "bg-card border-border/50 rounded-tl-none"
                        )}>
                            {/* Visual Reply Context inside the bubble if it's a child */}
                            {parentComment && (
                                <div className={cn(
                                    "mb-2 p-2 rounded-lg text-[10px] border-l-2 flex flex-col gap-1",
                                    isMe
                                        ? "bg-black/10 border-white/20 text-white/80"
                                        : "bg-muted/50 border-primary/30 text-muted-foreground"
                                )}>
                                    <span className="font-bold flex items-center gap-1">
                                        <Reply className="w-2 h-2" />
                                        {parentAuthor?.name || 'User'}
                                    </span>
                                    <span className="italic truncate line-clamp-1 opacity-70">
                                        {parentComment.content}
                                    </span>
                                </div>
                            )}

                            <div className="whitespace-pre-wrap break-words break-all">{comment.content}</div>

                            {/* Reply Button (Only on main level or limited depth) */}
                            {depth < 2 && (
                                <button
                                    onClick={() => handleReplyClick(comment)}
                                    className={cn(
                                        "absolute -bottom-6 flex items-center gap-1 text-[9px] font-bold uppercase tracking-widest hover:text-primary transition-all opacity-0 group-hover:opacity-100 bg-background/50 backdrop-blur-sm px-2 py-1 rounded-md border border-border/10",
                                        isMe ? "right-0" : "left-0"
                                    )}
                                >
                                    <Reply className="w-3 h-3" />
                                    Reply
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sub-replies (RENDERED BELOW PARENT) */}
                {itemReplies.length > 0 && (
                    <div className={cn(
                        "space-y-4 pt-2 border-l-2 border-primary/10 pl-4",
                        isMe ? "mr-2 md:mr-12" : "ml-2 md:ml-12"
                    )}>
                        {itemReplies.map(reply => renderComment(reply, depth + 1))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-8 pt-8 border-t border-border/50">
            <div className="flex items-center gap-3 px-1">
                <div className="flex items-center justify-center w-10 h-10 rounded-2xl bg-primary/10 text-primary">
                    <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-sm font-bold uppercase tracking-widest">Discussion</h3>
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">{taskComments.length} Messages</p>
                </div>
            </div>

            <div className="flex flex-col gap-12">
                {rootComments.length === 0 ? (
                    <div className="text-center py-16 bg-muted/5 rounded-3xl border border-dashed border-border/50">
                        <MessageSquare className="w-8 h-8 text-muted/20 mx-auto mb-3" />
                        <p className="text-sm text-muted-foreground italic">No comments yet. Start the conversation!</p>
                    </div>
                ) : (
                    <div className="space-y-12">
                        {rootComments.map(comment => renderComment(comment))}
                    </div>
                )}

                {/* Sticky Input Area */}
                <div className="sticky bottom-0 z-20 pb-safe bg-background/95 backdrop-blur-xl p-2 md:p-0">
                    <AnimatePresence>
                        {replyTo && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden"
                            >
                                <div className="flex items-center justify-between bg-primary/10 px-4 py-3 rounded-2xl text-xs border border-primary/20 mb-2 mx-2 md:mx-0">
                                    <div className="flex items-center gap-3">
                                        <CornerDownRight className="w-4 h-4 text-primary" />
                                        <div className="flex flex-col">
                                            <span className="text-[9px] text-muted-foreground uppercase font-extrabold tracking-tighter">Replying to</span>
                                            <span className="font-bold text-primary">{allProfiles.find(p => p.id === replyTo.userId)?.name || replyTo.userName || 'User'}</span>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setReplyTo(null)}
                                        className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="relative">
                        <textarea
                            ref={textareaRef}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder={replyTo ? "Write your reply..." : "Share your thoughts..."}
                            className="w-full bg-muted/20 border border-transparent focus:border-primary/30 focus:bg-background rounded-2xl p-4 md:p-5 pr-14 md:pr-16 text-sm transition-all focus:outline-none resize-none min-h-[60px] md:min-h-[120px] shadow-inner leading-relaxed"
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && !e.shiftKey) {
                                    e.preventDefault();
                                    handleSubmit(e);
                                }
                            }}
                        />
                        <Button
                            type="submit"
                            size="icon"
                            disabled={!newComment.trim() || isSubmitting}
                            className={cn(
                                "absolute right-2 bottom-2 md:right-4 md:bottom-4 w-10 h-10 md:w-12 md:h-12 rounded-xl shadow-xl transition-all active:scale-90 neon-glow",
                                isSubmitting && "opacity-50"
                            )}
                        >
                            <Send className="w-4 h-4 md:w-5 md:h-5" />
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
}
