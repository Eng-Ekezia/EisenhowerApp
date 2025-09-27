// js/ui/task-card-component.js

// --- Funções Auxiliares (Privadas a este Módulo) ---

function isToday(someDate) {
    const today = new Date();
    const adjustedSomeDate = new Date(someDate.valueOf() + someDate.getTimezoneOffset() * 60 * 1000);
    return adjustedSomeDate.getDate() === today.getDate() &&
           adjustedSomeDate.getMonth() === today.getMonth() &&
           adjustedSomeDate.getFullYear() === today.getFullYear();
}

function formatDate(isoDate) {
    if (!isoDate) return '';
    const date = new Date(isoDate);
    const userTimezoneDate = new Date(date.valueOf() + date.getTimezoneOffset() * 60 * 1000);
    // Alterado para um formato mais completo para a data de criação
    return userTimezoneDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}


function createSubtaskElement(taskId, subtask, eventHandlers) {
    const subtaskItem = document.createElement('div');
    subtaskItem.className = 'subtask-item';
    if (subtask.completed) subtaskItem.classList.add('completed');
    
    const subtaskCheckbox = document.createElement('input');
    subtaskCheckbox.type = 'checkbox';
    subtaskCheckbox.checked = subtask.completed;
    subtaskCheckbox.addEventListener('change', () => {
        eventHandlers.onUpdateSubtask(taskId, subtask.id, { completed: subtaskCheckbox.checked });
    });

    const subtaskText = document.createElement('span');
    subtaskText.className = 'subtask-text';
    subtaskText.textContent = subtask.text;

    const subtaskDeleteBtn = document.createElement('button');
    subtaskDeleteBtn.className = 'subtask-delete-btn';
    subtaskDeleteBtn.title = 'Excluir subtarefa';
    subtaskDeleteBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18 18 6M6 6l12 12" /></svg>`;
    subtaskDeleteBtn.addEventListener('click', () => {
        eventHandlers.onDeleteSubtask(taskId, subtask.id);
    });

    subtaskItem.appendChild(subtaskCheckbox);
    subtaskItem.appendChild(subtaskText);
    subtaskItem.appendChild(subtaskDeleteBtn);
    return subtaskItem;
}

// --- Funções Públicas (Exportadas) ---

/**
 * Cria o elemento DOM completo para um card de tarefa.
 * @param {object} task - O objeto da tarefa.
 * @param {object} eventHandlers - Os manipuladores de evento do app.
 * @returns {Node} - O nó do DOM do elemento da tarefa.
 */
export function createTaskCard(task, eventHandlers) {
    const taskEl = document.getElementById('task-template').content.cloneNode(true);
    
    const taskDiv = taskEl.querySelector('.task');
    const checkbox = taskEl.querySelector('.task__checkbox');
    const textSpan = taskEl.querySelector('.task__text');
    const deleteBtn = taskEl.querySelector('.task__delete');
    // NOVO: Seleciona os novos elementos do template
    const archiveBtn = taskEl.querySelector('.task__archive');
    const creationDateSpan = taskEl.querySelector('.task__creation-date');
    const dueDateDiv = taskEl.querySelector('.task__due-date');
    const dateInput = taskEl.querySelector('.task__date-input');
    const subtaskList = taskEl.querySelector('.subtask-list');
    const addSubtaskPlaceholderBtn = taskEl.querySelector('.add-subtask-placeholder-btn');
    const addSubtaskForm = taskEl.querySelector('.add-subtask-form');
    const addSubtaskInput = taskEl.querySelector('.add-subtask-input');

    if (task.dueDate && isToday(new Date(task.dueDate))) {
        taskDiv.classList.add('due-today');
    }

    if (task.subtasks && task.subtasks.length > 0) {
        taskDiv.classList.add('has-subtasks');
    }

    taskDiv.setAttribute('draggable', 'true');
    taskDiv.setAttribute('data-task-id', task.id);
    textSpan.textContent = task.text;

    if (task.completed) {
        taskDiv.classList.add('completed');
        checkbox.checked = true;
        archiveBtn.classList.remove('hidden'); // Mostra o botão de arquivar
        deleteBtn.classList.add('hidden'); // Esconde o botão de deletar para dar lugar ao de arquivar
    } else {
        archiveBtn.classList.add('hidden');
        deleteBtn.classList.remove('hidden');
    }

    // NOVO: Adiciona a data de criação ao card
    if (task.createdAt) {
        creationDateSpan.textContent = `Criada em: ${formatDate(task.createdAt)}`;
    }

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

    checkbox.addEventListener('change', () => eventHandlers.onToggleComplete(task.id));
    deleteBtn.addEventListener('click', () => eventHandlers.onDelete(task.id));
    archiveBtn.addEventListener('click', () => eventHandlers.onArchive(task.id)); // NOVO: Event handler para o botão de arquivar
    
    taskDiv.addEventListener('dragstart', (e) => {
        taskDiv.classList.add('dragging');
        eventHandlers.onDragStart(task.id);
        e.dataTransfer.effectAllowed = 'move';
    });
    taskDiv.addEventListener('dragend', () => taskDiv.classList.remove('dragging'));

    // --- INÍCIO DA IMPLEMENTAÇÃO CORRETA (CONCEITO 2) ---

    // Quando o usuário CLICA no texto para editar, adicione a classe 'is-editing'
    textSpan.addEventListener('focus', () => {
        taskDiv.classList.add('is-editing');
    });

    // Quando o usuário CLICA FORA (ou pressiona Enter)...
    textSpan.addEventListener('blur', () => {
        // 1. Remova a classe 'is-editing' para sair do modo de foco
        taskDiv.classList.remove('is-editing');

        // 2. Salve o novo texto, como já fazia antes
        const newText = textSpan.textContent.trim();
        if (newText !== task.text) {
            eventHandlers.onUpdate(task.id, { text: newText });
        }
    });

    // A lógica para o 'Enter' permanece a mesma
    textSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Impede a quebra de linha
            textSpan.blur();    // Dispara o evento 'blur' para salvar e sair do foco
        }
    });
    // --- FIM DA IMPLEMENTAÇÃO CORRETA (CONCEITO 2) ---

    if (task.subtasks) {
        task.subtasks.forEach(subtask => {
            const subtaskEl = createSubtaskElement(task.id, subtask, eventHandlers);
            subtaskList.appendChild(subtaskEl);
        });
    }

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
        addSubtaskInput.value = ''; 
    });

    return taskEl;
}

/**
 * Adiciona um elemento de subtarefa a um card de tarefa já existente na tela.
 * @param {string} taskId - O ID da tarefa pai.
 * @param {object} subtask - O objeto da nova subtarefa.
 * @param {object} eventHandlers - Os manipuladores de evento do app.
 */
export function appendSubtask(taskId, subtask, eventHandlers) {
    const taskDiv = document.querySelector(`.task[data-task-id="${taskId}"]`);
    if (!taskDiv) return;

    const subtaskList = taskDiv.querySelector('.subtask-list');
    const subtaskEl = createSubtaskElement(taskId, subtask, eventHandlers);
    subtaskList.appendChild(subtaskEl);

    taskDiv.classList.add('has-subtasks');
    const placeholderBtn = taskDiv.querySelector('.add-subtask-placeholder-btn');
    if(placeholderBtn) placeholderBtn.classList.add('hidden');
    
    const form = taskDiv.querySelector('.add-subtask-form');
    form.classList.remove('hidden');
    form.querySelector('.add-subtask-input').focus();
}