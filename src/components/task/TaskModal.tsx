"use client";

import { useEffect, useState } from "react";
import { Task, TaskStatus, Role } from "@/lib/types";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, ExternalLink, Link as LinkIcon, Download, Check, Calendar, Trash2, AlertCircle, User as UserIcon, ShieldCheck, Eye } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn, formatCurrency } from "@/lib/utils";

interface TaskModalProps {
    task: Task | null;
    isOpen: boolean;
    onClose: () => void;
    role: Role;
}

const STATUS_OPTIONS: TaskStatus[] = ['New', 'In Progress', 'Review', 'Done'];

export function TaskModal({ task, isOpen, onClose, role }: TaskModalProps) {
    const { updateTask, deleteTask, projects, allProfiles } = useStore();
    const [editedTask, setEditedTask] = useState<Task | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        setEditedTask(task);
        setShowDeleteConfirm(false);
    }, [task]);

    if (!isOpen || !editedTask) return null;

    const handleSave = () => {
        if (editedTask) {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, createdAt, updatedAt, ...updates } = editedTask;
            updateTask(editedTask.id, updates);
            onClose();
        }
    };

    const handleDelete = async () => {
        await deleteTask(editedTask.id);
        onClose();
    };

    const generateReport = () => {
        const project = projects.find(p => p.id === editedTask.projectId)?.name || 'Unknown Project';
        const hasBlockers = editedTask.blockers && editedTask.blockers.trim().length > 0;

        const statusLabel = {
            'New': '🆕 New',
            'In Progress': '🚧 In Progress',
            'Review': '👀 Review',
            'Done': hasBlockers ? '⚠️ Done with note' : '✅ Done'
        }[editedTask.status];

        const report = `Task #${editedTask.id.slice(0, 4)} – ${project}\n\n` +
            `Status: ${statusLabel}\n` +
            `What was done: ${editedTask.notes || '-'}\n\n` +
            `Evidence: ${editedTask.evidence || '-'}\n\n` +
            `Notes / blockers: ${editedTask.blockers || '-'}\n\n` +
            `Payment: ${editedTask.budget} Euro`;

        navigator.clipboard.writeText(report);
        alert("Report copied to clipboard!");
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                    />
                    <motion.div
                        initial={{ opacity: 0, x: '100%' }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: '100%' }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="fixed inset-y-0 right-0 w-full max-w-lg bg-card border-l z-50 shadow-2xl overflow-y-auto"
                    >
                        <div className="p-6 space-y-6">
                            {/* Header */}
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <span className="text-xs font-mono text-muted-foreground">Task #{editedTask.id.slice(0, 4)}</span>
                                    <div className="mt-1">
                                        <input
                                            type="text"
                                            value={editedTask.title}
                                            onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                            className="bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none w-full text-2xl font-bold tracking-tight"
                                            placeholder="Task Title"
                                        />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setShowDeleteConfirm(true)}
                                        className="text-muted-foreground hover:text-destructive transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={onClose}>
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>

                            {/* Delete Confirmation Overlay (Inside Sidebar) */}
                            <AnimatePresence>
                                {showDeleteConfirm && (
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.95 }}
                                        className="bg-destructive/10 border border-destructive/20 p-4 rounded-xl flex flex-col gap-4"
                                    >
                                        <div className="flex gap-3">
                                            <AlertCircle className="w-5 h-5 text-destructive shrink-0" />
                                            <div>
                                                <h4 className="text-sm font-bold text-destructive">Delete Task?</h4>
                                                <p className="text-xs text-destructive/80">This action cannot be undone. All data will be permanently removed.</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(false)} className="h-8 text-xs">
                                                Cancel
                                            </Button>
                                            <Button variant="destructive" size="sm" onClick={handleDelete} className="h-8 text-xs">
                                                Delete Permanently
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Status Bar */}
                            <div className="flex items-center gap-4 bg-muted/30 p-4 rounded-xl border border-border/50">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 px-1">Status</label>
                                    <div className="flex flex-wrap gap-2">
                                        {STATUS_OPTIONS.map(status => (
                                            <button
                                                key={status}
                                                onClick={() => setEditedTask({ ...editedTask, status })}
                                                className={cn(
                                                    "px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all",
                                                    editedTask.status === status
                                                        ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                                        : "bg-background text-muted-foreground hover:bg-accent border-border/50"
                                                )}
                                            >
                                                {status}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 px-1">Budget</label>
                                    <div className="flex flex-col items-end gap-2 px-1">
                                        <div className="flex items-center gap-1.5 justify-end">
                                            <span className="text-muted-foreground font-medium">€</span>
                                            <input
                                                type="number"
                                                value={editedTask.budget}
                                                onChange={(e) => setEditedTask({ ...editedTask, budget: Number(e.target.value) })}
                                                className="bg-transparent w-24 text-right font-mono font-bold text-xl border-b border-transparent hover:border-border focus:border-primary focus:outline-none transition-colors"
                                            />
                                        </div>
                                        <label className="flex items-center gap-2 cursor-pointer group">
                                            <span className="text-[10px] font-bold text-muted-foreground group-hover:text-foreground transition-colors uppercase tracking-widest">Paid</span>
                                            <input
                                                type="checkbox"
                                                checked={editedTask.isPaid || false}
                                                onChange={(e) => setEditedTask({ ...editedTask, isPaid: e.target.checked })}
                                                className="accent-primary w-4 h-4 rounded-md border-border transition-all"
                                                disabled={role !== 'admin'} // Only admins can finalize payment
                                            />
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 px-1">Description</label>
                                <textarea
                                    value={editedTask.description}
                                    onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                    className="w-full h-32 bg-muted/20 border border-transparent hover:border-border focus:border-primary focus:bg-background rounded-xl p-4 text-sm transition-all focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                                    placeholder="Task requirements..."
                                />
                            </div>

                            {/* Roles Section */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-muted/10 p-4 rounded-xl border border-border/30">
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 px-1 flex items-center gap-1.5">
                                        <UserIcon className="w-3 h-3" />
                                        Исполнитель
                                    </label>
                                    <select
                                        value={editedTask.assigneeId || ""}
                                        onChange={(e) => setEditedTask({ ...editedTask, assigneeId: e.target.value || undefined })}
                                        disabled={role !== 'admin'}
                                        className="w-full bg-background border border-border/50 rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-primary outline-none disabled:opacity-70 transition-all font-sans"
                                    >
                                        <option value="">Не назначен</option>
                                        {allProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 px-1 flex items-center gap-1.5">
                                        <ShieldCheck className="w-3 h-3 text-primary" />
                                        Проверяющий
                                    </label>
                                    <select
                                        value={editedTask.reviewerId || ""}
                                        onChange={(e) => setEditedTask({ ...editedTask, reviewerId: e.target.value || undefined })}
                                        disabled={role !== 'admin'}
                                        className="w-full bg-background border border-border/50 rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-primary outline-none disabled:opacity-70 transition-all font-sans"
                                    >
                                        <option value="">Не назначен</option>
                                        {allProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1.5 px-1 flex items-center gap-1.5">
                                        <Eye className="w-3 h-3" />
                                        Смотрящий
                                    </label>
                                    <select
                                        value={editedTask.observerId || ""}
                                        onChange={(e) => setEditedTask({ ...editedTask, observerId: e.target.value || undefined })}
                                        disabled={role !== 'admin'}
                                        className="w-full bg-background border border-border/50 rounded-xl px-2 py-2 text-xs focus:ring-1 focus:ring-primary outline-none disabled:opacity-70 transition-all font-sans"
                                    >
                                        <option value="">Не назначен</option>
                                        {allProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Developer Section (Evidence & Notes) */}
                            <div className="border-t border-border/50 pt-6">
                                <h3 className="text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2 text-muted-foreground px-1">
                                    <Check className="w-4 h-4 text-primary" />
                                    Implementation
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 px-1">Evidence URL</label>
                                        <div className="flex gap-2">
                                            <div className="relative flex-1 group">
                                                <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                                <input
                                                    type="text"
                                                    value={editedTask.evidence || ''}
                                                    onChange={(e) => setEditedTask({ ...editedTask, evidence: e.target.value })}
                                                    className="w-full bg-muted/10 border border-transparent hover:border-border focus:border-primary focus:bg-background rounded-xl py-2.5 pl-10 pr-4 text-sm transition-all focus:outline-none"
                                                    placeholder="https://github.com/... or hosting link"
                                                />
                                            </div>
                                            {editedTask.evidence && (
                                                <Button size="icon" variant="outline" className="rounded-xl border-border/50" asChild>
                                                    <a href={editedTask.evidence} target="_blank" rel="noopener noreferrer">
                                                        <ExternalLink className="w-4 h-4" />
                                                    </a>
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    {editedTask.attachments && editedTask.attachments.length > 0 && (
                                        <div>
                                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 px-1">Attachments</label>
                                            <div className="grid grid-cols-2 gap-3 p-1">
                                                {editedTask.attachments.map((url, i) => (
                                                    <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="group relative aspect-video rounded-xl overflow-hidden border border-border/50 hover:border-primary transition-all">
                                                        <img src={url} alt="Attachment" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                            <ExternalLink className="w-5 h-5 text-white" />
                                                        </div>
                                                    </a>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 px-1">What was done</label>
                                        <textarea
                                            value={editedTask.notes || ''}
                                            onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                                            className="w-full h-24 bg-muted/10 border border-transparent hover:border-border focus:border-primary focus:bg-background rounded-xl p-4 text-sm transition-all focus:outline-none resize-none"
                                            placeholder="What was done..."
                                        />
                                    </div>

                                    <div>
                                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-2 px-1">Notes / Blockers</label>
                                        <textarea
                                            value={editedTask.blockers || ''}
                                            onChange={(e) => setEditedTask({ ...editedTask, blockers: e.target.value })}
                                            className="w-full h-24 bg-muted/10 border border-transparent hover:border-border focus:border-primary focus:bg-background rounded-xl p-4 text-sm transition-all focus:outline-none resize-none"
                                            placeholder="List blockers or additional notes..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex gap-3 pt-6 border-t border-border/50 sticky bottom-0 bg-card/80 backdrop-blur-md pb-6 z-10">
                                <Button className="flex-1 rounded-xl h-11 font-bold shadow-lg shadow-primary/20" onClick={handleSave}>
                                    Save Changes
                                </Button>
                                {role === 'dev' && (
                                    <Button variant="secondary" onClick={generateReport} className="rounded-xl h-11 font-bold">
                                        <Download className="w-4 h-4 mr-2" />
                                        Report
                                    </Button>
                                )}
                            </div>

                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
