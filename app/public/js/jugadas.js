// Variables globales
let board = null;
let game = null;

// Cargar jugadas al cargar la página
document.addEventListener('DOMContentLoaded', function() {
    loadJugadas();
    initModal();
});

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

// Inicializar tablero de ajedrez
function initChessboard() {
    game = new Chess();
    
    const config = {
        draggable: true,
        position: 'start',
        onDragStart: onDragStart,
        onDrop: onDrop,
        onSnapEnd: onSnapEnd
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
        const response = await fetch('/api/jugadas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

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
            alert('Error al publicar la jugada: ' + (result.error || 'Error desconocido'));
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error al conectar con el servidor');
    }
}

// Cargar jugadas desde la API
async function loadJugadas() {
    const container = document.getElementById('jugadas-list');
    container.innerHTML = '<div class="loading">Cargando jugadas...</div>';

    try {
        const response = await fetch('/api/jugadas');
        const result = await response.json();

        if (result.success && result.data.length > 0) {
            displayJugadas(result.data);
        } else {
            displayNoJugadas();
        }
    } catch (error) {
        console.error('Error al cargar jugadas:', error);
        displayError();
    }
}

// Mostrar jugadas
function displayJugadas(jugadas) {
    const container = document.getElementById('jugadas-list');
    
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
                <div class="jugada-footer">
                    <span class="jugada-author">Por: ${escapeHtml(jugada.user?.name || 'Anónimo')}</span>
                    <button class="btn-like" onclick="likeJugada(${jugada.id})">
                        ❤️ <span id="likes-${jugada.id}">${jugada.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    `).join('');

    container.innerHTML = html;
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
    try {
        const response = await fetch(`/api/jugadas/${id}/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        const result = await response.json();

        if (result.success) {
            // Actualizar contador de likes
            const likesElement = document.getElementById(`likes-${id}`);
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

// Escapar HTML para prevenir XSS
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
