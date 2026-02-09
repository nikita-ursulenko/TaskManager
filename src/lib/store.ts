import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Project, Task, Role, User, Comment, Notification } from './types';
import { createClient } from './supabase/client';

interface AppState {
    currentUser: User;
    projects: Project[];
    tasks: Task[];
    allProfiles: User[];
    comments: Comment[];
    notifications: Notification[];

    // Actions
    setRole: (role: Role) => void;
    setProjects: (projects: Project[]) => void;
    setTasks: (tasks: Task[]) => void;
    setAllProfiles: (profiles: User[]) => void;
    setComments: (comments: Comment[]) => void;
    setNotifications: (notifications: Notification[]) => void;

    // Project Actions
    addProject: (name: string, description?: string, vercelUrl?: string, githubUrl?: string, siteUrl?: string) => Promise<void>;
    updateProject: (id: string, name: string, description?: string, vercelUrl?: string, githubUrl?: string, siteUrl?: string) => Promise<Project | void>;
    deleteProject: (id: string) => Promise<void>;

    // Task Actions
    addTask: (task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
    updateTask: (id: string, updates: Partial<Task>) => Promise<void>;
    deleteTask: (id: string) => Promise<void>;

    // Comment Actions
    addComment: (taskId: string, content: string, parentId?: string) => Promise<void>;

    // Notification Actions
    markAsRead: (notificationId: string) => Promise<void>;

    // Profile Actions
    setUserProfile: (profile: { id?: string, name: string, role: Role }) => void;

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
            allProfiles: [],
            comments: [],
            notifications: [],

            setRole: (role) => set((state) => ({
                currentUser: { ...state.currentUser, role }
            })),

            setProjects: (projects) => set({ projects }),
            setTasks: (tasks) => set({ tasks }),
            setAllProfiles: (allProfiles) => set({ allProfiles }),
            setComments: (comments) => set({ comments }),
            setNotifications: (notifications) => set({ notifications }),

            addProject: async (name, description, vercelUrl, githubUrl, siteUrl) => {
                const supabase = createClient();
                const slug = name.toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');

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

                if (error) throw error;
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
                    set((state) => ({ projects: [...state.projects, newProject] }));
                }
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
                    .update({ name, slug, description, vercel_url: vercelUrl, github_url: githubUrl, site_url: siteUrl })
                    .eq('id', id)
                    .select()
                    .single();

                if (error) throw error;
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

            deleteProject: async (id) => {
                const supabase = createClient();
                const { error } = await supabase.from('projects').delete().eq('id', id);
                if (error) throw error;
                set((state) => ({
                    projects: state.projects.filter((p) => p.id !== id),
                    tasks: state.tasks.filter((t) => t.projectId !== id),
                }));
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
                        execution_attachments: taskData.executionAttachments,
                        evidence: taskData.evidence ? [taskData.evidence] : [],
                        notes: taskData.notes,
                        blockers: taskData.blockers,
                        is_paid: taskData.isPaid || false,
                        position: taskData.position || 0,
                        assignee_id: taskData.assigneeId,
                        reviewer_id: taskData.reviewerId,
                        observer_id: taskData.observerId
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
                        executionAttachments: data.execution_attachments || [],
                        evidence: data.evidence?.[0] || '',
                        notes: data.notes || '',
                        blockers: data.blockers || '',
                        isPaid: data.is_paid,
                        position: data.position || 0,
                        assigneeId: data.assignee_id,
                        reviewerId: data.reviewer_id,
                        observerId: data.observer_id,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at
                    };

                    set((state) => ({ tasks: [...state.tasks, newTask] }));
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
                if (updates.executionAttachments !== undefined) dbUpdates.execution_attachments = updates.executionAttachments;
                if (updates.evidence !== undefined) dbUpdates.evidence = updates.evidence ? [updates.evidence] : [];
                if (updates.notes !== undefined) dbUpdates.notes = updates.notes;
                if (updates.blockers !== undefined) dbUpdates.blockers = updates.blockers;
                if (updates.isPaid !== undefined) dbUpdates.is_paid = updates.isPaid;
                if (updates.position !== undefined) dbUpdates.position = updates.position;
                if (updates.assigneeId !== undefined) dbUpdates.assignee_id = updates.assigneeId;
                if (updates.reviewerId !== undefined) dbUpdates.reviewer_id = updates.reviewerId;
                if (updates.observerId !== undefined) dbUpdates.observer_id = updates.observerId;

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
                        executionAttachments: data.execution_attachments || [],
                        evidence: data.evidence?.[0] || '',
                        notes: data.notes || '',
                        blockers: data.blockers || '',
                        isPaid: data.is_paid,
                        position: data.position || 0,
                        assigneeId: data.assignee_id,
                        reviewerId: data.reviewer_id,
                        observerId: data.observer_id,
                        createdAt: data.created_at,
                        updatedAt: data.updated_at
                    };

