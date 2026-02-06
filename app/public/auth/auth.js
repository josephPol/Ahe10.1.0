// Determinar la URL base dinámicamente
const getBaseUrl = () => {
    return window.location.origin + '/Ahe10.1.0/app/public/auth/';
};

// Guardar estado actual de autenticación
let currentAuthState = null;

// Verificar sesión del usuario y actualizar UI
async function checkAuthStatus() {
    try {
        const baseUrl = getBaseUrl();
        const response = await fetch(baseUrl + 'session.php', {
            credentials: 'include'
        });
        const data = await response.json();
        
        // Solo actualizar UI si el estado cambió
        const newAuthState = data.authenticated ? 'authenticated' : 'not-authenticated';
        
        if (currentAuthState !== newAuthState) {
            currentAuthState = newAuthState;
            
            if (data.authenticated) {
                updateAuthUI(data.user.name, data.user.email, data.user.id);
            } else {
                resetAuthUI();
            }
        }
    } catch (error) {
        console.error('Error checking auth status:', error);
        if (currentAuthState !== 'not-authenticated') {
            currentAuthState = 'not-authenticated';
            resetAuthUI();
        }
    }
}

// Verificar sesión periodicamente
function startSessionCheck() {
    checkAuthStatus(); // Primera verificación inmediata
    setInterval(checkAuthStatus, 5000); // Verificar cada 5 segundos
}

/**
 * Actualizar la UI para mostrar usuario autenticado
 */
function updateAuthUI(userName, userEmail, userId) {
    const topRight = document.querySelector('.topRight');
    const friendsBtn = document.getElementById('friendsBtn');
    
    // Mostrar botón de amigos
    if (friendsBtn) {
        friendsBtn.style.display = 'flex';
    }
    
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
                    body: formData,
                    credentials: 'include'
                });
                const data = await response.json();
                
                if (data.success) {
                    window.location.href = window.location.origin + '/Ahe10.1.0/app/public/html/inicio.html';
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
document.addEventListener('DOMContentLoaded', function() {
    startSessionCheck(); // Inicia verificación cada 5 segundos
    
    // Mostrar/ocultar botón de amigos según autenticación
    const friendsBtn = document.getElementById('friendsBtn');
    if (friendsBtn) {
        // Inicialmente oculto
        friendsBtn.style.display = 'none';
    }
});
