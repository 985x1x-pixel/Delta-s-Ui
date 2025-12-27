// ==========================================
// DELTA UI LIBRARY v1.0
// Shared utilities for all Delta UI modules
// ==========================================

(function() {
    "use strict";

    const DeltaLib = {
        version: "1.0",

        // ==========================================
        // DOM UTILITIES
        // ==========================================

        /**
         * Query selector shorthand
         * @param {string} selector - CSS selector
         * @param {Element|Document} root - Root element to search from
         * @returns {Element|null}
         */
        $(selector, root = document) {
            try {
                return root?.querySelector(selector) ?? null;
            } catch (e) {
                console.warn("[DeltaLib] Query failed:", selector, e);
                return null;
            }
        },

        /**
         * Query selector all shorthand
         * @param {string} selector - CSS selector
         * @param {Element|Document} root - Root element to search from
         * @returns {Element[]}
         */
        $$(selector, root = document) {
            try {
                return Array.from(root?.querySelectorAll(selector) ?? []);
            } catch (e) {
                console.warn("[DeltaLib] QueryAll failed:", selector, e);
                return [];
            }
        },

        /**
         * Wait for an element to appear in the DOM
         * @param {string} selector - CSS selector
         * @param {Object} options - Configuration options
         * @returns {Promise<Element>}
         */
        waitForElement(selector, options = {}) {
            const { timeout = 5000, interval = 100, root = document } = options;

            return new Promise((resolve, reject) => {
                const startTime = Date.now();

                const check = () => {
                    const element = this.$(selector, root);
                    if (element) {
                        resolve(element);
                        return;
                    }

                    if (Date.now() - startTime >= timeout) {
                        reject(new Error(`Element "${selector}" not found within ${timeout}ms`));
                        return;
                    }

                    setTimeout(check, interval);
                };

                check();
            });
        },

        /**
         * Set a style property with !important
         * @param {Element} element - Target element
         * @param {string} property - CSS property name
         * @param {string} value - CSS value
         */
        setStyleImportant(element, property, value) {
            if (!element?.style) return;
            try {
                element.style.setProperty(property, value, "important");
            } catch {
                element.style[property] = value;
            }
        },

        /**
         * Create and inject a style element
         * @param {string} id - Style element ID
         * @param {string} css - CSS content
         * @returns {HTMLStyleElement}
         */
        injectStyle(id, css) {
            let style = this.$(`#${id}`);
            if (!style) {
                style = document.createElement("style");
                style.id = id;
                document.head.appendChild(style);
            }
            style.textContent = css;
            return style;
        },

        /**
         * Remove an element by ID
         * @param {string} id - Element ID
         */
        removeElement(id) {
            this.$(`#${id}`)?.remove();
        },

        // ==========================================
        // STORAGE UTILITIES
        // ==========================================

        storage: {
            /**
             * Get a value from localStorage
             * @param {string} key - Storage key
             * @param {*} defaultValue - Default value if not found
             * @returns {string|null}
             */
            get(key, defaultValue = null) {
                try {
                    const value = localStorage.getItem(key);
                    return value !== null ? value : defaultValue;
                } catch (e) {
                    console.warn("[DeltaLib] Storage get failed:", key, e);
                    return defaultValue;
                }
            },

            /**
             * Set a value in localStorage
             * @param {string} key - Storage key
             * @param {string} value - Value to store
             */
            set(key, value) {
                try {
                    localStorage.setItem(key, value);
                } catch (e) {
                    console.warn("[DeltaLib] Storage set failed:", key, e);
                }
            },

            /**
             * Get and parse JSON from localStorage
             * @param {string} key - Storage key
             * @param {*} defaultValue - Default value if not found or parse fails
             * @returns {*}
             */
            getJSON(key, defaultValue = null) {
                try {
                    const value = localStorage.getItem(key);
                    return value !== null ? JSON.parse(value) : defaultValue;
                } catch (e) {
                    console.warn("[DeltaLib] Storage getJSON failed:", key, e);
                    return defaultValue;
                }
            },

            /**
             * Stringify and set JSON in localStorage
             * @param {string} key - Storage key
             * @param {*} value - Value to store
             */
            setJSON(key, value) {
                try {
                    localStorage.setItem(key, JSON.stringify(value));
                } catch (e) {
                    console.warn("[DeltaLib] Storage setJSON failed:", key, e);
                }
            },

            /**
             * Get a boolean toggle value
             * @param {string} key - Storage key (will be prefixed with deltaUI_)
             * @param {boolean} defaultValue - Default value
             * @returns {boolean}
             */
            getToggle(key, defaultValue = false) {
                const saved = this.get(`deltaUI_${key}`);
                return saved !== null ? saved === "true" : defaultValue;
            },

            /**
             * Set a boolean toggle value
             * @param {string} key - Storage key (will be prefixed with deltaUI_)
             * @param {boolean} value - Value to store
             */
            setToggle(key, value) {
                this.set(`deltaUI_${key}`, String(value));
            },

            /**
             * Remove a value from localStorage
             * @param {string} key - Storage key
             */
            remove(key) {
                try {
                    localStorage.removeItem(key);
                } catch (e) {
                    console.warn("[DeltaLib] Storage remove failed:", key, e);
                }
            }
        },

        // ==========================================
        // FORMATTING UTILITIES
        // ==========================================

        format: {
            /**
             * Format seconds into human-readable time
             * @param {number} seconds - Time in seconds
             * @returns {string}
             */
            time(seconds) {
                if (seconds < 0) seconds = 0;
                
                const days = Math.floor(seconds / 86400);
                const hours = Math.floor((seconds % 86400) / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                const secs = seconds % 60;

                if (days > 0) return `${days}d ${hours}h`;
                if (hours > 0) return `${hours}h ${minutes}m`;
                if (minutes > 0) return `${minutes}m ${secs}s`;
                return `${secs}s`;
            },

            /**
             * Format a number with K/M suffixes
             * @param {number} num - Number to format
             * @returns {string}
             */
            number(num) {
                if (num >= 1000000) {
                    return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
                }
                if (num >= 1000) {
                    return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
                }
                return String(num);
            },

            /**
             * Format a number with commas
             * @param {number} num - Number to format
             * @returns {string}
             */
            commas(num) {
                return num.toLocaleString();
            }
        },

        // ==========================================
        // COLOR UTILITIES
        // ==========================================

        colors: {
            THRESHOLDS: [
                { min: 109, color: "#ff0000", name: "RED" },
                { min: 99, color: "#ff7600", name: "ORANGE" },
                { min: 90, color: "#9E3BF9", name: "PURPLE" },
                { min: 70, color: "#0681ea", name: "BLUE" },
                { min: 50, color: "#34CB49", name: "GREEN" },
                { min: 0, color: "#5b858e", name: "GREY" }
            ],

            /**
             * Get color based on item quality percentage
             * @param {number} percent - Quality percentage
             * @param {Object} customColors - Optional custom color overrides
             * @returns {string}
             */
            fromPercent(percent, customColors = null) {
                const colors = customColors || {
                    RED: "#ff0000",
                    ORANGE: "#ff7600",
                    PURPLE: "#9E3BF9",
                    BLUE: "#0681ea",
                    GREEN: "#34CB49",
                    GREY: "#5b858e"
                };

                if (percent >= 109) return colors.RED;
                if (percent >= 99) return colors.ORANGE;
                if (percent >= 90) return colors.PURPLE;
                if (percent >= 70) return colors.BLUE;
                if (percent >= 50) return colors.GREEN;
                return colors.GREY;
            },

            /**
             * Convert hex color to rgba
             * @param {string} hex - Hex color code
             * @param {number} alpha - Alpha value (0-1)
             * @returns {string}
             */
            hexToRgba(hex, alpha = 1) {
                const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
                if (!result) return hex;
                
                const r = parseInt(result[1], 16);
                const g = parseInt(result[2], 16);
                const b = parseInt(result[3], 16);
                
                return `rgba(${r}, ${g}, ${b}, ${alpha})`;
            }
        },

        // ==========================================
        // URL UTILITIES
        // ==========================================

        url: {
            /**
             * Get pathname from a URL or src attribute
             * @param {string} src - URL or src string
             * @returns {string}
             */
            getPath(src) {
                if (!src) return "";
                try {
                    return new URL(src, window.location.origin).pathname;
                } catch {
                    return src.split("?")[0];
                }
            },

            /**
             * Add cache-busting parameter to URL
             * @param {string} url - Base URL
             * @returns {string}
             */
            cacheBust(url) {
                const separator = url.includes("?") ? "&" : "?";
                return `${url}${separator}v=${Date.now()}`;
            }
        },

        // ==========================================
        // EVENT UTILITIES
        // ==========================================

        events: {
            _dragState: null,

            /**
             * Make an element draggable
             * @param {Element} handle - Element to use as drag handle
             * @param {Element} target - Element to move
             * @param {Object} options - Configuration options
             * @returns {Function} Cleanup function
             */
            makeDraggable(handle, target, options = {}) {
                const { onStart, onMove, onEnd, boundToWindow = true } = options;
                let isDragging = false;
                let offset = { x: 0, y: 0 };

                const handleMouseDown = (e) => {
                    if (e.target.closest(".btn, button, input, select")) return;
                    
                    isDragging = true;
                    const rect = target.getBoundingClientRect();
                    offset.x = e.clientX - rect.left;
                    offset.y = e.clientY - rect.top;
                    
                    target.style.transform = "none";
                    target.style.left = `${rect.left}px`;
                    target.style.top = `${rect.top}px`;
                    
                    onStart?.(e, rect);
                    e.preventDefault();
                };

                const handleMouseMove = (e) => {
                    if (!isDragging) return;
                    
                    let x = e.clientX - offset.x;
                    let y = e.clientY - offset.y;
                    
                    if (boundToWindow) {
                        const rect = target.getBoundingClientRect();
                        x = Math.max(0, Math.min(x, window.innerWidth - rect.width));
                        y = Math.max(0, Math.min(y, window.innerHeight - rect.height));
                    }
                    
                    target.style.left = `${x}px`;
                    target.style.top = `${y}px`;
                    
                    onMove?.(e, { x, y });
                };

                const handleMouseUp = (e) => {
                    if (!isDragging) return;
                    isDragging = false;
                    onEnd?.(e);
                };

                handle.addEventListener("mousedown", handleMouseDown);
                document.addEventListener("mousemove", handleMouseMove);
                document.addEventListener("mouseup", handleMouseUp);

                return () => {
                    handle.removeEventListener("mousedown", handleMouseDown);
                    document.removeEventListener("mousemove", handleMouseMove);
                    document.removeEventListener("mouseup", handleMouseUp);
                };
            },

            /**
             * Add a keyboard shortcut listener
             * @param {string} key - Key to listen for
             * @param {Function} callback - Callback function
             * @param {Object} options - Configuration options
             * @returns {Function} Cleanup function
             */
            onKeyPress(key, callback, options = {}) {
                const { ignoreInputs = true, preventDefault = false } = options;

                const handler = (e) => {
                    if (ignoreInputs) {
                        const active = document.activeElement;
                        const isTyping = active?.tagName === "INPUT" ||
                                        active?.tagName === "TEXTAREA" ||
                                        active?.isContentEditable;
                        if (isTyping) return;
                    }

                    if (e.key.toLowerCase() === key.toLowerCase()) {
                        if (preventDefault) e.preventDefault();
                        callback(e);
                    }
                };

                window.addEventListener("keydown", handler);
                return () => window.removeEventListener("keydown", handler);
            }
        },

        // ==========================================
        // ASYNC UTILITIES
        // ==========================================

        async: {
            /**
             * Delay execution
             * @param {number} ms - Milliseconds to wait
             * @returns {Promise<void>}
             */
            delay(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            },

            /**
             * Load a script dynamically
             * @param {string} url - Script URL
             * @returns {Promise<boolean>}
             */
            async loadScript(url) {
                try {
                    const response = await fetch(DeltaLib.url.cacheBust(url));
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const code = await response.text();
                    const script = document.createElement("script");
                    script.textContent = code;
                    document.head.appendChild(script);
                    
                    console.log(`✅ Loaded: ${url.split("/").pop()}`);
                    return true;
                } catch (error) {
                    console.warn(`⚠️ Script failed: ${url}`, error.message);
                    return false;
                }
            },

            /**
             * Load CSS dynamically
             * @param {string} url - CSS URL
             * @param {string} id - Style element ID
             * @returns {Promise<boolean>}
             */
            async loadCSS(url, id) {
                try {
                    const response = await fetch(DeltaLib.url.cacheBust(url));
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const css = await response.text();
                    DeltaLib.injectStyle(id, css);
                    
                    console.log(`✅ CSS loaded: ${url.split("/").pop()}`);
                    return true;
                } catch (error) {
                    console.warn(`⚠️ CSS failed: ${url}`, error.message);
                    return false;
                }
            }
        },

        // ==========================================
        // OBSERVER UTILITIES  
        // ==========================================

        observers: {
            /**
             * Create a debounced mutation observer
             * @param {Element} target - Element to observe
             * @param {Function} callback - Callback function
             * @param {Object} options - MutationObserver options
             * @param {number} debounce - Debounce delay in ms
             * @returns {MutationObserver}
             */
            create(target, callback, options = {}, debounce = 0) {
                let timeout = null;
                
                const observer = new MutationObserver((mutations) => {
                    if (debounce > 0) {
                        clearTimeout(timeout);
                        timeout = setTimeout(() => callback(mutations), debounce);
                    } else {
                        callback(mutations);
                    }
                });

                const defaultOptions = {
                    childList: true,
                    subtree: true,
                    ...options
                };

                observer.observe(target, defaultOptions);
                return observer;
            }
        }
    };

    window.DeltaLib = DeltaLib;
})();
