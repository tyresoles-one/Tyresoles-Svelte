export const { MODE } = import.meta.env;
export const PROJECT_NAME = 'Tyresoles';

export const isTauri =
	typeof window !== 'undefined' ? '__TAURI__' in window || '__TAURI_INTERNALS__' in window : false;
export const isBrowser = typeof window !== 'undefined';

export const LOGIN_PATH = '/login';
export const FORGOT_PASSWORD_PATH = '/forgotpass';
export const PUBLIC_PATHS = [LOGIN_PATH, FORGOT_PASSWORD_PATH];

export const BACKEND_SERVER_IP =
	typeof window !== 'undefined' && MODE !== 'development'
		? isTauri
			? 'https://app.tyresoles.in'
			: window.location.origin
		: 'https://app.tyresoles.in';

export const BACKEND_DEV = 'http://localhost:7149/api/';
export const BACKEND_PROD = `${BACKEND_SERVER_IP}/Merger/BE/api/`;
export const BASE_URL = MODE === 'development' ? BACKEND_DEV : BACKEND_PROD;
export const DEFAULT_ERROR_MESSAGE = 'Oops ! something went wrong.';

export const DATE_FORMAT = 'DD-MMM-YY';

export const SIDEBAR_OPEN_TIMEOUT = 3000;
