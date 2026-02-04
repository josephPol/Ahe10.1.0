const board = document.getElementById("board");
const turnoTexto = document.getElementById("turno");

let turno = "blancas";
let seleccion = null;

const piezasIniciales = [
  ["♜","♞","♝","♛","♚","♝","♞","♜"],
  ["♟","♟","♟","♟","♟","♟","♟","♟"],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["","","","","","","",""],
  ["♙","♙","♙","♙","♙","♙","♙","♙"],
  ["♖","♘","♗","♕","♔","♗","♘","♖"]
];

function crearTablero() {
  board.innerHTML = "";

  for (let fila = 0; fila < 8; fila++) {
    for (let col = 0; col < 8; col++) {

      const casilla = document.createElement("div");
      casilla.classList.add("square");

      const blanca = (fila + col) % 2 === 0;
      casilla.classList.add(blanca ? "white" : "black");

      casilla.textContent = piezasIniciales[fila][col];

      casilla.addEventListener("click", () => clickCasilla(casilla));

      board.appendChild(casilla);
    }
  }
}

function clickCasilla(casilla) {
  if (seleccion) {
    casilla.textContent = seleccion.textContent;
    seleccion.textContent = "";
    limpiarSeleccion();

    turno = turno === "blancas" ? "negras" : "blancas";
    turnoTexto.textContent = turno.charAt(0).toUpperCase() + turno.slice(1);
  } else if (casilla.textContent !== "") {
    seleccion = casilla;
    casilla.classList.add("selected");
  }
}

function limpiarSeleccion() {
  document.querySelectorAll(".square").forEach(c => c.classList.remove("selected"));
  seleccion = null;
}

crearTablero();
