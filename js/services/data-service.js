// js/services/data-service.js

// Importamos os serviços necessários para obter todos os dados.
import { taskService } from './task-service.js';
import { archiveService } from './archive-service.js';
import { projectService } from './project-service.js';

/**
 * Serviço para lidar com operações de importação, exportação e análise de dados.
 */
export const dataService = {
    /**
     * Exporta a lista completa de dados (tarefas ativas, arquivadas e projetos) para um arquivo JSON.
     */
    exportTasks: () => {
        // Obter todos os conjuntos de dados.
        const activeTasks = taskService.getTasks();
        const archivedTasks = archiveService.getArchivedTasks();
        const projects = projectService.getProjects();

        const dataToExport = {
            version: "1.2", // Versão do schema de dados atualizada para incluir projetos
            exportedAt: new Date().toISOString(),
            projects: projects,
            activeTasks: activeTasks,
            archivedTasks: archivedTasks
        };

        const jsonString = JSON.stringify(dataToExport, null, 2);
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eisenhower-matrix-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    },

    /**
     * Importa dados de uma string JSON, separando projetos, tarefas ativas e arquivadas.
     * @param {string} jsonContent - O conteúdo do arquivo JSON.
     * @returns {{projects: Array<object>, activeTasks: Array<object>, archivedTasks: Array<object>}|null}
     */
    importTasks: (jsonContent) => {
        try {
            const data = JSON.parse(jsonContent);
            
            // Verifica a nova estrutura de dados (v1.2+) que inclui projetos.
            if (typeof data === 'object' && data !== null && Array.isArray(data.activeTasks)) {
                return {
                    projects: data.projects || [],
                    activeTasks: data.activeTasks || [],
                    archivedTasks: data.archivedTasks || []
                };
            }
            
            // Lida com o formato antigo (v1.1) para retrocompatibilidade.
            if (Array.isArray(data.tasks)) {
                 return {
                    projects: [],
                    activeTasks: data.tasks,
                    archivedTasks: []
                };
            }
            
            console.error("Erro de importação: O arquivo JSON não tem o formato esperado.");
            return null;
        } catch (error) {
            console.error("Erro de importação: Falha ao analisar o arquivo JSON.", error);
            return null;
        }
    },

    /**
     * Calcula as estatísticas com base na lista de tarefas ativas.
     * @param {Array<object>} tasks - A lista de tarefas atual.
     * @returns {object} - Um objeto contendo as estatísticas.
     */
    calculateStats: (tasks) => {
        const total = tasks.length;
        const completed = tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const byQuadrant = {
            q1: tasks.filter(t => t.quadrant === 'q1').length,
            q2: tasks.filter(t => t.quadrant === 'q2').length,
            q3: tasks.filter(t => t.quadrant === 'q3').length,
            q4: tasks.filter(t => t.quadrant === 'q4').length
        };

        return { total, completed, pending, completionRate, byQuadrant };
    }
};