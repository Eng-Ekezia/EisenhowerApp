class EisenhowerMatrix {
    constructor() {
        this.tasks = this.loadTasks();
        this.draggedTask = null;
        this.touchStartX = 0;
        this.touchStartY = 0;
        this.currentTaskInput = null;
        this.isInitialized = false;
        
        // Aguardar DOM estar completamente carregado
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
        } else {
            this.init();
        }
    }

    init() {
        if (this.isInitialized) return;
        this.isInitialized = true;
        
        this.loadSampleTasks();
        this.renderTasks();
        this.bindEvents();
    }

    bindEvents() {
        // Aguardar um frame para garantir que todos os elementos existam
        requestAnimationFrame(() => {
            // Botões de adicionar tarefa
            document.querySelectorAll('.add-task-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const quadrant = btn.getAttribute('data-quadrant');
                    this.showTaskInput(quadrant);
                });
            });

            // Modais - verificar se os elementos existem
            const helpBtn = document.getElementById('help-btn');
            const statsBtn = document.getElementById('stats-btn');
            const closeHelp = document.getElementById('close-help');
            const closeStats = document.getElementById('close-stats');

            if (helpBtn) {
                helpBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showModal('help-modal');
                });
            }
            
            if (statsBtn) {
                statsBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.showStatsModal();
                });
            }

            if (closeHelp) {
                closeHelp.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hideModal('help-modal');
                });
            }
            
            if (closeStats) {
                closeStats.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.hideModal('stats-modal');
                });
            }

            // Fechar modal clicando no overlay
            document.querySelectorAll('.modal__overlay').forEach(overlay => {
                overlay.addEventListener('click', (e) => {
                    e.preventDefault();
                    const modal = e.target.closest('.modal');
                    if (modal) {
                        this.hideModal(modal.id);
                    }
                });
            });

            // Keyboard shortcuts
            document.addEventListener('keydown', this.handleKeydown.bind(this));
        });
    }

    generateId() {
        return Date.now() + Math.random().toString(36).substr(2, 9);
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('eisenhower-tasks');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            console.error('Erro ao carregar tarefas:', e);
            return [];
        }
    }

    saveTasks() {
        try {
            localStorage.setItem('eisenhower-tasks', JSON.stringify(this.tasks));
        } catch (e) {
            console.error('Erro ao salvar tarefas:', e);
        }
    }

    loadSampleTasks() {
        // Carregar tarefas de exemplo apenas se não houver tarefas salvas
        if (this.tasks.length === 0) {
            const sampleTasks = [
                {
                    id: this.generateId(),
                    text: "Finalizar relatório para reunião de amanhã",
                    quadrant: "q1",
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    text: "Planejar férias do próximo ano",
                    quadrant: "q2",
                    completed: false,
                    createdAt: new Date().toISOString()
                },
                {
                    id: this.generateId(),
                    text: "Responder emails não-urgentes",
                    quadrant: "q3",
                    completed: false,
                    createdAt: new Date().toISOString()
                }
            ];
            
            this.tasks = sampleTasks;
            this.saveTasks();
        }
    }

    addTask(quadrant, text) {
        if (!text.trim()) return;

        const task = {
            id: this.generateId(),
            text: text.trim(),
            quadrant,
            completed: false,
            createdAt: new Date().toISOString()
        };

        this.tasks.push(task);
        this.saveTasks();
        this.renderTasks();
        
        // Animar nova tarefa
        setTimeout(() => {
            const taskEl = document.querySelector(`[data-task-id="${task.id}"]`);
            if (taskEl) {
                taskEl.classList.add('fade-in');
            }
        }, 100);
    }

    updateTask(id, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveTasks();
            this.renderTasks();
        }
    }

    deleteTask(id) {
        this.tasks = this.tasks.filter(task => task.id !== id);
        this.saveTasks();
        this.renderTasks();
    }

    moveTask(id, newQuadrant) {
        this.updateTask(id, { quadrant: newQuadrant });
    }

    toggleTaskComplete(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.updateTask(id, { completed: !task.completed });
        }
    }

    renderTasks() {
        ['q1', 'q2', 'q3', 'q4'].forEach(quadrant => {
            const container = document.getElementById(`tasks-${quadrant}`);
            if (!container) return;
            
            const tasks = this.tasks.filter(task => task.quadrant === quadrant);
            
            container.innerHTML = '';
            
            if (tasks.length === 0) {
                container.classList.add('empty');
            } else {
                container.classList.remove('empty');
                tasks.forEach(task => {
                    const taskEl = this.createTaskElement(task);
                    container.appendChild(taskEl);
                });
            }
        });
    }

    createTaskElement(task) {
        const template = document.getElementById('task-template');
        if (!template) {
            console.error('Task template not found');
            return document.createElement('div');
        }
        
        const taskEl = template.content.cloneNode(true);
        
        const taskDiv = taskEl.querySelector('.task');
        const checkbox = taskEl.querySelector('.task__checkbox');
        const text = taskEl.querySelector('.task__text');
        const deleteBtn = taskEl.querySelector('.task__delete');

        taskDiv.setAttribute('data-task-id', task.id);
        taskDiv.setAttribute('data-quadrant', task.quadrant);
        taskDiv.setAttribute('draggable', 'true');
        
        if (task.completed) {
            taskDiv.classList.add('completed');
            checkbox.checked = true;
        }

        text.textContent = task.text;
        
        // Events
        checkbox.addEventListener('change', (e) => {
            e.preventDefault();
            this.toggleTaskComplete(task.id);
        });

        text.addEventListener('blur', () => {
            const newText = text.textContent.trim();
            if (newText && newText !== task.text) {
                this.updateTask(task.id, { text: newText });
            } else if (!newText) {
                text.textContent = task.text;
            }
        });

        text.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                text.blur();
            }
            if (e.key === 'Escape') {
                text.textContent = task.text;
                text.blur();
            }
        });

        deleteBtn.addEventListener('click', (e) => {
            e.preventDefault();
            if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
                const taskElement = deleteBtn.closest('.task');
                taskElement.style.animation = 'fadeOut 0.3s ease-out';
                setTimeout(() => {
                    this.deleteTask(task.id);
                }, 300);
            }
        });

        // Drag and drop events
        taskDiv.addEventListener('dragstart', this.handleDragStart.bind(this));
        taskDiv.addEventListener('dragend', this.handleDragEnd.bind(this));

        // Touch events para mobile
        taskDiv.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
        taskDiv.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
        taskDiv.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });

        return taskEl;
    }

    showTaskInput(quadrant) {
        // Remove input existente se houver
        if (this.currentTaskInput) {
            this.currentTaskInput.remove();
            this.currentTaskInput = null;
        }

        const template = document.getElementById('task-input-template');
        if (!template) {
            console.error('Task input template not found');
            return;
        }
        
        const inputEl = template.content.cloneNode(true);
        
        const container = document.getElementById(`tasks-${quadrant}`);
        if (!container) {
            console.error(`Container for quadrant ${quadrant} not found`);
            return;
        }
        
        const input = inputEl.querySelector('.task-input__field');
        const saveBtn = inputEl.querySelector('.task-input__save');
        const cancelBtn = inputEl.querySelector('.task-input__cancel');

        container.appendChild(inputEl);
        this.currentTaskInput = container.querySelector('.task-input');

        // Focus no input
        setTimeout(() => {
            if (input) input.focus();
        }, 100);

        // Events
        if (saveBtn) {
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.addTask(quadrant, input.value);
                this.currentTaskInput.remove();
                this.currentTaskInput = null;
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.currentTaskInput.remove();
                this.currentTaskInput = null;
            });
        }

        if (input) {
            input.addEventListener('keydown', (e) => {
                if (e.key === 'Enter') {
                    e.preventDefault();
                    if (saveBtn) saveBtn.click();
                }
                if (e.key === 'Escape') {
                    if (cancelBtn) cancelBtn.click();
                }
            });
        }
    }

    // Drag and Drop
    handleDragStart(e) {
        if (!e.target.classList.contains('task')) return;
        
        this.draggedTask = e.target;
        e.target.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', e.target.outerHTML);

        // Adicionar listeners para drop zones
        document.querySelectorAll('.quadrant').forEach(quadrant => {
            quadrant.addEventListener('dragover', this.handleDragOver.bind(this));
            quadrant.addEventListener('drop', this.handleDrop.bind(this));
        });
    }

    handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        const quadrant = e.currentTarget;
        if (quadrant && quadrant.classList.contains('quadrant')) {
            quadrant.classList.add('drag-over');
        }
    }

    handleDrop(e) {
        e.preventDefault();
        
        const quadrant = e.currentTarget;
        if (quadrant && quadrant.classList.contains('quadrant') && this.draggedTask) {
            const newQuadrant = quadrant.getAttribute('data-quadrant');
            const taskId = this.draggedTask.getAttribute('data-task-id');
            
            if (newQuadrant && newQuadrant !== this.draggedTask.getAttribute('data-quadrant')) {
                this.moveTask(taskId, newQuadrant);
            }
        }
        
        this.cleanupDrag();
    }

    handleDragEnd(e) {
        this.cleanupDrag();
    }

    cleanupDrag() {
        if (this.draggedTask) {
            this.draggedTask.classList.remove('dragging');
            this.draggedTask = null;
        }
        
        document.querySelectorAll('.quadrant').forEach(q => {
            q.classList.remove('drag-over');
            q.removeEventListener('dragover', this.handleDragOver.bind(this));
            q.removeEventListener('drop', this.handleDrop.bind(this));
        });
    }

    // Touch Events para mobile
    handleTouchStart(e) {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    }

    handleTouchMove(e) {
        const task = e.target.closest('.task');
        if (!task) return;
        
        const deltaX = e.touches[0].clientX - this.touchStartX;
        const deltaY = e.touches[0].clientY - this.touchStartY;
        
        // Swipe horizontal para deletar
        if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 50) {
            e.preventDefault();
            
            if (deltaX > 0) {
                task.classList.add('swipe-right');
            } else {
                task.classList.add('swipe-left');
            }
        }
    }

    handleTouchEnd(e) {
        const task = e.target.closest('.task');
        if (!task) return;
        
        if (task.classList.contains('swipe-left') || task.classList.contains('swipe-right')) {
            if (confirm('Deseja excluir esta tarefa?')) {
                const taskId = task.getAttribute('data-task-id');
                this.deleteTask(taskId);
            } else {
                task.classList.remove('swipe-left', 'swipe-right');
            }
        }
    }

    // Keyboard shortcuts
    handleKeydown(e) {
        if (e.target.tagName === 'INPUT' || e.target.contentEditable === 'true') return;
        
        switch(e.key) {
            case '1':
                e.preventDefault();
                this.showTaskInput('q1');
                break;
            case '2':
                e.preventDefault();
                this.showTaskInput('q2');
                break;
            case '3':
                e.preventDefault();
                this.showTaskInput('q3');
                break;
            case '4':
                e.preventDefault();
                this.showTaskInput('q4');
                break;
            case '?':
                e.preventDefault();
                this.showModal('help-modal');
                break;
            case 'Escape':
                this.hideAllModals();
                break;
        }
    }

    // Modais
    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) {
            console.error(`Modal ${modalId} not found`);
            return;
        }
        
        modal.classList.remove('hidden');
        modal.classList.add('fade-in');
        
        // Focus trap
        const focusableElements = modal.querySelectorAll('button, input, textarea, select');
        if (focusableElements.length > 0) {
            focusableElements[0].focus();
        }
    }

    hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (!modal) return;
        
        modal.classList.add('hidden');
        modal.classList.remove('fade-in');
    }

    hideAllModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
    }

    showStatsModal() {
        const stats = this.calculateStats();
        const content = document.getElementById('stats-content');
        
        if (!content) {
            console.error('Stats content container not found');
            return;
        }
        
        content.innerHTML = `
            <div class="stats-grid" style="display: grid; gap: var(--space-16);">
                <div class="stats-overview" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(120px, 1fr)); gap: var(--space-12);">
                    <div class="stat-card" style="background: var(--color-bg-1); padding: var(--space-16); border-radius: var(--radius-base); text-align: center;">
                        <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-primary);">${stats.total}</div>
                        <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Total de Tarefas</div>
                    </div>
                    <div class="stat-card" style="background: var(--color-bg-3); padding: var(--space-16); border-radius: var(--radius-base); text-align: center;">
                        <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-success);">${stats.completed}</div>
                        <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Concluídas</div>
                    </div>
                    <div class="stat-card" style="background: var(--color-bg-2); padding: var(--space-16); border-radius: var(--radius-base); text-align: center;">
                        <div style="font-size: var(--font-size-2xl); font-weight: var(--font-weight-bold); color: var(--color-warning);">${stats.pending}</div>
                        <div style="color: var(--color-text-secondary); font-size: var(--font-size-sm);">Pendentes</div>
                    </div>
                </div>
                
                <div class="quadrant-stats" style="margin-top: var(--space-16);">
                    <h4 style="margin-bottom: var(--space-12);">Tarefas por Quadrante</h4>
                    <div style="display: grid; gap: var(--space-8);">
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                            <span style="color: #22c55e;">🟢 Fazer Primeiro</span>
                            <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q1}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                            <span style="color: #3b82f6;">🔵 Agendar</span>
                            <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q2}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                            <span style="color: #f59e0b;">🟡 Delegar</span>
                            <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q3}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center; padding: var(--space-8); background: var(--color-secondary); border-radius: var(--radius-sm);">
                            <span style="color: #ef4444;">🔴 Eliminar</span>
                            <span style="font-weight: var(--font-weight-medium);">${stats.byQuadrant.q4}</span>
                        </div>
                    </div>
                </div>

                <div class="progress-bar" style="margin-top: var(--space-16);">
                    <div style="display: flex; justify-content: space-between; margin-bottom: var(--space-8);">
                        <span style="font-size: var(--font-size-sm); font-weight: var(--font-weight-medium);">Progresso Geral</span>
                        <span style="font-size: var(--font-size-sm); color: var(--color-text-secondary);">${stats.completionRate}%</span>
                    </div>
                    <div style="background: var(--color-secondary); height: 8px; border-radius: var(--radius-full); overflow: hidden;">
                        <div style="background: var(--color-success); height: 100%; width: ${stats.completionRate}%; transition: width var(--duration-normal) var(--ease-standard);"></div>
                    </div>
                </div>

                <div class="export-section" style="margin-top: var(--space-20); padding-top: var(--space-16); border-top: 1px solid var(--color-border);">
                    <h4 style="margin-bottom: var(--space-12);">Backup dos Dados</h4>
                    <div style="display: flex; gap: var(--space-8); flex-wrap: wrap;">
                        <button class="btn btn--sm btn--secondary" onclick="window.eisenhower.exportTasks()">
                            💾 Exportar Tarefas
                        </button>
                        <label class="btn btn--sm btn--secondary" style="cursor: pointer;">
                            📁 Importar Tarefas
                            <input type="file" accept=".json" style="display: none;" onchange="window.eisenhower.importTasks(event)">
                        </label>
                    </div>
                </div>
            </div>
        `;
        
        this.showModal('stats-modal');
    }

    calculateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(t => t.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        const byQuadrant = {
            q1: this.tasks.filter(t => t.quadrant === 'q1').length,
            q2: this.tasks.filter(t => t.quadrant === 'q2').length,
            q3: this.tasks.filter(t => t.quadrant === 'q3').length,
            q4: this.tasks.filter(t => t.quadrant === 'q4').length
        };

        return {
            total,
            completed,
            pending,
            completionRate,
            byQuadrant
        };
    }

    exportTasks() {
        const data = {
            tasks: this.tasks,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `eisenhower-matrix-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    importTasks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                
                if (data.tasks && Array.isArray(data.tasks)) {
                    if (confirm('Isso irá substituir todas as tarefas atuais. Continuar?')) {
                        this.tasks = data.tasks;
                        this.saveTasks();
                        this.renderTasks();
                        this.hideModal('stats-modal');
                        alert('Tarefas importadas com sucesso!');
                    }
                } else {
                    alert('Arquivo inválido. Verifique o formato.');
                }
            } catch (error) {
                alert('Erro ao ler o arquivo. Verifique se é um arquivo JSON válido.');
            }
        };
        
        reader.readAsText(file);
        event.target.value = ''; // Reset input
    }
}

// CSS para animações adicionais
const additionalStyles = `
    @keyframes fadeOut {
        from { opacity: 1; transform: scale(1); }
        to { opacity: 0; transform: scale(0.8); }
    }
    
    .stats-grid .stat-card {
        transition: transform var(--duration-normal) var(--ease-standard);
    }
    
    .stats-grid .stat-card:hover {
        transform: translateY(-2px);
    }
`;

// Adicionar estilos extras
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Inicializar aplicação e tornar disponível globalmente
window.eisenhower = new EisenhowerMatrix();