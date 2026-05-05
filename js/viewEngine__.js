/**
 * 🎨 VIEW ENGINE (渲染引擎 - ESM 版)
 * 核心版本：V2026.ULTRA.FLUID
 * 物理作用：數據燃料介面化 (UI Rendering)
 * 核心協定：圓角卡片語彙 / 物理對焦 (scrollIntoView) / 數據洗滌 (Sanitization)
 * 視覺依賴：CSS Variables (--theme-primary, --theme-shadow)
 * --------------------------------------------------
 * [Module Role]
 * - 負責全系統 HTML String 生成與 DOM 注入
 * - 執行高品質 JSON 燃料 (Itinerary/Transport) 的語義解析
 * - 處理複雜的物理對焦 (Focus) 與局部熱更新 (Segment Switch)
 */

import { CONFIG } from './config.js'; // 🚀 確保導入配置
import { expenseManager } from './expenseManager.js';

/**
 * 🎨 VIEW ENGINE (渲染引擎 - ESM 版)
 */
export const viewEngine = {

// ============================================================
// 1. [Main Layouts] 全域分區與框架渲染
// 負責：主清單、詳情頁框架、導航底欄
// ============================================================


/**
     * 渲染行程清單視圖 (V2026.ULTRA 物理回收強化版)
     */
    renderTripList(container, trips) {
        // 🚀 核心焊接：為每一張行程卡片加入「物理回收」軌道
        const tripsHtml = trips.map(trip => `
            <div class="relative group mb-4">
                <button onclick="event.stopPropagation(); App.confirmDeleteTrip('${trip.id}')" 
                        class="absolute -top-1.5 -right-1.5 w-7 h-7 bg-rose-500 text-white rounded-full shadow-lg 
                               opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center
                               hover:scale-110 active:scale-95 border-2 border-white cursor-pointer">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <div onclick="App.navigateTo('detail', '${trip.id}')" 
                     class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all animate-fade-in group/card">
                    <div class="flex justify-between items-center">
                        <div class="min-w-0 flex-1">
                            <h3 class="text-lg font-black text-slate-800 truncate pr-4">${trip.name}</h3>
                            <div class="flex items-center gap-3 mt-1.5">
                                <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    ${trip.days ? trip.days.length : 0} Days
                                </p>
                                <div class="w-1 h-1 rounded-full bg-slate-200"></div>
                                <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    ${trip.companions || 1} Persons
                                </p>
                            </div>
                        </div>
                        <div class="text-slate-200 group-hover/card:theme-text-pink transition-colors transform group-hover/card:translate-x-1 duration-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="animate-fade-in px-1">
                <div class="flex justify-between items-center mb-8 px-2">
                    <div>
                        <h2 class="text-2xl font-black tracking-tighter text-slate-800">我的旅行</h2>
                        <p class="text-[10px] font-black theme-text-pink uppercase tracking-[0.2em] mt-0.5">Fleet Management</p>
                    </div>
                    <button onclick="App.toggleModal('add-trip-modal')" 
                            class="w-12 h-12 theme-bg text-white rounded-2xl shadow-lg shadow-pink-100 flex items-center justify-center active:scale-90 transition-all cursor-pointer">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </button>
                </div>
                <div id="trip-list-track" class="space-y-1">
                    ${tripsHtml || `
                        <div class="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                            <div class="text-4xl mb-4 opacity-20">🗺️</div>
                            <p class="text-slate-300 font-black text-[11px] uppercase tracking-widest">目前無任何行程軌道</p>
                            <p class="text-slate-400 text-[10px] mt-1 italic font-medium">點擊上方 ＋ 開始整備航線</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },


/** 詳情頁導播：修正初始掛載與航班對焦邏輯 */
renderTripDetail(container, trip) {
    if (!trip) return;

    // 1. 先鋪設靜態框架 (Static Framework)
    // 注意：#transport-section 內部先留空，不要在字串拼接時呼叫 render
    container.innerHTML = `
        <div class="animate-fade-in space-y-5">
            <div id="overview-section">${this.renderOverviewCard(trip)}</div>

            <div class="grid grid-cols-2 gap-4">
                <div id="transport-section"></div>
                <div id="hotel-section"></div>
            </div>

            <div class="pt-2">
                <h3 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-2 mb-3">Daily Roadmap</h3>
                <div id="day-tabs-container" class="flex gap-2 overflow-x-auto pb-2 no-scrollbar"></div>
            </div>

            <div id="day-content-area" class="animate-fade-in"></div>
        </div>
    `;

    // 2. 框架掛載後，進行動態數據對焦 (Dynamic Binding)
    // 預設對焦 D1 (focusDay = 1)
    
    // 🏨 住宿衛星卡渲染
    this.renderHotelCard(document.getElementById('hotel-section'), trip, 1);
    
    // ✈️ 航班衛星卡渲染 (修正點：傳入正確容器與天數)
    this.renderTransportCard(document.getElementById('transport-section'), trip, 1);
    
    // 📅 行程與分頁渲染
    this.renderDayTabs(document.getElementById('day-tabs-container'), trip, 0);
    this.renderDayDetailContent(document.getElementById('day-content-area'), trip, 0);
},

/** 🎨 視圖演進：職人級滑動底欄 (V2026.ULTRA 大字流體版) */
renderBottomDock(container, activeView) {
    if (!container) return;

    // 🚀 1. 導航路網配置 (維持 11 鈕英雄位)
    const allNavs = [
        { id: 'detail',     label: '📍 行程' }, 
        { id: 'expense',    label: '💰 開銷' },
        { id: 'checklist',  label: '🎒 清單' }, 
        { id: 'realtime',   label: '🎙️ 即時' },
        { id: 'training',   label: '🔥 特訓' }, 
        { id: 'contextual', label: '📖 情境' },
        { id: 'shopping',   label: '🛒 購物' }, 
        { id: 'emergency',  label: '🆘 緊急' }, 
        { id: 'backlog',    label: '🏭 靈感' },
        { id: 'backup',     label: '☁️ 備份' }, 
        { id: 'settings',   label: '⚙️ 設定' }
    ];

    // 💡 職人參數校準：
    // 將 btnWidth 從 100 提升至 115，為大字級預留物理空間
    const btnWidth = 115; 

    container.innerHTML = `
        <div class="fixed bottom-0 inset-x-0 z-[101] pointer-events-none flex flex-col h-28">
            <div class="h-10 bg-gradient-to-t from-white to-transparent"></div>
            <div class="flex-grow bg-white"></div>
        </div>

        <nav id="bottom-dock" 
             class="fixed bottom-8 inset-x-0 z-[5000] px-4 animate-slide-up flex justify-center items-center gap-2">
            
            <button onclick="document.getElementById('nav-scroll-track').scrollBy({left: -200, behavior: 'smooth'})"
                    class="w-11 h-11 shrink-0 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center text-slate-400 active:scale-90 transition-all pointer-events-auto">
                <span class="font-black text-lg">‹</span>
            </button>

            <div id="nav-scroll-track" 
                 style="background-color: #ffffff; box-shadow: 0 -15px 50px -10px var(--theme-shadow); scroll-behavior: smooth;"
                 class="w-full max-w-lg border border-slate-100 rounded-[2.8rem] p-2.5 flex overflow-x-auto no-scrollbar pointer-events-auto touch-pan-x">
                
                <div id="nav-carrier" class="flex flex-nowrap items-center gap-1.5 w-max px-2">
                    ${allNavs.map(item => {
                        const isActive = activeView === item.id || (item.id === 'contextual' && activeView === 'translate');
                        const isHero = item.id === 'training';
                        const heroClass = isHero && !isActive ? 'animate-pulse' : '';

                        return `
                        <div class="shrink-0" style="width: ${btnWidth}px;">
                            <button id="nav-btn-${item.id}"
                                    onclick="App.navigateTo('${item.id}')" 
                                    class="w-full h-14 flex items-center justify-center rounded-[2rem] transition-all duration-300 active:scale-95 ${heroClass}
                                    ${isActive ? 'theme-bg text-white shadow-xl scale-[1.05]' : 'bg-transparent text-slate-500 font-black hover:bg-slate-50'}">
                                <span class="text-[14px] font-black tracking-tight whitespace-nowrap">${item.label}</span>
                            </button>
                        </div>`;
                    }).join('')}
                </div>
            </div>

            <button onclick="document.getElementById('nav-scroll-track').scrollBy({left: 200, behavior: 'smooth'})"
                    class="w-11 h-11 shrink-0 bg-white border border-slate-100 rounded-full shadow-lg flex items-center justify-center text-slate-400 active:scale-90 transition-all pointer-events-auto">
                <span class="font-black text-lg">›</span>
            </button>
        </nav>
    `;

    this.focusNavBtn(activeView);
},


/** 🧬 物理補償：底欄標籤置中對焦 (11 鈕廣域對焦版) */
focusNavBtn(activeView) {
    // 🚀 關鍵對焦：針對 'translate' 視圖進行語義重導向，確保 ID 對位
    const viewId = (activeView === 'translate') ? 'contextual' : activeView;

    requestAnimationFrame(() => {
        const activeBtn = document.getElementById(`nav-btn-${viewId}`);
        const track = document.getElementById('nav-scroll-track');
        
        if (!activeBtn || !track) return;

        // 🚀 1. 座標採集：獲取 carrierCell 的絕對物理座標
        const carrierCell = activeBtn.parentElement;
        const trackWidth = track.clientWidth;
        const btnOffset = carrierCell.offsetLeft;
        const btnWidth = carrierCell.offsetWidth;

        // 🚀 2. 邊際補償計算 (Boundary Stabilization)
        // 💡 職人診斷：計算目標位置，並使用 Math.max 封殺負數位移，防止首站抖動
        let scrollTarget = btnOffset - (trackWidth / 2) + (btnWidth / 2);
        
        // 確保捲動目標不會小於 0 (首部對焦)
        scrollTarget = Math.max(0, scrollTarget);
        
        // 確保捲動目標不會超過最大可捲動寬度 (尾部對焦)
        const maxScroll = track.scrollWidth - trackWidth;
        scrollTarget = Math.min(scrollTarget, maxScroll);

        // 🚀 3. 執行物理導通
        track.scrollTo({
            left: scrollTarget,
            behavior: 'smooth'
        });
        
        console.log(`🧭 [UI-Focus] 導航對焦軌道: ${viewId} | Target: ${Math.round(scrollTarget)}px`);
    });
},


/** 🧬 [V2026.ULTRA] 行程編輯表單核心 - 雙模對焦物理加固版 */
_renderScheduleFormHTML(item) {
    const currentStyle = (item.style || 'default').toLowerCase().trim();
    // 🚀 狀態感應：預設啟動視覺編修模式
    const editMode = localStorage.getItem('tf_editor_mode') || 'visual';
    
    return `
        <div class="space-y-4 text-left animate-fade-in pb-4">
            <div class="p-5 bg-slate-50 rounded-[2.5rem] space-y-5 border border-slate-100/50 shadow-inner">
                
                <!-- 🚀 1. 模式撥盤：切換 視覺編修 / 原始燃料 (焊接點) -->
                <div class="flex p-1 bg-slate-200/50 rounded-2xl">
                    <button onclick="App.switchEditorMode('visual')" id="btn-mode-visual"
                            class="flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${editMode === 'visual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}">
                        🎨 視覺編修
                    </button>
                    <button onclick="App.switchEditorMode('code')" id="btn-mode-code"
                            class="flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${editMode === 'code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}">
                        💻 原始燃料
                    </button>
                </div>

                <!-- 🚀 2. 排程風格設定 (保留原功能) -->
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">排程風格設定</label>
                    <select id="sched-style" onchange="App.syncStyleUI(this.value)" 
                            class="w-full bg-white border-none rounded-2xl p-4 font-black text-sm shadow-sm outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all cursor-pointer">
                        <option value="default" ${currentStyle === 'default' ? 'selected' : ''}>1. 預設型式</option>
                        <option value="json" ${currentStyle === 'json' ? 'selected' : ''}>2. JSON 景點燃料 (AI)</option>
                        <option value="transport" ${currentStyle === 'transport' ? 'selected' : ''}>3. 交通小卡 (AI)</option>
                        <option value="image" ${currentStyle === 'image' ? 'selected' : ''}>4. 圖片 Memo</option>
                        <option value="import" ${currentStyle === 'import' ? 'selected' : ''}>5. 🔌 注入外部燃料</option>
                        <option value="shopping" ${currentStyle === 'shopping' ? 'selected' : ''}>6. 購物清單 (AI Fuel)</option>
                    </select>
                </div>

                <!-- 🚀 3. 動態零件區域 (重新導入：負責時間、標題、圖片上傳、購物參數等) -->
                <div id="dynamic-sector-container">
                    ${this._getSectorByStyle(currentStyle, item)}
                </div>

                <!-- 🚀 4. WYSIWYG 實境編修 Slot (視覺模式下顯示) -->
                <div id="visual-editor-container" class="${editMode === 'visual' ? 'block' : 'hidden'} animate-fade-in border-t border-slate-100 pt-5">
                    <label class="text-[10px] font-black theme-text-pink uppercase tracking-widest px-1 block mb-3">WYSIWYG 實境預覽與編修</label>
                    <div class="bg-white rounded-[2rem] p-2 ring-1 ring-slate-100 shadow-sm overflow-hidden">
                        <div id="visual-render-slot" class="scale-[0.98] origin-top">
                            ${this._renderVisualEditorContent(item)}
                        </div>
                    </div>
                    <p class="text-[9px] text-slate-400 font-bold mt-3 px-1 italic">※ 提示：視覺模式支援點擊文字直接修正，內容將自動焊接至燃料核心</p>
                </div>

                <!-- 🚀 5. 數據燃料核心 (原始碼模式下顯示) -->
                <div id="code-editor-container" class="${editMode === 'code' ? 'block' : 'hidden'} space-y-2 border-t border-slate-100 pt-4 animate-fade-in">
                    <div class="flex justify-between items-center px-1">
                        <label id="memo-label" class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">數據燃料核心 (JSON)</label>
                        <div id="ai-btn-container"></div>
                    </div>
                    <textarea id="sched-memo" oninput="App.syncVisualFromCode(); App.syncShoppingEditor();"
                        class="w-full bg-white border-none rounded-2xl p-4 font-mono text-[11px] h-64 shadow-sm outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all custom-scrollbar" 
                        placeholder="請貼上由 AI Protocol 生成的高品質燃料 JSON...">${item.memo || ''}</textarea>
                    
                    <!-- 隱藏圖像路徑連動 -->
                    <input type="hidden" id="sched-image-data" value="${item.imageUrl || ''}">
                </div>
            </div>
        </div>`;
},


/** 🧬 [Visual-Engine] 視覺化編修內容生成器 (V2026.ULTRA 全主權導通版) */
_renderVisualEditorContent(item) {
    const style = (item.style || 'default').toLowerCase().trim();
    let html = "";
    
    if (style === 'transport') {
        html = this.renderTransportFuel(item.memo || "{}", "editor-preview");
    } else if (style === 'json' || (item.memo && (item.memo.trim().startsWith('{') || item.memo.trim().startsWith('[')))) {
        html = this.renderItineraryFuel(item.memo || "{}");
    } else {
        html = `<div class="p-6 text-slate-500 font-bold text-sm">${item.memo || '點擊下方原始燃料開始編修...'}</div>`;
    }

    // 🚀 核心協定：執行「標籤物理級導通」
    // 💡 職人邏輯：將所有具備顯示意義的文字節點全部開放 contenteditable。
    // 數據安全性由 App.syncCodeFromVisual() 內部的內容識別機制處理。
    
    return html
        // A軌道：導通段落與標題 (包含標題、內容、移動方案)
        .replace(/<(p|h4)([^>]*class="[^"]*"[^>]*)>/g, 
                 '<$1 contenteditable="true" onblur="window.App.syncCodeFromVisual()" $2>')
        
        // B軌道：導通數值節點 (核心修正：確保 09:45 與 1000 所屬的 span 獲取主權)
        // 💡 診斷：針對 tabular-nums 或 theme-text-pink 標籤強制注入編輯權
        .replace(/<span ([^>]*class="[^"]*(?:tabular-nums|theme-text-pink|font-black)[^"]*"[^>]*)>/g, 
                 '<span contenteditable="true" onblur="window.App.syncCodeFromVisual()" $1>');
},


/** 🧬 [Sector-Router] 根據風格派發專屬 HTML 零件 */
_getSectorByStyle(style, item) {
    switch(style) {
        case 'json':      return this._renderJsonSector(item);
        case 'transport': return this._renderTransportSector(item);
        case 'image':     return this._renderImageSector(item);
        case 'shopping':  return this._renderShoppingSector(item);
        case 'import':    return this._renderImportSector(item);
        default:          return this._renderDefaultSector(item);
    }
},

/** 📍 零件 1：基礎數據零件 (V2026.ULTRA 全維度對焦加固版) */
_renderDefaultSector(item) {
    // 🚀 1. 物理脫敏：封殺 null/undefined
    const fuel = item || {};
    
    // 🚀 2. 屬性預洗：強迫轉換為字串，確保 Input Value 安全導通
    const safeTime = String(fuel.time || "");
    const safeLocation = String(fuel.location || "");
    const safeExpense = String(fuel.expense || "");

    return `
        <div class="space-y-4" id="basic-data-sector">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">節點時間</label>
                    <!-- 🚀 核心加固：改用 window.App 強制全域對焦 -->
                    <input type="time" id="sched-time" value="${safeTime}" 
                           oninput="window.App.syncFuelFromTopParts()"
                           class="w-full bg-white rounded-2xl p-4 font-black text-sm shadow-sm border-none outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all tabular-nums">
                </div>
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">預估費用 (JPY)</label>
                    <input type="text" id="sched-cost" value="${safeExpense}" placeholder="例如：1500" 
                           oninput="window.App.syncFuelFromTopParts()"
                           class="w-full bg-white rounded-2xl p-4 font-black text-sm shadow-sm border-none outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all theme-text-pink">
                </div>
            </div>
            <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">地點標題</label>
                <input type="text" id="sched-location" value="${safeLocation}" placeholder="地點或活動名稱" 
                       oninput="window.App.syncFuelFromTopParts()"
                       class="w-full bg-white rounded-2xl p-4 font-black text-sm shadow-sm border-none outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all">
            </div>
        </div>`;
},

/** 🧠 零件 2：行程 JSON 模式 (數據自癒版) */
_renderJsonSector(item) {
    // 🚀 核心防禦：確保傳入下游零件的燃料永遠不是 null
    const fuel = item || {};
    
    return `
        ${this._renderDefaultSector(fuel)}
        
        <div id="route-config-sector" class="mt-4 animate-fade-in"></div>
    `;
},

/** 🚄 零件 3：交通小卡模式 (數據自癒版) */
_renderTransportSector(item) {
    // 🚀 核心防禦：封殺 null，確保燃料在傳遞過程中保持實體狀態
    const fuel = item || {};
    
    return `
        ${this._renderDefaultSector(fuel)}
        
        <div id="route-config-sector" class="mt-4 animate-fade-in"></div>
    `;
},

/** 📸 零件 4：圖片上傳與預覽 (數據自癒版) */
_renderImageSector(item) {
    // 🚀 1. 物理脫敏：封殺 null，確保 item 永遠是一個實體
    const fuel = item || {};
    
    // 🚀 2. 屬性預洗：強迫轉換為字串，徹底封殺 TypeError 讀取風險
    const safeImageUrl = String(fuel.imageUrl || "");

    return `
        ${this._renderDefaultSector(fuel)}
        
        <div id="image-upload-sector" class="mt-4 space-y-4 animate-fade-in">
            <label class="text-[10px] font-black theme-text-pink uppercase tracking-widest px-1 block">Image Asset Storage</label>
            <div class="flex gap-2">
                <input type="text" id="node-image-url" value="${safeImageUrl}" 
                       placeholder="貼上圖片 URL 或點擊右側上傳..."
                       class="flex-1 bg-white rounded-xl p-4 text-[11px] font-bold outline-none ring-1 ring-slate-100 focus:ring-pink-100 theme-text-pink">
                
                <button onclick="App.triggerImageUpload()" 
                        class="shrink-0 w-14 h-14 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-xl active:scale-90 transition-all cursor-pointer">📁</button>
            </div>
            
            <input type="file" id="hidden-file-input" class="hidden" accept="image/*" onchange="App.handleImageUpload(this)">

            <div id="image-preview-box" class="w-full aspect-video rounded-[2rem] bg-white border-2 border-dashed border-slate-100 overflow-hidden flex items-center justify-center relative">
                ${safeImageUrl ? 
                    `<img src="${safeImageUrl}" class="w-full h-full object-cover">` : 
                    '<span class="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">File Preview Pending</span>'
                }
            </div>
        </div>`;
},


/** 🔌 零件 5：萬用燃料注入區 (數據自癒版) */
_renderImportSector(item) {
    // 🚀 1. 物理脫敏：封殺 null，確保入口燃料實體化
    const fuel = item || {};
    
    // 🚀 2. 屬性預洗：強行轉換為字串，確保隱藏欄位的數據對焦安全
    const safeTime = String(fuel.time || "");
    const safeLocation = String(fuel.location || "");

    return `
        <div class="bg-pink-50/50 rounded-[2.5rem] p-8 border border-pink-100 text-center space-y-4 animate-pulse my-4">
            <div class="text-3xl">🔌</div>
            <div>
                <p class="text-[11px] font-black theme-text-pink uppercase tracking-widest">Data Injection Gateway</p>
                <p class="text-[10px] text-slate-400 font-medium mt-1">系統正在感應剪貼簿，請貼上高品質燃料包</p>
            </div>
            <div class="pt-2">
                <button onclick="App.syncStyleUI('import')" 
                        class="theme-bg text-white px-8 py-3 rounded-full text-[10px] font-black shadow-lg shadow-pink-100 active:scale-95 transition-all">
                    手動點火注入
                </button>
            </div>
        </div>

        <div class="hidden" id="basic-location-sector">
            <input type="time" id="sched-time" value="${safeTime}">
            <input type="text" id="sched-location" value="${safeLocation}">
        </div>
        <div id="route-config-sector" class="hidden"></div>`;
},


/** 🛍️ 零件 6：購物清單發動機 (數據自癒版) */
_renderShoppingSector(item) {
    // 🚀 1. 物理脫敏：封殺 null，確保進入子零件前燃料已對焦
    const fuel = item || {};

    return `
        <div id="shopping-config-sector" class="space-y-3 mb-5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">AI 採購參數</label>
            <div class="grid grid-cols-2 gap-3">
                <input type="text" id="shop-city" placeholder="城市 (如：京都)" 
                       class="bg-white rounded-2xl p-4 font-bold text-sm shadow-sm outline-none ring-1 ring-slate-50 focus:ring-pink-100 transition-all">
                <input type="text" id="shop-item" placeholder="品項 (如：蝦餅)" 
                       class="bg-white rounded-2xl p-4 font-bold text-sm shadow-sm outline-none ring-1 ring-slate-50 focus:ring-pink-100 transition-all">
            </div>
        </div>

        ${this._renderDefaultSector(fuel)}

        <div id="visual-shopping-editor" class="mt-5 space-y-2 border-t border-slate-100 pt-5">
            <label class="text-[10px] font-black theme-text-pink uppercase tracking-widest px-1 block mb-2">視覺化清單管理</label>
            <div id="shopping-list-container" class="space-y-2 min-h-[40px]">
                </div>
        </div>`;
},


// ============================================================
// 2. [Checklist Module] 攜帶清單系統視圖
// 負責：標籤導航、物品卡片、分類過濾
// ============================================================


/** 🎨 視圖演進：清單模組 (動態標籤與物理置中版) */
renderChecklist(container, items = [], activeCategory = '全部') {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    
    // 🚀 數據對焦：優先提取自訂標籤，若無則降級為預設職人組
    const customCats = trip.checklistConfig?.categories || ['證件', '財務', '交通', '電器', '通訊', '個人'];
    const categories = ['全部', ...customCats];
    
    container.innerHTML = `
        <div class="checklist-module animate-fade-in space-y-6 pb-32">
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-xl font-black text-slate-800 tracking-tight">check list</h2>
                    <p class="text-[10px] font-black theme-text-pink uppercase tracking-widest mt-1">${activeCategory} SECTOR</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="App.shareChecklist()" class="bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95">
                        <span class="text-xs">🔗</span> <span class="text-[10px] font-bold">分享</span>
                    </button>
                    <button onclick="App.openImportModal()" class="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95">
                        <span class="text-xs">🗄️</span> <span class="text-[10px] font-bold text-green-700">匯入</span>
                    </button>
                    <button onclick="App.promptEditChecklistCategories()" class="bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95">
                        <span class="text-xs">⚙️</span> <span class="text-[10px] font-bold">標籤</span>
                    </button>
                </div>
            </div>

            <div id="checklist-tabs" class="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x">
                ${categories.map(cat => `
                    <div class="snap-center">
                        <button id="tab-${cat}" onclick="App.filterChecklist('${cat}')" 
                                class="px-5 py-2 rounded-xl text-[11px] font-black border transition-all whitespace-nowrap
                                ${activeCategory === cat ? 'theme-bg text-white border-transparent shadow-lg' : 'bg-white text-slate-400 border-slate-100'}">
                            ${cat}
                        </button>
                    </div>
                `).join('')}
            </div>

            <div class="bg-white rounded-[2.5rem] border border-slate-50 p-6 shadow-sm min-h-[400px]">
                <div id="checklist-items" class="space-y-1">
                    ${this.renderChecklistItems(items, activeCategory)}
                </div>
                <button onclick="App.addNewChecklistItem()" class="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 text-xs font-black hover:border-pink-100 hover:text-pink-300">
                    + 新增裝備零件
                </button>
            </div>
        </div>
    `;

    // 🚀 物理對焦：點火後自動置中 Tabs
    this.focusChecklistTab(activeCategory);
},

/** ⚙️ 系統設定發動機 (主控調度 - V2026.ULTRA 物理對焦修正版) */
renderSettings(container, activeTab = 'visual') {
    // 🚀 1. 物理磁區回溯
    const settings = {
        theme: localStorage.getItem('tf_theme_key') || 'rose-pink',
        voiceId: localStorage.getItem('tf_voice_id') || 'ja-JP-Neural2-B',
        audioRate: localStorage.getItem('tf_audio_rate') || '0.9',
        textScale: localStorage.getItem('tf_text_scale') || '100',
        uiScale: localStorage.getItem('tf_ui_scale') || '100', 
    };

    // 🚀 2. 構建雙軌導航組件 (直接對位參數 activeTab)
    const tabs = [
        { id: 'visual', icon: '🎨', label: '視覺' },
        { id: 'acoustic', icon: '🎙️', label: '聲學' }
    ];

    const tabsHTML = tabs.map(tab => {
        // 💡 關鍵修正：直接比對傳入的參數，不依賴外層物件快照
        const isHit = (tab.id === activeTab);
        
        return `
            <button onclick="App.navigateTo('settings', null, '${tab.id}')"
                    class="flex-1 py-4 flex flex-col items-center gap-1 transition-all duration-300 ${isHit ? 'opacity-100' : 'opacity-30'}">
                <span class="text-lg">${tab.icon}</span>
                <span class="text-[10px] font-black uppercase tracking-widest ${isHit ? 'theme-text-pink' : 'text-slate-400'}">${tab.label}</span>
                ${isHit ? '<div class="w-1.5 h-1.5 rounded-full theme-bg mt-0.5 animate-pulse shadow-[0_0_8px_var(--theme-primary)]"></div>' : '<div class="h-2"></div>'}
            </button>
        `;
    }).join('');

    // 🚀 3. 內容分流渲染
    // 💡 關鍵修正：使用當前活躍標籤決定內容
    let contentHTML = (activeTab === 'visual') 
        ? this._renderVisualTab(settings) 
        : this._renderAcousticTab(settings);

    container.innerHTML = `
        <div class="settings-module animate-fade-in space-y-6 pb-32">
            <div class="bg-white/90 backdrop-blur-xl sticky top-0 z-[100] px-4 py-2 flex border-b border-slate-50 shadow-sm">
                ${tabsHTML}
            </div>

            <div class="px-4 space-y-6">
                ${contentHTML}
                ${this._renderSystemStatus()}
            </div>
        </div>
    `;
},


/** 🎙️ 任務分區：聲學對焦 (V2026.ULTRA 長句補償版) */
_renderAcousticTab(s) {
    return `
        <div class="animate-slide-up space-y-6">
            ${this._renderAcousticSwitcher()}
            ${this._renderVoiceSection(s.voiceId)}
            ${this._renderAudioVelocitySection(s.audioRate)}

            ${this._renderLongPhraseOffsetSection()}

            ${this._renderAcousticDiagnosticModule()}
        </div>
    `;
},

/** 🛰️ 子組件：聲學物理診斷中樞 (Debug Valve Control) */
_renderAcousticDiagnosticModule() {
    const isDebugActive = localStorage.getItem('TF_DEBUG') === 'true';
    
    return `
        <div class="mt-4 pt-6 border-t border-slate-100 animate-fade-in">
            <div class="bg-slate-800 rounded-[2.2rem] p-6 shadow-xl shadow-slate-200">
                <div class="flex items-center justify-between mb-4 px-1">
                    <div class="min-w-0">
                        <h4 class="text-xs font-black text-white tracking-tight">系統聲學物理診斷</h4>
                        <p class="text-[8px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-0.5">Acoustic Logic Debugger</p>
                    </div>
                    <button onclick="App.toggleAcousticDebug()" 
                            class="shrink-0 px-5 py-2.5 rounded-xl text-[10px] font-black transition-all active:scale-95 shadow-sm
                            ${isDebugActive ? 'bg-rose-500 text-white animate-pulse' : 'bg-white text-slate-800'}">
                        ${isDebugActive ? '🔴 停止監控' : '🟢 啟動剖析'}
                    </button>
                </div>
                
                <div class="bg-black/20 rounded-2xl p-4 border border-white/5">
                    <p class="text-[10px] text-slate-300 leading-relaxed font-medium">
                        ${isDebugActive 
                            ? '🛰️ <span class="text-emerald-400 font-black">總線攔截中</span>：時序熱圖與語調輪廓已導通至 F12 Console。' 
                            : '啟動後將掛載攔截器至 TTS 總線，偵測起音、緩落與標點 Glitch。'}
                    </p>
                </div>
                
                <div class="mt-4 flex items-center justify-between px-1">
                    <div class="flex items-center gap-2">
                        <div class="w-1.5 h-1.5 rounded-full ${isDebugActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}"></div>
                        <span class="text-[8px] font-black text-slate-500 uppercase tracking-widest">
                            Layer: ${isDebugActive ? 'Intercepting' : 'Standby'}
                        </span>
                    </div>
                    <span class="text-[7px] font-bold text-slate-600 uppercase tabular-nums">V5.0.ULTRA_DEBUG</span>
                </div>
            </div>
        </div>
    `;
},

/** 🔘 子組件：聲學語系切換撥盤 (Acoustic Switcher) */
_renderAcousticSwitcher() {
    const settingLang = localStorage.getItem('tf_setting_voice_lang') || 'JP';
    const isEN = settingLang === 'EN';

    return `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-sm space-y-4">
            <div class="px-1">
                <h3 class="font-black text-slate-800 text-[1rem]">聲學測試語系</h3>
                <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Sample Language Focus</p>
            </div>
            <div class="bg-slate-100/80 p-1 rounded-2xl flex items-center border border-slate-200/40 shadow-inner">
                <button onclick="App.setSettingVoiceLang('JP')" 
                        class="flex-1 py-3 rounded-xl text-[10px] font-black transition-all duration-300 ${!isEN ? 'bg-white shadow-md theme-text-pink' : 'text-slate-400'}">
                    🇯🇵 JAPANESE
                </button>
                <button onclick="App.setSettingVoiceLang('EN')" 
                        class="flex-1 py-3 rounded-xl text-[10px] font-black transition-all duration-300 ${isEN ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}">
                    🇺🇸 ENGLISH
                </button>
            </div>
        </div>
    `;
},

/** 🎨 任務分區：視覺個人化 (V2026.ULTRA 校準版) */
_renderVisualTab(s) {
    return `
        <div class="animate-slide-up space-y-6">
            ${this._renderThemeSection(s.theme)}
            
            ${this._renderVisualFocusSection(s.textScale, s.uiScale)}
        </div>
    `;
},


/** 🎨 子發動機：色彩配色區 (V2026.ULTRA 視覺導通版) */
_renderThemeSection(currentTheme) {
    const THEMES = {
        'land-green': { hex: '#4ade80', name: '大地綠' },
        'sky-blue':   { hex: '#38bdf8', name: '天空藍' },
        'lavender':   { hex: '#a78bfa', name: '薰衣紫' },
        'rose-pink':  { hex: '#fb7185', name: '玫瑰粉' },
        'sunset-orange': { hex: '#fb923c', name: '夕陽橙' },
        'moon-gray':  { hex: '#64748b', name: '月夜灰' }
    };

    const themeHTML = Object.entries(THEMES).map(([key, theme]) => {
        const isActive = (key === currentTheme);
        // 🚀 物理特徵：選中時點亮陰影並放大，未選中時維持低干擾
        const activeStyles = isActive 
            ? `border: 3px solid #1e293b; transform: scale(1.15); box-shadow: 0 10px 15px -3px ${theme.hex}44;` 
            : `border: 1px solid #f1f5f9; transform: scale(1);`;

        return `
            <div class="flex flex-col items-center gap-2 shrink-0">
                <div onclick="App.changeTheme('${key}')" 
                     class="theme-dot w-10 h-10 rounded-full cursor-pointer transition-all duration-300 ease-out" 
                     style="background-color: ${theme.hex}; ${activeStyles}">
                </div>
                <span class="text-[0.6rem] font-black ${isActive ? 'text-slate-800' : 'text-slate-400'} uppercase tracking-tighter transition-colors">
                    ${theme.name}
                </span>
            </div>
        `;
    }).join('');

    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-6">
            <div class="px-1">
                <h3 class="font-black text-slate-800 text-[1rem]">職人系統配色</h3>
                <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Color Schema Protocol</p>
            </div>
            <div class="flex items-center gap-5 overflow-x-auto no-scrollbar py-2 px-1">
                ${themeHTML}
            </div>
        </div>
    `;
},


/** 🎙️ 系統聲學發動機 (V2026.ULTRA 模組化導通版) */
_renderVoiceSection(currentVoiceId) {
    const settingLang = localStorage.getItem('tf_setting_voice_lang') || 'JP';
    const isEN = (settingLang === 'EN');
    
    // 🚀 1. 任務分切：渲染主容器，並掛載子組件
    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-8 animate-fade-in">
            ${this._renderVoicePicker(currentVoiceId, isEN)}
            ${this._renderAcousticControls(isEN)}
        </div>
    `;
},

/** 🧩 子模組 A：聲線選取器 (Voice Picker) */
_renderVoicePicker(currentVoiceId, isEN) {
    const JP_VOICES = [
        { id: 'ja-JP-Neural2-B', name: '🇯🇵 職人女聲 (Neural2-B)' },
        { id: 'ja-JP-Neural2-C', name: '🇯🇵 穩重男聲 (Neural2-C)' },
        { id: 'ja-JP-Neural2-D', name: '🇯🇵 親切男聲 (Neural2-D)' },
        { id: 'ja-JP-Wavenet-A', name: '🇯🇵 清爽女聲 (Wavenet-A)' }
    ];

    const EN_VOICES = [
        { id: 'en-US-Neural2-F', name: '🇺🇸 教學女聲 (Neural2-F)' },
        { id: 'en-US-Neural2-A', name: '🇺🇸 專業男聲 (Neural2-A)' },
        { id: 'en-US-Wavenet-C', name: '🇺🇸 溫柔女聲 (Wavenet-C)' },
        { id: 'en-US-Studio-O', name: '🇺🇸 錄音室男聲 (Studio-O)' }
    ];

    const ACTIVE_OPTIONS = isEN ? EN_VOICES : JP_VOICES;
    
    // 自動糾偏：若 ID 不符則對位至首項
    let finalId = ACTIVE_OPTIONS.some(v => v.id === currentVoiceId) 
        ? currentVoiceId 
        : ACTIVE_OPTIONS[0].id;

    const optionsHTML = ACTIVE_OPTIONS.map(v => `
        <option value="${v.id}" ${v.id === finalId ? 'selected' : ''}>${v.name}</option>
    `).join('');

    return `
        <div class="space-y-4">
            <div>
                <h3 class="font-black text-slate-800 text-[1rem]">AI 語音模型選擇</h3>
                <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">
                    ${isEN ? 'American English' : 'Japanese'} Identity Protocol
                </p>
            </div>
            <div class="relative">
                <select onchange="App.changeVoice(this.value)" 
                        class="w-full bg-slate-50 border-none rounded-2xl px-4 py-4 text-[0.85rem] font-bold text-slate-600 focus:ring-2 ${isEN ? 'focus:ring-blue-100' : 'focus:ring-pink-100'} appearance-none shadow-inner transition-all cursor-pointer">
                    ${optionsHTML}
                </select>
                <div class="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-30 text-xs">▼</div>
            </div>
        </div>
    `;
},

/** 🧩 子模組 B：聲學參數組件 (Acoustic Controls - V2026.ULTRA 手動控制版) */
_renderAcousticControls(isEN) {
    const pitch = localStorage.getItem('tf_audio_pitch') || '0';
    const rate = localStorage.getItem('tf_audio_rate') || '1.0';
    const accentColor = isEN ? '#3b82f6' : 'var(--theme-primary)';
    const textColor = isEN ? 'text-blue-500' : 'theme-text-pink';

    // 1. 參數配置 (移除 onchange 自動觸發)
    const configs = [
        { 
            label: '語速校準', sub: 'Speaking Rate', id: 'audio-rate-display', 
            val: rate, min: 0.5, max: 2.0, step: 0.1, unit: 'x', 
            handler: 'App.changeAudioRate' 
        },
        { 
            label: '音頻補償', sub: 'Vocal Pitch Offset', id: 'audio-pitch-display', 
            val: pitch, min: -4.0, max: 4.0, step: 0.5, unit: '', 
            handler: 'App.changeAudioPitch' 
        }
    ];

    const controlsHTML = configs.map(cfg => `
        <div class="space-y-6 pt-6 border-t border-slate-50 first:border-t-0 first:pt-0">
            <div class="flex justify-between items-center px-1">
                <div>
                    <h3 class="font-black text-slate-800 text-[1rem]">${cfg.label}</h3>
                    <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">${cfg.sub}</p>
                </div>
                <span id="${cfg.id}" class="${textColor} font-black text-[1.1rem]">${cfg.val}${cfg.unit}</span>
            </div>
            <div class="relative py-2">
                <input type="range" min="${cfg.min}" max="${cfg.max}" step="${cfg.step}" value="${cfg.val}" 
                    oninput="${cfg.handler}(this.value)"
                    style="accent-color: ${accentColor};"
                    class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer">
            </div>
        </div>
    `).join('');

    // 🚀 2. 導入手動控制鍵 (播放/停止)
    return `
        <div class="space-y-8">
            <div class="space-y-6">
                ${controlsHTML}
            </div>

<div class="flex gap-3 pt-2">
                <button onclick="App.playCurrentSample()" 
                    class="flex-[2] flex items-center justify-center gap-2 py-4 rounded-2xl theme-bg text-white font-black text-sm hover:opacity-90 active:scale-95 transition-all shadow-lg shadow-pink-100">
                    <span class="text-xs">▶️</span> 試聽樣本
                </button>
                <button onclick="App.stopAllSpeech()" 
                    class="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 active:scale-95 transition-all border border-slate-200">
                    <span class="text-xs">⏹️</span> 停止
                </button>
            </div>

            <p class="text-[0.65rem] text-slate-300 px-1 leading-relaxed italic text-center">
                職人提示：調整參數後點擊「試聽樣本」以驗證最新聽感。
            </p>
        </div>
    `;
},


/** 📢 子發動機：朗讀語速調整區 (V2026.ULTRA 聲學導通版) */
_renderAudioVelocitySection(currentRate) {
    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-6 animate-slide-up">
            <div class="flex justify-between items-center px-1">
                <div>
                    <h3 class="font-black text-slate-800 text-[1rem]">AI 朗讀語速</h3>
                    <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Audio Velocity Protocol</p>
                </div>
                <span id="audio-rate-display" class="theme-text-pink font-black text-[1.1rem]">${currentRate}x</span>
            </div>
            
            <div class="relative py-2">
                <input type="range" min="0.5" max="1.5" step="0.1" value="${currentRate}" 
                    oninput="App.changeAudioRate(this.value)"
                    style="accent-color: var(--theme-primary);"
                    class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer transition-all">
            </div>

            <div class="flex justify-between text-[10px] font-black text-slate-300 px-1 uppercase tracking-tighter">
                <span>Slow / 0.5x</span>
                <span>Normal</span>
                <span>Fast / 1.5x</span>
            </div>
        </div>
    `;
},

/** 🐌 子組件：長句呼吸補償 (Long-Phrase Offset) */
_renderLongPhraseOffsetSection() {
    const offset = parseInt(localStorage.getItem('tf_long_phrase_offset') || '-6'); // 預設減速 6%
    
    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-6 animate-slide-up">
            <div class="flex justify-between items-center px-1">
                <div>
                    <h3 class="font-black text-slate-800 text-[1rem]">長句呼吸補償</h3>
                    <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Long-Phrase Speed Offset</p>
                </div>
                <span id="long-phrase-offset-display" class="text-blue-500 font-black text-[1.1rem]">
                    ${offset > 0 ? '+' : ''}${offset}%
                </span>
            </div>
            
            <div class="relative py-2">
                <input type="range" min="-15" max="5" step="1" value="${offset}" 
                    oninput="App.changeLongPhraseOffset(this.value)"
                    style="accent-color: #3b82f6;"
                    class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer transition-all">
            </div>

            <div class="flex justify-between text-[9px] font-black text-slate-300 px-1 uppercase tracking-tighter">
                <span>極慢 / -15%</span>
                <span>預設</span>
                <span>輕快 / +5%</span>
            </div>
            
            <p class="text-[0.65rem] text-slate-300 px-1 leading-relaxed italic">
                職人提示：此參數僅針對超過 20 字的長難句區段生效，模擬人類解釋複雜邏輯時的緩步節奏。
            </p>
        </div>
    `;
},

/** 👓 子發動機：視認性全方位對焦 (V2026.ULTRA 佈局加固版) */
_renderVisualFocusSection(textScale, uiScale) {
    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-8 animate-slide-up">
            <div class="space-y-6">
                <div class="flex justify-between items-center px-1">
                    <div>
                        <h3 class="font-black text-slate-800 text-[1rem]">文字視認性對焦</h3>
                        <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Font Focus Protocol</p>
                    </div>
                    <span id="text-scale-display" class="theme-text-pink font-black text-[1.1rem]">${textScale}%</span>
                </div>
                <div class="relative py-2">
                    <input type="range" min="90" max="140" value="${textScale}" 
                        oninput="App.changeTextSize(this.value)"
                        style="accent-color: var(--theme-primary);"
                        class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer">
                </div>
            </div>

            <div class="space-y-6 pt-2 border-t border-slate-50">
                <div class="flex justify-between items-center px-1">
                    <div>
                        <h3 class="font-black text-slate-800 text-[1rem]">介面佈局校準</h3>
                        <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">UI Canvas Scale</p>
                    </div>
                    <span id="ui-scale-display" class="theme-text-pink font-black text-[1.1rem]">${uiScale}%</span>
                </div>
                <div class="relative py-2">
                    <input type="range" min="85" max="115" value="${uiScale}" 
                        oninput="App.changeUISize(this.value)"
                        style="accent-color: var(--theme-primary);"
                        class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer">
                </div>
            </div>
            
            <p class="text-[0.65rem] text-slate-300 px-1 leading-relaxed">
                提示：調整 Canvas 縮放可優化單手操作範圍，適合不同尺寸移動設備。
            </p>
        </div>
    `;
},


/** 🛰️ 子組件：系統狀態頁底 */
_renderSystemStatus() {
    return `
        <div class="p-5 bg-slate-50/50 rounded-[1.5rem] flex justify-between items-center border border-slate-50">
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span class="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest italic">Core Rendering: Stable</span>
            </div>
            <span class="text-[0.6rem] font-bold text-slate-300">V2026.ULTRA.FINAL</span>
        </div>
    `;
},

/** 🧪 渲染數據指紋診斷器 */
renderFingerprintInspector(healthData) {
    const format = (ts) => ts > 0 ? new Date(ts).toLocaleString('zh-TW', { 
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    }) : '---';

    return `
        <div class="fingerprint-inspector bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4 animate-fade-in">
            <div class="flex justify-between items-center px-1">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">數據指紋診斷器</h4>
                <span class="text-[9px] font-black ${healthData.status.color} px-2 py-0.5 bg-white rounded-full border border-slate-100 shadow-sm">
                    ${healthData.status.icon} ${healthData.status.label}
                </span>
            </div>

            <div class="grid grid-cols-2 gap-4 relative">
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-slate-200">⇌</div>
                
                <div class="space-y-1">
                    <p class="text-[8px] font-black text-slate-400 text-center uppercase">本地指紋</p>
                    <p class="text-xs font-mono font-black text-slate-600 text-center">${format(healthData.localTs)}</p>
                </div>
                <div class="space-y-1 border-l border-slate-200/50">
                    <p class="text-[8px] font-black text-slate-400 text-center uppercase">雲端指紋</p>
                    <p class="text-xs font-mono font-black text-slate-600 text-center">${format(healthData.cloudTs)}</p>
                </div>
            </div>

            <div class="pt-2 border-t border-slate-200/50">
                <p class="text-[9px] text-slate-400 text-center font-bold">
                    💡 狀態提示：${healthData.status.hint}
                </p>
            </div>
        </div>
    `;
},


/** 🚀 物理對焦：分類標籤置中捲動 */
focusChecklistTab(cat) {
    requestAnimationFrame(() => {
        const tab = document.getElementById(`tab-${cat}`);
        if (tab) {
            tab.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    });
},


/** 🎨 子組件：渲染單個物品卡片 (補強編輯入口) */
renderChecklistItems(items, categoryFilter) {
    // 1. 執行數據過濾
    const filtered = categoryFilter === '全部' 
        ? items 
        : items.filter(i => i.category === categoryFilter);

    if (filtered.length === 0) return `<div class="py-20 text-center text-slate-300 text-xs font-bold italic">CATEGORY EMPTY</div>`;
    
    return filtered.map((item, index) => {
        // 🚀 關鍵：在原始 items 中尋找真正的索引以供編輯使用
        const realIndex = items.findIndex(i => i.id === item.id);
        
        return `
        <div class="flex items-center gap-4 py-4 group hover:bg-slate-50/50 rounded-2xl px-2 transition-all">
            <div onclick="App.toggleCheckItem('${item.id}')" 
                 class="w-10 h-10 shrink-0 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all
                 ${item.done ? 'theme-bg border-transparent' : 'border-slate-100 hover:border-pink-200'}">
                ${item.done ? '<span class="text-white">✓</span>' : ''}
            </div>
            
            <div class="flex-grow cursor-pointer" onclick="App.addNewChecklistItem(${realIndex})">
                <p class="text-sm font-bold ${item.done ? 'text-slate-300 line-through' : 'text-slate-700'}">${item.task}</p>
                <span class="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black" 
                      style="background-color: ${item.tagColor}20; color: ${item.tagColor}">
                    ${item.category}
                </span>
            </div>
            
            <div class="opacity-0 group-hover:opacity-100 text-[10px] text-slate-300">⚙️</div>
        </div>
        <div class="h-[1px] bg-slate-50 w-full last:hidden"></div>
    `}).join('');
},


// ============================================================
// 3. [Satellite Components] 衛星縮圖組件
// 負責：概覽小卡、航班縮圖、飯店摘要
// ============================================================


/** 🛰️ 獨立組件：行程總覽 (V2026.ULTRA 物理回收 - 強制顯現版) */
renderOverviewCard(trip) {
    if (!trip) return '';

    const locationText = trip.city || '未設定地點';
    const dayCount = trip.days?.length || 0;
    const peopleCount = trip.companions || 1;

    return `
        <div class="px-2 py-4 animate-fade-in flex justify-between items-end border-b border-slate-100 mb-2">
            
            <div class="space-y-1.5">
                <h2 class="text-3xl font-black tracking-tighter text-slate-800 leading-none">
                    ${locationText}
                </h2>
                <div class="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>🗓️ ${dayCount} Days</span>
                    <span>👥 ${peopleCount} Persons</span>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <button onclick="App.promptEditOverview('${trip.id}')" 
                        class="p-3 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                    </svg>
                </button>

                <button onclick="App.confirmDeleteTrip('${trip.id}')" 
                        class="p-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-all active:scale-90"
                        title="回收此行程">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
},

/** ✈️ 衛星組件 A：航班縮圖卡 (雙向路網導通版) */
renderTransportCard(container, trip, focusDay = 1) {
    if (!container) return;

    // 1. 深度洗滌：確保數據路網存在
    if (!trip) {
        container.innerHTML = "";
        return;
    }

    // 2. 數據對焦：從全域 transport 陣列中濾出本日 (focusDay) 航班
    const allFlights = Array.isArray(trip.transport) ? trip.transport : [];
    const todaysFlights = allFlights.filter(f => Number(f.day) === Number(focusDay));

    // 3. 實體導通：始終顯示卡片作為編輯入口
    container.classList.remove('hidden');

    // 4. 數據解構：取得本日第一筆航班 (f)
    const f = todaysFlights.length > 0 ? todaysFlights[0] : null;

    // 🚀 5. 渲染：將 UI 升級為雙向對位結構
    container.innerHTML = `
        <div onclick="App.promptEditTransport('${trip.id}')" 
             class="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm cursor-pointer hover:border-pink-100 transition-all active:scale-95 h-full animate-fade-in group">
            
            <div class="flex justify-between items-center mb-3">
                <div class="flex items-center gap-2">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest">航班路網</span>
                    <span class="text-[9px] theme-text-pink font-black bg-pink-50 px-2 py-0.5 rounded-full italic uppercase">D${focusDay}</span>
                </div>
                <span class="text-xs group-hover:rotate-12 transition-transform">✈️</span>
            </div>

            <div class="space-y-2">
                ${f ? `
                    <div class="flex justify-between items-center">
                        <div class="text-left space-y-0.5">
                            <p class="text-[10px] font-black text-slate-700 leading-tight">${f.depPort || '--'}</p>
                            <p class="text-[9px] theme-text-pink font-black tabular-nums">${f.depTime || '--:--'}</p>
                            <p class="text-[7px] text-slate-300 font-bold uppercase tracking-tighter">DEP</p>
                        </div>
                        
                        <div class="flex flex-col items-center px-1 opacity-20">
                            <span class="text-[10px] font-black">→</span>
                        </div>

                        <div class="text-right space-y-0.5">
                            <p class="text-[10px] font-black text-slate-700 leading-tight">${f.arrPort || '--'}</p>
                            <p class="text-[9px] theme-text-pink font-black tabular-nums">${f.arrTime || '--:--'}</p>
                            <p class="text-[7px] text-slate-300 font-bold uppercase tracking-tighter">ARR</p>
                        </div>
                    </div>
                ` : `
                    <div class="flex justify-between items-center py-1">
                        <div class="text-left">
                            <p class="text-[10px] font-bold text-slate-200 italic">未設定</p>
                            <p class="text-[8px] text-slate-100 font-black uppercase tracking-tighter">No Flight</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[10px] text-slate-200 font-black">--:--</p>
                            <p class="text-[8px] text-slate-100 font-bold uppercase tracking-tighter">Day Transit</p>
                        </div>
                    </div>
                `}
            </div>
        </div>`;
},



/** 🏨 衛星組件：下榻住宿 (V2.ULTRA 資訊掛載版) */
renderHotelCard(container, trip, focusDay = 1) {
    // 🛡️ 物理層防禦
    if (!container) return;

    // 🛡️ 數據層防禦
    if (!trip || !trip.id) {
        container.innerHTML = `<div class="p-5 text-slate-300 text-[10px] italic">數據對焦中...</div>`;
        return;
    }

    try {
        const hotels = trip.hotels || [];
        const todaysHotels = hotels.filter(h => h.days && h.days.includes(focusDay));

        container.innerHTML = `
            <div onclick="App.promptEditHotelByTripId('${trip.id}')" 
                 class="bg-white p-5 rounded-[2rem] border border-slate-50 shadow-sm cursor-pointer hover:border-pink-100 transition-all h-full animate-fade-in group">
                
                <div class="flex justify-between items-center mb-4">
                    <div class="flex items-center gap-2">
                        <span class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">下榻住宿</span>
                        <span class="text-[9px] theme-text-pink font-black bg-pink-50 px-2.5 py-1 rounded-full italic">D${focusDay}</span>
                    </div>
                    <span class="text-xs group-hover:rotate-12 transition-transform">🏨</span>
                </div>
                
                <div class="space-y-4">
                    ${todaysHotels.length > 0 ? todaysHotels.map(h => `
                        <div class="pb-3 border-b border-slate-50 last:border-b-0 last:pb-0">
                            <h5 class="text-sm font-black text-slate-800 mb-1.5 truncate">${h.name}</h5>
                            
                            <div class="space-y-1">
                                ${h.address ? `
                                    <div class="flex items-start gap-1.5 text-slate-400">
                                        <span class="text-[10px] mt-0.5">📍</span>
                                        <p class="text-[10px] leading-relaxed font-medium line-clamp-2">${h.address}</p>
                                    </div>
                                ` : ''}
                                
                                ${h.phone ? `
                                    <div class="flex items-center gap-1.5 text-slate-400">
                                        <span class="text-[10px]">📞</span>
                                        <p class="text-[10px] leading-relaxed font-medium">${h.phone}</p>
                                    </div>
                                ` : ''}
                            </div>
                        </div>
                    `).join('') : `
                        <div class="py-4 text-center">
                            <p class="text-[10px] text-slate-300 italic font-black uppercase tracking-tighter">本日未設定住宿</p>
                        </div>
                    `}
                </div>
            </div>`;
    } catch (err) {
        console.error("❌ [ViewEngine-Collapse] 旅館卡渲染失敗:", err);
        container.innerHTML = `<div class="p-5 text-red-300 text-[10px]">渲染異常</div>`;
    }
},


/** 🛫 編輯班機與核心參數 */
    promptEditOverview(tripId) {
        const trip = state.trips.find(t => t.id === tripId);
        if (!trip) return;

        const content = `
            <div class="space-y-6 max-h-[60vh] overflow-y-auto px-1 no-scrollbar text-left">
                <div class="grid grid-cols-2 gap-3">
                    <div class="col-span-2">
                        <label class="text-[10px] font-black text-slate-400 uppercase">目的地區域</label>
                        <input type="text" id="edit-city" value="${trip.city || ''}" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm">
                    </div>
                </div>
                
                <div class="bg-slate-50/50 p-4 rounded-[2rem] space-y-3">
                    <p class="text-[9px] font-black theme-text-pink uppercase tracking-widest">去程航班 Departure</p>
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" id="flight-dep-port" placeholder="機場/班機號" value="${trip.transport?.departure?.airport || ''}" class="bg-white rounded-xl p-3 text-xs font-bold border-none">
                        <input type="time" id="flight-dep-time" value="${trip.transport?.departure?.time || ''}" class="bg-white rounded-xl p-3 text-xs font-bold border-none">
                    </div>
                </div>

                <div class="bg-slate-50/50 p-4 rounded-[2rem] space-y-3">
                    <p class="text-[9px] font-black theme-text-pink uppercase tracking-widest">回程航班 Return</p>
                    <div class="grid grid-cols-2 gap-2">
                        <input type="text" id="flight-ret-port" placeholder="機場/班機號" value="${trip.transport?.return?.airport || ''}" class="bg-white rounded-xl p-3 text-xs font-bold border-none">
                        <input type="time" id="flight-ret-time" value="${trip.transport?.return?.time || ''}" class="bg-white rounded-xl p-3 text-xs font-bold border-none">
                    </div>
                </div>
            </div>`;
            
        const actions = `
            <button onclick="App.modalRemove('edit-overview-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消</button>
            <button onclick="App.saveTransportData('${tripId}')" class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg">更新數據</button>`;
        
        this.modalCreate('edit-overview-modal', '🔧 航網數據設定', content, actions);
    },

    // 3. 行程框組件 (D1...Dn 獨立生成器)
    renderDayTrack(container, trip) {
        if (!container || !trip.days) return;

        // 循環生成與行程概覽風格一致的圓角框
        const html = trip.days.map((day, index) => `
            <div onclick="App.navigateToDayDetail('${trip.id}', ${index})" 
                 class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition-all animate-fade-in"
                 style="animation-delay: ${index * 0.05}s">
                
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 theme-bg/10 rounded-xl flex items-center justify-center text-pink-500 font-black text-xs">
                        D${day.dayNum}
                    </div>
                    
                    <div>
                        <h4 class="font-black text-slate-800 text-sm">Day ${day.dayNum}</h4>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            ${day.city && day.city.length > 0 ? day.city.join(' · ') : 'Route Pending'}
                        </p>
                    </div>
                </div>

                <div class="text-slate-200 font-black text-xs">
                    <span class="mr-2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">View Details</span>
                    <span>→</span>
                </div>
            </div>
        `).join('');

        // 物理注入
        container.innerHTML = html || `
            <div class="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <p class="text-xs text-slate-300 font-black uppercase tracking-widest">No days defined in itinerary.</p>
            </div>
        `;
    },



// ============================================================
// 4. [Roadmap & Schedule] 行程規劃與路網
// 負責：每日分頁、節點卡片、Timeline 生成
// ============================================================


/** 🎨 視圖演進：Day Tabs (物理置中對焦版) */
renderDayTabs(container, trip, activeIndex) {
    if (!container || !trip.days) return;

    container.innerHTML = trip.days.map((day, index) => {
        const isActive = index === activeIndex;
        return `
            <div class="snap-center shrink-0 px-1">
                <button id="day-tab-${index}" 
                        onclick="App.switchDay('${trip.id}', ${index})" 
                        class="px-6 py-3 rounded-2xl font-black text-xs transition-all duration-300 ${
                            isActive 
                            ? 'theme-bg text-white shadow-lg shadow-pink-100 scale-105' 
                            : 'bg-white text-slate-400 border border-slate-50 hover:border-pink-100'
                        }">
                    DAY ${day.dayNum}
                </button>
            </div>
        `;
    }).join('');
},


// - renderDayTrack(cont, trip)         : 扁平化行程框生成器


/** 🏗️ 重構：詳細規劃區渲染 (V2026.ULTRA 數據鏈強制導通版) */
renderDayDetailContent(container, trip, dayIndex) {
    if (!container || !trip || !trip.days) return;
    
    const dayData = trip.days[dayIndex];
    if (!dayData) return;
    
    const schedules = dayData.schedules || [];

    // 🚀 視覺對焦：提升容器間距 (space-y-4) 以支撐高品質小卡佈局
    container.innerHTML = `
        <div class="schedule-section animate-fade-in pb-32">
            <div class="flex justify-between items-center px-4 mb-6">
                <div class="flex items-center gap-3">
                    <span class="theme-text-pink font-black italic text-sm">D${dayIndex + 1}</span>
                    <h2 class="text-xl font-black text-slate-800 tracking-tighter">Day ${dayIndex + 1} 路線規劃</h2>
                </div>
                <button onclick="App.promptAddSchedule('${trip.id}', ${dayIndex})" 
                        class="bg-white px-5 py-2.5 rounded-full shadow-sm border border-slate-100 theme-text-pink font-black text-[10px] uppercase tracking-widest hover:scale-105 active:scale-95 transition-all cursor-pointer">
                    + 新增景點
                </button>
            </div>

            <div id="schedule-list-container" class="space-y-6">
                ${schedules.length > 0 
                    ? schedules.map((item, idx) => {
                        // 🚀 數據洗滌協定 (Data Sanitization Protocol)
                        // 強制歸一化 style 欄位，確保 renderScheduleItem 能夠精確觸發 transport/json 軌道
                        const purifiedItem = {
                            ...item,
                            style: (item.style && typeof item.style === 'string') 
                                ? item.style.toLowerCase().trim() 
                                : 'default'
                        };
                        return this.renderScheduleItem(trip.id, dayIndex, purifiedItem, idx);
                    }).join('')
                    : `<div class="py-24 bg-white/50 rounded-[3rem] border-2 border-dashed border-slate-100 text-center mx-2 animate-fade-in">
                         <div class="text-3xl mb-3 opacity-20">🗺️</div>
                         <p class="text-slate-300 font-black text-[10px] uppercase tracking-[0.2em] mb-1">Route Pending</p>
                         <p class="text-slate-400 text-[9px] font-medium">尚未部署任何行程節點</p>
                       </div>`
                }
            </div>
        </div>`;
        
    console.log(`📡 [View-Trace] Day ${dayIndex + 1} 詳細規劃區導通成功，節點數: ${schedules.length}`);
},



/** 📍 景點/購物路網組件：顯示層 (V2026.ULTRA 全量對焦版) */
renderScheduleItem(tripId, dayIndex, item, itemIndex) {
    const engine = this; 
    let detailContent = "";
    
    // 🚀 1. 物理 ID 焊接與風格預洗
    const nodeId = `tf-node-${dayIndex}-${itemIndex}`;
    const currentStyle = (item.style || 'default').toLowerCase().trim();
    const hasJsonFuel = item.memo && (item.memo.trim().startsWith('{') || item.memo.trim().startsWith('['));

    // 🚀 2. 多態渲染發動機分流
    if (currentStyle === 'json') {
        detailContent = engine.renderItineraryFuel(item.memo);
    } else if (currentStyle === 'transport') {
        detailContent = engine.renderTransportFuel(item.memo, nodeId);
    } else if (currentStyle === 'image') {
        detailContent = `
            <div class="mt-3 space-y-3 animate-fade-in">
                ${item.memo ? `<p class="text-[11px] text-slate-500 font-medium px-1 leading-relaxed">${item.memo}</p>` : ''}
                ${item.imageUrl ? `<div class="relative rounded-[1.8rem] overflow-hidden border border-slate-100 shadow-sm"><img src="${item.imageUrl}" class="w-full max-h-80 object-cover"></div>` : ''}
            </div>`;
    } 
    // 🚀 核心補強：購物軌道分流
    else if (currentStyle === 'shopping') {
        detailContent = engine._renderShoppingFuelCards(item, dayIndex, itemIndex);
    } 
    else {
        detailContent = hasJsonFuel ? engine.renderItineraryFuel(item.memo) : `<p class="text-xs text-slate-500 font-medium leading-relaxed mt-2.5 pl-1 pr-12">${item.memo || '未填寫行程備註'}</p>`;
    }

    // 🚀 3. 物理結構渲染 (封裝購物標籤與標題)
    const isShopping = currentStyle === 'shopping';

    return `
        <div id="${nodeId}" class="schedule-card group bg-white rounded-[2.8rem] p-7 shadow-sm border border-slate-50 hover:border-[var(--theme-primary)] transition-all duration-300 animate-fade-in mb-6 relative overflow-hidden">
            <div class="flex justify-between items-start">
                <div class="space-y-4 flex-1">
                    <div class="flex items-center gap-3.5 min-h-[32px]">
                        <div class="flex items-center gap-2">
                            <span class="text-[10px] font-black theme-text-pink tabular-nums bg-pink-50 px-3 py-1.5 rounded-full italic shadow-sm flex-none">
                                ${item.time || '--:--'}
                            </span>
                            ${isShopping ? `<span class="text-[9px] font-black bg-slate-800 text-white px-2 py-1 rounded-md uppercase tracking-widest">Shopping</span>` : ''}
                        </div>
                        
                        <h4 class="text-base font-black text-slate-800 tracking-tight leading-tight">
                            ${item.location || item.task || (isShopping ? '購物清單' : '新節點')}
                        </h4>
                    </div>
                    
                    <div class="content-body w-full">
                        ${detailContent}
                    </div>
                </div>

                <div class="absolute top-7 right-7 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    <button onclick="App.copyNodeJsonToClipboard('${tripId}', ${dayIndex}, ${itemIndex})" 
                            class="w-8 h-8 flex items-center justify-center bg-emerald-50 text-emerald-600 rounded-xl hover:bg-emerald-500 hover:text-white transition-all active:scale-90"
                            title="複製燃料 JSON">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                            <path d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
                        </svg>
                    </button>

                    <button onclick="App.promptEditSchedule('${tripId}', ${dayIndex}, ${itemIndex})" 
                            class="w-8 h-8 flex items-center justify-center bg-slate-50 text-slate-300 rounded-xl hover:theme-bg hover:text-white transition-all active:scale-90">
                        <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
                            <path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
                        </svg>
                    </button>
                </div>
            </div>
        </div>`;
},

// ============================================================
// 💰 [Expense & Statistics] 開銷與統計視圖
// ============================================================

/** 📊 視圖演進：開銷統計頁面 (V2026.ULTRA 幣別對焦切換版) */
renderExpenseStats(container, trip, chartData, stats) {
    if (!container || !trip) return;

    // 🚀 1. 物理路徑計算：生成 SVG 長餅圖 (維持原有的高品質動畫)
    const segments = chartData.map(d => `
        <circle class="origin-center transition-all duration-1000 ease-out"
                r="15.915" cx="16.915" cy="16.915" fill="none" 
                stroke="${d.color}" stroke-width="3"
                stroke-dasharray="${d.percentage} ${100 - d.percentage}"
                transform="rotate(${d.offset * 3.6 - 90})"
                style="transform-origin: center;">
        </circle>
    `).join('');

    // 🚀 2. 數據解構：提取對焦狀態 (預設 TWD)
    const focus = state.expenseFocus || 'TWD';
    const totalTWD = stats.totalTWD || 0;
    const totalJPY = stats.grandTotal || 0;

    container.innerHTML = `
        <div class="space-y-8 animate-fade-in pb-32">
            <div class="flex justify-between items-end px-2">
                <div>
                    <h2 class="text-xl font-black text-slate-800 tracking-tight"></h2>
                    <p class="text-[10px] font-black theme-text-pink uppercase tracking-widest mt-1">Detailed Analytics Ledger</p>
                </div>
                
                <div class="flex bg-slate-100 p-1 rounded-full border border-slate-200 shadow-inner scale-90">
                    <button onclick="App.switchCurrencyFocus('TWD')" 
                            class="px-4 py-1.5 rounded-full text-[9px] font-black transition-all duration-300 ${focus === 'TWD' ? 'theme-bg text-white shadow-sm' : 'text-slate-400'}">TWD</button>
                    <button onclick="App.switchCurrencyFocus('JPY')" 
                            class="px-4 py-1.5 rounded-full text-[9px] font-black transition-all duration-300 ${focus === 'JPY' ? 'theme-bg text-white shadow-sm' : 'text-slate-400'}">JPY</button>
                </div>
            </div>

            <div class="bg-white rounded-[2.5rem] p-10 shadow-sm border border-slate-50 flex flex-col items-center gap-12">
                <div class="relative w-56 h-56 shrink-0">
                    <svg viewBox="0 0 33.83 33.83" class="w-full h-full drop-shadow-sm">
                        <circle stroke="#f8f9fa" stroke-width="3" fill="none" r="15.915" cx="16.915" cy="16.915"></circle>
                        ${segments}
                    </svg>
                    
                    <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <span class="text-[9px] font-black text-slate-300 uppercase tracking-tighter italic">Total ${focus}</span>
                        <div class="flex flex-col items-center -space-y-1">
                            <span class="text-3xl font-black text-slate-800 tabular-nums animate-fade-in">
                                ${focus === 'TWD' ? `$${Math.round(totalTWD).toLocaleString()}` : `¥${Math.round(totalJPY).toLocaleString()}`}
                            </span>
                            <span class="text-[11px] font-black theme-text-pink tabular-nums opacity-60">
                                ${focus === 'TWD' ? `¥${Math.round(totalJPY).toLocaleString()}` : `$${Math.round(totalTWD).toLocaleString()}`}
                            </span>
                        </div>
                        <p class="text-[8px] font-bold text-slate-400 mt-2 uppercase tracking-[0.2em] border-t border-slate-100 pt-1">Primary Sector</p>
                    </div>
                </div>
                
                <div class="w-full space-y-4">
                    ${chartData.map(d => this._renderExpenseCategory(trip, d)).join('')}
                </div>
            </div>

            <div class="p-6 bg-slate-50/50 rounded-[2rem] border border-slate-100">
                <p class="text-[10px] text-slate-400 font-medium leading-relaxed italic text-center">
                    * 點擊右上方切換器可變更幣別。
                </p>
            </div>
        </div>
    `;
},

/** 🧬 子函數 A：渲染分類折疊組件 (V2026.ULTRA 分組總額修正版) */
_renderExpenseCategory(trip, categoryData) {
    // 取得當前分類的所有細節 (包含 isBundle 的包裹)
    const details = this._collectExpenseDetails(trip, categoryData.id);
    
    // 🚀 1. 核心對焦：獲取全域幣別焦點狀態
    const focus = (window.state && window.state.expenseFocus) ? window.state.expenseFocus : 'TWD';
    
    // 🚀 2. 數據彙整：具備「物理穿透」能力的累算引擎
    const totals = details.reduce((acc, item) => {
        if (item.isBundle) {
            // 若為購物包裹，深入 products 軌道提取真值
            const bundleTwd = item.products.reduce((sum, p) => sum + (p.convertedCost || 0), 0);
            const bundleJpy = item.products.reduce((sum, p) => sum + (p.cost || 0), 0);
            acc.twd += bundleTwd;
            acc.jpy += bundleJpy;
        } else {
            // 一般單行節點
            acc.twd += (item.convertedCost || 0);
            acc.jpy += (item.cost || 0);
        }
        return acc;
    }, { twd: 0, jpy: 0 });

    // 🚀 3. 邏輯判定：根據焦點決定標題顯示的幣別真值
    const displayAmount = focus === 'TWD' 
        ? `$${Math.round(totals.twd).toLocaleString()}` 
        : `¥${Math.round(totals.jpy).toLocaleString()}`;

    return `
        <details class="group bg-slate-50/50 rounded-[2.2rem] border border-transparent open:bg-white open:border-slate-100 open:shadow-sm transition-all duration-300">
            <summary class="flex items-center justify-between p-6 cursor-pointer list-none outline-none">
                <div class="flex items-center gap-4">
                    <div class="w-2.5 h-2.5 rounded-full shadow-sm" style="background-color: ${categoryData.color}"></div>
                    <div class="flex flex-col">
                        <span class="text-sm font-black text-slate-700">${categoryData.label}</span>
                        <span class="text-[9px] font-black text-slate-300 italic uppercase">${categoryData.percentage.toFixed(1)}% Weight</span>
                    </div>
                </div>
                <div class="flex items-center gap-5">
                    <span class="text-sm font-black text-slate-800 tabular-nums animate-fade-in">
                        ${displayAmount}
                    </span>
                    <div class="text-slate-300 group-open:rotate-180 transition-transform duration-300 text-[10px]">▼</div>
                </div>
            </summary>
            
            <div class="px-7 pb-6 space-y-3 animate-fade-in">
                <div class="h-[1px] bg-slate-100/50 mb-4"></div>
                ${details.length > 0 
                    ? details.map(item => this._renderExpenseItemRow(item)).join('') 
                    : `<p class="text-[10px] text-slate-300 italic text-center py-2 uppercase tracking-widest">No Details Found</p>`}
            </div>
        </details>
    `;
},


/** 🧬 子函數 B：數據採集邏輯 (V2026.ULTRA 購物分組版) */
_collectExpenseDetails(trip, categoryId) {
    const list = [];
    if (!trip || !trip.days) return list;

    // 🚀 1. 物理掃描每日排程節點
    trip.days.forEach(day => {
        if (!day.schedules) return;
        
        // 🏗️ 為每一天初始化一個潛在的「購物包裹」
        const dayShoppingBundle = {
            day: day.dayNum,
            location: "",
            isBundle: true, // 🚀 關鍵指紋：標記此數據為分組包裹
            products: []
        };

        day.schedules.forEach(item => {
            const style = (item.style || '').toLowerCase().trim();

            // 🎯 A軌道：購物消費攔截器 (物理匯流)
            if (categoryId === 'shopping' && style === 'shopping') {
                try {
                    const products = JSON.parse(item.memo || "[]");
                    // 取得該節點的地點作為標題參考
                    dayShoppingBundle.location = item.location || '購物行程';
                    
                    products.forEach(p => {
                        const cost = (Number(p.price) || 0) * (Number(p.quantity) || 1);
                        if (cost <= 0) return;

                        const currency = item.currency || 'JPY';
                        dayShoppingBundle.products.push({
                            name: p.name,
                            cost: cost,
                            currency: currency,
                            convertedCost: (currency === 'TWD') ? cost : expenseManager.convert(cost, currency)
                        });
                    });
                } catch (e) { console.error("Shopping grouping error", e); }
                return; 
            }

            // 🎯 B軌道：通用行程與交通節點 (維持扁平採集)
            const cost = expenseManager.parseFuelCost(item.memo);
            if (cost <= 0) return;

            const currency = item.currency || 'JPY'; 
            const entry = { 
                name: item.location || (style === 'transport' ? '交通路網' : '行程景點'), 
                cost, 
                currency,
                convertedCost: (currency === 'TWD') ? cost : expenseManager.convert(cost, currency),
                day: day.dayNum,
                isBundle: false // 標記為一般單行項目
            };

            if (categoryId === 'transport' && style === 'transport') {
                list.push(entry);
            } else if (categoryId === 'itinerary' && style === 'json') {
                list.push(entry);
            }
        });

        // 🚀 物理匯合：如果當天有採集到購物產品，將整個包裹推入清單
        if (dayShoppingBundle.products.length > 0) {
            list.push(dayShoppingBundle);
        }
    });

    // 🚀 2. 物理掃描全域航網 (Airport Matrix)
    if (categoryId === 'transport' && Array.isArray(trip.transport)) {
        trip.transport.forEach(f => {
            if (f.cost) {
                const fCost = Number(f.cost);
                const fCurrency = f.currency || 'JPY';
                list.push({ 
                    name: `${f.depPort || '--'} → ${f.arrPort || '--'}`, 
                    cost: fCost, 
                    currency: fCurrency,
                    convertedCost: (fCurrency === 'TWD') ? fCost : expenseManager.convert(fCost, fCurrency),
                    day: f.day || 1,
                    isBundle: false
                });
            }
        });
    }

    // 🚀 3. 數據時間軸校準
    return list.sort((a, b) => a.day - b.day);
},


/** 🧬 子函數 C：渲染單一細項行 (V2026.ULTRA 分組包裹版) */
_renderExpenseItemRow(item) {
    const focus = window.state.expenseFocus || 'TWD';

    // 🚀 1. 購物包裹軌道：執行「一對多」包裹渲染
    if (item.isBundle) {
        return `
            <div class="flex gap-4 px-1 py-4 hover:bg-slate-50/50 rounded-[2rem] transition-all group/bundle animate-fade-in">
                <div class="flex-none">
                    <div class="w-8 h-8 bg-white rounded-xl border border-slate-100 flex items-center justify-center text-[10px] font-black text-slate-400 shadow-sm group-hover/bundle:theme-text-pink transition-all">
                        D${item.day}
                    </div>
                </div>
                
                <div class="flex-1 min-w-0 space-y-3 pt-0.5">
                    <div class="flex justify-between items-center mb-1">
                        <p class="text-[9px] font-black text-slate-300 uppercase tracking-[0.15em] italic">Consolidated Cargo</p>
                        <p class="text-[8px] font-bold text-slate-400">@ ${item.location}</p>
                    </div>

                    <div class="bg-slate-50/50 rounded-2xl p-3 space-y-2 border border-slate-100/30">
                        ${item.products.map((p, pIdx) => {
                            const pPrimary = focus === 'TWD' 
                                ? `$${Math.round(p.convertedCost || 0).toLocaleString()}` 
                                : `¥${Math.round(p.cost).toLocaleString()}`;
                            const pSecondary = focus === 'TWD'
                                ? `¥${Math.round(p.cost).toLocaleString()}`
                                : `$${Math.round(p.convertedCost || 0).toLocaleString()}`;

                            return `
                                <div class="flex justify-between items-center gap-2">
                                    <span class="text-[11px] font-bold text-slate-600 truncate flex-1">${p.name}</span>
                                    <div class="text-right shrink-0">
                                        <p class="text-[11px] font-black text-slate-700 tabular-nums">${pPrimary}</p>
                                        <p class="text-[7px] theme-text-pink font-black tabular-nums opacity-50 tracking-tighter">
                                            ≈ ${pSecondary}
                                        </p>
                                    </div>
                                </div>
                                ${pIdx < item.products.length - 1 ? '<div class="h-[1px] bg-white w-full opacity-50"></div>' : ''}
                            `;
                        }).join('')}
                    </div>
                </div>
            </div>
            <div class="h-[1px] bg-slate-50 w-full last:hidden"></div>
        `;
    }

    // 🚀 2. 一般項目軌道 (Itinerary / Transport)
    const primaryAmount = focus === 'TWD' 
        ? `$${Math.round(item.convertedCost || 0).toLocaleString()}` 
        : `¥${Math.round(item.cost).toLocaleString()}`;
        
    const secondaryAmount = focus === 'TWD'
        ? `¥${Math.round(item.cost).toLocaleString()}`
        : `$${Math.round(item.convertedCost || 0).toLocaleString()}`;

    return `
        <div class="flex justify-between items-center group/item px-1 py-3 hover:bg-slate-50/50 rounded-xl transition-all animate-fade-in">
            <div class="flex items-center gap-3.5">
                <div class="w-7 h-7 bg-white rounded-lg border border-slate-100 flex items-center justify-center text-[9px] font-black text-slate-400 shadow-sm group-hover/item:theme-text-pink transition-all">
                    D${item.day}
                </div>
                
                <div class="flex flex-col min-w-0">
                    <span class="text-[11px] font-bold text-slate-500 truncate max-w-[140px] group-hover/item:text-slate-700 transition-colors">
                        ${item.name}
                    </span>
                    <span class="text-[8px] text-slate-300 font-black uppercase tracking-tighter italic">
                        @ ${item.currency || 'JPY'}
                    </span>
                </div>
            </div>
            
            <div class="flex flex-col items-end gap-0.5">
                <span class="text-[11px] font-black text-slate-600 tabular-nums">${primaryAmount}</span>
                <div class="flex items-center gap-1 opacity-60">
                    <span class="text-[7px] font-black text-slate-300 uppercase">≈</span>
                    <span class="text-[9px] theme-text-pink font-black tabular-nums">${secondaryAmount}</span>
                    <span class="text-[7px] font-bold text-slate-300 tracking-tighter">${focus === 'TWD' ? 'JPY' : 'TWD'}</span>
                </div>
            </div>
        </div>
        <div class="h-[1px] bg-slate-50 w-full last:hidden"></div>
    `;
},

/** 🛒 [Shopping Module] 購物情報系統視圖 (佈局對焦修正版) */
renderShopping(container, shoppingItems = [], activeCategory = '食') {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const categories = trip?.shoppingConfig?.categories || ['食', '藥妝', '一般'];
    
    // 🚀 關鍵對焦 A：將 pb-40 下修為 pb-32，確保底欄按鈕高度一致
    container.innerHTML = `
        <div class="shopping-module animate-fade-in space-y-6 pb-32">
            
            <div class="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 space-y-4">
                <div class="flex justify-between items-center px-1">
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Intelligence Scraper</h4>
                    <div id="shopping-ai-btn">
                        ${this.renderAICopyBtn(expenseManager.getShoppingAiPrompt(document.getElementById('shop-query-input')?.value || ''))}
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px]">📍</span>
                        <input type="text" id="shop-city-input" 
                               class="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 font-black text-xs theme-text-pink focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                               value="${trip?.city || ''}" 
                               placeholder="設定採購城市"
                               oninput="expenseManager.syncShoppingAiPrompt(document.getElementById('shop-query-input').value)">
                    </div>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px]">📦</span>
                        <input type="text" id="shop-query-input" 
                               class="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 font-bold text-xs focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                               placeholder="輸入商品名稱"
                               oninput="expenseManager.syncShoppingAiPrompt(this.value)">
                    </div>
                </div>

                <textarea id="shop-json-input" 
                          class="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 font-mono text-[10px] theme-text-pink focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                          placeholder="請貼上 AI 生成的【燃料包】JSON..."></textarea>

                <button onclick="expenseManager.importShoppingFuel()" 
                        class="w-full py-4 theme-bg text-white rounded-[1.5rem] font-black text-xs shadow-lg active:scale-95 transition-all">
                    存入資料庫
                </button>
            </div>

            <div id="shopping-tabs" class="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
                ${categories.map(cat => `
                    <div class="snap-center">
                        <button id="shop-tab-${cat}" onclick="expenseManager.filterShopping('${cat}')" 
                                class="px-6 py-2.5 rounded-2xl text-[11px] font-black border transition-all whitespace-nowrap flex items-center gap-2
                                ${activeCategory === cat ? 'theme-bg text-white border-transparent shadow-lg' : 'bg-white text-slate-400 border-slate-100'}">
                            <span>${cat}</span>
                            <span class="opacity-40 text-[9px]">${shoppingItems.filter(i => i.category === cat).length}</span>
                        </button>
                    </div>
                `).join('')}
                </div>

            <div class="space-y-4">
                <div class="flex justify-between items-center px-2">
                    <div class="flex flex-col">
                        <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">Browsing: ${activeCategory}</p>
                    </div>

                    <button onclick="expenseManager.promptTransferTarget()" 
                            class="flex items-center gap-1.5 px-4 py-2 bg-pink-50 theme-text-pink rounded-xl text-[10px] font-black uppercase tracking-tighter active:scale-95 transition-all border border-pink-100 shadow-sm">
                        <span class="text-xs">🚚</span> 轉移至排程
                    </button>
                </div>

                <div id="shopping-list-track" class="space-y-3">
                    ${this._renderShoppingCards(shoppingItems, activeCategory)}
                </div>
            </div>
        </div>
    `;
    
    this.focusShoppingTab(activeCategory);
},

    /** 🧬 物理對焦：分類標籤置中捲動 */
    focusShoppingTab(cat) {
        requestAnimationFrame(() => {
            const tab = document.getElementById(`shop-tab-${cat}`);
            if (tab) {
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    },

/** 🧬 子組件：渲染購物卡片 (V2026.ULTRA - INFO 導通版) */
_renderShoppingCards(items, category) {
    const filtered = items.filter(i => i.category === category);
    if (filtered.length === 0) return `<div class="py-12 text-center text-slate-300 text-[10px] font-black italic border-2 border-dashed border-slate-50 rounded-[2rem]">NO CARGO DETECTED</div>`;

    return filtered.map((item) => {
        const mapQuery = encodeURIComponent(`${item.store || ''} ${item.name} Japan`);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
        
        const hasImage = !!(item.image_query || item.imageUrl);
        const imgUrl = item.imageUrl || `https://www.google.com/search?q=${encodeURIComponent(item.image_query || item.name_jp || item.name)}&tbm=isch`;

        return `
            <div class="bg-white p-5 rounded-[1.8rem] border border-slate-50 shadow-sm hover:shadow-md transition-all group relative animate-fade-in">
                <div class="flex justify-between items-start gap-3">
                    <div class="flex items-start gap-3 flex-1 min-w-0">
                        <div onclick="expenseManager.toggleShoppingDone('${item.id}')" 
                             class="w-8 h-8 rounded-full border-2 border-slate-100 flex items-center justify-center group-hover:border-pink-200 transition-colors shrink-0 cursor-pointer active:scale-90 mt-0.5">
                             <div class="w-4 h-4 rounded-full ${item.done ? 'theme-bg' : 'bg-transparent'} transition-all"></div>
                        </div>

                        <div class="overflow-hidden flex-1">
                            ${hasImage ? `
                                <a href="${imgUrl}" target="_blank" 
                                   class="font-black text-slate-800 text-[13px] truncate block hover:theme-text-pink transition-colors cursor-pointer group/link flex items-center gap-1">
                                    <span class="${item.done ? 'text-slate-300 line-through' : ''}">${item.name}</span>
                                    <span class="text-[9px] opacity-0 group-hover/link:opacity-100 transition-opacity">🖼️</span>
                                </a>
                            ` : `
                                <h4 class="font-black text-slate-800 text-[13px] truncate ${item.done ? 'text-slate-300 line-through' : ''}">${item.name}</h4>
                            `}
                            
                            <p class="text-[10px] theme-text-pink font-black mt-0.5 tabular-nums tracking-tighter truncate">
                                ${item.name_jp || ''}
                            </p>
                            
                            <div class="flex items-center gap-2 mt-1.5">
                                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter tabular-nums">
                                    JPY ${item.price?.toLocaleString()} × ${item.quantity || 1}
                                </p>
                            </div>

                            ${item.info ? `
                            <div class="mt-3 bg-slate-50/50 rounded-xl p-2.5 border-l-2 border-pink-200/50">
                                <p class="text-[10px] text-slate-500 font-medium leading-relaxed italic">
                                    ${item.info}
                                </p>
                            </div>
                            ` : ''}
                        </div>
                    </div>

                    <div class="flex flex-col items-end gap-1 shrink-0">
                        <span class="text-[13px] font-black text-slate-800 tabular-nums">¥${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                        <button onclick="expenseManager.deleteShoppingItem('${item.id}')" class="text-slate-200 hover:text-rose-400 transition-colors p-1 text-[10px]">🗑️</button>
                    </div>
                </div>

                <div class="mt-4 pt-3 border-t border-slate-50">
                    <a href="${mapUrl}" target="_blank" class="flex items-center justify-between group/map">
                        <div class="flex items-center gap-2 min-w-0">
                            <span class="text-[10px]">📍</span>
                            <span class="text-[11px] font-bold text-slate-500 group-hover/map:theme-text-pink transition-colors truncate">
                                ${item.store || '未指定具體地點'}
                            </span>
                        </div>
                        <span class="text-[8px] font-black text-slate-300 uppercase tracking-widest italic shrink-0 ml-2">GO MAP ›</span>
                    </a>
                </div>
            </div>
        `;
    }).join('');
},

// ============================================================
// 🏮 [Translate Module] 翻譯情境系統視圖 */
// ============================================================



// ============================================================
// 🏮 [Real-time Module] 即時翻譯系統視圖 */
// ============================================================




// ============================================================
// 🆘 [Emergency Module] 緊急救援系統視圖
// ============================================================


/** 🆘 [Emergency Module] 緊急救援系統視圖 (對位購物頁：視覺主權回歸版) */
renderEmergency(container, emergencyVault = [], activeTab = 'medical') {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const embassys = emergencyVault.filter(i => i.type === 'embassy');
    const medicals = emergencyVault.filter(i => i.type === 'medical');
    const insurances = emergencyVault.filter(i => i.type === 'insurance');

    container.innerHTML = `
        <div class="emergency-module animate-fade-in space-y-6 pb-32">
            
            <div class="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 space-y-5">
                <div class="flex justify-between items-center px-1">
                    <div class="flex items-center gap-2">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Intelligence System</h4>
                    </div>
                    <div id="emergency-ai-btn">
                        ${this.renderAICopyBtn(this._getEmergencyAiPrompt(trip?.city || '日本', ''))}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="relative">
                        <input type="text" id="emergency-query-input" 
                               class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-black text-xs theme-text-pink focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                               placeholder="城市區域" value="${trip?.city || ''}" oninput="App.syncEmergencyAiPrompt()">
                    </div>
                    <div class="relative">
                        <input type="text" id="insurance-query-input" 
                               class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-black text-xs focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                               placeholder="保險公司" oninput="App.syncEmergencyAiPrompt()">
                    </div>
                </div>

                <textarea id="emergency-json-input" 
                          class="w-full h-28 bg-slate-50 border-none rounded-[1.8rem] p-5 font-mono text-[10px] theme-text-pink focus:ring-2 focus:ring-pink-100 outline-none transition-all shadow-inner" 
                          placeholder="請貼上 AI 生成的 JSON 救援燃料包..."></textarea>
                
                <button onclick="App.importEmergencyFuel()" 
                        class="w-full py-4 theme-bg text-white rounded-[1.5rem] font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all">
                    執行數據同步
                </button>
            </div>

            <div class="flex gap-3 px-2 overflow-x-auto no-scrollbar snap-x">
                ${['medical', 'embassy', 'insurance'].map(tab => {
                    const labels = { medical: '🏥 醫療救援', embassy: 'TW 領事護照', insurance: '🛡️ 旅平理賠' };
                    const isActive = activeTab === tab;
                    return `
                        <div class="snap-center">
                            <button onclick="App.filterEmergency('${tab}')" 
                                    class="px-6 py-2.5 rounded-2xl text-[11px] font-black border transition-all whitespace-nowrap
                                    ${isActive ? 'theme-bg text-white border-transparent shadow-lg shadow-pink-100' : 'bg-white text-slate-400 border-slate-100'}">
                                ${labels[tab]}
                            </button>
                        </div>`;
                }).join('')}
            </div>

            <div id="emergency-content" class="min-h-[400px] animate-fade-in px-2">
                ${this._renderEmergencyTabContent(activeTab, { embassys, medicals, insurances })}
            </div>
        </div>
    `;
},


/** 🧬 子組件：救援分區渲染引擎 */
_renderEmergencyTabContent(tab, data) {
    switch(tab) {
        case 'medical': 
            return this._renderMedicalSection(data.medicals);
        case 'embassy': 
            return this._renderEmbassySection(data.embassys);
        case 'insurance': 
            return this._renderInsuranceSection(data.insurances);
    }
},

/** 🏥 [Skeleton] 醫療分區骨架總裝 */
_renderMedicalSection(items) {
    // 🚀 組合重要資訊渲染與燃料數據渲染
    const strategicGuide = this._renderMedicalTacticalGuide();
    const dataCards = this._renderMedicalFuelCards(items);

    return `
        <div class="emergency-medical-sector animate-fade-in space-y-6">
            ${strategicGuide}
            <div id="medical-cards-track" class="px-2">
                ${dataCards}
            </div>
        </div>
    `;
},

/** 🚑 [Tactical] 醫療重要資訊與 SOP 指南 (V2026.ULTRA 終極對焦版) */
_renderMedicalTacticalGuide() {
    return `
<div class="bg-pink-50/40 border-2 border-dashed border-pink-100/60 rounded-[3rem] p-8 mb-10 animate-fade-in mx-2 overflow-hidden">
    <div class="flex items-center gap-3.5 mb-10 px-1">
        <span class="text-2xl drop-shadow-sm">🚑</span>
        <div class="flex flex-col">
            <h4 class="text-slate-800 font-black text-base tracking-tighter">日本就醫與理賠協定</h4>
            <p class="text-[9px] theme-text-pink font-black uppercase tracking-[0.2em] opacity-60">Medical Protocol V2.1</p>
        </div>
    </div>
    
    <div class="space-y-4">
        ${[
            { id: '01', title: '聯繫與搜尋', content: `確認支援代墊。外語醫院請檢索 <a href="#" class="theme-text-pink font-black border-b border-pink-200">JNTO 就醫指南</a>，或利用 <a href="#" class="theme-text-pink font-black border-b border-pink-200">OHDr.</a> 執行中文視訊看診。` },
            { id: '02', title: '文件指紋存取', content: `就醫後務必領取 <span class="text-slate-700 font-black">「診斷書(診断書)」</span> 與 <span class="text-slate-700 font-black">「收據明細(領収書)」</span>。內容需包含病名、診療內容與費用。` },
            { id: '03', title: '執行跨國理賠', content: `利用 <a href="#" class="theme-text-pink font-black border-b border-pink-200">健保快易通</a> 查詢就醫紀錄。可同步申請「健保自墊核退」與商業旅平險理賠。` }
        ].map(item => `
            <div class="flex gap-4 p-5 bg-white/60 rounded-[2rem] border border-white/40 shadow-sm group">
                <div class="flex-none">
                    <span class="theme-bg text-white w-7 h-7 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-lg shadow-pink-100/50">${item.id}</span>
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                    <h5 class="text-slate-800 font-black text-[13px] mb-1.5 tracking-tight">${item.title}</h5>
                    <div class="text-slate-400 text-[11px] font-medium leading-[1.7] antialiased">
                        ${item.content}
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="mt-8 px-4 py-5 bg-pink-100/30 rounded-[1.8rem] border border-pink-200/20">
        <div class="flex gap-3 items-start">
            <span class="text-sm shrink-0">※</span>
            <p class="text-[10px] theme-text-pink italic leading-relaxed font-black">
                職人提示：請務必結清醫藥費以維護個人信用指紋，避免影響未來入境日本之權益。
            </p>
        </div>
    </div>
</div>`;
},

/** 🧪 [Fuel] 醫療數據燃料包渲染 (V2026.ULTRA 物理對焦修正版) */
_renderMedicalFuelCards(items) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const fullVault = trip ? (trip.emergencyVault || []) : [];

    // 🚀 核心修正 1：指針對焦
    // 💡 職人診斷：使用 viewEngine 實體取代 this，確保在非同步渲染中不因作用域位移而崩潰
    if (!items || items.length === 0) return viewEngine._renderEmptyState('MEDICAL');

    return items.map((item) => {
        const absoluteIdx = fullVault.findIndex(v => v === item);
        
        // 🚀 核心修正 2：物理路網導通
        // 💡 修正：將 0{ 改為 0/${ ，確保變數正確注入 URL 軌道
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=$/${encodeURIComponent(item.name + ' ' + item.address)}`;

        return `
        <div class="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6 relative group animate-slide-up mb-6">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-[9px] font-black theme-text-pink uppercase tracking-[0.2em] mb-1">Medical Support</p>
                    <h4 class="font-black text-slate-800 text-[18px] leading-tight">${item.name}</h4>
                </div>
            </div>

            <a href="tel:${item.phone}" class="block bg-slate-50 p-5 rounded-[1.8rem] border border-slate-100 active:scale-95 transition-all group/phone hover:border-pink-100">
                <p class="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-tighter">醫院聯絡電話</p>
                <div class="flex items-center justify-between">
                    <p class="text-[13px] font-black text-slate-700 tabular-nums">${item.phone}</p>
                    <span class="text-lg opacity-40 group-hover/phone:opacity-100 group-hover/phone:theme-text-pink transition-all">📞</span>
                </div>
            </a>

            <div class="space-y-4">
                <a href="${mapUrl}" target="_blank" class="block bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100/50 group/map transition-all hover:bg-white hover:border-pink-100">
                    <p class="text-[11px] text-slate-500 font-bold leading-relaxed flex items-start gap-2">
                        <span class="shrink-0 group-hover/map:animate-bounce">📍</span> ${item.address}
                    </p>
                    <span class="block text-[8px] text-slate-300 font-black uppercase tracking-widest mt-2 ml-6 group-hover/map:theme-text-pink transition-colors">Open Navigation →</span>
                </a>
                
                <div class="px-2">
                    <p class="text-[10px] text-slate-400 font-bold leading-relaxed italic">"${item.info}"</p>
                </div>
            </div>

            <div class="flex justify-end pt-2 border-t border-slate-50">
                <button onclick="App.promptEditEmergencyItem(${absoluteIdx})" 
                        class="text-[10px] font-black text-slate-200 hover:theme-text-pink transition-colors uppercase tracking-widest">
                    Edit Diagnostic Data
                </button>
            </div>
        </div>`;
    }).join('');
},



/** 🗼 [Skeleton] 外交分區骨架總裝 */
_renderEmbassySection(items) {
    // 🚀 執行組件總裝
    const strategicSop = this._renderEmbassyTacticalGuide();
    const dataCards = this._renderEmbassyFuelCards(items);

    return `
        <div class="emergency-embassy-sector animate-fade-in space-y-6">
            ${strategicSop}
            <div id="embassy-cards-track" class="px-2">
                ${dataCards}
            </div>
        </div>
    `;
},

/** 📕 [Tactical] 外交重要資訊：主題配色與流體排版 (V2026.ULTRA) */
_renderEmbassyTacticalGuide() {
    return `
        <div class="animate-fade-in mx-4 mb-10">
            <div class="flex items-center gap-3 mb-6 border-b border-pink-100 pb-4">
                <span class="text-2xl">🌍</span>
                <div>
                    <h4 class="text-slate-800 font-black text-[15px] tracking-tight">領務安全資訊彙整</h4>
                    <p class="text-[9px] theme-text-pink font-bold uppercase tracking-widest italic">Travel Safety Guide</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-8">
                <a href="https://www.boca.gov.tw/sp-abre-main-1.html" target="_blank" 
                   class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all group">
                    <p class="text-[8px] font-black theme-text-pink uppercase mb-2 tracking-tighter">行前準備</p>
                    <p class="text-[12px] font-bold text-slate-700 group-hover:theme-text-pink transition-colors">出國登錄系統</p>
                </a>
                <a href="https://www.boca.gov.tw/sp-trwa-list-1.html" target="_blank" 
                   class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all group">
                    <p class="text-[8px] font-black text-rose-500 uppercase mb-2 tracking-tighter">環境現況</p>
                    <p class="text-[12px] font-bold text-slate-700 group-hover:text-rose-600 transition-colors">即時旅遊警示</p>
                </a>
            </div>

            <div class="px-2 space-y-4">
                <h5 class="text-[10px] font-black theme-text-pink opacity-50 uppercase tracking-widest mb-4 italic">Traveler Checklist / 出發前叮嚀</h5>
                <div class="space-y-4 text-[11px] font-bold text-slate-600 leading-relaxed">
                    <div class="flex items-start gap-3">
                        <span class="theme-text-pink mt-0.5">✦</span>
                        <p>護照效期：請確認效期在 <span class="theme-text-pink underline decoration-pink-200">6 個月以上</span> 且留有足夠空白頁面。</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="theme-text-pink mt-0.5">✦</span>
                        <p>日本自駕提醒：請務必隨身攜帶 <span class="text-slate-800 font-black">台灣駕照正本 與 日文譯本</span>。</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="theme-text-pink mt-0.5">✦</span>
                        <p>
                            官方資源：建議下載 
                            <a href="https://www.boca.gov.tw/cp-92-246-b7290-1.html" target="_blank" 
                               class="theme-text-pink underline underline-offset-4 decoration-pink-200 hover:opacity-70 transition-all">
                               「旅外安全指南 APP」
                            </a> 
                            以便隨時聯繫鄰近駐外館處。
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="relative mx-2 mb-10 group">
            <div class="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700 rounded-[3rem] shadow-2xl"></div>
            <div class="absolute -right-4 -top-4 text-9xl opacity-10 font-black italic select-none pointer-events-none group-hover:opacity-15 transition-opacity">BOCA</div>
            
            <div class="relative z-10 p-9 text-white">
                <div class="flex items-center justify-between mb-10">
                    <h3 class="font-black text-sm flex items-center gap-3">
                        <span class="text-xl">📕</span> 護照遺失應變處理
                    </h3>
                    <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                </div>
                
                <div class="space-y-10 relative">
                    <div class="absolute left-[13px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-white/40 via-white/10 to-white/40"></div>

                    <div class="flex gap-6 items-start relative">
                        <span class="w-7 h-7 rounded-full bg-white text-pink-600 flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg z-10">1</span>
                        <div class="flex-1 border-b border-white/5 pb-6">
                            <p class="text-[12px] font-black text-pink-100 mb-2 uppercase tracking-widest">Police Report</p>
                            <p class="text-[11px] font-medium leading-relaxed opacity-90">
                                請至最近的「交番」(Koban) 報案，並取得 <span class="text-white font-black border-b border-white/60">【遺失屆出證明書】</span>。
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-6 items-start relative">
                        <span class="w-7 h-7 rounded-full bg-white text-pink-600 flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg z-10">2</span>
                        <div class="flex-1 border-b border-white/5 pb-6">
                            <p class="text-[12px] font-black text-pink-100 mb-2 uppercase tracking-widest">Requirements</p>
                            <p class="text-[11px] font-medium leading-relaxed opacity-90">
                                請準備 <span class="text-white font-black">2 吋照片 2 張</span> 及身分證明。建議將證件與護照分開存放。
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-6 items-start relative">
                        <span class="w-7 h-7 rounded-full bg-white text-pink-600 flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg z-10">3</span>
                        <div class="flex-1 pb-2">
                            <p class="text-[12px] font-black text-pink-100 mb-2 uppercase tracking-widest">Documentation</p>
                            <p class="text-[11px] font-medium leading-relaxed opacity-90">
                                聯繫駐外代表處申請 <span class="text-white font-black border-b border-white/60">「入國證明書」</span>。回國後再補辦護照。
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4">
                    <div class="flex justify-between items-end">
                        <div>
                            <p class="text-[8px] font-black text-pink-100 uppercase tracking-[0.3em] mb-1">Emergency Support</p>
                            <p class="text-[15px] font-black text-white tabular-nums tracking-tighter">+886-800-085-095</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[9px] text-pink-200 font-bold italic leading-relaxed opacity-80">※ 職人提醒：請妥善保存報案單與相關收據。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
},

/** 🧪 [Fuel] 外交數據燃料包渲染 (V2026.ULTRA 物理對焦修正版) */
_renderEmbassyFuelCards(items) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const fullVault = trip ? (trip.emergencyVault || []) : [];

    // 🚀 核心修正 1：實體指針導通
    // 💡 職人診斷：使用 viewEngine 確保在任何閉包環境下都能準確抓到空狀態零件
    if (!items || items.length === 0) return viewEngine._renderEmptyState('EMBASSY');

    return items.map((item) => {
        const absoluteIdx = fullVault.findIndex(v => v === item);
        
        // 🚀 核心修正 2：URL 語法洗滌
        // 💡 修正：將 0{ 改為 0/${ ，確保 Google Maps 軌道正確讀取變數
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=$/${encodeURIComponent(item.name + ' ' + item.address)}`;

        return `
        <div class="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6 relative group animate-slide-up mb-6">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-[9px] font-black theme-text-pink uppercase tracking-[0.2em] mb-1">Diplomatic Mission</p>
                    <h4 class="font-black text-slate-800 text-[18px] leading-tight">${item.name}</h4>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <a href="tel:${item.phone}" class="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 active:scale-95 transition-all group/phone hover:border-pink-100">
                    <p class="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-tighter">領務一般洽詢</p>
                    <div class="flex items-center justify-between">
                        <p class="text-[12px] font-black text-slate-700 tabular-nums">${item.phone}</p>
                        <span class="text-xs group-hover/phone:theme-text-pink transition-colors">📞</span>
                    </div>
                </a>
                <a href="tel:${item.rescuePhone}" class="bg-pink-50 p-4 rounded-[1.5rem] border border-pink-100/50 active:scale-95 transition-all group/emergency hover:border-pink-300 shadow-sm shadow-pink-100/20">
                    <p class="text-[8px] font-black theme-text-pink uppercase mb-1 tracking-tighter">24H 急難救助</p>
                    <div class="flex items-center justify-between">
                        <p class="text-[12px] font-black theme-text-pink tabular-nums">${item.rescuePhone}</p>
                        <span class="text-xs group-hover/emergency:animate-pulse">🆘</span>
                    </div>
                </a>
            </div>

            <div class="space-y-4">
                <a href="${mapUrl}" target="_blank" class="block bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100/50 group/map transition-all hover:bg-white hover:border-pink-100">
                    <p class="text-[11px] text-slate-500 font-bold leading-relaxed flex items-start gap-2">
                        <span class="shrink-0 group-hover/map:animate-bounce">📍</span> 
                        <span>${item.address}</span>
                    </p>
                    <span class="block text-[8px] text-slate-300 font-black uppercase tracking-widest mt-2 ml-6 group-hover/map:theme-text-pink transition-colors">Open Navigation →</span>
                </a>

                <div class="px-2 border-l-2 border-slate-100 ml-1">
                    <p class="text-[10px] text-slate-400 font-bold leading-relaxed italic">"${item.info}"</p>
                </div>
            </div>
            
            <div class="flex justify-end pt-2 border-t border-slate-50">
                <button onclick="App.promptEditEmergencyItem(${absoluteIdx})" 
                        class="text-[9px] font-black text-slate-200 hover:theme-text-pink transition-colors uppercase tracking-widest">
                    Update Mission Fingerprint
                </button>
            </div>
        </div>`;
    }).join('');
},


/** 🛡️ [Skeleton] 保險分區骨架總裝 */
_renderInsuranceSection(items) {
    // 🚀 執行組件總裝：重要資訊（流程與清單） + 燃料數據（聯繫卡片）
    const tacticalInfo = this._renderInsuranceTacticalGuide();
    const dataCards = this._renderInsuranceFuelCards(items);

    return `
        <div class="emergency-insurance-sector animate-fade-in space-y-6 px-2">
            ${tacticalInfo}
            <div id="insurance-cards-track">
                ${dataCards}
            </div>
            ${this._renderInsuranceEvidenceChecklist()}
        </div>
    `;
},

/** 🛡️ [Tactical] 保險重要資訊：主題配色與應變導引 (V2026.ULTRA) */
_renderInsuranceTacticalGuide() {
    return `
        <div class="relative mx-2 mb-10 group">
            <div class="absolute inset-0 bg-gradient-to-br theme-bg rounded-[3rem] shadow-xl opacity-90"></div>
            <div class="absolute -right-6 -bottom-6 text-9xl opacity-10 font-black italic select-none pointer-events-none group-hover:opacity-20 transition-opacity">CLAIM</div>
            
            <div class="relative z-10 p-9 text-white">
                <h3 class="font-black text-[15px] flex items-center gap-3 mb-4 text-white">
                    <span class="text-xl">🛡️</span> 旅平險理賠申請協定
                </h3>
                <p class="text-[11px] text-white/90 leading-relaxed font-bold">
                    意外發生時，請於 <span class="text-amber-300 font-black">第一時間</span> 聯繫保險專線報備。確保所有收據與護照姓名一致，並務必妥善封存 <span class="underline decoration-amber-400 underline-offset-4">原始紙本單據</span>。
                </p>
                <div class="mt-6">
                    <span class="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black border border-white/20 shadow-sm uppercase tracking-wider">
                        2026 新規：每人上限 2 張
                    </span>
                </div>
            </div>
        </div>

        <div class="animate-fade-in mx-4 mb-12">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                <div class="space-y-5">
                    <div class="flex items-center gap-3 border-b border-pink-100 pb-3">
                        <span class="text-lg">🏥</span>
                        <h4 class="text-slate-800 font-black text-[14px] tracking-tight">海外醫療處置</h4>
                    </div>
                    <div class="space-y-4 text-[11px] font-bold text-slate-500 leading-relaxed">
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>務必索取 <span class="theme-text-pink font-black">診斷證明書正本</span> (內容需含醫生簽章)。</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>完整保留費用細項收據、處方箋與診療明細表。</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>若需住院請先致電救援中心，確認是否支援代墊。</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-5">
                    <div class="flex items-center gap-3 border-b border-pink-100 pb-3">
                        <span class="text-lg">✈️</span>
                        <h4 class="text-slate-800 font-black text-[14px] tracking-tight">旅遊不便處理</h4>
                    </div>
                    <div class="space-y-4 text-[11px] font-bold text-slate-500 leading-relaxed">
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>班機延誤：請於現場索取標明「延誤原因」之正式證明。</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>行李損失：取得 <span class="theme-text-pink font-black">PIR 事故報告</span>，並請務必對受損處拍照留底。</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>額外支出：妥善保留延誤期間所有合理的餐飲與住宿收據。</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
},


/** 📋 [Tactical Sub] 證據採集清單：主題配色版 (V2026.ULTRA) */
_renderInsuranceEvidenceChecklist() {
    const checklistItems = [
        { t: '醫療', d: '診斷書正本、收據明細、處方箋' },
        { t: '交通', d: '延誤證明(註明原因)、原始登機證' },
        { t: '財損', d: 'PIR報告、報案證明、維修估價單' },
        { t: '預防', d: '護照影本與證明文件建議拍照留存' }
    ];

    return `
<div class="animate-fade-in mx-4 mb-10">
    <div class="flex items-center justify-between mb-6 border-b border-pink-100 pb-4">
        <div class="flex items-center gap-3">
            <span class="text-xl">📋</span>
            <h4 class="text-slate-800 font-black text-[15px] tracking-tight">理賠證據採集指引</h4>
        </div>
        <span class="text-[9px] theme-text-pink font-black uppercase tracking-widest italic">Evidence Pool</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 px-2">
        ${checklistItems.map((item, idx) => `
        <div class="flex items-start gap-4 group cursor-pointer" onclick="App.toggleClaimCheck('claim-check-${idx}')">
            <div id="claim-check-${idx}" class="w-6 h-6 rounded-xl border-2 border-slate-200 flex items-center justify-center shrink-0 transition-all group-hover:border-pink-400">
                <svg class="w-4 h-4 text-white opacity-0 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <div class="flex flex-col">
                <span class="text-[12px] font-black text-slate-700 leading-tight group-hover:theme-text-pink transition-colors">${item.t}類文件</span>
                <span class="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">${item.d}</span>
            </div>
        </div>`).join('')}
    </div>

    <div class="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
        <p class="text-[10px] text-slate-400 font-bold leading-relaxed italic">
            ※ 職人提醒：定額給付不看單據，實支實付需憑發票。2026 年新規限制每人每趟旅程投保上限為 2 張，請確保投保額度對焦需求。
        </p>
    </div>
</div>`;
},

/** 🧪 [Fuel] 保險數據燃料包渲染 (V2026.ULTRA 實體對焦版) */
_renderInsuranceFuelCards(items) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const fullVault = trip ? (trip.emergencyVault || []) : [];

    // 🚀 核心修正：指針穩壓
    // 💡 職人診斷：使用 viewEngine 實體取代 this，確保在 ESM 模組作用域下 100% 導通空狀態零件
    if (!items || items.length === 0) return viewEngine._renderEmptyState('INSURANCE');

    return items.map((item) => {
        const absoluteIdx = fullVault.findIndex(v => v === item);

        return `
        <div class="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6 relative group animate-slide-up mb-6">
            <div class="flex justify-between items-start px-1">
                <div>
                    <p class="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1 italic">24H Global Hotline</p>
                    <h5 class="font-black text-slate-800 text-[18px] leading-tight">${item.name}</h5>
                </div>
            </div>

            <a href="tel:${item.phone}" class="block bg-blue-50/50 p-5 rounded-[1.8rem] border border-blue-100/50 active:scale-95 transition-all group/call hover:border-blue-200">
                <p class="text-[8px] font-black text-blue-400 uppercase mb-1 tracking-tighter">24H 全球救援專線</p>
                <div class="flex items-center justify-between">
                    <p class="text-[14px] font-black text-blue-700 tabular-nums">${item.phone}</p>
                    <span class="text-lg opacity-40 group-hover/call:opacity-100 transition-opacity">📞</span>
                </div>
            </a>

            <div class="space-y-4">
                <div class="px-2 border-l-2 border-blue-100 ml-1">
                    <p class="text-[10px] text-slate-400 font-bold leading-relaxed italic">"${item.info}"</p>
                </div>

                <div class="flex justify-end pt-2 border-t border-slate-50">
                    <button onclick="App.promptEditEmergencyItem(${absoluteIdx})" 
                            class="text-[9px] font-black text-slate-200 hover:text-blue-500 transition-colors uppercase tracking-widest">
                        Edit Policy Data
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
},



/** 🚀 AI 指令引擎：緊急救援全維度對焦 (V2026.ULTRA 物理真值防禦版) */
_getEmergencyAiPrompt(city, insurance) {
    const insuranceTarget = (insurance && insurance.trim()) ? insurance.trim() : '台灣常見保險公司';
    
    return `你是一位國際旅遊數據驗證專家。請針對「${city}」提供以下【救援燃料】，並以單一 JSON 陣列格式輸出。

🚨 核心資源對焦協定：
1. **駐外機構**：提供鄰近${city}的「中華民國駐外代表處」官方實體真值。
2. **醫療資源**：3-5 個鄰近${city}、具備中文能力或醫療口譯之急救醫院。
3. **保險資源**：僅提供「${insuranceTarget}」官方專屬的 24H 海外急難救助電話。

🚨 數據真值與熔斷協定 (Critical Integrity)：
- **嚴禁編造電話**：針對「${insuranceTarget}」，[phone] 欄位必須經過內部邏輯二次比對。若你無法 100% 確認其 2026 年最新專線，請填寫「請查閱保單封面或官方 App」。
- **物理宣告**：在 [info] 欄位最後必須加上「(請務必以手邊保單正本為準)」。

🚨 輸出規範：
- 純 JSON 陣列，嚴禁解釋文字或 Markdown。
- 欄位：type ("embassy", "medical", "insurance"), name, address, phone, info, rescuePhone (僅限 embassy)。

範例校準：
{ 
  "type": "insurance", 
  "name": "Chubb 安達海外急難救助中心", 
  "phone": "+886-2-23266758", 
  "info": "24小時全球緊急支援專線。提供醫療傳譯與法律協助。(請務必以手邊保單正本為準)" 
}`;
},

// ============================================================
// 5. [Fuel Interpreters] 高品質燃料解析引擎
// 負責：AI JSON 解析、分段路網渲染
// ============================================================


/** 🤖 輔助組件：AI 指令複製按鈕 (V2026.ULTRA 強健數據傳輸版) */
renderAICopyBtn(prompt) {
    if (!prompt) return '';

    // 🚀 核心 A：數據加固 - 採用二進位流式封裝協定 (Binary Stream Protocol)
    // 徹底封殺 btoa 在處理 UTF-8/繁體中文時的物理斷路風險，確保長 Prompt 不失真
    const safePrompt = btoa(encodeURIComponent(prompt).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
    }));

    // 🎨 核心 B：視覺對焦 - 強化按鈕的「數據感」與「物理回饋」
    return `
        <button onclick="App.copyToClipboard('${safePrompt}')" 
                style="background-color: color-mix(in srgb, var(--theme-primary) 10%, white); 
                       color: var(--theme-primary); 
                       border-color: color-mix(in srgb, var(--theme-primary) 20%, white);"
                class="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black transition-all active:scale-95 active:brightness-90 uppercase tracking-widest shadow-sm border border-dashed cursor-pointer group">
            
            <div class="relative w-2.5 h-2.5 flex items-center justify-center">
                <span class="absolute w-full h-full bg-[var(--theme-primary)] rounded-full animate-ping opacity-30"></span>
                <span class="relative text-[11px] group-hover:rotate-12 transition-transform duration-300">✨</span>
            </div>
            
            <span class="leading-none tracking-tight">Copy AI Protocol</span>
            
            <div class="w-1 h-1 rounded-full bg-[var(--theme-primary)] opacity-40 ml-1"></div>
        </button>`;
},


