// ==========================================
// FAME NOTIFIER MODULE v2.0
// Tracks fame gained and lost from chat
// ==========================================

(function() {
    "use strict";

    // Prevent double initialization
    if (window.FameNotifier) {
        return;
    }

    // ==========================================
    // DEPENDENCIES
    // ==========================================

    function getDeps() {
        return {
            lib: window.DeltaLib,
            config: window.DELTA_CONFIG
        };
    }

    // ==========================================
    // STATE
    // ==========================================

    let isInitialized = false;
    let cleanup = null;
    let resetKey = "[";

    // Storage keys
    const STORAGE_KEYS = {
        GAINED: "totalFameGained",
        LOST: "totalFameLost",
        RESET_KEY: "deltaUI_fameResetKey"
    };

    // ==========================================
    // STORAGE FUNCTIONS
    // ==========================================

    /**
     * Get fame value from storage
     * @param {string} key - Storage key
     * @returns {number}
     */
    function getTotal(key) {
        const { lib } = getDeps();
        if (lib) {
            return parseInt(lib.storage.get(key, "0"), 10) || 0;
        }
        try {
            return parseInt(localStorage.getItem(key), 10) || 0;
        } catch (e) {
            return 0;
        }
    }

    /**
     * Set fame value in storage
     * @param {string} key - Storage key
     * @param {number} value - Value to set
     */
    function setTotal(key, value) {
        const { lib } = getDeps();
        if (lib) {
            lib.storage.set(key, String(value));
        } else {
            try {
                localStorage.setItem(key, String(value));
            } catch (e) {}
        }
    }

    /**
     * Add to fame value in storage
     * @param {string} key - Storage key
     * @param {number} value - Value to add
     */
    function addTotal(key, value) {
        setTotal(key, getTotal(key) + value);
    }

    // ==========================================
    // FAME PARSING
    // ==========================================

    /**
     * Parse fame from text content
     * @param {string} text - Text to parse
     */
    function parseFame(text) {
        if (!text || typeof text !== "string") return;

        // Normalize whitespace
        text = text.replace(/\s+/g, " ").trim();

        // Check for fame gain
        const gainMatch = text.match(/Gained\s+([\d,]+)/i);
        if (gainMatch) {
            const value = parseInt(gainMatch[1].replace(/,/g, ""), 10);
            if (value > 0) {
                addTotal(STORAGE_KEYS.GAINED, value);
            }
            return;
        }

        // Check for fame loss
        const lossMatch = text.match(/Lost\s+([\d,]+)/i);
        if (lossMatch) {
            const value = parseInt(lossMatch[1].replace(/,/g, ""), 10);
            if (value > 0) {
                addTotal(STORAGE_KEYS.LOST, value);
            }
        }
    }

    /**
     * Process a chat line node for fame
     * @param {HTMLElement} node - DOM node to process
     */
    function processNode(node) {
        if (!(node instanceof HTMLElement)) return;
        
        // Only process chat lines
        if (!node.matches("article.line")) return;

        // Skip if already processed
        if (node.dataset.fameProcessed) return;
        node.dataset.fameProcessed = "true";

        // Find fame text spans
        const fameSpans = node.querySelectorAll("span.textfame");
        fameSpans.forEach(span => {
            parseFame(span.textContent);
        });
    }

    // ==========================================
    // RESET FUNCTIONS
    // ==========================================

    /**
     * Reset all fame counters
     */
    function reset() {
        setTotal(STORAGE_KEYS.GAINED, 0);
        setTotal(STORAGE_KEYS.LOST, 0);
    }

    /**
     * Set the reset keybind
     * @param {string} newKey - New key to use
     */
    function setResetKey(newKey) {
        if (!newKey || typeof newKey !== "string") return;
        
        resetKey = newKey.toLowerCase();
        
        const { lib } = getDeps();
        if (lib) {
            lib.storage.set(STORAGE_KEYS.RESET_KEY, resetKey);
        } else {
            try {
                localStorage.setItem(STORAGE_KEYS.RESET_KEY, resetKey);
            } catch (e) {}
        }
    }

    /**
     * Get current reset key
     * @returns {string}
     */
    function getResetKey() {
        return resetKey;
    }

    /**
     * Load reset key from storage
     */
    function loadResetKey() {
        const { lib } = getDeps();
        if (lib) {
            resetKey = lib.storage.get(STORAGE_KEYS.RESET_KEY, "[");
        } else {
            try {
                resetKey = localStorage.getItem(STORAGE_KEYS.RESET_KEY) || "[";
            } catch (e) {
                resetKey = "[";
            }
        }
    }

    // ==========================================
    // KEYBOARD HANDLER
    // ==========================================

    /**
     * Handle reset key press
     * @param {KeyboardEvent} e - Keyboard event
     */
    function handleKeydown(e) {
        // Ignore if typing in input
        const active = document.activeElement;
        const isTyping = active?.tagName === "INPUT" ||
                        active?.tagName === "TEXTAREA" ||
                        active?.isContentEditable;

        if (isTyping) return;

        // Check if reset key pressed
        if (e.key.toLowerCase() === resetKey.toLowerCase()) {
            reset();
        }
    }

    // ==========================================
    // OBSERVER SETUP
    // ==========================================

    /**
     * Setup chat observer
     */
    function setupObserver() {
        const { lib } = getDeps();
        
        const chat = document.querySelector("#chat");
        if (!chat) return false;

        if (lib) {
            // Use DeltaLib observer with cleanup tracking
            const observerId = lib.observers.create(chat, (mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => processNode(node));
                });
            }, {
                childList: true,
                subtree: true,
                debounce: 50
            });

            cleanup.trackObserver(observerId);
        } else {
            // Fallback without DeltaLib
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    mutation.addedNodes.forEach(node => processNode(node));
                });
            });

            observer.observe(chat, { childList: true, subtree: true });

            cleanup.trackCustom(() => observer.disconnect());
        }

        return true;
    }

    /**
     * Setup body observer to detect chat appearing
     */
    function setupBodyObserver() {
        const { lib } = getDeps();

        // Check if chat already exists
        if (document.querySelector("#chat")) {
            setupObserver();
            return;
        }

        // Watch for chat to appear
        const checkForChat = () => {
            const chat = document.querySelector("#chat");
            if (chat) {
                setupObserver();
                return true;
            }
            return false;
        };

        if (lib) {
            // Use DeltaLib observer
            const observerId = lib.observers.create(document.body, () => {
                if (checkForChat()) {
                    lib.observers.disconnect(observerId);
                }
            }, {
                childList: true,
                subtree: true,
                debounce: 100
            });

            cleanup.trackObserver(observerId);
        } else {
            // Fallback
            const observer = new MutationObserver(() => {
                if (checkForChat()) {
                    observer.disconnect();
                }
            });

            observer.observe(document.body, { childList: true, subtree: true });

            cleanup.trackCustom(() => observer.disconnect());
        }
    }

    /**
     * Setup keyboard listener
     */
    function setupKeyboard() {
        const { lib } = getDeps();

        if (lib) {
            const eventId = lib.events.on(window, "keydown", handleKeydown);
            cleanup.trackEvent(eventId);
        } else {
            window.addEventListener("keydown", handleKeydown);
            cleanup.trackCustom(() => window.removeEventListener("keydown", handleKeydown));
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    /**
     * Initialize the module
     */
    function init() {
        if (isInitialized) return;
        isInitialized = true;

        const { lib } = getDeps();

        // Create cleanup tracker
        if (lib) {
            cleanup = lib.createCleanup();
        } else {
            // Simple cleanup fallback
            const customCleanups = [];
            cleanup = {
                trackEvent: () => {},
                trackObserver: () => {},
                trackInterval: () => {},
                trackCustom: (fn) => customCleanups.push(fn),
                run: () => customCleanups.forEach(fn => fn())
            };
        }

        // Load saved reset key
        loadResetKey();

        // Setup observers and keyboard
        setupBodyObserver();
        setupKeyboard();
    }

    /**
     * Destroy the module
     */
    function destroy() {
        if (!isInitialized) return;
        isInitialized = false;

        if (cleanup) {
            cleanup.run();
            cleanup = null;
        }
    }

    // ==========================================
    // START INITIALIZATION
    // ==========================================

    // Initialize when DOM is ready
    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", init);
    } else {
        init();
    }

    // ==========================================
    // EXPOSE API
    // ==========================================

    window.FameNotifier = Object.freeze({
        // Getters
        getGained: () => getTotal(STORAGE_KEYS.GAINED),
        getLost: () => getTotal(STORAGE_KEYS.LOST),
        getNet: () => getTotal(STORAGE_KEYS.GAINED) - getTotal(STORAGE_KEYS.LOST),
        
        // Actions
        reset,
        
        // Keybind
        setResetKey,
        getResetKey,
        
        // Module control
        destroy,
        reinit: () => {
            destroy();
            init();
        }
    });

})();
