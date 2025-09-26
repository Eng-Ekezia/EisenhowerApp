// js/app.js

import { taskService } from './services/task-service.js';
import { uiManager } from './ui/ui-manager.js';
import { notificationService } from './services/notification-service.js';

let tasks = [];
let draggedTaskId = null;

const eventHandlers = {
    onToggleComplete: (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            tasks = taskService.updateTask(tasks, taskId, { completed: !task.completed });
            render(); // Render() é ok aqui pois afeta o estado visual completo da tarefa
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
        // Não renderiza para não interromper a edição. O 'blur' salva.
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
            tasks = taskService.updateTask(tasks, draggedTaskId, { quadrant: newQuadrantId });
            render();
        }
        draggedTaskId = null;
    },

    // --- INÍCIO DA ATUALIZAÇÃO ---
    onAddSubtask: (taskId, subtaskText) => {
        const { updatedTasks, newSubtask } = taskService.addSubtask(tasks, taskId, subtaskText);
        tasks = updatedTasks;

        // Se a subtarefa foi criada com sucesso, apenas a adiciona na tela
        if (newSubtask) {
            uiManager.appendSubtask(taskId, newSubtask, eventHandlers);
        }
        // NENHUMA CHAMADA PARA render() AQUI!
    },
    // --- FIM DA ATUALIZAÇÃO ---

    onUpdateSubtask: (taskId, subtaskId, updates) => {
        tasks = taskService.updateSubtask(tasks, taskId, subtaskId, updates);
        render(); // Render() é necessário para atualizar o estado visual (ex: texto riscado)
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
    // --- INÍCIO DA NOVA LÓGICA DO MENU LATERAL (SHEET) ---

    const sheet = document.getElementById('sheet-menu');
    const openBtn = document.getElementById('menu-btn');
    const closeTriggers = document.querySelectorAll('[data-action="close-sheet"]');

    const openSheet = () => {
        sheet.classList.remove('is-closing');
        sheet.classList.add('is-open');
    };

    const closeSheet = () => {
        sheet.classList.add('is-closing');
        // Remove a classe 'is-open' após a animação de saída terminar
        sheet.addEventListener('animationend', () => {
            sheet.classList.remove('is-open');
            sheet.classList.remove('is-closing');
        }, { once: true });
    };

    if (sheet && openBtn) {
        openBtn.addEventListener('click', openSheet);
        closeTriggers.forEach(trigger => trigger.addEventListener('click', closeSheet));
    }

    // --- FIM DA LÓGICA DO SHEET ---

    // Lógica dos botões DENTRO do menu
    const viewToggleBtn = document.getElementById('sheet-view-toggle-btn');
    if (viewToggleBtn) {
        const matrix = document.getElementById('matrix');
        const iconGrid = document.getElementById('icon-grid-view');
        const iconColumn = document.getElementById('icon-column-view');

        viewToggleBtn.addEventListener('click', () => {
            const currentView = matrix.dataset.viewMode;
            if (currentView === 'grid') {
                matrix.dataset.viewMode = 'columns';
                iconGrid.classList.add('hidden');
                iconColumn.classList.remove('hidden');
            } else {
                matrix.dataset.viewMode = 'grid';
                iconGrid.classList.remove('hidden');
                iconColumn.classList.add('hidden');
            }
        });
    }

    const helpBtn = document.getElementById('sheet-help-btn');
    const statsBtn = document.getElementById('sheet-stats-btn');
    const helpModal = document.getElementById('help-modal');
    const statsModal = document.getElementById('stats-modal');

    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
            closeSheet(); // Fecha o menu ao abrir o modal
        });
        helpModal.querySelector('.modal__overlay').addEventListener('click', () => helpModal.classList.add('hidden'));
        helpModal.querySelector('.modal__close').addEventListener('click', () => helpModal.classList.add('hidden'));
    }

    if (statsBtn && statsModal) {
        statsBtn.addEventListener('click', () => {
            statsModal.classList.remove('hidden');
            closeSheet(); // Fecha o menu ao abrir o modal
        });
        statsModal.querySelector('.modal__overlay').addEventListener('click', () => statsModal.classList.add('hidden'));
        statsModal.querySelector('.modal__close').addEventListener('click', () => statsModal.classList.add('hidden'));
    }

    // Listener para os botões "Adicionar Tarefa" (permanece o mesmo)
    document.querySelectorAll('.add-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const quadrant = btn.closest('.quadrant').dataset.quadrant;
            uiManager.showTaskInput(quadrant, eventHandlers);
        });
    });
}

function init() {
    tasks = taskService.getTasks();
    bindStaticEvents();
    uiManager.bindDragAndDropEvents(eventHandlers);
    notificationService.start(() => tasks); 
    render();
}

init();