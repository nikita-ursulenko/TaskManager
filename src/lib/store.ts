import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Task, Role, User } from './types';
import { createClient } from './supabase/client';

interface AppState {
    currentUser: User;
    projects: Project[];
    tasks: Task[];

    // Actions
    setRole: (role: Role) => void;
    setProjects: (projects: Project[]) => void;
    setTasks: (tasks: Task[]) => void;

    addProject: (name: string, description?: string, vercelUrl?: string, githubUrl?: string, siteUrl?: string) => Promise<void>;
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    updateProject: (id: string, name: string, description?: string, vercelUrl?: string, githubUrl?: string, siteUrl?: string) => Promise<Project | void>;

    // Profile Actions
    setUserProfile: (profile: { name: string, role: Role }) => void;

    // UI State
    isSidebarOpen: boolean;
    toggleSidebar: () => void;
    setSidebarOpen: (isOpen: boolean) => void;
}

const INITIAL_USER: User = {
    id: '',
    name: '',
    role: 'dev',
};

export const useStore = create<AppState>()(
    persist(
        (set, get) => ({
            currentUser: INITIAL_USER,
            projects: [],
            tasks: [],

            setRole: (role) => set((state) => ({
                currentUser: { ...state.currentUser, role }
            })),

            setProjects: (projects) => set({ projects }),
            setTasks: (tasks) => set({ tasks }),

            addProject: async (name, description, vercelUrl, githubUrl, siteUrl) => {
                const supabase = createClient();
                const slug = name.toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '') // remove special chars
                    .replace(/[\s_-]+/g, '-') // Replace spaces and underscores with a single dash
                    .replace(/^-+|-+$/g, ''); // Trim dashes from ends

                const { data, error } = await supabase
                    .from('projects')
                    .insert([{
                        name,
                        slug,
                        description,
                        vercel_url: vercelUrl,
                        github_url: githubUrl,
                        site_url: siteUrl
                    }])
                    .select()
                    .single();

                if (error) {
                    throw error;
                }

                if (data) {
                    const newProject: Project = {
                        id: data.id,
                        name: data.name,
                        slug: data.slug,
                        description: data.description,
                        vercelUrl: data.vercel_url,
                        githubUrl: data.github_url,
                        siteUrl: data.site_url
                    };
                    set((state) => ({
                        projects: [...state.projects, newProject]
                    }));
                }
            },

            deleteProject: async (id) => {
                const supabase = createClient();
                const { error } = await supabase
                    .from('projects')
                    .delete()
                    .eq('id', id);

                if (error) {
                    throw error;
                }

                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                    tasks: state.tasks.filter((t) => t.projectId !== id),
                }));
            },

            updateProject: async (id, name, description, vercelUrl, githubUrl, siteUrl) => {
                const supabase = createClient();
                const slug = name.toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');

                const { data, error } = await supabase
                    .from('projects')
                    .update({
                        name,
                        slug,
                        description,
                        vercel_url: vercelUrl,
                        github_url: githubUrl,
                        site_url: siteUrl
                    })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    throw error;
                }

                if (data) {
                    const updatedProject: Project = {
                        id: data.id,
                        name: data.name,
                        slug: data.slug,
                        description: data.description,
                        vercelUrl: data.vercel_url,
                        githubUrl: data.github_url,
                        siteUrl: data.site_url
                    };
                    set((state) => ({
                        projects: state.projects.map((p) => p.id === id ? updatedProject : p)
                    }));
                    return updatedProject;
                }
            },

            addTask: async (taskData) => {
                const supabase = createClient();
                const { data, error } = await supabase
                    .from('tasks')
                    .insert([{
                        project_id: taskData.projectId,
                        title: taskData.title,
                        description: taskData.description,
                        status: taskData.status || 'New',
                        budget: taskData.budget,
                        deadline: taskData.deadline,
                        attachments: taskData.attachments,
                        evidence: taskData.evidence ? [taskData.evidence] : [],
                        notes: taskData.notes,
                        blockers: taskData.blockers,
                        is_paid: taskData.isPaid || false
                    }])
                    .select()
                    .single();

                if (error) {
                    console.error('Error adding task:', error);
                    return;
                }

                if (data) {
                    const newTask: Task = {
                        id: data.id,
                        projectId: data.project_id,
                        title: data.title,
                        description: data.description || '',
                        status: data.status,
                        budget: Number(data.budget) || 0,
                        deadline: data.deadline || undefined,
                        attachments: data.attachments || [],
                        evidence: data.evidence?.[0] || '',
                        notes: data.notes || '',
                        blockers: data.blockers || '',
                        isPaid: data.is_paid,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at
                    };

                    set((state) => ({
                        tasks: [...state.tasks, newTask]
                    }));
                }
            },

            updateTask: async (id, updates) => {
                const supabase = createClient();
                const dbUpdates: any = {};

                if (updates.projectId !== undefined) dbUpdates.project_id = updates.projectId;
                if (updates.title !== undefined) dbUpdates.title = updates.title;
                if (updates.description !== undefined) dbUpdates.description = updates.description;
                if (updates.status !== undefined) dbUpdates.status = updates.status;
                if (updates.budget !== undefined) dbUpdates.budget = updates.budget;
                if (updates.deadline !== undefined) dbUpdates.deadline = updates.deadline;
                if (updates.attachments !== undefined) dbUpdates.attachments = updates.attachments;
                if (updates.evidence !== undefined) dbUpdates.evidence = updates.evidence ? [updates.evidence] : [];
                if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
                if (updates.blockers !== undefined) dbUpdates.blockers = updates.blockers;
                if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;

                const { data, error } = await supabase
                    .from('tasks')
                    .update({ ...dbUpdates, updated_at: new Date().toISOString() })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) {
                    console.error('Error updating task:', error);
                    return;
                }

                if (data) {
                    const updatedTask: Task = {
                        id: data.id,
                        projectId: data.project_id,
                        title: data.title,
                        description: data.description || '',
                        status: data.status,
                        budget: Number(data.budget) || 0,
                        deadline: data.deadline || undefined,
                        attachments: data.attachments || [],
                        evidence: data.evidence?.[0] || '',
                        notes: data.notes || '',
                        blockers: data.blockers || '',
                        isPaid: data.is_paid,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at
                    };

                    set((state) => ({
                        tasks: state.tasks.map((t) => t.id === id ? updatedTask : t)
                    }));
                }
            },

            deleteTask: async (id) => {
                const supabase = createClient();
                const { error } = await supabase
                    .from('tasks')
                    .delete()
                    .eq('id', id);

                if (error) {
                    console.error('Error deleting task:', error);
                    return;
                }

                set((state) => ({
                    tasks: state.tasks.filter((t) => t.id !== id)
                }));
            },

            isSidebarOpen: true,
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

            setUserProfile: (profile) => set((state) => ({
                currentUser: { ...state.currentUser, name: profile.name, role: profile.role }
            })),
        }),
        {
            name: 'task-manager-storage',
        }
    )
);
