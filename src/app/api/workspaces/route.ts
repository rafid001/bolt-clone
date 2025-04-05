import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all workspaces for the current user
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const workspaces = await prisma.workspace.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        messages: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    console.log("💫", workspaces);

    return NextResponse.json(workspaces);
  } catch (error) {
    console.error("Error fetching workspaces:", error);
    return NextResponse.json(
      { message: "Failed to fetch workspaces" },
      { status: 500 }
    );
  }
}

// Create a new workspace
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();

    if (!name) {
      return NextResponse.json(
        { message: "Workspace name is required" },
        { status: 400 }
      );
    }

    const workspace = await prisma.workspace.create({
      data: {
        name,
        description,
        userId: session.user.id,
      },
    });

    return NextResponse.json(workspace, { status: 201 });
  } catch (error) {
    console.error("Error creating workspace:", error);
    return NextResponse.json(
      { message: "Failed to create workspace" },
      { status: 500 }
    );
  }
}
