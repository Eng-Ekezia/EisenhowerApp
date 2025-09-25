// js/services/notification-service.js

// Esta função será o ponto de entrada do serviço.
// Ela receberá a lista de tarefas para poder verificá-las.
function init(tasks) {
    console.log("Serviço de notificação iniciado.");
    requestPermission();
    // No futuro, o setInterval para verificar as tarefas virá aqui.
}

// Pede permissão ao usuário para mostrar notificações.
async function requestPermission() {
    if (!("Notification" in window)) {
        console.log("Este navegador não suporta notificações.");
        return;
    }

    const permission = await Notification.requestPermission();
    
    if (permission === "granted") {
        console.log("Permissão para notificações concedida!");
        // Opcional: Mostrar uma notificação de boas-vindas
        new Notification("Ótimo!", { body: "Você será notificado sobre suas tarefas importantes." });
    } else {
        console.log("Permissão para notificações negada.");
    }
}

// Exporta o serviço como um objeto.
export const notificationService = {
    init,
};