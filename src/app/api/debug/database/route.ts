import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Count users
    const userCount = await prisma.user.count();

    // Get a list of email addresses (without exposing sensitive info)
    const emails = await prisma.user.findMany({
      select: {
        email: true,
      },
    });

    return NextResponse.json({
      userCount,
      emails: emails.map((u) => u.email),
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Database debug error:", error);
    return NextResponse.json(
      {
        error: "Failed to query database",
        message: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
