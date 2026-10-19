"use client";

import { Link } from "@/i18n/navigation";
import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { openService } from "../lib/navigate";

// /brief и /calculator без услуги не показывают выбор: сразу ведут на
// страницу текущей услуги (по адресу, с которого пришли, или по последней
// посещённой).
export default function ServiceRedirect({ base }: { base: "brief" | "calculator" }) {
  const router = useRouter();
  useEffect(() => {
    openService(router, base, undefined, true);
  }, [router, base]);
  return (
    <section className="mx-auto w-full max-w-3xl px-4 pb-20 pt-36 text-white sm:px-6">
      <p className="text-base font-semibold">Открываем…</p>
      <noscript>
        <ul className="mt-4 space-y-2">
          {["content", "sites", "smm", "ai"].map((id) => (
            <li key={id}>
              <Link href={`/${base}/${id}`} className="underline">/{base}/{id}</Link>
            </li>
          ))}
        </ul>
      </noscript>
    </section>
  );
}
