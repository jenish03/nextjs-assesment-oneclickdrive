import { NextResponse } from "next/server";

export async function POST() {
  const res = NextResponse.json({ success: true });
  res.cookies.set("auth_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: false, // Allow client-side code to see the cookie is gone
    sameSite: "lax",
  });
  return res;
}
