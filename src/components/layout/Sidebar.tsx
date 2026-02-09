"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Folder,
    Plus,
    User,
    LayoutDashboard,
    Wallet,
    Menu,
    X,
    ChevronLeft,
    LogOut,
    Bell,
    Settings
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ProjectModal } from "@/components/project/ProjectModal";
import { NotificationCenter } from "./NotificationCenter";

export function Sidebar() {
    const { isSidebarOpen, toggleSidebar, setSidebarOpen } = useStore();
    const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

    return (
        <>
            {/* Mobile Toggle Button (Visible only on mobile) */}
            <div className="md:hidden fixed top-4 left-4 z-50">
                <Button variant="outline" size="icon" onClick={() => setSidebarOpen(true)}>
                    <Menu className="w-5 h-5" />
                </Button>
            </div>

            {/* Mobile Drawer Overlay */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <>
                        {/* Backdrop for Mobile */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSidebarOpen(false)}
                            className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />

                        {/* Drawer for Mobile */}
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="md:hidden fixed inset-y-0 left-0 w-72 bg-card border-r z-50 overflow-y-auto"
                        >
                            <SidebarContent
                                onClose={() => setSidebarOpen(false)}
                                isMobile
                                onOpenProjectModal={() => setIsProjectModalOpen(true)}
                            />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>

            {/* Desktop Sidebar (Persistent but collapsible) */}
            <aside
                className={cn(
                    "hidden md:flex flex-col fixed left-0 top-0 h-screen border-r bg-card/50 backdrop-blur-xl transition-transform duration-300 ease-in-out z-40",
                    isSidebarOpen ? "translate-x-0 w-72" : "-translate-x-full w-72"
                )}
            >
                <SidebarContent onOpenProjectModal={() => setIsProjectModalOpen(true)} />

                {/* Desktop Collapse Button */}
                <div className="absolute right-4 top-6">
                    <Button variant="ghost" size="icon" onClick={toggleSidebar} className="h-8 w-8 text-muted-foreground hover:text-foreground">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                </div>
            </aside>

            <ProjectModal
                isOpen={isProjectModalOpen}
                onClose={() => setIsProjectModalOpen(false)}
            />
        </>
    );
}

function SidebarContent({ onClose, isMobile, onOpenProjectModal }: { onClose?: () => void, isMobile?: boolean, onOpenProjectModal: () => void }) {
    const pathname = usePathname();
    const { projects, currentUser, setRole, addProject } = useStore();
    const [isClient, setIsClient] = useState(false);
    const router = useRouter();

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push("/login");
    };

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;


    return (
        <div className="flex flex-col h-full w-full">
            <div className="p-6 border-b flex items-center justify-between">
                <Link href="/" className="font-bold text-2xl tracking-tight flex items-center gap-3" onClick={onClose}>
                    <LayoutDashboard className="w-7 h-7 text-primary" />
                    Task Blazar
                </Link>
                {isMobile && (
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="w-5 h-5" />
                    </Button>
                )}
            </div>

            <div className="flex-1 overflow-y-auto py-6">
                <div className="px-4 mb-4">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                        Projects
                    </h2>
                    <div className="space-y-2">
                        {projects.map((project) => (
                            <Link
                                key={project.id}
                                href={`/${project.slug}`}
                                onClick={onClose}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors",
                                    pathname === `/${project.slug}`
                                        ? "bg-primary/10 text-primary shadow-[inset_0_0_10px_rgba(34,197,94,0.05)]"
                                        : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                                )}
                            >
                                <Folder className="w-5 h-5" />
                                {project.name}
                            </Link>
                        ))}
                    </div>
                    {currentUser.role === 'admin' && (
                        <Button
                            variant="ghost"
                            size="lg"
                            className="w-full justify-start mt-4 text-muted-foreground pl-4 text-base"
                            onClick={onOpenProjectModal}
                        >
                            <Plus className="w-5 h-5 mr-3" />
                            Add Project
                        </Button>
                    )}
                </div>

                {/* Modal removed from here and moved to Sidebar root */}

                <div className="px-4 mt-8">
                    <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3 px-2">
                        Finance
                    </h2>
                    <Link
                        href="/finance"
                        onClick={onClose}
                        className={cn(
                            "flex items-center gap-3 px-4 py-3 text-base font-medium rounded-lg transition-colors",
                            pathname === `/finance`
                                ? "bg-accent text-accent-foreground"
                                : "text-muted-foreground hover:bg-accent/50 hover:text-foreground"
                        )}
                    >
                        <Wallet className="w-5 h-5" />
                        Dashboard
                    </Link>
                </div>
            </div>

            <div className="mt-auto p-4 border-t border-border/10">
                <div className="relative p-4 rounded-3xl bg-secondary/10 border border-white/5 shadow-2xl group overflow-hidden">
                    {/* Subtle Glow Background */}
                    <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />

                    <div className="flex items-center gap-4 relative z-10">
                        <div className="relative">
                            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-primary/20 to-primary/40 flex items-center justify-center border border-primary/30 shadow-lg shadow-primary/5">
                                <span className="text-xs font-black text-primary">
                                    {currentUser.name ? currentUser.name.split(' ').map(n => n[0]).join('').toUpperCase() : '?'}
                                </span>
                            </div>
                            {/* Online Status Dot */}
                            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background shadow-lg" />
                        </div>

                        <div className="flex-1 min-w-0">
                            <h4 className="text-[13px] font-black text-foreground truncate tracking-tight">{currentUser.name}</h4>
                            <div className="flex items-center gap-1.5 opacity-60">
                                <div className="w-1 h-1 rounded-full bg-primary" />
                                <span className="text-[9px] font-bold text-primary uppercase tracking-[0.2em]">{currentUser.role}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-3 border-t border-white/5 relative z-10">
                        <div className="flex items-center gap-1">
                            <NotificationCenter />
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => router.push('/settings')}
                                className="w-9 h-9 rounded-xl hover:bg-white/5 text-muted-foreground hover:text-white transition-all group/btn"
                                title="Account Settings"
                            >
                                <Settings className="w-4 h-4 group-hover/btn:rotate-45 transition-transform duration-300" />
                            </Button>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="w-9 h-9 rounded-xl hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all"
                            title="Log Out"
                        >
                            <LogOut className="w-4 h-4" />
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
