// Firebase Cloud Messaging Client Service
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, isSupported } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyDemoKeyForFirebaseMessaging',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'lms---application.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'lms---application',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'lms---application.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '236346623530',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:236346623530:web:NGNjNmM0MWItNDAwYS00ZTBjLTBjMTIwOWYtMjlxTlwOGQw'
};

const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BGOoVAyqlja4GGzrS4onFGnB_A5eXhhFNNo8twd9_2nr-Hu8C-7OnOJ1IeG1LWO6lu6CqaixzkCQumUSVi7Xp2Q';

let app = null;
let messaging = null;

try {
  app = initializeApp(firebaseConfig);
} catch (err) {
  console.warn('Firebase initialization warning:', err);
}

export const requestFcmToken = async () => {
  try {
    const supported = await isSupported();
    if (!supported) {
      console.warn('Firebase Cloud Messaging is not supported in this browser.');
      return null;
    }

    if (!('Notification' in window)) {
      console.warn('Notifications API not supported in this browser.');
      return null;
    }

    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('Notification permission denied by user.');
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
      console.warn('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (err) {
    console.error('Error retrieving FCM token:', err);
    return null;
  }
};

export const onForegroundMessage = (callback) => {
  try {
    if (!messaging && app) {
      messaging = getMessaging(app);
    }
    if (messaging) {
      return onMessage(messaging, (payload) => {
        callback(payload);
      });
    }
  } catch (err) {
    console.error('Error registering foreground messaging listener:', err);
  }
  return () => {};
};
