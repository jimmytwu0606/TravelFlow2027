/** 🔊 EN_AUDIO MANAGER (英美語語音合成發動機 - V2026.ULTRA)
 * 作用：對接 Google Cloud TTS API，專注於 en-US 高品質教學聲線
 */

import { CONFIG } from './config.js';

// 🚀 1. 建立物理層全域總線
window.EN_AUDIO_CTX = null; 
window.EN_AUDIO_SOURCE = null;
window.EN_AUDIO_STOP_SIGNAL = false;

export const en_audioManager = {
    apiKey: CONFIG.GOOGLE_TTS_KEY, 

/** 🛑 物理熔斷：直接摧毀音訊上下文 */
    stop() {
        window.EN_AUDIO_STOP_SIGNAL = true;
        console.log("🚫 [Acoustic-Physical] 執行硬熔斷...");

        // 🚀 關鍵：直接關閉 AudioContext 執行緒
        if (window.EN_AUDIO_SOURCE) {
            try { window.EN_AUDIO_SOURCE.stop(); } catch(e) {}
            window.EN_AUDIO_SOURCE = null;
        }
        if (window.EN_AUDIO_CTX && window.EN_AUDIO_CTX.state !== 'closed') {
            window.EN_AUDIO_CTX.close().then(() => {
                window.EN_AUDIO_CTX = null;
                console.log("✅ [Acoustic-Physical] 物理線路已完全切斷");
            });
        }
    },


/** 🚀 [Executor] 物理執行端 (V2026.ULTRA 總線對焦版) */
_executePhysicalPlayback(base64) {
    // 💡 攔截 A：啟動前檢查熔斷旗幟
    if (window.EN_AUDIO_STOP_SIGNAL === true) return Promise.resolve();

    return new Promise(async (resolve) => {
        try {
            // 🚀 1. 物理線路初始化：確保舊線路已斷開
            if (window.EN_AUDIO_CTX && window.EN_AUDIO_CTX.state !== 'closed') {
                await window.EN_AUDIO_CTX.close();
            }
            
            window.EN_AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = this._base64ToArrayBuffer(base64);

            // 🚀 2. 非同步解碼：這是最容易發生「攔截失效」的空窗期
            const audioBuffer = await window.EN_AUDIO_CTX.decodeAudioData(arrayBuffer);
            
            // 💡 攔截 B：解碼完畢後的「關鍵閘門」
            // 職人診斷：若解碼期間 user 按了停止，此處必須立即熔斷，嚴禁建立 Source
            if (window.EN_AUDIO_STOP_SIGNAL === true) {
                await window.EN_AUDIO_CTX.close();
                window.EN_AUDIO_CTX = null;
                return resolve();
            }

            // 🚀 3. 建立物理節點
            const source = window.EN_AUDIO_CTX.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(window.EN_AUDIO_CTX.destination);
            
            window.EN_AUDIO_SOURCE = source; 
            source.start(0);

            // 🚀 4. 結束指針回收
            source.onended = () => {
                if (window.EN_AUDIO_CTX && window.EN_AUDIO_CTX.state !== 'closed') {
                    // 播報自然結束，不需重設 STOP_SIGNAL，僅釋放硬體資源
                    window.EN_AUDIO_CTX.close();
                }
                window.EN_AUDIO_SOURCE = null;
                resolve();
            };

        } catch (e) {
            console.error("❌ [Audio-Physical-Collapse]:", e);
            window.EN_AUDIO_SOURCE = null;
            resolve();
        }
    });
},


    /** 🛠️ 工具函數：Base64 轉 ArrayBuffer (Web Audio API 專用) */
    _base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },

    
/** 🚀 [Commander] EN 軌道串行劇場發動機 (V2026.ULTRA.EN_SERIAL_WELD) 
 * 作用：循環處理對話片段，動態切換人格聲學參數
 */
