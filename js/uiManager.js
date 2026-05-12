
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

/** 🛰️ 軌道 D：職人級氣泡通知 (V2026.ULTRA 語義配色升級版) */
showToast(icon = '💡', message = '', duration = 3000, options = {}) {
    let finalIcon = icon;
    let finalMsg = message;

    if (!message && icon) {
        finalMsg = icon;
        finalIcon = '✨';
    }

    // 🚀 語義配色對照表
    const semanticMap = {
        '✅': { bg: '#EAF3DE', border: '#C0DD97', iconBg: '#3B6D11', textColor: '#27500A', subColor: '#3B6D11', tiIcon: 'ti-check' },
        '✨': { bg: '#FBEAF0', border: '#F4C0D1', iconBg: '#D4537E', textColor: '#4B1528', subColor: '#D4537E', tiIcon: 'ti-sparkles' },
        '❌': { bg: '#FCEBEB', border: '#F09595', iconBg: '#A32D2D', textColor: '#501313', subColor: '#A32D2D', tiIcon: 'ti-x' },
        '💥': { bg: '#FCEBEB', border: '#F09595', iconBg: '#A32D2D', textColor: '#501313', subColor: '#A32D2D', tiIcon: 'ti-alert-circle' },
        '⚠️': { bg: '#FAEEDA', border: '#FAC775', iconBg: '#854F0B', textColor: '#412402', subColor: '#854F0B', tiIcon: 'ti-alert-triangle' },
        '🚨': { bg: '#FAEEDA', border: '#FAC775', iconBg: '#854F0B', textColor: '#412402', subColor: '#854F0B', tiIcon: 'ti-alert-triangle' },
        '📡': { bg: '#E6F1FB', border: '#85B7EB', iconBg: '#185FA5', textColor: '#042C53', subColor: '#185FA5', tiIcon: 'ti-wifi' },
        '📶': { bg: '#FAEEDA', border: '#FAC775', iconBg: '#854F0B', textColor: '#412402', subColor: '#854F0B', tiIcon: 'ti-wifi-off' },
        '🔒': { bg: '#FAEEDA', border: '#FAC775', iconBg: '#854F0B', textColor: '#412402', subColor: '#854F0B', tiIcon: 'ti-lock' },
        '🔑': { bg: '#FAEEDA', border: '#FAC775', iconBg: '#854F0B', textColor: '#412402', subColor: '#854F0B', tiIcon: 'ti-key' },
        '🚀': { bg: '#E6F1FB', border: '#85B7EB', iconBg: '#185FA5', textColor: '#042C53', subColor: '#185FA5', tiIcon: 'ti-rocket' },
        '💾': { bg: '#E6F1FB', border: '#85B7EB', iconBg: '#185FA5', textColor: '#042C53', subColor: '#185FA5', tiIcon: 'ti-device-floppy' },
        '🎯': { bg: '#FBEAF0', border: '#F4C0D1', iconBg: '#D4537E', textColor: '#4B1528', subColor: '#D4537E', tiIcon: 'ti-target' },
        '💡': { bg: '#E6F1FB', border: '#85B7EB', iconBg: '#185FA5', textColor: '#042C53', subColor: '#185FA5', tiIcon: 'ti-bulb' },
    };

    const style = semanticMap[finalIcon] || {
    bg: '#FBEAF0', border: '#F4C0D1', iconBg: '#D4537E', textColor: '#4B1528', subColor: '#993556', tiIcon: 'ti-bell'
};

    // 1. 清理舊泡泡
    const oldToast = document.querySelector('.tf-toast');
    if (oldToast) oldToast.remove();

    // 2. 構建節點
    const toast = document.createElement('div');
    toast.className = 'tf-toast';

    // 訊息分割：支援「標題\n副標題」格式
    const msgParts = finalMsg.split('\n');
    const titleText = msgParts[0] || '';
    const subText = msgParts[1] || options.sub || '';

    const actionHtml = options.onConfirm ? `
        <button id="toast-confirm-btn"
                style="margin-left: 4px; background: #E24B4A; color: white; border: none; padding: 6px 14px;
                       border-radius: 10px; font-size: 11px; font-weight: 700; cursor: pointer; flex-shrink: 0;">
            ${options.confirmText || '確認'}
        </button>` : '';

    Object.assign(toast.style, {
        position: 'fixed',
        bottom: '88px',
        left: '50%',
        transform: 'translateX(-50%) translateY(16px)',
        zIndex: '20000',
        backgroundColor: style.bg,
        border: `0.5px solid ${style.border}`,
        borderRadius: '16px',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        transition: 'all 0.35s cubic-bezier(0.18, 0.89, 0.32, 1.28)',
        opacity: '0',
        pointerEvents: 'auto',
        minWidth: '220px',
        maxWidth: '320px',
    });

    toast.style.setProperty('z-index', '20000', 'important');
    toast.style.setProperty('pointer-events', 'auto', 'important');

    toast.innerHTML = `
        <div style="width: 32px; height: 32px; background: ${style.iconBg}; border-radius: 10px;
                    display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <i class="ti ${style.tiIcon}" style="font-size: 16px; color: white;" aria-hidden="true"></i>
        </div>
        <div style="flex: 1; min-width: 0;">
            <p style="font-size: 13px; font-weight: 700; color: ${style.textColor}; margin: 0;
                      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${titleText}</p>
            ${subText ? `<p style="font-size: 11px; color: ${style.subColor}; margin: 2px 0 0;
                              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${subText}</p>` : ''}
        </div>
        ${actionHtml}
    `;

    document.body.appendChild(toast);

    toast.offsetHeight;
    requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateX(-50%) translateY(0)';
    });

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

    setTimeout(() => {
        if (!document.body.contains(toast)) return;
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(-12px)';
        const finalize = () => { if (toast.parentNode) toast.remove(); };
        toast.addEventListener('transitionend', finalize, { once: true });
        setTimeout(finalize, 400);
    }, duration);
},

