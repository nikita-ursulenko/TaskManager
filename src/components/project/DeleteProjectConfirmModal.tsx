"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { AlertCircle, X } from "lucide-react";

interface DeleteProjectConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    projectName: string;
}

export function DeleteProjectConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    projectName
}: DeleteProjectConfirmModalProps) {
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
                            <div className="p-6 space-y-6">
                                <div className="flex items-center justify-between">
                                    <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center">
                                        <AlertCircle className="w-6 h-6 text-destructive" />
                                    </div>
                                    <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full">
                                        <X className="w-5 h-5" />
                                    </Button>
                                </div>

                                <div className="space-y-2">
                                    <h2 className="text-xl font-bold tracking-tight text-foreground">
                                        Delete Project?
                                    </h2>
                                    <p className="text-sm text-muted-foreground leading-relaxed">
                                        Are you sure you want to delete <span className="font-bold text-foreground">"{projectName}"</span>? This will permanently remove the project and all its associated tasks.
                                    </p>
                                </div>

                                <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4">
                                    <p className="text-xs text-destructive font-medium flex items-center gap-2">
                                        <AlertCircle className="w-3.5 h-3.5" />
                                        This action cannot be undone.
                                    </p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-xl h-11 font-semibold"
                                        onClick={onClose}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        variant="destructive"
                                        className="flex-1 rounded-xl h-11 font-semibold shadow-lg shadow-destructive/20"
                                        onClick={onConfirm}
                                    >
                                        Delete Project
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
