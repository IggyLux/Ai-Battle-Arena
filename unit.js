export const PALETTES = [
    { name: "Fire",   skin: "#5a2a1a", armor: "#aa3322", accent: "#ffaa00" },
    { name: "Ice",    skin: "#2a3f50", armor: "#4488aa", accent: "#aaffff" },
    { name: "Nature", skin: "#2a3a22", armor: "#447733", accent: "#aaff88" },
    { name: "Void",   skin: "#1a1020", armor: "#331144", accent: "#bb88ff" },
    { name: "Royal",  skin: "#5a4a33", armor: "#ddaa33", accent: "#ffffff" },
    { name: "Plague", skin: "#3a3822", armor: "#556622", accent: "#ccff00" },
    { name: "Steel",  skin: "#3a3535", armor: "#777788", accent: "#ccccdd" },
    { name: "Blood",  skin: "#300a0a", armor: "#660000", accent: "#ff2222" }
];

const BUILDS = ["Normal", "Heavy", "Slim", "Giant", "Tiny", "Hunched"];
const HEADS  = ["Helmet", "Skull", "Horned", "Hooded", "Crown", "Spiked", "Masked", "Wizard", "Knight", "Beast"];
const GEARS  = ["sword", "axe", "staff", "bow", "claws", "whip", "orb", "spear"];

function hashDerive(h, step) {
    let v = (h ^ (h >>> 16)) + step * 0x9e3779b9;
    v = Math.imul(v ^ (v >>> 15), 0x85ebca6b);
    v = Math.imul(v ^ (v >>> 13), 0xc2b2ae35);
    v = Math.abs(v ^ (v >>> 16));
    return v;
}

export class Unit {
    constructor(name, isPlayer = false) {
        const h = Math.abs(name.split("").reduce((a, b) => ((a * 31 + b.charCodeAt(0)) | 0), 0));
        this.name      = name;
        this.isPlayer  = isPlayer;
        this.seed      = h;
        this.palette   = PALETTES[hashDerive(h, 1) % PALETTES.length];
        this.build     = BUILDS  [hashDerive(h, 2) % BUILDS.length];
        this.head      = HEADS   [hashDerive(h, 3) % HEADS.length];
        this.weapon    = GEARS   [hashDerive(h, 4) % GEARS.length];
        this.hasWings  = (hashDerive(h, 5) % 7 === 0);
        this.hasBreasts = /\b(female|woman|women|girl|lady|chick|babe|hottie|milf|slut|whore|bitch|feminine|femme|she|her|mommy|mama|breedable|thicc|curvy|voluptuous|busty|breast|chest|cleavage|rack|sexy|slutty|stripper|stripperific|thot|hoe|huge|bouncy|perky|hourglass|thick|jiggly|porn|nsfw|erotic|lewd|naked|topless|bikini|lingerie|corset|plump|round)\b/i.test(name);
        this.hp          = 100;
        this.x           = 0;
        this.y           = 0;
        this.topOfHeadY  = 0;
        this.deathFrames = 0;
    }

