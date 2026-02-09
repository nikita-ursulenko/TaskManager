export type Role = 'admin' | 'dev';

export type TaskStatus = 'New' | 'In Progress' | 'Review' | 'Done';

export interface User {
    id: string;
    name: string;
    role: Role;
    avatar?: string;
}

export interface Attachment {
    name: string;
    url: string;
}

export interface Task {
    id: string;
    projectId: string; // Foreign key to Project
    title: string;
    description: string;
    budget: number; // in Euro
    deadline?: string; // ISO date string
    status: TaskStatus;
    attachments: Attachment[]; // Labeled URLs (Requirements)
    executionAttachments?: Attachment[]; // Labeled URLs (Evidence)
    // Dev fields
    evidence?: string; // Link to screenshot or hosted image
    notes?: string;
    blockers?: string;
    // Metadata
    isPaid?: boolean;
    assigneeId?: string;
    reviewerId?: string;
    observerId?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    slug: string;
    description?: string;
    vercelUrl?: string;
    githubUrl?: string;
    siteUrl?: string;
}

export interface Comment {
    id: string;
    taskId: string;
    userId: string;
    content: string;
    parentId?: string; // Added for replies
    createdAt: string;
    userName?: string; // Opt-in join
}

export interface Notification {
    id: string;
    userId: string;
    taskId?: string;
    content: string;
    isRead: boolean;
    type: 'comment' | 'assignment' | 'status_change';
    createdAt: string;
}
