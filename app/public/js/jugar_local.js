// Jugar Local - Chess Game Logic
let board = null;
let game = new Chess();

function onDragStart (source, piece, position, orientation) {
    // Do not pick up pieces if the game is over
    if (game.game_over()) return false;
    // Only allow moving the correct color
    if ((game.turn() === 'w' && piece.search(/^b/) !== -1) ||
        (game.turn() === 'b' && piece.search(/^w/) !== -1)) {
        return false;
    }
}

function onDrop (source, target) {
    const move = game.move({ from: source, to: target, promotion: 'q' });
    if (move === null) return 'snapback';
    updateStatus();
}

function onSnapEnd () {
    board.position(game.fen());
}

function updateStatus () {
    let status = '';
    let moveColor = game.turn() === 'w' ? 'Blancas' : 'Negras';

    if (game.in_checkmate()) {
        status = `Jaque mate. ${moveColor === 'Blancas' ? 'Negras' : 'Blancas'} ganan.`;
    } else if (game.in_draw()) {
        status = 'Tablas.';
    } else {
        status = `${moveColor} mueven.`;
        if (game.in_check()) {
            status += ` ${moveColor} están en jaque.`;
        }
    }
    document.getElementById('status').textContent = status;
}

function resetGame() {
    game.reset();
    board.position(game.fen());
    updateStatus();
}

document.getElementById('reset-btn').addEventListener('click', resetGame);

const config = {
    draggable: true,
    position: 'start',
    onDragStart: onDragStart,
    onDrop: onDrop,
    onSnapEnd: onSnapEnd
};

board = Chessboard('chessboard', config);
updateStatus();
