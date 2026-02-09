"use client";

import { useState, useEffect } from "react";
import { useStore } from "@/lib/store";
import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, Edit3 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface EditProjectModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: (newSlug: string) => void;
}

export function EditProjectModal({ project, isOpen, onClose, onSuccess }: EditProjectModalProps) {
    const { updateProject } = useStore();
    const [name, setName] = useState(project.name);
    const [description, setDescription] = useState(project.description || "");
    const [vercelUrl, setVercelUrl] = useState(project.vercelUrl || "");
    const [githubUrl, setGithubUrl] = useState(project.githubUrl || "");
    const [siteUrl, setSiteUrl] = useState(project.siteUrl || "");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (isOpen) {
            setName(project.name);
            setDescription(project.description || "");
            setVercelUrl(project.vercelUrl || "");
            setGithubUrl(project.githubUrl || "");
            setSiteUrl(project.siteUrl || "");
            setError(null);
        }
    }, [isOpen, project.name, project.description, project.vercelUrl, project.githubUrl, project.siteUrl]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;

        if (name === project.name && description === (project.description || "")) {
            onClose();
            return;
        }

        setIsSubmitting(true);
        setError(null);
        try {
            const updatedProject = await updateProject(project.id, name, description, vercelUrl, githubUrl, siteUrl);
            if (updatedProject && updatedProject.slug !== project.slug && onSuccess) {
                onSuccess(updatedProject.slug);
            }
            onClose();
        } catch (err: any) {
            console.error("Failed to update project:", err);
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
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[110]"
                    />
                    <div className="fixed inset-0 flex items-center justify-center p-4 z-[111] pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="w-full max-w-md bg-card border shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Edit3 className="w-6 h-6 text-primary" />
                                        </div>
                                        <h2 className="text-xl font-bold tracking-tight">Edit Project</h2>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                            Project Name
                                        </label>
                                        <input
                                            autoFocus
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Enter project name..."
                                            className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-base transition-all outline-none"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-2 block">
                                            Description (Technical Details)
                                        </label>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            placeholder="Update site URL, login keys, storage info..."
                                            className="w-full bg-muted/30 border-transparent focus:border-primary focus:ring-1 focus:ring-primary rounded-xl px-4 py-3 text-base transition-all outline-none resize-none h-32"
                                            disabled={isSubmitting}
                                        />
                                    </div>

                                    {error && (
                                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 rounded-xl">
                                            {error}
                                        </div>
                                    )}

                                    <div className="flex gap-3">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            className="flex-1 rounded-xl h-11"
                                            onClick={onClose}
                                            disabled={isSubmitting}
                                        >
                                            Cancel
                                        </Button>
                                        <Button
                                            type="submit"
                                            className="flex-1 rounded-xl h-11 font-semibold"
                                            disabled={!name.trim() || isSubmitting || (
                                                name === project.name &&
                                                description === (project.description || "") &&
                                                vercelUrl === (project.vercelUrl || "") &&
                                                githubUrl === (project.githubUrl || "") &&
                                                siteUrl === (project.siteUrl || "")
                                            )}
                                        >
                                            {isSubmitting ? "Saving..." : "Save Changes"}
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
