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
                        // 物理脫殼：將 [q, a] 二維陣列轉為具名物件以符合 Firestore 規範
                        if (Array.isArray(el)) return { q: String(el[0] || ""), a: String(el[1] || "") };
                        if (typeof el === 'object') return recursiveFlatten(el);
                        return el;
                    });
                } else if (typeof obj[key] === 'object') {
                    recursiveFlatten(obj[key]);
                }
            }
            return obj;
        };

        // 執行降維與影像減壓 (100KB 熔斷)
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

    // 🚀 核心預檢：確保發動機已定位使用者身分
    if (!auth.currentUser) {
        uiManager.showToast('🚫', '請先登入 Google 帳號以啟用共享功能');
        return { status: 'UNAUTHORIZED' };
    }

    try {
        // 🚀 1. 生成物理座標 (8位隨機 ID)
        const shareId = Math.random().toString(36).substring(2, 10).toUpperCase();
        const shareRef = doc(db, "sharedFlows", shareId);

        // 🚀 2. 燃料洗滌與主權封裝
        const sanitizedTrip = this._sanitizeData(trip);
        
        const sharePayload = {
            shareId: shareId,
            // 🛡️ [Security-Anchor] 寫入主權指紋：這是規則導通的關鍵
            owner: auth.currentUser.uid, 
            passcode: passcode, 
            payload: sanitizedTrip,
            deployedAt: Date.now(),
            expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7天後自動冷卻
            stats: {
                dayCount: sanitizedTrip.days?.length || 0,
                location: sanitizedTrip.city || "Unknown",
                tripName: sanitizedTrip.name // 💡 建議同步存入名稱，方便管理清單顯示
            }
        };

        // 🚀 3. 點火投射
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
        const shareRef = doc(db, "sharedFlows", shareId);
        const docSnap = await getDoc(shareRef);

        if (!docSnap.exists()) return { status: 'NOT_FOUND' };

        const sharedData = docSnap.data();

        // 🚀 密鑰比對
        if (sharedData.passcode !== inputPasscode) {
            return { status: 'INVALID_PASSCODE' };
        }

        console.log(`✅ [Shared-Link] 密鑰對焦成功，開始回流行程: ${sharedData.stats.location}`);
        return { status: 'SUCCESS', trip: sharedData.payload };
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
                        // 🚀 核心還原：偵測具名物件 {q, a}，還原為二維陣列 [q, a]
                        if (el && typeof el === 'object' && !Array.isArray(el) && ('q' in el)) {
                            return [el.q || "", el.a || ""];
                        }
                        if (typeof el === 'object') return recursiveHydrate(el);
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


    /** 🔑 [Shared] 共享磁區回流 (整合解構後的還原邏輯) */
    async fetchFromSharedZone(shareId, inputPasscode) {
        if (!dbManager.isOnline()) return { status: 'OFFLINE' };
        
        try {
            const shareRef = doc(db, "sharedFlows", shareId);
            const docSnap = await getDoc(shareRef);

            if (!docSnap.exists()) return { status: 'NOT_FOUND' };
            const sharedData = docSnap.data();

            // 🔐 密碼指紋校驗
            if (sharedData.passcode !== inputPasscode) return { status: 'INVALID_PASSCODE' };

            // 🚀 核心對焦：利用同一個 _hydrateData 零件還原共享行程
            const restoredPayload = this._hydrateData(sharedData.payload);

            return { 
                status: 'SUCCESS', 
                trip: restoredPayload,
                stats: sharedData.stats 
            };
        } catch (err) {
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