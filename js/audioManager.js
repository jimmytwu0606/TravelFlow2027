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

/** 🎯 直接指定聲線播放，跳過角色識別 */
async speakWithVoice(text, voiceId) {
    if (!text || !voiceId) return;
    window.JP_AUDIO_STOP_SIGNAL = false;
    const rate = parseFloat(localStorage.getItem('tf_audio_rate') || '1.0');
    const pitch = parseFloat(localStorage.getItem('tf_audio_pitch') || '0');
    console.log(`🎯 [Direct-Voice] 直接對焦聲線: ${voiceId}`);
    try {
        const audioContent = await this._fetchSynthesizedAudio(text, voiceId, rate, pitch);
        if (audioContent) await this._executePhysicalPlayback(audioContent);
    } catch (err) {
        console.error('❌ [speakWithVoice] 失敗:', err);
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

/** 🧪 [Sub-Module 1] 聲學物理洗滌器 (V2026.ULTRA.V3.0 精簡版) */
_sanitizeAcoustic(t) {
    if (!t) return "";
    let clean = String(t);

    // 1. HTML 清理
    clean = clean.replace(/<rt>.*?<\/rt>/g, "");
    clean = clean.replace(/<[^>]*>/g, "");

    // 2. 括號處理
    // 純數字括號（年齡補充）→ 移除，新聞不朗讀
    clean = clean.replace(/[（(]当時\d+[）)]/g, "");
    clean = clean.replace(/[（(]\d+[）)]/g, "");
    // 括號注音 → 移除
    clean = clean.replace(/[\(（][ぁ-んァ-ヶー\s]+[\)）]/g, "");

    // 3. TTS 真的念不好的特殊情況才干預

    // 金額：¥記號 TTS 不認識 → 念出來
    clean = clean.replace(/[¥￥]([0-9,，]+)/g, (_, num) => {
        return num.replace(/[,，]/g, '') + '円';
    });

    // 時間：14:30 → 14時30分（讓 TTS 自己念）
    clean = clean.replace(/(\d{1,2}):(\d{2})/g, '$1時$2分');

    // 號碼類：逐字念避免 TTS 念成「じゅうさん」→ 直接給假名
    const numMap = { 0:'ゼロ',1:'いち',2:'に',3:'さん',4:'よん',5:'ご',6:'ろく',7:'なな',8:'はち',9:'きゅう' };
    clean = clean.replace(/(\d+)(号車|番線|番出口|号室|番地)/g, (_, num, suffix) => {
        const reading = { '号車':'ごうしゃ','番線':'ばんせん','番出口':'ばんでぐち','号室':'ごうしつ','番地':'ばんち' };
        return num.split('').map(d => numMap[parseInt(d)] || d).join('') + (reading[suffix] || suffix);
    });

    // 小數點：80.1% → TTS 念「はちじゅってんいち」會怪，改成漢字讓 TTS 念
    clean = clean.replace(/(\d+)\.(\d+)/g, (_, int, dec) => `${int}・${dec}`);

    // 4. 英文縮寫：TTS 念英文字母串很卡 → 轉片假名（長的優先）
    const engMap = {
        'SDGs':'エスディージーズ', 'OIST':'オイスト', 'WiFi':'ワイファイ',
        'DNA':'ディーエヌエー', 'GDP':'ジーディーピー', 'WHO':'ダブリューエイチオー',
        'NPO':'エヌピーオー', 'ATM':'エーティーエム', 'URL':'ユーアールエル',
        'SNS':'エスエヌエス', 'BGM':'ビージーエム', 'JR':'ジェイアール',
        'Wi-Fi':'ワイファイ', 'IC':'アイシー', 'QR':'キューアール',
        'AI':'エーアイ', 'PC':'ピーシー', 'OK':'オーケー', 'ID':'アイディー',
    };
    Object.entries(engMap).sort((a, b) => b[0].length - a[0].length).forEach(([eng, jp]) => {
        clean = clean.replace(new RegExp(`\\b${eng}\\b`, 'g'), jp);
    });

    // 5. 記號轉換（TTS 不認識的符號）
    clean = clean
        .replace(/℃/g, '度')
        .replace(/％|%/g, 'パーセント')
        .replace(/→/g, 'から')
        .replace(/〜|~/g, 'から')
        .replace(/＝|=/g, 'イコール')
        .replace(/×/g, 'かける')
        .replace(/・/g, '、')
        .replace(/km/g, 'キロ')
        .replace(/kg/g, 'キロ');

    // 6. 語流清理
    clean = clean.replace(/[「」""''『』]/g, "")
                 .replace(/[*_#`【】〔〕［］]/g, "")
                 .replace(/\s+(?=[はもをにが])/g, "")
                 .replace(/[\u200B-\u200D\uFEFF]/g, "")
                 .replace(/\s{2,}/g, ' ')
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
            const role = seg.role || null;
const dna = this._getAcousticIdentity(String(rawText), actorA, actorB, role);
            
            // 💡 Content Thread：真空洗滌 (移除「姓名：」前綴)
            const cleanContent = this._getCleanDialogue(String(rawText));
            if (!cleanContent) continue;

            // 🔥 [CRITICAL FIX] 提取人物基因組中的「物理參數」
            // 💡 職人診斷：如果 dna 物件內有參數，優先使用；若無則採系統預設。
            const finalRate = dna.rate || localStorage.getItem('tf_audio_rate') || '1.0';
            // pitch 去掉 st 單位再傳給 API
            const finalPitch = parseFloat(String(dna.pitch || '0').replace('st', '')) || 0.0;

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
                // 同角色連說：150ms 微停頓；不同角色交替：450ms 換氣感
                const nextSeg = segments[segments.indexOf(seg) + 1];
                const nextRaw = nextSeg ? (nextSeg.text || (Array.isArray(nextSeg) ? nextSeg[0] : nextSeg)) : null;
                const nextDna = nextRaw ? this._getAcousticIdentity(String(nextRaw), actorA, actorB) : null;
                const pause = (nextDna && nextDna.name !== dna.name) ? 450 : 150;
                await new Promise(res => setTimeout(res, pause));
            }
        }

        console.log(`✅ [Acoustic-Output] Chirp3-HD 劇場序列播報完畢`);

    } catch (err) {
        if (window.JP_AUDIO_STOP_SIGNAL === true) return;
        console.error("❌ [Audio-Collapse] 執行備援軌道:", err);
        // 正確萃取純文字，避免 [object Object] 問題
        let fallbackText = "";
        if (typeof input === 'string') {
            fallbackText = input;
        } else if (Array.isArray(segments) && segments.length > 0) {
            fallbackText = segments.map(s => {
                const raw = s.text || (Array.isArray(s) ? s[0] : s) || "";
                return this._getCleanDialogue(String(raw));
            }).filter(Boolean).join('。');
        } else {
            fallbackText = String(input);
        }
        const savedRate = parseFloat(localStorage.getItem('tf_audio_rate') || '0.9');
        this._fallbackSpeak(fallbackText, savedRate, 0.0);
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



/** 🧬 [Identity-Thread] 子函數 A：全量聲學對位器 (V2026.ULTRA.V2.2 性別強化版) */
_getAcousticIdentity(rawText, actorA, actorB, role = null) {

    // 🚀 0. role 直接對位（來自 _parseInputToDialogue 的結構化資料）
    if (role) {
        const isMan = (role === 'man' || role === 'male' || role === '男');
        const allVoices = CONFIG.VOICE_LIST || [];
        const malePool = allVoices.filter(v => v.gender === 'M').map(v => v.id);
        const femalePool = allVoices.filter(v => v.gender === 'F').map(v => v.id);
        const seed = rawText.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
        const targetPool = isMan ? malePool : femalePool;
        const targetModel = targetPool.length > 0
            ? targetPool[seed % targetPool.length]
            : (isMan ? 'ja-JP-Chirp3-HD-Iapetus' : 'ja-JP-Chirp3-HD-Leda');
        console.log(`🎭 [Role-Direct] role="${role}" | 性別: ${isMan ? '男' : '女'} | 模型: ${targetModel}`);
        return {
            voice: targetModel,
            pitch: '0st',
            rate: '1.0',
            name: role
        };
    }

    // 🚀 1. 名字切片：支援全形/半形冒號，限前 20 字
    const separatorIndex = rawText.search(/[：:]/);
    let name = "";
    if (separatorIndex !== -1 && separatorIndex < 20) {
        name = rawText.substring(0, separatorIndex)
            .replace(/[*_#\s「」【】〔〕]/g, "")
            .trim();
    }

    // 🛡️ 熔斷：無名狀態回歸系統預設
    if (!name) return { voice: 'ja-JP-Chirp3-HD-Iapetus', pitch: '0st', rate: '1.0', name: '系統' };

    // 🚀 2. CHARACTER_EGGS 靈魂優先導通（支援多種模糊匹配格式）
    const eggs = window.CHARACTER_EGGS || {};
    const eggKey = Object.keys(eggs).find(k =>
        k === name ||                          // 完全匹配
        k.startsWith(name + "(") ||            // name(標籤) 格式
        k.startsWith(name + "（") ||           // name（標籤）全形格式
        k.startsWith(name + " ") ||            // name 空格 格式
        name.startsWith(k)                     // 名字包含 egg key（處理敬稱）
    );
    const persona = eggs[eggKey];

    if (persona) {
        console.log(`🎯 [Soul-Linked] 靈魂覺醒: ${name} | Voice: ${persona.voice} | Pitch: ${persona.pitch}st`);
        return {
            voice: persona.voice,
            pitch: String(persona.pitch).includes('st') ? persona.pitch : `${persona.pitch}st`,
            rate: String(persona.rate || '1.0'),
            name: name,
            traits: persona.traits || []
        };
    }

    // 🚀 3. actorA / actorB 對位（外部傳入角色優先）
    if (actorA && name === actorA.name) {
        return {
            voice: actorA.voice || 'ja-JP-Neural2-C',
            pitch: String(actorA.pitch || '0st').includes('st') ? String(actorA.pitch || '0st') : `${actorA.pitch}st`,
            rate: String(actorA.rate || '1.0'),
            name: name
        };
    }
    if (actorB && name === actorB.name) {
        return {
            voice: actorB.voice || 'ja-JP-Neural2-B',
            pitch: String(actorB.pitch || '0st').includes('st') ? String(actorB.pitch || '0st') : `${actorB.pitch}st`,
            rate: String(actorB.rate || '1.0'),
            name: name
        };
    }

    // 🚀 4. 聲池提領
    const allVoices = CONFIG.VOICE_LIST || [];
    const malePool = allVoices.filter(v => v.gender === 'M').map(v => v.id);
    const femalePool = allVoices.filter(v => v.gender === 'F').map(v => v.id);

// 🚀 5. 性別判定（強化女性漢字庫 + NAME_POOL 雙軌）
const femaleKanji = /[子美奈香恵愛理沙紀江優花梨桜麻彩菜里里悠葵澪凛莉加穂咲朱千夏妃姫妙幸雪柚鈴椿茜藍螢栞]/;
const maleKanji   = /[郎朗雄男武剛斗翔将太大樹勇海陸凌颯蒼士志功]{1}/;
const pool = window.NAME_POOL || [];
const poolEntry = pool.find(e => name.includes(e[0]) || e[0].includes(name));

let isMan;

// 最優先：直接角色標籤（男：/ 女：的前綴被切出來就是這兩個字）
if (name === '男' || name === '男性') {
    isMan = true;
} else if (name === '女' || name === '女性') {
    isMan = false;
} else if (poolEntry) {
    isMan = poolEntry[1] === 'm';
} else if (femaleKanji.test(name)) {
    isMan = false;
} else if (maleKanji.test(name)) {
    isMan = true;
} else {
    const lastChar = name.slice(-1);
    isMan = !femaleKanji.test(lastChar);
}

    // 🚀 6. 模型雜湊（同名永遠對到同一個聲音）
    const seed = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const targetPool = isMan ? malePool : femalePool;
    const targetModel = targetPool.length > 0
        ? targetPool[seed % targetPool.length]
        : (isMan ? 'ja-JP-Chirp3-HD-Algenib' : 'ja-JP-Chirp3-HD-Aoede');

    console.warn(`👤 [Identity-Fallback] 角色「${name}」未在名單內 | 性別: ${isMan ? '男' : '女'} | 模型: ${targetModel}`);

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

/** 🧪 [Dialogue-Engine] 對話專用精煉引擎 (V2026.ULTRA.V2.2 口語強化版) */
_runDialogueEngine(content) {
    let ssml = content;

    // 1. 洗滌：先過聲學洗滌器，再移除標籤與換行
    ssml = this._sanitizeAcoustic(ssml);
    ssml = ssml.replace(/<[^>]*>/g, '').replace(/[\r\n]+/g, ' ').trim();

    // 2. 語流焊接：封殺助詞前後多餘空格
    ssml = ssml.replace(/\s+(?=[はもをにがでもへより])/g, '');
    ssml = ssml.replace(/([はもをにがでもへより])\s+(?!\s)/g, '$1');

    // 3. 口語感嘆詞前加微停頓（讓情緒有落點）
    const interjections = ['あの', 'えっと', 'ちょっと', 'まあ', 'ねえ', 'うん', 'へえ', 'ふーん', 'そうか', 'なるほど', 'やっぱり', 'やはり'];
    interjections.forEach(w => {
        ssml = ssml.replace(new RegExp(`(^|[。！？、\\s])(${w})`, 'g'),
            `$1<break time="150ms"/>${w}`);
    });

    // 4. 句尾語調分流（口語版，比精煉引擎更輕柔）
    // 疑問句尾：音調上揚
    ssml = ssml.replace(/(か|の|かな|かしら)(?=[。？\s」]|$)/g,
        `<prosody pitch="+1.2st" rate="97%">$1</prosody>`);
    // 確認/共鳴句尾：微上揚
    ssml = ssml.replace(/(よね|だよね|ですよね|ますよね|ね|だね|ですね)(?=[。\s」]|$)/g,
        `<prosody pitch="+0.6st" rate="98%">$1</prosody>`);
    // 強調句尾：微上揚帶速度
    ssml = ssml.replace(/(よ|だよ|ですよ|ますよ|わよ|のよ)(?=[。！\s」]|$)/g,
        `<prosody pitch="+0.4st" rate="103%">$1</prosody>`);
    // 感嘆/柔和句尾：微降
    ssml = ssml.replace(/(だわ|のね|かしら|わね)(?=[。\s」]|$)/g,
        `<prosody pitch="-0.3st" rate="96%">$1</prosody>`);
    // 正式口語句尾：語調下沉收尾
    ssml = ssml.replace(/です(?=[。！？\s」]|$)/g,
        `<prosody pitch="-0.6st" rate="105%">です</prosody>`);
    ssml = ssml.replace(/ます(?=[。！？\s」]|$)/g,
        `<prosody pitch="-0.4st" rate="105%">ます</prosody>`);
    // 口語縮約形
    ssml = ssml.replace(/じゃん(?=[。！\s」]|$)/g,
        `<prosody pitch="+0.8st" rate="106%">じゃん</prosody>`);
    ssml = ssml.replace(/っけ(?=[。？\s」]|$)/g,
        `<prosody pitch="+1.0st" rate="97%">っけ</prosody>`);

    // 5. 轉折詞擴充（對話版，停頓比精煉引擎短）
    const connectors = [
        'ですが', 'ですので', 'けれども', 'だけど', 'でも', 'のに',
        'それで', 'だから', 'なのに', 'ところが', 'そして', 'それに',
        'あと', 'それから', 'ちなみに', 'そういえば'
    ];
    connectors.forEach(w => {
        // 前面已有 break 的情況不再重複插入
        ssml = ssml.replace(new RegExp(`(?<!<break[^>]*/>)(${w})`, 'g'),
            `<break time="200ms"/>$1<break time="100ms"/>`);
    });

    // 重複 break 合併（取最大值）
    ssml = ssml.replace(/(<break time="(\d+)ms"\s*\/>)\s*(<break time="(\d+)ms"\s*\/>)/g, (_, b1, t1, b2, t2) => {
        return `<break time="${Math.max(parseInt(t1), parseInt(t2))}ms"/>`;
    });

    // 6. 標點停頓校準（對話版，比精煉引擎短 30%）
    ssml = ssml.replace(/。/g, '。<break time="500ms"/>');
    ssml = ssml.replace(/[！]/g, '！<break time="450ms"/>');
    ssml = ssml.replace(/[？]/g, '？<break time="450ms"/>');
    ssml = ssml.replace(/、/g, '、<break time="180ms"/>');
    ssml = ssml.replace(/…/g, '<break time="400ms"/>');

    // 7. 重複 break 去重
    ssml = ssml.replace(/(<break time="\d+ms"\s*\/>){2,}/g, (match) => {
        const times = [...match.matchAll(/time="(\d+)ms"/g)].map(m => parseInt(m[1]));
        const maxTime = Math.max(...times);
        return `<break time="${maxTime}ms"/>`;
    });

    return ssml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
},

/** 🧪 [Refinery-Engine] 精煉引擎核心 (V2026.ULTRA.V2.3 學習回饋版) */
_runRefineryEngine(content) {
    let ssml = content;
    const globalRate = parseFloat(localStorage.getItem('tf_audio_rate') || '0.95');
    const offset = parseInt(localStorage.getItem('tf_long_phrase_offset') || '-10');
    const targetRateStr = Math.round(globalRate * (1 + offset / 100) * 100) + '%';

    // 🚀 0. 讀取學習庫（方案B 回饋）
    let hotTriggers = [];
    let dynamicThreshold = 10;
    try {
        hotTriggers = JSON.parse(localStorage.getItem('tf_hot_triggers') || '[]');
        const suggested = parseInt(localStorage.getItem('tf_suggested_threshold') || '10');
        dynamicThreshold = Math.max(8, Math.min(suggested, 14)); // 限制在 8~14 字之間
    } catch(e) {}

    // 🚀 1. 物理洗滌
    ssml = this._sanitizeAcoustic(ssml);
    ssml = ssml.replace(/<[^>]*>/g, '')
               .replace(/[=＝「」]/g, ' ')
               .replace(/\s+/g, ' ').trim();

    // 🚀 2. 轉折詞音調曲線（靜態 + 學習庫動態合併）
    const contour = "(0%, +0st) (40%, +2.2st) (100%, -1.0st)";
    const staticConnectors = [
        "但是", "然而", "因此", "所以", "結果", "不過", "雖然", "儘管", "即使",
        "ですが", "しかし", "そのため", "その結果", "また現在",
        "ところが", "それでも", "にもかかわらず", "つまり", "したがって",
        "そこで", "それに", "なぜなら", "ただし", "もっとも",
        "一方", "それとも", "あるいは", "もしくは"
    ];
    // 合併學習庫高頻詞（去重）
    const allConnectors = [...new Set([...staticConnectors, ...hotTriggers])];
    // 長的優先處理，避免短詞吃掉長詞
    allConnectors.sort((a, b) => b.length - a.length).forEach(word => {
        ssml = ssml.replace(
            new RegExp(word, 'g'),
            `<prosody contour="${contour}" rate="102%">${word}</prosody><break time="150ms"/>`
        );
    });

    // 🚀 3. 句尾語義塊鎖定
    const tailKeywords = [
        "判明しました", "話しました", "注目しました", "分析しました",
        "なりました", "ありません", "わかります", "問題です", "ください",
        "ました", "でした", "ますよね", "だよね", "ですよね",
        "だろうか", "かしら", "だわ", "のよ", "わよ",
        "ますね", "ですね", "だね", "だな",
        "ますよ", "ですよ", "だよ",
        "かな", "よね",
        "ます", "です",
    ];
    tailKeywords.forEach(kw => {
        const regex = new RegExp(`(${kw})(?=[。！？\\n\\s」]|$)`, 'g');
        ssml = ssml.replace(regex, `[[TAIL_${kw}]]`);
    });

    // 🚀 4. 長句流體減速（動態閾值 + 擴充助詞）
    const particlePattern = new RegExp(
        `([^、。！？<>\\[\\]]{${dynamicThreshold},})([がはもをでにともへより])(?![、。！？])`, 'g'
    );
    ssml = ssml.replace(particlePattern, (match, text, particle) => {
        return `<prosody rate="${targetRateStr}">${text}${particle}</prosody><break time="160ms"/>`;
    });

    // 🚀 5. 複合長句強制切點（學習庫高頻詞額外插 break）
    // 針對「について/において/によって」等長助詞組，無論長短都插斷
    const mandatoryBreaks = [
        'について', 'において', 'によって', 'に関して', 'に対して',
        'ということで', 'ということです', 'ということに',
        'これにより', 'これによって', 'それにより',
        'を受けて', 'を踏まえて', 'に伴い', 'を経て',
        'を手がかりに', 'に注目し', '引き起こす', 'にあたって',
        'をもとに', 'をきっかけに', 'によると', 'とされて',
        'とみられ', 'に含まれ', 'がわかり', 'ことが判明',
        'ことがわかっ', 'に活躍した', 'として知られ',
        ...hotTriggers.filter(t => t.length >= 4) // 學習庫中長度 4+ 的高頻詞
    ];
    // 去重並按長度排序
    [...new Set(mandatoryBreaks)].sort((a, b) => b.length - a.length).forEach(phrase => {
        ssml = ssml.replace(new RegExp(`(${phrase})(?!<break)`, 'g'), `$1<break time="170ms"/>`);
    });

    // 🚀 6. 疑問句語調上揚
    ssml = ssml.replace(/(ですか|ますか)(?=[。？\s」]|$)/g,
        `<prosody pitch="+1.8st" rate="96%">$1</prosody><break time="200ms"/>`
    );
    ssml = ssml.replace(/(か)(?=[。？\s]|$)/g,
        `<prosody pitch="+1.5st" rate="97%">か</prosody>`
    );

    // 🚀 7. 還原句尾保護區（語調分流）
    ssml = ssml.replace(/\[\[TAIL_(よね|だよね|ですよね|ますよね|かな|かしら|だろうか)\]\]/g,
        `<prosody pitch="+0.8st" rate="96%">$1</prosody>`
    );
    ssml = ssml.replace(/\[\[TAIL_(だよ|ですよ|ますよ|わよ|のよ)\]\]/g,
        `<prosody pitch="+0.5st" rate="97%">$1</prosody>`
    );
    ssml = ssml.replace(/\[\[TAIL_(だな|だね|ですね|ますね|だわ)\]\]/g,
        `<prosody pitch="-0.5st" rate="97%">$1</prosody>`
    );
    ssml = ssml.replace(/\[\[TAIL_(.*?)\]\]/g,
        `<prosody pitch="-1.2st" rate="94%">$1</prosody>`
    );
    if (ssml.includes('[[TAIL_')) {
        ssml = ssml.replace(/\[\[TAIL_(.*?)\]\]/g, '$1');
    }

    // 🚀 8. 標點停頓校準
    ssml = ssml.replace(/。/g, '。<break time="750ms"/>');
    ssml = ssml.replace(/[！]/g, '！<break time="600ms"/>');
    ssml = ssml.replace(/[？]/g, '？<break time="600ms"/>');
    ssml = ssml.replace(/、/g, '、<break time="200ms"/>');
    ssml = ssml.replace(/…/g, '<break time="500ms"/>');
    ssml = ssml.replace(/\n/g, '<break time="900ms"/>');

    // 🚀 9. 連續 break 合併（取最大值，不堆疊）
    ssml = ssml.replace(/(<break time="(\d+)ms"\s*\/>)\s*(<break time="(\d+)ms"\s*\/>)/g,
        (_, b1, t1, b2, t2) => `<break time="${Math.max(parseInt(t1), parseInt(t2))}ms"/>`
    );
    // 再跑一次確保沒有三連 break
    ssml = ssml.replace(/(<break time="(\d+)ms"\s*\/>)\s*(<break time="(\d+)ms"\s*\/>)/g,
        (_, b1, t1, b2, t2) => `<break time="${Math.max(parseInt(t1), parseInt(t2))}ms"/>`
    );

    // 🚀 10. 物理去重與壓縮
    ssml = this._prosodySanitizer(ssml);
    const refinedContent = ssml.replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();

    if (refinedContent.startsWith('<speak')) return refinedContent;
    return `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="ja-JP"><prosody rate="1.0" pitch="0st">${refinedContent}</prosody></speak>`;
},



/** 📡 [Relay] 中繼站：API 通訊與主權釋放 (V2026.ULTRA.CHIRP_PURE_WELD) */
async _fetchSynthesizedAudio(text, voiceId, rate, pitch) {
    const endpoint = `https://texttospeech.googleapis.com/v1/text:synthesize?key=${this.apiKey}`;

    const cleanText = String(text).replace(/<[^>]*>/g, "").trim();
    if (!cleanText) return null;

    // 🚀 2. 聲學主權配置：動態提取 languageCode，不寫死
    const finalVoiceId = voiceId || localStorage.getItem('tf_voice_id') || 'ja-JP-Chirp3-HD-Iapetus';
    const langParts = finalVoiceId.split('-');
    const languageCode = `${langParts[0]}-${langParts[1]}`; // 'ja-JP' 或 'en-US'

    const voiceConfig = {
        languageCode: languageCode,
        name: finalVoiceId
    };

    // 🚀 3. 參數解耦協定
    // 💡 Chirp3-HD 建議 speakingRate 1.0，pitch 鎖定 0.0
    const isChirp3 = finalVoiceId.includes('Chirp3');
    const audioConfig = {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.25, Math.min(parseFloat(rate) || 1.0, 4.0)),
        pitch: isChirp3 ? 0.0 : (parseFloat(pitch) || 0.0)
    };

    console.log(`🎙️ [TTS-Relay] Voice: ${finalVoiceId} | Rate: ${audioConfig.speakingRate} | Pitch: ${audioConfig.pitch}`);

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                input: { text: cleanText },
                voice: voiceConfig,
                audioConfig: audioConfig
            })
        });

        const rawResponse = await response.text();

        if (!response.ok) {
            const errorData = JSON.parse(rawResponse);
            console.error(`🚨 [API-Blocked] Model: ${finalVoiceId} | Status: ${response.status} | ${errorData.error?.message}`);

            // 衛星自癒：模型不存在時退回 Chirp3-HD 預設
            if (rawResponse.includes("does not exist") || rawResponse.includes("not found")) {
                console.warn("🛰️ [Self-Healing] 模型偏移，退回 Chirp3-HD 預設...");
                return await this._fetchSynthesizedAudio(cleanText, 'ja-JP-Chirp3-HD-Iapetus', rate, 0);
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


/** 🛡️ 降級軌道：原生 Web Speech API (V2026.ULTRA 串行斷句引擎版) */
_fallbackSpeak(text, rate = 0.9, pitch = 0.0) {
    if (window.JP_AUDIO_STOP_SIGNAL === true) {
        console.warn("⚠️ [JP-TTS-Fallback] 攔截成功：偵測到熔斷旗幟，拒絕啟動降級軌道");
        return;
    }

    if (window.speechSynthesis) window.speechSynthesis.cancel();

    // 1. 文字洗滌：利用現有管線清理 HTML、符號、注音
    let clean = this._sanitizeAcoustic(String(text));
    if (!clean) return;

    // 2. 智慧斷句：依標點切片，每片段附帶停頓時間（ms）
    //    。！？ → 長停頓 520ms
    //    、，… → 短停頓 260ms
    //    超過 30 字強制切一刀，加 180ms 微停頓
    const chunks = [];
    const parts = clean.split(/([。！？、，…])/);
    let buffer = "";

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        const isPunct = /^[。！？、，…]$/.test(part);

        if (isPunct) {
            buffer += part;
            const pause = /^[。！？]$/.test(part) ? 520 : 260;
            // 超過 30 字再切成子片段
            const subChunks = buffer.match(/.{1,30}/g) || [buffer];
            subChunks.forEach((sub, si) => {
                chunks.push({
                    text: sub.trim(),
                    pause: si < subChunks.length - 1 ? 180 : pause
                });
            });
            buffer = "";
        } else {
            buffer += part;
        }
    }
    // 處理最後沒有標點結尾的殘留
    if (buffer.trim()) {
        const subChunks = buffer.match(/.{1,30}/g) || [buffer];
        subChunks.forEach((sub, si) => {
            chunks.push({
                text: sub.trim(),
                pause: si < subChunks.length - 1 ? 180 : 0
            });
        });
    }

    const validChunks = chunks.filter(c => c.text.length > 0);
    if (validChunks.length === 0) return;

    // 3. 參數設定
    const safeRate = Math.max(0.5, Math.min(parseFloat(rate) || 0.9, 1.6));
    const pitchOffset = (parseFloat(pitch) || 0) * 0.125;
    const safePitch = Math.max(0.5, Math.min(1.0 + pitchOffset, 1.8));

    // 4. 預先選好日文語音（只選一次）
    const voices = window.speechSynthesis.getVoices();
    const jaVoice = voices.find(v => v.lang === 'ja-JP' && v.localService)
                 || voices.find(v => v.lang === 'ja-JP')
                 || voices.find(v => v.lang.startsWith('ja'))
                 || null;

    // 5. 串行播放引擎
    let idx = 0;
    const playNext = () => {
        if (window.JP_AUDIO_STOP_SIGNAL === true) {
            window.speechSynthesis.cancel();
            return;
        }
        if (idx >= validChunks.length) {
            console.log('✅ [Fallback-Engine] 串行播報完畢');
            return;
        }

        const chunk = validChunks[idx++];
        const uttr = new SpeechSynthesisUtterance(chunk.text);
        uttr.lang = 'ja-JP';
        uttr.rate = safeRate;
        uttr.pitch = safePitch;
        uttr.volume = 1.0;
        if (jaVoice) uttr.voice = jaVoice;

        uttr.onstart = () => {
            if (window.JP_AUDIO_STOP_SIGNAL === true) {
                window.speechSynthesis.cancel();
            }
        };

        uttr.onend = () => {
            if (window.JP_AUDIO_STOP_SIGNAL === true) return;
            if (chunk.pause > 0) {
                setTimeout(playNext, chunk.pause);
            } else {
                playNext();
            }
        };

        uttr.onerror = (e) => {
            console.warn(`⚠️ [Fallback-Engine] 片段異常，跳過: "${chunk.text}"`, e.error);
            playNext();
        };

        window.speechSynthesis.speak(uttr);
    };

    // 6. 點火（等待 voices 載入完畢）
    if (window.speechSynthesis.getVoices().length > 0) {
        playNext();
    } else {
        window.speechSynthesis.onvoiceschanged = () => {
            // 重新選音源
            const v = window.speechSynthesis.getVoices();
            const jv = v.find(x => x.lang === 'ja-JP' && x.localService)
                    || v.find(x => x.lang === 'ja-JP')
                    || v.find(x => x.lang.startsWith('ja'));
            if (jv) validChunks.forEach(() => {}); // jaVoice 已在閉包內，不需重設
            playNext();
        };
    }

    console.log(`🎙️ [Fallback-Engine] 串行引擎點火 | ${validChunks.length} 個片段 | 語速: ${safeRate}x | 音高: ${safePitch.toFixed(2)}`);
  }

};

window.audioManager = audioManager;