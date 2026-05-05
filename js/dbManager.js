import { CONFIG } from './config.js';

/**
 * 📦 DB MANAGER (數據倉庫守護者 - V2026.ULTRA 終極校準版)
 * 核心進化：支援自動探測、自動增量升級，封殺 NotFoundError。
 */
export const dbManager = {
    db: null,
    _initPromise: null, // 🚀 狀態鎖：封殺重疊點火


// 🚀 磁區定義協定 (V2026.ULTRA 全域解耦版)
STORES: {
    TRIPS: CONFIG.STORE_NAME,    // 主行程磁區
    BACKLOG: 'itineraryBacklog', // 備選行程磁區
    SYSTEM: 'systemConfig',      // 系統參數磁區
    TRANS_VAULT: 'translationVault', // 👈 物理開口：存放所有即時、情境與拍照翻譯
    SRS_META: 'srsMetadata'
},


/** 🚀 點火初始化：執行多軌道偵測與物理佈署 */
async init() {
    if (this.db) return Promise.resolve();
    if (this._initPromise) return this._initPromise;

    this._initPromise = (async () => {
        try {
            // 🚀 1. 探測階段：獲取目前物理磁區狀態
            const probe = await this._probeDatabase();

            // 🚀 2. 決策階段：計算目標版本號 (自動感應缺失磁區)
            const targetVersion = this._calculateTargetVersion(probe);

            // 🚀 3. 執行階段：開啟物理通道並佈署 STORES
            await this._deployDatabase(targetVersion);

            console.log(`🏁 [DB-Ignition] 系統導通完畢 | Version: ${this.db.version}`);
        } catch (err) {
            this._initPromise = null;
            throw err;
        }
    })();

    return this._initPromise;
},

/** 🔍 [Private] 探測：掃描 IndexedDB 實體狀態 */
async _probeDatabase() {
    return new Promise((resolve) => {
        const request = indexedDB.open(CONFIG.DB_NAME);
        request.onsuccess = (e) => {
            const db = e.target.result;
            const existingStores = Array.from(db.objectStoreNames);
            const requiredStores = Object.values(this.STORES);
            
            const result = {
                version: db.version,
                isMissingStores: !requiredStores.every(s => existingStores.includes(s))
            };
            db.close();
            resolve(result);
        };
        request.onerror = () => resolve({ version: 1, isMissingStores: true });
    });
},

/** 🧠 [Private] 決策：判定版本演進邏輯 */
_calculateTargetVersion(probe) {
    let version = Math.max(CONFIG.DB_VERSION || 1, probe.version);
    if (probe.isMissingStores) {
        version += 1;
        console.warn(`🛠️ [DB-Auto-Fix] 偵測到架構偏移，強制跳號升級至 V${version}`);
    }
    return version;
},

/** 🏗️ [Private] 執行：實體開啟與 STORES 焊接 (含 Index 佈署) */
async _deployDatabase(version) {
    return new Promise((resolve, reject) => {
        if (!window.indexedDB) return reject(new Error("BROWSER_UNSUPPORTED"));

        const request = indexedDB.open(CONFIG.DB_NAME, version);

        // 🏗️ 磁區結構演進 (僅在版本跳號時觸發)
        request.onupgradeneeded = (e) => {
            const db = e.target.result;
            
            Object.values(this.STORES).forEach(storeName => {
                if (!db.objectStoreNames.contains(storeName)) {
                    const store = db.createObjectStore(storeName, { keyPath: "id" });
                    
                    // 🚀 核心焊接：針對影子磁區 SRS_META 佈署物理索引
                    if (storeName === this.STORES.SRS_META) {
                        store.createIndex("nextReview", "nextReview", { unique: false });
                        console.log(`📡 [Index-Weld] SRS 遺忘曲線索引已就緒`);
                    }
                    console.log(`🏗️ [DB-Setup] 磁區佈署成功: ${storeName}`);
                }
            });
        };

        request.onsuccess = (e) => {
            this.db = e.target.result;
            this._attachVersionMonitor();
            resolve();
        };

        request.onerror = (e) => {
            console.error("❌ [DB-Fatal] 點火程序墜毀:", e.target.error);
            reject(e.target.error);
        };
    });
},

/** 🩺 [Private] 監控：磁區版本異動攔截 */
_attachVersionMonitor() {
    this.db.onversionchange = () => {
        this.db.close();
        this.db = null;
        this._initPromise = null;
        console.warn("⚠️ [DB-Sync] 偵測到跨分頁版本更新，已物理切斷舊連接。");
    };
},


/** 🚀 [核心修正] 批量數據固化：確保與 STORES 協定 100% 對焦 (原子化加固) */
async saveAllTrips(tripsArray) {
    // 🚀 1. 自動點火檢查與數據格式攔截
    if (!this.db) await this.init();
    if (!Array.isArray(tripsArray)) {
        console.warn("⚠️ [Sector-Sync] 傳入數據格式異常，中斷固化程序");
        return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
        try {
            // 🚀 2. 物理軌道對焦：明確開啟 readwrite 事務
            const tx = this.db.transaction(this.STORES.TRIPS, "readwrite");
            const store = tx.objectStore(this.STORES.TRIPS);

            // 🚀 3. 執行「先清空、後填充」的原子化指令
            // 💡 職人診斷：在同一個交易軌道執行，確保數據 100% 鏡像雲端真值
            const clearRequest = store.clear(); 

            clearRequest.onsuccess = () => {
                // 物理噴發：僅在清空指令確認成功後，才開始將數據固化至磁區
                tripsArray.forEach(trip => {
                    if (trip && trip.id) {
                        store.put(trip);
                    }
                });
            };

            // 🏆 4. 物理固化完成標記
            tx.oncomplete = () => {
                console.log(`💾 [Sector-Sync] TRIPS 磁區重刷完畢 | 固化筆數: ${tripsArray.length} | 狀態: 100% 對焦`);
                resolve();
            };

            // 🛡️ 5. 多層級錯誤熔斷機制
            tx.onerror = (e) => {
                console.error("❌ [Sector-Sync-Fail] 交易事務崩潰:", e.target.error);
                reject(e.target.error);
            };

            tx.onabort = () => {
                console.error("❌ [Sector-Sync-Abort] 磁區寫入被物理中斷");
                reject(new Error("TRANSACTION_ABORTED"));
            };

        } catch (err) {
            console.error("⚠️ [Sector-Fatal] 固化程序發動機墜毀:", err);
            reject(err);
        }
    });
},

