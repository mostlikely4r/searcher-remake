' ***************************************************************
' * REFACTORED SPACE COMBAT GAME CODE (SCEARCH.BAS)
' *
' * Original code used minimal variable names (e.g., 'plsh', 'cerdit')
' * and GOTO-based flow control.
' *
' * This refactor uses descriptive variable names and modular SUB procedures.
' *
' ***************************************************************

' --- CONSTANTS (Using ALL CAPS for constants, a convention in BASIC) ---
CONST MAX_SHIELD_HARD_LIMIT = 8000
CONST MAX_ENERGY_HARD_LIMIT = 8000
CONST MAX_SPEED_HARD_LIMIT = 50

' --- PROCEDURE DECLARATIONS (SUBs replace GOTO blocks) ---

' Core Game Flow
DECLARE SUB InitializeGame
DECLARE SUB UpdateGameTime
DECLARE SUB HandleBankingAndLoan
DECLARE SUB UpdatePlayerMechanics
DECLARE SUB HandleCommanderResponse
DECLARE SUB HandleInput
DECLARE SUB HandleMovement
DECLARE SUB HandleDrawingAndUI
DECLARE SUB CheckForGameOver

' Player Actions / Utilities
DECLARE SUB AutoPilot
DECLARE SUB FireLaser
DECLARE SUB FireRocket
DECLARE SUB UseConsumable (consumable_ID AS INTEGER)
DECLARE SUB HyperdriveJump

' Menus / Screens
DECLARE SUB ShowStatusReport
DECLARE SUB ShowDockingMenu
DECLARE SUB ShowAutoSettingsMenu

' Enemy & World
DECLARE SUB DrawCelestialBodies
DECLARE SUB DrawBoundaries
DECLARE SUB EnemyCruiserLogic
DECLARE SUB EnemyFighter1Logic
DECLARE SUB EnemyFighter2Logic
DECLARE SUB EnemyBaseLogic

' --- GLOBAL Variable Declarations (Implicitly, or via COMMON SHARED if used in QBASIC) ---
' Note: In QBASIC, variables are often implicitly global unless declared in a non-SHARED SUB.
' For clarity, the original variable names are used in comments next to the new names.

' Ship Possessions (Original: laser, roketlan, autoride, hiperdrive, autorep, autolas, autorok, autorefuel, dok2)
COMMON SHARED has_Laser, has_RocketLauncher, has_Autoride, has_Hyperdrive
COMMON SHARED is_AutoRepairOn, is_AutoLaserOn, is_AutoRocketOn, is_AutoRefuelOn
COMMON SHARED is_DockedAtBase

' Player Status & Stats (Original: plsh, mxsh, energy, mxen, mxsp, fuelt, pldm, shplv, trsen, player_Status [zus])
COMMON SHARED player_Shield, max_Shield, player_Energy, max_Energy, max_Speed
COMMON SHARED fuel_Tanks, player_Damage, ship_Level, tracer_Sensor
COMMON SHARED player_Status, resp_Flag ' player_Status: 0=Normal, 1=Docked, 2=Liftoff

' Coordinates & Movement (Original: xcoi, ycoi, mvx, mvy, xwin, ywin, xwin2, ywin2, plmode)
COMMON SHARED player_X, player_Y, mvx, mvy, screen_XMax, screen_YMax, screen_XMin, screen_YMin
COMMON SHARED player_Mode, temp_Mvx, temp_Mvy, is_LandLocked

' Enemy & Target (Original: en, cruiser_X, cruiser_Y, fiter1_X, fiter1_Y, enbas_X, enbas_Y, cruiser_Shield)
COMMON SHARED enemy_TargetID, cruiser_X, cruiser_Y, fiter1_X, fiter1_Y, base_X, base_Y
COMMON SHARED cruiser_Shield, fiter1_Shield, fiter2_Shield, enemyBase_Shield

' Time & Economy (Original: min, heer, mon, jaar, cerdit)
COMMON SHARED game_Minute, game_Hour, game_Month, game_Year, credits
COMMON SHARED is_LoanActive, loan_Amount, is_BankActive, banked_Amount

' Frequencies & Weapons (Original: lasfr, mxlasfr, shfr, mxshfr, cruiserfr, fiterfr, enbasfr, autofr)
COMMON SHARED laser_Freq, max_LaserFreq, shield_Freq, max_ShieldFreq
COMMON SHARED cruiser_Freq, fiter1_Freq, base_Freq, is_AutoFreqOn
COMMON SHARED rocket_Count, laser_Level, rocket_Level, is_LaserArmed, reload_Timer, rearm_Flag

