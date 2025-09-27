// js/services/task-service.js
import { archiveService } from './archive-service.js';

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

    // NOVO: Tornamos a função saveTasks pública para ser usada na importação
    saveTasks,

    // NOVO: Função para arquivar uma tarefa.
    archiveTask: (tasks, taskId) => {
        const taskToArchive = tasks.find(task => task.id === taskId);
        if (taskToArchive) {
            // 1. Adiciona a tarefa ao arquivo morto através do archiveService.
            archiveService.archiveTask(taskToArchive);
            
            // 2. Remove a tarefa da lista de tarefas ativas.
            const updatedTasks = tasks.filter(task => task.id !== taskId);
            saveTasks(updatedTasks);
            return updatedTasks;
        }
        return tasks; // Retorna as tarefas sem alteração se o ID não for encontrado.
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
        const updatedTasks = tasks.map(task => {
            if (task.id === id) {
                const updatedTask = { ...task, ...updates };

                // NOVO: Adiciona o timestamp 'completedAt' quando a tarefa é concluída.
                if (updates.completed === true && !task.completed) {
                    updatedTask.completedAt = new Date().toISOString();
                } else if (updates.completed === false && task.completed) {
                    updatedTask.completedAt = null; // Remove o timestamp se a tarefa for reaberta
                }

                return updatedTask;
            }
            return task;
        });
        saveTasks(updatedTasks);
        return updatedTasks;
    },

    deleteTask: (tasks, id) => {
        const updatedTasks = tasks.filter(task => task.id !== id);
        saveTasks(updatedTasks);
        return updatedTasks;
    },

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
            return { updatedTasks, newSubtask };
        }
        
        return { updatedTasks: tasks, newSubtask: null };
    },

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