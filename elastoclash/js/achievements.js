// js/achievements.js

// Achievement kategorier og tiers
const CATEGORIES = {
    PROGRESSION: 'progression',
    PERFORMANCE: 'performance',
    SKILLS: 'skills',
    COLLECTION: 'collection',
    SECRETS: 'secrets'
};

const TIERS = {
    BRONZE: { name: 'Bronze', color: '#CD7F32', multiplier: 1 },
    SILVER: { name: 'Sølv', color: '#C0C0C0', multiplier: 2 },
    GOLD: { name: 'Guld', color: '#FFD700', multiplier: 3 },
    PLATINUM: { name: 'Platin', color: '#E5E4E2', multiplier: 4 }
};

// Achievement belønninger
const REWARDS = {
    BIKE_SKIN: 'bike_skin',
    TRAIL_EFFECT: 'trail_effect',
    PARTICLE_EFFECT: 'particle_effect',
    TERRAIN_THEME: 'terrain_theme'
};

// Achievements definition med mere detaljerede egenskaber
const ACHIEVEMENTS = [
    // Progression Achievement Chain
    {
        id: "victory_bronze",
        title: "Sejrherren",
        description: "Vind dit første spil.",
        category: CATEGORIES.PROGRESSION,
        icon: "🏆",
        points: 10,
        unlocked: false,
        secret: false,
        tier: TIERS.BRONZE,
        chain: 'victory',
        chainOrder: 1,
        reward: {
            type: REWARDS.BIKE_SKIN,
            item: 'bronze_bike'
        }
    },
    {
        id: "victory_silver",
        title: "Sejrsmester",
        description: "Vind 10 spil.",
        category: CATEGORIES.PROGRESSION,
        icon: "🏆",
        points: 25,
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        secret: false,
        tier: TIERS.SILVER,
        chain: 'victory',
        chainOrder: 2,
        requires: ["victory_bronze"],
        reward: {
            type: REWARDS.TRAIL_EFFECT,
            item: 'silver_trail'
        }
    },
    {
        id: "victory_gold",
        title: "Sejrslegende",
        description: "Vind 50 spil.",
        category: CATEGORIES.PROGRESSION,
        icon: "🏆",
        points: 50,
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        secret: false,
        tier: TIERS.GOLD,
        chain: 'victory',
        chainOrder: 3,
        requires: ["victory_silver"],
        reward: {
            type: REWARDS.BIKE_SKIN,
            item: 'golden_bike'
        }
    },
    // Speed Achievement Chain
    {
        id: "speed_bronze",
        title: "Hurtigløber",
        description: "Gennemfør en bane under 45 sekunder.",
        category: CATEGORIES.PERFORMANCE,
        icon: "⚡",
        points: 15,
        unlocked: false,
        tier: TIERS.BRONZE,
        chain: 'speed',
        chainOrder: 1,
        reward: {
            type: REWARDS.TRAIL_EFFECT,
            item: 'speed_trail'
        }
    },
    {
        id: "speed_silver",
        title: "Fartkonge",
        description: "Gennemfør en bane under 30 sekunder.",
        category: CATEGORIES.PERFORMANCE,
        icon: "⚡",
        points: 30,
        unlocked: false,
        tier: TIERS.SILVER,
        chain: 'speed',
        chainOrder: 2,
        requires: ["speed_bronze"],
        reward: {
            type: REWARDS.PARTICLE_EFFECT,
            item: 'speed_particles'
        }
    },
    {
        id: "speed_gold",
        title: "Lysets Hastighed",
        description: "Gennemfør en bane under 20 sekunder.",
        category: CATEGORIES.PERFORMANCE,
        icon: "⚡",
        points: 50,
        unlocked: false,
        tier: TIERS.GOLD,
        chain: 'speed',
        chainOrder: 3,
        requires: ["speed_silver"],
        reward: {
            type: REWARDS.TERRAIN_THEME,
            item: 'neon_theme'
        }
    },
    // Skill Achievement Chain
    {
        id: "speed_runner",
        title: "Speed Runner",
        description: "Gennemfør en bane under 30 sekunder.",
        category: CATEGORIES.PERFORMANCE,
        icon: "⚡",
        points: 25,
        unlocked: false,
        secret: false
    },
    {
        id: "perfect_run",
        title: "Perfekt Kørsel",
        description: "Gennemfør en bane uden at styrte.",
        category: CATEGORIES.PERFORMANCE,
        icon: "✨",
        points: 30,
        unlocked: false,
        secret: false
    },
    // Skill Achievements
    {
        id: "air_time",
        title: "Luftakrobat",
        description: "Vær i luften i samlet 1 minut.",
        category: CATEGORIES.SKILLS,
        icon: "🦅",
        points: 20,
        unlocked: false,
        progress: 0,
        maxProgress: 60000, // 60 sekunder i millisekunder
        secret: false
    },
    {
        id: "speed_demon",
        title: "Fartdjævel",
        description: "Nå topfart 10 gange.",
        category: CATEGORIES.SKILLS,
        icon: "🏎️",
        points: 15,
        unlocked: false,
        progress: 0,
        maxProgress: 10,
        secret: false
    },
    // Collection Achievements
    {
        id: "coin_collector",
        title: "Møntsamler",
        description: "Saml 100 mønter i alt.",
        category: CATEGORIES.COLLECTION,
        icon: "💰",
        points: 40,
        unlocked: false,
        progress: 0,
        maxProgress: 100,
        secret: false
    },
    {
        id: "checkpoint_master",
        title: "Checkpoint Mester",
        description: "Nå 50 checkpoints i alt.",
        category: CATEGORIES.COLLECTION,
        icon: "🚩",
        points: 35,
        unlocked: false,
        progress: 0,
        maxProgress: 50,
        secret: false
    },
    // Secret Achievements
    {
        id: "ghostbuster",
        title: "Ghostbuster",
        description: "Slå en ghost-rekord.",
        category: CATEGORIES.SECRETS,
        icon: "👻",
        points: 50,
        unlocked: false,
        secret: true
    },
    {
        id: "rainbow_rider",
        title: "Regnbuerytter",
        description: "???",
        category: CATEGORIES.SECRETS,
        icon: "🌈",
        points: 45,
        unlocked: false,
        secret: true,
        hint: "Prøv at køre på alle terræn-typer i én bane"
    }
];

