import { prisma } from "@/lib/prisma";

export async function notifyUser(input: {
  userId: number;
  title: string;
  message: string;
  type: string;
}) {
  return prisma.notification.create({
    data: {
      user_id: input.userId,
      title: input.title,
      message: input.message,
      notification_type: input.type,
    },
  });
}
