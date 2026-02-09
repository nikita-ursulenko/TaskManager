"use client";

import { useState } from "react";
import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { X, FolderPlus, Globe, Database, ExternalLink, AlignLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectModal({ isOpen, onClose }: ProjectModalProps) {
    const { addProject } = useStore();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [vercelUrl, setVercelUrl] = useState("");
    const [githubUrl, setGithubUrl] = useState("");
    const [siteUrl, setSiteUrl] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            setError(null);
            await addProject(name, description, vercelUrl, githubUrl, siteUrl);
            setName("");
            setDescription("");
            setVercelUrl("");
            setGithubUrl("");
            setSiteUrl("");
            onClose();
        } catch (err: any) {
            console.error("Failed to create project:", err);
            setError(err.message || "An unexpected error occurred");
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
                            className="w-full max-w-xl bg-card border shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <FolderPlus className="w-6 h-6 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold tracking-tight">Create Project</h2>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="space-y-6">
                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                                <AlignLeft className="w-3.5 h-3.5" />
                                                General Information
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                    Project Name
                                                </label>
                                                <div className="relative group">
                                                    <input
                                                        autoFocus
                                                        type="text"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        placeholder="e.g. Design System, Mobile App..."
                                                        className="w-full bg-muted/30 border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl px-4 py-3 text-base transition-all outline-none"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                    Description (Technical Details)
                                                </label>
                                                <textarea
                                                    value={description}
                                                    onChange={(e) => setDescription(e.target.value)}
                                                    placeholder="Site URL, login keys, storage info, notes..."
                                                    className="w-full bg-muted/30 border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl px-4 py-3 text-base transition-all outline-none resize-none h-32"
                                                    disabled={isSubmitting}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-muted-foreground/60">
                                                <ExternalLink className="w-3.5 h-3.5" />
                                                Resources & Links
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                        GitHub Repository
                                                    </label>
                                                    <div className="relative">
                                                        <Database className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                                        <input
                                                            type="url"
                                                            value={githubUrl}
                                                            onChange={(e) => setGithubUrl(e.target.value)}
                                                            placeholder="https://github.com/..."
                                                            className="w-full bg-muted/30 border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                                                            disabled={isSubmitting}
                                                        />
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                        Vercel Deployment
                                                    </label>
                                                    <div className="relative">
                                                        <ExternalLink className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                                        <input
                                                            type="url"
                                                            value={vercelUrl}
                                                            onChange={(e) => setVercelUrl(e.target.value)}
                                                            placeholder="https://vercel.app/..."
                                                            className="w-full bg-muted/30 border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                                                            disabled={isSubmitting}
                                                        />
                                                    </div>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                                    Live Website URL
                                                </label>
                                                <div className="relative">
                                                    <Globe className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50" />
                                                    <input
                                                        type="url"
                                                        value={siteUrl}
                                                        onChange={(e) => setSiteUrl(e.target.value)}
                                                        placeholder="https://example.com"
                                                        className="w-full bg-muted/30 border border-transparent focus:border-primary/50 focus:ring-4 focus:ring-primary/5 rounded-xl pl-10 pr-4 py-2.5 text-sm transition-all outline-none"
                                                        disabled={isSubmitting}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {error && (
                                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl animate-in fade-in slide-in-from-top-1">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
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
                                            disabled={!name.trim() || isSubmitting}
                                        >
                                            {isSubmitting ? "Creating..." : "Create Project"}
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