// Achievement stats tracking
let stats = {
    totalPoints: 0,
    unlockedCount: 0,
    categoryProgress: Object.fromEntries(
        Object.values(CATEGORIES).map(cat => [cat, { total: 0, unlocked: 0 }])
    )
};

export function loadAchievements() {
    const saved = localStorage.getItem("achievements");
    if (saved) {
        const savedData = JSON.parse(saved);
        ACHIEVEMENTS.forEach((ach) => {
            const savedAch = savedData[ach.id];
            if (savedAch) {
                ach.unlocked = savedAch.unlocked;
                ach.progress = savedAch.progress || 0;
            }
        });
    }
    calculateStats();
}

export function unlockAchievement(id) {
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (!achievement || achievement.unlocked) return;

    // Tjek om alle krævede achievements er låst op
    if (achievement.requires) {
        const allRequirementsMet = achievement.requires.every(reqId => 
            ACHIEVEMENTS.find(a => a.id === reqId)?.unlocked
        );
        if (!allRequirementsMet) return;
    }

    // Lås achievement op
    achievement.unlocked = true;
    achievement.progress = achievement.maxProgress || 0;
    
    // Beregn point med tier multiplier
    const points = achievement.tier ? 
        achievement.points * achievement.tier.multiplier : 
        achievement.points;

    // Gem og vis popup
    saveAchievements();
    showAchievementPopup(achievement, points);
    calculateStats();

    // Håndter reward
    if (achievement.reward) {
        handleReward(achievement.reward);
    }

    // Tjek for chain completion
    if (achievement.chain) {
        const chainAchievements = ACHIEVEMENTS.filter(a => a.chain === achievement.chain);
        const allUnlocked = chainAchievements.every(a => a.unlocked);
        
        if (allUnlocked) {
            // Vis chain completion popup
            showChainCompletionPopup(achievement.chain, chainAchievements);
        }
    }
}

export function updateProgress(id, progress) {
    const achievement = ACHIEVEMENTS.find((a) => a.id === id);
    if (achievement && !achievement.unlocked) {
        achievement.progress = Math.min(progress, achievement.maxProgress || 0);
        
        // Tjek om achievement skal låses op baseret på progress
        if (achievement.maxProgress && achievement.progress >= achievement.maxProgress) {
            unlockAchievement(id);
        } else {
            saveAchievements();
        }
    }
}

