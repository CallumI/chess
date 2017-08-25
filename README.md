# ChessAI

A Javscript chess AI with a simple user interface to challenge it.

## State String

A state string is made up of:
- 64 Chars: Board Pieces
   * Start with rank 8, end with rank 1 (from white's perspective)
   * Start with file a=1, end with rank h=8
   * `PNBRQK` for white pieces
   * `pnbrqk` for black pieces
   * `.` for empty square
- 1 Char: Who is to play?
   * `w` or `b` for who to move next
- 4 Char Castling ability X
   * (only based on 'has stuff moved?' not 'does this cross check')
   * `1` if: white can castle queenside
   * `1` if: white can castle kingside
   * `1` if: black can castle queenside
   * `1` if: black can castle kingside
- 2 Char: En Passant
   * `xy` is (file, rank) of the square for en passant
   * eg, after a move e4, this would be set to "53" = e3
   * `..` if nothing moves
- 2 Char: Move counter without capture or pawn advance
   * 0 Padded if only one char
