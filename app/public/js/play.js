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

  // Modo de juego: 'pvp' o 'ai'
  let playMode = 'pvp'; // 'pvp' o 'ai'
  let aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
  let isAIThinking = false;

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

    // Mostrar modal de selección de modo de juego
    setupGameModeSelection();

    // Inicializar controles de modo
    setupModeControls();
    setupResignButtons();

    // NO crear tablero aún, esperar a que elija modo
  });

  // Configura los botones de rendición
  function setupResignButtons() {
    const resignWhiteBtn = document.getElementById('resignWhite');
    const resignBlackBtn = document.getElementById('resignBlack');

    resignWhiteBtn.addEventListener('click', () => {
      endGame('Blancas se rindieron', 'Negras ganan', 'b');
    });

    resignBlackBtn.addEventListener('click', () => {
      if (playMode === 'ai') {
        // En modo IA, no se puede hacer rendirse a la IA
        return;
      }
      endGame('Negras se rindieron', 'Blancas ganan', 'w');
    });

    // Si estamos en modo IA, deshabilitar botón de rendición de negras
    if (playMode === 'ai') {
      resignBlackBtn.disabled = true;
      resignBlackBtn.style.opacity = '0.5';
      resignBlackBtn.style.cursor = 'not-allowed';
    }
  }

  // Configura la selección de modo de juego
  function setupGameModeSelection() {
    const gameModeModal = document.getElementById('gameModeModal');
    const pvpBtn = document.getElementById('pvpBtn');
    const aiBtn = document.getElementById('aiBtn');

    pvpBtn.addEventListener('click', () => {
      playMode = 'pvp';
      gameModeModal.classList.add('hidden');
      // Timer para ambos jugadores
      timerBlackEl.parentElement.style.display = 'flex';
      updatePageTitle('Jugador vs Jugador');
      initializeBoard();
      refreshBoardUI(null);
    });

    aiBtn.addEventListener('click', () => {
      playMode = 'ai';
      gameModeModal.classList.add('hidden');
      // Mostrar modal de dificultad
      const difficultyModal = document.getElementById('aiDifficultyModal');
      difficultyModal.classList.remove('hidden');
      setupDifficultySelection();
    });
  }

  function setupDifficultySelection() {
    const difficultyModal = document.getElementById('aiDifficultyModal');
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');

    difficultyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        aiDifficulty = e.currentTarget.getAttribute('data-difficulty');
        difficultyModal.classList.add('hidden');
        // Ocultar temporizador de IA (solo usuario juega con tiempo)
        timerBlackEl.parentElement.style.display = 'none';
        
        const difficultyNames = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
        updatePageTitle(`Jugador vs IA (${difficultyNames[aiDifficulty]})`);
        
        initializeBoard();
        refreshBoardUI(null);
      });
    });
  }

  function updatePageTitle(subtitle) {
    const heroP = document.querySelector('.play-hero p');
    if (heroP) {
      heroP.textContent = subtitle;
    }
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

      // En modo PvP, contar tiempo para ambos
      // En modo IA, solo contar tiempo del jugador (blancas)
      if (playMode === 'pvp') {
        if (game.turn() === 'w') {
          timeWhite--;
          if (timeWhite < 0) timeWhite = 0;
        } else {
          timeBlack--;
          if (timeBlack < 0) timeBlack = 0;
        }
      } else if (playMode === 'ai' && game.turn() === 'w') {
        // Solo contar tiempo si es blancas (el jugador humano)
        timeWhite--;
        if (timeWhite < 0) timeWhite = 0;
      }

      updateTimerDisplay();

      // Si alguien se queda sin tiempo
      if (playMode === 'pvp') {
        if (timeWhite === 0) {
          endGame('Tiempo agotado', 'Negras ganan por tiempo', 'b');
        } else if (timeBlack === 0) {
          endGame('Tiempo agotado', 'Blancas ganan por tiempo', 'w');
        }
      } else if (playMode === 'ai' && timeWhite === 0) {
        endGame('Tiempo agotado', 'IA gana por tiempo', 'b');
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

    // En modo IA, solo el jugador (blancas) puede mover
    if (playMode === 'ai' && !piece.startsWith('w')) {
      return false;
    }

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
    
    if (checkGameEnd()) return;
    
    // Si es modo IA y es turno de negras, que juegue la IA
    if (playMode === 'ai' && game.turn() === 'b') {
      setTimeout(() => makeAIMove(), 500);
    }
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
      // En modo IA, solo blancas pueden ser seleccionadas inicialmente
      if (playMode === 'ai' && clickedPiece && clickedPiece.color !== 'w') {
        return;
      }
      
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
      
      if (checkGameEnd()) return;
      
      // Si es modo IA y es turno de negras, que juegue la IA
      if (playMode === 'ai' && game.turn() === 'b') {
        setTimeout(() => makeAIMove(), 500);
      }
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
     IA - LOGICA DE MOVIMIENTO
  ========================================= */

  function makeAIMove() {
    if (gameFinished || isAIThinking || game.turn() !== 'b') return;

    isAIThinking = true;

    let bestMove;
    if (aiDifficulty === 'easy') {
      bestMove = getRandomMove();
    } else if (aiDifficulty === 'medium') {
      bestMove = getMediumAIMove();
    } else {
      bestMove = getHardAIMove();
    }

    if (bestMove) {
      const move = game.move(bestMove);
      if (move) {
        addMoveToHistory(move);
        refreshBoardUI(move);
        updateTimerUI();
        
        if (checkGameEnd()) {
          isAIThinking = false;
          return;
        }
      }
    }

    isAIThinking = false;
    board.position(game.fen());
  }

  // IA FÁCIL: Movimiento completamente aleatorio
  function getRandomMove() {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  }

  // IA MEDIO: Evita pérdidas obvias y busca capturas
  function getMediumAIMove() {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Evaluar cada movimiento
    const scoredMoves = moves.map(move => {
      let score = 0;

      // +1 punto por capturar piezas
      if (move.captured) {
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
        score += pieceValues[move.captured] || 1;
      }

      // +0.5 puntos por controlar el centro
      const centerSquares = ['d4', 'd5', 'e4', 'e5'];
      if (centerSquares.includes(move.to)) {
        score += 0.5;
      }

      // -1 punto si el rey está en jaque (riesgo de pérdida)
      game.move(move);
      if (game.in_check()) {
        score -= 0.5;
      }
      game.undo();

      return { move, score };
    });

    // Ordenar por puntuación y añadir aleatoriedad
    scoredMoves.sort((a, b) => b.score - a.score);
    
    // Tomar de los top 3 movimientos aleatorio
    const topMoves = scoredMoves.slice(0, Math.max(1, Math.floor(moves.length / 3)));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  }

  // IA DIFÍCIL: Análisis profundo con minimax simplificado
  function getHardAIMove() {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    const bestMove = moves.reduce((best, move) => {
      let score = evaluateMoveHard(move);
      
      // Añadir pequeña aleatoriedad para que no siempre juegue igual
      score += Math.random() * 0.2;
      
      return score > best.score ? { move, score } : best;
    }, { move: null, score: -Infinity });

    return bestMove.move;
  }

  function evaluateMoveHard(move) {
    let score = 0;

    // Valor de capturas
    if (move.captured) {
      const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
      score += pieceValues[move.captured] * 10;
    }

    // Control del centro (muy importante)
    const centerSquares = ['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'd3', 'd6', 'e3', 'e6'];
    if (centerSquares.includes(move.to)) {
      score += 2;
    }

    // Proteger el rey
    game.move(move);
    if (game.in_check()) {
      score -= 50; // Evitar jaque al propio rey
    }

    // Atacar piezas desprotegidas
    const targetSquare = move.to;
    const allMoves = game.moves({ verbose: true });
    const isAttackedByOpponent = allMoves.some(m => m.to === targetSquare && m.captured);
    if (!isAttackedByOpponent && move.captured) {
      score += 1;
    }

    // Dar jaque al oponente es bueno
    if (game.in_check()) {
      score += 3;
    }

    // Evitar perder piezas
    game.undo();
    const ourAttackers = game.moves({ verbose: true }).filter(m => m.to === move.from && !m.captured).length;
    const opponentAttackers = getMoveCount(move.from);
    
    if (opponentAttackers > ourAttackers && move.piece !== 'p') {
      score -= 5;
    }

    return score;
  }

  function getMoveCount(square) {
    const originalGame = new Chess(game.fen());
    const moves = originalGame.moves({ verbose: true });
    return moves.filter(m => m.to === square && m.color === 'w').length;
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
