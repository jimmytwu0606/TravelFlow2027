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
            console.groupCollapsed(`%c🤖 診斷報告（點擊展開）`, "color: #ec4899; font-weight: bold; background: #fdf2f8; padding: 2px 8px; border-radius: 4px;");
            console.log(`%c[原始 SSML] %c${ssml}`, "color: #888;", "color: #6366f1; font-family: monospace; font-size: 10px;");
            console.log(`%c[問題清單] %c${report.issues.join(' | ')}`, "color: #888;", "color: #ef4444; font-weight: bold;");
            if (report.fixedSsml) {
                console.log(`%c[補救 SSML] %c${report.fixedSsml}`, "color: #888;", "color: #10b981; font-family: monospace; font-size: 10px;");
                // 統計補救效果
                const origBreaks = (ssml.match(/<break/g) || []).length;
                const fixedBreaks = (report.fixedSsml.match(/<break/g) || []).length;
                console.log(`%c[補救效果] break 數量: ${origBreaks} → ${fixedBreaks} (+${fixedBreaks - origBreaks})`, 
                    "color: #f59e0b; font-weight: bold;");
            }
            // 學習歷史快照
            try {
                const history = JSON.parse(localStorage.getItem('tf_choke_history') || '[]');
                const hotTriggers = JSON.parse(localStorage.getItem('tf_hot_triggers') || '[]');
                console.log(`%c[學習庫] 累計 ${history.length} 筆窒息記錄 | 高頻詞: ${hotTriggers.join('、') || '尚無'}`, 
                    "color: #8b5cf6;");
            } catch(e) {}
            console.groupEnd();
        }

        // 🚀 5. Raw Payload (底層複核)
        console.log(`%c🛰️ Raw Payload: %c${ssml.replace(/\s+/g, ' ')}`, "color: #94a3b8; font-size: 10px;", "color: #64748b; font-size: 10px; font-family: monospace;");
        
        console.groupEnd();
    },


/** 🧪 [Acoustic-Lab] 聲學物理診斷發動機 V2.0 (自動補救 + 學習回饋版) */
_runAcousticDiagnostic(ssml) {
    const report = { 
        hasIssue: false, 
        issues: [], 
        pureText: "",
        chokedSegments: [],  // 窒息區段記錄
        fixedSsml: null      // 方案A：補救後的 SSML
    };
    
    const globalRate = parseFloat(localStorage.getItem('tf_audio_rate') || '0.95');
    const threshold = 30;

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

        if (len >= threshold) {
            report.hasIssue = true;
            report.issues.push(`窒息區段(${len}字)`);
            report.chokedSegments.push({ content, len, rate: currentRate });
            console.error(`   #${i} %c[🚨 窒息風險] %c${len}字 %c➔ Rate: ${Math.round(currentRate*100)}% | "${content.substring(0,15)}..."`, 
                "background: #ef4444; color: #fff; padding: 1px 4px; border-radius: 3px;", 
                "color: #ef4444; font-weight: bold;", "color: #94a3b8;");
        } else if (isSlowed) {
            console.log(`   #${i} %c[🐌 動態減速] %c${len}字 %c➔ Rate: ${Math.round(currentRate*100)}% | "${content.substring(0,10)}..."`, 
                "background: #3b82f6; color: #fff; padding: 1px 4px; border-radius: 3px;", 
                "color: #3b82f6; font-weight: bold;", "color: #94a3b8;");
        } else {
            console.log(`   #${i} %c[✅ 語流安全] %c${len}字 %c➔ Rate: ${Math.round(currentRate*100)}%`, 
                "background: #10b981; color: #fff; padding: 1px 4px; border-radius: 3px;", 
                "color: #10b981;", "color: #94a3b8;");
        }
    });

    if (/<prosody[^>]*>[^<]*[、。][^<]*<\/prosody>/.test(ssml)) {
        report.hasIssue = true;
        report.issues.push("Glitch標籤撕裂");
        console.warn("   ⚠️ [Glitch-Warning] 偵測到標點符號殘留在 prosody 標籤內。");
    }

    console.groupEnd();

    // 🚀 方案A：有窒息就自動補救
    if (report.chokedSegments.length > 0) {
        report.fixedSsml = this._autoFixChoked(ssml, report.chokedSegments);
        console.log(`%c🔧 [Auto-Fix] 已自動補救 ${report.chokedSegments.length} 個窒息區段`, 
            "color: #f59e0b; font-weight: bold;");
    }

    // 🚀 方案B：學習回饋
    this._learnFromChoked(report.chokedSegments);

    return report;
},

