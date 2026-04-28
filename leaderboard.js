// ═══════════════════════════════════════════════════════
// leaderboard.js — Persistent stat tracking across sessions
// Stores per-name stats in localStorage so they survive
// browser closes. Ranked by kills, then damage as tiebreaker.
// ═══════════════════════════════════════════════════════

const STORAGE_KEY = "arenaLeaderboard_v1";

export class Leaderboard {
    constructor() {
        this.data = this._load();
    }

    // ── Persistence ──────────────────────────────────────

    _load() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch {
            return {};
        }
    }

    _save() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
        } catch {
            // Storage full or unavailable — fail silently
        }
    }

    // ── Record a kill ────────────────────────────────────
    // killer = Unit that landed the killing blow
    // victim = Unit that died

    recordKill(killer, victim) {
        if (!killer || !killer.name) return;
        this._ensureEntry(killer);
        this.data[killer.name].kills++;
        this.data[killer.name].seed = killer.seed;
        this.data[killer.name].isPlayer = killer.isPlayer || false;
        this._save();
    }

    // ── Record damage dealt ──────────────────────────────
    // attacker = Unit dealing damage, amount = hp lost

    recordDamage(attacker, amount) {
        if (!attacker || !attacker.name || amount <= 0) return;
        this._ensureEntry(attacker);
        this.data[attacker.name].damage += Math.round(amount);
        this.data[attacker.name].seed = attacker.seed;
        this.data[attacker.name].isPlayer = attacker.isPlayer || false;
        this._save();
    }

    // ── Record a death ───────────────────────────────────

    recordDeath(unit) {
        if (!unit || !unit.name) return;
        this._ensureEntry(unit);
        this.data[unit.name].deaths++;
        this.data[unit.name].seed = unit.seed;
        this.data[unit.name].isPlayer = unit.isPlayer || false;
        this._save();
    }

    // ── Record a session appearance ──────────────────────

    recordAppearance(unit) {
        if (!unit || !unit.name) return;
        this._ensureEntry(unit);
        this.data[unit.name].appearances++;
        this.data[unit.name].seed = unit.seed;
        this.data[unit.name].isPlayer = unit.isPlayer || false;
        this._save();
    }

    _ensureEntry(unit) {
        if (!this.data[unit.name]) {
            this.data[unit.name] = {
                kills: 0,
                deaths: 0,
                damage: 0,
                appearances: 0,
                seed: unit.seed || 0,
                isPlayer: unit.isPlayer || false,
            };
        }
    }

    // ── Get sorted rankings ──────────────────────────────
    // Returns array of { name, ...stats } sorted by kills desc, damage desc

    getRankings() {
        return Object.entries(this.data)
            .map(([name, stats]) => ({ name, ...stats }))
            .sort((a, b) => {
                if (b.kills !== a.kills) return b.kills - a.kills;
                return b.damage - a.damage;
            });
    }

    // ── Clear all data ───────────────────────────────────

    clear() {
        this.data = {};
        try { localStorage.removeItem(STORAGE_KEY); } catch {}
    }

    // ── Render into the leaderboard panel DOM ────────────

    render(containerEl) {
        const rankings = this.getRankings();
        containerEl.innerHTML = "";

        if (rankings.length === 0) {
            containerEl.innerHTML = `<div class="lb-empty">No battles fought yet.<br>Get in there.</div>`;
            return;
        }

        rankings.forEach((entry, index) => {
            const rank = index + 1;
            const isTop3 = rank <= 3;
            const medalColors = ["#ffd700", "#c0c0c0", "#cd7f32"];
            const rankColor = isTop3 ? medalColors[rank - 1] : "#888";

            const kdRatio = entry.deaths > 0
                ? (entry.kills / entry.deaths).toFixed(2)
                : entry.kills > 0 ? "∞" : "0.00";

            const row = document.createElement("div");
            row.className = "lb-row" + (entry.isPlayer ? " lb-row-player" : "");
            row.innerHTML = `
                <div class="lb-rank" style="color:${rankColor}">${rank}</div>
                <div class="lb-info">
                    <div class="lb-name" style="color:${entry.isPlayer ? '#ffd700' : '#eee'}">
                        ${entry.isPlayer ? '★ ' : ''}${escapeHtml(entry.name)}
                    </div>
                    <div class="lb-seed">SEED: ${entry.seed}</div>
                    <div class="lb-stats">
                        <span class="lb-stat kills">⚔ ${entry.kills} kills</span>
                        <span class="lb-stat damage">💥 ${entry.damage} dmg</span>
                        <span class="lb-stat deaths">💀 ${entry.deaths} deaths</span>
                        <span class="lb-stat kd">K/D ${kdRatio}</span>
                        <span class="lb-stat appearances">🗡 ${entry.appearances} battles</span>
                    </div>
                </div>
            `;
            containerEl.appendChild(row);
        });
    }
}

function escapeHtml(str) {
    return String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;");
}
