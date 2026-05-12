/** 🔄 SYNC ENGINE (V2026.ULTRA | 物理對焦整合版) 
 * 作用：負責全系統數據與 Firebase 雲端磁區的同步與回流
 */
// 🚀 1. 物理路徑歸一化：統一採用 10.8.0 穩定版
import { 
    collection,
    doc, 
    setDoc, 
    getDoc,
    updateDoc,         // ✨ 補上這行
    deleteDoc,         // 🚀 新增：執行共享磁區物理切除
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🚀 2. 實體導入：確保身分與數據庫路網 100% 同步
import { db, auth } from './firebase-config.js'; // 🚀 關鍵：補齊 auth 導入
import { dbManager } from './dbManager.js';



/** * 🔄 SYNC ENGINE (同步發動機)
 * 負責：Firebase 熱同步與 Drive 物理備份
 */
export const syncEngine = {
    // --- 磁區 A：Google Drive JSON 導出 (物理燃料包) ---
    async backupToDrive(tripData) {
        console.log("📡 [Sync] 啟動 Drive 物理備份協定...");
        try {
            // 此處焊接 Google Picker/Drive API
            const blob = new Blob([JSON.stringify(tripData, null, 2)], { type: 'application/json' });
            // 執行物理導出邏輯...
            return { status: 'SUCCESS', timestamp: Date.now() };
        } catch (err) {
            console.error("❌ [Sync] Drive 備份斷路:", err);
            throw err;
        }
    },

/** 🧼 [Internal] 數據洗滌器：執行全軌道降維與純化 */
_sanitizeData(data) {
    if (!data) return null;
    const clean = JSON.parse(JSON.stringify(data));
    const recursiveFlatten = (obj) => {
        for (let key in obj) {
            if (obj[key] === undefined || obj[key] === null) {
                delete obj[key];
                continue;
            }
            if (Array.isArray(obj[key])) {
                obj[key] = obj[key].map(el => {
                    if (Array.isArray(el)) {
                        // 🚀 [修正] 所有純字串陣列一律轉為數字鍵物件
                        // 涵蓋：[q,a] 2元組、edu_vocab 8元組、segments 對話等所有純字串巢狀陣列
                        const isAllStrings = el.every(v => typeof v === 'string');
                        if (isAllStrings) {
                            const obj = {};
                            el.forEach((v, i) => { obj[String(i)] = v; });
                            return obj;
                        }
                        // 非純字串陣列，遞歸處理內部元素
                        return el.map(subEl => {
                            if (typeof subEl === 'object' && subEl !== null) return recursiveFlatten(subEl);
                            return subEl;
                        });
                    }
                    if (typeof el === 'object' && el !== null) return recursiveFlatten(el);
                    return el;
                });
            } else if (typeof obj[key] === 'object') {
                recursiveFlatten(obj[key]);
            }
        }
        return obj;
    };
    const final = recursiveFlatten(clean);
    if (final.imageUrl && final.imageUrl.length > 100000) final.imageUrl = "[Payload-Exceeded]";
    return final;
},

/** 📡 物理導通：全磁區雲端同步 (V2027.ULTRA 穩壓焊接版) */
async pushToFirebase(userId, dataPayload, stats) {
    // 🛡️ 1. 物理環境預檢
    if (!userId || userId === 'guest_sector') return { status: 'UNAUTHORIZED' };
    if (!navigator.onLine) return { status: 'OFFLINE' };
    
    try {
        const userRef = doc(db, "travelFlow", String(userId).trim());
        
        // 🚀 2. 結構探針與相容性降維
        // 💡 職人診斷：確保 dataPayload 即使在斷路狀態下也能轉為陣列，封殺 .map 崩潰
        const isSnapshot = dataPayload && !Array.isArray(dataPayload) && dataPayload.trips;
        
        const rawTrips = isSnapshot ? dataPayload.trips : (Array.isArray(dataPayload) ? dataPayload : []);
        const rawBacklogs = isSnapshot ? (dataPayload.backlogs || []) : [];
        const rawConfig = isSnapshot ? (dataPayload.config || {}) : {};
        
        // 🚀 3. 語料真值提領 (從本地 IndexedDB 提領全量燃料)
        const rawVault = await dbManager.getAll(dbManager.STORES.TRANS_VAULT) || [];
        
        // 🚀 4. 全軌道數據洗滌 (Sanitization)
        // 💡 職人提醒：_sanitizeData 必須在此處徹底過濾掉 undefined 欄位
        const sanitizedTrips = rawTrips.map(trip => this._sanitizeData(trip)).filter(Boolean);
        const sanitizedVault = rawVault.map(item => this._sanitizeData(item)).filter(Boolean);
        const sanitizedBacklogs = rawBacklogs.map(item => this._sanitizeData(item)).filter(Boolean);

        // 🚀 5. 封裝大一統快照 (Snapshot Master Bundle)
        const syncPayload = {
            trips: sanitizedTrips,
            backlogs: sanitizedBacklogs,
            translationVault: sanitizedVault, // 🎯 語義對焦
            config: JSON.parse(JSON.stringify(rawConfig)), // 徹底洗掉 undefined
            updatedAt: Date.now(),
            version: "V2026.ULTRA.FULL_MIRROR",
            stats: stats || {
                tripCount: sanitizedTrips.length,
                transCount: sanitizedVault.length,
                backlogCount: sanitizedBacklogs.length,
                emergencyCount: sanitizedTrips.reduce((acc, t) => acc + (t.emergencyVault?.length || 0), 0)
            }
        };

        // 🚀 6. 物理固化點火 (執行 Firebase 推播)
        // 💡 職人診斷：若此處噴發 404，代表 V2027 Firestore 實體尚未點火
        await setDoc(userRef, syncPayload, { merge: true });
        
        console.log("✅ [Sync-Engine] 磁區快照已成功降落雲端 V2027");
        return { 
            status: 'SUCCESS', 
            updatedAt: syncPayload.updatedAt, 
            stats: syncPayload.stats 
        };

    } catch (err) {
        // 🚀 7. 戰術熔斷攔截
        if (err.message.includes('404') || err.code === 'not-found') {
            console.error("🚨 [V2027-Offline] 偵測到雲端資料庫尚未初始化，請至 Firebase Console 開啟 Firestore。");
            return { status: 'DATABASE_NOT_FOUND', message: '雲端實體未啟動' };
        }
        
        console.error("❌ [Sync-Engine-Collapse] 同步發動機斷路:", err);
        return this._handleSyncError(err);
    }
},

/** 🌐 [Shared] 佈署至共享磁區：支援主權追蹤與密碼鎖定 */
async deployToSharedZone(trip, passcode) {
    if (!dbManager.isOnline()) return { status: 'OFFLINE' };
    if (!passcode) throw new Error("共享密鑰不可為空");
    if (!auth.currentUser) {
        uiManager.showToast('🚫', '請先登入 Google 帳號以啟用共享功能');
        return { status: 'UNAUTHORIZED' };
    }
    try {
        const shareId = Math.random().toString(36).substring(2, 10).toUpperCase();
        const shareRef = doc(db, "sharedFlows", shareId);

        // 🚀 [修正] 直接洗滌整個 payload，不再重複提取 TRANS_VAULT
        // _sanitizeData 會遞歸處理所有巢狀陣列，轉為 Firestore 相容格式
        const sanitizedPayload = this._sanitizeData(trip);

        const sharePayload = {
            shareId: shareId,
            owner: auth.currentUser.uid,
            passcode: passcode,
            payload: sanitizedPayload,
            deployedAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000),
            stats: {
                dayCount: sanitizedPayload.days?.length || 0,
                location: sanitizedPayload.city || "Unknown",
                tripName: sanitizedPayload.name,
                transCount: sanitizedPayload.translations?.realtime?.length || 0
            }
        };

        await setDoc(shareRef, sharePayload);

        console.log(`📡 [Shared-Zone] 投射成功 | ID: ${shareId} | Owner: ${auth.currentUser.uid.substring(0,6)}...`);
        return { status: 'SUCCESS', shareId: shareId };

    } catch (err) {
        console.error("❌ [Shared-Zone-Collapse]:", err);
        throw err;
    }
},

/** 🔑 [Shared] 從共享磁區回流：執行密鑰驗證 */
async fetchFromSharedZone(shareId, inputPasscode) {
    if (!dbManager.isOnline()) return { status: 'OFFLINE' };
    try {
        const shareRef = doc(db, "sharedFlows", shareId);
        const docSnap = await getDoc(shareRef);
        if (!docSnap.exists()) return { status: 'NOT_FOUND' };
        const sharedData = docSnap.data();
        // 🔐 密鑰比對
        if (sharedData.passcode !== inputPasscode) {
            return { status: 'INVALID_PASSCODE' };
        }
        // 🚀 結構還原：行程資料升維
        const restoredTrip = this._hydrateData(sharedData.payload);

        // 🚀 翻譯資料串還原與寫入本地 TRANS_VAULT
        const rawVault = sharedData.translationVault || 
                         (sharedData.payload?.translations?.realtime || []).concat(
                          sharedData.payload?.translations?.contextual || []);
        const restoredVault = rawVault
            .map(item => this._hydrateData(item))
            .filter(Boolean);
        if (restoredVault.length > 0) {
            for (const item of restoredVault) {
                await dbManager.put(dbManager.STORES.TRANS_VAULT, item);
            }
            console.log(`💾 [Shared-Recovery] 翻譯資料已寫入本地磁區：${restoredVault.length} 筆`);
        }

        // 🚀 [新增] 靈感小卡還原與寫入本地 BACKLOG
        const rawBacklogs = sharedData.payload?.backlogs || [];
        if (rawBacklogs.length > 0) {
            for (const item of rawBacklogs) {
                if (item && item.id) {
                    await dbManager.put(dbManager.STORES.BACKLOG, item);
                }
            }
            console.log(`💾 [Shared-Recovery] 靈感小卡已寫入本地磁區：${rawBacklogs.length} 筆`);
        }

        console.log(`✅ [Shared-Link] 密鑰對焦成功，回流完畢 | 行程: ${sharedData.stats?.location} | 翻譯: ${restoredVault.length} 筆 | 靈感: ${rawBacklogs.length} 筆`);
        return { 
            status: 'SUCCESS', 
            trip: restoredTrip,
            stats: sharedData.stats,
            transCount: restoredVault.length,
            backlogCount: rawBacklogs.length  // 🚀 [新增]
        };
    } catch (err) {
        return this._handleSyncError(err);
    }
},

    _handleSyncError(err) {
        console.error("❌ [Sync-Collapse]:", err);
        return { status: 'ERROR', message: err.message };
    },

/** 🧪 [Internal] 數據升維自癒器：執行全軌道結構還原 */
_hydrateData(data) {
    if (!data) return null;
    const heavyData = JSON.parse(JSON.stringify(data));

    const recursiveHydrate = (obj) => {
        for (let key in obj) {
            if (Array.isArray(obj[key])) {
                obj[key] = obj[key].map(el => {
                    if (el && typeof el === 'object' && !Array.isArray(el)) {
                        // 🚀 軌道 A：偵測 {q, a} 具名物件，還原為 [q, a]
                        if ('q' in el && 'a' in el && Object.keys(el).length === 2) {
                            return [el.q || "", el.a || ""];
                        }
                        // 🚀 [新增] 軌道 B：偵測 edu_vocab 數字鍵物件 {"0":..., "1":...}
                        // Firestore 不支援陣列內的陣列，8元組會被轉成數字鍵物件存入
                        const numericKeys = Object.keys(el).filter(k => !isNaN(k));
                        if (numericKeys.length >= 2) {
                            // 還原為原始陣列，按數字鍵排序重組
                            return numericKeys
                                .sort((a, b) => Number(a) - Number(b))
                                .map(k => el[k] ?? "");
                        }
                        // 其他物件繼續遞歸
                        return recursiveHydrate(el);
                    }
                    return el;
                });
            } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                recursiveHydrate(obj[key]);
            }
        }
        return obj;
    };

    return recursiveHydrate(heavyData);
},