' External Shield (Original: exsh, exsha, exshfr, mxexshfr)
COMMON SHARED ext_ShieldActive, extShield_Charges, extShield_Freq, max_ExtShieldFreq, ext_ShieldHealth, extShield_Level

' UI & Commander (Original: com_MessageCounter [come], respst)
COMMON SHARED com_MessageCounter, resp_Status, com_ClearTime, com_ClearFlag, is_MissionStarted

' Auto-Pilot (Original: gur, xgo, ygo, spgo)
COMMON SHARED is_AutoPilotOn, dest_X, dest_Y, dest_Speed

' Status/Drawing variables (Original: enpro, encol, shcol, spcol)
COMMON SHARED energy_DrainRate, energy_Color, shield_Color, speed_Color

' --- MAIN PROGRAM START (GOTO 0 block is now a procedure call) ---
InitializeGame

' --- MAIN GAME LOOP (Original GOTO 2) ---
DO
    ' 1. Check for Auto-Pilot movement (GOTO 1)
    CALL AutoPilot

    ' 2. Handle Commander messages and warnings (GOTO 83)
    CALL HandleCommanderResponse

    ' 3. Update time (min, heer, mon, jaar) (GOTO 74)
    CALL UpdateGameTime

    ' 4. Handle loan interest and bank updates (GOTO 68, 70)
    CALL HandleBankingAndLoan

    ' 5. Core game physics: energy, shield, recharge (GOTO 71)
    CALL UpdatePlayerMechanics

    ' 6. Handle user input (W/A/S/D, menus, fire)
    CALL HandleInput

    ' 7. Update player position & drawing
    CALL HandleMovement
    CALL HandleDrawingAndUI

    ' 8. Handle Enemy Logic
    CALL EnemyCruiserLogic
    CALL EnemyFighter1Logic
    ' ... other enemy logic SUBs

    ' 9. Draw static world objects and check boundaries
    CALL DrawCelestialBodies
    CALL DrawBoundaries

    ' 10. Check if player health/energy is depleted (GOTO 14)
    CALL CheckForGameOver
LOOP

' ***************************************************************
' * SUBROUTINE DEFINITIONS
' ***************************************************************

SUB InitializeGame
    ' Ship Possessions
    has_Laser = 1: has_RocketLauncher = 1: has_Autoride = 1: has_Hyperdrive = 1
    is_AutoRepairOn = 0: is_AutoLaserOn = 0: is_AutoRocketOn = 0: is_AutoRefuelOn = 0
    is_DockedAtBase = 0

    ' Status & Stats
    player_Shield = 200: max_Shield = 200
    player_Energy = 400: max_Energy = 600
    max_Speed = 10: fuel_Tanks = 3
    player_Damage = 0: ship_Level = 4: tracer_Sensor = 0
    player_Status = 0: is_LandLocked = 0

    ' Coordinates & Movement
    player_X = 430: player_Y = 0: mvx = 0: mvy = 0
    screen_XMax = 930: screen_YMax = 500: screen_XMin = -70: screen_YMin = -500
    player_Mode = 2 ' 2=Follow Player, 1=Fixed Screen

    ' Time & Economy
    game_Minute = 0: game_Hour = 2: game_Month = 6: game_Year = 2022
    credits = 200000

    ' Frequencies & Weapons
    laser_Freq = 1: max_LaserFreq = 10: shield_Freq = 1: max_ShieldFreq = 10
    cruiser_Freq = 5: fiter1_Freq = 10: base_Freq = 20
    rocket_Count = 5: laser_Level = 1: rocket_Level = 1
    is_LaserArmed = 0: reload_Timer = 0: rearm_Flag = 0

    ' Enemy & Target
    enemy_TargetID = 0
    cruiser_Shield = 600: fiter1_Shield = 200: fiter2_Shield = 200: enemyBase_Shield = 600
    cruiser_X = -9000: cruiser_Y = 8000: fiter1_X = -6000: fiter1_Y = 3532: base_X = 24121: base_Y = -18000

    ' Auto-Pilot
    is_AutoPilotOn = 0: dest_Speed = 0

    ' External Shield
    ext_ShieldActive = 0: extShield_Charges = 1: extShield_Level = 100
    max_ExtShieldFreq = 10

    ' Commander/Missions
    resp_Status = 0: com_MessageCounter = 0: is_MissionStarted = 0
