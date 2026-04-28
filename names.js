// ═══════════════════════════════════════════════════════
// names.js — Procedural bot name generation
// Combines pools to produce near-infinite unique names
// ═══════════════════════════════════════════════════════

// ── Fixed pool (hand-crafted classics) ──────────────────
const FIXED_NAMES = [
    // Fantasy Trope Parodies
    "Legolas but Thicc", "Gandalf the Horny", "Boromir's Last Thrust",
    "Aragorn the Premature", "Frodo Butthole", "Sauron's One Ring Worm",
    "Gimli Girth", "Saruman Slightly Aroused", "Elrond the Erect",
    "Gollum's Precious Balls", "Bilbo Shaggins", "Thorin Douchemantle",

    // Generic RPG Basement-Dweller Energy
    "XxDarkLordxx69", "Shadow_Blade_420", "ChaosReaper2007",
    "NotAVirgin Knight", "Sir Cumference", "Lord Farquaad Clone",
    "Paladin of Porn", "Definitely Human", "GamerTag McSweatypants",
    "xXxSlayerxXx", "MLG_Nolife_420", "TryHard_McEdgelord",

    // Gross / Toilet Humor
    "Sir Shitsalot", "Duke of Diarrhea", "Baron Von Fart",
    "Count Skidmark", "Swamp Ass Summoner", "The Flatulent Mage",
    "Dung Herald", "Odor Paladin", "Lord of the Skidmarks",
    "Butt Crack Barbarian", "Turd Burglar Supreme", "Piss Wizard",

    // Horny Villain Archetypes
    "Voluptuous Villain", "The Sexy Skeleton", "Horny Lich King",
    "Seductive Warlord", "Busty Dark Empress", "The Throbbing Overlord",
    "Warlord of Wet Dreams", "Erect Sorcerer", "The Lustful Necromancer",
    "Dominatrix of Doom", "Lady Boner the Destroyer", "Duke Hardwick",

    // Pathetic / Loser Energy
    "Undefeated (0-47)", "Mom's Basement Mage", "Dies First Every Time",
    "Cringe Knight", "Neckbeard Necromancer", "The Friendzoned Fighter",
    "Participation Trophy Paladin", "Built Different (He's Not)",
    "Peaked in High School Paladin", "One Star Review Warrior",
    "Still Living With Parents Mage", "Cancelled on Twitter Twice",

    // Inappropriately Named Warriors
    "Dongslayer the Brave", "Nipple Wizard Supreme", "Ballista McTesticle",
    "Fanny Ravager", "Cock Goblin King", "The Ass Heretic",
    "Groin Destroyer 3000", "Taint Champion", "Scrote the Magnificent",
    "Labias McSwordfight", "Gooch the Unstoppable", "Buttock Annihilator",

    // Sad Lore Guys
    "My Wife Left Me Warrior", "Divorced Dad Druid", "Mid-Life Crisis Mage",
    "Used to Be Somebody", "Peak Was Age 22", "Therapy Dropout Thane",
    "Emotional Damage Elf", "Cries in Chainmail", "Ghosted by Everyone",
    "Drinks Alone Paladin", "Has Regrets Ranger", "Can't Afford Therapy Knight",

    // Corporate / Out-of-Place
    "Todd from Accounting", "HR Violation Incarnate", "Karen the Conqueror",
    "LinkedIn Warlock", "Six Sigma Slayer", "Manager of Mayhem",
    "Synergy Destroyer", "Pivot the Barbarian", "Disruption Wizard",
    "Quarterly Review Reaper", "Please Advise Paladin", "Per My Last Email Mage",

    // Cursed Adjective + Noun
    "Moist Avenger", "Crusty Specter", "Flaccid Titan",
    "Glistening Menace", "Damp Paladin", "Chafed Destroyer",
    "Sweaty Demigod", "Pungent Overlord", "Clammy Vanquisher",
    "Greasy Behemoth", "Slimy Magistrate", "Festering Champion",

    // Anime/Weeb Parody
    "Naruto If He Had Ass", "Goku's Horny Cousin", "Waifu Slayer",
    "Touch Grass Samurai", "Isekai Reject", "Basement Ronin",
    "Very Normal Sensei", "Hentai Protagonist", "Body Pillow Berserker",
    "Tsundere Terrorist", "Senpai Noticed Nobody", "Konnichiwa Killbot",

    // Edgy Try-Hard
    "Darkness Darkness Dark", "My Name is Pain", "Shadow of the Void Abyss",
    "Edgelord Prime", "Born from Suffering (Born 1997)", "Crimson Despair",
    "The One Who Suffers", "Doomed by Fate (Self-Diagnosed)",

    // Animal Chaos
    "Feral Goblin Cat", "Horny Werewolf", "Sexy Minotaur",
    "Aroused Centaur", "Thirsty Kitsune", "Feral Karen",
    "Discount Furry", "Legally Distinct Furry",
];