async speak(input, extActorA = null, extActorB = null) {
    // 🚀 A. 啟動重置：確保總線路網導通
    window.EN_AUDIO_STOP_SIGNAL = false;
    if (!input) return;

    // 🚀 1. 數據感應與歸一化
    // 💡 職人診斷：呼叫 _parseInputToDialogue 確保不論輸入格式為何，皆轉為標準陣列
    const segments = this._parseInputToDialogue(input);
    
    console.log(`🛰️ EN-Chirp/Neural 串行發動機點火 | 隊列筆數: ${segments.length}`);

    // 🚀 2. 獲取實時人格實體 (主權對焦)
    // 💡 優先使用外部傳入角色，否則回退至全域緩存
    const actorA = extActorA || window.currentActorA;
    const actorB = extActorB || window.currentActorB;

    try {
        // 🚀 3. 串行調度迴圈 (Sequential Processing)
        for (const seg of segments) {
            // 💡 熔斷檢查：每一句開始前核對停止訊號
            if (window.EN_AUDIO_STOP_SIGNAL === true) break;

            const rawText = seg.text;
            if (!rawText || !String(rawText).trim()) continue;

            // 💡 Identity Thread：物理切片識字並獲取人格 DNA
            // 這步決定了這一句該用誰的聲音、音高與語速
            const dna = this._getAcousticIdentity(String(rawText), actorA, actorB);
            
            // 💡 Content Thread：真空洗滌 (移除 "Name: " 前綴)
            const cleanContent = this._getCleanDialogue(String(rawText));
            if (!cleanContent) continue;

            // 🔥 [DYNAMIC-FOCUS] 動態參數提取
            // 優先對位 DNA 中的 Eggs 基因，若無則回退至全局拉桿 (localStorage)
            const finalRate = dna.rate || localStorage.getItem('tf_audio_rate') || '1.0';
            const finalPitch = dna.pitch || localStorage.getItem('tf_audio_pitch') || '0.0';

            console.log(`📡 [EN-Theatre] 人格導通: [${dna.name}] ➔ ${dna.voice} | P: ${finalPitch} | R: ${finalRate}`);

            // 🚀 4. API 單點噴發 (呼叫 API 通訊模組)
            // 💡 職人對焦：SSML 封裝由 _prepareAcousticFuel 處理
            const ssml = this._prepareAcousticFuel(cleanContent, dna.voice);
            const audioContent = await this._fetchSynthesizedAudio(
                ssml, 
                dna.voice, 
                parseFloat(finalRate), 
                parseFloat(finalPitch)
            );

            // 💡 關鍵攔截：Fetch 回流後的最後閘門
            if (window.EN_AUDIO_STOP_SIGNAL === true) break;

            // 🚀 5. 物理排隊播放
            if (audioContent) {
                // await 確保上一句播完才進入下一句，維持劇場節奏
                await this._executePhysicalPlayback(audioContent);
                
                // 角色交替間的自然呼吸停頓 (EN 軌道建議 500ms 增加思索感)
                await new Promise(res => setTimeout(res, 500));
            }
        }

        if (!window.EN_AUDIO_STOP_SIGNAL) {
            console.log(`✅ [EN-Acoustic-Output] 劇場序列播報完畢`);
        }

    } catch (err) {
        if (window.EN_AUDIO_STOP_SIGNAL === true) return;
        console.error("❌ [EN-Audio-Collapse] 劇場線路斷路:", err);
        // 備援方案：降級為純文字播報
        this._fallbackSpeak(String(input));
    }
},


/** 🧪 [Refinery] 燃料加工：美式節奏與 SSML 雙軌並行 (V2026.ULTRA.EN_HYBRID) 
 * 作用：針對 Chirp3 與 Neural2 進行不同程度的聲學精煉，強化美式重音與停頓
 */
