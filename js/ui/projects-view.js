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
    card.dataset.projectId = project.id;
    
    // NOVO: Adiciona classe se o projeto estiver concluído
    if (project.status === 'completed') {
        card.classList.add('is-completed');
    }
    
    card.innerHTML = `
        <div class="project-card__header">
            <h4 class="project-card__title">${project.name}</h4>
            <button class="btn btn--secondary btn--sm edit-project-btn" title="Editar Projeto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" style="width: 16px; height: 16px;">
                    <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                </svg>
            </button>
        </div>
        <div class="project-card__body">
            <p class="project-card__description">${project.description || 'Nenhuma descrição fornecida.'}</p>
        </div>
    `;

    const title = card.querySelector('.project-card__title');
    const body = card.querySelector('.project-card__body');
    title.style.cursor = 'pointer';
    body.style.cursor = 'pointer';

    title.addEventListener('click', () => eventHandlers.onViewProject(project.id));
    body.addEventListener('click', () => eventHandlers.onViewProject(project.id));

    const editButton = card.querySelector('.edit-project-btn');
    editButton.addEventListener('click', (e) => {
        e.stopPropagation(); 
        eventHandlers.onShowEditProjectModal(project.id);
    });

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
    
    // NOVO: Filtra projetos que não estão arquivados
    const activeProjects = projects.filter(p => p.status !== 'archived');
    
    if (activeProjects && activeProjects.length > 0) {
        // Ordena para que projetos concluídos apareçam no final
        activeProjects.sort((a, b) => {
            if (a.status === 'completed' && b.status !== 'completed') return 1;
            if (a.status !== 'completed' && b.status === 'completed') return -1;
            return 0; // Mantém a ordem original para projetos de mesmo status
        });
        
        activeProjects.forEach(project => {
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
 * Cria o card para uma tarefa dentro da visão de projeto.
 * @param {object} task - O objeto da tarefa.
 * @param {object} eventHandlers - Os handlers de evento.
 * @returns {HTMLElement} - O elemento do card da tarefa.
 */
function createPlannedTaskCard(task, eventHandlers) {
    const card = document.createElement('div');
    card.className = 'planned-task-card';
    card.dataset.taskId = task.id;

    const quadrantMap = {
        q1: { name: 'Fazer Primeiro', class: 'status--q1' },
        q2: { name: 'Agendar', class: 'status--q2' },
        q3: { name: 'Delegar', class: 'status--q3' },
        q4: { name: 'Eliminar', class: 'status--q4' }
    };

    let statusIndicatorHTML = '';
    let actionControlsHTML = '';

    if (task.completed) {
        statusIndicatorHTML = `<div class="task-status-badge status--completed">Concluída</div>`;
        actionControlsHTML = `<button class="btn btn--sm btn--outline delete-planned-task-btn" title="Excluir Tarefa">Excluir</button>`;
    } else if (task.quadrant) {
        const quadrantInfo = quadrantMap[task.quadrant];
        statusIndicatorHTML = `<div class="task-status-badge ${quadrantInfo.class}">Na Matriz: ${quadrantInfo.name}</div>`;
        actionControlsHTML = `<button class="btn btn--sm btn--outline delete-planned-task-btn" title="Excluir Tarefa">Excluir</button>`;
    } else {
        statusIndicatorHTML = `
            <div class="planned-task-card__flags">
                <label><input type="checkbox" class="is-important-checkbox"> Importante</label>
                <label><input type="checkbox" class="is-urgent-checkbox"> Urgente</label>
            </div>`;
        actionControlsHTML = `
            <button class="btn btn--sm btn--outline delete-planned-task-btn" title="Excluir Tarefa">Excluir</button>
            <button class="btn btn--sm btn--primary promote-task-btn" title="Mover para a Matriz de Execução">Promover</button>`;
    }

    card.innerHTML = `
        <div class="planned-task-card__main">
            <span class="planned-task-card__text" contenteditable="true">${task.text}</span>
            <input type="date" class="planned-task-card__date" value="${task.dueDate || ''}">
        </div>
        <div class="planned-task-card__actions">
            ${statusIndicatorHTML}
            <div class="planned-task-card__buttons">
                ${actionControlsHTML}
            </div>
        </div>
    `;

    const textEl = card.querySelector('.planned-task-card__text');
    const dateEl = card.querySelector('.planned-task-card__date');
    const deleteBtn = card.querySelector('.delete-planned-task-btn');

    textEl.addEventListener('blur', () => {
        if (textEl.textContent.trim() !== task.text) {
            eventHandlers.onUpdateProjectTask(task.id, { text: textEl.textContent.trim() });
        }
    });
    dateEl.addEventListener('blur', () => {
        if (dateEl.value !== (task.dueDate || '')) {
            eventHandlers.onUpdateProjectTask(task.id, { dueDate: dateEl.value || null });
        }
    });
    
    textEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            textEl.blur();
        }
    });

    deleteBtn.addEventListener('click', () => eventHandlers.onDeleteProjectTask(task.id));

    if (!task.quadrant && !task.completed) {
        const promoteBtn = card.querySelector('.promote-task-btn');
        const urgentCheck = card.querySelector('.is-urgent-checkbox');
        const importantCheck = card.querySelector('.is-important-checkbox');

        promoteBtn.addEventListener('click', () => {
            eventHandlers.onPromoteTaskToMatrix(task.id, urgentCheck.checked, importantCheck.checked);
        });
    }

    if (task.completed) {
        card.classList.add('is-completed');
    }

    return card;
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
    // ATUALIZADO: Limpa as classes do container
    container.className = 'container';

    const completedTasks = tasks.filter(t => t.completed).length;
    const progress = tasks.length > 0 ? (completedTasks / tasks.length) * 100 : 0;
    
    // Lógica para o botão "Concluir"
    const isCompleted = project.status === 'completed';
    const completeBtnText = isCompleted ? 'Reativar' : 'Concluir';
    const completeBtnClass = isCompleted ? 'btn--secondary' : 'btn--primary';
    // Ícone dinâmico para Concluir/Reativar
    const completeBtnIcon = isCompleted ? 
        `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>` :
        `<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" /></svg>`;

    const detailHeader = document.createElement('header');
    detailHeader.style.marginBottom = 'var(--space-24)';
    
    // =================================================================
    // ATUALIZAÇÃO PRINCIPAL: Estrutura dos botões padronizada
    // =================================================================
    detailHeader.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-16); flex-wrap: wrap; gap: var(--space-12);">
            <div style="display: flex; align-items: center; gap: var(--space-16);">
                <button class="btn btn--secondary" id="back-to-projects-btn" title="Voltar para a lista de projetos">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6"><path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" /></svg>
                    <span>Voltar</span>
                </button>
                <h2 style="font-size: var(--font-size-3xl); margin: 0;">${project.name}</h2>
            </div>
            
            <div class="project-detail__actions">
                 <button class="btn btn--secondary" id="edit-project-detail-btn" title="Editar nome e descrição">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                         <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
                    </svg>
                    <span>Editar</span>
                </button>
                <button class="btn ${completeBtnClass}" id="complete-project-btn" title="${completeBtnText} projeto">
                    ${completeBtnIcon}
                    <span>${completeBtnText}</span>
                </button>
                <button class="btn btn--secondary" id="archive-project-btn" title="Arquivar projeto">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5M10 11.25h4" />
                    </svg>
                    <span>Arquivar</span>
                </button>
                <button class="btn btn--outline" id="delete-project-btn" title="Excluir projeto permanentemente">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m6 4.125 2.25 2.25m0 0 2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
                    </svg>
                    <span>Excluir</span>
                </button>
            </div>
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
    
    // Adiciona classe de concluído ao container PAI
    if (isCompleted) {
        container.classList.add('project-is-completed');
    }
    
    container.appendChild(detailHeader);
    
    // Adiciona event listeners (sem alteração na lógica, apenas no HTML acima)
    container.querySelector('#back-to-projects-btn').addEventListener('click', eventHandlers.onBackToProjectList);
    container.querySelector('#edit-project-detail-btn').addEventListener('click', () => {
        eventHandlers.onShowEditProjectModal(project.id);
    });
    container.querySelector('#delete-project-btn').addEventListener('click', () => {
        eventHandlers.onDeleteProject(project.id);
    });
    container.querySelector('#complete-project-btn').addEventListener('click', () => {
        eventHandlers.onCompleteProject(project.id);
    });
    container.querySelector('#archive-project-btn').addEventListener('click', () => {
        eventHandlers.onArchiveProject(project.id);
    });

    const taskSection = document.createElement('div');
    taskSection.innerHTML = `<h4 style="margin-bottom: var(--space-16); border-top: 1px solid var(--color-border); padding-top: var(--space-24); margin-top: var(--space-24);">Tarefas do Projeto</h4>`;
    
    if (tasks.length > 0) {
        const list = document.createElement('div');
        list.className = 'planned-task-list';
        tasks.forEach(task => {
            const taskCard = createPlannedTaskCard(task, eventHandlers);
            list.appendChild(taskCard);
        });
        taskSection.appendChild(list);
    } else {
        const emptyState = document.createElement('p');
        emptyState.textContent = 'Nenhuma tarefa para este projeto ainda. Adicione uma abaixo!';
        emptyState.style.color = 'var(--color-text-secondary)';
        taskSection.appendChild(emptyState);
    }

    const addTaskForm = document.createElement('form');
    addTaskForm.id = 'add-project-task-form';
    addTaskForm.style.marginTop = 'var(--space-24)';
    addTaskForm.innerHTML = `
        <div style="display: flex; gap: var(--space-8);">
            <input type="text" id="new-project-task-text" class="form-control" placeholder="Adicionar uma nova tarefa ao projeto..." required>
            <button type="submit" class="btn btn--primary">Adicionar</button>
        </div>
    `;
    taskSection.appendChild(addTaskForm);
    
    addTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = addTaskForm.querySelector('#new-project-task-text');
        const taskText = input.value.trim();
        if (taskText) {
            eventHandlers.onSaveNewProjectTask(project.id, taskText);
            input.value = '';
        }
    });

    container.appendChild(taskSection);
}

