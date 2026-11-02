0
SCREEN 12                                            :: Set the screen to high-resolution graphics mode (VGA, 640x480, 16 colors).
'ship possesions
LET laser = 1 'check,OK                             :: Player has the Laser weapon (1=Yes).
LET roketlan = 1 'check,OK                           :: Player has the Rocket Launcher (1=Yes).
LET autoride = 1 'check,OK                          :: Auto-Pilot system is available (1=Yes).
LET hiperdrive = 1 'check,OK                        :: Hyperdrive system is available (1=Yes).
LET autorep = 0 'OK                                 :: Auto-Repair system is off (0=Off).
LET autolas = 0 'OK                                 :: Auto-Laser system is off.
LET autorok = 0 'OK                                 :: Auto-Rocket system is off.
LET tracer = 0 'not in work                         :: Tracer system status (not implemented).
LET beam = 0                                         :: Beam weapon status (0=Off).
LET autobeam = 0                                     :: Auto-Beam weapon status (0=Off).
LET multicom = 0 'not in work                       :: Multicom system status (not implemented).
LET autorefuel = 0 'OK                              :: Auto-Refuel system is off.
LET dok2 = 0                                         :: Docking/Transaction flag (0=Not in selling mode).
'positions and places
LET lasfr = 1                                        :: Laser fire rate counter, starts at 1.
LET pldm = 0                                         :: Player damage count (0=No damage).
LET en = 0                                           :: Enemy target selector (0=None selected).
LET mxlasfr = 10                                     :: Max laser fire rate (cooldown limit).
LET beamfr = 1                                       :: Beam fire rate counter.
LET mxbeamfr = 10                                    :: Max beam fire rate (cooldown limit).
LET shfr = 1                                         :: Shield regeneration/fire rate counter.
LET mxshfr = 10                                      :: Max shield regeneration rate.
LET cruiserfr = 5                                    :: Cruiser fire rate/reload time (in frames).
LET fiterfr = 10                                     :: Fighter 1 fire rate.
LET fiterfr2 = 9                                     :: Fighter 2 fire rate.
LET enbasfr = 20                                     :: Enemy base fire rate.
LET mxcruiserfr = 11                                 :: Max cruiser fire rate limit.
LET mxfiterfr2 = 11                                  :: Max Fighter 2 fire rate limit.
LET mxenbasfr = 25                                   :: Max enemy base fire rate limit.
LET exshfr = 1                                       :: Extra shield fire rate counter.
LET mxexshfr = 10                                    :: Max extra shield fire rate.
LET dok = 0                                          :: Docking status (0=Not docked).
LET moon = 1                                         :: Moon status (1=Present/Alive).
LET earth = 1                                        :: Earth status (1=Present/Alive).
LET exsha = 1                                        :: Extra shield capacity counter.
LET tor = 1                                          :: Torpedo status (1=Ready/Available).
LET batst = 0                                        :: Battery status (0=Off or low charge).
LET fiterlv = 1                                      :: Fighter 1 level.
LET fiterlv2 = 1                                     :: Fighter 2 level.
LET torx = 325                                       :: Torpedo X-coordinate (initial position or offset).
LET cruiserlv = 1                                    :: Cruiser level.
LET enbaslv = 1                                      :: Enemy base level.
LET exshl = 1                                        :: Extra shield level.
LET trsen = 0                                        :: Transmit sensor value (cooldown for beaming/teleport).
LET min = 0                                          :: Game minute counter.
LET heer = 2                                         :: Game day/hour counter.
LET mon = 6                                          :: Game month counter.
LET jaar = 2022                                      :: Game year counter.
LET laserlv = 1                                      :: Laser weapon level.
LET enpro = 1                                        :: Energy consumption multiplier/Energy production factor.
LET fiter2 = 1                                       :: Fighter 2 status (1=Active).
LET cruisersh = 600                                  :: Cruiser shield points.
LET cruiserdm = 0                                    :: Cruiser damage taken counter.
LET cruiser = 1                                      :: Cruiser status (1=Active).
LET autodef = 1                                      :: Auto-Defense system status (1=Active).
LET fiter = 1                                        :: Fighter 1 status (1=Active).
LET roket = 5                                        :: Number of Rockets/Torpedoes owned.
LET enscl = 1                                        :: Energy scale factor for HUD drawing.
LET shscl = 1                                        :: Shield scale factor for HUD drawing.
LET fiterx = -6000                                   :: Fighter 1 starting X coordinate.
LET fitery = 3532                                    :: Fighter 1 starting Y coordinate.
LET cerdit = 200000                                  :: Player's current credits/money.
LET fiterx2 = 6000                                   :: Fighter 2 starting X coordinate.
LET fitery2 = -5532                                  :: Fighter 2 starting Y coordinate.
LET kiz = 1                                          :: Unknown flag (initialized to 1).
LET energy = 400                                     :: Player's current energy/fuel.
LET roketlv = 1                                      :: Rocket/Torpedo level.
LET lsenbsh = 600                                    :: Last recorded Enemy Base Shield health.
LET lscruisersh = 600                                :: Last recorded Cruiser Shield health.
LET lsfitersh = 200                                  :: Last recorded Fighter 1 Shield health.
LET lsfitersh2 = 800                                 :: Last recorded Fighter 2 Shield health.
LET xwin = 930                                       :: Right boundary of the visible screen (window X max).
LET ywin = 500                                       :: Top boundary of the visible screen (window Y max).
LET xwin2 = -70                                      :: Left boundary of the visible screen (window X min).
LET plmode = 2                                       :: Player mode (2=Normal flight/combat mode).
LET ywin2 = -500                                     :: Bottom boundary of the visible screen (window Y min).
LET cruiserx = -9000                                 :: Cruiser starting X coordinate.
LET cruisery = 8000                                  :: Cruiser starting Y coordinate.
LET mxsp = 10                                        :: Player's maximum speed.
LET enbasx = 24121                                   :: Enemy Base X coordinate.
LET enbasy = -18000                                  :: Enemy Base Y coordinate.
LET enbas = 1                                        :: Enemy Base status (1=Active).
LET xcoi = 430                                       :: Player's current X coordinate.
LET ycoi = 0                                         :: Player's current Y coordinate.
LET earx = -20000                                    :: Earth X coordinate.
LET eary = 0                                         :: Earth Y coordinate.
LET fuelt = 3                                        :: Number of Fuel Tanks/Repair kits owned.
LET plsh = 200                                       :: Player's current Shield points.
LET bssh = 200                                       :: Base Shield health.
LET bsen = 400                                       :: Base Energy/Fuel.
LET fiterdm = 0                                      :: Fighter 1 damage taken counter.
LET fitersh = 200                                    :: Fighter 1 shield points.
LET fiterdm2 = 0                                     :: Fighter 2 damage taken counter.
LET fitersh2 = 200                                   :: Fighter 2 shield points.
LET en = 0                                           :: Enemy target selector (redundant, re-initialized).
LET bsdm = 0                                         :: Base damage taken counter.
LET enbsdm = 0                                       :: Enemy Base damage taken counter.
LET enbsh = 600                                      :: Enemy Base shield points.
LET shplv = 4                                        :: Ship level (affects stats/regen rates).
LET roklv = 1                                        :: Rocket Level (redundant, re-initialized).
LET mxsh = plsh                                      :: Max shield points, initialized to current shield.
LET mxen = 600                                       :: Max energy points.

GOTO 2                                               :: Jump to the start of the main game loop (line 2, not included in snippet).

