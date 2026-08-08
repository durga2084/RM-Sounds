import { prisma } from "@/lib/prisma";
import {
  FcmSubscriptions_AppRole,
  type FcmSubscriptions,
} from "@prisma/client";
import { sendPushNotification } from "@/services/PushNotificationService";
function getTargetDate(daysAhead: number) {
  const now = new Date();
  const target = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );
  target.setUTCDate(target.getUTCDate() + daysAhead);
  const start = new Date(target);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(target);
  end.setUTCHours(23, 59, 59, 999);
  return { start, end };
}
export async function sendEventReminders(daysAhead: number) {
  const { start, end } = getTargetDate(daysAhead);
  const bookings = await prisma.eventBookings.findMany({
    where: { EventDate: { gte: start, lte: end }, BookingStatus: "Accepted" },
    select: {
      BookingID: true,
      BookingNo: true,
      CustomerName: true,
      MobileNumber: true,
      EventType: true,
      EventDate: true,
      EventLocation: true,
    },
  });
  let notified = 0;
  for (const booking of bookings) {
    const eventType = await prisma.eventTypes.findUnique({
      where: { EventTypeID: booking.EventType },
      select: { EventTypeName: true },
    });
    const subscriptions = await prisma.fcmSubscriptions.findMany({
      where: {
        AppRole: FcmSubscriptions_AppRole.Customer,
        CustomerMobile: booking.MobileNumber,
      },
      select: { FcmToken: true },
    });
    if (subscriptions.length === 0) {
      continue;
    }
    const tokens: string[] = subscriptions.map(
      (s: Pick<FcmSubscriptions, "FcmToken">) => s.FcmToken,
    );
    let when = `in ${daysAhead} days`;
    if (daysAhead === 0) {
      when = "today";
    } else if (daysAhead === 1) {
      when = "tomorrow";
    }
    await sendPushNotification({
      tokens,
      title:
        daysAhead === 0 ? "Today's event reminder" : "Upcoming event reminder",
      body: `${eventType?.EventTypeName ?? "Your event"} is scheduled ${when}. Booking: ${booking.BookingNo}.`,
      link: "/Calendar?tab=my-bookings",
      data: {
        bookingId: String(booking.BookingID),
        bookingNo: booking.BookingNo,
        audience: "customer",
        reminderDays: String(daysAhead),
      },
    });
    notified++;
  }
  return {
    targetDate: start.toISOString().slice(0, 10),
    totalBookings: bookings.length,
    notified,
  };
}
