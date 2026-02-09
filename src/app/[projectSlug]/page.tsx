"use client";

import { use, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "@/components/task/TaskCard";
import { TaskModal } from "@/components/task/TaskModal";
import { CreateTaskModal } from "@/components/task/CreateTaskModal";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Edit3 } from "lucide-react";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import { DeleteProjectConfirmModal } from "@/components/project/DeleteProjectConfirmModal";
import { EditProjectModal } from "@/components/project/EditProjectModal";
import { ProjectDetailsModal } from "@/components/project/ProjectDetailsModal";
import { useRouter } from "next/navigation";
import { Info } from "lucide-react";

interface ProjectPageProps {
    params: Promise<{ projectSlug: string }>;
}

const STATUS_COLUMNS: TaskStatus[] = ['New', 'In Progress', 'Review', 'Done'];

export default function ProjectPage({ params }: ProjectPageProps) {
    const { projectSlug } = use(params);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
    const [isClient, setIsClient] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { projects, tasks, currentUser, updateTask, deleteProject } = useStore();
    const router = useRouter();

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return null;

    // Find project by slug
    const project = projects.find(p => p.slug === projectSlug);
    const projectTasks = project ? tasks.filter(t => t.projectId === project.id) : [];

    if (!project) {
        return (
            <div className="flex items-center justify-center h-full text-muted-foreground">
                Project not found
            </div>
        );
    }

    const handleCreateTask = () => {
        setIsCreateModalOpen(true);
    };

    const handleTaskClick = (task: Task) => {
        setSelectedTask(task);
        setIsModalOpen(true);
    };

    const onDragEnd = (result: DropResult) => {
        const { destination, source, draggableId } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        const newStatus = destination.droppableId as TaskStatus;
        updateTask(draggableId, { status: newStatus });
    };

    const handleDeleteProject = async () => {
        if (project) {
            await deleteProject(project.id);
            setIsDeleteModalOpen(false);
            router.push("/");
        }
    };

    const handleProjectRenamed = (newSlug: string) => {
        router.push(`/${newSlug}`);
    };

    return (
        <div className="h-full flex flex-col">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{project.name}</h1>
                    <p className="text-muted-foreground">{projectTasks.length} tasks</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsDetailsModalOpen(true)}
                        className="text-muted-foreground hover:text-primary transition-colors"
                    >
                        <Info className="w-5 h-5" />
                    </Button>

                    {currentUser.role === 'admin' && (
                        <>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsEditModalOpen(true)}
                                className="text-muted-foreground hover:text-primary transition-colors"
                            >
                                <Edit3 className="w-5 h-5" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => setIsDeleteModalOpen(true)}
                                className="text-muted-foreground hover:text-destructive transition-colors mr-2"
                            >
                                <Trash2 className="w-5 h-5" />
                            </Button>
                        </>
                    )}
                    {(currentUser.role === 'admin' || currentUser.role === 'dev') && (
                        <Button onClick={handleCreateTask}>
                            <Plus className="w-4 h-4 mr-2" />
                            New Task
                        </Button>
                    )}
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-6 min-w-max pb-4 h-full">
                        {STATUS_COLUMNS.map(status => {
                            const columnTasks = projectTasks.filter(t => t.status === status);
                            return (
                                <Droppable droppableId={status} key={status}>
                                    {(provided) => (
                                        <div
                                            {...provided.droppableProps}
                                            ref={provided.innerRef}
                                            className="w-80 flex flex-col gap-4"
                                        >
                                            <div className="flex items-center justify-between px-1">
                                                <h3 className="font-semibold text-sm text-muted-foreground">{status}</h3>
                                                <span className="text-xs font-mono bg-accent px-2 py-0.5 rounded-full text-foreground">
                                                    {columnTasks.length}
                                                </span>
                                            </div>
                                            <div className="flex-1 bg-muted/5 rounded-xl p-2 space-y-3 overflow-y-auto min-h-[200px]">
                                                {columnTasks.map((task, index) => (
                                                    <Draggable key={task.id} draggableId={task.id} index={index}>
                                                        {(provided, snapshot) => (
                                                            <div
                                                                ref={provided.innerRef}
                                                                {...provided.draggableProps}
                                                                {...provided.dragHandleProps}
                                                                className={snapshot.isDragging ? "opacity-70" : ""}
                                                            >
                                                                <TaskCard task={task} onClick={handleTaskClick} />
                                                            </div>
                                                        )}
                                                    </Draggable>
                                                ))}
                                                {provided.placeholder}
                                                {columnTasks.length === 0 && (
                                                    <div className="h-24 rounded-lg border border-dashed border-muted-foreground/20 flex items-center justify-center text-xs text-muted-foreground/50">
                                                        No tasks
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </Droppable>
                            );
                        })}
                    </div>
                </div>
            </DragDropContext>

            <TaskModal
                task={selectedTask}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                role={currentUser.role}
            />

            <CreateTaskModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                projectId={project.id}
            />

            <DeleteProjectConfirmModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleDeleteProject}
                projectName={project.name}
            />

            <EditProjectModal
                project={project}
                isOpen={isEditModalOpen}
                onClose={() => setIsEditModalOpen(false)}
                onSuccess={handleProjectRenamed}
            />

            <ProjectDetailsModal
                project={project}
                isOpen={isDetailsModalOpen}
                onClose={() => setIsDetailsModalOpen(false)}
            />
        </div >
    );
}
