/**
 * 🎨 VIEW ENGINE (渲染引擎 - ESM 版)
 * 核心版本：V2026.ULTRA.FLUID
 * 物理作用：數據燃料介面化 (UI Rendering)
 * 核心協定：圓角卡片語彙 / 物理對焦 (scrollIntoView) / 數據洗滌 (Sanitization)
 * 視覺依賴：CSS Variables (--theme-primary, --theme-shadow)
 * --------------------------------------------------
 * [Module Role]
 * - 負責全系統 HTML String 生成與 DOM 注入
 * - 執行高品質 JSON 燃料 (Itinerary/Transport) 的語義解析
 * - 處理複雜的物理對焦 (Focus) 與局部熱更新 (Segment Switch)
 */

import { CONFIG } from './config.js'; // 🚀 確保導入配置
import { expenseManager } from './expenseManager.js';

/**
 * 🎨 VIEW ENGINE (渲染引擎 - ESM 版)
 */
export const viewEngine = {

// ============================================================
// 1. [Main Layouts] 全域分區與框架渲染
// 負責：主清單、詳情頁框架、導航底欄
// ============================================================


/**
     * 渲染行程清單視圖 (V2026.ULTRA 物理回收強化版)
     */
    renderTripList(container, trips) {
        // 🚀 核心焊接：為每一張行程卡片加入「物理回收」軌道
        const tripsHtml = trips.map(trip => `
            <div class="relative group mb-4">
                <button onclick="event.stopPropagation(); App.confirmDeleteTrip('${trip.id}')" 
                        class="absolute -top-1.5 -right-1.5 w-7 h-7 bg-rose-500 text-white rounded-full shadow-lg 
                               opacity-0 group-hover:opacity-100 transition-all duration-300 z-10 flex items-center justify-center
                               hover:scale-110 active:scale-95 border-2 border-white cursor-pointer">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>

                <div onclick="App.navigateTo('detail', '${trip.id}')" 
                     class="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all animate-fade-in group/card">
                    <div class="flex justify-between items-center">
                        <div class="min-w-0 flex-1">
                            <h3 class="text-lg font-black text-slate-800 truncate pr-4">${trip.name}</h3>
                            <div class="flex items-center gap-3 mt-1.5">
                                <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    ${trip.days ? trip.days.length : 0} Days
                                </p>
                                <div class="w-1 h-1 rounded-full bg-slate-200"></div>
                                <p class="text-[10px] text-slate-400 uppercase font-black tracking-widest">
                                    ${trip.companions || 1} Persons
                                </p>
                            </div>
                        </div>
                        <div class="text-slate-200 group-hover/card:theme-text-pink transition-colors transform group-hover/card:translate-x-1 duration-300">
                            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"></path>
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="animate-fade-in px-1">
                <div class="flex justify-between items-center mb-8 px-2">
                    <div>
                        <h2 class="text-2xl font-black tracking-tighter text-slate-800">我的旅行</h2>
                        <p class="text-[10px] font-black theme-text-pink uppercase tracking-[0.2em] mt-0.5">Fleet Management</p>
                    </div>
                    <button onclick="App.toggleModal('add-trip-modal')" 
                            class="w-12 h-12 theme-bg text-white rounded-2xl shadow-lg shadow-pink-100 flex items-center justify-center active:scale-90 transition-all cursor-pointer">
                        <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M12 4v16m8-8H4"></path>
                        </svg>
                    </button>
                </div>
                <div id="trip-list-track" class="space-y-1">
                    ${tripsHtml || `
                        <div class="py-24 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem] bg-slate-50/30">
                            <div class="text-4xl mb-4 opacity-20">🗺️</div>
                            <p class="text-slate-300 font-black text-[11px] uppercase tracking-widest">目前無任何行程軌道</p>
                            <p class="text-slate-400 text-[10px] mt-1 italic font-medium">點擊上方 ＋ 開始整備航線</p>
                        </div>
                    `}
                </div>
            </div>
        `;
    },


_renderSatelliteTrack(container, trip, focusDay) {
    if (!container) return;

    container.innerHTML = `
        <div style="margin:0 20px 12px;">
            <div id="sat-card-slot-${focusDay}" style="border-radius:14px; overflow:hidden; box-shadow:0 4px 16px rgba(0,0,0,0.08);">
            </div>
        </div>`;

    // ✅ 優先顯示邏輯：有航班顯示航班，無航班才顯示住宿
    const allFlights = Array.isArray(trip.transport) ? trip.transport : [];
    const hasFlight = allFlights.some(f => Number(f.day) === Number(focusDay));
    const hasHotel = (trip.hotels || []).some(h => h.days && h.days.includes(focusDay));

    let initialMode = 'flight';  // 預設
    if (!hasFlight && hasHotel) {
        initialMode = 'hotel';
    }

    this._renderSatCard(trip, focusDay, initialMode);
},

_renderSatCard(trip, focusDay, mode) {
    const slot = document.getElementById(`sat-card-slot-${focusDay}`);
    if (!slot) return;

    const allFlights = Array.isArray(trip.transport) ? trip.transport : [];
    const f = allFlights.find(fl => Number(fl.day) === Number(focusDay)) || null;
    const hotels = trip.hotels || [];
    const todaysHotels = hotels.filter(h => h.days && h.days.includes(focusDay));
    const h = todaysHotels.length > 0 ? todaysHotels[0] : null;

    const flightLabel = f
        ? `${f.carrier || ''} ${f.code || ''} · ${f.depTime || '--'} → ${f.arrTime || '--'}`.trim()
        : '今日航班';

    // 切換列：顯示另一張卡的資訊
    const switchBar = mode === 'flight' ? `
        <div onclick="viewEngine._renderSatCard(window._satTrip_${focusDay}, ${focusDay}, 'hotel')"
             style="display:flex; align-items:center; justify-content:space-between;
                    padding:0 14px; height:44px; cursor:pointer;
                    background:#185FA5; font-size:12px; font-weight:600; color:#E6F1FB;">
            <span><i class="fa-solid fa-bed" style="font-size:13px; margin-right:6px;"></i>下榻住宿</span>
            <i class="fa-solid fa-chevron-right" style="font-size:12px; opacity:0.7;"></i>
        </div>` : `
        <div onclick="viewEngine._renderSatCard(window._satTrip_${focusDay}, ${focusDay}, 'flight')"
             style="display:flex; align-items:center; justify-content:space-between;
                    padding:0 14px; height:44px; cursor:pointer;
                    background:#D4537E; font-size:12px; font-weight:600; color:#FBEAF0;">
            <span><i class="fa-solid fa-plane-departure" style="font-size:13px; margin-right:6px;"></i>${flightLabel}</span>
            <i class="fa-solid fa-chevron-right" style="font-size:12px; opacity:0.7;"></i>
        </div>`;

    const cardContent = mode === 'flight'
        ? this._satFlightContent(trip, focusDay, f)
        : this._satHotelContent(trip, focusDay, h);

    slot.innerHTML = `
        <div style="background:white; border:0.5px solid #E2E8F0; border-radius:14px; overflow:hidden;">
            ${cardContent}
            ${switchBar}
        </div>`;

    // 把 trip 存到 window 讓 onclick 能取得
    window[`_satTrip_${focusDay}`] = trip;
},

_satFlightContent(trip, focusDay, f) {
    const carrier = f?.carrier || '--';
    const code = f?.code || '--';

    return `
        <div onclick="App.promptEditTransport('${trip.id}')"
             style="background:#D4537E; padding:8px 14px 9px;
                    display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-plane-departure" style="font-size:15px; color:#FBEAF0;"></i>
                <div>
                    <div style="font-size:13px; font-weight:600; color:#FBEAF0; line-height:1.2;">${carrier}</div>
                    <div style="font-size:11px; color:#F4C0D1;">${code}</div>
                </div>
            </div>
            <span style="font-size:11px; font-weight:600; padding:2px 10px; border-radius:20px; background:#FBEAF0; color:#993556;">D${focusDay}</span>
        </div>

        ${f ? `
        <div onclick="App.promptEditTransport('${trip.id}')" style="padding:12px 14px 10px; cursor:pointer;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:8px;">
                <div style="flex:1;">
                    <div style="font-size:11px; color:#B4B2A9; margin-bottom:1px;">${f.depPort || '--'}</div>
                    <div style="font-size:30px; font-weight:600; color:#D4537E; font-variant-numeric:tabular-nums; letter-spacing:-0.03em; line-height:1;">${f.depTime || '--:--'}</div>
                    <div style="font-size:9px; color:#B4B2A9; text-transform:uppercase; letter-spacing:0.05em; margin-top:2px;">Departure</div>
                </div>
                <div style="flex:0 0 44px; display:flex; align-items:center; justify-content:center; padding-top:10px;">
                    <div style="width:100%; display:flex; align-items:center;">
                        <div style="width:3px; height:3px; border-radius:50%; background:#ED93B1; flex-shrink:0;"></div>
                        <div style="flex:1; border-top:1.5px dashed #ED93B1;"></div>
                        <i class="fa-solid fa-plane" style="font-size:12px; color:#D4537E; flex-shrink:0;"></i>
                        <div style="flex:1; border-top:1.5px dashed #ED93B1;"></div>
                        <div style="width:3px; height:3px; border-radius:50%; background:#ED93B1; flex-shrink:0;"></div>
                    </div>
                </div>
                <div style="flex:1; text-align:right;">
                    <div style="font-size:11px; color:#B4B2A9; margin-bottom:1px;">${f.arrPort || '--'}</div>
                    <div style="font-size:30px; font-weight:600; color:#D4537E; font-variant-numeric:tabular-nums; letter-spacing:-0.03em; line-height:1;">${f.arrTime || '--:--'}</div>
                    <div style="font-size:9px; color:#B4B2A9; text-transform:uppercase; letter-spacing:0.05em; margin-top:2px;">Arrival</div>
                </div>
            </div>
        </div>
        <div style="display:flex; align-items:center; margin:0 -1px;">
            <div style="width:14px; height:14px; border-radius:50%; background:#F8FAFC; border:0.5px solid #E2E8F0; flex-shrink:0;"></div>
            <div style="flex:1; border-top:1.5px dashed #E2E8F0;"></div>
            <div style="width:14px; height:14px; border-radius:50%; background:#F8FAFC; border:0.5px solid #E2E8F0; flex-shrink:0;"></div>
        </div>
        <div onclick="App.promptEditTransport('${trip.id}')" style="padding:8px 14px 10px; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:6px 8px; cursor:pointer;">
            <div>
                <div style="font-size:9px; color:#B4B2A9; text-transform:uppercase; margin-bottom:2px;">艙等</div>
                <div style="font-size:12px; font-weight:600; color:#1a1a1a;">${f.cabin || '經濟艙'}</div>
            </div>
            <div>
                <div style="font-size:9px; color:#B4B2A9; text-transform:uppercase; margin-bottom:2px;">座位</div>
                <div style="font-size:12px; font-weight:600; color:#1a1a1a;">${f.seat || '--'}</div>
            </div>
            <div>
                <div style="font-size:9px; color:#B4B2A9; text-transform:uppercase; margin-bottom:2px;">登機門</div>
                <div style="font-size:${f.gate ? '12px' : '11px'}; font-weight:${f.gate ? '600' : '400'}; color:${f.gate ? '#1a1a1a' : '#B4B2A9'};">${f.gate || '當天公告'}</div>
            </div>
        </div>` : `
        <div onclick="App.promptEditTransport('${trip.id}')" style="padding:18px 16px; text-align:center; cursor:pointer;">
            <div style="font-size:11px; color:#D3D1C7; font-weight:600; text-transform:uppercase;">今日無航班</div>
        </div>`}`;
},

_satHotelContent(trip, focusDay, h) {
    return `
        <div onclick="App.promptEditHotelByTripId('${trip.id}')"
             style="background:#185FA5; padding:8px 14px 9px;
                    display:flex; align-items:center; justify-content:space-between; cursor:pointer;">
            <div style="display:flex; align-items:center; gap:8px;">
                <i class="fa-solid fa-bed" style="font-size:15px; color:#E6F1FB;"></i>
                <div>
                    <div style="font-size:13px; font-weight:600; color:#E6F1FB; line-height:1.2;">下榻住宿</div>
                    <div style="font-size:11px; color:#85B7EB;">Accommodation</div>
                </div>
            </div>
            <span style="font-size:11px; font-weight:600; padding:2px 10px; border-radius:20px; background:#E6F1FB; color:#0C447C;">D${focusDay}</span>
        </div>

        ${h ? `
        <div onclick="App.promptEditHotelByTripId('${trip.id}')" style="padding:10px 14px 8px; cursor:pointer;">
            <div style="font-size:15px; font-weight:600; color:#1a1a1a; line-height:1.3; margin-bottom:8px;">${h.name}</div>
            <div style="display:flex; align-items:flex-start; gap:6px; margin-bottom:5px;">
                <i class="fa-solid fa-location-dot" style="font-size:12px; color:#378ADD; flex-shrink:0; margin-top:2px;"></i>
                <div style="flex:1; min-width:0;">
                    <div style="font-size:11px; color:#5F5E5A; line-height:1.5; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${h.address || '未設定地址'}</div>
                </div>
            </div>
            <div style="display:flex; align-items:center; gap:6px;">
                <i class="fa-solid fa-phone" style="font-size:12px; color:#378ADD; flex-shrink:0;"></i>
                <span style="font-size:11px; color:#5F5E5A;">${h.phone || '--'}</span>
            </div>
        </div>
        <div style="display:flex; align-items:center; margin:0 -1px;">
            <div style="width:14px; height:14px; border-radius:50%; background:#F8FAFC; border:0.5px solid #185FA5; opacity:0.4; flex-shrink:0;"></div>
            <div style="flex:1; border-top:1.5px dashed #B5D4F4;"></div>
            <div style="width:14px; height:14px; border-radius:50%; background:#F8FAFC; border:0.5px solid #185FA5; opacity:0.4; flex-shrink:0;"></div>
        </div>
        <div onclick="App.promptEditHotelByTripId('${trip.id}')" style="padding:8px 14px 10px; display:grid; grid-template-columns:repeat(3, minmax(0,1fr)); gap:6px 8px; cursor:pointer;">
            <div>
                <div style="font-size:9px; color:#B4B2A9; text-transform:uppercase; margin-bottom:2px;">入住</div>
                <div style="font-size:12px; font-weight:600; color:#185FA5;">${h.checkIn || '--'}</div>
            </div>
            <div>
                <div style="font-size:9px; color:#B4B2A9; text-transform:uppercase; margin-bottom:2px;">退房</div>
                <div style="font-size:12px; font-weight:600; color:#185FA5;">${h.checkOut || '--'}</div>
            </div>
            <div>
                <div style="font-size:9px; color:#B4B2A9; text-transform:uppercase; margin-bottom:2px;">房型</div>
                <div style="font-size:12px; font-weight:600; color:#1a1a1a;">${h.roomType || '--'}</div>
            </div>
        </div>` : `
        <div onclick="App.promptEditHotelByTripId('${trip.id}')" style="padding:18px 16px; text-align:center; cursor:pointer;">
            <div style="font-size:11px; color:#D3D1C7; font-weight:600; text-transform:uppercase;">今日無住宿資料</div>
        </div>`}`;
},


/** 🎨 視圖演進：職人級滑動底欄 (V2026.ULTRA 大字流體版) */
renderBottomDock(container, activeView) {
    if (!container) return;

    const allNavs = [
        { id: 'detail',     label: '行程',  icon: 'fa-solid fa-map-pin' },
        { id: 'expense',    label: '開銷',  icon: 'fa-solid fa-yen-sign' },
        { id: 'checklist',  label: '清單',  icon: 'fa-solid fa-list-check' },
        { id: 'realtime',   label: '即時',  icon: 'fa-solid fa-microphone' },
        { id: 'training',   label: '特訓',  icon: 'fa-solid fa-fire' },
        { id: 'contextual', label: '情境',  icon: 'fa-solid fa-book-open' },
        { id: 'shopping',   label: '購物',  icon: 'fa-solid fa-bag-shopping' },
        { id: 'emergency',  label: '緊急',  icon: 'fa-solid fa-kit-medical' },
        { id: 'backlog',    label: '靈感',  icon: 'fa-solid fa-lightbulb' },
        { id: 'backup',     label: '備份',  icon: 'fa-solid fa-cloud' },
        { id: 'settings',   label: '設定',  icon: 'fa-solid fa-gear' },
    ];

    container.innerHTML = `
        <div style="
    position: fixed; bottom: 0; left: 0; right: 0;
    z-index: 5000;
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(20px) saturate(1.8);
    -webkit-backdrop-filter: blur(20px) saturate(1.8);
    border-top: 0.5px solid rgba(212,83,126,0.15);
    padding: 10px 0 max(20px, env(safe-area-inset-bottom));
    -webkit-transform: translateZ(0);
    transform: translateZ(0);
    will-change: transform;
">
            <div id="nav-scroll-track" style="
                display: flex;
                overflow-x: auto;
                overflow-y: hidden;
                -webkit-overflow-scrolling: touch;
                touch-action: pan-x;
                scroll-snap-type: x proximity;
                padding: 0 16px;
                gap: 0px;
                scrollbar-width: none;
            " onwheel="event.preventDefault(); this.scrollLeft += event.deltaY;">
                <style>#nav-scroll-track::-webkit-scrollbar{display:none}</style>
                ${allNavs.map(item => {
                    const isActive = activeView === item.id || (item.id === 'contextual' && activeView === 'translate');
                    const isTraining = item.id === 'training';
                    return `
                    <button onclick="App.navigateTo('${item.id}')"
                            id="nav-btn-${item.id}"
                            style="
                                position: relative;
                                flex-shrink: 0;
                                display: flex; flex-direction: column; align-items: center; gap: 5px;
                                padding: 10px 20px;
                                border-radius: 16px; border: none; cursor: pointer;
                                background: ${isActive ? '#FBEAF0' : 'transparent'};
                                transition: all 0.18s cubic-bezier(0.34, 1.56, 0.64, 1);
                                scroll-snap-align: center;
                                -webkit-tap-highlight-color: transparent;
                                min-width: 64px;
                            "
                            onmousedown="this.style.transform='scale(0.88)'"
                            onmouseup="this.style.transform='scale(1)'"
                            ontouchstart="this.style.transform='scale(0.88)'; if(navigator.vibrate) navigator.vibrate(8);"
                            ontouchend="this.style.transform='scale(1)'">
                        <i class="${item.icon}" style="font-size: 24px; color: ${isActive ? '#D4537E' : '#B4B2A9'};"></i>
                        <span style="font-size: 16px; font-weight: 700; white-space: nowrap; color: ${isActive ? '#D4537E' : '#B4B2A9'};">${item.label}</span>
                        ${isTraining && !isActive ? '<span style="position:absolute;top:8px;right:12px;width:7px;height:7px;border-radius:50%;background:#E24B4A;display:block;"></span>' : ''}
                    </button>`;
                }).join('')}
            </div>
        </div>
        <div style="height: 110px;"></div>
    `;

    this.focusNavBtn(activeView);
},

focusNavBtn(activeView) {
    const viewId = (activeView === 'translate') ? 'contextual' : activeView;

    requestAnimationFrame(() => {
        const activeBtn = document.getElementById(`nav-btn-${viewId}`);
        const track = document.getElementById('nav-scroll-track');
        
        if (!activeBtn || !track) return;

        const trackWidth = track.clientWidth;
        const btnOffset = activeBtn.offsetLeft;
        const btnWidth = activeBtn.offsetWidth;

        let scrollTarget = btnOffset - (trackWidth / 2) + (btnWidth / 2);
        scrollTarget = Math.max(0, scrollTarget);
        scrollTarget = Math.min(scrollTarget, track.scrollWidth - trackWidth);

        track.scrollTo({
            left: scrollTarget,
            behavior: 'smooth'
        });

        console.log(`🧭 [UI-Focus] 導航對焦軌道: ${viewId} | Target: ${Math.round(scrollTarget)}px`);
    });
},


/** 🧬 [V2026.ULTRA] 行程編輯表單核心 - 雙模對焦物理加固版 */
_renderScheduleFormHTML(item) {
    const currentStyle = (item.style || 'default').toLowerCase().trim();
    // 🚀 狀態感應：預設啟動視覺編修模式
    const editMode = localStorage.getItem('tf_editor_mode') || 'visual';
    
    return `
        <div class="space-y-4 text-left animate-fade-in pb-4">
            <div class="p-5 bg-slate-50 rounded-[2.5rem] space-y-5 border border-slate-100/50 shadow-inner">
                
                <!-- 🚀 1. 模式撥盤：切換 視覺編修 / 原始燃料 (焊接點) -->
                <div class="flex p-1 bg-slate-200/50 rounded-2xl">
                    <button onclick="App.switchEditorMode('visual')" id="btn-mode-visual"
                            class="flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${editMode === 'visual' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}">
                        🎨 視覺編修
                    </button>
                    <button onclick="App.switchEditorMode('code')" id="btn-mode-code"
                            class="flex-1 py-2.5 rounded-xl text-[11px] font-black transition-all ${editMode === 'code' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-400'}">
                        💻 原始燃料
                    </button>
                </div>

                <!-- 🚀 2. 排程風格設定 (保留原功能) -->
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">排程風格設定</label>
                    <select id="sched-style" onchange="App.syncStyleUI(this.value)" 
                            class="w-full bg-white border-none rounded-2xl p-4 font-black text-sm shadow-sm outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all cursor-pointer">
                        <option value="default" ${currentStyle === 'default' ? 'selected' : ''}>1. 預設型式</option>
                        <option value="json" ${currentStyle === 'json' ? 'selected' : ''}>2. JSON 景點燃料 (AI)</option>
                        <option value="transport" ${currentStyle === 'transport' ? 'selected' : ''}>3. 交通小卡 (AI)</option>
                        <option value="image" ${currentStyle === 'image' ? 'selected' : ''}>4. 圖片 Memo</option>
                        <option value="import" ${currentStyle === 'import' ? 'selected' : ''}>5. 🔌 注入外部燃料</option>
                        <option value="shopping" ${currentStyle === 'shopping' ? 'selected' : ''}>6. 購物清單 (AI Fuel)</option>
                    </select>
                </div>

                <!-- 🚀 3. 動態零件區域 (重新導入：負責時間、標題、圖片上傳、購物參數等) -->
                <div id="dynamic-sector-container">
                    ${this._getSectorByStyle(currentStyle, item)}
                </div>

                <!-- 🚀 4. WYSIWYG 實境編修 Slot (視覺模式下顯示) -->
                <div id="visual-editor-container" class="${editMode === 'visual' ? 'block' : 'hidden'} animate-fade-in border-t border-slate-100 pt-5">
                    <label class="text-[10px] font-black theme-text-pink uppercase tracking-widest px-1 block mb-3">WYSIWYG 實境預覽與編修</label>
                    <div class="bg-white rounded-[2rem] p-2 ring-1 ring-slate-100 shadow-sm overflow-hidden">
                        <div id="visual-render-slot" class="scale-[0.98] origin-top">
                            ${this._renderVisualEditorContent(item)}
                        </div>
                    </div>
                    <p class="text-[9px] text-slate-400 font-bold mt-3 px-1 italic">※ 提示：視覺模式支援點擊文字直接修正，內容將自動焊接至燃料核心</p>
                </div>

                <!-- 🚀 5. 數據燃料核心 (原始碼模式下顯示) -->
                <div id="code-editor-container" class="${editMode === 'code' ? 'block' : 'hidden'} space-y-2 border-t border-slate-100 pt-4 animate-fade-in">
                    <div class="flex justify-between items-center px-1">
                        <label id="memo-label" class="text-[10px] font-black text-slate-400 uppercase tracking-widest block">數據燃料核心 (JSON)</label>
                        <div id="ai-btn-container"></div>
                    </div>
                    <textarea id="sched-memo" oninput="App.syncVisualFromCode(); App.syncShoppingEditor();"
                        class="w-full bg-white border-none rounded-2xl p-4 font-mono text-[11px] h-64 shadow-sm outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all custom-scrollbar" 
                        placeholder="請貼上由 AI Protocol 生成的高品質燃料 JSON...">${item.memo || ''}</textarea>
                    
                    <!-- 隱藏圖像路徑連動 -->
                    <input type="hidden" id="sched-image-data" value="${item.imageUrl || ''}">
                </div>
            </div>
        </div>`;
},


/** 🧬 [Visual-Engine] 視覺化編修內容生成器 (V2026.ULTRA 標籤指紋加固版) */
_renderVisualEditorContent(item) {
    const style = (item.style || 'default').toLowerCase().trim();
    let html = "";
    
    if (style === 'transport') {
        html = this.renderTransportFuel(item.memo || "{}", "editor-preview");
    } else if (style === 'json' || (item.memo && (item.memo.trim().startsWith('{') || item.memo.trim().startsWith('[')))) {
        html = this.renderItineraryFuel(item.memo || "{}");
    } else {
        html = `<div class="p-6 text-slate-500 font-bold text-sm">${item.memo || '編輯內容中...'}</div>`;
    }

    return html
        // 🚀 A軌道：標題與段落對位 (data-field 注入)
        // 💡 針對 h4 標題注入 task/location 指紋，針對 p 注入 spotlight/note 指紋
        .replace(/<h4([^>]*class="[^"]*"[^>]*)>/g, 
                 '<h4 data-field="task" contenteditable="true" spellcheck="false" onblur="window.App.syncCodeFromVisual()" $1>')
        .replace(/<p([^>]*class="[^"]*amber[^"]*"[^>]*)>/g, // 帶 amber 的視為亮點
                 '<p data-field="spotlight" contenteditable="true" spellcheck="false" onblur="window.App.syncCodeFromVisual()" $1>')
        .replace(/<p(?![^>]*data-field)([^>]*class="[^"]*"[^>]*)>/g, // 其餘 p 視為備註
                 '<p data-field="note" contenteditable="true" spellcheck="false" onblur="window.App.syncCodeFromVisual()" $1>')
        
        // 🚀 B軌道：原子數值對位 (確保時間與費用導通)
        .replace(/<span([^>]*class="[^"]*theme-text-pink[^"]*"[^>]*)>/g, 
                 '<span data-field="time" contenteditable="true" spellcheck="false" onblur="window.App.syncCodeFromVisual()" $1>')
        .replace(/<span([^>]*class="[^"]*tabular-nums[^"]*"[^>]*)>/g, 
                 '<span data-field="expense" contenteditable="true" spellcheck="false" onblur="window.App.syncCodeFromVisual()" $1>');
},

_renderShoppingFuelPreview(products) {
    let total = 0;
    const itemsHtml = products.map((p, idx) => {
        const cleanStore = String(p.store || '').replace(/^[@\s]+/, '').trim();
        const price = (p.price !== undefined && p.price !== null) ? Number(String(p.price).replace(/,/g, '')) : 0;
        const qty = (p.quantity !== undefined && p.quantity !== null && String(p.quantity).trim() !== "") ? Number(p.quantity) : 1;

        total += (price * qty);
        return `
            <div class="shopping-fuel-box animate-fade-in"
                 style="${idx > 0 ? 'margin-top: 20px; padding-top: 20px; border-top: 1px dashed #E2E8F0;' : 'margin-top: 8px;'}">

                <!-- 商品名稱 + 價格 -->
                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">
                    <div style="flex: 1; min-width: 0;">
                        <h4 data-field="name" data-index="${idx}"
                            style="
                                font-size: 14px; font-weight: 700;
                                color: #1a1a1a; line-height: 1.4;
                                word-break: break-word; margin: 0;
                                outline: none;
                            "
                            contenteditable="true" spellcheck="false"
                            onblur="window.App.syncCodeFromVisual()">${p.name || '未命名商品'}</h4>

                        <!-- 購買地點 -->
                        <p style="margin: 6px 0 0; display: flex; align-items: center; gap: 3px;">
                            <i class="fa-solid fa-location-dot" style="font-size: 10px; color: #D4537E;"></i>
                            <span data-field="store" data-index="${idx}"
                                  style="
                                      font-size: 11px; font-weight: 600; color: #D4537E;
                                      outline: none;
                                  "
                                  contenteditable="true" spellcheck="false"
                                  onblur="window.App.syncCodeFromVisual()">${cleanStore || '未指定商店'}</span>
                        </p>
                    </div>

                    <!-- 價格 + 數量 -->
                    <div style="text-align: right; flex-shrink: 0;">
                        <p style="
                            font-size: 14px; font-weight: 800;
                            color: #D4537E; font-variant-numeric: tabular-nums; margin: 0;
                        ">¥<span data-field="price" data-index="${idx}"
                               style="outline: none;"
                               contenteditable="true"
                               onblur="window.App.syncCodeFromVisual()">${price.toLocaleString()}</span></p>
                        <p style="
                            font-size: 10px; font-weight: 700;
                            color: #B4B2A9; margin: 3px 0 0;
                            letter-spacing: 0.03em;
                        ">× <span data-field="quantity" data-index="${idx}"
                                  style="outline: none;"
                                  contenteditable="true"
                                  onblur="window.App.syncCodeFromVisual()">${qty}</span></p>
                    </div>
                </div>

                <!-- 購買提示 -->
                ${p.info ? `
                <details style="margin-top: 8px;">
                    <summary style="
                        list-style: none; cursor: pointer; user-select: none;
                        display: inline-flex; align-items: center; gap: 5px;
                    ">
                        <span style="
                            display: inline-flex; align-items: center; justify-content: center;
                            width: 16px; height: 16px; border-radius: 50%;
                            background: #F1EFE8; color: #888780; font-size: 8px;
                        "><i class="fa-solid fa-chevron-down"></i></span>
                        <span style="
                            font-size: 11px; font-weight: 700; color: #5F5E5A;
                            letter-spacing: 0.04em;
                        ">購買提示</span>
                    </summary>
                    <div style="
                        margin-top: 8px;
                        background: #FFFBEB;
                        border-left: 3px solid #F59E0B;
                        border-radius: 0 8px 8px 0;
                        padding: 10px 12px 10px 36px;
                        position: relative;
                    ">
                        <i class="fa-solid fa-circle-info" style="
                            position: absolute; left: 12px; top: 12px;
                            font-size: 12px; color: #D97706;
                        "></i>
                        <p data-field="info" data-index="${idx}"
                           style="
                               font-size: 13px; font-weight: 500;
                               color: #451A03; line-height: 1.7; margin: 0;
                               word-break: break-word; outline: none;
                           "
                           contenteditable="true" spellcheck="false"
                           onblur="window.App.syncCodeFromVisual()">${p.info}</p>
                    </div>
                </details>` : ''}
            </div>`;
    }).join('');

    return `
        <div class="shopping-preview-container">
            ${itemsHtml}
            <div style="
                margin-top: 24px; padding-top: 16px;
                border-top: 1.5px solid #E2E8F0;
                display: flex; justify-content: flex-end; align-items: baseline; gap: 6px;
            ">
                <span style="font-size: 10px; font-weight: 700; color: #888780; letter-spacing: 0.04em;">購物小計</span>
                <span style="font-size: 11px; font-weight: 800; color: #D4537E;">¥</span>
                <span style="
                    font-size: 20px; font-weight: 800; color: #D4537E;
                    font-variant-numeric: tabular-nums;
                ">${total.toLocaleString()}</span>
            </div>
        </div>`;
},

/** 🧬 [Sector-Router] 根據風格派發專屬 HTML 零件 */
_getSectorByStyle(style, item) {
    switch(style) {
        case 'json':      return this._renderJsonSector(item);
        case 'transport': return this._renderTransportSector(item);
        case 'image':     return this._renderImageSector(item);
        case 'shopping':  return this._renderShoppingSector(item);
        case 'import':    return this._renderImportSector(item);
        default:          return this._renderDefaultSector(item);
    }
},

/** 📍 零件 1：基礎數據零件 (V2026.ULTRA 全維度對焦加固版) */
_renderDefaultSector(item) {
    // 🚀 1. 物理脫敏：封殺 null/undefined
    const fuel = item || {};
    
    // 🚀 2. 屬性預洗：強迫轉換為字串，確保 Input Value 安全導通
    const safeTime = String(fuel.time || "");
    const safeLocation = String(fuel.location || "");
    const safeExpense = String(fuel.expense || "");

    return `
        <div class="space-y-4" id="basic-data-sector">
            <div class="grid grid-cols-2 gap-3">
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">節點時間</label>
                    <!-- 🚀 核心加固：改用 window.App 強制全域對焦 -->
                    <input type="time" id="sched-time" value="${safeTime}" 
                           oninput="window.App.syncFuelFromTopParts()"
                           class="w-full bg-white rounded-2xl p-4 font-black text-sm shadow-sm border-none outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all tabular-nums">
                </div>
                <div>
                    <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">預估費用 (JPY)</label>
                    <input type="text" id="sched-cost" value="${safeExpense}" placeholder="例如：1500" 
                           oninput="window.App.syncFuelFromTopParts()"
                           class="w-full bg-white rounded-2xl p-4 font-black text-sm shadow-sm border-none outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all theme-text-pink">
                </div>
            </div>
            <div>
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block mb-2">地點標題</label>
                <input type="text" id="sched-location" value="${safeLocation}" placeholder="地點或活動名稱" 
                       oninput="window.App.syncFuelFromTopParts()"
                       class="w-full bg-white rounded-2xl p-4 font-black text-sm shadow-sm border-none outline-none ring-1 ring-slate-100 focus:ring-pink-200 transition-all">
            </div>
        </div>`;
},

/** 🧠 零件 2：行程 JSON 模式 (數據自癒版) */
_renderJsonSector(item) {
    // 🚀 核心防禦：確保傳入下游零件的燃料永遠不是 null
    const fuel = item || {};
    
    return `
        ${this._renderDefaultSector(fuel)}
        
        <div id="route-config-sector" class="mt-4 animate-fade-in"></div>
    `;
},

/** 🚄 零件 3：交通小卡模式 (數據自癒版) */
_renderTransportSector(item) {
    // 🚀 核心防禦：封殺 null，確保燃料在傳遞過程中保持實體狀態
    const fuel = item || {};
    
    return `
        ${this._renderDefaultSector(fuel)}
        
        <div id="route-config-sector" class="mt-4 animate-fade-in"></div>
    `;
},

/** 📸 零件 4：圖片上傳與預覽 (數據自癒版) */
_renderImageSector(item) {
    // 🚀 1. 物理脫敏：封殺 null，確保 item 永遠是一個實體
    const fuel = item || {};
    
    // 🚀 2. 屬性預洗：強迫轉換為字串，徹底封殺 TypeError 讀取風險
    const safeImageUrl = String(fuel.imageUrl || "");

    return `
        ${this._renderDefaultSector(fuel)}
        
        <div id="image-upload-sector" class="mt-4 space-y-4 animate-fade-in">
            <label class="text-[10px] font-black theme-text-pink uppercase tracking-widest px-1 block">Image Asset Storage</label>
            <div class="flex gap-2">
                <input type="text" id="node-image-url" value="${safeImageUrl}" 
                       placeholder="貼上圖片 URL 或點擊右側上傳..."
                       class="flex-1 bg-white rounded-xl p-4 text-[11px] font-bold outline-none ring-1 ring-slate-100 focus:ring-pink-100 theme-text-pink">
                
                <button onclick="App.triggerImageUpload()" 
                        class="shrink-0 w-14 h-14 bg-white border border-slate-100 rounded-2xl shadow-sm flex items-center justify-center text-xl active:scale-90 transition-all cursor-pointer">📁</button>
            </div>
            
            <input type="file" id="hidden-file-input" class="hidden" accept="image/*" onchange="App.handleImageUpload(this)">

            <div id="image-preview-box" class="w-full aspect-video rounded-[2rem] bg-white border-2 border-dashed border-slate-100 overflow-hidden flex items-center justify-center relative">
                ${safeImageUrl ? 
                    `<img src="${safeImageUrl}" class="w-full h-full object-cover">` : 
                    '<span class="text-[9px] text-slate-300 font-black uppercase tracking-[0.2em]">File Preview Pending</span>'
                }
            </div>
        </div>`;
},


/** 🔌 零件 5：萬用燃料注入區 (數據自癒版) */
_renderImportSector(item) {
    // 🚀 1. 物理脫敏：封殺 null，確保入口燃料實體化
    const fuel = item || {};
    
    // 🚀 2. 屬性預洗：強行轉換為字串，確保隱藏欄位的數據對焦安全
    const safeTime = String(fuel.time || "");
    const safeLocation = String(fuel.location || "");

    return `
        <div class="bg-pink-50/50 rounded-[2.5rem] p-8 border border-pink-100 text-center space-y-4 animate-pulse my-4">
            <div class="text-3xl">🔌</div>
            <div>
                <p class="text-[11px] font-black theme-text-pink uppercase tracking-widest">Data Injection Gateway</p>
                <p class="text-[10px] text-slate-400 font-medium mt-1">系統正在感應剪貼簿，請貼上高品質燃料包</p>
            </div>
            <div class="pt-2">
                <button onclick="App.syncStyleUI('import')" 
                        class="theme-bg text-white px-8 py-3 rounded-full text-[10px] font-black shadow-lg shadow-pink-100 active:scale-95 transition-all">
                    手動點火注入
                </button>
            </div>
        </div>

        <div class="hidden" id="basic-location-sector">
            <input type="time" id="sched-time" value="${safeTime}">
            <input type="text" id="sched-location" value="${safeLocation}">
        </div>
        <div id="route-config-sector" class="hidden"></div>`;
},


/** 🛍️ 零件 6：購物清單發動機 (數據自癒版) */
_renderShoppingSector(item) {
    // 🚀 1. 物理脫敏：封殺 null，確保進入子零件前燃料已對焦
    const fuel = item || {};

    return `
        <div id="shopping-config-sector" class="space-y-3 mb-5">
            <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1 block">AI 採購參數</label>
            <div class="grid grid-cols-2 gap-3">
                <input type="text" id="shop-city" placeholder="城市 (如：京都)" 
                       class="bg-white rounded-2xl p-4 font-bold text-sm shadow-sm outline-none ring-1 ring-slate-50 focus:ring-pink-100 transition-all">
                <input type="text" id="shop-item" placeholder="品項 (如：蝦餅)" 
                       class="bg-white rounded-2xl p-4 font-bold text-sm shadow-sm outline-none ring-1 ring-slate-50 focus:ring-pink-100 transition-all">
            </div>
        </div>

        ${this._renderDefaultSector(fuel)}

        <div id="visual-shopping-editor" class="mt-5 space-y-2 border-t border-slate-100 pt-5">
            <label class="text-[10px] font-black theme-text-pink uppercase tracking-widest px-1 block mb-2">視覺化清單管理</label>
            <div id="shopping-list-container" class="space-y-2 min-h-[40px]">
                </div>
        </div>`;
},


// ============================================================
// 2. [Checklist Module] 攜帶清單系統視圖
// 負責：標籤導航、物品卡片、分類過濾
// ============================================================


/** 🎨 視圖演進：清單模組 (V2026.ULTRA 數據主權自癒版) */
renderChecklist(container, items = [], activeCategory = '全部') {
    // 🚀 1. 物理座標鎖定
    const activeTripId = state.activeTripId;
    const trip = state.trips.find(t => t.id === activeTripId);
    if (!trip) return;

    // 🚀 2. 數據導通總線 (Omni-Channel Sampling)
    // 💡 職人診斷：優先取用 state 緩存，次之取用物件內嵌(解決匯入真空)，最後採信傳入參數
    let rawFuel = window.state.checklistItems || trip.checklistItems || items || [];

    // 🚀 3. 數據基因自癒 (Data Normalization)
    // 💡 關鍵修復：若項目 tripId 不符或缺失(匯入件)，強制焊死至當前行程 ID
    // 這能封殺因為 ID 偏移導致的「隱形數據」問題
    const purifiedFuel = rawFuel.map(item => {
        if (!item.tripId || item.tripId !== activeTripId) {
            return { ...item, tripId: activeTripId };
        }
        return item;
    });

    // 🚀 4. 分類標籤對焦
    const customCats = trip.checklistConfig?.categories || ['證件', '財務', '交通', '電器', '通訊', '個人'];
    const categories = ['全部', ...customCats];
    
    // 🚀 5. 執行最終洗滌過濾
    const filteredItems = (activeCategory === '全部') 
        ? purifiedFuel 
        : purifiedFuel.filter(i => i.category === activeCategory);

    container.innerHTML = `
        <div class="checklist-module animate-fade-in space-y-6 pb-32">
            <div class="flex justify-between items-end">
                <div>
                    <h2 class="text-xl font-black text-slate-800 tracking-tight">check list</h2>
                    <p class="text-[10px] font-black theme-text-pink uppercase tracking-widest mt-1">${activeCategory} SECTOR</p>
                </div>
                <div class="flex gap-2">
                    <button onclick="App.shareChecklist()" class="bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-all">
                        <span class="text-xs">🔗</span> <span class="text-[10px] font-bold text-slate-600">分享</span>
                    </button>
                    <button onclick="App.openImportModal()" class="bg-green-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-all">
                        <span class="text-xs">🗄️</span> <span class="text-[10px] font-bold text-green-700">匯入</span>
                    </button>
                    <button onclick="App.promptEditChecklistCategories()" class="bg-slate-50 px-3 py-1.5 rounded-full flex items-center gap-1 active:scale-95 transition-all">
                        <span class="text-xs">⚙️</span> <span class="text-[10px] font-bold text-slate-600">標籤</span>
                    </button>
                </div>
            </div>

            <div id="checklist-tabs" class="flex gap-2 overflow-x-auto no-scrollbar pb-2 snap-x">
                ${categories.map(cat => `
                    <div class="snap-center">
                        <button id="tab-${cat}" onclick="App.filterChecklist('${cat}')" 
                                class="px-5 py-2 rounded-xl text-[11px] font-black border transition-all whitespace-nowrap
                                ${activeCategory === cat ? 'theme-bg text-white border-transparent shadow-lg' : 'bg-white text-slate-400 border-slate-100'}">
                            ${cat}
                        </button>
                    </div>
                `).join('')}
            </div>

            <div class="bg-white rounded-[2.5rem] border border-slate-50 p-6 shadow-sm min-h-[400px]">
                <div id="checklist-items" class="space-y-1">
                    ${this.renderChecklistItems(filteredItems, activeCategory)}
                </div>
                <button onclick="App.addNewChecklistItem()" class="w-full mt-6 py-4 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 text-xs font-black hover:border-pink-100 hover:text-pink-300 transition-all">
                    + 新增裝備零件
                </button>
            </div>
        </div>
    `;

    // 🚀 6. 物理對焦：自動置中 Tabs
    setTimeout(() => this.focusChecklistTab(activeCategory), 50);
    
    console.log(`📡 [Checklist-Engine] 磁區導通完畢 | 燃料: ${filteredItems.length} 筆`);
},


/** ⚙️ 系統設定發動機 (主控調度 - V2026.ULTRA 物理對焦修正版) */
renderSettings(container, activeTab = 'visual') {
    // 🚀 1. 物理磁區回溯
    const settings = {
        theme: localStorage.getItem('tf_theme_key') || 'rose-pink',
        voiceId: localStorage.getItem('tf_voice_id') || 'ja-JP-Neural2-B',
        audioRate: localStorage.getItem('tf_audio_rate') || '0.9',
        textScale: localStorage.getItem('tf_text_scale') || '100',
        uiScale: localStorage.getItem('tf_ui_scale') || '100', 
    };

    // 🚀 2. 構建雙軌導航組件 (直接對位參數 activeTab)
    const tabs = [
        { id: 'visual', icon: '🎨', label: '視覺' },
        { id: 'acoustic', icon: '🎙️', label: '聲學' }
    ];

    const tabsHTML = tabs.map(tab => {
        // 💡 關鍵修正：直接比對傳入的參數，不依賴外層物件快照
        const isHit = (tab.id === activeTab);
        
        return `
            <button onclick="App.navigateTo('settings', null, '${tab.id}')"
                    class="flex-1 py-4 flex flex-col items-center gap-1 transition-all duration-300 ${isHit ? 'opacity-100' : 'opacity-30'}">
                <span class="text-lg">${tab.icon}</span>
                <span class="text-[10px] font-black uppercase tracking-widest ${isHit ? 'theme-text-pink' : 'text-slate-400'}">${tab.label}</span>
                ${isHit ? '<div class="w-1.5 h-1.5 rounded-full theme-bg mt-0.5 animate-pulse shadow-[0_0_8px_var(--theme-primary)]"></div>' : '<div class="h-2"></div>'}
            </button>
        `;
    }).join('');

    // 🚀 3. 內容分流渲染
    // 💡 關鍵修正：使用當前活躍標籤決定內容
    let contentHTML = (activeTab === 'visual') 
        ? this._renderVisualTab(settings) 
        : this._renderAcousticTab(settings);

container.innerHTML = `
        <div class="settings-module animate-fade-in space-y-6 pb-32">
            <div class="bg-white/90 backdrop-blur-xl sticky top-0 z-[100] px-4 py-2 flex border-b border-slate-50 shadow-sm">
                ${tabsHTML}
            </div>
            <div class="px-4 space-y-6">
                ${contentHTML}
                ${this._renderSystemStatus()}
            </div>
        </div>
    `;

    // 聲學診斷面板資料初始化
    if (activeTab === 'acoustic') {
        requestAnimationFrame(() => App._initAcousticDiagnosticPanel());
    }
},


/** 🎙️ 任務分區：聲學對焦 (重構版) */
_renderAcousticTab(s) {
    return `
        <div class="animate-slide-up space-y-4">
            ${this._renderAcousticSwitcher()}
            ${this._renderVoiceSection(s.voiceId)}
            ${this._renderAcousticControlsSection(s.audioRate)}
            ${this._renderAcousticDiagnosticModule()}
        </div>
    `;
},

// ─────────────────────────────────────────────
//  Acoustic Diagnostic Module — refactored
// ─────────────────────────────────────────────

_getDebugToggleStyle(isActive) {
    return {
        label:      isActive ? '停止監控' : '啟動剖析',
        status:     isActive ? '#639922'  : 'var(--color-text-tertiary)',
        statusText: isActive
            ? '總線攔截中，時序熱圖與語調輪廓已導通至 F12。'
            : '啟動後將掛載攔截器至 TTS 總線，偵測長句與標點異常。',
    };
},

_renderAcousticHeader(isActive) {
    const s = this._getDebugToggleStyle(isActive);
    return `
        <div style="padding:14px 16px;display:flex;align-items:center;justify-content:space-between;background:var(--color-background-primary);border-bottom:0.5px solid var(--color-border-tertiary);">
            <div>
                <p style="font-size:14px;font-weight:500;color:var(--color-text-primary);margin:0;">聲學診斷</p>
                <p style="font-size:11px;color:var(--color-text-tertiary);margin:3px 0 0;letter-spacing:0.04em;text-transform:uppercase;">Acoustic Logic Debugger</p>
            </div>
            <button onclick="App.toggleAcousticDebug()"
                    style="display:inline-flex;align-items:center;gap:6px;font-size:11px;font-weight:500;cursor:pointer;transition:all 0.15s;
                           background:${isActive ? '#FBEAF0' : 'var(--color-background-secondary)'};
                           color:${isActive ? '#993556' : 'var(--color-text-secondary)'};
                           border:0.5px solid ${isActive ? '#F4C0D1' : 'var(--color-border-secondary)'};
                           border-radius:var(--border-radius-md);padding:6px 12px;">
                <span style="width:6px;height:6px;border-radius:50%;display:inline-block;
                             background:${isActive ? '#D4537E' : 'var(--color-text-tertiary)'};">
                </span>
                ${s.label}
            </button>
        </div>`;
},

_renderAcousticStatusBar(isActive) {
    const s = this._getDebugToggleStyle(isActive);
    return `
        <div style="padding:9px 16px;background:var(--color-background-secondary);border-bottom:0.5px solid var(--color-border-tertiary);display:flex;align-items:center;gap:8px;">
            <span style="width:6px;height:6px;border-radius:50%;flex-shrink:0;background:${s.status};"></span>
            <p style="font-size:11px;color:var(--color-text-secondary);margin:0;font-family:monospace;">${s.statusText}</p>
        </div>`;
},

_renderAcousticSnapshot() {
    return `
        <div style="padding:16px 16px 0;background:var(--color-background-primary);">
            <p style="font-size:10px;font-weight:500;color:var(--color-text-tertiary);margin:0 0 10px;text-transform:uppercase;letter-spacing:0.08em;">學習庫快照</p>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
                <div style="background:#FBEAF0;border:0.5px solid #F4C0D1;border-radius:var(--border-radius-md);padding:10px 13px;">
                    <p style="font-size:11px;font-weight:500;color:#993556;margin:0 0 5px;">窒息記錄</p>
                    <p style="font-size:22px;font-weight:500;color:#72243E;margin:0;" id="dm-choke-count">載入中</p>
                </div>
                <div style="background:#E6F1FB;border:0.5px solid #B5D4F4;border-radius:var(--border-radius-md);padding:10px 13px;">
                    <p style="font-size:11px;font-weight:500;color:#185FA5;margin:0 0 5px;">建議閾值</p>
                    <p style="font-size:22px;font-weight:500;color:#0C447C;margin:0;" id="dm-threshold">載入中</p>
                </div>
            </div>
        </div>
        <div style="padding:0 16px 16px;background:var(--color-background-primary);border-bottom:1px solid #E2E8F0;">
            <p style="font-size:10px;font-weight:500;color:var(--color-text-tertiary);margin:0 0 8px;text-transform:uppercase;letter-spacing:0.08em;">高頻觸發詞</p>
            <div id="dm-trigger-tags" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:12px;min-height:20px;"></div>
            <button onclick="App.clearAcousticLearning()"
                    style="display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:500;cursor:pointer;
                           background:var(--color-background-secondary);color:var(--color-text-secondary);
                           border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);padding:5px 10px;">
                <i class="fa-solid fa-trash-can" style="font-size:11px;"></i> 清除學習庫
            </button>
        </div>`;
},

_renderAcousticChokeList() {
    return `
        <div style="padding:14px 16px;background:var(--color-background-primary);border-bottom:1px solid #E2E8F0;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <p style="font-size:10px;font-weight:500;color:var(--color-text-tertiary);margin:0;text-transform:uppercase;letter-spacing:0.08em;">窒息記錄（可勾選）</p>
                <div style="display:flex;gap:6px;">
                    <button onclick="App.selectAllChokeRecords()"
                            style="font-size:10px;padding:3px 9px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;
                                   background:var(--color-background-secondary);color:var(--color-text-secondary);
                                   border:0.5px solid var(--color-border-tertiary);border-radius:var(--border-radius-md);">
                        全選
                    </button>
                    <button onclick="App.copySelectedChokeRecords()" id="dm-copy-sel-btn"
                            style="font-size:10px;padding:3px 9px;display:none;align-items:center;gap:4px;cursor:pointer;
                                   background:#FBEAF0;color:#993556;
                                   border:0.5px solid #F4C0D1;border-radius:var(--border-radius-md);">
                        <i class="fa-solid fa-copy" style="font-size:11px;"></i> 複製選取
                    </button>
                </div>
            </div>
            <div id="dm-choke-list"></div>
        </div>`;
},

_renderAcousticFooter() {
    return `
        <div style="padding:11px 16px;background:var(--color-background-secondary);display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:7px;">
                <span style="width:5px;height:5px;border-radius:50%;background:#639922;flex-shrink:0;"></span>
                <span style="font-size:11px;color:var(--color-text-tertiary);font-family:monospace;letter-spacing:0.04em;">CORE RENDERING: STABLE</span>
            </div>
            <button onclick="App.copyAllChokeRecords()"
                    style="font-size:10px;padding:4px 10px;display:inline-flex;align-items:center;gap:4px;cursor:pointer;
                           background:var(--color-background-primary);color:var(--color-text-secondary);
                           border:0.5px solid var(--color-border-secondary);border-radius:var(--border-radius-md);">
                <i class="fa-solid fa-copy" style="font-size:11px;"></i> 一鍵複製全部
            </button>
        </div>`;
},

_renderAcousticDiagnosticModule() {
    const isActive = localStorage.getItem('TF_DEBUG') === 'true';
    return `
        <div class="mt-4 pt-6 border-t border-slate-100 animate-fade-in">
            <div style="
                background: white !important;
                border: 1px solid #E2E8F0 !important;
                border-radius: 16px !important;
                overflow: hidden !important;
                box-shadow: 0 2px 8px rgba(0,0,0,0.08) !important;
            ">
                ${this._renderAcousticHeader(isActive)}
                ${this._renderAcousticStatusBar(isActive)}
                ${this._renderAcousticSnapshot()}
                ${this._renderAcousticChokeList()}
                ${this._renderAcousticFooter()}
            </div>
        </div>`;
},


/** 🧩 聲學參數區（語速 + 音高 + 長句補償，三合一） */
_renderAcousticControlsSection(currentRate) {
    const pitch = localStorage.getItem('tf_audio_pitch') || '0';
    const rate = currentRate || localStorage.getItem('tf_audio_rate') || '1.0';
    const offset = parseInt(localStorage.getItem('tf_long_phrase_offset') || '-6');

    const controls = [
        {
            label: '語速校準',
            sub: 'Speaking Rate',
            id: 'audio-rate-display',
            val: rate,
            unit: 'x',
            min: 0.5, max: 2.0, step: 0.1,
            color: '#D4537E',
            handler: 'App.changeAudioRate(this.value)',
            hint: null
        },
        {
            label: '音高補償',
            sub: 'Vocal Pitch Offset',
            id: 'audio-pitch-display',
            val: pitch,
            unit: '',
            min: -4.0, max: 4.0, step: 0.5,
            color: '#185FA5',
            handler: 'App.changeAudioPitch(this.value)',
            hint: null
        },
        {
            label: '長句呼吸補償',
            sub: 'Long-Phrase Speed Offset',
            id: 'long-phrase-offset-display',
            val: offset,
            unit: '%',
            min: -15, max: 5, step: 1,
            color: '#1D9E75',
            handler: 'App.changeLongPhraseOffset(this.value)',
            hint: '僅針對超過 20 字的長難句生效'
        }
    ];

    const renderSlider = (c) => `
        <div style="padding:14px 0; border-top:0.5px solid #E2E8F0;">
            <div style="display:flex; align-items:center; justify-content:space-between; margin-bottom:10px;">
                <div>
                    <p style="font-size:13px; font-weight:700; color:#1a1a1a; margin:0 0 2px;">
                        ${c.label}
                    </p>
                    <p style="font-size:10px; font-weight:600; color:#888780;
                               text-transform:uppercase; letter-spacing:0.08em; margin:0;">
                        ${c.sub}
                    </p>
                </div>
                <span id="${c.id}"
                      style="font-size:16px; font-weight:700; color:${c.color}; min-width:40px; text-align:right;">
                    ${c.val}${c.unit}
                </span>
            </div>
            <input type="range"
                   min="${c.min}" max="${c.max}" step="${c.step}" value="${c.val}"
                   oninput="${c.handler}; document.getElementById('${c.id}').textContent = this.value + '${c.unit}'"
                   style="width:100%; accent-color:${c.color}; cursor:pointer;">
            ${c.hint ? `
            <p style="font-size:10px; color:#B4B2A9; margin:6px 0 0; font-style:italic;">
                ※ ${c.hint}
            </p>` : ''}
        </div>`;

    return `
        <div style="background:white; border-radius:1.4rem; border:0.5px solid #E2E8F0;
                    overflow:hidden; padding:16px 16px 6px;">

            <!-- 標題 -->
            <div style="margin-bottom:4px;">
                <h3 style="font-size:14px; font-weight:700; color:#1a1a1a; margin:0 0 2px;">
                    聲學參數調校
                </h3>
                <p style="font-size:10px; font-weight:600; color:#888780;
                           text-transform:uppercase; letter-spacing:0.08em; margin:0;">
                    Acoustic Parameter Control
                </p>
            </div>

            ${controls.map(renderSlider).join('')}

            <!-- 停止播放 -->
            <div style="padding:12px 0 8px; border-top:0.5px solid #E2E8F0; margin-top:4px;">
                <button onclick="App.stopAllSpeech()"
                        style="display:flex; align-items:center; justify-content:center; gap:6px;
                               width:100%; padding:10px; background:#F8F6F3;
                               border:0.5px solid #E2E8F0; border-radius:10px;
                               color:#5F5E5A; font-size:12px; font-weight:700;
                               cursor:pointer; transition:background 0.15s;"
                        onmouseover="this.style.background='#FCEBEB'; this.style.color='#A32D2D'"
                        onmouseout="this.style.background='#F8F6F3'; this.style.color='#5F5E5A'">
                    <i class="fa-solid fa-stop" style="font-size:11px;"></i>
                    停止所有播放
                </button>
            </div>

        </div>`;
},

/** 🔘 子組件：聲學語系切換撥盤 (Acoustic Switcher) */
_renderAcousticSwitcher() {
    const settingLang = localStorage.getItem('tf_setting_voice_lang') || 'JP';
    const isEN = settingLang === 'EN';

    return `
        <div class="bg-white rounded-[2.5rem] p-6 border border-slate-50 shadow-sm space-y-4">
            <div class="px-1">
                <h3 class="font-black text-slate-800 text-[1rem]">聲學測試語系</h3>
                <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Sample Language Focus</p>
            </div>
            <div class="bg-slate-100/80 p-1 rounded-2xl flex items-center border border-slate-200/40 shadow-inner">
                <button onclick="App.setSettingVoiceLang('JP')" 
                        class="flex-1 py-3 rounded-xl text-[10px] font-black transition-all duration-300 ${!isEN ? 'bg-white shadow-md theme-text-pink' : 'text-slate-400'}">
                    🇯🇵 JAPANESE
                </button>
                <button onclick="App.setSettingVoiceLang('EN')" 
                        class="flex-1 py-3 rounded-xl text-[10px] font-black transition-all duration-300 ${isEN ? 'bg-white shadow-md text-blue-600' : 'text-slate-400'}">
                    🇺🇸 ENGLISH
                </button>
            </div>
        </div>
    `;
},

/** 🎨 任務分區：視覺個人化 (V2026.ULTRA 校準版) */
_renderVisualTab(s) {
    return `
        <div class="animate-slide-up space-y-6">
            ${this._renderThemeSection(s.theme)}
            
            ${this._renderVisualFocusSection(s.textScale, s.uiScale)}
        </div>
    `;
},


/** 🎨 子發動機：色彩配色區 (V2026.ULTRA 視覺導通版) */
_renderThemeSection(currentTheme) {
    const THEMES = {
        'land-green': { hex: '#4ade80', name: '大地綠' },
        'sky-blue':   { hex: '#38bdf8', name: '天空藍' },
        'lavender':   { hex: '#a78bfa', name: '薰衣紫' },
        'rose-pink':  { hex: '#fb7185', name: '玫瑰粉' },
        'sunset-orange': { hex: '#fb923c', name: '夕陽橙' },
        'moon-gray':  { hex: '#64748b', name: '月夜灰' }
    };

    const themeHTML = Object.entries(THEMES).map(([key, theme]) => {
        const isActive = (key === currentTheme);
        // 🚀 物理特徵：選中時點亮陰影並放大，未選中時維持低干擾
        const activeStyles = isActive 
            ? `border: 3px solid #1e293b; transform: scale(1.15); box-shadow: 0 10px 15px -3px ${theme.hex}44;` 
            : `border: 1px solid #f1f5f9; transform: scale(1);`;

        return `
            <div class="flex flex-col items-center gap-2 shrink-0">
                <div onclick="App.changeTheme('${key}')" 
                     class="theme-dot w-10 h-10 rounded-full cursor-pointer transition-all duration-300 ease-out" 
                     style="background-color: ${theme.hex}; ${activeStyles}">
                </div>
                <span class="text-[0.6rem] font-black ${isActive ? 'text-slate-800' : 'text-slate-400'} uppercase tracking-tighter transition-colors">
                    ${theme.name}
                </span>
            </div>
        `;
    }).join('');

    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-6">
            <div class="px-1">
                <h3 class="font-black text-slate-800 text-[1rem]">職人系統配色</h3>
                <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Color Schema Protocol</p>
            </div>
            <div class="flex items-center gap-5 overflow-x-auto no-scrollbar py-2 px-1">
                ${themeHTML}
            </div>
        </div>
    `;
},


/** 🧩 聲線選取器（從 CONFIG.VOICE_LIST 動態讀取） */
_renderVoiceSection(currentVoiceId) {
    const settingLang = localStorage.getItem('tf_setting_voice_lang') || 'JP';
    const isEN = (settingLang === 'EN');

    const allVoices = CONFIG?.VOICE_LIST || [];
    const jpVoices = allVoices.filter(v => v.id.startsWith('ja-JP'));
    const enVoices = allVoices.filter(v => v.id.startsWith('en-'));
    const activeVoices = isEN ? enVoices : jpVoices;

    const maleVoices = activeVoices.filter(v => v.gender === 'M');
    const femaleVoices = activeVoices.filter(v => v.gender === 'F');

    const finalId = activeVoices.some(v => v.id === currentVoiceId)
        ? currentVoiceId
        : activeVoices[0]?.id || '';

    const renderGroup = (label, voices) => `
        <optgroup label="${label}">
            ${voices.map(v => `
                <option value="${v.id}" ${v.id === finalId ? 'selected' : ''}>
                    ${v.name}　—　${v.desc}
                </option>`).join('')}
        </optgroup>`;

    return `
        <div style="background:white; border-radius:1.4rem; border:0.5px solid #E2E8F0;
                    overflow:hidden; padding:16px 16px 14px;">

            <!-- 標題 -->
            <div style="margin-bottom:14px;">
                <h3 style="font-size:14px; font-weight:700; color:#1a1a1a; margin:0 0 2px;">
                    AI 聲線選擇
                </h3>
                <p style="font-size:10px; font-weight:600; color:#888780;
                           text-transform:uppercase; letter-spacing:0.08em; margin:0;">
                    ${isEN ? 'English Voice Identity' : 'Japanese Voice Identity'}
                    　·　${activeVoices.length} 組可用
                </p>
            </div>

            <!-- 下拉選單 -->
            <select id="voice-picker-select"
                    onchange="App.changeVoice(this.value)"
                    style="width:100%; background:#F8F6F3; border:0.5px solid #E2E8F0;
                           border-radius:10px; padding:10px 14px; font-size:13px;
                           font-weight:600; color:#1a1a1a; cursor:pointer;
                           appearance:none; outline:none;">
                ${renderGroup('♂ 男聲', maleVoices)}
                ${renderGroup('♀ 女聲', femaleVoices)}
            </select>

            <!-- 目前選取的聲線描述 -->
            <div id="voice-desc-display"
                 style="margin-top:10px; padding:8px 12px; background:#FBEAF0;
                        border-radius:8px; font-size:12px; color:#993556; font-weight:600;">
                ${activeVoices.find(v => v.id === finalId)?.desc || ''}
            </div>

            <!-- 試聽 -->
            <button onclick="App.playCurrentSample()"
                    style="display:flex; align-items:center; justify-content:center; gap:6px;
                           width:100%; margin-top:10px; padding:10px;
                           background:#D4537E; border:none; border-radius:10px;
                           color:white; font-size:12px; font-weight:700; cursor:pointer;
                           transition:opacity 0.15s;"
                    onmouseover="this.style.opacity='0.85'"
                    onmouseout="this.style.opacity='1'">
                <i class="fa-solid fa-volume-high" style="font-size:12px;"></i>
                試聽此聲線
            </button>

        </div>`;
},



/** 👓 子發動機：視認性全方位對焦 (V2026.ULTRA 佈局加固版) */
_renderVisualFocusSection(textScale, uiScale) {
    return `
        <div class="bg-white rounded-[2.5rem] p-8 border border-slate-50 shadow-sm space-y-8 animate-slide-up">
            <div class="space-y-6">
                <div class="flex justify-between items-center px-1">
                    <div>
                        <h3 class="font-black text-slate-800 text-[1rem]">文字視認性對焦</h3>
                        <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">Font Focus Protocol</p>
                    </div>
                    <span id="text-scale-display" class="theme-text-pink font-black text-[1.1rem]">${textScale}%</span>
                </div>
                <div class="relative py-2">
                    <input type="range" min="90" max="140" value="${textScale}" 
                        oninput="App.changeTextSize(this.value)"
                        style="accent-color: var(--theme-primary);"
                        class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer">
                </div>
            </div>

            <div class="space-y-6 pt-2 border-t border-slate-50">
                <div class="flex justify-between items-center px-1">
                    <div>
                        <h3 class="font-black text-slate-800 text-[1rem]">介面佈局校準</h3>
                        <p class="text-[0.65rem] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">UI Canvas Scale</p>
                    </div>
                    <span id="ui-scale-display" class="theme-text-pink font-black text-[1.1rem]">${uiScale}%</span>
                </div>
                <div class="relative py-2">
                    <input type="range" min="85" max="115" value="${uiScale}" 
                        oninput="App.changeUISize(this.value)"
                        style="accent-color: var(--theme-primary);"
                        class="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer">
                </div>
            </div>
            
            <p class="text-[0.65rem] text-slate-300 px-1 leading-relaxed">
                提示：調整 Canvas 縮放可優化單手操作範圍，適合不同尺寸移動設備。
            </p>
        </div>
    `;
},


/** 🛰️ 子組件：系統狀態頁底 */
_renderSystemStatus() {
    return `
        <div class="p-5 bg-slate-50/50 rounded-[1.5rem] flex justify-between items-center border border-slate-50">
            <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
                <span class="text-[0.6rem] font-black text-slate-400 uppercase tracking-widest italic">Core Rendering: Stable</span>
            </div>
            <span class="text-[0.6rem] font-bold text-slate-300">V2026.ULTRA.FINAL</span>
        </div>
    `;
},

/** 🧪 渲染數據指紋診斷器 */
renderFingerprintInspector(healthData) {
    const format = (ts) => ts > 0 ? new Date(ts).toLocaleString('zh-TW', { 
        month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' 
    }) : '---';

    return `
        <div class="fingerprint-inspector bg-slate-50 rounded-[2rem] p-6 border border-slate-100 space-y-4 animate-fade-in">
            <div class="flex justify-between items-center px-1">
                <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-widest">數據指紋診斷器</h4>
                <span class="text-[9px] font-black ${healthData.status.color} px-2 py-0.5 bg-white rounded-full border border-slate-100 shadow-sm">
                    ${healthData.status.icon} ${healthData.status.label}
                </span>
            </div>

            <div class="grid grid-cols-2 gap-4 relative">
                <div class="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-[10px] text-slate-200">⇌</div>
                
                <div class="space-y-1">
                    <p class="text-[8px] font-black text-slate-400 text-center uppercase">本地指紋</p>
                    <p class="text-xs font-mono font-black text-slate-600 text-center">${format(healthData.localTs)}</p>
                </div>
                <div class="space-y-1 border-l border-slate-200/50">
                    <p class="text-[8px] font-black text-slate-400 text-center uppercase">雲端指紋</p>
                    <p class="text-xs font-mono font-black text-slate-600 text-center">${format(healthData.cloudTs)}</p>
                </div>
            </div>

            <div class="pt-2 border-t border-slate-200/50">
                <p class="text-[9px] text-slate-400 text-center font-bold">
                    💡 狀態提示：${healthData.status.hint}
                </p>
            </div>
        </div>
    `;
},


/** 🚀 物理對焦：分類標籤置中捲動 */
focusChecklistTab(cat) {
    requestAnimationFrame(() => {
        const tab = document.getElementById(`tab-${cat}`);
        if (tab) {
            tab.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
                inline: 'center'
            });
        }
    });
},


/** 🎨 子組件：渲染單個物品卡片 (補強編輯入口) */
renderChecklistItems(items, categoryFilter) {
    // 1. 執行數據過濾
    const filtered = categoryFilter === '全部' 
        ? items 
        : items.filter(i => i.category === categoryFilter);

    if (filtered.length === 0) return `<div class="py-20 text-center text-slate-300 text-xs font-bold italic">CATEGORY EMPTY</div>`;
    
    return filtered.map((item, index) => {
        // 🚀 關鍵：在原始 items 中尋找真正的索引以供編輯使用
        const realIndex = items.findIndex(i => i.id === item.id);
        
        return `
        <div class="flex items-center gap-4 py-4 group hover:bg-slate-50/50 rounded-2xl px-2 transition-all">
            <div onclick="App.toggleCheckItem('${item.id}')" 
                 class="w-10 h-10 shrink-0 rounded-2xl border-2 flex items-center justify-center cursor-pointer transition-all
                 ${item.done ? 'theme-bg border-transparent' : 'border-slate-100 hover:border-pink-200'}">
                ${item.done ? '<span class="text-white">✓</span>' : ''}
            </div>
            
            <div class="flex-grow cursor-pointer" onclick="App.addNewChecklistItem(${realIndex})">
                <p class="text-sm font-bold ${item.done ? 'text-slate-300 line-through' : 'text-slate-700'}">${item.task}</p>
                <span class="inline-block mt-1 px-2 py-0.5 rounded-md text-[9px] font-black" 
                      style="background-color: ${item.tagColor}20; color: ${item.tagColor}">
                    ${item.category}
                </span>
            </div>
            
            <div class="opacity-0 group-hover:opacity-100 text-[10px] text-slate-300">⚙️</div>
        </div>
        <div class="h-[1px] bg-slate-50 w-full last:hidden"></div>
    `}).join('');
},


// ============================================================
// 3. [Satellite Components] 衛星縮圖組件
// 負責：概覽小卡、航班縮圖、飯店摘要
// ============================================================


/** 🛰️ 獨立組件：行程總覽 (V2026.ULTRA 物理回收 - 強制顯現版) */
renderOverviewCard(trip) {
    if (!trip) return '';

    const locationText = trip.city || '未設定地點';
    const dayCount = trip.days?.length || 0;
    const peopleCount = trip.companions || 1;

    return `
        <div class="px-2 py-4 animate-fade-in flex justify-between items-end border-b border-slate-100 mb-2">
            
            <div class="space-y-1.5">
                <h2 class="text-3xl font-black tracking-tighter text-slate-800 leading-none">
                    ${locationText}
                </h2>
                <div class="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    <span>🗓️ ${dayCount} Days</span>
                    <span>👥 ${peopleCount} Persons</span>
                </div>
            </div>

            <div class="flex items-center gap-2">
                <button onclick="App.promptEditOverview('${trip.id}')" 
                        class="p-3 text-slate-500 bg-slate-50 hover:bg-slate-100 rounded-2xl transition-all active:scale-90">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"/>
                    </svg>
                </button>

                <button onclick="App.confirmDeleteTrip('${trip.id}')" 
                        class="p-3 text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-2xl transition-all active:scale-90"
                        title="回收此行程">
                    <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                    </svg>
                </button>
            </div>
        </div>
    `;
},


/** 🛫 編輯班機與核心參數 (V2026.ULTRA 數據軌道擴充版) */
promptEditOverview(tripId) {
    const trip = state.trips.find(t => t.id === tripId);
    if (!trip) return;

    // 🚀 數據預洗：提領現有航網指紋，確保 Edit 模式導通
    const dep = trip.transport?.departure || {};
    const ret = trip.transport?.return || {};

    const content = `
        <div class="space-y-6 max-h-[60vh] overflow-y-auto px-1 no-scrollbar text-left">
            <!-- 📍 區域對焦 -->
            <div class="space-y-2">
                <label class="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">目的地區域</label>
                <input type="text" id="edit-city" value="${trip.city || ''}" 
                       class="w-full bg-slate-50 border-none rounded-2xl p-4 font-black text-sm outline-none focus:ring-2 focus:ring-pink-100 transition-all shadow-inner">
            </div>
            
            <!-- 🛫 去程航班 (Departure) -->
            <div class="bg-slate-50/50 p-5 rounded-[2rem] space-y-4 border border-slate-100/50">
                <p class="text-[9px] font-black theme-text-pink uppercase tracking-widest flex items-center gap-2">
                    <span class="text-xs">🛫</span> 去程航班 Departure
                </p>
                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                        <label class="text-[8px] font-black text-slate-300 uppercase px-1">航空公司</label>
                        <input type="text" id="flight-dep-carrier" placeholder="如：長榮航空" value="${dep.carrier || ''}" class="w-full bg-white rounded-xl p-3 text-xs font-bold border-none shadow-sm outline-none focus:ring-1 focus:ring-pink-200">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[8px] font-black text-slate-300 uppercase px-1">班機號碼</label>
                        <input type="text" id="flight-dep-code" placeholder="如：BR111" value="${dep.code || ''}" class="w-full bg-white rounded-xl p-3 text-xs font-bold border-none shadow-sm outline-none focus:ring-1 focus:ring-pink-200">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[8px] font-black text-slate-300 uppercase px-1">起飛機場</label>
                        <input type="text" id="flight-dep-port" placeholder="如：TPE" value="${dep.airport || ''}" class="w-full bg-white rounded-xl p-3 text-xs font-bold border-none shadow-sm outline-none focus:ring-1 focus:ring-pink-200">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[8px] font-black text-slate-300 uppercase px-1">時間</label>
                        <input type="time" id="flight-dep-time" value="${dep.time || ''}" class="w-full bg-white rounded-xl p-3 text-xs font-bold border-none shadow-sm outline-none focus:ring-1 focus:ring-pink-200">
                    </div>
                </div>
            </div>

            <!-- 🛬 回程航班 (Return) -->
            <div class="bg-slate-50/50 p-5 rounded-[2rem] space-y-4 border border-slate-100/50">
                <p class="text-[9px] font-black theme-text-pink uppercase tracking-widest flex items-center gap-2">
                    <span class="text-xs">🛬</span> 回程航班 Return
                </p>
                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5">
                        <label class="text-[8px] font-black text-slate-300 uppercase px-1">航空公司</label>
                        <input type="text" id="flight-ret-carrier" placeholder="如：長榮航空" value="${ret.carrier || ''}" class="w-full bg-white rounded-xl p-3 text-xs font-bold border-none shadow-sm outline-none focus:ring-1 focus:ring-pink-200">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[8px] font-black text-slate-300 uppercase px-1">班機號碼</label>
                        <input type="text" id="flight-ret-code" placeholder="如：BR111" value="${ret.code || ''}" class="w-full bg-white rounded-xl p-3 text-xs font-bold border-none shadow-sm outline-none focus:ring-1 focus:ring-pink-200">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[8px] font-black text-slate-300 uppercase px-1">起飛機場</label>
                        <input type="text" id="flight-ret-port" placeholder="如：KIX" value="${ret.airport || ''}" class="w-full bg-white rounded-xl p-3 text-xs font-bold border-none shadow-sm outline-none focus:ring-1 focus:ring-pink-200">
                    </div>
                    <div class="space-y-1.5">
                        <label class="text-[8px] font-black text-slate-300 uppercase px-1">時間</label>
                        <input type="time" id="flight-ret-time" value="${ret.time || ''}" class="w-full bg-white rounded-xl p-3 text-xs font-bold border-none shadow-sm outline-none focus:ring-1 focus:ring-pink-200">
                    </div>
                </div>
            </div>
        </div>`;
            
    const actions = `
        <button onclick="App.modalRemove('edit-overview-modal')" class="flex-1 py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
        <button onclick="App.saveTransportData('${tripId}')" class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">更新航網數據</button>`;
    
    this.modalCreate('edit-overview-modal', '🔧 航網數據設定', content, actions);
},


    // 3. 行程框組件 (D1...Dn 獨立生成器)
    renderDayTrack(container, trip) {
        if (!container || !trip.days) return;

        // 循環生成與行程概覽風格一致的圓角框
        const html = trip.days.map((day, index) => `
            <div onclick="App.navigateToDayDetail('${trip.id}', ${index})" 
                 class="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex justify-between items-center cursor-pointer hover:shadow-md transition-all animate-fade-in"
                 style="animation-delay: ${index * 0.05}s">
                
                <div class="flex items-center gap-4">
                    <div class="w-10 h-10 theme-bg/10 rounded-xl flex items-center justify-center text-pink-500 font-black text-xs">
                        D${day.dayNum}
                    </div>
                    
                    <div>
                        <h4 class="font-black text-slate-800 text-sm">Day ${day.dayNum}</h4>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            ${day.city && day.city.length > 0 ? day.city.join(' · ') : 'Route Pending'}
                        </p>
                    </div>
                </div>

                <div class="text-slate-200 font-black text-xs">
                    <span class="mr-2 text-[8px] opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">View Details</span>
                    <span>→</span>
                </div>
            </div>
        `).join('');

        // 物理注入
        container.innerHTML = html || `
            <div class="py-10 text-center border-2 border-dashed border-slate-100 rounded-[2.5rem]">
                <p class="text-xs text-slate-300 font-black uppercase tracking-widest">No days defined in itinerary.</p>
            </div>
        `;
    },



// ============================================================
// 4. [Roadmap & Schedule] 行程規劃與路網
// 負責：每日分頁、節點卡片、Timeline 生成
// ============================================================


renderTripDetail(container, trip) {
    if (!trip) return;
    container.innerHTML = `
        <div class="animate-fade-in space-y-4">
            <div id="overview-section">${this.renderOverviewCard(trip)}</div>
            <div id="satellite-track-mount" class="relative -mx-5 overflow-hidden"></div>
            <div id="day-tabs-container" class="flex gap-2 overflow-x-auto pb-2 no-scrollbar px-1"></div>
            <div id="day-content-area" class="animate-fade-in -mx-5"></div>
        </div>
    `;
    this._renderSatelliteTrack(document.getElementById('satellite-track-mount'), trip, 1);
    this.renderDayTabs(document.getElementById('day-tabs-container'), trip, 0);
    this.renderDayDetailContent(document.getElementById('day-content-area'), trip, 0);
},

renderDayTabs(container, trip, activeIndex) {
    if (!container || !trip.days) return;

    const allFlights = Array.isArray(trip.transport) ? trip.transport : [];
    const allHotels = Array.isArray(trip.hotels) ? trip.hotels : [];

    container.innerHTML = trip.days.map((day, index) => {
        const isActive = index === activeIndex;
        const dayNum = day.dayNum;

        const hasFlight = allFlights.some(f => Number(f.day) === Number(dayNum));
        const hasHotel = allHotels.some(h => h.days && h.days.includes(dayNum));
        const hasDot = hasFlight || hasHotel;

        return `
            <div class="snap-center shrink-0">
                <button id="day-tab-${index}"
                        onclick="App.switchDay('${trip.id}', ${index})"
                        style="
                            padding: 6px 16px;
                            border-radius: 20px;
                            font-size: 11px;
                            font-weight: 800;
                            letter-spacing: 0.04em;
                            cursor: pointer;
                            border: 0.5px solid ${isActive ? '#D4537E' : '#E2E8F0'};
                            background: ${isActive ? '#D4537E' : 'white'};
                            color: ${isActive ? 'white' : '#B4B2A9'};
                            transition: all 0.2s;
                            display: flex;
                            align-items: center;
                            gap: 5px;
                            white-space: nowrap;
                        ">
                    DAY ${dayNum}
                    ${hasDot ? `<span style="
                        width: 4px; height: 4px;
                        border-radius: 50%;
                        background: ${isActive ? 'rgba(255,255,255,0.7)' : '#D4537E'};
                        display: inline-block;
                        flex-shrink: 0;
                    "></span>` : ''}
                </button>
            </div>
        `;
    }).join('');
},


// - renderDayTrack(cont, trip)         : 扁平化行程框生成器


renderDayDetailContent(container, trip, dayIndex) {
    if (!container || !trip || !trip.days) return;

    const dayData = trip.days[dayIndex];
    if (!dayData) return;

    const schedules = dayData.schedules || [];
    const viewMode = localStorage.getItem(`tf_day_view_${trip.id}`) || 'route';
    const isOverview = viewMode === 'overview';

    const scheduleListHtml = (() => {
        if (schedules.length === 0) {
            return `<div style="
                padding: 64px 16px;
                background: white;
                border-radius: 16px;
                border: 1.5px dashed #E8E5DE;
                text-align: center;
                margin: 0 4px;
            ">
                <div style="font-size: 28px; margin-bottom: 10px; opacity: 0.2;">🗺️</div>
                <p style="font-size: 10px; font-weight: 800; color: #D3D1C7; text-transform: uppercase; letter-spacing: 0.2em;">Route Pending</p>
            </div>`;
        }
        if (isOverview) {
            return this._renderDayOverview(schedules);
        }
        return schedules.map((item, idx) => {
            const purifiedItem = {
                ...item,
                style: (item.style && typeof item.style === 'string')
                    ? item.style.toLowerCase().trim()
                    : 'default'
            };
            return this.renderScheduleItem(trip.id, dayIndex, purifiedItem, idx, idx === schedules.length - 1);
        }).join('');
    })();

    container.innerHTML = `
        <div class="schedule-section animate-fade-in pb-32" style="margin-left: -8px;">

            <!-- ── Header Card ── -->
            <div style="
                background: white;
                border-radius: 16px;
                border: 0.5px solid #E8E5DE;
                margin: 0 20px 12px;
                overflow: hidden;
            ">
                <!-- 上半：D標題 + 加號 -->
                <div style="
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 12px 14px 10px;
                ">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div style="
                            width: 36px; height: 36px;
                            background: #FBEAF0;
                            border-radius: 10px;
                            display: flex; align-items: center; justify-content: center;
                            flex-shrink: 0;
                        ">
                            <span style="font-size: 13px; font-weight: 800; color: #D4537E; font-style: italic;">D${dayIndex + 1}</span>
                        </div>
                        <div>
                            <div style="font-size: 16px; font-weight: 800; color: #1a1a1a; line-height: 1.2;">
                                ${isOverview ? '行程總覽' : '路線規劃'}
                            </div>
                            <div style="font-size: 9px; font-weight: 700; color: #B4B2A9; text-transform: uppercase; letter-spacing: 0.15em; margin-top: 2px;">
                                ${isOverview ? 'Tree Matrix View' : 'Sequential Route'}
                            </div>
                        </div>
                    </div>

                    <button onclick="App.promptAddSchedule('${trip.id}', ${dayIndex})"
                            style="
                                width: 36px; height: 36px;
                                background: #D4537E;
                                border-radius: 10px;
                                border: none; cursor: pointer;
                                display: flex; align-items: center; justify-content: center;
                                transition: transform 0.15s, background 0.15s;
                                flex-shrink: 0;
                            "
                            onmouseenter="this.style.background='#C03D6A'"
                            onmouseleave="this.style.background='#D4537E'"
                            ontouchstart="this.style.transform='scale(0.92)'"
                            ontouchend="this.style.transform='scale(1)'">
                        <i class="fa-solid fa-plus" style="font-size: 14px; color: white;"></i>
                    </button>
                </div>

                <!-- 下半：模式切換 pill -->
                <div style="display: flex; gap: 0; padding: 0 14px 12px;">
                    <button onclick="App.setDayViewMode('${trip.id}', 'overview', ${dayIndex})"
                            style="
                                flex: 1;
                                padding: 7px 0;
                                font-size: 11px; font-weight: 800;
                                border: 0.5px solid ${isOverview ? '#D4537E' : '#E2E8F0'};
                                border-radius: 8px 0 0 8px;
                                background: ${isOverview ? '#D4537E' : 'white'};
                                color: ${isOverview ? 'white' : '#B4B2A9'};
                                cursor: pointer;
                                letter-spacing: 0.04em;
                                transition: all 0.2s;
                            ">
                        <i class="fa-solid fa-table-cells-large" style="font-size: 10px; margin-right: 5px;"></i>總覽
                    </button>
                    <button onclick="App.setDayViewMode('${trip.id}', 'route', ${dayIndex})"
                            style="
                                flex: 1;
                                padding: 7px 0;
                                font-size: 11px; font-weight: 800;
                                border: 0.5px solid ${!isOverview ? '#D4537E' : '#E2E8F0'};
                                border-left: none;
                                border-radius: 0 8px 8px 0;
                                background: ${!isOverview ? '#D4537E' : 'white'};
                                color: ${!isOverview ? 'white' : '#B4B2A9'};
                                cursor: pointer;
                                letter-spacing: 0.04em;
                                transition: all 0.2s;
                            ">
                        <i class="fa-solid fa-route" style="font-size: 10px; margin-right: 5px;"></i>路線
                    </button>
                </div>
            </div>

            <!-- ── Content Area ── -->
            <div id="schedule-list-container" style="padding: 0 12px;">
                ${scheduleListHtml}
            </div>
        </div>`;

    console.log(`📡 [View-Trace] Day ${dayIndex + 1} 導通 | 模式: ${viewMode} | 節點: ${schedules.length}`);
},

/** 🏗️ [View-Component] 每日詳情地基 (子零件) */
_renderDayHeader(trip, dayIndex) {
    const viewMode = localStorage.getItem(`tf_day_view_${trip.id}`) || 'route';
    const isOverview = viewMode === 'overview';

    return `
        <div class="flex items-center justify-between mb-6 px-1">
            <div class="flex items-center gap-3">
                <div class="relative w-20 h-9 bg-slate-100 rounded-full p-1 flex items-center border border-slate-200/50 shadow-inner">
                    <div id="day-view-slider" class="absolute h-7 w-[36px] bg-white rounded-full shadow-sm transition-all duration-300 ease-out"
                         style="transform: ${isOverview ? 'translateX(0)' : 'translateX(38px)'}"></div>
                    <button onclick="App.setDayViewMode('${trip.id}', 'overview', ${dayIndex})" 
                            class="relative flex-1 z-10 text-[10px] font-black transition-colors ${isOverview ? 'theme-text-pink' : 'text-slate-400'}">總覽</button>
                    <button onclick="App.setDayViewMode('${trip.id}', 'route', ${dayIndex})" 
                            class="relative flex-1 z-10 text-[10px] font-black transition-colors ${!isOverview ? 'theme-text-pink' : 'text-slate-400'}">路線</button>
                </div>
                <div class="flex flex-col">
                    <h2 class="text-xl font-black text-slate-800 tracking-tight">Day ${dayIndex + 1}</h2>
                    <p class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Daily Operation</p>
                </div>
            </div>
            <button onclick="App.promptAddSchedule('${trip.id}', ${dayIndex})" 
                    class="w-10 h-10 theme-bg text-white rounded-2xl flex items-center justify-center shadow-lg shadow-pink-100 active:scale-90 transition-all">
                <i class="fa-solid fa-plus text-sm"></i>
            </button>
        </div>
    `;
},


_renderDayOverview(schedules) {
    if (!schedules || schedules.length === 0) {
        return `<div style="padding: 64px 16px; text-align: center;">
            <p style="font-size: 10px; font-weight: 800; color: #D3D1C7; text-transform: uppercase; letter-spacing: 0.2em;">Sector Vacuum</p>
        </div>`;
    }

    const totalCost = schedules.reduce((sum, n) => {
        const costValue = Number(String(n.cost || 0).replace(/[,¥$]/g, '')) || 0;
        return sum + costValue;
    }, 0);

    const nodesHtml = schedules.map((mainNode, idx) => {
        const isLast = idx === schedules.length - 1;

        let fuelType = 'plain';
        let subNodes = [];
        try {
            const fuel = JSON.parse(mainNode.memo);
            if (fuel.stops && Array.isArray(fuel.stops)) {
                fuelType = 'transport';
                subNodes = fuel.stops;
            } else if (Array.isArray(fuel) && fuel[0]?.price) {
                fuelType = 'shopping';
                subNodes = fuel;
            } else if (Array.isArray(fuel)) {
                fuelType = 'nested';
                subNodes = fuel;
            }
        } catch (e) { fuelType = 'plain'; }

        const isTransport = fuelType === 'transport';
        const isShopping  = fuelType === 'shopping';
        const isNested    = fuelType === 'nested';

        // 主節點圓點顏色
        const dotColor  = isTransport ? '#185FA5' : isShopping ? '#2C2C2A' : '#D4537E';
        const timeColor = isTransport ? '#185FA5' : isShopping ? '#2C2C2A' : '#D4537E';

        // badge
        const badgeHtml = isTransport
            ? `<span style="font-size:11px;font-weight:800;background:#185FA5;color:white;padding:2px 8px;border-radius:4px;letter-spacing:0.08em;">TRANSPORT</span>`
            : isShopping
            ? `<span style="font-size:11px;font-weight:800;background:#2C2C2A;color:white;padding:2px 8px;border-radius:4px;letter-spacing:0.08em;">SHOPPING</span>`
            : `<span style="font-size:11px;font-weight:800;background:#D4537E;color:white;padding:2px 8px;border-radius:4px;letter-spacing:0.08em;">SPOT</span>`;

        // 子節點
        const subHtml = (() => {
if (isTransport) {
    return subNodes.map(sub => {
        const stopType = String(sub.type || '').toLowerCase();
        const isArr  = stopType === 'arr';
        const isXfer = stopType === 'xfer';
        const isDep  = stopType === 'dep';
const subTimeColor = isArr ? '#185FA5' : isDep ? '#D4537E' : '#5F5E5A';
const subDotColor  = isArr ? '#185FA5' : isDep ? '#D4537E' : '#888780';
        const hasCost = Number(sub.segment_cost) > 0;
        return `
            <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:0.5px solid #F1EFE8;">
                <span style="font-size:11px;font-weight:700;color:${subTimeColor};font-variant-numeric:tabular-nums;width:38px;flex-shrink:0;text-align:right;">${sub.time || '--:--'}</span>
                <div style="width:6px;height:6px;border-radius:50%;background:${subDotColor};flex-shrink:0;"></div>
                <span style="font-size:13px;font-weight:400;color:#444441;flex:1;min-width:0;">${sub.name || '--'}</span>
                ${sub.seg !== undefined ? `<span style="font-size:10px;font-weight:500;color:#D3D1C7;font-style:italic;flex-shrink:0;">S${sub.seg}</span>` : ''}
                ${hasCost ? `<span style="font-size:11px;font-weight:700;color:#185FA5;font-variant-numeric:tabular-nums;flex-shrink:0;">¥${Number(sub.segment_cost).toLocaleString()}</span>` : ''}
            </div>`;
    }).join('');
}

            if (isShopping) {
                return subNodes.map(sub => `
                    <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:0.5px solid #F1EFE8;">
                        <div style="width:6px;height:6px;border-radius:50%;background:#888780;flex-shrink:0;"></div>
                        <span style="font-size:13px;font-weight:400;color:#444441;flex:1;min-width:0;">${sub.name || '--'}</span>
                        <span style="font-size:11px;font-weight:700;color:#D4537E;font-variant-numeric:tabular-nums;flex-shrink:0;">¥${(sub.price || 0).toLocaleString()} x${sub.quantity || 1}</span>
                    </div>`
                ).join('');
            }
            if (isNested) {
                return subNodes.map(sub => `
                    <div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:0.5px solid #F1EFE8;">
                        <span style="font-size:11px;font-weight:700;color:#5F5E5A;font-variant-numeric:tabular-nums;width:38px;flex-shrink:0;text-align:right;padding-top:1px;">${sub.time || '--:--'}</span>
                        <div style="width:6px;height:6px;border-radius:50%;background:#D4537E;flex-shrink:0;margin-top:5px;"></div>
                        <span style="font-size:13px;font-weight:400;color:#444441;flex:1;min-width:0;line-height:1.5;">${sub.task || sub.location || ''}</span>
                        ${sub.expense && sub.expense !== '0' ? `<span style="font-size:11px;font-weight:700;color:#D4537E;font-variant-numeric:tabular-nums;flex-shrink:0;">¥${Number(sub.expense).toLocaleString()}</span>` : ''}
                    </div>`
                ).join('');
            }
            return '';
        })();

        return `
            <div style="display:flex;gap:0;position:relative;">
                <!-- 左側時間軸軌道 -->
                <div style="display:flex;flex-direction:column;align-items:center;width:38px;flex-shrink:0;padding-top:14px;">
                    <span style="
                        font-size:10px;font-weight:800;
                        color:${timeColor};
                        font-variant-numeric:tabular-nums;
                        letter-spacing:-0.02em;
                        line-height:1;margin-bottom:6px;
                        text-align:center;width:100%;
                    ">${mainNode.time || '--:--'}</span>
                    <div style="width:10px;height:10px;border-radius:50%;border:2px solid ${dotColor};background:white;flex-shrink:0;z-index:1;position:relative;">
                        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:4px;height:4px;border-radius:50%;background:${dotColor};"></div>
                    </div>
                    ${!isLast ? `<div style="width:1.5px;flex:1;min-height:24px;background:linear-gradient(to bottom,${dotColor}40,#E8E5DE);margin-top:4px;"></div>` : ''}
                </div>

                <!-- 右側內容卡片 -->
                <div style="flex:1;padding:10px 0 20px 6px;min-width:0;">
                    <div style="background:white;border-radius:14px;border:0.5px solid #E8E5DE;overflow:hidden;">

                        <!-- 主節點標題 -->
                        <div style="padding:12px 12px 10px;">
                            <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;flex-wrap:wrap;">
                                ${badgeHtml}
                                ${subNodes.length > 0 ? `<span style="font-size:10px;font-weight:600;color:#B4B2A9;">${subNodes.length} 站</span>` : ''}
                            </div>
                            <h4 style="font-size:15px;font-weight:700;color:#1a1a1a;line-height:1.4;word-break:break-word;margin:0;">
                                ${mainNode.location || mainNode.task || '新節點'}
                            </h4>
                        </div>

                        <!-- 子節點 -->
                        ${subHtml ? `
                        <div style="padding:0 12px 10px;border-top:0.5px solid #F1EFE8;">
                            ${subHtml}
                        </div>` : ''}
                    </div>
                </div>
            </div>`;
    }).join('');

    const statHtml = `
        <div style="display:flex;gap:0;">
            <div style="width:38px;flex-shrink:0;"></div>
            <div style="flex:1;padding:0 0 20px 6px;">
                <div style="background:#FBEAF0;border-radius:14px;border:0.5px solid #F4C0D1;padding:14px 16px;display:grid;grid-template-columns:1fr 1fr;gap:12px;">
                    <div style="border-left:2px solid #D4537E;padding-left:10px;">
                        <div style="font-size:9px;font-weight:700;color:#B4B2A9;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">節點總量</div>
                        <div style="font-size:22px;font-weight:800;color:#1a1a1a;">${schedules.length}</div>
                    </div>
                    <div style="border-left:2px solid #D4537E;padding-left:10px;">
                        <div style="font-size:9px;font-weight:700;color:#B4B2A9;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:4px;">預估開銷</div>
                        <div style="font-size:22px;font-weight:800;color:#D4537E;font-variant-numeric:tabular-nums;">¥${totalCost.toLocaleString()}</div>
                    </div>
                </div>
            </div>
        </div>`;

    return `<div style="padding: 8px 12px 0;">${nodesHtml}${statHtml}</div>`;
},

/** 🚄 子函數 A：交通路網導通 (V2026.ULTRA 符號校準版) */
_processTransportFuel(fuel) {
    if (!fuel || !fuel.stops) return '';

    return `
        <div class="pl-2 pr-1 py-4 space-y-0 relative">
            <!-- 🛰️ 垂直路網背脊線 (對位圖一 image_b8a881.png) -->
            <div class="absolute left-[47px] top-8 bottom-8 w-[1px] bg-slate-100 z-0"></div>

            ${fuel.stops.map((stop, sIdx) => {
                // 🚀 數據防禦性提領
                const stopName = stop.name || '未知站點';
                const rawNote = stop.note || '';
                
                // 🚀 符號對焦修正：支援半形與全形冒號，若無冒號則顯示完整內容
                const displayNote = rawNote.includes(':') 
                    ? rawNote.split(':').pop().trim() 
                    : (rawNote.includes('：') ? rawNote.split('：').pop().trim() : rawNote);

                const stopSeg = stop.seg !== undefined ? `S${stop.seg}` : '';
                
                // 🚀 物理色彩對焦
                let dotColor = 'bg-slate-200';
                if (stop.type === 'xfer' || stop.type === 'dep') dotColor = 'theme-bg';

                return `
                <div class="relative flex items-center gap-6 pb-8 last:pb-0 animate-slide-up" style="animation-delay: ${sIdx * 30}ms">
                    <!-- 🕒 時間與物理節點 -->
                    <div class="flex items-center gap-3 w-20 shrink-0">
                        <span class="text-[11px] font-black theme-text-pink tabular-nums w-10 text-right">${stop.time || '--:--'}</span>
                        <div class="w-2 h-2 rounded-full ${dotColor} z-10 shadow-[0_0_0_4px_white]"></div>
                    </div>

                    <!-- 📄 站點資訊 (對位圖一視覺) -->
                    <div class="flex-1 flex items-center justify-between min-w-0">
                        <div class="flex flex-col min-w-0">
                            <h5 class="text-[13px] font-black text-slate-700 truncate leading-tight">${stopName}</h5>
                            ${displayNote ? `<p class="text-[9px] text-slate-400 font-bold truncate mt-1 opacity-80">${displayNote}</p>` : ''}
                        </div>
                        
                        <!-- 🚀 段落標記 S0/S1/S2 -->
                        <div class="px-1.5 py-0.5 bg-slate-50 border border-slate-100 rounded text-[8px] font-black text-slate-300 italic shrink-0 ml-2">
                            ${stopSeg}
                        </div>
                    </div>
                </div>`;
            }).join('')}

            <!-- 📊 戰術 Spotlight (收納於索引下方) -->
            ${fuel.spotlight ? `
                <div class="mt-4 p-4 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200">
                    <p class="text-[10px] text-slate-500 font-bold leading-relaxed italic">
                        ${fuel.spotlight}
                    </p>
                </div>
            ` : ''}
        </div>`;
},


/** 🛍️ 子函數 B：購物燃料清單 (Shopping Payload) */
_processShoppingFuel(items) {
    return `
        <div class="pl-4 space-y-3 border-l-2 border-dashed border-slate-100 ml-2">
            ${items.map(item => `
                <details class="group/shop">
                    <summary class="list-none cursor-pointer outline-none">
                        <div class="bg-white p-5 rounded-[1.8rem] border border-slate-100 shadow-sm active:scale-[0.98] transition-all">
                            <div class="flex justify-between items-start mb-2">
                                <span class="text-[9px] font-black px-2 py-1 bg-pink-50 theme-text-pink rounded-md">¥${item.price.toLocaleString()}</span>
                                <i class="fa-solid fa-chevron-down text-[8px] text-slate-300 transition-transform group-open/shop:rotate-180"></i>
                            </div>
                            <h5 class="text-[11px] font-black text-slate-700 leading-tight">${item.name}</h5>
                            <p class="text-[9px] text-slate-400 mt-2 font-black">📍 ${item.store}</p>
                        </div>
                    </summary>
                    <div class="p-4 mt-2 bg-slate-50/50 rounded-[1.2rem] text-[10px] text-slate-500 leading-relaxed italic animate-slide-down border border-slate-100/50">
                        ${item.info}
                    </div>
                </details>
            `).join('')}
        </div>`;
},

/** 📋 子函數 C：巢狀行程收折 (主卡片一體化 - V2026.ULTRA) */
_processNestedScheduleFuel(subNodes, mainNode) {
    if (!subNodes || subNodes.length === 0) return '';

    return `
        <details class="group/nested overflow-hidden transition-all duration-300">
            <!-- 🎯 職人對焦：將整張主卡片設為 summary，封殺冗餘點擊元件 -->
            <summary class="block cursor-pointer outline-none select-none [&::-webkit-details-marker]:hidden">
                <div class="bg-white p-6 rounded-[2.2rem] border border-slate-100 shadow-sm 
                            active:scale-[0.98] hover:border-pink-100 transition-all relative">
                    
                    <div class="flex justify-between items-center mb-2">
                        <!-- 🚀 顯示時間與主題色彩 -->
                        <span class="text-[12px] font-black tabular-nums tracking-tighter" style="color: var(--theme-primary)">
                            ${mainNode.time || '--:--'}
                        </span>
                        
                        <!-- 狀態提示標籤：僅作為視覺反饋 -->
                        <div class="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 rounded-full border border-slate-100">
                            <span class="text-[9px] font-black theme-text-pink">${subNodes.length} STEPS</span>
                            <i class="fa-solid fa-chevron-down text-[8px] text-slate-300 transition-transform duration-300 group-open/nested:rotate-180"></i>
                        </div>
                    </div>
                    
                    <!-- 🚀 顯示主景點名稱 -->
                    <h4 class="font-black text-slate-800 text-md leading-tight">
                        ${mainNode.location}
                    </h4>
                </div>
            </summary>

            <!-- 📄 子路網軌道：直接銜接於主卡片下方 -->
            <div class="pl-4 space-y-4 border-l-2 border-dashed border-slate-100 ml-6 mt-4 mb-6 animate-slide-down">
                ${subNodes.map((sub, sIdx) => `
                    <div class="relative flex items-start gap-3">
                        <div class="w-2 h-2 rounded-full bg-slate-200 mt-4 shrink-0"></div>
                        <div class="flex-1 bg-slate-50/50 p-4 rounded-[1.5rem] border border-slate-100/50">
                            <div class="flex justify-between items-center mb-1">
                                <span class="text-[10px] font-bold text-slate-400 tabular-nums">${sub.time || '--:--'}</span>
                                ${sub.expense && sub.expense !== '0' ? 
                                    `<span class="text-[9px] font-black text-slate-400">¥${Number(sub.expense).toLocaleString()}</span>` : ''}
                            </div>
                            <p class="text-[11px] font-bold text-slate-600 leading-relaxed">${sub.task || ''}</p>
                            ${sub.move ? `<p class="text-[9px] text-slate-400 mt-1 italic font-medium">↳ ${sub.move}</p>` : ''}
                        </div>
                    </div>
                `).join('')}
            </div>
        </details>`;
},

renderScheduleItem(tripId, dayIndex, item, itemIndex, isLast = false) {
    const engine = this;
    let detailContent = "";

    const nodeId = `tf-node-${dayIndex}-${itemIndex}`;
    const currentStyle = (item.style || 'default').toLowerCase().trim();
    const hasJsonFuel = item.memo && (item.memo.trim().startsWith('{') || item.memo.trim().startsWith('['));

    if (currentStyle === 'json') {
        detailContent = engine.renderItineraryFuel(item.memo);
    } else if (currentStyle === 'transport') {
        detailContent = engine.renderTransportFuel(item.memo, nodeId);
    } else if (currentStyle === 'image') {
        detailContent = `
            <div style="margin-top: 10px;">
                ${item.memo ? `<p style="font-size: 12px; font-weight: 500; color: #444441; line-height: 1.7; margin-bottom: 8px;">${item.memo}</p>` : ''}
                ${item.imageUrl ? `<div style="border-radius: 12px; overflow: hidden; border: 0.5px solid #E2E8F0;"><img src="${item.imageUrl}" style="width:100%; max-height:280px; object-fit:cover; display:block;"></div>` : ''}
            </div>`;
    } else if (currentStyle === 'shopping') {
        detailContent = engine._renderShoppingFuelCards(item, dayIndex, itemIndex);
    } else {
        detailContent = hasJsonFuel
            ? engine.renderItineraryFuel(item.memo)
            : (item.memo ? `<p style="font-size: 12px; font-weight: 500; color: #444441; line-height: 1.7; margin-top: 8px;">${item.memo}</p>` : '');
    }

    const isShopping = currentStyle === 'shopping';
    const isTransport = currentStyle === 'transport';

    const dotColor  = isTransport ? '#185FA5' : isShopping ? '#2C2C2A' : '#D4537E';
    const timeColor = isTransport ? '#185FA5' : isShopping ? '#2C2C2A' : '#D4537E';

    return `
        <div id="${nodeId}" class="schedule-card animate-fade-in"
             style="display: flex; gap: 0; position: relative;">

            <!-- ── 左側時間軸軌道 ── -->
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                width: 28px;
                flex-shrink: 0;
                padding-top: 14px;
            ">
                <span style="
                    font-size: 9px;
                    font-weight: 800;
                    color: ${timeColor};
                    font-variant-numeric: tabular-nums;
                    letter-spacing: -0.03em;
                    line-height: 1;
                    margin-bottom: 6px;
                    text-align: center;
                    width: 100%;
                ">${item.time || '--:--'}</span>

                <div style="
                    width: 10px; height: 10px;
                    border-radius: 50%;
                    border: 2px solid ${dotColor};
                    background: white;
                    flex-shrink: 0;
                    z-index: 1;
                    position: relative;
                ">
                    <div style="
                        position: absolute;
                        top: 50%; left: 50%;
                        transform: translate(-50%, -50%);
                        width: 4px; height: 4px;
                        border-radius: 50%;
                        background: ${dotColor};
                    "></div>
                </div>

                ${!isLast ? `
                <div style="
                    width: 1.5px;
                    flex: 1;
                    min-height: 24px;
                    background: linear-gradient(to bottom, ${dotColor}40, #E8E5DE);
                    margin-top: 4px;
                "></div>` : ''}
            </div>

            <!-- ── 右側內容卡片 ── -->
            <div style="
                flex: 1;
                padding: 10px 0 20px 6px;
                min-width: 0;
            ">
                <div style="
                    background: white;
                    border-radius: 14px;
                    border: 0.5px solid #E8E5DE;
                    overflow: hidden;
                    position: relative;
                ">
                    <!-- 右上角操作按鈕：絕對定位，不佔內容寬度 -->
                    <div style="
                        position: absolute;
                        top: 8px; right: 8px;
                        display: flex;
                        flex-direction: row;
                        gap: 4px;
                        z-index: 2;
                    ">
                        <button onclick="App.copyNodeJsonToClipboard('${tripId}', ${dayIndex}, ${itemIndex})"
                                style="
                                    width: 26px; height: 26px;
                                    display: flex; align-items: center; justify-content: center;
                                    background: #F1EFE8; color: #888780;
                                    border-radius: 7px; border: none; cursor: pointer;
                                    transition: all 0.15s;
                                "
                                ontouchstart="this.style.background='#EAF3DE';this.style.color='#3B6D11'"
                                ontouchend="this.style.background='#F1EFE8';this.style.color='#888780'"
                                onmouseenter="this.style.background='#EAF3DE';this.style.color='#3B6D11'"
                                onmouseleave="this.style.background='#F1EFE8';this.style.color='#888780'"
                                title="複製 JSON">
                            <i class="fa-solid fa-copy" style="font-size: 10px;"></i>
                        </button>
                        <button onclick="App.promptEditSchedule('${tripId}', ${dayIndex}, ${itemIndex})"
                                style="
                                    width: 26px; height: 26px;
                                    display: flex; align-items: center; justify-content: center;
                                    background: #F1EFE8; color: #888780;
                                    border-radius: 7px; border: none; cursor: pointer;
                                    transition: all 0.15s;
                                "
                                ontouchstart="this.style.background='#FBEAF0';this.style.color='#D4537E'"
                                ontouchend="this.style.background='#F1EFE8';this.style.color='#888780'"
                                onmouseenter="this.style.background='#FBEAF0';this.style.color='#D4537E'"
                                onmouseleave="this.style.background='#F1EFE8';this.style.color='#888780'">
                            <i class="fa-solid fa-pen" style="font-size: 10px;"></i>
                        </button>
                    </div>

                    <!-- 標題區：右側留出按鈕空間 -->
                    <div style="padding: 10px 68px 0 10px;">
                        <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 4px; flex-wrap: wrap;">
                            ${isTransport ? `
                            <span style="
                                font-size: 9px; font-weight: 800;
                                background: #185FA5; color: white;
                                padding: 1px 6px; border-radius: 4px;
                                letter-spacing: 0.08em;
                            ">TRANSPORT</span>` : ''}
                            ${isShopping ? `
                            <span style="
                                font-size: 9px; font-weight: 800;
                                background: #2C2C2A; color: white;
                                padding: 1px 6px; border-radius: 4px;
                                letter-spacing: 0.08em;
                            ">SHOPPING</span>` : ''}
                        </div>
                        <h4 style="
                            font-size: 14px; font-weight: 700;
                            color: #1a1a1a; line-height: 1.4;
                            word-break: break-word; margin: 0;
                        ">${item.location || item.task || (isShopping ? '購物清單' : '新節點')}</h4>
                    </div>

                    <!-- 內容區：全寬，按鈕疊在上方不影響 -->
                    ${detailContent ? `
                    <div style="padding: 6px 10px 10px;">
                        ${detailContent}
                    </div>` : '<div style="height: 10px;"></div>'}
                </div>
            </div>
        </div>`;
},

// ============================================================
// 💰 [Expense & Statistics] 開銷與統計視圖
// ============================================================

renderExpenseStats(container, trip, chartData, stats) {
    if (!container || !trip) return;

    const focus = state.expenseFocus || 'TWD';
    const totalTWD = stats.totalTWD || 0;
    const totalJPY = stats.grandTotal || 0;

    const primaryTotal = focus === 'TWD'
        ? `$${Math.round(totalTWD).toLocaleString()}`
        : `¥${Math.round(totalJPY).toLocaleString()}`;
    const secondaryTotal = focus === 'TWD'
        ? `¥${Math.round(totalJPY).toLocaleString()}`
        : `$${Math.round(totalTWD).toLocaleString()}`;

    // 總覽色塊
    const stackedBar = chartData.map((d, i) => {
        const isFirst = i === 0;
        const isLast  = i === chartData.length - 1;
        return `<div style="
            flex: ${d.percentage};
            background: ${d.color};
            border-radius: ${isFirst ? '5px 0 0 5px' : isLast ? '0 5px 5px 0' : '0'};
            min-width: 2px;
        "></div>`;
    }).join('');

    // 分類列
    const categoryRows = chartData.map(d => this._renderExpenseCategory(trip, d)).join('');

    container.innerHTML = `
        <div style="padding-bottom: 128px;" class="animate-fade-in">

            <!-- ── 頂部幣別切換 ── -->
            <div style="display:flex;justify-content:space-between;align-items:center;padding:0 2px 14px;">
                <div style="font-size:9px;font-weight:700;color:#B4B2A9;text-transform:uppercase;letter-spacing:0.15em;">Detailed Analytics Ledger</div>
                <div style="display:flex;background:#F1EFE8;border-radius:20px;padding:3px;gap:2px;">
                    <button onclick="App.switchCurrencyFocus('TWD')"
                            style="padding:4px 14px;border-radius:16px;font-size:10px;font-weight:800;border:none;cursor:pointer;letter-spacing:0.04em;transition:all 0.2s;
                            background:${focus === 'TWD' ? '#D4537E' : 'transparent'};
                            color:${focus === 'TWD' ? 'white' : '#B4B2A9'};">TWD</button>
                    <button onclick="App.switchCurrencyFocus('JPY')"
                            style="padding:4px 14px;border-radius:16px;font-size:10px;font-weight:800;border:none;cursor:pointer;letter-spacing:0.04em;transition:all 0.2s;
                            background:${focus === 'JPY' ? '#D4537E' : 'transparent'};
                            color:${focus === 'JPY' ? 'white' : '#B4B2A9'};">JPY</button>
                </div>
            </div>

            <!-- ── 主卡片：總覽 + 分類列 ── -->
            <div style="background:white;border-radius:16px;border:0.5px solid #E8E5DE;overflow:hidden;margin-bottom:12px;">

                <!-- 總金額 -->
                <div style="padding:16px 16px 12px;">
                    <div style="font-size:9px;font-weight:700;color:#B4B2A9;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:6px;">Total ${focus}</div>
                    <div style="display:flex;align-items:baseline;gap:8px;margin-bottom:12px;">
                        <span style="font-size:30px;font-weight:800;color:#1a1a1a;font-variant-numeric:tabular-nums;line-height:1;">${primaryTotal}</span>
                        <span style="font-size:13px;font-weight:600;color:#D4537E;opacity:0.6;font-variant-numeric:tabular-nums;">${secondaryTotal}</span>
                    </div>

                    <!-- Stacked bar -->
                    <div style="display:flex;height:10px;border-radius:5px;overflow:hidden;gap:1.5px;">
                        ${stackedBar}
                    </div>
                </div>

                <!-- 分隔線 -->
                <div style="height:0.5px;background:#F1EFE8;"></div>

                <!-- 分類列 -->
                <div style="padding:8px 0;">
                    ${categoryRows}
                </div>
            </div>

            <div style="text-align:center;font-size:10px;color:#D3D1C7;font-style:italic;padding:4px 0 12px;">
                點擊分類可展開明細
            </div>
        </div>
    `;
},

_renderExpenseCategory(trip, categoryData) {
    const details = this._collectExpenseDetails(trip, categoryData.id);
    const focus = (window.state && window.state.expenseFocus) ? window.state.expenseFocus : 'TWD';

    const totals = details.reduce((acc, item) => {
        if (item.isBundle) {
            acc.twd += item.products.reduce((sum, p) => sum + (p.convertedCost || 0), 0);
            acc.jpy += item.products.reduce((sum, p) => sum + (p.cost || 0), 0);
        } else {
            acc.twd += (item.convertedCost || 0);
            acc.jpy += (item.cost || 0);
        }
        return acc;
    }, { twd: 0, jpy: 0 });

    const displayAmount = focus === 'TWD'
        ? `$${Math.round(totals.twd).toLocaleString()}`
        : `¥${Math.round(totals.jpy).toLocaleString()}`;

    // 明細列表
    let currentDay = null;
    const listHtml = details.length > 0 ? details.map(item => {
        const isNewDay = item.day !== currentDay;
        currentDay = item.day;
        return `
            ${isNewDay ? `
            <div style="display:flex;align-items:center;gap:8px;padding:8px 14px 4px;">
                <div style="width:26px;height:26px;background:#FBEAF0;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:800;color:#D4537E;flex-shrink:0;">D${item.day}</div>
                <div style="flex:1;height:0.5px;background:#F1EFE8;"></div>
            </div>` : ''}
            <div style="padding:0 14px;">
                ${this._renderExpenseItemRowClean(item)}
            </div>`;
    }).join('') : `
        <div style="padding:20px 16px;text-align:center;">
            <p style="font-size:10px;color:#D3D1C7;font-weight:700;text-transform:uppercase;letter-spacing:0.15em;">No Details Found</p>
        </div>`;

    return `
        <details class="expense-cat-group">
            <summary style="
                display:flex;align-items:center;justify-content:space-between;
                padding:10px 16px;cursor:pointer;list-style:none;outline:none;
                user-select:none;
            "
            onmouseenter="this.style.background='#F8F7F4'"
            onmouseleave="this.style.background='transparent'">
                <!-- 左側：圓點 + 名稱 + 百分比 -->
                <div style="display:flex;align-items:center;gap:8px;">
                    <div style="width:8px;height:8px;border-radius:50%;background:${categoryData.color};flex-shrink:0;"></div>
                    <span style="font-size:13px;font-weight:700;color:#1a1a1a;">${categoryData.label}</span>
                    <span style="font-size:10px;color:#B4B2A9;font-weight:600;">${categoryData.percentage.toFixed(1)}%</span>
                </div>

                <!-- 右側：金額 + 箭頭 -->
                <div style="display:flex;align-items:center;gap:8px;">
                    <span style="font-size:13px;font-weight:800;color:#1a1a1a;font-variant-numeric:tabular-nums;">${displayAmount}</span>
                    <span style="font-size:10px;color:#D3D1C7;transition:transform 0.2s;">▼</span>
                </div>
            </summary>

            <!-- 進度條 -->
            <div style="padding:0 16px 10px;">
                <div style="height:4px;background:#F1EFE8;border-radius:2px;overflow:hidden;">
                    <div style="width:${categoryData.percentage}%;height:100%;background:${categoryData.color};border-radius:2px;"></div>
                </div>
            </div>

            <!-- 明細 -->
            <div style="border-top:0.5px solid #F1EFE8;padding-bottom:8px;">
                ${listHtml}
            </div>
        </details>`;
},


/** 🧬 輔助組件：渲染去標籤化的細項行 (V2026.ULTRA 全量對焦版) */
_renderExpenseItemRowClean(item) {
    const focus = window.state.expenseFocus || 'TWD';

    if (item.isBundle) {
        // 🛍️ 購物包裹軌道
        return `
            <div class="space-y-3 pb-4 mb-4 border-b border-slate-50 last:border-0 last:mb-0">
                <div class="flex justify-between items-center px-1">
                    <p class="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">Consolidated Cargo</p>
                    <p class="text-[8px] font-bold text-slate-400">@ ${item.location}</p>
                </div>
                <div class="bg-slate-50/50 rounded-2xl p-4 space-y-3 border border-slate-100/30">
                    ${item.products.map((p, pIdx) => {
                        const pPrimary = focus === 'TWD' ? `$${Math.round(p.convertedCost).toLocaleString()}` : `¥${Math.round(p.cost).toLocaleString()}`;
                        const pSecondary = focus === 'TWD' ? `¥${Math.round(p.cost).toLocaleString()}` : `$${Math.round(p.convertedCost).toLocaleString()}`;
                        return `
                            <div class="flex justify-between items-center gap-2">
                                <span class="text-[11px] font-bold text-slate-600 truncate flex-1">${p.name}</span>
                                <div class="text-right">
                                    <p class="text-[11px] font-black text-slate-700 tabular-nums">${pPrimary}</p>
                                    <p class="text-[7px] theme-text-pink font-black tabular-nums opacity-50">≈ ${pSecondary}</p>
                                </div>
                            </div>
                            ${pIdx < item.products.length - 1 ? '<div class="h-px bg-white/50 w-full opacity-50"></div>' : ''}
                        `;
                    }).join('')}
                </div>
            </div>`;
    }

    // 🚌/📍 一般細項軌道 (交通、景點)
    const primaryAmount = focus === 'TWD' ? `$${Math.round(item.convertedCost).toLocaleString()}` : `¥${Math.round(item.cost).toLocaleString()}`;
    const secondaryAmount = focus === 'TWD' ? `¥${Math.round(item.cost).toLocaleString()}` : `$${Math.round(item.convertedCost).toLocaleString()}`;

    return `
        <div class="flex justify-between items-center py-3 border-b border-slate-50 last:border-0 hover:bg-slate-50/30 transition-colors rounded-xl px-1">
            <div class="flex flex-col min-w-0">
                <span class="text-[11px] font-bold text-slate-500 truncate max-w-[180px]">${item.name}</span>
                <span class="text-[8px] text-slate-300 font-black uppercase tracking-tighter italic">@ ${item.currency || 'JPY'}</span>
            </div>
            <div class="flex flex-col items-end">
                <span class="text-[11px] font-black text-slate-600 tabular-nums">${primaryAmount}</span>
                <div class="flex items-center gap-1 opacity-60">
                    <span class="text-[7px] font-black text-slate-300">≈</span>
                    <span class="text-[9px] theme-text-pink font-black tabular-nums">${secondaryAmount}</span>
                </div>
            </div>
        </div>`;
},

/** 🧬 子函數 B：數據採集邏輯 (V2026.ULTRA 交通與購物強化版) */
_collectExpenseDetails(trip, categoryId) {
    const list = [];
    if (!trip || !trip.days) return list;

    // 🚀 1. 物理掃描每日排程節點
    trip.days.forEach(day => {
        if (!day.schedules) return;
        
        // 🏗️ 為每一天初始化一個潛在的「購物包裹」
        const dayShoppingBundle = {
            day: day.dayNum,
            location: "",
            isBundle: true, 
            products: []
        };

        day.schedules.forEach(item => {
            const style = (item.style || '').toLowerCase().trim();
            const memo = item.memo || "";

            // 🎯 A軌道：購物消費攔截器 (維持物理彙流)
            if (categoryId === 'shopping' && style === 'shopping') {
                try {
                    const products = JSON.parse(memo || "[]");
                    dayShoppingBundle.location = item.location || '購物行程';
                    
                    products.forEach(p => {
                        const cost = (Number(p.price) || 0) * (Number(p.quantity) || 1);
                        if (cost <= 0) return;

                        const currency = item.currency || 'JPY';
                        dayShoppingBundle.products.push({
                            name: p.name,
                            cost: cost,
                            currency: currency,
                            convertedCost: (currency === 'TWD') ? cost : expenseManager.convert(cost, currency)
                        });
                    });
                } catch (e) { console.error("Shopping grouping error", e); }
                return; 
            }

            // 🎯 B軌道：交通費用攔截器 (🚀 核心修復：穿透 stops 掃描 segment_cost)
            if (categoryId === 'transport' && style === 'transport') {
                try {
                    const fuel = JSON.parse(memo);
                    if (fuel.stops && Array.isArray(fuel.stops)) {
                        fuel.stops.forEach(stop => {
                            const segCost = Number(stop.segment_cost || 0);
                            if (segCost > 0) {
                                const currency = item.currency || 'JPY';
                                list.push({
                                    name: `🚌 ${stop.name || '交通節點'}`,
                                    cost: segCost,
                                    currency,
                                    convertedCost: (currency === 'TWD') ? segCost : expenseManager.convert(segCost, currency),
                                    day: day.dayNum,
                                    isBundle: false
                                });
                            }
                        });
                    }
                } catch (e) { 
                    // 容錯機制：若 JSON 解析失敗，嘗試讀取扁平費用
                    const fallbackCost = expenseManager.parseFuelCost(memo);
                    if (fallbackCost > 0) {
                        const currency = item.currency || 'JPY';
                        list.push({
                            name: item.location || '交通路網',
                            cost: fallbackCost,
                            currency,
                            convertedCost: (currency === 'TWD') ? fallbackCost : expenseManager.convert(fallbackCost, currency),
                            day: day.dayNum,
                            isBundle: false
                        });
                    }
                }
                return;
            }

            // 🎯 C軌道：通用行程節點 (維持對位)
            if (categoryId === 'itinerary' && (style === 'json' || style === 'default')) {
                const cost = expenseManager.parseFuelCost(memo);
                if (cost <= 0) return;

                const currency = item.currency || 'JPY'; 
                list.push({ 
                    name: item.location || '行程景點', 
                    cost, 
                    currency,
                    convertedCost: (currency === 'TWD') ? cost : expenseManager.convert(cost, currency),
                    day: day.dayNum,
                    isBundle: false
                });
            }
        });

        // 🚀 物理匯合：若有購物產品，將包裹推入
        if (dayShoppingBundle.products.length > 0) {
            list.push(dayShoppingBundle);
        }
    });

    // 🚀 2. 物理掃描全域航網 (Airport Matrix)
    if (categoryId === 'transport' && Array.isArray(trip.transport)) {
        trip.transport.forEach(f => {
            const fCost = Number(f.cost || 0);
            if (fCost > 0) {
                const fCurrency = f.currency || 'JPY';
                list.push({ 
                    name: `✈️ ${f.depPort || '--'} → ${f.arrPort || '--'}`, 
                    cost: fCost, 
                    currency: fCurrency,
                    convertedCost: (fCurrency === 'TWD') ? fCost : expenseManager.convert(fCost, fCurrency),
                    day: f.day || 1,
                    isBundle: false
                });
            }
        });
    }

    // 🚀 3. 數據時間軸校準
    return list.sort((a, b) => a.day - b.day);
},


renderShopping(container, shoppingItems = [], activeCategory = '食') {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const categories = trip?.shoppingConfig?.categories || ['食', '藥妝', '一般'];
    
    container.innerHTML = `
        <div class="shopping-module animate-fade-in space-y-6 pb-32">
            
            <div class="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 space-y-4">
                <div class="flex justify-between items-center px-1">
                    <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">AI Intelligence Scraper</h4>
                    <div id="shopping-ai-btn">
                        ${this.renderAICopyBtn(expenseManager.getShoppingAiPrompt(document.getElementById('shop-query-input')?.value || ''))}
                    </div>
                </div>

                <div class="space-y-2">
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px]">📍</span>
                        <input type="text" id="shop-city-input" 
                               class="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 font-black text-xs theme-text-pink focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                               value="${trip?.city || ''}" 
                               placeholder="設定採購城市"
                               oninput="expenseManager.syncShoppingAiPrompt(document.getElementById('shop-query-input').value)">
                    </div>
                    <div class="relative">
                        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-[10px]">📦</span>
                        <input type="text" id="shop-query-input" 
                               class="w-full bg-slate-50 border-none rounded-2xl py-4 pl-10 pr-4 font-bold text-xs focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                               placeholder="輸入商品名稱"
                               oninput="expenseManager.syncShoppingAiPrompt(this.value)">
                    </div>
                </div>

                <textarea id="shop-json-input" 
                          class="w-full h-32 bg-slate-50 border-none rounded-2xl p-4 font-mono text-[10px] theme-text-pink focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                          placeholder="請貼上 AI 生成的【燃料包】JSON..."></textarea>

                <button onclick="expenseManager.importShoppingFuel()" 
                        class="w-full py-4 theme-bg text-white rounded-[1.5rem] font-black text-xs shadow-lg active:scale-95 transition-all">
                    存入資料庫
                </button>
            </div>

            <div id="shopping-tabs" class="flex gap-3 overflow-x-auto no-scrollbar pb-2 snap-x">
                ${categories.map(cat => `
                    <div class="snap-center">
                        <button id="shop-tab-${cat}" onclick="expenseManager.filterShopping('${cat}')" 
                                class="px-6 py-2.5 rounded-2xl text-[11px] font-black border transition-all whitespace-nowrap flex items-center gap-2
                                ${activeCategory === cat ? 'theme-bg text-white border-transparent shadow-lg' : 'bg-white text-slate-400 border-slate-100'}">
                            <span>${cat}</span>
                            <span class="opacity-40 text-[9px]">${shoppingItems.filter(i => i.category === cat).length}</span>
                        </button>
                    </div>
                `).join('')}
            </div>

            <div class="space-y-4">
                <div class="flex justify-between items-center px-2">

                    <!-- 改動 1：BROWSING 標題中文化 + 加深顏色 -->
                    <span style="
                        font-size: 11px; font-weight: 700;
                        color: #5F5E5A; letter-spacing: 0.06em;
                        display: inline-flex; align-items: center; gap: 6px;
                    ">
                        <span style="
                            display: inline-flex; align-items: center; justify-content: center;
                            width: 16px; height: 16px; border-radius: 50%;
                            background: #F1EFE8; color: #888780; font-size: 8px;
                        "><i class="fa-solid fa-bag-shopping"></i></span>
                        瀏覽中：${activeCategory}
                    </span>

                    <!-- 改動 2：轉移按鈕 emoji 改 FA -->
                    <button onclick="expenseManager.promptTransferTarget()"
                            class="flex items-center gap-1.5 px-4 py-2 bg-pink-50 theme-text-pink rounded-xl text-[10px] font-black active:scale-95 transition-all border border-pink-100">
                        <i class="fa-solid fa-cart-arrow-down" style="font-size: 10px;"></i> 轉移至排程
                    </button>
                </div>

                <div id="shopping-list-track" class="space-y-3">
                    ${this._renderShoppingCards(shoppingItems, activeCategory)}
                </div>
            </div>
        </div>
    `;
    
    this.focusShoppingTab(activeCategory);
},


    /** 🧬 物理對焦：分類標籤置中捲動 */
    focusShoppingTab(cat) {
        requestAnimationFrame(() => {
            const tab = document.getElementById(`shop-tab-${cat}`);
            if (tab) {
                tab.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
        });
    },

_renderShoppingCards(items, category) {
    const filtered = items.filter(i => i.category === category);
    if (filtered.length === 0) return `
        <div style="
            padding: 48px 0; text-align: center;
            color: #B4B2A9; font-size: 11px; font-weight: 700;
            border: 1.5px dashed #E2E8F0; border-radius: 14px;
        ">尚無此分類商品</div>`;

    return filtered.map((item) => {
        const mapQuery = encodeURIComponent(`${item.store || ''} ${item.name} Japan`);
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=${mapQuery}`;
        const hasImage = !!(item.image_query || item.imageUrl);
        const imgUrl = item.imageUrl || `https://www.google.com/search?q=${encodeURIComponent(item.image_query || item.name_jp || item.name)}&tbm=isch`;

        return `
            <div style="
                background: white;
                border-radius: 14px;
                border: 0.5px solid #E2E8F0;
                padding: 16px;
                transition: border-color 0.2s;
            "
            class="animate-fade-in group relative"
            onmouseenter="this.style.borderColor='#F4C0D1'"
            onmouseleave="this.style.borderColor='#E2E8F0'">

                <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 12px;">

                    <!-- 左側：勾選 + 名稱 -->
                    <div style="display: flex; align-items: flex-start; gap: 10px; flex: 1; min-width: 0;">

                        <!-- 勾選按鈕 -->
                        <div onclick="expenseManager.toggleShoppingDone('${item.id}')"
                             style="
                                 width: 20px; height: 20px; border-radius: 50%;
                                 border: 2px solid ${item.done ? '#D4537E' : '#D3D1C7'};
                                 background: ${item.done ? '#D4537E' : 'white'};
                                 display: flex; align-items: center; justify-content: center;
                                 flex-shrink: 0; cursor: pointer; margin-top: 2px;
                                 transition: all 0.2s;
                             ">
                            ${item.done ? '<svg style="width:10px;height:10px;" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="4"><path d="M5 13l4 4L19 7"></path></svg>' : ''}
                        </div>

                        <div style="flex: 1; min-width: 0; overflow: hidden;">
                            <!-- 商品名稱 -->
                            ${hasImage ? `
                            <a href="${imgUrl}" target="_blank" style="text-decoration: none;">
                                <span style="
                                    font-size: 13px; font-weight: 700;
                                    color: ${item.done ? '#B4B2A9' : '#1a1a1a'};
                                    display: block; line-height: 1.4;
                                    ${item.done ? 'text-decoration: line-through;' : ''}
                                    word-break: break-word;
                                ">${item.name}</span>
                            </a>` : `
                            <span style="
                                font-size: 13px; font-weight: 700;
                                color: ${item.done ? '#B4B2A9' : '#1a1a1a'};
                                display: block; line-height: 1.4;
                                ${item.done ? 'text-decoration: line-through;' : ''}
                                word-break: break-word;
                            ">${item.name}</span>`}

                            <!-- 日文名 -->
                            ${item.name_jp ? `
                            <p style="
                                font-size: 10px; font-weight: 600;
                                color: #D4537E; margin-top: 2px;
                                font-variant-numeric: tabular-nums;
                                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                            ">${item.name_jp}</p>` : ''}

                            <!-- 單價 × 數量 -->
                            <p style="
                                font-size: 10px; font-weight: 600;
                                color: #888780; margin-top: 4px;
                                font-variant-numeric: tabular-nums;
                            ">JPY ${item.price?.toLocaleString()} × ${item.quantity || 1}</p>

                            <!-- 商品說明 -->
                            ${item.info ? `
                            <div style="
                                margin-top: 10px;
                                background: #FFFBEB;
                                border-left: 3px solid #F59E0B;
                                border-radius: 0 8px 8px 0;
                                padding: 8px 10px 8px 32px;
                                position: relative;
                            ">
                                <i class="fa-solid fa-circle-info" style="
                                    position: absolute; left: 10px; top: 10px;
                                    font-size: 11px; color: #D97706;
                                "></i>
                                <p style="
                                    font-size: 12px; font-weight: 500;
                                    color: #451A03; line-height: 1.7; margin: 0;
                                    word-break: break-word;
                                ">${item.info}</p>
                            </div>` : ''}
                        </div>
                    </div>

                    <!-- 右側：總價 + 刪除 -->
                    <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 4px; flex-shrink: 0;">
                        <span style="
                            font-size: 14px; font-weight: 800;
                            color: #D4537E; font-variant-numeric: tabular-nums;
                        ">¥${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</span>
                        <button onclick="expenseManager.deleteShoppingItem('${item.id}')"
                                style="
                                    background: none; border: none; cursor: pointer;
                                    color: #D3D1C7; padding: 4px;
                                    transition: color 0.2s;
                                "
                                onmouseenter="this.style.color='#E24B4A'"
                                onmouseleave="this.style.color='#D3D1C7'">
                            <i class="fa-solid fa-trash" style="font-size: 11px;"></i>
                        </button>
                    </div>
                </div>

                <!-- 底部：商店地圖連結 -->
                <div style="
                    margin-top: 12px; padding-top: 10px;
                    border-top: 0.5px solid #E2E8F0;
                ">
                    <a href="${mapUrl}" target="_blank" style="
                        display: flex; align-items: center; justify-content: space-between;
                        text-decoration: none;
                    ">
                        <div style="display: flex; align-items: center; gap: 6px; min-width: 0;">
                            <i class="fa-solid fa-location-dot" style="font-size: 11px; color: #D4537E; flex-shrink: 0;"></i>
                            <span style="
                                font-size: 11px; font-weight: 600; color: #5F5E5A;
                                overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
                            ">${item.store || '未指定具體地點'}</span>
                        </div>
                        <span style="
                            font-size: 9px; font-weight: 800;
                            color: #D4537E; letter-spacing: 0.06em;
                            flex-shrink: 0; margin-left: 8px;
                        ">地圖 ›</span>
                    </a>
                </div>
            </div>`;
    }).join('');
},


// ============================================================
// 🏮 [Translate Module] 翻譯情境系統視圖 */
// ============================================================



// ============================================================
// 🏮 [Real-time Module] 即時翻譯系統視圖 */
// ============================================================




// ============================================================
// 🆘 [Emergency Module] 緊急救援系統視圖
// ============================================================


/** 🆘 [Emergency Module] 緊急救援系統視圖 (對位購物頁：視覺主權回歸版) */
renderEmergency(container, emergencyVault = [], activeTab = 'medical') {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const embassys = emergencyVault.filter(i => i.type === 'embassy');
    const medicals = emergencyVault.filter(i => i.type === 'medical');
    const insurances = emergencyVault.filter(i => i.type === 'insurance');

    container.innerHTML = `
        <div class="emergency-module animate-fade-in space-y-6 pb-32">
            
            <div class="bg-white rounded-[2.5rem] p-7 shadow-sm border border-slate-50 space-y-5">
                <div class="flex justify-between items-center px-1">
                    <div class="flex items-center gap-2">
                        <h4 class="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Medical Intelligence System</h4>
                    </div>
                    <div id="emergency-ai-btn">
                        ${this.renderAICopyBtn(this._getEmergencyAiPrompt(trip?.city || '日本', ''))}
                    </div>
                </div>

                <div class="grid grid-cols-2 gap-3">
                    <div class="relative">
                        <input type="text" id="emergency-query-input" 
                               class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-black text-xs theme-text-pink focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                               placeholder="城市區域" value="${trip?.city || ''}" oninput="App.syncEmergencyAiPrompt()">
                    </div>
                    <div class="relative">
                        <input type="text" id="insurance-query-input" 
                               class="w-full bg-slate-50 border-none rounded-2xl py-4 px-5 font-black text-xs focus:ring-2 focus:ring-pink-100 transition-all outline-none" 
                               placeholder="保險公司" oninput="App.syncEmergencyAiPrompt()">
                    </div>
                </div>

                <textarea id="emergency-json-input" 
                          class="w-full h-28 bg-slate-50 border-none rounded-[1.8rem] p-5 font-mono text-[10px] theme-text-pink focus:ring-2 focus:ring-pink-100 outline-none transition-all shadow-inner" 
                          placeholder="請貼上 AI 生成的 JSON 救援燃料包..."></textarea>
                
                <button onclick="App.importEmergencyFuel()" 
                        class="w-full py-4 theme-bg text-white rounded-[1.5rem] font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all">
                    執行數據同步
                </button>
            </div>

            <div class="flex gap-3 px-2 overflow-x-auto no-scrollbar snap-x">
                ${['medical', 'embassy', 'insurance'].map(tab => {
                    const labels = { medical: '🏥 醫療救援', embassy: 'TW 領事護照', insurance: '🛡️ 旅平理賠' };
                    const isActive = activeTab === tab;
                    return `
                        <div class="snap-center">
                            <button onclick="App.filterEmergency('${tab}')" 
                                    class="px-6 py-2.5 rounded-2xl text-[11px] font-black border transition-all whitespace-nowrap
                                    ${isActive ? 'theme-bg text-white border-transparent shadow-lg shadow-pink-100' : 'bg-white text-slate-400 border-slate-100'}">
                                ${labels[tab]}
                            </button>
                        </div>`;
                }).join('')}
            </div>

            <div id="emergency-content" class="min-h-[400px] animate-fade-in px-2">
                ${this._renderEmergencyTabContent(activeTab, { embassys, medicals, insurances })}
            </div>
        </div>
    `;
},


/** 🧬 子組件：救援分區渲染引擎 */
_renderEmergencyTabContent(tab, data) {
    switch(tab) {
        case 'medical': 
            return this._renderMedicalSection(data.medicals);
        case 'embassy': 
            return this._renderEmbassySection(data.embassys);
        case 'insurance': 
            return this._renderInsuranceSection(data.insurances);
    }
},

/** 🏥 [Skeleton] 醫療分區骨架總裝 */
_renderMedicalSection(items) {
    // 🚀 組合重要資訊渲染與燃料數據渲染
    const strategicGuide = this._renderMedicalTacticalGuide();
    const dataCards = this._renderMedicalFuelCards(items);

    return `
        <div class="emergency-medical-sector animate-fade-in space-y-6">
            ${strategicGuide}
            <div id="medical-cards-track" class="px-2">
                ${dataCards}
            </div>
        </div>
    `;
},

/** 🚑 [Tactical] 醫療重要資訊與 SOP 指南 (V2026.ULTRA 終極對焦版) */
_renderMedicalTacticalGuide() {
    return `
<div class="bg-pink-50/40 border-2 border-dashed border-pink-100/60 rounded-[3rem] p-8 mb-10 animate-fade-in mx-2 overflow-hidden">
    <div class="flex items-center gap-3.5 mb-10 px-1">
        <span class="text-2xl drop-shadow-sm">🚑</span>
        <div class="flex flex-col">
            <h4 class="text-slate-800 font-black text-base tracking-tighter">日本就醫與理賠協定</h4>
            <p class="text-[9px] theme-text-pink font-black uppercase tracking-[0.2em] opacity-60">Medical Protocol V2.1</p>
        </div>
    </div>
    
    <div class="space-y-4">
        ${[
            { id: '01', title: '聯繫與搜尋', content: `確認支援代墊。外語醫院請檢索 <a href="#" class="theme-text-pink font-black border-b border-pink-200">JNTO 就醫指南</a>，或利用 <a href="#" class="theme-text-pink font-black border-b border-pink-200">OHDr.</a> 執行中文視訊看診。` },
            { id: '02', title: '文件指紋存取', content: `就醫後務必領取 <span class="text-slate-700 font-black">「診斷書(診断書)」</span> 與 <span class="text-slate-700 font-black">「收據明細(領収書)」</span>。內容需包含病名、診療內容與費用。` },
            { id: '03', title: '執行跨國理賠', content: `利用 <a href="#" class="theme-text-pink font-black border-b border-pink-200">健保快易通</a> 查詢就醫紀錄。可同步申請「健保自墊核退」與商業旅平險理賠。` }
        ].map(item => `
            <div class="flex gap-4 p-5 bg-white/60 rounded-[2rem] border border-white/40 shadow-sm group">
                <div class="flex-none">
                    <span class="theme-bg text-white w-7 h-7 rounded-2xl flex items-center justify-center text-[10px] font-black shadow-lg shadow-pink-100/50">${item.id}</span>
                </div>
                <div class="flex-1 min-w-0 pt-0.5">
                    <h5 class="text-slate-800 font-black text-[13px] mb-1.5 tracking-tight">${item.title}</h5>
                    <div class="text-slate-400 text-[11px] font-medium leading-[1.7] antialiased">
                        ${item.content}
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <div class="mt-8 px-4 py-5 bg-pink-100/30 rounded-[1.8rem] border border-pink-200/20">
        <div class="flex gap-3 items-start">
            <span class="text-sm shrink-0">※</span>
            <p class="text-[10px] theme-text-pink italic leading-relaxed font-black">
                職人提示：請務必結清醫藥費以維護個人信用指紋，避免影響未來入境日本之權益。
            </p>
        </div>
    </div>
</div>`;
},

/** 🧪 [Fuel] 醫療數據燃料包渲染 (V2026.ULTRA 物理對焦修正版) */
_renderMedicalFuelCards(items) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const fullVault = trip ? (trip.emergencyVault || []) : [];

    // 🚀 核心修正 1：指針對焦
    // 💡 職人診斷：使用 viewEngine 實體取代 this，確保在非同步渲染中不因作用域位移而崩潰
    if (!items || items.length === 0) return viewEngine._renderEmptyState('MEDICAL');

    return items.map((item) => {
        const absoluteIdx = fullVault.findIndex(v => v === item);
        
        // 🚀 核心修正 2：物理路網導通
        // 💡 修正：將 0{ 改為 0/${ ，確保變數正確注入 URL 軌道
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=$/${encodeURIComponent(item.name + ' ' + item.address)}`;

        return `
        <div class="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6 relative group animate-slide-up mb-6">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-[9px] font-black theme-text-pink uppercase tracking-[0.2em] mb-1">Medical Support</p>
                    <h4 class="font-black text-slate-800 text-[18px] leading-tight">${item.name}</h4>
                </div>
            </div>

            <a href="tel:${item.phone}" class="block bg-slate-50 p-5 rounded-[1.8rem] border border-slate-100 active:scale-95 transition-all group/phone hover:border-pink-100">
                <p class="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-tighter">醫院聯絡電話</p>
                <div class="flex items-center justify-between">
                    <p class="text-[13px] font-black text-slate-700 tabular-nums">${item.phone}</p>
                    <span class="text-lg opacity-40 group-hover/phone:opacity-100 group-hover/phone:theme-text-pink transition-all">📞</span>
                </div>
            </a>

            <div class="space-y-4">
                <a href="${mapUrl}" target="_blank" class="block bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100/50 group/map transition-all hover:bg-white hover:border-pink-100">
                    <p class="text-[11px] text-slate-500 font-bold leading-relaxed flex items-start gap-2">
                        <span class="shrink-0 group-hover/map:animate-bounce">📍</span> ${item.address}
                    </p>
                    <span class="block text-[8px] text-slate-300 font-black uppercase tracking-widest mt-2 ml-6 group-hover/map:theme-text-pink transition-colors">Open Navigation →</span>
                </a>
                
                <div class="px-2">
                    <p class="text-[10px] text-slate-400 font-bold leading-relaxed italic">"${item.info}"</p>
                </div>
            </div>

            <div class="flex justify-end pt-2 border-t border-slate-50">
                <button onclick="App.promptEditEmergencyItem(${absoluteIdx})" 
                        class="text-[10px] font-black text-slate-200 hover:theme-text-pink transition-colors uppercase tracking-widest">
                    Edit Diagnostic Data
                </button>
            </div>
        </div>`;
    }).join('');
},



/** 🗼 [Skeleton] 外交分區骨架總裝 */
_renderEmbassySection(items) {
    // 🚀 執行組件總裝
    const strategicSop = this._renderEmbassyTacticalGuide();
    const dataCards = this._renderEmbassyFuelCards(items);

    return `
        <div class="emergency-embassy-sector animate-fade-in space-y-6">
            ${strategicSop}
            <div id="embassy-cards-track" class="px-2">
                ${dataCards}
            </div>
        </div>
    `;
},

/** 📕 [Tactical] 外交重要資訊：主題配色與流體排版 (V2026.ULTRA) */
_renderEmbassyTacticalGuide() {
    return `
        <div class="animate-fade-in mx-4 mb-10">
            <div class="flex items-center gap-3 mb-6 border-b border-pink-100 pb-4">
                <span class="text-2xl">🌍</span>
                <div>
                    <h4 class="text-slate-800 font-black text-[15px] tracking-tight">領務安全資訊彙整</h4>
                    <p class="text-[9px] theme-text-pink font-bold uppercase tracking-widest italic">Travel Safety Guide</p>
                </div>
            </div>
            
            <div class="grid grid-cols-2 gap-4 mb-8">
                <a href="https://www.boca.gov.tw/sp-abre-main-1.html" target="_blank" 
                   class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all group">
                    <p class="text-[8px] font-black theme-text-pink uppercase mb-2 tracking-tighter">行前準備</p>
                    <p class="text-[12px] font-bold text-slate-700 group-hover:theme-text-pink transition-colors">出國登錄系統</p>
                </a>
                <a href="https://www.boca.gov.tw/sp-trwa-list-1.html" target="_blank" 
                   class="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm active:scale-95 transition-all group">
                    <p class="text-[8px] font-black text-rose-500 uppercase mb-2 tracking-tighter">環境現況</p>
                    <p class="text-[12px] font-bold text-slate-700 group-hover:text-rose-600 transition-colors">即時旅遊警示</p>
                </a>
            </div>

            <div class="px-2 space-y-4">
                <h5 class="text-[10px] font-black theme-text-pink opacity-50 uppercase tracking-widest mb-4 italic">Traveler Checklist / 出發前叮嚀</h5>
                <div class="space-y-4 text-[11px] font-bold text-slate-600 leading-relaxed">
                    <div class="flex items-start gap-3">
                        <span class="theme-text-pink mt-0.5">✦</span>
                        <p>護照效期：請確認效期在 <span class="theme-text-pink underline decoration-pink-200">6 個月以上</span> 且留有足夠空白頁面。</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="theme-text-pink mt-0.5">✦</span>
                        <p>日本自駕提醒：請務必隨身攜帶 <span class="text-slate-800 font-black">台灣駕照正本 與 日文譯本</span>。</p>
                    </div>
                    <div class="flex items-start gap-3">
                        <span class="theme-text-pink mt-0.5">✦</span>
                        <p>
                            官方資源：建議下載 
                            <a href="https://www.boca.gov.tw/cp-92-246-b7290-1.html" target="_blank" 
                               class="theme-text-pink underline underline-offset-4 decoration-pink-200 hover:opacity-70 transition-all">
                               「旅外安全指南 APP」
                            </a> 
                            以便隨時聯繫鄰近駐外館處。
                        </p>
                    </div>
                </div>
            </div>
        </div>

        <div class="relative mx-2 mb-10 group">
            <div class="absolute inset-0 bg-gradient-to-br from-pink-600 via-rose-500 to-pink-700 rounded-[3rem] shadow-2xl"></div>
            <div class="absolute -right-4 -top-4 text-9xl opacity-10 font-black italic select-none pointer-events-none group-hover:opacity-15 transition-opacity">BOCA</div>
            
            <div class="relative z-10 p-9 text-white">
                <div class="flex items-center justify-between mb-10">
                    <h3 class="font-black text-sm flex items-center gap-3">
                        <span class="text-xl">📕</span> 護照遺失應變處理
                    </h3>
                    <div class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                </div>
                
                <div class="space-y-10 relative">
                    <div class="absolute left-[13px] top-2 bottom-2 w-[1px] bg-gradient-to-b from-white/40 via-white/10 to-white/40"></div>

                    <div class="flex gap-6 items-start relative">
                        <span class="w-7 h-7 rounded-full bg-white text-pink-600 flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg z-10">1</span>
                        <div class="flex-1 border-b border-white/5 pb-6">
                            <p class="text-[12px] font-black text-pink-100 mb-2 uppercase tracking-widest">Police Report</p>
                            <p class="text-[11px] font-medium leading-relaxed opacity-90">
                                請至最近的「交番」(Koban) 報案，並取得 <span class="text-white font-black border-b border-white/60">【遺失屆出證明書】</span>。
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-6 items-start relative">
                        <span class="w-7 h-7 rounded-full bg-white text-pink-600 flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg z-10">2</span>
                        <div class="flex-1 border-b border-white/5 pb-6">
                            <p class="text-[12px] font-black text-pink-100 mb-2 uppercase tracking-widest">Requirements</p>
                            <p class="text-[11px] font-medium leading-relaxed opacity-90">
                                請準備 <span class="text-white font-black">2 吋照片 2 張</span> 及身分證明。建議將證件與護照分開存放。
                            </p>
                        </div>
                    </div>

                    <div class="flex gap-6 items-start relative">
                        <span class="w-7 h-7 rounded-full bg-white text-pink-600 flex items-center justify-center text-[11px] font-black shrink-0 shadow-lg z-10">3</span>
                        <div class="flex-1 pb-2">
                            <p class="text-[12px] font-black text-pink-100 mb-2 uppercase tracking-widest">Documentation</p>
                            <p class="text-[11px] font-medium leading-relaxed opacity-90">
                                聯繫駐外代表處申請 <span class="text-white font-black border-b border-white/60">「入國證明書」</span>。回國後再補辦護照。
                            </p>
                        </div>
                    </div>
                </div>

                <div class="mt-12 pt-8 border-t border-white/10 flex flex-col gap-4">
                    <div class="flex justify-between items-end">
                        <div>
                            <p class="text-[8px] font-black text-pink-100 uppercase tracking-[0.3em] mb-1">Emergency Support</p>
                            <p class="text-[15px] font-black text-white tabular-nums tracking-tighter">+886-800-085-095</p>
                        </div>
                        <div class="text-right">
                            <p class="text-[9px] text-pink-200 font-bold italic leading-relaxed opacity-80">※ 職人提醒：請妥善保存報案單與相關收據。</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
},

/** 🧪 [Fuel] 外交數據燃料包渲染 (V2026.ULTRA 物理對焦修正版) */
_renderEmbassyFuelCards(items) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const fullVault = trip ? (trip.emergencyVault || []) : [];

    // 🚀 核心修正 1：實體指針導通
    // 💡 職人診斷：使用 viewEngine 確保在任何閉包環境下都能準確抓到空狀態零件
    if (!items || items.length === 0) return viewEngine._renderEmptyState('EMBASSY');

    return items.map((item) => {
        const absoluteIdx = fullVault.findIndex(v => v === item);
        
        // 🚀 核心修正 2：URL 語法洗滌
        // 💡 修正：將 0{ 改為 0/${ ，確保 Google Maps 軌道正確讀取變數
        const mapUrl = `https://www.google.com/maps/search/?api=1&query=$/${encodeURIComponent(item.name + ' ' + item.address)}`;

        return `
        <div class="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6 relative group animate-slide-up mb-6">
            <div class="flex justify-between items-start">
                <div>
                    <p class="text-[9px] font-black theme-text-pink uppercase tracking-[0.2em] mb-1">Diplomatic Mission</p>
                    <h4 class="font-black text-slate-800 text-[18px] leading-tight">${item.name}</h4>
                </div>
            </div>

            <div class="grid grid-cols-2 gap-3">
                <a href="tel:${item.phone}" class="bg-slate-50 p-4 rounded-[1.5rem] border border-slate-100 active:scale-95 transition-all group/phone hover:border-pink-100">
                    <p class="text-[8px] font-black text-slate-400 uppercase mb-1 tracking-tighter">領務一般洽詢</p>
                    <div class="flex items-center justify-between">
                        <p class="text-[12px] font-black text-slate-700 tabular-nums">${item.phone}</p>
                        <span class="text-xs group-hover/phone:theme-text-pink transition-colors">📞</span>
                    </div>
                </a>
                <a href="tel:${item.rescuePhone}" class="bg-pink-50 p-4 rounded-[1.5rem] border border-pink-100/50 active:scale-95 transition-all group/emergency hover:border-pink-300 shadow-sm shadow-pink-100/20">
                    <p class="text-[8px] font-black theme-text-pink uppercase mb-1 tracking-tighter">24H 急難救助</p>
                    <div class="flex items-center justify-between">
                        <p class="text-[12px] font-black theme-text-pink tabular-nums">${item.rescuePhone}</p>
                        <span class="text-xs group-hover/emergency:animate-pulse">🆘</span>
                    </div>
                </a>
            </div>

            <div class="space-y-4">
                <a href="${mapUrl}" target="_blank" class="block bg-slate-50/50 p-5 rounded-[2rem] border border-slate-100/50 group/map transition-all hover:bg-white hover:border-pink-100">
                    <p class="text-[11px] text-slate-500 font-bold leading-relaxed flex items-start gap-2">
                        <span class="shrink-0 group-hover/map:animate-bounce">📍</span> 
                        <span>${item.address}</span>
                    </p>
                    <span class="block text-[8px] text-slate-300 font-black uppercase tracking-widest mt-2 ml-6 group-hover/map:theme-text-pink transition-colors">Open Navigation →</span>
                </a>

                <div class="px-2 border-l-2 border-slate-100 ml-1">
                    <p class="text-[10px] text-slate-400 font-bold leading-relaxed italic">"${item.info}"</p>
                </div>
            </div>
            
            <div class="flex justify-end pt-2 border-t border-slate-50">
                <button onclick="App.promptEditEmergencyItem(${absoluteIdx})" 
                        class="text-[9px] font-black text-slate-200 hover:theme-text-pink transition-colors uppercase tracking-widest">
                    Update Mission Fingerprint
                </button>
            </div>
        </div>`;
    }).join('');
},


/** 🛡️ [Skeleton] 保險分區骨架總裝 */
_renderInsuranceSection(items) {
    // 🚀 執行組件總裝：重要資訊（流程與清單） + 燃料數據（聯繫卡片）
    const tacticalInfo = this._renderInsuranceTacticalGuide();
    const dataCards = this._renderInsuranceFuelCards(items);

    return `
        <div class="emergency-insurance-sector animate-fade-in space-y-6 px-2">
            ${tacticalInfo}
            <div id="insurance-cards-track">
                ${dataCards}
            </div>
            ${this._renderInsuranceEvidenceChecklist()}
        </div>
    `;
},

/** 🛡️ [Tactical] 保險重要資訊：主題配色與應變導引 (V2026.ULTRA) */
_renderInsuranceTacticalGuide() {
    return `
        <div class="relative mx-2 mb-10 group">
            <div class="absolute inset-0 bg-gradient-to-br theme-bg rounded-[3rem] shadow-xl opacity-90"></div>
            <div class="absolute -right-6 -bottom-6 text-9xl opacity-10 font-black italic select-none pointer-events-none group-hover:opacity-20 transition-opacity">CLAIM</div>
            
            <div class="relative z-10 p-9 text-white">
                <h3 class="font-black text-[15px] flex items-center gap-3 mb-4 text-white">
                    <span class="text-xl">🛡️</span> 旅平險理賠申請協定
                </h3>
                <p class="text-[11px] text-white/90 leading-relaxed font-bold">
                    意外發生時，請於 <span class="text-amber-300 font-black">第一時間</span> 聯繫保險專線報備。確保所有收據與護照姓名一致，並務必妥善封存 <span class="underline decoration-amber-400 underline-offset-4">原始紙本單據</span>。
                </p>
                <div class="mt-6">
                    <span class="bg-white/20 px-3 py-1 rounded-full text-[9px] font-black border border-white/20 shadow-sm uppercase tracking-wider">
                        2026 新規：每人上限 2 張
                    </span>
                </div>
            </div>
        </div>

        <div class="animate-fade-in mx-4 mb-12">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-10">
                
                <div class="space-y-5">
                    <div class="flex items-center gap-3 border-b border-pink-100 pb-3">
                        <span class="text-lg">🏥</span>
                        <h4 class="text-slate-800 font-black text-[14px] tracking-tight">海外醫療處置</h4>
                    </div>
                    <div class="space-y-4 text-[11px] font-bold text-slate-500 leading-relaxed">
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>務必索取 <span class="theme-text-pink font-black">診斷證明書正本</span> (內容需含醫生簽章)。</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>完整保留費用細項收據、處方箋與診療明細表。</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>若需住院請先致電救援中心，確認是否支援代墊。</p>
                        </div>
                    </div>
                </div>

                <div class="space-y-5">
                    <div class="flex items-center gap-3 border-b border-pink-100 pb-3">
                        <span class="text-lg">✈️</span>
                        <h4 class="text-slate-800 font-black text-[14px] tracking-tight">旅遊不便處理</h4>
                    </div>
                    <div class="space-y-4 text-[11px] font-bold text-slate-500 leading-relaxed">
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>班機延誤：請於現場索取標明「延誤原因」之正式證明。</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>行李損失：取得 <span class="theme-text-pink font-black">PIR 事故報告</span>，並請務必對受損處拍照留底。</p>
                        </div>
                        <div class="flex items-start gap-3">
                            <span class="theme-text-pink mt-1">✦</span>
                            <p>額外支出：妥善保留延誤期間所有合理的餐飲與住宿收據。</p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;
},


/** 📋 [Tactical Sub] 證據採集清單：主題配色版 (V2026.ULTRA) */
_renderInsuranceEvidenceChecklist() {
    const checklistItems = [
        { t: '醫療', d: '診斷書正本、收據明細、處方箋' },
        { t: '交通', d: '延誤證明(註明原因)、原始登機證' },
        { t: '財損', d: 'PIR報告、報案證明、維修估價單' },
        { t: '預防', d: '護照影本與證明文件建議拍照留存' }
    ];

    return `
<div class="animate-fade-in mx-4 mb-10">
    <div class="flex items-center justify-between mb-6 border-b border-pink-100 pb-4">
        <div class="flex items-center gap-3">
            <span class="text-xl">📋</span>
            <h4 class="text-slate-800 font-black text-[15px] tracking-tight">理賠證據採集指引</h4>
        </div>
        <span class="text-[9px] theme-text-pink font-black uppercase tracking-widest italic">Evidence Pool</span>
    </div>

    <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-6 px-2">
        ${checklistItems.map((item, idx) => `
        <div class="flex items-start gap-4 group cursor-pointer" onclick="App.toggleClaimCheck('claim-check-${idx}')">
            <div id="claim-check-${idx}" class="w-6 h-6 rounded-xl border-2 border-slate-200 flex items-center justify-center shrink-0 transition-all group-hover:border-pink-400">
                <svg class="w-4 h-4 text-white opacity-0 transition-opacity" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                </svg>
            </div>
            <div class="flex flex-col">
                <span class="text-[12px] font-black text-slate-700 leading-tight group-hover:theme-text-pink transition-colors">${item.t}類文件</span>
                <span class="text-[10px] font-bold text-slate-400 mt-1 leading-relaxed">${item.d}</span>
            </div>
        </div>`).join('')}
    </div>

    <div class="mt-8 p-6 bg-slate-50 rounded-[2rem] border border-slate-100/50">
        <p class="text-[10px] text-slate-400 font-bold leading-relaxed italic">
            ※ 職人提醒：定額給付不看單據，實支實付需憑發票。2026 年新規限制每人每趟旅程投保上限為 2 張，請確保投保額度對焦需求。
        </p>
    </div>
</div>`;
},

/** 🧪 [Fuel] 保險數據燃料包渲染 (V2026.ULTRA 實體對焦版) */
_renderInsuranceFuelCards(items) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    const fullVault = trip ? (trip.emergencyVault || []) : [];

    // 🚀 核心修正：指針穩壓
    // 💡 職人診斷：使用 viewEngine 實體取代 this，確保在 ESM 模組作用域下 100% 導通空狀態零件
    if (!items || items.length === 0) return viewEngine._renderEmptyState('INSURANCE');

    return items.map((item) => {
        const absoluteIdx = fullVault.findIndex(v => v === item);

        return `
        <div class="bg-white p-8 rounded-[3rem] border border-slate-50 shadow-sm space-y-6 relative group animate-slide-up mb-6">
            <div class="flex justify-between items-start px-1">
                <div>
                    <p class="text-[9px] font-black text-blue-500 uppercase tracking-[0.2em] mb-1 italic">24H Global Hotline</p>
                    <h5 class="font-black text-slate-800 text-[18px] leading-tight">${item.name}</h5>
                </div>
            </div>

            <a href="tel:${item.phone}" class="block bg-blue-50/50 p-5 rounded-[1.8rem] border border-blue-100/50 active:scale-95 transition-all group/call hover:border-blue-200">
                <p class="text-[8px] font-black text-blue-400 uppercase mb-1 tracking-tighter">24H 全球救援專線</p>
                <div class="flex items-center justify-between">
                    <p class="text-[14px] font-black text-blue-700 tabular-nums">${item.phone}</p>
                    <span class="text-lg opacity-40 group-hover/call:opacity-100 transition-opacity">📞</span>
                </div>
            </a>

            <div class="space-y-4">
                <div class="px-2 border-l-2 border-blue-100 ml-1">
                    <p class="text-[10px] text-slate-400 font-bold leading-relaxed italic">"${item.info}"</p>
                </div>

                <div class="flex justify-end pt-2 border-t border-slate-50">
                    <button onclick="App.promptEditEmergencyItem(${absoluteIdx})" 
                            class="text-[9px] font-black text-slate-200 hover:text-blue-500 transition-colors uppercase tracking-widest">
                        Edit Policy Data
                    </button>
                </div>
            </div>
        </div>`;
    }).join('');
},



/** 🚀 AI 指令引擎：緊急救援全維度對焦 (V2026.ULTRA 物理真值防禦版) */
_getEmergencyAiPrompt(city, insurance) {
    const insuranceTarget = (insurance && insurance.trim()) ? insurance.trim() : '台灣常見保險公司';
    
    return `你是一位國際旅遊數據驗證專家。請針對「${city}」提供以下【救援燃料】，並以單一 JSON 陣列格式輸出。

🚨 核心資源對焦協定：
1. **駐外機構**：提供鄰近${city}的「中華民國駐外代表處」官方實體真值。
2. **醫療資源**：3-5 個鄰近${city}、具備中文能力或醫療口譯之急救醫院。
3. **保險資源**：僅提供「${insuranceTarget}」官方專屬的 24H 海外急難救助電話。

🚨 數據真值與熔斷協定 (Critical Integrity)：
- **嚴禁編造電話**：針對「${insuranceTarget}」，[phone] 欄位必須經過內部邏輯二次比對。若你無法 100% 確認其 2026 年最新專線，請填寫「請查閱保單封面或官方 App」。
- **物理宣告**：在 [info] 欄位最後必須加上「(請務必以手邊保單正本為準)」。

🚨 輸出規範：
- 純 JSON 陣列，嚴禁解釋文字或 Markdown。
- 欄位：type ("embassy", "medical", "insurance"), name, address, phone, info, rescuePhone (僅限 embassy)。

範例校準：
{ 
  "type": "insurance", 
  "name": "Chubb 安達海外急難救助中心", 
  "phone": "+886-2-23266758", 
  "info": "24小時全球緊急支援專線。提供醫療傳譯與法律協助。(請務必以手邊保單正本為準)" 
}`;
},

// ============================================================
// 5. [Fuel Interpreters] 高品質燃料解析引擎
// 負責：AI JSON 解析、分段路網渲染
// ============================================================


/** 🤖 輔助組件：AI 指令複製按鈕 (V2026.ULTRA 強健數據傳輸版) */
renderAICopyBtn(prompt) {
    if (!prompt) return '';

    // 🚀 核心 A：數據加固 - 採用二進位流式封裝協定 (Binary Stream Protocol)
    // 徹底封殺 btoa 在處理 UTF-8/繁體中文時的物理斷路風險，確保長 Prompt 不失真
    const safePrompt = btoa(encodeURIComponent(prompt).replace(/%([0-9A-F]{2})/g, (match, p1) => {
        return String.fromCharCode('0x' + p1);
    }));

    // 🎨 核心 B：視覺對焦 - 強化按鈕的「數據感」與「物理回饋」
    return `
        <button onclick="App.copyToClipboard('${safePrompt}')" 
                style="background-color: color-mix(in srgb, var(--theme-primary) 10%, white); 
                       color: var(--theme-primary); 
                       border-color: color-mix(in srgb, var(--theme-primary) 20%, white);"
                class="flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-black transition-all active:scale-95 active:brightness-90 uppercase tracking-widest shadow-sm border border-dashed cursor-pointer group">
            
            <div class="relative w-2.5 h-2.5 flex items-center justify-center">
                <span class="absolute w-full h-full bg-[var(--theme-primary)] rounded-full animate-ping opacity-30"></span>
                <span class="relative text-[11px] group-hover:rotate-12 transition-transform duration-300">✨</span>
            </div>
            
            <span class="leading-none tracking-tight">Copy AI Protocol</span>
            
            <div class="w-1 h-1 rounded-full bg-[var(--theme-primary)] opacity-40 ml-1"></div>
        </button>`;
},


renderItineraryFuel(jsonStr) {
    if (!jsonStr || jsonStr.trim() === "") return `<div style="padding: 24px; color: #B4B2A9; font-style: italic; font-size: 12px;">等待燃料注入...</div>`;

    try {
        const sanitized = jsonStr
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .replace(/[\u200B-\u200D\uFEFF]/g, '')
            .replace(/:\s*(?=[,}])/g, ': 1')
            .trim();

        const data = JSON.parse(sanitized);
        const rawItems = (data && data.stops && Array.isArray(data.stops)) ? data.stops : (Array.isArray(data) ? data : [data]);

        if (rawItems.length === 0) return "";

        if (rawItems.some(item => item && 'price' in item)) {
            return this._renderShoppingFuelPreview(rawItems);
        }

        let totalExpense = 0;
        const contentHtml = rawItems.map((item, idx) => {
            let displayExpense = "0";
            if (item.expense) {
                const costStr = String(item.expense);
                const prices = costStr.replace(/,/g, '').match(/\d+/g);
                if (prices) totalExpense += (prices.map(Number).reduce((a, b) => a + b, 0) / prices.length);
                displayExpense = costStr.replace(/[^\d]/g, '') || "0";
            }

            let cleanNote = "";
            if (item.note) {
                cleanNote = String(item.note).replace(/^(MEMO|memo|備註)[:：]\s*/i, '').trim();
            }

            const hasDetails = item.spotlight || cleanNote;

            // 備註圖示與顏色
            let noteIcon = 'fa-circle-info', noteIconColor = '#D97706';
            let noteBg = '#FFFBEB', noteBorder = '#F59E0B', noteTextColor = '#451A03';
            if (cleanNote && (cleanNote.includes('⚠️') || cleanNote.includes('注意'))) {
                noteIcon = 'fa-triangle-exclamation'; noteIconColor = '#D97706';
            } else if (cleanNote && (cleanNote.includes('📍') || cleanNote.includes('出口'))) {
                noteIcon = 'fa-location-dot'; noteIconColor = '#3B82F6';
                noteBg = '#EFF6FF'; noteBorder = '#93C5FD'; noteTextColor = '#1E3A5F';
            }

            return `
                <div class="itinerary-fuel-box animate-fade-in"
                     style="${idx > 0 ? 'margin-top: 16px; padding-top: 16px; border-top: 1px dashed #E2E8F0;' : 'margin-top: 8px;'}"
                     data-index="${idx}">

                    <!-- 標頭：時間 + 標題 -->
                    <div style="display: flex; align-items: flex-start; gap: 8px;">
                        <span style="
                            font-size: 11px; font-weight: 800; font-style: italic;
                            color: #D4537E; background: #FBEAF0;
                            padding: 2px 8px; border-radius: 6px;
                            white-space: nowrap; flex-shrink: 0;
                            font-variant-numeric: tabular-nums;
                        " data-field="time" data-index="${idx}">${item.time || '--:--'}</span>

                        <h4 style="
                            font-size: 13px; font-weight: 700;
                            color: #1a1a1a; line-height: 1.4;
                            word-break: break-word; margin: 0;
                        " data-field="task" data-index="${idx}">${item.task || item.location || '新節點'}</h4>
                    </div>

                    <!-- move 區塊 -->
                    ${item.move ? `
                    <div style="
                        margin-top: 8px;
                        border-left: 2px solid #E2E8F0;
                        padding: 4px 0 4px 10px;
                    " data-field="move" data-index="${idx}">
                        <p style="
                            font-size: 12px; font-weight: 500;
                            color: #444441; line-height: 1.7; margin: 0;
                        ">${item.move}</p>
                    </div>` : ''}

                    <!-- 費用標籤 -->
                    ${Number(displayExpense) > 0 ? `
                    <div style="margin-top: 8px; display: flex; align-items: baseline; gap: 3px;">
                        <span style="font-size: 9px; font-weight: 700; color: #B4B2A9; letter-spacing: 0.04em;">費用</span>
                        <span style="
                            font-size: 13px; font-weight: 800;
                            color: #D4537E; font-variant-numeric: tabular-nums;
                        " data-field="expense" data-index="${idx}">¥${Number(displayExpense).toLocaleString()}</span>
                    </div>` : ''}

                    <!-- 詳細備註收折 -->
                    ${hasDetails ? `
                    <details style="margin-top: 8px;">
                        <summary style="
                            list-style: none; cursor: pointer; user-select: none;
                            display: inline-flex; align-items: center; gap: 5px;
                        ">
                            <span style="
                                display: inline-flex; align-items: center; justify-content: center;
                                width: 16px; height: 16px; border-radius: 50%;
                                background: #F1EFE8; color: #888780; font-size: 8px;
                            "><i class="fa-solid fa-chevron-down"></i></span>
                            <span style="
                                font-size: 11px; font-weight: 700; color: #5F5E5A;
                                letter-spacing: 0.04em;
                            ">詳細備註</span>
                        </summary>

                        <div style="margin-top: 8px; display: flex; flex-direction: column; gap: 8px;">
                            ${item.spotlight ? `
                            <div style="
                                background: ${noteBg};
                                border-left: 3px solid ${noteBorder};
                                border-radius: 0 8px 8px 0;
                                padding: 10px 12px 10px 36px;
                                position: relative;
                            ">
                                <i class="fa-solid ${noteIcon}" style="
                                    position: absolute; left: 12px; top: 12px;
                                    font-size: 12px; color: ${noteIconColor};
                                "></i>
                                <p style="
                                    font-size: 13px; font-weight: 500;
                                    color: ${noteTextColor}; line-height: 1.7; margin: 0;
                                    word-break: break-word;
                                " data-field="spotlight" data-index="${idx}">${item.spotlight}</p>
                            </div>` : ''}

                            ${cleanNote ? `
                            <p style="
                                font-size: 12px; font-weight: 500; color: #444441;
                                line-height: 1.7; padding: 0 4px; margin: 0;
                                word-break: break-word;
                            " data-field="note" data-index="${idx}">${cleanNote}</p>` : ''}
                        </div>
                    </details>` : ''}
                </div>`;
        }).join('');

        // 底部總計
        const footerHtml = totalExpense > 0 ? `
            <div style="
                margin-top: 24px; padding-top: 16px;
                border-top: 1.5px solid #E2E8F0;
                display: flex; justify-content: flex-end; align-items: baseline; gap: 6px;
            ">
                <span style="font-size: 10px; font-weight: 700; color: #888780; letter-spacing: 0.04em;">預估小計</span>
                <span style="font-size: 11px; font-weight: 800; color: #D4537E;">¥</span>
                <span style="
                    font-size: 20px; font-weight: 800; color: #D4537E;
                    font-variant-numeric: tabular-nums;
                ">${Math.round(totalExpense).toLocaleString()}</span>
            </div>` : '';

        return contentHtml + footerHtml;

    } catch (err) {
        console.error("❌ [Fuel-Render-Collapse]:", err);
        return `<div style="padding: 16px; background: #FFF0F0; color: #E24B4A; border-radius: 12px; font-size: 12px; font-weight: 700;">資料解析異常，請重新嘗試</div>`;
    }
},


/** 🛰️ 交通衛星組件：路網解析軌道 (V2026.ULTRA 物理隔離版) */
renderTransportFuel(memo, nodeId = "tf-auto-gen") {
    let t = { operator: "", cost: 0, alerts: [], boarding: [], stops: [], timetable: "", spotlight: "", verifications: [] };
    
    try {
        // 🚀 1. 物理洗滌與燃料提取
        const sanitized = memo
            .replace(/```json/g, '') 
            .replace(/```/g, '')     
            .replace(/[\u200B-\u200D\uFEFF]/g, '') 
            .trim();
        t = JSON.parse(sanitized || "{}");
    } catch (e) {
        return this._renderTransportError(memo);
    }

    // 🚀 2. 數據基因校準 (確保 stops 已執行 [VISIT_STOP] 洗滌與去噪)
    t.stops = this._sanitizeTransportStops(t);
    const timetableUrl = this._normalizeTimetableUrl(t.timetable);

    // 🚀 3. 模組化子任務調度
    const spotlightHtml = this._renderSpotlight(t.spotlight);
    const alertsHtml = this._renderTransportAlerts(t.alerts);
    const hasHints = t.spotlight || (t.alerts && t.alerts.length > 0);

    // 💡 Spotlight + Alerts 收合，預設不展開，減少卡片高度
    const hintsCollapsible = hasHints ? `
    <details class="w-full">
        <summary class="flex items-center gap-2 px-1 py-2 cursor-pointer select-none list-none">
            <span style="
                display: inline-flex; align-items: center; justify-content: center;
                width: 16px; height: 16px; border-radius: 50%;
                background: #F1EFE8; color: #888780; font-size: 8px;
                transition: transform 0.2s;
            "><i class="fa-solid fa-chevron-right"></i></span>
            <span style="
                font-size: 11px; font-weight: 700;
                color: #5F5E5A;
                letter-spacing: 0.08em; text-transform: uppercase;
            ">搭乘提示 · 注意事項</span>
        </summary>
        <div class="mt-2 space-y-3">
            ${spotlightHtml}
            ${alertsHtml}
        </div>
    </details>` : '';

    // 💡 職人診斷：SectorSwitch 現在承載了所有的 Timeline 細節
    const sectorSwitchHtml = this._renderSectorSwitchModule(t, timetableUrl, nodeId);
    const verificationHtml = this._renderVerificationModule(t);

    // 🚀 4. 戰術階層噴發 (Tactical Hierarchy Layout)
    return `
        <div class="mt-4 space-y-4 animate-fade-in transport-fuel-container flex flex-col w-full overflow-visible">
            ${hintsCollapsible}
            
            ${sectorSwitchHtml}
            
            ${verificationHtml}

            <div class="w-full px-1 space-y-4">
                ${this._renderFullRouteDetails(t.stops)}
                ${this._renderTransportFooter(t)}
            </div>
        </div>`;
},

_normalizeTimetableUrl(url) {
    let timetableUrl = String(url || "").trim();
    if (!timetableUrl) return "";
    
    const mdMatch = timetableUrl.match(/\((https?:\/\/[^\)]+)\)/);
    timetableUrl = mdMatch ? mdMatch[1] : (timetableUrl.match(/https?:\/\/[^\s\)]+/) || [timetableUrl])[0];
    timetableUrl = timetableUrl.replace(/[\]\)]+$/, '');
    
    return timetableUrl.startsWith('http') ? timetableUrl : 'https://' + timetableUrl;
},

_renderSectorSwitchModule(t, timetableUrl, nodeId) {
    const boardingHtml = this._renderSectorSwitch(t, nodeId);
    return `
        <div class="w-full px-1 overflow-visible">
            <div class="flex justify-between items-center mb-3 px-1">
                <span style="
                    font-size: 11px; font-weight: 700;
                    color: #5F5E5A;
                    letter-spacing: 0.08em; text-transform: uppercase;
                    display: inline-flex; align-items: center; gap: 6px;
                ">
                    <span style="
                        display: inline-flex; align-items: center; justify-content: center;
                        width: 16px; height: 16px; border-radius: 50%;
                        background: #F1EFE8; color: #888780; font-size: 8px;
                    "><i class="fa-solid fa-train"></i></span>
                    交通路段
                </span>

                ${timetableUrl ? `
                    <a href="${timetableUrl}" target="_blank" rel="noopener noreferrer"
                       style="
                           font-size: 11px; font-weight: 700;
                           color: #993556;
                           border-bottom: 1.5px solid #F4C0D1;
                           padding-bottom: 2px;
                           display: inline-flex; align-items: center; gap: 4px;
                           text-decoration: none;
                       ">
                        <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 9px;"></i>官網時刻表
                    </a>` : ''}
            </div>
            <div class="flex flex-col w-full gap-2.5">
                ${boardingHtml}
            </div>
        </div>`;
},

_renderPhysicalTimelineModule(stops) {
    return `
        <div class="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 relative shadow-sm overflow-visible min-h-[140px] w-full">
            <div class="flex justify-between items-center mb-8 px-1">
                <p class="text-[10px] font-black text-slate-300 uppercase italic tracking-[0.2em]">Physical Timeline</p>
                <div class="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)] animate-pulse"></div>
            </div>
            <div class="absolute left-[31.5px] sm:left-[39.5px] top-[100px] bottom-[80px] w-[1.5px] bg-slate-50 z-0"></div>
            <div class="dynamic-timeline-area relative z-10 w-full">
                ${this.renderTimelineSegment(stops, 0)} 
            </div>
        </div>`;
},

/** 🛡️ 實體組件：真值驗證軌道 (V2026.ULTRA 物理導航焊接版) */
_renderVerificationModule(t) {
    if (!t.verifications || t.verifications.length === 0) return '';
    
    // 🚀 1. 物理佈局動態自適應
    // 根據驗證連結數量，決定格線寬度比例
    const count = t.verifications.length;
    const gridCols = count === 3 ? 'grid-cols-3' : (count === 2 ? 'grid-cols-2' : 'grid-cols-1');

return `
        <div class="mt-3 px-1 animate-fade-in">
            <div class="flex flex-wrap gap-2">
                ${t.verifications.map(v => `
                    <a href="${v.url}" target="_blank" rel="noopener noreferrer"
                       class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 border border-pink-100 rounded-lg text-[11px] font-black theme-text-pink active:scale-95 transition-all">
                       <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/><path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
                       ${v.label}
                    </a>
                `).join('')}
            </div>
        </div>`;
},

/** 🧬 私有子組件：數據洗滌、去噪與里程碑校準 (V2026.ULTRA) */
_sanitizeTransportStops(t) {
    const boardingCount = Math.max(1, t.boarding?.length || 1);
    const maxSegIndex = boardingCount - 1;
    let currentRunningSeg = 0;

    // 🚀 1. 物理去噪協定 (Noise Filtering)
    // 💡 職人診斷：只允許具備戰術價值的里程碑通過
    const allowedTypes = ['dep', 'xfer', 'arr', 'goal', 'hub'];

    return (t.stops || [])
        .map((s) => {
            // A. 類型歸一化
            const item = (typeof s === 'object' && s !== null && s.name) 
                ? { ...s } 
                : { name: String(s || "未命名站點"), type: "station" };
            
            const typeStr = String(item.type || "station").toLowerCase();

            // B. Seg 權重對位
            if (item.seg !== undefined && item.seg !== null) {
                currentRunningSeg = Math.min(Number(item.seg), maxSegIndex);
            } else {
                item.seg = currentRunningSeg;
            }

            // C. 狀態演進 (遇到轉乘點後，下一站索引遞增)
            const isBreakPoint = ['xfer', 'arr'].includes(typeStr);
            const output = { ...item, seg: currentRunningSeg, type: typeStr };
            
            if (isBreakPoint && currentRunningSeg < maxSegIndex) {
                currentRunningSeg++;
            }
            
            return output;
        })
        .filter((item, idx, array) => {
            // 🚀 2. 數據純化熔斷 (Data Purification)
            // 💡 準則：起點與終點必留，其餘站點若非 allowedTypes 則剔除
            if (idx === 0 || idx === array.length - 1) return true;
            
            // 檢查是否為轉乘、抵達或大站
            const isMilestone = allowedTypes.includes(item.type);
            
            // 額外判定：如果名稱包含 Hub 或特定標籤，也視為里程碑
            const isHub = item.name.includes('(Hub)') || item.name.includes('大站');
            
            return isMilestone || isHub;
        });
},


/** 🧬 私有子組件：高品質亮點提示 */
_renderSpotlight(spotlight) {
    if (!spotlight) return '';
    return `
        <div class="bg-amber-50 border border-amber-100 p-4 rounded-[1.8rem] mb-5 animate-fade-in text-left shadow-sm w-full box-border">
            <div class="flex items-start gap-3">
                <div class="w-6 h-6 rounded-full bg-amber-200 flex items-center justify-center shrink-0">
                    <span class="text-[10px]">✨</span>
                </div>
                <div class="min-w-0">
                    <p class="text-[9px] font-black text-amber-600 uppercase mb-1 tracking-[0.12em]">Spotlight</p>
                    <p class="text-[11px] text-amber-900 font-bold leading-relaxed">${spotlight}</p>
                </div>
            </div>
        </div>`;
},

/** 🧬 私有子組件：路網警報 */
_renderTransportAlerts(alerts) {
    if (!alerts || alerts.length === 0) return '';
    return `
        <div class="bg-rose-50 border border-rose-100 p-4 rounded-[1.8rem] shadow-sm w-full box-border">
            <p class="text-[9px] font-black text-rose-500 uppercase mb-2 flex items-center gap-1.5 px-1">
                <span class="text-xs animate-pulse">🚨</span> 經營權/票券警報
            </p>
            <ul class="text-[10px] text-slate-600 space-y-1.5 font-medium px-1">
                ${alerts.map(a => `<li class="flex gap-2"><span>•</span><span>${a}</span></li>`).join('')}
            </ul>
        </div>`;
},

/** 🧬 私有子組件：一體化路網展開器 (V2026.ULTRA 標題解封版) */
_renderSectorSwitch(t, nodeId) {
    const safeFuel = encodeURIComponent(JSON.stringify(t));

    const sanitizeTitle = (str) => {
        if (!str) return "";
        return str.replace(/\[VISIT.*?\]/gi, '').replace(/\[.*?\]/g, '').trim();
    };

    const getTransportIcon = (text, type) => {
        const str = text.toLowerCase();
        if (str.includes('步行') || str.includes('走路') || type === 'walk') return '🏃';
        if (str.includes('新幹線')) return '🚅';
        if (str.includes('特急')) return '🚆';
        if (str.includes('地下鐵') || str.includes('地鐵')) return '🚇';
        if (str.includes('電車') || str.includes('私鐵') || str.includes('線')) return '🚃';
        if (str.includes('計程車') || str.includes('taxi')) return '🚕';
        if (str.includes('巴士') || str.includes('公車') || type === 'bus') return '🚌';
        return '🚄';
    };

    return (t.boarding || []).map((b, idx) => {
        const rawSegment = typeof b === 'object' ? b.segment : b;
        const segment = sanitizeTitle(rawSegment);
        const type = (typeof b === 'object' && b.type) ? b.type : (segment.includes('巴士') ? 'bus' : 'rail');
        const icon = getTransportIcon(segment, type);
        const cost = (typeof b === 'object' && b.cost) ? b.cost : null;
        const sectorDetailHtml = this.renderTimelineSegment(t.stops, idx);
        const isActive = idx === 0;

        return `
            <div onclick="App.switchTransportSeg(${idx}, this, '${nodeId}')"
                 data-memo="${safeFuel}"
                 class="seg-btn block w-full mb-4 group animate-fade-in transition-all duration-500 overflow-visible">

                <div style="
                    background: white;
                    border-radius: 14px;
                    border: ${isActive ? '1.5px solid #D4537E' : '0.5px solid #E2E8F0'};
                    overflow: hidden;
                    transition: all 0.3s;
                ">
                    <!-- Header -->
                    <div style="
                        display: flex; align-items: center; gap: 8px;
                        padding: 10px 14px 9px;
                        background: ${isActive ? '#FFF5F8' : '#FAFAFA'};
                        border-bottom: 0.5px solid #E2E8F0;
                    ">
                        <!-- Seg ID -->
                        <span style="
                            font-size: 10px; font-weight: 700;
                            letter-spacing: 0.05em; color: #888780;
                        ">S0${idx + 1}</span>

                        <!-- 模式徽章 -->
                        <span style="
                            font-size: 11px; font-weight: 600;
                            letter-spacing: 0.03em;
                            color: ${isActive ? '#993556' : '#5F5E5A'};
                            background: ${isActive ? '#FBEAF0' : '#F1EFE8'};
                            border-radius: 5px; padding: 2px 7px;
                        ">${icon} ${type.toUpperCase()}</span>

                        <!-- 路線名稱 -->
                        <span style="
                            flex: 1; font-size: 13px; font-weight: 600;
                            color: #1a1a1a;
                            white-space: normal; word-break: break-word; line-height: 1.4;
                        ">${segment}</span>

                        <!-- 費用 -->
                        ${cost ? `
                        <span style="
                            font-size: 12px; font-weight: 700;
                            color: #5F5E5A; white-space: nowrap;
                        ">¥${Number(cost).toLocaleString()}</span>
                        ` : ''}

                        <!-- Active 指示點 -->
                        <div style="
                            width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
                            background: ${isActive ? '#D4537E' : '#E2E8F0'};
                            ${isActive ? 'box-shadow: 0 0 6px rgba(212,83,126,0.5);' : ''}
                        "></div>
                    </div>

                    <!-- Timeline body -->
                    <div style="padding: 4px 0 2px;">
                        ${sectorDetailHtml || `
                        <p style="font-size: 11px; color: #B4B2A9; font-style: italic; padding: 10px 14px;">
                            No detail records for this sector.
                        </p>`}
                    </div>
                </div>
            </div>`;
    }).join('');
},


/** 🧬 私有子組件：全路網細節折疊區 (V2026.ULTRA 純粹去噪版) */
_renderFullRouteDetails(stops) {
    if (!stops || stops.length === 0) return "";

return `
        <details class="group w-full bg-slate-50/50 rounded-[1.4rem] border border-slate-100 overflow-hidden transition-all">
            <summary class="flex justify-between items-center px-4 py-3 cursor-pointer list-none select-none hover:bg-slate-50 transition-colors">
                <div class="flex items-center gap-2">
                    <span class="text-sm">🧭</span>
                    <span class="text-[11px] font-black text-slate-500">完整路線</span>
                    <span class="text-[10px] text-slate-400">${stops.length} 站</span>
                </div>
                <span class="text-[10px] text-slate-400 group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <div class="px-4 pb-3 w-full box-border">
                ${stops.map((stop, idx) => {
                    const isTransfer = ['xfer', 'arr'].includes(String(stop.type).toLowerCase());
                    const isStart = idx === 0;
                    return `
                    <div class="flex items-center gap-0 py-1.5 ${idx > 0 ? 'border-t border-slate-50' : ''}">
                        <span class="text-[11px] font-black theme-text-pink tabular-nums w-12 flex-shrink-0 text-right">
                            ${stop.time || '--:--'}
                        </span>
                        <div class="w-2 h-2 rounded-full mx-2 flex-shrink-0 border-2 border-white
                            ${isTransfer || isStart ? 'bg-[var(--theme-primary)]' : 'bg-slate-300'}">
                        </div>
                        <span class="text-[12px] font-bold text-slate-600 flex-1 min-w-0 truncate">
                            ${stop.name}
                        </span>
                        <span class="text-[9px] text-slate-300 flex-shrink-0 ml-1">S${stop.seg}</span>
                    </div>`;
                }).join('')}
            </div>
        </details>`;
},

/** 🧬 私有子組件：底部資訊區 (V2026.ULTRA 自動彙整版) */
_renderTransportFooter(t) {
    if (!t) return "";

    // 🚀 核心焊接：自動穿透 stops 累算所有 segment_cost
    // 💡 職人邏輯：若 stops 存在則加總各段費用，否則回退至頂層 cost
    let totalValue = 0;
    if (t.stops && Array.isArray(t.stops)) {
        totalValue = t.stops.reduce((sum, stop) => {
            return sum + (Number(stop.segment_cost) || 0);
        }, 0);
    } else {
        totalValue = Number(t.cost) || 0;
    }

    // 🚀 數據熔斷：如果總開銷為 0，則隱藏底部以維持介面純淨
    if (totalValue <= 0) return "";

    const displayTotal = Math.round(totalValue).toLocaleString();

return `
        <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-50 animate-fade-in">
            <span class="text-[10px] font-black text-slate-400 uppercase tracking-wide">預估總車資</span>
            <span class="text-[10px] font-black theme-text-pink opacity-60">¥</span>
            <span class="text-[20px] font-black theme-text-pink leading-none tabular-nums tracking-tight">${displayTotal}</span>
        </div>`;
},

/** 🧬 私有子組件：錯誤回退 */
_renderTransportError(memo) {
    return `
        <div class="mt-3 bg-emerald-50/50 border border-emerald-100 p-5 rounded-[1.8rem] flex items-start gap-3 animate-fade-in">
            <span class="text-xl">🚌</span>
            <p class="text-[11px] text-emerald-800 font-bold leading-relaxed whitespace-pre-line">${memo || '數據對焦中...'}</p>
        </div>`;
},


renderTimelineSegment(allStops, targetSegIndex) {
    if (!allStops || !Array.isArray(allStops) || allStops.length === 0) return "";
    const filtered = allStops.filter(s => Number(s.seg) === Number(targetSegIndex));
    if (filtered.length === 0) return "";
    const sanitize = (str) => (str || "").replace(/\[VISIT.*?\]/gi, '').replace(/\[.*?\]/g, '').trim();

    return filtered.map((stop, idx) => {
        const name = sanitize(stop.name);
        const { time = "", type, note = "", seg, segment_cost } = stop;
        const costValue = Number(segment_cost || 0);
        const hasCost = costValue > 0;
        const isLast = idx === filtered.length - 1;

        // 圓點顏色：出發粉紅、抵達藍色、中間站灰色
        const dotColor  = idx === 0 ? '#D4537E' : isLast ? '#185FA5' : '#B4B2A9';
        const timeColor = idx === 0 ? '#D4537E' : isLast ? '#185FA5' : '#5F5E5A';

        // 備註樣式（原邏輯保留）
        let noteStyle = "background:#F8FAFC; border-color:#E2E8F0; color:#374151;";
        if (note.includes('⚠️')) {
            noteStyle = "background:#FFFBEB; border-color:#FCD34D; color:#451A03;";
        } else if (note.includes('📍') || note.includes('出口') || note.includes('🚀')) {
            noteStyle = "background:#EFF6FF; border-color:#BFDBFE; color:#1E3A5F;";
        }

        const noteHtml = note ? `
            <details style="margin-top: 6px; width: 100%;">
                <summary style="
                    font-size: 11px; color: #5F5E5A; font-weight: 600;
                    cursor: pointer; list-none;
                    display: flex; align-items: center; gap: 4px;
                ">
                    <i class="fa-solid fa-chevron-right" style="font-size: 9px; transition: transform 0.2s;"></i>
                    詳細說明
                </summary>
                <div style="
                    ${noteStyle}
                    padding: 10px 12px;
                    border-radius: 10px;
                    border: 1px solid;
                    margin-top: 6px;
                    width: 100%; box-sizing: border-box;
                ">
                    <p style="font-size: 13px; font-weight: 600; line-height: 1.7; word-break: break-word;">
                        ${note}
                    </p>
                </div>
            </details>` : '';

        return `
            <div style="display: flex; align-items: flex-start; gap: 10px; padding: 10px 14px 0;"
                 class="animate-fade-in">

                <!-- 時間軸：圓點 + 豎線 -->
                <div style="display: flex; flex-direction: column; align-items: center; width: 14px; flex-shrink: 0;">
                    <div style="
                        width: 10px; height: 10px; border-radius: 50%;
                        border: 2px solid ${dotColor};
                        background: white;
                        margin-top: 5px; flex-shrink: 0;
                    "></div>
                    ${!isLast ? `
                    <div style="
                        width: 1.5px;
                        background: #E2E8F0;
                        flex: 1; min-height: 24px; margin-top: 3px;
                    "></div>` : ''}
                </div>

                <!-- 內容區 -->
                <div style="flex: 1; padding-bottom: ${isLast ? '12px' : '16px'};">

                    <!-- 時間 + 費用 -->
                    <div style="display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 2px;">
                        <span style="
                            font-size: 15px; font-weight: 800;
                            color: ${timeColor};
                            letter-spacing: 0.01em; font-variant-numeric: tabular-nums;
                        ">${time}</span>

                        ${hasCost ? `
                        <div style="display: flex; align-items: baseline; gap: 3px;">
                            <span style="font-size: 9px; font-weight: 700; color: #B4B2A9; letter-spacing: 0.04em;">EST.</span>
                            <span style="font-size: 12px; font-weight: 800; color: ${timeColor}; font-variant-numeric: tabular-nums;">
                                ¥${costValue.toLocaleString()}
                            </span>
                        </div>` : ''}
                    </div>

                    <!-- 站名 + TRANSFER badge -->
                    <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                        <span style="
                            font-size: 15px; font-weight: 700;
                            color: #1a1a1a; line-height: 1.4; word-break: break-word;
                        ">${name}</span>

                        ${type === 'xfer' ? `
                        <span style="
                            font-size: 9px; font-weight: 800;
                            background: #2C2C2A; color: white;
                            padding: 1px 6px; border-radius: 4px;
                            letter-spacing: 0.08em; flex-shrink: 0;
                        ">TRANSFER</span>` : ''}
                    </div>

                    <!-- Seg badge（原邏輯保留） -->
                    <div style="margin-top: 4px;">
                        <span style="
                            font-size: 9px; font-weight: 800; font-style: italic;
                            color: #888780; background: #F1EFE8;
                            padding: 1px 6px; border-radius: 4px;
                            letter-spacing: 0.03em;
                        ">S${seg}</span>
                    </div>

                    ${noteHtml}
                </div>
            </div>`;
    }).join('');
},


_renderShoppingFuelCards(item, dayIndex, itemIndex) {
    let products = [];
    const tripId = state.activeTripId;

    try {
        products = JSON.parse(item.memo || "[]");
    } catch (e) {
        return `<p style="font-size: 10px; color: #E24B4A; font-style: italic; padding: 16px 8px;">⚠️ 數據燃料損毀</p>`;
    }

    const nodeTotal = products.reduce((sum, p) => sum + (Number(p.price) || 0) * (Number(p.quantity) || 1), 0);

    return `
        <div class="mt-3 animate-fade-in">
            <!-- 標頭：購物清單 + 總計 -->
            <div style="
                display: flex; justify-content: space-between; align-items: center;
                padding-bottom: 10px; margin-bottom: 4px;
                border-bottom: 0.5px solid #E2E8F0;
            ">
                <span style="font-size: 11px; font-weight: 700; color: #5F5E5A; letter-spacing: 0.04em;">購物清單</span>
                <div style="display: flex; align-items: baseline; gap: 3px;">
                    <span style="font-size: 10px; font-weight: 700; color: #B4B2A9;">¥</span>
                    <span style="font-size: 16px; font-weight: 800; color: #D4537E; font-variant-numeric: tabular-nums; line-height: 1;">${nodeTotal.toLocaleString()}</span>
                </div>
            </div>

            <div>
                ${products.map((p, pIdx) => {
                    const isChecked = p.checked === true;
                    const searchAnchor = encodeURIComponent(`${p.store} ${p.name} ${item.location || ''} Japan`);
                    const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${searchAnchor}`;
                    const imgSearchQuery = encodeURIComponent(p.image_query || `${p.store} ${p.name}`);
                    const googleImageUrl = `https://www.google.com/search?tbm=isch&q=${imgSearchQuery}`;

                    return `
                    <div style="
                        padding: 14px 0;
                        ${pIdx > 0 ? 'border-top: 0.5px solid #E2E8F0;' : ''}
                        transition: opacity 0.3s;
                        opacity: ${isChecked ? '0.4' : '1'};
                    ">
                        <!-- 第一行：勾選 + 名稱 + 價格數量 -->
                        <div style="display: flex; align-items: flex-start; gap: 10px;">
                            <div onclick="App.toggleShoppingCheck('${tripId}', ${dayIndex}, ${itemIndex}, ${pIdx})"
                                 style="
                                     width: 18px; height: 18px; flex-shrink: 0;
                                     border-radius: 5px; cursor: pointer;
                                     display: flex; align-items: center; justify-content: center;
                                     margin-top: 2px; transition: all 0.2s;
                                     ${isChecked
                                         ? 'background: #D4537E; border: 2px solid #D4537E;'
                                         : 'background: white; border: 2px solid #D3D1C7;'}
                                 ">
                                ${isChecked ? '<svg style="width:10px;height:10px;color:white;" fill="none" stroke="white" viewBox="0 0 24 24" stroke-width="4"><path d="M5 13l4 4L19 7"></path></svg>' : ''}
                            </div>

                            <div style="flex: 1; min-width: 0;">
                                <a href="${googleImageUrl}" target="_blank" style="text-decoration: none;">
                                    <span style="
                                        font-size: 13px; font-weight: 700;
                                        color: #1a1a1a; display: block;
                                        line-height: 1.4; word-break: break-all;
                                        ${isChecked ? 'text-decoration: line-through; color: #B4B2A9;' : ''}
                                    ">${p.name}</span>
                                </a>
                                ${p.name_jp ? `
                                <div style="font-size: 10px; color: #888780; margin-top: 3px; line-height: 1.4; word-break: break-all;">
                                    ${p.name_jp}
                                </div>` : ''}
                            </div>

                            <div style="flex-shrink: 0; text-align: right; padding-left: 8px;">
                                <span style="
                                    font-size: 13px; font-weight: 800;
                                    color: #D4537E; display: block;
                                    font-variant-numeric: tabular-nums;
                                ">¥${(Number(p.price) || 0).toLocaleString()}</span>
                                <span style="font-size: 10px; color: #888780; display: block; margin-top: 2px;">
                                    × ${p.quantity || 1}${isChecked ? ' · 已購入' : ''}
                                </span>
                            </div>
                        </div>

                        <!-- 第二行：商店導航 -->
                        ${!isChecked && p.store ? `
                        <div style="margin-top: 8px; margin-left: 28px;">
                            <a href="${googleMapsUrl}" target="_blank"
                               style="
                                   display: inline-flex; align-items: center; gap: 6px;
                                   font-size: 11px; font-weight: 600;
                                   color: #D4537E; background: #FBEAF0;
                                   border: 0.5px solid #F4C0D1;
                                   padding: 4px 10px; border-radius: 6px;
                                   text-decoration: none; max-width: 100%; overflow: hidden;
                                   transition: all 0.2s;
                               ">
                                <i class="fa-solid fa-location-dot" style="font-size: 10px; flex-shrink: 0;"></i>
                                <span style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${p.store}</span>
                            </a>
                        </div>` : ''}

                        <!-- 第三行：購買提示 -->
                        ${!isChecked && p.info ? `
                        <details style="margin-top: 6px; margin-left: 28px;">
                            <summary style="
                                list-style: none; cursor: pointer; user-select: none;
                                display: inline-flex; align-items: center; gap: 5px;
                            ">
                                <span style="
                                    display: inline-flex; align-items: center; justify-content: center;
                                    width: 16px; height: 16px; border-radius: 50%;
                                    background: #F1EFE8; color: #888780; font-size: 8px;
                                "><i class="fa-solid fa-chevron-down"></i></span>
                                <span style="
                                    font-size: 11px; font-weight: 700; color: #5F5E5A;
                                    letter-spacing: 0.04em;
                                ">購買提示</span>
                            </summary>
                            <div style="
                                margin-top: 8px;
                                background: #FFFBEB;
                                border-left: 3px solid #F59E0B;
                                border-radius: 0 8px 8px 0;
                                padding: 10px 12px 10px 36px;
                                position: relative;
                            ">
                                <i class="fa-solid fa-circle-info" style="
                                    position: absolute; left: 12px; top: 12px;
                                    font-size: 12px; color: #D97706;
                                "></i>
                                <p style="
                                    font-size: 13px; font-weight: 500;
                                    color: #451A03; line-height: 1.7; margin: 0;
                                    word-break: break-word;
                                ">${p.info}</p>
                            </div>
                        </details>` : ''}

                    </div>`;
                }).join('')}
            </div>
        </div>`;
},

// ============================================================
// Backlog 相關渲染引擎
// ============================================================


renderBacklogPage(container, backlogs) {
    if (!state.backlogContext) state.backlogContext = { page: 1, searchQuery: '' };
    
    // 🚀 確保 perPage 跟當前模式同步（防止重新整理後跑掉）
    const viewMode = localStorage.getItem('tf_backlog_view_mode') || 'card';
    state.backlogContext.perPage = viewMode === 'compact' ? 20 : 5;

    const { pagedItems, totalPages, currentPage, totalItems } = App.getFilteredBacklogs(backlogs);

    const searchInputEl = document.getElementById('backlog-search-input');
    const isSearchFocused = document.activeElement === searchInputEl;
    const cursorStart = searchInputEl ? searchInputEl.selectionStart : 0;
    const cities = [...new Set(backlogs.map(b => b.city))].sort();
    const activeCity = localStorage.getItem('tf_backlog_city_focus') || '全部';
    const activeCat = localStorage.getItem('tf_backlog_cat_focus') || '全部';

    // 🚀 模式切換按鈕
    const viewToggleHtml = `
        <div style="display: flex; gap: 4px; background: #F1F5F9; border-radius: 10px; padding: 3px;">
            <button onclick="viewEngine.setBacklogViewMode('card')"
                    style="padding: 5px 10px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s;
                           background: ${viewMode === 'card' ? 'white' : 'transparent'};
                           box-shadow: ${viewMode === 'card' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};">
                <i class="fa-solid fa-table-cells-large" style="font-size: 13px; color: ${viewMode === 'card' ? '#D4537E' : '#94A3B8'};"></i>
            </button>
            <button onclick="viewEngine.setBacklogViewMode('compact')"
                    style="padding: 5px 10px; border-radius: 8px; border: none; cursor: pointer; transition: all 0.15s;
                           background: ${viewMode === 'compact' ? 'white' : 'transparent'};
                           box-shadow: ${viewMode === 'compact' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none'};">
                <i class="fa-solid fa-list" style="font-size: 13px; color: ${viewMode === 'compact' ? '#D4537E' : '#94A3B8'};"></i>
            </button>
        </div>`;

    container.innerHTML = `
        <div class="px-2 pt-4 pb-32 animate-fade-in space-y-6">
            ${this._renderBacklogHeader(viewToggleHtml)}

            <div class="px-2">
                <div class="relative group">
                    <input type="text" id="backlog-search-input"
                           oninput="App.searchBacklog(this.value)"
                           value="${state.backlogContext.searchQuery}"
                           placeholder="搜尋靈感標題..."
                           class="w-full bg-slate-50 border-none rounded-2xl py-4 pl-12 pr-4 text-[14px] font-black text-slate-900 focus:ring-2 focus:ring-pink-100 outline-none shadow-inner transition-all">
                    <span class="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 text-lg">🔍</span>
                </div>
            </div>

            ${this._renderBacklogNav(cities, activeCity, activeCat)}

            <!-- 🚀 全選按鈕 -->

            ${this._renderBacklogSelectAll(pagedItems, totalItems)}

            ${this._renderBacklogPagination(currentPage, totalPages, totalItems, 'top')}

            <div id="backlog-cards-sector" class="${viewMode === 'compact' ? 'space-y-1' : 'space-y-4'} min-h-[300px]">
                ${pagedItems.length > 0
                    ? pagedItems.map(item => viewMode === 'compact'
                        ? this._renderBacklogCardCompact(item)
                        : this._renderBacklogCard(item)
                    ).join('')
                    : `<div class="py-20 text-center opacity-30 text-[10px] font-black uppercase tracking-[0.3em]">No Cargo in this sector</div>`}
            </div>

            ${this._renderBacklogPagination(currentPage, totalPages, totalItems, 'bottom')}
        </div>
        ${this._renderBacklogFAB()}
    `;

    requestAnimationFrame(() => {
        const newSearchInput = document.getElementById('backlog-search-input');
        if (newSearchInput && isSearchFocused) {
            newSearchInput.focus();
            newSearchInput.setSelectionRange(cursorStart, cursorStart);
        }
        if (typeof this.updateRefineryFAB === 'function') {
            this.updateRefineryFAB();
        }
    });
},

_renderBacklogSelectAll(pagedItems, totalItems) {
    const manager = window.backlogManager || (typeof backlogManager !== 'undefined' ? backlogManager : null);
    const stagedSize = manager?._stagedSelection?.size || 0;
    const allPagedSelected = pagedItems.length > 0 && pagedItems.every(item => manager?._stagedSelection?.has(String(item.id)));

    return `
        <div style="display: flex; align-items: center; justify-content: space-between; padding: 0 4px; min-height: 36px;">

            <!-- 左側：全選按鈕 -->
            <button onclick="viewEngine._toggleSelectAllPage()"
                    style="display: flex; align-items: center; gap: 6px; padding: 6px 14px;
                           border-radius: 999px; border: 1px solid ${allPagedSelected ? '#F4C0D1' : '#E2E8F0'};
                           background: ${allPagedSelected ? '#FBEAF0' : '#F8FAFC'};
                           cursor: pointer; transition: all 0.15s;">
                <i class="fa-${allPagedSelected ? 'solid' : 'regular'} fa-circle-check"
                   style="font-size: 13px; color: ${allPagedSelected ? '#D4537E' : '#94A3B8'};"></i>
                <span style="font-size: 12px; font-weight: 500; color: ${allPagedSelected ? '#D4537E' : '#64748B'};">
                    ${allPagedSelected ? '取消全選' : '全選本頁'}
                </span>
            </button>

            <!-- 右側：動態區 -->
            <div style="display: flex; align-items: center; gap: 6px;">

                <!-- 已選數量（有選取才顯示）-->
                <span id="select-bar-count" style="font-size: 11px; color: #94A3B8;">
                    ${stagedSize > 0 ? `已選 <strong style="color: #D4537E;">${stagedSize}</strong> 張` : ''}
                </span>

                <!-- 操作按鈕（有選取才顯示）-->
                <div id="select-bar-actions" style="display: ${stagedSize > 0 ? 'flex' : 'none'}; align-items: center; gap: 6px;">
                    <button onclick="window.backlogManager?.clearSelection(); viewEngine.updateRefineryFAB();"
                            style="padding: 6px 12px; border-radius: 999px; border: 1px solid #E2E8F0;
                                   background: #F8FAFC; cursor: pointer; font-size: 11px; font-weight: 500; color: #64748B;">
                        清除
                    </button>
                    <button onclick="viewEngine.triggerProjection()"
                            style="padding: 6px 12px; border-radius: 999px; border: none;
                                   background: #1E293B; color: white; cursor: pointer;
                                   font-size: 11px; font-weight: 500;">
                        <i class="ti ti-calendar-plus" style="font-size: 12px; margin-right: 3px;"></i>排入
                    </button>
                    <button onclick="viewEngine.triggerAIPlanner()"
                            style="padding: 6px 12px; border-radius: 999px; border: none;
                                   background: #D4537E; color: white; cursor: pointer;
                                   font-size: 11px; font-weight: 500;">
                        <i class="ti ti-sparkles" style="font-size: 12px; margin-right: 3px;"></i>AI
                    </button>
                </div>

                <!-- 未選時提示 -->
                <span id="select-bar-hint" style="font-size: 11px; color: #CBD5E1; display: ${stagedSize > 0 ? 'none' : 'block'};">
                    點選卡片可多選
                </span>

            </div>
        </div>`;
},

_toggleSelectAllPage() {
    const manager = window.backlogManager || (typeof backlogManager !== 'undefined' ? backlogManager : null);
    if (!manager) return;

    // 從當前渲染的卡片抓 ID
    const pagedCards = [...document.querySelectorAll('.backlog-card[data-id]')];
    const allSelected = pagedCards.every(card => manager._stagedSelection.has(card.dataset.id));

    pagedCards.forEach(card => {
        const id = card.dataset.id;
        if (allSelected) {
            // 取消全選
            manager.toggleSelection(id, false);
            card.classList.remove('selected');
            card.style.border = '1px solid #E2E8F0';
            card.style.background = 'white';
            card.style.boxShadow = 'none';
            card.style.transform = 'translateY(0)';
        } else {
            // 全選
            manager.toggleSelection(id, true);
            card.classList.add('selected');
            card.style.border = '2px solid #D4537E';
            card.style.background = '#FBEAF0';
            card.style.boxShadow = '0 4px 16px rgba(212,83,126,0.2)';
            card.style.transform = 'translateY(-2px)';
        }
    });

    // 重新渲染全選按鈕狀態
    if (window.App) App.navigateTo('backlog');
},

// 🚀 模式切換並重新渲染
setBacklogViewMode(mode) {
    localStorage.setItem('tf_backlog_view_mode', mode);

    if (!state.backlogContext) state.backlogContext = { page: 1, searchQuery: '' };
    state.backlogContext.perPage = mode === 'compact' ? 20 : 5; // 🚀 直接覆蓋 state
    state.backlogContext.page = 1;

    if (window.App) App.navigateTo('backlog');
},


_renderBacklogCardCompact(item) {
    const manager = window.backlogManager || (typeof backlogManager !== 'undefined' ? backlogManager : null);
    const isStaged = manager?._stagedSelection?.has(String(item.id)) || false;
    const projectedDays = this._calculateProjectedDays(item.name) || [];

    const catColors = {
        '食': { bg: '#FBEAF0', color: '#D4537E' },
        '玩': { bg: '#E6F1FB', color: '#185FA5' },
        '購': { bg: '#EAF3DE', color: '#3B6D11' },
        '行': { bg: '#FAEEDA', color: '#854F0B' },
        '住': { bg: '#F1EFE8', color: '#5F5E5A' },
        '醫': { bg: '#FCEBEB', color: '#A32D2D' },
        '史': { bg: '#F1EFE8', color: '#5F5E5A' },
        '景': { bg: '#EAF3DE', color: '#3B6D11' },
        '泉': { bg: '#E6F1FB', color: '#185FA5' },
    };
    const cat = item.category || '食';
    const style = catColors[cat] || { bg: '#F1EFE8', color: '#5F5E5A' };

    const dayTags = projectedDays.map(d =>
        `<span style="font-size: 10px; color: #D4537E; background: #FBEAF0;
                      padding: 1px 5px; border-radius: 4px; font-weight: 500; flex-shrink: 0;">D${d}</span>`
    ).join('');

    return `
        <div class="backlog-card ${isStaged ? 'selected' : ''}"
             id="card-${item.id}"
             data-id="${item.id}"
             onclick="viewEngine.toggleBacklogSelect('${item.id}')"
             style="display: flex; align-items: center; gap: 8px; padding: 8px 12px;
                    border-radius: 10px; border: 1px solid ${isStaged ? '#F4C0D1' : '#E2E8F0'};
                    background: ${isStaged ? '#FBEAF0' : 'white'};
                    cursor: pointer; transition: all 0.15s;">

            <input type="checkbox" class="sub-item-check hidden" id="check-${item.id}"
                   value="${item.id}" ${isStaged ? 'checked' : ''}>

            <!-- 分類標籤 -->
            <span style="font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 6px;
                         background: ${style.bg}; color: ${style.color}; flex-shrink: 0;">
                ${cat}
            </span>

            <!-- 城市 -->
            <span style="font-size: 11px; color: #94A3B8; flex-shrink: 0; min-width: 32px;">
                ${item.city || '—'}
            </span>

            <!-- 名稱 -->
            <p style="font-size: 13px; font-weight: 600; color: #1E293B; margin: 0;
                      flex: 1; min-width: 0; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${item.name}
            </p>

            <!-- Day 標籤 -->
            <div style="display: flex; gap: 3px; flex-shrink: 0;">
                ${dayTags}
            </div>

        </div>`;
},

/** 📑 [Sub-Component] 渲染分頁指示器 (雙向對稱佈署版) */
_renderBacklogPagination(current, total, totalItems, position) {
    if (total <= 1) return ''; 
    
    // 🚀 針對不同物理位置微調邊距語彙
    // 上端分頁使用較緊湊的 mb-2；下端分頁維持標準分隔線
    const marginClass = position === 'top' ? 'mb-2' : 'mt-10 pt-6 border-t border-slate-50';

    return `
        <div class="flex flex-col items-center gap-4 ${marginClass} animate-fade-in">
            <div class="flex items-center gap-3">
                <button onclick="App.setBacklogPage(${current - 1})" ${current === 1 ? 'disabled' : ''}
                        class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-lg text-slate-400 disabled:opacity-10 active:scale-90 transition-all">‹</button>
                
                <div class="flex gap-2 px-1 items-center">
                    ${Array.from({length: total}, (_, i) => i + 1).map(p => `
                        <button onclick="App.setBacklogPage(${p})" 
                                class="h-1.5 rounded-full transition-all duration-500 ${p === current ? 'theme-bg w-6 shadow-lg shadow-pink-100' : 'bg-slate-200 w-1.5'}"></button>
                    `).join('')}
                </div>

                <button onclick="App.setBacklogPage(${current + 1})" ${current === total ? 'disabled' : ''}
                        class="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center text-lg text-slate-400 disabled:opacity-10 active:scale-90 transition-all">›</button>
            </div>
            ${position === 'bottom' ? `<p class="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] italic">Sector Page ${current} of ${total}</p>` : ''}
        </div>
    `;
},


/** 🧪 [Sub-Component] 渲染精煉廠頭部 */
_renderBacklogHeader(viewToggleHtml = '') {
    const manager = window.backlogManager || (typeof backlogManager !== 'undefined' ? backlogManager : null);
    const selectionSize = manager?._stagedSelection?.size || 0;
    const totalItems = manager?.items?.length || 0;

    // 🚀 草稿改從全域讀取
    const hasDraft = (App._getDrafts?.() || []).length > 0;

    return `
        <div class="px-2 pt-2 pb-2 animate-fade-in">
            <div class="flex justify-between items-center">
                <div>
                    <h2 class="text-[18px] font-black text-slate-800 tracking-tight">靈感清單</h2>
                    <p id="backlog-header-subtitle" class="text-[11px] text-slate-400 mt-0.5">${totalItems} 筆</p>
                </div>
                <div class="flex items-center gap-2">

                    <!-- 🚀 顯示模式切換 -->
                    ${viewToggleHtml}

                    <!-- 更多選單 -->
                    <button id="btn-more-menu"
                            onclick="viewEngine.toggleBacklogMoreMenu()"
                            class="flex items-center gap-1.5 px-3 py-2 rounded-full bg-slate-100 active:scale-95 transition-all"
                            aria-label="更多選項">
                        <i class="ti ti-dots" style="font-size: 15px; color: #64748B;" aria-hidden="true"></i>
                        <span style="font-size: 12px; color: #64748B; font-weight: 500;">更多</span>
                    </button>

                    <!-- 新增 -->
                    <button onclick="App.modalCreate('add-backlog-modal', '新增靈感', viewEngine._renderAddBacklogForm(), viewEngine._renderAddBacklogActions())"
                            class="flex items-center gap-1.5 px-3 py-2 theme-bg text-white rounded-full shadow-lg shadow-pink-100 active:scale-95 transition-all"
                            aria-label="新增靈感">
                        <i class="ti ti-plus" style="font-size: 15px;" aria-hidden="true"></i>
                        <span style="font-size: 12px; font-weight: 500;">新增</span>
                    </button>

                    <!-- 隱藏的相容性節點 -->
                    <span id="selection-badge-count" class="hidden">${selectionSize}</span>
                    <button id="btn-select-mode" class="hidden"></button>
                    <button id="btn-selection-manager" class="hidden" onclick="App.openSelectionManager()"></button>

                </div>
            </div>
        </div>

        <div id="backlog-more-menu"
             class="hidden fixed z-[9999] bg-white rounded-2xl border border-slate-100 shadow-2xl overflow-hidden animate-fade-in"
             style="min-width: 280px; right: 16px; top: 80px;">

            <div style="padding: 6px;">

                <button onclick="viewEngine.closeBacklogMoreMenu(); App.modalCreate('ai-recon-modal', 'AI 靈感搜尋', viewEngine._renderReconForm(), viewEngine._renderReconActions())"
                        class="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: #FBEAF0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="ti ti-sparkles" style="font-size: 20px; color: #D4537E;" aria-hidden="true"></i>
                    </div>
                    <div style="text-align: left;">
                        <p style="font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin: 0;">AI 靈感搜尋</p>
                        <p style="font-size: 12px; color: var(--color-text-tertiary); margin: 3px 0 0;">依地點偏好生成搜尋指令</p>
                    </div>
                </button>

                <div style="height: 0.5px; background: var(--color-border-tertiary); margin: 2px 8px;"></div>

                <button onclick="viewEngine.closeBacklogMoreMenu(); App.openAIPlannerDraft()"
                        class="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: ${hasDraft ? '#FBEAF0' : '#F1EFE8'}; display: flex; align-items: center; justify-content: center; flex-shrink: 0; position: relative;">
                        <i class="ti ti-calendar-event" style="font-size: 20px; color: ${hasDraft ? '#D4537E' : '#888780'};" aria-hidden="true"></i>
                        ${hasDraft ? `<span style="position: absolute; top: -3px; right: -3px; width: 10px; height: 10px; border-radius: 50%; background: #D4537E; border: 2px solid white;"></span>` : ''}
                    </div>
                    <div style="text-align: left;">
                        <p style="font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin: 0;">草稿行程</p>
                        <p style="font-size: 12px; color: var(--color-text-tertiary); margin: 3px 0 0;">${hasDraft ? 'AI 已預排草稿，點擊查看' : '尚無草稿，選取小卡後 AI 規劃'}</p>
                    </div>
                </button>

                <div style="height: 0.5px; background: var(--color-border-tertiary); margin: 2px 8px;"></div>

                <button onclick="viewEngine.closeBacklogMoreMenu(); App.modalCreate('backlog-export-modal', '匯出靈感', viewEngine._renderExportSelector(), viewEngine._renderExportActions())"
                        class="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: #E6F1FB; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="ti ti-upload" style="font-size: 20px; color: #185FA5;" aria-hidden="true"></i>
                    </div>
                    <div style="text-align: left;">
                        <p style="font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin: 0;">匯出靈感</p>
                        <p style="font-size: 12px; color: var(--color-text-tertiary); margin: 3px 0 0;">將選取的靈感複製為 JSON</p>
                    </div>
                </button>

                <div style="height: 0.5px; background: var(--color-border-tertiary); margin: 2px 8px;"></div>

                <button onclick="viewEngine.closeBacklogMoreMenu(); App.modalCreate('backlog-import-modal', '匯入靈感', viewEngine._renderImportForm(), viewEngine._renderImportActions())"
                        class="w-full flex items-center gap-3 px-4 py-4 rounded-xl hover:bg-slate-50 active:bg-slate-100 transition-all">
                    <div style="width: 40px; height: 40px; border-radius: 12px; background: #EAF3DE; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <i class="ti ti-download" style="font-size: 20px; color: #3B6D11;" aria-hidden="true"></i>
                    </div>
                    <div style="text-align: left;">
                        <p style="font-size: 14px; font-weight: 500; color: var(--color-text-primary); margin: 0;">匯入靈感</p>
                        <p style="font-size: 12px; color: var(--color-text-tertiary); margin: 3px 0 0;">貼入夥伴分享的 JSON 清單</p>
                    </div>
                </button>

            </div>
        </div>

        <div id="backlog-more-overlay"
             class="hidden fixed inset-0 z-[9998]"
             onclick="viewEngine.closeBacklogMoreMenu()">
        </div>`;
},


/** 🤖 AI 草稿列表渲染 */
_renderAIPlannerDraftList(drafts) {
    if (!drafts || drafts.length === 0) {
        return `<div style="text-align: center; padding: 40px 0; color: var(--color-text-tertiary); font-size: 13px;">尚無草稿</div>`;
    }

    const colors = ['#D4537E', '#378ADD', '#3B6D11', '#854F0B', '#185FA5'];

    return drafts.map((draft, idx) => {
        const color = colors[idx % colors.length];
        const bgColor = idx % 5 === 0 ? '#FBEAF0' : idx % 5 === 1 ? '#E6F1FB' : '#EAF3DE';
        const textColor = color;

        const diff = Date.now() - draft.createdAt;
        const mins = Math.floor(diff / 60000);
        const hrs = Math.floor(diff / 3600000);
        const timeStr = mins < 1 ? '剛剛'
            : mins < 60 ? `${mins} 分鐘前`
            : hrs < 24 ? `${hrs} 小時前`
            : `${Math.floor(hrs / 24)} 天前`;

        const days = draft.result?.days || [];
        const cardCount = draft.selectedCards?.length || 0;
        const unscheduled = draft.result?.unscheduled?.length || 0;

// 前兩天有景點的天
        const activeDays = days.filter(d => d.cards?.length > 0).slice(0, 2);
        const remainingDays = days.filter(d => d.cards?.length > 0).length - activeDays.length;

        // 🚀 用全域 backlog 補強小卡名稱
        const globalItems = window.backlogManager?.items || [];
        const cardMap = Object.fromEntries(globalItems.map(g => [String(g.id), g]));

        const catColors = {
            '食': { bg: '#FBEAF0', border: '#F4C0D1', text: '#D4537E' },
            '玩': { bg: '#E6F1FB', border: '#B8D4F0', text: '#185FA5' },
            '購': { bg: '#EAF3DE', border: '#B8D9A0', text: '#3B6D11' },
            '行': { bg: '#FAEEDA', border: '#F0C990', text: '#854F0B' },
            '住': { bg: '#F1EFE8', border: '#D4CFBF', text: '#5F5E5A' },
            '醫': { bg: '#FCEBEB', border: '#F0B8B8', text: '#A32D2D' },
            '史': { bg: '#F1EFE8', border: '#D4CFBF', text: '#5F5E5A' },
            '景': { bg: '#EAF3DE', border: '#B8D9A0', text: '#3B6D11' },
            '泉': { bg: '#E6F1FB', border: '#B8D4F0', text: '#185FA5' },
        };

        return `
            <div style="background: var(--color-background-primary); border-radius: 16px;
                        border: 0.5px solid var(--color-border-tertiary); margin-bottom: 10px;
                        overflow: hidden; cursor: pointer; transition: all 0.15s;"
                 onclick="App.openAIPlannerDraftDetail('${draft.id}')">
                <div style="display: flex; align-items: stretch;">

                    <!-- 左側彩色條 -->
                    <div style="width: 4px; background: ${color}; flex-shrink: 0;"></div>

                    <!-- 主要內容 -->
                    <div style="padding: 12px 14px; flex: 1; min-width: 0;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 4px;">
                            <p style="font-size: 14px; font-weight: 700; color: var(--color-text-primary); margin: 0;
                                      white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">
                                ${draft.title || 'AI 草稿'}
                            </p>
                            <span style="font-size: 11px; color: var(--color-text-tertiary); flex-shrink: 0; margin-left: 8px;">
                                ${timeStr}
                            </span>
                        </div>
                        <p style="font-size: 11px; color: var(--color-text-secondary); margin: 0 0 8px;">
                            ${cardCount} 張小卡 · ${days.length} 天規劃${unscheduled > 0 ? ` · ${unscheduled} 張未排入` : ''}
                        </p>
                        <div style="display: flex; gap: 4px; flex-wrap: wrap;">
                            ${activeDays.map(d => {
                                // 🚀 每天的小卡標籤
                                const dayCards = (d.cards || []).map(cardEntry => {
                                    const cardId = typeof cardEntry === 'object' ? cardEntry.id : cardEntry;
                                    // 先從全域找，找不到再從草稿快照找
                                    const card = cardMap[String(cardId)]
                                        || (draft.selectedCards || []).find(s => String(s.id) === String(cardId));
                                    if (!card) return '';
                                    const style = catColors[card.category] || { bg: '#F1EFE8', border: '#D4CFBF', text: '#5F5E5A' };
                                    return `<span style="font-size: 11px; background: ${style.bg};
                                                         color: ${style.text}; border: 1px solid ${style.border};
                                                         padding: 2px 8px; border-radius: 6px; font-weight: 500;">
                                                ${card.name}
                                            </span>`;
                                }).join('');
                                return dayCards;
                            }).join('')}
                            ${remainingDays > 0 ? `
                                <span style="font-size: 11px; background: var(--color-background-secondary);
                                             color: var(--color-text-tertiary); padding: 2px 8px; border-radius: 6px;">
                                    +${remainingDays} 天
                                </span>` : ''}
                        </div>
                    </div>

                    <!-- 右側按鈕 -->
                    <div style="display: flex; flex-direction: column; justify-content: center; gap: 4px;
                                padding: 8px 10px; border-left: 0.5px solid var(--color-border-tertiary); flex-shrink: 0;"
                         onclick="event.stopPropagation()">
                        <button onclick="App.openAIPlannerDraftDetail('${draft.id}')"
                                style="width: 28px; height: 28px; border-radius: 8px; background: var(--color-background-secondary);
                                       border: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center;
                                       justify-content: center; cursor: pointer;"
                                aria-label="查看">
                            <i class="fa-solid fa-eye" style="font-size: 12px; color: var(--color-text-secondary);"></i>
                        </button>
                        <button onclick="App._deleteAIPlannerDraft('${draft.id}')"
                                style="width: 28px; height: 28px; border-radius: 8px; background: var(--color-background-secondary);
                                       border: 0.5px solid var(--color-border-tertiary); display: flex; align-items: center;
                                       justify-content: center; cursor: pointer;"
                                aria-label="刪除">
                            <i class="fa-solid fa-trash-can" style="font-size: 12px; color: var(--color-text-secondary);"></i>
                        </button>
                    </div>

                </div>
            </div>`;
    }).join('');
},

/** 🧬 [Refinery-Manager] 渲染選取管理清單 (V2026.ULTRA 極簡即時導通版) */
_renderSelectionManagerContent() {
    // 🚀 1. 真值源定位
    const manager = window.backlogManager || (typeof backlogManager !== 'undefined' ? backlogManager : null);
    
    if (!manager) {
        console.error("🚨 [Manager-Offline] 精煉廠主控模組未導通");
        return `<div class="py-20 text-center text-rose-500 font-black text-xs uppercase tracking-widest">Module Disconnected</div>`;
    }

    // 🚀 2. 數據提領與過濾
    const allBacklogs = (manager.items && manager.items.length > 0) ? manager.items : (window.state?.backlogs || []);
    const stagedSet = manager._stagedSelection; // 觸發 Getter 回溯
    const selectedIds = Array.from(stagedSet || []).map(id => String(id));
    const items = allBacklogs.filter(b => selectedIds.includes(String(b.id)));

    console.log(`📡 [Manager-Focus] 掃帚數字校準: ${selectedIds.length} | 磁區在庫: ${allBacklogs.length}`);

    // 🛡️ 數據真空保護 (空狀態視覺)
    if (items.length === 0) {
        return `
            <div class="py-24 text-center animate-fade-in">
                <div class="text-4xl mb-4 grayscale opacity-20">🧹</div>
                <p class="text-slate-300 font-black text-[10px] uppercase tracking-[0.3em]">Vacuum Storage</p>
                <p class="text-slate-400 text-[9px] mt-2 italic">選取磁區已排空</p>
            </div>`;
    }

    return `
    <div class="space-y-4 text-left pb-4 animate-fade-in">
        <div class="px-1 mb-4">
            <button onclick="backlogManager.clearSelection()" 
                    class="w-full py-4 bg-rose-50 text-rose-500 rounded-2xl text-[10px] font-black uppercase tracking-[0.3em] active:scale-95 transition-all shadow-sm border border-rose-100/50 hover:bg-rose-100">
                一鍵清空磁區 (Clear All)
            </button>
        </div>

        <div class="max-h-[45vh] overflow-y-auto pr-1 space-y-2 custom-scrollbar" id="manager-items-track">
            ${items.map(item => `
                <div class="flex items-center gap-4 p-5 bg-white rounded-[2rem] border border-slate-100 group shadow-sm hover:border-pink-200 transition-all">
                    <label class="relative flex items-center cursor-pointer">
                        <input type="checkbox" checked class="hidden peer manager-item-check" value="${item.id}" 
                               onchange="backlogManager.toggleSelection('${item.id}', this.checked); App.openSelectionManager();">
                        <div class="w-7 h-7 rounded-xl border-2 border-slate-200 bg-white peer-checked:theme-bg peer-checked:border-transparent transition-all flex items-center justify-center">
                            <i class="fa-solid fa-check text-white text-xs opacity-0 peer-checked:opacity-100"></i>
                        </div>
                    </label>
                    <div class="flex-1 min-w-0">
                        <p class="text-[14px] font-black text-slate-800 truncate">${item.name || '未命名靈感'}</p>
                        <div class="flex items-center gap-2 mt-1">
                            <span class="text-[9px] font-black theme-text-pink px-2 py-0.5 bg-pink-50 rounded-md uppercase italic">${item.category || '食'}</span>
                            <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">📍 ${item.city || '未知區域'}</p>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    </div>`;
},


_renderSelectionManagerActions() {
    return `<button onclick="App.modalRemove('selection-manager-modal')" class="w-full py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">完成管理</button>`;
},

_renderExportSelector() {
    const manager = window.backlogManager || (typeof backlogManager !== 'undefined' ? backlogManager : null);
    const ids = manager ? [...manager._stagedSelection] : [];
    
    return `
    <div class="space-y-6 text-left pb-4">
        <p class="text-[11px] font-bold text-slate-500 px-1 leading-relaxed">
            系統將封裝您在列表中「勾選選中」的項目為 JSON 格式，方便與夥伴分享。
        </p>
        <div class="p-5 bg-slate-50 rounded-[2rem] border border-slate-100">
            <div class="flex justify-between items-center">
                <span class="text-[10px] font-black text-slate-400 uppercase tracking-widest">待匯出總量</span>
                <span class="text-sm font-black theme-text-pink tabular-nums">${ids.length} 筆靈感</span>
            </div>
        </div>
        ${ids.length === 0 ? `<p class="text-[10px] text-rose-400 text-center italic">※ 請先在靈感列表勾選欲匯出的卡片</p>` : ''}
    </div>`;
},

_renderExportActions() {
    return `
        <button onclick="App.modalRemove('backlog-export-modal')" class="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
        <button onclick="backlogManager.exportTargetBacklogs([...backlogManager._stagedSelection])" 
                class="flex-[2] py-4 theme-bg text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">
            複製 JSON 並關閉
        </button>`;
},

/** 🧬 [Import-Form] 匯入表單介面 */
_renderImportForm() {
    return `
    <div class="space-y-4 text-left pb-4">
        <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">注入 JSON 燃料包</label>
        <textarea id="import-json-payload" 
                  class="w-full h-64 bg-slate-50/80 border-none rounded-[2rem] p-6 text-[11px] font-mono text-slate-700 outline-none shadow-inner custom-scrollbar focus:ring-2 focus:ring-pink-100 transition-all" 
                  placeholder="在此貼上夥伴分享的 JSON 陣列數據..."></textarea>
    </div>`;
},

_renderImportActions() {
    return `
        <button onclick="App.modalRemove('backlog-import-modal')" class="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">取消</button>
        <button onclick="backlogManager.importBacklogFuel()" 
                class="flex-[2] py-4 bg-slate-800 text-white rounded-2xl font-black text-xs shadow-lg active:scale-95 transition-all">
            解析並儲存靈感
        </button>`;
},


_renderReconForm() {
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    const activeCity = activeTrip?.city || "日本";

    return `
    <div style="display: flex; flex-direction: column; gap: 18px; padding-bottom: 8px;">

        <!-- 1. 起始基準點 -->
        <div>
            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">起始基準點</p>
            <input type="text" id="recon-base"
                   placeholder="例如：新風館 / 京都車站 / 烏丸御池站 6 號出口"
                   style="width: 100%; padding: 14px 16px; border-radius: 12px;
                          border: 1.5px solid #E2E8F0; background: #F1F5F9;
                          font-size: 15px; color: var(--color-text-primary);
                          outline: none; box-sizing: border-box;">
            <p style="font-size: 11px; color: var(--color-text-secondary); margin-top: 5px; padding-left: 2px;">
                輸入具體地標，以利執行精確半徑計算
            </p>
        </div>

        <!-- 2+3. 交通 + 時間 -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <div>
                <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">交通手段</p>
                <input type="text" id="recon-mobility"
                       placeholder="步行 / 公車"
                       style="width: 100%; padding: 14px 16px; border-radius: 12px;
                              border: 1.5px solid #E2E8F0; background: #F1F5F9;
                              font-size: 15px; color: var(--color-text-primary);
                              outline: none; box-sizing: border-box;">
            </div>
            <div>
                <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">預期時間</p>
                <input type="text" id="recon-duration"
                       placeholder="10 分鐘"
                       style="width: 100%; padding: 14px 16px; border-radius: 12px;
                              border: 1.5px solid #E2E8F0; background: #F1F5F9;
                              font-size: 15px; color: var(--color-text-primary);
                              outline: none; box-sizing: border-box;">
            </div>
        </div>

        <!-- 4. 搜尋風格 -->
        <div>
            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">搜尋風格與偏好</p>
            <input type="text" id="recon-style"
                   placeholder="例如：隱藏版甜點 / 職人咖啡"
                   style="width: 100%; padding: 14px 16px; border-radius: 12px;
                          border: 1.5px solid #E2E8F0; background: #F1F5F9;
                          font-size: 15px; color: var(--color-text-primary);
                          outline: none; box-sizing: border-box;">
        </div>

        <!-- 複製指令按鈕 -->
        <button onclick="backlogManager.copyReconPrompt()"
                style="width: 100%; padding: 14px; border-radius: 12px; border: none;
                       background: #D4537E; color: white; font-size: 15px; font-weight: 600;
                       cursor: pointer; display: flex; align-items: center;
                       justify-content: center; gap: 8px;">
            <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 14px;" aria-hidden="true"></i>
            複製 AI 偵蒐指令
        </button>

        <!-- 5. 注入 JSON -->
        <div>
            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">注入 AI 回應燃料（JSON）</p>
            <textarea id="recon-json-input" rows="6"
                      style="width: 100%; padding: 14px 16px; border-radius: 12px;
                             border: 1.5px solid #E2E8F0; background: #F1F5F9;
                             font-size: 13px; font-family: monospace;
                             color: var(--color-text-primary); outline: none;
                             box-sizing: border-box; resize: none; line-height: 1.7;"
                      placeholder="在此貼上 AI 回傳的 JSON 陣列..."></textarea>
        </div>

    </div>`;
},

_renderReconActions() {
    return `
        <button onclick="App.modalRemove('ai-recon-modal')"
                style="flex: 1; padding: 11px; border-radius: 12px;
                       border: 0.5px solid var(--color-border-tertiary);
                       background: #F1F5F9; font-size: 14px; font-weight: 500;
                       color: var(--color-text-secondary); cursor: pointer;">
            取消
        </button>
        <button onclick="backlogManager.saveReconFuel()"
                style="flex: 2; padding: 11px; border-radius: 12px; border: none;
                       background: #D4537E; color: white; font-size: 14px;
                       font-weight: 600; cursor: pointer;">
            儲存靈感
        </button>`;
},

/** 🧪 [Sub-Component] 渲染折疊式篩選器 (限額顯示版) */
_renderBacklogNav(cities, activeCity, activeCat) {
    const savedCategories = JSON.parse(localStorage.getItem('tf_backlog_categories')) || ['食', '玩', '購', '行', '住', '醫'];
    const categories = ['全部', ...savedCategories];

    const iconMap = {
        '全部': '🌈', '食': '☕', '玩': '🎡', '購': '🛍️',
        '行': '🚌', '住': '🏨', '醫': '🏥', '史': '🏯', '景': '🎑', '泉': '♨️'
    };

    const cityLabel = activeCity === '全部' ? '全部城市' : `📍 ${activeCity}`;
    const catIcon = iconMap[activeCat] || '🏷️';
    const catLabel = activeCat === '全部' ? '全部類型' : `${catIcon} ${activeCat}`;
    const hasFilter = activeCity !== '全部' || activeCat !== '全部';

    // 🚀 限額設定：預設顯示前 4 個（含「全部」）
    const CITY_LIMIT = 4;
    const CAT_LIMIT = 4;
    const allCities = ['全部', ...cities];
    const cityVisible = allCities.slice(0, CITY_LIMIT);
    const cityHidden = allCities.slice(CITY_LIMIT);
    const catVisible = categories.slice(0, CAT_LIMIT);
    const catHidden = categories.slice(CAT_LIMIT);

    const renderCityBtn = (city, hidden = false) => `
        <button id="city-tab-${city}"
                onclick="App.filterBacklogByCity('${city}'); viewEngine.updateBacklogFilterLabel();"
                class="city-filter-btn px-4 py-2 rounded-full text-[13px] font-medium transition-all active:scale-95
                       ${activeCity === city ? 'theme-bg text-white' : 'bg-slate-100 text-slate-600'}
                       ${hidden ? 'city-extra hidden' : ''}">
            ${city === '全部' ? '🌐 全部' : `📍 ${city}`}
        </button>`;

    const renderCatBtn = (cat, hidden = false) => {
        const icon = iconMap[cat] || '🏷️';
        return `
        <button id="cat-tab-${cat}"
                onclick="App.filterBacklogByCat('${cat}'); viewEngine.updateBacklogFilterLabel();"
                class="cat-filter-btn flex items-center gap-1.5 px-4 py-2 rounded-full text-[13px] font-medium transition-all active:scale-95
                       ${activeCat === cat ? 'theme-bg text-white' : 'bg-slate-100 text-slate-600'}
                       ${hidden ? 'cat-extra hidden' : ''}">
            <span>${icon}</span><span>${cat}</span>
        </button>`;
    };

    return `
        <div class="px-2 mb-2 animate-fade-in">
            <div class="bg-white rounded-2xl border border-slate-100 overflow-hidden">

                <button onclick="viewEngine.toggleBacklogFilter()"
                        class="w-full flex items-center justify-between px-4 py-3.5 active:bg-slate-50 transition-all">
                    <div class="flex items-center gap-2">
                        <i class="ti ti-filter" style="font-size: 16px; color: ${hasFilter ? '#D4537E' : '#94A3B8'};" aria-hidden="true"></i>
                        <span class="text-[13px] font-medium ${hasFilter ? 'theme-text-pink' : 'text-slate-500'}">
                            ${cityLabel} · ${catLabel}
                        </span>
                        ${hasFilter ? `
                            <button onclick="event.stopPropagation(); App.filterBacklogByCity('全部'); App.filterBacklogByCat('全部'); viewEngine.updateBacklogFilterLabel();"
                                    class="text-[11px] text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full active:scale-95 transition-all">
                                清除
                            </button>` : ''}
                    </div>
                    <i id="backlog-filter-chevron" class="ti ti-chevron-down"
                       style="font-size: 16px; color: #94A3B8; transition: transform 0.2s;" aria-hidden="true"></i>
                </button>

                <div id="backlog-filter-panel"
                     style="display: none; flex-direction: column; gap: 16px; padding: 0 16px 16px; border-top: 0.5px solid var(--color-border-tertiary);">

                    <!-- 城市 -->
                    <div style="padding-top: 14px;">
                        <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-3">城市</p>
                        <div class="flex flex-wrap gap-2">
                            ${cityVisible.map(c => renderCityBtn(c)).join('')}
                            ${cityHidden.map(c => renderCityBtn(c, true)).join('')}
                            ${cityHidden.length > 0 ? `
                                <button id="city-more-btn"
                                        onclick="viewEngine.toggleCityMore()"
                                        class="px-4 py-2 rounded-full text-[13px] font-medium border active:scale-95 transition-all"
                                        style="color: #D4537E; border-color: #F4C0D1; background: #FBEAF0;">
                                    +${cityHidden.length} 個
                                </button>` : ''}
                        </div>
                    </div>

                    <!-- 分類 -->
                    <div>
                        <div class="flex items-center justify-between mb-3">
                            <p class="text-[11px] font-black text-slate-400 uppercase tracking-wider">分類</p>
                            <button onclick="App.modalCreate('category-manager-modal', '標籤管理', viewEngine._renderCategoryEditor(), viewEngine._renderCategoryActions())"
                                    class="text-[11px] text-slate-400 flex items-center gap-1 active:scale-95 transition-all">
                                <i class="ti ti-settings" style="font-size: 13px;" aria-hidden="true"></i>
                                管理標籤
                            </button>
                        </div>
                        <div class="flex flex-wrap gap-2">
                            ${catVisible.map(c => renderCatBtn(c)).join('')}
                            ${catHidden.map(c => renderCatBtn(c, true)).join('')}
                            ${catHidden.length > 0 ? `
                                <button id="cat-more-btn"
                                        onclick="viewEngine.toggleCatMore()"
                                        class="px-4 py-2 rounded-full text-[13px] font-medium border active:scale-95 transition-all"
                                        style="color: #D4537E; border-color: #F4C0D1; background: #FBEAF0;">
                                    +${catHidden.length} 個
                                </button>` : ''}
                        </div>
                    </div>

                    <button onclick="viewEngine.toggleBacklogFilter()"
                            class="w-full py-3 bg-slate-50 text-slate-400 rounded-xl text-[13px] font-medium active:scale-95 transition-all">
                        收起篩選
                    </button>

                </div>
            </div>
        </div>`;
},

/** 🏙️ 城市展開更多 */
toggleCityMore() {
    const extras = document.querySelectorAll('.city-extra');
    const btn = document.getElementById('city-more-btn');
    if (!btn) return;
    const isOpen = btn.textContent.trim() === '收起';
    extras.forEach(el => el.classList.toggle('hidden', isOpen));
    btn.textContent = isOpen ? `+${extras.length} 個` : '收起';
    btn.style.color = isOpen ? '#D4537E' : '#94A3B8';
    btn.style.borderColor = isOpen ? '#F4C0D1' : 'var(--color-border-tertiary)';
    btn.style.background = isOpen ? '#FBEAF0' : 'var(--color-background-secondary)';
},

/** 🏷️ 分類展開更多 */
toggleCatMore() {
    const extras = document.querySelectorAll('.cat-extra');
    const btn = document.getElementById('cat-more-btn');
    if (!btn) return;
    const isOpen = btn.textContent.trim() === '收起';
    extras.forEach(el => el.classList.toggle('hidden', isOpen));
    btn.textContent = isOpen ? `+${extras.length} 個` : '收起';
    btn.style.color = isOpen ? '#D4537E' : '#94A3B8';
    btn.style.borderColor = isOpen ? '#F4C0D1' : 'var(--color-border-tertiary)';
    btn.style.background = isOpen ? '#FBEAF0' : 'var(--color-background-secondary)';
},

// 靈感清單更多選單控制
toggleBacklogMoreMenu() {
    const menu = document.getElementById('backlog-more-menu');
    const overlay = document.getElementById('backlog-more-overlay');
    if (!menu) return;
    const isOpen = !menu.classList.contains('hidden');
    menu.classList.toggle('hidden');
    if (overlay) overlay.classList.toggle('hidden');
},

closeBacklogMoreMenu() {
    const menu = document.getElementById('backlog-more-menu');
    const overlay = document.getElementById('backlog-more-overlay');
    if (menu) menu.classList.add('hidden');
    if (overlay) overlay.classList.add('hidden');
},

/** ✅ 選取模式切換 */
toggleBacklogSelectMode() {
    const indicators = document.querySelectorAll('.select-indicator');
    const actionBtns = document.querySelectorAll('.action-btns');
    const btn = document.getElementById('btn-select-mode');
    const manager = window.backlogManager;

    // 🚀 [修正] 用 startsWith 判斷，相容「完成 (5)」格式
    const isSelectMode = btn?.textContent?.trim().startsWith('完成');

    if (isSelectMode) {
        manager?.clearSelection();
        indicators.forEach(el => el.style.display = 'none');
        actionBtns.forEach(el => el.style.display = 'flex');
    } else {
        indicators.forEach(el => el.style.display = 'flex');
        actionBtns.forEach(el => el.style.display = 'none');
    }
    viewEngine.updateRefineryFAB();
},

/** 🔽 折疊式篩選器開關 */
toggleBacklogFilter() {
    const panel = document.getElementById('backlog-filter-panel');
    const chevron = document.getElementById('backlog-filter-chevron');
    if (!panel) return;
    const isOpen = panel.style.display === 'flex';
    panel.style.display = isOpen ? 'none' : 'flex';
    if (chevron) chevron.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(180deg)';
},

/** 🏷️ 即時更新篩選狀態標籤（不需重新渲染整頁） */
updateBacklogFilterLabel() {
    const activeCity = localStorage.getItem('tf_backlog_city_focus') || '全部';
    const activeCat  = localStorage.getItem('tf_backlog_cat_focus')  || '全部';
    const iconMap = {
        '全部': '🌈', '食': '☕', '玩': '🎡', '購': '🛍️',
        '行': '🚌', '住': '🏨', '醫': '🏥', '史': '🏯', '景': '🎑', '泉': '♨️'
    };
    const cityLabel = activeCity === '全部' ? '全部城市' : `📍 ${activeCity}`;
    const catIcon   = iconMap[activeCat] || '🏷️';
    const catLabel  = activeCat === '全部' ? '全部類型' : `${catIcon} ${activeCat}`;
    const hasFilter = activeCity !== '全部' || activeCat !== '全部';

    // 更新頭部標籤文字
    const labelEl = document.querySelector('#backlog-filter-panel')
                             ?.closest('.rounded-2xl')
                             ?.querySelector('button > span.text-\\[12px\\]');
    if (labelEl) {
        labelEl.textContent = `${cityLabel} · ${catLabel}`;
        labelEl.className = `text-[12px] font-medium ${hasFilter ? 'theme-text-pink' : 'text-slate-500'}`;
    }

    // 更新城市按鈕狀態
    document.querySelectorAll('[id^="city-tab-"]').forEach(btn => {
        const city = btn.id.replace('city-tab-', '');
        btn.className = `px-3 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-95 ${
            city === activeCity ? 'theme-bg text-white' : 'bg-slate-100 text-slate-500'
        }`;
    });

    // 更新分類按鈕狀態
    document.querySelectorAll('[id^="cat-tab-"]').forEach(btn => {
        const cat = btn.id.replace('cat-tab-', '');
        btn.className = `flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-medium transition-all active:scale-95 ${
            cat === activeCat ? 'theme-bg text-white' : 'bg-slate-100 text-slate-500'
        }`;
    });
},


/** 🧬 [Physical-Focus] 執行靈感導航標籤置中 (V2026.ULTRA 座標校準版) */
focusBacklogTabs(activeCity, activeCat) {
    const executeCentering = () => {
        // 🚀 內部計算引擎：計算置中位移量
        const calculateScroll = (tabId, trackId) => {
            const tab = document.getElementById(tabId);
            const track = document.getElementById(trackId);
            if (!tab || !track) return;

            // 1. 採集物理數據
            const trackWidth = track.clientWidth;
            const tabOffset = tab.offsetLeft;
            const tabWidth = tab.offsetWidth;

            // 2. 邊際補償計算：目標位置 = (元素左偏) - (一半軌道寬) + (一半元素寬)
            let targetX = tabOffset - (trackWidth / 2) + (tabWidth / 2);
            
            // 3. 邊際保護：封殺負數與溢出
            targetX = Math.max(0, Math.min(targetX, track.scrollWidth - trackWidth));

            // 4. 執行物理位移
            track.scrollTo({
                left: targetX,
                behavior: 'smooth'
            });
        };

        // 執行 A 軌道與 B 軌道對焦
        calculateScroll(`city-tab-${activeCity}`, 'backlog-city-track');
        calculateScroll(`cat-tab-${activeCat}`, 'backlog-cat-track');
    };

    // 💡 職人診斷：採用雙脈衝觸發，對抗非同步渲染延遲
    requestAnimationFrame(executeCentering);
    setTimeout(executeCentering, 100); // 100ms 補償，確保 CSS Layout 已固化
},

/** 🤖 [AI-Planner] 渲染設定畫面 */
_renderAIPlannerSettings(selectedCards, trip) {
    const hotel = trip.hotels?.[0];
    const hotelName = hotel?.name || null;
    const totalDays = trip.days?.length || 5;

    const activeStyle = `border: 2px solid #D4537E; background: #FBEAF0;`;
    const inactiveStyle = `border: 1px solid #E2E8F0; background: #F8FAFC;`;
    const activeRadio = `width: 18px; height: 18px; border-radius: 50%; background: #D4537E; display: flex; align-items: center; justify-content: center; flex-shrink: 0;`;
    const inactiveRadio = `width: 18px; height: 18px; border-radius: 50%; border: 2px solid #CBD5E1; background: white; flex-shrink: 0;`;

    const catIconMap = {
        '食': 'fa-solid fa-utensils',
        '玩': 'fa-solid fa-torii-gate',
        '購': 'fa-solid fa-bag-shopping',
        '行': 'fa-solid fa-train',
        '住': 'fa-solid fa-bed',
        '醫': 'fa-solid fa-kit-medical',
        '史': 'fa-solid fa-landmark',
        '景': 'fa-solid fa-mountain',
        '泉': 'fa-solid fa-droplet',
    };
    const catColors = {
        '食': { bg: '#FBEAF0', color: '#D4537E' },
        '玩': { bg: '#E6F1FB', color: '#185FA5' },
        '購': { bg: '#EAF3DE', color: '#3B6D11' },
        '行': { bg: '#FAEEDA', color: '#854F0B' },
        '住': { bg: '#F1EFE8', color: '#5F5E5A' },
        '醫': { bg: '#FCEBEB', color: '#A32D2D' },
        '史': { bg: '#F1EFE8', color: '#5F5E5A' },
        '景': { bg: '#EAF3DE', color: '#3B6D11' },
        '泉': { bg: '#E6F1FB', color: '#185FA5' },
    };

    // 🚀 必去小卡列表渲染
    const mustGoCardsHtml = selectedCards.map(c => {
        const cat = catColors[c.category] || { bg: '#F1EFE8', color: '#5F5E5A' };
        const icon = catIconMap[c.category] || 'fa-solid fa-map-pin';
        return `
            <div id="mustgo-card-${c.id}"
                 onclick="App._toggleMustGo('${c.id}')"
                 style="display: flex; align-items: center; gap: 8px; padding: 8px 10px;
                        border-radius: 10px; border: 1px solid #E2E8F0; background: white;
                        cursor: pointer; transition: all 0.15s; margin-bottom: 6px;">
                <div style="width: 28px; height: 28px; border-radius: 8px; background: ${cat.bg};
                            display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="${icon}" style="font-size: 12px; color: ${cat.color};"></i>
                </div>
                <div style="flex: 1; min-width: 0;">
                    <p style="font-size: 13px; font-weight: 600; color: #1E293B; margin: 0;
                              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${c.name}</p>
                    <p style="font-size: 11px; color: #94A3B8; margin: 0;">${c.category} · ${c.city || ''}</p>
                </div>
                <div id="mustgo-star-${c.id}"
                     style="width: 28px; height: 28px; border-radius: 8px; background: #F1F5F9;
                            display: flex; align-items: center; justify-content: center; flex-shrink: 0;
                            transition: all 0.15s;">
                    <i class="fa-regular fa-star" style="font-size: 13px; color: #CBD5E1;"></i>
                </div>
            </div>`;
    }).join('');

    return `
        <div style="display: flex; flex-direction: column; gap: 0;">

            <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 0 0 14px; line-height: 1.6;">
                已選 ${selectedCards.length} 張小卡 · ${trip.city || ''} ${totalDays} 天
            </p>

<!-- 0. 必去標記 -->
            <div style="margin-bottom: 16px;">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <p style="font-size: 12px; font-weight: 500; color: var(--color-text-secondary); margin: 0;">⭐ 必去景點</p>
                    <span style="font-size: 11px; color: #94A3B8;">點擊星星標記，AI 不得剔除</span>
                </div>

                <!-- 🚀 搜尋 bar -->
                <div style="position: relative; margin-bottom: 8px;">
                    <i class="fa-solid fa-magnifying-glass"
                       style="position: absolute; left: 10px; top: 50%; transform: translateY(-50%);
                              font-size: 12px; color: #CBD5E1; pointer-events: none;"></i>
                    <input type="text"
                           id="mustgo-search"
                           placeholder="搜尋景點名稱..."
                           oninput="App._filterMustGoList(this.value)"
                           style="width: 100%; padding: 8px 12px 8px 32px; border-radius: 10px;
                                  border: 1px solid #E2E8F0; background: #F8FAFC;
                                  font-size: 12px; color: #1E293B; outline: none;
                                  box-sizing: border-box; transition: border 0.15s;"
                           onfocus="this.style.border='1px solid #F4C0D1'"
                           onblur="this.style.border='1px solid #E2E8F0'">
                </div>

                <div id="mustgo-list" style="max-height: 220px; overflow-y: auto; padding-right: 2px;">
                    ${mustGoCardsHtml}
                </div>
            </div>

            <!-- 1. 起訖點 -->
            <div style="margin-bottom: 16px;">
                <p style="font-size: 12px; font-weight: 500; color: var(--color-text-secondary); margin: 0 0 8px;">1. 起訖點設定</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">

                    ${hotelName ? `
                    <label onclick="App._setPlannerDep('hotel')" id="dep-hotel"
                           style="display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--border-radius-md); ${activeStyle} cursor: pointer; transition: all 0.15s;">
                        <div class="dep-radio" style="${activeRadio}">
                            <i class="ti ti-check" style="font-size: 11px; color: white;" aria-hidden="true"></i>
                        </div>
                        <div>
                            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-primary); margin: 0;">從飯店出發，最後回飯店</p>
                            <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 1px 0 0;">偵測到：${hotelName}</p>
                        </div>
                    </label>` : ''}

                    <label onclick="App._setPlannerDep('ai')" id="dep-ai"
                           style="display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--border-radius-md); ${hotelName ? inactiveStyle : activeStyle} cursor: pointer; transition: all 0.15s;">
                        <div class="dep-radio" style="${hotelName ? inactiveRadio : activeRadio}">
                            ${!hotelName ? '<i class="ti ti-check" style="font-size: 11px; color: white;" aria-hidden="true"></i>' : ''}
                        </div>
                        <div>
                            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-primary); margin: 0;">交由 AI 決定</p>
                            <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 1px 0 0;">AI 依地理位置自動規劃最佳動線</p>
                        </div>
                    </label>

                    <label onclick="App._setPlannerDep('custom')" id="dep-custom"
                           style="display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--border-radius-md); ${inactiveStyle} cursor: pointer; transition: all 0.15s;">
                        <div class="dep-radio" style="${inactiveRadio}"></div>
                        <div style="flex: 1;">
                            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-primary); margin: 0;">自訂起訖點</p>
                            <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 1px 0 0;">手動輸入每天的起訖地點</p>
                        </div>
                    </label>

                    <div id="dep-custom-input" style="display: none; padding: 0 2px;">
                        <input type="text" id="planner-dep-text" placeholder="例如：京都車站、烏丸御池站"
                               style="width: 100%; padding: 10px 12px; border-radius: var(--border-radius-md); border: 1.5px solid var(--color-border-tertiary); background: var(--color-background-secondary); font-size: 13px; color: var(--color-text-primary); outline: none; box-sizing: border-box;">
                    </div>
                </div>
            </div>

            <!-- 2. 每天最多景點數 -->
            <div style="margin-bottom: 16px; padding: 12px; background: var(--color-background-primary); border: 1.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md);">
                <p style="font-size: 12px; font-weight: 500; color: var(--color-text-secondary); margin: 0 0 10px;">2. 每天最多景點數</p>
                <div style="display: flex; align-items: center; gap: 12px;">
                    <input type="range" min="2" max="6" value="4" id="planner-card-limit"
                           oninput="document.getElementById('planner-limit-val').textContent = this.value"
                           style="flex: 1;">
                    <div style="text-align: center; min-width: 48px;">
                        <p id="planner-limit-val" style="font-size: 20px; font-weight: 500; color: var(--color-text-primary); margin: 0;">4</p>
                        <p style="font-size: 10px; color: var(--color-text-tertiary); margin: 0;">張 / 天</p>
                    </div>
                </div>
                <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 8px 0 0; line-height: 1.6;">超出無法排入的景點會列出並說明原因</p>
            </div>

            <!-- 3. 行程天數 -->
            <div style="margin-bottom: 16px;">
                <p style="font-size: 12px; font-weight: 500; color: var(--color-text-secondary); margin: 0 0 8px;">3. 行程天數設定</p>
                <div style="display: flex; flex-direction: column; gap: 8px;">

                    <label onclick="App._setPlannerDays('full')" id="days-full"
                           style="display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--border-radius-md); ${activeStyle} cursor: pointer; transition: all 0.15s;">
                        <div class="days-radio" style="${activeRadio}">
                            <i class="ti ti-check" style="font-size: 11px; color: white;" aria-hidden="true"></i>
                        </div>
                        <div>
                            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-primary); margin: 0;">完整天數（含抵達與離開當天）</p>
                            <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 1px 0 0;">Day 1 ~ Day ${totalDays}，共 ${totalDays} 天</p>
                        </div>
                    </label>

                    ${hotelName ? `
                    <label onclick="App._setPlannerDays('hotel')" id="days-hotel"
                           style="display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--border-radius-md); ${inactiveStyle} cursor: pointer; transition: all 0.15s;">
                        <div class="days-radio" style="${inactiveRadio}"></div>
                        <div>
                            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-primary); margin: 0;">含飯店動線整合</p>
                            <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 1px 0 0;">${hotelName} check-in / check-out 自動加入排程</p>
                        </div>
                    </label>` : ''}

                    <label onclick="App._setPlannerDays('effective')" id="days-effective"
                           style="display: flex; align-items: center; gap: 10px; padding: 12px; border-radius: var(--border-radius-md); ${inactiveStyle} cursor: pointer; transition: all 0.15s;">
                        <div class="days-radio" style="${inactiveRadio}"></div>
                        <div>
                            <p style="font-size: 13px; font-weight: 500; color: var(--color-text-primary); margin: 0;">僅排有效天數</p>
                            <p style="font-size: 11px; color: var(--color-text-tertiary); margin: 1px 0 0;">排除抵達 / 離開日，約 ${Math.max(totalDays - 2, 1)} 天</p>
                        </div>
                    </label>

                </div>
            </div>

            <!-- 4. 行程節奏 -->
            <div style="margin-bottom: 4px; padding: 12px; background: var(--color-background-primary); border: 1.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                    <p style="font-size: 12px; font-weight: 500; color: var(--color-text-secondary); margin: 0;">4. 行程節奏</p>
                    <span id="planner-pace-label" style="font-size: 11px; color: #D4537E; background: #FBEAF0; padding: 3px 10px; border-radius: 999px; font-weight: 500;">舒適</span>
                </div>
                <div style="display: flex; align-items: center; gap: 8px;">
                    <span style="font-size: 11px; color: var(--color-text-tertiary);">寬鬆</span>
                    <input type="range" min="1" max="3" value="2" id="planner-pace"
                           oninput="App._updatePlannerPace(this.value)" style="flex: 1;">
                    <span style="font-size: 11px; color: var(--color-text-tertiary);">緊湊</span>
                </div>
                <p id="planner-pace-desc" style="font-size: 11px; color: var(--color-text-tertiary); margin: 8px 0 0; line-height: 1.6;">
                    每天安排 3-4 個景點，景點間保留足夠移動時間與用餐休息。
                </p>
            </div>

            <!-- 5. 分類分散 -->
            <div style="margin-top: 12px; padding: 12px; background: var(--color-background-primary); border: 1.5px solid var(--color-border-secondary); border-radius: var(--border-radius-md);">
                <div style="display: flex; align-items: center; justify-content: space-between;">
                    <div style="flex: 1;">
                        <p style="font-size: 12px; font-weight: 500; color: var(--color-text-secondary); margin: 0 0 3px;">5. 分類平衡模式</p>
                        <p id="spread-mode-desc" style="font-size: 11px; color: var(--color-text-tertiary); margin: 0; line-height: 1.6;">
                           關閉：純依地理位置排列，不限制同天分類
                        </p>
                    </div>
                    <div onclick="App._toggleSpreadMode()"
                         id="spread-mode-toggle"
                         style="width: 44px; height: 26px; border-radius: 999px; background: #E2E8F0;
                                display: flex; align-items: center; padding: 3px; cursor: pointer;
                                transition: all 0.2s; flex-shrink: 0; margin-left: 12px;">
                        <div id="spread-mode-knob"
                             style="width: 20px; height: 20px; border-radius: 50%; background: white;
                                    box-shadow: 0 1px 3px rgba(0,0,0,0.2); transition: all 0.2s; transform: translateX(0px);"></div>
                    </div>
                </div>
            </div>

        </div>`;
},


/** 🤖 [AI-Planner] 渲染預覽畫面 */
_renderAIPlannerPreview(result, trip, selectedCards, draftId = null) {
    const cardMap = Object.fromEntries(selectedCards.map(c => [String(c.id), c]));
    const daysHtml = (result.days || []).map((day, dayIndex) => {
        const cards = (day.cards || []).map(cardEntry => {
    const cardId = typeof cardEntry === 'object' ? cardEntry.id : cardEntry;
    const suggestedTime = typeof cardEntry === 'object' ? cardEntry.suggested_time : null;
    const card = cardMap[String(cardId)];
    if (!card) return '';

    const catColors = {
        '食': { bg: '#FBEAF0', border: '#F4C0D1' },
        '玩': { bg: '#E6F1FB', border: '#B8D4F0' },
        '購': { bg: '#EAF3DE', border: '#B8D9A0' },
        '行': { bg: '#FAEEDA', border: '#F0C990' },
        '住': { bg: '#F1EFE8', border: '#D4CFBF' },
        '醫': { bg: '#FCEBEB', border: '#F0B8B8' }
    };
    const style = catColors[card.category] || { bg: '#F1EFE8', border: '#D4CFBF' };

    return `<span style="display: inline-flex; align-items: center; padding: 7px 14px;
                         border-radius: 999px; background: ${style.bg};
                         border: 1px solid ${style.border};
                         font-size: 14px; color: var(--color-text-primary);
                         white-space: nowrap; margin: 4px;">
                ${suggestedTime ? `<span style="font-size: 11px; color: #94A3B8; margin-right: 6px;">${suggestedTime}</span>` : ''}
                ${card.name}
            </span>`;
}).join('');
        const isEmpty = (day.cards || []).length === 0;

        // 🚀 有 draftId 且該天有小卡才顯示「進入細項規劃」按鈕
        const refineBtnHtml = (draftId && !isEmpty) ? `
            <button onclick="App.startDayRefinement('${draftId}', ${dayIndex})"
                    style="margin-top: 10px; width: 100%; padding: 8px; border-radius: 12px;
                           background: #F8FAFC; border: 1px solid #E2E8F0; cursor: pointer;
                           font-size: 12px; font-weight: 500; color: #64748B; display: flex;
                           align-items: center; justify-content: center; gap: 6px; transition: all 0.15s;"
                    onmouseover="this.style.background='#FBEAF0'; this.style.borderColor='#F4C0D1'; this.style.color='#D4537E';"
                    onmouseout="this.style.background='#F8FAFC'; this.style.borderColor='#E2E8F0'; this.style.color='#64748B';">
                <i class="fa-solid fa-wand-magic-sparkles" style="font-size: 11px;"></i>
                進入 Day ${day.day} 細項規劃
            </button>` : '';

        return `
            <div style="padding: 16px 0; border-bottom: 0.5px solid var(--color-border-tertiary); ${isEmpty ? 'opacity: 0.5;' : ''}">
                <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="width: 26px; height: 26px; border-radius: 50%; background: ${isEmpty ? '#CBD5E1' : '#D4537E'}; display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 500; color: white; flex-shrink: 0;">${day.day}</span>
                        <p style="font-size: 15px; font-weight: 500; color: var(--color-text-primary); margin: 0;">Day ${day.day} · ${day.theme || ''}</p>
                    </div>
                    <span style="font-size: 12px; color: var(--color-text-tertiary);">${isEmpty ? '自由行動' : `${day.cards.length} 個景點`}</span>
                </div>
                ${day.note ? `<p style="font-size: 13px; color: var(--color-text-secondary); margin: 0 0 10px; line-height: 1.7;">${day.note}</p>` : ''}
                ${isEmpty
                    ? `<p style="font-size: 12px; color: var(--color-text-tertiary); font-style: italic; margin: 0;">無景點安排，可自由規劃</p>`
                    : `<div style="display: flex; flex-wrap: wrap; margin: -4px;">${cards}</div>`
                }
                ${refineBtnHtml}
            </div>`;
    }).join('');

const unscheduledHtml = (result.unscheduled || []).length > 0 ? `
    <div style="margin-top: 16px; background: #FAEEDA; border-radius: var(--border-radius-md); padding: 14px 16px;">
        <p style="font-size: 14px; font-weight: 500; color: #854F0B; margin: 0 0 8px;">⚠️ 未排入的景點</p>
        ${result.unscheduled.map(u => `
            <div style="margin-top: 8px;">
                <span style="font-size: 14px; color: #633806; font-weight: 600; display: block;">${u.name}</span>
                <span style="font-size: 13px; color: #854F0B; line-height: 1.6; display: block;">— ${u.reason}</span>
            </div>`).join('')}
    </div>` : `
    <div style="margin-top: 16px; background: #EAF3DE; border-radius: var(--border-radius-md); padding: 12px 16px; display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-circle-check" style="font-size: 18px; color: #3B6D11; flex-shrink: 0;" aria-hidden="true"></i>
        <p style="font-size: 14px; color: #3B6D11; margin: 0; font-weight: 500;">所有景點已全部排入行程</p>
    </div>`;

    return `
        <div style="display: flex; flex-direction: column; gap: 0;">
            ${daysHtml}
            ${unscheduledHtml}
        </div>`;
},


/** 🧪 [Sub-Component] 渲染標籤編輯器介面 */
_renderCategoryEditor() {
    const savedCategories = JSON.parse(localStorage.getItem('tf_backlog_categories')) || ['食', '玩', '購', '行', '住', '醫'];
    return `
    <div class="space-y-6 text-left pb-4 animate-fade-in">
        <div class="space-y-3">
            <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">現有標籤序列</label>
            <div class="flex flex-wrap gap-2">
                ${savedCategories.map(cat => `
                    <div class="flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-xl border border-slate-100 group">
                        <span class="text-xs font-bold text-slate-700">${cat}</span>
                        <button onclick="App.removeBacklogCategory('${cat}')" 
                                class="text-slate-300 hover:text-rose-500 transition-colors">✕</button>
                    </div>
                `).join('')}
            </div>
        </div>

        <div class="pt-4 border-t border-slate-50 space-y-3">
            <label class="text-[11px] font-black text-slate-400 uppercase tracking-widest px-1">新增自定義標籤</label>
            <div class="flex gap-2">
                <input type="text" id="new-cat-input" placeholder="例如：史 / 溫泉" 
                       class="flex-1 bg-slate-50 border-none rounded-xl p-4 text-sm font-black outline-none focus:ring-2 focus:ring-pink-100 transition-all">
                <button onclick="App.addCustomBacklogCategory()" 
                        class="px-6 theme-bg text-white rounded-xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all">+</button>
            </div>
        </div>
    </div>`;
},

/** 🛠️ [Action-Sector] 標籤管理按鈕組 */
_renderCategoryActions() {
    return `
        <button onclick="App.modalRemove('category-manager-modal')" 
                class="w-full py-4 bg-slate-100 text-slate-400 rounded-2xl font-black text-xs active:scale-95 transition-all">
            關閉管理員
        </button>`;
},

/** 🧪 [Sub-Component] 渲染燃料清單主體 */
_renderBacklogList(filtered, activeCity, activeCat) {
    if (filtered.length === 0) {
        return `
            <div class="py-24 text-center opacity-30 animate-fade-in px-10">
                <div class="text-5xl mb-6">🔍</div>
                <p class="text-xs font-bold tracking-[0.2em] leading-relaxed">
                    在「${activeCity}」磁區中<br>未偵測到「${activeCat}」相關燃料
                </p>
            </div>`;
    }

    return `
        <div class="grid grid-cols-1 gap-4 px-6 pb-32 animate-fade-in" id="backlog-list-container">
            ${filtered.map(item => this._renderBacklogCard(item)).join('')}
        </div>`;
},


/** 🧬 [Logic] 深度感應探針：語義權重加固版 (V2026.ULTRA.FINAL) */
_calculateProjectedDays(backlogName) {
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    if (!activeTrip || !backlogName) return [];

    // 🚀 1. 指紋洗滌引擎：洗掉裝飾，只留核心基因
    const wash = (str) => (str || "")
        .toLowerCase()
        .replace(/【.*?】/g, '') // 切除 AI 裝飾標籤
        .replace(/京都|東京|名古屋|大阪|福岡/g, '') // 💡 關鍵：比對時暫時忽略城市名，解決地名偏移
        .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '')
        .trim();

    const backlogFingerprint = wash(backlogName);
    const projectedDays = [];

    // 🚀 2. 探針定義
    const isHit = (targetName) => {
        const targetFingerprint = wash(targetName);
        if (!targetFingerprint || !backlogFingerprint) return false;
        
        // 💡 職人診斷：執行「指紋重疊判定」
        return targetFingerprint.includes(backlogFingerprint) || 
               backlogFingerprint.includes(targetFingerprint);
    };

    // 🚀 3. 物理穿透掃描
    activeTrip.days.forEach((day, index) => {
        const hasMatch = day.schedules?.some(s => {
            // A 軌道：大標題掃描
            if (isHit(s.location) || isHit(s.task)) return true;
            
            // B 軌道：🚀 穿透 JSON 燃料 (包含整合包內的 memo)
            if (s.style === 'json' && s.memo) {
                try {
                    const inner = JSON.parse(s.memo);
                    const nodesArray = Array.isArray(inner) ? inner : (inner.timeline || inner.stops || [inner]);
                    // 掃描子項目的 task, location, name
                    return nodesArray.some(n => isHit(n.task) || isHit(n.location) || isHit(n.name));
                } catch (e) { return false; }
            }
            return false;
        });
        if (hasMatch) projectedDays.push(index + 1);
    });

    return projectedDays;
},


/** 🎨 [UI Component] 渲染天數註記標籤組 (排序對焦版) */
_renderBacklogBadges(days) {
    if (!days || days.length === 0) return '';
    
    // 💡 職人邏輯：先排序天數，確保顯示為 D1, D2, D6...
    return days.sort((a, b) => a - b).map(d => `
        <div class="px-2 py-0.5 bg-slate-100 text-slate-500 rounded-lg text-[8px] font-black italic border border-slate-200/50 shadow-sm animate-fade-in flex-none tabular-nums">
            D${d}
        </div>
    `).join('');
},

_renderBacklogCard(item) {
    const projectedDays = this._calculateProjectedDays(item.name) || [];
    const manager = window.backlogManager || (typeof backlogManager !== 'undefined' ? backlogManager : null);
    const isStaged = manager?._stagedSelection?.has(String(item.id)) || false;
    const isProjected = projectedDays.length > 0;

    const borderColor = isStaged ? '#F4C0D1' : '#E2E8F0';
    const bgColor = isStaged ? '#FBEAF0' : 'white';

    const catIconMap = {
        '食': { icon: 'fa-solid fa-utensils',     bg: '#FBEAF0', color: '#D4537E' },
        '玩': { icon: 'fa-solid fa-torii-gate',   bg: '#E6F1FB', color: '#185FA5' },
        '購': { icon: 'fa-solid fa-bag-shopping', bg: '#EAF3DE', color: '#3B6D11' },
        '行': { icon: 'fa-solid fa-train',        bg: '#FAEEDA', color: '#854F0B' },
        '住': { icon: 'fa-solid fa-bed',          bg: '#F1EFE8', color: '#5F5E5A' },
        '醫': { icon: 'fa-solid fa-kit-medical',  bg: '#FCEBEB', color: '#A32D2D' },
        '史': { icon: 'fa-solid fa-landmark',     bg: '#F1EFE8', color: '#5F5E5A' },
        '景': { icon: 'fa-solid fa-mountain',     bg: '#EAF3DE', color: '#3B6D11' },
        '泉': { icon: 'fa-solid fa-droplet',      bg: '#E6F1FB', color: '#185FA5' },
    };
    const cat = item.category || '食';
    const catStyle = catIconMap[cat] || { icon: 'fa-solid fa-map-pin', bg: '#F1EFE8', color: '#5F5E5A' };

    const subLine2 = (item.info && item.info !== '批量精煉匯入' && item.info !== '批量注入') ? item.info : '';

    return `
        <div class="backlog-card ${isStaged ? 'selected' : ''}"
             id="card-${item.id}"
             data-id="${item.id}"
             onclick="viewEngine.toggleBacklogSelect('${item.id}')"
             style="border-radius: 16px; border: 1px solid ${borderColor}; background: ${bgColor};
                    display: flex; align-items: stretch; overflow: hidden;
                    transition: all 0.15s; cursor: pointer;">

            <input type="checkbox" class="sub-item-check hidden" id="check-${item.id}"
                   value="${item.id}" ${isStaged ? 'checked' : ''}>

            <!-- 左側彩色條 -->
            <div style="width: 3px; background: ${catStyle.color}; flex-shrink: 0;"></div>

            <!-- 主要內容 -->
            <div style="display: flex; align-items: center; gap: 10px; padding: 11px 12px; flex: 1; min-width: 0;">

                <!-- 分類圖示 -->
                <div style="width: 34px; height: 34px; border-radius: 9px; background: ${catStyle.bg};
                            display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <i class="${catStyle.icon}" style="font-size: 14px; color: ${catStyle.color};" aria-hidden="true"></i>
                </div>

                <!-- 文字資訊 -->
                <div style="flex: 1; min-width: 0;">
                    <div style="display: flex; align-items: center; gap: 5px; margin-bottom: 2px;">
                        <p style="font-size: 14px; font-weight: 700; color: #1E293B; margin: 0;
                                  white-space: nowrap; overflow: hidden; text-overflow: ellipsis; flex: 1; min-width: 0;">${item.name}</p>
                        ${projectedDays.map(d => `
                            <span style="font-size: 10px; color: #D4537E; background: #FBEAF0;
                                         padding: 1px 5px; border-radius: 4px; font-weight: 500; flex-shrink: 0;">D${d}</span>
                        `).join('')}
                        ${isProjected && projectedDays.length === 0 ? `
                            <span style="font-size: 10px; color: #3B6D11; background: #EAF3DE;
                                         padding: 1px 5px; border-radius: 4px; font-weight: 500; flex-shrink: 0;">已排入</span>` : ''}
                    </div>
                    <p style="font-size: 11px; color: #94A3B8; margin: 0;
                              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${cat} · ${item.city || '未知區域'}</p>
                    ${subLine2 ? `<p style="font-size: 11px; color: #94A3B8; margin: 1px 0 0;
                              white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${subLine2}</p>` : ''}
                </div>

            </div>

            <!-- 右側按鈕區 -->
            <div class="action-btns"
                 style="display: flex; flex-direction: column; justify-content: center; gap: 3px;
                        padding: 8px 10px; flex-shrink: 0; border-left: 1px solid #F1F5F9;"
                 onclick="event.stopPropagation()">
                <button onclick="App.editBacklogItem('${item.id}')"
                        style="width: 28px; height: 28px; border-radius: 8px; background: #F8FAFC;
                               border: 0.5px solid #E2E8F0; display: flex; align-items: center;
                               justify-content: center; cursor: pointer;"
                        aria-label="編輯">
                    <i class="fa-solid fa-pen-to-square" style="font-size: 12px; color: #94A3B8;" aria-hidden="true"></i>
                </button>
                <button onclick="App.deleteBacklogItem('${item.id}')"
                        style="width: 28px; height: 28px; border-radius: 8px; background: #F8FAFC;
                               border: 0.5px solid #E2E8F0; display: flex; align-items: center;
                               justify-content: center; cursor: pointer;"
                        aria-label="刪除">
                    <i class="fa-solid fa-trash-can" style="font-size: 12px; color: #94A3B8;" aria-hidden="true"></i>
                </button>
            </div>

        </div>`;
},


/** 🧪 [Sub-Component] 渲染底部操作列 (手機友善整合版) */
_renderBacklogFAB() {
    return `
        <div id="refinery-fab"
             class="fixed bottom-0 left-0 right-0 z-[4000] transition-all duration-300 ease-out"
             style="transform: translateY(100%); opacity: 0; pointer-events: none;">

            <div class="bg-white border-t border-slate-100 shadow-2xl px-4 py-3 safe-area-bottom"
                 style="padding-bottom: calc(12px + env(safe-area-inset-bottom, 0px));">

                <div class="flex items-center justify-between gap-3">

                    <!-- 左側：已選數量 + 清除 -->
                    <div class="flex items-center gap-3">
                        <div class="flex flex-col">
                            <span id="select-count"
                                  class="text-[13px] font-black text-slate-800">已選 0 張</span>
                            <span class="text-[10px] text-slate-400">點選卡片可多選</span>
                        </div>
                        <button onclick="window.backlogManager?.clearSelection(); viewEngine.updateRefineryFAB();"
                                class="px-3 py-2 bg-slate-100 text-slate-500 rounded-full text-[11px] font-medium active:scale-95 transition-all">
                            清除
                        </button>
                    </div>

                    <!-- 右側：操作按鈕 -->
                    <div class="flex items-center gap-2">

                        <!-- 轉換行程（原有功能） -->
                        <button onclick="viewEngine.triggerProjection()"
                                class="flex items-center gap-2 px-4 py-3 bg-slate-800 text-white rounded-full text-[12px] font-medium active:scale-95 transition-all shadow-lg">
                            <i class="ti ti-calendar-plus" style="font-size: 15px;" aria-hidden="true"></i>
                            <span>排入行程</span>
                        </button>

                        <!-- AI 規劃多日行程（新功能） -->
                        <button onclick="viewEngine.triggerAIPlanner()"
                                class="flex items-center gap-2 px-4 py-3 theme-bg text-white rounded-full text-[12px] font-medium active:scale-95 transition-all shadow-lg shadow-pink-100">
                            <i class="ti ti-sparkles" style="font-size: 15px;" aria-hidden="true"></i>
                            <span>AI 規劃</span>
                        </button>

                    </div>
                </div>
            </div>
        </div>`;
},

/** 🤖 [AI-Planner] 觸發 AI 多日行程規劃 */
triggerAIPlanner() {
    App.openAIPlannerSettings();
},


/** 🔄 [Refinery-Internal] 切換選取狀態與物理反饋 */
toggleBacklogSelect(id) {
    const card = document.getElementById(`card-${id}`);
    if (!card) return;
    let isStaged = false;
    if (typeof backlogManager !== 'undefined') {
        isStaged = backlogManager.toggleSelection(id);
    }
    if (isStaged) {
        // 選取：浮起感 + 粉色邊框
        card.classList.add('selected');
        card.style.border = '2px solid #D4537E';
        card.style.background = '#FBEAF0';
        card.style.boxShadow = '0 4px 16px rgba(212, 83, 126, 0.2)';
        card.style.transform = 'translateY(-2px)';
    } else {
        // 取消：回到原始狀態
        card.classList.remove('selected');
        card.style.border = '1px solid #E2E8F0';
        card.style.background = 'white';
        card.style.boxShadow = 'none';
        card.style.transform = 'translateY(0)';
    }
    if (viewEngine && typeof viewEngine.updateRefineryFAB === 'function') {
        viewEngine.updateRefineryFAB();
    }
    if (navigator.vibrate) navigator.vibrate(5);
},

updateRefineryFAB() {
    // 🚀 FAB 永久隱藏
    const fab = document.getElementById('refinery-fab');
    if (fab) {
        fab.style.transform = 'translateY(100%)';
        fab.style.opacity = '0';
        fab.style.pointerEvents = 'none';
    }

    const manager = window.backlogManager || (typeof backlogManager !== 'undefined' ? backlogManager : null);
    const selectionSize = manager?._stagedSelection?.size || 0;
    const totalItems = manager?.items?.length || 0;

    // 🚀 同步頭部副標題
    const subtitleEl = document.getElementById('backlog-header-subtitle');
    if (subtitleEl) {
        subtitleEl.innerHTML = selectionSize > 0
            ? `${totalItems} 筆 · <span class="theme-text-pink font-medium">已選 ${selectionSize}</span>`
            : `${totalItems} 筆`;
    }

    // 🚀 直接更新 bar 內的文字，不重新渲染整個 bar
    const countEl = document.getElementById('select-bar-count');
    if (countEl) countEl.innerHTML = selectionSize > 0
        ? `已選 <strong style="color: #D4537E;">${selectionSize}</strong> 張`
        : '';

    const actionEl = document.getElementById('select-bar-actions');
    if (actionEl) actionEl.style.display = selectionSize > 0 ? 'flex' : 'none';

    const hintEl = document.getElementById('select-bar-hint');
    if (hintEl) hintEl.style.display = selectionSize > 0 ? 'none' : 'block';

    // 🚀 相容性
    const badge = document.getElementById('selection-badge-count');
    if (badge) badge.innerText = selectionSize;

    console.log(`📡 [UI-Sync] 選取路網對焦完畢 | 規模: ${selectionSize}`);
},

/** 🚀 [Refinery-Main] 觸發精煉中繼程序 (V2026.ULTRA V2.0 版) */
triggerProjection() {
    const selectedIds = Array.from(document.querySelectorAll('.backlog-card.selected'))
                             .map(el => el.id.replace('card-', ''));
    
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return uiManager.showToast('⚠️', '請先開啟任一行程以定位投射目標');

    const primaryCity = trip.city || "日本";
    const idsJson = JSON.stringify(selectedIds).replace(/"/g, '&quot;');

    // 🚀 核心導通：呼叫重構後的內容生成器
    const content = this._renderRefineryStation(primaryCity, idsJson);

    modalEngine.create('refinery-station-modal', '🏭 靈感轉行程中繼站', content, '');
    
    // 💡 點火初始化模式
    requestAnimationFrame(() => {
        const savedMode = localStorage.getItem('tf_refinery_mode') || 'split';
        this.setRefineryMode(savedMode);
    });
},

/** 🧪 [Sub-Component] 渲染精煉中繼站 (V2.1 垂直階梯對焦版) */
_renderRefineryStation(city, idsJson) {
    // 🚀 數據前檢：獲取當前行程的天數燃料
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    const dayButtons = activeTrip ? activeTrip.days.map((d, i) => `
        <button onclick="App.executeRefineryProjection('${idsJson}', ${i})" 
                class="py-4 bg-white border border-slate-100 rounded-2xl font-black text-xs text-slate-400 hover:theme-bg hover:text-white hover:border-transparent active:scale-95 transition-all shadow-sm">
            D${i+1}
        </button>
    `).join('') : '';

    return `
        <div class="space-y-8 text-left animate-fade-in pb-6">
            
            <div class="space-y-3">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Step 1. 靈感匯入模式</label>
                <div class="bg-slate-100 p-1.5 rounded-[2rem] flex items-center border border-slate-200/50 shadow-inner">
                    <button onclick="viewEngine.setRefineryMode('split')" id="mode-split" 
                            class="flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300">
                        <span class="mr-1">🧩</span> 個體轉入
                    </button>
                    <button onclick="viewEngine.setRefineryMode('suite')" id="mode-suite" 
                            class="flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300">
                        <span class="mr-1">📦</span> 整合套裝
                    </button>
                </div>
            </div>

            <div class="space-y-4">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Step 2. 獲取 AI 數據指令</label>
                <div class="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col gap-4">
                    <div class="min-w-0 px-1">
                        <p class="text-[11px] text-slate-500 font-bold leading-relaxed">
                            系統將根據上方模式自動合成指令。<br>
                            請複製後貼給 AI 以換取高品質 JSON 燃料。
                        </p>
                        <p class="text-[10px] theme-text-pink font-black mt-2 uppercase tracking-tighter italic" id="refinery-mode-hint">
                            LOADING MODE STATUS...
                        </p>
                    </div>
                    <button onclick="backlogManager.copyRefineryPrompt('${city}', '${idsJson}')" 
                            class="w-full theme-bg text-white py-4 rounded-2xl font-black text-xs shadow-lg shadow-pink-100 active:scale-95 transition-all flex items-center justify-center gap-2">
                        <span>✨</span> 複製 PROMPT 指令
                    </button>
                </div>
            </div>

            <div class="space-y-3">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Step 3. 注入 AI 回應燃料</label>
                <textarea id="refinery-json-input" 
                    class="w-full h-40 bg-slate-50 border-none rounded-[2.2rem] p-6 text-[11px] font-mono theme-text-pink focus:ring-2 focus:ring-pink-100 outline-none custom-scrollbar shadow-inner" 
                    placeholder="在此貼上 AI 生成的 JSON 內容..."></textarea>
            </div>

            <div class="space-y-4">
                <label class="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Step 4. 執行物理投射日期</label>
                <div class="grid grid-cols-4 gap-2.5">
                    ${dayButtons}
                </div>
            </div>
        </div>`;
},

/** 🎨 介面連動：切換精煉模式 (肥大版對焦) */
setRefineryMode(mode) {
    const isSplit = mode === 'split';
    localStorage.setItem('tf_refinery_mode', mode);
    
    const btnSplit = document.getElementById('mode-split');
    const btnSuite = document.getElementById('mode-suite');

    if (!btnSplit || !btnSuite) return;

    if (isSplit) {
        // 單獨模式亮起
        btnSplit.className = "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 bg-white shadow-md theme-text-pink";
        btnSuite.className = "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 text-slate-400";
    } else {
        // 整合模式亮起
        btnSuite.className = "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 bg-white shadow-md theme-text-pink";
        btnSplit.className = "flex-1 py-4 rounded-[1.5rem] text-xs font-black transition-all duration-300 text-slate-400";
    }
    
    if (navigator.vibrate) navigator.vibrate(8);
},

_renderAddBacklogForm() {
    const activeTrip = state.trips.find(t => t.id === state.activeTripId);
    const activeCity = activeTrip?.city || "";

    const savedCats = JSON.parse(localStorage.getItem('tf_backlog_categories') || '[]');
    const defaultCats = ['食', '玩', '購', '行', '住', '醫', '史', '景', '泉'];
    const allCats = [...new Set([...defaultCats, ...savedCats.filter(c => c !== '全部')])];
    const visibleCats = allCats.slice(0, 5);
    const hiddenCats = allCats.slice(5);

    const catColors = {
        '食': { bg: '#FBEAF0', border: '#F4C0D1', color: '#D4537E' },
        '玩': { bg: '#E6F1FB', border: '#B8D4F0', color: '#185FA5' },
        '購': { bg: '#EAF3DE', border: '#B8D9A0', color: '#3B6D11' },
        '行': { bg: '#FAEEDA', border: '#F0C990', color: '#854F0B' },
        '住': { bg: '#F1EFE8', border: '#D4CFBF', color: '#5F5E5A' },
        '醫': { bg: '#FCEBEB', border: '#F0B8B8', color: '#A32D2D' },
        '史': { bg: '#F1EFE8', border: '#D4CFBF', color: '#5F5E5A' },
        '景': { bg: '#EAF3DE', border: '#B8D9A0', color: '#3B6D11' },
        '泉': { bg: '#E6F1FB', border: '#B8D4F0', color: '#185FA5' },
    };

    // 🚀 第一個分類預設 active
    const firstCat = visibleCats[0] || '食';
    const firstStyle = catColors[firstCat];

    const renderChip = (cat, isActive = false, isHidden = false) => {
        const s = catColors[cat] || { bg: '#F1EFE8', border: '#D4CFBF', color: '#5F5E5A' };
        return `
        <div onclick="viewEngine._selectAddCat(this, '${cat}')"
             data-cat="${cat}"
             style="padding: 8px 16px; border-radius: 999px; cursor: pointer;
                    transition: all 0.15s; white-space: nowrap;
                    display: ${isHidden ? 'none' : 'inline-flex'};
                    align-items: center; gap: 6px;
                    border: 1.5px solid ${isActive ? s.border : 'var(--color-border-tertiary)'};
                    background: ${isActive ? s.bg : 'var(--color-background-primary)'};
                    font-size: 15px; font-weight: ${isActive ? '700' : '500'};
                    color: ${isActive ? s.color : 'var(--color-text-secondary)'};">
            <span style="width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0;
                         background: ${isActive ? s.color : '#CBD5E1'};
                         transition: all 0.15s;"></span>
            ${cat}
        </div>`;
    };

    return `
        <div style="display: flex; flex-direction: column; gap: 18px; padding-bottom: 8px;">

            <!-- 模式切換 -->
            <div style="display: flex; border-radius: 12px; overflow: hidden;
                        border: 1px solid var(--color-border-tertiary);">
                <button onclick="viewEngine.toggleImportMode('single')" id="mode-single"
                        style="flex: 1; padding: 10px; border: none; border-right: 1px solid var(--color-border-tertiary);
                               font-size: 14px; font-weight: 600; cursor: pointer;
                               background: #D4537E; color: white;">單筆採集</button>
                <button onclick="viewEngine.toggleImportMode('batch')" id="mode-batch"
        style="flex: 1; padding: 10px; border: none;
               font-size: 14px; font-weight: 500; cursor: pointer;
               background: #F1F5F9;  <!-- 🚀 改這裡，不是 primary -->
               color: var(--color-text-secondary);">批量注入</button>
            </div>

            <!-- 城市 -->
            <div>
                <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">城市</p>
                <div id="city-display-row"
                     style="display: flex; align-items: center; gap: 10px; padding: 12px 14px;
                            border-radius: 12px; background: var(--color-background-secondary);
                            border: 1px solid var(--color-border-tertiary);">
                    <i class="fa-solid fa-location-dot" style="font-size: 15px; color: #D4537E;" aria-hidden="true"></i>
                    <span id="city-display-val"
                          style="font-size: 16px; font-weight: 600; color: var(--color-text-primary); flex: 1;">
                        ${activeCity || '未設定'}
                    </span>
                    <span style="font-size: 12px; color: var(--color-text-secondary);">行程偵測</span>
                    <span onclick="viewEngine._toggleCityEdit()"
                          style="font-size: 13px; color: #D4537E; cursor: pointer; font-weight: 500; margin-left: 4px;">修改</span>
                </div>
                <input type="text" id="backlog-city" value="${activeCity}"
                       style="display: none; margin-top: 8px; width: 100%; padding: 12px 14px;
                              border-radius: 12px; border: 1.5px solid #F4C0D1;
                              background: var(--color-background-primary); font-size: 16px;
                              color: var(--color-text-primary); outline: none; box-sizing: border-box;">
            </div>

            <!-- 分類 -->
            <div>
                <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">分類</p>
                <div id="cat-selector" data-selected="${firstCat}"
                     style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                    ${visibleCats.map((c, i) => renderChip(c, i === 0)).join('')}
                    ${hiddenCats.map(c => renderChip(c, false, true)).join('')}
                    ${hiddenCats.length > 0 ? `
                    <button id="cat-expand-btn" onclick="viewEngine._toggleCatExpand()"
                            style="padding: 8px 14px; border-radius: 999px;
                                   border: 1.5px solid var(--color-border-tertiary);
                                   background: var(--color-background-primary);
                                   font-size: 14px; color: var(--color-text-secondary);
                                   cursor: pointer; white-space: nowrap; font-weight: 500;">
                        +${hiddenCats.length}
                    </button>` : ''}
                </div>
            </div>

<!-- 單筆表單 -->
<div id="import-single-container" style="display: block;">
    <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">店名 / 景點名稱</p>
    <input type="text" id="backlog-name"
           placeholder="例如：Fuglen Fukuoka"
           style="width: 100%; padding: 14px 16px; border-radius: 12px;
                  border: 1.5px solid #E2E8F0;
                  background: #F1F5F9;
                  font-size: 16px; color: var(--color-text-primary);
                  outline: none; box-sizing: border-box;">
</div>

<!-- 批量表單 -->
<div id="import-batch-container" style="display: none;">
    <p style="font-size: 13px; font-weight: 500; color: var(--color-text-secondary); margin-bottom: 8px;">多筆靈感（一行一筆）</p>
    <textarea id="backlog-batch-input" rows="6"
              oninput="viewEngine._checkBatchDedup(this)"
              placeholder="Weekenders Coffee&#10;建仁寺&#10;錦市場"
              style="width: 100%; padding: 14px 16px; border-radius: 12px;
                     border: 1.5px solid #E2E8F0;
                     background: #F1F5F9;
                     font-size: 16px; color: var(--color-text-primary); outline: none;
                     box-sizing: border-box; resize: none; line-height: 1.8;"></textarea>
    <div id="batch-dedup-hint"
         style="display: none; margin-top: 8px; font-size: 13px;
                color: var(--color-text-secondary); padding: 10px 12px;
                background: #F1F5F9; border-radius: 10px; line-height: 1.6;"></div>
</div>

        </div>`;
},

_selectAddCat(el, cat) {
    // 🚀 先清掉所有晶片的 active 樣式
    const catColors = {
        '食': { bg: '#FBEAF0', border: '#F4C0D1', color: '#D4537E' },
        '玩': { bg: '#E6F1FB', border: '#B8D4F0', color: '#185FA5' },
        '購': { bg: '#EAF3DE', border: '#B8D9A0', color: '#3B6D11' },
        '行': { bg: '#FAEEDA', border: '#F0C990', color: '#854F0B' },
        '住': { bg: '#F1EFE8', border: '#D4CFBF', color: '#5F5E5A' },
        '醫': { bg: '#FCEBEB', border: '#F0B8B8', color: '#A32D2D' },
        '史': { bg: '#F1EFE8', border: '#D4CFBF', color: '#5F5E5A' },
        '景': { bg: '#EAF3DE', border: '#B8D9A0', color: '#3B6D11' },
        '泉': { bg: '#E6F1FB', border: '#B8D4F0', color: '#185FA5' },
    };

    document.querySelectorAll('#cat-selector [data-cat]').forEach(c => {
        c.style.background = 'var(--color-background-primary)';
        c.style.border = '1.5px solid var(--color-border-tertiary)';
        c.style.color = 'var(--color-text-secondary)';
        c.style.fontWeight = '500';
        const dot = c.querySelector('span');
        if (dot) dot.style.background = '#CBD5E1';
    });

    // 🚀 套上選取的顏色
    const s = catColors[cat] || { bg: '#F1EFE8', border: '#D4CFBF', color: '#5F5E5A' };
    el.style.background = s.bg;
    el.style.border = `1.5px solid ${s.border}`;
    el.style.color = s.color;
    el.style.fontWeight = '700';
    const dot = el.querySelector('span');
    if (dot) dot.style.background = s.color;

    // 🚀 更新 dataset
    document.getElementById('cat-selector').dataset.selected = cat;
},

_toggleCityEdit() {
    const row = document.getElementById('city-display-row');
    const input = document.getElementById('backlog-city');
    const isEditing = input.style.display !== 'none';
    if (isEditing) {
        // 收起：同步顯示值
        document.getElementById('city-display-val').textContent = input.value || '未設定';
        row.style.display = 'flex';
        input.style.display = 'none';
    } else {
        row.style.display = 'none';
        input.style.display = 'block';
        input.focus();
    }
},

_toggleCatExpand() {
    const selector = document.getElementById('cat-selector');
    const allChips = selector.querySelectorAll('[data-cat]');
    const btn = document.getElementById('cat-expand-btn');
    const isExpanded = btn.dataset.expanded === 'true';

    // 🚀 第5個之後的全部切換
    allChips.forEach((chip, idx) => {
        if (idx >= 5) {
            chip.style.display = isExpanded ? 'none' : 'inline-flex';
        }
    });

    btn.dataset.expanded = isExpanded ? 'false' : 'true';
    btn.textContent = isExpanded ? `+${allChips.length - 5}` : '收起';
},

_checkBatchDedup(ta) {
    const lines = ta.value.split('\n').map(l => l.trim()).filter(Boolean);
    const hint = document.getElementById('batch-dedup-hint');
    if (!lines.length) { hint.style.display = 'none'; return; }

    const existing = new Set((window.backlogManager?.items || []).map(i => i.name?.trim().toLowerCase()));
    const dupes = lines.filter(l => existing.has(l.toLowerCase()));

    hint.style.display = 'block';
    if (dupes.length > 0) {
        hint.innerHTML = `<span style="display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:2px 7px; border-radius:999px; background:#FAEEDA; color:#854F0B;">
            <i class="fa-solid fa-triangle-exclamation" style="font-size:10px;" aria-hidden="true"></i> ${dupes.length} 筆重複
        </span>　${dupes.slice(0, 3).join('、')}${dupes.length > 3 ? '...' : ''} 匯入時將自動跳過`;
    } else {
        hint.innerHTML = `<span style="display:inline-flex; align-items:center; gap:4px; font-size:11px; padding:2px 7px; border-radius:999px; background:#EAF3DE; color:#3B6D11;">
            <i class="fa-solid fa-circle-check" style="font-size:10px;" aria-hidden="true"></i> ${lines.length} 筆
        </span>　全部為新資料`;
    }
},

toggleImportMode(mode) {
    const single = document.getElementById('import-single-container');
    const batch = document.getElementById('import-batch-container');
    const btnS = document.getElementById('mode-single');
    const btnB = document.getElementById('mode-batch');

    if (!single || !batch) {
        console.warn("⚠️ [UI-Wait] 輸入容器尚未掛載");
        return;
    }

    if (mode === 'batch') {
        single.style.display = 'none';
        batch.style.display = 'block';
        // 🚀 顏色對齊初始值
        btnB.style.background = '#D4537E';
        btnB.style.color = 'white';
        btnB.style.fontWeight = '600';
        btnS.style.background = '#F1F5F9';
        btnS.style.color = 'var(--color-text-secondary)';
        btnS.style.fontWeight = '500';
    } else {
        single.style.display = 'block';
        batch.style.display = 'none';
        btnS.style.background = '#D4537E';
        btnS.style.color = 'white';
        btnS.style.fontWeight = '600';
        btnB.style.background = '#F1F5F9';
        btnB.style.color = 'var(--color-text-secondary)';
        btnB.style.fontWeight = '500';
    }
},



_renderAddBacklogActions() {
    return `
        <button onclick="App.modalRemove('add-backlog-modal')"
                style="flex: 1; padding: 11px; border-radius: 12px;
                       border: 0.5px solid var(--color-border-tertiary);
                       background: var(--color-background-secondary);
                       font-size: 13px; font-weight: 500;
                       color: var(--color-text-secondary); cursor: pointer;">
            取消
        </button>
        <button onclick="viewEngine.handleBacklogSubmission()"
                style="flex: 2; padding: 11px; border-radius: 12px; border: none;
                       background: #D4537E; color: white;
                       font-size: 13px; font-weight: 500; cursor: pointer;">
            儲存靈感
        </button>`;
},

handleBacklogSubmission() {
    const batchContainer = document.getElementById('import-batch-container');
    // 🚀 修正1：改用 style.display 判斷，不用 classList
    const isBatch = batchContainer && batchContainer.style.display !== 'none';

    // 🚀 修正2：城市統一從 backlog-city input 讀（修改模式）或 display val（未修改）
    const cityInput = document.getElementById('backlog-city');
    const cityDisplay = document.getElementById('city-display-val');
    const city = (cityInput?.style.display !== 'none' 
        ? cityInput?.value 
        : cityDisplay?.textContent) || '未分類';

    // 🚀 修正3：分類統一從 dataset 讀
    const cat = document.getElementById('cat-selector')?.dataset.selected || '食';

    if (isBatch) {
        const rawText = document.getElementById('backlog-batch-input')?.value.trim();
        if (!rawText) return uiManager.showToast('⚠️', '請注入燃料字串');
        App.addBatchBacklogRecords(rawText, city, cat);
    } else {
        const name = document.getElementById('backlog-name')?.value.trim();
        if (!name) return uiManager.showToast('⚠️', '請輸入店名燃料');
        // 🚀 修正4：新版沒有 info 欄位，傳空字串
        App.addBacklogRecord(name, city, '', cat);
    }

    App.modalRemove('add-backlog-modal');
},

/** 🧬 [Shared-Component] 渲染模組空值狀態 (V2026.ULTRA 通用自癒版) */
_renderEmptyState(label) {
    // 🚀 數據純化：確保 label 具備視覺質感
    const displayLabel = String(label || 'Sector').toUpperCase();
    
    // 🚀 語義自癒：根據關鍵字自動匹配 Icon
    let icon = '📡';
    if (displayLabel.includes('MED')) icon = '🏥';
    if (displayLabel.includes('EXPENSE')) icon = '💰';
    if (displayLabel.includes('BACKLOG')) icon = '🏭';

    return `
        <div class="py-24 px-6 text-center animate-fade-in border-2 border-dashed border-slate-100 rounded-[3rem] mx-4 bg-slate-50/30">
            <div class="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-slate-50">
                <div class="relative">
                    <span class="text-3xl grayscale opacity-30">${icon}</span>
                    <div class="absolute inset-0 text-3xl animate-ping opacity-10">${icon}</div>
                </div>
            </div>
            <div class="space-y-2">
                <p class="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">Data Vacuum Detected</p>
                <h4 class="text-[15px] font-black text-slate-700 tracking-tight">[ ${displayLabel} ]</h4>
                <p class="text-[9px] text-slate-400 italic">燃料磁區真空，請執行數據同步</p>
            </div>
        </div>`;
},

// ==================
//   自選json匯出
// ==================


/** 🧬 [Refinery-Filter] 數據封裝選擇器 2.0 (動態展開版) */
_renderExportFilterContent() {
    const modules = [
        { id: 'flights', name: '航班資訊', icon: '✈️', sub: '航網數據' },
        { id: 'hotels', name: '飯店資訊', icon: '🏨', sub: '下榻磁區' },
        { id: 'itinerary', name: '自選行程 (Day1-N)', icon: '📅', sub: '路網節點' },
        { id: 'packing', name: '攜帶清單', icon: '🎒', sub: '裝備零件' },
        { id: 'realtime', name: '即時翻譯', icon: '🎙️', sub: '語音快取' },
        { id: 'training', name: '特訓小卡', icon: '🔥', sub: '強化記憶' },
        { id: 'contextual', name: '情境翻譯', icon: '📖', sub: '語義燃料' },
        { id: 'shopping', name: '購物清單', icon: '🛒', sub: '採購清單' },
        { id: 'emergency', name: '緊急清單', icon: '🆘', sub: '救援密鑰' },
        { id: 'backlog', name: '靈感小卡', icon: '🏭', sub: '原子燃料' }
    ];

    const currentFilter = JSON.parse(localStorage.getItem('tf_export_whitelist')) || modules.map(m => m.id);

    return `
    <div class="space-y-4 max-h-[65vh] overflow-y-auto pr-1 custom-scrollbar text-left pb-4 animate-fade-in">
        ${modules.map(mod => {
            const isChecked = currentFilter.includes(mod.id);
            return `
            <div class="export-module-wrapper border-2 rounded-[2rem] transition-all duration-300 overflow-hidden ${isChecked ? 'border-pink-200 bg-white' : 'border-slate-50 bg-slate-50/50'}" id="wrapper-${mod.id}">
                
                <label class="flex items-center justify-between p-5 cursor-pointer active:scale-[0.99] transition-all">
                    <div class="flex items-center gap-4">
                        <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl transition-all ${isChecked ? 'bg-pink-50' : 'bg-white grayscale'}">${mod.icon}</div>
                        <div>
                            <span class="text-[14px] font-black ${isChecked ? 'text-slate-800' : 'text-slate-400'}">${mod.name}</span>
                            <p class="text-[9px] font-bold uppercase tracking-widest ${isChecked ? 'theme-text-pink' : 'text-slate-300'}">${mod.sub}</p>
                        </div>
                    </div>
                    
                    <div class="relative inline-flex items-center">
                        <input type="checkbox" value="${mod.id}" ${isChecked ? 'checked' : ''} 
                               class="export-module-check hidden peer" 
                               onchange="App.toggleExportSubList('${mod.id}', this.checked)">
                        <div class="w-12 h-7 bg-slate-200 rounded-full peer peer-checked:bg-pink-500 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-[20px] after:w-[20px] after:transition-all peer-checked:after:translate-x-5 shadow-inner"></div>
                    </div>
                </label>

                <div id="sub-list-${mod.id}" class="px-5 pb-5 space-y-2 animate-slide-down ${isChecked ? 'block' : 'hidden'}">
                    ${this._renderModuleSubItems(mod.id)}
                </div>
            </div>`;
        }).join('')}
    </div>`;
},

/** 🧪 渲染模組內部的細部選項 (子項目選取 - V2026.ULTRA 全模組對焦版) */
// 💡 職人診斷：如果從記憶體撈不到，就直接穿透資料庫，封殺非同步真空。
_renderModuleSubItems(modId) {
    const trip = state.trips.find(t => t.id === state.activeTripId);
    if (!trip) return `<p class="text-[10px] text-slate-300 italic px-2">未定位行程數據</p>`;

    let items = [];

    // 🚀 核心焊接：針對 10 類數據基因執行精確對位
    switch(modId) {
        case 'flights': 
            items = (trip.transport || []).map((f, i) => ({
                id: `flight-${i}`,
                label: `D${f.day} ${f.depPort}→${f.arrPort}`
            })); 
            break;
            
        case 'hotels': 
            items = (trip.hotels || []).map((h, i) => ({
                id: `hotel-${i}`,
                label: h.name
            })); 
            break;

        case 'itinerary': 
            items = (trip.days || []).map((d, idx) => ({
                id: `day-${idx}`,
                label: `Day ${idx + 1}: ${d.schedules?.length || 0} 個行程點`
            }));
            break;

case 'packing': 
    // 🚀 1. 數據主權導通：使用熱機後的物理回收磁區
    // 💡 職人診斷：window.state.checklistItems 已於 openExportFilterModal 階段完成對位
    const itemsFuel = window.state?.checklistItems || trip.checklistItems || [];
    
    // 🚀 2. 原子分類感應：從 6 筆實體中萃取分類指紋
    const activeCats = [...new Set(itemsFuel.map(i => i.category))].filter(Boolean);

    if (itemsFuel.length > 0) {
        // 模式 A：分子級導通 (精確對應 6 筆零件)
        items = activeCats.sort().map(cat => {
            const group = itemsFuel.filter(i => i.category === cat);
            // 💡 職人美學：若只有 1 項則直接顯示，超過才加省略號
            const preview = group.slice(0, 1).map(i => i.task || i.text).join(', ');
            const suffix = group.length > 1 ? '...' : '';
            
            return {
                id: `pack-cat-${cat}`, // 🚀 物理 ID 對齊：確保 _washPacking 能執行精確洗滌
                label: `🎒 ${cat} (${group.length} 項)：${preview}${suffix}`
            };
        });
        
        // 增加全量開關：動態顯示總原子量
        items.unshift({ id: 'pack-all', label: `⚡ 全量導通：封裝完整 ${itemsFuel.length} 筆裝備零件` });
    } else {
        // 模式 B：磁區真空保護
        items = [
            { id: 'pack-all', label: '📖 預約導通：自動同步資料庫中的物品清單' }
        ];
    }
    break;


case 'realtime':
    // 🚀 1. 數據穿透：從全量快照中提取「非情境類」數據
    // 💡 職人診斷：將 index 0-8 的新聞、歌詞、劇本全數網捕
    const allTrans = window.state?.allTranslations || [];
    const realtimeFuel = allTrans.filter(item => item.type === 'article_package' || item.edu_vocab);

    if (realtimeFuel.length > 0) {
        // 🚀 2. 數據焊接：依據標題或內容生成子項
        items = realtimeFuel.slice(0, 15).map((h, i) => ({
            id: `rt-item-${h.id || i}`,
            // 💡 職人美學：區分新聞與歌詞的視覺標籤
            label: `🎙️ [${h.category || '語料'}] ${h.title?.substring(0, 15) || h.original?.substring(0, 15)}...`
        }));
        
        // 額外追加「全量導通」開關
        items.unshift({ id: 'rt-all', label: '🔥 全量導通：同步所有即時/新聞翻譯語料' });
    } else {
        // 🛡️ 降級保護：若磁區真空，則提供功能性預約
        items = [
            { id: 'rt-all', label: '🎙️ 同步未來產出的即時翻譯 (自動導通)' },
            { id: 'rt-starred', label: '⭐ 同步已收藏的常用語句' }
        ];
    }
    break;

case 'training': 
    // 🚀 1. 主權回歸：鎖定真正的特訓固化磁區 (SRS)
    // 💡 職人診斷：排除 translationVault 的單字/測驗零件，回歸 26 筆真值
    const srsData = window.state?.srsMetadata || [];
    const srsCount = srsData.length;

    if (srsCount > 0) {
        // 🚀 2. 數據分組：按類型 (單字/測驗) 統計固化燃料
        const vocabSrs = srsData.filter(i => i.type === '單字').length;
        const quizSrs = srsData.filter(i => i.type === '測驗').length;

        items = [
            { 
                id: 'train-srs-all', 
                label: `🔥 已固化特訓進度 (共 ${srsCount} 筆)` 
            },
            { 
                id: 'train-srs-vocab', 
                label: `└ 🎴 熟練度單字：${vocabSrs} 筆` 
            },
            { 
                id: 'train-srs-quiz', 
                label: `└ 📝 實戰模擬題：${quizSrs} 筆` 
            }
        ];
    } else {
        // 🛡️ 磁區真空保護
        items = [{ id: 'train-hint', label: '📍 尚未發現固化特訓燃料 (請執行同步程序)' }];
    }
    break;


case 'contextual':
    // 🚀 1. 數據源精密對焦：鎖定 type: 'contextual' 且具備 q/a 基因的語料
    // 💡 職人診斷：這能 100% 封殺 index 0-8 的新聞長文與歌詞
    const allTransFuel = window.state?.allTranslations || [];
    const conversationData = allTransFuel.filter(item => 
        item.type === 'contextual' || 
        (item.q && item.a && !item.edu_vocab)
    );

    // 🚀 2. 動態場景感應 (從 category 提取自訂分類)
    // 💡 職人美學：提取 交通、用餐、醫藥、購物 等實體標籤
    const dynamicCategories = [...new Set(conversationData.map(i => i.category || i.scene))].filter(Boolean);

    if (dynamicCategories.length > 0) {
        // 模式 A：場景分區導通
        items = dynamicCategories.sort().map(cat => ({
            id: `ctx-scene-${cat}`, // 🚀 物理 ID 對齊：確保洗滌器 _washContextual 能正確攔截
            label: `🗣️ ${cat} 實境對話 (${conversationData.filter(i => (i.category || i.scene) === cat).length} 筆)`
        }));
        
        // 額外追加全量導通開關
        items.unshift({ id: 'ctx-scene-all', label: '⚡ 全量導通：封裝此行程所有實境語料' });
    } else {
        // 模式 B：磁區真空保護
        // 💡 職人診斷：若無資料，提供預約導通標籤，防止 UI 渲染斷路
        items = [
            { id: 'ctx-scene-all', label: '📖 預約導通：自動同步未來生成的對話包' }
        ];
    }
    break;

case 'shopping':
    // 💡 職人診斷：執行深度「行程穿透掃描 (Cross-Day Scan)」
    const shopItems = [];
    
    (trip.days || []).forEach((day, dayIdx) => {
        (day.schedules || []).filter(s => s.style === 'shopping').forEach(s => {
            // 🚀 數據焊接：提領該購物點內部的品項清單
            // 假設資料結構為 s.shoppingList 或 s.items
            const subItems = (s.shoppingList || s.items || [])
                .map(item => item.name || item)
                .slice(0, 3); // 僅擷取前三項作為預覽標籤

            const previewText = subItems.length > 0 
                ? `: ${subItems.join(', ')}${subItems.length > 3 ? '...' : ''}` 
                : ' (未列清單)';

            shopItems.push({ 
                id: `shop-${s.id}`, 
                label: `🛒 D${dayIdx + 1} ${s.location}${previewText}` 
            });
        });
    });

    items = shopItems;

    // 🛡️ 降級保護：若行程內無購物節點，則嘗試從全域購物磁區提領
    if (items.length === 0) {
        const globalShopping = state.shoppingConfig?.items || [];
        if (globalShopping.length > 0) {
            items = [{ 
                id: 'shop-all', 
                label: `🛒 全域清單: 共 ${globalShopping.length} 項待購品` 
            }];
        } else {
            items = [{ id: 'shop-all', label: '🛒 預約導通：同步未來新增的購物需求' }];
        }
    }
    break;

case 'emergency':
    const v = trip.emergencyVault || {};
    // 💡 職人診斷：判斷是否為陣列，若是則執行預判
    const isArr = Array.isArray(v);
    
    const emgConfigs = [
        { 
            id: 'emg-medical', 
            label: '🏥 醫療/診所資訊', 
            hasData: isArr ? v.some(i => i.type === 'medical' || i.name?.includes('醫院')) : (v.medical?.length > 0)
        },
        { 
            id: 'emg-insurance', 
            label: '🛡️ 海外保險數據', 
            hasData: isArr ? v.some(i => i.type === 'insurance' || i.name?.includes('保險')) : !!v.insurance
        },
        { 
            id: 'emg-contact', 
            label: '🌍 緊急聯絡與辦事處', 
            hasData: isArr ? v.some(i => i.name?.includes('辦事處') || i.phone) : (v.contacts?.length > 0 || v.embassy?.length > 0)
        }
    ];

    items = emgConfigs.map(cfg => ({
        id: cfg.id,
        label: `${cfg.label}${cfg.hasData ? ' <span class="theme-text-pink">[READY]</span>' : ' <span class="opacity-30">(尚未配置)</span>'}`
    }));
    break;

case 'backlog':
            // 🚀 核心焊接：多重路徑網捕
            // 優先權：Manager 緩存 > 狀態快照 > (兜底) 宣告同步
            const rawBacklogs = (window.backlogManager?.items && window.backlogManager.items.length > 0) 
                ? window.backlogManager.items 
                : (window.state?.backlogs || []);

            const allCities = [...new Set(rawBacklogs.map(b => b.city))].filter(Boolean);
            
            if (allCities.length === 0) {
                // 🛠️ 如果此時還是 0，噴發「手動同步」按鈕而非死字
                return `
                    <div class="px-2 py-2">
                        <p class="text-[9px] theme-text-pink italic mb-2">📍 磁區熱機中 (緩存: ${rawBacklogs.length})</p>
                        <button onclick="App.navigateTo('backlog')" class="text-[8px] bg-slate-800 text-white px-2 py-1 rounded-md uppercase font-black">點火校準數據</button>
                    </div>`;
            }

            items = allCities.sort().map(cityName => ({
                id: `city-group-${cityName}`, 
                label: `📍 ${cityName} 磁區 (全部導通)`
            }));
            break;

        default:
            items = [{ id: 'all', label: '全量同步模組數據' }];
    }

    // 2. 執行物理渲染：對位主題配色與子項 Checkbox 指紋
    return items.map((item) => `
        <div class="flex items-center gap-3 p-3.5 bg-white/60 rounded-2xl border border-slate-100/50 hover:border-pink-200 transition-all group">
            <input type="checkbox" checked value="${item.id}" 
                   class="sub-item-check w-4 h-4 rounded border-slate-300 text-pink-500 focus:ring-pink-200 cursor-pointer">
            <span class="text-[11px] font-black text-slate-500 group-hover:text-slate-800 truncate">${item.label}</span>
        </div>
    `).join('') || `<p class="text-[10px] text-slate-300 italic px-2 py-2">※ 模組磁區真空，暫無細部內容</p>`;
}
  };


/** ☁️ [Backup Module] 備援中心視圖集群 (V2026.ULTRA 重構版) */
const backupView = {
    
/** 🚀 1. 核心進入點：主框架佈署 (導入 Tabs 分流架構) */
    renderMain(container, syncStatus) {
        if (!container) return;
        
        // 🚀 狀態感應：從真值來源獲取當前分頁，預設為 'cloud'
        const activeTab = localStorage.getItem('tf_backup_tab_focus') || 'cloud';

        const health = (typeof App.checkSyncHealth === 'function') 
            ? App.checkSyncHealth() 
            : { status: { label: '未對焦', icon: '❓' }, cloudTs: 0 };

        container.innerHTML = `
            <div class="backup-module animate-fade-in space-y-6 pb-40 px-2">
                <div class="px-4 mb-2">
                    <h2 class="text-2xl font-black text-slate-800 tracking-tight">數據備援中樞</h2>
                    <p class="text-[10px] font-black theme-text-pink uppercase tracking-widest mt-1 italic">
                        Data Redundancy & Shared Protocol
                    </p>
                </div>

                <!-- 🚀 核心焊接：三維 Tabs 切換器 -->
                <div class="flex p-1.5 bg-slate-100/80 rounded-[2.2rem] shadow-inner backdrop-blur-sm mx-2">
                    <button onclick="backupView.switchTab('cloud')" 
                            class="flex-1 py-3.5 rounded-[1.8rem] text-[11px] font-black transition-all ${activeTab === 'cloud' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400'}">
                        雲端備份
                    </button>
                    <button onclick="backupView.switchTab('share')" 
                            class="flex-1 py-3.5 rounded-[1.8rem] text-[11px] font-black transition-all ${activeTab === 'share' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400'}">
                        行程共享
                    </button>
                    <button onclick="backupView.switchTab('drive')" 
                            class="flex-1 py-3.5 rounded-[1.8rem] text-[11px] font-black transition-all ${activeTab === 'drive' ? 'bg-white text-slate-800 shadow-md' : 'text-slate-400'}">
                        Drive 備份
                    </button>
                </div>

                <!-- 🚀 內容分流注入區 -->
                <div id="backup-dynamic-slot" class="animate-fade-in">
                    ${this._dispatchSector(activeTab, syncStatus, health)}
                </div>
                
                <div id="sync-fingerprint-inspector" class="px-2 opacity-30">
                    ${viewEngine.renderFingerprintInspector ? viewEngine.renderFingerprintInspector(health) : ''}
                </div>
            </div>
        `;

        window.scrollTo({ top: 0, behavior: 'smooth' });
    },

    /** 🧬 2. 分流發動機：執行物理磁區嫁接 */
    _dispatchSector(tab, syncStatus, health) {
        switch(tab) {
            case 'share': 
                return `
                    <div class="space-y-6">
                        ${this._renderImportSector ? this._renderImportSector() : ''}
                        ${this._renderSharedSector ? this._renderSharedSector() : ''}
                    </div>`;
            case 'drive':
                return this._renderDriveSector();
            default: // cloud
                return this._renderFirebaseSector(syncStatus, health);
        }
    },

    /** 🔄 3. Tabs 物理切換動作 */
    switchTab(tab) {
        localStorage.setItem('tf_backup_tab_focus', tab);
        if (navigator.vibrate) navigator.vibrate(8);
        // 呼叫主指揮部重新導向，觸發 renderMain
        if (window.App) App.navigateTo('backup');
    },


/** 🌐 5. 私有組件：共享回流吸入器 (主題配色版) */
_renderImportSector() {
    return `
        <div class="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-50 space-y-5 relative overflow-hidden">
            <div class="absolute -right-4 -top-4 text-7xl opacity-[0.03] italic font-black theme-text-pink select-none pointer-events-none uppercase">Import</div>

            <!-- 頭部 -->
            <div class="flex justify-between items-start relative z-10">
                <div>
                    <h3 class="font-black text-slate-800 text-[16px] tracking-tight">匯入夥伴行程</h3>
                    <p class="text-[9px] theme-text-pink font-bold uppercase tracking-tighter mt-1 italic">P2P Node Recovery</p>
                </div>
                <div class="w-10 h-10 theme-bg/10 rounded-2xl flex items-center justify-center text-xl shadow-sm">📥</div>
            </div>

            <!-- 說明提示 -->
            <p class="text-[11px] text-slate-400 leading-relaxed relative z-10 px-1">
                輸入對方提供的共享代碼與密鑰，即可將行程匯入至「我的旅行」。
            </p>

            <!-- 輸入區 -->
            <div class="space-y-4 relative z-10">
                <div class="grid grid-cols-2 gap-3">
                    <div class="space-y-1.5 text-left">
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">共享代碼（8碼）</label>
                        <input type="text" id="direct-import-id" maxlength="8" placeholder="A1B2C3D4"
                               oninput="App._importCheckReady()"
                               class="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-black text-slate-700 shadow-inner outline-none ring-1 ring-slate-100 focus:ring-[var(--theme-primary)]/30 transition-all font-mono uppercase text-center tracking-[0.2em]">
                        <p id="import-id-hint" class="text-[9px] text-center h-3 transition-all"></p>
                    </div>
                    <div class="space-y-1.5 text-left">
                        <label class="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 block">存取密鑰（4碼）</label>
                        <input type="password" id="direct-import-passcode" maxlength="4" placeholder="••••"
                               oninput="App._importCheckReady()"
                               class="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-black text-slate-700 shadow-inner outline-none ring-1 ring-slate-100 focus:ring-[var(--theme-primary)]/30 transition-all text-center tracking-[0.5em]">
                        <p id="import-pass-hint" class="text-[9px] text-center h-3 transition-all"></p>
                    </div>
                </div>

                <button id="import-fire-btn" disabled
                        onclick="App.executeDirectImport()"
                        class="w-full py-5 rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all bg-slate-100 text-slate-400 cursor-not-allowed">
                    匯入共享行程
                </button>

                <p class="text-[10px] text-slate-400 text-center italic font-medium px-4">
                    ※ 匯入後將在「我的旅行」列表新增獨立行程磁區。
                </p>
            </div>
        </div>
    `;
},


/** 📊 1. Firebase 雲端看板 (主控發動機 - V2026.ULTRA) */
_renderFirebaseSector(syncStatus, health) {
    const cloudStats = state.cloudStats || {};
    const cloudTimeRelative = health.cloudTs > 0
        ? (() => {
            const diff = Date.now() - health.cloudTs;
            const mins = Math.floor(diff / 60000);
            const hrs = Math.floor(diff / 3600000);
            const days = Math.floor(diff / 86400000);
            if (mins < 1) return '剛剛';
            if (mins < 60) return `${mins} 分鐘前`;
            if (hrs < 24) return `${hrs} 小時前`;
            return `${days} 天前`;
        })()
        : '尚未同步';

    const syncLabel = health.status?.label || '未知';
    const isOk = syncLabel === '已同步';
    const syncBadge = `
        <div class="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[9px] font-black
                     ${isOk ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}">
            <span>${isOk ? '✓' : '!'}</span>
            <span>${syncLabel}</span>
        </div>`;

    setTimeout(async () => {
        try {
            const [transVault, backlogItems, srsItems] = await Promise.all([
                dbManager.getAll(dbManager.STORES.TRANS_VAULT),
                dbManager.getAll(dbManager.STORES.BACKLOG),
                dbManager.getAll(dbManager.STORES.SRS_META)
            ]);
            const localStats = {
                tripCount:       state.trips?.length || 0,
                realtimeCount:   transVault.filter(i => i.type === 'article_package' || (!i.type && i.segments)).length,
                contextualCount: transVault.filter(i => i.type === 'contextual').length,
                srsCount:        srsItems?.length || 0,
                backlogCount:    backlogItems?.length || 0,
                emergencyCount:  state.trips?.reduce((acc, t) => acc + (t.emergencyVault?.length || 0), 0) || 0,
                shoppingCount:   state.trips?.reduce((acc, t) => acc + (t.shopping?.length || 0), 0) || 0,
                checklistCount:  state.trips?.reduce((acc, t) => acc + (t.checklist?.length || 0), 0) || 0, // 🚀 [修正]
            };
            const slot = document.getElementById('cloud-stats-matrix-slot');
            if (slot) slot.innerHTML = this._renderStatsMatrix(cloudStats, localStats);
        } catch (e) {
            console.error('❌ [StatsMatrix] 本地數據提領失敗:', e);
        }
    }, 0);

    return `
        <div class="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-50 space-y-6 relative overflow-hidden animate-fade-in">
            ${this._renderSectorHeader('雲端備份', '資料同步與還原管理', '☁️', syncBadge)}
            ${this._renderAuthSection()}
            <div id="cloud-stats-matrix-slot">
                <div class="rounded-[1.8rem] border border-slate-100 p-6 text-center">
                    <p class="text-[11px] text-slate-400">資料讀取中...</p>
                </div>
            </div>
            ${this._renderSyncTimestamp(cloudTimeRelative)}
            ${this._renderCloudActions()}
        </div>
    `;
},


/** 🧬 2. 子組件：看板通用頭部 (Reusable Header) */
_renderSectorHeader(title, subtitle, icon, syncBadge = '') {
    return `
        <div class="flex justify-between items-center px-1">
            <div class="flex-1 min-w-0">
                <h3 class="font-black text-slate-800 text-[16px] tracking-tight">${title}</h3>
                <p class="text-[9px] text-slate-400 font-bold uppercase tracking-widest mt-1 italic">${subtitle}</p>
            </div>
            <div class="flex items-center gap-3 ml-3">
                ${syncBadge}
                <div class="w-11 h-11 theme-bg text-white rounded-2xl flex items-center justify-center text-xl shadow-lg shadow-pink-100 flex-shrink-0">${icon}</div>
            </div>
        </div>`;
},

/** 👤 3. 子組件：身分驗證磁區 (Auth Handler) */
_renderAuthSection() {
    if (!state.userProfile) {
        return `
            <button onclick="App.login()" 
                    class="w-full py-4 bg-slate-800 text-white rounded-[2rem] font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-all">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" class="w-5 h-5">
                使用 Google 帳號登入
            </button>`;
    }

    return `
        <div class="flex items-center gap-3 p-4 bg-slate-50 rounded-[2rem] border border-slate-100 animate-fade-in">
            <img src="${state.userProfile.photo}" 
                 class="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0">
            <div class="flex-1 min-w-0">
                <p class="text-[13px] font-black text-slate-700 truncate">${state.userProfile.name}</p>
                <p class="text-[9px] theme-text-pink font-black uppercase tracking-widest mt-0.5">已連線</p>
            </div>
            <button onclick="App.logout()" 
                    class="text-[10px] font-black text-rose-500 bg-white border border-rose-100 px-3 py-2 rounded-xl active:scale-95 transition-all flex-shrink-0">
                登出
            </button>
        </div>`;
},

/** 🧮 4. 子組件：數據量化矩陣 (Matrix) */
_renderStatsMatrix(stats, localStats = null) {
    const local = localStats || {
        tripCount:       state.trips?.length || 0,
        realtimeCount:   0,
        contextualCount: 0,
        srsCount:        state.srsMetadata?.length || 0,
        backlogCount:    0,
        emergencyCount:  state.trips?.reduce((acc, t) => acc + (t.emergencyVault?.length || 0), 0) || 0,
        shoppingCount:   state.trips?.reduce((acc, t) => acc + (t.shopping?.length || 0), 0) || 0,
        checklistCount:  state.trips?.reduce((acc, t) => acc + (t.checklist?.length || 0), 0) || 0, // 🚀 [修正]
    };

    const cloud = {
        tripCount:        stats.tripCount || 0,
        realtimeCount:    stats.realtimeCount || 0,
        contextualCount:  stats.contextualCount || 0,
        srsCount:         stats.srsCount || 0,
        backlogCount:     stats.backlogCount || 0,
        emergencyCount:   stats.emergencyCount || 0,
        shoppingCount:    stats.shoppingCount || 0,
        checklistCount:   stats.checklistCount || 0,
    };

    const rows = [
        { label: '行程',     icon: '📍', localVal: local.tripCount,       cloudVal: cloud.tripCount },
        { label: '即時翻譯', icon: '📖', localVal: local.realtimeCount,   cloudVal: cloud.realtimeCount },
        { label: '情境翻譯', icon: '💬', localVal: local.contextualCount, cloudVal: cloud.contextualCount },
        { label: '特訓小卡', icon: '🎯', localVal: local.srsCount,        cloudVal: cloud.srsCount },
        { label: '靈感清單', icon: '💡', localVal: local.backlogCount,    cloudVal: cloud.backlogCount },
        { label: '緊急救援', icon: '🆘', localVal: local.emergencyCount,  cloudVal: cloud.emergencyCount },
        { label: '購物清單', icon: '🛍️', localVal: local.shoppingCount,   cloudVal: cloud.shoppingCount },
        { label: '打包清單', icon: '🧳', localVal: local.checklistCount,  cloudVal: cloud.checklistCount },
    ];

    const rowsHtml = rows.map(r => {
        const diff = r.localVal - r.cloudVal;
        const hasWarning = diff !== 0;
        const localColor = diff > 0
            ? 'text-amber-600 font-black'
            : diff < 0
            ? 'text-rose-500 font-black'
            : 'text-slate-700 font-black';
        const arrow = diff > 0 ? '↑' : diff < 0 ? '↓' : '';

        return `
            <div class="grid grid-cols-[1fr_56px_56px] items-center px-4 py-3
                        border-b border-slate-100 last:border-0
                        ${hasWarning ? 'bg-amber-50/40' : ''}">
                <div class="flex items-center gap-2">
                    <span class="text-sm">${r.icon}</span>
                    <span class="text-[12px] text-slate-600">${r.label}</span>
                </div>
                <div class="text-center">
                    <span class="text-[13px] tabular-nums ${localColor}">${r.localVal}</span>
                    ${arrow ? `<span class="text-[10px] ${localColor} ml-0.5">${arrow}</span>` : ''}
                </div>
                <span class="text-[13px] tabular-nums text-slate-400 text-center">${r.cloudVal}</span>
            </div>`;
    }).join('');

    const diffRows = rows.filter(r => r.localVal !== r.cloudVal);
    const warningHtml = diffRows.length > 0 ? `
        <div class="mt-3 flex items-start gap-2 bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100">
            <span class="text-sm flex-shrink-0 mt-0.5">⚠️</span>
            <p class="text-[10px] text-amber-800 leading-relaxed">
                ${diffRows.map(r => {
                    const diff = r.localVal - r.cloudVal;
                    return `${r.label}本地比雲端${diff > 0 ? `多 ${diff}` : `少 ${Math.abs(diff)}`} 筆`;
                }).join('，')}。建議先備份再還原。
            </p>
        </div>` : `
        <div class="mt-3 flex items-center gap-2 bg-emerald-50 rounded-2xl px-4 py-3 border border-emerald-100">
            <span class="text-sm">✅</span>
            <p class="text-[10px] text-emerald-700 font-black">本地與雲端資料完全一致</p>
        </div>`;

    return `
        <div>
            <div class="rounded-[1.8rem] border border-slate-100 overflow-hidden">
                <div class="grid grid-cols-[1fr_56px_56px] px-4 py-2.5 bg-slate-50 border-b border-slate-100">
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider">資料類型</span>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">本地</span>
                    <span class="text-[9px] font-black text-slate-400 uppercase tracking-wider text-center">雲端</span>
                </div>
                ${rowsHtml}
            </div>
            ${warningHtml}
        </div>`;
},

/** ⏱️ 5. 子組件：同步時戳 (Sync Status) */
_renderSyncTimestamp(timeStr) {
    return `
        <div class="flex items-center justify-between px-4 py-3 bg-slate-50 rounded-2xl border border-slate-100">
            <div class="flex items-center gap-2">
                <span class="text-sm">🕐</span>
                <span class="text-[11px] text-slate-400 font-black uppercase tracking-wider">上次同步</span>
            </div>
            <span class="text-[12px] font-black text-slate-600 tabular-nums">${timeStr}</span>
        </div>`;
},

/** 🎮 6. 子組件：操作按鈕群 (Actions) */
_renderCloudActions() {
    return `
        <div class="space-y-3 pt-1">
            <div class="grid grid-cols-2 gap-3">
                <button onclick="App._showRestoreConfirm()"
                        class="py-4 bg-slate-100 text-slate-600 rounded-[2rem] font-black text-[11px] active:scale-95 transition-all flex items-center justify-center gap-2">
                    ⬇️ 從雲端還原
                </button>
                <button onclick="App.triggerFirebaseSync()"
                        class="py-4 theme-bg text-white rounded-[2rem] font-black text-[11px] shadow-lg shadow-pink-100/50 active:scale-95 transition-all flex items-center justify-center gap-2">
                    ⬆️ 備份到雲端
                </button>
            </div>

            <!-- 還原二次確認區（預設隱藏） -->
            <div id="restore-confirm-zone" class="hidden bg-rose-50 rounded-[2rem] px-5 py-4 border border-rose-100 space-y-3 animate-fade-in">
                <p class="text-[11px] text-rose-700 leading-relaxed">
                    ⚠️ 還原會以雲端資料覆蓋本地所有資料，此操作無法復原，確定要繼續嗎？
                </p>
                <div class="grid grid-cols-2 gap-3">
                    <button onclick="App._hideRestoreConfirm()"
                            class="py-3 bg-white text-slate-400 rounded-[2rem] font-black text-[11px] border border-slate-100 active:scale-95 transition-all">
                        取消
                    </button>
                    <button onclick="App.syncFromCloud()"
                            class="py-3 bg-rose-500 text-white rounded-[2rem] font-black text-[11px] active:scale-95 transition-all">
                        確認還原
                    </button>
                </div>
            </div>
        </div>`;
},


/** 🌐 4. 私有組件：共享磁區佈署器 (V2026.ULTRA 步驟精靈版) */
_renderSharedSector() {
    const trips = state.trips || [];
    const tripOptions = trips.map(t => 
        `<option value="${t.id}">${t.name} (${t.city || '未知'})</option>`
    ).join('');

    return `
        <div class="bg-white rounded-[3rem] p-8 shadow-sm border border-slate-50 mt-8" id="shared-sector-root">

            <!-- 頭部 -->
            <div class="flex justify-between items-center mb-7">
                <div>
                    <h3 class="font-black text-slate-800 text-[15px]">行程共享投射</h3>
                    <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">Shared Zone P2P</p>
                </div>
                <button onclick="App.openMySharedManager()" 
                        class="px-4 py-2 bg-slate-50 text-slate-400 rounded-xl text-[10px] font-black uppercase border border-slate-100 active:scale-95 transition-all shadow-sm flex items-center gap-2">
                    📋 管理分享
                </button>
            </div>

            <!-- 步驟指示器 -->
            <div class="relative flex items-start justify-between mb-7 px-2">
                <div class="absolute top-[14px] left-[10%] right-[10%] h-[1px] bg-slate-100 z-0"></div>
                ${[
                    { n: 1, label: '選擇行程' },
                    { n: 2, label: '封裝設定' },
                    { n: 3, label: '設定密鑰' }
                ].map(s => `
                    <div class="flex flex-col items-center gap-1.5 relative z-10" id="shared-step-col-${s.n}">
                        <div id="shared-step-dot-${s.n}"
                             class="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-black transition-all duration-300
                             ${s.n === 1 ? 'theme-bg text-white' : 'bg-slate-100 text-slate-400'}">
                            ${s.n}
                        </div>
                        <span id="shared-step-label-${s.n}"
                              class="text-[9px] font-black uppercase tracking-tight transition-all duration-300
                              ${s.n === 1 ? 'theme-text-pink' : 'text-slate-400'}">
                            ${s.label}
                        </span>
                    </div>
                `).join('')}
            </div>

            <!-- 步驟內容區 -->
            <div id="shared-step-content" class="space-y-4">

                <!-- Step 1：選擇行程 -->
                <div id="shared-panel-1">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">選擇要共享的行程</label>
                    <select id="share-trip-id" 
                            class="w-full bg-slate-50 border-none rounded-xl p-4 text-sm font-bold shadow-sm outline-none ring-1 ring-slate-200/50 focus:ring-[var(--theme-primary)]/30 transition-all">
                        ${tripOptions}
                    </select>
                    <button onclick="App._sharedGoStep(2)"
                            class="mt-4 w-full py-4 theme-bg text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-pink-100/50 active:scale-95 transition-all">
                        下一步 →
                    </button>
                </div>

                <!-- Step 2：封裝設定 -->
                <div id="shared-panel-2" class="hidden">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">選擇要封裝的資料</label>
                    <button onclick="App.openExportFilterModal()"
                            class="w-full bg-slate-50 flex items-center justify-between p-4 rounded-xl ring-1 ring-slate-100 active:scale-[0.98] transition-all group">
                        <div class="flex items-center gap-3">
                            <span class="text-lg group-hover:rotate-12 transition-transform">📦</span>
                            <span class="text-sm font-black text-slate-700">自訂匯出內容</span>
                        </div>
                        <span id="export-filter-status" 
                              class="text-[9px] font-black theme-text-pink bg-pink-50 px-2.5 py-1 rounded-md border border-pink-100/50">
                            預設：全量匯出
                        </span>
                    </button>
                    <p class="text-[8px] text-slate-400 mt-2 italic px-1 leading-relaxed">
                        ※ 預設封裝所有資料，點擊可排除特定模組（如靈感或私密清單）。
                    </p>
                    <div class="grid grid-cols-2 gap-3 mt-4">
                        <button onclick="App._sharedGoStep(1)"
                                class="py-4 bg-slate-100 text-slate-400 rounded-[2rem] font-black text-xs active:scale-95 transition-all">
                            ← 上一步
                        </button>
                        <button onclick="App._sharedGoStep(3)"
                                class="py-4 theme-bg text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-lg shadow-pink-100/50 active:scale-95 transition-all">
                            下一步 →
                        </button>
                    </div>
                </div>

                <!-- Step 3：設定密鑰 -->
                <div id="shared-panel-3" class="hidden">
                    <label class="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3 px-1">設定 4 位數存取密鑰</label>
                    <input type="password" id="share-passcode" maxlength="4" placeholder="••••"
                           class="w-full bg-slate-50 border-none rounded-xl p-4 text-2xl font-black shadow-sm outline-none text-center tracking-[1em] ring-1 ring-slate-200/50 focus:ring-[var(--theme-primary)]/30 transition-all tabular-nums">
                    <p class="text-[9px] text-slate-400 mt-2 italic text-center font-medium">
                        ※ 接收方須輸入此密鑰才能下載行程
                    </p>
                    <div class="grid grid-cols-2 gap-3 mt-4">
                        <button onclick="App._sharedGoStep(2)"
                                class="py-4 bg-slate-100 text-slate-400 rounded-[2rem] font-black text-xs active:scale-95 transition-all">
                            ← 上一步
                        </button>
                        <button onclick="App.deployToSharedZone()"
                                class="py-4 bg-slate-800 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl active:scale-95 transition-all">
                            產生並送出
                        </button>
                    </div>
                </div>

            </div>

            <div id="shared-result-area" class="hidden animate-slide-up mt-4"></div>
        </div>
    `;
},



    /** 📁 3. 私有組件：Google Drive 資料儲存區 */
    _renderDriveSector() {
        return `
            <div class="bg-white rounded-[2.5rem] p-8 shadow-sm border border-slate-100 space-y-6">
                <div class="flex justify-between items-start">
                    <div>
                        <h3 class="font-black text-slate-800 text-[15px]">Google Drive 資料儲存</h3>
                        <p class="text-[9px] text-slate-400 font-bold uppercase tracking-tighter mt-1 italic">Physical JSON Archive</p>
                    </div>
                    <div class="w-10 h-10 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-500 font-bold shadow-sm">📁</div>
                </div>

                <p class="text-[11px] text-slate-400 leading-relaxed font-medium px-1">
                    將全系統行程、開銷與翻譯資料導出為「高品質 JSON 燃料包」並儲存至您的雲端硬碟。
                </p>

                <button onclick="App.triggerDriveBackup()" 
                        class="w-full py-4 bg-slate-800 text-white rounded-[1.5rem] font-black text-xs shadow-xl active:scale-95 transition-all">
                    執行 Drive 資料儲存 (Download)
                </button>
            </div>
        `;
    }


};

// 🚀 最終焊接至 viewEngine
viewEngine.renderBackup = (container, syncStatus) => backupView.renderMain(container, syncStatus);

if (typeof window !== 'undefined') {
    window.backupView = backupView;
}


/**
 * 🛠️ 渲染效能與連動監控 (Visual Debug Console)
 * --------------------------------------------------
 * [Visual Sync] UI 參數強制引用 config.js 內之 THEME 變數
 * [Data Flow] 純淨數據結構，tokens 維持 [[字, 品詞, 讀音]] 格式 (對位於語文模組)
 * [Optimization] 採用 requestAnimationFrame 確保物理對焦不阻塞渲染軌道
 * * 🚀 下一步焊接建議：
 * 1. [Refactor] 考量將 renderTransportFuel 抽離至獨立的 transportEngine.js 以優化載入。
 * 2. [Visual] 建議在 renderScheduleItem 導入內容預加載 (Content Placeholder) 以支撐長途路網渲染。
 * 3. [UI] 針對 renderBottomDock 導入物理震動回饋，強化「職人工具」的操作手感。
 */