1                                                    :: --- Auto-Pilot Movement Logic ---
IF gur <> 1 THEN GOTO 83                              :: If Auto-Pilot is not active (gur=Guide/Auto-Ride flag), skip this block.
IF xgo < xcoi THEN LET mvx = -spgo                   :: If target X is left of player, set X velocity (mvx) to negative speed (spgo).
IF ygo < ycoi THEN LET mvy = -spgo                   :: If target Y is below player, set Y velocity (mvy) to negative speed.
IF xgo > xcoi THEN LET mvx = spgo                    :: If target X is right of player, set X velocity to positive speed.
IF ygo > ycoi THEN LET mvy = spgo                    :: If target Y is above player, set Y velocity to positive speed.
IF xgo = xcoi AND ycoi = ygo THEN LET gur = 0        :: If player reaches the target coordinates, turn Auto-Pilot off.

83                                                   :: --- Commander Response System Check ---
IF respst = 1 THEN GOTO 74                           :: If the response system is suppressed (respst=1), skip directly to game logic.
'responce'
LET come = come + 1                                  :: Increment the response message timer/frame counter.
LOCATE 1, 1                                          :: Set cursor to row 1, column 1 (for printing messages).
IF go = 1 THEN LET gotime = come + 4: LET go = 0     :: If a new message is flagged (go=1), set its display duration (4 frames) and reset flag.
IF gotime = come THEN LET cl = 1                     :: If display time is up, set flag to clear the message.
IF cl = 1 THEN LINE (xwin, ywin)-(xwin2, ywin - 70), 0, BF: LET cl = 0 :: Clear the message area (top of screen) by drawing a black box. Reset clear flag.
IF come = 1 THEN LET cl = 1                          :: Clear the screen area on the very first frame of the message cycle.
IF come = 2 THEN PRINT "This is your commander speaking" :: Print the first part of the commander's message.
IF come = 6 THEN LET cl = 1                          :: Clear the screen area after 6 frames.
IF come = 7 THEN PRINT "You orders are to wait until your tank is full" :: Print a message about waiting for max fuel.
IF come = 11 THEN LET cl = 1                         :: Clear the screen area after 11 frames.
IF come = 12 THEN PRINT "there are no enemies spoted near you" :: Print a message about no nearby enemies.
IF come = 16 THEN LET cl = 1                         :: Clear the screen area after 16 frames.
IF stp = 1 AND mi = 0 AND come > 20 THEN PRINT "your first mission is to lokate the enemy base!": LET go = 1: LET mi = 1 :: If mission started (stp=1) and mission 1 not started (mi=0), prompt the player to find the enemy base and set message flags.
IF xcoi < 900 AND ycoi < 900 AND xcoi > -900 AND ycoi > -900 THEN LET ghn = 1 ELSE IF stp = 0 AND energy < mxen - 10 THEN PRINT "you are not ready to go!,Return to base": LET go = 1 :: If near base AND mission not started AND energy low, tell player to return to base.
IF energy > mxen - 10 AND xcoi < 900 AND ycoi < 900 AND xcoi > -900 AND ycoi > -900 THEN PRINT "You are ready to go now,lift of at wil": LET go = 1: LET stp = 1 :: If near base AND high energy, tell player to launch and start mission (stp=1).
IF energy < mxen / 4 AND stp = 1 THEN PRINT "!!YOUR energy is low refuel atonce!!": LET go = 1 :: If energy is critically low (under 25%) AND mission started, issue a warning.
IF plsh < mxsh / 4 AND zus = 0 THEN PRINT "!!YOUR SHIELD IS LOW!!": LET go = 1 :: If shield is critically low AND not docking, issue a shield warning.
IF cruiserx < 1000 + xwin AND cruiserx > xwin2 - 1000 AND cruisery < 1000 + ywin AND cruisery > ywin2 - 1000 THEN PRINT "there is a enemy cruiser spoted near you ": LET go = 1 :: If Cruiser is within 1000 units of the visible screen area, issue a warning.
IF fiterx2 < 1000 + xwin AND fiterx2 > xwin2 - 1000 AND fitery2 < 1000 + ywin AND fitery2 > ywin2 - 1000 THEN PRINT "there is a enemy fiter spoted near you ": LET go = 1 :: If Fighter 2 is nearby, issue a warning.
IF fiterx < 1000 + xwin AND fiterx > xwin2 - 1000 AND fitery < 1000 + ywin AND fitery > ywin2 - 1000 THEN PRINT "there is a enemy fiter spoted near you ": LET go = 1 :: If Fighter 1 is nearby, issue a warning.
IF roket < 3 AND roket > 1 AND fo = 0 THEN PRINT "you are running out of foton torpedos": LET go = 1: LET fo = 0 ELSE LET fo = 1 :: If Rockets are low (1 or 2), issue a warning (fo=Foton Torpedo flag).
IF roket < 1 AND fol = 0 THEN PRINT "you lost all you foto torpedos ": LET go = 1: LET fol = 0 ELSE LET fol = 1 :: If Rockets are empty, issue a warning (fol=Foton Torpedo Loss flag).
IF fo = 0 AND wa = 0 THEN LET wa = come + 40: LET fo = 1 :: If low rocket warning is active, start a wait timer (wa) for 40 frames.
IF fol = 0 AND wa = 0 THEN LET wa = come + 40: LET fol = 1 :: If empty rocket warning is active, start a wait timer.
IF wa = come THEN LET fol = 0: LET fo = 0: LET wa = 0 :: If wait timer is up, reset all rocket warning flags.
IF fuelt < 3 AND fuelt > 1 AND fu = 1 THEN PRINT "you are running out of fueltanks ": LET go = 1: LET fu = 0 ELSE LET fu = 1 :: If Fuel Tanks are low, issue a warning (fu=Fuel flag).
IF fuelt < 1 AND ful = 1 THEN PRINT "you lost all you fueltanks ": LET go = 1: LET ful = 0 ELSE LET ful = 1 :: If Fuel Tanks are empty, issue a warning (ful=Fuel Loss flag).
IF fu = 0 AND wa = 0 THEN LET wa = come + 40: LET fu = 1 :: If low fuel warning is active, start a wait timer.
IF ful = 0 AND wa = 0 THEN LET wa = come + 40: LET ful = 1 :: If empty fuel warning is active, start a wait timer.
IF wa = come THEN LET ful = 0: LET fu = 0: LET wa = 0 :: If wait timer is up, reset all fuel warning flags.

74                                                   :: --- Time and Environment Update ---
LET cruiser = 1                                      :: Ensure Cruiser is active (status check/reset).
LET enbas = 1                                        :: Ensure Enemy Base is active.
LET fiter = 1                                        :: Ensure Fighter 1 is active.
LET fiter2 = 1                                       :: Ensure Fighter 2 is active.
LET min = min + 1                                    :: Increment the game minute counter.
IF min = 24 THEN LET heer = heer + 1                 :: If 24 minutes passed, increment the day/hour counter.
IF min > 24 THEN LET min = 0                         :: Reset minute counter after 24.
IF heer > 30 THEN LET heer = 1: LET mon = mon + 1    :: If 30 days/hours passed, reset day counter and increment month.
IF mon = 13 THEN LET mon = 1: LET jaar = jaar + 1    :: If 12 months passed, reset month and increment year.
IF leen = 1 THEN GOTO 68                             :: If 'leen' (loan/borrow) flag is 1, jump to loan interest calculation.
GOTO 69                                              :: If no loan, skip loan interest.

