"use client";

import { useRouter, useSearchParams } from "next/navigation";

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4 text-red-600">
          Authentication Error
        </h1>
        <p className="mb-4">
          {error === "CredentialsSignin"
            ? "Invalid email or password."
            : "An error occurred during authentication."}
        </p>
        <button
          onClick={() => router.push("/")}
          className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
}