END SUB

SUB HandleDrawingAndUI
    ' This SUB handles the visual output, including the HUD and drawing entities.
    ' It relies on the camera/viewport variables (screen_XMin, screen_YMin)
    ' to translate world coordinates to screen coordinates.

    ' --- 1. COORDINATE TRANSLATION (World to Screen) ---
    DIM scr_X AS INTEGER, scr_Y AS INTEGER      ' Screen coordinates for the player
    DIM scr_CX AS INTEGER, scr_CY AS INTEGER    ' Screen coordinates for the Cruiser

    ' Player's screen position (relative to the viewport)
    scr_X = player_X - screen_XMin
    scr_Y = player_Y - screen_YMin

    ' Cruiser's screen position (This ensures entities are drawn only if visible)
    scr_CX = cruiser_X - screen_XMin
    scr_CY = cruiser_Y - screen_YMin

    ' --- 2. DRAW HEADS-UP DISPLAY (HUD) ---

    ' Clear previous status line and reset text color
    COLOR 7 ' White text
    LOCATE 23, 1: PRINT SPACE$(79); ' Clear line 23
    LOCATE 24, 1: PRINT SPACE$(79); ' Clear line 24
    LOCATE 25, 1: PRINT SPACE$(79); ' Clear line 25

    ' Energy Status (Draws a text and a simple graphic bar)
    energy_Color = 10 ' Green
    IF player_Energy < max_Energy / 4 THEN energy_Color = 4 ' Red if low
    COLOR energy_Color
    LOCATE 23, 1: PRINT "ENERGY: "; player_Energy; "/" ; max_Energy;

    ' Shield Status (Draws a text and a simple graphic bar)
    shield_Color = 11 ' Light Cyan/Blue
    IF player_Shield < max_Shield / 4 THEN shield_Color = 12 ' Light Red if low
    COLOR shield_Color
    LOCATE 24, 1: PRINT "SHIELD: "; player_Shield; "/" ; max_Shield;

    ' Credits, Time, and Speed
    COLOR 15 ' Bright White
    LOCATE 23, 30: PRINT "CREDITS: "; credits
    LOCATE 24, 30: PRINT "TIME: "; game_Hour; ":"; game_Minute
    LOCATE 25, 30: PRINT "SPEED: "; ABS(mvx) + ABS(mvy); " / "; max_Speed

    ' Player Status
    LOCATE 25, 1: PRINT "STATUS: ";
    SELECT CASE player_Status
        CASE 0: PRINT "NORMAL"
        CASE 1: PRINT "DOCKED"
        CASE 2: PRINT "LIFTOFF"
    END SELECT


    ' --- 3. DRAW PLAYER SHIP ---
    ' First, clear the previous position (omitted for simplicity, but necessary for smooth movement).
    ' PSET/LINE commands are used for drawing graphics in SCREEN 12.

    COLOR 14 ' Yellow for the player ship
    IF player_Status = 1 THEN COLOR 13 ' Change color if docked

    ' Simple representation of the player ship (a box or dot)
    ' Note: In a real game, this is where ship graphics would be drawn.
    LINE (scr_X - 5, scr_Y - 5)-(scr_X + 5, scr_Y + 5), 14, BF ' Draw a small, filled box

    ' --- 4. DRAW ENEMIES / TARGETS ---

    ' Draw Enemy Cruiser (if visible on screen)
    IF cruiser_Shield > 0 AND scr_CX > 0 AND scr_CY > 0 AND scr_CX < 640 AND scr_CY < 480 THEN
        COLOR 4 ' Red
        CIRCLE (scr_CX, scr_CY), 15, 4
    END IF
    ' (Similar drawing logic would be used for fiter1_X, base_X, etc.)

    ' --- 5. COMMANDER MESSAGE CLEARING ---
    ' Clear the commander message area if the message counter has exceeded the clear time.
    IF com_MessageCounter > com_ClearTime THEN
        LOCATE 1, 1: PRINT SPACE$(79); ' Clear line 1 where commander messages are printed
        com_MessageCounter = 0
    END IF
END SUB

