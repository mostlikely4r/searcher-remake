# Searcher

A modern pixel-art remake of a QBasic space game written as a kid. Find the enemy base, destroy it,
and stay alive. It runs in a browser and has no asset files: all art and sound are generated in code.

## Play it

**Double-click `play.bat`**, or open `Searcher.html` in any modern browser. It's one self-contained
file, so nothing needs installing, and you can copy it anywhere.

**[Read the guide](docs/GUIDE.md)** to learn what's possible. The game explains very little by itself.

## The original

The game this all comes from is kept here too.

- `reference/SCEARCH.BAS`: the original, in all its GoTo glory.
- `reference/SEARCH3.bas`: a later restructured version.
- `archive/`: older versions, including `SCEARCH.exe`, the original compiled for Windows.

`docs/PARITY.md` lists every place the remake differs from the original, by line number.

## Develop it

```
npm install
npm run dev        # then open the printed localhost address
```

| Command | What it does |
| --- | --- |
| `npm test` | Runs the rules tests, including a bot that plays through to the first base kill |
| `npm run typecheck` | Type-checks without building |
| `npm run release` | Builds and updates `Searcher.html`. Run this before committing game changes |

## Controls

Press **H** in the game for the full list.

| Keys | Action |
| --- | --- |
| `W A D X`, `Q E Z C`, arrows | Thrust. Velocity stays until you change it |
| `S` or `Space` | Stop dead |
| `L` / `K` | Raise / lower the speed limit |
| `O`, then `I` | Dock at the ring, then open the station menu |
| `J` / `P` / `U` | Lasers / rocket launcher / extra shield |
| `Tab` / `Y` | Lock next target / clear the lock |
| `N M` / `V B` | Tune laser / shield frequency |
| `9` | Open or close the solar panels |
| `[` | Use an energy tank |
| `]` / `T` | Autopilot / hyperdrive |
| `5` | Status report |

## Layout

- `src/core`: the game rules. No drawing or browser code, so they can be tested headless and are deterministic for a seed.
- `src/render`: canvas drawing at 640x360, generated sprites, the bitmap font, the cockpit display.
- `src/ui`: menus and typed-input forms.
- `src/audio`: WebAudio sound effects.
- `tests`: rules tests and the playthrough bot.
- `reference`: the original BASIC sources, kept as the source of truth.
- `docs/PARITY.md`: every place the remake deliberately differs from the original, and why.
