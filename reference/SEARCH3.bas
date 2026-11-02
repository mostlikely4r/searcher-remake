' Refactored Space Game
' Original code refactored to use SUBs, descriptive variable names, and comments.
' Eliminated most GOTOs by using structured loops, IF-THEN-ELSE, and subroutines.
' Assumes QBASIC or compatible environment.

DEFINT A-Z
SCREEN 12

' Global variables (declared with descriptive names)
DIM SHARED playerLaserEnabled AS INTEGER          ' 1 if laser equipped
DIM SHARED playerRocketLauncher AS INTEGER        ' 1 if rocket launcher equipped
DIM SHARED playerAutoPilot AS INTEGER             ' 1 if auto ride enabled
DIM SHARED playerHyperDrive AS INTEGER            ' 1 if hyperdrive equipped
DIM SHARED playerAutoRepair AS INTEGER            ' 1 if auto repair enabled
DIM SHARED playerAutoLaser AS INTEGER             ' 1 if auto laser enabled
DIM SHARED playerAutoRocket AS INTEGER            ' 1 if auto rocket enabled
DIM SHARED playerTracer AS INTEGER                ' Tracer sensor (not fully implemented)
DIM SHARED playerBeam AS INTEGER                  ' Beam weapon
DIM SHARED playerAutoBeam AS INTEGER              ' Auto beam (not implemented)
DIM SHARED playerMultiCom AS INTEGER              ' Multi communicator (not implemented)
DIM SHARED playerAutoRefuel AS INTEGER            ' 1 if auto refuel enabled
DIM SHARED dockingStation2 AS INTEGER             ' Secondary docking status

' Positions and coordinates
DIM SHARED laserFrequency AS INTEGER              ' Laser frequency
DIM SHARED playerDamage AS SINGLE                 ' Player ship damage
DIM SHARED enemyType AS INTEGER                   ' Current enemy type (0=none,1=cruiser,etc.)
DIM SHARED maxLaserFrequency AS INTEGER           ' Max laser freq
DIM SHARED beamFrequency AS INTEGER               ' Beam frequency
DIM SHARED maxBeamFrequency AS INTEGER            ' Max beam freq
DIM SHARED shieldFrequency AS INTEGER             ' Shield frequency
DIM SHARED maxShieldFrequency AS INTEGER          ' Max shield freq
DIM SHARED cruiserFrequency AS INTEGER            ' Cruiser freq
DIM SHARED fighterFrequency AS INTEGER            ' Fighter freq
DIM SHARED fighterFrequency2 AS INTEGER           ' Second fighter freq
DIM SHARED enemyBaseFrequency AS INTEGER          ' Enemy base freq
DIM SHARED maxCruiserFrequency AS INTEGER         ' Max cruiser freq
DIM SHARED maxFighterFrequency2 AS INTEGER        ' Max second fighter freq
DIM SHARED maxEnemyBaseFrequency AS INTEGER       ' Max enemy base freq
DIM SHARED extraShieldFrequency AS INTEGER        ' Extra shield freq
DIM SHARED maxExtraShieldFrequency AS INTEGER     ' Max extra shield freq
DIM SHARED dockingStation AS INTEGER              ' Primary docking status
DIM SHARED moonVisible AS INTEGER                 ' 1 if moon visible
DIM SHARED earthVisible AS INTEGER                ' 1 if earth visible
DIM SHARED extraShieldActive AS INTEGER           ' 1 if extra shield on
DIM SHARED torus AS INTEGER                       ' Torus object
DIM SHARED battleStation AS INTEGER               ' Battle station status
DIM SHARED fighterLevel AS SINGLE                 ' Fighter level
DIM SHARED fighterLevel2 AS SINGLE                ' Second fighter level
DIM SHARED torusX AS INTEGER                      ' Torus X position
DIM SHARED cruiserLevel AS SINGLE                 ' Cruiser level
DIM SHARED enemyBaseLevel AS SINGLE               ' Enemy base level
DIM SHARED extraShieldLevel AS SINGLE             ' Extra shield level
DIM SHARED tractorSensor AS SINGLE                ' Tractor beam sensor
DIM SHARED minutes AS INTEGER                     ' Game time minutes
DIM SHARED day AS INTEGER                         ' Game day (was heer)
DIM SHARED month AS INTEGER                       ' Game month
DIM SHARED year AS INTEGER                        ' Game year
DIM SHARED laserLevel AS SINGLE                   ' Laser level
DIM SHARED enemyProximity AS SINGLE               ' Enemy proximity factor
DIM SHARED fighter2Active AS INTEGER              ' Second fighter active
DIM SHARED cruiserShield AS SINGLE                ' Cruiser shield
DIM SHARED cruiserDamage AS SINGLE                ' Cruiser damage
DIM SHARED cruiserActive AS INTEGER               ' Cruiser active
DIM SHARED autoDefense AS INTEGER                 ' Auto defense
DIM SHARED fighterActive AS INTEGER               ' Fighter active
DIM SHARED rockets AS SINGLE                      ' Number of rockets
DIM SHARED enemyScale AS INTEGER                  ' Enemy scale
DIM SHARED shieldScale AS INTEGER                 ' Shield scale
DIM SHARED fighterX AS INTEGER                    ' Fighter X
DIM SHARED fighterY AS INTEGER                    ' Fighter Y
DIM SHARED credits AS SINGLE                      ' Player credits
DIM SHARED fighterX2 AS INTEGER                   ' Second fighter X
DIM SHARED fighterY2 AS INTEGER                   ' Second fighter Y
DIM SHARED kiz AS INTEGER                         ' Cruiser AI state
DIM SHARED playerEnergy AS SINGLE                 ' Current energy
DIM SHARED rocketLevel AS SINGLE                  ' Rocket level
DIM SHARED laserEnemyBaseShield AS SINGLE         ' Laser vs enemy base shield
DIM SHARED laserCruiserShield AS SINGLE           ' Laser vs cruiser shield
DIM SHARED laserFighterShield AS SINGLE           ' Laser vs fighter shield
DIM SHARED laserFighterShield2 AS SINGLE          ' Laser vs second fighter shield
DIM SHARED windowXMax AS INTEGER                  ' Window max X
DIM SHARED windowYMax AS INTEGER                  ' Window max Y
DIM SHARED windowXMin AS INTEGER                  ' Window min X
DIM SHARED playerMode AS INTEGER                  ' Player mode (1=static,2=dynamic)
DIM SHARED windowYMin AS INTEGER                  ' Window min Y
DIM SHARED cruiserX AS INTEGER                    ' Cruiser X
DIM SHARED cruiserY AS INTEGER                    ' Cruiser Y
DIM SHARED maxSpeed AS INTEGER                    ' Max speed
DIM SHARED enemyBaseX AS INTEGER                  ' Enemy base X
DIM SHARED enemyBaseY AS INTEGER                  ' Enemy base Y
DIM SHARED enemyBaseActive AS INTEGER             ' Enemy base active
DIM SHARED playerX AS INTEGER                     ' Player X coord
DIM SHARED playerY AS INTEGER                     ' Player Y coord
DIM SHARED earthX AS INTEGER                      ' Earth X
DIM SHARED earthY AS INTEGER                      ' Earth Y
DIM SHARED fuelTanks AS SINGLE                    ' Fuel tanks
DIM SHARED playerShield AS SINGLE                 ' Player shield
DIM SHARED baseShield AS SINGLE                   ' Base shield
DIM SHARED baseEnergy AS SINGLE                   ' Base energy
DIM SHARED fighterDamage AS SINGLE                ' Fighter damage
DIM SHARED fighterShield AS SINGLE                ' Fighter shield
DIM SHARED fighterDamage2 AS SINGLE               ' Second fighter damage
DIM SHARED fighterShield2 AS SINGLE               ' Second fighter shield
DIM SHARED baseDamage AS SINGLE                   ' Base damage
DIM SHARED enemyBaseDamage AS SINGLE              ' Enemy base damage
DIM SHARED enemyBaseShield AS SINGLE              ' Enemy base shield
DIM SHARED shipLevel AS SINGLE                    ' Ship level
DIM SHARED rocketLaunchLevel AS SINGLE            ' Rocket launch level
DIM SHARED maxShield AS SINGLE                    ' Max shield
DIM SHARED maxEnergyTotal AS SINGLE               ' Max total energy

