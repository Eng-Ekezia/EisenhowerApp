// js/ui/ui-manager.js

const selectors = {
    getTaskList: (quadrant) => document.getElementById(`tasks-${quadrant}`),
    getQuadrant: (quadrantId) => document.querySelector(`[data-quadrant="${quadrantId}"]`),
    getAllQuadrants: () => document.querySelectorAll('[data-quadrant]'),
    taskTemplate: document.getElementById('task-template'),
    taskInputTemplate: document.getElementById('task-input-template'),
};

let currentTaskInput = null;

function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const userTimezoneDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    return userTimezoneDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function createTaskElement(task, eventHandlers) {
    const taskEl = selectors.taskTemplate.content.cloneNode(true);
    
    const taskDiv = taskEl.querySelector('.task');
    const checkbox = taskEl.querySelector('.task__checkbox');
    const textSpan = taskEl.querySelector('.task__text');
    const deleteBtn = taskEl.querySelector('.task__delete');
    const dueDateDiv = taskEl.querySelector('.task__due-date');
    const dateInput = taskEl.querySelector('.task__date-input');

    taskDiv.setAttribute('draggable', 'true');
    taskDiv.setAttribute('data-task-id', task.id);
    textSpan.textContent = task.text;

    if (task.completed) {
        taskDiv.classList.add('completed');
        checkbox.checked = true;
    }

    if (task.dueDate) {
        dueDateDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-7.5 14.25h.008v.008H-7.5v-.008Zm0 4.5h.008v.008H-7.5v-.008Zm4.5-4.5h.008v.008H-3v-.008Zm0 4.5h.008v.008H-3v-.008Zm4.5-4.5h.008v.008H1.5v-.008Zm0 4.5h.008v.008H1.5v-.008Zm4.5-4.5h.008v.008H6v-.008Zm0 4.5h.008v.008H6v-.008Zm4.5-4.5h.008v.008H10.5v-.008Zm0 4.5h.008v.008H10.5v-.008Zm4.5-4.5h.008v.008H15v-.008Zm0 4.5h.008v.008H15v-.008Z" /></svg> <span>${formatDate(task.dueDate)}</span>`;
        dateInput.value = task.dueDate;
    } else {
        dueDateDiv.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0h18M-7.5 14.25h.008v.008H-7.5v-.008Zm0 4.5h.008v.008H-7.5v-.008Zm4.5-4.5h.008v.008H-3v-.008Zm0 4.5h.008v.008H-3v-.008Zm4.5-4.5h.008v.008H1.5v-.008Zm0 4.5h.008v.008H1.5v-.008Zm4.5-4.5h.008v.008H6v-.008Zm0 4.5h.008v.008H6v-.008Zm4.5-4.5h.008v.008H10.5v-.008Zm0 4.5h.008v.008H10.5v-.008Zm4.5-4.5h.008v.008H15v-.008Zm0 4.5h.008v.008H15v-.008Z" /></svg>`;
    }

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
        dateInput.classList.add('hidden');
        dueDateDiv.classList.remove('hidden');
    };
    dateInput.addEventListener('blur', saveDate);
    dateInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveDate(); });

    checkbox.addEventListener('change', () => eventHandlers.onToggleComplete(task.id));
    deleteBtn.addEventListener('click', () => eventHandlers.onDelete(task.id));
    
    taskDiv.addEventListener('dragstart', () => {
        taskDiv.classList.add('dragging');
        eventHandlers.onDragStart(task.id);
    });

    taskDiv.addEventListener('dragend', () => {
        taskDiv.classList.remove('dragging');
    });

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
        const dateField = inputElDiv.querySelector('.task-input__date-field');
        const saveBtn = inputElDiv.querySelector('.task-input__save');
        const cancelBtn = inputElDiv.querySelector('.task-input__cancel');

        saveBtn.addEventListener('click', () => {
            eventHandlers.onSaveNewTask(quadrant, inputField.value, dateField.value);
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