/** 🔧 [Auto-Fix] 方案A：自動補救窒息區段 */
_autoFixChoked(ssml, chokedSegments) {
    let fixed = ssml;

    chokedSegments.forEach(({ content }) => {
        // 在助詞後強制插入 break（優先切點）
        const cutPoints = [
            // 長助詞組合（優先）
            { pattern: /(について|において|によって|に関して|に対して|のために)/, pause: 180 },
            { pattern: /(ということで|ということです|ということに)/, pause: 200 },
            { pattern: /(そのため|その結果|これにより|これによって)/, pause: 200 },
            // 一般助詞
            { pattern: /([がはもをでにとも])(?![\s、。])/, pause: 150 },
        ];

        let fixedContent = content;
        let applied = false;

        for (const { pattern, pause } of cutPoints) {
            const newContent = fixedContent.replace(pattern, `$1<break time="${pause}ms"/>`);
            if (newContent !== fixedContent) {
                fixedContent = newContent;
                applied = true;
                // 每個原始區段最多切兩刀
                const breakCount = (fixedContent.match(/<break/g) || []).length;
                if (breakCount >= 2) break;
            }
        }

        if (applied) {
            // 用修正後的內容替換原始 SSML 中的對應區段
            fixed = fixed.replace(content, fixedContent);
            console.log(`%c   ✂️ 補救: "${content.slice(0,15)}..." → ${(fixedContent.match(/<break/g) || []).length} 刀`, 
                "color: #f59e0b;");
        }
    });

    return fixed;
},

/** 📚 [Learning] 方案B：學習窒息句型，存入 localStorage 回饋引擎 */
_learnFromChoked(chokedSegments) {
    if (!chokedSegments || chokedSegments.length === 0) return;

    // 從 localStorage 取出歷史記錄
    let history = [];
    try {
        history = JSON.parse(localStorage.getItem('tf_choke_history') || '[]');
    } catch(e) { history = []; }

    chokedSegments.forEach(({ content, len }) => {
        // 提取句型特徵（不存全文，只存結構指紋）
        const fingerprint = {
            len,
            triggers: (content.match(/(について|において|によって|に関して|そのため|これにより|ということ|を手がかりに|に注目し|引き起こす|にあたって|をもとに|をきっかけに|によると|とされて|とみられ|に含まれ|がわかり|ことが判明|ことがわかっ)/g) || []),
            prefix: content.slice(0, 5),
            suffix: content.slice(-5),
            full: content.slice(0, 80), // 最多存 80 字供面板顯示
            timestamp: Date.now()
        };

        // 避免重複記錄完全相同的句型
        const isDuplicate = history.some(h => h.prefix === fingerprint.prefix && h.suffix === fingerprint.suffix);
        if (!isDuplicate) {
            history.push(fingerprint);
            console.log(`%c📚 [Learning] 記錄窒息指紋: ${len}字 | 觸發詞: ${fingerprint.triggers.join('、') || '無特定'}`, 
                "color: #8b5cf6;");
        }
    });

    // 只保留最近 50 筆
    if (history.length > 50) history = history.slice(-50);
    localStorage.setItem('tf_choke_history', JSON.stringify(history));

    // 回饋給引擎：統計高頻觸發詞
    this._updateEngineFromLearning(history);
},

/** 🔄 [Engine-Feedback] 根據學習歷史動態調整引擎閾值 */
_updateEngineFromLearning(history) {
    if (!history || history.length < 3) return;

    // 統計觸發詞頻率
    const triggerCount = {};
    history.forEach(h => {
        h.triggers.forEach(t => {
            triggerCount[t] = (triggerCount[t] || 0) + 1;
        });
    });

    // 找出高頻觸發詞（出現 3 次以上）
    const hotTriggers = Object.entries(triggerCount)
        .filter(([, count]) => count >= 3)
        .sort(([, a], [, b]) => b - a)
        .map(([word]) => word);

    if (hotTriggers.length > 0) {
        localStorage.setItem('tf_hot_triggers', JSON.stringify(hotTriggers));
        console.log(`%c🔄 [Engine-Feedback] 高頻觸發詞已更新: ${hotTriggers.join('、')}`, 
            "color: #06b6d4; font-weight: bold;");
    }

    // 統計平均窒息長度，動態建議閾值
    const avgLen = history.reduce((sum, h) => sum + h.len, 0) / history.length;
    const suggestedThreshold = Math.max(8, Math.floor(avgLen * 0.6));
    
    if (suggestedThreshold !== parseInt(localStorage.getItem('tf_suggested_threshold'))) {
        localStorage.setItem('tf_suggested_threshold', suggestedThreshold);
        console.log(`%c💡 [Engine-Feedback] 建議長句閾值調整為: ${suggestedThreshold} 字（目前: 10 字）`, 
            "color: #06b6d4;");
    }
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

window.debugManager = debugManager;