(() => {
  'use strict';

  let game = null;
  let board = null;

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
  });

  /* =========================================
     UTILIDADES
  ========================================= */

  // a1 -> [row, col] con row 0..7 (0 es fila 8) y col 0..7 (0 es 'a')
  function getCoordinates(square) {
    const col = square.charCodeAt(0) - 'a'.charCodeAt(0);
    const row = 8 - parseInt(square[1], 10);
    return [row, col];
  }

  // Construye estado actual del tablero en formato chessboard.js: {a8:"br", e2:"wp"...}
  function getBoardStateFromGame(gameInstance) {
    const state = {};
    const b = gameInstance.board(); // 8x8, cada celda {type:'p', color:'w'} o null

    for (let row = 0; row < 8; row++) {
      for (let col = 0; col < 8; col++) {
        const cell = b[row][col];
        if (!cell) continue;

        const file = String.fromCharCode(97 + col); // a..h
        const rank = String(8 - row);               // 8..1
        const sq = file + rank;

        state[sq] = cell.color + cell.type; // ej: 'w'+'p' => 'wp'
      }
    }
    return state;
  }

  /* =========================================
     VALIDACIÓN: REGLAS POR PIEZA
  ========================================= */

  /**
   * Valida si el movimiento es legal para el tipo de pieza (reglas básicas)
   * piece: "wp","bn","wq","bk"... (color + tipo)
   */
  function isValidPieceMovement(piece, from, to, boardState) {
    const [fromRow, fromCol] = getCoordinates(from);
    const [toRow, toCol] = getCoordinates(to);
    const type = piece[1].toLowerCase();
    const targetPiece = boardState[to];

    // No capturar pieza del mismo color
    if (targetPiece && targetPiece[0] === piece[0]) return false;

    switch (type) {
      case 'p': // peón
        return isValidPawnMove(piece, fromRow, fromCol, toRow, toCol, boardState, from, to);
      case 'n': // caballo
        return isValidKnightMove(fromRow, fromCol, toRow, toCol);
      case 'b': // alfil
        return isValidBishopMove(fromRow, fromCol, toRow, toCol, boardState);
      case 'r': // torre
        return isValidRookMove(fromRow, fromCol, toRow, toCol, boardState);
      case 'q': // reina
        return isValidQueenMove(fromRow, fromCol, toRow, toCol, boardState);
      case 'k': // rey
        return isValidKingMove(fromRow, fromCol, toRow, toCol);
      default:
        return false;
    }
  }

  /**
   * PEÓN:
   * - Avanza recto 1 si está libre
   * - Primer movimiento: puede avanzar 2 si ambos libres
   * - Captura SOLO en diagonal 1 si hay pieza enemiga
   * Blancas suben (row disminuye), negras bajan (row aumenta)
   */
  function isValidPawnMove(piece, fromRow, fromCol, toRow, toCol, boardState, from, to) {
    const isWhite = piece[0] === 'w';
    const direction = isWhite ? -1 : 1;
    const targetPiece = boardState[to];

    // 1 paso hacia adelante (misma columna, casilla destino vacía)
    if (fromCol === toCol && toRow === fromRow + direction && !targetPiece) {
      return true;
    }

    // 2 pasos iniciales
    const startRow = isWhite ? 6 : 1;
    if (fromRow === startRow && fromCol === toCol && toRow === fromRow + 2 * direction) {
      const middleSquare = String.fromCharCode(97 + fromCol) + (8 - (fromRow + direction));
      if (!boardState[middleSquare] && !targetPiece) {
        return true;
      }
    }

    // Captura en diagonal (1)
    if (Math.abs(toCol - fromCol) === 1 && toRow === fromRow + direction && targetPiece) {
      return true;
    }

    return false;
  }

  /**
   * CABALLO: movimiento en L (2,1) o (1,2)
   */
  function isValidKnightMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return (rowDiff === 2 && colDiff === 1) || (rowDiff === 1 && colDiff === 2);
  }

  /**
   * ALFIL: diagonal sin obstáculos
   */
  function isValidBishopMove(fromRow, fromCol, toRow, toCol, boardState) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);

    if (rowDiff !== colDiff || rowDiff === 0) return false;
    return isPathClear(fromRow, fromCol, toRow, toCol, boardState);
  }

  /**
   * TORRE: vertical u horizontal sin obstáculos
   */
  function isValidRookMove(fromRow, fromCol, toRow, toCol, boardState) {
    if (fromRow !== toRow && fromCol !== toCol) return false;
    if (fromRow === toRow && fromCol === toCol) return false;
    return isPathClear(fromRow, fromCol, toRow, toCol, boardState);
  }

  /**
   * REINA: combina alfil + torre
   */
  function isValidQueenMove(fromRow, fromCol, toRow, toCol, boardState) {
    return (
      isValidBishopMove(fromRow, fromCol, toRow, toCol, boardState) ||
      isValidRookMove(fromRow, fromCol, toRow, toCol, boardState)
    );
  }

  /**
   * REY: 1 casilla en cualquier dirección
   */
  function isValidKingMove(fromRow, fromCol, toRow, toCol) {
    const rowDiff = Math.abs(toRow - fromRow);
    const colDiff = Math.abs(toCol - fromCol);
    return rowDiff <= 1 && colDiff <= 1 && (rowDiff !== 0 || colDiff !== 0);
  }

  /**
   * Camino despejado entre origen y destino (alfil, torre, reina)
   */
  function isPathClear(fromRow, fromCol, toRow, toCol, boardState) {
    const rowStep = toRow > fromRow ? 1 : toRow < fromRow ? -1 : 0;
    const colStep = toCol > fromCol ? 1 : toCol < fromCol ? -1 : 0;

    let currentRow = fromRow + rowStep;
    let currentCol = fromCol + colStep;

    while (currentRow !== toRow || currentCol !== toCol) {
      const square = String.fromCharCode(97 + currentCol) + (8 - currentRow);
      if (boardState[square]) return false;
      currentRow += rowStep;
      currentCol += colStep;
    }
    return true;
  }

  /* =========================================
     EVENTOS DEL TABLERO
  ========================================= */

  function onDragStart(source, piece) {
    // No mover si terminó
    if (game.game_over()) return false;

    // Respetar turnos (blancas primero)
    if ((game.turn() === 'w' && piece.startsWith('b')) ||
        (game.turn() === 'b' && piece.startsWith('w'))) {
      return false;
    }
  }

  function onDrop(source, target) {
    // Si sueltas en la misma casilla, lo dejamos
    if (source === target) return;

    const pieceObj = game.get(source);
    if (!pieceObj) return 'snapback';

    const movingPiece = pieceObj.color + pieceObj.type; // "wp", "bn"...
    const boardState = getBoardStateFromGame(game);

    // 1) Reglas básicas por pieza (las que quieres)
    const okByRules = isValidPieceMovement(movingPiece, source, target, boardState);
    if (!okByRules) return 'snapback';

    // 2) Aplicar el movimiento en chess.js para conservar turnos y estado
    const move = game.move({
      from: source,
      to: target,
      promotion: 'q' // promoción simple
    });

    if (move === null) return 'snapback';
  }

  function onSnapEnd() {
    board.position(game.fen());
  }

})();
