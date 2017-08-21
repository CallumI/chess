/* jshint esversion: 6 */

/* This file deals with game logic... where can a piece move? */
// Castling is treated as a move for the king


function getPossibleNewStates(oldState){
  for(let i = 0 ; i < BOARD_SIZE; i++){
    // Step through each square on the board
    const [file, rank] = getFileRank(i);
    const piece = getPieceAt(oldState, file, rank);
    if (isEmpty(piece)) continue;


  }
}


function getNewStatesPawn(oldState, file, rank){
  const isWhite = isWhiteToPlay(oldState);
  if(isWhite){
    if(rank == 2){

    }
  }
}