/** 🚀 [UI-Component] 全域進度條模態框 (V2026.ULTRA 物理導通版) */
    showProgressModal(title, subtitle = "數據磁區同步中...") {
        // 物理洗滌：封殺重複的進度條，確保單一總線運作
        const existing = document.getElementById('sync-progress-modal');
        if (existing) existing.remove();

        const html = `
            <div id="sync-progress-modal" class="fixed inset-0 z-[20000] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
                <div class="w-full max-w-xs bg-white rounded-[2.5rem] p-8 shadow-2xl space-y-6 text-center transform scale-100 transition-transform">
                    <!-- 物理旋鈕：動態 Spinner -->
                    <div class="relative w-20 h-20 mx-auto">
                        <div class="absolute inset-0 border-4 border-slate-50 rounded-full"></div>
                        <div id="progress-spinner" class="absolute inset-0 border-4 theme-border-pink rounded-full border-t-transparent animate-spin"></div>
                        <div class="absolute inset-0 flex items-center justify-center font-black theme-text-pink text-sm tabular-nums" id="sync-percent">0%</div>
                    </div>
                    
                    <!-- 語義說明 -->
                    <div>
                        <h4 class="font-black text-slate-800 text-sm">${title}</h4>
                        <p class="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1" id="sync-step">${subtitle}</p>
                    </div>

                    <!-- 物理進度槽位 -->
                    <div class="w-full h-1.5 bg-slate-50 rounded-full overflow-hidden">
                        <div id="sync-progress-bar" class="h-full theme-bg w-0 transition-all duration-300 ease-out"></div>
                    </div>
                </div>
            </div>`;
        document.body.insertAdjacentHTML('beforeend', html);
    },

    /** ⚡ 分段回報：更新進度指針 */
    updateProgress(percent, stepLabel) {
        const bar = document.getElementById('sync-progress-bar');
        const text = document.getElementById('sync-percent');
        const step = document.getElementById('sync-step');
        
        if (bar) bar.style.width = `${percent}%`;
        if (text) text.innerText = `${Math.round(percent)}%`;
        if (step) step.innerText = stepLabel;

        // 職人反饋：在關鍵節點（如 100%）執行輕微震動
        if (percent >= 100 && navigator.vibrate) navigator.vibrate(20);
    },

    /** 🛑 物理回收：移除進度介面 */
    hideProgressModal() {
        const el = document.getElementById('sync-progress-modal');
        if (!el) return;
        
        el.classList.add('opacity-0', 'pointer-events-none');
        el.querySelector('div').style.transform = 'scale(0.9)';
        setTimeout(() => el.remove(), 400);
    }


};

window.uiManager = uiManager;