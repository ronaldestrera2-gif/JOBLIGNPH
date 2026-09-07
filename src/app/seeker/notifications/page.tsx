import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { NotificationList } from "@/components/notification-list";

export default async function NotificationsPage() {
  const user = await requirePageSession();
  const notifications = await prisma.notification.findMany({
    where: { user_id: Number(user.id) },
    orderBy: { created_at: "desc" },
    take: 50,
  });
  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold">Notifications</h1>
      <NotificationList
        items={notifications.map((n) => ({
          ...n,
          created_at: n.created_at.toISOString(),
        }))}
      />
    </div>
  );
}
