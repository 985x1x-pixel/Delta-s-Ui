// ==========================================
// DELTA UI CONFIGURATION v3.7
// ==========================================

const ASSET_VERSION = "8829640";

window.DELTA_CONFIG = {
    version: "3.7",

    timing: {
        INIT_DELAY: 300,
        SETTINGS_LOAD: 2000,
        SLOW_POLL: 2000,
        ELEMENT_WAIT: 250,
    },

    replacements: {
        "items/staff/staff7_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/staff7_q4.webp",
        "items/armlet/armlet5_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/armlet5_q4.avif",
        "items/armor/armor4_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/armor4_q4.avif",
        "items/bag/bag2_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/bag2_q4.avif",
        "items/boot/boot5_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/boot5_q4.avif",
        "items/glove/glove5_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/glove5_q4.avif",
        "items/ring/ring4_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/ring4_q4.avif",
        "items/amulet/amulet4_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/amulet4_q4.avif",
        "items/orb/orb4_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/orb4_q4.avif",
        "items/bow/bow7_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/bow7_q4.webp",
        "items/hammer/hammer7_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/hammer7_q4.webp",
        "items/sword/sword7_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/sword7_q4.webp",
        "items/totem/totem4_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/totem4_q4.avif",
        "items/quiver/quiver4_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/quiver4_q4.avif",
        "items/shield/shield4_q3.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/shield4_q4.avif",
    
        "items/staff/staff7_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/staff7_q4.webp",
        "items/armlet/armlet5_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/armlet5_q4.avif",
        "items/armor/armor4_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/armor4_q4.avif",
        "items/bag/bag2_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/bag2_q4.avif",
        "items/boot/boot5_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/boot5_q4.avif",
        "items/glove/glove5_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/glove5_q4.avif",
        "items/ring/ring4_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/ring4_q4.avif",
        "items/amulet/amulet4_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/amulet4_q4.avif",
        "items/orb/orb4_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/orb4_q4.avif",
        "items/bow/bow7_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/bow7_q4.webp",
        "items/hammer/hammer7_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/hammer7_q4.webp",
        "items/sword/sword7_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/sword7_q4.webp",
        "items/totem/totem4_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/totem4_q4.avif",
        "items/quiver/quiver4_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/quiver4_q4.avif",
        "items/shield/shield4_grey.avif": "https://raw.githubusercontent.com/985x1x-pixel/Delta-s-Ui/refs/heads/main/work%20in%20progress/shield4_q4.avif",
    },

    // All buff icons organized by class
    buffIcons: {
        warrior: [
            { id: "buff_2", src: "/data/ui/skills/2.avif", name: "Skill 2" },
            { id: "buff_17", src: "/data/ui/skills/17.avif", name: "Skill 17" },
            { id: "buff_18", src: "/data/ui/skills/18.avif", name: "Skill 18" },
            { id: "buff_46", src: "/data/ui/skills/46.avif", name: "Skill 46" },
            { id: "buff_19", src: "/data/ui/skills/19.avif", name: "Skill 19" },
            { id: "buff_20", src: "/data/ui/skills/20.avif", name: "Skill 20" },
            { id: "buff_34", src: "/data/ui/skills/34.avif", name: "Skill 34" },
            { id: "buff_50", src: "/data/ui/skills/50.avif", name: "Skill 50" },
        ],
        archer: [
            { id: "buff_11", src: "/data/ui/skills/11.avif", name: "Skill 11" },
            { id: "buff_29", src: "/data/ui/skills/29.avif", name: "Skill 29" },
            { id: "buff_49", src: "/data/ui/skills/49.avif", name: "Skill 49" },
            { id: "buff_45", src: "/data/ui/skills/45.avif", name: "Skill 45" },
            { id: "buff_25", src: "/data/ui/skills/25.avif", name: "Skill 25" },
            { id: "buff_27", src: "/data/ui/skills/27.avif", name: "Skill 27" },
            { id: "buff_38", src: "/data/ui/skills/38.avif", name: "Skill 38" },
        ],
        mage: [
            { id: "buff_22", src: "/data/ui/skills/22.avif", name: "Skill 22" },
            { id: "buff_24", src: "/data/ui/skills/24.avif", name: "Skill 24" },
            { id: "buff_14", src: "/data/ui/skills/14.avif", name: "Skill 14" },
            { id: "buff_53", src: "/data/ui/skills/53.avif", name: "Skill 53" },
            { id: "buff_23", src: "/data/ui/skills/23.avif", name: "Skill 23" },
            { id: "buff_52", src: "/data/ui/skills/52.avif", name: "Skill 52" },
            { id: "buff_16", src: "/data/ui/skills/16.avif", name: "Skill 16" },
            { id: "buff_frozenBuff", src: "/data/ui/skills/frozenBuff.avif", name: "Frozen Buff" },
            { id: "buff_deepFrozen", src: "/data/ui/skills/deepFrozen.avif", name: "Deep Frozen" },
        ],
        shaman: [
            { id: "buff_28", src: "/data/ui/skills/28.avif", name: "Skill 28" },
            { id: "buff_13", src: "/data/ui/skills/13.avif", name: "Skill 13" },
            { id: "buff_7", src: "/data/ui/skills/7.avif", name: "Skill 7" },
            { id: "buff_37", src: "/data/ui/skills/37.avif", name: "Skill 37" },
            { id: "buff_12", src: "/data/ui/skills/12.avif", name: "Skill 12" },
            { id: "buff_43", src: "/data/ui/skills/43.avif", name: "Skill 43" },
        ],
    },

    // CC Effects with customizable color and priority
    ccEffects: [
        { id: "cc_deepFrozen", src: "/data/ui/skills/deepFrozen.avif", name: "Deep Frozen", color: "#0088ff", priority: 1 },
        { id: "cc_14", src: "/data/ui/skills/14.avif", name: "Skill 14", color: "#0088ff", priority: 6 },
        { id: "cc_37", src: "/data/ui/skills/37.avif", name: "Skill 37", color: "#ff0000", priority: 10 },
        { id: "cc_stunBuff", src: "/data/ui/skills/stunBuff.avif", name: "Stun", color: "#ff0000", priority: 10 },
        { id: "cc_49", src: "/data/ui/skills/49.avif", name: "Skill 49", color: "#ffff00", priority: 5 },
        { id: "cc_50", src: "/data/ui/skills/50.avif", name: "Skill 50", color: "#ffff00", priority: 5 },
    ],
    
    defaults: {
        skillbarColors: {
            "skp": "#9d00ff",
            "sk": "#9d00ff",
            "skq": "#ffb76a",
            "skt": "#ffe248",
            "skf": "#e9bc82",
            "skx": "#f9994d",
            "skr": "#ff0018",
            "ske": "#ff0018",
            "sk1": "#b03714",
            "sk2": "#7d4db1",
            "sk3": "#9df4fd",
            "sk4": "#00fc84",
            "sk5": "#40edff",
            "sk6": "#030801",
            "skz": "#b4d296",
        },

        charmColors: {
            "charm0": "#aedbf8",
            "charm1": "#abe7e5",
            "charm2": "#df5826",
            "charm3": "#6b1ec4",
            "charm4": "#8b5cf6",
            "charm5": "#dc2626",
            "charm6": "#b6a904",
            "charm7": "#7f1d1d",
            "charm8": "#ffffff",
            "charm9": "#00fc84",
            "charm10": "#b63a64",
            "charm11": "#40edff",
            "charm12": "#6b7280",
            "charm13": "#78350f",
            "charm14": "#ffdb6b",
        },

        petColor: "#0aa2af",

        fullscreenKey: "o",
        
        toggles: {
            ccIndicator: true,
            hideBuffs: false,
            fpsMode: false,
            chatTweaks: true,
            itemRecolor: true,
            charmColors: true,
            playtimeLabels: true,
            fameLabels: true,
        },

        // Default hidden buffs (all false = visible)
        hiddenBuffs: {},

        // Default CC settings
        ccSettings: {
            "cc_deepFrozen": { color: "#0088ff", priority: 1 },
            "cc_14": { color: "#0088ff", priority: 6 },
            "cc_37": { color: "#ff0000", priority: 10 },
            "cc_stunBuff": { color: "#ff0000", priority: 10 },
            "cc_49": { color: "#ffff00", priority: 5 },
            "cc_50": { color: "#ffff00", priority: 5 },
        },
    },

    charmNames: {
        "charm0": "Bell",
        "charm1": "Egg",
        "charm2": "Skull",
        "charm3": "Ship Pennant",
        "charm4": "Marble",
        "charm5": "Crimson Blade",
        "charm6": "Talon",
        "charm7": "Blood Ritual",
        "charm8": "Frog Lungs",
        "charm9": "Forest Veil",
        "charm10": "Fae Shroom",
        "charm11": "Ghost Candles",
        "charm12": "Spiked Aegis",
        "charm13": "Orc Skull",
        "charm14": "Gamble",
    },

    classIcons: {
        "bgc0": `/data/ui/classes/0.avif?v=${ASSET_VERSION}`,
        "bgc1": `/data/ui/classes/1.avif?v=${ASSET_VERSION}`,
        "bgc2": `/data/ui/classes/2.avif?v=${ASSET_VERSION}`,
        "bgc3": `/data/ui/classes/3.avif?v=${ASSET_VERSION}`,
    },

    factionIcons: {
        warrior: `/data/ui/classes/0.avif?v=${ASSET_VERSION}`,
        mage: `/data/ui/classes/1.avif?v=${ASSET_VERSION}`,
        archer: `/data/ui/classes/2.avif?v=${ASSET_VERSION}`,
        shaman: `/data/ui/classes/3.avif?v=${ASSET_VERSION}`,
        fame: `/data/ui/currency/fame.svg?v=${ASSET_VERSION}`,
        vg: `/data/ui/factions/0.avif?v=${ASSET_VERSION}`,
        bl: `/data/ui/factions/1.avif?v=${ASSET_VERSION}`,
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
    },

    skillColors: {
        "8": "#8b0000", "39": "#8b4513", "40": "#9966ff",
        "0": "#c9a66b", "1": "#e85a5a", "2": "#5a9de8", "3": "#e8a85a",
        "17": "#ff4444", "18": "#cc3333", "19": "#6b1a6b", "20": "#f0c040",
        "21": "#708090", "33": "#44aaff", "34": "#ff8800", "41": "#cd853f",
        "46": "#ff6666", "50": "#ffcc00",
        "5": "#98d4a0", "9": "#4dd0e1", "10": "#7cb342", "11": "#66bb6a",
        "25": "#80deea", "26": "#ef5350", "27": "#a5d6a7", "29": "#9c27b0",
        "31": "#ffca28", "38": "#42a5f5", "45": "#ff7043", "48": "#b71c1c",
        "49": "#fff176", "54": "#e0e0e0",
        "4": "#00bfff", "6": "#81d4fa", "7": "#4fc3f7", "12": "#7e57c2",
        "13": "#4dd0e1", "14": "#00acc1", "22": "#29b6f6", "23": "#80deea",
        "24": "#ce93d8", "28": "#ffb74d", "30": "#4dd0e1",
        "15": "#8bc34a", "16": "#689f38", "32": "#f48fb1", "35": "#9575cd",
        "36": "#4fc3f7", "37": "#7cb342", "42": "#ec407a", "43": "#8d6e63",
        "44": "#ffb300", "47": "#4db6ac", "51": "#7e57c2", "52": "#66bb6a",
    },
};

console.log("Delta UI Config v" + window.DELTA_CONFIG.version + " loaded");