/** 💾 [Universal-Write] 數據固化發動機：支援多磁區寫入 (V2026.ULTRA 校準版) */
async put(storeName, data) {
    // 🚀 1. 自動點火：確保磁區已導通
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
        try {
            // 🛡️ 2. 磁區存在性預檢：封殺無效磁區寫入導致的崩潰
            if (!this.db.objectStoreNames.contains(storeName)) {
                console.error(`❌ [Store-Error] 目標磁區 ${storeName} 尚未佈署`);
                return reject("STORE_NOT_FOUND");
            }

            // 🛡️ 3. 數據完整性防禦
            if (!data || !data.id) {
                console.error(`❌ [Data-Error] 磁區 ${storeName} 寫入失敗：缺少唯一識別碼 (ID)`);
                return reject("MISSING_ID");
            }

            const tx = this.db.transaction(storeName, "readwrite");
            const store = tx.objectStore(storeName);
            
            // 🚀 4. 執行物理寫入
            // 對於 translationVault，store.put 會自動根據 ID 執行 Update 或 Insert
            const request = store.put(data);

            // 💡 職人修正：優先監聽 request.onerror 以捕捉細部寫入錯誤
            request.onerror = (e) => {
                console.error(`❌ [Request-Fail] ID: ${data.id} 寫入受阻:`, e.target.error);
                reject(e.target.error);
            };

            // 🏆 關鍵修正：transaction.oncomplete 才是數據真正「物理固化」到硬碟的標誌
            tx.oncomplete = () => {
                if (storeName !== this.STORES.TRIPS) {
                    console.log(`✨ [DB-Put-Success] 磁區: ${storeName} | 分類: ${data.type || 'N/A'} | ID: ${data.id}`);
                }
                resolve();
            };

            tx.onerror = (e) => {
                console.error(`❌ [Transaction-Fail] 磁區 ${storeName} 交易崩潰:`, e.target.error);
                reject(e.target.error);
            };

        } catch (err) {
            console.error(`⚠️ [DB-Fatal] 進入磁區 ${storeName} 時發生物理異常:`, err);
            reject(err);
        }
    });
},

