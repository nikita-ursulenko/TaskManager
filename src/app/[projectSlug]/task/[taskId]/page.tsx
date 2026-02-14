"use client";

import { use, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Task, TaskStatus } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    ChevronLeft,
    ExternalLink,
    Link as LinkIcon,
    Download,
    Check,
    Trash2,
    AlertCircle,
    User as UserIcon,
    ShieldCheck,
    Eye,
    Save,
    FileText,
    Terminal,
    Plus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn, formatCurrency } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { CommentSection } from "@/components/task/CommentSection";
import { Attachment } from "@/lib/types";

interface TaskPageProps {
    params: Promise<{ projectSlug: string; taskId: string }>;
}

const STATUS_OPTIONS: TaskStatus[] = ['New', 'In Progress', 'Review', 'Done'];

export default function TaskPage({ params }: TaskPageProps) {
    const { projectSlug, taskId } = use(params);
    const router = useRouter();
    const { tasks, projects, allProfiles, currentUser, updateTask, deleteTask } = useStore();

    const [editedTask, setEditedTask] = useState<Task | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const task = tasks.find(t => t.id === taskId);
    const project = projects.find(p => p.slug === projectSlug);

    useEffect(() => {
        if (task) {
            setEditedTask(task);
        }
    }, [task]);

    if (!task || !project) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <p className="text-muted-foreground">Task or project not found</p>
                <Button variant="outline" onClick={() => router.push(`/${projectSlug}`)}>
                    <ChevronLeft className="w-4 h-4 mr-2" />
                    Back to Project
                </Button>
            </div>
        );
    }

    if (!editedTask) return null;

    const handleSave = async () => {
        if (editedTask) {
            setIsSaving(true);
            try {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, createdAt, updatedAt, ...updates } = editedTask;
                await updateTask(editedTask.id, updates);
            } finally {
                setIsSaving(false);
            }
        }
    };

    const handleDelete = async () => {
        await deleteTask(editedTask.id);
        router.push(`/${projectSlug}`);
    };

    const generateReport = () => {
        const hasBlockers = editedTask.blockers && editedTask.blockers.trim().length > 0;
        const statusLabel = {
            'New': '🆕 New',
            'In Progress': '🚧 In Progress',
            'Review': '👀 Review',
            'Done': hasBlockers ? '⚠️ Done with note' : '✅ Done'
        }[editedTask.status];

        const reqStr = editedTask.attachments?.length
            ? '\n\nAttachments:\n' + editedTask.attachments.map(a => `• ${a.name}: ${a.url || 'No URL'}`).join('\n')
            : '';

        const execStr = editedTask.executionAttachments?.length
            ? '\n\nExecution Attachments:\n' + editedTask.executionAttachments.map(a => `• ${a.name}: ${a.url || 'No URL'}`).join('\n')
            : '';

        const report = `Task #${editedTask.id.slice(0, 4)} – ${project.name}\n\n` +
            `Status: ${statusLabel}\n` +
            `What was done: ${editedTask.notes || '-'}\n\n` +
            `Evidence: ${editedTask.evidence || '-'}${reqStr}${execStr}\n\n` +
            `Notes / blockers: ${editedTask.blockers || '-'}\n\n` +
            `Payment: ${editedTask.budget} Euro`;

        navigator.clipboard.writeText(report);
        alert("Report copied to clipboard!");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto space-y-8 pb-32 px-4"
        >
            {/* Navigation Header */}
            <div className="flex items-center justify-between">
                <Button
                    variant="ghost"
                    onClick={() => router.push(`/${projectSlug}`)}
                    className="hover:text-primary transition-colors pl-0"
                >
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back to {project.name}
                </Button>

                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                    >
                        <Trash2 className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="neon-glow"
                    >
                        {isSaving ? "Saving..." : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="bg-destructive/10 border border-destructive/20 p-6 rounded-2xl flex flex-col gap-4"
                >
                    <div className="flex gap-4">
                        <AlertCircle className="w-6 h-6 text-destructive shrink-0" />
                        <div>
                            <h4 className="text-lg font-bold text-destructive">Delete this task?</h4>
                            <p className="text-sm text-destructive/80">This action is permanent and will remove all task data, evidence, and history.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 justify-end">
                        <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                            Delete Permanently
                        </Button>
                    </div>
                </motion.div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-12">

                    {/* SECTION: REQUIREMENTS */}
                    <section className="space-y-6">
                        <div className="space-y-2">
                            <span className="text-xs font-mono text-muted-foreground uppercase tracking-widest">Task ID: {editedTask.id}</span>
                            <input
                                type="text"
                                value={editedTask.title}
                                onChange={(e) => setEditedTask({ ...editedTask, title: e.target.value })}
                                className="bg-transparent border-b border-transparent hover:border-border focus:border-primary focus:outline-none w-full text-4xl font-extrabold tracking-tight transition-all"
                                placeholder="Task Title"
                            />
                        </div>

                        <div className="bg-muted/5 border border-border/50 rounded-3xl p-8 space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                                <FileText className="w-24 h-24" />
                            </div>

                            <div className="flex items-center gap-2 px-1 relative">
                                <FileText className="w-4 h-4 text-primary" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Requirements & Context</h3>

                                {/* Linkable Attachments Shortcuts */}
                                <div className="ml-auto flex gap-2">
                                    {editedTask.attachments?.map((att, i) => (
                                        <button
                                            key={i}
                                            type="button"
                                            onClick={() => {
                                                const tag = `[${att.name}]`;
                                                setEditedTask({ ...editedTask, description: editedTask.description + (editedTask.description ? '\n' : '') + tag });
                                            }}
                                            className="text-[9px] bg-primary/10 hover:bg-primary/20 text-primary px-2 py-0.5 rounded-full border border-primary/20 transition-all font-bold"
                                            title="Click to add reference to description"
                                        >
                                            + {att.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <textarea
                                value={editedTask.description}
                                onChange={(e) => setEditedTask({ ...editedTask, description: e.target.value })}
                                className="w-full h-48 bg-transparent border-0 focus:ring-0 text-lg transition-all focus:outline-none resize-none leading-relaxed px-0"
                                placeholder="What needs to be done? List requirements and expectations..."
                            />

                            {/* RESOURCES LIST AT THE END OF DESCRIPTION */}
                            {editedTask.attachments && editedTask.attachments.length > 0 && (
                                <div className="mt-8 pt-8 border-t border-border/50 space-y-4">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <LinkIcon className="w-3.5 h-3.5 text-primary" />
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Attachments</h4>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newAtts = [...(editedTask.attachments || [])];
                                                newAtts.push({ name: `Attachment ${newAtts.length + 1}`, url: '' });
                                                setEditedTask({ ...editedTask, attachments: newAtts });
                                            }}
                                            className="text-[9px] text-primary hover:underline font-extrabold uppercase tracking-tighter"
                                        >
                                            + Add Attachment
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {editedTask.attachments.map((att, i) => (
                                            <div key={i} className="flex gap-2 items-center bg-background/40 border border-border/30 p-3 rounded-2xl group transition-all hover:border-primary/30 hover:bg-background/60">
                                                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                                    <input
                                                        type="text"
                                                        value={att.name}
                                                        onChange={(e) => {
                                                            const newAtts = [...editedTask.attachments];
                                                            newAtts[i] = { ...newAtts[i], name: e.target.value };
                                                            setEditedTask({ ...editedTask, attachments: newAtts });
                                                        }}
                                                        className="bg-transparent border-0 focus:ring-0 text-[11px] font-black outline-none truncate h-4"
                                                        placeholder="Label"
                                                    />
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            value={att.url}
                                                            onChange={(e) => {
                                                                const newAtts = [...editedTask.attachments];
                                                                newAtts[i] = { ...newAtts[i], url: e.target.value };
                                                                setEditedTask({ ...editedTask, attachments: newAtts });
                                                            }}
                                                            className="flex-1 bg-transparent border-0 focus:ring-0 text-[9px] outline-none truncate text-muted-foreground/60 focus:text-primary transition-colors h-4"
                                                            placeholder="URL"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    {att.url && (
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-primary/20 text-primary" asChild>
                                                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            const newAtts = editedTask.attachments.filter((_, idx) => idx !== i);
                                                            setEditedTask({ ...editedTask, attachments: newAtts });
                                                        }}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* If no attachments, show a subtle add button */}
                            {(!editedTask.attachments || editedTask.attachments.length === 0) && (
                                <div className="mt-8 pt-6 border-t border-dashed border-border/30 text-center">
                                    <button
                                        onClick={() => setEditedTask({ ...editedTask, attachments: [{ name: 'Attachment 1', url: '' }] })}
                                        className="text-[10px] text-muted-foreground hover:text-primary flex items-center gap-2 mx-auto transition-all font-bold uppercase tracking-widest"
                                    >
                                        <Plus className="w-3 h-3" /> Add Attachment
                                    </button>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* SECTION: IMPLEMENTATION */}
                    <section className="space-y-6">
                        <div className="bg-primary/5 border border-primary/20 rounded-3xl p-8 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8 opacity-5">
                                <Terminal className="w-24 h-24" />
                            </div>

                            <div className="flex items-center gap-2 px-1 relative">
                                <Terminal className="w-4 h-4 text-primary" />
                                <h3 className="text-[10px] font-bold uppercase tracking-widest text-primary/80">Developer Execution & Evidence</h3>
                            </div>

                            <div className="space-y-8 relative">
                                <div className="space-y-3">
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Proof of Work</label>
                                    <div className="flex gap-3">
                                        <div className="relative flex-1 group">
                                            <LinkIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                                            <input
                                                type="text"
                                                value={editedTask.evidence || ''}
                                                onChange={(e) => setEditedTask({ ...editedTask, evidence: e.target.value })}
                                                className="w-full bg-background border border-border/50 hover:border-primary/50 focus:border-primary rounded-2xl py-4 pl-12 pr-4 text-sm transition-all focus:outline-none"
                                                placeholder="GitHub PR, preview link, etc..."
                                            />
                                        </div>
                                        {editedTask.evidence && (
                                            <Button size="icon" variant="outline" className="h-[52px] w-[52px] rounded-2xl neon-border-glow" asChild>
                                                <a href={editedTask.evidence} target="_blank" rel="noopener noreferrer">
                                                    <ExternalLink className="w-5 h-5" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>

                                {/* EXECUTION RESOURCES */}
                                <div className="space-y-3 pt-4">
                                    <div className="flex items-center justify-between px-1">
                                        <div className="flex items-center gap-2">
                                            <LinkIcon className="w-3.5 h-3.5 text-primary" />
                                            <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Execution Attachments</h4>
                                        </div>
                                        <button
                                            onClick={() => {
                                                const newAtts = [...(editedTask.executionAttachments || [])];
                                                newAtts.push({ name: `Attachment ${newAtts.length + 1}`, url: '' });
                                                setEditedTask({ ...editedTask, executionAttachments: newAtts });
                                            }}
                                            className="text-[9px] text-primary hover:underline font-extrabold uppercase tracking-tighter"
                                        >
                                            + Add Attachment
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {editedTask.executionAttachments?.map((att, i) => (
                                            <div key={i} className="flex gap-2 items-center bg-background/40 border border-border/30 p-3 rounded-2xl group transition-all hover:border-primary/30 hover:bg-background/60">
                                                <div className="flex-1 flex flex-col gap-0.5 min-w-0">
                                                    <input
                                                        type="text"
                                                        value={att.name}
                                                        onChange={(e) => {
                                                            const newAtts = [...(editedTask.executionAttachments || [])];
                                                            newAtts[i] = { ...newAtts[i], name: e.target.value };
                                                            setEditedTask({ ...editedTask, executionAttachments: newAtts });
                                                        }}
                                                        className="bg-transparent border-0 focus:ring-0 text-[11px] font-black outline-none truncate h-4"
                                                        placeholder="Label"
                                                    />
                                                    <div className="flex gap-2 items-center">
                                                        <input
                                                            type="text"
                                                            value={att.url}
                                                            onChange={(e) => {
                                                                const newAtts = [...(editedTask.executionAttachments || [])];
                                                                newAtts[i] = { ...newAtts[i], url: e.target.value };
                                                                setEditedTask({ ...editedTask, executionAttachments: newAtts });
                                                            }}
                                                            className="flex-1 bg-transparent border-0 focus:ring-0 text-[9px] outline-none truncate text-muted-foreground/60 focus:text-primary transition-colors h-4"
                                                            placeholder="URL"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="flex gap-1 shrink-0">
                                                    {att.url && (
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 rounded-xl hover:bg-primary/20 text-primary" asChild>
                                                            <a href={att.url} target="_blank" rel="noopener noreferrer">
                                                                <ExternalLink className="w-3.5 h-3.5" />
                                                            </a>
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        onClick={() => {
                                                            const newAtts = (editedTask.executionAttachments || []).filter((_, idx) => idx !== i);
                                                            setEditedTask({ ...editedTask, executionAttachments: newAtts });
                                                        }}
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Report (Notes)</label>
                                        <textarea
                                            value={editedTask.notes || ''}
                                            onChange={(e) => setEditedTask({ ...editedTask, notes: e.target.value })}
                                            className="w-full h-40 bg-background border border-border/50 hover:border-primary/50 focus:border-primary rounded-2xl p-6 text-sm transition-all focus:outline-none resize-none"
                                            placeholder="What was implemented?"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-destructive uppercase tracking-widest px-1">Blockers / Pending</label>
                                        <textarea
                                            value={editedTask.blockers || ''}
                                            onChange={(e) => setEditedTask({ ...editedTask, blockers: e.target.value })}
                                            className="w-full h-40 bg-background border border-border/50 hover:border-destructive/50 focus:border-destructive rounded-2xl p-6 text-sm transition-all focus:outline-none resize-none"
                                            placeholder="Any issues or questions?"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>

                {/* Sidebar Details */}
                <div className="space-y-8">
                    {/* Status Card */}
                    <div className="bg-card border rounded-3xl p-6 space-y-6 shadow-xl shadow-black/20 sticky top-10">
                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block px-1">Current Status</label>
                            <div className="flex flex-col gap-2">
                                {STATUS_OPTIONS.map(status => (
                                    <button
                                        key={status}
                                        onClick={() => setEditedTask({ ...editedTask, status })}
                                        className={cn(
                                            "w-full px-4 py-3 rounded-xl text-sm font-semibold border transition-all text-left flex items-center justify-between group",
                                            editedTask.status === status
                                                ? "bg-primary/20 text-primary border-primary shadow-[0_0_15px_rgba(34,197,94,0.1)]"
                                                : "bg-background text-muted-foreground hover:bg-muted/50 border-border/50"
                                        )}
                                    >
                                        {status}
                                        {editedTask.status === status && <Check className="w-4 h-4" />}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block px-1">Budget Allocation</label>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between p-4 bg-muted/20 rounded-2xl border border-border/50">
                                    <span className="text-sm font-medium text-muted-foreground">Amount</span>
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-primary font-bold">€</span>
                                        <input
                                            type="number"
                                            value={editedTask.budget}
                                            onChange={(e) => setEditedTask({ ...editedTask, budget: Number(e.target.value) })}
                                            className="bg-transparent w-20 text-right font-mono font-bold text-lg focus:outline-none"
                                        />
                                    </div>
                                </div>

                                <label className={cn(
                                    "flex items-center justify-between p-4 rounded-2xl border transition-all cursor-pointer group",
                                    editedTask.isPaid
                                        ? "bg-primary/10 border-primary/50"
                                        : "bg-muted/20 border-border/50 hover:border-primary/30"
                                )}>
                                    <span className={cn(
                                        "text-sm font-bold uppercase tracking-widest transition-colors",
                                        editedTask.isPaid ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                                    )}>Payment Status</span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-bold text-muted-foreground">{editedTask.isPaid ? 'PAID' : 'PENDING'}</span>
                                        <input
                                            type="checkbox"
                                            checked={editedTask.isPaid || false}
                                            onChange={(e) => setEditedTask({ ...editedTask, isPaid: e.target.checked })}
                                            className="accent-primary w-5 h-5 rounded-md border-border transition-all"
                                            disabled={currentUser.role !== 'admin'}
                                        />
                                    </div>
                                </label>
                            </div>
                        </div>

                        <div className="h-px bg-border/50" />

                        <div className="space-y-4">
                            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block px-1">Assigned Team</label>
                            <div className="space-y-4">
                                <div className="space-y-1">
                                    <label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">Executor</label>
                                    <select
                                        value={editedTask.assigneeId || ""}
                                        onChange={(e) => setEditedTask({ ...editedTask, assigneeId: e.target.value || undefined })}
                                        disabled={currentUser.role !== 'admin'}
                                        className="w-full bg-muted/10 border border-border/50 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none disabled:opacity-70 transition-all font-sans"
                                    >
                                        <option value="">Unassigned</option>
                                        {allProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[9px] text-muted-foreground font-bold uppercase ml-1">Reviewer</label>
                                    <select
                                        value={editedTask.reviewerId || ""}
                                        onChange={(e) => setEditedTask({ ...editedTask, reviewerId: e.target.value || undefined })}
                                        disabled={currentUser.role !== 'admin'}
                                        className="w-full bg-muted/10 border border-border/50 rounded-xl px-4 py-2 text-sm focus:ring-1 focus:ring-primary outline-none disabled:opacity-70 transition-all font-sans"
                                    >
                                        <option value="">Unassigned</option>
                                        {allProfiles.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button
                                variant="secondary"
                                onClick={generateReport}
                                disabled={currentUser.role !== 'dev'}
                                className="w-full rounded-xl h-12 font-bold flex items-center justify-center gap-2 transition-all active:scale-95"
                            >
                                <Download className="w-4 h-4" />
                                Generate Final Report
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION: DISCUSSION - Full width at the bottom */}
            <CommentSection taskId={editedTask.id} />

            <style jsx global>{`
                .task-image-card {
                    position: relative;
                    aspect-ratio: 16 / 9;
                    border-radius: 1rem;
                    overflow: hidden;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    background: rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: all 0.3s ease;
                }
                .task-image-card:hover {
                    border-color: var(--primary);
                    box-shadow: 0 0 20px rgba(34, 197, 94, 0.2);
                }
            `}</style>
        </motion.div>
    );
}
