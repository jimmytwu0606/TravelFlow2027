
// ============================================================
// 1. [Visual & UI Manager] 視認性與主題調控
// 負責：字體縮放、介面比例、色彩燃料注入
// ============================================================


/** 🎨 UI MANAGER (視覺交互與風格控管中樞) */
import { THEMES } from './config.js'; // 🚀 確保導入主題燃料

export const uiManager = {
    /** 🚀 點火初始化：讀取持久化設定並導通視覺軌道 */
    init() {
        const textScale = localStorage.getItem('tf_text_scale') || '100';
        const uiScale = localStorage.getItem('tf_ui_scale') || '100';
        const theme = localStorage.getItem('tf_theme_key') || 'rose-pink'; 
        
        this.applyText(textScale);
        this.applyUI(uiScale);
        this.applyTheme(theme);
        
        console.log("🎨 [uiManager] 全域視覺與文字軌道導通完畢。");
    },

    /** 🌈 軌道 A：色彩主題對焦 */
    applyTheme(key) {
        const theme = THEMES[key] || THEMES['rose-pink'];
        document.documentElement.style.setProperty('--theme-primary', theme.hex);
        document.documentElement.style.setProperty('--theme-shadow', theme.shadow);
        localStorage.setItem('tf_theme_key', key);
        
        // 物理更新選中狀態
        document.querySelectorAll('.theme-dot').forEach(dot => {
            dot.style.border = dot.dataset.theme === key ? '3px solid #1e293b' : 'none';
        });
    },

    /** 📏 軌道 B：文字視認性 (控制內容) */
    applyText(scale) {
        const ratio = scale / 100;
        document.documentElement.style.setProperty('--tf-text-scale', ratio);
        localStorage.setItem('tf_text_scale', scale);
        const display = document.getElementById('text-scale-display');
        if (display) display.textContent = `${scale}%`;
    },

    /** 📐 軌道 C：介面整體縮放 (控制容器 rem) */
    applyUI(scale) {
        const ratio = scale / 100;
        document.documentElement.style.fontSize = `${16 * ratio}px`;
        localStorage.setItem('tf_ui_scale', scale);
        const display = document.getElementById('ui-scale-display');
        if (display) display.textContent = `${scale}%`;
    },

/** 🛰️ 軌道 D：職人級氣泡通知 (V2026.ULTRA 終極層級加固版) */
showToast(icon = '💡', message = '', duration = 3000, options = {}) {
    let finalIcon = icon;
    let finalMsg = message;

    // 🚀 核心自癒：處理單軌參數（封殺 undefined）
    if (!message && icon) {
        finalMsg = icon;
        finalIcon = '✨';
    }

    // 1. 🚀 物理清理：封殺殘留氣泡，維持磁區純淨
    const oldToast = document.querySelector('.tf-toast');
    if (oldToast) oldToast.remove();

    // 2. 🚀 構建原子節點
    const toast = document.createElement('div');
    toast.className = 'tf-toast';
    
    // 💡 職人樣式：將 Z-Index 焊接至 20000 級別，徹底封殺 10001 的遮擋
    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '100px', 
        left: '50%',
        transform: 'translateX(-50%) translateY(20px)',
        // 🚀 關鍵修正：提升至 20000，確保在所有 Modal 之上
        zIndex: '20000', 
        backgroundColor: 'rgba(30, 41, 59, 0.98)',
        color: 'white',
        padding: '14px 24px',
        borderRadius: '24px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
        backdropFilter: 'blur(12px)',
        transition: 'all 0.4s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
        opacity: '0',
        pointerEvents: 'auto', // 🚀 導通點擊主權
        whiteSpace: 'nowrap',
        border: '1px solid rgba(255,255,255,0.1)'
    });

    // 💡 職人加固：強制寫入 !important 屬性，防止外部 CSS (如 Tailwind) 干擾
    toast.style.setProperty('z-index', '20000', 'important');
    toast.style.setProperty('pointer-events', 'auto', 'important');

    // 🚀 交互焊接：如果具備回調，點亮按鈕
    const actionHtml = options.onConfirm ? `
        <button id="toast-confirm-btn" 
                style="margin-left: 8px; background: #ef4444; color: white; border: none; padding: 6px 14px; border-radius: 12px; font-size: 10px; font-weight: 900; cursor: pointer; transition: all 0.2s;"
                onmouseover="this.style.filter='brightness(1.2)'" 
                onmouseout="this.style.filter='none'">
            確認切除
        </button>
    ` : '';

    toast.innerHTML = `
        <span style="font-size: 16px;">${finalIcon}</span>
        <span style="font-size: 13px; font-weight: 800;">${finalMsg}</span>
        ${actionHtml}
    `;

    document.body.appendChild(toast);

    // 3. 🚀 點火噴發 (強制重繪)
    toast.offsetHeight; 

    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

    // 🚀 事件監聽：點擊回調
    if (options.onConfirm) {
        const btn = toast.querySelector('#toast-confirm-btn');
        if (btn) {
            btn.onclick = (e) => {
                e.stopPropagation();
                options.onConfirm();
                toast.remove();
            };
        }
        duration = 6000;
    }

    if (navigator.vibrate) navigator.vibrate(15);

    // 4. 🚀 自動回收
    setTimeout(() => {
        if (!document.body.contains(toast)) return;
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-20px)';
        const finalize = () => { if (toast.parentNode) toast.remove(); };
        toast.addEventListener('transitionend', finalize, { once: true });
        setTimeout(finalize, 500); 
    }, duration);
}
};

window.uiManager = uiManager;