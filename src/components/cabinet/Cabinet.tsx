"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import ConsentCheckbox from "@/components/ui/ConsentCheckbox";
import { TEAM, type TeamMember } from "@/lib/team";
import { marks } from "@/components/home/team-pulse/marks";
import {
  ORDER_STAGES,
  WELCOME_GIFTS,
  addEvent,
  answerQuestion,
  dismissRec,
  register,
  requestGift,
  requestService,
  saveProfile,
  sendToTeam,
  toggleList,
  useCabinet,
  type CabinetState,
} from "./store";
import { GOALS, NICHES, SERVICES, WANTS, recommendationsFor } from "./data";

// Демо-кабинет клиента. Стиль — по решению Егора: строго и минималистично,
// как у Apple: нейтральное стекло, белый текст, фирменные градиенты только
// в главных заголовках и ключевых цифрах. Кабинет не ждёт действий — он
// сам спрашивает (вопрос от команды) и предлагает (рекомендации по ответам
// из чата). Перед входом — обязательная регистрация, в подарок 3 генерации изображения.

const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;
const member = (id: string): TeamMember => TEAM[id] ?? TEAM.egor;
/** «3 генерации», «1 генерация», «5 генераций». */
const gens = (n: number) => `${n} ${n % 10 === 1 && n % 100 !== 11 ? "генерация" : [2, 3, 4].includes(n % 10) && ![12, 13, 14].includes(n % 100) ? "генерации" : "генераций"}`;

type Section = "home" | "business" | "orders" | "recs" | "catalog" | "favorites" | "cart" | "kp" | "personal" | "history";
const NAV: { id: Section; label: string; icon: string }[] = [
  { id: "home", label: "Главная", icon: "⌂" },
  { id: "business", label: "Мой бизнес", icon: "◔" },
  { id: "orders", label: "Заказы", icon: "▣" },
  { id: "recs", label: "Рекомендации", icon: "✦" },
  { id: "catalog", label: "Каталог", icon: "◫" },
  { id: "favorites", label: "Избранное", icon: "♡" },
  { id: "cart", label: "Корзина", icon: "⌁" },
  { id: "kp", label: "КП и концепции", icon: "▤" },
  { id: "personal", label: "Сайт под меня", icon: "◌" },
  { id: "history", label: "История", icon: "↺" },
];

