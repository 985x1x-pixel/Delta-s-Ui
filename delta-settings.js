(function() {
    "use strict";

    // Wait for CONFIG to be available
    function waitForConfig(callback) {
        if (window.DELTA_CONFIG && window.DeltaUI) {
            callback();
        } else {
            setTimeout(() => waitForConfig(callback), 50);
        }
    }

    waitForConfig(initSettings);

    function initSettings() {
        const CONFIG = window.DELTA_CONFIG;
        const DeltaUI = window.DeltaUI;

        // ==========================================
        // SETTINGS WINDOW STATE
        // ==========================================

        let deltaSettingsWindow = null;
        let isDragging = false;
        let dragOffset = { x: 0, y: 0 };

        // ==========================================
        // HELPER FUNCTIONS
        // ==========================================

        const $ = (sel, root = document) => root.querySelector(sel);
        const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

        function getToggle(key, defaultVal = false) {
            const saved = localStorage.getItem("deltaUI_" + key);
            return saved !== null ? saved === "true" : defaultVal;
        }

        function createSettingRow(label, description, toggleId, isEnabled) {
            return `
                <div>${label}<br><small class="textgrey">${description}</small></div>
                <div class="btn checkbox ${isEnabled ? "active" : ""}" data-toggle="${toggleId}"></div>
            `;
        }

        // ==========================================
        // SKILLBAR SCANNER
        // ==========================================

        function scanSkillbar() {
            const skillbar = $("#skillbar");
            const slots = [];
            if (!skillbar) return slots;

            $$(".slot[id]", skillbar).forEach(slot => {
                const id = slot.id;
                if (id && id.startsWith("sk")) {
                    const keyText = $(".slottext.key", slot);
                    const keybind = keyText ? keyText.textContent.trim() : id.replace("sk", "").toUpperCase();
                    slots.push({
                        id,
                        keybind,
                        color: CONFIG.skillbarColors[id] || "#ffffff"
                    });
                }
            });

            return slots;
        }

        // ==========================================
        // COLOR ROW GENERATORS
        // ==========================================

        function generateSkillbarColorRows(slots) {
            if (slots.length === 0) {
                return Object.entries(CONFIG.skillbarColors).map(([id, color]) => {
                    const key = id.replace("sk", "").toUpperCase();
                    return `
                        <div class="color-row" data-skill-id="${id}">
                            <div class="label">
                                <div class="color-preview" style="background: ${color};"></div>
                                <span class="keybind">${key}</span>
                                Skill Slot
                            </div>
                            <input type="color" class="skill-color-input" data-skill-id="${id}" value="${color}">
                        </div>
                    `;
                }).join("");
            }

            return slots.map(slot => `
                <div class="color-row" data-skill-id="${slot.id}">
                    <div class="label">
                        <div class="color-preview" style="background: ${slot.color};"></div>
                        <span class="keybind">${slot.keybind}</span>
                        Skill Slot
                    </div>
                    <input type="color" class="skill-color-input" data-skill-id="${slot.id}" value="${slot.color}">
                </div>
            `).join("");
        }

        function generateCharmColorRows() {
            return Object.entries(CONFIG.charmColors).map(([charm, color]) => {
                const name = CONFIG.charmNames[charm] || charm;
                return `
                    <div class="color-row" data-charm-id="${charm}">
                        <div class="label">
                            <div class="color-preview" style="background: ${color};"></div>
                            ${name}
                        </div>
                        <input type="color" class="charm-color-input" data-charm-id="${charm}" value="${color}">
                    </div>
                `;
            }).join("");
        }

        // ==========================================
        // WINDOW MANAGEMENT
        // ==========================================

        function closeDeltaSettingsWindow() {
            if (deltaSettingsWindow) {
                deltaSettingsWindow.remove();
                deltaSettingsWindow = null;
            }
            isDragging = false;
        }

        function toggleDeltaSettings() {
            if (deltaSettingsWindow && document.contains(deltaSettingsWindow)) {
                closeDeltaSettingsWindow();
            } else {
                createDeltaSettingsWindow();
            }
        }

        // ==========================================
        // CREATE SETTINGS WINDOW
        // ==========================================

        function createDeltaSettingsWindow() {
            if (deltaSettingsWindow) deltaSettingsWindow.remove();

            deltaSettingsWindow = document.createElement("div");
            deltaSettingsWindow.id = "delta-settings-window";

            const skillbarSlots = scanSkillbar();

            deltaSettingsWindow.innerHTML = `
                <div class="window">
                    <div class="titleframe">
                        <img src="/data/ui/icons/cog.svg" class="titleicon" alt="">
                        <div class="title">
                            <span class="title-delta">Δ</span> Delta UI
                            <span class="title-version">v${CONFIG.version}</span>
                        </div>
                        <div class="btn close-btn">✕</div>
                    </div>

                    <div class="divide">
                        <div class="nav-sidebar">
                            <div class="choice active" data-tab="features">
                                <span class="tab-icon">⚡</span> Features
                            </div>
                            <div class="choice" data-tab="colors">
                                <span class="tab-icon">🎨</span> Colors
                            </div>
                            <div class="choice" data-tab="mounts">
                                <span class="tab-icon">🐎</span> Mounts
                            </div>
                        </div>

                        <div class="menu">
                            <!-- Features Tab -->
                            <div class="tab-panel active" data-panel="features">
                                <div class="textprimary">Gameplay</div>
                                <div class="settings">
                                    ${createSettingRow("CC Indicator", "Shows colored borders on CC'd party members", "ccIndicator", getToggle("ccIndicator", true))}
                                    ${createSettingRow("Hide Buffs", "Hides selected buff icons from party frames", "hideBuffs", getToggle("hideBuffs", false))}
                                    ${createSettingRow("FPS Mode", "Hides UI elements for better performance", "fpsMode", getToggle("fpsMode", false))}
                                </div>

                                <div class="textprimary">Chat</div>
                                <div class="settings">
                                    ${createSettingRow("Chat Tweaks", "Resizable chat window & controls", "chatTweaks", getToggle("chatTweaks", true))}
                                </div>

                                <div class="textprimary">Visual</div>
                                <div class="settings">
                                    ${createSettingRow("Item Recolor", "Colors item borders by quality %", "itemRecolor", getToggle("itemRecolor", true))}
                                    ${createSettingRow("Charm Colors", "Custom colors for charm items", "charmColors", getToggle("charmColors", true))}
                                </div>

                                <div class="textprimary">Stats Display</div>
                                <div class="settings">
                                    ${createSettingRow("Playtime Labels", "Show session & total playtime", "playtimeLabels", getToggle("playtimeLabels", true))}
                                    ${createSettingRow("Fame Labels", "Show fame gained/lost counters", "fameLabels", getToggle("fameLabels", true))}
                                </div>
                            </div>

                            <!-- Colors Tab -->
                            <div class="tab-panel" data-panel="colors">
                                <div class="textprimary">Skillbar Colours</div>
                                <div class="color-grid" id="skillbar-colors-container">
                                    ${generateSkillbarColorRows(skillbarSlots)}
                                </div>

                                <div class="textprimary">Charm Colours</div>
                                <div class="color-grid" id="charm-colors-container">
                                    ${generateCharmColorRows()}
                                </div>

                                <div class="textprimary">Pet Colour</div>
                                <div class="color-grid" id="pet-color-container">
                                    <div class="color-row full-width">
                                        <div class="label">
                                            <div class="color-preview" style="background: ${CONFIG.petColor};"></div>
                                            Pet Border Glow
                                        </div>
                                        <input type="color" id="pet-color-input" value="${CONFIG.petColor}">
                                    </div>
                                </div>

                                <div class="btn-row">
                                    <button class="btn btn-secondary" id="export-colors">📤 Export</button>
                                    <button class="btn btn-secondary" id="import-colors">📥 Import</button>
                                    <button class="btn btn-danger" id="reset-all-colors">↺ Reset</button>
                                </div>
                            </div>

                            <!-- Mounts Tab -->
                            <div class="tab-panel" data-panel="mounts">
                                <div class="empty-state">
                                    <div class="empty-icon">🐎</div>
                                    <div class="empty-title">Coming Soon</div>
                                    <div class="empty-desc">Mount customization will be added in a future update.</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="credits">
                        made with <span class="heart">♥</span> by <span>lordwar222</span>
                    </div>
                </div>
            `;

            document.body.appendChild(deltaSettingsWindow);

            // Force center positioning
            deltaSettingsWindow.style.position = "fixed";
            deltaSettingsWindow.style.top = "50%";
            deltaSettingsWindow.style.left = "50%";
            deltaSettingsWindow.style.transform = "translate(-50%, -50%)";
            deltaSettingsWindow.style.zIndex = "99999";

            setupEventListeners();
        }

        // ==========================================
        // EVENT LISTENERS
        // ==========================================

        function setupEventListeners() {
            if (!deltaSettingsWindow) return;

            // Close button
            $(".close-btn", deltaSettingsWindow).addEventListener("click", closeDeltaSettingsWindow);

            // Tab navigation
            $$(".choice", deltaSettingsWindow).forEach(choice => {
                choice.addEventListener("click", () => {
                    const targetTab = choice.dataset.tab;
                    $$(".choice", deltaSettingsWindow).forEach(c => c.classList.remove("active"));
                    choice.classList.add("active");
                    $$(".tab-panel", deltaSettingsWindow).forEach(panel => {
                        panel.classList.toggle("active", panel.dataset.panel === targetTab);
                    });
                });
            });

            // Checkbox toggles
            $$(".btn.checkbox[data-toggle]", deltaSettingsWindow).forEach(checkbox => {
                checkbox.addEventListener("click", () => {
                    const toggleId = checkbox.dataset.toggle;
                    const isNowActive = !checkbox.classList.contains("active");
                    checkbox.classList.toggle("active");
                    localStorage.setItem("deltaUI_" + toggleId, isNowActive.toString());

                    // Apply the setting
                    if (DeltaUI.applyToggle) {
                        DeltaUI.applyToggle(toggleId, isNowActive);
                    }

                    console.log("[Delta UI] " + toggleId + ": " + (isNowActive ? "Enabled" : "Disabled"));
                });
            });

            // Dragging
            const titleframe = $(".titleframe", deltaSettingsWindow);
            titleframe.addEventListener("mousedown", (e) => {
                if (e.target.closest(".close-btn")) return;
                isDragging = true;
                const rect = deltaSettingsWindow.getBoundingClientRect();
                dragOffset.x = e.clientX - rect.left;
                dragOffset.y = e.clientY - rect.top;
                deltaSettingsWindow.style.transform = "none";
                deltaSettingsWindow.style.left = rect.left + "px";
                deltaSettingsWindow.style.top = rect.top + "px";
            });

            document.addEventListener("mousemove", (e) => {
                if (!isDragging || !deltaSettingsWindow) return;
                deltaSettingsWindow.style.left = (e.clientX - dragOffset.x) + "px";
                deltaSettingsWindow.style.top = (e.clientY - dragOffset.y) + "px";
            });

            document.addEventListener("mouseup", () => {
                isDragging = false;
            });

            // Skill color inputs
            $$(".skill-color-input", deltaSettingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const skillId = e.target.dataset.skillId;
                    CONFIG.skillbarColors[skillId] = e.target.value;
                    if (DeltaUI.saveSkillbarColors) DeltaUI.saveSkillbarColors();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();

                    const preview = $(".color-preview", e.target.closest(".color-row"));
                    if (preview) preview.style.background = e.target.value;
                });
            });

            // Charm color inputs
            $$(".charm-color-input", deltaSettingsWindow).forEach(input => {
                input.addEventListener("input", (e) => {
                    const charmId = e.target.dataset.charmId;
                    CONFIG.charmColors[charmId] = e.target.value;
                    if (DeltaUI.saveCharmColors) DeltaUI.saveCharmColors();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();

                    const preview = $(".color-preview", e.target.closest(".color-row"));
                    if (preview) preview.style.background = e.target.value;
                });
            });

            // Pet color input
            const petInput = $("#pet-color-input", deltaSettingsWindow);
            if (petInput) {
                petInput.addEventListener("input", (e) => {
                    CONFIG.petColor = e.target.value;
                    if (DeltaUI.savePetColor) DeltaUI.savePetColor();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();

                    const preview = $(".color-preview", e.target.closest(".color-row"));
                    if (preview) preview.style.background = e.target.value;
                });
            }

            // Reset button
            const resetBtn = $("#reset-all-colors", deltaSettingsWindow);
            if (resetBtn) {
                resetBtn.addEventListener("click", () => {
                    if (DeltaUI.resetToDefaults) DeltaUI.resetToDefaults();
                    if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();
                    createDeltaSettingsWindow(); // Refresh window
                });
            }

            // Export button
            const exportBtn = $("#export-colors", deltaSettingsWindow);
            if (exportBtn) {
                exportBtn.addEventListener("click", () => {
                    const data = {
                        skillbarColors: CONFIG.skillbarColors,
                        charmColors: CONFIG.charmColors,
                        petColor: CONFIG.petColor
                    };
                    const json = JSON.stringify(data, null, 2);
                    navigator.clipboard.writeText(json).then(() => {
                        alert("Colors exported to clipboard!");
                    });
                });
            }

            // Import button
            const importBtn = $("#import-colors", deltaSettingsWindow);
            if (importBtn) {
                importBtn.addEventListener("click", () => {
                    const json = prompt("Paste your color configuration:");
                    if (!json) return;
                    try {
                        const data = JSON.parse(json);
                        if (data.skillbarColors) Object.assign(CONFIG.skillbarColors, data.skillbarColors);
                        if (data.charmColors) Object.assign(CONFIG.charmColors, data.charmColors);
                        if (data.petColor) CONFIG.petColor = data.petColor;

                        if (DeltaUI.saveSkillbarColors) DeltaUI.saveSkillbarColors();
                        if (DeltaUI.saveCharmColors) DeltaUI.saveCharmColors();
                        if (DeltaUI.savePetColor) DeltaUI.savePetColor();
                        if (DeltaUI.updateDynamicStyles) DeltaUI.updateDynamicStyles();

                        createDeltaSettingsWindow(); // Refresh
                        alert("Colors imported successfully!");
                    } catch (e) {
                        alert("Invalid JSON format!");
                    }
                });
            }
        }

        // ==========================================
        // EXPOSE TO GLOBAL
        // ==========================================

        window.DeltaSettings = {
            toggle: toggleDeltaSettings,
            close: closeDeltaSettingsWindow,
            open: createDeltaSettingsWindow
        };

        console.log("✅ Delta Settings module loaded");
    }

})();
