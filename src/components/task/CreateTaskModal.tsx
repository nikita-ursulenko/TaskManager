"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { X, ClipboardList, User as UserIcon, ShieldCheck, Eye, Plus, Trash2, Link as LinkIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Attachment } from "@/lib/types";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export function CreateTaskModal({ isOpen, onClose, projectId }: CreateTaskModalProps) {
    const { addTask, allProfiles, tasks } = useStore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState<number>(0);
    const [assigneeId, setAssigneeId] = useState<string>("");
    const [reviewerId, setReviewerId] = useState<string>("");
    const [observerId, setObserverId] = useState<string>("");
    const [attachments, setAttachments] = useState<Attachment[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const addAttachmentRow = () => {
        setAttachments([...attachments, { name: `Attachment ${attachments.length + 1}`, url: "" }]);
    };

    const updateAttachment = (index: number, field: keyof Attachment, value: string) => {
        const newAttachments = [...attachments];
        newAttachments[index] = { ...newAttachments[index], [field]: value };
        setAttachments(newAttachments);
    };

    const removeAttachment = (index: number) => {
        setAttachments(attachments.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        const newColumnTasks = tasks.filter(t => t.projectId === projectId && t.status === 'New');
        const maxPos = newColumnTasks.length > 0 ? Math.max(...newColumnTasks.map(t => t.position)) : 0;

        try {
            await addTask({
                projectId,
                title,
                description,
                budget,
                status: 'New',
                position: maxPos + 1024,
                attachments,
                executionAttachments: [],
                evidence: "",
                notes: "",
                isPaid: false,
                assigneeId: assigneeId || undefined,
                reviewerId: reviewerId || undefined,
                observerId: observerId || undefined
            });
            setTitle("");
            setDescription("");
            setBudget(0);
            setAttachments([]);
            setAssigneeId("");
            setReviewerId("");
            setObserverId("");
            onClose();
        } catch (error) {
            console.error("Failed to create task:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[101] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="w-full max-w-lg bg-card border shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <ClipboardList className="w-6 h-6 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold tracking-tight">New Task</h2>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                                            Task Title
                                        </label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            placeholder="What needs to be done?"
                                            className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-base transition-all outline-none"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="flex-1">
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                                                Budget (€)
                                            </label>
                                            <input
                                                type="number"
                                                value={budget || ""}
                                                onChange={(e) => setBudget(Number(e.target.value))}
                                                placeholder="0.00"
                                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-base transition-all outline-none font-mono"
                                                disabled={isSubmitting}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                                <UserIcon className="w-3.5 h-3.5" />
                                                Executor
                                            </label>
                                            <select
                                                value={assigneeId}
                                                onChange={(e) => setAssigneeId(e.target.value)}
                                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-sm transition-all outline-none font-sans"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Unassigned</option>
                                                {allProfiles.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Reviewer
                                            </label>
                                            <select
                                                value={reviewerId}
                                                onChange={(e) => setReviewerId(e.target.value)}
                                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-sm transition-all outline-none font-sans"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Unassigned</option>
                                                {allProfiles.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" />
                                                Observer
                                            </label>
                                            <select
                                                value={observerId}
                                                onChange={(e) => setObserverId(e.target.value)}
                                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-sm transition-all outline-none font-sans"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Unassigned</option>
                                                {allProfiles.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center justify-between">
                                            <span>Attachments</span>
                                            <button
                                                type="button"
                                                onClick={addAttachmentRow}
                                                className="text-[10px] text-primary hover:underline font-bold flex items-center gap-1"
                                            >
                                                <Plus className="w-3 h-3" /> Add Attachment
                                            </button>
                                        </label>
                                        <div className="space-y-2 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                                            {attachments.map((att, index) => (
                                                <div key={index} className="flex gap-2 items-center bg-muted/20 p-2 rounded-xl border border-white/5">
                                                    <input
                                                        type="text"
                                                        value={att.name}
                                                        onChange={(e) => updateAttachment(index, 'name', e.target.value)}
                                                        className="w-1/3 bg-transparent border-0 focus:ring-0 text-[11px] font-bold outline-none"
                                                        placeholder="Name"
                                                    />
                                                    <div className="flex-1 relative flex items-center">
                                                        <LinkIcon className="absolute left-2 w-3 h-3 text-muted-foreground" />
                                                        <input
                                                            type="text"
                                                            value={att.url}
                                                            onChange={(e) => updateAttachment(index, 'url', e.target.value)}
                                                            className="w-full bg-background/50 border-0 focus:ring-0 text-[11px] outline-none rounded-lg pl-6 py-1"
                                                            placeholder="URL"
                                                        />
                                                    </div>
                                                    <button
                                                        type="button"
                                                        onClick={() => removeAttachment(index)}
                                                        className="text-muted-foreground hover:text-destructive p-1"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            ))}
                                            {attachments.length === 0 && (
                                                <div className="text-[10px] text-muted-foreground italic text-center py-2 opacity-50">
                                                    No attachments added yet
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
                                            Description
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Provide more details about the task..."
                                            className="w-full h-32 bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-base transition-all outline-none resize-none"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div className="flex gap-3 pt-4">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="flex-1 rounded-xl"
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 rounded-xl"
                                            disabled={!title.trim() || isSubmitting}
                                        >
                                            {isSubmitting ? "Publishing..." : "Publish Task"}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
