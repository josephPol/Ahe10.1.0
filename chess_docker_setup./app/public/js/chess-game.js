/**
 * ChessHub - Chess Game Engine
 * Handles game modes: Create Room, Join Room, Play vs Bot
 */

(function() {
  'use strict';

  // Game State
  let game = null;
  let board = null;
  let gameMode = null; // 'bot', 'host', 'guest'
  let botDifficulty = 1;
  let currentRoom = null;
  let playerColor = 'white';
  
  // DOM Elements
  const modeSelection = document.getElementById('modeSelection');
  const gameScreen = document.getElementById('gameScreen');
  const createRoomModal = document.getElementById('createRoomModal');
  const joinRoomModal = document.getElementById('joinRoomModal');
  const botDifficultyModal = document.getElementById('botDifficultyModal');
  
  // Initialize
  document.addEventListener('DOMContentLoaded', function() {
    initEventListeners();
  });
  
  function initEventListeners() {
    // Mode Selection
    document.getElementById('createRoomBtn')?.addEventListener('click', showCreateRoomModal);
    document.getElementById('joinRoomBtn')?.addEventListener('click', showJoinRoomModal);
    document.getElementById('playBotBtn')?.addEventListener('click', showBotDifficultyModal);
    
    // Create Room
    document.getElementById('cancelCreateRoom')?.addEventListener('click', hideAllModals);
    document.getElementById('startGameAsHost')?.addEventListener('click', startHostGame);
    document.getElementById('copyRoomCode')?.addEventListener('click', copyRoomCode);
    
    // Join Room
    document.getElementById('cancelJoinRoom')?.addEventListener('click', hideAllModals);
    document.getElementById('joinRoomConfirm')?.addEventListener('click', joinRoom);
    
    // Bot Game
    document.getElementById('cancelBotGame')?.addEventListener('click', hideAllModals);
    document.querySelectorAll('.difficulty-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        startBotGame(parseInt(this.dataset.level));
      });
    });
    
    // Game Controls
    document.getElementById('resignBtn')?.addEventListener('click', resignGame);
    document.getElementById('newGameBtn')?.addEventListener('click', returnToModeSelection);
  }
  
  // === MODAL FUNCTIONS ===
  
  function showCreateRoomModal() {
    const roomCode = generateRoomCode();
    document.getElementById('generatedRoomCode').textContent = roomCode;
    currentRoom = roomCode;
    createRoomModal.style.display = 'flex';
  }
  
  function showJoinRoomModal() {
    document.getElementById('roomCodeInput').value = '';
    joinRoomModal.style.display = 'flex';
  }
  
  function showBotDifficultyModal() {
    botDifficultyModal.style.display = 'flex';
  }
  
  function hideAllModals() {
    createRoomModal.style.display = 'none';
    joinRoomModal.style.display = 'none';
    botDifficultyModal.style.display = 'none';
  }
  
  function generateRoomCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
  }
  
  function copyRoomCode() {
    const code = document.getElementById('generatedRoomCode').textContent;
    navigator.clipboard.writeText(code).then(() => {
      const btn = document.getElementById('copyRoomCode');
      const originalText = btn.textContent;
      btn.textContent = '✓ Copiado!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 2000);
    });
  }
  
  // === GAME START FUNCTIONS ===
  
  function startHostGame() {
    gameMode = 'host';
    playerColor = 'white';
    hideAllModals();
    initGame();
    document.getElementById('gameTitle').textContent = `Sala: ${currentRoom}`;
    document.getElementById('gameStatus').textContent = 'Esperando oponente... (Modo simulado)';
  }
  
  function joinRoom() {
    const code = document.getElementById('roomCodeInput').value.trim().toUpperCase();
    if (code.length !== 6) {
      alert('Por favor ingresa un código válido de 6 caracteres');
      return;
    }
    
    gameMode = 'guest';
    playerColor = 'black';
    currentRoom = code;
    hideAllModals();
    initGame();
    document.getElementById('gameTitle').textContent = `Sala: ${currentRoom}`;
    document.getElementById('gameStatus').textContent = 'Conectado a la sala (Modo simulado)';
  }
  
  function startBotGame(difficulty) {
    gameMode = 'bot';
    botDifficulty = difficulty;
    playerColor = 'white';
    hideAllModals();
    initGame();
    
    const difficultyNames = ['', 'Fácil', 'Medio', 'Difícil'];
    document.getElementById('gameTitle').textContent = `Jugando vs Bot (${difficultyNames[difficulty]})`;
  }
  
  // === CHESS GAME LOGIC ===
  
  function initGame() {
    modeSelection.style.display = 'none';
    gameScreen.style.display = 'block';
    
    // Initialize chess.js
    game = new Chess();
    
    // Initialize chessboard
    const config = {
      draggable: true,
      position: 'start',
      onDragStart: onDragStart,
      onDrop: onDrop,
      onSnapEnd: onSnapEnd,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png',
      showNotation: false
    };
    
    board = Chessboard('chessBoard', config);
    
    // If playing as black, flip the board
    if (playerColor === 'black') {
      board.flip();
    }
    
    updateStatus();
    clearMoveList();
    clearCapturedPieces();
  }
  
  function onDragStart(source, piece, position, orientation) {
    // Don't allow moves if game is over
    if (game.game_over()) return false;
    
    // Only allow player to move their own pieces
    if (gameMode === 'bot') {
      if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
          (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
      }
    }
    
    // In multiplayer mode, only allow moves for your color
    if (gameMode === 'host' || gameMode === 'guest') {
      if ((playerColor === 'white' && piece.search(/^b/) !== -1) ||
          (playerColor === 'black' && piece.search(/^w/) !== -1)) {
        return false;
      }
    }
  }
  
  function onDrop(source, target) {
    // See if the move is legal
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q' // Always promote to queen for simplicity
    });
    
    // Illegal move
    if (move === null) return 'snapback';
    
    updateStatus();
    addMoveToHistory(move);
    updateCapturedPieces(move);
    
    // If playing against bot, make bot move
    if (gameMode === 'bot' && !game.game_over()) {
      setTimeout(makeBotMove, 250);
    }
  }
  
  function onSnapEnd() {
    board.position(game.fen());
  }
  
  function makeBotMove() {
    const possibleMoves = game.moves();
    
    if (possibleMoves.length === 0) return;
    
    let selectedMove;
    
    // Bot difficulty logic
    if (botDifficulty === 1) {
      // Easy: Random move
      selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
    } else if (botDifficulty === 2) {
      // Medium: Prefer captures, random otherwise
      const captures = possibleMoves.filter(move => move.includes('x'));
      if (captures.length > 0 && Math.random() > 0.3) {
        selectedMove = captures[Math.floor(Math.random() * captures.length)];
      } else {
        selectedMove = possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
      }
    } else {
      // Hard: Minimax-like (simple evaluation)
      selectedMove = getBestMove();
    }
    
    const move = game.move(selectedMove);
    board.position(game.fen());
    updateStatus();
    addMoveToHistory(move);
    updateCapturedPieces(move);
  }
  
  function getBestMove() {
    const possibleMoves = game.moves({ verbose: true });
    let bestMove = null;
    let bestValue = -9999;
    
    for (let move of possibleMoves) {
      game.move(move);
      const value = evaluateBoard();
      game.undo();
      
      if (value > bestValue) {
        bestValue = value;
        bestMove = move.san;
      }
    }
    
    return bestMove || possibleMoves[0].san;
  }
  
  function evaluateBoard() {
    const pieceValues = {
      'p': 1, 'n': 3, 'b': 3, 'r': 5, 'q': 9, 'k': 0
    };
    
    let value = 0;
    const board = game.board();
    
    for (let i = 0; i < 8; i++) {
      for (let j = 0; j < 8; j++) {
        const piece = board[i][j];
        if (piece) {
          const pieceValue = pieceValues[piece.type] || 0;
          value += piece.color === 'b' ? pieceValue : -pieceValue;
        }
      }
    }
    
    return value;
  }
  
  function updateStatus() {
    let status = '';
    
    if (game.in_checkmate()) {
      status = game.turn() === 'w' ? '¡Jaque mate! Ganan las negras' : '¡Jaque mate! Ganan las blancas';
    } else if (game.in_draw()) {
      status = 'Empate';
    } else if (game.in_stalemate()) {
      status = 'Empate por ahogado';
    } else if (game.in_threefold_repetition()) {
      status = 'Empate por triple repetición';
    } else {
      const turn = game.turn() === 'w' ? 'blancas' : 'negras';
      status = `Turno de las ${turn}`;
      
      if (game.in_check()) {
        status += ' - ¡Jaque!';
      }
    }
    
    document.getElementById('gameStatus').textContent = status;
  }
  
  function addMoveToHistory(move) {
    const moveList = document.getElementById('moveList');
    const moveNumber = Math.floor(game.history().length / 2) + (game.history().length % 2);
    const moveColor = move.color === 'w' ? 'Blancas' : 'Negras';
    
    const moveEl = document.createElement('div');
    moveEl.className = 'move-item';
    moveEl.textContent = `${moveNumber}. ${moveColor}: ${move.san}`;
    moveList.appendChild(moveEl);
    moveList.scrollTop = moveList.scrollHeight;
  }
  
  function clearMoveList() {
    document.getElementById('moveList').innerHTML = '';
  }
  
  function updateCapturedPieces(move) {
    if (move.captured) {
      const capturedDiv = move.color === 'w' 
        ? document.getElementById('capturedBlack')
        : document.getElementById('capturedWhite');
      
      const pieceSymbols = {
        'p': '♟', 'n': '♞', 'b': '♝', 'r': '♜', 'q': '♛', 'k': '♚'
      };
      
      const span = document.createElement('span');
      span.className = 'captured-piece';
      span.textContent = pieceSymbols[move.captured] || move.captured;
      capturedDiv.appendChild(span);
    }
  }
  
  function clearCapturedPieces() {
    document.getElementById('capturedWhite').innerHTML = '';
    document.getElementById('capturedBlack').innerHTML = '';
  }
  
  // === GAME CONTROLS ===
  
  function resignGame() {
    if (confirm('¿Estás seguro de que quieres rendirte?')) {
      const winner = playerColor === 'white' ? 'negras' : 'blancas';
      document.getElementById('gameStatus').textContent = `¡Te has rendido! Ganan las ${winner}`;
      game = new Chess(); // Reset to prevent more moves
    }
  }
  
  function returnToModeSelection() {
    if (game && !game.game_over()) {
      if (!confirm('¿Abandonar la partida actual?')) {
        return;
      }
    }
    
    gameScreen.style.display = 'none';
    modeSelection.style.display = 'block';
    
    if (board) {
      board.destroy();
      board = null;
    }
    game = null;
    gameMode = null;
    currentRoom = null;
  }
  
  // Expose for debugging
  window.ChessGame = {
    getGame: () => game,
    getBoard: () => board,
    getMode: () => gameMode
  };
  
})();