68                                                   :: --- Loan Interest Payment ---
IF min = 0 THEN GOTO 73                              :: Only apply interest at the start of the "day" (min=0).
GOTO 69                                              :: If not minute 0, skip to the next section.

73
LET lenbed = lenbed + (lenbed * .05)                 :: Increase loan amount (`lenbed`) by 5% interest (increases loan).
LET cerdit = cerdit - (lenbed * .05)                 :: Deduct interest (5% of loan) from player's credits.
LET lenbed = lenbed - (lenbed * .05)                 :: Decrease loan amount by 5% (cancels the previous increase).
IF cerdit < 1 THEN LET plsh = plsh - (mxsh * .5)     :: If player runs out of credits, severely damage the player's shield (50% max shield).

69
IF rekrek = 1 THEN GOTO 70                           :: If 'rekrek' (banking/account check) flag is 1, jump to account maintenance.
GOTO 71                                              :: If no account check, skip to regeneration calculation.

70                                                   :: --- Account/Banking Maintenance ---
IF heer = 3 AND min = 0 THEN GOTO 72                 :: Only perform this check on day/hour 3 at minute 0.
GOTO 71                                              :: If not the designated time, skip.

72
IF rekening(1) = 1 THEN LET gespbed = gespbed + (gespbed * .05) :: If account feature 1 is active, increase 'gespbed' (spent amount?) by 5%.
IF rekening(2) = 1 THEN LET gespbed = gespbed + 200  :: If account feature 2 is active, increase 'gespbed' by 200.
IF rekening(3) = 1 THEN LET gespbed = gespbed + (gespbed * .1)  :: If account feature 3 is active, increase 'gespbed' by 10%.
IF rekening(4) = 1 THEN LET gespbed = gespbed + (gespbed * .15) :: If account feature 4 is active, increase 'gespbed' by 15%.
IF rekening(5) = 1 THEN LET gespbed = gespbed + (gespbed * .3)  :: If account feature 5 is active, increase 'gespbed' by 30%.

71                                                   :: --- Regeneration and Enemy Targeting Setup ---
LET enpro = 4 / shplv                                :: Recalculate energy consumption/production factor based on ship level.
LET temx = temx + 1                                  :: Increment a temporary counter/timer for drawing.
IF temx = 1 THEN LET en = 0                          :: At temx=1, ensure no enemy is targeted.
IF temx = 2 THEN LET en = 0                          :: At temx=2, ensure no enemy is targeted.
IF temx = 100 THEN LET en = 0                         :: At temx=100, ensure no enemy is targeted.
IF temx = 1000 THEN LET en = 0                        :: At temx=1000, ensure no enemy is targeted.
IF xcoi < s + 20 AND xcoi > s - 20 AND ycoi < t + 20 AND ycoi > t - 20 THEN GOTO 2 :: If player is near the coordinates (s,t), loop back to the start (GOTO 2, which is the main loop).
LINE (s + 60, t + 60)-(s - 60, t - 60), 0, BF        :: Erase a large box around the (s,t) coordinates (a temporary graphical element).
LINE (s + 20, t + 20)-(s - 20, t - 20), 14, BF       :: Draw a smaller box around (s,t) in bright yellow.
LET temp = temp - 5                                  :: Decrease a temporary value (used for graphical effect or status).
IF autofr = 0 GOTO 111                               :: If 'autofr' (Auto-Fire Rate?) is off, skip to max fire rate calculation.
IF en = 0 GOTO 112                                   :: If no enemy is targeted, skip enemy fire rate logic.
IF en = 1 THEN LET lasfr = cruiserfr                 :: If targeting Cruiser, set laser fire rate to Cruiser's fire rate.
IF en = 2 THEN LET lasfr = fiterfr                   :: If targeting Fighter 1, set laser fire rate to Fighter 1's fire rate.
IF en = 3 THEN LET lasfr = fiterfr2                  :: If targeting Fighter 2, set laser fire rate to Fighter 2's fire rate.
IF en = 4 THEN LET lasfr = enbasfr                   :: If targeting Enemy Base, set laser fire rate to Enemy Base's fire rate.
IF en = 1 THEN LET beamfr = cruiserfr                :: If targeting Cruiser, set beam fire rate to Cruiser's fire rate.
IF en = 2 THEN LET beamfr = fiterfr                  :: If targeting Fighter 1, set beam fire rate to Fighter 1's fire rate.
IF en = 3 THEN LET beamfr = fiterfr2                 :: If targeting Fighter 2, set beam fire rate to Fighter 2's fire rate.
IF en = 4 THEN LET beamfr = enbasfr                  :: If targeting Enemy Base, set beam fire rate to Enemy Base's fire rate.

112
LET shfr = mxshfr                                    :: Reset shield fire rate counter to max.
LET exshfr = mxexshfr                                :: Reset extra shield fire rate counter to max.

111                                                  :: --- Fire Rate and Max Speed Checks ---
LET mxlasfr = (shplv * 2 + 2)                        :: Set Max Laser Fire Rate (cooldown) based on ship level.
LET mxbeamfr = (shplv * 2 + 2)                       :: Set Max Beam Fire Rate (cooldown) based on ship level.
LET mxshfr = (shplv * 2 + 2)                         :: Set Max Shield Regen Rate based on ship level.
LET mxexshfr = (shplv * 2 + 2)                       :: Set Max Extra Shield Regen Rate based on ship level.
IF temp > -2000 THEN LET temp = -2000                :: Cap the 'temp' value at -2000.
IF mvy1 > 10 THEN LET mvy = mvy1                     :: If temporary Y velocity (mvy1) is over 10, set Y velocity (mvy) to mvy1.
IF mvy1 < -10 THEN LET mvy = mvy1                    :: If temporary Y velocity is under -10, set Y velocity to mvy1.
IF mvx1 > 10 THEN LET mvx = mvx1                     :: If temporary X velocity (mvx1) is over 10, set X velocity (mvx) to mvx1.
LET trsen = trsen + (.05 * (shplv / 2))              :: Increase Transmit Sensor (Beam/Teleport cooldown) regeneration.
IF trsen > 100 THEN LET trsen = 100                  :: Cap Transmit Sensor value at 100.
IF mvx1 < -10 THEN LET mvx = mvx1                     :: If temporary X velocity is under -10, set X velocity to mvx1.
IF zus = 1 AND energy = mxen THEN LET roket = roket + .001 + (shplv * .0001) :: While docked and full energy, slowly regenerate rockets/torpedoes.
IF zus = 1 AND energy = mxen THEN LET fuelt = fuelt + .0005 + (shplv * .0001): LET mxsh = mxsh + .0005 + (shplv * .00005): LET mxen = mxen + .0005 + (shplv * .00005) :: While docked and full energy, slowly regenerate fuel tanks, and increase max shield/energy capacity slightly.
LET keel = keel + 1                                  :: Increment a frame counter (`keel`).
IF keel = 6000 THEN LET keel = 1                     :: Reset frame counter every 6000 frames.

