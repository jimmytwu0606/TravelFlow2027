/** 🧪 [translationEngine] 語義對焦與數據洗滌發動機 - V2026.ULTRA.FINAL */
import { CONFIG } from './config.js';
import { audioManager } from './audioManager.js';
import { uiManager } from './uiManager.js';
import { dbManager } from './dbManager.js';
import { translationView } from './translationView.js';

/** 🧪 [Private] Prompt 渲染庫 */
const _promptTemplates = {


// 📝 文法模組 (V2026.ULTRA.EDU 級別防禦與純淨文字版)
grammar: (level, text, trans) => `
你是一位精通日語教學與 JLPT 級別管理的 TravelFlow 專家。
請針對以下素材執行「文法對焦」解析，任務是為 [JLPT ${level}] 級別的使用者提供燃料。

🚨 【難度導通嚴格協定】：
1. 🚀 級別硬熔斷：【嚴禁】出現超出 ${level} 難度的文法點。若原文包含高階語法（如 N2 見通し、におよぶ），請將其簡化或轉向提取該句中的基礎助詞、接續詞或 ${level} 級別的語法零件。
2. 🚀 數量控制：必須精確提取 3 至 5 個符合 ${level} 級別的關鍵文法點。
3. 🚀 自然文本協定：【嚴禁】使用任何 Ruby 標註或讀音括號。直接輸出純日文漢字與假名。
4. 🚀 原創造句：【嚴禁】抄錄原文。請針對文法點重新撰寫一個全新、簡單且符合 ${level} 難度的實境例句。

數據欄位定義：
- point: 文法名稱 (中文名稱)
- level: "${level}"
- meaning: 符合 ${level} 理解能力的簡短說明
- example: 全新造句日文原文 (中文譯文)

輸出範例格式 (JSON Array)：
[
  {
    "point": "受身形 (被動語態)",
    "level": "${level}",
    "meaning": "用於客觀陳述事實。",
    "example": "新しい商品が発売されました (新商品開賣了)"
  }
]`,

// 📖 單字模組 (V2026.ULTRA.EDU 8元組高密度全鏈路版)
vocab: (level, text, trans) => `
你是一位精通日語單字擴充的 TravelFlow 專家。請從以下段落提取 5-8 個符合 ${level} 難度的關鍵單字。
[目標級別]：JLPT ${level}
[原文]：${text}

🚨 【數據生成嚴格協定】：
1. 提取數量：精確提取 5-8 個單字，優先選擇對語義理解至關重要的核心詞彙。
2. 輸出格式：必須僅輸出一個「JSON Array (陣列)」，嚴禁 Markdown 標籤 (\`\`\`json) 或任何前言後語。
3. 數據指紋對焦：
   - 每個元素必須包含 "level": "${level}" 與 "data" 欄位。
   - data 欄位嚴格遵守 8 元組標準陣列：[Word, Reading, POS, Accent, Tone, Trans, Example, Example_Trans]。

🚨 物理軌道校準標準：
- Word: 漢字與送假名原型。
- Reading: 【純假名】，嚴禁混入漢字或數字。
- POS: 品詞縮寫（如：名、動五、形一、副）。
- Accent/Tone: 精確標註音調核數字與類型（如：0 / 平板型）。
- Trans: 職人級語境翻譯（如：事件 (指發生的社會案件或事故)）。
- Example: 旅遊或新聞實境應用句。
- Example_Trans: 例句的中文翻譯。

輸出範例格式：
[
  {
    "level": "${level}",
    "data": ["事件", "じけん", "名", "1", "頭高型", "事件 (指發生的社會案件或事故)", "旅行中に盗難事件に遭わないよう注意してください。", "旅行中請注意不要遇到盜竊事件。"]
  },
  { ... },
  { ... }
]`,


// ❓ 測驗模組 (V2026.ULTRA.EDU 邏輯閉環與答案對位版)
quiz: (level, text, trans) => `
你是一位專業的 JLPT 命題官。請根據以下素材撰寫三題「情境變換」模擬測驗。
[目標級別]：JLPT ${level}
[素材脈絡]：${text}

🚨 【原創命題與邏輯強對位協定】：
1. 🚀 答案對位熔斷 (CRITICAL)：【answer 欄位的值，必須與 options 陣列中的某一個字串 100% 完全一致】。嚴禁出現「選項是變形後，答案給原型」的斷路現象。
2. 🚀 活用形精確化：若題目考查動詞活用（如：～そうです、～ために），則正確選項與 answer 必須是【變形後的正確狀態】。
3. 🚀 情境遷移禁令：【嚴禁抄錄原文】。必須從原文提取關鍵詞，重新造一個「商務、旅遊或日常」的全新句子。
4. 🚀 級別防禦：題目與選項嚴格限制在 ${level} 難度，嚴禁虐殺新手。
5. 🚀 純淨文本：【嚴禁】使用任何讀音括號或 Ruby 標籤。

數據格式要求：
- question: 全新的題目內容 (包含底線 ____)。
- options: 包含 4 個字串的陣列。
- answer: 正確選項的「完整字串」(必須存在於 options 中)。
- analysis: 職人級解析 (台灣繁體中文，解釋文法邏輯與對位關鍵)。
- level: "${level}"

輸出範例：
[
  {
    "question": "空が暗いですから、もうすぐ雨が____そうです。",
    "options": ["降る", "降り", "降って", "降った"],
    "answer": "降り",
    "analysis": "考查樣態助動詞 'そうだ' 的接續方式。動詞須使用連用形 (ます形去掉ます)，故選擇 '降り'。",
    "level": "${level}"
  }
]`,


// 🎧 聽力練習模組 (V2026.ULTRA 物理導通穩定版)
listening: (level, text, trans) => `
你是一位專業的 JLPT 聽解命題官。請將素材零件「徹底改寫」為男女對話考題，並確保 JSON 格式與 TravelFlow 渲染引擎完全導通。

🚨 【燃料物理導通協定】：
1. **audioText (播報靈魂)**：必須是「純文字字串」，嚴禁 JSON 或陣列。請手動在句子間加入「ええと、あの」等填充詞。
2. **options (測驗靈魂)**：必須是 3 個具體的中文選項。
3. **pacing (題目指令)**：必須是中文提問。
4. **variation (人類視覺)**：嚴禁出現斜線「/」。請直接提供乾淨的日文對話文本，角色標註為「男：」、「女：」。

🚨 【數據定義】：
- pacing: 針對音軌的中文提問。
- audioText: 要讀出來的日文全文（含角色對話內容，純字串）。
- options: [ "中文描述1", "中文描述2", "中文描述3" ]。
- answer: "A" 或 "B" 或 "C"。
- variation: 乾淨的日文全文文本。
- advice: 【中文翻譯】與【聽力陷阱解析】。
- level: "${level}"

[素材庫]：${text}

輸出範例 (絕對禁止 Markdown)：
[
  {
    "pacing": "兩人討論的結果是什麼？",
    "audioText": "男：ええと、あのスマートフォンはどこかな。女：あ、さっき警察に届けましたよ。",
    "options": ["手機在警察局", "手機在包包裡", "手機弄丟了"],
    "answer": "A",
    "variation": "男：ええと、あのスマートフォンはどこかな。女：あ、さっき警察に届けましたよ。",
    "advice": "【翻譯】男：那個，手機在哪裡呢？女：啊，剛才送到警察局了喔。【解析】注意「届けました」表示送達、報案。",
    "level": "${level}"
  }
]`
};

/** 🧬 [Private] EDU 數據加工分流器 (物理隔離版) */
const _eduProcessors = {

// 🎯 軌道 A：單字 (完全採信版 - 徹底封殺 N3 霸權)
'單字': (item, cleanVal) => {
    // 🚀 1. 數據源定位：相容您的新設計混合物件
    let source = item.data || item;
    
    // 🚀 2. 合法性預檢：第 0 位元組 (Word) 是數據生命線
    if (source["0"] === undefined && (Array.isArray(source) && source[0] === undefined)) {
        return null; 
    }

    const refined = {};
    
    // 🚀 3. 物理洗滌 8 元組數據
    for (let i = 0; i <= 7; i++) {
        refined[String(i)] = cleanVal(source[String(i)] || source[i] || "");
    }
    
    // 🚀 4. 等級主權回歸 (關鍵修正)
    // 💡 職人診斷：移除 || 'N3'，改用 || 'UNDEFINED' 或是回溯父層
    // 這樣如果匯入失敗，你會在 UI 看到 UNDEFINED，而不是被騙進 N3
    const rawLevel = item.level || source.level || 'UNDEFINED';
    refined.level = String(rawLevel).trim().toUpperCase();
    
    return refined;
},

// 🎯 軌道 B：文法 (V2026.ULTRA 終極導通穩定版)
'文法': (item, cleanVal) => {
    const temp = { ...item };

    // 🚀 1. 職人級視覺對焦 (Ruby 化)
    // 💡 診斷：改用 /g 全域標記並放寬匹配範圍，支援數字與多重標註
    const autoRuby = (t) => {
        let str = String(t || "").trim();
        if (!str || str.includes('<ruby>')) return str;
        // 核心焊接：捕捉 [漢字/數字/拉丁字母] + [(或（] + [內容] + [)或）]
        return str.replace(/([一-龠々ヶ0-9a-zA-Z]+)[\(（]([^）\)]+)[\)）]/g, '<ruby>$1<rt>$2</rt></ruby>');
    };

    // 🚀 2. 聲學洗滌發動機 (Acoustic Sanitizer)
    // 💡 診斷：將「用於聽」的文字與「用於看」的文字物理分離，封殺重複朗讀
    const cleanForSpeech = (t) => {
        return String(t || "").replace(/[\(（][^）\)]+[\)）]/g, '').replace(/<[^>]*>/g, '').trim();
    };

    // 🚀 3. 標題與語義洗滌 (Purification)
    const rawPoint = cleanVal(temp.point || "");
    // 移除標題末尾的重複讀音括號
    temp.point = rawPoint.replace(/[\(（].*?[\)）]/g, '').trim();
    
    if (temp.meaning) temp.meaning = autoRuby(temp.meaning);

    // 🚀 4. 例句對位焊接 (Alignment Matrix)
    const rawExample = cleanVal(temp.example || temp.例句 || "");
    
    // 💡 職人診斷：使用「最後一個括號」作為翻譯分界線
    const lastBracketIdx = Math.max(rawExample.lastIndexOf('('), rawExample.lastIndexOf('（'));
    
    if (lastBracketIdx !== -1) {
        const jpPart = rawExample.substring(0, lastBracketIdx).trim();
        const cnPart = rawExample.substring(lastBracketIdx + 1).replace(/[\)）]/g, '').trim();
        
        temp.jp = autoRuby(jpPart);        // 視覺：帶 Ruby
        temp.jp_pure = cleanForSpeech(jpPart); // 聲學：純日文
        temp.cn = cnPart;                  // 翻譯：中文
    } else {
        temp.jp = autoRuby(rawExample);
        temp.jp_pure = cleanForSpeech(rawExample);
        temp.cn = cleanVal(temp.meaning || "");
    }

    // 🚀 5. 數據歸一化
    temp.level = cleanVal(temp.level || 'N3').toUpperCase();
    
    // 物理清理
    delete temp.example;
    delete temp.例句;

    return temp;
},

    // 🎯 軌道 C：測驗 (多態對稱)
    '測驗': (item, cleanVal) => ({
        question: cleanVal(item.question || item.題目 || ""),
        options: Array.isArray(item.options) ? item.options.map(cleanVal) : (Array.isArray(item.選項) ? item.選項.map(cleanVal) : ['A', 'B', 'C', 'D']),
        answer: cleanVal(item.answer || item.正確答案 || ""),
        analysis: cleanVal(item.analysis || item.詳解 || ""),
        level: cleanVal(item.level) || 'N3'
    }),

// 🎯 軌道 D：聽力 (V2026.ULTRA 物理歸一化修正)
'聽力': (item, cleanVal) => {
    const finalAudio = cleanVal(item.audioText || item.audiotext || item.音軌文本 || "");
    const finalOptions = Array.isArray(item.options) ? item.options.map(cleanVal) : (Array.isArray(item.選項) ? item.選項.map(cleanVal) : []);
    
    // 🛡️ 熔斷檢查：封殺損毀燃料
    if (!cleanVal(item.pacing || item.題目) && !finalAudio && finalOptions.length === 0) return null;

    // 🚀 核心焊接：強制將解析內容映射到 cn 欄位
    const finalAdvice = cleanVal(item.advice || item.詳解 || item.cn || "");

    return {
        pacing: cleanVal(item.pacing || item.題目 || item.戰略性斷句 || ""),
        audioText: finalAudio,
        options: finalOptions,
        answer: cleanVal(item.answer || item.正確答案 || ""),
        variation: cleanVal(item.variation || item.原文 || ""),
        // 🚀 雙軌導通：cn 是渲染引擎的主供油管，advice 是聽力模組的私有油管
        cn: finalAdvice, 
        advice: finalAdvice,
        level: cleanVal(item.level) || 'N3'
    };
  },

