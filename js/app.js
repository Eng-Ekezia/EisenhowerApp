// js/app.js

import { taskService } from './services/task-service.js';
import { uiManager } from './ui/ui-manager.js';

let tasks = [];
let draggedTaskId = null;

const eventHandlers = {
    onToggleComplete: (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            tasks = taskService.updateTask(tasks, taskId, { completed: !task.completed });
            render();
        }
    },
    
    onDelete: (taskId) => {
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            tasks = taskService.deleteTask(tasks, taskId);
            render();
        }
    },
    
    /** ATUALIZAÇÃO 1: onUpdate agora chama render() */
    onUpdate: (taskId, updates) => {
        tasks = taskService.updateTask(tasks, taskId, updates);
        // Esta chamada garante que a UI seja redesenhada após qualquer atualização,
        // como a mudança de uma data de vencimento.
        render();
    },
    
    /** ATUALIZAÇÃO 2: onSaveNewTask agora aceita dueDate */
    onSaveNewTask: (quadrant, text, dueDate) => {
        tasks = taskService.addTask(tasks, quadrant, text, dueDate);
        render();
    },

    onDragStart: (taskId) => {
        draggedTaskId = taskId;
    },

    onDrop: (newQuadrantId) => {
        if (draggedTaskId) {
            // Verifica se a tarefa foi solta em um quadrante diferente para evitar renderização desnecessária
            const task = tasks.find(t => t.id === draggedTaskId);
            if (task && task.quadrant !== newQuadrantId) {
                tasks = taskService.updateTask(tasks, draggedTaskId, { quadrant: newQuadrantId });
                render();
            }
        }
        draggedTaskId = null;
    }
};

function render() {
    uiManager.renderTasks(tasks, eventHandlers);
}

function bindStaticEvents() {
    document.querySelectorAll('.add-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const quadrant = btn.dataset.quadrant;
            uiManager.showTaskInput(quadrant, eventHandlers);
        });
    });
}

function init() {
    tasks = taskService.getTasks();
    bindStaticEvents();
    uiManager.bindDragAndDropEvents(eventHandlers);
    render();
}

init();