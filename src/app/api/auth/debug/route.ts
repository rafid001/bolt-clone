import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth/next";
import { authOptions } from "../[...nextauth]/route";

const prisma = new PrismaClient();

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();

    // Get session info (if any)
    const session = await getServerSession(authOptions);

    // Get basic account information without exposing sensitive data
    const accounts = await prisma.account.findMany({
      select: {
        provider: true,
        providerAccountId: true,
        userId: true,
      },
    });

    // Check if tables exist
    const userTable =
      await prisma.$queryRaw`SELECT * FROM information_schema.tables WHERE table_name = 'User'`;
    const accountTable =
      await prisma.$queryRaw`SELECT * FROM information_schema.tables WHERE table_name = 'Account'`;

    return NextResponse.json({
      databaseConnected: true,
      userCount,
      tables: {
        userExists: Array.isArray(userTable) && (userTable as any[]).length > 0,
        accountExists:
          Array.isArray(accountTable) && (accountTable as any[]).length > 0,
      },
      accountCount: accounts.length,
      session,
      authenticated: !!session,
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
