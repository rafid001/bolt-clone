import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../api/auth/[...nextauth]/route";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;
    const messages = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json(
        { error: "Invalid messages format" },
        { status: 400 }
      );
    }

    // Remove undefined or null workspaceIds
    const workspaceIds = [
      ...new Set(messages.map((msg) => msg.workspaceId).filter(Boolean)),
    ];

    if (workspaceIds.length === 0) {
      return NextResponse.json(
        { error: "No valid workspace IDs found" },
        { status: 400 }
      );
    }

    // Validate if the user owns the workspaces
    const validWorkspaces = await prisma.workspace.findMany({
      where: { id: { in: workspaceIds }, userId },
      select: { id: true },
    });

    const validWorkspaceIds = new Set(validWorkspaces.map((ws) => ws.id));
    const filteredMessages = messages.filter((msg) =>
      validWorkspaceIds.has(msg.workspaceId)
    );

    if (filteredMessages.length === 0) {
      return NextResponse.json(
        { error: "No valid workspaces found" },
        { status: 403 }
      );
    }

    console.log("✅❌", filteredMessages);

    const createdMessages = await prisma.$transaction(
      filteredMessages.map((msg) =>
        prisma.message.create({
          data: {
            content: msg.content,
            fileData: msg.fileData,
            workspaceId: msg.workspaceId,
          },
        })
      )
    );

    return NextResponse.json(
      { success: true, messages: createdMessages },
      { status: 201 }
    );
  } catch (err) {
    console.error("Error saving messages:", err);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
