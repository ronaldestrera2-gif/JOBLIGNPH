import { APPLICATION_PIPELINE } from "@/lib/constants";
import { Badge } from "@/components/ui";

const tone: Record<string, "slate" | "green" | "amber" | "blue" | "red" | "purple"> = {
  applied: "blue",
  shortlisted: "purple",
  interview: "amber",
  offered: "green",
  hired: "green",
  rejected: "red",
  active: "green",
  closed: "slate",
  draft: "amber",
  pending: "amber",
  verified: "green",
  scheduled: "blue",
  completed: "green",
  cancelled: "red",
  rescheduled: "amber",
};

export function StatusBadge({ value }: { value: string }) {
  return <Badge tone={tone[value] ?? "slate"}>{value.replaceAll("_", " ")}</Badge>;
}

export function ApplicationTimeline({ status }: { status: string }) {
  const rejected = status === "rejected";
  const current = APPLICATION_PIPELINE.indexOf(
    status as (typeof APPLICATION_PIPELINE)[number],
  );

  return (
    <ol className="flex flex-wrap items-center gap-2 text-sm">
      {APPLICATION_PIPELINE.map((step, index) => {
        const done = !rejected && current >= index;
        const isCurrent = step === status;
        return (
          <li key={step} className="flex items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 capitalize ${
                isCurrent
                  ? "bg-brand text-white"
                  : done
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-slate-100 text-slate-500"
              }`}
            >
              {step}
            </span>
            {index < APPLICATION_PIPELINE.length - 1 ? (
              <span className="text-slate-400">→</span>
            ) : null}
          </li>
        );
      })}
      {rejected ? (
        <li>
          <span className="rounded-full bg-red-100 px-3 py-1 text-red-700">Rejected</span>
        </li>
      ) : null}
    </ol>
  );
}

export function MatchPanel({
  score,
  matching,
  missing,
}: {
  score: number;
  matching: string[];
  missing: string[];
}) {
  return (
    <div className="rounded-xl border border-line bg-slate-50 p-4">
      <p className="text-2xl font-semibold text-brand">{score}% Match</p>
      <p className="mt-1 text-xs text-muted">
        Recommendation only. This score does not guarantee employment.
      </p>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Matching skills</p>
          <ul className="mt-1 space-y-1 text-sm">
            {matching.length ? matching.map((s) => <li key={s}>✓ {s}</li>) : <li>None yet</li>}
          </ul>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase text-muted">Missing</p>
          <ul className="mt-1 space-y-1 text-sm">
            {missing.length ? missing.map((s) => <li key={s}>• {s}</li>) : <li>No gaps</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function ProfileMeter({ value }: { value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>Profile completion</span>
        <span>{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-200">
        <div className="h-full bg-brand" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