:: --- Energy Consumption Logic (Based on direction and speed) ---
IF mvx > 0 AND mvy > 0 THEN LET energy = energy - (mxsp * .01 + (.05 * (mvy + mvx)) * enpro) :: If moving Right & Up, consume energy based on max speed, current velocity, and efficiency.
IF mvx < 0 AND mvy > 0 THEN LET energy = energy - (mxsp * .01 + (.05 * (mvy - mvx)) * enpro) :: If moving Left & Up, consume energy.
IF mvx > 0 AND mvy < 0 THEN LET energy = energy - (mxsp * .01 + (.05 * (-mvy + mvx)) * enpro) :: If moving Right & Down, consume energy.
IF mvx < 0 AND mvy < 0 THEN LET energy = energy - (mxsp * .01 + (.05 * (-mvy - mvx)) * enpro) :: If moving Left & Down, consume energy.
IF mvx > 0 AND mvy = 0 THEN LET energy = energy - (mxsp * .01 + (.05 * (mvx)) * enpro) :: If moving Right only, consume energy.
IF mvx < 0 AND mvy = 0 THEN LET energy = energy - (mxsp * .01 + (.05 * (-mvx)) * enpro) :: If moving Left only, consume energy.
IF mvx = 0 AND mvy > 0 THEN LET energy = energy - (mxsp * .01 + (.05 * (mvy)) * enpro) :: If moving Up only, consume energy.
IF mvx = 0 AND mvy < 0 THEN LET energy = energy - (mxsp * .01 + (.05 * (-mvy)) * enpro) :: If moving Down only, consume energy.

LET cerdit = cerdit + .05                            :: Grant the player a small passive income (0.05 credits per frame).

:: --- Docking/Repair Sequence (zus = 1) ---
IF zus = 1 THEN LINE (xcoi - 8, ycoi - 20)-(xcoi - 100, ycoi + 20), 14, B: LET energy = energy + .625: LET mxsp = 1: LET enpro = .001: IF plsh > 45 THEN LET plsh = 45 :: If docked, draw left docking arm (yellow box), recharge energy, set max speed low (1), set high efficiency, and cap shield regen at 45.
IF zus = 1 THEN LINE (xcoi + 12, ycoi - 20)-(xcoi + 100, ycoi + 20), 14, B: LET energy = energy + .625: LET mxsp = 1: LET enpro = .001: IF plsh > 45 THEN LET plsh = 45 :: If docked, draw right docking arm, continue recharge, set max speed low, set high efficiency, and cap shield regen at 45.
IF zus = 1 THEN LINE (xcoi - 15, ycoi - 14)-(xcoi + 15, ycoi - 120), 14, B: LET energy = energy + .625: LET mxsp = 1: LET enpro = .001: IF plsh > 45 THEN LET plsh = 45 :: If docked, draw top docking arm, continue recharge, set max speed low, set high efficiency, and cap shield regen at 45.
IF zus = 1 THEN LINE (xcoi - 15, ycoi + 14)-(xcoi + 15, ycoi + 120), 14, B: LET energy = energy + .625: LET mxsp = 1: LET enpro = .001: IF plsh > 45 THEN LET plsh = 45 :: If docked, draw bottom docking arm, continue recharge, set max speed low, set high efficiency, and cap shield regen at 45.
IF zus = 1 THEN PAINT (xcoi, ycoi + 50), 0, 14       :: Fill (paint) an area near the ship with color 0 (black).
IF zus = 1 THEN PAINT (xcoi, ycoi - 50), 0, 14       :: Fill (paint) another area near the ship with color 0 (black).
IF zus = 1 THEN PAINT (xcoi - 50, ycoi), 0, 14       :: Fill (paint) another area near the ship with color 0 (black).
IF zus = 1 THEN PAINT (xcoi + 50, ycoi), 0, 14       :: Fill (paint) another area near the ship with color 0 (black).
IF zus = 2 AND plsh > 76 THEN LET zus = 3: LET resp = 1 :: If boosting (zus=2) and shield is good (>76), change status to accelerating (zus=3) and set response flag.
IF zus = 3 AND en = 0 AND mxsp < shplv * 2 + 10 THEN LET zus = 3 :: If accelerating and no enemy and speed is low, keep accelerating.
IF zus = 3 AND en <> 0 AND mxsp < shplv * 2 + 10 THEN LET zus = 0 :: If accelerating AND an enemy is present, stop acceleration and go to normal flight (zus=0).
IF zus = 2 AND mxsp < shplv * 2 + 10 THEN LET mxsp = mxsp + 1 :: If boosting (zus=2) and speed is low, increase max speed.
IF zus = 3 AND mxsp < shplv * 2 + 10 THEN LET mxsp = mxsp + 1 :: If accelerating (zus=3) and speed is low, increase max speed.
IF zus = 3 AND mxsp >= shplv * 2 + 10 THEN LET zus = 0: LET resp = 0 :: If accelerating and max speed reached, return to normal flight (zus=0) and reset response.
IF zus = 1 THEN LET trsen = 0                        :: If docked, reset the Transmit Sensor cooldown.
IF zus = 0 THEN LET resp = 0                         :: If in normal flight, reset the response flag.
IF zus = 2 THEN LET trsen = trsen + (.2 * (shplv / 2)) :: If boosting (zus=2), rapidly recharge the Transmit Sensor.
IF zus = 2 AND trsen > 100 THEN LET trsen = 100      :: Cap Transmit Sensor value at 100.
IF zus = 1 AND exsh <> 1 AND exsha > .999 THEN exsh = 1: LET exsha = exsha - 1: LET exshd = 100 * exshl :: If docked and need extra shield, consume one capacity unit and activate the extra shield.
IF zus = 1 THEN LET exsha = exsha + .005 + (.001 * shplv) :: While docked, slowly regenerate Extra Shield capacity.

:: --- Shield and Damage Calculation ---
IF mvx = 0 AND mvy = 0 THEN LET energy = energy - ((mxsp * .01) * enpro) :: If standing still, consume minimal energy.
LET plsh = plsh + shplv / 2 + 2.5                    :: Regenerate player shield based on ship level and a constant value.
IF plsh > mxsh THEN LET plsh = mxsh                  :: Cap shield at max shield.
IF plsh < 1 THEN LET pldm = pldm + (-plsh * (4 / shplv)): LET plsh = 10 :: If shield drops below 1, increase permanent damage (`pldm`) and set shield to a safe minimum (10).
IF pldm > 99 THEN GOTO 14                            :: If permanent damage reaches 100, jump to Game Over (line 14, not included in snippet).
WINDOW ((xwin), (ywin))-((xwin2), (ywin2))           :: Set the coordinate system for the screen (defines the view window).

:: --- Energy Checks and HUD Color Codes ---
IF energy < 0 THEN GOTO 14                           :: If energy drops below 0, jump to Game Over (line 14).
IF energy > mxen THEN LET energy = mxen              :: Cap energy at max energy.
IF energy > mxen / 3 THEN LET encol = 14             :: If energy > 1/3 max, set energy bar color to Yellow (14).
IF energy <= mxen / 4 THEN LET encol = 4             :: If energy <= 1/4 max, set energy bar color to Red (4).
IF energy > mxen / 2 THEN LET encol = 2              :: If energy > 1/2 max, set energy bar color to Green (2).
IF mxen > 8000 THEN LET mxen = 8000                  :: Cap max energy at 8000.
IF mxsh > 8000 THEN LET mxsh = 8000                  :: Cap max shield at 8000.
IF mxsp > 20 THEN LET spcol = 4                      :: If max speed > 20, set speed bar color to Red (4).
IF mxsp > 50 THEN LET mxsp = 50                      :: Cap max speed at 50.

