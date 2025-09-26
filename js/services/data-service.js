// js/services/data-service.js

/**
 * Serviço para lidar com operações de importação e exportação de dados.
 */
export const dataService = {
    /**
     * Exporta a lista de tarefas para um arquivo JSON.
     * @param {Array<object>} tasks - A lista de tarefas a ser exportada.
     */
    exportTasks: (tasks) => {
        // 1. Prepara os dados para exportação, adicionando metadados.
        const dataToExport = {
            version: "1.0",
            exportedAt: new Date().toISOString(),
            tasks: tasks
        };

        // 2. Converte o objeto para uma string JSON formatada.
        const jsonString = JSON.stringify(dataToExport, null, 2);

        // 3. Cria um Blob (Binary Large Object), que é nosso arquivo em memória.
        const blob = new Blob([jsonString], { type: "application/json" });

        // 4. Cria uma URL temporária para o Blob.
        const url = URL.createObjectURL(blob);

        // 5. Cria um elemento de link <a> invisível para acionar o download.
        const a = document.createElement('a');
        a.href = url;
        a.download = `eisenhower-matrix-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        // 6. Adiciona o link ao corpo do documento, clica nele e depois o remove.
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);

        // 7. Libera a memória revogando a URL do objeto.
        URL.revokeObjectURL(url);
    },

    /**
     * Importa tarefas de uma string JSON.
     * @param {string} jsonContent - O conteúdo do arquivo JSON.
     * @returns {Array<object>|null} - Retorna a lista de tarefas se o JSON for válido, caso contrário, retorna null.
     */
    importTasks: (jsonContent) => {
        try {
            // 1. Tenta analisar a string JSON.
            const data = JSON.parse(jsonContent);

            // 2. Valida a estrutura do arquivo.
            // Verifica se 'data' é um objeto, se possui a chave 'tasks' e se 'tasks' é um array.
            if (typeof data === 'object' && data !== null && Array.isArray(data.tasks)) {
                // 3. Se tudo estiver correto, retorna apenas o array de tarefas.
                return data.tasks;
            }

            // 4. Se a estrutura for inválida, loga um erro e retorna null.
            console.error("Erro de importação: O arquivo JSON não tem o formato esperado.");
            return null;
        } catch (error) {
            // 5. Se ocorrer um erro ao analisar o JSON (ex: arquivo mal formatado), loga e retorna null.
            console.error("Erro de importação: Falha ao analisar o arquivo JSON.", error);
            return null;
        }
    }
};