/** 💾 舊版兼容代理：保持與現有 finalizeTrip / saveScheduleData 對位 */
async save(data) {
    return this.put(this.STORES.TRIPS, data);
},


/** 📡 [Universal-Read] 全域提取發動機：支援多磁區數據抓取 */
async getAll(storeName) {
    // 1. 🚀 自動對焦：如果通路未就緒，啟動自動導通程序
    if (!this.db) {
        console.warn(`📡 [DB-Wait] 磁區 ${storeName} 未就緒，執行自動導通...`);
        try {
            await this.init();
        } catch (e) {
            console.error(`❌ [DB-Fatal] ${storeName} 自動導通失敗:`, e);
            return [];
        }
    }

    // 2. 🛡️ 深度防禦：二重確認實體狀態
    if (!this.db || !this.db.objectStoreNames.contains(storeName)) {
        console.error(`❌ [DB-Status] 目標磁區 ${storeName} 不存在或實體缺失。`);
        return [];
    }

    // 3. 🛸 執行物理提取
    return new Promise((resolve) => {
        try {
            // 🚀 對位修正：明確指定唯讀交易 (ReadOnly)
            const tx = this.db.transaction(storeName, "readonly");
            const store = tx.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                const result = request.result || [];
                // 只有在 Backlog 或其他磁區時才打印日誌，減少主行程提取時的冗餘
                if (storeName !== this.STORES.TRIPS) {
                    console.log(`📡 [Load-Success] 磁區 ${storeName} 提取完成，共 ${result.length} 筆資料`);
                }
                resolve(result);
            };

            request.onerror = (e) => {
                console.error(`❌ [DB-Load-Error] ${storeName} 提取指令被拒絕:`, e.target.error);
                resolve([]);
            };

            tx.onabort = () => {
                console.warn(`⚠️ [DB-Load-Abort] ${storeName} 數據傳輸交易中斷。`);
                resolve([]);
            };

        } catch (err) {
            console.error(`⚠️ [DB-Load-Fail] 提取磁區 ${storeName} 發生異常:`, err);
            resolve([]);
        }
    });
},

/** 📡 舊版兼容代理：保持與現有初始化加載對位 */
async loadAll() {
    return this.getAll(this.STORES.TRIPS);
},

/** 📡 [Universal-Single-Read] 單筆提取發動機 (V2026.ULTRA 校準版) */
async get(storeName, id) {
    // 1. 🚀 自動對焦：確保通路就緒
    if (!this.db) {
        try { await this.init(); } catch (e) { return null; }
    }

    // 💡 職人修正：自動對位 STORES 物件值，增加容錯性
    // 如果傳入的是 'TRANS_VAULT' 鍵名，自動轉換為實體磁區名稱
    const targetStore = this.STORES[storeName] || storeName;

    // 2. 🛡️ 實體狀態防禦
    if (!this.db || !this.db.objectStoreNames.contains(targetStore)) {
        console.error(`❌ [DB-Status] get 失敗：磁區 ${targetStore} 不存在。`);
        return null;
    }

    // 3. 🛸 執行物理瞄準提取
    return new Promise((resolve, reject) => {
        try {
            // 使用 readonly 確保不鎖定資料庫
            const tx = this.db.transaction(targetStore, "readonly");
            const store = tx.objectStore(targetStore);
            const request = store.get(id);

            request.onsuccess = () => {
                // 數據回流真值化
                resolve(request.result || null);
            };

            request.onerror = (e) => {
                console.error(`❌ [DB-Get-Error] 磁區 ${targetStore} ID: ${id} 讀取受阻:`, e.target.error);
                reject(e.target.error);
            };

        } catch (err) {
            console.error(`⚠️ [DB-Get-Fail] 提取磁區 ${targetStore} 異常:`, err);
            reject(err);
        }
    });
},


