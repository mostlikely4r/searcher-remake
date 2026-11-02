# Reference — source of truth

These two files are the ground truth for the game rebuild. Do not modify them.

- **SCEARCH.BAS** — original game (spaghetti GoTo/labels, Dutch+English strings).
  Wash: defines *required behavior* (menus, mechanics, edge cases, autoshop interactions).
- **SEARCH3.bas** — mature refactor (56 SUBs, shared DIMs, near-full parity).
  Was: defines *intended structure* (systems, naming intent).
- **Where they disagree**: SCEARCH.BAS wins unless it is clearly a bug.
- `../archive/` holds superseded material (SEARCH2.bas, searchercom.bas, SCEARCH.txt, SCEARCH.exe) — not reference material, do not read for the rebuild.
- The detailed design lives in `../design/DESIGN.md` (maintained in a dedicated design session).
