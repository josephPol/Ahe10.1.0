let game = null;
let board = null;
let gameMode = 'drag';
let selectedFrom = null;

let playerColor = null;
let botColor = null;
let difficulty = null;
let gameStarted = false;
let botThinking = false;
let gameFinished = false;

let playerTime = 10 * 60;
let timerInterval = null;

const moveListEl = document.getElementById('moveList');
const timerPlayerEl = document.getElementById('timerPlayer');
const gameSubtitleEl = document.getElementById('gameSubtitle');
const playerLabelEl = document.getElementById('playerLabel');

const setupModalEl = document.getElementById('setupModal');
const startGameBtnEl = document.getElementById('startGameBtn');
const resultModalEl = document.getElementById('resultModal');
const resultTitleEl = document.getElementById('resultTitle');
const resultMessageEl = document.getElementById('resultMessage');
const restartBtnEl = document.getElementById('restartBtn');

const pieceIcon = {
  p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔'
};

const unicodePieceMap = {
  w: { k: '♔', q: '♕', r: '♖', b: '♗', n: '♘', p: '♙' },
  b: { k: '♚', q: '♛', r: '♜', b: '♝', n: '♞', p: '♟' }
};

const transparentPieceDataUri =
  'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEAAAAALAAAAAABAAEAAAI=';

let dragGhostEl = null;

function setupDragGhost() {
  if (dragGhostEl) return;
  dragGhostEl = document.createElement('div');
  dragGhostEl.className = 'unicode-drag-ghost';
  dragGhostEl.style.display = 'none';
  document.body.appendChild(dragGhostEl);

  document.addEventListener('mousemove', (e) => {
    if (!dragGhostEl || dragGhostEl.style.display === 'none') return;
    dragGhostEl.style.left = `${e.clientX}px`;
    dragGhostEl.style.top = `${e.clientY}px`;
  });
}

function showDragGhost(piece) {
  if (!piece) return;
  setupDragGhost();
  const color = piece[0];
  const type = piece[1]?.toLowerCase();
  const symbol = unicodePieceMap[color]?.[type];
  if (!symbol) return;
  dragGhostEl.textContent = symbol;
  dragGhostEl.classList.toggle('unicode-drag-ghost--white', color === 'w');
  dragGhostEl.classList.toggle('unicode-drag-ghost--black', color === 'b');
  dragGhostEl.style.display = 'block';
}

function hideDragGhost() {
  if (!dragGhostEl) return;
  dragGhostEl.style.display = 'none';
}

function renderUnicodePieces() {
  const boardEl = document.getElementById('chessBoard');
  if (!boardEl || !game) return;

  boardEl.querySelectorAll('[data-square]').forEach(squareEl => {
    const square = squareEl.getAttribute('data-square');
    if (!square) return;

    const piece = game.get(square);
    let textEl = squareEl.querySelector('.piece-text');

    if (!textEl) {
      textEl = document.createElement('span');
      textEl.className = 'piece-text';
      squareEl.appendChild(textEl);
    }

    if (piece) {
      textEl.textContent = unicodePieceMap[piece.color][piece.type] || '';
      textEl.classList.toggle('piece-text--white', piece.color === 'w');
      textEl.classList.toggle('piece-text--black', piece.color === 'b');
    } else {
      textEl.textContent = '';
      textEl.classList.remove('piece-text--white', 'piece-text--black');
    }
  });
}

const difficultyDepth = {
  easy: 1,
  medium: 2,
  hard: 3
};

document.addEventListener('DOMContentLoaded', () => {
  setupDragGhost();
  setupSetupModal();
  setupModeControls();
  setupResignButton();
  setupRestartButton();

  updateTimerDisplay();
  gameSubtitleEl.textContent = 'Selecciona dificultad y color para empezar';
});