SUB AutoPilot
    ' Line 1: Check if auto-pilot is enabled and move towards destination.
    IF is_AutoPilotOn <> 1 THEN EXIT SUB

    ' Move towards destination (dest_X, dest_Y)
    IF dest_X < player_X THEN mvx = -dest_Speed
    IF dest_Y < player_Y THEN mvy = -dest_Speed
    IF dest_X > player_X THEN mvx = dest_Speed
    IF dest_Y > player_Y THEN mvy = dest_Speed

    ' Check if destination is reached
    IF ABS(dest_X - player_X) < 10 AND ABS(dest_Y - player_Y) < 10 THEN
        is_AutoPilotOn = 0
        mvx = 0: mvy = 0
    END IF
END SUB

SUB UpdateGameTime
    ' Line 74: Enemy status reset & Game Time update
    ' Assuming enemy status flags are reset on a time cycle for game state.
    ' Note: Original code resets active flags, not shield health.

    game_Minute = game_Minute + 1
    IF game_Minute >= 24 THEN
        game_Minute = 0
        game_Hour = game_Hour + 1
    END IF
    IF game_Hour > 30 THEN
        game_Hour = 1
        game_Month = game_Month + 1
    END IF
    IF game_Month > 12 THEN
        game_Month = 1
        game_Year = game_Year + 1
    END IF
END SUB

SUB HandleBankingAndLoan
    ' Loan Interest (Original GOTO 68, 73)
    IF is_LoanActive = 1 AND game_Minute = 0 THEN
        ' The original loan interest logic is complex. This is a simplified interpretation.
        loan_Interest = loan_Amount * .05
        loan_Amount = loan_Amount + loan_Interest ' Loan principal grows
        credits = credits - loan_Interest        ' Interest is paid from credits

        IF credits < 1 THEN
            ' Penalty for default: lose half max shield
            player_Shield = player_Shield - (max_Shield * .5)
        END IF
    END IF

    ' Bank Account Interest (Original GOTO 70, 72)
    IF is_BankActive = 1 AND game_Hour = 3 AND game_Minute = 0 THEN
        ' Logic for calculating bank interest/fees is omitted for brevity.
        ' The intent is to update 'banked_Amount' (gespbed) based on flags.
    END IF
END SUB

SUB UpdatePlayerMechanics
    ' Line 71 (from GOTO 71): Core game physics.

    ' Energy Production Rate (enpro) - used for energy drain calculation
    energy_DrainRate = 4 / ship_Level

    ' Max Frequency/Shield Caps (based on ship level)
    max_LaserFreq = (ship_Level * 2 + 2)
    max_ShieldFreq = (ship_Level * 2 + 2)
    max_ExtShieldFreq = (ship_Level * 2 + 2)

    ' Docked/Repair Resource Generation (player_Status = 1: Docked at small station)
    IF player_Status = 1 AND player_Energy = max_Energy THEN
        rocket_Count = rocket_Count + .001 + (ship_Level * .0001)
        fuel_Tanks = fuel_Tanks + .0005 + (ship_Level * .0001)
        max_Shield = max_Shield + .0005 + (ship_Level * .00005)
        max_Energy = max_Energy + .0005 + (ship_Level * .00005)
    END IF

    ' Energy Consumption (Based on absolute velocity)
    total_Velocity = ABS(mvy) + ABS(mvx)
    consumption_Rate = (max_Speed * .01 + (.05 * total_Velocity) * energy_DrainRate)

    IF mvx <> 0 OR mvy <> 0 THEN
        player_Energy = player_Energy - consumption_Rate
    ELSE
        ' Base consumption if stationary (Line 564)
        player_Energy = player_Energy - ((max_Speed * .01) * energy_DrainRate)
    END IF

    ' Credit generation
    credits = credits + .05

    ' Shield Recharge/Repair
    player_Shield = player_Shield + ship_Level / 2 + 2.5
    IF player_Shield > max_Shield THEN player_Shield = max_Shield

    ' Hull Damage Check (player_Damage is pldm)
    IF player_Shield < 1 THEN
        player_Damage = player_Damage + (-player_Shield * (4 / ship_Level))
        player_Shield = 10 ' Reset shield to 10
    END IF

    ' Hard Limits & Clamping
    IF player_Energy > max_Energy THEN player_Energy = max_Energy
    IF player_Energy < 0 THEN player_Energy = 0
    IF max_Energy > MAX_ENERGY_HARD_LIMIT THEN max_Energy = MAX_ENERGY_HARD_LIMIT
    IF max_Shield > MAX_SHIELD_HARD_LIMIT THEN max_Shield = MAX_SHIELD_HARD_LIMIT

    ' Auto-Refuel/Repair (Line 565-566)
    IF player_Energy < 10 AND fuel_Tanks > .99 AND is_AutoRefuelOn = 1 THEN
        fuel_Tanks = fuel_Tanks - 1
        player_Energy = player_Energy + 300
    END IF
    IF player_Damage > 10 AND is_AutoRepairOn = 1 THEN
        player_Damage = player_Damage - (.5 * ship_Level)
        player_Energy = player_Energy - 10
    END IF
