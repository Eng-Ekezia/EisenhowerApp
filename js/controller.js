// js/controller.js

import { setState, getState } from './state.js';
import { taskService } from './services/task-service.js';
import { archiveService } from './services/archive-service.js';
import { dataService } from './services/data-service.js';
import { projectService } from './services/project-service.js'; // Importa o novo serviço

export const eventHandlers = {
    onToggleComplete: (taskId) => {
        const { tasks } = getState();
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            const updatedTasks = taskService.updateTask(tasks, taskId, { completed: !task.completed });
            setState({ tasks: updatedTasks });
        }
    },
    onDelete: (taskId) => {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            const { tasks } = getState();
            const updatedTasks = taskService.deleteTask(tasks, taskId);
            setState({ tasks: updatedTasks });
        }
    },
    onArchive: (taskId) => {
        if (confirm('Deseja arquivar esta tarefa concluída?')) {
            const { tasks } = getState();
            const updatedTasks = taskService.archiveTask(tasks, taskId);
            setState({ tasks: updatedTasks });
        }
    },
    onRestore: (taskId) => {
        const restoredTask = taskService.restoreTask(taskId);
        if (restoredTask) {
            const { tasks } = getState();
            const newArchivedTasks = archiveService.getArchivedTasks();
            setState({
                tasks: [...tasks, restoredTask],
                archivedTasks: newArchivedTasks
            });
        }
    },
    onDeletePermanently: (taskId) => {
        if (confirm('Esta ação não pode ser desfeita. Excluir permanentemente?')) {
            taskService.deletePermanently(taskId);
            const newArchivedTasks = archiveService.getArchivedTasks();
            setState({ archivedTasks: newArchivedTasks });
        }
    },
    onUpdate: (taskId, updates) => {
        const { tasks } = getState();
        const updatedTasks = taskService.updateTask(tasks, taskId, updates);
        setState({ tasks: updatedTasks });
    },
    onSaveNewTask: (quadrant, text, dueDate) => {
        const { tasks, viewingProjectId } = getState();
        // Associa a nova tarefa ao projeto que está sendo visualizado, se houver.
        const updatedTasks = taskService.addTask(tasks, quadrant, text, dueDate, viewingProjectId);
        setState({ tasks: updatedTasks });
    },
    onDrop: (taskId, newQuadrantId, targetId) => {
        const { tasks } = getState();
        const updatedTasks = taskService.moveTask(tasks, {
            draggedId: taskId,
            targetId: targetId,
            newQuadrantId: newQuadrantId
        });
        setState({ tasks: updatedTasks });
    },
    onToggleMatrixView: () => {
        const { matrixViewMode } = getState();
        const newMode = matrixViewMode === 'grid' ? 'columns' : 'grid';
        setState({ matrixViewMode: newMode });
    },
    onSetView: (viewName) => {
        if (['matrix', 'projects'].includes(viewName)) {
            // Ao trocar para a view de projetos, sempre reseta para a lista principal
            setState({ activeView: viewName, viewingProjectId: null });
        }
    },
    onAddSubtask: (taskId, subtaskText) => {
        const { tasks } = getState();
        const { updatedTasks } = taskService.addSubtask(tasks, taskId, subtaskText);
        setState({ tasks: updatedTasks });
    },
    onUpdateSubtask: (taskId, subtaskId, updates) => {
        const { tasks } = getState();
        const updatedTasks = taskService.updateSubtask(tasks, taskId, subtaskId, updates);
        setState({ tasks: updatedTasks });
    },
    onDeleteSubtask: (taskId, subtaskId) => {
        const { tasks } = getState();
        const updatedTasks = taskService.deleteSubtask(tasks, taskId, subtaskId);
        setState({ tasks: updatedTasks });
    },

    // --- Handlers para a View de Projetos ---
    onViewProject: (projectId) => {
        setState({ viewingProjectId: projectId });
    },
    onBackToProjectList: () => {
        setState({ viewingProjectId: null });
    },
    // NOVO HANDLER PARA SALVAR PROJETO
    onSaveNewProject: (projectData) => {
        if (!projectData.name || !projectData.name.trim()) {
            alert('O nome do projeto é obrigatório.');
            return;
        }
        const updatedProjects = projectService.addProject(projectData);
        setState({ projects: updatedProjects });
    }
};

export function init() {
    // Carrega todos os dados iniciais
    const initialTasks = taskService.getTasks();
    const initialArchivedTasks = archiveService.getArchivedTasks();
    const initialProjects = projectService.getProjects(); // Carrega os projetos
    
    // Define o estado inicial completo da aplicação
    setState({
        tasks: initialTasks,
        archivedTasks: initialArchivedTasks,
        projects: initialProjects,
        activeView: 'matrix', // Garante que a app sempre comece na matriz
        viewingProjectId: null // Garante que a view de projetos comece na lista
    });
}