:: --- Automatic Repair/Refuel/Shield Activation ---
IF energy < 10 AND fuelt > .99 AND autorefuel = 1 THEN LET fuelt = fuelt - 1: LET energy = energy + 300 :: If low energy, have fuel tank, and autorefuel is ON, consume 1 fuel tank and gain 300 energy.
IF zus = 0 AND plsh < 76 AND fuelt > .99 THEN LET fuelt = fuelt - 1: LET plsh = plsh + 100 :: If not docking, shield is low, and have fuel tank, consume 1 fuel tank and gain 100 shield.
IF pldm > 10 AND autorep = 1 THEN LET pldm = pldm - (.5 * shplv): LET energy = energy - 10 :: If permanent damage is high and autorepair is ON, repair damage (based on ship level) by consuming 10 energy.

:: --- Extra Shield Logic and Drawing ---
IF fuelt > 120 THEN LET fuelt = 120                  :: Cap fuel tanks at 120.
IF exsha > 120 THEN LET exsha = 120                  :: Cap extra shield capacity at 120.
IF exsh = 1 THEN CIRCLE (xcoi, ycoi), 32, 4          :: If extra shield is active, draw a large red circle around the player.
IF exsh = 1 THEN CIRCLE (xcoi, ycoi), 30, 14         :: If extra shield is active, draw a yellow circle inside the red one.
IF zus = 1 AND exsh = 1 AND plsh < 45 THEN LET exshd = exshd - ((mxsh - plsh) - exshl) :: If docked and extra shield active, drain extra shield durability (exshd) if shield is below 45.
IF zus <> 1 AND exsh = 1 AND plsh < mxsh THEN LET exshd = exshd - ((mxsh - plsh) - exshl) :: If not docked and extra shield active, drain durability if shield is below max.
IF exshd < 1 THEN LET exsh = 0                       :: If extra shield durability reaches 0, deactivate it.
IF zus <> 1 AND exsh = 1 AND plsh < mxsh THEN LET plsh = mxsh: LET energy = energy - (15 - exshl) :: If extra shield active (and not docked), immediately max out player shield, but consume energy (cost reduced by extra shield level).
IF fuelt <= 0 THEN LET fuelt = 0                     :: Ensure fuel tank count doesn't go negative.
IF mxsp < 40 THEN LET spcol = 14                     :: If max speed < 40, set speed bar color to Yellow (14).
IF mxsp < 20 THEN LET spcol = 2                      :: If max speed < 20, set speed bar color to Green (2).

:: --- HUD Drawing: Speed Bar and Velocity Meter ---
LINE (xwin2 + 475, ywin2 + 60)-(xwin2 + 475 + 50, ywin2 + 80), 1, BF :: Draw the background box for the maximum speed meter.
LINE (xwin2 + 475, ywin2 + 60)-(xwin2 + 475 + mxsp, ywin2 + 80), spcol, BF :: Draw the maximum speed bar, colored by `spcol`.
LINE (xwin2 + 450, ywin2)-(xwin2 + 450 + 100, ywin2 + 20), 1, BF :: Draw the background box for the current velocity vector meter.
IF mvy > 0 THEN LINE (xwin2 + 450, ywin2)-(xwin2 + 450 + mvx + mvy, ywin2 + 20), 8, BF :: If moving up (mvy>0), draw current velocity vector bar (color 8).
IF mvy < 0 THEN LINE (xwin2 + 450, ywin2)-(xwin2 + 450 - mvx - mvy, ywin2 + 20), 8, BF :: If moving down, draw velocity vector bar.
IF mvx > 0 THEN LINE (xwin2 + 450, ywin2)-(xwin2 + 450 + mvx + mvy, ywin2 + 20), 8, BF :: If moving right, draw velocity vector bar.
IF mvx < 0 THEN LINE (xwin2 + 450, ywin2)-(xwin2 + 450 - mvx - mvy, ywin2 + 20), 8, BF :: If moving left, draw velocity vector bar.

:: --- HUD Color Codes: Shield ---
IF plsh > mxsh / 3 THEN LET shcol = 14               :: If shield > 1/3 max, set shield bar color to Yellow (14).
IF plsh < mxsh / 4 THEN LET shcol = 4                :: If shield < 1/4 max, set shield bar color to Red (4).
IF plsh > mxsh / 2 THEN LET shcol = 2                :: If shield > 1/2 max, set shield bar color to Green (2).

:: --- HUD Scaling Logic: Rockets, Fuel Tanks, Extra Shield Capacity ---
IF roket <= 80 THEN LET roketschaal = 8              :: Set Rocket scale factor to 8 if count is 80 or less.
IF roket < 40 THEN LET roketschaal = 4               :: Set Rocket scale factor to 4 if count is less than 40.
IF roket < 20 THEN LET roketschaal = 2               :: Set Rocket scale factor to 2 if count is less than 20.
IF roket < 10 THEN LET roketschaal = 1               :: Set Rocket scale factor to 1 if count is less than 10.
IF roket > 80 THEN LET roket = 80                    :: Cap rockets at 80.
IF fuelt <= 120 THEN LET fueltschaal = 8             :: Set Fuel Tank scale factor to 8 if count is 120 or less.
IF fuelt < 60 THEN LET fueltschaal = 4               :: Set Fuel Tank scale factor to 4 if count is less than 60.
IF fuelt < 30 THEN LET fueltschaal = 2               :: Set Fuel Tank scale factor to 2 if count is less than 30.
IF fuelt < 15 THEN LET fueltschaal = 1               :: Set Fuel Tank scale factor to 1 if count is less than 15.
IF exsha <= 120 THEN LET exshschaal = 8              :: Set Extra Shield capacity scale factor to 8.
IF exsha < 60 THEN LET exshschaal = 4                :: Set Extra Shield capacity scale factor to 4.
IF exsha < 30 THEN LET exshschaal = 2                :: Set Extra Shield capacity scale factor to 2.
IF exsha < 15 THEN LET exshtschaal = 1               :: Set Extra Shield capacity scale factor to 1.

:: --- HUD Drawing: Rocket, Fuel, Extra Shield Capacity Bars ---
LINE (xwin2, ywin2 + 60)-(xwin2 + 100, ywin2 + 80), 1, BF :: Draw Rocket bar background (bottom left).
LINE (xwin, ywin2 + 60)-(xwin - 150, ywin2 + 80), 1, BF :: Draw Fuel Tank bar background (bottom right).
LINE (xwin, ywin2)-(xwin - 150, ywin2 + 20), 1, BF   :: Draw Extra Shield Capacity bar background (bottom right, above Fuel).
LINE (xwin2, ywin2 + 60)-(xwin2 + ((roket * 10) / roketschaal), ywin2 + 80), 8, BF :: Draw Rocket bar filled amount (color 8).
LINE (xwin, ywin2 + 60)-(xwin - ((fuelt * 10) / fueltschaal), ywin2 + 80), 8, BF :: Draw Fuel Tank bar filled amount.
LINE (xwin, ywin2)-(xwin - ((exsha * 10) / exshschaal), ywin2 + 20), 8, BF :: Draw Extra Shield Capacity bar filled amount.

:: --- HUD Drawing: Hyperdrive Cooldown Bar ---
IF hiperdrive = 1 THEN LINE (xwin2, ywin2)-(xwin2 + 100, ywin2 + 20), 1, BF :: If Hyperdrive owned, draw cooldown bar background (bottom left, above Rockets).
IF hiperdrive = 1 THEN LINE (xwin2, ywin2)-((xwin2 + trsen), ywin2 + 20), 8, BF :: Draw Hyperdrive cooldown amount (based on `trsen`).

