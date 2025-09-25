// js/ui/ui-manager.js

const selectors = {
    getTaskList: (quadrant) => document.getElementById(`tasks-${quadrant}`),
    getQuadrant: (quadrantId) => document.querySelector(`[data-quadrant="${quadrantId}"]`),
    getAllQuadrants: () => document.querySelectorAll('[data-quadrant]'),
    taskTemplate: document.getElementById('task-template'),
    taskInputTemplate: document.getElementById('task-input-template'),
};

let currentTaskInput = null;

function createTaskElement(task, eventHandlers) {
    const taskEl = selectors.taskTemplate.content.cloneNode(true);
    
    const taskDiv = taskEl.querySelector('.task');
    const checkbox = taskEl.querySelector('.task__checkbox');
    const textSpan = taskEl.querySelector('.task__text');
    const deleteBtn = taskEl.querySelector('.task__delete');

    // **NOVO: Habilita o arraste**
    taskDiv.setAttribute('draggable', 'true');
    taskDiv.setAttribute('data-task-id', task.id);

    if (task.completed) {
        taskDiv.classList.add('completed');
        checkbox.checked = true;
    }

    textSpan.textContent = task.text;
    
    // Vincula os eventos às funções de callback
    checkbox.addEventListener('change', () => eventHandlers.onToggleComplete(task.id));
    deleteBtn.addEventListener('click', () => eventHandlers.onDelete(task.id));
    
    // **NOVO: Adiciona o listener para o início do arraste**
    taskDiv.addEventListener('dragstart', (e) => {
        taskDiv.classList.add('dragging');
        // Notifica o orquestrador que uma tarefa começou a ser arrastada
        eventHandlers.onDragStart(task.id);
    });

    // **NOVO: Limpa a classe visual ao final do arraste**
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
        for (let i = 1; i <= 4; i++) {
            const taskList = selectors.getTaskList(`q${i}`);
            if (taskList) taskList.innerHTML = '';
        }
        
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
        const inputElFragment = selectors.taskInputTemplate.content.cloneNode(true);
        const inputElDiv = inputElFragment.querySelector('.task-input');
        
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
        currentTaskInput = inputElDiv;
        inputField.focus();
    },

    // **NOVO: Função para vincular os eventos de drop aos quadrantes**
    bindDragAndDropEvents: (eventHandlers) => {
        selectors.getAllQuadrants().forEach(quadrant => {
            quadrant.addEventListener('dragover', (e) => {
                e.preventDefault(); // Necessário para permitir o drop
                quadrant.classList.add('drag-over');
            });

            quadrant.addEventListener('dragleave', () => {
                quadrant.classList.remove('drag-over');
            });

            quadrant.addEventListener('drop', (e) => {
                e.preventDefault();
                quadrant.classList.remove('drag-over');
                const newQuadrantId = quadrant.dataset.quadrant;
                // Notifica o orquestrador que uma tarefa foi solta em um novo quadrante
                eventHandlers.onDrop(newQuadrantId);
            });
        });
    }
};