' Additional shared variables
DIM SHARED gur AS INTEGER                         ' Auto pilot active
DIM SHARED xgo AS INTEGER                         ' Auto pilot dest X
DIM SHARED ygo AS INTEGER                         ' Auto pilot dest Y
DIM SHARED spgo AS INTEGER                        ' Auto pilot speed
DIM SHARED mvx AS INTEGER                         ' Velocity X
DIM SHARED mvy AS INTEGER                         ' Velocity Y
DIM SHARED respst AS INTEGER                      ' Response state
DIM SHARED come AS INTEGER                        ' Message timer
DIM SHARED go AS INTEGER                          ' Go flag for messages
DIM SHARED gotime AS INTEGER                      ' Go time
DIM SHARED cl AS INTEGER                          ' Clear line flag
DIM SHARED stp AS INTEGER                         ' Startup flag
DIM SHARED mi AS INTEGER                          ' Mission flag
DIM SHARED ghn AS INTEGER                         ' Near home flag
DIM SHARED zus AS INTEGER                         ' Docking/charging mode (0=none,1=charging,2=accel,3=hyper)
DIM SHARED fo AS INTEGER                          ' Low rocket warning flag
DIM SHARED fol AS INTEGER                         ' No rocket warning flag
DIM SHARED wa AS INTEGER                          ' Warning cooldown
DIM SHARED fu AS INTEGER                          ' Low fuel warning flag
DIM SHARED ful AS INTEGER                         ' No fuel warning flag
DIM SHARED lenbed AS SINGLE                       ' Loan amount
DIM SHARED leen AS INTEGER                        ' Loan active
DIM SHARED rekrek AS INTEGER                      ' Savings account active
DIM SHARED gespbed AS SINGLE                      ' Savings balance
DIM SHARED rekening(1 TO 5) AS INTEGER            ' Account types
DIM SHARED temp AS INTEGER                        ' Temp variable (space temp?)
DIM SHARED temx AS INTEGER                        ' Temp counter
DIM SHARED autofr AS INTEGER                      ' Auto frequency adjust
DIM SHARED mvy1 AS INTEGER                        ' Temp velocity Y
DIM SHARED mvx1 AS INTEGER                        ' Temp velocity X
DIM SHARED keel AS INTEGER                        ' Cycle counter
DIM SHARED enpro AS SINGLE                        ' Energy consumption rate
DIM SHARED resp AS INTEGER                        ' Response flag
DIM SHARED encol AS INTEGER                       ' Energy bar color
DIM SHARED shcol AS INTEGER                       ' Shield bar color
DIM SHARED spcol AS INTEGER                       ' Speed bar color
DIM SHARED roketschaal AS INTEGER                 ' Rocket scale for bar
DIM SHARED fueltschaal AS INTEGER                 ' Fuel scale for bar
DIM SHARED exshschaal AS INTEGER                  ' Extra shield scale
DIM SHARED enscl AS SINGLE                        ' Energy scale
DIM SHARED shscl AS SINGLE                        ' Shield scale
DIM SHARED extraShieldHold AS SINGLE              ' Extra shield durability
DIM SHARED extraShieldAmount AS SINGLE            ' Extra shield count
DIM SHARED j AS INTEGER                           ' Laser fire flag
DIM SHARED rels AS SINGLE                         ' Laser reload
DIM SHARED rej AS INTEGER                         ' Laser reload flag
DIM SHARED dis AS INTEGER                         ' Display mode
DIM SHARED pt AS INTEGER                          ' Rocket fire flag
DIM SHARED vly AS INTEGER                         ' Velocity lock?
DIM SHARED wlo AS INTEGER                         ' Wall low
DIM SHARED wlo1 AS INTEGER                        ' Wall low 1
DIM SHARED hiz AS INTEGER                         ' Wall direction
DIM SHARED graf AS INTEGER                        ' Gravity flag
DIM SHARED grave AS SINGLE                        ' Gravity strength
DIM SHARED rok AS INTEGER                         ' Rocket active
DIM SHARED gui AS INTEGER                         ' Guide flag?
DIM SHARED rokx AS INTEGER                        ' Rocket X
DIM SHARED roky AS INTEGER                        ' Rocket Y
DIM SHARED rokmvx AS INTEGER                      ' Rocket vel X
DIM SHARED rokmvy AS INTEGER                      ' Rocket Y vel
DIM SHARED rkstp AS INTEGER                       ' Rocket step?
DIM SHARED ty AS INTEGER                          ' Rocket time
DIM SHARED rsp AS INTEGER                         ' Rocket speed
DIM SHARED prrx AS INTEGER                        ' Target X
DIM SHARED prry AS INTEGER                        ' Target Y
DIM SHARED erk AS INTEGER                         ' Error counter?
DIM SHARED arny AS INTEGER                        ' Arn y?
DIM SHARED big AS LONG                            ' Distance sq
DIM SHARED ab AS SINGLE                           ' Accuracy?
DIM SHARED tyo AS INTEGER                         ' Max time
DIM SHARED sdkj AS INTEGER                        ' Hit flag?
DIM SHARED explp AS SINGLE                        ' Explosion power
DIM SHARED enshfr AS INTEGER                      ' Enemy shield freq
DIM SHARED renx AS INTEGER                        ' Beam target X
DIM SHARED reny AS INTEGER                        ' Beam target Y
DIM SHARED desenx AS SINGLE                       ' Desen X? (pull force)
DIM SHARED deseny AS SINGLE                       ' Desen Y
DIM SHARED bt AS INTEGER                          ' Base target
DIM SHARED enat AS INTEGER                        ' Enemy attack
DIM SHARED bl AS INTEGER                          ' Blink?
DIM SHARED s AS INTEGER                           ' Star X?
DIM SHARED t AS INTEGER                           ' Star Y?
DIM SHARED fiterat AS INTEGER                     ' Fighter attack
DIM SHARED fir AS INTEGER                         ' Fire flag
DIM SHARED ftprx AS INTEGER                       ' Fighter target X
DIM SHARED ftpry AS INTEGER                       ' Fighter target Y
DIM SHARED lssp AS INTEGER                        ' Laser speed?
DIM SHARED prsh AS SINGLE                         ' Prev shield?
DIM SHARED fiterat2 AS INTEGER                    ' Second fighter attack
DIM SHARED fitera2 AS INTEGER                     ' Second fighter active?
DIM SHARED lssp2 AS INTEGER                       ' Second laser speed
DIM SHARED fir2 AS INTEGER                        ' Second fire flag
DIM SHARED ftprx2 AS INTEGER                      ' Second target X
DIM SHARED ftpry2 AS INTEGER                      ' Second target Y
DIM SHARED cprx AS INTEGER                        ' Cruiser target X
DIM SHARED cpry AS INTEGER                        ' Cruiser target Y
DIM SHARED csp AS INTEGER                         ' Cruiser speed
DIM SHARED lscruisersh AS SINGLE                  ' Last cruiser shield
DIM SHARED spls AS INTEGER                        ' Special laser?
DIM SHARED ae3 AS SINGLE                          ' Upgrade progress?
DIM SHARED ae AS SINGLE                           ' Upgrade counter
DIM SHARED ae2 AS SINGLE                          ' Upgrade max
DIM SHARED ha AS INTEGER                          ' Upgrade allowed
DIM SHARED cx AS INTEGER                          ' Dock X
DIM SHARED cy AS INTEGER                          ' Dock Y
DIM SHARED yo AS INTEGER                          ' Dock actions
DIM SHARED mox AS INTEGER                         ' Moon X
DIM SHARED moy AS INTEGER                         ' Moon Y
DIM SHARED qqq AS INTEGER                         ' Moon draw flag
DIM SHARED a AS SINGLE                            ' Temp loop var
DIM SHARED B AS SINGLE                            ' Temp loop var
DIM SHARED c AS SINGLE                            ' Temp loop var
DIM SHARED d AS SINGLE                            ' Temp loop var
DIM SHARED y AS INTEGER                           ' Temp wall flag
DIM SHARED viz AS INTEGER                         ' Viz state
DIM SHARED erx AS INTEGER                         ' Er X
DIM SHARED ery AS INTEGER                         ' Er Y
DIM SHARED sorx AS INTEGER                        ' Sor X
DIM SHARED sory AS INTEGER                        ' Sor Y
DIM SHARED tpe AS INTEGER                         ' Teleport?
DIM SHARED res AS SINGLE                          ' Resource?
DIM SHARED pinnum AS LONG                         ' Pin number
DIM SHARED pinn1 AS INTEGER                       ' Pin digit 1
DIM SHARED pinn2 AS INTEGER                       ' Pin digit 2
DIM SHARED pinn3 AS INTEGER                       ' Pin digit 3
DIM SHARED pinn4 AS INTEGER                       ' Pin digit 4
DIM SHARED player AS INTEGER                      ' Cheat mode?
DIM SHARED wat AS INTEGER                         ' Transport type
DIM SHARED ai AS SINGLE                           ' Max transport
DIM SHARED xpl AS SINGLE                          ' Transport X
DIM SHARED ypl AS SINGLE                          ' Transport Y
DIM SHARED selmv AS INTEGER                       ' Self move?
DIM SHARED hpx AS INTEGER                         ' Hit X
DIM SHARED hpy AS INTEGER                         ' Hit Y
DIM SHARED h AS SINGLE                            ' Temp
DIM SHARED ex AS INTEGER                          ' Explosion?
DIM SHARED st$ AS STRING                          ' Continue input
DIM SHARED B$ AS STRING                           ' Input strings...
DIM SHARED i$ AS STRING
DIM SHARED k$ AS STRING
DIM SHARED l$ AS STRING
DIM SHARED m$ AS STRING
DIM SHARED c$ AS STRING
DIM SHARED d$ AS STRING
DIM SHARED j$ AS STRING
DIM SHARED e$ AS STRING
DIM SHARED F$ AS STRING
DIM SHARED G$ AS STRING
DIM SHARED h$ AS STRING
DIM SHARED bank1 AS INTEGER
DIM SHARED fout AS INTEGER
DIM SHARED rek AS INTEGER
DIM SHARED stort AS SINGLE
DIM SHARED aflos AS SINGLE
DIM SHARED geleend AS SINGLE
DIM SHARED er AS INTEGER
DIM SHARED opn AS SINGLE
DIM SHARED pisn AS LONG
DIM SHARED endesx AS SINGLE
DIM SHARED endesy AS SINGLE
DIM SHARED docking AS INTEGER                     ' Docking flag
DIM SHARED gameOverFlag AS INTEGER                ' Game over flag

' Initialize the game
InitGame

' Main game loop
DO
    UpdateTime
    HandleAutoPilot
    HandleResponses
    UpdateFrequencies
    UpdatePlayerStats
    HandleChargingAndAcceleration
    UpdateEnergyConsumption
    HandleRepairAndRefuel
    DrawUI
    AdjustWindow
    HandleInput
    UpdateRocket
    UpdateBeam
    DrawWalls
    DrawMoon
    DrawEarth
    DrawPlayerShip
    DrawBase
    DrawDockingStation2
    DrawDockingLines
    UpdateMiner
    UpdateEnemies
    CheckCollisions
    IF playerDamage > 99 OR playerEnergy < 0 THEN gameOverFlag = 1
LOOP UNTIL gameOverFlag = 1

GameOver

END

SUB InitGame
    ' Initialize ship possessions
    playerLaserEnabled = 1
    playerRocketLauncher = 1
    playerAutoPilot = 1
    playerHyperDrive = 1
    playerAutoRepair = 0
    playerAutoLaser = 0
    playerAutoRocket = 0
    playerTracer = 0
    playerBeam = 0
    playerAutoBeam = 0
    playerMultiCom = 0
    playerAutoRefuel = 0
    dockingStation2 = 0

    ' Positions and places
    laserFrequency = 1
    playerDamage = 0
    enemyType = 0
    maxLaserFrequency = 10
    beamFrequency = 1
    maxBeamFrequency = 10
    shieldFrequency = 1
    maxShieldFrequency = 10
    cruiserFrequency = 5
    fighterFrequency = 10
    fighterFrequency2 = 9
    enemyBaseFrequency = 20
    maxCruiserFrequency = 11
    maxFighterFrequency2 = 11
    maxEnemyBaseFrequency = 25
    extraShieldFrequency = 1
    maxExtraShieldFrequency = 10
    dockingStation = 0
    moonVisible = 1
    earthVisible = 1
    extraShieldActive = 1
    torus = 1
    battleStation = 0
    fighterLevel = 1
    fighterLevel2 = 1
    torusX = 325
    cruiserLevel = 1
    enemyBaseLevel = 1
    extraShieldLevel = 1
    tractorSensor = 0
    minutes = 0
    day = 2
    month = 6
    year = 2022
    laserLevel = 1
    enemyProximity = 4 / shipLevel
    fighter2Active = 1
    cruiserShield = 600
    cruiserDamage = 0
    cruiserActive = 1
    autoDefense = 1
    fighterActive = 1
    rockets = 5
    enemyScale = 1
    shieldScale = 1
    fighterX = -6000
    fighterY = 3532
    credits = 200000
    fighterX2 = 6000
    fighterY2 = -5532
    kiz = 1
    playerEnergy = 400
    rocketLevel = 1
    laserEnemyBaseShield = 600
    laserCruiserShield = 600
    laserFighterShield = 200
    laserFighterShield2 = 800
    windowXMax = 930
    windowYMax = 500
    windowXMin = -70
    playerMode = 2
    windowYMin = -500
    cruiserX = -9000
    cruiserY = 8000
    maxSpeed = 10
    enemyBaseX = 24121
    enemyBaseY = -18000
    enemyBaseActive = 1
    playerX = 430
    playerY = 0
    earthX = -20000
    earthY = 0
    fuelTanks = 3
    playerShield = 200
    baseShield = 200
    baseEnergy = 400
    fighterDamage = 0
    fighterShield = 200
    fighterDamage2 = 0
    fighterShield2 = 200
    baseDamage = 0
    enemyBaseDamage = 0
    enemyBaseShield = 600
    shipLevel = 4
    rocketLaunchLevel = 1
    maxShield = playerShield
    maxEnergyTotal = 600

    ' Additional initializations
    gur = 0
    respst = 0
    come = 0
    go = 0
    gotime = 0
    cl = 0
    stp = 0
    mi = 0
    ghn = 0
    zus = 0
    fo = 0
    fol = 0
    wa = 0
    fu = 1
    ful = 1
    lenbed = 0
    leen = 0
    rekrek = 0
    gespbed = 0
    FOR i = 1 TO 5
        rekening(i) = 0
    NEXT i
    temp = 0
    temx = 0
    autofr = 0
    mvy1 = 0
    mvx1 = 0
    keel = 0
    enpro = 0
    resp = 0
    encol = 0
    shcol = 0
    spcol = 0
    roketschaal = 0
    fueltschaal = 0
    exshschaal = 0
    enscl = 1
    shscl = 1
    extraShieldHold = 0
    extraShieldAmount = 1
    j = 0
    rels = 0
    rej = 0
    dis = 1
    pt = 0
    vly = 0
    wlo = 0
    wlo1 = 0
    hiz = 0
    graf = 0
    grave = 0
    rok = 0
    gui = 0
    rokx = 0
    roky = 0
    rokmvx = 0
    rokmvy = 0
    rkstp = 0
    ty = 0
    rsp = 0
    prrx = 0
    prry = 0
    erk = 0
    arny = 0
    big = 0
    ab = 0
    tyo = 0
    sdkj = 0
    explp = 1
    enshfr = 0
    renx = 0
    reny = 0
    desenx = 0
    deseny = 0
    bt = 0
    enat = 0
    bl = 0
    s = 0
    t = 0
    fiterat = 0
    fir = 0
    ftprx = 0
    ftpry = 0
    lssp = 0
    prsh = 0
    fiterat2 = 0
    fitera2 = 0
    lssp2 = 0
    fir2 = 0
    ftprx2 = 0
    ftpry2 = 0
    cprx = 0
    cpry = 0
    csp = 0
    lscruisersh = 600
    spls = 0
    ae3 = 0
    ae = 0
    ae2 = 0
    ha = 0
    cx = 0
    cy = 0
    yo = 0
    mox = -5000
    moy = 6000
    qqq = 0
    a = 0
    B = 0
    c = 0
    d = 0
    y = 0
    viz = 0
    erx = 0
    ery = 0
    sorx = 0
    sory = 0
    tpe = 0
    res = 0
    pinnum = 0
    player = 0
    wat = 0
    ai = 0
    xpl = 0
    ypl = 0
    selmv = 0
    hpx = 0
    hpy = 0
    ex = 0
    bank1 = 0
    fout = 0
    rek = 0
    stort = 0
    aflos = 0
    geleend = 0
    er = 0
    opn = 0
    pisn = 0
    endesx = 0
    endesy = 0
    docking = 0
    gameOverFlag = 0

    ' Set initial max values
    maxLaserFrequency = (shipLevel * 2 + 2)
    maxBeamFrequency = (shipLevel * 2 + 2)
    maxShieldFrequency = (shipLevel * 2 + 2)
    maxExtraShieldFrequency = (shipLevel * 2 + 2)

END SUB

SUB UpdateTime
    ' From label 74
    cruiserActive = 1
    enemyBaseActive = 1
    fighterActive = 1
    fighter2Active = 1
    minutes = minutes + 1
    IF minutes > 24 THEN minutes = 0
    IF minutes = 24 THEN day = day + 1
    IF day > 30 THEN
        day = 1
        month = month + 1
    END IF
    IF month = 13 THEN
        month = 1
        year = year + 1
    END IF

    ' Handle loan (from 68,73)
    IF leen = 1 AND minutes = 0 THEN
        lenbed = lenbed + (lenbed * .05)
        credits = credits - (lenbed * .05)
        lenbed = lenbed - (lenbed * .05)
        IF credits < 1 THEN playerShield = playerShield - (maxShield * .5)
    END IF

    ' Handle savings (from 70,72)
    IF rekrek = 1 AND day = 3 AND minutes = 0 THEN
        IF rekening(1) = 1 THEN gespbed = gespbed + (gespbed * .05)
        IF rekening(2) = 1 THEN gespbed = gespbed + 200
        IF rekening(3) = 1 THEN gespbed = gespbed + (gespbed * .1)
        IF rekening(4) = 1 THEN gespbed = gespbed + (gespbed * .15)
        IF rekening(5) = 1 THEN gespbed = gespbed + (gespbed * .3)
    END IF

    ' Update enemy proximity
    enemyProximity = 4 / shipLevel
