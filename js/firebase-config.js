import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    initializeFirestore, 
    memoryLocalCache 
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

/** ⚡ [V2027-Power-Weld] 強力導通配置 */
// 💡 職人診斷：強制使用長輪詢以穿透 V2027 專案的物理 404 屏障
export const db = initializeFirestore(app, {
    experimentalForceLongPolling: true,
    localCache: memoryLocalCache()
});

export const auth = getAuth(app); 
export const googleProvider = new GoogleAuthProvider();

export { signInWithPopup, signOut, onAuthStateChanged };