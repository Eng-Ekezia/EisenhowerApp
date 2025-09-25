// js/services/task-service.js

const STORAGE_KEY = 'eisenhower-tasks';

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const tasks = saved ? JSON.parse(saved) : null;
        
        if (!tasks || tasks.length === 0) {
            return getSampleTasks();
        }
        return tasks;

    } catch (e) {
        console.error('Erro ao carregar tarefas:', e);
        return getSampleTasks();
    }
}

function saveTasks(tasks) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error('Erro ao salvar tarefas:', e);
    }
}

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

// **ALTERAÇÃO AQUI:** Adicionamos a propriedade `dueDate` às tarefas de exemplo.
function getSampleTasks() {
    // Para a tarefa de exemplo urgente, vamos definir uma data de vencimento para amanhã.
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0]; // Formato AAAA-MM-DD

    return [
        {
            id: generateId(),
            text: "Finalizar relatório para reunião de amanhã",
            quadrant: "q1",
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: tomorrowISO // Exemplo de data de vencimento
        },
        {
            id: generateId(),
            text: "Planejar férias do próximo ano",
            quadrant: "q2",
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null // Tarefas podem não ter data de vencimento
        },
        {
            id: generateId(),
            text: "Responder emails não-urgentes",
            quadrant: "q3",
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null
        }
    ];
}

export const taskService = {
    getTasks: () => {
        return loadTasks();
    },

    addTask: (tasks, quadrant, text) => {
        if (!text || !text.trim()) return tasks;

        // **ALTERAÇÃO AQUI:** Novas tarefas são criadas com `dueDate` nulo por padrão.
        const newTask = {
            id: generateId(),
            text: text.trim(),
            quadrant,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null 
        };
        const updatedTasks = [...tasks, newTask];
        saveTasks(updatedTasks);
        return updatedTasks;
    },

    updateTask: (tasks, id, updates) => {
        const updatedTasks = tasks.map(task =>
            task.id === id ? { ...task, ...updates } : task
        );
        saveTasks(updatedTasks);
        return updatedTasks;
    },

    deleteTask: (tasks, id) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        saveTasks(updatedTasks);
        return updatedTasks;
    }
};