// Shared between the Edge middleware and the login server action, so both
// derive the same session value from ADMIN_PASSWORD. The cookie never holds
// the password itself — only this digest — and is set httpOnly so page
// scripts cannot read it.
export const ADMIN_COOKIE = "khud_admin";

export async function sessionToken(password: string) {
  const data = new TextEncoder().encode(`khudyakov-admin:v1:${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
