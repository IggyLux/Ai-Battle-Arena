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
                if (b.cooldown <= 0 || !b.cooldown) {
                    this.bullets.push({
                        x: b.x, y: b.y - 30,
                        vx: Math.cos(b.angle) * 8, vy: Math.sin(b.angle) * 8,
                        owner: b
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
            blt.x += blt.vx; blt.y += blt.vy;
            let hit = false;
            for (let b of bots) {
                if (b !== blt.owner && b.hp > 0 && Math.hypot(b.x - blt.x, (b.y - 30) - blt.y) < 25) {
                    b.hp -= 20; hit = true; break;
                }
            }
            if (hit || blt.x < 0 || blt.x > width || blt.y < 0 || blt.y > height) {
                this.bullets.splice(i, 1);
            }
        }
    }

    draw(ctx) {
        ctx.fillStyle = "yellow";
        this.bullets.forEach(blt => ctx.fillRect(blt.x, blt.y, 4, 4));
    }
}