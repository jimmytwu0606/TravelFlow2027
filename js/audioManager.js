/** 🔊 AUDIO MANAGER (AI 語音合成發動機 - V2026.ULTRA)
 * 作用：對接 Google Cloud TTS API，提供具備動態語速的高品質發音
 */

import { CONFIG } from './config.js';


// 🚀 1. 物理層全域總線 (與 EN 軌道隔離，確保互不干擾)
window.JP_AUDIO_CTX = null; 
window.JP_AUDIO_SOURCE = null;
window.JP_AUDIO_STOP_SIGNAL = false;


export const audioManager = {
    // 🚀 數據出口：建議從 config.js 引入以封殺金鑰外洩風險
    apiKey: CONFIG.GOOGLE_TTS_KEY, 


/** 🛑 物理熔斷：直接摧毀音訊上下文 */
    stop() {
        window.JP_AUDIO_STOP_SIGNAL = true;
        console.log("🚫 [JP-Acoustic-Physical] 執行硬熔斷...");

        // 🚀 關鍵：直接停止 Source 節點並關閉 Context 執行緒
        if (window.JP_AUDIO_SOURCE) {
            try { window.JP_AUDIO_SOURCE.stop(); } catch(e) {}
            window.JP_AUDIO_SOURCE = null;
        }
        
        if (window.JP_AUDIO_CTX && window.JP_AUDIO_CTX.state !== 'closed') {
            window.JP_AUDIO_CTX.close().then(() => {
                window.JP_AUDIO_CTX = null;
                console.log("✅ [JP-Acoustic-Physical] 物理線路已完全切斷");
            });
        }
    },

/** 🚀 [Executor] 物理執行端 (V2026.ULTRA 日文總線硬熔斷版) */
_executePhysicalPlayback(base64) {
    // 💡 攔截 A：啟動前檢查總線旗幟
    if (window.JP_AUDIO_STOP_SIGNAL === true) return Promise.resolve();

    return new Promise(async (resolve) => {
        try {
            // 🚀 1. 物理線路初始化：確保舊線路已關閉並釋放
            if (window.JP_AUDIO_CTX && window.JP_AUDIO_CTX.state !== 'closed') {
                await window.JP_AUDIO_CTX.close();
            }
            
            // 🚀 2. 建立新的物理線路並掛載至全域
            window.JP_AUDIO_CTX = new (window.AudioContext || window.webkitAudioContext)();
            const arrayBuffer = this._base64ToArrayBuffer(base64);

            // 🚀 3. 非同步解碼：偵測解碼期間是否有熔斷指令
            const audioBuffer = await window.JP_AUDIO_CTX.decodeAudioData(arrayBuffer);
            
            // 💡 攔截 B：解碼完畢後的最後閘門
            if (window.JP_AUDIO_STOP_SIGNAL === true) {
                await window.JP_AUDIO_CTX.close();
                window.JP_AUDIO_CTX = null;
                return resolve();
            }

            // 🚀 4. 建立節點並導通輸出
            const source = window.JP_AUDIO_CTX.createBufferSource();
            source.buffer = audioBuffer;
            source.connect(window.JP_AUDIO_CTX.destination);
            
            window.JP_AUDIO_SOURCE = source; 
            source.start(0);

            // 🚀 5. 結束指針回收
            source.onended = () => {
                if (window.JP_AUDIO_CTX && window.JP_AUDIO_CTX.state !== 'closed') {
                    window.JP_AUDIO_CTX.close();
                }
                window.JP_AUDIO_SOURCE = null;
                resolve();
            };

        } catch (e) {
            console.error("❌ [JP-Audio-Physical-Collapse]:", e);
            window.JP_AUDIO_SOURCE = null;
            resolve();
        }
    });
},

/** 🧪 [Sub-Module 1] 聲學物理洗滌器 (V2026.ULTRA.FINAL_STABLE) */
_sanitizeAcoustic(t) {
    if (!t) return "";
    let clean = String(t);

    clean = clean.replace(/<rt>.*?<\/rt>/g, ""); // 物理切除 Ruby
    clean = clean.replace(/<[^>]*>/g, "");      // 移除 HTML
    clean = clean.replace(/[\(（][ぁ-んァ-ヶー\s]+[\)）]/g, ""); // 移除括號注音

    // 🔥 [WELD-POINT] 語流導通：移除引號並封殺助詞前的空格
    // 💡 職人診斷：這是解決「ノジマ」與「は」斷開的最小干預方案
    clean = clean.replace(/[「」""''『』]/g, "") // 移除引號防止分詞偏移
                 .replace(/\s+(?=[はもをにが])/g, ""); // 封殺助詞前的所有空格

    // 🚀 4. 終極除磁
    clean = clean.replace(/[*_#`]/g, "")
                 .replace(/[\u200B-\u200D\uFEFF]/g, "")
                 .trim();

    return clean;
},


/** 🧪 [Sub-Module 2] 燃料感應重組器 (V2026.ULTRA.FINAL_RECOVERY) */
_parseInputToDialogue(input) {
    if (!input) return "";

    // 🚀 模式 0：偵測 TravelFlow 標準二維陣列 [["原文", "譯文"], ...]
    // 💡 職人診斷：這是目前最關鍵的修復點。
    // 如果傳入的是陣列且內層也是陣列，必須保留結構，絕對不能執行 toString()。
    if (Array.isArray(input) && input.length > 0 && Array.isArray(input[0])) {
        console.log("📡 [Sensing-2D] 偵測到二維軌道燃料，強制鎖定劇場模式");
        return input.map(line => ({
            // 💡 提取原文軌道 (index 0)，保持原始文字以供 _getAcousticIdentity 認人
            text: Array.isArray(line) ? String(line[0]) : String(line)
        }));
    }

    // 模式 1：偵測到「男：/ 女：」對話標籤
    if (typeof input === 'string' && (input.includes('女：') || input.includes('男：'))) {
        const regex = /(女：|男：)/g;
        const parts = input.split(regex).filter(p => p.trim());
        const dialogueArray = [];
        for (let i = 0; i < parts.length; i += 2) {
            const label = parts[i];
            const text = parts[i+1] || "";
            if (label && text) {
                dialogueArray.push({
                    role: label.includes('男') ? 'man' : 'woman',
                    text: text // 💡 職人對焦：延遲洗滌，交由劇場引擎統一處理
                });
            }
        }
        return dialogueArray;
    }

    // 模式 2：偵測到 JSON 格式燃料
    if (typeof input === 'string' && (input.trim().startsWith('[') || input.trim().startsWith('{'))) {
        try {
            const parsed = JSON.parse(input);
            if (Array.isArray(parsed)) {
                return parsed.map(item => ({
                    role: item.role || 'woman',
                    text: item.text || item
                }));
            }
        } catch (e) {
            console.warn("⚠️ [Sensing-JSON-Glitch] 解析失敗，退回基礎軌道");
        }
    }

    // 🚀 降級防禦：如果是普通陣列（如 [text1, text2]）
    if (Array.isArray(input)) {
        return input.map(i => ({ text: String(i) }));
    }

    // 模式 3：純文字直接洗滌 (單人模式)
    return this._sanitizeAcoustic(input);
},


/** 🚀 [Commander] 執行播報總線 (V2026.ULTRA.CHIRP_SOUL_LOADED) */
async speak(input, extActorA = null, extActorB = null) {
    window.JP_AUDIO_STOP_SIGNAL = false;
    if (!input) return;

    // 🚀 1. 數據感應與歸一化
    let segments = [];
    if (Array.isArray(input)) {
        segments = input;
    } else if (input && typeof input === 'object' && input.segments) {
        segments = input.segments;
    } else {
        const parsed = this._parseInputToDialogue(input);
        segments = Array.isArray(parsed) ? parsed : [{ text: parsed }];
    }

    console.log(`🛰️ Chirp3-HD 串行發動機點火 | 隊列筆數: ${segments.length}`);

    // 🚀 2. 獲取實時人格實體 (維持主權對焦)
    let actorA = extActorA || window.currentActorA;
    let actorB = extActorB || window.currentActorB;

    try {
        // 🚀 3. 串行調度迴圈 (Sequential Processing)
        for (const seg of segments) {
            if (window.JP_AUDIO_STOP_SIGNAL === true) break;

            const rawText = seg.text || (Array.isArray(seg) ? seg[0] : seg);
            if (!rawText || !String(rawText).trim()) continue;

            // 💡 Identity Thread：物理切片識字並獲取模型
            // 此處回傳的 dna 應包含由 personaEngine._getRefinedAcoustic 合成的結果
            const dna = this._getAcousticIdentity(String(rawText), actorA, actorB);
            
            // 💡 Content Thread：真空洗滌 (移除「姓名：」前綴)
            const cleanContent = this._getCleanDialogue(String(rawText));
            if (!cleanContent) continue;

            // 🔥 [CRITICAL FIX] 提取人物基因組中的「物理參數」
            // 💡 職人診斷：如果 dna 物件內有參數，優先使用；若無則採系統預設。
            const finalRate = dna.rate || localStorage.getItem('tf_audio_rate') || '1.0';
            const finalPitch = dna.pitch || '0.0';

            console.log(`📡 正在合成人格: [${dna.name}] ➔ Voice: ${dna.voice} | Pitch: ${finalPitch} | Rate: ${finalRate}`);

            // 🚀 4. API 單點噴發 (注入修正後的參數)
            const audioContent = await this._fetchSynthesizedAudio(
                cleanContent, 
                dna.voice, 
                parseFloat(finalRate), // 🎯 導通人物語速基因
                parseFloat(finalPitch) // 🎯 導通人物音高基因
            );

            if (window.JP_AUDIO_STOP_SIGNAL === true) break;

            // 🚀 5. 物理排隊播放
            if (audioContent) {
                await this._executePhysicalPlayback(audioContent);
                // 角色交替間的自然呼吸停頓 (調整為 450ms 增加層次感)
                await new Promise(res => setTimeout(res, 450));
            }
        }

        console.log(`✅ [Acoustic-Output] Chirp3-HD 劇場序列播報完畢`);

    } catch (err) {
        if (window.JP_AUDIO_STOP_SIGNAL === true) return;
        console.error("❌ [Audio-Collapse] 執行備援軌道:", err);
        this._fallbackSpeak(String(input));
    }
},

/** 🛠️ 輔助工具：Base64 轉 ArrayBuffer */
    _base64ToArrayBuffer(base64) {
        const binaryString = window.atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        return bytes.buffer;
    },


/** 🧬 [Acoustic-Governor] 母函數：劇場任務調度 (V2026.ULTRA.FINAL_DECOUPLE_FIXED) */
_prepareAcousticFuel(input, actorA, actorB) {
    // 🚀 核心修正：對位單一軌道發動機
    // 💡 職人診斷：你的代碼庫中負責單人精煉的函數名為 _runRefineryEngine
    if (!Array.isArray(input)) {
        // 封裝成完整的 SSML 格式回傳
        const refined = this._runRefineryEngine(input);
        // 🛡️ 防禦性判定：確保 _runRefineryEngine 輸出的內容已被 <speak> 包裹
        return refined.startsWith('<speak') ? refined : `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ja-JP">${refined}</speak>`;
    }

    console.log(`📡 [Governor-Ignition] 啟動雙子執行緒分流 (A: ${actorA?.name || 'Unk'} | B: ${actorB?.name || 'Unk'})`);

    const dialogueContent = input.map(seg => {
        // 🚀 1. 數據解構 (支援 [原文, 譯文] 結構)
        const rawText = Array.isArray(seg) ? String(seg[0]) : String(seg.text || seg || "");
        if (!rawText.trim()) return "";

        // 🚀 2. 子函數 A：發音來源判定 (Identity Thread) - 執行查表與對位
        const dna = this._getAcousticIdentity(rawText, actorA, actorB);

        // 🚀 3. 子函數 B：內容真空洗滌 (Content Thread) - 移除標籤與名字
        const cleanContent = this._getCleanDialogue(rawText);

        // 🛡️ 物理防護：如果洗完沒內容，直接丟棄，避免 SSML 400 報錯
        if (!cleanContent || cleanContent.trim().length < 1) return "";

        // 🚀 4. 原子級封裝 (嚴禁換行，確保 Neural2/Wavenet 導通)
        return `<voice name="${dna.voice}"><prosody pitch="${dna.pitch}" rate="${dna.rate}">${cleanContent}</prosody></voice><break time="600ms"/>`;
    }).filter(Boolean).join('');

    // 🛡️ 最終真空度檢查：若劇場內容全毀，提供安全 Fallback
    if (!dialogueContent.trim()) {
        const fallback = this._sanitizeAcoustic(String(input));
        return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ja-JP">${fallback}</speak>`;
    }

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ja-JP">${dialogueContent}</speak>`;
},



/** 🧬 [Identity-Thread] 子函數 A：全量聲學對位器 (V2026.ULTRA.FINAL_STABLE) */
_getAcousticIdentity(rawText, actorA, actorB) {
    // 🚀 1. 物理切片：鎖定名字
    const separatorIndex = rawText.search(/[：:]/);
    let name = "";
    if (separatorIndex !== -1 && separatorIndex < 20) {
        name = rawText.substring(0, separatorIndex).replace(/[*_#\s]/g, "").trim();
    }

    // 🛡️ 熔斷：無名狀態回歸系統預設
    if (!name) return { voice: 'ja-JP-Neural2-B', pitch: '0st', rate: '1.0', name: '系統' };

    // 🔥 [WELD-POINT-1] 靈魂優先導通：強制對位 CHARACTER_EGGS 靈魂表
    // 💡 職人診斷：如果 Eggs 裡有定義，就直接拿走靈魂參數，不要浪費效能算雜湊。
    const eggs = window.CHARACTER_EGGS || {};
    // 支援模糊匹配（處理 早乙女(職人) 這種帶標籤的 Key）
    const eggKey = Object.keys(eggs).find(k => k === name || k.startsWith(name + "("));
    const persona = eggs[eggKey];

    if (persona) {
        console.log(`🎯 [Soul-Linked] 靈魂覺醒: ${name} | Voice: ${persona.voice} | Pitch: ${persona.pitch}st`);
        return {
            voice: persona.voice,
            // 確保 pitch 帶有 st 單位，方便音訊發動機識別
            pitch: String(persona.pitch).includes('st') ? persona.pitch : `${persona.pitch}st`,
            rate: String(persona.rate),
            name: name,
            traits: persona.traits // 同步導通文字魂
        };
    }

    // 🚀 2. 獲取真值燃料庫 (從 CONFIG 直接同步)
    const allVoices = CONFIG.VOICE_LIST || [];
    const malePool = allVoices.filter(v => v.gender === 'M').map(v => v.id);
    const femalePool = allVoices.filter(v => v.gender === 'F').map(v => v.id);

    // 🚀 3. 性別主權判定
    const pool = window.NAME_POOL || [];
    const poolEntry = pool.find(e => name.includes(e[0]) || e[0].includes(name));
    const isMan = poolEntry ? (poolEntry[1] === 'm') : (!name.match(/[子美奈香恵愛理沙]/));

    // 🚀 4. 物理模型雜湊 (Model Hashing) - 降級備援軌道
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const targetPool = isMan ? malePool : femalePool;
    const targetModel = (targetPool.length > 0) 
        ? targetPool[seed % targetPool.length] 
        : (isMan ? 'ja-JP-Chirp3-HD-Algenib' : 'ja-JP-Chirp3-HD-Aoede');

    console.warn(`👤 [Identity-Fallback] 角色 ${name} 不在名單內，執行隨機雜湊。`);

    return {
        voice: targetModel,
        pitch: '0st', 
        rate: '1.0',
        name: name
    };
},

/** 🧼 [Content-Thread] 子函數 B：SSML 真空洗滌 (V2026.ULTRA.FINAL_HARD_FIX) */
_getCleanDialogue(rawText) {
    if (!rawText) return "";
    let str = String(rawText);

    // 🚀 1. 物理切除：封殺所有「名字＋冒號」前綴 (強化版)
    // 💡 職人診斷：加入對 Markdown (*, _) 的相容，並採用非貪婪匹配
    // 範例：'**蛇喰**：內容' ➔ '內容' | '蛇喰 : 內容' ➔ '內容'
    let clean = str.replace(/^\s*[*_]*[^：:（(]{1,15}[*_]*\s*[：:]\s*/, "").trim();

    // 🚀 2. 衛星補償：若正則未命中但仍含冒號，執行二次物理切除
    // 💡 職人對焦：針對「全形冒號」執行最後的防線檢查
    if (clean.includes('：') && clean.indexOf('：') < 15) {
        clean = clean.split('：').slice(1).join('：').trim();
    } else if (clean.includes(':') && clean.indexOf(':') < 15) {
        clean = clean.split(':').slice(1).join(':').trim();
    }

    // 🚀 3. 執行標準聲學物理洗滌 (Ruby, 標籤, 括號注音)
    clean = this._sanitizeAcoustic(clean);
    
    // 🚀 4. 物理真空判定：若洗完沒東西，直接熔斷回傳空字串
    if (!clean || clean.trim().length === 0) return "";
    
    // 🚀 5. XML 實體轉義與毒素封殺 (SSML 安全協定)
    return clean
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
        .replace(/[\r\n]+/g, " ") // 封殺換行
        .trim();
},


_applyPitchContour(ssml) {
    let refined = ssml.replace(/(?<=^|。|！|？)([^<]{2,5})/g, (match) => {
        if (match.includes('<')) return match;
        return `<prosody pitch="+0.8st" rate="102%">${match}</prosody>`;
    });

    // 🚀 執行洗滌：確保起音標籤內沒有殘留標點
    return this._prosodySanitizer(refined);
},

/** 🛡️ [Prosody-Sanitizer] 聲學標籤洗滌器 (V2026.ULTRA.GLITCH-FREE) */
_prosodySanitizer(ssml) {
    // 💡 職人診斷：封殺標籤內的標點符號，將其後推至標籤外部
    // 範例：<prosody>內容。</prosody> ➔ <prosody>內容</prosody>。
    return ssml.replace(/(<prosody[^>]*>)([^<]*)([、。！？])(<\/prosody>)/g, '$1$2$4$3');
},

/** 🧪 [Dialogue-Engine] 對話專用精煉引擎 (V2026.ULTRA.ORAL_FLOW) */
_runDialogueEngine(content) {
    let ssml = content;

    // 🚀 1. 物理洗滌：移除標籤與換行，確保口語純淨度
    ssml = ssml.replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').trim();

    // 🚀 2. 語流焊接：封殺助詞後的微停頓 (對話不需要 5ms 斷氣感)
    // 💡 職人診斷：對話模式下，助詞與後方詞彙應完全導通，維持流暢語速
    ssml = ssml.replace(/([はもをにが])(?![\n、。のは])/g, '$1');

    // 🚀 3. 口語句尾優化：です/ます 快速收尾 (不加額外 break)
    ssml = ssml.replace(/です([。！？\s]|$)/g, '<prosody pitch="-0.6st" rate="105%">です</prosody>$1');
    ssml = ssml.replace(/ます([。！？\s]|$)/g, '<prosody pitch="-0.4st" rate="105%">ます</prosody>$1');

    // 🚀 4. 對話呼吸校準：縮減標點停頓 (維持對話節奏)
    // 💡 職人對焦：對話中的句點不需要 800ms 那麼長，500ms 即可達到自然換氣感
    ssml = ssml.replace(/。/g, '。<break time="500ms"/>');
    ssml = ssml.replace(/[！？]/g, '$&<break time="500ms"/>');
    ssml = ssml.replace(/、/g, '、<break time="200ms"/>');

    // 🚀 5. 邏輯轉折對焦
    ssml = ssml.replace(/(ですので|けれども|けれども|のに|ですが)/g, '$1<break time="300ms"/>');

    return ssml.replace(/\s+/g, ' ').trim();
},

/** 🧪 [Refinery-Engine] 精煉引擎核心 (V2026.ULTRA.FINAL_STABLE) */
_runRefineryEngine(content) {
    let ssml = content;
    const globalRate = parseFloat(localStorage.getItem('tf_audio_rate') || '0.95');
    const offset = parseInt(localStorage.getItem('tf_long_phrase_offset') || '-10');
    const targetRateStr = Math.round(globalRate * (1 + offset / 100) * 100) + '%';

    // 🚀 1. 物理洗滌：移除舊標籤並處理噪訊
    ssml = ssml.replace(/<[^>]*>/g, '')
               .replace(/[=＝「」]/g, ' ')
               .replace(/\s+/g, ' ').trim();

    // 🚀 2. 注入「音調曲線 (Contour)」
    const contour = "(0%, +0st) (40%, +2.2st) (100%, -1.0st)";
    const connectors = ["但是", "然而", "因此", "所以", "結果", "ですが", "しかし", "そのため", "その結果", "また現在"];
    connectors.forEach(word => {
        ssml = ssml.replace(new RegExp(word, 'g'), `<prosody contour="${contour}" rate="102%">${word}</prosody>`);
    });

    // 🚀 3. 句尾語義塊鎖定 (Precision Anchor)
    const tailKeywords = ["ます", "です", "ました", "でした", "なりました", "判明しました", "話しました", "注目しました", "分析しました", "わかります", "問題です"];
    tailKeywords.forEach(kw => {
        const regex = new RegExp(`(${kw})(?=[。！？\\n\\s]|$)`, 'g');
        ssml = ssml.replace(regex, `[[TAIL_${kw}]]`);
    });

    // 🚀 4. 長句流體減速
    ssml = ssml.replace(/([^、。！？<>\[\]]{18,})([がはもを])(?![、。！？])/g, (match, text, particle) => {
        return `<prosody rate="${targetRateStr}">${text}${particle}</prosody><break time="180ms"/>`;
    });

    // 🚀 5. 還原句尾保護區
    ssml = ssml.replace(/\[\[TAIL_(.*?)\]\]/g, `<prosody pitch="-1.2st" rate="94%">$1</prosody>`);

    // 🔥 [CRITICAL DEFENSE] 殘留標籤熔斷
    if (ssml.includes('[[TAIL_')) {
        ssml = ssml.replace(/\[\[TAIL_(.*?)\]\]/g, '$1');
    }

    // 🚀 6. 標點校準
    ssml = ssml.replace(/。/g, '。<break time="750ms"/>');
    ssml = ssml.replace(/、/g, '、<break time="200ms"/>');

    // 🚀 7. 物理去重與真空化壓縮
    ssml = this._prosodySanitizer(ssml);
    ssml = ssml.replace(/(<break time="\d+ms"\s*\/>)[\s\n\r]*\1/g, '$1');
    
    // 💡 終極對焦：移除標籤間的空格與換行
    const refinedContent = ssml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

    // 🔥 [CRITICAL WELD] 輸出主權封裝
    // 💡 職人診斷：確保單一軌道輸出時，具備完整的 <speak> 根標籤。
    // 如果內容已經包含 <speak> (防止重複包裹)，則直接回傳。
    if (refinedContent.startsWith('<speak')) return refinedContent;

    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ja-JP"><prosody rate="1.0" pitch="0st">${refinedContent}</prosody></speak>`;
},



/** 📡 [Relay] 中繼站：API 通訊與主權釋放 (V2026.ULTRA.CHIRP_PURE_WELD) */
async _fetchSynthesizedAudio(text, voiceId, rate, pitch) {
    const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;
    
    // 🚀 1. 數據純化：物理切除所有隱形 HTML/SSML 標籤
    // 💡 職人診斷：Chirp3 模式下，input 必須鎖定為 'text' 而非 'ssml'
    const cleanText = String(text).replace(/<[^>]*>/g, "").trim();
    if (!cleanText) return null;

    // 🚀 2. 聲學主權配置 (Voice Selection)
    // 💡 確保 voiceId 是 Chirp3-HD 的真實 ID
    const voiceConfig = { 
        languageCode: 'ja-JP',
        name: voiceId || localStorage.getItem('tf_voice_id') || 'ja-JP-Neural2-B'
    };

    // 🚀 3. 參數解耦協定 (Audio Config)
    // 💡 Chirp3 建議語速維持 1.0 以發揮 Studio 品質，pitch 必須為 0.0
    const audioConfig = {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.25, Math.min(parseFloat(rate) || 1.0, 4.0)),
        pitch: 0.0 
    };

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text: cleanText }, // 🎯 關鍵：改用純 text，封殺 SSML 400 衝突
                voice: voiceConfig,
                audioConfig: audioConfig
            })
        });

        const rawResponse = await response.text();

        if (!response.ok) {
            const errorData = JSON.parse(rawResponse);
            console.error(`🚨 [API-Blocked] Model: ${voiceConfig.name} | Status: ${response.status}`);
            
            // 衛星自癒：若模型失效，自動退回 Neural2 備援
            if (rawResponse.includes("does not exist")) {
                console.warn("🛰️ [Self-Healing] 模型偏移，執行備援導正...");
                return await this._fetchSynthesizedAudio(cleanText, 'ja-JP-Neural2-B', rate, pitch);
            }
            throw new Error(`TTS_FAIL: ${errorData.error?.message || "Unknown"}`);
        }

        const data = JSON.parse(rawResponse);
        return data.audioContent;

    } catch (err) {
        console.error("❌ [Engine-Relay-Dead]:", err.message);
        throw err;
    }
},

