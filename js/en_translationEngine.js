/** 🧪 [en_translationEngine] 英美語語義對焦與學習發動機 - V2026.ULTRA */
import { CONFIG } from './config.js';
import { en_audioManager } from './en_audioManager.js'; // 🚀 導通英文聲學
import { uiManager } from './uiManager.js';
import { dbManager } from './dbManager.js';
import { en_translationView } from './en_translationView.js';

/** 🧪 [Private] 英美語專屬 Prompt 渲染庫 (V2026.ULTRA 穩壓版) */
const _promptTemplates = {

    // 📝 文法模組 (CEFR 難度對焦)
    grammar: (level, text) => `
你現在是 TravelFlow V2026.ULTRA 英語教學專家。
[任務]: 針對以下素材執行「文法解析」，為 [CEFR ${level}] 使用者產出學習燃料。

🚨 【難度導通協定】：
1. 數量：精確提取 3-5 個關鍵點。
2. 禁忌：嚴禁抄錄原文造句。
3. 數據定義：
   - point: 文法名稱 (中文)
   - level: "${level}"
   - meaning: 符合該難度的說明 (中文)
   - example: 符合 ${level} 難度的全新美語造句
   - trans: 例句的繁體中文翻譯

輸出格式：僅輸出純 JSON Array，嚴禁 Markdown 字元。`,

    // 📖 單字模組 (8 元組物理導通)
    vocab: (level, text) => `
你現在是 TravelFlow V2026.ULTRA 單字提取單元。
[任務]: 從段落提取 5-8 個符合 [CEFR ${level}] 難度的單字。

🚨 【8 元組嚴格校準】：
輸出必須為 JSON Array，每個元素為：
{
  "level": "${level}",
  "data": ["Word", "IPA", "POS", "Accent", "Variant", "Trans", "Example", "Example_Trans"]
}

🚨 【物理指標】：
- Index 1 (IPA): 必須含美式重音符號 ˈ。
- Index 3 (Accent): 說明重音位址 (如: Stress on 2nd syllable)。
- Index 4 (Variant): 標註美/英差異 (如: US: Color / UK: Colour)。

[One-Shot]:
{"level":"B1","data":["Schedule","ˈskɛdʒul","n.","Stress on 1st","UK: /ˈʃɛdjuːl/","行程/計畫","My schedule is full.","我的行程滿了"]}

輸出格式：純 JSON Array。`,

    // ❓ 測驗模組 (邏輯強對位)
    quiz: (level, text) => `
你現在是 TravelFlow 英語命題官。撰寫三題針對 [CEFR ${level}] 的測驗。

🚨 【協定】：
1. 答案一致性：answer 字串必須 100% 存在於 options 陣列中。
2. 情境遷移：重新構思一個商務或生活場景。
3. 輸出定義：question, options (4項), answer, analysis (中文), level: "${level}"

輸出格式：純 JSON Array。`,

    // 🎧 聽力練習 (聲學導通版)
    listening: (level, text) => `
你現在是 TravelFlow 聽力數據生產單元。
[任務]: 將素材改寫為 A/B 男女美式對話聽力考題。

🚨 【聲學導通】：
1. audioText 必須加入美式口語填充詞 (Um, like, you know) 以模擬真實語流。
2. variation 欄位為純淨美式對話文本 (標註角色)。
3. advice 包含聽力陷阱提示。

輸出格式：純 JSON Array。`
};

