import {browser} from '$app/environment'
export function getBrowserInfo() {

    const userAgent = navigator.userAgent;
    let browserName, browserVersion;

    if (userAgent.indexOf("Firefox") > -1) {
        browserName = "Mozilla Firefox";
        browserVersion = userAgent.match(/Firefox\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if (userAgent.indexOf("Chrome") > -1) {
        browserName = "Google Chrome";
        browserVersion = userAgent.match(/Chrome\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if (userAgent.indexOf("Safari") > -1) {
        browserName = "Apple Safari";
        browserVersion = userAgent.match(/Version\/([0-9]+(?:\.[0-9]+)*)/)[1];
    } else if (userAgent.indexOf("MSIE") > -1 || userAgent.indexOf("Trident") > -1) {
        browserName = "Internet Explorer";
        browserVersion = userAgent.match(/(?:MSIE |rv:)([0-9]+(?:\.[0-9]+)*)/)[1];
    } else {
        browserName = "Unknown";
        browserVersion = "Unknown";
    }

    return { name: browserName, version: browserVersion };
}

export function getOSInfo() {
    const platform = navigator.platform.toLowerCase();
    let osName;

    if (platform.includes("win")) osName = "Windows";
    else if (platform.includes("mac")) osName = "macOS";
    else if (platform.includes("linux")) osName = "Linux";
    else if (platform.includes("iphone") || platform.includes("ipad")) osName = "iOS";
    else if (platform.includes("android")) osName = "Android";
    else osName = "Unknown";

    return osName;
}

export function isRunningInStandaloneMode() {
    return window.matchMedia('(display-mode: standalone)').matches;
}

export function getDeviceType() {
    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown' = 'unknown';
    if(browser){
        const userAgent = navigator.userAgent.toLowerCase();

    if (/mobi|android|touch|mini/.test(userAgent)) {
      deviceType = 'mobile';
    } else if (/tablet|ipad|playbook|silk/.test(userAgent)) {
      deviceType = 'tablet';
    } else {
      deviceType = 'desktop';
    }
    }
    return deviceType;
}