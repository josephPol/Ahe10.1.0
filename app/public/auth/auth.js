// Determinar la URL base dinámicamente
const getBaseUrl = () => {
    const currentPath = window.location.pathname;
    if (currentPath.includes('/html/')) {
        return '../auth/';
    } else if (currentPath.includes('/auth/')) {
        return './';
    } else {
        return 'auth/';
    }
};

// Verificar sesión del usuario y actualizar UI
async function checkAuthStatus() {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(baseUrl + 'session.php');
        const data = await response.json();
        
        if (data.authenticated) {
            // Usuario autenticado
            updateAuthUI(data.user.name, data.user.email);
        } else {
            // Usuario no autenticado
            resetAuthUI();
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        resetAuthUI();
    }
}

/**
 * Actualizar la UI para mostrar usuario autenticado
 */
function updateAuthUI(userName, userEmail) {
    const topRight = document.querySelector('.topRight');
    
    if (topRight) {
        // Limpiar los botones de login y registro
        const authBtns = topRight.querySelectorAll('.auth-btn');
        authBtns.forEach(btn => btn.remove());
        
        // Crear el contenedor del usuario
        const userContainer = document.createElement('div');
        userContainer.className = 'user-menu';
        userContainer.style.cssText = `
            display: flex;
            align-items: center;
            gap: 15px;
        `;
        
        // Nombre del usuario
        const userName_el = document.createElement('span');
        userName_el.className = 'user-name';
        userName_el.textContent = userName;
        userName_el.style.cssText = `
            color: #fff;
            font-weight: bold;
            font-size: 14px;
        `;
        
        // Botón de logout
        const logoutBtn = document.createElement('button');
        logoutBtn.className = 'btn auth-btn btn-danger';
        logoutBtn.textContent = 'Salir';
        logoutBtn.style.cssText = `
            padding: 8px 16px;
            background-color: #e74c3c;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-size: 13px;
            transition: background-color 0.3s;
        `;
        
        logoutBtn.addEventListener('mouseover', () => {
            logoutBtn.style.backgroundColor = '#c0392b';
        });
        
        logoutBtn.addEventListener('mouseout', () => {
            logoutBtn.style.backgroundColor = '#e74c3c';
        });
        
        logoutBtn.addEventListener('click', async () => {
            const baseUrl = getBaseUrl();
            const formData = new FormData();
            formData.append('action', 'logout');
            
            try {
                const response = await fetch(baseUrl + 'auth.php', {
                    method: 'POST',
                    body: formData
                });
                const data = await response.json();
                
                if (data.success) {
                    window.location.href = 'inicio.html';
                }
            } catch (error) {
                console.error('Error logging out:', error);
            }
        });
        
        userContainer.appendChild(userName_el);
        userContainer.appendChild(logoutBtn);
        topRight.insertBefore(userContainer, topRight.firstChild);
    }
}

/**
 * Resetear la UI para mostrar botones de login/registro
 */
function resetAuthUI() {
    const topRight = document.querySelector('.topRight');
    
    if (topRight) {
        // Eliminar el contenedor del usuario si existe
        const userMenu = topRight.querySelector('.user-menu');
        if (userMenu) {
            userMenu.remove();
        }
        
        // Verificar si ya existen los botones de auth
        const existingAuthBtns = topRight.querySelectorAll('.auth-btn');
        if (existingAuthBtns.length === 0) {
            // Crear botones de login y registro
            const loginBtn = document.createElement('a');
            loginBtn.href = 'login.html';
            loginBtn.className = 'btn auth-btn btn-secondary';
            loginBtn.textContent = 'Acceder';
            
            const registerBtn = document.createElement('a');
            registerBtn.href = 'registro.html';
            registerBtn.className = 'btn auth-btn btn-primary';
            registerBtn.textContent = 'Registro';
            
            // Insertar antes del botón de tema
            const themeBtn = topRight.querySelector('.btn-theme');
            if (themeBtn) {
                topRight.insertBefore(registerBtn, themeBtn);
                topRight.insertBefore(loginBtn, themeBtn);
            } else {
                topRight.appendChild(loginBtn);
                topRight.appendChild(registerBtn);
            }
        }
    }
}

// Ejecutar al cargar la página
document.addEventListener('DOMContentLoaded', checkAuthStatus);

// Recargar estado de autenticación cada 30 segundos
setInterval(checkAuthStatus, 30000);
