/* jshint esversion: 6 */

/* This file deals with game logic... where can a piece move? */
// Castling is treated as a move for the king
const max = Math.max;
const min = Math.min;

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

const rookAllMoves = [
  [[-1,  0], [-2,  0], [-3,  0], [-4, 0], [-5, 0], [-6, 0], [-7, 0]],
  [[ 1,  0], [ 2,  0], [ 3,  0], [ 4, 0], [5, 0], [6, 0], [7, 0]],
  [[ 0, -1], [ 0, -2], [ 0, -3], [ 0, -4], [0, -5], [0, -6], [0, -7]],
  [[ 0,  1], [ 0,  2], [ 0,  3], [ 0,  4], [0,  5], [0,  6], [0,  7]]
];

const bishopAllMoves = [
  [[-1, -1], [-2, -2], [-3, -3], [-4, -4], [-5, -5], [-6, -6], [-7, -7]],
  [[ 1, -1], [ 2, -2], [ 3, -3], [ 4, -4], [ 5, -5], [ 6, -6], [ 7, -7]],
  [[-1,  1], [-2,  2], [-3,  3], [-4,  4], [-5,  5], [-6,  6], [-7,  7]],
  [[ 1,  1], [ 2,  2], [ 3,  3], [ 4,  4], [ 5,  5], [ 6,  6], [ 7,  7]]
];

const knightAllMoves = [
  [[1, 2]], [[-1,  2]], [[1, -2]], [[-1, -2]],
  [[2, 1]], [[ 2, -1]], [[-2, 1]], [[-2, -1]]
];

const queenAllMoves = Array.prototype.concat(knightAllMoves, bishopAllMoves);
