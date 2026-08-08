import { getFirebaseMessaging } from "@/lib/firebase-admin";
import type { SendResponse } from "firebase-admin/messaging";

export interface PushNotificationInput {
  tokens: string[];
  title: string;
  body: string;
  data?: Record<string, string>;
  link?: string;
}

export async function sendPushNotification({
  tokens,
  title,
  body,
  data = {},
  link = "/",
}: PushNotificationInput) {
  const uniqueTokens = [...new Set(tokens.filter(Boolean))];

  if (uniqueTokens.length === 0) {
    return {
      successCount: 0,
      failureCount: 0,
      invalidTokens: [] as string[],
    };
  }

  const response = await getFirebaseMessaging().sendEachForMulticast({
    tokens: uniqueTokens,

    notification: {
      title,
      body,
    },

    data: {
      ...data,
      link,
    },

    webpush: {
      fcmOptions: {
        link,
      },

      notification: {
        title,
        body,
        icon: "/icons/client-icon-192x192.png",
      },
    },
  });

  const invalidTokens: string[] = [];

  response.responses.forEach((result: SendResponse, index: number) => {
    if (!result.success) {
      const code = result.error?.code ?? "";

      if (
        code.includes("registration-token-not-registered") ||
        code.includes("invalid-registration-token")
      ) {
        invalidTokens.push(uniqueTokens[index]);
      }
    }
  });

  return {
    successCount: response.successCount,
    failureCount: response.failureCount,
    invalidTokens,
  };
}
