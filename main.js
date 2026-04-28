import { Unit } from './unit.js';
import { Arena } from './arena.js';

let gameState = "creator", time = 0, userChar = null, bots = [];
const arena = new Arena();

const dCanvas = document.getElementById('demoCanvas');
const dCtx = dCanvas.getContext('2d');
const aCanvas = document.getElementById('arenaCanvas');
const aCtx = aCanvas.getContext('2d');

function startBattle() {
    gameState = "battle";
    document.getElementById('screen-creator').style.display = "none";
    document.getElementById('screen-battle').style.display = "block";
    
    aCanvas.width = window.innerWidth;
    aCanvas.height = window.innerHeight;

    // Reset player for battle positioning
    userChar.x = 200; 
    userChar.y = 400; 
    bots = [userChar];

    const botNames = ["Doom Slayer", "Valkyrie", "Big Bones", "Void Walker", "Plague Ravager", "Ice Wizard"];
    botNames.forEach(n => {
        let b = new Unit(n, false); // Explicitly NOT player
        b.x = Math.random() * (aCanvas.width - 200) + 100;
        b.y = Math.random() * (aCanvas.height - 200) + 100;
        bots.push(b);
    });
}

function loop() {
    time += 0.05;
    if (gameState === "creator") {
        dCtx.clearRect(0, 0, dCanvas.width, dCanvas.height);
        
        // Explicitly center the character in the Preview Window
        userChar.x = dCanvas.width / 2;
        userChar.y = dCanvas.height * 0.8; 
        
        // DRAW CALL FIXED: Changed 'true' to 'false' to remove UI/Aura from Creator
        userChar.draw(dCtx, time, 1.0, false);
        
        // All 4 generation traits
        const debugBox = document.getElementById('debug');
        if (debugBox) {
            debugBox.innerText = `SEED: ${userChar.seed} | BUILD: ${userChar.build} | HEAD: ${userChar.head} | GEAR: ${userChar.weapon}`;
        }
    } else {
        aCtx.clearRect(0, 0, aCanvas.width, aCanvas.height);
        arena.update(bots, aCanvas.width, aCanvas.height);
        arena.draw(aCtx);
        
        // Keep 'true' here so UI shows up during Battle
        bots.forEach(b => b.draw(aCtx, time, 0.35, true));
        
        const aliveCountElement = document.getElementById('aliveCount');
        if (aliveCountElement) {
            aliveCountElement.innerText = `ALIVE: ${bots.filter(b => b.hp > 0).length}`;
        }
    }
    requestAnimationFrame(loop);
}

const input = document.getElementById('charInput');
input.addEventListener('input', () => {
    // Keep 'true' here for the constructor so the unit knows it IS the player
    userChar = new Unit(input.value || " ", true); 
});

document.getElementById('btnEnter').addEventListener('click', startBattle);

// Initialize
userChar = new Unit(input.value || "Player", true);
loop();
