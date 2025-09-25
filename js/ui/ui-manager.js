// js/ui/ui-manager.js

const selectors = {
    getTaskList: (quadrant) => document.querySelector(`.quadrant[data-quadrant="${quadrant}"] .task-list`),
    getQuadrant: (quadrantId) => document.querySelector(`[data-quadrant="${quadrantId}"]`),
    getAllQuadrants: () => document.querySelectorAll('[data-quadrant]'),
    taskTemplate: document.getElementById('task-template'),
    taskInputTemplate: document.getElementById('task-input-template'),
};

let currentTaskInput = null;

// Função auxiliar para verificar se uma data é hoje
function isToday(someDate) {
    const today = new Date();
    // Corrige o fuso horário para comparar datas corretamente
    const adjustedSomeDate = new Date(someDate.valueOf() + someDate.getTimezoneOffset() * 60 * 1000);
    
    return adjustedSomeDate.getDate() === today.getDate() &&
           adjustedSomeDate.getMonth() === today.getMonth() &&
           adjustedSomeDate.getFullYear() === today.getFullYear();
}

function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    // Adiciona o fuso horário local para evitar problemas de data "um dia antes"
    const userTimezoneDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    return userTimezoneDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function createTaskElement(task, eventHandlers) {
    const taskEl = selectors.taskTemplate.content.cloneNode(true);
    
    // --- Seletores para o novo layout do card ---
    const taskDiv = taskEl.querySelector('.task');
    const checkbox = taskEl.querySelector('.task__checkbox');
    const textSpan = taskEl.querySelector('.task__text');
    const deleteBtn = taskEl.querySelector('.task__delete');
    const dueDateDiv = taskEl.querySelector('.task__due-date');
    const dateInput = taskEl.querySelector('.task__date-input');
    const subtaskList = taskEl.querySelector('.subtask-list');
    const addSubtaskPlaceholderBtn = taskEl.querySelector('.add-subtask-placeholder-btn');
    const addSubtaskForm = taskEl.querySelector('.add-subtask-form');
    const addSubtaskInput = taskEl.querySelector('.add-subtask-input');

    // --- LÓGICA DE DESTAQUE E VISUALIZAÇÃO ---

    // 1. Adiciona classe de destaque se a tarefa vence hoje
    if (task.dueDate && isToday(new Date(task.dueDate))) {
        taskDiv.classList.add('due-today');
    }

    // 2. Adiciona classe para controlar a exibição da seção de subtarefas via CSS
    if (task.subtasks && task.subtasks.length > 0) {
        taskDiv.classList.add('has-subtasks');
    }

    // --- CONFIGURAÇÃO BÁSICA DO CARD ---
    taskDiv.setAttribute('draggable', 'true');
    taskDiv.setAttribute('data-task-id', task.id);
    textSpan.textContent = task.text;

    if (task.completed) {
        taskDiv.classList.add('completed');
        checkbox.checked = true;
    }

    // --- GERENCIAMENTO DA DATA DE VENCIMENTO ---
    const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>`;
    
    if (task.dueDate) {
        dueDateDiv.innerHTML = `<span>${formatDate(task.dueDate)}</span>`;
        dateInput.value = task.dueDate;
    } else {
        dueDateDiv.innerHTML = calendarIcon;
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
        // Atualiza a exibição sem precisar renderizar tudo
        if (newDate) {
            dueDateDiv.innerHTML = `<span>${formatDate(newDate)}</span>`;
        } else {
            dueDateDiv.innerHTML = calendarIcon;
        }
        dateInput.classList.add('hidden');
        dueDateDiv.classList.remove('hidden');
    };
    dateInput.addEventListener('blur', saveDate);
    dateInput.addEventListener('keydown', (e) => { if (e.key === 'Enter') saveDate(); });

    // --- EVENTOS DA TAREFA PRINCIPAL ---
    checkbox.addEventListener('change', () => eventHandlers.onToggleComplete(task.id));
    deleteBtn.addEventListener('click', () => eventHandlers.onDelete(task.id));
    
    taskDiv.addEventListener('dragstart', (e) => {
        taskDiv.classList.add('dragging');
        eventHandlers.onDragStart(task.id);
        e.dataTransfer.effectAllowed = 'move';
    });
    taskDiv.addEventListener('dragend', () => taskDiv.classList.remove('dragging'));

    textSpan.addEventListener('blur', () => {
        const newText = textSpan.textContent.trim();
        if (newText !== task.text) { // Salva mesmo se estiver vazio
            eventHandlers.onUpdate(task.id, { text: newText });
        }
    });
    textSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            textSpan.blur();
        }
    });

    // --- EVENTOS DAS SUBTAREFAS ---
    if (task.subtasks) {
        task.subtasks.forEach(subtask => {
            const subtaskItem = document.createElement('div');
            subtaskItem.className = 'subtask-item';
            if (subtask.completed) subtaskItem.classList.add('completed');
            
            const subtaskCheckbox = document.createElement('input');
            subtaskCheckbox.type = 'checkbox';
            subtaskCheckbox.checked = subtask.completed;
            subtaskCheckbox.addEventListener('change', () => {
                eventHandlers.onUpdateSubtask(task.id, subtask.id, { completed: subtaskCheckbox.checked });
            });

            const subtaskText = document.createElement('span');
            subtaskText.className = 'subtask-text';
            subtaskText.textContent = subtask.text;

            const subtaskDeleteBtn = document.createElement('button');
            subtaskDeleteBtn.className = 'subtask-delete-btn';
            subtaskDeleteBtn.title = 'Excluir subtarefa';
            subtaskDeleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>`;
            subtaskDeleteBtn.addEventListener('click', () => {
                eventHandlers.onDeleteSubtask(task.id, subtask.id);
            });

            subtaskItem.appendChild(subtaskCheckbox);
            subtaskItem.appendChild(subtaskText);
            subtaskItem.appendChild(subtaskDeleteBtn);
            subtaskList.appendChild(subtaskItem);
        });
    }

    // Listener para o botão placeholder que revela o formulário
    addSubtaskPlaceholderBtn.addEventListener('click', () => {
        addSubtaskPlaceholderBtn.classList.add('hidden');
        addSubtaskForm.classList.remove('hidden');
        addSubtaskInput.focus();
    });

    addSubtaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSubtaskText = addSubtaskInput.value.trim();
        if (newSubtaskText) {
            eventHandlers.onAddSubtask(task.id, newSubtaskText);
        }
        // Não esconde o form, permitindo adicionar várias subtarefas em sequência
        addSubtaskInput.value = ''; 
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
        const quadrantsContent = {};
        ['q1', 'q2', 'q3', 'q4'].forEach(qId => {
            quadrantsContent[qId] = document.createDocumentFragment();
        });

        tasks.forEach(task => {
            const taskEl = createTaskElement(task, eventHandlers);
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
        // Seleciona as listas de tarefas para o drag and drop, não os quadrantes inteiros
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
    }
};