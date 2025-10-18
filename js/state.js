// js/state.js

/**
 * Módulo para centralizar e gerenciar todo o estado da aplicação.
 * Nenhuma outra parte da aplicação deve modificar o estado diretamente.
 */

// O estado inicial da aplicação.
const state = {
    activeView: 'matrix', // 'matrix' ou 'projects'
    tasks: [],
    archivedTasks: [],
    projects: [],
    archivedProjects: [], // NOVO: Adiciona a lista de projetos arquivados
    draggedTaskId: null,
    matrixViewMode: 'grid', // 'grid' ou 'columns'
    viewingProjectId: null, // NOVO: Armazena o ID do projeto que está sendo visualizado
};

// Lista de 'ouvintes' (funções) que serão notificadas quando o estado mudar.
const listeners = [];

/**
 * Notifica todos os 'ouvintes' sobre a mudança de estado.
 */
function notify() {
    for (const listener of listeners) {
        listener();
    }
}

/**
 * Adiciona um 'ouvinte' que será chamado sempre que o estado for atualizado.
 * @param {function} listener - A função a ser chamada.
 */
export function subscribe(listener) {
    listeners.push(listener);
}

/**
 * Retorna uma cópia do estado atual para evitar mutações diretas.
 * @returns {object} O estado atual da aplicação.
 */
export function getState() {
    return { ...state };
}

/**
 * Atualiza o estado da aplicação com novas propriedades e notifica os 'ouvintes'.
 * @param {object} newState - Um objeto com as propriedades do estado a serem atualizadas.
 */
export function setState(newState) {
    Object.assign(state, newState);
    notify();
}