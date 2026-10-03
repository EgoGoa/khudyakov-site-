"use client";

import Script from "next/script";
import { useEffect } from "react";
import { trackGoal } from "@/lib/ym";

const YM_ID = process.env.NEXT_PUBLIC_YM_ID;

// Яндекс Метрика (открывается без VPN у российской аудитории): визиты,
// Вебвизор, карта кликов и скроллинга. Цели, которые не привязаны к одному
// месту в коде, ловятся здесь общим слушателем — так новая форма или кнопка
// связи попадает в статистику без правок в каждом файле:
//   · клики по Telegram / WhatsApp / телефону / почте;
//   · «Выбрать план» и «Заказать»;
//   · успешная отправка любой формы через /api/lead и вопрос голосовому
//     помощнику через /api/voice (обёртка над fetch, ответ не трогает).
export default function YandexMetrika() {
  useEffect(() => {
    if (!YM_ID) return;

    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest("a,button");
      if (!el) return;
      const href = el.getAttribute("href") ?? "";
      const text = (el.textContent ?? "").toLowerCase();
      if (/t\.me|telegram/.test(href)) trackGoal("click_telegram");
      else if (/wa\.me|whatsapp/.test(href)) trackGoal("click_whatsapp");
      else if (href.startsWith("tel:")) trackGoal("click_phone");
      else if (href.startsWith("mailto:")) trackGoal("click_email");
      else if (text.includes("выбрать план")) trackGoal("tariff_pick");
      else if (text.includes("заказать")) trackGoal("click_order");
    };
    document.addEventListener("click", onClick, true);

    const orig = window.fetch;
    window.fetch = async (...args) => {
      const res = await orig(...args);
      try {
        const url = typeof args[0] === "string" ? args[0] : args[0] instanceof URL ? args[0].pathname : (args[0] as Request).url;
        if (res.ok && url.includes("/api/lead")) trackGoal("lead_sent");
        else if (res.ok && url.includes("/api/voice")) trackGoal("voice_question");
      } catch {}
      return res;
    };

    return () => {
      document.removeEventListener("click", onClick, true);
      window.fetch = orig;
    };
  }, []);

  if (!YM_ID) return null;
  return (
    <>
      <Script id="ym-init" strategy="afterInteractive">{`
(function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
m[i].l=1*new Date();for(var j=0;j<document.scripts.length;j++){if(document.scripts[j].src===r){return}}
k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
(window,document,"script","https://mc.yandex.ru/metrika/tag.js","ym");
ym(${Number(YM_ID)},"init",{clickmap:true,trackLinks:true,accurateTrackBounce:true,webvisor:true,ecommerce:false});
`}</Script>
      <noscript>
        <div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`https://mc.yandex.ru/watch/${Number(YM_ID)}`} style={{ position: "absolute", left: "-9999px" }} alt="" />
        </div>
      </noscript>
    </>
  );
}