END SUB

SUB HandleAutoPilot
    ' From label 1
    IF gur <> 1 THEN EXIT SUB
    IF playerX < xgo THEN mvx = -spgo
    IF playerY < ygo THEN mvy = -spgo
    IF playerX > xgo THEN mvx = spgo
    IF playerY > ygo THEN mvy = spgo
    IF playerX = xgo AND playerY = ygo THEN gur = 0
END SUB

SUB HandleResponses
    ' From label 83
    IF respst = 1 THEN EXIT SUB
    come = come + 1
    LOCATE 1, 1
    IF go = 1 THEN gotime = come + 4: go = 0
    IF gotime = come THEN cl = 1
    IF cl = 1 THEN LINE (windowXMax, windowYMax)-(windowXMin, windowYMax - 70), 0, BF: cl = 0
    IF come = 1 THEN cl = 1
    IF come = 2 THEN PRINT "This is your commander speaking"
    IF come = 6 THEN cl = 1
    IF come = 7 THEN PRINT "You orders are to wait until your tank is full"
    IF come = 11 THEN cl = 1
    IF come = 12 THEN PRINT "there are no enemies spoted near you"
    IF come = 16 THEN cl = 1
    IF stp = 1 AND mi = 0 AND come > 20 THEN PRINT "your first mission is to lokate the enemy base!": go = 1: mi = 1
    IF playerX < 900 AND playerY < 900 AND playerX > -900 AND playerY > -900 THEN ghn = 1 ELSE IF stp = 0 AND playerEnergy < maxEnergyTotal - 10 THEN PRINT "you are not ready to go!,Return to base": go = 1
    IF playerEnergy > maxEnergyTotal - 10 AND playerX < 900 AND playerY < 900 AND playerX > -900 AND playerY > -900 THEN PRINT "You are ready to go now,lift of at wil": go = 1: stp = 1
    IF playerEnergy < maxEnergyTotal / 4 AND stp = 1 THEN PRINT "!!YOUR energy is low refuel atonce!!": go = 1
    IF playerShield < maxShield / 4 AND zus = 0 THEN PRINT "!!YOUR SHIELD IS LOW!!": go = 1
    IF cruiserX < 1000 + windowXMax AND cruiserX > windowXMin - 1000 AND cruiserY < 1000 + windowYMax AND cruiserY > windowYMin - 1000 THEN PRINT "there is a enemy cruiser spoted near you ": go = 1
    IF fighterX2 < 1000 + windowXMax AND fighterX2 > windowXMin - 1000 AND fighterY2 < 1000 + windowYMax AND fighterY2 > windowYMin - 1000 THEN PRINT "there is a enemy fiter spoted near you ": go = 1
    IF fighterX < 1000 + windowXMax AND fighterX > windowXMin - 1000 AND fighterY < 1000 + windowYMax AND fighterY > windowYMin - 1000 THEN PRINT "there is a enemy fiter spoted near you ": go = 1
    IF rockets < 3 AND rockets > 1 AND fo = 0 THEN PRINT "you are running out of foton torpedos": go = 1: fo = 0 ELSE fo = 1
    IF rockets < 1 AND fol = 0 THEN PRINT "you lost all you foto torpedos ": go = 1: fol = 0 ELSE fol = 1
    IF fo = 0 AND wa = 0 THEN wa = come + 40: fo = 1
    IF fol = 0 AND wa = 0 THEN wa = come + 40: fol = 1
    IF wa = come THEN fol = 0: fo = 0: wa = 0
    IF fuelTanks < 3 AND fuelTanks > 1 AND fu = 1 THEN PRINT "you are running out of fueltanks ": go = 1: fu = 0 ELSE fu = 1
    IF fuelTanks < 1 AND ful = 1 THEN PRINT "you lost all you fueltanks ": go = 1: ful = 0 ELSE ful = 1
    IF fu = 0 AND wa = 0 THEN wa = come + 40: fu = 1
    IF ful = 0 AND wa = 0 THEN wa = come + 40: ful = 1
    IF wa = come THEN ful = 0: fu = 0: wa = 0
END SUB

SUB UpdateFrequencies
    ' From 71 to 111
    temx = temx + 1
    IF temx = 1 OR temx = 2 OR temx = 100 OR temx = 1000 THEN enemyType = 0
    ' Skip if near star (from if xcoi < s + 20 etc.)
    LINE (s + 60, t + 60)-(s - 60, t - 60), 0, BF
    LINE (s + 20, t + 20)-(s - 20, t - 20), 14, BF
    temp = temp - 5
    IF autofr = 0 THEN GOTO SkipAutoFr
    IF enemyType = 0 THEN GOTO SetMaxFr
    SELECT CASE enemyType
        CASE 1: laserFrequency = cruiserFrequency: beamFrequency = cruiserFrequency
        CASE 2: laserFrequency = fighterFrequency: beamFrequency = fighterFrequency
        CASE 3: laserFrequency = fighterFrequency2: beamFrequency = fighterFrequency2
        CASE 4: laserFrequency = enemyBaseFrequency: beamFrequency = enemyBaseFrequency
    END SELECT
SetMaxFr:
    shieldFrequency = maxShieldFrequency
    extraShieldFrequency = maxExtraShieldFrequency
SkipAutoFr:
    maxLaserFrequency = (shipLevel * 2 + 2)
    maxBeamFrequency = (shipLevel * 2 + 2)
    maxShieldFrequency = (shipLevel * 2 + 2)
    maxExtraShieldFrequency = (shipLevel * 2 + 2)
    IF temp > -2000 THEN temp = -2000
    IF mvy1 > 10 THEN mvy = mvy1
    IF mvy1 < -10 THEN mvy = mvy1
    IF mvx1 > 10 THEN mvx = mvx1
    tractorSensor = tractorSensor + (.05 * (shipLevel / 2))
    IF tractorSensor > 100 THEN tractorSensor = 100
    IF mvx1 < -10 THEN mvx = mvx1
    IF zus = 1 AND playerEnergy = maxEnergyTotal THEN rockets = rockets + .001 + (shipLevel * .0001)
    IF zus = 1 AND playerEnergy = maxEnergyTotal THEN fuelTanks = fuelTanks + .0005 + (shipLevel * .0001): maxShield = maxShield + .0005 + (shipLevel * .00005): maxEnergyTotal = maxEnergyTotal + .0005 + (shipLevel * .00005)
    keel = keel + 1
    IF keel = 6000 THEN keel = 1
END SUB

SUB UpdateEnergyConsumption
    ' Energy consumption based on movement
    IF mvx > 0 AND mvy > 0 THEN playerEnergy = playerEnergy - (maxSpeed * .01 + (.05 * (mvy + mvx)) * enemyProximity)
    IF mvx < 0 AND mvy > 0 THEN playerEnergy = playerEnergy - (maxSpeed * .01 + (.05 * (mvy - mvx)) * enemyProximity)
    IF mvx > 0 AND mvy < 0 THEN playerEnergy = playerEnergy - (maxSpeed * .01 + (.05 * (-mvy + mvx)) * enemyProximity)
    IF mvx < 0 AND mvy < 0 THEN playerEnergy = playerEnergy - (maxSpeed * .01 + (.05 * (-mvy - mvx)) * enemyProximity)
    IF mvx > 0 AND mvy = 0 THEN playerEnergy = playerEnergy - (maxSpeed * .01 + (.05 * (mvx)) * enemyProximity)
    IF mvx < 0 AND mvy = 0 THEN playerEnergy = playerEnergy - (maxSpeed * .01 + (.05 * (-mvx)) * enemyProximity)
    IF mvx = 0 AND mvy > 0 THEN playerEnergy = playerEnergy - (maxSpeed * .01 + (.05 * (mvy)) * enemyProximity)
    IF mvx = 0 AND mvy < 0 THEN playerEnergy = playerEnergy - (maxSpeed * .01 + (.05 * (-mvy)) * enemyProximity)
    credits = credits + .05
    IF mvx = 0 AND mvy = 0 THEN playerEnergy = playerEnergy - ((maxSpeed * .01) * enemyProximity)
END SUB

SUB HandleChargingAndAcceleration
    ' Charging at base (zus=1)
    IF zus = 1 THEN
        LINE (playerX - 8, playerY - 20)-(playerX - 100, playerY + 20), 14, B
        playerEnergy = playerEnergy + .625: maxSpeed = 1: enemyProximity = .001
        IF playerShield > 45 THEN playerShield = 45
        LINE (playerX + 12, playerY - 20)-(playerX + 100, playerY + 20), 14, B
        playerEnergy = playerEnergy + .625
        LINE (playerX - 15, playerY - 14)-(playerX + 15, playerY - 120), 14, B
        playerEnergy = playerEnergy + .625
        LINE (playerX - 15, playerY + 14)-(playerX + 15, playerY + 120), 14, B
        playerEnergy = playerEnergy + .625
        PAINT (playerX, playerY + 50), 0, 14
        PAINT (playerX, playerY - 50), 0, 14
        PAINT (playerX - 50, playerY), 0, 14
        PAINT (playerX + 50, playerY), 0, 14
    END IF

    ' Acceleration modes
    IF zus = 2 AND playerShield > 76 THEN zus = 3: resp = 1
    IF zus = 3 AND enemyType = 0 AND maxSpeed < shipLevel * 2 + 10 THEN zus = 3
    IF zus = 3 AND enemyType <> 0 AND maxSpeed < shipLevel * 2 + 10 THEN zus = 0
    IF zus = 2 AND maxSpeed < shipLevel * 2 + 10 THEN maxSpeed = maxSpeed + 1
    IF zus = 3 AND maxSpeed < shipLevel * 2 + 10 THEN maxSpeed = maxSpeed + 1
    IF zus = 3 AND maxSpeed >= shipLevel * 2 + 10 THEN zus = 0: resp = 0
    IF zus = 1 THEN tractorSensor = 0
    IF zus = 0 THEN resp = 0
    IF zus = 2 THEN tractorSensor = tractorSensor + (.2 * (shipLevel / 2))
    IF zus = 2 AND tractorSensor > 100 THEN tractorSensor = 100
    IF zus = 1 AND extraShieldActive <> 1 AND extraShieldAmount > .999 THEN extraShieldActive = 1: extraShieldAmount = extraShieldAmount - 1: extraShieldHold = 100 * extraShieldLevel
    IF zus = 1 THEN extraShieldAmount = extraShieldAmount + .005 + (.001 * shipLevel)
END SUB

SUB HandleRepairAndRefuel
    ' Shield regen
    playerShield = playerShield + shipLevel / 2 + 2.5
    IF playerShield > maxShield THEN playerShield = maxShield
    IF playerShield < 1 THEN playerDamage = playerDamage + (-playerShield * (4 / shipLevel)): playerShield = 10

    ' Energy limits
    IF playerEnergy > maxEnergyTotal THEN playerEnergy = maxEnergyTotal
    IF maxEnergyTotal > 8000 THEN maxEnergyTotal = 8000
    IF maxShield > 8000 THEN maxShield = 8000
    IF maxSpeed > 50 THEN maxSpeed = 50
    IF playerEnergy < 10 AND fuelTanks > .99 AND playerAutoRefuel = 1 THEN fuelTanks = fuelTanks - 1: playerEnergy = playerEnergy + 300
    IF zus = 0 AND playerShield < 76 AND fuelTanks > .99 THEN fuelTanks = fuelTanks - 1: playerShield = playerShield + 100
    IF playerDamage > 10 AND playerAutoRepair = 1 THEN playerDamage = playerDamage - (.5 * shipLevel): playerEnergy = playerEnergy - 10
    IF fuelTanks > 120 THEN fuelTanks = 120
    IF extraShieldAmount > 120 THEN extraShieldAmount = 120
    IF extraShieldActive = 1 THEN CIRCLE (playerX, playerY), 32, 4
    IF extraShieldActive = 1 THEN CIRCLE (playerX, playerY), 30, 14
    IF zus = 1 AND extraShieldActive = 1 AND playerShield < 45 THEN extraShieldHold = extraShieldHold - ((maxShield - playerShield) - extraShieldLevel)
    IF zus <> 1 AND extraShieldActive = 1 AND playerShield < maxShield THEN extraShieldHold = extraShieldHold - ((maxShield - playerShield) - extraShieldLevel)
    IF extraShieldHold < 1 THEN extraShieldActive = 0
    IF zus <> 1 AND extraShieldActive = 1 AND playerShield < maxShield THEN playerShield = maxShield: playerEnergy = playerEnergy - (15 - extraShieldLevel)
    IF fuelTanks <= 0 THEN fuelTanks = 0
END SUB

