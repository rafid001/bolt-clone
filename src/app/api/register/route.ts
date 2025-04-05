import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/lib/auth";

export async function POST(req: NextRequest) {
  console.log("Registration API called");

  try {
    const body = await req.json();
    const { name, email, password } = body;

    console.log("Registration attempt for:", email);

    // Validate input
    if (!name || !email || !password) {
      console.log("Missing required fields:", {
        name: !!name,
        email: !!email,
        password: !!password,
      });
      return NextResponse.json(
        { message: "Missing required fields" },
        { status: 400 }
      );
    }

    // Register the user
    console.log("Calling registerUser function...");
    const result = await registerUser(name, email, password);
    console.log("registerUser result:", result);

    if (!result.success) {
      console.log("Registration failed:", result.message);
      return NextResponse.json({ message: result.message }, { status: 400 });
    }

    console.log("Registration successful for:", email);
    return NextResponse.json(
      { user: result.user, message: "Registration successful" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration API error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
