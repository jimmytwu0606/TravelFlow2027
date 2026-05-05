/**
 * 🇺🇸🇬🇧 [EN-Config] 英美語聲學與路網擴充協定 (V2026.ULTRA.FINAL)
 * 作用：獨立存儲英美語專屬聲線、IPA 對焦表與教學能階定義
 */

export const EN_CONFIG = {
    // 🎨 [Visual-DNA] 英美語學習專屬色彩與能階
    TIERS: {
        'A1': { name: 'Beginner', color: '#60a5fa', bg: 'bg-blue-400' },
        'A2': { name: 'Elementary', color: '#3b82f6', bg: 'bg-blue-500' },
        'B1': { name: 'Intermediate', color: '#2563eb', bg: 'bg-blue-600' },
        'B2': { name: 'Upper-Int', color: '#1d4ed8', bg: 'bg-blue-700' },
        'C1': { name: 'Advanced', color: '#1e40af', bg: 'bg-blue-800' },
        'C2': { name: 'Proficiency', color: '#1e3a8a', bg: 'bg-blue-900' }
    },

    // 🏷️ [Category] 預設學習標籤
    DEFAULT_CATEGORIES: ['Study', 'Business', 'Daily', 'Slang', 'Travel', 'Academic'],

    // 🌐 [Acoustic-Router] 語系對位指紋
    LANG_MAP: {
        'UK': 'en-GB',
        'US': 'en-US'
    },


    // 🎙️ 語音模組庫：英美語專用軌道 (60 組 Chirp3-HD Studio 級)
    VOICE_LIST: [
        // ============================================================
        // 🇬🇧 英語 (英國) Chirp3-HD 聲線矩陣
        // ============================================================
        { id: 'en-GB-Chirp3-HD-Achird', name: 'UK 老練男聲 Achird', gender: 'M', desc: '英式 Chirp3-HD | 渾厚威嚴' },
        { id: 'en-GB-Chirp3-HD-Algenib', name: 'UK 專業男聲 Algenib', gender: 'M', desc: '英式 Chirp3-HD | 發音銳利' },
        { id: 'en-GB-Chirp3-HD-Algieba', name: 'UK 穩重男聲 Algieba', gender: 'M', desc: '英式 Chirp3-HD | 語氣平和' },
        { id: 'en-GB-Chirp3-HD-Alnilam', name: 'UK 斯文男聲 Alnilam', gender: 'M', desc: '英式 Chirp3-HD | 音色優雅' },
        { id: 'en-GB-Chirp3-HD-Charon', name: 'UK 冷酷男聲 Charon', gender: 'M', desc: '英式 Chirp3-HD | 語調低沈' },
        { id: 'en-GB-Chirp3-HD-Enceladus', name: 'UK 陽光男聲 Enceladus', gender: 'M', desc: '英式 Chirp3-HD | 節奏輕快' },
        { id: 'en-GB-Chirp3-HD-Fenrir', name: 'UK 威嚴男聲 Fenrir', gender: 'M', desc: '英式 Chirp3-HD | 音壓強大' },
        { id: 'en-GB-Chirp3-HD-Iapetus', name: 'UK 平穩男聲 Iapetus', gender: 'M', desc: '英式 Chirp3-HD | 標準播報音' },
        { id: 'en-GB-Chirp3-HD-Orus', name: 'UK 爽朗男聲 Orus', gender: 'M', desc: '英式 Chirp3-HD | 具親和力' },
        { id: 'en-GB-Chirp3-HD-Puck', name: 'UK 輕盈男聲 Puck', gender: 'M', desc: '英式 Chirp3-HD | 音頻稍高' },
        { id: 'en-GB-Chirp3-HD-Rasalgethi', name: 'UK 磁性男聲 Rasalgethi', gender: 'M', desc: '英式 Chirp3-HD | 富含情感' },
        { id: 'en-GB-Chirp3-HD-Sadachbia', name: 'UK 謙遜男聲 Sadachbia', gender: 'M', desc: '英式 Chirp3-HD | 語氣柔軟' },
        { id: 'en-GB-Chirp3-HD-Sadaltager', name: 'UK 沉著男聲 Sadaltager', gender: 'M', desc: '英式 Chirp3-HD | 邏輯感強' },
        { id: 'en-GB-Chirp3-HD-Schedar', name: 'UK 堅毅男聲 Schedar', gender: 'M', desc: '英式 Chirp3-HD | 語氣果決' },
        { id: 'en-GB-Chirp3-HD-Zubenelgenubi', name: 'UK 老派男聲 Zubenel', gender: 'M', desc: '英式 Chirp3-HD | 帶有歷史感' },

        { id: 'en-GB-Chirp3-HD-Achernar', name: 'UK 幹練女聲 Achernar', gender: 'F', desc: '英式 Chirp3-HD | 語速快且準確' },
        { id: 'en-GB-Chirp3-HD-Aoede', name: 'UK 親切女聲 Aoede', gender: 'F', desc: '英式 Chirp3-HD | 自然笑容感' },
        { id: 'en-GB-Chirp3-HD-Autonoe', name: 'UK 優雅女聲 Autonoe', gender: 'F', desc: '英式 Chirp3-HD | 語調優美' },
        { id: 'en-GB-Chirp3-HD-Callirrhoe', name: 'UK 知性女聲 Callirrhoe', gender: 'F', desc: '英式 Chirp3-HD | 穩重清晰' },
        { id: 'en-GB-Chirp3-HD-Despina', name: 'UK 活力女聲 Despina', gender: 'F', desc: '英式 Chirp3-HD | 高亢開朗' },
        { id: 'en-GB-Chirp3-HD-Erinome', name: 'UK 溫柔女聲 Erinome', gender: 'F', desc: '英式 Chirp3-HD | 語音柔和' },
        { id: 'en-GB-Chirp3-HD-Gacrux', name: 'UK 沈靜女聲 Gacrux', gender: 'F', desc: '英式 Chirp3-HD | 冷靜理性' },
        { id: 'en-GB-Chirp3-HD-Kore', name: 'UK 甜美女聲 Kore', gender: 'F', desc: '英式 Chirp3-HD | 音頻明亮' },
        { id: 'en-GB-Chirp3-HD-Laomedeia', name: 'UK 成熟女聲 Laomedeia', gender: 'F', desc: '英式 Chirp3-HD | 氣場強大' },
        { id: 'en-GB-Leda', name: 'UK 典雅女聲 Leda', gender: 'F', desc: '英式 Chirp3-HD | 細膩婉約' },
        { id: 'en-GB-Chirp3-HD-Pulcherrima', name: 'UK 細緻女聲 Pulcher', gender: 'F', desc: '英式 Chirp3-HD | 辨識度極高' },
        { id: 'en-GB-Chirp3-HD-Sulafat', name: 'UK 和藹女聲 Sulafat', gender: 'F', desc: '英式 Chirp3-HD | 具長輩感' },
        { id: 'en-GB-Chirp3-HD-Umbriel', name: 'UK 磁性女聲 Umbriel', gender: 'F', desc: '英式 Chirp3-HD | 神祕感強' },
        { id: 'en-GB-Chirp3-HD-Vindemiatrix', name: 'UK 幹練女聲 Vindemi', gender: 'F', desc: '英式 Chirp3-HD | 商務標準' },
        { id: 'en-GB-Chirp3-HD-Zephyr', name: 'UK 清透女聲 Zephyr', gender: 'F', desc: '英式 Chirp3-HD | 如微風般自然' },

        // ============================================================
        // 🇺🇸 英語 (美國) Chirp3-HD 聲線矩陣
        // ============================================================
        { id: 'en-US-Chirp3-HD-Achird', name: 'US 老練男聲 Achird', gender: 'M', desc: '美式 Chirp3-HD | 渾厚有力' },
        { id: 'en-US-Chirp3-HD-Algenib', name: 'US 專業男聲 Algenib', gender: 'M', desc: '美式 Chirp3-HD | 矽谷風格' },
        { id: 'en-US-Chirp3-HD-Algieba', name: 'US 穩重男聲 Algieba', gender: 'M', desc: '美式 Chirp3-HD | 低頻感強' },
        { id: 'en-US-Chirp3-HD-Alnilam', name: 'US 斯文男聲 Alnilam', gender: 'M', desc: '美式 Chirp3-HD | 語氣平順' },
        { id: 'en-US-Chirp3-HD-Charon', name: 'US 冷靜男聲 Charon', gender: 'M', desc: '美式 Chirp3-HD | 低沈冷峻' },
        { id: 'en-US-Chirp3-HD-Enceladus', name: 'US 陽光男聲 Enceladus', gender: 'M', desc: '美式 Chirp3-HD | 充滿能量' },
        { id: 'en-US-Chirp3-HD-Fenrir', name: 'US 威嚴男聲 Fenrir', gender: 'M', desc: '美式 Chirp3-HD | 好萊塢預告片感' },
        { id: 'en-US-Chirp3-HD-Iapetus', name: 'US 平穩男聲 Iapetus', gender: 'M', desc: '美式 Chirp3-HD | CNN 風格播報' },
        { id: 'en-US-Chirp3-HD-Orus', name: 'US 爽朗男聲 Orus', gender: 'M', desc: '美式 Chirp3-HD | 加州氣息' },
        { id: 'en-US-Chirp3-HD-Puck', name: 'US 輕盈男聲 Puck', gender: 'M', desc: '美式 Chirp3-HD | 節奏跳躍' },
        { id: 'en-US-Chirp3-HD-Rasalgethi', name: 'US 磁性男聲 Rasalgethi', gender: 'M', desc: '美式 Chirp3-HD | 嗓音迷人' },
        { id: 'en-US-Chirp3-HD-Sadachbia', name: 'US 謙遜男聲 Sadachbia', gender: 'M', desc: '美式 Chirp3-HD | 語氣客氣' },
        { id: 'en-US-Chirp3-HD-Sadaltager', name: 'US 沉著男聲 Sadaltager', gender: 'M', desc: '美式 Chirp3-HD | 商務精英' },
        { id: 'en-US-Chirp3-HD-Schedar', name: 'US 堅毅男聲 Schedar', gender: 'M', desc: '美式 Chirp3-HD | 語氣強硬' },
        { id: 'en-US-Chirp3-HD-Zubenelgenubi', name: 'US 老派男聲 Zubenel', gender: 'M', desc: '美式 Chirp3-HD | 磁性老腔' },

        { id: 'en-US-Chirp3-HD-Achernar', name: 'US 幹練女聲 Achernar', gender: 'F', desc: '美式 Chirp3-HD | 俐落明快' },
        { id: 'en-US-Chirp3-HD-Aoede', name: 'US 親切女聲 Aoede', gender: 'F', desc: '美式 Chirp3-HD | 陽光鄰家感' },
        { id: 'en-US-Chirp3-HD-Autonoe', name: 'US 優雅女聲 Autonoe', gender: 'F', desc: '美式 Chirp3-HD | 音色柔美' },
        { id: 'en-US-Chirp3-HD-Callirrhoe', name: 'US 知性女聲 Callirrhoe', gender: 'F', desc: '美式 Chirp3-HD | 清晰穩重' },
        { id: 'en-US-Chirp3-HD-Despina', name: 'US 活力女聲 Despina', gender: 'F', desc: '美式 Chirp3-HD | 節奏感強' },
        { id: 'en-US-Chirp3-HD-Erinome', name: 'US 溫柔女聲 Erinome', gender: 'F', desc: '美式 Chirp3-HD | 語音緩和' },
        { id: 'en-US-Chirp3-HD-Gacrux', name: 'US 沈靜女聲 Gacrux', gender: 'F', desc: '美式 Chirp3-HD | 理性中性' },
        { id: 'en-US-Chirp3-HD-Kore', name: 'US 甜美女聲 Kore', gender: 'F', desc: '美式 Chirp3-HD | 年輕明亮' },
        { id: 'en-US-Chirp3-HD-Laomedeia', name: 'US 成熟女聲 Laomedeia', gender: 'F', desc: '美式 Chirp3-HD | 自信氣場' },
        { id: 'en-US-Chirp3-HD-Leda', name: 'US 典雅女聲 Leda', gender: 'F', desc: '美式 Chirp3-HD | 充滿故事感' },
        { id: 'en-US-Chirp3-HD-Pulcherrima', name: 'US 細緻女聲 Pulcher', gender: 'F', desc: '美式 Chirp3-HD | 辨識度極高' },
        { id: 'en-US-Chirp3-HD-Sulafat', name: 'US 和藹女聲 Sulafat', gender: 'F', desc: '美式 Chirp3-HD | 溫暖慈祥' },
        { id: 'en-US-Chirp3-HD-Umbriel', name: 'US 磁性女聲 Umbriel', gender: 'F', desc: '美式 Chirp3-HD | 神祕且深沉' },
        { id: 'en-US-Chirp3-HD-Vindemiatrix', name: 'US 幹練女聲 Vindemi', gender: 'F', desc: '美式 Chirp3-HD | 標準空乘感' },
        { id: 'en-US-Chirp3-HD-Zephyr', name: 'US 清透女聲 Zephyr', gender: 'F', desc: '美式 Chirp3-HD | 如晨光般清澈' }
    ]
};

