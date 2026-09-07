import { getEmployerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { CompanyForm } from "@/components/company-form";

export default async function CompanyPage() {
  const user = await requirePageSession([ROLES.EMPLOYER]);
  const employer = await getEmployerForUser(Number(user.id));

  if (!employer) return <Card>Company not found.</Card>;

  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Company profile</h1>
      <CompanyForm
        profile={{
          company_name: employer.company_name,
          company_description: employer.company_description,
          company_location: employer.company_location,
          industry: employer.industry,
          contact_number: employer.contact_number,
          website: employer.companyProfile?.website,
          company_size: employer.companyProfile?.company_size,
          verification_status: employer.verification_status,
          logo_path: employer.companyProfile?.logo_path, // ← Added
        }}
      />
    </Card>
  );
}