// ==========================================
// DELTA UI CONFIGURATION v3.7
// ==========================================

(function() {
    "use strict";

    const VERSION = "1.0";
    const ASSET_VERSION = "8829640";
    const BASE_URL = "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/";

    function buildReplacements() {
        const items = {
            "staff/staff7": "staff7_q4.webp",
            "armlet/armlet5": "armlet5_q4.avif",
            "armor/armor4": "armor4_q4.avif",
            "bag/bag2": "bag2_q4.avif",
            "boot/boot5": "boot5_q4.avif",
            "glove/glove5": "glove5_q4.avif",
            "ring/ring4": "ring4_q4.avif",
            "amulet/amulet4": "amulet4_q4.avif",
            "orb/orb4": "orb4_q4.avif",
            "bow/bow7": "bow7_q4.webp",
            "hammer/hammer7": "hammer7_q4.webp",
            "sword/sword7": "sword7_q4.webp",
            "totem/totem4": "totem4_q4.avif",
            "quiver/quiver4": "quiver4_q4.avif",
            "shield/shield4": "shield4_q4.avif",
        };

        const result = {};
        for (const [path, replacement] of Object.entries(items)) {
            result[`items/${path}_q3.avif`] = BASE_URL + replacement;
            result[`items/${path}_grey.avif`] = BASE_URL + replacement;
        }
        return result;
    }

    const asset = (path) => `${path}?v=${ASSET_VERSION}`;

    window.DELTA_CONFIG = {
        version: VERSION,
        assetVersion: ASSET_VERSION,

        timing: {
            INIT_DELAY: 300,
            SETTINGS_LOAD: 2000,
            SLOW_POLL: 2000,
            ELEMENT_WAIT: 250,
        },

        replacements: buildReplacements(),

        buffIcons: {
            warrior: [
                { id: "buff_2", src: "/data/ui/skills/2.avif", name: "Bulwark" },
                { id: "buff_17", src: "/data/ui/skills/17.avif", name: "Enrage" },
                { id: "buff_18", src: "/data/ui/skills/18.avif", name: "Centrifugal Laceration" },
                { id: "buff_46", src: "/data/ui/skills/46.avif", name: "Whirlwind" },
                { id: "buff_19", src: "/data/ui/skills/19.avif", name: "Warcry" },
                { id: "buff_20", src: "/data/ui/skills/20.avif", name: "Crusader" },
                { id: "buff_34", src: "/data/ui/skills/34.avif", name: "Taunt" },
                { id: "buff_50", src: "/data/ui/skills/50.avif", name: "Relentless Cry" },
            ],
            archer: [
                { id: "buff_11", src: "/data/ui/skills/11.avif", name: "Invigorate" },
                { id: "buff_29", src: "/data/ui/skills/29.avif", name: "Poison Arrows" },
                { id: "buff_49", src: "/data/ui/skills/49.avif", name: "Blind Shot" },
                { id: "buff_45", src: "/data/ui/skills/45.avif", name: "Volley" },
                { id: "buff_25", src: "/data/ui/skills/25.avif", name: "Temporal Dilation" },
                { id: "buff_27", src: "/data/ui/skills/27.avif", name: "Pathfinding" },
                { id: "buff_38", src: "/data/ui/skills/38.avif", name: "Dash" },
            ],
            mage: [
                { id: "buff_22", src: "/data/ui/skills/22.avif", name: "Aura of Focus" },
                { id: "buff_24", src: "/data/ui/skills/24.avif", name: "Enchantment" },
                { id: "buff_14", src: "/data/ui/skills/14.avif", name: "Radiance" },
                { id: "buff_53", src: "/data/ui/skills/53.avif", name: "Ice Block" },
                { id: "buff_23", src: "/data/ui/skills/23.avif", name: "Ice Shield" },
                { id: "buff_52", src: "/data/ui/skills/52.avif", name: "Frostcall" },
                { id: "buff_16", src: "/data/ui/skills/16.avif", name: "Hypothermia" },
                { id: "buff_frozenBuff", src: "/data/ui/skills/frozenBuff.avif", name: "Frozen Buff" },
                { id: "buff_deepFrozen", src: "/data/ui/skills/deepFrozen.avif", name: "Deep Frozen" },
            ],
            shaman: [
                { id: "buff_28", src: "/data/ui/skills/28.avif", name: "Canine Howl" },
                { id: "buff_13", src: "/data/ui/skills/13.avif", name: "Mimir's Well" },
                { id: "buff_7", src: "/data/ui/skills/7.avif", name: "Revitalize" },
                { id: "buff_37", src: "/data/ui/skills/37.avif", name: "Agonize" },
                { id: "buff_12", src: "/data/ui/skills/12.avif", name: "Decay" },
                { id: "buff_43", src: "/data/ui/skills/43.avif", name: "Plague" },
            ],
        },

        utilityBuffs: [
            { id: "charm_skull", src: "/data/items/charm/charm2_q3.avif", name: "Skull" },
            { id: "charm_candle", src: "/data/items/charm/charm11_q3.avif", name: "Ghost Candles" },
            { id: "charm_talon", src: "/data/items/charm/charm6_q3.avif", name: "Talon" },
            { id: "charm_crimson", src: "/data/items/charm/charm5_q3.avif", name: "Crimson Blade" },
            { id: "charm_marble", src: "/data/items/charm/charm4_q3.avif", name: "Marble" },
            { id: "charm_pennant", src: "/data/items/charm/charm3_q3.avif", name: "Ship Pennant" },
            { id: "charm_egg", src: "/data/items/charm/charm1_q3.avif", name: "Egg" },
            { id: "charm_orc", src: "/data/items/charm/charm13_q3.avif", name: "Orc Skull" },
            { id: "charm_aegis", src: "/data/items/charm/charm12_q3.avif", name: "Spiked Aegis" },
            { id: "charm_shroom", src: "/data/items/charm/charm10_q3.avif", name: "Fae Shroom" },
            { id: "charm_frog", src: "/data/items/charm/charm8_q3.avif", name: "Frog Lungs" },
            { id: "charm_blood", src: "/data/items/charm/charm7_q3.avif", name: "Blood Ritual" },
            { id: "charm_gamble", src: "/data/items/charm/charm14_q3.avif", name: "Gamble" },
            { id: "pot_large_mp", src: "/data/items/misc/misc5_q0.avif", name: "Large MP Potion" },
            { id: "pot_large_hp", src: "/data/items/misc/misc4_q0.avif", name: "Large HP Potion" },
            { id: "pot_medium_mp", src: "/data/items/misc/misc3_q0.avif", name: "Medium MP Potion" },
            { id: "pot_medium_hp", src: "/data/items/misc/misc2_q0.avif", name: "Medium HP Potion" },
            { id: "pot_small_mp", src: "/data/items/misc/misc1_q0.avif", name: "Small MP Potion" },
            { id: "pot_small_hp", src: "/data/items/misc/misc0_q0.avif", name: "Small HP Potion" },
        ],

        ccEffects: [
            { id: "cc_deepFrozen", src: "/data/ui/skills/deepFrozen.avif", name: "Deep Frozen", color: "#0088ff", priority: 1 },
            { id: "cc_14", src: "/data/ui/skills/14.avif", name: "Radiance", color: "#0088ff", priority: 6 },
            { id: "cc_37", src: "/data/ui/skills/37.avif", name: "Agonize", color: "#ff0000", priority: 10 },
            { id: "cc_stunBuff", src: "/data/ui/skills/stunBuff.avif", name: "Stun", color: "#ff0000", priority: 10 },
            { id: "cc_49", src: "/data/ui/skills/49.avif", name: "Blind Shot", color: "#ffff00", priority: 5 },
            { id: "cc_50", src: "/data/ui/skills/50.avif", name: "Relentless Cry", color: "#ffff00", priority: 5 },
        ],

        fpsOptions: [
            { id: "fps_minimap", selector: ".l-corner-ul", name: "Minimap", default: true },
            { id: "fps_topbar", selector: ".l-corner-ur > small.bar", name: "Top Resource Bar", default: true },
            { id: "fps_expbar", selector: "#expbar", name: "Experience Bar", default: true },
            { id: "fps_leaderboard", selector: '.window-pos:has(.titleframe img[src*="trophy.svg"])', name: "Leaderboard", default: true },
            { id: "fps_avatars", selector: 'img[src^="data:image"]', name: "Player Avatars", default: true },
            { id: "fps_cooldown_overlay", selector: ".overlay.offCd", name: "Cooldown Overlays", default: true },
            { id: "fps_queued_overlay", selector: ".overlay.queued", name: "Queued Skill Overlay", default: true },
            { id: "fps_autocast", selector: ".autocast", name: "Autocast Indicators", default: true },
            { id: "fps_damage_numbers", selector: ".panel-black.container.svelte-1wip79f", name: "Floating Numbers", default: true },
        ],

        defaults: {
            skillbarColors: {
                skp: "#9d00ff", sk: "#9d00ff", skq: "#ffb76a", skt: "#ffe248",
                skf: "#e9bc82", skx: "#f9994d", skr: "#ff0018", ske: "#ff0018",
                sk1: "#b03714", sk2: "#7d4db1", sk3: "#9df4fd", sk4: "#00fc84",
                sk5: "#40edff", sk6: "#030801", skz: "#b4d296",
            },

            charmColors: {
                charm0: "#aedbf8", charm1: "#abe7e5", charm2: "#df5826", charm3: "#6b1ec4",
                charm4: "#8b5cf6", charm5: "#dc2626", charm6: "#b6a904", charm7: "#7f1d1d",
                charm8: "#ffffff", charm9: "#00fc84", charm10: "#b63a64", charm11: "#40edff",
                charm12: "#6b7280", charm13: "#78350f", charm14: "#ffdb6b",
            },

            petColor: "#0aa2af",
            fullscreenKey: "o",
            partyResetKey: "n",
            
            toggles: {
                ccIndicator: true,
                hideBuffs: false,
                fpsMode: false,
                chatTweaks: true,
                itemRecolor: true,
                charmColors: true,
                playtimeLabels: true,
                fameLabels: true,
                mouseover: false,
                partyUIEditor: false,
                canvasScaler: false,
            },

            hiddenBuffs: {},
            ccSettings: {},
            fpsSettings: {},
        },

        charmNames: {
            charm0: "Bell", charm1: "Egg", charm2: "Skull", charm3: "Ship Pennant",
            charm4: "Marble", charm5: "Crimson Blade", charm6: "Talon", charm7: "Blood Ritual",
            charm8: "Frog Lungs", charm9: "Forest Veil", charm10: "Fae Shroom", charm11: "Ghost Candles",
            charm12: "Spiked Aegis", charm13: "Orc Skull", charm14: "Gamble",
        },

        classIcons: {
            bgc0: asset("/data/ui/classes/0.avif"),
            bgc1: asset("/data/ui/classes/1.avif"),
            bgc2: asset("/data/ui/classes/2.avif"),
            bgc3: asset("/data/ui/classes/3.avif"),
        },

        factionIcons: {
            warrior: asset("/data/ui/classes/0.avif"),
            mage: asset("/data/ui/classes/1.avif"),
            archer: asset("/data/ui/classes/2.avif"),
            shaman: asset("/data/ui/classes/3.avif"),
            fame: asset("/data/ui/currency/fame.svg"),
            vg: asset("/data/ui/factions/0.avif"),
            bl: asset("/data/ui/factions/1.avif"),
        },

        qualityColors: {
            RED: "#ff0000",
            ORANGE: "#ff7600",
            PURPLE: "#9E3BF9",
            BLUE: "#0681ea",
            GREEN: "#34CB49",
            GREY: "#5b858e",
            UPGRADE: "#eab379",
        },

        storageKeys: {
            FAME_GAINED: "totalFameGained",
            FAME_LOST: "totalFameLost",
            PLAYTIME: "totalPlaytime",
            SKILLBAR_COLORS: "deltaUI_skillbarColors",
            CHARM_COLORS: "deltaUI_charmColors",
            PET_COLOR: "deltaUI_petColor",
            FULLSCREEN_KEY: "deltaUI_fullscreenKey",
            HIDDEN_BUFFS: "deltaUI_hiddenBuffs",
            CC_SETTINGS: "deltaUI_ccSettings",
            FPS_SETTINGS: "deltaUI_fpsSettings",
        },

        skillColors: {
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
            "52": "#66bb6a", "54": "#e0e0e0",
        },
    };

    console.log(`✅ Delta UI Config v${VERSION} loaded`);
})();