/** 🛰️ [Primary] 雲端磁區回流：個人數據導通 (V2027.ULTRA 終極校準版) */
async fetchFromFirebase(userId) {
    // 🚀 1. 物理導通預檢
    if (!dbManager.isOnline()) return { status: 'OFFLINE' };
    
    console.log("📡 [Sync-Recovery] 啟動全軌道掃描與數據對焦...");
    try {
        const userRef = doc(db, "travelFlow", String(userId).trim());
        const docSnap = await getDoc(userRef);

        // 🚀 2. 真空狀態攔截
        if (!docSnap.exists()) return { status: 'EMPTY' };

        const cloudData = docSnap.data();
        
        /** 💡 職人診斷：執行多磁區對稱化提取
         * 同時對位新舊鍵名 (translationVault / translations)，確保跨代焊接成功
         */
        const rawVault = cloudData.translationVault || cloudData.translations || [];
        const rawTrips = cloudData.trips || [];
        const rawBacklogs = cloudData.backlogs || [];

        // 🚀 3. 執行原子化還原：對所有磁區執行深層結構自癒 (_hydrateData)
        // 確保 [q, a] 二維陣列從雲端具名物件中正確升維
        const restoredVault = rawVault.map(item => this._hydrateData(item));
        const restoredTrips = rawTrips.map(trip => this._hydrateData(trip));
        const restoredBacklogs = rawBacklogs.map(item => this._hydrateData(item));

        // 🚀 4. 封裝回流燃料包 (Payload Alignment)
        return { 
            status: 'SUCCESS', 
            data: {
                trips: restoredTrips,
                // 🎯 關鍵修正：對位 main.js 預期的鍵名，確保資料能順利降落 dbManager
                translations: restoredVault, 
                backlogs: restoredBacklogs,
                config: cloudData.config || {}
            },
            metadata: {
                tripCount: restoredTrips.length,
                translationCount: restoredVault.length,
                backlogCount: restoredBacklogs.length,
                lastSync: cloudData.updatedAt,
                version: cloudData.version || 'V2026.ULTRA.FINAL'
            }
        };
    } catch (err) {
        // 🚀 5. 異常降壓處理
        return this._handleSyncError(err);
    }
},