                    const oldTask = get().tasks.find(t => t.id === id);

                    set((state) => ({
                        tasks: state.tasks.map((t) => t.id === id ? updatedTask : t)
                    }));

                    // Notifications for status change or assignment
                    if (oldTask) {
                        const { data: { user } } = await supabase.auth.getUser();
                        if (!user) return;

                        // Status Change notification
                        if (updates.status && updates.status !== oldTask.status) {
                            const members = new Set([updatedTask.assigneeId, updatedTask.reviewerId, updatedTask.observerId].filter(id => id && id !== user.id));
                            for (const memberId of Array.from(members)) {
                                await supabase.from('notifications').insert([{
                                    user_id: memberId,
                                    actor_id: user.id,
                                    task_id: id,
                                    content: `Task "${updatedTask.title}" status changed to ${updatedTask.status}`,
                                    type: 'status_change'
                                }]);
                            }
                        }

                        // Assignment notification
                        if (updates.assigneeId && updates.assigneeId !== oldTask.assigneeId && updates.assigneeId !== user.id) {
                            await supabase.from('notifications').insert([{
                                user_id: updates.assigneeId,
                                actor_id: user.id,
                                task_id: id,
                                content: `You have been assigned to task: "${updatedTask.title}"`,
                                type: 'assignment'
                            }]);
                        }
                    }
                }
            },

            deleteTask: async (id) => {
                const supabase = createClient();
                const { error } = await supabase.from('tasks').delete().eq('id', id);
                if (error) {
                    console.error('Error deleting task:', error);
                    return;
                }
                set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) }));
            },

            addComment: async (taskId, content, parentId) => {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();
                if (!user) return;

                const { data, error } = await supabase
                    .from('comments')
                    .insert([{
                        task_id: taskId,
                        user_id: user.id,
                        content,
                        parent_id: parentId
                    }])
                    .select()
                    .single();

                if (error) {
                    console.error('Error adding comment:', {
                        message: error.message,
                        code: error.code,
                        details: error.details,
                        hint: error.hint
                    });
                    return;
                }

                if (data) {
                    const newComment: Comment = {
                        id: data.id,
                        taskId: data.task_id,
                        userId: data.user_id,
                        content: data.content,
                        parentId: data.parent_id,
                        createdAt: data.created_at,
                        userName: get().currentUser.name
                    };
                    set((state) => ({ comments: [...state.comments, newComment] }));

                    // Notify task members and parent comment author
                    const task = get().tasks.find(t => t.id === taskId);
                    if (task) {
                        const notificationTargets = new Set([task.assigneeId, task.reviewerId, task.observerId].filter(id => id && id !== user.id));

                        // If it's a reply, specifically notify the author of the parent comment
                        if (parentId) {
                            const parentComment = get().comments.find(c => c.id === parentId);
                            if (parentComment && parentComment.userId !== user.id) {
                                notificationTargets.add(parentComment.userId);
                            }
                        }

                        for (const memberId of Array.from(notificationTargets)) {
                            const isReplyToMe = parentId && get().comments.find(c => c.id === parentId)?.userId === memberId;

                            await supabase.from('notifications').insert([{
                                user_id: memberId,
                                actor_id: user.id,
                                task_id: taskId,
                                content: isReplyToMe
                                    ? `${get().currentUser.name} replied to your comment: "${content.slice(0, 20)}..."`
                                    : `New comment on task: ${task.title}`,
                                type: 'comment'
                            }]);
                        }
                    }
                }
            },

            markAsRead: async (notificationId) => {
                const supabase = createClient();
                const { error } = await supabase
                    .from('notifications')
                    .update({ is_read: true })
                    .eq('id', notificationId);

                if (error) {
                    console.error('Error marking notification as read:', error);
                    return;
                }

                set((state) => ({
                    notifications: state.notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n)
                }));
            },

            isSidebarOpen: true,
            toggleSidebar: () => set((state) => ({ isSidebarOpen: !state.isSidebarOpen })),
            setSidebarOpen: (isOpen) => set({ isSidebarOpen: isOpen }),

            setUserProfile: (profile) => set((state) => ({
                currentUser: { ...state.currentUser, id: profile.id || state.currentUser.id, name: profile.name, role: profile.role }
            })),
        }),
        {
            name: 'task-manager-storage',
        }
    )
);
