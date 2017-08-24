"use strict;";

/* This file deals with game logic... where can a piece move? */
// Castling is treated as a move for the king

const max = Math.max;
const min = Math.min;

// TODO: THIS ISN'T IMPLEMENTED
function getPossibleNewStates(oldState){
  for(let i = 0 ; i < BOARD_SIZE; i++){
    // Step through each square on the board
    const [file, rank] = getFileRank(i);
    const piece = getPieceAt(oldState, file, rank);
    if (isEmpty(piece)) continue;


  }
}

/* The moves are a list of lists of vectors. Each inner list contains
 * all moves in a given direction... You can stop looking at the later
 * vectors when one impossible one is reached and move to the next inner list.
 * eg: Rook contains four lists: up, left, down, right.
 * Pawn is not given because it is colour specific and complex.
 */

const kingAllMoves = [
  [[-1,  1]], [[0,  1]], [[1,  1]],
  [[-1,  0]],            [[1,  0]],
  [[-1, -1]], [[0, -1]], [[1, -1]]
];

const rookAllMoves = [  // [L, R, D, U] = [Left, Right, Down, Up]
  [[-1,  0], [-2,  0], [-3,  0], [-4,  0], [-5,  0], [-6,  0], [-7,  0]],  // L
  [[ 1,  0], [ 2,  0], [ 3,  0], [ 4,  0], [ 5,  0], [ 6,  0], [ 7,  0]],  // R
  [[ 0, -1], [ 0, -2], [ 0, -3], [ 0, -4], [ 0, -5], [ 0, -6], [ 0, -7]],  // D
  [[ 0,  1], [ 0,  2], [ 0,  3], [ 0,  4], [ 0,  5], [ 0,  6], [ 0,  7]]   // U
];

const bishopAllMoves = [  // [L, R, B, T] = [Left, Right, Buttom, Top]
  [[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]],  // BL
  [[ 1, -1], [ 2, -2], [ 3, -3], [ 4, -4], [ 5, -5], [ 6, -6], [ 7, -7]],  // BR
  [[-1,  1], [-2,  2], [-3,  3], [-4,  4], [-5,  5], [-6,  6], [-7,  7]],  // TL
  [[ 1,  1], [ 2,  2], [ 3,  3], [ 4,  4], [ 5,  5], [ 6,  6], [ 7,  7]]   // TR
];

const knightAllMoves = [
             [[-1,  2]], [[1,  2]],
  [[-2,  1]],                       [[2,   1]],
  [[-2, -1]],                       [[2,  -1]],
             [[-1, -2]], [[1, -2]]
];

const queenAllMoves = Array.prototype.concat(rookAllMoves, bishopAllMoves);

/* Returns a list of possible new indexes from a single move of a piece.
 * This is every move except castling.
 * Doesn't deal with any possible checks ... that should be done later,
 * it probably requires calling this function */
function whereCanPieceAdvance(state, index) {
  const piece = state[index];
  const white = isWhiteToPlay(state);
  const [file, rank] = getFileRank(index);
  var movesToReturn = [];
  if(isPawn(piece)){
    // If white then pawns increase ranks, else decrease ranks
    const rankDirection = white ? 1 : -1;
    // Add the normal pawn advance, if the way is clear.
    if(isEmpty(state[getIndex(file, rank + rankDirection)]))
      movesToReturn.push(getIndex(file, rank + rankDirection));
    // Add the pawn advance by 2 if not moved yet
    const notMovedYet = (white && rank == 2) ||
                        (!white && rank == BOARD_SIDE - 1);
    if(notMovedYet && isEmpty(state[getIndex(file, rank + 2 * rankDirection)]))
      movesToReturn.push(getIndex(file, rank + 2 * rankDirection));
    // Add any potential captures
    const enPassant = getEnPassant(state);
    for(let fileOffset of [-1, 1]){  // Check diagonal left, then right
      const newFile = file + fileOffset;
      const newRank = rank + rankDirection;
      const newIndex = getIndex(newFile, newRank);
      const pieceToCapture = state[newIndex];
      // Capture a piece, moving to newIndex if:
      //   1) there is a current piece at newIndex AND its not on our side
      //   2) there is an en passant square in the state and we can move to it.
      if((!isEmpty(pieceToCapture) && white ^ isWhite(pieceToCapture)) ||
         (enPassant && enPassant[0] == newFile && enPassant[1] == newRank))
        movesToReturn.push(newIndex);
    }
    return movesToReturn;
  } else {
    let allMoves = false;
    if (isKing(piece))       allMoves = kingAllMoves;
    else if(isQueen(piece))  allMoves = queenAllMoves;
    else if(isBishop(piece)) allMoves = bishopAllMoves;
    else if(isKnight(piece)) allMoves = knightAllMoves;
    else if(isRook(piece))   allMoves = rookAllMoves;
    else throw TypeError("Unknown moves");
    for(let potentialPath of allMoves){
      for(let [df, dr] of potentialPath){
        const newFile = file + df;
        const newRank = rank + dr;
        if(newFile < 1 || newFile > BOARD_SIDE ||
           newRank < 1 || newRank > BOARD_SIDE)
          break;
        const newIndex = getIndex(file + df, rank + dr);
        const moveTo = state[newIndex];
        // Moving to an empty square is possible.
        if(isEmpty(moveTo))
          movesToReturn.push(newIndex);
        else {
          // It is also possible to capture a piece of the opposite colour
          if(white ^ isWhite(moveTo))
            movesToReturn.push(newIndex);
          // But this potential path is now exhausted, the next moves are
          // 'blocked' by this one...
          break;
        }
      }
    }
    return movesToReturn;
  }
}
