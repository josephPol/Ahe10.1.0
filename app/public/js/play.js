(() => {
  'use strict';

  let game;
  let board;

  const moveListEl = document.getElementById('moveList');

  // Mapa para mostrar icono de pieza en el historial (estilo simple)
  const pieceIcon = {
    p: '♙', // peón
    n: '♘', // caballo
    b: '♗', // alfil
    r: '♖', // torre
    q: '♕', // reina
    k: '♔'  // rey
  };

  document.addEventListener('DOMContentLoaded', () => {
    game = new Chess();

    const config = {
      draggable: true,
      position: 'start',
      onDragStart,
      onDrop,
      onSnapEnd,
      pieceTheme: 'https://chessboardjs.com/img/chesspieces/wikipedia/{piece}.png'
    };

    board = Chessboard('chessBoard', config);

    // Pintar estado inicial (por si quieres marcar jaque/limpiar)
    refreshBoardUI(null);
  });

  function onDragStart(source, piece) {
    // Solo bloquea si hay FINAL de partida, no por jaque
    // (en jaque se puede mover, pero solo legalmente)
    if (game.game_over()) return false;

    // Respetar turnos
    if ((game.turn() === 'w' && piece.startsWith('b')) ||
        (game.turn() === 'b' && piece.startsWith('w'))) {
      return false;
    }

    // Si no existe pieza en source, fuera
    const p = game.get(source);
    if (!p) return false;
  }

  function onDrop(source, target) {
    // Intentamos mover con chess.js: si es ilegal (incluye jaque), lo rechaza
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q'
    });

    if (move === null) {
      return 'snapback';
    }

    // Añadir al historial
    addMoveToHistory(move);

    // Refrescar UI (último movimiento, jaque)
    refreshBoardUI(move);
  }

  function onSnapEnd() {
    // Sincroniza tablero con el estado real
    board.position(game.fen());
  }

  /* =========================================
     HISTORIAL
  ========================================= */

  function addMoveToHistory(move) {
    // move: {color:'w'/'b', piece:'p','n'.., from:'e2', to:'e4', san:'e4', flags:'...' }
    const icon = pieceIcon[move.piece] || '';
    const isWhiteMove = move.color === 'w';

    // Número de jugada: solo se incrementa en movimientos de blancas
    // Ej: 1. (blancas) ... (negras)
    const fullMoveNumber = Math.ceil(game.history().length / 2);

    const text = `${icon} ${move.from}→${move.to}  (${move.san})`;

    if (isWhiteMove) {
      // nueva línea numerada
      const li = document.createElement('li');
      li.textContent = `${fullMoveNumber}. ${text}`;
      moveListEl.appendChild(li);
    } else {
      // añadir al último li (misma jugada)
      const last = moveListEl.lastElementChild;
      if (last) {
        last.textContent = `${last.textContent}   |   ${text}`;
      } else {
        // por si acaso
        const li = document.createElement('li');
        li.textContent = `${fullMoveNumber}. ${text}`;
        moveListEl.appendChild(li);
      }
    }

    // Auto-scroll abajo
    moveListEl.scrollTop = moveListEl.scrollHeight;
  }

  /* =========================================
     UI: último movimiento + jaque
  ========================================= */

  function refreshBoardUI(lastMove) {
    clearBoardHighlights();

    if (lastMove) {
      highlightSquare(lastMove.from, 'highlight-from');
      highlightSquare(lastMove.to, 'highlight-to');
    }

    // Marcar el rey en jaque
    if (game.in_check()) {
      const kingSquare = findKingSquare(game.turn()); // el bando que está por mover es el que puede estar en jaque
      if (kingSquare) highlightSquare(kingSquare, 'in-check');
    }
  }

  function clearBoardHighlights() {
    const $board = document.getElementById('chessBoard');
    if (!$board) return;

    $board.querySelectorAll('.highlight-from, .highlight-to, .in-check')
      .forEach(el => {
        el.classList.remove('highlight-from', 'highlight-to', 'in-check');
      });
  }

  function highlightSquare(square, className) {
    // chessboard.js pinta casillas con atributo data-square="e4"
    const sel = `#chessBoard [data-square="${square}"]`;
    const el = document.querySelector(sel);
    if (el) el.classList.add(className);
  }

  function findKingSquare(colorToMove) {
    // colorToMove: 'w' o 'b' -> buscamos el rey de ese color en el tablero
    const b = game.board(); // 8x8
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

})();
