"use client";

import { useActionState } from "react";
import { requestLogin, type RequestLoginState } from "@/app/actions/auth";

export default function LoginForm() {
  const [state, action, pending] = useActionState<RequestLoginState | undefined, FormData>(
    requestLogin,
    undefined
  );

  if (state?.ok) {
    return (
      <div className="rounded-xl border border-border bg-surface/60 p-6 text-center">
        <p className="text-sm leading-relaxed">
          Check your inbox. If your email is on the allowlist, a sign-in link is on the way.
        </p>
        <p className="mt-3 text-xs text-text-muted">
          The link expires in 15 minutes and can only be used once.
        </p>
      </div>
    );
  }

  return (
    <form action={action} className="flex flex-col gap-3">
      <label className="flex flex-col gap-1 text-sm">
        <span className="text-text-secondary">Email</span>
        <input
          name="email"
          type="email"
          autoComplete="email"
          required
          autoFocus
          disabled={pending}
          className="rounded-lg border border-border bg-surface px-3 py-2 text-foreground outline-none focus:border-accent"
        />
      </label>
      {state?.error && <p className="text-sm text-red-500">{state.error}</p>}
      <button
        type="submit"
        disabled={pending}
        className="mt-1 rounded-lg bg-foreground px-4 py-2 text-sm font-semibold text-background disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
    </form>
  );
}
