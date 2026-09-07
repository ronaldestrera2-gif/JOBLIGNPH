const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const user = await prisma.user.create({
    data: {
      first_name: "Admin",
      last_name: "User",
      email: "admin@joblignph.com",
      password: hashedPassword,
      role: "admin",
      status: "active",
      admin: {
        create: {
          admin_level: "super",
        },
      },
    },
  });

  console.log("✅ Admin account created successfully!");
  console.log("Email: admin@joblignph.com");
  console.log("Password: admin123");
}

main()
  .catch((e) => {
    console.error(e);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });