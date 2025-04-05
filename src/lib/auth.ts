import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

export async function registerUser(
  name: string,
  email: string,
  password: string
) {
  console.log(`Attempting to register user with email: ${email}`);

  try {
    // Check if user already exists
    console.log("Checking if user exists...");
    const existingUser = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: "insensitive",
        },
      },
    });

    console.log("Existing user check result:", !!existingUser);

    if (existingUser) {
      console.log("User already exists with email:", email);
      return { success: false, message: "Email already in use" };
    }

    // Hash password
    console.log("Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    console.log("Creating new user...");
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    console.log("User created successfully:", user.id);
    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  } catch (error) {
    console.error("Registration error:", error);

    // Check for specific Prisma errors
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage.includes("Unique constraint failed")) {
      return { success: false, message: "Email already in use" };
    }

    return { success: false, message: "Failed to register user" };
  }
}