/** 🌐 [Shared-Management] 共享磁區管理零件 (V2026.ULTRA 穩壓版) */
async deleteFromSharedZone(shareId) {
    // 1. 🚀 環境預檢：封殺離線請求與未授權操作
    if (!dbManager.isOnline()) return { status: 'OFFLINE', message: '目前處於離線狀態' };
    if (!auth.currentUser) throw new Error("AUTH_REQUIRED");

    try {
        console.log(`🔥 [Cloud-Reclaim] 啟動物理銷毀程序：${shareId}`);
        
        // 2. 🚀 定位磁軌並執行切除
        const shareRef = doc(db, "sharedFlows", shareId);
        
        // 💡 職人診斷：執行物理刪除。
        // 若 Firebase Rules 攔截（非 owner），此處會噴發 permission-denied 錯誤並進入 catch
        await deleteDoc(shareRef);
        
        console.log(`✅ [Cloud-Reclaim] 磁區 ${shareId} 已物理歸零`);
        return { status: 'SUCCESS' };

    } catch (err) {
        console.error("❌ [Shared-Delete-Collapse]:", err);
        
        // 🚀 3. 異常分類映射
        if (err.code === 'permission-denied') {
            return { status: 'PERMISSION_DENIED', message: '主權指紋不符，無法刪除他人檔案' };
        }
        
        // 拋出原始錯誤供 App.js 的 try-catch 擷取並顯示 Toast
        throw err; 
    }
},

// 2. 更新共享數據 (如名稱或密碼)
async updateSharedFuel(shareId, updates) {
    if (!auth.currentUser) throw new Error("AUTH_REQUIRED");
    const shareRef = doc(db, "sharedFlows", shareId);
    await updateDoc(shareRef, {
        ...updates,
        updatedAt: Date.now()
    });
    return { status: 'SUCCESS' };
}

};