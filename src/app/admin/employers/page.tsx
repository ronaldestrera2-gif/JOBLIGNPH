import { prisma } from "@/lib/prisma";
import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { StatusBadge } from "@/components/status";
import { VerifyActions } from "@/components/verify-actions";

export default async function AdminEmployersPage() {
  await requirePageSession([ROLES.ADMIN]);

  const employers = await prisma.employer.findMany({
    include: {
      user: true,
      companyProfile: true,
    },
    orderBy: { created_at: "desc" },
  });

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold">Employer verification</h1>

      {employers.map((e) => (
        <Card key={e.employer_id} className="space-y-2">
          <div className="flex flex-wrap justify-between gap-3">
            <div className="flex items-start gap-4">
              {/* Company Logo */}
              <div className="h-14 w-14 rounded-lg overflow-hidden bg-gray-100 border shrink-0 flex items-center justify-center">
                {e.companyProfile?.logo_path ? (
                  <img
                    src={e.companyProfile.logo_path}
                    alt={e.company_name}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-400 font-medium">
                    {e.company_name.charAt(0)}
                  </span>
                )}
              </div>

              <div>
                <p className="font-semibold">{e.company_name}</p>
                <p className="text-sm text-muted">
                  {e.user.first_name} {e.user.last_name} • {e.user.email}
                </p>
                <p className="text-sm">
                  {e.industry} • {e.company_location}
                </p>
                <p className="text-sm text-gray-600 mt-1">{e.company_description}</p>
              </div>
            </div>

            <StatusBadge value={e.verification_status} />
          </div>

          {e.verification_status === "pending" ? (
            <VerifyActions employerId={e.employer_id} />
          ) : null}
        </Card>
      ))}
    </div>
  );
}