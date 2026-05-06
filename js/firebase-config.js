import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    initializeFirestore, 
    persistentLocalCache, // 🚀 關鍵導入：啟動磁碟持久化
    persistentMultipleTabManager 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    signOut, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyAhGjjOw7lznVr0zuiSljFjiuWAEB2FJHA",
    authDomain: "travelflow-v2027.firebaseapp.com",
    projectId: "travelflow-v2027",
    storageBucket: "travelflow-v2027.firebasestorage.app",
    messagingSenderId: "61817240332",
    appId: "1:61817240332:web:5dcadc4b4020fe40066729"
};

const app = initializeApp(firebaseConfig);

/** ⚡ [V2027-Hardened-Weld] 強力穿透配置 (V2026.ULTRA 修正版) */
export const db = initializeFirestore(app, {
    // 💡 職人診斷：在某些極端企業路網下，Firestore 預設協定會被封殺
    // 我們強制將通訊封包降維，並啟用更激進的持久化策略
    experimentalForceLongPolling: true, 
    useFetchStreams: false, // 🚀 關鍵修正：封殺日誌中爆裂的 Stream 模式，改採純 REST 風格
    localCache: persistentLocalCache({
        tabManager: persistentMultipleTabManager()
    })
});

export const auth = getAuth(app); 
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };