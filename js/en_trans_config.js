/** 🎭 EN PERSONA ENGINE (英美語人格與聲學基因引擎)
 * 核心版本：V2026.ULTRA.FINAL
 * 物理作用：執行美/英系 100 員人格採樣與 Chirp3-HD 模型對位
 */

/** 🚀 [NAME_POOL_EN] 英美語人格指紋庫 - V2026.ULTRA.TOTAL_100 */
export const NAME_POOL_EN = [
    // --- 🇺🇸 美式經典與穩定層 (US Classic & Stable) - 40 員 ---
    ["James", "m", "US"], ["Mary", "f", "US"], ["Robert", "m", "US"], ["Patricia", "f", "US"],
    ["John", "m", "US"], ["Jennifer", "f", "US"], ["Michael", "m", "US"], ["Linda", "f", "US"],
    ["William", "m", "US"], ["Elizabeth", "f", "US"], ["David", "m", "US"], ["Barbara", "f", "US"],
    ["Richard", "m", "US"], ["Susan", "f", "US"], ["Joseph", "m", "US"], ["Jessica", "f", "US"],
    ["Thomas", "m", "US"], ["Sarah", "f", "US"], ["Charles", "m", "US"], ["Karen", "f", "US"],
    ["Christopher", "m", "US"], ["Nancy", "f", "US"], ["Daniel", "m", "US"], ["Margaret", "f", "US"],
    ["Matthew", "m", "US"], ["Lisa", "f", "US"], ["Anthony", "m", "US"], ["Betty", "f", "US"],
    ["Mark", "m", "US"], ["Dorothy", "f", "US"], ["Donald", "m", "US"], ["Sandra", "f", "US"],
    ["Steven", "m", "US"], ["Ashley", "f", "US"], ["Paul", "m", "US"], ["Kimberly", "f", "US"],
    ["Andrew", "m", "US"], ["Donna", "f", "US"], ["Joshua", "m", "US"], ["Emily", "f", "US"],

    // --- 🇬🇧 英式優雅與名門層 (GB Elite & Posh) - 30 員 ---
    ["Alistair", "m", "GB"], ["Clementine", "f", "GB"], ["Benedict", "m", "GB"], ["Florence", "f", "GB"],
    ["Sebastian", "m", "GB"], ["Imogen", "f", "GB"], ["Arthur", "m", "GB"], ["Beatrice", "f", "GB"],
    ["Oliver", "m", "GB"], ["Eleanor", "f", "GB"], ["George", "m", "GB"], ["Harriet", "f", "GB"],
    ["Archie", "m", "GB"], ["Penelope", "f", "GB"], ["Harry", "m", "GB"], ["Charlotte", "f", "GB"],
    ["Jasper", "m", "GB"], ["Isla", "f", "GB"], ["Rupert", "m", "GB"], ["Rosalind", "f", "GB"],
    ["Barnaby", "m", "GB"], ["Gwendolyn", "f", "GB"], ["Nigel", "m", "GB"], ["Victoria", "f", "GB"],
    ["Alfie", "m", "GB"], ["Poppy", "f", "GB"], ["Edward", "m", "GB"], ["Matilda", "f", "GB"],
    ["Hugo", "m", "GB"], ["Jemima", "f", "GB"],

    // --- 💼 職業與專業權力層 (Professional & Authority) - 15 員 ---
    ["CEO Smith", "m", "US"], ["Dr. Miller", "f", "US"], ["Professor Brown", "m", "GB"],
    ["Agent Cooper", "m", "US"], ["Judge Martha", "f", "GB"], ["Captain Jack", "m", "US"],
    ["Detective Hunt", "m", "GB"], ["Director Ava", "f", "US"], ["Counselor Ben", "m", "US"],
    ["Dean Watson", "m", "GB"], ["Sheriff Roy", "m", "US"], ["Pilot Grace", "f", "US"],
    ["Attorney Reed", "m", "US"], ["Surgeon Grey", "f", "US"], ["Inspector Morse", "m", "GB"],

    // --- 🚀 現代與流行趨勢層 (Modern & Trendy) - 15 員 ---
    ["Ethan", "m", "US"], ["Emma", "f", "US"], ["Noah", "m", "US"], ["Olivia", "f", "US"],
    ["Liam", "m", "US"], ["Ava", "f", "US"], ["Lucas", "m", "US"], ["Sophia", "f", "US"],
    ["Mason", "m", "US"], ["Isabella", "f", "US"], ["Logan", "m", "US"], ["Mia", "f", "US"],
    ["Jackson", "m", "US"], ["Harper", "f", "US"], ["Aiden", "m", "US"]
];

