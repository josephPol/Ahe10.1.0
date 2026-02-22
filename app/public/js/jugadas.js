// Variables globales
let board = null;
let game = null;
let isAdminUser = false;
let currentEditId = null;
let currentDeleteId = null;

const CHESSBOARD_PIECE_THEME = 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png';

function getApiUrl(path) {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const currentPath = window.location.pathname;

    if (currentPath.includes('/html/')) {
        return `../api${normalizedPath}`;
    }

    return `/api${normalizedPath}`;
}

// Cargar jugadas al cargar la página
document.addEventListener('DOMContentLoaded', async function() {
    await checkAdminStatus();
    loadJugadas();
    initModal();
    initAdminModals();
});

function getSessionUrl() {
    return new URL('../auth/session.php', window.location.href).toString();
}

function getAdminJugadasUrl() {
    return new URL('../admin/jugadas.php', window.location.href).toString();
}

async function checkAdminStatus() {
    try {
        const response = await fetch(getSessionUrl(), { credentials: 'include' });
        const data = await response.json();
        isAdminUser = !!data.user?.is_admin;
    } catch (error) {
        isAdminUser = false;
    }
}

// Inicializar modal y eventos
function initModal() {
    const modal = document.getElementById('modal-crear');
    const btnCrear = document.getElementById('btn-crear-jugada');
    const btnCancelar = document.getElementById('btn-cancelar');
    const btnClose = document.querySelector('.modal-close');
    const form = document.getElementById('form-jugada');

    // Abrir modal
    btnCrear.addEventListener('click', function() {
        modal.style.display = 'block';
        initChessboard();
    });

    // Cerrar modal
    function closeModal() {
        modal.style.display = 'none';
        if (board) {
            board.destroy();
            board = null;
        }
        game = null;
        form.reset();
    }

    btnCancelar.addEventListener('click', closeModal);
    btnClose.addEventListener('click', closeModal);

    // Cerrar al hacer clic fuera del modal
    window.addEventListener('click', function(event) {
        if (event.target === modal) {
            closeModal();
        }
    });

    // Enviar formulario
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        submitJugada();
    });
}

function initAdminModals() {
    const editModal = document.getElementById('modal-editar');
    const deleteModal = document.getElementById('modal-eliminar');
    const editClose = editModal?.querySelector('[data-close="edit"]');
    const deleteClose = deleteModal?.querySelector('[data-close="delete"]');
    const editCancel = document.getElementById('btn-cancelar-editar');
    const deleteCancel = document.getElementById('btn-cancelar-eliminar');
    const deleteConfirm = document.getElementById('btn-confirmar-eliminar');
    const editForm = document.getElementById('form-editar-jugada');

    const closeEdit = () => {
        if (editModal) editModal.style.display = 'none';
        currentEditId = null;
    };
    const closeDelete = () => {
        if (deleteModal) deleteModal.style.display = 'none';
        currentDeleteId = null;
    };

    editClose?.addEventListener('click', closeEdit);
    deleteClose?.addEventListener('click', closeDelete);
    editCancel?.addEventListener('click', closeEdit);
    deleteCancel?.addEventListener('click', closeDelete);
    deleteConfirm?.addEventListener('click', async () => {
        if (!currentDeleteId) return;
        await deleteJugada(currentDeleteId);
        closeDelete();
    });

    editForm?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await submitEditJugada();
        closeEdit();
    });

    window.addEventListener('click', function(event) {
        if (event.target === editModal) closeEdit();
        if (event.target === deleteModal) closeDelete();
    });
}

// Inicializar tablero de ajedrez
function initChessboard() {
    game = new Chess();
    
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd,
        pieceTheme: CHESSBOARD_PIECE_THEME
    };

    board = Chessboard('board', config);
}

