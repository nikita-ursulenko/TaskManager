"use client";

import { useStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Task } from "@/lib/types";

export function AppShell({ children }: { children: React.ReactNode }) {
    const { isSidebarOpen, toggleSidebar, setUserProfile, setProjects, setTasks, currentUser } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        setIsClient(true);

        async function fetchData() {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserProfile({ name: profile.full_name || user.email || '', role: profile.role || 'dev' });
                }

                // Fetch Projects
                const { data: projectsData } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (projectsData) {
                    setProjects(projectsData);
                }

                // Fetch Tasks
                const { data: tasksData } = await supabase
                    .from('tasks')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (tasksData) {
                    const formattedTasks: Task[] = tasksData.map(t => ({
                        id: t.id,
                        projectId: t.project_id,
                        title: t.title,
                        description: t.description || '',
                        status: t.status,
                        budget: Number(t.budget) || 0,
                        deadline: t.deadline || undefined,
                        attachments: t.attachments || [],
                        evidence: t.evidence?.[0] || '',
                        notes: t.notes || '',
                        isPaid: t.is_paid,
                        createdAt: t.created_at,
                        updatedAt: t.updated_at
                    }));
                    setTasks(formattedTasks);
                }
            }
            setIsLoading(false);
        }

        fetchData();
    }, [setUserProfile, setProjects, setTasks]);

    const isLoginPage = pathname === "/login";

    if (!isClient) {
        return (
            <div className="flex min-h-screen bg-background text-foreground">
                {!isLoginPage && <div className="hidden md:block w-72 border-r bg-card/50 fixed inset-y-0" />}
                <main className={cn("flex-1", !isLoginPage && "md:ml-72 p-10")}>
                    {children}
                </main>
            </div>
        );
    }

    if (isLoginPage) {
        return (
            <div className="min-h-screen bg-background text-foreground">
                <main className="h-screen w-full">
                    {children}
                </main>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-background text-foreground">
            {/* Sidebar is now controlled by the shell */}
            <Sidebar />

            {/* Main Content Area */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out p-4 md:p-10 overflow-y-auto h-screen pt-24",
                    isSidebarOpen ? "md:ml-72 md:pt-10" : "md:ml-0 md:pt-24"
                )}
            >
                {/* Toggle Button for Desktop (when closed) */}
                {!isSidebarOpen && (
                    <div className="hidden md:block fixed top-6 left-6 z-50">
                        <Button variant="outline" size="icon" onClick={toggleSidebar}>
                            <Menu className="w-5 h-5" />
                        </Button>
                    </div>
                )}

                {children}
            </main>
        </div>
    );
}
