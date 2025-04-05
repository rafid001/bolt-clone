import { getServerSession } from "next-auth/next";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "../../auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get a specific workspace with messages
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const workspace = await prisma.workspace.findUnique({
      where: {
        id: params.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!workspace) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      );
    }

    if (workspace.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error fetching workspace:", error);
    return NextResponse.json(
      { message: "Failed to fetch workspace" },
      { status: 500 }
    );
  }
}

// Update a workspace
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description } = await req.json();

    // Check if the workspace exists and belongs to the user
    const existingWorkspace = await prisma.workspace.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      );
    }

    if (existingWorkspace.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const workspace = await prisma.workspace.update({
      where: {
        id: params.id,
      },
      data: {
        name,
        description,
      },
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("Error updating workspace:", error);
    return NextResponse.json(
      { message: "Failed to update workspace" },
      { status: 500 }
    );
  }
}

// Delete a workspace
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    // Check if the workspace exists and belongs to the user
    const existingWorkspace = await prisma.workspace.findUnique({
      where: {
        id: params.id,
      },
    });

    if (!existingWorkspace) {
      return NextResponse.json(
        { message: "Workspace not found" },
        { status: 404 }
      );
    }

    if (existingWorkspace.userId !== session.user.id) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    await prisma.workspace.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: "Workspace deleted" });
  } catch (error) {
    console.error("Error deleting workspace:", error);
    return NextResponse.json(
      { message: "Failed to delete workspace" },
      { status: 500 }
    );
  }
}
