// ==========================================
// DELTA LOADER CORE
// Contains CSS, update UI, and script loading
// ==========================================

(function() {
    "use strict";

    if (window.DeltaLoader) return;

    const BASE_URL = "https://985x1x-pixel.github.io/Delta-s-Ui";
    const MAIN_SCRIPT_URL = `${BASE_URL}/delta-main.js`;

    const STORAGE = {
        VERSION: "deltaUI_installedVersion",
        SKIP: "deltaUI_skipVersion"
    };

    // ==========================================
    // CSS
    // ==========================================

    const CSS = `
        #delta-update-modal {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            z-index: 999999;
            background: linear-gradient(145deg, rgba(20, 24, 35, 0.98), rgba(30, 36, 50, 0.98));
            border: 1px solid #F5C247;
            border-radius: 8px;
            padding: 16px 20px;
            min-width: 260px;
            max-width: 320px;
            box-shadow: 0 0 30px rgba(245, 194, 71, 0.2), 0 10px 40px rgba(0, 0, 0, 0.5);
            font-family: system-ui, -apple-system, sans-serif;
            animation: deltaModalIn 0.25s ease-out;
        }

        @keyframes deltaModalIn {
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        #delta-update-modal.closing {
            animation: deltaModalOut 0.15s ease-in forwards;
        }

        @keyframes deltaModalOut {
            to { opacity: 0; transform: translate(-50%, -50%) scale(0.95); }
        }

        #delta-update-modal .delta-header {
            display: flex;
            align-items: center;
            gap: 10px;
            margin-bottom: 12px;
        }

        #delta-update-modal .delta-logo {
            font-size: 28px;
            color: #F5C247;
            text-shadow: 0 0 10px rgba(245, 194, 71, 0.5);
        }

        #delta-update-modal .delta-title {
            font-size: 15px;
            font-weight: 600;
            color: #fff;
        }

        #delta-update-modal .delta-version {
            font-size: 11px;
            color: #6b7280;
            margin-top: 2px;
        }

        #delta-update-modal .delta-version .new { color: #4ade80; }
        #delta-update-modal .delta-version .old { color: #f87171; }

        #delta-update-modal .delta-changelog {
            background: rgba(0, 0, 0, 0.25);
            border-radius: 5px;
            padding: 8px 10px;
            margin-bottom: 12px;
            max-height: 100px;
            overflow-y: auto;
            font-size: 11px;
        }

        #delta-update-modal .delta-changelog::-webkit-scrollbar {
            width: 4px;
        }

        #delta-update-modal .delta-changelog::-webkit-scrollbar-thumb {
            background: #F5C247;
            border-radius: 2px;
        }

        #delta-update-modal .delta-changelog-title {
            color: #F5C247;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 6px;
        }

        #delta-update-modal .delta-changelog-item {
            color: #9ca3af;
            padding: 2px 0 2px 10px;
            position: relative;
        }

        #delta-update-modal .delta-changelog-item::before {
            content: "›";
            position: absolute;
            left: 0;
            color: #F5C247;
        }

        #delta-update-modal .delta-buttons {
            display: flex;
            gap: 8px;
        }

        #delta-update-modal .delta-btn {
            flex: 1;
            padding: 8px 12px;
            border: none;
            border-radius: 5px;
            font-size: 12px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.15s;
        }

        #delta-update-modal .delta-btn-update {
            background: linear-gradient(135deg, #F5C247, #d4a830);
            color: #000;
        }

        #delta-update-modal .delta-btn-update:hover {
            transform: translateY(-1px);
            box-shadow: 0 3px 10px rgba(245, 194, 71, 0.3);
        }

        #delta-update-modal .delta-btn-later {
            background: rgba(107, 114, 128, 0.2);
            color: #9ca3af;
        }

        #delta-update-modal .delta-btn-later:hover {
            background: rgba(107, 114, 128, 0.3);
        }

        #delta-update-modal .delta-skip {
            text-align: center;
            margin-top: 10px;
        }

        #delta-update-modal .delta-skip-link {
            font-size: 10px;
            color: #6b7280;
            cursor: pointer;
            text-decoration: underline;
        }

        #delta-update-modal .delta-skip-link:hover {
            color: #9ca3af;
        }

        #delta-toast {
            position: fixed;
            bottom: 15px;
            left: 15px;
            z-index: 999998;
            background: rgba(20, 24, 35, 0.95);
            border: 1px solid rgba(245, 194, 71, 0.3);
            border-radius: 6px;
            padding: 8px 12px;
            display: flex;
            align-items: center;
            gap: 8px;
            font-family: system-ui, -apple-system, sans-serif;
            font-size: 12px;
            color: #9ca3af;
            animation: toastIn 0.2s ease-out;
        }

        @keyframes toastIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
        }

        #delta-toast.hiding {
            animation: toastOut 0.2s ease-in forwards;
        }

        @keyframes toastOut {
            to { opacity: 0; transform: translateY(10px); }
        }

        #delta-toast .spinner {
            width: 14px;
            height: 14px;
            border: 2px solid rgba(245, 194, 71, 0.2);
            border-top-color: #F5C247;
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
        }

        @keyframes spin { to { transform: rotate(360deg); } }

        #delta-toast.success { border-color: rgba(74, 222, 128, 0.3); }
        #delta-toast.success .spinner {
            border: none;
            animation: none;
            color: #4ade80;
            font-size: 14px;
        }
        #delta-toast.success .spinner::after { content: "✓"; }

        #delta-toast.error { border-color: rgba(248, 113, 113, 0.3); }
        #delta-toast.error .spinner {
            border: none;
            animation: none;
            color: #f87171;
            font-size: 14px;
        }
        #delta-toast.error .spinner::after { content: "✕"; }
    `;

    // ==========================================
    // INJECT CSS
    // ==========================================

    function injectCSS() {
        if (document.getElementById("delta-loader-css")) return;
        const style = document.createElement("style");
        style.id = "delta-loader-css";
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    injectCSS();

    // ==========================================
    // TOAST
    // ==========================================

    function showToast(msg) {
        let toast = document.getElementById("delta-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "delta-toast";
            document.body.appendChild(toast);
        }
        toast.className = "";
        toast.innerHTML = `<div class="spinner"></div><span>${msg}</span>`;
    }

    function hideToast(delayMs = 0) {
        setTimeout(() => {
            const toast = document.getElementById("delta-toast");
            if (toast) {
                toast.classList.add("hiding");
                setTimeout(() => toast.remove(), 200);
            }
        }, delayMs);
    }

    function toastSuccess(msg) {
        const toast = document.getElementById("delta-toast");
        if (toast) {
            toast.className = "success";
            toast.querySelector("span").textContent = msg;
        }
        hideToast(2000);
    }

    function toastError(msg) {
        const toast = document.getElementById("delta-toast");
        if (toast) {
            toast.className = "error";
            toast.querySelector("span").textContent = msg;
        }
        hideToast(4000);
    }

    // ==========================================
    // UPDATE MODAL
    // ==========================================

    function showUpdate(versionData, installedVersion) {
        if (document.getElementById("delta-update-modal")) return;

        const changelog = versionData.changelog || [];

        const modal = document.createElement("div");
        modal.id = "delta-update-modal";
        modal.innerHTML = `
            <div class="delta-header">
                <div class="delta-logo">Δ</div>
                <div>
                    <div class="delta-title">Update Available</div>
                    <div class="delta-version">
                        <span class="old">v${installedVersion}</span> → <span class="new">v${versionData.version}</span>
                    </div>
                </div>
            </div>
            ${changelog.length > 0 ? `
                <div class="delta-changelog">
                    <div class="delta-changelog-title">What's New</div>
                    ${changelog.map(c => `<div class="delta-changelog-item">${c}</div>`).join("")}
                </div>
            ` : ""}
            <div class="delta-buttons">
                <button class="delta-btn delta-btn-later" id="delta-btn-later">Later</button>
                <button class="delta-btn delta-btn-update" id="delta-btn-update">Update</button>
            </div>
            <div class="delta-skip">
                <span class="delta-skip-link" id="delta-skip">Skip this version</span>
            </div>
        `;

        document.body.appendChild(modal);

        document.getElementById("delta-btn-update").addEventListener("click", () => {
            closeModal();
            doUpdate(versionData);
        });

        document.getElementById("delta-btn-later").addEventListener("click", () => {
            closeModal();
            loadMain();
        });

        document.getElementById("delta-skip").addEventListener("click", () => {
            localStorage.setItem(STORAGE.SKIP, versionData.version);
            closeModal();
            loadMain();
        });
    }

    function closeModal() {
        const modal = document.getElementById("delta-update-modal");
        if (modal) {
            modal.classList.add("closing");
            setTimeout(() => modal.remove(), 150);
        }
    }

    // ==========================================
    // SCRIPT LOADING
    // ==========================================

    async function loadScript(url) {
        try {
            const res = await fetch(`${url}?t=${Date.now()}`);
            if (!res.ok) throw new Error(`HTTP ${res.status}`);
            const code = await res.text();
            const script = document.createElement("script");
            script.textContent = code;
            document.head.appendChild(script);
            return true;
        } catch (e) {
            console.error("[Delta] Script load failed:", url, e);
            return false;
        }
    }

    async function loadMain() {
        showToast("Loading Delta UI...");
        const ok = await loadScript(MAIN_SCRIPT_URL);
        if (ok) {
            toastSuccess("Delta UI loaded!");
        } else {
            toastError("Failed to load Delta UI");
        }
    }

    async function doUpdate(versionData) {
        showToast("Updating...");
        
        const ok = await loadScript(MAIN_SCRIPT_URL);
        if (ok) {
            localStorage.setItem(STORAGE.VERSION, versionData.version);
            localStorage.removeItem(STORAGE.SKIP);
            toastSuccess(`Updated to v${versionData.version}!`);
        } else {
            toastError("Update failed");
        }
    }

    // ==========================================
    // EXPOSE API
    // ==========================================

    window.DeltaLoader = {
        loadMain,
        showUpdate,
        showToast,
        toastSuccess,
        toastError
    };

    console.log("[Delta] Loader core ready");

})();
