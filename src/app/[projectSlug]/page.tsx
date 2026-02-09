"use client";

import { use, useEffect, useState } from "react";
import { useStore } from "@/lib/store";
import { Task, TaskStatus } from "@/lib/types";
import { TaskCard } from "@/components/task/TaskCard";
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
        router.push(`/${projectSlug}/task/${task.id}`);
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

        // Find the columns tasks
        const filteredTasks = tasks.filter(t => t.projectId === project.id && t.status === newStatus);

        // If moving within the same column, remove the dragged task first to get accurate neighbors
        const otherTasks = destination.droppableId === source.droppableId
            ? filteredTasks.filter(t => t.id !== draggableId)
            : filteredTasks;

        const sortedOthers = otherTasks.sort((a, b) => a.position - b.position);

        // Calculate new position
        let newPos: number;

        if (sortedOthers.length === 0) {
            newPos = 1024;
        } else if (destination.index === 0) {
            newPos = sortedOthers[0].position / 2;
        } else if (destination.index >= sortedOthers.length) {
            newPos = sortedOthers[sortedOthers.length - 1].position + 1024;
        } else {
            // Drop between two items
            const prevTask = sortedOthers[destination.index - 1];
            const nextTask = sortedOthers[destination.index];
            newPos = (prevTask.position + nextTask.position) / 2;
        }

        // Optimistic local update to prevent jumping
        const updatedTaskObj = tasks.find(t => t.id === draggableId);
        if (updatedTaskObj) {
            const newTask = { ...updatedTaskObj, status: newStatus, position: newPos };
            useStore.setState({
                tasks: tasks.map(t => t.id === draggableId ? newTask : t)
            });
        }

        // Persistent update
        updateTask(draggableId, { status: newStatus, position: newPos });
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
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 md:gap-6 mb-8 mt-2 md:mt-0">
                <div className="space-y-1">
                    <h1 className="text-3xl md:text-4xl font-black tracking-tight text-foreground leading-tight">{project.name}</h1>
                    <div className="flex items-center gap-2 uppercase tracking-[0.2em] font-bold text-[10px] md:text-xs text-muted-foreground opacity-80">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                        <span>{projectTasks.length} {projectTasks.length === 1 ? 'task' : 'tasks'}</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-secondary/10 p-1.5 rounded-2xl border border-white/5 backdrop-blur-sm shadow-xl relative overflow-hidden group/container w-fit md:w-auto mt-2 md:mt-0">
                    {/* Subtle sliding glow effect for the header actions */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover/container:translate-x-full transition-transform duration-1000 ease-in-out" />

                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                            if (currentUser.role === 'admin') {
                                setIsEditModalOpen(true);
                            } else {
                                setIsDetailsModalOpen(true);
                            }
                        }}
                        className="w-10 h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all duration-300 relative z-10"
                        title={currentUser.role === 'admin' ? "Edit Project" : "Project Info"}
                    >
                        {currentUser.role === 'admin' ? (
                            <Edit3 className="w-5 h-5" />
                        ) : (
                            <Info className="w-5 h-5" />
                        )}
                    </Button>

                    {currentUser.role === 'admin' && (
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setIsDeleteModalOpen(true)}
                            className="w-10 h-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-300 relative z-10"
                            title="Delete Project"
                        >
                            <Trash2 className="w-5 h-5" />
                        </Button>
                    )}

                    <div className="w-px h-6 bg-white/10 mx-1 relative z-10" />

                    {(currentUser.role === 'admin' || currentUser.role === 'dev') && (
                        <Button
                            onClick={handleCreateTask}
                            className="h-10 px-5 rounded-xl bg-primary text-primary-foreground font-bold shadow-[0_0_20px_rgba(34,197,94,0.2)] hover:shadow-[0_0_30_rgba(34,197,94,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 relative z-10 whitespace-nowrap"
                        >
                            <Plus className="w-4 h-4 mr-2 stroke-[3px]" />
                            New Task
                        </Button>
                    )}
                </div>
            </div>

            <DragDropContext onDragEnd={onDragEnd}>
                <div className="flex-1 overflow-x-auto">
                    <div className="flex gap-6 min-w-max pb-4 h-full">
                        {STATUS_COLUMNS.map(status => {
                            const columnTasks = projectTasks
                                .filter(t => t.status === status)
                                .sort((a, b) => a.position - b.position);
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

            {/* Task View Modals are now replaced by individual pages */}

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
