/**
 * Push notification service using Expo
 */

interface PushNotificationData {
  title: string;
  body: string;
  data?: Record<string, any>;
}

/**
 * Send push notification via Expo
 */
export async function sendPushNotification(
  expoPushToken: string,
  notification: PushNotificationData
): Promise<void> {
  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate',
      },
      body: JSON.stringify({
        to: expoPushToken,
        sound: 'default',
        title: notification.title,
        body: notification.body,
        data: notification.data,
        priority: 'high',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Expo push notification error:', error);
      throw new Error(`Push notification failed: ${error}`);
    }

    const result = await response.json();
    if (result.data?.status === 'error') {
      console.error('Expo push notification error:', result.data.message);
    }
  } catch (error) {
    console.error('Failed to send push notification:', error);
    // Don't throw - push notifications are non-critical
  }
}