// 🎯 軌道 E：獨立會話 (V2026.ULTRA 劇場生產線專用)
    '會話': (item, cleanVal) => {
        /**
         * 物理作用：洗滌由 AI 劇場模式產出的對話 JSON
         * 輸入格式預期：["角色名：日文內容", "中文翻譯"]
         */
        
        // 🚀 1. 數據格式歸一化
        let rawJP = "";
        let rawCN = "";

        if (Array.isArray(item)) {
            rawJP = item[0] || "";
            rawCN = item[1] || "";
        } else if (typeof item === 'object') {
            rawJP = item.jp || item.q || item.原文 || "";
            rawCN = item.cn || item.a || item.翻譯 || "";
        }

        // 🚀 2. 物理洗滌：封殺 Markdown 標籤與隱形成本
        const cleanJP = cleanVal(rawJP).replace(/[*_#]/g, '');
        const cleanCN = cleanVal(rawCN).replace(/[*_#]/g, '');

        if (!cleanJP) return null; // 熔斷機制：若無原文內容則不予固化

        // 🚀 3. 封裝為標準 2 元組 segments 格式
        // 💡 職人診斷：劇場模式不產 Ruby，因此 rt 軌道保持為空，由 View 層直接顯影
        return [cleanJP, cleanCN];
    }

};

/** 📖 [Library] 品詞語義數據庫 (台灣職人 / 日本漢化對焦版) */
const posLibrary = {


'サ變動詞': { 
    title: 'サ行變格活用 (サ変)', 
    tag: '動作指令',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        這是日文中最具「跨界感」的動詞。它的公式是：<b class="text-slate-800">「動作名詞 + する」</b>。它能將抽象的旅遊概念，瞬間轉化為具體的物理行動。
        <br><br>

        <div class="space-y-4">
            <div class="bg-slate-100/50 p-4 rounded-2xl border border-slate-200">
                <b class="text-slate-700 text-[13px] uppercase tracking-wider">📦 狀態 1：作為名詞 (靜態存檔)</b>
                <p class="mt-1">它本身就是一個具備動作意義的名詞，可以被放在受格位置。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>予<rt>よ</rt>約<rt>やく</rt></ruby>を<ruby>確認<rt>かくにん</rt></ruby>します。」
                </span>
                <span class="text-slate-400 text-[13px]">(確認預約。這裡的預約是名詞。)</span>
            </div>

            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">⚡ 狀態 2：動作轉化 (動態導通)</b>
                <p class="mt-1">直接焊上「<span class="text-rose-500 font-black">する</span>」，讓概念變成動作指令。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「この<ruby>服<rt>ふく</rt></ruby>を<ruby>試着<rt>しちゃく</rt></ruby><span class="text-rose-500 font-black">します</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(我要試穿這件衣服。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">🛡️ 狀態 3：能力賦予 (可能形)</b>
                <p class="mt-1">當你想表達「能做到某事」時，する要替換為「<span class="text-rose-500 font-black">できる</span>」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「カードで<ruby>支払<rt>しはら</rt></ruby>いが<span class="text-rose-500 font-black">できます</span>か？」
                </span>
                <span class="text-slate-400 text-[13px]">(可以用刷卡支付嗎？)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>對旅遊者來說，サ變動詞是「投資報酬率最高」的類別。只要記住一個動作名詞（如：注文、予約、交換），再補上「します」，你就能通向所有對話。
        </p>
    </div>` 
},


'五段動詞': { 
    title: '第一類動詞 (Group 1 / 五段)', 
    tag: '語感主力',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        這是日文動詞中數量最多、變化也最豐富的家族。它的特徵是字尾會在「あいうえお」五個段落中位移。在旅遊實境中，掌握它的「音便」規律是讓對話流暢的關鍵。
        <br><br>

        <div class="space-y-4">
            <div class="bg-slate-100/50 p-4 rounded-2xl border border-slate-200">
                <b class="text-slate-700 text-[13px] uppercase tracking-wider">🚉 狀態 1：禮貌接續 (い段位移)</b>
                <p class="mt-1">將字尾移至「い段」後接ます。這是飯店與車站對話的基礎標配。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>成<rt>なり</rt>田<rt>た</rt>空<rt>くう</rt>港<rt>こう</rt></ruby>へ<ruby>行<rt>い</rt></ruby><span class="text-rose-500 font-black">き</span>ます。」
                </span>
                <span class="text-slate-400 text-[13px]">(我要去成田機場。原形：行く)</span>
            </div>

            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">⚙️ 狀態 2：指令與接續 (音便焊接)</b>
                <p class="mt-1">當接續「てください」時，字尾會產生「促音/鼻音」等物理變化。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「ここで<ruby>少<rt>すこ</rt></ruby>し<ruby>待<rt>ま</rt></ruby><span class="text-rose-500 font-black">って</span>ください。」
                </span>
                <span class="text-slate-400 text-[13px]">(請在這裡稍等。原形：待つ -> 促音便)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">🎯 狀態 3：意圖與願望 (表達對焦)</b>
                <p class="mt-1">同樣使用「い段」變形後接たい，精確傳達你的旅遊需求。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「お<ruby>刺<rt>さ</rt>身<rt>み</rt></ruby>を<ruby>食<rt>た</rt>べ</ruby>に<ruby>入<rt>はい</rt></ruby><span class="text-rose-500 font-black">り</span>たいです。」
                </span>
                <span class="text-slate-400 text-[13px]">(我想進去吃生魚片。原形：入る)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>五段動詞的「音便」雖然初學較累，但它能讓日語聽起來具備節奏感。只要記住「待って (Mat-te)」、「行って (It-te)」這類高頻詞，你就能掌握五段動詞的物理核心。
        </p>
    </div>` 
},


'下一段動詞': { 
    title: '第二類動詞 (Group 2 / 下一段)', 
    tag: '穩定輸出',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        這一類動詞字尾最後一個音節落在「え(e)」段。它是日文中最具「模組化」優勢的詞類，最大的物理特徵是：<b class="text-slate-800">「捨棄 る 即可焊接一切」</b>。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">⚡ 狀態 1：零障礙焊接 (去る接續)</b>
                <p class="mt-1">不需像五段動詞那樣位移，直接切除「る」即可接上禮貌或願望零件。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>肉<rt>にく</rt></ruby>を<ruby>食<rt>た</rt>べ</ruby><span class="text-rose-500 font-black">たい</span>です。」
                </span>
                <span class="text-slate-400 text-[13px]">(我想吃肉。原形：食べる)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">⚙️ 狀態 2：許可與指令 (穩定接續)</b>
                <p class="mt-1">接「て」時完全無音便，直接替換字尾。這是請求協助時最穩定的軌道。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「ドアを<ruby>閉<rt>し</rt>め</ruby><span class="text-rose-500 font-black">て</span>もいいですか？」
                </span>
                <span class="text-slate-400 text-[13px]">(可以關門嗎？原形：閉める)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">🛡️ 狀態 3：能力顯影 (可能態)</b>
                <p class="mt-1">表達「能做到」時，只需將「る」替換為「<span class="text-rose-500 font-black">られる</span>」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「この<ruby>魚<rt>さかな</rt></ruby>は<ruby>生<rt>なま</rt></ruby>で<ruby>食<rt>た</rt>べ</ruby><span class="text-rose-500 font-black">られます</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(這條魚可以生吃。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>下一段動詞是旅遊者的「安全區」。因為它沒有複雜的音便規則，只要看到字尾是「～える」的動詞，大膽去掉「る」來拼裝句子，導通率高達 99%。
        </p>
    </div>` 
},


'上一段動詞': { 
    title: '第二類動詞 (Group 2 / 上一段)', 
    tag: '穩定輸出',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        這一類動詞字尾前一個音節落在「い(i)」段。它與下一段動詞一樣具備高度的穩定性，物理特徵同樣是：<b class="text-slate-800">「捨棄 る，直接焊接」</b>。在旅遊中，它主宰了「觀察」與「移動」的核心行為。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">👁️ 狀態 1：感官對焦 (直覺焊接)</b>
                <p class="mt-1">最常用的「看（見る）」，只需去掉「る」即可接上所有願望與請求零件。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>地<rt>ち</rt>圖<rt>ず</rt></ruby>を<ruby>見<rt>み</rt></ruby><span class="text-rose-500 font-black">たい</span>のですが。」
                </span>
                <span class="text-slate-400 text-[13px]">(我想看一下地圖。原形：見る)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">🚉 狀態 2：交通轉運 (動作精確)</b>
                <p class="mt-1">「下車（降りる）」是上一段動詞的代表。在接續「ます」或「て」時，結構非常堅固。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「バスを<ruby>降<rt>お</rt>り</ruby><span class="text-rose-500 font-black">て</span>、<ruby>地<rt>ち</rt>下<rt>か</rt>鉄<rt>てつ</rt></ruby>に<ruby>乗<rt>の</rt></ruby>り<ruby>換<rt>か</rt></ruby>えます。」
                </span>
                <span class="text-slate-400 text-[13px]">(下公車後，換乘地下鐵。原形：降りる)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">⏳ 狀態 3：生活起居 (狀態連動)</b>
                <p class="mt-1">在描述「在那裡（いる）」或是「起床」時，同樣遵循去「る」的極簡邏輯。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>明<rt>あ</rt>日<rt>した</rt></ruby>は<ruby>早<rt>はや</rt></ruby>く<ruby>起<rt>お</rt>き</ruby><span class="text-rose-500 font-black">なければなりません</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(明天必須早起。原形：起きる)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>上一段動詞常見的「長相陷阱」是看起來像五段動詞（如：借りる、起きる）。記住一個原則：只要「る」前面的音是「i」或「e」，大部分都屬於穩定輸出的第二類動詞，安心「去 る」就對了。
        </p>
    </div>` 
},


'力變動詞': { 
    title: '力行變格活用 (カ変)', 
    tag: '特例對焦',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        這是日文動詞中唯一的「孤單特例」，成員只有「<ruby>来<rt>く</rt></ruby>る」。它的核心痛點在於：<b class="text-slate-800">漢字不變，讀音隨功能劇烈跳動</b>。在旅遊約定時間時，請務必對焦讀音。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">🚉 狀態 1：禮貌與抵達 (Ki - 讀音對焦)</b>
                <p class="mt-1">接「ます」時讀音變為 <span class="text-rose-500 font-black">き</span>。這是確認巴士或導遊何時到達的最常用型態。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「バスはすぐに<span class="text-rose-500 font-black"><ruby>来<rt>き</rt></ruby>ます</span>か？」
                </span>
                <span class="text-slate-400 text-[13px]">(巴士會馬上來嗎？)</span>
            </div>

            <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                <b class="text-rose-700 text-[13px] uppercase tracking-wider">🚫 狀態 2：否定與抱怨 (Ko - 讀音對焦)</b>
                <p class="mt-1">接「ない」時讀音轉為 <span class="text-rose-500 font-black">こ</span>。常用於等待交通工具或朋友遲到時。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「タクシーが全然<span class="text-rose-500 font-black"><ruby>来<rt>こ</rt></ruby>ない</span>ですね。」
                </span>
                <span class="text-slate-400 text-[13px]">(計程車完全不來呢。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">🤝 狀態 3：邀請與指令 (Ki - 讀音對焦)</b>
                <p class="mt-1">接「てください」時維持 <span class="text-rose-500 font-black">き</span>。常用於請對方過來某處。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「すみません、ちょっとこちらへ<span class="text-rose-500 font-black"><ruby>来<rt>き</rt></ruby>て</span>ください。」
                </span>
                <span class="text-slate-400 text-[13px]">(不好意思，請來這邊一下。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>力變動詞雖然只有一個字，但它是「移動」的大動脈。記住：看到漢字「来」時，先檢查它後面的焊接零件，零件決定了讀音是 Ku、Ki 還是 Ko。
        </p>
    </div>` 
},

'い形容詞': { 
    title: 'イ形容詞 (標準形容詞)', 
    tag: '直覺描述',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        這類詞的字尾固定是「い」。它是最直覺的描述工具，特色是<b class="text-slate-800">「零件內建」</b>，變化時會直接動到字尾的「い」。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">🔗 型態 1：形容名詞 (原形接續)</b>
                <p class="mt-1">最簡單的模式，直接放在名詞前面，不需額外焊接零件。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>冷<rt>つめ</rt></ruby>た<span class="text-rose-500 font-black">い</span><ruby>飲<rt>の</rt></ruby>み<ruby>物<rt>もの</rt></ruby>をください。」
                </span>
                <span class="text-slate-400 text-[13px]">(請給我冰的飲料。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">⚙️ 型態 2：形容動作 (副詞用法)</b>
                <p class="mt-1">修飾動詞時，字尾的「い」必須改裝成「<span class="text-rose-500 font-black">く</span>」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>早<rt>はや</rt></ruby><span class="text-rose-500 font-black">く</span><ruby>起<rt>お</rt></ruby>きることができました。」
                </span>
                <span class="text-slate-400 text-[13px]">(能早點起床了。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">⏳ 型態 3：狀態回溯 (過去式)</b>
                <p class="mt-1">描述過去的感受時，字尾要換成「<span class="text-rose-500 font-black">かった</span>」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「この<ruby>料<rt>りょう</rt>理<rt>り</rt></ruby>はとても<ruby>美<rt>お</rt>味<rt>い</rt></ruby>し<span class="text-rose-500 font-black">かった</span>です。」
                </span>
                <span class="text-slate-400 text-[13px]">(這道料理剛才非常好吃。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>相較於「な形容詞」需要外接零件，「い形容詞」更像是變形金剛，是透過改裝自己的字尾來改變功能。
        </p>
    </div>` 
},


'な形容詞': { 
    title: 'ナ形容詞 (形容動詞)', 
    tag: '進階描述',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        這類詞在學術上稱為「形容動詞」。它的特徵是：<b class="text-slate-800">「本體像名詞，焊接靠零件」</b>。根據它要連接的目標，尾部的零件會產生物理變化。
        <br><br>
        
        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">🔗 型態 1：形容名詞 (連體形)</b>
                <p class="mt-1">當它要修飾後方的名詞時，必須焊上零件「<span class="text-rose-500 font-black">な</span>」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>有<rt>ゆう</rt>名<rt>めい</rt></ruby><span class="text-rose-500 font-black">な</span><ruby>店<rt>みせ</rt></ruby>を<ruby>予<rt>よ</rt>約<rt>やく</rt></ruby>しました。」
                </span>
                <span class="text-slate-400 text-[13px]">(預約了有名的店。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">⚙️ 型態 2：形容動作 (副詞用法)</b>
                <p class="mt-1">當它要修飾後方的動詞時，零件必須切換為「<span class="text-rose-500 font-black">に</span>」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>事<rt>じ</rt>実<rt>じつ</rt></ruby>が<ruby>明<rt>あき</rt></ruby>らか<span class="text-rose-500 font-black">に</span>なりました。」
                </span>
                <span class="text-slate-400 text-[13px]">(事實變得明顯/清楚了。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">💬 型態 3：單純描述 (終止形)</b>
                <p class="mt-1">放在句尾做結案時，直接加上「です」或「だ」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「この<ruby>街<rt>まち</rt></ruby>はとても<ruby>靜<rt>しず</rt></ruby>かです。」
                </span>
                <span class="text-slate-400 text-[13px]">(這座城市非常安靜。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>之所以稱為「な形容詞」，是為了強調它修飾名詞時那顆關鍵的「な」。但在旅遊實境中，看到「に」接動詞的情況也非常普遍。
        </p>
    </div>` 
},

'名詞': { 
    title: '名詞 (Substantive)', 
    tag: '座標標記',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        名詞是日語路網中的「靜態座標」，負責定義人、事、物。雖然它本身不會變形，但在與其他座標焊接時，必須遵守特定的「介面協定」。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">🔗 狀態 1：骨架連接 (名詞焊接)</b>
                <p class="mt-1">當兩個名詞要接在一起時，中間必須焊上零件「<span class="text-rose-500 font-black">の</span>」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>日本<rt>にほん</rt></ruby><span class="text-rose-500 font-black">の</span><ruby>地下鉄<rt>ちかてつ</rt></ruby>は<ruby>便利<rt>べんり</rt></ruby>です。」
                </span>
                <span class="text-slate-400 text-[13px]">(日本的地下鐵很方便。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">⚖️ 狀態 2：身份判定 (斷定用法)</b>
                <p class="mt-1">名詞結束句子時，透過「です」判定身份，否定則是「ではありません」。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「これは<ruby>私<rt>わたし</rt></ruby>の<ruby>荷物<rt>にもつ</rt></ruby><span class="text-rose-500 font-black">ではありません</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(這不是我的行李。強調身份否認。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">⚙️ 狀態 3：功能激活 (動作化)</b>
                <p class="mt-1">部分具備動作意義的名詞，只要焊上「する」即可轉化為動詞軌道。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>今日<rt>きょう</rt></ruby>は<ruby>買<rt>か</rt>い</ruby><ruby>物<rt>もの</rt></ruby><span class="text-rose-500 font-black">します</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(今天要做購物這件事/要去買東西。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>名詞雖然簡單，但它是所有助詞的「受體」。只要掌握好「名詞 + の + 名詞」的焊接邏輯，你的語句精確度就能提升 50% 以上。
        </p>
    </div>` 
},

'副詞': { 
    title: '副詞 (Adverb)', 
    tag: '語氣調味',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        副詞是日文路網中的「語氣調速器」，負責修飾動詞與形容詞。它雖然不產生變形，但具備強大的<b class="text-slate-800">「語法導引力」</b>，能精確控制語句的程度與情緒。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">📊 狀態 1：程度校準 (量化對焦)</b>
                <p class="mt-1">精確調整動作或狀態的強弱。如：非常、稍微、相當。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「この<ruby>服<rt>ふく</rt></ruby>は<span class="text-rose-500 font-black">ちょっと</span><ruby>大<rt>おお</rt></ruby>きいですね。」
                </span>
                <span class="text-slate-400 text-[13px]">(這件衣服稍微大了一點。語氣含蓄。)</span>
            </div>

            <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                <b class="text-rose-700 text-[13px] uppercase tracking-wider">🔒 狀態 2：邏輯鎖定 (否定呼應)</b>
                <p class="mt-1">部分副詞具備「否定門鎖」，後方必須焊接否定零件。如：全然、決して。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「お<ruby>金<rt>かね</rt></ruby>が<span class="text-rose-500 font-black">全然</span><ruby>あり<rt></rt></ruby><span class="text-rose-500 font-black">ません</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(完全沒有錢。全然與末尾否定必須同步。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">⏳ 狀態 3：時間與頻率 (節奏控制)</b>
                <p class="mt-1">描述動作發生的次數或頻率。如：總是、有時、終於。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">やっと</span><ruby>目的<rt>もくてき</rt>地<rt>ち</rt></ruby>に<ruby>着<rt>つ</rt></ruby>きました。」
                </span>
                <span class="text-slate-400 text-[13px]">(終於到達目的地了。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>副詞是「職人感」的來源。與其說「大きい」，不如加上「ちょっと」，這種程度的微調能讓你的日文具備禮貌的緩衝感，減少直接衝擊。
        </p>
    </div>` 
},


'連體詞': { 
    title: '連體詞 (Prenoun Adjective)', 
    tag: '物理指向',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        連體詞是日語路網中的「專用焊接件」。它的唯一功能是<b class="text-slate-800">「修飾名詞」</b>且完全不產生變形。它與代名詞不同，不能單獨存在，必須後接名詞才能導通語義。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">📍 狀態 1：空間座標 (物理指向)</b>
                <p class="mt-1">定義物體與說話者的距離。如：この (近)、その (中)、あの (遠)。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">この</span><ruby>切<rt>きっ</rt>符<rt>ぷ</rt></ruby>は<ruby>使<rt>つか</rt></ruby>えますか？」
                </span>
                <span class="text-slate-400 text-[13px]">(這張票可以使用嗎？必須緊接「切符」。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">🔍 狀態 2：抽象特質 (類別對焦)</b>
                <p class="mt-1">描述名詞的性質或種類。如：大きな (大的)、小さな (小的)、ある (某個)。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">大きな</span><ruby>交<rt>こう</rt>差<rt>さ</rt>点<rt>てん</rt></ruby>を<ruby>左<rt>ひだり</rt></ruby>に<ruby>曲<rt>ま</rt></ruby>がります。」
                </span>
                <span class="text-slate-400 text-[13px]">(在大的交叉路口往左轉。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">❓ 狀態 3：路網搜尋 (疑問指向)</b>
                <p class="mt-1">用於從複數選項中搜尋目標。如：どの。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">どの</span><ruby>電<rt>でん</rt>車<rt>しゃ</rt></ruby>が<ruby>新<rt>しん</rt>宿<rt>じゅく</rt></ruby>へ<ruby>行<rt>い</rt></ruby>きますか？」
                </span>
                <span class="text-slate-400 text-[13px]">(哪一台電車會去新宿？)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>記住「連體詞 = 連結實體」。當你想說「這個」的時候，如果後面有跟著名詞（如：這張票），就用「この」；如果後面沒名詞，就用「これ」。這是封殺語法短路的黃金協定。
        </p>
    </div>` 
},


'助詞': { 
    title: '助詞 (Particle)', 
    tag: '邏輯連結',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        助詞是日語路網的「焊接劑」，負責定義詞彙間的物理關係。雖然它們體積微小且不產生變化，但卻決定了誰是動作執行者、誰是受體。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">🎯 狀態 1：主體對焦 (角色定義)</b>
                <p class="mt-1">定義誰是話題中心或動作主體。如：は (話題)、が (主體)。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>私<rt>わたし</rt></ruby><span class="text-rose-500 font-black">は</span><ruby>壽司<rt>すし</rt></ruby><span class="text-rose-500 font-black">が</span><ruby>好<rt>す</rt></ruby>きです。」
                </span>
                <span class="text-slate-400 text-[13px]">(我喜歡壽司。は鎖定話題，が鎖定喜歡的對象。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">🚀 狀態 2：路網指向 (物理運動)</b>
                <p class="mt-1">定義移動的方向或抵達的目標。如：へ (方向)、に (目的地/點)。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>京都<rt>きょうと</rt></ruby><span class="text-rose-500 font-black">へ</span><ruby>行<rt>い</rt></ruby>きます。」
                </span>
                <span class="text-slate-400 text-[13px]">(往京都出發。へ強調移動的方向趨勢。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">⚙️ 狀態 3：方法與存在 (座標對位)</b>
                <p class="mt-1">定義使用的工具或行為發生的場所。如：で (方式/地點)、に (存在點)。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>新幹線<rt>しんかんせん</rt></ruby><span class="text-rose-500 font-black">で</span><ruby>大阪<rt>おおさか</rt></ruby><span class="text-rose-500 font-black">に</span><ruby>行<rt>い</rt></ruby>きます。」
                </span>
                <span class="text-slate-400 text-[13px]">(搭乘新幹線前往大阪。で是工具，に是落腳點。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>助詞就像是「掛鉤」，決定了單字在句子中扮演的角色。在旅遊對話中，即使動詞漏掉，只要助詞精確（如：目的地 + に），對方通常也能理解你的意圖。
        </p>
    </div>` 
},


'外來語': { 
    title: '外來語・強調用法 (Katakana)', 
    tag: '國際通用 / 語義加壓',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        除了源自英語的單字，片假名常被用作日文的<b class="text-slate-800">「視覺螢光筆」</b>。透過改變外殼，能讓原本平淡的詞彙產生強大的對焦感與現代語氣。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">🌍 狀態 1：標準外來語 (國際導通)</b>
                <p class="mt-1">直接從英語音譯，如：コーヒー、ホテル。是旅途中的溝通捷徑。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">ホットコーヒー</span>を一つお願いします。」
                </span>
                <span class="text-slate-400 text-[13px]">(請給我一杯熱咖啡。)</span>
            </div>

            <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                <b class="text-rose-700 text-[13px] uppercase tracking-wider">🔥 狀態 2：語義加壓 (強調用法)</b>
                <p class="mt-1">將原本的日文詞換成片假名，用來強調程度或增加視覺衝擊力。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「この<ruby>服<rt>ふく</rt></ruby>、めっちゃ<span class="text-rose-500 font-black">カワイイ</span>！」
                </span>
                <span class="text-slate-400 text-[13px]">(這件衣服，超級可愛！用片假名顯得語氣更雀躍。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">🎨 狀態 3：實境渲染 (感官描述)</b>
                <p class="mt-1">描述聲音或心情狀態。在旅遊漫畫或廣告文案中極度常見。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>明日<rt>あした</rt></ruby>の<ruby>旅<rt>たび</rt></ruby>が<span class="text-rose-500 font-black">ワクワク</span>しますね。」
                </span>
                <span class="text-slate-400 text-[13px]">(明天的旅行讓人興奮期待呢。Waku-Waku。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>看到片假名時，先判斷它是不是英文變體。如果不是，那它就是在對你「眨眼睛」——代表說話者正在強調某種心情，或是正在形容一種動態的感官氛圍。
        </p>
    </div>` 
},


'接頭詞': { 
    title: '接頭詞 (Prefixes)', 
    tag: '禮節修飾',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        接頭詞是放在單字前方的「美化零件」，最核心的是「お」與「ご」。它不改變單字的邏輯座標，但能<b class="text-slate-800">「提升語氣的導電率」</b>，展現對對方的尊重與職人級的禮貌。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">🌸 狀態 1：和語對焦 (お-Sound)</b>
                <p class="mt-1">多用於日本原生詞彙（和語）。這是在日本傳統旅館或餐廳中，最能展現優雅氣氛的零件。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">お</span><ruby>手<rt>て</rt>洗<rt>あら</rt></ruby>いはどこですか？」
                </span>
                <span class="text-slate-400 text-[13px]">(請問洗手間在哪裡？加了「お」顯得更有教養。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">📜 狀態 2：漢語對焦 (ご-Sound)</b>
                <p class="mt-1">多用於音讀詞彙（漢語）。常用於商務溝通、正式手續或表達莊重的謝意。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">ご</span><ruby>住所<rt>じゅうしょ</rt></ruby>をこちらに<ruby>書<rt>か</rt></ruby>いてください。」
                </span>
                <span class="text-slate-400 text-[13px]">(請在這裡寫下您的住址。正式手續必備。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">✨ 狀態 3：習慣與美化 (固定組件)</b>
                <p class="mt-1">部分詞彙已與接頭詞「物理融合」，成為日常生活中的固定美化標籤。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">お</span><ruby>酒<rt>さけ</rt></ruby>、<span class="text-rose-500 font-black">お</span><ruby>茶<rt>ちゃ</rt></ruby>、<span class="text-rose-500 font-black">お</span><ruby>金<rt>かね</rt></ruby>」
                </span>
                <span class="text-slate-400 text-[13px]">(酒、茶、金錢。這些字眼習慣性地帶著美化語。 )</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>雖然「お」跟「ご」的區分有規則，但旅遊時若不確定，統統用「お」的錯誤率反而較低。它是你與日本人建立友善路網的「第一層潤滑油」。
        </p>
    </div>` 
},


'接尾詞': { 
    title: '接尾詞 (Suffixes)', 
    tag: '單位補充',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        接尾詞是附著在單字後方的「功能零件」，負責為數據定義單位。在旅遊實境中，它是確保人數、天數與物品數量導通正確的<b class="text-slate-800">「精密刻度」</b>。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">👤 狀態 1：人物與身份 (對位標記)</b>
                <p class="mt-1">定義人數或對他人的尊重。如：～様 (禮貌稱呼)、～名 (正式人數)。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>二<rt>に</rt>名<rt>めい</rt></ruby><span class="text-rose-500 font-black">様</span>ですね。少々お待ちください。」
                </span>
                <span class="text-slate-400 text-[13px]">(是兩位貴賓對吧。請稍候。店家對客人的標準對位。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">🏨 狀態 2：行程與頻率 (時間計量)</b>
                <p class="mt-1">定義停留時間或動作頻率。如：～泊 (住宿天數)、～回 (次數)。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>二<rt>に</rt>泊<rt>はく</rt></ruby><span class="text-rose-500 font-black">三日</span><span class="text-rose-500 font-black">さんか</span>の予定です。」
                </span>
                <span class="text-slate-400 text-[13px]">(預計是三天兩夜的行程。泊與日是住宿業的核心零件。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">📦 狀態 3：物品與形狀 (物理規格)</b>
                <p class="mt-1">根據物體形狀決定量詞。如：～枚 (扁平物)、～本 (長條物)。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>入場券<rt>にゅうじょうけん</rt></ruby>を<ruby>三<rt>さん</rt>枚<rt>まい</rt></ruby>ください。」
                </span>
                <span class="text-slate-400 text-[13px]">(請給我三張入場券。枚用於票券或衣服。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>日文的計量單位非常細碎，若在旅途中突然忘記「枚」或「本」，可以用萬用零件「～つ」來應急，但在正式預約時，精確使用接尾詞能展現你對細節的掌握。
        </p>
    </div>` 
},

'代名詞': { 
    title: '代名詞 (Pronouns)', 
    tag: '身分替代',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        代名詞是日語對話中的「高速快捷鍵」。它能物理替代冗長的名詞，實現資訊的高效傳輸。在旅遊中，它是你在記不起店名或物名時，最核心的<b class="text-slate-800">「應急備援零件」</b>。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">📦 狀態 1：物體替代 (獨立指向)</b>
                <p class="mt-1">直接替代具體物品。與連體詞不同，它能獨立站立，不需要後接名詞。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">これ</span>を一つください。」
                </span>
                <span class="text-slate-400 text-[13px]">(請給我一個這個。點餐時的萬能金句。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">📍 狀態 2：空間定位 (場所導通)</b>
                <p class="mt-1">替代地點或方向。「こちら/あちら」比「ここ/あそこ」更具職人禮節。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「レジは<span class="text-rose-500 font-black">あちら</span>にあります。」
                </span>
                <span class="text-slate-400 text-[13px]">(收銀台在那邊。あちら具備更好的禮貌指向感。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">👤 狀態 3：人稱對焦 (身分替代)</b>
                <p class="mt-1">替代說話者或對方。在日文中，直接稱呼對方的「姓氏+さん」通常比用代名詞更道地。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>私<rt>わたし</rt></ruby>は<ruby>台<rt>たい</rt>灣<rt>わん</rt></ruby>から<ruby>来<rt>き</rt></ruby>ました。」
                </span>
                <span class="text-slate-400 text-[13px]">(我從台灣來。自我介紹的標準啟動。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>對旅人來說，「これ (這個)」與「ここ (這裡)」是存活率最高的零件。但請注意，面對店員時使用「あなた」有時顯得過於生硬，直接使用禮貌語句或省略主語，才是日式路網的高級導通方式。
        </p>
    </div>` 
},


'接續詞': { 
    title: '接續詞 (Conjunctions)', 
    tag: '邏輯轉折',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        接續詞是日語對話的「邏輯導向閥」，負責連接句子並定義前後文的關係。它能讓聽者預判你接下來的語氣方向，是實現<b class="text-slate-800">「流暢敘事」</b>的核心零件。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">➕ 狀態 1：資訊順接 (邏輯遞進)</b>
                <p class="mt-1">將同性質的資訊疊加。常用於描述多個景點特色或購物清單。如：そして、それに。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「この<ruby>部屋<rt>へや</rt></ruby>は<ruby>広<rt>ひろ</rt></ruby>いです。<span class="text-rose-500 font-black">そして</span>、とても<ruby>綺麗<rt>きれい</rt></ruby>です。」
                </span>
                <span class="text-slate-400 text-[13px]">(這間房間很寬敞，而且非常乾淨。遞進正向評價。)</span>
            </div>

            <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                <b class="text-rose-700 text-[13px] uppercase tracking-wider">🔄 狀態 2：語氣轉折 (極性反轉)</b>
                <p class="mt-1">引出與前文相反的內容。這是提出要求或拒絕時的重要緩衝。如：しかし、でも。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>行<rt>い</rt></ruby>きたいです。<span class="text-rose-500 font-black">でも</span>、<ruby>時間<rt>じかん</rt></ruby>がありません。」
                </span>
                <span class="text-slate-400 text-[13px]">(我想去，但是沒有時間。用「でも」預告轉折。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">🎯 狀態 3：因果結論 (邏輯點火)</b>
                <p class="mt-1">根據前方原因導出結果。用於說明行程變更或決定。如：ですから、それで。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>道<rt>みち</rt></ruby>に<ruby>迷<rt>まよ</rt></ruby>いました。<span class="text-rose-500 font-black">ですから</span>、<ruby>遲<rt>おく</rt></ruby>れました。」
                </span>
                <span class="text-slate-400 text-[13px]">(因為迷路了，所以遲到了。明確定義因果關係。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>接續詞就像是給聽者的「預告片」。在實戰中，如果你先說出「でも」，對方的腦袋就會自動準備好接收轉折訊息。這能大幅降低溝通中的認知負荷，讓對方覺得你非常有邏輯。
        </p>
    </div>` 
},


'感動詞': { 
    title: '感動詞 (Interjections)', 
    tag: '自然反應',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        感動詞是日語路網中的「感官感測器」。它不需任何語法變化，獨立發聲即可傳達驚訝、感嘆或呼喚。它是提升對話「在地感」與「溫度」最直覺的<b class="text-slate-800">「情感零件」</b>。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">📢 狀態 1：發聲提醒 (建立連線)</b>
                <p class="mt-1">在對話開始前吸引注意，或對突發狀況做出反應。如：あの、あ、すみません。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">あの</span>、ちょっとお<ruby>尋<rt>たず</rt></ruby>ねしますが...」
                </span>
                <span class="text-slate-400 text-[13px]">(那個...不好意思想請問一下。用「あの」作為柔和的開場。)</span>
            </div>

            <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                <b class="text-rose-700 text-[13px] uppercase tracking-wider">✨ 狀態 2：情緒共鳴 (感官增強)</b>
                <p class="mt-1">對美景、美食或驚喜做出直覺反應。如：わあ、ほう、へえ。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">わあ</span>、この<ruby>景色<rt>けしき</rt></ruby>はすごいですね！」
                </span>
                <span class="text-slate-400 text-[13px]">(哇！這景色太厲害了！展現最真實的旅遊感動。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">🤝 狀態 3：相槌回應 (邏輯反饋)</b>
                <p class="mt-1">在聽對方講話時給予反饋，代表你有在聽。如：はい、なるほど、そうですか。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<span class="text-rose-500 font-black">なるほど</span>、よく分かりました。」
                </span>
                <span class="text-slate-400 text-[13px]">(原來如此，我完全明白了。展現理解的專業反饋。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>感動詞是打破「課本感」的特效藥。在向路人問路前，先吐出一個微小的「あの (A-no...)」，能瞬間讓對方感受到你的客氣與禮貌，極大提升後續溝通的導通成功率。
        </p>
    </div>` 
},


'助動詞': { 
    title: '助動詞 (Auxiliary Verbs)', 
    tag: '語氣擴充',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        助動詞是附著在動詞或形容詞後方的「邏輯變流器」。它能賦予句子時態、否定或可能性。在旅途中，它是確保「資訊精確度」與「說話者意圖」能完整點火的<b class="text-slate-800">「核心控制模組」</b>。
        <br><br>

        <div class="space-y-4">
            <div class="bg-rose-50/50 p-4 rounded-2xl border border-rose-100">
                <b class="text-rose-700 text-[13px] uppercase tracking-wider">🚫 狀態 1：否定與界線 (防禦對焦)</b>
                <p class="mt-1">將動作轉向否定。在飲食限制或明確拒絕時，這是最重要的防線。如：ない、ぬ。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「わさびは<ruby>入<rt>い</rt></ruby>れ<span class="text-rose-500 font-black">ないで</span>ください。」
                </span>
                <span class="text-slate-400 text-[13px]">(請不要加哇沙比。用「ない」明確劃出需求界線。)</span>
            </div>

            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">⏳ 狀態 2：時態回溯 (存檔判定)</b>
                <p class="mt-1">標記動作已經發生。用於確認預約完成或分享旅途心得。如：た、ます（禮貌）。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>予<rt>よ</rt>約<rt>やく</rt></ruby>はもう<ruby>済<rt>す</rt></ruby>ませ<span class="text-rose-500 font-black">ました</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(預約已經辦理完畢了。ました是禮貌且完成的存檔點。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">🔮 狀態 3：推測與意圖 (情緒擴充)</b>
                <p class="mt-1">表達對未來的預測、傳聞或個人願望。如：でしょう、たい、そうだ。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>明日<rt>あした</rt></ruby>は<ruby>晴<rt>は</rt></ruby>れる<span class="text-rose-500 font-black">でしょう</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(明天應該會放晴吧。用於判斷天氣或行程規劃。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>助動詞是讓句子「變形」的最後零件。雖然它不能單獨存在，但如果漏掉它，你的對話將永遠停留在「現在進行式」。學會焊接「ない」和「ました」，你的旅遊日語才算真正導通。
        </p>
    </div>` 
},

'名・他サ': {
    title: '名詞・他動詞サ變 (Group 3)',
    tag: '動作實體',
    desc: `
    <div class="text-[15px] leading-[2.2] text-slate-600">
        這是具備「雙棲屬性」的高級模組。靜止時是名詞，一旦焊上「する」，便成為<b class="text-slate-800">「他動詞」</b>。它的核心物理特徵是：<b class="text-slate-800">必須有一個「動作受體」</b>，負責傳遞能量到特定目標。
        <br><br>

        <div class="space-y-4">
            <div class="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                <b class="text-blue-700 text-[13px] uppercase tracking-wider">⚡ 狀態 1：目標導通 (動作轉化)</b>
                <p class="mt-1">透過「を」連結受體，並用「する」啟動動作。常用於商務、手續或明確的決策。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>最新<rt>さいしん</rt></ruby>の<ruby>技術<rt>ぎじゅつ</rt></ruby><span class="text-rose-500 font-black">を</span><ruby>導入<rt>どうにゅう</rt></ruby><span class="text-rose-500 font-black">します</span>。」
                </span>
                <span class="text-slate-400 text-[13px]">(導入最新技術。技術是受體，導入是動作實體。)</span>
            </div>

            <div class="bg-emerald-50/50 p-4 rounded-2xl border border-emerald-100">
                <b class="text-emerald-700 text-[13px] uppercase tracking-wider">📦 狀態 2：封裝結構 (名詞屬性)</b>
                <p class="mt-1">維持名詞狀態，透過「の」修飾後方名詞。常用於新聞標題或合約規範。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>収益力<rt>しゅうえきりょく</rt></ruby><span class="text-rose-500 font-black">の</span><ruby>強化<rt>きょうか</rt></ruby>を<ruby>目指<rt>めざ</rt></ruby>します。」
                </span>
                <span class="text-slate-400 text-[13px]">(以強化獲利能力為目標。強化在此作為名詞封裝。)</span>
            </div>

            <div class="bg-amber-50/50 p-4 rounded-2xl border border-amber-100">
                <b class="text-amber-700 text-[13px] uppercase tracking-wider">🏗️ 狀態 3：專業複合 (數據精煉)</b>
                <p class="mt-1">結合兩個動作概念。在閱讀深度評論或新聞時，這類詞能精確描述複雜的物理關係。</p>
                <span class="text-[17px] text-slate-800 font-medium block mt-2">
                    「<ruby>家電<rt>かでん</rt></ruby><ruby>事業<rt>じぎょう</rt></ruby>を<span class="text-rose-500 font-black"><ruby>買収<rt>ばいしゅう</rt></ruby></span>しました。」
                </span>
                <span class="text-slate-400 text-[13px]">(收購了家電業務。展現高級漢語詞彙的精確度。)</span>
            </div>
        </div>

        <p class="mt-6 text-[13px] italic border-t border-slate-100 pt-4">
            <b class="text-slate-800">職人筆記：</b>「名・他サ」是提升日文「專業感」的捷徑。在旅遊中，如果你能說出「キャンセル（取消）します」或「確認（かくにん）します」，這類結構穩定的他動詞能讓對方感受到你對流程的清晰掌握。
        </p>
    </div>`
  }
};


// 🚀 核心 C：別名導通表 (V2026.ULTRA 全語義最終強化版)
const aliasMap = {
    // --- 動詞軌道 (核心行為) ---
    '動サ': 'サ變動詞', 'サ變': 'サ變動詞', 'サ変': 'サ變動詞', '動廿': 'サ變動詞', 'スル': 'サ變動詞', 'スル動詞': 'サ變動詞',
    '動五': '五段動詞', '五段': '五段動詞', 'V1': '五段動詞', 'V5': '五段動詞',
    '下一': '下一段動詞', '動下一': '下一段動詞', '下一段': '下一段動詞', 'V2E': '下一段動詞',
    '上一': '上一段動詞', '動上一': '上一段動詞', '上一段': '上一段動詞', 'V2I': '上一段動詞', '動一': '上一段動詞',
    '力變': '力變動詞', 'カ變': '力變動詞', 'カ変': '力變動詞', '力行': '力變動詞', 'カ行変格': '力變動詞',
    
    // --- 形容詞軌道 (質感描述) ---
    '形': 'い形容詞', '形一': 'い形容詞', '形1': 'い形容詞', '形容詞': 'い形容詞', 'い形': 'い形容詞', 'Adj-i': 'い形容詞',
    '形動': 'な形容詞', '形二': 'な形容詞', '形2': 'な形容詞', '形容動詞': 'な形容詞', 'な形': 'な形容詞', 'Adj-na': 'な形容詞',
    
    // --- 靜態軌道 (數據座標) ---
    '名': '名詞', 'N': '名詞', 'n': '名詞', '名詞': '名詞',
    '代': '代名詞', '代名': '代名詞', 'pron': '代名詞', '代名詞': '代名詞',
    '副': '副詞', 'adv': '副詞', '副詞': '副詞',
    '接': '接續詞', 'conj': '接續詞', '接續': '接續詞', '接續詞': '接續詞',
    '感': '感動詞', 'int': '感動詞', '感動': '感動詞', '感動詞': '感動詞',
    
    // --- 零件軌道 (語義焊接) ---
    '助': '助詞', 'p': '助詞', '助詞': '助詞',
    '助動': '助動詞', 'aux': '助動詞', '助動詞': '助動詞',
    '連體': '連體詞', '連体': '連體詞', 'attr': '連體詞', '連體詞': '連體詞',
    '頭': '接頭詞', 'prefix': '接頭詞', '接頭': '接頭詞', '接頭詞': '接頭詞',
    '尾': '接尾詞', 'suffix': '接尾詞', '接尾': '接尾詞', '接尾詞': '接尾詞',
    
    // --- 特殊軌道 (跨界導通) ---
    '外': '外來語', '外來': '外來語', '外来': '外來語', '片假名': '外來語', 'カタカナ': '外來語', 'kana': '外來語',
    '名・他サ': '名・他サ', '名/他サ': '名・他サ','名サ': '名・他サ', '名他サ': '名・他サ', '名詞他サ': '名・他サ', '名・自サ': '名・他サ', 'n-vs': '名・他サ', 'vn': '名・他サ'
};

export const translationEngine = {

// 🚀 1. 物理狀態儲存區
    lockedCategory: '自動', // 預設為自動感應模式

/** 🔖 核心焊接：自動感應與多態導播 (V2026.ULTRA 狀態主權解耦版) */
lockCategory(tag) {
    // 🚀 核心 A：物理感應與編輯器導通
    if (['⚙️', 'EDIT', 'SETTING', '編輯'].includes(tag)) {
        return this.promptEditLiveCategories();
    }

    // 🚀 核心 B：狀態固化 (這是 Engine 的主權職責)
    this.lockedCategory = tag;
    console.log(`🎯 [Category-Lock] 語義分區鎖定: ${tag}`);
    
    // 🚀 核心 C：數據與視覺同步回流 (跨模組通訊修正)
    // 💡 職人診斷：由於 translationView 是獨立衛星模組，
    // 建議使用 window.translationView 確保在 ESM 閉包外依然能精確對位。
    if (window.translationView && typeof translationView.renderCategoryTabs === 'function') {
        translationView.renderCategoryTabs();
    } else {
        console.warn("⚠️ [Acoustic-Link] 視圖引擎尚未對焦，延遲執行重繪");
    }
    
    // 🚀 核心 D：數據流同步
    // 如果在分類模式，同步刷新列表內容
    if (this.currentMode === 'filter') {
        this.loadLiveHistory(tag === '自動' ? '全部' : tag);
    }
    
    // 🚀 視覺與觸覺反饋
    if (window.uiManager) uiManager.showToast('🔖', `已鎖定分區：${tag}`);
    if (navigator.vibrate) navigator.vibrate(10);
},

    
    // ============================================================
    // 1. [Parser] 數據脫殼與洗滌核心
    // ============================================================

/** 🚀 物理脫殼解析器：V7 職人無損版 (100% 導通) */
parseFuel(rawText) {
    if (!rawText) return [];

    console.log("📡 [translationEngine] 啟動物理分段導通...");

    // 🚀 1. 物理切割：先用 [ 切開，這會強制把標籤分開
    const initialSegments = rawText.split('[');
    
    const cleaned = initialSegments
        .map(seg => {
            // 對於每一段，我們只需要找 ] 之後的內容
            // 例如：原本是 "原文1] 內容文字..." -> 切完變 " 內容文字..."
            const closingBracketIndex = seg.indexOf(']');
            if (closingBracketIndex === -1) {
                // 如果沒有右括號，代表這可能是第一段(標籤前的雜質)
                return seg.trim();
            }
            return seg.substring(closingBracketIndex + 1).trim();
        })
        // 🚀 2. 數據洗滌
        .map(text => {
            return text
                .replace(/```/g, '') // 移除 Markdown 噪音
                .replace(/[\u200B-\u200D\uFEFF]/g, '') // 移除隱藏雜質
                .trim();
        })
        // 🚀 3. 軌道過濾：封殺空行
        .filter(text => text.length > 0);

    console.log(`📡 [translationEngine] 解析完成，對焦軌道: ${cleaned.length}`, cleaned);
    return cleaned;
},

    // ============================================================
    // 2. [Logic Storage] 待焊接區域
    // ============================================================
    

/** 1. 模式切換發動機 (V2026.ULTRA.FINAL 雙軌獨立隔離版) */
switchRealtimeMode(mode) {
    // 🚀 1. 狀態固化 (Engine 職責)
    this.currentMode = mode; 
    if (this.expandedIds) this.expandedIds.clear();

    const container = document.getElementById('content-container') || document.getElementById('view-container');
    if (!container) return;

    // 🚀 2. 執行實體換殼 (移交 translationView 執行)
    // 💡 職人診斷：傳入 mode 確保渲染出 Step 1 - Step 5 的劇場生產線介面
    if (window.translationView && typeof translationView.renderRealtimeTranslation === 'function') {
        translationView.renderRealtimeTranslation(container, mode);
    } else {
        console.error("❌ [View-Link-Collapse] translationView 未導通");
        return;
    }

    // 🚀 3. 標籤軌道動態焊接 (物理對焦邏輯)
    const handleTabIgnition = () => {
        let existingTrack = document.getElementById('quick-category-track');
        
        // 💡 職人協定：只有在 filter (歷史分類) 模式才顯影標籤軌道
        // text (文字翻譯) 與 dialogue (劇場生成) 均不顯示舊有標籤，保持生產環境純淨
        if (mode !== 'filter') {
            if (existingTrack) existingTrack.remove();
            return;
        }

        const dialModule = document.getElementById('tf-mode-selector');
        const fuelStack = document.getElementById('fuel-display-stack');

        if (mode === 'filter' && !existingTrack) {
            const track = document.createElement('div');
            track.id = 'quick-category-track';
            track.className = "px-4 mb-4 mt-2 flex gap-2 overflow-x-auto no-scrollbar relative z-10 animate-fade-in";
            
            if (dialModule && dialModule.nextSibling) {
                dialModule.parentNode.insertBefore(track, dialModule.nextSibling);
            } else if (fuelStack) {
                fuelStack.parentNode.insertBefore(track, fuelStack);
            } else {
                container.appendChild(track);
            }
            translationView.renderCategoryTabs();
        }
    };

    handleTabIgnition();
    setTimeout(handleTabIgnition, 100); 

    // 🚀 4. 數據加載對焦 (僅限過濾模式執行歷史調取)
    if (mode === 'filter') {
        setTimeout(() => {
            const target = (this.lockedCategory === '自動' || !this.lockedCategory) ? '全部' : this.lockedCategory;
            this.loadLiveHistory(target); 
        }, 300);
    }

    // 🚀 5. 輸入源物理對焦 (生產軌道隔離)
    // 💡 職人診斷：精確區分「單句翻譯輸入」與「劇場素材輸入」的 DOM 座標
    setTimeout(() => {
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
        else if (mode === 'dialogue') {
            // 🎯 對焦至劇場生產線的素材入口 (Step 1)
            const diagInput = document.getElementById('dialogue-source-input');
            if (diagInput) diagInput.focus();
            
            // 💡 初始化：確保每次進入劇場模式時，Step 5 的控制台為空
            const diagImport = document.getElementById('dialogue-json-import');
            if (diagImport) diagImport.value = "";
        }
    }, 400);
    
    if (navigator.vibrate) navigator.vibrate(5);
},

/** ⌨️ 執行文字翻譯邏輯 (V2026.ULTRA 標籤感應固化版) */
async executeTextTranslate() {
    const input = document.getElementById('text-translate-input');
    const text = input?.value.trim();
    const resultArea = document.getElementById('realtime-result-area');
    const ttsEl = document.getElementById('tts-target');
    
    if (!text) return uiManager.showToast('⚠️', "請先鍵入內容");
    if (resultArea) resultArea.classList.remove('hidden');
    const sttEl = document.getElementById('stt-original');
    if (sttEl) sttEl.innerText = `原文鍵入：${text}`;
    
    if (ttsEl) {
        ttsEl.innerText = "AI 語義對焦中...";
        ttsEl.classList.add('animate-pulse');
    }
    try {
        const translated = await this._executeTranslation(text); 
        
        const targetCategory = (this.lockedCategory === '自動' || this.lockedCategory === 'AUTO') 
                               ? '一般' 
                               : this.lockedCategory;

        if (dbManager) {
            const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
            const record = {
                id: `txt_${Date.now()}`,
                type: 'text',
                lang: currentLang,
                category: targetCategory,
                tripId: window.state?.activeTripId || null, // 🚀 [新增]
                原文: text,
                翻譯: translated,
                timestamp: Date.now()
            };
            
            dbManager.put(dbManager.STORES.TRANS_VAULT, record)
                .then(() => console.log(`💾 [Solidified] 文字翻譯存入分區: ${targetCategory}`))
                .catch(e => console.error("❌ [Storage-Fail]", e));
        }

        if (ttsEl) {
            ttsEl.innerText = translated;
            ttsEl.classList.remove('animate-pulse');
        }
        
        if (window.audioManager) {
            window.audioManager.speak(translated);
        }
        
        input.blur();
        if (navigator.vibrate) navigator.vibrate(10);
        
    } catch (err) {
        console.error("❌ [Text-Translate-Collapse]:", err);
        if (ttsEl) {
            ttsEl.innerText = "對焦失敗，請檢查路網";
            ttsEl.classList.remove('animate-pulse');
        }
        uiManager.showToast('📡', "翻譯斷路，請檢查路網");
    }
},

/** 🚀 [Execute-Focus] 語義轉運站：進階指令發射發動機 (V2026.ULTRA.FINAL) */
async executeAdvancedTranslate() {
    // 1. 🚀 數據座標採樣 (採集 UI 的物理指紋)
    const input = document.getElementById('text-translate-input');
    const styleInput = document.getElementById('style-focus-input');
    const contextTrack = document.getElementById('translation-context-track');
    
    const text = input?.value.trim();
    const style = styleInput?.value.trim() || "標準專業"; 
    const contextType = contextTrack?.dataset.activeCtx || "news"; 

    // 定位視覺提示槽位
    const resultArea = document.getElementById('realtime-result-area');
    const ttsEl = document.getElementById('tts-target');
    const sttEl = document.getElementById('stt-original');

    if (!text) return uiManager.showToast('⚠️', "請先貼上待翻譯的內容");

    // 2. 🚀 核心焊接：合成「風格 + 情境 + 輸出標籤」的超級指令
    // 呼叫系統內建的聲學協定範本
    const baseProtocol = this._getAdvancedAcousticPrompt(contextType, style, text);

    // 3. 🚀 總線指令封裝 (Total Bus Assembly)
    const fullPrompt = `${baseProtocol}

**📋 輸出格式與對位協定：**
請根據上述風格對待翻譯素材執行「數據純化」。
請僅輸出成對的標籤格式，嚴禁任何前言或多餘解釋：
[原文1] (含戰略性標點的日文)
[翻譯1] (繁體中文)

**待翻譯素材：**
${text}`;

    // 4. 🚀 物理輸送與視覺回饋
    try {
        // 直接將合成好的超級燃料送往剪貼簿
        await navigator.clipboard.writeText(fullPrompt);
        
        // 介面點火：顯示任務指引而非空等結果
        if (resultArea) resultArea.classList.remove('hidden');
        if (sttEl) sttEl.innerText = `[${contextType.toUpperCase()}] 高級指令已就緒`;
        
        if (ttsEl) {
            ttsEl.innerHTML = `
                <div class="space-y-3 py-2">
                    <p class="text-pink-500 font-black text-sm flex items-center gap-2">
                        <i class="fa-solid fa-wand-magic-sparkles"></i> 高級翻譯指令已複製！
                    </p>
                    <p class="text-[11px] text-slate-500 leading-relaxed">
                        請至外部 AI 貼上此指令。獲得回傳後，點擊下方的 <b class="text-slate-800">Step 4 (IMPORT)</b> 即可將風格化翻譯包存入系統磁區。
                    </p>
                </div>
            `;
            ttsEl.classList.remove('animate-pulse');
        }

        uiManager.showToast('🪄', "高級翻譯指令已存入剪貼簿");
        
        // 釋放焦點並執行物理震動
        input.blur();
        if (navigator.vibrate) navigator.vibrate([10, 20]);

    } catch (err) {
        console.error("❌ [Clipboard-Collapse] 輸送路網墜毀:", err);
        uiManager.showToast('❌', "複製失敗，請手動檢查瀏覽器權限");
    }
},


/** 🎨 [Private] 分類 Tabs 渲染引擎 (V2026.ULTRA 自動導向對焦版) */
renderCategoryTabs() {
    const container = document.getElementById('quick-category-track') || 
                      document.getElementById('category-tabs-row');

    if (!container) return;

    // 🚀 1. 物理快照回溯
    const saved = localStorage.getItem('tf_live_private_cats');
    const defaultCats = ['一般', '交通', '用餐', '購物', '住宿', '景點', '醫藥', '文章', '歌詞', '技術'];
    const cats = saved ? JSON.parse(saved) : defaultCats;
    
    // 🚀 2. 跨模組狀態讀取與校準
    // 💡 職人診斷：強制讀取 Engine 的鎖定標籤，確保「文章注入」後的自動分類能反向點亮 UI
    const currentActive = (window.translationEngine && translationEngine.lockedCategory) 
                          ? translationEngine.lockedCategory 
                          : '自動';

    // 🚀 3. 動態標籤自癒 (Self-Healing)
    // 💡 若當前 active 標籤不在常用清單中（例如新注入的「技術」），主動將其推入暫態顯示
    if (!cats.includes(currentActive) && currentActive !== '自動' && currentActive !== '⚙️') {
        cats.push(currentActive);
    }

    // 生成「自動」標籤
    const autoTabHtml = `
        <button id="tab-link-自動" onclick="translationEngine.lockCategory('自動')" 
            class="shrink-0 px-4 py-1.5 rounded-full border font-black text-[10px] transition-all active:scale-90
            ${currentActive === '自動' ? 'theme-bg text-white border-transparent shadow-sm' : 'bg-white text-slate-400 border-slate-100'}">
            # 自動
        </button>
    `;

    // 生成分類標籤列
    const tabsHtml = cats.map(cat => {
        const isActive = (cat === currentActive);
        return `
            <button id="tab-link-${cat}" onclick="translationEngine.lockCategory('${cat}')" 
                class="shrink-0 px-4 py-1.5 rounded-full border font-black text-[10px] transition-all active:scale-90 whitespace-nowrap 
                ${isActive ? 'theme-bg text-white border-transparent shadow-sm' : 'bg-white text-slate-400 border-slate-100'}">
                # ${cat}
            </button>
        `;
    }).join('');

    // 4. 物理噴發
    container.innerHTML = `
        <div class="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth">
            ${autoTabHtml}
            ${tabsHtml}
            <button onclick="translationEngine.lockCategory('⚙️')" 
                class="w-8 h-8 shrink-0 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 ml-1">
                ⚙️
            </button>
        </div>
    `;

    // 🚀 5. 關鍵焊接：物理對焦與置中執行續
    requestAnimationFrame(() => {
        // 💡 職人修正：針對 id 含有特殊字元進行安全轉義
        const activeTab = document.getElementById(`tab-link-${currentActive}`);
        if (activeTab) {
            activeTab.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center' 
            });
        }
    });
},

/** 🚀 [Advanced Prompt] 語義轉運站：多態指令發射器 (V2026.ULTRA.FINAL) */
copyPromptWithContent() {
    // 1. 🚀 數據原子採集：獲取 UI 真值指紋
    const content = document.getElementById('text-translate-input')?.value.trim();
    const styleFocus = document.getElementById('style-focus-input')?.value.trim() || "標準專業";
    const contextTrack = document.getElementById('translation-context-track');
    const contextType = contextTrack?.dataset.activeCtx || "news"; 

    if (!content) return uiManager.showToast('⚠️', "請先貼上待處理內容");

    // 2. 🚀 核心對焦：呼叫私有發動機合成「語境約束」與「聲學協定」
    // 💡 職人診斷：透過 _getAdvancedAcousticPrompt 將複雜的 Prompt 邏輯封裝，保持主程序純淨
    const baseProtocol = this._getAdvancedAcousticPrompt(contextType, styleFocus, content);

    // 3. 🚀 總線指令焊接 (Total Bus Assembly)
    const fullPrompt = `${baseProtocol}

**📋 輸出格式預覽：**
[原文1] (含戰略性標點的日文)
[翻譯1] (繁體中文)

**待處理內容：**
${content}`;

    // 4. 🚀 物理輸送與觸覺反饋
    navigator.clipboard.writeText(fullPrompt)
        .then(() => {
            // 根據語境切換反饋圖示
            const icons = { lyrics: '🎵', tech: '🛠️', article: '📝', news: '📻' };
            uiManager.showToast(icons[contextType] || '🎙️', `已針對 [${contextType.toUpperCase()}] 對焦指令`);
            
            if (navigator.vibrate) navigator.vibrate(20);
            console.log(`📡 [Prompt-Weld] Context: ${contextType} | Style: ${styleFocus}`);
        })
        .catch(err => {
            console.error("❌ [Clipboard-Collapse] 輸送程序墜毀:", err);
            uiManager.showToast('❌', "複製路網中斷");
        });
},


/** 🧬 [Private] 進階聲學與語境協定合成器 (V2026.ULTRA.FINAL) */
_getAdvancedAcousticPrompt(context, style, content) {
    // 🚀 1. 語境特定協定 (Context-Specific Protocols)
    const contextProtocols = {
        'lyrics': {
            identity: "你是一位精通音樂韻律、旋律感與日文歌詞創作的專家。",
            mission: "請將內容翻譯為具備「歌唱流暢性」與「強烈情感渲染力」的日文歌詞。",
            constraints: [
                "保留原曲旋律感，確保音節長短適中，封殺生硬的直譯。",
                "針對感官詞彙（如閃耀、心跳、淚水），優先選用日式擬聲擬態詞。",
                "確保歌詞的韻腳或句尾處理符合日文流行音樂（J-Pop）的習慣。"
            ]
        },
        'tech': {
            identity: "你是一位精通資訊工程、軟體開發與技術文獻的日語專家。",
            mission: "請將內容翻譯為「邏輯嚴密、術語精確、去歧義化」的專業技術文件。",
            constraints: [
                "嚴格對位技術專有名詞，維持工業級的冷峻語感，嚴禁文學化修飾。",
                "確保邏輯鏈條不偏移，使用正確的接續詞（如：従って、具体的には）。",
                "若涉及代碼或變數名稱，必須原樣保留，不執行任何翻譯。"
            ]
        },
        'article': {
            identity: "你是一位精通散文敘事、文學翻譯與意境營造的日語專家。",
            mission: "請將內容翻譯為「意境深遠、用詞優雅、具備畫面感」的日文文章。",
            constraints: [
                "注重情境的層次感與呼吸感，根據上下文動態調整禮貌維度。",
                "選詞需具備文學性，營造沉浸式的閱讀體感。",
                "保留作者的語氣特徵，確保譯文讀起來具備「人類溫度」。"
            ]
        },
        'news': {
            identity: "你是一位精通日本新聞播報、客觀記述與聲學表現的日語專家。",
            mission: "請將內容翻譯成「極其自然、專業且客觀」的新聞播報體日文。",
            constraints: [
                "統一使用「丁寧語」(Desu/Masu 體)。",
                "語氣應嚴謹、權威且具備資訊傳遞的即時感。",
                "確保句子結構完整，適合在公共廣播或新聞頻道播放。"
            ]
        }
    };

    const protocol = contextProtocols[context] || contextProtocols['news'];

    // 🚀 2. 物理指令合成 (Protocol Assembly)
    return `${protocol.identity}
${protocol.mission}

**🎨 指定藝術風格：**「${style}」 (請根據此風格調整用詞深度與語氣極性)

**🚨 語境對焦協定 (Linguistic Constraints)：**
${protocol.constraints.map((c, i) => `${i + 1}. ${c}`).join('\n')}

**🎙️ 聲學播報優化協定 (Acoustic Pacing)：**
1. **戰略性斷句**：為了讓語音播報具備人類換氣感，請在「重大語義轉折」或「超過20字的長句中段」主動加入「、」。
2. **語流焊接**：嚴禁在助詞（如：の、に、を）之後立即加入「、」，確保如「児童のもの」等詞組維持連讀，封殺遲疑感。
3. **語氣連貫**：維持句子的結構美感，不要為了斷句而使句子過於碎裂，每個段落應保持 2-3 個主要的呼吸點即可。
4. **純淨輸出**：僅輸出成對的 [原文n] 與 [翻譯n]，嚴禁雜質。`;
},


/** 📥 [Advanced Injection] 燃料生產：四情境語義感應版 (V2026.ULTRA.FINAL) */
async injectFuelFromClipboard() {
    try {
        // 🚀 1. 物理獲取與初步洗滌
        await new Promise(r => setTimeout(r, 150));
        const text = await navigator.clipboard.readText();
        if (!text) return uiManager.showToast('⚠️', "剪貼簿無內容");

        // 💡 職人診斷：物理切除時間戳、Markdown 編號與不可見雜質
        const sanitizedText = text
            .replace(/\[\d{2}:\d{2}\.\d{2,3}\]/g, '') 
            .replace(/^[\s\t]*[\d\-*+.]+\s+/gm, '')  
            .replace(/[\u200B-\u200D\uFEFF]/g, '')    
            .trim();

        // 🚀 2. 多態語義切割 (Polymorphic Splitting)
        let rawSegments = [];
        if (/\[(?:原文|翻譯|Original|Translation|JP|ZH|CN|EN|原文\d+)/i.test(sanitizedText)) {
            rawSegments = sanitizedText.split(/\[(?:原文|翻譯|Original|Translation|JP|ZH|CN|EN|原文\d+|翻譯\d+)\s*[:：]?\]/i);
        } else {
            rawSegments = sanitizedText.split(/\n+/);
        }

        const cleanLines = rawSegments.map(s => s.trim()).filter(l => l.length > 0); 
        if (cleanLines.length < 2) return uiManager.showToast('⚠️', "燃料密度不足，對焦失敗");

        // 🚀 3. 數據對位封裝 (Tuple Mapping)
        const segmentsTuple = [];
        for (let i = 0; i < cleanLines.length; i += 2) {
            const q = cleanLines[i];
            const a = cleanLines[i + 1];
            if (q && a) segmentsTuple.push([q, a]); 
        }

        // 🚀 4. 語境主權與「四情境」自癒感測 (核心修正)
        const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
        
        // A. 優先權 1：採集 UI 目前鎖定的分類 (若使用者已手動選擇，則不觸發自動感應)
        let targetCategory = (this.lockedCategory === '自動' || this.lockedCategory === 'AUTO') ? '自動' : this.lockedCategory;

        // B. 優先權 2：若為自動，執行「深度指紋掃描」
        if (targetCategory === '自動') {
            const sample = sanitizedText.toLowerCase();
            
            // 💡 歌詞感應器：檢查疊詞、情緒詞或 Lrc 殘留
            const isLyrics = text.includes('[00:') || 
                             /アタシ|キミ|君|想い|imagine|love|loving|heart|baby/i.test(sample) ||
                             /(.)\1.*?\1\1/.test(sample); // 偵測日文常見疊詞符號
                             
            // 💡 技術感應器：檢查代碼關鍵字與邏輯符號
            const isTech = /function|const|let|async|await|=>|export|import|api|config|endpoint|sdk/i.test(sample);
            
            // 💡 新聞感應器：檢查權威性字眼、報導性詞彙
            const isNews = /報導|記者|指出|表示|政府|日圓|市場|調查|據悉|述/i.test(sample);

            if (isLyrics) {
                targetCategory = '歌詞';
            } else if (isTech) {
                targetCategory = '技術';
            } else if (isNews) {
                targetCategory = '新聞';
            } else {
                // 💡 傳統旅遊情境比對 (僅限高權重詞彙，避免誤殺)
                const rules = [
                    { cat: '交通', reg: /駅|車|道|線|切符|航空|空港|乗り換え/ },
                    { cat: '用餐', reg: /食|飯|飲|店|料理|予約|水炊|壽司/ },
                    { cat: '購物', reg: /買|購|錢|円|商|免税|レジ/ },
                    { cat: '住宿', reg: /酒店|泊|宿|部屋|チェック/ }
                ];
                
                let matched = false;
                for (const rule of rules) {
                    if (rule.reg.test(sample)) {
                        targetCategory = rule.cat;
                        matched = true;
                        break;
                    }
                }
                // 最終 Fallback：歸類為散文/文章
                if (!matched) targetCategory = '散文'; 
            }
        }

// 🚀 5. 文章燃料包固化
const articlePackage = {
    id: `art_${Date.now()}`,
    type: 'article_package',
    title: cleanLines[0].substring(0, 25).replace(/[\[\]]/g, ''),
    lang: currentLang,
    category: targetCategory,
    tripId: window.state?.activeTripId || null, // 🚀 [新增]
    segments: segmentsTuple,
    timestamp: Date.now()
};

        if (dbManager) {
            await dbManager.put(dbManager.STORES.TRANS_VAULT, articlePackage);
        }

// 🚀 6. 視圖熱重連
        const refreshFilter = (this.lockedCategory === '自動') ? '全部' : this.lockedCategory;
        if (typeof this.loadLiveHistory === 'function') {
            await this.loadLiveHistory(refreshFilter); 
        }

        uiManager.showToast('🎯', `成功注入 [${targetCategory}] 燃料包`);
        if (navigator.vibrate) navigator.vibrate([10, 30]);

        // 🚀 [新增] 靜默同步特訓磁區，確保新單字自動進入影子資料庫
        if (window.App) setTimeout(() => App.syncSRSShadow({ silent: true }), 300);

    } catch (err) {
        console.error("❌ [Fuel-Production-Collapse]:", err);
        uiManager.showToast('❌', "生產路網斷路");
    }
},


/** 🚀 物理寫入 Vault：數據持久化與磁區固化 (V2026.ULTRA 全域解耦版) */
async importTranslateFuel() {
    console.log("📡 [translationEngine] 啟動燃料注入與持久化協定...");
    
    const input = document.getElementById('trans-json-input');
    let jsonStr = input ? input.value.trim() : "";
    if (!jsonStr) return;
    try {
        jsonStr = jsonStr.replace(/^```json\s*/, '')
                        .replace(/^```\s*/, '')
                        .replace(/\s*```$/, '')
                        .trim();

        const data = JSON.parse(jsonStr);
        const newRawItems = Array.isArray(data) ? data : [data];

        const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';

        // 🚀 [修正] 補上 tripId
        const newItems = newRawItems.map((item, index) => ({
            ...item,
            lang: currentLang,
            type: 'contextual',
            id: `vlt_${Date.now()}_${index}`,
            tripId: window.state?.activeTripId || null, // 🚀 [新增]
            timestamp: Date.now()
        }));

        if (dbManager) {
            console.log(`📡 [Bulk-Import] 準備固化 ${newItems.length} 筆燃料至 TRANS_VAULT...`);
            
            const savePromises = newItems.map(item => 
                dbManager.put(dbManager.STORES.TRANS_VAULT, item)
            );
            
            await Promise.all(savePromises);
            console.log("💾 [Storage-Fixed] 全域翻譯磁區已同步固化");
        } else {
            throw new Error("DB_MANAGER_OFFLINE");
        }

        if (typeof this.filterTranslate === 'function') {
            this.filterTranslate('全部'); 
        }

        uiManager.showToast('✅', `已存入 ${newItems.length} 筆${currentLang === 'JP' ? '日文' : '英文'}情境燃料`);
        if (input) input.value = '';
    } catch (e) {
        console.error("❌ [Fuel-Collapse] 注入程序中斷:", e);
        uiManager.showToast('⚠️', "解析失敗：請檢查 JSON 格式或磁區狀態");
    }
},

/** 🚀 [Core] 語義翻譯發動機 - 物理直連歸一版 (帶顯影防禦) */
async _executeTranslation(text, contextType = "news", styleDescription = "標準專業") {
    if (!text || text.trim() === "") return "";
    
    // 🛡️ 1. 物理路網預檢
    if (!navigator.onLine) {
        uiManager.showToast('📡', "無網路連線");
        throw new Error("Network Offline");
    }

    // 🚀 2. 物理座標對位：根據您的 Terminal 真值設定
    const endpoint = 'http://localhost:3000';

    try {
        // 🚀 3. 數據點火
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                text: text,
                source: 'zh-TW',
                target: 'ja-JP',
                context: contextType,
                style: styleDescription
            })
        });

        // 🛡️ 4. 取得原始文本 (不直接執行 .json()，防止崩潰)
        const rawResponse = await response.text();

        // 🛡️ 5. 閘門狀態偵測
        if (!response.ok) {
            console.error(`🚨 [API-Gate-Blocked] Status: ${response.status}`);
            console.error(`📄 [Error-Detail] 後端回傳內容：`, rawResponse);
            throw new Error(`API_ERROR_${response.status}`);
        }

        // 🚀 6. 執行 JSON 脫殼
        try {
            const result = JSON.parse(rawResponse);
            // 數據回流：兼容 result.translatedText、text 或 result
            return result.translatedText || result.text || result.result || String(result);
        } catch (jsonErr) {
            // 💡 職人診斷：如果在這裡崩潰，代表後端吐了 HTML。
            // 我們直接把 rawResponse 印出來，你就能看到後端哪一行代碼出錯了。
            console.error("❌ [HTML-Contamination] 偵測到 HTML 雜質注入！");
            console.log("🛠️ --- 後端原始回傳內容 (顯示報錯原因) ---");
            console.log(rawResponse);
            console.log("🛠️ ----------------------------------------");
            return `[Error] 後端燃料污染 (非 JSON)`;
        }

    } catch (err) {
        console.error("❌ [Engine-Relay-Dead]:", err.message);
        const errorMsg = err.message.includes('token') ? "後端回傳格式非 JSON" : "語義引擎回應異常";
        uiManager.showToast('⚠️', errorMsg);
        return `[Error] ${text}`;
    }
},


/** 🚀 翻譯模組分流代理 (V2026.ULTRA 情境路網強制導通版) */
async filterTranslate(category) {
    // 💡 職人診斷：直接獲取當前視圖容器
    const container = document.getElementById('content-container') || document.getElementById('view-container');
    
    // 🎯 執行分流判定
    const liveStack = document.getElementById('fuel-display-stack');
    if (liveStack) {
        // [即時翻譯軌道 - 維持原狀]
        this.lockedCategory = category;
        if (window.translationView) translationView.renderCategoryTabs();
        return await this.loadLiveHistory(category === '自動' ? '全部' : category);
    }

    // 🎯 情境翻譯軌道 (Contextual Vault)
    console.log(`📖 [Context-Route] 強制重繪情境分區: ${category}`);
    if (!container) return;

    try {
        // 1. 🚀 數據採集
        const allVaultData = await dbManager.getAll(dbManager.STORES.TRANS_VAULT);
        const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';

        // 2. 🚀 數據精煉 (過濾)
        let filteredData = allVaultData.filter(item => 
            item.lang === currentLang && item.type === 'contextual'
        );

        if (category && category !== '全部') {
            filteredData = filteredData.filter(item => item.category === category);
        }

        // 3. 🚀 視覺點火 (關鍵點！)
        // 💡 職人診斷：必須「重新呼叫」主渲染函數，並把點擊的 category 傳進去
        // 這樣 renderContextualTranslation 內部的 Tabs 才會重新計算 isHit，顏色才會變
        if (window.translationView && typeof translationView.renderContextualTranslation === 'function') {
            translationView.renderContextualTranslation(container, filteredData, category);
        }

        if (window.uiManager && category !== '全部') uiManager.showToast('🎯', `切換分區：${category}`);

    } catch (err) {
        console.error("❌ [Context-Filter-Collapse]:", err);
    }
},

/** ✍️ [Module] 文章編輯總調度發動機 (V2026.ULTRA.FINAL 座標全導通版) */
async editArticlePackage(id) {
    try {
        // 🚀 1. 磁區提取
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, id);
        if (!record) return uiManager.showToast('❌', "磁區對焦失敗");

        const modalId = 'modal-edit-article';
        
        // 🚀 2. 視圖零件組裝
        // 💡 職人診斷：必須傳入 id 給 Actions，否則「物理切除」按鈕將失去刪除目標
        const contentHtml = translationView._renderArticleEditForm(record);
        const actionsHtml = translationView._renderArticleEditActions(modalId, id);

        // 🚀 3. 模態框點火
        modalEngine.create(modalId, '重構文章存檔', contentHtml, actionsHtml);

        // 🚀 4. 儲存邏輯綁定
        const saveBtn = document.getElementById('save-art-btn');
        if (saveBtn) {
            saveBtn.onclick = () => this._handleArticleSave(id, record, modalId);
        }

    } catch (err) {
        console.error("❌ [Edit-Collapse]:", err);
        if (window.uiManager) uiManager.showToast('⚠️', "編輯發動機點火失敗");
    }
},

/** ➕ [Action] 物理新增編輯段落 (這是您詢問的新函數) */
addEditSegment() {
    const list = document.getElementById('edit-segments-list');
    const notice = document.getElementById('empty-segment-notice');
    if (!list) return;

    // 如果目前是空狀態，先移除提示字樣
    if (notice) notice.remove();

    const nextIdx = list.querySelectorAll('.segment-edit-block').length;
    const html = translationView._renderSegmentEditBlock(nextIdx, "", "");
    
    const temp = document.createElement('div');
    temp.innerHTML = html;
    list.appendChild(temp.firstElementChild);
    
    // 視覺對焦：自動滾動到底部
    list.lastElementChild.scrollIntoView({ behavior: 'smooth', block: 'end' });
},

/** 💾 [Private] 數據持久化處理器 (V2026.ULTRA.FINAL 標籤與磁區全導通版) */
async _handleArticleSave(id, oldRecord, modalId) {
    const saveBtn = document.getElementById('save-art-btn');
    const titleEl = document.getElementById('edit-art-title');
    const newTitle = titleEl ? titleEl.value.trim() : "";
    
    if (!newTitle) return window.uiManager.showToast('⚠️', "標題不可為空");

    // 🚀 1. 物理熔斷：防止數據重複寫入導致磁區衝突
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.style.opacity = '0.5';
    }

    try {
        // 🚀 2. 分類標籤採集 (強化對焦)
        // 💡 職人診斷：使用 getAttribute 取代 dataset，確保獲取最原始的 DOM 屬性值
        const activeChip = document.querySelector('#edit-art-cat-group .cat-chip.is-active') || 
                           document.querySelector('#edit-art-cat-group [data-selected-active="true"]');
        
        // 如果有選中新標籤則採用，否則維持舊磁區數據
        const newCategory = activeChip ? activeChip.getAttribute('data-cat') : oldRecord.category;

        // 🚀 3. 數據採集與防禦洗滌
        const newSegments = Array.from(document.querySelectorAll('.segment-edit-block')).map(block => {
            const qEl = block.querySelector('.edit-q-input');
            const aEl = block.querySelector('.edit-a-input');
            
            const cleanVal = (el) => {
                const val = el ? el.value.trim() : "";
                // 封殺字串型毒素
                return (val === 'undefined' || val === 'null') ? "" : val;
            };

            return [cleanVal(qEl), cleanVal(aEl)]; 
        });

        // 🚀 4. 構建更新載體
        const updatedRecord = { 
            ...oldRecord, 
            title: newTitle, 
            category: newCategory, // 💥 確保分類標籤正確覆寫
            segments: newSegments,
            timestamp: Date.now() 
        };

        // 🚀 5. 實體固化至 IndexedDB
        await dbManager.put(dbManager.STORES.TRANS_VAULT, updatedRecord);
        
        window.uiManager.showToast('✨', "數據與標籤已成功固化至磁區");
        
        // 🚀 6. 資源回收與視圖刷新
        App.modalRemove(modalId);
        
        // 確保視圖重新對焦，點亮新的標籤狀態
        const refreshTarget = (this.lockedCategory === '自動') ? '全部' : this.lockedCategory;
        await this.loadLiveHistory(refreshTarget);

    } catch (err) {
        console.error("❌ [Save-Collapse]:", err);
        window.uiManager.showToast('⚠️', "磁區寫入崩潰，請檢查資料結構");
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.style.opacity = '1';
        }
    }
},

/** 🗑️ [Action] 物理切除：刪除整篇文章磁區 (V2026.ULTRA 氣泡全導通版) */
async deleteArticlePackage(id, modalId) {
    // 💡 職人診斷：使用 window.uiManager 確保全域主權導通
    const targetUI = window.uiManager || uiManager;

    if (!targetUI) {
        console.error("❌ [System-Fault] 視覺發動機 uiManager 未點亮");
        return;
    }

    // 🚀 核心焊接：使用交互式氣泡取代軍事化 confirm
    targetUI.showToast('⚠️', "確認物理切除文章？", 6000, {
        onConfirm: async () => {
            try {
                // 1. 執行磁區抹除 (IndexedDB 實體操作)
                await dbManager.delete(dbManager.STORES.TRANS_VAULT, id);
                
                // 2. 介面回流：點亮成功氣泡
                targetUI.showToast('🗑️', "磁區資料已物理切除");
                
                // 3. 資源回收：移除 Modal 節點
                App.modalRemove(modalId);
                
                // 4. 視圖重連：根據當前分類鎖定刷新路網
                const refreshTarget = (this.lockedCategory === '自動') ? '全部' : this.lockedCategory;
                this.loadLiveHistory(refreshTarget);

                // 物理震動回饋 (職人細節)
                if (navigator.vibrate) navigator.vibrate([30, 50]);

            } catch (err) {
                console.error("❌ [Delete-Collapse]:", err);
                targetUI.showToast('⚠️', "磁區切切除異常，路網坍塌");
            }
        }
    });
},

/** 🧬 [Private] 標籤切換物理對焦 (V2026.ULTRA 全量導通版) */
_handleCatSwitch(btn, cat) {
    // 🚀 1. 物理清理：防止連點產生的選取噪音
    window.getSelection().removeAllRanges(); 
    const group = btn.parentElement;
    
    // 🚀 2. 磁區復位：將群組內所有標籤還原為初始狀態
    group.querySelectorAll('.cat-chip').forEach(b => {
        b.classList.remove('is-active'); // 💥 關鍵：移除選中類名
        b.style.backgroundColor = '#ffffff';
        b.style.color = '#64748b'; 
        b.style.borderColor = '#f1f5f9';
        b.dataset.selectedActive = "false";
    });

    // 🚀 3. 主權注入：點亮選中項並確保數據可被採集
    const themeHex = getComputedStyle(document.documentElement).getPropertyValue('--theme-primary').trim() || '#ff4d91';
    
    // 強制注入物理樣式
    btn.style.setProperty('background-color', themeHex, 'important');
    btn.style.setProperty('color', '#ffffff', 'important');
    btn.style.setProperty('border-color', 'transparent', 'important');
    
    // 強制更新邏輯標記
    btn.classList.add('is-active'); // 💥 關鍵：點亮類名，確保 _handleArticleSave 能偵測到
    btn.dataset.selectedActive = "true";
    btn.dataset.cat = cat; // 確保數據指紋存在

    // 🚀 4. 觸覺回饋
    if (navigator.vibrate) navigator.vibrate(8);
    console.log(`🎯 [Cat-Switch] 分類已導通: ${cat}`);
},


/** 📜 [Live-Persistence] 專屬即時翻譯歷史讀取器 (V2026.ULTRA 劇場導通版) */
async loadLiveHistory(category = '全部') {
    const stack = document.getElementById('fuel-display-stack');
    const watermark = document.getElementById('category-lock-watermark'); 
    
    if (!stack) return; 

    // 🚀 核心 A：物理屏蔽攔截 (分流導通)
    if (this.currentMode !== 'filter') {
        stack.innerHTML = ""; 
        if (watermark) watermark.setAttribute('style', 'display: none !important');
        return;
    }

    try {
        const allData = await dbManager.getAll(dbManager.STORES.TRANS_VAULT);
        const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';

        // 1. 🚀 數據清洗：確保語系對位與合法類型採集
        let liveData = allData.filter(item => 
            item.lang === currentLang && 
            ['text', 'article', 'voice', 'image', 'article_package'].includes(item.type)
        );

        // 2. 🚀 分區精準對焦 (V2026.ULTRA 自癒修正)
        const target = String(category || '全部').trim();
        
        if (target !== '全部') {
            liveData = liveData.filter(item => {
                const itemCat = String(item.category || '一般').trim();
                
                // 💡 職人診斷：劇場模式自癒協定
                // 若目標是「會話」，除了比對 category，同步掃描 tags 指紋，確保導通率 100%
                if (target === '會話') {
                    return itemCat === '會話' || 
                           (item.tags && item.tags.includes('劇場生成')) ||
                           (item.type === 'article_package' && item.title?.includes('🎭'));
                }
                
                return itemCat === target;
            });
        }

        // 🎯 核心 B：浮水印與空值狀態控制
        if (watermark) {
            watermark.setAttribute('style', liveData.length > 0 ? 'display: none !important' : 'display: flex !important');
        }

        // 3. 🚀 數據排序 (由新到舊)
        liveData.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));

        // 🚀 核心 C：實體渲染噴發
        if (window.translationView && typeof translationView._renderTranslateCards === 'function') {
            
            // 物理洗滌並注入
            stack.innerHTML = translationView._renderTranslateCards(liveData, target);
            
            console.log(`🏁 [Render-Link] 導通成功：${target} 分區 | 燃料筆數: ${liveData.length}`);
            
            // 🚀 視圖聯動：確保 Tabs 視覺狀態同步
            if (typeof translationView.renderCategoryTabs === 'function') {
                translationView.renderCategoryTabs();
            }

        } else {
            console.error("❌ [Render-Link-Collapse] 視圖衛星未導通");
            if (window.viewEngine?._renderTranslateCards) {
                stack.innerHTML = window.viewEngine._renderTranslateCards(liveData, target);
            }
        }

    } catch (err) {
        console.error("❌ [Live-History-Collapse]:", err);
        if (window.uiManager) uiManager.showToast('⚠️', "數據路網對焦異常");
    }
},



/** 🚀 摺疊邏輯點火 */
toggleArticleExpand(id) {
    if (!this.expandedIds) this.expandedIds = new Set();
    if (this.expandedIds.has(id)) {
        this.expandedIds.delete(id);
    } else {
        this.expandedIds.add(id);
    }
    // 重新渲染以套用視覺狀態
    this.loadLiveHistory(this.currentCategory || '全部');
},

/** ⚙️ 彈出「即時翻譯」專屬私有標籤編輯 (V2026.ULTRA.PRIVATE) */
promptEditLiveCategories() {
    // 🚀 物理脫鉤：直接從私有 localStorage 採集燃料，不碰 state.trips
    const defaultCats = ['一般', '交通', '用餐', '購物', '住宿', '景點', '醫藥'];
    const saved = localStorage.getItem('tf_live_private_cats');
    const categories = saved ? JSON.parse(saved) : defaultCats;
    
    const content = `
        <div class="space-y-4 text-left">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">即時翻譯專屬分區 (以逗號分隔)</p>
            <textarea id="edit-live-cats" 
                      class="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-pink-100 outline-none">${categories.join(', ')}</textarea>
            <p class="text-[9px] text-slate-400 italic leading-relaxed">* 這是您的私有分類，變更後僅影響「即時翻譯」區域的 Tabs 顯示。</p>
        </div>
    `;

    const actions = `
        <button onclick="App.modalRemove('live-cat-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消</button>
        <button onclick="translationEngine.saveLiveCategories()" class="flex-[2] py-4 theme-bg-pink text-white rounded-2xl font-black text-xs shadow-lg">更新私有分區</button>
    `;

    modalEngine.create('live-cat-modal', '🛠️ 即時翻譯分區編輯', content, actions);
},

/** 💾 儲存即時翻譯私有標籤 (物理寫入 localStorage) */
saveLiveCategories() {
    const input = document.getElementById('edit-live-cats');
    if (!input) return;

    // 1. 洗滌燃料
    const newCats = input.value.split(',')
        .map(c => c.trim())
        .filter(c => c !== "");
    
    if (newCats.length === 0) return uiManager.showToast('⚠️', '至少需保留一個分類');

    // 2. 物理固化至私有磁區
    localStorage.setItem('tf_live_private_cats', JSON.stringify(newCats));

    // 3. 介面回收與視圖導通
    App.modalRemove('live-cat-modal');
    
    // 🚀 關鍵回流：重新渲染即時翻譯的 Tabs (呼叫你現有的渲染器)
    if (typeof translationView.renderCategoryTabs === 'function') {
        translationView.renderCategoryTabs();
    }
    
    uiManager.showToast('✨', "私有分區已更新");
    if (navigator.vibrate) navigator.vibrate(10);
},


/** 🎙️ [Acoustic-Relay] 聲學中繼站 (V2026.ULTRA.2D_DECOUPLING_FIX) */
async speakSegment(text, articleId = null) {
    // 🛡️ 1. 物理入口攔截
    if (!text || !window.audioManager) return;
    
    // 🚀 [CRITICAL WELD] 數據提純：封殺譯文干擾
    // 💡 職人診斷：若傳入的是 [原文, 譯文] 二維陣列，強制提取 index 0。
    // 這樣送往音訊發動機的 cleanText 才會是純淨的「姓名：內容」。
    const rawContent = Array.isArray(text) ? String(text[0]) : String(text);
    const cleanText = rawContent.trim();
    
    // 辨識格式：是否包含冒號（角色對話特徵）
    const isDialogue = cleanText.includes('：') || cleanText.includes(':');
    const safeArticleId = (articleId && articleId !== 'null' && articleId !== 'undefined') ? String(articleId) : null;

    try {
        // 🚀 核心 A：實時基因採樣
        const getValidActor = (actor) => (actor && actor.name) ? actor : null;

        const actorA = getValidActor(window.currentActorA) || 
                       getValidActor(window.personaEngine?.lastDuo?.actorA);
        const actorB = getValidActor(window.currentActorB) || 
                       getValidActor(window.personaEngine?.lastDuo?.actorB);

        // 🚀 核心 B：分流執行協定
        if (isDialogue) {
            // 軌道 1：磁區存檔讀取
            if (safeArticleId) {
                const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, safeArticleId);
                // 💡 職人診斷：若存檔標記為 isFuelCentric，代表應由識字器完全主導聲音分流
                if (record && record.acousticConfig) {
                    console.log(`📡 [Acoustic-Vault] 導通存檔軌道: ${safeArticleId}`);
                    return await window.audioManager.speak(
                        [cleanText], 
                        record.acousticConfig.actorA, 
                        record.acousticConfig.actorB
                    );
                }
            }

            // 軌道 2：實時/劇場模式點火
            console.log(`📢 [Acoustic-Ignition] 執行識字對焦: ${cleanText.substring(0, 10)}...`);
            // 🔥 [WELD] 強制以陣列傳送提純後的 cleanText，確保啟動 Chirp3 串行邏輯
            await window.audioManager.speak([cleanText], actorA, actorB);

        } else {
            // 軌道 3：單軌精煉 (單字或一般句)
            await window.audioManager.speak(cleanText);
        }

    } catch (err) {
        console.error("❌ [Acoustic-Relay-Collapse]:", err);
        if (window.audioManager._fallbackSpeak) {
            window.audioManager._fallbackSpeak(cleanText);
        }
    }
},


/** ⚙️ 彈出：EDU 指令選單 (N5-N1 難度撥盤 - 職人加固版) */
openEduMenu(itemId, segIdx) {
    const modalId = 'edu-prompt-modal';
    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];
    const tasks = [
        { id: 'grammar', name: '文法分析', icon: '📝' },
        { id: 'vocab', name: '單字提取', icon: '📖' },
        { id: 'quiz', name: '模擬測驗', icon: '❓' },
        { id: 'listening', name: '聽力練習', icon: '🎧' }
    ];

    // 🚀 1. 構建撥盤與任務扇區
    const content = `
        <div class="space-y-8 p-2 animate-fade-in">
            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">1. 目標難度對焦 (Level)</label>
                <div class="grid grid-cols-5 gap-2.5" id="edu-level-selector">
                    ${levels.map(l => {
                        const isDefault = l === 'N2';
                        return `
                        <button onclick="translationEngine._selectEduLevel(this)" 
                                data-level="${l}"
                                class="edu-lvl-btn py-3.5 rounded-2xl font-black text-[12px] transition-all border active:scale-90
                                ${isDefault ? 'bg-slate-900 text-white border-slate-900 shadow-xl' : 'bg-slate-50 text-slate-400 border-transparent'}">
                            ${l}
                        </button>`;
                    }).join('')}
                </div>
            </div>

            <div>
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 pl-1">2. 教材模組點火 (Module)</label>
                <div class="grid grid-cols-2 gap-4">
                    ${tasks.map(t => `
                        <button onclick="translationEngine.executeEduGenerate('${itemId}', ${segIdx}, '${t.id}')" 
                                class="p-6 bg-white border border-slate-100 rounded-[2rem] text-left hover:border-pink-200 hover:shadow-lg hover:shadow-pink-50 transition-all active:scale-95 group">
                            <div class="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">${t.icon}</div>
                            <div class="font-black text-slate-800 text-[15px]">${t.name}</div>
                            <div class="text-[9px] theme-text-pink font-bold uppercase mt-1 tracking-tighter opacity-60">AI Logic Ignition</div>
                        </button>
                    `).join('')}
                </div>
            </div>
            
            <p class="text-[9px] text-slate-300 text-center italic tracking-tight px-4">
                職人提示：系統將自動複製指令，請至 AI 介面貼上以換取燃料。
            </p>
        </div>
    `;

    // 🚀 2. 實體彈窗佈署
    modalEngine.create(modalId, '🎓 教材發動機', content, `
        <button onclick="App.modalRemove('${modalId}')" 
                class="w-full py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[11px] tracking-widest uppercase active:scale-95 transition-all">取消</button>
    `);
},

/** 🧬 [Private] 難度撥盤切換核心 */
_selectEduLevel(btn) {
    document.querySelectorAll('.edu-lvl-btn').forEach(b => {
        b.className = 'edu-lvl-btn py-3 rounded-2xl bg-slate-50 text-slate-400 border border-transparent font-black text-[12px] transition-all';
    });
    btn.className = 'edu-lvl-btn py-3 rounded-2xl bg-slate-900 text-white border border-slate-900 font-black text-[12px] transition-all shadow-xl';
    if (navigator.vibrate) navigator.vibrate(5);
},


/** 🚀 執行：生成專屬教材 Prompt (V2026.ULTRA - 台灣職人版) */
async executeEduGenerate(itemId, segIdx, taskType) {
    // 🚀 1. 物理抓取當前選中的難度 (從撥盤模組抓取真值)
    // 💡 職人診斷：精確對位具備 .bg-slate-900 類別的按鈕，那是目前對焦的難度
    const levelBtn = document.querySelector('#edu-prompt-modal .edu-lvl-btn.bg-slate-900');
    const level = levelBtn ? levelBtn.dataset.level : 'N2'; // 熔斷機制：若無選取則導向預設 N2
    
    // 🚀 2. 數據磁區對焦與解析
    let record;
    try {
        record = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
    } catch (e) {
        return uiManager.showToast('⚠️', "磁區讀取受阻");
    }

    if (!record || !record.segments) return uiManager.showToast('⚠️', "數據燃料不存在");
    
    const segment = record.segments[segIdx];
    if (!segment) return uiManager.showToast('⚠️', "段落定位失效");
    
    // 🚀 3. 數據歸一化處理 (Data Normalization)
    // 💡 職人診斷：同步處理 [原文, 譯文] 陣列格式與 {q, a} 物件格式
    const text = Array.isArray(segment) ? (segment[0] || "") : (segment.q || segment.原文 || "");
    const trans = Array.isArray(segment) ? (segment[1] || "") : (segment.a || segment.翻譯 || "");

    if (!text) return uiManager.showToast('⚠️', "數據燃料內容為空");

    // 🚀 4. Prompt 模組點火
    // 呼叫先前定義的 _promptTemplates 渲染庫
    const renderFn = _promptTemplates[taskType];
    if (typeof renderFn !== 'function') {
        console.error(`❌ [Edu-Error] 找不到任務模組: ${taskType}`);
        uiManager.showToast('⚠️', "指令引擎未定義");
        return;
    }

    const fullPrompt = renderFn(level, text, trans);

    // 🚀 5. 物理輸送至剪貼簿 (Clipboard Transport)
    try {
        // 使用現代異步 API 執行輸送
        await navigator.clipboard.writeText(fullPrompt);
        
        // 🚀 6. 視覺與觸覺同步反饋
        const taskName = this._getTaskName(taskType);
        uiManager.showToast('✨', `已對焦 [${level}] ${taskName} 指令`);
        
        // 物理關閉選單，完成交互閉環
        App.modalRemove('edu-prompt-modal');
        
        // 觸覺點火
        if (navigator.vibrate) navigator.vibrate([15, 40]);
        console.log(`📡 [Edu-Ignition] Prompt 導通成功 | Level: ${level} | Task: ${taskType}`);
        
    } catch (err) {
        console.error("❌ [Clipboard-Collapse] 輸送程序墜毀:", err);
        uiManager.showToast('⚠️', "複製路網中斷，請手動檢查權限");
    }
},

/** 🧬 [Private] 輔助：轉換 Task ID 為中文名稱 */
_getTaskName(id) {
    const map = { 'grammar': '文法', 'vocab': '單字', 'quiz': '測驗', 'listening': '聽力' };
    return map[id] || id;
},




/** ↕️ 修正：摺疊切換與數據同步 (V2026.ULTRA 物理對焦加固版) */
async toggleArticleFolder(id) {
    const content = document.getElementById(`content-${id}`);
    const arrowContainer = document.getElementById(`arrow-${id}`);
    if (!content) return;

    // 🚀 1. 物理狀態切換：切換 hidden 類別
    const isHidden = content.classList.toggle('hidden');
    
    // 🚀 2. 箭頭物理對焦：執行實體 Icon 的旋轉點火
    // 💡 職人診斷：確保對焦到內部的 <i> 標籤，並執行 180deg 翻轉
    if (arrowContainer) {
        const icon = arrowContainer.querySelector('i');
        if (icon) {
            // 展開時 (not isHidden) 旋轉 180度，摺疊時回到 0度
            icon.style.transform = isHidden ? 'rotate(0deg)' : 'rotate(180deg)';
            icon.style.transition = 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)';
        }
    }
    
    // 🚀 3. 數據燃料自動導通
    if (!isHidden) {
        // 定位受體槽位 (Slot)
        const slot = document.getElementById(`tab-content-${id}`);
        
        // 💡 職人偵測：封殺重複點火，僅在槽位空置時執行初次數據噴發
        if (slot && slot.innerHTML.trim() === "") {
            console.log(`📡 [UI-Ignition] 文章 ${id} 導通成功，觸發原文分頁渲染...`);
            
            // 補償延遲：封殺 DOM 佈局計算未完成導致的渲染坍塌
            setTimeout(async () => {
                await this.switchArticleTab(id, '原文');
            }, 50); // 提升至 50ms 確保移動端視覺流暢
        }
    }
    
    // 🚀 4. 觸覺反饋導通
    if (navigator.vibrate) navigator.vibrate(8);
},

/** ↔️ 分頁切換發動機 (V2026.ULTRA 邏輯解耦版) */
async switchArticleTab(articleId, tabName, activeTier = 'ALL') {
    const container = document.getElementById(`tab-content-${articleId}`);
    if (!container) return;

    try {
        // 🚀 1. 數據採集：從磁區提取真值
        const item = await dbManager.get(dbManager.STORES.TRANS_VAULT, articleId);
        if (!item) throw new Error("DATA_NOT_FOUND");
        
        // 🚀 2. 視圖狀態鎖定：交由 View 衛星執行 CSS 切換
        if (window.translationView) {
            translationView.updateTabUI(articleId, tabName);
        }

        // 🚀 3. 渲染分流
        if (tabName === '原文') {
            container.innerHTML = translationView._renderOriginalTab(item);
        } else {
            // 處理教材模式數據過濾
            const tabKeyMap = { '單字': 'edu_vocab', '文法': 'edu_grammar', '測驗': 'edu_quiz', '聽力': 'edu_listening' };
            let eduData = item[tabKeyMap[tabName]] || [];
            if (activeTier !== 'ALL') {
                eduData = eduData.filter(d => d.level === activeTier);
            }
            
            // 叫視圖衛星噴發教材 HTML
            container.innerHTML = translationView._renderEduTabWrapper(articleId, tabName, eduData, activeTier);
        }

    } catch (err) {
        console.error("❌ [Tab-Switch-Collapse]:", err);
        if (window.uiManager) uiManager.showToast('⚠️', "數據路網對焦異常");
    }
},

/** 🛰️ [Mode-Router] 執行分頁切換導航 (V2026.ULTRA.STABLE_ANCHOR) */
async switchEduPage(type, itemId, tier, page) {
    console.log(`📡 [Page-Router] 執行分流翻頁: ${type} | P${page} | Tier: ${tier}`);
    
    try {
        // 🚀 1. 數據採集
        const item = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        if (!item) throw new Error("DATA_NOT_FOUND");

        // 🚀 2. 視圖重連：改用 Wrapper 確保等級 Tabs 不會被切除
        if (window.translationView) {
            const tabKeyMap = { '單字': 'edu_vocab', '文法': 'edu_grammar', '測驗': 'edu_quiz', '聽力': 'edu_listening' };
            const eduData = item[tabKeyMap[type]] || [];

            // 💡 關鍵焊接：呼叫 Wrapper 而非直接噴發 Content
            // 這樣生成的 HTML 才會包含 [等級 Tabs (All-N1)] + [當前分頁卡片]
            const fullHtml = translationView._renderEduTabWrapper(itemId, type, eduData, tier, page);
            
            const container = document.getElementById(`tab-content-${itemId}`);
            if (container) {
                container.innerHTML = fullHtml;
                // 物理滾動：對焦回教材頂部
                container.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
        
        if (navigator.vibrate) navigator.vibrate(8);
    } catch (err) {
        console.error("❌ [Page-Switch-Collapse]:", err);
    }
},

/** 🧬 [Private] 輔助：轉換類型為磁區 Key */
_getTabKey(type) {
    const map = { '單字': 'vocab', '文法': 'grammar', '測驗': 'quiz', '聽力': 'listening' };
    return map[type] || 'vocab';
},

/** 🧬 子程序：單字辨析數據提取 (自動 Ruby 化 - V2026.ULTRA.CROSS-WELD) */
_extractVocabComparison(item, itemId) {
    let word, reading, trans;
    if (Array.isArray(item)) [word, reading, , , , trans] = item;
    else if (item.data) [word, reading, , , , trans] = item.data;
    
    // 🚀 數據精煉：標題執行 Ruby 渲染，達成漢字平假名對位
    const rubyTitle = `<ruby>${word}<rt class="text-[10px] opacity-50">${reading || ''}</rt></ruby>`;
    
    // 語義預處理：提取括號內的語境提示
    const contextHint = trans 
        ? (trans.match(/[（(](.*?)[）)]/) ? trans.match(/[（(](.*?)[）)]/)[1] : trans.split(/[（(]/)[0]) 
        : "基礎語義";
    
    const anchorId = `card-單字-${item._originalIdx || 0}-${itemId}`;
    
    // 🚀 核心對焦：_renderComparisonItem 在 View 裡面，物理指向 translationView
    // 💡 職人診斷：封殺 this 偏移，直接將精煉好的燃料送往 View 層組裝
    if (window.translationView && window.translationView._renderComparisonItem) {
        return window.translationView._renderComparisonItem(rubyTitle, contextHint, anchorId);
    } else {
        console.error("❌ [Engine-Relay-Collapse] 找不到 translationView._renderComparisonItem");
        return `<div class="p-4 bg-slate-50 rounded-2xl">${word} - ${contextHint}</div>`;
    }
},


/** 🧬 內部邏輯：碰撞偵測分析 (封殺無意義清單) */
_detectSemanticCollisions(group, type) {
    const collisions = {};
    group.forEach(item => {
        // 提取核心義 (移除括號內容)
        let rawMeaning = (type === '單字') 
            ? (Array.isArray(item) ? item[5] : (item.data ? item.data[5] : item.trans)) 
            : item.point;
            
        if (!rawMeaning) return;
        // 取得「(」之前的核心中文定義作為碰撞 Key
        const coreKey = rawMeaning.split(/[（(]/)[0].trim();

        if (!collisions[coreKey]) collisions[coreKey] = [];
        collisions[coreKey].push(item);
    });

    // 💡 職人診斷：只保留真正產生碰撞的群組 (數量 > 1)
    return Object.fromEntries(
        Object.entries(collisions).filter(([_, items]) => items.length > 1)
    );
},


/** 🧬 子程序：文法辨析數據提取 (V2026.ULTRA.ENGINE_RELAY) */
_extractGrammarComparison(item, itemId) {
    // 🚀 數據精煉：提取文法點與純淨語義
    const pointName = item.point || '未知文法';
    const meaning = (item.meaning || "").replace(/<[^>]*>/g, ""); // 物理洗滌 HTML 標籤
    const anchorId = `card-文法-${item._originalIdx || 0}-${itemId}`;
    
    // 🚀 核心對焦：_renderComparisonItem 在 View 裡面，物理指向 translationView
    // 💡 職人診斷：數據引擎在此完成精煉，並將燃料包移交至視圖總線進行封裝
    if (window.translationView && window.translationView._renderComparisonItem) {
        return window.translationView._renderComparisonItem(pointName, meaning, anchorId);
    } else {
        console.error("❌ [Engine-Grammar-Relay] 找不到 translationView._renderComparisonItem");
        return `
            <div class="p-4 border border-dashed border-slate-200 rounded-2xl">
                <span class="font-black text-slate-700">${pointName}</span>
                <p class="text-xs text-slate-400">${meaning}</p>
            </div>`;
    }
},

/** 🧹 執行：教材單項物理回收 (影子磁區連鎖切除版) */
async deleteEduItem(articleId, typeName, index) {
    // 🚀 核心 A：封殺 window.confirm (Anti-Redundancy)
    // 💡 職人診斷：既然已由 renderMiniConfirm 氣泡攔截，此處嚴禁再次詢問。
    
    try {
        // 1. 物理定位磁區
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, articleId);
        const tabKeyMap = { 
            '單字': 'edu_vocab', 
            '文法': 'edu_grammar', 
            '測驗': 'edu_quiz', 
            '聽力': 'edu_listening' 
        };
        const storageKey = tabKeyMap[typeName];

        if (record && record[storageKey]) {
            // 🚀 2. 影子座標定位 (Shadow Target Identification)
            // 💡 職人診斷：在物理切除前，先計算該項目在 SRS 軌道上的唯一 ID
            // 指紋協定：[ParentID]_[Timestamp]_[Index]
            const targetItem = record[storageKey][index];
            const shadowId = this._resolveShadowId(articleId, targetItem, index, typeName);

            // 🚀 3. 執行「連鎖切除」協定
            // 💡 同時抹除：原始燃料包 + 影子特訓指紋
            record[storageKey].splice(index, 1);
            
            // 執行物理抹除事務 (Atomic Transaction Logic)
            const promises = [
                dbManager.put(dbManager.STORES.TRANS_VAULT, record) // 更新原始磁區
            ];

            // 僅「單字」與「文法」具備影子軌道，執行額外回收
            if (shadowId && (typeName === '單字' || typeName === '文法')) {
                promises.push(dbManager.delete(dbManager.STORES.SRS_META, shadowId));
            }

            await Promise.all(promises);
            
            // 4. 空間自動回收
            if (record[storageKey].length === 0) {
                // 若該類別燃料已全數耗盡，物理切除該欄位以保持 JSON 純淨
                const freshRecord = await dbManager.get(dbManager.STORES.TRANS_VAULT, articleId);
                delete freshRecord[storageKey];
                await dbManager.put(dbManager.STORES.TRANS_VAULT, freshRecord);
            }

            // 🚀 5. 狀態機同步 (State Calibration)
            if (window.state?.translationVault) {
                const sIdx = window.state.translationVault.findIndex(it => it.id === articleId);
                if (sIdx !== -1) window.state.translationVault[sIdx] = { ...record };
            }

            // 6. 反饋導通
            uiManager.showToast('🧹', `${typeName} 燃料與影子指紋已回收`);
            
            // 🚀 7. 視圖自動重對焦 (View Re-focus)
            await this.switchArticleTab(articleId, typeName);
            
            if (navigator.vibrate) navigator.vibrate([10, 30]);
            console.log(`💾 [Chain-Reclaim-Success] 原始 ID: ${articleId} | 影子 ID: ${shadowId || 'None'}`);
        }
    } catch (err) {
        console.error("❌ [Edu-Reclaim-Collapse]:", err);
        uiManager.showToast('⚠️', "磁區回收程序異常");
    }
},

/** 🧬 [Private] 影子 ID 解析器 (ID Resolver) */
_resolveShadowId(parentId, item, index, typeName) {
    // 💡 職人診斷：此處邏輯需與 _projectToSRSShadow 的生成協定 100% 對焦
    // 若注入時使用了 `${itemId}_${Date.now()}_${idx}`，刪除時需透過 parentId 檢索影子磁區
    // 或是更穩健的做法：在原始燃料中預埋 shadowId 指紋 (待後續優化)
    // 目前採用「模糊匹配回收」或是根據存檔時的 ID 協定進行定位。
    
    // 暫行方案：若數據中已有 ID 則直接回傳，否則回傳 null 由主程序決定是否執行 delete
    return item.id || null; 
},

/** 🎙️ [Education] 品詞語法機制調度 (V2026.ULTRA.FINAL 符號自癒版) */
showPosGuide(pos) {
    // 🚀 1. 數據純化：去除雜質並執行別名導通
    const rawPOS = String(pos || "").trim();
    const targetKey = aliasMap[rawPOS] || rawPOS;
    
    // 🚀 2. 磁區採集：從 posLibrary 提取燃料包
    const info = posLibrary[targetKey] || { 
        title: rawPOS, 
        desc: '<p class="text-[13.5px] leading-relaxed">此品詞具備特定的接續規則與語義對焦功能，建議透過例句觀察其在句子中的位置。</p>', 
        tag: '通用模組' 
    };

    // 🚀 3. 物理洗滌：確保標題與顯示文字統一使用標準中點「・」，封殺斜線「/」
    // 💡 職人診斷：這能解決 AI 產出不同符號格式導致的視覺不對稱
    const displayTitle = String(info.title).replace(/\//g, '・');
    const displayTag = String(info.tag).replace(/\//g, '・');

    // 🚀 4. 視圖組裝 (HTML 結構優化)
    const content = `
        <div class="space-y-6 animate-fade-in">
            <div class="flex items-center gap-3">
                <span class="px-3 py-1 bg-pink-50 theme-text-pink text-[10px] font-black rounded-lg uppercase tracking-wider border border-pink-100">
                    ${displayTag}
                </span>
            </div>
            
            <div class="p-6 bg-slate-50 rounded-[2.2rem] border border-slate-100 text-slate-600 shadow-inner">
                <h5 class="font-black text-slate-800 text-[16px] mb-3 flex items-center gap-2">
                    <i class="fa-solid fa-bookmark text-pink-300 text-xs"></i>
                    ${displayTitle}
                </h5>
                <div class="font-medium text-justify">
                    ${info.desc}
                </div>
            </div>
            
            <p class="text-[10px] text-slate-300 italic text-center px-4 leading-relaxed">
                Tip: 點擊品詞說明可協助預判動詞「て形」或「ます形」的變化邏輯。
            </p>
        </div>
    `;

    // 🚀 5. 實體彈窗點火
    modalEngine.create(
        'pos-guide-modal', 
        `📖 品詞語義對焦：${displayTitle}`, 
        content, 
        `<button onclick="App.modalRemove('pos-guide-modal')" class="w-full py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-100 transition-transform active:scale-[0.98]">
            收下職人筆記
        </button>`
    );
    
    // 觸覺回饋
    if (navigator.vibrate) navigator.vibrate(8);
},



/** 🎯 [Logic] 品詞語義對焦發動機 (V2026.ULTRA.FINAL) */
focusPOS(rawPOS) {
    if (!rawPOS) return '未知品詞';
    
    // 🚀 1. 數據純化：去除前後空格、封殺隱形雜質
    const cleanPOS = String(rawPOS).trim();
    
    // 🚀 2. 執行別名導通 (Alias Conduction)
    // 💡 職人診斷：若 rawPOS 是 "動五"，會被轉換為 "五段動詞"
    const standardName = aliasMap[cleanPOS] || cleanPOS;

    // 🚀 3. 真值驗證 (Truth Calibration)
    // 💡 職人診斷：檢查導通後的名稱是否在我們的數據庫中，若無則標記為通用模組
    if (!posLibrary[standardName]) {
        console.warn(`📡 [POS-Focus-Miss] 未知品詞指紋: ${cleanPOS} -> ${standardName}`);
    }

    return standardName;
},

/** 🎯 [Logic] UI 標籤精簡發動機 (V2026.ULTRA.FINAL_MINIMAL) */
getShortPOS(rawPOS) {
    if (!rawPOS) return '品詞';
    
    // 1. 先透過 aliasMap 導通為標準全名 (確保數據一致性)
    const standard = aliasMap[rawPOS.trim()] || rawPOS.trim();
    
    // 2. 逆向映射：定義 UI 顯示用的極簡標籤 (封殺長字串導致的 UI 塌陷)
    const shortMap = {
        // --- 動詞類 ---
        'サ變動詞': 'サ變',
        '五段動詞': '動五',
        '下一段動詞': '下一',
        '上一段動詞': '上一',
        '力變動詞': '力變',
        
        // --- 形容詞類 ---
        'い形容詞': '形一',
        'な形容詞': '形二',
        
        // --- 靜態與零件類 ---
        '名詞': '名',
        '名・他サ': '名サ', // 🚀 關鍵對焦：將「名・他サ」精簡為「名サ」
        '代名詞': '代名',
        '副詞': '副',
        '助詞': '助',
        '助動詞': '助動',
        '接續詞': '接續',
        '連體詞': '連體',
        '感動詞': '感動',
        
        // --- 旅遊高頻零件 ---
        '外來語': '外來',
        '接頭詞': '頭',
        '接尾詞': '尾'
    };

    // 🚀 核心焊接：若命中 map 則精簡
    const result = shortMap[standard] || standard;

    // 💡 職人診斷：若結果仍超過 4 字（如某些特殊複合品詞），執行物理切除
    // 優先保留前 3 碼，確保在窄窄的卡片標籤內不溢出
    return result.length > 4 ? result.substring(0, 3) : result;
},


/** 🧬 輔助：正則安全脫殼 */
_escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
},

/** 🎙️ [Education] 點亮重音機制教學 (V2026.ULTRA.VISUAL_PITCH) */
showAccentGuide() {
    const content = `
        <div class="space-y-6 text-slate-700">
            <p class="text-[13px] leading-relaxed">
                日文重音決定了語句的「波長」。請記住核心物理限制：<br>
                <span class="text-rose-500 font-black">●</span> <b>第 1 與第 2 音階高低必定相反</b><br>
                <span class="text-rose-500 font-black">●</span> <b>一個單字內只會有一處高音峰值</b>
            </p>
            
            <div class="grid grid-cols-1 gap-4">
                <div class="p-5 bg-blue-50/50 rounded-3xl border border-blue-100">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="font-black text-blue-600 text-[14px]">0 [平板型] Heiban</h5>
                        <div class="flex gap-1">
                            <div class="w-3 h-2 bg-slate-200 rounded-full mt-2"></div>
                            <div class="w-3 h-2 bg-blue-500 rounded-full"></div>
                            <div class="w-3 h-2 bg-blue-500 rounded-full"></div>
                            <div class="w-3 h-2 border-2 border-blue-500 rounded-full"></div>
                        </div>
                    </div>
                    <p class="text-[12px] opacity-80 leading-relaxed">
                        第 1 音低，第 2 音起持續高音。<br>
                        <b class="text-blue-700">物理特性：</b>能量平穩導通，<span class="font-bold underline">助詞不下降</span>。
                    </p>
                </div>

                <div class="p-5 bg-rose-50/50 rounded-3xl border border-rose-100">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="font-black text-rose-600 text-[14px]">1 [頭高型] Atamadaka</h5>
                        <div class="flex gap-1">
                            <div class="w-3 h-2 bg-rose-500 rounded-full"></div>
                            <div class="w-3 h-2 bg-slate-200 rounded-full mt-2"></div>
                            <div class="w-3 h-2 bg-slate-200 rounded-full mt-2"></div>
                        </div>
                    </div>
                    <p class="text-[12px] opacity-80 leading-relaxed">
                        第 1 音最高，第 2 音起立即墜毀。<br>
                        <b class="text-rose-700">物理特性：</b>最強的下降極性，聽感最突兀。
                    </p>
                </div>

                <div class="p-5 bg-emerald-50/50 rounded-3xl border border-emerald-100">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="font-black text-emerald-600 text-[14px]">2,3... [中高型] Nakadaka</h5>
                        <div class="flex gap-1">
                            <div class="w-3 h-2 bg-slate-200 rounded-full mt-2"></div>
                            <div class="w-3 h-2 bg-emerald-500 rounded-full"></div>
                            <div class="w-3 h-2 bg-slate-200 rounded-full mt-2"></div>
                        </div>
                    </div>
                    <p class="text-[12px] opacity-80 leading-relaxed">
                        第 1 音低，中間隆起，結束前下降。<br>
                        <b class="text-emerald-700">物理特性：</b>波形像小山丘，音感最細膩。
                    </p>
                </div>

                <div class="p-5 bg-amber-50/50 rounded-3xl border border-amber-100">
                    <div class="flex justify-between items-start mb-3">
                        <h5 class="font-black text-amber-600 text-[14px]">尾高型 Odaka</h5>
                        <div class="flex gap-1">
                            <div class="w-3 h-2 bg-slate-200 rounded-full mt-2"></div>
                            <div class="w-3 h-2 bg-amber-500 rounded-full"></div>
                            <div class="w-3 h-2 bg-amber-500 rounded-full"></div>
                            <div class="w-3 h-2 bg-slate-200 rounded-full mt-2"></div>
                        </div>
                    </div>
                    <p class="text-[12px] opacity-80 leading-relaxed">
                        單字結尾維持高音，但<span class="font-bold underline">助詞（如 が）必須下降</span>。<br>
                        <b class="text-amber-700 text-[11px]">※這是區分平板型與尾高型的物理分界點。</b>
                    </p>
                </div>
            </div>
            
            <p class="text-[10px] text-slate-400 italic text-center pt-4 uppercase tracking-widest">
                Acoustic Waveform Logic Layer // V2026.ULTRA
            </p>
        </div>
    `;

    modalEngine.create('accent-guide-modal', '🎙️ 聲學對焦：重音波形說明', content, `
        <button onclick="App.modalRemove('accent-guide-modal')" class="w-full py-4 theme-bg text-white rounded-2xl font-black text-xs transition-transform active:scale-95">確認對焦</button>
    `);
},

/** 🚀 狀態控制：切換卡片編輯模式 */
toggleEditMode(itemId, idx) {
    const panel = document.getElementById(`edit-panel-${itemId}-${idx}`);
    const content = document.getElementById(`display-content-${itemId}-${idx}`);
    if (panel && content) {
        panel.classList.toggle('hidden');
        content.classList.toggle('hidden');
        if (navigator.vibrate) navigator.vibrate(5);
    }
},

/** 🧪 [Sub-Module] Ruby 物理除磁器：強化版 */
_sanitizeRubyPayload(raw) {
    if (!raw) return "";
    return raw
        .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // 移除控制字元
        .replace(/\\+\//g, "/")  // 將 \/ 物理還原為 /
        .replace(/\\+"/g, '"')   // 還原誤轉義雙引號
        .replace(/\\+'/g, "'");  // 還原誤轉義單引號
},

/** 🚀 數據持久化：儲存編輯後的內容 (V2026.ULTRA.ATOMIC_FIX) */
async saveEduEdit(itemId, tabName, idx) {
    const input = document.getElementById(`edit-input-${itemId}-${idx}`);
    if (!input || !input.value.trim()) return;

    try {
        let rawValue = input.value.trim();
        let updatedItem;

        // 🚀 核心焊接 A：物理除磁處理
        rawValue = this._sanitizeRubyPayload(rawValue);

        // 🚀 核心焊接 B：原子級解析策略 (封殺 JSON Parse 報錯)
        try {
            // 優先嘗試標準解析
            updatedItem = JSON.parse(rawValue);
        } catch (e) {
            console.warn("📡 [JSON-Manual-Fix] 標準解析失敗，執行物理換行焊接...");
            try {
                // 處理物理換行導致的崩潰
                const processed = rawValue.replace(/\n/g, "\\n").replace(/\r/g, "");
                updatedItem = JSON.parse(processed);
            } catch (e2) {
                // 🏆 最終手段：物件構造器提取 (繞過所有轉義錯誤)
                console.log("🏆 [Atomic-Extraction] 啟動終極物件提取...");
                updatedItem = (new Function(`return (${rawValue})`))();
            }
        }

        // 🚀 核心焊接 C：數據固化
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        const tabKeyMap = { '單字': 'edu_vocab', '文法': 'edu_grammar', '測驗': 'edu_quiz', '聽力': 'edu_listening' };
        const storageKey = tabKeyMap[tabName];

        if (record && record[storageKey]) {
            // 僅文法軌道執行 example 標籤自動化
            if (tabName === '文法' && updatedItem.example) {
                const raw = updatedItem.example;
                const lastIdx = raw.lastIndexOf('(') !== -1 ? raw.lastIndexOf('(') : raw.lastIndexOf('（');
                if (lastIdx !== -1) {
                    const rawJp = raw.substring(0, lastIdx).trim();
                    updatedItem.jp = rawJp.replace(/([一-龠々ヶ]+)[\(（]([ぁ-んァ-ヶー]+)[\)）]/g, '<ruby>$1<rt>$2</rt></ruby>');
                    updatedItem.cn = raw.substring(lastIdx + 1).replace(/[\)）]/g, '').trim();
                }
            }

            // 寫入磁區真值
            record[storageKey][idx] = updatedItem;
            await dbManager.put(dbManager.STORES.TRANS_VAULT, record);
            
            // 狀態同步
            if (window.state?.translationVault) {
                const sIdx = window.state.translationVault.findIndex(it => it.id === itemId);
                if (sIdx !== -1) window.state.translationVault[sIdx] = { ...record };
            }
            
            uiManager.showToast('💾', `${tabName} 更新成功`);
            await this.switchArticleTab(itemId, tabName); 
            
        } else {
            throw new Error("STORAGE_RECORD_LOST");
        }
    } catch (err) {
        console.error("❌ [Final-Weld-Collapse]:", err);
        uiManager.showToast('⚠️', "數據指紋嚴重損毀，請確認 JSON 括號是否對位");
    }
},


/** 🚀 [Entry] 執行：增量數據投射 (任務分配重構版) */
async injectEduFuel(itemId, tabName) {
    const input = document.getElementById(`edu-fuel-input-${itemId}`);
    let rawJson = input?.value.trim();
    if (!rawJson) return uiManager.showToast('⚠️', "請注入燃料字串");

    try {
        // 1. 🚀 數據純化：物理脫殼與 JSON 修復
        const fuelBatch = this._sanitizeAndParseFuel(rawJson, tabName);
        if (!fuelBatch) throw new Error("PARSE_FAILED");

        // 2. 🚀 軌道對焦：磁區定位與加工
        const { record, storageKey, oldFuel } = await this._getTargetStorage(itemId, tabName);
        const processedFuel = this._processNewFuel(fuelBatch, tabName);

        // 3. 🚀 排重與焊接：過濾重複項並生成新指紋
        const freshItems = this._filterDuplicateFuel(processedFuel, oldFuel, tabName);

        // 4. 🚀 物理固化：寫入磁區與【影子投影】
        if (freshItems.length > 0) {
            await this._solidifyFuel(itemId, record, storageKey, oldFuel, freshItems);
            
            // 🔥 關鍵焊接：將新燃料投射至影子磁區啟動特訓計畫
            await this._projectToSRSShadow(itemId, freshItems, tabName);
            
            uiManager.showToast('✨', `成功注入 ${freshItems.length} 筆燃料`);
        } else {
            uiManager.showToast('ℹ️', "檢測到重複燃料，已攔截");
        }

        // 5. 🚀 資源回收：清理面板與視圖重連
        this._finalizeInjection(itemId, tabName, input);

    } catch (err) {
        console.error("❌ [Injection-Fail]:", err);
        uiManager.showToast('⚠️', "數據對焦失敗，請檢查格式");
    }
},

/** 🧪 [Private] 數據純化器：修復並解析 JSON */
_sanitizeAndParseFuel(rawJson, tabName) {
    const sanitized = rawJson.replace(/```json/g, '').replace(/```/g, '').replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
    
    let fuelBatch;
    try {
        fuelBatch = JSON.parse(sanitized);
    } catch (e) {
        console.warn("⚠️ [Data-Fix] 啟動自動導通修復...");
        const fixedJson = sanitized
            .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":')
            .replace(/'/g, '"')
            .replace(/,\s*([\]}])/g, '$1');
        fuelBatch = JSON.parse(fixedJson);
    }

    // 歸一化
    if (fuelBatch && !Array.isArray(fuelBatch)) {
        if (fuelBatch[tabName]) return fuelBatch[tabName];
        if (fuelBatch.data) return fuelBatch.data;
        return [fuelBatch];
    }
    return fuelBatch;
},

/** 🧪 [Private] 磁區定位器：獲取 DB 記錄與標籤軌道 */
async _getTargetStorage(itemId, tabName) {
    const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
    const tabKeyMap = { '單字': 'edu_vocab', '文法': 'edu_grammar', '測驗': 'edu_quiz', '聽力': 'edu_listening' };
    const storageKey = tabKeyMap[tabName];
    
    if (!record || !storageKey) throw new Error("TARGET_INVALID");
    
    return {
        record,
        storageKey,
        oldFuel: Array.isArray(record[storageKey]) ? [...record[storageKey]] : []
    };
},

/** 🧪 [Private] 數據加工廠：真值透傳與標籤自癒 (V2026.ULTRA.FINAL_LEVEL_FIX) */
_processNewFuel(fuelBatch, tabName) {
    const processor = _eduProcessors[tabName];
    
    // 🚀 1. 核心洗滌：封殺字串型毒素 (undefined/null 字串化)
    const cleanVal = (v) => {
        if (v === undefined || v === null) return "";
        const s = String(v).trim();
        return (s === 'undefined' || s === 'null') ? "" : s;
    };
    
    return fuelBatch
        .filter(item => item !== null && typeof item === 'object')
        .map(item => {
            // 🚀 2. 預提取原始等級指紋 (防止加工過程中遺失)
            // 💡 職人診斷：同時兼容多種標籤格式，封殺 N3 霸權
            const sourceLevel = item.level || item["level"] || item.級別 || item.data?.level;

            // 🚀 3. 執行處理器加工 (轉換為系統內部格式)
            const processed = processor(item, cleanVal);
            
            // 🛡️ 熔斷保護
            if (!processed) {
                console.warn(`⚠️ [Refinery-Miss] 燃料結構不對位:`, item);
                return null;
            }

            // 🚀 4. 等級主權導通 (Sovereignty Conduction)
            // 💡 優先序：原始數據提供的 Level > 處理器加工後的 Level > 預設 UNDEFINED
            // 這樣能確保注入 N4 燃料時，不會因為處理器預設而變成 N3
            let finalLevel = sourceLevel || processed.level || "UNDEFINED";
            
            // 物理純化：轉大寫並封殺無效格式
            processed.level = String(finalLevel).trim().toUpperCase();

            // 🚀 5. 數據完整性自癒
            // 針對單字(8元組)，若第0位元組存在但 word 屬性遺失，執行反向補齊
            if (tabName === '單字' && !processed.word) {
                processed.word = processed["0"] || "";
            }

            return processed;
        })
        .filter(Boolean);
},



/** 🧪 [Private] 排重感應器：物理比對與語義主權校準 (V2026.ULTRA.FINAL_STRICT) */
_filterDuplicateFuel(processedFuel, oldFuel, tabName) {
    if (!oldFuel || oldFuel.length === 0) return processedFuel;

    return processedFuel.filter(newItem => {
        // 🚀 執行多維深度比對，封殺語義偏移
        const isDuplicate = oldFuel.some(old => {
            try {
                // 💡 職人對焦：歸一化等級標籤，確保 'n3' === 'N3'
                const getLvl = (item) => String(item.level || item["level"] || "N3").trim().toUpperCase();
                const oldLvl = getLvl(old);
                const newLvl = getLvl(newItem);

                switch(tabName) {
                    case '單字': {
                        // 🚀 [Strict-Match] 三位元組焊接判定
                        // 同時比對：漢字(0) + 讀音(1) + 等級，三者全中才攔截
                        // 💡 理由：允許同一個漢字在不同等級、或不同讀音時重複存在
                        const oldW = String(old["0"] || old[0] || "").trim();
                        const newW = String(newItem["0"] || newItem[0] || "").trim();
                        const oldR = String(old["1"] || old[1] || "").trim();
                        const newR = String(newItem["1"] || newItem[1] || "").trim();
                        
                        return oldW === newW && oldR === newR && oldLvl === newLvl;
                    }
                    case '文法': {
                        // 比對文法點名稱與等級
                        const oldP = String(old.point || "").trim();
                        const newP = String(newItem.point || "").trim();
                        return oldP === newP && oldLvl === newLvl;
                    }
                    case '測驗': {
                        // 題目文字 100% 相同即視為重複
                        return String(old.question).trim() === String(newItem.question).trim();
                    }
                    case '聽力': {
                        // 比對提問內容與音軌文本的雙重指紋
                        return (old.pacing === newItem.pacing && old.audioText === newItem.audioText);
                    }
                    default: return false;
                }
            } catch (e) { 
                console.error("⚠️ [Duplicate-Check-Glitch]", e);
                return false; 
            }
        });

        // 🔍 [Debug-Trace] 噴發攔截日誌，確保開發者可知情
        if (isDuplicate) {
            const iden = newItem["0"] || newItem.point || newItem.question || "Unknown";
            console.warn(`🛡️ [Duplicate-Interceptor] 物理屏蔽重複燃料: [${iden}]`);
        }

        return !isDuplicate;
    });
},



/** 🧪 [Private] 物理固化：主磁區寫入與屬性主權對焦 (V2026.ULTRA.FINAL_FIX) */
async _solidifyFuel(itemId, record, storageKey, oldFuel, freshItems) {
    if (!record.id) record.id = itemId;

    // 🚀 1. 屬性對焦：在注入前，確保每一個單字卡物件都具備正確的屬性指紋
    // 💡 職人診斷：如果 freshItems 裡面的物件有 level，就用它的；沒有才退回 record.level
    const mappedFreshItems = freshItems.map(item => {
        const finalLevel = (item.level || item.級別 || record.level || "N4").toUpperCase();
        return {
            ...item,
            level: finalLevel, // 🚀 強制校準等級主權
            // 確保基本單字軌道不遺失
            word: String(item.word || "").trim(),
            reading: String(item.reading || "").trim(),
            trans: String(item.trans || "").trim()
        };
    });

    // 🚀 2. 燃料注入：合併舊數據與對焦後的新數據
    record[storageKey] = [...oldFuel, ...mappedFreshItems];
    
    // 🚀 3. 數據洗滌：封殺非法屬性
    const sanitizedRecord = JSON.parse(JSON.stringify(record));

    try {
        // 🚀 4. 實體固化至 IndexedDB (真值來源)
        await dbManager.put(dbManager.STORES.TRANS_VAULT, sanitizedRecord);
        console.log(`💾 [Solidify-Success] 磁區: ${storageKey} | 達成項目: ${freshItems.length} | 指紋對焦: ${record.level || 'AUTO'}`);

        // 🚀 5. 全域狀態重連 (State Recalibration)
        if (window.state && window.state.translationVault) {
            const vault = window.state.translationVault;
            const sIdx = vault.findIndex(it => String(it.id) === String(itemId));
            
            if (sIdx !== -1) {
                vault[sIdx] = sanitizedRecord;
            } else {
                vault.push(sanitizedRecord);
            }
        }

        return sanitizedRecord;

    } catch (err) {
        console.error("❌ [Solidify-Collapse] 物理固化墜毀:", err);
        throw err; 
    }
},

/** 🧪 [Private] 影子投射：執行陣列主權與進度繼承 (V2026.ULTRA.FIXED) */
async _projectToSRSShadow(itemId, freshItems, tabName) {
    // 🚀 核心熔斷：僅「單字」進入 SRS 特訓軌道
    if (tabName !== '單字') return;

    try {
        // 💡 職人診斷：100% 確保 freshItems 是陣列，封殺 forEach/map 崩潰
        const itemsToProcess = Array.isArray(freshItems) ? freshItems : [freshItems];

        const article = await dbManager.get(dbManager.STORES.TRANS_VAULT, itemId);
        const articleLevel = article?.level || "N4";

        const shadowPayloads = itemsToProcess.map((item, idx) => {
            const safeParentId = itemId || `pkg_${Date.now()}`;
            
            // 🚀 關鍵對焦：優先保留單字已有的 ID，若無才根據索引生成
            // 💡 這樣「編輯儲存」時才不會產生重複的影子紀錄
            const shadowId = item.id || `${safeParentId}_v_${idx}`;
            
            const finalLevel = (item.level || item.級別 || articleLevel).toUpperCase();
            const fingerprint = this._formatToShadowFingerprint ? this._formatToShadowFingerprint(item) : item;

            return {
                ...fingerprint,
                id: shadowId, 
                parentId: safeParentId,
                level: finalLevel,
                // 🚀 狀態繼承：保留原本的進度，不強行歸零
                stage: item.stage !== undefined ? item.stage : 0,
                nextReview: item.nextReview || Date.now(),
                tags: [finalLevel, 'Vocab']
            };
        });

        // 🛡️ 熔斷檢查：封殺損毀數據
        const validPayloads = shadowPayloads.filter(p => p.id && !p.id.includes('undefined'));
        if (validPayloads.length === 0) return;

        // 💾 物理固化
        await dbManager.batchPut(dbManager.STORES.SRS_META, validPayloads);
        
        console.log(`📡 [Shadow-Projection] 投影成功 | 筆數: ${validPayloads.length} | ID對位: ${validPayloads[0].id}`);

    } catch (err) {
        console.error("❌ [Shadow-Projection-Collapse]:", err);
    }
},


/** 🧪 [Private] 任務收尾：清理介面與重連視圖 */
async _finalizeInjection(itemId, tabName, inputEl) {
    this.toggleFuelPanel(itemId);
    if (inputEl) inputEl.value = "";
    await this.switchArticleTab(itemId, tabName);
},

/** 🔘 物理切換：面板展開/收合 */
toggleFuelPanel(itemId) {
    const panel = document.getElementById(`fuel-panel-${itemId}`);
    if (panel) panel.classList.toggle('hidden');
},


/** 🗑️ 物理回收：刪除單筆紀錄或文章包 */
async deleteArticleRecord(id) {
    if (!confirm("🚨 確定要從磁區物理抹除這筆數據嗎？")) return;

    try {
        if (dbManager) {
            await dbManager.delete(dbManager.STORES.TRANS_VAULT, id);
            uiManager.showToast('🧹', "燃料已物理回收");
            // 重新讀取目前的分類視圖
            const container = document.getElementById('content-container') || document.getElementById('view-container');
if (document.getElementById('translate-vault-track')) {
    this.filterTranslate('全部');
} else {
    this.loadLiveHistory('全部');
}
        }
    } catch (err) {
        console.error("❌ [Delete-Fail]", err);
        uiManager.showToast('⚠️', "數據回收受阻");
    }
},

/** 🚀 執行數據物理清理：清空全域翻譯庫 (V2026.ULTRA 磁區回收版) */
async clearTranslateVault() {
    // 🛡️ 1. 職人防禦協定：執行物理抹除前的最後確認
    if (!confirm("🚨 確定要物理抹除「全域」翻譯紀錄嗎？\n此動作將清空所有即時、語音與文章存檔，且不可復原。")) {
        return;
    }

    try {
        // 🚀 2. 核心焊接：直接對準全域翻譯磁區執行物理清空
        // 我們不使用 trips 陣列，直接調用 dbManager 
        if (!dbManager) throw new Error("DB_MANAGER_OFFLINE");

        // 💡 職人診斷：IndexedDB 雖然沒有全表 clear 函數在 dbManager 封裝裡
        // 但我們可以透過遍歷所有 ID 並執行 delete，或者在 dbManager 新增一個 clearStore 接口
        // 這裡我們採用「獲取所有 ID 並批量物理移除」的穩健作法
        const allItems = await dbManager.getAll(dbManager.STORES.TRANS_VAULT);
        
        if (allItems.length === 0) {
            uiManager.showToast('ℹ️', "磁區本來就是空的");
            return;
        }

        const deletePromises = allItems.map(item => 
            dbManager.delete(dbManager.STORES.TRANS_VAULT, item.id)
        );

        await Promise.all(deletePromises);
        
        console.log(`🧹 [Vault-Purge] 成功回收 ${deletePromises.length} 筆全域數據`);

        // 🚀 3. 視圖路網重連
        // 清空後立即觸發當前分頁刷新
        if (typeof this.filterTranslate === 'function') {
            this.filterTranslate('全部'); 
        }

        // 4. 視覺反饋歸一化
        uiManager.showToast('🧹', `已物理回收 ${deletePromises.length} 筆燃料`);

    } catch (err) {
        console.error("❌ [Vault-Purge-Collapse]:", err);
        uiManager.showToast('💥', "數據回收異常，路網受阻");
    }
},

/** ✏️ [Action] 編輯情境翻譯單句卡片 */
async editContextualItem(id) {
    try {
        const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, id);
        if (!record) return uiManager.showToast('⚠️', '找不到資料');

        const recordJson = JSON.stringify(record, null, 2);

        const content = `
            <div style="display: flex; flex-direction: column; gap: 16px;">

                <!-- 模式切換 -->
                <div style="display: flex; background: #F1EFE8; border-radius: 10px; padding: 4px; gap: 4px;">
                    <button id="ctx-tab-form" onclick="
                        document.getElementById('ctx-form-view').style.display='flex';
                        document.getElementById('ctx-json-view').style.display='none';
                        this.style.background='white'; this.style.color='#1a1a1a';
                        document.getElementById('ctx-tab-json').style.background='transparent'; document.getElementById('ctx-tab-json').style.color='#888780';
                    " style="flex:1;padding:8px;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:white;color:#1a1a1a;">
                        表單編輯
                    </button>
                    <button id="ctx-tab-json" onclick="
                        document.getElementById('ctx-form-view').style.display='none';
                        document.getElementById('ctx-json-view').style.display='flex';
                        this.style.background='white'; this.style.color='#1a1a1a';
                        document.getElementById('ctx-tab-form').style.background='transparent'; document.getElementById('ctx-tab-form').style.color='#888780';
                    " style="flex:1;padding:8px;border:none;border-radius:8px;font-size:11px;font-weight:700;cursor:pointer;background:transparent;color:#888780;">
                        JSON 編輯
                    </button>
                </div>

                <!-- 表單模式 -->
                <div id="ctx-form-view" style="display: flex; flex-direction: column; gap: 14px;">
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#888780;display:block;margin-bottom:6px;">中文原文</label>
                        <textarea id="edit-ctx-q" style="width:100%;background:#F8F7F4;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:500;color:#1a1a1a;resize:none;outline:none;min-height:70px;box-sizing:border-box;">${record.q || ''}</textarea>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#888780;display:block;margin-bottom:6px;">日文譯文</label>
                        <textarea id="edit-ctx-a" style="width:100%;background:#F8F7F4;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:500;color:#1a1a1a;resize:none;outline:none;min-height:90px;box-sizing:border-box;">${record.a || ''}</textarea>
                    </div>
                    <div>
                        <label style="font-size:11px;font-weight:700;color:#888780;display:block;margin-bottom:6px;">分類</label>
                        <input id="edit-ctx-cat" type="text" value="${record.category || '一般'}" style="width:100%;background:#F8F7F4;border:none;border-radius:10px;padding:12px;font-size:13px;font-weight:500;color:#1a1a1a;outline:none;box-sizing:border-box;">
                    </div>
                </div>

                <!-- JSON 模式 -->
                <div id="ctx-json-view" style="display: none; flex-direction: column; gap: 8px;">
                    <label style="font-size:11px;font-weight:700;color:#888780;">直接編輯 JSON</label>
                    <textarea id="edit-ctx-json" style="width:100%;background:#F8F7F4;border:none;border-radius:10px;padding:12px;font-size:11px;font-family:monospace;color:#D4537E;resize:none;outline:none;min-height:240px;box-sizing:border-box;">${recordJson}</textarea>
                </div>

            </div>
        `;

        const actions = `
            <div style="display: flex; gap: 10px;">
                <button onclick="App.modalRemove('edit-ctx-modal')" style="flex:1;padding:14px;background:#F1EFE8;color:#5F5E5A;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;">取消</button>
                <button onclick="translationEngine.saveContextualItem('${id}')" style="flex:2;padding:14px;background:#D4537E;color:white;border:none;border-radius:10px;font-size:12px;font-weight:700;cursor:pointer;">儲存</button>
            </div>
        `;

        modalEngine.create('edit-ctx-modal', '編輯翻譯', content, actions);

    } catch (err) {
        console.error('❌ [EditContextual-Fail]', err);
        uiManager.showToast('⚠️', '編輯器點火失敗');
    }
},

/** 💾 [Action] 儲存情境翻譯編輯結果 */
async saveContextualItem(id) {
    try {
        const jsonView = document.getElementById('ctx-json-view');
        const isJsonMode = jsonView?.style.display !== 'none';

        let updatedRecord;

        if (isJsonMode) {
            // JSON 模式：直接解析
            const raw = document.getElementById('edit-ctx-json')?.value.trim();
            if (!raw) return uiManager.showToast('⚠️', 'JSON 不可為空');
            updatedRecord = JSON.parse(raw);
        } else {
            // 表單模式
            const q = document.getElementById('edit-ctx-q')?.value.trim();
            const a = document.getElementById('edit-ctx-a')?.value.trim();
            const cat = document.getElementById('edit-ctx-cat')?.value.trim();
            if (!q || !a) return uiManager.showToast('⚠️', '中文與日文不可為空');
            const record = await dbManager.get(dbManager.STORES.TRANS_VAULT, id);
            updatedRecord = { ...record, q, a, category: cat || '一般' };
        }

        await dbManager.put(dbManager.STORES.TRANS_VAULT, updatedRecord);
        App.modalRemove('edit-ctx-modal');
        uiManager.showToast('✅', '已儲存');

        if (document.getElementById('translate-vault-track')) {
            this.filterTranslate('全部');
        } else {
            this.loadLiveHistory('全部');
        }

    } catch (err) {
        console.error('❌ [SaveContextual-Fail]', err);
        uiManager.showToast('⚠️', err.message.includes('JSON') ? 'JSON 格式錯誤' : '儲存失敗');
    }
},


/**情境翻譯prompt , 不是realtime翻譯prompt
/** 🚀 AI 指令引擎：V2026.ULTRA 參數導通版 (日文版) */
_getTranslateAiPrompt(val) { // 🚀 關鍵對焦：參數名改為 val 與 main.js 一致
    // 🚀 數據純化：優先使用傳入的 val，若為空才回退
    const query = (val && typeof val === 'string') ? val.trim() : "";
    
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const availableCats = trip?.translateConfig?.categories || ['交通', '用餐', '購物', '醫藥'];
    
    // 💡 根據 query 動態決定語境
    const context = query ? `針對「${query}」的情境` : `常用`;
    
    return `你是一位日語翻譯與旅遊專家。請提供 5-8 句與「日本旅遊${context}相關對話」的語句，並以 JSON 陣列格式輸出。

🚨 核心語境協定 (Politeness Protocol)：
1. **嚴禁命令句**：請使用「丁寧語」(Desu/Masu) 或「委婉請求」格式。
2. **高端旅遊語境**：語氣應專業、有禮且體貼。

🚨 數據格式規範：
1. 輸出為純 JSON，不含解釋。
2. 欄位：q (中文), a (日文全句), segments (分段對位), romaji (羅馬拼音), category (分類)。
3. **[category] 必須嚴格限制在以下標籤中：[${availableCats.join(', ')}]**。

範例：
{
  "q": "想預約今晚兩位吃水炊鍋 (對店員說)",
  "a": "今晩、水炊きを二人で予約したいのですが。",
  "segments": [["今晩", "こんばん"], ["、", ""], ["水炊", "みずた"], ["きを", ""], ["二人", "ふたり"], ["で", ""], ["予約", "よやく"], ["したいのですが。", ""]],
  "romaji": "Konban, mizutaki o futari de yoyaku shitai no desu ga.",
  "category": "${availableCats[1] || '用餐'}" 
}`;
},



// ============================================================
// 🎭 [Theatre Module] 劇場會話生產線 - 邏輯實體實作
// ============================================================



/** 🎭 [Theatre-Logic] 劇場指令合成發動機 (V2026.ULTRA.PROMPT) */
async theatreCopyPrompt() {
    const content = document.getElementById('dialogue-source-input')?.value.trim();
    const levelBtn = document.querySelector('#dialogue-level-selector .bg-slate-900');
    const actorBox = document.getElementById('dialogue-actor-setup');
    
    if (!content) return uiManager.showToast('⚠️', "請先匯入時事或文章素材");
    
    // 🚀 數據採樣
    const level = levelBtn ? levelBtn.dataset.level : 'N3';
    const actorA = JSON.parse(actorBox.dataset.aJson);
    const actorB = JSON.parse(actorBox.dataset.bJson);

    // 🚀 合成超級協定
    const fullPrompt = this._getTheatreAcousticProtocol(actorA, actorB, level, content);
    
    // 🚀 物理輸送
    try {
        await navigator.clipboard.writeText(fullPrompt);
        uiManager.showToast('🪄', `超級指令已就緒 (${actorA.name} x ${actorB.name})`);
        if (navigator.vibrate) navigator.vibrate([10, 30]);
    } catch (err) {
        uiManager.showToast('❌', "剪貼簿導通失敗");
    }
},

// ============================================================
// 🚀 [Acoustic-Weld] 物理別名橋接器 - V2026.ULTRA.FINAL
// 作用：封殺舊有命名空間的斷路風險，確保 UI 調用 100% 導通
// ============================================================

/** 🎯 轉發：指令合成舊路徑 */
copyDialoguePrompt() { 
    console.log("🔗 [Alias-Bridge] 導通 copyDialoguePrompt -> theatreCopyPrompt");
    return this.theatreCopyPrompt(); 
},

/** 🎯 轉發：點火執行舊路徑 */
executeDialogueGenerate() { 
    console.log("🔗 [Alias-Bridge] 導通 executeDialogueGenerate -> theatreCopyPrompt");
    return this.theatreCopyPrompt(); 
},

/** 🎯 轉發：數據固化舊路徑 */
importDialogueToVault() { 
    console.log("🔗 [Alias-Bridge] 導通 importDialogueToVault -> theatreImportToVault");
    return this.theatreImportToVault(); 
},

/** 🧬 [Private] 劇場專屬聲學協定合成器 (V2026.ULTRA.FINAL_STABLE_FIX) */
_getTheatreAcousticProtocol(a, b, level, content) {
    // 💡 職人診斷：動態提取人物靈魂(Traits)，徹底封殺角色偏移
    const linguisticGuard = `
🚨 【靈魂主權協定】：
1. **人格特質對位**：
   - [${a.name}]：${a.traits}
   - [${b.name}]：${b.traits}
2. **嚴禁開發語境**：絕對禁止出現「核心零件、模組、對焦、焊接」等非生活化詞彙。
3. **對話長度**：請展開一場 **4 到 6 句** 的深度互動，確保性格碰撞有足夠的物理空間。
`;

    return `你是一位精通劇場演繹與日語教學的 TravelFlow 專家。
任務：模擬兩位特定人格，針對「素材內容」展開一場深度的日文對話。

🎭 [角色 A]：${a.icon} ${a.name} (職業：${a.role})
🎭 [角色 B]：${b.icon} ${b.name} (職業：${b.role})
🎯 [難度]：JLPT ${level}

${linguisticGuard}

🚨 [核心生成協定]：
1. **職業術語對位**：對話必須體現 ${a.role} 與 ${b.role} 的視角。
2. **語氣極性校準**：請大膽使用符合人格特質的語助詞 (如：俺/だ/ぜ/わ/かしら)。
3. **素材精煉**：自然融入關鍵詞，而非生硬套用。

🚨 [格式協定]：
- 僅輸出純 JSON Array。
- 格式：[["角色名：日文內容", "中文翻譯"]]

待處理素材內容：
${content}

輸出格式參考：
[
  ["${a.name}：(根據其特質與職業發言)", "(中文翻譯)"],
  ["${b.name}：(根據其特質與職業發言)", "(中文翻譯)"],
  ["${a.name}：...", "..."]
]`;
},


/** 💾 [Theatre-Logic] 劇場數據固化閘門 (V2026.ULTRA.IDENTITY_AUTO_FOCUS) */
async theatreImportToVault() {
    const input = document.getElementById('dialogue-json-import');
    let rawStr = input?.value.trim();
    if (!rawStr) return uiManager.showToast('⚠️', "請貼入 AI 生成的燃料數據");

    try {
        // 🚀 1. 物理脫殼：解析匯入的二維陣列燃料 [ ["原文", "譯文"], ... ]
        const dialogueSegments = this._processTheatreJson(rawStr);

        // 🚀 2. 人格採樣與自癒 (核心焊接點)
        // 💡 職人診斷：如果匯入的燃料內含姓名（如：繪崎教授），我們必須優先「識字認人」
        // 從第一行原文中提取名字指紋
        const firstLine = dialogueSegments[0] ? String(dialogueSegments[0][0]) : "";
        const separatorIndex = firstLine.search(/[：:]/);
        let detectedName = "";
        
        if (separatorIndex !== -1 && separatorIndex < 15) {
            detectedName = firstLine.substring(0, separatorIndex).replace(/[*_#\s]/g, "").trim();
        }

        // 🚀 3. 聲學配置備援協定
        // 💡 若偵測到燃料自帶姓名指紋，則標記該存檔為「燃料主控」，播放時由識字器即時對位
        const actorBox = document.getElementById('dialogue-actor-setup');
        const uiActorA = JSON.parse(actorBox?.dataset.aJson || '{}');
        const uiActorB = JSON.parse(actorBox?.dataset.bJson || '{}');

        const level = document.querySelector('#dialogue-level-selector .diag-lvl-btn.theme-bg')?.dataset.level || 'N3';
        const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';

const dialoguePackage = {
    id: `diag_${Date.now()}`,
    type: 'article_package',
    title: detectedName ? `🎭 ${detectedName} 等人的劇場對話` : `🎭 ${uiActorA.name} x ${uiActorB.name}：時事劇場`,
    category: '會話', 
    lang: currentLang,
    level: level,
    tripId: window.state?.activeTripId || null, // 🚀 [新增]
    segments: dialogueSegments,
    
    acousticConfig: {
        actorA: uiActorA,
        actorB: uiActorB,
        isFuelCentric: !!detectedName
    },
    timestamp: Date.now(),
    tags: ['劇場生成', '會話', detectedName || uiActorA.name]
};

        // 🚀 4. 實體磁區固化
        await dbManager.put(dbManager.STORES.TRANS_VAULT, dialoguePackage);
        
        uiManager.showToast('✨', "劇場燃料與姓名指紋已固化");
        if (input) input.value = ""; 

        // 🚀 5. 穩壓跳轉
        setTimeout(() => {
            this.currentMode = 'filter';
            this.lockedCategory = '會話';
            this.switchRealtimeMode('filter');
            if (navigator.vibrate) navigator.vibrate([10, 30]);
        }, 200); 

    } catch (err) {
        console.error("❌ [Theatre-Import-Collapse]:", err);
        uiManager.showToast('❌', "燃料解析或基因採集異常");
    }
},

/** 🧬 [Private] 劇場 JSON 深度洗滌器 (V2026.ULTRA 結構自癒版) */
_processTheatreJson(rawStr) {
    if (!rawStr) throw new Error("EMPTY_RAW_FUEL");

    // 🚀 1. 物理脫殼：封殺 Markdown 噪音、隱形成本與前後雜質
    let cleanStr = rawStr
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();

    try {
        // 🚀 2. 執行原子級解析
        let data = JSON.parse(cleanStr);

        // 🚀 3. 結構分流對焦 (Structure Focus)
        // 💡 職人診斷：AI 有時會產出 { "dialogue": [...] } 或 { "data": [...] }
        // 這裡強制提取最深層的陣列軌道
        let targetArray = Array.isArray(data) ? data : (data.dialogue || data.data || data.segments || null);

        if (!targetArray || !Array.isArray(targetArray)) {
            // 嘗試從物件中尋找唯一的陣列欄位 (Final Fallback)
            const arrayKey = Object.keys(data).find(k => Array.isArray(data[k]));
            if (arrayKey) targetArray = data[arrayKey];
        }

        if (!targetArray) throw new Error("NO_ARRAY_FOUND");

        // 🚀 4. 數據洗滌發動機
        // 💡 職人對位：呼叫 _eduProcessors['會話'] 執行 2 元組標準化轉型
        // 格式強制轉換為：[ ["角色：原文", "譯文"], ... ]
        const refinedSegments = targetArray.map(item => {
            // 物理洗滌：封殺 undefined/null 毒素
            const processor = _eduProcessors['會話'];
            const cleanVal = (v) => String(v || "").trim();
            
            return processor(item, cleanVal);
        }).filter(Boolean); // 剔除損毀分段

        // 🛡️ 數據純度檢查：若無有效分段則斷路
        if (refinedSegments.length === 0) throw new Error("ZERO_YIELD_ERROR");

        console.log(`📡 [Theatre-Refinery] 脫殼成功 | 總產量: ${refinedSegments.length} 階分段`);
        return refinedSegments;

    } catch (err) {
        console.error("❌ [Theatre-Parser-Collapse] 結構損毀:", err);
        // 🚀 自癒轉向：若 JSON 全面坍塌，嘗試執行正則物理提取 (待開發備援)
        throw err;
    }
},

/** 🎲 [Theatre-Action] 刷新對話角色並通知視圖 (V2026.ULTRA 狀態鎖定版) */
theatreRefreshDuo() {
    // 🚀 1. 物理導通視圖引擎
    if (window.translationView && typeof translationView.refreshRandomDuo === 'function') {
        
        // 🚀 2. 執行實體採樣與重繪
        translationView.refreshRandomDuo();

        // 🚀 3. 狀態自癒：鎖定 Step 2 的難度指紋
        // 💡 職人診斷：重繪角色區時，需確保難度撥盤不會因為 DOM 異動而失去 CSS 對焦
        // 這裡主動檢查一次 UI，若無選中項則強制點亮 N3
        const activeLevel = document.querySelector('#dialogue-level-selector .diag-lvl-btn.theme-bg');
        if (!activeLevel) {
            const n3Btn = document.querySelector('#dialogue-level-selector [data-level="N3"]');
            if (n3Btn && translationView._selectDialogueLevel) {
                translationView._selectDialogueLevel(n3Btn);
            }
        }

        console.log(`🎭 [Theatre-Weld] 角色採樣完畢 | 數據指紋已固化至 DOM`);
    } else {
        console.error("❌ [View-Link-Collapse] translationView.refreshRandomDuo 斷路");
    }
},


// ============================================================
// 🔥 SRS 遺忘曲線核心發動機 (V2026.ULTRA.ALGO)
// ============================================================

/** * 艾賓浩斯能階間隔協定 (單位：分鐘)
 * Stage 0 -> 1: 1分鐘 (即刻複習)
 * Stage 1 -> 2: 30分鐘
 * Stage 2 -> 3: 12小時 (720 min)
 * Stage 3 -> 4: 1天 (1440 min)
 * Stage 4 -> 5: 2天
 * Stage 5 -> 6: 4天
 * Stage 6 -> 7: 7天
 * Stage 7 -> 8: 15天 (進入長期記憶)
 */
SRS_STAGES: [1, 30, 720, 1440, 2880, 5760, 10080, 21600],

/** 🧠 [SRS-Algo] 計算能階演進：回傳下一次複習的數據指紋 */
calculateSRS(currentId, isSuccess) {
    // 1. 🚀 物理掃描：從影子磁區緩存或 DB 提取目前狀態
    // 💡 職人診斷：若找不到 ID（新燃料），則初始化為 Stage 0
    const allShadows = JSON.parse(localStorage.getItem('tf_shadow_cache') || '[]');
    const shadow = allShadows.find(s => s.id === currentId) || { stage: 0 };
    
    let nextStage = shadow.stage || 0;

    if (isSuccess) {
        // 🎯 成功路徑：能階演進 (+1)，最高封頂於最後一階
        nextStage = Math.min(this.SRS_STAGES.length - 1, nextStage + 1);
    } else {
        // 🎯 失敗路徑：物理墜毀，能階強行回退 (降 2 階，最低歸零)
        // 💡 職人提醒：失敗不直接歸零是為了保留微弱語感，但需增加複習頻率
        nextStage = Math.max(0, nextStage - 2);
    }

    // 2. 🚀 時間座標推算
    const intervalMinutes = this.SRS_STAGES[nextStage];
    const nextReviewTs = Date.now() + (intervalMinutes * 60 * 1000);

    console.log(`🧠 [SRS-Algo] ID: ${currentId} | 判定: ${isSuccess ? '成功' : '失敗'} | 新能階: ${nextStage} | 下次冷卻: ${new Date(nextReviewTs).toLocaleString()}`);

    return {
        stage: nextStage,
        nextReview: nextReviewTs
    };
},

/** 🔄 [Projection-Tool] 燃料指紋化：數據純化與等級主權焊接版 (V2026.ULTRA.FINAL) */
_formatToShadowFingerprint(item) {
    // 🚀 1. 核心數據提領 (深度對焦混合物件)
    // 優先權：數字 Key "0" > 標準屬性 word > 語句 q
    const word = item["0"] || item.word || item.q || item.title || "未命名燃料";
    const reading = item["1"] || item.reading || item.romaji || "";
    
    // 🚀 2. 等級指紋強效採集 (徹底封殺 N3 霸權)
    // 優先序：1. item.level (新 JSON 屬性) -> 2. item["level"] -> 3. 預設 N3
    // 💡 職人診斷：不再盲目歸類 N3，確保 N4/N2 指紋具備導通主權
    let rawLevel = item.level || item["level"] || "N3";
    let sanitizedLevel = String(rawLevel).trim().toUpperCase();

    // 🛡️ 級別熔斷防禦
    if (!['N1','N2','N3','N4','N5'].includes(sanitizedLevel)) {
        sanitizedLevel = 'N3'; 
    }

    // 🚀 3. 影子格式封裝 (不含 ID，ID 由 _projectToSRSShadow 統籌焊接)
    // 💡 職人提醒：移除 return 中的 id: item.id，封殺 undefined ID 造成的磁區墜毀
    return {
        word: String(word).substring(0, 50),
        reading: reading,
        level: sanitizedLevel,             // 🔐 確保 N4 等級指紋精確投影
        stage: 0, 
        nextReview: Date.now(),            
        type: item["0"] ? '單字' : '文法'
    };
},

/** 🔄 [Shadow-Projection] 執行指紋投射：呼叫洗滌器並物理寫入 DB */
async syncToShadow(item) {
    if (!item || !item.id) return;

    try {
        // 🚀 1. 呼叫您現有的洗滌器進行燃料指紋化
        const shadowFingerprint = this._formatToShadowFingerprint(item);

        // 🚀 2. 物理固化：直接寫入 dbManager 的影子磁區
        await dbManager.batchPutSRS([shadowFingerprint]);
        
        console.log(`📡 [Shadow-Weld] 指紋投射成功: ${shadowFingerprint.word}`);
        return shadowFingerprint;
    } catch (err) {
        console.error("❌ [Shadow-Projection-Collapse]:", err);
    }
},

/** 💧 [Hydration-ULTRA-Final] 終極真值提領：封殺索引位移與混合結構 */
async getHydratedTrainingItem(id) {
    try {
        const vMarker = "_v_";
        const vIndexPos = id.lastIndexOf(vMarker);
        
        // 1. 軌道 A：非複合 ID 處理
        if (vIndexPos === -1) {
            const fuel = await dbManager.get(dbManager.STORES.TRANS_VAULT, id);
            return fuel ? { 
                word: fuel.q || "", 
                reading: "", 
                translation: fuel.a || "",
                audioText: fuel.q || "" // 🚀 顯影聲學燃料
            } : null;
        }

        // 2. 磁區拆解
        const parentId = id.substring(0, vIndexPos);
        const itemIdx = parseInt(id.substring(vIndexPos + vMarker.length));
        
        if (isNaN(itemIdx)) return null; // 🚀 物理防禦

        const parentFuel = await dbManager.get(dbManager.STORES.TRANS_VAULT, parentId);
        if (!parentFuel || !parentFuel.edu_vocab) return null;

        const v = parentFuel.edu_vocab[itemIdx];
        if (!v) return null;

        const clean = (val) => (val === undefined || val === null || val === 'undefined') ? "" : String(val).trim();
        const getF = (k) => clean(v[k] !== undefined ? v[k] : (v.data ? v.data[k] : ""));

        // 🚀 核心焊接：數據歸一化
        const word = getF("0");
        const reading = getF("1");
        const translation = getF("5");

        return {
            word: word || reading, // 🔥 職人補強：若漢字不存在，回退至讀音確保 UI 不留白
            reading: reading,
            pos: getF("2"),
            translation: translation || "無譯文數據",
            level: parentFuel.level || 'N/A',
            // 🔥 聲學關鍵：App.speak 需要純淨的語音內容，優先採信讀音軌道防止漢字破音
            audioText: reading || word 
        };
    } catch (err) {
        console.error("❌ [Hydration-Fatal]:", err);
        return null;
    }
},

/** 🧹 [Sync-Delete] 同步切除：執行原始燃料與影子指紋的雙重回收 */
async deleteEduItemWithShadow(itemId, type, index) {
    try {
        // 🚀 1. 執行原本的數據加工切除 (假設您現有的邏輯在此)
        // 💡 職人提醒：這會移除 TRANS_VAULT 裡的內容
        await this.deleteEduItem(itemId, type, index);

        // 🚀 2. 物理聯動：精確計算影子 ID 並切除
        // 影子 ID 協定：Package 級別為 itemId，單字級別通常為 ${itemId}_${index}
        const targetShadowId = (type === '單字' || type === '文法') ? `${itemId}_${index}` : itemId;
        
        await dbManager.delete('SRS_META', targetShadowId);
        
        console.log(`🧹 [Shadow-Reclaim] 影子磁區同步切除完畢: ${targetShadowId}`);
    } catch (err) {
        console.error("❌ [Sync-Delete-Fatal]:", err);
        uiManager.showToast('⚠️', '影子磁區同步切除失敗');
    }
},



// ============================================================
// 📸 [Camera & OCR Module] 影像辨識發動機 - V2026.ULTRA
// ============================================================

/** 🎥 1. 啟動相機路網導通：初始化觀景窗串流 */
async initCameraStream() {
    const video = document.getElementById('tf-camera-stream');
    const loader = document.getElementById('camera-loading');
    
    if (!video) return;

    console.log("📡 [Camera-Ignition] 啟動影像採集感應器...");

    try {
        // 🚀 物理點火：要求後置攝像頭，鎖定 1080P 等級寬頻
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
            // 物理顯現：觀景窗導通，切除 Loading 動畫
            video.classList.remove('hidden');
            if (loader) loader.classList.add('hidden');
            console.log("🏁 [Camera-Ready] 觀景窗物理對焦成功");
        };

        // 固化串流指針，以便後續關閉
        this.currentStream = stream;

    } catch (err) {
        console.error("❌ [Camera-Collapse] 影像感應器導通失敗:", err);
        uiManager.showToast('🔒', "請開啟相機權限以執行拍照翻譯");
        if (loader) loader.innerHTML = `<p class="text-[10px] text-rose-400 font-black">SENSOR_OFFLINE</p>`;
    }
},

/** 📸 2. 執行影像採集與 OCR 噴發：捕捉當前物理幀 (V2026.ULTRA 標籤感應版) */
async capturePhoto() {
    const video = document.getElementById('tf-camera-stream');
    const canvas = document.getElementById('tf-ocr-canvas');
    const sttEl = document.getElementById('stt-original');
    const ttsEl = document.getElementById('tts-target');
    const resultArea = document.getElementById('realtime-result-area');
    
    if (!video || !canvas || video.paused) return;

    // 🚀 1. 物理凍結：將 Video 幀投影至隱藏畫布
    const context = canvas.getContext('2d');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    // 🚀 2. 介面同步：切換至結果軌道
    if (resultArea) resultArea.classList.remove('hidden');
    if (sttEl) sttEl.innerText = "📸 影像解析中 (OCR Focusing)...";
    if (ttsEl) {
        ttsEl.innerText = "語義路網對焦中...";
        ttsEl.classList.add('animate-pulse');
    }
    
    // 物理觸覺反饋：快門手感類比
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);

    try {
        // 🚀 3. 數據燃料化：轉換為高品質 JPEG Base64 (0.85 壓縮比平衡頻寬與精度)
        const imageData = canvas.toDataURL('image/jpeg', 0.85);

        // 🚀 4. 點火 OCR 翻譯管線
        const translated = await this._executeVisionTranslation(imageData);

        // 🚀 5. 標籤指紋對位 (V2026.ULTRA 核心補強)
        // 💡 職人診斷：感應四撥盤鎖定狀態，確保照片自動歸類
        const targetCategory = (this.lockedCategory === '自動' || this.lockedCategory === 'AUTO') 
                               ? '一般' 
                               : this.lockedCategory;

        // 🚀 6. 數據固化焊接
        if (dbManager) {
            const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
const record = {
    id: `img_${currentLang.toLowerCase()}_${Date.now()}`,
    type: 'image',
    lang: currentLang,
    category: targetCategory,
    tripId: window.state?.activeTripId || null, // 🚀 [新增]
    原文: "[影像識別文字]",
    翻譯: translated,
    imageUrl: imageData,
    timestamp: Date.now()
};
            
            dbManager.put(dbManager.STORES.TRANS_VAULT, record)
                .then(() => console.log(`💾 [Snapshot-Solidified] 照片已存入分區: ${targetCategory}`))
                .catch(e => console.error("❌ [Image-Storage-Fail]", e));
        }

        // 7. 熱更新渲染
        if (sttEl) sttEl.innerText = `影像識別完畢 (Vision Synced)`;
        if (ttsEl) {
            ttsEl.innerText = translated;
            ttsEl.classList.remove('animate-pulse');
        }

        // 🚀 8. 聲學噴發
        if (window.audioManager) window.audioManager.speak(translated);

    } catch (err) {
        console.error("❌ [Vision-Collapse] 影像識別失敗:", err);
        if (ttsEl) {
            ttsEl.innerText = "無法解析影像文字";
            ttsEl.classList.remove('animate-pulse');
        }
        uiManager.showToast('⚠️', "影像路網異常");
    }
},

/** 🧠 3. 語義翻譯發動機 (Vision 專屬對焦版) */
async _executeVisionTranslation(base64Image) {
    const endpoint = CONFIG?.API_ENDPOINT;
    const cleanEndpoint = endpoint.endsWith('/') ? endpoint.slice(0, -1) : endpoint;
    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';

    const response = await fetch(`${cleanEndpoint}/translate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            image: base64Image, // 傳輸影像燃料
            mode: 'OCR_VISION',
            source: 'auto',
            target: (currentLang === 'EN' ? 'en-US' : 'ja-JP'),
            protocol: 'POLITE_TRAVEL_VISION'
        })
    });

    if (!response.ok) throw new Error("VISION_API_BLOCK");
    const result = await response.json();
    return result.translatedText || result.text || "解析無效";
},

/** 🛑 4. 關閉相機路網：釋放系統硬體資源 */
stopCamera() {
    if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
        this.currentStream = null;
        console.log("🧹 [Camera-Release] 影像感應器已物理中斷並回收資源");
    }
},

/** ⚡ 5. 手電筒控制 (選配：僅部分手機導通) */
async toggleCameraFlash() {
    if (!this.currentStream) return;
    const track = this.currentStream.getVideoTracks()[0];
    const caps = track.getCapabilities();
    
    if (caps.fillLightMode) {
        const currentMode = track.getSettings().fillLightMode;
        const newMode = currentMode === 'flash' ? 'off' : 'flash';
        await track.applyConstraints({ advanced: [{ fillLightMode: newMode }] });
        uiManager.showToast('⚡', `閃光燈: ${newMode === 'flash' ? '開啟' : '關閉'}`);
    } else {
        uiManager.showToast('ℹ️', "硬體不支援閃光燈控制");
    }
}

};

// 🚀 物理掛載：確保部分 legacy code 仍能感應到它
window.translationEngine = translationEngine;