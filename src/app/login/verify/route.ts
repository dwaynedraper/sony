import { type NextRequest } from "next/server";
import { redirect } from "next/navigation";
import { consumeLoginToken } from "@/lib/auth-tokens";
import { createSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const token = searchParams.get("token");

  if (!token) {
    redirect("/login?error=missing-token");
  }

  const result = await consumeLoginToken(token);

  if (!result) {
    redirect("/login?error=invalid-token");
  }

  await createSession(result.userId, result.email);
  redirect("/");
}
