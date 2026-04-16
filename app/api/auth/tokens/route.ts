import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { accessToken, refreshToken } = await req.json();

  const res = NextResponse.json({ ok: true });

  res.cookies.set("accessToken", accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    path: "/",
    maxAge: 60 * 60,
  });

  if (refreshToken) {
    res.cookies.set("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
  }

  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });

  res.cookies.delete("accessToken");
  res.cookies.delete("refreshToken");

  return res;
}