function setupSetupModal() {
  document.querySelectorAll('.difficulty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      difficulty = btn.getAttribute('data-difficulty');
      document.querySelectorAll('.difficulty-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateStartButtonState();
    });
  });

  document.querySelectorAll('.color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playerColor = btn.getAttribute('data-color');
      botColor = playerColor === 'w' ? 'b' : 'w';
      document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
      btn.classList.add('selected');
      updateStartButtonState();
    });
  });

  startGameBtnEl.addEventListener('click', startGame);
}

function updateStartButtonState() {
  startGameBtnEl.disabled = !(difficulty && playerColor);
}

function setupModeControls() {
  const modeButtons = document.querySelectorAll('.mode-btn');
  modeButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      gameMode = e.currentTarget.getAttribute('data-mode');
      modeButtons.forEach(b => b.classList.remove('mode-btn--active'));
      e.currentTarget.classList.add('mode-btn--active');

      if (board) {
        board.destroy();
      }
      initializeBoard();
      clearSelection();
    });
  });
}

function setupResignButton() {
  const resignBtn = document.getElementById('resignBtn');
  resignBtn.addEventListener('click', () => {
    if (!gameStarted || gameFinished) return;
    endGame('Te has rendido.', 'Derrota');
  });
}

function setupRestartButton() {
  restartBtnEl.addEventListener('click', () => {
    window.location.reload();
  });
}

function startGame() {
  game = new Chess();
  gameStarted = true;
  gameFinished = false;
  botThinking = false;
  selectedFrom = null;
  playerTime = 10 * 60;

  moveListEl.innerHTML = '';
  setupModalEl.classList.add('hidden');

  const difficultyLabel =
    difficulty === 'easy' ? 'Fácil' :
    difficulty === 'medium' ? 'Medio' :
    'Difícil';

  playerLabelEl.textContent = playerColor === 'w' ? '⚪ TÚ' : '⚫ TÚ';
  gameSubtitleEl.textContent = `Dificultad: ${difficultyLabel} · Juegas con ${playerColor === 'w' ? 'blancas' : 'negras'}`;

  initializeBoard();
  updateTimerDisplay();
  startTimer();

  if (game.turn() === botColor) {
    triggerBotMove();
  }
}

function initializeBoard() {
  if (!game) return;

  const config = {
    draggable: gameMode === 'drag',
    position: game.fen(),
    orientation: playerColor || 'white',
    // Hide default piece images; we draw Unicode with CSS.
    pieceTheme: () => transparentPieceDataUri,
    onDragStart,
    onDrop,
    onSnapEnd
  };

  board = Chessboard('chessBoard', config);

  const chessBoardEl = document.getElementById('chessBoard');
  chessBoardEl.removeEventListener('click', handleBoardClick);

  if (gameMode === 'click') {
    chessBoardEl.addEventListener('click', handleBoardClick);
  }

  refreshBoardUI(null);
  renderUnicodePieces();
}

function onDragStart(source, piece) {
  if (!canPlayerMove()) return false;
  if ((playerColor === 'w' && !piece.startsWith('w')) || (playerColor === 'b' && !piece.startsWith('b'))) {
    return false;
  }
  const fromEl = document.querySelector(`#chessBoard [data-square="${source}"]`);
  if (fromEl) fromEl.classList.add('drag-from');
  showDragGhost(piece);
}

function onDrop(source, target) {
  if (!canPlayerMove()) return 'snapback';

  const move = game.move({ from: source, to: target, promotion: 'q' });
  if (move === null) return 'snapback';

  onHumanMove(move);
  const fromEl = document.querySelector(`#chessBoard [data-square="${source}"]`);
  if (fromEl) fromEl.classList.remove('drag-from');
  hideDragGhost();
}

function onSnapEnd() {
  if (!board || !game) return;
  board.position(game.fen());
  renderUnicodePieces();
  document.querySelectorAll('#chessBoard .drag-from').forEach(el => el.classList.remove('drag-from'));
  hideDragGhost();
}

