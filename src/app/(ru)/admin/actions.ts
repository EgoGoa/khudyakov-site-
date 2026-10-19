"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { ADMIN_COOKIE, SESSION_TTL_S, createSessionToken, passwordMatches } from "@/lib/adminAuth";

// Per-instance brake on password guessing: serverless instances don't share
// memory, so this slows a guesser down rather than setting a global quota.
const MAX_FAILS = 5;
const WINDOW_MS = 15 * 60 * 1000;
const fails = new Map<string, { count: number; since: number }>();

export async function login(formData: FormData) {
  const password = process.env.ADMIN_PASSWORD;
  const entered = String(formData.get("password") ?? "");
  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";

  const now = Date.now();
  const record = fails.get(ip);
  if (record && now - record.since > WINDOW_MS) fails.delete(ip);
  if ((fails.get(ip)?.count ?? 0) >= MAX_FAILS) {
    redirect("/admin/login?error=locked");
  }

  if (!password || !(await passwordMatches(entered, password))) {
    const r = fails.get(ip) ?? { count: 0, since: now };
    r.count += 1;
    fails.set(ip, r);
    redirect("/admin/login?error=1");
  }

  fails.delete(ip);
  const store = await cookies();
  store.set(ADMIN_COOKIE, await createSessionToken(password), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_S,
    secure: process.env.NODE_ENV === "production",
  });

  redirect("/admin");
}

export async function logout() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  redirect("/");
}
