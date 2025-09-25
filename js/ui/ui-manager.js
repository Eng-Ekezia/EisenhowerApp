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
    // Adiciona o T00:00:00 para evitar problemas de fuso horário que podem mudar o dia.
    const userTimezoneDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    return userTimezoneDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function createTaskElement(task, eventHandlers) {
    const taskEl = selectors.taskTemplate.content.cloneNode(true);
    
    const taskDiv = taskEl.querySelector('.task');
    const checkbox = taskEl.querySelector('.task__checkbox');
    const textSpan = taskEl.querySelector('.task__text');
    const deleteBtn = taskEl.querySelector('.task__delete');
    // **NOVO: Seleciona os novos elementos de data**
    const dueDateDiv = taskEl.querySelector('.task__due-date');
    const dateInput = taskEl.querySelector('.task__date-input');


    // **NOVO: Habilita o arraste**
    taskDiv.setAttribute('draggable', 'true');
    taskDiv.setAttribute('data-task-id', task.id);

    if (task.completed) {
        taskDiv.classList.add('completed');
        checkbox.checked = true;
    }

    textSpan.textContent = task.text;

        // **INÍCIO DA NOVA LÓGICA DE DATA**
    if (task.dueDate) {
        // Mostra a data formatada se ela existir
        dueDateDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>${formatDate(task.dueDate)}</span>
        `;
        dateInput.value = task.dueDate;
    } else {
        dueDateDiv.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            <span>Adicionar data</span>
        `;
    }

    // Evento para mostrar o input de data ao clicar
    dueDateDiv.addEventListener('click', () => {
        dueDateDiv.classList.add('hidden');
        dateInput.classList.remove('hidden');
        dateInput.focus();
    });

    // Evento para salvar a nova data
    const saveDate = () => {
        // Compara para evitar atualizações desnecessárias
        if (dateInput.value !== task.dueDate) {
            eventHandlers.onUpdate(task.id, { dueDate: dateInput.value || null });
        }
        dateInput.classList.add('hidden');
        dueDateDiv.classList.remove('hidden');
    };
    
    dateInput.addEventListener('blur', saveDate);
    dateInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            saveDate();
        }
    });
    // **FIM DA NOVA LÓGICA DE DATA**
    
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