/** 🎨 視覺演進：行程小卡渲染 (V2026.ULTRA 複合物件感知修正版) */
renderItineraryFuel(jsonStr) {
    if (!jsonStr) return "";

    try {
        // 🚀 1. 物理洗滌：多層級深度過濾
        let sanitized = jsonStr
            .replace(/```json/g, '') // 物理切除 Markdown 頭
            .replace(/```/g, '')     // 物理切除 Markdown 尾
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // 封殺不可見字元
            .trim();

        // 🚀 2. 邊界防禦：自動補全對稱性
        if (sanitized.startsWith('{') && !sanitized.endsWith('}')) sanitized += '}';
        if (sanitized.startsWith('[') && !sanitized.endsWith(']')) sanitized += ']';

        const data = JSON.parse(sanitized);

        // 🚀 3. 關鍵對焦：自動偵測「奈良包 (Object with stops)」或「標準陣列」
        // 💡 職人診斷：如果 data 含有 stops 陣列，則 items 應指向該陣列；否則維持原有的 Array/Object 判定。
        const items = (data && data.stops && Array.isArray(data.stops)) 
            ? data.stops 
            : (Array.isArray(data) ? data : [data]);
        
        let totalExpense = 0;

        const contentHtml = items.map((item, idx) => {
            // 🚀 4. 均值解析引擎：強化數字提取
            if (item.expense) {
                const prices = String(item.expense).replace(/,/g, '').match(/\d+/g);
                if (prices) {
                    const numPrices = prices.map(Number);
                    const avg = numPrices.reduce((a, b) => a + b, 0) / numPrices.length;
                    totalExpense += avg;
                }
            }

            return `
                <div class="itinerary-fuel-box space-y-4 ${idx > 0 ? 'mt-8 pt-8 border-t border-dashed border-slate-100' : 'mt-3'} animate-fade-in">
                    <div class="flex items-center gap-2 mb-2">
                        <span class="text-[10px] font-black theme-text-pink bg-pink-50 px-2 py-0.5 rounded-full italic shadow-sm">${item.time || '--:--'}</span>
                        <p class="text-[11px] font-black text-slate-700 tracking-tight">${item.task || item.location || '行程環節'}</p>
                    </div>

                    ${item.spotlight ? `
                    <div class="bg-amber-50/70 border border-amber-100 rounded-[1.5rem] p-4 shadow-sm">
                        <div class="flex items-start gap-2">
                            <span class="text-xs">✨</span>
                            <div>
                                <p class="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Spotlight / 機能</p>
                                <p class="text-xs text-amber-900 font-medium leading-relaxed">${item.spotlight}</p>
                            </div>
                        </div>
                    </div>` : ''}

                    <div class="grid grid-cols-1 gap-2 mx-1">
                        ${item.move ? `
                        <div class="bg-slate-50/50 border border-slate-100/50 rounded-[1.25rem] p-3 flex items-start gap-3">
                            <span class="text-[10px] mt-0.5">📍</span>
                            <div>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">移動方案</p>
                                <p class="text-xs text-slate-600 font-bold leading-tight">${item.move}</p>
                            </div>
                        </div>` : ''}

                        ${item.expense ? `
                        <div class="bg-slate-50/50 border border-slate-100/50 rounded-[1.25rem] p-3 flex justify-between items-center px-4">
                            <div class="flex items-center gap-2">
                                <span class="text-[10px]">💰</span>
                                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest">預估開銷</p>
                            </div>
                            <p class="text-xs font-black theme-text-pink">${item.expense}</p>
                        </div>` : ''}
                    </div>

                    ${item.note ? `
                    <div class="px-2 pt-1">
                        <div class="flex items-start gap-2">
                            <span class="text-[10px] opacity-40">📝</span>
                            <p class="text-[10px] text-slate-400 font-medium italic leading-relaxed">MEMO: ${item.note}</p>
                        </div>
                    </div>` : ''}
                </div>
            `;
        }).join('');

        // 🚀 5. 最終總計：物理對焦視覺重量
        const footerHtml = totalExpense > 0 ? `
            <div class="mt-8 pt-5 border-t-2 border-slate-50 text-right pr-2">
                <p class="text-[10px] font-black text-slate-300 uppercase tracking-tighter italic mb-1">Estimated Total (Avg.)</p>
                <div class="inline-flex items-baseline gap-1">
                    <span class="text-[10px] font-black theme-text-pink">¥</span>
                    <span class="text-xl font-black theme-text-pink tracking-tight">${Math.round(totalExpense).toLocaleString()}</span>
                </div>
            </div>` : '';

        return contentHtml + footerHtml;

    } catch (err) {
        console.error("📋 [Fuel-Error] 解析崩潰:", err);
        return `<div class="p-6 bg-rose-50 border border-rose-100 text-rose-500 text-[11px] rounded-[2rem] leading-relaxed shadow-sm">
                    <div class="flex items-center gap-2 mb-2 font-black">
                        <span class="text-base">⚠️</span> 燃料解析中斷
                    </div>
                    <p class="opacity-80 font-medium">系統偵測到非標準 JSON 結構或代碼截斷。請確保輸入內容以 [ 或 { 開頭。</p>
                </div>`;
    }
},


