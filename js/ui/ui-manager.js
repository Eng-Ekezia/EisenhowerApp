// js/ui/ui-manager.js

const selectors = {
    getTaskList: (quadrant) => document.getElementById(`tasks-${quadrant}`),
    getQuadrant: (quadrantId) => document.querySelector(`[data-quadrant="${quadrantId}"]`),
    getAllQuadrants: () => document.querySelectorAll('[data-quadrant]'),
    taskTemplate: document.getElementById('task-template'),
    taskInputTemplate: document.getElementById('task-input-template'),
};

let currentTaskInput = null;

// Função auxiliar para formatar a data para o padrão brasileiro.
function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    // Adiciona o T00:00:00 para evitar problemas de fuso horário que podem mudar o dia.
    const userTimezoneDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    return userTimezoneDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function createTaskElement(task, eventHandlers) {
    const taskEl = selectors.taskTemplate.content.cloneNode(true);
    
    // Seleciona todos os elementos necessários do template
    const taskDiv = taskEl.querySelector('.task');
    const checkbox = taskEl.querySelector('.task__checkbox');
    const textSpan = taskEl.querySelector('.task__text');
    const deleteBtn = taskEl.querySelector('.task__delete');
    const dueDateDiv = taskEl.querySelector('.task__due-date');
    const dateInput = taskEl.querySelector('.task__date-input');

    // Configurações básicas da tarefa
    taskDiv.setAttribute('draggable', 'true');
    taskDiv.setAttribute('data-task-id', task.id);
    textSpan.textContent = task.text;

    if (task.completed) {
        taskDiv.classList.add('completed');
        checkbox.checked = true;
    }

    // Lógica para exibir a data de vencimento
    if (task.dueDate) {
        dueDateDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> <span>${formatDate(task.dueDate)}</span>`;
        dateInput.value = task.dueDate;
    } else {
        dueDateDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg> <span>Adicionar data</span>`;
    }

    // --- Vinculação de TODOS os eventos ---

    // Eventos para a data de vencimento
    dueDateDiv.addEventListener('click', () => {
        dueDateDiv.classList.add('hidden');
        dateInput.classList.remove('hidden');
        dateInput.focus();
    });

    const saveDate = () => {
        const newDate = dateInput.value;
        if (newDate !== task.dueDate) {
            eventHandlers.onUpdate(task.id, { dueDate: newDate || null });
        }
        // A UI não é redesenhada aqui, por isso trocamos as classes manualmente.
        // O app.js vai precisar chamar render() para atualizar o texto da data.
        dateInput.classList.add('hidden');
        dueDateDiv.classList.remove('hidden');
    };
    dateInput.addEventListener('blur', saveDate);
    dateInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveDate(); });

    // Eventos de CRUD (Esta parte estava faltando/incorreta no snippet anterior)
    checkbox.addEventListener('change', () => eventHandlers.onToggleComplete(task.id));
    deleteBtn.addEventListener('click', () => eventHandlers.onDelete(task.id));
    textSpan.addEventListener('blur', () => {
        const newText = textSpan.textContent.trim();
        if (newText && newText !== task.text) {
            eventHandlers.onUpdate(task.id, { text: newText });
        } else {
            textSpan.textContent = task.text;
        }
    });
    textSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            textSpan.blur();
        }
    });

    // Eventos de Drag-and-Drop (Esta parte também estava faltando/incorreta)
    taskDiv.addEventListener('dragstart', () => {
        taskDiv.classList.add('dragging');
        eventHandlers.onDragStart(task.id);
    });
    taskDiv.addEventListener('dragend', () => {
        taskDiv.classList.remove('dragging');
    });

    return taskEl;
}

function removeCurrentTaskInput() {
    if (currentTaskInput) {
        currentTaskInput.remove();
        currentTaskInput = null;
    }
}

export const uiManager = {
    renderTasks: (tasks, eventHandlers) => {
        ['q1', 'q2', 'q3', 'q4'].forEach(quadrant => {
            const taskList = selectors.getTaskList(quadrant);
            if (taskList) taskList.innerHTML = '';
        });
        
        tasks.forEach(task => {
            const taskList = selectors.getTaskList(task.quadrant);
            if (taskList) {
                const taskEl = createTaskElement(task, eventHandlers);
                taskList.appendChild(taskEl);
            }
        });
    },

    showTaskInput: (quadrant, eventHandlers) => {
        removeCurrentTaskInput(); 
        const container = selectors.getTaskList(quadrant);
        const inputElDiv = selectors.taskInputTemplate.content.cloneNode(true);
        
        const inputField = inputElDiv.querySelector('.task-input__field');
        const saveBtn = inputElDiv.querySelector('.task-input__save');
        const cancelBtn = inputElDiv.querySelector('.task-input__cancel');

        saveBtn.addEventListener('click', () => {
            eventHandlers.onSaveNewTask(quadrant, inputField.value);
            removeCurrentTaskInput();
        });

        cancelBtn.addEventListener('click', () => removeCurrentTaskInput());
        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        });

        container.appendChild(inputElDiv);
        currentTaskInput = container.querySelector('.task-input');
        inputField.focus();
    },

    bindDragAndDropEvents: (eventHandlers) => {
        selectors.getAllQuadrants().forEach(quadrant => {
            quadrant.addEventListener('dragover', (e) => {
                e.preventDefault();
                quadrant.classList.add('drag-over');
            });
            quadrant.addEventListener('dragleave', () => quadrant.classList.remove('drag-over'));
            quadrant.addEventListener('drop', (e) => {
                e.preventDefault();
                quadrant.classList.remove('drag-over');
                const newQuadrantId = quadrant.dataset.quadrant;
                eventHandlers.onDrop(newQuadrantId);
            });
        });
    }
};