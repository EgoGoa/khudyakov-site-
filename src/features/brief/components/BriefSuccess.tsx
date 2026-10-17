"use client";

import Link from "next/link";

export default function BriefSuccess({ home }: { home: string }) {
  return (
    <div className="text-center" role="status">
      <h2 className="font-display text-[1.8rem] uppercase leading-tight text-white sm:text-5xl">
        Спасибо! <span className="hb-grad-text">Бриф получен</span>
      </h2>
      <p className="mx-auto mt-5 max-w-md text-base font-semibold text-white">
        Свяжемся с вами в течение рабочего дня
      </p>
      <Link href={home} className="hb-btn mt-8 inline-flex">
        Вернуться к услугам
      </Link>
    </div>
  );
}
