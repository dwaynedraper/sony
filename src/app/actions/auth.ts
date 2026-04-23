"use server";

import { redirect } from "next/navigation";
import { issueLoginToken } from "@/lib/auth-tokens";
import { sendMagicLink } from "@/lib/email";
import { deleteSession } from "@/lib/session";
import { isEmailAllowed } from "@/lib/dal";

export interface RequestLoginState {
  ok?: boolean;
  error?: string;
}

/**
 * Form action for /login. Emits a magic-link email if the address is on the allowlist.
 * Always returns {ok:true} to prevent email enumeration — callers can't distinguish
 * "sent" from "not allowed".
 */
export async function requestLogin(
  _prev: RequestLoginState | undefined,
  formData: FormData
): Promise<RequestLoginState> {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Enter a valid email address." };
  }

  if (isEmailAllowed(email)) {
    try {
      const token = await issueLoginToken(email);
      const base = process.env.APP_URL || "http://localhost:3000";
      const url = `${base}/login/verify?token=${encodeURIComponent(token)}`;
      await sendMagicLink(email, url);
    } catch (err) {
      console.error("[auth] failed to send magic link:", err);
      return { error: "Something went wrong sending the email. Please try again." };
    }
  }

  return { ok: true };
}

export async function logout(): Promise<void> {
  await deleteSession();
  redirect("/login");
}
