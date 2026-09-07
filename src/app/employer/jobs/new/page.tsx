import { Card } from "@/components/ui";
import { JobForm } from "@/components/job-form";

export default function NewJobPage() {
  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">Create job</h1>
      <JobForm />
    </Card>
  );
}
