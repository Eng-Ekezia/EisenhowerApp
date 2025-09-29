// js/app.js

import { subscribe, getState, setState } from './state.js';
import { init as initController, eventHandlers } from './controller.js';
import { matrixView } from './ui/matrix-view.js';
import { projectsView } from './ui/projects-view.js';
import { notificationService } from './services/notification-service.js';
import { dataService } from './services/data-service.js';
import { archiveService } from './services/archive-service.js';
import { taskService } from './services/task-service.js';

function render() {
    const state = getState();
    
    const matrixContainer = document.getElementById('matrix-view');
    const projectsContainer = document.getElementById('projects-view');
    
    // ATUALIZADO: Passa o modo de visualização atual para a matrixView a cada renderização.
    matrixView.updateViewMode(state.matrixViewMode);
    
    if (state.activeView === 'matrix') {
        matrixContainer.classList.remove('hidden');
        projectsContainer.classList.add('hidden');
        matrixView.render(state.tasks, eventHandlers);
    } else if (state.activeView === 'projects') {
        matrixContainer.classList.add('hidden');
        projectsContainer.classList.remove('hidden');
        projectsView.render(state.projects, eventHandlers);
    }
    const archivedTasks = archiveService.getArchivedTasks();
    matrixView.renderArchivedTasks(archivedTasks, eventHandlers);
}

function bindStaticEvents() {
    const sheet = document.getElementById('sheet-menu');
    const openBtn = document.getElementById('menu-btn');
    const closeTriggers = document.querySelectorAll('[data-action="close-sheet"]');
    
    const helpBtn = document.getElementById('sheet-help-btn');
    const helpModal = document.getElementById('help-modal');
    
    const statsBtn = document.getElementById('sheet-stats-btn');
    const statsModal = document.getElementById('stats-modal');

    const archiveBtn = document.getElementById('sheet-archive-btn');
    const archiveModal = document.getElementById('archive-modal');

    const exportBtn = document.getElementById('sheet-export-btn');
    const importBtn = document.getElementById('sheet-import-btn');
    const fileInput = document.getElementById('import-file-input');

    const viewToggleButton = document.getElementById('sheet-view-toggle-btn');

    const openSheet = () => sheet.classList.add('is-open');
    const closeSheet = () => {
        sheet.classList.add('is-closing');
        sheet.addEventListener('animationend', () => {
            sheet.classList.remove('is-open', 'is-closing');
        }, { once: true });
    };
    if (sheet && openBtn) {
        openBtn.addEventListener('click', openSheet);
        closeTriggers.forEach(trigger => trigger.addEventListener('click', closeSheet));
    }

    // NOVO: Vincula o botão de alternância de visualização ao controller.
    if (viewToggleButton) {
        viewToggleButton.addEventListener('click', () => {
            eventHandlers.onToggleMatrixView();
            closeSheet(); // Fecha o menu após a ação
        });
    }

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
            const { tasks } = getState();
            const stats = dataService.calculateStats(tasks);
            matrixView.displayStats(stats);
            statsModal.classList.remove('hidden');
            closeSheet();
        });
        statsModal.querySelectorAll('.modal__close, .modal__overlay').forEach(el =>
            el.addEventListener('click', () => statsModal.classList.add('hidden'))
        );
    }
    
    if (archiveBtn && archiveModal) {
        archiveBtn.addEventListener('click', () => {
            const archivedTasks = archiveService.getArchivedTasks();
            matrixView.renderArchivedTasks(archivedTasks, eventHandlers);
            archiveModal.classList.remove('hidden');
            closeSheet();
        });
        archiveModal.querySelectorAll('[data-action="close-archive-modal"]').forEach(trigger => {
            trigger.addEventListener('click', () => archiveModal.classList.add('hidden'));
        });
    }

    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
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
                        taskService.saveTasks(importedData.activeTasks);
                        archiveService.saveArchivedTasks(importedData.archivedTasks);
                        
                        setState({ 
                            tasks: importedData.activeTasks,
                            archivedTasks: importedData.archivedTasks
                        });
                        
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
            matrixView.showTaskInput(quadrant, eventHandlers);
        });
    });
    
    matrixView.bindDragAndDropEvents(eventHandlers);
}

function init() {
    subscribe(render);
    bindStaticEvents();
    initController();
    notificationService.start(() => getState().tasks);
}

init();