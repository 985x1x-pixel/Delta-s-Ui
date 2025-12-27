// ==========================================
// FAME NOTIFIER MODULE v1.1
// Tracks fame gained/lost from chat messages
// ==========================================

(function() {
    "use strict";

    // Wait for DeltaLib
    function init() {
        if (!window.DeltaLib) {
            setTimeout(init, 50);
            return;
        }

        const { storage } = DeltaLib;

        const STORAGE_KEYS = {
            GAINED: "totalFameGained",
            LOST: "totalFameLost"
        };

        const RESET_KEY = "[";

        // State
        let chatObserver = null;

        // ==========================================
        // STORAGE HELPERS
        // ==========================================

        const getGained = () => parseInt(storage.get(STORAGE_KEYS.GAINED, "0"), 10);
        const getLost = () => parseInt(storage.get(STORAGE_KEYS.LOST, "0"), 10);

        const addGained = (amount) => {
            storage.set(STORAGE_KEYS.GAINED, String(getGained() + amount));
        };

        const addLost = (amount) => {
            storage.set(STORAGE_KEYS.LOST, String(getLost() + amount));
        };

        const reset = () => {
            storage.set(STORAGE_KEYS.GAINED, "0");
            storage.set(STORAGE_KEYS.LOST, "0");
            console.log("[Fame Notifier] Reset to 0!");
        };

        // ==========================================
        // FAME PARSING
        // ==========================================

        function parseFameText(text) {
            if (!text) return;

            const normalizedText = text.replace(/\s+/g, " ").trim();

            // Check for fame gain
            const gainMatch = normalizedText.match(/Gained\s+([\d,]+)/i);
            if (gainMatch) {
                const amount = parseInt(gainMatch[1].replace(/,/g, ""), 10);
                if (amount > 0) {
                    addGained(amount);
                    console.log(`[Fame Notifier] +${amount.toLocaleString()} (Total: ${getGained().toLocaleString()})`);
                }
                return;
            }

            // Check for fame loss
            const lossMatch = normalizedText.match(/Lost\s+([\d,]+)/i);
            if (lossMatch) {
                const amount = parseInt(lossMatch[1].replace(/,/g, ""), 10);
                if (amount > 0) {
                    addLost(amount);
                    console.log(`[Fame Notifier] -${amount.toLocaleString()} (Total Lost: ${getLost().toLocaleString()})`);
                }
            }
        }

        function processChatLine(node) {
            if (!(node instanceof HTMLElement)) return;
            if (!node.matches?.("article.line")) return;
            if (node.dataset.fameProcessed) return;

            node.dataset.fameProcessed = "true";

            const fameSpans = node.querySelectorAll("span.textfame");
            fameSpans.forEach(span => parseFameText(span.textContent));
        }

        // ==========================================
        // OBSERVER SETUP
        // ==========================================

        function attachChatObserver() {
            const chat = document.getElementById("chat");
            if (!chat) return;

            // Disconnect existing observer if it's orphaned
            if (chatObserver) {
                const isAttached = document.body.contains(chat);
                if (!isAttached) {
                    chatObserver.disconnect();
                    chatObserver = null;
                }
            }

            if (!chatObserver) {
                chatObserver = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                        for (const node of mutation.addedNodes) {
                            processChatLine(node);
                        }
                    }
                });

                chatObserver.observe(chat, { childList: true, subtree: true });
                console.log("[Fame Notifier] Observer attached");
            }
        }

        // ==========================================
        // INITIALIZATION
        // ==========================================

        // Watch for chat element to appear
        const bodyObserver = new MutationObserver(attachChatObserver);
        bodyObserver.observe(document.body, { childList: true, subtree: true });

        // Try to attach immediately
        attachChatObserver();

        // Reset hotkey
        DeltaLib.events.onKeyPress(RESET_KEY, reset);

        // Expose API
        window.FameNotifier = {
            getGained,
            getLost,
            reset,
            get total() {
                return { gained: getGained(), lost: getLost() };
            }
        };

        console.log(`[Fame Notifier] Loaded. Gained: ${getGained()}, Lost: ${getLost()}`);
        console.log(`[Fame Notifier] Press '${RESET_KEY}' to reset.`);
    }

    // Start initialization
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }
})();
