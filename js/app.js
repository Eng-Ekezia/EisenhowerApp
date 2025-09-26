// js/app.js

import { taskService } from './services/task-service.js';
import { uiManager } from './ui/ui-manager.js';
import { notificationService } from './services/notification-service.js';
// NOVO: Importa o nosso novo serviço de dados
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
    // --- LÓGICA DO MENU LATERAL (SHEET) ---

    const sheet = document.getElementById('sheet-menu');
    const openBtn = document.getElementById('menu-btn');
    // ATENÇÃO: Esta linha já cuida de TODOS os botões com o atributo data-action="close-sheet",
    // incluindo o botão "Fechar" e o overlay.
    const closeTriggers = document.querySelectorAll('[data-action="close-sheet"]');

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

    // --- Lógica dos botões DENTRO do menu ---

    // Botões existentes
    const viewToggleBtn = document.getElementById('sheet-view-toggle-btn');
    if (viewToggleBtn) { /* ... lógica de visualização ... */ }
    const helpBtn = document.getElementById('sheet-help-btn');
    const statsBtn = document.getElementById('sheet-stats-btn');
    if (helpBtn) { /* ... lógica do modal de ajuda ... */ }
    if (statsBtn) { /* ... lógica do modal de estatísticas ... */ }

    // --- NOVO: LÓGICA DE IMPORTAÇÃO E EXPORTAÇÃO ---
    
    const exportBtn = document.getElementById('sheet-export-btn');
    const importBtn = document.getElementById('sheet-import-btn');
    const fileInput = document.getElementById('import-file-input');

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            dataService.exportTasks(tasks);
            closeSheet(); // Fecha o menu após a ação
        });
    }

    if (importBtn && fileInput) {
        // 1. O botão do menu aciona o input de arquivo escondido
        importBtn.addEventListener('click', () => {
            fileInput.click();
            closeSheet();
        });

        // 2. Quando um arquivo é selecionado no input, ele é processado
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (!file) {
                return; // Nenhum arquivo selecionado
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const jsonContent = e.target.result;
                
                if (confirm('Atenção: Isso substituirá todas as suas tarefas atuais. Deseja continuar?')) {
                    const newTasks = dataService.importTasks(jsonContent);

                    if (newTasks) {
                        tasks = newTasks;
                        taskService.saveTasks(tasks); // Salva as novas tarefas no localStorage
                        render(); // Re-renderiza a UI com as novas tarefas
                        alert('Tarefas importadas com sucesso!');
                    } else {
                        alert('Erro: O arquivo selecionado é inválido ou está corrompido.');
                    }
                }
                // Limpa o valor do input para permitir importar o mesmo arquivo novamente
                fileInput.value = ''; 
            };
            reader.readAsText(file);
        });
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