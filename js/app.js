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
    // --- INÍCIO DA CORREÇÃO DOS BOTÕES DO HEADER ---
    const helpBtn = document.getElementById('help-btn');
    const statsBtn = document.getElementById('stats-btn');
    const helpModal = document.getElementById('help-modal');
    const statsModal = document.getElementById('stats-modal');
    const closeHelpModal = document.getElementById('close-help-modal');
    const closeStatsModal = document.getElementById('close-stats-modal');

    // Função para abrir um modal
    const openModal = (modal) => modal.classList.remove('hidden');

    // Função para fechar um modal
    const closeModal = (modal) => modal.classList.add('hidden');

    // Eventos dos botões e modais
    if (helpBtn && helpModal && closeHelpModal) {
        helpBtn.addEventListener('click', () => openModal(helpModal));
        closeHelpModal.addEventListener('click', () => closeModal(helpModal));
        helpModal.querySelector('.modal__overlay').addEventListener('click', () => closeModal(helpModal));
    }

    if (statsBtn && statsModal && closeStatsModal) {
        statsBtn.addEventListener('click', () => openModal(statsModal));
        closeStatsModal.addEventListener('click', () => closeModal(statsModal));
        statsModal.querySelector('.modal__overlay').addEventListener('click', () => closeModal(statsModal));
    }
    // --- FIM DA CORREÇÃO ---

    // Listener para o botão de troca de visualização
    const viewToggleBtn = document.getElementById('view-toggle-btn');
    if (viewToggleBtn) {
        const matrix = document.getElementById('matrix');
        const iconGrid = document.getElementById('icon-grid-view');
        const iconColumn = document.getElementById('icon-column-view');

        viewToggleBtn.addEventListener('click', () => {
            // Pega o modo de visualização atual pelo atributo data-*
            const currentView = matrix.dataset.viewMode;

            if (currentView === 'grid') {
                // Se está em grid, muda para colunas
                matrix.dataset.viewMode = 'columns';
                iconGrid.classList.add('hidden');
                iconColumn.classList.remove('hidden');
            } else {
                // Se está em colunas, volta para grid
                matrix.dataset.viewMode = 'grid';
                iconGrid.classList.remove('hidden');
                iconColumn.classList.add('hidden');
            }
        });
    }
    
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