// ── Procedural pools for combinatorial generation ───────

const TITLES_BEFORE = [
    "Lord", "Lady", "Sir", "Duke", "Baron", "Count", "Master",
    "Grand", "Dark", "Mighty", "Eternal", "Cursed", "Blessed",
    "Horny", "Filthy", "Greasy", "Sweaty", "Crusty", "Damp",
    "Supreme", "Ultra", "Based", "Cringe", "Soggy", "Moist",
    "Flaccid", "Rigid", "Erect", "Throbbing", "Pungent", "Glistening",
    "Discount", "Generic", "Off-Brand", "Budget", "Premium",
    "Seductive", "Thicc", "Busty", "Voluptuous", "Feral", "Cursed",
    "Unhinged", "Deranged", "Emotionally Unavailable",
];

const TITLES_AFTER = [
    "the Brave", "the Horny", "the Damned", "the Premature",
    "the Undefeated", "the Defeated", "the Confused", "the Moist",
    "the Erect", "the Flaccid", "the Unwashed", "the Aroused",
    "the Magnificent", "the Mediocre", "the Disappointing",
    "of Doom", "of Despair", "of the Abyss", "of the Void",
    "of the Swamp", "of the Basement", "of Accounting",
    "Supreme", "Prime", "Ultra", "Jr.", "Sr.", "III", "666",
    "Esq.", "PhD", "OnlyFans", "2007", "69", "420",
    "but Horny", "but Thicc", "but Broke", "but Sad",
    "Destroyer of Worlds", "Destroyer of Toilets",
];

const ADJECTIVES = [
    "Dark", "Shadow", "Void", "Chaos", "Blood", "Death", "Doom",
    "Storm", "Flame", "Frost", "Thunder", "Plague", "Rotten", "Feral",
    "Horny", "Sweaty", "Greasy", "Crusty", "Soggy", "Sticky", "Slimy",
    "Moist", "Damp", "Pungent", "Fragrant", "Glistening", "Throbbing",
    "Mighty", "Eternal", "Ancient", "Forbidden", "Cursed", "Blessed",
    "Budget", "Discount", "Generic", "Bargain", "Premium", "Broke",
    "Divorced", "Unemployed", "Depressed", "Medicated", "Unhinged",
    "Thicc", "Busty", "Voluptuous", "Seductive", "Floppy", "Rigid",
    "Edgy", "Based", "Cringe", "Salty", "Toxic", "Feral", "Feral",
];

const NOUNS = [
    "Slayer", "Destroyer", "Annihilator", "Obliterator", "Reaper",
    "Warrior", "Knight", "Mage", "Wizard", "Sorcerer", "Paladin",
    "Barbarian", "Rogue", "Ranger", "Druid", "Warlock", "Bard",
    "Overlord", "Warlord", "Champion", "Titan", "Demon", "Specter",
    "Goblin", "Orc", "Troll", "Wraith", "Lich", "Vampire", "Beast",
    "Daddy", "Mommy", "Karen", "Chad", "Simp", "Incel", "Normie",
    "Gamer", "Streamer", "Influencer", "Neckbeard", "Menace", "Thot",
    "Avenger", "Protector", "Defiler", "Desecrator", "Violator",
    "Disappointment", "Catastrophe", "Disaster", "Incident",
];

const FIRST_NAMES = [
    // Fantasy
    "Aldric", "Brynn", "Caspian", "Daria", "Eamon", "Fyra",
    "Gorath", "Hilda", "Ignar", "Jessa", "Kael", "Lyra",
    "Mordred", "Nyx", "Osric", "Phaedra", "Quill", "Reva",
    "Soren", "Thane", "Ulric", "Vex", "Wren", "Xara", "Ysmir", "Zael",
    // Ridiculous
    "Chad", "Brad", "Todd", "Karen", "Brenda", "Dave", "Greg",
    "Kevin", "Gary", "Barry", "Larry", "Terry", "Jerry", "Perry",
    "Blort", "Grug", "Snorkel", "Jimothy", "Percival", "Reginald",
    "Thaddeus", "Barnaby", "Cornelius", "Montgomery", "Wellington",
];

const LAST_NAMES = [
    // Fantasy
    "Duskbane", "Ironveil", "Shadowmere", "Grimthorn", "Ashford",
    "Voidwalker", "Darkblade", "Stormcrow", "Hellgate", "Bonechill",
    "Ravenscar", "Bloodmoon", "Emberveil", "Frostfall", "Doomhaven",
    // Ridiculous
    "McStabface", "Buttsworth", "Dickensian", "Bumsworth", "Dongsworth",
    "McScrote", "Fartleberry", "Shittington", "Crapsworth", "Ballsworth",
    "McThrobbing", "Humpsalot", "Gropenstein", "Assworth", "Taintley",
    "Cumsworth", "Bonkerstein", "Wanksworth", "Hardwick", "Cocksworth",
];

