/**
 * 🎨 MODAL ENGINE (函數化模態框 - V2026.ULTRA 零延遲清理版)
 */
export const modalEngine = {
create(id, title, contentHtml, actionsHtml) {
    const old = document.getElementById(id);
    if (old) old.remove();

    const registry = document.getElementById('modal-registry');
    if (!registry) return;

    const html = `
        <div id="${id}" class="fixed inset-0 z-[10002] flex items-center justify-center p-2 sm:p-4 animate-fade-in" style="pointer-events: auto;">
            <div class="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onclick="App.modalRemove('${id}')"></div>
            
            <div class="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl z-10 relative flex flex-col max-h-[98vh] overflow-hidden animate-slide-up">
                
                <div class="p-5 pb-3 shrink-0 flex justify-between items-center border-b border-slate-50 bg-white z-20">
                    <div class="w-8"></div>
                    <h3 class="text-lg font-black tracking-tighter text-slate-800">${title}</h3>
                    <button onclick="App.modalRemove('${id}')" class="w-10 h-10 flex items-center justify-center text-slate-300 hover:text-rose-500 transition-colors cursor-pointer">✕</button>
                </div>

                <div id="${id}-scroll" class="flex-1 overflow-y-auto px-5 py-4 custom-scrollbar bg-[#fcfcfd]" 
                     style="display: block !important; min-height: 65vh !important;">
                    <div class="w-full">${contentHtml}</div>
                    <div class="h-20"></div>
                </div>

                <div class="p-6 shrink-0 bg-white border-t border-slate-50 z-20 shadow-[0_-10px_30px_rgba(0,0,0,0.02)]">
                    ${actionsHtml}
                </div>
            </div>
        </div>`;

    registry.insertAdjacentHTML('beforeend', html);
    document.body.style.overflow = 'hidden';
    
    // 💡 職人級補償：僅執行高度優化，撤銷自動捲動
    requestAnimationFrame(() => {
        const scrollArea = document.getElementById(`${id}-scroll`);
        if (scrollArea) {
            // 🚀 關鍵修正 1：先強制將捲動軸拉回頂端 (處理瀏覽器自作聰明的 focus)
            scrollArea.scrollTop = 0;

            const memo = scrollArea.querySelector('textarea');
            if (memo && memo.classList.contains('font-mono')) {
                // 🚀 關鍵修正 2：保留 450px 高度美感
                memo.style.setProperty('height', '450px', 'important');
                memo.style.setProperty('min-height', '450px', 'important');
                
                // 🚀 關鍵修正 3：徹底移除原有的 memo.scrollIntoView()
                // 這樣視線就會乖乖留在頂部的「新增行程節點」標題
            }
        }
    });
},

/**
 * 🗑️ 物理清理：確保主執行緒釋放與 UI 回復 (V2026.ULTRA 穩定版)
 */
remove(id) {
    const el = document.getElementById(id);
    const registry = document.getElementById('modal-registry');

    // 🚀 核心修正 1：物理切除
    // 不再等待 CSS 動畫回調，直接從 DOM 中抹除，防止 ID 殘留導致的數據採集位移
    if (el) {
        el.remove();
        console.log(`🧹 [Sector-Clear] 節點 ${id} 已物理切除`);
    }

    // 🚀 核心修正 2：全域狀態復原防禦
    // 只有當 registry 內已經沒有任何開啟的 Modal 時，才歸還 Body 的捲動權限
    // 這樣可以封殺「點擊過快」導致上一層 Modal 的 remove 把下一層的捲動鎖定解開的 Bug
    if (!registry || registry.children.length === 0) {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
        
        // 額外加固：強制移除可能導致畫面卡死的 pointer-events 殘留
        document.body.style.pointerEvents = 'auto';
        
        // 清空容器內所有隱形的空白文字節點
        if (registry) registry.innerHTML = '';
        
        console.log("🔓 [Global-Unlock] 所有模態框已清理，主視圖權限還原");
    } else {
        console.log(`📡 [Stack-Status] 仍有 ${registry.children.length} 個模態框掛載中，維持鎖定態`);
    }
}

};