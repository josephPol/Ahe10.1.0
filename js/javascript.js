// ===== MENÚ HAMBURGUESA =====
const burger = document.querySelector(".burger");
const mobileMenu = document.querySelector(".mobileMenu");

if (burger && mobileMenu) {
  burger.addEventListener("click", () => {
    mobileMenu.classList.toggle("open");
  });
}

// ===== TEMA CLARO / OSCURO =====
const themeBtn = document.querySelector(".themeBtn");

if (themeBtn) {
  themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark");

    // cambiar icono
    themeBtn.textContent = 
      document.body.classList.contains("dark") ? "☀️" : "🌙";
  });
}
const PIECES_PATH = "/imagenes/piezas/";
const EXT = "png";

const boardEl = document.getElementById("board");


let boardState = [
  ["br","bn","bb","bq","bk","bb","bn","br"],
  ["bp","bp","bp","bp","bp","bp","bp","bp"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["wp","wp","wp","wp","wp","wp","wp","wp"],
  ["wr","wn","wb","wq","wk","wb","wn","wr"],
];

// guardamos la casilla seleccionada
let selected = null;

// helpers
function isEmpty(v) { return v === ""; }
function getPiece(r,c) { return boardState[r][c]; }
function setPiece(r,c,val) { boardState[r][c] = val; }

// casillas a las que dejamos mover (por ahora “cualquier” movimiento, sin reglas)
function getPseudoMoves(fromR, fromC) {
  const moves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (!(r === fromR && c === fromC)) moves.push({ r, c });
    }
  }
  return moves;
}

function clearHighlights() {
  const squares = boardEl.querySelectorAll(".sq");
  squares.forEach(sq => {
    sq.classList.remove("selected");
    sq.classList.remove("move");
  });
}

function renderBoard(highlightMoves = []) {
  if (!boardEl) return;

  boardEl.innerHTML = "";

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement("div");
      sq.className = "sq " + ((r + c) % 2 === 0 ? "light" : "dark");
      sq.dataset.r = r;
      sq.dataset.c = c;

      // marcar selección
      if (selected && selected.r === r && selected.c === c) {
        sq.classList.add("selected");
      }

      // marcar posibles destinos
      if (highlightMoves.some(m => m.r === r && m.c === c)) {
        sq.classList.add("move");
      }

      const piece = getPiece(r, c);
      if (!isEmpty(piece)) {
        const img = document.createElement("img");
        img.className = "piece";
        img.src = `pieces/${piece}.svg`; // tus imágenes
        img.alt = piece;
        sq.appendChild(img);
      }

      sq.addEventListener("click", onSquareClick);
      boardEl.appendChild(sq);
    }
  }
}

function onSquareClick(e) {
  const r = Number(e.currentTarget.dataset.r);
  const c = Number(e.currentTarget.dataset.c);

  const clickedPiece = getPiece(r, c);

  // si no hay selección todavía:
  if (!selected) {
    // solo selecciona si hay pieza en esa casilla
    if (!isEmpty(clickedPiece)) {
      selected = { r, c };
      const moves = getPseudoMoves(r, c);
      renderBoard(moves);
    }
    return;
  }

  // si clicas la misma casilla -> deseleccionar
  if (selected.r === r && selected.c === c) {
    selected = null;
    renderBoard([]);
    return;
  }

  // mover pieza (SIN reglas por ahora)
  const fromPiece = getPiece(selected.r, selected.c);
  setPiece(r, c, fromPiece);
  setPiece(selected.r, selected.c, "");

  selected = null;
  renderBoard([]);
}

// primera pinta
renderBoard([]);
