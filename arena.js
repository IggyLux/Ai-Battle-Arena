export class Arena {
    constructor() {
        this.projectiles = [];
        this.swings      = [];
        this.whips       = [];
        this.scratches   = [];
    }

    // Clear all active effects — called on battle start
    reset() {
        this.projectiles = [];
        this.swings      = [];
        this.whips       = [];
        this.scratches   = [];
    }

    // ─────────────────────────────────────────
    // Weapon category lookup
    // ─────────────────────────────────────────
    getWeaponType(weapon) {
        if (["sword", "axe", "claws"].includes(weapon)) return "melee";
        if (["bow", "spear"].includes(weapon))           return "projectile";
        if (weapon === "staff")                          return "magic";
        if (weapon === "orb")                            return "orb";
        if (weapon === "whip")                           return "whip";
        return "projectile";
    }

    // ─────────────────────────────────────────
    // Damage helper — records attacker for kill credit
    // and logs damage to leaderboard if provided
    // ─────────────────────────────────────────
    _dealDamage(target, amount, attacker, lb) {
        if (target.hp <= 0) return;
        const prev = target.hp;
        target.hp -= amount;
        const dealt = prev - Math.max(0, target.hp);
        if (dealt > 0) {
            target.lastHitBy = attacker;
            if (lb) lb.recordDamage(attacker, dealt);
        }
    }

    // ─────────────────────────────────────────
    // Main update
    // ─────────────────────────────────────────
    update(bots, width, height, time, lb) {
        bots.forEach(b => {
            if (b.hp <= 0) return;

            // Find nearest living target
            let target = null, minDist = 999999;
            bots.forEach(other => {
                if (other !== b && other.hp > 0) {
                    const d = Math.hypot(other.x - b.x, other.y - b.y);
                    if (d < minDist) { minDist = d; target = other; }
                }
            });
            if (!target) return;

            b.angle = Math.atan2(target.y - b.y, target.x - b.x);
            const type = this.getWeaponType(b.weapon);

            // ── Movement ──
            const preferredRange = (type === "melee" || type === "whip" || type === "orb") ? 65 : 200;
            if (minDist > preferredRange) {
                b.x += Math.cos(b.angle) * 1.5;
                b.y += Math.sin(b.angle) * 1.5;
            } else if (type !== "melee" && type !== "whip" && type !== "orb" && minDist < 120) {
                b.x -= Math.cos(b.angle) * 1.0;
                b.y -= Math.sin(b.angle) * 1.0;
            }

            // ── Attack dispatch ──
            if (!(b.cooldown > 0)) {
                switch (type) {
                    case "melee":      this.doMelee(b, target, minDist);  break;
                    case "projectile": this.doProjectile(b, target);       break;
                    case "magic":      this.doMagic(b, target);            break;
                    case "whip":       this.doWhip(b, target, minDist);    break;
                    case "orb": /* handled in updateOrbs */                break;
                }
            }
            if (b.cooldown > 0) b.cooldown--;

            // Tick orb iframe cooldown
            if (b.orbIframe > 0) b.orbIframe--;

            // Boundary clamp
            b.x = Math.max(60, Math.min(width - 60, b.x));
            b.y = Math.max(100, Math.min(height - 40, b.y));
        });

        this.updateProjectiles(bots, width, height, lb);
        this.updateSwings(bots, lb);
        this.updateWhips(bots, lb);
        this.updateOrbs(bots, time, lb);
        this.updateScratches();
    }

    // ─────────────────────────────────────────
    // Attack creators
    // ─────────────────────────────────────────

    doMelee(b, target, dist) {
        if (dist > 85) return;
        this.swings.push({
            x: b.x, y: b.y,
            angle: b.angle,
            weapon: b.weapon,
            accent: b.palette.accent,
            owner: b,
            life: 0,
            maxLife: b.weapon === "axe" ? 22 : 14,
            hit: false
        });
        b.cooldown = b.weapon === "axe" ? 60 : b.weapon === "claws" ? 22 : 32;
    }

    doProjectile(b, target) {
        const isSpear = b.weapon === "spear";
        this.projectiles.push({
            x: b.x, y: b.y - 30,
            vx: Math.cos(b.angle) * (isSpear ? 5 : 10),
            vy: Math.sin(b.angle) * (isSpear ? 5 : 10),
            weapon: b.weapon,
            accent: b.palette.accent,
            owner: b,
            damage: isSpear ? 40 : 20,
            age: 0
        });
        b.cooldown = isSpear ? 95 : 40;
    }

    doMagic(b, target) {
        this.projectiles.push({
            x: b.x, y: b.y - 30,
            vx: Math.cos(b.angle) * 3,
            vy: Math.sin(b.angle) * 3,
            weapon: "staff",
            accent: b.palette.accent,
            owner: b,
            target: target,
            damage: 20,
            seeking: true,
            seekStrength: 0.055,
            age: 0
        });
        b.cooldown = 70;
    }

    doWhip(b, target, dist) {
        if (dist > 145) return;
        this.whips.push({
            x: b.x, y: b.y - 30,
            angle: b.angle,
            owner: b,
            target: target,
            life: 0,
            maxLife: 20,
            hit: false,
            accent: b.palette.accent
        });
        b.cooldown = 48;
    }

    // ─────────────────────────────────────────
    // Per-frame updaters
    // ─────────────────────────────────────────

    updateProjectiles(bots, width, height, lb) {
        for (let i = this.projectiles.length - 1; i >= 0; i--) {
            const p = this.projectiles[i];
            p.age++;

            if (p.seeking && p.target && p.target.hp > 0) {
                const tx = p.target.x - p.x;
                const ty = (p.target.y - 30) - p.y;
                const tlen = Math.hypot(tx, ty) || 1;
                p.vx += (tx / tlen) * p.seekStrength;
                p.vy += (ty / tlen) * p.seekStrength;
                const spd = Math.hypot(p.vx, p.vy);
                if (spd > 4) { p.vx = (p.vx / spd) * 4; p.vy = (p.vy / spd) * 4; }
            }

            p.x += p.vx;
            p.y += p.vy;

            let hit = false;
            for (const b of bots) {
                if (b !== p.owner && b.hp > 0 && Math.hypot(b.x - p.x, (b.y - 30) - p.y) < 25) {
                    this._dealDamage(b, p.damage, p.owner, lb);
                    hit = true;
                    break;
                }
            }

            const maxAge = p.weapon === "spear" ? 130 : 220;
            if (hit || p.age > maxAge || p.x < 0 || p.x > width || p.y < 0 || p.y > height) {
                this.projectiles.splice(i, 1);
            }
        }
    }

    updateSwings(bots, lb) {
        for (let i = this.swings.length - 1; i >= 0; i--) {
            const s = this.swings[i];
            s.life++;

            if (!s.hit && s.life === Math.floor(s.maxLife * 0.5)) {
                const reach  = s.weapon === "axe" ? 78 : s.weapon === "claws" ? 58 : 68;
                const damage = s.weapon === "axe" ? 35 : s.weapon === "claws" ? 15 : 25;
                for (const b of bots) {
                    if (b !== s.owner && b.hp > 0) {
                        const d = Math.hypot(b.x - s.x, (b.y - 20) - s.y);
                        if (d < reach) {
                            this._dealDamage(b, damage, s.owner, lb);
                            s.hit = true;
                            if (s.weapon === "claws") {
                                this.scratches.push({
                                    x: b.x + (Math.random() * 16 - 8),
                                    y: b.y - 40 + (Math.random() * 16 - 8),
                                    angle: s.angle,
                                    accent: s.accent,
                                    life: 0,
                                    maxLife: 90
                                });
                            }
                            break;
                        }
                    }
                }
            }

            if (s.life >= s.maxLife) this.swings.splice(i, 1);
        }
    }

    updateWhips(bots, lb) {
        for (let i = this.whips.length - 1; i >= 0; i--) {
            const w = this.whips[i];
            w.life++;

            if (!w.hit && w.life === Math.floor(w.maxLife * 0.6)) {
                for (const b of bots) {
                    if (b !== w.owner && b.hp > 0) {
                        const d = Math.hypot(b.x - w.x, (b.y - 30) - w.y);
                        if (d < 135) {
                            this._dealDamage(b, 20, w.owner, lb);
                            w.hit = true;
                            break;
                        }
                    }
                }
            }

            if (w.life >= w.maxLife) this.whips.splice(i, 1);
        }
    }

    updateOrbs(bots, time, lb) {
        // ── Orb stalemate fix ──────────────────────────────────
        // Problem: two orb users standing close deal simultaneous damage
        // each frame, perfectly cancelling each other out forever.
        //
        // Fix: each unit has an orbIframe counter. After taking orb
        // damage, they are immune for 30 frames. This means one unit's
        // orbs land first and kill the other before the stalemate locks.
        // The unit that happens to take the first hit will lose — which
        // is determined by array order, making it feel random enough.
        // ──────────────────────────────────────────────────────

        bots.forEach(orbUnit => {
            if (orbUnit.hp <= 0 || orbUnit.weapon !== "orb") return;
            const count = 3;

            for (let i = 0; i < count; i++) {
                const orbAngle = time * 2 + (i / count) * Math.PI * 2;
                const radius   = 55;
                const ox = orbUnit.x + Math.cos(orbAngle) * radius;
                const oy = (orbUnit.y - 30) + Math.sin(orbAngle) * radius * 0.5;

                bots.forEach(b => {
                    if (b === orbUnit || b.hp <= 0) return;
                    // Skip if target is in orb iframe window
                    if (b.orbIframe > 0) return;
                    if (Math.hypot(b.x - ox, (b.y - 30) - oy) < 18) {
                        this._dealDamage(b, 8, orbUnit, lb); // Single hit, not per-frame tick
                        b.orbIframe = 30; // 30-frame immunity after orb hit (~0.5s at 60fps)
                    }
                });
            }
        });
    }

    updateScratches() {
        for (let i = this.scratches.length - 1; i >= 0; i--) {
            this.scratches[i].life++;
            if (this.scratches[i].life >= this.scratches[i].maxLife) {
                this.scratches.splice(i, 1);
            }
        }
    }

    // ─────────────────────────────────────────
    // Draw
    // ─────────────────────────────────────────
    draw(ctx, bots, time) {
        this.drawScratches(ctx);
        this.drawProjectiles(ctx);
        this.drawSwings(ctx);
        this.drawWhips(ctx);
        this.drawOrbs(ctx, bots, time);
    }

    drawProjectiles(ctx) {
        this.projectiles.forEach(p => {
            ctx.save();
            ctx.translate(p.x, p.y);
            const angle = Math.atan2(p.vy, p.vx);

            if (p.weapon === "bow") {
                ctx.rotate(angle);
                ctx.strokeStyle = "#c8a060"; ctx.lineWidth = 2; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(-10, 0); ctx.lineTo(10, 0); ctx.stroke();
                ctx.fillStyle = "#cccccc";
                ctx.beginPath(); ctx.moveTo(10,0); ctx.lineTo(5,-3); ctx.lineTo(5,3); ctx.closePath(); ctx.fill();
                ctx.strokeStyle = "#884422"; ctx.lineWidth = 1;
                ctx.beginPath(); ctx.moveTo(-10,0); ctx.lineTo(-15,-4); ctx.moveTo(-10,0); ctx.lineTo(-15,4); ctx.stroke();

            } else if (p.weapon === "spear") {
                ctx.rotate(angle);
                ctx.strokeStyle = "#aaaaaa"; ctx.lineWidth = 3; ctx.lineCap = "round";
                ctx.beginPath(); ctx.moveTo(-20,0); ctx.lineTo(14,0); ctx.stroke();
                ctx.fillStyle = "#dddddd";
                ctx.beginPath(); ctx.moveTo(14,0); ctx.lineTo(8,-5); ctx.lineTo(8,5); ctx.closePath(); ctx.fill();

            } else if (p.weapon === "staff") {
                const pulse = 0.7 + Math.sin(p.age * 0.5) * 0.3;
                ctx.shadowBlur = 22; ctx.shadowColor = p.accent;
                ctx.fillStyle = p.accent; ctx.globalAlpha = pulse;
                ctx.beginPath(); ctx.arc(0, 0, 7, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
                ctx.beginPath(); ctx.arc(0, 0, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 0.25; ctx.fillStyle = p.accent;
                ctx.beginPath(); ctx.arc(-p.vx * 2, -p.vy * 2, 5, 0, Math.PI * 2); ctx.fill();
                ctx.globalAlpha = 1.0;
            }

            ctx.restore();
        });
    }

    drawSwings(ctx) {
        this.swings.forEach(s => {
            const t = s.life / s.maxLife;
            ctx.save();
            ctx.translate(s.x, s.y - 20);
            ctx.rotate(s.angle);

            if (s.weapon === "sword") {
                const sweepAngle = (t - 0.5) * (Math.PI * 0.9);
                ctx.rotate(sweepAngle);
                ctx.strokeStyle = `rgba(200,220,255,${1 - t})`; ctx.lineWidth = 4; ctx.lineCap = "round";
                ctx.shadowBlur = 10; ctx.shadowColor = "#aaaaff";
                ctx.beginPath(); ctx.moveTo(8, 0); ctx.lineTo(65, 0); ctx.stroke();
                ctx.strokeStyle = `rgba(255,255,255,${0.7 - t})`; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(18, -2); ctx.lineTo(62, -2); ctx.stroke();

            } else if (s.weapon === "axe") {
                const chopAngle = (t - 0.25) * Math.PI * 1.2;
                ctx.rotate(chopAngle - Math.PI * 0.5);
                ctx.fillStyle = `rgba(170,160,140,${1 - t})`; ctx.shadowBlur = 8; ctx.shadowColor = "#999";
                ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(58,-22); ctx.lineTo(58,22); ctx.closePath(); ctx.fill();

            } else if (s.weapon === "claws") {
                ctx.strokeStyle = `rgba(255,160,60,${1 - t})`; ctx.lineWidth = 2.5; ctx.lineCap = "round";
                ctx.shadowBlur = 6; ctx.shadowColor = s.accent;
                for (let i = -1; i <= 1; i++) {
                    ctx.save(); ctx.rotate(i * 0.25);
                    ctx.beginPath(); ctx.moveTo(12, 0); ctx.lineTo(55, 0); ctx.stroke();
                    ctx.restore();
                }
            }

            ctx.restore();
        });
    }

    drawWhips(ctx) {
        this.whips.forEach(w => {
            const t   = w.life / w.maxLife;
            const ext = t < 0.6 ? t / 0.6 : 1 - ((t - 0.6) / 0.4);
            const tipDist = ext * 125;
            const tipX = w.x + Math.cos(w.angle) * tipDist;
            const tipY = w.y + Math.sin(w.angle) * tipDist;
            const midX = w.x + Math.cos(w.angle) * tipDist * 0.5;
            const midY = w.y + Math.sin(w.angle) * tipDist * 0.5 + 20 * ext;

            ctx.save();
            ctx.strokeStyle = `rgba(150,80,20,${0.9 - t * 0.3})`; ctx.lineWidth = 3; ctx.lineCap = "round";
            ctx.shadowBlur = 5; ctx.shadowColor = w.accent;
            ctx.beginPath(); ctx.moveTo(w.x, w.y); ctx.quadraticCurveTo(midX, midY, tipX, tipY); ctx.stroke();

            if (t > 0.5 && t < 0.7) {
                const flashAlpha = (0.7 - t) * 5;
                ctx.fillStyle = `rgba(255,255,200,${flashAlpha})`;
                ctx.shadowBlur = 18; ctx.shadowColor = "#ffffff";
                ctx.beginPath(); ctx.arc(tipX, tipY, 5, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        });
    }

    drawOrbs(ctx, bots, time) {
        bots.forEach(orbUnit => {
            if (orbUnit.hp <= 0 || orbUnit.weapon !== "orb") return;
            const count = 3;
            for (let i = 0; i < count; i++) {
                const orbAngle = time * 2 + (i / count) * Math.PI * 2;
                const radius   = 55;
                const ox = orbUnit.x + Math.cos(orbAngle) * radius;
                const oy = (orbUnit.y - 30) + Math.sin(orbAngle) * radius * 0.5;

                ctx.save();
                ctx.shadowBlur = 18; ctx.shadowColor = orbUnit.palette.accent;
                ctx.fillStyle = orbUnit.palette.accent; ctx.globalAlpha = 0.85;
                ctx.beginPath(); ctx.arc(ox, oy, 8, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = "#ffffff"; ctx.globalAlpha = 1.0; ctx.shadowBlur = 0;
                ctx.beginPath(); ctx.arc(ox, oy, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        });
    }

    drawScratches(ctx) {
        this.scratches.forEach(s => {
            const alpha = 1 - (s.life / s.maxLife);
            ctx.save();
            ctx.translate(s.x, s.y); ctx.rotate(s.angle);
            ctx.strokeStyle = `rgba(255,60,60,${alpha})`; ctx.lineWidth = 2; ctx.lineCap = "round";
            for (let i = -1; i <= 1; i++) {
                ctx.save(); ctx.rotate(i * 0.18);
                ctx.beginPath(); ctx.moveTo(-13, i * 5); ctx.lineTo(13, i * 5); ctx.stroke();
                ctx.restore();
            }
            ctx.restore();
        });
    }
}
