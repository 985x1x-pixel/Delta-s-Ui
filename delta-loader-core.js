// ==========================================
// DELTA LOADER CORE v4.0
// CSS, Update UI, Script Loading
// ==========================================

(function() {
    "use strict";

    // Prevent double init
    if (window.DeltaLoader) {
        console.log("[Delta Core] Already loaded");
        return;
    }

    var BASE_URL = "https://985x1x-pixel.github.io/Delta-s-Ui";
    var MAIN_SCRIPT_URL = BASE_URL + "/delta-main.js";

    var STORAGE = {
        VERSION: "deltaUI_installedVersion",
        SKIP: "deltaUI_skipVersion"
    };

    // ==========================================
    // CSS INJECTION
    // ==========================================

    var CSS = '\
        #delta-update-modal {\
            position: fixed;\
            top: 50%;\
            left: 50%;\
            transform: translate(-50%, -50%);\
            z-index: 999999;\
            background: linear-gradient(145deg, rgba(20, 24, 35, 0.98), rgba(30, 36, 50, 0.98));\
            border: 1px solid #F5C247;\
            border-radius: 8px;\
            padding: 16px 20px;\
            min-width: 280px;\
            max-width: 340px;\
            box-shadow: 0 0 30px rgba(245, 194, 71, 0.25), 0 10px 40px rgba(0, 0, 0, 0.5);\
            font-family: system-ui, -apple-system, sans-serif;\
            animation: deltaModalIn 0.25s ease-out;\
        }\
        \
        @keyframes deltaModalIn {\
            from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }\
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }\
        }\
        \
        #delta-update-modal.closing {\
            animation: deltaModalOut 0.2s ease-in forwards;\
        }\
        \
        @keyframes deltaModalOut {\
            to { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }\
        }\
        \
        .delta-header {\
            display: flex;\
            align-items: center;\
            gap: 12px;\
            margin-bottom: 14px;\
        }\
        \
        .delta-logo {\
            font-size: 32px;\
            color: #F5C247;\
            text-shadow: 0 0 15px rgba(245, 194, 71, 0.6);\
        }\
        \
        .delta-header-text .delta-title {\
            font-size: 16px;\
            font-weight: 600;\
            color: #fff;\
        }\
        \
        .delta-header-text .delta-version-info {\
            font-size: 12px;\
            color: #6b7280;\
            margin-top: 3px;\
        }\
        \
        .delta-version-info .old { color: #f87171; }\
        .delta-version-info .new { color: #4ade80; font-weight: 600; }\
        \
        .delta-changelog {\
            background: rgba(0, 0, 0, 0.3);\
            border-radius: 6px;\
            padding: 10px 12px;\
            margin-bottom: 14px;\
            max-height: 120px;\
            overflow-y: auto;\
        }\
        \
        .delta-changelog::-webkit-scrollbar { width: 5px; }\
        .delta-changelog::-webkit-scrollbar-thumb { background: #F5C247; border-radius: 3px; }\
        .delta-changelog::-webkit-scrollbar-track { background: rgba(0,0,0,0.2); }\
        \
        .delta-changelog-title {\
            color: #F5C247;\
            font-size: 10px;\
            text-transform: uppercase;\
            letter-spacing: 1px;\
            margin-bottom: 8px;\
            font-weight: 600;\
        }\
        \
        .delta-changelog-item {\
            color: #a1a1aa;\
            font-size: 12px;\
            padding: 3px 0 3px 14px;\
            position: relative;\
            line-height: 1.4;\
        }\
        \
        .delta-changelog-item::before {\
            content: "•";\
            position: absolute;\
            left: 0;\
            color: #F5C247;\
        }\
        \
        .delta-buttons {\
            display: flex;\
            gap: 10px;\
        }\
        \
        .delta-btn {\
            flex: 1;\
            padding: 10px 16px;\
            border: none;\
            border-radius: 6px;\
            font-size: 13px;\
            font-weight: 600;\
            cursor: pointer;\
            transition: all 0.15s ease;\
        }\
        \
        .delta-btn-update {\
            background: linear-gradient(135deg, #F5C247, #d4a830);\
            color: #000;\
        }\
        \
        .delta-btn-update:hover {\
            transform: translateY(-2px);\
            box-shadow: 0 4px 12px rgba(245, 194, 71, 0.4);\
        }\
        \
        .delta-btn-later {\
            background: rgba(107, 114, 128, 0.25);\
            color: #9ca3af;\
        }\
        \
        .delta-btn-later:hover {\
            background: rgba(107, 114, 128, 0.4);\
        }\
        \
        .delta-skip {\
            text-align: center;\
            margin-top: 12px;\
        }\
        \
        .delta-skip-link {\
            font-size: 11px;\
            color: #6b7280;\
            cursor: pointer;\
            text-decoration: underline;\
            transition: color 0.15s;\
        }\
        \
        .delta-skip-link:hover { color: #9ca3af; }\
        \
        #delta-toast {\
            position: fixed;\
            bottom: 20px;\
            left: 20px;\
            z-index: 999998;\
            background: rgba(20, 24, 35, 0.95);\
            border: 1px solid rgba(245, 194, 71, 0.35);\
            border-radius: 6px;\
            padding: 10px 14px;\
            display: flex;\
            align-items: center;\
            gap: 10px;\
            font-family: system-ui, -apple-system, sans-serif;\
            font-size: 13px;\
            color: #d1d5db;\
            animation: toastIn 0.25s ease-out;\
        }\
        \
        @keyframes toastIn {\
            from { opacity: 0; transform: translateX(-20px); }\
            to { opacity: 1; transform: translateX(0); }\
        }\
        \
        #delta-toast.hiding {\
            animation: toastOut 0.2s ease-in forwards;\
        }\
        \
        @keyframes toastOut {\
            to { opacity: 0; transform: translateX(-20px); }\
        }\
        \
        #delta-toast .spinner {\
            width: 16px;\
            height: 16px;\
            border: 2px solid rgba(245, 194, 71, 0.25);\
            border-top-color: #F5C247;\
            border-radius: 50%;\
            animation: spin 0.7s linear infinite;\
        }\
        \
        @keyframes spin { to { transform: rotate(360deg); } }\
        \
        #delta-toast.success { border-color: rgba(74, 222, 128, 0.4); }\
        #delta-toast.success .spinner {\
            border: none;\
            animation: none;\
            width: auto;\
            height: auto;\
            color: #4ade80;\
            font-size: 16px;\
        }\
        #delta-toast.success .spinner::after { content: "✓"; }\
        \
        #delta-toast.error { border-color: rgba(248, 113, 113, 0.4); }\
        #delta-toast.error .spinner {\
            border: none;\
            animation: none;\
            width: auto;\
            height: auto;\
            color: #f87171;\
            font-size: 16px;\
        }\
        #delta-toast.error .spinner::after { content: "✕"; }\
    ';

    function injectCSS() {
        if (document.getElementById("delta-loader-css")) return;
        var style = document.createElement("style");
        style.id = "delta-loader-css";
        style.textContent = CSS;
        document.head.appendChild(style);
    }

    injectCSS();

    // ==========================================
    // TOAST NOTIFICATIONS
    // ==========================================

    function showToast(message) {
        var toast = document.getElementById("delta-toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "delta-toast";
            document.body.appendChild(toast);
        }
        toast.className = "";
        toast.innerHTML = '<div class="spinner"></div><span>' + message + '</span>';
    }

    function hideToast(delay) {
        setTimeout(function() {
            var toast = document.getElementById("delta-toast");
            if (toast) {
                toast.classList.add("hiding");
                setTimeout(function() { toast.remove(); }, 200);
            }
        }, delay || 0);
    }

    function toastSuccess(message) {
        var toast = document.getElementById("delta-toast");
        if (toast) {
            toast.className = "success";
            toast.innerHTML = '<div class="spinner"></div><span>' + message + '</span>';
        }
        hideToast(2500);
    }

    function toastError(message) {
        var toast = document.getElementById("delta-toast");
        if (toast) {
            toast.className = "error";
            toast.innerHTML = '<div class="spinner"></div><span>' + message + '</span>';
        }
        hideToast(4000);
    }

    // ==========================================
    // UPDATE MODAL
    // ==========================================

    function showUpdate(versionData, installedVersion) {
        // Remove existing modal if any
        var existing = document.getElementById("delta-update-modal");
        if (existing) existing.remove();

        var changelog = versionData.changelog || [];

        var modal = document.createElement("div");
        modal.id = "delta-update-modal";

        var changelogHTML = "";
        if (changelog.length > 0) {
            changelogHTML = '<div class="delta-changelog">' +
                '<div class="delta-changelog-title">What\'s New</div>';
            for (var i = 0; i < changelog.length; i++) {
                changelogHTML += '<div class="delta-changelog-item">' + changelog[i] + '</div>';
            }
            changelogHTML += '</div>';
        }

        modal.innerHTML = 
            '<div class="delta-header">' +
                '<div class="delta-logo">Δ</div>' +
                '<div class="delta-header-text">' +
                    '<div class="delta-title">Update Available!</div>' +
                    '<div class="delta-version-info">' +
                        '<span class="old">v' + installedVersion + '</span>' +
                        ' → ' +
                        '<span class="new">v' + versionData.version + '</span>' +
                    '</div>' +
                '</div>' +
            '</div>' +
            changelogHTML +
            '<div class="delta-buttons">' +
                '<button class="delta-btn delta-btn-later" id="delta-btn-later">Later</button>' +
                '<button class="delta-btn delta-btn-update" id="delta-btn-update">Update Now</button>' +
            '</div>' +
            '<div class="delta-skip">' +
                '<span class="delta-skip-link" id="delta-skip-link">Skip this version</span>' +
            '</div>';

        document.body.appendChild(modal);

        // Event listeners
        document.getElementById("delta-btn-update").addEventListener("click", function() {
            closeModal();
            performUpdate(versionData);
        });

        document.getElementById("delta-btn-later").addEventListener("click", function() {
            closeModal();
            loadMain();
        });

        document.getElementById("delta-skip-link").addEventListener("click", function() {
            localStorage.setItem(STORAGE.SKIP, versionData.version);
            closeModal();
            loadMain();
        });

        console.log("[Delta Core] Update modal displayed");
    }

    function closeModal() {
        var modal = document.getElementById("delta-update-modal");
        if (modal) {
            modal.classList.add("closing");
            setTimeout(function() { modal.remove(); }, 200);
        }
    }

    // ==========================================
    // SCRIPT LOADING
    // ==========================================

    function loadScript(url) {
        return new Promise(function(resolve) {
            var xhr = new XMLHttpRequest();
            xhr.open("GET", url + "?t=" + Date.now(), true);
            xhr.onload = function() {
                if (xhr.status === 200) {
                    try {
                        var script = document.createElement("script");
                        script.textContent = xhr.responseText;
                        document.head.appendChild(script);
                        console.log("[Delta Core] Script loaded:", url.split("/").pop());
                        resolve(true);
                    } catch (e) {
                        console.error("[Delta Core] Script error:", e);
                        resolve(false);
                    }
                } else {
                    console.error("[Delta Core] Script HTTP error:", xhr.status);
                    resolve(false);
                }
            };
            xhr.onerror = function() {
                console.error("[Delta Core] Script network error");
                resolve(false);
            };
            xhr.send();
        });
    }

    function loadMain() {
        showToast("Loading Delta UI...");
        loadScript(MAIN_SCRIPT_URL).then(function(success) {
            if (success) {
                toastSuccess("Delta UI loaded!");
            } else {
                toastError("Failed to load Delta UI");
            }
        });
    }

    function performUpdate(versionData) {
        showToast("Updating to v" + versionData.version + "...");
        
        loadScript(MAIN_SCRIPT_URL).then(function(success) {
            if (success) {
                localStorage.setItem(STORAGE.VERSION, versionData.version);
                localStorage.removeItem(STORAGE.SKIP);
                toastSuccess("Updated to v" + versionData.version + "!");
            } else {
                toastError("Update failed!");
            }
        });
    }

    // ==========================================
    // EXPOSE API
    // ==========================================

    window.DeltaLoader = {
        loadMain: loadMain,
        showUpdate: showUpdate,
        showToast: showToast,
        toastSuccess: toastSuccess,
        toastError: toastError
    };

    console.log("[Delta Core] Loader core initialized");

})();
