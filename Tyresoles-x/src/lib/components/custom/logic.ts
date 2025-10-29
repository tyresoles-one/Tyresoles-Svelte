import {settingsStore} from '$lib/managers/stores';
export const updateGoBackPath = (path:string = '/') => {
    settingsStore.update((settings) => ({
        ...settings,
        backPath: path
    }));
}

export const isMobile = () => {
    let flag = false;
    if (navigator.userAgent.match(/Android/i)
        || navigator.userAgent.match(/webOS/i)
        || navigator.userAgent.match(/iPhone/i)
        || navigator.userAgent.match(/iPad/i)
        || navigator.userAgent.match(/iPod/i)
        || navigator.userAgent.match(/BlackBerry/i)
        || navigator.userAgent.match(/Windows Phone/i)
    ) {
        flag = true;
    }
    return flag
}