// Validar movimiento
function onDragStart(source, piece, position, orientation) {
    // Solo permitir movimientos válidos
    if (game.game_over()) return false;
    
    // Solo mover piezas del turno actual
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

// Manejar soltar pieza
function onDrop(source, target) {
    // Ver si el movimiento es legal
    const move = game.move({
        from: source,
        to: target,
        promotion: 'q' // Siempre promocionar a reina
    });

    // Movimiento ilegal
    if (move === null) return 'snapback';
}

// Actualizar posición después del movimiento
function onSnapEnd() {
    board.position(game.fen());
}

// Capturar imagen del tablero
async function captureBoard() {
    const boardElement = document.getElementById('board');
    
    try {
        const canvas = await html2canvas(boardElement, {
            backgroundColor: null,
            scale: 2
        });
        
        return canvas.toDataURL('image/png');
    } catch (error) {
        console.error('Error al capturar tablero:', error);
        return null;
    }
}

// Enviar jugada
async function submitJugada() {
    const nombre = document.getElementById('nombre-jugada').value.trim();
    const descripcion = document.getElementById('descripcion-jugada').value.trim();
    
    if (!nombre || !descripcion) {
        alert('Por favor completa todos los campos');
        return;
    }

    // Capturar imagen del tablero
    const imagenBase64 = await captureBoard();
    
    if (!imagenBase64) {
        alert('Error al capturar la imagen del tablero');
        return;
    }

    // Obtener movimientos realizados
    const movimientos = game.history({ verbose: true });

    // Preparar datos
    const data = {
        nombre: nombre,
        descripcion: descripcion,
        movimientos: JSON.stringify(movimientos),
        imagen: imagenBase64
    };

    try {
        const response = await fetch(getApiUrl('/jugadas'), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const contentType = response.headers.get('content-type') || '';
        const result = contentType.includes('application/json')
            ? await response.json()
            : { success: false, error: `Error HTTP ${response.status}` };

        if (result.success) {
            alert('¡Jugada publicada exitosamente!');
            document.getElementById('modal-crear').style.display = 'none';
            document.getElementById('form-jugada').reset();
            if (board) {
                board.destroy();
                board = null;
            }
            game = null;
            loadJugadas(); // Recargar la lista
        } else {
            alert('Error al publicar la jugada: ' + (result.error || `HTTP ${response.status}`));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor: ' + error.message);
    }
}

// Cargar jugadas desde la API
async function loadJugadas() {
    const container = document.getElementById('jugadas-list');
    container.innerHTML = '<div class="loading">Cargando jugadas...</div>';

    try {
        const response = await fetch(getApiUrl('/jugadas'));
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            displayJugadas(result.data);
        } else {
            // Si no hay jugadas en la BD, mostrar ejemplos predefinidos
            displayJugadasEjemplo();
        }
    } catch (error) {
        console.error('Error al cargar jugadas:', error);
        // Si hay error de conexión, mostrar ejemplos
        displayJugadasEjemplo();
    }
}

// Jugadas de ejemplo predefinidas
function displayJugadasEjemplo() {
    const jugadasEjemplo = [
        {
            id: 'ejemplo-1',
            nombre: 'Mate del Pastor',
            descripcion: 'Una de las trampas más famosas del ajedrez. El objetivo es atacar el punto f7, el más débil del negro al inicio. Se desarrolla el alfil y la dama rápidamente para crear una amenaza letal. ¡Perfecto para principiantes!',
            user: { name: 'Sistema' },
            likes: 15
        },
        {
            id: 'ejemplo-2',
            nombre: 'Apertura Española (Ruy López)',
            descripcion: 'Una de las aperturas más antiguas y respetadas del ajedrez. Las blancas desarrollan sus piezas rápidamente, controlan el centro y presionan el caballo en c6. Es la favorita de muchos grandes maestros por su solidez estratégica.',
            user: { name: 'Sistema' },
            likes: 23
        },
        {
            id: 'ejemplo-3',
            nombre: 'Defensa Siciliana',
            descripcion: 'La defensa más popular contra 1.e4. Las negras buscan un juego asimétrico y dinámico, evitando las típicas estructuras simétricas. Es la elección favorita de jugadores agresivos que buscan ganar con negras.',
            user: { name: 'Sistema' },
            likes: 18
        },
        {
            id: 'ejemplo-4',
            nombre: 'Gambito de Dama',
            descripcion: 'Un clásico atemporal del ajedrez. Las blancas ofrecen un peón para obtener un rápido desarrollo y control del centro. Aunque el peón puede recuperarse, lo importante es la ventaja posicional que se obtiene. Inmortalizada en la serie "Gambito de Dama".',
            user: { name: 'Sistema' },
            likes: 31
        },
        {
            id: 'ejemplo-5',
            nombre: 'Defensa India de Rey',
            descripcion: 'Una defensa hipermoderna donde las negras permiten que las blancas ocupen el centro con peones, para luego atacarlo con piezas. El fianchetto del alfil en g7 es característico. Muy popular entre jugadores dinámicos y creativos.',
            user: { name: 'Sistema' },
            likes: 19
        },
        {
            id: 'ejemplo-6',
            nombre: 'Mate de la Escalera',
            descripcion: 'Un patrón de mate donde la torre y el rey trabajan juntos para acorralar al rey enemigo hacia el borde del tablero. Es una técnica fundamental que todo jugador debe dominar para convertir ventajas materiales en victoria.',
            user: { name: 'Sistema' },
            likes: 12
        },
        {
            id: 'ejemplo-7',
            nombre: 'Apertura Italiana',
            descripcion: 'Una apertura clásica y directa donde las blancas desarrollan rápidamente el alfil a c4, apuntando al débil punto f7. Perfecta para principiantes por sus planes claros: desarrollo rápido, enroque y ataque. Solida y efectiva en todos los niveles.',
            user: { name: 'Sistema' },
            likes: 27
        },
        {
            id: 'ejemplo-8',
            nombre: 'Defensa Francesa',
            descripcion: 'Una defensa sólida donde las negras construyen una cadena de peones que controla el centro. Es posicionalmente compleja y conduce a batallas estratégicas profundas. Ideal para jugadores pacientes que prefieren la estrategia sobre la táctica.',
            user: { name: 'Sistema' },
            likes: 14
        }
    ];

    displayJugadas(jugadasEjemplo);
}

// Mostrar jugadas
function displayJugadas(jugadas) {
    const container = document.getElementById('jugadas-list');
    const canManage = isAdminUser;
    const escapeAttr = (text) => String(text ?? '').replace(/"/g, '&quot;');
    
    const html = jugadas.map(jugada => `
        <div class="jugada-card">
            <div class="jugada-image">
                ${jugada.imagen ? 
                    `<img src="/storage/${jugada.imagen}" alt="${escapeHtml(jugada.nombre)}">` : 
                    '<div class="no-image">♟</div>'}
            </div>
            <div class="jugada-content">
                <h3 class="jugada-title">${escapeHtml(jugada.nombre)}</h3>
                <p class="jugada-description">${escapeHtml(jugada.descripcion)}</p>
                ${canManage && !(typeof jugada.id === 'string' && jugada.id.startsWith('ejemplo-')) ? `
                <div class="jugada-admin-actions">
                    <button class="btn btn-secondary" data-admin-action="edit" data-id="${jugada.id}" data-name="${escapeAttr(jugada.nombre)}" data-desc="${escapeAttr(jugada.descripcion)}" data-likes="${jugada.likes ?? 0}">Editar</button>
                    <button class="btn btn-primary" data-admin-action="delete" data-id="${jugada.id}">Eliminar</button>
                </div>
                ` : ''}
                <div class="jugada-footer">
                    <span class="jugada-author">Por: ${escapeHtml(jugada.user?.name || 'Anónimo')}</span>
                    <button class="btn-like" onclick="likeJugada('${jugada.id}')">
                        ❤️ <span id="likes-${jugada.id}">${jugada.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;

    if (canManage) {
        container.querySelectorAll('[data-admin-action]').forEach((btn) => {
            btn.addEventListener('click', handleAdminActionClick);
        });
    }
}

function handleAdminActionClick(event) {
    const btn = event.currentTarget;
    const action = btn.dataset.adminAction;
    const id = btn.dataset.id;

    if (action === 'edit') {
        openEditModal({
            id,
            nombre: btn.dataset.name || '',
            descripcion: btn.dataset.desc || '',
            likes: btn.dataset.likes || 0
        });
    }

    if (action === 'delete') {
        openDeleteModal(id);
    }
}

function openEditModal(jugada) {
    const editModal = document.getElementById('modal-editar');
    if (!editModal) return;
    currentEditId = jugada.id;
    document.getElementById('editar-nombre').value = jugada.nombre;
    document.getElementById('editar-descripcion').value = jugada.descripcion;
    document.getElementById('editar-likes').value = jugada.likes;
    editModal.style.display = 'block';
}

function openDeleteModal(id) {
    const deleteModal = document.getElementById('modal-eliminar');
    if (!deleteModal) return;
    currentDeleteId = id;
    deleteModal.style.display = 'block';
}

async function submitEditJugada() {
    if (!currentEditId) return;
    const nombre = document.getElementById('editar-nombre').value.trim();
    const descripcion = document.getElementById('editar-descripcion').value.trim();
    const likes = parseInt(document.getElementById('editar-likes').value || '0', 10);

    if (!nombre || !descripcion) {
        alert('Completa todos los campos');
        return;
    }

    try {
        const formData = new FormData();
        formData.append('action', 'update');
        formData.append('jugada_id', currentEditId);
        formData.append('nombre', nombre);
        formData.append('descripcion', descripcion);
        formData.append('likes', likes);

        const response = await fetch(getAdminJugadasUrl(), {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
            loadJugadas();
        } else {
            alert(result.message || 'No se pudo actualizar');
        }
    } catch (error) {
        alert('Error al actualizar la jugada');
    }
}

async function deleteJugada(id) {
    try {
        const formData = new FormData();
        formData.append('action', 'delete');
        formData.append('jugada_id', id);

        const response = await fetch(getAdminJugadasUrl(), {
            method: 'POST',
            body: formData,
            credentials: 'include'
        });
        const result = await response.json();
        if (result.success) {
            loadJugadas();
        } else {
            alert(result.message || 'No se pudo eliminar');
        }
    } catch (error) {
        alert('Error al eliminar la jugada');
    }
}

// Mostrar mensaje cuando no hay jugadas
function displayNoJugadas() {
    const container = document.getElementById('jugadas-list');
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-icon">♟</div>
            <h3>No hay jugadas publicadas aún</h3>
            <p>Sé el primero en compartir una estrategia</p>
        </div>
    `;
}

// Mostrar error
function displayError() {
    const container = document.getElementById('jugadas-list');
    container.innerHTML = `
        <div class="error-state">
            <p>⚠️ Error al cargar las jugadas</p>
            <button class="btn btn-secondary" onclick="loadJugadas()">Reintentar</button>
        </div>
    `;
}

// Dar like a una jugada
async function likeJugada(id) {
    const likesElement = document.getElementById(`likes-${id}`);
    
    // Si es una jugada de ejemplo (ID es string que empieza con 'ejemplo-')
    if (typeof id === 'string' && id.startsWith('ejemplo-')) {
        if (likesElement) {
            const currentLikes = parseInt(likesElement.textContent) || 0;
            likesElement.textContent = currentLikes + 1;
            // Animación
            likesElement.parentElement.classList.add('liked');
            setTimeout(() => {
                likesElement.parentElement.classList.remove('liked');
            }, 300);
        }
        return;
    }
    
    // Para jugadas reales de la BD
    try {
        const response = await fetch(getApiUrl(`/jugadas/${id}/like`), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            // Actualizar contador de likes
            if (likesElement) {
                likesElement.textContent = result.data.likes;
                // Animación
                likesElement.parentElement.classList.add('liked');
                setTimeout(() => {
                    likesElement.parentElement.classList.remove('liked');
                }, 300);
            }
        }
    } catch (error) {
        console.error('Error al dar like:', error);
    }
}

// Escapar HTML para prevenir XSS (definida en utils.js)
// function escapeHtml(text) { ... } ← ver utils.js
