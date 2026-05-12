// 🚀 核心焊接：嘗試引入私人鑰匙包
let privateEnv = { GOOGLE_TTS_KEY: "" };
try {
    // 使用動態或標準導入，視你的開發環境而定
    // 這裡我們直接導入，若 .gitignore 攔截後 GitHub 會找不到此檔，所以 GitHub 版會報錯
    // 職人做法：在 GitHub 上傳時，env.js 是不存在的
    // import { ENV } from './env.js'; 
} catch (e) {
    console.warn("⚠️ [Security] ENV 鑰匙包未對焦，將採限縮模式運行");
}

// 導入 ENV (如果是 ESM 且檔案存在)
import { ENV } from '../env.js';

/**
 * ⚙️ CONFIG & STATE (V2026.ULTRA.FINAL_STABLE)
 */
export const CONFIG = {
    DB_NAME: "TravelFlow_DB",
    DB_VERSION: 4, 
    STORE_NAME: "trips",
    API_ENDPOINT: 'http://localhost:3000',

    // 🚀 數據保護
    GOOGLE_TTS_KEY: (typeof ENV !== 'undefined') ? ENV.GOOGLE_TTS_KEY : "",

    // 🎙️ 語音全量模組庫 (30+ 員 Chirp3-HD Studio 級)
    VOICE_LIST: [

    // ============================================================
    // 🇯🇵 日語聲線矩陣 (Chirp3-HD Studio 級)
    // ============================================================
    // --- ♂️ Chirp3-HD 男性陣列 (15 組) ---
    { id: 'ja-JP-Chirp3-HD-Achird', name: '老練男聲 Achird', gender: 'M', desc: '渾厚且具權威感，適合教授、署長' },
    { id: 'ja-JP-Chirp3-HD-Algenib', name: '專業男聲 Algenib', gender: 'M', desc: '發音銳利，適合醫師、技術人員' },
    { id: 'ja-JP-Chirp3-HD-Algieba', name: '穩重男聲 Algieba', gender: 'M', desc: '低頻共鳴強，適合中老年男性' },
    { id: 'ja-JP-Chirp3-HD-Alnilam', name: '斯文男聲 Alnilam', gender: 'M', desc: '語氣平和，適合公務員、顧問' },
    { id: 'ja-JP-Chirp3-HD-Charon', name: '冷酷男聲 Charon', gender: 'M', desc: '音調低沈，適合裏社會、交涉人' },
    { id: 'ja-JP-Chirp3-HD-Enceladus', name: '陽光男聲 Enceladus', gender: 'M', desc: '節奏輕快，適合年輕領隊' },
    { id: 'ja-JP-Chirp3-HD-Fenrir', name: '威嚴男聲 Fenrir', gender: 'M', desc: '音壓強大，具備壓迫感的嗓音' },
    { id: 'ja-JP-Chirp3-HD-Iapetus', name: '平穩男聲 Iapetus', gender: 'M', desc: '標準播報音，適合站長、機長' },
    { id: 'ja-JP-Chirp3-HD-Orus', name: '爽朗男聲 Orus', gender: 'M', desc: '親和力高，適合大阪商人' },
    { id: 'ja-JP-Chirp3-HD-Puck', name: '輕盈男聲 Puck', gender: 'M', desc: '音頻稍高，適合少年或漫才師' },
    { id: 'ja-JP-Chirp3-HD-Rasalgethi', name: '磁性男聲 Rasalgethi', gender: 'M', desc: '富含情感，適合藝術家、聲優' },
    { id: 'ja-JP-Chirp3-HD-Sadachbia', name: '謙遜男聲 Sadachbia', gender: 'M', desc: '語氣柔軟，適合餐廳侍者' },
    { id: 'ja-JP-Chirp3-HD-Sadaltager', name: '沉著男聲 Sadaltager', gender: 'M', desc: '速度平穩，適合金融精英' },
    { id: 'ja-JP-Chirp3-HD-Schedar', name: '堅毅男聲 Schedar', gender: 'M', desc: '語氣果決，適合警察、教練' },
    { id: 'ja-JP-Chirp3-HD-Zubenelgenubi', name: '老派男聲 Zubenel', gender: 'M', desc: '帶有歲月感，適合老店舖老闆' },

    // --- ♀️ Chirp3-HD 女性陣列 (15 組) ---
    { id: 'ja-JP-Chirp3-HD-Achernar', name: '幹練女聲 Achernar', gender: 'F', desc: '語速快且準確，適合女強人' },
    { id: 'ja-JP-Chirp3-HD-Aoede', name: '親切女聲 Aoede', gender: 'F', desc: '自然笑容感，適合服務台、嚮導' },
    { id: 'ja-JP-Chirp3-HD-Autonoe', name: '優雅女聲 Autonoe', gender: 'F', desc: '語調優美，適合京都名媛、女將' },
    { id: 'ja-JP-Chirp3-HD-Callirrhoe', name: '知性女聲 Callirrhoe', gender: 'F', desc: '穩重清晰，適合教授、醫師' },
    { id: 'ja-JP-Chirp3-HD-Despina', name: '活力女聲 Despina', gender: 'F', desc: '高亢開朗，適合交通播報' },
    { id: 'ja-JP-Chirp3-HD-Erinome', name: '溫柔女聲 Erinome', gender: 'F', desc: '語音柔和，適合護理長、保育員' },
    { id: 'ja-JP-Chirp3-HD-Gacrux', name: '沈靜女聲 Gacrux', gender: 'F', desc: '冷靜理性，適合調查官、鑑定官' },
    { id: 'ja-JP-Chirp3-HD-Kore', name: '甜美女聲 Kore', gender: 'F', desc: '音頻明亮，適合年輕練習生' },
    { id: 'ja-JP-Chirp3-HD-Laomedeia', name: '成熟女聲 Laomedeia', gender: 'F', desc: '氣場強大，適合名譽顧問' },
    { id: 'ja-JP-Leda', name: '典雅女聲 Leda', gender: 'F', desc: '細膩婉約，適合茶道家、藝妓' },
    { id: 'ja-JP-Chirp3-HD-Pulcherrima', name: '細緻女聲 Pulcher', gender: 'F', desc: '辨識度極高，適合特定彩蛋' },
    { id: 'ja-JP-Chirp3-HD-Sulafat', name: '和藹女聲 Sulafat', gender: 'F', desc: '具長輩感，適合雜貨店婆婆' },
    { id: 'ja-JP-Chirp3-HD-Umbriel', name: '磁性女聲 Umbriel', gender: 'F', desc: '神祕感強，適合神祕人、間諜' },
    { id: 'ja-JP-Chirp3-HD-Vindemiatrix', name: '幹練女聲 Vindemi', gender: 'F', desc: '商務標準，適合首席乘務員' },
    { id: 'ja-JP-Chirp3-HD-Zephyr', name: '清透女聲 Zephyr', gender: 'F', desc: '如微風般自然，適合SPA、旅館' }
 ]
};

