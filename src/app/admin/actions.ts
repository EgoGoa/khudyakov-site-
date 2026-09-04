"use server";

import { timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, sessionToken } from "@/lib/adminAuth";

// Compared as digests rather than as the passwords themselves: `===` on two
// strings returns as soon as it finds a differing character, so how long it
// takes leaks how much of the prefix was right. Both sides are hashed to the
// same fixed length first (which also makes timingSafeEqual's equal-length
// requirement automatic), then compared in constant time.
async function passwordMatches(entered: string, expected: string) {
  const a = Buffer.from(await sessionToken(entered), "hex");
  const b = Buffer.from(await sessionToken(expected), "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

export async function login(formData: FormData) {
  const password = process.env.ADMIN_PASSWORD;
  const entered = String(formData.get("password") ?? "");

  if (!password || !(await passwordMatches(entered, password))) {
    redirect("/admin/login?error=1");
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, await sessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  // "/content", not "/": the bare root is itself a redirect (see
  // src/app/page.tsx), and a server action redirecting into a route that
  // redirects again answers the client with "An unexpected response was
  // received from the server" — the session was cleared, but the browser
  // stayed on /admin looking as though the button had done nothing.
  redirect("/content");
}
