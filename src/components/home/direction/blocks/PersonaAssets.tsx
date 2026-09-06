"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import Appear from "@/components/ui/Appear";
import { DIRECTION_BEAT } from "@/lib/motion";
import { TelegramIcon } from "@/components/ui/Icons";
import { TELEGRAM_URL } from "../contacts";
import { PersonaChip, PersonaResult, PersonaShell } from "../PersonaBlock";
import { ASSET_CHOICES, useDirectionTask } from "../TaskContext";
import type { BlockMediaSpec } from "../types";
import { EYEBROW } from "@/lib/typography";

// Шаг 3 воронки: что у клиента уже есть и чего он ждёт.
//
// Стоит перед финальным блоком — это последний вопрос перед призывом, и
// ответ на него уходит прямо в сообщение.
//
// Важное ограничение, которое определило всю механику: у сайта нет ни одного
// API-роута, отправлять данные некуда. Поэтому ответы никуда не уходят сами —
// из них собирается готовый текст, который уезжает в Telegram уже написанным.
// Так ничего не теряется и не нужен бэкенд: Егор выбрал именно этот вариант,
// зная про остальные.
//
// Выбор здесь множественный: у одного клиента бывает и сайт, и прошлые
// съёмки, и бренд-гайд. Свободная строка — ровно одна: длинная форма на этом
// месте убила бы весь смысл «минимальных действий».
export default function PersonaAssets({ media }: { media?: BlockMediaSpec }) {
  const { assets, toggleAsset, note, setNote, summary } = useDirectionTask();
  const answered = assets.length > 0 || note.trim().length > 0;

  const [copied, setCopied] = useState(false);

  // Telegram открывается с уже написанным сообщением.
  //
  // Работает это только потому, что контакт агентства — @-адрес
  // (t.me/hdkv). Предыдущая ссылка была по номеру (t.me/+7992…), а в такие
  // ссылки Telegram параметр ?text= молча не подставляет: посетитель нажал
  // бы «отправить» и увидел пустой чат. Если контакт когда-нибудь снова
  // станет ссылкой по номеру, предзаполнение отсюда придётся убрать.
  //
  // encodeURIComponent, а не ручная склейка: в заметке будут и ссылки, и
  // переводы строк.
  const href = answered ? `${TELEGRAM_URL}?text=${encodeURIComponent(summary())}` : TELEGRAM_URL;

  // Копирование остаётся вторым путём: не у всех Telegram открывается
  // ссылкой (корпоративный ноутбук без приложения, браузер с запретом на
  // внешние схемы), и тогда текст всё равно можно унести с собой.
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(summary());
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2400);
    } catch {
      // Буфер недоступен (нет https или запрещено политикой) — текст всё
      // равно виден на экране целиком, его можно выделить руками.
      setCopied(false);
    }
  };

  return (
    <PersonaShell
      step={3}
      prompt="Что у вас уже есть"
      note="Отметьте, что готово, и оставьте ссылку — на сайт, работы или просто пару слов об ожиданиях. Из этого соберётся сообщение, которое не придётся писать заново."
      media={media}
      answered={answered}
      result={
        <AnimatePresence mode="wait">
          {answered ? (
            <PersonaResult
              key="assets"
              lead={
                <>
                  Сообщение собрано из ваших ответов —{" "}
                  <span className="font-medium text-orange">остаётся отправить</span>.
                </>
              }
              changed={["Бриф заполнен", "Финал переписан"]}
            >
              {/* Полный текст показан до отправки: человек должен видеть,
                  что именно уходит от его имени, — иначе кнопка «написать»
                  превращается в кота в мешке. */}
              <pre className="glass-panel mx-auto mt-6 max-w-[38em] whitespace-pre-wrap rounded-2xl p-5 text-left text-[13px] leading-relaxed text-white">
                {summary()}
              </pre>

              <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-neon btn-warm btn-3d !px-8 !py-4"
                >
                  <TelegramIcon />
                  Отправить в Telegram
                </a>
                <button type="button" onClick={copy} className="btn-neon btn-3d !px-8 !py-4">
                  {copied ? "Скопировано" : "Скопировать текст"}
                </button>
              </div>
            </PersonaResult>
          ) : null}
        </AnimatePresence>
      }
    >
      <div className="flex flex-wrap items-stretch justify-center gap-4">
        {ASSET_CHOICES.map((c, i) => (
          <PersonaChip
            key={c.id}
            label={c.label}
            hint={c.hint}
            on={assets.includes(c.id)}
            idle={assets.length === 0}
            index={i}
            onClick={() => toggleAsset(c.id)}
          />
        ))}
      </div>

      <Appear from="up" delay={DIRECTION_BEAT.cta}>
        <label className="mx-auto mt-8 block max-w-[34em] text-left">
          <span className={`${EYEBROW} text-white/70`}>
            Ссылка или ожидания
          </span>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="site.ru — нужен ролик к выставке в ноябре"
            className="glass-panel mt-3 w-full rounded-2xl px-5 py-4 text-[15px] text-white outline-none transition placeholder:text-white/40 focus:ring-1 focus:ring-orange/60"
          />
        </label>
      </Appear>
    </PersonaShell>
  );
}
