// js/app.js

import { taskService } from './services/task-service.js';
import { uiManager } from './ui/ui-manager.js';
import { notificationService } from './services/notification-service.js'; // 1. ADICIONE ESTA LINHA

let tasks = [];
let draggedTaskId = null;

const eventHandlers = {
    // ... (todo o seu código de eventHandlers permanece igual)
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
    
    onSaveNewTask: (quadrant, text, dueDate) => {
        tasks = taskService.addTask(tasks, quadrant, text, dueDate);
        render();
    },

    onDragStart: (taskId) => {
        draggedTaskId = taskId;
    },

    onDrop: (newQuadrantId) => {
        if (draggedTaskId) {
            const task = tasks.find(t => t.id === draggedTaskId);
            if (task && task.quadrant !== newQuadrantId) {
                tasks = taskService.updateTask(tasks, draggedTaskId, { quadrant: newQuadrantId });
                render();
            }
        }
        draggedTaskId = null;
    },

    onAddSubtask: (taskId, subtaskText) => {
        tasks = taskService.addSubtask(tasks, taskId, subtaskText);
        render();
    },

    onUpdateSubtask: (taskId, subtaskId, updates) => {
        tasks = taskService.updateSubtask(tasks, taskId, subtaskId, updates);
        render();
    },
    
    onDeleteSubtask: (taskId, subtaskId) => {
        tasks = taskService.deleteSubtask(tasks, taskId, subtaskId);
        render();
    }
};

function render() {
    uiManager.renderTasks(tasks, eventHandlers);
}

function bindStaticEvents() {
    // ... (toda a função bindStaticEvents permanece igual)
    const helpBtn = document.getElementById('help-btn');
    const statsBtn = document.getElementById('stats-btn');
    const helpModal = document.getElementById('help-modal');
    const statsModal = document.getElementById('stats-modal');
    const closeHelpBtn = document.getElementById('close-help');
    const closeStatsBtn = document.getElementById('close-stats');

    if(helpBtn) helpBtn.addEventListener('click', () => helpModal.classList.remove('hidden'));
    if(statsBtn) statsBtn.addEventListener('click', () => {
        document.getElementById('stats-content').innerHTML = `<p>Total de tarefas: ${tasks.length}</p>`;
        statsModal.classList.remove('hidden');
    });
    
    if(closeHelpBtn) closeHelpBtn.addEventListener('click', () => helpModal.classList.add('hidden'));
    if(closeStatsBtn) closeStatsBtn.addEventListener('click', () => statsModal.classList.add('hidden'));
    
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
    notificationService.start(() => tasks); // 2. INICIE O SERVIÇO DE NOTIFICAÇÕES AQUI
    render();
}

init();