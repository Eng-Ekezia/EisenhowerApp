// js/services/project-service.js

const STORAGE_KEY = 'eisenhower-projects';

function generateId() {
    return Date.now() + Math.random().toString(36).substr(2, 9);
}

function loadProjects() {
    try {
        const saved = localStorage.getItem(STORAGE_KEY);
        return saved ? JSON.parse(saved) : [];
    } catch (e) {
        console.error('Erro ao carregar projetos:', e);
        return [];
    }
}

function saveProjects(projects) {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
    } catch (e) {
        console.error('Erro ao salvar projetos:', e);
    }
}

export const projectService = {
    getProjects: () => {
        return loadProjects();
    },

    addProject: (projectData) => {
        const projects = loadProjects();
        const newProject = {
            id: generateId(),
            name: projectData.name.trim(),
            description: projectData.description.trim() || '',
            createdAt: new Date().toISOString(),
            taskIds: [] // Lista de IDs de tarefas associadas a este projeto
        };
        const updatedProjects = [...projects, newProject];
        saveProjects(updatedProjects);
        return updatedProjects;
    },

    updateProject: (projectId, updates) => {
        const projects = loadProjects();
        const updatedProjects = projects.map(p => {
            if (p.id === projectId) {
                return { ...p, ...updates };
            }
            return p;
        });
        saveProjects(updatedProjects);
        return updatedProjects;
    },

    deleteProject: (projectId) => {
        const projects = loadProjects();
        const updatedProjects = projects.filter(p => p.id !== projectId);
        saveProjects(updatedProjects);
        // NOTA: Isto não apaga as tarefas associadas. Essa lógica
        // será tratada em uma camada superior ou em uma futura iteração.
        return updatedProjects;
    }
};