// --- Exportação Principal (Router) ---
export const projectsView = {
    render: (state, eventHandlers) => {
        const container = document.getElementById('projects-view');
        if (!container) return;

        if (state.viewingProjectId) {
            const project = state.projects.find(p => p.id === state.viewingProjectId);
            
            const projectTasks = state.tasks.filter(t => t.projectId === state.viewingProjectId);
            
            if (project) {
                renderProjectDetail(container, project, projectTasks, eventHandlers);
            } else {
                console.error(`Projeto com ID ${state.viewingProjectId} não encontrado.`);
                eventHandlers.onBackToProjectList();
            }
        } else {
            renderProjectList(container, state.projects, eventHandlers);
        }
    },
    
    // NOVO: Função para renderizar projetos arquivados (será chamada pelo app.js)
    renderArchivedProjects: (archivedProjects, eventHandlers) => {
        const container = document.getElementById('project-archive-list-container');
        const emptyMsg = document.getElementById('empty-project-archive-message');
        
        if (!container || !emptyMsg) return;

        container.innerHTML = '';

        if (archivedProjects.length === 0) {
            emptyMsg.classList.remove('hidden');
            return;
        }
        
        emptyMsg.classList.add('hidden');

        const fragment = document.createDocumentFragment();
        archivedProjects.sort((a, b) => new Date(b.archivedAt) - new Date(a.archivedAt));

        archivedProjects.forEach(project => {
            const projectEl = document.createElement('div');
            projectEl.className = 'archived-project-item';
            
            const archivedAt = new Date(project.archivedAt).toLocaleDateString('pt-BR');

            projectEl.innerHTML = `
                <div class="archived-project-item__main">
                    <span class="archived-project-item__text">${project.name}</span>
                    <span class="archived-project-item__meta">Arquivado em: ${archivedAt}</span>
                </div>
                <div class="archived-project-item__actions">
                    <button class="btn btn--sm btn--secondary restore-btn" title="Restaurar Projeto">Restaurar</button>
                    <button class="btn btn--sm btn--outline delete-btn" title="Excluir Permanentemente">Excluir</button>
                </div>
            `;

            projectEl.querySelector('.restore-btn').addEventListener('click', () => eventHandlers.onRestoreProject(project.id));
            projectEl.querySelector('.delete-btn').addEventListener('click', () => eventHandlers.onDeletePermanentlyProject(project.id));
            
            fragment.appendChild(projectEl);
        });

        container.appendChild(fragment);
    }
};