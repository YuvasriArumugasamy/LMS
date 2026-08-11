// Firebase Cloud Messaging Background Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.5/firebase-messaging-compat.js');

// Initialize Firebase App in Service Worker
firebase.initializeApp({
  apiKey: "AIzaSyDemoKeyForFirebaseMessaging",
  authDomain: "lms---application.firebaseapp.com",
  projectId: "lms---application",
  storageBucket: "lms---application.appspot.com",
  messagingSenderId: "236346623530",
  appId: "1:236346623530:web:NGNjNmM0MWItNDAwYS00ZTBjLTBjMTIwOWYtMjlxTlwOGQw"
});

const messaging = firebase.messaging();

// Handle background notifications
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message: ', payload);
  const notificationTitle = payload.notification?.title || 'LMS Notification';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.message || 'New update in Leave Management System',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    data: {
      url: payload.data?.targetUrl || '/notifications'
    }
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(targetUrl) && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