SUB DrawUI
    ' Colors for bars
    IF playerEnergy > maxEnergyTotal / 3 THEN encol = 14
    IF playerEnergy <= maxEnergyTotal / 4 THEN encol = 4
    IF playerEnergy > maxEnergyTotal / 2 THEN encol = 2
    IF maxSpeed > 20 THEN spcol = 4
    IF maxSpeed < 40 THEN spcol = 14
    IF maxSpeed < 20 THEN spcol = 2
    IF playerShield > maxShield / 3 THEN shcol = 14
    IF playerShield < maxShield / 4 THEN shcol = 4
    IF playerShield > maxShield / 2 THEN shcol = 2

    ' Scale for bars
    IF rockets <= 80 THEN roketschaal = 8
    IF rockets < 40 THEN roketschaal = 4
    IF rockets < 20 THEN roketschaal = 2
    IF rockets < 10 THEN roketschaal = 1
    IF rockets > 80 THEN rockets = 80
    IF fuelTanks <= 120 THEN fueltschaal = 8
    IF fuelTanks < 60 THEN fueltschaal = 4
    IF fuelTanks < 30 THEN fueltschaal = 2
    IF fuelTanks < 15 THEN fueltschaal = 1
    IF extraShieldAmount <= 120 THEN exshschaal = 8
    IF extraShieldAmount < 60 THEN exshschaal = 4
    IF extraShieldAmount < 30 THEN exshschaal = 2
    IF extraShieldAmount < 15 THEN exshschaal = 1
    IF maxEnergyTotal < 500 THEN enscl = 1
    IF maxEnergyTotal >= 500 THEN enscl = 2
    IF maxEnergyTotal > 1000 THEN enscl = 4
    IF maxEnergyTotal > 2000 THEN enscl = 8
    IF maxEnergyTotal > 4000 THEN enscl = 16
    IF maxShield < 500 THEN shscl = 1
    IF maxShield >= 500 THEN shscl = 2
    IF maxShield > 1000 THEN shscl = 4
    IF maxShield > 2000 THEN shscl = 8
    IF maxShield > 4000 THEN shscl = 16

    ' Draw bars
    LINE (windowXMin + 475, windowYMin + 60)-(windowXMin + 475 + 50, windowYMin + 80), 1, BF
    LINE (windowXMin + 475, windowYMin + 60)-(windowXMin + 475 + maxSpeed, windowYMin + 80), spcol, BF
    LINE (windowXMin + 450, windowYMin)-(windowXMin + 450 + 100, windowYMin + 20), 1, BF
    IF mvy > 0 THEN LINE (windowXMin + 450, windowYMin)-(windowXMin + 450 + mvx + mvy, windowYMin + 20), 8, BF
    IF mvy < 0 THEN LINE (windowXMin + 450, windowYMin)-(windowXMin + 450 - mvx - mvy, windowYMin + 20), 8, BF
    IF mvx > 0 THEN LINE (windowXMin + 450, windowYMin)-(windowXMin + 450 + mvx + mvy, windowYMin + 20), 8, BF
    IF mvx < 0 THEN LINE (windowXMin + 450, windowYMin)-(windowXMin + 450 - mvx - mvy, windowYMin + 20), 8, BF
    LINE (windowXMin, windowYMin + 60)-(windowXMin + 100, windowYMin + 80), 1, BF
    LINE (windowXMax, windowYMin + 60)-(windowXMax - 150, windowYMin + 80), 1, BF
    LINE (windowXMax, windowYMin)-(windowXMax - 150, windowYMin + 20), 1, BF
    LINE (windowXMin, windowYMin + 60)-(windowXMin + ((rockets * 10) / roketschaal), windowYMin + 80), 8, BF
    LINE (windowXMax, windowYMin + 60)-(windowXMax - ((fuelTanks * 10) / fueltschaal), windowYMin + 80), 8, BF
    LINE (windowXMax, windowYMin)-(windowXMax - ((extraShieldAmount * 10) / exshschaal), windowYMin + 20), 8, BF
    IF playerHyperDrive = 1 THEN LINE (windowXMin, windowYMin)-(windowXMin + 100, windowYMin + 20), 1, BF
    IF playerHyperDrive = 1 THEN LINE (windowXMin, windowYMin)-((windowXMin + tractorSensor), windowYMin + 20), 8, BF
    LINE (windowXMin + 500 + (maxEnergyTotal / enscl), windowYMin + 20)-(windowXMax - 500 - (maxEnergyTotal / enscl), windowYMin + 60), 1, BF
    LINE (windowXMin + 500 + (maxShield / shscl), windowYMin + 80)-(windowXMax - 500 - (maxShield / shscl), windowYMin + 120), 1, BF
    LINE (windowXMin + 500 + (playerEnergy / enscl), windowYMin + 20)-(windowXMax - 500 - (playerEnergy / enscl), windowYMin + 60), encol, BF
    LINE (windowXMin + 500 + (playerShield / shscl), windowYMin + 80)-(windowXMax - 500 - (playerShield / shscl), windowYMin + 120), shcol, BF
    IF playerX < 5000 AND playerY < 5000 AND playerX > -5000 AND playerY > -5000 AND playerEnergy < 50 THEN playerEnergy = playerEnergy + 50: baseEnergy = baseEnergy - 5: enemyProximity = .01
    LINE (windowXMin + 450, windowYMin + 120)-(windowXMin + 550, windowYMin + 140), 1, BF
    IF rels < 201 THEN LINE (windowXMin + 450, windowYMin + 120)-(windowXMin + 450 + (rels / 2), windowYMin + 140), 14, BF
    IF rels < 101 THEN LINE (windowXMin + 450, windowYMin + 120)-(windowXMin + 450 + rels, windowYMin + 140), 2, BF
    IF rels > 200 THEN LINE (windowXMin + 450, windowYMin + 120)-(windowXMin + 450 + (rels / 4), windowYMin + 140), 4, BF
    WINDOW ((windowXMax), (windowYMax))-((windowXMin), (windowYMin))
END SUB

SUB AdjustWindow
    ' Adjust viewing window based on player position
    IF playerY > windowYMax - 450 THEN windowYMax = windowYMax + mvy: windowYMin = windowYMin + mvy
    IF playerY < windowYMin + 450 THEN windowYMax = windowYMax + mvy: windowYMin = windowYMin + mvy
    IF playerX > windowXMax - 450 THEN windowXMax = windowXMax + mvx: windowXMin = windowXMin + mvx
    IF playerX < windowXMin + 450 THEN windowXMax = windowXMax + mvx: windowXMin = windowXMin + mvx
    IF playerMode <> 1 THEN EXIT SUB
    mvy = 0: mvx = 0
    windowYMax = 500
    windowYMin = -500
    windowXMax = 500
    windowXMin = -500
END SUB

SUB HandleInput
    a$ = INKEY$
    IF a$ = "" THEN EXIT SUB

    ' Docking and other commands
    IF a$ = "o" AND dockingStation2 = 1 THEN credits = credits + (ae2 * 1000): dockingStation2 = 0
    IF a$ = "4" THEN CLS: SLEEP
    IF a$ = "5" THEN ShowReport
    IF a$ = "j" AND playerLaserEnabled = 1 THEN j = j + 1: IF j = 2 THEN j = 0
    IF enemyType <> 0 AND playerAutoLaser = 1 THEN j = 1
    IF rels < 100 AND playerAutoLaser = 1 AND enemyType <> 0 THEN j = 0
    IF enemyType = 0 AND playerAutoLaser = 1 THEN j = 0
    IF a$ = "u" AND extraShieldAmount > .999 THEN extraShieldAmount = extraShieldAmount - 1: extraShieldActive = extraShieldActive + 1: playerEnergy = playerEnergy - (25 * extraShieldLevel): extraShieldHold = extraShieldLevel * 100: IF extraShieldActive = 2 THEN extraShieldActive = 0
    IF rels > 400 THEN rels = 400
    IF zus = 0 THEN rels = rels + (shipLevel / 2) + 2.5
    IF rels > (25 * shipLevel) THEN rels = (25 * shipLevel)
    IF j = 1 AND rels > 99 THEN rels = rels - 100: FireLaser
    IF j = 1 AND rels < 0 THEN rels = 0
    IF j = 0 AND rej = 1 AND rels > 99 THEN j = 1: rej = 0
    IF a$ = "i" THEN ShopMenu
    IF a$ = "9" THEN zus = zus + 1: IF zus = 3 AND resp = 0 THEN zus = 0
    IF a$ = "]" AND playerAutoPilot = 1 THEN SetAutoPilot
    IF a$ = "[" AND fuelTanks > .99 THEN fuelTanks = fuelTanks - 1: IF playerEnergy < maxEnergyTotal THEN playerEnergy = playerEnergy + 300 ELSE playerShield = playerShield + 100
    IF a$ = "t" AND playerHyperDrive = 1 THEN HyperDrive
    IF a$ = "8" THEN LINE (windowXMin, windowYMax)-(windowXMin + 200, windowYMin), 0, BF
    IF a$ = "7" THEN CLS
    IF a$ = "0" THEN dis = dis + 1: IF dis = 2 THEN dis = 1
    IF enemyType <> 0 AND playerAutoRocket = 1 THEN pt = 1
    IF enemyType = 0 AND playerAutoRocket = 1 THEN pt = 0
    IF a$ = "p" AND playerRocketLauncher = 1 THEN pt = pt + 1: IF pt = 2 THEN pt = 0: tyo = 0
    IF pt = 1 THEN LaunchRocket
    IF a$ = "w" THEN mvy = mvy + 1
    IF a$ = "'" AND zus = 1 THEN RUN "c:\menu\menu.com"  ' External call, keep as is
    IF a$ = "x" THEN mvy = mvy - 1
    IF a$ = "y" THEN enemyType = 0
    IF a$ = "d" THEN mvx = mvx + 1
    IF a$ = "a" THEN mvx = mvx - 1
    IF a$ = "q" THEN mvy = mvy + 1: mvx = mvx - 1
    IF a$ = "g" THEN battleStation = battleStation + 1: IF battleStation = 2 THEN battleStation = 0
    IF a$ = "e" THEN mvy = mvy + 1: mvx = mvx + 1
    IF a$ = "c" THEN mvy = mvy - 1: mvx = mvx + 1
    IF a$ = "z" THEN mvy = mvy - 1: mvx = mvx - 1
    IF a$ = "s" THEN mvy = 0: mvx = 0: mvx1 = 0: mvy1 = 0
    IF a$ = "6" THEN respst = respst + 1: IF respst = 2 THEN respst = 0
    IF a$ = "o" THEN StartDocking
    IF a$ = "l" THEN maxSpeed = maxSpeed + 1: IF maxSpeed > shipLevel * 2 + 10 THEN maxSpeed = shipLevel * 2 + 10: IF maxSpeed > 50 THEN maxSpeed = 50
    IF a$ = "k" THEN maxSpeed = maxSpeed - 1: IF maxSpeed < 0 THEN maxSpeed = 0
    IF a$ = "1" THEN playerMode = 1
    IF a$ = "2" THEN playerMode = 2

    ' Velocity limits
    IF mvy > maxSpeed AND vly = 0 THEN mvy = maxSpeed
    IF mvy < -maxSpeed AND vly = 0 THEN mvy = -maxSpeed
    IF mvx > maxSpeed AND vly = 0 THEN mvx = maxSpeed
    IF mvx < -maxSpeed AND vly = 0 THEN mvx = -maxSpeed
    IF mvy > 0 AND vly = 0 THEN playerY = playerY + mvy
    IF mvy < 0 AND vly = 0 THEN playerY = playerY + mvy
    IF mvx > 0 AND vly = 0 THEN playerX = playerX + mvx
    IF mvx < 0 AND vly = 0 THEN playerX = playerX + mvx
    IF mvy > 10 THEN mvy1 = mvy: mvy = 10
    IF mvy < -10 THEN mvy1 = mvy: mvy = -10
    IF mvx > 10 THEN mvx1 = mvx: mvx = 10
    IF mvx < -10 THEN mvx1 = mvx: mvx = -10
    SOUND 0, .5
END SUB

SUB UpdatePlayerStats
    ' Update player stats like energy color, etc.
    IF playerEnergy < 0 THEN gameOverFlag = 1
    IF playerEnergy > maxEnergyTotal THEN playerEnergy = maxEnergyTotal
    IF playerEnergy > maxEnergyTotal / 3 THEN encol = 14
    IF playerEnergy <= maxEnergyTotal / 4 THEN encol = 4
    IF playerEnergy > maxEnergyTotal / 2 THEN encol = 2
END SUB

SUB DrawWalls
    ' From 84
    IF hiz = 0 THEN wlo = wlo - 5: wlo1 = wlo1 + 5
    IF hiz = 1 THEN wlo = wlo + 10: wlo1 = wlo1 - 10
    IF wlo <= 0 THEN hiz = 1
    IF wlo >= 400 THEN hiz = 0
    IF a = 0 AND windowXMin < -19000 AND windowXMax > -24000 AND windowYMin < 24000 AND windowYMax > -24000 THEN a = 1: DrawWall1
    IF B = 0 AND windowXMax > 19000 AND windowXMin < 24000 AND windowYMin < 24000 AND windowYMax > -24000 THEN B = 1: DrawWall2
    IF c = 0 AND windowXMax > -19000 AND windowXMin < 24000 AND windowYMin < -19000 AND windowYMax > -24000 THEN c = 1: DrawWall3
    IF d = 0 AND windowXMax > -19000 AND windowXMin < 24000 AND windowYMax > 19000 AND windowYMin < 24000 THEN d = 1: DrawWall4
    a = 0: B = 0: c = 0: d = 0

    ' Wall collisions
    IF playerX < -19000 AND playerX > -24000 AND playerY < wlo1 + 30 AND playerY > -24000 THEN HandleWallCollision
    IF playerX < -19000 AND playerX > -24000 AND playerY > wlo - 30 AND playerY < 24000 THEN HandleWallCollision
    IF playerX > 19000 AND playerX < 24000 AND playerY > -24000 AND playerY < 24000 THEN HandleWallCollision
    IF playerX > -19000 AND playerX < 24000 AND playerY < -19000 AND playerY > -24000 THEN HandleWallCollision
    IF playerX > -19000 AND playerX < 24000 AND playerY > 19000 AND playerY < 24000 THEN HandleWallCollision
