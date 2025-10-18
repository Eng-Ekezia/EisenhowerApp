// js/controller.js

import { setState, getState } from './state.js';
import { taskService } from './services/task-service.js';
import { archiveService } from './services/archive-service.js';
import { dataService } from './services/data-service.js';
import { projectService } from './services/project-service.js';
// NOVO: Importa o serviço de arquivamento de projetos
import { projectArchiveService } from './services/project-archive-service.js';

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
        const { tasks } = getState();
        const updatedTasks = taskService.addTask(tasks, quadrant, text, dueDate, null);
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
    onSaveNewProject: (projectData) => {
        if (!projectData.name || !projectData.name.trim()) {
            alert('O nome do projeto é obrigatório.');
            return;
        }
        const updatedProjects = projectService.addProject(projectData);
        setState({ projects: updatedProjects });
    },
    onUpdateProject: (projectId, projectData) => {
        if (!projectData.name || !projectData.name.trim()) {
            alert('O nome do projeto é obrigatório.');
            return;
        }
        const updatedProjects = projectService.updateProject(projectId, projectData);
        setState({ projects: updatedProjects });
    },
    onDeleteProject: (projectId) => {
        const { projects, tasks } = getState();
        const projectToDelete = projects.find(p => p.id === projectId);
        
        if (confirm(`Atenção: Você está prestes a excluir o projeto "${projectToDelete.name}" e TODAS as suas tarefas associadas. Esta ação não pode ser desfeita. Deseja continuar?`)) {
            // Exclui o projeto
            const updatedProjects = projectService.deleteProject(projectId);
            // Exclui as tarefas associadas
            const updatedTasks = taskService.deleteTasksByProjectId(tasks, projectId);
            
            // Atualiza o estado e volta para a lista de projetos
            setState({ 
                projects: updatedProjects,
                tasks: updatedTasks,
                viewingProjectId: null // Garante que saia da tela de detalhes
            });
        }
    },
    onSaveNewProjectTask: (projectId, taskText) => {
        const { tasks } = getState();
        const updatedTasks = taskService.addTask(tasks, null, taskText, null, projectId);
        setState({ tasks: updatedTasks });
    },
    
    // --- Handlers para Tarefas Planejadas ---
    onUpdateProjectTask: (taskId, updates) => {
        const { tasks } = getState();
        const updatedTasks = taskService.updateTask(tasks, taskId, updates);
        setState({ tasks: updatedTasks });
    },
    onDeleteProjectTask: (taskId) => {
        if (confirm('Tem certeza que deseja excluir esta tarefa planejada?')) {
            const { tasks } = getState();
            const updatedTasks = taskService.deleteTask(tasks, taskId);
            setState({ tasks: updatedTasks });
        }
    },
    onPromoteTaskToMatrix: (taskId, isUrgent, isImportant) => {
        let quadrant;
        if (isImportant && isUrgent) quadrant = 'q1';
        else if (isImportant && !isUrgent) quadrant = 'q2';
        else if (!isImportant && isUrgent) quadrant = 'q3';
        else quadrant = 'q4';

        const { tasks } = getState();
        const updatedTasks = taskService.updateTask(tasks, taskId, { quadrant: quadrant });
        setState({ tasks: updatedTasks });
    },

    // --- NOVOS HANDLERS: CICLO DE VIDA DO PROJETO ---
    onCompleteProject: (projectId) => {
        const { projects } = getState();
        const project = projects.find(p => p.id === projectId);
        if (!project) return;
        
        // Alterna o status
        const newStatus = project.status === 'completed' ? 'active' : 'completed';
        const updatedProjects = projectService.updateProject(projectId, { status: newStatus });
        setState({ projects: updatedProjects });
    },

    onArchiveProject: (projectId) => {
        const { projects } = getState();
        const projectToArchive = projects.find(p => p.id === projectId);
        if (!projectToArchive) return;

        if (confirm(`Deseja arquivar o projeto "${projectToArchive.name}"? As tarefas não serão excluídas, mas o projeto sairá da lista principal.`)) {
            // 1. Remove o projeto da lista ativa (atualizando seu status)
            const updatedProjects = projectService.updateProject(projectId, { status: 'archived' });
            
            // 2. Adiciona ao arquivo
            projectArchiveService.archiveProject(projectToArchive);
            
            // 3. Atualiza o estado
            const newActiveProjects = updatedProjects.filter(p => p.id !== projectId);
            const newArchivedProjects = projectArchiveService.getArchivedProjects();

            setState({ 
                projects: newActiveProjects,
                archivedProjects: newArchivedProjects,
                viewingProjectId: null // Volta para a lista de projetos
            });
        }
    },

    onRestoreProject: (projectId) => {
        const { restoredProject } = projectArchiveService.restoreProject(projectId);
        
        if (restoredProject) {
            // 1. Atualiza o status do projeto restaurado para 'active'
            const updatedProject = { ...restoredProject, status: 'active', completedAt: null };
            
            // 2. Salva a atualização no projectService
            const updatedProjectsList = projectService.updateProject(projectId, updatedProject);
            
            // 3. Adiciona o projeto de volta à lista ativa no estado
            const { projects } = getState();
            const newArchivedProjects = projectArchiveService.getArchivedProjects();
            
            setState({
                projects: [...projects, updatedProject],
                archivedProjects: newArchivedProjects
            });
        }
    },

    onDeletePermanentlyProject: (projectId) => {
        const { archivedProjects, tasks } = getState();
        const projectToDelete = archivedProjects.find(p => p.id === projectId);
        
        if (confirm(`Atenção: Excluir permanentemente o projeto "${projectToDelete.name}" também excluirá TODAS as suas tarefas associadas. Esta ação não pode ser desfeita. Deseja continuar?`)) {
            // 1. Exclui o projeto do arquivo
            projectArchiveService.deletePermanently(projectId);
            
            // 2. Exclui as tarefas associadas
            const updatedTasks = taskService.deleteTasksByProjectId(tasks, projectId);
            
            // 3. Atualiza o estado
            const newArchivedProjects = projectArchiveService.getArchivedProjects();
            setState({ 
                tasks: updatedTasks,
                archivedProjects: newArchivedProjects
            });
        }
    }
};

export function init() {
    // Esta função agora é chamada pelo app.js, que cuida de carregar os dados.
    // Esta função pode ser usada para outras inicializações específicas do controller,
    // mas o carregamento dos dados foi centralizado no app.js.
    
    // (Código de carregamento de dados removido daqui e centralizado no app.js init)
}