/** 🛰️ 交通衛星組件：路網解析軌道 (V2026.ULTRA 物理隔離版) */
renderTransportFuel(memo, nodeId = "tf-auto-gen") {
    let t = { operator: "", cost: 0, alerts: [], boarding: [], stops: [], timetable: "", spotlight: "", verifications: [] };
    
    try {
        // 🚀 1. 物理洗滌與燃料提取
        const sanitized = memo
            .replace(/```json/g, '') 
            .replace(/```/g, '')     
            .replace(/[\u200B-\u200D\uFEFF]/g, '') 
            .trim();
        t = JSON.parse(sanitized || "{}");
    } catch (e) {
        return this._renderTransportError(memo);
    }

    // 🚀 2. 數據基因校準 (確保 stops 已執行 [VISIT_STOP] 洗滌與去噪)
    t.stops = this._sanitizeTransportStops(t);
    const timetableUrl = this._normalizeTimetableUrl(t.timetable);

    // 🚀 3. 模組化子任務調度
    const spotlightHtml = this._renderSpotlight(t.spotlight);
    const alertsHtml = this._renderTransportAlerts(t.alerts);
    
    // 💡 職人診斷：SectorSwitch 現在承載了所有的 Timeline 細節
    const sectorSwitchHtml = this._renderSectorSwitchModule(t, timetableUrl, nodeId);
    const verificationHtml = this._renderVerificationModule(t);

    // 🚀 4. 戰術階層噴發 (Tactical Hierarchy Layout)
    return `
        <div class="mt-4 space-y-6 animate-fade-in transport-fuel-container flex flex-col w-full overflow-visible">
            ${spotlightHtml}
            ${alertsHtml}
            
            ${sectorSwitchHtml}
            
            ${verificationHtml}

            <div class="w-full px-1 space-y-4">
                ${this._renderFullRouteDetails(t.stops)}
                ${this._renderTransportFooter(t)}
            </div>
        </div>`;
},

