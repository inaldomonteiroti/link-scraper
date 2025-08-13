const { PrismaClient } = require("@prisma/client");
import dotenv from "dotenv";

dotenv.config();

const prisma = new PrismaClient();

async function main(): Promise<void> {
  try {
    console.log("Initializing database...");

    const testUser = await prisma.user.upsert({
      where: { email: "test@example.com" },
      update: {},
      create: {
        username: "testuser",
        email: "test@example.com",
        password:
          "$2b$10$spOll2Dq4bQObtJiC/ISVOlI5z/eWe4VJ4S9xbeUKdqmEk3CNJMdK", // password is 'password'
        pages: {
          create: [
            {
              url: "https://example.com",
              title: "Example Domain",
              status: "done",
              linkCount: 1,
              queuedAt: new Date(),
              startedAt: new Date(),
              finishedAt: new Date(),
              links: {
                create: [
                  {
                    href: "https://www.iana.org/domains/example",
                    name: "More information...",
                  },
                ],
              },
            },
          ],
        },
      },
    });

    console.log("Database initialized with test user:");
    console.log("Email: test@example.com");
    console.log("Password: password");
    console.log("User ID:", testUser.id);
  } catch (error) {
    console.error("Error initializing database:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
