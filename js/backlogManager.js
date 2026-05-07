import { dbManager } from './dbManager.js';
import { uiManager } from './uiManager.js';

/**
 * 🏭 BACKLOG MANAGER (行程精煉廠 - V2026.ULTRA)
 * 負責備選行程的採集、固化與 AI 焊接
 */
export const backlogManager = {


items: [], // 🚀 這裡是關鍵！確保數據搬運完後存放在此


// 💡 職人診斷：預設值直接給予 Set 實體，封殺換頁時可能產生的 null/undefined 真空期
__stagedSelection: new Set(),

// 導入物理同步旗標，防止重複回溯
__isHydrated: false,

get _stagedSelection() {
    // 🚀 【核心修正】實體化回溯協定
    // 💡 診斷：若未經過物理對焦 (Hydration)，則執行一次 localStorage 抽吸
    if (!this.__isHydrated) {
        try {
            const persisted = localStorage.getItem('tf_staged_selection');
            const rawData = JSON.parse(persisted || '[]');
            
            // 強制型別對焦：確保基因 100% 為字串
            const stringifiedIds = Array.isArray(rawData) ? rawData.map(id => String(id)) : [];
            
            // 物理注入實體
            this.__stagedSelection = new Set(stringifiedIds);
            this.__isHydrated = true;
            
            console.log(`📡 [Backlog-Recovery] 物理磁區回溯成功: ${this.__stagedSelection.size} 筆`);
        } catch (e) {
            console.error("🚨 [Recovery-Collapse] 物理回溯斷路:", e);
            // 崩潰備援：至少維持空 Set
            if (!(this.__stagedSelection instanceof Set)) {
                this.__stagedSelection = new Set();
            }
            this.__isHydrated = true;
        }
    }
    return this.__stagedSelection;
},

set _stagedSelection(val) {
    // 💡 診斷：Setter 必須兼顧數據清洗
    if (val instanceof Set) {
        this.__stagedSelection = val;
    } else if (Array.isArray(val)) {
        this.__stagedSelection = new Set(val.map(id => String(id)));
    }
    this.__isHydrated = true; // 外部注入視同已完成同步
},


/**
 * 🚀 [Sector-Ignition] 磁區預熱發動機 (V2026.ULTRA 狀態鎖死版)
 * 任務：確保 BACKLOG 磁區導通，執行 Window 全域焊接，並強制執行選取回溯
 */
async init() {
    console.log("🏭 [Backlog-Refinery] 啟動精煉廠點火程序...");

    // 🚀 0. [Global-Mount] 執行 F12 Console 與模組間導通焊接
    // 💡 職人診斷：確保 window 參照永遠領先於數據操作
    if (typeof window !== 'undefined') {
        window.backlogManager = this;
    }

    // 🚀 1. [Selection-Pre-Focus] 選取狀態強制點火
    // 💡 職人診斷：直接透過存取一次 Getter 觸發自癒與 Hydration 邏輯
    // 這樣不論 localStorage 有無資料，都會在這一刻完成「物理對焦」
    try {
        const currentSelection = this._stagedSelection; 
        console.log(`📡 [Backlog-Pre-Sync] 物理磁區回溯成功 | 已選取: ${currentSelection.size}`);
    } catch (e) {
        console.error("🚨 [Backlog-Pre-Sync-Collapse] 物理回溯斷路:", e);
        // 崩潰補償：強制鎖死實體
        this.__stagedSelection = new Set();
        this.__isHydrated = true;
    }

    try {
        // 2. 🚀 自動點火補償：確保 dbManager 已就緒
        if (!dbManager.db) {
            await dbManager.init();
        }

        // 3. 🛡️ 磁區通路驗證
        const storeName = dbManager.STORES.BACKLOG;
        if (!dbManager.db.objectStoreNames.contains(storeName)) {
            console.error(`❌ [Backlog-Ignition] 磁區 ${storeName} 缺失。`);
            return false;
        }

        // 4. 🧹 數據搬運掃描
        const records = await dbManager.getAll(storeName);
        console.log(`🏁 [Backlog-Ignition] 發動機對焦完畢 | 燃料: ${records.length} | 狀態: 導通`);
        
        return true;

    } catch (err) {
        console.error("🚨 [Backlog-Ignition-Collapse] 點火程序墜毀:", err);
        return false;
    }
},

// =========================
//      新增選取緩存邏輯
// =========================


/** 💉 [Atomic-Toggle] 選取狀態切換 (V2026.ULTRA 實時導通版) */
toggleSelection(id, forceState = null) {
    // 0. 🛡️ 型別降維協定
    const sid = String(id);
    
    // 🚀 確保存取的是 Getter 以觸發回溯邏輯
    const currentSet = this._stagedSelection; 

    // 1. 🚀 記憶體軌道更新
    let isStaged = false;

    if (forceState !== null) {
        // 🎯 模式 A：強制導通 (Checkbox 連動)
        isStaged = !!forceState;
        isStaged ? currentSet.add(sid) : currentSet.delete(sid);
    } else {
        // 🎯 模式 B：原子反轉 (列表直接點擊)
        isStaged = !currentSet.has(sid);
        isStaged ? currentSet.add(sid) : currentSet.delete(sid);
    }

    // 2. 💾 物理磁區固化
    try {
        const stagedArray = Array.from(currentSet);
        localStorage.setItem('tf_staged_selection', JSON.stringify(stagedArray));
    } catch (e) {
        console.error("🚨 [Storage-Collapse] 物理寫入斷路:", e);
    }

    // 3. 📡 【核心補強】即時視覺導通 (Live-Refresh)
    // 💡 職人診斷：直接觸發狀態廣播，確保掃帚數字與 FAB 狀態無需 F5 即可刷新
    this.broadcastStateChange();

    // 4. 🚀 反饋與返回
    if (navigator.vibrate) navigator.vibrate(5);
    return isStaged; 
},

/** 📡 [State-Broadcast] 全域狀態廣播 */
broadcastStateChange() {
    // 💡 職人提醒：封裝視圖刷新邏輯，確保兩端磁區 100% 同步
    if (typeof viewEngine !== 'undefined' && typeof viewEngine.updateRefineryFAB === 'function') {
        viewEngine.updateRefineryFAB();
        
        // 🚀 額外對焦：若選取管理器 Modal 正在開啟，這也會觸發數字指針的對位
        console.log(`📡 [Backlog-Broadcast] 選取狀態已更新，通知視圖引擎重繪數字`);
    }
},

/** 💉 [Atomic-Clear] 強制清空選取緩存與物理磁區 (V2026.ULTRA 狀態保活版) */
clearSelection() {
    // 1. 🚀 記憶體軌道釋放
    // 💡 職人診斷：使用 Getter 確保觸發 Hydration 邏輯後再執行 clear()
    this._stagedSelection.clear();

    // 2. 💾 物理磁區抹除 (Persistence Wipe)
    try {
        localStorage.removeItem('tf_staged_selection');
        console.log("🧹 [Backlog-Selection] 記憶體與物理磁區已同步釋放");
    } catch (e) {
        console.error("🚨 [Storage-Wipe-Collapse] 物理磁區清理失敗:", e);
    }

    // 3. 🚀 視覺路網閉環處理 (UX Loop Closure)
    // 💡 職人對焦：若正處於「選取管理器」視窗內，必須強制熔斷模態框
    if (window.App) {
        // A. 移除管理器模態框 (封殺 Selection Matrix Vacuum 視覺)
        App.modalRemove('selection-manager-modal');
        
        // B. 強制重導向至 backlog 視圖，確保所有卡片的 .selected 樣式被物理剥離
        App.navigateTo('backlog');
    }

    // 4. 🎨 視覺連動廣播
    if (typeof viewEngine !== 'undefined' && viewEngine.updateRefineryFAB) {
        // 💡 職人提醒：確保右下角精煉投射鈕 (FAB) 即時沉降
        viewEngine.updateRefineryFAB();
    }
    
    if (navigator.vibrate) navigator.vibrate([10, 5, 10]);
},


/** 💉 [Atomic-Get] 獲取目前所有選取 ID */
getSelectedIds() {
    return Array.from(this._stagedSelection);
},


/**
 * 🚀 [Atomic-Retrieval] 原子燃料提領器
 * 任務：根據 ID 從磁區抓取特定原子燃料
 */
async get(id) {
    if (!id) return null;
    try {
        if (!dbManager.db) await dbManager.init();
        return await dbManager.get(dbManager.STORES.BACKLOG, id);
    } catch (err) {
        console.error(`❌ [Backlog-Get-Collapse] ID: ${id} 提取失敗:`, err);
        return null;
    }
},

/**
 * 💾 [Atomic-Update] 原子燃料精煉更新
 * 任務：執行數據覆蓋寫入，並自動更新「UpdatedAt」物理指紋
 */
async updateItem(id, updates) {
    try {
        // 1. 🚀 真值檢索：確保目標確實存在於磁區
        const existingItem = await this.get(id);
        if (!existingItem) {
            throw new Error("TARGET_NOT_FOUND");
        }

        // 2. 🚀 數據焊接：繼承舊數據，覆蓋新精煉內容
        // 💡 職人提醒：保留 id 與 createdAt，僅更新內容與時間指紋
        const updatedRecord = {
            ...existingItem,
            ...updates,
            updatedAt: Date.now() // 強制覆蓋最新的物理指紋
        };

        // 3. 🚀 磁區固化
        await dbManager.put(dbManager.STORES.BACKLOG, updatedRecord);
        
        console.log(`✅ [Backlog-Update] 原子數據精煉成功: ${updatedRecord.name}`);
        return true;

    } catch (err) {
        console.error("❌ [Backlog-Update-Collapse] 更新中斷:", err);
        throw err;
    }
},

/**
 * 🚀 [Sector-Extraction] 原子燃料提取器 (V2026.ULTRA 狀態保活版)
 * 任務：提取全量數據，執行時間對焦，並透過 Getter 導通選取狀態
 */
async loadAll() {
    // 1. 🚀 自動導通：確保 IndexedDB 磁區已就緒
    if (!dbManager.db) await this.init();

    try {
        // 2. 物理搬運
        const storeName = dbManager.STORES.BACKLOG;
        const rawRecords = await dbManager.getAll(storeName);

        if (!Array.isArray(rawRecords)) {
            this.items = []; // 🛡️ 物理防禦
            return [];
        }

        // 🔥 [CRITICAL WELD] 數據實體化導通
        // 💡 職人診斷：必須將提取出的燃料強行寫入當前實體的 items 磁區
        // 這是解決 viewEngine 抓到「靈感庫: 0」的最關鍵焊接點
        this.items = rawRecords;

        // 3. 🚀 時間序列對焦
        const sortedRecords = [...this.items].sort((a, b) => {
            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;
            return timeB - timeA;
        });

        // 🚀 4. 【核心補強】全域掛載確認
        // 💡 職人診斷：確保 window 參照永遠指向當前正在運作的實體
        if (typeof window !== 'undefined') {
            window.backlogManager = this;
        }

        // 💡 透過存取觸發 Getter 自癒，並鎖定當前物理規模
        const currentSelectionSize = this._stagedSelection.size;

        console.log(`📡 [Backlog-Load] 原子燃料搬運完畢 | 總計: ${sortedRecords.length} | 選取狀態: ${currentSelectionSize} 鎖定`);
        
        // 🚀 5. 【狀態廣播】強制刷新 FAB 真值 (導入微秒補償)
        if (typeof viewEngine !== 'undefined' && viewEngine.updateRefineryFAB) {
            viewEngine.updateRefineryFAB();
            setTimeout(() => viewEngine.updateRefineryFAB(), 50);
        }

        return sortedRecords;

    } catch (err) {
        console.error("❌ [Backlog-Load-Collapse] 燃料提取中斷:", err);
        this.items = []; // 崩潰時確保磁區不為 undefined
        return [];
    }
},


/**
 * 🚀 [State-Guard] 強制狀態廣播發動機 (V2026.ULTRA 物理對焦版)
 * 任務：供外部 (App.js) 在切換視圖後手動點火，確保 FAB 依據物理磁區數據立即顯影
 */
syncFAB() {
    // 1. 🚀 觸發 Getter 自癒
    // 💡 職人診斷：存取一次屬性，確保 __stagedSelection 已從 LocalStorage 完成回溯
    const currentSize = this._stagedSelection.size;

    // 2. 🎨 執行視圖焊接
    // 💡 職人診斷：檢查 viewEngine 是否導通，並執行 FAB 渲染更新
    if (typeof viewEngine !== 'undefined' && viewEngine.updateRefineryFAB) {
        viewEngine.updateRefineryFAB();
        console.log(`📡 [FAB-Sync] 廣播點火成功 | 當前物理規模: ${currentSize}`);
    } else {
        console.warn("⚠️ [FAB-Sync] 視圖引擎未導通，點火中斷。");
    }
},


/** 🚀 [Label-Self-Healing] 標籤自癒協定 */
async _ensureCategoryExists(category) {
    // 1. 取得現有標籤清單 (預設或已儲存的)
    let savedCategories = JSON.parse(localStorage.getItem('tf_backlog_categories')) || ["全部", "食", "玩", "購", "醫", "行"];
    
    // 2. 執行存在性校準
    if (!savedCategories.includes(category)) {
        console.log(`✨ [Label-Discovery] 偵測到新標籤: ${category}，執行磁區補編...`);
        savedCategories.push(category);
        localStorage.setItem('tf_backlog_categories', JSON.stringify(savedCategories));
        
        // 3. 觸發 UI 重新渲染標籤列
        if (window.App && App.renderCategoryBar) App.renderCategoryBar();
    }
},

/**
 * 🚀 [Atomic-Capture] 原子燃料採集軌道
 * 修正：導入 [Label-Self-Healing] 標籤自癒協定，自動識別並登錄新分類
 */
async addRecord(nameOrObject, city, info = "", category = "食") {
    let rawData;

    // 1. 🚀 多態辨識 (Polymorphism Dispatch)
    if (typeof nameOrObject === 'object' && nameOrObject !== null) {
        rawData = {
            name: nameOrObject.name,
            city: nameOrObject.city || city,
            info: nameOrObject.info || nameOrObject.note || info,
            category: nameOrObject.category || category
        };
    } else {
        rawData = {
            name: nameOrObject,
            city,
            info,
            category
        };
    }

    // 2. 🚀 物理數據洗滌 (Data Sanitization)
    const cleanName = String(rawData.name || "").trim();
    const cleanCity = String(rawData.city || "未定位區域").trim();
    const cleanInfo = String(rawData.info || "").trim();
    const cleanCat  = String(rawData.category || "食").trim();

    // 🛡️ 導通攔截
    if (!cleanName) {
        if (typeof nameOrObject !== 'object') uiManager.showToast('⚠️', '請輸入名稱');
        return null;
    }

    // 🚀 3. [Label-Self-Healing] 標籤自癒探針點火
    // 💡 職人診斷：自動比對現有標籤磁區，若為新分類（如：史）則執行靜默登錄
    try {
        const savedCats = JSON.parse(localStorage.getItem('tf_backlog_categories')) || ['食', '玩', '購', '行', '住', '醫'];
        if (!savedCats.includes(cleanCat)) {
            console.log(`✨ [Label-Discovery] 偵測到新屬性燃料: ${cleanCat}，執行自動對位...`);
            savedCats.push(cleanCat);
            localStorage.setItem('tf_backlog_categories', JSON.stringify(savedCats));
            
            // 💡 若 App 層級具備刷新導航列的函數，應在此通知
            if (window.App && typeof App.refreshBacklogNav === 'function') App.refreshBacklogNav();
        }
    } catch (e) {
        console.error("⚠️ [Label-Sync-Error] 標籤磁區對位異常:", e);
    }

    // 4. 🚀 原子組裝：構建 V2026 標準數據包
    const record = {
        id: `backlog_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
        name: cleanName,
        city: cleanCity,            
        category: cleanCat,
        info: cleanInfo,
        style: 'json',              
        status: 'raw',              
        createdAt: Date.now(),      
        updatedAt: Date.now()       
    };

    try {
        // 5. 🚀 磁區固化
        if (!dbManager.db) await dbManager.init();
        await dbManager.put(dbManager.STORES.BACKLOG, record);

        // 6. 反饋協定
        if (typeof nameOrObject !== 'object') {
            uiManager.showToast('📍', `${cleanName} 已固化至精煉廠`);
            if (navigator.vibrate) navigator.vibrate(10);
        }

        console.log(`✨ [Backlog-Capture] 數據已存入磁區: ${cleanName} [${cleanCat}]`);
        return record.id;

    } catch (err) {
        console.error("❌ [Backlog-Capture-Collapse] 寫入中斷:", err);
        return null;
    }
},

/**
 * 🚀 [Atomic-Recycle] 原子燃料物理回收
 * 任務：從磁區徹底抹除指定的原子數據，釋放儲存空間
 */
async deleteItem(id) {
    // 1. 🛡️ 參數完整性校準
    if (!id) {
        console.warn("⚠️ [Backlog-Recycle] 拒絕執行：未提供有效的原子 ID");
        return false;
    }

    try {
        // 2. 🚀 自動導通：確保磁區已掛載
        if (!dbManager.db) await dbManager.init();

        // 3. 物理抹除指令
        const storeName = dbManager.STORES.BACKLOG;
        
        // 💡 職人原則：在刪除前先確認是否存在 (Debug 追蹤用)
        const target = await dbManager.get(storeName, id);
        if (!target) {
            console.warn(`⚠️ [Backlog-Recycle] 標的物 ${id} 已不存在，無需重複抹除`);
            return true;
        }

        // 執行刪除
        await dbManager.delete(storeName, id);

        // 4. 視覺回饋與診斷記錄
        uiManager.showToast('🗑️', `${target.name} 已從備選磁區回收`);
        console.log(`🧹 [Backlog-Recycle] 物理回收完畢: ${target.name} (${id})`);
        
        return true;

    } catch (err) {
        console.error("🚨 [Backlog-Recycle-Collapse] 物理回收程序中斷:", err);
        uiManager.showToast('⚠️', "磁區回收失敗，請檢查 Debug Console");
        return false;
    }
},

/**
 * 🚀 [Atomic-Injection] 外部燃料注入總線 (V2026.ULTRA 語義對焦版)
 * 任務：從剪貼簿讀取文本，自動識別 [區域][備註] 與自然語言格式，並批量分類注入
 */
async importFuel() {
    console.log("📡 [Backlog-Import] 啟動批量語義注入總線...");

    try {
        // 1. 🚀 物理讀取
        if (!navigator.clipboard) throw new Error("CLIPBOARD_API_UNAVAILABLE");
        const rawText = await navigator.clipboard.readText();
        
        if (!rawText || !rawText.trim()) {
            uiManager.showToast('⚠️', '剪貼簿目前為空');
            return;
        }

        // 2. 🚀 語義發動機點火：將雜亂文本轉化為標準原子燃料
        const sanitizedText = rawText.replace(/[\u200B-\u200D\uFEFF]/g, '').trim();
        const pendingItems = this._parseRawInput(sanitizedText);

        if (pendingItems.length === 0) {
            uiManager.showToast('⚠️', '無法辨識有效的店名或區域燃料');
            return;
        }

        // 3. 🚀 物理寫入：遍歷執行 addRecord 並補強類別參數
        let successCount = 0;
        for (const item of pendingItems) {
            // 💡 職人診斷：調用 addRecord 時傳入解析出的 city, info 與 category
            const result = await this.addRecord(
                item.name, 
                item.city, 
                item.info, 
                item.category
            );
            if (result) successCount++;
        }

        // 4. 視覺與 Haptic 反饋
        uiManager.showToast('🚀', `語義純化完成，匯入 ${successCount} 筆燃料`);
        if (navigator.vibrate) navigator.vibrate([20, 50, 20]);

        // 5. 執行視圖重連
        if (window.App) App.navigateTo('backlog');

    } catch (err) {
        console.error("❌ [Backlog-Import-Collapse] 注入程序斷路:", err);
        uiManager.showToast('💥', "燃料解析異常");
    }
},

/** 🧪 [Internal-Refinery] 語義解析發動機 */
_parseRawInput(text) {
    const lines = text.split('\n').filter(l => l.trim());
    const results = [];

    lines.forEach(line => {
        let city = "未知", name = "", info = "", category = "食"; // 預設屬性

        // 🚀 模式 A：標籤偵測 [區域][備註] 店名
        // 正則解析：匹配所有中括號內容，並抓取剩餘文字作為店名
        const tagMatches = Array.from(line.matchAll(/\[([^\]]+)\]/g));
        
        if (tagMatches.length > 0) {
            city = tagMatches[0][1]; // 第一個中括號視為城市/區域 (例如：博多)
            if (tagMatches.length > 1) {
                // 其餘中括號合併為備註 (例如：近博多駅)
                info = tagMatches.slice(1).map(m => m[1]).join(' | ');
            }
            // 店名為中括號之後的所有剩餘文字
            name = line.replace(/\[([^\]]+)\]/g, '').trim();
        } 
        // 🚀 模式 B：自然語言偵測 "京都 店名"
        else {
            const parts = line.trim().split(/\s+/);
            if (parts.length >= 2) {
                city = parts[0];
                name = parts.slice(1).join(' ');
            } else {
                name = line.trim();
                // 嘗試從當前活躍行程提取預設城市
                city = state.activeTripId ? (state.trips.find(t => t.id === state.activeTripId)?.city || "未知") : "未知";
            }
        }

        // 🚀 模式 C：屬性自動對焦 (Keyword Mapping)
        const nameLower = name.toLowerCase();
        if (name.match(/咖啡|coffee|珈琲|roaster|甜點|cake/i)) category = "食";
        else if (name.match(/站|駅|轉乘|線|airport|巴士/i)) category = "行";
        else if (name.match(/院|醫|診所|clinic/i)) category = "醫";
        else if (name.match(/住|宿|hotel|inn|屋/i)) category = "住";
        else if (name.match(/景|城|跡|公園|寺|社|園/i)) category = "玩";
        else if (name.match(/買|購|商場|百貨|藥妝|shop/i)) category = "購";

        if (name) {
            results.push({ city, name, info, category });
        }
    });

    return results;
},

/**
 * 🚀 [Refinery-Projection] 燃料投射發動機 (V2026.ULTRA 物理對焦修正版)
 */
async projectToDay(targetTripId, dayIndex) {
    // 💡 職人診斷：確保提取的是乾淨的 ID 序列
    const selectedIds = Array.from(this._stagedSelection || []);

    if (selectedIds.length === 0) {
        uiManager.showToast('⚠️', '未選取任何靈感燃料');
        return;
    }

    console.log(`📡 [Backlog-Project] 啟動投射程序 | 序列規模: ${selectedIds.length}`);

    try {
        // 1. 🚀 燃料提取
        const storeName = dbManager.STORES.BACKLOG;
        const allBacklogs = await dbManager.getAll(storeName);
        
        // 🚀 【核心修正】執行雙向型別對焦
        // 💡 職人診斷：強制使用 String(id) 比對，封殺「數字 ID」導致 find 失敗的斷路
        const selectedItems = selectedIds.map(id => {
            const targetId = String(id);
            return allBacklogs.find(item => String(item.id) === targetId);
        }).filter(Boolean); // 排除找不到的髒數據

        // 🛡️ 數據保全校準：若映射後的數量不符，噴出警告
        if (selectedItems.length === 0) throw new Error("FUEL_NOT_FOUND");
        if (selectedItems.length !== selectedIds.length) {
            console.warn(`⚠️ [Project-Loss] 燃料損耗：選取 ${selectedIds.length} 筆，僅導通 ${selectedItems.length} 筆`);
        }

        // 2. 🚀 地理對焦 (以首位燃料為基準)
        const primaryCity = selectedItems[0].city || "日本區域";

        // 3. 🚀 高純度清單合成
        // 💡 確保每一行都包含完整資訊，透過 join('\n') 傳遞給 AI
        const pureItemsList = selectedItems.map(it => {
            const info = it.info ? ` (${it.info})` : '';
            return `${it.name}${info}`;
        }).join('\n');
        
        // 4. 🚀 呼叫指令合成器 (V2.1 版本)
        const refineryPrompt = this._generateRefineryPrompt(primaryCity, pureItemsList);

        // 5. 🚀 物理複製
        if (!refineryPrompt) throw new Error("PROMPT_GEN_FAILED");
        await navigator.clipboard.writeText(refineryPrompt);

        // 6. 🚀 交互與彈窗
        // ... (保持原有的 modalEngine.create 邏輯，但確保顯示的是最新的 selectedItems)
        modalEngine.create('refinery-ready-modal', '🏭 精煉指令已對焦', `
            <div class="space-y-4 py-2">
                <div class="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">預計精煉序列 (共 ${selectedItems.length} 筆)</p>
                    <div class="max-h-[200px] overflow-y-auto space-y-1">
                        ${selectedItems.map((i, idx) => `
                            <div class="text-[11px] font-bold text-slate-700 flex gap-2">
                                <span class="theme-text-pink">${idx + 1}.</span> ${i.name}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="px-1 space-y-2">
                    <p class="text-[11px] font-bold text-slate-600">🚀 指令已封裝至剪貼簿</p>
                    <p class="text-[10px] text-slate-400">前往 AI 貼上即可。若只看到一筆行程，請檢查 ID 型別對焦是否失效。</p>
                </div>
            </div>
        `, `
            <button onclick="App.modalRemove('refinery-ready-modal')" class="w-full py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg">確認接收</button>
        `);

        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

    } catch (err) {
        console.error("❌ [Refinery-Project-Collapse] 投射程序中斷:", err);
        uiManager.showToast('💥', "燃料投射異常");
    }
},


/** 🛰️ [Public] 執行精煉指令複製 (V2026.ULTRA 數據驅動加固版) */
async copyRefineryPrompt(city, idsJson) {
    try {
        // 1. 🚀 優先提領記憶體中的選取 Set (跨頁真值)
        const stagedIds = Array.from(this._stagedSelection || []);
        let targetIds = [];

        // 💡 職人診斷：智感對焦。若 Set 有值則採信 Set；若無（單點複製）則解析傳入參數
        if (stagedIds.length > 0) {
            targetIds = stagedIds;
        } else {
            targetIds = Array.isArray(idsJson) 
                ? idsJson 
                : JSON.parse(String(idsJson || "[]").replace(/&quot;/g, '"'));
        }

        const sids = targetIds.map(id => String(id));
        if (sids.length === 0) return uiManager.showToast('⚠️', "未選取任何靈感燃料");

        // 2. 🚀 內容採集：數據驅動 (封殺 DOM 依賴)
        // 💡 職人診斷：直接向 dbManager 提領全量燃料，確保換頁後依然導通
        const allBacklogs = await dbManager.getAll(dbManager.STORES.BACKLOG);
        const itemsList = sids.map(sid => {
            const found = allBacklogs.find(it => String(it.id) === sid);
            return found ? found.name : "";
        }).filter(n => n !== "").join('\n');

        if (!itemsList) throw new Error("FUEL_NOT_FOUND");

        // 3. 🚀 指令合成
        const prompt = this._generateRefineryPrompt(city, itemsList);

        // 4. 🚀 物理直通特快車道 (封殺總線碰撞)
        // 💡 職人診斷：直接呼叫專屬直通函數，禁止經過 main.js 的 replace 邏輯
        if (window.App && typeof App.copyRefineryDirect === 'function') {
            App.copyRefineryDirect(prompt);
        } else {
            // 備援：直接物理寫入
            await navigator.clipboard.writeText(prompt);
            uiManager.showToast('✨', `全量導通 (${sids.length} 筆)`);
        }

    } catch (e) {
        console.error("📋 [Copy-Collapse] 物理斷路:", e);
        uiManager.showToast('⚠️', "數據路網對焦異常");
    }
},

/** 🧪 [Private] 精煉廠專屬指令合成器 (V2026.ULTRA V2.1 模式對焦版) */
_generateRefineryPrompt(city, itemsList) {
    // 0. 🛡️ 數據完整性預檢
    // 💡 職人診斷：若 itemsList 為空，直接攔截斷路，防止 AI 輸出的空 JSON 導致系統崩潰
    if (!itemsList || itemsList.trim() === "") {
        console.error("🚨 [Prompt-Generator] 燃料清單真空，拒絕合成");
        return "";
    }

    // 🚀 1. 核心焊接：讀取精煉模式
    const refineryMode = localStorage.getItem('tf_refinery_mode') || 'split';
    const isSuite = refineryMode === 'suite';

    // 💡 模式語義分流：強化「全量處理」的暗示，防止 AI 偷懶縮減節點
    const modeInstruction = isSuite 
        ? `【🚀 整合模式：請將以下「所有」項目整合為一個連續時序套裝行程，嚴禁遺漏任何節點，著重動線最佳化。】`
        : `【🚀 單獨模式：請將以下「每個」項目視為獨立節點，分別提供詳盡的數據精煉。】`;

    // 2. 🚀 指令封裝
    // 💡 職人診斷：透過反引號結構化，強制 AI 必須輸出「陣列」格式，且每個節點必須對應原始項目
    return `【STRICT_JSON_ONLY】
你是一位具備實境地理路網數據的精煉專家。請根據「${city}」的實境地理，將以下 ${isSuite ? '全量項目整合' : '逐一項目精煉'} 為高品質行程模組（繁體中文），禁前言。

【📍 待精煉原子燃料 (共計 ${itemsList.split('\n').length} 筆)】
${itemsList}

${modeInstruction}

【🚨 數據保真與重組協定】
1. 🚀 節點保全：輸出之 JSON 陣列長度必須「等於」上述原子燃料的數量，嚴禁合併或刪除景點。
2. 🚀 店名保真：[task] 欄位必須包含原始燃料中的「完整店名/景點全稱」，嚴禁縮寫或改名，以供系統執行「已去過」狀態對焦。
3. 🚀 交通標記：點位間移動必須在 [move] 結尾標註「(⚠️ 需另行執行交通路網精煉)」。
4. 🚀 亮點噴發：[spotlight] 必須提供該點位的「排隊攻略」或「避坑建議」；[expense] 僅限餐飲與門票，使用「純數字」。

【🚨 數據純淨化約束 (禁言清單)】
- 嚴禁提及：功能模組, 語義對焦, 實境應用, 核心零件, 數據純化, 戰術, 打擊, 燃料包, 焊接, 指令集

【輸出範例格式】
[
  {
    "time": "HH:mm",
    "task": "【標題】完整原始店名",
    "move": "建議移動手段 (⚠️ 需另行執行交通路網精煉)",
    "expense": 0,
    "spotlight": "✨亮點/避坑建議",
    "note": "細節備註"
  }
]

請以【純淨 JSON 陣列】格式輸出，禁止前言與結語，嚴禁任何 Markdown 之外的冗餘解釋。`;
},

/** 🏭 [Refinery-Core] 批量存儲原子燃料 */
async addBatchRecords(items) {
    for (const item of items) {
        // 🚀 現在可以直接丟整個 item 物件進去了，不再噴 TypeError
        await this.addRecord(item); 
    }
    console.log(`✅ [Refinery-Weld] 批量燃料灌注完畢`);
},

// ========================
//    靈感小卡讓AI生成
// ========================


/** 🚀 [AI-Recon-Engine] 偵蒐指令合成器 (V2026.ULTRA 動態語義對焦版) */
generateReconPrompt(params) {
    const { basePoint, style, mobility, duration } = params;
    const activeTrip = (window.state && window.state.trips) ? window.state.trips.find(t => t.id === window.state.activeTripId) : null;
    const city = activeTrip ? (activeTrip.city || "日本") : "日本";

    return `【STRICT_RADAR_RECON / VERIFIED_ONLY】
你是一位具備實境地理數據的偵蒐專家。請針對「${city} ${basePoint}」周邊進行半徑掃描。

📍 偵蒐參數：
1. 基準起點：${basePoint}
2. 移動手段：${mobility}
3. 預期時間：${duration}
4. 偏好風格：${style} (此為嚴格閉鎖關鍵字)

🎯 執行協定 (Protocol)：
1. 交叉驗證 (Cross-Check)：必須比對 Google Maps 業者標籤。嚴禁僅憑店名通靈。
2. 品類閉鎖 (Category Lock)：僅限提供符合「${style}」實體菜單或服務的業者。若為甜點店、咖啡廳或與風格不符者，嚴禁吸入數據包。
3. 物理對焦 (Dynamic Radius)：請根據「${mobility}」與「${duration}」自動演算合理的物理半徑。例如：步行 15min 應鎖定約 1km 內；搭車 10min 應擴散至約 3-5km 內。

🎯 輸出指令：
搜尋周邊 3-5 個優質節點，直接以【靈感區 JSON 陣列】格式輸出。
- [info] 欄位格式：「${mobility}約 ${duration} | 距離${basePoint}約 XXX m」。
- [category] 欄位：請根據業者類型精確歸類為「食/玩/購/行/住」。
- 嚴禁 Markdown 之外的文字。

【輸出範例格式】
[
  { "name": "店名", "city": "${city}", "category": "食", "info": "${mobility}約 ${duration} | 距離${basePoint}約 450m" }
]`;
},

/** 📋 [AI-Recon-Copy] 執行指令封裝複製 (100% 避開正則語法風險版) */
copyReconPrompt() {
    const params = {
        basePoint: document.getElementById('recon-base')?.value.trim() || "",
        style: document.getElementById('recon-style')?.value.trim() || "隨機推薦",
        mobility: document.getElementById('recon-mobility')?.value.trim() || "步行",
        duration: document.getElementById('recon-duration')?.value.trim() || "10 分鐘"
    };

    if (!params.basePoint) return uiManager.showToast('⚠️', '請設定基準起點');

    const promptText = this.generateReconPrompt(params);
    
    try {
        // 🚀 核心焊接：改用「純字串物理對焦」取代 RegExp，徹底解決 SyntaxError
        // 💡 職人診斷：使用 encodeURIComponent 後接 Uint8Array 處理法，確保中文與特殊字元不失真
        const utf8Encoder = new TextEncoder();
        const utf8Array = utf8Encoder.encode(promptText);
        
        // 將二進位數據轉為 Base64 字串，不使用任何帶有斜線的正則處理
        let binary = '';
        const bytes = new Uint8Array(utf8Array);
        const len = bytes.byteLength;
        for (let i = 0; i < len; i++) {
            binary += String.fromCharCode(bytes[i]);
        }
        
        const safePrompt = btoa(binary);
        
        // 執行導通 (請確保 App 層級已定義 copyToClipboard)
        if (window.App && typeof window.App.copyToClipboard === 'function') {
            window.App.copyToClipboard(safePrompt);
        } else {
            navigator.clipboard.writeText(safePrompt);
        }
        
        uiManager.showToast('✨', '偵蒐指令已封裝複製');
    } catch (e) {
        console.error("🚨 [Recon-Copy-Crash] 數據封裝中斷:", e);
        uiManager.showToast('💥', '封裝協定斷路');
    }
},

/** 💾 [AI-Recon-Save] 注入 AI 偵蒐燃料 (數據自癒版) */
async saveReconFuel() {
    const inputArea = document.getElementById('recon-json-input');
    if (!inputArea) return;
    
    const rawInput = inputArea.value.trim();
    try {
        // 物理洗滌：洗掉 Markdown 的噪訊
        const sanitized = rawInput
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim();
            
        const items = JSON.parse(sanitized);
        if (!Array.isArray(items)) throw new Error("FORMAT_ERROR");

        let count = 0;
        for (const item of items) {
            // 透過 addRecord 執行原子組裝
            const id = await this.addRecord(item);
            if (id) count++;
        }

        uiManager.showToast('🚀', `偵蒐完畢，注入 ${count} 筆靈感`);
        
        if (window.App && typeof window.App.modalRemove === 'function') {
            window.App.modalRemove('ai-recon-modal');
            window.App.navigateTo('backlog');
        }
    } catch (e) {
        console.error("❌ [Recon-Fuel-Collapse]:", e);
        uiManager.showToast('❌', '燃料格式異常');
    }
},

// ========================
//    靈感小卡匯出與匯入
// ========================

/** 🚀 [Atomic-Export] 靈感燃料匯出引擎 */
async exportTargetBacklogs(selectedIds) {
    if (!selectedIds || selectedIds.length === 0) return uiManager.showToast('⚠️', '請選取匯出目標');

    try {
        const storeName = dbManager.STORES.BACKLOG;
        const allBacklogs = await dbManager.getAll(storeName);
        
        // 1. 執行脫敏與純化 (移除 ID，保留核心燃料)
        const exportData = selectedIds.map(id => {
            const item = allBacklogs.find(it => it.id === id);
            return item ? {
                name: item.name,
                city: item.city,
                category: item.category,
                info: item.info
            } : null;
        }).filter(Boolean);

        // 2. 執行物理複製 (純 JSON 格式以利閱讀)
        await navigator.clipboard.writeText(JSON.stringify(exportData, null, 2));
        uiManager.showToast('📤', `已封裝 ${exportData.length} 筆燃料至剪貼簿`);
        App.modalRemove('backlog-export-modal');

    } catch (err) {
        uiManager.showToast('💥', '匯出協定斷路');
    }
},

/** 🚀 [Atomic-Import] 靈感燃料吸入引擎 */
async importBacklogFuel() {
    const jsonInput = document.getElementById('import-json-payload')?.value.trim();
    if (!jsonInput) return uiManager.showToast('⚠️', '請貼入燃料數據');

    try {
        const items = JSON.parse(jsonInput);
        if (!Array.isArray(items)) throw new Error("FORMAT_ERROR");

        let count = 0;
        for (const item of items) {
            // 自動觸發標籤自癒協定
            const id = await this.addRecord(item);
            if (id) count++;
        }

        uiManager.showToast('🚀', `成功吸入 ${count} 筆新燃料`);
        App.modalRemove('backlog-import-modal');
        App.navigateTo('backlog');

    } catch (err) {
        uiManager.showToast('❌', '數據格式異常');
    }
  }
};

// 🚀 執行末端強制焊接 (確保 ESM 環境下 window 依然導通)
if (typeof window !== 'undefined') window.backlogManager = backlogManager;