_normalizeTimetableUrl(url) {
    let timetableUrl = String(url || "").trim();
    if (!timetableUrl) return "";
    
    const mdMatch = timetableUrl.match(/\((https?:\/\/[^\)]+)\)/);
    timetableUrl = mdMatch ? mdMatch[1] : (timetableUrl.match(/https?:\/\/[^\s\)]+/) || [timetableUrl])[0];
    timetableUrl = timetableUrl.replace(/[\]\)]+$/, '');
    
    return timetableUrl.startsWith('http') ? timetableUrl : 'https://' + timetableUrl;
},

_renderSectorSwitchModule(t, timetableUrl, nodeId) {
    const boardingHtml = this._renderSectorSwitch(t, nodeId);
    return `
        <div class="w-full px-1 overflow-visible">
            <div class="flex justify-between items-end mb-3 px-1">
                <p class="text-[10px] font-black text-slate-400 uppercase italic tracking-[0.2em] leading-none">📍 Sector Switch</p>
                ${timetableUrl ? `
                    <a href="${timetableUrl}" target="_blank" rel="noopener noreferrer"
                       class="text-[9px] theme-text-pink font-black border-b-2 border-pink-100 pb-0.5 active:scale-95 transition-all leading-none">
                       🔗 官網時刻表
                    </a>` : ''}
            </div>
            <div class="flex flex-col w-full gap-2.5">
                ${boardingHtml}
            </div>
        </div>`;
},

