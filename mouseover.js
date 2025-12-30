// ==========================================
// MOUSEOVER MODULE
// ==========================================

(function () {
  'use strict';

  const SELECT_KEYS = ['1','2','3','4','5','6','7','8','9','0'];
  const SHOW_HOVER_EFFECT = true;

  let hoveredFrame = null;
  let isEnabled = false;

  // ==========================================
  // STYLES
  // ==========================================

  function injectStyles() {
    if (document.getElementById('mouse-over-styles')) return;
    
    const style = document.createElement('style');
    style.id = 'mouse-over-styles';
    style.textContent = `
      .partyframes .grid.left.mo-hover {
        outline: 2px solid rgba(52, 152, 219, 0.8) !important;
        outline-offset: 1px !important;
        background: rgba(52, 152, 219, 0.1) !important;
        transition: all 0.1s ease !important;
      }
      
      .partyframes .grid.left.mo-hover .barsInner {
        box-shadow: inset 0 0 10px rgba(52, 152, 219, 0.3) !important;
      }
      
      .partyframes .grid.left.mo-clicked {
        animation: mo-flash 0.2s ease !important;
      }
      
      @keyframes mo-flash {
        0% { outline-color: rgba(52, 152, 219, 0.8); }
        50% { outline-color: rgba(46, 204, 113, 1); outline-width: 3px; }
        100% { outline-color: rgba(52, 152, 219, 0.8); }
      }
    `;
    document.head.appendChild(style);
  }

  // ==========================================
  // EVENT HANDLERS
  // ==========================================

  function handleMouseover(e) {
    if (!isEnabled) return;
    
    const frame = e.target.closest('.partyframes .grid.left');
    
    if (hoveredFrame && hoveredFrame !== frame) {
      hoveredFrame.classList.remove('mo-hover');
    }
    
    if (frame) {
      hoveredFrame = frame;
      if (SHOW_HOVER_EFFECT) {
        frame.classList.add('mo-hover');
      }
    }
  }

  function handleMouseout(e) {
    if (!isEnabled) return;
    
    const frame = e.target.closest('.partyframes .grid.left');
    if (!frame) return;
    
    const related = e.relatedTarget;
    if (!related || !frame.contains(related)) {
      if (frame === hoveredFrame) {
        frame.classList.remove('mo-hover');
        hoveredFrame = null;
      }
    }
  }

  function handleKeydown(e) {
    if (!isEnabled) return;
    
    const tag = document.activeElement?.tagName?.toLowerCase();
    if (tag === 'input' || tag === 'textarea') return;
    
    if (!SELECT_KEYS.includes(e.key)) return;
    
    if (hoveredFrame) {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();
      
      const clickable = hoveredFrame.querySelector('.barsInner.targetable') || 
                        hoveredFrame.querySelector('.barsInner') || 
                        hoveredFrame;
      
      hoveredFrame.classList.add('mo-clicked');
      setTimeout(() => {
        hoveredFrame?.classList.remove('mo-clicked');
      }, 200);
      
      clickable.dispatchEvent(new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        view: window
      }));
      
      const name = hoveredFrame.querySelector('span.left')?.textContent || 'Unknown';
      console.log('[Mouse-Over] Selected:', name);
    }
  }

  // ==========================================
  // ENABLE / DISABLE
  // ==========================================

  function enableMouseover() {
    if (isEnabled) return;
    isEnabled = true;
    
    injectStyles();
    
    document.addEventListener('mouseover', handleMouseover);
    document.addEventListener('mouseout', handleMouseout);
    document.addEventListener('keydown', handleKeydown, true);
    
    console.log('[Mouse-Over] Enabled - Hover + press 1-0 to select');
  }

  function disableMouseover() {
    if (!isEnabled) return;
    isEnabled = false;
    
    // Clear any existing hover
    if (hoveredFrame) {
      hoveredFrame.classList.remove('mo-hover');
      hoveredFrame = null;
    }
    
    document.removeEventListener('mouseover', handleMouseover);
    document.removeEventListener('mouseout', handleMouseout);
    document.removeEventListener('keydown', handleKeydown, true);
    
    console.log('[Mouse-Over] Disabled');
  }

  // ==========================================
  // INIT
  // ==========================================

  function init() {
    // Check saved setting and auto-enable if it was on
    const saved = localStorage.getItem('deltaUI_mouseover');
    if (saved === 'true') {
      enableMouseover();
    }
  }

  init();

  // ==========================================
  // EXPOSE API
  // ==========================================

  window.DeltaMouseover = {
    enable: enableMouseover,
    disable: disableMouseover,
    isEnabled: () => isEnabled,
    getHoveredFrame: () => hoveredFrame
  };

  console.log('[Mouse-Over] Module loaded');

})();
