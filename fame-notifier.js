// ==========================================
// FAME NOTIFIER MODULE
// ==========================================

(function () {
    'use strict';

    const STORAGE_GAINED = 'totalFameGained';
    const STORAGE_LOST = 'totalFameLost';
    const STORAGE_RESET_KEY = 'deltaUI_fameResetKey';
    
    // Load saved key or use default
    let resetKey = localStorage.getItem(STORAGE_RESET_KEY) || '[';

    const getTotal = key => parseInt(localStorage.getItem(key), 10) || 0;
    const setTotal = (key, val) => localStorage.setItem(key, val.toString());
    const addTotal = (key, val) => setTotal(key, getTotal(key) + val);

    const resetFame = () => {
        setTotal(STORAGE_GAINED, 0);
        setTotal(STORAGE_LOST, 0);
        console.log('[Fame Notifier] Reset to 0!');
    };

    // Function to update the reset key
    const setResetKey = (newKey) => {
        resetKey = newKey.toLowerCase();
        localStorage.setItem(STORAGE_RESET_KEY, resetKey);
        console.log(`[Fame Notifier] Reset key changed to: ${resetKey}`);
    };

    window.addEventListener('keydown', (e) => {
        const active = document.activeElement;
        const isTyping = active.tagName === 'INPUT' ||
                         active.tagName === 'TEXTAREA' ||
                         active.isContentEditable;

        // Compare with current resetKey (case-insensitive)
        if (!isTyping && e.key.toLowerCase() === resetKey.toLowerCase()) {
            resetFame();
        }
    });

    const parseFame = (text) => {
        if (!text) return;
        text = text.replace(/\s+/g, ' ').trim();

        const gain = text.match(/Gained\s+([\d,]+)/i);
        if (gain) {
            const val = parseInt(gain[1].replace(/,/g, ''), 10);
            if (val > 0) {
                addTotal(STORAGE_GAINED, val);
                console.log(`[Fame Notifier] +${val.toLocaleString()} (Total: ${getTotal(STORAGE_GAINED).toLocaleString()})`);
            }
            return;
        }

        const loss = text.match(/Lost\s+([\d,]+)/i);
        if (loss) {
            const val = parseInt(loss[1].replace(/,/g, ''), 10);
            if (val > 0) {
                addTotal(STORAGE_LOST, val);
                console.log(`[Fame Notifier] -${val.toLocaleString()} (Total Lost: ${getTotal(STORAGE_LOST).toLocaleString()})`);
            }
        }
    };

    const processNode = (node) => {
        if (!(node instanceof HTMLElement)) return;
        if (!node.matches('article.line')) return;

        if (node.dataset.fameProcessed) return;
        node.dataset.fameProcessed = "true";

        node.querySelectorAll('span.textfame').forEach(span => parseFame(span.textContent));
    };

    let chatObserver = null;

    const attachObserver = () => {
        const chat = document.querySelector('#chat');
        if (!chat) return;

        if (chatObserver && (!chatObserver.target || !document.body.contains(chatObserver.target))) {
            chatObserver.disconnect();
            chatObserver = null;
        }

        if (!chatObserver) {
            chatObserver = new MutationObserver(muts => {
                muts.forEach(m => m.addedNodes.forEach(n => processNode(n)));
            });
            chatObserver.target = chat;
            chatObserver.observe(chat, { childList: true, subtree: true });
            console.log('[Fame Notifier] Observer attached.');
        }
    };

    const bodyObserver = new MutationObserver(() => attachObserver());
    bodyObserver.observe(document.body, { childList: true, subtree: true });

    attachObserver();

    // Expose API for other scripts
    window.FameNotifier = {
        getGained: () => getTotal(STORAGE_GAINED),
        getLost: () => getTotal(STORAGE_LOST),
        reset: resetFame,
        setResetKey: setResetKey,  // ADD THIS LINE
        getResetKey: () => resetKey  // Optional: useful for debugging
    };

    console.log(`[Fame Notifier] Loaded. Gained: ${getTotal(STORAGE_GAINED)}, Lost: ${getTotal(STORAGE_LOST)}`);
    console.log(`[Fame Notifier] Press '${resetKey}' to reset.`);
})();
