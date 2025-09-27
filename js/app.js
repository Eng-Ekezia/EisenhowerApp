// js/app.js

import { taskService } from './services/task-service.js';
import { uiManager } from './ui/ui-manager.js';
import { notificationService } from './services/notification-service.js';
import { dataService } from './services/data-service.js';

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
    // NOVO: Handler para arquivar a tarefa
    onArchive: (taskId) => {
        if (confirm('Deseja arquivar esta tarefa concluída?')) {
            tasks = taskService.archiveTask(tasks, taskId);
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
            tasks = taskService.updateTask(tasks, draggedTaskId, { quadrant: newQuadrantId });
            render();
        }
        draggedTaskId = null;
    },
    onAddSubtask: (taskId, subtaskText) => {
        const { updatedTasks, newSubtask } = taskService.addSubtask(tasks, taskId, subtaskText);
        tasks = updatedTasks;
        if (newSubtask) {
            uiManager.appendSubtask(taskId, newSubtask, eventHandlers);
        }
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
    // --- SELEÇÃO DE ELEMENTOS ---
    const sheet = document.getElementById('sheet-menu');
    const openBtn = document.getElementById('menu-btn');
    const closeTriggers = document.querySelectorAll('[data-action="close-sheet"]');
    
    const helpBtn = document.getElementById('sheet-help-btn');
    const helpModal = document.getElementById('help-modal');
    
    const statsBtn = document.getElementById('sheet-stats-btn');
    const statsModal = document.getElementById('stats-modal');

    const exportBtn = document.getElementById('sheet-export-btn');
    const importBtn = document.getElementById('sheet-import-btn');
    const fileInput = document.getElementById('import-file-input');

    // --- LÓGICA DO MENU LATERAL (SHEET) ---
    const openSheet = () => {
        sheet.classList.remove('is-closing');
        sheet.classList.add('is-open');
    };
    const closeSheet = () => {
        sheet.classList.add('is-closing');
        sheet.addEventListener('animationend', () => {
            sheet.classList.remove('is-open');
            sheet.classList.remove('is-closing');
        }, { once: true });
    };

    if (sheet && openBtn) {
        openBtn.addEventListener('click', openSheet);
        closeTriggers.forEach(trigger => trigger.addEventListener('click', closeSheet));
    }

    // --- LÓGICA DOS BOTÕES E MODAIS ---
    if (helpBtn && helpModal) {
        helpBtn.addEventListener('click', () => {
            helpModal.classList.remove('hidden');
            closeSheet();
        });
        helpModal.querySelector('.modal__close').addEventListener('click', () => helpModal.classList.add('hidden'));
        helpModal.querySelector('.modal__overlay').addEventListener('click', () => helpModal.classList.add('hidden'));
    }

    if (statsBtn && statsModal) {
        statsBtn.addEventListener('click', () => {
            const stats = dataService.calculateStats(tasks);
            uiManager.displayStats(stats);
            statsModal.classList.remove('hidden');
            closeSheet();
        });
        statsModal.querySelector('#close-stats-modal').addEventListener('click', () => statsModal.classList.add('hidden'));
        statsModal.querySelector('[data-action="close-stats-modal"]').addEventListener('click', () => statsModal.classList.add('hidden'));
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            dataService.exportTasks(tasks);
            closeSheet();
        });
    }

    if (importBtn && fileInput) {
        importBtn.addEventListener('click', () => {
            fileInput.click();
            closeSheet();
        });
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonContent = e.target.result;
                if (confirm('Atenção: Isso substituirá todas as suas tarefas atuais. Deseja continuar?')) {
                    const newTasks = dataService.importTasks(jsonContent);
                    if (newTasks) {
                        tasks = newTasks;
                        taskService.saveTasks(tasks);
                        render();
                        alert('Tarefas importadas com sucesso!');
                    } else {
                        alert('Erro: O arquivo selecionado é inválido ou está corrompido.');
                    }
                }
                fileInput.value = '';
            };
            reader.readAsText(file);
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