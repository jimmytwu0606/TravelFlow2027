/** 🎨 [en_viewEngine] 英美語學習專屬視圖引擎 - V2026.ULTRA
 * 作用：獨立處理英文學習模式的 UI 渲染，包含 IPA 音標支援與藍色系視覺協定
 */

export const en_viewEngine = {




/** 📑 [Sub-Component] 標籤導航：物理 ID 歸一化版 (V2026.ULTRA.EN_FIXED) */
_renderTranslateTabs(categories, currentCat) {
    // 💡 職人觀點：鎖定英美語專屬「學習藍」的高飽和度陰影，強化層次感
    const activeBtnClass = 'bg-blue-600 text-white shadow-lg shadow-blue-100 border-transparent';
    const inactiveBtnClass = 'bg-white text-slate-400 border-slate-100';

    return `
        <div id="translate-tabs" class="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x px-4">
            ${categories.map(cat => {
                const cleanCat = cat.trim();
                const isHit = currentCat === cleanCat;
                
                // 🚀 核心校準：同步日版命名協定 [tab-link-類別名稱]
                // 💡 職人診斷：放棄 encodeURIComponent，改用物理字串對焦以確保穩定導通
                return `
                <div class="snap-center">
                    <button id="tab-link-${cleanCat}" 
                            onclick="App.filterTranslate('${cleanCat}')" 
                            class="px-5 py-2.5 rounded-2xl text-[11px] font-black border transition-all whitespace-nowrap active:scale-95
                            ${isHit ? activeBtnClass : inactiveBtnClass}">
                        ${cleanCat}
                    </button>
                </div>`;
            }).join('')}
            
            <button onclick="App.promptEditTranslateCategories()" 
                    class="px-4 py-2.5 rounded-2xl bg-slate-50 text-slate-300 border border-dashed border-slate-200 active:scale-90 transition-all shrink-0">
                <i class="fa-solid fa-gear"></i>
            </button>
        </div>
    `;
},

/** 🔌 子零件：英美語專用燃料注入器 (Injector) */
_renderFuelInjector() {
    // 💡 職人觀點：直接鎖定英文學習模式的藍色系視覺協定
    const accentColor = 'text-blue-600';
    const ringColor = 'focus:ring-blue-100';
    const btnColor = 'bg-blue-600 shadow-blue-100';

    // 🚀 核心對焦：從全域邏輯引擎獲取初始英文 Prompt
    // 確保渲染瞬間即具備基礎指令內容
    const initialPrompt = App.activeTranslationEngine._getTranslateAiPrompt('');

    return `
        <div class="mx-4 bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 space-y-5 animate-fade-in">
            <div class="flex justify-between items-center px-1">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                    English Fuel Injector
                </h4>
                <div id="translate-ai-btn">
                    ${viewEngine.renderAICopyBtn(initialPrompt)}
                </div>
            </div>
            
            <div class="relative">
                <input type="text" id="trans-query-input" 
                       class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-xs focus:ring-2 ${ringColor} transition-all outline-none" 
                       placeholder="Enter English topic (e.g., Hotel Check-in)..." 
                       oninput="App.syncTranslateAiPrompt(this.value)">
            </div>
            
            <textarea id="trans-json-input" 
                      class="w-full h-24 bg-slate-50 border-none rounded-2xl p-4 font-mono text-[10px] ${accentColor} outline-none focus:ring-1 focus:ring-slate-100" 
                      placeholder="Paste AI Protocol JSON fuel here..."></textarea>
            
            <button onclick="App.importTranslateFuel()" 
                    class="w-full py-4 ${btnColor} text-white rounded-[1.5rem] font-black text-xs shadow-lg active:scale-95 transition-all">
                SAVE TO STUDY VAULT
            </button>
        </div>
    `;
},

/** 🎙️ [Real-time Module] 即時翻譯發動機 (英美語 V2026.ULTRA 四撥盤導通版) */
renderRealtimeTranslation(container, activeMode = 'voice') {
    if (!container) return;

    // 🚀 1. 語義對焦與數據回溯
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    // 💡 職人診斷：對位英文學習標籤 DNA (Study/Daily/Travel...)
    const studyTags = activeTrip?.translateConfig?.categories || ['Study', 'Daily', 'Business', 'Travel'];

    container.innerHTML = `
        <div class="realtime-module animate-fade-in space-y-6 px-2 pb-40 blue-theme">
            ${this._renderLinguisticSwitcher()}
            ${this._renderRealtimeHeader()}
            
            <div class="flex p-1.5 bg-slate-100/80 rounded-[2rem] shadow-inner backdrop-blur-sm mx-2">
                ${this._renderModeButtons(activeMode)}
            </div>

            <div id="quick-category-track" 
                 class="px-4 transition-all duration-500 ease-out overflow-hidden 
                        ${activeMode === 'filter' ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}">
                <div class="flex gap-2 overflow-x-auto no-scrollbar pb-3 snap-x">
                    ${['AUTO', ...studyTags].map(tag => `
                        <button onclick="App.activeTranslationEngine.lockCategory('${tag}')"
                                class="shrink-0 px-5 py-2 rounded-full text-[10px] font-black border border-slate-100 bg-white text-slate-400 hover:text-blue-600 hover:border-blue-100 transition-all shadow-sm snap-center active:scale-90">
                            # ${tag.toUpperCase()}
                        </button>
                    `).join('')}
                </div>
            </div>

            <div id="realtime-input-sector" class="animate-fade-in">
                ${
                    activeMode === 'camera' ? this._renderCameraInput() : 
                    activeMode === 'voice'  ? this._renderVoiceInput() : 
                    activeMode === 'filter' ? this._renderTagIntro() : 
                    this._renderTextInput()
                }
            </div>

            ${this._renderResultArea()}
        </div>
    `;

    // 🚀 2. 物理補償與相機點火聯動
    if (activeMode === 'text') {
        requestAnimationFrame(() => document.getElementById('text-translate-input')?.focus());
    } else if (activeMode === 'camera') {
        setTimeout(() => {
            if (window.en_translationEngine?.initCameraStream) {
                window.en_translationEngine.initCameraStream();
            }
        }, 100);
    }
},

/** 📋 [EN] 標籤鎖定模式專屬引導組件 */
_renderTagIntro() {
    return `
        <div class="py-12 text-center animate-fade-in bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-100 mx-4">
            <div class="text-3xl mb-3 opacity-20">🔖</div>
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest">Tag Lock Active</p>
            <p class="text-[10px] text-slate-300 mt-1 italic">Select a tag above to categorize your study records.</p>
        </div>
    `;
},

/** 🧪 Acoustic/Visual Compensation (Averting TypeError) */
_handleModeTransitionEffect(activeMode) {
    if (activeMode === 'text') {
        requestAnimationFrame(() => {
            document.getElementById('text-translate-input')?.focus();
        });
    } else if (activeMode === 'camera') {
        setTimeout(() => {
            if (window.en_translationEngine?.initCameraStream) {
                window.en_translationEngine.initCameraStream();
            }
        }, 150);
    }
},

/** 🛰️ 子零件 A：英美語專用標題 */
_renderRealtimeHeader() {
    return `
        <div class="header-section flex justify-between items-end px-4 pt-4">
            <div>
                <h2 class="text-xl font-black text-slate-800 tracking-tight">Speech Focus</h2>
                <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest mt-1 italic">American English Learning</p>
            </div>
            <div class="text-[9px] font-bold text-slate-300 uppercase tracking-tighter">
                Status: <span class="text-emerald-500 font-black">Online</span>
            </div>
        </div>
    `;
},

/** 📑 [Sub-Component] 模式導航按鈕：五撥盤預備版 (V2026.ULTRA.FIXED) */
_renderModeButtons(activeMode) {
    // 🚀 核心焊接：維持四向導航，但在 CSS 佈局上執行空間解耦
    const modes = [
        { id: 'voice',  icon: '🎤', label: 'Voice' },
        { id: 'text',   icon: '⌨️', label: 'Text' },
        { id: 'camera', icon: '📸', label: 'Scan' },
        { id: 'filter', icon: '🔖', label: 'Tags' }
        // { id: 'stats', icon: '📊', label: 'Stats' } // 💡 未來第五軌道預留位
    ];

    return modes.map(m => {
        const isHit = activeMode === m.id;
        
        return `
        <button onclick="App.switchRealtimeMode('${m.id}')" 
                class="flex-1 min-w-0 py-2.5 rounded-[1.2rem] text-[9px] font-black transition-all duration-300 flex flex-col items-center justify-center gap-0.5
                ${isHit ? 'bg-white text-slate-900 shadow-sm scale-[1.03] z-10' : 'text-slate-400 hover:text-slate-600'}">
            
            <span class="${isHit && m.id === 'voice' ? 'animate-pulse' : ''} text-[1.1rem] leading-none">
                ${m.icon}
            </span> 
            
            <span class="tracking-widest whitespace-nowrap uppercase opacity-80 scale-90">
                ${m.label}
            </span>
        </button>
        `;
    }).join('');
},



/** 📸 [New] 私有組件：英美語拍照採集介面 (學習藍協定) */
_renderCameraInput() {
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
                            class="w-14 h-14 bg-slate-50 text-slate-400 rounded-full flex items-center justify-center active:scale-90 transition-all border border-slate-100">
                        📁
                    </button>
                    
                    <button onclick="App.activeTranslationEngine.capturePhoto()" 
                            class="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-200 border-4 border-white active:scale-95 transition-all">
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

/** 🎯 子組件 C：分析結果顯示區域 (V2026.ULTRA 聲學/劇場/影像旗艦版) */
_renderResultArea() {
    // 💡 職人對焦：鎖定英美語學習藍色系與劇場紫色系視覺協定
    const badgeColor = 'text-blue-400';
    const theatreBadgeColor = 'text-purple-400';
    const neuralLabel = 'Linguistic Alignment';
    
    return `
        <div id="realtime-result-area" class="hidden space-y-4 animate-slide-up px-2 pb-10">
            
            <div id="standard-result-display" class="bg-slate-800 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
                <div class="absolute -top-4 -right-4 opacity-10 text-8xl font-black italic select-none pointer-events-none">EN</div>
                
                <p id="stt-original" class="text-slate-400 text-[0.8rem] font-bold mb-6 italic border-b border-white/10 pb-4 tracking-tight"></p>
                
                <div class="space-y-2 relative z-10">
                    <div class="flex items-center gap-2 mb-1">
                        <div class="w-1.5 h-1.5 rounded-full bg-current ${badgeColor} animate-pulse"></div>
                        <p class="text-[0.6rem] font-black ${badgeColor} uppercase tracking-[0.2em]">${neuralLabel}</p>
                    </div>
                    <p id="tts-target" class="text-[1.8rem] font-medium leading-relaxed selection:bg-blue-600/50"></p>
                </div>

                <button onclick="App.repeatLastTTS()" 
                        class="mt-10 w-full py-5 bg-white/10 rounded-2xl font-black text-xs hover:bg-white/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 border border-white/5 shadow-inner">
                    <span class="text-base">🔊</span> 
                    <span class="tracking-widest">REPLAY AUDIO / 重複播報</span>
                </button>
            </div>

            <div id="theatre-result-display" class="hidden bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-3xl relative overflow-hidden border border-purple-900/50">
                <div class="absolute -top-4 -right-4 opacity-10 text-8xl font-black italic select-none pointer-events-none text-purple-500">Duo</div>

                <div class="flex items-center justify-between mb-8 pb-4 border-b border-white/10 relative z-10">
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full bg-current ${theatreBadgeColor} animate-pulse"></div>
                        <p class="text-[0.6rem] font-black ${theatreBadgeColor} uppercase tracking-[0.2em]">Acoustic Persona Theatre</p>
                    </div>
                    <span class="text-[8px] px-2 py-0.5 bg-purple-600 text-white rounded font-black uppercase tracking-widest">EN_US</span>
                </div>

                <div id="theatre-dialogue-stack" class="space-y-6 relative z-10 min-h-[150px]">
                    <div class="flex flex-col items-center justify-center py-10 opacity-20">
                        <div class="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>

                <button onclick="en_translationEngine.playFullDialogue()" 
                        class="mt-10 w-full py-5 bg-purple-600 rounded-2xl font-black text-xs hover:bg-purple-700 active:scale-[0.98] transition-all flex items-center justify-center gap-3 shadow-lg shadow-purple-900/30">
                    <span class="text-base">🎬</span> 
                    <span class="tracking-widest">PLAY FULL THEATRE / 序幕啟動</span>
                </button>
            </div>
            
            <p class="text-center text-[9px] text-slate-300 font-bold uppercase tracking-[0.2em] pt-2">
                System: <span class="text-slate-400" id="tech-stack-info">Neural Studio Learning Engine</span>
            </p>
        </div>
    `;
},


    _renderLinguisticSwitcher() {
        return `
            <div class="px-4 pt-2">
                <div class="bg-slate-100/60 p-1 rounded-[1.5rem] flex items-center border border-slate-200/40 shadow-inner">
                    <button onclick="App.setTransLanguage('JP')" class="flex-1 py-2.5 rounded-[1.2rem] text-[10px] font-black text-slate-400">🇯🇵 JP MODE</button>
                    <button onclick="App.setTransLanguage('EN')" class="flex-1 py-2.5 rounded-[1.2rem] text-[10px] font-black bg-white shadow-md text-blue-600">🇺🇸 EN MODE</button>
                </div>
            </div>
        `;
    },

    /** 🎙️ [Real-time] 英美語即時採集介面 */
    _renderVoiceInput() {
        return `
            <div class="bg-white rounded-[3.5rem] p-12 border border-slate-50 shadow-xl flex flex-col items-center justify-center space-y-10 active:scale-95 transition-all cursor-pointer relative overflow-hidden group"
                 onclick="App.startRealtimeMic()">
                <div class="absolute inset-0 bg-blue-50/30 opacity-0 group-active:opacity-100 transition-opacity"></div>
                <div class="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center shadow-2xl shadow-blue-200 relative z-10">
                    <span class="text-6xl">🇺🇸</span>
                    <div id="mic-pulse" class="absolute inset-0 rounded-full animate-ping bg-white opacity-20 hidden"></div>
                </div>
                <div class="text-center relative z-10">
                    <h4 class="font-black text-slate-800 text-xl">Tap to Speak English</h4>
                    <p id="mic-status" class="text-slate-400 text-[0.8rem] font-bold mt-2">AI Semantic Focus Ready</p>
                </div>
            </div>`;
    },

/** ⌨️ [Real-time] 英美語文字轉運站 (學習藍鎖定版) */
_renderTextInput() {
    // 💡 職人校準：移除所有可能被日文引擎干擾的 class 與文字
    const focusRing = 'focus:ring-blue-100';
    const magicBtn = 'bg-blue-600 shadow-blue-100'; // 強制藍色，防禦粉色污染

    return `
        <div class="bg-white rounded-[2rem] p-4 border border-slate-50 shadow-lg space-y-3 animate-fade-in">
            <div class="flex items-center gap-2">
                <textarea id="text-translate-input" 
                          class="flex-1 h-12 bg-slate-50 border-none rounded-[1rem] px-4 py-3 font-bold text-[13px] ${focusRing} outline-none transition-all resize-none" 
                          placeholder="Paste English content here..."></textarea>
                
                <button onclick="App.copyPromptWithContent()" 
                        class="shrink-0 w-12 h-12 ${magicBtn} text-white rounded-[1rem] active:scale-95 transition-all flex items-center justify-center text-xl">
                    🪄
                </button>
            </div>
            
            <button onclick="App.injectFuelFromClipboard()" 
                    class="w-full py-3 bg-slate-800 text-white rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 active:scale-[0.98] transition-all">
                📥 Inject Learning Fuel
            </button>
        </div>
        <div id="fuel-display-stack" class="space-y-4 mt-6"></div>`;
},


/** 🧬 [Cards] 英美語專用卡片渲染器：類型隔離與導流版 (V2026.ULTRA.FIXED) */
_renderTranslateCards(items, activeCategory = '全部') {
    const targetCat = String(activeCategory).trim();
    
    // 🚀 1. 物理磁區過濾
    // 💡 職人診斷：在此階段僅進行分類篩選，類型導流交由下方的 map 處理
    const filtered = targetCat === '全部' 
        ? items 
        : items.filter(item => String(item.category) === targetCat);

    if (filtered.length === 0) {
        return `
            <div class="py-24 text-center border-2 border-dashed border-slate-50 rounded-[3rem] mx-2 animate-fade-in">
                <p class="text-4xl mb-4 opacity-20">📂</p>
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-widest">No English fuel in this sector</p>
            </div>`;
    }

    // 🚀 2. 類型分流渲染 (Type-Based Dispatching)
    return filtered.map((item) => {
        // [CASE A]: 文章包類型 -> 導流至旗艦外殼渲染器
        if (item.type === 'article_package' || item.type === 'article') {
            return this.renderArticlePackage(item);
        }

        // [CASE B]: 即時翻譯紀錄 (Text/Voice/Image) -> 渲染極簡學習卡
        // 💡 職人協定：此處維持原有的藍色系美學與 IPA 軌道支持
        return `
            <div class="bg-white rounded-[2.5rem] border border-slate-50 shadow-sm hover:shadow-md transition-all active:scale-[0.98] group relative animate-fade-in mb-5 overflow-hidden">
                <div onclick="App.speak('${item.a.replace(/'/g, "\\'")}')" 
                     class="p-8 pb-14 space-y-4 cursor-pointer relative z-10">
                    
                    <p class="text-[11px] font-black text-slate-400 tracking-wide flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                        ${item.q}
                    </p>
                    
                    <h4 class="text-[1.4rem] font-bold text-slate-800 leading-relaxed">
                        ${item.a}
                    </h4>
                    
                    <p class="text-[11px] text-blue-600 font-mono tracking-wider italic opacity-80">
                        ${item.phonetic ? `[ ${item.phonetic} ]` : ''}
                    </p>
                    
                    ${item.usage ? `<p class="text-[10px] text-slate-500 font-medium leading-relaxed mt-2">💡 ${item.usage}</p>` : ''}
                </div>
                
                <div class="absolute bottom-5 right-8 z-20">
                    <span class="bg-slate-700 text-white text-[8px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest">
                        ${item.category || 'General'}
                    </span>
                </div>
                
                <div class="absolute right-8 top-10 text-xl opacity-0 group-hover:opacity-100 transition-opacity z-20">🔊</div>
                
                <button onclick="event.stopPropagation(); en_translationEngine.deleteArticleRecord('${item.id}')" 
                        class="absolute left-8 bottom-5 text-[9px] font-black text-slate-200 hover:text-rose-500 transition-colors uppercase tracking-widest z-20">
                    Purge
                </button>
            </div>
        `;
    }).join('');
},

/** 📦 [Article-Package] 渲染英美語文章包外殼 (V2026.ULTRA) */
renderArticlePackage(pkg) {
    const { id, title, category, level = 'B1', segments = [] } = pkg;
    
    // 🚀 1. 物理狀態感應
    // 💡 職人診斷：從 Engine 記憶體中獲取當前展開狀態，確保渲染對位
    const isExpanded = window.en_translationEngine?.expandedIds?.has(id);
    const activeTab = window.en_translationEngine?.currentActiveTabs?.[id] || '原文';

    return `
        <div id="pkg-folder-${id}" 
             class="group bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-md transition-all mb-5 overflow-hidden animate-fade-in">
            
            <div onclick="en_translationEngine.toggleArticleFolder('${id}')" 
                 class="p-6 cursor-pointer flex items-center justify-between active:bg-slate-50 transition-colors">
                
                <div class="flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl shadow-inner group-hover:scale-110 transition-transform">
                        ${category === 'Lyrics' ? '🎵' : category === 'Tech' ? '🛠️' : '📝'}
                    </div>
                    <div class="space-y-1">
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] px-2 py-0.5 bg-slate-900 text-white rounded-md font-black tracking-tighter uppercase">
                                ${level}
                            </span>
                            <h4 class="text-[15px] font-black text-slate-800 tracking-tight line-clamp-1">${title}</h4>
                        </div>
                        <p class="text-[10px] text-slate-400 font-medium tracking-wide">
                            <span class="text-blue-500 font-bold">${segments.length}</span> Segments · 
                            <span class="uppercase">${category || 'General'}</span>
                        </p>
                    </div>
                </div>

                <div id="pkg-icon-${id}" class="w-8 h-8 flex items-center justify-center text-slate-300 transition-transform duration-500"
                     style="${isExpanded ? 'transform: rotate(180deg)' : ''}">
                    <i class="fa-solid fa-chevron-down text-sm"></i>
                </div>
            </div>

            <div id="pkg-content-${id}" 
                 class="${isExpanded ? '' : 'hidden'} border-t border-slate-50 bg-white/50 backdrop-blur-sm">
                
                <div class="flex gap-1 p-2 bg-slate-50/50 mx-4 mt-4 rounded-2xl border border-slate-100/50">
                    ${['原文', '音標', '單字', '文法', '測驗'].map(tab => {
                        const isHit = activeTab === tab;
                        return `
                            <button data-pkg="${id}" data-tab="${tab}"
                                onclick="en_translationEngine.switchArticleTab('${id}', '${tab}')"
                                class="flex-1 py-2.5 text-[10px] font-black rounded-xl transition-all
                                ${isHit ? 'bg-slate-900 text-white shadow-sm' : 'text-slate-400 hover:text-slate-600'}">
                                ${tab}
                            </button>
                        `;
                    }).join('')}
                </div>

                <div id="package-content-${id}" class="p-6 min-h-[100px]">
                    <div class="flex flex-col items-center justify-center py-10 opacity-10">
                        <div class="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                </div>

                <div class="px-6 py-4 bg-slate-50/30 flex items-center justify-between border-t border-slate-50/50">
                    <div class="flex gap-2">
                        <button onclick="en_translationEngine.editArticlePackage('${id}')" 
                                class="p-2 text-slate-400 hover:text-blue-500 transition-colors">
                            <i class="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button onclick="en_translationEngine.theatreCopyPrompt('${id}')" 
                                class="p-2 text-slate-400 hover:text-purple-500 transition-colors" title="Ignite Theatre">
                            <i class="fa-solid fa-masks-theater"></i>
                        </button>
                    </div>
                    <button onclick="en_translationEngine.deleteArticleRecord('${id}')" 
                            class="text-[9px] font-black text-slate-300 hover:text-rose-500 tracking-widest transition-colors uppercase">
                        Reclaim Package
                    </button>
                </div>
            </div>
        </div>
    `;
},

/** 🧬 [Private-Visual] 渲染原文與翻譯音軌 (含 IPA 物理投射) */
_renderOriginalTab(pkg) {
    const { id, segments = [] } = pkg;
    
    // 🚀 1. 狀態感應：偵測目前是否開啟音標模式
    const currentTab = window.en_translationEngine?.currentActiveTabs?.[id] || '原文';
    const showIPA = currentTab === '音標';

    if (segments.length === 0) {
        return `<div class="py-10 text-center opacity-30 font-black text-[10px] tracking-widest">NO_FUEL_DETECTED</div>`;
    }

    // 🚀 2. 執行段落渲染與聲學焊接
    return segments.map(([en, zh], idx) => {
        // 💡 職人診斷：利用 en_translationEngine 的 IPA 解析器進行物理對位
        // 若 showIPA 為 true，則點亮 IPA 軌道，否則保持隱形以釋放視覺空間
        const ipaContent = showIPA ? window.en_translationEngine._getIPAShadow(en) : "";

        return `
            <div class="group mb-8 last:mb-2 animate-fade-in">
                <div class="flex items-start gap-3 mb-2">
                    <button onclick="en_translationEngine.speakSegment(['${en.replace(/'/g, "\\'")}'], '${id}')" 
                            class="mt-1 w-8 h-8 shrink-0 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center hover:bg-blue-600 hover:text-white active:scale-90 transition-all shadow-sm">
                        <i class="fa-solid fa-volume-high text-[10px]"></i>
                    </button>
                    
                    <div class="flex-1 space-y-1">
                        <p class="text-[1.05rem] font-bold text-slate-800 leading-relaxed selection:bg-blue-100 tracking-tight">
                            ${en}
                        </p>
                        ${showIPA ? `
                        <div class="flex flex-wrap gap-x-1.5 gap-y-0.5 px-1">
                            <span class="text-[0.75rem] font-mono text-blue-500 font-medium opacity-80 tracking-wide">
                                / ${ipaContent} /
                            </span>
                        </div>` : ''}
                    </div>
                </div>

                <div class="ml-11 border-l-2 border-slate-100 pl-4 py-0.5 group-hover:border-blue-200 transition-colors">
                    <p class="text-[0.95rem] text-slate-500 font-normal leading-relaxed">
                        ${zh}
                    </p>
                </div>
                
                <div class="ml-11 flex items-center gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onclick="en_translationEngine.openEduMenu('${id}', ${idx})" 
                            class="text-[9px] font-black text-slate-400 hover:text-blue-600 uppercase tracking-widest flex items-center gap-1">
                        <i class="fa-solid fa-graduation-cap"></i> Analyze Segment
                    </button>
                </div>
            </div>
        `;
    }).join('');
},

/** 🏛️ [EDU-Framework] 渲染教材分頁骨架：CEFR 能階與分頁總線 (V2026.ULTRA) */
_renderEduTabWrapper(itemId, tabName, eduData = [], activeTier = 'ALL', page = 1) {
    console.log(`📡 [EN-EDU-Wrapper] 構建框架: ${tabName} | Tier: ${activeTier} | Page: ${page}`);

    // 🚀 1. 能階過濾邏輯 (CEFR Tier Filtering)
    const tiers = ['ALL', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
    
    // 🚀 2. 分頁數據演算
    const ITEMS_PER_PAGE = 5;
    const totalItems = eduData.length;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    const startIdx = (page - 1) * ITEMS_PER_PAGE;
    const paginatedData = eduData.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    return `
        <div class="edu-tab-wrapper space-y-6 animate-fade-in">
            
            <div class="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 snap-x">
                ${tiers.map(tier => {
                    const isHit = activeTier === tier;
                    return `
                        <button onclick="en_translationEngine.switchArticleTab('${itemId}', '${tabName}', '${tier}', 1)"
                                class="shrink-0 px-4 py-1.5 rounded-full text-[10px] font-black border transition-all snap-center
                                ${isHit ? 'bg-blue-600 text-white border-transparent shadow-md scale-105' : 'bg-white text-slate-400 border-slate-100 hover:border-blue-200'}">
                            ${tier}
                        </button>
                    `;
                }).join('')}
            </div>

            <div id="edu-content-track-${itemId}" class="space-y-4">
                ${this._renderEduMainContent(tabName, paginatedData, page, itemId)}
            </div>

            ${totalPages > 1 ? this._renderPagination(itemId, tabName, totalItems, page, activeTier) : ''}
            
            <div class="pt-4 flex justify-center">
                <button onclick="en_translationEngine.toggleFuelPanel('${itemId}')"
                        class="px-6 py-2 rounded-full border border-dashed border-slate-200 text-[9px] font-black text-slate-400 uppercase tracking-widest hover:bg-slate-50 hover:text-blue-500 transition-all active:scale-95">
                    <i class="fa-solid fa-plus-circle mr-1"></i> Add ${tabName} Fuel
                </button>
            </div>
        </div>
    `;
},

/** 🧬 [Private] 分流渲染：根據 Tab 類型呼叫對應的列表組件 */
_renderEduMainContent(tabName, data, page, itemId) {
    if (data.length === 0) {
        return `
            <div class="py-12 text-center opacity-20 flex flex-col items-center">
                <span class="text-3xl mb-2">📭</span>
                <p class="text-[10px] font-black uppercase tracking-widest">No matching fuel</p>
            </div>
        `;
    }

    switch (tabName) {
        case '單字': return this._renderEduVocabList(data, page, itemId);
        case '文法': return this._renderEduGrammarList(data, page, itemId);
        case '測驗': return this._renderEduQuizList(data, page, itemId);
        case '聽力': return this._renderEduListeningList(data, page, itemId);
        default: return "";
    }
},

/** ⚓ [EDU-Framework] 物理分頁控制器：英美語數據導航軌道 (V2026.ULTRA) */
_renderPagination(itemId, type, totalItems, currentPage, tier = 'ALL') {
    // 🚀 1. 分頁邏輯演算
    const ITEMS_PER_PAGE = 5;
    const totalPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
    
    if (totalPages <= 1) return ""; // 熔斷機制：單頁數據不顯影導航條

    // 🚀 2. 邊界判定
    const isFirst = currentPage === 1;
    const isLast = currentPage === totalPages;

    // 🚀 3. 構建導航軌道 HTML
    return `
        <div class="flex items-center justify-between gap-4 mt-8 px-2 animate-fade-in">
            <button onclick="${isFirst ? '' : `en_translationEngine.switchEduPage('${type}', '${itemId}', '${tier}', ${currentPage - 1})`}"
                    class="flex-1 py-3 px-4 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest transition-all
                    ${isFirst ? 'bg-slate-50 text-slate-200 cursor-not-allowed' : 'bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 active:scale-95 shadow-sm'}"
                    ${isFirst ? 'disabled' : ''}>
                <i class="fa-solid fa-arrow-left mr-2"></i> Prev
            </button>

            <div class="flex flex-col items-center min-w-[60px]">
                <span class="text-[12px] font-black text-slate-800 font-mono tracking-tighter">
                    ${String(currentPage).padStart(2, '0')} <span class="text-slate-200 mx-1">/</span> ${String(totalPages).padStart(2, '0')}
                </span>
                <p class="text-[8px] font-bold text-slate-300 uppercase tracking-widest mt-0.5">Focus Page</p>
            </div>

            <button onclick="${isLast ? '' : `en_translationEngine.switchEduPage('${type}', '${itemId}', '${tier}', ${currentPage + 1})`}"
                    class="flex-1 py-3 px-4 rounded-2xl border border-slate-100 font-black text-[10px] uppercase tracking-widest transition-all
                    ${isLast ? 'bg-slate-50 text-slate-200 cursor-not-allowed' : 'bg-white text-slate-500 hover:border-blue-300 hover:text-blue-600 active:scale-95 shadow-sm'}"
                    ${isLast ? 'disabled' : ''}>
                Next <i class="fa-solid fa-arrow-right ml-2"></i>
            </button>
        </div>
    `;
},

/** 📖 [EDU-Vocab] 渲染分頁單字清單容器 (V2026.ULTRA) */
_renderEduVocabList(vocabs = [], page = 1, itemId) {
    console.log(`📡 [EN-Vocab-List] 執行批量投影 | Page: ${page} | Count: ${vocabs.length}`);

    // 🚀 1. 物理座標演算
    // 💡 職人診斷：計算全域索引 (Global Index)，確保編輯功能能準確對位磁區
    const ITEMS_PER_PAGE = 5;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    if (vocabs.length === 0) {
        return `
            <div class="py-20 text-center opacity-20 flex flex-col items-center animate-fade-in">
                <i class="fa-solid fa-box-open text-4xl mb-4"></i>
                <p class="text-[10px] font-black uppercase tracking-[0.2em]">Vocab Vault Empty</p>
            </div>
        `;
    }

    // 🚀 2. 執行卡片循環渲染
    // 💡 職人協定：將每一筆數據封裝至 _renderVocabCard 實體
    const vocabCardsHtml = vocabs.map((v, idx) => {
        // 全域物理索引 = 目前分頁偏移量 + 當前循環索引
        const globalIdx = offset + idx;
        return this._renderVocabCard(v, globalIdx, itemId);
    }).join('');

    // 🚀 3. 軌道封裝噴發
    return `
        <div class="vocab-display-track space-y-5 animate-fade-in">
            <div class="flex items-center gap-2 mb-2 px-1">
                <span class="w-1.5 h-4 bg-blue-600 rounded-full"></span>
                <h5 class="text-[11px] font-black text-slate-400 uppercase tracking-widest">
                    Focusing ${vocabs.length} Vocabulary Nodes
                </h5>
            </div>
            
            ${vocabCardsHtml}
            
            <p class="text-[9px] text-slate-300 italic text-center pt-2 uppercase tracking-tighter">
                Semantic Data Stream // 8-Tuple Width System
            </p>
        </div>
    `;
},

/** 📖 [EDU-Vocab] 8 元組英美語單字卡實體渲染器 (V2026.ULTRA) */
_renderVocabCard(v, idx, itemId) {
    // 🚀 1. 數據脫殼 (8-Tuple Extraction)
    // 格式：[Word, IPA, POS, Accent, Variant, Trans, Example, Ex_Trans]
    const word    = v["0"] || v[0] || "Unknown";
    const ipa     = v["1"] || v[1] || "";
    const pos     = v["2"] || v[2] || "";
    const accent  = v["3"] || v[3] || "";
    const variant = v["4"] || v[4] || "";
    const trans   = v["5"] || v[5] || "";
    const example = v["6"] || v[6] || "";
    const exTrans = v["7"] || v[7] || "";
    const level   = (v.level || 'B1').toUpperCase();

    // 🚀 2. 顯示模式 HTML (Display Mode)
    const displayHtml = `
        <div id="display-content-${itemId}-${idx}" class="space-y-4 animate-fade-in">
            <div class="flex justify-between items-start">
                <div class="space-y-1">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] px-2 py-0.5 bg-blue-600 text-white rounded-md font-black tracking-tighter">${level}</span>
                        <h4 class="text-[1.3rem] font-bold text-slate-800 tracking-tight">${word}</h4>
                        <button onclick="en_translationEngine.speakSegment(['${word.replace(/'/g, "\\'")}'])" 
                                class="w-6 h-6 text-slate-300 hover:text-blue-500 transition-colors">
                            <i class="fa-solid fa-volume-high text-[12px]"></i>
                        </button>
                    </div>
                    <div class="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span class="text-[11px] font-mono text-blue-500 font-bold">/${ipa}/</span>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-tighter">${window.en_translationEngine?.getShortPOS(pos) || pos}</span>
                        ${accent ? `<span class="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-medium">🎯 ${accent}</span>` : ''}
                    </div>
                </div>
                
                <div class="flex gap-1">
                    <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${idx})" 
                            class="w-8 h-8 text-slate-300 hover:text-blue-500 transition-all active:scale-90">
                        <i class="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button onclick="en_translationEngine.deleteEduItemWithShadow('${itemId}', '單字', ${idx})" 
                            class="w-8 h-8 text-slate-200 hover:text-rose-400 transition-all active:scale-90">
                        <i class="fa-solid fa-trash-can"></i>
                    </button>
                </div>
            </div>

            <div class="space-y-2">
                <p class="text-[14px] font-bold text-slate-700">${trans}</p>
                ${variant ? `<p class="text-[10px] text-slate-400 italic font-medium"><i class="fa-solid fa-earth-americas mr-1"></i> ${variant}</p>` : ''}
            </div>

            <div class="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 group/ex">
                <p class="text-[13px] text-slate-600 leading-relaxed font-medium mb-1">${example}</p>
                <p class="text-[11px] text-slate-400">${exTrans}</p>
            </div>
        </div>
    `;

    // 🚀 3. 編輯模式 HTML (Edit Mode - 實體化 JSON 編輯)
    const editHtml = `
        <div id="edit-panel-${itemId}-${idx}" class="hidden space-y-4 animate-slide-down">
            <div class="flex items-center gap-2 px-1">
                <span class="w-1 h-3 bg-amber-400 rounded-full"></span>
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refactoring 8-Tuple Fuel</span>
            </div>
            <textarea id="edit-input-${itemId}-${idx}" 
                      class="w-full h-48 bg-slate-900 text-blue-300 font-mono text-[11px] p-5 rounded-3xl border-none focus:ring-2 focus:ring-blue-500/30 outline-none leading-relaxed shadow-inner"
            >${JSON.stringify(v, null, 2)}</textarea>
            <div class="flex gap-2">
                <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${idx})" 
                        class="flex-1 py-3 bg-slate-100 text-slate-500 rounded-2xl font-black text-[10px] uppercase active:scale-95 transition-all">Cancel</button>
                <button onclick="en_translationEngine.saveEduEdit('${itemId}', '單字', ${idx})" 
                        class="flex-[2] py-3 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-blue-100 active:scale-95 transition-all">Solidify</button>
            </div>
        </div>
    `;

    // 🚀 4. 外殼噴發 (Card Shell)
    return `
        <div class="vocab-card bg-white rounded-[2.2rem] p-7 border border-slate-50 shadow-sm relative overflow-hidden group">
            ${displayHtml}
            ${editHtml}
        </div>
    `;
},

/** 📝 [EDU-Grammar] 渲染 CEFR 文法解析清單容器 (V2026.ULTRA) */
_renderEduGrammarList(grammars = [], page = 1, itemId) {
    console.log(`📡 [EN-Grammar-List] 執行文法磁區投影 | Count: ${grammars.length}`);

    if (grammars.length === 0) {
        return `
            <div class="py-20 text-center opacity-20 flex flex-col items-center animate-fade-in">
                <i class="fa-solid fa-scroll text-4xl mb-4"></i>
                <p class="text-[10px] font-black uppercase tracking-[0.2em]">Grammar Vault Empty</p>
            </div>
        `;
    }

    const ITEMS_PER_PAGE = 5;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const grammarCardsHtml = grammars.map((g, idx) => {
        const globalIdx = offset + idx;
        const level = (g.level || 'B1').toUpperCase();
        
        return `
            <div class="grammar-card bg-white rounded-[2.2rem] p-7 border border-slate-50 shadow-sm relative group overflow-hidden">
                
                <div id="display-content-${itemId}-${globalIdx}" class="space-y-5 animate-fade-in">
                    <div class="flex justify-between items-start">
                        <div class="space-y-1.5">
                            <div class="flex items-center gap-2">
                                <span class="text-[9px] px-2 py-0.5 bg-emerald-500 text-white rounded-md font-black tracking-tighter">${level}</span>
                                <h4 class="text-[1.1rem] font-black text-slate-800 tracking-tight">${g.point}</h4>
                            </div>
                            <p class="text-[13px] text-slate-500 font-medium leading-relaxed">${g.meaning}</p>
                        </div>
                        
                        <div class="flex gap-1">
                            <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${globalIdx})" 
                                    class="w-8 h-8 text-slate-200 hover:text-blue-500 transition-all">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button onclick="en_translationEngine.deleteEduItemWithShadow('${itemId}', '文法', ${globalIdx})" 
                                    class="w-8 h-8 text-slate-100 hover:text-rose-400 transition-all">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <div class="bg-emerald-50/30 rounded-2xl p-5 border border-emerald-100/50 space-y-2 group/ex">
                        <div class="flex items-start gap-3">
                            <button onclick="en_translationEngine.speakSegment(['${g.example.replace(/'/g, "\\'")}'])" 
                                    class="mt-1 w-6 h-6 shrink-0 bg-white text-emerald-400 rounded-full flex items-center justify-center shadow-sm active:scale-90 transition-all">
                                <i class="fa-solid fa-volume-high text-[9px]"></i>
                            </button>
                            <div class="flex-1">
                                <p class="text-[14px] font-bold text-slate-700 leading-snug">${g.example}</p>
                                <p class="text-[11px] text-slate-400 mt-1 font-medium">${g.trans || ''}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div id="edit-panel-${itemId}-${globalIdx}" class="hidden space-y-4 animate-slide-down">
                    <div class="flex items-center gap-2 px-1">
                        <span class="w-1 h-3 bg-emerald-400 rounded-full"></span>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refactoring Grammar Logic</span>
                    </div>
                    <textarea id="edit-input-${itemId}-${globalIdx}" 
                              class="w-full h-48 bg-slate-900 text-emerald-300 font-mono text-[11px] p-5 rounded-3xl border-none focus:ring-2 focus:ring-emerald-500/30 outline-none shadow-inner"
                    >${JSON.stringify(g, null, 2)}</textarea>
                    <div class="flex gap-2">
                        <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${globalIdx})" 
                                class="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                        <button onclick="en_translationEngine.saveEduEdit('${itemId}', '文法', ${globalIdx})" 
                                class="flex-[2] py-3 bg-emerald-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-emerald-100">Solidify</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="grammar-display-track space-y-5 animate-fade-in">
            ${grammarCardsHtml}
        </div>
    `;
},

/** ❓ [EDU-Quiz] 渲染 CEFR 交互式測驗清單容器 (V2026.ULTRA) */
_renderEduQuizList(quizzes = [], page = 1, itemId) {
    console.log(`📡 [EN-Quiz-List] 點火測驗路網 | Count: ${quizzes.length}`);

    if (quizzes.length === 0) {
        return `
            <div class="py-20 text-center opacity-20 flex flex-col items-center animate-fade-in">
                <i class="fa-solid fa-vial-circle-check text-4xl mb-4"></i>
                <p class="text-[10px] font-black uppercase tracking-[0.2em]">Quiz Vault Empty</p>
            </div>
        `;
    }

    const ITEMS_PER_PAGE = 5;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const quizCardsHtml = quizzes.map((q, idx) => {
        const globalIdx = offset + idx;
        const level = (q.level || 'B1').toUpperCase();
        
        return `
            <div class="quiz-card bg-white rounded-[2.2rem] p-7 border border-slate-50 shadow-sm relative group overflow-hidden mb-5">
                
                <div id="display-content-${itemId}-${globalIdx}" class="space-y-6 animate-fade-in">
                    <div class="flex justify-between items-start">
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] px-2 py-0.5 bg-amber-500 text-white rounded-md font-black tracking-tighter">${level}</span>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Knowledge Check</span>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${globalIdx})" 
                                    class="w-8 h-8 text-slate-200 hover:text-blue-500 transition-all">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button onclick="en_translationEngine.deleteEduItemWithShadow('${itemId}', '測驗', ${globalIdx})" 
                                    class="w-8 h-8 text-slate-100 hover:text-rose-400 transition-all">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <div class="question-zone">
                        <h4 class="text-[16px] font-bold text-slate-800 leading-relaxed">${q.question}</h4>
                    </div>

                    <div class="grid grid-cols-1 gap-2">
                        ${(q.options || []).map((opt, optIdx) => `
                            <button onclick="this.parentElement.querySelectorAll('button').forEach(b=>b.classList.remove('bg-blue-600','text-white','border-blue-600')); 
                                             this.classList.add('${opt === q.answer ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-rose-500 border-rose-500 text-white'}');
                                             this.closest('.quiz-card').querySelector('.analysis-zone').classList.remove('hidden');"
                                    class="w-full py-3.5 px-5 bg-slate-50 border border-slate-100 rounded-2xl text-left text-[13px] font-medium text-slate-600 hover:border-blue-200 transition-all active:scale-[0.98]">
                                <span class="inline-block w-5 h-5 bg-white border border-slate-200 rounded-full text-center leading-4 text-[10px] font-black text-slate-400 mr-2 group-hover:border-blue-400">
                                    ${String.fromCharCode(65 + optIdx)}
                                </span>
                                ${opt}
                            </button>
                        `).join('')}
                    </div>

                    <div class="analysis-zone hidden animate-slide-down bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50">
                        <h5 class="text-[11px] font-black text-blue-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <i class="fa-solid fa-lightbulb"></i> Artisan Analysis
                        </h5>
                        <p class="text-[12px] text-slate-600 leading-relaxed font-medium">
                            ${q.analysis}
                        </p>
                    </div>
                </div>

                <div id="edit-panel-${itemId}-${globalIdx}" class="hidden space-y-4 animate-slide-down">
                    <div class="flex items-center gap-2 px-1">
                        <span class="w-1 h-3 bg-amber-400 rounded-full"></span>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refactoring Quiz Fuel</span>
                    </div>
                    <textarea id="edit-input-${itemId}-${globalIdx}" 
                              class="w-full h-64 bg-slate-900 text-amber-300 font-mono text-[11px] p-5 rounded-3xl border-none focus:ring-2 focus:ring-amber-500/30 outline-none leading-relaxed shadow-inner"
                    >${JSON.stringify(q, null, 2)}</textarea>
                    <div class="flex gap-2">
                        <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${globalIdx})" 
                                class="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                        <button onclick="en_translationEngine.saveEduEdit('${itemId}', '測驗', ${globalIdx})" 
                                class="flex-[2] py-3 bg-amber-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-amber-100">Solidify</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="quiz-display-track space-y-2 animate-fade-in">
            ${quizCardsHtml}
        </div>
    `;
},

/** 🎧 [EDU-Listening] 渲染 A/B 劇場聽力清單容器 (V2026.ULTRA) */
_renderEduListeningList(listenings = [], page = 1, itemId) {
    console.log(`📡 [EN-Listening-List] 點火聽力劇場軌道 | Count: ${listenings.length}`);

    if (listenings.length === 0) {
        return `
            <div class="py-20 text-center opacity-20 flex flex-col items-center animate-fade-in">
                <i class="fa-solid fa-headset text-4xl mb-4"></i>
                <p class="text-[10px] font-black uppercase tracking-[0.2em]">Listening Vault Empty</p>
            </div>
        `;
    }

    const ITEMS_PER_PAGE = 5;
    const offset = (page - 1) * ITEMS_PER_PAGE;

    const listeningCardsHtml = listenings.map((l, idx) => {
        const globalIdx = offset + idx;
        const level = (l.level || 'B1').toUpperCase();
        
        return `
            <div class="listening-card bg-white rounded-[2.2rem] p-7 border border-slate-50 shadow-sm relative group overflow-hidden mb-5">
                
                <div id="display-content-${itemId}-${globalIdx}" class="space-y-6 animate-fade-in">
                    <div class="flex justify-between items-center">
                        <div class="flex items-center gap-2">
                            <span class="text-[9px] px-2 py-0.5 bg-purple-500 text-white rounded-md font-black tracking-tighter">${level}</span>
                            <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Acoustic Theatre</span>
                        </div>
                        <div class="flex gap-1">
                            <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${globalIdx})" 
                                    class="w-8 h-8 text-slate-200 hover:text-blue-500 transition-all">
                                <i class="fa-solid fa-pen-to-square text-xs"></i>
                            </button>
                            <button onclick="en_translationEngine.deleteEduItemWithShadow('${itemId}', '聽力', ${globalIdx})" 
                                    class="w-8 h-8 text-slate-100 hover:text-rose-400 transition-all">
                                <i class="fa-solid fa-trash-can text-xs"></i>
                            </button>
                        </div>
                    </div>

                    <div class="space-y-4 relative">
                        <div class="absolute left-3 top-0 bottom-0 w-0.5 bg-slate-100 rounded-full"></div>
                        
                        ${(l.dialogue || []).map((line, lIdx) => {
                            const isA = lIdx % 2 === 0;
                            const speakerColor = isA ? 'text-purple-600' : 'text-blue-600';
                            const bgColor = isA ? 'bg-purple-50/50' : 'bg-blue-50/50';

                            return `
                                <div class="relative pl-10 group/line">
                                    <button onclick="en_translationEngine.speakSegment(['${line.en.replace(/'/g, "\\'")}'])"
                                            class="absolute left-0 top-1 w-7 h-7 rounded-full bg-white border border-slate-100 shadow-sm flex items-center justify-center hover:bg-slate-900 hover:text-white transition-all active:scale-90 z-10">
                                        <i class="fa-solid fa-play text-[8px] ${isA ? 'ml-0.5' : ''}"></i>
                                    </button>
                                    <div class="${bgColor} p-4 rounded-2xl rounded-tl-none border border-slate-100/50">
                                        <p class="text-[11px] font-black ${speakerColor} uppercase tracking-tighter mb-1">
                                            ${isA ? 'Person A' : 'Person B'}
                                        </p>
                                        <p class="text-[14px] font-bold text-slate-800 leading-snug mb-1">${line.en}</p>
                                        <p class="text-[11px] text-slate-400 font-medium">${line.zh}</p>
                                    </div>
                                </div>
                            `;
                        }).join('')}
                    </div>

                    <button onclick="en_translationEngine.playFullDialogue('${itemId}', ${globalIdx})"
                            class="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-lg">
                        <i class="fa-solid fa-clapperboard"></i> Play Full Session
                    </button>
                </div>

                <div id="edit-panel-${itemId}-${globalIdx}" class="hidden space-y-4 animate-slide-down">
                    <div class="flex items-center gap-2 px-1">
                        <span class="w-1 h-3 bg-purple-400 rounded-full"></span>
                        <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Refactoring Acoustic Script</span>
                    </div>
                    <textarea id="edit-input-${itemId}-${globalIdx}" 
                              class="w-full h-80 bg-slate-900 text-purple-300 font-mono text-[11px] p-5 rounded-3xl border-none focus:ring-2 focus:ring-purple-500/30 outline-none leading-relaxed shadow-inner"
                    >${JSON.stringify(l, null, 2)}</textarea>
                    <div class="flex gap-2">
                        <button onclick="en_translationEngine.toggleEditMode('${itemId}', ${globalIdx})" 
                                class="flex-1 py-3 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase">Cancel</button>
                        <button onclick="en_translationEngine.saveEduEdit('${itemId}', '聽力', ${globalIdx})" 
                                class="flex-[2] py-3 bg-purple-500 text-white rounded-2xl font-black text-[10px] uppercase shadow-lg shadow-purple-100">Solidify</button>
                    </div>
                </div>
            </div>
        `;
    }).join('');

    return `
        <div class="listening-display-track space-y-2 animate-fade-in">
            ${listeningCardsHtml}
        </div>
    `;
},


/** 🛠️ [Internal-Editor] 渲染文章重構表單：英美語數據對焦版 (V2026.ULTRA) */
_renderArticleEditForm(record) {
    const { id, title, category, level = 'B1', segments = [] } = record;
    
    // 🚀 1. 磁區標籤採樣
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const availableCats = trip?.translateConfig?.categories || ['General', 'Study', 'Daily', 'Slang'];

    // 🚀 2. 構建重構外殼
    return `
        <div class="space-y-8 text-left animate-fade-in pb-10">
            <div class="space-y-4">
                <div class="flex items-center gap-2 px-1">
                    <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                    <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Package Metadata</h5>
                </div>
                
                <div class="grid grid-cols-1 gap-4">
                    <div class="relative">
                        <input type="text" id="edit-article-title" value="${title}" 
                            class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-bold text-sm focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
                            placeholder="Package Title (e.g., Starbucks Order)">
                    </div>
                    
                    <div class="flex gap-3">
                        <select id="edit-article-category" 
                                class="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-4 font-bold text-[12px] focus:ring-2 focus:ring-blue-100 outline-none appearance-none">
                            ${availableCats.map(cat => `<option value="${cat}" ${cat === category ? 'selected' : ''}># ${cat.toUpperCase()}</option>`).join('')}
                        </select>
                        
                        <select id="edit-article-level" 
                                class="flex-1 bg-slate-50 border-none rounded-2xl py-4 px-4 font-bold text-[12px] focus:ring-2 focus:ring-blue-100 outline-none appearance-none text-blue-600">
                            ${['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map(lvl => `<option value="${lvl}" ${lvl === level ? 'selected' : ''}>LEVEL ${lvl}</option>`).join('')}
                        </select>
                    </div>
                </div>
            </div>

            <div class="space-y-4">
                <div class="flex justify-between items-center px-1">
                    <div class="flex items-center gap-2">
                        <span class="w-1.5 h-1.5 rounded-full bg-blue-600"></span>
                        <h5 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Segment Tracks</h5>
                    </div>
                    <span class="text-[9px] font-black text-blue-500 bg-blue-50 px-2 py-1 rounded-md">
                        ${segments.length} TRACKS
                    </span>
                </div>

                <div id="edit-segments-list" class="space-y-4">
                    ${segments.map((s, idx) => this._renderSegmentEditBlock(idx, s[0], s[1])).join('')}
                    ${segments.length === 0 ? `<p id="empty-segment-notice" class="text-center py-10 text-[11px] text-slate-300 italic font-medium">No segments detected. Click "+" to start.</p>` : ''}
                </div>

                <button onclick="en_translationEngine.addEditSegment()" 
                        class="w-full py-4 rounded-3xl border-2 border-dashed border-slate-100 text-slate-300 hover:text-blue-500 hover:border-blue-200 hover:bg-blue-50/30 transition-all flex items-center justify-center gap-2 group">
                    <i class="fa-solid fa-plus-circle text-lg group-hover:scale-125 transition-transform"></i>
                    <span class="text-[10px] font-black uppercase tracking-widest">Append New Track</span>
                </button>
            </div>
            
            <input type="hidden" id="edit-article-id" value="${id}">
        </div>
    `;
},

/** 🧬 [Internal-Atom] 渲染單個 [EN/ZH] 段落編輯區塊 (V2026.ULTRA) */
_renderSegmentEditBlock(idx, q, a) {
    // 🚀 1. 物理索引校準 (1-based index for display)
    const displayIdx = idx + 1;

    return `
        <div class="segment-edit-block group relative p-5 bg-slate-50/50 rounded-[1.8rem] border border-slate-100 hover:border-blue-200 hover:bg-blue-50/20 transition-all animate-slide-up mb-4">
            
            <div class="flex justify-between items-center mb-3 px-1">
                <div class="flex items-center gap-2">
                    <span class="flex items-center justify-center w-5 h-5 bg-blue-600 text-white text-[9px] font-black rounded-full shadow-sm">
                        ${displayIdx}
                    </span>
                    <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        Data Track #${String(displayIdx).padStart(2, '0')}
                    </span>
                </div>
                
                <button onclick="this.closest('.segment-edit-block').remove()" 
                        class="w-7 h-7 flex items-center justify-center rounded-xl bg-white text-slate-300 hover:text-rose-500 hover:shadow-sm transition-all active:scale-90">
                    <i class="fa-solid fa-xmark text-xs"></i>
                </button>
            </div>

            <div class="space-y-1.5 mb-3">
                <label class="block text-[8px] font-black text-blue-400 uppercase tracking-tighter pl-1">English Source</label>
                <textarea class="edit-q-input w-full bg-white border-none rounded-xl py-3 px-4 font-bold text-[13px] text-slate-800 focus:ring-2 focus:ring-blue-100 outline-none transition-all resize-none leading-relaxed" 
                          placeholder="Type English sentence...">${q || ''}</textarea>
            </div>

            <div class="space-y-1.5">
                <label class="block text-[8px] font-black text-slate-300 uppercase tracking-tighter pl-1">Traditional Chinese</label>
                <textarea class="edit-a-input w-full bg-white border-none rounded-xl py-3 px-4 font-medium text-[13px] text-slate-500 focus:ring-2 focus:ring-slate-100 outline-none transition-all resize-none leading-relaxed" 
                          placeholder="對位的繁體中文翻譯...">${a || ''}</textarea>
            </div>
            
            <div class="absolute -right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none hidden md:block">
                <span class="bg-slate-800 text-white text-[8px] px-2 py-1 rounded shadow-lg whitespace-nowrap uppercase tracking-tighter">
                    Drag to Reorder (Coming soon)
                </span>
            </div>
        </div>
    `;
},

/** 🔍 [Internal-Focus] 渲染語義辨析對位項 (V2026.ULTRA) */
_renderComparisonItem(title, hint, anchorId) {
    // 🚀 1. 物理座標對位感應
    // 💡 職人診斷：若無 anchorId，則僅作為純資訊顯示；若有，則點亮導航屬性
    const hasLink = !!anchorId;

    return `
        <div class="comparison-item group flex items-center justify-between p-4 bg-slate-50/80 rounded-2xl border border-slate-100 hover:border-blue-200 hover:bg-white transition-all animate-fade-in mb-2">
            
            <div class="flex items-center gap-3 flex-1">
                <div class="w-8 h-8 rounded-xl bg-blue-100/50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                    <i class="fa-solid fa-code-compare text-[10px]"></i>
                </div>
                
                <div class="space-y-0.5">
                    <h5 class="text-[13px] font-black text-slate-800 tracking-tight">
                        ${title}
                    </h5>
                    <p class="text-[10px] text-slate-400 font-medium leading-relaxed italic">
                        ${hint}
                    </p>
                </div>
            </div>

            ${hasLink ? `
                <button onclick="en_translationEngine.jumpToComparison('${anchorId}')" 
                        class="w-8 h-8 flex items-center justify-center rounded-full bg-white text-slate-300 hover:text-blue-600 hover:shadow-sm active:scale-90 transition-all">
                    <i class="fa-solid fa-arrow-right-long text-[10px]"></i>
                </button>
            ` : `
                <div class="w-2 h-2 rounded-full bg-slate-200"></div>
            `}
        </div>
    `;
}


};

window.en_viewEngine = en_viewEngine;