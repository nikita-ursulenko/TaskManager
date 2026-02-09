export type Role = 'admin' | 'dev';

export type TaskStatus = 'New' | 'In Progress' | 'Review' | 'Done';

export interface User {
    id: string;
    name: string;
    role: Role;
    avatar?: string;
}

export interface Task {
    id: string;
    projectId: string; // Foreign key to Project
    title: string;
    description: string;
    budget: number; // in Euro
    deadline?: string; // ISO date string
    status: TaskStatus;
    attachments: string[]; // URLs of attached images
    // Dev fields
    evidence?: string; // Link to screenshot or hosted image
    notes?: string;
    blockers?: string;
    // Metadata
    isPaid?: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface Project {
    id: string;
    name: string;
    slug: string;
}
