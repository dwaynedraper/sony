import { NextResponse } from "next/server";

/**
 * The toolkit is open. Identity is the store number — no login, no location,
 * no tracking. This middleware is a pass-through.
 */
export async function proxy(): Promise<NextResponse> {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
