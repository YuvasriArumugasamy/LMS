import { User } from '../models/User.js';

/**
 * Initialize Firebase Admin SDK lazily (only when needed).
 * Requires FIREBASE_SERVICE_ACCOUNT_JSON env var (stringified JSON of service account key)
 * OR individual env vars: FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY
 */
let firebaseAdmin = null;

const getFirebaseAdmin = async () => {
  if (firebaseAdmin) return firebaseAdmin;

  try {
    const { default: admin } = await import('firebase-admin');

    if (admin.apps.length > 0) {
      firebaseAdmin = admin;
      return firebaseAdmin;
    }

    let credential;

    // Option 1: Full service account JSON provided as env var
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      credential = admin.credential.cert(serviceAccount);
    }
    // Option 2: Individual env vars
    else if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      credential = admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Vercel stores private key with literal \n — convert to real newlines
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      });
    } else {
      console.warn('[Push Notification] Firebase credentials not configured. Push notifications disabled.');
      return null;
    }

    admin.initializeApp({ credential });
    firebaseAdmin = admin;
    console.log('[Firebase Admin] Initialized successfully.');
    return firebaseAdmin;
  } catch (err) {
    console.error('[Firebase Admin] Initialization failed:', err.message);
    return null;
  }
};

/**
 * Send push notification to target user(s) via Firebase Admin SDK (HTTP v1 API)
 * @param {string|Array<string>} recipientIds - Single user ID or array of user IDs
 * @param {string} title - Push Notification Title
 * @param {string} message - Push Notification Body Content
 * @param {string} targetUrl - Navigation link upon click
 */
export const sendPushNotification = async (recipientIds, title, message, targetUrl = '/notifications') => {
  try {
    const ids = Array.isArray(recipientIds) ? recipientIds : [recipientIds];
    if (ids.length === 0) return;

    // Fetch active FCM tokens for target users
    const users = await User.find({
      _id: { $in: ids },
      fcmTokens: { $exists: true, $not: { $size: 0 } }
    }).select('fcmTokens firstName lastName');

    const tokens = users.flatMap((u) => u.fcmTokens).filter(Boolean);
    if (tokens.length === 0) {
      console.log(`[Push Notification] No registered FCM tokens found for recipients (${ids.length} users).`);
      return;
    }

    const admin = await getFirebaseAdmin();
    if (!admin) return;

    const messaging = admin.messaging();

    // Send to all tokens in parallel using the HTTP v1 API (sendEachForMulticast)
    const multicastMessage = {
      tokens,
      notification: {
        title,
        body: message
      },
      webpush: {
        notification: {
          title,
          body: message,
          icon: '/favicon.ico',
          click_action: targetUrl
        },
        fcmOptions: {
          link: targetUrl
        }
      },
      data: {
        title,
        message,
        targetUrl
      }
    };

    const response = await messaging.sendEachForMulticast(multicastMessage);

    const successCount = response.successCount;
    const failureCount = response.failureCount;

    if (failureCount > 0) {
      // Log failed tokens for cleanup (stale tokens)
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          const errorCode = resp.error?.code || 'unknown';
          console.warn(`[Push Notification] Token ${tokens[idx]?.substring(0, 12)}... failed: ${errorCode}`);
        }
      });
    }

    console.log(`[Push Notification] "${title}" — sent: ${successCount}, failed: ${failureCount}, total tokens: ${tokens.length}`);
  } catch (error) {
    console.error('[Push Notification Service Error]', error.message);
  }
};
