/**
 * 🛰️ TravelFlow | 總管中心 (main.js)
 * 核心版本：V2026.ULTRA.FINAL
 * 真值來源：IndexedDB (via dbManager)
 * 模組連結：config.js | dbManager.js | modalEngine.js | viewEngine.js
 * 視覺協定：圓角卡片 / 物理分段 / 職人主題色 (THEMES)
 * --------------------------------------------------


/**
 * 🛰️ TravelFlow | 總管中心 (main.js)
 * 模式：ES Modules (ESM) | 戰術中樞封裝
 */
import { CONFIG } from './config.js';
import { dbManager } from './dbManager.js';
import { modalEngine } from './modalEngine.js';
import { debugManager } from './debugManager.js';
import { viewEngine } from './viewEngine.js';
import { expenseManager } from './expenseManager.js';
import { syncEngine } from './syncEngine.js';
import { uiManager } from './uiManager.js';
import { backlogManager } from './backlogManager.js';

import { audioManager } from './audioManager.js';
import { translationEngine } from './translationEngine.js';
import { translationView } from './translationView.js';
import { personaEngine } from './trans_config.js';

import { en_audioManager } from './en_audioManager.js';
import { en_translationEngine } from './en_translationEngine.js';
import { en_translationView } from './en_translationView.js';
import { en_personaEngine } from './en_trans_config.js';

/** 🛰️ TravelFlow | 模組導入 (整合對焦版) */
import { 
    auth, 
    googleProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from './firebase-config.js';


debugManager.init();

// 🚀 1. 內部真值來源 (State) - V2026.ULTRA 物理鎖定強化版
let state = {
    trips: [],
    currentView: 'list',
    expenseFocus: localStorage.getItem('tf_expense_focus') || 'TWD',
    activeTripId: null,
    
    // 🚀 數據提領磁區
    srsMetadata: [],      // 影子特訓磁區暫存軌道
    
    // 🛡️ 記憶體防禦鎖 (Session-Lock)
    // 執行邏輯：進入設定頁面時，若 total 為 0 且此值為 false，則自動掃描並將其設為 true。
    // 這能確保只有在「重啟網頁」時會自動掃描，切換 View 則不再重複負擔記憶體。
    hasAutoScanned: false, 

    // 🚀 核心焊接：特訓中心專屬上下文
    trainingContext: {
        mode: '讀',           // 頂部撥盤：讀 / 聽 / 挑戰 / 設定
        displayMode: '漢字',  // 視覺對焦：漢字 / 平假名 (V2026 新增)
        level: 'All',        // Tabs-1：JLPT 等級對焦
        page: 1,             // Tabs-2：當前分頁指針
        perPage: 5,          // 每頁燃料負載量
        isChallenge: false,  // 挑戰模式活躍閘刀
        history: []          // 實戰歷史紀錄軌道
    },

    backlogContext: {
    page: 1,
    perPage: 5,
    searchQuery: '',
    // 💡 職人提醒：city 與 category 沿用原本的 localStorage 邏輯，但需在此導通
    },

    // 💡 保留相容性閘刀 (舊模組備援)
    trainingFocus: '全部', 
    isTrainingMode: false  
};


/**
 * 核心戰術中樞
 */
const App = {

// 在 App 物件內只加這兩行代理，不寫邏輯，只負責轉發
speakSegment(text) { 
    // 這樣不管目前是日文還是英文引擎，App 都會自動幫你找對人
    this.activeTranslationEngine.speakSegment(text); 
},

/** 📜 [Live-History-Proxy] 歷史紀錄讀取代理 (V2026.ULTRA 渲染穩壓版) */
loadLiveHistory(cat) {
    const engine = this.activeTranslationEngine;
    
    // 🚀 核心焊接：物理洗滌 (UI Sanitization)
    // 💡 職人診斷：在請求新數據前，先手動清空顯示堆疊。
    // 這能確保「劇場會話」的大量分段數據在進場時，不會與舊的單句翻譯 DOM 發生碰撞。
    const stack = document.getElementById('fuel-display-stack');
    if (stack) {
        // 注入極簡 Loading 預覽，防止切換時的「瞬間留白」造成視覺斷層
        stack.innerHTML = `
            <div class="py-20 text-center animate-pulse opacity-20">
                <i class="fa-solid fa-shuttle-space text-2xl theme-text-pink"></i>
                <p class="text-[8px] font-black uppercase tracking-[0.4em] mt-4">Sector Loading</p>
            </div>`;
    }

    if (engine && typeof engine.loadLiveHistory === 'function') {
        // 🚀 執行邏輯層調取：此處會呼叫 Engine -> 讀取 DB -> 回傳給 View 執行 _renderTranslateCards
        // 💡 劇場協定：會話課文將維持 article_package 格式，
        // 渲染引擎會偵測到 type 並自動調用 _renderArticlePackageWithTabs
        return engine.loadLiveHistory(cat);
    }
    
    console.warn("🛰️ [Acoustic-Link] 引擎導通異常，攔截暫態調用");
},


// 系統預設五組職人色配置 (背景色)
    hotelPalette: [
        'bg-pink-50 border-pink-100', 
        'bg-blue-50 border-blue-100', 
        'bg-emerald-50 border-emerald-100', 
        'bg-amber-50 border-amber-100', 
        'bg-purple-50 border-purple-100'
    ],

// 🚀 修正映射：確保調用的是 viewEngine 目前實體的方法
    modalCreate: (...args) => modalEngine.create(...args),
    modalRemove: (...args) => modalEngine.remove(...args),
    renderTripList: (...args) => viewEngine.renderTripList(...args),
    renderTripDetail: (...args) => viewEngine.renderTripDetail(...args),


// ============================================================
// 2. [Router & Navigation] 視圖導播中樞
// 負責：頁面切換、底欄渲染、導航對焦
// ============================================================
/** 🚀 視圖導播中心 V5.5 (V2026.ULTRA 特訓模式導通版) */
navigateTo(view, tripId = null, extra = null) {
    state.currentView = view;
    if (tripId) state.activeTripId = tripId;
    const contentContainer = document.getElementById('content-container');
    const dockContainer = document.getElementById('nav-dock-container');
    if (view === 'list') {
        if (dockContainer) dockContainer.innerHTML = '';
        viewEngine.renderTripList(contentContainer, state.trips);
        this.updateNavTitle("TravelFlow");
        return;
    }
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    const isGlobalView = ['settings', 'backlog', 'training'].includes(view);
    
    if (!activeTrip && !isGlobalView) {
        console.warn(`⚠️ [Router] 節點 ${view} 燃料缺失且非全域視圖，強制回位至 list`);
        return this.navigateTo('list');
    }
    if (dockContainer) {
        if (activeTrip) {
            viewEngine.renderBottomDock(dockContainer, view);
        } else {
            dockContainer.innerHTML = '';
        }
    }
    const titleMap = {
        'detail':      '行程詳情',
        'expense':     '費用開銷',
        'checklist':   '攜帶清單',
        'realtime':    '即時翻譯',
        'training':    '記憶特訓',
        'contextual':  '情境翻譯',
        'shopping':    '購物情報',
        'emergency':   '緊急救援',
        'backlog':     '備選靈感',
        'backup':      '資料備份',
        'settings':    '系統設定'
    };
    this.updateNavTitle(titleMap[view] || "TravelFlow");
    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.executeViewLogic(view, contentContainer, activeTrip, extra);

    // 🚀 切換至特訓頁時靜默同步，確保最新單字已進入影子資料庫
    if (view === 'training') {
        setTimeout(() => {
            this.syncSRSShadow({ silent: true });
        }, 300);
    }

    // 🚀 [新增] 切換至靈感清單時重置 FAB 狀態
    if (view === 'backlog') {
        setTimeout(() => {
            if (viewEngine.updateRefineryFAB) viewEngine.updateRefineryFAB();
        }, 300);
    }
},

/** 🧬 視圖執行發動機 (V2026.ULTRA 備選精煉廠全量焊接版) */
async executeViewLogic(view, container, trip, extra = null) {
    console.log(`📡 [View-Dispatch] 執行模組: ${view} | Trip: ${trip?.id || 'N/A'} | Extra: ${extra || 'None'}`);

    // 🚀 核心焊接：獲取當前活躍的視圖引擎
    const activeEngine = this.getActiveViewEngine();

    switch(view) {
        // 🚀 1. 核心路網：行程詳情
        case 'detail':
            viewEngine.renderTripDetail(container, trip);
            break;

        // 🎙️ 2. 即時翻譯模組 (已解耦至 translationView)
        case 'realtime':
            // 🚀 物理導通：調用專屬語義視圖引擎
            if (window.translationView && typeof translationView.renderRealtimeTranslation === 'function') {
                translationView.renderRealtimeTranslation(container);
            } else {
                console.error("❌ [View-Collapse] translationView 未掛載，嘗試回退渲染");
                viewEngine.renderRealtimeTranslation(container);
            }
            
            // 🚀 精確焊接：載入歷史
            setTimeout(() => {
                // 💡 職人提醒：App.loadLiveHistory 是我們在 main.js 加掛的代理，會自動分流 EN/JP
                this.loadLiveHistory('全部');
            }, 150); 
            break;

// 🔥 11. 特訓路網：遺忘曲線特訓牆 (V2026.ULTRA.ENDLESS_COMPATIBLE)
case 'training':
    try {
        // 1. 🚀 提取全量 SRS 指紋數據 (而不僅僅是過期的)
        const allSrsData = await dbManager.getAllSRSItems(); // 需確保 dbManager 有此方法
        
        // 💡 職人診斷：判定當前是否為挑戰模式
        const isBattleMode = state.trainingContext?.mode === '挑戰';
        
        // 🚀 2. 燃料管線分流 (Fuel Logic Branching)
        // 挑戰模式：全磁區導通 (Endless)，無視過期標籤
        // 一般模式：僅提取 isDue (已冷卻) 的過期燃料
        const trainingPool = isBattleMode 
            ? allSrsData 
            : allSrsData.filter(it => it.isDue);

        // 🚀 3. 物理導通：調用視圖引擎渲染
        if (window.translationView && typeof translationView.renderTrainingWall === 'function') {
            // 傳遞計算後的 trainingPool，而非原始的 dueItems
            translationView.renderTrainingWall(container, trainingPool);
        } else {
            console.error("❌ [View-Collapse] translationView 未導通特訓軌道");
        }
        
        console.log(`📡 [Training-Matrix] 模式: ${isBattleMode ? '挑戰(全導通)' : '一般(冷卻中)'} | 戰力總量: ${trainingPool.length}`);
        
    } catch (err) {
        console.error("❌ [SRS-Load-Fatal] 特訓數據讀取中斷:", err);
        uiManager.showToast('⚠️', "特訓磁區對焦異常");
    }
    break;

        // 📖 3. 語義路網：情境翻譯庫
        case 'contextual':
        case 'translate': 
            const vault = Array.isArray(trip?.translateVault) ? trip.translateVault : [];
            
            // 🚀 物理導通：調用專屬語義視圖引擎
            if (window.translationView && typeof translationView.renderContextualTranslation === 'function') {
                // 💡 職人診斷：情境模式不需要 transCats 參數，它會自動感應 State 配置
                translationView.renderContextualTranslation(container, vault, '全部');
            } else {
                const fallback = activeEngine.renderContextualTranslation || viewEngine.renderContextualTranslation;
                fallback.call(viewEngine, container, vault, '全部');
            }
            break;

        // 💰 4. 金融路網：費用開銷
        case 'expense':
            await expenseManager.fetchRates();
            const stats = expenseManager.getStats(trip);
            viewEngine.renderExpenseStats(container, trip, expenseManager.getChartData(stats), stats);
            break;

        // 🎒 5. 整備路網：裝備清單
        case 'checklist':
            const checklistFuel = Array.isArray(trip?.checklist) ? trip.checklist : [];
            const checkCats = trip?.checklistConfig?.categories || ['證件', '財務', '交通', '電器', '通訊', '個人'];
            viewEngine.renderChecklist(container, checklistFuel, '全部', checkCats);
            break;

        // 🛍️ 6. 資源路網：購物情報
        case 'shopping':
            const shoppingFuel = Array.isArray(trip?.shopping) ? trip.shopping : [];
            const defaultCat = trip?.shoppingConfig?.categories?.[0] || '食';
            viewEngine.renderShopping(container, shoppingFuel, defaultCat);
            break;

        // 🏥 7. 安全路網：緊急救援
        case 'emergency':
            const emFuel = Array.isArray(trip?.emergencyVault) ? trip.emergencyVault : [];
            viewEngine.renderEmergency(container, emFuel, 'medical');
            break;

        // ☁️ 8. 數據路網：備援中心
        case 'backup':
            const syncStatus = {
                online: navigator.onLine,
                lastSyncTime: localStorage.getItem('tf_last_sync_ts') || '尚未對焦',
                localEdit: state.lastLocalEdit || 0,
                cloudSnapshot: JSON.parse(localStorage.getItem('tf_cloud_snapshot') || '{}')
            };
            viewEngine.renderBackup(container, syncStatus);
            break;

        // ⚙️ 9. 環境路網：系統設定
        case 'settings':
            const activeSettingsTab = extra || 'visual'; 
            viewEngine.renderSettings(container, activeSettingsTab);
            break;

// 🏭 10. 精煉路網：備選行程精煉廠 (V2026.ULTRA 狀態對焦版)
        case 'backlog':
            // 🚀 核心修正 0：物理抹除 UI 殘留，確保視覺純淨度
            if (window.uiManager && uiManager.showToast) {
                const toast = document.getElementById('global-ui-toast') || document.getElementById('ui-toast');
                if (toast) toast.remove();
            }

            // 🚀 核心修正 1：數據提取
            // 💡 職人診斷：loadAll 內部已包含 window 全域掛載與初步 Getter 觸發
            const backlogItems = await backlogManager.loadAll();
            
            // 🚀 核心修正 2：【關鍵焊接】強制選取狀態對焦
            // 💡 職人診斷：解決「網頁重整後選取消失」的最後一道防線
            // 在 render 前確保物理磁區 (LocalStorage) 已成功回流至記憶體實體 (Set)
            if (window.backlogManager && typeof backlogManager.syncFAB === 'function') {
                backlogManager.syncFAB(); 
            }

            // 🚀 核心修正 3：執行渲染
            // 💡 職人提醒：renderBacklogPage 現在將獲得 100% 導通的選取狀態進行小卡顯影
            viewEngine.renderBacklogPage(container, backlogItems);
            
            console.log(`📡 [View-Direct] 精煉廠磁區已點火 | 燃料: ${backlogItems.length} | 狀態: 鎖定`);
            break;


        default:
            // 🚀 萬用反射軌道
            const methodName = `render${view.charAt(0).toUpperCase() + view.slice(1)}`;
            if (typeof activeEngine[methodName] === 'function') {
                activeEngine[methodName](container, trip);
            } else if (typeof viewEngine[methodName] === 'function') {
                viewEngine[methodName](container, trip);
            } else {
                console.warn(`❌ [Router-Void] 模組 ${view} 未配置實體渲染器`);
                container.innerHTML = `<div class="py-20 text-center opacity-30">數據路網對焦中...</div>`;
            }
            break;
    }
},


    updateNavTitle(title) {
        const el = document.getElementById('nav-title');
        if (el) el.textContent = title;
    },


/** 📑 切換日期標籤：執行全域數據同步與物理重排 (V2026.ULTRA 權重對焦版) */
switchDay(tripId, dayIndex) {
    // 1. 數據提取與狀態更新
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return console.error("❌ [State-Error] 找不到對應行程燃料");

    // 🚀 核心焊接：鎖定活躍行程
    state.activeTripId = tripId; 
    const dayNum = dayIndex + 1;

    // 🚀 2. 衛星軌道重連：執行物理重排發動機
    // 💡 職人診斷：不再單獨呼叫 Hotel/Transport，而是由中樞統一根據數據有無進行排序
    const trackMount = document.getElementById('satellite-track-mount');
    if (trackMount && typeof viewEngine._renderSatelliteTrack === 'function') {
        viewEngine._renderSatelliteTrack(trackMount, trip, dayNum);
    }

    // 3. 視圖導播：更新 Tabs 視覺狀態
    const tabsContainer = document.getElementById('day-tabs-container');
    if (tabsContainer) {
        viewEngine.renderDayTabs(tabsContainer, trip, dayIndex);

        // 物理對焦：確保選中的 Day Tab 捲動至中央
        requestAnimationFrame(() => {
            const activeTabBtn = tabsContainer.querySelector('.theme-bg');
            if (activeTabBtn) {
                const target = activeTabBtn.parentElement;
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'nearest',
                    inline: 'center'
                });
            }
        });
    }

    // 4. 下方詳細規劃區聯動
    const contentArea = document.getElementById('day-content-area');
    if (contentArea) {
        viewEngine.renderDayDetailContent(contentArea, trip, dayIndex);
    }

    // 🚀 5. 職人級反饋：物理觸感
    if (navigator.vibrate) {
        navigator.vibrate(8); 
    }
    
    console.log(`📡 [Switch-Done] Day ${dayNum} 權重重排與數據對焦完畢`);
},

    toggleModal(id) {
        const el = document.getElementById(id);
        if (el) el.classList.toggle('hidden');
    },



    modalRemove(id) {
        modalEngine.remove(id);
    },

// ============================================================
//                 行程編輯切換器
// ============================================================

/** 🎨 切換編輯器模式 (視覺/代碼) - V2026.ULTRA 強制對位版 */
switchEditorMode(mode) {
    // 🚀 1. 物理狀態固化
    window.localStorage.setItem('tf_editor_mode', mode);
    
    const visCont = document.getElementById('visual-editor-container');
    const codeCont = document.getElementById('code-editor-container');
    const btnVis = document.getElementById('btn-mode-visual');
    const btnCode = document.getElementById('btn-mode-code');

    if (!visCont || !codeCont) return;

    // 🚀 2. 數據總線對位：切換至視覺模式時，立即執行熱更新重繪
    if (mode === 'visual') {
        // 💡 職人修正：確保視覺區域的 HTML 內容與 Textarea 內的 JSON 100% 同步
        if (typeof this.syncVisualFromCode === 'function') {
            this.syncVisualFromCode();
        }
        
        visCont.classList.remove('hidden');
        codeCont.classList.add('hidden');
        
        // UI 狀態聯動
        btnVis.classList.add('bg-white', 'text-slate-800', 'shadow-sm');
        btnVis.classList.remove('text-slate-400');
        btnCode.classList.add('text-slate-400');
        btnCode.classList.remove('bg-white', 'text-slate-800', 'shadow-sm');
    } else {
        visCont.classList.add('hidden');
        codeCont.classList.remove('hidden');
        
        // UI 狀態聯動
        btnCode.classList.add('bg-white', 'text-slate-800', 'shadow-sm');
        btnCode.classList.remove('text-slate-400');
        btnVis.classList.add('text-slate-400');
        btnVis.classList.remove('bg-white', 'text-slate-800', 'shadow-sm');
    }

    // 🚀 3. 物理反饋
    if (navigator.vibrate) navigator.vibrate(5);
},


/** 🧬 視覺回流：WYSIWYG 實境編修回寫發動機 (V2026.ULTRA 燃料洗滌加固版) */
syncCodeFromVisual() {
    const slot = document.getElementById('visual-render-slot');
    const memoArea = document.getElementById('sched-memo');
    if (!slot || !memoArea) return;

    try {
        // 🚀 1. 物理洗滌：徹底封殺 Markdown 標籤、反引號與 Zero-width 噪訊
        const rawContent = memoArea.value.trim();
        const sanitizedJson = rawContent
            .replace(/```json/g, '') // 切除開頭標籤
            .replace(/```/g, '')     // 切除結尾標籤
            .replace(/[\u200B-\u200D\uFEFF]/g, '') // 物理洗滌不可見字符
            .trim();

        // 🚀 2. 數據提領：執行安全解析，若洗滌後為空則初始化為空物件
        let data = JSON.parse(sanitizedJson || "{}");

        // 採集所有具備 field 指紋的編輯節點
        const fieldNodes = Array.from(slot.querySelectorAll('[data-field]'));
        if (fieldNodes.length === 0) return;

        // 🚀 3. 執行指紋對焦回寫
        fieldNodes.forEach(el => {
            const field = el.dataset.field; // 取得指紋 (如: time, cost, name)
            const text = el.innerText.trim();
            const index = el.dataset.index; // 取得陣列索引 (針對購物/交通)

            // A. 行程/購物 軌道 (陣列模式)
            if (index !== undefined && Array.isArray(data)) {
                const targetNode = data[index];
                if (targetNode) this._weldTextToData(targetNode, field, text);
            } 
            // B. 交通路網 軌道 (特定結構 stops 陣列)
            else if (index !== undefined && data.stops && Array.isArray(data.stops)) {
                const targetNode = data.stops[index];
                if (targetNode) this._weldTextToData(targetNode, field, text);
            }
            // C. 單一物件 軌道
            else {
                this._weldTextToData(data, field, text);
            }
        });

        // 🚀 4. 數據固化：同步寫回並對焦全域 State (採用美化縮進)
        const finalJson = JSON.stringify(data, null, 2);
        memoArea.value = finalJson;
        
        if (window.state && window.state.activeEditItem) {
            window.state.activeEditItem.memo = finalJson;
            // 基礎標題/時間同步：採信第一筆有效節點
            const rootNode = Array.isArray(data) ? data[0] : (data.stops ? data.stops[0] : data);
            if (rootNode.time) window.state.activeEditItem.time = rootNode.time;
            if (rootNode.location || rootNode.task) {
                window.state.activeEditItem.location = rootNode.location || rootNode.task;
            }
        }

        // 零件聯動
        if (typeof this.syncTopPartsFromFuel === 'function') {
            this.syncTopPartsFromFuel(data);
        }

        console.log("✅ [Sync-Engine] 燃料洗滌成功，數據總線已導通固化");

    } catch (err) {
        // 🛡️ 異常降壓：針對輸入中的暫態解析失敗執行靜默處理，防止 UI 鎖死
        console.warn("⚠️ [Sync-Wait] 燃料格式調整中，暫緩焊接:", err.message);
    }
},


/** 🧬 內部焊接：將文字物理壓入特定欄位 */
_weldTextToData(node, field, text) {
    if (!node || !field) return;
    
    // 數字型指紋處理
    if (['price', 'cost', 'quantity'].includes(field)) {
        node[field] = Number(text.replace(/,/g, '')) || 0;
    } 
    // 預估費用處理 (Itinerary 專屬)
    else if (field === 'expense') {
        node.expense = text;
        if ('cost' in node) node.cost = Number(text.replace(/,/g, '')) || 0;
    }
    // 文字型指紋處理
    else {
        node[field] = text;
    }
},


/** 🧬 輔助：反向同步上方 UI 零件 */
syncTopPartsFromFuel(data) {
    const timeInput = document.getElementById('sched-time');
    const locInput = document.getElementById('sched-location');
    const costInput = document.getElementById('sched-cost');
    const firstNode = Array.isArray(data) ? data[0] : (data.stops ? data.stops[0] : data);

    if (timeInput && firstNode.time) timeInput.value = firstNode.time;
    if (locInput) locInput.value = (firstNode.location || firstNode.task || firstNode.name || '');
    if (costInput) {
        // 如果是購物清單，計算總和顯示在費用區
        if (Array.isArray(data) && 'price' in firstNode) {
            const total = data.reduce((sum, p) => sum + (p.price * p.quantity), 0);
            costInput.value = total;
        } else if (firstNode.expense) {
            costInput.value = firstNode.expense;
        }
    }
},


/** 🎨 代碼熱感應：當手動修改 JSON 時重繪視覺預覽 */
syncVisualFromCode() {
    const memoArea = document.getElementById('sched-memo');
    const renderSlot = document.getElementById('visual-render-slot');
    const styleSelector = document.getElementById('sched-style');
    
    if (!memoArea || !renderSlot) return;

    // 模擬一個暫時的 item 物件供渲染引擎使用
    const tempItem = {
        memo: memoArea.value,
        style: styleSelector ? styleSelector.value : 'json'
    };

    // 呼叫 viewEngine 重新產生編輯用內容
    renderSlot.innerHTML = viewEngine._renderVisualEditorContent(tempItem);
},


/** 🧬 數據中繼：全量焊接 UI 零件至 JSON 燃料並固化至全域狀態 */
syncFuelFromTopParts() {
    const timeInput = document.getElementById('sched-time');
    const locInput = document.getElementById('sched-location');
    const costInput = document.getElementById('sched-cost');
    const memoArea = document.getElementById('sched-memo');
    
    if (!memoArea) return;

    try {
        // 🚀 1. 燃料解析
        let data = JSON.parse(memoArea.value || "{}");
        const isArray = Array.isArray(data);
        
        // 🚀 2. 物理壓入：執行多態屬性對位
        const applyUpdate = (target) => {
            // 處理時間座標：僅在有值時點火，防止真空數據
            if (timeInput && timeInput.value) {
                target.time = timeInput.value;
            }
            // 處理地點標題
            if (locInput) {
                if ('location' in target) target.location = locInput.value;
                else if ('task' in target) target.task = locInput.value;
                else target.location = locInput.value; // 強制初始化
            }
            // 處理費用軌道：執行 expense/cost 雙路導通
            if (costInput) {
                const val = costInput.value;
                target.expense = val;
                if ('cost' in target) target.cost = Number(val) || 0;
            }
        };

        // 執行結構穿透
        if (isArray) {
            if (data.length > 0) applyUpdate(data[0]);
        } else if (data.stops && Array.isArray(data.stops)) {
            if (data.stops.length > 0) applyUpdate(data.stops[0]);
        } else {
            applyUpdate(data);
        }

        // 🚀 3. 數據固化至編輯框
        const newJson = JSON.stringify(data, null, 2);
        memoArea.value = newJson;

        // 🚀 4. 關鍵焊接：同步更新當前編輯中的 state 快照
        // 💡 職人診斷：如果不做這步，按下「儲存行程」時所有改動都會遺失
        if (window.state && window.state.activeEditItem) {
            window.state.activeEditItem.memo = newJson;
            if (timeInput && timeInput.value) window.state.activeEditItem.time = timeInput.value;
            if (locInput) window.state.activeEditItem.location = locInput.value;
        }
        
        // 🚀 5. 視覺熱連動
        if (typeof this.syncVisualFromCode === 'function') {
            this.syncVisualFromCode();
        }

        console.log("⚡ [Fuel-Sync] UI 零件數據已成功固化至核心狀態");

    } catch (e) {
        // 解析中斷（輸入中）時靜默處理
    }
},


// ============================================================
// 3. [Trip Life-Cycle] 行程生命週期管理
// 負責：建立、整備、更新、存檔
// ============================================================

    // --- 任務流：新增行程連鎖反應 ---
    createNewTrip() {
        const nameInput = document.getElementById('new-trip-name');
        const name = nameInput?.value.trim();
        if (!name) return uiManager.showToast('⚠️', "請輸入航線名稱");

        // 關閉第一階段模態框
        this.toggleModal('add-trip-modal');
        
        // 構建第二階段：整備設定內容
        const content = `
            <div class="space-y-4">
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">目的地區域</label>
                    <input type="text" id="setup-city" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-pink-100 outline-none" placeholder="例如：東京、京都">
                </div>
                <div class="grid grid-cols-2 gap-3">
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">總天數</label>
                        <input type="number" id="setup-days" value="1" min="1" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm">
                    </div>
                    <div>
                        <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">人數</label>
                        <input type="number" id="setup-companions" value="1" min="1" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm">
                    </div>
                </div>
            </div>`;
            
        const actions = `
            <button onclick="App.modalRemove('setup-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
            <button onclick="App.finalizeTrip('${name.replace(/'/g, "\\'")}')" class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-200 active:scale-95 transition-all">完成整備</button>`;
        
        // 使用 import 進來的引擎
        modalEngine.create('setup-modal', '🔧 行程整備設定', content, actions);
        
        if (nameInput) nameInput.value = "";
    },


/** 物理存檔與數據生成 (V2026.ULTRA 完整軌道導通版) */
async finalizeTrip(name) {
    const city = document.getElementById('setup-city')?.value.trim() || "未設定地點";
    const days = parseInt(document.getElementById('setup-days')?.value) || 1;
    const companions = parseInt(document.getElementById('setup-companions')?.value) || 1;

    // 🚀 1. 初始燃料生產：補齊所有功能軌道
    const nowTs = Date.now();
    const newTrip = {
        id: `TRIP_${nowTs}`,
        name,
        city,
        companions,
        transport: [], 
        hotels: [],
        shopping: [],
        // 🚀 語義路網預埋：確保新行程立即可執行翻譯存檔
        translateVault: [], 
        translateConfig: { 
            categories: ['交通', '用餐', '購物', '醫藥'] 
        },
        shoppingConfig: { 
            categories: ['食', '藥妝', '一般'] 
        },
        checklist: [], // 裝備清單初始化
        emergencyVault: [], // 救援燃料預留
        days: Array.from({ length: days }, (_, i) => ({ 
            dayNum: i + 1, 
            schedules: [] 
        })),
        createdAt: new Date(nowTs).toISOString(),
        updatedAt: nowTs // 初始物理指紋
    };

    try {
        // 2. 寫入記憶體狀態
        state.trips.push(newTrip);
        
        // 🚀 3. 核心焊接：啟動中繼寫入器執行磁區固化
        // 此處 persistState 會更新 state.lastLocalEdit 並呼叫 dbManager
        await this.persistState(newTrip);
        
        // 🚀 4. 介面導通與物理回收
        // 改用 window.modalEngine 確保作用域導通
        if (window.modalEngine) {
            window.modalEngine.remove('setup-modal');
        }
        
        // 自動對焦至新行程詳情頁
        this.navigateTo('detail', newTrip.id);
        
        // 視覺反饋
        uiManager.showToast('✨'," 行程已固化並導通同步指紋");
        if (navigator.vibrate) navigator.vibrate(20);
        
        console.log(`🏁 [Data-Init] 新航線 ${name} 已建立 | 指紋對焦成功`);
    } catch (err) {
        console.error("❌ [Storage-Collapse] 存檔失敗:", err);
        uiManager.showToast('⚠️',"數據固化失敗，請檢查磁區空間");
    }
},


/** 🔧 啟動概覽編輯模態框 (V2026.ULTRA 視認性加強版) */
promptEditOverview(tripId) {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    const content = `
        <div class="space-y-6 text-left max-h-[60vh] overflow-y-auto px-1 no-scrollbar">
            <!-- 🚀 核心焊接：行程名稱 -->
            <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">行程名稱</label>
                <input type="text" id="edit-trip-name" value="${trip.name || ''}" 
                       class="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-base theme-text-pink focus:ring-2 focus:ring-pink-100 outline-none transition-all shadow-inner"
                       placeholder="例如：關西賞櫻之旅">
            </div>

            <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">修改地點</label>
                <input type="text" id="edit-city" value="${trip.city || ''}" 
                       class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-pink-100 outline-none"
                       placeholder="例如：京都">
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">修改天數</label>
                    <input type="number" id="edit-days" value="${trip.days?.length || 1}" min="1" 
                           class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none">
                </div>
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">修改人數</label>
                    <input type="number" id="edit-companions" value="${trip.companions || 1}" min="1" 
                           class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none">
                </div>
            </div>

            <!-- 🛡️ 台灣職人級提示 (視覺強化版) -->
            <div class="p-5 bg-amber-50 rounded-2xl border border-amber-100/60 flex gap-3">
                <span class="text-amber-500 text-lg">⚠️</span>
                <div class="flex-1">
                    <p class="text-xs text-amber-700 font-black mb-1">提示</p>
                    <p class="text-[11px] text-amber-600/90 font-bold leading-relaxed">
                        若修改「天數」，系統將會重新佈署每日排程骨架，現有行程可能會被重置。請在更新前確認數據已完成雲端備份。
                    </p>
                </div>
            </div>
        </div>`;
            
const actions = `
    <div class="flex items-center gap-3 w-full px-1">
        <!-- 🚀 取消：回歸輔助比例，封殺過度肥大 -->
        <button onclick="App.modalRemove('edit-overview-modal')" 
                class="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">
            取消
        </button>

        <!-- 🚀 更新：主權適度噴發，維持 py-4 並微調字級 -->
        <button onclick="App.updateTripOverview('${tripId}')" 
                class="flex-[1.5] py-4 theme-bg text-white rounded-2xl font-black text-xs tracking-widest shadow-lg shadow-pink-100 active:scale-95 transition-all">
            更新設定
        </button>
    </div>`;
    window.App.modalCreate('edit-overview-modal', '🔧 編輯旅程設定', content, actions);
},

/** 💾 數據固化：更新資料庫並同步主權名稱 (V2026.ULTRA.FINAL) */
async updateTripOverview(tripId) {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return;

    // 🚀 1. 物理層數據採集 (新增名稱軌道)
    const newName = document.getElementById('edit-trip-name').value.trim();
    const newCity = document.getElementById('edit-city').value.trim();
    const newDays = parseInt(document.getElementById('edit-days').value) || 1;
    const newCompanions = parseInt(document.getElementById('edit-companions').value) || 1;

    // 🛡️ 數據完整性預檢
    if (!newName) return uiManager.showToast('⚠️', "請輸入行程名稱");

    const targetTrip = state.trips[tripIndex];
    
    // 🚀 2. 狀態更新與局部焊接
    targetTrip.name = newName; // 名稱主權寫入
    targetTrip.city = newCity;
    targetTrip.companions = newCompanions;

    // 🚀 3. 天數結構性異動處理 (防禦性設計)
    if (targetTrip.days.length !== newDays) {
        // 💡 職人提醒：天數變更涉及排程骨架重組，執行物理洗滌
        targetTrip.days = Array.from({ length: newDays }, (_, i) => ({
            dayNum: i + 1,
            schedules: []
        }));
    }

    try {
        // 🚀 4. 核心焊接：點火中繼寫入器執行磁區固化
        // 💡 職人診斷：persistState 會自動同步全域指紋 (lastLocalEdit) 與行程更新時間
        await this.persistState(targetTrip);
        
        // 5. 介面導通與物理回收
        window.App.modalRemove('edit-overview-modal');
        
        // 🚀 執行視圖熱重連 (Hot-Reload)
        this.navigateTo('detail', tripId);
        
        uiManager.showToast('✨', "旅程設定與名稱已成功對焦");
        
        if (navigator.vibrate) navigator.vibrate(10);
        
        console.log(`📡 [Overview-Update] Trip: ${tripId} | 職人設定固化導通`);
    } catch (err) {
        console.error("❌ [Update-Collapse] 數據寫入失敗:", err);
        uiManager.showToast('⚠️', "磁區寫入異常，請檢查空間");
    }
},

/** 🗑️ 刪除預檢：觸發語義確認彈窗 */
    confirmDeleteTrip(tripId) {
        const trip = state.trips.find(t => t.id === tripId);
        if (!trip) return;

        const content = `
            <div class="p-4 text-center space-y-4">
                <div class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span class="text-2xl">⚠️</span>
                </div>
                <h4 class="font-black text-slate-800">確定要回收此路網？</h4>
                <p class="text-xs text-slate-400 font-medium leading-relaxed">
                    即將物理刪除「<span class="theme-text-pink">${trip.name}</span>」的所有數據燃料。<br>
                    此動作將釋放磁區空間且不可復原。
                </p>
            </div>`;

        const actions = `
            <button onclick="App.modalRemove('delete-confirm-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
            <button onclick="App.executeDeleteTrip('${tripId}')" class="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-100 active:scale-95 transition-all">確認物理刪除</button>`;

        modalEngine.create('delete-confirm-modal', '🧹 數據空間回收', content, actions);
    },

/** 🚀 執行刪除：磁區回收與指紋鎖定 (V2026.ULTRA 本地優先版) */
async executeDeleteTrip(tripId) {
    try {
        // 🚀 1. 物理路徑焊接：必須傳入磁區名稱 STORES.TRIPS
        // 💡 職人診斷：確保 dbManager 知道要從哪個磁軌回收空間
        const success = await dbManager.delete(dbManager.STORES.TRIPS, tripId);
        
        if (success) {
            // 2. 記憶體狀態同步 (State 洗滌)
            state.trips = state.trips.filter(t => t.id !== tripId);
            
            // 🚀 3. 關鍵焊接：物理指紋對焦
            // 💡 職人診斷：刪除動作必須產生「時間戳記」，確保雲端與本地狀態一致
            const nowTs = Date.now();
            state.lastLocalEdit = nowTs;
            localStorage.setItem('tf_last_local_edit', nowTs);

            // 4. 物理移除模態框
            modalEngine.remove('delete-confirm-modal');
            
            // 5. 視圖歸位：強制回到列表頁並觸發渲染發動機
            this.navigateTo('list');
            
            // 6. 視覺與 Haptic 反饋
            uiManager.showToast('🧹', "行程已從本地磁區移除並更新指紋");
            if (navigator.vibrate) navigator.vibrate([10, 30]);
            
            console.log(`🧹 [Space-Manager] Trip ${tripId} 已物理切除 | 指紋對焦: ${nowTs}`);
        }
    } catch (err) {
        console.error("❌ [Delete-Collapse] 刪除程序墜毀:", err);
        uiManager.showToast('⚠️', "數據回收失敗：磁區通路斷開");
    }
},


// ============================================================
// 4. [Schedule & Route Engine] 節點與路網處理
// 負責：AI 燃料、路網生成、分段校準
// ============================================================


/** 📍 景點路網：新增節點入口 (V2026.ULTRA 狀態鎖定版) */
promptAddSchedule(tripId, dayIndex) {
    // 🚀 核心焊接 1：物理狀態鎖定
    // 確保後續所有連動函數 (如 syncStyleUI) 抓取的都是正確的行程燃料
    state.activeTripId = tripId;

    // 🚀 核心焊接 2：明確執行點火
    // 傳入 null 作為 itemIndex，強制 promptEditSchedule 進入「純淨初始態」
    this.promptEditSchedule(tripId, dayIndex, null);
    
    console.log(`📡 [Intent: Add] 節點入口已導通 | Trip: ${tripId} | DayIndex: ${dayIndex}`);
},


/** 🚀 景點/購物採集軌道：主控調度器 (V2026.ULTRA 狀態鎖定強化版) */
promptEditSchedule(tripId, dayIndex, itemIndex = null) {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    const dayData = trip.days[dayIndex];
    if (!dayData) return;
    
    // 1. 燃料識別與標記
    const isEdit = (itemIndex !== null && itemIndex !== undefined && String(itemIndex) !== "null");
    const item = isEdit ? (dayData.schedules[itemIndex] || {}) : { style: 'default' };

    // 🚀 核心修正 1：鎖定全域狀態指針
    // 💡 職人診斷：必須設定 activeEditItem，syncCodeFromVisual 才能導通回寫
    state.activeTripId = tripId;
    state.activeEditItem = item; 

    const content = viewEngine._renderScheduleFormHTML(item);
    const actions = this._renderScheduleActionsHTML(tripId, dayIndex, itemIndex, isEdit);

    // 2. 物理點火
    modalEngine.create('sched-modal', isEdit ? '🔧 編輯行程節點' : '📍 新增行程節點', content, actions);

    // 🚀 核心修正 2：確保 DOM 掛載與數據回填
    requestAnimationFrame(() => {
        setTimeout(() => {
            console.log(`📡 [UI-Ignition] 啟動模式: ${item.style || 'default'}`);
            
            // 強制導通 UI 狀態連動
            this.syncStyleUI(item.style || 'default', item);

            // 影像模式熱啟動
            if (item.style === 'image' && item.imageUrl) {
                const previewBox = document.getElementById('image-preview-box');
                if (previewBox) {
                    previewBox.innerHTML = `<img src="${item.imageUrl}" class="w-full h-full object-cover animate-fade-in rounded-2xl">`;
                }
            }

            // 購物模式熱啟動
            if (item.style === 'shopping') this.syncShoppingEditor();
            
            // 🚀 關鍵加固：確保視覺模式啟動時立即同步一次
            if (typeof this.syncVisualFromCode === 'function') {
                this.syncVisualFromCode();
            }
        }, 50); 
    });
},


/** 🧬 [Sub-Component] 渲染底部動作按鈕軌道 */
_renderScheduleActionsHTML(tripId, dayIndex, itemIndex, isEdit) {
    // 🚀 物理洗滌：確保 itemIndex 在 HTML onclick 中是合法的字串或數值
    const safeItemIndex = (itemIndex === null || itemIndex === undefined) ? 'null' : itemIndex;

    return `
        <div class="flex items-center gap-3 w-full">
            ${isEdit ? `
                <button onclick="App.deleteScheduleData('${tripId}', ${dayIndex}, ${safeItemIndex})" 
                        class="w-12 h-12 shrink-0 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-rose-100 shadow-sm hover:bg-rose-100">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" stroke-linecap="round" stroke-linejoin="round"/>
                    </svg>
                </button>
            ` : ''}

            <button onclick="App.modalRemove('sched-modal')" 
                    class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all hover:bg-slate-200">
                取消
            </button>

            <button onclick="App.saveScheduleData('${tripId}', ${dayIndex}, ${safeItemIndex})" 
                    class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all hover:brightness-110">
                ${isEdit ? '更新節點' : '確認儲存'}
            </button>
        </div>`;
},

/** 🛍️ [Human Framework] 同步視覺化購物編輯器 (Info 軌道補強版) */
syncShoppingEditor() {
    const memo = document.getElementById('sched-memo').value;
    const container = document.getElementById('shopping-list-container');
    if (!container) return;

    try {
        const products = JSON.parse(memo || "[]");
        container.innerHTML = products.map((p, idx) => `
            <div class="bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100 animate-fade-in space-y-3">
                <div class="flex gap-2 items-center">
                    <input type="text" oninput="App.updateJsonFromVisual(${idx}, 'name', this.value)" 
                           class="flex-1 bg-slate-50 px-3 py-2 rounded-xl text-[11px] font-black text-slate-700 outline-none focus:ring-1 focus:ring-pink-100" value="${p.name}">
                    <div class="flex items-center gap-1 bg-pink-50 px-3 py-2 rounded-xl">
                        <span class="text-[9px] text-pink-400 font-bold">¥</span>
                        <input type="number" oninput="App.updateJsonFromVisual(${idx}, 'price', this.value)" 
                               class="w-16 bg-transparent text-[11px] font-black theme-text-pink outline-none tabular-nums" value="${p.price}">
                    </div>
                    <button onclick="App.removeProductFromVisual(${idx})" class="w-8 h-8 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                </div>
                <div class="relative">
                    <textarea oninput="App.updateJsonFromVisual(${idx}, 'info', this.value)" 
                              placeholder="商品特色或選購心得..."
                              class="w-full bg-slate-50/50 p-3 rounded-xl text-[10px] font-bold text-slate-500 border-none outline-none focus:ring-1 focus:ring-slate-100 min-h-[50px] leading-relaxed resize-none">${p.info || ''}</textarea>
                </div>
            </div>
        `).join('');
    } catch (e) {
        container.innerHTML = `<p class="text-[10px] text-slate-400 italic px-2">等待 JSON 格式對焦...</p>`;
    }
},


/** 從視覺編輯器更新 JSON 燃料 (V2026.ULTRA 全頻寬導通版) */
updateJsonFromVisual(idx, key, value) {
    const memoInput = document.getElementById('sched-memo');
    if (!memoInput) return;
    
    try {
        let products = JSON.parse(memoInput.value || "[]");
        if (products[idx]) {
            // 🚀 關鍵對焦：確保 info 欄位能被正確賦值並寫回 memoInput
            products[idx][key] = (key === 'price') ? Number(value) : value;
            
            // 物理回填，這是 viewEngine 渲染小卡的真值來源
            memoInput.value = JSON.stringify(products);
            
            console.log(`📡 [Shopping-Weld] ${key} 已同步至索引 ${idx}`);
        }
    } catch (e) {
        console.error("❌ [Shopping-Update-Collapse]:", e);
    }
},


/** 🗑️ [Visual Editor] 從視覺化清單中物理移除商品 (V2026.ULTRA) */
removeProductFromVisual(pIdx) {
    const memoInput = document.getElementById('sched-memo');
    if (!memoInput) return;

    try {
        let products = JSON.parse(memoInput.value || "[]");
        // 🚀 執行物理切除
        products.splice(pIdx, 1);
        
        // 🚀 回填燃料文字框 (美化版)
        memoInput.value = JSON.stringify(products, null, 2);
        
        // 🚀 觸發視覺編輯器熱更新
        this.syncShoppingEditor();
        
        uiManager.showToast("🗑️", "已從燃料包移除商品");
    } catch (e) {
        console.error("❌ 移除商品時 JSON 解析異常", e);
    }
},

// ============================================================
// 個別行程匯入與匯出模組
// ============================================================



/** 🚀 [V2026.ULTRA] 數據傳輸：景點級複製 (取代導出) */
async copyNodeJsonToClipboard(tripId, dayIndex, itemIndex) {
    const trip = state.trips.find(t => t.id === tripId);
    const node = trip?.days[dayIndex]?.schedules[itemIndex];
    if (!node) return;

    const fuelPackage = { type: "NODE_FUEL", payload: node };
    try {
        await navigator.clipboard.writeText(JSON.stringify(fuelPackage, null, 2));
        uiManager.showToast("📋", "JSON 燃料已複製至剪貼簿");
    } catch (err) {
        uiManager.showToast("❌", "複製失敗");
    }
},

/** 🚀 數據注入總線：執行物理分流 (V2026.ULTRA | 購物燃料與相容性修復版) */
async importNodeViaClipboard(tripId, dayIndex, fillOnly = false) {
    try {
        // 🚀 1. 物理獲取與洗滌：封殺 Clipboard API 潛在的非同步中斷
        const text = await navigator.clipboard.readText();
        if (!text) return false;

        const cleanedText = text.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        
        // 🚀 2. 解析防禦：若內容非標準 JSON 格式，直接執行「安靜退出」
        let data;
        try {
            data = JSON.parse(cleanedText);
        } catch (jsonErr) {
            console.warn("📡 [Import-Blocked] 剪貼簿非 JSON 格式，攔截崩潰以維持 UI 導通");
            return false; 
        }
        
        // 3. 安全性指紋檢查
        if (data.type !== "NODE_FUEL" || !data.payload) {
            console.warn("📡 [Import-Blocked] 遺失 TravelFlow 專屬指紋");
            return false;
        }

        const payload = data.payload;
        const style = (payload.style || 'default').toLowerCase();
        let finalItem = null;

        // 4. 🚀 多態發動機分流 (新增 Shopping 軌道)
        switch(style) {
            case 'transport':
                finalItem = this._importTransportLogic(payload);
                break;
            case 'json':
                finalItem = this._importItineraryLogic(payload);
                break;
            case 'shopping':
                // ✨ 購物清單燃料導通
                finalItem = {
                    style: 'shopping',
                    time: payload.time || "12:00",
                    location: payload.location || "購物行程",
                    memo: payload.memo || "[]",
                    imageUrl: payload.imageUrl || ""
                };
                break;
            default:
                finalItem = this._importGeneralLogic(payload);
                break;
        }

        // 5. 執行物理填充或寫入
        if (fillOnly) {
            this._fillModalFields(finalItem);
            uiManager.showToast('🔌', '模式專屬燃料已裝填');
            return true; // 告知調用者匯入成功
        } else {
            await this._persistImportedNode(tripId, dayIndex, finalItem);
            uiManager.showToast('⚡', '外部節點已導通寫入');
            return true;
        }

    } catch (e) {
        // 🚀 最終防線：封殺所有導致 UI 鎖死的例外
        console.error("📡 [Import-Fatal]:", e);
        return false;
    }
},

/** 🚄 交通路網匯入發動機 */
_importTransportLogic(payload) {
    // 確保 Transport 燃料的特定欄位完整性
    return {
        style: 'transport',
        time: payload.time || "",
        location: payload.location || "交通路網",
        memo: payload.memo || "", // 這裡存放的是 Transport STRICT JSON
        imageUrl: payload.imageUrl || ""
    };
},

/** ✨ 行程景點匯入發動機 */
_importItineraryLogic(payload) {
    // 確保 Itinerary 燃料的陣列對焦
    return {
        style: 'json',
        time: payload.time || "",
        location: payload.location || "景點燃料",
        memo: payload.memo || "", // 這裡存放的是 Itinerary STRICT JSON 陣列
        imageUrl: payload.imageUrl || ""
    };
},

/** 📍 一般型式匯入發動機 */
_importGeneralLogic(payload) {
    return {
        style: payload.style || 'default',
        time: payload.time || "",
        location: payload.location || "未命名節點",
        memo: payload.memo || "",
        imageUrl: payload.imageUrl || ""
    };
},

/** 🧪 輔助：自動填充彈窗欄位 */
_fillModalFields(item) {
    const styleEl = document.getElementById('sched-style');
    const timeEl = document.getElementById('sched-time');
    const locEl = document.getElementById('sched-location');
    const memoEl = document.getElementById('sched-memo');

    if (styleEl) styleEl.value = item.style;
    if (timeEl) timeEl.value = item.time;
    if (locEl) locEl.value = item.location;
    if (memoEl) memoEl.value = item.memo;

    // 強制執行 UI 連動，確保 Prompt 按鈕與 Textarea 高度同步更新
    this.syncStyleUI(item.style, item);
},

/** 🧪 輔助：物理持久化寫入 (V2026.ULTRA 接口對焦版) */
async _persistImportedNode(tripId, dayIndex, item) {
    const tripIdx = state.trips.findIndex(t => t.id === tripId);
    if (tripIdx === -1) return;
    
    // 1. 執行內存數據焊接
    state.trips[tripIdx].days[dayIndex].schedules.push(item);
    
    // 🚀 2. 物理指紋對焦：確保備援系統感知到異動
    const nowTs = Date.now();
    state.lastLocalEdit = nowTs;
    localStorage.setItem('tf_last_local_edit', nowTs);

    try {
        // 🚀 3. 磁區固化：呼叫 V2026 最新接口 saveAllTrips
        await dbManager.saveAllTrips(state.trips);
        
        // 4. 物理移除模態框
        // 💡 職人診斷：對焦 add-node-modal 與 sched-modal 雙重導通
        this.modalRemove('add-node-modal');
        this.modalRemove('sched-modal'); 

        // 5. 視圖即時重繪
        const contentArea = document.getElementById('day-content-area');
        if (contentArea) {
            viewEngine.renderDayDetailContent(contentArea, state.trips[tripIdx], dayIndex);
        }
        
        console.log(`📡 [Import-Node-Success] 節點已固化並對焦指紋: ${nowTs}`);
    } catch (err) {
        console.error("❌ [Persistence-Fatal] 外部節點固化失敗:", err);
        uiManager.showToast('⚠️', "磁區寫入墜毀，數據未固化");
    }
},

/** 🎨 視覺連動：UI 狀態切換主控 (V2026.ULTRA 動態重繪修正版) */
async syncStyleUI(style, item = null) {
    const dynamicContainer = document.getElementById('dynamic-sector-container');
    const memoInput = document.getElementById('sched-memo');
    const memoLabel = document.getElementById('memo-label');
    const aiBtn = document.getElementById('ai-btn-container');

    if (!dynamicContainer || !memoInput) return;

    // 🚀 1. 物理重啟：根據新模式，叫 ViewEngine 重新噴發 HTML 零件
    // 💡 職人診斷：這步會解決你「部分模式看不到輸入框」的問題，因為 HTML 是剛出爐的
    dynamicContainer.innerHTML = viewEngine._getSectorByStyle(style, item);

    // 🚀 2. 外部注入攔截 (模式 5：Import)
    if (style === 'import') {
        await this.importNodeViaClipboard(null, null, true).catch(() => {});
        const styleEl = document.getElementById('sched-style');
        style = (styleEl && styleEl.value !== 'import') ? styleEl.value : 'default';
        // 注入後模式可能改變，遞迴重刷 UI 確保導通
        return this.syncStyleUI(style, item);
    }

    // 🚀 3. 重新對位 Sector 指針 (對應剛重繪完的 DOM)
    const sectors = {
        memoLabel, memoInput, 
        aiBtnContainer: aiBtn,
        basicLocation: document.getElementById('basic-location-sector'),
        shoppingConfig: document.getElementById('shopping-config-sector'),
        routeConfig: document.getElementById('route-config-sector'),
        upload: document.getElementById('image-upload-sector'),
        visualEditor: document.getElementById('visual-shopping-editor')
    };

    // 🚀 4. 基礎樣式預洗
    memoInput.classList.remove('font-mono', 'theme-text-pink', 'bg-slate-50/50', 'h-64', 'h-40');
    memoInput.style.height = ''; 
    if (aiBtn) aiBtn.innerHTML = "";

    // 🚀 5. 模式發動機分流 (調用你貼給我的那些子函數)
    switch (style) {
        case 'json':      this._setupJsonMode(sectors, item); break;
        case 'transport': this._setupTransportMode(sectors, item); break;
        case 'shopping':  this._setupShoppingMode(sectors, item); break;
        case 'image':     this._setupImageMode(sectors, item); break;
        default:          this._setupDefaultMode(sectors, item); break;
    }

    if (navigator.vibrate) navigator.vibrate(5);
},

/** 🧩 1. [Mode] 行程景點 JSON 模式 (數據回填與座標面板導通) */
_setupJsonMode(sectors, item) {
    // 🚀 1. 物理導通：點亮基礎容器 (時間與標題列)
    this._showSector(sectors.basicLocation, 'grid'); 
    
    // 🚀 2. 數據回填：確保現有燃料精確填入 input 欄位
    if (item) {
        const timeInput = document.getElementById('sched-time');
        const locInput = document.getElementById('sched-location');
        if (timeInput) timeInput.value = item.time || "";
        if (locInput) locInput.value = item.location || "";
    }
    
    // 🚀 3. 面板點亮：尋找並渲染路網配置器 (起始座標、目標終點)
    const routeConfig = document.getElementById('route-config-sector');
    if (routeConfig) {
        this._showSector(routeConfig, 'block');
        // 核心渲染：這步會執行起始座標與目標景點的物理生成
        this.renderRouteConfig(routeConfig, 'json', item);
    }

    // 🚀 4. 樣式染毒與引擎對焦
    sectors.memoInput.classList.add('font-mono', 'theme-text-pink', 'bg-slate-50/50', 'h-64');
    sectors.memoLabel.innerText = "數據燃料核心 (ITINERARY)";
    
    // 啟動 AI 行程指令引擎
    this._syncItineraryEngine(sectors, item);
},


/** 🧩 2. [Mode] 交通路網小卡模式 (起訖站面板與數據回填導通) */
_setupTransportMode(sectors, item) {
    // 🚀 1. 物理點亮：顯示基礎容器 (時間與路線標題列)
    this._showSector(sectors.basicLocation, 'grid');
    
    // 🚀 2. 數據回填：確保現有交通燃料 (時間/路線名) 精確回填
    if (item) {
        const timeInput = document.getElementById('sched-time');
        const locInput = document.getElementById('sched-location');
        // 💡 職人提醒：這裡的 time 通常對應交通的「出發時間」
        if (timeInput) timeInput.value = item.time || "";
        if (locInput) locInput.value = item.location || "";
    }
    
    // 🚀 3. 路網面板點亮：對位 route-config-sector (包含 S0 起點、途經點、終點)
    const routeConfig = document.getElementById('route-config-sector');
    if (routeConfig) {
        this._showSector(routeConfig, 'block');
        // 執行路網配置渲染，將具體的站點數據注入 UI
        this.renderRouteConfig(routeConfig, 'transport', item);
    }

    // 🚀 4. 樣式染色與 AI 指令發動機對焦
    sectors.memoInput.classList.add('font-mono', 'theme-text-pink', 'bg-slate-50/50', 'h-64');
    sectors.memoLabel.innerText = "數據燃料核心 (TRANSPORT)";
    
    // 導通交通路網專屬 JSON 指令引擎
    this._syncTransportEngine(sectors, item);
},


/** 🧩 3. [Mode] 購物清單模式 (視覺編輯器與 AI 參數導通) */
_setupShoppingMode(sectors, item) {
    // 🚀 1. 物理導通：點亮所有必要的容器 (基礎、AI 參數、視覺編輯器)
    this._showSector(sectors.basicLocation, 'grid');
    this._showSector(sectors.shoppingConfig, 'block');
    this._showSector(sectors.visualEditor, 'block');
    
    // 🚀 2. 數據回填：確保基礎欄位精確對焦
    if (item) {
        const locInput = document.getElementById('sched-location');
        const timeInput = document.getElementById('sched-time');
        if (locInput) locInput.value = item.location || "購物行程";
        if (timeInput) timeInput.value = item.time || "";
        
        // 💡 職人診斷：若存在 memo 燃料，立即點火視覺編輯器
        if (item.memo && sectors.memoInput) {
            sectors.memoInput.value = item.memo;
            // 物理喚醒視覺清單，讓 [name/price] 立即顯示
            this.syncShoppingEditor();
        }
    }

    // 🚀 3. 樣式染色與引擎調度
    sectors.memoInput.classList.add('font-mono', 'theme-text-pink', 'bg-slate-50/50', 'h-40');
    sectors.memoLabel.innerText = "購物清單燃料 (STRICT JSON)";
    
    // 導通購物專屬 AI 指令與 Copy 按鈕
    this._syncShoppingEngine(sectors, item);
},


/** 🧩 4. [Mode] 圖片影像模式 (數據回填與預覽強制導通) */
_setupImageMode(sectors, item) {
    // 🚀 1. 物理點亮：基礎容器與圖片上傳區
    this._showSector(sectors.basicLocation, 'grid');
    
    const uploadSector = document.getElementById('image-upload-sector');
    if (uploadSector) {
        this._showSector(uploadSector, 'block');
    }

    // 🚀 2. 數據回填：確保時間、地點與 URL 精確對位
    if (item) {
        const timeInput = document.getElementById('sched-time');
        const locInput = document.getElementById('sched-location');
        const urlInput = document.getElementById('node-image-url');
        const previewBox = document.getElementById('image-preview-box');

        if (timeInput) timeInput.value = item.time || "";
        if (locInput) locInput.value = item.location || "影像記錄節點";
        
        // 💡 物理焊接：將 Base64 燃料填入 URL 欄位
        if (urlInput) urlInput.value = item.imageUrl || "";

        // 💡 視覺焊接：若有圖片數據，強制點亮預覽框
        if (previewBox) {
            if (item.imageUrl) {
                previewBox.innerHTML = `<img src="${item.imageUrl}" class="w-full h-full object-cover animate-fade-in">`;
            } else {
                previewBox.innerHTML = `<span class="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">File Preview Pending</span>`;
            }
        }
    }

    // 🚀 3. 介面調配
    sectors.memoInput.classList.add('h-40');
    sectors.memoLabel.innerText = "圖片文字備註";
    
    console.log("📸 [Mode-Image] 影像軌道對焦成功");
},

/** 🧩 5. [Mode] 預設文字模式 - 終極洗滌版 */
_setupDefaultMode(sectors, item) {
    // 🚀 1. 物理點亮：恢復基礎時間與地點欄位 (確保動態生成的 Sector 顯示)
    this._showSector(sectors.basicLocation, 'grid'); 
    
    // 🚀 2. 數據回填
    if (item) {
        const locInput = document.getElementById('sched-location');
        const timeInput = document.getElementById('sched-time');
        if (locInput) locInput.value = item.location || "";
        if (timeInput) timeInput.value = item.time || "";
        if (sectors.memoInput) sectors.memoInput.value = item.memo || "";
    }

    // 🚀 3. 樣式洗滌
    sectors.memoInput.classList.add('h-64');
    sectors.memoLabel.innerText = "行程備註內容";
    if (sectors.memoInput) sectors.memoInput.placeholder = "輸入行程詳細備註...";
},


/** 🧬 [Internal] 實體點亮工具 */
_showSector(el, displayType) {
    if (el) {
        el.classList.remove('hidden');
        el.style.display = displayType;
    }
},


/** 🛍️ [Engine] 購物燃料發動機 (精簡版) */
_syncShoppingEngine(sectors, item) {
    sectors.memoLabel.innerText = "購物清單燃料 (STRICT JSON)";
    sectors.memoInput.placeholder = "請貼上 AI 生成的高品質購物燃料...";
    sectors.memoInput.classList.add('font-mono', 'theme-text-pink', 'bg-slate-50/50');
    
    // 🚀 僅插入功能按鈕，不顯示任何 Prompt 文字框
    sectors.aiBtnContainer.innerHTML = `
        <button onclick="App.copyShoppingPromptToClipboard()" 
                class="theme-bg text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
            ✨ Copy Prompt
        </button>
    `;
},


/** 🚄 專屬發動機：交通路網指令對焦 (V2026.ULTRA 實戰細節強化版) */
_syncTransportEngine(sectors, item) {
    const TRANSPORT_PROMPT = `【STRICT_JSON_ONLY】
請根據座標約束，生成高品質交通數據（繁體中文），禁前言。

【細節強化協定】
1. [note] 必須包含實境空間指引（月台編號、幾號出口、手扶梯方位）。
2. 長距離轉乘必須提供「⚠️ 注意」或「📍 位置指引」（排隊人潮、步行分鐘、始發站建議）。
3. [stops] 僅限起點、終點、中繼景點、樞紐大站，封殺其餘小站。
4. [segment_cost] 每段必須精確（含特急/指定席料金），純數字。
5. [timetable] 請提供 Google Maps 點對點路線連結（transit 模式），格式如下：
   https://www.google.com/maps/dir/起點名稱/終點名稱/?travelmode=transit
   多段路線提供第一段主要區間即可。

{
  "operator": "業者/主要車種",
  "cost": 0,
  "hubStation": "樞紐大站名稱（無則省略此欄）",
  "spotlight": "✨ 最佳轉乘策略與避坑建議（2-3句）",
  "alerts": ["票券限制/季節擁擠/注意事項"],
  "boarding": [
    { "type": "rail", "segment": "路徑段落描述（如：京都站→烏丸御池 地下鐵烏丸線）" }
  ],
  "stops": [
    {
      "name": "站名",
      "time": "HH:mm",
      "type": "dep",
      "seg": 0,
      "segment_cost": 0,
      "note": "📍 位置指引或 ⚠️ 注意事項（必填，禁純動作描述）"
    }
  ],
  "timetable": "https://www.google.com/maps/dir/起點/終點/?travelmode=transit"
}

【約束】
- [type] 只能是 dep / xfer / arr 三種。
- VISIT_STOP（景點站）必須有抵達(arr)與再出發(dep)兩筆。
- [note] 必須含空間資訊或風險警告，禁止純動作描述。
- 禁止輸出官方時刻表 URL，統一使用 Google Maps 路線連結。`;

    sectors.memoLabel.textContent = "交通燃料 (TRANSPORT JSON)";
    sectors.memoInput.placeholder = "請貼上交通 JSON...";
    sectors.memoInput.style.height = '380px';
    
    this._applyAiStyling(sectors, TRANSPORT_PROMPT);
},

/** ✨ 專屬發動機：行程景點數據與指令對焦 */
_syncItineraryEngine(sectors, item) {
    const ITINERARY_PROMPT = `【STRICT_JSON_ONLY】
請根據座標約束，安排高品質行程模組（繁體中文），禁前言。
[
  {
    "time": "HH:mm",
    "task": "【標題】精確摘要",
    "move": "建議移動手段/月台資訊",
    "expense": "預估金額(數字)",
    "spotlight": "✨必看亮點/避坑指南/排隊攻略",
    "note": "細節備註"
  }
]
【數據填充協定】
1. spotlight 欄位必須包含實質建議，嚴禁廢話。
2. expense 僅限餐飲與門票。
3. 🚀 筆記純化：note 欄位嚴禁包含 "seg"、"物理座標"、"數據對焦" 或任何技術指令術語。請僅填寫「實境旅遊相關的細節備註」（例如：車站置物櫃位置、附近便利商店等）。若無重要細節則留空 ""。
4. 🚀 標題主權：[task] 欄位嚴禁出現「功能模組」、「語義對焦」、「數據純化」、「燃料包」等技術術語。標題必須回歸「實境旅遊場景」（例如：【移動】烏丸御池至近鐵奈良）。`;

    sectors.memoLabel.textContent = "數據燃料核心 (STRICT ITINERARY JSON)";
    sectors.memoInput.placeholder = "請貼上由 AI Protocol 生成的高品質行程陣列 JSON...";
    sectors.memoInput.style.height = '320px';
    
    this._applyAiStyling(sectors, ITINERARY_PROMPT);
},

/** 🎨 私有工具：應用 AI 視覺染色與按鈕注入 (修復：封殺強行隱藏基礎欄位的邏輯) */
_applyAiStyling(sectors, prompt) {
    // 🚀 關鍵修復：絕對不要在這裡執行 sectors.basicLocation.classList.add('hidden')
    // 否則子函數剛點亮的框會被立即抹除。

    // 1. 樣式染色
    if (sectors.memoInput) {
        sectors.memoInput.classList.add('font-mono', 'theme-text-pink', 'bg-slate-50/50');
    }
    
    // 2. 注入 AI Protocol 按鈕
    if (sectors.aiBtnContainer) {
        // 職人對位：使用 viewEngine 提供的按鈕組件，若無則降級為原生 button
        if (viewEngine && typeof viewEngine.renderAICopyBtn === 'function') {
            sectors.aiBtnContainer.innerHTML = viewEngine.renderAICopyBtn(prompt);
        } else {
            // 備援方案：Base64 對位
            const b64 = btoa(encodeURIComponent(prompt));
            sectors.aiBtnContainer.innerHTML = `
                <button onclick="App.copyToClipboard('${b64}')" 
                        class="theme-bg text-white px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter active:scale-95 transition-all shadow-sm">
                    ✨ Copy Protocol
                </button>
            `;
        }
    }
},


/** 🖼️ 專屬發動機：影像模式對焦 */
_syncImageEngine(sectors) {
    // 🚀 1. 物理分流：顯示上傳區，隱藏 AI 配置區
    if (sectors.upload) sectors.upload.classList.remove('hidden');
    if (sectors.basicLocation) sectors.basicLocation.classList.remove('hidden');
    if (sectors.routeConfig) sectors.routeConfig.classList.add('hidden');
    
    // 🚀 2. 語義對焦
    sectors.memoLabel.textContent = "影像備註與描述";
    sectors.memoInput.placeholder = "請輸入關於此影像的記錄內容...";
    
    // 🚀 3. 視覺染色：回歸非代碼模式的高度與樣式
    sectors.memoInput.classList.remove('font-mono', 'theme-text-pink', 'bg-slate-50/50');
    sectors.memoInput.style.height = '180px'; // 影像模式不需要長篇大論，縮小空間以導通佈局
    
    // 🚀 4. 清理 AI 殘留
    if (sectors.aiBtnContainer) sectors.aiBtnContainer.innerHTML = "";
},

/** 📍 專屬發動機：恢復預設(一般)模式樣式 */
_syncDefaultEngine(sectors) {
    // 🚀 1. 物理分流：恢復標準欄位，封殺所有特定模式區塊
    if (sectors.upload) sectors.upload.classList.add('hidden');
    if (sectors.basicLocation) sectors.basicLocation.classList.remove('hidden');
    if (sectors.routeConfig) sectors.routeConfig.classList.add('hidden');
    
    // 🚀 2. 語義對焦
    sectors.memoLabel.textContent = "行程備註內容";
    sectors.memoInput.placeholder = "輸入行程詳細備註...";
    
    // 🚀 3. 視覺染色：移除所有 AI 染色與 Mono 字體
    sectors.memoInput.classList.remove('font-mono', 'theme-text-pink', 'bg-slate-50/50');
    sectors.memoInput.style.height = '256px'; // 標準高度
    
    // 🚀 4. 清理指令燃料
    if (sectors.aiBtnContainer) sectors.aiBtnContainer.innerHTML = "";
},


/** 🏗️ 渲染器歸一化：路網/座標配置器 (V2026.ULTRA 導航指紋強化版) */
renderRouteConfig(container, style = 'transport', item = null) {
    const currentTime = item?.time || document.getElementById('sched-time')?.value || "";
    let startFuel = "", endFuel = "";
    const isTransport = (style === 'transport');

    // 🚀 1. 初始解析：起訖站對焦
    if (item?.location) {
        if (isTransport && item.location.includes(' → ')) {
            const parts = item.location.split(' → ');
            startFuel = parts[0].trim();
            endFuel = parts[1].trim();
        } else { endFuel = item.location.trim(); }
    }

    // 🚀 2. 核心焊接：注入策略切換與「隱藏式 Hub 輸入軌道」
    container.innerHTML = `
        <div class="space-y-4 p-5 bg-white/60 rounded-[2rem] border border-slate-100 animate-fade-in shadow-sm">
            
            <div class="space-y-2 mb-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 text-center block">轉乘路網策略</label>
                <div class="relative w-full h-12 bg-slate-100 rounded-2xl p-1.5 flex items-center border border-slate-200/50">
                    <div id="strategy-slider" class="absolute h-[34px] w-[calc(50%-6px)] bg-white rounded-xl shadow-sm transition-all duration-300 ease-out" 
                         style="transform: ${item?.hubReturn ? 'translateX(100%)' : 'translateX(0)'}"></div>
                    
                    <label class="relative flex-1 h-full flex items-center justify-center cursor-pointer z-10" onclick="App.updateStrategyUI(false)">
                        <input type="radio" name="strategy-gate" class="sr-only" ${!item?.hubReturn ? 'checked' : ''}>
                        <span class="strategy-label text-[11px] font-black transition-colors ${!item?.hubReturn ? 'theme-text-pink' : 'text-slate-400'}">📍 順向銜接</span>
                    </label>
                    
                    <label class="relative flex-1 h-full flex items-center justify-center cursor-pointer z-10" onclick="App.updateStrategyUI(true)">
                        <input type="radio" name="strategy-gate" class="sr-only" ${item?.hubReturn ? 'checked' : ''}>
                        <span class="strategy-label text-[11px] font-black transition-colors ${item?.hubReturn ? 'theme-text-pink' : 'text-slate-400'}">🚉 回歸大站</span>
                    </label>

                    <input type="checkbox" id="hub-return-toggle" class="hidden" ${item?.hubReturn ? 'checked' : ''}>
                </div>

                <div id="hub-input-sector" class="${item?.hubReturn ? '' : 'hidden'} mt-3 animate-slide-up">
                    <div class="relative">
                        <input type="text" id="hub-station-name" placeholder="輸入樞紐大站 (如：京都車站)" 
                               class="w-full bg-pink-50/50 border-none rounded-xl p-3 pl-9 text-[11px] font-black theme-text-pink shadow-inner outline-none ring-1 ring-pink-100"
                               value="${item?.hubStation || ''}">
                        <span class="absolute left-3 top-1/2 -translate-y-1/2 text-[10px]">🚉</span>
                    </div>
                </div>

                <div id="strategy-hint-box" class="flex gap-1.5 px-2 mt-1 animate-fade-in">
                    <span class="shrink-0 text-[10px] theme-text-pink font-black mt-0.5">ℹ️</span>
                    <p id="strategy-hint" class="text-[11px] text-slate-600 font-bold leading-snug tracking-tight">
                        ${item?.hubReturn ? '優先檢索樞紐車站以獲取快車燃料' : '嚴禁物理回溯，以景點為新起點就近導通'}
                    </p>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase px-1">${isTransport ? '出發時間' : '預定時間'}</label>
                    <input type="time" id="route-time" value="${currentTime}" class="w-full bg-white rounded-2xl p-4 text-xs font-bold border-none ring-1 ring-slate-100 shadow-sm outline-none focus:ring-pink-100 transition-all">
                </div>
                <div class="space-y-1.5">
                    <label class="text-[10px] font-black text-slate-400 uppercase px-1">${isTransport ? '起點站 (S0)' : '起始座標'}</label>
                    <input type="text" id="route-start" value="${startFuel}" placeholder="例如：京都車站" class="w-full bg-white rounded-2xl p-4 text-xs font-bold border-none ring-1 ring-slate-100 shadow-sm outline-none focus:ring-pink-100 transition-all">
                </div>
            </div>
            
            <div id="mid-points-container" class="space-y-2"></div>

            <div class="flex items-center gap-2 pt-1">
                <button onclick="App.addMidPoint()" class="flex-1 py-3.5 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300 hover:text-pink-400 hover:border-pink-100 transition-all active:scale-95">+ 增加中繼點</button>
                <div class="flex-[2] space-y-1.5">
                    <input type="text" id="route-end" value="${endFuel}" placeholder="目標終點" class="w-full bg-white rounded-2xl p-4 text-xs font-bold border-none ring-1 ring-slate-100 shadow-sm outline-none focus:ring-pink-100 transition-all">
                </div>
            </div>
        </div>
    `;

    // 🚀 3. 中繼站數據智能還原
    if (item?.memo && isTransport) {
        try {
            const fuel = JSON.parse(item.memo);
            if (Array.isArray(fuel.stops) && fuel.stops.length > 2) {
                // 過濾掉頭尾與 hub 站名，其餘填入 mid-points
                fuel.stops.slice(1, -1).forEach(stop => {
                    const name = typeof stop === 'object' ? stop.name : stop;
                    if (name === item.hubStation) return; // 避開已經在 hub 欄位的站名
                    const seg = stop.seg !== undefined ? stop.seg : 0;
                    if (window.App?.addMidPoint) window.App.addMidPoint(`${name} [seg:${seg}]`);
                });
            }
        } catch (err) { console.log("📡 [Route-Config] 燃料解析略過"); }
    }
},

/** 🎨 轉乘策略 UI 實體聯動 (V2026.ULTRA 視認性加固版) */
updateStrategyUI(isHubReturn) {
    const slider = document.getElementById('strategy-slider');
    const labels = document.querySelectorAll('.strategy-label');
    const hint = document.getElementById('strategy-hint');
    const toggle = document.getElementById('hub-return-toggle');

    if (!slider || !toggle || !hint) return;

    // 1. 物理位移：滑塊背景動畫導通
    slider.style.transform = isHubReturn ? 'translateX(100%)' : 'translateX(0)';
    
    // 2. 狀態固化：同步隱藏的 checkbox 供存檔模組採集
    toggle.checked = isHubReturn;

    // 3. 撥盤文字對焦：動態切換 Highlight 顏色
    labels.forEach((label, idx) => {
        const active = (idx === 1 && isHubReturn) || (idx === 0 && !isHubReturn);
        label.classList.toggle('theme-text-pink', active);
        label.classList.toggle('text-slate-400', !active);
    });

    // 4. 語義提示對焦：強化可讀性 (移除斜體，維持中深灰色)
    // 💡 職人診斷：此處文字內容已與 renderRouteConfig 初始狀態完全對位
    hint.innerText = isHubReturn 
        ? '優先檢索樞紐車站以獲取快車燃料' 
        : '嚴禁物理回溯，以景點為新起點就近導通';

    // 🚀 物理觸感反饋
    if (navigator.vibrate) navigator.vibrate(8);
    
    console.log(`📡 [Strategy-Switch] 策略已對焦: ${isHubReturn ? '大站回流' : '順向銜接'}`);
},

/** ➕ 中繼站增生邏輯 (V2026.ULTRA 狀態鎖定版) */
addMidPoint(initialValue = "") {
    const container = document.getElementById('mid-points-container');
    if (!container) return;

    // 🚀 1. 數據分流：從字串中精確剝離物理標籤 [seg:n]
    let cleanValue = initialValue;
    let segId = null; 
    
    if (initialValue.includes('[seg:')) {
        const match = initialValue.match(/\[seg:(\d+)\]/);
        if (match) {
            segId = match[1];
            // 物理洗滌：移除標籤並去除首尾空格
            cleanValue = initialValue.replace(/\[seg:\d+\]/, '').trim();
        }
    }

    // 🚀 2. 智慧繼承校準：封殺斷層風險
    if (segId === null) {
        // 抓取最後一個有效的段號，若容器為空則初始化為 S0
        const allInputs = container.querySelectorAll('.mid-point-input');
        const lastInput = allInputs[allInputs.length - 1];
        segId = lastInput ? (lastInput.dataset.seg || "0") : "0";
    }

    const div = document.createElement('div');
    div.className = "mid-point-row flex items-center gap-2 animate-fade-in mb-2 group"; 
    
    // 🚀 3. 物理與語義焊接：強化 Sector Switch 觸感
    div.innerHTML = `
        <div class="flex-none flex flex-col items-center cursor-pointer select-none active:scale-95 transition-transform" 
             onclick="App.cycleSegId(this)" title="手動分段對位">
            <div class="seg-label text-[8px] font-black theme-text-pink opacity-80 tabular-nums">S${segId}</div>
            <div class="text-[10px] text-slate-300 leading-none">↓</div>
        </div>
        <input type="text" 
               data-seg="${segId}"
               class="mid-point-input flex-1 bg-slate-50 rounded-xl p-2.5 text-xs font-bold border-none ring-1 ring-slate-100 focus:ring-[var(--theme-primary)] transition-all outline-none" 
               placeholder="途經站名 (HH:mm)" 
               oninput="this.setAttribute('value', this.value)">
        <button onclick="this.parentElement.remove()" 
                class="text-slate-300 hover:text-red-400 p-2 transition-colors active:scale-90 opacity-0 group-hover:opacity-100">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
        </button>
    `;

    // 4. 數據注入與物理對焦
    const input = div.querySelector('input');
    input.value = cleanValue;
    input.setAttribute('value', cleanValue);

    container.appendChild(div);
    
    // 5. 物理導通：若是手動新增（非回填），則自動將焦點移入
    if (!initialValue) {
        input.focus();
    }
},




/** 🔄 物理標籤循環：手動修正分段歸屬 (V2026.ULTRA 動態感應版) */
cycleSegId(el) {
    const input = el.parentElement.querySelector('input');
    const label = el.querySelector('.seg-label');
    
    // 🚀 核心優化：動態探測目前「乘車方案」的數量
    // 從 promptEditTransport 邏輯中得知，交通段數由 boarding 決定
    // 我們可以從 UI 上的 seg-btn 數量來推斷最大段號
    const maxSectors = document.querySelectorAll('.seg-btn').length || 3;
    
    let currentSeg = parseInt(input.dataset.seg || 0);
    const nextSeg = (currentSeg + 1) % maxSectors; 
    
    // 物理同步
    input.dataset.seg = nextSeg;
    label.textContent = `S${nextSeg}`;
    
    // 🎨 視覺染色同步：讓 S0, S1, S2 有微弱的色差區分，提升視認性
    const colors = ['#fb7185', '#38bdf8', '#4ade80']; // 玫瑰、天空、大地
    label.style.color = colors[nextSeg % colors.length];
    
    // 物理觸覺反饋
    el.classList.add('scale-125', 'rotate-12');
    setTimeout(() => el.classList.remove('scale-125', 'rotate-12'), 200);
    
    console.log(`📡 [Sector-Weld] Point re-assigned to S${nextSeg}`);
},



/** 🛰️ 採集器：UI 路網物理採集 */
collectRouteData() {
    const start = document.getElementById('route-start')?.value.trim() || "";
    const end = document.getElementById('route-end')?.value.trim() || "";
    const routeTime = document.getElementById('route-time')?.value || "";
    const midContainer = document.getElementById('mid-points-container');
    
    const mids = midContainer 
        ? Array.from(midContainer.querySelectorAll('.mid-point-input')).map(el => ({
            value: el.value.trim(),
            seg: el.dataset.seg !== undefined ? parseInt(el.dataset.seg) : null
        })).filter(v => v.value !== "")
        : [];

    return { start, end, routeTime, mids };
},



/** 🧬 處理器：交通燃料無損焊接與導航指紋注入 (V2026.ULTRA) */
processTransportFuel(memo, routeData) {
    let tFuel = { operator: "", cost: 0, alerts: [], boarding: [], stops: [], spotlight: "" };
    try { tFuel = JSON.parse(memo || "{}"); } catch(e) { tFuel = {}; }

    const { start, end, routeTime, mids } = routeData;
    const isHubReturn = document.getElementById('hub-return-toggle')?.checked || false;
    
    // 🚀 [1] 物理導航連結焊接引擎
    const getMapsUrl = (s, e) => `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(s)}&destination=${encodeURIComponent(e)}&travelmode=transit`;

    // 🚀 [2] 根據策略分配「導航指紋」
    let navigationLinks = [];
    if (mids.length > 0) {
        const firstMid = mids[0].value;
        if (isHubReturn) {
            // 回歸大站模式：三段跳 (起->中 / 中->大 / 大->終)
            // 💡 職人提醒：Hub 站名由 AI 在 memo.operator 或 stops 中提供
            const hubStation = tFuel.operator?.split('/')[0] || "京都站"; 
            navigationLinks = [
                { label: "起點 ➔ 景點", url: getMapsUrl(start, firstMid) },
                { label: "景點 ➔ 樞紐", url: getMapsUrl(firstMid, hubStation) },
                { label: "樞紐 ➔ 終點", url: getMapsUrl(hubStation, end) }
            ];
        } else {
            // 順向銜接模式：雙段對位 (起->中 / 中->終)
            navigationLinks = [
                { label: "起點 ➔ 景點", url: getMapsUrl(start, firstMid) },
                { label: "景點 ➔ 終點", url: getMapsUrl(firstMid, end) }
            ];
        }
    } else {
        // 無中繼點：直接導通
        navigationLinks = [{ label: "全程導航比對", url: getMapsUrl(start, end) }];
    }

    // 將導航連結封裝進 tFuel，供 viewEngine 渲染
    tFuel.verifications = navigationLinks;

    // --- 以下維持你原本精確的 Seg 遞增邏輯 ---
    const oldStops = tFuel.stops || [];
    const boardingCount = Math.max(1, tFuel.boarding?.length || 1);
    let runningSeg = 0;
    
    const stopsToProcess = oldStops.length > 2 ? oldStops : [
        { name: start, type: "dep", time: routeTime },
        ...mids.map(m => ({ name: m.value, type: "station" })),
        { name: end, type: "goal" }
    ];

    const calibratedStops = stopsToProcess.map((stop, idx) => {
        const item = { ...stop };
        item.seg = runningSeg;
        item.name = item.name || `Station #${idx + 1}`;
        if (['xfer', 'arr'].includes(String(item.type).toLowerCase()) && runningSeg < boardingCount - 1) {
            runningSeg++;
        }
        return item;
    });

    tFuel.stops = calibratedStops.map(s => ({
        ...s,
        seg: Math.min(Number(s.seg), boardingCount - 1)
    }));

    return JSON.stringify(tFuel);
},


/** 🚀 關鍵 A：數據狀態切換邏輯 (V2026.ULTRA 視覺深度對焦版) */
switchTransportSeg(segIndex, btnEl, nodeId = null) {
    if (!btnEl) return;

    let scope = nodeId ? document.getElementById(nodeId) : null;
    if (!scope) {
        scope = btnEl.closest('.transport-fuel-container') || btnEl.closest('.schedule-card');
    }
    if (!scope) return;

    const allBtns = scope.querySelectorAll('.seg-btn');
    allBtns.forEach((el, idx) => {
        const innerCard = el.querySelector('div');
        if (!innerCard) return;

        const isActive = (idx === Number(segIndex));

        // 🚀 1. 物理狀態強制歸位 (使用 toggle 確保穩壓)
        el.classList.toggle('opacity-100', isActive);
        el.classList.toggle('opacity-[0.85]', !isActive); // 提高非活動區視認度
        el.classList.toggle('scale-100', isActive);
        el.classList.toggle('scale-[0.99]', !isActive);

        innerCard.classList.toggle('border-[var(--theme-primary)]', isActive);
        innerCard.classList.toggle('border-slate-50', !isActive);
        innerCard.classList.toggle('ring-4', isActive);
        innerCard.classList.toggle('ring-[var(--theme-shadow)]', isActive);
        innerCard.classList.toggle('shadow-lg', isActive); // 加強選中時的浮動感
        
        // 🚀 2. 標籤顏色加固 (S? 標籤對焦)
        // 💡 職人診斷：手動尋找內部的 S? 標籤並提升對比
        const sTag = innerCard.querySelector('.italic');
        if (sTag) {
            sTag.classList.toggle('text-slate-600', isActive);
            sTag.classList.toggle('border-slate-400', isActive);
            sTag.classList.toggle('bg-slate-200', isActive);
        }

        // 🚀 3. 狀態圓點同步 (Pulse 重生)
        const dot = innerCard.querySelector('.w-3.h-3');
        if (dot) {
            dot.classList.toggle('bg-[var(--theme-primary)]', isActive);
            dot.classList.toggle('bg-slate-200', !isActive);
            dot.classList.toggle('animate-pulse', isActive);
            // 💡 新增：選中時點增加擴散光暈效果
            dot.classList.toggle('shadow-[0_0_15px_var(--theme-primary)]', isActive);
        }
    });

    // 🚀 4. 數據洗滌檢查 (防禦性去噪)
    // 若標題仍殘留 [VISIT_STOP]，在此階段執行最後物理切除
    const titles = scope.querySelectorAll('h4, h5');
    titles.forEach(title => {
        if (title.textContent.includes('[VISIT')) {
            title.textContent = title.textContent.replace(/\[VISIT.*?\]/gi, '').trim();
        }
    });

    if (navigator.vibrate) navigator.vibrate(6);
    scope.dataset.activeSector = segIndex;

    console.log(`📡 [Sector-Sharpness] Sector: S${segIndex} 深度對焦導通`);
},

/** 🧬 關鍵 B：數據分段自動對位標籤 (V2026.ULTRA 狀態保護版) */
autoTagTransportSeg(stops, boardingCount) {
    if (!Array.isArray(stops)) return [];
    
    // 🚀 [核心修復 1] 物理邊界強壓
    const maxSegIndex = Math.max(0, boardingCount - 1);
    if (boardingCount <= 1) return stops.map(s => ({ 
        ...(typeof s === 'object' ? s : { name: String(s) }), 
        seg: 0 
    }));

    let currentSeg = 0;
    return stops.map((stop, idx) => {
        // 🚀 修正 A：類型標準化
        const item = (typeof stop === 'object' && stop !== null) ? { ...stop } : { name: String(stop) };
        
        // 🚀 [核心修復 2] 基因重組協定
        // 若 item 自帶 seg，我們僅將其視為「建議」，必須通過 boardingCount 校準
        // 且若 currentSeg 已演進，則不回頭尊重舊標籤
        if (item.seg !== undefined && item.seg !== null) {
            currentSeg = Math.max(currentSeg, Math.min(Number(item.seg), maxSegIndex));
        }

        // 🚀 修正 C：賦值當前索引
        const updatedItem = { ...item, seg: currentSeg };

        // 🚀 [核心修復 3] 演進時機對位 (後置遞增)
        // 判斷是否為物理斷點：xfer (轉乘), arr (抵達)
        // 💡 關鍵：確保轉乘站在視覺與邏輯上都屬於「該段交通工具的終點」
        const typeStr = String(item.type || "").toLowerCase();
        const isBreakPoint = ['xfer', 'arr'].includes(typeStr);
        
        if (isBreakPoint && currentSeg < maxSegIndex) {
            currentSeg++;
        }
        
        return updatedItem;
    });
},

/** 🛍️ [Shopping Fuel] 購物指令發射器 (V2026.ULTRA V2.2) */
copyShoppingPromptToClipboard() {
    const city = document.getElementById('shop-city')?.value || '日本城市';
    const item = document.getElementById('shop-item')?.value || '必買商品';
    
    const now = new Date();
    const currentYearMonth = `${now.getFullYear()} 年 ${now.getMonth() + 1} 月`;

    const prompt = `你是日籍專業採購顧問，專精台灣繁體中文在地化建議。請針對「${city}」的「${item}」執行採購分析。

🚨 第一階段：規格枚舉
- 檢索該品牌 ${currentYearMonth} 當下所有型號。
- 電壓硬性過濾：只保留 AC100V-240V 或 Multi-Voltage 的型號。
- 若有多種電壓規格（旗艦款/輕便款），必須同時列出兩者，嚴禁漏掉旗艦款。

🚨 第二階段：價格校準
- 禁止建議「搭配變壓器」或「去現場詢問」。
- 100V 單電壓型號禁止出現在結果中。
- 價格必須對位 ${currentYearMonth} 官方含稅定價（官方直營店或大型百貨專櫃）。
- 禁止使用電商折扣、二手或清倉價。

🚨 第三階段：台灣在地化
- [info] 使用台灣口語（如：位置好找、台灣插頭直接插、不用另買變壓器）。
- 禁止使用工程術語。

【輸出格式】輸出 5-8 個節點的純 JSON 陣列：
[
  {
    "name": "中文品名（含規格，如：旗艦版 / 輕巧版）",
    "name_jp": "日文原名（含精確型號）",
    "price": 12800,
    "store": "官方店名（分店級）",
    "quantity": 1,
    "info": "台灣口語化說明＋電壓安全保證（如：台灣插頭直接插不用變壓器）",
    "image_query": "品牌 日文型號 商品写真"
  }
]

禁止前言與結語，直接輸出 JSON。`;

    navigator.clipboard.writeText(prompt).then(() => {
        uiManager.showToast(`✨ 「${city} - ${item}」真值算法 V2 已複製`);
    }).catch(err => {
        console.error('數據發射異常', err);
        uiManager.showToast("數據路網對焦異常，請重新嘗試");
    });
},

/** 🛍️ [Shopping State] 切換勾選狀態並固化至數據層 */
async toggleShoppingCheck(tripId, dayIndex, itemIndex, productIndex) {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    const item = trip.days[dayIndex].schedules[itemIndex];
    let products = JSON.parse(item.memo || "[]");

    // 切換目標狀態
    if (products[productIndex]) {
        products[productIndex].checked = !products[productIndex].checked;
    }

    // 寫回物理備忘錄
    item.memo = JSON.stringify(products);
    
    // 固化數據
    await this.persistState(trip);
    
    // 局部刷新介面
    viewEngine.renderDayDetailContent(document.getElementById('day-content-area'), trip, dayIndex);
    
    // 觸發震動反饋 (行動裝置對應)
    if (navigator.vibrate) navigator.vibrate(5);
},

/** 💾 數據固化中心：主控發動機 (V2026.ULTRA ESM 強制對位版) */
async saveScheduleData(tripId, dayIndex, itemIndex) {
    // 🚀 核心焊接：優先鎖定 App 指針，封殺 this 偏移風險
    const currentApp = window.App || this;
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    
    if (tripIndex === -1) return;

    try {
        // 🚀 核心加固：在採集前，強制執行「網捕協定」
        // 💡 職人診斷：直接透過 window 指名調用，確保視覺區塊文字 100% 壓入 Textarea
        if (typeof currentApp.syncCodeFromVisual === 'function') {
            currentApp.syncCodeFromVisual();
            console.log("📡 [Capture-Net] 視覺文字已強制收網");
        }

        // 🚀 1. 原子採集：從 Textarea 提領經過「網捕」後的最新燃料
        // 💡 注意：這裡必須調用 currentApp 下的私有方法
        const rawData = currentApp._captureScheduleFormData();
        
        // 🚀 2. 語義加工：格式對焦與洗滌 (處理 JSON 結構)
        const processedNode = currentApp._processNodeStorageByStyle(rawData);
        if (!processedNode) {
            console.warn("⚠️ [Storage] 燃料加工失敗，中斷焊接");
            return;
        }

        // 🚀 3. 物理焊接：將 processedNode 壓入記憶體軌道
        const targetTrip = state.trips[tripIndex];
        currentApp._weldNodeToTripDay(targetTrip, dayIndex, itemIndex, processedNode, rawData);

        // 🚀 4. 磁區固化與 UI 重刷 (執行 IndexedDB 寫入與頁面更新)
        // 💡 職人提醒：這步會自動觸發 persistState 與 navigateTo
        await currentApp._finalizeScheduleStorage(targetTrip, tripId, dayIndex, rawData.style);

        console.log(`✅ [Sector-Success] 節點儲存成功 | Trip: ${tripId} | Style: ${rawData.style}`);

    } catch (e) {
        console.error("❌ [Sector-Fatal] 固化程序墜毀:", e);
        if (window.uiManager) {
            uiManager.showToast("⚠️", "磁區焊接中斷，請檢查 JSON 格式");
        }
    }
},


/** 🧬 [Sub-Logic] 任務 A：物理層數據採集與洗滌 (V2026.ULTRA 視覺優先版) */
_captureScheduleFormData() {
    const style = document.getElementById('sched-style')?.value || "default";
    const editMode = localStorage.getItem('tf_editor_mode') || 'visual';

    // 🚀 1. 核心燃料深層洗滌 (Deep Sanitization)
    // 💡 職人診斷：除了移除不可見字符，還需封殺雙重轉義的引號，防止 JSON.parse 坍塌
    const rawMemo = (document.getElementById('sched-memo')?.value || "")
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .replace(/\\"/g, '"') 
        .trim();

    // 2. 數據主權對焦發動機
    let location = "", time = "", expense = 0;

    // 🚀 【導通協定】視覺模式優先從燃料內部提領真值
    if (editMode === 'visual' && rawMemo) {
        try {
            const fuel = JSON.parse(rawMemo);
            
            // 💡 職人診斷：穿透多態結構 (Itinerary 陣列 / Transport 物件 / Shopping 陣列)
            let root = null;
            if (Array.isArray(fuel)) {
                root = fuel[0];
            } else if (fuel && typeof fuel === 'object') {
                // 針對交通路網，優先取 stops 的第一站時間，但地點取 operator 或總覽
                root = (fuel.stops && fuel.stops.length > 0) ? fuel.stops[0] : fuel;
            }

            if (root) {
                // 地點主權：優先級 task > location > name > (若是交通則採連字格式)
                if (style === 'transport' && fuel.stops) {
                    const start = fuel.stops[0]?.name || "";
                    const end = fuel.stops[fuel.stops.length - 1]?.name || "";
                    location = (start && end) ? `${start} → ${end}` : (fuel.operator || "");
                } else {
                    location = root.task || root.location || root.name || "";
                }
                
                time = root.time || "";
                // 費用洗滌：確保轉為純數字
                const rawExp = root.expense || root.cost || 0;
                expense = typeof rawExp === 'string' ? Number(rawExp.replace(/[^0-9]/g, '')) : rawExp;
            }
        } catch (e) {
            console.warn("⚠️ [Capture-Warp] 燃料解析異常，回退至零件採樣軌道");
            location = document.getElementById('sched-location')?.value.trim();
            time = document.getElementById('sched-time')?.value;
        }
    } 
    
    // 🚀 零件補償協定：若燃料內無值或處於代碼模式，採信 UI 輸入框
    if (!location) location = document.getElementById('sched-location')?.value.trim();
    if (!time) time = document.getElementById('sched-time')?.value || "";

    // 3. 物理補償與封裝
    // 💡 職人診斷：確保地點具備物理占位符，封殺「無標題小卡」導致的渲染崩潰
    const finalLocation = location || (style === 'shopping' ? '未命名購物清單' : '新行程節點');
    const imageUrl = document.getElementById('node-image-url')?.value || ""; // 修正 ID 對應 image 模式
    const hubReturn = document.getElementById('hub-return-toggle')?.checked || false;

    console.log(`📡 [Capture-Ready] 模式: ${style} | 對焦主權: ${editMode === 'visual' ? 'Fuel-Core' : 'UI-Field'}`);

    return {
        style,
        location: finalLocation,
        time: time,
        expense, // 新增費用軌道，供後續金融路網累算
        imageUrl,
        hubReturn,
        rawMemo
    };
},

/** 🧬 [Sub-Logic] 任務 B：語義加工發動機 (全量分流對焦版) */
_processNodeStorageByStyle(data) {
    let node = null;
    const { style, rawMemo, location, time } = data;

    // 🚀 核心焊接：補齊所有物理 CASE，確保每一路燃料都能正確對位
    switch(style) {
        case 'transport': 
            node = this._processTransportStorage(rawMemo); 
            break;
        case 'json':      
            node = this._processItineraryStorage(rawMemo); 
            break;
        case 'shopping':  
            node = this._processShoppingStorage(rawMemo); 
            break;
        case 'image':     
            // 📸 影像模式：直接導通至 General 處理器，確保備註內容被採集
            node = this._processGeneralStorage('image', rawMemo); 
            break;
        case 'import':    
            // 📋 匯入模式：此時匯入動作應已由 syncStyleUI 觸發完成
            // 這裡執行二次洗滌確保安全性
            node = this._processGeneralStorage(style, rawMemo);
            break;
        default:          
            node = this._processGeneralStorage(style, rawMemo); 
            break;
    }

    if (!node) return null;

    // 2. 物理一致性同步 (Consistency Weld)
    node.location = location;
    node.time = time;
    node.style = style;

    // 3. 執行內部語義對焦 (僅針對單一節點 JSON)
    this._syncInternalJsonMetadata(node);

    return node;
},


/** 🧪 [Internal] 輔助：單一節點內部數據同步 (封殺數據斷層) */
_syncInternalJsonMetadata(node) {
    if (node.style !== 'json' && node.style !== 'transport') return;
    try {
        let memoObj = JSON.parse(node.memo);
        // 若為單一物件或長度為 1 的陣列，強制同步 task 與 time 欄位
        if (!Array.isArray(memoObj) && memoObj !== null) {
            memoObj.task = node.location;
            memoObj.time = node.time;
            node.memo = JSON.stringify(memoObj);
        } else if (Array.isArray(memoObj) && memoObj.length === 1) {
            memoObj[0].task = node.location;
            memoObj[0].time = node.time;
            node.memo = JSON.stringify(memoObj);
        }
    } catch (e) { /* 多節點包或格式不對則跳過同步 */ }
},

/** 🧬 [Sub-Logic] 任務 D：磁區固化與視圖熱重啟 */
async _finalizeScheduleStorage(trip, tripId, dayIndex, style) {
    // 1. 執行磁區固化 (Persistence)
    // 💡 職人診斷：persistState 會自動更新 updatedAt 與 state.lastLocalEdit 指紋
    await this.persistState(trip);

    // 2. 物理回收模態框
    this.modalRemove('sched-modal');

    // 🚀 3. 視圖熱重啟與局部刷新
    // 使用 setTimeout 確保 DOM 執行緒已從 Modal 動畫中釋放
    setTimeout(() => {
        // A. 重新渲染當前天數的詳細內容
        viewEngine.renderDayDetailContent(
            document.getElementById('day-content-area'), 
            trip, 
            dayIndex
        );

        // B. 金融路網連動：若為購物或有開銷的節點，同步刷新看板
        if (typeof this.refreshExpenseDashboard === 'function') {
            this.refreshExpenseDashboard(tripId);
        }

        // C. 職人級反饋：視覺與物理導通
        uiManager.showToast('✅', `[${style.toUpperCase()}] 數據固化完成`);
        if (navigator.vibrate) navigator.vibrate(15);

        console.log(`🏁 [Storage-Finalized] Trip: ${tripId} | Day: ${dayIndex + 1} | Style: ${style}`);
    }, 60);
},

/** 🧬 [Sub-Logic] 任務 C：物理焊接與磁區排程 (V2026.ULTRA) */
_weldNodeToTripDay(trip, dayIndex, itemIndex, processedNode, rawData) {
    const dayData = trip.days[dayIndex];
    
    // 1. 編輯模式判定判定 (支援 String 與 Number 格式)
    const isEdit = (itemIndex !== null && itemIndex !== undefined && String(itemIndex) !== "null");
    
    // 🚀 核心物理焊接：繼承加工後的數據，並注入圖片與策略指紋
    // 💡 職人提醒：這裡會確保 processedNode 裡的 INFO 被完整封裝進 finalNode
    const finalNode = { 
        ...processedNode, 
        imageUrl: rawData.imageUrl,   // 📸 圖片導軌
        hubReturn: rawData.hubReturn, // 🚉 轉乘回流策略
        updatedAt: Date.now() 
    };

    if (isEdit) {
        // 🛠️ 編輯模式：精確對位並替換磁區內容
        dayData.schedules[Number(itemIndex)] = finalNode;
        console.log(`📡 [Weld-Edit] Node index ${itemIndex} updated.`);
    } else {
        // ✨ 新增模式：點火生成唯一識別 ID
        finalNode.id = `node_${Date.now()}`;
        dayData.schedules.push(finalNode);
        console.log(`📡 [Weld-New] New node generated: ${finalNode.id}`);
    }

    // 🚀 2. 物理自動對焦排序 (時間優先軌道)
    // 確保行程不會因為編輯先後順序而導致時間線混亂
    dayData.schedules.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
},


/** 🛍️ [Sub-Processor] 購物燃料存儲處理器 (INFO 軌道導通版) */
_processShoppingStorage(rawMemo) {
    const time = document.getElementById('sched-time')?.value || "";
    const location = document.getElementById('sched-location')?.value || "購物行程";

    let products = [];
    let nodeTotal = 0;

    try {
        products = JSON.parse(rawMemo || "[]");
        // 🚀 核心修正：洗滌 products 陣列，確保每個項目的 info 都不會遺失
        products = products.map(p => ({
            name: p.name || "",
            price: Number(p.price) || 0,
            quantity: Number(p.quantity) || 1,
            info: p.info || "", // 🎯 強制導通 INFO
            store: p.store || "",
            checked: p.checked || false
        }));

        nodeTotal = products.reduce((sum, p) => sum + (p.price * p.quantity), 0);
    } catch (e) {
        throw new Error("Shopping JSON Format Invalid");
    }

    return {
        id: 'node_' + Date.now(),
        time,
        location,
        memo: JSON.stringify(products), // 🚀 存入標準洗滌後的燃料
        totalExpense: nodeTotal,
        style: 'shopping',
        updatedAt: Date.now()
    };
},

/** 🚄 數據識別：交通路網專屬軌道 (V2026.ULTRA 視覺導通穩壓版) */
_processTransportStorage(memo) {
    // 🚀 1. 物理洗滌：封殺 Markdown 與不可見噪訊，確保 JSON 結構純淨
    const sanitizedMemo = memo
        .replace(/```json/g, '') 
        .replace(/```/g, '')      
        .replace(/[\u200B-\u200D\uFEFF]/g, '') 
        .trim();

    let parsed = null;
    try { 
        parsed = JSON.parse(sanitizedMemo || "{}"); 
    } catch (e) { 
        parsed = {}; 
    }

    // 🚀 2. 數據主權鎖定：判斷當前編輯模式
    const editMode = localStorage.getItem('tf_editor_mode') || 'visual';
    const routeData = this.collectRouteData();

    // 💡 職人診斷：若在視覺模式，優先採信 JSON 內部的 stops 數據而非零件區 Input
    if (editMode === 'visual' && parsed.stops && parsed.stops.length > 0) {
        routeData.start = parsed.stops[0].name || routeData.start;
        routeData.end = parsed.stops[parsed.stops.length - 1].name || routeData.end;
        routeData.routeTime = parsed.stops[0].time || routeData.routeTime;
    }

    // 🚀 3. 核心焊接：同步 UI 特殊狀態位
    const uiHubStation = document.getElementById('hub-station-name')?.value.trim() || "";
    const isHubReturn = document.getElementById('hub-return-toggle')?.checked || false;

    parsed.hubStation = uiHubStation || parsed.hubStation || "";
    parsed.hubReturn = isHubReturn;

    // 🚀 4. 邊際防禦：封殺無效路網
    const hasStops = Array.isArray(parsed.stops) && parsed.stops.length > 0;
    if (!hasStops && !routeData.start && !routeData.end) {
        if (window.uiManager) uiManager.showToast("⚠️", "路網座標真空，請輸入起訖點");
        return null;
    }

    // 🚀 5. 執行燃料處理器：注入 Google Maps 真值驗證連結
    // 💡 確保傳入的是物件結構，防止 Double Stringify 產生的 \\\" 噪訊
    const finalMemoString = this.processTransportFuel(JSON.stringify(parsed), routeData);
    
    // 🚀 6. 標題歸一化與車資清算
    let finalLocation = "";
    if (routeData.start && routeData.end) {
        finalLocation = `${routeData.start} → ${routeData.end}`;
    } else {
        finalLocation = parsed.operator || "交通路網專案";
    }

    // 執行累算引擎，確保 cost 欄位反映最新分段票價
    const finalCost = (typeof App.calculateCost === 'function') 
        ? App.calculateCost('transport', finalMemoString) 
        : (Number(parsed.cost) || 0);

    return {
        style: 'transport',
        time: routeData.routeTime || (parsed.stops?.[0]?.time || "--:--"),
        task: finalLocation,
        location: finalLocation,
        memo: finalMemoString,      
        cost: finalCost,            
        hubReturn: isHubReturn,     
        hubStation: parsed.hubStation,
        updatedAt: Date.now()
    };
},

/** ✨ 數據識別：行程燃料專屬軌道 (V2026.ULTRA 結構自適應穩壓版) */
_processItineraryStorage(memo) {
    let parsed = null;
    try { 
        // 🚀 1. 物理洗滌：移除 Markdown 標籤與不可見噪訊
        let sanitized = memo
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim();

        // 🚀 2. 結構自癒：補齊對稱性括號
        if (sanitized.startsWith('{') && !sanitized.endsWith('}')) sanitized += '}';
        if (sanitized.startsWith('[') && !sanitized.endsWith(']')) sanitized += ']';

        parsed = JSON.parse(sanitized); 
    } catch (e) { 
        console.error("📋 [Storage-Error] 原始燃料解析失敗:", e);
        if (window.uiManager) uiManager.showToast('⚠️', "JSON 格式語法錯誤");
        return null; 
    }

    // 🚀 3. 核心提取協定 (Extraction Protocol)
    // 💡 職人診斷：穿透所有包裹層級 (timeline/stops)，強制提取純淨陣列
    let stopArray = [];
    if (Array.isArray(parsed)) {
        stopArray = parsed;
    } else if (parsed && typeof parsed === 'object') {
        stopArray = parsed.timeline || parsed.stops || [parsed];
    }

    // 🚀 4. 數據洗滌 (Sanitization)：移除各節點內部的非法指紋
    // 確保不會有深層的物件嵌套導致字串化異常
    const purifiedArray = stopArray.filter(item => item !== null).map(item => {
        const node = { ...item };
        // 移除可能干擾渲染的 UI 暫態屬性
        delete node.isFocused;
        delete node.tempId;
        return node;
    });

    const firstItem = purifiedArray[0] || {};
    const rawLocation = firstItem.task || firstItem.location || firstItem.name || "景點燃料包";
    const cleanLocation = rawLocation.replace(/【.*?】/g, '').trim(); 

    // 🚀 5. 數據固化 (Persistence Weld)
    // 💡 關鍵修正：執行單次字串化，並同步至 expenseManager
    const finalMemoStr = JSON.stringify(purifiedArray);

    return {
        style: 'json',
        time: firstItem.time || "--:--",
        task: cleanLocation || rawLocation,    
        location: cleanLocation || rawLocation, 
        // 🔒 確保 memo 存入的是標準化的純陣列字串，封殺 "\\\" 噪訊
        memo: finalMemoStr, 
        cost: (typeof expenseManager !== 'undefined') 
            ? expenseManager.parseFuelCost(finalMemoStr) 
            : 0
    };
},


/** 📍 數據識別：一般與影像型式軌道 (V2026.ULTRA 引用對焦版) */
_processGeneralStorage(style, memo) {
    // 🚀 數據對焦：從 Basic 物理區塊提取 UI 輸入值
    const timeEl = document.getElementById('sched-time');
    const locEl = document.getElementById('sched-location');
    
    // 🚀 語義防禦：確保地點不為空，若為空則賦予物理占位符
    const finalLocation = locEl?.value.trim() || (style === 'image' ? "影像記錄節點" : "未命名行程");
    const finalTime = timeEl?.value || "";

    return {
        style: style,
        time: finalTime,
        location: finalLocation,
        memo: memo,
        // 🚀 關鍵修正：直接引用外部匯入的模組物件，封殺 this 指向錯誤
        cost: style === 'image' ? 0 : expenseManager.parseFuelCost(memo)
    };
},


/** 🧹 節點級物理回收 (V2026.ULTRA 佈局精確對焦版) */
deleteScheduleData(tripId, dayIndex, itemIndex) {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    // 🏗️ 1. 燃料構造：優化間距與視認性
    const content = `
        <div class="p-4 text-center space-y-5 animate-fade-in">
            <div class="w-16 h-16 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-2">
                <span class="text-2xl">🗑️</span>
            </div>
            <div>
                <h4 class="font-black text-slate-800 text-base">確定回收此行程節點？</h4>
                <p class="text-[10px] text-slate-400 font-bold uppercase tracking-[0.15em] mt-1">Sector Reclaim Protocol</p>
            </div>
            <p class="text-[11px] text-slate-500 leading-relaxed px-4">
                即將物理抹除此時段的所有數據燃料。<br>
                此動作將釋放磁區空間且不可復原。
            </p>
        </div>`;

// 🚀 2. Actions 焊接：導入 1:2 物理權重設計 (視覺重心導向)
// 💡 職人診斷：取消按鈕賦予 flex-1，確認按鈕賦予 flex-[2]，並強化文字對焦感
const actions = `
    <button onclick="App.modalRemove('delete-confirm-modal')" 
            class="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs active:scale-95 transition-all">
        取消
    </button>
    <button onclick="App.executeDeleteScheduleItem('${tripId}', ${dayIndex}, ${itemIndex})" 
            class="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-100 active:scale-95 transition-all">
        確認刪除
    </button>`;


    // 🚀 3. 物理點火
    modalEngine.create('delete-confirm-modal', '⚠️ 確認刪除', content, actions);
},

/** 🚀 執行刪除：物理執行與局部導通 (V2026.ULTRA 指紋同步版) */
async executeDeleteScheduleItem(tripId, dayIndex, itemIndex) {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return;

    try {
        // 1. 物理切除：從記憶體陣列中移除節點
        state.trips[tripIndex].days[dayIndex].schedules.splice(itemIndex, 1);
        
        // 🚀 2. 物理指紋同步：確保系統感知到行程內部的原子異動
        // 💡 職人診斷：沒有這兩行，下一次進入備份頁面時，系統會誤認本地端無更新
        const nowTs = Date.now();
        state.lastLocalEdit = nowTs;
        localStorage.setItem('tf_last_local_edit', nowTs);
        
        // 3. 磁區固化：更新單一行程數據
        await dbManager.save(state.trips[tripIndex]);
        
        // 4. 物理清理：回收多層模態框
        modalEngine.remove('delete-confirm-modal');
        modalEngine.remove('sched-modal');
        
        // 🚀 5. 局部熱刷新
        // 💡 職人診斷：使用 requestAnimationFrame 或適度延遲確保 DOM 回收完畢
        setTimeout(() => {
            this.switchDay(tripId, dayIndex);
            
            // 語感歸一：對焦 uiManager
            if (window.uiManager) {
                uiManager.showToast('🧹', "數據磁區已回收完畢");
            } else {
                uiManager.showToast("✨", "數據磁區已回收完畢");
            }
            
            if (navigator.vibrate) navigator.vibrate(10);
        }, 60);

        console.log(`🧹 [Schedule-Reclaim] Node removed from Trip: ${tripId} | Fingerprint: ${nowTs}`);

    } catch (err) {
        console.error("❌ [Sector-Fatal] 回收失敗:", err);
        uiManager.showToast('⚠️', "數據路網導通異常");
    }
},


/** 💰 結算器：行程開銷原子化清算 (V2026.ULTRA 深度累算版) */
calculateCost(style, memo) {
    if (!memo) return 0;
    try {
        const fuel = JSON.parse(memo);
        
        // 🚀 1. 景點行程 (JSON 模式)：掃描所有節點的 expense 欄位
        if (style === 'json') {
            const items = Array.isArray(fuel) ? fuel : [fuel];
            return Math.round(items.reduce((acc, item) => {
                // 強力洗滌：移除千分位與貨幣符號，只提取數字
                const val = String(item.expense || "").replace(/[,¥$]/g, '');
                const pMatch = val.match(/\d+/g);
                return acc + (pMatch ? (pMatch.map(Number).reduce((a, b) => a + b, 0) / pMatch.length) : 0);
            }, 0));
        } 
        
        // 🚀 2. 交通路網 (Transport 模式)：執行分段累算與總額雙軌驗證
        if (style === 'transport') {
            let total = 0;
            
            // A. 優先檢索 stops 陣列中是否有分段金額 (如：JR段 + 巴士段)
            if (Array.isArray(fuel.stops) && fuel.stops.length > 0) {
                const segmentSum = fuel.stops.reduce((sum, s) => {
                    // 掃描 segment_cost 欄位（AI 應在此填入該段票價）
                    return sum + (Number(String(s.segment_cost || 0).replace(/[,¥$]/g, '')) || 0);
                }, 0);
                
                if (segmentSum > 0) total = segmentSum;
            }
            
            // B. 若分段累算為 0，則退守採信總 cost 欄位
            if (total === 0) {
                total = Number(String(fuel.cost || 0).replace(/[,¥$]/g, '')) || 0;
            }
            
            return Math.round(total);
        }
    } catch(e) { 
        console.warn("📡 [Cost-Engine] 燃料解析異常，回退至零結算");
        return 0; 
    }
    return 0;
},


/** 🚀 [App] 執行幣別焦點物理切換 */
switchCurrencyFocus(currency) {
    // 1. 狀態固化
    state.expenseFocus = currency;
    localStorage.setItem('tf_expense_focus', currency);

    // 2. 物理觸覺回饋 (Haptic)
    if (navigator.vibrate) navigator.vibrate(5);
    
    // 3. 視覺反饋
    uiManager.showToast('🎯', `焦點已切換至 ${currency}`);

    // 4. 執行局部重刷：直接重新導向至開銷視圖以導通渲染
    this.navigateTo('expense');
},

/** 🚀 輔助工具：AI 指令動態合成 (V2026.ULTRA 啟程時間校準版) */
copyToClipboard(base64Str) {
    if (!navigator.clipboard) return uiManager.showToast("❌ 安全環境限制");

    try {
        let promptFuel = decodeURIComponent(atob(base64Str).split('').map((c) => {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        }).join(''));

        const style = document.getElementById('sched-style')?.value;
        if (style === 'transport' || style === 'json') {
            // 🚀 數據提領
            const time = document.getElementById('route-time')?.value || "未指定";
            const start = document.getElementById('route-start')?.value || "目前位置";
            const end = document.getElementById('route-end')?.value || "未指定";
            const isHubReturn = document.getElementById('hub-return-toggle')?.checked || false;
            
            const hubStation = document.getElementById('hub-station-name')?.value.trim() || "";
            const midInputs = Array.from(document.querySelectorAll('.mid-point-input'));
            
            const routeMap = midInputs.map((el, idx) => {
                const name = el.value.trim();
                if (!name) return null;
                const segOfThisPoint = parseInt(el.dataset.seg || 0);
                const isXfer = (name.includes('轉乘') || name.includes('換乘') || name.includes('xfer'));
                return `   [里程碑_${idx}] ${name} ${isXfer ? '[XFER_POINT]' : '[VISIT_STOP]'} (seg: ${segOfThisPoint})`;
            }).filter(d => d !== null).join('\n');

            const segIndices = midInputs.map(el => parseInt(el.dataset.seg || 0));
            const maxSegIndex = Math.max(0, ...segIndices);

            const strategyProtocol = isHubReturn 
                ? `【優先策略：大站回流協定】
1. 樞紐鎖定：必須將「${hubStation || '鄰近主要樞紐車站'}」作為核心轉乘節點。
2. 效率導向：若回流該大站搭乘特急/快車能縮短時間，請優先規劃。`
                : `【優先策略：順向銜接協定】
1. 地理遞進：嚴禁回溯，以景點為新起點就近移動。
2. 路網精簡：封殺無意義小站。`;

            const hubAnchor = (isHubReturn && hubStation) 
                ? `   [樞紐節點] ${hubStation} [HUB_STATION] (歸屬 seg: 最後一段或轉乘段)\n` 
                : "";

// 🚀 核心焊接：導入「原子位移」熔斷協定
            const routeConstraint = `
【🚨 數據品質導通協定】
1. 🚀 空間導通：[note] 必須標註「出口編號/月台號碼」與「關鍵動線」。
2. 🚀 原子位移：若「起點」與「終點」物理距離極近且「無中繼點」，嚴禁安插任何觀光、用餐或額外景點。
3. 🚀 任務純化：僅需生成一筆或兩筆關於「移動」與「抵達」的 JSON 節點。

【📍 里程碑對位圖】
1. 起點：${start} (啟程時間: ${time}) (seg: 0)
${routeMap}
${hubAnchor}3. 終點：${end} (seg: ${maxSegIndex})

【⚠️ 物理約束與語義對焦】
- 🎯 **路網絕對服從**：禁止為了填充時間而安插任何未在里程碑中出現的地點。嚴禁擅自發散至「奈良」、「大阪」等未提及區域。
- 🎯 **極簡原則**：若兩點距離步行可達且無中繼站，請直接輸出從 A 到 B 的步行指引與飯店 Check-in 即可，封殺所有散策、採買、景點建議。
- 🎯 **時序對焦**：若移動只需 5 分鐘，JSON 的 time 標籤應反映此物理事實，嚴禁為了撐滿下午時間而偽造冗長行程。
- 🚫 **風格去軍事化**：[note] 與 [spotlight] 必須回歸真實旅遊語境，使用「💡 小撇步」或「📍 位置指引」。
`;
            
            promptFuel = promptFuel.replace('【STRICT_JSON_ONLY】', `【STRICT_JSON_ONLY】${routeConstraint}`);
            promptFuel = promptFuel.replace(/"seg":\s*0/g, '"seg": [依里程碑對位]');
        }

        navigator.clipboard.writeText(promptFuel).then(() => {
            uiManager.showToast("✨ 戰術對焦指令已導通");
        });
    } catch (err) {
        console.error("❌ [Copy-Collapse] 指令合成斷路:", err);
    }
},


// ============
//   精煉複製
// ============

/** 🏭 [Refinery-Acoustic] 精煉廠專屬直通總線 (V2026.ULTRA) 
 * 作用：封殺單筆替換邏輯，確保多筆燃料 100% 導通
 */
copyRefineryDirect(text) {
    if (!navigator.clipboard) return uiManager.showToast("❌ 剪貼簿存取受阻");

    // 🚀 物理直通：不經過解碼、不經過 replace，直接點火寫入
    navigator.clipboard.writeText(text).then(() => {
        // 職人級反饋
        uiManager.showToast('✨', '精煉指令全量導通');
        if (navigator.vibrate) navigator.vibrate(15);
        console.log("🏁 [Acoustic-Express] 精煉燃料已繞過主總線，成功送達剪貼簿");
    }).catch(err => {
        console.error("❌ [Acoustic-Express-Collapse]", err);
    });
},

// ============================================================
// 緊急頁面相關模組
// ============================================================

/** 🚀 救援模組：同步 AI 指令 (城市與保險雙路徑對焦版) */
syncEmergencyAiPrompt() {
    const btnContainer = document.getElementById('emergency-ai-btn');
    if (!btnContainer) return;

    // 🚀 1. 物理抓取：同時獲取城市與保險欄位的值
    const cityInput = document.getElementById('emergency-query-input');
    const insuranceInput = document.getElementById('insurance-query-input');

    // 🚀 2. 數據洗滌：若無輸入則回退至預設導向 (確保指令不崩潰)
    const city = cityInput?.value.trim() || '日本';
    const insurance = insuranceInput?.value.trim() || '';

    // 🚀 3. 燃料合成：重新對焦指令引擎並渲染按鈕 (已切除多餘 F 字元)
    const prompt = viewEngine._getEmergencyAiPrompt(city, insurance);
    btnContainer.innerHTML = viewEngine.renderAICopyBtn(prompt);
    
    console.log(`📡 [AI-Protocol-Sync] 對焦目標：${city} / 保險：${insurance || '通用'}`);
},

/** 🚀 救援模組：分流過濾切換 */
filterEmergency(tab) {
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    const container = document.getElementById('content-container');
    if (activeTrip) {
        viewEngine.renderEmergency(container, activeTrip.emergencyVault || [], tab);
    }
},

/** 🚀 救援模組：燃料注入持久化 (V2026.ULTRA 實體對焦修正版) */
async importEmergencyFuel() {
    const input = document.getElementById('emergency-json-input');
    if (!input || !input.value.trim()) return;

    try {
        // 🚀 1. 數據洗滌：切除 Markdown 與不可見噪訊
        const jsonStr = input.value.trim()
            .replace(/^```json\s*/, '')
            .replace(/^```\s*/, '')
            .replace(/\s*```$/, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim();

        const data = JSON.parse(jsonStr);
        
        // 💡 職人對焦：統一指向 state 真值
        const activeTripId = state.activeTripId;
        const tripIndex = state.trips.findIndex(t => t.id === activeTripId);
        
        if (tripIndex === -1) {
            uiManager.showToast('⚠️', "錯誤：未定位行程存檔點");
            return;
        }

        // 🚀 2. 數據焊接與物理指紋對齊
        state.trips[tripIndex].emergencyVault = data;
        
        // 💡 關鍵：更新本地最後編輯時間，驅動雲端攔截器
        const nowTs = Date.now();
        state.lastLocalEdit = nowTs;
        localStorage.setItem('tf_last_local_edit', nowTs);

        // 💾 3. 實體磁區固化 (對位 V2026 dbManager 接口)
        if (dbManager && typeof dbManager.saveAllTrips === 'function') {
            await dbManager.saveAllTrips(state.trips);
            console.log(`💾 [Emergency-Sync] 救援數據已固化 | 指紋: ${nowTs}`);
        } else {
            throw new Error("DB_CHANNEL_DISCONNECTED");
        }
        
        // 🚀 4. 物理重整渲染
        const container = document.getElementById('content-container');
        if (container && typeof viewEngine.renderEmergency === 'function') {
            viewEngine.renderEmergency(container, data, 'medical');
        }

        // 5. 清理場地與視覺反饋
        input.value = ''; 
        uiManager.showToast('✨', "救護燃料已導通固化");
        if (navigator.vibrate) navigator.vibrate(10);
        
    } catch (e) {
        console.error("❌ [Emergency-Fuel-Collapse]:", e);
        uiManager.showToast('⚠️', "JSON 格式異常，焊接中斷");
    }
},

/** 🛡️ 救援模組：理賠清單物理交互 */
toggleClaimCheck(id) {
    const el = document.getElementById(id);
    if (!el) return;

    const isChecked = el.classList.contains('bg-blue-600');
    const svg = el.querySelector('svg');

    if (!isChecked) {
        // 啟動打勾狀態
        el.classList.remove('border-slate-200');
        el.classList.add('bg-blue-600', 'border-blue-600', 'shadow-lg', 'shadow-blue-100');
        svg.classList.remove('opacity-0');
        svg.classList.add('opacity-100');
    } else {
        // 恢復空框狀態
        el.classList.add('border-slate-200');
        el.classList.remove('bg-blue-600', 'border-blue-600', 'shadow-lg', 'shadow-blue-100');
        svg.classList.add('opacity-0');
        svg.classList.remove('opacity-100');
    }
    
    // 選配：可將狀態儲存至 localStorage 防止重新整理消失
},


/** 🚀 救援模組：編輯節點彈窗 (封殺重複渲染修正版) */
promptEditEmergencyItem(itemIndex) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip || !trip.emergencyVault) return;

    const item = trip.emergencyVault[itemIndex];
    
    // 🚀 核心邏輯：判定是否需要開啟「長文本模式」
    const isLongText = (item.info && item.info.length > 20);

    const content = `
        <div class="space-y-4 text-left animate-fade-in">
            <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">單位名稱</label>
                <input type="text" id="edit-em-name" value="${item.name || ''}" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none focus:ring-2 focus:ring-rose-100">
            </div>
            
            <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">物理地址 / 位置摘要</label>
                <input type="text" id="edit-em-address" value="${item.address || ''}" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none">
            </div>

            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">一般聯絡電話</label>
                    <input type="text" id="edit-em-phone" value="${item.phone || ''}" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none">
                </div>
                
                ${item.type === 'embassy' ? `
                <div>
                    <label class="text-[10px] font-black text-rose-500 uppercase tracking-widest px-1">🚨 急難救助專線</label>
                    <input type="text" id="edit-em-rescue" value="${item.rescuePhone || ''}" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm text-rose-500 outline-none">
                </div>
                ` : `
                <div class="${isLongText ? 'hidden' : ''}">
                    <label class="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">🏥 醫療/保險特點備註</label>
                    <input type="text" id="edit-em-info" value="${item.info || ''}" 
                           class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none" 
                           placeholder="如：提供中文口譯">
                </div>
                `}
            </div>

            ${(item.type !== 'embassy' && isLongText) ? `
            <div class="animate-fade-in">
                <label class="text-[10px] font-black text-emerald-500 uppercase tracking-widest px-1">詳細補充資訊</label>
                <textarea id="edit-em-info-long" 
                          class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-xs outline-none h-24 leading-relaxed">${item.info}</textarea>
            </div>
            ` : ''}
        </div>`;

    // 2. 🚀 Actions 焊接
    const actions = `
        <div class="flex items-center gap-3 w-full">
            <button onclick="App.deleteEmergencyItem(${itemIndex})" 
                    class="w-12 h-12 shrink-0 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center active:scale-90 transition-all border border-rose-100 shadow-sm">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                    <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                </svg>
            </button>
            <button onclick="App.modalRemove('edit-em-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
            <button onclick="App.saveEmergencyItem(${itemIndex})" class="flex-[2] py-4 bg-rose-500 text-white rounded-2xl font-black text-xs shadow-lg shadow-rose-200 active:scale-95 transition-all">更新數據</button>
        </div>`;

    modalEngine.create('edit-em-modal', '🔧 編輯救援數據燃料', content, actions);
},

/** 🚀 救援模組：數據固化邏輯補強 (V2026.ULTRA 指紋同步版) */
async saveEmergencyItem(itemIndex) {
    const tripIndex = state.trips.findIndex(t => t.id === state.activeTripId);
    if (tripIndex === -1) return;

    const item = state.trips[tripIndex].emergencyVault[itemIndex];
    
    // 1. 物理採集
    item.name = document.getElementById('edit-em-name').value.trim();
    item.address = document.getElementById('edit-em-address').value.trim();
    item.phone = document.getElementById('edit-em-phone').value.trim();
    
    if (item.type === 'embassy') {
        item.rescuePhone = document.getElementById('edit-em-rescue').value.trim();
    } else {
        const longInfo = document.getElementById('edit-em-info-long');
        item.info = longInfo ? longInfo.value.trim() : document.getElementById('edit-em-info').value.trim();
    }

    // 🚀 2. 物理指紋與數據焊接
    const nowTs = Date.now();
    state.lastLocalEdit = nowTs;
    localStorage.setItem('tf_last_local_edit', nowTs);

    try {
        // 🚀 3. 執行批量磁區固化 (對位 saveAllTrips 接口)
        await dbManager.saveAllTrips(state.trips);
        
        // 4. 物理回收介面
        modalEngine.remove('edit-em-modal');
        
        // 🚀 5. 分區對焦重刷
        // 職人診斷：確保重刷後依然停留在使用者原本選中的 Tab (如：醫藥、警察)
        const activeTabBtn = document.querySelector('button[onclick*="App.filterEmergency"].bg-rose-500');
        const activeTab = activeTabBtn ? activeTabBtn.getAttribute('onclick').match(/'([^']+)'/)[1] : 'medical';
        
        this.filterEmergency(activeTab);
        
        // 6. 視覺語義回饋
        uiManager.showToast('✨', "救援數據已固化並更新指紋");
        if (navigator.vibrate) navigator.vibrate(5);
        
    } catch (e) {
        console.error("❌ [Emergency-Save-Fatal]:", e);
        uiManager.showToast('⚠️', "磁區寫入墜毀");
    }
},


/** 🚀 救援模組：物理移除節點 (絕對索引對位與安全熱重整版) */
async deleteEmergencyItem(absoluteIdx) {
    const tripIndex = state.trips.findIndex(t => t.id === state.activeTripId);
    if (tripIndex === -1) return;

    // 1. 物理回收確認：採職人級防呆語義
    if (!confirm("🚨 確定要物理抹除這項救援資訊嗎？\n此動作將釋放磁區空間且不可復原。")) return;

    try {
        // 2. 執行物理切除
        state.trips[tripIndex].emergencyVault.splice(absoluteIdx, 1);

        // 🚀 3. 物理指紋同步：確保刪除動作被存檔系統識別
        const nowTs = Date.now();
        state.lastLocalEdit = nowTs;
        localStorage.setItem('tf_last_local_edit', nowTs);

        // 💾 4. 數據持久化：對位 saveAllTrips 接口
        await dbManager.saveAllTrips(state.trips);
        
        // 5. 物理清理視圖：立即關閉編輯 Modal
        modalEngine.remove('edit-em-modal');
        
        // 🚀 6. 健壯性 Tab 對焦：提取目前選中的分區
        let activeTab = 'medical'; 
        const activeTabBtn = document.querySelector('button[onclick*="App.filterEmergency"].bg-rose-500');
        
        if (activeTabBtn) {
            const match = activeTabBtn.getAttribute('onclick').match(/'([^']+)'/);
            if (match && match[1]) activeTab = match[1];
        }

        // 7. 熱更新渲染：即時同步數據變化
        this.filterEmergency(activeTab);
        
        // 8. 視覺與 Haptic 反饋
        uiManager.showToast('🧹', "救護數據已物理回收並同步指紋");
        if (navigator.vibrate) navigator.vibrate([10, 30]);
        
        console.log(`🧹 [Emergency-Reclaim] Index: ${absoluteIdx} 已移除 | 系統指紋更新: ${nowTs}`);

    } catch (e) {
        console.error("❌ [Delete-Collapse] 回收程序墜毀:", e);
        uiManager.showToast('⚠️', "磁區回收異常");
    }
},


// ============================================================
// 5. [Transport & Flight] 航班雙向配置
// 負責：航班起降、多航段數據焊接
// ============================================================


/** ✈️ 啟動航班編輯軌道 (V2026.ULTRA 佈局加固版) */
promptEditTransport(tripId) {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    // 🛡️ 數據對焦：確保 transport 是陣列
    const flights = Array.isArray(trip.transport) ? trip.transport : [];

    const content = `
        <div class="space-y-4 text-left">
            <!-- 🚀 增加滾動區域穩壓，防止航段過多時按鈕溢出螢幕 -->
            <div id="flight-items-container" class="space-y-4 max-h-[60vh] overflow-y-auto no-scrollbar p-1">
                ${flights.length > 0 
                    ? flights.map((f, i) => this.generateFlightRowHTML(trip, i, f)).join('') 
                    : `<div class="py-12 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                         <p class="text-[10px] text-slate-300 font-black uppercase tracking-widest">目前無航班配置</p>
                       </div>`
                }
            </div>

            <button onclick="App.addFlightRow('${tripId}')" 
                    class="w-full py-4 border-2 border-dashed border-slate-200 rounded-[1.5rem] text-slate-400 font-black text-[11px] hover:bg-slate-50 hover:text-pink-500 hover:border-pink-100 transition-all flex items-center justify-center gap-2 active:scale-95">
                <span>+</span> 新增航班設定
            </button>
        </div>`;

    // 🚀 核心修正：加入 Flex 容器並校準物理權重 (與住宿模組美學歸一)
    const actions = `
        <div class="flex items-center gap-3 w-full px-1">
            <button onclick="App.modalRemove('edit-transport-modal')" 
                    class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">
                取消
            </button>
            <button onclick="App.saveMultiTransportData('${tripId}')" 
                    class="flex-[1.8] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all tracking-widest">
                完成設定
            </button>
        </div>`;

    this.modalCreate('edit-transport-modal', '✈️ 航班資訊設定', content, actions);
},


generateFlightRowHTML(trip, index, data = null) {
    return `
        <div class="flight-row p-6 bg-slate-50 rounded-[2.5rem] space-y-4 border-2 border-transparent hover:border-pink-100 transition-all shadow-sm group" data-index="${index}">
            <div class="flex justify-between items-center mb-1">
                <div class="flex items-center gap-2">
                    <span class="text-[10px] font-black theme-text-pink bg-pink-50 px-3 py-1 rounded-full italic">航段 ${index + 1}</span>
                    <select class="flight-day bg-white rounded-full px-3 py-1 text-[9px] font-bold text-slate-400 border-none outline-none ring-1 ring-slate-100">
                        ${trip.days.map((_, idx) => `
                            <option value="${idx + 1}" ${Number(data?.day) === (idx + 1) ? 'selected' : ''}>D${idx + 1} 顯示</option>
                        `).join('')}
                    </select>
                </div>
                <button onclick="this.closest('.flight-row').remove()" class="text-slate-300 hover:text-rose-500 p-2 transition-colors active:scale-90">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"/></svg>
                </button>
            </div>

            <!-- 航空公司 + 班號 -->
            <div class="grid grid-cols-2 gap-3 mb-2 animate-fade-in">
                <div class="space-y-1.5">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">航空公司</label>
                    <input type="text" class="flight-dep-carrier w-full bg-white rounded-xl p-3 text-[11px] font-black text-slate-700 border-none outline-none shadow-sm ring-1 ring-slate-100 focus:ring-pink-100 transition-all"
                           placeholder="例如：長榮航空" value="${data?.carrier || ''}">
                </div>
                <div class="space-y-1.5">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">班機號碼</label>
                    <input type="text" class="flight-dep-code w-full bg-white rounded-xl p-3 text-[11px] font-black text-slate-700 border-none outline-none shadow-sm ring-1 ring-slate-100 focus:ring-pink-100 transition-all"
                           placeholder="例如：BR178" value="${data?.code || ''}">
                </div>
            </div>

            <!-- 起飛 + 降落 -->
            <div class="grid grid-cols-2 gap-3 pt-4 border-t border-slate-200/50">
                <div class="space-y-2 text-left">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-tighter px-1">🛫 起飛機場</label>
                    <input type="text" class="flight-dep-port w-full bg-white rounded-2xl p-3 text-xs font-bold border-none outline-none shadow-inner ring-1 ring-slate-50 focus:ring-pink-100"
                           placeholder="如：桃園國際機場" value="${data?.depPort || ''}">
                    <input type="time" class="flight-dep-time w-full bg-white rounded-xl p-2.5 text-[11px] font-black text-slate-600 border-none outline-none mt-1 shadow-sm ring-1 ring-slate-50"
                           value="${data?.depTime || ''}">
                </div>
                <div class="space-y-2 text-left">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-tighter px-1">🛬 降落機場</label>
                    <input type="text" class="flight-arr-port w-full bg-white rounded-2xl p-3 text-xs font-bold border-none outline-none shadow-inner ring-1 ring-slate-50 focus:ring-pink-100"
                           placeholder="如：關西國際機場" value="${data?.arrPort || ''}">
                    <input type="time" class="flight-arr-time w-full bg-white rounded-xl p-2.5 text-[11px] font-black text-slate-600 border-none outline-none mt-1 shadow-sm ring-1 ring-slate-50"
                           value="${data?.arrTime || ''}">
                </div>
            </div>

            <!-- 航廈 + 座位 + 登機門 -->
            <div class="grid grid-cols-3 gap-3 pt-4 border-t border-slate-200/50">
                <div class="space-y-1.5">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">出發航廈</label>
                    <input type="text" class="flight-dep-terminal w-full bg-white rounded-xl p-3 text-[11px] font-black text-slate-700 border-none outline-none shadow-sm ring-1 ring-slate-100 focus:ring-pink-100 transition-all"
                           placeholder="如：第二航廈" value="${data?.depTerminal || ''}">
                </div>
                <div class="space-y-1.5">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">座位</label>
                    <input type="text" class="flight-seat w-full bg-white rounded-xl p-3 text-[11px] font-black text-slate-700 border-none outline-none shadow-sm ring-1 ring-slate-100 focus:ring-pink-100 transition-all"
                           placeholder="如：24A" value="${data?.seat || ''}">
                </div>
                <div class="space-y-1.5">
                    <label class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">登機門</label>
                    <input type="text" class="flight-gate w-full bg-white rounded-xl p-3 text-[11px] font-black text-slate-700 border-none outline-none shadow-sm ring-1 ring-slate-100 focus:ring-pink-100 transition-all"
                           placeholder="當天公告" value="${data?.gate || ''}">
                </div>
            </div>
        </div>`;
},


/** 🚀 動態導通：新增一組航班配置列 (組件對焦版) */
addFlightRow(tripId) {
    const container = document.getElementById('flight-items-container');
    const trip = state.trips.find(t => t.id === tripId);
    
    if (!container || !trip) {
        console.error("❌ [Route-Gap] 數據通路異常，無法新增航點");
        return;
    }

    // 🛡️ 真空化：如果目前顯示的是「無航班配置」提示，先清除
    if (container.querySelector('.border-dashed')) {
        container.innerHTML = '';
    }

    // 1. 計算目前的索引編號
    const newIndex = container.querySelectorAll('.flight-row').length;

    // 🚀 2. 關鍵焊接：嚴禁硬寫 HTML，直接調用統一組件
    // 這能確保新增的欄位跟上方已存在的欄位 100% 視覺與邏輯對焦
    const newRowHTML = this.generateFlightRowHTML(trip, newIndex);

    // 3. 物理掛載
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = newRowHTML;
    const newElement = tempDiv.firstElementChild;
    
    // 微調：將標籤改為「新航段」增加識別度 (選配)
    const label = newElement.querySelector('.theme-text-pink');
    if (label) label.textContent = `新航段 ${newIndex + 1}`;

    container.appendChild(newElement);
    
    // 4. 自動捲動導焦：確保使用者看到新產生的欄位
    container.scrollTo({
        top: container.scrollHeight,
        behavior: 'smooth'
    });
},





async saveMultiTransportData(tripId) {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return;

    const rows = document.querySelectorAll('.flight-row');
    const updatedTransport = [];

    rows.forEach(row => {
        const depCarrier    = row.querySelector('.flight-dep-carrier')?.value.trim() || "";
        const depCode       = row.querySelector('.flight-dep-code')?.value.trim() || "";
        const depPort       = row.querySelector('.flight-dep-port')?.value.trim() || "";
        const depTime       = row.querySelector('.flight-dep-time')?.value || "";
        const arrPort       = row.querySelector('.flight-arr-port')?.value.trim() || "";
        const arrTime       = row.querySelector('.flight-arr-time')?.value || "";
        const depTerminal   = row.querySelector('.flight-dep-terminal')?.value.trim() || "";
        const seat          = row.querySelector('.flight-seat')?.value.trim() || "";
        const gate          = row.querySelector('.flight-gate')?.value.trim() || "";
        const day           = parseInt(row.querySelector('.flight-day')?.value || 1);

        if (depPort || arrPort || depCarrier) {
            updatedTransport.push({
                carrier: depCarrier,
                code: depCode,
                depPort,
                depTime,
                arrPort,
                arrTime,
                depTerminal,
                seat,
                gate,
                day
            });
        }
    });

    try {
        const nowTs = Date.now();
        state.trips[tripIndex].transport = updatedTransport;
        state.trips[tripIndex].updatedAt = nowTs;
        state.lastLocalEdit = nowTs;
        localStorage.setItem('tf_last_local_edit', nowTs);

        await dbManager.save(state.trips[tripIndex]);

        this.modalRemove('edit-transport-modal');
        this.navigateTo('detail', tripId);

        uiManager.showToast("✈️", "航班路網與航司數據已同步");
        if (navigator.vibrate) navigator.vibrate(15);

    } catch (err) {
        console.error("❌ [Transport-Save-Fail] 航班設定異常:", err);
        uiManager.showToast("⚠️", "數據路網對焦異常，請重新嘗試");
    }
},


/** 💾 數據固化：航班與概覽數據合併 (V2026.ULTRA 航司識別版) */
async saveTransportData(tripId) {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return;

    // 🚀 1. 物理探測工具：封殺 DOM 缺失導致的空值
    const getVal = (id) => document.getElementById(id)?.value.trim() || "";

    // 取得概覽中的城市數據 (若有)
    const cityInput = document.getElementById('edit-city');
    if (cityInput) {
        state.trips[tripIndex].city = cityInput.value.trim();
    }

    // 🚀 2. 數據採集分流：補齊 carrier (航司) 與 code (班號) 軌道
    // 💡 職人診斷：同時兼容 Overview 模式與擴充後的數據 ID
    const depCarrier = getVal('flight-dep-carrier');
    const depCode = getVal('flight-dep-code');
    const depAirport = getVal('flight-dep-port') || getVal('edit-dep-port');
    const depTime = getVal('flight-dep-time') || getVal('edit-dep-time');

    const retCarrier = getVal('flight-ret-carrier');
    const retCode = getVal('flight-ret-code');
    const retAirport = getVal('flight-ret-port') || getVal('edit-ret-port');
    const retTime = getVal('flight-ret-time') || getVal('edit-ret-time');
    
    const depDate = getVal('edit-dep-date');
    const retDate = getVal('edit-ret-date');

    // 🚀 3. 燃料焊接：同步至 State (確保結構完整對焦 renderTransportCard)
    state.trips[tripIndex].transport = {
        departure: {
            carrier: depCarrier,  // 航空公司指紋
            code: depCode,        // 班機編號指紋
            airport: depAirport,
            time: depTime,
            date: depDate
        },
        return: {
            carrier: retCarrier,  // 航空公司指紋
            code: retCode,        // 班機編號指紋
            airport: retAirport,
            time: retTime,
            date: retDate
        }
    };

    try {
        // 🚀 4. 物理指紋同步與磁區固化
        const nowTs = Date.now();
        state.lastLocalEdit = nowTs;
        localStorage.setItem('tf_last_local_edit', nowTs);
        state.trips[tripIndex].updatedAt = nowTs;

        await dbManager.save(state.trips[tripIndex]);
        
        // 🚀 5. 物理回收與熱重連
        this.modalRemove('edit-overview-modal');
        this.modalRemove('edit-transport-modal');
        
        this.navigateTo('detail', tripId);
        uiManager.showToast("✈️", "航網數據與航空公司配置已固化");
        
        if (navigator.vibrate) navigator.vibrate(10);
        console.log(`📡 [Transport-Weld] Trip ${tripId} 航班主權已更新`);

    } catch (err) {
        console.error("❌ [Merge-Save-Fail]:", err);
        uiManager.showToast("⚠️", "磁區固化異常，路網斷路");
    }
},


/** 🗑️ 數據移除：清除特定天數的航班配置 (V2026.ULTRA 物理對焦版) */
async clearDayTransport(tripId, dayNum) {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return;

    // 1. 執行節點移除：從指定日期的數據軌道中切除 transport 燃料
    if (state.trips[tripIndex].days[dayNum - 1].transport) {
        delete state.trips[tripIndex].days[dayNum - 1].transport;
    }

    // 🚀 2. 物理指紋同步：確保刪除動作被存檔系統識別為最新狀態
    const nowTs = Date.now();
    state.lastLocalEdit = nowTs;
    localStorage.setItem('tf_last_local_edit', nowTs);

    try {
        // 3. 磁區固化：呼叫 dbManager 寫入該行程
        await dbManager.save(state.trips[tripIndex]);
        
        // 4. 物理清理：回收編輯模態框
        this.modalRemove('edit-transport-modal');
        
        // 🚀 5. 局部重整渲染
        // 重新導通視圖，這會讓 renderTransportCard 執行「無數據隱藏」邏輯
        this.switchDay(tripId, dayNum - 1);

        // 6. 語義化 UI 與 Haptic 反饋
        if (window.uiManager) {
            uiManager.showToast('🧹', "已移除該日航班配置並更新指紋");
        } else {
            uiManager.showToast("已移除該日航班配置");
        }
        
        if (navigator.vibrate) navigator.vibrate([5, 15]); // 輕微兩次震動，模擬物理撥盤感
        
        console.log(`📡 [Transport-Reclaim] Day ${dayNum} flight data cleared. Fingerprint: ${nowTs}`);

    } catch (err) {
        console.error("❌ [Data-Clear-Fail]:", err);
        uiManager.showToast('⚠️', "數據清除失敗：磁區寫入異常");
    }
},

// ============================================================
// 🚀 翻譯模組控制核心
// ============================================================




// 同步 AI 指令按鈕 (V2026.ULTRA 雙軌對焦版)
syncTranslateAiPrompt(val) {
    const btnContainer = document.getElementById('translate-ai-btn');
    if (btnContainer) {
        // 🚀 核心對焦：獲取當前活躍引擎 (可能是 en_viewEngine 或 viewEngine)
        // 確保獲取的是具備 IPA 與 意群對焦邏輯的英文引擎
        const activeViewEngine = this.getActiveViewEngine(); 
        
        // 💡 從正確的引擎獲取 Prompt 燃料
        const prompt = activeViewEngine._getTranslateAiPrompt(val);
        
        // 🏗️ 使用基礎 viewEngine 的渲染功能輸出 UI (維持按鈕外觀一致)
        btnContainer.innerHTML = viewEngine.renderAICopyBtn(prompt);
        
        console.log(`📡 [Prompt-Sync] 語系: ${state.currentLang} | 內容已重刷`);
    }
},


/** 🎙️ 語音模組對焦：即時搶佔版 (封殺聲音重疊) */
changeVoice(voiceId) {
    // 1. 物理洗滌與磁區固化
    const cleanId = typeof voiceId === 'string' ? voiceId.trim() : voiceId;
    if (!cleanId) return;

    // 🚀 核心焊接 A：即時熔斷 (Preemptive Strike)
    // 在切換瞬間，物理切斷所有正在播放的語音執行緒
    this.stopAllSpeech();

    localStorage.setItem('tf_voice_id', cleanId);
    
    // 🚀 核心焊接 B：物理標籤偵測
    const isEN = cleanId.startsWith('en-');
    
    // 2. 樣本語義對焦
    const samples = {
        'JP': "設定を変更しました。この声でよろしいですか？",
        'EN': "Voice updated. Is this voice setting okay for you?"
    };
    const sampleText = isEN ? samples['EN'] : samples['JP'];

    // 3. 視覺與觸覺回饋
    uiManager.showToast('🎙️', `對焦聲線: ${cleanId}`);
    if (navigator.vibrate) navigator.vibrate(10);
    
    console.log(`📡 [Acoustic-Dispatch] 引擎導向: ${isEN ? 'EN_Manager' : 'JP_Manager'} | ID: ${cleanId}`);

    // 🚀 4. 關鍵物理分流：縮短延遲至 50ms 達成即時體感
    setTimeout(() => {
        if (isEN) {
            // 🇺🇸 導通英文發動機
            if (window.en_audioManager && typeof window.en_audioManager.speak === 'function') {
                window.en_audioManager.speak(sampleText);
            }
        } else {
            // 🇯🇵 導通日文發動機
            if (window.audioManager && typeof window.audioManager.speak === 'function') {
                window.audioManager.speak(sampleText);
            }
        }
    }, 50); 
},

/** 🚀 [Manual-Acoustic] 手動聲學控制協定 (V2026.ULTRA 導通修正版) */
playCurrentSample() {
    // 1. 物理清理舊定時器
    if (window.TF_SAMPLE_TIMER) {
        clearTimeout(window.TF_SAMPLE_TIMER);
    }

    // 🚀 關鍵焊接：先執行物理熔斷(清空舊聲音)，隨後立即「解除鎖定」
    this.stopAllSpeech(); 
    
    // 💡 職人診斷：熔斷後必須手動恢復導通狀態，否則下方的 setTimeout 會被攔截
    window.EN_AUDIO_STOP_SIGNAL = false;
    window.JP_AUDIO_STOP_SIGNAL = false;

    const voiceId = localStorage.getItem('tf_voice_id');
    const settingLang = localStorage.getItem('tf_setting_voice_lang') || 'JP';
    const isEN = voiceId?.startsWith('en-') || (settingLang === 'EN');

    const samples = {
        'JP': "設定を確認します。この声でよろしいですか？",
        'EN': "Testing voice. Is this setting okay for you?"
    };
    const sampleText = isEN ? samples['EN'] : samples['JP'];

    window.TF_SAMPLE_TIMER = setTimeout(() => {
        // 這裡的檢查依然保留，防禦的是「按下試聽後又立刻按停止」的情況
        if (window.EN_AUDIO_STOP_SIGNAL === true || window.JP_AUDIO_STOP_SIGNAL === true) {
            console.warn("⚠️ [Acoustic-Bus] 播放攔截：偵測到中斷指令，取消本次發聲");
            return;
        }

        if (isEN) {
            window.en_audioManager?.speak(sampleText);
        } else {
            window.audioManager?.speak(sampleText);
        }
        
        window.TF_SAMPLE_TIMER = null;
    }, 50);
},

/** 🛑 全域語音中斷協定 (V2026.ULTRA 總線物理滅跡版) */
stopAllSpeech() {
    // 🚀 1. 攔截未來：清除所有排隊中的播報定時任務 (解決 setTimeout 洩漏)
    if (window.TF_SAMPLE_TIMER) {
        clearTimeout(window.TF_SAMPLE_TIMER);
        window.TF_SAMPLE_TIMER = null;
        console.log("🚫 [Acoustic-Bus] 已從排隊區移除未啟動的定時播報");
    }

    // 🚀 2. 物理斷路：設置全域熔斷旗幟，讓 API 請求回流時自覺熔斷
    window.EN_AUDIO_STOP_SIGNAL = true;
    window.JP_AUDIO_STOP_SIGNAL = true;

    // 🚀 3. 強制靜默：原生語音引擎 (封殺 SpeechSynthesis 幽靈)
    if (window.speechSynthesis) {
        // 職人診斷：必須先 pause 鎖死執行緒，再 cancel 才能 100% 清空隊列
        window.speechSynthesis.pause();
        window.speechSynthesis.cancel();
    }
    
    // 🚀 4. API 熔斷：執行 AudioContext 關閉與指針回收
    if (window.en_audioManager?.stop) window.en_audioManager.stop();
    if (window.audioManager?.stop) window.audioManager.stop();
    
    // 🚀 5. 物理滅跡：掃除 DOM 中所有殘留音軌節點
    const ghostTracks = document.querySelectorAll('audio');
    ghostTracks.forEach(track => {
        track.pause();
        track.src = ""; // 切斷緩存路徑
        track.load();   // 強制瀏覽器釋放硬體資源
        track.remove(); // 徹底移除
    });

    // 🚀 6. 介面反饋
    if (typeof uiManager !== 'undefined' && uiManager.showToast) {
        uiManager.showToast('⏹️', '播報已中斷');
    }
    
    console.log("📡 [Acoustic-Bus] 全路網語音總線：執行緒、定時器與 DOM 實體已全數滅跡");
},

/** 🛰️ [Setting Logic] 物理切換設定頁面的測試語系 */
setSettingVoiceLang(lang) {
    // 1. 寫入磁區
    localStorage.setItem('tf_setting_voice_lang', lang);
    
    // 2. 物理觸覺
    if (navigator.vibrate) navigator.vibrate(10);
    
    // 3. 🚀 關鍵對焦：強制在 'acoustic' 分頁進行視圖熱刷新
    // 💡 職人診斷：如果不傳第三個參數，navigateTo 會觸發 renderSettings 的預設值 'visual'
    this.navigateTo('settings', null, 'acoustic');
    
    // 4. 通知
    uiManager.showToast(lang === 'EN' ? '🇺🇸' : '🇯🇵', `聲學測試軌道：${lang === 'EN' ? 'English' : '日本語'}`);
},

/** 🛰️ [Debug-Proxy] 聲學診斷閘門切換 (V2026.ULTRA 總線控制版) */
    toggleAcousticDebug() {
        const currentState = localStorage.getItem('TF_DEBUG') === 'true';
        
        if (!currentState) {
            // 🚀 點火：啟動攔截器
            debugManager.manualEnable();
        } else {
            // 🛑 熄火：釋放總線監控
            localStorage.setItem('TF_DEBUG', 'false');
            uiManager.showToast('⚪', '診斷總線已離線');
            console.log("🚫 [Debug-Deactivated] 監測儀已關閉");
        }
        
        // 🚀 物理導通：觸發視圖熱重連，更新按鈕文字狀態
        // 💡 職人診斷：利用 navigateTo 強制重繪 settings 頁面的 acoustic 分頁
        this.navigateTo('settings', null, 'acoustic');
        
        if (navigator.vibrate) navigator.vibrate(10);
    },


// ============================================================
// 🎙️ 聲學對焦與分流指揮部 (V2026.ULTRA 雙引擎版)
// ============================================================

/** 🚀 [App-Commander] 語義對焦與發動機調度 (特訓模式遮蔽加固版) */
async speak(text, forceDisplay = false) {
    if (!text) return;

    // 🚀 核心焊接：特訓模式行為熔斷
    // 💡 職人診斷：若處於特訓視圖且非「強制顯示」狀態，則僅執行聲學噴發，封殺 UI 內容更新
    const isTraining = state.currentView === 'training';
    
    // 1. 物理掃描：偵測日文字符 (平假名、片假名)
    const hasJapanese = /[\u3040-\u309F\u30A0-\u30FF]/.test(text);
    
    // 2. 物理掃描：偵測英數字特徵
    const isEnglish = /^[a-zA-Z0-9\s,.'!?-]+$/.test(text.trim());

    console.log(`📡 [Acoustic-Focus] 模式: ${isTraining ? '特訓中' : '一般'} | 日文: ${hasJapanese}, 英文: ${isEnglish}`);

    try {
        // 🚀 3. 聲學發動機分流調度
        if (hasJapanese) {
            await audioManager.speak(text);
        } else if (isEnglish) {
            if (window.en_audioManager) {
                await en_audioManager.speak(text);
            } else {
                console.warn("⚠️ [Acoustic-Weld] en_audioManager 未掛載，降級至日文引擎");
                await audioManager.speak(text);
            }
        } else {
            await audioManager.speak(text);
        }

        // 🚀 4. 特訓反饋：若在特訓中，播報完畢後觸發「音軌已導通」的視覺提示
        if (isTraining && !forceDisplay) {
            uiManager.showToast('🎧', '音軌已對焦，請回想語義');
        }

    } catch (err) {
        console.error("🚨 [App-Acoustic-Collapse] 分流調度失敗:", err);
    }
},

/** 🎙️ 聲學參數校準：音高 (Pitch) - V2026 靜默對焦版 */
changeAudioPitch(val) {
    const pitch = parseFloat(val).toFixed(1);
    localStorage.setItem('tf_audio_pitch', pitch);
    
    const display = document.getElementById('audio-pitch-display');
    if (display) display.innerText = pitch;
    
    // 🚀 物理熔斷：嚴禁在此處觸發播報，確保滑動拉桿時保持絕對安靜
    if (navigator.vibrate) navigator.vibrate(5);
    console.log(`📡 [Acoustic-Silent-Weld] 音高數據已固化: ${pitch}`);
},

/** 📢 聲學參數校準：語速 (Velocity) - V2026 靜默對焦版 */
changeAudioRate(val) {
    const rate = parseFloat(val).toFixed(1);
    localStorage.setItem('tf_audio_rate', rate);
    
    const display = document.getElementById('audio-rate-display');
    if (display) display.innerText = `${rate}x`;
    
    // 🚀 物理熔斷：嚴禁在此處觸發播報
    if (navigator.vibrate) navigator.vibrate(5);
    console.log(`📡 [Acoustic-Silent-Weld] 語速數據已固化: ${rate}x`);
},

/** 🔊 傳統接口相容備援 */
async speakJapanese(text) {
    await this.speak(text); // 導向分流中心
},


promptClearVault(btnElement) {
    const existing = document.getElementById('mini-confirm-vault');
    if (existing) {
        existing.remove();
        return;
    }

    // 呼叫 viewEngine 生成氣泡
    const html = viewEngine.renderMiniConfirm(
        'mini-confirm-vault', 
        '確定抹除所有翻譯數據？', 
        'App.clearTranslateVault()' // 這裡保持字串形式正確
    );
    btnElement.parentElement.insertAdjacentHTML('beforeend', html);

    // 5秒自動回收
    setTimeout(() => {
        const bubble = document.getElementById('mini-confirm-vault');
        if (bubble) bubble.remove();
    }, 5000);
},



/** 🚀 彈出標籤編輯視窗 (回歸 modalEngine 核心) */
promptEditTranslateCategories() {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return;

    if (!trip.translateConfig) trip.translateConfig = { categories: ['交通', '用餐', '購物', '醫藥'] };
    
    const content = `
        <div class="space-y-4 text-left">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest">自定義翻譯分區名稱 (以逗號分隔)</p>
            <textarea id="edit-trans-cats" 
                      class="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-pink-100 outline-none">${trip.translateConfig.categories.join(', ')}</textarea>
            <p class="text-[9px] text-slate-400 italic leading-relaxed">* 變更名稱後，新加入的翻譯卡片將以此標籤為準。</p>
        </div>
    `;

    const actions = `
        <button onclick="App.modalRemove('edit-trans-cat-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消</button>
        <button onclick="App.saveTranslateCategories()" class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg">儲存標籤設定</button>
    `;

    // 🚀 導通修正：直接呼叫已存在的 modalEngine
    modalEngine.create('edit-trans-cat-modal', '⚙️ 自定義翻譯分區', content, actions);
},

/** 🚀 儲存標籤物理寫入 (V2026.ULTRA 配置固化版) */
async saveTranslateCategories() {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const input = document.getElementById('edit-trans-cats');
    if (!trip || !input) return;

    // 1. 語義解析：轉為陣列並執行數據洗滌
    const newCats = input.value.split(',')
        .map(c => c.trim())
        .filter(c => c !== "");
    
    if (newCats.length === 0) return uiManager.showToast('⚠️', '至少需保留一個分類標籤');
    
    // 2. 數據焊接：更新配置軌道
    if (!trip.translateConfig) trip.translateConfig = {};
    trip.translateConfig.categories = newCats;

    // 🚀 3. 物理指紋鎖定：配置異動屬於高優先權狀態變更
    const nowTs = Date.now();
    state.lastLocalEdit = nowTs;
    localStorage.setItem('tf_last_local_edit', nowTs);

    try {
        // 🚀 4. 磁區固化：對位 saveAllTrips 接口
        await dbManager.saveAllTrips(state.trips);
        
        // 5. 介面回收與導通
        modalEngine.remove('edit-trans-cat-modal');
        
        // 職人診斷：重新導向至翻譯模組，確保 Tabs 重新根據新配置渲染
        this.navigateTo('translate');
        
        // 6. 視覺與 Haptic 反饋
        uiManager.showToast('🎨', "翻譯分區配置已同步");
        if (navigator.vibrate) navigator.vibrate(10);
        
        console.log(`📡 [Config-Sync] Translate Categories updated. Fingerprint: ${nowTs}`);
    } catch (err) {
        console.error("❌ [Config-Save-Fatal]:", err);
        uiManager.showToast('⚠️', "配置固化失敗");
    }
},

/** 📢 聲學參數校準：長句減速補償 (V2026.ULTRA) */
changeLongPhraseOffset(val) {
    const offset = parseInt(val);
    localStorage.setItem('tf_long_phrase_offset', offset);
    
    const display = document.getElementById('long-phrase-offset-display');
    if (display) {
        // 顯示格式如：-5% 或 +2%
        display.innerText = (offset > 0 ? '+' : '') + offset + '%';
    }
    
    if (navigator.vibrate) navigator.vibrate(5);
    console.log(`📡 [Acoustic-Weld] 長句補償已固化: ${offset}%`);
},

/**
 * 🛰️ TravelFlow | 實戰翻譯模組 (Real-time Translation Logic)
 */


/** 🚀 聲學重複噴發：確保對焦當前活躍引擎與模式 (V2026.ULTRA) */
repeatLastTTS() {
    // 1. 🚀 數據提取：從結果區域抓取最後一次對焦的譯文
    const text = document.getElementById('tts-target')?.innerText;
    
    // 2. 🛡️ 佔位符洗滌與熔斷
    if (text && text !== "AI 語義對焦中..." && text !== "語義路網對焦中...") {
        
        // 🚀 關鍵焊接：嚴禁直接呼叫 audioManager
        // 必須回流至 App.speak 總線，讓它自動決定「日/英分流」與「特訓遮蔽邏輯」
        this.speak(text); 
        
    } else {
        uiManager.showToast('⚠️', "尚無有效的聲學燃料");
    }
},

// ============================================================
// 🌐 語義分流調度中心 (V2026.ULTRA 雙引擎對焦成員)
// ============================================================

/** 🚀 [Linguistic-Switch] 語義語系切換器 (V2026.ULTRA.FINAL_FIX) */
setTransLanguage(lang) {
    // 1. 🚀 物理固化真值標籤
    localStorage.setItem('tf_trans_lang', lang); 
    
    // 🚀 2. 核心焊接：同步更新全域指針與 State DNA
    // 💡 職人診斷：此處必須同步更新 window.state，否則下游組件會產生語軌判定偏差
    window.activeView = (lang === 'EN') ? window.en_translationView : window.translationView;
    window.activeTranslationEngine = (lang === 'EN') ? window.en_translationEngine : window.translationEngine;
    
    if (window.state) {
        window.state.currentLang = lang; 
        // 額外對位：同步更新分區語軌指針，確保 Boot 程序一致性
        window.state.realtimeLang = lang;
        window.state.contextualLang = lang;
    }

    // 3. 🚀 聲學熔斷：切換瞬間停止所有舊語音執行緒
    if (typeof this.stopAllSpeech === 'function') this.stopAllSpeech();

    // 4. 🚀 物理爆破容器：準備換血
    const contentContainer = document.getElementById('content-container');
    if (contentContainer) contentContainer.innerHTML = ''; 

    // 5. 反饋導通
    uiManager.showToast(lang === 'EN' ? '🇺🇸' : '🇯🇵', `語軌已對焦：${lang === 'EN' ? 'English' : '日本語'}`);
    if (navigator.vibrate) navigator.vibrate(10);

    // 🚀 6. 全量熱重連 (Dynamic Hot-Reload)
    // 💡 職人提醒：封殺寫死的 'realtime'，改用 state.currentView
    // 這能確保使用者在「特訓牆」切換語系時，依然留在特訓牆，但內容立即切換語系。
    const targetView = (window.state && window.state.currentView) ? window.state.currentView : 'realtime';
    
    this.navigateTo(targetView, state.activeTripId); 
    
    console.log(`🏁 [Lang-Switch] 系統主權已位移至: ${lang} | 視圖對焦: ${targetView}`);
},

/** 🚀 [Engine-Dispatch] 獲取當前活躍的翻譯引擎 (V2026.ULTRA.FINAL_FIX) */
get activeTranslationEngine() {
    // 🚀 1. 物理提領：從 localStorage 獲取唯一真值
    const lang = localStorage.getItem('tf_trans_lang') || 'JP';
    
    // 🚀 2. 引擎對焦：判定目標 ESM 模組
    const targetEngine = (lang === 'EN') ? en_translationEngine : translationEngine;

    // 🚀 3. 主權焊接：強制同步 window 層級的全域指針
    // 💡 職人診斷：這行能封殺「Getter 換了，但 window 變數沒換」導致的跨模組斷路。
    window.activeTranslationEngine = targetEngine;

    // 🚀 4. 磁區鎖定：同步全域語軌狀態
    if (window.state) window.state.currentLang = lang;

    return targetEngine;
},

/** 🚀 [View-Dispatch] 獲取當前活躍的視圖發動機 (V2026.ULTRA.FINAL_FIX) */
getActiveViewEngine() {
    // 🚀 1. 語軌 DNA 偵測 (SSOT 真值提領)
    const lang = localStorage.getItem('tf_trans_lang') || 'JP';

    // 🚀 2. 物理導通判定
    // 💡 職人診斷：加入 window 前綴確保在 ESM 作用域下 100% 抓到實體
    if (lang === 'EN') {
        const enView = window.en_translationView;
        if (enView && typeof enView.renderRealtimeTranslation === 'function') {
            return enView; // 鎖定英文藍色磁軌
        }
        console.warn("⚠️ [View-Link-Drift] en_translationView 離線或未掛載，執行緊急換軌。");
    }

    // 🚀 3. 熔斷機制 (Fallback)
    // 優先回歸 translationView，若皆不可用則退守至基礎 viewEngine
    const jpView = window.translationView || window.viewEngine;
    
    if (!jpView) {
        console.error("🚨 [Fatal-View-Collapse] 找不到任何視圖引擎實體");
    }
    
    return jpView;
},

// ============================================================
//   影子特訓中心
// ============================================================


/** 🔄 [SRS-Bridge-Final] 影子同步：全域自動對焦版 */
async syncSRSShadow({ silent = false } = {}) {
    if (!silent) uiManager.showToast('🔍', '正在啟動全域標籤磁區校準...');
    
    try {
        const allVault = await dbManager.getAll(dbManager.STORES.TRANS_VAULT);
        const allShadow = await dbManager.getAll(dbManager.STORES.SRS_META);
        const shadowMap = new Map(allShadow.map(s => [s.id, s]));
        let fuelToProject = [];

        allVault.forEach(f => {
            const eduVocab = Array.isArray(f.edu_vocab) ? f.edu_vocab : [];
            eduVocab.forEach((v, idx) => {
                const sid = `${f.id}_v_${idx}`;
                const existingItem = shadowMap.get(sid);
                
                let detectedLevel = v.level || f.level || "N3";
                let sanitizedLevel = String(detectedLevel).trim().toUpperCase();
                if (!['N1','N2','N3','N4','N5'].includes(sanitizedLevel)) {
                    sanitizedLevel = "N3"; 
                }

                const word = v["0"]; 
                const reading = v["1"];

                const needsUpdate = !existingItem || 
                                    !existingItem.level || 
                                    existingItem.level !== sanitizedLevel;

                if (needsUpdate && word) {
                    fuelToProject.push({ 
                        id: sid, 
                        parentId: f.id, 
                        word: word, 
                        reading: reading, 
                        level: sanitizedLevel, 
                        type: '單字',
                        stage: existingItem ? existingItem.stage : 0, 
                        nextReview: existingItem ? existingItem.nextReview : Date.now()
                    });
                }
            });
        });

        if (fuelToProject.length === 0) {
            if (!silent) uiManager.showToast('✅', '全路網標籤已達真值對焦');
            if (!silent && state.currentView === 'training') App.navigateTo('training');
            return;
        }

        await dbManager.batchPutSRS(fuelToProject);
        
        if (!silent) uiManager.showToast('✨', `全域校準完畢：已校正 ${fuelToProject.length} 筆標籤偏差`);
        if (!silent && state.currentView === 'training') App.navigateTo('training');

    } catch (err) {
        console.error("❌ [SRS-Sync-Collapse]:", err);
        if (!silent) uiManager.showToast('⚠️', '全域數據對焦失敗');
    }
},

/** 🏆 [SRS-Action] 提交特訓結果：記憶演進 (V2026.ULTRA.FINAL_DECOUPLED) */
async submitTrainingResult(id, isSuccess) {
    // 🚀 1. 物理固化：執行記憶能階演算與磁區指紋更新
    // 💡 職人診斷：確保 async/await 導通，防止數據寫入延遲
    const nextSRS = await translationEngine.calculateSRS(id, isSuccess);
    const success = await dbManager.updateSRSFingerprint(id, nextSRS);

    if (success) {
        // 🚀 2. 模式主權分流
        if (state.trainingContext.mode === '挑戰') {
            // 🎯 【挑戰模式】軌道：
            // 僅執行數據同步 Log，不干涉 UI 移除或結算判定。
            // 換題與結算主權已 100% 移交給 App.checkChallenge。
            console.log(`💾 [SRS-Weld] 挑戰戰果固化成功: ${id} | Result: ${isSuccess}`);
        } else {
            // 🎯 【一般特訓】軌道 (讀/聽)：
            // 執行傳統的「卡片移除」動畫，維持清單模式的特訓手感。
            if (window.translationView && typeof translationView.updateTrainingCardUI === 'function') {
                translationView.updateTrainingCardUI(id, isSuccess);
            }
        }

        // 🚀 3. 物理觸覺反饋 (Haptic Feedback)
        if (navigator.vibrate) {
            // 成功：短促點火 (10ms) | 失敗：雙重警示 ([30, 30]ms)
            navigator.vibrate(isSuccess ? 10 : [30, 30]);
        }
        
        // 🚀 核心修正：徹底封殺舊有結算邏輯
        // 💡 職人提醒：嚴禁在此處調用 finalizeChallenge() 或檢查 remainingCount。
        // 任何關於「下一題」或「結束」的指令，現在統一由 checkChallenge 的延遲執行續發動。
    }
},

/** 🌪️ [SRS-Force-Reset] 手動強制清空 (V2026.ULTRA 流程解耦版) */
async forceResetSRS() {
    uiManager.showToast('⚠️', '執行磁區物理洗滌？', 5000, {
        onConfirm: async () => {
            try {
                // 1. 🚀 物理切除：將影子磁區真空化
                await dbManager.clearSRSMetadata();
                
                // 2. 🚀 視覺重置：直接跳轉回特訓視圖 (不觸發同步)
                // 💡 職人診斷：navigateTo 會呼叫 renderTrainingWall，
                // 因為資料庫現在是空的，它會正確顯示「🏆 當前記憶已固化」的空值畫面。
                App.navigateTo('training');
                
                uiManager.showToast('✨', '磁區已排空，記憶軌道重置');
                
                if (navigator.vibrate) navigator.vibrate([20, 50]);
            } catch (err) {
                console.error("❌ [SRS-Reset-Collapse]:", err);
                uiManager.showToast('💥', '磁區回收失敗');
            }
        }
    });
},

/** 🚀 [SRS-Router] 特訓中心狀態分流器 (V2026.ULTRA.FINAL_STABLE) */
setTrainingTab(type, value) {
    // 🚀 1. 基礎物理補償
    if (!state.trainingContext) {
        state.trainingContext = { mode: '讀', level: 'All', page: 1, perPage: 10, displayMode: '漢字' };
    }

    // 💡 屬性對焦導通
    if (type === 'displayMode' && !state.trainingContext.hasOwnProperty('displayMode')) {
        state.trainingContext.displayMode = '漢字';
    }

    // 🚀 2. 核心邏輯：數據寫入與「挑戰模式」專屬點火協定
    state.trainingContext[type] = value;

    // 🎯 職人加固：當切換至「挑戰」模式時，執行磁區初始化
    if (type === 'mode' && value === '挑戰') {
        // 🔒 物理鎖定：確保 challengeActive 為 false 以顯示準備畫面（或您決定的點火介面）
        state.challengeActive = false; 
        
        // 💣 殘留清除：抹除所有舊題指針與戰報，確保「開局即新」
        state.currentChallengeItem = null;
        state.challengeSessionResults = [];
        
        // 🔓 聲學熔斷解除：確保切換過來時音軌是導通的
        window.JP_AUDIO_STOP_SIGNAL = false;
        window.EN_AUDIO_STOP_SIGNAL = false;
        
        console.log("🔥 [Battle-Mode] 挑戰磁區已執行物理重置，準備點火");
    }

    // 🚀 3. 換頁邏輯洗滌
    if (['level', 'mode', 'displayMode'].includes(type)) {
        state.trainingContext.page = 1;
    }

    // 🚀 4. 物理反饋與導航
    if (navigator.vibrate) navigator.vibrate(8);
    
    console.log(`📡 [Training-Weld] ${type} 已對焦至: ${value}`);
    
    // 執行視圖重連：這會觸發 _renderChallengeSection
    this.navigateTo('training');
},


/** 📡 [Action] 手動/自動對焦掃描 (防禦型) */
async manualSRSRefresh(btn, silent = false) {
    if (btn) {
        btn.disabled = true;
        const icon = btn.querySelector('i');
        if (icon) icon.classList.add('fa-spin');
    }

    try {
        const storeName = 'srsMetadata'; 
        const freshSRS = await dbManager.getAll(storeName);
        
        // 🚀 數據焊接與鎖定
        state.srsMetadata = freshSRS || [];
        state.hasAutoScanned = true; // 🔥 核心：一旦成功掃描，鎖定當前會話
        
        console.log(`🛰️ [SRS-Scanner] 會話對焦鎖定，燃料數: ${state.srsMetadata.length}`);

        // 刷新視圖
        this.navigateTo('training');

        if (!silent) uiManager.showToast('📡', `對焦完成`);

    } catch (err) {
        console.error("❌ [Scanner-Fatal]:", err);
    } finally {
        if (btn) {
            btn.disabled = false;
            const icon = btn.querySelector('i');
            if (icon) icon.classList.remove('fa-spin');
        }
    }
},

_calcSubAccuracy(results, type) {
    const subset = results.filter(r => r.mode === type);
    if (subset.length === 0) return 100;
    const success = subset.filter(r => r.success).length;
    return Math.round((success / subset.length) * 100);
},

// ============================================================
    // 🎯 挑戰模式控制中樞 (V2026.ULTRA.SINGLE_CHALLENGE)
    // ============================================================

startChallengeCountdown() {

    clearInterval(state.challengeTimerInterval);
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeEventLock = false;
    state.challengeTimerInterval = null;
    state.challengeAnsTimerInterval = null;
    state.challengeTotalTime = 60;
    state.challengeAnsTime = 5;
    state.challengeAnsTimeBase = 5;
    state.challengeStreak = 0;
    state.challengeMaxStreak = 0;
    state.challengeBuffsGot = 0;
    state.challengeShield = 0;
    state.challengeLives = 3;        // 🆕 三條命
    state.challengeNextBuff = 5;
    state.challengeTempBoost = null;
    state.challengeChainActive = false;  // 🆕 連鎖挑戰狀態
    state.challengeChainCount = 0;       // 🆕 連鎖題目計數
    state.challengeChainFailed = false;  // 🆕 連鎖是否失敗
    state.challengeFreezing = false;     // 🆕 冰凍狀態
    state.challengeFinalizing = false;
    state.challengeActive = false;
    state.challengeSessionResults = [];
    state.recentChallengeIds = [];

    this.navigateTo('training');
    setTimeout(() => {
        const display = document.getElementById('countdown-display');
        if (!display) return;

        let timer = 3;
        if (navigator.vibrate) navigator.vibrate(15);

        const run = () => {
            if (timer > 0) {
                display.innerHTML = `
                    <div class="flex flex-col items-center animate-fade-in">
                        <h1 class="text-9xl font-black theme-text-pink animate-ping">${timer}</h1>
                        <p class="text-slate-300 font-black text-[11px] uppercase tracking-[0.4em] mt-8">System Ignition...</p>
                    </div>`;
                timer--;
                if (navigator.vibrate) navigator.vibrate(5);
                setTimeout(run, 1000);
            } else {
                state.challengeActive = true;

// 🎮 遊戲開始，隱藏所有頂部 UI
document.querySelector('header')?.style.setProperty('display', 'none', 'important');
document.querySelectorAll('.sticky, .training-header, #level-tabs-track').forEach(el =>
    el.style.setProperty('display', 'none', 'important')
);
document.getElementById('content-container').style.paddingBottom = '0';

state.currentChallengeItem = null;
state.challengeTimerInterval = setInterval(() => {
                    if (state.challengeFreezing) return; // 🆕 冰凍時跳過
                    state.challengeTotalTime--;

                    const timeEl = document.getElementById('challenge-total-time');
                    if (timeEl) {
                        timeEl.textContent = state.challengeTotalTime;
                        if (state.challengeTotalTime <= 10) timeEl.style.color = '#E24B4A';
                    }

                    const elapsed = 60 - state.challengeTotalTime;
                    const reduction = Math.floor(elapsed / 20);
                    let cur = state.challengeAnsTimeBase - reduction;
                    if (state.challengeTempBoost) cur += state.challengeTempBoost.sec;
                    state.challengeAnsTime = Math.max(2, cur);

                    if (state.challengeTotalTime <= 0) {
                        clearInterval(state.challengeTimerInterval);
                        state.challengeTimerInterval = null;
                        this.finalizeChallenge(state.challengeSessionResults);
                    }
                }, 1000);

                this.navigateTo('training');
            }
        };
        run();
    }, 300);
},


checkChallenge(id, selected, correct) {
    const cardEl = document.getElementById(`challenge-${id}`);
    const activeMode = cardEl?.getAttribute('data-mode') || '讀';
    const challengeType = cardEl?.getAttribute('data-type') || 'unknown';

    const { cleanSelected, cleanCorrect } = this._sanitizeChallengeData(selected, correct, challengeType);
    const isSuccess = (cleanSelected === cleanCorrect);

    if (!state.challengeSessionResults) state.challengeSessionResults = [];
    state.challengeSessionResults.push({ id, success: isSuccess, mode: activeMode, type: challengeType });

    if (!state.recentChallengeIds) state.recentChallengeIds = [];
    state.recentChallengeIds.push(id);
    if (state.recentChallengeIds.length > 10) state.recentChallengeIds.shift();

    this._emitChallengeFeedback(isSuccess, cleanCorrect, activeMode);
    this.submitTrainingResult(id, isSuccess);

    if (!isSuccess) {
        // 🆕 連鎖挑戰中失敗：扣時間但不扣命
        if (state.challengeChainActive) {
            state.challengeChainFailed = true;
            state.challengeChainActive = false;
            state.challengeChainCount = 0;
            state.challengeTotalTime = Math.max(5, state.challengeTotalTime - 15);
            uiManager.showToast('💥', '連鎖失敗！-15秒');
            if (navigator.vibrate) navigator.vibrate([50, 30, 50]);
            setTimeout(() => this._triggerNextChallenge(activeMode), 1000);
            return;
        }

        // 🆕 扣命邏輯
        state.challengeLives = Math.max(0, (state.challengeLives || 1) - 1);
        this._updateLivesUI();

        if (state.challengeLives <= 0) {
            uiManager.showToast('💀', 'ゲームオーバー');
            if (navigator.vibrate) navigator.vibrate([50, 100, 50]);
            clearInterval(state.challengeTimerInterval);
            setTimeout(() => this.finalizeChallenge(state.challengeSessionResults), 800);
        } else {
            uiManager.showToast('❤️', `残り${state.challengeLives}機`);
            if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
            state.challengeStreak = 0;
            setTimeout(() => this._triggerNextChallenge(activeMode), 1000);
        }
        return;
    }

    // ✅ 正解分支
    state.challengeStreak = (state.challengeStreak || 0) + 1;
    state.challengeMaxStreak = Math.max(state.challengeMaxStreak || 0, state.challengeStreak);

    if (state.challengeTempBoost) {
        state.challengeTempBoost.left--;
        if (state.challengeTempBoost.left <= 0) state.challengeTempBoost = null;
    }

    // 🆕 連鎖挑戰進度
    if (state.challengeChainActive) {
        state.challengeChainCount++;
        this._updateChainUI();
        if (state.challengeChainCount >= 3) {
            state.challengeChainActive = false;
            state.challengeChainCount = 0;
            state.challengeTotalTime += 20;
            uiManager.showToast('🔥', '連鎖成功！+20秒');
            if (navigator.vibrate) navigator.vibrate([15, 30, 15, 50]);
            this._triggerNextChallenge(activeMode);
            return;
        }
        this._triggerNextChallenge(activeMode);
        return;
    }

    const successCount = state.challengeSessionResults.filter(r => r.success).length;
    const isBuff5Trigger = successCount > 0 && successCount % 5 === 0;

    if (isBuff5Trigger) {
        clearInterval(state.challengeTimerInterval);
        clearInterval(state.challengeAnsTimerInterval);
        state.challengeAnsTimerInterval = null;
        setTimeout(() => this._showChallengeBuff(), 800);
        return;
    }

// 🆕 在 checkChallenge 隨機事件觸發前，先設定事件鎖
const roll = Math.random();
if (roll < 0.03) {
    state.challengeEventLock = true; // 🔒 鎖住，防止其他 setTimeout 蓋掉畫面
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;
    clearInterval(state.challengeTimerInterval);
    state.challengeTimerInterval = null;
    setTimeout(() => this._showFreezeCard(), 600);
} else if (roll < 0.13) {
    state.challengeEventLock = true;
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;
    setTimeout(() => this._showChainChallenge(), 600);
} else if (roll < 0.33) {
    state.challengeEventLock = true;
    clearInterval(state.challengeTimerInterval);
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;
    setTimeout(() => this._showChestDrop(), 600);
} else {
    this._triggerNextChallenge(activeMode);
}
},

_updateLivesUI() {
    const livesEl = document.getElementById('challenge-lives');
    if (!livesEl) return;
    const lives = state.challengeLives || 0;
    livesEl.innerHTML = [1,2,3].map(i =>
        `<i class="fa-solid fa-heart" style="font-size:14px; color:${i <= lives ? '#E24B4A' : '#E2E8F0'};"></i>`
    ).join('');
},

_updateChainUI() {
    const chainEl = document.getElementById('challenge-chain-progress');
    if (!chainEl) return;
    const count = state.challengeChainCount || 0;
    chainEl.innerHTML = [1,2,3].map(i =>
        `<div style="
            width: 28px; height: 6px; border-radius: 3px;
            background: ${i <= count ? '#E24B4A' : '#E2E8F0'};
            transition: background 0.3s;
        "></div>`
    ).join('');
},

_showChainChallenge() {
    // 🛡️ 鎖住，防止殘留 setTimeout 蓋掉畫面
    state.challengeEventLock = true;
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;

    state.challengeChainActive = true;
    state.challengeChainCount = 0;
    state.challengeChainFailed = false;

    const container = document.getElementById('content-container');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 32px 16px 48px; text-align: center;">
            <div style="margin-bottom: 24px;">
                <div style="
                    width: 80px; height: 80px; border-radius: 24px;
                    background: #FCEBEB;
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 16px;
                    border: 4px solid #E24B4A;
                ">
                    <i class="fa-solid fa-link" style="font-size: 36px; color: #E24B4A;"></i>
                </div>
                <span style="
                    display: inline-block;
                    background: #FCEBEB; color: #A32D2D;
                    font-size: 11px; font-weight: 700;
                    padding: 3px 14px; border-radius: 20px;
                    letter-spacing: 0.08em; margin-bottom: 10px;
                ">高風險・高報酬</span>
                <p style="font-size: 22px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 8px;">連鎖チャレンジ</p>
                <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0 0 24px;">次の3問すべて正解 → <b style="color:#3B6D11;">+20秒</b><br>1問でも誤り → <b style="color:#E24B4A;">-15秒</b>（命は減らない）</p>
            </div>

            <div style="display: flex; gap: 8px; justify-content: center; margin-bottom: 32px;">
                ${[1,2,3].map(() => `
                    <div style="width: 60px; height: 8px; border-radius: 4px; background: #E2E8F0;"></div>
                `).join('')}
            </div>

            <button onclick="App._startChainChallengeGame()"
                style="
                    width: 100%; max-width: 280px;
                    padding: 16px;
                    background: #E24B4A; color: white;
                    border: none; border-radius: var(--border-radius-lg);
                    font-size: 15px; font-weight: 700;
                    cursor: pointer;
                ">受けて立つ！</button>

            <button onclick="App._skipChainChallenge()"
                style="
                    display: block; margin: 12px auto 0;
                    background: none; border: none;
                    font-size: 13px; color: var(--color-text-secondary);
                    cursor: pointer;
                ">スキップする</button>
        </div>`;
},

_startChainChallengeGame() {
    state.challengeEventLock = false; // 🔓
    state.currentChallengeItem = null;
    this.navigateTo('training');
},

_skipChainChallenge() {
    state.challengeChainActive = false;
    state.challengeChainCount = 0;
    state.challengeEventLock = false; // 🔓
    state.currentChallengeItem = null;
    this.navigateTo('training');
},

_showFreezeCard() {
    // 🛡️ 先停掉答題倒數，否則時間到會蓋掉凍結畫面
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;
    
    // 🛡️ 凍結總計時器
    state.challengeFreezing = true;

    const container = document.getElementById('content-container');
    if (!container) return;

    const freezeSec = 8;
    let left = freezeSec;


    container.innerHTML = `
        <div style="padding: 32px 16px 48px; text-align: center;">
            <div style="
                width: 80px; height: 80px; border-radius: 24px;
                background: #E6F1FB;
                display: flex; align-items: center; justify-content: center;
                margin: 0 auto 16px;
                border: 4px solid #378ADD;
            ">
                <i class="fa-solid fa-snowflake" style="font-size: 36px; color: #185FA5;"></i>
            </div>
            <span style="
                display: inline-block;
                background: #E6F1FB; color: #0C447C;
                font-size: 11px; font-weight: 700;
                padding: 3px 14px; border-radius: 20px;
                letter-spacing: 0.08em; margin-bottom: 10px;
            ">超稀有ドロップ</span>
            <p style="font-size: 22px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 8px;">❄️ タイム凍結</p>
            <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0 0 8px;">残り時間が<b style="color:#185FA5;">${freezeSec}秒間</b>凍結！</p>
            <p style="font-size: 12px; color: var(--color-text-secondary); margin: 0 0 32px; opacity: 0.7;">答題は普通に続けてください</p>
            <p id="freeze-countdown" style="font-size: 64px; font-weight: 700; color: #185FA5; margin: 0 0 32px;">${freezeSec}</p>

            <button onclick="App._skipFreezeCard()"
                style="
                    background: none; border: 0.5px solid var(--color-border-tertiary);
                    border-radius: var(--border-radius-lg);
                    padding: 12px 32px;
                    font-size: 13px; color: var(--color-text-secondary);
                    cursor: pointer;
                ">今すぐ次の問題へ</button>
        </div>`;

    if (navigator.vibrate) navigator.vibrate([10, 20, 10, 20, 10]);

    const tick = setInterval(() => {
    left--;
    const el = document.getElementById('freeze-countdown');
    if (el) el.textContent = left;

    // tick 結束
if (left <= 0) {
    clearInterval(tick);
    state.challengeFreezeTick = null;
    state.challengeFreezing = false;
    state.currentChallengeItem = null;
    // 🛡️ 重啟總計時器
    this._restartChallengeTimer();
    state.challengeEventLock = false; // 🔓 解鎖
    this.navigateTo('training');
}
}, 1000);

state.challengeFreezeTick = tick;
},

// _skipFreezeCard
_skipFreezeCard() {
    clearInterval(state.challengeFreezeTick);
    state.challengeFreezeTick = null;
    state.challengeFreezing = false;
    state.challengeEventLock = false; // 🔓
    state.currentChallengeItem = null;
    this._restartChallengeTimer();
    this.navigateTo('training');
},

_restartChallengeTimer() {
    clearInterval(state.challengeTimerInterval);
    state.challengeTimerInterval = setInterval(() => {
        if (state.challengeFreezing) return;
        state.challengeTotalTime--;

        const timeEl = document.getElementById('challenge-total-time');
        if (timeEl) {
            timeEl.textContent = state.challengeTotalTime;
            if (state.challengeTotalTime <= 10) timeEl.style.color = '#E24B4A';
        }

        const elapsed = 60 - state.challengeTotalTime;
        const reduction = Math.floor(elapsed / 20);
        let cur = state.challengeAnsTimeBase - reduction;
        if (state.challengeTempBoost) cur += state.challengeTempBoost.sec;
        state.challengeAnsTime = Math.max(2, cur);

        if (state.challengeTotalTime <= 0) {
            clearInterval(state.challengeTimerInterval);
            state.challengeTimerInterval = null;
            this.finalizeChallenge(state.challengeSessionResults);
        }
    }, 1000);
},


_showChestDrop() {
    // 🛡️ 鎖住，防止殘留 setTimeout 蓋掉畫面
    state.challengeEventLock = true;
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;
    clearInterval(state.challengeTimerInterval);
    state.challengeTimerInterval = null;

    const CHESTS = [
        { tier: 'common', icon: 'fa-box', bg: '#F1EFE8', color: '#5F5E5A', label: '普通箱',
          rewards: [
            { name: '+3秒',       desc: '残り時間が3秒増加',          apply: () => { state.challengeTotalTime += 3; } },
            { name: 'ヒント付き', desc: '次の1問に正解がハイライト',   apply: () => { state.challengeHint = true; } },
          ]
        },
        { tier: 'silver', icon: 'fa-box-open', bg: '#E6F1FB', color: '#185FA5', label: '銀箱',
          rewards: [
            { name: '+8秒',          desc: '残り時間が8秒増加',         apply: () => { state.challengeTotalTime += 8; } },
            { name: '解答時間 +1秒', desc: '次の5問の解答時間が+1秒',   apply: () => { state.challengeTempBoost = { sec: 1, left: 5 }; } },
            { name: '凍結 5秒',      desc: '時間が5秒間停止',           apply: () => { state.challengeFreezing = true; setTimeout(() => { state.challengeFreezing = false; }, 5000); } },
          ]
        },
        { tier: 'gold', icon: 'fa-trophy', bg: '#FAEEDA', color: '#BA7517', label: '金箱',
          rewards: [
            { name: '+15秒',             desc: '残り時間が15秒増加',           apply: () => { state.challengeTotalTime += 15; } },
            { name: '失敗免除 ×1',       desc: '次の失敗を1回免除する',        apply: () => { state.challengeShield = (state.challengeShield || 0) + 1; } },
            { name: '解答時間永久 +1秒', desc: '解答制限時間が永久に1秒増加',  apply: () => { state.challengeAnsTimeBase += 1; state.challengeAnsTime += 1; } },
            { name: '残機 +1',           desc: 'ライフが1つ回復',              apply: () => { state.challengeLives = Math.min(3, (state.challengeLives || 0) + 1); App._updateLivesUI(); } },
          ]
        },
    ];

    const tierRoll = Math.random();
    const chest = tierRoll < 0.05 ? CHESTS[2]
                : tierRoll < 0.25 ? CHESTS[1]
                : CHESTS[0];

    const reward = chest.rewards[Math.floor(Math.random() * chest.rewards.length)];
    state._pendingChestReward = reward;

    const TIER_BORDER = {
        common: '4px solid #B4B2A9',
        silver: '4px solid #378ADD',
        gold:   '4px solid #EF9F27',
    };

    const container = document.getElementById('content-container');
    if (!container) return;

    container.innerHTML = `
        <div style="padding: 32px 16px 48px; text-align: center;">
            <div style="margin-bottom: 24px;">
                <div style="
                    width: 80px; height: 80px; border-radius: 24px;
                    background: ${chest.bg};
                    display: flex; align-items: center; justify-content: center;
                    margin: 0 auto 16px;
                    border: ${TIER_BORDER[chest.tier]};
                ">
                    <i class="fa-solid ${chest.icon}" style="font-size: 36px; color: ${chest.color};"></i>
                </div>
                <span style="
                    display: inline-block;
                    background: ${chest.bg}; color: ${chest.color};
                    font-size: 11px; font-weight: 700;
                    padding: 3px 14px; border-radius: 20px;
                    letter-spacing: 0.08em; margin-bottom: 10px;
                ">${chest.label}を発見！</span>
                <p style="font-size: 22px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 4px;">寶箱ドロップ</p>
                <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0;">タップして開けてください</p>
            </div>

            <div id="chest-reward-card" onclick="App._revealChestReward()"
                style="
                    background: var(--color-background-primary);
                    border: 0.5px solid var(--color-border-tertiary);
                    border-left: ${TIER_BORDER[chest.tier]};
                    border-radius: var(--border-radius-lg);
                    padding: 28px 18px;
                    cursor: pointer;
                    transition: transform 0.15s;
                    margin-bottom: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    min-height: 80px;
                "
                onmouseenter="this.style.transform='scale(1.02)'"
                onmouseleave="this.style.transform='scale(1)'">
                <i class="fa-solid fa-question" style="font-size: 32px; color: var(--color-text-secondary); opacity: 0.3;"></i>
                <span style="font-size: 15px; color: var(--color-text-secondary); font-weight: 500;">タップして開封</span>
            </div>

            <p style="font-size: 11px; color: var(--color-text-secondary); opacity: 0.5;">開封後、ゲームが再開されます</p>
        </div>`;
},


_revealChestReward() {
    const reward = state._pendingChestReward;
    if (!reward) return;

    reward.apply();
    state.challengeBuffsGot = (state.challengeBuffsGot || 0) + 1;
    state._pendingChestReward = null;

    uiManager.showToast('🎁', reward.name);
    if (navigator.vibrate) navigator.vibrate([15, 30, 15]);

    const card = document.getElementById('chest-reward-card');
    if (card) {
        card.innerHTML = `
            <i class="fa-solid fa-gift" style="font-size: 24px; color: #EF9F27;"></i>
            <div style="text-align: left;">
                <p style="font-size: 15px; font-weight: 500; color: var(--color-text-primary); margin: 0 0 4px;">${reward.name}</p>
                <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0;">${reward.desc}</p>
            </div>`;
        card.style.cursor = 'default';
        card.onclick = null;
        card.style.borderLeftColor = '#EF9F27';
    }

    setTimeout(() => {
        state.challengeEventLock = false; // 🔓 解鎖
        this._restartChallengeTimer();    // 統一重啟計時器
        state.currentChallengeItem = null;
        this.navigateTo('training');
    }, 1200);
},

_showChallengeBuff() {
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;
    const BUFFS = {
        legend: [
            { name:'時間延長 +30秒', desc:'残り時間が30秒増加', rarity:'legend',
              apply: () => { state.challengeTotalTime += 30; }},
            { name:'解答時間永久 +1秒', desc:'解答制限時間が永久に1秒増加', rarity:'legend',
              apply: () => { state.challengeAnsTimeBase += 1; state.challengeAnsTime += 1; }},
            { name:'失敗免除 ×1', desc:'次の失敗を1回免除する', rarity:'legend',
              apply: () => { state.challengeShield = (state.challengeShield || 0) + 1; }},
            { name:'残機 +1', desc:'ライフが1つ回復する', rarity:'legend',
              apply: () => { state.challengeLives = Math.min(3, (state.challengeLives || 0) + 1); this._updateLivesUI(); }},
        ],
        high: [
            { name:'時間延長 +10秒', desc:'残り時間が10秒増加', rarity:'high',
              apply: () => { state.challengeTotalTime += 10; }},
            { name:'解答時間 +1秒（10問）', desc:'次の10問の解答時間が+1秒', rarity:'high',
              apply: () => { state.challengeTempBoost = { sec: 1, left: 10 }; }},
            { name:'連鎖免疫 ×1', desc:'次の連鎖チャレンジ失敗時の時間減少を無効化', rarity:'high',
              apply: () => { state.challengeChainImmune = true; }},
        ],
        normal: [
            { name:'次の問題ヒント付き', desc:'次の1問に正解がハイライト表示', rarity:'normal',
              apply: () => { state.challengeHint = true; }},
            { name:'正解ボーナス +2', desc:'次の正解で2問分カウント', rarity:'normal',
              apply: () => { state.challengeBonus = 2; }},
        ],
        nerf: [
            { name:'解答時間 -1秒', desc:'解答制限時間が1秒減少', rarity:'nerf',
              apply: () => { state.challengeAnsTime = Math.max(2, (state.challengeAnsTime || 5) - 1); state.challengeAnsTimeBase = Math.max(2, (state.challengeAnsTimeBase || 5) - 1); }},
            { name:'時間減少 -5秒', desc:'残り時間が5秒減少', rarity:'nerf',
              apply: () => { state.challengeTotalTime = Math.max(5, (state.challengeTotalTime || 60) - 5); }},
        ]
    };

    const RARITY_COLOR = {
        legend: { bg:'#FAC775', color:'#412402', label:'伝説' },
        high:   { bg:'#B5D4F4', color:'#042C53', label:'上級' },
        normal: { bg:'#EAF3DE', color:'#173404', label:'通常' },
        nerf:   { bg:'#FCEBEB', color:'#501313', label:'弱体' },
    };

    const rollRarity = () => {
        const r = Math.random();
        if (r < 0.05) return 'legend';
        if (r < 0.20) return 'high';
        if (r < 0.60) return 'normal';
        return 'nerf';
    };

    const picks = [0,1,2].map(() => {
        const rarity = rollRarity();
        const pool = BUFFS[rarity];
        const buff = pool[Math.floor(Math.random() * pool.length)];
        return { ...buff, rarity };
    });

    // 暫存 buff 選項
    state._pendingBuffs = picks;

const container = document.getElementById('content-container');
if (!container) return;

const successCount = (state.challengeSessionResults || []).filter(r => r.success).length;

const RARITY_ICON = {
        legend: 'fa-crown',
        high:   'fa-bolt',
        normal: 'fa-circle-check',
        nerf:   'fa-triangle-exclamation',
    };
    const RARITY_LEFT = {
        legend: '4px solid #EF9F27',
        high:   '4px solid #378ADD',
        normal: '4px solid #639922',
        nerf:   '4px solid #E24B4A',
    };
    const RARITY_ICON_BG = {
        legend: '#FAEEDA',
        high:   '#E6F1FB',
        normal: '#EAF3DE',
        nerf:   '#FCEBEB',
    };
    const RARITY_ICON_COLOR = {
        legend: '#BA7517',
        high:   '#185FA5',
        normal: '#3B6D11',
        nerf:   '#A32D2D',
    };

    container.innerHTML = `
        <div style="padding: 24px 16px 40px;">
            <div style="text-align:center; margin-bottom: 20px;">
                <span style="
                    display: inline-block;
                    background: #FAC775; color: #412402;
                    font-size: 11px; font-weight: 700;
                    padding: 3px 12px; border-radius: 20px;
                    letter-spacing: 0.08em; margin-bottom: 10px;
                ">${successCount}問正解</span>
                <p style="font-size: 22px; font-weight: 700; color: var(--color-text-primary); margin: 0 0 4px;">バフ獲得チャンス</p>
                <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0;">1つ選んでください</p>
            </div>

            <div style="display: flex; flex-direction: column; gap: 12px;">
                ${picks.map((buff, i) => {
                    const rc = RARITY_COLOR[buff.rarity];
                    const isTop = buff.rarity === 'legend' || buff.rarity === 'high';
                    return `
                    <div onclick="App._applyChallengeBuff(${i})"
                        style="
                            background: var(--color-background-primary);
                            border: 0.5px solid var(--color-border-tertiary);
                            border-left: ${RARITY_LEFT[buff.rarity]};
                            border-radius: var(--border-radius-lg);
                            padding: 16px 18px;
                            display: flex;
                            align-items: flex-start;
                            gap: 14px;
                            cursor: pointer;
                            position: relative;
                            transition: transform 0.15s;
                        "
                        onmouseenter="this.style.transform='scale(1.02)'"
                        onmouseleave="this.style.transform='scale(1)'">

                        ${isTop ? `<div style="
                            position: absolute; top: -10px; left: 16px;
                            background: ${rc.bg}; color: ${rc.color};
                            font-size: 10px; font-weight: 700;
                            padding: 2px 10px; border-radius: 20px;
                        ">${rc.label}</div>` : ''}

                        <div style="
                            width: 40px; height: 40px; border-radius: 10px;
                            background: ${RARITY_ICON_BG[buff.rarity]};
                            display: flex; align-items: center; justify-content: center;
                            flex-shrink: 0;
                            margin-top: ${isTop ? '6px' : '0'};
                        ">
                            <i class="fa-solid ${RARITY_ICON[buff.rarity]}"
                               style="font-size: 18px; color: ${RARITY_ICON_COLOR[buff.rarity]};"></i>
                        </div>

                        <div style="flex: 1; margin-top: ${isTop ? '6px' : '0'};">
                            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 5px; flex-wrap: wrap;">
                                ${!isTop ? `<span style="
                                    font-size: 10px; font-weight: 700; padding: 2px 8px;
                                    background: ${rc.bg}; color: ${rc.color};
                                    border-radius: 20px;
                                ">${rc.label}</span>` : ''}
                                <span style="font-size: 15px; font-weight: 500; color: var(--color-text-primary);">${buff.name}</span>
                            </div>
                            <p style="font-size: 13px; color: var(--color-text-secondary); margin: 0; line-height: 1.5;">${buff.desc}</p>
                        </div>

                        <i class="fa-solid fa-chevron-right" style="
                            font-size: 14px;
                            color: var(--color-text-secondary);
                            margin-top: ${isTop ? '16px' : '10px'};
                            flex-shrink: 0;
                        "></i>
                    </div>`;
                }).join('')}
            </div>
        </div>`;
},

_applyChallengeBuff(idx) {
    const buff = state._pendingBuffs?.[idx];
    if (!buff) return;

    buff.apply();
    state.challengeBuffsGot = (state.challengeBuffsGot || 0) + 1;
    state._pendingBuffs = null;

    const RARITY_COLOR = {
        legend: { bg:'#FAC775', color:'#412402', label:'伝説' },
        high:   { bg:'#B5D4F4', color:'#042C53', label:'上級' },
        normal: { bg:'#EAF3DE', color:'#173404', label:'通常' },
        nerf:   { bg:'#FCEBEB', color:'#501313', label:'弱体' },
    };
    const rc = RARITY_COLOR[buff.rarity];
    uiManager.showToast('✨', `${rc.label}：${buff.name}`);

    // 重啟計時器
    // 重啟計時器（先清掉舊的）
    clearInterval(state.challengeTimerInterval);
    state.challengeTimerInterval = setInterval(() => {
        state.challengeTotalTime--;
        const timeEl = document.getElementById('challenge-total-time');
        if (timeEl) {
            timeEl.textContent = state.challengeTotalTime;
            if (state.challengeTotalTime <= 10) timeEl.style.color = '#E24B4A';
        }
        if (state.challengeTotalTime <= 0) {
            clearInterval(state.challengeTimerInterval);
            this.finalizeChallenge(state.challengeSessionResults);
        }
    }, 1000);

    state.currentChallengeItem = null;
    this.navigateTo('training');
},

/** 🛡️ [Private] 數據洗滌器：封殺 HTML 雜質與特殊符號 */
_sanitizeChallengeData(selected, correct, type) {
    // 通用洗滌：移除 HTML、空白與 Zero-width 字符
    const basicClean = (str) => String(str || "")
        .replace(/<[^>]*>/g, '') // 徹底封殺 Ruby 或 Span 標籤
        .replace(/[\u200B-\u200D\uFEFF]/g, '')
        .trim();

    let cleanS = basicClean(selected);
    let cleanC = basicClean(correct);

    // 針對語法題 (Usage) 的特殊加固：移除可能存在的「括號翻譯」噪音
    if (type === 'usage') {
        cleanS = cleanS.split(/[（(]/)[0].trim();
        cleanC = cleanC.split(/[（(]/)[0].trim();
    }

    return { cleanSelected: cleanS, cleanCorrect: cleanC };
},

/** 🎙️ [Private] 反饋發射器：針對感官模式調整反饋強弱 */
_emitChallengeFeedback(isSuccess, correct, mode) {
    if (isSuccess) {
        uiManager.showToast('✨', '對焦成功');
        if (navigator.vibrate) navigator.vibrate(mode === '聽' ? [15, 40] : 15);
    } else {
        // 💡 職人提醒：若為聽力題，錯誤提示應包含正確文字
        uiManager.showToast('❌', `解析坍塌！正確應為：${correct}`);
        if (navigator.vibrate) navigator.vibrate(60);
    }
},

_triggerNextChallenge(mode) {


    // 🛡️ 有特殊事件進行中，不執行
    if (state.challengeEventLock) return;

    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;
    state.currentChallengeItem = null;

    if (mode === '聽') {
        if (typeof this.stopAllSpeech === 'function') {
            this.stopAllSpeech();
            window.JP_AUDIO_STOP_SIGNAL = false;
            window.EN_AUDIO_STOP_SIGNAL = false;
        }
    }

    const residualUI = document.querySelectorAll('#global-ui-toast, .ui-toast, [id^="mini-confirm"]');
    residualUI.forEach(el => el.remove());

    setTimeout(() => {
        // 🛡️ 結算中就不要再繼續了
        if (state.challengeFinalizing || !state.challengeActive) return;

        state.challengeActive = true;
        this.navigateTo('training');

        // 🛡️ 二次點火保險：加上雙重防護
        setTimeout(() => {
            // 結算中或已離開挑戰模式就不觸發
            if (state.challengeFinalizing || !state.challengeActive) return;
            
            const cardFound = !!document.querySelector('.challenge-card');
            if (!cardFound) {
                state.currentChallengeItem = null;
                this.navigateTo('training');
            }
        }, 400);
    }, 1100);
},

finalizeChallenge(results = []) {



    if (state.challengeFinalizing) return;

// 🎮 恢復頂部 UI
document.querySelector('header')?.style.removeProperty('display');
document.querySelectorAll('.sticky, .training-header, #level-tabs-track').forEach(el => 
    el.style.removeProperty('display')
);
document.getElementById('content-container').style.paddingBottom = '';


    state.challengeFinalizing = true;

    clearInterval(state.challengeTimerInterval);
    state.challengeTimerInterval = null;
    clearInterval(state.challengeAnsTimerInterval);
    state.challengeAnsTimerInterval = null;

    // 🛡️ 先把 challengeActive 關掉，阻斷所有還在 setTimeout 裡的 navigateTo
    state.challengeActive = false;

    if (!results || results.length === 0) {
        state.challengeFinalizing = false;
        this.navigateTo('training');
        return;
    }

    const total = results.length;
    const successCount = results.filter(r => r.success).length;
    const audioTasks = results.filter(r => r.type === 'listening');
    const visualTasks = results.filter(r => r.type !== 'listening');

    const record = {
        id: `CHAL_${Date.now()}`,
        timestamp: Date.now(),
        level: state.trainingContext?.level || 'All',
        accuracy: Math.round((successCount / total) * 100),
        sessionCorrect: successCount,
        sessionTotal: total,
        maxStreak: state.challengeMaxStreak || 0,
        buffsGot: state.challengeBuffsGot || 0,
        audioStats: {
            correct: audioTasks.filter(r => r.success).length,
            total: audioTasks.length
        },
        visualStats: {
            correct: visualTasks.filter(r => r.success).length,
            total: visualTasks.length
        }
    };

    try {
        let history = JSON.parse(localStorage.getItem('tf_challenge_history') || '[]');
        history.unshift(record);
        localStorage.setItem('tf_challenge_history', JSON.stringify(history.slice(0, 50)));
    } catch (e) { console.warn("⚠️ [Storage-Bus] 歷史軌道受阻", e); }

    state.currentChallengeItem = null;
    state.challengeSessionResults = [];
    state.challengeStreak = 0;
    state.challengeMaxStreak = 0;
    state.challengeBuffsGot = 0;
    state.challengeShield = 0;
    state.challengeLives = 3;
    state.challengeTempBoost = null;
    state.challengeChainActive = false;
    state.challengeChainCount = 0;
    state.challengeFreezing = false;

    // 🛡️ challengeFinalizing 留著 true 直到報表渲染完才放開
    if (window.translationView?.renderChallengeReport) {
        window.translationView.renderChallengeReport(record);
        // 報表渲染完後才解鎖，防止這段期間被重複呼叫
        setTimeout(() => { state.challengeFinalizing = false; }, 1000);
    } else {
        state.challengeFinalizing = false;
        this.navigateTo('training');
    }
},

// ============================================================
//       靈感匯聚相關模組
// ============================================================


/** 🚀 [App-Core] 導通選取管理執行緒 (V2026.ULTRA 內嵌版) */
    openSelectionManager() {
        console.log("📡 [UI-Ignition] 啟動選取管理矩陣...");
        
        // 1. 從 viewEngine 提領 HTML 燃料 (確保視圖引擎已導通)
        const content = viewEngine._renderSelectionManagerContent();
        const actions = viewEngine._renderSelectionManagerActions();
        
        // 2. 透過模態框發動機噴發介面
        // 💡 職人提醒：在物件內部，this 會自動指向 App 實體，確保 modalCreate 成功點火
        this.modalCreate('selection-manager-modal', '🧹 已選靈感管理', content, actions);
        
        if (navigator.vibrate) navigator.vibrate(10);
    },

/** 🧬 [Private] 執行 AI 燃料降維與節點焊接 */
_refineAiFuelToNodes(nodesArray, mode) {
    const now = Date.now();
    
    if (mode === 'suite') {
        const first = nodesArray[0] || {};
        return [{
            id: `node_${now}`,
            time: first.time || "12:00",
            location: `【精煉套裝】${first.task?.replace(/【.*?】/g, '') || '複合行程'}`,
            style: 'json',
            memo: JSON.stringify(nodesArray), 
            cost: expenseManager.parseFuelCost(JSON.stringify(nodesArray)),
            updatedAt: now
        }];
    }

    return nodesArray.map(node => ({
        ...node,
        id: `node_${now}_${Math.random().toString(36).substr(2, 4)}`,
        style: 'json',
        location: node.task || node.location || "精煉節點",
        memo: JSON.stringify([node]), 
        cost: expenseManager.parseFuelCost(JSON.stringify(node)),
        updatedAt: now
    }));
},


// ============================================================
// 6. [Accommodation] 住宿宿點配置
// 負責：多飯店分配、地址電話燃料化
// ============================================================


    /** 🏨 啟動多旅館分配模態框 */
    promptAddHotel(tripId) {
        const trip = state.trips.find(t => t.id === tripId);
        if (!trip) return;

        const content = `
            <div class="space-y-4 text-left">
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase">旅館名稱</label>
                    <input type="text" id="hotel-name" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm" placeholder="輸入飯店名稱">
                </div>
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase mb-2 block">分配天數 (可複選)</label>
                    <div class="flex flex-wrap gap-2">
                        ${trip.days.map((d, i) => `
                            <label class="cursor-pointer">
                                <input type="checkbox" name="hotel-days" value="${i+1}" class="hidden peer">
                                <div class="px-4 py-2 bg-slate-100 rounded-xl font-black text-xs peer-checked:theme-bg peer-checked:text-white transition-all">D${i+1}</div>
                            </label>
                        `).join('')}
                    </div>
                </div>
            </div>`;

        const actions = `
            <button onclick="App.modalRemove('add-hotel-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消</button>
            <button onclick="App.saveHotelData('${tripId}')" class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg">確認配置</button>`;

        this.modalCreate('add-hotel-modal', '🏨 旅館宿點配置', content, actions);
    },

    /** 🏨 固化旅館數據：新增去重與更新邏輯 */
    async saveHotelData(tripId, hotelId = null) {
        const tripIndex = state.trips.findIndex(t => t.id === tripId);
        if (tripIndex === -1) return;

        const name = document.getElementById('hotel-name').value.trim();
        const selectedDays = Array.from(document.querySelectorAll('input[name="hotel-days"]:checked'))
                                  .map(el => parseInt(el.value))
                                  .sort((a, b) => a - b); // 排序確保 D1,2,3 順序正確

        if (!name || selectedDays.length === 0) return uiManager.showToast("請填寫完整資訊");

        if (!state.trips[tripIndex].hotels) state.trips[tripIndex].hotels = [];

        // 🚀 關鍵：判斷是「更新舊有」還是「新增」
        if (hotelId) {
            const hIndex = state.trips[tripIndex].hotels.findIndex(h => h.id === hotelId);
            if (hIndex !== -1) {
                state.trips[tripIndex].hotels[hIndex] = { id: hotelId, name, days: selectedDays };
            }
        } else {
            // 新增模式
            state.trips[tripIndex].hotels.push({
                id: `H_${Date.now()}`,
                name,
                days: selectedDays
            });
        }

        // 固化並重刷
        await dbManager.save(state.trips[tripIndex]);
        this.modalRemove('add-hotel-modal');
        this.navigateTo('detail', tripId);
        uiManager.showToast("🏨 住宿配置已同步");
    },



/** 🏨 住宿模組：旅館多重配置彈窗 (V2026.ULTRA 佈局加固版) */
renderHotelModal(trip) {
    if (!trip) return;

    const content = `
        <div class="space-y-6 text-left max-h-[65vh] overflow-y-auto no-scrollbar p-1" id="hotel-modal-body">
            <div id="hotel-input-list" class="space-y-6">
                ${trip.hotels && trip.hotels.length > 0 
                    ? trip.hotels.map((h, i) => this.generateHotelInputRow(i, trip, h)).join('')
                    : this.generateHotelInputRow(0, trip)
                }
            </div>
            <button onclick="App.addHotelInputRow()" class="w-full py-4 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-[10px] font-black text-slate-400 hover:text-pink-500 transition-all active:scale-95">
                + 新增另一間旅館配置
            </button>
        </div>`;

    // 🚀 核心修正：加入 Flex 容器包裹按鈕，並校準物理間距與權重
    const actions = `
        <div class="flex items-center gap-3 w-full px-1">
            <button onclick="App.modalRemove('hotel-modal')" 
                    class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">
                取消
            </button>
            <button onclick="App.saveMultiHotelData('${trip.id}')" 
                    class="flex-[1.8] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all tracking-widest">
                確認配置
            </button>
        </div>`;

    this.modalCreate('hotel-modal', '🏨 旅館宿點多重配置', content, actions);
},


    /** 🔧 支援編輯現有旅館 */
    promptEditHotel(tripId, hotelId) {
        const trip = state.trips.find(t => t.id === tripId);
        const hotel = trip?.hotels.find(h => h.id === hotelId);
        if (!hotel) return;

        // 呼叫原本的 promptAddHotel 邏輯，但傳入 hotelId 並預勾選 days
        this.renderHotelModal(trip, hotel); 
    },


/** 🏗️ 生成單列旅館輸入組件 (V2026.ULTRA 長地址空間穩壓版) */
generateHotelInputRow(index, trip, data = null) {
    const colorClass = this.hotelPalette[index % 5];
    return `
        <div class="hotel-row p-6 rounded-[2.5rem] border-2 ${colorClass} transition-all space-y-5 shadow-sm" data-index="${index}">
            <div class="flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <label class="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">旅館名稱 ${index + 1}</label>
                    <div class="w-2 h-2 rounded-full ${colorClass.split(' ')[0].replace('bg-', 'bg-')}"></div>
                </div>
                ${index > 0 ? `<button onclick="this.closest('.hotel-row').remove()" class="text-slate-300 hover:text-red-400 p-2 transition-colors">✕</button>` : ''}
            </div>
            
            <div class="space-y-4"> 
                <input type="text" class="hotel-name-input w-full bg-white border-none rounded-2xl p-4 font-black text-[15px] text-slate-800 focus:ring-2 focus:ring-pink-200 shadow-inner" 
                       placeholder="輸入飯店名稱" value="${data?.name || ''}">
                
                <!-- 🚀 核心加固：使用 flex 容器與彈性高度，徹底封殺重疊 -->
                <div class="relative w-full flex flex-col">
                    <span class="absolute left-4 top-4 text-[12px] group-focus-within:animate-bounce z-20">📍</span>
                    <textarea 
                        class="hotel-address-input w-full bg-white/70 border-none rounded-2xl py-4 pl-11 pr-4 text-xs font-bold text-slate-700 
                               ring-1 ring-slate-100 focus:ring-2 focus:ring-pink-200 transition-all leading-[1.6] resize-none custom-scrollbar shadow-sm" 
                        placeholder="飯店地址"
                        rows="2"
                        onfocus="this.style.height = 'auto'; this.style.height = (this.scrollHeight + 2) + 'px';"
                        oninput="this.style.height = 'auto'; this.style.height = (this.scrollHeight + 2) + 'px';"
                        style="min-height: 64px; height: auto; overflow: hidden;"
                    >${data?.address || ''}</textarea>
                </div>

                <div class="relative">
                    <input type="tel" class="hotel-phone-input w-full bg-white/70 border-none rounded-2xl p-4 pl-11 text-xs font-bold text-slate-600 focus:ring-2 focus:ring-pink-100 transition-all shadow-sm" 
                           placeholder="聯絡電話" value="${data?.phone || ''}">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[12px]">📞</span>
                </div>
            </div>
            
            <div class="space-y-2">
                <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest px-1">分配入住天數</p>
                <div class="flex flex-wrap gap-2">
                    ${trip.days.map((d, i) => {
                        const dayNum = i + 1;
                        const isChecked = data?.days?.includes(dayNum);
                        return `
                            <label class="cursor-pointer group">
                                <input type="checkbox" name="hotel-days-${index}" value="${dayNum}" ${isChecked ? 'checked' : ''} class="hidden peer">
                                <div class="px-4 py-2 bg-white rounded-xl font-black text-[10px] text-slate-400 border border-transparent peer-checked:bg-slate-800 peer-checked:text-white group-hover:border-slate-200 transition-all">
                                    D${dayNum}
                                </div>
                            </label>
                        `;
                    }).join('')}
                </div>
            </div>
        </div>`;
},


/** ➕ 動態增加旅館輸入列 */
    addHotelInputRow() {
        const trip = state.trips.find(t => t.id === state.activeTripId);
        const container = document.getElementById('hotel-input-list');
        const nextIndex = container.querySelectorAll('.hotel-row').length;
        
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = this.generateHotelInputRow(nextIndex, trip);
        container.appendChild(tempDiv.firstElementChild);
        
        // 自動捲動到底部
        document.getElementById('hotel-modal-body').scrollTo({ top: 9999, behavior: 'smooth' });
    },

/** 💾 數據固化：採集所有輸入框 (含地址、電話) 並存入 DB */
async saveMultiHotelData(tripId) {
    const tripIndex = state.trips.findIndex(t => t.id === tripId);
    if (tripIndex === -1) return;

    const rows = document.querySelectorAll('.hotel-row');
    const updatedHotels = [];

    rows.forEach((row, i) => {
        // 1. 採集名稱
        const name = row.querySelector('.hotel-name-input').value.trim();
        
        // 🆕 2. 採集新增的實體資訊
        const address = row.querySelector('.hotel-address-input').value.trim();
        const phone = row.querySelector('.hotel-phone-input').value.trim();

        // 3. 採集天數分配 (維持原有的 dataset 索引邏輯)
        const days = Array.from(row.querySelectorAll(`input[name="hotel-days-${row.dataset.index}"]:checked`))
                          .map(el => parseInt(el.value));
        
        // 🚀 數據封裝
        if (name && days.length > 0) {
            updatedHotels.push({
                id: `H_${Date.now()}_${i}`,
                name,
                address, // 寫入燃料包
                phone,   // 寫入燃料包
                days,
                colorIndex: i % 5
            });
        }
    });

    // 更新記憶體狀態與 DB
    state.trips[tripIndex].hotels = updatedHotels;
    await dbManager.save(state.trips[tripIndex]);
    
    // 視圖同步
    this.modalRemove('hotel-modal');
    this.navigateTo('detail', tripId);
    uiManager.showToast("🏨 住宿與聯絡資訊已同步");
},



/** 🚀 ID 對焦中繼站 */
    promptEditHotelByTripId(tripId) {
        // 直接從 state 檢索，不依賴 HTML 傳遞複雜物件
        const trip = state.trips.find(t => t.id === tripId);
        if (trip) {
            this.renderHotelModal(trip);
        } else {
            console.error("❌ [Route-Error] 找不到 ID:", tripId);
        }
    }, // <-- 這裡必須是逗號，用來分隔下一個成員



// ============================================================
// 7. [Checklist] 裝備清單與同步
// 負責：標籤管理、數據分享、狀態記憶
// ============================================================


// 1. 🚀 分類切換：對位 ID 並執行精確置中
filterChecklist(category) {
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    if (!activeTrip) return;
    
    // 渲染視圖 (viewEngine 已重構為動態標籤版)
    viewEngine.renderChecklist(document.getElementById('content-container'), activeTrip.checklist, category);

    // 物理對焦：確保 DOM 渲染後執行
    requestAnimationFrame(() => {
        // 🚀 修正：使用 ID 選擇器精確定位，避免遍歷所有 tab
        const targetTab = document.getElementById(`tab-${category}`);
        if (targetTab) {
            targetTab.scrollIntoView({ 
                behavior: 'smooth', 
                block: 'nearest', 
                inline: 'center' 
            });
        }
    });
},



/** ⚙️ 開啟標籤管理模態框 (V2026.ULTRA 捲動導通版) */
promptEditChecklistCategories() {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return;

    // 🚀 數據回溯：讀取自訂標籤或初始化預設職人組
    const categories = trip.checklistConfig?.categories || ['證件', '財務', '交通', '電器', '通訊', '個人'];

    const content = `
        <div class="space-y-4 text-left">
            <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">管理分類標籤</p>
            
            <div id="category-edit-list" class="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar py-1">
                ${categories.map((cat, i) => `
                    <div class="flex items-center gap-2 group animate-fade-in">
                        <input type="text" value="${cat}" 
                               class="cat-input flex-grow bg-slate-50 border-none rounded-xl p-3 font-bold text-xs focus:ring-2 focus:ring-pink-100 transition-all">
                        <button onclick="this.parentElement.remove()" 
                                class="text-slate-300 hover:text-red-400 p-2 transition-colors active:scale-90">✕</button>
                    </div>
                `).join('')}
            </div>

            <button onclick="App.addCategoryRow()" 
                    class="w-full py-4 border-2 border-dashed border-slate-100 rounded-[1.5rem] text-[10px] font-black text-slate-300 hover:text-pink-400 hover:border-pink-100 transition-all flex items-center justify-center gap-2">
                <span>+</span> 新增自訂分類
            </button>
        </div>`;

    const actions = `
        <button onclick="App.modalRemove('cat-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消</button>
        <button onclick="App.saveChecklistCategories()" class="flex-[2] theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-200 active:scale-95 transition-all">儲存標籤配置</button>
    `;

    // 🚀 建立物理實體
    modalEngine.create('cat-modal', '⚙️ 自訂標籤管理', content, actions);
},



/** ➕ 中繼標籤增生：動態添加並自動對焦 */
addCategoryRow() {
    const container = document.getElementById('category-edit-list');
    if (!container) return;

    const div = document.createElement('div');
    // 🚀 採用 mb-2 確保垂直路網間距一致
    div.className = "flex items-center gap-2 animate-fade-in mb-2"; 
    
    div.innerHTML = `
        <input type="text" value="" placeholder="新標籤名稱" 
               class="cat-input flex-grow bg-slate-50 border-none rounded-xl p-3 font-bold text-xs focus:ring-2 focus:ring-pink-100 transition-all">
        <button onclick="this.parentElement.remove()" 
                class="text-slate-300 hover:text-red-400 p-2 transition-colors active:scale-90">✕</button>
    `;

    // 1. 執行掛載
    container.appendChild(div);

    // 2. 🚀 物理導通：自動捲動到底部，確保新標籤可見
    container.scrollTo({ 
        top: container.scrollHeight, 
        behavior: 'smooth' 
    });

    // 3. 焦點對齊：主動將光標移入新建立的輸入框
    div.querySelector('input').focus();
},



/** 🚀 數據固化：標籤配置全域焊接 (V2026.ULTRA 物理指紋版) */
async saveChecklistCategories() {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return uiManager.showToast('⚠️', "找不到行程燃料");

    // 1. 數據採集與洗滌
    const inputs = document.querySelectorAll('.cat-input');
    const newCategories = Array.from(inputs)
        .map(i => i.value.trim())
        .filter(v => v !== "");

    // 2. 邊際防禦
    if (newCategories.length === 0) {
        return uiManager.showToast('⚠️', "至少需保留一個分類標籤");
    }

    // 3. 燃料焊接：更新配置軌道
    if (!trip.checklistConfig) trip.checklistConfig = {};
    trip.checklistConfig.categories = newCategories;

    // 🚀 4. 物理指紋鎖定：確保同步系統感應到配置異動
    const nowTs = Date.now();
    state.lastLocalEdit = nowTs;
    localStorage.setItem('tf_last_local_edit', nowTs);

    try {
        // 5. 物理固化：使用 dbManager 接口
        // 💡 職人診斷：此處使用 save(trip) 即可，它是 put(STORES.TRIPS) 的代理
        await dbManager.save(trip);

        // 6. 視圖同步與回收
        modalEngine.remove('cat-modal');
        
        // 🚀 關鍵：導通 navigateTo，讓 renderChecklist 重新對位新配置的 Tabs
        this.navigateTo('checklist'); 
        
        // 7. 視覺與 Haptic 反饋
        uiManager.showToast('🎨', "裝備標籤系統對焦完畢");
        if (navigator.vibrate) navigator.vibrate(10);
        
        console.log(`📡 [Checklist-Config] 標籤燃料包已固化 | 指紋: ${nowTs}`);
    } catch (err) {
        console.error("❌ [Config-Save-Fail]:", err);
        uiManager.showToast('⚠️', "配置固化失敗");
    }
},


// 2. 🚀 新增/編輯清單項目 (呼叫 modalEngine)
addNewChecklistItem(itemIndex = null) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const isEdit = itemIndex !== null;
    const item = isEdit ? trip.checklist[itemIndex] : { task: '', category: '證件', tagColor: '#fb923c' };

    const content = `
        <div class="space-y-4 text-left">
            <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">物品名稱</label>
                <input type="text" id="edit-item-task" value="${item.task}" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm focus:ring-2 focus:ring-pink-200">
            </div>
            <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">分類標籤</label>
                <select id="edit-item-category" class="w-full bg-slate-50 border-none rounded-2xl p-4 font-bold text-sm outline-none">
                    ${['證件', '財務', '交通', '電器', '通訊', '個人'].map(c => 
                        `<option value="${c}" ${item.category === c ? 'selected' : ''}>${c}</option>`
                    ).join('')}
                </select>
            </div>
        </div>`;

    const actions = `
        <button onclick="App.modalRemove('item-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消</button>
        <button onclick="App.saveChecklistItem(${itemIndex})" class="flex-[2] theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-200">確認儲存</button>
    `;

    modalEngine.create('item-modal', isEdit ? '⚙️ 編輯裝備零件' : '🎒 新增裝備零件', content, actions);
},



// 3. 🚀 數據固化：儲存項目
async saveChecklistItem(itemIndex) {
    const task = document.getElementById('edit-item-task').value.trim();
    const category = document.getElementById('edit-item-category').value;
    if (!task) return uiManager.showToast("請輸入名稱");

    const trip = state.trips.find(t => t.id === state.activeTripId);
    
    // 顏色映射協定
    const colorMap = { '證件': '#fb923c', '財務': '#2dd4bf', '交通': '#f87171', '電器': '#fbbf24', '通訊': '#ff69b4', '個人': '#4ade80' };
    
    const newItem = {
        id: `c${Date.now()}`,
        category,
        task,
        text: task,
        done: itemIndex !== null ? trip.checklist[itemIndex].done : false,
        tagColor: colorMap[category] || '#slate-400'
    };

    if (itemIndex !== null) {
        trip.checklist[itemIndex] = newItem;
    } else {
        trip.checklist.push(newItem);
    }

    await dbManager.save(trip);
    this.modalRemove('item-modal');
    this.navigateTo('checklist');
},




/** 🚀 勾選邏輯：狀態記憶與分類狀態鎖定 (V2026.ULTRA 合併版) */
async toggleCheckItem(itemId) {
    // 1. 數據提取
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip || !trip.checklist) return;

    const item = trip.checklist.find(i => i.id === itemId);
    
    if (item) {
        // 2. 狀態反轉
        item.done = !item.done;

        try {
            // 3. 物理固化：寫入磁區
            await dbManager.save(trip);

            // 🚀 4. 關鍵對焦：獲取目前視覺上的分類標記
            // 從副標題 (e.g., "證件 SECTOR") 提取分類名稱，確保重刷時「視野不位移」
            const currentCatEl = document.querySelector('.theme-text-pink');
            const currentCat = currentCatEl ? currentCatEl.textContent.split(' ')[0] : '全部';

            // 5. 執行局部重刷而非全頁導播
            this.filterChecklist(currentCat);
            
            console.log(`📡 [Checklist-Toggle] Item: ${item.task} | State: ${item.done} | View: ${currentCat}`);
        } catch (err) {
            console.error("❌ [Toggle-Save-Fail]:", err);
            uiManager.showToast("狀態同步失敗");
        }
    }
},



/** 🚀 分享功能：物理導出 JSON 燃料 */
shareChecklist() {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip || !trip.checklist) return;
    
    const jsonStr = JSON.stringify(trip.checklist);
    navigator.clipboard.writeText(jsonStr).then(() => {
        uiManager.showToast("✅ 清單數據已複製至剪貼簿");
    });
},

/** 🚀 匯入功能：數據燃料注入 */
async importChecklist() {
    const input = prompt("請貼上攜帶清單 JSON 燃料：");
    if (!input) return;
    
    try {
        const data = JSON.parse(input);
        const trip = state.trips.find(t => t.id === state.activeTripId);
        trip.checklist = data;
        
        await dbManager.save(trip);
        this.navigateTo('checklist'); // 重刷頁面
        this.showMessage("🚀 數據對焦成功，清單已更新");
    } catch (err) {
        this.showMessage("❌ 燃料解析失敗，請檢查格式");
    }
},


// 3. 模態框調配：開啟匯入視窗
openImportModal() {
    const content = `
        <div class="space-y-2">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">JSON 數據燃料</label>
            <textarea id="import-json-area" 
                class="w-full h-48 bg-slate-50 border-none rounded-2xl p-4 text-[10px] font-mono focus:ring-2 focus:ring-pink-200 custom-scrollbar" 
                placeholder='請貼上 [{ "task": "..." }] 格式數據'></textarea>
            <p class="text-[9px] text-slate-400 italic px-1">⚠️ 匯入將覆蓋此行程目前的清單數據。</p>
        </div>
    `;

    const actions = `
        <button onclick="App.modalRemove('import-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消</button>
        <button onclick="App.confirmImport()" class="flex-[2] theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">執行焊接</button>
    `;

    // 透過 modalEngine 建立實體
    modalEngine.create('import-modal', '📦 數據燃料匯入', content, actions);
},



// 4. 數據焊接：執行匯入 JSON (V2026.ULTRA 物理對焦版)
async confirmImport() {
    const jsonArea = document.getElementById('import-json-area');
    if (!jsonArea || !jsonArea.value) return;

    try {
        // 🚀 1. 物理洗滌：移除不可見字元並解析
        const sanitized = jsonArea.value.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        const data = JSON.parse(sanitized);
        
        const trip = state.trips.find(t => t.id === state.activeTripId);
        if (!trip) return uiManager.showToast('⚠️', "找不到目標行程");

        // 🚀 2. 數據焊接
        trip.checklist = data;
        
        // 🚀 3. 物理指紋鎖定：確保同步機制識別此大宗異動
        const nowTs = Date.now();
        state.lastLocalEdit = nowTs;
        localStorage.setItem('tf_last_local_edit', nowTs);

        // 4. 磁區固化
        await dbManager.save(trip);
        
        // 5. 介面回收與重連
        this.modalRemove('import-modal');
        this.navigateTo('checklist'); 
        
        // 6. 視覺與 Haptic 反饋
        uiManager.showToast('🚀', "清單數據對焦成功並更新指紋");
        if (navigator.vibrate) navigator.vibrate(15);
        
        console.log(`📦 [Checklist-Import] Data welded successfully. Fingerprint: ${nowTs}`);

    } catch (e) {
        console.error("❌ [Import-Fatal]:", e);
        uiManager.showToast('⚠️', "JSON 格式異常，焊接中斷");
    }
},


syncShoppingAiPrompt(query) {
    const btnContainer = document.getElementById('shopping-ai-btn');
    if (!btnContainer) return;
    
    // 💡 邏輯對焦：從發動機提取合成好的指令
    const prompt = expenseManager.getShoppingAiPrompt(query);
    btnContainer.innerHTML = viewEngine.renderAICopyBtn(prompt);
},

// ============================================================
// 備援機制
// ============================================================

/** 🔄 數據同步中繼站：全磁區對位版 (V2026.ULTRA.FINAL_MIRROR) */
async triggerFirebaseSync() {
    if (!state.userId || state.userId === 'guest_sector' || !state.userProfile) {
        uiManager.showToast('🔒', '請先完成 Google 登入以執行同步');
        this.navigateTo('backup');
        return;
    }
    console.log("🔥 [App] 啟動全境磁區掃描與快照封裝...");
    uiManager.showToast('🚀', '正在採樣全量燃料...');
    try {
        const [transVault, backlogItems, srsItems] = await Promise.all([
            dbManager.getAll(dbManager.STORES.TRANS_VAULT),
            dbManager.getAll(dbManager.STORES.BACKLOG),
            dbManager.getAll(dbManager.STORES.SRS_META)
        ]);
        const fullDataPayload = {
            trips: state.trips,
            backlogs: backlogItems,
            translations: transVault,
            srs: srsItems, // 🚀 [新增] 特訓小卡一起打包
            config: {
                theme: localStorage.getItem('tf_theme_key'),
                voice: localStorage.getItem('tf_voice_id')
            }
        };
        const statsSnapshot = {
            tripCount:        state.trips.length,
            translationCount: transVault.length,
            realtimeCount:    transVault.filter(i => i.type === 'article_package' || (!i.type && i.segments)).length,
            contextualCount:  transVault.filter(i => i.type === 'contextual').length,
            srsCount:         srsItems?.length || 0,
            backlogCount:     backlogItems.length,
            emergencyCount:   state.trips.reduce((acc, t) => acc + (t.emergencyVault?.length || 0), 0),
            shoppingCount:    state.trips.reduce((acc, t) => acc + (t.shopping?.length || 0), 0),
            checklistCount:   state.trips.reduce((acc, t) => acc + (t.checklist?.length || 0), 0),
            updatedAt:        Date.now()
        };
        const result = await syncEngine.pushToFirebase(state.userId, fullDataPayload, statsSnapshot);
        if (result.status === 'SUCCESS') {
            console.log("✅ [App] Firebase 全境封裝成功 | 履歷已固化");
            const lastSyncTs = statsSnapshot.updatedAt;
            state.lastLocalEdit = lastSyncTs;
            state.cloudStats = statsSnapshot;
            localStorage.setItem('tf_last_local_edit', lastSyncTs);
            localStorage.setItem('tf_cloud_snapshot', JSON.stringify(statsSnapshot));
            uiManager.showToast('✅', '資料已成功備份至雲端');
            this.navigateTo('backup');
        } else {
            uiManager.showToast('❌', `同步失敗：${result.message}`);
        }
    } catch (err) {
        console.error("❌ [App] Firebase 封裝失敗:", err);
        uiManager.showToast('💥', '系統異常，請檢查網路連線');
    }
},

/** 🛡️ [Restore-Guard] 還原二次確認控制器 */
_showRestoreConfirm() {
    const zone = document.getElementById('restore-confirm-zone');
    if (zone) zone.classList.remove('hidden');
},

_hideRestoreConfirm() {
    const zone = document.getElementById('restore-confirm-zone');
    if (zone) zone.classList.add('hidden');
},

async triggerDriveBackup() {
    console.log("📁 [App] 啟動 Drive 物理封存...");
    try {
        // 🚀 調用專屬發動機
        await syncEngine.backupToDrive(state.trips);
        console.log("✅ [App] Drive 備份導通");
    } catch (err) {
        console.error("❌ [App] Drive 物理封存中斷:", err);
    }
},


/** 🔄 [App] 雲端真值回流對焦 (V2026.ULTRA 強力熔斷版) */
async syncFromCloud(silent = false) {
    if (!state.userId || state.userId === 'guest_sector') {
        if (!silent) uiManager.showToast('🔒', '請先登入以提領雲端存檔');
        return false;
    }

    if (!navigator.onLine) {
        if (!silent) uiManager.showToast('📶', '網路連線中斷，請檢查後再試');
        return false;
    }

    if (!silent) {
        uiManager.showProgressModal('從雲端還原', '正在連線至雲端...');
    }

    try {
        if (!silent) uiManager.updateProgress(10, '正在讀取雲端資料...');

        const result = await Promise.race([
            syncEngine.fetchFromFirebase(state.userId),
            new Promise((_, reject) => setTimeout(() => reject(new Error("RPC_STREAM_BURST")), 20000))
        ]);

        if (result && result.status === 'SUCCESS') {
            const remoteData = result.data || {};
            const cloudMetadata = result.metadata || {};
            const cloudUpdatedAt = cloudMetadata.lastSync || cloudMetadata.updatedAt || Date.now();

            if (!silent) uiManager.updateProgress(35, '資料讀取完畢，清空本地磁區...');

            await dbManager.clear();
            if (!silent) uiManager.updateProgress(45, '本地磁區已清空，開始寫入...');

            if (remoteData.trips && Array.isArray(remoteData.trips)) {
                if (!silent) uiManager.updateProgress(55, '正在還原行程資料...');
                await dbManager.saveAllTrips(remoteData.trips);
            }

            const backlogItems = Array.isArray(remoteData.backlogs) ? remoteData.backlogs : [];
            const transItems = remoteData.translations || remoteData.translationVault || [];

            if (!silent) uiManager.updateProgress(70, '正在還原靈感清單與翻譯語料...');
            
            for (const item of backlogItems) {
                if (item?.id) await dbManager.put(dbManager.STORES.BACKLOG, item);
            }
            if (!silent) uiManager.updateProgress(80, '靈感清單還原完畢...');

            for (const item of transItems) {
                if (item?.id) await dbManager.put(dbManager.STORES.TRANS_VAULT, item);
            }
            
            if (!silent) uiManager.updateProgress(90, '同步系統設定...');

            if (remoteData.config) {
                const cfg = remoteData.config;
                if (cfg.theme) localStorage.setItem('tf_theme_key', cfg.theme);
                if (cfg.voice) localStorage.setItem('tf_voice_id', cfg.voice);
            }

            state.trips = Array.isArray(remoteData.trips) ? remoteData.trips : [];
            state.lastLocalEdit = cloudUpdatedAt;
            localStorage.setItem('tf_last_local_edit', state.lastLocalEdit);
            localStorage.setItem('tf_cloud_snapshot', JSON.stringify(cloudMetadata));

            if (!silent) uiManager.updateProgress(100, '還原成功，重新載入中...');

            setTimeout(() => {
                if (!silent) uiManager.hideProgressModal();
                location.reload();
            }, 1000);

            return true;
        } else {
            throw new Error(result?.message || "FETCH_ERROR");
        }

    } catch (err) {
        console.error("❌ [App-Sync-Collapse] 物理還原崩潰:", err);
        
        if (!silent) {
            uiManager.hideProgressModal();
            
            let errorIcon = '💥';
            let errorMsg = '還原失敗：' + (err.message || '未知錯誤');

            if (err.message === "RPC_STREAM_BURST" || err.message === "NETWORK_TIMEOUT") {
                errorIcon = '📶';
                errorMsg = '連線逾時，請切換網路後再試';
            } else if (err.message.includes('offline')) {
                errorIcon = '📶';
                errorMsg = '網路連線中斷，請檢查後再試';
            }
            
            uiManager.showToast(errorIcon, errorMsg);
        }
    }
    return false;
},

/** 🛰️ [Data-Lock] 數據固化中樞 (V2026.ULTRA 終極防護) 
 * 作用：加強全域指紋鎖定，確保每次寫入皆能驅動「雲端攔截器」偵測版本差
 */
async persistState(targetTrip = null) {
    // 1. 🚀 物理指紋同步：生成全域最後編輯時間戳
    const nowTs = Date.now();
    state.lastLocalEdit = nowTs;
    
    // 💡 職人修正：立即固化至快照磁區，確保備份頁面 UI 能即時反應「本地較新」
    localStorage.setItem('tf_last_local_edit', nowTs);

    try {
        if (targetTrip) {
            // 2-A. 單一對焦：更新特定行程的物理指紋
            targetTrip.updatedAt = nowTs;
            await dbManager.save(targetTrip);
            console.log(`💾 [Sector-Lock] Trip ${targetTrip.id} 指紋已固化: ${nowTs}`);
        } else {
            // 2-B. 全域對焦：執行全磁區刷新
            await dbManager.saveAllTrips(state.trips);
            console.log(`💾 [Global-Lock] 全域磁區指紋對焦完畢: ${nowTs}`);
        }
        
        // 🚀 觸發 UI 指紋診斷熱更新 (若當前在備份頁面)
        if (state.currentView === 'backup' && window.viewEngine?.renderMain) {
             // 靜默重刷不影響操作
             console.log("📡 [Sync-UI] 檢測到數據異動，自動對焦同步狀態...");
        }

        return true;
    } catch (err) {
        console.error("❌ [Persistence-Collapse] 數據鎖定失敗:", err);
        if (window.uiManager) {
            uiManager.showToast('⚠️', "數據磁區固化失敗");
        }
        return false;
    }
},


/** 🩺 數據指紋診斷發動機 (V2026.ULTRA 指紋統計版) */
checkSyncHealth() {
    // 1. 🚀 物理指紋提取
    const localTs = state.lastLocalEdit || 0;
    
    // 兼容 Firestore Timestamp 與 JS 毫秒格式
    const cloudTs = state.cloudStats?.lastSync?.seconds 
        ? state.cloudStats.lastSync.seconds * 1000 
        : (state.cloudStats?.updatedAt || 0);

    // 2. 📊 數據統計對位
    // 本地總量：直接讀取內存 state
    const localTripCount = state.trips?.length || 0;
    
    // 雲端總量：從同步時快照的 cloudStats 提取
    const cloudTripCount = state.cloudStats?.tripCount || 0;
    const cloudTransCount = state.cloudStats?.translationCount || 0;

    let status = {
        code: 'UNKNOWN',
        label: '未知',
        color: 'text-slate-400',
        icon: '⚪',
        hint: '請先執行雲端對焦'
    };

    // 3. 🚀 多維度邏輯判斷：時序與筆數雙重校準
    const isTimeSynced = Math.abs(localTs - cloudTs) < 3000; // 3秒內視為時序同步
    const isCountSynced = (localTripCount === cloudTripCount);

    if (localTs === 0 && cloudTs === 0) {
        status = { code: 'EMPTY', label: '磁區真空', color: 'text-slate-300', icon: '⚪', hint: '尚未建立任何航網數據' };
    } else if (isTimeSynced && isCountSynced) {
        status = { code: 'SYNCED', label: '已同步', color: 'text-emerald-500', icon: '✅', hint: '雲端與本地端 100% 導通' };
    } else if (localTs > cloudTs || localTripCount > cloudTripCount) {
        // 💡 職人診斷：時間較新 或 筆數較多，皆視為本地領先
        const diff = localTripCount - cloudTripCount;
        const diffMsg = diff > 0 ? `(領先 ${diff} 筆行程)` : "";
        status = { code: 'LOCAL_NEWER', label: '本地更新', color: 'theme-text-pink', icon: '🟢', hint: `建議同步至雲端 ${diffMsg}` };
    } else {
        const diff = cloudTripCount - localTripCount;
        const diffMsg = diff > 0 ? `(雲端多 ${diff} 筆)` : "";
        status = { code: 'CLOUD_NEWER', label: '雲端更新', color: 'text-blue-500', icon: '🔵', hint: `建議從雲端回流 ${diffMsg}` };
    }

    // 4. 🚀 封裝回傳數據履歷
    return { 
        localTs, 
        cloudTs, 
        status,
        stats: {
            localTripCount,
            cloudTripCount,
            cloudTransCount,
            // 💡 提供具備戰術價值的時間差
            timeDiffMins: Math.round(Math.abs(localTs - cloudTs) / 1000 / 60)
        }
    };
},


/** 🚀 [Export-Filter] 開啟數據封裝選擇器 (V2026.ULTRA 實體全索引導通版) */
async openExportFilterModal() {
    console.log("📡 [Filter-Ignition] 啟動全路網數據主權回收...");
    uiManager.showToast('📡', '正在回收數據指紋...');

    try {
        const tripId = document.getElementById('share-trip-id')?.value;
        const currentTrip = state.trips.find(t => String(t.id) === String(tripId));

        // 🚀 1. 執行基礎磁區導通 (靈感、翻譯、特訓)
        if (window.backlogManager) await window.backlogManager.loadAll();
        const allTrans = await window.dbManager.getAll('translationVault') || [];
        window.state.allTranslations = allTrans;
        window.state.contextualTrans = allTrans.filter(i => i.type === 'contextual' || (i.q && i.a && !i.edu_vocab));
        window.state.realtimeHistory = allTrans.filter(i => i.type === 'article_package' || i.edu_vocab);
        window.state.srsMetadata = await window.dbManager.getAll('srsMetadata') || [];

        // 🚀 2. 裝備零件 (Checklist) 物理回收 - ⚡ 終極修正點
        // 💡 職人診斷：穿透所有可能的 V5 物理槽位，並執行強制 ID 匹配
        const possibleStores = ['itineraryItems', 'checklistItems', 'itinerary_items'];
        let packFuel = [];
        
        for (const store of possibleStores) {
            try {
                const raw = await window.dbManager.getAll(store);
                if (raw && raw.length > 0) {
                    const matches = raw.filter(item => String(item.tripId) === String(tripId));
                    if (matches.length > 0) {
                        packFuel = matches;
                        console.log(`✅ [DB-Match] 在磁區 [${store}] 尋獲 ${matches.length} 筆零件`);
                        break;
                    }
                }
            } catch (e) { continue; }
        }

        // 🚀 3. 數據回填：若 DB 沒撈到，最後嘗試從 trip 物件的隱藏屬性萃取
        if (packFuel.length === 0 && currentTrip) {
            packFuel = currentTrip.checklistItems || currentTrip.checklist || currentTrip.items || [];
        }

        // 🚀 4. 狀態固化：強制注入全域狀態，確保 viewEngine 與洗滌器有燃料可用
        window.state.checklistItems = packFuel;
        if (currentTrip) currentTrip.checklistItems = packFuel;

        console.log(`🏁 [Sector-Report-Final] 
                    - 靈感: ${window.state.backlogs?.length || 0} 筆
                    - 特訓: ${window.state.srsMetadata.length} 筆
                    - 清單: ${packFuel.length} 筆 (物理回收 ✅)`);

        // 5. 噴發模態框 (此時 viewEngine 渲染 case 'packing' 將精確對焦)
        const content = viewEngine._renderExportFilterContent();
        const actions = `
            <button onclick="App.modalRemove('export-filter-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
            <button onclick="App.saveExportFilter()" class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">確認封裝配置</button>
        `;

        this.modalCreate('export-filter-modal', '📦 配置數據封裝內容', content, actions);
        if (navigator.vibrate) navigator.vibrate(10);
        
    } catch (err) {
        console.error("❌ [Filter-Ignition-Collapse]:", err);
        uiManager.showToast('🚨', '數據導通異常');
    }
},

/** 💾 [Export-Filter] 固化過濾設定並更新 UI 狀態 */
saveExportFilter() {
    const checks = document.querySelectorAll('.export-module-check');
    const whitelist = Array.from(checks)
        .filter(input => input.checked)
        .map(input => input.value);

    // 1. 持久化存儲白名單
    localStorage.setItem('tf_export_whitelist', JSON.stringify(whitelist));

    // 2. 視覺回饋：更新 Step 2 按鈕上的狀態文字
    const statusEl = document.getElementById('export-filter-status');
    if (statusEl) {
        const total = checks.length;
        const selected = whitelist.length;
        statusEl.innerText = (selected === total) ? '預設：全量匯出' : `已選取 ${selected} / ${total} 項`;
        
        // 💡 職人視覺：若非全選，改變標籤顏色提醒
        statusEl.className = (selected === total) 
            ? 'text-[9px] font-black theme-text-pink bg-pink-50 px-2.5 py-1 rounded-md border border-pink-100/50'
            : 'text-[9px] font-black text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-100/50';
    }

    // 3. 撤收模態框
    this.modalRemove('export-filter-modal');
    uiManager.showToast('✅', '封裝配置已更新');
    
    console.log("🧬 [Filter-Sync] 數據白名單已更新:", whitelist);
},

/** 🚀 [UX-Bridge] 切換匯出模組的 UI 狀態與子清單 */
toggleExportSubList(modId, isChecked) {
    const wrapper = document.getElementById(`wrapper-${modId}`);
    const subList = document.getElementById(`sub-list-${modId}`);
    const labelTitle = wrapper?.querySelector('span.font-black');
    const labelSub = wrapper?.querySelector('p.font-bold');
    const iconBox = wrapper?.querySelector('.transition-all');

    if (isChecked) {
        // 🚀 導通：點亮主題色
        wrapper.className = "export-module-wrapper border-2 rounded-[2rem] transition-all duration-300 overflow-hidden border-pink-200 bg-white shadow-md shadow-pink-50";
        subList.classList.remove('hidden');
        labelTitle.className = "text-[14px] font-black text-slate-800";
        labelSub.className = "text-[9px] font-bold uppercase tracking-widest theme-text-pink";
        iconBox.classList.remove('grayscale');
        iconBox.classList.add('bg-pink-50');
    } else {
        // 🚀 斷路：回歸淺灰色
        wrapper.className = "export-module-wrapper border-2 rounded-[2rem] transition-all duration-300 overflow-hidden border-slate-50 bg-slate-50/50";
        subList.classList.add('hidden');
        labelTitle.className = "text-[14px] font-black text-slate-400";
        labelSub.className = "text-[9px] font-bold uppercase tracking-widest text-slate-300";
        iconBox.classList.add('grayscale');
        iconBox.classList.remove('bg-pink-50');
    }

    if (navigator.vibrate) navigator.vibrate(5);
},


// 🤖 AI 規劃器：開啟設定模態框
openAIPlannerSettings() {
    const selectedIds = Array.from(window.backlogManager?._stagedSelection || []);
    if (selectedIds.length < 2) return uiManager.showToast('⚠️', '請至少選取 2 張靈感小卡');

    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return uiManager.showToast('⚠️', '請先開啟一個行程');

    const allBacklogs = window.backlogManager?.items || [];
    const selectedCards = selectedIds.map(id => allBacklogs.find(b => String(b.id) === String(id))).filter(Boolean);

    const content = viewEngine._renderAIPlannerSettings(selectedCards, trip);
    const actions = `
        <button onclick="App.modalRemove('ai-planner-modal')"
                class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
        <button onclick="App.executeAIPlanner()"
                class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            <i class="ti ti-copy" style="font-size:14px;"></i> 複製規劃指令
        </button>`;
    App.modalCreate('ai-planner-modal', 'AI 行程規劃設定', content, actions);

    // 預設選取飯店起訖（若有飯店）
    const hasHotel = trip.hotels?.[0];
    App._plannerState = {
        depType: hasHotel ? 'hotel' : 'ai',
        daysMode: 'full',
        selectedCards,
        trip
    };
},

// 🤖 AI 規劃器：執行複製 prompt
async executeAIPlanner() {
    const ps = App._plannerState;
    if (!ps) return;

    const cardLimit = parseInt(document.getElementById('planner-card-limit')?.value || '4');
    const pace = document.getElementById('planner-pace')?.value || '2';
    const customDep = document.getElementById('planner-dep-text')?.value?.trim() || '';

    const settings = {
        depType: ps.depType,
        customDep,
        cardLimit,
        daysMode: ps.daysMode,
        pace
    };

    const prompt = window.backlogManager._generateDayPlannerPrompt(ps.trip, ps.selectedCards, settings);
    await navigator.clipboard.writeText(prompt);
    uiManager.showToast('✨', `規劃指令已複製（${ps.selectedCards.length} 張小卡）`);

    // 切換到貼入 JSON 的畫面
    const pasteContent = `
        <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 0 0 10px; line-height: 1.6;">
            指令已複製，請貼到 AI 取得規劃結果後，將回傳的 JSON 貼入下方。
        </p>
        <textarea id="ai-planner-json" rows="8"
                  style="width: 100%; padding: 10px 12px; border-radius: var(--border-radius-md); border: 0.5px solid var(--color-border-tertiary); background: var(--color-background-secondary); font-size: 12px; font-family: monospace; resize: none; outline: none; box-sizing: border-box;"
                  placeholder='{"days": [...], "unscheduled": [...]}'>
        </textarea>`;
    const pasteActions = `
        <button onclick="App.modalRemove('ai-planner-modal')"
                class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
        <button onclick="App.parseAIPlannerResult()"
                class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">
            解析並預覽
        </button>`;

    App.modalCreate('ai-planner-modal', 'AI 行程規劃 · 貼入結果', pasteContent, pasteActions);
},

// 🤖 AI 規劃器：解析結果並顯示預覽
parseAIPlannerResult() {
    const raw = document.getElementById('ai-planner-json')?.value?.trim();
    if (!raw) return uiManager.showToast('⚠️', '請先貼入 AI 回傳的 JSON');
    try {
        const sanitized = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const result = JSON.parse(sanitized);
        const ps = App._plannerState;

        const previewContent = viewEngine._renderAIPlannerPreview(result, ps.trip, ps.selectedCards);
        const previewActions = `
            <button onclick="App.modalRemove('ai-planner-modal')"
                    class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">關閉</button>
            <button onclick="App._confirmAndSaveAIPlan()"
                    class="flex-[2] py-4 bg-slate-800 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">
                確認並儲存草稿
            </button>`;

        // 🚀 暫存 result 供確認後使用
        App._plannerState.pendingResult = result;

        App.modalCreate('ai-planner-modal', 'AI 規劃預覽', previewContent, previewActions);
    } catch (e) {
        uiManager.showToast('⚠️', 'JSON 格式錯誤，請確認後再試');
    }
},

// 🤖 AI 規劃器：確認並儲存草稿
async _confirmAndSaveAIPlan() {
    const ps = App._plannerState;
    if (!ps?.pendingResult || !ps?.trip) return;

    // 🚀 資料遷移：舊版單一草稿 → 新版陣列
    if (!Array.isArray(ps.trip.aiPlannerDrafts)) {
        ps.trip.aiPlannerDrafts = ps.trip.aiPlannerDraft
            ? [ps.trip.aiPlannerDraft]
            : [];
        delete ps.trip.aiPlannerDraft;
    }

    // 🚀 自動產生草稿標題（從 days 城市推導）
    const cities = [...new Set(ps.selectedCards.map(c => c.city).filter(Boolean))];
    const days = ps.pendingResult.days?.length || 0;
    const title = cities.length > 0
        ? `${cities.slice(0, 2).join('・')} ${days} 天`
        : `AI 草稿 ${days} 天`;

    const newDraft = {
        id: `draft_${Date.now()}`,
        createdAt: Date.now(),
        title,
        selectedCards: ps.selectedCards.map(c => ({
            id: c.id, name: c.name, category: c.category, city: c.city
        })),
        result: ps.pendingResult
    };

    ps.trip.aiPlannerDrafts.push(newDraft);

    await App.persistState(ps.trip);

    App.modalRemove('ai-planner-modal');
    uiManager.showToast('✅', `草稿「${title}」已儲存`);

    const idx = state.trips.findIndex(t => t.id === ps.trip.id);
    if (idx !== -1) state.trips[idx] = ps.trip;
},

// 🤖 AI 草稿：開啟草稿列表
openAIPlannerDraft() {
    const trip = state.trips?.find(t => t.id === state.activeTripId);
    if (!trip) return;

    // 🚀 遷移舊版單一草稿
    if (trip.aiPlannerDraft && !Array.isArray(trip.aiPlannerDrafts)) {
        const legacy = trip.aiPlannerDraft;
        if (!legacy.id) legacy.id = `draft_${legacy.createdAt || Date.now()}`;
        if (!legacy.title) {
            const cities = [...new Set((legacy.selectedCards || []).map(c => c.city).filter(Boolean))];
            const days = legacy.result?.days?.length || 0;
            legacy.title = cities.length > 0 ? `${cities.slice(0, 2).join('・')} ${days} 天` : `AI 草稿 ${days} 天`;
        }
        trip.aiPlannerDrafts = [legacy];
        delete trip.aiPlannerDraft;
        App.persistState(trip);
    }

    // 🚀 過濾掉沒有 id 或 result 的壞資料
    if (Array.isArray(trip.aiPlannerDrafts)) {
        trip.aiPlannerDrafts = trip.aiPlannerDrafts.filter(d => d.id && d.result);
        // 補上缺失的 id 或 title
        trip.aiPlannerDrafts.forEach(d => {
            if (!d.id) d.id = `draft_${d.createdAt || Date.now()}`;
            if (!d.title) {
                const cities = [...new Set((d.selectedCards || []).map(c => c.city).filter(Boolean))];
                const days = d.result?.days?.length || 0;
                d.title = cities.length > 0 ? `${cities.slice(0, 2).join('・')} ${days} 天` : `AI 草稿 ${days} 天`;
            }
        });
    }

    const drafts = trip.aiPlannerDrafts || [];

    if (drafts.length === 0) {
        return uiManager.showToast('⚠️', '尚無草稿，請先選取小卡並 AI 規劃');
    }

    const content = viewEngine._renderAIPlannerDraftList(drafts);
    const actions = `
        <button onclick="App.modalRemove('ai-draft-modal')"
                class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">
            關閉
        </button>`;

    App.modalCreate('ai-draft-modal', `草稿行程 · ${drafts.length} 份`, content, actions);
},


// 🤖 AI 草稿：開啟單一草稿預覽
openAIPlannerDraftDetail(draftId) {
    const trip = state.trips?.find(t => t.id === state.activeTripId);
    const draft = trip?.aiPlannerDrafts?.find(d => d.id === draftId);
    if (!draft) return;

    const timeStr = (() => {
        const diff = Date.now() - draft.createdAt;
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        if (mins < 1) return '剛剛';
        if (mins < 60) return `${mins} 分鐘前`;
        if (hrs < 24) return `${hrs} 小時前`;
        return `${Math.floor(hrs / 24)} 天前`;
    })();

    const content = viewEngine._renderAIPlannerPreview(draft.result, trip, draft.selectedCards, draft.id);
    const actions = `
        <button onclick="App._deleteAIPlannerDraft('${draftId}')"
                class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">
            刪除草稿
        </button>
        <button onclick="App.modalRemove('ai-draft-detail-modal')"
                class="flex-[2] py-4 bg-slate-800 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">
            關閉
        </button>`;

    App.modalCreate('ai-draft-detail-modal', `${draft.title} · ${timeStr}`, content, actions);
},

// 🤖 AI 草稿：刪除單一草稿
async _deleteAIPlannerDraft(draftId) {
    const trip = state.trips?.find(t => t.id === state.activeTripId);
    if (!trip?.aiPlannerDrafts) return;

    const draft = trip.aiPlannerDrafts.find(d => d.id === draftId);
    const title = draft?.title || '此草稿';

    trip.aiPlannerDrafts = trip.aiPlannerDrafts.filter(d => d.id !== draftId);
    await App.persistState(trip);

    App.modalRemove('ai-draft-detail-modal');
    App.modalRemove('ai-draft-modal');
    uiManager.showToast('✅', `「${title}」已刪除`);

    // 🚀 若還有其他草稿，重新開啟列表
    if (trip.aiPlannerDrafts.length > 0) {
        setTimeout(() => App.openAIPlannerDraft(), 300);
    }
},

// 🤖 AI 規劃器：狀態控制
_setPlannerDep(type) {
    App._plannerState = App._plannerState || {};
    App._plannerState.depType = type;
    document.getElementById('dep-custom-input').style.display = type === 'custom' ? 'block' : 'none';
    ['hotel', 'ai', 'custom'].forEach(t => {
        const el = document.getElementById(`dep-${t}`);
        if (!el) return;
        const radio = el.querySelector('.dep-radio');
        const isActive = t === type;
        el.style.border = isActive ? '0.5px solid #F4C0D1' : '0.5px solid var(--color-border-tertiary)';
        el.style.background = isActive ? '#FBEAF0' : 'var(--color-background-secondary)';
        if (radio) {
            radio.style.background = isActive ? '#D4537E' : 'var(--color-background-primary)';
            radio.innerHTML = isActive ? '<i class="ti ti-check" style="font-size:11px; color:white;"></i>' : '';
            radio.style.border = isActive ? 'none' : '0.5px solid var(--color-border-secondary)';
        }
    });
},

_setPlannerDays(mode) {
    App._plannerState = App._plannerState || {};
    App._plannerState.daysMode = mode;
    ['full', 'hotel', 'effective'].forEach(m => {
        const el = document.getElementById(`days-${m}`);
        if (!el) return;
        const radio = el.querySelector('.days-radio');
        const isActive = m === mode;
        el.style.border = isActive ? '0.5px solid #F4C0D1' : '0.5px solid var(--color-border-tertiary)';
        el.style.background = isActive ? '#FBEAF0' : 'var(--color-background-secondary)';
        if (radio) {
            radio.style.background = isActive ? '#D4537E' : 'var(--color-background-primary)';
            radio.innerHTML = isActive ? '<i class="ti ti-check" style="font-size:11px; color:white;"></i>' : '';
            radio.style.border = isActive ? 'none' : '0.5px solid var(--color-border-secondary)';
        }
    });
},

_updatePlannerPace(val) {
    const labels = { '1': '寬鬆', '2': '舒適', '3': '緊湊' };
    const descs = {
        '1': '每天安排 2-3 個景點，留有大量自由時間，悠閒感受當地氛圍。',
        '2': '每天安排 3-4 個景點，景點間保留足夠移動時間與用餐休息。',
        '3': '每天安排 4-5 個景點，行程緊湊充實，適合想跑景點的旅人。'
    };
    const labelEl = document.getElementById('planner-pace-label');
    const descEl = document.getElementById('planner-pace-desc');
    if (labelEl) labelEl.textContent = labels[val];
    if (descEl) descEl.textContent = descs[val];
},

/**
 * 🛰️ [Shared-Zone] 行程共享投射主控 (V2026.ULTRA 物理磁區直連版)
 */
async deployToSharedZone() {
    console.group("🚀 [Deploy-Ignition] 啟動全量數據基因封裝...");
    
    try {
        const tripId = document.getElementById('share-trip-id')?.value;
        const passcode = document.getElementById('share-passcode')?.value.trim();
        
        if (!tripId) return uiManager.showToast('⚠️', '未定位目標行程');
        if (!passcode || passcode.length < 4) return uiManager.showToast('🔑', '密鑰需 4 位數');

        const originalTrip = state.trips.find(t => String(t.id) === String(tripId));
        if (!originalTrip) return uiManager.showToast('❌', '行程燃料遺失');

        // 🚀 1. 採集白名單
        const moduleWhitelist = JSON.parse(localStorage.getItem('tf_export_whitelist')) || [
            'flights', 'hotels', 'itinerary', 'packing', 'realtime'
        ];
        
        uiManager.showToast('🚀', '執行原子洗滌與物理磁區徵調...');

        // 🚀 2. 物理磁區預檢 (封殺 RAM 真空陷阱)
        const allVaultData = await dbManager.getAll('translationVault') || [];
        
        // 🚀 [修正] 靈感小卡直接從 IndexedDB 提領，封殺記憶體狀態不同步問題
        const allBacklogs = await dbManager.getAll(dbManager.STORES.BACKLOG) || [];

        // 🚀 [相容性過渡協定] 有 tripId 的精確比對，舊資料無 tripId 的也放行
        const targetedRealtime = allVaultData.filter(i => 
            (String(i.tripId) === String(originalTrip.id) || !i.tripId) &&
            (i.type === 'article_package' || !i.type)
        );
        const targetedContext = allVaultData.filter(i => 
            (String(i.tripId) === String(originalTrip.id) || !i.tripId) &&
            i.type === 'contextual'
        );

        // 🚀 3. 構建 Payload
        const sharedPayload = {
            id: originalTrip.id,
            name: originalTrip.name,
            city: originalTrip.city,
            createdAt: originalTrip.createdAt,
            updatedAt: Date.now(),
            
            days: (moduleWhitelist.includes('itinerary')) ? (originalTrip.days || []) : [],
            transport: (moduleWhitelist.includes('flights')) ? (originalTrip.transport || []) : [],
            hotels: (moduleWhitelist.includes('hotels')) ? (originalTrip.hotels || []) : [],
            
            checklistItems: (moduleWhitelist.includes('packing')) ? 
                (window.state.checklistItems || originalTrip.checklistItems || []).map(({ tripId, timestamp, ...p }) => ({
                    ...p,
                    tripId: originalTrip.id 
                })) : [],
                
            translations: {
                lang: localStorage.getItem('tf_trans_lang') || 'JP',
                realtime: (moduleWhitelist.includes('realtime')) ? 
                    targetedRealtime.map((r, idx) => ({
                        ...r,
                        id: r.id || `RT_${Date.now()}_${idx}`,
                        tripId: originalTrip.id,
                        type: 'article_package'
                    })) : [],
                contextual: (moduleWhitelist.includes('contextual')) ? 
                    targetedContext.map((c, idx) => ({
                        ...c,
                        id: c.id || `CT_${Date.now()}_${idx}`,
                        tripId: originalTrip.id
                    })) : []
            },
            
            srs: (moduleWhitelist.includes('training')) ? 
                (window.state.srsMetadata || []).map(({ nextReview, ...s }) => s) : [],
            
            emergencyVault: (moduleWhitelist.includes('emergency')) ? (originalTrip.emergencyVault || []) : [],
            shopping: (moduleWhitelist.includes('shopping')) ? (originalTrip.shopping || []) : [],
            // 🚀 [修正] 從 IndexedDB 直接提領，不依賴記憶體狀態
            backlogs: (moduleWhitelist.includes('backlog')) ? allBacklogs : []
        };

        // 🔎 4. 終極導通判定
        const hasFuel = [
            sharedPayload.days.length,
            sharedPayload.translations.realtime.length,
            sharedPayload.translations.contextual.length,
            sharedPayload.checklistItems.length,
            sharedPayload.backlogs.length,
            sharedPayload.srs.length,
            sharedPayload.emergencyVault.length,
            sharedPayload.shopping.length
        ].some(count => count > 0);

        if (!hasFuel) return uiManager.showToast('🚨', '所選模組內無有效數據');

        // 🚀 5. 序列化負載監控
        const serializedFuel = JSON.stringify(sharedPayload);
        console.log("📦 [Payload-Ready] 封裝完畢：", {
            "目標行程": sharedPayload.name,
            "即時翻譯語料": targetedRealtime.length,
            "情境翻譯語料": targetedContext.length,
            "特訓指紋": sharedPayload.srs.length,
            "緊急清單": sharedPayload.emergencyVault.length,
            "購物清單": sharedPayload.shopping.length,
            "靈感小卡": sharedPayload.backlogs.length,
            "總負載量": `${(serializedFuel.length / 1024).toFixed(2)} KB`
        });

        // 6. 🔥 點火投射
        uiManager.showToast('📡', '正在投射至雲端...');
        const result = await syncEngine.deployToSharedZone(sharedPayload, passcode);

        if (result.status === 'SUCCESS' && result.shareId) {
            this._handleProjectionSuccess(result, originalTrip.name);
            if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
            console.log(`✅ [Shared-Success] 座標 ${result.shareId} 燃料已廣播`);
        } else {
            throw new Error(result.message || "雲端導通失敗");
        }

    } catch (err) {
        console.error("❌ [Shared-Projection-Fatal]:", err);
        uiManager.showToast('💥', '數據對焦異常：' + err.message);
    }
    console.groupEnd();
},

/** 🧪 [Core-Engine] 數據洗滌發動機 (V2026.ULTRA 核心加固版) */
async _sanitizeSharedPayload(trip, externalWhitelist = null, moduleWhitelist = null) {
    console.group("🛰️ [Sanitization-Dispatcher] 啟動模組化洗滌程序...");

    // 🚀 1. 物理參數採集：優先使用傳入的白名單，否則回退至磁區快照
    const whitelist = moduleWhitelist || JSON.parse(localStorage.getItem('tf_export_whitelist')) || [
        'flights', 'hotels', 'itinerary', 'packing', 'realtime', 
        'training', 'contextual', 'shopping', 'emergency', 'backlog'
    ];

    // 🚀 2. 子項指紋感應
    const subWhitelist = externalWhitelist || [];
    const hasSubChecks = subWhitelist.length > 0;

    console.log(`📡 [Dispatcher-Focus] 模組白名單: ${whitelist.length} | 子項指紋數: ${subWhitelist.length}`);

    // 🚀 3. 初始化 Payload：執行深度克隆
    let payload = JSON.parse(JSON.stringify(trip));

    // 🚀 4. 模組處理器對應表
    const processors = {
        'flights': '_washFlights', 'hotels': '_washHotels',
        'itinerary': '_washItinerary', 'packing': '_washPacking',
        'realtime': '_washRealtime', 'training': '_washTraining',
        'contextual': '_washContextual', 'shopping': '_washShopping',
        'emergency': '_washEmergency', 'backlog': '_washBacklog'
    };

    // 🚀 5. 執行循環洗滌
    for (const [modId, funcName] of Object.entries(processors)) {
        try {
            if (!whitelist.includes(modId)) {
                this._terminateModule(payload, modId);
                continue;
            }

            // 🚀 核心焊接 A：行程 (Itinerary) 主權保護
            // 💡 職人診斷：若勾選了模組但子項指紋為空（例如未展開選單），則強制全量導通，防止 days 為空導致接收端失效
            if (modId === 'itinerary' && !subWhitelist.some(id => id.startsWith('day-'))) {
                payload.days = trip.days; 
                console.log("✅ [Core-Force] 行程核心軌道強制導通 (全量天數)");
                continue;
            }

            // 🚀 核心焊接 B：裝備清單 (Packing) 主權保護
            if (modId === 'packing' && !subWhitelist.some(id => id.startsWith('pack-'))) {
                payload.checklistItems = window.state.checklistItems || trip.checklistItems || [];
                console.log("✅ [Core-Force] 裝備零件磁區強制導通 (物理回收件)");
                continue;
            }

            // 模式 B：執行標準子函數洗滌
            const processor = this[funcName];
            if (typeof processor === 'function') {
                console.log(`🧼 [Sector-Washing] 正在處理: ${modId}...`);
                await processor.call(this, payload, trip, subWhitelist, hasSubChecks);
            }
        } catch (err) {
            console.error(`❌ [Sector-Fatal] 模組 ${modId} 崩潰:`, err);
        }
    }

    console.log("🏁 [Sanitization-Complete] Payload 封裝完畢");
    console.groupEnd();
    
    return payload;
},

/**
 * 🏁 [Private-UI] 處理投射成功反饋
 */
_handleProjectionSuccess(result, tripName) {
    const resultArea = document.getElementById('shared-result-area');
    
    if (navigator.vibrate) navigator.vibrate([15, 30, 15]);
    uiManager.showToast('✅', '投射成功，座標已固化');

    if (resultArea) {
        resultArea.classList.remove('hidden');
        resultArea.innerHTML = `
            <div class="mt-6 p-6 bg-emerald-50 rounded-[2rem] border-2 border-emerald-100 animate-slide-up relative overflow-hidden">
                <div class="absolute -right-2 -top-2 opacity-10 text-6xl italic font-black text-emerald-600 uppercase">Link</div>
                <p class="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Projected Shared ID</p>
                <div class="flex items-center justify-between gap-4 mb-4">
                    <div class="bg-white px-6 py-4 rounded-2xl border border-emerald-200 shadow-sm flex-1">
                        <span class="text-2xl font-black text-slate-800 tracking-[0.3em] font-mono">${result.shareId}</span>
                    </div>
                    <button onclick="App.copyShareId('${result.shareId}')" 
                            class="w-14 h-14 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-lg active:scale-90 transition-all cursor-pointer">
                        <i class="fa-solid fa-copy text-xl"></i>
                    </button>
                </div>
                <p class="text-[10px] text-emerald-700 font-bold italic px-1">※ 夥伴輸入此座標與密碼即可同步您洗滌後的純淨航線。</p>
            </div>`;
        resultArea.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
    
    // 數據歸檔
    const shareHistory = JSON.parse(localStorage.getItem('tf_share_history') || '[]');
    shareHistory.unshift({ id: result.shareId, tripName, deployedAt: Date.now() });
    localStorage.setItem('tf_share_history', JSON.stringify(shareHistory.slice(0, 10)));
},


/** 📋 [Helper] 複製共享 ID 專用零件 */
copyShareId(id) {
    navigator.clipboard.writeText(id).then(() => {
        uiManager.showToast('📋', '共享座標已複製');
        if (navigator.vibrate) navigator.vibrate(5);
    });
},

/** 🧭 [Shared-Wizard] 步驟精靈控制器 */
_sharedGoStep(n) {
    [1, 2, 3].forEach(i => {
        const panel = document.getElementById(`shared-panel-${i}`);
        const dot = document.getElementById(`shared-step-dot-${i}`);
        const label = document.getElementById(`shared-step-label-${i}`);
        if (!panel || !dot || !label) return;

        // 面板顯示控制
        panel.classList.toggle('hidden', i !== n);

        // 步驟點狀態
        if (i < n) {
            // 已完成：主題色 + 勾勾
            dot.className = 'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 theme-bg text-white';
            dot.textContent = '✓';
            label.className = 'text-[9px] font-black uppercase tracking-tight transition-all duration-300 theme-text-pink';
        } else if (i === n) {
            // 目前：主題色
            dot.className = 'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 theme-bg text-white';
            dot.textContent = i;
            label.className = 'text-[9px] font-black uppercase tracking-tight transition-all duration-300 theme-text-pink';
        } else {
            // 未到：灰色
            dot.className = 'w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300 bg-slate-100 text-slate-400';
            dot.textContent = i;
            label.className = 'text-[9px] font-black uppercase tracking-tight transition-all duration-300 text-slate-400';
        }
    });
},

/** 🔍 [Import-Validator] 即時驗證匯入欄位狀態 */
_importCheckReady() {
    const idEl = document.getElementById('direct-import-id');
    const passEl = document.getElementById('direct-import-passcode');
    const btn = document.getElementById('import-fire-btn');
    const idHint = document.getElementById('import-id-hint');
    const passHint = document.getElementById('import-pass-hint');
    if (!idEl || !passEl || !btn) return;

    const idVal = idEl.value.trim();
    const passVal = passEl.value.trim();
    const idOk = idVal.length === 8;
    const passOk = passVal.length === 4;

    // 共享代碼提示
    if (idVal.length === 0) {
        idHint.textContent = '';
    } else if (idOk) {
        idHint.textContent = '✓ 格式正確';
        idHint.className = 'text-[9px] text-center h-3 transition-all theme-text-pink font-black';
    } else {
        idHint.textContent = `還差 ${8 - idVal.length} 碼`;
        idHint.className = 'text-[9px] text-center h-3 transition-all text-slate-400';
    }

    // 密鑰提示
    if (passVal.length === 0) {
        passHint.textContent = '';
    } else if (passOk) {
        passHint.textContent = '✓ 密鑰就緒';
        passHint.className = 'text-[9px] text-center h-3 transition-all theme-text-pink font-black';
    } else {
        passHint.textContent = `還差 ${4 - passVal.length} 碼`;
        passHint.className = 'text-[9px] text-center h-3 transition-all text-slate-400';
    }

    // 按鈕狀態聯動
    if (idOk && passOk) {
        btn.disabled = false;
        btn.className = 'w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all theme-bg text-white shadow-lg shadow-pink-100/50 active:scale-95 cursor-pointer';
    } else {
        btn.disabled = true;
        btn.className = 'w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all bg-slate-100 text-slate-400 cursor-not-allowed';
    }
},

/** 📥 [Shared-Zone] 導入共享行程：座標對焦與數據回流 */
async importSharedTrip() {
    // 1. 🚀 啟動輸入模態框：採集座標與密鑰
    const content = `
        <div class="space-y-5 text-left animate-fade-in">
            <div class="p-5 bg-slate-50 rounded-[2.2rem] border border-slate-100">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">1. 輸入 8 位共享座標</label>
                <input type="text" id="import-share-id" maxlength="8" placeholder="例如：A1B2C3D4" 
                       class="w-full bg-white border-none rounded-xl p-4 text-xl font-black shadow-sm outline-none text-center tracking-[0.2em] focus:ring-2 focus:ring-pink-100 transition-all font-mono uppercase">
            </div>

            <div class="p-5 bg-slate-50 rounded-[2.2rem] border border-slate-100">
                <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">2. 輸入存取密鑰</label>
                <input type="password" id="import-share-passcode" maxlength="4" placeholder="••••" 
                       class="w-full bg-white border-none rounded-xl p-4 text-2xl font-black shadow-sm outline-none text-center tracking-[1em] focus:ring-2 focus:ring-pink-100 transition-all tabular-nums">
            </div>

            <div class="px-2">
                <p class="text-[9px] text-slate-400 leading-relaxed italic">
                    ※ 系統將自動執行「數據升維自癒」，確保燃料品質與本地路網 100% 兼容。
                </p>
            </div>
        </div>`;

    const actions = `
        <button onclick="App.modalRemove('import-shared-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
        <button id="confirm-import-btn" onclick="App.executeSharedImport()" class="flex-[2] py-4 bg-slate-800 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all flex items-center justify-center gap-2">
            <i class="fa-solid fa-cloud-arrow-down"></i> 點火回流
        </button>`;

    modalEngine.create('import-shared-modal', '📥 導入共享行程', content, actions);
},

/** ⚡ [Shared-Import] 執行回流點火程序：生成獨立行程卡片 */
async executeSharedImport() {
    const shareId = document.getElementById('import-share-id')?.value.trim().toUpperCase();
    const passcode = document.getElementById('import-share-passcode')?.value.trim();
    const btn = document.getElementById('confirm-import-btn');

    if (!shareId || shareId.length < 8) return uiManager.showToast('⚠️', '座標格式錯誤');
    if (!passcode) return uiManager.showToast('🔑', '請輸入密鑰');

    // 🚀 1. 物理進入載入狀態
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i class="fa-solid fa-circle-notch fa-spin"></i> 數據擷取中...`;
    }

    try {
        // 🚀 2. 調用發動機回流 (內部自動執行 _hydrateData 升維自癒)
        const result = await syncEngine.fetchFromSharedZone(shareId, passcode);

        if (result.status === 'SUCCESS' && result.trip) {
            const incomingTrip = result.trip;
            
            // 🚀 3. 數據實體分流：另開新的行程頁進行新增
            // 💡 職人診斷：重新生成 ID 與打上當前時間戳，確保它在「我的旅行」列表中是獨立個體
            const newTripEntity = {
                ...incomingTrip,
                id: `TRIP_IMPORT_${Date.now()}`, // 🚀 關鍵：生成全新 ID 防止碰撞
                name: `[導入] ${incomingTrip.name}`, // 語義標註，方便識別
                updatedAt: Date.now(),
                createdAt: new Date().toISOString()
            };

            // 🚀 4. 數據焊接：注入全域狀態
            state.trips.push(newTripEntity);

            // 💾 5. 磁區固化：呼叫強化後的 persistState 同步本地指紋
            await App.persistState(newTripEntity);

            // 🏁 6. 成功引導與物理回收
            uiManager.showToast('✨', `航線「${newTripEntity.name}」已加入 Fleet`);
            if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

            modalEngine.remove('import-shared-modal');
            
            // 🚀 關鍵動作：切換回您截圖中的「行程列表頁 (list)」
            // 讓使用者親眼看見新卡片生成，而非直接跳入細節，符合職人級的直覺體感
            this.navigateTo('list');
            
        } else if (result.status === 'INVALID_PASSCODE') {
            uiManager.showToast('❌', '密鑰指紋不符，讀取受阻');
        } else if (result.status === 'NOT_FOUND') {
            uiManager.showToast('🔍', '找不到該物理座標，燃料可能已冷卻');
        }
    } catch (err) {
        console.error("❌ [Shared-Import-Fatal]:", err);
        uiManager.showToast('💥', '連線中斷，回流失敗');
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.innerHTML = `<i class="fa-solid fa-cloud-arrow-down"></i> 點火回流`;
        }
    }
},

/** 🚀 [Shared-Logic] 從常駐 UI 執行直接導入 */
async executeDirectImport() {
    const shareId = document.getElementById('direct-import-id')?.value.trim().toUpperCase();
    const passcode = document.getElementById('direct-import-passcode')?.value.trim();
    if (!shareId || shareId.length < 8) return uiManager.showToast('⚠️', '共享代碼格式不完整');
    if (!passcode) return uiManager.showToast('🔑', '請輸入存取密鑰');

    // 🚀 [新增] 載入中狀態
    const btn = document.getElementById('import-fire-btn');
    if (btn) {
        btn.textContent = '讀取中...';
        btn.disabled = true;
        btn.className = 'w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all bg-slate-100 text-slate-400 cursor-not-allowed';
    }

    uiManager.showToast('📡', '正在連線至共享路網...');
    try {
        const result = await syncEngine.fetchFromSharedZone(shareId, passcode);
        if (result.status === 'SUCCESS' && result.trip) {
            const newTrip = {
                ...result.trip,
                id: `TRIP_P2P_${Date.now()}`,
                name: `[共享] ${result.trip.name}`,
                updatedAt: Date.now()
            };
            state.trips.push(newTrip);
            await App.persistState(newTrip);
            uiManager.showToast('✨', `行程「${newTrip.city}」已成功匯入`);
            if (navigator.vibrate) navigator.vibrate([20, 50, 20]);
            this.navigateTo('list');
        } else {
            uiManager.showToast('❌', result.status === 'INVALID_PASSCODE' ? '密鑰錯誤，請重新確認' : '共享代碼已失效或不存在');
        }
    } catch (err) {
        console.error("❌ [Direct-Import-Fatal]:", err);
        uiManager.showToast('💥', '連線中斷，請稍後再試');
    } finally {
        // 🚀 [新增] 無論成功或失敗都還原按鈕
        if (btn) {
            btn.textContent = '匯入共享行程';
            btn.disabled = false;
            btn.className = 'w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all theme-bg text-white shadow-lg shadow-pink-100/50 active:scale-95 cursor-pointer';
        }
    }
},

/** 🚀 [Shared-Logic] 管理自己分享出去的檔案 (自動對焦版) */
    async openMySharedManager() {
        // 1. 🚀 讀取本地快照
        let history = JSON.parse(localStorage.getItem('tf_share_history') || '[]');
        
        // 🛡️ 若為空，提示後熔斷
        if (history.length === 0) return uiManager.showToast('ℹ️', '尚無分享紀錄');

        // 2. 🚀 構建具備「清空歷史」按鈕的介面
        const content = `
            <div class="space-y-4 max-h-[60vh] overflow-y-auto p-1 no-scrollbar">
                <div class="px-2 pb-2 flex justify-between items-center border-b border-slate-100 mb-2">
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">Node Status: Active</p>
                    <button onclick="App.clearShareHistory()" 
                            class="text-[9px] font-black theme-text-pink uppercase tracking-widest hover:opacity-70 transition-all">
                        ⚠️ 物理歸零本地紀錄
                    </button>
                </div>

                ${history.map(item => `
                    <div class="p-5 bg-slate-50 rounded-[2rem] border border-slate-100 flex justify-between items-center group animate-fade-in">
                        <div class="flex-1 min-w-0">
                            <h4 class="font-black text-slate-800 text-sm truncate">${item.tripName || '未命名航線'}</h4>
                            <p class="text-[9px] font-mono theme-text-pink font-black mt-1 uppercase tracking-widest">${item.id}</p>
                        </div>
                        <div class="flex gap-2">
                            <button onclick="App.deleteSharedTrip('${item.id}')" 
                                    class="w-10 h-10 bg-white text-rose-400 rounded-xl shadow-sm flex items-center justify-center active:scale-90 border border-slate-100">🗑️</button>
                            <button onclick="App.copyShareId('${item.id}')" 
                                    class="w-10 h-10 theme-bg text-white rounded-xl shadow-sm flex items-center justify-center active:scale-90">🔗</button>
                        </div>
                    </div>
                `).reverse().join('') /* 💡 職人細節：最新分享的排在最前面 */}
            </div>
        `;

        modalEngine.create('shared-manager-modal', '📋 管理我的共享路網', content, '');
    },

    /** 🧹 [Shared-Logic] 本地歷史紀錄強制歸零 */
    clearShareHistory() {
        if (!confirm("🚨 警告：這將物理銷毀手機上的「分享歷史紀錄」。\n這不會刪除雲端資料，但會解決資料不同步的問題。")) return;
        localStorage.removeItem('tf_share_history');
        modalEngine.remove('shared-manager-modal');
        uiManager.showToast('🧹', '本地歷史紀錄已清空');
        this.navigateTo('backup');
    },

/** 🗑️ [Shared-Logic] 執行物理回收：雲端銷毀與本地洗滌 */
    async deleteSharedTrip(shareId) {
        // 🚀 1. 職人級防呆確認
        if (!confirm("🚨 確定要從雲端撤回此分享嗎？\n撤回後 8 位座標將立即失效，夥伴將無法再導入。")) return;
        
        try {
            uiManager.showToast('📡', '正在對焦雲端磁區...');

            // 🚀 2. 執行 Firebase 物理切除
            const result = await syncEngine.deleteFromSharedZone(shareId);
            
            // 🛡️ 狀態診斷：攔截非成功狀態
            if (result.status === 'OFFLINE') return uiManager.showToast('📶', '網路斷路，請連線後再試');
            if (result.status === 'PERMISSION_DENIED') return uiManager.showToast('🚫', '主權指紋不符，無法刪除');

            // 🚀 3. 物理洗滌本地歷史紀錄 (Sanitization)
            let history = JSON.parse(localStorage.getItem('tf_share_history') || '[]');
            history = history.filter(h => h.id !== shareId);
            localStorage.setItem('tf_share_history', JSON.stringify(history));
            
            // 🚀 4. 視圖回收與熱重連
            // 💡 職人診斷：先關閉 Modal 確保不會有 DOM 殘留干擾導航
            modalEngine.remove('shared-manager-modal');
            
            uiManager.showToast('🧹', '分享已撤回並銷毀');
            if (navigator.vibrate) navigator.vibrate([10, 30]);

            // 延遲 100ms 執行跳轉，確保 Modal 動畫完全釋放
            setTimeout(() => {
                this.navigateTo('backup');
            }, 100);

        } catch (e) {
            console.error("❌ [Shared-Delete-Collapse]:", e);
            uiManager.showToast('❌', '數據路網傳輸異常');
        }
    },

/** 🔐 啟動 Google 登入對焦 (V2026.ULTRA 手機對焦版) */
async login() {
    try {
        // ✅ 修正：對焦 uiManager 雙軌參數
        uiManager.showToast('🔐', '正在建立安全連結...');
        
        // 🚀 執行 Firebase 彈窗登入
        await signInWithPopup(auth, googleProvider);
        
        // 登入成功後，onAuthStateChanged 會自動接管 boot 邏輯
        // 這裡不需要額外提示，boot 成功後會彈出已載入行程的 Toast
        
    } catch (error) {
        console.error("❌ [Auth-Error]:", error);
        
        // 🛡️ 異常處理對焦
        if (error.code === 'auth/popup-closed-by-user') {
            uiManager.showToast('ℹ️', '登入視窗已手動關閉');
        } else if (error.code === 'auth/unauthorized-domain') {
            uiManager.showToast('🚫', '網域未授權，請檢查後台設定');
        } else {
            // ❌ 物理切除原生 alert
            // alert("雲端連結失敗...");
            
            // ✅ 修正：轉發至 uiManager
            uiManager.showToast('💥', '雲端連結失敗，請檢查網路');
        }
    }
},
    /** 🔓 執行物理登出與狀態清空 */
    async logout() {
        if (confirm("確定要斷開雲端連結並登出嗎？")) {
            await signOut(auth);
            localStorage.removeItem('tf_cloud_snapshot'); // 清除本地指紋快照
            location.reload(); // 🚀 物理重啟：最徹底的內存清理方式
        }
    },


// ============================================================
// 8. [System Utility] 系統底層支援
// 負責：圖片壓縮、提示回饋、初始化
// ============================================================


/** 🚀 [Acoustic-Weld] 物理觸發檔案選取器 (嫁接回歸) */
triggerImageUpload() {
    // 1. 物理尋找隱藏的檔案軌道
    let fileInput = document.getElementById('hidden-file-input');
    
    // 2. 防禦性建立：若 DOM 中不存在則動態生成 (確保任何 Modal 都能導通)
    if (!fileInput) {
        fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.id = 'hidden-file-input';
        fileInput.className = 'hidden';
        fileInput.accept = 'image/*';
        // 焊接至 handleImageUpload 邏輯
        fileInput.onchange = (e) => this.handleImageUpload(e.target);
        document.body.appendChild(fileInput);
    }
    
    // 3. 執行物理點火
    fileInput.click();
},

/** 🖼️ 圖片檔案採集工具：將 File 轉為輕量化 Base64 (維持你原本的壓縮邏輯) */
handleImageUpload(input) {
    const file = input.files[0];
    if (!file) return;

    // 1. 檔案大小預檢 (5MB 防禦)
    if (file.size > 5 * 1024 * 1024) {
        uiManager.showToast("⚠️", "檔案過大，請選擇 5MB 以下的圖片");
        input.value = "";
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            // 🚀 2. 畫布壓縮：最大寬度 1000px
            const canvas = document.createElement('canvas');
            let width = img.width;
            let height = img.height;
            const max_size = 1000;

            if (width > height) {
                if (width > max_size) {
                    height *= max_size / width;
                    width = max_size;
                }
            } else {
                if (height > max_size) {
                    width *= max_size / height;
                    height = max_size;
                }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // 3. 轉為高品質 JPEG Base64
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

            // 🚀 4. 關鍵對焦：將數據回填至 Modal 內的 URL 欄位與隱藏 Field
            const urlInput = document.getElementById('node-image-url');
            if (urlInput) {
                urlInput.value = compressedBase64;
                // 觸發一個 Input 事件確保數據被系統感應
                urlInput.dispatchEvent(new Event('input'));
            }
            
            // 5. 即時預覽視覺對焦
            const preview = document.getElementById('image-preview-box');
            if (preview) {
                preview.innerHTML = `<img src="${compressedBase64}" class="w-full h-full object-cover">`;
            }
            
            uiManager.showToast("🖼️", "影像燃料已裝填完畢");
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
    // 清空 input value 確保同一張圖可以重複選取觸發 onchange
    input.value = "";
  },

// ============================================================
    // 🧪 [Data-Sanitization-Plug-ins] 數據洗滌發動機插件組
    // ============================================================

/** 📍 [Sub-Washing] 靈感小卡擷取 - 終極主權導通版 (V2026.ULTRA.FINAL_FIX) */
async _washBacklog(payload, trip, subWhitelist, hasSubChecks) {
    console.log("🏭 [Wash-Backlog] 啟動磁區穿透程序...");

    // 🚀 1. 物理提領真值
    const rawFuel = await window.dbManager.getAll('itineraryBacklog') || [];
    if (rawFuel.length === 0) {
        console.warn("⚠️ [Wash-Backlog] 磁區真空");
        return;
    }

    const targetCity = String(trip.city || "").trim();

    // 🚀 2. 執行「磁區對焦」 (確保 13 筆基準燃料就位)
    const cityFuel = rawFuel.filter(b => b && String(b.city || "").trim() === targetCity);

    // 🚀 3. 智慧感應：探測白名單中是否存在該模組的「導通指紋」
    // 💡 職人診斷：判斷子項清單中是否包含任何 backlog 相關 ID 或城市組標籤
    const hasBacklogSignals = Array.isArray(subWhitelist) && subWhitelist.some(id => 
        String(id).startsWith('backlog_') || 
        String(id).startsWith('city-group-') ||
        rawFuel.some(f => String(f.id) === String(id))
    );

    // 🚀 4. 執行引流策略
    let resultFuel = [];
    if (hasSubChecks && hasBacklogSignals) {
        // 模式 A：精密導通 (使用者有手動勾選特定靈感)
        resultFuel = cityFuel.filter(b => {
            const bId = String(b.id);
            const bCity = String(b.city || "").trim();
            return subWhitelist.includes(bId) || subWhitelist.includes(`city-group-${bCity}`);
        });
        console.log(`📡 [Wash-Backlog] 狀態: 精密導通 | 導通數: ${resultFuel.length}`);
    } else {
        // 模式 B：全量導通 (只要外層模組開關點火，且無細項指紋，則全量引入該城市)
        // 💡 核心修正：這是解決「京都 13 筆噴不出來」的關鍵路徑
        resultFuel = cityFuel;
        console.log(`📡 [Wash-Backlog] 狀態: 全量引流 | 導通數: ${resultFuel.length}`);
    }

    // 🚀 5. 數據洗滌：切除 UI 暫態屬性 (isFocused, tempId 等)
    // 💡 職人提醒：確保使用新的 Array 參考，封殺 JSON.stringify 失敗風險
    payload.backlogs = resultFuel.map(b => {
        const { isFocused, tempId, selected, ...purified } = b;
        return purified;
    });

    console.log(`🏁 [Wash-Backlog-Final] 區域: ${targetCity} | 封裝能量: ${payload.backlogs.length} 筆`);
},


/** ✈️ [Sub-Washing] 航班交通洗滌 (V2026.ULTRA 原子化版) */
    _washFlights(payload, trip, subWhitelist, hasSubChecks) {
        if (!Array.isArray(payload.transport)) return;
        
        // 🚀 執行精密引流
        if (hasSubChecks) {
            payload.transport = payload.transport.filter((_, idx) => subWhitelist.includes(`flight-${idx}`));
        }
        
        // 💡 職人診斷：若結果為空，執行物理熔斷，封殺空殼數據發送
        if (payload.transport.length === 0) {
            delete payload.transport;
            console.log("🧹 [Melt-Success] 航班軌道無有效指紋，執行物理熔斷");
        }
    },

    /** 🏨 [Sub-Washing] 飯店磁區洗滌 (V2026.ULTRA 原子化版) */
    _washHotels(payload, trip, subWhitelist, hasSubChecks) {
        if (!Array.isArray(payload.hotels)) return;
        
        if (hasSubChecks) {
            payload.hotels = payload.hotels.filter((_, idx) => subWhitelist.includes(`hotel-${idx}`));
        }
        
        if (payload.hotels.length === 0) {
            delete payload.hotels;
            console.log("🧹 [Melt-Success] 飯店軌道無有效指紋，執行物理熔斷");
        }
    },

    /** 🗓️ [Sub-Washing] 行程表磁區洗滌 (V2026.ULTRA 結構保護版) */
    _washItinerary(payload, trip, subWhitelist, hasSubChecks) {
        if (!Array.isArray(payload.days)) return;
        
        if (hasSubChecks) {
            // 🚀 執行「半熔斷」：保留天數節點，但清空內部的 schedules 燃料
            // 這是為了確保接收端在 renderDetail 時，D1/D2 的標籤還在，但內容隨勾選過濾
            payload.days = payload.days.map((day, idx) => {
                const isDaySelected = subWhitelist.includes(`day-${idx}`);
                return {
                    ...day,
                    schedules: isDaySelected ? day.schedules : []
                };
            });
        }
        
        // 🛡️ 結構主權防禦：行程表是系統根基，絕不 delete，僅執行內容洗滌
        console.log(`🏁 [Wash-Itinerary] 行程磁區已完成原子過濾`);
    },

/** 🎒 [Sub-Washing] 攜帶清單洗滌 (V2026.ULTRA 物件主權純化版) */
async _washPacking(payload, trip, subWhitelist, hasSubChecks) {
    console.log("📡 [Wash-Packing] 執行行程物件內部清單萃取...");

    // 🚀 1. 數據主權對焦：直接鎖定嵌入式數據源
    // 💡 職人診斷：放棄對獨立磁區的請求，直接從熱機後的 state 或傳入的 trip 提取 Array
    const tripItems = window.state?.checklistItems || trip.checklistItems || [];

    // 🚀 2. 執行引流策略
    let result = [];
    if (hasSubChecks) {
        const isFull = subWhitelist.includes('pack-all');
        const hasCatSignal = subWhitelist.some(id => id.startsWith('pack-cat-'));
        
        if (isFull) {
            result = tripItems;
        } else if (hasCatSignal) {
            // 分子級分類過濾
            result = tripItems.filter(item => 
                subWhitelist.includes(`pack-cat-${item.category}`)
            );
        }
    } else {
        // 模式 B：全量引流
        result = tripItems;
    }

    // 🚀 3. 數據純化：物理切除所有 IDB 指紋，回歸您提供的「原始燃料」格式
    payload.checklistItems = result.map(item => {
        // 💡 職人美學：僅保留 done, tagColor, id, category, color, task, text 等核心基因
        const { tripId, timestamp, ...purified } = item;
        return purified;
    });

    console.log(`🏁 [Wash-Packing-Final] 數據純化完畢 | 封裝件數: ${payload.checklistItems.length}`);
},


/** 🎙️ [Sub-Washing] 即時翻譯磁區洗滌 (V2026.ULTRA 數據轉移版) */
async _washRealtime(payload, trip, subWhitelist, hasSubChecks) {
    console.log("🛰️ [Wash-Realtime] 執行即時語料磁區穿透...");

    // 🚀 1. 物理提領 translationVault
    const allVault = await window.dbManager.getAll('translationVault') || [];
    
    // 🚀 2. 鎖定「即時/教育」類基因指紋
    const realtimeFuel = allVault.filter(item => item.type === 'article_package' || item.edu_vocab);

    // 🚀 3. 執行執行導通策略
    if (hasSubChecks) {
        const isFull = subWhitelist.includes('rt-all');
        
        payload.realtimeTrans = isFull 
            ? realtimeFuel 
            : realtimeFuel.filter(item => subWhitelist.includes(`rt-item-${item.id}`));
            
        console.log(`📡 [Wash-Realtime] 模式: 精密導通 | 導通數: ${payload.realtimeTrans.length}`);
    } else {
        // 預設全量引流
        payload.realtimeTrans = realtimeFuel;
        console.log("📡 [Wash-Realtime] 模式: 全量引流");
    }

    // 🚀 4. 數據基因純化
    payload.realtimeTrans = payload.realtimeTrans.map(item => {
        const { edu_listening, segments, ...purified } = item;
        return purified;
    });
},

/** 🎓 [Sub-Washing] 特訓小卡洗滌 (SRS 唯一主權版) */
async _washTraining(payload, trip, subWhitelist, hasSubChecks) {
    console.log("📡 [Wash-Training] 鎖定 SRS 磁區進行純淨導通...");

    // 🚀 1. 穿透物理磁區
    const srsMetadata = await window.dbManager.getAll('srsMetadata') || [];

    if (hasSubChecks) {
        // 🚀 2. 執行子項指紋比對
        const isFull = subWhitelist.includes('train-srs-all');
        const wantVocab = subWhitelist.includes('train-srs-vocab');
        const wantQuiz = subWhitelist.includes('train-srs-quiz');

        payload.srsMetadata = srsMetadata.filter(item => {
            if (isFull) return true;
            if (wantVocab && item.type === '單字') return true;
            if (wantQuiz && item.type === '測驗') return true;
            return false;
        });
    } else {
        // 預設全量導通
        payload.srsMetadata = srsMetadata;
    }

    // 🚀 3. 封殺教材雜訊：移除原本誤導的 trainingTrans 欄位
    delete payload.trainingTrans; 

    console.log(`🏁 [Wash-Training-Final] 導通純淨 SRS 燃料: ${payload.srsMetadata.length} 筆`);
},

/** 🗣️ [Sub-Washing] 情境翻譯語料擷取 (V2026.ULTRA 基因鎖定版) */
async _washContextual(payload, trip, subWhitelist, hasSubChecks) {
    console.log("📡 [Wash-Contextual] 啟動情境語料磁區精密穿透...");

    // 🚀 1. 物理穿透：從 translationVault 提領全量數據
    const allVault = await window.dbManager.getAll('translationVault') || [];

    // 🚀 2. 基因識別：排除新聞/歌詞/即時翻譯，精確對焦 6 筆實境語料
    // 💡 職人診斷：鎖定 type: 'contextual' 且具備 q/a 結構的數據，物理隔離 index 0-8 的雜訊
    const conversationFuel = allVault.filter(item => 
        item.type === 'contextual' || 
        (item.q && item.a && !item.edu_vocab)
    );

    // 🚀 3. 探測場景指紋 (ctx-scene-XXX)
    const hasSceneSignals = Array.isArray(subWhitelist) && subWhitelist.some(id => id.startsWith('ctx-scene-'));

    // 🚀 4. 執行引流策略
    let result = [];
    if (hasSubChecks && hasSceneSignals) {
        // 模式 A：精密導通 (依據場景分類)
        result = conversationFuel.filter(item => {
            const scene = item.category || item.scene;
            return subWhitelist.includes(`ctx-scene-${scene}`);
        });
        console.log(`📡 [Wash-Contextual] 模式: 精密導通 | 導通數: ${result.length}`);
    } else {
        // 模式 B：全量引流 (只要有勾選，預設全部帶走那 6 筆)
        result = conversationFuel;
        console.log(`📡 [Wash-Contextual] 模式: 全量引流 | 導通數: ${result.length}`);
    }

    // 🚀 5. 數據純化：移除 IDB 實體索引，保留 q, a, romaji 等核心燃料
    payload.contextualTrans = result.map(item => {
        // 排除冗餘欄位，確保封包主權純淨
        const { id, timestamp, segments, ...purified } = item;
        return purified;
    });

    console.log(`🏁 [Wash-Contextual-Final] 情境語料對焦封裝完畢`);
},


    /** 🛒 [Sub-Washing] 購物清單穿透洗滌 */
    _washShopping(payload, trip, subWhitelist, hasSubChecks) {
        if (payload.days) {
            payload.days.forEach(d => {
                if (d.schedules) {
                    d.schedules = d.schedules.filter(s => 
                        s.style !== 'shopping' || !hasSubChecks || subWhitelist.includes(`shop-${s.id}`) || subWhitelist.includes('shop-all')
                    );
                }
            });
        }
        if (hasSubChecks && !subWhitelist.includes('shop-all')) delete payload.shoppingConfig;
    },

/** 🏥 [Sub-Washing] 緊急救援磁區洗滌 (V2026.ULTRA 數據歸一化版) */
_washEmergency(payload, trip, subWhitelist, hasSubChecks) {
    console.log("🚑 [Wash-Emergency] 啟動救援磁區數據歸一化...");

    // 🚀 1. 物理提領原始燃料
    const rawVault = trip.emergencyVault || [];
    
    // 🚀 2. 執行「基因重組」 (陣列轉結構化物件)
    // 💡 職人診斷：無論資料庫存的是陣列還是物件，統一格式化為標準規範
    let normalized = { medical: [], insurance: null, contacts: [], embassy: [] };

    if (Array.isArray(rawVault)) {
        console.log(`🔄 [Data-Remap] 偵測到陣列結構 (${rawVault.length} 節點)，執行語義分流...`);
        rawVault.forEach(item => {
            const type = String(item.type || "").toLowerCase();
            const name = String(item.name || "");

            if (type === 'medical' || name.includes('醫院')) {
                normalized.medical.push(item);
            } else if (type === 'insurance' || name.includes('保險') || name.includes('Chubb')) {
                normalized.insurance = item;
            } else if (name.includes('辦事處') || name.includes('大使館')) {
                normalized.embassy.push(item);
            } else {
                normalized.contacts.push(item);
            }
        });
    } else {
        // 若已經是物件，則直接繼承並確保數組存在
        normalized = {
            medical: rawVault.medical || [],
            insurance: rawVault.insurance || null,
            contacts: rawVault.contacts || [],
            embassy: rawVault.embassy || []
        };
    }

    // 🚀 3. 執行執行導通策略
    const hasEmergencySignals = Array.isArray(subWhitelist) && subWhitelist.some(id => id.startsWith('emg-'));

    if (hasSubChecks && hasEmergencySignals) {
        // 模式 A：精密過濾
        const purified = {};
        if (subWhitelist.includes('emg-medical')) purified.medical = normalized.medical;
        if (subWhitelist.includes('emg-insurance')) purified.insurance = normalized.insurance;
        if (subWhitelist.includes('emg-contact')) {
            purified.contacts = normalized.contacts;
            purified.embassy = normalized.embassy;
        }
        payload.emergencyVault = purified;
    } else {
        // 模式 B：全量引流 (分享時預設導通)
        payload.emergencyVault = normalized;
    }

    console.log("🏁 [Wash-Emergency-Final] 數據洗滌完畢，結構已歸一化");
},


/** 🛡️ [Helper] 模組物理熔斷邏輯 (V2026.ULTRA 實體對位版) */
_terminateModule(payload, modId) {
    // 🚀 1. 建立全量數據基因映射表
    // 💡 職人診斷：此處的 Key 必須與 deployToSharedZone 內的封裝鍵名絕對對齊
    const fieldMap = {
        'flights': 'transport', 
        'hotels': 'hotels', 
        'itinerary': 'days',
        'packing': 'checklistItems', // 👈 修正：對位 sharedPayload.checklistItems
        'realtime': 'translations',  // 👈 修正：對位 sharedPayload.translations (包含語軌)
        'training': 'srs',           // 👈 修正：對位 sharedPayload.srs
        'contextual': 'translations', // 💡 職人提醒：情境與即時共用 translations 磁區
        'shopping': 'days',          // 💡 職人提醒：購物通常內嵌於 days，執行半熔斷處理
        'emergency': 'emergencyVault',
        'backlog': 'backlogs'
    };

    const field = fieldMap[modId];
    if (!field) {
        console.warn(`⚠️ [Melt-Warn] 找不到模組 ID: ${modId} 的物理映射`);
        return;
    }

    // 🚀 2. 執行物理熔斷
    try {
        if (field === 'days') {
            // 模式 A：行程/購物半熔斷 - 保留天數外殼，但物理切除 schedules，封殺空殼渲染崩潰
            if (Array.isArray(payload.days)) {
                payload.days = payload.days.map(d => ({
                    ...d,
                    schedules: [] 
                }));
                console.log(`🧼 [Semi-Melt] 行程骨架已純化：${modId}`);
            }
        } else if (field === 'translations' && payload.translations) {
            // 模式 B：語義特殊熔斷 - 根據 modId 分流切除 realtime 或 contextual
            if (modId === 'realtime') delete payload.translations.realtime;
            if (modId === 'contextual') delete payload.translations.contextual;
            
            // 若兩者皆空，則切除整個 translations
            if (!payload.translations.realtime && !payload.translations.contextual) {
                delete payload.translations;
            }
            console.log(`🧹 [Linguistic-Melt] 語義磁區已針對 ${modId} 降維`);
        } else {
            // 模式 C：完全熔斷 - 物理抹除
            if (Object.prototype.hasOwnProperty.call(payload, field)) {
                delete payload[field];
                console.log(`🧹 [Melt-Success] 磁區 ${field} 已物理歸零`);
            }
        }
    } catch (e) {
        console.error(`❌ [Melt-Fatal] 執行 ${modId} 熔斷時發生坍塌:`, e);
    }
}
};




// 🚀 App 方法賦值 (確保這裡的 uiManager 已經在上面定義好了)
App.changeTextSize = (val) => uiManager.applyText(val);
App.changeUISize = (val) => uiManager.applyUI(val);
App.changeTheme = (key) => uiManager.applyTheme(key);

/** 🚀 [V2026-Acoustic-Weld] 視覺發報軌道重對焦 */
App.showToast = (icon, message) => {
    // 💡 職人提醒：這裡我們直接呼叫導入的 uiManager 實體
    if (typeof uiManager !== 'undefined' && uiManager.showToast) {
        uiManager.showToast(icon, message);
    } else {
        console.warn(`[Toast-Fallback] ${icon} ${message}`);
    }
};


/**
 * 🌟 最終焊接
 * 將 App 物件掛載至 window，確保 HTML onclick 屬性能直接調用
 */
window.App = App;
window.viewEngine = viewEngine;
window.modalEngine = modalEngine; // 🚀 導通全域監控與跨模組調用
window.dbManager = dbManager;
window.state = state;
window.audioManager = audioManager;

window.expenseManager = expenseManager;
window.backlogManager = backlogManager; // 🚀 導通全域監控
window.showToast = App.showToast;

// 確保 App 映射也同步導通 (作為雙軌備援)
App.filterShopping = (cat) => expenseManager.filterShopping(cat);
App.importShoppingFuel = () => expenseManager.importShoppingFuel();
App.syncShoppingAiPrompt = (val) => expenseManager.syncShoppingAiPrompt(val);
App.deleteShoppingItem = (id) => expenseManager.deleteShoppingItem(id);
App.promptEditShoppingCategories = () => expenseManager.promptEditShoppingCategories();


// ============================================================
//                    行程總攬
// ============================================================

/** 🚀 [Router-Link] 每日視角切換器 */
App.setDayViewMode = (tripId, mode, dayIndex) => {
    // 1. 物理固化模式標籤
    localStorage.setItem(`tf_day_view_${tripId}`, mode);
    
    // 2. 物理觸覺反饋
    if (navigator.vibrate) navigator.vibrate(8);

    // 3. 視圖熱刷新：直接針對內容區域執行局部導通
    const contentArea = document.getElementById('day-content-area');
    const trip = state.trips.find(t => t.id === tripId);
    
    if (contentArea && trip) {
        viewEngine.renderDayDetailContent(contentArea, trip, dayIndex);
        console.log(`📡 [View-Focus] Day ${dayIndex + 1} 已對焦至: ${mode === 'overview' ? '行程總覽' : '精確路線'}`);
    }
};

// ============================================================
// 🎙️ 語義翻譯模組：動態導通代理 (V2026.ULTRA 穩壓版)
// ============================================================

/** 🚀 視圖切換代理：整合邏輯與視圖解耦 (V2026.ULTRA.FINAL 劇場導通強化版) */
App.switchRealtimeMode = (mode) => {
    // 🚀 1. 獲取當前活躍發動機 (Logic Engine)
    const engine = App.activeTranslationEngine;
    
    // 💡 職人診斷：執行硬體回收，確保相機資源在模式切換時物理斷開
    if (engine && typeof engine.stopCamera === 'function') {
        engine.stopCamera();
    }

    // 🚀 2. 聲學總線物理洗滌 (Acoustic Sanitization)
    // 無論切換到哪種模式，均強制熔斷正在播報的語音，封殺聲軌重疊
    if (typeof App.stopAllSpeech === 'function') {
        App.stopAllSpeech();
    }
    
    // 🔓 解除語音攔截信號，確保新模式的播報能正常導通
    window.JP_AUDIO_STOP_SIGNAL = false;
    window.EN_AUDIO_STOP_SIGNAL = false;

    // 🚀 3. 執行實體換殼 (View 層職責)
    if (window.translationView && typeof translationView.renderRealtimeTranslation === 'function') {
        const container = document.getElementById('content-container');
        // 渲染對應模式的 HTML 地基
        translationView.renderRealtimeTranslation(container, mode);
    }

    // 🚀 4. 通知發動機執行狀態切換 (數據層與邏輯觸發)
    if (engine && typeof engine.switchRealtimeMode === 'function') {
        engine.switchRealtimeMode(mode);
    }

    // 🚀 5. 劇場專屬：角色磁區點火 (V2026 新增)
    // 💡 職人對位：若切換至劇場模式，主動觸發一次隨機抽樣，封殺「👤 載入中」的初始化真空感
    if (mode === 'dialogue') {
        setTimeout(() => {
            if (typeof App.theatreRefreshDuo === 'function') {
                App.theatreRefreshDuo();
            } else if (window.translationView?.refreshRandomDuo) {
                translationView.refreshRandomDuo();
            }
        }, 50); // 微延遲確保 DOM 已渲染完畢
    }
    
    console.log(`📡 [Mode-Router] 模式導向：${mode} | 總線重置 | 劇場角色已對焦`);
};

// 🚀 核心數據發動機對接：維持指向邏輯層 (Engine)
// 💡 職人提醒：這些涉及資料庫與 API 的功能應保留在 Engine，App 只負責分流
App.executeTextTranslate = () => App.activeTranslationEngine.executeTextTranslate();


/** 🚀 [Refinery-Proxy] 指令合成代理：確保進階風格對焦導通 */
App.copyPromptWithContent = () => {
    // 🚀 核心對焦：直接調用 Getter 獲取的活躍引擎 (translationEngine 或 en_translationEngine)
    const engine = App.activeTranslationEngine;
    
    if (engine && typeof engine.copyPromptWithContent === 'function') {
        // 💡 職人診斷：執行具備「風格採樣」能力的進階指令發射器
        return engine.copyPromptWithContent();
    } else {
        console.warn("⚠️ [Prompt-Gate] 活躍引擎未導通 copyPromptWithContent 軌道");
        // 備援路網：退守至預設日文引擎
        return window.translationEngine?.copyPromptWithContent();
    }
};

App.executeAdvancedTranslate = () => translationEngine.executeAdvancedTranslate();
App.injectFuelFromClipboard = () => App.activeTranslationEngine.injectFuelFromClipboard();


App.importTranslateFuel = () => App.activeTranslationEngine.importTranslateFuel();
App.clearTranslateVault = () => App.activeTranslationEngine.clearTranslateVault();

// 在 main.js 中，App 對象定義的下方或初始化位置
// 🚀 強效焊接：確保全域調用 App.filterTranslate 時，永遠對準「當前活躍語系引擎」的邏輯
App.filterTranslate = async (category) => {
    console.log(`📡 [App-Proxy] 代理執行過濾: ${category}`);
    
    // 1. 物理獲取當前活躍發動機 (JP 或 EN)
    const engine = App.activeTranslationEngine;
    
    if (engine && typeof engine.filterTranslate === 'function') {
        // 2. 🚀 核心執行
        await engine.filterTranslate(category);
    } else {
        // 3. 備援機制：如果 active 噴掉，嘗試直接找 translationEngine
        console.warn("⚠️ [App-Proxy] 活躍引擎斷路，啟動全域備援");
        await window.translationEngine?.filterTranslate(category);
    }
};

/** 🚀 聲學重複噴發：確保對焦當前活躍引擎 */
App.repeatLastTTS = () => {
    const text = document.getElementById('tts-target')?.innerText;
    if (text && text !== "AI 語義對焦中...") {
        // 使用 App.speak 自動分流日/英發動機
        App.speak(text);
    } else {
        uiManager.showToast('⚠️', "尚無有效的聲學燃料");
    }
};

/** 🚀 同步 AI 指令按鈕：動態對焦當前語系的 Prompt 燃料 */
App.syncTranslateAiPrompt = (val) => {
    // 💡 職人對焦：統一透過邏輯引擎獲取 Prompt，封殺視圖引擎的混淆
    const engine = App.activeTranslationEngine; 
    const btnContainer = document.getElementById('translate-ai-btn');
    
    if (btnContainer && typeof engine._getTranslateAiPrompt === 'function') {
        const prompt = engine._getTranslateAiPrompt(val);
        
        // 🏗️ 保持渲染工具鏈的極簡：統一使用 viewEngine 輸出按鈕 UI
        btnContainer.innerHTML = viewEngine.renderAICopyBtn(prompt);
        
        console.log(`📡 [Prompt-Sync] 已根據「${val}」分區校準 AI 燃料`);
    } else {
        console.warn("⚠️ [Prompt-Sync] 引擎未就緒或不支援該方法");
    }
};

// ========================================
//              影子特訓相關
// ========================================


// 💡 職人提醒：若要在特訓牆中切換篩選（單字/文法），需補上此代理
App.filterTrainingFocus = (focus) => {
    state.trainingFocus = focus;
    if (navigator.vibrate) navigator.vibrate(5);
    App.navigateTo('training'); // 強制重新觸發 executeViewLogic 以重撈數據
};



// ========================================
//              靈感匯聚相關
// ========================================

// 🤖 草稿第二階段：從草稿取出該天小卡，啟動精煉流程
App.startDayRefinement = function(draftId, dayIndex) {
    const trip = state.trips?.find(t => t.id === state.activeTripId);
    const draft = trip?.aiPlannerDrafts?.find(d => d.id === draftId);
    if (!draft) return;

    const day = draft.result?.days?.[dayIndex];
    if (!day || !day.cards?.length) {
        return uiManager.showToast('⚠️', `Day ${dayIndex + 1} 沒有安排小卡`);
    }

    // 🚀 1. 關閉草稿模態框
    App.modalRemove('ai-draft-detail-modal');
    App.modalRemove('ai-draft-modal');

    // 🚀 2. 確保在 backlog 頁面
    App.navigateTo('backlog');

    // 🚀 3. 等頁面渲染完，把該天小卡加上 .selected class
    setTimeout(() => {
        // 先清除所有選取
        backlogManager.clearSelection();

        // 🚀 兼容新舊格式：新格式 {id, suggested_time}，舊格式純字串
        day.cards.forEach(card => {
            const cardId = typeof card === 'object' ? card.id : card;
            if (!cardId) return;

            backlogManager.toggleSelection(cardId);
            const cardEl = document.getElementById(`card-${cardId}`);
            if (cardEl) {
                cardEl.classList.add('selected');
                cardEl.style.border = '2px solid #D4537E';
                cardEl.style.background = '#FBEAF0';
                cardEl.style.boxShadow = '0 4px 16px rgba(212,83,126,0.2)';
                cardEl.style.transform = 'translateY(-2px)';
            }
        });

        viewEngine.updateRefineryFAB();
        uiManager.showToast('🏭', `Day ${dayIndex + 1}「${day.theme}」已備妥，點 AI 規劃進入精煉`);

    }, 500);
};

// 🚀 備選精煉廠代理 (Refinery Proxy)
// 1. 採集原子數據 (店名/城市)
App.addBacklogRecord = (name, city, info) => backlogManager.addRecord(name, city, info);

/** 🚀 2. [V2026.ULTRA] 批量靈感洗滌程序 (新增於此) */
App.addBatchBacklogRecords = async (rawText, city, category) => {
    // 物理分割：支援 換行、中英文分號、逗號
    const lines = rawText.split(/[\n;；,，]+/)
                         .map(l => l.trim())
                         .filter(l => l.length > 0);

    if (lines.length === 0) return;

    // 數據封裝 (對焦 7 元組標準)
    const processedItems = lines.map(line => {
        // 智慧語義對焦：偵測有無 @DayN 標記或 URL
        const dayMatch = line.match(/@Day\s*(\d+)/i);
        const urlMatch = line.match(/(https?:\/\/[^\s]+)/g);
        
        // 洗掉標籤後的純淨店名
        const cleanName = line.replace(/@Day\s*\d+/i, '')
                              .replace(/(https?:\/\/[^\s]+)/g, '')
                              .trim();

        return {
            id: `BL-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
            name: cleanName || "未命名靈感",
            city: city,
            category: category,
            info: urlMatch ? `🔗 來源連結` : "批量精煉匯入",
            note: urlMatch ? urlMatch[0] : "",
            createdAt: Date.now()
        };
    });

    // 執行物理固化 (呼叫 backlogManager)
    await backlogManager.addBatchRecords(processedItems);

    // UI 回饋與視圖導通
    uiManager.showToast('🏭', `精煉廠已成功處理 ${processedItems.length} 筆靈感`);
    
    // 重新對焦視圖 (這會觸發重新負載數據並渲染)
    App.navigateTo('backlog'); 
};


/** 🖋️ 3. [Refinery-Edit] 啟動靈感原子編輯器 (外部焊接版) */
App.editBacklogItem = async (id) => {
    // 1. 🚀 物理提領
    const item = await backlogManager.get(id); 
    if (!item) return uiManager.showToast('⚠️', '找不到燃料指紋');

    // 2. 🚀 構建精煉介面
    const content = `
        <div class="space-y-5 p-2 text-left">
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">靈感名稱</label>
                <input type="text" id="edit-bl-name" value="${item.name}" 
                       class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 focus:ring-2 focus:ring-pink-200 transition-all shadow-inner outline-none">
            </div>
            <div class="grid grid-cols-2 gap-3">
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">區域</label>
                    <input type="text" id="edit-bl-city" value="${item.city || ''}" 
                           class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 shadow-inner outline-none">
                </div>
                <div class="space-y-2">
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">分類</label>
                    <input type="text" id="edit-bl-cat" value="${item.category || ''}" 
                           class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-black text-slate-700 shadow-inner outline-none">
                </div>
            </div>
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">備註描述 (Info)</label>
                <textarea id="edit-bl-info" rows="3" 
                          class="w-full bg-slate-50 border-none rounded-2xl p-4 text-sm font-medium text-slate-600 shadow-inner resize-none outline-none">${item.info || ''}</textarea>
            </div>
        </div>`;

    const actions = `
        <button onclick="App.modalRemove('edit-bl-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
        <button onclick="App.saveBacklogEdit('${id}')" class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all">完成精煉</button>`;

    modalEngine.create('edit-bl-modal', '🖋️ 靈感燃料精煉', content, actions);
};

/** 💾 4. [Refinery-Edit] 執行數據固化回填 (外部焊接版) */
App.saveBacklogEdit = async (id) => {
    const updates = {
        name: document.getElementById('edit-bl-name').value.trim(),
        city: document.getElementById('edit-bl-city').value.trim(),
        category: document.getElementById('edit-bl-cat').value.trim(),
        info: document.getElementById('edit-bl-info').value.trim()
    };

    try {
        uiManager.showToast('📡', '正在固化原子數據...');
        await backlogManager.updateItem(id, updates);
        
        modalEngine.remove('edit-bl-modal');
        uiManager.showToast('✨', '精煉成功');
        
        // 🚀 執行視圖熱重連
        App.navigateTo('backlog'); 
    } catch (e) {
        console.error("❌ [Backlog-Save-Collapse]:", e);
        uiManager.showToast('❌', '數據固化斷路');
    }
};

/** 🧹 2. 物理回收原子燃料 (具備視圖熱刷新版) */
App.deleteBacklogItem = async (id) => {
    // 🚀 [新增] 二次確認，防止誤觸
    const card = document.getElementById(`card-${id}`);
    const name = card?.querySelector('p')?.textContent?.trim() || '這張靈感';

    uiManager.showToast('🗑️', `確定刪除「${name}」？`, 5000, {
        confirmText: '確認刪除',
        onConfirm: async () => {
            try {
                const success = await backlogManager.deleteItem(id);
                if (success) {
                    App.navigateTo('backlog');
                    if (navigator.vibrate) navigator.vibrate(8);
                    console.log(`📡 [Backlog-Sync] 原子燃料 ${id} 已回收並觸發視圖熱重連`);
                }
            } catch (err) {
                console.error("❌ [Backlog-Delete-Collapse]:", err);
                uiManager.showToast('⚠️', '數據回收過程發生斷路');
            }
        }
    });
};


/** 🚀 3. [Refinery-Action] 執行燃料投射 (V2026.ULTRA 直接投射版) */
App.projectBacklogToTrip = async (idsJson, dayIndex) => {
    // 1. 🚀 解碼還原
    const ids = JSON.parse(idsJson.replace(/&quot;/g, '"'));
    const activeTripId = state.activeTripId;
    if (!activeTripId) return uiManager.showToast('⚠️', '未定位行程');

    try {
        // 2. 🚀 物理提取與轉換 (在 App 層直接處理)
        const backlogs = await backlogManager.loadAll();
        const itemsToMove = backlogs.filter(it => ids.includes(it.id));
        
        const trip = state.trips.find(t => t.id === activeTripId);
        
        // 3. 🚀 注入行程 (轉換為標準節點)
        const newNodes = itemsToMove.map(it => ({
            id: `node_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
            time: "12:00",
            location: it.name,
            memo: it.info || "",
            style: 'default',
            updatedAt: Date.now()
        }));

        trip.days[dayIndex].schedules.push(...newNodes);
        
        // 4. 🚀 磁區固化與回收
        await App.persistState(trip); // 固化 TRIP
        for (const id of ids) { await backlogManager.deleteItem(id); } // 回收 BACKLOG (投射完就消失)

        // 5. 🚀 介面重整
        modalEngine.remove('projection-day-modal');
        uiManager.showToast('🏭', `${ids.length} 筆靈感已精煉投射至 D${dayIndex + 1}`);
        
        // 自動對焦回行程頁面查看結果
        App.navigateTo('detail', activeTripId);

    } catch (err) {
        console.error("❌ [Projection-Fatal]:", err);
        uiManager.showToast('⚠️', '燃料投射中斷');
    }
};


/** 🚀 [Refinery-Core] 執行精煉投射 (V2026.ULTRA 持久化回收版) */
App.executeRefineryProjection = async (idsJson, dayIndex) => {
    const rawJson = document.getElementById('refinery-json-input')?.value.trim();
    const activeTripId = state.activeTripId;
    if (!rawJson) return uiManager.showToast('⚠️', '請先注入 AI 燃料');

    try {
        // 🚀 1. 數據洗滌與解析
        const ids = JSON.parse(idsJson.replace(/&quot;/g, '"'));
        const sanitized = rawJson.replace(/```json/g, '').replace(/```/g, '').trim();
        const fuelArray = Array.isArray(JSON.parse(sanitized)) ? JSON.parse(sanitized) : (JSON.parse(sanitized).timeline || [JSON.parse(sanitized)]);

        // 🚀 2. 調用專屬處理器生成新節點
        const refineryMode = localStorage.getItem('tf_refinery_mode') || 'split';
        const newNodes = App._refineAiFuelToNodes(fuelArray, refineryMode);

        // 🚀 3. 行程磁區固化 (Persistence)
        const trip = state.trips.find(t => t.id === activeTripId);
        trip.days[dayIndex].schedules.push(...newNodes);
        trip.days[dayIndex].schedules.sort((a, b) => (a.time || "99:99").localeCompare(b.time || "99:99"));
        await App.persistState(trip);

        // 🚀 4. 靈感主權標記 (Backlog Status Update)
        await Promise.all(ids.map(async (id) => {
            const backlog = await dbManager.get(dbManager.STORES.BACKLOG, id);
            if (backlog) {
                backlog.status = 'projected';
                return dbManager.put(dbManager.STORES.BACKLOG, backlog);
            }
        }));

        // 🚀 5. 選取磁區回收 (CRITICAL FIX)
        // 💡 職人診斷：投射成功後，應立即釋放緩存磁區，防止重複投射
        if (typeof backlogManager !== 'undefined' && backlogManager.clearSelection) {
            backlogManager.clearSelection();
            console.log(`🧹 [Refinery-Recycle] 已釋放 ${ids.length} 單位選取緩存`);
        }

        // 🚀 6. 視圖熱重連與狀態更新
        modalEngine.remove('refinery-station-modal');
        uiManager.showToast('✨', `已精煉投射至 D${dayIndex + 1}`);

        // 💡 狀態補償：強制更新 FAB 視圖 (使其消失)
        if (viewEngine.updateRefineryFAB) viewEngine.updateRefineryFAB();

        // 數據重繪
        const mainContent = document.getElementById('content-container') || document.getElementById('main-content');
        if (mainContent) {
            const allBacklogs = await dbManager.getAll(dbManager.STORES.BACKLOG);
            viewEngine.renderBacklogPage(mainContent, allBacklogs);
        } else {
            App.navigateTo('backlog'); 
        }

    } catch (e) {
        console.error("❌ [Refinery-Collapse]:", e);
        uiManager.showToast('⚠️', '磁區對焦異常');
    }
};


/** ↺ [Refinery-Action] 強制重新探測與磁區校準 */
App.probeRefineryStatus = () => {
    // 1. 物理反饋
    if (navigator.vibrate) navigator.vibrate([10, 30]);
    uiManager.showToast('↺', '正在校準行程與靈感磁區...');

    // 2. 🚀 執行視圖重連
    // 💡 職人診斷：直接調用 navigateTo，會觸發 executeViewLogic 重新讀取 state.trips，
    // 進而讓 _renderBacklogCard 的即時感應邏輯生效。
    App.navigateTo('backlog');
    
    console.log("🏁 [Sector-Probe] 磁區探測同步完畢");
};

// 4. 開放外部注入備選燃料
App.importBacklogFuel = () => backlogManager.importFuel();

/** 🏭 [Refinery-Logic] 執行多維度過濾與分頁切片 (V2026.ULTRA 引用加固版) */
App.getFilteredBacklogs = (allBacklogs) => {
    // 0. 🛡️ 數據防禦
    if (!allBacklogs) return { pagedItems: [], totalPages: 1, currentPage: 1, totalItems: 0 };

    const activeCity = localStorage.getItem('tf_backlog_city_focus') || '全部';
    const activeCat = localStorage.getItem('tf_backlog_cat_focus') || '全部';
    const context = state.backlogContext;
    const query = (context.searchQuery || "").toLowerCase().trim();

    // 🚀 1. 執行三維交叉過濾 (保持對象引用一致)
    const filtered = allBacklogs.filter(item => {
        // 💡 職人診斷：確保 item.id 存在，這是 Set 比對的核心基因
        if (!item.id) return false; 

        const cityMatch = activeCity === '全部' || item.city === activeCity;
        const catMatch = activeCat === '全部' || item.category === activeCat;
        const searchMatch = !query || item.name.toLowerCase().includes(query);
        return cityMatch && catMatch && searchMatch;
    });

    // 🚀 2. 分頁計算與邊界保護
    const perPage = context.perPage || 10;
    const totalItems = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / perPage));
    
    // 🚀 3. 頁碼自癒協定
    // 💡 職人提醒：若過濾後的結果不足以撐起當前頁碼，執行導正
    let currentPage = context.page;
    if (currentPage > totalPages) {
        currentPage = 1;
        state.backlogContext.page = 1; // 同步回寫全域狀態
    }

    const start = (currentPage - 1) * perPage;
    const pagedItems = filtered.slice(start, start + perPage);

    // 🚀 4. 輸出標準原子包
    return { 
        pagedItems, 
        totalPages, 
        currentPage, 
        totalItems 
    };
};


/** 🔍 [Refinery-Logic] 關鍵字檢索 (防抖優化版) */
App.searchBacklog = (query) => {
    if (!state.backlogContext) state.backlogContext = { page: 1, searchQuery: '' };
    
    // 🚀 1. 更新內部狀態，但不立即導航
    state.backlogContext.searchQuery = query;
    state.backlogContext.page = 1;

    // 🚀 2. 執行防抖熔斷 (Debounce Protocol)
    // 💡 職人診斷：清除之前的定時器，防止多次渲染碰撞
    if (window.TF_SEARCH_TIMER) clearTimeout(window.TF_SEARCH_TIMER);

    window.TF_SEARCH_TIMER = setTimeout(() => {
        console.log(`📡 [Search-Ignition] 搜尋指令啟動: "${query}"`);
        
        // 🚀 3. 執行視圖重連
        // 💡 職人提醒：這裡使用導航重連，確保過濾邏輯完整執行
        App.navigateTo('backlog');
        
        // 清除指針
        window.TF_SEARCH_TIMER = null;
    }, 350); // 250ms 是人類打字感官的最優平衡點
};

/** 📑 執行換頁點火 */
App.setBacklogPage = (p) => {
    state.backlogContext.page = p;
    if (navigator.vibrate) navigator.vibrate(5);
    App.navigateTo('backlog');
};

// ============================================================
// 🏭 備選精煉廠過濾中心 (Refinery Filter Center)
// ============================================================

/** 🚀 城市區域過濾代理：物理對焦強化版 (V2026.ULTRA 狀態同步版) */
App.filterBacklogByCity = async (city) => {
    // 0. 💾 物理磁區標記
    localStorage.setItem('tf_backlog_city_focus', city);
    
    // 🚀 1. 頁碼歸零協定
    if (state.backlogContext) {
        state.backlogContext.page = 1;
    }

    if (navigator.vibrate) navigator.vibrate(8);

    // 🚀 2. 【核心加固】數據守門員協定
    // 💡 職人診斷：等待 IndexedDB 數據導通，防止渲染引擎空轉
    if (window.backlogManager && typeof window.backlogManager.loadAll === 'function') {
        await window.backlogManager.loadAll(); 
    }

    // 3. 執行視圖熱更新
    App.navigateTo('backlog');

    // 🚀 4. 物理補償與狀態廣播
    const currentCat = localStorage.getItem('tf_backlog_cat_focus') || '全部';
    
    // 💡 職人診斷：增加至 100ms 補償，確保 DOM 重畫完畢後再執行選取狀態顯影
    setTimeout(() => {
        // A. 區域標籤物理置中
        if (viewEngine && viewEngine.focusBacklogTabs) {
            viewEngine.focusBacklogTabs(city, currentCat);
        }

        // 🚀 B. 【關鍵焊接】呼叫 Manager 執行狀態手動點火
        // 💡 職人診斷：解決「切換 Tab 後泡泡視窗消失」的最後一哩路
        // 確保視圖層重畫後，立即從數據層抓回物理磁區的選取數量
        if (window.backlogManager && typeof window.backlogManager.syncFAB === 'function') {
            backlogManager.syncFAB();
        } else if (viewEngine && viewEngine.updateRefineryFAB) {
            // 備援方案：若 syncFAB 未定義則執行基礎刷新
            viewEngine.updateRefineryFAB();
        }
    }, 100); 
    
    console.log(`📡 [Backlog-Filter] 區域磁區對焦完成: ${city} | FAB Synced`);
};


/** 🚀 屬性分類過濾代理：語義對焦強化版 (V2026.ULTRA 狀態同步版) */
App.filterBacklogByCat = async (cat) => {
    // 0. 💾 物理磁區標記
    localStorage.setItem('tf_backlog_cat_focus', cat);
    
    // 🚀 1. 頁碼歸零協定
    if (state.backlogContext) {
        state.backlogContext.page = 1;
    }

    if (navigator.vibrate) navigator.vibrate(8);

    // 🚀 2. 【核心加固】數據守門員協定
    // 💡 職人診斷：強制等待資料加載，確保渲染時磁區燃料已對位
    if (window.backlogManager && typeof window.backlogManager.loadAll === 'function') {
        await window.backlogManager.loadAll(); 
    }

    // 3. 執行視圖熱更新
    App.navigateTo('backlog');

    // 🚀 4. 物理補償與狀態廣播
    const currentCity = localStorage.getItem('tf_backlog_city_focus') || '全部';
    
    // 💡 職人診斷：時序拉開至 100ms，封殺異步渲染導致的 FAB 點火失敗
    setTimeout(() => {
        // A. 屬性標籤物理置中
        if (viewEngine && viewEngine.focusBacklogTabs) {
            viewEngine.focusBacklogTabs(currentCity, cat);
        }

        // 🚀 B. 【關鍵焊接】呼叫 Manager 執行狀態手動點火
        // 💡 職人診斷：取代單純的 viewEngine 刷新，改由數據層主動回溯並廣播
        if (window.backlogManager && typeof window.backlogManager.syncFAB === 'function') {
            backlogManager.syncFAB();
        } else if (viewEngine && viewEngine.updateRefineryFAB) {
            viewEngine.updateRefineryFAB();
        }
    }, 100); 
    
    console.log(`📡 [Backlog-Filter] 屬性磁區對焦完成: ${cat} | Data Protected`);
};


// ==============================
//            劇場會話
// ==============================

/** 🎭 [Theatre-Proxy] 劇場會話生產線代理 (V2026.ULTRA) */
// 對位 Step 3：刷新角色
App.theatreRefreshDuo = () => {
    // 🚀 1. 物理獲取當前活躍引擎 (JP 或 EN)
    const engine = App.activeTranslationEngine;
    
    // 🚀 2. 執行熔斷檢查與導通
    // 💡 職人診斷：確保 Engine 實體存在且具備該方法，否則執行 View 層自癒重繪
    if (engine && typeof engine.theatreRefreshDuo === 'function') {
        engine.theatreRefreshDuo();
    } else {
        // 🛡️ 自癒路網：若 Engine 尚未點火，直接調用 View 層執行採樣
        console.warn("⚠️ [Theatre-Proxy] Engine 軌道斷路，點火 View 層備援採樣");
        if (window.translationView?.refreshRandomDuo) {
            translationView.refreshRandomDuo();
        }
    }
    
    // 🚀 3. 物理反饋
    if (navigator.vibrate) navigator.vibrate(8);
};

// 對位 Step 4：超級指令合成
App.theatreCopyPrompt = () => App.activeTranslationEngine.theatreCopyPrompt();

// 對位 Step 5：數據固化匯入
App.theatreImportToVault = () => App.activeTranslationEngine.theatreImportToVault();



// ==============================
//            聲學診斷
// ==============================

App._initAcousticDiagnosticPanel = function() {
    try {
        const history = JSON.parse(localStorage.getItem('tf_choke_history') || '[]');
        const triggers = JSON.parse(localStorage.getItem('tf_hot_triggers') || '[]');
        const threshold = localStorage.getItem('tf_suggested_threshold') || '—';

        // 統計數字
        const countEl = document.getElementById('dm-choke-count');
        const threshEl = document.getElementById('dm-threshold');
        if (countEl) countEl.textContent = history.length + ' 筆';
        if (threshEl) threshEl.textContent = threshold + ' 字';

        // 高頻觸發詞
        const tagEl = document.getElementById('dm-trigger-tags');
        if (tagEl) {
            tagEl.innerHTML = triggers.length
                ? triggers.map(t => `<span style="font-size:11px;background:#FBEAF0;color:#993556;border:0.5px solid #F4C0D1;padding:3px 10px;border-radius:20px;">${t}</span>`).join('')
                : '<span style="font-size:11px;color:var(--color-text-tertiary);">尚無高頻觸發詞</span>';
        }

        // 窒息記錄列表
        const listEl = document.getElementById('dm-choke-list');
        if (!listEl) return;

        if (history.length === 0) {
            listEl.innerHTML = '<p style="font-size:11px;color:var(--color-text-tertiary);">尚無窒息記錄</p>';
            return;
        }

        window._dmSelected = new Set();
        listEl.innerHTML = history.slice(-10).reverse().map((h, i) => `
            <div onclick="window._dmToggle(${i})" id="dm-row-${i}"
                 style="display:flex;align-items:flex-start;gap:8px;padding:10px;background:var(--color-background-secondary);border-radius:var(--border-radius-md);margin-bottom:6px;cursor:pointer;border:0.5px solid transparent;transition:all 0.15s;">
                <div id="dm-check-${i}" style="width:16px;height:16px;border-radius:4px;border:1.5px solid var(--color-border-secondary);display:flex;align-items:center;justify-content:center;flex-shrink:0;font-size:10px;margin-top:2px;"></div>
                <span style="font-size:10px;font-weight:500;color:#993556;background:#FBEAF0;padding:2px 6px;border-radius:4px;flex-shrink:0;margin-top:1px;">${h.len}字</span>
                <div style="flex:1;min-width:0;">
                    <p style="font-size:11px;color:var(--color-text-secondary);margin:0;line-height:1.6;word-break:break-all;">${h.full || (h.prefix + '…' + h.suffix)}</p>
                    ${h.triggers.length ? `<p style="font-size:10px;color:#D4537E;margin:3px 0 0;">觸發詞：${h.triggers.join('、')}</p>` : ''}
                    <p style="font-size:10px;color:var(--color-text-tertiary);margin:2px 0 0;">${new Date(h.timestamp).toLocaleString()}</p>
                </div>
            </div>
        `).join('');

        window._dmToggle = function(idx) {
            const row = document.getElementById('dm-row-' + idx);
            const check = document.getElementById('dm-check-' + idx);
            if (!row || !check) return;
            if (window._dmSelected.has(idx)) {
                window._dmSelected.delete(idx);
                row.style.background = 'var(--color-background-secondary)';
                row.style.borderColor = 'transparent';
                check.textContent = '';
            } else {
                window._dmSelected.add(idx);
                row.style.background = '#FBEAF0';
                row.style.borderColor = '#F4C0D1';
                check.textContent = '✓';
                check.style.color = '#993556';
            }
            const btn = document.getElementById('dm-copy-sel-btn');
            if (btn) btn.style.display = window._dmSelected.size > 0 ? 'inline-flex' : 'none';
        };

    } catch(e) {
        console.error('❌ [DiagPanel] 初始化失敗:', e);
    }
};


// 聲學診斷面板操作函數
App.selectAllChokeRecords = function() {

    // 確保面板已初始化
    if (!window._dmToggle) App._initAcousticDiagnosticPanel();

    try {
        const history = JSON.parse(localStorage.getItem('tf_choke_history') || '[]');
        const count = Math.min(history.length, 10);
        window._dmSelected = new Set([...Array(count).keys()]);
        for (let i = 0; i < count; i++) {
            const row = document.getElementById('dm-row-' + i);
            const check = document.getElementById('dm-check-' + i);
            if (row) { row.style.background = '#FBEAF0'; row.style.borderColor = '#F4C0D1'; }
            if (check) { check.textContent = '✓'; check.style.color = '#993556'; }
        }
        const btn = document.getElementById('dm-copy-sel-btn');
        if (btn) btn.style.display = 'inline-flex';
    } catch(e) {}
};

App.copySelectedChokeRecords = function() {
    try {
        const history = JSON.parse(localStorage.getItem('tf_choke_history') || '[]').slice(-10).reverse();
        const triggers = JSON.parse(localStorage.getItem('tf_hot_triggers') || '[]');
        const items = [...(window._dmSelected || [])].map(i => history[i]).filter(Boolean);
        const text = `[TravelFlow 聲學診斷 — 選取記錄]\n高頻觸發詞：${triggers.join('、') || '無'}\n\n` +
            items.map(h => `• ${h.len}字 | 觸發詞：${h.triggers.join('、') || '無'}\n  內容：${h.full || (h.prefix + '…' + h.suffix)}\n  時間：${new Date(h.timestamp).toLocaleString()}`).join('\n\n');
        navigator.clipboard.writeText(text).then(() => uiManager.showToast('✅', `已複製 ${items.length} 筆記錄`));
    } catch(e) { uiManager.showToast('⚠️', '複製失敗'); }
};

App.copyAllChokeRecords = function() {
    try {
        const history = JSON.parse(localStorage.getItem('tf_choke_history') || '[]');
        const triggers = JSON.parse(localStorage.getItem('tf_hot_triggers') || '[]');
        const threshold = localStorage.getItem('tf_suggested_threshold') || '未設定';
        const text = `[TravelFlow 聲學診斷完整報告]\n建議閾值：${threshold}字\n高頻觸發詞：${triggers.join('、') || '無'}\n\n所有記錄（共${history.length}筆）：\n` +
            history.map(h => `• ${h.len}字 | 觸發詞：${h.triggers.join('、') || '無'}\n  內容：${h.full || (h.prefix + '…' + h.suffix)}\n  時間：${new Date(h.timestamp).toLocaleString()}`).join('\n\n');
        navigator.clipboard.writeText(text).then(() => uiManager.showToast('✅', `已複製全部 ${history.length} 筆`));
    } catch(e) { uiManager.showToast('⚠️', '複製失敗'); }
};

App.clearAcousticLearning = function() {
    localStorage.removeItem('tf_choke_history');
    localStorage.removeItem('tf_hot_triggers');
    localStorage.removeItem('tf_suggested_threshold');
    uiManager.showToast('✅', '學習庫已清除');
    // 重新渲染聲學頁面
    const container = document.getElementById('content-container');
    if (container && typeof viewEngine._renderAcousticTab === 'function') {
        App.navigateTo('settings');
    }
};

// ==========================================
// 🚀 最終物理焊接：封殺 (index):1 報錯
// ==========================================

// 🎯 強制導通：將 UI 可能調用的所有變體名字統統指向新發動機
App.copyDialoguePrompt = App.theatreCopyPrompt;
App.executeDialogueGenerate = App.theatreCopyPrompt;
App.importDialogueToVault = App.theatreImportToVault;

// 🎯 聲學加固：確保 App 代理的 speakSegment 能應對劇場對話
const _oldSpeakSegment = App.speakSegment;
App.speakSegment = (text) => {
    // 💡 職人診斷：在劇場模式下，日文內容常帶有「佐藤：」前綴
    // 物理過濾：移除冒號前的角色名稱，只唸內容，提升聽感
    const cleanText = text.replace(/^.*?[：:]\s*/, '');
    _oldSpeakSegment.call(App, cleanText);
};


/** 🚀 點火程序 V3.2 (V2026.ULTRA 磁區全導通版) */
const boot = async () => {
    try {
        // 1. 🚀 UI 視認性初始化：優先渲染外殼，提升首屏體感
        uiManager.init();

        // 2. 🚀 物理指紋預載：從磁區快照恢復狀態
        const savedSnapshot = localStorage.getItem('tf_cloud_snapshot');
        if (savedSnapshot) state.cloudStats = JSON.parse(savedSnapshot);
        state.lastLocalEdit = Number(localStorage.getItem('tf_last_local_edit')) || 0;

        // 🚀 核心焊接：啟動身份監測閘門
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                state.userId = user.uid;
                state.userProfile = {
                    name: user.displayName,
                    photo: user.photoURL,
                    email: user.email
                };
                console.log(`🛰️ [Auth-Success] 使用者已定位: ${user.uid}`);
            } else {
                state.userId = "guest_sector"; 
                state.userProfile = null;
                console.log("🛰️ [Auth-Guest] 目前運行於訪客模式");
            }

            // 3. 倉庫實體導通：IndexedDB 基礎架構啟動
            await dbManager.init();
            
            // 🚀 4. 並行點火協定：同時啟動「備選精煉廠」與「主行程燃料提取」
            // 💡 職人診斷：使用 Promise.all 縮短等待時間，確保雙磁區同步就緒
            const [backlogReady, fuel] = await Promise.all([
                (window.backlogManager && typeof backlogManager.init === 'function') 
                    ? backlogManager.init() 
                    : Promise.resolve(true),
                dbManager.loadAll()
            ]);

            // 5. 數據狀態固化
            state.trips = Array.isArray(fuel) ? fuel : [];
            
            // 💡 職人級診斷：輸出精確磁區報告
            if (state.trips.length > 0 || backlogReady) {
                console.log(`📡 [Sector-Report] 
                    - 主行程磁區: ${state.trips.length} 筆
                    - 備選靈感區: ${backlogReady ? '導通' : '斷路'}`);
            }

            // 6. 執行首屏渲染
            // 💡 職人建議：根據 currentView 回位，若無則預設 list
            App.navigateTo(state.currentView || 'list');
            
            console.log("🏁 [TravelFlow] 磁區路網對焦完畢，完全由本地主權接管。");
        });

    } catch (err) {
        console.error("❌ [Boot-Collapse] 數據路網對焦異常:", err);
        // 修正：uiManager 若已就緒則使用 V2026 氣泡提示
        if (window.uiManager) {
            uiManager.showToast('⚠️', "數據路網對焦異常，請刷新頁面");
        } else if (typeof App.showToast === 'function') {
            App.showToast("數據加載失敗，請重整頁面");
        }
    }
};


// 確保 DOM 載入後才執行點火
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
} else {
    boot();
}


/**
 * 🛠️ 數據管理與導通監控 (Debug Console)
 * --------------------------------------------------
 * [Storage] IndexedDB (TravelFlow_DB) -> 實體化於 dbManager
 * [Decoupling] JSON 燃料僅承載數據，UI 渲染由 viewEngine 執行
 * [State] 支援全域診斷 (window.state)
 * * 🚀 下一步焊接建議：
 * 1. [Refactor] 將 Checklist 邏輯拆分至 checklistManager.js 以純化 main.js。
 * 2. [Security] 檢測 Base64 圖片容量，若單筆 TRIP 超過 10MB 應導入資料分片。
 * 3. [UI] 針對 switchDay 導入物理震動回饋 (Haptic Feedback) 提升操作手感。
 */