:: --- HUD Scaling Logic: Max Energy and Max Shield ---
IF mxen < 500 THEN LET enscl = 1                     :: Set Energy scale factor for HUD drawing.
IF mxen >= 500 THEN LET enscl = 2
IF mxen > 1000 THEN LET enscl = 4
IF mxen > 2000 THEN LET enscl = 8
IF mxen > 4000 THEN LET enscl = 16
IF mxsh < 500 THEN LET shscl = 1                     :: Set Shield scale factor for HUD drawing.
IF mxsh >= 500 THEN LET shscl = 2
IF mxsh > 1000 THEN LET shscl = 4
IF mxsh > 2000 THEN LET shscl = 8
IF mxsh > 4000 THEN LET shscl = 16

:: --- HUD Drawing: Energy and Shield Bars ---
LINE (xwin2 + 500 + (mxen / enscl), ywin2 + 20)-(xwin - 500 - (mxen / enscl), ywin2 + 60), 1, BF :: Draw Max Energy Bar background (center).
LINE (xwin2 + 500 + (mxsh / shscl), ywin2 + 80)-(xwin - 500 - (mxsh / shscl), ywin2 + 120), 1, BF :: Draw Max Shield Bar background (center).
LINE (xwin2 + 500 + (energy / enscl), ywin2 + 20)-(xwin - 500 - (energy / enscl), ywin2 + 60), encol, BF :: Draw Current Energy Bar (colored by `encol`).
LINE (xwin2 + 500 + (plsh / shscl), ywin2 + 80)-(xwin - 500 - (plsh / shscl), ywin2 + 120), shcol, BF: IF xcoi < 5000 AND ycoi < 5000 AND xcoi > -5000 AND ycoi > -5000 AND energy < 50 THEN LET energy = energy + 50: LET bsen = bsen - 5: LET enpro = .01 :: Draw Current Shield Bar (colored by `shcol`). If near the center (base) and low on energy, automatically recharge from base supply (`bsen`).

LET a$ = INKEY$                                      :: Read a key press from the keyboard (non-blocking input).

:: --- View Window Scrolling Logic ---
IF ycoi > ywin - 450 THEN LET ywin = ywin + mvy: LET ywin2 = ywin2 + mvy :: If player is near the top edge of the view, scroll the view up.
IF ycoi < ywin2 + 450 THEN LET ywin = ywin + mvy: LET ywin2 = ywin2 + mvy :: If player is near the bottom edge of the view, scroll the view down.
IF xcoi > xwin - 450 THEN LET xwin = xwin + mvx: LET xwin2 = xwin2 + mvx :: If player is near the right edge of the view, scroll the view right.
IF xcoi < xwin2 + 450 THEN LET xwin = xwin + mvx: LET xwin2 = xwin2 + mvx :: If player is near the left edge of the view, scroll the view left.

:: --- Player Mode 1 (Fixed View) ---
IF plmode <> 1 THEN GOTO 38                          :: If not in Mode 1, skip fixed view setup.
LET mvy = 0: LET mvx = 0                             :: If in Mode 1, stop movement.
LET ywin = 500                                       :: Reset view boundaries to center around player (fixed viewport).
LET ywin2 = -500
LET xwin = 500
LET xwin2 = -500

38                                                   :: --- Input Handling Block 1 ---
IF a$ = "o" AND dok2 = 1 THEN LET cerdit = cerdit + (ea2 * 1000): LET dok2 = 0 :: If 'o' pressed and in selling mode, add credits based on quantity (`ea2`) * 1000, and exit selling mode.
IF a$ = "4" THEN CLS : SLEEP                         :: If '4' pressed, Clear Screen and pause.
IF a$ = "5" THEN GOTO 39                             :: If '5' pressed, jump to Status Report (RAPPORT) screen.
IF a$ = "j" AND laser = 1 THEN LET j = j + 1: IF j = 2 THEN LET j = 0 :: If 'j' pressed (fire laser) and laser is active, toggle the `j` (fire) flag between 0 and 1.

:: --- Auto-Laser Logic ---
IF en <> 0 AND autolas = 1 THEN LET j = 1            :: If enemy targeted and Auto-Laser is ON, set fire flag `j` to 1 (fire).
IF rels < 100 AND autolas = 1 AND en <> 0 THEN LET j = 0 :: If Auto-Laser is ON, enemy targeted, but Laser Cooldown (`rels`) is too low, stop firing.
IF en = 0 AND autolas = 1 THEN LET j = 0             :: If no enemy targeted and Auto-Laser is ON, stop firing.

IF a$ = "u" AND exsha > .999 THEN LET exsha = exsha - 1: LET exsh = exsh + 1: LET energy = energy - (25 * exshl): LET exshd = exshl * 100: IF exsh = 2 THEN LET exsh = 0 :: If 'u' pressed and capacity available, consume 1 extra shield capacity, activate extra shield, consume energy, set durability, and ensure it's a toggle (max state is 1, so 2 becomes 0).

:: --- Laser Cooldown and Firing Check ---
IF rels > 400 THEN LET rels = 400                    :: Cap Laser Cooldown (`rels`) at 400.
IF zus = 0 THEN LET rels = rels + (shplv / 2) + 2.5  :: If not docking, recharge laser cooldown based on ship level.
IF rels > (25 * shplv) THEN LET rels = (25 * shplv)  :: Cap laser cooldown based on ship level (e.g., max value before it resets).
IF j = 1 AND rels > 99 THEN LET rels = rels - 100: GOTO 30 :: If 'j' flag is 1 and cooldown is charged (>99), consume 100 cooldown and jump to Laser Fire routine (line 30, not included).
IF j = 1 AND rels < 0 THEN LET rels = 0              :: If trying to fire but cooldown went negative, reset cooldown to 0.
IF j = 0 AND rej = 1 AND rels > 99 THEN LET j = 1: LET rej = 0 :: If not firing, laser re-enable flag is 1, and cooldown charged, set fire flag to 1 and reset re-enable flag.

:: --- HUD Drawing: Laser Cooldown Meter ---
LINE (xwin2 + 450, ywin2 + 120)-(xwin2 + 550, ywin2 + 140), 1, BF :: Draw Laser Cooldown bar background (bottom center-left).
IF rels < 201 THEN LINE (xwin2 + 450, ywin2 + 120)-(xwin2 + 450 + (rels / 2), ywin2 + 140), 14, BF :: Draw yellow bar if cooldown is low (0-200).
IF rels < 101 THEN LINE (xwin2 + 450, ywin2 + 120)-(xwin2 + 450 + rels, ywin2 + 140), 2, BF :: Draw green bar if cooldown is very low (0-100).
IF rels > 200 THEN LINE (xwin2 + 450, ywin2 + 120)-(xwin2 + 450 + (rels / 4), ywin2 + 140), 4, BF :: Draw red bar if cooldown is high (200+).

