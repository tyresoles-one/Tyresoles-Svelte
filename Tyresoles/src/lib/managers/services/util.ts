export function hasHardwareNavButtons() {
    if (typeof window === 'undefined') return false; // SSR guard
  
    const detector = document.createElement('div');
    detector.style.position = 'fixed';
    detector.style.bottom = '0';    
    detector.style.left = '0';
    detector.style.right = '0';
    detector.style.top = '0';
    detector.style.paddingBottom = 'env(safe-area-inset-bottom)';
    detector.style.paddingTop = 'env(safe-area-inset-top)';
    detector.style.paddingLeft = 'env(safe-area-inset-left)';
    detector.style.paddingRight = 'env(safe-area-inset-right)';    
    detector.style.visibility = 'hidden';
    
    document.body.appendChild(detector);
    let computedPadding = {bottom:parseInt(getComputedStyle(detector).paddingBottom, 10),
        top:parseInt(getComputedStyle(detector).paddingTop, 10),
        left:parseInt(getComputedStyle(detector).paddingLeft, 10),
        right:parseInt(getComputedStyle(detector).paddingRight, 10)
    }    ;
    document.body.removeChild(detector);
  
    return computedPadding;
  }

  export function getSafeBottomPadding() {
    let bottomPadding = '0px';
    const isMIUI = /Xiaomi|Redmi|Miui/i.test(navigator.userAgent);
    const isPortrait = window.matchMedia('(orientation: portrait)').matches;
    
    if (isMIUI && !CSS.supports('padding: env(safe-area-inset-bottom)')) {
      bottomPadding = isPortrait ? '68px' : '48px';
    }

    return bottomPadding;
  }