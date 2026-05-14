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

/** 💉 [Atomic-Clear] 強制清空選取緩存與物理磁區 */
clearSelection() {
    this._stagedSelection.clear();

    try {
        localStorage.removeItem('tf_staged_selection');
        console.log("🧹 [Backlog-Selection] 記憶體與物理磁區已同步釋放");
    } catch (e) {
        console.error("🚨 [Storage-Wipe-Collapse] 物理磁區清理失敗:", e);
    }

    // 🚀 [新增] 重置所有卡片的選取視覺狀態
    document.querySelectorAll('.backlog-card').forEach(card => {
        card.style.border = '1px solid #E2E8F0';
        card.style.background = 'white';
        card.style.boxShadow = 'none';
        card.style.transform = 'translateY(0)';
    });

    if (window.App) {
        App.modalRemove('selection-manager-modal');
        const isManagerOpen = !!document.getElementById('selection-manager-modal');
        if (isManagerOpen) {
            App.navigateTo('backlog');
        }
    }

    if (typeof viewEngine !== 'undefined' && viewEngine.updateRefineryFAB) {
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

/** 🧪 [Private] 精煉廠專屬指令合成器 (V2026.ULTRA V2.2) */
_generateRefineryPrompt(city, itemsList) {
    if (!itemsList || itemsList.trim() === "") {
        console.error("🚨 [Prompt-Generator] 燃料清單真空，拒絕合成");
        return "";
    }

    const refineryMode = localStorage.getItem('tf_refinery_mode') || 'split';
    const isSuite = refineryMode === 'suite';

    const modeInstruction = isSuite
        ? `【整合模式：請將以下「所有」項目整合為一個連續時序套裝行程，嚴禁遺漏任何節點，著重動線最佳化。】`
        : `【單獨模式：請將以下「每個」項目視為獨立節點，分別提供詳盡資料。】`;

    return `【STRICT_JSON_ONLY】
你是具備實境地理數據的旅遊規劃專家。請根據「${city}」，將以下項目精煉為高品質行程模組（繁體中文），禁前言。

【待精煉清單（共 ${itemsList.split('\n').length} 筆）】
${itemsList}

${modeInstruction}

【輸出規範】
1. 節點保全：JSON 陣列長度必須等於上述清單數量，嚴禁合併或刪除。
2. 店名保真：[task] 必須包含完整原始店名/景點全稱，嚴禁縮寫。
3. 交通欄位：[move] 只需寫交通方式與時間（如：搭地鐵約8分鐘），不加任何附加說明文字。
4. 費用欄位：[expense] 僅限餐飲與門票，純數字日圓，無費用填 0。
5. 停留時間：[duration] 建議停留分鐘數，純數字（如：90 代表 90 分鐘）。
6. 亮點欄位：[spotlight] 提供排隊攻略或避坑建議（1-2句）。

【輸出格式】
[
  {
    "time": "HH:mm",
    "task": "完整原始店名/景點全稱",
    "move": "交通方式（如：步行約5分鐘）",
    "duration": 90,
    "expense": 0,
    "spotlight": "✨ 避坑或亮點建議",
    "note": "細節備註"
  }
]

請以純淨 JSON 陣列輸出，禁止前言與結語。`;
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


generateReconPrompt(params) {
    const { basePoint, style, mobility, duration } = params;
    const activeTrip = (window.state && window.state.trips) ? window.state.trips.find(t => t.id === window.state.activeTripId) : null;
    const city = activeTrip ? (activeTrip.city || "日本") : "日本";

    // 🚀 [新增] 去重排除清單：讀取記憶體中現有靈感名稱
    let exclusionBlock = '';
    if (this.items && this.items.length > 0) {
        const existingNames = this.items.map(it => it.name).filter(Boolean);
        if (existingNames.length > 0) {
            exclusionBlock = `
⚠️ 排除協定（以下地點已存在於靈感區，嚴禁推薦）：
${existingNames.map(n => `- ${n}`).join('\n')}
`;
        }
    }

    return `【STRICT_RADAR_RECON / VERIFIED_ONLY】
你是具備實境地理數據的旅遊專家。請針對「${city} ${basePoint}」周邊進行掃描。

📍 搜尋參數：
- 基準起點：${basePoint}
- 移動方式：${mobility}
- 預期時間：${duration}
- 偏好風格：${style}
${exclusionBlock}
🎯 搜尋協定：
1. 真實驗證：只提供 Google Maps 上可查到的實體業者，每筆必須附上 Google Maps 評分作為驗證依據。
2. 品類精準：只提供符合「${style}」的業者，不符風格者（如甜點店/咖啡廳）排除。
3. 距離計算：根據「${mobility}」與「${duration}」自動計算合理半徑（步行15分鐘≈1km；搭車10分鐘≈3-5km）。
4. 去重檢查：排除協定中的地點一律禁止出現在結果中。

🎯 輸出：搜尋周邊 3-5 個優質節點，以 JSON 陣列格式輸出，禁止前言。

【輸出格式】
[
  {
    "name": "店名",
    "city": "${city}",
    "category": "食",
    "info": "${mobility}約${duration} | 距${basePoint}約 450m",
    "rating": 4.2,
    "price_range": "¥800-1500",
    "hours": "11:00-21:00（週二公休）"
  }
]

- [category] 只能是：食/玩/購/行/住/景/史/泉/醫 其中之一。
- [rating] 為 Google Maps 評分，純數字，無法確認填 0。
- [price_range] 為人均消費範圍，無法確認填 ""。
- [hours] 為營業時間，無法確認填 ""。
- 禁止 Markdown 之外的文字。`;
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

async saveReconFuel() {
    const inputArea = document.getElementById('recon-json-input');
    if (!inputArea) return;
    
    const rawInput = inputArea.value.trim();
    try {
        const sanitized = rawInput
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .trim();
            
        const items = JSON.parse(sanitized);
        if (!Array.isArray(items)) throw new Error("FORMAT_ERROR");

        // 🚀 [新增] 二次去重保險：對比現有 items 名稱
        const existingNames = new Set(
            (this.items || []).map(it => it.name?.trim().toLowerCase())
        );

        const duplicates = [];
        const toImport = items.filter(item => {
            const key = item.name?.trim().toLowerCase();
            if (existingNames.has(key)) {
                duplicates.push(item.name);
                return false;
            }
            return true;
        });

        // 🚀 [新增] 有重複時給使用者感知
        if (duplicates.length > 0) {
            console.log(`⚠️ [Recon-Dedup] 跳過重複: ${duplicates.join(', ')}`);
            uiManager.showToast('ℹ️', `已跳過 ${duplicates.length} 筆重複：${duplicates.slice(0, 2).join('、')}${duplicates.length > 2 ? '...' : ''}`);
        }

        if (toImport.length === 0) {
            uiManager.showToast('⚠️', '所有項目皆已存在於靈感區');
            return;
        }

        let count = 0;
        for (const item of toImport) {
            const id = await this.addRecord(item);
            if (id) count++;
        }

        uiManager.showToast('🚀', `偵蒐完畢，注入 ${count} 筆靈感${duplicates.length > 0 ? `（跳過 ${duplicates.length} 筆重複）` : ''}`);
        
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
  },

/** 🤖 [AI-Planner] 多日行程分配 Prompt 生成器 */
_generateDayPlannerPrompt(trip, selectedCards, settings) {
    const { depType, customDep, cardLimit, daysMode, pace, spreadMode } = settings;

    // 🚀 1. 建立每天對應飯店查詢表
    const hotelByDay = {};
    (trip.hotels || []).forEach(hotel => {
        (hotel.days || []).forEach(d => {
            hotelByDay[d] = hotel.name;
        });
    });

    // 🚀 2. 航班偵測
    const transport = trip.transport || [];
    const arrivalFlight = transport.find(t => t.day === 1 && t.arrPort);
    const totalDays = trip.days?.length || 5;
    const departureFlight = transport.find(t => t.day === totalDays && t.depPort);

    let arrivalNote = '';
    let departureNote = '';

    if (arrivalFlight) {
        const arrTime = arrivalFlight.arrTime || '';
        const arrPort = arrivalFlight.arrPort || '機場';
        const carrier = arrivalFlight.carrier || '';
        const code = arrivalFlight.code || '';
        arrivalNote = `
【入境航班】
航班：${carrier} ${code}，${arrivalFlight.depPort || ''} ${arrivalFlight.depTime || ''} → ${arrPort} ${arrTime}
⚠️ Day 1 注意：落地後需入境審查＋領行李＋交通至市區，預計抵達飯店時間約 ${arrTime} 起算 2 小時後。請將 Day 1 景點安排在下午以後，行程宜輕鬆。`;
    }

    if (departureFlight) {
        const depTime = departureFlight.depTime || '';
        const depPort = departureFlight.depPort || '機場';
        const carrier = departureFlight.carrier || '';
        const code = departureFlight.code || '';
        const [h, m] = depTime.split(':').map(Number);
        const airportH = h - 3;
        const airportTime = `${String(airportH).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        departureNote = `
【離境航班】
航班：${carrier} ${code}，${depPort} ${depTime} → ${departureFlight.arrPort || ''} ${departureFlight.arrTime || ''}
⚠️ Day ${totalDays} 注意：需於 ${airportTime} 前抵達 ${depPort}（班機前 3 小時），請將當天景點安排在上午且靠近機場動線，行程宜輕鬆簡短。`;
    }

    // 🚀 3. 起訖點邏輯
    let depSection = '';
    if (depType === 'hotel' && Object.keys(hotelByDay).length > 0) {
        const dayLines = Array.from({ length: totalDays }, (_, idx) => {
            const dayNum = idx + 1;
            const todayHotel = hotelByDay[dayNum];
            const nextHotel = hotelByDay[dayNum + 1];
            if (!todayHotel) return `Day ${dayNum}：無飯店限制`;
            if (nextHotel && nextHotel !== todayHotel) {
                return `Day ${dayNum}：從「${todayHotel}」出發，晚上移動至「${nextHotel}」（換住，請安排動線順路）`;
            }
            return `Day ${dayNum}：從「${todayHotel}」出發，晚上回「${todayHotel}」`;
        }).join('\n');
        depSection = `依各天飯店位置規劃動線：\n${dayLines}`;
    } else if (depType === 'custom' && customDep) {
        depSection = `每天從「${customDep}」出發，最後回到「${customDep}」`;
    } else {
        depSection = `由 AI 依地理位置自動規劃最佳動線，不限定起訖點`;
    }

    // 🚀 4. 天數邏輯
    let daysInstruction = '';
    if (daysMode === 'full') {
        daysInstruction = `完整 ${totalDays} 天（每天都要有行程規劃，即使景點已排完仍需說明當天建議安排或自由時間）`;
    } else if (daysMode === 'hotel') {
        const checkInOutNotes = [];
        (trip.hotels || []).forEach(hotel => {
            const days = hotel.days || [];
            if (days.length > 0) {
                checkInOutNotes.push(`${hotel.name}：Day ${days[0]} check-in，Day ${days[days.length - 1]} check-out（即前 ${days[days.length - 1] - 1} 天晚上住此飯店，Day ${days[days.length - 1]} 早上退房後仍可安排行程）`);
            }
        });
        daysInstruction = `完整 ${totalDays} 天，飯店 check-in / check-out 資訊：\n${checkInOutNotes.join('\n')}`;
    } else {
        daysInstruction = `僅排中間有效天數（排除第一天抵達和最後一天離開），實際約 ${Math.max(totalDays - 2, 1)} 天`;
    }

    // 🚀 5. 節奏
    const paceMap = {
        '1': { label: '寬鬆', desc: '每天最多 2-3 個景點，留有大量自由時間' },
        '2': { label: '舒適', desc: `每天最多 ${cardLimit} 個景點，保留足夠移動時間與用餐休息` },
        '3': { label: '緊湊', desc: `每天最多 ${cardLimit} 個景點，行程充實緊湊` }
    };
    const paceInfo = paceMap[String(pace)] || paceMap['2'];

// 🚀 6. 小卡清單（含去重防禦）
    const seenNames = new Set();
    const deduplicatedCards = selectedCards.filter(c => {
        const key = c.name?.trim().toLowerCase();
        if (!key || seenNames.has(key)) return false;
        seenNames.add(key);
        return true;
    });

    const skippedCount = selectedCards.length - deduplicatedCards.length;
    if (skippedCount > 0) {
        console.warn(`⚠️ [DayPlanner-Dedup] 偵測到 ${skippedCount} 筆重複小卡，已自動排除`);
    }

const cardList = deduplicatedCards.map(c => {
    const isMust = settings.mustGoIds?.has(c.id);
    return `- ID:${c.id} | 名稱:${c.name}${c.info ? ` (${c.info})` : ''} | 分類:${c.category} | 城市:${c.city}${isMust ? ' | ⭐ 必去（禁止列入 unscheduled）' : ''}`;
}).join('\n');

    // 🚀 7. 分類平衡指令（疊加，非互斥）
    const spreadInstruction = spreadMode
        ? `12. 【分類平衡】在地理動線允許的前提下，同一天的 [cards] 中相同分類不得超過 1 個（例如同天不得有 2 間咖啡廳、2 個神社、2 間餐廳）。請優先以地理位置分區決定哪些景點同天，再於同區內將同類景點拆分至不同天。若同區內同類景點實在無法拆分（如整趟行程都在右京區），則以時段錯開為優先，並在 [note] 說明原因。`
        : '';

    return `【STRICT_JSON_ONLY】
你是專業旅遊行程規劃師，請將以下景點卡片合理分配到行程，輸出純 JSON，禁止前言與結語。
${arrivalNote}${departureNote}

【旅遊資訊】
目的地：${trip.city || '日本'}
天數：${daysInstruction}
起訖點：${depSection}
行程節奏：${paceInfo.label}（${paceInfo.desc}）
每天上限：${cardLimit} 個景點

【景點卡片清單（共 ${deduplicatedCards.length} 筆）】
${cardList}

【規劃原則】
1. 每天都必須有規劃，景點排完仍需說明當天安排（自由購物、前往機場等），寫在 [note] 欄位。
2. 依地理位置將相近景點安排在同一天，減少往返。
3. 每天景點數不超過 ${cardLimit} 個。
4. 考量飯店位置，將靠近飯店的景點安排在當天首尾。
5. 換住當天，動線從舊飯店往新飯店方向移動。
6. check-out 當天退房後仍可安排景點。
7. 放不下的景點列入 unscheduled 並說明原因。
8. 節奏為${paceInfo.label}：${paceInfo.desc}。
9. 餐食處理：禁止在 [cards] 陣列中加入非清單內的 ID，用餐時段建議請寫在 [note] 欄位。
10. [theme] 必須使用繁體中文，10字以內。
11. [cards] 每筆請附上建議訪問時間。${spreadInstruction ? `\n${spreadInstruction}` : ''}
12. 標記「⭐ 必去」的景點必須排入 [cards]，絕對禁止列入 unscheduled，即使需要調整其他景點的天數分配也必須優先保障。

【輸出格式】
{
  "days": [
    {
      "day": 1,
      "theme": "繁體中文主題（10字內）",
      "note": "動線說明與用餐建議",
      "cards": [
        { "id": "card_id_1", "suggested_time": "09:00" },
        { "id": "card_id_2", "suggested_time": "11:30" }
      ]
    }
  ],
  "unscheduled": [
    { "id": "card_id", "name": "景點名稱", "reason": "未排入原因" }
  ]
}`;
}

};

// 🚀 執行末端強制焊接 (確保 ESM 環境下 window 依然導通)
if (typeof window !== 'undefined') window.backlogManager = backlogManager;