function calculateStats() {
    stats.totalPoints = 0;
    stats.unlockedCount = 0;
    
    // Nulstil kategori progress
    Object.values(CATEGORIES).forEach(cat => {
        stats.categoryProgress[cat] = { total: 0, unlocked: 0 };
    });
    
    // Beregn ny statistik
    ACHIEVEMENTS.forEach(ach => {
        const catStats = stats.categoryProgress[ach.category];
        catStats.total++;
        
        if (ach.unlocked) {
            stats.totalPoints += ach.points;
            stats.unlockedCount++;
            catStats.unlocked++;
        }
    });
}

function saveAchievements() {
    const saveData = {};
    ACHIEVEMENTS.forEach(ach => {
        saveData[ach.id] = {
            unlocked: ach.unlocked,
            progress: ach.progress || 0
        };
    });
    localStorage.setItem("achievements", JSON.stringify(saveData));
}

function handleReward(reward) {
    // Gem belønningen i localStorage
    const savedRewards = JSON.parse(localStorage.getItem('rewards') || '{}');
    if (!savedRewards[reward.type]) savedRewards[reward.type] = [];
    if (!savedRewards[reward.type].includes(reward.item)) {
        savedRewards[reward.type].push(reward.item);
        localStorage.setItem('rewards', JSON.stringify(savedRewards));
    }
    
    // Vis reward popup
    showRewardPopup(reward);
}

function showRewardPopup(reward) {
    const popup = document.createElement('div');
    popup.className = 'reward-popup';
    
    popup.innerHTML = `
        <div class="reward-content">
            <h3>🎁 Ny Belønning!</h3>
            <div class="reward-item">
                ${reward.item.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
            </div>
            <button class="equip-button">Udstyr</button>
        </div>
    `;
    
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
        padding: 20px;
        border-radius: 15px;
        color: #fff;
        text-align: center;
        z-index: 10000;
        border: 2px solid #ffd700;
        animation: popIn 0.3s ease-out;
    `;
    
    const equipButton = popup.querySelector('.equip-button');
    equipButton.onclick = () => {
        // Implementer logik til at udstyre belønningen
        localStorage.setItem('equipped_' + reward.type, reward.item);
        popup.remove();
    };
    
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 5000);
}

function showChainCompletionPopup(chainName, achievements) {
    const popup = document.createElement('div');
    popup.className = 'chain-completion-popup';
    
    const totalPoints = achievements.reduce((sum, ach) => 
        sum + (ach.tier ? ach.points * ach.tier.multiplier : ach.points), 0);
    
    popup.innerHTML = `
        <div class="chain-content">
            <h3>🎊 Achievement Chain Completed! 🎊</h3>
            <div class="chain-name">${chainName.charAt(0).toUpperCase() + chainName.slice(1)} Mastery</div>
            <div class="chain-achievements">
                ${achievements.map(ach => `
                    <div class="chain-achievement" style="border-color: ${ach.tier.color}">
                        ${ach.icon}
                    </div>
                `).join('')}
            </div>
            <div class="chain-points">+${totalPoints} Total Points</div>
        </div>
    `;
    
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
        padding: 30px;
        border-radius: 15px;
        color: #fff;
        text-align: center;
        z-index: 10000;
        border: 2px solid #ffd700;
        animation: chainComplete 0.5s ease-out;
    `;
    
    document.body.appendChild(popup);
    setTimeout(() => popup.remove(), 5000);
}

