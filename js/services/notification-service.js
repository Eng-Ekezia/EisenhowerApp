// js/services/notification-service.js

// 1. Importa o uiManager para poder chamar a função de toast
import { uiManager } from '../ui/ui-manager.js';

const notifiedTaskIds = new Set();
let tasksProvider = () => [];

/**
 * Inicia o serviço de verificação de tarefas.
 * @param {function} getTasksFunction - Uma função que retorna a lista atual de tarefas.
 */
function start(getTasksFunction) {
    console.log("Serviço de notificação (Toast) iniciado.");
    tasksProvider = getTasksFunction;
    
    // Roda o verificador a cada minuto, sem a necessidade de pedir permissão
    setInterval(checkForDueTasks, 1200000); 
    
    // Verifica imediatamente ao carregar a página para o caso de já haver tarefas vencendo
    checkForDueTasks(); 
}

/**
 * Verifica a lista de tarefas e dispara notificações para as que vencem hoje.
 */
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

/**
 * Checa se uma determinada data corresponde ao dia de hoje.
 * @param {Date} someDate - A data a ser verificada.
 * @returns {boolean} - Verdadeiro se for hoje.
 */
function isToday(someDate) {
    const today = new Date();
    // Ajusta a data da tarefa para a timezone do usuário para evitar erros de um dia a mais/menos
    const adjustedSomeDate = new Date(someDate.valueOf() + someDate.getTimezoneOffset() * 60 * 1000);
    
    return adjustedSomeDate.getDate() === today.getDate() &&
           adjustedSomeDate.getMonth() === today.getMonth() &&
           adjustedSomeDate.getFullYear() === today.getFullYear();
}

/**
 * Dispara a notificação "toast" na interface do usuário.
 * @param {object} task - O objeto da tarefa.
 */
function showNotification(task) {
    const title = `Tarefa Urgente: ${task.text}`;
    const body = `Sua tarefa no quadrante "${task.quadrant.toUpperCase()}" vence hoje!`;

    // 2. Chama a função showToast do uiManager em vez da API nativa
    uiManager.showToast(title, body);
}

export const notificationService = {
    start,
};