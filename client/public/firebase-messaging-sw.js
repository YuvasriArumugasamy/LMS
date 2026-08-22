// Firebase Cloud Messaging Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

// Initialize Firebase App in Service Worker with REAL config
firebase.initializeApp({
  apiKey: "AIzaSyAQ6LWeCGCbY-Hivnwa8158hdx1HdbNPv8",
  authDomain: "lms---application.firebaseapp.com",
  projectId: "lms---application",
  storageBucket: "lms---application.firebasestorage.app",
  messagingSenderId: "236346623530",
  appId: "1:236346623530:web:4c3a766f4a362cd9212553"
});

const messaging = firebase.messaging();

// Handle background notifications (when app is closed or in background)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  
  const notificationTitle = payload.notification?.title || 'LCM Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || 'New update in Life Changers Management',
    icon: '/logo.png',
    badge: '/favicon.ico',
    tag: payload.data?.notificationId || 'lms-notification',
    requireInteraction: false,
    data: {
      url: payload.data?.targetUrl || '/notifications',
      clickAction: payload.data?.targetUrl || '/notifications'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event.notification);
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || event.notification.data?.clickAction || '/notifications';
  const fullUrl = self.location.origin + targetUrl;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Check if a window is already open with the target URL
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});