END SUB

SUB DrawWall1
    LINE (-18900, -24000)-(-24100, 24000), 0, BF
    LINE (-19000, 0)-(-24000, 0), 4
    LINE (-19000, wlo1)-(-24000, -24000), 10, BF
    LINE (-19000, wlo)-(-24000, 24000), 10, BF
    y = 1
END SUB

SUB DrawWall2
    LINE (18900, -24000)-(24100, 200000), 0, BF
    LINE (19000, -24000)-(24000, 200000), 10, BF
    y = 2
END SUB

SUB DrawWall3
    LINE (-24000, -18900)-(24000, -24100), 0, BF
    LINE (-24000, -19000)-(24000, -24000), 10, BF
    y = 3
END SUB

SUB DrawWall4
    LINE (24000, 18900)-(-24000, 24100), 0, BF
    LINE (24000, 19000)-(-24000, 24000), 10, BF
    y = 4
END SUB

SUB HandleWallCollision
    IF extraShieldActive = 0 THEN gameOverFlag = 1
    extraShieldHold = extraShieldHold - 25: playerEnergy = playerEnergy - 1: maxSpeed = maxSpeed - 1
END SUB

SUB DrawMoon
    ' From 95
    mox = -5000
    moy = 6000
    IF moonVisible = 1 AND windowXMin < -4500 AND windowXMax > -5500 AND windowYMin < 6500 AND windowYMax > 5500 THEN
        qqq = 1
        LINE (-5600, 6600)-(-4400, 5400), 0, BF
        CIRCLE (mox, moy), 400, 8
        PAINT (5300, moy), 8, 8
        PAINT (4700, moy), 8, 8
        PAINT (mox, 5700), 8, 8
        PAINT (mox, 6300), 8, 8
        IF windowXMin < -4900 AND windowXMax > -5100 AND windowYMin < 6100 AND windowYMax > 5900 THEN playerShield = playerShield - 50
    END IF
END SUB

SUB DrawEarth
    ' From 16,17
    earthX = 10000
    earthY = -2000
    IF earthVisible = 1 AND windowXMin < 11000 AND windowXMax > 9000 AND windowYMin < -1000 AND windowYMax > -3000 THEN
        LINE (10700, 1300)-(9300, 2700), 0, BF
        CIRCLE (earthX, earthY), 500, 2
        PAINT (earthX, earthY), 1, 2
        PAINT (10400, earthY), 1, 2
        PAINT (9600, earthY), 1, 2
        PAINT (earthX, 2400), 1, 2
        PAINT (earthX, 1600), 1, 2
        IF windowXMin < 11000 AND windowXMax > 9000 AND windowYMin < -1000 AND windowYMax > -3000 THEN graf = 1
        IF windowXMin < 10500 AND windowXMax > 9500 AND windowYMin < -1500 AND windowYMax > -2500 THEN playerShield = playerShield - 50
        IF graf = 1 AND playerX > earthX THEN mvx = -grave
        IF graf = 1 AND playerX < earthX THEN mvx = grave
        IF graf = 1 AND playerY > earthY THEN mvy = -grave
        IF graf = 1 AND playerY < earthY THEN mvy = grave
        IF graf = 1 THEN grave = grave + 1.1
        IF grave > 20 THEN grave = 20
        IF graf = 0 THEN grave = 0
        IF playerX = earthX AND playerY = earthY THEN gameOverFlag = 1
    END IF
END SUB

SUB DrawPlayerShip
    ' From 'ship'
    IF mvx = 0 AND mvy = 0 THEN
        CIRCLE (playerX, playerY), 10, 2
        CIRCLE (playerX, playerY + 20), 5, 2
        CIRCLE (playerX, playerY - 20), 5, 2
        CIRCLE (playerX + 15, playerY), 5, 2
        CIRCLE (playerX - 15, playerY), 5, 2
    ELSE
        ' Draw based on direction
        IF mvy > 0 AND mvx = 0 THEN CIRCLE (playerX, playerY), 10 + mvy, 2, , , (3.4 / (-mvy + 11)) + 1
        IF mvx > 0 AND mvy = 0 THEN CIRCLE (playerX, playerY), 10 + mvx, 2, , , (1 / mvx)
        IF mvy < 0 AND mvx = 0 THEN CIRCLE (playerX, playerY), 10 - mvy, 2, , , (3.4 / (mvy + 11)) + 1
        IF mvx < 0 AND mvy = 0 THEN CIRCLE (playerX, playerY), 10 - mvx, 2, , , (-1 / mvx)
        IF mvy > 0 AND mvx = 0 THEN CIRCLE (playerX + (10 + mvy), playerY), 5 + mvy, 2, , , (3.4 / (-mvy + 11)) + 1
        IF mvx > 0 AND mvy = 0 THEN CIRCLE (playerX, (10 + mvx) + playerY), 5 + mvx, 2, , , (1 / mvx)
        IF mvy < 0 AND mvx = 0 THEN CIRCLE (playerX + (-10 + mvy), playerY), 5 - mvy, 2, , , (3.4 / (mvy + 11)) + 1
        IF mvx < 0 AND mvy = 0 THEN CIRCLE (playerX, (-10 + mvx) + playerY), 5 - mvx, 2, , , (-1 / mvx)
        IF mvy > 0 AND mvx = 0 THEN CIRCLE (playerX - (10 + mvy), playerY), 5 + mvy, 2, , , (3.4 / (-mvy + 11)) + 1
        IF mvx > 0 AND mvy = 0 THEN CIRCLE (playerX, playerY - (10 + mvx)), 5 + mvx, 2, , , (1 / mvx)
        IF mvy < 0 AND mvx = 0 THEN CIRCLE (playerX - (-10 + mvy), playerY), 5 - mvy, 2, , , (3.4 / (mvy + 11)) + 1
        IF mvx < 0 AND mvy = 0 THEN CIRCLE (playerX, playerY - (-10 + mvx)), 5 - mvx, 2, , , (-1 / mvx)
        IF mvx <> 0 AND mvy <> 0 AND vly = 0 THEN CIRCLE (playerX, playerY), 5, 2
        IF vly > 0 THEN CIRCLE (playerX, playerY), 10 + mvx + mvy, 2
    END IF
    PAINT (playerX, playerY), 1, 2
END SUB

SUB UpdateRocket
    ' From 20
    IF rok = 0 THEN EXIT SUB
    gui = 1
    LINE (rokx + 30, roky + 30)-(rokx - 30, roky - 30), 0, BF
    CIRCLE (rokx, roky), 4, 8
    PAINT (rokx, roky), 8, 8
    IF gui = 1 THEN GOTO SkipMove
    rokx = rokx + rokmvx
    roky = roky + rokmvy
    LINE (rokx + 30, roky + 30)-(rokx - 30, roky - 30), 0, BF
    CIRCLE (rokx, roky), 4, 8
    PAINT (rokx, roky), 8, 8
SkipMove:
    IF rkstp = 0 AND rokx = playerX AND roky = playerY THEN ty = 0
    ty = ty + 1
    IF rokx > prrx - 10 AND roky > prry - 10 AND rokx < prrx + 10 AND roky < prry + 10 THEN rsp = 1 ELSE rsp = 10
    SELECT CASE enemyType
        CASE 1: prrx = cruiserX: prry = cruiserY
        CASE 2: prrx = fighterX: prry = fighterY
        CASE 3: prrx = enemyBaseX: prry = enemyBaseY
        CASE 4: prrx = fighterX2: prry = fighterY2
        CASE 0: IF selmv = 1 THEN prrx = prrx: prry = prry
    END SELECT
    IF prrx > rokx THEN rokx = rokx + rsp
    erk = erk + 1
    IF erk = 1 THEN arny = 1 ELSE arny = 0
    IF arny = 1 THEN big = ((rokx - prrx) ^ 2 + (roky - prry) ^ 2)
    IF big <> 0 THEN ab = ((rokx - prrx) ^ 2 + (roky - prry) ^ 2) * 100 / big
    LOCATE 1, 1
    IF dis = 1 THEN PRINT ab
    IF tyo <> 0 THEN PRINT ((ty * 100) / tyo)
    IF prrx < rokx THEN rokx = rokx - rsp
    IF prry > roky THEN roky = roky + rsp
    IF prry < roky THEN roky = roky - rsp

    ' Hit detection
    IF rokx = prrx AND roky = prry THEN
        SELECT CASE enemyType
            CASE 1
                IF cruiserShield > 0 THEN cruiserShield = cruiserShield - (rocketLaunchLevel * 100) ELSE cruiserDamage = cruiserDamage + (rocketLaunchLevel * 100)
            CASE 2
                IF fighterShield > 0 THEN fighterShield = fighterShield - (rocketLaunchLevel * 100) ELSE fighterDamage = fighterDamage + (rocketLaunchLevel * 100)
            CASE 3
                IF enemyBaseShield > 0 THEN enemyBaseShield = enemyBaseShield - (rocketLaunchLevel * 100) ELSE enemyBaseDamage = enemyBaseDamage + (rocketLaunchLevel * 100)
            CASE 4
                IF fighterShield2 > 0 THEN fighterShield2 = fighterShield2 - (rocketLaunchLevel * 100) ELSE fighterDamage2 = fighterDamage2 + (rocketLaunchLevel * 100)
        END SELECT
        rok = 0
    END IF
    IF ty > tyo THEN rok = 0: ExplodeRocket
    IF rokx = prrx AND roky = prry THEN sdkj = 1 ELSE EXIT SUB
    IF rkstp = 1 THEN EXIT SUB
    ExplodeRocket
END SUB

SUB ExplodeRocket
    ' From 87
    IF rokx < (100 * explp) AND rokx > (-100 * explp) AND roky < (100 * explp) AND roky > -(100 * explp) THEN baseShield = baseShield - (explp * 100)
    IF extraShieldActive = 0 AND rokx < playerX + (100 * explp) AND rokx > playerX - (100 * explp) AND roky < playerY + (100 * explp) AND roky > playerY - (100 * explp) THEN playerShield = playerShield - (100 * explp)
    IF rokx < fighterX2 + (100 * explp) AND rokx > fighterX2 - (100 * explp) AND roky < fighterY2 + (100 * explp) AND roky > fighterY2 - (100 * explp) THEN fighterShield2 = fighterShield2 - (100 * explp)
    IF rokx < cruiserX + (100 * explp) AND rokx > cruiserX - (100 * explp) AND roky < cruiserY + (100 * explp) AND roky > cruiserY - (100 * explp) THEN cruiserShield = cruiserShield - (100 * explp)
    IF rokx < mox + (400 * explp) AND rokx > mox - (400 * explp) AND roky < moy + (400 * explp) AND roky > moy - (400 * explp) THEN moonVisible = 0
    IF earthX < playerX + (1000 * explp) AND rokx > earthX - (1000 * explp) AND roky < earthY + (1000 * explp) AND roky > earthY - (1000 * explp) THEN earthVisible = 0
    FOR x = 2 TO 50 * explp STEP 2
        LOCATE 1, 1
        PRINT x * 2
        CIRCLE (rokx, roky), x, 4, , , .6
    NEXT x
    FOR x = 2 TO 50 * explp STEP 2
        CIRCLE (rokx, roky), x, 0, , , .6
        LOCATE 1, 1
        PRINT x * -2 + (100 * explp)
    NEXT x
    IF rokx = prrx AND roky = prry THEN rok = 0
    CLS
END SUB

SUB UpdateBeam
    ' From 100
    IF playerBeam = 0 THEN EXIT SUB
    SELECT CASE enemyType
        CASE 1: enshfr = cruiserFrequency
        CASE 2: enshfr = fighterFrequency
        CASE 3: enshfr = fighterFrequency2
        CASE 4: enshfr = enemyBaseFrequency
    END SELECT
    IF beamFrequency < enshfr THEN playerBeam = 0: EXIT SUB
    SELECT CASE enemyType
        CASE 1: renx = cruiserX: reny = cruiserY
        CASE 2: renx = fighterX: reny = fighterY
        CASE 3: renx = fighterX2: reny = fighterY2
        CASE 4: renx = enemyBaseX: reny = enemyBaseY
        CASE ELSE: playerBeam = 0: EXIT SUB
    END SELECT
    LINE (playerX, playerY)-(renx, reny), 4, , 3
    a = (desenx * .01)
    renx = renx + a
    B = (deseny * .01)
    reny = reny + B
    SELECT CASE enemyType
        CASE 1: cruiserX = renx: cruiserY = reny
        CASE 2: fighterX = renx: fighterY = reny
        CASE 3: fighterX2 = renx: fighterY2 = reny
        CASE 4: enemyBaseX = renx: enemyBaseY = reny
    END SELECT
END SUB

SUB DrawBase
    ' From 'base'
    IF enemyType = 0 THEN bt = 0 ELSE bt = 1
    IF enat = 1 THEN bt = 1
    IF bt = 1 AND battleStation = 1 THEN battleStation = 1
    ' Draw base if in view (add condition)
    ' Assume draw code here
