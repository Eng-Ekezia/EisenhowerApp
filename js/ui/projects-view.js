// js/ui/projects-view.js

// --- Funções de Renderização Específicas ---

/**
 * Cria e retorna o elemento HTML para um único card de projeto na lista.
 * @param {object} project - O objeto do projeto.
 * @param {object} eventHandlers - Objeto com as funções de callback.
 * @returns {HTMLElement} - O elemento do card do projeto.
 */
function createProjectCard(project, eventHandlers) {
    const card = document.createElement('div');
    card.className = 'card project-card';
    card.style.marginBottom = 'var(--space-16)';
    card.style.cursor = 'pointer';
    card.dataset.projectId = project.id;
    
    card.innerHTML = `
        <div class="card__body">
            <h4 style="margin-bottom: var(--space-8);">${project.name}</h4>
            <p style="color: var(--color-text-secondary); font-size: var(--font-size-sm); margin: 0;">
                ${project.description || 'Nenhuma descrição fornecida.'}
            </p>
        </div>
    `;

    card.addEventListener('click', () => eventHandlers.onViewProject(project.id));

    return card;
}

/**
 * Renderiza a visualização principal que lista todos os projetos.
 * @param {HTMLElement} container - O elemento onde a view será renderizada.
 * @param {Array<object>} projects - A lista de projetos.
 * @param {object} eventHandlers - Objeto com as funções de callback.
 */
function renderProjectList(container, projects, eventHandlers) {
    container.innerHTML = '';

    const header = document.createElement('header');
    header.style.display = 'flex';
    header.style.justifyContent = 'space-between';
    header.style.alignItems = 'center';
    header.style.marginBottom = 'var(--space-24)';
    header.innerHTML = `
        <div>
            <h2 style="font-size: var(--font-size-2xl);">Organize suas metas e objetivos de longo prazo</h2>
        </div>
        <button class="btn btn--primary" id="add-project-btn">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 20px; height: 20px; margin-right: 8px;">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            <span>Novo Projeto</span>
        </button>
    `;
    container.appendChild(header);

    const addProjectBtn = container.querySelector('#add-project-btn');
    if(eventHandlers.onShowAddProjectModal) {
        addProjectBtn.addEventListener('click', eventHandlers.onShowAddProjectModal);
    }


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
}

/**
 * Renderiza a visualização de detalhes para um único projeto.
 * @param {HTMLElement} container - O elemento onde a view será renderizada.
 * @param {object} project - O projeto a ser detalhado.
 * @param {Array<object>} tasks - As tarefas associadas a este projeto.
 * @param {object} eventHandlers - Objeto com as funções de callback.
 */
function renderProjectDetail(container, project, tasks, eventHandlers) {
    container.innerHTML = '';

    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;

    const detailHeader = document.createElement('header');
    detailHeader.style.marginBottom = 'var(--space-24)';
    detailHeader.innerHTML = `
        <div style="display: flex; align-items: center; gap: var(--space-16); margin-bottom: var(--space-16);">
            <button class="btn btn--secondary btn--sm" id="back-to-projects-btn">
                &larr; Voltar
            </button>
            <h2 style="font-size: var(--font-size-3xl); margin: 0;">${project.name}</h2>
        </div>
        <p style="color: var(--color-text-secondary); margin: 0 0 var(--space-16);">${project.description || ''}</p>
        
        <div>
            <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
                <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">Progresso</span>
                <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${Math.round(progress)}%</span>
            </div>
            <div style="background: var(--color-secondary); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
                <div style="background: var(--color-primary); height: 100%; width: ${progress}%; transition: width 0.5s ease-in-out;"></div>
            </div>
        </div>
    `;
    container.appendChild(detailHeader);
    
    container.querySelector('#back-to-projects-btn').addEventListener('click', eventHandlers.onBackToProjectList);


    const taskListContainer = document.createElement('div');
    taskListContainer.innerHTML = `<h4 style="margin-bottom: var(--space-16); border-top: 1px solid var(--color-border); padding-top: var(--space-24); margin-top: var(--space-24);">Tarefas do Projeto</h4>`;
    
    // **AQUI ESTÁ A MUDANÇA**: Renderiza a lista de tarefas ou uma mensagem de estado vazio.
    if (tasks.length > 0) {
        const list = document.createElement('div');
        list.style.display = 'flex';
        list.style.flexDirection = 'column';
        list.style.gap = 'var(--space-8)';

        tasks.forEach(task => {
            const taskItem = document.createElement('div');
            taskItem.textContent = task.text;
            taskItem.style.padding = 'var(--space-12)';
            taskItem.style.backgroundColor = 'var(--color-surface)';
            taskItem.style.borderRadius = 'var(--radius-base)';
            taskItem.style.border = '1px solid var(--color-border)';
            list.appendChild(taskItem);
        });
        taskListContainer.appendChild(list);
    } else {
        const emptyState = document.createElement('p');
        emptyState.textContent = 'Nenhuma tarefa foi adicionada a este projeto ainda.';
        emptyState.style.color = 'var(--color-text-secondary)';
        taskListContainer.appendChild(emptyState);
    }

    container.appendChild(taskListContainer);
}


// --- Exportação Principal (Router) ---

export const projectsView = {
    /**
     * Ponto de entrada principal para a renderização da UI de projetos.
     * @param {object} state - O estado completo da aplicação.
     * @param {object} eventHandlers - Objeto com as funções de callback.
     */
    render: (state, eventHandlers) => {
        const container = document.getElementById('projects-view');
        if (!container) return;

        if (state.viewingProjectId) {
            const project = state.projects.find(p => p.id === state.viewingProjectId);
            // **IMPORTANTE**: Filtra apenas as tarefas que pertencem ao projeto E que AINDA NÃO estão na matriz (quadrant === null)
            const projectTasks = state.tasks.filter(t => t.projectId === state.viewingProjectId && t.quadrant === null);
            
            if (project) {
                renderProjectDetail(container, project, projectTasks, eventHandlers);
            } else {
                console.error(`Projeto com ID ${state.viewingProjectId} não encontrado.`);
                eventHandlers.onBackToProjectList();
            }
        } else {
            renderProjectList(container, state.projects, eventHandlers);
        }
    }
};