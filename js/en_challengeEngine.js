/** 🧬 [en_challengeEngine] 英美語挑戰模式核心驅動器
 * 核心版本：V2026.ULTRA.FINAL
 * 物理作用：生成 IPA 對焦、時態辨析與介系詞篡改考題
 */

export const en_challengeEngine = {

/** 🚀 [Main] 挑戰生成器：針對英文特性分流 (V2026.ULTRA.STABLE_FINAL) */
    generateChallenge(item, allItems) {
        // 🚀 1. 物理掃描與深度洗滌
        // 💡 職人診斷：直接鎖定精煉後的 key，封殺所有英文預設噪訊
        const word = String(item.word || "").trim();
        const phonetic = String(item.phonetic || "").trim();
        const trans = String(item.trans || item.translation || "").trim();
        const example = String(item.example || "").trim();

        // 🔐 核心熔斷協定：定義無效燃料黑名單
        const voidList = ['---', '未對焦', '無翻譯數據', 'Undefined', 'N/A', 'Pending', 'No definition'];
        
        const hasWord = word && !voidList.includes(word);
        const hasIPA = phonetic && !voidList.includes(phonetic);
        const hasTrans = trans && !voidList.includes(trans);
        const hasExample = example && !voidList.includes(example);

        // 🚀 2. 動態導通英文專屬題型池
        // 💡 職人診斷：預設僅留 'listening'，其餘軌道視燃料純度點火
        const availableTypes = ['listening']; 
        if (hasWord && hasIPA) availableTypes.push('ipa_focus');
        if (hasTrans) availableTypes.push('meaning');
        if (hasExample) availableTypes.push('grammar_fill');

        const activeType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
        let question = { type: activeType, title: '', content: '', options: [], correct: '' };

        // 🚀 3. 執行數據噴發與主權對焦
        switch(activeType) {
            case 'listening':
                question.title = "Acoustic Focus: Listen and Identify";
                // 🎯 聲學優先權：優先顯示英文單字，無單字則顯示翻譯作為對位
                question.correct = hasWord ? word : trans;
                question.options = this._mixOptions(question.correct, allItems, hasWord ? 'word' : 'trans');
                break;

            case 'ipa_focus':
                question.title = "IPA Mastery: Select the correct pronunciation";
                question.content = word;
                question.correct = phonetic;
                question.options = this._mixOptions(question.correct, allItems, 'phonetic');
                break;

            case 'meaning':
                question.title = "Definition Alignment: Select the correct meaning";
                // 💡 視覺輔助：在題目中同步顯影 IPA 增加學習密度
                question.content = hasWord ? `${word} [${phonetic}]` : phonetic;
                question.correct = trans;
                question.options = this._mixOptions(question.correct, allItems, 'trans');
                break;

            case 'grammar_fill':
                question.title = "Grammar Challenge: Tense & Prepositions";
                // 執行時態/介系詞物理篡改引擎
                const challenge = this._generateGrammarChallenge(example);
                question.content = challenge.maskedSentence;
                question.correct = challenge.answer;
                question.options = challenge.options;
                break;
        }

        console.log(`📡 [Challenge-Ignition] EN 軌道導通: ${activeType} | Fuel: ${question.correct.substring(0, 10)}...`);
        return question;
    },


/** 🚀 [Algorithm] 詞綴與詞根干擾算法 (V2026.ULTRA.STABLE_MIX) */
    _mixOptions(correct, allItems, field) {
        const distractors = new Set();
        const safeCorrect = String(correct).trim();

        // 🚀 策略 1：詞綴/詞根演化 (僅限 word 軌道)
        if (field === 'word' && safeCorrect.length > 3) {
            // 💡 職人診斷：根據長度動態保留詞根，避免產出非法拼字
            const stemLen = safeCorrect.length > 5 ? 4 : 3;
            const stem = safeCorrect.substring(0, stemLen);
            const suffixes = ['ing', 'ed', 'tion', 'ly', 'ment', 'able'];
            
            // 隨機選兩組進行焊接
            suffixes.sort(() => Math.random() - 0.5).slice(0, 2).forEach(s => {
                const fake = stem + s;
                if (fake.toLowerCase() !== safeCorrect.toLowerCase()) distractors.add(fake);
            });
        }

        // 🚀 策略 2：IPA 語音混淆 (僅限 phonetic 軌道)
        if (field === 'phonetic' && safeCorrect.length > 2) {
            const confusionPairs = {'æ': 'ə', 'i:': 'ɪ', 'v': 'b', 'l': 'r', 's': 'θ'};
            let fakeIPA = safeCorrect;
            Object.entries(confusionPairs).forEach(([real, fake]) => {
                if (fakeIPA.includes(real)) fakeIPA = fakeIPA.replace(real, fake);
            });
            if (fakeIPA !== safeCorrect) distractors.add(fakeIPA);
        }

        // 🚀 策略 3：影子燃料池採集 (English Ghost Fuel)
        // 💡 職人對焦：若磁區乾涸，注入高頻商務/旅遊單字作為高質量干擾項
        const ghostFuel = {
            word: ["Process", "Standard", "Context", "Feature", "Project", "Detail", "Status"],
            phonetic: ["/ˈprɑːses/", "/ˈstændərd/", "/ˈkɑːntekst/", "/ˈfiːtʃər/", "/ˈstætəs/"],
            trans: ["處理程序", "標準規範", "數據對焦", "核心功能", "當前狀態", "細節解析"]
        };

        const pool = allItems
            .map(it => String(it[field] || "").trim())
            .filter(v => v && !['---', '未對焦', 'Undefined'].includes(v) && v !== safeCorrect);

        let attempts = 0;
        while (distractors.size < 2 && attempts < 15) {
            if (pool.length > 0) {
                const randVal = pool[Math.floor(Math.random() * pool.length)];
                distractors.add(randVal);
            } else {
                const ghosts = ghostFuel[field] || ghostFuel.word;
                distractors.add(ghosts[Math.floor(Math.random() * ghosts.length)]);
            }
            attempts++;
        }

        // 🚀 策略 4：物理填充協定 (Padding Protocol)
        // 💡 職人診斷：確保在極端狀態下也必須輸出 3 個選項
        const finalOptions = [safeCorrect, ...Array.from(distractors)];
        const paddings = ["None of above", "TBD", "Not applicable", "Data pending"];
        
        let pIdx = 0;
        while (finalOptions.length < 3) {
            const p = paddings[pIdx] || `Option ${finalOptions.length + 1}`;
            if (!finalOptions.includes(p)) finalOptions.push(p);
            pIdx++;
        }

        return finalOptions.slice(0, 3).sort(() => Math.random() - 0.5);
    },


/** 🚀 [Refinery] 語法填空發動機：介系詞與時態物理鎖定 (V2026.ULTRA.STRICT_MASK) */
    _generateGrammarChallenge(sentence) {
        if (!sentence) return { maskedSentence: "Data pending...", answer: "", options: [] };

        // 🚀 1. 建立語義家族表 (Semantic Families)
        const families = {
            prep: ['in', 'on', 'at', 'with', 'for', 'to', 'by', 'of', 'from', 'about'],
            tense: ['is', 'are', 'was', 'were', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'been'],
            article: ['a', 'an', 'the']
        };
        
        // 🚀 2. 物理去噪與標籤化
        // 💡 職人診斷：保留標點符號的同時，提取純淨單字進行對比
        const wordsWithPunct = sentence.split(' ');
        const cleanWords = wordsWithPunct.map(w => w.replace(/[.,!?;:]/g, '').toLowerCase());

        let targetIdx = -1;
        let type = 'prep';

        // 🚀 3. 執行「優先權對焦掃描」
        // 優先順序：介系詞 > 時態/助動詞 > 冠詞
        targetIdx = cleanWords.findIndex(w => families.prep.includes(w));
        
        if (targetIdx === -1) {
            targetIdx = cleanWords.findIndex(w => families.tense.includes(w));
            type = 'tense';
        }
        
        if (targetIdx === -1) {
            targetIdx = cleanWords.findIndex(w => families.article.includes(w));
            type = 'article';
        }

        // 🚀 4. 熔斷防禦：若皆未命中，封殺「隨機中間詞」，改為「提取長單字」增加難度
        if (targetIdx === -1) {
            const longWordIdx = cleanWords.findIndex(w => w.length > 5);
            targetIdx = longWordIdx !== -1 ? longWordIdx : Math.floor(wordsWithPunct.length / 2);
            type = 'vocab';
        }

        // 🚀 5. 執行物理遮蔽 (保留尾部標點)
        const rawAnswer = wordsWithPunct[targetIdx];
        const cleanAnswer = rawAnswer.replace(/[.,!?;:]/g, '');
        const punctuation = rawAnswer.match(/[.,!?;:]/g) || "";
        
        wordsWithPunct[targetIdx] = "____" + punctuation;
        
        const maskedSentence = wordsWithPunct.join(' ');
        const options = this._generateGrammarDistractors(cleanAnswer, type, families);

        return { maskedSentence, answer: cleanAnswer, options };
    },

    /** 🧪 [Sub-Module] 語法干擾項生成器 (精密同族群篡改) */
    _generateGrammarDistractors(correct, type, families) {
        const safeCorrect = correct.toLowerCase();
        let pool = [];

        // 🚀 執行家族內採樣，確保干擾項具備「強誘因」
        if (type === 'prep') {
            pool = ['in', 'on', 'at', 'by', 'to', 'for', 'from'];
        } else if (type === 'tense') {
            // 💡 職人對焦：針對 be 動詞家族執行強對位
            if (['is', 'am', 'are', 'was', 'were'].includes(safeCorrect)) {
                pool = ['is', 'are', 'was', 'were'];
            } else if (['have', 'has', 'had'].includes(safeCorrect)) {
                pool = ['have', 'has', 'had'];
            } else {
                pool = ['do', 'does', 'did', 'done'];
            }
        } else if (type === 'article') {
            pool = ['a', 'an', 'the', 'some'];
        } else {
            pool = ['about', 'nearly', 'often', 'simply', 'maybe'];
        }

        // 數據洗滌：排除正確答案，隨機挑選 2 筆
        const filtered = pool.filter(p => p !== safeCorrect);
        const shuffled = filtered.sort(() => Math.random() - 0.5);
        
        const finalOptions = [correct, ...shuffled.slice(0, 2)];
        
        // 物理補齊 (Padding)
        while (finalOptions.length < 3) {
            finalOptions.push("---");
        }

        return finalOptions.sort(() => Math.random() - 0.5);
    }

};

/** 🛰️ 全域掛載 */
if (typeof window !== 'undefined') {
    window.en_challengeEngine = en_challengeEngine;
}