function handleBoardClick(e) {
  if (gameMode !== 'click' || !canPlayerMove()) return;

  const squareEl = e.target.closest('[data-square]');
  if (!squareEl) return;

  const square = squareEl.getAttribute('data-square');
  if (!square) return;

  const clickedPiece = game.get(square);

  if (!selectedFrom) {
    if (clickedPiece && clickedPiece.color === playerColor) {
      selectedFrom = square;
      refreshBoardUI(null);
      highlightSelection();
    }
    return;
  }

  if (clickedPiece && clickedPiece.color === playerColor) {
    selectedFrom = square;
    refreshBoardUI(null);
    highlightSelection();
    return;
  }

  const move = game.move({ from: selectedFrom, to: square, promotion: 'q' });
  if (move === null) {
    refreshBoardUI(null);
    highlightSelection();
    return;
  }

  clearSelection();
  onHumanMove(move);
}

function onHumanMove(move) {
  addMoveToHistory(move);
  refreshBoardUI(move);
  renderUnicodePieces();

  if (checkGameEnd()) return;
  triggerBotMove();
}

function triggerBotMove() {
  if (gameFinished) return;
  botThinking = true;
  gameSubtitleEl.textContent = 'La IA está pensando...';

  setTimeout(() => {
    if (gameFinished) return;

    const move = getBotMove();
    botThinking = false;

    if (!move) {
      checkGameEnd();
      return;
    }

    game.move(move);
    board.position(game.fen());
    addMoveToHistory(move);
    refreshBoardUI(move);
    renderUnicodePieces();

    const difficultyLabel =
      difficulty === 'easy' ? 'Fácil' :
      difficulty === 'medium' ? 'Medio' :
      'Difícil';
    gameSubtitleEl.textContent = `Dificultad: ${difficultyLabel} · Tu turno`;

    checkGameEnd();
  }, 450);
}

function getBotMove() {
  const legalMoves = game.moves({ verbose: true });
  if (!legalMoves.length) return null;

  if (difficulty === 'easy') {
    return legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }

  const depth = difficultyDepth[difficulty] || 2;
  let bestMove = null;
  let bestValue = -Infinity;

  for (const move of legalMoves) {
    game.move(move);
    const value = minimax(depth - 1, false, -Infinity, Infinity);
    game.undo();

    if (value > bestValue) {
      bestValue = value;
      bestMove = move;
    }
  }

  return bestMove || legalMoves[0];
}

function minimax(depth, maximizingPlayer, alpha, beta) {
  if (depth === 0 || game.game_over()) {
    return evaluatePosition();
  }

  const moves = game.moves({ verbose: true });

  if (maximizingPlayer) {
    let maxEval = -Infinity;
    for (const move of moves) {
      game.move(move);
      const evalValue = minimax(depth - 1, false, alpha, beta);
      game.undo();
      maxEval = Math.max(maxEval, evalValue);
      alpha = Math.max(alpha, evalValue);
      if (beta <= alpha) break;
    }
    return maxEval;
  }

  let minEval = Infinity;
  for (const move of moves) {
    game.move(move);
    const evalValue = minimax(depth - 1, true, alpha, beta);
    game.undo();
    minEval = Math.min(minEval, evalValue);
    beta = Math.min(beta, evalValue);
    if (beta <= alpha) break;
  }
  return minEval;
}

function evaluatePosition() {
  if (game.in_checkmate()) {
    return game.turn() === botColor ? -99999 : 99999;
  }

  if (game.in_draw() || game.in_stalemate() || game.insufficient_material()) {
    return 0;
  }

  const pieceValues = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  let score = 0;

  const boardState = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = boardState[r][c];
      if (!piece) continue;

      const value = pieceValues[piece.type] || 0;
      if (piece.color === botColor) {
        score += value;
      } else {
        score -= value;
      }
    }
  }

  return score;
}

