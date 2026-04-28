import { Unit } from './unit.js';
import { Arena } from './arena.js';
import { Leaderboard } from './leaderboard.js';
import { getBotNames } from './names.js';

// ── Core state ───────────────────────────────────────────
let gameState = "creator"; // "creator" | "battle"
let time = 0;
let userChar = null;
let bots = [];
let playerAlive = false;
let botRespawnQueue = []; // { spawnAt: timestamp }
let lastBotCount = 0;

const MAX_BOTS = 12;
const BOT_RESPAWN_DELAY = 30000; // 30 seconds in ms
const INITIAL_BOT_COUNT = 6;

const arena  = new Arena();
const lb     = new Leaderboard();

// ── Canvas setup ─────────────────────────────────────────
const dCanvas = document.getElementById('demoCanvas');
const dCtx    = dCanvas.getContext('2d');
const aCanvas = document.getElementById('arenaCanvas');
const aCtx    = aCanvas.getContext('2d');

// ── Panel state ───────────────────────────────────────────
let creatorPanelOpen = false;
let lbPanelOpen      = false;

// ── DOM refs ─────────────────────────────────────────────
const screenCreator    = document.getElementById('screen-creator');
const screenBattle     = document.getElementById('screen-battle');
const panelCreator     = document.getElementById('panel-creator');
const panelLeaderboard = document.getElementById('panel-leaderboard');
const lbContent        = document.getElementById('lb-content');
const aliveCountEl     = document.getElementById('aliveCount');
const respawnNotice    = document.getElementById('respawn-notice');
const debugBox         = document.getElementById('debug');
const input            = document.getElementById('charInput');

// ── Panel toggle logic ────────────────────────────────────

function toggleCreatorPanel() {
    creatorPanelOpen = !creatorPanelOpen;
    panelCreator.classList.toggle('panel-open', creatorPanelOpen);
}

function toggleLeaderboard() {
    lbPanelOpen = !lbPanelOpen;
    panelLeaderboard.classList.toggle('panel-open', lbPanelOpen);
    if (lbPanelOpen) lb.render(lbContent);
}

document.getElementById('btn-toggle-creator').addEventListener('click', toggleCreatorPanel);
document.getElementById('btn-toggle-lb').addEventListener('click', toggleLeaderboard);

// ── Battle start (initial) ───────────────────────────────

function startBattle() {
    gameState   = "battle";
    playerAlive = true;

    screenCreator.style.display = "none";
    screenBattle.style.display  = "block";

    aCanvas.width  = window.innerWidth;
    aCanvas.height = window.innerHeight;

    // Reset arena effects
    arena.reset();

    // Place player
    userChar.x = Math.random() * (aCanvas.width - 300) + 150;
    userChar.y = Math.random() * (aCanvas.height - 300) + 150;
    bots = [userChar];
    lb.recordAppearance(userChar);

    // Spawn initial bots
    const names = getBotNames(INITIAL_BOT_COUNT, [userChar.name]);
    names.forEach(n => spawnBot(n));

    updateRespawnNotice();
}

// ── Spawn a bot ───────────────────────────────────────────

function spawnBot(name) {
    const b = new Unit(name, false);
    b.x = Math.random() * (aCanvas.width  - 200) + 100;
    b.y = Math.random() * (aCanvas.height - 200) + 100;
    bots.push(b);
    lb.recordAppearance(b);
}

// ── Player re-enters arena ───────────────────────────────

function reEnterArena() {
    if (gameState !== "battle") return;

    const newPlayer = new Unit(input.value || "Player", true);
    newPlayer.x = Math.random() * (aCanvas.width  - 300) + 150;
    newPlayer.y = Math.random() * (aCanvas.height - 300) + 150;
    bots.push(newPlayer);
    userChar    = newPlayer;
    playerAlive = true;

    lb.recordAppearance(newPlayer);

    // Close creator panel after entering
    if (creatorPanelOpen) toggleCreatorPanel();
    updateRespawnNotice();
}

// ── Bot death / respawn queue ─────────────────────────────

function handleBotDeath(deadBot, killer) {
    // Credit the kill
    if (killer) {
        lb.recordKill(killer, deadBot);
    }
    lb.recordDeath(deadBot);

    // Queue a replacement bot if under cap
    const livingCount = bots.filter(b => b.hp > 0).length;
    if (livingCount < MAX_BOTS) {
        botRespawnQueue.push({ spawnAt: Date.now() + BOT_RESPAWN_DELAY });
    }
}

function handlePlayerDeath() {
    playerAlive = false;
    // Open creator panel so they can craft a new character
    if (!creatorPanelOpen) toggleCreatorPanel();
    updateRespawnNotice();
}

