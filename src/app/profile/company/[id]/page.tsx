import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { Card, Badge } from "@/components/ui";
import Link from "next/link";
import { BackButton } from "@/components/back-button";

export default async function CompanyPublicProfile({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const employer = await prisma.employer.findUnique({
    where: { employer_id: Number(id) },
    include: {
      user: true,
      companyProfile: true,
      jobPostings: {
        where: { status: "active" },
        orderBy: { posted_at: "desc" },
        take: 6,
      },
    },
  });

  if (!employer) notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Cover */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 h-44 relative mb-20">
        <div className="absolute top-4 left-4">
          <BackButton />
        </div>

        <div className="absolute -bottom-16 left-6 md:left-10 flex items-end gap-5">
          <div className="h-32 w-32 rounded-xl border-4 border-white overflow-hidden bg-white shadow-lg flex items-center justify-center shrink-0">
            {employer.companyProfile?.logo_path ? (
              <img
                src={employer.companyProfile.logo_path}
                alt={employer.company_name}
                className="h-full w-full object-cover"
              />
            ) : (
              <span className="text-4xl font-bold text-blue-600">
                {employer.company_name.charAt(0)}
              </span>
            )}
          </div>

          <div className="pb-2">
            <h1 className="text-2xl md:text-3xl font-bold text-slate-900">
              {employer.company_name}
            </h1>
            <p className="text-slate-600">
              {employer.industry || "Company"} •{" "}
              {employer.company_location || "Philippines"}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 pb-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-lg mb-3">About the Company</h2>
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-800">Industry:</span>{" "}
                {employer.industry || "Not specified"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Location:</span>{" "}
                {employer.company_location || "Not specified"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Company Size:</span>{" "}
                {employer.companyProfile?.company_size || "Not specified"}
              </p>
              <p>
                <span className="font-medium text-slate-800">Contact:</span>{" "}
                {employer.contact_number || "Not specified"}
              </p>
              {employer.companyProfile?.website && (
                <p>
                  <span className="font-medium text-slate-800">Website:</span>{" "}
                  <a
                    href={employer.companyProfile.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {employer.companyProfile.website}
                  </a>
                </p>
              )}
              <p>
                <span className="font-medium text-slate-800">Status:</span>{" "}
                <Badge
                  tone={
                    employer.verification_status === "verified" ? "green" : "blue"
                  }
                >
                  {employer.verification_status}
                </Badge>
              </p>
            </div>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <Card className="p-5">
            <h2 className="font-semibold text-lg mb-3">Company Description</h2>
            <p className="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">
              {employer.company_description ||
                "No company description provided."}
            </p>
          </Card>

          <Card className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-semibold text-lg">Open Positions</h2>
              <span className="text-sm text-slate-500">
                {employer.jobPostings.length} active job
                {employer.jobPostings.length !== 1 ? "s" : ""}
              </span>
            </div>

            {employer.jobPostings.length === 0 ? (
              <p className="text-sm text-slate-500">
                No open positions at the moment.
              </p>
            ) : (
              <div className="space-y-3">
                {employer.jobPostings.map((job) => (
                  <Link
                    key={job.job_id}
                    href={`/jobs/${job.job_id}`}
                    className="block p-4 border rounded-lg hover:border-blue-300 hover:bg-blue-50 transition"
                  >
                    <p className="font-medium text-slate-800">{job.job_title}</p>
                    <p className="text-sm text-slate-500 mt-1">
                      {job.location} • {job.employment_type}
                    </p>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}