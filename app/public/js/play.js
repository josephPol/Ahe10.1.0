(() => {
  'use strict';

  let game;
  let board;

  const moveListEl = document.getElementById('moveList');

  // Para “click to move”
  let selectedFrom = null; // ej: "c1"
  let dragStartTime = null;
  let dragStartSquare = null;

  // Modo de jugabilidad
  let gameMode = 'drag'; // 'drag' o 'click'

  // Temporizadores
  let timerWhiteEl = document.getElementById('timerWhite');
  let timerBlackEl = document.getElementById('timerBlack');
  let timeWhite = 10 * 60; // 10 minutos en segundos
  let timeBlack = 10 * 60; // 10 minutos en segundos
  let timerInterval = null;
  let isTimerRunning = false;
  let gameStarted = false; // Se activa cuando blancas hacen su primer movimiento
  let gameFinished = false; // Se activa cuando la partida termina

  // Mapa para iconos en historial
  const pieceIcon = {
    p: '♙',
    n: '♘',
    b: '♗',
    r: '♖',
    q: '♕',
    k: '♔'
  };

  document.addEventListener('DOMContentLoaded', () => {
    game = new Chess();

    // Inicializar controles de modo
    setupModeControls();
    setupResignButtons();

    // Crear tablero (inicialmente en modo drag)
    initializeBoard();

    refreshBoardUI(null);
  });

  // Configura los botones de rendición
  function setupResignButtons() {
    const resignWhiteBtn = document.getElementById('resignWhite');
    const resignBlackBtn = document.getElementById('resignBlack');

    resignWhiteBtn.addEventListener('click', () => {
      endGame('Blancas se rindieron', 'Negras ganan', 'b');
    });

    resignBlackBtn.addEventListener('click', () => {
      endGame('Negras se rindieron', 'Blancas ganan', 'w');
    });
  }

  // Configura los botones de cambio de modo
  function setupModeControls() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const newMode = e.currentTarget.getAttribute('data-mode');
        setGameMode(newMode);
      });
    });
  }

  // Cambia el modo de juego
  function setGameMode(mode) {
    gameMode = mode;

    // Actualizar UI de botones
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('mode-btn--active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('mode-btn--active');

    // Recrear el tablero con la nueva configuración
    clearSelection();
    initializeBoard();
  }

  // Inicializa el tablero con la configuración actual
  function initializeBoard() {
    const config = {
      draggable: gameMode === 'drag', // true para drag, false para click
      position: game.fen(), // Mantener posición actual
      onDragStart,
      onDrop,
      onSnapEnd,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('chessBoard', config);

    // Agregar listeners de click si estamos en modo click
    if (gameMode === 'click') {
      const chessBoardEl = document.getElementById('chessBoard');
      if (chessBoardEl) {
        chessBoardEl.removeEventListener('click', handleBoardClick);
        chessBoardEl.addEventListener('click', handleBoardClick);
      }
    }

    // Inicializar temporizadores
    updateTimerDisplay();
    updateTimerUI();
    // NO iniciar temporizador aquí, esperar al primer movimiento de blancas
  }

  // ========== TEMPORIZADORES ==========

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    timerWhiteEl.textContent = formatTime(timeWhite);
    timerBlackEl.textContent = formatTime(timeBlack);
  }

  function startTimer() {
    if (isTimerRunning) return;

    isTimerRunning = true;
    clearInterval(timerInterval);

    timerInterval = setInterval(() => {
      if (game.game_over()) {
        clearInterval(timerInterval);
        isTimerRunning = false;
        return;
      }

      // Disminuir el tiempo del jugador actual
      if (game.turn() === 'w') {
        timeWhite--;
        if (timeWhite < 0) timeWhite = 0;
      } else {
        timeBlack--;
        if (timeBlack < 0) timeBlack = 0;
      }

      updateTimerDisplay();

      // Si alguien se queda sin tiempo
      if (timeWhite === 0) {
        endGame('Tiempo agotado', 'Negras ganan por tiempo', 'b');
      } else if (timeBlack === 0) {
        endGame('Tiempo agotado', 'Blancas ganan por tiempo', 'w');
      }
    }, 1000);

    updateTimerUI();
  }

  function updateTimerUI() {
    // Marcar el temporizador activo
    const timerWhiteContainer = document.querySelector('.timer-white');
    const timerBlackContainer = document.querySelector('.timer-black');

    timerWhiteContainer.classList.remove('active');
    timerBlackContainer.classList.remove('active');

    if (game.turn() === 'w') {
      timerWhiteContainer.classList.add('active');
    } else {
      timerBlackContainer.classList.add('active');
    }
  }

  function startGameTimer() {
    if (gameStarted) return;
    gameStarted = true;
    startTimer();
  }

  // Configura los listeners de click en cada casilla del tablero
  function setupClickHandlers() {
    // Esta función ya no es necesaria con draggable: true
  }

  // Manejador de click global en el tablero (solo en modo click)
  function handleBoardClick(e) {
    if (gameMode !== 'click') return;

    const squareEl = e.target.closest('[data-square]');
    if (!squareEl) return;

    const square = squareEl.getAttribute('data-square');
    if (square) {
      onBoardClick(square);
    }
  }

  // Detecta el inicio del mouse down
  function handleSquareMouseDown(e) {
    // Ya no usada
  }

  // Si soltas = click-to-move o arrastre
  function handleSquareMouseUp(e) {
    // Ya no usada
  }

  // Si dejas el mouse fuera = reset de drag
  function handleSquareMouseLeave(e) {
    // No reseteamos aquí, permitimos que el drag continúe
  }



  function onDragStart(source, piece) {
    if (game.game_over()) return false;

    // turnos
    if ((game.turn() === 'w' && piece.startsWith('b')) ||
        (game.turn() === 'b' && piece.startsWith('w'))) {
      return false;
    }

    // Iniciar temporizador cuando blancas comienzan a arrastrar la primera pieza
    if (!gameStarted && game.turn() === 'w') {
      startGameTimer();
    }

    // Si empiezas a arrastrar, quitamos selección click-to-move
    clearSelection();
  }

  function onDrop(source, target) {
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    if (move === null) return 'snapback';

    addMoveToHistory(move);
    refreshBoardUI(move);
    clearSelection();
    updateTimerUI(); // Actualizar temporizador después del movimiento
    checkGameEnd(); // Verificar si la partida ha terminado
  }

  function onSnapEnd() {
    board.position(game.fen());
  }

  /* =========================================
     CLICK TO MOVE
     - Click 1: selecciona pieza (si es tu turno)
     - Click 2: intenta mover a casilla/captura
     - Si clickas una pieza de tu color -> cambia selección
  ========================================= */

  function onBoardClick(square) {
    const clickedPiece = game.get(square); // {type:'p', color:'w'} o null

    // Si la partida terminó, no hacemos nada
    if (game.game_over()) return;

    // Si NO hay pieza seleccionada aún
    if (!selectedFrom) {
      // Solo selecciona si hay pieza y es del turno actual
      if (clickedPiece && clickedPiece.color === game.turn()) {
        setSelection(square);
        refreshBoardUI(null);
        highlightSelection();
      }
      return;
    }

    // Si YA hay selección
    const from = selectedFrom;

    // Si haces click sobre una pieza de TU color -> cambia la selección
    if (clickedPiece && clickedPiece.color === game.turn()) {
      setSelection(square);
      refreshBoardUI(null);
      highlightSelection();
      return;
    }

    // Intentar mover/capturar al destino (vacío o enemigo)
    const move = tryMove(from, square);
    if (move) {
      addMoveToHistory(move);
      refreshBoardUI(move);
      clearSelection();
      setupClickHandlers(); // Reconfigura listeners después del movimiento
      updateTimerUI(); // Actualizar temporizador después del movimiento
      checkGameEnd(); // Verificar si la partida ha terminado
      return;
    }

    // Si el movimiento es ilegal, mantengo selección y resalto
    highlightSelection();
  }

  function tryMove(from, to) {
    if (from === to) return null;

    // chess.js valida legalidad completa (incluye jaque)
    const move = game.move({
      from,
      to,
      promotion: 'q'
    });

    if (move === null) {
      // revertir cualquier intento (chess.js ya no cambia si es null)
      // asegurar que el tablero se mantenga igual
      board.position(game.fen());
      return null;
    }

    // Si se ha movido, actualizamos el tablero visual
    board.position(game.fen());
    return move;
  }

  function setSelection(square) {
    selectedFrom = square;

    // Iniciar temporizador cuando blancas tocan la primera pieza
    if (!gameStarted && game.turn() === 'w') {
      startGameTimer();
    }
  }

  function clearSelection() {
    selectedFrom = null;
    clearSelectionHighlight();
  }

  /* =========================================
     HISTORIAL
  ========================================= */

  function addMoveToHistory(move) {
    const icon = pieceIcon[move.piece] || '';
    const isWhiteMove = move.color === 'w';
    const fullMoveNumber = Math.ceil(game.history().length / 2);

    const text = `${icon} ${move.from}→${move.to}  (${move.san})`;

    if (isWhiteMove) {
      const li = document.createElement('li');
      li.textContent = `${fullMoveNumber}. ${text}`;
      moveListEl.appendChild(li);
    } else {
      const last = moveListEl.lastElementChild;
      if (last) {
        last.textContent = `${last.textContent}   |   ${text}`;
      } else {
        const li = document.createElement('li');
        li.textContent = `${fullMoveNumber}. ${text}`;
        moveListEl.appendChild(li);
      }
    }

    moveListEl.scrollTop = moveListEl.scrollHeight;
  }

  /* =========================================
     UI: highlights (último movimiento + jaque + selección)
  ========================================= */

  function refreshBoardUI(lastMove) {
    clearBoardHighlights();

    if (lastMove) {
      highlightSquare(lastMove.from, 'highlight-from');
      highlightSquare(lastMove.to, 'highlight-to');
    }

    // Marcar el rey en jaque
    if (game.in_check()) {
      const kingSquare = findKingSquare(game.turn());
      if (kingSquare) highlightSquare(kingSquare, 'in-check');
    }

    // Si hay selección, remarcarla
    highlightSelection();
  }

  function highlightSelection() {
    clearSelectionHighlight();
    if (selectedFrom) {
      highlightSquare(selectedFrom, 'highlight-from');
      // Nota: reutilizo highlight-from para selección (queda integrado con tu paleta)
      // Si quieres un estilo distinto, creo una clase "selected-square".
    }
  }

  function clearSelectionHighlight() {
    const $board = document.getElementById('chessBoard');
    if (!$board) return;
    $board.querySelectorAll('.selected-square').forEach(el => el.classList.remove('selected-square'));
  }

  function clearBoardHighlights() {
    const $board = document.getElementById('chessBoard');
    if (!$board) return;

    $board.querySelectorAll('.highlight-from, .highlight-to, .in-check, .selected-square')
      .forEach(el => {
        el.classList.remove('highlight-from', 'highlight-to', 'in-check', 'selected-square');
      });
  }

  function highlightSquare(square, className) {
    const el = document.querySelector(`#chessBoard [data-square="${square}"]`);
    if (el) el.classList.add(className);
  }

  function findKingSquare(colorToMove) {
    const b = game.board();
    for (let r = 0; r < 8; r++) {
      for (let c = 0; c < 8; c++) {
        const cell = b[r][c];
        if (cell && cell.type === 'k' && cell.color === colorToMove) {
          const file = String.fromCharCode(97 + c);
          const rank = String(8 - r);
          return file + rank;
        }
      }
    }
    return null;
  }

  /* =========================================
     FIN DE PARTIDA
  ========================================= */

  function endGame(reason, result, winner) {
    if (gameFinished) return;

    gameFinished = true;
    clearInterval(timerInterval);
    isTimerRunning = false;

    // Mostrar modal de resultado
    const modal = document.getElementById('resultModal');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');
    const restartBtn = document.getElementById('restartBtn');

    title.textContent = result;
    message.textContent = reason;

    modal.classList.remove('hidden');

    // Botón para nueva partida
    restartBtn.onclick = () => {
      location.reload();
    };
  }

  function checkGameEnd() {
    // Jaque mate
    if (game.in_checkmate()) {
      // El jugador cuyo turno es ahora está en jaque mate (perdedor)
      const loser = game.turn() === 'w' ? 'w' : 'b';
      const winner = game.turn() === 'w' ? 'Negras' : 'Blancas';
      endGame('¡Jaque mate!', `${winner} ganan por jaque mate`, loser);
      return true;
    }

    // Ahogado (empate)
    if (game.in_stalemate()) {
      endGame('¡Ahogado!', 'Partida empatada', null);
      return true;
    }

    return false;
  }

})();
