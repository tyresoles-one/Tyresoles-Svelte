import { DEFAULT_ERROR_MESSAGE } from '$lib/system';
import { loadingStore, userStore, clearAll } from '$lib/managers/stores';
import { toast } from 'svelte-sonner';

class NetworkError extends Error {
	message: string;
	code: unknown;
	data: unknown;
	constructor(message: string, code: unknown, data?: unknown) {
		super(message);
		this.code = code;
		this.message = message;
		this.data = data;
	}
}

export const apiFetch = async (
	endpoint: string,
	options: {
		method?: 'POST' | 'GET';
		body?: unknown;
		headers?: Record<string, string>;
	} = {},
	skipHeaders = false
) => {
	function errorMessageNormalize(message: string | object) {
		switch (typeof message) {
			case 'string': {
				if (message) {
					if (message.length > 100) {
						return message.slice(0, 100) + '...';
					}
					switch (message) {
						case 'fetch failed':
						case 'Failed to fetch': {
							return 'Connection failed. Please try again later.';
							break;
						}
						default: {
							if (message.includes('One or more errors occurred.')) {
								const regex = /\((.*)\)$/;
								const match = message.match(regex);
								//console.log(match, 'match');
								return match ? match[1] : null;
							}
							if (message.includes('502 Bad Gateway')) {
								return 'Connection failed. Please try again later.';
							}
							return message;
						}
					}
				} else {
					return DEFAULT_ERROR_MESSAGE;
				}
				break;
			}
			case 'object': {
				console.log(message, 'message object');
				break;
			}
			default: {
				return DEFAULT_ERROR_MESSAGE;
				break;
			}
		}
	}
	const { method = 'GET', body, headers = {} } = options;

	let token = '';
	const unsubscribe = userStore.subscribe((value) => {
		token = value?.token ?? '';
	});

	const fetchOptions = {
		method,
		headers: {
			'Content-Type': 'application/json',
			Authorization: token ? `Bearer ${token}` : '',
			...headers,
			Origin: 'https://app.tyresoles.in'
		},
		body: body ? JSON.stringify(body) : undefined
	};

	try {
		loadingStore.set(true);
		const url = endpoint;
		const response = await fetch(url, skipHeaders ? {} : { ...fetchOptions });
		const contentType = response.headers.get('Content-Type');
		//console.log(contentType, 'contentType');
		let data;

		if (!response.ok) {
			let errorMessage = DEFAULT_ERROR_MESSAGE; // Default error message
			if (
				contentType &&
				(contentType.includes('application/json') ||
					contentType.includes('application/problem+json'))
			) {
				const errorData = await response.json();
				errorMessage = errorData.message || errorData.title || 'An error occurred';
				if (errorData.errors) {
					const firstKey = Object.keys(errorData.errors)[0];
					if (firstKey) {
						errorMessage = errorData.errors[firstKey][0] || errorMessage;
					}
				}
			} else if (contentType && contentType.includes('text/html')) {
				if (response.status === 502) errorMessage = 'Connection failed. Please try again later.';
				else errorMessage = 'An error occurred while processing your request.';
			} else if (contentType && contentType.includes('text/plain')) {
				const errorData = await response.text();
				try {
					var jsonData = JSON.parse(errorData); // Just to check if it's a valid JSON
					if (jsonData.ErrorMessage) errorMessage = jsonData.ErrorMessage;
					else errorMessage = JSON.stringify(jsonData);
				} catch {
					errorMessage = errorData || DEFAULT_ERROR_MESSAGE;
				}
			} else {
				errorMessage = await response.text();
			}
			throw new NetworkError(errorMessage, response.status);
		}
		if (contentType && contentType.includes('application/json')) {
			data = await response.json();
		} else if (contentType && contentType.includes('text/html')) {
			data = await response.text();
		} else {
			data = await response.text();
		}
		return { success: true, data };
	} catch (error) {
		if ((error as NetworkError)?.code === 401 || (error as NetworkError)?.code === 410) {
			clearAll();
		}
		const message = errorMessageNormalize((error as Error)?.message);

		if (message) toast.error(message);
		return { success: false, data: { code: (error as NetworkError)?.code, message } };
	} finally {
		loadingStore.set(false);
		unsubscribe();
	}
};

export function getURLSearchParams(
	data: string[][] | Record<string, string> | string | URLSearchParams
) {
	return new URLSearchParams(data);
}
