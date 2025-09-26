// js/ui/ui-manager.js

import { createTaskCard, appendSubtask } from './task-card-component.js';

const selectors = {
    getTaskList: (quadrant) => document.querySelector(`.quadrant[data-quadrant="${quadrant}"] .task-list`),
    getQuadrant: (quadrantId) => document.querySelector(`[data-quadrant="${quadrantId}"]`),
    getAllQuadrants: () => document.querySelectorAll('[data-quadrant]'),
    taskTemplate: document.getElementById('task-template'),
    taskInputTemplate: document.getElementById('task-input-template'),
    // NOVO: Seletor para o conteúdo do modal de estatísticas
    statsContent: document.getElementById('stats-content') 
};

let currentTaskInput = null;

function removeCurrentTaskInput() {
    if (currentTaskInput) {
        currentTaskInput.remove();
        currentTaskInput = null;
    }
}

export const uiManager = {
    renderTasks: (tasks, eventHandlers) => {
        const quadrantsContent = {};
        ['q1', 'q2', 'q3', 'q4'].forEach(qId => {
            quadrantsContent[qId] = document.createDocumentFragment();
        });

        tasks.forEach(task => {
            const taskEl = createTaskCard(task, eventHandlers);
            if (quadrantsContent[task.quadrant]) {
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
        document.querySelectorAll('.task-list').forEach(taskList => {
            taskList.addEventListener('dragover', (e) => { /* ... */ });
            taskList.addEventListener('dragleave', () => { /* ... */ });
            taskList.addEventListener('drop', (e) => { /* ... */ });
        });
    },
    
    appendSubtask: appendSubtask,

    showToast: (title, body) => {
        // ... (código do toast permanece o mesmo)
    },

    /**
     * Renderiza o conteúdo HTML das estatísticas dentro do modal.
     * @param {object} stats - O objeto de estatísticas calculado pelo dataService.
     */
    displayStats: (stats) => {
        if (!selectors.statsContent) {
            console.error('Container de estatísticas não encontrado!');
            return;
        }

        // A estrutura HTML é migrada do app.js original
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
                    <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                        <span><span style="color: #22c55e;">■</span> Eliminar</span>
                        <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q4}</span>
                    </div>
                </div>
            </div>
        `;
        selectors.statsContent.innerHTML = contentHTML;
    }
};