/** 🧹 [Universal-Delete] 磁區回收發動機：執行指定磁區的物理刪除 (V2026.ULTRA 校準版) */
async delete(storeName, id) {
    // 🚀 1. 自動點火：確保磁區已導通
    if (!this.db) await this.init();

    // 💡 職人修正：語義對焦映射
    // 支援直接傳入鍵名 (如: 'TRANS_VAULT') 或實體名稱 (如: 'translationVault')
    const targetStore = this.STORES[storeName] || storeName;

    return new Promise((resolve, reject) => {
        try {
            // 🛡️ 2. 磁區存在性預檢
            if (!this.db.objectStoreNames.contains(targetStore)) {
                console.error(`❌ [DB-Status] 回收失敗：磁區 ${targetStore} 缺失。`);
                return reject("STORE_NOT_FOUND");
            }

            // 3. 開啟讀寫交易軌道
            const tx = this.db.transaction(targetStore, "readwrite");
            const store = tx.objectStore(targetStore);
            
            // 4. 執行物理移除
            const request = store.delete(id);
            
            // 💡 職人建議：增加 request 層級的錯誤捕捉
            request.onerror = (e) => {
                console.error(`❌ [Request-Fail] ID: ${id} 物理移除受阻:`, e.target.error);
                reject(e.target.error);
            };

            tx.oncomplete = () => {
                console.log(`✨ [DB-Reclaim] 磁區 ${targetStore} 內 ID: ${id} 已成功回收。`);
                resolve(true);
            };
            
            tx.onerror = (e) => {
                console.error(`❌ [DB-Reclaim-Fail] ${targetStore} 回收事務中斷:`, e.target.error);
                reject(e.target.error);
            };
        } catch (err) {
            console.error(`⚠️ [DB-Fatal] 執行磁區 ${targetStore} 刪除指令時墜毀:`, err);
            reject(err);
        }
    });
},

/** ------------------------------------------- */
/** -------------------影子磁區---------------- */
/** ------------------------------------------- */

/** 🎯 [SRS-Logic] 提取到期燃料：全域指紋回補與數據自癒 (V2026.ULTRA.FINAL) */
async getDueSRSItems() {
    if (!this.db) await this.init();

    return new Promise(async (resolve) => {
        try {
            // 🚀 1. 多磁區並行讀取
            const [allShadows, allVault] = await Promise.all([
                this.getAll(this.STORES.SRS_META),
                this.getAll(this.STORES.TRANS_VAULT)
            ]);

            const vaultMap = new Map(allVault.map(v => [v.id, v]));
            const now = Date.now();

            // 🚀 2. 物理對焦與過期篩選
            const dueItems = allShadows
                .filter(item => item.nextReview <= now)
                .map(item => {
                    // 💡 職人診斷：執行「等級指紋」深度對焦
                    // 只有在影子磁區完全沒有 level 時才執行回補
                    if (!item.level || item.level === "UNDEFINED") {
                        const parentSource = vaultMap.get(item.parentId);
                        
                        // 🚀 核心焊接：優先權採集
                        // 1. 混合物件內部的 level (v.level)
                        // 2. 或是從一般區域的單字陣列中根據 ID 索引回溯
                        let recoveredLevel = "UNDEFINED"; 

                        if (parentSource) {
                            const vMarker = "_v_";
                            const idxPos = item.id.lastIndexOf(vMarker);
                            
                            if (idxPos !== -1) {
                                // 提取索引 (處理如 art_123_v_0_12345 的情況)
                                const parts = item.id.substring(idxPos + vMarker.length).split('_');
                                const idx = parseInt(parts[0]);
                                const vocab = parentSource.edu_vocab?.[idx];
                                
                                // 🔐 關鍵對焦：鑽透混合物件結構
                                recoveredLevel = vocab?.level || parentSource.level || "UNDEFINED";
                            } else {
                                recoveredLevel = parentSource.level || "UNDEFINED";
                            }
                        }
                        
                        // 🛡️ 最終物理焊接
                        item.level = String(recoveredLevel).trim().toUpperCase();
                    }
                    return item;
                });

            console.log(`📡 [SRS-Scanner] 全域掃描完畢，對焦 ${dueItems.length} 筆過期燃料`);
            resolve(dueItems);

        } catch (err) {
            console.error("❌ [SRS-Scanner-Collapse]:", err);
            resolve([]);
        }
    });
},

