// js/ui/projects-view.js

function createProjectCard(project, eventHandlers) {
    const card = document.createElement('div');
    card.className = 'card';
    card.style.marginBottom = 'var(--space-16)';
    
    // Futuramente, este card terá mais funcionalidades (ver tarefas, progresso, etc.)
    card.innerHTML = `
        <div class="card__body">
            <h4 style="margin-bottom: var(--space-8);">${project.name}</h4>
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin: 0;">
                ${project.description || 'Nenhuma descrição fornecida.'}
            </p>
        </div>
    `;

    // Adicionar event listeners para editar ou ver detalhes no futuro
    // card.addEventListener('click', () => eventHandlers.onViewProject(project.id));

    return card;
}

export const projectsView = {
    render: (projects, eventHandlers) => {
        const container = document.getElementById('projects-view');
        if (!container) return;

        // Limpa o container
        container.innerHTML = '';

        // Cria a estrutura principal da view
        const header = document.createElement('header');
        header.style.display = 'flex';
        header.style.justifyContent = 'space-between';
        header.style.alignItems = 'center';
        header.style.marginBottom = 'var(--space-24)';
        header.innerHTML = `
            <div>
                <h2 style="font-size: var(--font-size-3xl);">Meus Projetos</h2>
                <p style="color: var(--color-text-secondary); margin-top: var(--space-4);">Organize suas metas e objetivos de longo prazo.</p>
            </div>
            <button class="btn btn--primary" id="add-project-btn">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px; margin-right: 8px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                <span>Novo Projeto</span>
            </button>
        `;
        container.appendChild(header);

        const projectListContainer = document.createElement('div');
        
        if (projects && projects.length > 0) {
            projects.forEach(project => {
                const projectCard = createProjectCard(project, eventHandlers);
                projectListContainer.appendChild(projectCard);
            });
        } else {
            projectListContainer.innerHTML = `
                <div style="text-align: center; padding: var(--space-32); background-color: var(--color-surface); border-radius: var(--radius-lg); border: 2px dashed var(--color-border);">
                    <h4 style="margin-bottom: var(--space-8);">Nenhum projeto encontrado</h4>
                    <p style="color: var(--color-text-secondary);">Clique em "Novo Projeto" para começar a organizar suas metas.</p>
                </div>
            `;
        }

        container.appendChild(projectListContainer);

        // Adicionar event listener para o botão de novo projeto (a lógica será implementada no próximo passo)
        // const addProjectBtn = document.getElementById('add-project-btn');
        // addProjectBtn.addEventListener('click', () => eventHandlers.onShowAddProjectModal());
    }
};