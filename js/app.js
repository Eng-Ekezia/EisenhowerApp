// js/app.js

import { subscribe, getState, setState } from './state.js';
import { init as initController, eventHandlers } from './controller.js';
import { matrixView } from './ui/matrix-view.js';
import { projectsView } from './ui/projects-view.js';
import { notificationService } from './services/notification-service.js';
import { dataService } from './services/data-service.js';
import { archiveService } from './services/archive-service.js';
import { taskService } from './services/task-service.js';
import { projectService } from './services/project-service.js';


function render() {
    const state = getState();
    const navButtons = document.querySelectorAll('.segmented-control__button');
    const headerTitle = document.querySelector('.header__title');

    if (headerTitle) {
        headerTitle.textContent = state.activeView === 'projects' ? 'Meus Projetos' : 'Matriz de Eisenhower';
    }

    navButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.view === state.activeView);
    });
    
    const matrixContainer = document.getElementById('matrix-view');
    const projectsContainer = document.getElementById('projects-view');
   
    matrixView.updateViewMode(state.matrixViewMode);
    
    if (state.activeView === 'matrix') {
        matrixContainer.classList.remove('hidden');
        projectsContainer.classList.add('hidden');
        matrixView.render(state, eventHandlers);
    } else if (state.activeView === 'projects') {
        matrixContainer.classList.add('hidden');
        projectsContainer.classList.remove('hidden');
        projectsView.render(state, eventHandlers);
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
    
    const navButtons = document.querySelectorAll('.segmented-control__button');
    navButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            eventHandlers.onSetView(btn.dataset.view);
        });
    });

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

    if (viewToggleButton) {
        viewToggleButton.addEventListener('click', () => {
            eventHandlers.onToggleMatrixView();
            closeSheet(); 
        });
    }

    // --- LÓGICA GENÉRICA PARA MODAIS ---
    function setupModal(modalId, openHandler) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        if(openHandler) openHandler(modal);

        modal.querySelectorAll(`[data-action="close-${modalId}"]`).forEach(trigger => {
            trigger.addEventListener('click', () => modal.classList.add('hidden'));
        });
    }

    // --- CONFIGURAÇÃO DOS MODAIS EXISTENTES ---
    setupModal('help-modal', (modal) => {
        helpBtn.addEventListener('click', () => {
            modal.classList.remove('hidden');
            closeSheet();
        });
    });

    setupModal('stats-modal', (modal) => {
        statsBtn.addEventListener('click', () => {
            const { tasks } = getState();
            const stats = dataService.calculateStats(tasks);
            matrixView.displayStats(stats);
            modal.classList.remove('hidden');
            closeSheet();
        });
    });

    setupModal('archive-modal', (modal) => {
        archiveBtn.addEventListener('click', () => {
            const archivedTasks = archiveService.getArchivedTasks();
            matrixView.renderArchivedTasks(archivedTasks, eventHandlers);
            modal.classList.remove('hidden');
            closeSheet();
        });
    });
    
    // --- LÓGICA DO MODAL DE PROJETO (CRIAR E EDITAR) ---
    const projectModal = document.getElementById('project-modal');
    if (projectModal) {
        const projectForm = document.getElementById('project-form');
        const modalTitle = document.getElementById('project-modal-title');
        const nameInput = document.getElementById('project-name');
        const descriptionInput = document.getElementById('project-description');
        let editingProjectId = null; // Variável para rastrear o ID do projeto em edição

        // Handler para ABRIR O MODAL NO MODO DE CRIAÇÃO
        eventHandlers.onShowAddProjectModal = () => {
            editingProjectId = null; // Garante que não estamos em modo de edição
            projectForm.reset();
            modalTitle.textContent = 'Novo Projeto';
            projectModal.classList.remove('hidden');
        };

        // NOVO HANDLER: ABRIR O MODAL NO MODO DE EDIÇÃO
        eventHandlers.onShowEditProjectModal = (projectId) => {
            const { projects } = getState();
            const project = projects.find(p => p.id === projectId);
            if (project) {
                editingProjectId = projectId; // Define o ID do projeto que estamos editando
                modalTitle.textContent = 'Editar Projeto';
                nameInput.value = project.name;
                descriptionInput.value = project.description;
                projectModal.classList.remove('hidden');
            }
        };
        
        // Handler para FECHAR o modal
        projectModal.querySelectorAll('[data-action="close-project-modal"]').forEach(trigger => {
            trigger.addEventListener('click', () => projectModal.classList.add('hidden'));
        });

        // Handler para o SUBMIT do formulário (agora lida com ambos os casos)
        projectForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const projectData = {
                name: nameInput.value,
                description: descriptionInput.value
            };

            if (editingProjectId) {
                // Se estivermos editando, chama o handler de atualização
                eventHandlers.onUpdateProject(editingProjectId, projectData);
            } else {
                // Caso contrário, chama o handler para salvar um novo projeto
                eventHandlers.onSaveNewProject(projectData);
            }

            projectForm.reset();
            editingProjectId = null;
            projectModal.classList.add('hidden');
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
                if (confirm('Atenção: Isso substituirá todos os seus projetos, tarefas atuais e arquivadas. Deseja continuar?')) {
                    const importedData = dataService.importTasks(jsonContent);
                    if (importedData) {
                        projectService.saveProjects(importedData.projects);
                        taskService.saveTasks(importedData.activeTasks);
                        archiveService.saveArchivedTasks(importedData.archivedTasks);
                        
                        setState({ 
                            projects: importedData.projects,
                            tasks: importedData.activeTasks,
                            archivedTasks: importedData.archivedTasks
                        });
                        
                        alert('Dados importados com sucesso!');
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