// js/ui/ui-manager.js

// Centralizamos os seletores do DOM para fácil manutenção.
const selectors = {
    getTaskList: (quadrant) => document.getElementById(`tasks-${quadrant}`),
    getQuadrant: (quadrant) => document.querySelector(`[data-quadrant="${quadrant}"]`),
    taskTemplate: document.getElementById('task-template'),
    taskInputTemplate: document.getElementById('task-input-template'),
};

let currentTaskInput = null; // Controla o campo de input aberto

/**
 * Cria o elemento HTML para uma única tarefa.
 * @param {object} task - O objeto da tarefa.
 * @param {object} eventHandlers - Objeto com as funções de callback para os eventos.
 * @returns {Node} O elemento da tarefa pronto para ser inserido no DOM.
 */
function createTaskElement(task, eventHandlers) {
    const taskEl = selectors.taskTemplate.content.cloneNode(true);
    
    const taskDiv = taskEl.querySelector('.task');
    const checkbox = taskEl.querySelector('.task__checkbox');
    const textSpan = taskEl.querySelector('.task__text');
    const deleteBtn = taskEl.querySelector('.task__delete');

    taskDiv.setAttribute('data-task-id', task.id);
    if (task.completed) {
        taskDiv.classList.add('completed');
        checkbox.checked = true;
    }

    textSpan.textContent = task.text;
    
    // Vincula os eventos às funções de callback fornecidas pelo orquestrador.
    checkbox.addEventListener('change', () => eventHandlers.onToggleComplete(task.id));
    deleteBtn.addEventListener('click', () => eventHandlers.onDelete(task.id));
    
    textSpan.addEventListener('blur', () => {
        const newText = textSpan.textContent.trim();
        if (newText && newText !== task.text) {
            eventHandlers.onUpdate(task.id, { text: newText });
        } else {
            textSpan.textContent = task.text; // Reverte se o texto for vazio
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

/**
 * Remove o campo de input de nova tarefa, se existir.
 */
function removeCurrentTaskInput() {
    if (currentTaskInput) {
        currentTaskInput.remove();
        currentTaskInput = null;
    }
}

// "API" pública do nosso gerenciador de UI.
export const uiManager = {
    /**
     * Renderiza todas as tarefas na tela.
     * @param {Array} tasks - A lista completa de tarefas.
     * @param {object} eventHandlers - As funções de callback a serem vinculadas às tarefas.
     */
    renderTasks: (tasks, eventHandlers) => {
        // Limpa todas as listas de tarefas existentes
        for (let i = 1; i <= 4; i++) {
            const taskList = selectors.getTaskList(`q${i}`);
            if (taskList) {
                taskList.innerHTML = '';
            }
        }
        
        // Renderiza cada tarefa no seu respectivo quadrante
        tasks.forEach(task => {
            const taskList = selectors.getTaskList(task.quadrant);
            if (taskList) {
                const taskEl = createTaskElement(task, eventHandlers);
                taskList.appendChild(taskEl);
            }
        });
    },

    /**
     * Mostra o campo para adicionar uma nova tarefa em um quadrante.
     * @param {string} quadrant - O quadrante onde o input deve aparecer.
     * @param {object} eventHandlers - Objeto com as funções de callback.
     */
    showTaskInput: (quadrant, eventHandlers) => {
        removeCurrentTaskInput(); // Garante que apenas um input esteja aberto

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

        cancelBtn.addEventListener('click', () => {
            removeCurrentTaskInput();
        });

        inputField.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') saveBtn.click();
            if (e.key === 'Escape') cancelBtn.click();
        });

        container.appendChild(inputElDiv);
        currentTaskInput = inputElDiv;
        inputField.focus();
    },

    // Adicionaremos mais funções de UI aqui (modais, drag-and-drop) em fases futuras.
};