END SUB

SUB HandleCommanderResponse
    ' Line 83: Commander/Warning system.
    IF resp_Status = 1 THEN EXIT SUB ' Response suppressed.

    com_MessageCounter = com_MessageCounter + 1
    LOCATE 1, 1

    ' Simplified mission check: ready to launch
    is_NearHomeBase = ABS(player_X) < 900 AND ABS(player_Y) < 900

    IF player_Energy > max_Energy - 10 AND is_NearHomeBase = 1 AND is_MissionStarted = 0 THEN
        PRINT "You are ready to go now, lift off at will"
        is_MissionStarted = 1
    END IF

    ' Low status warnings
    IF player_Energy < max_Energy / 4 AND is_MissionStarted = 1 THEN PRINT "!!YOUR energy is low refuel atonce!!"
    IF player_Shield < max_Shield / 4 AND player_Status = 0 THEN PRINT "!!YOUR SHIELD IS LOW!!"
    IF rocket_Count < 3 AND rocket_Count > 1 THEN PRINT "you are running out of foton torpedos"

    ' Nearby enemy warnings (within a 2000x2000 box, relative to screen center)
    IF cruiser_X < screen_XMax + 1000 AND cruiser_X > screen_XMin - 1000 THEN PRINT "there is a enemy cruiser spoted near you "
END SUB

SUB HandleInput
    ' Line 573: Handles keyboard input and basic action logic.
    DIM a$ AS STRING
    a$ = INKEY$

    ' Laser Fire (Key 'j')
    IF a$ = "j" AND has_Laser = 1 THEN
        is_LaserArmed = 1 - is_LaserArmed
    END IF
    ' Fire laser if armed and reloaded
    IF is_LaserArmed = 1 AND reload_Timer > 99 THEN
        reload_Timer = reload_Timer - 100
        CALL FireLaser
    END IF
    ' Laser reload timer (rels)
    IF player_Status = 0 THEN reload_Timer = reload_Timer + (ship_Level / 2) + 2.5
    IF reload_Timer > (25 * ship_Level) THEN reload_Timer = (25 * ship_Level)

    ' Movement Keys
    IF a$ = "w" THEN mvy = mvy + 1
    IF a$ = "x" THEN mvy = mvy - 1
    IF a$ = "d" THEN mvx = mvx + 1
    IF a$ = "a" THEN mvx = mvx - 1
    IF a$ = "s" THEN mvy = 0: mvx = 0: temp_Mvx = 0: temp_Mvy = 0

    ' Rocket Fire/Targeting (Key 'p')
    IF a$ = "p" AND has_RocketLauncher = 1 THEN
        is_RocketArmed = 1 - is_RocketArmed
    END IF
    IF is_RocketArmed = 1 THEN CALL FireRocket

    ' Consumables / Hyperdrive
    IF a$ = "u" AND extShield_Charges > .999 THEN CALL UseConsumable(1)   ' External Shield
    IF a$ = "[" AND fuel_Tanks > .999 THEN CALL UseConsumable(2)     ' Fuel/Energy
    IF a$ = "t" AND has_Hyperdrive = 1 THEN CALL HyperdriveJump

    ' Menus / Mode Switches
    IF a$ = "5" THEN CALL ShowStatusReport
    IF a$ = "i" THEN CALL ShowDockingMenu
    IF a$ = "]" AND has_Autoride = 1 THEN ' Start AutoPilot Input
        ' (Original GOTO 82: omitted input for brevity)
        is_AutoPilotOn = 1
    END IF
    IF a$ = "1" THEN player_Mode = 1 ' Fixed Screen
    IF a$ = "2" THEN player_Mode = 2 ' Follow Player
END SUB

