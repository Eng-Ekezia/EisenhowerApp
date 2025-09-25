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

function getSampleTasks() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowISO = tomorrow.toISOString().split('T')[0];

    return [
        {
            id: generateId(),
            text: "Finalizar relatório para reunião de amanhã",
            quadrant: "q1",
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: tomorrowISO,
            subtasks: [] // NOVA PROPRIEDADE
        },
        {
            id: generateId(),
            text: "Planejar férias do próximo ano",
            quadrant: "q2",
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null,
            // Exemplo de subtarefas
            subtasks: [ // NOVA PROPRIEDADE
                { id: generateId(), text: "Pesquisar destinos", completed: true },
                { id: generateId(), text: "Verificar preços de passagens", completed: false },
                { id: generateId(), text: "Reservar hotel", completed: false }
            ]
        },
        {
            id: generateId(),
            text: "Responder emails não-urgentes",
            quadrant: "q3",
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null,
            subtasks: [] // NOVA PROPRIEDADE
        }
    ];
}

export const taskService = {
    getTasks: () => {
        return loadTasks();
    },

    addTask: (tasks, quadrant, text, dueDate) => {
        if (!text || !text.trim()) return tasks;

        const newTask = {
            id: generateId(),
            text: text.trim(),
            quadrant,
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: dueDate || null,
            subtasks: [] // NOVA PROPRIEDADE
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
    },

    // --- NOVAS FUNÇÕES PARA SUBTAREFAS ---

    /**
     * Adiciona uma subtarefa a uma tarefa principal.
     */
    addSubtask: (tasks, taskId, subtaskText) => {
        if (!subtaskText || !subtaskText.trim()) return tasks;

        const newSubtask = {
            id: generateId(),
            text: subtaskText.trim(),
            completed: false
        };

        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                // Adiciona a nova subtarefa ao array existente
                const updatedSubtasks = [...task.subtasks, newSubtask];
                return { ...task, subtasks: updatedSubtasks };
            }
            return task;
        });

        saveTasks(updatedTasks);
        return updatedTasks;
    },

    /**
     * Atualiza uma subtarefa existente (texto ou status de conclusão).
     */
    updateSubtask: (tasks, taskId, subtaskId, updates) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                const updatedSubtasks = task.subtasks.map(subtask => 
                    subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                );
                return { ...task, subtasks: updatedSubtasks };
            }
            return task;
        });

        saveTasks(updatedTasks);
        return updatedTasks;
    },

    /**
     * Deleta uma subtarefa.
     */
    deleteSubtask: (tasks, taskId, subtaskId) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                const updatedSubtasks = task.subtasks.filter(subtask => subtask.id !== subtaskId);
                return { ...task, subtasks: updatedSubtasks };
            }
            return task;
        });

        saveTasks(updatedTasks);
        return updatedTasks;
    }
};