_prepareAcousticFuel(text, voiceId = '') {
    // 🚀 1. 物理洗滌：封殺非英文軌道字元 (如日文殘留)
    let cleanText = text.replace(/[\u3040-\u309F\u30A0-\u30FF]/g, '').trim();
    if (!cleanText) return "";

    // 🚀 2. 判斷模型軌道 (Chirp vs Neural/Wavenet)
    // 💡 職人診斷：Chirp3-HD 不支援複雜 SSML，若強行注入會導致 400 斷路
    const isChirp = voiceId.includes('Chirp3-HD');

    if (isChirp) {
        // 🧪 Chirp3-HD 專用軌道：執行「純淨文字洗滌」
        // 僅保留標點符號，讓 AI 自動判斷語流，發揮 Studio 原生美聲
        return cleanText
            .replace(/[*_#`]/g, "") // 移除 Markdown
            .replace(/\n/g, ". ");  // 換行轉為句點停頓
    }

    // 🚀 3. Neural2 / Wavenet 專用軌道：注入進階 SSML 標記
    // 💡 職人對焦：強化美式英語的 Thought Groups 與句子重心
    let ssmlContent = cleanText;

    // A. 意群停頓優化 (Thought Grouping)
    ssmlContent = ssmlContent
        .replace(/,/g, ',<break time="250ms"/>') 
        .replace(/\. /g, '.<break time="600ms"/>')
        .replace(/[!?]/g, '$&<break time="650ms"/>');

    // B. 重音補強 (Emphasis Injection)
    // 💡 職人級調教：針對常見的轉折詞與關鍵動詞注入「減速重音」
    const focusWords = ['however', 'therefore', 'absolutely', 'never', 'must', 'important', 'notice'];
    focusWords.forEach(word => {
        const regex = new RegExp(`\\b${word}\\b`, 'gi');
        ssmlContent = ssmlContent.replace(regex, `<emphasis level="moderate">${word}</emphasis>`);
    });

    // C. 句尾語調對焦
    // 針對問號結尾，確保音調上揚感 (透過 prosody 微調)
    if (ssmlContent.endsWith('?')) {
        ssmlContent = `<prosody pitch="+1st">${ssmlContent}</prosody>`;
    }

    // 🚀 4. 輸出主權封裝 (SSML Root)
    // 💡 職人診斷：移除 prosody 內的 rate/pitch，改由 fetch 層統一噴發，達成物理去耦
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="en-US">
                <prosody>
                    ${ssmlContent}
                </prosody>
            </speak>`;
},

/** 📡 [Relay] 中繼站：API 通訊 (V2026.ULTRA.EN_DYNAMIC_HEAL) 
 * 作用：對接 Google Cloud TTS，具備性別感知自癒與 Chirp 模式自動對焦
 */
async _fetchSynthesizedAudio(ssml, voiceId, rate, pitch) {
    const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
    
    // 🚀 1. 聲線重定向與性別判定
    let finalVoiceId = voiceId;
    if (!voiceId || voiceId.toLowerCase().includes('jp') || !voiceId.startsWith('en-')) {
        console.warn("🚨 [EN-Acoustic-Weld] 聲線格式非法，重定向至 Neural2-F");
        finalVoiceId = 'en-US-Neural2-F'; 
    }

    // 💡 職人診斷：判斷目前聲線的性別，為自癒軌道做準備
    // 簡單判定：D, J, M 為男；F, H, C, O 為女 (基於 Google 命名慣例)
    const isMale = /[-][DJM]$|Studio-M|Algenib|Algieba/.test(finalVoiceId);

    // 🚀 2. 參數導通對焦
    const safeRate = Number(Math.max(0.25, Math.min(parseFloat(rate) || 1.0, 4.0)));
    const safePitch = Number(Math.max(-20.0, Math.min(parseFloat(pitch) || 0.0, 20.0)));

    // 🚀 3. Chirp 模式自動適配 (Mode Switching)
    // 💡 職人對焦：Chirp3-HD 在 Google API 中必須使用 input.text，嚴禁 input.ssml
    const isChirp = finalVoiceId.includes('Chirp3-HD');
    const inputConfig = isChirp 
        ? { text: ssml.replace(/<[^>]*>/g, "").trim() } // Chirp 物理去標籤
        : { ssml: ssml };

    const payload = {
        input: inputConfig,
        voice: { languageCode: 'en-US', name: finalVoiceId },
        audioConfig: { 
            audioEncoding: 'MP3', 
            pitch: safePitch,
            speakingRate: safeRate
        }
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        const rawData = await response.text();

        if (!response.ok) {
            const errorData = JSON.parse(rawData);
            const errorMsg = errorData.error?.message || "";
            
            // 🛡️ 4. 性別感知自癒邏輯 (Smart Fallback)
            if (response.status === 400 || errorMsg.includes("does not exist")) {
                // 根據原本角色的性別，選擇最穩定的 Wavenet 備援
                const fallbackVoice = isMale ? 'en-US-Wavenet-D' : 'en-US-Wavenet-C';
                console.warn(`🛰️ [EN-Self-Healing] 模型衝突，依據性別自癒至: ${fallbackVoice}`);
                
                // 遞迴呼叫，確保參數持續導通
                return await this._fetchSynthesizedAudio(ssml, fallbackVoice, safeRate, safePitch);
            }
            throw new Error(`EN_TTS_FAIL: ${errorMsg}`);
        }

        const data = JSON.parse(rawData);
        return data.audioContent;

    } catch (err) {
        console.error("❌ [EN-Relay-Dead]:", err.message);
        throw err;
    }
},

    _base64ToBlob(base64, type = 'audio/mp3') {
        try {
            const binStr = atob(base64);
            const arr = Uint8Array.from(binStr, (c) => c.charCodeAt(0));
            return new Blob([arr], { type: type });
        } catch (err) { return null; }
    },

/** 🛡️ 降級軌道 (en-US 映射) - V2026.ULTRA 物理攔截版 */
_fallbackSpeak(text, rate = 1.0, pitch = 0.0) {
    // 🚀 1. 物理攔截點：如果熔斷旗幟為 true，嚴禁原生引擎發聲
    if (window.EN_AUDIO_STOP_SIGNAL === true) {
        console.warn("⚠️ [Acoustic-Fallback] 攔截成功：偵測到熔斷旗幟，封殺降級軌道啟動");
        return;
    }

    // 🚀 2. 物理清空：確保沒有任何排隊中的語音
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'en-US'; 
    uttr.rate = Math.max(0.1, Math.min(rate, 2.0));
    
    // 音高補償校準
    const pitchOffset = (parseFloat(pitch) || 0) * 0.125;
    uttr.pitch = Math.max(0.1, Math.min(1.0 + pitchOffset, 2.0));

    // 🚀 3. 雙重保險：在語音即將噴發的瞬間再次核對旗幟
    uttr.onstart = () => {
        if (window.EN_AUDIO_STOP_SIGNAL === true) {
            window.speechSynthesis.cancel();
            console.log("🚫 [Acoustic-Fallback] 原生語音啟動瞬間熔斷成功");
        }
    };

    window.speechSynthesis.speak(uttr);
    console.warn(`⚠️ [EN-TTS-Fallback] 導通原生引擎 | 語速: ${uttr.rate}x`);
},

/** 🧬 [Identity-Thread] 子函數 A：EN 軌道識字認人模組 (V2026.ULTRA.EN_SOUL_LINKED) 
 * 作用：偵測英文文本中的姓名指紋，並導通 181 員人格基因
 */
_getAcousticIdentity(rawText, actorA, actorB) {
    // 🚀 1. 物理切片：精準鎖定英文冒號前綴
    // 💡 職人診斷：支援 Markdown (**Name**:) 與 標準格式 (Name:)
    const separatorIndex = rawText.search(/[：:]/);
    let name = "";
    if (separatorIndex !== -1 && separatorIndex < 25) {
        // 清除 Markdown 符號、空格，並進行歸一化處理
        name = rawText.substring(0, separatorIndex).replace(/[*_#\s]/g, "").trim();
    }

    // 🛡️ 熔斷保護：無名狀態回歸系統預設 (美式 Neural2 聲線)
    if (!name) return { voice: 'en-US-Neural2-F', pitch: '0', rate: '1.0', name: 'System' };

    // 🔥 [CRITICAL WELD] 跨語軌靈魂對焦：強制對位 CHARACTER_EGGS
    const eggs = window.CHARACTER_EGGS || {};
    
    // 💡 職人對焦：由於 Eggs 的 Key 為日文/中文，我們需執行「語義轉換匹配」或「模糊 Key 匹配」
    // 在 V2026 協定下，假設 Eggs 的 Key 已包含對位後的角色名
    const personaKey = Object.keys(eggs).find(k => 
        k === name || 
        k.startsWith(name + "(") || 
        (actorA && actorA.name === name && k === actorA.name) ||
        (actorB && actorB.name === name && k === actorB.name)
    );
    
    const egg = eggs[personaKey];

    if (egg) {
        // ✅ 成功導通 181 員專屬基因 (EN 軌道)
        // 💡 職人診斷：EN 軌道對 Pitch 的敏感度較高，保持 Egg 的物理偏移
        console.log(`🎯 [EN-Soul-Linked] 靈魂覺醒: ${name} | Voice: ${egg.voice} | Pitch: ${egg.pitch}`);
        return {
            voice: egg.voice.startsWith('en-') ? egg.voice : 'en-US-Neural2-F', // 確保聲線為英文
            pitch: String(egg.pitch),
            rate: String(egg.rate),
            name: name,
            traits: egg.traits
        };
    }

    // 🚀 2. 備援軌道：非名單內人物執行「動態聲線分配」
    // 💡 職人診斷：利用全域變數判定性別主權
    const pool = window.NAME_POOL || [];
    const poolEntry = pool.find(e => name.includes(e[0]) || e[0].includes(name));
    const isMan = poolEntry ? (poolEntry[1] === 'm') : true; // 預設為男

    // 🚀 3. 物理模型雜湊 (Model Hashing) - EN 軌道專屬池
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const malePool = ['en-US-Neural2-D', 'en-US-Neural2-J', 'en-US-Wavenet-D', 'en-US-Studio-M'];
    const femalePool = ['en-US-Neural2-F', 'en-US-Neural2-H', 'en-US-Wavenet-F', 'en-US-Studio-O'];
    
    const targetPool = isMan ? malePool : femalePool;
    const targetModel = targetPool[seed % targetPool.length];

    console.warn(`👤 [EN-Identity-Fallback] 角色 ${name} 執行隨機雜湊 ➔ ${targetModel}`);

    return {
        voice: targetModel,
        pitch: '0',
        rate: '1.0',
        name: name
    };
},

/** 🧼 [Content-Thread] 子函數 B：EN 軌道 SSML 真空洗滌 (V2026.ULTRA.EN_VACUUM_WELD) 
 * 作用：徹底切除英文對話前綴，僅保留供 API 噴發的純淨燃料
 */
_getCleanDialogue(rawText) {
    if (!rawText) return "";
    let str = String(rawText);

    // 🚀 1. 物理切除：封殺所有英文名字＋冒號前綴 (極度強化版)
    // 💡 職人診斷：針對 Markdown (**)、中括號 ([])、與多種冒號執行切片
    // 範例：'**Yagami**: Hello' ➔ 'Hello' | '[System]: Warning' ➔ 'Warning'
    let clean = str.replace(/^\s*[*_\[(]*[^：:（()\]]{1,25}[*_\])]*\s*[：:]\s*/, "").trim();

    // 🚀 2. 衛星補償：若正則未命中但仍含冒號，執行二次強制切除 (針對 25 字元內的冒號)
    if (clean === str) { // 代表 replace 沒成功
        const sep = str.search(/[：:]/);
        if (sep !== -1 && sep < 25) {
            clean = str.substring(sep + 1).trim();
        }
    }

    // 🚀 3. 聲學物理洗滌 (純化文字)
    // 💡 職人對焦：移除 Markdown 控制符號與多餘空白，防止 TTS 產生奇怪的停頓
    clean = clean.replace(/[*_#`~]/g, "")
                 .replace(/[\u200B-\u200D\uFEFF]/g, "") // 移除不可見字元
                 .replace(/\s+/g, " ")                  // 歸一化空格
                 .trim();

    // 🛡️ 物理真空判定：若洗完沒內容，直接熔斷回傳空字串，防止 API 400
    if (!clean || clean.length < 1) return "";

    // 🚀 4. XML 實體轉義 (EN 軌道 SSML 安全協定)
    // 💡 職人對焦：英語中常見的 apostrophe (') 必須正確轉義，避免 SSML 語法崩潰
    return clean
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/[\r\n]+/g, " ") // 封殺換行符號
        .trim();
},

