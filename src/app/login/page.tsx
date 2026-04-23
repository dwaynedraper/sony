import type { Metadata } from "next";
import LoginForm from "./login-form";
import { getSession } from "@/lib/dal";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Sign in | Sony Rep Toolkit",
};

interface LoginPageProps {
  searchParams: Promise<{ error?: string }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { error } = await searchParams;
  const session = await getSession();
  if (session) redirect("/");

  let errorMessage = "";
  if (error === "invalid-token") errorMessage = "The sign-in link is invalid or has expired.";
  if (error === "missing-token") errorMessage = "The sign-in link is missing a token.";

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">Sony Rep Toolkit</h1>
          <p className="mt-2 text-sm text-text-secondary">Sign in with your email to continue.</p>
        </div>
        
        {errorMessage && (
          <div className="mb-6 rounded-lg bg-red-500/10 p-3 text-center text-sm text-red-500 border border-red-500/20">
            {errorMessage}
          </div>
        )}

        <LoginForm />
      </div>
    </main>
  );
}
