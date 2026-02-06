(() => {
  'use strict';

  let game;
  let board;
  const moveListEl = document.getElementById('moveList');

  // Variables de juego
  let selectedFrom = null;
  let gameMode = 'drag';
  let playerColor = 'w';
  let aiDifficulty = 'medium';
  let isAIThinking = false;
  let gameStarted = false;
  let gameFinished = false;

  // Temporizadores
  let timerPlayerEl = document.getElementById('timerPlayer');
  let timePlayer = 10 * 60;
  let timerInterval = null;
  let isTimerRunning = false;

  // Iconos de piezas
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
    setupEventListeners();
    setupModalSelection();
  });

  function setupEventListeners() {
    document.getElementById('mode-drag')?.addEventListener('click', () => setGameMode('drag'));
    document.getElementById('mode-click')?.addEventListener('click', () => setGameMode('click'));
    document.getElementById('resignBtn')?.addEventListener('click', resignGame);
    document.getElementById('restartBtn')?.addEventListener('click', () => location.reload());
  }

  function setupModalSelection() {
    const difficultyBtns = document.querySelectorAll('.difficulty-btn');
    const colorBtns = document.querySelectorAll('.color-btn');
    const startBtn = document.getElementById('startGameBtn');

    difficultyBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        aiDifficulty = e.target.getAttribute('data-difficulty');
        updateStartButton();
      });
    });

    colorBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        colorBtns.forEach(b => b.classList.remove('selected'));
        e.target.classList.add('selected');
        playerColor = e.target.getAttribute('data-color');
        updateStartButton();
        updateUIForColor();
      });
    });

    startBtn?.addEventListener('click', startGame);
  }

  function updateStartButton() {
    const startBtn = document.getElementById('startGameBtn');
    const difficulty = document.querySelector('.difficulty-btn.selected');
    const color = document.querySelector('.color-btn.selected');
    startBtn.disabled = !(difficulty && color);
  }

  function updateUIForColor() {
    const playerLabel = document.getElementById('playerLabel');
    const subtitle = document.getElementById('gameSubtitle');
    const difficultyName = getDifficultyName(aiDifficulty);

    if (playerColor === 'w') {
      playerLabel.textContent = '⚪ TÚ';
      subtitle.textContent = `Jugando como Blancas vs IA (${difficultyName})`;
      document.getElementById('chessBoard').style.transform = '';
    } else {
      playerLabel.textContent = '⚫ TÚ';
      subtitle.textContent = `Jugando como Negras vs IA (${difficultyName})`;
    }
  }

  function getDifficultyName(difficulty) {
    const names = { easy: 'Fácil', medium: 'Medio', hard: 'Difícil' };
    return names[difficulty] || 'Medio';
  }

  function startGame() {
    document.getElementById('setupModal').classList.add('hidden');
    updateUIForColor();
    initializeBoard();
    refreshBoardUI(null);
    setupModeControls();

    // Si la IA juega primero (jugador es Negras), que juegue
    if (playerColor === 'b') {
      setTimeout(() => makeAIMove(), 1000);
    }
  }

  function setGameMode(mode) {
    gameMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.classList.remove('mode-btn--active');
    });
    document.querySelector(`[data-mode="${mode}"]`).classList.add('mode-btn--active');

    clearSelection();
    initializeBoard();
  }

  function setupModeControls() {
    document.querySelectorAll('.mode-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        setGameMode(e.target.getAttribute('data-mode'));
      });
    });
  }

  function initializeBoard() {
    const config = {
      draggable: gameMode === 'drag',
      position: game.fen(),
      orientation: playerColor === 'b' ? 'black' : 'white',
      onDragStart,
      onDrop,
      onSnapEnd,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('chessBoard', config);
    updateTimerDisplay();

    if (gameMode === 'click') {
      const chessBoardEl = document.getElementById('chessBoard');
      if (chessBoardEl) {
        chessBoardEl.removeEventListener('click', handleBoardClick);
        chessBoardEl.addEventListener('click', handleBoardClick);
      }
    }
  }

  // ========== TIMERS ==========

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  function updateTimerDisplay() {
    timerPlayerEl.textContent = formatTime(timePlayer);
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

      // Solo contar tiempo si es turno del jugador
      if (game.turn() === playerColor) {
        timePlayer--;
        if (timePlayer < 0) timePlayer = 0;
        updateTimerDisplay();

        if (timePlayer === 0) {
          endGame('Tiempo agotado', 'IA gana por tiempo', playerColor === 'w' ? 'b' : 'w');
        }
      }
    }, 1000);
  }

  // ========== MOVIMIENTOS ==========

  function onDragStart(source, piece) {
    if (game.game_over() || isAIThinking) return false;

    // Solo el jugador puede mover sus piezas
    if (!piece.startsWith(playerColor)) {
      return false;
    }

    // Verificar turno
    if (game.turn() !== playerColor) {
      return false;
    }

    if (!gameStarted && game.turn() === playerColor) {
      gameStarted = true;
      startTimer();
    }

    clearSelection();
  }

  function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });

    if (move === null) return 'snapback';

    addMoveToHistory(move);
    refreshBoardUI(move);
    clearSelection();

    if (checkGameEnd()) return;

    // Turno de la IA
    if (game.turn() !== playerColor) {
      setTimeout(() => makeAIMove(), 500);
    }
  }

  function onSnapEnd() {
    board.position(game.fen());
  }

  function handleBoardClick(e) {
    if (gameMode !== 'click' || isAIThinking) return;

    const squareEl = e.target.closest('[data-square]');
    if (!squareEl) return;

    const square = squareEl.getAttribute('data-square');
    if (square) onBoardClickMove(square);
  }

  function onBoardClickMove(square) {
    const clickedPiece = game.get(square);

    if (game.game_over()) return;

    if (!selectedFrom) {
      if (clickedPiece && clickedPiece.color === playerColor && game.turn() === playerColor) {
        setSelection(square);
        refreshBoardUI(null);
        highlightSelection();
      }
      return;
    }

    const from = selectedFrom;

    if (clickedPiece && clickedPiece.color === playerColor) {
      setSelection(square);
      refreshBoardUI(null);
      highlightSelection();
      return;
    }

    const move = tryMove(from, square);
    if (move) {
      addMoveToHistory(move);
      refreshBoardUI(move);
      clearSelection();

      if (checkGameEnd()) return;

      if (game.turn() !== playerColor) {
        setTimeout(() => makeAIMove(), 500);
      }
      return;
    }

    highlightSelection();
  }

  function tryMove(from, to) {
    if (from === to) return null;

    const move = game.move({ from, to, promotion: 'q' });

    if (move === null) {
      board.position(game.fen());
      return null;
    }

    board.position(game.fen());
    return move;
  }

  function setSelection(square) {
    selectedFrom = square;

    if (!gameStarted && game.turn() === playerColor) {
      gameStarted = true;
      startTimer();
    }
  }

  function clearSelection() {
    selectedFrom = null;
    clearSelectionHighlight();
  }

  // ========== IA ==========

  function makeAIMove() {
    if (gameFinished || isAIThinking || game.turn() === playerColor) return;

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

        if (checkGameEnd()) {
          isAIThinking = false;
          return;
        }
      }
    }

    isAIThinking = false;
    board.position(game.fen());
  }

  function getRandomMove() {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;
    return moves[Math.floor(Math.random() * moves.length)];
  }

  function getMediumAIMove() {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    const scoredMoves = moves.map(move => {
      let score = 0;

      if (move.captured) {
        const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
        score += pieceValues[move.captured] || 1;
      }

      const centerSquares = ['d4', 'd5', 'e4', 'e5'];
      if (centerSquares.includes(move.to)) {
        score += 0.5;
      }

      game.move(move);
      if (game.in_check()) {
        score -= 0.5;
      }
      game.undo();

      return { move, score };
    });

    scoredMoves.sort((a, b) => b.score - a.score);
    const topMoves = scoredMoves.slice(0, Math.max(1, Math.floor(moves.length / 3)));
    return topMoves[Math.floor(Math.random() * topMoves.length)].move;
  }

  function getHardAIMove() {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    const bestMove = moves.reduce((best, move) => {
      let score = evaluateMoveHard(move);
      score += Math.random() * 0.2;
      return score > best.score ? { move, score } : best;
    }, { move: null, score: -Infinity });

    return bestMove.move;
  }

  function evaluateMoveHard(move) {
    let score = 0;

    if (move.captured) {
      const pieceValues = { p: 1, n: 3, b: 3, r: 5, q: 9, k: 100 };
      score += pieceValues[move.captured] * 10;
    }

    const centerSquares = ['d4', 'd5', 'e4', 'e5', 'c4', 'c5', 'd3', 'd6', 'e3', 'e6'];
    if (centerSquares.includes(move.to)) {
      score += 2;
    }

    game.move(move);
    if (game.in_check()) {
      score -= 50;
    }

    if (game.in_check()) {
      score += 3;
    }

    game.undo();

    return score;
  }

  // ========== HISTORIAL ==========

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

  // ========== UI ==========

  function refreshBoardUI(lastMove) {
    clearBoardHighlights();

    if (lastMove) {
      highlightSquare(lastMove.from, 'highlight-from');
      highlightSquare(lastMove.to, 'highlight-to');
    }

    if (game.in_check()) {
      const kingSquare = findKingSquare(game.turn());
      if (kingSquare) highlightSquare(kingSquare, 'in-check');
    }

    highlightSelection();
  }

  function highlightSelection() {
    clearSelectionHighlight();
    if (selectedFrom) {
      highlightSquare(selectedFrom, 'highlight-from');
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

  // ========== FIN DE PARTIDA ==========

  function checkGameEnd() {
    if (game.in_checkmate()) {
      const winner = game.turn() === 'w' ? 'b' : 'w';
      const winnerName = winner === playerColor ? 'Has ganado' : 'IA gana';
      endGame('¡Jaque mate!', `${winnerName} por jaque mate`, winner);
      return true;
    }

    if (game.in_stalemate()) {
      endGame('¡Ahogado!', 'Partida empatada', null);
      return true;
    }

    return false;
  }

  function endGame(title, message, winner) {
    if (gameFinished) return;

    gameFinished = true;
    clearInterval(timerInterval);
    isTimerRunning = false;

    const modal = document.getElementById('resultModal');
    document.getElementById('resultTitle').textContent = title;
    document.getElementById('resultMessage').textContent = message;
    modal.classList.remove('hidden');
  }

  function resignGame() {
    const winner = playerColor === 'w' ? 'b' : 'w';
    endGame('Te has rendido', 'IA gana', winner);
  }

})();
