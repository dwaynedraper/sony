import { NextResponse, type NextRequest } from "next/server";
import { decryptSession } from "@/lib/session";

const PUBLIC_PREFIXES = ["/login", "/api/auth", "/all-issues", "/api/admin"];
const PUBLIC_FILE_EXT = /\.(png|jpg|jpeg|svg|ico|webp|avif|gif)$/i;

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true;
  if (PUBLIC_FILE_EXT.test(pathname)) return true;
  return false;
}

export async function proxy(req: NextRequest): Promise<NextResponse> {
  const { pathname } = req.nextUrl;

  const cookie = req.cookies.get("sony-session")?.value;
  const session = await decryptSession(cookie);

  if (!session && !isPublicPath(pathname)) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.search = "";
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
