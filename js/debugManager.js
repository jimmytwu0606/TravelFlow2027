/** 🛰️ [Debug-Manager] TravelFlow 系統診斷與聲學監測中樞 (V2026.ULTRA)
 * 作用：攔截系統總線數據，提供 F12 聲學物理剖析與邏輯自檢
 */

export const debugManager = {
    // 🚀 配置開關：可透過 localStorage.setItem('TF_DEBUG', 'true') 開啟
    isEnabled: localStorage.getItem('TF_DEBUG') === 'true' || location.search.includes('debug=true'),

    /** 🏁 初始化診斷中樞 */
    init() {
        if (!this.isEnabled) return;

        console.log(`%c🛰️ TravelFlow Debug Manager %c V5.0.ULTRA_CORE 導通`, 
            "background:#1e293b; color:#38bdf8; padding:5px 12px; border-radius:5px 0 0 5px; font-weight:bold;", 
            "background:#38bdf8; color:#1e293b; padding:5px 12px; border-radius:0 5px 5px 0; font-weight:bold;"
        );

        this._mountAcousticInterceptors();
        this._mountLogicWatchers();
    },

    /** 🎙️ 聲學攔截器：監控 Google TTS 總線 */
    _mountAcousticInterceptors() {
        const originalFetch = window.fetch;
        const self = this;

        window.fetch = async (...args) => {
            const response = await originalFetch(...args);
            
            // 僅攔截 Google TTS 請求
            if (args[0] && typeof args[0] === 'string' && args[0].includes('texttospeech.googleapis.com')) {
                const clonedReq = args[1];
                try {
                    const body = JSON.parse(clonedReq.body);
                    const ssml = body.input.ssml || body.input.text;
                    self._parseAcousticPayload(ssml);
                } catch (e) {
                    console.error("❌ [Debug-Acoustic-Failure] 數據剖析斷路:", e);
                }
            }
            return response;
        };
        console.log("%c✅ [Acoustic-Bus] 聲學攔截器已掛載", "color: #10b981;");
    },

/** 🧬 核心剖析引擎 V6.5 (模組化診斷與 AI 調教版) */
    _parseAcousticPayload(ssml) {
        const timeStr = new Date().toLocaleTimeString();
        console.group(`%c🔊 [Acoustic-Deep-Trace] 燃料噴發 @ ${timeStr}`, "color: #8b5cf6; font-weight: bold;");

        // 🚀 1. 執行聲學實驗室診斷 (需搭配後續子函數)
        // 💡 職人診斷：提取窒息風險、減速狀態與 Glitch 預檢報告
        const report = this._runAcousticDiagnostic(ssml);

        // 🚀 2. 節奏矩陣分析 (Temporal Hierarchy)
        const breakMatches = [...ssml.matchAll(/<break time="(\d+)ms"\s*\/>/g)];
        console.group(`%c⏱️ 節奏矩陣 (%c共 ${breakMatches.length} 處停頓%c)`, "color: #d97706;", "color: #ea580c; font-weight: bold;", "color: #d97706;");
        breakMatches.forEach((m, i) => {
            const pos = ssml.indexOf(m[0]);
            // 抓取停頓點前 20 字作為上下文，利於對焦斷路位置
            const context = ssml.substring(Math.max(0, pos - 20), pos).replace(/<[^>]*>/g, '').trim();
            const val = parseInt(m[1]);
            const color = val >= 600 ? "#ef4444" : val >= 250 ? "#f59e0b" : "#10b981";
            console.log(`   #${i+1} "...${context}" %c➤ ${val}ms`, `color: ${color}; font-weight: bold;`);
        });
        console.groupEnd();

        // 🚀 3. 語調與頻率偏移熱圖 (Prosody Heatmap)
        const prosodyMatches = [...ssml.matchAll(/<prosody ([^>]+)>(.*?)<\/prosody>/g)];
        console.group(`%c📈 語調與頻率偏移熱圖`, "color: #059669;");
        prosodyMatches.forEach((m, i) => {
            const attr = m[1];
            const content = m[2].replace(/<[^>]*>/g, '').trim();
            const pitch = (attr.match(/pitch="([^"]+)"/) || [null, '預設'])[1];
            const rate = (attr.match(/rate="([^"]+)"/) || [null, '預設'])[1];
            const contour = (attr.match(/contour="([^"]+)"/) || [null, null])[1];
            
            const isRising = pitch.includes('+') || (contour && contour.includes('+'));
            const isFalling = pitch.includes('-') || (contour && contour.includes('-'));
            const typeIcon = contour ? "🌊 [Curve]" : isRising ? "🚀 [Rise]" : isFalling ? "⚓ [Fall]" : "平穩";

            console.log(`   %c${typeIcon} %c"${content}" %c➔ %cPitch: ${contour ? 'CONTOUR' : pitch} %c| %cRate: ${rate}`,
                "color: #888; font-size: 10px;", "color: #047857; font-weight: bold; font-size: 13px;",
                "color: #94a3b8;", `background: ${isRising ? '#fee2e2' : isFalling ? '#dcfce7' : '#f1f5f9'}; color: ${isRising ? '#b91c1c' : isFalling ? '#15803d' : '#475569'}; padding: 2px 4px; border-radius: 3px;`,
                "color: #94a3b8;", "color: #2563eb; font-weight: bold;");
            if (contour) console.log(`      %c└ Contour: ${contour}`, "color: #6366f1; font-size: 10px;");
        });
        console.groupEnd();

        // 🚀 4. 輸出 AI 調教指令包 (若有異常則自動點亮)
        if (report && report.hasIssue) {
            console.groupCollapsed(`%c🤖 AI 調教建議代碼 (點擊展開複製)`, "color: #ec4899; font-weight: bold; background: #fdf2f8; padding: 2px 8px; border-radius: 4px;");
            console.log(`%c[SSML_FUEL] %c${ssml}`, "color: #888;", "color: #6366f1; font-family: monospace;");
            console.log(`%c[DIAGNOSIS] %c${report.issues.join(' | ')}`, "color: #888;", "color: #ef4444; font-weight: bold;");
            console.log(`%c[PROMPT] 請根據以上燃料與診斷結果，優化 _runRefineryEngine 的 Regex 或補償參數。`, "color: #ec4899; font-style: italic;");
            console.groupEnd();
        }

        // 🚀 5. Raw Payload (底層複核)
        console.log(`%c🛰️ Raw Payload: %c${ssml.replace(/\s+/g, ' ')}`, "color: #94a3b8; font-size: 10px;", "color: #64748b; font-size: 10px; font-family: monospace;");
        
        console.groupEnd();
    },


/** 🧪 [Acoustic-Lab] 聲學物理診斷發動機 */
    _runAcousticDiagnostic(ssml) {
        const report = { hasIssue: false, issues: [], pureText: "" };
        
        // 🚀 A. 窒息與長句自動減速探針
        const globalRate = parseFloat(localStorage.getItem('tf_audio_rate') || '0.95');
        const offsetPercent = parseInt(localStorage.getItem('tf_long_phrase_offset') || '-6');
        const threshold = 30;

        // 物理拆解段落
        const segments = [...ssml.matchAll(/(?:<prosody rate="(\d+)%">(.*?)<\/prosody>)|([^<>]+)/g)];
        
        console.group(`%c🌬️ 語流呼吸與動態對焦診斷`, "color: #0ea5e9; font-weight: bold;");
        
        segments.forEach((match, i) => {
            const rateStr = match[1];
            const content = (match[2] || match[3] || "").trim();
            if (!content || ["、", "。", "！", "？"].includes(content)) return;

            const len = content.length;
            const currentRate = rateStr ? parseInt(rateStr) / 100 : globalRate;
            const isSlowed = currentRate < globalRate;
            
            report.pureText += content;

            // 診斷指標 1: 窒息風險
            if (len >= threshold) {
                report.hasIssue = true;
                report.issues.push(`窒息區段(${len}字)`);
                console.error(`   #${i} %c[🚨 窒息風險] %c${len}字 %c➔ Rate: ${Math.round(currentRate*100)}% | "${content.substring(0,10)}..."`, 
                    "background: #ef4444; color: #fff; padding: 1px 4px; border-radius: 3px;", "color: #ef4444; font-weight: bold;", "color: #94a3b8;");
            } 
            // 診斷指標 2: 減速導通狀態
            else if (isSlowed) {
                console.log(`   #${i} %c[🐌 動態減速] %c${len}字 %c➔ Rate: ${Math.round(currentRate*100)}% | "${content.substring(0,10)}..."`, 
                    "background: #3b82f6; color: #fff; padding: 1px 4px; border-radius: 3px;", "color: #3b82f6; font-weight: bold;", "color: #94a3b8;");
            } else {
                console.log(`   #${i} %c[✅ 語流安全] %c${len}字 %c➔ Rate: ${Math.round(currentRate*100)}%`, 
                    "background: #10b981; color: #fff; padding: 1px 4px; border-radius: 3px;", "color: #10b981;", "color: #94a3b8;");
            }
        });

        // 🚀 B. 物理 Glitch 探針 (標點嵌套檢查)
        if (/<prosody[^>]*>[^<]*[、。][^<]*<\/prosody>/.test(ssml)) {
            report.hasIssue = true;
            report.issues.push("Glitch標籤撕裂");
            console.warn("   ⚠️ [Glitch-Warning] 偵測到標點符號殘留在 prosody 標籤內。");
        }

        console.groupEnd();
        return report;
    },

/** 🚀 手動啟動診斷 (由 UI 按鈕觸發) */
manualEnable() {
    if (this._isIntercepting) return; // 避免重複焊接
    
    localStorage.setItem('TF_DEBUG', 'true');
    this.isEnabled = true;
    this._mountAcousticInterceptors();
    this._isIntercepting = true;
    
    console.log("%c📡 [Debug-Active] 聲學物理剖析儀已由使用者手動導通", "color: #fbbf24; font-weight: bold;");
    uiManager.showToast('📡', '診斷總線已導通，請開啟 F12 查看');
},

    /** 🛡️ 邏輯監視器：未來可擴充測驗或翻譯邏輯監測 */
    _mountLogicWatchers() {
        // 預留位置
    }
};