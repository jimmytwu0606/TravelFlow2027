/** 🎨 [en_translationView] 英美語學習專屬視圖引擎 - V2026.ULTRA.FINAL
 * 物理作用：語義數據介面化 (Linguistic UI Rendering)
 * 視覺協定：學習藍 (#3b82f6) / CEFR 標籤 / 8-Tuple 數據對焦
 */

import { en_challengeEngine } from './en_challengeEngine.js'; 
import { EN_CONFIG } from './en_config.js'; // 🚀 確保導入配置

export const en_translationView = {

    // ============================================================
    // 🎙️ A分區：英美語即時翻譯 (Real-time Module)
    // ============================================================

/** 🎭 [Real-time Module] 英文即時翻譯與學習主發動機 (V2026.ULTRA.FINAL 語軌對焦修正版) */
renderRealtimeTranslation(container, activeMode) {
    if (!container) return;

    // 🚀 1. 物理語軌與模式雙重校準
    // 💡 職人診斷：封殺「直接變英文」的 Bug。優先檢查傳入的 activeMode，
    // 若為空，則感應 localStorage 以決定初始模式，而非硬編碼。
    const validModes = ['dialogue', 'text', 'camera', 'filter'];
    
    // 取得當前全域語系，作為判定基礎
    const currentLang = localStorage.getItem('tf_trans_lang') || 'JP';
    
    let targetMode = activeMode;
    
    if (!targetMode) {
        // 🛡️ 防禦性判定：若沒傳模式，根據語系決定預設行為
        // 英文語軌預設為 dialogue (THEATRE)，日文語軌維持 text (預設)
        targetMode = (currentLang === 'EN') ? 'dialogue' : 'text';
    }

    // 更新引擎狀態
    if (window.en_translationEngine) {
        window.en_translationEngine.currentMode = targetMode;
    }

    // 🎨 視覺染色對焦：根據模式動態切換主題色
    // THEATRE 模式使用藍色，其餘模式維持職人粉色/預設色
    const isTheatre = targetMode === 'dialogue';
    const themeColor = isTheatre ? 'text-blue-600' : 'theme-text-pink';
    const accentClass = isTheatre ? 'blue-theme' : '';

    // 🚀 2. 物理地基佈署
    container.innerHTML = `
        <div id="translation-container" class="realtime-module animate-fade-in space-y-6 px-2 pb-40 ${accentClass}">
            ${this._renderRealtimeHeader(true, themeColor)}
            ${this._renderLinguisticSwitcher(currentLang)} 
            
            <div id="tf-mode-selector" class="flex p-1.5 bg-slate-100/80 rounded-[2.5rem] shadow-inner backdrop-blur-sm mx-2">
                ${this._renderModeButtons(targetMode)}
            </div>

            <!-- 🚀 標籤磁區隔離閘刀 (維持洗滌邏輯) -->
            <div id="quick-category-track" class="px-4 transition-all duration-300 ${targetMode === 'filter' ? 'block' : 'hidden'}">
                ${targetMode === 'filter' ? this._renderENCategories() : ''}
            </div>

            <div id="realtime-input-sector" class="animate-fade-in">
                ${this._getModeInputTemplate(targetMode, true)}
            </div>

            <div id="realtime-result-area" class="${targetMode === 'filter' ? 'hidden' : ''}">
                ${this._renderResultArea(true)}
            </div>

            <div id="fuel-display-stack" class="${targetMode === 'filter' ? 'block' : 'hidden'} px-2 space-y-4">
            </div>
        </div>
    `;

    // 🚀 3. 物理補償
    requestAnimationFrame(() => {
        this._handleModeTransitionEffect(targetMode);
        
        if (targetMode === 'filter') {
            if (typeof this.renderCategoryTabs === 'function') this.renderCategoryTabs();
            window.en_translationEngine?.loadLiveHistory('全部');
        }
        
        if (targetMode === 'dialogue' && !window.en_translationEngine?.currentDuo) {
            window.en_translationEngine?.refreshDialogueDuo();
        }
    });
},

/** 🎨 [Private] 分類 Tabs 渲染引擎 (V2026.ULTRA.EN 學習藍版) */
renderCategoryTabs() {
    const container = document.getElementById('quick-category-track');
    if (!container) return;

    // 🚀 1. 物理配置採樣：對位英美語專屬標籤 DNA
    // 優先從 trip 配置提領，若磁區真空則回歸 EN_CONFIG 預設值
    const trip = window.state?.trips.find(t => t.id === window.state.activeTripId);
    const defaultCats = EN_CONFIG.DEFAULT_CATEGORIES || ['GENERAL', 'TRANSPORT', 'DINING', 'SHOPPING'];
    const cats = trip?.en_translateConfig?.categories || defaultCats;
    
    // 🚀 2. 跨模組狀態讀取 (對準英文引擎鎖定狀態)
    const currentActive = (window.en_translationEngine && en_translationEngine.lockedCategory) 
                          ? en_translationEngine.lockedCategory 
                          : 'AUTO';

    // 🚀 3. 動態標籤自癒 (Self-Healing)
    // 若當前標籤不在清單中（例如自定義標籤），主動推入顯示軌道
    const displayCats = [...cats];
    if (!displayCats.includes(currentActive) && currentActive !== 'AUTO' && currentActive !== 'SETTING') {
        displayCats.push(currentActive);
    }

    // 🚀 4. 生成「AUTO / 自動」主權標籤
    const autoTabHtml = `
        <button id="tab-link-AUTO" onclick="en_translationEngine.lockCategory('AUTO')" 
            class="shrink-0 px-5 py-2 rounded-full border font-black text-[10px] transition-all active:scale-90 uppercase tracking-widest
            ${currentActive === 'AUTO' ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-100' : 'bg-white text-slate-400 border-slate-100'}">
            # AUTO
        </button>
    `;

    // 🚀 5. 生成語義領域標籤列
    const tabsHtml = displayCats.map(cat => {
        const isActive = (cat === currentActive);
        return `
            <button id="tab-link-${encodeURIComponent(cat)}" onclick="en_translationEngine.lockCategory('${cat}')" 
                class="shrink-0 px-5 py-2 rounded-full border font-black text-[10px] transition-all active:scale-90 whitespace-nowrap uppercase tracking-tighter
                ${isActive ? 'bg-blue-600 text-white border-transparent shadow-md shadow-blue-100' : 'bg-white text-slate-400 border-slate-100'}">
                # ${cat}
            </button>
        `;
    }).join('');

    // 🚀 6. 物理噴發
    container.innerHTML = `
        <div class="flex items-center gap-2 overflow-x-auto pb-4 no-scrollbar scroll-smooth snap-x">
            ${autoTabHtml}
            ${tabsHtml}
            <button onclick="en_translationEngine.lockCategory('SETTING')" 
                class="w-9 h-9 shrink-0 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 ml-1 hover:text-blue-500 hover:border-blue-200">
                <i class="fa-solid fa-sliders text-[10px]"></i>
            </button>
        </div>
    `;

    // 🚀 7. 關鍵焊接：啟動物理置中校對
    if (typeof this.focusTranslateTab === 'function') {
        this.focusTranslateTab(currentActive);
    }
},

/** 🧬 [Component] 渲染模組空值狀態 (V2026.ULTRA.EN 視覺一致化版) */
_renderEmptyState(label) {
    // 🚀 1. 物理語義對焦
    // 💡 職人診斷：將傳入的 label (如 A1, TRANSPORT) 轉化為明確的導航提示
    const displayLabel = String(label || 'Current Sector').toUpperCase();

    return `
        <div class="py-20 px-6 text-center animate-fade-in border-2 border-dashed border-slate-100 rounded-[3rem] mx-2 bg-slate-50/30">
            <div class="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50">
                <div class="relative">
                    <span class="text-3xl grayscale opacity-30">📡</span>
                    <div class="absolute inset-0 text-3xl animate-ping opacity-20">📡</div>
                </div>
            </div>

            <div class="space-y-3">
                <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">
                    Data Vacuum Detected
                </p>
                <h4 class="text-[15px] font-black text-slate-300 tracking-tight">
                    Sector [ ${displayLabel} ] is Empty
                </h4>
                <div class="flex flex-col items-center gap-2 pt-4">
                    <div class="h-px w-12 bg-slate-200"></div>
                    <p class="text-[10px] text-blue-400 font-bold italic">
                        Please inject 8-Tuple fuel to activate matrix.
                    </p>
                </div>
            </div>
            
            <div class="mt-10 flex justify-center gap-1.5 opacity-20">
                ${[1, 2, 3].map(i => `<div class="w-1 h-1 bg-blue-500 rounded-full animate-pulse" style="animation-delay: ${i * 0.2}s"></div>`).join('')}
            </div>
        </div>
    `;
},

/** 🧬 [Private] 語境切換物理聯動 (V2026.ULTRA.EN 學習藍版) */
_handleContextSwitch(btn, ctxId) {
    const track = document.getElementById('translation-context-track');
    if (!track || !btn) return;

    // 🚀 1. 物理狀態重置：全量掃除舊有語境高亮
    // 💡 職人診斷：使用 ctx-pill 類名鎖定目標按鈕磁軌
    const allPills = track.querySelectorAll('.ctx-pill');
    allPills.forEach(pill => {
        pill.className = 'ctx-pill flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-0.5 text-slate-400 bg-transparent';
    });

    // 🚀 2. 點亮目標軌道：注入英美語學習藍主權
    // 💡 樣式對位：白色卡片感、深色文字、陰影浮起
    btn.className = 'ctx-pill flex-1 py-2.5 rounded-xl text-[10px] font-black transition-all flex flex-col items-center gap-0.5 bg-white text-slate-800 shadow-sm scale-105 z-10';
    
    // 🚀 3. 數據固化與主權宣告
    // 將選中的語境 ID 寫入容器的 dataset，供 Engine 提取 Prompt 時讀取
    track.dataset.activeCtx = ctxId;
    
    // 🚀 4. 物理導通反饋
    // 執行 8ms 的職人級微震，確認數據磁軌已對焦
    if (navigator.vibrate) navigator.vibrate(8);

    console.log(`📡 [EN-Context-Weld] Track Aligned: ${ctxId.toUpperCase()}`);
},

/** 🛰️ 子組件：英文專屬標題零件 (V2026.ULTRA.EN) */
_renderRealtimeHeader(isEN, themeColor) {
    // 💡 職人診斷：直接鎖定英文描述，不再判斷 isEN 變數，實現代碼去脂
    return `
        <div class="header-section flex justify-between items-end px-4 pt-4 text-left">
            <div>
                <h2 class="text-xl font-black text-slate-800 tracking-tight">
                    Speech Focus
                </h2>
                <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 italic">
                    Linguistic Study Engine
                </p>
            </div>
            <div class="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                Status: <span class="text-emerald-500">Focusing</span>
            </div>
        </div>
    `;
},

/** 🌐 子組件：語軌主切換撥盤 (V2026.ULTRA.EN 藍色系對焦版) */
_renderLinguisticSwitcher(currentLang) {
    // 🚀 核心焊接：直接對位英美學習藍配色
    const activeClass = "bg-white shadow-md text-blue-600 scale-[1.02]";
    const inactiveClass = "text-slate-400 hover:text-slate-500 bg-transparent";

    return `
        <div class="px-4 pt-2 mb-4 animate-fade-in">
            <div class="bg-slate-100/60 p-1 rounded-[1.5rem] flex items-center border border-slate-200/40 shadow-inner relative overflow-hidden">
                <button onclick="App.setTransLanguage('JP')" 
                        class="flex-1 py-2.5 rounded-[1.2rem] text-[10px] font-black transition-all duration-300 relative z-10 
                        ${currentLang === 'JP' ? activeClass : inactiveClass}">
                    JAPAN MODE
                </button>
                
                <button onclick="App.setTransLanguage('EN')" 
                        class="flex-1 py-2.5 rounded-[1.2rem] text-[10px] font-black transition-all duration-300 relative z-10 
                        ${currentLang === 'EN' ? activeClass : inactiveClass}">
                    ENGLISH MODE
                </button>
            </div>
        </div>
    `;
},

/** 📑 子組件：英文專屬模式導航撥盤 (V2026.ULTRA.EN 學習藍版) */
_renderModeButtons(activeMode) {
    // 🚀 核心焊接：將日文標籤對焦為英美語學習語境
    // 💡 職人診斷：Theatre 代表劇場，Text 代表文字採集，Scan 代表影像識別，Tracks 代表歷史磁軌
    const modes = [
        { id: 'dialogue', icon: '🎭', label: 'THEATRE' }, 
        { id: 'text',     icon: '⌨️', label: 'TEXT' },
        { id: 'camera',   icon: '📸', label: 'SCAN' },
        { id: 'filter',   icon: '🔖', label: 'TRACKS' }
    ];

    return modes.map(m => {
        const isHit = activeMode === m.id;
        
        return `
            <button onclick="App.switchRealtimeMode('${m.id}')" 
                    class="flex-1 py-3 rounded-[1.5rem] text-[10px] font-black transition-all duration-300 flex flex-col items-center justify-center gap-1
                    ${isHit ? 'bg-white text-slate-800 shadow-md scale-[1.05] z-10' : 'text-slate-400 hover:text-slate-600'}">
                
                <span class="text-base ${isHit && m.id === 'dialogue' ? 'animate-pulse' : ''}">${m.icon}</span> 
                
                <span class="tracking-tighter whitespace-nowrap uppercase opacity-90">
                    ${m.label}
                </span>
            </button>
        `;
    }).join('');
},

/** 🧬 [Template] 模式模板分流器 (V2026.ULTRA.EN 核心分流點) */
_getModeInputTemplate(mode, isEN) {
    // 🚀 核心焊接：強制執行英美語專屬零件分發
    // 💡 職人診斷：確保每個 case 都對準 en_translationView 內部的英文實體函數
    switch (mode) {
        case 'dialogue':
            // 🎭 劇場會話生產軌道
            return this._renderDialogueInput(isEN);
            
        case 'text':
            // ⌨️ 文字採集與轉運軌道
            return this._renderTextInput(isEN);
            
        case 'camera':
            // 📸 影像掃描與 OCR 軌道
            return this._renderCameraInput(isEN);

        case 'voice':
            // 🎙️ 語音學習軌道 (💡 關鍵修正：封殺日式 Mic，對準英文學習入口)
            return this._renderEnglishLearningInput();
            
        case 'filter':
            // 🔖 標籤分類磁區 (由 renderRealtimeTranslation 下方的 stack 承載，此處回傳空)
            return '';
            
        default:
            // 熔斷機制：預設回歸劇場模式
            return this._renderDialogueInput(isEN);
    }
},

/** 🎭 [Input] 劇場會話生產介面 (V2026.ULTRA.EN 學習藍版) */
_renderDialogueInput(isEN) {
    // 🚀 1. 聲學人格採樣：對位英文 Duo 邏輯
    const duo = window.en_translationEngine?.currentDuo || {
        roleA: { id: 'US-Male', name: 'US Male', icon: '👤' },
        roleB: { id: 'US-Female', name: 'US Female', icon: '👤' }
    };

    // 🚀 2. 能階定義：鎖定 CEFR 軌道
    const levels = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

    return `
        <div class="bg-white rounded-[3.5rem] p-8 border border-slate-50 shadow-2xl space-y-10 animate-fade-in relative overflow-hidden text-left">
            
            <div class="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none text-blue-600">
                <i class="fa-solid fa-masks-theater text-9xl"></i>
            </div>

            <div class="space-y-3">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 1. Import News or Context</label>
                <textarea id="dialogue-source-input" 
                          class="w-full h-32 bg-slate-50 border-none rounded-[2rem] p-6 font-bold text-[13px] text-slate-700 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none shadow-inner custom-scrollbar" 
                          placeholder="Paste English news, articles, or any context for the persona theatre..."></textarea>
            </div>

            <div class="space-y-4">
                <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 2. Focus Level (CEFR)</label>
                <div class="grid grid-cols-6 gap-2" id="en-edu-level-selector">
                    ${levels.map(l => `
                        <button onclick="en_translationEngine._selectEduLevel(this)" 
                                data-level="${l}"
                                class="en-edu-lvl-btn py-3.5 rounded-2xl font-black text-[12px] transition-all border 
                                ${l === 'B1' ? 'bg-slate-900 text-white border-transparent shadow-lg shadow-blue-100' : 'bg-white text-slate-300 border-slate-100 hover:border-blue-200'}">
                            ${l}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex justify-between items-center px-1">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest">Step 3. Persona Alignment</label>
                    <button onclick="en_translationEngine.refreshDialogueDuo()" 
                            class="text-[10px] font-black text-blue-600 hover:opacity-70 transition-all flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-full">
                        <i class="fa-solid fa-dice"></i> Re-Sample
                    </button>
                </div>
                
                <div id="dialogue-actor-setup" 
                     class="flex items-center justify-around bg-blue-50/30 rounded-[2.5rem] p-7 border border-blue-100/20 shadow-inner gap-2">
                    
                    <div class="flex flex-col items-center gap-1 text-center flex-1">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50 animate-float">${duo.roleA.icon || '👤'}</div>
                        <span class="text-[14px] font-black text-slate-800 mt-2 tracking-tight line-clamp-1">${duo.roleA.name}</span>
                        <span class="text-[9px] font-black text-blue-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-lg shadow-sm border border-blue-50">Role A</span>
                    </div>

                    <div class="text-blue-200 text-xl animate-pulse px-2"><i class="fa-solid fa-arrow-right-arrow-left"></i></div>

                    <div class="flex flex-col items-center gap-1 text-center flex-1">
                        <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50 animate-float" style="animation-delay: 0.5s">${duo.roleB.icon || '👤'}</div>
                        <span class="text-[14px] font-black text-slate-800 mt-2 tracking-tight line-clamp-1">${duo.roleB.name}</span>
                        <span class="text-[9px] font-black text-blue-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-lg shadow-sm border border-blue-50">Role B</span>
                    </div>
                </div>
            </div>

            <div class="space-y-6 pt-4 border-t border-slate-50">
                <div class="space-y-3">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 4. AI Prompt Generation</label>
                    <button onclick="en_translationEngine.theatreCopyPrompt()" 
                            class="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-blue-100 active:scale-95 transition-all flex items-center justify-center gap-3 group">
                        <span>Copy Theatre Prompt</span>
                        <i class="fa-solid fa-wand-magic-sparkles text-xs group-hover:rotate-12 transition-transform"></i>
                    </button>
                </div>

                <div class="space-y-3">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 5. Solidify Theatre Data</label>
                    <textarea id="dialogue-json-import" 
                              class="w-full h-24 bg-blue-50/50 border-2 border-dashed border-blue-100 rounded-[1.5rem] p-5 font-mono text-[11px] text-blue-600 outline-none focus:ring-4 focus:ring-blue-100/50 transition-all" 
                              placeholder="Paste AI-generated theatre JSON fuel here..."></textarea>
                    
                    <button onclick="en_translationEngine.theatreImportToVault()" 
                            class="w-full py-4 bg-slate-800 text-white rounded-[2rem] font-black text-[11px] uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2 hover:bg-slate-900">
                        <i class="fa-solid fa-cloud-arrow-up"></i> Ingest to Track Vault
                    </button>
                </div>
            </div>
        </div>
    `;
},

/** ⌨️ [Advanced Module] 語義轉運站文字輸入介面 (V2026.ULTRA.EN 完整重構) */
    _renderTextInput(isEN) {
        // 🚀 1. 語境定義：對位英美語學習常用場景
        const contexts = [
            { id: 'news',    icon: '📻', label: 'News' },
            { id: 'article', icon: '📝', label: 'Essay' },
            { id: 'lyrics',  icon: '🎵', label: 'Lyrics' },
            { id: 'tech',    icon: '🛠️', label: 'Tech' }
        ];

        return `
            <div class="bg-white rounded-[3.5rem] p-8 border border-slate-50 shadow-2xl space-y-10 animate-fade-in text-left">
                
                <div class="space-y-4">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 1. Learning Context</label>
                    <div id="translation-context-track" class="flex gap-2 p-1.5 bg-slate-50 rounded-[2rem] shadow-inner" data-active-ctx="news">
                        ${contexts.map(ctx => `
                            <button onclick="en_translationView._handleContextSwitch(this, '${ctx.id}')" 
                                    class="ctx-pill flex-1 py-3 rounded-[1.5rem] text-[10px] font-black transition-all flex flex-col items-center gap-1
                                    ${ctx.id === 'news' ? 'bg-white text-slate-800 shadow-md scale-[1.05] z-10' : 'text-slate-400'}">
                                <span class="text-base">${ctx.icon}</span>
                                <span class="tracking-tighter uppercase font-black">${ctx.label}</span>
                            </button>
                        `).join('')}
                    </div>
                </div>

                <div class="space-y-3">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 2. Original Content</label>
                    <textarea id="text-translate-input" 
                              class="w-full h-32 bg-slate-50 border-none rounded-[2.5rem] p-7 font-bold text-[14px] text-slate-700 focus:ring-4 focus:ring-blue-50 outline-none transition-all resize-none shadow-inner custom-scrollbar" 
                              placeholder="Paste English sentences, paragraphs, or technical terms..."></textarea>
                </div>

                <div class="space-y-4">
                    <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 3. Style Focus & Prompt</label>
                    <div class="flex items-center gap-3">
                        <div class="relative flex-1">
                            <input type="text" id="style-focus-input" 
                                   class="w-full h-14 bg-slate-50/80 border-2 border-dashed border-slate-200 rounded-2xl py-2 pl-12 pr-4 font-bold text-[13px] text-blue-600 focus:ring-4 focus:ring-blue-50 transition-all outline-none" 
                                   placeholder="e.g., Business formal, Academic, Slangy...">
                            <span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-40 text-sm">🎨</span>
                        </div>
                        <button onclick="en_translationEngine.copyPromptWithContent()" 
                                class="shrink-0 w-14 h-14 bg-blue-600 text-white rounded-2xl shadow-xl shadow-blue-100 active:scale-90 transition-all flex items-center justify-center text-xl border-2 border-white">
                            <i class="fa-solid fa-wand-magic-sparkles"></i>
                        </button>
                    </div>
                    <p class="text-[9px] text-slate-300 font-bold px-2 italic leading-relaxed">※ Set a style and tap the magic wand to copy prompt for AI.</p>
                </div>

                <div class="h-px bg-slate-50 mx-4"></div>

                <div class="space-y-6">
                    <div class="space-y-3">
                        <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 4. Ingest AI Result</label>
                        <button onclick="en_translationEngine.injectFuelFromClipboard()" 
                                class="w-full py-4 bg-slate-100 text-slate-600 hover:bg-slate-200 rounded-[1.8rem] font-black text-[11px] flex items-center justify-center gap-3 active:scale-95 transition-all border border-slate-200 group shadow-sm">
                            <span class="text-lg group-hover:rotate-12 transition-transform">📥</span>
                            <span class="tracking-widest uppercase">Import / Create Article Package</span>
                        </button>
                    </div>

                    <div class="space-y-3">
                        <label class="block text-[11px] font-black text-slate-400 uppercase tracking-widest pl-1">Step 5. Direct Execution</label>
                        <button onclick="en_translationEngine.executeAdvancedTranslate()" 
                                class="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-3 group">
                            <span>TRANSLATE / EXECUTE</span>
                            <i class="fa-solid fa-bolt-lightning text-blue-400 group-hover:animate-pulse"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    },


/** 🎨 視覺樣式對焦器 (V2026.ULTRA.EN 動態磁區感應版) */
_getCategoryStyle(category) {
    // 🚀 1. 數據純化：移除空格與大小寫干擾
    const rawCat = String(category || 'GENERAL').trim().toUpperCase();

    // 🚀 2. 定義英美語專屬樣式軌道
    // 💡 職人診斷：配色對焦 EN_CONFIG 主權，採用較高飽和度的專業色
    const styleMap = {
        'GENERAL':   { icon: '📄', color: 'bg-slate-50 text-slate-500 border-slate-100' },
        'TRANSPORT': { icon: '🚃', color: 'bg-blue-50 text-blue-600 border-blue-100' },
        'DINING':    { icon: '🍱', color: 'bg-orange-50 text-orange-600 border-orange-100' },
        'SHOPPING':  { icon: '🛍️', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' },
        'MEDICAL':   { icon: '🏥', color: 'bg-rose-50 text-rose-600 border-rose-100' },
        'STAY':      { icon: '🏨', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' },
        'SIGHTS':    { icon: '🎡', color: 'bg-sky-50 text-sky-600 border-sky-100' },
        'THEATRE':   { icon: '🎭', color: 'bg-violet-50 text-violet-600 border-violet-100' },
        'TECH':      { icon: '🛠️', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' }
    };

    // 🚀 3. 執行物理對位與 Fallback 熔斷
    // 💡 若匹配不到（如自定義標籤），自動導向 GENERAL 樣式，確保 UI 穩定
    return styleMap[rawCat] || styleMap['GENERAL'];
},

/** 🛑 [Private] 渲染挑戰準備畫面 (V2026.ULTRA.EN 點火對焦版) */
_renderChallengeReadyScreen() {
    // 🚀 1. 物理佈局：鎖定高垂直呼吸感的居中結構
    // 💡 職人診斷：確保 min-h 鎖定，防止倒數數字噴發時造成 UI 抖動
    return `
        <div class="py-24 text-center animate-fade-in px-6 blue-theme">
            <div id="countdown-display" class="mb-12 min-h-[180px] flex items-center justify-center">
                <div class="space-y-6">
                    <div class="w-24 h-24 bg-blue-600 rounded-[2.5rem] rotate-12 flex items-center justify-center mx-auto shadow-2xl shadow-blue-200 animate-float">
                        <span class="text-5xl text-white -rotate-12">🎯</span>
                    </div>
                    
                    <div class="space-y-2">
                        <h3 class="text-slate-800 font-black text-2xl tracking-tight uppercase">Ready for Ignition?</h3>
                        <p class="text-slate-400 font-bold text-[11px] uppercase tracking-[0.3em] opacity-60">
                            Neural Training Matrix Locked
                        </p>
                    </div>
                </div>
            </div>
            
            <div class="flex flex-col items-center gap-6">
                <button onclick="en_translationEngine.startChallengeCountdown()" 
                        class="w-full max-w-xs py-5 bg-blue-600 text-white rounded-[2.5rem] font-black text-sm uppercase tracking-[0.4em] shadow-xl shadow-blue-100 active:scale-95 transition-all hover:brightness-110 group">
                    <span class="group-hover:tracking-[0.6em] transition-all">Start Challenge</span>
                </button>
                
                <div class="flex items-center gap-3 opacity-30">
                    <div class="w-8 h-px bg-slate-300"></div>
                    <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest italic">
                        System Ignition Protocol
                    </p>
                    <div class="w-8 h-px bg-slate-300"></div>
                </div>
            </div>

            <p class="mt-12 text-[10px] text-slate-300 font-bold leading-relaxed max-w-[240px] mx-auto opacity-80">
                ※ Rapid 8-Tuple Assessment:<br>
                Listen, Recognize, and Match the Segments.
            </p>
        </div>
    `;
},

/** 📸 [Input] 英文影像掃描觀景窗介面 (V2026.ULTRA.EN 學習藍版) */
_renderCameraInput(isEN) {
    // 🚀 1. 語義對焦：英文專屬提示文案
    const hint = 'Scan Signs or Menus';
    const subHint = 'AI-Powered OCR Learning';

    return `
        <div class="bg-white rounded-[3.5rem] p-6 border border-slate-50 shadow-xl space-y-6 relative overflow-hidden animate-fade-in">
            <div id="camera-viewport" class="w-full aspect-[4/3] bg-slate-900 rounded-[2.5rem] relative overflow-hidden flex items-center justify-center border-4 border-slate-50 shadow-inner">
                <video id="tf-camera-stream" class="w-full h-full object-cover hidden" playsinline></video>
                <canvas id="tf-ocr-canvas" class="hidden"></canvas>
                
                <div class="absolute inset-8 border-2 border-white/20 rounded-[1.5rem] pointer-events-none">
                    <div class="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-blue-500 -translate-x-1 -translate-y-1 rounded-tl-lg"></div>
                    <div class="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-blue-500 translate-x-1 -translate-y-1 rounded-tr-lg"></div>
                    <div class="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-blue-500 -translate-x-1 translate-y-1 rounded-bl-lg"></div>
                    <div class="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-blue-500 translate-x-1 translate-y-1 rounded-br-lg"></div>
                </div>

                <div id="camera-loading" class="text-center space-y-3">
                    <div class="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
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
                            class="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-all border border-slate-100 shadow-sm">
                        <i class="fa-solid fa-folder-open"></i>
                    </button>
                    
                    <button onclick="en_translationEngine.capturePhoto()" 
                            class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-200 border-4 border-white active:scale-95 transition-all group">
                        <span class="text-3xl text-white group-hover:scale-110 transition-transform">📸</span>
                    </button>

                    <button onclick="en_translationEngine.toggleCameraFlash()" 
                            class="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-all border border-slate-100 shadow-sm">
                        <i class="fa-solid fa-bolt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
},

/** 🎙️ [Input] 英文語音學習入口 (V2026.ULTRA.EN 學習藍專屬版) */
_renderEnglishLearningInput() {
    // 🚀 1. 視覺協定對焦
    const accentColor = 'text-blue-500';
    const btnColor = 'bg-blue-600 shadow-blue-100';

    return `
        <div class="bg-white rounded-[3.5rem] p-10 border border-slate-50 shadow-2xl space-y-8 animate-fade-in text-center relative overflow-hidden">
            <div class="absolute -top-10 -left-10 w-40 h-40 bg-blue-50 rounded-full opacity-30 blur-3xl"></div>
            
            <div class="relative z-10 space-y-6">
                <div class="w-24 h-24 bg-blue-600 rounded-[2.5rem] flex items-center justify-center mx-auto shadow-xl shadow-blue-100 animate-float">
                    <span class="text-4xl text-white font-black tracking-tighter">US</span>
                </div>
                
                <div class="space-y-2">
                    <h3 class="text-2xl font-black text-slate-800 tracking-tight">Speech Ingestion</h3>
                    <p class="text-[11px] ${accentColor} font-black uppercase tracking-[0.2em] opacity-80">
                        AI Linguistic Matrix / Active
                    </p>
                </div>

                <div class="pt-4">
                    <button onclick="App.startRealtimeMic()" 
                            class="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.4em] shadow-xl active:scale-95 transition-all flex items-center justify-center gap-3 group">
                        <i class="fa-solid fa-microphone-lines animate-pulse text-blue-400 group-hover:text-white transition-colors"></i>
                        Capture English Voice
                    </button>
                </div>

                <div class="flex justify-center items-center gap-3 opacity-40">
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                        Ready for Liaison & Reduction
                    </p>
                    <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                </div>
            </div>
        </div>
    `;
},

/** 🎯 [Result] 分析結果顯示區域 (V2026.ULTRA.EN 聲學/IPA 兼容版) */
_renderResultArea(isEN) {
    // 🚀 1. 物理配置：鎖定英文學習藍與黑金視覺調性
    const neuralLabel = 'Linguistic Alignment';
    const langBadge = 'EN';
    const badgeColor = 'text-blue-400';
    const accentBg = 'bg-blue-600/10';

    return `
        <div id="realtime-result-area" class="hidden space-y-4 animate-slide-up px-2 pb-10">
            
            <div id="standard-result-display" class="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div class="absolute -top-4 -right-4 opacity-10 text-8xl font-black italic select-none pointer-events-none">${langBadge}</div>
                
                <p id="stt-original" class="text-slate-400 text-[0.8rem] font-bold mb-6 italic border-b border-white/10 pb-4 tracking-tight min-h-[1.2rem]"></p>
                
                <div class="space-y-4 relative z-10">
                    <div class="flex items-center gap-2 mb-1">
                        <div class="w-1.5 h-1.5 rounded-full bg-current ${badgeColor} animate-pulse"></div>
                        <p class="text-[0.6rem] font-black ${badgeColor} uppercase tracking-[0.2em]">${neuralLabel}</p>
                    </div>
                    
                    <p id="tts-target" class="text-[1.8rem] font-medium leading-tight selection:bg-blue-600/50"></p>
                    
                    <div id="en-ipa-track" class="inline-flex items-center gap-2 px-3 py-1 ${accentBg} rounded-lg border border-blue-500/20">
                        <span class="text-[10px] font-black text-blue-300 uppercase tracking-tighter">IPA</span>
                        <p id="tts-phonetic" class="text-[14px] font-mono text-blue-400 font-bold tracking-wider"></p>
                    </div>
                </div>

                <button onclick="App.repeatLastTTS()" 
                        class="mt-10 w-full py-5 bg-white/10 rounded-2xl font-black text-xs hover:bg-white/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-white/5 shadow-inner">
                    <span class="text-base">🔊</span> 
                    <span class="tracking-widest uppercase">Replay Audio</span>
                </button>
            </div>

            <p class="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] pt-2">
                System: <span class="text-slate-400" id="tech-stack-info">Neural Studio Learning Engine</span>
            </p>
        </div>
    `;
},

/** 🔘 [Private] 難度對焦撥盤切換核心 (V2026.ULTRA.EN CEFR 版) */
_selectDialogueLevel(btn) {
    // 🚀 1. 物理定位：掃描磁區內所有難度按鈕
    const allBtns = document.querySelectorAll('.en-edu-lvl-btn');
    
    // 🚀 2. 狀態重置：封殺舊有的高亮標籤
    allBtns.forEach(b => {
        b.className = 'en-edu-lvl-btn py-3.5 rounded-2xl bg-white text-slate-300 border border-slate-100 hover:border-blue-200 font-black text-[12px] transition-all';
    });

    // 🚀 3. 點亮目標：注入英美語學習藍主權配色 (Slate-900 搭配藍色陰影)
    // 💡 職人診斷：使用深色背景鎖定選中感，並開啟藍色系投影以示區隔
    btn.className = 'en-edu-lvl-btn py-3.5 rounded-2xl bg-slate-900 text-white border-transparent font-black text-[12px] transition-all shadow-lg shadow-blue-100 scale-105 z-10';

    // 🚀 4. 物理導通反饋
    if (navigator.vibrate) navigator.vibrate(5);
    
    // 🚀 5. 數據固化：將選中能階同步至全域 state 或 dataset
    const selectedLevel = btn.dataset.level || 'B1';
    console.log(`🎯 [EN-Linguistic-Alignment] Level set to: ${selectedLevel}`);
},


/** 🎲 [Action] 重新抽樣對話角色 (V2026.ULTRA.EN 姓名/職業對焦版) */
    refreshRandomDuo(duo) {
        // 🚀 1. 數據與容器對焦
        const activeDuo = duo || window.en_translationEngine?.currentDuo;
        const container = document.getElementById('dialogue-actor-setup');
        
        if (!container || !activeDuo) {
            console.error("❌ [EN-Persona-Link-Collapse] 無法對焦角色數據容器或實體");
            return;
        }

        // 🚀 2. 數據指紋同步：為 Step 4 複製指令預埋座標
        container.dataset.roleAJson = JSON.stringify(activeDuo.roleA);
        container.dataset.roleBJson = JSON.stringify(activeDuo.roleB);

        // 🚀 3. 執行實體重繪 (對焦 100 員大名單數據)
        // 💡 職人診斷：直接提領 .name 與 .role 欄位，取代舊有的 ID 切割邏輯
        container.innerHTML = `
            <div class="flex flex-col items-center gap-1.5 text-center flex-1 animate-slide-up">
                <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50 animate-float">
                    ${activeDuo.roleA.icon || '🇺🇸'}
                </div>
                <span class="text-[15px] font-black text-slate-800 mt-1.5 tracking-tight line-clamp-1">
                    ${activeDuo.roleA.name || 'Anonymous'}
                </span>
                <span class="text-[9px] font-black text-blue-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-lg shadow-sm border border-blue-50 min-w-[75px]">
                    ${activeDuo.roleA.role || 'Expert'}
                </span>
            </div>

            <div class="text-blue-200 animate-pulse px-2 text-xl">
                <i class="fa-solid fa-arrow-right-arrow-left"></i>
            </div>

            <div class="flex flex-col items-center gap-1.5 text-center flex-1 animate-slide-up">
                <div class="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center text-3xl border border-slate-50 animate-float" style="animation-delay: 0.4s">
                    ${activeDuo.roleB.icon || '🇬🇧'}
                </div>
                <span class="text-[15px] font-black text-slate-800 mt-1.5 tracking-tight line-clamp-1">
                    ${activeDuo.roleB.name || 'Anonymous'}
                </span>
                <span class="text-[9px] font-black text-blue-500 uppercase tracking-wider bg-white px-2.5 py-1 rounded-lg shadow-sm border border-blue-50 min-w-[75px]">
                    ${activeDuo.roleB.role || 'Learner'}
                </span>
            </div>
        `;

        // 🚀 4. 物理導通反饋
        if (navigator.vibrate) navigator.vibrate([10, 30]);
        console.log(`🎭 [EN-View-Weld] 人格顯影對焦成功: ${activeDuo.roleA.name} & ${activeDuo.roleB.name}`);
    },


    // ============================================================
    // 📖 B分區：英美語情境學習庫 (Contextual Module)
    // ============================================================

/** 📖 [Contextual Module] 英文情境學習庫渲染發動機 (V2026.ULTRA.FINAL 合併版) */
renderContextualTranslation(container, vaultItems = [], activeCategory = 'ALL') {
    const safeVault = Array.isArray(vaultItems) ? vaultItems : [];
    
    // 🚀 1. 物理配置採樣 (跨磁區對焦)
    const trip = window.state?.trips.find(t => t.id === window.state.activeTripId);
    if (!trip) return;

    // 💡 職人診斷：優先對焦英文專屬配置，若真空則由 EN_CONFIG 提供預設學習軌道
    const currentCat = activeCategory.trim();
    const defaultCats = (typeof EN_CONFIG !== 'undefined') ? EN_CONFIG.DEFAULT_CATEGORIES : ['GENERAL', 'STUDY', 'DAILY', 'BUSINESS'];
    const categories = ['ALL', ...(trip.en_translateConfig?.categories || defaultCats)];

    // 🚀 2. 主框架佈署 (零件化組裝)
    // 💡 視覺協定：強制注入 blue-theme 與 text-left 確保美式閱讀體驗
    container.innerHTML = `
        <div class="translate-module animate-fade-in space-y-6 pb-40 blue-theme text-left">
            ${this._renderLinguisticSwitcher('EN')}

            <div class="flex items-center justify-between px-6">
                <div class="flex items-center gap-3">
                    <div class="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-100/50 text-white">
                        <i class="fa-solid fa-box-archive text-sm"></i>
                    </div>
                    <div>
                        <h2 class="text-xl font-black text-slate-800 tracking-tight">Study Vault</h2>
                        <p class="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] opacity-60 italic">Acoustic Repository</p>
                    </div>
                </div>
                <span class="text-[10px] font-black text-slate-300 uppercase tracking-tighter bg-slate-50 px-2 py-1 rounded">V2026.ULTRA</span>
            </div>
            
            ${this._renderFuelInjector()}

            <div class="space-y-4">
                ${this._renderVaultHeader()}
                
                ${this._renderTranslateTabs(categories, currentCat, true)}
                
                <div id="translate-vault-track" class="space-y-3 px-4 min-h-[200px]">
                    ${this._renderTranslateCards(safeVault, currentCat)}
                </div>
            </div>
        </div>
    `;

    // 🚀 3. 物理位移對焦：自動捲動至選定標籤
    // 💡 職人診斷：確保在異步渲染後標籤處於軌道中心
    if (typeof this.focusTranslateTab === 'function') {
        this.focusTranslateTab(currentCat);
    }

    console.log(`🏁 [EN-View-Engine] Contextual Vault Hydrated. Category: ${currentCat}`);
},


/** 🔌 子組件：英文專屬燃料注入器 (V2026.ULTRA.EN 學習藍版) */
_renderFuelInjector() {
    // 🚀 1. 視覺協定與色彩對焦
    const accentColor = 'text-blue-600';
    const ringColor = 'focus:ring-blue-100';
    const btnColor = 'bg-blue-600 shadow-blue-100';

    // 🚀 2. 核心對焦：從英文邏輯引擎獲取初始 Prompt 指令
    // 確保渲染瞬間即具備產出 8 元組數據的正確指令內容
    const initialPrompt = this._getTranslateAiPrompt('');

    return `
        <div class="mx-4 bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 space-y-5 animate-fade-in text-left">
            <div class="flex justify-between items-center px-1">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    English Fuel Injector
                </h4>
                <div id="translate-ai-btn">
                    ${viewEngine.renderAICopyBtn ? viewEngine.renderAICopyBtn(initialPrompt) : '<button>COPY PROMPT</button>'}
                </div>
            </div>
            
            <div class="relative">
                <input type="text" id="trans-query-input" 
                       class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-xs focus:ring-2 ${ringColor} transition-all outline-none" 
                       placeholder="Enter English scenario (e.g., Starbucks Ordering)..." 
                       oninput="App.syncTranslateAiPrompt(this.value)"> 
            </div>
            
            <textarea id="trans-json-input" 
                      class="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 font-mono text-[10px] ${accentColor} outline-none focus:ring-1 focus:ring-slate-100 shadow-inner" 
                      placeholder="Paste AI-generated 8-Tuple JSON fuel here..."></textarea>
            
            <button onclick="App.importTranslateFuel()" 
                    class="w-full py-4 ${btnColor} text-white rounded-[1.5rem] font-black text-xs shadow-lg active:scale-95 transition-all uppercase tracking-widest">
                Save to Study Vault
            </button>
        </div>
    `;
},

/** 📂 [Sub-Component] 英文專屬 Vault 標題欄 (V2026.ULTRA.FINAL 合併版) */
    _renderVaultHeader() {
        // 💡 職人觀點：鎖定英文學習模式專屬的藍色 Hover 與物理縮放回饋
        const hoverStyles = 'hover:text-blue-500 active:scale-90 transition-all duration-200';

        return `
            <div class="header-vault flex justify-between items-center px-6 animate-fade-in">
                <div class="flex items-center gap-2.5">
                    <span class="text-lg drop-shadow-sm">📂</span>
                    <h3 class="text-sm font-black text-slate-700 uppercase tracking-tighter">
                        Study Knowledge Vault
                    </h3>
                </div>
                
                <button onclick="App.promptClearVault(this)" 
                        class="text-[9px] font-black text-slate-300 uppercase tracking-widest ${hoverStyles}">
                    PURGE VAULT
                </button>
            </div>
        `;
    },


/** 📑 子組件：英文分類標籤導航 (V2026.ULTRA.EN 學習藍版) */
_renderTranslateTabs(categories, currentCat, isEN) {
    // 🚀 1. 語義映射表：執行標籤之英美語學習語境轉換
    const langMap = {
        '全部': 'ALL',
        '全部': 'ALL',
        '一般': 'GENERAL',
        '會話': 'THEATRE',
        '交通': 'TRANSPORT',
        '用餐': 'DINING',
        '購物': 'SHOPPING',
        '醫藥': 'MEDICAL',
        '住宿': 'STAY',
        '景點': 'SIGHTS'
    };

    // 🚀 2. 視覺協定對焦
    const activeBtnClass = 'bg-blue-600 text-white shadow-lg shadow-blue-100 scale-105';
    const inactiveBtnClass = 'bg-white text-slate-400 border-slate-100 hover:border-blue-100';

    return `
        <div id="translate-tabs" class="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x px-4 scroll-smooth">
            ${categories.map(cat => {
                const rawCat = cat.trim();
                // 💡 職人診斷：處理「ALL」與「全部」的對位邏輯，確保過濾穩定
                const isHit = (currentCat === rawCat || (currentCat === 'ALL' && rawCat === '全部'));
                
                // 執行標籤文案映射
                const displayLabel = langMap[rawCat] || rawCat.toUpperCase();

                return `
                <div class="snap-center">
                    <button id="trans-tab-${encodeURIComponent(rawCat)}" 
                            onclick="App.filterTranslate('${rawCat}')" 
                            class="px-5 py-2.5 rounded-2xl text-[11px] font-black border transition-all whitespace-nowrap
                            ${isHit ? activeBtnClass : inactiveBtnClass}">
                        ${displayLabel}
                    </button>
                </div>`;
            }).join('')}
            
            <button onclick="App.promptEditTranslateCategories()" 
                    class="px-4 py-2.5 rounded-2xl bg-slate-50 text-slate-300 border border-dashed border-slate-200 active:scale-90 transition-all shrink-0 hover:text-blue-400 hover:border-blue-200">
                <i class="fa-solid fa-sliders text-[10px]"></i>
            </button>
        </div>
    `;
},

/** 🧬 子組件：渲染英文翻譯卡片清單 (V2026.ULTRA.EN 數據隔離版) */
_renderTranslateCards(items, activeCategory = 'ALL') {
    const targetCat = String(activeCategory).trim();
    
    // 🚀 1. 執行語系 DNA 物理過濾
    // 💡 職人診斷：排除包含日文特徵 (romaji) 的數據，鎖定 lang: 'EN' 或 8 元組特徵
    const filtered = items.filter(item => {
        // A. 排除日文指紋：如果包含 romaji 或 segments[0][1] 是假名，則視為日文數據，在此物理切斷
        const isJP = !!(item.romaji || (item.segments && item.segments[0] && /[ぁ-んァ-ン]/.test(item.segments[0][1])));
        if (isJP) return false;

        // B. 標籤對位：處理全部 (ALL) 或特定分類
        if (targetCat === 'ALL' || targetCat === '全部') return true;
        const itemCat = String(item.category || 'GENERAL').toUpperCase();
        return itemCat === targetCat.toUpperCase();
    });

    // 🚀 2. 空值狀態處理 (對位英文標籤)
    if (filtered.length === 0) {
        return this._renderEmptyState(targetCat);
    }

    // 🚀 3. 數據分流渲染軌道
    return filtered.map((item, idx) => {
        // 🎯 A 軌道：英美語長文章燃料包 (Package)
        if (item.type === 'article_package' || (item.segments && item.segments.length > 2)) {
            return this._renderArticlePackageWithTabs(item);
        }

        // 🎯 B 軌道：英美語即時記錄 (8-Tuple 單句卡)
        const style = { icon: '📖', color: 'bg-blue-50 text-blue-500 border-blue-100' }; // 預設英文藍樣式
        
        return `
        <div class="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-md transition-all group relative animate-fade-in mb-5 overflow-hidden text-left">
            <div onclick="App.speak('${(item.a || item.翻譯 || "").replace(/'/g, "\\'")}')" 
                 class="p-8 pb-14 space-y-4 cursor-pointer relative z-10 active:bg-blue-50/30 transition-colors">
                
                <p class="text-[11px] font-black text-slate-400 tracking-wide flex items-center gap-2">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]"></span>
                    ${item.q || item.原文}
                </p>
                
                <div class="space-y-1">
                    <h4 class="text-[1.5rem] font-black text-slate-800 leading-tight tracking-tight">
                        ${item.a || item.翻譯 || ""}
                    </h4>
                    ${item.reading ? `<p class="text-[13px] font-mono text-blue-400 font-bold tracking-wider">/${item.reading}/</p>` : ''}
                </div>
            </div>

            <div class="absolute bottom-5 right-8 z-20">
                <span class="text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest border ${style.color}">
                    ${style.icon} ${item.category || 'GENERAL'}
                </span>
            </div>
        </div>`;
    }).join('');
},

/** 📦 [Component] 渲染英美語文章包外殼 (V2026.ULTRA.EN 學習藍摺疊版) */
_renderArticlePackageWithTabs(item) {
    // 🚀 1. 物理樣式對焦 (強制鎖定英文學習藍樣式)
    const style = { icon: '📄', color: 'bg-blue-50 text-blue-500 border-blue-100' };
    
    return `
        <div class="bg-white rounded-[2.5rem] px-4 py-6 mb-6 border border-slate-100 shadow-sm animate-slide-up overflow-hidden" id="pkg-${item.id}">
            
            <div class="flex justify-between items-start cursor-pointer mb-2 px-1" onclick="en_translationEngine.toggleArticleFolder('${item.id}')">
                <div class="flex items-start gap-4 min-w-0 flex-1">
                    <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl shadow-inner shrink-0 mt-1">
                        ${style.icon}
                    </div>
                    
                    <div class="min-w-0 flex-1">
                        <h4 class="text-[17px] font-black text-slate-800 leading-[1.4] mb-2 break-words">${item.title || 'Untitled English Material'}</h4>
                        <div class="flex flex-wrap items-center gap-2">
                             <span class="text-[11px] font-black px-2.5 py-0.5 rounded-lg border-2 shadow-sm ${style.color} tracking-tight uppercase">
                                #${item.category || 'STUDY'}
                             </span>
                             <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                ${item.segments?.length || 0} PHRASES
                             </span>
                        </div>
                    </div>
                </div>

                <div class="flex items-center gap-2 shrink-0 ml-2 mt-1">
                    <button onclick="event.stopPropagation(); en_translationEngine.editArticlePackage('${item.id}')" 
                            class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 text-slate-400 hover:text-blue-500 border border-slate-100 shadow-sm transition-all active:scale-90">
                        <i class="fa-solid fa-pen-to-square text-[13px]"></i>
                    </button>
                    <div id="arrow-${item.id}" class="w-8 h-10 flex items-center justify-center text-slate-300 transition-transform duration-500">
                        <i class="fa-solid fa-chevron-down text-[11px]"></i>
                    </div>
                </div>
            </div>

            <div class="hidden mt-6 pt-6 border-t border-slate-50 relative text-left" id="content-${item.id}">
                
                <div class="flex gap-1.5 bg-slate-100/60 p-1.5 rounded-[1.3rem] mb-6 overflow-x-auto no-scrollbar relative z-50">
                    ${['SCRIPT', 'VOCAB', 'GRAMMAR', 'QUIZ', 'LISTENING'].map((tab, i) => `
                        <button onclick="event.stopPropagation(); en_translationEngine.switchArticleTab('${item.id}', '${tab}')" 
                                id="tab-btn-${item.id}-${tab}"
                                class="art-tab-btn flex-1 py-2.5 px-4 rounded-xl font-black text-[10px] whitespace-nowrap transition-all duration-300 
                                ${i === 0 ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}">
                            ${tab}
                        </button>
                    `).join('')}
                </div>

                <div id="tab-content-${item.id}" 
                     class="relative z-10 min-h-[100px] animate-fade-in px-1 text-slate-700">
                     </div>
            </div>
        </div>`;
},

/** 📜 [Component] 渲染文章包內部分頁：原文與 IPA 音標 (V2026.ULTRA.EN) */
_renderOriginalTab(item) {
    // 🚀 1. 物理安全檢查
    if (!item.segments || !Array.isArray(item.segments)) {
        return `
            <div class="py-16 text-center animate-fade-in">
                <div class="text-4xl mb-4 opacity-20">📄</div>
                <p class="text-slate-300 text-[10px] font-black italic uppercase tracking-[0.2em]">No Script Detected</p>
            </div>`;
    }

    return item.segments.map((p, idx) => {
        // 🚀 2. 數據對焦：英文 8 元組多態解構 (支援單句與分段對位)
        let qRaw = "", aRaw = "", ipaRaw = "";
        
        if (Array.isArray(p)) { 
            // 💡 若為陣列格式：[英文, 中文, IPA(選配)]
            qRaw = p[0]; aRaw = p[1]; ipaRaw = p[2] || "";
        } else if (p && typeof p === 'object') { 
            // 💡 若為物件格式：對準英文專屬 Key
            qRaw = p.q || p.en || ""; 
            aRaw = p.a || p.zh || ""; 
            ipaRaw = p.ipa || p.reading || "";
        }

        // 🚀 3. 核心洗滌：封殺非法空值
        const sanitize = (val) => {
            const str = String(val || "").trim();
            return (str === 'undefined' || str === 'null') ? "" : str;
        };

        const q = sanitize(qRaw);
        const a = sanitize(aRaw);
        const ipa = sanitize(ipaRaw);

        if (!q && !a) return "";

        // 🚀 4. 聲學轉義：物理封殺引號斷路
        const safeQ = q.replace(/'/g, "\\'").replace(/"/g, '&quot;').replace(/\n/g, ' ');

        return `
            <div class="bg-white/80 p-6 rounded-[2.2rem] shadow-sm border border-slate-50 relative group transition-all hover:shadow-lg hover:shadow-blue-100/30 animate-fade-in mb-4 text-left">
                <div class="flex justify-between items-start mb-4">
                    <span class="text-[9px] font-black text-slate-300 tracking-[0.2em] italic uppercase">Phrase #${String(idx + 1).padStart(2, '0')}</span>
                    
                    <div class="flex gap-2.5">
                        <button onclick="event.stopPropagation(); en_translationEngine.speakSegment('${safeQ}')" 
                                class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center transition-all active:scale-90 hover:bg-blue-50 hover:text-blue-500 border border-slate-100 shadow-inner">
                            <i class="fa-solid fa-volume-high text-[13px]"></i>
                        </button>

                        <button onclick="event.stopPropagation(); en_translationEngine.openEduMenu('${item.id}', ${idx})" 
                                class="w-10 h-10 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center transition-all active:scale-90 hover:bg-blue-600 hover:text-white shadow-sm border border-blue-100">
                            <span class="text-[15px]" style="transform: translateY(-1px); display: inline-block;">🎓</span>
                        </button>
                    </div>
                </div>
                
                <div class="space-y-4">
                    <p class="text-[1.25rem] font-black text-slate-800 leading-snug tracking-tight select-text">${q}</p>
                    
                    ${ipa ? `
                        <div class="flex items-center gap-2 -mt-1 mb-2">
                            <span class="text-[9px] font-black text-blue-300 uppercase tracking-tighter">IPA</span>
                            <span class="text-[13.5px] font-mono text-blue-400/80 font-bold">/${ipa}/</span>
                        </div>
                    ` : ''}

                    <div class="flex items-center gap-3 py-1">
                        <div class="h-[1.5px] flex-1 bg-gradient-to-r from-blue-100/50 via-slate-50 to-transparent rounded-full"></div>
                        <div class="w-1.5 h-1.5 rounded-full bg-blue-100"></div>
                    </div>

                    <p class="text-[0.95rem] font-bold text-slate-400 leading-normal select-text">${a}</p>
                </div>
            </div>`;
    }).join('');
},


    // ============================================================
    // 🧬 C分區：影子特訓專區 (Training Wall)
    // ============================================================

/** 🧬 [Training Module] 英文影子特訓牆 (V2026.ULTRA.EN 數據隔離版) */
renderTrainingWall(container, dueItems) {
    // 🚀 1. 語軌主權對焦
    const currentLang = 'EN'; 
    // 從英文專屬 state 或 localStorage 獲取上下文
    const context = window.state?.en_trainingContext || { 
        mode: 'Read', 
        level: 'All', 
        page: 1, 
        perPage: 10, 
        displayMode: 'Word' 
    };
    const { mode, level, page, perPage, displayMode } = context;

    // 🚀 2. 物理隔離過濾：僅允許英文 DNA 燃料進入磁區
    let filteredItems = dueItems.filter(it => {
        // 💡 職人診斷：判斷屬性 it.lang 是否為 EN，或具備 8 元組特徵
        const isEnglish = it.lang === 'EN' || it.type === 'EN_VOCAB_8';
        if (!isEnglish) return false;

        // B. 能階對焦：鎖定 CEFR (A1-C2)
        return level === 'All' || level === '全部' || 
               String(it.level || "").trim().toUpperCase() === String(level).trim().toUpperCase();
    });

    // 🚀 3. 主框架導通
    let html = `<div class="max-w-2xl mx-auto pb-40 animate-fade-in blue-theme">
                    ${this._renderTrainingHeader(mode, level, displayMode)}`;

    if (mode === 'Settings' || mode === '設定') {
        html += this._renderTrainingSettings();
    } 
    else if (mode === 'Challenge' || mode === '挑戰') {
        // 挑戰模式分流：呼叫英文挑戰組件
        html += this._renderChallengeSection ? this._renderChallengeSection(filteredItems, level) : '';
    }
    else {
        // 學習模式：分頁與亂序處理
        const totalPages = Math.ceil(filteredItems.length / perPage) || 1;
        const safePage = Math.min(page, totalPages);
        const pagedItems = filteredItems.slice((safePage - 1) * perPage, safePage * perPage);

        html += `
            <div class="mb-8">${this._renderPagination('TRAINING', 'ALL', filteredItems.length, safePage, level)}</div>
            <div id="en-training-stack" class="space-y-8 min-h-[400px]">
                ${pagedItems.length > 0 
                    ? pagedItems.map(item => this._renderShadowCard(item, mode, displayMode)).join('') 
                    : this._renderEmptyState('English Sector')}
            </div>
        `;
    }

    html += `</div>`;
    container.innerHTML = html;

    // 🚀 4. 物理對焦：標籤置中補償
    if (mode !== 'Settings') {
        requestAnimationFrame(() => this.focusTrainingTab(level));
    }
},

/** 🎨 子組件：英文特訓中心頂部控制中樞 (V2026.ULTRA.EN 學習藍版) */
_renderTrainingHeader(activeMode, activeLevel, displayMode) {
    // 🚀 1. 視覺協定與色彩矩陣
    const ui = {
        theme: 'bg-blue-600',
        shadow: 'shadow-blue-100',
        leftLabel: 'WORD',
        rightLabel: 'SPELLING',
        levels: ['All', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2']
    };

    // 🚀 2. 顯示權限判定
    const showDisplaySwitcher = (activeMode === 'Read' || activeMode === '讀'); 
    const showLevelTabs = (activeMode !== 'Challenge' && activeMode !== '挑戰' && activeMode !== 'Settings' && activeMode !== '設定');

    return `
        <div class="training-header space-y-6 px-4 pt-6 animate-fade-in text-left">
            <div class="mode-dial flex bg-slate-100/60 p-1.5 rounded-[2.2rem] w-full shadow-inner border border-slate-200/50">
                ${['Read', 'Listen', 'Challenge', 'Settings'].map(m => {
                    const isHit = (activeMode === m || (activeMode === '讀' && m === 'Read') || (activeMode === '聽' && m === 'Listen') || (activeMode === '挑戰' && m === 'Challenge') || (activeMode === '設定' && m === 'Settings'));
                    return `
                        <button onclick="App.setTrainingTab('mode', '${m}')" 
                                class="flex-1 py-4 rounded-[1.8rem] text-[13px] font-black transition-all duration-300
                                ${isHit ? 'bg-white text-blue-600 shadow-md scale-[1.02]' : 'text-slate-400'}">
                            ${m.toUpperCase()}
                        </button>
                    `;
                }).join('')}
            </div>

            ${showDisplaySwitcher ? `
            <div class="display-switcher flex justify-center items-center gap-4 animate-fade-in">
                <div class="h-[1px] flex-1 bg-slate-100/80"></div>
                <div class="flex bg-white border border-slate-100 rounded-2xl p-1.5 shadow-sm ring-4 ring-slate-50/50">
                    <button onclick="App.setTrainingTab('displayMode', 'Word')" 
                            class="px-5 py-2 rounded-xl text-[10px] font-black transition-all
                            ${displayMode === 'Word' || displayMode === '漢字' ? `${ui.theme} text-white shadow-lg ${ui.shadow}` : 'text-slate-300'}">
                        ${ui.leftLabel}
                    </button>
                    <button onclick="App.setTrainingTab('displayMode', 'Spelling')" 
                            class="px-5 py-2 rounded-xl text-[10px] font-black transition-all
                            ${displayMode === 'Spelling' || displayMode === '平假名' ? `${ui.theme} text-white shadow-lg ${ui.shadow}` : 'text-slate-300'}">
                        ${ui.rightLabel}
                    </button>
                </div>
                <div class="h-[1px] flex-1 bg-slate-100/80"></div>
            </div>` : ''}

            ${showLevelTabs ? `
            <div id="level-tabs-track" class="flex gap-2 overflow-x-auto no-scrollbar py-2 px-2 scroll-smooth animate-fade-in">
                ${ui.levels.map(n => {
                    const isHit = (String(activeLevel).toUpperCase() === n.toUpperCase());
                    const label = n === 'All' ? 'ALL' : n;
                    
                    return `
                        <button id="lvl-tab-${n}" onclick="App.setTrainingTab('level', '${n}')"
                                class="flex-none px-6 h-10 rounded-2xl font-black text-[12px] transition-all duration-300
                                ${isHit ? `${ui.theme} text-white shadow-lg ${ui.shadow} scale-105` : 'bg-white text-slate-300 border border-slate-50 hover:border-blue-100'}">
                            ${label}
                        </button>`;
                }).join('')}
            </div>` : ''}
        </div>
    `;
},

/** 🧬 [Component] 渲染影子特訓卡片 (V2026.ULTRA.EN 模式反轉版) */
_renderShadowCard(item, mode, displayMode = 'Word') {
    // 🚀 1. 數據解構：對位英文 8 元組索引
    const word = item.word || item["0"] || "---";
    const phonetic = item.reading || item["1"] || ""; // IPA 軌道
    const level = (item.level || 'B1').toUpperCase();
    const cardId = `srs-card-${item.id}`;

    // 🚀 2. 模式反轉邏輯：執行隨機分流 (Acoustic vs Visual)
    // 💡 職人診斷：若處於挑戰模式，執行 50% 機率反轉；否則遵循手動切換的 mode
    let activeMode = mode;
    if (mode === 'Challenge' || mode === '挑戰') {
        activeMode = (Math.random() > 0.5) ? 'Listen' : 'Read';
    }
    
    const isAudioOnly = (activeMode === 'Listen' || activeMode === '聽');

    // 🚀 3. 視覺配色矩陣 (CEFR 學習藍軌道)
    const levelClassMap = {
        'A1': 'bg-sky-50 text-sky-600 border-sky-100',
        'A2': 'bg-blue-50 text-blue-600 border-blue-100',
        'B1': 'bg-indigo-50 text-indigo-600 border-indigo-100',
        'B2': 'bg-violet-50 text-violet-600 border-violet-100',
        'C1': 'bg-blue-900 text-white border-blue-800',
        'C2': 'bg-slate-900 text-white border-slate-800'
    };
    const levelStyle = levelClassMap[level] || 'bg-slate-50 text-slate-400 border-slate-100';

    // 🚀 4. 教學維度標籤校準
    const mainText = (displayMode === 'Spelling' || displayMode === '平假名') ? phonetic : word;
    const subLabel = isAudioOnly ? 'Acoustic Target' : 'English Focus';

    return `
        <div id="${cardId}" 
             data-mode="${activeMode}" 
             class="srs-card group relative bg-white border border-slate-100 rounded-[3rem] p-8 shadow-xl transition-all duration-500 max-w-[340px] mx-auto mb-10 overflow-hidden text-center">
            
            <div class="flex justify-between items-center mb-6">
                <div class="flex items-center gap-2">
                    <span class="px-3 py-1 ${levelStyle} text-[10px] font-black rounded-lg border uppercase tracking-widest">
                        ${level}
                    </span>
                    <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                        ${isAudioOnly ? 'Aural Recall' : 'Visual Recall'}
                    </span>
                </div>
                <button onclick="en_translationEngine.deleteSRSItem('${item.id}')" 
                        class="text-slate-100 hover:text-rose-400 transition-colors active:scale-90">
                    <i class="fa-solid fa-circle-xmark text-lg"></i>
                </button>
            </div>

            <div class="py-8 min-h-[140px] flex flex-col justify-center">
                <h3 class="text-4xl font-black text-slate-800 transition-all duration-1000 tracking-tight ${isAudioOnly ? 'blur-2xl opacity-5 select-none scale-95 pointer-events-none' : ''}">
                    ${mainText}
                </h3>
                <p class="text-[9px] font-black text-slate-300 mt-4 uppercase tracking-[0.3em]">
                    ${subLabel}
                </p>
            </div>

            <div class="flex flex-col items-center gap-6">
                <button onclick="en_translationEngine.speakSegment('${word.replace(/'/g, "\\'")}')" 
                        class="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-100 active:scale-90 transition-all group/play ${isAudioOnly ? 'animate-pulse' : 'opacity-20 hover:opacity-100'}">
                    <i class="fa-solid fa-volume-high text-xl group-hover/play:scale-110"></i>
                </button>
                
                <button id="ans-gate-${item.id}" 
                        onclick="en_translationView.revealTrainingAnswer('${item.id}')" 
                        class="w-full py-5 bg-blue-50 text-blue-600 border-blue-100 rounded-[2rem] font-black text-[11px] tracking-[0.3em] uppercase border shadow-sm active:scale-95 transition-all hover:bg-blue-600 hover:text-white">
                    Reveal Answer
                </button>
            </div>

            <div id="ans-payload-${item.id}" class="hidden mt-6 pt-6 border-t border-dashed border-slate-100 animate-slide-up text-left">
            </div>
        </div>`;
},

/** 🔓 [Action] 揭曉答案：對位 IPA 音標與 EN 品詞 (V2026.ULTRA.EN 數據導通版) */
async revealTrainingAnswer(id) {
    const payload = document.getElementById(`ans-payload-${id}`);
    const gate = document.getElementById(`ans-gate-${id}`);
    if (!payload || !gate) return;

    // 🚀 1. 物理提領：啟動對焦動畫與聲學預熱
    gate.innerHTML = `
        <div class="py-2 text-center animate-pulse">
            <span class="text-blue-500 font-black text-[9px] uppercase tracking-widest">Aligning Matrix...</span>
        </div>
    `;
    
    // 💡 職人診斷：從英文引擎提領 8 元組脫水數據
    const data = await en_translationEngine.getHydratedTrainingItem(id);
    
    if (!data) {
        gate.innerHTML = `<button onclick="en_translationView.revealTrainingAnswer('${id}')" class="w-full py-4 bg-rose-50 text-rose-400 rounded-xl font-black text-[10px]">RETRY SYNC</button>`;
        return;
    }

    // 🚀 2. 物理除磁：移除遮罩，噴發答案磁區
    gate.classList.add('hidden');
    payload.classList.remove('hidden');

    // 💡 數據採樣：[0:Word, 1:IPA, 2:POS, 3:Trans, 4:Example, 5:Ex-Trans]
    const word = data.word || data["0"] || "---";
    const ipa = data.reading || data["1"] || ""; 
    const pos = data.pos || data["2"] || "N/A";
    const trans = data.translation || data.trans || data["3"] || "No Definition";

    // 🚀 3. 實體噴發：對位 IPA 與學習藍 UI
    payload.innerHTML = `
        <div class="space-y-5 animate-fade-in px-1 text-left">
            
            <div class="p-6 bg-slate-50/80 rounded-[2.2rem] border border-slate-100 text-center relative overflow-hidden">
                <div class="absolute top-0 left-0 w-full h-1 bg-blue-500/10"></div>
                <p class="text-[8px] font-black text-slate-300 uppercase mb-2 tracking-widest">Acoustic Projection</p>
                
                <div class="text-2xl font-black text-slate-800 tracking-tight mb-1">${word}</div>
                ${ipa ? `<div class="text-[15px] font-mono text-blue-500 font-bold tracking-wider mb-4">/${ipa}/</div>` : ''}

                <div class="flex justify-center -mb-2">
                    <button onclick="en_translationEngine.speakSegment('${word.replace(/'/g, "\\'")}')" 
                            class="w-12 h-12 bg-white text-blue-600 rounded-full flex items-center justify-center shadow-md border border-blue-50 active:scale-90 transition-all hover:bg-blue-600 hover:text-white">
                        <i class="fa-solid fa-volume-high text-sm"></i>
                    </button>
                </div>
            </div>

            <div class="p-6 bg-blue-50/30 rounded-[2.2rem] border border-blue-100/30">
                <div class="flex flex-col items-center gap-3">
                    <button onclick="event.stopPropagation(); en_translationEngine.showPosGuide('${pos}')" 
                            class="px-5 py-1.5 rounded-full bg-blue-600 text-white text-[13px] font-black tracking-wider shadow-sm shadow-blue-200 active:scale-95 transition-all flex items-center gap-1.5">
                        ${pos}
                        <i class="fa-solid fa-circle-info text-[9px] opacity-70"></i>
                    </button>
                    
                    <div class="text-[15px] font-bold text-slate-700 leading-relaxed text-center px-2">
                        ${trans}
                    </div>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-3 mt-4">
                <button onclick="App.submitTrainingResult('${id}', false)" 
                        class="py-4 bg-white text-slate-400 rounded-2xl font-black text-[12px] border border-slate-100 active:scale-95 transition-all uppercase tracking-widest hover:text-rose-500 hover:border-rose-100">
                    Forgotten
                </button>
                <button onclick="App.submitTrainingResult('${id}', true)" 
                        class="py-4 bg-blue-600 text-white rounded-2xl font-black text-[12px] shadow-lg shadow-blue-100 active:scale-95 transition-all uppercase tracking-widest hover:brightness-110">
                    Retained
                </button>
            </div>
        </div>
    `;

    if (navigator.vibrate) navigator.vibrate(8);
},

/** 📊 [Settings] 渲染英文特訓統計看板與 CEFR 分析 (V2026.ULTRA.EN) */
_renderTrainingSettings() {
    // 🚀 1. 數據磁軌對焦：物理分流過濾 (僅採樣英文燃料)
    const allSrsData = window.state?.en_srsMetadata || [];
    const total = allSrsData.length;
    
    // 🚀 2. 指標精煉 (對位 8-Tuple 記憶階段)
    const stats = {
        learning: allSrsData.filter(it => it.stage > 0 && it.stage < 5).length,
        solidified: allSrsData.filter(it => it.stage >= 5).length,
        due: allSrsData.filter(it => it.nextReview && new Date(it.nextReview) <= new Date()).length
    };

    const solidifiedRate = total > 0 ? Math.round((stats.solidified / total) * 100) : 0;

    // 🚀 3. 自動導通與防禦鎖定
    // 💡 職人診斷：若英文磁區為真空狀態，主動提示同步
    if (total === 0 && !window.state?.en_hasAutoScanned) {
        setTimeout(() => {
            const scanBtn = document.querySelector('button[onclick*="manualSRSRefresh"]');
            if (scanBtn) App.manualSRSRefresh(scanBtn, true); 
        }, 50);
    }

    return `
        <div class="space-y-6 animate-fade-in mb-10 mt-10 text-left">
            <div class="px-4">
                <div class="flex justify-between items-end mb-2 px-2">
                    <div>
                        <h4 class="text-slate-800 font-black text-sm tracking-tight uppercase">English Track Statistics</h4>
                        <p class="text-[9px] text-blue-500 font-bold uppercase tracking-widest">CEFR Memory Matrix</p>
                    </div>
                </div>
                ${this._renderMemoryMatrix(total, stats, solidifiedRate)}
            </div>
            
            ${this._renderMaintenancePanel()}
            
            <p class="px-8 text-center text-[10px] text-slate-400 leading-relaxed font-medium pb-6 uppercase tracking-widest">
                V2026.ULTRA / EN Domain Master<br>
                <span class="opacity-50">Linguistic Matrix Service Active</span>
            </p>
        </div>
    `;
},

/** 🧬 [Internal] 渲染學習進度看板 (美式極簡版) */
_renderMemoryMatrix(total, stats, rate) {
    return `
        <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-50 relative overflow-hidden group">
            <div class="relative z-10">
                <div class="flex justify-between items-start mb-6">
                    <div>
                        <h4 class="text-black font-black text-xl mb-1">Learning Matrix</h4>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Retained / Solidified</p>
                    </div>
                    
                    <button onclick="en_translationEngine.manualSRSRefresh(this)" 
                            class="flex items-center gap-2 px-4 py-2 bg-slate-50 border border-slate-100 rounded-2xl text-slate-400 hover:text-blue-600 hover:bg-white hover:shadow-md active:scale-90 transition-all group/scan">
                        <i class="fa-solid fa-arrows-rotate text-[11px] group-hover/scan:rotate-180 transition-transform duration-500"></i>
                        <span class="text-[9px] font-black tracking-tighter uppercase">Sync Progress</span>
                    </button>
                </div>

                <div class="w-full h-2 bg-slate-100 rounded-full mb-8 overflow-hidden flex ring-4 ring-slate-50/50">
                    <div style="width: ${rate}%" class="h-full bg-blue-600 transition-all duration-1000 ease-out"></div>
                </div>

                <div class="grid grid-cols-3 gap-3">
                    <button onclick="en_translationView._toggleSettingChart('${total}', 'stage-distribution')" 
                            class="p-5 bg-slate-50 rounded-[1.8rem] border border-slate-100 text-center active:scale-95 transition-all">
                        <p class="text-3xl font-black text-slate-800 mb-1 tabular-nums">${total}</p>
                        <p class="text-[9px] text-slate-400 font-black uppercase tracking-widest">Total</p>
                    </button>
                    
                    <button onclick="en_translationView._toggleSettingChart('${stats.learning}', 'retainment-ratio')" 
                            class="p-5 bg-blue-50/50 rounded-[1.8rem] border border-blue-100/20 text-center active:scale-95 transition-all">
                        <p class="text-3xl font-black text-blue-600 mb-1 tabular-nums">${stats.learning}</p>
                        <p class="text-[9px] text-blue-400 font-black uppercase tracking-widest">Unstable</p>
                    </button>
                    
                    <button onclick="en_translationView._toggleSettingChart('${stats.due}', 'due-timeline')" 
                            class="p-5 bg-emerald-50/50 rounded-[1.8rem] border border-emerald-100/20 text-center active:scale-95 transition-all">
                        <p class="text-3xl font-black text-emerald-600 mb-1 tabular-nums">${stats.due}</p>
                        <p class="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Due Today</p>
                    </button>
                </div>

                <div id="en-settings-chart-space" class="hidden mt-6 p-6 bg-slate-50/60 rounded-[2.5rem] border border-slate-100/50 animate-slide-up">
                    <div id="en-chart-content"></div>
                </div>
            </div>
        </div>
    `;
},

/** ⚙️ [Internal] 磁區狀態維護面板 (藍色系主權版) */
_renderMaintenancePanel() {
    return `
        <div class="mx-4 bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100">
            <div class="mb-6">
                <h4 class="text-black font-black text-sm mb-1 uppercase">Sector Maintenance</h4>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Shadow Sector Protocol</p>
            </div>

            <div class="space-y-3">
                <button onclick="en_translationEngine.syncSRSShadow()" 
                        class="w-full p-6 bg-slate-50 hover:bg-white border border-transparent hover:border-blue-100 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-blue-100">
                            <i class="fa-solid fa-rotate text-lg"></i>
                        </div>
                        <div class="text-left">
                            <p class="text-[15px] font-black text-slate-800">Refresh Data Fuel</p>
                            <p class="text-[10px] text-slate-400 font-bold italic">Sync English vault to shadow sector</p>
                        </div>
                    </div>
                    <i class="fa-solid fa-chevron-right text-slate-200 group-hover:translate-x-1 transition-transform"></i>
                </button>

                <button onclick="en_translationEngine.forceResetSRS()" 
                        class="w-full p-6 bg-rose-50/30 hover:bg-white border border-transparent hover:border-rose-100 rounded-2xl flex items-center justify-between group active:scale-[0.98] transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 bg-rose-500 text-white rounded-xl flex items-center justify-center">
                            <i class="fa-solid fa-trash-can text-lg"></i>
                        </div>
                        <div class="text-left">
                            <p class="text-[15px] font-black text-slate-800">Wipe SRS Memory</p>
                            <p class="text-[10px] text-slate-400 font-bold">Clear all English SRS fingerprints</p>
                        </div>
                    </div>
                </button>
            </div>
        </div>
    `;
},


    // ============================================================
    // 🎓 D分區：EDU 教材精煉卡片 (Vocab/Grammar/Quiz/Listen)
    // ============================================================

/** 🏛️ [Wrapper] 教材分頁外殼 (V2026.ULTRA.EN CEFR 過濾總線) */
_renderEduTabWrapper(articleId, tabName, eduData = [], activeTier = 'ALL', page = 1) {
    // 🚀 1. 物理配置：鎖定英文 CEFR 能階與分頁參數
    const perPage = 12;
    const currentTier = String(activeTier).toUpperCase();
    
    // 🚀 2. 能階過濾：僅保留符合 CEFR 標準之數據
    // 💡 職人診斷：處理 ALL 與特定能階 (A1-C2) 的邏輯分流
    let filtered = eduData.filter(item => {
        if (currentTier === 'ALL' || currentTier === '全部') return true;
        const itemTier = String(item.level || item.tier || 'B1').toUpperCase();
        return itemTier === currentTier;
    });

    // 🚀 3. 分頁計算
    const totalPages = Math.ceil(filtered.length / perPage) || 1;
    const safePage = Math.min(page, totalPages);
    const pagedData = filtered.slice((safePage - 1) * perPage, safePage * perPage);

    // 🚀 4. 框架噴發：零件化組裝 (包含標籤列、分頁與內容磁區)
    return `
        <div class="edu-content-wrapper animate-fade-in space-y-6">
            
            ${this._renderTierFilters(articleId, tabName, currentTier)}

            <div class="px-2">
                ${this._renderPagination('ARTICLE_TAB', articleId, filtered.length, safePage, currentTier, tabName)}
            </div>

            <div id="edu-stack-${articleId}" class="grid grid-cols-1 gap-4 px-1 min-h-[300px]">
                ${pagedData.length > 0 
                    ? pagedData.map(data => this._renderEduContentCard(tabName, data)).join('') 
                    : this._renderEmptyState('No records in this Tier')}
            </div>

            <div class="pt-6 border-t border-slate-50">
                ${this._renderPagination('ARTICLE_TAB', articleId, filtered.length, safePage, currentTier, tabName)}
            </div>
        </div>
    `;
},

/** 🎨 [Module] 教材內容渲染引擎 (V2026.ULTRA.EN 解耦穩定版) */
_renderEduContent(type, data, itemId, activeTier = 'ALL', currentPage = 1) {
    // 🚀 1. 數據純化與能階對焦 (CEFR Filtering)
    const rawPool = Array.isArray(data) ? data : (data ? [data] : []);
    const filteredPool = rawPool.filter(item => {
        if (activeTier === 'ALL' || activeTier === '全部') return true;
        const itemLevel = String(item.level || item.tier || '').trim().toUpperCase();
        return itemLevel === String(activeTier).toUpperCase();
    });

    if (filteredPool.length === 0) return this._renderEmptyState(activeTier);

    // 🚀 2. 物理分頁切片 (V2026 標配：每幀 12 單位)
    const perPage = 12;
    const totalPages = Math.ceil(filteredPool.length / perPage);
    const startIndex = (currentPage - 1) * perPage;
    const pagedItems = filteredPool.slice(startIndex, startIndex + perPage);

    // 🚀 3. 構造組件磁軌
    // A. 頂部與底部導航條 (對位全域分頁按鈕)
    const paginationHtml = this._renderPagination('ARTICLE_TAB', itemId, filteredPool.length, currentPage, activeTier, type);
    
    // B. 零件分發：呼叫 Dispatcher 進行物理渲染
    const cardsHtml = this._dispatchCardRendering(type, pagedItems, startIndex, itemId);

    // 🚀 4. 佈局噴發：[分頁] -> [卡片磁區] -> [分頁]
    return `
        <div class="flex flex-col gap-6 animate-fade-in blue-theme">
            ${paginationHtml}
            <div class="edu-card-stack space-y-6 min-h-[400px]">
                ${cardsHtml}
            </div>
            ${paginationHtml}
        </div>
    `;
},

/** 🛰️ [Dispatcher] 根據標籤類型分發卡片渲染 (V2026.ULTRA.EN 專屬) */
_dispatchCardRendering(type, items, startIndex, itemId) {
    // 💡 職人診斷：確保 tabName 歸一化，封殺大小寫斷路風險
    const tabName = String(type).toUpperCase().trim();

    return items.map((item, i) => {
        const realIdx = startIndex + i;
        
        switch (tabName) {
            case 'VOCAB': 
                return this._renderVocabCard(item, realIdx, itemId);
            case 'GRAMMAR': 
                return this._renderGrammarCard(item, realIdx, itemId);
            case 'QUIZ': 
                return this._renderQuizCard(item, realIdx, itemId);
            case 'LISTENING': 
                return this._renderListeningCard(item, realIdx, itemId);
            default: 
                return `<div class="p-10 text-center text-blue-400 font-black text-[10px]">UNKNOWN_TRACK: ${type}</div>`;
        }
    }).join('');
},

/** 🧬 [Dispatcher] 教材零件分發器 (V2026.ULTRA.EN 數據對焦版) */
_renderEduContentCard(tabName, data) {
    // 🚀 1. 物理安全防禦：封殺空數據或損毀燃料
    if (!data) return '';

    // 🚀 2. 語義分流軌道：對位 8-Tuple 專屬渲染零件
    // 💡 職人診斷：確保 tabName 與 _renderArticlePackageWithTabs 生成的標籤完全一致
    switch (tabName.toUpperCase()) {
        case 'VOCAB':
            // 📖 導通：單字精煉卡 (Word, IPA, POS, Example...)
            return this._renderVocabCard(data, 0, 'temp-id'); 
            // 註：此處 idx 由外層 wrapper 控制，若為單體渲染可預設 0

        case 'GRAMMAR':
            // ⚖️ 導通：文法辨析卡 (Concept, Syntax, Usage Note...)
            return this._renderGrammarCard(data, 0, 'temp-id');

        case 'QUIZ':
            // ❓ 導通：互動測驗卡 (Question, Options, Logic Check...)
            return this._renderQuizCard(data, 0, 'temp-id');

        case 'LISTENING':
            // 🎧 導通：影子跟讀卡 (Acoustic Track, Role-play...)
            return this._renderListeningCard(data, 0, 'temp-id');

        default:
            // ⚡ 熔斷機制：若軌道不明，回傳降壓狀態提示
            console.warn(`⚠️ [EN-View-Dispatcher] Unknown Tab: ${tabName}`);
            return `<div class="p-4 text-[10px] text-slate-300 italic border border-dashed border-slate-100 rounded-xl">Unknown data track: ${tabName}</div>`;
    }
},

/** 🧬 [Module] 分頁 UI 狀態穩壓器 (V2026.ULTRA.EN 學習藍版) */
updateTabUI(articleId, tabName) {
    // 🚀 1. 物理定址：鎖定目標文章包容器
    const pkg = document.getElementById(`pkg-${articleId}`);
    if (!pkg) {
        console.warn(`⚠️ [EN-View-Sync] Package container not found: ${articleId}`);
        return;
    }

    // 🚀 2. 磁區重置：全量掃除舊有高亮狀態
    // 💡 職人診斷：使用 art-tab-btn 類名鎖定目標按鈕軌道
    const allBtns = pkg.querySelectorAll('.art-tab-btn');
    allBtns.forEach(btn => {
        // 移除選中樣式：回歸灰色、透明背景、無陰影
        btn.classList.remove('bg-white', 'text-slate-900', 'shadow-sm');
        btn.classList.add('text-slate-400');
    });

    // 🚀 3. 精確點亮：為當前啟動的標籤注入選中指紋
    const activeBtn = document.getElementById(`tab-btn-${articleId}-${tabName}`);
    if (activeBtn) {
        // 注入選中樣式：白色卡片浮起感、深色文字
        activeBtn.classList.add('bg-white', 'text-slate-900', 'shadow-sm');
        activeBtn.classList.remove('text-slate-400');
    }

    // 🚀 4. 觸覺感應補償
    // 💡 輕微震動以確認物理導通 (5ms 職人微震)
    if (navigator.vibrate) navigator.vibrate(5);
},

/** 🧬 [Private] CEFR 能階過濾零件 */
_renderTierFilters(articleId, tabName, activeTier) {
    const tiers = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    
    return `
        <div class="flex gap-2 overflow-x-auto no-scrollbar py-2 px-1 snap-x">
            ${tiers.map(t => {
                const isHit = activeTier === t;
                return `
                <button onclick="en_translationEngine.switchEduTier('${articleId}', '${tabName}', '${t}')" 
                        class="snap-center px-5 py-2 rounded-xl text-[10px] font-black transition-all border shrink-0
                        ${isHit 
                            ? 'bg-slate-900 text-white border-transparent shadow-lg shadow-blue-100 scale-105' 
                            : 'bg-white text-slate-300 border-slate-100 hover:border-blue-200'}">
                    ${t}
                </button>`;
            }).join('')}
        </div>
    `;
},

/** 📑 子組件：英文專屬分頁導航條 (V2026.ULTRA.EN 學習藍版) */
_renderPagination(type, itemId, totalItems, currentPage, tier, tabName = '') {
    // 🚀 1. 分頁邏輯計算 (每頁 12 筆對位)
    const perPage = 12;
    const totalPages = Math.ceil(totalItems / perPage) || 1;
    if (totalPages <= 1) return ''; // 只有一頁時物理隱藏，減少 UI 雜訊

    // 🚀 2. 視覺協定對焦
    const activeClass = "bg-blue-600 text-white shadow-md shadow-blue-100 scale-110 z-10";
    const inactiveClass = "bg-white text-slate-400 border-slate-100 hover:border-blue-200";

    // 🚀 3. 事件路網封裝
    // 💡 職人診斷：判斷是特訓牆還是文章分頁，導向正確的切換函數
    const getAction = (p) => {
        if (type === 'TRAINING') {
            return `App.setTrainingTab('page', ${p})`;
        }
        return `en_translationEngine.switchEduPage('${itemId}', '${tabName}', '${tier}', ${p})`;
    };

    // 🚀 4. 生成頁碼數列 (顯示前後 2 頁)
    let pages = [];
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            pages.push(i);
        } else if (pages[pages.length - 1] !== '...') {
            pages.push('...');
        }
    }

    return `
        <div class="flex items-center justify-center gap-1.5 py-4 animate-fade-in">
            ${pages.map(p => {
                if (p === '...') return `<span class="px-2 text-slate-300 font-black text-xs">···</span>`;
                
                const isHit = p === currentPage;
                return `
                    <button onclick="${getAction(p)}" 
                            class="w-9 h-9 rounded-xl text-[10px] font-black transition-all border
                            ${isHit ? activeClass : inactiveClass}">
                        ${p}
                    </button>
                `;
            }).join('')}
        </div>
    `;
},

/** 📊 [Dispatcher] 教材數據分發中樞 (V2026.ULTRA.EN 數據導通版) */
_renderEduMainContent(tabName, data, page, itemId) {
    // 🚀 1. 物理安全防禦：確保數據燃料存在
    if (!data) return this._renderEmptyState('Resource Matrix Missing');

    // 🚀 2. 分發邏輯矩陣 (對焦英美語學習 5 大分頁)
    // 💡 職人診斷：根據 tabName 物理導向對應的英文實體渲染器
    switch (tabName) {
        case 'SCRIPT':
            // 📜 軌道：原文與 IPA 視圖
            return this._renderOriginalTab(data);

        case 'VOCAB':
            // 📖 軌道：8-Tuple 核心單字卡
            // 數據來源：data.vocabulary
            return this._renderEduTabWrapper(itemId, tabName, data.vocabulary, data.activeTier, page);

        case 'GRAMMAR':
            // 🔬 軌道：文法深度辨析磁區
            // 數據來源：data.grammar
            return this._renderEduTabWrapper(itemId, tabName, data.grammar, data.activeTier, page);

        case 'QUIZ':
            // 📝 軌道：互動式測驗模組
            // 數據來源：data.quiz
            return this._renderEduTabWrapper(itemId, tabName, data.quiz, data.activeTier, page);

        case 'LISTENING':
            // 🎧 軌道：聲學特訓視圖 (鎖定 Audio-Only 邏輯)
            // 數據來源：data.listening
            return this._renderEduTabWrapper(itemId, tabName, data.listening, data.activeTier, page);

        default:
            // 熔斷機制：預設回歸原文視圖
            return this._renderOriginalTab(data);
    }
},

/** 📖 [Card] 渲染 8 元組英文單字精煉卡 (V2026.ULTRA.EN 編輯導通版) */
_renderVocabCard(v, idx, itemId) {
    // 🚀 1. 數據解構：對位 8-Tuple 導航坐標
    const word = v.word || v[0] || "---";
    const ipa = v.reading || v[1] || "";
    const pos = v.pos || v[2] || "N/A";
    const trans = v.translation || v[3] || "No Data";
    const example = v.example || v[4] || "";
    
    // 🚀 2. 封裝編輯燃料 (Payload)
    // 確保編輯器呈現的是純淨的數據結構供開發者微調
    const editPayload = v.word ? v : { 
        word, reading: ipa, pos, translation: trans, 
        example, exTrans: v[5] || "", variants: v[6] || "", synonyms: v[7] || "" 
    };

    const safeWord = word.replace(/'/g, "\\'");

    return `
        <div id="vocab-card-${itemId}-${idx}" class="bg-white rounded-[2.2rem] p-6 border border-slate-50 shadow-sm hover:shadow-md transition-all animate-fade-in group text-left">
            
            <div class="flex justify-between items-start mb-4">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="px-2 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-md tracking-widest uppercase shadow-sm shadow-blue-100">
                            ${pos}
                        </span>
                        ${ipa ? `<span class="text-[11px] font-mono text-blue-400 font-bold">/${ipa}/</span>` : ''}
                    </div>
                    <h4 class="text-[1.3rem] font-black text-slate-800 tracking-tight leading-tight">${word}</h4>
                </div>

                <div class="flex gap-2">
                    <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${idx})" 
                            class="w-9 h-9 rounded-xl bg-slate-50 text-slate-300 hover:text-blue-500 flex items-center justify-center transition-all active:scale-90">
                        <i class="fa-solid fa-pen-to-square text-xs"></i>
                    </button>
                    <button onclick="en_translationEngine.speakSegment('${safeWord}')" 
                            class="w-9 h-9 rounded-xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all active:scale-90 shadow-inner">
                        <i class="fa-solid fa-volume-high text-xs"></i>
                    </button>
                    <button onclick="en_translationEngine.addToSRS('${itemId}', ${idx})" 
                            class="w-9 h-9 rounded-xl bg-blue-50 text-blue-500 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all active:scale-90 shadow-sm border border-blue-100">
                        <i class="fa-solid fa-plus text-xs"></i>
                    </button>
                </div>
            </div>

            <div id="display-content-${itemId}-${idx}" class="space-y-3">
                <p class="text-[14px] font-bold text-slate-600 leading-relaxed border-l-4 border-blue-100 pl-3">
                    ${trans}
                </p>
                
                ${example ? `
                <div class="mt-4 p-4 bg-slate-50/80 rounded-2xl space-y-1.5">
                    <p class="text-[12px] font-bold text-slate-700 italic leading-snug">"${example}"</p>
                    ${v[5] ? `<p class="text-[11px] font-bold text-slate-400">${v[5]}</p>` : ''}
                </div>` : ''}

                ${v[6] ? `
                <div class="mt-4 pt-4 border-t border-slate-50 flex flex-wrap gap-1.5">
                    ${String(v[6]).split(',').map(tag => `
                        <span class="text-[9px] font-black text-slate-300 uppercase tracking-tighter bg-white border border-slate-100 px-2 py-0.5 rounded-lg shadow-sm">
                            ${tag.trim()}
                        </span>
                    `).join('')}
                </div>` : ''}
            </div>

            ${this._renderVocabEditPanel(itemId, idx, editPayload)}
        </div>
    `;
},

/** ✍️ [Sub-Module] 渲染 8 元組專屬編輯面板 (V2026.ULTRA.EN) */
_renderVocabEditPanel(itemId, idx, editPayload) {
    return `
        <div id="edit-panel-${itemId}-${idx}" class="hidden mt-6 p-5 bg-slate-900 rounded-[2rem] border border-slate-800 animate-slide-up shadow-2xl">
            <div class="flex justify-between items-center mb-4 px-1">
                <span class="text-[10px] font-black text-blue-400 uppercase tracking-widest">8-Tuple Fuel Editor</span>
                <span class="text-[9px] font-bold text-slate-500 font-mono">IDX: ${idx}</span>
            </div>
            
            <textarea id="edit-input-${itemId}-${idx}" 
                      class="w-full bg-slate-800 border-none rounded-[1.5rem] p-5 text-[12px] text-blue-100 min-h-[200px] font-mono focus:ring-2 ring-blue-500/50 shadow-inner custom-scrollbar"
                      placeholder="Input 8-tuple JSON payload...">${JSON.stringify(editPayload, null, 2)}</textarea>
            
            <div class="flex justify-end gap-3 mt-5">
                <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${idx})" 
                        class="px-5 py-2.5 text-[11px] font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors">
                    Discard
                </button>
                <button onclick="en_translationEngine.saveEduEdit('${itemId}', 'VOCAB', ${idx})" 
                        class="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-[11px] font-black uppercase tracking-widest shadow-lg shadow-blue-900/40 active:scale-95 transition-all">
                    Solidify Fuel
                </button>
            </div>
        </div>
    `;
},
/** 📝 [List] 渲染分頁單字清單容器 (V2026.ULTRA.EN 數據導通版) */
_renderEduVocabList(vocabs, page, itemId) {
    // 🚀 1. 物理安全防禦
    if (!vocabs || vocabs.length === 0) {
        return this._renderEmptyState('No Vocabulary Found');
    }

    // 🚀 2. 佈署學習磁軌
    // 💡 職人診斷：利用 grid 佈局確保在不同裝置上的卡片一致性，並鎖定 blue-theme 空間
    return `
        <div class="vocab-list-container animate-fade-in space-y-5 px-1 blue-theme">
            <div class="flex items-center gap-2 mb-4 px-2">
                <div class="w-1 h-4 bg-blue-600 rounded-full shadow-[0_0_8px_rgba(59,130,246,0.5)]"></div>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    Core Lexicon / Page ${page}
                </span>
            </div>

            <div class="grid grid-cols-1 gap-6">
                ${vocabs.map((v, idx) => {
                    // 💡 計算實體索引：確保加入 SRS 時對準文章包內的正確位置
                    const realIdx = ((page - 1) * 12) + idx;
                    return this._renderVocabCard(v, realIdx, itemId);
                }).join('')}
            </div>

            <div class="flex justify-center pt-6 opacity-20">
                <div class="w-20 h-[1.5px] bg-gradient-to-r from-transparent via-blue-500 to-transparent"></div>
            </div>
        </div>
    `;
},

/** ⚖️ [Card] 渲染 CEFR 英文文法精煉卡 (V2026.ULTRA.EN 學習藍版) */
_renderGrammarCard(g, idx, itemId) {
    // 🚀 1. 數據解構：對位 8-Tuple 文法軌道
    // [Title, Level, Concept, Meaning, Example, Usage_Note]
    const title = g.title || g[0] || "Grammar Focus";
    const level = (g.level || g[1] || "B1").toUpperCase();
    const concept = g.concept || g[2] || "";
    const meaning = g.meaning || g[3] || "Contextual usage explanation";
    const example = g.example || g[4] || "";
    const note = g.note || g[5] || "";

    // 🚀 2. 視覺配色對焦 (CEFR 分級染色)
    const tierColor = this._getTierColor ? this._getTierColor(level) : 'blue';

    return `
        <div class="bg-white rounded-[2.2rem] p-7 border border-slate-50 shadow-sm hover:shadow-md transition-all animate-fade-in group text-left relative overflow-hidden">
            <div class="absolute -top-2 -right-2 opacity-[0.03] text-6xl font-black italic select-none pointer-events-none">${level}</div>

            <div class="flex justify-between items-start mb-5 relative z-10">
                <div class="space-y-1.5">
                    <div class="flex items-center gap-2">
                        <span class="px-2.5 py-0.5 bg-slate-800 text-white text-[9px] font-black rounded-md tracking-widest uppercase">
                            ${level}
                        </span>
                        <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest opacity-70">Syntax Module</span>
                    </div>
                    <h4 class="text-[1.2rem] font-black text-slate-800 tracking-tight leading-tight">${title}</h4>
                </div>

                <button onclick="en_translationEngine.saveGrammarNote('${itemId}', ${idx})" 
                        class="w-10 h-10 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center hover:bg-blue-50 hover:text-blue-500 transition-all active:scale-90 shadow-inner border border-slate-100">
                    <i class="fa-solid fa-bookmark text-xs"></i>
                </button>
            </div>

            <div class="space-y-4 relative z-10">
                ${concept ? `
                <div class="inline-flex items-center gap-2 px-3 py-1 bg-blue-50/50 rounded-lg border border-blue-100/30">
                    <span class="text-[10px] font-black text-blue-400 uppercase tracking-tighter">CONCEPT</span>
                    <span class="text-[11px] font-bold text-blue-600">${concept}</span>
                </div>` : ''}

                <p class="text-[14px] font-bold text-slate-600 leading-relaxed pl-1">
                    ${meaning}
                </p>

                ${example ? `
                <div class="p-5 bg-slate-50 rounded-2xl border-l-4 border-blue-500/30 space-y-2">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-black text-slate-300 uppercase tracking-widest">Example</span>
                        <button onclick="en_translationEngine.speakSegment('${example.replace(/'/g, "\\'")}')" class="text-blue-400 hover:text-blue-600 transition-colors">
                            <i class="fa-solid fa-volume-high text-[10px]"></i>
                        </button>
                    </div>
                    <p class="text-[13px] font-bold text-slate-700 leading-snug italic">${example}</p>
                </div>` : ''}

                ${note ? `
                <div class="flex gap-3 pt-2">
                    <div class="shrink-0 text-blue-400 pt-0.5"><i class="fa-solid fa-lightbulb text-sm"></i></div>
                    <p class="text-[11px] font-bold text-slate-400 leading-normal italic">
                        <span class="text-blue-500 font-black uppercase text-[9px] mr-1">Note:</span> ${note}
                    </p>
                </div>` : ''}
            </div>
        </div>
    `;
},

/** 📝 [List] 渲染分頁文法清單容器 (V2026.ULTRA.EN 數據導通版) */
_renderEduGrammarList(grammars, page, itemId) {
    // 🚀 1. 物理安全防禦：確保文法燃料存在
    if (!grammars || grammars.length === 0) {
        return this._renderEmptyState('Grammar Database Vacuum');
    }

    // 🚀 2. 佈署文法辨析磁軌
    // 💡 職人診斷：利用垂直軌道感 (Vertical Rail) 強調文法邏輯的嚴謹性
    return `
        <div class="grammar-list-container animate-fade-in space-y-8 px-1 blue-theme">
            <div class="flex justify-between items-center mb-6 px-3">
                <div class="flex items-center gap-3">
                    <div class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></div>
                    <h5 class="text-[11px] font-black text-slate-500 uppercase tracking-[0.2em]">
                        Syntax Analysis / Page ${page}
                    </h5>
                </div>
                <span class="text-[9px] font-black text-blue-300 bg-blue-50 px-2 py-1 rounded-md border border-blue-100/50 uppercase">
                    V2026.ULTRA.EN
                </span>
            </div>

            <div class="relative space-y-6">
                <div class="absolute left-10 top-0 bottom-0 w-px bg-gradient-to-b from-blue-100 via-slate-50 to-transparent pointer-events-none"></div>

                ${grammars.map((g, idx) => {
                    // 💡 座標計算：精確導通至文章包內的文法索引
                    const realIdx = ((page - 1) * 12) + idx;
                    return `
                        <div class="relative pl-6">
                            <div class="absolute left-[37px] top-8 w-[7px] h-[7px] rounded-full bg-white border-2 border-blue-400 z-10 shadow-sm shadow-blue-100"></div>
                            
                            ${this._renderGrammarCard(g, realIdx, itemId)}
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="py-10 flex flex-col items-center gap-2 opacity-30">
                <div class="text-[10px] font-black text-slate-300 uppercase tracking-widest italic font-mono">End of Syntax Track</div>
                <div class="w-1 h-8 bg-gradient-to-b from-blue-400 to-transparent rounded-full"></div>
            </div>
        </div>
    `;
},

/** ❓ [Card] 渲染英美語模擬測驗卡 (V2026.ULTRA.EN 學習藍版) */
_renderQuizCard(q, idx, itemId) {
    // 🚀 1. 數據解構：對位 8-Tuple 測驗軌道
    // [Question, Options(Array/String), AnswerIndex, Explanation, Category]
    const question = q.question || q[0] || "No Question Context";
    const rawOptions = q.options || q[1] || [];
    const ansIdx = q.answerIndex !== undefined ? q.answerIndex : (q[2] !== undefined ? q[2] : -1);
    const explanation = q.explanation || q[3] || "";
    
    // 💡 職人診斷：確保選項格式歸一化為陣列
    const options = Array.isArray(rawOptions) ? rawOptions : String(rawOptions).split(',');

    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm hover:shadow-md transition-all animate-fade-in group text-left relative overflow-hidden mb-6">
            <div class="absolute -top-4 -right-4 opacity-[0.03] text-8xl font-black italic select-none pointer-events-none">${idx + 1}</div>

            <div class="space-y-4 mb-8 relative z-10">
                <div class="flex items-center gap-2">
                    <span class="px-2.5 py-0.5 bg-blue-600 text-white text-[9px] font-black rounded-md tracking-[0.2em] uppercase shadow-sm shadow-blue-100">
                        Quiz
                    </span>
                    <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest">Active Assessment</span>
                </div>
                <h4 class="text-[1.3rem] font-black text-slate-800 tracking-tight leading-snug">${question}</h4>
            </div>

            <div class="space-y-3 relative z-10">
                ${options.map((opt, oIdx) => `
                    <button onclick="en_translationEngine.checkQuizAnswer(this, ${oIdx}, ${ansIdx}, '${itemId}', ${idx})" 
                            class="w-full p-5 bg-slate-50 hover:bg-white border border-transparent hover:border-blue-200 rounded-[1.8rem] text-left transition-all active:scale-[0.98] group/opt flex items-center gap-4">
                        <div class="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center text-[10px] font-black text-slate-400 group-hover/opt:border-blue-400 group-hover/opt:text-blue-500 transition-colors shadow-sm">
                            ${String.fromCharCode(65 + oIdx)}
                        </div>
                        <span class="text-[14px] font-bold text-slate-600 group-hover/opt:text-slate-800 transition-colors">${opt.trim()}</span>
                    </button>
                `).join('')}
            </div>

            <div id="quiz-ans-${itemId}-${idx}" class="hidden mt-8 pt-8 border-t border-dashed border-slate-100 animate-slide-up">
                <div class="flex gap-4 items-start p-5 bg-blue-50/50 rounded-[2rem] border border-blue-100/30">
                    <div class="w-10 h-10 rounded-full bg-white flex items-center justify-center text-blue-500 shadow-sm shrink-0 mt-1">
                        <i class="fa-solid fa-lightbulb text-sm"></i>
                    </div>
                    <div class="space-y-1">
                        <p class="text-[10px] font-black text-blue-400 uppercase tracking-widest">Linguistic Explanation</p>
                        <p class="text-[13px] font-bold text-slate-600 leading-relaxed italic">
                            ${explanation || "No further details provided."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
},

/** 📝 [List] 渲染分頁測驗清單容器 (V2026.ULTRA.EN 數據導通版) */
_renderEduQuizList(quizzes, page, itemId) {
    // 🚀 1. 物理安全防禦：確保測驗燃料存在
    if (!quizzes || quizzes.length === 0) {
        return this._renderEmptyState('Assessment Database Vacuum');
    }

    // 🚀 2. 佈署互動測驗磁軌
    // 💡 職人診斷：利用藍色系標頭鎖定「評量模式」主權
    return `
        <div class="quiz-list-container animate-fade-in space-y-10 px-1 blue-theme">
            <div class="flex justify-between items-end mb-8 px-4">
                <div class="space-y-1">
                    <h5 class="text-[12px] font-black text-slate-800 uppercase tracking-[0.2em]">
                        Active Assessment
                    </h5>
                    <p class="text-[9px] font-black text-blue-500 uppercase tracking-widest opacity-60">
                        Neural Proficiency Test / Page ${page}
                    </p>
                </div>
                <div class="flex flex-col items-end">
                    <span class="text-[20px] font-black text-slate-200 tabular-nums leading-none">
                        ${String(page).padStart(2, '0')}
                    </span>
                    <div class="w-8 h-1 bg-blue-600 rounded-full mt-1 shadow-[0_0_8px_rgba(59,130,246,0.4)]"></div>
                </div>
            </div>

            <div class="space-y-12">
                ${quizzes.map((q, idx) => {
                    // 💡 座標計算：精確導通至文章包內的測驗索引
                    const realIdx = ((page - 1) * 12) + idx;
                    return this._renderQuizCard(q, realIdx, itemId);
                }).join('')}
            </div>

            <div class="py-16 flex flex-col items-center gap-4">
                <div class="flex items-center gap-4 w-full px-10">
                    <div class="h-px flex-1 bg-gradient-to-r from-transparent to-slate-100"></div>
                    <div class="w-2 h-2 rounded-full border-2 border-blue-200"></div>
                    <div class="h-px flex-1 bg-gradient-to-l from-transparent to-slate-100"></div>
                </div>
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em] italic font-mono">
                    Session Checkpoint Reached
                </p>
            </div>
        </div>
    `;
},

/** 🎧 [Card] 渲染課文會話練習卡 (V2026.ULTRA.EN 課本版) */
_renderListeningCard(l, idx, itemId) {
    // 🚀 1. 數據解構：[角色, 英文, 中文, IPA, 腔調]
    const role = l.role || l[0] || "A";
    const en = l.en || l[1] || "...";
    const zh = l.zh || l[2] || "";
    const ipa = l.ipa || l[3] || "";
    const accent = l.accent || l[4] || (role === 'A' ? 'US' : 'GB');

    const safeEn = en.replace(/'/g, "\\'").replace(/"/g, '&quot;');

    return `
        <div class="bg-white rounded-[2.2rem] p-6 border border-slate-50 shadow-sm hover:shadow-md transition-all animate-fade-in group text-left mb-4">
            <div class="flex items-start gap-5">
                
                <div class="flex flex-col items-center gap-3 shrink-0 pt-1">
                    <button onclick="en_translationEngine.speakSegment('${safeEn}', '${accent}')" 
                            class="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100 active:scale-95 transition-all group/play">
                        <i class="fa-solid fa-play text-xs group-hover/play:scale-110"></i>
                    </button>
                    <div class="px-2 py-0.5 bg-slate-100 rounded-md text-[8px] font-black text-slate-400 tracking-widest uppercase">
                        ${accent}
                    </div>
                </div>

                <div class="flex-1 space-y-4">
                    <div class="flex justify-between items-center">
                        <span class="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Speaker ${role}</span>
                        <span class="text-[9px] font-black text-slate-200">#${String(idx + 1).padStart(2, '0')}</span>
                    </div>

                    <div class="space-y-1">
                        <p class="text-[1.15rem] font-black text-slate-800 leading-tight tracking-tight">${en}</p>
                        ${ipa ? `<p class="text-[12px] font-mono text-blue-400 font-bold tracking-wide">/${ipa}/</p>` : ''}
                    </div>

                    <div class="pt-3 border-t border-slate-50">
                        <button onclick="this.nextElementSibling.classList.toggle('hidden'); this.classList.toggle('opacity-30')" 
                                class="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2 hover:text-blue-500 transition-all">
                            <i class="fa-solid fa-language text-[11px]"></i> Show Translation
                        </button>
                        <p class="hidden mt-3 text-[13px] font-bold text-slate-500 leading-relaxed animate-slide-up">
                            ${zh}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    `;
},

/** 📝 [List] 渲染分頁聽力清單容器 (V2026.ULTRA.EN 數據導通版) */
_renderEduListeningList(listenings, page, itemId) {
    // 🚀 1. 物理安全防禦：確保聽力燃料存在
    if (!listenings || listenings.length === 0) {
        return this._renderEmptyState('Acoustic Data Vacuum');
    }

    // 🚀 2. 佈署聲學特訓磁軌
    // 💡 職人診斷：利用垂直導航感，將會話練習轉化為連貫的跟讀流程
    return `
        <div class="listening-list-container animate-fade-in space-y-6 px-1 blue-theme">
            <div class="flex justify-between items-center mb-6 px-4">
                <div class="flex items-center gap-3">
                    <div class="relative">
                        <div class="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <div class="absolute inset-0 w-3 h-3 bg-blue-400 rounded-full animate-ping opacity-75"></div>
                    </div>
                    <h5 class="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em]">
                        Acoustic Track / Page ${page}
                    </h5>
                </div>
                <div class="flex items-center gap-2">
                    <span class="text-[8px] font-black text-blue-400 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 uppercase tracking-widest">
                        Shadowing Mode
                    </span>
                </div>
            </div>

            <div class="space-y-4">
                ${listenings.map((l, idx) => {
                    // 💡 座標計算：精確導通至文章包內的聽力索引
                    const realIdx = ((page - 1) * 12) + idx;
                    return this._renderListeningCard(l, realIdx, itemId);
                }).join('')}
            </div>

            <div class="py-12 flex flex-col items-center gap-3">
                <div class="flex gap-1">
                    ${[1, 2, 3].map(i => `<div class="w-1 h-1 bg-blue-200 rounded-full animate-pulse" style="animation-delay: ${i * 0.2}s"></div>`).join('')}
                </div>
                <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] italic">
                    End of Dialogue Session
                </p>
                <div class="h-10 w-px bg-gradient-to-b from-blue-100 to-transparent"></div>
            </div>
        </div>
    `;
},

    // ============================================================
    // ⚙️ E分區：輔助零件、樣式對焦與物理掃描
    // ============================================================

/** ⚓ 物理對焦：標籤置中捲動協定 (V2026.ULTRA.EN) */
focusTranslateTab(cat) {
    // 🚀 1. 執行實體定址
    // 對位 _renderTranslateTabs 與 _renderTierFilters 生成的 ID 格式
    const tabId = `trans-tab-${encodeURIComponent(cat.trim())}`;
    const tabEl = document.getElementById(tabId) || document.getElementById(`lvl-tab-${cat.trim()}`);
    const container = document.getElementById('translate-tabs') || document.getElementById('level-tabs-track');

    if (!tabEl || !container) {
        // 💡 職人診斷：若找不到目標，可能是異步渲染未完成，執行微秒級延遲自癒
        if (!this._retryFocus) {
            this._retryFocus = setTimeout(() => {
                this.focusTranslateTab(cat);
                this._retryFocus = null;
            }, 100);
        }
        return;
    }

    // 🚀 2. 計算中心補償座標 (Center Offset)
    const containerWidth = container.offsetWidth;
    const tabWidth = tabEl.offsetWidth;
    const tabLeft = tabEl.offsetLeft;

    // 🎯 算式：目標位置 = 標籤左偏移 - (容器寬/2) + (標籤寬/2)
    const scrollTarget = tabLeft - (containerWidth / 2) + (tabWidth / 2);

    // 🚀 3. 執行物理位移
    container.scrollTo({
        left: scrollTarget,
        behavior: 'smooth'
    });

    // 🚀 4. 觸發觸覺反饋 (Haptic Feedback)
    if (navigator.vibrate) navigator.vibrate(5);
},

/** 🎯 物理對焦：影子分類標籤置中協定 (V2026.ULTRA.EN) */
focusTrainingTab(cat) {
    // 🚀 1. 物理定址：對準 CEFR 特訓牆專屬 ID 格式
    const tabId = `lvl-tab-${String(cat).trim()}`;
    const tabEl = document.getElementById(tabId);
    const container = document.getElementById('level-tabs-track');

    if (!tabEl || !container) {
        // 💡 職人診斷：特訓牆切換時可能伴隨 DOM 重繪，執行 150ms 延遲對焦自癒
        if (!this._retryTrainingFocus) {
            this._retryTrainingFocus = setTimeout(() => {
                this.focusTrainingTab(cat);
                this._retryTrainingFocus = null;
            }, 150);
        }
        return;
    }

    // 🚀 2. 座標運算：計算水平置中補償 (Center Compensation)
    const containerWidth = container.offsetWidth;
    const tabWidth = tabEl.offsetWidth;
    const tabLeft = tabEl.offsetLeft;

    // 🎯 算式：確保選中的 CEFR 標籤位居軌道正中央
    const scrollTarget = tabLeft - (containerWidth / 2) + (tabWidth / 2);

    // 🚀 3. 執行物理位移：鎖定 smooth 阻尼感
    container.scrollTo({
        left: scrollTarget,
        behavior: 'smooth'
    });

    // 🚀 4. 聲學與觸覺回饋：輔助操作感知
    if (navigator.vibrate) navigator.vibrate(5);
},

/** 🎨 核心焊接：直接對位 EN_CONFIG.TIERS (V2026.ULTRA.EN) */
_getTierColor(level) {
    // 🚀 1. 物理安全防禦：確保 level 存在且格式歸一化
    const targetLevel = String(level || 'B1').toUpperCase().trim();

    // 🚀 2. 動態提領：對焦全局配置總線
    // 💡 職人診斷：優先從 EN_CONFIG.TIERS 獲取色彩指紋，若磁區真空則回歸預設學習藍 (#3b82f6)
    const color = EN_CONFIG.TIERS[targetLevel]?.color || '#3b82f6';

    return color;
},

/** 🌫️ 視覺效應：影子卡片蒸發動畫 (V2026.ULTRA.EN) */
updateTrainingCardUI(id, isSuccess) {
    const card = document.getElementById(`srs-card-${id}`);
    if (!card) return;

    // 🚀 1. 鎖定物理操作，封殺重複觸發
    card.style.pointerEvents = 'none';

    // 🚀 2. 執行聲學與觸覺同步
    if (isSuccess) {
        // 💡 成功固化：輕快連擊感
        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
    } else {
        // 💡 失敗重塑：沈重警示感
        if (navigator.vibrate) navigator.vibrate(50);
    }

    // 🚀 3. 物理動畫分流
    if (isSuccess) {
        // ✨ [Evaporation] 向右上角旋轉並淡出
        card.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        card.style.transform = 'translate(100px, -100px) rotate(15deg) scale(0.8)';
        card.style.opacity = '0';
        card.style.filter = 'blur(10px)';
    } else {
        // 🌪️ [Relocation] 震動後向下墜落
        card.style.transition = 'all 0.5s cubic-bezier(0.6, -0.28, 0.73, 0.05)';
        card.classList.add('animate-shake'); // 假設全域已有 shake animation
        
        setTimeout(() => {
            card.style.transform = 'translateY(150px) scale(0.9)';
            card.style.opacity = '0';
            card.style.filter = 'grayscale(1)';
        }, 100);
    }

    // 🚀 4. 物理空間回收 (Space Reclamation)
    // 💡 職人診斷：待動畫結束後，觸發數據層更新並移除 DOM，避免內存臃腫
    setTimeout(() => {
        card.style.display = 'none';
        card.remove();

        // 檢查牆面是否已空，若是則觸發自癒渲染
        const remainingCards = document.querySelectorAll('.srs-card');
        if (remainingCards.length === 0) {
            // 呼叫 App 層重新加載下一頁或顯示空狀態
            if (typeof App.refreshTrainingWall === 'function') {
                App.refreshTrainingWall();
            }
        }
    }, 600);
},

/** 🏆 [Report] 渲染挑戰特訓戰報 (V2026.ULTRA.EN 參數對焦版) */
renderChallengeReport(record) {
    // 🚀 1. 數據精煉：精確對位全量 Record 物件 (對齊日版命名空間)
    // 💡 職人診斷：使用 session 前綴確保數據反映的是「本次挑戰」而非歷史累積
    const total = record.sessionTotal || record.total || 0;
    const correct = record.sessionCorrect || record.correct || 0;
    const accuracy = record.accuracy || (total > 0 ? Math.round((correct / total) * 100) : 0);
    const tierStats = record.tiers || record.tierStats || {};

    // 🚀 2. 成就勳章對焦：英美語專屬能階評價
    let rank = { title: 'RECRUIT', icon: '🐣' };
    if (accuracy >= 95) rank = { title: 'LINGUISTIC ELITE', icon: '💎' };
    else if (accuracy >= 85) rank = { title: 'ADVANCED MASTER', icon: '🔥' };
    else if (accuracy >= 70) rank = { title: 'PROFICIENT', icon: '⚡' };
    else if (accuracy >= 50) rank = { title: 'OPERATIONAL', icon: '🛡️' };

    return `
        <div class="challenge-report space-y-8 animate-fade-in pb-20 text-left blue-theme">
            
            <div class="bg-slate-900 rounded-[3rem] p-10 text-center relative overflow-hidden shadow-2xl shadow-blue-200/50">
                <div class="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-600 via-sky-400 to-blue-600"></div>
                
                <div class="relative z-10 space-y-4">
                    <div class="text-6xl mb-4 drop-shadow-lg">${rank.icon}</div>
                    <h2 class="text-[12px] font-black text-blue-400 tracking-[0.5em] uppercase">${rank.title}</h2>
                    <div class="text-7xl font-black text-white tabular-nums tracking-tighter">
                        ${accuracy}<span class="text-2xl text-blue-400/50">%</span>
                    </div>
                    <p class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Session Precision Rate</p>
                </div>

                <div class="absolute -bottom-10 -right-10 w-40 h-40 bg-blue-600/10 rounded-full blur-3xl animate-pulse"></div>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div class="bg-white rounded-[2.2rem] p-6 border border-slate-100 shadow-sm">
                    <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Items Processed</p>
                    <p class="text-2xl font-black text-slate-800">${total}</p>
                </div>
                <div class="bg-white rounded-[2.2rem] p-6 border border-slate-100 shadow-sm">
                    <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest mb-1">Correct Hits</p>
                    <p class="text-2xl font-black text-blue-600">${correct}</p>
                </div>
            </div>

            <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm">
                <h4 class="text-[11px] font-black text-slate-800 uppercase tracking-[0.2em] mb-6">Linguistic Complexity</h4>
                <div class="space-y-4">
                    ${this._renderReportTiers(tierStats)}
                </div>
            </div>

            <div class="flex flex-col gap-3">
                <button onclick="App.setTrainingTab('mode', 'Challenge')" 
                        class="w-full py-5 bg-blue-600 text-white rounded-[2rem] font-black text-[12px] tracking-[0.3em] uppercase shadow-lg shadow-blue-200 active:scale-95 transition-all">
                    Restart Session
                </button>
                <button onclick="App.setTrainingTab('mode', 'Read')" 
                        class="w-full py-5 bg-white text-slate-400 border border-slate-100 rounded-[2rem] font-black text-[10px] tracking-[0.3em] uppercase active:scale-95 transition-all">
                    Exit to Sector
                </button>
            </div>
        </div>
    `;
},

/** 🧬 [Private] 渲染戰報能階條 (英美語藍色系) */
_renderReportTiers(tierData) {
    const tiers = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    return tiers.map(t => {
        const count = tierData[t] || 0;
        const width = Math.min(100, (count / 10) * 100); // 假設以 10 為基準線
        if (count === 0) return '';
        
        return `
            <div class="space-y-1.5">
                <div class="flex justify-between items-center text-[10px] font-black uppercase">
                    <span class="text-slate-400 tracking-widest">${t} Level</span>
                    <span class="text-blue-500">${count}</span>
                </div>
                <div class="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                    <div style="width: ${width}%" class="h-full bg-blue-500 rounded-full transition-all duration-1000"></div>
                </div>
            </div>
        `;
    }).join('');
},

/** 📸 [OCR] 執行模式切換之光學掃描效果 (V2026.ULTRA.EN) */
_handleModeTransitionEffect(activeMode) {
    const container = document.getElementById('translation-container');
    if (!container) return;

    // 🚀 1. 物理注入：建立 OCR 掃描線實體
    const scanLine = document.createElement('div');
    scanLine.className = 'fixed top-0 left-0 w-full h-[2px] bg-blue-500 shadow-[0_0_15px_#3b82f6] z-[999] pointer-events-none';
    scanLine.style.transition = 'all 0.8s cubic-bezier(0.19, 1, 0.22, 1)';
    document.body.appendChild(scanLine);

    // 🚀 2. 建立數據擴散波紋 (Neural Ripple)
    const ripple = document.createElement('div');
    ripple.className = 'fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-0 h-0 bg-blue-500/5 rounded-full z-[998] pointer-events-none';
    ripple.style.transition = 'all 0.6s ease-out';
    document.body.appendChild(ripple);

    // 🚀 3. 執行物理動畫：由頂部掃描至底部
    requestAnimationFrame(() => {
        // 掃描線向下切換
        scanLine.style.top = '100%';
        
        // 神經波紋擴張
        ripple.style.width = '200vw';
        ripple.style.height = '200vh';
        ripple.style.opacity = '0';

        // 容器內容執行模糊淡入 (對位 8-Tuple 載入感)
        container.style.filter = 'blur(10px) brightness(1.2)';
        container.style.opacity = '0.5';
        
        setTimeout(() => {
            container.style.transition = 'all 0.4s ease-out';
            container.style.filter = 'none';
            container.style.opacity = '1';
        }, 300);
    });

    // 🚀 4. 物理空間回收：移除掃描線與波紋
    setTimeout(() => {
        scanLine.remove();
        ripple.remove();
    }, 850);

    // 🚀 5. 觸覺反饋：模式對焦震動
    if (navigator.vibrate) navigator.vibrate(8);
},

/** 💡 子組件：渲染微型確認氣泡 (V2026.ULTRA.EN 氣泡對焦版) */
renderMiniConfirm(id, message, confirmAction) {
    // 🚀 1. 物理安全防禦：確保傳入參數有效
    if (!id || !message) return '';

    // 🚀 2. 佈署氣泡實體 (對位日版 absolute 座標協定)
    // 💡 職人診斷：使用 z-[5000] 確保氣泡穿透卡片層級，bottom-full 實現向上噴發
    // 色彩鎖定：背景採 Slate-900 (深邃黑) 搭配藍色邊框，與英文版挑戰模式視覺對齊
    return `
        <div id="mini-confirm-${id}" 
             class="absolute bottom-full right-0 mb-4 animate-pop-in z-[5000] pointer-events-auto">
            
            <div class="bg-slate-900 text-white px-5 py-3 rounded-[1.4rem] shadow-2xl flex items-center gap-4 whitespace-nowrap border border-blue-500/30 backdrop-blur-md">
                
                <span class="text-[10px] font-black tracking-tight uppercase">${message}</span>
                
                <div class="flex gap-2">
                    <button onclick="document.getElementById('mini-confirm-${id}').remove()" 
                            class="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg text-[9px] font-black uppercase transition-all active:scale-90">
                        No
                    </button>
                    <button onclick="${confirmAction}; document.getElementById('mini-confirm-${id}').remove();" 
                            class="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded-lg text-[9px] font-black uppercase shadow-lg shadow-blue-900/40 transition-all active:scale-95">
                        Yes
                    </button>
                </div>

                <div class="w-3 h-3 bg-slate-900 rotate-45 absolute -bottom-1.5 right-6 border-r border-b border-blue-500/20"></div>
            </div>
        </div>
    `;
},


/** 📡 [Private] 語義映射：獲取英美語專屬 AI Prompt (V2026.ULTRA.EN) */
_getTranslateAiPrompt(query) {
    // 🚀 1. 核心協定宣告：去軍事化、純淨數據、8 元組格式
    const protocol = `
        Role: TravelFlow Senior English Linguistic Architect.
        Constraint: Return RAW JSON ONLY. No prose, no markdown code blocks.
        Format: [ [Word, IPA, POS, Meaning, Example, Ex-Trans, Variants, Synonyms] ]
        Linguistic Standard: CEFR (A1-C2) & US/UK English Nuance.
    `;

    // 🚀 2. 語境分流：針對不同類型的查詢進行提示詞優化
    // 💡 職人診斷：判斷 query 是否包含長句或特定教材請求
    const isLongSentence = query.trim().split(/\s+/).length > 3;

    if (isLongSentence) {
        return `${protocol} 
            Task: Perform 8-Tuple Analysis on the following English sentence. 
            Identify key vocabulary, syntax structures (Grammar), and acoustic markers.
            Input: "${query}"`;
    }

    return `${protocol} 
        Task: Provide a deep linguistic breakdown for the English term(s).
        Include IPA, Part of Speech (POS), and contextual travel-related examples.
        Input: "${query}"`;
}

};

// 🚀 物理掛載：確保 App 動態調用英美語視圖主權
window.en_translationView = en_translationView;