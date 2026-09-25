import "dotenv/config";
import { PrismaClient, Role, UserStatus } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const phone = process.env.ADMIN_PHONE;
  const password = process.env.ADMIN_PASSWORD;
  if (!phone || !password || password.length < 12) {
    throw new Error("Set ADMIN_PHONE and an ADMIN_PASSWORD of at least 12 characters");
  }

  const existing = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (existing) {
    console.log("An admin account already exists; no changes made.");
    return;
  }

  await prisma.user.create({ data: {
    name: "Medixo Admin",
    email: process.env.ADMIN_EMAIL || "admin@medixo.local",
    phone,
    password: await bcrypt.hash(password, 12),
    address: "Head Office",
    role: Role.ADMIN,
    status: UserStatus.APPROVED,
  } });

  console.log("Admin account created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
