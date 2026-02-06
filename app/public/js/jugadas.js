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
                    <button class="btn-like" onclick="likeJugada('${jugada.id}')">
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
        const response = await fetch(`/api/jugadas/${id}/like`, {
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