// 🚀 [2] 英美語境位階種子 (Western Context Titles)
export const ROLE_TITLES_EN = {
    CORPORATE: ["CEO", "Marketing Manager", "HR Director", "Product Owner", "Consultant"],
    AVIATION: ["Flight Attendant", "Pilot", "Ground Crew", "Air Traffic Controller"],
    ACADEMIC: ["Professor", "Researcher", "PhD Student", "Librarian", "Historian"],
    CREATIVE: ["Freelancer", "Graphic Designer", "Content Creator", "Film Director"],
    SERVICE: ["Concierge", "Barista", "Waiter", "Hotel Manager", "Tour Guide"],
    EMERGENCY: ["Physician", "Paramedic", "Officer", "Attorney", "Insurance Agent"]
};

/** 🚀 [3] 英美聲學矩陣 (Linguistic Acoustic Matrix) - V2026.ULTRA.STABLE */
export const ACOUSTIC_MATRIX_EN = {
    // 商務層：語速稍快展現效率，音調微降展現權威
    CORPORATE:   { pitch: '-1.0st', rate: '1.05', role: 'man' }, 
    
    // 航空層：標準語速，音調微升確保穿透力與親切感
    AVIATION:    { pitch: '+0.5st', rate: '1.00', role: 'woman' }, 
    
    // 學術層：降低語速，降低音調，模擬嚴謹的論證節奏
    ACADEMIC:    { pitch: '-1.5st', rate: '0.90', role: 'man' }, 
    
    // 創意層：提高語速與音調，展現高能量的情緒波動
    CREATIVE:    { pitch: '+1.5st', rate: '1.15', role: 'woman' }, 
    
    // 服務層：標準音調，語速微降展現耐心與禮貌
    SERVICE:     { pitch: '0.0st',  rate: '0.95', role: 'woman' }, 
    
    // 緊急層：音調下壓，語速拉升，模擬高壓下的指令傳達
    EMERGENCY:   { pitch: '-0.5st', rate: '1.10', role: 'man' }
};