SUB HandleMovement
    ' Line 581: Apply velocity and clamp to max_Speed.

    ' Velocity clamping
    IF mvx > max_Speed THEN mvx = max_Speed
    IF mvx < -max_Speed THEN mvx = -max_Speed
    IF mvy > max_Speed THEN mvy = max_Speed
    IF mvy < -max_Speed THEN mvy = -max_Speed

    ' Update position
    player_X = player_X + mvx
    player_Y = player_Y + mvy

    ' Screen Camera Follow Logic (Moved from HandleDrawingAndUI for flow)
    IF player_Mode = 2 THEN
        IF player_Y > screen_YMax - 450 THEN screen_YMax = screen_YMax + mvy: screen_YMin = screen_YMin + mvy
        IF player_Y < screen_YMin + 450 THEN screen_YMax = screen_YMax + mvy: screen_YMin = screen_YMin + mvy
        IF player_X > screen_XMax - 450 THEN screen_XMax = screen_XMax + mvx: screen_XMin = screen_XMin + mvx
        IF player_X < screen_XMin + 450 THEN screen_XMax = screen_XMax + mvx: screen_XMin = screen_XMin + mvx
    END IF

    ' Draw/Erase Ship trail (omitted for brevity)
    ' SOUND effects (omitted for brevity)
END SUB

SUB EnemyCruiserLogic
    ' This SUB handles the movement, targeting, and combat logic for the Enemy Cruiser.
    ' It primarily manages the Cruiser's speed (mvx, mvy) and health (cruiser_Shield).

    IF cruiser_Shield <= 0 THEN EXIT SUB ' Cruiser is destroyed

    DIM cruiser_MVX AS SINGLE, cruiser_MVY AS SINGLE ' Temporary movement variables

    ' --- 1. TARGETING PLAYER ---
    ' Calculate the distance difference to the player (player_X, player_Y).
    ' Assume the cruiser is programmed to slowly move towards the player.
    
    cruiser_MVX = 0
    cruiser_MVY = 0

    IF player_X > cruiser_X THEN cruiser_MVX = 1
    IF player_X < cruiser_X THEN cruiser_MVX = -1
    IF player_Y > cruiser_Y THEN cruiser_MVY = 1
    IF player_Y < cruiser_Y THEN cruiser_MVY = -1

    ' If the cruiser is close, try to stop or circle (simplified).
    IF ABS(player_X - cruiser_X) < 100 AND ABS(player_Y - cruiser_Y) < 100 THEN
        cruiser_MVX = 0
        cruiser_MVY = 0
    END IF
    
    ' --- 2. APPLY MOVEMENT AND SPEED LIMIT ---
    ' The cruiser is generally slow; max speed is hard-coded here.
    CONST CRUISER_MAX_SPEED = 3

    ' Update the Cruiser's position
    cruiser_X = cruiser_X + (cruiser_MVX * CRUISER_MAX_SPEED)
    cruiser_Y = cruiser_Y + (cruiser_MVY * CRUISER_MAX_SPEED)

    ' --- 3. ATTACK LOGIC (Simplified: check if within attack range) ---
    IF ABS(player_X - cruiser_X) < 800 AND ABS(player_Y - cruiser_Y) < 800 THEN
        ' Check cruiser fire frequency (cruiser_Freq) against a random roll.
        IF INT(RND * 100) < cruiser_Freq THEN
            ' Cruiser fires a powerful, slow beam that causes player_Damage
            player_Shield = player_Shield - 50 ' Direct damage application
            
            ' Display a message (optional)
            IF resp_Status = 0 THEN
                resp_Status = 1
                LOCATE 1, 1: COLOR 4: PRINT "WARNING: CRUISER BEAM IMPACT!"
            END IF
        END IF
    END IF

    ' 4. HANDLE DAMAGE (Damage from player weapons would happen outside this SUB)
END SUB

