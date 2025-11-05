import { NextRequest, NextResponse } from "next/server";

const PROTECTED_PREFIX = "/sessions";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname.startsWith(PROTECTED_PREFIX)) {
    const hasToken = Boolean(req.cookies.get("fb_token")?.value);
    if (!hasToken) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      return NextResponse.redirect(url);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/sessions/:path*"],
};

