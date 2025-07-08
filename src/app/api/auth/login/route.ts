import { NextRequest, NextResponse } from "next/server";

const USERNAME = "admin";
const PASSWORD = "password123"; // Change as needed
const COOKIE_NAME = "auth_token";
const COOKIE_VALUE = "authenticated"; // For demo, use a static value

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (username === USERNAME && password === PASSWORD) {
    const res = NextResponse.json({ success: true });
    res.cookies.set(COOKIE_NAME, COOKIE_VALUE, {
      httpOnly: false, // Allow client-side access
      sameSite: "lax",
      path: "/",
      // secure: true, // Uncomment if using HTTPS
      maxAge: 60 * 60 * 8, // 8 hours
    });
    return res;
  }
  return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
}