SUB EnemyFighter1Logic
    ' This SUB handles the fast, erratic movement and attack pattern of Fighter 1.

    IF fiter1_Shield <= 0 THEN EXIT SUB ' Fighter is destroyed

    DIM fiter_MVX AS SINGLE, fiter_MVY AS SINGLE
    CONST FIGHTER_MAX_SPEED = 8
    
    ' --- 1. TARGETING PLAYER (Aggressive Pursuit) ---
    
    ' Move directly towards the player, with some random wobble (RND).
    fiter_MVX = (player_X - fiter1_X) / 200 + (RND - 0.5) * 0.5
    fiter_MVY = (player_Y - fiter1_Y) / 200 + (RND - 0.5) * 0.5

    ' Normalize speed if necessary (to prevent infinite acceleration)
    DIM speed_Mag AS SINGLE
    speed_Mag = SQR(fiter_MVX ^ 2 + fiter_MVY ^ 2)
    
    IF speed_Mag > 0 THEN
        fiter_MVX = fiter_MVX / speed_Mag * FIGHTER_MAX_SPEED
        fiter_MVY = fiter_MVY / speed_Mag * FIGHTER_MAX_SPEED
    END IF

    ' --- 2. APPLY MOVEMENT ---
    fiter1_X = fiter1_X + fiter_MVX
    fiter1_Y = fiter1_Y + fiter_MVY

    ' --- 3. ATTACK LOGIC (Close-range laser fire) ---
    IF ABS(player_X - fiter1_X) < 400 AND ABS(player_Y - fiter1_Y) < 400 THEN
        ' Check fighter fire frequency (fiter1_Freq) against a random roll.
        IF INT(RND * 100) < fiter1_Freq THEN
            ' Fighter fires a light, fast laser
            player_Shield = player_Shield - 10 ' Light damage application
        END IF
    END IF

END SUB

SUB DrawCelestialBodies
    ' This SUB draws static, large celestial objects like planets and stars.
    ' These objects do NOT move relative to the world grid.
    
    DIM scr_CX AS INTEGER, scr_CY AS INTEGER ' Screen coordinates for objects

    ' Assume coordinates are relative to the camera position (screen_XMin, screen_YMin)
    
    ' --- 1. Draw Large Planet (Earth or Mars) ---
    
    ' World Coordinates for the planet
    CONST PLANET_X = 10000
    CONST PLANET_Y = 15000
    
    ' Translate to screen coordinates
    scr_CX = PLANET_X - screen_XMin
    scr_CY = PLANET_Y - screen_YMin
    
    ' Check if the planet is within the visible screen bounds (640x480) + a buffer
    IF scr_CX > -1000 AND scr_CY > -1000 AND scr_CX < 1000 AND scr_CY < 1000 THEN
        COLOR 14 ' Yellow/Gold
        CIRCLE (scr_CX, scr_CY), 500, 14
        COLOR 10 ' Green
        PAINT (scr_CX, scr_CY), 10, 14 ' Fill the planet 
    END IF
    
    ' --- 2. Draw Asteroid Field/Moon (Simplified) ---
    ' World Coordinates for a Moon
    CONST MOON_X = -5000
    CONST MOON_Y = -5000
    
    scr_CX = MOON_X - screen_XMin
    scr_CY = MOON_Y - screen_YMin
    
    IF scr_CX > -50 AND scr_CY > -50 AND scr_CX < 690 AND scr_CY < 530 THEN
        COLOR 8 ' Dark Gray
        CIRCLE (scr_CX, scr_CY), 150, 8
    END IF

    ' NOTE: Drawing stars involves looping through an array of star coordinates (omitted here)
END SUB

SUB DrawBoundaries
    ' This SUB draws the boundaries of the playable universe.
    ' Assume the universe boundary is a fixed rectangle (e.g., -10000 to 10000 on both axes).

    ' --- 1. DEFINE UNIVERSE LIMITS ---
    CONST UNIVERSE_X_MIN = -10000
    CONST UNIVERSE_X_MAX = 10000
    CONST UNIVERSE_Y_MIN = -10000
    CONST UNIVERSE_Y_MAX = 10000

    DIM scr_X1 AS INTEGER, scr_Y1 AS INTEGER
    DIM scr_X2 AS INTEGER, scr_Y2 AS INTEGER

    ' --- 2. TRANSLATE WORLD BOUNDARIES TO SCREEN COORDINATES ---
    
    scr_X1 = UNIVERSE_X_MIN - screen_XMin
    scr_Y1 = UNIVERSE_Y_MIN - screen_YMin
    scr_X2 = UNIVERSE_X_MAX - screen_XMin
    scr_Y2 = UNIVERSE_Y_MAX - screen_YMin

    ' --- 3. DRAW THE BOUNDARY BOX ---
    COLOR 12 ' Bright Red for danger
    
    ' Draw the rectangle if any part of it is visible on the screen
    IF scr_X2 > 0 AND scr_X1 < 640 AND scr_Y2 > 0 AND scr_Y1 < 480 THEN
        LINE (scr_X1, scr_Y1)-(scr_X2, scr_Y2), 12, B ' Draw an outline box
    END IF

    ' --- 4. CHECK IF PLAYER IS NEAR BOUNDARY ---
    IF player_X < UNIVERSE_X_MIN + 500 OR player_X > UNIVERSE_X_MAX - 500 OR _
       player_Y < UNIVERSE_Y_MIN + 500 OR player_Y > UNIVERSE_Y_MAX - 500 THEN

        COLOR 14 ' Yellow text
        LOCATE 3, 1: PRINT "WARNING: Approaching Universe Boundary!"
        
        ' Set a flag to clear the warning message after a few frames
        com_MessageCounter = com_MessageCounter + 1
        IF com_MessageCounter = com_ClearTime - 10 THEN ' Reset message clear timer
            resp_Status = 0
        END IF
    END IF
