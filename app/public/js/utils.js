/**
 * Utilidades compartidas para todo el proyecto
 * Funciones reutilizables que se usan en múltiples archivos
 */

// ==================== FUNCIONES DE SEGURIDAD ====================

/**
 * Escapar caracteres HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ==================== FUNCIONES DE NOTIFICACIÓN ====================

/**
 * Mostrar notificación temporal
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo: 'success', 'error', 'info'
 */
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        border-radius: 5px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// ==================== FUNCIONES DE UTILIDAD ====================

/**
 * Esperar un tiempo determinado
 * @param {number} ms - Milisegundos a esperar
 * @returns {Promise}
 */
function wait(ms = 1000) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Obtener parámetro de URL
 * @param {string} paramName - Nombre del parámetro
 * @returns {string|null} - Valor del parámetro o null
 */
function getUrlParam(paramName) {
    const params = new URLSearchParams(window.location.search);
    return params.get(paramName);
}

/**
 * Formatear fecha
 * @param {string|Date} date - Fecha a formatear
 * @returns {string} - Fecha formateada
 */
function formatDate(date) {
    if (typeof date === 'string') date = new Date(date);
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return date.toLocaleDateString('es-ES', options);
}