_renderPhysicalTimelineModule(stops) {
    return `
        <div class="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 relative shadow-sm overflow-visible min-h-[140px] w-full">
            <div class="flex justify-between items-center mb-8 px-1">
                <p class="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.2em]">Physical Timeline</p>
                <div class="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse"></div>
            </div>
            <div class="absolute left-[31.5px] sm:left-[39.5px] top-[100px] bottom-[80px] w-[1.5px] bg-slate-50 z-0"></div>
            <div class="dynamic-timeline-area relative z-10 w-full">
                ${this.renderTimelineSegment(stops, 0)} 
            </div>
        </div>`;
},

/** 🛡️ 實體組件：真值驗證軌道 (V2026.ULTRA 物理導航焊接版) */
_renderVerificationModule(t) {
    if (!t.verifications || t.verifications.length === 0) return '';
    
    // 🚀 1. 物理佈局動態自適應
    // 根據驗證連結數量，決定格線寬度比例
    const count = t.verifications.length;
    const gridCols = count === 3 ? 'grid-cols-3' : (count === 2 ? 'grid-cols-2' : 'grid-cols-1');

    return `
        <div class="mt-5 px-1 animate-fade-in">
            <div class="flex items-center gap-2 mb-3 px-1">
                <div class="h-px flex-1 bg-slate-100"></div>
                <p class="text-[9px] font-black text-slate-300 uppercase italic tracking-[0.3em] leading-none shrink-0">Real-time Logic Check</p>
                <div class="h-px flex-1 bg-slate-100"></div>
            </div>

            <div class="grid ${gridCols} gap-2.5 w-full">
                ${t.verifications.map(v => `
                    <a href="${v.url}" target="_blank" 
                       class="group/verif flex flex-col items-center justify-center py-3.5 bg-white border border-slate-100 rounded-[1.5rem] shadow-sm active:scale-95 transition-all hover:border-pink-200 hover:bg-pink-50/30">
                       <span class="text-base mb-1 group-hover/verif:animate-bounce transition-transform">🗺️</span>
                       <span class="text-[9px] font-black theme-text-pink uppercase tracking-tighter">${v.label}</span>
                    </a>
                `).join('')}
            </div>
            
            <div class="mt-3 flex items-center justify-center gap-1.5 opacity-50 px-2">
                <span class="w-1 h-1 rounded-full bg-slate-400"></span>
                <p class="text-[8px] text-slate-400 font-bold italic tracking-tight">
                    PHYSICAL SYNC: 請點擊圖標比對 Google Maps 實境路網與轉乘月台
                </p>
                <span class="w-1 h-1 rounded-full bg-slate-400"></span>
            </div>
        </div>`;
},

