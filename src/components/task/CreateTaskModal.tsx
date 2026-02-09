"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { X, ClipboardList, User as UserIcon, ShieldCheck, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CreateTaskModalProps {
    isOpen: boolean;
    onClose: () => void;
    projectId: string;
}

export function CreateTaskModal({ isOpen, onClose, projectId }: CreateTaskModalProps) {
    const { addTask, allProfiles } = useStore();
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [budget, setBudget] = useState<number>(0);
    const [assigneeId, setAssigneeId] = useState<string>("");
    const [reviewerId, setReviewerId] = useState<string>("");
    const [observerId, setObserverId] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim()) return;

        setIsSubmitting(true);
        try {
            await addTask({
                projectId,
                title,
                description,
                budget,
                status: 'New',
                attachments: [],
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
                                                Исполнитель
                                            </label>
                                            <select
                                                value={assigneeId}
                                                onChange={(e) => setAssigneeId(e.target.value)}
                                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-sm transition-all outline-none font-sans"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Не назначен</option>
                                                {allProfiles.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                                <ShieldCheck className="w-3.5 h-3.5" />
                                                Проверяющий
                                            </label>
                                            <select
                                                value={reviewerId}
                                                onChange={(e) => setReviewerId(e.target.value)}
                                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-sm transition-all outline-none font-sans"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Не назначен</option>
                                                {allProfiles.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                                                <Eye className="w-3.5 h-3.5" />
                                                Смотрящий
                                            </label>
                                            <select
                                                value={observerId}
                                                onChange={(e) => setObserverId(e.target.value)}
                                                className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-3 py-2 text-sm transition-all outline-none font-sans"
                                                disabled={isSubmitting}
                                            >
                                                <option value="">Не назначен</option>
                                                {allProfiles.map(p => (
                                                    <option key={p.id} value={p.id}>{p.name}</option>
                                                ))}
                                            </select>
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
