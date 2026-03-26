// ==========================================
// DELTA UI CONFIGURATION v3.0
// Central configuration for all modules
// ==========================================

(function() {
    "use strict";

    if (window.DELTA_CONFIG) {
        console.warn("[Delta Config] Already loaded");
        return;
    }

    // ==========================================
    // CONSTANTS
    // ==========================================

    const VERSION = "3.0.0";
    const ASSET_VERSION = "8829640";

    // ==========================================
    // HELPER FUNCTIONS
    // ==========================================

    /**
     * Build asset URL with cache busting
     * @param {string} path - Asset path
     * @returns {string}
     */
    const asset = (path) => `${path}?v=${ASSET_VERSION}`;

    // ==========================================
    // STORAGE KEYS
    // ==========================================

    const STORAGE_KEYS = {
        // Feature toggles prefix
        TOGGLE_PREFIX: "deltaUI_",
        
        // Colors
        SKILLBAR_COLORS: "deltaUI_skillbarColors",
        
        // Keybinds
        FULLSCREEN_KEY: "deltaUI_fullscreenKey",
        FAME_RESET_KEY: "deltaUI_fameResetKey",
        
        // Canvas
        CANVAS_SCALE: "deltaUI_canvasScale",
        
        // Stats
        FAME_GAINED: "totalFameGained",
        FAME_LOST: "totalFameLost",
        PLAYTIME: "totalPlaytime",
        
        // Module-specific
        PARTY_ORDER: "hordesPartyOrder_v6",
        PARTY_LOCKED: "hordesPartyLocked_v6",
        CHAT_POSITION: "hordes_chat_v7"
    };

    // ==========================================
    // TIMING CONSTANTS
    // ==========================================

    const TIMING = {
        // Initialization
        INIT_DELAY: 300,
        ELEMENT_WAIT: 250,
        GAME_CHECK_INTERVAL: 200,
        GAME_CHECK_TIMEOUT: 30000,
        
        // Update loops
        FAST_UPDATE: 100,
        NORMAL_UPDATE: 500,
        SLOW_UPDATE: 2000,
        
        // Debouncing
        DEBOUNCE_FAST: 50,
        DEBOUNCE_NORMAL: 150,
        DEBOUNCE_SLOW: 300,
        
        // Animations
        TOAST_DURATION: 2500,
        TOAST_ERROR_DURATION: 4000
    };

    // ==========================================
    // DEFAULT VALUES
    // ==========================================

    const DEFAULTS = {
        // Feature toggles
        toggles: {
            chatTweaks: true,
            playtimeLabels: true,
            fameLabels: true,
            mouseover: false,
            partyUIEditor: false,
            canvasScaler: false
        },

        // Keybinds
        keybinds: {
            fullscreen: "o",
            fameReset: "["
        },

        // Skillbar slot colors
        skillbarColors: {
            skp: "#9d00ff",
            sk: "#9d00ff",
            skq: "#ffb76a",
            skt: "#ffe248",
            skf: "#e9bc82",
            skx: "#f9994d",
            skr: "#ff0018",
            ske: "#ff0018",
            sk1: "#b03714",
            sk2: "#7d4db1",
            sk3: "#9df4fd",
            sk4: "#00fc84",
            sk5: "#40edff",
            sk6: "#030801",
            skz: "#b4d296"
        },

        // Canvas scale
        canvasScale: 1.0
    };

    // ==========================================
    // CLASS ICONS
    // ==========================================

    const CLASS_ICONS = {
        warrior: asset("/data/ui/classes/0.avif"),
        mage: asset("/data/ui/classes/1.avif"),
        archer: asset("/data/ui/classes/2.avif"),
        shaman: asset("/data/ui/classes/3.avif")
    };

    const CLASS_ICON_BY_BG = {
        bgc0: CLASS_ICONS.warrior,
        bgc1: CLASS_ICONS.mage,
        bgc2: CLASS_ICONS.archer,
        bgc3: CLASS_ICONS.shaman
    };

    // ==========================================
    // FACTION ICONS
    // ==========================================

    const FACTION_ICONS = {
        vg: asset("/data/ui/factions/0.avif"),
        bl: asset("/data/ui/factions/1.avif"),
        fame: asset("/data/ui/currency/fame.svg"),
        warrior: CLASS_ICONS.warrior,
        mage: CLASS_ICONS.mage,
        archer: CLASS_ICONS.archer,
        shaman: CLASS_ICONS.shaman
    };

    // ==========================================
    // SKILL COLORS (For skills window)
    // ==========================================

    const SKILL_COLORS = {
        "0": "#c9a66b", "1": "#e85a5a", "2": "#5a9de8", "3": "#e8a85a",
        "4": "#00bfff", "5": "#98d4a0", "6": "#81d4fa", "7": "#4fc3f7",
        "8": "#8b0000", "9": "#4dd0e1", "10": "#7cb342", "11": "#66bb6a",
        "12": "#7e57c2", "13": "#4dd0e1", "14": "#00acc1", "15": "#8bc34a",
        "16": "#689f38", "17": "#ff4444", "18": "#cc3333", "19": "#6b1a6b",
        "20": "#f0c040", "21": "#708090", "22": "#29b6f6", "23": "#80deea",
        "24": "#ce93d8", "25": "#80deea", "26": "#ef5350", "27": "#a5d6a7",
        "28": "#ffb74d", "29": "#9c27b0", "30": "#4dd0e1", "31": "#ffca28",
        "32": "#f48fb1", "33": "#44aaff", "34": "#ff8800", "35": "#9575cd",
        "36": "#4fc3f7", "37": "#7cb342", "38": "#42a5f5", "39": "#8b4513",
        "40": "#9966ff", "41": "#cd853f", "42": "#ec407a", "43": "#8d6e63",
        "44": "#ffb300", "45": "#ff7043", "46": "#ff6666", "47": "#4db6ac",
        "48": "#b71c1c", "49": "#fff176", "50": "#ffcc00", "51": "#7e57c2",
        "52": "#66bb6a", "54": "#e0e0e0"
    };

    // ==========================================
    // DOM SELECTORS
    // ==========================================

    const SELECTORS = {
        // Main containers
        chat: "#chat",
        chatInput: "#chatinput",
        channelSelect: ".channelselect",
        skillbar: "#skillbar",
        partyFrames: ".partyframes",
        btnBar: ".btnbar",
        
        // Canvas
        canvasMain: ".l-canvas:first-of-type",
        canvasUI: ".l-canvas:nth-of-type(2)",
        
        // Corners
        cornerUL: ".l-corner-ul",
        cornerUR: ".l-corner-ur",
        
        // Windows
        windowPanel: ".window.panel-black.svelte-1f1v3u3",
        windowPos: ".window-pos",
        
        // Party
        partyFrame: ".partyframes > .grid.left",
        partyBars: ".panel-black.barsInner.targetable",
        partyBuffs: ".buffarray.party",
        
        // DPS bars
        dpsBar: ".window.panel-black.svelte-1f1v3u3 .wrapper .bar .progressBar"
    };

    // ==========================================
    // EXPORT CONFIG
    // ==========================================

    window.DELTA_CONFIG = Object.freeze({
        // Metadata
        version: VERSION,
        assetVersion: ASSET_VERSION,
        
        // Core settings
        timing: TIMING,
        storageKeys: STORAGE_KEYS,
        selectors: SELECTORS,
        
        // Defaults
        defaults: DEFAULTS,
        
        // Icons
        classIcons: CLASS_ICONS,
        classIconByBg: CLASS_ICON_BY_BG,
        factionIcons: FACTION_ICONS,
        
        // Skill colors
        skillColors: SKILL_COLORS
    });

    console.log(`[Delta Config] v${VERSION} loaded`);

})();
