import { Unit } from './unit.js';
import { Arena } from './arena.js';

let gameState = "creator", time = 0, userChar = null, bots = [];
const arena = new Arena();

const dCanvas = document.getElementById('demoCanvas');
const dCtx = dCanvas.getContext('2d');
const aCanvas = document.getElementById('arenaCanvas');
const aCtx = aCanvas.getContext('2d');

// -------------------------
// VULGAR / FUNNY BOT NAMES
// -------------------------
const BOT_NAMES = [
    // Fantasy Trope Parodies
    "Legolas but Thicc", "Gandalf the Horny", "Boromir's Last Thrust",
    "Aragorn the Premature", "Frodo Butthole", "Sauron's One Ring Worm",
    "Gimli Girth", "Saruman Slightly Aroused",

    // Generic RPG Basement-Dweller Energy
    "XxDarkLordxx69", "Shadow_Blade_420", "ChaosReaper2007",
    "NotAVirgin Knight", "Sir Cumference", "Lord Farquaad Clone",
    "Paladin of Porn", "Definitely Human",

    // Gross / Toilet Humor
    "Sir Shitsalot", "Duke of Diarrhea", "Baron Von Fart",
    "Count Skidmark", "Swamp Ass Summoner", "The Flatulent Mage",
    "Dung Herald", "Odor Paladin",

    // Horny Villain Archetypes
    "Voluptuous Villain", "The Sexy Skeleton", "Horny Lich King",
    "Seductive Warlord", "Busty Dark Empress", "The Throbbing Overlord",
    "Warlord of Wet Dreams", "Erect Sorcerer",

    // Pathetic / Loser Energy
    "Undefeated (0-47)", "Mom's Basement Mage", "Dies First Every Time",
    "Cringe Knight", "Neckbeard Necromancer", "The Friendzoned Fighter",
    "Participation Trophy Paladin", "Built Different (He's Not)",

    // Inappropriately Named Warriors
    "Dongslayer the Brave", "Nipple Wizard Supreme", "Ballista McTesticle",
    "Fanny Ravager", "Cock Goblin King", "The Ass Heretic",
    "Groin Destroyer 3000", "Taint Champion",

    // Sad Lore Guys
    "My Wife Left Me Warrior", "Divorced Dad Druid", "Mid-Life Crisis Mage",
    "Used to Be Somebody", "Peak Was Age 22", "Therapy Dropout Thane",
    "Emotional Damage Elf", "Cries in Chainmail",

    // Corporate / Out-of-Place
    "Todd from Accounting", "HR Violation Incarnate", "Karen the Conqueror",
    "LinkedIn Warlock", "Six Sigma Slayer", "Manager of Mayhem",

    // Cursed Adjective + Noun
    "Moist Avenger", "Crusty Specter", "Flaccid Titan",
    "Glistening Menace", "Damp Paladin", "Chafed Destroyer",
    "Sweaty Demigod", "Pungent Overlord",

    // Anime/Weeb Parody
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

    aCanvas.width = window.innerWidth;
    aCanvas.height = window.innerHeight;

    userChar.x = 200;
    userChar.y = 400;
    bots = [userChar];

    const names = getRandomBotNames(6);
    names.forEach(n => {
        let b = new Unit(n, false);
        b.x = Math.random() * (aCanvas.width - 200) + 100;
        b.y = Math.random() * (aCanvas.height - 200) + 100;
        bots.push(b);
    });
}

function showResult(playerWon) {
    gameState = "result";
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

        // Tick death frames and remove units dead long enough
        bots.forEach(b => {
            if (b.hp <= 0) b.deathFrames = (b.deathFrames || 0) + 1;
        });
        bots = bots.filter(b => !(b.hp <= 0 && b.deathFrames > 60));

        const livingBots = bots.filter(b => b.hp > 0);

        // Pass time into update and draw for orb orbital math
        arena.update(bots, aCanvas.width, aCanvas.height, time);
        arena.draw(aCtx, bots, time);

        bots.forEach(b => b.draw(aCtx, time, 0.35, true));

        const aliveCountElement = document.getElementById('aliveCount');
        if (aliveCountElement) {
            aliveCountElement.innerText = `ALIVE: ${livingBots.length}`;
        }

        // Win/lose check
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
    arena.bullets = [];
    arena.projectiles = [];
    arena.swings = [];
    arena.whips = [];
    arena.scratches = [];
    userChar = new Unit(input.value || "Player", true);
});

// Initialize
userChar = new Unit(input.value || "Player", true);
loop();