END SUB

SUB DrawDockingStation2
    ' From 116
    IF dockingStation2 = 0 THEN EXIT SUB
    LINE (325 + ae3, -70)-(325 + ae3, -100), 0
    LINE (325 + ae3, 130)-(325 + ae3, 100), 0
    ae3 = ((ae * 100) / ae2) * 2
    ae = ae + 1
    LINE (325 + ae3, -100)-(525, 100), 1, BF
    CIRCLE (425, 100), 100, 8, 0, 3.2, .2
    LINE (325 + ae3, 100)-(325 + ae3, 130), 8
    LINE (325, 100)-(525, 100), 8
    IF ae3 > 5 THEN PAINT (330, 103), 2, 8
    IF ae3 < 95 THEN PAINT (520, 103), 1, 8
    IF mvx <> 0 THEN dockingStation2 = 0
    IF mvy <> 0 THEN dockingStation2 = 0
    IF enemyType <> 0 THEN dockingStation2 = 0
    IF dockingStation = 1 THEN dockingStation2 = 0
    IF extraShieldActive = 1 THEN dockingStation2 = 0
    IF ae = ae2 THEN dockingStation2 = 0
    shipLevel = shipLevel + .05
    laserLevel = laserLevel + .05
    rocketLaunchLevel = rocketLaunchLevel + .05
    maxShield = maxShield + 1
    maxEnergyTotal = maxEnergyTotal + 1.5
    extraShieldLevel = extraShieldLevel + .05
    LINE (325, -100)-(325 + ae3, 100), 2, BF
    CIRCLE (425, -100), 100, 8, 0, 3.2, .2
    LINE (325 + ae3, -100)-(325 + ae3, -70), 8
    CIRCLE (325, 0), 10, 0
    PAINT (325, 0), 1, 0
    IF dockingStation2 = 0 THEN CLS
END SUB

SUB DrawDockingLines
    ' From 5
    IF dockingStation = 0 THEN EXIT SUB
    FOR x = -5 TO 5
        LINE (325, x)-(playerX, playerY + x), 8
    NEXT x
    ae = ae + 1: IF ae > 5 THEN ae = 1
    IF ae > 1 THEN EXIT SUB
    FOR x = -5 TO 5
        LINE (325, x)-(playerX, playerY + x), 1
    NEXT x
    yo = 0
    IF mvx <> 0 THEN dockingStation = 0
    IF mvy <> 0 THEN dockingStation = 0
    IF extraShieldActive = 1 THEN dockingStation = 0
    IF baseEnergy < 10 THEN PRINT "bsen low!": EXIT SUB
    IF enemyType <> 0 AND playerAutoRocket = 1 THEN pt = 1
    IF enemyType <> 0 AND playerAutoLaser = 1 THEN j = 1
    IF playerEnergy < maxEnergyTotal THEN playerEnergy = playerEnergy + 20: yo = yo + 1
    IF playerShield < maxShield THEN playerShield = playerShield + 20: yo = yo + 1
    IF playerDamage > 1 THEN playerDamage = playerDamage - .5: yo = yo + 1
    IF tractorSensor < 99 THEN tractorSensor = tractorSensor + 5: yo = yo + 1
    IF tractorSensor > 90 THEN tractorSensor = 90: yo = yo - 1
    IF rockets < 10 THEN rockets = rockets + 1: yo = yo + 1
    IF fuelTanks < 5 THEN fuelTanks = fuelTanks + 1: yo = yo + 1
    IF extraShieldAmount < 2 THEN extraShieldAmount = extraShieldAmount + 1: yo = yo + 1
    IF yo > 1 THEN baseEnergy = baseEnergy - (yo * .5)
    IF yo < 1 THEN dockingStation = 0
    IF yo = 1 THEN maxSpeed = 0
END SUB

SUB UpdateMiner
    ' From 7
    IF viz = 0 THEN erx = mox + 400: ery = moy
    IF viz = 1 THEN erx = 0: ery = 0
    IF sorx > mox - 10 AND sorx < mox + 10 AND sory > moy - 10 AND sory < moy + 10 THEN tpe = 1 ELSE tpe = 20
    IF erx > sorx THEN sorx = sorx + tpe
    IF erx < sorx THEN sorx = sorx - tpe
    IF ery > sory THEN sory = sory + tpe
    IF ery < sory THEN sory = sory - tpe
    LINE (sorx - tpe - 10, sory - tpe - 10)-(sorx + tpe + 10, sory + tpe + 10), 0, BF
    CIRCLE (sorx, sory), 5, 1
    PAINT (sorx, sory), 14, 1
    IF sorx = erx AND sory = ery THEN viz = viz + 1: IF viz = 2 THEN baseEnergy = baseEnergy + 600
    IF baseEnergy > 1200 THEN res = res + 50: baseEnergy = 1200
    IF viz = 2 THEN viz = 0
END SUB

SUB UpdateEnemies
    ' Update fighter (from 'fiter')
    IF fighterActive = 0 THEN GOTO SkipFighter
    fighterShield = fighterShield + (laserFighterShield / 200) + fighterLevel
    IF fighterShield > laserFighterShield THEN fighterShield = laserFighterShield
    IF fighterDamage > 600 THEN DestroyFighter
    IF fighterX > playerX + 150 THEN fighterX = fighterX - 20
    IF fighterX < playerX - 150 THEN fighterX = fighterX + 20
    IF fighterY > playerY + 150 THEN fighterY = fighterY - 20
    IF fighterY < playerY - 150 THEN fighterY = fighterY + 20
    IF fighterActive = 1 AND fighterX < playerX + 200 AND fighterX > playerX - 200 AND fighterY < playerY + 200 AND fighterY > playerY - 200 THEN fiterat = 1
    IF fighterX < playerX + 500 AND fighterX > playerX - 500 AND fighterY < playerY + 500 AND fighterY > playerY - 500 THEN
        CIRCLE (fighterX, fighterY), 10, 4, , , 1
        PAINT (fighterX, fighterY), 4, 4
        enemyType = 2
        LINE (fighterX - 100, fighterY + 100)-(fighterX + 100, fighterY - 100), 0, BF
    END IF
    IF fiterat = 0 THEN GOTO SkipFighter
    IF enemyType <> 2 THEN GOTO SkipFighter
    IF fighterX < playerX + 200 AND fighterX > playerX - 200 AND fighterY < playerY + 200 AND fighterY > playerY - 200 THEN ftprx = playerX: ftpry = playerY: enemyType = 2 ELSE ftprx = 0: ftpry = 0
    lssp = lssp + 1
    IF lssp > 21 - fighterLevel THEN lssp = 0
    IF lssp < 0 THEN lssp = 0
    IF lssp = 0 THEN fir = 1
    IF fir <> 0 THEN GOTO SkipFighterAttack
    prsh = prsh - 20
    IF ftpry = playerX AND playerShield > 0 THEN playerShield = playerShield - (15 + fighterLevel)
    IF ftpry = playerX AND playerShield < 0 THEN playerDamage = playerDamage + 15 + fighterLevel
    IF ftpry = 0 AND baseShield > 0 THEN baseShield = baseShield - (15 + fighterLevel)
    IF ftpry = 0 AND baseShield < 0 THEN baseDamage = baseDamage + 15 + fighterLevel
    LINE (fighterX, fighterY)-(ftprx, ftpry), 4
    LINE (fighterX, fighterY)-(ftprx, ftpry), 0
SkipFighterAttack:
SkipFighter:

    ' Update second fighter (from 'fiter2')
    IF fighter2Active = 0 THEN GOTO SkipFighter2
    fighterShield2 = fighterShield2 + (laserFighterShield2 / 200) + fighterLevel2
    IF fighterShield2 > laserFighterShield2 THEN fighterShield2 = laserFighterShield2
    IF fighterDamage2 > 600 THEN DestroyFighter2
    IF fighterX2 > playerX + 150 THEN fighterX2 = fighterX2 - 20
    IF fighterX2 < playerX THEN fighterX2 = fighterX2 + 20
    IF fighterY2 > playerY THEN fighterY2 = fighterY2 - 20
    IF fighterY2 < playerY THEN fighterY2 = fighterY2 + 20
    IF fighter2Active = 1 AND fighterX2 < playerX + 200 AND fighterX2 > playerX - 200 AND fighterY2 < playerY + 200 AND fighterY2 > playerY - 200 THEN fiterat2 = 1
    IF fighterX2 < playerX + 500 AND fighterX2 > playerX - 500 AND fighterY2 < playerY + 500 AND fighterY2 > playerY - 200 THEN CIRCLE (fighterX2, fighterY2), 10, 4, , , 1: PAINT (fighterX2, fighterY2), 4, 4: enemyType = 4: fitera2 = 1: LINE (fighterX2 - 100, fighterY2 + 100)-(fighterX2 + 100, fighterY2 - 100), 0, BF
    IF fiterat2 = 0 THEN GOTO SkipFighter2
    IF enemyType <> 4 THEN GOTO SkipFighter2
    IF fighterX2 < playerX + 200 AND fighterX2 > playerX - 200 AND fighterY2 < playerY + 200 AND fighterY2 > playerY - 200 THEN ftprx2 = playerX: ftpry2 = playerY: enemyType = 4
    lssp2 = lssp2 + 1
    IF lssp2 > 15 - fighterLevel THEN lssp2 = 0
    IF lssp2 = 0 THEN fir2 = 0
    IF lssp2 <> 0 THEN fir2 = 1
    IF fir <> 0 THEN fighterFrequency2 = INT(RND(1) * maxFighterFrequency2 + 1)
    IF fighterFrequency2 > maxFighterFrequency2 THEN fighterFrequency2 = maxFighterFrequency2
    IF fir2 <> 0 THEN GOTO SkipFighter2
    fighterFrequency2 = shieldFrequency: IF fighterFrequency2 > maxFighterFrequency2 THEN fighterFrequency2 = maxFighterFrequency2
    IF extraShieldActive = 0 AND fighterFrequency2 = shieldFrequency THEN playerShield = playerShield - 75 + fighterLevel2 ELSE extraShieldHold = extraShieldHold - 25
    LINE (fighterX2, fighterY2)-(playerX, playerY), 2
    LINE (fighterX2, fighterY2)-(playerX, playerY), 0
    IF bl = 1 THEN LINE (s, t)-(s - 20, t - 20), 14, BF: LINE (s + 20, t + 20)-(s - 60, t - 60), 0, BF
SkipFighter2:

    ' Update cruiser (from 'cruiser')
    IF cruiserActive = 0 THEN GOTO SkipCruiser
    IF kiz = 0 THEN cprx = playerX + 200: cpry = playerY + 200: csp = 20
    IF kiz = 1 THEN cprx = playerX + 200: cpry = playerY: csp = 20: enemyType = 1
    IF kiz = 2 THEN cprx = enemyBaseX: cpry = enemyBaseY: csp = 20
    IF cruiserX < playerX + 500 AND cruiserY < playerY + 500 AND cruiserX > playerX - 500 AND cruiserY > playerY - 500 THEN kiz = 1
    IF cruiserX < playerX + 500 AND cruiserY < playerY + 500 AND cruiserX > playerX - 500 AND cruiserY > playerY - 500 THEN kiz = 1 ELSE IF cruiserDamage < 50 THEN kiz = 0
    IF cruiserDamage > 10 THEN kiz = 2
    IF cruiserX < cprx THEN cruiserX = cruiserX + csp
    IF cruiserX > cprx THEN cruiserX = cruiserX - csp
    IF cruiserY < cpry THEN cruiserY = cruiserY + csp
    IF cruiserY > cpry THEN cruiserY = cruiserY - csp
    cruiserShield = cruiserShield + (laserCruiserShield / 200) + cruiserLevel
    cruiserDamage = cruiserDamage - (.5 + cruiserLevel)
    IF cruiserDamage <= 0 THEN cruiserDamage = 0
    IF cruiserShield > laserCruiserShield THEN cruiserShield = laserCruiserShield
    IF cruiserDamage > 100 THEN DestroyCruiser
    IF cruiserDamage = 50 THEN kiz = 2
    IF kiz = 0 THEN GOTO SkipCruiser
    LINE (cruiserX + 100, cruiserY + 800)-(cruiserX - 100, cruiserY - 800), 0, BF
    CIRCLE (cruiserX, cruiserY), 300, 8, , , 4
    CIRCLE (cruiserX, cruiserY), 30, 8
    CIRCLE (cruiserX, cruiserY - 300), 30, 8
    CIRCLE (cruiserX, cruiserY + 300), 30, 8
    PAINT (cruiserX + 50, cruiserY), 4, 8
    PAINT (cruiserX, cruiserY), 8, 8
    PAINT (cruiserX, cruiserY - 300), 8, 8
    PAINT (cruiserX, cruiserY + 300), 8, 8
    spls = spls + 1
    IF cruiserFrequency < shieldFrequency THEN cruiserFrequency = cruiserFrequency + 1
    IF cruiserFrequency > shieldFrequency THEN cruiserFrequency = cruiserFrequency - 1
    IF cruiserFrequency > maxCruiserFrequency THEN cruiserFrequency = maxCruiserFrequency
    IF spls = 27 - (cruiserLevel / 4) THEN spls = 0
    IF spls = 0 OR spls = 9 OR spls = 18 THEN CruiserAttack 300
    IF spls = 3 OR spls = 12 OR spls = 21 THEN CruiserAttack 0
    IF spls = 6 OR spls = 15 OR spls = 24 THEN CruiserAttack -300
    IF spls = 26 THEN CruiserSpecialAttack
    cruiserFrequency = INT(RND(1) * maxCruiserFrequency + 1)
    IF cruiserFrequency > maxCruiserFrequency THEN cruiserFrequency = maxCruiserFrequency
