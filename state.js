/* jshint esversion: 6 */
"use strict;";

/*
 * This file provides functions to manipulate the state string for the chessAI
 */

// Initial variables, mainly for readablity rather than adaptability
const BOARD_SIDE = 8;
const BOARD_SIZE = BOARD_SIDE * BOARD_SIDE;

const EMPTY = ".";
const KING_W = "K";
const KING_B = "k";
const QUEEN_W = "Q";
const QUEEN_B = "q";
const BISHOP_W = "B";
const BISHOP_B = "b";
const KNIGHT_W = "N";
const KNIGHT_B = "n";
const ROOK_W = "R";
const ROOK_B = "r";
const PAWN_W = "P";
const PAWN_B = "p";

const WHITE_TO_PLAY = "w";
const BLACK_TO_PLAY = "b";

const CAN_CASTLE = "1";
const CANT_CASTLE = "0";

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
                      WHITE_TO_PLAY +  //  white to move next
                      "1111" +  //  all castling is intially posible
                      ".." +  // No en passant square
                      "00";  // No moves since pawn advance or capture

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
}

/* Basic functions to read from the state */
const isWhiteToPlay = (state) => state[BOARD_SIZE] == WHITE_TO_PLAY;
const canWCastleQ = (state) => state[BOARD_SIZE + 1] == CAN_CASTLE;
const canWCastleK = (state) => state[BOARD_SIZE + 2] == CAN_CASTLE;
const canBCastleQ = (state) => state[BOARD_SIZE + 3] == CAN_CASTLE;
const canBCastleK = (state) => state[BOARD_SIZE + 4] == CAN_CASTLE;
const getEnPassant = (state) => state[BOARD_SIZE + 5] == EMPTY ?
  false : [state[BOARD_SIZE + 5], state[BOARD_SIZE + 6]];
const getCounter = (state) => parseInt(state.substr(BOARD_SIZE + 7, 2));
const getCastleChar = (bool) => bool ? CAN_CASTLE : CANT_CASTLE;
/* Functions to check piece strings */
const isEmpty = (char) => char == EMPTY;
const isKing = (char) => char == KING_W || char == KING_B;
const isQueen = (char) => char == QUEEN_W || char == QUEEN_B;
const isBishop = (char) => char == BISHOP_W || char == BISHOP_B;
const isKnight = (char) => char == KNIGHT_W || char == KNIGHT_B;
const isRook = (char) => char == ROOK_W || char == ROOK_B;
const isPawn = (char) => char == PAWN_W || char == PAWN_B;
const isWhite = (char) => char == char.toUpperCase();  // Could be empty!

/* Gets the index of a given coordinate (file[1-8], rank[1-8])*/
const getIndex = (file, rank) =>
  (BOARD_SIDE - rank) * BOARD_SIDE + file - 1;

/* Convert [file, rank] to an index in a state string*/
const getFile = (index) => index % BOARD_SIDE + 1;
const getRank = (index) => BOARD_SIDE - (index / BOARD_SIDE >> 0);
const getFileRank = (index) => [getFile(index), getRank(index)];

/* Gets the piece at a given file and rank */
const getPieceAt = (state, file, rank) => state[getIndex(file, rank)];

/* Take an old state string, apply new moves and update with new pieces to
 * create a new state string.
 *
 * moves: an array of [[oldIndex, newIndex], ...]. There is normally one
 *        move but there are two in castling.
 * newPiece: if promoting a pawn then [index, newChar] else false
 * TODO: What if there is an enpassant capture, where is it removed? */
function updateState(oldState, moves, newPiece){
  // Start with the castle flags as they were before, turn them off later if
  // the rook or the king moves...
  let WCastleQ = canWCastleQ(oldState);
  let WCastleK = canWCastleK(oldState);
  let BCastleQ = canBCastleQ(oldState);
  let BCastleK = canBCastleK(oldState);
  // Start with no enpassant move, if we move a pawn by two then update.
  let enPassant = EMPTY + EMPTY;
  // Set this to true if this is a pawn advance or there is a capture
  let captureOrAdvance = false;
  // Get the new board by applying the moves
  var board = oldState;
  for(let [oldIndex, newIndex] of moves){
    if(isPawn(oldState[oldIndex])){
      // If moving a pawn, this is a pawn advance
      captureOrAdvance = true;
      const oldRank = getRank(oldIndex);
      const newRank = getRank(newIndex);
      if (Math.abs(oldRank - newRank) == 2)
        // If the pawn moves by 2 then set the enpassant to be the square
        // that they could move by one (aka the midpoint).
        // It is assumed that getFile(oldIndex) == getFile(newIndex)
        enPassant = "" + getFile(oldIndex) + (oldRank + newRank) / 2;
    }
    // If the new index isn't empty then there is a capture
    if(! isEmpty(newIndex)) captureOrAdvance = true;
    // Move the piece in the board
    if(newIndex < oldIndex)
      board = board.substr(0, newIndex) +
              board[oldIndex] +
              board.substring(newIndex + 1, oldIndex) +
              EMPTY +
              board.substring(oldIndex + 1, BOARD_SIZE);
    else
      board = board.substr(0, oldIndex) +
              EMPTY +
              board.substring(oldIndex + 1, newIndex) +
              board[oldIndex] +
              board.substring(oldIndex + 1, BOARD_SIZE);
  }
  // Do pawn promotions
  if (newPiece){
    const [index, char] = newPiece;
    board = board.substr(0, index) + char + board.substr(index + 1);
  }
  return board +
         (isWhiteToPlay(oldState) ? BLACK_TO_PLAY : WHITE_TO_PLAY) +
         getCastleChar(WCastleQ) + getCastleChar(WCastleK) +
         getCastleChar(BCastleQ) + getCastleChar(BCastleK) +
         enPassant + (captureOrAdvance ? "00" : getCounter(oldState) + 1);
}
