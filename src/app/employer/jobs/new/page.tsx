import { requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { JobForm } from "@/components/job-form";

export default async function NewJobPage() {
  await requirePageSession([ROLES.EMPLOYER]);

  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Create job</h1>
      <JobForm />
    </Card>
  );
}