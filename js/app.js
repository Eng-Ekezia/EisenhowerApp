// js/app.js

import { taskService } from './services/task-service.js';
import { uiManager } from './ui/ui-manager.js';

let tasks = [];
// **NOVO: Variável para guardar o estado do arraste**
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
    
    onUpdate: (taskId, updates) => {
        tasks = taskService.updateTask(tasks, taskId, updates);
    },
    
    onSaveNewTask: (quadrant, text) => {
        tasks = taskService.addTask(tasks, quadrant, text);
        render();
    },

    // **NOVO: Handlers para a lógica de Drag-and-Drop**
    /** Guarda o ID da tarefa quando o arraste começa. */
    onDragStart: (taskId) => {
        draggedTaskId = taskId;
    },

    /** Lida com o evento de soltar a tarefa. */
    onDrop: (newQuadrantId) => {
        if (draggedTaskId) {
            tasks = taskService.updateTask(tasks, draggedTaskId, { quadrant: newQuadrantId });
            render();
        }
        // Limpa o estado após o drop
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
    // **NOVO: Vincula os eventos de drop aos quadrantes**
    uiManager.bindDragAndDropEvents(eventHandlers);
    render();
}

init();