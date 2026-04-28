import { Unit } from './unit.js';
import { Arena } from './arena.js';

let gameState = "creator", time = 0, userChar = null, bots = [];
const arena = new Arena();

const dCtx = document.getElementById('demoCanvas').getContext('2d');
const aCanvas = document.getElementById('arenaCanvas');
const aCtx = aCanvas.getContext('2d');

function startBattle() {
    gameState = "battle";
    document.getElementById('screen-creator').style.display = "none";
    document.getElementById('screen-battle').style.display = "block";
    aCanvas.width = window.innerWidth;
    aCanvas.height = window.innerHeight;

    userChar.x = 200; userChar.y = 200;
    bots = [userChar];
    ["Doom Slayer", "Valkyrie", "Big Bones", "Void Walker", "Plague Ravager", "Ice Wizard"].forEach(n => {
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
        userChar.draw(dCtx, time, 1.0, true);
        document.getElementById('debug').innerText = 
            `SEED: ${userChar.seed} | BUILD: ${userChar.build} | HEAD: ${userChar.head} | GEAR: ${userChar.weapon}`;
    } else {
        aCtx.clearRect(0, 0, aCanvas.width, aCanvas.height);
        arena.update(bots, aCanvas.width, aCanvas.height);
        arena.draw(aCtx);
        bots.forEach(b => b.draw(aCtx, time, 0.35, true));
        document.getElementById('aliveCount').innerText = `ALIVE: ${bots.filter(b=>b.hp>0).length}`;
    }
    requestAnimationFrame(loop);
}

const input = document.getElementById('charInput');
input.addEventListener('input', () => userChar = new Unit(input.value || " "));
document.getElementById('btnEnter').addEventListener('click', startBattle);

userChar = new Unit(input.value);
loop();
