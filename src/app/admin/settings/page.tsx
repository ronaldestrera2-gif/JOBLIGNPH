import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { SettingsForm } from "@/components/settings-form";

export default async function AdminSettingsPage() {
  await requirePageSession([ROLES.ADMIN]);
  const setting = await prisma.systemSetting.findUnique({
    where: { setting_key: "require_employer_verification" },
  });
  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">System settings</h1>
      <SettingsForm requireVerification={setting?.setting_value ?? "true"} />
    </Card>
  );
}
