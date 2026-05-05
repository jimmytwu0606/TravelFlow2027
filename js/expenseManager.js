import { viewEngine } from './viewEngine.js';
import { dbManager } from './dbManager.js';
import { EXCHANGE_CONFIG } from './config.js';
import { uiManager } from './uiManager.js';


/**
 * 💰 EXPENSE MANAGER (開銷清算發動機)
 */
export const expenseManager = {

    rates: null,
    lastUpdate: 0,

    // 視覺色彩協定
    COLORS: {
        transport: '#38bdf8', // 交通
        itinerary: '#4ade80', // 行程
        shopping:  '#fb7185'  // 購物
    },

/** 🚀 點火：獲取最新匯率燃料 */
    async fetchRates() {
        const now = Date.now();
        // 🛡️ 緩存保護：6 小時內不重複抓取
        if (this.rates && (now - this.lastUpdate < 21600000)) return this.rates;

        try {
            console.log("📡 [Expense-Sync] 正在抓取最新匯率...");
            const response = await fetch(`${EXCHANGE_CONFIG.API_URL}${EXCHANGE_CONFIG.BASE_CURRENCY}`);
            const data = await response.json();
            
            if (data.result === "success") {
                this.rates = data.rates;
                this.lastUpdate = now;
                console.log("✅ [Expense-Sync] 匯率對焦成功");
                return this.rates;
            }
        } catch (err) {
            console.error("❌ [Expense-Error] 匯率抓取墜毀:", err);
            uiManager.showToast('⚠️', '無法取得即時匯率');
            return null;
        }
    },

    /** 🧮 換算邏輯：物理導通換算數字 */
    convert(amount, fromCurrency) {
        if (!this.rates || !this.rates[fromCurrency]) return amount;
        // 公式：外幣 / 該幣對母幣匯率 = 母幣金額
        // 注意：API 是以 TWD 為 1 的話，換算為 amount / rates[fromCurrency]
        const rate = this.rates[fromCurrency];
        return Math.round(amount / rate); 
    },

/** 🚀 全域採集與清算：V2026.ULTRA 數據重心移位版 */
getStats(trip) {
    if (!trip) return null;

    const stats = {
        transport: 0,
        itinerary: 0,
        shopping: 0,
        grandTotal: 0,
        totalTWD: 0 
    };

    // 🚀 1. 物理掃描：每日排程節點 (解析 AI 燃料並對焦購物嫁接)
    trip.days?.forEach(day => {
        day.schedules?.forEach(item => {
            let fuelCost = 0;
            const currency = item.currency || 'JPY';

            // 🎯 關鍵路徑：如果風格為 shopping，走專屬購物解析發動機
            if (item.style === 'shopping') {
                fuelCost = this.parseShoppingNodeCost(item.memo);
                stats.shopping += fuelCost;
            } else {
                // 否則走一般行程/交通燃料解析
                fuelCost = this.parseFuelCost(item.memo);
                if (item.style === 'transport') {
                    stats.transport += fuelCost;
                } else if (item.style === 'json') {
                    stats.itinerary += fuelCost;
                }
            }

            if (fuelCost <= 0) return;

            // 🎯 匯率對焦母幣
            const costTWD = (currency === 'TWD') ? fuelCost : this.convert(fuelCost, currency);
            stats.totalTWD += costTWD;
        });
    });

    // 🚀 2. 物理掃描：全域交通軌道 (維持不變：處理航班與大宗成本)
    if (Array.isArray(trip.transport)) {
        trip.transport.forEach(f => {
            const fCost = Number(f.cost || 0);
            if (fCost <= 0) return;

            const currency = f.currency || 'JPY';
            stats.transport += fCost;
            stats.totalTWD += (currency === 'TWD') ? fCost : this.convert(fCost, currency);
        });
    }

    // 🚀 3. 物理斷路：取消來自購物車軌道 (trip.shopping) 的清算
    // 💡 職人診斷：為了確保數據唯一性，購物車內容僅作為清單，不計入財務總額。
    /* 原本此處對 trip.shopping 的掃描已移除，封殺重複計算風險。
    */

    // 最終物理匯流
    stats.grandTotal = stats.transport + stats.itinerary + stats.shopping;
    
    console.log(`📊 [Expense-Final] 清算完畢: 原幣 ¥${stats.grandTotal} / 母幣 $${stats.totalTWD}`);
    return stats;
},

/** 🛍️ [Sub-Engine] 解析行程端購物節點的實體開銷 */
parseShoppingNodeCost(memo) {
    if (!memo || typeof memo !== 'string') return 0;
    try {
        const sanitized = memo.replace(/```json|```/g, '').trim();
        const products = JSON.parse(sanitized);
        const items = Array.isArray(products) ? products : [products];
        
        return items.reduce((acc, p) => {
            // 優先計算 (單價 * 數量)，若無則嘗試解析 expense 字串
            const price = Number(p.price) || 0;
            const qty = Number(p.quantity) || 1;
            return acc + (price * qty);
        }, 0);
    } catch (e) {
        // 備援：若 JSON 損毀，嘗試從字串抓取第一個數字
        const backup = memo.replace(/,/g, '').match(/\d+/);
        return backup ? Number(backup[0]) : 0;
    }
},


    /** 解析 AI 燃料中的價格字串並導向均值 */
    _parseAiExpense(memo) {
        if (!memo) return 0;
        try {
            const data = JSON.parse(memo);
            const items = Array.isArray(data) ? data : [data];
            return items.reduce((acc, item) => {
                if (!item.expense) return acc;
                const prices = String(item.expense).replace(/,/g, '').match(/\d+/g);
                if (!prices) return acc;
                const avg = prices.map(Number).reduce((a, b) => a + b, 0) / prices.length;
                return acc + avg;
            }, 0);
        } catch (e) { return 0; }
    },

    /** 生成餅圖物理路徑數據 */
    getChartData(stats) {
        if (!stats || stats.grandTotal === 0) return [];
        let offset = 0;
        return Object.keys(this.COLORS).map(key => {
            const val = stats[key] || 0;
            const pct = (val / stats.grandTotal) * 100;
            const data = {
                id: key,
                label: key === 'transport' ? '交通運輸' : (key === 'itinerary' ? '景點行程' : '購物消費'),
                value: val,
                percentage: pct,
                color: this.COLORS[key],
                offset: offset
            };
            offset += pct;
            return data;
        });
    },

/** 💰 數據清算發動機：高品質燃料開銷提取 (V2026.ULTRA 全能導通版) */
parseFuelCost(memo) {
    if (!memo || typeof memo !== 'string') return 0;
    try {
        const sanitized = memo.replace(/```json|```/g, '').trim();
        const fuel = JSON.parse(sanitized);

        // 🚀 1. 物理優先權：交通模式偵測 (Root Level Priority)
        // 💡 職人診斷：如果根目錄直接有 cost，代表這是交通路網，直接回傳，不再下鑽。
        if (fuel.cost !== undefined && fuel.cost !== null) {
            return Number(fuel.cost);
        }

        // 🚀 2. 深度對焦：下沉至景點子節點 (Sub-level Scanning)
        const items = (fuel && fuel.stops && Array.isArray(fuel.stops)) 
            ? fuel.stops 
            : (Array.isArray(fuel) ? fuel : [fuel]);
        
        return Math.round(items.reduce((acc, item) => {
            // 景點模式通常使用 expense 欄位
            if (item.expense) {
                const prices = String(item.expense).replace(/,/g, '').match(/\d+/g);
                if (prices) {
                    const numPrices = prices.map(Number);
                    const avg = numPrices.reduce((a, b) => a + b, 0) / numPrices.length;
                    return acc + avg;
                }
            }
            // 兼容性補償：若子節點裡也有寫 cost
            if (item.cost !== undefined) return acc + Number(item.cost);
            
            return acc;
        }, 0));

    } catch (e) { 
        // 3. 備援軌道：純文字抓取
        const backupMatch = memo.replace(/,/g, '').match(/\d+/);
        return backupMatch ? Number(backupMatch[0]) : 0;
    }
},

/** 🤖 [AI] 指令合成：數據純化與物理對焦版 (V2026.ULTRA) */
getShoppingAiPrompt(query) {
    const manualCity = document.getElementById('shop-city-input')?.value.trim();
    const tripCity = typeof state !== 'undefined' ? state.trips.find(t => t.id === state.activeTripId)?.city : null;
    const location = manualCity || tripCity || "日本當地";

    return `你是一位日籍專業採購與數據工程師。請針對「${location}」的「${query || '必買商品'}」提供 5-8 個建議，並以【純淨燃料包】格式輸出。

🚨 核心數據規約 (Data Integrity)：
1. **店名真值化**：[store] 欄位僅限填寫品牌或商店名稱，嚴禁包含描述性文字（如：在地工坊、指定店鋪、或是推薦字眼），確保 Google Maps 導通率。
2. **語義隔離**：關於商品的特色描述、口感或購買建議，必須嚴格限制在 [info] 欄位中，不得混入店名。

🚨 輸出欄位規範：
- name: 中文品名
- name_jp: 日文原名 (⚠️ 務必準確，供實體對焦)
- price: 日幣含稅價數字
- store: 官方店名 (嚴禁修飾語，確保導航精準)
- quantity: 1
- tags: ["購"]
- info: 商品特色與選購心得
- image_query: "[品牌] [日文原名] 商品写真"`;
},


/** 🤖 [AI] 指令即時同步：聯動 UI 與合成器 */
    syncShoppingAiPrompt(query) {
        const btnContainer = document.getElementById('shopping-ai-btn');
        if (!btnContainer) return;
        
        // 💡 邏輯對焦：生成最新的 Prompt 並透過 viewEngine 渲染按鈕
        const prompt = this.getShoppingAiPrompt(query);
        btnContainer.innerHTML = viewEngine.renderAICopyBtn(prompt);
    },

/** 💾 [Data] 物理寫入：導入購物燃料 (INFO 軌道加固版) */
async importShoppingFuel() {
    const jsonInput = document.getElementById('shop-json-input');
    if (!jsonInput || !jsonInput.value.trim()) return;

    const activeCategory = document.querySelector('.shopping-module .theme-bg span')?.textContent || '一般';
    
    try {
        const fuel = JSON.parse(jsonInput.value.trim());
        const items = Array.isArray(fuel) ? fuel : [fuel];
        
        const trip = state.trips.find(t => t.id === state.activeTripId);
        if (!trip) return;
        if (!trip.shopping) trip.shopping = [];

        // 🚀 核心修正：明確對位所有關鍵欄位，確保 info 不會因原始數據缺失而變為 undefined
        const itemsWithMeta = items.map(item => ({
            name: item.name || "未命名商品",
            name_jp: item.name_jp || "",
            price: Number(item.price) || 0,
            quantity: Number(item.quantity) || 1,
            store: item.store || "",
            // 🎯 強制導通：確保從外部匯入時，info 軌道就已經物理存在
            info: item.info || "", 
            image_query: item.image_query || "",
            tags: item.tags || ["購"],
            id: `SHOP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            category: activeCategory,
            done: false,
            cost: (Number(item.price) || 0) * (Number(item.quantity) || 1)
        }));

        trip.shopping.push(...itemsWithMeta);
        await dbManager.save(trip);
        
        // 清理現場與物理重刷
        jsonInput.value = "";
        this.filterShopping(activeCategory);
        if (typeof App !== 'undefined' && App.showToast) App.showToast("🚀 購物燃料已物理寫入");

    } catch (e) {
        console.error("❌ [Fuel-Leak] JSON 格式錯誤:", e);
        if (typeof App !== 'undefined' && App.showToast) App.showToast("❌ 燃料解析失敗");
    }
},

/** 🚀 購物分類過濾 (數據對焦) */
    filterShopping(category) {
        const activeTrip = state.trips.find(t => t.id === state.activeTripId);
        if (!activeTrip) return;
        
        // 觸發 viewEngine 重新渲染
        viewEngine.renderShopping(document.getElementById('content-container'), activeTrip.shopping, category);
    },

    /** 🚀 刪除購物項目 (磁區回收) */
    async deleteShoppingItem(itemId) {
        const trip = state.trips.find(t => t.id === state.activeTripId);
        if (!trip) return;

        trip.shopping = trip.shopping.filter(i => i.id !== itemId);
        await dbManager.save(trip);
        
        // 獲取當前分類並執行物理重刷
        const currentCat = document.querySelector('.shopping-module .theme-bg span')?.textContent || '食';
        this.filterShopping(currentCat);
        if (typeof App !== 'undefined' && App.showToast) App.showToast("🗑️ 項目已回收");
    },

    /** ⚙️ 購物標籤編輯 (燃料配置入口) */
    promptEditShoppingCategories() {
        const trip = state.trips.find(t => t.id === state.activeTripId);
        if (!trip) return;

        const categories = trip.shoppingConfig?.categories || ['食', '藥妝', '一般'];
        
        const content = `
            <div class="space-y-4 text-left">
                <div id="shop-cat-edit-list" class="space-y-2 max-h-[50vh] overflow-y-auto no-scrollbar py-1">
                    ${categories.map(cat => `
                        <div class="flex items-center gap-2 group animate-fade-in">
                            <input type="text" value="${cat}" class="shop-cat-input flex-grow bg-slate-50 border-none rounded-xl p-3 font-bold text-xs focus:ring-2 focus:ring-pink-100 transition-all">
                            <button onclick="this.parentElement.remove()" class="text-slate-300 hover:text-red-400 p-2">✕</button>
                        </div>
                    `).join('')}
                </div>
                <button onclick="expenseManager.addShopCategoryRow()" class="w-full py-4 border-2 border-dashed border-slate-100 rounded-2xl text-[10px] font-black text-slate-300">+ 新增分類</button>
            </div>`;

        const actions = `
            <button onclick="modalEngine.remove('shop-cat-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消</button>
            <button onclick="expenseManager.saveShoppingCategories()" class="flex-[2] theme-bg text-white rounded-2xl font-black text-xs shadow-lg shadow-pink-200">儲存標籤</button>`;

        modalEngine.create('shop-cat-modal', '⚙️ 購物標籤管理', content, actions);
    },

    /** ➕ 輔助函數：動態增加標籤列 */
    addShopCategoryRow() {
        const container = document.getElementById('shop-cat-edit-list');
        if (!container) return;
        const div = document.createElement('div');
        div.className = "flex items-center gap-2 animate-fade-in mb-2";
        div.innerHTML = `<input type="text" value="" placeholder="新分類" class="shop-cat-input flex-grow bg-slate-50 border-none rounded-xl p-3 font-bold text-xs focus:ring-2 focus:ring-pink-100 outline-none"><button onclick="this.parentElement.remove()" class="text-slate-300 p-2">✕</button>`;
        container.appendChild(div);
    },

    /** 💾 數據固化：標籤配置寫入磁區 */
    async saveShoppingCategories() {
        const inputs = document.querySelectorAll('.shop-cat-input');
        const newCats = Array.from(inputs).map(i => i.value.trim()).filter(v => v !== "");
        
        const trip = state.trips.find(t => t.id === state.activeTripId);
        if (!trip) return;
        
        if (!trip.shoppingConfig) trip.shoppingConfig = {};
        trip.shoppingConfig.categories = newCats;

        await dbManager.save(trip);
        modalEngine.remove('shop-cat-modal');
        
        if (typeof App !== 'undefined' && App.navigateTo) {
            App.navigateTo('shopping');
            App.showToast("🎨 標籤系統更新成功");
        }
    },

/** ✅ [Logic] 切換購物項目完成狀態 */
async toggleShoppingDone(itemId) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip || !trip.shopping) return;

    const item = trip.shopping.find(i => i.id === itemId);
    if (item) {
        item.done = !item.done; // 物理切換狀態
        await dbManager.save(trip); // 固化磁區
        
        // 取得目前 UI 上的標籤進行熱更新
        const currentCat = document.querySelector('.shopping-module .theme-bg span')?.textContent || '食';
        this.filterShopping(currentCat);
    }
},

/** 🚀 [Data Migration] 購物車燃料轉移至行程軌道 (V2026.ULTRA - INFO 全導通版) */
async transferCartToSchedule(dayIndex) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip || !trip.shopping) return;

    const selectedItems = trip.shopping.filter(item => item.done);
    if (selectedItems.length === 0) return App.showToast("⚠️ 請先勾選要轉移的商品");

    const targetDay = trip.days[dayIndex];
    if (!targetDay) return;

    let shoppingNode = targetDay.schedules.find(s => s.style === 'shopping');
    if (!shoppingNode) {
        shoppingNode = {
            id: `node_${Date.now()}`,
            time: "10:00",
            location: "從清單轉移",
            style: "shopping",
            memo: "[]",
            updatedAt: Date.now()
        };
        targetDay.schedules.push(shoppingNode);
    }

    try {
        let products = JSON.parse(shoppingNode.memo || "[]");
        
        const newProducts = selectedItems.map(item => ({
            name: item.name,
            name_jp: item.name_jp || "",
            price: Number(item.price) || 0,
            store: item.store || "",
            quantity: Number(item.quantity) || 1,
            // 🚀 核心修正：將購物車內的 INFO 燃料傳遞至行程節點
            info: item.info || "", 
            checked: false,
            tags: ["購"]
        }));

        shoppingNode.memo = JSON.stringify([...products, ...newProducts], null, 2);
        
        // 磁區回收與固化
        const selectedIds = selectedItems.map(i => i.id);
        trip.shopping = trip.shopping.filter(item => !selectedIds.includes(item.id));

        await dbManager.save(trip);
        
        App.showToast(`✅ 已將 ${newProducts.length} 筆商品移至 Day ${dayIndex + 1}`);
        App.navigateTo('shopping'); 
        
    } catch (e) {
        console.error("❌ 轉移解析墜毀:", e);
        App.showToast("數據解析異常");
    }
},

/** 🔘 彈出日期選擇撥盤 */
promptTransferTarget() {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return;

    const content = `
        <div class="space-y-4 p-2">
            <p class="text-[11px] font-black text-slate-400 uppercase tracking-widest text-center">請選擇目標移轉日期</p>
            <div class="grid grid-cols-2 gap-3">
                ${trip.days.map((_, idx) => `
                    <button onclick="expenseManager.transferCartToSchedule(${idx}); modalEngine.remove('transfer-modal');"
                            class="py-4 bg-slate-50 hover:theme-bg hover:text-white rounded-2xl font-black text-sm transition-all active:scale-95">
                        Day ${idx + 1}
                    </button>
                `).join('')}
            </div>
        </div>
    `;

    modalEngine.create('transfer-modal', '🛒 轉移至行程排程', content, `
        <button onclick="modalEngine.remove('transfer-modal')" class="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs">取消操作</button>
    `);
}

};