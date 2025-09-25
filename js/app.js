// js/app.js

// Importa os módulos especializados. app.js agora é o ponto de encontro.
import { taskService } from './services/task-service.js';
import { uiManager } from './ui/ui-manager.js';

// O estado da aplicação (a "única fonte da verdade") vive aqui.
let tasks = [];

// O objeto de "handlers" define a ponte entre a UI e a lógica de dados.
// A UI chama estas funções, e elas usam o service para alterar os dados.
const eventHandlers = {
    /** Lida com a conclusão/desmarcação de uma tarefa. */
    onToggleComplete: (taskId) => {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
            // Atualiza o estado usando o service
            tasks = taskService.updateTask(tasks, taskId, { completed: !task.completed });
            // Redesenha a UI
            render();
        }
    },
    
    /** Lida com a exclusão de uma tarefa. */
    onDelete: (taskId) => {
        // Envolve em um confirm para segurança
        if (confirm('Tem certeza que deseja excluir esta tarefa?')) {
            tasks = taskService.deleteTask(tasks, taskId);
            render();
        }
    },
    
    /** Lida com a atualização do texto de uma tarefa. */
    onUpdate: (taskId, updates) => {
        tasks = taskService.updateTask(tasks, taskId, updates);
        // Não precisa renderizar, pois o blur do contenteditable já atualizou a UI.
        // Se a renderização fosse necessária, chamaríamos render() aqui.
    },
    
    /** Lida com o salvamento de uma nova tarefa vinda do input. */
    onSaveNewTask: (quadrant, text) => {
        tasks = taskService.addTask(tasks, quadrant, text);
        render();
    },
};

/**
 * A função central de renderização. Sempre que os dados mudam,
 * esta função é chamada para redesenhar a interface.
 */
function render() {
    uiManager.renderTasks(tasks, eventHandlers);
}

/**
 * Vincula os eventos a elementos estáticos da página (que não são recriados).
 */
function bindStaticEvents() {
    // Adiciona o listener para os botões "Adicionar Tarefa"
    document.querySelectorAll('.add-task-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const quadrant = btn.dataset.quadrant;
            // Pede para a UI mostrar o input, passando os handlers para os botões de Salvar/Cancelar.
            uiManager.showTaskInput(quadrant, eventHandlers);
        });
    });

    // Aqui adicionaremos os eventos dos modais e drag-and-drop em fases futuras.
}

/**
 * A função de inicialização da aplicação.
 */
function init() {
    // 1. Carrega os dados iniciais do serviço.
    tasks = taskService.getTasks();
    // 2. Vincula os eventos estáticos.
    bindStaticEvents();
    // 3. Renderiza a aplicação pela primeira vez.
    render();
}

// Inicia a aplicação quando o script é carregado.
init();