/** 🧬 私有子組件：數據洗滌、去噪與里程碑校準 (V2026.ULTRA) */
_sanitizeTransportStops(t) {
    const boardingCount = Math.max(1, t.boarding?.length || 1);
    const maxSegIndex = boardingCount - 1;
    let currentRunningSeg = 0;

    // 🚀 1. 物理去噪協定 (Noise Filtering)
    // 💡 職人診斷：只允許具備戰術價值的里程碑通過
    const allowedTypes = ['dep', 'xfer', 'arr', 'goal', 'hub'];

    return (t.stops || [])
        .map((s) => {
            // A. 類型歸一化
            const item = (typeof s === 'object' && s !== null && s.name) 
                ? { ...s } 
                : { name: String(s || "未命名站點"), type: "station" };
            
            const typeStr = String(item.type || "station").toLowerCase();

            // B. Seg 權重對位
            if (item.seg !== undefined && item.seg !== null) {
                currentRunningSeg = Math.min(Number(item.seg), maxSegIndex);
            } else {
                item.seg = currentRunningSeg;
            }

            // C. 狀態演進 (遇到轉乘點後，下一站索引遞增)
            const isBreakPoint = ['xfer', 'arr'].includes(typeStr);
            const output = { ...item, seg: currentRunningSeg, type: typeStr };
            
            if (isBreakPoint && currentRunningSeg < maxSegIndex) {
                currentRunningSeg++;
            }
            
            return output;
        })
        .filter((item, idx, array) => {
            // 🚀 2. 數據純化熔斷 (Data Purification)
            // 💡 準則：起點與終點必留，其餘站點若非 allowedTypes 則剔除
            if (idx === 0 || idx === array.length - 1) return true;
            
            // 檢查是否為轉乘、抵達或大站
            const isMilestone = allowedTypes.includes(item.type);
            
            // 額外判定：如果名稱包含 Hub 或特定標籤，也視為里程碑
            const isHub = item.name.includes('(Hub)') || item.name.includes('大站');
            
            return isMilestone || isHub;
        });
},


/** 🧬 私有子組件：高品質亮點提示 */
_renderSpotlight(spotlight) {
    if (!spotlight) return '';
    return `
        <div class="bg-amber-50 border border-amber-100 p-4 rounded-[1.8rem] mb-5 animate-fade-in text-left shadow-sm w-full box-border">
            <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                    <span class="text-[10px]">✨</span>
                </div>
                <div class="min-w-0">
                    <p class="text-[9px] font-black text-amber-600 uppercase mb-1 tracking-[0.12em]">Spotlight</p>
                    <p class="text-[11px] text-amber-900 font-bold leading-relaxed">${spotlight}</p>
                </div>
            </div>
        </div>`;
},

/** 🧬 私有子組件：路網警報 */
_renderTransportAlerts(alerts) {
    if (!alerts || alerts.length === 0) return '';
    return `
        <div class="bg-rose-50 border border-rose-100 p-4 rounded-[1.8rem] shadow-sm w-full box-border">
            <p class="text-[9px] font-black text-rose-500 uppercase mb-2 flex items-center gap-1.5 px-1">
                <span class="text-xs animate-pulse">🚨</span> 經營權/票券警報
            </p>
            <ul class="text-[10px] text-slate-600 space-y-1.5 font-medium px-1">
                ${alerts.map(a => `<li class="flex gap-2"><span>•</span><span>${a}</span></li>`).join('')}
            </ul>
        </div>`;
},

/** 🧬 私有子組件：一體化路網展開器 (V2026.ULTRA 標題解封版) */
_renderSectorSwitch(t, nodeId) {
    const safeFuel = encodeURIComponent(JSON.stringify(t));
    
    // 🚀 1. 物理洗滌引擎：封殺 [VISIT_STOP] 等開發冗餘
    const sanitizeTitle = (str) => {
        if (!str) return "";
        return str.replace(/\[VISIT.*?\]/gi, '').replace(/\[.*?\]/g, '').trim();
    };

    // 🚀 2. 多態 Icon 引擎 (維持職人辨識度)
    const getTransportIcon = (text, type) => {
        const str = text.toLowerCase();
        if (str.includes('步行') || str.includes('走路') || type === 'walk') return '🏃';
        if (str.includes('新幹線')) return '🚅';
        if (str.includes('特急')) return '🚆';
        if (str.includes('地下鐵') || str.includes('地鐵')) return '🚇';
        if (str.includes('電車') || str.includes('私鐵') || str.includes('線')) return '🚃';
        if (str.includes('計程車') || str.includes('taxi')) return '🚕';
        if (str.includes('巴士') || str.includes('公車') || type === 'bus') return '🚌';
        return '🚄';
    };

    return (t.boarding || []).map((b, idx) => {
        const rawSegment = typeof b === 'object' ? b.segment : b;
        const segment = sanitizeTitle(rawSegment); // 執行物理洗滌
        
        const type = (typeof b === 'object' && b.type) ? b.type : (segment.includes('巴士') ? 'bus' : 'rail');
        const icon = getTransportIcon(segment, type);
        const sectorDetailHtml = this.renderTimelineSegment(t.stops, idx);
        const isActive = idx === 0; 

        return `
            <div onclick="App.switchTransportSeg(${idx}, this, '${nodeId}')" 
                 data-memo="${safeFuel}"
                 class="seg-btn block w-full mb-6 group animate-fade-in transition-all duration-500 overflow-visible">
                
                <div class="p-6 bg-white rounded-[2.5rem] border-2 shadow-sm transition-all duration-500 relative
                            ${isActive ? 'border-[var(--theme-primary)] ring-4 ring-[var(--theme-shadow)]' : 'border-slate-50 opacity-95'}">
                    
                    <div class="absolute top-8 right-8">
                        <div class="w-3 h-3 rounded-full transition-all duration-500 
                            ${isActive ? 'bg-[var(--theme-primary)] shadow-[0_0_12px_var(--theme-primary)] animate-pulse' : 'bg-slate-200'}"></div>
                    </div>

                    <div class="flex flex-col gap-4 mb-6 pb-5 border-b border-slate-50">
                        <div class="flex items-center gap-3">
                            <div class="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-2xl shrink-0 group-hover:scale-110 transition-transform">
                                ${icon}
                            </div>
                            <div class="flex flex-col">
                                <span class="text-[10px] font-black text-slate-300 uppercase tracking-widest italic">Sector 0${idx + 1}</span>
                                <span class="text-[8px] font-black px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-500 uppercase tracking-tighter w-fit mt-0.5 border border-slate-200">
                                    ${type}
                                </span>
                            </div>
                        </div>

                        <h4 class="text-[18px] font-black text-slate-800 leading-[1.4] break-words pr-8">
                            ${segment}
                        </h4>
                    </div>

                    <div class="sector-internal-content px-1">
                        ${sectorDetailHtml || `<p class="text-[10px] text-slate-300 italic py-2">No detail records for this sector.</p>`}
                    </div>
                </div>
            </div>`;
    }).join('');
},



/** 🧬 私有子組件：全路網細節折疊區 (V2026.ULTRA 純粹去噪版) */
_renderFullRouteDetails(stops) {
    if (!stops || stops.length === 0) return "";

    return `
        <details class="group w-full bg-slate-50/50 rounded-[2.2rem] border border-slate-100 overflow-hidden transition-all shadow-sm">
            <summary class="flex justify-between items-center p-6 cursor-pointer list-none select-none hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-4">
                    <div class="w-9 h-9 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-100">
                        <span class="text-base">🧭</span>
                    </div>
                    <div class="flex flex-col">
                        <span class="text-[12px] font-black text-slate-600 uppercase tracking-widest">全路網數據索引</span>
                        <p class="text-[9px] font-black text-slate-400 opacity-60 uppercase tracking-tighter">Roadmap Index (${stops.length} Nodes)</p>
                    </div>
                </div>
                <span class="text-[10px] text-slate-400 group-open:rotate-180 transition-transform px-2">▼</span>
            </summary>

            <div class="px-6 pb-8 relative bg-white/40 w-full box-border">
                <div class="absolute left-[65px] top-6 bottom-12 w-[1.5px] bg-slate-100/80 z-0"></div>

                ${stops.map((stop, idx) => {
                    const isTransfer = ['xfer', 'arr'].includes(String(stop.type).toLowerCase());
                    const isStart = idx === 0;
                    
                    return `
                    <div class="flex items-center gap-5 relative z-10 w-full py-5">
                        <div class="flex items-center justify-end gap-3 w-[75px] shrink-0">
                            <span class="text-[11px] font-black theme-text-pink tabular-nums tracking-tighter">
                                ${stop.time || '--:--'}
                            </span>
                            <div class="w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm transition-all
                                ${isTransfer || isStart ? 'bg-[var(--theme-primary)] scale-110 shadow-pink-100' : 'bg-slate-300'}">
                            </div>
                        </div>

                        <div class="flex-1 min-w-0 flex items-center gap-2">
                            <h5 class="text-[15px] font-bold text-slate-700 leading-tight break-words">
                                ${stop.name}
                            </h5>
                            <span class="text-[8px] font-black text-slate-300 bg-slate-50 px-2 py-0.5 rounded italic shrink-0 border border-slate-100/50">
                                S${stop.seg}
                            </span>
                        </div>
                    </div>
                    ${idx < stops.length - 1 ? '<div class="h-px bg-slate-50 ml-[75px] mr-2"></div>' : ''}
                `;}).join('')}
            </div>
        </details>`;
},

/** 🧬 私有子組件：底部資訊區 (V2026.ULTRA 極簡真值版) */
_renderTransportFooter(t) {
    if (!t || !t.cost) return "";
    const totalCost = Math.round(t.cost).toLocaleString();

    return `
        <div class="mt-4 flex flex-col items-end w-full animate-fade-in pr-2">
            <div class="flex flex-col items-end">
                <span class="text-[9px] font-black text-slate-400 uppercase italic tracking-widest mb-1 opacity-70">
                    Est. Total
                </span>
                <p class="text-[32px] font-black theme-text-pink leading-none tabular-nums tracking-tighter">
                    <span class="text-[14px] mr-1 opacity-60 font-black">¥</span>${totalCost}
                </p>
            </div>
            
            <p class="mt-3 text-[8px] text-slate-400 font-black uppercase tracking-tighter opacity-50">
                ※ 費用僅供參考，以現場感應為準
            </p>
        </div>
    `;
},

/** 🧬 私有子組件：錯誤回退 */
_renderTransportError(memo) {
    return `
        <div class="mt-3 bg-emerald-50/50 border border-emerald-100 p-5 rounded-[1.8rem] flex items-start gap-3 animate-fade-in">
            <span class="text-xl">🚌</span>
            <p class="text-[11px] text-emerald-800 font-bold leading-relaxed whitespace-pre-line">${memo || '數據對焦中...'}</p>
        </div>`;
},


/** 🧬 局部渲染引擎：橫向對焦與空間壓縮 (V2026.ULTRA) */
renderTimelineSegment(allStops, targetSegIndex) {
    if (!allStops || !Array.isArray(allStops) || allStops.length === 0) return "";

    const filtered = allStops.filter(s => Number(s.seg) === Number(targetSegIndex));
    if (filtered.length === 0) return "";

    const sanitize = (str) => (str || "").replace(/\[VISIT.*?\]/gi, '').replace(/\[.*?\]/g, '').trim();

    return filtered.map((stop, idx) => {
        const name = sanitize(stop.name);
        const { time = "", type, note = "", seg } = stop;
        
        let noteStyle = "bg-slate-50/60 border-slate-200 text-slate-700";
        if (note.includes('⚠️')) {
            noteStyle = "bg-amber-50 border-amber-200 text-amber-950 ring-1 ring-amber-100";
        } else if (note.includes('📍') || note.includes('出口') || note.includes('🚀')) {
            noteStyle = "bg-blue-50 border-blue-200 text-blue-950 ring-1 ring-blue-100";
        }

        return `
            <div class="flex flex-col gap-3 ${idx > 0 ? 'mt-10 pt-8 border-t border-slate-50' : 'mt-2'} animate-fade-in w-full overflow-visible">
                
                <div class="flex flex-col px-1">
                    <div class="flex items-center gap-3 mb-1">
                        <span class="text-[9px] font-black text-slate-500 bg-slate-100 px-2 py-0.5 rounded italic tracking-tighter">
                            S${seg}
                        </span>
                        ${type === 'xfer' ? `<span class="text-[7px] bg-slate-800 text-white px-2 py-0.5 rounded font-black uppercase tracking-widest shrink-0">TRANSFER</span>` : ''}
                    </div>

                    <div class="flex items-baseline gap-4 w-full">
                        <div class="shrink-0 min-w-[55px]">
                            <p class="text-[16px] font-black theme-text-pink tabular-nums italic tracking-tighter">
                                ${time}
                            </p>
                        </div>
                        
                        <h4 class="text-[18px] font-black tracking-tight text-slate-900 leading-[1.4] flex-1 break-words">
                            ${name}
                        </h4>
                    </div>
                </div>
                
                ${note ? `
                    <div class="${noteStyle} p-5 rounded-[1.8rem] border-2 transition-all duration-300 w-full box-border shadow-sm">
                        <p class="text-[14px] font-bold leading-[1.7] break-words antialiased select-text">
                            ${note}
                        </p>
                    </div>
                ` : ''}
                
            </div>`;
    }).join('');
},

