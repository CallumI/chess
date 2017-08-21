/* jshint esversion: 6 */

/*
 * This file provides functions to manipulate the state string for the chessAI
 */

// Initial variables, mainly for readablity rather than adaptability
const BOARD_SIDE = 8;
const BOARD_SIZE = BOARD_SIDE * BOARD_SIDE;

/*
 * A state string is:
 * 64 Chars:
 *   Start with rank 8, end with rank 1   (white's perspective)
 *   Start with file a=1, end with rank h=8
 *   PNBRQK for white pieces
 *   pnbrqk for black pieces
 *   . for empty square
 * 1 Char:
 *   w or b for who to move next
 * 4 Char:
 *   Castling ability X (only based on 'has stuff moved?'
 *                       not 'does this cross check')
 *   1 if: white can castle queenside
 *   1 if: white can castle kingside
 *   1 if: black can castle queenside
 *   1 if: black can castle kingside
 * 2 Char:
 *   xy is (file, rank) of the square for en passant
 *   eg, after a move e4, this would be set to "53" = e3
 *   .. if nothing moves
 * 2 Char:
 *   0 Padded move counter without capture or pawn advance
 */


 /* The start of the game saved as a state */
 const initialState = "rnbqkbnr" +  // Rank 8  (black)
                      "pppppppp" +  // Rank 7
                      "........" +  // Rank 6
                      "........" +  // Rank 5
                      "........" +  // Rank 4
                      "........" +  // Rank 3
                      "PPPPPPPP" +  // Rank 2
                      "RNBQKBNR" +  // Rank 1  (white)
                      "w" +  //  white to move next
                      "1111" +  //  all castling is intially posible
                      ".." +  // No en passant square
                      "00";  // No moves since pawn advance or capture

/* Print a readable state string to the console */
function printState(state){
  for(let rank = 8; rank > 0 ; rank --){
    // Step through the ranks from 8 -> 1 (order of state string)
    let row = "" + rank + " " + state.substr((8 - rank) * 8, 8);
    console.log(row);
  }
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
  console.log(`Had ${state.substr(BOARD_SIZE + 7, 2)} moves since ` +
              `capture or pawn advance`);
}

/* Basic functions to parse the state */
const isWhiteToPlay = (state) => state[BOARD_SIZE] == "w";
const canWCastleQ = (state) => state[BOARD_SIZE + 1] == "1";
const canWCastleK = (state) => state[BOARD_SIZE + 2] == "1";
const canBCastleQ = (state) => state[BOARD_SIZE + 3] == "1";
const canBCastleK = (state) => state[BOARD_SIZE + 4] == "1";
const getEnPassant = (state) => {
  if(state[BOARD_SIZE + 5] == ".")
    // If one is . then there is no enpassent square
    return false;
  else
    return [state[BOARD_SIZE + 5], state[BOARD_SIZE + 6]];
};

/* Checks what a board square contains */
const isEmpty = (char) => char == ".";
const isKing = (char) => char == "K" || char == "k";
const isQueen = (char) => char == "Q" || char == "q";
const isBishop = (char) => char == "B" || char == "b";
const isKnight = (char) => char == "N" || char == "n";
const isRook = (char) => char == "R" || char == "r";
const isPawn = (char) => char == "P" || char == "p";

/* Gets the index of a given coordinate (file[1-8], rank[1-8])*/
const getIndex = (file, rank) =>
  (BOARD_SIDE - rank + 1) * BOARD_SIDE + file + 1;

/* Convert [file, rank] to an index in a state string*/
const getFileRank = (index) =>
  [index % BOARD_SIDE + 1, 8 - (index / BOARD_SIDE >> 0)];

/* Gets the piece at a given file and rank */
const getPieceAt = (state, file, rank) =>
  state[convertFileRankToIndex(file, rank)];
