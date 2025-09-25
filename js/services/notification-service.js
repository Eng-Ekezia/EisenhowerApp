// js/services/notification-service.js

// Usamos um Set para armazenar os IDs das tarefas já notificadas no dia.
// É mais eficiente que um array para verificar se um item existe.
const notifiedTaskIds = new Set();
let tasksProvider = () => []; // Função que nos dará acesso à lista de tarefas atualizada

// Função principal que inicia o serviço
function start(getTasksFunction) {
    console.log("Serviço de notificação iniciado.");
    tasksProvider = getTasksFunction; // Armazena a função que busca as tarefas
    
    requestPermission().then(permission => {
        if (permission === "granted") {
            // Verifica as tarefas a cada 60 segundos
            setInterval(checkForDueTasks, 60000); 
            // Roda uma primeira vez para feedback imediato
            checkForDueTasks();
        }
    });
}

// Pede permissão ao usuário (retorna uma Promise com o status)
function requestPermission() {
    return new Promise((resolve) => {
        if (!("Notification" in window)) {
            console.log("Este navegador não suporta notificações.");
            resolve("denied");
            return;
        }
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                console.log("Permissão para notificações concedida!");
            } else {
                console.log("Permissão para notificações negada.");
            }
            resolve(permission);
        });
    });
}

// A lógica principal que verifica as tarefas
function checkForDueTasks() {
    const tasks = tasksProvider(); // Obtém a lista de tarefas mais recente
    const today = new Date();

    console.log(`Verificando tarefas às ${today.toLocaleTimeString()}`);

    const dueTodayTasks = tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        isToday(new Date(task.dueDate))
    );

    for (const task of dueTodayTasks) {
        // Só notifica se ainda não o fez hoje
        if (!notifiedTaskIds.has(task.id)) {
            showNotification(task);
            notifiedTaskIds.add(task.id);
        }
    }
}

// Função auxiliar para comparar datas ignorando a hora e o fuso horário
function isToday(someDate) {
    const today = new Date();
    // Adiciona o fuso horário para corrigir a conversão de 'YYYY-MM-DD'
    const adjustedSomeDate = new Date(someDate.valueOf() + someDate.getTimezoneOffset() * 60 * 1000);
    
    return adjustedSomeDate.getDate() === today.getDate() &&
           adjustedSomeDate.getMonth() === today.getMonth() &&
           adjustedSomeDate.getFullYear() === today.getFullYear();
}

// Mostra a notificação de fato
function showNotification(task) {
    const title = `Tarefa Urgente: ${task.text}`;
    const options = {
        body: `Sua tarefa no quadrante "${task.quadrant.toUpperCase()}" vence hoje!`,
        icon: './assets/icon.png' // Opcional: adicione um ícone na pasta do projeto
    };

    new Notification(title, options);
}


// Exporta o serviço como um objeto.
export const notificationService = {
    start,
};