/** 🛍️ [Fuel Sub-Engine] 購物燃料渲染器 (V2026.ULTRA 主題配色版) */
_renderShoppingFuelCards(item, dayIndex, itemIndex) {
    let products = [];
    const tripId = state.activeTripId; 
    
    try {
        products = JSON.parse(item.memo || "[]");
    } catch (e) { 
        return `<p class="text-[10px] text-rose-400 italic px-2 py-4">⚠️ 數據燃料損毀</p>`; 
    }

    const nodeTotal = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);

    return `
        <div class="mt-4 space-y-4 animate-fade-in">
            <div class="flex justify-between items-end px-2 mb-2 border-b border-slate-100/80 pb-2.5">
                <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest italic font-mono">Inventory Ledger</p>
                <div class="text-right">
                    <p class="text-[16px] font-black theme-text-pink tabular-nums">¥${nodeTotal.toLocaleString()}</p>
                </div>
            </div>

            <div class="space-y-5">
                ${products.map((p, pIdx) => {
                    const isChecked = p.checked === true;
                    const searchAnchor = encodeURIComponent(`${p.store} ${p.name} ${item.location || ''} Japan`);
                    // 修正拼接符號，確保導通
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchAnchor}`;
                    const imgSearchQuery = encodeURIComponent(p.image_query || `${p.store} ${p.name}`);
                    const googleImageUrl = `https://www.google.com/search?tbm=isch&q=${imgSearchQuery}`;
                    
                    return `
                    <div class="flex flex-col gap-3.5 p-5 ${isChecked ? 'bg-slate-50/40' : 'bg-slate-50/80'} rounded-[2.2rem] border ${isChecked ? 'border-slate-100' : 'border-slate-200/60'} transition-all duration-500 shadow-sm relative overflow-hidden">
                        
                        <div class="flex items-start gap-4">
                            <div onclick="App.toggleShoppingCheck('${tripId}', ${dayIndex}, ${itemIndex}, ${pIdx})" 
                                 class="mt-1 w-6 h-6 shrink-0 rounded-xl border-2 flex items-center justify-center transition-all cursor-pointer ${isChecked ? 'theme-bg border-transparent shadow-lg shadow-pink-100 scale-95' : 'border-slate-300 bg-white hover:border-pink-300'}">
                                ${isChecked ? '<svg class="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4"><path d="M5 13l4 4L19 7"></path></svg>' : ''}
                            </div>

                            <div class="flex-1 min-w-0">
                                <a href="${googleImageUrl}" target="_blank" class="block group/title">
                                    <h5 class="text-[14px] font-black text-slate-700 leading-tight ${isChecked ? 'line-through opacity-30 italic' : 'group-hover/title:theme-text-pink'} transition-colors truncate">
                                        ${p.name}
                                    </h5>
                                    <p class="text-[10px] text-slate-400 font-bold mt-0.5 truncate ${isChecked ? 'opacity-20' : ''}">${p.name_jp || ''}</p>
                                </a>
                            </div>

                            <div class="text-right shrink-0">
                                <p class="text-[13px] font-black text-slate-600 tabular-nums ${isChecked ? 'opacity-30' : ''}">¥${(Number(p.price) || 0).toLocaleString()}</p>
                                <p class="text-[9px] font-black text-slate-300 uppercase tracking-tighter">QTY ${p.quantity || 1}</p>
                            </div>
                        </div>

                        ${p.info ? `
                        <div class="ml-10">
                            <div class="bg-white/90 rounded-2xl p-3.5 border border-slate-100/80 relative overflow-hidden shadow-[inset_0_1px_2px_rgba(0,0,0,0.02)]">
                                <div class="absolute left-0 top-0 w-1 h-full theme-bg opacity-40"></div>
                                <p class="text-[11px] leading-relaxed text-slate-500 font-medium italic break-words">
                                    ${p.info}
                                </p>
                            </div>
                        </div>
                        ` : ''}

                        <div class="ml-10 flex flex-wrap gap-2">
                            <a href="${googleMapsUrl}" target="_blank" 
                               class="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200/80 rounded-xl shadow-sm hover:border-pink-200 hover:bg-pink-50/30 transition-all active:scale-95 group/map max-w-full">
                                
                                <svg class="w-4 h-4 shrink-0 transition-colors ${isChecked ? 'text-slate-300 opacity-50' : 'theme-text-pink'}" 
                                     fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-12-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
                                </svg>
                                
                                <span class="text-[11px] font-black text-slate-600 group-hover/map:theme-text-pink truncate">
                                    ${p.store || '定位商店'}
                                </span>
                            </a>
                        </div>
                    </div>
                    `}).join('')}
            </div>
        </div>`;
},


// ============================================================
// Backlog 相關渲染引擎
// ============================================================


/** 🏭 [Refinery-Main] 備選精煉廠主進入點 (雙端分頁與搜尋焦點優化版) */
renderBacklogPage(container, backlogs) {
    if (!state.backlogContext) state.backlogContext = { page: 1, searchQuery: '' };

    // 🚀 1. 執行數據過濾與分頁計算
    const { pagedItems, totalPages, currentPage, totalItems } = App.getFilteredBacklogs(backlogs);
    
    // 🚀 2. 焦點記憶協定：截取目前輸入狀態，防止重繪時光標遺失
    const searchInputEl = document.getElementById('backlog-search-input');
    const isSearchFocused = document.activeElement === searchInputEl;
    const cursorStart = searchInputEl ? searchInputEl.selectionStart : 0;

    // 數據快照提取
    const cities = [...new Set(backlogs.map(b => b.city))].sort();
    const activeCity = localStorage.getItem('tf_backlog_city_focus') || '全部';
    const activeCat = localStorage.getItem('tf_backlog_cat_focus') || '全部';

    // 🚀 3. 組件全量噴發
    container.innerHTML = `
        <div class="px-6 pt-4 pb-32 animate-fade-in space-y-6">
            ${this._renderBacklogHeader()}
            
            <div class="px-2">
                <div class="relative group">
                    <input type="text" id="backlog-search-input"
                           oninput="App.searchBacklog(this.value)" 
                           value="${state.backlogContext.searchQuery}"
                           placeholder="搜尋靈感標題..." 
                           class="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-[14px] font-black text-slate-900 focus:ring-2 focus:ring-pink-100 outline-none shadow-inner transition-all">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-lg">🔍</span>
                </div>
            </div>

            ${this._renderBacklogNav(cities, activeCity, activeCat)}
            
            ${this._renderBacklogPagination(currentPage, totalPages, totalItems, 'top')}

            <div id="backlog-cards-sector" class="space-y-4 min-h-[300px]">
                ${pagedItems.length > 0 
                    ? pagedItems.map(item => this._renderBacklogCard(item)).join('') 
                    : `<div class="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">No Cargo in this sector</div>`}
            </div>

            ${this._renderBacklogPagination(currentPage, totalPages, totalItems, 'bottom')}
        </div>
        ${this._renderBacklogFAB()}
    `;

    // 🚀 4. 物理對焦還原程序
    requestAnimationFrame(() => {
        // A. 恢復搜尋框焦點與光標位置 (確保搜尋不因重繪而中斷)
        const newSearchInput = document.getElementById('backlog-search-input');
        if (newSearchInput && isSearchFocused) {
            newSearchInput.focus();
            newSearchInput.setSelectionRange(cursorStart, cursorStart);
        }
        // B. 恢復 FAB 隱顯狀態
        if (typeof this.updateRefineryFAB === 'function') this.updateRefineryFAB();
    });
},

/** 📑 [Sub-Component] 渲染分頁指示器 (雙向對稱佈署版) */
_renderBacklogPagination(current, total, totalItems, position) {
    if (total <= 1) return ''; 
    
    // 🚀 針對不同物理位置微調邊距語彙
    // 上端分頁使用較緊湊的 mb-2；下端分頁維持標準分隔線
    const marginClass = position === 'top' ? 'mb-2' : 'mt-10 pt-6 border-t border-slate-50';

    return `
        <div class="flex flex-col items-center gap-4 ${marginClass} animate-fade-in">
            <div class="flex items-center gap-3">
                <button onclick="App.setBacklogPage(${current - 1})" ${current === 1 ? 'disabled' : ''}
                        class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-lg text-slate-400 disabled:opacity-10 active:scale-90 transition-all">‹</button>
                
                <div class="flex gap-2 px-1 items-center">
                    ${Array.from({length: total}, (_, i) => i + 1).map(p => `
                        <button onclick="App.setBacklogPage(${p})" 
                                class="h-1.5 rounded-full transition-all duration-500 ${p === current ? 'theme-bg w-6 shadow-lg shadow-pink-100' : 'bg-slate-200 w-1.5'}"></button>
                    `).join('')}
                </div>

                <button onclick="App.setBacklogPage(${current + 1})" ${current === total ? 'disabled' : ''}
                        class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-lg text-slate-400 disabled:opacity-10 active:scale-90 transition-all">›</button>
            </div>
            ${position === 'bottom' ? `<p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Sector Page ${current} of ${total}</p>` : ''}
        </div>
    `;
},


/** 🧪 [Sub-Component] 渲染精煉廠頭部 (V2026.ULTRA 狀態同步版) */
_renderBacklogHeader() {
    return `
        <div class="px-6 pt-4 pb-2 animate-fade-in">
            <div class="flex justify-between items-end mb-6">
                <div>
                    <h2 class="text-2xl font-black text-slate-800 tracking-tighter">靈感匯聚</h2>
                    <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Atomic Refinery V2026</p>
                </div>
                <div class="flex gap-3">
                    <button onclick="App.probeRefineryStatus()" 
                            class="w-10 h-10 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center border border-slate-100 active:scale-90 transition-all hover:text-pink-500 hover:border-pink-100 shadow-sm">
                        <span class="text-lg font-bold">↺</span>
                    </button>
                    
                    <button onclick="App.modalCreate('add-backlog-modal', '📍 採集新靈感', viewEngine._renderAddBacklogForm(), viewEngine._renderAddBacklogActions())" 
                            class="w-10 h-10 theme-bg text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100 active:scale-90 transition-all">
                        <span class="text-xl font-bold">+</span>
                    </button>
                </div>
            </div>
        </div>`;
},


/** 🧪 [Sub-Component] 渲染雙軌導航 Tabs - V2026.ULTRA 靜默對焦版 */
_renderBacklogNav(cities, activeCity, activeCat) {
    const categories = ['全部', '食', '玩', '購', '行', '住', '醫'];
    const iconMap = { '全部': '🌈', '食': '☕', '玩': '🎡', '購': '🛍️', '行': '🚌', '住': '🏨', '醫': '🏥' };

    return `
        <div class="px-6 space-y-4 mb-2 animate-fade-in">
            <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button onclick="App.filterBacklogByCity('全部')" 
                        class="shrink-0 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${activeCity === '全部' ? 'theme-bg text-white shadow-md' : 'bg-slate-50 text-slate-400'}">
                    🌐 全部區域
                </button>
                ${cities.map(city => `
                    <button onclick="App.filterBacklogByCity('${city}')" 
                            class="shrink-0 px-4 py-2 rounded-xl text-[11px] font-black transition-all ${activeCity === city ? 'theme-bg text-white shadow-md' : 'bg-slate-50 text-slate-400'}">
                        📍 ${city}
                    </button>
                `).join('')}
            </div>

            <div class="flex gap-2 overflow-x-auto no-scrollbar pb-4 border-b border-slate-50">
                ${categories.map(cat => `
                    <button onclick="App.filterBacklogByCat('${cat}')" 
                            class="shrink-0 flex items-center gap-1.5 px-3 py-1.5 border rounded-full transition-all ${activeCat === cat ? 'border-pink-200 bg-pink-50 text-pink-600 shadow-sm' : 'border-slate-100 bg-white text-slate-400'}">
                        <span class="text-xs">${iconMap[cat]}</span>
                        <span class="text-[11px] font-black">${cat}</span>
                    </button>
                `).join('')}
            </div>
        </div>`;
},


/** 🧪 [Sub-Component] 渲染燃料清單主體 */
_renderBacklogList(filtered, activeCity, activeCat) {
    if (filtered.length === 0) {
        return `
            <div class="py-24 text-center opacity-30 animate-fade-in px-10">
                <div class="text-5xl mb-6">🔍</div>
                <p class="text-xs font-bold tracking-[0.2em] leading-relaxed">
                    在「${activeCity}」磁區中<br>未偵測到「${activeCat}」相關燃料
                </p>
            </div>`;
    }

    return `
        <div class="grid grid-cols-1 gap-4 px-6 pb-32 animate-fade-in" id="backlog-list-container">
            ${filtered.map(item => this._renderBacklogCard(item)).join('')}
        </div>`;
},


/** 🧬 [Logic] 深度感應探針：語義權重加固版 (V2026.ULTRA.FINAL) */
_calculateProjectedDays(backlogName) {
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    if (!activeTrip || !backlogName) return [];

    // 🚀 1. 指紋洗滌引擎：洗掉裝飾，只留核心基因
    const wash = (str) => (str || "")
        .toLowerCase()
        .replace(/【.*?】/g, '') // 切除 AI 裝飾標籤
        .replace(/京都|東京|名古屋|大阪|福岡/g, '') // 💡 關鍵：比對時暫時忽略城市名，解決地名偏移
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
        .trim();

    const backlogFingerprint = wash(backlogName);
    const projectedDays = [];

    // 🚀 2. 探針定義
    const isHit = (targetName) => {
        const targetFingerprint = wash(targetName);
        if (!targetFingerprint || !backlogFingerprint) return false;
        
        // 💡 職人診斷：執行「指紋重疊判定」
        return targetFingerprint.includes(backlogFingerprint) || 
               backlogFingerprint.includes(targetFingerprint);
    };

    // 🚀 3. 物理穿透掃描
    activeTrip.days.forEach((day, index) => {
        const hasMatch = day.schedules?.some(s => {
            // A 軌道：大標題掃描
            if (isHit(s.location) || isHit(s.task)) return true;
            
            // B 軌道：🚀 穿透 JSON 燃料 (包含整合包內的 memo)
            if (s.style === 'json' && s.memo) {
                try {
                    const inner = JSON.parse(s.memo);
                    const nodesArray = Array.isArray(inner) ? inner : (inner.timeline || inner.stops || [inner]);
                    // 掃描子項目的 task, location, name
                    return nodesArray.some(n => isHit(n.task) || isHit(n.location) || isHit(n.name));
                } catch (e) { return false; }
            }
            return false;
        });
        if (hasMatch) projectedDays.push(index + 1);
    });

    return projectedDays;
},


/** 🎨 [UI Component] 渲染天數註記標籤組 (排序對焦版) */
_renderBacklogBadges(days) {
    if (!days || days.length === 0) return '';
    
    // 💡 職人邏輯：先排序天數，確保顯示為 D1, D2, D6...
    return days.sort((a, b) => a - b).map(d => `
        <div class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black italic border border-slate-200/50 shadow-sm animate-fade-in flex-none tabular-nums">
            D${d}
        </div>
    `).join('');
},

/** 🧪 [Main-Component] 渲染單一原子燃料卡片 (標題強化與高對比色版) */
_renderBacklogCard(item) {
    const projectedDays = this._calculateProjectedDays(item.name);
    const isProjected = projectedDays.length > 0;
    
    // 🚀 1. 視覺狀態與顏色對焦
    // 💡 職人提醒：待匯入狀態改用 text-slate-900 達成最高對比度
    const stateStyles = isProjected ? 'ring-2 ring-pink-50 shadow-sm' : 'hover:shadow-md cursor-pointer';
    const statusText = isProjected ? '已匯入行程' : '待匯入靈感';
    const statusColor = isProjected ? 'theme-text-pink' : 'text-slate-900';

    // 🚀 2. 標籤物理歸一協定 (高度鎖定 28px)
    const tagBaseClass = "h-7 px-2.5 flex items-center justify-center rounded-lg text-[12px] italic font-black uppercase tracking-wider shadow-sm transition-all";
    const tagTextColor = "text-slate-600";

    return `
        <div class="backlog-card group relative bg-white p-7 rounded-[2.5rem] active:scale-[0.98] transition-all border border-slate-50 ${stateStyles}" 
             id="card-${item.id}" 
             onclick="viewEngine.toggleBacklogSelect('${item.id}')">
            
            <div class="select-indicator absolute top-7 left-7 w-7 h-7 rounded-full border-2 border-slate-100 flex items-center justify-center transition-all bg-white z-10">
                <div class="w-3.5 h-3.5 rounded-full theme-bg transition-all scale-0 shadow-sm shadow-pink-200"></div>
            </div>

            <div class="pl-12 space-y-3">
                <div class="flex justify-between items-start">
                    <h3 class="font-black text-slate-800 text-[16px] leading-tight tracking-tight">${item.name}</h3>
                </div>

                <div class="flex flex-wrap items-center gap-2 py-0.5">
                    <div class="${tagBaseClass} bg-slate-100 ${tagTextColor} border border-slate-200/50">
                        ${item.category || '食'}
                    </div>
                    <div class="flex gap-2">
                        ${(projectedDays || []).map(day => `
                            <div class="${tagBaseClass} bg-slate-100 ${tagTextColor} border border-slate-200/50">
                                D${day}
                            </div>
                        `).join('')}
                    </div>
                </div>

                ${(item.info && item.info !== '批量精煉匯入' && item.info !== '批量注入') ? `
                <div class="space-y-1">
                    <p class="text-[12px] font-bold theme-text-pink leading-relaxed">${item.info}</p>
                </div>` : ''}

                <div class="pt-3 border-t border-slate-100/50 flex flex-col gap-1.5">
                    <div class="flex items-center gap-2.5">
                        <span class="text-sm">📍</span>
                        <span class="text-[12px] font-black text-slate-500 tracking-wide">${item.city}</span>
                    </div>
                    
                    <div class="flex items-center gap-1.5 transition-opacity ${isProjected ? 'opacity-100' : 'opacity-30'}">
                        <span class="text-[12px] font-black italic tracking-[0.1em] ${statusColor}">
                            ${statusText}
                        </span>
                    </div>
                </div>
            </div>
            
            <div class="absolute right-6 bottom-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all translate-y-2 group-hover:translate-y-0">
                <button onclick="event.stopPropagation(); App.editBacklogItem('${item.id}')" 
                        class="w-10 h-10 bg-slate-800 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all hover:bg-slate-700">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>

                <button onclick="event.stopPropagation(); App.deleteBacklogItem('${item.id}')" 
                        class="w-10 h-10 bg-white text-slate-300 rounded-2xl flex items-center justify-center border border-slate-100 shadow-sm active:scale-90 transition-all hover:text-rose-400">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            </div>
        </div>`;
},



/** 🧪 [Sub-Component] 渲染懸浮投射按鈕 (FAB) - 徹底封殺幽靈體感版 */
_renderBacklogFAB() {
    return `
        <div id="refinery-fab" 
             class="fixed bottom-28 right-6 translate-y-20 opacity-0 pointer-events-none transition-all duration-500 ease-out z-[4000]">
             <button onclick="viewEngine.triggerProjection()" 
                    class="flex items-center gap-3 px-6 py-4 theme-bg text-white rounded-full font-black text-xs shadow-2xl shadow-pink-200 active:scale-95">
                <span class="text-lg">🏭</span>
                <span id="select-count">已選取 0 項</span>
                <span class="opacity-50">|</span>
                <span>精煉投射</span>
            </button>
        </div>`;
},


/** 🔄 [Refinery-Internal] 切換選取狀態與物理反饋 */
toggleBacklogSelect(id) {
    const card = document.getElementById(`card-${id}`);
    if (!card) return;

    const isActive = card.classList.toggle('selected');
    const indicator = card.querySelector('.select-indicator');
    const dot = indicator.querySelector('div');

    if (isActive) {
        card.classList.replace('border-slate-100', 'border-pink-200');
        card.classList.add('bg-pink-50/30');
        indicator.classList.replace('border-slate-100', 'theme-bg');
        dot.classList.replace('scale-0', 'scale-100');
    } else {
        card.classList.replace('border-pink-200', 'border-slate-100');
        card.classList.remove('bg-pink-50/30');
        indicator.classList.replace('theme-bg', 'border-slate-100');
        dot.classList.replace('scale-100', 'scale-0');
    }

    // 🚀 更新 FAB 狀態
    this.updateRefineryFAB();
    if (navigator.vibrate) navigator.vibrate(5);
},

/** 📊 [加固版] 更新投射按鈕狀態 */
updateRefineryFAB() {
    const fab = document.getElementById('refinery-fab');
    if (!fab) return; // 🛡️ 沒找到節點就靜默斷路，不准噴 Error

    const selectedCards = document.querySelectorAll('.backlog-card.selected');
    const selectCountEl = document.getElementById('select-count');

    if (selectedCards.length > 0) {
        // 🚀 導通狀態：升起並啟用
        fab.style.transform = 'translateY(0)';
        fab.style.opacity = '1';
        fab.style.pointerEvents = 'auto';
        if (selectCountEl) {
            selectCountEl.innerText = `已選取 ${selectedCards.length} 項`;
        }
    } else {
        // 🚀 斷路狀態：沉降至視界外 (加大位移確保徹底消失)
        fab.style.transform = 'translateY(160px)'; 
        fab.style.opacity = '0';
        fab.style.pointerEvents = 'none';
    }
},

/** 🚀 [Refinery-Main] 觸發精煉中繼程序 (V2026.ULTRA V2.0 版) */
triggerProjection() {
    const selectedIds = Array.from(document.querySelectorAll('.backlog-card.selected'))
                             .map(el => el.id.replace('card-', ''));
    
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return uiManager.showToast('⚠️', '請先開啟任一行程以定位投射目標');

    const primaryCity = trip.city || "日本";
    const idsJson = JSON.stringify(selectedIds).replace(/"/g, '&quot;');

    // 🚀 核心導通：呼叫重構後的內容生成器
    const content = this._renderRefineryStation(primaryCity, idsJson);

    modalEngine.create('refinery-station-modal', '🏭 原子精煉中繼站', content, '');
    
    // 💡 點火初始化模式
    requestAnimationFrame(() => {
        const savedMode = localStorage.getItem('tf_refinery_mode') || 'split';
        this.setRefineryMode(savedMode);
    });
},

/** 🧪 [Sub-Component] 渲染精煉中繼站 (V2.1 垂直階梯對焦版) */
_renderRefineryStation(city, idsJson) {
    // 🚀 數據前檢：獲取當前行程的天數燃料
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    const dayButtons = activeTrip ? activeTrip.days.map((d, i) => `
        <button onclick="App.executeRefineryProjection('${idsJson}', ${i})" 
                class="py-4 bg-white border border-slate-100 rounded-2xl font-black text-xs text-slate-400 hover:theme-bg hover:text-white hover:border-transparent active:scale-95 transition-all shadow-sm">
            D${i+1}
        </button>
    `).join('') : '';

    return `
        <div class="space-y-8 text-left animate-fade-in pb-6">
            
            <div class="space-y-3">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Step 1. 靈感匯入模式</label>
                <div class="bg-slate-100 p-1.5 rounded-[2rem] flex items-center border border-slate-200/50 shadow-inner">
                    <button onclick="viewEngine.setRefineryMode('split')" id="mode-split" 
                            class="flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300">
                        <span class="mr-1">🧩</span> 個體轉入
                    </button>
                    <button onclick="viewEngine.setRefineryMode('suite')" id="mode-suite" 
                            class="flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300">
                        <span class="mr-1">📦</span> 整合套裝
                    </button>
                </div>
            </div>

            <div class="space-y-4">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Step 2. 獲取 AI 數據指令</label>
                <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div class="min-w-0 px-1">
                        <p class="text-[11px] text-slate-500 font-bold leading-relaxed">
                            系統將根據上方模式自動合成指令。<br>
                            請複製後貼給 AI 以換取高品質 JSON 燃料。
                        </p>
                        <p class="text-[10px] theme-text-pink font-black mt-2 uppercase tracking-tighter italic" id="refinery-mode-hint">
                            LOADING MODE STATUS...
                        </p>
                    </div>
                    <button onclick="backlogManager.copyRefineryPrompt('${city}', '${idsJson}')" 
                            class="w-full theme-bg text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span>✨</span> 複製 PROMPT 指令
                    </button>
                </div>
            </div>

            <div class="space-y-3">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Step 3. 注入 AI 回應燃料</label>
                <textarea id="refinery-json-input" 
                    class="w-full h-40 bg-slate-50 border-none rounded-[2.2rem] p-6 text-[11px] font-mono theme-text-pink focus:ring-2 focus:ring-pink-100 outline-none custom-scrollbar shadow-inner" 
                    placeholder="在此貼上 AI 生成的 JSON 內容..."></textarea>
            </div>

            <div class="space-y-4">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Step 4. 執行物理投射日期</label>
                <div class="grid grid-cols-4 gap-2.5">
                    ${dayButtons}
                </div>
            </div>
        </div>`;
},

/** 🎨 介面連動：切換精煉模式 (肥大版對焦) */
setRefineryMode(mode) {
    const isSplit = mode === 'split';
    localStorage.setItem('tf_refinery_mode', mode);
    
    const btnSplit = document.getElementById('mode-split');
    const btnSuite = document.getElementById('mode-suite');

    if (!btnSplit || !btnSuite) return;

    if (isSplit) {
        // 單獨模式亮起
        btnSplit.className = "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 bg-white shadow-md theme-text-pink";
        btnSuite.className = "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 text-slate-400";
    } else {
        // 整合模式亮起
        btnSuite.className = "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 bg-white shadow-md theme-text-pink";
        btnSplit.className = "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 text-slate-400";
    }
    
    if (navigator.vibrate) navigator.vibrate(8);
},

/** 🧪 [Refinery-UI] 渲染採集表單 (結構修正與主題對焦版) */
_renderAddBacklogForm() {
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    const activeCity = activeTrip?.city || "";
    const themeColor = activeTrip?.color || 'var(--theme-primary)'; 
    const categories = ['食', '玩', '購', '行', '住', '醫'];

    // 🚀 1. 注入動態樣式軌道 (確保 peer-checked 100% 點火主題色)
    const dynamicStyle = `
        <style>
            #backlog-cat-selector input:checked + div {
                background-color: ${themeColor} !important;
                color: white !important;
                box-shadow: 0 10px 15px -3px ${themeColor}44 !important;
            }
        </style>
    `;

    return `
        <div class="space-y-8 text-left pb-4 animate-fade-in">
            ${dynamicStyle}
            
            <div class="flex justify-between items-center mb-2">
                <label class="text-[14px] font-black text-slate-900 uppercase tracking-widest px-1">注入模式</label>
                <div class="flex bg-slate-100 p-1.5 rounded-2xl gap-1">
                    <button onclick="viewEngine.toggleImportMode('single')" id="mode-single" 
                            class="px-5 py-2 bg-white rounded-xl text-[14px] font-black shadow-sm transition-all text-slate-900">單筆採集</button>
                    <button onclick="viewEngine.toggleImportMode('batch')" id="mode-batch" 
                            class="px-5 py-2 rounded-xl text-[14px] font-black text-slate-400 transition-all">批量注入</button>
                </div>
            </div>

            <div class="space-y-4">
                <label class="text-[14px] font-black text-slate-900 uppercase tracking-widest px-1">數據屬性</label>
                <div class="flex flex-wrap gap-3" id="backlog-cat-selector">
                    ${categories.map(cat => `
                        <label class="cursor-pointer">
                            <input type="radio" name="backlog-cat" value="${cat}" class="hidden" ${cat === '食' ? 'checked' : ''}>
                            <div class="px-6 py-3 bg-slate-100 rounded-2xl text-[16px] font-black text-slate-900 border-2 border-transparent transition-all">
                                ${cat}
                            </div>
                        </label>
                    `).join('')}
                </div>
            </div>

            <div id="import-single-container" class="space-y-6">
                <div class="space-y-2">
                    <label class="text-[14px] font-black text-slate-900 uppercase tracking-widest px-1">店名 / 景點名稱</label>
                    <input type="text" id="backlog-name" placeholder="例如：FUGLEN FUKUOKA" 
                           class="w-full bg-slate-50 border-none rounded-[1.8rem] p-5 font-black text-[16px] text-slate-900 focus:ring-2 focus:ring-pink-100 outline-none shadow-inner transition-all">
                </div>
                <div class="grid grid-cols-2 gap-4">
                    <div class="space-y-2">
                        <label class="text-[14px] font-black text-slate-900 uppercase tracking-widest px-1">城市區域</label>
                        <input type="text" id="backlog-city" value="${activeCity}" 
                               class="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-black text-[16px] text-slate-900 outline-none shadow-inner">
                    </div>
                    <div class="space-y-2">
                        <label class="text-[14px] font-black text-slate-900 uppercase tracking-widest px-1">註記</label>
                        <input type="text" id="backlog-info" placeholder="位置或特色" 
                               class="w-full bg-slate-50 border-none rounded-[1.5rem] p-5 font-black text-[16px] text-slate-900 outline-none shadow-inner">
                    </div>
                </div>
            </div>

            <div id="import-batch-container" class="hidden space-y-4">
                <label class="text-[14px] font-black text-slate-900 uppercase tracking-widest px-1 mb-2 block">多筆靈感 (一行一筆)</label>
                <textarea id="backlog-batch-input" rows="6" 
                          placeholder="範例:\n京都 Weekenders\n京都 Harbs藤井大丸店\n京都 二條城"
                          class="w-full bg-slate-50 border-none rounded-[2rem] p-6 font-black text-[16px] text-slate-900 focus:ring-2 focus:ring-pink-100 outline-none shadow-inner leading-relaxed custom-scrollbar"></textarea>
            </div>
        </div>`;
},

/** 🎨 [Visual-Logic] 切換採集模式 (V2026.ULTRA 強健加固版) */
toggleImportMode(mode) {
    const single = document.getElementById('import-single-container');
    const batch = document.getElementById('import-batch-container');
    const btnS = document.getElementById('mode-single');
    const btnB = document.getElementById('mode-batch');

    // 🛡️ 物理防禦：如果容器不存在，直接中斷點火防止崩潰
    if (!single || !batch) {
        console.warn("⚠️ [UI-Wait] 輸入容器尚未掛載，攔截切換指令");
        return;
    }

    if (mode === 'batch') {
        single.classList.add('hidden');
        batch.classList.remove('hidden');
        btnB.classList.add('bg-white', 'shadow-sm');
        btnB.classList.remove('text-slate-400');
        btnS.classList.remove('bg-white', 'shadow-sm');
        btnS.classList.add('text-slate-400');
    } else {
        batch.classList.add('hidden');
        single.classList.remove('hidden');
        btnS.classList.add('bg-white', 'shadow-sm');
        btnS.classList.remove('text-slate-400');
        btnB.classList.remove('bg-white', 'shadow-sm');
        btnB.classList.add('text-slate-400');
    }

    // 🚀 [物理修正]：改用彈性定位，封殺 TypeError
    // 直接找最近的父層 space-y-5 容器來存放狀態
    const stateContainer = single.closest('.space-y-5');
    if (stateContainer) {
        stateContainer.dataset.importMode = mode;
    }
},


/** 🚀 [Refactor] 採集動作：導入中央分流按鈕 */
_renderAddBacklogActions() {
    return `
        <button onclick="App.modalRemove('add-backlog-modal')" 
                class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
        <button onclick="viewEngine.handleBacklogSubmission()" 
                class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">
            儲存靈感
        </button>
    `;
},

/** 🧪 [Refinery-Internal] 處理採集提交 (模式分流) */
handleBacklogSubmission() {
    const batchContainer = document.getElementById('import-batch-container');
    const isBatch = batchContainer && !batchContainer.classList.contains('hidden');

    if (isBatch) {
        // 🚀 執行批量注入
        const rawText = document.getElementById('backlog-batch-input').value.trim();
        const city = document.getElementById('backlog-city').value || '未分類';
        const cat = document.querySelector('input[name="backlog-cat"]:checked')?.value || '食';
        
        if (!rawText) return uiManager.showToast('⚠️', '請注入燃料字串');
        
        App.addBatchBacklogRecords(rawText, city, cat);
    } else {
        // 🚀 執行單筆採集
        const name = document.getElementById('backlog-name').value;
        const city = document.getElementById('backlog-city').value;
        const info = document.getElementById('backlog-info').value;
        const cat = document.querySelector('input[name="backlog-cat"]:checked')?.value || '食';
        
        if (!name) return uiManager.showToast('⚠️', '請輸入店名燃料');
        
        App.addBacklogRecord(name, city, info, cat);
    }
    
    // 物理收尾
    App.modalRemove('add-backlog-modal');
},

/** 🧬 [Shared-Component] 渲染模組空值狀態 (V2026.ULTRA 通用自癒版) */
_renderEmptyState(label) {
    // 🚀 數據純化：確保 label 具備視覺質感
    const displayLabel = String(label || 'Sector').toUpperCase();
    
    // 🚀 語義自癒：根據關鍵字自動匹配 Icon
    let icon = '📡';
    if (displayLabel.includes('MED')) icon = '🏥';
    if (displayLabel.includes('EXPENSE')) icon = '💰';
    if (displayLabel.includes('BACKLOG')) icon = '🏭';

    return `
        <div class="py-24 px-6 text-center animate-fade-in border-2 border-dashed border-slate-100 rounded-[3rem] mx-4 bg-slate-50/30">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50">
                <div class="relative">
                    <span class="text-3xl grayscale opacity-30">${icon}</span>
                    <div class="absolute inset-0 text-3xl animate-ping opacity-10">${icon}</div>
                </div>
            </div>
            <div class="space-y-2">
                <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Data Vacuum Detected</p>
                <h4 class="text-[15px] font-black text-slate-700 tracking-tight">[ ${displayLabel} ]</h4>
                <p class="text-[9px] text-slate-400 italic">燃料磁區真空，請執行數據同步</p>
            </div>
        </div>`;
}

  };


/** ☁️ [Backup Module] 備援中心視圖集群 (V2026.ULTRA 重構版) */
const backupView = {
    
/** 🚀 1. 核心進入點：主框架佈署 (導入 Tabs 分流架構) */
    renderMain(container, syncStatus) {
        if (!container) return;
        
        // 🚀 狀態感應：從真值來源獲取當前分頁，預設為 'cloud'
        const activeTab = localStorage.getItem('tf_backup_tab_focus') || 'cloud';

        const health = (typeof App.checkSyncHealth === 'function') 
            ? App.checkSyncHealth() 
            : { status: { label: '未對焦', icon: '❓' }, cloudTs: 0 };

        container.innerHTML = `
            <div class="backup-module animate-fade-in space-y-6 pb-40 px-2">
                <div class="px-4 mb-2">
                    <h2 class="text-2xl font-black text-slate-800 tracking-tight">數據備援中樞</h2>
                    <p class="text-[10px] font-black theme-text-pink uppercase tracking-widest mt-1 italic">
                        Data Redundancy & Shared Protocol
                    </p>
                </div>

                <!-- 🚀 核心焊接：三維 Tabs 切換器 -->
                <div class="flex p-1.5 bg-slate-100/80 rounded-[2.2rem] shadow-inner backdrop-blur-sm mx-2">
                    <button onclick="backupView.switchTab('cloud')" 
                            class="flex-1 py-3.5 rounded-[1.8rem] text-[11px] font-black transition-all ${activeTab === 'cloud' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400'}">
                        雲端備份
                    </button>
                    <button onclick="backupView.switchTab('share')" 
                            class="flex-1 py-3.5 rounded-[1.8rem] text-[11px] font-black transition-all ${activeTab === 'share' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400'}">
                        行程共享
                    </button>
                    <button onclick="backupView.switchTab('drive')" 
                            class="flex-1 py-3.5 rounded-[1.8rem] text-[11px] font-black transition-all ${activeTab === 'drive' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400'}">
                        Drive 備份
                    </button>
                </div>

                <!-- 🚀 內容分流注入區 -->
                <div id="backup-dynamic-slot" class="animate-fade-in">
                    ${this._dispatchSector(activeTab, syncStatus, health)}
                </div>
                
                <div id="sync-fingerprint-inspector" class="px-2 opacity-30">
                    ${viewEngine.renderFingerprintInspector ? viewEngine.renderFingerprintInspector(health) : ''}
                </div>
            </div>
        `;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /** 🧬 2. 分流發動機：執行物理磁區嫁接 */
    _dispatchSector(tab, syncStatus, health) {
        switch(tab) {
            case 'share': 
                return `
                    <div class="space-y-6">
                        ${this._renderImportSector ? this._renderImportSector() : ''}
                        ${this._renderSharedSector ? this._renderSharedSector() : ''}
                    </div>`;
            case 'drive':
                return this._renderDriveSector();
            default: // cloud
                return this._renderFirebaseSector(syncStatus, health);
        }
    },

    /** 🔄 3. Tabs 物理切換動作 */
    switchTab(tab) {
        localStorage.setItem('tf_backup_tab_focus', tab);
        if (navigator.vibrate) navigator.vibrate(8);
        // 呼叫主指揮部重新導向，觸發 renderMain
        if (window.App) App.navigateTo('backup');
    },


    /** 🌐 5. 私有組件：共享回流吸入器 (主題配色版) */
    _renderImportSector() {
        return `
            <div class="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-50 space-y-6 relative overflow-hidden">
                <div class="absolute -right-4 -top-4 text-7xl opacity-[0.03] italic font-black theme-text-pink select-none pointer-events-none uppercase">Import</div>
                
                <div class="flex justify-between items-start relative z-10">
                    <div>
                        <h3 class="font-black text-slate-800 text-[16px] tracking-tight">吸入夥伴航線</h3>
                        <p class="text-[9px] theme-text-pink font-bold uppercase tracking-tighter mt-1 italic">P2P Node Recovery</p>
                    </div>
                    <div class="w-10 h-10 theme-bg/10 rounded-2xl flex items-center justify-center text-xl shadow-sm grayscale-[0.5]">📥</div>
                </div>

                <div class="space-y-5 relative z-10">
                    <div class="grid grid-cols-2 gap-3">
                        <div class="space-y-2 text-left">
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">共享座標 (8位)</label>
                            <input type="text" id="direct-import-id" maxlength="8" placeholder="A1B2C3D4" 
                                   class="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-black text-slate-700 shadow-inner outline-none ring-1 ring-slate-100 focus:ring-[var(--theme-primary)]/30 transition-all font-mono uppercase text-center tracking-[0.2em]">
                        </div>
                        <div class="space-y-2 text-left">
                            <label class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">存取密鑰</label>
                            <input type="password" id="direct-import-passcode" maxlength="4" placeholder="••••" 
                                   class="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-black text-slate-700 shadow-inner outline-none ring-1 ring-slate-100 focus:ring-[var(--theme-primary)]/30 transition-all text-center tracking-[0.5em]">
                        </div>
                    </div>

                    <button onclick="App.executeDirectImport()" 
                            class="w-full py-5 theme-bg text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-pink-100/50 active:scale-95 transition-all">
                        點火吸入數據燃料
                    </button>
                    
                    <p class="text-[8px] text-slate-400 text-center italic font-medium px-4">
                        ※ 物理偵測：吸入後將在「我的旅行」列表生成獨立磁區。
                    </p>
                </div>
            </div>
        `;
    },


/** 📊 1. Firebase 雲端看板 (主控發動機 - V2026.ULTRA) */
_renderFirebaseSector(syncStatus, health) {
    // 🚀 數據指紋對焦
    const cloudStats = state.cloudStats || {};
    const cloudTimeFull = health.cloudTs > 0 
        ? new Date(health.cloudTs).toLocaleString('zh-TW', { 
            year: 'numeric', month: '2-digit', day: '2-digit', 
            hour: '2-digit', minute: '2-digit', hour12: false 
          }) 
        : '---';

    return `
        <div class="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-50 space-y-8 relative overflow-hidden animate-fade-in">
            <!-- 零件 A: 看板頭部 -->
            ${this._renderSectorHeader('Cloud Snapshot', '數據指紋與同步狀態', '☁️')}

            <!-- 零件 B: 使用者主權區 (Auth Area) -->
            ${this._renderAuthSection()}

            <!-- 零件 C: 數據量化矩陣 (Stats Grid) -->
            ${this._renderStatsMatrix(cloudStats)}

            <!-- 零件 D: 物理時間指紋 (Sync Info) -->
            ${this._renderSyncTimestamp(cloudTimeFull)}

            <!-- 零件 E: 指令操作組 (Action Buttons) -->
            ${this._renderCloudActions()}
        </div>
    `;
},

/** 🧬 2. 子組件：看板通用頭部 (Reusable Header) */
_renderSectorHeader(title, subtitle, icon) {
    return `
        <div class="flex justify-between items-center px-1">
            <div>
                <h3 class="font-black text-slate-800 text-[18px] tracking-tight">${title}</h3>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">${subtitle}</p>
            </div>
            <div class="w-12 h-12 theme-bg text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-pink-100">${icon}</div>
        </div>`;
},

/** 👤 3. 子組件：身分驗證磁區 (Auth Handler) */
_renderAuthSection() {
    if (!state.userProfile) {
        return `
            <button onclick="App.login()" class="w-full mb-2 py-5 bg-slate-800 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all shadow-xl">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5">
                Google 帳號對焦
            </button>`;
    }

    return `
        <div class="flex items-center gap-4 mb-2 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 animate-fade-in">
            <img src="${state.userProfile.photo}" class="w-12 h-12 rounded-full border-2 border-white shadow-md">
            <div class="flex-1 min-w-0">
                <p class="text-[13px] font-black text-slate-700 truncate">${state.userProfile.name}</p>
                <p class="text-[9px] theme-text-pink font-black uppercase tracking-widest mt-0.5">Cloud Connected</p>
            </div>
            <button onclick="App.logout()" class="text-[10px] font-black text-rose-500 bg-white border border-rose-100 px-4 py-2 rounded-xl active:scale-95 shadow-sm">登出</button>
        </div>`;
},

/** 🧮 4. 子組件：數據量化矩陣 (Matrix) */
_renderStatsMatrix(stats) {
    const items = [
        { label: '📍 雲端行程', val: stats.tripCount || 0, unit: 'UNITS' },
        { label: '📖 翻譯語料', val: stats.translationCount || 0, unit: 'FUEL' },
        { label: '🏭 靈感原子', val: stats.backlogCount || 0, unit: 'IDEAS' },
        { label: '🆘 救援密鑰', val: stats.emergencyCount || 0, unit: 'VAULTS' }
    ];

    return `
        <div class="grid grid-cols-2 gap-3">
            ${items.map(i => `
                <div class="bg-slate-50/80 p-5 rounded-[1.8rem] border border-slate-100">
                    <p class="text-[9px] font-black text-slate-400 uppercase mb-2 tracking-tighter">${i.label}</p>
                    <p class="text-[20px] font-black text-slate-700 tabular-nums">${i.val} <span class="text-[10px] opacity-40 italic">${i.unit}</span></p>
                </div>
            `).join('')}
        </div>`;
},

/** ⏱️ 5. 子組件：同步時戳 (Sync Status) */
_renderSyncTimestamp(timeStr) {
    return `
        <div class="p-5 bg-slate-900 rounded-[2.2rem] space-y-2 relative overflow-hidden">
            <div class="absolute -right-4 -bottom-4 text-7xl opacity-10 italic font-black text-white">SYNC</div>
            <p class="text-[10px] font-black text-pink-400 uppercase tracking-[0.2em]">Latest Mirror Timestamp</p>
            <p class="text-[15px] font-black text-white tabular-nums">${timeStr}</p>
        </div>`;
},

/** 🎮 6. 子組件：操作按鈕群 (Actions) */
_renderCloudActions() {
    return `
        <div class="grid grid-cols-1 gap-3 pt-2">
            <button onclick="App.syncFromCloud()" class="w-full py-5 theme-bg text-white rounded-[2rem] font-black text-[16px] shadow-xl shadow-pink-100 active:scale-95 transition-all">
                從此快照還原數據 (Restore)
            </button>
            <button onclick="App.triggerFirebaseSync()" class="w-full py-4 bg-slate-100 text-slate-500 rounded-[2rem] font-black text-[12px] active:scale-95 transition-all uppercase tracking-widest">
                上傳當前本地燃料 (Backup)
            </button>
        </div>`;
},


/** 🌐 4. 私有組件：共享磁區佈署器 (V2026.ULTRA 密碼保護管理版) */
_renderSharedSector() {
    const trips = state.trips || [];
    
    return `
        <div class="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-50 space-y-6 mt-8">
            <div class="flex justify-between items-start">
                <div>
                    <h3 class="font-black text-slate-800 text-[15px]">行程共享投射</h3>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">Shared Zone P2P</p>
                </div>
                
                <button onclick="App.openMySharedManager()" 
                        class="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase border border-slate-100 active:scale-95 transition-all shadow-sm hover:theme-text-pink hover:border-pink-100 flex items-center gap-2">
                    <span class="text-xs">📋</span> 管理分享
                </button>
            </div>

            <div class="space-y-4">
                <div class="p-5 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">1. 選擇要分享的行程軌道</label>
                    <select id="share-trip-id" class="w-full bg-white border-none rounded-xl p-4 text-sm font-bold shadow-sm outline-none ring-1 ring-slate-200/50 focus:ring-pink-200 transition-all">
                        ${trips.map(t => `<option value="${t.id}">${t.name} (${t.city || '未知'})</option>`).join('')}
                    </select>
                </div>

                <div class="p-5 bg-slate-50 rounded-[1.8rem] border border-slate-100">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">2. 設定 4 位數存取密鑰</label>
                    <input type="password" id="share-passcode" maxlength="4" placeholder="••••" 
                           class="w-full bg-white border-none rounded-xl p-4 text-2xl font-black shadow-sm outline-none text-center tracking-[1em] ring-1 ring-slate-200/50 focus:ring-pink-200 transition-all tabular-nums">
                    <p class="text-[9px] text-slate-400 mt-2 italic text-center font-medium">※ 分享對象須輸入此密碼才能下載行程</p>
                </div>

                <button onclick="App.deployToSharedZone()" 
                        class="w-full py-5 bg-slate-800 text-white rounded-[2rem] font-black text-sm uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
                    產生共享座標並點火
                </button>
            </div>
            
            <div id="shared-result-area" class="hidden animate-slide-up"></div>
        </div>
    `;
},

    /** 📁 3. 私有組件：Google Drive 資料儲存區 */
    _renderDriveSector() {
        return `
            <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-black text-slate-800 text-[15px]">Google Drive 資料儲存</h3>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">Physical JSON Archive</p>
                    </div>
                    <div class="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 font-bold shadow-sm">📁</div>
                </div>

                <p class="text-[11px] text-slate-400 leading-relaxed font-medium px-1">
                    將全系統行程、開銷與翻譯資料導出為「高品質 JSON 燃料包」並儲存至您的雲端硬碟。
                </p>

                <button onclick="App.triggerDriveBackup()" 
                        class="w-full py-4 bg-slate-800 text-white rounded-[1.5rem] font-black text-xs shadow-xl active:scale-95 transition-all">
                    執行 Drive 資料儲存 (Download)
                </button>
            </div>
        `;
    }


};

// 🚀 最終焊接至 viewEngine
viewEngine.renderBackup = (container, syncStatus) => backupView.renderMain(container, syncStatus);

if (typeof window !== 'undefined') {
    window.backupView = backupView;
}


/**
 * 🛠️ 渲染效能與連動監控 (Visual Debug Console)
 * --------------------------------------------------
 * [Visual Sync] UI 參數強制引用 config.js 內之 THEME 變數
 * [Data Flow] 純淨數據結構，tokens 維持 [[字, 品詞, 讀音]] 格式 (對位於語文模組)
 * [Optimization] 採用 requestAnimationFrame 確保物理對焦不阻塞渲染軌道
 * * 🚀 下一步焊接建議：
 * 1. [Refactor] 考量將 renderTransportFuel 抽離至獨立的 transportEngine.js 以優化載入。
 * 2. [Visual] 建議在 renderScheduleItem 導入內容預加載 (Content Placeholder) 以支撐長途路網渲染。
 * 3. [UI] 針對 renderBottomDock 導入物理震動回饋，強化「職人工具」的操作手感。
 */