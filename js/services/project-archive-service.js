// js/services/project-archive-service.js

const ARCHIVE_STORAGE_KEY = 'eisenhower-archived-projects';

function loadArchivedProjects() {
    try {
        const saved = localStorage.getItem(ARCHIVE_STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Erro ao carregar projetos arquivados:', e);
        return [];
    }
}

function saveArchivedProjects(projects) {
    try {
        localStorage.setItem(ARCHIVE_STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
        console.error('Erro ao salvar projetos arquivados:', e);
    }
}

export const projectArchiveService = {
    getArchivedProjects: () => {
        return loadArchivedProjects();
    },

    saveArchivedProjects,

    archiveProject: (project) => {
        const archivedProjects = loadArchivedProjects();
        const projectToArchive = {
            ...project,
            archivedAt: new Date().toISOString()
        };
        const updatedArchive = [...archivedProjects, projectToArchive];
        saveArchivedProjects(updatedArchive);
        return updatedArchive;
    },

    restoreProject: (projectId) => {
        let restoredProject = null;
        const archivedProjects = loadArchivedProjects();
        const updatedArchive = archivedProjects.filter(project => {
            if (project.id === projectId) {
                restoredProject = project;
                return false; // Remove da lista de arquivados
            }
            return true;
        });

        if (restoredProject) {
            delete restoredProject.archivedAt; // Limpa o status de arquivamento
            saveArchivedProjects(updatedArchive);
        }
        return { updatedArchive, restoredProject };
    },
    
    deletePermanently: (projectId) => {
        const archivedProjects = loadArchivedProjects();
        const updatedArchive = archivedProjects.filter(project => project.id !== projectId);
        saveArchivedProjects(updatedArchive);
        return updatedArchive;
    }
};