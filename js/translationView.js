/**
 * 🎨 TRANSLATION VIEW ENGINE (專屬語義視圖引擎)
 * 核心版本：V2026.ULTRA.FINAL_DECOUPLED
 * 物理作用：語義數據介面化 (Linguistic UI Rendering)
 * 核心協定：
 * 1. 物理隔離：嚴禁在此處理數據邏輯，僅負責 HTML 字串生成。
 * 2. 接口歸一：外部調用統一對準 App.speak 或 App.activeTranslationEngine。
 * 3. 雙模組支撐：同步驅動「即時翻譯 (Real-time)」與「情境翻譯 (Contextual)」。
 */

import { challengeEngine } from './challengeEngine.js';

export const translationView = {

    // ============================================================
    // 🎙️ A分區：即時翻譯 (Real-time Module)
    // 負責：四向戰術撥盤、聲學/文字/影像輸入地基、結果顯示區
    // ============================================================

    renderRealtimeBase(container, activeMode) {
        // [等待函數貼入] 
        // 職人提示：此處應承載 renderRealtimeTranslation 的主骨架邏輯
    },


/** 🎙️ [Universal-Dispatcher] 即時翻譯視圖總調度 (V2026.ULTRA.FINAL 物理分流版) */
renderRealtimeTranslation(container, activeMode = 'dialogue') {
    if (!container) return;

    // 🚀 1. 語軌 DNA 識別
    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
    const isEN = (currentLang === 'EN');

    // 🚀 2. 【核心修正】主權強制移交
    // 💡 職人診斷：若檢測到英文語軌，立即停止執行後續日文邏輯，轉向英文衛星視圖
    if (isEN) {
        console.log("📡 [Dispatcher] 偵測到 EN 語軌，移交英文專屬視圖衛星...");
        if (window.en_translationView) {
            return window.en_translationView.renderRealtimeTranslation(container, activeMode);
        } else {
            console.warn("⚠️ [Dispatcher] en_translationView offline, falling back.");
        }
    }

    // --- 🇯🇵 以下為純淨日文版 (JP Track) 渲染邏輯 ---
    const themeColor = 'theme-text-pink';
    const accentClass = 'jp-theme';

    // 🚀 核心 A：物理地基佈署 (日文版)
    container.innerHTML = `
        <div class="realtime-module animate-fade-in space-y-6 px-2 pb-40 ${accentClass}">
            ${this._renderRealtimeHeader(false, themeColor)}
            ${this._renderLinguisticSwitcher('JP')} 
            
            <div id="tf-mode-selector" class="flex p-1.5 bg-slate-100/80 rounded-[2.5rem] shadow-inner backdrop-blur-sm mx-2">
                ${this._renderModeButtons(activeMode)}
            </div>

            <div id="realtime-input-sector" class="animate-fade-in">
                ${this._getModeInputTemplate(activeMode, false)}
            </div>

            <div id="realtime-result-area" class="${activeMode === 'filter' ? 'hidden' : ''}">
                ${this._renderRealtimeResultArea(false)}
            </div>

            <div id="fuel-display-stack" class="${activeMode === 'filter' ? 'block' : 'hidden'} px-2 space-y-4">
            </div>
        </div>
    `;

    // 🚀 核心 B：物理補償 (日文版)
    if (activeMode === 'text' || activeMode === 'dialogue') {
        requestAnimationFrame(() => {
            const inputId = activeMode === 'text' ? 'text-translate-input' : 'dialogue-source-input';
            const input = document.getElementById(inputId);
            if (input) input.focus();
        });
    }
    
    if (activeMode === 'camera') {
        this._handleModeTransitionEffect('camera');
    }
    
    console.log("🏁 [Dispatcher] 日文實戰視圖已導通");
},


/** 🛰️ 子函數 A：標題零件 */
_renderRealtimeHeader(isEN, themeColor) {
    return `
        <div class="header-section flex justify-between items-end px-4 pt-4">
            <div>
                <h2 class="text-xl font-black text-slate-800 tracking-tight">
                    ${isEN ? 'Speech Focus' : '即時翻譯'}
                </h2>
                <p class="text-[10px] font-black ${themeColor} uppercase tracking-widest mt-1 italic">
                    ${isEN ? 'Linguistic Study Engine' : 'Real-time Dual Engine'}
                </p>
            </div>
            <div class="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                Status: <span class="text-emerald-500">Ready</span>
            </div>
        </div>
    `;
},

/** 📑 子函數 B：模式導航按鈕 (V2026.ULTRA 劇場式四向撥盤) */
_renderModeButtons(activeMode) {
    const modes = [
        // 🚀 核心修正：聲學(voice) 撤離，劇場(dialogue) 進駐
        { id: 'dialogue', icon: '🎭', label: '劇場' }, 
        { id: 'text',     icon: '⌨️', label: '文字' },
        { id: 'camera',   icon: '📸', label: '拍照' },
        { id: 'filter',   icon: '🔖', label: '分類' }
    ];

    return modes.map(m => `
        <button onclick="App.switchRealtimeMode('${m.id}')" 
                class="flex-1 py-3 rounded-[1.5rem] text-[10px] font-black transition-all duration-300 flex flex-col items-center justify-center gap-1
                ${activeMode === m.id ? 'bg-white text-slate-800 shadow-md scale-[1.05]' : 'text-slate-400 hover:text-slate-500'}">
            <span class="text-base">${m.icon}</span> 
            <span class="tracking-tighter whitespace-nowrap">${m.label}</span>
        </button>
    `).join('');
},

/** 🧬 [Private] 模式模板分流器 (V2026.ULTRA 劇場發動機對焦版) */
_getModeInputTemplate(mode, isEN) {
    // 🚀 核心修正：移除 voice 軌道，全面重連至 dialogue 劇場軌道
    // 💡 職人診斷：確保 default 導向 dialogue，防止切換模式時 UI 產生真空
    switch (mode) {
        case 'camera': 
            return this._renderCameraInput ? this._renderCameraInput(isEN) : '<div id="camera-loading"></div>';
        case 'filter': 
            return this._renderFilterInput ? this._renderFilterInput(isEN) : '';
        case 'text':   
            return this._renderTextInput(isEN);
        case 'dialogue':
            return this._renderDialogueInput(isEN); // 🎭 焊接點：對齊新劇場輸入介面
        default:       
            return this._renderDialogueInput(isEN); // 熔斷機制：回歸劇場模式
    }
},

/** 🎭 [Theatre-View] 劇場會話生產介面 (V2026.ULTRA 全主題對焦版) */
_renderDialogueInput(isEN) {
    const duo = window.personaEngine ? personaEngine.getRandomDuo() : {
        actorA: { name: "佐藤", role: "職人", icon: "👤" },
        actorB: { name: "鈴木", role: "職人", icon: "👤" }
    };

    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

    return `
        <div class="bg-white rounded-[3.5rem] p-8 border border-slate-50 shadow-2xl space-y-10 animate-fade-in relative overflow-hidden text-left">
            
            <div class="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none theme-text-pink">
                <i class="fa-solid fa-masks-theater text-9xl"></i>
            </div>

            <div class="space-y-3">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 1. 匯入時事或文章內容</label>
                <textarea id="dialogue-source-input" 
                          class="w-full h-32 bg-slate-50 border-none rounded-[2rem] p-6 font-bold text-[13px] text-slate-700 focus:ring-4 focus:ring-pink-50 outline-none transition-all resize-none shadow-inner custom-scrollbar" 
                          placeholder="請貼上新聞、技術文件或任何想讓角色探討的內容..."></textarea>
            </div>

            <div class="space-y-4">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 2. 目標難度對焦</label>
                <div class="grid grid-cols-5 gap-2" id="dialogue-level-selector">
                    ${levels.map(l => `
                        <button onclick="translationView._selectDialogueLevel(this)" 
                                data-level="${l}"
                                class="diag-lvl-btn py-3.5 rounded-2xl font-black text-[12px] transition-all border 
                                ${l === 'N3' ? 'theme-bg text-white border-transparent shadow-lg shadow-pink-100' : 'bg-white text-slate-300 border-slate-100 hover:border-pink-200'}">
                            ${l}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex justify-between items-center px-1">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Step 3. 劇場人格對焦</label>
                    <button onclick="App.theatreRefreshDuo()" 
                            class="text-[10px] font-black theme-text-pink hover:opacity-70 transition-all flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full">
                        <i class="fa-solid fa-dice"></i> 重新抽樣
                    </button>
                </div>
                
                <div id="dialogue-actor-setup" 
                     class="flex items-center justify-around bg-pink-50/30 rounded-[2.5rem] p-7 border border-pink-100/20 shadow-inner gap-2"
                     data-a-json='${JSON.stringify(duo.actorA)}' 
                     data-b-json='${JSON.stringify(duo.actorB)}'>
                    
                    <div class="flex flex-col items-center gap-1 text-center">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50 animate-float">${duo.actorA.icon}</div>
                        <span class="text-[11px] font-black text-slate-800 mt-2">${duo.actorA.name}</span>
                        <span class="text-[9px] font-black theme-text-pink uppercase tracking-tighter bg-white px-2 py-0.5 rounded-md shadow-sm border border-pink-50">${duo.actorA.role || '職人'}</span>
                    </div>

                    <div class="text-pink-200 text-xl animate-pulse"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>

                    <div class="flex flex-col items-center gap-1 text-center">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50 animate-float" style="animation-delay: 0.5s">${duo.actorB.icon}</div>
                        <span class="text-[11px] font-black text-slate-800 mt-2">${duo.actorB.name}</span>
                        <span class="text-[9px] font-black theme-text-pink uppercase tracking-tighter bg-white px-2 py-0.5 rounded-md shadow-sm border border-pink-50">${duo.actorB.role || '職人'}</span>
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 4. 複製超級指令</label>
                <button onclick="App.theatreCopyPrompt()" 
                        class="w-full py-5 theme-bg text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-pink-100 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                    <span>複製生成指令</span>
                    <i class="fa-solid fa-wand-magic-sparkles text-xs group-hover:rotate-12 transition-transform"></i>
                </button>
            </div>

            <div class="space-y-4 pt-4 border-t border-slate-50">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 5. 匯入結果並存檔</label>
                <textarea id="dialogue-json-import" 
                          class="w-full h-24 bg-pink-50/50 border-2 border-dashed border-pink-100 rounded-[1.5rem] p-5 font-mono text-[11px] theme-text-pink outline-none focus:ring-2 focus:ring-pink-200 transition-all" 
                          placeholder="貼上 AI 生成的對話 JSON 燃料..."></textarea>
                
                <button onclick="App.theatreImportToVault()" 
                        class="w-full py-4 bg-slate-800 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:brightness-110">
                    <i class="fa-solid fa-cloud-arrow-up"></i> 固化並送往分類磁區
                </button>
            </div>

            <p class="text-[9px] text-slate-300 text-center italic tracking-tight opacity-80">
                ※ 存檔後請至「分類」選單中點擊「🎭 會話」標籤查看成果
            </p>
        </div>
    `;
},

/** 🧬 [Advanced Module] 語義轉運站視圖 - V2026.ULTRA.LINEAR_PRODUCTION */
_renderTextInput() {
    const contexts = [
        { id: 'news',    icon: '📻', label: '新聞' },
        { id: 'article', icon: '📝', label: '散文' },
        { id: 'lyrics',  icon: '🎵', label: '歌詞' },
        { id: 'tech',    icon: '🛠️', label: '技術' }
    ];

    return `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-xl space-y-6 animate-fade-in text-left">
            
            <div class="space-y-2.5">
                <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Step 1. 選擇翻譯情境</label>
                <div id="translation-context-track" class="flex gap-2 p-1 bg-slate-50 rounded-2xl shadow-inner" data-active-ctx="news">
                    ${contexts.map(ctx => `
                        <button onclick="translationView._handleContextSwitch(this, '${ctx.id}')" 
                                class="ctx-pill flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-0.5
                                ${ctx.id === 'news' ? 'bg-white text-slate-800 shadow-sm scale-105' : 'text-slate-400'}">
                            <span class="text-sm">${ctx.icon}</span>
                            <span class="tracking-tighter">${ctx.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-2">
                <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Step 2. 貼上原文內容</label>
                <textarea id="text-translate-input" 
                          class="w-full h-28 bg-slate-50 border-none rounded-2xl p-4 font-bold text-[13px] text-slate-700 focus:ring-2 focus:ring-pink-100 outline-none transition-all resize-none shadow-inner custom-scrollbar" 
                          placeholder="請貼上您想翻譯的文章或歌詞..."></textarea>
            </div>

            <div class="space-y-2">
                <label class="block text-[11px] font-black text-slate-500 uppercase tracking-widest pl-1">Step 3. 設定翻譯風格並複製</label>
                <div class="flex items-center gap-2">
                    <div class="relative flex-1">
                        <input type="text" id="style-focus-input" 
                               class="w-full h-11 bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-xl py-2 pl-10 pr-4 font-bold text-[12px] theme-text-pink focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
                               placeholder="例如：YOASOBI 風格、憂鬱文青...">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-xs">🎨</span>
                    </div>
                    <button onclick="App.copyPromptWithContent()" 
                            class="shrink-0 w-11 h-11 theme-bg text-white rounded-xl shadow-lg active:scale-90 transition-all flex items-center justify-center text-lg border-2 border-white shadow-pink-100">
                        🪄
                    </button>
                </div>
                <p class="text-[9px] text-slate-400 font-bold px-1 italic">※ 設定風格後，點擊右邊魔法棒將指令複製給外部 AI</p>
            </div>

            <div class="h-px bg-slate-100 mx-2"></div>

            <div class="space-y-4">
                <div class="space-y-2">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 4. 匯入 AI 翻譯結果</label>
                    <button onclick="App.injectFuelFromClipboard()" 
                            class="w-full py-3 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-2xl font-black text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all border border-slate-200">
                        <span class="text-sm">📥</span>
                        <span class="tracking-widest uppercase">Import / 貼上並建立文章包</span>
                    </button>
                </div>

                <div class="space-y-2">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 5. 直接在下面出結果</label>
                    <button onclick="App.executeAdvancedTranslate()" 
                            class="w-full py-3.5 theme-bg text-white rounded-2xl font-black text-[11px] uppercase tracking-[0.2em] shadow-lg shadow-pink-100 active:scale-95 transition-all flex items-center justify-center gap-2 group">
                        <span>Translate / 執行翻譯</span>
                        <i class="fa-solid fa-bolt-lightning text-[9px] group-hover:animate-pulse"></i>
                    </button>
                </div>
            </div>
        </div>

        <div id="fuel-display-stack" class="space-y-4 mt-8"></div>
    `;
},


/** 🧬 [Private] 語境切換物理聯動 */
_handleContextSwitch(btn, ctxId) {
    const track = document.getElementById('translation-context-track');
    if (!track) return;

    // 🚀 1. 物理狀態重置
    track.querySelectorAll('.ctx-pill').forEach(b => {
        b.className = 'ctx-pill flex-1 py-3 rounded-[1.3rem] text-[11px] font-black text-slate-400 transition-all flex flex-col items-center gap-1';
    });

    // 🚀 2. 點亮目標軌道
    btn.className = 'ctx-pill flex-1 py-3 rounded-[1.3rem] text-[11px] font-black bg-white text-slate-800 shadow-sm scale-105 transition-all flex flex-col items-center gap-1';
    
    // 🚀 3. 固化狀態至磁區
    track.dataset.activeCtx = ctxId;
    
    if (navigator.vibrate) navigator.vibrate(8);
    console.log(`📡 [Context-Weld] 已切換至軌道: ${ctxId}`);
},

/** 📸 [New] 私有組件：拍照翻譯採集介面 */
_renderCameraInput(isEN) {
    const hint = isEN ? 'Scan Menus or Signs' : '請對準菜單、路牌或告示文字';
    const subHint = isEN ? 'OCR Linguistic Alignment' : 'AI 影像識別與對焦';

    return `
        <div class="bg-white rounded-[3.5rem] p-6 border border-slate-50 shadow-xl space-y-6 relative overflow-hidden animate-fade-in">
            <div id="camera-viewport" class="w-full aspect-[4/3] bg-slate-900 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center border-4 border-slate-50 shadow-inner">
                <video id="tf-camera-stream" class="w-full h-full object-cover hidden" playsinline></video>
                <canvas id="tf-ocr-canvas" class="hidden"></canvas>
                
                <div class="absolute inset-8 border-2 border-white/30 rounded-[1.5rem] pointer-events-none">
                    <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 theme-border-pink -translate-x-1 -translate-y-1 rounded-tl-lg"></div>
                    <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 theme-border-pink translate-x-1 -translate-y-1 rounded-tr-lg"></div>
                    <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 theme-border-pink -translate-x-1 translate-y-1 rounded-bl-lg"></div>
                    <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 theme-border-pink translate-x-1 translate-y-1 rounded-br-lg"></div>
                </div>

                <div id="camera-loading" class="text-center space-y-3">
                    <div class="w-10 h-10 border-4 theme-border-pink border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <p class="text-[10px] font-black text-white/40 uppercase tracking-widest">Waking Up Sensors</p>
                </div>
            </div>

            <div class="flex flex-col items-center gap-4">
                <div class="text-center">
                    <h4 class="font-black text-slate-800 text-lg">${hint}</h4>
                    <p class="text-slate-400 text-[0.8rem] font-bold mt-1">${subHint}</p>
                </div>

                <div class="flex items-center gap-6 pt-2">
                    <button onclick="App.triggerImageUpload()" 
                            class="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-all border border-slate-100">
                        📁
                    </button>
                    
                    <button onclick="App.activeTranslationEngine.capturePhoto()" 
                            class="w-20 h-20 theme-bg rounded-full flex items-center justify-center shadow-2xl shadow-pink-200 border-4 border-white active:scale-95 transition-all">
                        <span class="text-3xl text-white">📸</span>
                    </button>

                    <button onclick="App.activeTranslationEngine.toggleCameraFlash()" 
                            class="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-all border border-slate-100">
                        ⚡
                    </button>
                </div>
            </div>
        </div>
    `;
},


/** 🎯 子函數 C：結果顯示區域 (V2026.ULTRA 聲學/影像兼容版) */
_renderRealtimeResultArea(isEN) {
    const neuralLabel = isEN ? 'Linguistic Alignment' : 'AI 語義對焦結果';
    const langBadge = isEN ? 'EN' : 'JP';
    const btnText = isEN ? 'REPLAY AUDIO' : '重複播報職人發音';
    const badgeColor = isEN ? 'text-blue-400' : 'text-pink-400';

    return `
        <div id="realtime-result-area" class="hidden space-y-4 animate-slide-up px-2">
            <div class="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div class="absolute -top-4 -right-4 opacity-10 text-8xl font-black italic select-none pointer-events-none">${langBadge}</div>
                
                <p id="stt-original" class="text-slate-400 text-[0.8rem] font-bold mb-6 italic border-b border-white/10 pb-4 tracking-tight"></p>
                
                <div class="space-y-2 relative z-10">
                    <div class="flex items-center gap-2 mb-1">
                        <div class="w-1.5 h-1.5 rounded-full bg-current ${badgeColor} animate-pulse"></div>
                        <p class="text-[0.6rem] font-black ${badgeColor} uppercase tracking-[0.2em]">${neuralLabel}</p>
                    </div>
                    
                    <p id="tts-target" class="text-[1.8rem] font-medium leading-relaxed"></p>
                </div>

                <button onclick="App.repeatLastTTS()" 
                        class="mt-10 w-full py-5 bg-white/10 rounded-2xl font-black text-xs hover:bg-white/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-white/5 shadow-inner">
                    <span class="text-base">🔊</span> 
                    <span>${btnText}</span>
                </button>
            </div>
            
            <p class="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em]">
                System: <span class="text-slate-400" id="tech-stack-info">${isEN ? 'Neural Studio Learning' : 'Japan Travel Flow Core'}</span>
            </p>
        </div>
    `;
},


/** 🧪 視覺補償：處理切換模式時的動態效果 (V2026.ULTRA.FINAL 劇場對焦版) */
_handleModeTransitionEffect(activeMode) {
    // 🚀 1. 物理補償：針對不同模式執行 DOM 自動對焦
    // 💡 職人診斷：合併文字與劇場模式的聚焦邏輯，封殺 TypeError
    if (activeMode === 'text' || activeMode === 'dialogue') {
        requestAnimationFrame(() => {
            const inputId = activeMode === 'text' ? 'text-translate-input' : 'dialogue-source-input';
            const input = document.getElementById(inputId);
            if (input) {
                input.focus();
                console.log(`🎯 [UI-Focus] 已導通 ${activeMode} 輸入源`);
            }
        });
    } 
    // 🚀 2. 相機感應器延遲點火
    else if (activeMode === 'camera') {
        setTimeout(() => {
            if (window.translationEngine?.initCameraStream) {
                window.translationEngine.initCameraStream();
            }
        }, 150);
    }
    // 🚀 3. 劇場角色指紋初始化 (選配)
    else if (activeMode === 'dialogue') {
        // 💡 若有需要可以在此執行初次的隨機人物採樣
        console.log("🎭 [Dialogue-Init] 劇場軌道已點亮");
    }
    // 🚀 4. 標籤軌道狀態檢查
    else if (activeMode === 'filter') {
        console.log("🔖 [UI-Focus] 歷史磁區過濾軌道導通");
    }
},

// ==============================================
//                 會話翻譯
// ==============================================

/** 🎭 [Dialogue Module] 劇場會話生產介面 (V2026.ULTRA 視覺導通優化版) */
_renderDialogueInput(isEN) {
    const duo = window.personaEngine ? personaEngine.getRandomDuo() : {
        actorA: { name: "佐藤", role: "職人", icon: "👤" },
        actorB: { name: "鈴木", role: "職人", icon: "👤" }
    };

    const levels = ['N5', 'N4', 'N3', 'N2', 'N1'];

    return `
        <div class="bg-white rounded-[3.5rem] p-8 border border-slate-50 shadow-2xl space-y-10 animate-fade-in relative overflow-hidden text-left">
            
            <div class="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none theme-text-pink">
                <i class="fa-solid fa-masks-theater text-9xl"></i>
            </div>

            <div class="grid grid-cols-1 gap-8">
                <div class="space-y-3">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 1. 匯入素材內容</label>
                    <textarea id="dialogue-source-input" 
                              class="w-full h-32 bg-slate-50 border-none rounded-[2rem] p-6 font-bold text-[13px] text-slate-700 focus:ring-4 focus:ring-pink-50 outline-none transition-all resize-none shadow-inner custom-scrollbar" 
                              placeholder="請貼上新聞、文章或技術文件..."></textarea>
                </div>

                <div class="space-y-4">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 2. 目標難度對焦</label>
                    <div class="grid grid-cols-5 gap-2" id="dialogue-level-selector">
                        ${levels.map(l => `
                            <button onclick="translationView._selectDialogueLevel(this)" 
                                    data-level="${l}"
                                    class="diag-lvl-btn py-3.5 rounded-2xl font-black text-[12px] transition-all border 
                                    ${l === 'N3' ? 'theme-bg text-white border-transparent shadow-lg' : 'bg-slate-50 text-slate-400 border-transparent'}">
                                ${l}
                            </button>
                        `).join('')}
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex justify-between items-center px-1">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Step 3. 劇場人格對焦</label>
                    <button onclick="App.theatreRefreshDuo()" 
                            class="text-[10px] font-black theme-text-pink hover:opacity-70 transition-all flex items-center gap-1.5 bg-pink-50 px-3 py-1.5 rounded-full">
                        <i class="fa-solid fa-dice"></i> 重新抽樣
                    </button>
                </div>
                
                <div id="dialogue-actor-setup" 
                     class="flex items-center justify-around bg-pink-50/30 rounded-[2.5rem] p-8 border border-pink-100/20 shadow-inner gap-2"
                     data-a-json='${JSON.stringify(duo.actorA)}' 
                     data-b-json='${JSON.stringify(duo.actorB)}'>
                    
                    <div class="flex flex-col items-center gap-1.5 text-center flex-1">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50 animate-float">${duo.actorA.icon}</div>
                        <span class="text-[16px] font-black text-slate-800 mt-2 tracking-tight">${duo.actorA.name}</span>
                        <span class="text-[10px] font-black theme-text-pink uppercase tracking-wider bg-white px-2.5 py-1 rounded-lg shadow-sm border border-pink-50 min-w-[60px]">
                            ${duo.actorA.role || '職人'}
                        </span>
                    </div>

                    <div class="text-pink-200 text-xl animate-pulse px-2"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>

                    <div class="flex flex-col items-center gap-1.5 text-center flex-1">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50 animate-float" style="animation-delay: 0.5s">${duo.actorB.icon}</div>
                        <span class="text-[16px] font-black text-slate-800 mt-2 tracking-tight">${duo.actorB.name}</span>
                        <span class="text-[10px] font-black theme-text-pink uppercase tracking-wider bg-white px-2.5 py-1 rounded-lg shadow-sm border border-pink-50 min-w-[60px]">
                            ${duo.actorB.role || '職人'}
                        </span>
                    </div>
                </div>
            </div>

            <div class="space-y-6 pt-4 border-t border-slate-50">
                <div class="space-y-3">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 4. 複製超級指令</label>
                    <button onclick="App.theatreCopyPrompt()" 
                            class="w-full py-5 theme-bg text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-pink-100 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                        <span>複製生成指令</span>
                        <i class="fa-solid fa-wand-magic-sparkles text-xs group-hover:rotate-12 transition-transform"></i>
                    </button>
                </div>

                <div class="space-y-3">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 5. 匯入結果並固化</label>
                    <textarea id="dialogue-json-import" 
                              class="w-full h-24 bg-pink-50/50 border-2 border-dashed border-pink-100 rounded-[1.5rem] p-5 font-mono text-[11px] theme-text-pink outline-none focus:ring-4 focus:ring-pink-100/50 transition-all" 
                              placeholder="貼上 AI 生成的對話 JSON 燃料..."></textarea>
                    
                    <button onclick="App.theatreImportToVault()" 
                            class="w-full py-4 bg-slate-800 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-900">
                        <i class="fa-solid fa-cloud-arrow-up"></i> 固化並送往分類磁區
                    </button>
                </div>
            </div>

            <p class="text-[9px] text-slate-300 text-center italic tracking-tight">
                ※ 存檔後系統將自動跳轉至分類視圖並定位「# 會話」標籤。
            </p>
        </div>
    `;
},


/** 🧬 [Private] 難度撥盤切換核心 */
_selectDialogueLevel(btn) {
    document.querySelectorAll('.diag-lvl-btn').forEach(b => {
        b.className = 'diag-lvl-btn py-3 rounded-2xl bg-slate-50 text-slate-400 border border-transparent font-black text-[12px] transition-all';
    });
    btn.className = 'diag-lvl-btn py-3 rounded-2xl bg-slate-900 text-white border border-slate-900 font-black text-[12px] transition-all shadow-xl';
    if (navigator.vibrate) navigator.vibrate(5);
},

/** 🎲 [Action] 重新抽樣對話角色 (V2026.ULTRA 職業別對焦版) */
refreshRandomDuo() {
    // 🚀 1. 物理導通檢查
    const engine = window.personaEngine;
    if (!engine) {
        console.error("❌ [Persona-Link-Collapse] 找不到人格發動機");
        return;
    }

    const duo = engine.getRandomDuo();
    const container = document.getElementById('dialogue-actor-setup');
    if (!container) return;

    // 🚀 2. 數據指紋同步 (確保 Step 4 抓到正確的人)
    container.dataset.aJson = JSON.stringify(duo.actorA);
    container.dataset.bJson = JSON.stringify(duo.actorB);

    // 🚀 3. 執行局部重繪 (修正職業別顯示邏輯)
    // 💡 職人診斷：使用 duo.actor.role (職業) 與 duo.actor.name (姓名) 進行物理分流
    container.innerHTML = `
        <div class="flex flex-col items-center gap-1 text-center animate-slide-up">
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50">
                ${duo.actorA.icon}
            </div>
            <span class="text-[11px] font-black text-slate-800 mt-1">${duo.actorA.name}</span>
            <span class="text-[9px] font-black theme-text-pink uppercase tracking-tighter bg-pink-50 px-2 py-0.5 rounded-md">
                ${duo.actorA.role || '職人'} 
            </span>
        </div>

        <div class="text-slate-200 animate-pulse text-xl">
            <i class="fa-solid fa-arrow-right-arrow-left"></i>
        </div>

        <div class="flex flex-col items-center gap-1 text-center animate-slide-up">
            <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50">
                ${duo.actorB.icon}
            </div>
            <span class="text-[11px] font-black text-slate-800 mt-1">${duo.actorB.name}</span>
            <span class="text-[9px] font-black theme-text-pink uppercase tracking-tighter bg-pink-50 px-2 py-0.5 rounded-md">
                ${duo.actorB.role || '職人'}
            </span>
        </div>
    `;

    // 🚀 4. 物理觸覺反饋
    if (navigator.vibrate) navigator.vibrate([10, 30]);
    console.log(`🎭 [Persona-Sync] 已對焦：${duo.actorA.name}(${duo.actorA.role}) vs ${duo.actorB.name}(${duo.actorB.role})`);
},



/** 🎨 [Private] 分類 Tabs 渲染引擎 (V2026.ULTRA 劇場標籤導通版) */
renderCategoryTabs() {
    const container = document.getElementById('quick-category-track') || 
                      document.getElementById('category-tabs-row');

    if (!container) return;

    // 🚀 1. 物理快照回溯
    const saved = localStorage.getItem('tf_live_private_cats');
    // 💡 職人修正：在預設清單中加入「會話」標籤，確保劇場產出能被精確索引
    const defaultCats = ['一般', '會話', '交通', '用餐', '購物', '住宿', '景點', '醫藥'];
    const cats = saved ? JSON.parse(saved) : defaultCats;
    
    // 🚀 2. 跨模組狀態讀取
    const currentActive = (window.translationEngine && translationEngine.lockedCategory) 
                          ? translationEngine.lockedCategory 
                          : '自動';

    // 🚀 3. 動態標籤自癒 (Self-Healing)
    // 💡 若當前 active 標籤不在清單中（例如剛從劇場模式跳轉過來），主動將其推入顯示
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

    // 生成標籤列 (含會話標籤)
    const tabsHtml = cats.map(cat => {
        const isActive = (cat === currentActive);
        // 🎨 劇場視覺補強：若是會話標籤，可考慮加上微小的特徵
        const label = cat === '會話' ? '🎭 會話' : `# ${cat}`;
        
        return `
            <button id="tab-link-${cat}" onclick="translationEngine.lockCategory('${cat}')" 
                class="shrink-0 px-4 py-1.5 rounded-full border font-black text-[10px] transition-all active:scale-90 whitespace-nowrap 
                ${isActive ? 'theme-bg text-white border-transparent shadow-sm' : 'bg-white text-slate-400 border-slate-100'}">
                ${label}
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

    // 🚀 5. 關鍵焊接：物理對焦點火
    requestAnimationFrame(() => {
        // 處理 ID 可能包含特殊字元的情況
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


/** 🎨 [Private] 歷史小卡渲染引擎 (V2026.ULTRA 聲學與視覺加固版) */
_renderLiveHistoryCards(container, data) {
    if (!container) return;
    
    container.innerHTML = data.map(item => {
        const isExpanded = this.expandedIds?.has(item.id);
        const segments = item.segments || [[item.q || item.原文 || "", item.a || item.翻譯 || ""]];
        
        return `
        <div class="relative mb-4 bg-white rounded-[1.8rem] shadow-sm border border-slate-50 overflow-hidden transition-all">
            <div class="flex items-center gap-4 p-5 active:bg-slate-100 transition-colors cursor-pointer" 
                 onclick="translationEngine.toggleArticleExpand('${item.id}')">
                
                <div class="w-12 h-12 shrink-0 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shadow-inner">
                    ${item.type === 'article_package' ? '📄' : '💬'}
                </div>

                <div class="flex-1 min-w-0">
                    <h4 class="font-black text-slate-800 text-[15px] leading-snug truncate">
                        ${item.title || item.q || "未命名翻譯"}
                    </h4>
                    <div class="flex items-center gap-2 mt-1.5">
                        <span class="px-2 py-0.5 rounded-md bg-slate-100 text-[9px] font-black text-slate-400 uppercase tracking-tighter">${segments.length} SEG</span>
                        <span class="px-2 py-0.5 rounded-md bg-pink-50 text-[9px] font-black text-pink-400"># ${item.category || '一般'}</span>
                    </div>
                </div>

                <div class="flex items-center gap-2 border-l border-slate-100 pl-3">
                    <button onclick="event.stopPropagation(); translationEngine.editArticlePackage('${item.id}')" 
                            class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-400 hover:bg-slate-100 font-black text-[12px]">改</button>
                    <button onclick="event.stopPropagation(); translationEngine.deleteArticleRecord('${item.id}')" 
                            class="w-9 h-9 flex items-center justify-center rounded-xl text-slate-300 hover:text-pink-500 font-black text-[12px]">刪</button>
                    <div class="w-6 h-9 flex items-center justify-center text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}">▼</div>
                </div>
            </div>

            ${isExpanded ? `
                <div class="border-t border-slate-50 bg-slate-50/40 p-5 space-y-6">
                    ${segments.map((seg, idx) => {
                        const q = Array.isArray(seg) ? seg[0] : (seg.q || seg.原文 || "");
                        const a = Array.isArray(seg) ? seg[1] : (seg.a || seg.翻譯 || "");
                        
                        // 🚀 聲學對焦：對原文進行 URL 編碼以利傳輸
                        const safeQ = encodeURIComponent(q);
                        
                        return `
                            <div class="relative group active:scale-[0.99] transition-transform" 
                                 onclick="event.stopPropagation(); window.audioManager?.speak(decodeURIComponent('${safeQ}'))">
                                <div class="absolute -left-2 top-0 bottom-0 w-1 bg-pink-200 rounded-full opacity-0 group-active:opacity-100 transition-opacity"></div>
                                <div class="pl-2">
                                    <div class="text-[13px] text-slate-400 font-bold mb-1 tracking-tight italic flex justify-between">
                                        <span>SEGMENT #${idx + 1}</span>
                                        <span class="text-pink-300 text-[10px]">🔊 點擊朗讀</span>
                                    </div>
                                    <div class="text-[16px] text-slate-800 font-black leading-relaxed mb-1.5">${q}</div>
                                    <div class="text-[14px] text-slate-500 font-bold leading-normal">${a}</div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : ''}
        </div>
        `;
    }).join('');
},


/** 🎨 視覺樣式對焦器 (動態磁區感應版) */
_getCategoryStyle(category) {
    const staticMap = {
        '交通': { icon: '🚃', color: 'bg-blue-50 text-blue-500 border-blue-100' },
        '用餐': { icon: '🍱', color: 'bg-orange-50 text-orange-500 border-orange-100' },
        '購物': { icon: '🛍️', color: 'bg-emerald-50 text-emerald-500 border-emerald-100' },
        '住宿': { icon: '🏨', color: 'bg-purple-50 text-purple-500 border-purple-100' },
        '景點': { icon: '⛩️', color: 'bg-rose-50 text-rose-500 border-rose-100' }
    };
    // 🚀 核心邏輯：若不在靜態清單內，統一對位至「一般」樣式
    return staticMap[category] || { icon: '📄', color: 'bg-slate-50 text-slate-400 border-slate-100' };
},

/** 📖 [Module] 單字精煉卡片 - 主引擎 (視覺復位版) */
_renderVocabCard(v, idx, itemId) {
    const d = this._prepareVocabData(v);
    if (!d.word) return '';

    const anchorId = `card-單字-${idx}-${itemId}`;
    const levelColor = this._getTierColor(d.level);
    const editPayload = v.data ? { data: v.data, level: d.level } : { ...v, level: d.level };

    // 🚀 核心結構：維持相對定位容器，確保絕對定位的旗標與按鈕不偏移
    return `
        <div id="${anchorId}" class="bg-white p-7 pt-12 pb-10 rounded-[2.8rem] border border-slate-100 shadow-sm mb-12 animate-fade-in relative transition-all duration-300 hover:shadow-md text-left">
            
            ${this._renderVocabTopBadges(d, levelColor)}
            ${this._renderVocabActionButtons(d, itemId, idx)}
            
            <div id="display-content-${itemId}-${idx}" class="relative z-10">
                ${this._renderVocabMainHeading(d)}
                ${this._renderVocabDetailBox(d, itemId, idx)}
            </div>

            ${this._renderVocabEditPanel(itemId, idx, editPayload)}
        </div>`;
},

/** 🧬 [Private] 子程序：數據預處理 (V2026.ULTRA 物件化對焦版) */
_prepareVocabData(v) {
    // 🚀 1. 數據源降維：定位真值軌道
    const source = v.data || v;
    
    // 🚀 2. 物理採集：相容物件 Key ("0") 與陣列索引 ([0])
    // 💡 職人診斷：使用 source["0"] 確保能讀取到新設計的 JSON 結構
    const word = source["0"] || (Array.isArray(source) ? source[0] : "");
    const reading = source["1"] || (Array.isArray(source) ? source[1] : "");
    const pos = source["2"] || (Array.isArray(source) ? source[2] : "");
    const accent = source["3"] || (Array.isArray(source) ? source[3] : "");
    const tone = source["4"] || (Array.isArray(source) ? source[4] : "");
    const trans = source["5"] || (Array.isArray(source) ? source[5] : "");
    const example = source["6"] || (Array.isArray(source) ? source[6] : "");
    const exTrans = source["7"] || (Array.isArray(source) ? source[7] : "");
    
    // 🚀 3. 等級主權導通 (封殺 N? 預設)
    // 💡 優先採信 v.level (加工後的物件層級)
    const level = v.level || source.level || "N3";

    const sanitize = (str) => String(str || '').replace(/[\s\u3000]/g, '').replace(/<[^>]*>/g, '').trim();
    const cleanW = sanitize(word);
    const cleanR = sanitize(reading);
    
    const lookupPOS = window.translationEngine?.focusPOS ? window.translationEngine.focusPOS(pos) : (pos || '品詞');
    const displayPOS = window.translationEngine?.getShortPOS ? window.translationEngine.getShortPOS(lookupPOS) : lookupPOS;

    return { 
        word, reading, 
        pos: displayPOS,
        rawPOS: lookupPOS,
        accent, tone, trans, example, exTrans, 
        level: level.toUpperCase(), 
        cleanW, cleanR, 
        isRedundant: (cleanW === cleanR) || !cleanR 
    };
},

/** 🎨 [Private] 子組件：頂部標籤 (V2026.ULTRA.FINAL_SOLID 視覺復位版) */
_renderVocabTopBadges(d, levelColor) {
    // 🚀 核心 A：標籤去脂 - 將詞性與重音標籤從 py-1.5 降至 py-0.5
    // 🚀 核心 B：陰影回歸 - 將 shadow-sm 換回 shadow-md/lg 強化懸浮層次感
    return `
        <div class="absolute -top-3.5 left-5 z-50 flex items-center gap-2.5">
            <div class="relative group shadow-2xl">
                <div style="background: ${levelColor};" class="px-6 py-2.5 rounded-2xl rounded-bl-none flex items-center justify-center min-w-[75px]">
                    <span class="text-white text-[12px] font-black tracking-widest uppercase relative z-10">${d.level}</span>
                </div>
                <div style="background: ${levelColor}; filter: brightness(0.6);" class="w-3 h-3 absolute -bottom-3 left-0 [clip-path:polygon(0_0,100%_0,100%_100%)]"></div>
            </div>

            <button onclick="translationEngine.showPosGuide('${d.rawPOS}')" 
                    class="relative px-5 py-1 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-md group active:scale-95 transition-all min-w-[70px]">
                <span class="text-[11px] font-black text-slate-500 uppercase tracking-tighter block">${d.pos}</span>
                <i class="fa-solid fa-circle-info text-[8px] text-slate-300 absolute bottom-1.5 right-1.5 opacity-60"></i>
            </button>

            <button onclick="translationEngine.showAccentGuide()" 
                    class="relative px-5 py-1 bg-white/90 backdrop-blur-sm border border-slate-100 rounded-2xl shadow-md group active:scale-95 transition-all min-w-[90px]">
                <span class="text-[11px] font-black theme-text-pink uppercase tracking-tighter block">${d.accent || '0'} ${d.tone || '平板型'}</span>
                <i class="fa-solid fa-circle-question text-[9px] text-pink-100 absolute bottom-1.5 right-1.5 group-hover:theme-text-pink"></i>
            </button>
        </div>`;
},


/** 🔘 [Private] 子組件：右上角操作按鈕 (V2026.ULTRA 深度避讓版) */
_renderVocabActionButtons(d, itemId, idx) {
    // 🚀 核心 A：定義氣泡唯一物理座標
    const confirmId = `vocab-bubble-${String(itemId).replace(/[^a-zA-Z0-9]/g, '')}-${idx}`;

    // 🚀 修正：物理位移下調至 top-20，預留一個完整字級的呼吸空間
    return `
        <div class="absolute top-20 right-4 z-[5000]">
            <div class="px-2 py-1 rounded-2xl bg-white/90 border border-slate-100 shadow-md backdrop-blur-md flex gap-1 relative transition-all">
                
                <button class="w-8 h-8 rounded-xl text-slate-300 hover:text-blue-400 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-90"
                        onclick="event.stopPropagation(); translationEngine.toggleEditMode('${itemId}', ${idx})">
                    <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>

                <div class="relative flex items-center justify-center">
                    <button class="w-8 h-8 rounded-xl text-slate-300 hover:text-red-400 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-90"
                            onclick="event.stopPropagation(); this.nextElementSibling.innerHTML = translationView.renderMiniConfirm('${confirmId}', '永久移除此單字?', 'translationEngine.deleteEduItem(\\'${itemId}\\', \\'單字\\', ${idx})');">
                        <i class="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                    <div class="absolute bottom-full right-0 z-[6000]"></div>
                </div>

                <button class="w-8 h-8 rounded-xl text-slate-400 hover:theme-text-pink hover:bg-slate-50 flex items-center justify-center active:scale-90 transition-all"
                        onclick="event.stopPropagation(); translationEngine.speakSegment('${d.cleanW.replace(/'/g, "\\'")}')">
                    <i class="fa-solid fa-volume-high text-[11px]"></i>
                </button>
            </div>
        </div>`;
},

/** 🔤 [Private] 子組件：標題本文 (封殺重疊風險) */
_renderVocabMainHeading(d) {
    // 🚀 修正：增加 pr-24 確保長單字不會撞到操作按鈕，mt-14 為頂部旗標留出足夠呼吸感
    const headingHtml = d.isRedundant 
        ? d.word 
        : `<ruby>${d.word}<rt class="text-[14px] font-bold text-pink-400 mb-1">${d.reading}</rt></ruby>`;
    
    return `<h4 class="text-3.5xl font-black text-slate-800 leading-none tracking-tight pr-24 mb-10 mt-14">${headingHtml}</h4>`;
},


/** 📝 [Private] 子組件：內容盒 (校準內距與呼吸感) */
_renderVocabDetailBox(d, itemId, idx) {
    return `
        <div class="bg-pink-50/40 rounded-[2.5rem] p-7 border border-pink-100/30 transition-all">
            <p class="text-[15px] font-bold text-slate-600 leading-relaxed mb-8 pr-2">${d.trans}</p>
            <div class="w-full h-[1px] bg-white/60 mb-8"></div>
            <div class="flex gap-4 items-start">
                <button onclick="event.stopPropagation(); translationEngine.speakSegment('${d.example ? d.example.replace(/'/g, "\\'") : ''}')" 
                        class="shrink-0 w-11 h-11 rounded-full bg-white border border-pink-100 flex items-center justify-center shadow-sm active:scale-90 transition-all">
                    <i class="fa-solid fa-play text-pink-400 text-[12px] ml-0.5"></i>
                </button>
                <div class="flex flex-col gap-2 pt-0.5 text-left overflow-hidden">
                    <p class="text-[1.12rem] text-slate-800 font-medium leading-snug tracking-tight truncate-multiline">
                        ${this.highlightPoint ? this.highlightPoint(d.example || '', d.word) : (d.example || '')}
                    </p>
                    <p class="text-[13px] text-slate-400 font-bold leading-tight italic opacity-90">${d.exTrans || ''}</p>
                </div>
            </div>
        </div>`;
},

/** ✍️ [Private] 子組件：編輯面板 (風格一致化) */
_renderVocabEditPanel(itemId, idx, editPayload) {
    return `
        <div id="edit-panel-${itemId}-${idx}" class="hidden mt-4 p-4 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-slide-up">
            <textarea id="edit-input-${itemId}-${idx}" 
                      class="w-full bg-white border-none rounded-[1.8rem] p-5 text-[12px] text-slate-600 min-h-[140px] font-mono focus:ring-2 ring-pink-100 shadow-inner">${JSON.stringify(editPayload, null, 2)}</textarea>
            <div class="flex justify-end gap-2 mt-3">
                <button onclick="translationEngine.toggleEditMode('${itemId}', ${idx})" class="px-4 py-2 text-[11px] font-bold text-slate-400">取消</button>
                <button onclick="translationEngine.saveEduEdit('${itemId}', '單字', ${idx})" class="px-5 py-2 text-[11px] font-black theme-bg text-white rounded-xl shadow-md">儲存燃料</button>
            </div>
        </div>`;
},


/** ⚖️ [Module] 文法精煉卡片：主引擎 (V2026.ULTRA 編輯導通修正版) */
_renderGrammarCard(g, idx, itemId) {
    const anchorId = `card-文法-${idx}-${itemId}`;
    const level = g.level || 'N?';
    const activeColor = this._getTierColor(level);
    
    // 🚀 數據加工：確保編輯燃料完整
    const editPayload = { 
        point: g.point, 
        level: g.level, 
        meaning: g.meaning, 
        jp: g.jp, 
        cn: g.cn 
    };

    return `
        <div id="${anchorId}" class="bg-white p-7 pt-12 pb-10 rounded-[2.8rem] border border-slate-100 shadow-sm mb-12 animate-fade-in relative transition-all duration-300 hover:shadow-md text-left">
            
            ${this._renderGrammarTopSection(level, activeColor, itemId, idx, g)}
            
            <div id="display-content-${itemId}-${idx}" class="relative z-10 animate-fade-in">
                <h4 class="text-3.5xl font-black text-slate-800 leading-none tracking-tight pr-24 mb-10 mt-14">
                    ${g.point}
                </h4>
                ${this._renderGrammarDetailBody(g)}
            </div>

            ${this._renderGrammarEditPanel(itemId, idx, editPayload)}
            
        </div>`;
},

/** 🧬 [Sub-Module] 1. 文法卡片頂部區域 (V2026.ULTRA 避讓與陰影復位版) */
_renderGrammarTopSection(level, activeColor, itemId, idx, g) {
    const safeItemId = String(itemId).replace(/[^a-zA-Z0-9]/g, '');
    const confirmId = `gram-bubble-${safeItemId}-${idx}`;
    const speechFuel = String(g.jp_pure || g.jp || '').replace(/'/g, "\\'").replace(/\n/g, ' ');

    return `
        <div class="absolute -top-3.5 left-4 z-50 flex items-center gap-2.5">
            <div class="relative group shadow-2xl">
                <div style="background: ${activeColor};" class="px-6 py-2.5 rounded-2xl rounded-bl-none shadow-lg flex items-center justify-center min-w-[75px]">
                    <span class="text-white text-[12px] font-black tracking-widest uppercase relative z-10">${level}</span>
                </div>
                <div style="background: ${activeColor}; filter: brightness(0.6);" class="w-3 h-3 absolute -bottom-3 left-0 [clip-path:polygon(0_0,100%_0,100%_100%)]"></div>
            </div>
            
            <div class="relative px-5 py-1 bg-white border border-slate-100 rounded-2xl shadow-md">
                <span class="text-[11px] font-black text-slate-500 uppercase tracking-wider block">文法辨析</span>
            </div>
        </div>

        <div class="absolute top-20 right-4 z-[5000]">
            <div class="px-2 py-1 rounded-2xl bg-white/90 border border-slate-100 shadow-md backdrop-blur-md flex gap-1 relative transition-all">
                
                <button onclick="event.stopPropagation(); translationEngine.toggleEditMode('${itemId}', ${idx})"
                        class="w-8 h-8 rounded-xl text-slate-300 hover:text-blue-400 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-90">
                    <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>

                <div class="relative flex items-center justify-center">
                    <button onclick="event.stopPropagation(); this.nextElementSibling.innerHTML = translationView.renderMiniConfirm('${confirmId}', '抹除文法存檔?', 'translationEngine.deleteEduItem(\\'${itemId}\\', \\'文法\\', ${idx})');"
                            class="w-8 h-8 rounded-xl text-slate-300 hover:text-red-400 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-90">
                        <i class="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                    <div class="absolute bottom-full right-0 z-[6000]"></div>
                </div>

                <button onclick="event.stopPropagation(); translationEngine.speakSegment('${speechFuel}')"
                        class="w-8 h-8 rounded-xl text-slate-400 hover:theme-text-pink hover:bg-slate-50 flex items-center justify-center active:scale-90 transition-all">
                    <i class="fa-solid fa-volume-high text-[11px]"></i>
                </button>
            </div>
        </div>`;
},

/** 🧬 [Sub-Module] 2. 文法詳解主體 (內容呈現) */
_renderGrammarDetailBody(g) {
    const point = g.point || '';
    const cleanPoint = point.replace(/[~～]/g, '').trim();
    const meaning = (g.meaning || '').replace(
        new RegExp(`(${window.translationEngine._escapeRegExp(cleanPoint)})`, 'g'),
        `<span class="theme-text-pink font-black">$1</span>`
    );

    return `
        <div class="bg-pink-50/40 rounded-[2.5rem] p-8 border border-pink-100/30">
            <p class="text-[15px] font-bold text-slate-600 leading-relaxed mb-10 pr-4">${meaning}</p>
            <div class="w-full h-[1px] bg-white/60 mb-8"></div>
            <div class="flex gap-5 items-start">
                <div class="flex flex-col gap-2.5 pt-0.5 text-left">
                    <p class="text-[1.15rem] text-slate-800 font-medium leading-snug tracking-tight">
                        ${this.highlightPoint ? this.highlightPoint(g.jp || '', point) : (g.jp || '')}
                    </p>
                    <p class="text-[13.5px] text-slate-400 font-bold leading-tight italic opacity-90">
                        ${g.cn || '暫無翻譯'}
                    </p>
                </div>
            </div>
        </div>`;
},

/** 🧬 [Sub-Module] 3. 文法專屬編輯面板 (與 saveEduEdit 協定對接) */
_renderGrammarEditPanel(itemId, idx, editPayload) {
    return `
        <div id="edit-panel-${itemId}-${idx}" class="hidden mt-6 p-4 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-slide-up">
            <textarea id="edit-input-${itemId}-${idx}" 
                      class="w-full bg-white border-none rounded-[1.8rem] p-5 text-[12px] text-slate-600 min-h-[180px] font-mono focus:ring-2 ring-pink-100 shadow-inner">${JSON.stringify(editPayload, null, 2)}</textarea>
            <div class="flex justify-end gap-3 mt-4 pr-2">
                <button onclick="translationEngine.toggleEditMode('${itemId}', ${idx})" 
                        class="px-5 py-2 text-[11px] font-bold text-slate-400">取消</button>
                <button onclick="translationEngine.saveEduEdit('${itemId}', '文法', ${idx})" 
                        class="px-6 py-2 text-[11px] font-black theme-bg text-white rounded-2xl shadow-md active:scale-95 transition-all">
                    儲存固化
                </button>
            </div>
        </div>`;
},


/** 🎨 [Helper] 文法點高亮對焦器 (V2026.ULTRA.VISUAL_ENGINE) */
highlightPoint: function(text, target) {
    if (!text || !target) return text;

    // 1. 數據純化：移除點號中的「～」或「~」符號
    const cleanTarget = target.replace(/[~～]/g, '').trim();
    if (!cleanTarget) return text;

    // 🚀 關鍵對焦：借用 Engine 的正則轉義工具，防止特殊字元造成 RegExp 崩潰
    const escapedTarget = window.translationEngine._escapeRegExp(cleanTarget);

    // 2. 🚀 強力對焦正則：
    // 💡 職人診斷：確保在渲染過程中，目標文字被精確標記並染上主題粉紅
    const regex = new RegExp(`(${escapedTarget})`, 'g');
    return text.replace(regex, `<span class="theme-text-pink font-black">$1</span>`);
},

/** ❓ 核心入口：測驗清單渲染器 (V2026.ULTRA.STACK_ENGINE) */
renderQuizList(quizArray, itemId) {
    if (!quizArray || !Array.isArray(quizArray)) return '';
    
    // 💡 職人診斷：在此處封裝 stack 容器，並將數據流向單一卡片渲染器
    return `
        <div class="quiz-stack space-y-10 animate-fade-in">
            ${quizArray.map((q, idx) => this._renderQuizCard(q, idx, itemId)).join('')}
        </div>
    `;
},

/** ❓ 核心入口：模擬測驗卡片 (V2026.ULTRA.FINAL 避讓與解耦版) */
_renderQuizCard(q, idx, itemId) {
    const safeItemId = String(itemId || 'def').replace(/[^a-zA-Z0-9]/g, '');
    const quizId = `quiz-node-${safeItemId}-${idx}`;
    const level = q.level || 'N?';
    const levelColor = this._getTierColor(level);

    return `
        <div id="${quizId}" class="bg-white p-7 pt-14 pb-10 rounded-[2.8rem] border border-slate-100 shadow-sm mb-12 animate-fade-in relative transition-all duration-300 hover:shadow-md text-left">
            
            ${this._renderQuizTopSection(level, levelColor, idx, safeItemId)}
            ${this._renderQuizActionButtons(itemId, idx, safeItemId)}
            
            <div id="display-content-${itemId}-${idx}" class="animate-fade-in relative z-10">
                ${this._renderQuizQuestionBody(q.question || q.題目 || '')}
                ${this._renderQuizOptions(q, quizId)}
                ${this._renderQuizAnalysis(quizId, q.analysis || q.詳解 || '數據路網暫無詳解')}
            </div>

            ${this._renderQuizEditPanel(itemId, idx, q)}
        </div>`;
},

/** 🧬 [Sub-Module] 1. 測驗卡頂部區域 (執行壓扁與陰影復位) */
_renderQuizTopSection(level, levelColor, idx, safeItemId) {
    return `
        <div class="absolute -top-3.5 left-5 z-50 flex items-center gap-2.5">
            <div class="relative group shadow-2xl">
                <div style="background: ${levelColor};" class="px-6 py-2.5 rounded-2xl rounded-bl-none flex items-center justify-center min-w-[75px]">
                    <span class="text-white text-[12px] font-black tracking-[0.15em] uppercase relative z-10">${level}</span>
                </div>
                <div style="background: ${levelColor}; filter: brightness(0.7);" class="w-3 h-3 absolute -bottom-3 left-0 [clip-path:polygon(0_0,100%_0,100%_100%)]"></div>
            </div>
            <div class="relative px-6 py-1 bg-slate-800 border border-slate-700 rounded-2xl shadow-md min-w-[100px] flex items-center justify-center">
                <span class="text-[11px] font-black text-white uppercase tracking-wider block">模擬測驗 ${idx + 1}</span>
            </div>
        </div>`;
},

/** 🔘 [Sub-Module] 2. 測驗功能按鈕 (V2026.ULTRA 垂直並列對焦版) */
_renderQuizActionButtons(itemId, idx, safeItemId) {
    const confirmId = `quiz-bubble-${safeItemId}-${idx}`;
    
    // 🚀 核心修正 A：移回 -top-3.5 與標籤並列
    // 🚀 核心修正 B：flex-col 強制垂直排列，節省橫向空間
    return `
        <div class="absolute -top-3.5 right-4 z-[5000]">
            <div class="p-1 rounded-2xl bg-white/90 border border-slate-100 shadow-md backdrop-blur-md flex flex-col gap-1 relative">
                
                <button class="w-8 h-8 rounded-xl text-slate-300 hover:text-blue-400 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-90"
                        title="編輯測驗"
                        onclick="event.stopPropagation(); translationEngine.toggleEditMode('${itemId}', ${idx})">
                    <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>

                <div class="relative flex items-center justify-center">
                    <button class="w-8 h-8 rounded-xl text-slate-300 hover:text-red-400 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-90"
                            title="刪除燃料"
                            onclick="event.stopPropagation(); this.nextElementSibling.innerHTML = translationView.renderMiniConfirm('${confirmId}', '抹除測驗燃料?', 'translationEngine.deleteEduItem(\\'${itemId}\\', \\'測驗\\', ${idx})');">
                        <i class="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                    <div class="absolute bottom-full right-0 z-[6000]"></div>
                </div>
            </div>
        </div>`;
},

/** 📝 [Sub-Module] 3. 題目主體渲染 */
_renderQuizQuestionBody(text) {
    return `
        <div class="mb-12 mt-10 px-2">
            <p class="text-[1.2rem] font-medium text-slate-800 leading-[2] tracking-tight">
                ${text.replace(/____+|＿+|＿+/, '<span class="inline-block w-24 border-b-2 border-pink-400 mx-2 align-bottom"></span>')}
            </p>
        </div>`;
},

/** 🔘 [Sub-Module] 4. 選項列表渲染 (轉義對焦) */
_renderQuizOptions(q, quizId) {
    const options = q.options || ['A', 'B', 'C', 'D'];
    const answer = q.answer || q.正確答案 || '';
    return `
        <div class="grid grid-cols-1 gap-4 mb-10">
            ${options.map((opt, i) => {
                const safeOpt = String(opt || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
                const safeAnswer = String(answer || '').replace(/'/g, "\\'").replace(/"/g, "&quot;");
                const charLabel = String.fromCharCode(65 + i);
                return `
                    <button onclick="window.translationView._handleQuizClick(this, '${safeOpt}', '${safeAnswer}', '${quizId}')" 
                            class="quiz-opt group w-full p-5 rounded-[2rem] bg-slate-50 border border-slate-100 flex items-center gap-5 transition-all hover:bg-white hover:shadow-md active:scale-[0.98] text-left"
                            data-val="${safeOpt}">
                        <div class="opt-indicator w-10 h-10 shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-colors">
                            <span class="opt-label text-slate-400 font-black text-[15px] group-hover:text-pink-500">${charLabel}</span>
                        </div>
                        <span class="text-[1.05rem] font-medium text-slate-700">${opt}</span>
                    </button>`;
            }).join('')}
        </div>`;
},

/** 💡 [Sub-Module] 5. 解析面板渲染 */
_renderQuizAnalysis(quizId, analysis) {
    return `
        <div class="pt-8 border-t border-slate-50 text-center">
            <button onclick="const panel = document.getElementById('analysis-${quizId}'); panel.classList.toggle('hidden'); this.querySelector('i').classList.toggle('rotate-180')" 
                    class="inline-flex items-center gap-3 group px-10 py-2">
                <span class="text-[11px] font-black text-slate-400 tracking-[0.4em] uppercase group-hover:text-pink-500 transition-colors">查看詳解</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-300 group-hover:text-pink-400 transition-transform duration-300"></i>
            </button>
            <div id="analysis-${quizId}" class="hidden mt-8 animate-slide-up text-left">
                <div class="bg-pink-50/30 rounded-[3rem] px-6 py-10 border border-pink-100/20 transition-all">
                    <div class="flex items-center gap-3 mb-8">
                        <div class="w-1.5 h-1.5 rounded-full theme-bg"></div>
                        <span class="text-[12px] font-black theme-text-pink tracking-widest uppercase">測驗詳解</span>
                    </div>
                    <p class="text-[15px] font-normal text-slate-600 leading-[2.1] text-justify tracking-wide">${analysis}</p>
                </div>
            </div>
        </div>`;
},

/** ✍️ [Sub-Module] 6. 編輯面板渲染 */
_renderQuizEditPanel(itemId, idx, q) {
    const editPayload = { question: q.question || q.題目, options: q.options, answer: q.answer, analysis: q.analysis, level: q.level };
    return `
        <div id="edit-panel-${itemId}-${idx}" class="hidden mt-6 p-4 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-slide-up">
            <textarea id="edit-input-${itemId}-${idx}" 
                      class="w-full bg-white border-none rounded-[1.8rem] p-5 text-[12px] text-slate-600 min-h-[220px] font-mono focus:ring-2 ring-pink-100 shadow-inner">${JSON.stringify(editPayload, null, 2)}</textarea>
            <div class="flex justify-end gap-3 mt-4 pr-2">
                <button onclick="translationEngine.toggleEditMode('${itemId}', ${idx})" 
                        class="px-5 py-2 text-[11px] font-bold text-slate-400">取消</button>
                <button onclick="translationEngine.saveEduEdit('${itemId}', '測驗', ${idx})" 
                        class="px-6 py-2 text-[11px] font-black theme-bg text-white rounded-2xl shadow-md active:scale-95 transition-all">
                    同步儲存
                </button>
            </div>
        </div>`;
},


/** 🧠 處理答題回饋 (V2026.ULTRA.FINAL 邏輯導通加固版) */
_handleQuizClick(btn, selected, correct, quizId) {
    // 🚀 1. 物理定位與導通預檢
    const container = document.getElementById(quizId) || btn.closest('.bg-white');
    if (!container) return console.error("❌ [Quiz-Logic-Collapse] 無法對焦答題容器");

    // 💡 職人診斷：執行全量洗滌，封殺隱形空格與型別偏移
    const cleanSelected = String(selected || "").trim();
    const cleanCorrect = String(correct || "").trim();
    const isCorrect = (cleanSelected === cleanCorrect);
    
    // 🚀 2. 磁區重置 (全量掃描並封殺 Null 報錯)
    const options = container.querySelectorAll('.quiz-opt');
    options.forEach(opt => {
        opt.classList.remove('border-pink-200', 'border-slate-800', 'bg-white', 'shadow-md', 'opacity-50');
        const indicator = opt.querySelector('.opt-indicator');
        const label = opt.querySelector('.opt-label');
        if (indicator) indicator.classList.remove('theme-bg', 'bg-slate-800', 'bg-green-500');
        if (label) label.classList.remove('text-white', 'text-pink-500');
        // 封殺重複點擊
        opt.style.pointerEvents = 'none';
    });

    // 🚀 3. 注入交互反饋零件
    const targetIndicator = btn.querySelector('.opt-indicator');
    const targetLabel = btn.querySelector('.opt-label');

    if (isCorrect) {
        // 🎯 正確路徑：點亮職人粉
        btn.classList.add('border-pink-200', 'bg-white', 'shadow-md');
        if (targetIndicator) targetIndicator.classList.add('theme-bg');
        if (targetLabel) targetLabel.classList.add('text-white');
        uiManager.showToast('✨', '答對了！職人級的表現');
    } else {
        // 🎯 錯誤路徑：沉浸式深灰反饋
        btn.classList.add('border-slate-800', 'bg-white');
        if (targetIndicator) targetIndicator.classList.add('bg-slate-800');
        if (targetLabel) targetLabel.classList.add('text-white');
        
        // 💡 職人補償：主動點亮「正確選項」以消除資訊不對稱
        options.forEach(opt => {
            const optText = String(opt.dataset.val || opt.innerText).trim();
            if (optText === cleanCorrect) {
                opt.classList.add('border-green-200', 'ring-2', 'ring-green-100');
                const ind = opt.querySelector('.opt-indicator');
                if (ind) ind.classList.add('bg-green-500');
            } else {
                opt.classList.add('opacity-50'); // 弱化非正確選項
            }
        });
        uiManager.showToast('💡', '選錯了，看看解析對位吧');
    }
    
    // 🚀 4. 解析面板自動導通
    const analysisPanel = document.getElementById(`analysis-${quizId}`) || 
                          container.querySelector('[id^="analysis-"]');
    if (analysisPanel) {
        analysisPanel.classList.remove('hidden');
        analysisPanel.classList.add('animate-slide-up'); // 注入流暢動畫
        // 視覺對焦補償
        setTimeout(() => {
            analysisPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
},


/** 🎧 子組件：聽力實戰練習卡片 (V2026.ULTRA 真值全導通版) */
_renderListeningCard(l, idx, itemId) {
    if (!l) return '';

    // 🚀 1. 物理座標純化
    const safeItemId = String(itemId || 'vault').replace(/[^a-zA-Z0-9]/g, '');
    const listenId = `listen-node-${safeItemId}-${idx}`;
    
    // 🚀 2. 數據深層洗滌 (封殺斜線與無效 Fallback)
    const pacingText = l.pacing || l.題目 || '聽力題目載入中...';
    const variation = (l.variation || l.原文 || '無文本資料').replace(/\//g, '').trim(); 
    const advice = l.advice || l.詳解 || '保持語感，穩定聽取';
    const answer = l.answer || l.正確答案 || 'A';
    const level = l.level || 'N?';
    
    // 🚀 3. 選項數據直連 (物理對位)
    // 💡 職人診斷：精確對位 options 或 中文「選項」Key，若皆無則回傳空陣列進入 View 熔斷保護
    const finalOptions = Array.isArray(l.options) ? l.options : 
                         (Array.isArray(l.選項) ? l.選項 : []);

    // 🚀 4. 聲學燃料序列化 (安全傳參版)
    // 💡 職人對位：使用 Object 封裝 rawAudio 並執行轉義，封殺單引號造成的 HTML 斷路
    const rawAudio = l.audioText || l.音軌文本 || "";
    const safeAudioPayload = String(rawAudio).replace(/'/g, "\\'").replace(/"/g, '&quot;');

    // 🚀 5. 封裝編輯實體數據
    const editPayload = { 
        pacing: pacingText, 
        audioText: rawAudio, 
        options: finalOptions, 
        answer, 
        variation, 
        advice, 
        level 
    };

    return `
        <div id="${listenId}" class="bg-white p-7 pt-14 pb-10 rounded-[2.8rem] border border-slate-100 shadow-sm mb-12 animate-fade-in relative transition-all duration-300 hover:shadow-md text-left">
            
            ${this._renderListeningHeader(level, idx, itemId, safeAudioPayload, rawAudio)}
            
            <div id="display-content-${itemId}-${idx}" class="animate-fade-in relative z-10">
                ${this._renderListeningQuiz(pacingText, finalOptions, answer, listenId)}
                ${this._renderListeningAnalysis(listenId, variation, advice)}
            </div>

            ${this._renderListeningEditPanel(itemId, idx, editPayload)}
        </div>`;
},

/** 🏷️ 子組件：聽力卡片頭部 (V2026.ULTRA 極限邊界對焦版) */
_renderListeningHeader(level, idx, itemId, audioPayload, rawAudio) {
    const levelColor = this._getTierColor(level);
    const confirmId = `bubble-${itemId}-${idx}`;
    const safeItemId = String(itemId).replace(/[^a-zA-Z0-9]/g, '');

    const payloadString = typeof rawAudio === 'string' ? rawAudio : JSON.stringify(rawAudio);
    const safeQ = encodeURIComponent(payloadString);

    return `
        <div class="absolute -top-3.5 left-3 z-50 flex items-center">
            <div class="relative group shadow-2xl">
                <div style="background: ${levelColor};" class="px-5 py-2.5 rounded-2xl rounded-bl-none flex items-center justify-center min-w-[70px]">
                    <span class="text-white text-[12px] font-black tracking-widest uppercase relative z-10">${level}</span>
                </div>
                <div style="background: ${levelColor}; filter: brightness(0.6);" class="w-3 h-3 absolute -bottom-3 left-0 [clip-path:polygon(0_0,100%_0,100%_100%)]"></div>
            </div>
        </div>

        <div class="absolute -top-3.5 left-1/2 -translate-x-1/2 z-40">
            <div class="px-5 py-1.5 bg-slate-800 border border-slate-700 rounded-2xl shadow-lg shadow-black/10 whitespace-nowrap">
                <span class="text-[11px] font-black text-white uppercase tracking-wider block">聽力模擬 ${idx + 1}</span>
            </div>
        </div>

        <div class="absolute -top-3.5 right-3 z-50">
            <div class="p-1 rounded-2xl bg-white/95 border border-slate-100 shadow-xl backdrop-blur-md grid grid-cols-2 gap-1 relative transition-all">
                
                <button onclick="event.stopPropagation(); translationEngine.toggleEditMode('${itemId}', ${idx})"
                        class="w-8 h-8 rounded-xl text-slate-300 hover:text-blue-400 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-90">
                    <i class="fa-solid fa-pen-to-square text-[10px]"></i>
                </button>

                <button onclick="event.stopPropagation(); App.speak(decodeURIComponent('${safeQ}'))"
                        class="w-8 h-8 rounded-xl text-slate-400 hover:theme-text-pink hover:bg-slate-50 flex items-center justify-center active:scale-90">
                    <i class="fa-solid fa-volume-high text-[11px]"></i>
                </button>

                <div class="relative flex items-center justify-center">
                    <button onclick="event.stopPropagation(); this.nextElementSibling.innerHTML = translationView.renderMiniConfirm('${confirmId}', '回收聽力燃料?', 'translationEngine.deleteEduItem(\\'${itemId}\\', \\'聽力\\', ${idx})');"
                            class="w-8 h-8 rounded-xl text-slate-300 hover:text-red-400 hover:bg-slate-50 flex items-center justify-center transition-all active:scale-90">
                        <i class="fa-solid fa-trash-can text-[10px]"></i>
                    </button>
                    <div class="absolute bottom-full right-0 z-[6000]"></div>
                </div>

                <div class="w-8 h-8 opacity-0 pointer-events-none"></div>
            </div>
        </div>`;
},


/** 🎙️ 子組件：聽力考題區域 (V2026.ULTRA 物理顯現加固版) */
_renderListeningQuiz(pacingText, options, answer, listenId) {
    // 🚀 1. 數據強制迭代化
    // 💡 職人診斷：確保 options 必為陣列，封殺非陣列類型傳入導致的 map 崩潰
    const quizOptions = (options && Array.isArray(options)) ? options : [];
    
    // 🚀 2. 安全座標轉義
    // 💡 職人對位：將單引號轉為雙重轉義，封殺 onclick 傳參造成的導通斷路
    const safeAnswer = String(answer || 'A').replace(/'/g, "\\'");
    const safeListenId = String(listenId).replace(/'/g, "\\'");

    return `
        <div class="mb-12 mt-10 px-2">
            <p class="text-[1.2rem] font-medium text-slate-800 leading-[1.8] tracking-tight">
                ${pacingText}
            </p>
        </div>
        
        <div class="grid grid-cols-1 gap-4 mb-10 min-h-[50px] relative z-10">
            ${quizOptions.length > 0 ? quizOptions.map((opt, i) => {
                const charLabel = String.fromCharCode(65 + i);
                const safeOpt = String(opt || '').replace(/"/g, '&quot;').replace(/'/g, "&#39;");
                
                return `
                    <button onclick="window.translationView._handleQuizClick(this, '${charLabel}', '${safeAnswer}', '${safeListenId}')" 
                            class="quiz-opt group w-full p-6 rounded-[2.5rem] bg-slate-50 border border-slate-100 flex items-center gap-5 transition-all hover:bg-white hover:shadow-md active:scale-[0.98] text-left">
                        <div class="opt-indicator w-10 h-10 shrink-0 rounded-full bg-white border border-slate-100 flex items-center justify-center shadow-sm transition-colors text-slate-400 font-black text-[15px] group-hover:text-pink-500">
                            ${charLabel}
                        </div>
                        <div class="flex-1">
                            <span class="text-[1.05rem] font-medium text-slate-700 block leading-relaxed">${safeOpt}</span>
                        </div>
                    </button>
                `;
            }).join('') : `
                <div class="p-10 text-center bg-rose-50 rounded-[2.5rem] border border-rose-100 border-dashed animate-pulse">
                    <p class="text-rose-400 font-black text-[12px] uppercase tracking-widest">❌ 燃料斷路：Options 數據未對焦</p>
                    <p class="text-rose-300 text-[10px] mt-1 font-bold italic">請檢查 JSON 內是否包含正確的 options 欄位</p>
                </div>
            `}
        </div>
    `;
},


/** 💡 子組件：詳解面板 (V2026.ULTRA 語義自動對位版) */
_renderListeningAnalysis(listenId, variation, advice) {
    // 🚀 1. 物理提取函數：將對話字串轉化為 Map {角色+索引: 內容}
    const parseDialogue = (text, isJP = true) => {
        const regex = isJP ? /(男：|女：)/g : /(男：|女：)/g;
        const parts = text.replace(/\//g, '').split(regex).filter(p => p.trim());
        const result = [];
        for (let i = 0; i < parts.length; i += 2) {
            result.push({ role: parts[i], content: parts[i+1]?.trim() || "" });
        }
        return result;
    };

    // 🚀 2. 數據解構：分離原文與翻譯區塊
    const jpDialogue = parseDialogue(variation, true);
    
    // 從 advice 提取【翻譯】區塊內容
    const translationSection = advice.match(/【翻譯】([\s\S]*?)(?=【|$)/);
    const zhContent = translationSection ? translationSection[1].trim() : "";
    const zhDialogue = parseDialogue(zhContent, false);

    // 🚀 3. 執行物理對位焊接 (Alignment Mapping)
    const alignedHtml = jpDialogue.map((jp, idx) => {
        const zh = zhDialogue[idx] || { content: "---" };
        const roleColor = jp.role.includes('女') ? 'theme-text-pink' : 'text-blue-500';
        
        return `
            <div class="dialogue-pair mb-8 animate-fade-in group">
                <div class="flex items-center gap-2 mb-2">
                    <span class="px-2 py-0.5 rounded-lg bg-slate-100 ${roleColor} text-[10px] font-black tracking-tighter">
                        ${jp.role.replace('：', '')}
                    </span>
                    <div class="h-[1px] flex-1 bg-slate-50 group-hover:bg-pink-50 transition-colors"></div>
                </div>
                
                <div class="pl-2 space-y-2 border-l-2 border-transparent group-hover:border-pink-100 transition-all">
                    <p class="text-[1.1rem] font-medium text-slate-800 leading-relaxed">
                        ${jp.content}
                    </p>
                    <p class="text-[14px] font-bold text-slate-400 leading-relaxed italic">
                        ${zh.content}
                    </p>
                </div>
            </div>
        `;
    }).join('');

    // 🚀 4. 提取其餘解析區塊 (排除翻譯)
    const otherAdvice = advice
        .split(/(?=【.*?】)/)
        .filter(sec => !sec.includes('翻譯'))
        .map(sec => {
            const trimmed = sec.trim();
            if (!trimmed) return "";
            return `
                <div class="mt-8 pt-6 border-t border-slate-50">
                    <p class="text-[11px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-2 mb-3">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                        ${trimmed.match(/【.*?】/)?.[0] || ""}
                    </p>
                    <div class="text-[14px] leading-[1.8] text-slate-500 px-1">
                        ${trimmed.replace(/【.*?】/, '').replace(/\n/g, '<br>')}
                    </div>
                </div>`;
        }).join('');

    return `
        <div class="pt-8 border-t border-slate-50 text-center">
            <button onclick="const panel = document.getElementById('analysis-${listenId}'); panel.classList.toggle('hidden'); this.querySelector('i').classList.toggle('rotate-180')" 
                    class="inline-flex items-center gap-3 group px-10 py-2">
                <span class="text-[11px] font-black text-slate-400 tracking-[0.4em] uppercase group-hover:text-pink-500 transition-colors">對話精解</span>
                <i class="fa-solid fa-chevron-down text-[10px] text-slate-300 group-hover:text-pink-400 transition-transform duration-300"></i>
            </button>
            
            <div id="analysis-${listenId}" class="hidden mt-8 animate-slide-up text-left px-2">
                <div class="bg-white rounded-[3rem] px-8 py-10 border border-slate-100 shadow-xl space-y-2">
                    
                    <div class="space-y-2">
                        <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-8 text-center">Linguistic Alignment</p>
                        ${alignedHtml}
                    </div>

                    ${otherAdvice}

                </div>
            </div>
        </div>`;
},


/** ✍️ 子組件：編輯面板 */
_renderListeningEditPanel(itemId, idx, editPayload) {
    return `
        <div id="edit-panel-${itemId}-${idx}" class="hidden mt-6 p-4 bg-slate-50 rounded-[2.5rem] border border-slate-200 animate-slide-up">
            <textarea id="edit-input-${itemId}-${idx}" 
                      class="w-full bg-white border-none rounded-[1.8rem] p-5 text-[12px] text-slate-600 min-h-[220px] font-mono focus:ring-2 ring-pink-100 shadow-inner">${JSON.stringify(editPayload, null, 2)}</textarea>
            <div class="flex justify-end gap-3 mt-4 pr-2">
                <button onclick="translationEngine.toggleEditMode('${itemId}', ${idx})" 
                        class="px-5 py-2 text-[11px] font-bold text-slate-400">取消</button>
                <button onclick="translationEngine.saveEduEdit('${itemId}', '聽力', ${idx})" 
                        class="px-6 py-2 text-[11px] font-black theme-bg text-white rounded-2xl shadow-md active:scale-95 transition-all">
                    同步儲存
                </button>
            </div>
        </div>`;
},


/** ⚖️ 組件：自動化辨析空間 (V2026.ULTRA.CROSS-DOMAIN-FIX) */
_renderAutoComparison(baseLabel, group, type, itemId) {
    // 🚀 核心 A：物理對焦 Engine 主權
    // 💡 職人診斷：偵測器不在 View 內部，必須跨檔案導通至 translationEngine 實體
    if (!window.translationEngine) {
        console.error("❌ [View-Acoustic-Collapse] 找不到 translationEngine 總線");
        return '';
    }

    // 🚀 核心 B：語義碰撞偵測 (物理指向 Engine)
    const collisionMap = window.translationEngine._detectSemanticCollisions(group, type);
    if (!collisionMap || Object.keys(collisionMap).length === 0) return '';

    return `
        <div class="mt-14 mb-10 px-4 animate-slide-up">
            <div class="flex items-center gap-3 mb-8">
                <div class="w-10 h-[1px] bg-pink-200"></div>
                <span class="text-[11px] font-black theme-text-pink tracking-[0.3em] uppercase opacity-60">
                    語義碰撞對焦
                </span>
                <div class="flex-1 h-[1px] bg-slate-100"></div>
            </div>

            <div class="space-y-12">
                ${Object.values(collisionMap).map(collisionGroup => `
                    <div class="space-y-5">
                        <div class="grid grid-cols-1 gap-4">
                            ${collisionGroup.map(item => {
                                // 🚀 跨模組採集：內容提取邏輯同樣歸屬於 Engine
                                return (type === '單字') 
                                    ? window.translationEngine._extractVocabComparison(item, itemId) 
                                    : window.translationEngine._extractGrammarComparison(item, itemId);
                            }).join('')}
                        </div>
                    </div>
                `).join('')}
            </div>
            
            <div class="mt-12 flex justify-center opacity-20">
                <i class="fa-solid fa-ellipsis text-slate-300 text-[10px]"></i>
            </div>
        </div>`;
},


/** 🎨 子程序：辨析對比項目 UI (垂直解耦穩定版 - V2026.ULTRA.VERTICAL) */
_renderComparisonItem(title, hint, anchorId) {
    return `
        <div onclick="document.getElementById('${anchorId}')?.scrollIntoView({ behavior: 'smooth', block: 'center' }); if(navigator.vibrate) navigator.vibrate(5);"
             class="group relative bg-white p-7 rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-md transition-all cursor-pointer active:scale-[0.98] w-full mb-5">
            
            <div class="flex items-center justify-between mb-4 pr-2">
                <h5 class="text-[17px] font-black text-slate-800 leading-tight">
                    ${title}
                </h5>
                <i class="fa-solid fa-circle-arrow-right text-slate-100 group-hover:text-pink-200 group-hover:translate-x-1 transition-all text-[18px]"></i>
            </div>

            <div class="w-full h-[1px] bg-slate-50 mb-4 opacity-80"></div>

            <div class="w-full">
                <p class="text-[13.5px] text-slate-500 font-medium leading-relaxed group-hover:text-slate-700 transition-colors">
                    ${hint}
                </p>
            </div>

            <div class="absolute bottom-4 right-6 opacity-[0.03] pointer-events-none">
                <i class="fa-solid fa-magnifying-glass-chart text-[2rem]"></i>
            </div>
        </div>`;
},

_generateSingleCardHTML(item) {
    const style = this._getCategoryStyle(item.category);
    const safeText = encodeURIComponent(item.q || "");
    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm mb-5 animate-slide-up group relative">
            <button onclick="translationEngine.deleteArticleRecord('${item.id}')" 
                    class="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-slate-200 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100">✕</button>
            <div class="flex justify-between items-center mb-4">
                <p class="text-[10px] font-black theme-text-pink uppercase tracking-[0.2em] italic">Instant Record</p>
                <span class="text-[9px] font-black px-2.5 py-1 rounded-lg border ${style.color}">${style.icon} ${item.category || '一般'}</span>
            </div>
            <p class="text-[1.3rem] font-medium text-slate-800 leading-[1.8]">${item.q || ""}</p>
            <p class="text-[1rem] font-bold text-slate-400 border-t border-slate-50 mt-4 pt-4">${item.a || ""}</p>
            <button onclick="App.speak(decodeURIComponent('${safeText}'))" 
                    class="w-full mt-6 py-4 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-2xl text-[11px] font-black transition-all active:scale-95 shadow-inner uppercase">
                🔊 Voice Broadcast
            </button>
        </div>`;
},

/** 🎨 核心：JLPT 等級配色導航 (V2026.ULTRA.VISUAL_CORE) */
_getTierColor(level) {
    // 🚀 定義等級配色軌道 (符合 TravelFlow 職人配色規範)
    const tierColors = {
        'N1': '#9333ea', // 尊絕紫 (高階語義對焦)
        'N2': '#2563eb', // 專業藍 (實務應用對焦)
        'N3': '#059669', // 沉穩綠 (生活場景對焦)
        'N4': '#f59e0b', // 暖陽橙 (基礎語法對焦)
        'N5': '#ec4899', // 櫻花粉 (入門核心對焦)
        'ALL': '#64748b', // 鋼鐵灰 (全量數據導通)
        'N?': '#cbd5e1'  // 迷霧灰 (未知磁區備援)
    };

    // 🚀 數據對焦與回退機制 (Fall-back Mechanism)
    // 確保輸入如 "n4" 或 "N4" 都能準確點亮
    const normalizedLevel = String(level || 'N?').toUpperCase().trim();
    
    return tierColors[normalizedLevel] || tierColors['N?'];
},


/** 🎨 [Module] 文章編輯表單視圖 (V2026.ULTRA 完整結構加固版) */
_renderArticleEditForm(record) {
    const savedCats = localStorage.getItem('tf_live_private_cats');
    const categories = savedCats ? JSON.parse(savedCats) : ['一般', '交通', '用餐', '購物', '住宿', '景點', '醫藥'];
    const segments = Array.isArray(record.segments) ? record.segments : [];

    return `
        <div class="space-y-8 pb-10">
            <div class="space-y-4">
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">文章標題</label>
                    <input type="text" id="edit-art-title" value="${record.title || ''}" 
                           class="w-full bg-slate-50 border-none rounded-2xl p-4 text-slate-700 font-bold focus:ring-2 focus:ring-pink-200 transition-all outline-none">
                </div>
                <div>
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">分類標籤</label>
                    <div class="grid grid-cols-3 gap-2" id="edit-art-cat-group">
                        ${categories.map(cat => {
                            const isActive = cat === record.category;
                            // 💡 職人樣式：強制注入主題色
                            const activeStyles = isActive ? `style="background-color: var(--theme-primary, #ff4d91) !important; color: #ffffff !important;"` : '';
                            return `
                                <button onclick="translationEngine._handleCatSwitch(this, '${cat}')"
                                        ${activeStyles}
                                        class="cat-chip py-3 rounded-xl border font-black text-[11px] transition-all active:scale-95 ${isActive ? 'text-white border-transparent shadow-sm is-active' : 'bg-white text-slate-600 border-slate-100'}"
                                        data-cat="${cat}" data-selected-active="${isActive}">
                                    ${cat}
                                </button>`;
                        }).join('')}
                    </div>
                </div>
            </div>

            <div class="pt-6 border-t border-slate-100">
                <div class="flex justify-between items-center mb-6 px-1">
                    <label class="block text-[10px] font-black theme-text-pink uppercase tracking-widest">內容段落重構 (#${segments.length})</label>
                    <button onclick="translationEngine.addEditSegment()" 
                            class="py-1.5 px-4 rounded-xl bg-slate-900 text-white text-[9px] font-black uppercase active:scale-95 transition-all shadow-sm">
                        + 新增段落
                    </button>
                </div>
                
                <div class="space-y-6" id="edit-segments-list">
                    ${segments.length > 0 ? segments.map((p, idx) => {
                        // 🚀 數據防禦洗滌：確保不顯示 undefined 字串
                        const getVal = (v) => {
                            const s = String(v || "").trim();
                            return (s === 'undefined' || s === 'null') ? "" : s;
                        };
                        const q = Array.isArray(p) ? getVal(p[0]) : (getVal(p.q) || getVal(p.原文));
                        const a = Array.isArray(p) ? getVal(p[1]) : (getVal(p.a) || getVal(p.翻譯));
                        
                        return translationView._renderSegmentEditBlock(idx, q, a);
                    }).join('') : `
                        <div class="py-10 text-center bg-slate-50 rounded-[2rem] border border-dashed border-slate-200" id="empty-segment-notice">
                            <p class="text-slate-300 font-black text-[10px] uppercase tracking-widest">No Segments Found</p>
                        </div>
                    `}
                </div>
            </div>
        </div>`;
},

/** 🧬 [Private] 單一對齊區塊渲染零件 */
_renderSegmentEditBlock(idx, q = "", a = "") {
    return `
        <div class="segment-edit-block bg-slate-50/50 p-5 rounded-[2rem] border border-slate-50 group relative animate-fade-in" data-idx="${idx}">
            <div class="flex justify-between mb-3 px-2">
                <span class="text-[9px] font-black text-slate-300 italic">SEGMENT #${String(idx + 1).padStart(2, '0')}</span>
                <button onclick="this.closest('.segment-edit-block').remove()" 
                        class="text-slate-300 hover:text-red-400 transition-colors">
                    <i class="fa-solid fa-trash-can text-[11px]"></i>
                </button>
            </div>
            <textarea class="edit-q-input w-full bg-white border-none rounded-xl p-3 text-[13px] font-medium text-slate-700 mb-2 focus:ring-1 focus:ring-pink-100 min-h-[80px] resize-none outline-none" placeholder="日文原文...">${q}</textarea>
            <textarea class="edit-a-input w-full bg-white border-none rounded-xl p-3 text-[12px] font-bold text-slate-400 focus:ring-1 focus:ring-pink-100 min-h-[60px] resize-none outline-none" placeholder="中文譯文...">${a}</textarea>
        </div>`;
},


/** 🔘 [Module] 控制按鈕渲染 (V2026.ULTRA 物理主權全導通版) */
_renderArticleEditActions(modalId, articleId) {
    // 💡 職人診斷：加入 articleId 參照，確保刪除指令精確對焦磁區座標
    return `
        <div class="flex gap-3 items-center">
            <button onclick="translationEngine.deleteArticlePackage('${articleId}', '${modalId}')" 
                    title="物理切除此文章"
                    class="w-14 h-14 flex items-center justify-center bg-red-50 text-red-400 rounded-2xl hover:bg-red-500 hover:text-white transition-all active:scale-95 border border-red-100 shadow-sm shrink-0">
                <i class="fa-solid fa-trash-can text-[16px]"></i>
            </button>

            <button onclick="App.modalRemove('${modalId}')" 
                    class="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 hover:bg-slate-100">
                放棄
            </button>
            
            <button id="save-art-btn" 
                    style="background-color: var(--theme-primary, #ff4d91) !important; color: #ffffff !important;"
                    class="flex-[2] py-4 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-lg shadow-pink-100 transition-all active:scale-95 flex items-center justify-center gap-2 group">
                
                <span class="btn-text">同步並儲存</span>
                
                <i class="fa-solid fa-circle-notch fa-spin hidden" id="save-art-loader"></i>
                <i class="fa-solid fa-cloud-arrow-up group-hover:translate-y-[-2px] transition-transform" id="save-art-icon"></i>
            </button>
        </div>`;
},

/** 📜 渲染：原文與譯文交叉視圖 (V2026.ULTRA.FINAL 數據洗滌加固版) */
_renderOriginalTab(item) {
    // 🚀 1. 物理安全檢查
    if (!item.segments || !Array.isArray(item.segments)) {
        return `
            <div class="py-16 text-center animate-fade-in">
                <div class="text-4xl mb-4 opacity-20">📄</div>
                <p class="text-slate-300 text-[10px] font-black italic uppercase tracking-[0.2em]">No Segments Detected</p>
            </div>`;
    }

    return item.segments.map((p, idx) => {
        // 🚀 2. 數據對焦：多態解構
        let qRaw = "", aRaw = "";
        if (Array.isArray(p)) { 
            qRaw = p[0]; aRaw = p[1]; 
        } else if (p && typeof p === 'object') { 
            qRaw = p.q || p.原文 || ""; aRaw = p.a || p.翻譯 || ""; 
        }

        // 🚀 3. 核心洗滌：徹底封殺「字串型」的 undefined / null
        const sanitize = (val) => {
            const str = String(val || "").trim();
            return (str === 'undefined' || str === 'null') ? "" : str;
        };

        const q = sanitize(qRaw);
        const a = sanitize(aRaw);

        // 封殺全空段落，維持路網純淨
        if (!q && !a) return "";

        // 🚀 4. 聲學轉義：確保 JS 傳參不因引號斷路
        const safeQ = q.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');

        return `
            <div class="bg-white/80 p-6 rounded-[2.2rem] shadow-sm border border-slate-50 relative group transition-all hover:shadow-lg hover:shadow-slate-100 animate-fade-in mb-4">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[9px] font-black text-slate-300 tracking-[0.2em] italic">SEGMENT #${String(idx + 1).padStart(2, '0')}</span>
                    
                    <div class="flex gap-2.5">
                        <button onclick="event.stopPropagation(); translationEngine.speakSegment('${safeQ}')" 
                                class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 hover:bg-blue-50 hover:text-blue-500 border border-slate-100 shadow-inner">
                            <i class="fa-solid fa-volume-high text-[13px]"></i>
                        </button>

                        <button onclick="event.stopPropagation(); translationEngine.openEduMenu('${item.id}', ${idx})" 
                                class="w-10 h-10 rounded-2xl bg-pink-50 text-pink-500 flex items-center justify-center transition-all active:scale-90 hover:bg-pink-500 hover:text-white shadow-sm border border-pink-100">
                            <span style="display: inline-block; transform: translateY(-1px); font-size: 15px;">🎓</span>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <p class="text-[1.15rem] font-medium text-slate-800 leading-relaxed tracking-tight select-text">${q}</p>
                    <div class="flex items-center gap-3 py-1">
                        <div class="h-[1.5px] flex-1 bg-gradient-to-r from-slate-100 via-slate-50 to-transparent rounded-full"></div>
                        <div class="w-1.5 h-1.5 rounded-full bg-slate-200"></div>
                    </div>
                    <p class="text-[0.95rem] font-bold text-slate-400 leading-normal select-text">${a}</p>
                </div>
            </div>`;
    }).join('');
},

/** 🎨 [Module] 教材分頁外殼 (V2026.ULTRA 物理對焦穩定版) */
_renderEduTabWrapper(articleId, tabName, eduData, activeTier = 'ALL', currentPage = 1) {
    // 🚀 1. 職人診斷：確保等級過濾條與分頁內容共享同一個生命週期
    // 傳入 activeTier 確保翻頁時，頂部 Tab 的「高亮狀態」不會消失
    const filterBarHtml = translationView._renderTierFilterBar(articleId, tabName, activeTier);

    // 🚀 2. 核心焊接：將 currentPage 傳遞給內容引擎
    // 💡 職人提醒：若不傳入 currentPage，翻頁動作將永遠卡在 Page 1
    const contentHtml = translationView._renderEduContent(tabName, eduData, articleId, activeTier, currentPage);

    return `
        <div class="space-y-6 animate-fade-in" id="edu-wrapper-${articleId}">
            ${filterBarHtml}

            <div class="bg-slate-50/50 p-2 rounded-[2.2rem] border border-slate-100">
                <button onclick="translationEngine.toggleFuelPanel('${articleId}')" 
                        class="w-full py-4 rounded-[1.8rem] bg-white border border-slate-100 text-slate-400 font-black text-[11px] tracking-widest hover:text-pink-500 transition-all flex items-center justify-center gap-2 shadow-sm">
                    <i class="fa-solid fa-plus-circle text-[14px]"></i> 注入 ${tabName} 數據燃料
                </button>
                
                <div id="fuel-panel-${articleId}" class="hidden p-5 animate-slide-up">
                    <textarea id="edu-fuel-input-${articleId}" 
                              class="w-full h-40 bg-white/80 rounded-2xl p-5 text-[13px] font-mono border-none focus:ring-2 focus:ring-pink-200 mb-4 shadow-inner" 
                              placeholder="請在此貼入 JSON 燃料包..."></textarea>
                    <div class="flex gap-2">
                        <button onclick="translationEngine.injectEduFuel('${articleId}', '${tabName}')" 
                                class="flex-1 py-3.5 theme-bg text-white rounded-xl font-black text-[12px] shadow-lg shadow-pink-100 active:scale-95 transition-all">
                            🚀 執行增量投射
                        </button>
                        <button onclick="translationEngine.toggleFuelPanel('${articleId}')" 
                                class="px-6 py-3.5 bg-white text-slate-400 rounded-xl font-bold border border-slate-100 text-[12px]">
                            取消
                        </button>
                    </div>
                </div>
            </div>

            <div class="edu-card-stack" id="edu-content-area-${articleId}">
                ${contentHtml}
            </div>
        </div>`;
},

/** 🧬 [Module] 分頁 UI 狀態穩壓器 */
updateTabUI(articleId, tabName) {
    const pkg = document.getElementById(`pkg-${articleId}`);
    if (!pkg) return;
    
    pkg.querySelectorAll('.art-tab-btn').forEach(btn => {
        btn.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
        btn.classList.add('text-slate-400');
    });
    
    const activeBtn = document.getElementById(`tab-btn-${articleId}-${tabName}`);
    if (activeBtn) {
        activeBtn.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
        activeBtn.classList.remove('text-slate-400');
    }
},


    // ============================================================
    // 📖 B分區：情境翻譯 (Contextual Module)
    // 負責：語義分流撥盤、燃料注入器、Vault 標籤導航、文章包折疊
    // ============================================================

    renderContextualBase(container, items, activeCategory) {
        // [等待函數貼入] 
        // 職人提示：此處應承載 renderContextualTranslation 的主骨架邏輯
    },

/** 📖 [Contextual Module] 情境翻譯系統視圖 (V2026.ULTRA 絕對座標導通版) */
renderContextualTranslation(container, vaultItems = [], activeCategory = '全部') {
    const safeVault = Array.isArray(vaultItems) ? vaultItems : [];
    
    // 🚀 1. 語義對焦與真值校準
    const trip = window.state?.trips.find(t => t.id === window.state.activeTripId);
    if (!trip) return;

    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
    const isEN = (currentLang === 'EN');
    const currentCat = activeCategory.trim(); // 已執行 trim，確保比對精確

    // 🚀 2. 分類磁區初始化 (數據純化)
    if (!trip.translateConfig) {
        trip.translateConfig = { categories: ['交通', '用餐', '購物', '醫藥'] };
    }
    // 💡 修正：確保 categories 陣列內的字串也是乾淨的
    const categories = ['全部', ...trip.translateConfig.categories.map(c => c.trim())];

    // 🚀 3. 主框架導通
    // 💡 職人診斷：在 HTML 字串內部，使用 translationView 絕對參照是正確的，
    // 因為 onclick 等事件在全域執行環境下必須對位到全域物件。
    container.innerHTML = `
        <div class="translate-module animate-fade-in space-y-6 pb-40">
            ${translationView._renderLinguisticSwitcher(currentLang)}
            
            <div class="flex items-center justify-between px-6">
                <div class="flex items-center gap-3">
                    <span class="text-xl">${isEN ? '🇺🇸' : '🇯🇵'}</span>
                    <h2 class="text-xl font-black text-slate-800 tracking-tight">
                        ${isEN ? 'English Study Vault' : '情境翻譯庫'}
                    </h2>
                </div>
            </div>
            
            ${translationView._renderFuelInjector()}

            <div class="space-y-4">
                ${translationView._renderVaultHeader()}
                
                ${translationView._renderTranslateTabs(categories, currentCat, isEN)}
                
                <div id="translate-vault-track" class="space-y-3 px-4">
                    ${translationView._renderTranslateCards(safeVault, currentCat)}
                </div>
            </div>
        </div>
    `;

    // 🚀 4. 物理座標對焦
    // 💡 修正：使用 translationView 確保與 window 掛載點 100% 同步
    if (typeof translationView.focusTranslateTab === 'function') {
        translationView.focusTranslateTab(currentCat);
    }
},

/** 🌐 [Switcher] 語義分流撥盤 (V2026.ULTRA 狀態感應版) */
_renderLinguisticSwitcher(currentLang) {
    // 🚀 1. 物理狀態預檢：若無傳入則嘗試從快照提取，確保渲染不坍塌
    const lang = currentLang || localStorage.getItem('tf_trans_lang') || 'JP';
    const isEN = (lang === 'EN');
    
    // 🚀 2. 視覺樣式定義
    const activeClass = "bg-white shadow-md theme-text-pink scale-[1.02]";
    const inactiveClass = "text-slate-400 hover:text-slate-500 bg-transparent";

    return `
        <div class="px-4 pt-2 mb-4 animate-fade-in">
            <div class="bg-slate-100/60 p-1 rounded-[1.5rem] flex items-center border border-slate-200/40 shadow-inner relative overflow-hidden">
                <button onclick="App.setTransLanguage('JP')" 
                        class="flex-1 py-2.5 rounded-[1.2rem] text-[10px] font-black transition-all duration-300 relative z-10 
                        ${!isEN ? activeClass : inactiveClass}">
                    🇯🇵 JAPAN MODE
                </button>
                
                <button onclick="App.setTransLanguage('EN')" 
                        class="flex-1 py-2.5 rounded-[1.2rem] text-[10px] font-black transition-all duration-300 relative z-10 
                        ${isEN ? activeClass : inactiveClass}">
                    🇺🇸 ENGLISH MODE
                </button>
            </div>
        </div>
    `;
},


/** 🔌 子函數 B：燃料注入器 (日文實戰版 - 組件穩定版) */
_renderFuelInjector() {
    const accentColor = 'theme-text-pink';
    const ringColor = 'focus:ring-pink-100';
    const btnColor = 'theme-bg shadow-pink-100';

    return `
        <div class="mx-4 bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 space-y-5">
            <div class="flex justify-between items-center px-1">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Contextual Fuel Injector
                </h4>
                <div id="translate-ai-btn">
                    ${viewEngine.renderAICopyBtn(this._getTranslateAiPrompt(''))}
                </div>
            </div>
            <div class="relative">
                <input type="text" id="trans-query-input" 
                       class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-xs focus:ring-2 ${ringColor} transition-all outline-none" 
                       placeholder="輸入對話情境 (例如：飯店入住、過海關)..." 
                       oninput="App.syncTranslateAiPrompt(this.value)"> 
            </div>
            <textarea id="trans-json-input" 
                      class="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 font-mono text-[10px] ${accentColor} outline-none focus:ring-1 focus:ring-slate-100" 
                      placeholder="請貼上 AI Protocol 生成的高品質 JSON 燃料..."></textarea>
            <button onclick="App.importTranslateFuel()" 
                    class="w-full py-4 ${btnColor} text-white rounded-[1.5rem] font-black text-xs shadow-lg active:scale-95 transition-all">
                存入情境磁區
            </button>
        </div>
    `;
},


/** 📂 子函數 C：Vault 標題欄 (日文實戰版) */
_renderVaultHeader() {
    // 💡 職人觀點：直接鎖定日文版專屬的 hover 染色
    const hoverColor = 'hover:theme-text-pink';

    return `
        <div class="flex justify-between items-center px-6">
            <div class="flex items-center gap-2">
                <span class="text-lg">📂</span>
                <h3 class="text-sm font-black text-slate-700 uppercase tracking-tighter">Knowledge Vault</h3>
            </div>
            <button onclick="App.promptClearVault(this)" 
                    class="text-[9px] font-black text-slate-300 uppercase tracking-widest ${hoverColor} transition-colors">
                PURGE VAULT
            </button>
        </div>
    `;
},

/** 📑 子函數 D：標籤導航 (V2026.ULTRA 多語對位版) */
_renderTranslateTabs(categories, currentCat, isEN) {
    // 🚀 1. 語義映射表：確保切換至 EN 時標籤同步導通 (對位情境庫)
    const langMap = {
        '全部': 'ALL', 
        '交通': 'TRANSPORT', 
        '用餐': 'DINING', 
        '購物': 'SHOPPING', 
        '醫藥': 'MEDICAL', 
        '住宿': 'STAY', 
        '景點': 'SIGHTS'
    };

    // 🚀 2. 動態配色方案
    // 💡 職人診斷：EN 模式採用專業藍 (#3b82f6)，JP 模式維持職人粉
    const activeBtnClass = isEN 
        ? 'bg-blue-600 text-white shadow-blue-100' 
        : 'theme-bg text-white shadow-pink-100';
    
    return `
        <div id="translate-tabs" class="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x px-4 scroll-smooth">
            ${categories.map(cat => {
                const rawCat = cat.trim();
                const isHit = currentCat === rawCat;
                
                // 🚀 3. 實體標籤翻譯
                const displayLabel = isEN 
                    ? (langMap[rawCat] || rawCat.toUpperCase()) 
                    : rawCat;

                return `
                <div class="snap-center">
                    <button id="trans-tab-${encodeURIComponent(rawCat)}" 
                            onclick="App.filterTranslate('${rawCat}')" 
                            class="px-5 py-2.5 rounded-2xl text-[11px] font-black border transition-all whitespace-nowrap
                            ${isHit ? `${activeBtnClass} border-transparent shadow-lg scale-105` : 'bg-white text-slate-400 border-slate-100'}">
                        ${displayLabel}
                    </button>
                </div>`;
            }).join('')}
            
            <button onclick="App.promptEditTranslateCategories()" 
                    class="px-4 py-2.5 rounded-2xl bg-slate-50 text-slate-300 border border-dashed border-slate-200 active:scale-90 transition-all shrink-0">
                <i class="fa-solid fa-sliders text-[10px]"></i>
            </button>
        </div>
    `;
},


/** 🧬 局部渲染引擎：標籤物理置中捲動 (V2026.ULTRA 絕對座標版) */
focusTranslateTab(cat) {
    // 🚀 職人診斷：使用 requestAnimationFrame 確保 DOM 節點已實體化
    requestAnimationFrame(() => {
        // 💡 對位修正：ID 必須與 _renderTranslateTabs 內的生成的 id 100% 匹配
        const safeId = `trans-tab-${encodeURIComponent(cat.trim())}`;
        const tab = document.getElementById(safeId);
        
        if (tab) {
            tab.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' // 核心指令：水平置中
            });
            console.log(`🧭 [UI-Focus] 情境標籤對焦: ${cat}`);
        } else {
            console.warn(`⚠️ [UI-Focus] 找不到標籤 ID: ${safeId}`);
        }
    });
},



/** 🎨 [Module] 文章包渲染引擎 (V2026.ULTRA.FINAL 比例復位與空間穩壓版) */
_renderArticlePackageWithTabs(item) {
    const style = translationView._getCategoryStyle(item.category || '一般');
    
    return `
        <div class="bg-white rounded-[2.5rem] px-4 py-6 mb-6 border border-slate-100 shadow-sm animate-slide-up overflow-hidden" id="pkg-${item.id}">
            <div class="flex justify-between items-start cursor-pointer mb-2 px-1" onclick="translationEngine.toggleArticleFolder('${item.id}')">
                <div class="flex items-start gap-4 min-w-0 flex-1">
                    <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0 mt-1">
                        ${style.icon}
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="text-[17px] font-black text-slate-800 leading-[1.4] mb-2 break-words">${item.title}</h4>
                        <div class="flex flex-wrap items-center gap-2">
                             <span class="text-[11px] font-black px-2.5 py-0.5 rounded-lg border-2 shadow-sm ${style.color} tracking-tight">
                                #${item.category || '一般'}
                             </span>
                             <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                ${item.segments?.length || 0} SEGS
                             </span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0 ml-2 mt-1">
                    <button onclick="event.stopPropagation(); translationEngine.editArticlePackage('${item.id}')" 
                            class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:theme-text-pink border border-slate-100 shadow-sm transition-all active:scale-90">
                        <i class="fa-solid fa-pen-to-square text-[13px]"></i>
                    </button>
                    <div id="arrow-${item.id}" class="w-8 h-10 flex items-center justify-center text-slate-300 transition-transform duration-500">
                        <i class="fa-solid fa-chevron-down text-[11px]"></i>
                    </div>
                </div>
            </div>

            <div class="hidden mt-6 pt-6 border-t border-slate-50 relative" id="content-${item.id}">
                <div class="flex gap-1.5 bg-slate-100/60 p-1.5 rounded-[1.3rem] mb-6 overflow-x-auto no-scrollbar relative z-50">
                    ${['原文', '單字', '文法', '測驗', '聽力'].map((tab, i) => `
                        <button onclick="event.stopPropagation(); translationEngine.switchArticleTab('${item.id}', '${tab}')" 
                                id="tab-btn-${item.id}-${tab}"
                                class="art-tab-btn flex-1 py-2.5 px-4 rounded-xl font-black text-[10px] whitespace-nowrap transition-all duration-300 ${i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}">
                            ${tab}
                        </button>
                    `).join('')}
                </div>

                <div id="tab-content-${item.id}" 
                     class="relative z-10 min-h-[100px] animate-fade-in px-1" 
                     style="line-height: 3.6 !important; letter-spacing: 0.05em !important; font-size: 19px !important; font-weight: 500; word-break: break-word;">
                </div>
            </div>
        </div>`;
},


/** 🎨 [UI-Revolution] 文章包渲染引擎 (V2026.ULTRA.FINAL 空間解放與比例復位版) */
_generateArticlePackageHTML(item) {
    const style = this._getCategoryStyle(item.category);
    
    return `
        <div class="bg-white rounded-[2.5rem] px-4 py-6 mb-6 border border-slate-100 shadow-sm animate-slide-up overflow-hidden" id="pkg-${item.id}">
            <div class="flex justify-between items-start cursor-pointer mb-2 px-1" onclick="translationEngine.toggleArticleFolder('${item.id}')">
                <div class="flex items-start gap-4 min-w-0 flex-1">
                    <div class="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0 mt-1">
                        ${style.icon}
                    </div>
                    <div class="min-w-0 flex-1">
                        <h4 class="text-[17px] font-black text-slate-800 leading-[1.4] mb-2 break-words">${item.title}</h4>
                        <div class="flex flex-wrap items-center gap-2">
                             <span class="text-[11px] font-black px-2.5 py-1 rounded-lg border-2 shadow-sm ${style.color}">
                                #${item.category || '一般'}
                             </span>
                             <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                ${item.segments?.length || 0} SEGS
                             </span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0 ml-2 mt-1">
                    <button onclick="event.stopPropagation(); translationEngine.editArticlePackage('${item.id}')" 
                            class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:theme-text-pink border border-slate-100 shadow-sm transition-all active:scale-90">
                        <i class="fa-solid fa-pen-to-square text-[13px]"></i>
                    </button>
                    <div id="arrow-${item.id}" class="w-8 h-10 flex items-center justify-center text-slate-300 transition-transform duration-500">
                        <i class="fa-solid fa-chevron-down text-[11px]"></i>
                    </div>
                </div>
            </div>

            <div class="hidden mt-6 pt-6 border-t border-slate-50 relative" id="content-${item.id}">
                <div class="flex gap-1.5 bg-slate-100/60 p-1.5 rounded-[1.3rem] mb-6 overflow-x-auto no-scrollbar relative z-50">
                    ${['原文', '單字', '文法', '測驗', '聽力'].map((tab, i) => `
                        <button onclick="event.stopPropagation(); translationEngine.switchArticleTab('${item.id}', '${tab}')" 
                                id="tab-btn-${item.id}-${tab}"
                                class="art-tab-btn flex-1 py-2.5 px-4 rounded-xl font-black text-[10px] whitespace-nowrap transition-all duration-300 ${i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}">
                            ${tab}
                        </button>
                    `).join('')}
                </div>

                <div id="tab-content-${item.id}" 
                     class="relative z-10 min-h-[100px] animate-fade-in px-1" 
                     style="line-height: 3.6 !important; letter-spacing: 0.05em !important; font-size: 19px !important; font-weight: 500; word-break: break-word;">
                </div>
            </div>
        </div>`;
},

/** 🎨 [Module] 教材等級過濾器 (V2026.ULTRA.TIER) */
_renderTierFilterBar(articleId, tabName, activeTier) {
    const tiers = ['ALL', 'N5', 'N4', 'N3', 'N2', 'N1'];
    return `
        <div class="flex items-center gap-2 px-1 overflow-x-auto no-scrollbar py-1">
            ${tiers.map(t => `
                <button onclick="translationEngine.switchArticleTab('${articleId}', '${tabName}', '${t}')" 
                        class="shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest transition-all duration-300
                        ${activeTier === t 
                            ? 'theme-bg text-white shadow-md shadow-pink-100 scale-105' 
                            : 'bg-white text-slate-400 border border-slate-100 hover:border-pink-100'}">
                    ${t}
                </button>
            `).join('')}
        </div>`;
},

/** 🎨 [Module] 教材內容渲染引擎 (V2026.ULTRA.PAGINATION) */
_renderEduContent(type, data, itemId, activeTier = 'ALL', currentPage = 1) {
    // 🚀 1. 數據純化與等級對焦
    const rawPool = Array.isArray(data) ? data : (data ? [data] : []);
    const filteredPool = rawPool.filter(item => {
        if (activeTier === 'ALL') return true;
        const itemLevel = String(item.level || item.級別 || '').trim().toUpperCase();
        return itemLevel === String(activeTier).toUpperCase();
    });

    if (filteredPool.length === 0) return this._renderEmptyState(activeTier);

    // 🚀 2. 物理分頁切片 (5 單位一幀)
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredPool.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const pagedItems = filteredPool.slice(startIndex, startIndex + itemsPerPage);

    // 🚀 3. 構造組件軌道
    const safeItemId = String(itemId);
    const navHtml = totalPages > 1 ? this._renderPaginationTabs(type, safeItemId, activeTier, currentPage, totalPages) : '';
    const cardsHtml = this._dispatchCardRendering(type, pagedItems, startIndex, safeItemId);
    const comparisonHtml = this._renderAutoComparisonFlow(type, pagedItems, safeItemId);

    // 🚀 4. 物理佈局：[上導航] -> [卡片] -> [下導航]
    return `
        <div class="flex flex-col gap-8 animate-fade-in">
            ${navHtml}
            <div class="edu-card-stack space-y-4">
                ${cardsHtml}
                ${comparisonHtml}
            </div>
            ${navHtml}
        </div>
    `;
},

/** 📑 [UI] 圓角分頁導航條 (極簡輕量化 V2026.ULTRA) */
_renderPaginationTabs(type, itemId, tier, current, total) {
    let tabs = "";
    // 🚀 職人修正：縮小按鈕尺寸，改用圓形/方圓比例，並鎖定全域導通路徑
    for (let i = 1; i <= total; i++) {
        const isActive = i === current;
        tabs += `
            <button onclick="window.translationEngine.switchEduPage('${type}', '${itemId}', '${tier}', ${i})"
                class="w-8 h-8 flex items-center justify-center rounded-xl text-[9px] font-black transition-all duration-300
                ${isActive ? 'theme-bg text-white shadow-lg scale-110' : 'bg-slate-50 text-slate-300 hover:bg-slate-100'}">
                ${i}
            </button>
        `;
    }

    // 🚀 佈局修正：使用 flex-wrap 避免溢出，縮小內距與背景厚度
    return `
        <div class="flex flex-wrap items-center justify-center gap-2 px-4 py-3 sticky top-0 z-20 bg-white/60 backdrop-blur-sm rounded-3xl">
            <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest mr-1">Page</span>
            ${tabs}
        </div>
    `;
},

/** 🛰️ [Dispatcher] 根據類型分發卡片渲染 */
_dispatchCardRendering(type, items, startIndex, itemId) {
    switch (type) {
        case '單字': return items.map((v, i) => this._renderVocabCard(v, startIndex + i, itemId)).join('');
        case '文法': return items.map((g, i) => this._renderGrammarCard(g, startIndex + i, itemId)).join('');
        case '測驗': return `<div class="space-y-10">${items.map((q, i) => this._renderQuizCard(q, startIndex + i, itemId)).join('')}</div>`;
        case '聽力': return items.map((l, i) => this._renderListeningCard(l, startIndex + i, itemId)).join('');
        default: return `<div class="p-10 text-center text-rose-400 font-black text-[10px]">UNKNOWN_TYPE</div>`;
    }
},

/** 🔍 [Logic] 自動語義碰撞偵測 */
_renderAutoComparisonFlow(type, items, itemId) {
    if (items.length <= 1 || (type !== '單字' && type !== '文法')) return "";
    
    const coreMap = new Map();
    items.forEach(item => {
        const rawLabel = (type === '單字') ? (item.word || item[0] || "") : (item.point || "");
        const label = String(rawLabel).split('(')[0].split('（')[0].trim();
        if (label) {
            if (!coreMap.has(label)) coreMap.set(label, []);
            coreMap.get(label).push(item);
        }
    });

    let html = "";
    coreMap.forEach((group, baseLabel) => {
        if (group.length > 1) {
            html += this._renderAutoComparison ? this._renderAutoComparison(baseLabel, group, type, itemId) : "";
        }
    });
    return html;
},




/** 🧬 [Private] EDU 預留位置渲染 (V2026.ULTRA 純視覺引導版) */
_renderEduPlaceholder(itemId, tabName) {
    const iconMap = { '單字': '📖', '文法': '📝', '測驗': '❓', '聽力': '🎧' };
    const icon = iconMap[tabName] || '🎓';

    return `
        <div class="py-16 px-8 bg-slate-50/30 rounded-[2.8rem] border-2 border-dashed border-slate-100/60 animate-fade-in text-center">
            <div class="text-5xl mb-6 grayscale opacity-40">${icon}</div>
            
            <div class="space-y-3">
                <p class="text-[15px] font-black text-slate-400 tracking-tight">等待注入「${tabName}」精煉燃料</p>
                <p class="text-[10px] text-slate-300 font-bold uppercase tracking-[0.2em] leading-relaxed">
                    磁區目前處於真空狀態<br>請點擊上方按鈕執行數據投射
                </p>
            </div>
        </div>`;
},

    // ============================================================
    // 🧬 C分區：影子特訓專區
    // ============================================================

/** 🧪 [Training-Wall] 特訓牆核心渲染發動機 (V2026.ULTRA.FINAL_STABLE) */
renderTrainingWall(container, dueItems) {
    // 🚀 1. 物理感應：獲取當前全局語系 DNA 與上下文狀態
    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
    const context = state.trainingContext || { mode: '讀', level: 'All', page: 1, perPage: 10, displayMode: '漢字' };
    const { mode, level, page, perPage, displayMode } = context;

    // 🚀 2. 核心焊接：雙重過濾協定 (語系隔離 + 能階對焦)
    let filteredItems = dueItems.filter(it => {
        // A. 語系隔離：偵測燃料指紋，排除非當前語系的數據
        // 💡 職人診斷：判斷屬性 it.lang，若無則依據 type 特徵自癒
        const itemLang = it.lang || (it.type?.includes('EN') ? 'EN' : 'JP');
        if (itemLang !== currentLang) return false;

        // B. 能階對焦：鎖定 JLPT(N1-5) 或 CEFR(A1-C2)
        return level === 'All' || level === '全部' || 
               String(it.level || "").trim().toUpperCase() === String(level).trim().toUpperCase();
    });

    let html = `<div class="max-w-2xl mx-auto pb-40 animate-fade-in">
                    ${this._renderTrainingHeader(mode, level, displayMode)}`;

    if (mode === '設定') {
        html += this._renderTrainingSettings();
    } 
    else if (mode === '挑戰') {
        // 🚀 3. 挑戰模式分流：傳入已過濾的「純淨語系燃料」
        html += this._renderChallengeSection(filteredItems, level);
    }
    else {
        // 🚀 4. 學習模式：隨機亂序處理 (僅針對當前頁面燃料)
        if (filteredItems.length > 0) {
            for (let i = filteredItems.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [filteredItems[i], filteredItems[j]] = [filteredItems[j], filteredItems[i]];
            }
        }
        
        const totalPages = Math.ceil(filteredItems.length / perPage) || 1;
        const safePage = Math.min(page, totalPages);
        const pagedItems = filteredItems.slice((safePage - 1) * perPage, safePage * perPage);

        html += `
            <div class="mb-8">${this._renderPagination(safePage, totalPages)}</div>
            <div id="training-card-stack" class="space-y-8 min-h-[400px]">
                ${pagedItems.length > 0 
                    ? pagedItems.map(item => this._renderShadowCard(item, mode, displayMode)).join('') 
                    : this._renderEmptyState(level)}
            </div>
            <div class="mt-12">${this._renderPagination(safePage, totalPages)}</div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // 🚀 5. 物理對焦補償
    if (mode !== '設定') {
        requestAnimationFrame(() => this._autoCenterTab('level-tabs-track'));
    }
},


/** 🎯 [Module] 挑戰模式子渲染引擎 (V2026.ULTRA.TRUE_ENDLESS) */
_renderChallengeSection(dueItems, level) {
    // 🚀 1. 動態冷卻閾值自癒 (Dynamic Cooling Calibration)
    // 💡 職人診斷：若總燃料少於等於 5 筆，冷卻深度降至 1 (僅不重複上一題)
    // 若燃料充沛，則維持 10 筆冷卻，確保挑戰的多樣性。
    const coolingLimit = dueItems.length <= 5 ? 1 : 10;
    const activeRecentIds = (state.recentChallengeIds || []).slice(-coolingLimit);

    // 🚀 2. 狀態分流：準備畫面 (靜態導通)
    if (!state.challengeActive) {
        // 💡 修正：不再傳遞長度參數，實現秒開介面
        return this._renderChallengeReadyScreen(); 
    } 
    
    // 🚀 3. 戰鬥軌道：數據採樣與降壓邏輯
    // A. 嘗試從「非近期出現」且「等級匹配」的燃料中選取
    const filteredItems = dueItems.filter(it => {
        const isRecent = activeRecentIds.includes(it.id);
        const levelMatch = (level === 'All' || level === '全部') || 
                           (String(it.level || "N3").trim().toUpperCase() === String(level).trim().toUpperCase());
        return levelMatch && !isRecent;
    });

    // B. 降壓協定：若過濾後池子炸裂（空了），直接無視冷卻限制從全量等級池抓題
    let pool = filteredItems.length > 0 ? filteredItems : dueItems.filter(it => 
        (level === 'All' || level === '全部') || 
        (String(it.level || "N3").trim().toUpperCase() === String(level).trim().toUpperCase())
    );
    
    // 最終熔斷：若磁區真的空空如也，點亮空狀態
    if (pool.length === 0) return this._renderEmptyState(level);

    // 🚀 4. 強制指針對焦 (強制點火下一題)
    if (!state.currentChallengeItem) {
        const randomIndex = Math.floor(Math.random() * pool.length);
        state.currentChallengeItem = pool[randomIndex];
        console.log(`⚡ [Endless-Engine] 磁區對焦成功 | 池大小: ${pool.length} | 目標: ${state.currentChallengeItem.word}`);
    }

    return `
        <div id="challenge-battle-field" class="min-h-[500px] flex flex-col justify-center animate-fade-in relative">
            
            ${this._renderChallengeCard(state.currentChallengeItem, pool)}
            
            <div class="mt-12 flex flex-col items-center gap-4">
                <div class="flex items-center gap-2 opacity-40">
                    <div class="w-1 h-1 rounded-full bg-slate-400 animate-pulse"></div>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em]">Endless Training Mode</p>
                    <div class="w-1 h-1 rounded-full bg-slate-400 animate-pulse"></div>
                </div>
                
                <button onclick="App.finalizeChallenge(state.challengeSessionResults)" 
                        class="group flex items-center gap-3 px-8 py-3 rounded-full border border-slate-100 bg-white/50 text-slate-400 hover:text-rose-500 hover:border-rose-100 hover:shadow-lg hover:shadow-rose-50 transition-all active:scale-95">
                    <i class="fa-solid fa-flag-checkered text-[12px] group-hover:animate-bounce"></i>
                    <span class="text-[10px] font-black uppercase tracking-widest">停止挑戰並結算戰報</span>
                </button>
            </div>
        </div>`;
},


/** 🛑 [Private] 渲染準備開始畫面 (V2026.ULTRA.SMART_IGNITION) */
_renderChallengeReadyScreen() {
    // 🚀 核心修正：移除 count 依賴，封殺因數據同步導致的渲染延遲
    // 職人診斷：確保 min-h 鎖定，防止倒數跳字時產生排版晃動
    return `
        <div class="py-24 text-center animate-fade-in px-6">
            <div id="countdown-display" class="mb-12 min-h-[160px] flex items-center justify-center">
                <div class="space-y-6">
                    <div class="w-20 h-20 theme-bg rounded-3xl rotate-12 flex items-center justify-center mx-auto shadow-2xl shadow-pink-200 animate-float">
                        <span class="text-4xl text-white -rotate-12">🎯</span>
                    </div>
                    <div>
                        <p class="text-black font-black text-2xl tracking-tight mb-2">準備好開始挑戰嗎？</p>
                        <p class="text-slate-400 font-medium text-[11px] uppercase tracking-[0.3em] opacity-60">
                            Linguistic Matrix Ready
                        </p>
                    </div>
                </div>
            </div>
            
            <button onclick="App.startChallengeCountdown()" 
                    class="w-full max-w-xs py-5 theme-bg text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-pink-100 active:scale-95 transition-all hover:brightness-110">
                START / 點火對焦
            </button>
            
            <p class="mt-8 text-[9px] text-slate-300 font-black uppercase tracking-[0.5em] opacity-40">
                System Ignition Protocol
            </p>
        </div>`;
},


/** 🎨 [Module] 渲染特訓頂部控制中樞 (V2026.ULTRA 跨語軌/CEFR 對焦版) */
_renderTrainingHeader(activeMode, activeLevel, displayMode) {
    // 🚀 1. 環境主權感應：獲取當前語系 DNA
    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
    const isEN = currentLang === 'EN';

    // 🚀 2. 語義與視覺映射矩陣 (Linguistic Matrix)
    // 💡 職人對焦：EN 模式採用藍色系與 CEFR 標籤；JP 模式維持職人粉與 JLPT
    const ui = isEN ? {
        theme: 'bg-blue-600',
        shadow: 'shadow-blue-100',
        leftLabel: 'Word',
        rightLabel: 'Spelling',
        levels: ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    } : {
        theme: 'theme-bg',
        shadow: 'shadow-pink-100',
        leftLabel: '漢字',
        rightLabel: '平假名',
        levels: ['All', 'N5', 'N4', 'N3', 'N2', 'N1']
    };

    // 🚀 3. 權限判定：定義組件顯影邏輯
    const showDisplaySwitcher = (activeMode === '讀'); 
    const showLevelTabs = (activeMode !== '挑戰' && activeMode !== '設定'); 

    return `
        <div class="training-header space-y-6 px-4 pt-6 animate-fade-in">
            <div class="flex justify-center gap-3 mb-2">
                <button onclick="App.setTransLanguage('JP')" 
                        class="px-5 py-1.5 rounded-full text-[9px] font-black border transition-all ${!isEN ? 'theme-bg text-white border-transparent' : 'bg-white text-slate-300 border-slate-100'}">JAPANESE</button>
                <button onclick="App.setTransLanguage('EN')" 
                        class="px-5 py-1.5 rounded-full text-[9px] font-black border transition-all ${isEN ? 'bg-blue-600 text-white border-transparent' : 'bg-white text-slate-300 border-slate-100'}">ENGLISH</button>
            </div>

            <div class="mode-dial flex bg-slate-100/60 p-1.5 rounded-[2.2rem] w-full shadow-inner border border-slate-200/50">
                ${['讀', '聽', '挑戰', '設定'].map(m => `
                    <button onclick="App.setTrainingTab('mode', '${m}')" 
                            class="flex-1 py-4 rounded-[1.8rem] text-[14px] font-black transition-all duration-300
                            ${activeMode === m ? 'bg-white theme-text-pink shadow-md scale-[1.02]' : 'text-slate-400'}">
                        ${m}
                    </button>
                `).join('')}
            </div>

            ${showDisplaySwitcher ? `
            <div class="display-switcher flex justify-center items-center gap-4 animate-fade-in">
                <div class="h-[1px] flex-1 bg-slate-100/80"></div>
                <div class="flex bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm ring-4 ring-slate-50/50">
                    <button onclick="App.setTrainingTab('displayMode', '漢字')" 
                            class="px-5 py-2 rounded-xl text-[10px] font-black transition-all
                            ${displayMode === '漢字' ? `${ui.theme} text-white shadow-lg ${ui.shadow}` : 'text-slate-300'}">
                        ${ui.leftLabel}
                    </button>
                    <button onclick="App.setTrainingTab('displayMode', '平假名')" 
                            class="px-5 py-2 rounded-xl text-[10px] font-black transition-all
                            ${displayMode === '平假名' ? `${ui.theme} text-white shadow-lg ${ui.shadow}` : 'text-slate-300'}">
                        ${ui.rightLabel}
                    </button>
                </div>
                <div class="h-[1px] flex-1 bg-slate-100/80"></div>
            </div>` : ''}

            ${showLevelTabs ? `
            <div id="level-tabs-track" class="flex gap-2 overflow-x-auto no-scrollbar py-2 px-2 scroll-smooth animate-fade-in">
                ${ui.levels.map(n => {
                    const isHit = (String(activeLevel).toUpperCase() === n.toUpperCase());
                    const label = n === 'All' ? '全部' : n;
                    
                    return `
                        <button id="lvl-tab-${n}" onclick="App.setTrainingTab('level', '${n}')"
                                class="flex-none px-6 h-10 rounded-2xl font-black text-[12px] transition-all duration-300
                                ${isHit ? `${ui.theme} text-white shadow-lg ${ui.shadow} scale-105` : 'bg-white text-slate-300 border border-slate-50'}">
                            ${label}
                        </button>`;
                }).join('')}
            </div>` : ''}
        </div>
    `;
},

_renderModeSwitcher(currentMode) {
    return `
        <div class="flex justify-center my-8">
            <div class="bg-slate-100/80 backdrop-blur-md p-1 rounded-[2rem] flex items-center shadow-inner border border-slate-200/50">
                ${['讀', '聽', '挑戰', '設定'].map(m => `
                    <button onclick="App.setTrainingTab('mode', '${m}')" 
                            class="min-w-[70px] px-5 py-2.5 rounded-[1.5rem] text-[12px] font-black tracking-widest transition-all 
                            ${currentMode === m ? 'bg-white theme-text-pink shadow-md ring-1 ring-black/5' : 'text-slate-400 hover:text-slate-600'}">
                        ${m}
                    </button>
                `).join('')}
            </div>
        </div>
    `;
},

/** 🎨 [Private] 分類 Tabs 渲染：執行標籤歸一化與座標校準 */
_renderLevelTabs(currentLevel) {
    const levels = ['All', 'N5', 'N4', 'N3', 'N2', 'N1'];
    
    // 🚀 核心焊接：強制歸一化，防止大小寫造成的比對失效
    const normalizedActive = String(currentLevel || 'All').trim().toUpperCase();

    return `
        <div id="level-tabs-track" class="flex gap-3 mb-10 overflow-x-auto no-scrollbar py-2 px-10 scroll-smooth">
            ${levels.map(n => {
                const rawN = n.trim();
                const isHit = (normalizedActive === rawN.toUpperCase());

                return `
                <button id="lvl-tab-${rawN}" 
                        onclick="App.setTrainingTab('level', '${rawN}')"
                        class="flex-none min-w-[64px] h-16 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center
                        ${isHit 
                            ? 'theme-bg text-white scale-110 shadow-xl shadow-pink-100 border-transparent' 
                            : 'bg-white text-slate-300 border border-slate-100 hover:border-pink-100'}">
                    ${rawN === 'All' ? '<i class="fa-solid fa-layer-group text-[10px] mr-1"></i> 全部' : rawN}
                </button>`;
            }).join('')}
        </div>
    `;
},


/** 🧬 [Internal] 渲染影子特訓卡片 (V2026.ULTRA.FINAL 跨語軌自癒版) */
_renderShadowCard(item, mode, displayMode = '漢字') {
    // 🚀 1. 環境與屬性感應
    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
    const isEN = item.lang === 'EN' || item.type === 'EN_VOCAB_8';
    
    const activeMode = (mode === '挑戰') ? (Math.random() > 0.5 ? '聽' : '讀') : mode;
    const isAudioOnly = activeMode === '聽';
    const cardId = `srs-card-${item.id}`;

    // 🚀 2. 數據解構協定 (Data Decoupling)
    // 💡 職人診斷：英文 8 元組與日文 7 元組索引對位，確保 Word 與音標/讀音導通
    const word = item.word || item["0"] || "---";
    const phonetic = item.reading || item["1"] || "---";
    
    // 🚀 3. 視覺映射：根據語軌切換標籤與配色
    const labels = isEN 
        ? { phonetic: 'IPA', main: (displayMode === '平假名' || displayMode === 'Spelling') ? phonetic : word, sub: (isAudioOnly ? 'Acoustic Target' : 'English Target') }
        : { phonetic: '讀音', main: (displayMode === '平假名') ? phonetic : word, sub: (isAudioOnly ? 'Acoustic Target' : `${displayMode} Target`) };

    const levelColorMap = {
        // JLPT 軌道
        'N1': 'bg-purple-50 text-purple-600 border-purple-100',
        'N2': 'bg-blue-50 text-blue-600 border-blue-100',
        'N3': 'bg-emerald-50 text-emerald-600 border-emerald-100',
        'N4': 'bg-orange-50 text-orange-600 border-orange-100',
        'N5': 'bg-pink-50 text-pink-600 border-pink-100',
        // CEFR 軌道 (💡 導通英文專屬藍色系)
        'A1': 'bg-sky-50 text-sky-600 border-sky-100',
        'A2': 'bg-blue-50 text-blue-600 border-blue-100',
        'B1': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        'B2': 'bg-violet-50 text-violet-600 border-violet-100',
        'C1': 'bg-fuchsia-50 text-fuchsia-600 border-fuchsia-100',
        'C2': 'bg-slate-800 text-white border-slate-700'
    };

    const currentLevel = (item.level || 'N/A').toUpperCase();
    const levelClass = levelColorMap[currentLevel] || 'bg-slate-50 text-slate-400 border-slate-100';
    const themeBtnClass = isEN ? 'bg-blue-600 shadow-blue-100' : 'theme-bg shadow-pink-100';

    // 🚀 4. 物理噴發
    return `
        <div id="${cardId}" 
             data-mode="${activeMode}" 
             class="srs-card group relative bg-white border border-slate-50 rounded-[3rem] p-8 shadow-xl transition-all duration-500 max-w-[320px] mx-auto mb-10 overflow-hidden">
            
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 ${levelClass} text-[10px] font-black rounded-lg border uppercase tracking-tighter">
                        ${currentLevel}
                    </span>
                    <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">${isEN ? 'English' : 'Japanese'}</span>
                </div>
                <button onclick="App.deleteSRSItem('${item.id}')" class="text-slate-100 hover:text-rose-400 transition-colors active:scale-90">
                    <i class="fa-solid fa-circle-xmark text-lg"></i>
                </button>
            </div>

            <div class="text-center py-8">
                <h3 class="text-4xl font-black text-slate-800 transition-all duration-700 ${isAudioOnly ? 'blur-2xl opacity-10 select-none scale-90' : ''}">
                    ${labels.main}
                </h3>
                <p class="text-[9px] font-black text-slate-300 mt-4 uppercase tracking-[0.3em]">
                    ${labels.sub}
                </p>
            </div>

            <div class="flex flex-col items-center gap-6">
                ${isAudioOnly ? `
                    <button onclick="App.speak('${word.replace(/'/g, "\\'")}')" 
                            class="w-16 h-16 ${isEN ? 'bg-blue-600' : 'bg-rose-500'} text-white rounded-full flex items-center justify-center shadow-lg active:scale-90 transition-all">
                        <i class="fa-solid fa-volume-high text-xl"></i>
                    </button>
                ` : ''}
                
                <button id="ans-gate-${item.id}" 
                        onclick="translationView.revealTrainingAnswer('${item.id}')" 
                        class="w-full py-5 ${isEN ? 'bg-blue-50 text-blue-600 border-blue-100' : 'bg-rose-50 text-rose-500 border-rose-100'} rounded-[2rem] font-black text-[11px] tracking-[0.3em] uppercase border shadow-sm active:scale-95 transition-all">
                    Reveal / 揭曉答案
                </button>
            </div>

            <div id="ans-payload-${item.id}" class="hidden mt-6 pt-6 border-t border-dashed border-slate-100 animate-slide-up">
            </div>
        </div>`;
},


/** 📄 [Internal] 渲染分頁組件 (置中語法) */
_renderPagination(current, total) {
    if (total <= 1) return '';
    return `
        <div class="flex justify-center items-center gap-6">
            <button onclick="App.setTrainingTab('page', ${Math.max(1, current - 1)})" 
                    class="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm">
                <i class="fa-solid fa-chevron-left"></i>
            </button>
            <div class="flex flex-col items-center">
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Deck Page</span>
                <span class="text-xs font-black text-slate-800">${current} / ${total}</span>
            </div>
            <button onclick="App.setTrainingTab('page', ${Math.min(total, current + 1)})" 
                    class="w-12 h-12 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 active:scale-90 transition-all shadow-sm">
                <i class="fa-solid fa-chevron-right"></i>
            </button>
        </div>
    `;
},

/** 📊 [Module] 渲染特訓中心專屬設定 (V2026.ULTRA 語域感應加固版) */
_renderTrainingSettings() {
    // 🚀 1. 環境主權感應：鎖定當前語系 DNA
    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
    const isEN = currentLang === 'EN';

    // 🚀 2. 數據磁軌對焦：物理分流過濾
    // 💡 職人診斷：強制對比 it.lang，封殺異物語軌數據混疊
    const allSrsData = state.srsMetadata || [];
    const srsData = allSrsData.filter(it => {
        const itemLang = it.lang || (it.type?.includes('EN') ? 'EN' : 'JP');
        return itemLang === currentLang;
    });

    const total = srsData.length;
    
    // 🚀 3. 指標精煉
    const stats = {
        learning: srsData.filter(it => it.stage > 0 && it.stage < 5).length,
        solidified: srsData.filter(it => it.stage >= 5).length,
        due: srsData.filter(it => it.nextReview && new Date(it.nextReview) <= new Date()).length
    };

    const solidifiedRate = total > 0 ? Math.round((stats.solidified / total) * 100) : 0;

    // 🚀 4. 自動導通與防禦鎖定
    // 職人診斷：若當前語系磁區為空且未曾掃描，觸發針對該語系的同步
    if (total === 0 && !state.hasAutoScanned) {
        setTimeout(() => {
            const scanBtn = document.querySelector('button[onclick*="manualSRSRefresh"]');
            if (scanBtn) App.manualSRSRefresh(scanBtn, true); 
        }, 50);
    }

    // 🚀 5. 視覺元素映射
    const langLabel = isEN ? 'English Track' : '日文磁區';
    const subLabel = isEN ? 'CEFR Level Analysis' : 'JLPT 記憶矩陣';

    return `
        <div class="space-y-6 animate-fade-in mb-10 mt-10">
            <div class="px-4">
                <div class="flex justify-between items-end mb-2 px-2">
                    <div>
                        <h4 class="text-slate-800 font-black text-sm tracking-tight">${langLabel}統計</h4>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">${subLabel}</p>
                    </div>
                </div>
                ${this._renderMemoryMatrix(total, stats, solidifiedRate)}
            </div>
            
            ${this._renderMaintenancePanel()}
            
            <p class="px-8 text-center text-[10px] text-slate-400 leading-relaxed font-medium pb-6">
                V2026.ULTRA / ${currentLang} 數據主權對焦中<br>
                <span class="opacity-50 tracking-widest uppercase">Linguistic Matrix Service</span>
            </p>
        </div>
    `;
},


/** 🧬 [Component] 渲染學習進度看板 (台灣在地直覺版) */
_renderMemoryMatrix(total, stats, rate) {
    return `
        <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 relative overflow-hidden group">
            <div class="relative z-10">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h4 class="text-black font-medium text-xl mb-1">學習進度看板</h4>
                        <p class="text-[11px] text-slate-400 font-medium uppercase tracking-[0.2em]">Learning Status</p>
                    </div>
                    
                    <button onclick="App.manualSRSRefresh(this)" 
                            class="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-black hover:bg-white hover:shadow-md active:scale-90 transition-all group/scan">
                        <i class="fa-solid fa-arrows-rotate text-[11px] group-hover/scan:text-pink-500"></i>
                        <span class="text-[10px] font-medium tracking-tighter uppercase">手動同步進度</span>
                    </button>
                </div>

                <div class="w-full h-2.5 bg-slate-100 rounded-full mb-8 overflow-hidden flex ring-4 ring-slate-50/50">
                    <div style="width: ${rate}%" class="h-full theme-bg transition-all duration-1000 ease-out"></div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <button onclick="translationView._toggleSettingChart('${total}', 'stage-chart')" 
                            class="p-5 bg-slate-50 rounded-[1.8rem] border border-slate-100 text-center active:scale-95 transition-all">
                        <p class="text-3xl font-medium text-black mb-1">${total}</p>
                        <p class="text-[11px] text-black opacity-50 font-medium">總單字量</p>
                    </button>
                    
                    <button onclick="translationView._toggleSettingChart('${stats.learning}', 'learning-pie')" 
                            class="p-5 bg-pink-50/50 rounded-[1.8rem] border border-pink-100/20 text-center active:scale-95 transition-all">
                        <p class="text-3xl font-medium text-black mb-1">${stats.learning}</p>
                        <p class="text-[11px] text-black opacity-50 font-medium">還沒記熟</p>
                    </button>
                    
                    <button onclick="translationView._toggleSettingChart('${stats.due}', 'due-timeline')" 
                            class="p-5 bg-emerald-50/50 rounded-[1.8rem] border border-emerald-100/20 text-center active:scale-95 transition-all">
                        <p class="text-3xl font-medium text-black mb-1">${stats.due}</p>
                        <p class="text-[11px] text-black opacity-50 font-medium">今天要複習</p>
                    </button>
                </div>

                <div id="settings-chart-space" class="hidden mt-6 p-6 bg-slate-50/60 rounded-[2.5rem] border border-slate-100/50 animate-slide-up">
                    <div id="chart-content"></div>
                </div>
            </div>
        </div>
    `;
},

/** ⚙️ [Component] 渲染磁區狀態維護面板 */
_renderMaintenancePanel() {
    return `
        <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div class="mb-6">
                <h4 class="text-black font-medium text-lg mb-1">磁區狀態維護</h4>
                <p class="text-[10px] text-slate-400 font-medium uppercase tracking-widest">Maintenance Protocol</p>
            </div>

            <div class="space-y-3">
                <button onclick="App.syncSRSShadow()" 
                        class="w-full p-6 bg-slate-50 hover:bg-white border border-transparent hover:border-slate-100 rounded-2xl flex items-center justify-between group active:scale-[0.98]">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 theme-bg text-white rounded-xl flex items-center justify-center shadow-lg shadow-pink-100">
                            <i class="fa-solid fa-rotate text-lg"></i>
                        </div>
                        <div class="text-left">
                            <p class="text-[16px] font-medium text-black">同步最新教材燃料</p>
                            <p class="text-[11px] text-slate-400 font-medium italic">Sync local vault to shadow sector</p>
                        </div>
                    </div>
                </button>

                <button onclick="App.forceResetSRS()" 
                        class="w-full p-6 bg-rose-50/30 hover:bg-white border border-transparent hover:border-rose-100 rounded-2xl flex items-center justify-between group active:scale-[0.98]">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center">
                            <i class="fa-solid fa-trash-can text-lg"></i>
                        </div>
                        <div class="text-left">
                            <p class="text-[16px] font-medium text-black">格式化特訓磁區</p>
                            <p class="text-[11px] text-slate-400 font-medium">Wipe all SRS fingerprints</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    `;
},


/** 🧬 [Helper] 處理設定區圖表切換邏輯 (台灣在地白話導通版) */
_toggleSettingChart(value, type) {
    const space = document.getElementById('settings-chart-space');
    const content = document.getElementById('chart-content');
    const srsData = state.srsMetadata || [];
    
    if (!space || !content) return;

    // 🚀 1. 開關鎖定
    if (!space.classList.contains('hidden') && space.dataset.active === type) {
        space.classList.add('hidden');
        space.dataset.active = "";
        return;
    }

    space.dataset.active = type;
    space.classList.remove('hidden');

    let html = '';
    
    switch (type) {
        case 'stage-chart': {
            // 📊 分佈歸一：映射至 5 大直覺狀態
            const grouped = [0, 0, 0, 0, 0]; 
            srsData.forEach(it => {
                const s = it.stage || 0;
                if (s === 0) grouped[0]++;
                else if (s <= 2) grouped[1]++;
                else if (s <= 4) grouped[2]++;
                else if (s <= 6) grouped[3]++;
                else grouped[4]++;
            });

            const max = Math.max(...grouped, 1);
            const labels = ["新單字", "不熟", "還可以", "很熟", "熟透了"];

            html = `
                <p class="text-[14px] text-slate-400 font-medium mb-8 text-center tracking-widest">目前記憶分佈 (從新進到熟練)</p>
                <div class="flex items-end gap-6 h-32 px-4">
                    ${grouped.map((c, i) => `
                        <div class="flex-1 flex flex-col items-center gap-3 group">
                            <div class="text-[14px] font-medium text-black mb-1 transition-all ${c > 0 ? 'opacity-100' : 'opacity-20'}">
                                ${c}
                            </div>
                            
                            <div class="w-full bg-slate-100 rounded-t-xl relative transition-all duration-500 hover:theme-bg min-h-[4px]" 
                                 style="height: ${(c/max)*100}%">
                            </div>
                            
                            <span class="text-[12px] text-black font-medium tracking-tighter whitespace-nowrap">
                                ${labels[i]}
                            </span>
                        </div>
                    `).join('')}
                </div>`;
            break;
        }

        case 'learning-pie': {
            // 🍩 修正語義：封殺震盪期，改用「還沒記熟」
            const learningCount = Number(value);
            const total = srsData.length || 1;
            const ratio = Math.round((learningCount / total) * 100);
            
            html = `
                <div class="flex items-center gap-8 p-4 animate-fade-in">
                    <div class="relative w-20 h-20 shrink-0 flex items-center justify-center">
                        <svg class="w-full h-full -rotate-90">
                            <circle cx="40" cy="40" r="34" stroke="#f8fafc" stroke-width="6" fill="transparent"></circle>
                            <circle cx="40" cy="40" r="34" stroke="#ff4d91" stroke-width="8" fill="transparent" 
                                    stroke-dasharray="${(ratio / 100) * 213} 213" class="transition-all duration-1000"></circle>
                        </svg>
                        <span class="absolute text-[15px] font-medium text-black">${ratio}%</span>
                    </div>
                    <div>
                        <p class="text-[18px] text-black font-medium mb-2">單字熟練度分析</p>
                        <p class="text-[14px] text-slate-500 font-medium leading-relaxed">
                            磁區內有 <span class="text-black font-bold">${learningCount}</span> 筆單字處於「剛看過」的狀態。<br>
                            這些字還沒進到長期記憶，<span class="text-pink-500">明天很有可能就會忘記</span>，建議再多刷幾次。
                        </p>
                    </div>
                </div>`;
            break;
        }

        case 'due-timeline': {
            // 📅 修正語義：封殺 Protocol，改用「今天要複習」
            html = `
                <div class="text-center py-8 space-y-4 animate-fade-in">
                    <div class="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-3xl">⏰</div>
                    <div>
                        <p class="text-[18px] text-black font-medium">今天該複習的進度</p>
                        <p class="text-[14px] text-slate-500 font-medium mt-2 leading-relaxed">
                            目前有 <span class="text-emerald-500 font-bold">${value}</span> 個單字已經到期了。<br>
                            如果是全新的教材，<span class="text-black font-bold">建議現在就點點看</span>，幫大腦開機。
                        </p>
                    </div>
                </div>`;
            break;
        }
    }

    content.innerHTML = html;
    if (navigator.vibrate) navigator.vibrate(5);
},


/** 🧪 [Helper] 物理自動置中：座標精準校準版 (V2026.ULTRA) */
_autoCenterTab(trackId) {
    // 🚀 使用 requestAnimationFrame 確保 DOM 渲染與佈局計算已導通
    requestAnimationFrame(() => {
        const track = document.getElementById(trackId);
        if (!track) return;

        // 💡 職人診斷：精確定位該軌道內部的 active 按鈕 (避免抓到全域其他 theme-bg)
        const active = track.querySelector('.theme-bg');
        
        if (active) {
            // 🚀 核心焊接：計算絕對置中座標
            // 公式：(按鈕左偏移) - (容器寬度的一半) + (按鈕寬度的一半)
            const scrollLeft = active.offsetLeft - (track.offsetWidth / 2) + (active.offsetWidth / 2);
            
            // 🚀 物理位移執行
            track.scrollTo({
                left: scrollLeft,
                behavior: 'smooth'
            });

            // 💡 職人補強：針對部分行動端瀏覽器，若平滑捲動失敗，執行強制瞬間對位
            if (track.scrollLeft === 0 && scrollLeft > 0) {
                track.scrollLeft = scrollLeft;
            }
        }
    });
},


/** 🧬 [Shared-Component] 渲染模組空值狀態 (V2026.ULTRA 多態對焦版) 
 * 物理作用：支援全模組（情境翻譯/分級教材/影子特訓）的真空狀態顯影
 * @param {string} labelOrIcon - 傳入 Emoji (如 🏮) 或 級別標籤 (如 N3/A2)
 * @param {string} customMsg - 自定義提示訊息 (選配)
 */
_renderEmptyState(labelOrIcon, customMsg = "") {
    // 🚀 1. 物理參數洗滌與自癒
    const isEmoji = (s) => /[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(s); // 偵測是否為 Emoji
    
    // 判定傳入的第一參數屬性
    let icon = isEmoji(labelOrIcon) ? labelOrIcon : '📡';
    let label = isEmoji(labelOrIcon) ? (customMsg || '磁區真空') : labelOrIcon;
    let msg = isEmoji(labelOrIcon) ? '請執行數據同步或注入燃料' : (customMsg || '請先前往文章提取單字燃料後再行特訓');

    // 🚀 2. 自動語義感應 (根據 Label 字串特徵自動修正 Icon)
    const upperLabel = String(label).toUpperCase();
    if (upperLabel.includes('N') || upperLabel.includes('A1') || upperLabel.includes('B1')) icon = '🎓';
    if (upperLabel.includes('ALL') || upperLabel.includes('全部')) icon = '🌈';

    // 🚀 3. 實體噴發 (對位 V2026 圓角卡片視覺語言)
    return `
        <div class="py-24 text-center animate-fade-in border-2 border-dashed border-slate-50 rounded-[3.5rem] mx-2 bg-slate-50/20">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50">
                <div class="relative">
                    <span class="text-3xl grayscale opacity-40">${icon}</span>
                    <div class="absolute inset-0 text-3xl animate-ping opacity-10">${icon}</div>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Data Vacuum Detected
                </p>
                <h4 class="text-[16px] font-black text-slate-700 tracking-tighter">
                    Sector [ ${label.toUpperCase()} ]
                </h4>
                <div class="flex flex-col items-center gap-2 pt-2">
                    <div class="h-[1.5px] w-8 theme-bg opacity-30"></div>
                    <p class="text-[10px] text-slate-400 font-bold italic leading-relaxed px-10">
                        ${msg}
                    </p>
                </div>
            </div>
            
            <div class="mt-10 flex justify-center gap-1.5 opacity-20">
                ${[1, 2, 3].map(i => `<div class="w-1 h-1 theme-bg rounded-full animate-pulse" style="animation-delay: ${i * 0.2}s"></div>`).join('')}
            </div>
        </div>`;
},

/** 🔓 [Action] 終極揭曉：視覺對焦品詞標籤 (V2026.ULTRA.FINAL 標籤導通版) */
async revealTrainingAnswer(id) {
    const payload = document.getElementById(`ans-payload-${id}`);
    const gate = document.getElementById(`ans-gate-${id}`);
    if (!payload || !gate) return;

    // 🚀 1. 物理提領：啟動對焦動畫
    gate.innerHTML = `
        <div class="py-2 text-center animate-pulse">
            <span class="theme-text-pink font-black text-[9px] uppercase tracking-widest">對焦中...</span>
        </div>
    `;
    
    const data = await translationEngine.getHydratedTrainingItem(id);
    
    if (!data) {
        gate.innerHTML = `<button onclick="translationView.revealTrainingAnswer('${id}')" class="w-full py-4 bg-rose-50 text-rose-400 rounded-xl font-black text-[10px]">RETRY</button>`;
        return;
    }

    gate.classList.add('hidden');
    payload.classList.remove('hidden');

    // 🚀 2. 數據噴發：品詞標籤化 (支援點擊導航) + 14px 字級歸一
    payload.innerHTML = `
        <div class="space-y-4 animate-fade-in px-1">
            
            <div class="p-5 bg-slate-50/80 rounded-[2.2rem] border border-slate-100 text-center relative">
                <p class="text-[8px] font-black text-slate-300 uppercase mb-2 tracking-widest">Reading & Standard</p>
                <div class="text-xl font-bold text-slate-400 mb-1">${data.reading || '---'}</div>
                <div class="text-2xl font-black text-slate-800 tracking-tight mb-3">${data.word || '---'}</div>

                <div class="flex justify-center -mb-2">
                    <button onclick="App.speak('${(data.word || '').replace(/'/g, "\\'")}')" 
                            class="w-12 h-12 bg-white text-rose-500 rounded-full flex items-center justify-center shadow-md border border-rose-50 active:scale-90 transition-all">
                        <i class="fa-solid fa-volume-high text-sm"></i>
                    </button>
                </div>
            </div>

            <div class="p-5 bg-rose-50/20 rounded-[2.2rem] border border-rose-100/30">
                <div class="flex flex-col items-center gap-3">
                    
                    ${data.pos ? `
                        <button onclick="event.stopPropagation(); translationEngine.showPosGuide('${data.rawPOS || data.pos}')" 
                                class="px-5 py-1.5 rounded-full theme-bg text-white text-[14px] font-black tracking-wider shadow-sm shadow-pink-100 active:scale-95 hover:brightness-110 transition-all flex items-center gap-1.5">
                            ${data.pos}
                            <i class="fa-solid fa-circle-info text-[10px] opacity-70"></i>
                        </button>
                    ` : ''}
                    
                    <div class="text-[14px] font-bold text-slate-700 leading-relaxed text-center px-2">
                        ${data.translation || data.trans || '未設定數據'}
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mt-2">
                <button onclick="App.submitTrainingResult('${id}', false)" 
                        class="py-4 bg-white text-rose-500 rounded-2xl font-black text-[12px] border border-rose-100 active:scale-95 transition-all uppercase tracking-tighter">
                    ✕ 沒印象
                </button>
                <button onclick="App.submitTrainingResult('${id}', true)" 
                        class="py-4 theme-bg text-white rounded-2xl font-black text-[12px] shadow-lg shadow-pink-100 active:scale-95 transition-all uppercase tracking-tighter">
                    ✓ 記住了
                </button>
            </div>
        </div>
    `;

    if (navigator.vibrate) navigator.vibrate(8);
},


/** 🌫️ [Visual-Effect] 卡片蒸發動畫：判定完成後的回收效應 */
updateTrainingCardUI(id, isSuccess) {
    const card = document.getElementById(`srs-card-${id}`);
    if (!card) return;

    // 🚀 1. 物理離場動畫：根據成功或失敗執行不同位移
    card.style.transition = 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)';
    card.style.opacity = '0';
    card.style.transform = isSuccess ? 'translateX(100px) rotate(10deg)' : 'translateY(-50px) scale(0.9)';
    
    // 🚀 2. 磁區回收與高度塌陷
    setTimeout(() => {
        card.style.display = 'none';
        
        // 💡 職人檢查：如果牆面空了，觸發熱刷新顯示「完成」狀態
        const remaining = document.querySelectorAll('.srs-card:not([style*="display: none"])');
        if (remaining.length === 0) {
            App.navigateTo('training');
        }
    }, 500);
},

/** 🏆 [Report-View] 渲染挑戰特訓成果報告 (V2026.ULTRA.LOCALIZED) */
renderChallengeReport(record) {
    const container = document.getElementById('content-container');
    if (!container) return console.error("❌ [View-Collapse] 找不到主渲染容器");

    // 🚀 1. 數據洗滌：確保百分比精確對焦本次會話
    const sessionCorrect = record.sessionCorrect || 0;
    const sessionTotal = record.sessionTotal || 0;
    const sessionAccuracy = sessionTotal > 0 
        ? Math.round((sessionCorrect / sessionTotal) * 100) 
        : 0;

    const isExcellent = sessionAccuracy >= 80;
    const themeClass = isExcellent ? 'theme-bg' : 'bg-slate-800';

    // 🚀 2. 實體噴發：導入台灣在地化專業語境
    container.innerHTML = `
        <div class="max-w-2xl mx-auto px-6 py-12 animate-bounce-in">
            <div class="bg-white rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-50 relative">
                
                <div class="${themeClass} p-12 text-center text-white relative transition-colors duration-700">
                    <p class="text-[10px] font-black opacity-60 uppercase tracking-[0.4em] mb-3">Training Performance</p>
                    <h3 class="text-8xl font-black tabular-nums tracking-tighter leading-none">${sessionAccuracy}%</h3>
                    
                    <div class="mt-6 inline-flex items-center gap-3 px-6 py-2 rounded-full bg-white/20 backdrop-blur-md border border-white/10">
                        <span class="text-[10px] font-black tracking-widest uppercase">
                            達成項目：${sessionCorrect} / ${sessionTotal}
                        </span>
                        <div class="w-px h-3 bg-white/30"></div>
                        <span class="text-[10px] font-black tracking-widest uppercase">
                            JLPT ${String(record.level).toUpperCase()}
                        </span>
                    </div>

                    <div class="absolute -bottom-4 -right-4 opacity-10 text-9xl font-black italic select-none pointer-events-none uppercase">
                        ${record.level}
                    </div>
                </div>

                <div class="p-10 space-y-10">
                    <div class="grid grid-cols-2 gap-6">
                        <div class="text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">聽力辨識 / Audio</p>
                            <span class="text-3xl font-black text-slate-800 tabular-nums">
                                ${record.audioStats?.correct || 0} <span class="text-sm text-slate-400 font-medium">/ ${record.audioStats?.total || 0}</span>
                            </span>
                        </div>
                        <div class="text-center p-6 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">文字識讀 / Visual</p>
                            <span class="text-3xl font-black text-slate-800 tabular-nums">
                                ${record.visualStats?.correct || 0} <span class="text-sm text-slate-400 font-medium">/ ${record.visualStats?.total || 0}</span>
                            </span>
                        </div>
                    </div>

                    <div>
                        <div class="flex justify-between items-end mb-4 px-1">
                            <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Stability Tracker</p>
                            <span class="text-[9px] font-bold text-slate-300 uppercase">全域穩定度：${record.accuracy || 0}%</span>
                        </div>
                        <div class="flex items-end gap-1.5 h-16 px-1">
                            ${this._renderMiniHistory ? this._renderMiniHistory() : '<div class="h-[1px] w-full bg-slate-100"></div>'}
                        </div>
                    </div>

                    <button onclick="App.navigateTo('training')" 
                            class="w-full py-6 theme-bg text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-[0_20px_50px_rgba(244,63,94,0.3)] active:scale-[0.98] transition-all hover:brightness-110 hover:shadow-[0_20px_60px_rgba(244,63,94,0.4)]">
                        返回整備中心
                    </button>
                    
                    <p class="text-center text-[9px] text-slate-300 font-bold uppercase tracking-widest">
                        數據識別碼：${record.id}
                    </p>
                </div>
            </div>
        </div>
    `;

    // 🚀 3. 職人震動序列
    if (navigator.vibrate) {
        if (isExcellent) navigator.vibrate([30, 50, 30, 100, 50]);
        else navigator.vibrate([50, 100]);
    }
},


/** 🧪 [Challenge] 渲染挑戰模式卡片 (V2026.ULTRA.Acoustic_Shield) */
_renderChallengeCard(item, allItems) {
    // 🚀 1. 物理安全隔離：封殺損毀數據
    if (!this._isValidChallengeFuel(item)) {
        return this._renderFuelErrorState(item);
    }

    // 🚀 2. 數據洗滌與自癒協定
    const { safeWord } = this._sanitizeChallengeFuel(item);

    // 🚀 3. 題型點火
    const q = challengeEngine.generateChallenge(item, allItems);
    const cardId = `challenge-${item.id}`;
    const modeFingerprint = q.type === 'listening' ? '聽' : '讀';

    // 🚀 4. 聲學直連噴發 (關鍵修正)
    if (q.type === 'listening' && state.challengeActive) {
        // 💡 職人診斷：避開 App.speak 以封殺 Toast UI 競爭，直接對準語音總線
        setTimeout(() => {
            // 🔒 雙重校準：確保播放瞬間使用者尚未手動退出挑戰
            if (state.challengeActive && window.audioManager) {
                console.log(`📢 [Acoustic-Weld] 直連噴發對焦: ${safeWord}`);
                // 執行 URL 解碼後直接送往底層播報
                window.audioManager.speak(decodeURIComponent(safeWord));
            }
        }, 400); // 稍微拉長至 400ms，確保 DOM 重繪線程已完全釋放
    }

    // 🚀 5. 實體地基渲染
    try {
        return `
            <div id="${cardId}" 
                 data-mode="${modeFingerprint}" 
                 data-type="${q.type}"
                 class="challenge-card relative bg-white border border-slate-50 rounded-[3rem] p-8 shadow-2xl max-w-[340px] mx-auto mb-10 overflow-hidden animate-slide-up">
                
                <div class="absolute top-0 left-0 h-1.5 theme-bg w-full origin-left animate-timer-shrink"></div>
                
                <div class="text-center mt-6">
                    <span class="px-4 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-full border border-slate-100 uppercase tracking-widest">
                        ${q.title || '對焦挑戰'}
                    </span>
                </div>

                <div class="text-center py-12 min-h-[180px] flex flex-col justify-center">
                    ${this._renderChallengeMainSlot(q, safeWord)}
                </div>

                <div class="grid grid-cols-1 gap-3">
                    ${this._renderChallengeOptions(q, item.id)}
                </div>
            </div>`;
    } catch (e) {
        console.error("❌ [Render-Collapse] 視圖衛星斷路:", e);
        return this._renderFuelErrorState(item);
    }
},

/** 🛡️ [Sub-Function] A：燃料完整性檢查 */
_isValidChallengeFuel(item) {
    if (!item) return false;
    // 💡 職人診斷：至少要具備 word 或 reading 其中一個，否則視為無效燃料
    return !!(item.word && item.word !== '---') || !!(item.reading && item.reading !== '---');
},

/** 🛡️ [Sub-Function] B：數據安全洗滌與自癒協定 */
_sanitizeChallengeFuel(item) {
    const clean = (val) => String(val || "").replace(/'/g, "\\'").replace(/"/g, "&quot;").trim();
    
    // 💡 職人自癒：若 word 缺失，自動以 reading 補位，確保 UI 不會出現空值或 undefined
    const rawWord = item.word && item.word !== '---' ? item.word : item.reading;
    const rawReading = item.reading && item.reading !== '---' ? item.reading : item.word;

    return {
        safeWord: clean(rawWord),
        safeReading: clean(rawReading)
    };
},

/** 🛡️ [Sub-Function] C：主槽位渲染分流 (聽力 vs 文字) */
_renderChallengeMainSlot(q, safeWord) {
    if (q.type === 'listening') {
        return `
            <button onclick="App.speak('${safeWord}')" 
                    class="w-24 h-24 bg-rose-500 text-white rounded-full flex items-center justify-center mx-auto shadow-xl active:scale-90 transition-all group/mic">
                <i class="fa-solid fa-volume-high text-4xl group-active/mic:scale-110"></i>
            </button>`;
    }
    return `<h3 class="text-3xl font-black text-slate-800 leading-tight tracking-tight">${q.content || '數據加載中'}</h3>`;
},

/** 🛡️ [Sub-Function] D：選項列表物理洗滌渲染 */
_renderChallengeOptions(q, itemId) {
    if (!q.options || !Array.isArray(q.options)) return '';
    
    return q.options.map((opt, i) => {
        // 🚀 核心防禦：對每個選項執行物理轉義，封殺單引號造成的 HTML 語法中斷
        const cleanOpt = String(opt || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
        const cleanCorrect = String(q.correct || "").replace(/'/g, "\\'").replace(/"/g, "&quot;");
        
        return `
            <button onclick="App.checkChallenge('${itemId}', '${cleanOpt}', '${cleanCorrect}')"
                    class="w-full p-5 rounded-2xl bg-slate-50 border border-slate-100 text-slate-700 font-bold text-[14px] active:scale-95 transition-all text-left flex items-center gap-4 hover:bg-white hover:shadow-lg group/opt">
                <span class="w-7 h-7 shrink-0 rounded-full bg-white border border-slate-200 text-slate-300 text-[10px] font-black flex items-center justify-center group-hover/opt:theme-bg group-hover/opt:text-white group-hover/opt:border-transparent transition-all">
                    ${i + 1}
                </span>
                <span class="flex-1 leading-snug">${opt}</span>
            </button>`;
    }).join('');
},

/** 🛡️ [Sub-Function] E：損毀燃料降壓處理 */
_renderFuelErrorState(item) {
    console.warn(`⚠️ [Fuel-Repair] 執行磁區自動重排: ${item?.id || 'Unknown ID'}`);
    // 💡 職人診斷：若遇到損毀數據，自動觸發重定向，封殺卡死現象
    setTimeout(() => {
        state.currentChallengeItem = null;
        App.navigateTo('training');
    }, 1500);

    return `
        <div class="py-20 text-center animate-pulse">
            <p class="text-rose-400 font-black text-[12px] uppercase tracking-widest mb-2">Linguistic Friction Detected</p>
            <p class="text-slate-400 text-xs">磁區數據不穩定，正在校準下一波燃料...</p>
        </div>`;
},

/** 🧬 [Internal] 渲染迷你歷史柱狀圖 */
_renderMiniHistory() {
    const history = JSON.parse(localStorage.getItem('tf_challenge_history') || '[]').slice(0, 10).reverse();
    if (history.length === 0) return '<div class="text-[9px] text-slate-200 italic">No historical data yet.</div>';
    
    return history.map(h => {
        const height = Math.max(10, h.accuracy);
        const color = h.accuracy >= 80 ? 'bg-pink-400' : 'bg-slate-300';
        return `<div class="flex-1 ${color} rounded-t-sm opacity-60 hover:opacity-100 transition-all" style="height: ${height}%"></div>`;
    }).join('');
},


    // ============================================================
    // 🧬 D分區：通用組件 (Shared Components)
    // 負責：精煉單字卡、翻譯紀錄卡、空值狀態、AI 指令按鈕
    // ============================================================

/** 🎴 核心組件：翻譯紀錄卡片 (V2026.ULTRA 穩壓版) */
    renderTranslateCard(item, idx, currentLang) {
        // 🚀 物理導通證明：將 App.speakLanguage 修正為 App.speak
        // 此處為之前換 PC 報錯的關鍵斷路點
        const rubyHtml = this._generateRubyHtml(item);
        const recordId = item.id || `trans-${idx}`;

        return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm hover:shadow-md transition-all group relative animate-fade-in mb-5 overflow-visible">
            <div class="absolute -top-3 right-6 flex items-center gap-2 z-30">
                <div class="flex items-center gap-1 bg-white border border-slate-100 px-2 py-1.5 rounded-2xl shadow-md">
                    <button onclick="event.stopPropagation(); App.activeTranslationEngine.toggleEditTranslate('${recordId}')" 
                            class="w-7 h-7 rounded-lg text-slate-300 hover:text-blue-400 flex items-center justify-center transition-all active:scale-90">
                        <i class="fa-solid fa-pen-to-square text-[9px]"></i>
                    </button>
                    <div class="w-[1px] h-3 bg-slate-100"></div>
                    <button onclick="event.stopPropagation(); App.activeTranslationEngine.deleteTranslateItem('${recordId}')" 
                            class="w-7 h-7 rounded-lg text-slate-300 hover:text-red-400 flex items-center justify-center transition-all active:scale-90">
                        <i class="fa-solid fa-trash-can text-[9px]"></i>
                    </button>
                    <div class="w-[1px] h-3 bg-slate-100"></div>
                    <button onclick="event.stopPropagation(); App.speak('${(item.a || item.翻譯 || "").replace(/'/g, "\\'")}')" 
                            class="w-7 h-7 rounded-lg text-slate-400 hover:theme-text-pink flex items-center justify-center transition-all active:scale-90">
                        <i class="fa-solid fa-volume-high text-[10px]"></i>
                    </button>
                </div>
            </div>

            <div class="space-y-4 relative z-10 pt-2">
                <p class="text-[11px] font-black text-slate-400 tracking-wide flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full theme-bg shadow-[0_0_8px_var(--theme-primary)]"></span>
                    ${item.q || item.原文}
                </p>
                <h4 class="text-[1.4rem] font-black text-slate-800 leading-[2.2] tracking-normal">${rubyHtml}</h4>
            </div>

            <div class="flex justify-between items-center mt-6 pt-4 border-t border-slate-50/80">
                <span class="bg-slate-50 text-slate-400 text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border border-slate-100">
                    ${item.category || '一般'}
                </span>
                <span class="text-[8px] font-bold text-slate-200 uppercase tabular-nums tracking-widest">Secured via Refinery</span>
            </div>
        </div>`;
    },


/** 🧬 子組件：渲染翻譯卡片清單 (V2026.ULTRA 視覺全導通版) */
_renderTranslateCards(items, activeCategory = '全部') {
    const targetCat = String(activeCategory).trim();
    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
    const currentIsJP = (currentLang === 'JP');

    // 🚀 1. 執行過濾邏輯
    const filtered = items.filter(item => {
        // 判定數據是否屬於當前語系磁區
        const isJPData = !!(item.romaji || item.segments || item.lang === 'JP' || item.type === 'article_package');
        if (isJPData !== currentIsJP) return false;
        
        if (targetCat === '全部') return true;
        
        // 物理對位：封殺空格干擾
        const itemCat = String(item.category || '一般').replace(/\s+/g, '');
        const filterCat = targetCat.replace(/\s+/g, '');
        return itemCat === filterCat;
    });

    // 🚀 2. 空值處理
    if (filtered.length === 0) {
        // 💡 職人診斷：絕對參照，確保在 map 閉包內依然導通
        return translationView._renderEmptyState(currentIsJP ? '🏮' : '📖', `${targetCat} 分區尚無燃料`);
    }

    // 🚀 3. 數據分流渲染
    return filtered.map((item) => {
        // 🎯 A 軌道：長文章燃料包
        if (item.type === 'article_package') {
            return translationView._renderArticlePackageWithTabs(item);
        }

        // 🎯 B 軌道：一般即時記錄 (單句卡片)
        // 💡 核心焊接：動態獲取樣式數據 (Icon 與 Color)
        const style = translationView._getCategoryStyle(item.category || '一般');
        const rubyHtml = translationView._generateRubyHtml(item); 

        return `
        <div class="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-md transition-all group relative animate-fade-in mb-5 overflow-hidden">
            <div onclick="App.speak('${(item.a || item.翻譯 || "").replace(/'/g, "\\'")}')" 
                 class="p-8 pb-14 space-y-4 cursor-pointer relative z-10 active:bg-slate-50/50 transition-colors">
                
                <p class="text-[11px] font-black text-slate-400 tracking-wide flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full theme-bg shadow-[0_0_8px_var(--theme-primary)]"></span>
                    ${item.q || item.原文}
                </p>
                
                <h4 class="text-[1.4rem] font-black text-slate-800 leading-[2.4] tracking-normal">
                    ${rubyHtml}
                </h4>
            </div>

            <div class="absolute bottom-5 right-8 z-20">
                <span class="text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${style.color}">
                    ${style.icon} ${item.category || '一般'}
                </span>
            </div>
        </div>`;
    }).join('');
},


    /** 🧪 私有輔助：生成 Ruby HTML (防崩潰洗滌版) */
    _generateRubyHtml(item) {
        if (item.segments && Array.isArray(item.segments)) {
            return item.segments.map(seg => 
                seg[1] ? `<ruby class="ruby-node">${seg[0]}<rt>${seg[1]}</rt></ruby>` : seg[0]
            ).join('');
        }
        return item.a || item.翻譯 || "";
    },

/** 🚀 AI 指令引擎：V2026.ULTRA 參數導通版 */
_getTranslateAiPrompt(query) {
    // 🚀 關鍵修正：優先採信傳入的 query 參數，若無才檢查 DOM，最後才回退
    const finalQuery = (query && typeof query === 'string') ? query.trim() : "";
    
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const availableCats = trip?.translateConfig?.categories || ['交通', '用餐', '購物', '醫藥'];
    
    // 💡 根據 finalQuery 決定語義情境
    const context = finalQuery ? `針對「${finalQuery}」的情境` : `常用`;
    
    return `你是一位日語翻譯與旅遊專家。請提供 5-8 句與「日本旅遊${context}相關對話」的語句，並以 JSON 陣列格式輸出。
    
🚨 核心語境協定 (Politeness Protocol)：
1. **嚴禁命令句**：請使用「丁寧語」(Desu/Masu) 或「委婉請求」格式。
2. **高端旅遊語境**：語氣應專業、有禮且體貼。

🚨 數據格式規範：
1. 輸出為純 JSON，不含解釋。
2. 欄位：q (中文), a (日文全句), segments (分段對位), romaji (羅馬拼音), category (分類)。
3. **[category] 必須嚴格限制在以下標籤中：[${availableCats.join(', ')}]**。
4. [segments] 格式：[["漢字或假名", "讀音"]], 確保漢字與讀音精確對焦。

範例：
{
  "q": "想預約今晚兩位吃水炊鍋 (對店員說)",
  "a": "今晩、水炊きを二人で予約したいのですが。",
  "segments": [["今晩", "こんばん"], ["、", ""], ["水炊", "みずた"], ["きを", ""], ["二人", "ふたり"], ["で", ""], ["予約", "よやく"], ["したいのですが。", ""]],
  "romaji": "Konban, mizutaki o futari de yoyaku shitai no desu ga.",
  "category": "${availableCats[1] || '用餐'}" 
}`;
},

/** 🧬 子組件：渲染微型確認氣泡 (職人通用回滾版) */
renderMiniConfirm(id, message, confirmAction) {
    return `
        <div id="${id}" class="absolute bottom-full right-0 mb-3 animate-slide-up z-[5000]">
            <div class="bg-slate-900 text-white px-4 py-2.5 rounded-[1.2rem] shadow-2xl flex items-center gap-4 whitespace-nowrap border border-white/10">
                <span class="text-[10px] font-black tracking-tight">${message}</span>
                <div class="flex gap-1.5">
                    <button onclick="document.getElementById('${id}').remove()" 
                            class="px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase transition-colors">取消</button>
                    <button onclick="${confirmAction}; document.getElementById('${id}').remove();" 
                            class="px-2.5 py-1 bg-rose-500 hover:bg-rose-600 rounded-lg text-[9px] font-black uppercase transition-colors">確定</button>
                </div>
            </div>
            <div class="w-2.5 h-2.5 bg-slate-900 rotate-45 absolute -bottom-1.5 right-6"></div>
        </div>
    `;
   }

};

// 🚀 物理掛載：確保部分 legacy code 仍能感應到它
window.translationView = translationView;