/** 🧬 [Private] EN-EDU 數據加工與物理分流器 (V2026.ULTRA) */
const _eduProcessors = {


/** 📖 英文單字處理 (8 元組寬頻對焦版) */
'單字': (item, cleanVal) => {
    // 🚀 1. 數據源降維：兼容 [Array] 與 {Object} 格式
    let src = item.data || item;
    const refined = {};

    // 🚀 2. 建立具名映射與索引映射 (物理雙軌導通)
    // 💡 職人診斷：確保 View 層與 Database 層都能以最高效率讀取
    const map = [
        ['word', 0],         // 0: Word
        ['reading', 1],      // 1: IPA
        ['pos', 2],          // 2: POS
        ['accent', 3],       // 3: Accent Note
        ['variant', 4],      // 4: US/UK Variant
        ['translation', 5],  // 5: Meaning (Trans)
        ['example', 6],      // 6: Example
        ['exTrans', 7]       // 7: Example Trans
    ];

    // 執行洗滌與精確對位
    map.forEach(([key, idx]) => {
        const val = cleanVal(src[String(idx)] || src[idx] || item[key] || "");
        refined[String(idx)] = val; // 資料庫索引軌道
        refined[key] = val;         // 視圖層語義軌道
    });

    // 🚀 3. 指紋固化
    refined.level = (item.level || src.level || 'B1').toUpperCase();
    refined.type = 'EN_VOCAB_8'; // 8 元組寬頻指紋
    refined.id = item.id || `en_v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    
    return refined;
},

/** 📝 英文文法處理 (V2026.ULTRA 結構對位版) */
'文法': (item, cleanVal) => {
    // 🚀 1. 物理脫殼與數據採樣
    const temp = { ...item };
    
    // 🚀 2. 聲學洗滌發動機 (Acoustic Sanitizer)
    // 💡 職人診斷：移除括號內容與 HTML 標籤，確保 TTS 播報時語流純淨，封殺重複讀音
    const cleanForSpeech = (t) => {
        return String(t || "").replace(/[\(（][^）\)]+[\)）]/g, '').replace(/<[^>]*>/g, '').trim();
    };

    // 🚀 3. 語義對焦與洗滌 (Purification)
    const rawPoint = cleanVal(temp.point || temp.title || "Grammar Focus");
    // 標題純化：移除末尾括號雜質
    temp.title = rawPoint.replace(/[\(（].*?[\)）]/g, '').trim();
    temp.point = temp.title;

    // 🚀 4. 例句雙軌焊接協定 (Alignment Matrix)
    // 對位日文版 jp/cn/jp_pure 邏輯 -> en/zh/en_pure
    const rawExample = cleanVal(temp.example || temp.例句 || "");
    const lastBracketIdx = Math.max(rawExample.lastIndexOf('('), rawExample.lastIndexOf('（'));

    if (lastBracketIdx !== -1) {
        const enPart = rawExample.substring(0, lastBracketIdx).trim();
        const zhPart = rawExample.substring(lastBracketIdx + 1).replace(/[\)）]/g, '').trim();
        
        temp.en = enPart;                 // 視覺軌道
        temp.en_pure = cleanForSpeech(enPart); // 聲學軌道：純淨美語
        temp.zh = zhPart;                 // 翻譯軌道
    } else {
        temp.en = rawExample;
        temp.en_pure = cleanForSpeech(rawExample);
        temp.zh = cleanVal(temp.trans || temp.translation || temp.meaning || "");
    }

    // 🚀 5. 等級主權與 ID 固化
    // 💡 職人診斷：強制對位 CEFR 指紋，並補齊唯一座標 ID 以利連鎖切除
    const rawLevel = item.level || temp.level || 'B1';
    temp.level = String(rawLevel).trim().toUpperCase();
    temp.id = item.id || `en_g_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    temp.type = 'EN_GRAMMAR';

    // 物理清理：移除原始冗餘欄位
    delete temp.example;
    delete temp.例句;
    delete temp.trans;

    return temp;
},

/** 📝 英文測驗處理 (V2026.ULTRA 邏輯強對位版) */
'測驗': (item, cleanVal) => {
    // 🚀 1. 物理洗滌選項軌道
    const options = Array.isArray(item.options) ? item.options.map(o => cleanVal(o)) : [];
    
    // 🚀 2. 執行 [Answer-Index] 精密校準發動機
    const calculateAnswerIndex = () => {
        // A. 優先權 1：若已有明確索引數字，直接導通
        if (typeof item.answerIndex === 'number' && item.answerIndex >= 0) return item.answerIndex;
        
        // B. 優先權 2：字串模糊焊接判定
        const rawAnswer = cleanVal(item.answer || "").toLowerCase();
        if (!rawAnswer) return 0;

        // 💡 職人診斷：處理 AI 可能噴出的各種變體格式
        // 移除常見干擾：A), (A), A., 空格
        const cleanAnswer = rawAnswer.replace(/^[(]?[a-d][)]?[:.]?\s*/i, '').trim();

        // 執行路網比對：優先找 100% 命中，失敗則找「包含」關係
        let matchIdx = options.findIndex(o => cleanVal(o).toLowerCase() === cleanAnswer);
        
        if (matchIdx === -1) {
            // 降級搜索：若選項包含答案（例如選項是 "The schedule"，答案是 "schedule"）
            matchIdx = options.findIndex(o => cleanVal(o).toLowerCase().includes(cleanAnswer));
        }

        // C. 優先權 3：若為 A/B/C/D 單字元指紋，直接轉化為索引
        if (matchIdx === -1 && /^[a-d]$/i.test(cleanAnswer)) {
            matchIdx = cleanAnswer.charCodeAt(0) - 97; // a=0, b=1...
        }

        return matchIdx !== -1 ? matchIdx : 0; // 最終 Fallback 至首項
    };

    // 🚀 3. 數據實體固化
    return {
        id: item.id || `en_q_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
        question: cleanVal(item.question || ""),
        options: options,
        answerIndex: calculateAnswerIndex(), // ⚡ 自動焊接計算結果
        explanation: cleanVal(item.analysis || item.explanation || item.advice || ""),
        level: (item.level || 'B1').toUpperCase(),
        type: 'EN_QUIZ',
        timestamp: Date.now()
    };
},

/** * 🎧 英文聽力處理 (V2026.ULTRA 聲學與路網對焦版) */
    '聽力': (item, cleanVal) => {
        // 🚀 1. 物理導通：提取播報靈魂 (Audio Payload)
        const finalAudio = cleanVal(item.audioText || item.en || item.question || "");
        
        // 🚀 2. 數據洗滌：處理選項與建議 (Options & Advice)
        const finalOptions = Array.isArray(item.options) ? item.options.map(cleanVal) : [];
        const finalAdvice = cleanVal(item.advice || item.analysis || item.explanation || "");

        // 🛡️ 熔斷檢查：若無音軌文本且無顯示文本，視為損毀燃料
        if (!finalAudio && !item.variation) return null;

        // 🚀 3. 核心焊接：完全對位日文版 pacing/audioText/variation 協定
        return {
            id: item.id || `en_l_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
            
            // 💡 職人對焦：pacing 負責提問內容 (例如: What is the main idea?)
            pacing: cleanVal(item.pacing || item.question || "Listen to the conversation:"),
            
            // 💡 職人對焦：audioText 負責讀出的內容 (含填充詞)
            audioText: finalAudio,
            
            // 💡 職人對焦：variation 負責給人類看的視覺純淨文本
            variation: cleanVal(item.variation || item.en || finalAudio),
            
            options: finalOptions,
            answer: cleanVal(item.answer || ""),
            
            // 🚀 雙軌導通：cn 作為渲染主供油管，advice 作為聽力模組私有油管
            cn: finalAdvice, 
            advice: finalAdvice,
            
            // 聲學指紋補強
            role: cleanVal(item.role || "A"),
            accent: cleanVal(item.accent || "US"),
            ipa: cleanVal(item.ipa || item.phonetic || ""),
            
            level: (item.level || 'B1').toUpperCase(),
            type: 'EN_LISTENING',
            timestamp: Date.now()
        };
    },

// 🎯 軌道 E：英文會話 (V2026.ULTRA 英美劇場生產線)
    '會話': (item, cleanVal) => {
        /**
         * 物理作用：洗滌由 AI 劇場模式產出的英文對話 JSON
         * 輸入格式預期：["Speaker: English content", "中文翻譯"] 
         * 或物件格式：{ en: "...", zh: "..." }
         */
        
        // 🚀 1. 數據格式歸一化 (多態感應)
        let rawEN = "";
        let rawZH = "";

        if (Array.isArray(item)) {
            rawEN = item[0] || "";
            rawZH = item[1] || "";
        } else if (typeof item === 'object') {
            // 💡 職人診斷：對焦英文 Key (en/zh) 與通用 Key (q/a)
            rawEN = item.en || item.q || item.original || "";
            rawZH = item.zh || item.a || item.translation || "";
        }

        // 🚀 2. 物理洗滌：封殺 Markdown 標籤與隱形成本
        // 💡 針對英文：保留標點符號，但移除 AI 可能產出的裝飾字元
        const cleanEN = cleanVal(rawEN).replace(/[*_#`]/g, '');
        const cleanZH = cleanVal(rawZH).replace(/[*_#`]/g, '');

        // 🛡️ 熔斷檢查：若無原文內容則不予固化，確保磁區純淨
        if (!cleanEN) return null; 

        // 🚀 3. 封裝為標準 2 元組 segments 格式
        // 💡 職人協定：對位 en_translationView._renderDialogueSession 的渲染格式
        // [ "Speaker: Sentence", "中文翻譯" ]
        return [cleanEN, cleanZH];
    }
};


export const en_translationEngine = {

// 🚀 1. 學習磁軌狀態
    lockedCategory: 'AUTO',

    /** 🔖 Tag Lock Protocol: 鎖定學習分區 */
    lockCategory(tag) {
        this.lockedCategory = tag;
        console.log(`🎯 [Tag-Lock] Study track locked to: ${tag}`);
        
        this._updateQuickTabsUI(tag);
        
        uiManager.showToast('🏷️', `Locked to: ${tag}`);
        if (navigator.vibrate) navigator.vibrate(10);
    },

    /** 🎨 UI Sync: 更新學習標籤高亮 (藍色系協定) */
    _updateQuickTabsUI(activeTag) {
        const container = document.getElementById('quick-category-track');
        if (!container) return;

        const buttons = container.querySelectorAll('button');
        buttons.forEach(btn => {
            const isHit = btn.innerText.includes(activeTag.toUpperCase());
            if (isHit) {
                btn.classList.replace('bg-white', 'bg-blue-600');
                btn.classList.replace('text-slate-400', 'text-white');
                btn.classList.replace('border-slate-100', 'border-transparent');
                btn.classList.add('shadow-lg', 'scale-105');
            } else {
                btn.className = "shrink-0 px-5 py-2 rounded-full text-[10px] font-black border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm snap-center active:scale-90";
            }
        });
    },

    
/** 🚀 物理脫殼解析器：英美語學習版 (V2026.ULTRA.FINAL_FIX) */
parseFuel(rawText) {
if (!rawText) return [];
console.log("📡 [EN-Refinery] 啟動英美語數據純化與燃料導通...");

// 🚀 1. 物理預洗：掃除 Markdown 代碼塊與隱形雜質
const sanitizedInput = String(rawText)
    .replace(/```(?:json)?/g, '')
    .replace(/```/g, '')
    .replace(/[\u200B-\u200D\uFEFF]/g, '')
    .trim();

// 🚀 2. 核心焊接：精密標籤感應
// 💡 職人修正：使用 [^\]]+ 確保匹配到第一個閉合括號就停止
// 物理特性：支持跨行、封殺粘連，確保 [原文] 與 [翻譯] 絕對隔離。
const pattern = /\[([^\]]+)\]/g;
const refinedFuel = [];

let match;
while ((match = pattern.exec(sanitizedInput)) !== null) {
    const content = match[1].trim();
    if (content) refinedFuel.push(content);
}

// 🚀 3. 數據自癒：降級軌道
// 💡 熔斷備援：若 AI 忘記加中括號，強制執行按行切分以回收數據。
if (refinedFuel.length === 0) {
    console.warn("⚠️ [Fuel-Void] 標籤感應斷路，啟動行分割備援...");
    return sanitizedInput.split(/\n+/)
        .map(line => line.trim())
        .filter(line => line.length > 2);
}

// 🚀 4. 終極洗滌：移除標題引導字與 Markdown 標記
return refinedFuel.map(text => {
    return text
        .replace(/^(Original|Translation|原文|翻譯|EN|ZH|JP|US|GB)\s*[:：]\s*/i, '') 
        .replace(/[*_#`]/g, '') 
        .trim();
});

},

/** 🧪 [Private] 數據加工廠：真值透傳與等級主權對焦 (V2026.ULTRA.EN_LEVEL_FIX) */
_processNewFuel(fuelBatch, tabName) {
    const processor = _eduProcessors[tabName];
    if (typeof processor !== 'function') return fuelBatch;
    
    // 🚀 1. 核心洗滌：封殺字串型毒素 (防止 undefined/null 變成字串進入資料庫)
    const cleanVal = (v) => {
        if (v === undefined || v === null) return "";
        const s = String(v).trim();
        return (s === 'undefined' || s === 'null') ? "" : s;
    };
    
    return fuelBatch
        .filter(item => item !== null && typeof item === 'object')
        .map(item => {
            // 🚀 2. 預提取原始能階指紋 (能階主權預存)
            // 💡 職人診斷：同時感應 level, tier, 級別等多種 AI 可能噴發的屬性名
            const sourceLevel = item.level || item.tier || item.級別 || item.data?.level;

            // 🚀 3. 執行實體處理器加工 (轉換為 V2026 內部 8 元組結構)
            const processed = processor(item, cleanVal);
            
            // 🛡️ 熔斷保護
            if (!processed) return null;

            // 🚀 4. 等級主權導通 (Sovereignty Conduction)
            // 💡 優先序：1. 原始輸入等級 > 2. 處理器預設等級 > 3. 系統底層熔斷等級 (B1)
            // 這能確保當你注入一張標記為 "C1" 的卡片時，不會被加工廠強制重置回 "B1"
            let finalLevel = sourceLevel || processed.level || "B1";
            
            // 物理純化：強制轉大寫並過濾非 CEFR 標籤
            finalLevel = String(finalLevel).trim().toUpperCase();
            if (!['A1','A2','B1','B2','C1','C2'].includes(finalLevel)) {
                finalLevel = 'B1'; // 格式錯誤時的安全回退
            }
            processed.level = finalLevel;

            // 🚀 5. 屬性自癒：針對單字(8元組)的具名屬性補強
            if (tabName === '單字' && !processed.word) {
                processed.word = processed["0"] || "";
            }

            return processed;
        })
        .filter(Boolean);
},

/** ⌨️ 執行文字翻譯/學習邏輯 (V2026.ULTRA 標籤感應固化版) */
async executeTextTranslate() {
    const input = document.getElementById('text-translate-input');
    const text = input?.value.trim();
    const ttsEl = document.getElementById('tts-target');
    
    if (!text) return uiManager.showToast('⚠️', "Please enter content");

    // 🚀 1. 介面點火
    document.getElementById('realtime-result-area')?.classList.remove('hidden');
    const sttEl = document.getElementById('stt-original');
    if (sttEl) sttEl.innerText = `Original Input: ${text}`;
    
    if (ttsEl) {
        ttsEl.innerText = "Linguistic Focusing...";
        ttsEl.classList.add('animate-pulse');
    }

    try {
        // 🚀 2. 語義對焦：執行英美語專屬翻譯管線
        const translated = await this._executeTranslation(text); 
        
        // 🚀 3. 標籤指紋對位 (V2026.ULTRA 核心補強)
        // 💡 職人診斷：感應目前的 Tags 鎖定狀態，若為 AUTO 則歸類為 General (一般)
        const targetCategory = (this.lockedCategory === 'AUTO' || this.lockedCategory === '自動') 
                               ? 'General' 
                               : this.lockedCategory;

        // 🚀 4. 數據固化焊接
        if (dbManager) {
            const record = {
                id: `txt_en_${Date.now()}`, // 增加 en 標籤便於物理識別
                type: 'text',
                lang: 'EN',               // 🔐 關鍵 DNA：鎖定英文軌道
                category: targetCategory,  // 🏷️ 注入鎖定的標籤指紋
                原文: text,
                翻譯: translated,
                timestamp: Date.now()
            };
            
            // 執行物理寫入，採非阻塞式回饋
            dbManager.put(dbManager.STORES.TRANS_VAULT, record)
                .then(() => console.log(`💾 [EN-Solidified] Study record saved to: ${targetCategory}`))
                .catch(e => console.error("❌ [EN-Save-Fail]", e));
        }

        // 5. 數據熱更新
        if (ttsEl) {
            ttsEl.innerText = translated;
            ttsEl.classList.remove('animate-pulse');
        }
        
        // 🚀 6. 聲學噴發：導通英文專用發動機
        if (window.en_audioManager) {
            window.en_audioManager.speak(translated);
        }
        
        input.blur();
        if (navigator.vibrate) navigator.vibrate(10);
        
    } catch (err) {
        console.error("❌ [EN-Translate-Collapse]:", err);
        if (ttsEl) {
            ttsEl.innerText = "Linguistic link failed";
            ttsEl.classList.remove('animate-pulse');
        }
        uiManager.showToast('📡', "Translation link failed");
    }
},

/** 🚀 [App] 語義轉運站：英美語學習 Prompt 注入 (V2026.ULTRA 指令對焦版) */
copyPromptWithContent() {
    const content = document.getElementById('text-translate-input')?.value.trim();
    
    // 🛡️ 數據防禦：對位 uiManager
    if (!content) return uiManager.showToast('⚠️', "Please paste content first");
    
    // 🚀 核心對焦：比照日文職人模式，加入「去雜質」硬熔斷指令
    const fullPrompt = `你現在是 TravelFlow 英語教學專家。
請針對以下內容生成適合「口語學習」的翻譯（美式口語）。

**🎙️ 聲學播報優化協定：**
1. **意群斷句**：在英文長句中，請在「意群 (Thought Groups)」處主動加入「,」。
2. **段落分明**：確保原文與翻譯成對輸出。
3. **去雜質**：嚴禁輸出任何解釋、標題、前言、結語或中括號/小括號外的任何冗餘字元。

**📋 輸出格式預覽：**
[原文1] (含呼吸標點的英文)
[翻譯1] (繁體中文)

**待處理內容：**
${content}`;

    // 執行物理複製：確保導通與震動回饋同步
    navigator.clipboard.writeText(fullPrompt)
        .then(() => {
            uiManager.showToast('🪄', "EN-Acoustic Prompt Copied");
            if (navigator.vibrate) navigator.vibrate(20);
        })
        .catch(err => {
            console.error("❌ [Clipboard-Error]", err);
            uiManager.showToast('❌', "Copy track failed");
        });
},


/** 📥 [Advanced Injection] 燃料生產：英美語四情境感應版 (V2026.ULTRA.FIXED) */
async injectFuelFromClipboard() {
    try {
        // 🚀 1. 物理獲取與初步洗滌
        await new Promise(r => setTimeout(r, 100));
        const text = await navigator.clipboard.readText();
        if (!text) return uiManager.showToast('⚠️', "Clipboard is empty");

        // 🚀 2. 物理脫殼解析
        const cleanLines = this.parseFuel(text);
        if (cleanLines.length < 2) return uiManager.showToast('⚠️', "Insufficient fuel density");

        // 🚀 3. 數據對位封裝 (Tuple Mapping)
        const segmentsTuple = [];
        for (let i = 0; i < cleanLines.length; i += 2) {
            const q = cleanLines[i];
            const a = cleanLines[i + 1];
            if (q && a) segmentsTuple.push([q, a]); 
        }

        // 🚀 4. 語境感測：偵測 Lyrics, Tech, News 或 Article
        let targetCategory = (this.lockedCategory === 'AUTO' || this.lockedCategory === '自動') ? 'AUTO' : this.lockedCategory;
        if (targetCategory === 'AUTO') {
            const sample = text.toLowerCase();
            const isLyrics = /love|heart|baby|ooh|yeah|night|dream|tonight/i.test(sample) || text.includes('[00:');
            const isTech = /function|const|api|endpoint|error|fix|module|export|import/i.test(sample);
            const isNews = /reported|said|stated|official|market|percent|according to/i.test(sample);

            if (isLyrics) targetCategory = 'Lyrics';
            else if (isTech) targetCategory = 'Tech';
            else if (isNews) targetCategory = 'News';
            else targetCategory = 'Article';
        }

        // 🚀 5. 文章燃料包固化
        const articlePackage = {
            id: `art_en_${Date.now()}`,
            type: 'article_package',
            title: cleanLines[0].substring(0, 25).replace(/[\[\]]/g, ''),
            lang: 'EN',
            category: targetCategory,
            segments: segmentsTuple,
            timestamp: Date.now()
        };

        // 🚀 6. 實體固化至磁區 (TRANS_VAULT)
        if (dbManager) {
            await dbManager.put(dbManager.STORES.TRANS_VAULT, articlePackage);
            console.log(`💾 [EN-Package-Solidified] Category: ${targetCategory}`);
        }

        // 🚀 7. 視圖重連與路網刷新 (CRITICAL FIX: DOM 實體化守衛)
        // 💡 職人協定：使用雙重 RAF 確保瀏覽器已完成重繪 (Repaint)
        const refreshUI = () => {
            requestAnimationFrame(() => {
                requestAnimationFrame(async () => {
                    if (typeof this.loadLiveHistory === 'function') {
                        const filterTag = (targetCategory === 'AUTO') ? '全部' : targetCategory;
                        await this.loadLiveHistory(filterTag);
                        
                        // 視覺對焦補償：自動捲動到新注入的燃料位置
                        const newPkg = document.getElementById(`pkg-${articlePackage.id}`);
                        if (newPkg) newPkg.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                });
            });
        };

        // 執行標籤自動校準與 UI 導通
        if (this.currentMode !== 'filter') {
            // 若不在歷史模式，先切換模式觸發 DOM 生成
            this.switchRealtimeMode('filter');
            refreshUI();
        } else {
            refreshUI();
        }

        uiManager.showToast('🎯', `Imported [${targetCategory}] package`);
        if (navigator.vibrate) navigator.vibrate([10, 30]);

    } catch (err) {
        console.error("❌ [EN-Fuel-Injection-Collapse]:", err);
        uiManager.showToast('❌', "Production relay failed");
    }
},
    /** 🚀 [Core] 語義翻譯發動機：英美語專用傳輸軌道 */
    async _executeTranslation(text) {
        if (!text || text.trim() === "") return "";
        const endpoint = CONFIG?.API_ENDPOINT;
        const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;

        try {
            const response = await fetch(`${cleanEndpoint}/translate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: text,
                    source: 'zh-TW',
                    target: 'en-US', // 🚀 鎖定英美語目標
                    protocol: 'AMERICAN_LEARNING_CENTER'
                })
            });
            const result = await response.json();
            return result.translatedText || result.text || text;
        } catch (err) {
            return `[Error] ${text}`;
        }
    },

/** 🚀 [Entry] 增量教材投射發動機：英美語寬頻版 (V2026.ULTRA.FIXED) */
async injectEduFuel(itemId, tabName) {
    const input = document.getElementById(`edu-fuel-input-${itemId}`);
    let rawJson = input?.value.trim();
    if (!rawJson) return uiManager.showToast('⚠️', "Empty fuel segment");

    console.log(`📡 [EN-Injection-Ignition] 標籤: ${tabName} | 執行數據投射...`);

    try {
        // 🚀 1. 物理脫殼：解析 JSON 並執行結構自癒
        // 💡 職人診斷：移除 Markdown 標籤，並確保解析後為陣列軌道
        let fuelBatch;
        const sanitized = rawJson.replace(/```json|```/g, '').trim();
        try {
            fuelBatch = JSON.parse(sanitized);
        } catch (e) {
            throw new Error("JSON_PARSE_FAILED");
        }
        if (!Array.isArray(fuelBatch)) fuelBatch = [fuelBatch];

        // 🚀 2. 磁區與軌道定位
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        if (!record) throw new Error("VAULT_RECORD_MISSING");

        const keyMap = { 
            '單字': 'edu_vocab', 
            '文法': 'edu_grammar', 
            '測驗': 'edu_quiz', 
            '聽力': 'edu_listening' 
        };
        const storageKey = keyMap[tabName];
        if (!storageKey) throw new Error(`INVALID_TAB_IDENTIFIER: ${tabName}`);

        // 🚀 3. 數據洗滌加工 (核心對焦)
        // 💡 職人協定：調用剛焊接好的 _processNewFuel 執行等級主權導通與純化
        const processed = this._processNewFuel(fuelBatch, tabName);
        if (processed.length === 0) throw new Error("NO_VALID_FUEL_YIELD");

        // 🚀 4. 排重感應與物理焊接 (V2026 補強)
        // 💡 職人診斷：獲取舊磁區數據進行比對，封殺重複注入
        const oldFuel = Array.isArray(record[storageKey]) ? record[storageKey] : [];
        
        // 調用排重感應器 (若尚未定義則執行基礎過濾)
        const freshItems = this._filterDuplicateFuel 
            ? this._filterDuplicateFuel(processed, oldFuel, tabName)
            : processed;

        if (freshItems.length === 0) {
            return uiManager.showToast('ℹ️', "Duplicate fuel intercepted");
        }

        // 🚀 5. 實體固化：執行增量固化並更新時間戳
        record[storageKey] = [...oldFuel, ...freshItems];
        record.lastModified = Date.now();
        await dbManager.put(dbManager.STORES.TRANS_VAULT, record);
        
        // 🚀 6. 影子投射協定 (SRS Shadow Projection)
        // 💡 職人診斷：僅單字軌道導通影子磁區，啟動能階演進
        if (tabName === '單字') {
            await this._projectToSRSShadow(itemId, freshItems, tabName);
        }

        // 🚀 7. 資源回收與 UI 熱更新
        uiManager.showToast('✨', `Injected ${freshItems.length} items [${tabName}]`);
        input.value = ""; // 清空輸入緩衝區
        
        // 執行分頁自癒渲染 (對位 en_translationEngine 的分頁邏輯)
        if (typeof this.switchArticleTab === 'function') {
            await this.switchArticleTab(itemId, tabName);
        }

        // 物理震動回饋
        if (navigator.vibrate) navigator.vibrate([10, 30]);

    } catch (err) {
        console.error("❌ [EN-Inject-Collapse]:", err);
        uiManager.showToast('⚠️', "Data link failed: " + err.message);
    }
},

/** 🧪 [Private] 排重感應器：物理比對與英美語語義主權校準 (V2026.ULTRA.FINAL) */
_filterDuplicateFuel(processedFuel, oldFuel, tabName) {
    if (!oldFuel || oldFuel.length === 0) return processedFuel;

    console.log(`📡 [EN-Duplicate-Sensing] 啟動多維度掃描: ${tabName}`);

    return processedFuel.filter(newItem => {
        const isDuplicate = oldFuel.some(old => {
            try {
                // 🚀 1. 能階主權歸一化 (確保 'b1' === 'B1')
                const getLvl = (item) => String(item.level || "B1").trim().toUpperCase();
                const oldLvl = getLvl(old);
                const newLvl = getLvl(newItem);

                // 🚀 2. 執行分流判定協定
                switch(tabName) {
                    case '單字': {
                        // 💡 職人協定：執行 [拼寫 + 音標 + 能階] 三位元組焊接判定
                        // 理由：允許同一個字在不同 CEFR 等級（難度例句不同）或不同發音時重複存在
                        const oldW = String(old.word || old["0"] || "").trim().toLowerCase();
                        const newW = String(newItem.word || newItem["0"] || "").trim().toLowerCase();
                        const oldR = String(old.reading || old.phonetic || old["1"] || "").trim();
                        const newR = String(newItem.reading || newItem.phonetic || newItem["1"] || "").trim();
                        
                        return oldW === newW && oldR === newR && oldLvl === newLvl;
                    }

                    case '文法': {
                        // 比對文法點名稱與能階指紋
                        const oldP = String(old.point || old.title || "").trim().toLowerCase();
                        const newP = String(newItem.point || newItem.title || "").trim().toLowerCase();
                        return oldP === newP && oldLvl === newLvl;
                    }

                    case '測驗': {
                        // 題目文字 100% 相同即視為重複 (物理屏蔽)
                        const oldQ = String(old.question || "").trim();
                        const newQ = String(newItem.question || "").trim();
                        return oldQ === newQ;
                    }

                    case '聽力': {
                        // 比對音軌文本的雙重指紋，確保對話內容不重疊
                        const oldA = String(old.audioText || old.variation || "").trim();
                        const newA = String(newItem.audioText || newItem.variation || "").trim();
                        return oldA === newA;
                    }

                    default:
                        return false;
                }
            } catch (e) { 
                console.error("⚠️ [EN-Duplicate-Check-Glitch]", e);
                return false; 
            }
        });

        // 🔍 [Debug-Trace] 若偵測到碰撞，於主控台噴發警告
        if (isDuplicate) {
            const identifier = newItem.word || newItem.point || newItem.question || "Unknown Item";
            console.warn(`🛡️ [Duplicate-Interceptor] 物理屏蔽重複燃料: [${identifier}]`);
        }

        return !isDuplicate;
    });
},


/** 🧠 [Private] 影子投射：執行 SRS 能階協定與進度繼承 (V2026.ULTRA.EN_FIXED) */
async _projectToSRSShadow(itemId, freshItems, tabName) {
    // 🚀 1. 物理熔斷：僅「單字」軌道進入 SRS 特訓磁區
    if (tabName !== '單字') return;

    try {
        // 🚀 2. 全量提領影子磁區快照 (以執行進度回溯)
        const allShadows = await dbManager.getAll(dbManager.STORES.SRS_META);
        const shadowMap = new Map(allShadows.map(s => [s.id, s]));

        const shadowPayloads = freshItems.map((item, idx) => {
            // 🚀 3. ID 穩定性焊接 (Stable ID)
            // 💡 職人診斷：優先保留 item.id，若無則以 parentId + index 建立物理座標
            // 這樣在「編輯存檔」時，生成的 ID 會保持一致，封殺重複投影。
            const shadowId = item.id || `${itemId}_en_v_${idx}`;
            
            // 🚀 4. 進度繼承協定 (Progress Inheritance)
            // 💡 若該 ID 已存在於磁區，回溯其 Stage 指紋；若無則初始化為 Stage 0
            const existingNode = shadowMap.get(shadowId);
            const currentStage = existingNode ? existingNode.stage : 0;
            const nextReview = existingNode ? existingNode.nextReview : Date.now();

            // 🚀 5. 格式化指紋數據 (對位 V2026.ULTRA 8元組規範)
            const fingerprint = this._formatToShadowFingerprint ? this._formatToShadowFingerprint(item) : {};

            return {
                ...fingerprint,
                id: shadowId,
                parentId: itemId,
                word: String(item.word || item["0"] || "Unknown").trim(),
                phonetic: String(item.reading || item.phonetic || item["1"] || "").trim(),
                level: (item.level || 'B1').toUpperCase(),
                stage: currentStage,      // 🔐 核心焊接：繼承記憶能階
                nextReview: nextReview,   // 🔐 核心焊接：保留冷卻座標
                type: 'EN_VOCAB_8',
                timestamp: Date.now()
            };
        });

        // 🛡️ 數據合法性預檢：過濾掉 undefined ID 節點
        const validPayloads = shadowPayloads.filter(p => p.id && !p.id.includes('undefined'));
        if (validPayloads.length === 0) return;

        // 🚀 6. 物理固化：執行批量寫入 (Atomic Batch Put)
        await dbManager.batchPut(dbManager.STORES.SRS_META, validPayloads);
        
        console.log(`📡 [EN-Shadow-Sync] Solidified ${validPayloads.length} nodes. Stability Check: PASS.`);
        if (window.debugConsole) {
            window.debugConsole.log(`[SRS-Projection] ID: ${validPayloads[0].id} | Inherited Stage: ${validPayloads[0].stage}`);
        }

    } catch (err) {
        console.error("❌ [EN-Shadow-Projection-Collapse]:", err);
        uiManager.showToast('⚠️', "SRS shadow projection failed");
    }
},


/** ↔️ [Mode-Router] 分頁切換發動機：英美語全鏈路版 (V2026.ULTRA.FIXED) */
async switchArticleTab(packageId, tabName, tier = 'ALL', page = 1) {
    console.log(`📡 [EN-Tab-Router] Package: ${packageId} | Target: ${tabName} | Tier: ${tier}`);
    
    // 🚀 1. 定位 DOM 元件
    const container = document.getElementById(`package-content-${packageId}`);
    const tabs = document.querySelectorAll(`[data-pkg="${packageId}"]`);
    if (!container) return;

    try {
        // 🚀 2. 磁區預讀與語義對焦
        const pkg = await dbManager.get(dbManager.STORES.TRANS_VAULT, packageId);
        if (!pkg) throw new Error("VAULT_LINK_BROKEN");

        // 🚀 3. UI 狀態同步：執行 Tab 視覺點亮 (鎖定深色職人美感)
        tabs.forEach(tab => {
            const isActive = tab.getAttribute('data-tab') === tabName;
            tab.className = isActive 
                ? "flex-1 py-3 text-[10px] font-black rounded-xl bg-slate-900 text-white shadow-md transition-all scale-[1.02]"
                : "flex-1 py-3 text-[10px] font-black rounded-xl bg-slate-50 text-slate-400 hover:bg-slate-100 transition-all";
        });

        // 🚀 4. 數據分流協定 (Traffic Control)
        const eduTabs = ['單字', '文法', '測驗', '聽力'];

        if (eduTabs.includes(tabName)) {
            // 💡 職人焊接：教材軌道強制導向「分頁發動機」，處理過濾與翻頁
            return await this.switchEduPage(tabName, packageId, tier, page);
        }

        // 🚀 5. 基礎軌道渲染 (原文/音標)
        let html = "";
        if (tabName === '原文') {
            html = this._renderPrimaryText(pkg.segments, false);
        } else if (tabName === '音標') {
            // 💡 職人診斷：IPA 模式前置準備磁區索引
            if (pkg.edu_vocab) this._prepareIPAMap(pkg.edu_vocab);
            html = this._renderPrimaryText(pkg.segments, true);
        }

        // 🚀 6. 物理投射與資源鎖定
        container.innerHTML = html;
        
        // 觸發細膩的進入動畫
        container.classList.remove('animate-fade-in');
        void container.offsetWidth; // 物理重啟動畫軌道
        container.classList.add('animate-fade-in');

        // 🚀 7. 記憶狀態固化：確保摺疊後重啟能恢復分頁
        if (!this.currentActiveTabs) this.currentActiveTabs = {};
        this.currentActiveTabs[packageId] = tabName;

        if (navigator.vibrate) navigator.vibrate(5);

    } catch (err) {
        console.error("❌ [EN-Tab-Collapse]:", err);
        uiManager.showToast('⚠️', "Data link failed");
    }
},

/** 🧠 [Quiz-Logic] 英文測驗答題判定發動機 (V2026.ULTRA.EN) */
    checkQuizAnswer(btn, selectedIdx, correctIdx, itemId, quizIdx) {
        // 🚀 1. 物理定位與導通預檢
        const card = btn.closest('.quiz-card');
        const analysis = document.getElementById(`quiz-ans-${itemId}-${quizIdx}`);
        if (!card || !analysis) return;

        // 🚀 2. 磁區重置 (清除該題所有選項的舊狀態)
        const allOpts = card.querySelectorAll('button');
        allOpts.forEach(opt => {
            opt.disabled = true; // 封殺重複點擊
            opt.classList.remove('bg-blue-600', 'text-white', 'bg-emerald-500', 'bg-rose-500');
            opt.classList.add('opacity-50', 'bg-slate-50', 'text-slate-400');
        });

        // 🚀 3. 執行語義對焦判定
        const isCorrect = (selectedIdx === correctIdx);
        
        // 🚀 4. 點亮反饋效果 (視覺主權對位)
        if (isCorrect) {
            // 🎯 正確路徑：點亮職人綠
            btn.classList.remove('opacity-50', 'text-slate-400');
            btn.classList.add('bg-emerald-500', 'text-white', 'shadow-lg', 'shadow-emerald-100');
            uiManager.showToast('✨', 'Correct! Excellent linguistic focus.');
            if (navigator.vibrate) navigator.vibrate([10, 30]);
        } else {
            // 🎯 錯誤路徑：點亮警示紅，並主動提示正確答案
            btn.classList.remove('opacity-50', 'text-slate-400');
            btn.classList.add('bg-rose-500', 'text-white');
            
            // 💡 職人補償：自動標註正確選項以消除資訊不對稱
            if (allOpts[correctIdx]) {
                allOpts[correctIdx].classList.remove('opacity-50', 'text-slate-400');
                allOpts[correctIdx].classList.add('bg-emerald-500', 'text-white', 'ring-4', 'ring-emerald-50');
            }
            uiManager.showToast('💡', 'Incorrect. Review the analysis below.');
            if (navigator.vibrate) navigator.vibrate(50);
        }

        // 🚀 5. 自動導通詳解磁區
        analysis.classList.remove('hidden');
        
        // 視覺捲動對焦
        setTimeout(() => {
            analysis.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);

        console.log(`🏁 [EN-Quiz-Result] Item: ${itemId} | Result: ${isCorrect ? 'PASS' : 'FAIL'}`);
    },

/** 🛰️ [Pagination-Router] 教材分頁與能階導航器 (V2026.ULTRA.FIXED) */
async switchEduPage(type, itemId, tier = 'ALL', page = 1) {
    // 🚀 1. 語義標籤歸一化：確保 type 符合 8-Tuple 磁軌定義
    // 💡 職人診斷：UI 傳入可能是 '單字' 或 'VOCAB'，強制歸一化為大寫英文
    const tabMap = { '單字': 'VOCAB', '文法': 'GRAMMAR', '測驗': 'QUIZ', '聽力': 'LISTENING' };
    const normalizedType = tabMap[type] || String(type).toUpperCase().trim();

    console.log(`📡 [EN-Page-Router] 執行分流翻頁: ${normalizedType} | Page: ${page} | Tier: ${tier}`);
    
    try {
        // 🚀 2. 物理磁區採樣
        const pkg = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        if (!pkg) throw new Error("DATA_LINK_BROKEN");

        // 🚀 3. 數據軌道對焦：將 UI 標籤映射至磁區 Key 值
        const storageMap = { 'VOCAB': 'edu_vocab', 'GRAMMAR': 'edu_grammar', 'QUIZ': 'edu_quiz', 'LISTENING': 'edu_listening' };
        const storageKey = storageMap[normalizedType];
        let eduData = pkg[storageKey] || [];

        // 🚀 4. 物理洗滌與能階過濾 (Tier Filtering)
        // 若指定了特定 CEFR 能階，則在此執行過濾熔斷
        if (tier !== 'ALL' && tier !== '全部') {
            eduData = eduData.filter(item => (item.level || item.tier || 'B1').toUpperCase() === tier.toUpperCase());
        }

        // 🚀 5. 視圖重連與封裝渲染 (CRITICAL FIX: 命名空間對齊)
        // 💡 職人協定：對位 en_translationView 物件
        if (window.en_translationView && typeof window.en_translationView._renderEduTabWrapper === 'function') {
            
            // 呼叫英文版視圖引擎的 Wrapper 生成完整 HTML (含能階 Tabs 與分頁器)
            const fullHtml = window.en_translationView._renderEduTabWrapper(itemId, normalizedType, eduData, tier, page);
            
            // 物理投射至文章包內容磁區
            const container = document.getElementById(`tab-content-${itemId}`);
            if (container) {
                container.innerHTML = fullHtml;
                
                // 物理捲動補償：讓視線回到教材起始點
                const pkgElement = document.getElementById(`pkg-${itemId}`);
                if (pkgElement) {
                    pkgElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        } else {
            console.error("❌ [EN-View-Relay-Collapse] en_translationView 未導通");
            uiManager.showToast('⚠️', "View component offline");
        }
        
        // 🚀 6. 觸覺反饋
        if (navigator.vibrate) navigator.vibrate(8);

    } catch (err) {
        console.error("❌ [EN-Page-Switch-Collapse]:", err);
        uiManager.showToast('⚠️', "Page navigation failed");
    }
},


/** 🧬 [Private] 渲染基礎文本 (含音標導通開關) */
_renderPrimaryText(segments, showIPA) {
    return segments.map(([en, zh]) => `
        <div class="mb-6 space-y-2 group">
            <div class="space-y-1">
                <p class="text-[1.1rem] font-medium text-slate-800 leading-relaxed selection:bg-blue-100">${en}</p>
                ${showIPA ? `<p class="text-[0.8rem] font-mono text-blue-500 opacity-80">/${this._getIPAShadow(en)}/</p>` : ''}
            </div>
            <p class="text-[0.9rem] text-slate-400 font-normal border-l-2 border-slate-100 pl-3 group-hover:border-blue-200 transition-colors">${zh}</p>
        </div>
    `).join('');
},

/** 📖 [Private] 渲染 8 元組單字列表 */
_renderEduVocabList(vocabs) {
    if (vocabs.length === 0) return this._renderEmptyState("尚未注入單字燃料");
    
    return vocabs.map(v => `
        <div class="bg-slate-50 rounded-2xl p-4 mb-3 border border-slate-100">
            <div class="flex justify-between items-start mb-2">
                <div>
                    <span class="text-[0.6rem] px-2 py-0.5 bg-blue-500 text-white rounded-full font-black mr-2">${v.level}</span>
                    <b class="text-lg text-slate-800">${v["0"]}</b>
                </div>
                <span class="text-[0.7rem] text-slate-400 font-mono">${v["2"]}</span>
            </div>
            <div class="text-[0.8rem] text-blue-600 font-mono mb-2">${v["1"]} <span class="text-slate-300 mx-1">|</span> ${v["3"]}</div>
            <div class="text-[0.9rem] text-slate-700 font-bold mb-2">${v["5"]}</div>
            <div class="text-[0.75rem] text-slate-500 italic bg-white p-2 rounded-lg border border-slate-50">
                "${v["6"]}" <br>
                <span class="text-[0.7rem] text-slate-400 not-italic">${v["7"]}</span>
            </div>
        </div>
    `).join('');
},

/** 🎤 [Acoustic-Focus] 聲學視覺化投影：IPA 影子邏輯 (V2026.ULTRA) */
_getIPAShadow(text) {
    // 🚀 1. 安全邊界檢查
    if (!text) return "";

    // 🚀 2. 物理洗滌：移除標點符號，僅保留單字路網
    const words = text.toLowerCase()
        .replace(/[.,!?;:"()]/g, '')
        .split(/\s+/);

    // 🚀 3. 磁區檢索：從當前活躍的文章包中提取已固化單字
    // 💡 職人診斷：我們假設當前渲染的單字已存於 this.currentVocabMap
    // 若無此 Map，則從當前文章包的 edu_vocab 動態構建暫存索引
    const vocabMap = this.tempIPAMap || {};

    // 🚀 4. 語義對焦投影
    const ipaShadow = words.map(word => {
        // 優先從 8 元組資料庫中匹配音標 (Index 1: IPA)
        if (vocabMap[word]) {
            return vocabMap[word];
        }
        
        // 💡 降級處理：若無匹配，回傳空位符或簡單弱化處理
        // 這能維持 UI 簡潔，僅高亮顯示「已學習/重點」單字的音標
        return "···"; 
    });

    return ipaShadow.join(' ');
},

/** ✏️ [Data-Refactor] 磁區重構編輯器：英美語文章包版 (V2026.ULTRA) */
async editArticlePackage(packageId) {
    // 🚀 1. 物理定位與磁區預讀
    const pkg = await dbManager.get(dbManager.STORES.TRANS_VAULT, packageId);
    if (!pkg) return uiManager.showToast('⚠️', "Record not found");

    console.log(`📡 [EN-Refactor-Entry] Package: ${packageId} | 啟動數據重構編輯器...`);

    // 🚀 2. 構建重構編輯介面 (使用圓角卡片與精確輸入軌道)
    const refactorUI = `
        <div id="refactor-overlay" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div class="bg-white w-full max-w-lg rounded-[2.5rem] p-8 shadow-2xl animate-scale-in">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-xl font-bold text-slate-800">數據重構編輯</h3>
                    <span class="text-[0.6rem] px-2 py-1 bg-slate-100 text-slate-500 rounded-md font-mono">${pkg.id}</span>
                </div>

                <div class="space-y-6">
                    <div class="group">
                        <label class="block text-[0.7rem] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Package Title / 標題</label>
                        <input id="edit-title" type="text" value="${pkg.title || ''}" 
                               class="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold focus:ring-2 focus:ring-blue-400 transition-all">
                    </div>

                    <div class="group">
                        <label class="block text-[0.7rem] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">Category / 語境分類</label>
                        <select id="edit-category" class="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-800 font-bold appearance-none">
                            ${['Article', 'Lyrics', 'Tech', 'News', 'Business'].map(cat => 
                                `<option value="${cat}" ${pkg.category === cat ? 'selected' : ''}>${cat}</option>`
                            ).join('')}
                        </select>
                    </div>

                    <div class="flex gap-3 pt-4">
                        <button onclick="document.getElementById('refactor-overlay').remove()" 
                                class="flex-1 py-4 text-slate-400 font-bold hover:bg-slate-50 rounded-2xl transition-colors">取消</button>
                        <button id="commit-refactor" 
                                class="flex-[2] py-4 bg-slate-900 text-white font-bold rounded-2xl shadow-lg active:scale-95 transition-all">焊接存檔</button>
                    </div>
                </div>
            </div>
        </div>
    `;

    // 🚀 3. 執行 UI 投射
    document.body.insertAdjacentHTML('beforeend', refactorUI);

    // 🚀 4. 焊接存檔邏輯 (Commit Logic)
    document.getElementById('commit-refactor').onclick = async () => {
        const newTitle = document.getElementById('edit-title').value.trim();
        const newCategory = document.getElementById('edit-category').value;

        if (!newTitle) return uiManager.showToast('⚠️', "Title cannot be empty");

        try {
            // 💡 職人協定：僅更新 Metadata，保留 segments 與 edu_vocab
            pkg.title = newTitle;
            pkg.category = newCategory;
            pkg.lastModified = Date.now();

            await dbManager.put(dbManager.STORES.TRANS_VAULT, pkg);
            
            // 🚀 5. 數據重連與視圖刷新
            document.getElementById('refactor-overlay').remove();
            uiManager.showToast('✅', "Refactor complete");
            
            if (typeof this.loadLiveHistory === 'function') {
                await this.loadLiveHistory('全部');
            }
        } catch (err) {
            console.error("❌ [EN-Refactor-Collapse]:", err);
            uiManager.showToast('❌', "Storage commit failed");
        }
    };
},

/** 💾 [Data-Solidification] 數據持久化處理器：英美語文章重構版 (V2026.ULTRA.FINAL) */
async _handleArticleSave(id, oldRecord, modalId) {
    console.log(`📡 [EN-Save-Ignition] 啟動磁區固化協定 | ID: ${id}`);

    // 🚀 1. 物理座標採集：從編輯介面提領最新燃料
    const saveBtn = document.getElementById('save-art-btn');
    const titleEl = document.getElementById('edit-art-title');
    const newTitle = titleEl ? titleEl.value.trim() : "";

    if (!newTitle) return uiManager.showToast('⚠️', "Title is mandatory");

    // 🚀 2. 物理熔斷：鎖定按鈕防止二次重複寫入
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.5';
    }

    try {
        // 🚀 3. 標籤指紋對焦 (Linguistic Category Sensing)
        // 💡 職人診斷：優先採集具備 .bg-blue-600 狀態的學習標籤，若無則採信舊標籤
        const activeChip = document.querySelector('#edit-art-cat-group .cat-chip.is-active') || 
                           document.querySelector('#edit-art-cat-group [data-selected-active="true"]');
        const newCategory = activeChip ? activeChip.getAttribute('data-cat') : oldRecord.category;

        // 🚀 4. 段落數據洗滌與提純
        // 💡 從編輯列表中的所有 textarea 採集 [EN, ZH] 二元組
        const newSegments = Array.from(document.querySelectorAll('.segment-edit-block')).map(block => {
            const qEl = block.querySelector('.edit-q-input');
            const aEl = block.querySelector('.edit-a-input');
            
            // 封殺 undefined 或 "null" 字串毒素
            const clean = (el) => {
                const val = el ? el.value.trim() : "";
                return (val === 'undefined' || val === 'null') ? "" : val;
            };
            return [clean(qEl), clean(aEl)];
        }).filter(seg => seg[0].length > 0); // 剔除空白物理段落

        // 🚀 5. 構建演進實體 (Evolutionary Entity)
        const updatedPackage = {
            ...oldRecord,        // 繼承原有 EDU 磁區內容
            id: id,
            title: newTitle,
            category: newCategory,
            segments: newSegments,
            lastModified: Date.now()
        };

        // 🚀 6. 物理固化至 IndexedDB
        await dbManager.put(dbManager.STORES.TRANS_VAULT, updatedPackage);
        console.log(`💾 [EN-Solidification-Success] Article ${id} updated in vault.`);

        // 🚀 7. 視圖重連與資源回收
        uiManager.showToast('✨', "Learning materials solidified");
        
        // 使用 App 主程序移除 Modal
        if (window.App && typeof App.modalRemove === 'function') {
            App.modalRemove(modalId);
        }

        // 💡 關鍵焊接：強制刷新歷史列表以顯示最新標題與分類
        const refreshTarget = (this.lockedCategory === 'AUTO' || !this.lockedCategory) ? '全部' : this.lockedCategory;
        await this.loadLiveHistory(refreshTarget);

        // 物理震動反饋
        if (navigator.vibrate) navigator.vibrate([10, 30]);

    } catch (err) {
        console.error("❌ [EN-Save-Collapse]:", err);
        uiManager.showToast('⚠️', "Storage sync failed");
        
        // 救援：解開按鈕鎖定
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
    }
},

/** 🗑️ [Action] 物理切除：刪除整篇英文文章磁區 (V2026.ULTRA.EN 氣泡導通版) */
async deleteArticlePackage(id, modalId) {
    console.log(`📡 [EN-Package-Reclaim] 請求物理切除文章磁區 | ID: ${id}`);

    // 🚀 1. 視覺發動機對焦
    const targetUI = window.uiManager || uiManager;
    if (!targetUI) {
        console.error("❌ [System-Fault] uiManager 離線，無法啟動刪除協定");
        return;
    }

    // 🚀 2. 交互式氣泡點火 (取代阻塞式 confirm)
    // 💡 職人診斷：使用符合英美學習語境的提示，並設定 6 秒長效緩衝
    targetUI.showToast('⚠️', "Permanently delete this article package?", 6000, {
        onConfirm: async () => {
            try {
                // A. 磁區切除 (IndexedDB 實體抹除)
                await dbManager.delete(dbManager.STORES.TRANS_VAULT, id);
                console.log(`💾 [EN-Vault-Purged] Package ${id} reclaimed.`);

                // B. 資源回收：物理移除編輯 Modal
                if (window.App && typeof App.modalRemove === 'function') {
                    App.modalRemove(modalId);
                } else {
                    document.getElementById(modalId)?.remove();
                }

                // C. 視圖重連：執行歷史列表刷新
                // 💡 職人協定：回歸目前的鎖定分類標籤
                const refreshTarget = (this.lockedCategory === 'AUTO' || !this.lockedCategory) ? '全部' : this.lockedCategory;
                await this.loadLiveHistory(refreshTarget);

                // D. 成功反饋與 Haptic 反應
                targetUI.showToast('🗑️', "Package successfully removed");
                if (navigator.vibrate) navigator.vibrate([30, 50]);

            } catch (err) {
                console.error("❌ [EN-Reclaim-Collapse]:", err);
                targetUI.showToast('⚠️', "Reclaim failed: Storage alignment error");
            }
        }
    });
},

/** 🧬 [Private] 標籤切換物理對焦：英美語專屬版 (V2026.ULTRA 全量導通) */
_handleCatSwitch(btn, cat) {
    // 🚀 1. 物理清理：防止頻繁點擊產生的選取噪音
    window.getSelection().removeAllRanges(); 
    const group = btn.parentElement;
    if (!group) return;
    
    // 🚀 2. 磁區復位：將群組內所有標籤還原為初始「冷資料」狀態
    // 💡 職人診斷：徹底清除所有 chip 的 active 類名與物理樣式
    group.querySelectorAll('.cat-chip').forEach(b => {
        b.classList.remove('is-active'); 
        b.style.backgroundColor = '#f8fafc'; // slate-50
        b.style.color = '#94a3b8';           // slate-400
        b.style.borderColor = '#f1f5f9';     // slate-100
        b.dataset.selectedActive = "false";
    });

    // 🚀 3. 主權注入：點亮選中項 (鎖定英美語模組專屬學習藍)
    // 💡 職人協定：使用 !important 強制覆蓋基底樣式，確保視覺對焦絕對準確
    btn.style.setProperty('background-color', '#2563eb', 'important'); // blue-600
    btn.style.setProperty('color', '#ffffff', 'important');
    btn.style.setProperty('border-color', 'transparent', 'important');
    
    // 🚀 4. 數據固化：標記邏輯指紋，供儲存發動機採集
    btn.classList.add('is-active'); 
    btn.dataset.selectedActive = "true";
    btn.dataset.cat = cat; 

    // 🚀 5. 觸覺反饋與紀錄
    if (navigator.vibrate) navigator.vibrate(8);
    console.log(`🎯 [EN-Cat-Focus] Study track switched to: ${cat}`);
},



/** 📜 [Data-Relay] 歷史讀取器：數據精煉與劇場指紋感測版 (V2026.ULTRA.FINAL) */
async loadLiveHistory(filterCategory = 'ALL') {
    // 🚀 1. 座標預處理
    const targetCat = (filterCategory === '全部' || filterCategory === 'ALL') ? 'ALL' : filterCategory;
    console.log(`📡 [EN-History-Sync] 啟動磁區對焦 | 語境過濾: ${targetCat}`);

    const stack = document.getElementById('fuel-display-stack');
    const watermark = document.getElementById('category-lock-watermark'); 
    if (!stack) return;

    try {
        // 🚀 2. 物理磁區採樣
        const allRecords = await dbManager.getAll(dbManager.STORES.TRANS_VAULT);
        if (!allRecords) throw new Error("VAULT_READ_ERROR");

        // 🚀 3. 數據純化：語系 DNA 隔離與「劇場指紋」自癒感測
        let liveData = allRecords.filter(item => {
            // A. 基本隔離：鎖定英文軌道與合法類型
            const isTargetLang = item.lang === 'EN';
            const isValidType = ['text', 'voice', 'image', 'article_package'].includes(item.type);
            if (!isTargetLang || !isValidType) return false;

            // B. 標籤判定邏輯 (全量導通時直接過關)
            if (targetCat === 'ALL') return true;

            // C. 劇場自癒協定 (Theatre Self-Healing Protocol)
            // 💡 職人診斷：若過濾目標為「會話 (DIAL/CONV)」，執行多維度指紋掃描
            const itemCat = String(item.category || 'GENERAL').toUpperCase();
            const searchTag = targetCat.toUpperCase();

            if (searchTag === 'DIALOGUE' || searchTag === 'THEATRE' || searchTag === '會話') {
                const hasTheatreIcon = String(item.title || "").includes('🎭');
                const hasTheatreTag = item.tags && (item.tags.includes('劇場生成') || item.tags.includes('Theatre'));
                const isDialogueCat = ['DIALOGUE', 'THEATRE', 'CONVERSATION', '會話'].includes(itemCat);
                
                return isDialogueCat || hasTheatreIcon || hasTheatreTag;
            }

            // D. 一般標籤精確對位
            return itemCat === searchTag;
        });

        // 🚀 4. 浮水印與空值狀態控制
        if (watermark) {
            // 💡 若無燃料，顯影浮水印指引；若有燃料，物理屏蔽以提升閱讀淨度
            watermark.style.display = liveData.length > 0 ? 'none' : 'flex';
        }

        // 🚀 5. 時間座標重排 (Newest First)
        liveData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // 🚀 6. 渲染主權移交
        if (window.en_translationView && typeof window.en_translationView._renderTranslateCards === 'function') {
            stack.innerHTML = window.en_translationView._renderTranslateCards(liveData, targetCat);
            
            // 視圖聯動：確保 Tabs 視覺狀態同步
            if (typeof this.renderCategoryTabs === 'function') {
                this.renderCategoryTabs();
            }
            console.log(`🏁 [EN-Render-Link] 導通成功 | 燃料筆數: ${liveData.length}`);
        } else {
            console.error("❌ [EN-View-Relay-Collapse] en_translationView 未導通");
            stack.innerHTML = this._renderEmptyState(targetCat);
        }

    } catch (err) {
        console.error("❌ [EN-History-Collapse]:", err);
        if (window.uiManager) uiManager.showToast('⚠️', "Linguistic history link failed");
    }
},

/** 🧬 [Internal] 空狀態渲染器 */
_renderEmptyState(category) {
    return `
        <div class="flex flex-col items-center justify-center py-20 opacity-20">
            <span class="text-4xl mb-4">📭</span>
            <p class="text-sm font-bold tracking-widest uppercase">No ${category} Fuel Found</p>
        </div>
    `;
},



/** 🧬 [Private] 預載入磁區音標索引 (V2026.ULTRA 物理除磁版) */
_prepareIPAMap(eduVocab) {
    // 🚀 1. 物理除磁：強制清理舊有磁區索引，防止跨文章包數據污染
    // 💡 職人診斷：確保每次切換分頁時，IPA 映射表皆為該文章包專屬的純淨狀態
    this.tempIPAMap = null; 
    this.tempIPAMap = {};

    // 🚀 2. 安全邊界攔截
    if (!Array.isArray(eduVocab) || eduVocab.length === 0) {
        console.log("📡 [EN-IPA-Clear] No vocab fuel detected, index reset.");
        return;
    }

    // 🚀 3. 構建物理索引：將 8 元組數據中的 [Word] 精確投影至 [IPA]
    eduVocab.forEach(v => {
        // 💡 多態相容：優先提領具名屬性 word/reading，回退至索引 0/1
        const word = String(v.word || v["0"] || "").toLowerCase().trim();
        const ipa = String(v.reading || v.phonetic || v["1"] || "").trim();
        
        if (word && ipa) {
            // 數據洗滌：移除音標中的斜線或括號，由 View 層渲染引擎統一進行視覺包裝
            this.tempIPAMap[word] = ipa.replace(/[\/\[\]\(\)]/g, ''); 
        }
    });

    // 🚀 4. 數據監控 (Debug Console)
    if (window.debugConsole) {
        window.debugConsole.log(`[IPA-Hydration] ${Object.keys(this.tempIPAMap).length} focus nodes indexed.`);
    }
    
    console.log(`📡 [EN-IPA-Mapping] Sector aligned. Index density: ${Object.keys(this.tempIPAMap).length}`);
},

/** 📂 [UI-Performance] 物理摺疊與冷熱資料分離發動機 (V2026.ULTRA) */
async toggleArticleFolder(packageId) {
    const container = document.getElementById(`pkg-folder-${packageId}`);
    const content = document.getElementById(`pkg-content-${packageId}`);
    const icon = document.getElementById(`pkg-icon-${packageId}`);
    
    if (!container || !content) return;

    // 🚀 1. 物理狀態感應 (State Sensing)
    const isExpanding = content.classList.contains('hidden');
    console.log(`📡 [EN-Performance-Link] Package: ${packageId} | Action: ${isExpanding ? 'Warming' : 'Freezing'}`);

    if (isExpanding) {
        // --- 🔥 熱資料回溫階段 (Warm Boot) ---
        
        // 🚀 2. 磁區預檢：確保數據導通成功才開啟視圖
        const pkgExists = await dbManager.get(dbManager.STORES.TRANS_VAULT, packageId);
        if (!pkgExists) return uiManager.showToast('⚠️', "Data link corrupted");

        // 🚀 3. 恢復分頁座標 (State Memory Alignment)
        if (!this.currentActiveTabs) this.currentActiveTabs = {};
        const lastTab = this.currentActiveTabs[packageId] || '原文';

        // 🚀 4. 動畫解鎖與渲染點火
        content.classList.remove('hidden');
        content.classList.replace('animate-slide-up', 'animate-slide-down'); // 執行工業級展開動畫
        if (icon) icon.style.transform = 'rotate(180deg)';
        
        // 🚀 5. 實體數據注入 (DOM Re-population)
        // 💡 職人診斷：此處呼叫我們剛修好的 switchArticleTab，它會根據分頁重新生成 HTML
        await this.switchArticleTab(packageId, lastTab);

        if (window.debugConsole) {
            window.debugConsole.log(`[Memory-Ignite] ${packageId} hydrated to ${lastTab}`);
        }
    } else {
        // --- ❄️ 冷資料分離階段 (Deep Freeze) ---
        
        // 🚀 6. 物理摺疊動畫
        if (icon) icon.style.transform = 'rotate(0deg)';
        content.classList.replace('animate-slide-down', 'animate-slide-up');
        
        // 🚀 7. 資源物理回收 (CRITICAL PERFORMANCE STEP)
        // 💡 職人協定：延遲 250ms 等動畫結束後，物理清空 innerHTML
        // 這能釋放所有卡片占用的記憶體，防止 DOM 節點過多導致的滾動掉幀
        setTimeout(() => {
            if (content.classList.contains('animate-slide-up')) {
                content.classList.add('hidden');
                content.innerHTML = ""; // 物理除磁：徹底回收教材卡片 DOM
                console.log(`🧹 [Memory-Release] ${packageId} DOM cleaned.`);
            }
        }, 250);
    }

    // 🚀 8. 觸覺與性能回饋
    if (navigator.vibrate) navigator.vibrate(5);
},


/** 🚀 [en_translationEngine] 物理寫入 Vault：英美語學習燃料批量固化 (V2026.ULTRA 解耦版) */
async importTranslateFuel() {
    console.log("📡 [en_translationEngine] 啟動英美語燃料注入與物理固化協定...");
    
    const input = document.getElementById('trans-json-input');
    let jsonStr = input ? input.value.trim() : "";
    if (!jsonStr) return uiManager.showToast('⚠️', "Please paste JSON fuel first");

    try {
        // 1. 數據洗滌 (物理切除 Markdown 噪音)
        jsonStr = jsonStr.replace(/^```json\s*/, '')
                        .replace(/^```\s*/, '')
                        .replace(/\s*```$/, '')
                        .trim();

        // 2. 解析 JSON 燃料包
        const data = JSON.parse(jsonStr);
        const newRawItems = Array.isArray(data) ? data : [data];

        // 🚀 核心對焦：數據解耦與指紋注入
        // 💡 職人診斷：直接鎖定 lang: 'EN' 並準備進入全域磁區，不再依賴行程 ID
        const solidifiedItems = newRawItems.map((item, index) => ({
            ...item,
            lang: 'EN', // 🔐 鎖定英文軌道 DNA
            type: item.type || 'vault', // 預設標記為倉庫燃料
            id: `vlt_en_${Date.now()}_${index}_${Math.random().toString(36).substr(2, 5)}`,
            timestamp: Date.now()
        }));

        // 🚀 核心焊接：磁區批量噴發
        if (dbManager && typeof dbManager.put === 'function') {
            const savePromises = solidifiedItems.map(item => 
                dbManager.put(dbManager.STORES.TRANS_VAULT, item)
            );
            
            await Promise.all(savePromises);
            console.log(`💾 [Storage-Fixed] ${solidifiedItems.length} 筆英文學習燃料已物理固化至 TRANS_VAULT`);
        } else {
            throw new Error("dbManager.put interface not found");
        }

        // 🚀 核心焊接：視圖導播與熱重載
        if (window.App && typeof window.App.navigateTo === 'function') {
            // 💡 職人對焦：匯入後自動導向翻譯庫，並觸發一次全語系過濾
            window.App.navigateTo('contextual'); 
        }

        // 3. 反饋與清理
        uiManager.showToast('🇺🇸', `Imported ${solidifiedItems.length} items to Study Vault`);
        if (input) input.value = '';
        if (navigator.vibrate) navigator.vibrate([20, 40]);

    } catch (e) {
        console.error("❌ [Fuel-Collapse] 注入程序中斷:", e);
        uiManager.showToast('⚠️', "Import Failed: Invalid JSON format");
    }
},

/** 🚀 [Module-Router] 語義分流過濾代理：英美語雙軌導通版 (V2026.ULTRA.FINAL) */
async filterTranslate(category) {
    console.log(`📡 [EN-Route-Ignition] 啟動語義分流過濾 | 目標: ${category}`);

    // 🚀 1. 容器對焦與分流判定指紋
    const container = document.getElementById('content-container') || document.getElementById('view-container');
    const liveStack = document.getElementById('fuel-display-stack');

    // 🚀 2. [軌道 A]：即時翻譯/學習軌道 (Real-time Link)
    // 💡 職人診斷：若 liveStack 存在，代表使用者正處於「即時輸入/分類過濾」模式
    if (liveStack) {
        console.log(`🎯 [EN-Live-Track] 執行即時分類鎖定: ${category}`);
        
        // A. 狀態固化
        this.lockedCategory = category;
        
        // B. UI 同步：直接對位 en_translationView
        // 💡 修正：確保呼叫的是已完成遷移的視圖組件
        if (window.en_translationView && typeof window.en_translationView.renderCategoryTabs === 'function') {
            window.en_translationView.renderCategoryTabs();
        }

        // C. 執行歷史數據回溯
        const fetchTag = (category === 'AUTO' || category === '自動') ? '全部' : category;
        return await this.loadLiveHistory(fetchTag);
    }

    // 🚀 3. [軌道 B]：情境學習倉庫軌道 (Contextual Vault)
    // 💡 職人診斷：此路徑用於重繪整頁的情境卡片清單
    console.log(`📖 [EN-Vault-Track] 強制重繪情境分區: ${category}`);
    if (!container) return;

    try {
        if (!dbManager) throw new Error("DB_OFFLINE");

        // A. 數據全量採集與 DNA 隔離
        const allVaultData = await dbManager.getAll(dbManager.STORES.TRANS_VAULT);
        const enFilteredData = allVaultData.filter(item => item.lang === 'EN');

        // B. 視圖重連 (CRITICAL FIX: 徹底廢棄 en_viewEngine)
        // 💡 職人協定：直接傳導至英文專屬視圖衛星 en_translationView
        if (window.en_translationView && typeof window.en_translationView.renderContextualTranslation === 'function') {
            window.en_translationView.renderContextualTranslation(container, enFilteredData, category);
        } else {
            console.error("❌ [EN-View-Relay-Collapse] en_translationView 未導通");
        }

        // C. 反饋導通
        if (category !== '全部' && category !== 'ALL') {
            uiManager.showToast('🇺🇸', `Focused: ${category}`);
        }
        if (navigator.vibrate) navigator.vibrate(8);

    } catch (err) {
        console.error("❌ [EN-Filter-Collapse]:", err);
        uiManager.showToast('💥', "Linguistic link drift");
    }
},


/** 🚀 [en_translationEngine] 執行數據物理清理：清空全域學習庫 (V2026.ULTRA 磁區回收版) */
async clearTranslateVault() {
    // 🛡️ 1. 職人防禦協定：執行物理抹除前的最後確認
    if (!confirm("🚨 WARNING: This will permanently delete ALL English study records from the global vault. This action cannot be undone. Proceed?")) {
        return;
    }

    try {
        // 🚀 2. 核心焊接：全域磁區導通
        if (!dbManager) throw new Error("DB_OFFLINE");

        // 💡 職人診斷：為了不誤傷日文數據，我們先抓取所有數據並過濾出 EN 項目進行物理移除
        const allItems = await dbManager.getAll(dbManager.STORES.TRANS_VAULT);
        const enItems = allItems.filter(item => item.lang === 'EN');

        if (enItems.length === 0) {
            uiManager.showToast('ℹ️', "Study Vault is already empty");
            return;
        }

        // 🚀 3. 物理回收管線：批量切除 EN 數據
        const deletePromises = enItems.map(item => 
            dbManager.delete(dbManager.STORES.TRANS_VAULT, item.id)
        );

        await Promise.all(deletePromises);
        console.log(`🧹 [EN-Vault-Purge] Successfully reclaimed ${deletePromises.length} items`);

        // 🚀 4. 視圖路網重連：觸發當前分頁刷新
        // 既然已經解耦，我們直接調用 filterTranslate 重新從空的磁區抓取數據並渲染
        if (typeof this.filterTranslate === 'function') {
            await this.filterTranslate('全部'); 
        }

        // 5. 視覺與 Haptic 反饋
        uiManager.showToast('🧹', `PURGED ${deletePromises.length} STUDY ITEMS`);
        if (navigator.vibrate) navigator.vibrate([10, 60]);

    } catch (err) {
        console.error("❌ [EN-Purge-Collapse] Storage reclaim failed:", err);
        uiManager.showToast('💥', "Reclaim failed: DB connection error");
    }
},

/** 🚀 [Prompt] 專屬 AI 指令合成：英美語數據生產單元 (V2026.ULTRA.FIXED) */
_getTranslateAiPrompt(val) {
    // 🚀 1. 物理導通：確保與全系統參數名 [val] 100% 對位
    const query = (val && typeof val === 'string') ? val.trim() : "";
    
    // 🚀 2. 磁區採樣：採集當前行程的學習分區
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const availableCats = trip?.translateConfig?.categories || ['Study', 'Daily', 'Business', 'Slang'];
    
    // 🚀 3. 語境動態判定
    const context = query ? `針對「${query}」的實境對話` : `當前最道地的美式高頻口語`;

    // 🚀 4. 核心指令封裝 (強化意群與俚語深度)
    return `[SYSTEM: EN_US_MASTER_DATA_UNIT / RAW_JSON_ONLY]
你現在是 TravelFlow V2026.ULTRA 英語教學專家，專精於美式口語 (American English) 與 CEFR 級別管理。
[任務]: 請${context}產出 5-8 筆高品質教學燃料。

🚨 核心生產協定 (Production Protocols):
1. **美式靈魂對焦**：優先使用美式慣用語與俚語。封殺生硬的字典翻譯，確保語氣符合現代美國社交場景。
2. **意群斷句協定 (Acoustic Chunking)**：為了模擬美式口語的「壓力節奏」，請在 a 欄位中，於語義停頓點 (Thought Groups) 物理加入「,」。
3. **IPA 聲學路網**：phonetic 欄位必須提供極其精確的美式 IPA (含重音符號 ˈ )。
4. **語義對焦解析**：usage 欄位必須精煉說明該句的「文化背景」或「連音 (Liaison) / 弱化音 (Reduction)」現象。

🚨 數據格式規範 (Strict Format):
1. 嚴禁任何解釋性文字或 Markdown 標籤。僅輸出純 JSON Array。
2. **[category] 必須嚴格對位以下指紋：[${availableCats.join(', ')}]**。

[數據結構定義]:
- q: 繁體中文 (精準意譯)
- a: 美式英文全句 (必須含戰略性意群標點)
- phonetic: 美式 IPA 音標 (含重音標註)
- usage: 職人級教學筆記 (中文)
- category: 所屬標籤

[One-Shot Reference]:
{"q":"我就只是隨便看看。","a":"I'm just, looking around, thanks.","phonetic":"aɪm dʒʌst, ˈlʊkɪŋ əˈraʊnd, θæŋks.","usage":"'looking around' 常用於購物時婉拒店員；'just' 具備語氣緩衝作用。","category":"${availableCats[2] || 'Daily'}"}

[立刻點火輸出純數據燃料]:`;
},


/** 🎙️ 啟動英美語即時聲學採集 (STT - V2026.ULTRA 標籤感應固化版) */
async startRealtimeMic() {
    const micStatus = document.getElementById('mic-status');
    const micPulse = document.getElementById('mic-pulse');
    const resultArea = document.getElementById('realtime-result-area');
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        uiManager.showToast('❌', "Browser does not support STT");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'en-US'; 
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    try {
        recognition.start();
        if (micStatus) {
            micStatus.innerText = "Listening to English...";
            micStatus.classList.replace('text-slate-400', 'text-blue-500');
        }
        if (micPulse) micPulse.classList.remove('hidden');
        if (navigator.vibrate) navigator.vibrate([15, 30]);
    } catch (err) {
        console.error("❌ [EN-STT-Ignition-Fail]:", err);
        uiManager.showToast('🔒', "Check microphone permissions");
        return;
    }

    recognition.onresult = async (event) => {
        const transcript = event.results[0][0].transcript;
        
        if (resultArea) resultArea.classList.remove('hidden');
        const sttEl = document.getElementById('stt-original');
        const ttsEl = document.getElementById('tts-target');
        
        if (sttEl) sttEl.innerText = `Recognized: ${transcript}`;
        if (ttsEl) {
            ttsEl.innerText = "Analyzing English...";
            ttsEl.classList.add('animate-pulse');
        }

        try {
            // 🚀 1. 語義翻譯：調用英美語專用傳輸軌道
            const translated = await en_translationEngine._executeTranslation(transcript); 
            
            // 🚀 2. 標籤指紋對位 (V2026.ULTRA EN 核心補強)
            // 💡 職人診斷：感應目前的 Tags 鎖定狀態，對位美式 General 語義
            const targetCategory = (this.lockedCategory === 'AUTO' || this.lockedCategory === '自動') 
                                   ? 'General' 
                                   : this.lockedCategory;

            // 🚀 3. 數據固化焊接 (V2026.ULTRA EN 語音指紋)
            if (dbManager) {
                const record = {
                    id: `mic_en_${Date.now()}`, 
                    type: 'voice',
                    lang: 'EN',               // 🔐 關鍵 DNA：鎖定英文軌道
                    category: targetCategory,  // 🏷️ 注入鎖定的標籤指紋
                    原文: transcript,
                    翻譯: translated,
                    timestamp: Date.now()
                };
                
                dbManager.put(dbManager.STORES.TRANS_VAULT, record)
                    .then(() => console.log(`💾 [EN-Voice-Solidified] Saved to: ${targetCategory}`))
                    .catch(e => console.error("❌ [EN-Voice-Save-Fail]", e));
            }

            if (ttsEl) {
                ttsEl.innerText = translated;
                ttsEl.classList.remove('animate-pulse');
            }
            
            // 🔊 聲學噴發：導向英文發聲引擎
            if (window.en_audioManager) {
                window.en_audioManager.speak(translated);
            }
        } catch (err) {
            console.error("❌ [EN-Translate-Collapse]:", err);
            if (ttsEl) {
                ttsEl.innerText = "Semantic Alignment Failed";
                ttsEl.classList.remove('animate-pulse');
            }
        }
    };

    recognition.onerror = (event) => {
        console.error("🚨 [EN-STT-Error]:", event.error);
        this.resetMicUI();
        uiManager.showToast('⚠️', `STT Error: ${event.error}`);
    };

    recognition.onend = () => {
        this.resetMicUI();
    };
},


    /** 🚀 私有輔助：重置麥克風 UI 狀態 (英美語對焦版) */
resetMicUI() {
    const micStatus = document.getElementById('mic-status');
    const micPulse = document.getElementById('mic-pulse');
    
    if (micStatus) {
        // 🚀 語義歸位：將文字改回英文預設提示
        micStatus.innerText = "Tap to start listening";
        // 🚀 視覺歸位：移除學習藍，恢復中性灰色
        micStatus.classList.remove('text-blue-500', 'theme-text-pink');
        micStatus.classList.add('text-slate-400');
    }

    if (micPulse) {
        // 🚀 物理斷路：停止脈衝動畫
        micPulse.classList.add('hidden');
    }
    
    console.log("📡 [en_translationEngine] Mic UI reset to standby.");
  },

// ============================================================
// 📸 [EN Camera & OCR Module] 英美語影像採集發動機
// ============================================================

/** 🎥 1. 啟動英文觀景窗串流：硬體路網導通 */
async initCameraStream() {
    const video = document.getElementById('tf-camera-stream');
    const loader = document.getElementById('camera-loading');
    if (!video) return;

    console.log("📡 [EN-Camera-Ignition] Initializing English Optical Sensor...");

    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: { 
                facingMode: { ideal: "environment" },
                width: { ideal: 1920 },
                height: { ideal: 1080 }
            },
            audio: false
        });

        video.srcObject = stream;
        video.onloadedmetadata = () => {
            video.play();
            video.classList.remove('hidden');
            if (loader) loader.classList.add('hidden');
            console.log("🏁 [EN-Camera-Ready] Optical focus established.");
        };
        this.currentStream = stream;
    } catch (err) {
        console.error("❌ [EN-Camera-Collapse] Sensor failed:", err);
        uiManager.showToast('🔒', "Please allow camera access for OCR scan");
    }
},

/** 📸 2. 執行英美語影像採集：捕捉與 OCR 數據固化 (V2026.ULTRA 標籤感應版) */
async capturePhoto() {
    const video = document.getElementById('tf-camera-stream');
    const canvas = document.getElementById('tf-ocr-canvas');
    const sttEl = document.getElementById('stt-original');
    const ttsEl = document.getElementById('tts-target');
    const resultArea = document.getElementById('realtime-result-area');
    const techStack = document.getElementById('tech-stack-info');

    if (!video || !canvas || video.paused) return;

    // 🚀 1. 物理凍結：影像畫布渲染
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 🚀 2. 介面同步：切換至結果軌道
    if (resultArea) resultArea.classList.remove('hidden');
    if (sttEl) sttEl.innerText = "📸 Scanning English Content...";
    if (ttsEl) {
        ttsEl.innerText = "Analyzing Semantics...";
        ttsEl.classList.add('animate-pulse');
    }
    if (techStack) techStack.innerText = "Vision OCR Learning Engine";
    
    // 物理快門震動回饋
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);

    try {
        // 🚀 3. 數據燃料化：轉換為高品質影像封裝
        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        // 🚀 4. 英美語專屬 Vision 對焦
        const translated = await this._executeVisionTranslation(imageData);

        // 🚀 5. 標籤指紋對位 (V2026.ULTRA EN 核心補強)
        // 💡 職人診斷：感應四撥盤鎖定狀態，若為 AUTO 則歸位至 General
        const targetCategory = (this.lockedCategory === 'AUTO' || this.lockedCategory === '自動') 
                               ? 'General' 
                               : this.lockedCategory;

        // 🚀 6. 數據固化：鎖定 lang: 'EN' 與 category 指紋
        if (dbManager) {
            const record = {
                id: `img_en_${Date.now()}`,
                type: 'image',
                lang: 'EN',               // 🔐 關鍵：鎖定英文學習磁軌
                category: targetCategory,  // 🏷️ 注入鎖定的標籤指紋
                原文: "[Image Scan]",
                翻譯: translated,
                imageUrl: imageData,      // 物理存檔截圖
                timestamp: Date.now()
            };
            
            dbManager.put(dbManager.STORES.TRANS_VAULT, record)
                .then(() => console.log(`💾 [EN-Image-Solidified] Captured to: ${targetCategory}`))
                .catch(e => console.error("❌ [EN-Image-Save-Fail]", e));
        }

        // 7. 熱更新渲染
        if (sttEl) sttEl.innerText = "Optical Recognition Completed";
        if (ttsEl) {
            ttsEl.innerText = translated;
            ttsEl.classList.remove('animate-pulse');
        }

        // 🚀 8. 聲學噴發：導通英文專用發動機
        if (window.en_audioManager) {
            window.en_audioManager.speak(translated);
        }

    } catch (err) {
        console.error("❌ [EN-Vision-Collapse]:", err);
        if (ttsEl) {
            ttsEl.innerText = "Scan Failed";
            ttsEl.classList.remove('animate-pulse');
        }
        uiManager.showToast('⚠️', "Vision engine connection failed");
    }
},



/** 🧠 3. 英文專用語義翻譯發動機 (Vision 對焦版) */
async _executeVisionTranslation(base64Image) {
    const endpoint = CONFIG?.API_ENDPOINT;
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;

    const response = await fetch(`${cleanEndpoint}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: base64Image,
            mode: 'OCR_VISION',
            source: 'auto',
            target: 'en-US',           // 🚀 強制鎖定美式英語
            protocol: 'AMERICAN_LEARNING_VISION'
        })
    });

    if (!response.ok) throw new Error("EN_VISION_API_FAIL");
    const result = await response.json();
    return result.translatedText || result.text || "Scan failed";
},

/** 🛑 4. 資源回收 */
stopCamera() {
    if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
        this.currentStream = null;
        console.log("🧹 [EN-Camera-Release] Sensor resource reclaimed.");
    }
},


// ============================================
//             模式與視圖控制類
// ============================================


/** 🔄 [Mode-Switch] 模式切換發動機：英美語學習總線 (V2026.ULTRA.FINAL) */
    switchRealtimeMode(mode) {
        console.log(`📡 [EN-Mode-Switch] 軌道切換中: ${mode.toUpperCase()}`);

        // 🚀 1. 狀態固化與環境清理
        this.currentMode = mode; 
        if (this.expandedIds) this.expandedIds.clear();

        const container = document.getElementById('content-container') || document.getElementById('view-container');
        if (!container) return;

        // 🚀 2. 執行視圖換殼 (核心修正：對位 en_translationView)
        // 💡 職人診斷：原本寫成 en_viewEngine 是斷路主因，必須指向 en_translationView
        if (window.en_translationView && typeof window.en_translationView.renderRealtimeTranslation === 'function') {
            window.en_translationView.renderRealtimeTranslation(container, mode);
        } else {
            console.error("❌ [EN-View-Link-Collapse] en_translationView 未導通");
            return;
        }

        // 🚀 3. 標籤軌道動態焊接 (物理對焦邏輯)
        const handleTabIgnition = () => {
            let existingTrack = document.getElementById('quick-category-track');
            
            // 💡 職人協定：僅在 filter (歷史磁軌) 模式顯影標籤列
            // 在 text (文字) 與 dialogue (劇場) 模式中，為了維持 UI 純淨，強制移除標籤列
            if (mode !== 'filter') {
                if (existingTrack) existingTrack.remove();
                return;
            }

            const modeSelector = document.getElementById('tf-mode-selector');
            if (mode === 'filter' && !existingTrack) {
                const track = document.createElement('div');
                track.id = 'quick-category-track';
                track.className = "px-4 mb-4 mt-2 flex gap-2 overflow-x-auto no-scrollbar relative z-10 animate-fade-in";
                
                // 物理插入點定位
                if (modeSelector) {
                    modeSelector.parentNode.insertBefore(track, modeSelector.nextSibling);
                }
                
                // 🚀 呼叫視圖層渲染英文標籤
                if (window.en_translationView.renderCategoryTabs) {
                    window.en_translationView.renderCategoryTabs();
                }
            }
        };

        handleTabIgnition();
        
        // 🚀 4. 數據加載對焦 (過濾模式執行歷史調取)
        if (mode === 'filter') {
            setTimeout(() => {
                const target = (this.lockedCategory === 'AUTO' || !this.lockedCategory) ? '全部' : this.lockedCategory;
                this.loadLiveHistory(target); 
            }, 300);
        }

        // 🚀 5. 輸入源物理對焦 (生產軌道隔離)
        setTimeout(() => {
            // 針對 TEXT 模式：對齊日文版 5 步驟輸入
            if (mode === 'text') {
                const input = document.getElementById('text-translate-input');
                if (input) {
                    input.focus();
                    input.onkeypress = (e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            this.executeTextTranslate(); 
                        }
                    };
                }
            } 
            // 針對 DIALOGUE 模式：對齊劇場素材輸入
            else if (mode === 'dialogue') {
                document.getElementById('dialogue-source-input')?.focus();
                const diagImport = document.getElementById('dialogue-json-import');
                if (diagImport) diagImport.value = "";
            }
        }, 400);

        if (navigator.vibrate) navigator.vibrate(5);
    },


/** ⚙️ [UI-Control] 彈出「英文即時翻譯」專屬私有標籤編輯 (V2026.ULTRA.PRIVATE) */
promptEditLiveCategories() {
    console.log("📡 [EN-Tag-Editor] 啟動私有標籤編輯器...");

    // 🚀 1. 物理脫鉤：從 EN 專屬磁區採集標籤燃料
    const defaultCats = ['General', 'Study', 'Business', 'Daily', 'Slang', 'Article', 'News'];
    const saved = localStorage.getItem('tf_en_live_private_cats');
    const categories = saved ? JSON.parse(saved) : defaultCats;
    
    // 🚀 2. 構建職人級編輯介面
    const content = `
        <div class="space-y-4 text-left">
            <div class="flex items-center gap-2 mb-2">
                <span class="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Custom Study Categories (Comma separated)</p>
            </div>
            
            <textarea id="edit-en-live-cats" 
                      placeholder="e.g. Study, Work, Travel..."
                      class="w-full h-32 bg-slate-50 border-none rounded-[1.5rem] p-5 font-bold text-sm text-slate-700 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none shadow-inner">${categories.join(', ')}</textarea>
            
            <div class="p-4 bg-blue-50/50 rounded-2xl border border-blue-100/50">
                <p class="text-[9px] text-blue-400 font-medium italic leading-relaxed">
                    * These categories are private to your English track. 
                    Changes will instantly refresh your Filter Tabs.
                </p>
            </div>
        </div>
    `;

    // 🚀 3. 動作按鈕焊接 (鎖定 ModalEngine)
    const actions = `
        <div class="flex gap-3 w-full">
            <button onclick="App.modalRemove('en-live-cat-modal')" 
                    class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-[11px] tracking-widest uppercase active:scale-95 transition-all">
                Cancel
            </button>
            <button onclick="en_translationEngine.saveLiveCategories()" 
                    class="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] tracking-widest uppercase shadow-lg shadow-blue-100 active:scale-95 transition-all">
                Update Tracks
            </button>
        </div>
    `;

    // 🚀 4. 實體點火
    if (window.modalEngine) {
        modalEngine.create('en-live-cat-modal', '🛠️ EN Category Editor', content, actions);
    } else {
        console.error("❌ [Modal-Link-Collapse] modalEngine not found");
    }
},

/** 💾 [Data-Persistence] 儲存英文私有標籤 (物理寫入 localStorage) */
saveLiveCategories() {
    const input = document.getElementById('edit-en-live-cats');
    if (!input) return;

    console.log("📡 [EN-Tag-Solidification] 啟動數據洗滌與磁區寫入...");

    try {
        // 🚀 1. 燃料提純：將逗號分隔字串轉為純淨陣列
        const newCats = input.value.split(/[,,，\n]/) // 兼容中英文逗號與換行
            .map(c => c.trim())
            .filter(c => c !== "" && c.length < 15); // 封殺空值與過長標籤
        
        // 🚀 2. 物理熔斷：確保至少具備基礎導通標籤
        if (newCats.length === 0) {
            return uiManager.showToast('⚠️', 'At least one category is required');
        }

        // 🚀 3. 實體固化至英美語專屬磁區
        localStorage.setItem('tf_en_live_private_cats', JSON.stringify(newCats));
        console.log(`💾 [EN-Storage-Fixed] 已固化 ${newCats.length} 個標籤至 localStorage`);

        // 🚀 4. 資源回收與視圖導通
        if (window.App && typeof window.App.modalRemove === 'function') {
            window.App.modalRemove('en-live-cat-modal');
        } else {
            // Fallback: 物理移除 DOM
            document.getElementById('en-live-cat-modal')?.remove();
        }
        
        // 💡 職人協定：強制重新渲染 Tabs 軌道以對焦新標籤
        if (typeof this.renderCategoryTabs === 'function') {
            this.renderCategoryTabs();
        }
        
        // 🚀 5. 觸覺與視覺反饋
        uiManager.showToast('✨', "Learning Tracks Updated");
        if (navigator.vibrate) navigator.vibrate([10, 40]);

    } catch (err) {
        console.error("❌ [EN-Tag-Save-Collapse]:", err);
        uiManager.showToast('⚠️', "Failed to save categories");
    }
},

/** 🎨 [Visual-Relay] 分類 Tabs 渲染引擎：英美語自動對焦版 (V2026.ULTRA) */
renderCategoryTabs() {
    const container = document.getElementById('quick-category-track');
    if (!container) return;

    console.log("📡 [EN-Visual-Relay] 啟動分類標籤軌道渲染...");

    // 🚀 1. 物理磁區回溯：從英美語私有磁區採集標籤燃料
    const saved = localStorage.getItem('tf_en_live_private_cats');
    const defaultCats = ['General', 'Study', 'Business', 'Daily', 'Slang', 'Article', 'News'];
    const cats = saved ? JSON.parse(saved) : defaultCats;
    
    // 🚀 2. 跨模組狀態讀取：獲取目前 Engine 鎖定的分類
    const currentActive = this.lockedCategory || 'AUTO';

    // 🚀 3. 動態自癒：若當前 active 標籤不在常用清單中，主動推入顯示軌道
    if (!cats.includes(currentActive) && currentActive !== 'AUTO' && currentActive !== '自動') {
        cats.push(currentActive);
    }

    // 🚀 4. 構建標籤 HTML (採用極簡圓角與藍色高亮協定)
    const autoTabHtml = `
        <button onclick="en_translationEngine.lockCategory('AUTO')" 
            class="shrink-0 px-5 py-2 rounded-full border font-black text-[10px] transition-all active:scale-90
            ${currentActive === 'AUTO' || currentActive === '自動' ? 'bg-blue-600 text-white border-transparent shadow-lg' : 'bg-white text-slate-400 border-slate-100'}">
            # AUTO
        </button>
    `;

    const tabsHtml = cats.map(cat => {
        const isActive = (cat === currentActive);
        return `
            <button onclick="en_translationEngine.lockCategory('${cat}')" 
                class="shrink-0 px-5 py-2 rounded-full border font-black text-[10px] transition-all active:scale-90 whitespace-nowrap 
                ${isActive ? 'bg-blue-600 text-white border-transparent shadow-lg scale-105' : 'bg-white text-slate-400 border-slate-100 hover:text-blue-500'}">
                # ${cat.toUpperCase()}
            </button>
        `;
    }).join('');

    // 🚀 5. 物理噴發至 DOM
    container.innerHTML = `
        <div class="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
            ${autoTabHtml}
            ${tabsHtml}
            <button onclick="en_translationEngine.promptEditLiveCategories()" 
                class="w-9 h-9 shrink-0 rounded-full border border-dashed border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 ml-1 hover:bg-blue-50 hover:text-blue-500">
                <i class="fa-solid fa-plus text-[10px]"></i>
            </button>
        </div>
    `;

    // 🚀 6. 視覺修正：物理捲動至目前選中的標籤 (居中對齊)
    requestAnimationFrame(() => {
        const activeBtn = container.querySelector('.bg-blue-600');
        if (activeBtn) {
            activeBtn.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center' 
            });
        }
    });
},

// ============================================================
    // 🚀 [Alias-Bridge] 視圖接口橋接器
    // ============================================================

    /** 🎲 [Public Interface] 對位 View 層的重新抽樣呼叫 */
    refreshDialogueDuo() {
        // 💡 職人診斷：View 層 onclick 在找這個名字，我們直接傳導至實體發動機
        console.log("🔗 [EN-Bridge] 導通 refreshDialogueDuo -> theatreRefreshDuo");
        return this.theatreRefreshDuo();
    },


/** ➕ [Payload-Extension] 物理新增編輯段落：英美語重構版 (V2026.ULTRA.FINAL) */
addEditSegment() {
    console.log("📡 [EN-Data-Expansion] 請求新增 [EN/ZH] 編輯段落軌道...");

    // 🚀 1. 物理座標定位 (對位模態框內的清單容器)
    const list = document.getElementById('edit-segments-list');
    const notice = document.getElementById('empty-segment-notice');
    if (!list) {
        console.error("❌ [Container-Miss] 找不到編輯容器，點火中斷");
        return;
    }

    // 🚀 2. 磁區清理：若目前為空狀態，物理移除占位符
    if (notice) notice.remove();

    // 🚀 3. 計算物理索引
    const nextIdx = list.querySelectorAll('.segment-edit-block').length;

    // 🚀 4. 視圖零件採樣 (CRITICAL FIX: 對位 en_translationView)
    // 💡 職人診斷：放棄 en_viewEngine，改由 en_translationView 產出標準 2 元組編輯塊
    let html = "";
    if (window.en_translationView && typeof window.en_translationView._renderSegmentEditBlock === 'function') {
        html = window.en_translationView._renderSegmentEditBlock(nextIdx, "", "");
    } else {
        // 🛡️ 熔斷備援：若視圖衛星未導通，執行緊急地基佈署
        html = `
            <div class="segment-edit-block p-5 bg-slate-50/50 rounded-[1.8rem] border border-slate-100 mb-4 animate-slide-up">
                <div class="flex justify-between items-center mb-3">
                    <span class="text-[10px] font-black text-blue-500 uppercase">Segment #${nextIdx + 1}</span>
                    <button onclick="this.closest('.segment-edit-block').remove()" class="text-slate-300 hover:text-rose-400"><i class="fa-solid fa-xmark"></i></button>
                </div>
                <textarea class="edit-q-input w-full bg-white border-none rounded-xl p-3 text-sm font-bold text-slate-700 outline-none mb-2" placeholder="English..."></textarea>
                <textarea class="edit-a-input w-full bg-white border-none rounded-xl p-3 text-sm font-medium text-slate-500 outline-none" placeholder="Chinese..."></textarea>
            </div>
        `;
    }

    // 🚀 5. 物理投射與重連
    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = html;
    const newBlock = tempContainer.firstElementChild;
    list.appendChild(newBlock);

    // 🚀 6. 視覺與觸覺對焦：模擬物理生長體感
    requestAnimationFrame(() => {
        newBlock.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // 自動聚焦至第一個原文輸入框，縮短開發路徑
        newBlock.querySelector('textarea')?.focus();
    });

    if (navigator.vibrate) navigator.vibrate(8);
},


/** 🎙️ [Education] 英文品詞與語法機制調度 (V2026.ULTRA) */
showPosGuide(pos) {
    // 🚀 1. 數據純化：執行別名導通 (例如: 'v-ing' -> 'Gerund')
    const rawPOS = String(pos || "").trim();
    const targetKey = this.focusPOS ? this.focusPOS(rawPOS) : rawPOS;

    console.log(`📡 [EN-POS-Guide] 對焦語法領域: ${targetKey}`);

    // 🚀 2. 英美語專屬品詞數據庫 (Linguistic Core)
    const enPosLibrary = {
        'Gerund': {
            title: 'Gerund (動名詞)',
            tag: 'Noun-Function',
            desc: '將動詞轉化為名詞座標。在美式口語中，常作為句子的主體或介係詞後的受體。<br><br><span class="text-blue-600 font-mono text-[12px]">Example: "<b>Traveling</b> broadens the mind."</span>'
        },
        'Infinitive': {
            title: 'Infinitive (不定詞)',
            tag: 'Purpose/Intent',
            desc: '使用 "to + 原形動詞"。負責定義目的、意圖或未來的行動。與動名詞相比，更具備「指向性」。'
        },
        'Relative Clause': {
            title: 'Relative Clause (關係子句)',
            tag: 'Modifier',
            desc: '使用 who, which, that 建立的描述鏈條。負責為前面的名詞座標提供物理細節，而不需另開新句。'
        },
        'Phrasal Verb': {
            title: 'Phrasal Verb (短語動詞)',
            tag: 'Slang/Daily',
            desc: '動詞 + 介係詞的複合零件。這是美式口語的靈魂，語義通常與原始動詞完全物理脫鉤。'
        },
        'Modal Verb': {
            title: 'Modal Verb (助動詞)',
            tag: 'Tone Control',
            desc: '控制語氣的強弱與可能性 (can, should, must)。決定了語句的禮貌維度與確定性。'
        }
    };

    // 🚀 3. 磁區採樣與 Fallback 熔斷
    const info = enPosLibrary[targetKey] || {
        title: targetKey,
        tag: 'Grammar Component',
        desc: 'This grammar component plays a specific role in English sentence structure. Check usage examples for better alignment.'
    };

    // 🚀 4. 視圖組裝 (鎖定學習藍美學)
    const content = `
        <div class="space-y-6 animate-fade-in text-left">
            <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg uppercase tracking-wider border border-blue-100">
                    ${info.tag}
                </span>
            </div>
            
            <div class="p-6 bg-slate-50 rounded-[2.2rem] border border-slate-100 text-slate-600 shadow-inner">
                <h5 class="font-black text-slate-800 text-[16px] mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-microchip text-blue-400 text-xs"></i>
                    ${info.title}
                </h5>
                <div class="font-medium text-[13.5px] leading-relaxed text-justify">
                    ${info.desc}
                </div>
            </div>
            
            <p class="text-[10px] text-slate-300 italic text-center px-4 leading-relaxed">
                Artisan Tip: Understanding the "Function" of a word is key to mastering English sentence architecture.
            </p>
        </div>
    `;

    // 🚀 5. 實體彈窗點火 (對位全域 modalEngine)
    if (window.modalEngine) {
        modalEngine.create(
            'en-pos-guide-modal', 
            `🎓 Grammar Focus: ${info.title}`, 
            content, 
            `<button onclick="App.modalRemove('en-pos-guide-modal')" 
                     class="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-blue-100 transition-transform active:scale-95">
                Got it
            </button>`
        );
    }

    if (navigator.vibrate) navigator.vibrate(8);
},

/** 🎯 [Logic] 品詞語義對焦發動機：英美語專用版 (V2026.ULTRA) */
focusPOS(rawPOS) {
    if (!rawPOS) return 'Unknown';

    // 🚀 1. 物理純化：移除標點符號與隱形雜質，並轉換為小寫以利比對
    const cleanPOS = String(rawPOS).trim().toLowerCase().replace(/[.．]/g, '');

    // 🚀 2. 英美語別名導通表 (Acoustic Alias Map)
    // 💡 職人診斷：此表針對美式英語教學慣例設計，涵蓋了各種 AI 可能噴出的變體
    const enAliasMap = {
        // --- 名詞與代名詞軌道 ---
        'n': 'Noun', 'noun': 'Noun', 'nouns': 'Noun',
        'pron': 'Pronoun', 'pronoun': 'Pronoun',

        // --- 動詞與活用形軌道 ---
        'v': 'Verb', 'verb': 'Verb',
        'v-ing': 'Gerund', 'gerund': 'Gerund', 'present participle': 'Gerund',
        'to-v': 'Infinitive', 'infinitive': 'Infinitive',
        'phrasal verb': 'Phrasal Verb', 'pv': 'Phrasal Verb', 'v-prep': 'Phrasal Verb',
        'aux': 'Modal Verb', 'modal': 'Modal Verb', 'auxiliary': 'Modal Verb',

        // --- 描述性軌道 ---
        'adj': 'Adjective', 'adjective': 'Adjective',
        'adv': 'Adverb', 'adverb': 'Adverb',

        // --- 結構零件軌道 ---
        'prep': 'Preposition', 'preposition': 'Preposition',
        'conj': 'Conjunction', 'conjunction': 'Conjunction',
        'det': 'Determiner', 'article': 'Determiner',
        'rel': 'Relative Clause', 'relative': 'Relative Clause', 'clause': 'Relative Clause'
    };

    // 🚀 3. 執行語義對焦
    const standardName = enAliasMap[cleanPOS] || (rawPOS.charAt(0).toUpperCase() + rawPOS.slice(1));

    // 🚀 4. 數據監控 (Debug Console)
    if (!enAliasMap[cleanPOS] && window.debugConsole) {
        window.debugConsole.log(`[EN-POS-Miss] New terminal detected: ${rawPOS} -> ${standardName}`);
    }

    return standardName;
},

/** 🎯 [Logic] UI 標籤精簡發動機：英美語極簡版 (V2026.ULTRA) */
getShortPOS(rawPOS) {
    if (!rawPOS) return 'POS';

    // 🚀 1. 預處理：先透過 focusPOS 導通為標準全名，確保數據源一致性
    const standard = this.focusPOS ? this.focusPOS(rawPOS) : rawPOS;

    // 🚀 2. 逆向映射：定義 UI 專用極簡縮寫 (鎖定 4-5 字元以內)
    // 💡 職人診斷：縮寫後加點 "." 能營造出傳統字典的專業質感
    const shortMap = {
        'Noun': 'n.',
        'Pronoun': 'pron.',
        'Verb': 'v.',
        'Gerund': 'ger.',
        'Infinitive': 'inf.',
        'Phrasal Verb': 'phr.v.',
        'Modal Verb': 'mod.',
        'Adjective': 'adj.',
        'Adverb': 'adv.',
        'Preposition': 'prep.',
        'Conjunction': 'conj.',
        'Determiner': 'det.',
        'Relative Clause': 'rel.'
    };

    // 🚀 3. 執行物理壓縮
    const result = shortMap[standard] || standard;

    // 🚀 4. 佈局安全熔斷：若字串長度仍超過 6，執行截斷以防止 DOM 塌陷
    // 💡 職人協定：確保卡片標籤高度與寬度在 CSS 臨界值內
    if (result.length > 6) {
        return result.substring(0, 5) + '.';
    }

    return result;
},



/** 🧬 [Private] 空狀態渲染器：英美語磁區引導版 (V2026.ULTRA) */
_renderEmptyState(category) {
    console.log(`📡 [EN-Empty-State] 點亮 [${category}] 分區空狀態引導...`);
    
    // 🚀 1. 語義對焦：根據不同類別切換導引語
    const tips = {
        'Lyrics': 'Favorite English songs awaiting transcription...',
        'Tech': 'Documentation fragments not yet solidified.',
        'News': 'World events pending linguistic analysis.',
        'Study': 'New learning materials required for ignition.',
        '全部': 'No study fuel found in current track.'
    };

    const displayTip = tips[category] || tips['全部'];

    // 🚀 2. 構建極簡美感引導 HTML
    return `
        <div class="flex flex-col items-center justify-center py-24 px-10 text-center animate-fade-in">
            <div class="w-16 h-16 bg-slate-50 rounded-[2rem] flex items-center justify-center mb-6 shadow-sm border border-slate-100/50">
                <span class="text-2xl opacity-40">📭</span>
            </div>

            <h3 class="text-slate-800 font-black text-sm uppercase tracking-[0.2em] mb-2">No ${category} Fuel</h3>
            <p class="text-[11px] text-slate-400 font-medium leading-relaxed max-w-[200px] mb-8">
                ${displayTip}
            </p>

            <button onclick="en_translationEngine.switchRealtimeMode('text')" 
                    class="px-6 py-2.5 bg-white border border-slate-200 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest hover:border-blue-400 hover:text-blue-500 transition-all active:scale-95 shadow-sm">
                Ignite Production
            </button>
        </div>
    `;
},



// ============================================
//         教育與學習核心類 (EDU System)
// ============================================



/** ⚙️ [EDU-UI] 彈出：EN 教材生成選單 (CEFR 難度撥盤版) */
openEduMenu(itemId, segIdx) {
    console.log(`📡 [EN-EDU-Menu] 定位磁區: ${itemId} | 段落: ${segIdx}`);
    
    const modalId = 'en-edu-prompt-modal';
    // 🚀 核心 A：CEFR 能階對焦 (取代日文 JLPT 規格)
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    const tasks = [
        { id: 'vocab', name: 'Vocab / 單字', icon: '📖', color: 'text-blue-500' },
        { id: 'grammar', name: 'Grammar / 文法', icon: '📝', color: 'text-emerald-500' },
        { id: 'quiz', name: 'Quiz / 測驗', icon: '❓', color: 'text-amber-500' },
        { id: 'listening', name: 'Listening / 聽力', icon: '🎧', color: 'text-purple-500' }
    ];

    // 🚀 1. 構建能階撥盤與任務磁區
    const content = `
        <div class="space-y-8 p-2 animate-fade-in">
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">1. Target Level (CEFR)</label>
                <div class="grid grid-cols-6 gap-2" id="en-edu-level-selector">
                    ${levels.map(l => {
                        const isDefault = l === 'B1';
                        return `
                        <button onclick="en_translationEngine._selectEduLevel(this)" 
                                data-level="${l}"
                                class="en-edu-lvl-btn py-3 rounded-xl font-black text-[11px] transition-all border active:scale-90
                                ${isDefault ? 'bg-slate-900 text-white border-slate-900 shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent'}">
                            ${l}
                        </button>`;
                    }).join('')}
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">2. Production Module</label>
                <div class="grid grid-cols-2 gap-4">
                    ${tasks.map(t => `
                        <button onclick="en_translationEngine.executeEduGenerate('${itemId}', ${segIdx}, '${t.id}')" 
                                class="p-6 bg-white border border-slate-100 rounded-[2.2rem] text-left hover:border-blue-200 hover:shadow-xl hover:shadow-blue-50/50 transition-all active:scale-95 group">
                            <div class="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">${t.icon}</div>
                            <div class="font-black text-slate-800 text-[14px]">${t.name}</div>
                            <div class="text-[8px] text-blue-500 font-bold uppercase mt-1 tracking-tighter opacity-60">AI Fuel Ignition</div>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <p class="text-[9px] text-slate-300 text-center italic tracking-tight px-4">
                Artisan Tip: The AI will generate CEFR-aligned content based on your selection.
            </p>
        </div>
    `;

    // 🚀 2. 實體彈窗佈署 (對位全域 modalEngine)
    if (window.modalEngine) {
        modalEngine.create(modalId, '🎓 EN Study Engine', content, `
            <button onclick="App.modalRemove('${modalId}')" 
                    class="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[11px] tracking-widest uppercase active:scale-95 transition-all">
                Dismiss
            </button>
        `);
    }

    if (navigator.vibrate) navigator.vibrate(8);
},

/** 🧬 [Private] CEFR 難度撥盤切換核心：歸一化穩定版 (V2026.ULTRA.FIXED) */
_selectEduLevel(btn) {
    // 🚀 1. 數據感應與安全攔截
    if (!btn || !btn.dataset.level) return;
    
    console.log(`📡 [EN-Level-Pivot] 對焦 CEFR 能階: ${btn.dataset.level}`);

    // 🚀 2. 磁區範圍採樣
    const selector = btn.parentElement;
    if (!selector) return;

    // 💡 職人診斷：執行歸一化檢索，徹底封殺舊有的 .en_edu_lvl_btn 命名噪音
    const allButtons = selector.querySelectorAll('.en-edu-lvl-btn');

    // 🚀 3. 物理重置與狀態脫殼
    allButtons.forEach(b => {
        // 恢復預設：極簡灰、平整、低對比語感
        b.className = "en-edu-lvl-btn py-3 rounded-xl bg-slate-50 text-slate-400 border border-transparent font-black text-[11px] transition-all active:scale-95";
    });

    // 🚀 4. 主權注入：點亮選中項 (鎖定英美學習黑)
    // 💡 職人協定：使用 bg-slate-900 配合 shadow-lg 營造強烈「選中感」
    btn.className = "en-edu-lvl-btn py-3 rounded-xl bg-slate-900 text-white border-slate-900 font-black text-[11px] transition-all shadow-lg scale-105 z-10";

    // 🚀 5. 聲學與觸覺導通
    // 執行輕微震動回饋（5ms），類比實體旋鈕切換的「段落感」
    if (navigator.vibrate) navigator.vibrate(5);
},

/** 🚀 [EDU-Core] 合成並複製教育燃料 Prompt (V2026.ULTRA.FIXED) */
async executeEduGenerate(itemId, segIdx, taskType) {
    console.log(`📡 [EN-Prompt-Synthesis] Task: ${taskType} | Item: ${itemId} | Index: ${segIdx}`);

    // 🚀 1. 物理採樣：從 CEFR 撥盤模組抓取當前對焦難度
    // 💡 職人診斷：確保對位 en_translationView 生成的 .bg-slate-900 狀態標籤
    const levelBtn = document.querySelector('#en-edu-prompt-modal .en-edu-lvl-btn.bg-slate-900');
    const level = levelBtn ? levelBtn.dataset.level : 'B1'; 

    try {
        // 🚀 2. 磁區提領：從 TRANS_VAULT 獲取原文燃料
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        if (!record || !record.segments) {
            return uiManager.showToast('⚠️', "Study fuel not found");
        }

        // 🚀 3. 數據對位與歸一化
        const segment = record.segments[segIdx];
        if (!segment) return uiManager.showToast('⚠️', "Segment alignment failed");

        // 💡 多態相容：對應二維陣列 [EN, ZH] 或物件封裝
        const text = Array.isArray(segment) ? (segment[0] || "") : (segment.en || segment.原文 || "");
        if (!text) return uiManager.showToast('⚠️', "Source content is empty");

        // 🚀 4. 指令合成：呼叫英美語專屬模板發動機
        const renderFn = _promptTemplates[taskType];
        if (typeof renderFn !== 'function') throw new Error(`MODULE_MISSING: ${taskType}`);

        const fullPrompt = renderFn(level, text);

        // 🚀 5. 物理輸送：將合成後的超級指令送往剪貼簿
        await navigator.clipboard.writeText(fullPrompt.trim());

        // 🚀 6. 閉環回饋：執行資源回收與視覺點火
        const taskName = this._getTaskName ? this._getTaskName(taskType) : taskType.toUpperCase();
        uiManager.showToast('🪄', `[${level}] ${taskName} Prompt Copied`);
        
        // 🏆 CRITICAL FIX: 協定對位重連
        // 💡 職人協定：直接調用全域模態引擎進行物理移除，封殺 App 層級的斷路風險
        if (window.modalEngine && typeof window.modalEngine.remove === 'function') {
            window.modalEngine.remove('en-edu-prompt-modal');
        } else if (window.App && typeof window.App.modalRemove === 'function') {
            window.App.modalRemove('en-edu-prompt-modal');
        }

        // 🚀 7. 觸覺感應導通
        if (navigator.vibrate) navigator.vibrate([10, 30]);
        console.log(`✅ [Synthesis-Fixed] Theatre Protocol Locked: ${taskType}`);

    } catch (err) {
        console.error("❌ [EN-Synthesis-Collapse]:", err);
        uiManager.showToast('❌', "Prompt synthesis failed");
    }
},


/** 🧬 [Private] 語義映射器：轉換 Task ID 為中文名稱 (V2026.ULTRA) */
_getTaskName(id) {
    // 🚀 核心焊接：定義 ID 與 視覺名稱 的對位字典
    const taskMap = { 
        'vocab': '單字提取', 
        'grammar': '文法解析', 
        'quiz': '模擬測驗', 
        'listening': '聽力對話' 
    };

    // 💡 職人診斷：若命中字典則回傳中文，否則回傳原始 ID 首字母大寫 (Fallback)
    return taskMap[id] || (id.charAt(0).toUpperCase() + id.slice(1));
},

// ============================================
//             SRS 影子記憶發動機
// ============================================

/** 艾賓浩斯能階間隔協定：英美語專用軌道 (單位：分鐘)
 * 針對英文學習特性，微調初始間隔，強化短期記憶導通 
 */
SRS_STAGES: [1, 30, 720, 1440, 2880, 5760, 10080, 21600],

/** 🧠 [SRS-Algo] 計算英美語能階演進 (V2026.ULTRA.FIXED) */
async calculateSRS(currentId, isSuccess) {
    console.log(`📡 [EN-SRS-Compute] ID: ${currentId} | Result: ${isSuccess ? 'PASS' : 'FAIL'}`);

    try {
        // 🚀 1. 物理定位與廣譜指紋掃描
        // 💡 職人診斷：放寬判定範圍，涵蓋 en_v_, txt_en_, mic_en_, img_en_ 等所有英文軌道
        // 使用正則表達式進行「語系主權感應」，封殺日文數據污染
        const isEnglishTrack = /^(en_|txt_en_|mic_en_|img_en_|vlt_en_)/i.test(currentId) || currentId.includes('_en_');
        
        if (!isEnglishTrack) {
            console.error("❌ [SRS-Security-Block] 非英文軌道 ID，拒絕執行能階演進", currentId);
            return null;
        }

        // 🚀 2. 影子磁區提領
        const shadow = await dbManager.get(dbManager.STORES.SRS_META, currentId);
        if (!shadow) {
            console.warn(`⚠️ [SRS-Miss] 找不到節點: ${currentId}，啟動虛擬 Stage 0`);
        }

        // 🚀 3. 能階演進邏輯 (Ebbinghaus Calibration)
        let currentStage = shadow?.stage || 0;
        let nextStage = currentStage;

        if (isSuccess) {
            // 🎯 成功路徑：能階演進 (+1)
            nextStage = Math.min(this.SRS_STAGES.length - 1, currentStage + 1);
        } else {
            // 🎯 失敗路徑：物理墜毀 (回退 2 階)
            // 💡 理由：英文單字具備 IPA 與 Accent 多重維度，遺忘成本高，需快速重回短期記憶路網
            nextStage = Math.max(0, currentStage - 2);
        }

        // 🚀 4. 時間座標推算
        const intervalMinutes = this.SRS_STAGES[nextStage];
        const nextReviewTs = Date.now() + (intervalMinutes * 60 * 1000);

        // 🚀 5. 構建演進指紋
        const srsPayload = {
            stage: nextStage,
            nextReview: nextReviewTs,
            lastResult: isSuccess ? 'PASS' : 'FAIL',
            lastUpdated: Date.now()
        };

        if (window.debugConsole) {
            window.debugConsole.log(`[SRS-Evolution] ID: ${currentId} -> Stage ${nextStage}`);
        }

        return srsPayload;

    } catch (err) {
        console.error("❌ [EN-SRS-Algo-Collapse]:", err);
        return null;
    }
},


/** 🔄 [Shadow-Tool] 燃料指紋化：英美語 8 元組脫殼協定 (V2026.ULTRA.FIXED) */
_formatToShadowFingerprint(item) {
    // 🚀 1. 核心數據採樣 (對位我們剛修好的 8-Tuple 具名物件結構)
    const src = item.data || item;
    
    // 💡 職人診斷：同時兼容「具名屬性」與「索引屬性」，確保數據提領零死角
    const word = String(src.word || src["0"] || src[0] || "Unknown").trim();
    const ipa = String(src.reading || src.phonetic || src["1"] || src[1] || "").trim();
    const trans = String(src.translation || src["5"] || src[5] || "").trim();

    // 🚀 2. 能階主權校準 (CEFR Focus)
    let rawLevel = item.level || src.level || "B1";
    let sanitizedLevel = String(rawLevel).trim().toUpperCase();

    // 物理熔斷防禦
    if (!['A1','A2','B1','B2','C1','C2'].includes(sanitizedLevel)) {
        sanitizedLevel = 'B1'; 
    }

    // 🚀 3. 影子格式封裝 (SRS 標準對位)
    // 💡 職人協定：將音標正式命名為 phonetic，並保留 reading 欄位以導通舊有 UI 邏輯
    return {
        word: word,
        phonetic: ipa,                    // 🔐 核心聲學軌道：顯性音標命名
        reading: ipa,                     // 🧬 物理相容軌道：對接舊版 SRS 顯示器
        translation: trans,
        level: sanitizedLevel,            // 鎖定 CEFR 指紋
        lang: 'EN',                       // 🧬 語系主權隔離
        type: 'EN_VOCAB_8',               // 軌道識別
        stage: 0,                         // 初始能階
        nextReview: Date.now(),           // 立即進入冷卻隊列
        tags: [sanitizedLevel, 'Vocab'],
        timestamp: Date.now()
    };
},

/** 🔄 [Shadow-Relay] 執行指紋投射：呼叫洗滌器並物理寫入 SRS 磁區 (V2026.ULTRA) */
async syncToShadow(item) {
    // 🚀 1. 物理入口攔截與安全校準
    if (!item || (!item.id && !item["0"])) {
        console.warn("⚠️ [EN-Shadow-Void] 無效燃料，投射中斷");
        return null;
    }

    try {
        // 🚀 2. 燃料格式化 (呼叫我們先前焊接好的洗滌器)
        // 💡 職人診斷：確保數據轉化為具備 lang: 'EN' DNA 的影子格式
        const shadowFingerprint = this._formatToShadowFingerprint(item);
        
        // 🚀 3. ID 穩定性焊接 (ID Stability)
        // 優先保留傳入物件的 ID，若無則生成具備 EN 指紋的唯一 ID
        shadowFingerprint.id = item.id || `en_v_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

        // 🚀 4. 物理固化：執行磁區寫入 (單向投射)
        // 💡 職人協定：直接點火 dbManager 的 SRS 磁區
        if (dbManager && typeof dbManager.put === 'function') {
            await dbManager.put(dbManager.STORES.SRS_META, shadowFingerprint);
            
            console.log(`📡 [EN-Shadow-Fixed] 指紋投射成功: ${shadowFingerprint.word} | ID: ${shadowFingerprint.id}`);
            
            // 🚀 5. 數據與 Haptic 反饋
            if (window.debugConsole) {
                window.debugConsole.log(`[SRS-Link] EN Node Projected: ${shadowFingerprint.word}`);
            }
            
            return shadowFingerprint;
        } else {
            throw new Error("DB_SRS_STORE_OFFLINE");
        }

    } catch (err) {
        console.error("❌ [EN-Shadow-Collapse] 投射路網異常:", err);
        return null;
    }
},

/** 💧 [Hydration-Core] 數據提領發動機：英美語真值對焦版 (V2026.ULTRA.FINAL) */
async getHydratedTrainingItem(id) {
    console.log(`📡 [EN-Hydration-Ignition] 啟動真值提領 | ID: ${id}`);

    try {
        // 🚀 1. ID 結構診斷與座標解析
        const vMarker = "_en_v_";
        const vIndexPos = id.lastIndexOf(vMarker);
        const clean = (val) => (val === undefined || val === null || val === 'undefined') ? "" : String(val).trim();

        let rawData = null;
        let parentLevel = 'B1';
        let parentId = null;

        // 🚀 2. 執行分流提領協定
        if (vIndexPos === -1) {
            // 軌道 A：處理單一獨立磁區 (Non-Composite)
            rawData = await dbManager.get(dbManager.STORES.TRANS_VAULT, id);
            if (!rawData) return null;
        } else {
            // 軌道 B：處理 8 元組複合磁區 (Package Sub-item)
            parentId = id.substring(0, vIndexPos);
            const itemIdx = parseInt(id.substring(vIndexPos + vMarker.length));
            if (isNaN(itemIdx)) throw new Error("ID_INDEX_COLLAPSE");

            const parentPkg = await dbManager.get(dbManager.STORES.TRANS_VAULT, parentId);
            if (!parentPkg || !parentPkg.edu_vocab) return null;
            
            rawData = parentPkg.edu_vocab[itemIdx];
            parentLevel = parentPkg.level || 'B1';
        }

        if (!rawData) return null;

        // 🚀 3. 聲學自癒引擎 (Acoustic Self-Healing)
        // 💡 職人診斷：確保 audioText 提取純淨 Word，封殺 ( ) 內的補充說明
        const extractPureSpeech = (text) => {
            return clean(text).replace(/[\(（][^）\)]+[\)）]/g, '').trim();
        };

        // 🚀 4. 數據歸一化對位 (Normalization Matrix)
        // 索引對應：[0:Word, 1:IPA, 2:POS, 3:Accent, 4:Variant, 5:Trans, 6:Example, 7:Ex_Trans]
        const word = clean(rawData["0"] || rawData.word || rawData.原文 || rawData.q);
        const ipa = clean(rawData["1"] || rawData.reading || rawData.ipa || rawData.phonetic);
        
        return {
            id: id,
            parentId: parentId,
            word: word,
            reading: ipa,                                 // 🔐 聲學指紋：IPA 音標
            phonetic: ipa,                                // 兼容性冗餘
            pos: clean(rawData["2"] || rawData.pos),
            accent: clean(rawData["3"] || rawData.accent),
            variant: clean(rawData["4"] || rawData.variant),
            translation: clean(rawData["5"] || rawData.translation || rawData.trans || rawData.翻譯 || rawData.a),
            example: clean(rawData["6"] || rawData.example || rawData.例句),
            exampleTrans: clean(rawData["7"] || rawData.exampleTrans || rawData.exTrans || rawData.例句翻譯),
            level: (rawData.level || parentLevel).toUpperCase(),
            
            // 💡 聲學導通：TTS 專用軌道，確保發音不含括號雜質
            audioText: extractPureSpeech(word),
            
            type: (vIndexPos !== -1) ? 'EN_VOCAB_8' : 'SINGLE_FUEL',
            timestamp: Date.now()
        };

    } catch (err) {
        console.error("❌ [EN-Hydration-Fatal]:", err);
        return null;
    }
},

// ============================================
//             數據維護類
// ============================================


/** 🗑️ [Data-Reclaim] 物理回收：刪除單筆英文紀錄或文章包 (V2026.ULTRA) */
async deleteArticleRecord(id) {
    console.log(`📡 [EN-Reclaim-Ignition] 請求抹除磁區 | ID: ${id}`);

    // 🚀 1. 職人防禦協定：執行物理抹除前的交互確認
    // 💡 職人診斷：使用英文語境提示，強化美式學習模組的沉浸感
    const isConfirmed = await new Promise(resolve => {
        if (window.uiManager && typeof uiManager.showConfirm === 'function') {
            uiManager.showConfirm('⚠️', "Are you sure you want to permanently delete this study record?", resolve);
        } else {
            resolve(confirm("🚨 Delete this English study record permanently?"));
        }
    });

    if (!isConfirmed) return;

    try {
        // 🚀 2. 磁區定位與物理切除
        if (dbManager) {
            // 💡 職人協定：直接對準 TRANS_VAULT 執行原子級刪除
            await dbManager.delete(dbManager.STORES.TRANS_VAULT, id);
            
            console.log(`🧹 [Vault-Reclaimed] ID: ${id} 已從物理磁區抽離`);

            // 🚀 3. 視圖路網重連 (Hot-Refresh)
            // 根據目前鎖定的分類鎖定，刷新歷史列表
            if (typeof this.loadLiveHistory === 'function') {
                // 回歸當前標籤，若無則預設全部
                const target = (this.lockedCategory === 'AUTO' || !this.lockedCategory) ? '全部' : this.lockedCategory;
                await this.loadLiveHistory(target);
            }

            // 🚀 4. 成功回饋與 Haptic 反饋
            uiManager.showToast('🧹', "Record Reclaimed");
            if (navigator.vibrate) navigator.vibrate([10, 40]);
        } else {
            throw new Error("DB_MANAGER_OFFLINE");
        }
    } catch (err) {
        console.error("❌ [EN-Reclaim-Collapse]:", err);
        uiManager.showToast('⚠️', "Failed to reclaim data from vault");
    }
},

/** 🧹 [Atomic-Reclaim] 教材單項物理回收基礎邏輯 (V2026.ULTRA) */
async deleteEduItem(articleId, typeName, index) {
    console.log(`📡 [EN-Atomic-Purge] 啟動磁區切除 | Package: ${articleId} | Type: ${typeName} | Index: ${index}`);

    try {
        // 🚀 1. 物理定位磁區
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, articleId);
        
        // 💡 職人診斷：精確映射 UI 名稱至磁區內部 Key 值
        const tabKeyMap = { 
            '單字': 'edu_vocab', 
            '文法': 'edu_grammar', 
            '測驗': 'edu_quiz', 
            '聽力': 'edu_listening' 
        };
        const storageKey = tabKeyMap[typeName];

        if (!record || !record[storageKey]) {
            console.error("❌ [EN-Purge-Miss] 找不到目標磁區或軌道已斷路");
            return false;
        }

        // 🚀 2. 執行物理切除 (Array Splice)
        // 💡 職人協定：執行此操作前，應確保 Index 已通過 UI 層校準
        record[storageKey].splice(index, 1);

        // 🚀 3. 磁區自癒與純化
        // 若該分類下已無燃料，物理刪除 Key 值以確保 JSON 結構純淨 (不留空陣列)
        if (record[storageKey].length === 0) {
            delete record[storageKey];
            console.log(`🧹 [EN-Structure-Clean] ${typeName} 軌道燃料耗盡，磁區物理除磁`);
        }

        // 🚀 4. 實體固化至 IndexedDB
        record.lastModified = Date.now();
        await dbManager.put(dbManager.STORES.TRANS_VAULT, record);

        // 🚀 5. 狀態同步 (State Calibration)
        // 確保記憶體內的 state.translationVault 同步更新，封殺視覺延遲
        if (window.state && window.state.translationVault) {
            const vIdx = window.state.translationVault.findIndex(it => it.id === articleId);
            if (vIdx !== -1) window.state.translationVault[vIdx] = { ...record };
        }

        console.log(`✅ [EN-Atomic-Fixed] ${typeName} 碎片已從物理磁區回收`);
        return true;

    } catch (err) {
        console.error("❌ [EN-Atomic-Collapse] 物理回收失敗:", err);
        return false;
    }
},

/** 🧬 [Private] 影子座標解析器：精確計算 SRS 磁區指紋 ID (V2026.ULTRA) */
_resolveShadowId(parentId, item, index, typeName) {
    // 🚀 1. 物理攔截：僅「單字」與「文法」具備影子記憶軌道
    if (typeName !== '單字' && typeName !== '文法') {
        return null;
    }

    // 🚀 2. 優先權 1：燃料自帶指紋 (Explicit ID)
    // 💡 職人診斷：若數據物件中已固化 ID，代表它是具備獨立主權的記憶節點
    if (item && item.id) {
        return item.id;
    }

    // 🚀 3. 優先權 2：複合座標合成 (Composite Coordinate)
    // 💡 職人協定：當單字嵌套於文章包內且無獨立 ID 時，採用物理座標合成法
    // 格式規範：{文章包ID}_en_v_{陣列索引}
    if (parentId && index !== undefined && index !== null) {
        // 封殺非法索引，確保 ID 導通安全性
        const safeIdx = parseInt(index);
        if (!isNaN(safeIdx)) {
            const shadowId = `${parentId}_en_v_${safeIdx}`;
            
            if (window.debugConsole) {
                window.debugConsole.log(`📡 [EN-ID-Resolved] Synthetic Coordinate: ${shadowId}`);
            }
            return shadowId;
        }
    }

    // 🚀 4. 熔斷機制：若無法定位座標，回傳 null 以防止誤刪全域磁區
    console.warn(`⚠️ [EN-ID-Resolver-Miss] 無法為 ${typeName} 定位影子座標 (Index: ${index})`);
    return null;
},

/** 🎙️ [Education] 點亮美式聲學機制教學 (V2026.ULTRA.EN_ACOUSTIC) */
showAccentGuide() {
    console.log("📡 [EN-Acoustic-Guide] 啟動美式語流波形對焦...");

    const content = `
        <div class="space-y-6 text-slate-700 animate-fade-in">
            <p class="text-[13px] leading-relaxed">
                美式英語是「壓力節奏」語言。掌握 <b class="text-blue-600">重音能量</b> 與 <b class="text-blue-600">意群停頓</b> 是達成 Native 聽感的物理核心：
            </p>
            
            <div class="grid grid-cols-1 gap-4">
                <div class="p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="font-black text-blue-600 text-[14px]">Word Stress (單字重音)</h5>
                        <div class="flex gap-1 items-end h-6">
                            <div class="w-2 h-2 bg-slate-200 rounded-full"></div>
                            <div class="w-4 h-5 bg-blue-500 rounded-t-lg"></div>
                            <div class="w-2 h-2 bg-slate-200 rounded-full"></div>
                        </div>
                    </div>
                    <p class="text-[11.5px] opacity-90 leading-relaxed">
                        重音節音量更 <b class="text-blue-700">強</b>、音調更 <b class="text-blue-700">高</b>、母音更 <b class="text-blue-700">長</b>。<br>
                        <span class="font-mono text-[10px] bg-white/50 px-1">Example: pho-to-GRAPH-ic</span>
                    </p>
                </div>

                <div class="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="font-black text-emerald-600 text-[14px]">Thought Groups (意群停頓)</h5>
                        <div class="flex gap-2 items-center">
                            <div class="w-6 h-1 bg-emerald-400 rounded-full"></div>
                            <div class="w-1 h-4 bg-slate-300 rounded-full"></div>
                            <div class="w-10 h-1 bg-emerald-400 rounded-full"></div>
                        </div>
                    </div>
                    <p class="text-[11.5px] opacity-90 leading-relaxed">
                        長句中依據語義物理切分為多個段落。在每個意群末尾會有微小的 <b class="text-emerald-700">Pitch Reset (音調重置)</b>，這也是系統自動加入 <b class="text-emerald-700">「,」</b> 的原因。
                    </p>
                </div>

                <div class="p-5 bg-amber-50/50 rounded-3xl border border-amber-100">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="font-black text-amber-600 text-[14px]">Intonation (句語調)</h5>
                        <svg class="w-12 h-6 text-amber-500" viewBox="0 0 50 20">
                            <path d="M5,15 Q25,5 45,15" fill="none" stroke="currentColor" stroke-width="3" />
                        </svg>
                    </div>
                    <p class="text-[11.5px] opacity-90 leading-relaxed">
                        <b class="text-amber-700">Rising (上揚)</b>：用於一般疑問句或表達驚訝。<br>
                        <b class="text-amber-700">Falling (下降)</b>：用於陳述句或提供確定訊息。
                    </p>
                </div>
            </div>
            
            <p class="text-[10px] text-slate-400 italic text-center pt-2 uppercase tracking-widest">
                Acoustic Dynamics Layer // V2026.ULTRA
            </p>
        </div>
    `;

    // 🚀 執行實體點火 (對位 modalEngine)
    if (window.modalEngine) {
        modalEngine.create(
            'en-accent-guide-modal', 
            '🎙️ English Acoustic Logic', 
            content, 
            `<button onclick="App.modalRemove('en-accent-guide-modal')" 
                     class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs transition-transform active:scale-95 shadow-xl">
                Master the Rhythm
            </button>`
        );
    }
    
    if (navigator.vibrate) navigator.vibrate(8);
},

/** 🔘 [Physical-Maintenance] 燃料注入面板控制中心 (V2026.ULTRA) */
toggleFuelPanel(itemId) {
    console.log(`📡 [EN-Fuel-Gate] 觸發燃料注入面板狀態翻轉 | ID: ${itemId}`);

    // 🚀 1. 物理座標定位 (對位燃料輸入容器)
    const panel = document.getElementById(`fuel-panel-${itemId}`);
    if (!panel) {
        console.error(`❌ [EN-Gate-Miss] 找不到目標面板: fuel-panel-${itemId}`);
        return;
    }

    // 🚀 2. 狀態感應與物理切換
    const isHidden = panel.classList.contains('hidden');

    if (isHidden) {
        // [執行：閘門啟動]
        panel.classList.remove('hidden');
        panel.classList.add('animate-slide-down'); // 執行工業級展開動畫
        
        // 🚀 3. 自動對焦協定 (Auto-Focus Strategy)
        // 💡 職人診斷：展開後立即鎖定 Textarea，讓使用者能直接執行 Command+V 注入
        const input = panel.querySelector('textarea');
        if (input) {
            input.focus();
            // 物理捲動對位：確保面板處於視窗導通位置
            input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        
        console.log(`🏁 [EN-Gate-Open] 燃料入口已對焦，準備接收 JSON 燃料`);
    } else {
        // [執行：閘門關閉]
        panel.classList.remove('animate-slide-down');
        panel.classList.add('hidden');
        
        // 🚀 4. 緩衝區清理：若面板收合，主動清空未送出的殘餘數據
        const input = panel.querySelector('textarea');
        if (input) input.value = "";
        
        console.log(`🧹 [EN-Gate-Closed] 燃料入口已鎖定，緩衝區物理除磁`);
    }

    // 🚀 5. 觸覺反饋導通
    if (navigator.vibrate) navigator.vibrate(5);
},

/** 🧹 [Physical-Maintenance] 任務收尾：清理介面與重連視圖 (V2026.ULTRA) */
async _finalizeInjection(itemId, tabName, inputEl) {
    console.log(`📡 [EN-Refinery-End] 注入任務完成，執行掃尾協定 | Tab: ${tabName}`);

    // 🚀 1. 物理閘門鎖定 (UI Recovery)
    // 💡 職人診斷：呼叫先前焊接好的 toggleFuelPanel 執行面板物理收合
    if (typeof this.toggleFuelPanel === 'function') {
        this.toggleFuelPanel(itemId);
    }

    // 🚀 2. 數據緩衝區物理除磁 (Data Sanitization)
    // 若傳入輸入框元件，物理清空殘餘內容以釋放記憶體
    if (inputEl) {
        inputEl.value = "";
    }

    // 🚀 3. 視圖重連與路網刷新 (View Re-focus)
    // 💡 職人協定：強制重新呼叫 switchArticleTab，讓 UI 即刻顯影剛注入的新教材卡片
    if (typeof this.switchArticleTab === 'function') {
        console.log(`🔄 [EN-View-Refresh] 重新導通教材軌道: ${tabName}`);
        await this.switchArticleTab(itemId, tabName);
    }

    // 🚀 4. Haptic Feedback 閉環回饋
    // 執行一段輕快的物理震動，類比「數據對位成功」的機械感
    if (navigator.vibrate) {
        navigator.vibrate([10, 30, 10]);
    }

    if (window.debugConsole) {
        window.debugConsole.log(`[Injection-Complete] Fuel solidified for ${tabName}.`);
    }
},



/** 🧹 [Chain-Reclaim] 連鎖切除：同步回收教材燃料與影子指紋 (V2026.ULTRA) */
async deleteEduItemWithShadow(itemId, typeName, index) {
    console.log(`📡 [EN-Chain-Reclaim] 啟動連鎖切除 | ID: ${itemId} | Type: ${typeName} | Index: ${index}`);

    try {
        // 🚀 1. 磁區定位
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        const tabKeyMap = { 
            '單字': 'edu_vocab', 
            '文法': 'edu_grammar', 
            '測驗': 'edu_quiz', 
            '聽力': 'edu_listening' 
        };
        const storageKey = tabKeyMap[typeName];

        if (!record || !record[storageKey]) {
            throw new Error("TARGET_DATA_NOT_FOUND");
        }

        // 🚀 2. 影子座標計算 (Shadow ID Identification)
        // 💡 職人診斷：針對「單字」與「文法」，我們必須精確合成其影子 ID 指紋
        // 格式對位：{parentId}_en_v_{index} 
        const targetItem = record[storageKey][index];
        const shadowId = (typeName === '單字' || typeName === '文法') 
            ? `${itemId}_en_v_${index}` 
            : null;

        // 🚀 3. 執行物理移除事務 (Atomic Transaction Logic)
        // 從原始文章包磁區中剪下該碎片
        record[storageKey].splice(index, 1);

        const promises = [
            dbManager.put(dbManager.STORES.TRANS_VAULT, record) // 更新主磁區
        ];

        // 🚀 4. 影子磁區連鎖切除
        if (shadowId) {
            console.log(`🧹 [Shadow-Purge] 同步抹除影子指紋: ${shadowId}`);
            promises.push(dbManager.delete(dbManager.STORES.SRS_META, shadowId));
        }

        // 執行批次處理，確保原子級導通
        await Promise.all(promises);

        // 🚀 5. 磁區自癒：若類別燃料耗盡，物理移除空軌道
        if (record[storageKey].length === 0) {
            delete record[storageKey];
            await dbManager.put(dbManager.STORES.TRANS_VAULT, record);
        }

        // 🚀 6. 狀態機同步與視圖重連
        // 💡 職人協定：執行完畢後呼叫 switchArticleTab 重新渲染當前教材分頁
        if (typeof this.switchArticleTab === 'function') {
            await this.switchArticleTab(itemId, typeName);
        }

        uiManager.showToast('🧹', `${typeName} fuel & shadow reclaimed`);
        if (navigator.vibrate) navigator.vibrate([10, 30]);

    } catch (err) {
        console.error("❌ [EN-Chain-Reclaim-Collapse]:", err);
        uiManager.showToast('⚠️', "Reclaim sequence failed");
    }
},

/** 💾 [Atomic-Update] 數據持久化：儲存編輯後的英文教材內容 (V2026.ULTRA) */
async saveEduEdit(itemId, tabName, idx) {
    console.log(`📡 [EN-Edu-Update] 啟動磁區更新 | ID: ${itemId} | Tab: ${tabName} | Index: ${idx}`);

    const input = document.getElementById(`edit-input-${itemId}-${idx}`);
    if (!input || !input.value.trim()) return;

    try {
        let rawValue = input.value.trim();
        let updatedItem;

        // 🚀 1. 原子級解析策略：封殺非法轉義導致的 JSON 斷路
        try {
            // 優先嘗試標準解析
            updatedItem = JSON.parse(rawValue);
        } catch (e) {
            console.warn("📡 [EN-JSON-Fix] 解析受阻，嘗試執行物理換行與引號焊接...");
            try {
                // 處理手動鍵入時常見的換行與引號雜質
                const processed = rawValue.replace(/\n/g, "\\n").replace(/\r/g, "");
                updatedItem = JSON.parse(processed);
            } catch (e2) {
                // 🏆 終極手段：物件構造器提領 (封殺所有字串轉義錯誤)
                updatedItem = (new Function(`return (${rawValue})`))();
            }
        }

        // 🚀 2. 磁區重連
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        const tabKeyMap = { 
            '單字': 'edu_vocab', 
            '文法': 'edu_grammar', 
            '測驗': 'edu_quiz', 
            '聽力': 'edu_listening' 
        };
        const storageKey = tabKeyMap[tabName];

        if (record && record[storageKey] && record[storageKey][idx]) {
            // 🚀 3. 數據對位洗滌 (Data Alignment)
            // 確保 level 始終維持 CEFR 大寫規範
            if (updatedItem.level) {
                updatedItem.level = String(updatedItem.level).toUpperCase();
            }

            // 🚀 4. 實體固化至磁區
            record[storageKey][idx] = updatedItem;
            record.lastModified = Date.now();
            
            await dbManager.put(dbManager.STORES.TRANS_VAULT, record);
            
            // 🚀 5. 資源回收與視圖導通
            uiManager.showToast('💾', `${tabName} Data Solidified`);
            
            // 關閉編輯面板
            this.toggleEditMode(itemId, idx);
            
            // 重新刷新該分頁內容，確保視覺與磁區數據對齊
            await this.switchArticleTab(itemId, tabName);

            // 🚀 6. 影子同步預備 (若為單字且具備影子 ID)
            const shadowId = `${itemId}_en_v_${idx}`;
            const existingShadow = await dbManager.get(dbManager.STORES.SRS_META, shadowId);
            if (existingShadow && tabName === '單字') {
                console.log("📡 [Shadow-Sync] 同步更新影子磁區內容...");
                const newShadow = this._formatToShadowFingerprint(updatedItem);
                newShadow.id = shadowId;
                newShadow.parentId = itemId;
                // 繼承原有的學習進度 (重要！)
                newShadow.stage = existingShadow.stage;
                newShadow.nextReview = existingShadow.nextReview;
                await dbManager.put(dbManager.STORES.SRS_META, newShadow);
            }

        } else {
            throw new Error("STORAGE_TARGET_MISSING");
        }
    } catch (err) {
        console.error("❌ [EN-Save-Edit-Collapse]:", err);
        uiManager.showToast('⚠️', "Invalid data format. Please check brackets.");
    }
},

/** 🔄 [UI-Toggle] 狀態切換器：切換卡片編輯/顯示模式 (V2026.ULTRA) */
toggleEditMode(itemId, idx) {
    // 🚀 1. 物理座標定位
    const displayId = `display-content-${itemId}-${idx}`;
    const panelId = `edit-panel-${itemId}-${idx}`;
    
    const displayContent = document.getElementById(displayId);
    const editPanel = document.getElementById(panelId);

    if (!displayContent || !editPanel) {
        console.warn(`⚠️ [EN-UI-Miss] 無法定位卡片軌道: ${itemId} @ ${idx}`);
        return;
    }

    // 🚀 2. 物理狀態翻轉 (Atomic Flip)
    const isEditing = displayContent.classList.contains('hidden');

    if (isEditing) {
        // [進入顯示態]
        displayContent.classList.remove('hidden');
        editPanel.classList.add('hidden');
        console.log(`📡 [EN-UI-Stable] Card ${idx} returned to display mode.`);
    } else {
        // [進入編輯態]
        displayContent.classList.add('hidden');
        editPanel.classList.remove('hidden');
        
        // 🚀 3. 自動對焦：將游標置入文字編輯磁區
        const textarea = editPanel.querySelector('textarea');
        if (textarea) {
            textarea.focus();
            // 物理捲動至視窗中心，確保編輯不被遮擋
            textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        console.log(`📡 [EN-UI-Focus] Card ${idx} ignition: Edit mode active.`);
    }

    // 🚀 4. 觸覺與動畫導通
    if (navigator.vibrate) navigator.vibrate(8);
},


/** 🎙️ [Acoustic-Relay] 聲學中繼站：英美語人格調度版 (V2026.ULTRA.FIXED) */
async speakSegment(text, articleId = null) {
    // 🛡️ 1. 物理入口攔截
    if (!text || !window.en_audioManager) {
        console.warn("⚠️ [EN-Acoustic-Void] 聲學發動機未就緒或燃料為空");
        return;
    }

    // 🚀 2. 數據提純：排除陣列包裝與空白雜質
    const rawContent = Array.isArray(text) ? String(text[0]) : String(text);
    const cleanText = rawContent.trim();
    
    // 🚀 3. 角色指紋識別 (Optimized Dialogue Sensing)
    // 💡 職人診斷：使用強化的正則表達式，支持「單詞/複詞角色名 + 冒號」格式
    // 範例匹配: "A:", "Waitress:", "Officer Smith:", "Customer A:"
    const isDialogue = /^([A-Z][a-zA-Z]*(\s[A-Z][a-zA-Z]*)?)\s*[:：]/.test(cleanText);
    const safeArticleId = (articleId && articleId !== 'null') ? String(articleId) : null;

    try {
        // 🚀 4. 人格採樣與耦合 (State-Driven Persona)
        // 💡 職人協定：強制與引擎內的 currentDuo 狀態對焦，若真空則啟動緊急抽樣
        if (!this.currentDuo) {
            console.log("📡 [EN-Acoustic-Weld] Persona vacuum, auto-sampling...");
            this._theatreRefreshDuo();
        }
        const { roleA, roleB } = this.currentDuo;

        // 🚀 5. 分流執行協定：劇場模式 vs 單軌精煉
        if (isDialogue) {
            // 軌道 A：劇場演繹軌道 (Duo-Channel Focus)
            console.log(`🎭 [EN-Acoustic-Theatre] Aligned with Persona: ${roleA.id} & ${roleB.id}`);
            
            // 優先權：1. 文章專屬聲學配置 -> 2. 全域鎖定 Duo
            if (safeArticleId) {
                const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, safeArticleId);
                if (record && record.acousticConfig) {
                    return await window.en_audioManager.speak(
                        cleanText, 
                        record.acousticConfig.roleA, 
                        record.acousticConfig.roleB
                    );
                }
            }

            // 執行當前鎖定的人格雙聲道播報
            await window.en_audioManager.speak(cleanText, roleA, roleB);

        } else {
            // 軌道 B：單軌精煉軌道 (Standard US Phonetics)
            // 用於單字回饋、文法例句，維持乾淨的單一美語音頻
            console.log(`📢 [EN-Acoustic-Mono] Standard American focus.`);
            await window.en_audioManager.speak(cleanText);
        }

    } catch (err) {
        console.error("❌ [EN-Acoustic-Relay-Collapse]:", err);
        // 救援軌道：降級至系統預設美語播報，封殺無聲風險
        if (window.en_audioManager.speak) {
            window.en_audioManager.speak(cleanText);
        }
    }
},


/** ⚡ 5. 閃光燈輔助 */
async toggleCameraFlash() {
    if (!this.currentStream) return;
    const track = this.currentStream.getVideoTracks()[0];
    try {
        const caps = track.getCapabilities();
        if (caps.fillLightMode) {
            const currentMode = track.getSettings().fillLightMode;
            const newMode = currentMode === 'flash' ? 'off' : 'flash';
            await track.applyConstraints({ advanced: [{ fillLightMode: newMode }] });
            uiManager.showToast('⚡', `Flash: ${newMode.toUpperCase()}`);
        } else {
            uiManager.showToast('ℹ️', "Hardware not supporting flash");
        }
    } catch(e) { console.warn("Flash control blocked by hardware."); }
},


/** 🎭 [Command-Center] 劇場指令合成發動機：英美語人格演繹版 (V2026.ULTRA) */
async theatreCopyPrompt(itemId) {
    console.log(`📡 [EN-Theatre-Ignition] 啟動靈魂指令合成 | ID: ${itemId}`);

    try {
        // 🚀 1. 物理磁區與人格採樣
        const pkg = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        if (!pkg) return uiManager.showToast('⚠️', "Data link broken");

        // 💡 職人診斷：若 currentDuo 尚未初始化，強制觸發一次隨機抽樣
        if (!this.currentDuo) {
            this._theatreRefreshDuo();
        }
        const { roleA, roleB } = this.currentDuo;

        // 🚀 2. 提取素材脈絡與能階對焦
        const contextText = pkg.segments.slice(0, 3).map(s => s[0]).join('\n');
        // 優先從 UI 撥盤抓取最新能階，若無則回溯磁區
        const levelBtn = document.querySelector('#en-edu-level-selector .bg-slate-900');
        const level = levelBtn ? levelBtn.dataset.level : (pkg.level || 'B1');

        // 🚀 3. 指令焊接：物理注入角色設定與聲學協定
        const prompt = `你現在是 TravelFlow V2026.ULTRA 英美劇場演繹專家。
請模擬以下兩位人格，針對提供的「素材背景」展開一場深度的美式口語對話。

🎭 [Character A]: ${roleA.name} 
- Profile: ${roleA.id.includes('Male') ? 'A professional male expert.' : 'A sophisticated female professional.'}
- Tone: ${roleA.rate > 1 ? 'Fast-paced, energetic.' : 'Calm, authoritative.'}

🎭 [Character B]: ${roleB.name}
- Profile: ${roleB.id.includes('Female') ? 'A dynamic female learner/peer.' : 'A casual male conversationalist.'}
- Tone: ${roleB.pitch > 0.3 ? 'High-pitched, inquisitive.' : 'Steady, supportive.'}

🎯 [Target Level]: CEFR ${level}
[Context Summary]:
${contextText}

🚨 【核心演繹協定】：
1. **人格主權**：對話必須體現兩人地位與性格的物理差異。A 應展現專業見解，B 應展現好奇或實踐導向的追問。
2. **美式口語 DNA**：加入自然填充詞 (well, honestly, like, to be fair) 與意群停頓 (Thought Groups)。
3. **聲學對焦**：必須將素材中的 3 個核心概念物理對位至對話中。

🚨 【數據格式協定】：
1. 僅輸出 JSON Array，嚴禁 Markdown 字元。
2. 結構：[["Speaker Name: English Sentence", "繁體中文翻譯"]]。
3. 嚴禁前言後語，直接噴發數據。

[Ignite Theatre Data]:`;

        // 🚀 4. 物理輸送至剪貼簿
        await navigator.clipboard.writeText(prompt);
        
        // 🚀 5. UI 視覺與 Haptic 反饋
        uiManager.showToast('🎭', `Theatre Protocol Locked (${roleA.name} x ${roleB.name})`);
        if (navigator.vibrate) navigator.vibrate([10, 30]);

        if (window.debugConsole) {
            window.debugConsole.log(`[Theatre-Prompt] Persona weld success: ${roleA.id} <-> ${roleB.id}`);
        }

    } catch (err) {
        console.error("❌ [EN-Theatre-Collapse]:", err);
        uiManager.showToast('❌', "Theatre synthesis relay failed");
    }
},


/** 🎙️ [Acoustic-Logic] 英美人格聲學協定合成器 (V2026.ULTRA) */
_getTheatreAcousticProtocol(category, text) {
    console.log(`📡 [EN-Acoustic-Sync] 語境感應: ${category} | 啟動聲學建模...`);

    // 🚀 1. 聲學指紋庫 (Acoustic Profiles)
    const protocols = {
        'Lyrics': {
            voice: 'en-US-Neural2-F', // 偏向感性女聲
            pitch: -1.2,              // 略微低沉、具備敘事感
            rate: 0.85,               // 放慢語速，導通情感共鳴
            emphasis: 'strong'
        },
        'Tech': {
            voice: 'en-US-Standard-I', // 偏向冷靜、理性的男音
            pitch: 0.5,                // 語調微升，增加清晰度
            rate: 1.05,                // 略快，模擬高效溝通
            emphasis: 'moderate'
        },
        'News': {
            voice: 'en-GB-Neural2-B', // 英式發音，增加權威與正式感
            pitch: 0.0,
            rate: 1.0,
            emphasis: 'reduced'
        },
        'Business': {
            voice: 'en-US-Neural2-J', // 專業商務美音
            pitch: 0.2,
            rate: 0.95,
            emphasis: 'moderate'
        },
        'DEFAULT': {
            voice: 'en-US-Neural2-A', // 預設標準美語
            pitch: 0.0,
            rate: 1.0,
            emphasis: 'moderate'
        }
    };

    // 🚀 2. 物理對焦與回傳協定
    const config = protocols[category] || protocols['DEFAULT'];

    // 🚀 3. SSML 焊接 (為聲學發動機準備物理指令)
    // 💡 職人診斷：此處輸出的是供後端語音模組直接封裝的 Metadata
    return {
        ssml: `<speak><emphasis level="${config.emphasis}">${text}</emphasis></speak>`,
        options: {
            languageCode: category === 'News' ? 'en-GB' : 'en-US',
            name: config.voice,
            ssmlGender: config.voice.endsWith('F') ? 'FEMALE' : 'MALE',
            audioConfig: {
                pitch: config.pitch,
                speakingRate: config.rate
            }
        }
    };
},

/** 📥 [Data-Reflow] 英美語劇場數據固化閘門 (V2026.ULTRA) */
async theatreImportToVault(itemId) {
    console.log(`📡 [EN-Theatre-Import] 啟動數據回流 | 目標磁區: ${itemId}`);

    try {
        // 🚀 1. 物理獲取剪貼簿燃料 (AI 產出的對話)
        await new Promise(r => setTimeout(r, 100));
        const text = await navigator.clipboard.readText();
        if (!text) return uiManager.showToast('⚠️', "Clipboard is empty");

        // 🚀 2. 物理脫殼解析 (呼叫 V2026.ULTRA.FINAL_FIX 版解析器)
        const refinedLines = this.parseFuel(text);
        if (refinedLines.length < 2) return uiManager.showToast('⚠️', "Invalid theatre data format");

        // 🚀 3. 磁區重連
        const pkg = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        if (!pkg) return uiManager.showToast('❌', "Original package missing");

        // 🚀 4. 數據增量焊接 (Tuple Mapping)
        const newSegments = [];
        for (let i = 0; i < refinedLines.length; i += 2) {
            const en = refinedLines[i];
            const zh = refinedLines[i + 1];
            if (en && zh) newSegments.push([en, zh]);
        }

        // 💡 職人協定：將延伸對話焊接至現有 segments 尾端，並更新時間戳
        pkg.segments = [...(pkg.segments || []), ...newSegments];
        pkg.lastModified = Date.now();
        pkg.isTheatreExpanded = true; // 標記為已執行劇場延伸

        // 🚀 5. 實體固化至磁區
        await dbManager.put(dbManager.STORES.TRANS_VAULT, pkg);
        console.log(`💾 [EN-Solidified] Injected ${newSegments.length} theatre segments into ${itemId}`);

        // 🚀 6. 視圖自動重連
        // 💡 職人診斷：若該卡片正處於展開狀態，立即刷新分頁內容
        if (typeof this.switchArticleTab === 'function') {
            const currentTab = this.currentActiveTabs[itemId] || '原文';
            await this.switchArticleTab(itemId, currentTab);
        }

        uiManager.showToast('🎬', `Theatre data solidified (${newSegments.length} items)`);
        if (navigator.vibrate) navigator.vibrate([20, 50]);

    } catch (err) {
        console.error("❌ [EN-Theatre-Import-Collapse]:", err);
        uiManager.showToast('❌', "Theatre import failed");
    }
},

/** 🧪 [Internal] 數據深度洗滌與自癒發動機：英美對話專用 (V2026.ULTRA) */
_processTheatreJson(rawJson) {
    if (!rawJson) return [];
    
    console.log("📡 [EN-Theatre-Healing] 啟動數據純化與語義自癒管線...");

    try {
        // 🚀 1. 物理脫殼：移除 Markdown 噪音與隱形成本
        let cleanText = String(rawJson)
            .replace(/```json/gi, '').replace(/```/gi, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim();

        // 🚀 2. 執行原子級解析
        let data = JSON.parse(cleanText);

        // 🚀 3. 深度結構挖掘 (Structure Mining)
        // 💡 職人診斷：AI 有時會將陣列嵌套在 "dialogue" 或 "data" 欄位中
        let targetArray = Array.isArray(data) ? data : (data.dialogue || data.data || data.segments || null);
        
        // 若仍找不到陣列，嘗試提取物件中第一個陣列類型的屬性
        if (!targetArray && typeof data === 'object') {
            const firstArrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
            if (firstArrayKey) targetArray = data[firstArrayKey];
        }

        if (!Array.isArray(targetArray)) throw new Error("NO_VALID_ARRAY_FOUND");

        // 🚀 4. 語義模糊對焦與洗滌 (Fuzzy Cleaning Pipeline)
        return targetArray.map(item => {
            // 數據洗滌輔助函數
            const cleanVal = (v) => String(v || "").replace(/[*_#`]/g, '').replace(/\\n/g, ' ').trim();

            // 💡 職人對焦：多維欄位自癒辨識
            // 邏輯：優先匹配標準 Key，失敗則執行模糊感應
            const en = cleanVal(
                item.en || item.English || item.original || item.q || item.content || 
                item.sentence || item.text || (Array.isArray(item) ? item[0] : "")
            );
            const zh = cleanVal(
                item.zh || item.Chinese || item.translation || item.a || item.chinese || 
                item.meaning || (Array.isArray(item) ? item[1] : "")
            );
            
            // 角色識別自癒 (Speaker/Role Sensing)
            // 優先找 item.role/speaker，若無則從 EN 軌道物理切分
            let role = item.role || item.speaker || item.name || item.actor || "";
            const roleMatchFromText = en.match(/^([^:：]{1,15})\s*[:：]/);
            
            if (!role && roleMatchFromText) {
                role = roleMatchFromText[1].trim();
            }

            if (en && zh) {
                return {
                    en: en,
                    zh: zh,
                    role: role || 'Narrator',
                    timestamp: Date.now()
                };
            }
            return null;
        }).filter(Boolean);

    } catch (err) {
        console.warn("⚠️ [EN-Heal-Relay] JSON 解析斷路，切換至正則物理脫殼模式...");
        
        // 🚀 5. 終極救援：若結構崩潰，調用 parseFuel 執行物理分段回收
        const fallbackLines = this.parseFuel(rawJson);
        const recovered = [];
        for (let i = 0; i < fallbackLines.length; i += 2) {
            const en = fallbackLines[i];
            const zh = fallbackLines[i+1];
            if (en && zh) {
                const roleMatch = en.match(/^([^:：]{1,15})\s*[:：]/);
                recovered.push({
                    en: en,
                    zh: zh,
                    role: roleMatch ? roleMatch[1].trim() : 'Narrator',
                    timestamp: Date.now()
                });
            }
        }
        return recovered;
    }
},

// ============================================================
// 🚀 [Acoustic-Bridge] 物理別名橋接器 - V2026.ULTRA.FINAL
// 作用：封殺舊有命名空間的斷路風險，確保 UI 調用 100% 導通
// ============================================================

/** 🎯 轉發：指令合成舊路徑 (Legacy UI Support) */
copyDialoguePrompt(itemId) { 
    console.log("🔗 [Alias-Bridge] 導通 copyDialoguePrompt -> theatreCopyPrompt");
    // 💡 職人診斷：直接穿透至新版劇場指令發動機
    return this.theatreCopyPrompt(itemId); 
},

/** 🎯 轉發：數據固化舊路徑 (Legacy UI Support) */
importDialogueToVault(itemId) { 
    console.log("🔗 [Alias-Bridge] 導通 importDialogueToVault -> theatreImportToVault");
    // 💡 職人診斷：直接穿透至數據回流閘門
    return this.theatreImportToVault(itemId); 
},

/** 🎯 轉發：執行生成舊路徑 (為部分自動化腳本預留) */
executeDialogueGenerate(itemId) {
    console.log("🔗 [Alias-Bridge] 導通 executeDialogueGenerate -> theatreCopyPrompt");
    return this.theatreCopyPrompt(itemId);
},

/** 🎲 [Public Action] 刷新劇場角色雙人組 (V2026.ULTRA.EN 物理對焦版) */
theatreRefreshDuo() {
    console.log("📡 [EN-Action] 執行劇場人格重新抽樣...");

    // 🚀 1. 調用底層私有邏輯進行數據抽樣
    // 💡 職人診斷：確保對位底層帶有底線的隨機引擎
    const newDuo = this._theatreRefreshDuo();

    // 🚀 2. 視圖聯動：主動要求 View 層重新渲染角色卡片
    // 💡 職人協定：Engine 不直接操作 DOM，而是通知 View 衛星進行重繪
    if (window.en_translationView && typeof window.en_translationView.refreshRandomDuo === 'function') {
        window.en_translationView.refreshRandomDuo(newDuo);
    }

    // 🚀 3. 觸覺反饋補償
    if (navigator.vibrate) navigator.vibrate([10, 30]);

    return newDuo;
},


/** 🎲 [Acoustic-Scheduler] 美/英角色隨機抽樣調度器 (V2026.ULTRA.FINAL) */
    _theatreRefreshDuo() {
        console.log("📡 [EN-Duo-Sync] 啟動大規模英美人格基因抽樣...");

        // 🚀 1. 物理導通：對焦全量人格發動機
        // 💡 職人診斷：放棄舊有的 4 員固定資料池，直接從具備 100 員指紋的 en_personaEngine 提領
        const engine = window.en_personaEngine;
        if (!engine) {
            console.error("❌ [EN-Engine-Miss] 找不到 en_personaEngine，啟動緊急備援磁區");
            // 緊急備援：維持基本運作，防止系統墜毀
            this.currentDuo = {
                roleA: { id: 'US-Male', lang: 'en-US', name: 'James', icon: '🇺🇸', pitch: 0, rate: 1 },
                roleB: { id: 'GB-Female', lang: 'en-GB', name: 'Victoria', icon: '🇬🇧', pitch: 0, rate: 1 }
            };
            return this.currentDuo;
        }

        // 🚀 2. 執行 [Duo-Ignition] 隨機組合採樣
        // 💡 職人協定：此函數內部已包含 Fisher-Yates 物理洗牌與「跨國對位 (US vs GB)」過濾協定
        const duoData = engine.getRandomDuo();

        // 🚀 3. 數據對位與 7 元組格式化
        // 💡 職人對焦：將引擎產出的 actorA/B 映射回視圖所需的 roleA/B 格式
        this.currentDuo = {
            roleA: {
                id: `${duoData.actorA.nationality}-${duoData.actorA.gender === 'man' ? 'Male' : 'Female'}`,
                lang: duoData.actorA.nationality === 'GB' ? 'en-GB' : 'en-US',
                name: duoData.actorA.name,
                role: duoData.actorA.role,
                icon: duoData.actorA.icon, // 這是國旗 🇺🇸/🇬🇧
                pitch: duoData.actorA.acoustic.pitch,
                rate: duoData.actorA.acoustic.rate,
                voice: duoData.actorA.acoustic.voice
            },
            roleB: {
                id: `${duoData.actorB.nationality}-${duoData.actorB.gender === 'man' ? 'Male' : 'Female'}`,
                lang: duoData.actorB.nationality === 'GB' ? 'en-GB' : 'en-US',
                name: duoData.actorB.name,
                role: duoData.actorB.role,
                icon: duoData.actorB.icon, // 這是國旗 🇺🇸/🇬🇧
                pitch: duoData.actorB.acoustic.pitch,
                rate: duoData.actorB.acoustic.rate,
                voice: duoData.actorB.acoustic.voice
            }
        };

        // 🚀 4. 全域主權同步 (供聲學廣播使用)
        window.currentActorA = duoData.actorA;
        window.currentActorB = duoData.actorB;

        console.log(`✅ [Duo-Assigned] A: ${this.currentDuo.roleA.name}(${this.currentDuo.roleA.id}) ⚡ B: ${this.currentDuo.roleB.name}(${this.currentDuo.roleB.id})`);
        
        if (window.debugConsole) {
            window.debugConsole.log(`[Acoustic-Duo] Persona Matrix Aligned: 100-Pool Sampling Active.`);
        }

        return this.currentDuo;
    }
};

window.en_translationEngine = en_translationEngine;