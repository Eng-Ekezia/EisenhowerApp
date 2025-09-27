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
    
    // Lógica simplificada: Apenas chama o handler. A renderização principal cuidará do resto.
    subtaskDeleteBtn.addEventListener('click', () => {
        eventHandlers.onDeleteSubtask(taskId, subtask.id);
    });    

    subtaskItem.appendChild(subtaskCheckbox);
    subtaskItem.appendChild(subtaskText);
    subtaskItem.appendChild(subtaskDeleteBtn);
    return subtaskItem;
}

// --- Funções Públicas (Exportadas) ---

export function createTaskCard(task, eventHandlers) {
    const taskEl = document.getElementById('task-template').content.cloneNode(true);
    
    const taskDiv = taskEl.querySelector('.task');
    const checkbox = taskEl.querySelector('.task__checkbox');
    const textSpan = taskEl.querySelector('.task__text');
    const deleteBtn = taskEl.querySelector('.task__delete');
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
        archiveBtn.classList.remove('hidden');
        deleteBtn.classList.add('hidden');
    } else {
        archiveBtn.classList.add('hidden');
        deleteBtn.classList.remove('hidden');
    }

    if (task.createdAt) {
        creationDateSpan.textContent = `Criada em: ${formatDate(task.createdAt)}`;
    }

    const calendarIcon = `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-9-6h.008v.008H12v-.008ZM12 15h.008v.008H12V15Zm0 2.25h.008v.008H12v-.008ZM9.75 15h.008v.008H9.75V15Zm0 2.25h.008v.008H9.75v-.008ZM7.5 15h.008v.008H7.5V15Zm0 2.25h.008v.008H7.5v-.008Zm6.75-4.5h.008v.008h-.008v-.008Zm0 2.25h.008v.008h-.008V15Zm0 2.25h.008v.008h-.008v-.008Zm2.25-4.5h.008v.008H16.5v-.008Zm0 2.25h.008v.008H16.5V15Z" /></svg>`;
    
    if (task.dueDate) {
        dueDateDiv.innerHTML = `<span>${new Date(task.dueDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>`;
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
            dueDateDiv.innerHTML = `<span>${new Date(newDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}</span>`;
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
    archiveBtn.addEventListener('click', () => eventHandlers.onArchive(task.id));
    
    taskDiv.addEventListener('dragstart', (e) => {
        taskDiv.classList.add('dragging');
        eventHandlers.onDragStart(task.id);
        e.dataTransfer.effectAllowed = 'move';
    });
    taskDiv.addEventListener('dragend', () => taskDiv.classList.remove('dragging'));

    textSpan.addEventListener('focus', () => {
        taskDiv.classList.add('is-editing');
    });

    textSpan.addEventListener('blur', () => {
        taskDiv.classList.remove('is-editing');
        const newText = textSpan.textContent.trim();
        if (newText !== task.text) {
            eventHandlers.onUpdate(task.id, { text: newText });
        }
    });

    textSpan.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            textSpan.blur();
        }
    });

    if (task.subtasks) {
        task.subtasks.forEach(subtask => {
            const subtaskEl = createSubtaskElement(task.id, subtask, eventHandlers);
            subtaskList.appendChild(subtaskEl);
        });
    }

    const closeSubtaskForm = () => {
        addSubtaskForm.classList.add('hidden');
        addSubtaskPlaceholderBtn.classList.remove('hidden');
        addSubtaskInput.value = ''; 
        document.removeEventListener('click', handleClickOutside);
    };

    const handleClickOutside = (e) => {
        if (!addSubtaskForm.contains(e.target)) {
            closeSubtaskForm();
        }
    };

    addSubtaskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeSubtaskForm();
        }
    });

    addSubtaskPlaceholderBtn.addEventListener('click', (e) => {
        e.stopPropagation(); 
        addSubtaskPlaceholderBtn.classList.add('hidden');
        addSubtaskForm.classList.remove('hidden');
        addSubtaskInput.focus();
        setTimeout(() => document.addEventListener('click', handleClickOutside), 0);
    });

    addSubtaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newSubtaskText = addSubtaskInput.value.trim();
        if (newSubtaskText) {
            eventHandlers.onAddSubtask(task.id, newSubtaskText);
            addSubtaskInput.value = '';
            addSubtaskInput.focus();
        } else {
            closeSubtaskForm();
        }
    });

    return taskEl;
}

export function appendSubtask(taskId, subtask, eventHandlers) {
    const taskDiv = document.querySelector(`.task[data-task-id="${taskId}"]`);
    if (!taskDiv) return;

    const subtaskList = taskDiv.querySelector('.subtask-list');
    const subtaskEl = createSubtaskElement(taskId, subtask, eventHandlers);
    subtaskList.appendChild(subtaskEl);

    taskDiv.classList.add('has-subtasks');
    const placeholderBtn = taskDiv.querySelector('.add-subtask-placeholder-btn');
    const form = taskDiv.querySelector('.add-subtask-form');

    placeholderBtn.classList.add('hidden');
    form.classList.remove('hidden');
    form.querySelector('.add-subtask-input').focus();
}