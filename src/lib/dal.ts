import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { readSession, type SessionPayload } from "./session";

/**
 * Data Access Layer: the one place to read session state during a request.
 * Memoized with React `cache()` so repeated calls in a single render pass
 * don't re-decrypt the cookie.
 */
export const getSession = cache(async (): Promise<SessionPayload | null> => {
  return readSession();
});

/** Require a session. Redirects to /login if absent. */
export const requireSession = cache(async (): Promise<SessionPayload> => {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
});

/** Returns true if the email is permitted to sign in. (Open to all) */
export function isEmailAllowed(_email: string): boolean {
  return true;
}