/** 🧬 物理工具：Base64 數據洗滌與 Blob 封裝 */
_base64ToBlob(base64, type = 'audio/mp3') {
    try {
        // 🚀 1. 物理導通：將 Base64 字串轉化為二進位字串
        const binStr = atob(base64);
        
        // 🚀 2. 空間優化：直接透過 Uint8Array.from 進行數據焊接
        // 💡 職人觀點：這比傳統 for 迴圈更節省記憶體，且對行動裝置更友善
        const arr = Uint8Array.from(binStr, (c) => c.charCodeAt(0));
        
        // 🚀 3. 封裝並回傳 Blob 燃料
        return new Blob([arr], { type: type });
    } catch (err) {
        console.error("❌ [Base64-Collapse] 數據轉譯失敗:", err);
        return null;
    }
},


/** 🛡️ 降級軌道：原生 Web Speech API (V2026.ULTRA 物理攔截版) */
_fallbackSpeak(text, rate = 0.9, pitch = 0.0) {
    // 🚀 1. 物理入口攔截
    // 💡 職人診斷：若總線已下達停止指令，嚴禁啟動原生引擎，直接封殺進入點
    if (window.JP_AUDIO_STOP_SIGNAL === true) {
        console.warn("⚠️ [JP-TTS-Fallback] 攔截成功：偵測到熔斷旗幟，拒絕啟動降級軌道");
        return;
    }

    // 🚀 2. 物理搶占：清空排隊中的語音
    if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
    }

    // 🚀 3. 構建聲學實體
    const uttr = new SpeechSynthesisUtterance(text);
    uttr.lang = 'ja-JP';
    
    // 🛡️ 4. 參數補償與映射
    const safeRate = Math.max(0.1, Math.min(parseFloat(rate) || 1.0, 2.0));
    uttr.rate = safeRate;
    
    const pitchOffset = (parseFloat(pitch) || 0) * 0.125; 
    const safePitch = Math.max(0.1, Math.min(1.0 + pitchOffset, 2.0));
    uttr.pitch = safePitch;
    uttr.volume = 1.0;

    // 🚀 5. 雙重保險：在語音「即將噴發」的瞬間再次核對旗幟
    // 💡 職人診斷：SpeechSynthesis 有時會有啟動延遲，透過 onstart 確保最後一毫秒的熔斷權
    uttr.onstart = () => {
        if (window.JP_AUDIO_STOP_SIGNAL === true) {
            window.speechSynthesis.cancel();
            console.log("🚫 [JP-TTS-Fallback] 原生語音啟動瞬間熔斷成功");
        }
    };

    // 🚀 6. 執行導通
    window.speechSynthesis.speak(uttr);

    console.warn(`⚠️ [JP-TTS-Fallback] 導通原生引擎 | 語速: ${safeRate}x | 映射音高: ${safePitch.toFixed(2)}`);
}

};

window.audioManager = audioManager;