function showAchievementPopup(achievement, points) {
    const popup = document.createElement("div");
    popup.className = "achievement-popup";
    
    // Tilføj progress bar hvis achievement har progress
    const progressBar = achievement.maxProgress ? 
        `<div class="achievement-progress">
            <div class="progress-bar" style="width: ${(achievement.progress / achievement.maxProgress * 100)}%"></div>
         </div>` : '';
    
    popup.innerHTML = `
        <div class="achievement-icon">${achievement.icon}</div>
        <div class="achievement-content">
            <strong>${achievement.title}</strong>
            <span>${achievement.description}</span>
            ${progressBar}
            <div class="achievement-points">+${achievement.points} point</div>
        </div>
    `;
    
    popup.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        background: linear-gradient(135deg, #2a2a2a, #1a1a1a);
        padding: 16px;
        color: #fff;
        border-radius: 12px;
        font-size: 1.2em;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        animation: fadeInOut 3s;
        display: flex;
        align-items: center;
        gap: 12px;
        border: 2px solid ${achievement.secret ? '#ffd700' : '#2a2'};
    `;
    
    document.body.appendChild(popup);
    
    // Afspil achievement lyd hvis tilgængelig
    try {
        const sound = new Audio('assets/achievement.mp3');
        sound.volume = 0.5;
        sound.play();
    } catch (e) {
        console.warn('Achievement lyd kunne ikke afspilles:', e);
    }
    
    setTimeout(() => popup.remove(), 3000);
}

export function checkAchievements(gameState) {
    // Progression Achievements
    if (gameState.victory) {
        if (!isUnlocked("first_win")) unlockAchievement("first_win");
        incrementProgress("master_rider", 1);
    }
    
    // Performance Achievements
    if (gameState.victory && gameState.time < 30000) {
        unlockAchievement("speed_runner");
    }
    if (gameState.victory && !gameState.hasCrashed) {
        unlockAchievement("perfect_run");
    }
    
    // Skills Achievements
    if (gameState.airTime > 0) {
        updateProgress("air_time", gameState.airTime);
    }
    if (gameState.reachedMaxSpeed) {
        incrementProgress("speed_demon", 1);
    }
    
    // Collection Achievements
    updateProgress("coin_collector", gameState.totalCoins);
    updateProgress("checkpoint_master", gameState.totalCheckpoints);
    
    // Secret Achievements
    if (gameState.beatGhostRecord) {
        unlockAchievement("ghostbuster");
    }
    if (gameState.uniqueTerrainTypes?.size >= 10) {
        unlockAchievement("rainbow_rider");
    }
}

// Utility functions
export function getAchievements() {
    return ACHIEVEMENTS;
}

export function getStats() {
    return { ...stats };
}

export function isUnlocked(id) {
    return ACHIEVEMENTS.find(a => a.id === id)?.unlocked || false;
}

export function incrementProgress(id, amount = 1) {
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (achievement && !achievement.unlocked) {
        updateProgress(id, (achievement.progress || 0) + amount);
    }
}

// Achievement UI Overlay
export function showAchievementOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'achievement-overlay';
    
    // Group achievements by category
    const byCategory = Object.values(CATEGORIES).reduce((acc, cat) => {
        acc[cat] = ACHIEVEMENTS.filter(a => a.category === cat);
        return acc;
    }, {});

    // Create overlay content
    overlay.innerHTML = `
        <div class="achievement-overlay-content">
            <div class="achievement-header">
                <h2>Achievements</h2>
                <div class="achievement-stats">
                    <span>Total Points: ${stats.totalPoints}</span>
                    <span>Unlocked: ${stats.unlockedCount}/${ACHIEVEMENTS.length}</span>
                </div>
                <button class="close-button">×</button>
            </div>
            <div class="achievement-tabs">
                ${Object.entries(byCategory).map(([cat, achievements]) => `
                    <button class="tab-button" data-category="${cat}">
                        ${cat.charAt(0).toUpperCase() + cat.slice(1)}
                        <span class="category-progress">
                            ${stats.categoryProgress[cat].unlocked}/${stats.categoryProgress[cat].total}
                        </span>
                    </button>
                `).join('')}
            </div>
            <div class="achievement-lists">
                ${Object.entries(byCategory).map(([cat, achievements]) => `
                    <div class="achievement-list" data-category="${cat}">
                        ${achievements.map(ach => {
                            const tierStyle = ach.tier ? `border-color: ${ach.tier.color};` : '';
                            const chainStyle = ach.chain ? `margin-left: ${(ach.chainOrder-1) * 20}px;` : '';
                            return `
                                <div class="achievement-item ${ach.unlocked ? 'unlocked' : ''} 
                                                           ${ach.secret && !ach.unlocked ? 'secret' : ''}"
                                     style="${tierStyle} ${chainStyle}">
                                    <div class="achievement-icon">${ach.icon}</div>
                                    <div class="achievement-info">
                                        <h3>${ach.title}</h3>
                                        <p>${ach.secret && !ach.unlocked ? ach.hint || '???' : ach.description}</p>
                                        ${ach.maxProgress ? `
                                            <div class="achievement-progress">
                                                <div class="progress-bar" style="width: ${(ach.progress/ach.maxProgress*100)}%"></div>
                                                <span>${ach.progress}/${ach.maxProgress}</span>
                                            </div>
                                        ` : ''}
                                        ${ach.reward ? `
                                            <div class="achievement-reward">
                                                🎁 Belønning: ${ach.reward.item.split('_').map(w => 
                                                    w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="achievement-points">
                                        ${ach.tier ? `<span class="tier">${ach.tier.name}</span>` : ''}
                                        ${ach.points} pts
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `).join('')}
            </div>
        </div>
    `;
    
    // Add event listeners
    overlay.querySelector('.close-button').onclick = () => overlay.remove();
    
    const tabs = overlay.querySelectorAll('.tab-button');
    const lists = overlay.querySelectorAll('.achievement-list');
    
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            lists.forEach(l => l.classList.remove('active'));
            tab.classList.add('active');
            overlay.querySelector(`.achievement-list[data-category="${tab.dataset.category}"]`)
                .classList.add('active');
        };
    });
    
    // Show first category by default
    tabs[0].click();
    
    document.body.appendChild(overlay);
}

// CSS styling
const style = document.createElement('style');
style.innerHTML = `
@keyframes popIn {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.1); }
    100% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
}

@keyframes chainComplete {
    0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0; }
    50% { transform: translate(-50%, -50%) scale(1.2); }
    70% { transform: translate(-50%, -50%) rotate(5deg); }
    85% { transform: translate(-50%, -50%) rotate(-5deg); }
    100% { transform: translate(-50%, -50%) scale(1) rotate(0); opacity: 1; }
}

