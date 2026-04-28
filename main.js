import { Unit } from './unit.js';

let gameState = "creator", time = 0, userChar = null, bots = [];
const dCanvas = document.getElementById('demoCanvas'), dCtx = dCanvas.getContext('2d');
const aCanvas = document.getElementById('arenaCanvas'), aCtx = aCanvas.getContext('2d');

function setupArena() { 
    aCanvas.width = window.innerWidth; 
    aCanvas.height = window.innerHeight; 
}

function startBattle() {
    gameState = "battle"; 
    document.getElementById('screen-creator').style.display = "none"; 
    document.getElementById('screen-battle').style.display = "block"; 
    setupArena();
    userChar.x = 200; userChar.y = 200; 
    bots = [userChar];
    ["Valkyrie", "Big Bones", "Forest Spirit", "Void Walker", "Steel Colossus"].forEach(n => { 
        let b = new Unit(n); 
        b.x = Math.random() * (aCanvas.width - 200) + 100; 
        b.y = Math.random() * (aCanvas.height - 200) + 100; 
        bots.push(b); 
    });
}

function loop() {
    time += 0.05;
    if (gameState === "creator") {
        dCtx.clearRect(0, 0, 400, 500); 
        userChar.x = 200; userChar.y = 400;
        // THE FIX: 'false' hides UI
        userChar.draw(dCtx, time, 1.0, false);
        document.getElementById('debug').innerText = `SEED: ${userChar.seed} | BUILD: ${userChar.build}`;
    } else {
        aCtx.clearRect(0, 0, aCanvas.width, aCanvas.height);
        bots.forEach(b => {
            if (b.hp <= 0) return;
            let target = bots.find(o => o !== b && o.hp > 0);
            if (target) {
                let angle = Math.atan2(target.y - b.y, target.x - b.x);
                if (Math.hypot(target.x - b.x, target.y - b.y) > 60) {
                    b.x += Math.cos(angle) * 1.5; b.y += Math.sin(angle) * 1.5;
                }
            }
            b.x = Math.max(60, Math.min(aCanvas.width - 60, b.x));
            b.y = Math.max(100, Math.min(aCanvas.height - 40, b.y));
            // THE FIX: 'true' shows UI
            b.draw(aCtx, time, 0.35, true);
        });
        document.getElementById('aliveCount').innerText = `ALIVE: ${bots.filter(b=>b.hp>0).length}`;
    }
    requestAnimationFrame(loop);
}

const input = document.getElementById('charInput');
document.getElementById('btnEnter').addEventListener('click', startBattle);
input.addEventListener('input', () => { userChar = new Unit(input.value || " ", true); });

userChar = new Unit(input.value, true);
loop();
