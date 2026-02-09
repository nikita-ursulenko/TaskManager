"use client";

import { useStore } from "@/lib/store";
import { Sidebar } from "./Sidebar";
import { Menu, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Task, Comment, Notification } from "@/lib/types";

export function AppShell({ children }: { children: React.ReactNode }) {
    const {
        isSidebarOpen,
        toggleSidebar,
        setUserProfile,
        setProjects,
        setTasks,
        setAllProfiles,
        setComments,
        setNotifications,
        currentUser
    } = useStore();
    const [isClient, setIsClient] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();

    useEffect(() => {
        setIsClient(true);
        const supabase = createClient();

        async function fetchData() {
            const { data: { user } } = await supabase.auth.getUser();

            if (user) {
                // Fetch Profile
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('full_name, role')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    setUserProfile({ id: user.id, name: profile.full_name || user.email || '', role: profile.role || 'dev' });
                }

                // Fetch All Profiles (for task assignment)
                const { data: allProfilesData } = await supabase
                    .from('profiles')
                    .select('id, full_name, role');

                if (allProfilesData) {
                    setAllProfiles(allProfilesData.map(p => ({
                        id: p.id,
                        name: p.full_name || '',
                        role: p.role
                    })));
                }

                // Fetch Projects
                const { data: projectsData } = await supabase
                    .from('projects')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (projectsData) {
                    const projectsWithSlugs = projectsData.map(p => ({
                        id: p.id,
                        name: p.name,
                        description: p.description,
                        vercelUrl: p.vercel_url,
                        githubUrl: p.github_url,
                        siteUrl: p.site_url,
                        slug: p.slug || p.name.toLowerCase()
                            .trim()
                            .replace(/[^\w\s-]/g, '')
                            .replace(/[\s_-]+/g, '-')
                            .replace(/^-+|-+$/g, '')
                    }));
                    setProjects(projectsWithSlugs);
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
                        blockers: t.blockers || '',
                        isPaid: t.is_paid,
                        assigneeId: t.assignee_id,
                        reviewerId: t.reviewer_id,
                        observerId: t.observer_id,
                        createdAt: t.created_at,
                        updatedAt: t.updated_at
                    }));
                    setTasks(formattedTasks);
                }

                // Fetch Comments
                const { data: commentsData } = await supabase
                    .from('comments')
                    .select('*')
                    .order('created_at', { ascending: true });

                if (commentsData) {
                    setComments(commentsData.map(c => ({
                        id: c.id,
                        taskId: c.task_id,
                        userId: c.user_id,
                        content: c.content,
                        parentId: c.parent_id,
                        createdAt: c.created_at
                    })));
                }

                // Fetch Notifications
                const { data: notificationsData } = await supabase
                    .from('notifications')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (notificationsData) {
                    setNotifications(notificationsData.map(n => ({
                        id: n.id,
                        userId: n.user_id,
                        taskId: n.task_id,
                        content: n.content,
                        isRead: n.is_read,
                        type: n.type,
                        createdAt: n.created_at
                    })));
                }
            }
            setIsLoading(false);
        }

        // Listen for auth state changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' || event === 'INITIAL_SESSION') {
                fetchData();
            } else if (event === 'SIGNED_OUT') {
                setProjects([]);
                setTasks([]);
                setComments([]);
                setNotifications([]);
                setIsLoading(false);
            }
        });

        // Initial check if we already have a session
        fetchData();

        // Refresh on window focus to keep data (notifications) fresh
        const handleFocus = () => fetchData();
        window.addEventListener('focus', handleFocus);

        return () => {
            subscription.unsubscribe();
            window.removeEventListener('focus', handleFocus);
        };
    }, [setUserProfile, setProjects, setTasks, setAllProfiles, setComments, setNotifications]);

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
            <Sidebar />

            <main
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out p-4 md:p-10 h-screen pt-24 pb-10",
                    isSidebarOpen ? "md:ml-72 md:pt-10" : "md:ml-0 md:pt-24"
                )}
            >
                {!isSidebarOpen && (
                    <div className="hidden md:block fixed top-6 left-6 z-50">
                        <Button variant="outline" size="icon" onClick={toggleSidebar}>
                            <Menu className="w-5 h-5" />
                        </Button>
                    </div>
                )}

                <div className="max-w-7xl mx-auto h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