export const en_personaEngine = {
    lastDuo: null,

/** 🧬 基因合成發動機：執行 Chirp3-HD 物理對焦與聲學微幅擾動 (V2026.ULTRA.JITTER) */
_getRefinedAcoustic(cat, name, genderFlag, nationality) {
    // 🚀 1. 取得類別基準基因
    const base = ACOUSTIC_MATRIX_EN[cat] || { pitch: '0st', rate: '1.0', role: 'woman' };
    const isMan = (genderFlag === 'm');

    try {
        // 🚀 2. 物理模型雜湊 (Model Hashing)
        // 💡 職人診斷：利用國籍 (US/GB) 作為物理前綴過濾，確保口音絕對對焦
        const chirpPool = window.audioManager?.CHIRP_MODELS || { man: [], woman: [] };
        const prefix = nationality === 'GB' ? 'en-GB' : 'en-US';
        const models = (isMan ? chirpPool.man : chirpPool.woman).filter(m => m.startsWith(prefix));

        // 透過姓名 Seed 決定模型索引
        const seed = String(name || "DEFAULT").split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const targetModel = (models && models.length > 0) 
            ? models[seed % models.length] 
            : (isMan ? 'en-US-Neural2-A' : 'en-US-Neural2-F');

        // 🚀 3. 【核心修正】音調隨機擾動 (Acoustic Jitter Protocol)
        // 💡 理由：透過 ±0.6st 的音程偏移，讓 100 員人格即便使用同一個模型，也能產生個體差異
        const pitchJitter = ((seed % 12) / 10) - 0.6; // 範圍約 -0.6st ~ +0.5st
        const basePitch = parseFloat(base.pitch) || 0;
        const finalPitch = (basePitch + pitchJitter).toFixed(1) + 'st';

        // 🚀 4. 語速自然擾動 (Velocity Jitter)
        const rateJitter = ((seed % 5) / 100) - 0.02; // 範圍約 -2% ~ +2%
        const finalRate = (parseFloat(base.rate) + rateJitter).toFixed(2);

        return {
            voice: targetModel,
            pitch: finalPitch,
            rate: finalRate,
            role: isMan ? 'man' : 'woman',
            nationality: nationality
        };

    } catch (err) {
        console.error("❌ [EN-Acoustic-Weld-Collapse]:", err);
        return { 
            voice: isMan ? 'en-US-Neural2-A' : 'en-US-Neural2-F',
            pitch: base.pitch,
            rate: base.rate,
            role: isMan ? 'man' : 'woman',
            nationality: nationality 
        };
    }
},

/** 🎭 [Duo-Ignition] 獲取英文隨機對話組合 (V2026.ULTRA.CONTRAST) */
getRandomDuo() {
    const p1 = this.getRandomPersona();
    let p2 = this.getRandomPersona();

    // 🚀 1. 深度碰撞檢查與國籍衝突協定
    // 💡 職人診斷：嘗試在 15 次採樣內找出「不同名」且「不同國籍」的對手
    // 若池子限制無法達成不同國籍，則退而求其次僅要求不同名。
    let safety = 0;
    while (safety < 15) {
        const isSameName = (p1.name === p2.name);
        const isSameNationality = (p1.nationality === p2.nationality);
        
        // 前 10 次嘗試強制追求跨國對焦 (US vs GB)，後 5 次放寬僅求不同名
        if (isSameName || (isSameNationality && safety < 10)) {
            p2 = this.getRandomPersona();
            safety++;
        } else {
            break;
        }
    }

    // 🚀 2. 全域數據溢出與主權同步
    // 💡 職人提醒：這裡必須寫入全域 window 物件，供 en_audioManager 的識字器即時採樣
    window.currentActorA = p1;
    window.currentActorB = p2;
    this.lastDuo = { actorA: p1, actorB: p2 };

    // 🚀 3. 指令對焦提示 (Context Hint)
    // 為 AI 生成劇場對話提供明確的背景暗示
    const hint = `Dialogue between ${p1.nationality} ${p1.role} (${p1.name}) and ${p2.nationality} ${p2.role} (${p2.name})`;
    
    console.log(`🎭 [EN-Duo-Ignition] 軌道導通: ${p1.name}[${p1.nationality}] ⚡ ${p2.name}[${p2.nationality}]`);

    return {
        actorA: p1,
        actorB: p2,
        contextHint: hint
    };
},

    /** 🎲 獲取隨機英文人格指紋 */
    getRandomPersona() {
        const categories = Object.keys(ROLE_TITLES_EN);
        const cat = categories[Math.floor(Math.random() * categories.length)];
        const roles = ROLE_TITLES_EN[cat];
        const role = roles[Math.floor(Math.random() * roles.length)];
        
        const poolEntry = NAME_POOL_EN[Math.floor(Math.random() * NAME_POOL_EN.length)];
        const [name, gender, nationality] = poolEntry;

        const acoustic = this._getRefinedAcoustic(cat, name, gender, nationality);

        return {
            name,
            role,
            category: cat,
            nationality,
            gender: gender === 'm' ? 'man' : 'woman',
            icon: nationality === 'GB' ? '🇬🇧' : '🇺🇸',
            acoustic,
            displayName: `${name} (${role})`,
            fullLabel: `${nationality === 'GB' ? '🇬🇧' : '🇺🇸'} ${name} - ${role}`
        };
    }
};

/** 🛰️ [Data-Bus-Ignition] 全路網數據溢出與主權導通 */
if (typeof window !== 'undefined') {
    // 1. 【姓名主權】供 en_audioManager 執行英文物理識字對位
    window.NAME_POOL_EN = NAME_POOL_EN;
    
    // 2. 【職稱主權】供 UI 渲染與 AI Prompt 參考
    window.ROLE_TITLES_EN = ROLE_TITLES_EN;
    
    // 3. 【聲學主權】供 en_audioManager 執行類別音質分流
    window.ACOUSTIC_MATRIX_EN = ACOUSTIC_MATRIX_EN;
    
    // 4. 【引擎實體】供全系統調用
    window.en_personaEngine = en_personaEngine;

    // 🚀 [Debug-Console] 英文數據路網對焦回報
    console.log("⚡ [TravelFlow-EN-Bus] 英文全量數據基因已導通：");
    console.table({
        "EN 姓名指紋": NAME_POOL_EN.length + " 筆",
        "EN 聲學矩陣": Object.keys(ACOUSTIC_MATRIX_EN).length + " 類",
        "EN 人格發動機": "運作中"
    });
}