/** 🎯 [SRS-Matrix] 單字卡專屬提取路網 (V2026.ULTRA.FINAL_INDEX_FIX) */
async getAllSRSItems() {
    if (!this.db) await this.init();

    return new Promise(async (resolve) => {
        try {
            const [allShadows, allVault] = await Promise.all([
                this.getAll(this.STORES.SRS_META),
                this.getAll(this.STORES.TRANS_VAULT)
            ]);

            const vaultMap = new Map(allVault.map(v => [v.id, v]));
            const now = Date.now();

            const refinedPool = allShadows.map(item => {
                const parent = vaultMap.get(item.parentId);
                if (!parent || !parent.edu_vocab) return null;

                // 🚀 核心修正 A：精確對焦索引位元組
                // 💡 職人診斷：使用 '_v_' 作為物理分隔符，防止文章 ID 中的底線干擾索引提取
                const idParts = String(item.id).split('_v_');
                const lastPart = idParts[idParts.length - 1];
                const idx = parseInt(lastPart);

                // 🛡️ 熔斷保護：若索引解析失敗 (NaN)，立即終止該筆導通
                if (isNaN(idx)) return null;

                const vocab = parent.edu_vocab[idx];
                if (!vocab) return null;

                // 🚀 核心修正 B：主權斷路 (Sovereignty Disconnect)
                // 排除 item.level，僅採信原始 JSON (vocab.level)
                const rawLevel = (vocab.level || vocab.級別 || "");
                const finalLevel = rawLevel ? String(rawLevel).trim().toUpperCase() : null;

                return {
                    ...item, // 繼承 SRS 進度指紋 (stage, nextReview)
                    id: item.id,
                    parentId: item.parentId,
                    word: (vocab.word || vocab.單字 || vocab[0] || "").trim(),
                    reading: (vocab.reading || vocab.讀音 || vocab[1] || "").trim(),
                    trans: (vocab.trans || vocab.翻譯 || vocab[5] || "").trim(),
                    level: finalLevel, // 🚀 數據是啥就是啥，絕不回頭抓舊數據
                    isDue: item.nextReview <= now
                };
            }).filter(it => it && it.word); 

            console.log(`📡 [Vocab-Only] 特訓路網導通：共 ${refinedPool.length} 筆 (ID 索引與主權校準版)`);
            resolve(refinedPool);

        } catch (err) {
            console.error("❌ [Vocab-Collapse] 提取失敗:", err);
            resolve([]);
        }
    });
},

/** 💾 [SRS-Solidify] 單筆指紋更新：執行記憶能階演進 (V2026.ULTRA.STABLE) */
async updateSRSFingerprint(id, srsData) {
    if (!this.db) await this.init();

    return new Promise((resolve, reject) => {
        try {
            const tx = this.db.transaction(this.STORES.SRS_META, "readwrite");
            const store = tx.objectStore(this.STORES.SRS_META);
            
            // 🚀 1. 物理提取現有指紋
            const getRequest = store.get(id);

            getRequest.onsuccess = () => {
                const existing = getRequest.result;
                if (!existing) return resolve(false);

                // 🚀 2. 數據焊接：嚴格控制覆蓋範圍
                // 💡 職人診斷：強制保留 level 與 parentId，封殺 srsData 內容偏移
                const updated = {
                    ...existing,
                    // 🔐 等級主權：確保 level 絕對不被 srsData 覆蓋 (除非 srsData 顯式包含)
                    level: srsData.level || existing.level || "UNDEFINED",
                    stage: srsData.stage,
                    nextReview: srsData.nextReview,
                    updatedAt: Date.now()
                };

                // 🛡️ 物理熔斷：如果 level 在寫入前消失，直接拋錯攔截
                if (updated.level === "UNDEFINED") {
                    console.error(`❌ [SRS-Weld-Fail] 指紋 ${id} 遺失標籤主權，拒絕固化`);
                    return resolve(false);
                }

                store.put(updated);
            };

            tx.oncomplete = () => {
                console.log(`💾 [SRS-Weld] 指紋 ${id} 已固化 | 能階: ${srsData.stage} | 標籤: ${getRequest.result?.level}`);
                resolve(true);
            };

            tx.onerror = (e) => reject(e.target.error);
        } catch (err) {
            console.error("⚠️ [SRS-Update-Fatal] 固化異常:", err);
            resolve(false);
        }
    });
},

/** 🚀 [Legacy-Weld] 物理別名焊接：將舊有的 batchPut 導向最新的 batchPutSRS */
    async batchPut(items) {
        console.log("🔗 [Legacy-Link] 偵測到舊版 batchPut 調用，自動重定向至 batchPutSRS");
        return this.batchPutSRS(items);
    },


