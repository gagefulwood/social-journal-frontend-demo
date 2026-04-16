import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;


  if (
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/register")
  ) {
    return NextResponse.next();
  }


  return NextResponse.next();
}