/** 🌐 [EN-Acoustic-Router] 語系對位指紋 */
export const EN_LANG_MAP = {
    'UK': { code: 'en-GB', fallback: 'en-US' },
    'US': { code: 'en-US', fallback: 'en-GB' },
    'DEFAULT': 'en-US'
};

/** 🎨 [EN-Visual-DNA] 英美語學習專屬色彩與能階 */
export const EN_TIERS = {
    'A1': { name: 'Beginner', color: '#60a5fa', bg: 'bg-blue-500' }, // 入門
    'B1': { name: 'Intermediate', color: '#3b82f6', bg: 'bg-blue-600' }, // 進階
    'C1': { name: 'Advanced', color: '#1d4ed8', bg: 'bg-blue-800' } // 精英
};

/** 🏷️ [EN-Category-Default] 預設學習標籤 */
export const EN_DEFAULT_CATS = ['Study', 'Business', 'Daily', 'Slang', 'Travel'];

/** 🧬 [Helper] 獲取指定 ID 的聲學人格 */
export const getEnVoiceById = (voiceId) => {
    return EN_CONFIG.VOICE_LIST.find(v => v.id === voiceId) || EN_CONFIG.VOICE_LIST[30]; // 預設對焦 US Achird
};

/** 🎙️ [EN-Liaison-Detector] 美式連音偵測預檢 (預留給聲學診斷使用) */
export const detectEnLiaison = (text) => {
    // 簡單偵測常見連音特徵，如 "going to" -> "gonna" 
    return /going to|want to|got to/gi.test(text);
};

/** 🎯 [Helper] 根據語系與性別執行「隨機人格對焦」 */
export const getRandomEnPersona = (langType = 'US', gender = 'M') => {
    const prefix = langType === 'UK' ? 'en-GB' : 'en-US';
    const pool = EN_CONFIG.VOICE_LIST.filter(v => v.id.startsWith(prefix) && v.gender === gender);
    return pool[Math.floor(Math.random() * pool.length)];
};

/** 🕵️ [Helper] 執行 CEFR 視覺對焦：獲取等級對應的色彩代碼 */
export const getEnTierStyle = (level) => {
    const key = String(level).toUpperCase();
    return EN_CONFIG.TIERS[key] || EN_CONFIG.TIERS['B1'];
};