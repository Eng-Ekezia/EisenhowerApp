// js/services/notification-service.js

const notifiedTaskIds = new Set();
let tasksProvider = () => [];

function start(getTasksFunction) {
    console.log("Serviço de notificação iniciado.");
    tasksProvider = getTasksFunction;
    
    requestPermission().then(permission => {
        if (permission === "granted") {
            setInterval(checkForDueTasks, 60000); 
            checkForDueTasks();
        }
    });
}

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

function checkForDueTasks() {
    const tasks = tasksProvider();
    const today = new Date();

    console.log(`Verificando tarefas às ${today.toLocaleTimeString()}`);

    const dueTodayTasks = tasks.filter(task => 
        !task.completed && 
        task.dueDate && 
        isToday(new Date(task.dueDate))
    );

    for (const task of dueTodayTasks) {
        if (!notifiedTaskIds.has(task.id)) {
            showNotification(task);
            notifiedTaskIds.add(task.id);
        }
    }
}

function isToday(someDate) {
    const today = new Date();
    const adjustedSomeDate = new Date(someDate.valueOf() + someDate.getTimezoneOffset() * 60 * 1000);
    
    return adjustedSomeDate.getDate() === today.getDate() &&
           adjustedSomeDate.getMonth() === today.getMonth() &&
           adjustedSomeDate.getFullYear() === today.getFullYear();
}

// --- INÍCIO DA ATUALIZAÇÃO ---
// Mostra a notificação e adiciona o evento de clique
function showNotification(task) {
    const title = `Tarefa Urgente: ${task.text}`;
    const options = {
        body: `Sua tarefa no quadrante "${task.quadrant.toUpperCase()}" vence hoje!`,
        // Opcional: adicione um ícone na pasta do projeto
        // icon: './assets/icon.png' 
    };

    const notification = new Notification(title, options);

    // Adiciona a mágica do clique aqui
    notification.onclick = (event) => {
        // Previne o comportamento padrão do navegador
        event.preventDefault(); 
        
        // Procura por uma aba já aberta da nossa aplicação
        window.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientsArr => {
            const hasWindow = clientsArr.some(
                windowClient => windowClient.url === window.location.href
            );

            // Se encontrar uma aba, foca nela
            if (hasWindow) {
                const appWindow = clientsArr[0];
                appWindow.focus();
            } else {
                // Se não encontrar, abre uma nova
                window.open(window.location.href, '_blank');
            }
        });
        
        // Fecha a notificação após o clique
        notification.close();
    };
}
// --- FIM DA ATUALIZAÇÃO ---


export const notificationService = {
    start,
};