/** 🧪 [Sub-Module 2] EN 軌道燃料感應重組器 (V2026.ULTRA.EN_FUEL_RECOVERY) 
 * 作用：偵測多種數據來源，歸一化為 [{text, name}] 結構，供串行播報使用
 */
_parseInputToDialogue(input) {
    if (!input) return [];

    // 🚀 模式 0：偵測 TravelFlow 標準二維陣列 [["Original", "Translation"], ...]
    // 💡 職人診斷：此為最穩定的燃料來源，直接對位 Index 0 (英文軌)
    if (Array.isArray(input) && input.length > 0 && Array.isArray(input[0])) {
        console.log("📡 [EN-Sensing-2D] 偵測到二維軌道燃料，啟動劇場模式");
        return input.map(line => ({
            text: Array.isArray(line) ? String(line[0]) : String(line)
        }));
    }

    // 🚀 模式 1：偵測 JSON 格式燃料 (由 API 或 ChallengeEngine 產出)
    if (typeof input === 'string' && (input.trim().startsWith('[') || input.trim().startsWith('{'))) {
        try {
            const parsed = JSON.parse(input);
            const arrayData = Array.isArray(parsed) ? parsed : (parsed.segments || [parsed]);
            return arrayData.map(item => ({
                text: item.text || (Array.isArray(item) ? item[0] : item)
            }));
        } catch (e) {
            console.warn("⚠️ [EN-Sensing-JSON-Glitch] 解析偏移，退回文本掃描");
        }
    }

    // 🚀 模式 2：偵測多行對話字串 (Multi-line Dialogue)
    // 💡 職人對焦：針對英文換行進行切片，確保每一句對話都能觸發獨立的識字認人
    if (typeof input === 'string' && input.includes('\n')) {
        return input.split(/\n+/).filter(line => line.trim().length > 0).map(line => ({
            text: line.trim()
        }));
    }

    // 🚀 模式 3：單句/普通陣列降級防禦
    if (Array.isArray(input)) {
        return input.map(i => ({ text: String(i) }));
    }

    // 🚀 最終兜底：純文字包裝
    return [{ text: String(input) }];
}

};

window.en_audioManager = en_audioManager;