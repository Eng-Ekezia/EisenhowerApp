// js/app.js

import { taskService } from './services/task-service.js';
import { uiManager } from './ui/ui-manager.js';
import { notificationService } from './services/notification-service.js';
import { dataService } from './services/data-service.js';
// NOVO: Importamos o archiveService para obter os dados do arquivo morto.
import { archiveService } from './services/archive-service.js';

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
    onArchive: (taskId) => {
        if (confirm('Deseja arquivar esta tarefa concluída?')) {
            tasks = taskService.archiveTask(tasks, taskId);
            render();
        }
    },
    // NOVO: Handler para restaurar uma tarefa do arquivo morto.
    onRestore: (taskId) => {
        const restoredTask = taskService.restoreTask(taskId);
        if (restoredTask) {
            tasks = [...tasks, restoredTask];
            render();
            // Reabre o modal com a lista atualizada.
            openArchiveModal(); 
        }
    },
    // NOVO: Handler para excluir permanentemente uma tarefa.
    onDeletePermanently: (taskId) => {
        if (confirm('Esta ação não pode ser desfeita. Excluir permanentemente?')) {
            taskService.deletePermanently(taskId);
            // Reabre o modal com a lista atualizada.
            openArchiveModal();
        }
    },
    onUpdate: (taskId, updates) => {
        tasks = taskService.updateTask(tasks, taskId, updates);
        // Não renderiza aqui para evitar perder o foco durante a edição do texto
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

// NOVO: Função para abrir e popular o modal de histórico.
function openArchiveModal() {
    const archivedTasks = archiveService.getArchivedTasks();
    uiManager.renderArchivedTasks(archivedTasks, eventHandlers);
    
    const archiveModal = document.getElementById('archive-modal');
    archiveModal.classList.remove('hidden');
    
    // Fecha o menu lateral se estiver aberto.
    const sheet = document.getElementById('sheet-menu');
    if (sheet.classList.contains('is-open')) {
        sheet.querySelector('[data-action="close-sheet"]').click();
    }
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

    // NOVO: Seleção dos elementos do modal de histórico.
    const archiveBtn = document.getElementById('sheet-archive-btn');
    const archiveModal = document.getElementById('archive-modal');
    const closeArchiveTriggers = document.querySelectorAll('[data-action="close-archive-modal"]');

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
        statsModal.querySelector('.modal__close').addEventListener('click', () => statsModal.classList.add('hidden'));
        statsModal.querySelector('.modal__overlay').addEventListener('click', () => statsModal.classList.add('hidden'));
    }
    
    // NOVO: Lógica para o modal de histórico.
    if (archiveBtn && archiveModal) {
        archiveBtn.addEventListener('click', openArchiveModal);
        closeArchiveTriggers.forEach(trigger => {
            trigger.addEventListener('click', () => archiveModal.classList.add('hidden'));
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            // A chamada agora não precisa de argumentos, pois o dataService busca os dados.
            dataService.exportTasks();
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
                if (confirm('Atenção: Isso substituirá todas as suas tarefas atuais e arquivadas. Deseja continuar?')) {
                    const importedData = dataService.importTasks(jsonContent);
                    if (importedData) {
                        // Salva as tarefas ativas e arquivadas em seus respectivos locais.
                        taskService.saveTasks(importedData.activeTasks);
                        archiveService.saveArchivedTasks(importedData.archivedTasks);
                        
                        // Atualiza o estado da aplicação e renderiza.
                        tasks = importedData.activeTasks;
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