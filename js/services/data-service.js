// js/services/data-service.js

// NOVO: Importamos os serviços necessários para obter todos os dados.
import { taskService } from './task-service.js';
import { archiveService } from './archive-service.js';

/**
 * Serviço para lidar com operações de importação, exportação e análise de dados.
 */
export const dataService = {
    /**
     * Exporta a lista completa de tarefas (ativas e arquivadas) para um arquivo JSON.
     */
    exportTasks: () => {
        // Obter ambos os conjuntos de tarefas.
        const activeTasks = taskService.getTasks();
        const archivedTasks = archiveService.getArchivedTasks();

        const dataToExport = {
            version: "1.1", // Versão do schema de dados atualizada
            exportedAt: new Date().toISOString(),
            activeTasks: activeTasks,
            archivedTasks: archivedTasks // Adiciona as tarefas arquivadas ao backup
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
     * Importa tarefas de uma string JSON, separando ativas e arquivadas.
     * @param {string} jsonContent - O conteúdo do arquivo JSON.
     * @returns {{activeTasks: Array<object>, archivedTasks: Array<object>}|null}
     */
    importTasks: (jsonContent) => {
        try {
            const data = JSON.parse(jsonContent);
            // Verifica a nova estrutura de dados.
            if (typeof data === 'object' && data !== null && Array.isArray(data.activeTasks)) {
                return {
                    activeTasks: data.activeTasks || [],
                    archivedTasks: data.archivedTasks || []
                };
            }
            // Lida com o formato antigo para retrocompatibilidade.
            if (Array.isArray(data.tasks)) {
                 return {
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