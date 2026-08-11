import { User } from '../models/User.js';

/**
 * Send push notification to target user(s) via Firebase Cloud Messaging
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

    const serverKey = process.env.FIREBASE_SERVER_KEY || process.env.FIREBASE_VAPID_KEY;

    // Dispatch FCM push requests for registered tokens
    const pushPromises = tokens.map(async (token) => {
      try {
        const response = await fetch('https://fcm.googleapis.com/fcm/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `key=${serverKey}`
          },
          body: JSON.stringify({
            to: token,
            notification: {
              title: title,
              body: message,
              icon: '/favicon.ico',
              click_action: targetUrl
            },
            data: {
              title: title,
              message: message,
              targetUrl: targetUrl
            }
          })
        });

        const result = await response.json().catch(() => null);
        return result;
      } catch (err) {
        console.error(`[Push Notification Error] Failed to send to token ${token.substring(0, 10)}...`, err.message);
      }
    });

    await Promise.allSettled(pushPromises);
    console.log(`[Push Notification] Dispatched "${title}" to ${tokens.length} device token(s).`);
  } catch (error) {
    console.error('[Push Notification Service Error]', error);
  }
};
