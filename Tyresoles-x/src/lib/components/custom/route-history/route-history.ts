import { writable, get } from 'svelte/store';
import { goto } from '$app/navigation';

export const routeHistory = writable<Array<string>>([]);

const lineRoutes = [
    '/ecoproc/orders'
];
export function addRoute(newRoute: string) {
    const baseRoute = getBaseRoute(newRoute);
    routeHistory.update(history => {
        console.log('!history.includes(baseRoute)', !history.includes(baseRoute));
        if (!history.includes(baseRoute)) {
            history.push(baseRoute);
        }
        return history;
    });
}

function getBaseRoute(route: string): string {
    const parts = route.split('/');
    const lineRoute = lineRoutes.find(lineRoute => route.startsWith(lineRoute));
    if (lineRoute && (parts.length > lineRoute.split('/').length + 1)) {
        return parts.slice(0, parts.length - 1).join('/') ;
    }
    return route;
}

export function goBack(route: string) {
    let lastRoute:string|undefined = '/';
    console.log('route', route);
    routeHistory.update(history => {
        if (history.length > 0) {
            lastRoute = history.pop(); // Remove the last route
            // if(lastRoute === getBaseRoute(route)){
            //     lastRoute = history.pop();
            // }
        }
        return history;
    });
    goto(lastRoute ?? '/');
}