SkipCruiser:
END SUB

SUB CruiserAttack (offset AS INTEGER)
    LINE (cruiserX, cruiserY + offset)-(playerX, playerY), 4
    IF extraShieldActive = 0 AND cruiserFrequency = shieldFrequency THEN playerShield = playerShield - (15 + cruiserLevel)
    IF extraShieldActive = 1 THEN extraShieldHold = extraShieldHold - (5 * cruiserLevel)
    LINE (cruiserX, cruiserY + offset)-(playerX, playerY), 0
END SUB

SUB CruiserSpecialAttack
    LINE (cruiserX, cruiserY)-(playerX, playerY), 4
    FOR x = 1 TO 10
    NEXT x
    IF extraShieldActive = 0 THEN playerShield = playerShield - (75 + cruiserLevel) ELSE extraShieldHold = extraShieldHold - (50 * cruiserLevel)
    LINE (cruiserX, cruiserY)-(playerX, playerY), 0
END SUB

SUB DestroyFighter
    ' From 23
    FOR a = 1 TO 200
        CIRCLE (fighterX, fighterY), a, 14
    NEXT a
    FOR a = 1 TO 200 STEP 2
        CIRCLE (fighterX, fighterY), a, 4
    NEXT a
    FOR x = 2 TO 200
        CIRCLE (fighterX, fighterY), x, 4, , , .6
        CIRCLE (fighterX, fighterY), x - 1, 0, , , .6
    NEXT x
    CIRCLE (fighterX, fighterY), 200, 0, , , .6
    credits = credits + 200
    enat = 0
    fighterX = enemyBaseX: fighterY = enemyBaseY
    fighterShield = laserFighterShield + 100: fighterDamage = 0
    laserFighterShield = fighterShield
    enemyType = 0: enat = 0
    fiterat = 0
    fighterLevel = fighterLevel + 1
    fighterFrequency = fighterFrequency + 2
    IF fighterLevel > 10 THEN fighterLevel = 10
END SUB

SUB DestroyFighter2
    ' From 43
    FOR a = 1 TO 200
        CIRCLE (fighterX2, fighterY2), a, 14
    NEXT a
    FOR a = 1 TO 200 STEP 2
        CIRCLE (fighterX2, fighterY2), a, 4
    NEXT a
    credits = credits + 800
    IF enemyBaseActive = 0 THEN fighter2Active = 0: EXIT SUB
    fighterX2 = enemyBaseX: fighterY2 = enemyBaseY
    fighterShield2 = laserFighterShield2 + 100: fighterDamage2 = 0
    laserFighterShield2 = fighterShield2
    fighterLevel2 = fighterLevel2 + 1
    fighterFrequency2 = fighterFrequency2 + 4
    IF fighterLevel2 > 10 THEN fighterLevel2 = 10
    enemyType = 0
END SUB

SUB DestroyCruiser
    ' From 26
    FOR a = 1 TO 80
        x = INT(RND(1) * 100 + -50)
        y = INT(RND(1) * 800 + -400)
        FOR B = 1 TO 10
            CIRCLE (x + cruiserX, y + cruiserY), B, 4
        NEXT B
        FOR B = 1 TO 10
            CIRCLE (x + cruiserX, y + cruiserY), B, 0
        NEXT B
    NEXT a
    FOR x = 2 TO 300
        CIRCLE (cruiserX, cruiserY), x, 4, , , 4
        CIRCLE (cruiserX, cruiserY), x - 1, 0, , , 4
    NEXT x
    CIRCLE (cruiserX, cruiserY), 200, 0, , , 4
    credits = credits + 2600
    IF enemyBaseActive = 1 THEN cruiserActive = 1: cruiserX = enemyBaseX: cruiserY = enemyBaseY: enemyType = 0: cruiserShield = laserCruiserShield + 200: laserCruiserShield = cruiserShield: cruiserDamage = 0: cruiserLevel = cruiserLevel + 1: IF cruiserLevel > 10 THEN cruiserLevel = 10: cruiserFrequency = cruiserFrequency + 4: EXIT SUB
    cruiserActive = 0
    enemyType = 0
    cruiserDamage = 0
    cruiserShield = laserCruiserShield + 200
    laserCruiserShield = cruiserShield
    keel = 0
END SUB

SUB DestroyBase
    ' From 40
    FOR z = 1 TO 90
        x = INT(RND(1) * 800 + -400)
        y = INT(RND(1) * 800 + -400)
        FOR a = 1 TO 10
            CIRCLE (x, y), a, 4
        NEXT a
        FOR a = 1 TO 10
            CIRCLE (x, y), a, 0
        NEXT a
    NEXT z
    ' base destroyed
END SUB

SUB DestroyEnemyBase
    ' From 41
    FOR z = 1 TO 90
        x = INT(RND(1) * 800 + -400)
        y = INT(RND(1) * 800 + -400)
        FOR a = 1 TO 10
            CIRCLE (x + enemyBaseX, y + enemyBaseY), a, 4
        NEXT a
        FOR a = 1 TO 10
            CIRCLE (x + enemyBaseX, y + enemyBaseY), a, 0
        NEXT a
        credits = credits + 200
    NEXT z
    enemyBaseLevel = enemyBaseLevel + 1
    enemyBaseFrequency = enemyBaseFrequency + 10
    IF enemyBaseLevel > 10 THEN enemyBaseLevel = 10
    enemyBaseX = INT(RND(1) + 48000 + -24000)
    enemyBaseY = INT(RND(1) + 48000 + -24000)
    enemyBaseShield = laserEnemyBaseShield + 500
    laserEnemyBaseShield = enemyBaseShield
    enemyBaseDamage = 0
END SUB

SUB FireLaser
    ' From 30
    SELECT CASE enemyType
        CASE 1: IF laserFrequency <> cruiserFrequency THEN EXIT SUB
        CASE 2: IF laserFrequency <> fighterFrequency THEN EXIT SUB
        CASE 3: IF laserFrequency <> fighterFrequency2 THEN EXIT SUB
        CASE 4: IF laserFrequency <> enemyBaseFrequency THEN EXIT SUB
        CASE ELSE: EXIT SUB
    END SELECT
    IF enemyType = 1 THEN h = INT(RND(1) * 800 + -400): hpy = (h + cruiserY): hpx = cruiserX
    IF enemyType = 2 THEN hpx = fighterX: hpy = fighterY
    IF enemyType = 4 THEN hpx = fighterX2: hpy = fighterY2
    IF enemyType = 3 THEN hpx = INT(RND(1) * (500 + enemyBaseX) + (-250 + enemyBaseX)): hpy = INT(RND(1) * (500 + enemyBaseY) + (-250 + enemyBaseY))
    SELECT CASE enemyType
        CASE 1: IF cruiserShield > 0 THEN cruiserShield = cruiserShield - (50 * laserLevel)
        CASE 2: IF fighterShield > 0 THEN fighterShield = fighterShield - (50 * laserLevel)
        CASE 4: IF fighterShield2 > 0 THEN fighterShield2 = fighterShield2 - (50 * laserLevel)
        CASE 3: IF enemyBaseShield > 0 THEN enemyBaseShield = enemyBaseShield - (25 * laserLevel)
    END SELECT
    SELECT CASE enemyType
        CASE 1: IF cruiserShield < 1 THEN cruiserDamage = cruiserDamage + (50 * laserLevel)
        CASE 2: IF fighterShield < 1 THEN fighterDamage = fighterDamage + (50 * laserLevel)
        CASE 4: IF fighterShield2 < 1 THEN fighterDamage2 = fighterDamage2 + (50 * laserLevel)
        CASE 3: IF enemyBaseShield <= 1 THEN enemyBaseDamage = enemyBaseDamage + (25 * laserLevel)
    END SELECT
    FOR x = 1 TO 10
        LINE (playerX, playerY)-(hpx, hpy), 14
        LINE (playerX, playerY)-(hpx, hpy), 0
    NEXT x
    playerEnergy = playerEnergy - 5
    j = 0: rej = 1
END SUB

SUB LaunchRocket
    ' From 6
    IF rockets < 1 THEN EXIT SUB
    IF rok = 1 THEN EXIT SUB
    IF mvx > 10 OR mvy > 10 OR mvx < -10 OR mvy < -10 THEN EXIT SUB
    IF enemyType = 0 THEN SetDetonationPoint
    rok = rok + 1
    IF rok = 2 THEN rok = 0
    tyo = 20000
    ty = 0
    selmv = 0
    rockets = rockets - 1
    rokx = playerX
    roky = playerY
    explp = 2
    rokmvx = mvx: rokmvy = mvy
END SUB

SUB SetDetonationPoint
    ' From 75
    CLS
    PRINT "please input detonation point"
    PRINT " 121 .121 for time bom"
    INPUT "x"; prrx
    INPUT "y"; prry
    INPUT "tijd"; tyo
    INPUT "explp"; explp
    IF prrx = 121.121 THEN rkstp = 1 ELSE rkstp = 0
    IF prrx = .1 AND prry = .1 THEN EXIT SUB
    IF tyo = 0 THEN tyo = 10000
    erk = 0
    rok = rok + 1
    IF rok = 2 THEN rok = 0
    IF rkstp = 1 THEN prrx = playerX: prry = playerY
    selmv = 1
    explp = explp / 100
    playerEnergy = playerEnergy - (1 * (explp * 10))
    rockets = rockets - 1
    rokx = playerX
    roky = playerY
    rokmvx = mvx: rokmvy = mvy
    pt = 0
END SUB

SUB HyperDrive
    ' From 15
    CLS
    IF tractorSensor < 100 THEN PRINT "even wachten": SLEEP: EXIT SUB
    PRINT " wat wilt u trans porteren?"
    PRINT "(1)ship (2) roket "
    INPUT wat
    PRINT " max + "; shipLevel * 100 + 200
    ai = shipLevel * 100 + 200
    INPUT "x"; xpl
    INPUT "y"; ypl
    IF wat = 0 THEN EXIT SUB
    IF wat > 3 THEN EXIT SUB
    IF xpl = 123123 AND ypl = 321321 THEN player = 1: EXIT SUB
    IF xpl > shipLevel * 100 + 200 THEN xpl = shipLevel * 100 + 200
    IF xpl < (-1 * (shipLevel * 100 + 200)) THEN xpl = (-1 * (shipLevel * 100 + 200))
    IF ypl < (-1 * (shipLevel * 100 + 200)) THEN ypl = (-1 * (shipLevel * 100 + 200))
    IF ypl > shipLevel * 100 + 200 THEN ypl = shipLevel * 100 + 200
    playerEnergy = playerEnergy - (.25 * maxEnergyTotal)
    IF wat = 1 THEN playerX = playerX + xpl: playerY = playerY + ypl
    IF wat = 1 THEN windowXMax = playerX + 500: windowYMax = playerY + 500
    IF wat = 1 THEN windowXMin = playerX - 500: windowYMin = playerY - 500
    IF wat = 2 THEN rokx = rokx + xpl: roky = roky + ypl
    PLAY "o3l64cdefgfedc"
    tractorSensor = 0
    CLS
END SUB

SUB StartDocking
    ' From 4
    IF mvx <> 0 THEN EXIT SUB
    IF mvy <> 0 THEN EXIT SUB
    IF enemyType <> 0 THEN PRINT "gevaar": EXIT SUB
    IF playerX > 0 AND playerY > -500 AND playerX < 725 AND playerY < 500 THEN ELSE PRINT "te ver": EXIT SUB
    cx = playerX
    cy = playerY
    IF cy = 0 THEN GOTO SkipCy1
    IF cy < 0 THEN a = -.5
    IF cy > 0 THEN a = .5
    FOR x = 0 TO cy STEP a
        LINE (325, 0)-(325, x), 4
    NEXT x
SkipCy1:
    IF cx = 325 THEN GOTO SkipCx1
    IF cx < 325 THEN a = -.5
    IF cx > 325 THEN a = .5
    FOR x = 325 TO cx STEP a
        LINE (325, 0)-(x, 0), 4
    NEXT x
SkipCx1:
    IF cx = 325 THEN GOTO SkipCx2
    IF cx < 325 THEN a = -.5
    IF cx > 325 THEN a = .5
    FOR x = 325 TO cx STEP a
        LINE (325, cy)-(x, cy), 4
    NEXT x
SkipCx2:
    IF cy = 0 THEN GOTO SkipCy2
    IF cy < 0 THEN a = -.5
    IF cy > 0 THEN a = .5
    FOR x = 0 TO cy STEP a
        LINE (cx, 0)-(cx, x), 4
    NEXT x
SkipCy2:
    LOCATE 1, 1
    PRINT "docking complete"
    dockingStation = 1
END SUB

