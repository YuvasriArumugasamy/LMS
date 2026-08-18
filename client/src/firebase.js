// Firebase Cloud Messaging Client Service
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lms---application.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lms---application',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lms---application.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '236346623530',
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

// Only initialize Firebase if required config is present
const isFirebaseConfigured = !!(firebaseConfig.apiKey && firebaseConfig.appId && VAPID_KEY);

let app = null;
let messaging = null;

if (isFirebaseConfigured) {
  try {
    app = initializeApp(firebaseConfig);
  } catch (err) {
    console.warn('[Firebase] Initialization warning:', err.message);
  }
} else {
  console.info('[Firebase] Push notifications not configured — VITE_FIREBASE_API_KEY or VITE_FIREBASE_APP_ID missing.');
}

export const requestFcmToken = async () => {
  try {
    // Return null silently if Firebase is not configured
    if (!isFirebaseConfigured || !app) {
      return null;
    }

    const supported = await isSupported();
    if (!supported) {
      console.warn('[Firebase] Cloud Messaging is not supported in this browser.');
      return null;
    }

    if (!('Notification' in window)) {
      console.warn('[Firebase] Notifications API not supported in this browser.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[Firebase] Notification permission denied by user.');
      return null;
    }

    if (!messaging && app) {
      messaging = getMessaging(app);
    }

    // Register service worker if not already registered
    let registration = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');
    if (!registration) {
      registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    }

    const currentToken = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration
    });

    if (currentToken) {
      return currentToken;
    } else {
      console.warn('[Firebase] No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('[Firebase] Error retrieving FCM token:', err.message);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  try {
    if (!isFirebaseConfigured || !app) return () => {};
    if (!messaging && app) {
      messaging = getMessaging(app);
    }
    if (messaging) {
      return onMessage(messaging, (payload) => {
        callback(payload);
      });
    }
  } catch (err) {
    console.error('[Firebase] Error registering foreground messaging listener:', err.message);
  }
  return () => {};
};
