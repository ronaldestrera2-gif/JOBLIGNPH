import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function upsertSkill(skill_name: string, category: string) {
  return prisma.skill.upsert({
    where: { skill_name },
    update: { category },
    create: { skill_name, category },
  });
}

async function main() {
  const skills = await Promise.all(
    [
      ["JavaScript", "Programming"],
      ["TypeScript", "Programming"],
      ["HTML", "Frontend"],
      ["CSS", "Frontend"],
      ["React", "Frontend"],
      ["SQL", "Database"],
      ["Java", "Programming"],
      ["Git", "Tools"],
      ["Python", "Programming"],
      ["Customer Service", "Soft Skills"],
      ["Accounting", "Finance"],
      ["Excel", "Tools"],
    ].map(([name, category]) => upsertSkill(name, category)),
  );

  const skillMap = Object.fromEntries(skills.map((s) => [s.skill_name, s]));

  const password = await bcrypt.hash("Seeker123!", 12);
  const employerPass = await bcrypt.hash("Employer123!", 12);
  const adminPass = await bcrypt.hash("Admin123!", 12);

  const adminUser = await prisma.user.upsert({
    where: { email: "admin@joblign.ph" },
    update: {},
    create: {
      first_name: "Ana",
      last_name: "Reyes",
      email: "admin@joblign.ph",
      password: adminPass,
      role: "admin",
      admin: { create: { admin_level: "super" } },
    },
  });

  const seekerUser = await prisma.user.upsert({
    where: { email: "seeker@joblign.ph" },
    update: {},
    create: {
      first_name: "Miguel",
      last_name: "Santos",
      email: "seeker@joblign.ph",
      password,
      role: "job_seeker",
      jobSeeker: {
        create: {
          headline: "Frontend Developer",
          education: "BS Computer Science, University of the Philippines",
          work_experience: "2 years building web apps for a BPO digital team.",
          experience_years: 2,
          location: "Quezon City",
          employment_type_preference: "full-time",
          availability: "Immediate",
          certifications: "Meta Front-End Developer",
          other_qualifications: "Conversational Filipino and English",
        },
      },
    },
    include: { jobSeeker: true },
  });

  const employerUser = await prisma.user.upsert({
    where: { email: "employer@joblign.ph" },
    update: {},
    create: {
      first_name: "Lara",
      last_name: "Cruz",
      email: "employer@joblign.ph",
      password: employerPass,
      role: "employer",
      employer: {
        create: {
          company_name: "ABC Technology Inc.",
          company_description: "A Philippine software firm serving banks and telcos.",
          company_location: "Makati",
          industry: "Information Technology",
          contact_number: "+63 2 8888 1000",
          verification_status: "verified",
          verified_by: adminUser.user_id,
          verified_at: new Date(),
          companyProfile: {
            create: {
              website: "https://abctech.example",
              company_size: "51-200",
            },
          },
        },
      },
    },
    include: { employer: true },
  });

  await prisma.user.upsert({
    where: { email: "pending@joblign.ph" },
    update: {},
    create: {
      first_name: "Rico",
      last_name: "Tan",
      email: "pending@joblign.ph",
      password: employerPass,
      role: "employer",
      employer: {
        create: {
          company_name: "Island Logistics PH",
          company_description: "Nationwide last-mile delivery.",
          company_location: "Cebu City",
          industry: "Logistics",
          verification_status: "pending",
          companyProfile: { create: { website: "https://islandlogistics.example", company_size: "11-50" } },
        },
      },
    },
  });

  const seeker =
    seekerUser.jobSeeker ??
    (await prisma.jobSeeker.findUnique({ where: { user_id: seekerUser.user_id } }));
  const employer =
    employerUser.employer ??
    (await prisma.employer.findUnique({ where: { user_id: employerUser.user_id } }));

  if (!seeker || !employer) throw new Error("Seed profiles missing");

  for (const name of ["JavaScript", "HTML", "CSS", "React"]) {
    await prisma.seekerSkill.upsert({
      where: {
        seeker_id_skill_id: {
          seeker_id: seeker.seeker_id,
          skill_id: skillMap[name].skill_id,
        },
      },
      update: {},
      create: { seeker_id: seeker.seeker_id, skill_id: skillMap[name].skill_id },
    });
  }

  const resume = await prisma.resume.upsert({
    where: { resume_id: 1 },
    update: {},
    create: {
      seeker_id: seeker.seeker_id,
      file_name: "miguel-santos-resume.pdf",
      file_path: "resumes/sample.txt",
    },
  });

  const deadline = new Date();
  deadline.setDate(deadline.getDate() + 21);

  const frontend = await prisma.jobPosting.upsert({
    where: { job_id: 1 },
    update: {},
    create: {
      employer_id: employer.employer_id,
      job_title: "Software Developer",
      job_description:
        "Build customer-facing web applications with React and collaborate with backend engineers. Match scores are recommendations only.",
      location: "Makati",
      employment_type: "full-time",
      salary_min: 40000,
      salary_max: 70000,
      salary_range: "₱40,000 – ₱70,000",
      status: "active",
      deadline,
    },
  });

  const support = await prisma.jobPosting.upsert({
    where: { job_id: 2 },
    update: {},
    create: {
      employer_id: employer.employer_id,
      job_title: "Technical Support Specialist",
      job_description:
        "Help enterprise clients resolve product issues. Strong communication skills required.",
      location: "Quezon City",
      employment_type: "full-time",
      salary_min: 25000,
      salary_max: 35000,
      salary_range: "₱25,000 – ₱35,000",
      status: "active",
      deadline,
    },
  });

  for (const [job, names] of [
    [frontend, ["JavaScript", "React", "HTML", "SQL"]],
    [support, ["Customer Service", "Excel"]],
  ] as const) {
    for (const name of names) {
      await prisma.jobSkill.upsert({
        where: {
          job_id_skill_id: { job_id: job.job_id, skill_id: skillMap[name].skill_id },
        },
        update: {},
        create: {
          job_id: job.job_id,
          skill_id: skillMap[name].skill_id,
          required_level: "intermediate",
        },
      });
    }
  }

  await prisma.application.upsert({
    where: {
      seeker_id_job_id: { seeker_id: seeker.seeker_id, job_id: frontend.job_id },
    },
    update: {},
    create: {
      seeker_id: seeker.seeker_id,
      job_id: frontend.job_id,
      resume_id: resume.resume_id,
      cover_letter: "I would like to join ABC Technology Inc. as a Software Developer.",
      status: "shortlisted",
    },
  });

  await prisma.systemSetting.upsert({
    where: { setting_key: "require_employer_verification" },
    update: {},
    create: { setting_key: "require_employer_verification", setting_value: "true" },
  });
  await prisma.systemSetting.upsert({
    where: { setting_key: "platform_name" },
    update: {},
    create: { setting_key: "platform_name", setting_value: "JobLign PH" },
  });

  console.log("Seed complete. Demo accounts:");
  console.log("  admin@joblign.ph / Admin123!");
  console.log("  seeker@joblign.ph / Seeker123!");
  console.log("  employer@joblign.ph / Employer123!");
  console.log("  pending@joblign.ph / Employer123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
