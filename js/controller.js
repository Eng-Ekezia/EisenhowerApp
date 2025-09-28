// js/controller.js

import { setState, getState } from './state.js';
import { taskService } from './services/task-service.js';
import { archiveService } from './services/archive-service.js';
import { dataService } from './services/data-service.js';

// Os manipuladores de eventos agora vivem aqui.
// Eles não manipulam mais a variável 'tasks' diretamente, mas usam o 'getState' e 'setState'.
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
            const { tasks, archivedTasks } = getState();
            setState({
                tasks: [...tasks, restoredTask],
                archivedTasks: archivedTasks.filter(t => t.id !== taskId)
            });
        }
    },
    onDeletePermanently: (taskId) => {
        if (confirm('Esta ação não pode ser desfeita. Excluir permanentemente?')) {
            taskService.deletePermanently(taskId);
            const { archivedTasks } = getState();
            setState({ archivedTasks: archivedTasks.filter(t => t.id !== taskId) });
        }
    },
    onUpdate: (taskId, updates) => {
        const { tasks } = getState();
        const updatedTasks = taskService.updateTask(tasks, taskId, updates);
        setState({ tasks: updatedTasks });
    },
    onSaveNewTask: (quadrant, text, dueDate) => {
        const { tasks } = getState();
        const updatedTasks = taskService.addTask(tasks, quadrant, text, dueDate);
        setState({ tasks: updatedTasks });
    },
    onDragStart: (taskId) => {
        setState({ draggedTaskId: taskId });
    },
    onDrop: (newQuadrantId) => {
        const { tasks, draggedTaskId } = getState();
        if (draggedTaskId) {
            const updatedTasks = taskService.updateTask(tasks, draggedTaskId, { quadrant: newQuadrantId });
            setState({ tasks: updatedTasks, draggedTaskId: null });
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
    }
};

/**
 * Função de inicialização do controlador.
 * Carrega os dados iniciais dos serviços e popula o estado central.
 */
export function init() {
    const initialTasks = taskService.getTasks();
    const initialArchivedTasks = archiveService.getArchivedTasks();
    
    setState({
        tasks: initialTasks,
        archivedTasks: initialArchivedTasks
    });
}