57  IF a$ = "i" THEN GOTO 45                            :: If 'i' pressed, jump to Unknown Menu/Routine (line 45, not included).
52  IF a$ = "9" THEN LET zus = zus + 1: IF zus = 3 AND resp = 0 THEN LET zus = 0 :: If '9' pressed, toggle Docking/Boost Status (`zus`) 0 -> 1 (Dock) -> 2 (Boost) -> 3 (Accelerate) -> 0 (Normal) if no response flag.
IF a$ = "]" AND autoride = 1 THEN GOTO 82            :: If ']' pressed and Auto-Ride is active, jump to Auto-Pilot destination input (line 82, not included).
IF a$ = "[" AND fuelt > .99 THEN LET fuelt = fuelt - 1: IF energy < mxen THEN LET energy = energy + 300 ELSE LET plsh = plsh + 100 :: If '[' pressed and have fuel, consume 1 fuel tank. If energy low, restore energy (300). If energy full, restore shield (100).
IF a$ = "t" AND hiperdrive = 1 THEN GOTO 15          :: If 't' pressed and Hyperdrive owned, jump to Hyperdrive routine (line 15, not included).
53 IF a$ = "8" THEN LINE (xwin2, ywin)-(xwin2 + 200, ywin2), 0, BF :: If '8' pressed, erase a small box on the screen (used to clear a message area).
IF a$ = "7" THEN CLS                                 :: If '7' pressed, Clear Screen.
IF a$ = "0" THEN LET dis = dis + 1: IF dis = 2 THEN LET dis = 1 :: If '0' pressed, toggle the display (`dis`) flag (likely for debugging/info display).

:: --- Auto-Rocket and Rocket Fire Logic ---
IF en <> 0 AND autorok = 1 THEN LET pt = 1           :: If enemy targeted and Auto-Rocket is ON, set fire flag `pt` to 1.
IF en = 0 AND autorok = 1 THEN LET pt = 0            :: If no enemy targeted and Auto-Rocket is ON, stop firing.
IF a$ = "p" AND roketlan = 1 THEN LET pt = pt + 1: IF pt = 2 THEN LET pt = 0: LET tyo = 0 :: If 'p' pressed (fire rocket) and launcher is active, toggle the `pt` (fire) flag between 0 and 1, and reset time variable (`tyo`).
IF pt = 1 THEN GOTO 6                                :: If rocket fire flag is 1, jump to the Rocket Firing Setup routine (line 6, not included).

