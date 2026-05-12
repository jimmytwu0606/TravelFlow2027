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
    question.content = hasWord ? `${word} (${reading})` : reading;
    // ✅ 同時清理括號和斜線
    question.correct = trans.split(/[（(\/]/)[0].trim();
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

_mixOptions(correct, allItems, field) {
    const safeCorrect = String(correct || "").trim();
    const distractors = new Set();

    const voiced = {
        'か':'が','き':'ぎ','く':'ぐ','け':'げ','こ':'ご',
        'さ':'ざ','し':'じ','す':'ず','せ':'ぜ','そ':'ぞ',
        'た':'だ','ち':'ぢ','つ':'づ','て':'で','と':'ど',
        'は':'ば','ひ':'び','ふ':'ぶ','へ':'べ','ほ':'ぼ',
        'が':'か','ぎ':'き','ぐ':'く','げ':'け','ご':'こ',
        'ざ':'さ','じ':'し','ず':'す','ぜ':'せ','ぞ':'そ',
        'だ':'た','ぢ':'ち','づ':'つ','で':'て','ど':'と',
        'ば':'は','び':'ひ','ぶ':'ふ','べ':'へ','ぼ':'ほ',
    };
    const semiVoiced = {
        'は':'ぱ','ひ':'ぴ','ふ':'ぷ','へ':'ぺ','ほ':'ぽ',
        'ぱ':'は','ぴ':'ひ','ぷ':'ふ','ぺ':'へ','ぽ':'ほ',
        'ば':'ぱ','び':'ぴ','ぶ':'ぷ','べ':'ぺ','ぼ':'ぽ',
        'ぱ':'ば','ぴ':'び','ぷ':'ぶ','ぺ':'べ','ぽ':'ぼ',
    };
    const longShort = {
        'よう':'よ','りょう':'りょ','しょう':'しょ','ちょう':'ちょ',
        'じょう':'じょ','にょう':'にょ','びょう':'びょ','みょう':'みょ',
        'よ':'よう','りょ':'りょう','しょ':'しょう','ちょ':'ちょう',
    };

    const mutatePronunciation = (str) => {
        const results = new Set();
        const chars = str.split('');

        chars.forEach((c, i) => {
            if (voiced[c] || semiVoiced[c]) {
                const fake = [...chars];
                fake[i] = voiced[c] || semiVoiced[c];
                results.add(fake.join(''));
            }
        });

        for (let i = 0; i < chars.length - 1; i++) {
            const fake = [...chars];
            [fake[i], fake[i+1]] = [fake[i+1], fake[i]];
            const fakeStr = fake.join('');
            if (fakeStr !== str) results.add(fakeStr);
        }

        for (const [from, to] of Object.entries(longShort)) {
            if (str.includes(from)) {
                const mutated = str.replace(from, to);
                if (mutated !== str) results.add(mutated);
                break;
            }
        }

        const commonEndings = ['る','す','く','む','ぶ','つ','ぬ','う'];
        const lastChar = chars[chars.length - 1];
        commonEndings.forEach(e => {
            if (e !== lastChar) {
                const fake = [...chars];
                fake[fake.length - 1] = e;
                results.add(fake.join(''));
            }
        });

        return [...results].filter(r => r !== str);
    };

    // ── 讀音題 ──────────────────────────────────────────
    if (field === 'reading') {
        const mutations = mutatePronunciation(safeCorrect);
        mutations.sort((a, b) => {
            const aDiff = [...a].filter((c, i) => c !== safeCorrect[i]).length;
            const bDiff = [...b].filter((c, i) => c !== safeCorrect[i]).length;
            return aDiff - bDiff;
        });
        for (const m of mutations) {
            if (distractors.size >= 2) break;
            distractors.add(m);
        }
    }

    // ── 漢字題 ──────────────────────────────────────────
    if (field === 'word') {
        const correctItem = allItems.find(it => it.word === safeCorrect);
        const correctReading = correctItem?.reading || '';

        if (correctReading) {
            const prefix = correctReading.slice(0, 2);
            allItems
                .filter(it => it.reading?.startsWith(prefix) && it.word !== safeCorrect && it.word)
                .sort(() => Math.random() - 0.5)
                .forEach(it => { if (distractors.size < 2) distractors.add(it.word); });
        }

        if (distractors.size < 2) {
            mutatePronunciation(correctReading).forEach(m => {
                if (distractors.size >= 2) return;
                const match = allItems.find(it => it.reading === m);
                if (match?.word && match.word !== safeCorrect) distractors.add(match.word);
            });
        }

        if (distractors.size < 2) {
            allItems
                .filter(it => it.level === correctItem?.level && it.word !== safeCorrect && it.word)
                .sort(() => Math.random() - 0.5)
                .forEach(it => { if (distractors.size < 2) distractors.add(it.word); });
        }
    }

    // ── 翻譯題 ──────────────────────────────────────────
    if (field === 'trans') {
        const getTrans = (it) => String(it.trans || it.translation || it[5] || '').split(/[（(\/]/)[0].trim();

        // 策略A：否定化 — 加上長度限制，超過6字不做否定
if (distractors.size < 2) {
    const negations = ['不', '沒有', '無法', '不能'];
    for (const neg of negations.sort(() => Math.random() - 0.5)) {
        if (!safeCorrect.startsWith(neg) && safeCorrect.length <= 6) {
            distractors.add(neg + safeCorrect);
            break;
        }
    }
}

        // 策略B：截字混淆（去掉最後1~2字）
        if (distractors.size < 2 && safeCorrect.length > 2) {
            const shorter = safeCorrect.slice(0, -1);
            if (shorter && shorter !== safeCorrect) distractors.add(shorter);
        }
        if (distractors.size < 2 && safeCorrect.length > 3) {
            const shorter2 = safeCorrect.slice(0, -2);
            if (shorter2 && shorter2 !== safeCorrect) distractors.add(shorter2);
        }

        // 策略C：字數相近的其他翻譯
        if (distractors.size < 2) {
            allItems
                .map(it => getTrans(it))
                .filter(t => t && t !== safeCorrect && t !== '---' &&
                    Math.abs(t.length - safeCorrect.length) <= 3)
                .sort(() => Math.random() - 0.5)
                .forEach(t => { if (distractors.size < 2) distractors.add(t); });
        }

        // 備援：任意翻譯
        if (distractors.size < 2) {
            allItems
                .map(it => getTrans(it))
                .filter(t => t && t !== safeCorrect && t !== '---')
                .sort(() => Math.random() - 0.5)
                .forEach(t => { if (distractors.size < 2) distractors.add(t); });
        }
    }

    // ── 備援補齊 ──────────────────────────────────────────
    if (distractors.size < 2) {
        ['確認', '完了', '修正'].forEach(f => {
            if (distractors.size < 2 && f !== safeCorrect) distractors.add(f);
        });
    }

    return [safeCorrect, ...Array.from(distractors)].slice(0, 3).sort(() => Math.random() - 0.5);
},


_generateUsageDistractors(sentence, allItems) {
    const distractors = new Set();

    // 混淆助詞對：容易搞混的組合
    const confusablePairs = [
        ['を', 'が'], ['に', 'で'], ['は', 'が'],
        ['へ', 'に'], ['から', 'まで'], ['と', 'や'],
        ['の', 'が'], ['も', 'は']
    ];

    if (!sentence || sentence === '---') {
        const fallbackPool = allItems
            .filter(it => it.example && it.example !== '---')
            .map(it => it.example)
            .sort(() => Math.random() - 0.5);
        return fallbackPool.slice(0, 3).length >= 3
            ? fallbackPool.slice(0, 3)
            : ["日本語を勉強します。", "日本へ行きたいです。", "友達と話します。"];
    }

    // 策略1：混淆助詞替換（只換容易混淆的組合）
    for (const [a, b] of confusablePairs.sort(() => Math.random() - 0.5)) {
        if (distractors.size >= 2) break;
        if (sentence.includes(a)) {
            const fake = sentence.replace(a, b);
            if (fake !== sentence) distractors.add(fake);
        } else if (sentence.includes(b)) {
            const fake = sentence.replace(b, a);
            if (fake !== sentence) distractors.add(fake);
        }
    }

    // 策略2：動詞形態替換（た形↔て形↔ます形，製造時態混淆）
    if (distractors.size < 2) {
        const verbSwaps = [
            [/しました/, 'します'], [/します/, 'しました'],
            [/でした/, 'です'], [/です/, 'でした'],
            [/ました/, 'ます'], [/ます/, 'ました'],
            [/ている/, 'ていた'], [/ていた/, 'ている'],
            [/た。/, 'ている。'], [/ている。/, 'た。'],
        ];
        for (const [from, to] of verbSwaps.sort(() => Math.random() - 0.5)) {
            if (distractors.size >= 2) break;
            const fake = sentence.replace(from, to);
            if (fake !== sentence && !distractors.has(fake)) distractors.add(fake);
        }
    }

    // 策略3：同主題例句（同 level 的其他詞的例句，語境相近更難分辨）
    if (distractors.size < 2) {
        const targetLevel = allItems.find(it => it.example === sentence)?.level;
        const sameLevelExamples = allItems
            .filter(it => it.example && it.example !== sentence && it.example !== '---'
                && (!targetLevel || it.level === targetLevel))
            .map(it => it.example)
            .sort(() => Math.random() - 0.5);
        for (const ex of sameLevelExamples) {
            if (distractors.size >= 2) break;
            distractors.add(ex);
        }
    }

    // 備援：其他任意例句
    if (distractors.size < 2) {
        const others = allItems
            .filter(it => it.example && it.example !== sentence && it.example !== '---')
            .map(it => it.example)
            .sort(() => Math.random() - 0.5);
        for (const ex of others) {
            if (distractors.size >= 2) break;
            distractors.add(ex);
        }
    }

    return [sentence, ...Array.from(distractors)].slice(0, 3).sort(() => Math.random() - 0.5);
}

};

window.challengeEngine = challengeEngine; 