function updateRespawnNotice() {
    if (!respawnNotice) return;
    if (!playerAlive && gameState === "battle") {
        respawnNotice.style.display = "block";
    } else {
        respawnNotice.style.display = "none";
    }
}

// ── Process respawn queue each frame ─────────────────────

function processRespawnQueue() {
    const now = Date.now();
    const livingCount = bots.filter(b => b.hp > 0).length;

    for (let i = botRespawnQueue.length - 1; i >= 0; i--) {
        if (now >= botRespawnQueue[i].spawnAt && livingCount < MAX_BOTS) {
            botRespawnQueue.splice(i, 1);
            const name = getBotNames(1, bots.map(b => b.name))[0];
            if (name) spawnBot(name);
        }
    }
}

// ── Kill attribution helper ───────────────────────────────
// Checks if any unit just dropped to 0 HP this frame and
// records the last attacker as the killer.

function checkDeaths() {
    bots.forEach(b => {
        if (b.hp <= 0 && !b.deathRecorded) {
            b.deathRecorded = true;

            if (b.isPlayer) {
                lb.recordDeath(b);
                handlePlayerDeath();
            } else {
                handleBotDeath(b, b.lastHitBy || null);
            }

            // Update leaderboard panel if open
            if (lbPanelOpen) lb.render(lbContent);
        }
    });
}

// ── Main loop ────────────────────────────────────────────

function loop() {
    time += 0.05;

    if (gameState === "creator") {
        // Full-screen creator
        dCtx.clearRect(0, 0, dCanvas.width, dCanvas.height);
        userChar.x = dCanvas.width / 2;
        userChar.y = dCanvas.height * 0.8;
        userChar.draw(dCtx, time, 1.0, false);

        if (debugBox) {
            debugBox.innerText = `SEED: ${userChar.seed} | BUILD: ${userChar.build} | HEAD: ${userChar.head} | GEAR: ${userChar.weapon}`;
        }

    } else if (gameState === "battle") {
        aCtx.clearRect(0, 0, aCanvas.width, aCanvas.height);

        // Draw creator panel preview if open
        if (creatorPanelOpen) {
            dCtx.clearRect(0, 0, dCanvas.width, dCanvas.height);
            const prev = new Unit(input.value || "Player", true);
            prev.x = dCanvas.width / 2;
            prev.y = dCanvas.height * 0.8;
            prev.draw(dCtx, time, 1.0, false);
            if (debugBox) {
                debugBox.innerText = `SEED: ${prev.seed} | BUILD: ${prev.build} | HEAD: ${prev.head} | GEAR: ${prev.weapon}`;
            }
        }

        // Check for new deaths before cleanup
        checkDeaths();

        // Tick death frames, then remove long-dead units
        bots.forEach(b => {
            if (b.hp <= 0) b.deathFrames = (b.deathFrames || 0) + 1;
        });
        bots = bots.filter(b => !(b.hp <= 0 && b.deathFrames > 60));

        // Bot respawn
        processRespawnQueue();

        // Arena update + draw
        arena.update(bots, aCanvas.width, aCanvas.height, time, lb);
        arena.draw(aCtx, bots, time);

        // Draw units
        bots.forEach(b => b.draw(aCtx, time, 0.35, true));

        // UI counts
        const living = bots.filter(b => b.hp > 0);
        if (aliveCountEl) {
            aliveCountEl.innerText = `ALIVE: ${living.length} / ${MAX_BOTS}`;
        }

        // Respawn timer countdown display
        if (!playerAlive && respawnNotice && botRespawnQueue.length > 0) {
            const next = Math.max(0, Math.ceil((botRespawnQueue[0].spawnAt - Date.now()) / 1000));
        }
    }

    requestAnimationFrame(loop);
}

// ── Input / button wiring ────────────────────────────────

input.addEventListener('input', () => {
    const name = input.value || " ";
    userChar = new Unit(name, true);
    // Refresh debug in creator state
    if (gameState === "creator" && debugBox) {
        debugBox.innerText = `SEED: ${userChar.seed} | BUILD: ${userChar.build} | HEAD: ${userChar.head} | GEAR: ${userChar.weapon}`;
    }
});

document.getElementById('btnEnter').addEventListener('click', startBattle);

document.getElementById('btnReEnter').addEventListener('click', reEnterArena);

document.getElementById('btnClearLB').addEventListener('click', () => {
    if (confirm("Wipe the entire leaderboard? This cannot be undone.")) {
        lb.clear();
        lb.render(lbContent);
    }
});

window.addEventListener('resize', () => {
    if (gameState === "battle") {
        aCanvas.width  = window.innerWidth;
        aCanvas.height = window.innerHeight;
    }
});

// ── Init ─────────────────────────────────────────────────
userChar = new Unit(input.value || "Player", true);
loop();
