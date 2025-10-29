import { firebaseConfig } from './firebase-message-settings';
import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';
import { userStore } from '../stores';
import type { User } from '$lib/business/models';
import { apiFetch } from './client';
import { endpoints } from './endpoints';
import { toast } from 'svelte-sonner';

let user: User | null = null;
const unsubscribe = userStore.subscribe((value) => {
	user = value;
});

let app: FirebaseApp | undefined = undefined;
let messaging: Messaging | undefined = undefined;

if (typeof window !== 'undefined' && typeof navigator !== 'undefined') {
	app = initializeApp(firebaseConfig);
	messaging = getMessaging(app);

	onMessage(messaging, (payload) => {
		console.log('Message received. ', payload);
		if (payload.notification) {
			toast.info(payload.notification.title ?? 'New message');
		}
	});
}

export const vapidKey =
	'BM-Xwf0bEsqvok6J590Fg-w0NTN5rhDmybQokvgPr4in6-t0vOWIjyoe50c43d7vr0GcXuX4uIHbo1408fq_E3o';
export { messaging };

export const prepareFirebase = async () => {
	if (typeof window === 'undefined' || typeof navigator === 'undefined') {
		return;
	}

	if ('serviceWorker' in navigator) {
		navigator.serviceWorker
			.register(
				import.meta.env.MODE === 'production' ? '/service-worker.js' : '/dev-sw.js?dev-sw',
				{ type: import.meta.env.MODE === 'production' ? 'classic' : 'module' }
			)
			.then((registration) => {
				if (user && user.id) {
					getToken(messaging!, { vapidKey, serviceWorkerRegistration: registration }).then(
						(currentToken) => {
							console.log(currentToken);
							apiFetch(endpoints.user.updateNotificationToken, {
								method: 'POST',
								body: { code: user?.id, value: currentToken }
							}).then(() => {
								unsubscribe();
							});
						}
					);
				}
			});
	}
};
