# Differences from the original

`reference/SCEARCH.BAS` defines the rules. Starting values, prices, damage, rates and ranges are kept
from it unless listed here. Line numbers refer to that file.

## Bugs fixed

Each of these is a typo or a logic slip with a clear intent.

| Line | Original behaviour | Remake |
| --- | --- | --- |
| 553 | A rocket hit *healed* fighter 1's shield (`+`) | Damages it |
| 1147 | `fitersdm` typo reset fighter 1's damage on each hit, so it could not be killed by lasers | Damage accumulates |
| 556 | `enbasdm` typo: rockets never damaged the enemy base hull | They do |
| 697-698 | `embasfr` typo: base frequency tracking used an empty variable | Tracks your shield frequency |
| 1128-1131 | Laser checked base and fighter 2 frequencies swapped | Each uses its own |
| 193-200 | Auto-frequency had the same swap | Same fix |
| 737, 739 | Fighter 1 checked `plmode = 0`, which never happens, so it was invisible and untargetable | Visible, targetable, shoots you when you are in view |
| 746-747 | `ftpry = xcoi` compared y with x | Compares properly |
| 744 | `fir` was never reset, so fighter 1 stopped firing after its first burst | Fires on its cycle |
| 777 | `mxfterfr2` typo meant fighter 2 could never hit your shield | Hits unless your shield is tuned above its max |
| 778 | `plsh - 75 + level`: higher levels did *less* damage | `-(75 + level)` |
| 817 | Comparing a counter with a fraction: the cruiser fired one volley and stopped, except at levels 4 and 8 | Rounded, so volleys repeat |
| 835 etc. | `cruisrerlv` typo | Uses the cruiser's level |
| 1119 | `cruisx` typo: a destroyed cruiser respawned in y only, and fell through to a second shield bonus | Respawns at the enemy base, one bonus |
| 1192-1193 | `RND + 48000` for `RND * 48000`: the new base always appeared at 24000,24000 | Random, at least 8000 from home |
| 937 | Miner arrival was commented out along with its sound, so it never delivered | Delivers (as SEARCH3.bas does) |
| 398-401, 210-215 | The speed-above-10 hack: after passing 10 you could not slow below 11 without a full stop | Plain clamp to the speed limit |
| 356 | Pressing `9` during re-acceleration left the panel state stuck at 4 | Returns to normal |
| 487, 495 | Earth's gravity flag never cleared, and the pull stayed on your velocity | Only applies in range |
| 1039-1040 | Hyperjump y limits wrote to x | Clamp each axis |
| 1304 etc. | Equipment charged $50 more than its price, and checked the listed price | Charges the listed price |
| 1315 | `beam = beam = 1` | Buying the beam works |
| 1423 | Borrowing again overwrote the debt, wiping it | Debts add up, $20,000 total limit |
| 1489, 1496 | Repaying reduced a second number, not the debt that charged interest, so a loan never ended | One debt figure, and repaying clears it |
| 1445 | A failed account application still flagged that account type | Only set on success |
| 1512 | Emptying savings cleared your *loan* flag | Removed |
| 336 | Cancelling a refit refunded the full price, even when nearly done | Refunds unused cycles |

## Finished features

These were marked "not in work" or could not be reached.

- **Tracer**: bought for $10,000. Shows enemies on the sector map, with arrows at the screen edge.
- **Tractor beam**: its menu (label 101) was unreachable and read a misspelled variable. `F` now sets a drag direction.
- **Auto repair**: the rule existed, but no menu could switch it on. It is now in Auto systems.
- **Rocket blast**: now also hits fighter 1 and the enemy base, which the blast list left out.

## Judgment calls

These go beyond a typo fix and change how the game plays. They are the ones most worth a second look.

- **Enemy frequency limits rise with each kill** (+1 for cruiser and hunter, +5 for the base). The source adds to the frequency but clamps it to a fixed maximum, so it never escalated, and one ship upgrade would have made you permanently immune.
- **Base turrets fire whenever a raider attacks.** Originally they only fired while the base was on screen, a side effect of the drawing check. The fire rate is kept as it played, every tick. The intended rate (`lsp = Not 10`, which is always false) could not beat the raider's shield regeneration.
- **Hazards use distance from the object.** The moon and Earth originally hurt you based on whether they overlapped the *window*. Earth keeps the original ranges of 1500 for gravity and 1000 for damage. The moon's 600 is the original's effective distance.
- **Target lock clears beyond 2000 units.** Originally it stayed until you pressed `Y`: you could shoot enemies at any range and could not dock while locked onto one far away.
- **Fighter 2 shield regen stays as written** (line 758 uses fighter 1's cap). It looks like a typo, but the "fix" makes it close to unkillable with starting lasers, so it stays.
- **Docking stays on until you leave.** Originally it dropped by itself when full, which also closed the shop, and set your speed limit to 0. `O` or thrust now leaves.
- **Switching the extra shield off is free.** It used to cost a whole extra shield.
- **Enemy base hits use the rate as it played** (every tick), because `lspe = Not 0` is never true.
- **The ship stretches at any heading.** Lines 499-518 only stretch it when moving straight along one axis, and diagonals become a single small circle. The remake rotates the same shape to face your direction, using the vertical version's proportions. It's also drawn 35% larger than true scale so the shape can be seen.

## Removed

- `G` battle stations: the original overwrote it every tick, so the key did nothing. The base still goes on alert by itself.
- `7` and `8` clear-screen keys: only needed because the original drew over itself.
- `0` rocket debug readout: replaced by the rocket status tag.
- Extra shield frequency: nothing ever read it.

## Added

- Arrow keys, `Space` to stop, and held keys repeat.
- `Tab` target lock. Without it, the nearest fighter always steals the lock and the base can't be shot.
- `N M V B` frequency tuning in flight (it was docked-only).
- `H` help, and an `Esc` pause menu.
- Sector map, target panel and labelled gauges.
- Autosave and Continue.
- Radio warnings for the force walls and Earth, which otherwise kill without explanation.

## Timing

The original had no fixed speed. Its `Sound 0, .5` rest suggests about 36 loops a second, and the remake
uses a fixed 30. All per-tick numbers are unchanged, so the game runs a little slower than that estimate.

## Kept on purpose

The secret parts are all still there: hyperdrive code `123123` / `321321`, the secret report, the cheat
menu behind it with `` ` ``, PIN backdoor `1221`, and `123123` meaning "all of it" at the bank. The game
also stays endless: destroying a base only brings a stronger one, as it did originally.
