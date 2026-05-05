import { dbManager } from './dbManager.js';
import { uiManager } from './uiManager.js';

/**
 * 🏭 BACKLOG MANAGER (行程精煉廠 - V2026.ULTRA)
 * 負責備選行程的採集、固化與 AI 焊接
 */
export const backlogManager = {


/**
 * 🚀 [Sector-Ignition] 磁區預熱發動機
 * 任務：確保 BACKLOG 磁區導通，並執行數據完整性校準
 */
async init() {
    console.log("🏭 [Backlog-Refinery] 啟動精煉廠點火程序...");

    try {
        // 1. 🚀 自動點火補償：確保 dbManager 已就緒
        if (!dbManager.db) {
            await dbManager.init();
        }

        // 2. 🛡️ 磁區通路驗證
        const storeName = dbManager.STORES.BACKLOG;
        if (!dbManager.db.objectStoreNames.contains(storeName)) {
            console.error(`❌ [Backlog-Ignition] 磁區 ${storeName} 缺失，發動機斷路。`);
            return false;
        }

        // 3. 🧹 數據完整性掃描 (物理洗滌)
        // 提取所有原子燃料進行健康檢查
        const records = await dbManager.getAll(storeName);
        
        // 🚀 職人級診斷：檢查是否有遺漏 ID 或 City 的殘次品
        const brokenCount = records.filter(r => !r.id || !r.city).length;
        if (brokenCount > 0) {
            console.warn(`⚠️ [Backlog-Sanitize] 偵測到 ${brokenCount} 筆原子燃料損壞，建議執行磁區重整。`);
        }

        console.log(`🏁 [Backlog-Ignition] 發動機對焦完畢 | 現有燃料: ${records.length} 單位`);
        return true;

    } catch (err) {
        console.error("🚨 [Backlog-Ignition-Collapse] 點火程序墜毀:", err);
        return false;
    }
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
 * 🚀 [Sector-Extraction] 原子燃料提取器
 * 任務：從磁區提取所有原子數據，並執行時間序列對焦（倒序）
 */
async loadAll() {
    // 1. 🚀 自動導通：確保磁區已導通
    if (!dbManager.db) await this.init();

    try {
        // 2. 物理搬運：從 BACKLOG 磁區提取全量數據
        const storeName = dbManager.STORES.BACKLOG;
        const rawRecords = await dbManager.getAll(storeName);

        // 🛡️ 數據真空檢查
        if (!Array.isArray(rawRecords)) return [];

        // 3. 🚀 時間序列對焦 (Sorting)
        // 💡 職人原則：最新採集的靈感（店名/景點）應具備最高的視認性
        const sortedRecords = rawRecords.sort((a, b) => {
            const timeA = a.createdAt || 0;
            const timeB = b.createdAt || 0;
            return timeB - timeA; // 降序排列：最新在前
        });

        console.log(`📡 [Backlog-Load] 原子燃料搬運完畢 | 總計: ${sortedRecords.length} 單位`);
        return sortedRecords;

    } catch (err) {
        console.error("❌ [Backlog-Load-Collapse] 燃料提取中斷:", err);
        return [];
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
 * 🚀 [Refinery-Projection] 燃料投射發動機
 * 任務：提取選中原子燃料，合成對焦最高指令的 AI Prompt
 */
async projectToDay(selectedIds, targetTripId, dayIndex) {
    if (!selectedIds || selectedIds.length === 0) {
        uiManager.showToast('⚠️', '未選取任何靈感燃料');
        return;
    }

    console.log(`📡 [Backlog-Project] 啟動投射程序 | 數量: ${selectedIds.length} | Day ${dayIndex + 1}`);

    try {
        // 1. 🚀 燃料提取
        const storeName = dbManager.STORES.BACKLOG;
        const allBacklogs = await dbManager.getAll(storeName);
        // 💡 職人修正：確保按照選取順序或 ID 順序提取，這裡維持選取順序的邏輯感
        const selectedItems = selectedIds.map(id => allBacklogs.find(item => item.id === id)).filter(Boolean);

        if (selectedItems.length === 0) throw new Error("FUEL_NOT_FOUND");

        // 2. 🚀 地理對焦
        const primaryCity = selectedItems[0].city || "日本區域";

        // 3. 🚀 高純度清單合成 (去除冗餘標籤，僅提供店名與備註供 Prompt 二次編號)
        const pureItemsList = selectedItems.map(it => `${it.name}${it.info ? ` (${it.info})` : ''}`).join('\n');
        
        // 4. 🚀 呼叫最高協定指令合成器
        const refineryPrompt = this._generateRefineryPrompt(primaryCity, pureItemsList);

        // 5. 🚀 物理複製
        await navigator.clipboard.writeText(refineryPrompt);

        // 6. 🚀 交互與 Haptic 反饋
        modalEngine.create('refinery-ready-modal', '🏭 精煉指令已對焦', `
            <div class="space-y-4 py-2">
                <div class="p-4 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-inner">
                    <p class="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">預計精煉序列</p>
                    <div class="space-y-1">
                        ${selectedItems.map((i, idx) => `
                            <div class="text-[11px] font-bold text-slate-700 flex gap-2">
                                <span class="theme-text-pink">${idx + 1}.</span> ${i.name}
                            </div>
                        `).join('')}
                    </div>
                </div>
                <div class="px-1 space-y-2">
                    <p class="text-[11px] font-bold text-slate-600">🚀 高品質指令已成功複製至剪貼簿</p>
                    <p class="text-[10px] text-slate-400 leading-relaxed">
                        請前往 AI (Gemini/GPT) 直接貼上。生成的 JSON 將自動標註「⚠️ 交通斷點」，方便後續執行交通路網精煉。
                    </p>
                </div>
            </div>
        `, `
            <button onclick="App.modalRemove('refinery-ready-modal')" class="w-full py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">確認接收</button>
        `);

        if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

    } catch (err) {
        console.error("❌ [Refinery-Project-Collapse] 投射程序中斷:", err);
        uiManager.showToast('💥', "燃料投射異常");
    }
},

/** 🛰️ [Public] 執行精煉指令複製 (V2026.ULTRA 物理導通版) */
copyRefineryPrompt(city, idsJson) {
    try {
        // 1. 🚀 數據解析：將傳入的 JSON 字串轉回 ID 陣列
        const ids = JSON.parse(idsJson.replace(/&quot;/g, '"'));
        
        // 2. 🚀 內容採集：從 DOM 中提取選中項目的名稱
        // 💡 職人診斷：確保提取的是 h3 內的純淨店名
        const itemsList = ids.map(id => {
            const card = document.getElementById(`card-${id}`);
            return card ? card.querySelector('h3').innerText.trim() : "";
        }).filter(name => name !== "").join('\n');

        // 3. 🚀 指令合成
        const prompt = this._generateRefineryPrompt(city, itemsList);

        // 4. 🚀 執行實體複製 (Physical Copy)
        // 💡 採用 Base64 封裝協定確保特殊字元不失真
        const safePrompt = btoa(encodeURIComponent(prompt).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode('0x' + p1);
        }));
        
        // 呼叫 App 層級的剪貼簿工具 (請確保 App.copyToClipboard 已定義)
        App.copyToClipboard(safePrompt);

        // 5. 🚀 狀態反饋
        const mode = localStorage.getItem('tf_refinery_mode') || 'split';
        const modeLabel = mode === 'suite' ? '整合套裝' : '單獨精煉';
        
        uiManager.showToast('✨', `指令已複製 (${modeLabel})`);
        
        if (navigator.vibrate) navigator.vibrate(15);

    } catch (e) {
        console.error("📋 [Copy-Error] 指令複製失敗:", e);
        uiManager.showToast('⚠️', "指令磁區損毀，請重新選取");
    }
},

/** 🧪 [Private] 精煉廠專屬指令合成器 (V2026.ULTRA V2.0 模式對焦版) */
_generateRefineryPrompt(city, itemsList) {
    // 🚀 核心焊接：讀取磁區中的精煉模式設定
    const refineryMode = localStorage.getItem('tf_refinery_mode') || 'split';
    const isSuite = refineryMode === 'suite';

    // 💡 模式語義分流
    const modeInstruction = isSuite 
        ? `【🚀 整合模式：請將所有項目整合為一個具備連續時序的套裝行程，著重於點位間的銜接感與動線最佳化。】`
        : `【🚀 單獨模式：請將每個項目視為獨立節點，分別提供詳盡的 SPOTLIGHT 與備註。】`;

    return `【STRICT_JSON_ONLY】
請根據「${city}」的實境地理，將以下原子燃料優化為高品質行程模組（繁體中文），禁前言。

【📍 待精煉原子燃料】
${itemsList}

${modeInstruction}

【🚨 數據保真與重組協定】
1. 🚀 店名保真：[task] 欄位必須包含原始燃料中的「店名/景點全稱」，嚴禁自行縮寫，以確保系統數據對應反灰標記。
2. 🚀 動線重組：請根據地理鄰近性重新編排時間序列，確保行程不走回頭路。
3. 🚀 交通標記：若點位間需要搭乘「大眾運輸」，請務必在 [move] 欄位結尾加上「(⚠️ 需另行執行交通路網精煉)」。
4. 🚀 亮點噴發：[spotlight] 必須包含「實質避坑建議」；[expense] 僅限餐飲與門票，使用純數字。

【🚨 負面約束：若出現以下詞彙，視為數據污染，將導致解析失敗】
- 禁止詞彙：功能模組, 語義對焦, 實境應用, 核心零件, 數據純化, 戰術, 打擊, 燃料包

【輸出範例格式】
[
  {
    "time": "HH:mm",
    "task": "【標題】完整原始店名",
    "move": "建議移動手段/月台資訊 (⚠️ 需另行執行交通路網精煉)",
    "expense": 數字,
    "spotlight": "✨必看亮點/避坑指南/排隊攻略",
    "note": "細節備註"
  }
]

請以【純淨 JSON 陣列】格式輸出，禁止前言，嚴禁 Markdown 之外的任何文字。`;
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


/** 🚀 [AI-Recon-Engine] 偵蒐指令合成器 (V2026.ULTRA 自由語義對焦版) */
generateReconPrompt(params) {
    const { basePoint, style, mobility, duration } = params;
    const activeTrip = (window.state && window.state.trips) ? window.state.trips.find(t => t.id === window.state.activeTripId) : null;
    const city = activeTrip ? (activeTrip.city || "日本") : "日本";

    return `【STRICT_RADAR_RECON】
你是一位具備實境地理數據的偵蒐專家。請針對「${city} ${basePoint}」周邊進行半徑掃描。

📍 偵蒐參數：
1. 基準起點：${basePoint}
2. 移動手段：${mobility}
3. 預期時間：${duration}
4. 偏好風格：${style}

🎯 輸出指令：
請根據上述條件（特別是「${mobility}」與「${duration}」對應的物理半徑），搜尋周邊 3-5 個優質節點，直接以【靈感區 JSON 陣列】格式輸出。
- [info] 欄位必須改寫為：「${mobility}約 ${duration} | 距離${basePoint}約 XXX m」。
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