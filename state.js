"use strict;";

/* This file provides functions to manipulate the state string for the chessAI
 * - the starting string state `initialState`
 * - functions to abstract reading data from the state. For example, who is
     to play next?
 * - functions to check what piece is in a specific square.
 * - functions to convert between index and (file, rank)
 * - function to update the state after a move. */

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

/* The start of the game saved as a state */
const initialState = "rnbqkbnr" + // Rank 8  (black)
  "pppppppp" + // Rank 7
  "........" + // Rank 6
  "........" + // Rank 5
  "........" + // Rank 4
  "........" + // Rank 3
  "PPPPPPPP" + // Rank 2
  "RNBQKBNR" + // Rank 1  (white)
  WHITE_TO_PLAY + //  white to move next
  "1111" + //  all castling is intially posible
  ".." + // No en passant square
  "00"; // No moves since pawn advance or capture

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
const isWhite = (char) => char == char.toUpperCase(); // Could be empty!

/* Convert between the two coordinate systems: index[0, 63] and (file, rank)
 * ([1, 8], [1, 8]) */
const getIndex = (file, rank) => (BOARD_SIDE - rank) * BOARD_SIDE + file - 1;
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
 * TODO: Castling isn't updated here! */
function updateState(oldState, moves, newPiece) {
  // Start with the castle flags as they were before, turn them off later if
  // the rook or the king moves...
  let WCastleQ = canWCastleQ(oldState);
  let WCastleK = canWCastleK(oldState);
  let BCastleQ = canBCastleQ(oldState);
  let BCastleK = canBCastleK(oldState);
  // Start with no enpassant move, if we move a pawn by two then replace
  // this.
  let enPassant = EMPTY + EMPTY;
  // Assume there is no capture or pawn advance until we find one.
  // This is used for updating the counter in the new state.
  let captureOrAdvance = false;
  // Get the new board by applying the moves
  var board = oldState;
  for (let [oldIndex, newIndex] of moves) {
    if (isPawn(oldState[oldIndex])) {
      // If moving a pawn, this is a pawn advance
      captureOrAdvance = true;
      const [oldFile, oldRank] = getFileRank(oldIndex);
      const [newFile, newRank] = getFileRank(newIndex);
      // If the pawn moves by 2 then set the enpassant to be the square
      // that they could move by one (aka the midpoint).
      if (Math.abs(oldRank - newRank) == 2 && oldFile == newFile)
        enPassant = "" + getFile(oldIndex) + (oldRank + newRank) / 2;
      // If moving between files then this is a pawn capture.
      // If this is also a move to the en passant square then we need to remove
      // a pawn that jumped over this square last move.
      const stateEnPassant = getEnPassant(oldState);
      if (oldFile != newFile && stateEnPassant &&
        stateEnPassant[0] == newFile && stateEnPassant[1] == newRank) {
        let removeIndex = getIndex(newFile, oldRank);
        board = (board.substr(0, removeIndex) + EMPTY +
          board.substring(removeIndex + 1, BOARD_SIZE));
        captureOrAdvance = true;
      }
    }
    // If the new index isn't empty then there is a capture
    if (!isEmpty(oldState[newIndex])) captureOrAdvance = true;
    // Move the piece in the board
    if (newIndex < oldIndex)
      board = (board.substr(0, newIndex) + board[oldIndex] +
        board.substring(newIndex + 1, oldIndex) + EMPTY +
        board.substring(oldIndex + 1, BOARD_SIZE));
    else
      board = (board.substr(0, oldIndex) + EMPTY +
        board.substring(oldIndex + 1, newIndex) + board[oldIndex] +
        board.substring(newIndex + 1, BOARD_SIZE));
  }
  // Do pawn promotions
  if (newPiece) {
    const [index, char] = newPiece;
    board = board.substr(0, index) + char + board.substr(index + 1);
  }
  // Build and return a new state string.
  const whoToPlay = isWhiteToPlay(oldState) ? BLACK_TO_PLAY : WHITE_TO_PLAY;
  const counter = captureOrAdvance ? "00" : getCounter(oldState) + 1;
  return board + whoToPlay +
    getCastleChar(WCastleQ) + getCastleChar(WCastleK) +
    getCastleChar(BCastleQ) + getCastleChar(BCastleK) +
    enPassant + counter;
}