    // ─────────────────────────────────────────────────────
    // HEAD DRAWING — each head type gets a full face
    // All coords are relative to head center (0, -30)
    // ─────────────────────────────────────────────────────
    _drawHead(ctx, time, p) {
        const hr = 25;
        const hcy = -30; // head center Y

        // ── Base head shape ──────────────────────────────
        switch (this.head) {

            case "Skull": {
                // Bone-white skull with hollow sockets and stitched grin
                ctx.fillStyle = "#e8e0d0";
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();
                // Slight cheekbone widening at jaw
                ctx.beginPath(); ctx.ellipse(0, hcy + 10, hr - 2, 14, 0, 0, Math.PI); ctx.fill();

                // Hollow eye sockets — dark recessed holes
                ctx.fillStyle = "#111";
                ctx.beginPath(); ctx.ellipse(-9, hcy - 4, 7, 8, -0.2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 9, hcy - 4, 7, 8,  0.2, 0, Math.PI * 2); ctx.fill();
                // Inner socket glint
                ctx.fillStyle = "rgba(180,0,0,0.5)";
                ctx.beginPath(); ctx.arc(-9, hcy - 5, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc( 9, hcy - 5, 2.5, 0, Math.PI * 2); ctx.fill();

                // Nasal cavity — inverted heart shape
                ctx.fillStyle = "#222";
                ctx.beginPath();
                ctx.moveTo(0, hcy + 8);
                ctx.bezierCurveTo(-5, hcy + 4, -5, hcy + 2, 0, hcy + 4);
                ctx.bezierCurveTo( 5, hcy + 2,  5, hcy + 4, 0, hcy + 8);
                ctx.fill();

                // Stitched grin — jagged teeth with stitches above
                ctx.strokeStyle = "#555"; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-13, hcy + 16);
                for (let i = 0; i <= 6; i++) {
                    const tx = -13 + i * 4.3;
                    const ty = hcy + 16 + (i % 2 === 0 ? 0 : 5);
                    ctx.lineTo(tx, ty);
                }
                ctx.stroke();
                // Stitches above the grin
                ctx.strokeStyle = "#888"; ctx.lineWidth = 1;
                for (let i = -10; i <= 10; i += 6) {
                    ctx.beginPath();
                    ctx.moveTo(i, hcy + 13);
                    ctx.lineTo(i + 2, hcy + 11);
                    ctx.stroke();
                }
                // Hairline crack
                ctx.strokeStyle = "rgba(0,0,0,0.4)"; ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(4, hcy - hr + 3);
                ctx.lineTo(8, hcy - 14);
                ctx.lineTo(5, hcy - 6);
                ctx.stroke();
                break;
            }

            case "Horned": {
                // Horns first (behind head)
                ctx.fillStyle = p.accent;
                ctx.beginPath();
                ctx.moveTo(-18, hcy - 14);
                ctx.bezierCurveTo(-50, hcy - 60, -40, hcy - 90, -12, hcy - 58);
                ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo( 18, hcy - 14);
                ctx.bezierCurveTo( 50, hcy - 60,  40, hcy - 90,  12, hcy - 58);
                ctx.closePath(); ctx.fill();
                // Horn highlight
                ctx.strokeStyle = "rgba(255,255,255,0.2)"; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-18, hcy - 14);
                ctx.bezierCurveTo(-45, hcy - 55, -36, hcy - 80, -14, hcy - 56);
                ctx.stroke();

                // Face — slightly angular, demonic
                ctx.fillStyle = p.skin;
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();

                // Angry heavy brow ridge
                ctx.fillStyle = "rgba(0,0,0,0.35)";
                ctx.beginPath();
                ctx.moveTo(-hr, hcy - 8);
                ctx.quadraticCurveTo(0, hcy - 18, hr, hcy - 8);
                ctx.quadraticCurveTo(0, hcy - 10, -hr, hcy - 8);
                ctx.fill();

                // Glowing eyes
                ctx.fillStyle = p.accent;
                ctx.shadowBlur = 8; ctx.shadowColor = p.accent;
                ctx.beginPath(); ctx.ellipse(-9, hcy - 6, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 9, hcy - 6, 5, 4, 0, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
                ctx.fillStyle = "#000";
                ctx.beginPath(); ctx.ellipse(-9, hcy - 6, 2, 3, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 9, hcy - 6, 2, 3, 0, 0, Math.PI * 2); ctx.fill();

                // Snarling mouth — upper lip curled
                ctx.strokeStyle = "rgba(0,0,0,0.7)"; ctx.lineWidth = 2; ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(-12, hcy + 10);
                ctx.quadraticCurveTo(0, hcy + 16, 12, hcy + 10);
                ctx.stroke();
                // Fangs
                ctx.fillStyle = "#eee";
                ctx.beginPath(); ctx.moveTo(-6, hcy + 11); ctx.lineTo(-3, hcy + 18); ctx.lineTo(0, hcy + 11); ctx.fill();
                ctx.beginPath(); ctx.moveTo( 3, hcy + 11); ctx.lineTo( 6, hcy + 18); ctx.lineTo( 9, hcy + 11); ctx.fill();
                break;
            }

            case "Hooded": {
                // Hood shape — deep cowl
                ctx.fillStyle = p.armor;
                ctx.beginPath();
                ctx.arc(0, hcy, hr + 6, Math.PI, 0);
                ctx.lineTo(hr + 10, hcy + 12);
                ctx.quadraticCurveTo(0, hcy + 22, -hr - 10, hcy + 12);
                ctx.closePath(); ctx.fill();
                // Hood inner shadow — the dark void inside
                ctx.fillStyle = "#0a0a0a";
                ctx.beginPath();
                ctx.ellipse(0, hcy - 2, hr - 4, hr - 2, 0, 0, Math.PI * 2);
                ctx.fill();
                // Fabric folds on hood
                ctx.strokeStyle = "rgba(255,255,255,0.07)"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(-hr - 6, hcy); ctx.quadraticCurveTo(-hr, hcy - 20, -10, hcy - hr); ctx.stroke();
                ctx.beginPath(); ctx.moveTo( hr + 6, hcy); ctx.quadraticCurveTo( hr, hcy - 20,  10, hcy - hr); ctx.stroke();

                // Two faint glowing eyes deep in the shadow
                const eyeGlow = 0.5 + Math.sin(time * 1.5) * 0.2;
                ctx.fillStyle = p.accent;
                ctx.shadowBlur = 12; ctx.shadowColor = p.accent;
                ctx.globalAlpha = eyeGlow;
                ctx.beginPath(); ctx.ellipse(-8, hcy - 4, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 8, hcy - 4, 4, 2.5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;

                // Barely visible thin mouth line
                ctx.strokeStyle = `rgba(${p.accent}, 0.3)`;
                ctx.strokeStyle = p.accent;
                ctx.globalAlpha = 0.25;
                ctx.lineWidth = 1.5; ctx.lineCap = "round";
                ctx.beginPath();
                ctx.moveTo(-7, hcy + 11);
                ctx.lineTo( 7, hcy + 11);
                ctx.stroke();
                ctx.globalAlpha = 1.0;
                break;
            }

            case "Crown": {
                // Crown (behind head)
                ctx.fillStyle = p.accent;
                ctx.beginPath();
                ctx.moveTo(-hr, hcy - hr + 4);
                ctx.lineTo(-hr, hcy - hr - 22);
                ctx.lineTo(-hr * 0.5, hcy - hr - 4);
                ctx.lineTo(0, hcy - hr - 30);
                ctx.lineTo(hr * 0.5, hcy - hr - 4);
                ctx.lineTo(hr, hcy - hr - 22);
                ctx.lineTo(hr, hcy - hr + 4);
                ctx.closePath(); ctx.fill();
                // Jewel in crown
                ctx.fillStyle = "#ff4466";
                ctx.beginPath(); ctx.arc(0, hcy - hr - 18, 5, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "rgba(255,255,255,0.6)";
                ctx.beginPath(); ctx.arc(-1, hcy - hr - 20, 2, 0, Math.PI * 2); ctx.fill();

                // Regal face
                ctx.fillStyle = p.skin;
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();

                // Thin arched eyebrows
                ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.lineWidth = 2; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(-14, hcy - 10); ctx.quadraticCurveTo(-9, hcy - 16, -4, hcy - 11); ctx.stroke();
                ctx.beginPath(); ctx.moveTo( 14, hcy - 10); ctx.quadraticCurveTo( 9, hcy - 16,  4, hcy - 11); ctx.stroke();

                // Elegant narrow eyes
                ctx.fillStyle = "#222";
                ctx.beginPath(); ctx.ellipse(-9, hcy - 6, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 9, hcy - 6, 5, 3, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = p.accent;
                ctx.beginPath(); ctx.arc(-9, hcy - 6, 1.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc( 9, hcy - 6, 1.5, 0, Math.PI * 2); ctx.fill();

                // Small proud closed mouth — slight smirk
                ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-7, hcy + 12);
                ctx.quadraticCurveTo(-2, hcy + 14, 4, hcy + 11);
                ctx.stroke();
                break;
            }

            case "Spiked": {
                // Spikes radiating from head
                ctx.fillStyle = p.accent;
                for (let i = 0; i < 8; i++) {
                    const angle = -Math.PI + i * (Math.PI / 4);
                    const sx = Math.cos(angle);
                    const sy = Math.sin(angle);
                    ctx.beginPath();
                    ctx.moveTo(sx * hr, sy * hr + hcy);
                    ctx.lineTo(sx * (hr + 18), sy * (hr + 18) + hcy);
                    // Spike is tapered — draw as thin triangle
                    ctx.lineTo(sx * hr + sy * 5, sy * hr - sx * 5 + hcy);
                    ctx.closePath(); ctx.fill();
                }

                // Brutal face
                ctx.fillStyle = p.skin;
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();
                // Battle scar across face
                ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-12, hcy - 14); ctx.lineTo(-4, hcy - 2); ctx.lineTo(-8, hcy + 4);
                ctx.stroke();

                // Heavy squinting brow
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.beginPath();
                ctx.moveTo(-hr + 2, hcy - 10);
                ctx.lineTo(-4, hcy - 8);
                ctx.lineTo(-4, hcy - 14);
                ctx.lineTo(-hr + 2, hcy - 16);
                ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(hr - 2, hcy - 10);
                ctx.lineTo( 4, hcy - 8);
                ctx.lineTo( 4, hcy - 14);
                ctx.lineTo(hr - 2, hcy - 16);
                ctx.closePath(); ctx.fill();

                // Angry squinting eyes — narrow slits
                ctx.fillStyle = "#cc2200";
                ctx.beginPath(); ctx.ellipse(-9, hcy - 5, 5, 2.5, -0.2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 9, hcy - 5, 5, 2.5,  0.2, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#000";
                ctx.beginPath(); ctx.ellipse(-9, hcy - 5, 2, 2, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 9, hcy - 5, 2, 2, 0, 0, Math.PI * 2); ctx.fill();

                // Clenched teeth grimace
                ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.lineWidth = 2;
                ctx.beginPath(); ctx.moveTo(-11, hcy + 12); ctx.lineTo(11, hcy + 12); ctx.stroke();
                ctx.fillStyle = "#ddd";
                for (let i = -9; i <= 9; i += 6) {
                    ctx.fillRect(i, hcy + 10, 4, 5);
                }
                break;
            }

            case "Masked": {
                // Face base underneath
                ctx.fillStyle = p.skin;
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();

                // Mask — covers upper 2/3 of face
                ctx.fillStyle = "#1a1a1a";
                ctx.beginPath();
                ctx.arc(0, hcy, hr + 1, Math.PI * 1.1, Math.PI * 1.9);
                ctx.lineTo(hr - 2, hcy + 8);
                ctx.quadraticCurveTo(0, hcy + 14, -hr + 2, hcy + 8);
                ctx.closePath(); ctx.fill();

                // Mask decorative line down the centre
                ctx.strokeStyle = p.accent; ctx.lineWidth = 1.5; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(0, hcy - hr); ctx.lineTo(0, hcy + 8); ctx.stroke();
                // Horizontal stripe
                ctx.beginPath(); ctx.moveTo(-hr + 4, hcy - 6); ctx.lineTo(hr - 4, hcy - 6); ctx.stroke();

                // Eye holes — menacing angular slits
                ctx.fillStyle = p.accent;
                ctx.shadowBlur = 8; ctx.shadowColor = p.accent;
                ctx.beginPath();
                ctx.moveTo(-16, hcy - 10); ctx.lineTo(-5, hcy - 12);
                ctx.lineTo(-5,  hcy - 4);  ctx.lineTo(-16, hcy - 6);
                ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(16, hcy - 10); ctx.lineTo(5, hcy - 12);
                ctx.lineTo(5,  hcy - 4);  ctx.lineTo(16, hcy - 6);
                ctx.closePath(); ctx.fill();
                ctx.shadowBlur = 0;

                // Visible lower face — sneer
                ctx.strokeStyle = "rgba(0,0,0,0.5)"; ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(-8, hcy + 14);
                ctx.quadraticCurveTo(0, hcy + 18, 8, hcy + 14);
                ctx.stroke();
                break;
            }

            case "Wizard": {
                // Hat (tall pointy, drawn behind head)
                ctx.fillStyle = p.armor;
                ctx.beginPath();
                ctx.moveTo(-40, hcy - hr + 6);
                ctx.lineTo(0, hcy - hr - 80);
                ctx.lineTo(40, hcy - hr + 6);
                ctx.closePath(); ctx.fill();
                // Hat brim
                ctx.beginPath(); ctx.ellipse(0, hcy - hr + 6, 44, 10, 0, 0, Math.PI * 2); ctx.fill();
                // Hat star decoration
                ctx.fillStyle = p.accent;
                ctx.shadowBlur = 6; ctx.shadowColor = p.accent;
                const starY = hcy - hr - 40;
                for (let i = 0; i < 5; i++) {
                    const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
                    const a2 = a + Math.PI / 5;
                    ctx.beginPath();
                    ctx.moveTo(Math.cos(a) * 8, starY + Math.sin(a) * 8);
                    ctx.lineTo(Math.cos(a2) * 3.5, starY + Math.sin(a2) * 3.5);
                }
                ctx.fillStyle = p.accent;
                // Simple star as polygon
                ctx.beginPath();
                for (let i = 0; i < 10; i++) {
                    const a = -Math.PI / 2 + i * (Math.PI / 5);
                    const r = i % 2 === 0 ? 7 : 3;
                    i === 0 ? ctx.moveTo(Math.cos(a)*r, starY + Math.sin(a)*r)
                            : ctx.lineTo(Math.cos(a)*r, starY + Math.sin(a)*r);
                }
                ctx.closePath(); ctx.fill();
                ctx.shadowBlur = 0;

                // Old wise face
                ctx.fillStyle = p.skin;
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();

                // Bushy white eyebrows
                ctx.strokeStyle = "#ddddcc"; ctx.lineWidth = 4; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(-16, hcy - 9); ctx.quadraticCurveTo(-9, hcy - 16, -3, hcy - 10); ctx.stroke();
                ctx.beginPath(); ctx.moveTo( 16, hcy - 9); ctx.quadraticCurveTo( 9, hcy - 16,  3, hcy - 10); ctx.stroke();

                // Small round spectacle eyes
                ctx.strokeStyle = "#888"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(-9, hcy - 4, 5, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.arc( 9, hcy - 4, 5, 0, Math.PI * 2); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(-4, hcy - 4); ctx.lineTo(4, hcy - 4); ctx.stroke(); // bridge
                ctx.fillStyle = "#2244aa";
                ctx.beginPath(); ctx.arc(-9, hcy - 4, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc( 9, hcy - 4, 3, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#000";
                ctx.beginPath(); ctx.arc(-9, hcy - 5, 1.2, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc( 9, hcy - 5, 1.2, 0, Math.PI * 2); ctx.fill();

                // Long hooked nose
                ctx.strokeStyle = "rgba(0,0,0,0.3)"; ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(0, hcy - 2);
                ctx.quadraticCurveTo(6, hcy + 6, 2, hcy + 12);
                ctx.stroke();

                // Wispy white beard
                ctx.strokeStyle = "#ddddcc"; ctx.lineWidth = 2.5; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(-10, hcy + 14); ctx.quadraticCurveTo(-14, hcy + 36, -8, hcy + 48); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(0,   hcy + 16); ctx.quadraticCurveTo(2,   hcy + 40,  0, hcy + 52); ctx.stroke();
                ctx.beginPath(); ctx.moveTo( 10, hcy + 14); ctx.quadraticCurveTo( 14, hcy + 36,  8, hcy + 48); ctx.stroke();
                break;
            }

            case "Knight": {
                // Full plate helmet
                // Dome
                ctx.fillStyle = p.armor;
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();
                // Cheek guards — wider at bottom
                ctx.fillStyle = p.armor;
                ctx.beginPath();
                ctx.moveTo(-hr, hcy - 5);
                ctx.lineTo(-hr - 6, hcy + 8);
                ctx.lineTo(-hr - 4, hcy + 18);
                ctx.lineTo(-hr + 4, hcy + 16);
                ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(hr, hcy - 5);
                ctx.lineTo(hr + 6, hcy + 8);
                ctx.lineTo(hr + 4, hcy + 18);
                ctx.lineTo(hr - 4, hcy + 16);
                ctx.closePath(); ctx.fill();

                // T-visor slit — horizontal bar + vertical bar
                ctx.fillStyle = "#0a0a0a";
                ctx.fillRect(-hr + 3, hcy - 10, (hr * 2) - 6, 7); // horizontal visor
                ctx.fillRect(-4, hcy - 10, 8, 22); // vertical nose bar

                // Visor highlight
                ctx.strokeStyle = "rgba(255,255,255,0.15)"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(-hr + 4, hcy - 7); ctx.lineTo(-5, hcy - 7); ctx.stroke();
                ctx.beginPath(); ctx.moveTo(5, hcy - 7); ctx.lineTo(hr - 4, hcy - 7); ctx.stroke();

                // Eye glow visible through visor
                ctx.fillStyle = p.accent;
                ctx.shadowBlur = 6; ctx.shadowColor = p.accent;
                ctx.beginPath(); ctx.ellipse(-10, hcy - 7, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 10, hcy - 7, 5, 2, 0, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;

                // Rivets on dome
                ctx.fillStyle = "rgba(255,255,255,0.25)";
                [[-15,-38],[0,-42],[15,-38],[-20,-28],[20,-28]].forEach(([rx,ry]) => {
                    ctx.beginPath(); ctx.arc(rx, ry + hcy + 30, 2, 0, Math.PI * 2); ctx.fill();
                });

                // Plume on top
                ctx.fillStyle = p.accent;
                ctx.beginPath();
                ctx.moveTo(-5, hcy - hr);
                ctx.bezierCurveTo(-8, hcy - hr - 20, 5, hcy - hr - 35, 3, hcy - hr - 50);
                ctx.bezierCurveTo(10, hcy - hr - 30, 4, hcy - hr - 15, 5, hcy - hr);
                ctx.fill();
                break;
            }

            case "Beast": {
                // Bestial head — wider jaw, elongated snout
                ctx.fillStyle = p.skin;
                // Main skull
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();
                // Extended jaw/snout
                ctx.beginPath();
                ctx.moveTo(-hr + 6, hcy + 4);
                ctx.quadraticCurveTo(-hr + 2, hcy + 22, -10, hcy + 24);
                ctx.quadraticCurveTo(0, hcy + 28, 10, hcy + 24);
                ctx.quadraticCurveTo(hr - 2, hcy + 22, hr - 6, hcy + 4);
                ctx.fill();

                // Ear tufts
                ctx.fillStyle = p.skin;
                ctx.beginPath();
                ctx.moveTo(-hr + 2, hcy - hr + 8);
                ctx.lineTo(-hr - 10, hcy - hr - 12);
                ctx.lineTo(-hr + 14, hcy - hr + 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(hr - 2, hcy - hr + 8);
                ctx.lineTo(hr + 10, hcy - hr - 12);
                ctx.lineTo(hr - 14, hcy - hr + 2);
                ctx.fill();
                // Inner ear
                ctx.fillStyle = "rgba(255,100,100,0.4)";
                ctx.beginPath();
                ctx.moveTo(-hr + 2, hcy - hr + 6);
                ctx.lineTo(-hr - 5, hcy - hr - 6);
                ctx.lineTo(-hr + 10, hcy - hr + 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(hr - 2, hcy - hr + 6);
                ctx.lineTo(hr + 5, hcy - hr - 6);
                ctx.lineTo(hr - 10, hcy - hr + 2);
                ctx.fill();

                // Yellow slit eyes
                ctx.fillStyle = "#ddaa00";
                ctx.beginPath(); ctx.ellipse(-10, hcy - 6, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 10, hcy - 6, 7, 5, 0, 0, Math.PI * 2); ctx.fill();
                // Slit pupils
                ctx.fillStyle = "#000";
                ctx.beginPath(); ctx.ellipse(-10, hcy - 6, 2, 5, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 10, hcy - 6, 2, 5, 0, 0, Math.PI * 2); ctx.fill();

                // Nostrils
                ctx.fillStyle = "rgba(0,0,0,0.4)";
                ctx.beginPath(); ctx.ellipse(-5, hcy + 10, 3, 2, -0.3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 5, hcy + 10, 3, 2,  0.3, 0, Math.PI * 2); ctx.fill();

                // Jagged uneven teeth along lower jaw
                ctx.fillStyle = "#e8e0cc";
                const teethX = [-12, -7, -2, 3, 8, 13];
                const teethH = [10, 14, 12, 15, 11, 9];
                teethX.forEach((tx, i) => {
                    ctx.beginPath();
                    ctx.moveTo(tx, hcy + 18);
                    ctx.lineTo(tx + 2, hcy + 18 + teethH[i]);
                    ctx.lineTo(tx + 4, hcy + 18);
                    ctx.fill();
                });
                // Upper fang pair
                ctx.fillStyle = "#fffaf0";
                ctx.beginPath(); ctx.moveTo(-8, hcy + 18); ctx.lineTo(-5, hcy + 28); ctx.lineTo(-2, hcy + 18); ctx.fill();
                ctx.beginPath(); ctx.moveTo( 5, hcy + 18); ctx.lineTo( 8, hcy + 28); ctx.lineTo(11, hcy + 18); ctx.fill();
                break;
            }

            case "Helmet":
            default: {
                // Base helm dome
                ctx.fillStyle = p.armor;
                ctx.beginPath(); ctx.arc(0, hcy, hr, 0, Math.PI * 2); ctx.fill();
                // Cheek flares
                ctx.beginPath();
                ctx.moveTo(-hr, hcy + 2);
                ctx.lineTo(-hr - 5, hcy + 14);
                ctx.lineTo(-hr + 6, hcy + 18);
                ctx.lineTo(-hr + 8, hcy + 4);
                ctx.closePath(); ctx.fill();
                ctx.beginPath();
                ctx.moveTo(hr, hcy + 2);
                ctx.lineTo(hr + 5, hcy + 14);
                ctx.lineTo(hr - 6, hcy + 18);
                ctx.lineTo(hr - 8, hcy + 4);
                ctx.closePath(); ctx.fill();

                // Nose guard — vertical ridge
                ctx.fillStyle = "rgba(0,0,0,0.2)";
                ctx.fillRect(-3, hcy - 12, 6, 24);

                // Eye slots
                ctx.fillStyle = "#111";
                ctx.beginPath(); ctx.ellipse(-10, hcy - 5, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 10, hcy - 5, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = p.accent;
                ctx.shadowBlur = 5; ctx.shadowColor = p.accent;
                ctx.beginPath(); ctx.ellipse(-10, hcy - 5, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse( 10, hcy - 5, 3, 2, 0, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;

                // Brow ridge and centre crest
                ctx.fillStyle = p.accent;
                ctx.beginPath();
                ctx.moveTo(-hr, hcy - 12);
                ctx.quadraticCurveTo(0, hcy - 18, hr, hcy - 12);
                ctx.quadraticCurveTo(0, hcy - 10, -hr, hcy - 12);
                ctx.fill();
                // Top crest fin
                ctx.fillStyle = p.accent;
                ctx.beginPath();
                ctx.moveTo(-4, hcy - hr);
                ctx.lineTo(0, hcy - hr - 14);
                ctx.lineTo(4, hcy - hr);
                ctx.fill();
                break;
            }
        }
    }

    // ─────────────────────────────────────────────────────
    // CLAW HANDS — drawn on both arms instead of a held weapon
    // cx/cy = tip of the arm (where hands would be)
    // ─────────────────────────────────────────────────────
    _drawClawHand(ctx, cx, cy, facingLeft, p) {
        ctx.save();
        ctx.translate(cx, cy);
        // Mirror for left hand
        if (facingLeft) ctx.scale(-1, 1);

        // Palm nub
        ctx.fillStyle = p.skin;
        ctx.beginPath(); ctx.arc(0, 0, 8, 0, Math.PI * 2); ctx.fill();

        // 4 curved blade-like claw fingers fanning outward
        const angles = [-0.5, -0.15, 0.2, 0.55];
        angles.forEach((a, i) => {
            ctx.save();
            ctx.rotate(a - 0.6); // overall angle: claws point forward/down
            // Knuckle
            ctx.fillStyle = p.skin;
            ctx.beginPath(); ctx.arc(0, -8, 4, 0, Math.PI * 2); ctx.fill();
            // Claw blade
            ctx.fillStyle = p.accent;
            ctx.shadowBlur = 4; ctx.shadowColor = p.accent;
            ctx.beginPath();
            ctx.moveTo(-2, -8);
            ctx.bezierCurveTo(-4, -20, 2, -30, 1, -36);
            ctx.bezierCurveTo(0, -30, 6, -20, 2, -8);
            ctx.closePath();
            ctx.fill();
            ctx.shadowBlur = 0;
            // Claw highlight
            ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(0, -10);
            ctx.bezierCurveTo(-1, -20, 1, -28, 0.5, -34);
            ctx.stroke();
            ctx.restore();
        });

        ctx.restore();
    }

    // ─────────────────────────────────────────────────────
    // MAIN DRAW
    // ─────────────────────────────────────────────────────
    draw(ctx, time, scale = 0.35, showUI = false) {
        // Death flash
        if (this.hp <= 0) {
            if (this.deathFrames < 60) {
                const alpha = 1 - (this.deathFrames / 60);
                ctx.save();
                ctx.globalAlpha = alpha;
                ctx.translate(this.x, this.y);
                ctx.fillStyle = "#ff0000";
                ctx.beginPath(); ctx.arc(0, -20 * scale, 30 * scale, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff";
                ctx.font = `bold ${Math.floor(20 * scale)}px sans-serif`;
                ctx.textAlign = "center";
                ctx.fillText("💀", 0, -15 * scale);
                ctx.restore();
            }
            return;
        }

        const p = this.palette;
        const walk = Math.sin(time) * 30;
        const bob  = Math.cos(time * 2) * 8;
        let bw = 1, bh = 1, hunch = 0;

        switch (this.build) {
            case "Heavy":   bw = 1.6; bh = 1.1; break;
            case "Slim":    bw = 0.7; bh = 1.2; break;
            case "Giant":   bw = 1.4; bh = 1.6; break;
            case "Tiny":    bw = 0.5; bh = 0.5; break;
            case "Hunched": bw = 1.2; bh = 0.9; hunch = 20; break;
        }

        const torsoW = 60 * bw, torsoH = 90 * bh;

        // Head height for UI bar placement
        let headVisualTop = -130 * bh - 60;
        if (this.head === "Wizard")                                headVisualTop = -130 * bh - 115;
        else if (this.head === "Horned" || this.head === "Crown")  headVisualTop = -130 * bh - 85;
        else if (this.head === "Spiked")                           headVisualTop = -130 * bh - 50;
        else if (this.head === "Beast")                            headVisualTop = -130 * bh - 70;
        this.topOfHeadY = this.y + (bob * scale) + (headVisualTop * scale);

        // Player selection aura
        if (showUI && this.isPlayer) {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.beginPath();
            ctx.ellipse(0, 0, 110 * scale, 40 * scale, 0, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255, 215, 0, 0.8)";
            ctx.lineWidth = 4;
            ctx.setLineDash([5, 5]);
            ctx.stroke();
            ctx.restore();
        }

        ctx.save();
        ctx.translate(this.x, this.y + (bob * scale));
        ctx.scale(scale, scale);

        // Wings
        if (this.hasWings) {
            ctx.fillStyle = p.accent; ctx.globalAlpha = 0.6;
            const wingW = 80 + Math.sin(time * 2) * 10;
            ctx.beginPath();
            ctx.ellipse(-30 * bw, -90 * bh, wingW, 25,  0.5, 0, Math.PI * 2);
            ctx.ellipse( 30 * bw, -90 * bh, wingW, 25, -0.5, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = 1.0;
        }

        // Legs
        ctx.strokeStyle = p.skin; ctx.lineWidth = 12 * bw; ctx.lineCap = "round";
        ctx.beginPath(); ctx.moveTo(-20 * bw, -40); ctx.lineTo(-30 * bw + walk / 2, 0); ctx.stroke();
        ctx.beginPath(); ctx.moveTo( 20 * bw, -40); ctx.lineTo( 30 * bw - walk / 2, 0); ctx.stroke();

        // Compute arm tip positions (used for claws)
        const leftArmTipX  = -50 * bw - walk / 3;
        const leftArmTipY  = -70 * bh;
        const rightArmTipX =  50 * bw + walk / 3;
        const rightArmTipY = -70 * bh;

        // Arms
        ctx.lineWidth = 10 * bw;
        ctx.strokeStyle = p.skin;
        ctx.beginPath(); ctx.moveTo(-30 * bw, -120 * bh); ctx.lineTo(leftArmTipX,  leftArmTipY);  ctx.stroke();
        ctx.beginPath(); ctx.moveTo( 30 * bw, -120 * bh); ctx.lineTo(rightArmTipX, rightArmTipY); ctx.stroke();

        // Torso
        ctx.fillStyle = p.armor;
        ctx.beginPath(); ctx.roundRect(-torsoW / 2, -130 * bh, torsoW, torsoH, 10); ctx.fill();
        // Torso detail line down centre
        ctx.strokeStyle = "rgba(0,0,0,0.15)"; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, -130 * bh + 8); ctx.lineTo(0, -130 * bh + torsoH - 8); ctx.stroke();

        // Breasts
        if (this.hasBreasts) {
            const bBounce = Math.abs(Math.sin(time * 12)) * 3;
            const bRad = torsoW * 0.23;
            const bY   = -130 * bh + (torsoH * 0.3) + bBounce;
            const bOff = torsoW * 0.24;
            ctx.fillStyle = p.armor; ctx.strokeStyle = "rgba(0,0,0,0.2)"; ctx.lineWidth = 1.5;
            ctx.beginPath(); ctx.arc(-bOff, bY, bRad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.beginPath(); ctx.arc( bOff, bY, bRad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }

        // Head
        ctx.save();
        ctx.translate(hunch, -130 * bh);
        this._drawHead(ctx, time, p);
        ctx.restore();

        // Weapon OR claws on hands
        if (this.weapon === "claws") {
            // Draw claw hands at both arm tips — no separate weapon slot
            this._drawClawHand(ctx, leftArmTipX,  leftArmTipY,  true,  p);
            this._drawClawHand(ctx, rightArmTipX, rightArmTipY, false, p);
        } else {
            // Weapon held in right hand
            ctx.save();
            ctx.translate(40 * bw, -90 * bh);
            ctx.rotate(Math.sin(time) * 0.2);
            ctx.strokeStyle = "#bbb"; ctx.lineWidth = 6;
            switch (this.weapon) {
                case "sword":
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -90); ctx.stroke();
                    ctx.lineWidth = 12;
                    ctx.beginPath(); ctx.moveTo(-15, -10); ctx.lineTo(15, -10); ctx.stroke();
                    // Blade glint
                    ctx.strokeStyle = "rgba(255,255,255,0.5)"; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(2, -15); ctx.lineTo(2, -88); ctx.stroke();
                    break;
                case "axe":
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -80); ctx.stroke();
                    ctx.fillStyle = "#888";
                    ctx.beginPath();
                    ctx.moveTo(0, -60); ctx.lineTo(-28, -85); ctx.lineTo(-20, -55);
                    ctx.closePath(); ctx.fill();
                    ctx.fillStyle = "rgba(255,255,255,0.2)";
                    ctx.beginPath();
                    ctx.moveTo(0, -62); ctx.lineTo(-22, -83); ctx.lineTo(-18, -62);
                    ctx.closePath(); ctx.fill();
                    break;
                case "staff":
                    // Gnarled staff
                    ctx.strokeStyle = "#8B5E3C"; ctx.lineWidth = 7;
                    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -110); ctx.stroke();
                    ctx.lineWidth = 4;
                    ctx.beginPath(); ctx.moveTo(0, -70); ctx.lineTo(-10, -85); ctx.stroke(); // branch
                    ctx.fillStyle = p.accent;
                    ctx.shadowBlur = 14; ctx.shadowColor = p.accent;
                    ctx.beginPath(); ctx.arc(0, -110, 11, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = "rgba(255,255,255,0.6)";
                    ctx.beginPath(); ctx.arc(-3, -113, 4, 0, Math.PI * 2); ctx.fill();
                    ctx.shadowBlur = 0;
                    break;
                case "spear":
                    ctx.strokeStyle = "#a07040"; ctx.lineWidth = 5;
                    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(0, -120); ctx.stroke();
                    ctx.fillStyle = "#ccccdd";
                    ctx.beginPath();
                    ctx.moveTo(-7, -118); ctx.lineTo(0, -140); ctx.lineTo(7, -118);
                    ctx.lineTo(3, -110); ctx.lineTo(-3, -110);
                    ctx.closePath(); ctx.fill();
                    ctx.strokeStyle = "rgba(255,255,255,0.3)"; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(-2, -120); ctx.lineTo(1, -138); ctx.stroke();
                    break;
                case "bow":
                    ctx.strokeStyle = "#7a4a1a"; ctx.lineWidth = 5;
                    ctx.beginPath(); ctx.arc(-12, -30, 44, -Math.PI * 0.55, Math.PI * 0.55); ctx.stroke();
                    ctx.strokeStyle = "#ddd"; ctx.lineWidth = 1.5;
                    ctx.beginPath(); ctx.moveTo(-12, -74); ctx.lineTo(-12, 14); ctx.stroke();
                    // Arrow nocked
                    ctx.strokeStyle = "#c8a060"; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(-12, -20); ctx.lineTo(20, -20); ctx.stroke();
                    ctx.fillStyle = "#ccc";
                    ctx.beginPath(); ctx.moveTo(20,-20); ctx.lineTo(14,-24); ctx.lineTo(14,-16); ctx.closePath(); ctx.fill();
                    break;
                case "whip":
                    ctx.strokeStyle = "#7a4010"; ctx.lineWidth = 4; ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(0, 0);
                    ctx.bezierCurveTo(25, -15, -10, -40, 30, -65);
                    ctx.stroke();
                    // Handle wrap
                    ctx.strokeStyle = "#4a2008"; ctx.lineWidth = 6;
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18); ctx.stroke();
                    break;
                case "orb":
                    // Central focus crystal held up
                    ctx.fillStyle = p.armor;
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -30); ctx.stroke();
                    ctx.fillStyle = p.accent;
                    ctx.shadowBlur = 20; ctx.shadowColor = p.accent;
                    // Faceted gem shape
                    ctx.beginPath();
                    ctx.moveTo(0, -50);
                    ctx.lineTo(12, -35);
                    ctx.lineTo(8, -20);
                    ctx.lineTo(-8, -20);
                    ctx.lineTo(-12, -35);
                    ctx.closePath(); ctx.fill();
                    ctx.fillStyle = "rgba(255,255,255,0.5)";
                    ctx.beginPath();
                    ctx.moveTo(0, -48); ctx.lineTo(8, -36); ctx.lineTo(0, -36);
                    ctx.closePath(); ctx.fill();
                    ctx.shadowBlur = 0;
                    break;
            }
            ctx.restore();
        }

        ctx.restore(); // end scale/translate

        // Battle UI overlay
        if (showUI) {
            const barY = this.topOfHeadY - 20;
            ctx.font      = this.isPlayer ? "bold 16px sans-serif" : "12px sans-serif";
            ctx.fillStyle = this.isPlayer ? "#ffd700" : "#ffffff";
            ctx.textAlign = "center";
            ctx.fillText(this.isPlayer ? "YOU" : this.name, this.x, barY - 15);

            ctx.fillStyle = "rgba(0,0,0,0.5)";
            ctx.fillRect(this.x - 30, barY, 60, 6);
            ctx.fillStyle = this.isPlayer ? "#00ffff" : "#0f0";
            ctx.fillRect(this.x - 30, barY, (this.hp / 100) * 60, 6);
        }
    }
}