function canPlayerMove() {
  return gameStarted && !gameFinished && !botThinking && game.turn() === playerColor;
}

function clearSelection() {
  selectedFrom = null;
}

function addMoveToHistory(move) {
  const icon = pieceIcon[move.piece] || '';
  const fullMoveNumber = Math.ceil(game.history().length / 2);
  const text = `${icon} ${move.from}→${move.to} (${move.san})`;

  if (move.color === 'w') {
    const li = document.createElement('li');
    li.textContent = `${fullMoveNumber}. ${text}`;
    moveListEl.appendChild(li);
  } else {
    const last = moveListEl.lastElementChild;
    if (last) {
      last.textContent = `${last.textContent} | ${text}`;
    } else {
      const li = document.createElement('li');
      li.textContent = `${fullMoveNumber}. ${text}`;
      moveListEl.appendChild(li);
    }
  }

  moveListEl.scrollTop = moveListEl.scrollHeight;
}

function startTimer() {
  clearInterval(timerInterval);

  timerInterval = setInterval(() => {
    if (gameFinished || !gameStarted) return;

    if (game.turn() === playerColor && !botThinking) {
      playerTime--;
      if (playerTime < 0) playerTime = 0;
      updateTimerDisplay();

      if (playerTime === 0) {
        endGame('Se acabó tu tiempo.', 'Derrota por tiempo');
      }
    }
  }, 1000);
}

function updateTimerDisplay() {
  timerPlayerEl.textContent = formatTime(playerTime);
}

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

function refreshBoardUI(lastMove) {
  clearBoardHighlights();

  if (lastMove) {
    highlightSquare(lastMove.from, 'highlight-from');
    highlightSquare(lastMove.to, 'highlight-to');
  }

  if (game && game.in_check()) {
    const kingSquare = findKingSquare(game.turn());
    if (kingSquare) highlightSquare(kingSquare, 'in-check');
  }

  highlightSelection();
}

function highlightSelection() {
  if (!selectedFrom) return;
  highlightSquare(selectedFrom, 'highlight-from');
}

function clearBoardHighlights() {
  const boardEl = document.getElementById('chessBoard');
  if (!boardEl) return;

  boardEl.querySelectorAll('.highlight-from, .highlight-to, .in-check').forEach(el => {
    el.classList.remove('highlight-from', 'highlight-to', 'in-check');
  });
}

function highlightSquare(square, className) {
  const squareEl = document.querySelector(`#chessBoard [data-square="${square}"]`);
  if (squareEl) squareEl.classList.add(className);
}

function findKingSquare(color) {
  const boardState = game.board();
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = boardState[r][c];
      if (piece && piece.type === 'k' && piece.color === color) {
        const file = String.fromCharCode(97 + c);
        const rank = String(8 - r);
        return file + rank;
      }
    }
  }
  return null;
}

function checkGameEnd() {
  if (game.in_checkmate()) {
    if (game.turn() === playerColor) {
      endGame('¡Jaque mate!', 'Derrota');
    } else {
      endGame('¡Jaque mate!', 'Victoria');
    }
    return true;
  }

  if (game.in_stalemate()) {
    endGame('Rey ahogado.', 'Empate');
    return true;
  }

  if (game.in_draw()) {
    let reason = 'Empate por tablas.';
    if (game.in_threefold_repetition()) reason = 'Empate por triple repetición.';
    else if (game.in_fifty_moves()) reason = 'Empate por regla de 50 movimientos.';
    else if (game.insufficient_material()) reason = 'Empate por material insuficiente.';

    endGame(reason, 'Empate');
    return true;
  }

  return false;
}

function endGame(reason, title) {
  if (gameFinished) return;

  gameFinished = true;
  clearInterval(timerInterval);

  resultTitleEl.textContent = title;
  resultMessageEl.textContent = reason;
  resultModalEl.classList.remove('hidden');
}