const Card = ({ children, className = "" }: { children: ReactNode; className?: string }) => (
  <div className={`rounded-[18px] bg-white/[0.06] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)] ${className}`}>{children}</div>
);
const Chip = ({ children, primary, onClick, disabled }: { children: ReactNode; primary?: boolean; onClick?: () => void; disabled?: boolean }) => (
  <button type="button" onClick={onClick} disabled={disabled} className={`cab-chip ${primary ? "cab-chip-primary" : ""}`}>
    {children}
  </button>
);
const Sect = ({ children }: { children: ReactNode }) => (
  <p className="mb-2.5 flex items-center gap-2 text-[12px] font-extrabold uppercase tracking-[0.08em] text-white">
    <span className="cab-dot" />
    {children}
  </p>
);
const Avatar = ({ m, size = 40 }: { m: TeamMember; size?: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img src={m.photo} alt={m.name} width={size} height={size} className="shrink-0 rounded-full object-cover" style={{ width: size, height: size }} />
);

/* ── Вход ─────────────────────────────────────────────────────────────── */

function Register({ state }: { state: CabinetState }) {
  const [name, setName] = useState(state.name ?? "");
  const [phone, setPhone] = useState(state.phone ?? "");
  const [email, setEmail] = useState(state.email ?? "");
  const [terms, setTerms] = useState(false);
  const [consent, setConsent] = useState(false);
  const [marketing, setMarketing] = useState(false);
  const [busy, setBusy] = useState(false);
  const ok = name.trim() && phone.trim() && terms && consent;
  return (
    <div className="flex flex-col">
      <p className="font-display text-[22px] font-bold uppercase leading-[1.05] text-white sm:text-[24px]">{marks("Вход в *кабинет*")}</p>
      <p className="mt-2.5 text-[14px] font-semibold leading-relaxed text-white">
        Регистрация за 10 секунд — и {marks(`^${gens(WELCOME_GIFTS)} изображения^`)} в подарок на самых свежих нейросетях.
      </p>
      <div className="mt-5 flex flex-col gap-2.5">
        <input className="cab-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Имя" autoComplete="name" />
        <input className="cab-input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="Телефон" autoComplete="tel" />
        <input className="cab-input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Почта — по желанию" autoComplete="email" />
        {/* Три согласия, как принято у кабинетов в РФ: соглашение и правила
            подарка и обработка ПДн — обязательные; рассылки — отдельно и по
            желанию (закон о рекламе не даёт склеивать их с остальными). */}
        <label className="mt-1 flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-white">
          <input type="checkbox" checked={terms} onChange={(e) => setTerms(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-glow" />
          <span>
            Принимаю{" "}
            <Link href="/terms" target="_blank" className="underline">
              пользовательское соглашение
            </Link>{" "}
            и{" "}
            <Link href="/bonus" target="_blank" className="underline">
              правила подарка за регистрацию
            </Link>
          </span>
        </label>
        <ConsentCheckbox checked={consent} onChange={setConsent} accent="glow" />
        <label className="flex cursor-pointer items-start gap-2.5 text-left text-xs leading-relaxed text-white">
          <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} className="mt-0.5 h-4 w-4 shrink-0 accent-glow" />
          <span>Хочу получать новости и предложения — по желанию</span>
        </label>
        <button
          type="button"
          disabled={!ok || busy}
          onClick={async () => {
            setBusy(true);
            await register({ name: name.trim(), phone: phone.trim(), email: email.trim(), marketing });
            setBusy(false);
          }}
          className="cab-cta mt-1.5"
        >
          {busy ? "Создаю кабинет…" : "Создать кабинет"}
        </button>
      </div>
    </div>
  );
}

/** Мини-анкета после регистрации: три коротких шага, любой можно
 *  пропустить, а всю анкету — отложить («заполню потом»). От ответов
 *  зависит, что кабинет будет предлагать, а что нет. */
function Onboarding() {
  const [step, setStep] = useState(0);
  const [niche, setNiche] = useState<string>();
  const [goals, setGoals] = useState<string[]>([]);
  const [want, setWant] = useState<string[]>([]);
  const flip = (list: string[], v: string) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);
  const steps = [
    { title: "Чем *ты занимаешься*?", sub: "Подстрою примеры и блоки сайта под твою нишу.", options: NICHES, picked: niche ? [niche] : [], pick: (v: string) => setNiche(v) },
    { title: "Какая ^главная цель^?", sub: "Можно выбрать несколько — будем мерить результат по ним.", options: GOALS, picked: goals, pick: (v: string) => setGoals((g) => flip(g, v)) },
    { title: "Что *тебе предлагать*?", sub: "Остальное не будем показывать в рекомендациях.", options: WANTS, picked: want, pick: (v: string) => setWant((w) => flip(w, v)) },
  ];
  const cur = steps[step];
  const finish = () => saveProfile({ niche, goals, want });
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between pr-9">
        <span className="flex gap-1.5">
          {steps.map((_, i) => (
            <i key={i} className={`h-1 rounded-full transition-all ${i === step ? "cab-bar w-7" : "w-3 bg-white/25"}`} />
          ))}
        </span>
        <button type="button" onClick={() => saveProfile({ niche, goals, want }, true)} className="text-[13px] font-bold text-white underline-offset-4 hover:underline">
          Заполню потом
        </button>
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.25 }}>
          <p className="mt-5 font-display text-[21px] font-bold uppercase leading-[1.08] text-white">{marks(cur.title)}</p>
          <p className="mt-2 text-[14px] font-semibold text-white">{cur.sub}</p>
          <div className="mt-4 flex flex-wrap gap-1.5">
            {cur.options.map((o) => (
              <Chip key={o} primary={cur.picked.includes(o)} onClick={() => cur.pick(o)}>
                {o}
              </Chip>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="mt-6 flex items-center gap-2">
        {step > 0 && <Chip onClick={() => setStep(step - 1)}>Назад</Chip>}
        <button type="button" className="cab-cta ml-auto" onClick={() => (step < steps.length - 1 ? setStep(step + 1) : finish())}>
          {step < steps.length - 1 ? (cur.picked.length ? "Дальше" : "Пропустить") : "Открыть кабинет"}
        </button>
      </div>
    </div>
  );
}

/* ── Разделы ──────────────────────────────────────────────────────────── */

function TeamQuestion({ state }: { state: CabinetState }) {
  const last = state.orders[0];
  const m = member(last?.memberId ?? "egor");
  const q = last
    ? { ask: `Как удобнее получить ${last.memberId === "sasha" ? "концепции" : "план"}?`, options: ["Здесь, в кабинете", "В Telegram", "На почту"] }
    : { ask: "С чего начнём?", options: ["Сайт", "Ролик", "SMM", "AI-агент"] };
  return (
    <div>
      <Sect>Нужно твоё решение</Sect>
      <Card className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-3">
          <Avatar m={m} size={42} />
          <div>
            <p className="text-[12px] font-bold">{marks(`*${m.name}* · только что`)}</p>
            <p className="text-[15px] font-bold text-white">{q.ask}</p>
          </div>
        </div>
        {state.answeredQuestion ? (
          <p className="text-[13px] font-bold text-white">{marks(`^✓ ${state.answeredQuestion}^ — команда видит ответ`)}</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {q.options.map((o) => (
              <Chip key={o} onClick={() => answerQuestion(o)}>
                {o}
              </Chip>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

function Orders({ state, compact }: { state: CabinetState; compact?: boolean }) {
  if (!state.orders.length)
    return (
      <div>
        <Sect>Заказы</Sect>
        <Card className="p-5 text-[14px] font-semibold text-white">
          Пока пусто. Напиши Саше или Егору на странице — заявка из чата сразу появится здесь.
        </Card>
      </div>
    );
  const list = compact ? state.orders.slice(0, 2) : state.orders;
  return (
    <div>
      <Sect>Заказы</Sect>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((o) => {
          const m = member(o.memberId);
          return (
            <Card key={o.id} className="p-4">
              <div className="flex items-baseline justify-between gap-2">
                <p className="text-[16px] font-extrabold text-white">{o.title}</p>
                <p className="shrink-0 text-[12px] font-bold">{marks(`^${ORDER_STAGES[o.stage]}^`)}</p>
              </div>
              <div className="mb-2 mt-3.5 h-[5px] overflow-hidden rounded-full bg-white/10">
                <motion.i className="cab-bar block h-full rounded-full" initial={{ width: 0 }} animate={{ width: `${((o.stage + 1) / ORDER_STAGES.length) * 100}%` }} transition={SPRING} />
              </div>
              <div className="flex items-center justify-between text-[12.5px] font-bold text-white">
                <span className="flex items-center gap-1.5">
                  <Avatar m={m} size={20} /> {m.name}
                </span>
                <span>{new Date(o.createdAt).toLocaleDateString("ru-RU", { day: "numeric", month: "long" })}</span>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function Recs({ state }: { state: CabinetState }) {
  const recs = recommendationsFor(state);
  if (!recs.length)
    return (
      <div>
        <Sect>Команда рекомендует</Sect>
        <Card className="p-5 text-[14px] font-semibold text-white">Все предложения разобраны — новые появятся после следующего заказа.</Card>
      </div>
    );
  return (
    <div>
      <Sect>Команда рекомендует</Sect>
      <div className="grid gap-3 md:grid-cols-3">
        <AnimatePresence initial={false}>
          {recs.map((r) => {
            const m = member(r.memberId);
            return (
              <motion.div key={r.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }} transition={SPRING}>
                <Card className="flex h-full flex-col gap-2 p-4">
                  <p className="flex items-center gap-2 text-[12px] font-bold text-white">
                    <Avatar m={m} size={24} /> {m.name} · {m.role}
                  </p>
                  <p className="text-[15px] font-extrabold leading-snug text-white">{marks(r.title)}</p>
                  <p className="text-[13px] font-semibold leading-relaxed text-white">{r.text}</p>
                  <div className="mt-auto flex gap-1.5 pt-1">
                    <Chip primary onClick={() => requestService(r.id, r.title.replace(/[*^~]/g, ""), r.memberId)}>
                      Интересно
                    </Chip>
                    <Chip onClick={() => dismissRec(r.id, r.title.replace(/[*^~]/g, ""))}>Позже</Chip>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}

function Catalog({ state, only }: { state: CabinetState; only?: "favorites" | "cart" }) {
  const list = only ? SERVICES.filter((s) => state[only].includes(s.id)) : SERVICES;
  const [sent, setSent] = useState(false);
  if (only && !list.length)
    return <Card className="p-5 text-[14px] font-semibold text-white">{only === "cart" ? "Корзина пуста — загляни в каталог." : "Здесь будет то, что ты отложил на потом."}</Card>;
  return (
    <div className="flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((s) => {
          const m = member(s.memberId);
          const inCart = state.cart.includes(s.id);
          const fav = state.favorites.includes(s.id);
          return (
            <Card key={s.id} className="flex flex-col gap-2 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[15px] font-extrabold text-white">{s.title}</p>
              </div>
              <p className="text-[13px] font-semibold leading-relaxed text-white">{s.desc}</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Chip primary={!inCart} onClick={() => toggleList("cart", s.id, s.title)}>
                  {inCart ? "✓ В корзине" : "В корзину"}
                </Chip>
                <Chip onClick={() => toggleList("favorites", s.id, s.title)}>{fav ? "♥" : "♡"}</Chip>
                <span className="ml-auto flex items-center gap-1.5 text-[12px] font-bold text-white">
                  <Avatar m={m} size={20} /> {m.name}
                </span>
              </div>
            </Card>
          );
        })}
      </div>
      {only === "cart" && (
        <button
          type="button"
          disabled={sent}
          className="cab-cta self-start"
          onClick={async () => {
            const titles = list.map((s) => s.title).join(", ");
            try {
              await sendToTeam(`Запрос КП по корзине: ${titles}`);
            } catch {
              /* событие уже в истории, команда увидит при следующей заявке */
            }
            list.forEach((s) => requestService(`cart-${s.id}-${Date.now()}`, s.title, s.memberId));
            setSent(true);
          }}
        >
          {sent ? "✓ Запрос отправлен — пришлём КП" : "Запросить КП по корзине"}
        </button>
      )}
    </div>
  );
}

function Kp({ state }: { state: CabinetState }) {
  const [sent, setSent] = useState(false);
  return (
    <div className="flex flex-col gap-3">
      <Card className="p-5">
        <p className="text-[16px] font-extrabold text-white">{marks("КП и *концепции* — в любой момент")}</p>
        <p className="mt-2 text-[14px] font-semibold leading-relaxed text-white">
          Опиши задачу в одном сообщении — пришлём коммерческое предложение и несколько концепций сюда, в кабинет.
        </p>
        <div className="mt-3">
          <Chip
            primary
            disabled={sent}
            onClick={async () => {
              try {
                await sendToTeam("Запрос КП и концепций из кабинета");
              } catch {
                /* не страшно для демо */
              }
              setSent(true);
            }}
          >
            {sent ? "✓ Запрос у команды" : "Запросить КП"}
          </Chip>
        </div>
      </Card>
      {state.orders.map((o) => (
        <Card key={o.id} className="flex items-center justify-between p-4">
          <p className="text-[14px] font-bold text-white">{o.title}</p>
          <p className="text-[12px] font-bold">{marks("^готовим материалы^")}</p>
        </Card>
      ))}
    </div>
  );
}

const INTERESTS = ["Кофейни и рестораны", "Красота", "Эксперты", "Онлайн-школы", "Магазины", "Мероприятия"];
function Personal({ state }: { state: CabinetState }) {
  return (
    <Card className="p-5">
      <p className="text-[16px] font-extrabold text-white">{marks("Сайт *под тебя*")}</p>
      <p className="mt-2 text-[14px] font-semibold leading-relaxed text-white">Отметь, чем занимаешься, — блоки и примеры на сайте подстроятся под твою нишу.</p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {INTERESTS.map((i) => (
          <Chip key={i} primary={state.interests.includes(i)} onClick={() => toggleList("interests", i, i)}>
            {i}
          </Chip>
        ))}
      </div>
    </Card>
  );
}

function History({ state }: { state: CabinetState }) {
  return (
    <Card className="flex flex-col divide-y divide-white/[0.06] p-2">
      {state.history.map((e) => (
        <div key={e.at + e.text} className="flex gap-3 px-3 py-2.5 text-[13px] font-bold text-white">
          <span className="team-pulse-acc shrink-0">{new Date(e.at).toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" })}</span>
          {e.text}
        </div>
      ))}
    </Card>
  );
}


/** «Мой бизнес»: кабинет — не только заказы, но и результат. Цели из
 *  анкеты, задачи по текущим заказам и показатели. Реальные цифры в демо
 *  взять неоткуда — поэтому показатели честно подписаны «появятся после
 *  подключения аналитики», а кнопка отправляет команде запрос на неё. */
function Business({ state }: { state: CabinetState }) {
  const [asked, setAsked] = useState(false);
  const tasks = state.orders.map((o) => ({ o, next: ORDER_STAGES[Math.min(o.stage + 1, ORDER_STAGES.length - 1)] }));
  const filled = [state.profile.niche, state.profile.goals.length, state.profile.want.length].filter(Boolean).length;
  return (
    <div className="flex flex-col gap-5">
      <div>
        <Sect>Цели</Sect>
        <Card className="flex flex-wrap items-center gap-1.5 p-4">
          {state.profile.goals.length ? (
            state.profile.goals.map((g) => <span key={g} className="cab-chip cab-chip-primary">{g}</span>)
          ) : (
            <p className="text-[14px] font-semibold text-white">Цели не выбраны — отметь их в анкете, и мы будем мерить результат по ним.</p>
          )}
          {state.profile.niche && <span className="cab-chip">{state.profile.niche}</span>}
        </Card>
      </div>
      <div>
        <Sect>Показатели</Sect>
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            ["Заявки с сайта", "в месяц"],
            ["Конверсия", "визит → заявка"],
            ["Охват соцсетей", "за неделю"],
          ].map(([t, n]) => (
            <Card key={t} className="p-4">
              <p className="font-display text-[26px] font-bold">{marks("*—*")}</p>
              <p className="mt-1 text-[13px] font-extrabold text-white">{t}</p>
              <p className="text-[12px] font-semibold text-white">{n}</p>
            </Card>
          ))}
        </div>
        <Card className="mt-3 flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <p className="flex-1 text-[14px] font-semibold leading-relaxed text-white">
            Цифры появятся после запуска: подключим аналитику сайта и соцсетей — и здесь будет видно, сколько заявок и продаж приносит каждая услуга.
          </p>
          <Chip
            primary
            disabled={asked}
            onClick={async () => {
              try {
                await sendToTeam("Хочу подключить аналитику к кабинету");
              } catch {
                /* событие уже в истории */
              }
              setAsked(true);
            }}
          >
            {asked ? "✓ Запрос у Егора" : "Подключить аналитику"}
          </Chip>
        </Card>
      </div>
      <div>
        <Sect>Задачи</Sect>
        <Card className="flex flex-col divide-y divide-white/[0.06] p-2">
          {tasks.length ? (
            tasks.map(({ o, next }) => (
              <div key={o.id} className="flex items-center gap-3 px-3 py-2.5 text-[13.5px] font-bold text-white">
                <Avatar m={member(o.memberId)} size={22} />
                <span className="flex-1">{o.title}</span>
                <span>{marks(`следующий шаг: ^${next}^`)}</span>
              </div>
            ))
          ) : (
            <p className="px-3 py-2.5 text-[14px] font-semibold text-white">Задач пока нет — закажи услугу, и здесь появится её план.</p>
          )}
        </Card>
      </div>
      <div>
        <Sect>Усилить эффект кабинета</Sect>
        <div className="grid gap-3 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-[14px] font-extrabold text-white">{marks(`Профиль ^${Math.round((filled / 3) * 100)}%^`)}</p>
            <p className="mt-1 text-[13px] font-semibold text-white">Чем полнее анкета, тем точнее рекомендации команды.</p>
          </Card>
          <Card className="p-4">
            <p className="text-[14px] font-extrabold text-white">{marks("*Аналитика*")}</p>
            <p className="mt-1 text-[13px] font-semibold text-white">Подключим сайт и соцсети — увидишь заявки и конверсию здесь.</p>
          </Card>
          <Card className="p-4">
            <p className="text-[14px] font-extrabold text-white">{marks("^Подарок^ в работу")}</p>
            <p className="mt-1 text-[13px] font-semibold text-white">{state.gifts ? `Осталось ${gens(state.gifts)} изображения — опиши картинку справа.` : "Подарочные генерации использованы — результаты пришлём в течение дня."}</p>
          </Card>
        </div>
      </div>
    </div>
  );
}

/* ── Правая колонка: подарок и связь с командой ──────────────────────── */

/** Подарок за регистрацию: 3 генерации изображения. Клиент описывает
 *  картинку — заявка уходит команде, генерируем мы на свежих моделях.
 *  Денег, баланса и пополнения нет (решение Егора). */
function Gift({ state }: { state: CabinetState }) {
  const [prompt, setPrompt] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState<string>();
  const send = async () => {
    const t = prompt.trim();
    if (!t || busy) return;
    setBusy(true);
    try {
      await requestGift(t);
      setPrompt("");
      setNote("Принято ✓ Пришлём картинку в течение дня.");
    } catch {
      setNote("Не отправилось — напиши команде в чат ниже.");
    }
    setBusy(false);
  };
  return (
    <Card className="p-4">
      <p className="text-[12px] font-extrabold uppercase tracking-[0.08em] text-white">Подарок</p>
      <p className="mt-1 font-display text-[26px] font-bold leading-tight">{marks(`^${gens(state.gifts)}^`)}</p>
      <p className="mt-1 text-[13px] font-bold text-white">изображения на самых свежих нейросетях — опиши, что нарисовать</p>
      <div className="mt-2.5 flex gap-1" aria-hidden>
        {Array.from({ length: WELCOME_GIFTS }, (_, i) => (
          <span key={i} className={`h-1.5 flex-1 rounded-full ${i < state.gifts ? "bg-white" : "bg-white/15"}`} />
        ))}
      </div>
      {state.gifts > 0 ? (
        <form
          className="mt-3 flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            send();
          }}
        >
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={2}
            placeholder="Например: кофейня на рассвете, тёплый свет"
            className="cab-input resize-none text-[13px]"
          />
          <Chip primary onClick={send} disabled={!prompt.trim() || busy}>
            {busy ? "Отправляю…" : "Сгенерировать"}
          </Chip>
        </form>
      ) : (
        <p className="mt-3 text-[13px] font-semibold text-white">Все три заказаны — результаты придут сюда и на почту.</p>
      )}
      {note && <p className="mt-2 text-[12.5px] font-bold text-white">{note}</p>}
      {!!state.giftRequests.length && (
        <ul className="mt-3 flex flex-col gap-1 border-t border-white/[0.07] pt-2.5">
          {state.giftRequests.map((g) => (
            <li key={g.at} className="text-[12.5px] font-semibold text-white">
              {marks("*В работе*")} · {g.prompt}
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function TeamChat({ state }: { state: CabinetState }) {
  const [text, setText] = useState("");
  const [msgs, setMsgs] = useState<{ me: boolean; t: string }[]>([
    { me: false, t: `${state.name ? `${state.name}, я` : "Я"} на связи — пиши сюда, отвечу в течение дня.` },
  ]);
  const send = async () => {
    const t = text.trim();
    if (!t) return;
    setText("");
    setMsgs((m) => [...m, { me: true, t }]);
    try {
      await sendToTeam(t);
      setMsgs((m) => [...m, { me: false, t: "Получил ✓ Отвечу в течение дня." }]);
    } catch {
      setMsgs((m) => [...m, { me: false, t: "Не отправилось — напиши в Telegram, там отвечу сразу." }]);
    }
  };
  return (
    <Card className="flex min-h-[260px] flex-1 flex-col gap-2 p-3.5">
      <Sect>Команда на связи</Sect>
      <div className="flex flex-1 flex-col gap-2 overflow-y-auto">
        {msgs.map((m, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className={`max-w-[90%] px-3 py-2 text-[13px] font-bold leading-snug text-white ${m.me ? "self-end rounded-2xl rounded-br-md bg-white/20" : "self-start rounded-2xl rounded-bl-md bg-white/10"}`}
          >
            {!m.me && <span className="mb-0.5 block text-[11px] font-extrabold">{marks("*Егор*")}</span>}
            {m.t}
          </motion.div>
        ))}
      </div>
      <form
        className="flex items-center gap-2 rounded-[14px] bg-white/[0.08] px-3 py-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Написать команде…" className="min-w-0 flex-1 bg-transparent py-1.5 text-[13px] font-semibold text-white outline-none placeholder:text-white/70" />
        <button type="submit" aria-label="Отправить" className="cab-send" />
      </form>
    </Card>
  );
}

/* ── Кабинет целиком ──────────────────────────────────────────────────── */

export default function Cabinet({ onClose }: { onClose?: () => void }) {
  const state = useCabinet();
  const [section, setSection] = useState<Section>("home");
  const recCount = recommendationsFor(state).length;
  const counts: Partial<Record<Section, number>> = { orders: state.orders.length, recs: recCount, cart: state.cart.length, favorites: state.favorites.length };

  const firstName = state.name?.split(" ")[0];
  const hour = new Date().getHours();
  const hello = hour < 12 ? "Доброе утро" : hour < 18 ? "Добрый день" : "Добрый вечер";

  // До входа и во время анкеты — маленькое окно, а не растянутый кабинет
  // (Егор: «регистрация как положено, с маленьким окошком»).
  if (!state.registered || !state.onboarded)
    return (
      <div className="cab-glass relative w-full rounded-[26px] p-6 text-white sm:p-7">
        {onClose && (
          <button type="button" onClick={onClose} aria-label="Закрыть" className="absolute right-3 top-3 grid h-8 w-8 place-items-center rounded-full bg-white/10 text-[14px] text-white transition hover:bg-white/20">
            ✕
          </button>
        )}
        {!state.registered ? <Register state={state} /> : <Onboarding />}
      </div>
    );

  return (
    <div className="cab-glass relative flex h-full w-full flex-col overflow-hidden rounded-[26px] text-white sm:rounded-[30px] lg:grid lg:grid-cols-[210px_1fr_300px]">
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Закрыть кабинет" className="absolute right-3 top-3 z-20 grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[15px] text-white transition hover:bg-white/20">
          ✕
        </button>
      )}
        <>
          <nav className="flex shrink-0 gap-1 overflow-x-auto border-b border-white/[0.07] px-3 py-3 lg:flex-col lg:overflow-visible lg:border-b-0 lg:border-r lg:px-3.5 lg:py-6">
            <p className="mb-5 hidden px-2.5 font-display text-[14px] font-bold lg:block">
              HUD<span className="team-pulse-acc">.SERVICE</span>
            </p>
            {NAV.map((n) => (
              <button
                key={n.id}
                type="button"
                onClick={() => {
                  setSection(n.id);
                  addEvent(`Открыт раздел «${n.label}»`);
                }}
                className={`flex shrink-0 items-center gap-2.5 whitespace-nowrap rounded-[11px] px-3 py-2.5 text-[14px] font-bold transition ${section === n.id ? "bg-white/10" : "hover:bg-white/[0.05]"}`}
              >
                <span className="w-4 text-center">{n.icon}</span>
                {n.label}
                {!!counts[n.id] && <span className="ml-auto grid h-5 min-w-5 place-items-center rounded-full bg-white/15 px-1.5 text-[11px] font-extrabold">{counts[n.id]}</span>}
              </button>
            ))}
            <p className="mt-auto hidden px-3 pt-4 text-[13px] font-bold lg:block">
              {state.name}
              <span className="block text-[12px] font-semibold">{state.phone}</span>
            </p>
          </nav>

          <main className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-6 sm:px-7 lg:py-8">
            <div className="pr-10">
              <p className="font-display text-[22px] font-bold leading-[1.08] sm:text-[28px]">
                {hello}
                {firstName ? `, ${firstName}.` : "."}{" "}
                {marks(state.orders.length ? "*Команда уже в работе*" : "*Кабинет готов*")}
              </p>
              <p className="mt-2 text-[14px] font-semibold text-white sm:text-[15px]">
                {state.orders.length
                  ? "Один вопрос ждёт твоего решения — остальное команда держит в работе."
                  : state.gifts
                    ? `В подарок ${gens(state.gifts)} изображения — опиши картинку справа или выбери услугу.`
                    : "Выбери услугу в каталоге или напиши команде."}
              </p>
            </div>
            <AnimatePresence mode="wait">
              <motion.div key={section} className="flex flex-col gap-5" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                {section === "home" && (
                  <>
                    <TeamQuestion state={state} />
                    <Orders state={state} compact />
                    <Recs state={state} />
                  </>
                )}
                {section === "business" && <Business state={state} />}
                {section === "orders" && <Orders state={state} />}
                {section === "recs" && <Recs state={state} />}
                {section === "catalog" && <Catalog state={state} />}
                {section === "favorites" && <Catalog state={state} only="favorites" />}
                {section === "cart" && <Catalog state={state} only="cart" />}
                {section === "kp" && <Kp state={state} />}
                {section === "personal" && <Personal state={state} />}
                {section === "history" && <History state={state} />}
              </motion.div>
            </AnimatePresence>
          </main>

          <aside className="flex shrink-0 flex-col gap-4 border-t border-white/[0.07] px-5 py-5 lg:border-l lg:border-t-0 lg:px-4 lg:py-8">
            <Gift state={state} />
            <TeamChat state={state} />
          </aside>
        </>
    </div>
  );
}
