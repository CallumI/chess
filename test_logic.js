"use strict;";

/* Can we play e3 */
function test_pawn_white_normal_advance() {
  let options = whereCanPieceAdvance(initialState, 52);
  if (!options.includes(44))
    throw Error("Test failed");
}

/* Can we play e4 */
function test_pawn_white_double_advance() {
  let options = whereCanPieceAdvance(initialState, 52);
  if (!options.includes(36))
    throw Error("Test failed");
}


/* Test normal pawn capture */
function test_normal_pawn_capture() {
  let testState = "rnbqkbnr" +
    "ppppp.pp" +
    "........" +
    ".....p.." +
    "....P..." +
    "........" +
    "PPPP.PPP" +
    "RNBQKBNR" +
    "w11115300";
  let options = whereCanPieceAdvance(testState, 36);
  if (!options.includes(29))
    throw Error("Test failed");
}


/* Can we capture with en passant? */
function test_enpassant() {
  let testState = "rnbqkbnr" +
    "ppppp.pp" +
    "........" +
    "........" +
    "P...Pp.." +
    "........" +
    ".PPP.PPP" +
    "RNBQKBNR" +
    "b11115300";
  let options = whereCanPieceAdvance(testState, 37);
  if (!options.includes(44))
    throw Error("Test failed");
}

/* Does a capture with en passant remove the extra piece? */
function test_enpassant_updateState() {
  let testState = "r.bqkbnrppppp.pp..n.........Pp..................PPPP.PPPRNBQKBNRw11116600";
  let newState = updateState(testState, [
    [getIndex(5, 5), getIndex(6, 6)]
  ], false);
  if (newState != "r.bqkbnrppppp.pp..n..P..........................PPPP.PPPRNBQKBNRb1111..00")
    throw Error("Test failed");
}

test_pawn_white_normal_advance();
test_pawn_white_double_advance();
test_normal_pawn_capture();
test_enpassant();
test_enpassant_updateState();
