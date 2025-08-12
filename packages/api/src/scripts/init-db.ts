import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function seed() {
  try {
    console.log("Seeding database...");

    // Create test user
    const hashedPassword = await bcrypt.hash("password", 10);
    const user = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        username: "testuser",
        email: "test@example.com",
        password: hashedPassword,
      },
    });

    console.log(`Created test user: ${user.email}`);
    console.log("Database seeding completed successfully");
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

seed();