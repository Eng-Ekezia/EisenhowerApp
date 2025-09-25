// js/services/task-service.js

// Chave para o localStorage. Centralizar a chave aqui evita erros de digitação.
const STORAGE_KEY = 'eisenhower-tasks';

/**
 * Carrega as tarefas do localStorage. Se não houver tarefas, 
 * retorna um conjunto de tarefas de exemplo para o primeiro uso.
 * @returns {Array} A lista de tarefas.
 */
function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const tasks = saved ? JSON.parse(saved) : null;
        
        // Se não houver tarefas salvas ou a lista estiver vazia, carrega exemplos.
        if (!tasks || tasks.length === 0) {
            return getSampleTasks();
        }
        return tasks;

    } catch (e) {
        console.error('Erro ao carregar tarefas:', e);
        return getSampleTasks();
    }
}

/**
 * Salva a lista de tarefas no localStorage.
 * @param {Array} tasks - A lista completa de tarefas a ser salva.
 */
function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error('Erro ao salvar tarefas:', e);
    }
}

/**
 * Gera um ID único para uma nova tarefa.
 * @returns {string}
 */
function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

/**
 * Retorna uma lista de tarefas de exemplo.
 * @returns {Array}
 */
function getSampleTasks() {
    return [
        {
            id: generateId(),
            text: "Finalizar relatório para reunião de amanhã",
            quadrant: "q1",
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            text: "Planejar férias do próximo ano",
            quadrant: "q2",
            completed: false,
            createdAt: new Date().toISOString()
        },
        {
            id: generateId(),
            text: "Responder emails não-urgentes",
            quadrant: "q3",
            completed: false,
            createdAt: new Date().toISOString()
        }
    ];
}

// "API" pública do nosso serviço. Estas são as funções que outros módulos poderão usar.
export const taskService = {
    /**
     * Obtém a lista completa de tarefas.
     * @returns {Array}
     */
    getTasks: () => {
        return loadTasks();
    },

    /**
     * Adiciona uma nova tarefa à lista.
     * @param {Array} tasks - A lista de tarefas atual.
     * @param {string} quadrant - O quadrante da nova tarefa (q1, q2, q3, q4).
     * @param {string} text - O texto da tarefa.
     * @returns {Array} A nova lista de tarefas atualizada.
     */
    addTask: (tasks, quadrant, text) => {
        if (!text || !text.trim()) return tasks;

        const newTask = {
            id: generateId(),
            text: text.trim(),
            quadrant,
            completed: false,
            createdAt: new Date().toISOString()
        };
        const updatedTasks = [...tasks, newTask];
        saveTasks(updatedTasks);
        return updatedTasks;
    },

    /**
     * Atualiza uma tarefa existente.
     * @param {Array} tasks - A lista de tarefas atual.
     * @param {string} id - O ID da tarefa a ser atualizada.
     * @param {object} updates - Um objeto com as propriedades a serem atualizadas.
     * @returns {Array} A nova lista de tarefas atualizada.
     */
    updateTask: (tasks, id, updates) => {
        const updatedTasks = tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
        );
        saveTasks(updatedTasks);
        return updatedTasks;
    },

    /**
     * Deleta uma tarefa da lista.
     * @param {Array} tasks - A lista de tarefas atual.
     * @param {string} id - O ID da tarefa a ser deletada.
     * @returns {Array} A nova lista de tarefas atualizada.
     */
    deleteTask: (tasks, id) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        saveTasks(updatedTasks);
        return updatedTasks;
    }
};