@keyframes fadeInOut {
    0% { opacity: 0; transform: translateX(50px);}
    10% { opacity: 1; transform: translateX(0);}
    90% { opacity: 1; transform: translateX(0);}
    100% { opacity: 0; transform: translateX(50px);}
}

/* Achievement Popup */
.achievement-popup {
    pointer-events: none;
}

.achievement-popup .achievement-icon {
    font-size: 2em;
    text-shadow: 0 0 10px rgba(255,255,255,0.5);
}

.achievement-popup .achievement-content {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.achievement-popup .achievement-points {
    font-size: 0.8em;
    color: #2a2;
    font-weight: bold;
}

/* Achievement Overlay */
.achievement-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: center;
    font-family: Arial, sans-serif;
}

.achievement-overlay-content {
    background: #1a1a1a;
    border-radius: 15px;
    width: 90%;
    max-width: 1000px;
    height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.achievement-header {
    background: #2a2a2a;
    padding: 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.achievement-header h2 {
    color: #fff;
    margin: 0;
}

.achievement-stats {
    display: flex;
    gap: 20px;
    color: #aaa;
}

.close-button {
    background: none;
    border: none;
    color: #fff;
    font-size: 24px;
    cursor: pointer;
    padding: 0 10px;
}

.achievement-tabs {
    display: flex;
    background: #222;
    padding: 10px 10px 0;
    gap: 5px;
}

.tab-button {
    background: #333;
    border: none;
    color: #aaa;
    padding: 10px 20px;
    border-radius: 5px 5px 0 0;
    cursor: pointer;
}

.tab-button.active {
    background: #1a1a1a;
    color: #fff;
}

.category-progress {
    color: #666;
    margin-left: 10px;
}

.achievement-lists {
    flex-grow: 1;
    overflow-y: auto;
    padding: 20px;
}

.achievement-list {
    display: none;
    gap: 10px;
    flex-direction: column;
}

.achievement-list.active {
    display: flex;
}

.achievement-item {
    display: flex;
    align-items: center;
    gap: 15px;
    background: #222;
    padding: 15px;
    border-radius: 10px;
    border-left: 4px solid transparent;
    transition: all 0.3s ease;
}

.achievement-item.unlocked {
    background: #1a2a1a;
    border-color: #2a2 !important;
}

.achievement-item.secret:not(.unlocked) {
    background: #2a1a2a;
    filter: brightness(0.7);
}

.achievement-item .achievement-icon {
    font-size: 2.5em;
    text-shadow: 0 0 10px rgba(255,255,255,0.3);
    min-width: 50px;
    text-align: center;
}

.achievement-info {
    flex-grow: 1;
}

.achievement-info h3 {
    margin: 0;
    color: #fff;
}

.achievement-info p {
    margin: 5px 0;
    color: #aaa;
}

.achievement-progress {
    margin-top: 10px;
    background: rgba(255,255,255,0.1);
    border-radius: 3px;
    height: 6px;
    position: relative;
    overflow: hidden;
}

.achievement-progress .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #2a2, #5c5);
    transition: width 0.3s ease;
}

.achievement-progress span {
    position: absolute;
    right: 0;
    top: -18px;
    font-size: 0.8em;
    color: #666;
}

.achievement-reward {
    margin-top: 5px;
    color: #ffd700;
    font-size: 0.9em;
}

.achievement-points {
    text-align: right;
    color: #2a2;
    font-weight: bold;
    min-width: 100px;
}

.achievement-points .tier {
    display: block;
    font-size: 0.8em;
    color: #666;
    margin-bottom: 3px;
}
`;
document.head.appendChild(style);
