// js/ui/matrix-view.js

import { createTaskCard, appendSubtask } from './task-card-component.js';

const selectors = {
    matrix: document.getElementById('matrix'), // Seletor para o container da matriz
    getTaskList: (quadrant) => document.querySelector(`.quadrant[data-quadrant="${quadrant}"] .task-list`),
    getQuadrant: (quadrantId) => document.querySelector(`[data-quadrant="${quadrantId}"]`),
    getAllQuadrants: () => document.querySelectorAll('[data-quadrant]'),
    taskTemplate: document.getElementById('task-template'),
    taskInputTemplate: document.getElementById('task-input-template'),
    statsContent: document.getElementById('stats-content'),
    archiveListContainer: document.getElementById('archive-list-container'),
    emptyArchiveMessage: document.getElementById('empty-archive-message')
};

let currentTaskInput = null;

function removeCurrentTaskInput() {
    if (currentTaskInput) {
        currentTaskInput.remove();
        currentTaskInput = null;
    }
}

function getDragAfterElement(container, y) {
    const draggableElements = [...container.querySelectorAll('.task:not(.dragging)')];

    return draggableElements.reduce((closest, child) => {
        const box = child.getBoundingClientRect();
        const offset = y - box.top - box.height / 2;
        if (offset < 0 && offset > closest.offset) {
            return { offset: offset, element: child };
        } else {
            return closest;
        }
    }, { offset: Number.NEGATIVE_INFINITY }).element;
}

