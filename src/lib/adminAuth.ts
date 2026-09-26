// Shared between the proxy (src/proxy.ts) and the login server action. The
// cookie never holds the password — it holds an expiry plus an HMAC of that
// expiry keyed by ADMIN_PASSWORD, so a leaked cookie stops working when it
// expires, and changing the password revokes every session at once.
export const ADMIN_COOKIE = "khud_admin";
export const SESSION_TTL_S = 60 * 60 * 24 * 30;

const enc = new TextEncoder();

function hex(buf: ArrayBuffer) {
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sign(password: string, message: string) {
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(`khudyakov-admin:v2:${password}`),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  return hex(await crypto.subtle.sign("HMAC", key, enc.encode(message)));
}

/** Constant-time for equal lengths, so response timing doesn't leak a match prefix. */
function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

export async function passwordMatches(entered: string, password: string) {
  const [a, b] = await Promise.all([
    crypto.subtle.digest("SHA-256", enc.encode(entered)),
    crypto.subtle.digest("SHA-256", enc.encode(password)),
  ]);
  return safeEqual(hex(a), hex(b));
}

export async function createSessionToken(password: string) {
  const exp = String(Math.floor(Date.now() / 1000) + SESSION_TTL_S);
  return `${exp}.${await sign(password, exp)}`;
}

export async function verifySessionToken(password: string, token: string | undefined) {
  if (!token) return false;
  const [exp, sig] = token.split(".");
  const expSec = Number(exp);
  if (!sig || !Number.isFinite(expSec) || expSec * 1000 < Date.now()) return false;
  return safeEqual(sig, await sign(password, exp));
}