export const initialState = {
    trips: [],
    currentView: 'list',
    activeTripId: null
};

// 💡 預留一個空的行程結構，確保數據格式高度一致
export const TRIP_TEMPLATE = {
    name: "",
    city: "",
    companions: 1,
    days: [],
    createdAt: null
};

/** 🎨 系統色彩變數對位表 */
export const THEMES = {
    'land-green': { hex: '#4ade80', shadow: 'rgba(74, 222, 128, 0.2)', name: '大地綠' },
    'sky-blue':   { hex: '#38bdf8', shadow: 'rgba(56, 189, 248, 0.2)', name: '天空藍' },
    'lavender':   { hex: '#a78bfa', shadow: 'rgba(167, 139, 250, 0.2)', name: '薰衣紫' },
    'rose-pink':  { hex: '#fb7185', shadow: 'rgba(251, 113, 133, 0.2)', name: '玫瑰粉' },
    'sunset-orange': { hex: '#fb923c', shadow: 'rgba(251, 146, 60, 0.2)', name: '夕陽橙' },
    'moon-gray':  { hex: '#64748b', shadow: 'rgba(100, 116, 139, 0.2)', name: '月夜灰' }
};

/** ⚙️ CONFIG - 匯率模組配置 */
export const EXCHANGE_CONFIG = {
    BASE_CURRENCY: 'TWD', // 使用者母幣
    SUPPORTED_CURRENCIES: ['JPY', 'USD', 'KRW', 'EUR', 'CNY'],
    // API 備援路徑 (建議申請免費 API Key 填入)
    API_URL: 'https://open.er-api.com/v6/latest/' 
};

window.CONFIG = CONFIG;
