"use client";

import { signIn } from "next-auth/react";
import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function SignIn() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  // Auto-redirect to the homepage which has the login dialog
  useEffect(() => {
    router.push("/");
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to sign in...</h1>
        <p>
          If you are not redirected,{" "}
          <button
            onClick={() => router.push("/")}
            className="text-blue-500 underline"
          >
            click here
          </button>
        </p>
      </div>
    </div>
  );
}
