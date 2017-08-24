/* jshint esversion: 6 */

var toUnicode = {};
toUnicode[EMPTY] = "";
toUnicode[KING_W] = "&#9812;";
toUnicode[QUEEN_W] = "&#9813;";
toUnicode[BISHOP_W] = "&#9814;";
toUnicode[KNIGHT_W] = "&#9815;";
toUnicode[ROOK_W] = "&#9816;";
toUnicode[PAWN_W] = "&#9817;";
toUnicode[KING_B] = "&#9818;";
toUnicode[QUEEN_B] = "&#9819;";
toUnicode[BISHOP_B] = "&#9820;";
toUnicode[KNIGHT_B] = "&#9821;";
toUnicode[ROOK_B] = "&#9822;";
toUnicode[PAWN_B] = "&#9823;";

var tds = [];
// Draw the chess board when the page loads
document.addEventListener("DOMContentLoaded", () => {
  createTable();
  display_board(initialState);
}, false);

/* Add a HTML table the same size as the board.
 * Populate a global list of tds which is the same order as the board string. */
function createTable(){
  let table = document.createElement("table");
  for(let rank = BOARD_SIDE; rank > 0; rank --){
    let tr = document.createElement("tr");
    for(let file = 0; file < BOARD_SIDE; file ++){
      let td = document.createElement("td");
      tr.appendChild(td);
      tds.push(td);
    }
    table.appendChild(tr);
  }
  document.body.appendChild(table);
}

/* Fills the HTML board with a given state */
function display_board(state){
  tds.forEach((td, index) => td.innerHTML = toUnicode[state[index]]);
}
