import { getSeekerForUser, requirePageSession } from "@/lib/authz";
import { ROLES } from "@/lib/constants";
import { Card } from "@/components/ui";
import { SeekerProfileForm } from "@/components/seeker-profile-form";

export default async function SeekerProfilePage() {
  const user = await requirePageSession([ROLES.JOB_SEEKER]);
  const seeker = await getSeekerForUser(Number(user.id));

  if (!seeker) return <Card>Profile not found.</Card>;

  return (
    <Card>
      <h1 className="mb-4 text-xl font-semibold">My Profile</h1>

      <SeekerProfileForm
        profile={{
          first_name: seeker.user.first_name,
          last_name: seeker.user.last_name,
          headline: seeker.headline,
          education: seeker.education,
          work_experience: seeker.work_experience,
          experience_years: seeker.experience_years,
          location: seeker.location,
          employment_type_preference: seeker.employment_type_preference,
          availability: seeker.availability,
          certifications: seeker.certifications,
          other_qualifications: seeker.other_qualifications,
          skills: seeker.seekerSkills.map((s) => s.skill.skill_name),
          profile_picture: seeker.profile_picture, // ← Added
        }}
      />
    </Card>
  );
}