"use client";

import { useStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { User, Shield, LogOut, Save, ChevronLeft, Settings as SettingsIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { createClient } from "@/lib/supabase/client";

export default function SettingsPage() {
    const { currentUser, setUserProfile } = useStore();
    const router = useRouter();
    const [name, setName] = useState(currentUser.name);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setName(currentUser.name);
    }, [currentUser]);

    const handleSave = async () => {
        setIsSaving(true);
        const supabase = createClient();

        try {
            const { error } = await supabase
                .from('profiles')
                .update({ full_name: name })
                .eq('id', currentUser.id);

            if (!error) {
                setUserProfile({ ...currentUser, name });
                alert("Profile updated successfully!");
            } else {
                console.error("Error updating profile:", error);
            }
        } finally {
            setIsSaving(false);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl mx-auto space-y-8"
        >
            <div className="flex items-center justify-between">
                <Button variant="ghost" onClick={() => router.back()} className="pl-0">
                    <ChevronLeft className="w-5 h-5 mr-1" />
                    Back
                </Button>
                <h1 className="text-2xl font-bold tracking-tight">Account Settings</h1>
                <div className="w-20" /> {/* Spacer */}
            </div>

            <div className="grid gap-8">
                {/* Profile Section */}
                <div className="bg-card border rounded-3xl p-8 space-y-8 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary/20 shadow-lg">
                            <User className="w-8 h-8 text-primary" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold">{currentUser.name}</h2>
                            <p className="text-sm text-muted-foreground capitalize flex items-center gap-2">
                                <Shield className="w-3 h-3" />
                                {currentUser.role} Account
                            </p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-3">
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest px-1">Display Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full bg-muted/20 border border-border/50 hover:border-primary/50 focus:border-primary focus:bg-background rounded-2xl p-4 text-base transition-all focus:outline-none focus:ring-1 focus:ring-primary shadow-inner"
                                placeholder="Your full name"
                            />
                        </div>

                        <div className="flex justify-end pt-4">
                            <Button onClick={handleSave} disabled={isSaving || name === currentUser.name} className="neon-glow">
                                {isSaving ? "Saving..." : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Update Profile
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Account Security */}
                <div className="bg-card border rounded-3xl p-8 space-y-6 shadow-xl shadow-black/20">
                    <div className="flex items-center gap-2">
                        <SettingsIcon className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-sm font-bold uppercase tracking-widest">System Actions</h3>
                    </div>

                    <div className="pt-2">
                        <Button variant="destructive" onClick={handleLogout} className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-bold shadow-lg shadow-destructive/10">
                            <LogOut className="w-4 h-4" />
                            Log Out of Session
                        </Button>
                    </div>
                </div>

                <p className="text-center text-xs text-muted-foreground px-10 leading-relaxed italic">
                    Your changes will be saved to your global profile and visible to team members across all projects.
                </p>
            </div>
        </motion.div>
    );
}
