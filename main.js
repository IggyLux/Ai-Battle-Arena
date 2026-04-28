import { Unit } from './unit.js';
import { Arena } from './arena.js';

let gameState = "creator", time = 0, userChar = null, bots = [];
const arena = new Arena();

const dCanvas = document.getElementById('demoCanvas');
const dCtx = dCanvas.getContext('2d');
const aCanvas = document.getElementById('arenaCanvas');
const aCtx = aCanvas.getContext('2d');

// --- Mobile detection -------------------------------------------------
const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
// Scale factor: 0.6 on mobile = 40% fewer pixels, 1.0 on desktop
const CANVAS_SCALE = isMobile ? 0.6 : 1.0;

// --- Helper: resize arena canvas (keeps drawing area proportional) ---
function resizeArenaCanvas() {
    if (gameState !== "battle") return; // only resize when arena is active

    aCanvas.width  = Math.floor(window.innerWidth  * CANVAS_SCALE);
    aCanvas.height = Math.floor(window.innerHeight * CANVAS_SCALE);
    aCanvas.style.width  = '100%';
    aCanvas.style.height = '100%';

    // Optional: clamp all units to the new boundaries so they don't fly off
    if (bots.length) {
        bots.forEach(b => {
            b.x = Math.max(60, Math.min(aCanvas.width - 60, b.x));
            b.y = Math.max(100, Math.min(aCanvas.height - 40, b.y));
        });
    }
}

// --- Bot name list (unchanged) ---------------------------------------
const BOT_NAMES = [
    "Legolas but Thicc", "Gandalf the Horny", "Boromir's Last Thrust",
    "Aragorn the Premature", "Frodo Butthole", "Sauron's One Ring Worm",
    "Gimli Girth", "Saruman Slightly Aroused",
    "XxDarkLordxx69", "Shadow_Blade_420", "ChaosReaper2007",
    "NotAVirgin Knight", "Sir Cumference", "Lord Farquaad Clone",
    "Paladin of Porn", "Definitely Human",
    "Sir Shitsalot", "Duke of Diarrhea", "Baron Von Fart",
    "Count Skidmark", "Swamp Ass Summoner", "The Flatulent Mage",
    "Dung Herald", "Odor Paladin",
    "Voluptuous Villain", "The Sexy Skeleton", "Horny Lich King",
    "Seductive Warlord", "Busty Dark Empress", "The Throbbing Overlord",
    "Warlord of Wet Dreams", "Erect Sorcerer",
    "Undefeated (0-47)", "Mom's Basement Mage", "Dies First Every Time",
    "Cringe Knight", "Neckbeard Necromancer", "The Friendzoned Fighter",
    "Participation Trophy Paladin", "Built Different (He's Not)",
    "Dongslayer the Brave", "Nipple Wizard Supreme", "Ballista McTesticle",
    "Fanny Ravager", "Cock Goblin King", "The Ass Heretic",
    "Groin Destroyer 3000", "Taint Champion",
    "My Wife Left Me Warrior", "Divorced Dad Druid", "Mid-Life Crisis Mage",
    "Used to Be Somebody", "Peak Was Age 22", "Therapy Dropout Thane",
    "Emotional Damage Elf", "Cries in Chainmail",
    "Todd from Accounting", "HR Violation Incarnate", "Karen the Conqueror",
    "LinkedIn Warlock", "Six Sigma Slayer", "Manager of Mayhem",
    "Moist Avenger", "Crusty Specter", "Flaccid Titan",
    "Glistening Menace", "Damp Paladin", "Chafed Destroyer",
    "Sweaty Demigod", "Pungent Overlord",
    "Naruto If He Had Ass", "Goku's Horny Cousin", "Waifu Slayer",
    "Touch Grass Samurai", "Isekai Reject", "Basement Ronin",
    "Very Normal Sensei", "Hentai Protagonist",
];

function getRandomBotNames(count) {
    const shuffled = [...BOT_NAMES].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
}