const PROFESSIONS = [
    "Wizard", "Knight", "Mage", "Paladin", "Ranger", "Bard", "Druid",
    "Warlock", "Necromancer", "Barbarian", "Assassin", "Rogue",
    "of Accounting", "from HR", "from Marketing", "of Sales",
    "the Intern", "the Manager", "the Consultant", "of IT Support",
    "Therapist", "Barista", "Influencer", "Streamer", "OnlyFans Creator",
];

const DESCRIPTORS = [
    "Who Cried Once", "with Daddy Issues", "with a Restraining Order",
    "Who Peaked in 2009", "Who Still Lives with Parents",
    "Who Replies to All Emails", "with Unresolved Trauma",
    "Who Skips Leg Day", "Who Needs to Touch Grass",
    "Who Got Cancelled Twice", "Who Smells Faintly of Cheese",
    "of the Swamp Variety", "from the Dollar Store",
    "Who Googled This", "with a YouTube Channel (2 Subscribers)",
    "Who is Doing Their Best", "Who Is Not Okay",
    "with Several Outstanding Warrants",
];

// ── Generator ────────────────────────────────────────────

function randomFrom(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function generateProceduralName() {
    const pattern = Math.floor(Math.random() * 10);
    switch (pattern) {
        case 0: // Title + Adjective + Noun  e.g. "Lord Dark Slayer"
            return `${randomFrom(TITLES_BEFORE)} ${randomFrom(ADJECTIVES)} ${randomFrom(NOUNS)}`;
        case 1: // First + Last  e.g. "Aldric Duskbane"
            return `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
        case 2: // Adjective + Noun + Title After  e.g. "Moist Goblin the Erect"
            return `${randomFrom(ADJECTIVES)} ${randomFrom(NOUNS)} ${randomFrom(TITLES_AFTER)}`;
        case 3: // First + Profession  e.g. "Greg the Necromancer"
            return `${randomFrom(FIRST_NAMES)} the ${randomFrom(PROFESSIONS)}`;
        case 4: // Title + First + Last  e.g. "Baron Jimothy Buttsworth"
            return `${randomFrom(TITLES_BEFORE)} ${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)}`;
        case 5: // Adjective + First + Descriptor  e.g. "Sweaty Todd Who Peaked in 2009"
            return `${randomFrom(ADJECTIVES)} ${randomFrom(FIRST_NAMES)} ${randomFrom(DESCRIPTORS)}`;
        case 6: // First + Last + Title After  e.g. "Chad Hardwick the Magnificent"
            return `${randomFrom(FIRST_NAMES)} ${randomFrom(LAST_NAMES)} ${randomFrom(TITLES_AFTER)}`;
        case 7: // Adjective + Adjective + Noun  e.g. "Dark Moist Warlock"
            return `${randomFrom(ADJECTIVES)} ${randomFrom(ADJECTIVES)} ${randomFrom(NOUNS)}`;
        case 8: // Title + Noun + Descriptor  e.g. "Lady Goblin Who Smells Faintly of Cheese"
            return `${randomFrom(TITLES_BEFORE)} ${randomFrom(NOUNS)} ${randomFrom(DESCRIPTORS)}`;
        case 9: // First + Profession + Descriptor  e.g. "Karen the Warlock with Daddy Issues"
            return `${randomFrom(FIRST_NAMES)} the ${randomFrom(PROFESSIONS)} ${randomFrom(DESCRIPTORS)}`;
        default:
            return `${randomFrom(ADJECTIVES)} ${randomFrom(NOUNS)}`;
    }
}

/**
 * Get an array of unique bot names.
 * Mix of fixed hand-crafted and procedurally generated.
 * @param {number} count
 * @param {string[]} [exclude=[]] - names already in use (e.g. player name)
 */
export function getBotNames(count, exclude = []) {
    const used = new Set(exclude.map(n => n.toLowerCase()));
    const results = [];

    // Shuffle fixed pool and pull from it first (~60% chance)
    const shuffledFixed = [...FIXED_NAMES].sort(() => Math.random() - 0.5);
    for (const name of shuffledFixed) {
        if (results.length >= count) break;
        if (!used.has(name.toLowerCase())) {
            results.push(name);
            used.add(name.toLowerCase());
        }
    }

    // Fill remaining slots with procedural names
    let attempts = 0;
    while (results.length < count && attempts < 200) {
        attempts++;
        // 40% chance to use procedural even if fixed slots remain
        const name = (Math.random() < 0.4 || results.length >= shuffledFixed.length)
            ? generateProceduralName()
            : results.length < count ? generateProceduralName() : null;
        if (name && !used.has(name.toLowerCase())) {
            results.push(name);
            used.add(name.toLowerCase());
        }
    }

    return results.slice(0, count);
}
