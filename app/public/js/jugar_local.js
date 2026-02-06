
// === Variables principales ===
let game = new Chess();
let board;
let selectedFrom = null;
let gameMode = 'drag'; // 'drag' o 'click'
let timerWhiteEl = document.getElementById('timerWhite');
let timerBlackEl = document.getElementById('timerBlack');
let timeWhite = 10 * 60;
let timeBlack = 10 * 60;
let timerInterval = null;
let isTimerRunning = false;
let gameStarted = false;
let gameFinished = false;
const moveListEl = document.getElementById('moveList');

const pieceIcon = {
    p: '♙', n: '♘', b: '♗', r: '♖', q: '♕', k: '♔'
};

// === Inicialización ===

document.addEventListener('DOMContentLoaded', () => {
    setupModeControls();
    setupResignButtons();
    // Esperar a que el div #chessBoard exista
    const tryInit = () => {
        const el = document.getElementById('chessBoard');
        if (el) {
            initializeBoard();
        } else {
            setTimeout(tryInit, 50);
        }
    };
    tryInit();
});

function setupModeControls() {
    const modeButtons = document.querySelectorAll('.mode-btn');
    modeButtons.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const newMode = e.currentTarget.getAttribute('data-mode');
            setGameMode(newMode);
        });
    });
}

function setGameMode(mode) {
    gameMode = mode;
    document.querySelectorAll('.mode-btn').forEach(btn => btn.classList.remove('mode-btn--active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('mode-btn--active');
    clearSelection();
    initializeBoard();
}

function setupResignButtons() {
    document.getElementById('resignWhite').onclick = () => endGame('Blancas se rindieron', 'Negras ganan', 'b');
    document.getElementById('resignBlack').onclick = () => endGame('Negras se rindieron', 'Blancas ganan', 'w');
}

function initializeBoard() {
    const config = {
        draggable: gameMode === 'drag',
        position: game.fen(),
        onDragStart,
        onDrop,
        onSnapEnd,
        pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };
    board = Chessboard('chessBoard', config);
    if (gameMode === 'click') {
        const chessBoardEl = document.getElementById('chessBoard');
        chessBoardEl.removeEventListener('click', handleBoardClick);
        chessBoardEl.addEventListener('click', handleBoardClick);
    }
    updateTimerDisplay();
    updateTimerUI();
    refreshBoardUI(null);
}

function onDragStart(source, piece) {
    if (game.game_over()) return false;
    if ((game.turn() === 'w' && piece.startsWith('b')) || (game.turn() === 'b' && piece.startsWith('w'))) return false;
    if (!gameStarted && game.turn() === 'w') startGameTimer();
    clearSelection();
}

function onDrop(source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';
    addMoveToHistory(move);
    refreshBoardUI(move);
    clearSelection();
    updateTimerUI();
    if (checkGameEnd()) return;
}

function onSnapEnd() {
    board.position(game.fen());
}

function handleBoardClick(e) {
    if (gameMode !== 'click') return;
    const squareEl = e.target.closest('[data-square]');
    if (!squareEl) return;
    const square = squareEl.getAttribute('data-square');
    if (square) onBoardClick(square);
}

function onBoardClick(square) {
    const clickedPiece = game.get(square);
    if (game.game_over()) return;
    if (!selectedFrom) {
        if (clickedPiece && clickedPiece.color === game.turn()) {
            setSelection(square);
            refreshBoardUI(null);
            highlightSelection();
        }
        return;
    }
    const from = selectedFrom;
    if (clickedPiece && clickedPiece.color === game.turn()) {
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
        updateTimerUI();
        if (checkGameEnd()) return;
    } else {
        highlightSelection();
    }
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
    if (!gameStarted && game.turn() === 'w') startGameTimer();
}

function clearSelection() {
    selectedFrom = null;
    clearSelectionHighlight();
}

// === Temporizadores ===
function updateTimerDisplay() {
    timerWhiteEl.textContent = formatTime(timeWhite);
    timerBlackEl.textContent = formatTime(timeBlack);
}

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
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
        if (game.turn() === 'w') {
            timeWhite--;
            if (timeWhite < 0) timeWhite = 0;
        } else {
            timeBlack--;
            if (timeBlack < 0) timeBlack = 0;
        }
        updateTimerDisplay();
        if (timeWhite === 0) {
            endGame('Tiempo agotado', 'Negras ganan por tiempo', 'b');
        } else if (timeBlack === 0) {
            endGame('Tiempo agotado', 'Blancas ganan por tiempo', 'w');
        }
    }, 1000);
    updateTimerUI();
}

function updateTimerUI() {
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

// === Historial ===
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

// === UI: highlights ===
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

// === Fin de partida ===
function endGame(reason, result, winner) {
    if (gameFinished) return;
    gameFinished = true;
    clearInterval(timerInterval);
    isTimerRunning = false;
    const modal = document.getElementById('resultModal');
    const title = document.getElementById('resultTitle');
    const message = document.getElementById('resultMessage');
    const restartBtn = document.getElementById('restartBtn');
    title.textContent = result;
    message.textContent = reason;
    modal.classList.remove('hidden');
    restartBtn.onclick = () => { location.reload(); };
}

function checkGameEnd() {
    if (game.in_checkmate()) {
        const loser = game.turn() === 'w' ? 'w' : 'b';
        const winner = game.turn() === 'w' ? 'Negras' : 'Blancas';
        endGame('¡Jaque mate!', `${winner} ganan por jaque mate`, loser);
        return true;
    }
    if (game.in_stalemate()) {
        endGame('¡Ahogado!', 'Partida empatada', null);
        return true;
    }
    return false;
}

// Reinicio eliminado: el botón ya no existe