54 IF a$ = "w" THEN LET mvy = mvy + 1                :: If 'w' pressed, increase Y velocity (move up).
IF a$ = "'" AND zus = 1 THEN RUN "c:\menu\menu.com" :: If ''' (apostrophe) pressed while docked, run an external menu program.
IF a$ = "x" THEN LET mvy = mvy - 1                   :: If 'x' pressed, decrease Y velocity (move down).
IF a$ = "y" THEN LET en = 0                          :: If 'y' pressed, clear the enemy target (`en`).
IF a$ = "d" THEN LET mvx = mvx + 1                   :: If 'd' pressed, increase X velocity (move right).
IF a$ = "a" THEN LET mvx = mvx - 1                   :: If 'a' pressed, decrease X velocity (move left).
IF a$ = "q" THEN LET mvy = mvy + 1: LET mvx = mvx - 1 :: If 'q' pressed, move up-left (diagonal).
IF a$ = "g" THEN LET batst = batst + 1: IF batst = 2 THEN LET batst = 0 :: If 'g' pressed, toggle battery status (`batst`).
IF a$ = "e" THEN LET mvy = mvy + 1: LET mvx = mvx + 1 :: If 'e' pressed, move up-right (diagonal).
IF a$ = "c" THEN LET mvy = mvy - 1: LET mvx = mvx + 1 :: If 'c' pressed, move down-right (diagonal).
IF a$ = "z" THEN LET mvy = mvy - 1: LET mvx = mvx - 1 :: If 'z' pressed, move down-left (diagonal).
IF a$ = "s" THEN LET mvy = 0: LET mvx = 0: LET mvx1 = 0: LET mvy1 = 0 :: If 's' pressed, stop all movement and reset temporary velocity variables.
IF a$ = "6" THEN LET respst = respst + 1: IF respst = 2 THEN LET respst = 0 :: If '6' pressed, toggle the Response System suppression flag (`respst`).
IF a$ = "o" THEN GOTO 4                              :: If 'o' pressed, jump to Unknown Routine (line 4, not included).

55 IF a$ = "l" THEN GOTO 8                           :: If 'l' pressed, jump to Unknown Routine (line 8, not included).
56 IF a$ = "k" THEN LET mxsp = mxsp - 1: IF mxsp < 0 THEN LET mxsp = 0 :: If 'k' pressed, decrease Max Speed, ensuring it doesn't go below 0.
IF a$ = "1" THEN LET plmode = 1                      :: If '1' pressed, set player mode to Mode 1 (Fixed View).
IF a$ = "2" THEN LET plmode = 2                      :: If '2' pressed, set player mode to Mode 2 (Scrolling View).

:: --- Velocity Limiting and Movement Update ---
IF mvy > mxsp AND vly = 0 THEN LET mvy = mxsp        :: Cap Y velocity at Max Speed (if `vly` is not set).
IF mvy < -mxsp AND vly = 0 THEN LET mvy = -mxsp      :: Cap negative Y velocity at Max Speed.
IF mvx > mxsp AND vly = 0 THEN LET mvx = mxsp        :: Cap X velocity at Max Speed.
IF mvx < -mxsp AND vly = 0 THEN LET mvx = -mxsp      :: Cap negative X velocity at Max Speed.
IF mvy > 0 AND vly = 0 THEN LET ycoi = ycoi + mvy    :: Update player Y coordinate (move up).
IF mvy < 0 AND vly = 0 THEN LET ycoi = ycoi + mvy    :: Update player Y coordinate (move down).
IF mvx > 0 AND vly = 0 THEN LET xcoi = xcoi + mvx    :: Update player X coordinate (move right).
IF mvx < 0 AND vly = 0 THEN LET xcoi = xcoi + mvx    :: Update player X coordinate (move left).

:: --- Velocity Limiting (Redundant Check) and Ship Trail Erase ---
IF mvy > mxsp AND vly = 0 THEN LET mvy = mxsp        :: (Redundant check) Cap Y velocity at Max Speed.
IF mvy < -mxsp AND vly = 0 THEN LET mvy = -mxsp      :: (Redundant check) Cap negative Y velocity at Max Speed.
IF mvx > mxsp AND vly = 0 THEN LET mvx = mxsp        :: (Redundant check) Cap X velocity at Max Speed.
IF mvx < -mxsp AND vly = 0 THEN LET mvx = -mxsp      :: (Redundant check) Cap negative X velocity at Max Speed.
::IF mvx = 0 AND mvy = 0 THEN LET x = 1 ELSE LINE (xcoi - mvx - 40, ycoi - mvy - 40)-(xcoi + mvx + 40, ycoi + mvy + 40), 0, BF :: If moving, erase the previous ship position (to clear the ship trail).

:: --- High-Speed Temporary Velocity Storage ---
IF mvy > 10 THEN LET mvy1 = mvy: LET mvy = 10        :: If Y velocity is over 10, save it to `mvy1` and cap current `mvy` at 10 (likely for graphics/sound).
IF mvy < -10 THEN LET mvy1 = mvy: LET mvy = -10      :: If Y velocity is under -10, save it to `mvy1` and cap current `mvy` at -10.
IF mvx > 10 THEN LET mvx1 = mvx: LET mvx = 10        :: If X velocity is over 10, save it to `mvx1` and cap current `mvx` at 10.
IF mvx < -10 THEN LET mvx1 = mvx: LET mvx = -10      :: If X velocity is under -10, save it to `mvx1` and cap current `mvx` at -10.

:: --- Engine Sound Effects ---
IF mvx > 0 THEN SOUND (50 + (mvx * 10)), .1          :: If moving right, play a sound based on positive X speed.
IF mvx < 0 THEN SOUND (50 - (mvx * 10)), .1          :: If moving left, play a sound based on negative X speed.
IF mvy > 0 THEN SOUND (50 + (mvy * 10)), .1          :: If moving up, play a sound based on positive Y speed.
IF mvy < 0 THEN SOUND (50 - (mvy * 10)), .1          :: If moving down, play a sound based on negative Y speed.
IF mvy = 0 AND mvx = 0 THEN SOUND 50, .1             :: If stopped, play a low, steady sound.
SOUND 0, .5                                          :: Silence the previous sound after a short duration.

:: --- Moon Drawing and Damage ---
'moon'
LET mox = -5000                                      :: Set Moon X coordinate.
LET moy = 6000                                       :: Set Moon Y coordinate.
IF moon = 1 AND xwin2 < -4500 AND xwin > -5500 AND ywin2 < 6500 AND ywin > 5500 THEN LET qqq = 1 ELSE GOTO 95 :: If Moon is alive and visible on screen, set flag `qqq` to 1, otherwise skip drawing.
LINE (-5600, 6600)-(-4400, 5400), 0, BF              :: Erase a large box around the Moon's location.
CIRCLE (mox, moy), 400, 8                            :: Draw the Moon as a large circle (radius 400, color 8=Brown/Gray).
PAINT (5300, moy), 8, 8                              :: Fill parts of the moon to create texture/craters (X offset error in code?).
PAINT (4700, moy), 8, 8                              :: Fill parts of the moon.
PAINT (mox, 5700), 8, 8                              :: Fill parts of the moon.
PAINT (mox, 6300), 8, 8                              :: Fill parts of the moon.
IF xwin2 < -4900 AND xwin > -5100 AND ywin2 < 6100 AND ywin > 5900 THEN LET plsh = plsh - 50 ELSE GOTO 95 :: If player is very close to the Moon's center (within 100 units), take 50 shield damage.
SOUND 37, 1                                          :: Play a damage sound effect.

95
LET a = 0                                            :: Reset flag 'a'.
LET B = 0                                            :: Reset flag 'B'.
LET c = 0                                            :: Reset flag 'c'.
LET d = 0                                            :: Reset flag 'd'.

84                                                   :: --- Boundary / Wall Drawing Loop ---
'wall'
IF hiz = 0 THEN LET wlo = wlo - 5                    :: If flag `hiz` is 0, decrease lower wall position (`wlo`).
IF hiz = 0 THEN LET wlo1 = wlo1 + 5                  :: If flag `hiz` is 0, increase upper wall position (`wlo1`).
IF hiz = 1 THEN LET wlo = wlo + 10                   :: If flag `hiz` is 1, increase lower wall position.
IF hiz = 1 THEN LET wlo1 = wlo1 - 10                 :: If flag `hiz` is 1, decrease upper wall position.
IF wlo <= 0 THEN LET hiz = 1                         :: If lower wall position hits 0, reverse direction (set `hiz` to 1).
IF wlo >= 400 THEN LET hiz = 0                       :: If lower wall position hits 400, reverse direction (set `hiz` to 0).

:: --- Boundary Check and Drawing Jump (Left Wall) ---
IF a = 0 AND xwin2 < -19000 AND xwin > -24000 AND ywin2 < 24000 AND ywin > -24000 THEN LET a = 1: GOTO 91 :: If the Left Wall area is visible, set flag 'a' to 1 and jump to drawing routine.
IF B = 0 AND xwin > 19000 AND xwin2 < 24000 AND ywin2 < 24000 AND ywin > -24000 THEN LET B = 1: GOTO 92 :: If the Right Wall area is visible, set flag 'B' to 1 and jump to drawing routine.
IF c = 0 AND xwin > -19000 AND xwin2 < 24000 AND ywin2 < -19000 AND ywin > -24000 THEN LET c = 1: GOTO 93 :: If the Bottom Wall area is visible, set flag 'c' to 1 and jump to drawing routine.
IF d = 0 AND xwin > -19000 AND xwin2 < 24000 AND ywin > 19000 AND ywin2 < 24000 THEN LET d = 1: GOTO 94 :: If the Top Wall area is visible, set flag 'd' to 1 and jump to drawing routine.
GOTO 90                                              :: If no wall is visible, skip drawing routines.

91                                                   :: --- Left Wall Drawing Routine ---
LINE (-18900, -24000)-(-24100, 24000), 0, BF         :: Erase area for the wall.
LINE (-19000, 0)-(-24000, 0), 4                      :: Draw a red line segment within the wall.
LINE (-19000, wlo1)-(-24000, -24000), 10, BF         :: Draw the oscillating top segment of the wall (color 10).
LINE (-19000, wlo)-(-24000, 24000), 10, BF           :: Draw the oscillating bottom segment of the wall (color 10).
LET y = 1                                            :: Set 'y' flag to 1 (Wall 1 active).
GOTO 84                                              :: Return to the start of the Wall loop.

92                                                   :: --- Right Wall Drawing Routine ---
LINE (18900, -24000)-(24100, 200000), 0, BF          :: Erase area for the wall.
LINE (19000, -24000)-(24000, 200000), 10, BF         :: Draw a solid right wall (color 10).
LET y = 2                                            :: Set 'y' flag to 2 (Wall 2 active).
GOTO 84                                              :: Return to the start of the Wall loop.

93                                                   :: --- Bottom Wall Drawing Routine ---
LINE (-24000, -18900)-(24000, -24100), 0, BF         :: Erase area for the wall.
LINE (-24000, -19000)-(24000, -24000), 10, BF        :: Draw a solid bottom wall (color 10).
LET y = 3                                            :: Set 'y' flag to 3 (Wall 3 active).
GOTO 84                                              :: Return to the start of the Wall loop.

94                                                   :: --- Top Wall Drawing Routine ---
LINE (24000, 18900)-(-24000, 24100), 0, BF           :: Erase area for the wall.
LINE (24000, 19000)-(-24000, 24000), 10, BF          :: Draw a solid top wall (color 10).
LET y = 4                                            :: Set 'y' flag to 4 (Wall 4 active).
GOTO 84                                              :: Return to the start of the Wall loop.

90                                                   :: --- Wall Collision Check ---
LET a = 0                                            :: Reset flag 'a'.
LET B = 0                                            :: Reset flag 'B'.
LET c = 0                                            :: Reset flag 'c'.
LET d = 0                                            :: Reset flag 'd'.
IF xcoi < -19000 AND xcoi > -24000 AND ycoi < wlo1 + 30 AND ycoi > -24000 THEN GOTO 89 :: If player hits the top oscillating part of the Left Wall, jump to Wall Hit routine (line 89, not included).
IF xcoi < -19000 AND xcoi > -24000 AND ycoi > wlo - 30 AND ycoi < 24000 THEN GOTO 89 :: If player hits the bottom oscillating part of the Left Wall, jump to Wall Hit routine.
IF xcoi > 19000 AND xcoi < 24000 AND ycoi > -24000 AND ycoi < 24000 THEN GOTO 89 :: If player hits the Right Wall, jump to Wall Hit routine.
IF xcoi > -19000 AND xcoi < 24000 AND ycoi < -19000 AND ycoi > -24000 THEN GOTO 89 :: If player hits the Bottom Wall, jump to Wall Hit routine.
IF xcoi > -19000 AND xcoi < 24000 AND ycoi > 19000 AND ycoi... :: If player hits the Top Wall, jump to Wall Hit routine (incomplete line in source).