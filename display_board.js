"use strict;";

/* Mapping of chess piece chars from state to their unicode char */
var toUnicode = {};
toUnicode[EMPTY] = "";
toUnicode[KING_W] = "&#9812;";
toUnicode[QUEEN_W] = "&#9813;";
toUnicode[ROOK_W] = "&#9814;";
toUnicode[BISHOP_W] = "&#9815;";
toUnicode[KNIGHT_W] = "&#9816;";
toUnicode[PAWN_W] = "&#9817;";
toUnicode[KING_B] = "&#9818;";
toUnicode[QUEEN_B] = "&#9819;";
toUnicode[ROOK_B] = "&#9820;";
toUnicode[BISHOP_B] = "&#9821;";
toUnicode[KNIGHT_B] = "&#9822;";
toUnicode[PAWN_B] = "&#9823;";

// A global list of the tds that make up the board. Created by createTable().
var tds = [];
var indexInHand;  // The index of the item on the boad 'in hand' - being moved.
var indexHover;  // The index which the user is hovering over
var displayState;  // The state which is being displayed

// Draw the chess board when the page loads
document.addEventListener("DOMContentLoaded", () => {
  setupDisplay();
  display(initialState, false);
}, false);

function setupDisplay(){
  createTable();
  document.body.addEventListener("click", () => releaseIndexInHand());
}

/* Add a HTML table the same size as the board.
 * Populate a global list of tds which is the same order as the board string. */
function createTable(){
  let table = document.createElement("table");
  for(let rank = BOARD_SIDE; rank > 0; rank --){
    let tr = document.createElement("tr");
    for(let file = 1; file <= BOARD_SIDE; file ++){
      let td = document.createElement("td");
      // Can't use var to track index, must use let - otherwise callback
      // functions fail..
      let index = getIndex(file, rank);
      // On click, put this piece in the hand...
      // TODO: What if there is already something in the hand?
      td.addEventListener("click", (e) => {
        setIndexInHand(index);
        e.stopPropagation();  // Hide from body which removes indexInHand
      });
      td.addEventListener("mouseover", () => setIndexHover(index));
      tr.appendChild(td);
      tds.push(td);
    }
    table.appendChild(tr);
  }
  document.body.appendChild(table);
  table.addEventListener("mouseout", () => releaseIndexHover());
}

/* Fills the HTML board with a given state */
function displayBoard(state){
  tds.forEach((td, index) => td.innerHTML = toUnicode[state[index]]);
}

/* Setter for the indexInHand global, also updating the display */
function setIndexInHand(index){
  indexInHand = index;
  display();  // update the display
}

/* Remove the indexInHand global, updating the display */
function releaseIndexInHand(){
  indexInHand = false;
  display();
}

/* Set index indexHover globally. Update display */
function setIndexHover(index){
  indexHover = index;
  display();
}

/* Remove indexHover globally. Update display */
function releaseIndexHover(){
  indexHover = false;
  display();
}

/* Print a readable state string to the console */
function printState(state){
  for(let rank = BOARD_SIDE; rank > 0 ; rank --)
    // Step through the ranks from 8 -> 1 (order of state string)
    console.log("" + rank + " " +
                state.substr((BOARD_SIDE - rank) * BOARD_SIDE, BOARD_SIDE));
  console.log("  12345678");
  console.log((isWhiteToPlay(state) ? "White" : "Black") + " to play");
  if (canWCastleQ(state)) console.log("White can castle queenside");
  if (canWCastleK(state)) console.log("White can castle kingside");
  if (canBCastleQ(state)) console.log("Black can castle queenside");
  if (canBCastleK(state)) console.log("Black can castle kingside");
  const enPass = getEnPassant(state);
  if (enPass)
    console.log(`En Passant allows moving to ${enPass}`);
  else
    console.log("No En Passant");
  console.log(`Had ${getCounter(state)} moves since ` +
              `capture or pawn advance`);
  if(indexInHand)
    console.log(`In hand we have: ${indexInHand}`);
}

/* Updates the display with the current state and piece in hand */
function display(){
  // Use the global displayState if it's avaliable, else use initialState.
  let state = displayState || initialState;
  // Set the only td which is 'inHand'
  Array.prototype.forEach.call(tds, (td, index) => {
      if(index === indexInHand)
        td.classList.add("inHand");
      else
        td.classList.remove("inHand");
      if(index === indexHover)
        td.classList.add("hover");
      else
        td.classList.remove("hover");
    }
  );
  displayBoard(state);
}
