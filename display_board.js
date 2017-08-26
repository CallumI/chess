"use strict";

/* This file provides the HTML UI. All element creation is done here rather that in
 * the containing HTML script.
 * - unicode mapping from state piece character to HTML formatted unicode chess
 *   pieces
 * - DOM function to create a chessboard using a HTML table and update it
 * - Globals with set() and release() functions to keep track of the UI state
 * - function to print a state string to the console. */

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

// Instead of using document.getElementById(), create all elements in
// javascript and store them in this global object for easy, readable access.
var elements = {
  tds: [], // list of the tds that make up the board. Created by createTable().
  trs: [] // list of the trs of the board table
};
var indexInHand; // The index of the item on the boad 'in hand' - being moved.
var indexHover; // The index which the user is hovering over
var displayState; // The state which is being displayed

// Draw the chess board when the page loads
document.addEventListener("DOMContentLoaded", () => {
  setupDisplay();
  displayState = initialState;
  display();
}, false);

/* Do all the initial DOM setup. (*not* state specific). */
function setupDisplay() {
  loadHTMLElements();
  createTable();
  document.body.addEventListener("click", () => releaseIndexInHand());
}

/* Add a HTML table the same size as the board.
 * Populate a global list of tds which is the same order as the board string. */
function createTable() {
  let table = document.createElement("table");
  for (let rank = BOARD_SIDE; rank > 0; rank--) {
    let tr = document.createElement("tr");
    for (let file = 1; file <= BOARD_SIDE; file++) {
      // This inner loop steps through all the files and ranks, creates a td
      // for each and registers event listeners.
      let td = document.createElement("td");
      // Can't use var to track index, must use let - otherwise callback
      // functions don't get it passed into their scope.
      let index = getIndex(file, rank);
      td.addEventListener("click", (e) => {
        if (!indexInHand) // If nothing in hand, get this in hand
          setIndexInHand(index);
        else
          // If something already in hand and we can move there, do it!
          if (whereCanPieceMove(displayState, indexInHand).includes(index)) {
            displayState = updateState(displayState, [indexInHand, index]);
            // TODO: Pawn Promotion stuff
            releaseIndexInHand(); // We have put it down...
          }
        else releaseIndexHover(); // If we can't get there, release index
        // Hide this event from body which removes indexInHand when it recieves
        // click events.
        e.stopPropagation();
      });
      td.addEventListener("mouseover", () => setIndexHover(index));
      tr.appendChild(td);
      elements.tds.push(td);
    }
    table.appendChild(tr);
    elements.trs.push(tr);
  }
  elements.boardContainer.appendChild(table);
  elements.table = table;
  table.addEventListener("mouseout", releaseIndexHover);
}

/* Load the HTML elements into a global object. All the querySelector() calls are
 * made here. After this, all DOM interaction comes through the element object. */
function loadHTMLElements() {
  elements.whoToPlay = document.querySelector("#el_whoToPlay");
  elements.movesBeforeAdvance = document.querySelector("#el_movesBeforeAdvance");
  elements.boardContainer = document.querySelector("#el_boardContainer");
  elements.textState = document.querySelector("#el_textState");
  elements.stateCopy = document.querySelector("#el_stateCopy");
  elements.stateInCheck = document.querySelector("#el_stateInCheck");
  elements.stateCopy.addEventListener("click", () => {
    elements.textState.select();
    document.execCommand('copy');
  });
}

/* Fills the HTML board with a given state of pieces */
function setPiecesOnBoard(state) {
  elements.tds.forEach((td, index) => td.innerHTML = toUnicode[state[index]]);
}

/* Takes a string state and updates the information elements outside of the
 * board. */
function updateOtherInformation(state) {
  let toPlay = isWhiteToPlay(state) ? "White" : "Black";
  elements.whoToPlay.innerText = `${toPlay} to play next.`;
  elements.textState.value = state;
  elements.movesBeforeAdvance.innerText = ('Moves since pawn advance: ' +
    getCounter(state));
  elements.stateInCheck.innerText = isStateInCheck(state) ? "In check!" : "Not in check";
}

/* Set indexInHand if allowed, then update the display */
function setIndexInHand(index) {
  const piece = displayState[index];
  // Only set index in hand if this is a piece and its our own.
  if (!isWhiteToPlay(displayState) ^ isWhite(piece) && !isEmpty(piece)) {
    indexInHand = index;
    display(); // update the display
  }
}

/* Remove the indexInHand global, update display */
function releaseIndexInHand() {
  indexInHand = false;
  display();
}

/* Set index indexHover, update display */
function setIndexHover(index) {
  indexHover = index;
  display();
}

/* Remove indexHover, update display */
function releaseIndexHover() {
  indexHover = false;
  display();
}

/* Print a readable state string to the console */
function printState(state) {
  for (let rank = BOARD_SIDE; rank > 0; rank--)
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
  console.log(`Had ${getCounter(state)} moves since capture or pawn advance`);
  if (indexInHand)
    console.log(`In hand we have: ${indexInHand}`);
}

/* Updates the display with the current state and piece in hand */
function display() {
  // Use a smaller variable name for readability.
  let state = displayState;
  // If we have a piece in hand, or are hovering over a piece which is the same
  // side the state indicates is about to play then get some indicies of
  // possible moves to highlight. Otherwise, set this as an empty list so
  // nothing is shown.
  var pieceToFindMovesOf = indexInHand || indexHover;
  var moves = (pieceToFindMovesOf &&
      !isEmpty(state[pieceToFindMovesOf]) &&
      !(isWhite(state[pieceToFindMovesOf]) ^ isWhiteToPlay(state))) ?
    whereCanPieceMove(displayState, pieceToFindMovesOf) : [];
  // Go through each table element and add or remove classes based on
  // conditions.
  Array.prototype.forEach.call(elements.tds, (td, index) => {
    // Highlight indexInHand
    if (index === indexInHand) td.classList.add("inHand");
    else td.classList.remove("inHand");
    // Highlight indexHover
    if (index === indexHover) td.classList.add("hover");
    else td.classList.remove("hover");
    // Highlight potentialMove
    if (moves.includes(index)) td.classList.add("move");
    else td.classList.remove("move");
    // This square is interactable if:
    // 1) It is one of the current moves
    // 2) There is no piece in hand and its one of our pieces
    if (moves.includes(index) || (!indexInHand && !isEmpty(state[index]) &&
        !(isWhite(state[index]) ^ isWhiteToPlay(state))))
      td.classList.add("interactable");
    else td.classList.remove("interactable");
  });
  setPiecesOnBoard(state);
  updateOtherInformation(state);
}
