// js/services/task-service.js

const STORAGE_KEY = 'eisenhower-tasks';

function loadTasks() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        const tasks = saved ? JSON.parse(saved) : null;
        
        if (!tasks || tasks.length === 0) {
            return getSampleTasks();
        }
        return tasks.map(task => ({ subtasks: [], ...task }));

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
    const today = new Date();
    const todayISO = today.toISOString().split('T')[0];

    return [
        {
            id: generateId(),
            text: "Finalizar relatório para reunião de amanhã",
            quadrant: "q1",
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: todayISO,
            subtasks: []
        },
        {
            id: generateId(),
            text: "Planejar férias do próximo ano",
            quadrant: "q2",
            completed: false,
            createdAt: new Date().toISOString(),
            dueDate: null,
            subtasks: [
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
            subtasks: []
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
            subtasks: []
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

    // --- INÍCIO DA ATUALIZAÇÃO ---
    addSubtask: (tasks, taskId, subtaskText) => {
        if (!subtaskText || !subtaskText.trim()) return { updatedTasks: tasks, newSubtask: null };
        
        const newSubtask = { id: generateId(), text: subtaskText.trim(), completed: false };
        let taskWasFound = false;

        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                taskWasFound = true;
                const existingSubtasks = task.subtasks || [];
                return { ...task, subtasks: [...existingSubtasks, newSubtask] };
            }
            return task;
        });

        if (taskWasFound) {
            saveTasks(updatedTasks);
            // Retorna ambos: a lista completa e o objeto da nova subtarefa
            return { updatedTasks, newSubtask };
        }
        
        return { updatedTasks: tasks, newSubtask: null };
    },
    // --- FIM DA ATUALIZAÇÃO ---

    updateSubtask: (tasks, taskId, subtaskId, updates) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                const existingSubtasks = task.subtasks || [];
                const updatedSubtasks = existingSubtasks.map(subtask => 
                    subtask.id === subtaskId ? { ...subtask, ...updates } : subtask
                );
                return { ...task, subtasks: updatedSubtasks };
            }
            return task;
        });
        saveTasks(updatedTasks);
        return updatedTasks;
    },

    deleteSubtask: (tasks, taskId, subtaskId) => {
        const updatedTasks = tasks.map(task => {
            if (task.id === taskId) {
                const existingSubtasks = task.subtasks || [];
                return { ...task, subtasks: existingSubtasks.filter(sub => sub.id !== subtaskId) };
            }
            return task;
        });
        saveTasks(updatedTasks);
        return updatedTasks;
    }
};