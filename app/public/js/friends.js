// Sistema de Amigos para AJE10
document.addEventListener('DOMContentLoaded', function() {
    const friendsBtn = document.getElementById('friendsBtn');
    const friendsPanel = document.getElementById('friendsPanel');
    const closeFriendsPanel = document.getElementById('closeFriendsPanel');
    const tabBtns = document.querySelectorAll('.tab-modern');
    const searchInput = document.getElementById('searchUsersInput');
    const friendsBadgeBtn = document.getElementById('friendsBadgeBtn');
    
    let searchTimeout = null;
    let isAuthenticated = false;

    // Verificar si el usuario está autenticado
    async function checkAuth() {
        try {
            const response = await fetch('../auth/session.php');
            const data = await response.json();
            isAuthenticated = data.authenticated;
            return data.authenticated;
        } catch (error) {
            console.error('Error verificando autenticación:', error);
            return false;
        }
    }

    // Mostrar/Ocultar panel de amigos
    if (friendsBtn) {
        friendsBtn.addEventListener('click', async function() {
            const authenticated = await checkAuth();
            if (!authenticated) {
                alert('Debes iniciar sesión para usar esta función');
                window.location.href = 'login.html';
                return;
            }
            friendsPanel.style.display = 'block';
            loadFriends();
            loadRequests();
        });
    }

    if (closeFriendsPanel) {
        closeFriendsPanel.addEventListener('click', function() {
            friendsPanel.style.display = 'none';
        });
    }

    // Cambiar entre tabs
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            
            // Actualizar botones activos
            tabBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Actualizar contenidos activos
            document.querySelectorAll('.tab-content-modern').forEach(content => {
                content.classList.remove('active');
            });
            
            document.getElementById(tabName + 'Tab').classList.add('active');
            
            // Cargar datos según la tab
            if (tabName === 'friends') {
                loadFriends();
            } else if (tabName === 'requests') {
                loadRequests();
            }
        });
    });

    // Buscar usuarios
    if (searchInput) {
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            const query = this.value.trim();
            
            if (query.length < 2) {
                document.getElementById('searchResults').innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">🔍</span>
                        <p>Busca usuarios para agregarlos</p>
                        <small>Escribe al menos 2 caracteres</small>
                    </div>
                `;
                return;
            }
            
            searchTimeout = setTimeout(() => {
                searchUsers(query);
            }, 500);
        });
    }

    // Función para cargar lista de amigos
    async function loadFriends() {
        try {
            const response = await fetch('../../friends/get-friends.php');
            const data = await response.json();
            
            const friendsList = document.getElementById('friendsList');
            
            if (!data.friends || data.friends.length === 0) {
                friendsList.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">👥</span>
                        <p>No tienes amigos agregados aún</p>
                        <small>Busca usuarios y envía solicitudes de amistad</small>
                    </div>
                `;
                return;
            }
            
            friendsList.innerHTML = data.friends.map(friend => `
                <div class="friend-item">
                    <div class="friend-avatar">${friend.name.charAt(0).toUpperCase()}</div>
                    <div class="friend-info">
                        <div class="friend-name">${escapeHtml(friend.name)}</div>
                        <div class="friend-email">${escapeHtml(friend.email)}</div>
                    </div>
                    <div class="friend-actions">
                        <button class="btn-invite btn-sm" data-friend-id="${friend.id}" data-friend-name="${escapeHtml(friend.name)}">
                            🎮 Invitar
                        </button>
                        <button class="btn-remove btn-sm" data-friend-id="${friend.id}">
                            ✕
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Agregar eventos a botones
            document.querySelectorAll('.btn-invite').forEach(btn => {
                btn.addEventListener('click', function() {
                    const friendId = this.dataset.friendId;
                    const friendName = this.dataset.friendName;
                    inviteFriend(friendId, friendName);
                });
            });
            
            document.querySelectorAll('.btn-remove').forEach(btn => {
                btn.addEventListener('click', function() {
                    const friendId = this.dataset.friendId;
                    if (confirm('¿Eliminar este amigo?')) {
                        removeFriend(friendId);
                    }
                });
            });
            
        } catch (error) {
            console.error('Error al cargar amigos:', error);
            document.getElementById('friendsList').innerHTML = '<p class="error-message">Error al cargar amigos</p>';
        }
    }

    // Función para cargar solicitudes de amistad
    async function loadRequests() {
        try {
            const response = await fetch('../../friends/get-requests.php');
            const data = await response.json();
            
            const requestsList = document.getElementById('requestsList');
            const badge = document.getElementById('requestsBadge');
            const badgeBtn = document.getElementById('friendsBadgeBtn');
            
            if (!data.requests || data.requests.length === 0) {
                requestsList.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">📭</span>
                        <p>No tienes solicitudes pendientes</p>
                    </div>
                `;
                badge.style.display = 'none';
                if (badgeBtn) badgeBtn.style.display = 'none';
                return;
            }
            
            badge.textContent = data.requests.length;
            badge.style.display = 'inline';
            if (badgeBtn) {
                badgeBtn.textContent = data.requests.length;
                badgeBtn.style.display = 'inline';
            }
            
            requestsList.innerHTML = data.requests.map(request => `
                <div class="request-item">
                    <div class="friend-avatar">${request.name.charAt(0).toUpperCase()}</div>
                    <div class="friend-info">
                        <div class="friend-name">${escapeHtml(request.name)}</div>
                        <div class="friend-email">${escapeHtml(request.email)}</div>
                    </div>
                    <div class="request-actions">
                        <button class="btn-accept btn-sm" data-request-id="${request.id}">
                            ✓ Aceptar
                        </button>
                        <button class="btn-reject btn-sm" data-request-id="${request.id}">
                            ✕ Rechazar
                        </button>
                    </div>
                </div>
            `).join('');
            
            // Agregar eventos a botones
            document.querySelectorAll('.btn-accept').forEach(btn => {
                btn.addEventListener('click', function() {
                    respondRequest(this.dataset.requestId, 'accept');
                });
            });
            
            document.querySelectorAll('.btn-reject').forEach(btn => {
                btn.addEventListener('click', function() {
                    respondRequest(this.dataset.requestId, 'reject');
                });
            });
            
        } catch (error) {
            console.error('Error al cargar solicitudes:', error);
            document.getElementById('requestsList').innerHTML = '<p class="error-message">Error al cargar solicitudes</p>';
        }
    }

    // Función para buscar usuarios
    async function searchUsers(query) {
        try {
            const url = `../../friends/search-users.php?search=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const searchResults = document.getElementById('searchResults');
            
            // Verificar si hay error en la respuesta
            if (data.error) {
                searchResults.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">⚠️</span>
                        <p>${data.error}</p>
                    </div>
                `;
                return;
            }
            
            if (!data.users || data.users.length === 0) {
                searchResults.innerHTML = `
                    <div class="empty-state">
                        <span class="empty-icon">🔍</span>
                        <p>No se encontraron usuarios</p>
                    </div>
                `;
                return;
            }
            
            searchResults.innerHTML = data.users.map(user => {
                let actionButton = '';
                if (user.request_status === 'pending') {
                    actionButton = '<span class="status-text">Solicitud pendiente</span>';
                } else if (user.request_status === 'aceptada') {
                    actionButton = '<span class="status-text">Ya son amigos</span>';
                } else {
                    actionButton = `<button class="btn-add btn-sm" data-user-id="${user.id}">+ Agregar</button>`;
                }
                
                return `
                    <div class="user-item">
                        <div class="friend-avatar">${user.name.charAt(0).toUpperCase()}</div>
                        <div class="friend-info">
                            <div class="friend-name">${escapeHtml(user.name)}</div>
                            <div class="friend-email">${escapeHtml(user.email)}</div>
                        </div>
                        <div class="user-actions">
                            ${actionButton}
                        </div>
                    </div>
                `;
            }).join('');
            
            // Agregar eventos a botones
            document.querySelectorAll('.btn-add').forEach(btn => {
                btn.addEventListener('click', function() {
                    sendFriendRequest(this.dataset.userId);
                });
            });
            
        } catch (error) {
            console.error('Error al buscar usuarios:', error);
            const searchResults = document.getElementById('searchResults');
            searchResults.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">❌</span>
                    <p>Error al buscar usuarios: ${error.message}</p>
                </div>
            `;
        }
    }

    // Enviar solicitud de amistad
    async function sendFriendRequest(userId) {
        try {
            const response = await fetch('../../friends/send-request.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ receiver_id: userId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Solicitud enviada correctamente', 'success');
                searchUsers(searchInput.value); // Refrescar búsqueda
            } else {
                showNotification(data.error || 'Error al enviar solicitud', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al enviar solicitud', 'error');
        }
    }

    // Responder solicitud de amistad
    async function respondRequest(requestId, action) {
        try {
            const response = await fetch('../../friends/respond-request.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ request_id: requestId, action: action })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                loadRequests();
                if (action === 'accept') {
                    loadFriends();
                }
            } else {
                showNotification(data.error || 'Error al procesar solicitud', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al procesar solicitud', 'error');
        }
    }

    // Eliminar amigo
    async function removeFriend(friendId) {
        try {
            const response = await fetch('../../friends/remove-friend.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ friend_id: friendId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification('Amigo eliminado', 'success');
                loadFriends();
            } else {
                showNotification(data.error || 'Error al eliminar amigo', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error al eliminar amigo', 'error');
        }
    }

    // Invitar amigo a jugar
    function inviteFriend(friendId, friendName) {
        // Aquí puedes implementar la lógica para crear una sala e invitar
        showNotification(`Invitación enviada a ${friendName}`, 'success');
        // Crear sala automáticamente
        const roomCode = generateRoomCode();
        alert(`Sala creada con código: ${roomCode}\nInvitación enviada a ${friendName}`);
        // Aquí podrías redirigir a la sala o abrir el modal de sala
    }

    // Generar código de sala aleatorio
    function generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }

    // Las funciones escapeHtml() y showNotification() están en utils.js

    // Cargar solicitudes al inicio si está autenticado
    checkAuth().then(authenticated => {
        if (authenticated) {
            if (friendsBtn) friendsBtn.style.display = 'flex';
            loadRequests();
            
            // Recargar solicitudes cada 10 segundos cuando modal esté abierta
            setInterval(() => {
                const modal = document.getElementById('friendsModal');
                if (modal && modal.style.display === 'flex') {
                    loadRequests();
                }
            }, 10000);
        }
    });
});
