// js/ui/projects-view.js

/**
 * Módulo responsável por renderizar a visão de Projetos.
 * No futuro, ele irá gerar o HTML para a lista de projetos e suas tarefas.
 */
export const projectsView = {
    render: (projects, eventHandlers) => {
        const container = document.getElementById('projects-view');
        if (!container) return;

        // Por agora, apenas exibimos uma mensagem de "em construção".
        container.innerHTML = `
            <div style="padding: var(--space-32); text-align: center;">
                <h2>Módulo de Projetos</h2>
                <p style="color: var(--color-text-secondary);">Esta área será dedicada à gestão de projetos de longo prazo.</p>
            </div>
        `;
    }
};