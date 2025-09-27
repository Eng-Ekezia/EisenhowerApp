// js/services/archive-service.js

const ARCHIVE_STORAGE_KEY = 'eisenhower-archived-tasks';

function loadArchivedTasks() {
    try {
        const saved = localStorage.getItem(ARCHIVE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Erro ao carregar tarefas arquivadas:', e);
        return [];
    }
}

function saveArchivedTasks(tasks) {
    try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(tasks));
    } catch (e) {
        console.error('Erro ao salvar tarefas arquivadas:', e);
    }
}

export const archiveService = {
    getArchivedTasks: () => {
        return loadArchivedTasks();
    },

    archiveTask: (task) => {
        const archivedTasks = loadArchivedTasks();
        const taskToArchive = {
            ...task,
            archivedAt: new Date().toISOString() // Adiciona o timestamp de arquivamento
        };
        const updatedArchive = [...archivedTasks, taskToArchive];
        saveArchivedTasks(updatedArchive);
        return updatedArchive;
    },

    restoreTask: (taskId) => {
        let restoredTask = null;
        const archivedTasks = loadArchivedTasks();
        const updatedArchive = archivedTasks.filter(task => {
            if (task.id === taskId) {
                restoredTask = task;
                return false; // Remove da lista de arquivados
            }
            return true;
        });

        if (restoredTask) {
            delete restoredTask.archivedAt; // Limpa o status de arquivamento
            saveArchivedTasks(updatedArchive);
        }
        return { updatedArchive, restoredTask };
    },
    
    deletePermanently: (taskId) => {
        const archivedTasks = loadArchivedTasks();
        const updatedArchive = archivedTasks.filter(task => task.id !== taskId);
        saveArchivedTasks(updatedArchive);
        return updatedArchive;
    }
};