export const matrixView = {
    // NOVA FUNÇÃO: Aplica o modo de visualização ao elemento da matriz.
    updateViewMode: (mode) => {
        if (selectors.matrix) {
            selectors.matrix.dataset.viewMode = mode;
        }
    },

    render: (state, eventHandlers) => {
        const { tasks, projects } = state; // Desestruturamos tasks e projects do estado

        const quadrantsContent = {};
        ['q1', 'q2', 'q3', 'q4'].forEach(qId => {
            quadrantsContent[qId] = document.createDocumentFragment();
        });

        tasks.forEach(task => {
            // MODIFICAÇÃO: Passar a lista de projetos para a criação do card
            const taskEl = createTaskCard(task, projects, eventHandlers);
            if (task.quadrant && quadrantsContent[task.quadrant]) {
                quadrantsContent[task.quadrant].appendChild(taskEl);
            }
        });
        
        ['q1', 'q2', 'q3', 'q4'].forEach(qId => {
            const taskList = selectors.getTaskList(qId);
            if (taskList) {
                taskList.innerHTML = '';
                taskList.appendChild(quadrantsContent[qId]);
                if (!taskList.hasChildNodes()) {
                    taskList.classList.add('empty');
                } else {
                    taskList.classList.remove('empty');
                }
            }
        });
    },

    showTaskInput: (quadrant, eventHandlers) => {
        removeCurrentTaskInput(); 
        const container = selectors.getTaskList(quadrant);
        if (!container) return;
        const inputElDiv = selectors.taskInputTemplate.content.cloneNode(true);
        
        const inputField = inputElDiv.querySelector('.task-input__field');
        const dateField = inputElDiv.querySelector('.task-input__date-field');
        const saveBtn = inputElDiv.querySelector('.task-input__save');
        const cancelBtn = inputElDiv.querySelector('.task-input__cancel');

        saveBtn.addEventListener('click', () => {
            if (inputField.value.trim()) {
                eventHandlers.onSaveNewTask(quadrant, inputField.value, dateField.value);
                removeCurrentTaskInput();
            }
        });

        cancelBtn.addEventListener('click', () => removeCurrentTaskInput());
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        });
        
        container.insertAdjacentElement('afterbegin', inputElDiv.querySelector('.task-input'));
        currentTaskInput = container.querySelector('.task-input');
        inputField.focus();
    },

    bindDragAndDropEvents: (eventHandlers) => {
        document.querySelectorAll('.quadrant').forEach(quadrant => {
            quadrant.addEventListener('dragover', (e) => {
                e.preventDefault();
                quadrant.classList.add('drag-over');
            });
            quadrant.addEventListener('dragleave', () => {
                quadrant.classList.remove('drag-over');
            });
            quadrant.addEventListener('drop', (e) => {
                e.preventDefault();
                quadrant.classList.remove('drag-over');
                const taskId = e.dataTransfer.getData('text/plain');
                const newQuadrantId = quadrant.dataset.quadrant;
                const afterElement = getDragAfterElement(quadrant.querySelector('.task-list'), e.clientY);
                const targetId = afterElement ? afterElement.dataset.taskId : null;

                if (taskId) {
                    eventHandlers.onDrop(taskId, newQuadrantId, targetId);
                }
            });
        });

        document.querySelectorAll('.task-list').forEach(taskList => {
            taskList.addEventListener('dragover', e => {
                e.preventDefault();
                const dragging = document.querySelector('.dragging');
                if (!dragging) return;
                
                const afterElement = getDragAfterElement(taskList, e.clientY);
                if (afterElement == null) {
                    taskList.appendChild(dragging);
                } else {
                    taskList.insertBefore(dragging, afterElement);
                }
            });
        });
    },
    
    appendSubtask: appendSubtask,

    showToast: (title, body) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <div class="toast__title">${title}</div>
            <div class="toast__body">${body}</div>
        `;

        container.appendChild(toast);
        setTimeout(() => toast.classList.add('show'), 10);

        setTimeout(() => {
            toast.classList.remove('show');
            toast.addEventListener('transitionend', () => toast.remove());
        }, 5000);
    },
    
    renderArchivedTasks: (archivedTasks, eventHandlers) => {
        if (!selectors.archiveListContainer || !selectors.emptyArchiveMessage) return;

        selectors.archiveListContainer.innerHTML = '';

        if (archivedTasks.length === 0) {
            selectors.emptyArchiveMessage.classList.remove('hidden');
            return;
        }
        
        selectors.emptyArchiveMessage.classList.add('hidden');

        const fragment = document.createDocumentFragment();
        archivedTasks.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));

        archivedTasks.forEach(task => {
            const taskEl = document.createElement('div');
            taskEl.className = 'archived-task-item';
            
            const completedAt = task.completedAt ? new Date(task.completedAt).toLocaleDateString('pt-BR') : 'N/A';
            const archivedAt = new Date(task.archivedAt).toLocaleDateString('pt-BR');

            taskEl.innerHTML = `
                <div class="archived-task-item__main">
                    <span class="archived-task-item__text">${task.text}</span>
                    <span class="archived-task-item__meta">Concluída em: ${completedAt} | Arquivada em: ${archivedAt}</span>
                </div>
                <div class="archived-task-item__actions">
                    <button class="btn btn--sm btn--secondary restore-btn" title="Restaurar Tarefa">Restaurar</button>
                    <button class="btn btn--sm btn--outline delete-btn" title="Excluir Permanentemente">Excluir</button>
                </div>
            `;

            taskEl.querySelector('.restore-btn').addEventListener('click', () => eventHandlers.onRestore(task.id));
            taskEl.querySelector('.delete-btn').addEventListener('click', () => eventHandlers.onDeletePermanently(task.id));
            
            fragment.appendChild(taskEl);
        });

        selectors.archiveListContainer.appendChild(fragment);
    },

    displayStats: (stats) => {
        if (!selectors.statsContent) {
            console.error('Container de estatísticas não encontrado!');
            return;
        }

        const contentHTML = `
            <div class="stats-overview" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-12); margin-bottom: var(--space-16);">
                <div class="stat-card" style="background: var(--color-bg-1); padding: var(--space-16); border-radius: var(--radius-base); text-align: center;">
                    <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-primary);">${stats.total}</div>
                    <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Total de Tarefas</div>
                </div>
                <div class="stat-card" style="background: var(--color-bg-3); padding: var(--space-16); border-radius: var(--radius-base); text-align: center;">
                    <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-success);">${stats.completed}</div>
                    <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Concluídas</div>
                </div>
                <div class="stat-card" style="background: var(--color-bg-2); padding: var(--space-16); border-radius: var(--radius-base); text-align: center;">
                    <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-warning);">${stats.pending}</div>
                    <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Pendentes</div>
                </div>
            </div>
            
            <div class="progress-bar" style="margin-bottom: var(--space-16);">
                <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
                    <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">Progresso Geral</span>
                    <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${stats.completionRate}%</span>
                </div>
                <div style="background: var(--color-secondary); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
                    <div style="background: var(--color-success); height: 100%; width: ${stats.completionRate}%; transition: width 0.5s ease-in-out;"></div>
                </div>
            </div>

            <div class="quadrant-stats">
                <h4 style="margin-bottom: var(--space-12);">Tarefas por Quadrante</h4>
                <div style="display: grid; gap: var(--space-8);">
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                        <span><span style="color: #ef4444;">■</span> Fazer Primeiro</span>
                        <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q1}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                        <span><span style="color: #3b82f6;">■</span> Agendar</span>
                        <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q2}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                        <span><span style="color: #f59e0b;">■</span> Delegar</span>
                        <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q3}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items.center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                        <span><span style="color: #22c55e;">■</span> Eliminar</span>
                        <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q4}</span>
                    </div>
                </div>
            </div>
        `;
        selectors.statsContent.innerHTML = contentHTML;
    }
};