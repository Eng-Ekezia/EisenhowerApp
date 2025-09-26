// js/ui/ui-manager.js

// Importa os especialistas
import { createTaskCard, appendSubtask } from './task-card-component.js';

const selectors = {
    getTaskList: (quadrant) => document.querySelector(`.quadrant[data-quadrant="${quadrant}"] .task-list`),
    getQuadrant: (quadrantId) => document.querySelector(`[data-quadrant="${quadrantId}"]`),
    getAllQuadrants: () => document.querySelectorAll('[data-quadrant]'),
    taskTemplate: document.getElementById('task-template'),
    taskInputTemplate: document.getElementById('task-input-template'),
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
            // Delega a criação do card para o módulo especialista
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
            taskList.addEventListener('dragover', (e) => {
                e.preventDefault();
                const quadrant = taskList.closest('.quadrant');
                quadrant.classList.add('drag-over');
            });
            taskList.addEventListener('dragleave', () => {
                const quadrant = taskList.closest('.quadrant');
                quadrant.classList.remove('drag-over');
            });
            taskList.addEventListener('drop', (e) => {
                e.preventDefault();
                const quadrant = taskList.closest('.quadrant');
                quadrant.classList.remove('drag-over');
                const newQuadrantId = quadrant.dataset.quadrant;
                eventHandlers.onDrop(newQuadrantId);
            });
        });
    },
    
    // Expõe a função do componente para que o app.js possa usá-la
    appendSubtask: appendSubtask,

    // --- INÍCIO DA NOVA FUNÇÃO showToast ---
    showToast: (title, body) => {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `
            <span class="toast__title">${title}</span>
            <span class="toast__body">${body}</span>
        `;
        container.appendChild(toast);

        // Força o navegador a aplicar o estilo inicial antes de adicionar a classe 'show'
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);

        // Remove o toast após 5 segundos
        setTimeout(() => {
            toast.classList.remove('show');
            // Remove o elemento do DOM após a animação de saída
            toast.addEventListener('transitionend', () => toast.remove());
        }, 5000);
    }
    // --- FIM DA NOVA FUNÇÃO ---
};