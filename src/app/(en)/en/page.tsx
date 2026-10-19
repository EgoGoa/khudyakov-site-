import { redirect } from "next/navigation";

// The bare /en address sends visitors straight to the default service, the
// same way the Russian root does (written by hand: gen-en-routes.mjs skips it).
export default function EnHomePage() {
  redirect("/en/content");
}
