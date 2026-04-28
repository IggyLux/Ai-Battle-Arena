export const PALETTES = [
    { name: "Fire", skin: "#442222", armor: "#aa3322", accent: "#ffaa00" },
    { name: "Ice", skin: "#223344", armor: "#4488aa", accent: "#aaffff" },
    { name: "Nature", skin: "#223322", armor: "#447733", accent: "#aaff88" },
    { name: "Void", skin: "#111111", armor: "#331144", accent: "#bb88ff" },
    { name: "Royal", skin: "#554433", armor: "#ddaa33", accent: "#ffffff" },
    { name: "Plague", skin: "#333322", armor: "#556622", accent: "#ccff00" },
    { name: "Steel", skin: "#333333", armor: "#777788", accent: "#ccccdd" },
    { name: "Blood", skin: "#220000", armor: "#660000", accent: "#ff2222" }
];

const BUILDS = ["Normal", "Heavy", "Slim", "Giant", "Tiny", "Hunched"];
const HEADS = ["Helmet", "Skull", "Horned", "Hooded", "Crown", "Spiked", "Masked", "Wizard", "Knight", "Beast"];
const GEARS = ["sword", "axe", "staff", "bow", "claws", "whip", "orb", "spear"];

export class Unit {
    constructor(name, isPlayer = false) {
        const h = Math.abs(name.split("").reduce((a, b) => ((a * 31 + b.charCodeAt(0)) | 0), 0));
        this.name = name;
        this.isPlayer = isPlayer;
        this.palette = PALETTES[h % PALETTES.length];
        this.build = BUILDS[h % BUILDS.length];
        this.head = HEADS[h % HEADS.length];
        this.weapon = GEARS[h % GEARS.length];
        this.hasWings = (h % 7 === 0);
        this.hasBreasts = /\b(female|woman|girl|lady|chick|babe|hottie|milf|slut|whore|bitch|feminine|femme|she|her|mommy|mama|breedable|thicc|curvy|voluptuous|busty|bust|boobs|boobies|tits|titties|breasts|breast|chest|cleavage|rack|sexy|slutty|stripper|stripperific|thot|hoe|huge|bouncy|perky|hourglass|thick|jiggly|porn|nsfw|erotic|lewd|naked|topless|bikini|lingerie|corset|plump|round)\b/i.test(name);
        this.seed = h;
        this.hp = 100;
        this.x = 0;
        this.y = 0;
        this.angle = 0;
        this.cooldown = 0;
        this.topOfHeadY = 0;
    }

    draw(ctx, time, scale = 0.35, showUI = false) {
        if (this.hp <= 0) return;
        const p = this.palette;
        const walk = Math.sin(time) * 30;
        const bob = Math.cos(time * 2) * 8;
        let bw = 1, bh = 1, hunch = 0;

        switch(this.build) {
            case "Heavy": bw = 1.6; bh = 1.1; break;
            case "Slim": bw = 0.7; bh = 1.2; break;
            case "Giant": bw = 1.4; bh = 1.6; break;
            case "Tiny": bw = 0.5; bh = 0.5; break;
            case "Hunched": bw = 1.2; bh = 0.9; hunch = 20; break;
        }
        
        const torsoW = 60 * bw, torsoH = 90 * bh;
        let headVisualTop = -130 * bh - 60; 
        if(this.head === "Wizard") headVisualTop = -130 * bh - 115;
        else if(this.head === "Horned" || this.head === "Crown") headVisualTop = -130 * bh - 85;
        else if(this.head === "Spiked") headVisualTop = -130 * bh - 42;
        this.topOfHeadY = this.y + (bob * scale) + (headVisualTop * scale);

        ctx.save();
        ctx.translate(this.x, this.y + (bob * scale));
        ctx.scale(scale, scale);

        // UI: Selection Aura (Only if showUI is true)
        if (showUI && this.isPlayer) {
            ctx.save();
            ctx.beginPath();
            ctx.ellipse(0, 0, 110, 40, 0, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 215, 0, 0.6)";
            ctx.lineWidth = 8;
            ctx.setLineDash([15, 15]);
            ctx.stroke();
            ctx.restore();
        }

        // --- ART ---
        if(this.hasWings) {
            ctx.fillStyle = p.accent; ctx.globalAlpha = 0.6;
            const wingW = 80 + Math.sin(time * 2) * 10;
            ctx.beginPath(); ctx.ellipse(-30 * bw, -90 * bh, wingW, 25, 0.5, 0, Math.PI * 2);
            ctx.ellipse(30 * bw, -90 * bh, wingW, 25, -0.5, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1.0;
        }

        ctx.strokeStyle = p.skin; ctx.lineWidth = 12 * bw; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-20 * bw, -40); ctx.lineTo(-30 * bw + walk / 2, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(20 * bw, -40); ctx.lineTo(30 * bw - walk / 2, 0); ctx.stroke();
        ctx.lineWidth = 10 * bw;
        ctx.beginPath(); ctx.moveTo(-30 * bw, -120 * bh); ctx.lineTo(-50 * bw - walk / 3, -70 * bh); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(30 * bw, -120 * bh); ctx.lineTo(50 * bw + walk / 3, -70 * bh); ctx.stroke();
        ctx.fillStyle = p.armor; ctx.beginPath(); ctx.roundRect(-torsoW / 2, -130 * bh, torsoW, torsoH, 10); ctx.fill();
        
        if(this.hasBreasts) {
            const bBounce = Math.abs(Math.sin(time * 12)) * 3;
            const bRad = torsoW * 0.23, bY = -130 * bh + (torsoH * 0.3) + bBounce; 
            ctx.beginPath(); ctx.arc(-torsoW * 0.24, bY, bRad, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(torsoW * 0.24, bY, bRad, 0, Math.PI * 2); ctx.fill();
        }

        ctx.save();
        ctx.translate(hunch, -130 * bh);
        const hr = 25;
        ctx.fillStyle = (this.head === "Skull") ? "#eee" : p.armor;
        ctx.beginPath(); ctx.arc(0, -30, hr, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = p.accent; ctx.strokeStyle = p.accent;
        if(this.head === "Skull") { ctx.fillStyle="#333"; ctx.fillRect(-10,-35,5,5); ctx.fillRect(5,-35,5,5); }
        ctx.restore();

        ctx.save(); ctx.translate(40 * bw, -90 * bh); ctx.rotate(Math.sin(time) * 0.2); 
        ctx.strokeStyle = "#bbb"; ctx.lineWidth = 6;
        ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-80); ctx.stroke();
        ctx.restore();

        ctx.restore();

        // UI: Health/Name (Only if showUI is true)
        if (showUI) {
            let barY = this.topOfHeadY - 20;
            ctx.font = this.isPlayer ? "bold 14px sans-serif" : "12px sans-serif";
            ctx.fillStyle = this.isPlayer ? "#ffd700" : "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(this.isPlayer ? "YOU" : this.name, this.x, barY - 10);
            ctx.fillStyle = "rgba(0,0,0,0.5)"; ctx.fillRect(this.x - 20, barY, 40, 5);
            ctx.fillStyle = this.isPlayer ? "#00ffff" : "#0f0";
            ctx.fillRect(this.x - 20, barY, (this.hp / 100) * 40, 5);
        }
    }
}
