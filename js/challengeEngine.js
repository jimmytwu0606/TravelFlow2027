/** 🧬 [Engine] 挑戰模式核心驅動器 */
export const challengeEngine = {


/** 🧬 [Engine] 挑戰模式核心驅動器 (V2026.ULTRA.STABLE_OUTPUT) */
generateChallenge(item, allItems) {
    // 🚀 1. 物理掃描與洗滌：提取標準化燃料
    // 💡 職人診斷：直接鎖定 dbManager 歸一化後的 key，封殺 '---' 或 '無翻譯數據'
    const word = String(item.word || "").trim();
    const reading = String(item.reading || "").trim();
    const trans = String(item.trans || item.translation || "").trim();
    const example = String(item.example || "").trim();

    const hasWord = word && word !== '---';
    const hasReading = reading && reading !== '---';
    // 🔐 關鍵熔斷：排除預設的「無數據」字串
    const hasTrans = trans && !['---', '無翻譯數據', '未對焦內容'].includes(trans);
    const hasExample = example && example !== '---';

    // 🚀 2. 動態導通題型池
    const availableTypes = ['listening']; 
    if (hasWord && hasReading) {
        availableTypes.push('reading_kanji', 'reading_kana');
    }
    if (hasTrans) {
        availableTypes.push('meaning');
    }
    if (hasExample) {
        availableTypes.push('usage');
    }

    const activeType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
    console.log(`📡 [Challenge-Ignition] 軌道偵測: ${activeType} | 活性池: ${availableTypes.join(',')}`);

    let question = { type: activeType, title: '', content: '', options: [], correct: '' };

    // 🚀 3. 數據噴發 (歸一化處理)
    switch(activeType) {


        case 'listening':
            question.title = "耳聞對焦：聽取讀音並辨識內容";
            
            // 🚀 1. 答案屬性對焦：優先漢字，回退讀音
            const finalCorrect = hasWord ? word : reading;
            question.correct = finalCorrect;

            // 🚀 2. 選項池對焦：確保從與答案相同的屬性軌道抓取選項
            // 💡 職人診斷：若答案是讀音(reading)，選項池也必須從 reading 抓，否則會抓到一堆 undefined
            const targetField = hasWord ? 'word' : 'reading';
            
            question.options = this._mixOptions(question.correct, allItems, targetField);
            
            // 🚀 3. 聲學同步：確保 speak() 呼叫的是原始讀音數據
            // 這部分由 translationView 處理，此處僅確保數據導通
            break;

        case 'reading_kanji':
            question.title = "識讀對焦：請選出該漢字的平假名";
            question.content = word;
            question.correct = reading;
            question.options = this._mixOptions(question.correct, allItems, 'reading');
            break;

        case 'reading_kana':
            question.title = "構詞對焦：請選出該讀音的漢字";
            question.content = reading;
            question.correct = word;
            question.options = this._mixOptions(question.correct, allItems, 'word');
            break;

        case 'meaning':
            question.title = "用法對焦：請選出正確的中文意義";
            // 💡 視覺對焦：若有漢字則輔助顯示，優化識讀體驗
            question.content = hasWord ? `${word} (${reading})` : reading;
            question.correct = trans;
            question.options = this._mixOptions(question.correct, allItems, 'trans');
            break;

        case 'usage':
            question.title = "語法對焦：哪一個句子用法正確？";
            question.content = reading || word; 
            question.correct = example;
            question.options = this._generateUsageDistractors(example, allItems);
            break;
    }

    return question;
},

/** 🚀 混合選項與干擾項 (V2026.ULTRA.STABLE_FINAL) */
_mixOptions(correct, allItems, field) {
    const distractors = new Set();
    const safeCorrect = String(correct || "").trim();
    
    // 1. 🚀 策略 1: 假名拆解重組 (保持原有邏輯)
    if (field !== 'trans' && safeCorrect.length > 1) {
        const chars = safeCorrect.split('');
        const shuffled = [...chars].sort(() => Math.random() - 0.5).join('');
        if (shuffled !== safeCorrect) distractors.add(shuffled);
    }

    // 2. 🚀 策略 2: 燃料池提取與洗滌
    const pool = allItems
        .map(it => {
            const val = it[field === 'trans' ? (it.translation ? 'translation' : 'trans') : field];
            return String(val || "").trim();
        })
        .filter(val => val && val !== '---' && val !== safeCorrect);

    let attempts = 0;
    const maxAttempts = 15;

    while (distractors.size < 2 && attempts < maxAttempts) {
        attempts++;
        if (pool.length > 0) {
            const randVal = pool[Math.floor(Math.random() * pool.length)];
            distractors.add(randVal);
        } else {
            // 💡 職人級補償：池子乾涸時，噴發模擬燃料取代「候補-A」
            // 這些字根是針對 N4/N3 常用單字預設的「影子干擾項」
            const ghostFuel = ["初め", "日記", "記述", "明らか", "残る", "光", "砂", "空", "海", "時"];
            const ghost = ghostFuel[Math.floor(Math.random() * ghostFuel.length)];
            if (ghost !== safeCorrect) distractors.add(ghost);
        }
    }

    // 3. 🚀 最終輸出固化與物理補齊
    const finalOptions = [safeCorrect, ...Array.from(distractors)].slice(0, 3);
    
    // 💡 終極防線：如果還是湊不齊 3 個 (極端小池子狀態)，執行最後填充
    const padding = ["確認", "完了", "修正"];
    let pIdx = 0;
    while (finalOptions.length < 3) {
        finalOptions.push(padding[pIdx] || `選項-${finalOptions.length}`);
        pIdx++;
    }

    return finalOptions.sort(() => Math.random() - 0.5);
},

/** 🚀 語法干擾項生成 (V2026.ULTRA 助詞篡改與自動補償版) */
_generateUsageDistractors(sentence, allItems) {
    const distractors = new Set();
    const particles = ['を', 'に', 'へ', 'で', 'が', 'は'];

    // 🚀 [修正 A] 數據熔斷補償：若無例句燃料，從全池中隨機抓取 2 筆非重複例句
    if (!sentence || sentence === '---') {
        const fallbackPool = allItems
            .filter(it => it.example && it.example !== '---')
            .map(it => it.example);
        
        // 若池子太小，則給予硬編碼的基礎語法燃料
        const finalPool = fallbackPool.length >= 2 ? fallbackPool : ["日本語を勉強します。", "日本へ行きたいです。"];
        
        while (distractors.size < 2) {
            const randIdx = Math.floor(Math.random() * finalPool.length);
            distractors.add(finalPool[randIdx]);
        }
        
        // 此時 sentence 是無效的，回傳隨機抓取的 3 個選項
        return Array.from(distractors).slice(0, 3).sort(() => Math.random() - 0.5);
    }

    // 🚀 [修正 B] 篡改 1：精密助詞替換 (單次替換防止邏輯崩潰)
    let fakeA = sentence;
    const sentenceParticles = particles.filter(p => sentence.includes(p));
    
    if (sentenceParticles.length > 0) {
        // 隨機選一個句子裡有的助詞進行篡改
        const targetP = sentenceParticles[Math.floor(Math.random() * sentenceParticles.length)];
        const otherP = particles.filter(p => p !== targetP)[Math.floor(Math.random() * 5)];
        fakeA = sentence.replace(new RegExp(targetP, 'g'), otherP);
        if (fakeA !== sentence) distractors.add(fakeA);
    }

    // 🚀 [修正 C] 篡改 2：語義亂流補完
    // 從 allItems 中尋找其他例句，直到填滿 2 個干擾項為止
    const otherExamples = allItems
        .filter(it => it.example && it.example !== sentence && it.example !== '---')
        .map(it => it.example);

    let attempts = 0;
    while (distractors.size < 2 && attempts < 20) {
        if (otherExamples.length > 0) {
            const randEx = otherExamples[Math.floor(Math.random() * otherExamples.length)];
            distractors.add(randEx);
        } else {
            // 極端備援：若無其他例句，執行硬編碼篡改
            distractors.add(sentence + "か。");
        }
        attempts++;
    }

    // 🚀 [修正 D] 最終導通：確保回傳 3 個選項 (1 正確 + 2 錯誤)
    const finalOptions = [sentence, ...Array.from(distractors)].slice(0, 3);
    return finalOptions.sort(() => Math.random() - 0.5);
}

};

window.challengeEngine = challengeEngine; 