function startBattle() {
    gameState = "battle";
    document.getElementById('screen-creator').style.display = "none";
    document.getElementById('screen-battle').style.display = "block";
    document.getElementById('screen-result').style.display = "none";

    // Apply resolution scaling
    aCanvas.width  = Math.floor(window.innerWidth  * CANVAS_SCALE);
    aCanvas.height = Math.floor(window.innerHeight * CANVAS_SCALE);
    aCanvas.style.width  = '100%';
    aCanvas.style.height = '100%';

    userChar.x = 200;
    userChar.y = 400;
    bots = [userChar];

    const botCount = isMobile ? 4 : 6;  // optional: keep 6 on mobile? change to 4 if still slow
    const names = getRandomBotNames(botCount);
    names.forEach(n => {
        let b = new Unit(n, false);
        b.x = Math.random() * (aCanvas.width - 200) + 100;
        b.y = Math.random() * (aCanvas.height - 200) + 100;
        bots.push(b);
    });

    // Ensure window resize updates canvas size dynamically
    window.addEventListener('resize', resizeArenaCanvas);
}

function showResult(playerWon) {
    gameState = "result";
    window.removeEventListener('resize', resizeArenaCanvas); // clean up
    const screen = document.getElementById('screen-result');
    const title = document.getElementById('result-title');
    const subtitle = document.getElementById('result-subtitle');

    if (playerWon) {
        title.innerText = "YOU WIN!";
        title.style.color = "#ffd700";
        subtitle.innerText = "Everyone else is dead. Congratulations, psycho.";
    } else {
        title.innerText = "YOU DIED";
        title.style.color = "#ff4444";
        subtitle.innerText = "Absolutely humiliated. Your character is gone forever (it's not, just press retry).";
    }
    screen.style.display = "flex";
}

// --- Main animation loop (unchanged except resize guard) -------------
function loop() {
    time += 0.05;

    if (gameState === "creator") {
        dCtx.clearRect(0, 0, dCanvas.width, dCanvas.height);
        userChar.x = dCanvas.width / 2;
        userChar.y = dCanvas.height * 0.8;
        userChar.draw(dCtx, time, 1.0, false);

        const debugBox = document.getElementById('debug');
        if (debugBox) {
            debugBox.innerText = `SEED: ${userChar.seed} | BUILD: ${userChar.build} | HEAD: ${userChar.head} | GEAR: ${userChar.weapon}`;
        }

    } else if (gameState === "battle") {
        aCtx.clearRect(0, 0, aCanvas.width, aCanvas.height);

        bots.forEach(b => {
            if (b.hp <= 0) b.deathFrames = (b.deathFrames || 0) + 1;
        });
        bots = bots.filter(b => !(b.hp <= 0 && b.deathFrames > 60));

        const livingBots = bots.filter(b => b.hp > 0);

        arena.update(bots, aCanvas.width, aCanvas.height, time);
        arena.draw(aCtx, bots, time);
        bots.forEach(b => b.draw(aCtx, time, 0.35, true));

        const aliveCountElement = document.getElementById('aliveCount');
        if (aliveCountElement) {
            aliveCountElement.innerText = `ALIVE: ${livingBots.length}`;
        }

        if (livingBots.length <= 1) {
            const lastOne = livingBots[0];
            if (!lastOne || !lastOne.isPlayer) {
                showResult(false);
            } else {
                showResult(true);
            }
        }
    }

    requestAnimationFrame(loop);
}

// --- Event listeners ------------------------------------------------
const input = document.getElementById('charInput');
input.addEventListener('input', () => {
    userChar = new Unit(input.value || " ", true);
});

document.getElementById('btnEnter').addEventListener('click', startBattle);

document.getElementById('btnRetry').addEventListener('click', () => {
    document.getElementById('screen-result').style.display = "none";
    document.getElementById('screen-battle').style.display = "none";
    document.getElementById('screen-creator').style.display = "flex";
    gameState = "creator";
    bots = [];
    arena.projectiles = [];
    arena.swings = [];
    arena.whips = [];
    arena.scratches = [];
    userChar = new Unit(input.value || "Player", true);
    // Remove resize listener in case it's still attached
    window.removeEventListener('resize', resizeArenaCanvas);
});

// Initialize
userChar = new Unit(input.value || "Player", true);
loop();