/** 🚀 [Fix-V2026] 影子投射總線：標籤主權與結構對焦版 */
async batchPutSRS(items) {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
        const tx = this.db.transaction(this.STORES.SRS_META, "readwrite");
        const store = tx.objectStore(this.STORES.SRS_META);

        items.forEach(item => {
            // 💡 關鍵焊接：多態結構提取
            let displayWord = item.word || item.q || item.title;
            
            if (item.type === 'article_package' && item.segments?.length > 0) {
                const firstSeg = item.segments[0];
                displayWord = Array.isArray(firstSeg) ? firstSeg[0] : (firstSeg.q || firstSeg.原文);
            }

            // 🚀 核心固化：確保所有關鍵屬性進入磁區
            store.put({
                id: item.id,
                parentId: item.parentId || "", // 🔐 新增：用於後續資料自癒回溯
                word: displayWord || "未命名燃料", 
                reading: item.reading || item.romaji || "",
                level: (item.level || "UNDEFINED").toUpperCase(), // 🔥 [CRITICAL] 等級指紋焊接
                type: item.type || '單字', // 確保分類正確
                stage: item.stage || 0,
                nextReview: item.nextReview || Date.now(),
                updatedAt: Date.now()
            });
        });

        tx.oncomplete = () => {
            console.log(`💾 [SRS-Solidify] ${items.length} 筆燃料已帶標籤固化，ID 範例: ${items[0]?.id}`);
            resolve(true);
        };
        
        tx.onerror = (e) => {
            console.error("❌ [SRS-Solidify-Fail] 寫入受阻:", e.target.error);
            reject(e.target.error);
        };
    });
},

/** 🌪️ [SRS-Force-Purge] 強制真空化特訓磁區 */
async clearSRSMetadata() {
    if (!this.db) await this.init();
    return new Promise((resolve, reject) => {
        // 確保使用 readwrite 權限
        const tx = this.db.transaction([this.STORES.SRS_META], "readwrite");
        const store = tx.objectStore(this.STORES.SRS_META);
        
        // 🚀 物理清空
        const request = store.clear();

        tx.oncomplete = () => {
            console.log("🏁 [Database] SRS 磁區洗滌完畢，所有指紋已抹除");
            resolve(true);
        };

        tx.onerror = (e) => {
            console.error("❌ [Database] 洗滌失敗:", e.target.error);
            reject(e.target.error);
        };
    });
},

/** 🧹 [Universal-Clear] 全磁區物理清空協定 (V2026.ULTRA.FINAL) */
async clear() {
    console.log("🔥 [DB-Reclaim] 啟動全磁區物理重置程序...");
    if (!this.db) await this.init();
    
    // 遍歷 STORES 內定義的所有實體磁區
    const storeNames = Object.values(this.STORES);
    
    return new Promise((resolve, reject) => {
        try {
            // 🚀 開啟包含所有磁區的大型讀寫事務
            const tx = this.db.transaction(storeNames, "readwrite");
            
            storeNames.forEach(storeName => {
                const store = tx.objectStore(storeName);
                store.clear();
                console.log(`🏗️ [DB-Clear] 磁區 ${storeName} 已物理歸零`);
            });

            tx.oncomplete = () => {
                console.log("✅ [DB-Reclaim] 全系統磁區已完成洗滌，地基純化完畢");
                resolve(true);
            };

            tx.onerror = (e) => {
                console.error("❌ [DB-Reclaim-Fail] 洗滌事務中斷:", e.target.error);
                reject(e.target.error);
            };
        } catch (err) {
            console.error("⚠️ [DB-Fatal] 清空指令執行墜毀:", err);
            reject(err);
        }
    });
},


/** 🚀 物理導通檢查：探測目前系統是否具備「實質」聯網能力 (V2027.ULTRA) */
isOnline() {
    // 1. 物理網卡探測 (最外層門檻)
    const physicalLink = navigator.onLine;

    // 2. 數據庫實體狀態對焦
    // 💡 職人診斷：如果 dbManager 未點火或 db 實體缺失，系統視為無效導通
    const dbSolidified = this.db !== null;

    // 3. Firebase 數據總線連通性預判 (進階自癒邏輯)
    // 💡 職人提醒：若偵測到 Firebase SDK 處於離線快取狀態，此處應回傳 false
    // 強制 UI 進入離線優先模式，封殺重複的還原請求
    const isReady = physicalLink && dbSolidified;

    if (!isReady && physicalLink) {
        console.warn("⚠️ [Network-Shadow] 偵測到物理聯網，但數據總線尚未對焦 (DB 離線狀態)");
    }

    return isReady;
}

};