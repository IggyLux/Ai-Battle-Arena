export class Arena {
    constructor() {
        this.bullets = [];
    }

    update(bots, width, height) {
        // AI & Movement
        bots.forEach(b => {
            if (b.hp <= 0) return;
            let target = null, minDist = 999999;
            bots.forEach(other => {
                if (other !== b && other.hp > 0) {
                    let d = Math.hypot(other.x - b.x, other.y - b.y);
                    if (d < minDist) { minDist = d; target = other; }
                }
            });

            if (target) {
                b.angle = Math.atan2(target.y - b.y, target.x - b.x);
                if (minDist > 65) {
                    b.x += Math.cos(b.angle) * 1.5;
                    b.y += Math.sin(b.angle) * 1.5;
                }
                if (!(b.cooldown > 0)) {
                    this.bullets.push({
                        x: b.x, y: b.y - 30,
                        vx: Math.cos(b.angle) * 8,
                        vy: Math.sin(b.angle) * 8,
                        owner: b,
                        weapon: b.weapon,
                        accent: b.palette.accent,
                        age: 0
                    });
                    b.cooldown = 50;
                }
            }
            if (b.cooldown > 0) b.cooldown--;

            // Boundary checks
            b.x = Math.max(60, Math.min(width - 60, b.x));
            b.y = Math.max(100, Math.min(height - 40, b.y));
        });

        // Bullet Physics
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            let blt = this.bullets[i];
            blt.x += blt.vx;
            blt.y += blt.vy;
            blt.age++;
            let hit = false;
            for (let b of bots) {
                if (b !== blt.owner && b.hp > 0 && Math.hypot(b.x - blt.x, (b.y - 30) - blt.y) < 25) {
                    b.hp -= 20;
                    hit = true;
                    break;
                }
            }
            if (hit || blt.x < 0 || blt.x > width || blt.y < 0 || blt.y > height) {
                this.bullets.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        this.bullets.forEach(blt => {
            ctx.save();
            ctx.translate(blt.x, blt.y);

            const angle = Math.atan2(blt.vy, blt.vx);

            switch (blt.weapon) {

                case "sword":
                case "axe":
                case "spear": {
                    // A fast-moving slash / shard — white elongated line
                    ctx.rotate(angle);
                    ctx.strokeStyle = "#ffffff";
                    ctx.lineWidth = 3;
                    ctx.lineCap = "round";
                    ctx.shadowBlur = 6;
                    ctx.shadowColor = "#aaaaff";
                    ctx.beginPath();
                    ctx.moveTo(-10, 0);
                    ctx.lineTo(10, 0);
                    ctx.stroke();
                    break;
                }

                case "staff":
                case "orb": {
                    // Glowing magic orb in the unit's accent color
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = blt.accent;
                    ctx.fillStyle = blt.accent;
                    ctx.beginPath();
                    ctx.arc(0, 0, 6, 0, Math.PI * 2);
                    ctx.fill();
                    // Inner white core
                    ctx.fillStyle = "#ffffff";
                    ctx.beginPath();
                    ctx.arc(0, 0, 2, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                }

                case "bow": {
                    // Arrow — thin line with arrowhead
                    ctx.rotate(angle);
                    ctx.strokeStyle = "#c8a060";
                    ctx.lineWidth = 2;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(-8, 0);
                    ctx.lineTo(8, 0);
                    ctx.stroke();
                    ctx.fillStyle = "#cccccc";
                    ctx.beginPath();
                    ctx.moveTo(8, 0);
                    ctx.lineTo(4, -3);
                    ctx.lineTo(4, 3);
                    ctx.closePath();
                    ctx.fill();
                    break;
                }

                case "claws": {
                    // Quick scratch — three short diagonal lines
                    ctx.strokeStyle = blt.accent;
                    ctx.lineWidth = 2;
                    ctx.lineCap = "round";
                    ctx.shadowBlur = 4;
                    ctx.shadowColor = blt.accent;
                    for (let i = -4; i <= 4; i += 4) {
                        ctx.beginPath();
                        ctx.moveTo(i - 4, -5);
                        ctx.lineTo(i + 4,  5);
                        ctx.stroke();
                    }
                    break;
                }

                case "whip": {
                    // Curved lash in brown/tan
                    ctx.rotate(angle);
                    ctx.strokeStyle = "#a0622a";
                    ctx.lineWidth = 2;
                    ctx.lineCap = "round";
                    ctx.beginPath();
                    ctx.moveTo(-8, 0);
                    ctx.quadraticCurveTo(0, -6, 8, 0);
                    ctx.stroke();
                    break;
                }

                default: {
                    // Fallback yellow square (original)
                    ctx.fillStyle = "yellow";
                    ctx.fillRect(-2, -2, 4, 4);
                    break;
                }
            }

            ctx.restore();
        });
    }
}