END SUB

SUB FireLaser
    ' Line 30: Laser firing logic.
    DIM target_X AS INTEGER, target_Y AS INTEGER

    ' Set target coordinates based on enemy_TargetID
    SELECT CASE enemy_TargetID
        CASE 1: target_X = cruiser_X: target_Y = cruiser_Y
        CASE 2: target_X = fiter1_X: target_Y = fiter1_Y
        CASE 4: target_X = fiter2_X: target_Y = fiter2_Y
        CASE 3: target_X = base_X: target_Y = base_Y
        CASE ELSE: EXIT SUB
    END SELECT

    ' Check if laser frequency matches enemy frequency (Original code's strange requirement)
    IF enemy_TargetID = 1 AND laser_Freq <> cruiser_Freq THEN EXIT SUB
    ' ... other frequency checks omitted for brevity ...

    ' Simplified damage logic (Original Lines 475-476)
    laser_Damage = 50 * laser_Level
    SELECT CASE enemy_TargetID
        CASE 1: cruiser_Shield = cruiser_Shield - laser_Damage
        CASE 2: fiter1_Shield = fiter1_Shield - laser_Damage
        ' ... others omitted ...
    END SELECT

    ' Draw Laser Beam (10 times for flicker/sound)
    FOR i = 1 TO 10
        LINE (player_X, player_Y)-(target_X, target_Y), 14 ' Draw bright line
        SOUND 3700, .1 ' Fire sound
        LINE (player_X, player_Y)-(target_X, target_Y), 0 ' Erase line
    NEXT i

    player_Energy = player_Energy - 5 ' Energy cost
END SUB

SUB UseConsumable (consumable_ID AS INTEGER)
    ' Line 575: Handles consumable use
    SELECT CASE consumable_ID
        CASE 1: ' External Shield (Key 'u')
            extShield_Charges = extShield_Charges - 1
            ext_ShieldActive = 1
            player_Energy = player_Energy - (25 * extShield_Level)

        CASE 2: ' Fuel Tank for Energy/Shield (Key '[')
            fuel_Tanks = fuel_Tanks - 1
            IF player_Energy < max_Energy THEN
                player_Energy = player_Energy + 300
            ELSE
                player_Shield = player_Shield + 100
            END IF
    END SELECT
END SUB

SUB CheckForGameOver
    ' Line 14: Game Over conditions
    IF player_Damage > 99 OR player_Energy < 0 THEN
        CLS
        PRINT "****************************************************************"
        PRINT "* G A M E   O V E R"
        PRINT "* Your vessel has been destroyed."
        PRINT "****************************************************************"
        SOUND 100, 10
        END
    END IF
END SUB

SUB ShowStatusReport
    ' Line 39: Status report screen (Dutch to English translation provided in comments)
    CLS
    PRINT "****************************************************************"
    PRINT "* STATUS REPORT (RAPPORT) "
    PRINT "****************************************************************"
    PRINT "* Game Time ="; game_Minute; ": 00"
    PRINT "* Date ="; game_Hour; "-"; game_Month; "-"; game_Year; "Damage:"; player_Damage
    PRINT "* Location ="; player_X; "x"; player_Y; "y"
    PRINT "* Tracer Sensor Ready in:"; 100 - tracer_Sensor; "sec"
    PRINT "* Energy:"; player_Energy; "Shield:"; player_Shield; "Speed:"; ABS(mvx) + ABS(mvy)
    PRINT "* Max Energy:"; max_Energy; "Max Shield:"; max_Shield; "Max Speed:"; max_Speed
    PRINT "* Ship Level:"; ship_Level
    PRINT "****************************************************************"
    INPUT "Press Enter to return..."; a$
    CLS
END SUB