SUB SetAutoPilot
    ' From 82
    CLS
    PRINT "please input destination point"
    INPUT "x"; xgo
    INPUT "y"; ygo
    INPUT "speed"; spgo
    IF spgo = 0 THEN gur = 0: EXIT SUB
    gur = 1
    CLS
END SUB

SUB ShowReport
    ' From 39
    CLS
    PRINT "ллллллллллллллллллллллллллллллллллллллллллллллллллллллллллллллл"
    PRINT "л                          RAPPORT   "
    PRINT "л"
    PRINT "л de tijd ="; minutes; ": 00"
    PRINT "л"
    PRINT "л De datum ="; day; "-"; month; "-"; year; "damage"; playerDamage
    PRINT "л"
    PRINT "л U bent op"; playerX; "x"; playerY; "y, u kunt over"; -tractorSensor + 100; "sec weer beamen"
    PRINT "л"
    PRINT "л energy="; playerEnergy; "shield="; playerShield; "speed="; mvx + mvy; " "
    PRINT "л"
    PRINT "л mxenergy="; maxEnergyTotal; "mxshield="; maxShield; "mxspeed="; maxSpeed; "    "
    PRINT "л"
    PRINT "л shiplv="; shipLevel; "roketlv ="; rocketLaunchLevel; "laserlv="; laserLevel; ""
    PRINT "л"
    PRINT "л U heeft"; credits; "$,en op u spaarekening"; gespbed; "$"
    PRINT "л  "
    PRINT "л U heeft"; rockets; "rokets en"; fuelTanks; "fueltanks over"
    PRINT "л"
    PRINT "л base energy="; baseEnergy; "base shield"; baseShield; "base damage"; baseDamage
    PRINT "л"
    PRINT "л earth(x)"; earthX; "earth(y)"; earthY
    PRINT "л"
    PRINT "л extrashields"; extraShieldAmount; "extrashieldlv"; extraShieldLevel; "hieldhold"; extraShieldHold
    SLEEP
    IF player <> 1 THEN CLS: EXIT SUB
    CLS
    PRINT "ллллллллллллллллллллллллллллллллллллллллллллллллллллллллллллллл"
    PRINT "л                        secret RAPORT   "
    PRINT "л"
    PRINT "л pincode ="; pinnum; ""
    PRINT "л"
    PRINT "л cruiser"; cruiserX; "(x)"; cruiserY; "(y)"; cruiserLevel; "(lv)"
    PRINT "л"
    PRINT "л fiter"; fighterX; "(x)"; fighterY; "(y)"; fighterLevel; "(lv)"
    PRINT "л"
    PRINT "л fiter2"; fighterX2; "(x)"; fighterY2; "(y)"; fighterLevel2; "(lv)"
    PRINT "л"
    PRINT "л enbas"; enemyBaseX; "(x)"; enemyBaseY; "(y)"; enemyBaseLevel; "(lv)"
    PRINT "л"
    PRINT "л shield"; cruiserShield; "(crui)"; fighterShield; "(fit)"; fighterShield2; "(fit2)"; enemyBaseShield; "(enbs)"
    PRINT "л"
    PRINT "л damage"; cruiserDamage; "(crui)"; fighterDamage; "(fit)"; fighterDamage2; "(fit2)"; enemyBaseDamage; "(enbs)"
    PRINT "л"
    PRINT "л  s"; s; "t"; t
    PRINT "л"
    IF INKEY$ = "`" THEN CheatMenu
    SLEEP
    CLS
END SUB

SUB CheatMenu
    ' From 86
    INPUT "gespbed"; gespbed
    INPUT "shplv"; shipLevel
    INPUT "laserlv"; laserLevel
    INPUT "roklv"; rocketLaunchLevel
    INPUT "rokets"; rockets
    INPUT "fuelt"; fuelTanks
    INPUT "mxsh"; maxShield
    INPUT "mxen"; maxEnergyTotal
END SUB

SUB ShopMenu
    ' From 45,49
    CLS
    IF dockingStation = 0 AND playerMultiCom = 0 THEN EXIT SUB
    PRINT "wat wilt u?"
    PRINT "(1) vooraad menu"
    PRINT "(2) machines menu"
    INPUT a
    IF a = 1 THEN VooraadMenu
    IF a = 3 THEN MachinesMenu
    CLS
END SUB

SUB VooraadMenu
    ' From 102
    PRINT "wilt u betere rokets?(400)"
    INPUT c$
    IF c$ = "q" THEN EXIT SUB
    IF c$ = "k" THEN BuyItem c$, 400, rocketLaunchLevel, .25
    PRINT "wilt u betere lasers?(600)"
    INPUT d$
    IF d$ = "q" THEN EXIT SUB
    IF d$ = "k" THEN BuyItem d$, 600, laserLevel, .25
    PRINT "wilt u betere extrashields?(750)"
    INPUT j$
    IF j$ = "q" THEN EXIT SUB
    IF j$ = "k" THEN BuyItem j$, 750, extraShieldLevel, .25
    PRINT "wilt u energy tanks kopen?(800)(+1)"
    INPUT e$
    IF e$ = "q" THEN EXIT SUB
    IF e$ = "k" THEN BuyItem e$, 800, fuelTanks, 1
    PRINT "wilt u u ship verbeteren?(1000)"
    INPUT F$
    IF F$ = "q" THEN EXIT SUB
    IF F$ = "k" THEN BuyItem F$, 1000, shipLevel, .25
    PRINT "wilt u u shield beter maken(1500)(+25)"
    INPUT G$
    IF G$ = "q" THEN EXIT SUB
    IF G$ = "k" THEN BuyItem G$, 1500, maxShield, 25
    PRINT " wilt u u energy beter maken(2000)(+50)"
    INPUT h$
    IF h$ = "q" THEN EXIT SUB
    IF h$ = "k" THEN BuyItem h$, 2000, maxEnergyTotal, 50
END SUB

SUB MachinesMenu
    ' From 103
    PRINT "wilt u roket kopen(200)(1) ?"
    INPUT B$
    IF B$ = "q" THEN EXIT SUB
    IF B$ = "k" THEN BuyItem B$, 200, rockets, 1
    PRINT "wilt u exshield's kopen(500)(1) ?"
    INPUT i$
    IF i$ = "q" THEN EXIT SUB
    IF i$ = "k" THEN BuyItem i$, 500, extraShieldAmount, 1
    PRINT "wilt u een beam hebben(3000)(1)?"
    INPUT k$
    IF k$ = "q" THEN EXIT SUB
    IF k$ = "k" THEN BuyItem k$, 3000, playerBeam, 1
    PRINT "wilt u een multicom kopen(5000)(1) ?"
    INPUT l$
    IF l$ = "q" THEN EXIT SUB
    IF l$ = "k" THEN BuyItem l$, 5000, playerMultiCom, 1
    PRINT "wilt u een tracer hebben(10000)(1) ?"
    INPUT m$
    IF m$ = "q" THEN EXIT SUB
    IF m$ = "k" THEN BuyItem m$, 10000, playerTracer, 1
END SUB

SUB BuyItem (choice$ AS STRING, cost AS SINGLE, item AS SINGLE, increment AS SINGLE)
    IF choice$ <> "y" THEN EXIT SUB
    IF credits < cost THEN EXIT SUB
    credits = credits - cost
    item = item + increment
END SUB

SUB BankMenu
    ' From 61
    CLS
    PRINT "                      bank"
    PRINT
    PRINT "u heeft"; credits; "$"
    PRINT "wilt u 1:lenen"
    PRINT "       2:sparen"
    PRINT "       3:pinnen(opnemen/storten)"
    PRINT "       4:aflossen"
    PRINT "       5:saldo "
    PRINT "       6:terug"
    INPUT bank1
    SELECT CASE bank1
        CASE 1: LoanMenu
        CASE 2: SavingsMenu
        CASE 3: PinMenu
        CASE 4: RepayLoan
        CASE 5: PRINT "U heeft"; gespbed; "op uw rekening": SLEEP
        CASE 6: EXIT SUB
    END SELECT
    BankMenu  ' Loop back
END SUB

SUB LoanMenu
    ' From 62
    CLS
    PRINT "hoeveel wilt u lenen ?(max20000$)"
    INPUT lenbed
    IF lenbed > 20000 THEN lenbed = 20000
    IF lenbed <= 0 THEN EXIT SUB
    credits = credits + lenbed
    leen = 1: geleend = lenbed
    PRINT "u heeft"; lenbed; "$geleend"
    SLEEP
END SUB

SUB SavingsMenu
    ' From 63
    CLS
    fout = 0
    IF rekrek = 1 THEN PRINT "u heef al een rekening": EXIT SUB
    IF leen = 1 THEN PRINT "moet nog u lening afbetalen": EXIT SUB
    PRINT "wat voor rekening wilt u?"
    PRINT "rekening 1:elke maand +5%"
    PRINT "rekening 2:elke maand +200$"
    PRINT "rekening 3:min 10000$,elke maand +10% "
    PRINT "rekening 4:min 50000$,elke maand +15% "
    PRINT "rekening 5:min 100000$,elke maand +30%,als u het opneemt -2.5%"
    INPUT rek
    IF rek < 1 OR rek > 5 THEN EXIT SUB
    rekening(rek) = 1
    INPUT "hoeveel wilt u er op zetten?"; gespbed
    IF rek = 3 AND gespbed < 10000 THEN PRINT "te weinig": SLEEP: EXIT SUB
    IF rek = 4 AND gespbed < 50000 THEN PRINT "te weinig": SLEEP: EXIT SUB
    IF rek = 5 AND gespbed < 100000 THEN PRINT "te weinig": SLEEP: EXIT SUB
    IF gespbed > credits THEN PRINT "u heeft te weinig $": SLEEP: EXIT SUB
    pinn1 = INT(RND(1) * 8 + 1)
    credits = credits - gespbed
    pinn2 = INT(RND(1) * 8 + 1)
    pinn3 = INT(RND(1) * 8 + 1)
    pinn4 = INT(RND(1) * 8 + 1)
    pinnum = (pinn1 * 1000) + (pinn2 * 100) + (pinn3 * 10) + pinn4
    PRINT "un pinnummer = :"; pinnum; ",onthoud het goed!"
    SLEEP
    rekrek = 1
END SUB

SUB PinMenu
    ' From 64
    CLS
    IF rekrek <> 1 THEN EXIT SUB
    PRINT "wat is u pinnummer ?"
    PRINT "type 0 voor terug "
    INPUT pisn
    IF pisn = 0 THEN EXIT SUB
    IF fout = 2 THEN rekrek = 0: gespbed = 0: PRINT "u bent u rekening en u geld kwijt!": fout = 0: EXIT SUB
    IF pisn = 1221 THEN gespbed = gespbed + 1000: PRINT pinnum: SLEEP: PinMenu
    IF pisn <> pinnum THEN fout = fout + 1: PRINT "dat is fout": PinMenu
    fout = 0
    PRINT "wilt u (1)storten of (2)opnemen?"
    INPUT er
    IF er < 1 OR er > 2 THEN EXIT SUB
    IF er = 2 THEN Opnemen
    PRINT "er staat"; gespbed; "$ op u rekening."
    PRINT "en u heef"; credits; "$"
    PRINT "hoeveel wilt u storten?"
    PRINT "123123=alles"
    INPUT "$"; stort
    IF stort = 123123 THEN gespbed = gespbed + credits: credits = 0: EXIT SUB
    IF stort <= 0 THEN EXIT SUB
    IF stort > credits THEN PRINT "u heef te weinig$": SLEEP: EXIT SUB
    credits = credits - stort: gespbed = gespbed + stort
END SUB

SUB RepayLoan
    ' From 65
    PRINT "U heeft "; lenbed; "$ schuld bij ons."
    PRINT "U heeft "; credits; "$"
    PRINT "hoeveel wilt u aflossen?"
    INPUT aflos
    IF aflos <= 0 THEN EXIT SUB
    IF aflos > credits THEN EXIT SUB
    IF aflos > geleend THEN PRINT "teveel": EXIT SUB
    geleend = geleend - aflos
    credits = credits - aflos
    PRINT "u heeft nog"; geleend; "$ schuld bij ons"
END SUB

SUB Opnemen
    ' From 66
    CLS
    PRINT "Er staat"; gespbed; "$ op u rekening"
    PRINT "hoeveel wilt u opnemen ?"
    PRINT "123123 = alles"
    INPUT opn
    IF opn = 123123 THEN credits = credits + gespbed: gespbed = 0: rekrek = 0: EXIT SUB
    IF opn <= 0 THEN EXIT SUB
    IF opn > gespbed THEN EXIT SUB
    gespbed = gespbed - opn
    IF rek = 5 THEN opn = opn - (opn * .025)
    credits = credits + opn
    IF gespbed = 0 THEN leen = 0
END SUB

SUB CheckCollisions
    ' Add collision checks for player with enemies, walls, planets, etc.
    ' For example, if player hits fighter, apply damage
    ' From various if statements in original
END SUB

SUB GameOver
    ' From 14
    FOR a = 1 TO 200
        CIRCLE (playerX, playerY), a, 4
    NEXT a
    FOR a = 1 TO 200 STEP 2
        CIRCLE (playerX, playerY), a, 14
    NEXT a
    CLS
    PRINT "wilt u verder gaan j/n"
    INPUT st$
    IF st$ = "j" OR st$ = "y" OR st$ = "yes" OR st$ = "ja" THEN InitGame ELSE END
END SUB
