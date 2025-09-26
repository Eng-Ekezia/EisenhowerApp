// js/services/data-service.js

/**
 * Serviço para lidar com operações de importação, exportação e análise de dados.
 */
export const dataService = {
    /**
     * Exporta a lista de tarefas para um arquivo JSON.
     * @param {Array<object>} tasks - A lista de tarefas a ser exportada.
     */
    exportTasks: (tasks) => {
        const dataToExport = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            tasks: tasks
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
     * Importa tarefas de uma string JSON.
     * @param {string} jsonContent - O conteúdo do arquivo JSON.
     * @returns {Array<object>|null} - Retorna a lista de tarefas se o JSON for válido, caso contrário, retorna null.
     */
    importTasks: (jsonContent) => {
        try {
            const data = JSON.parse(jsonContent);
            if (typeof data === 'object' && data !== null && Array.isArray(data.tasks)) {
                return data.tasks;
            }
            console.error("Erro de importação: O arquivo JSON não tem o formato esperado.");
            return null;
        } catch (error) {
            console.error("Erro de importação: Falha ao analisar o arquivo JSON.", error);
            return null;
        }
    },

    /**
     * Calcula as estatísticas com base na lista de tarefas.
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

        return {
            total,
            completed,
            pending,
            completionRate,
            byQuadrant
        };
    }
};