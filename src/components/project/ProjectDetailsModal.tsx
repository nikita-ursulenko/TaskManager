"use client";

import { Project } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { X, Info, ExternalLink, Key, Database, Globe } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ProjectDetailsModalProps {
    project: Project;
    isOpen: boolean;
    onClose: () => void;
}

export function ProjectDetailsModal({ project, isOpen, onClose }: ProjectDetailsModalProps) {
    if (!project) return null;

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
                            className="w-full max-w-lg bg-card border shadow-2xl rounded-2xl overflow-hidden pointer-events-auto"
                        >
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Info className="w-6 h-6 text-primary" />
                                        </div>
                                        <div>
                                            <h2 className="text-xl font-bold tracking-tight">{project.name}</h2>
                                            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-0.5">Project Details</p>
                                        </div>
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-muted/30 rounded-2xl p-6 border border-border/50">
                                        <div className="flex items-center gap-2 mb-4 text-primary">
                                            <Globe className="w-4 h-4" />
                                            <h3 className="text-sm font-bold uppercase tracking-wider">Resources & Links</h3>
                                        </div>
                                        <div className="grid gap-3">
                                            {project.siteUrl && (
                                                <a href={project.siteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-background/50 rounded-xl border hover:border-primary transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <Globe className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                        <span className="text-sm font-medium">Live Website</span>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                                </a>
                                            )}
                                            {project.githubUrl && (
                                                <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-background/50 rounded-xl border hover:border-primary transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <Database className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                        <span className="text-sm font-medium">GitHub Repository</span>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                                </a>
                                            )}
                                            {project.vercelUrl && (
                                                <a href={project.vercelUrl} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between p-3 bg-background/50 rounded-xl border hover:border-primary transition-colors group">
                                                    <div className="flex items-center gap-3">
                                                        <ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
                                                        <span className="text-sm font-medium">Vercel Deployment</span>
                                                    </div>
                                                    <ExternalLink className="w-3.5 h-3.5 text-muted-foreground" />
                                                </a>
                                            )}
                                            {!project.siteUrl && !project.githubUrl && !project.vercelUrl && (
                                                <div className="text-sm text-muted-foreground italic p-3 bg-background/50 rounded-xl border border-dashed">
                                                    No links provided.
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-6 pt-6 border-t border-border/50">
                                            <div className="flex items-center gap-2 mb-4 text-muted-foreground">
                                                <Info className="w-4 h-4" />
                                                <h3 className="text-[10px] font-bold uppercase tracking-widest">About this project</h3>
                                            </div>
                                            <div className="prose prose-sm dark:prose-invert max-w-none">
                                                {project.description ? (
                                                    <div className="text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed font-sans">
                                                        {project.description}
                                                    </div>
                                                ) : (
                                                    <div className="text-sm text-muted-foreground italic">
                                                        No description provided.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                                <Database className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">Slug</span>
                                            </div>
                                            <p className="text-sm font-mono truncate">{project.slug}</p>
                                        </div>
                                        <div className="bg-muted/20 rounded-xl p-4 border border-border/50">
                                            <div className="flex items-center gap-2 mb-2 text-muted-foreground">
                                                <Key className="w-3.5 h-3.5" />
                                                <span className="text-[10px] font-bold uppercase tracking-widest">ID</span>
                                            </div>
                                            <p className="text-[11px] font-mono truncate">{project.id}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-8 pt-6 border-t flex justify-end">
                                    <Button
                                        onClick={onClose}
                                        className="rounded-xl px-8"
                                    >
                                        Close
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </>
            )}
        </AnimatePresence>
    );
}
