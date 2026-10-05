"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Container from "@/components/ui/Container";
import {
  blogRubrics,
  formatBlogDate,
  getBlogPosts,
  type BlogPost,
  type BlogRubric,
} from "@/lib/blog";

// Витрина блога над основной частью подвала: ряд цветных плиток-рубрик со
// счётчиками, под ним свежие материалы выбранной рубрики узкими строками.
// Фон — фон подвала, своего у блока нет. Данные — content/blog/posts.json
// (обновляет агент раз в неделю). Пустая рубрика скрывается, нет материалов
// совсем — блок не выводится.

const allPosts = getBlogPosts();
const rubrics = blogRubrics.filter((r) => allPosts.some((p) => p.rubric === r.key));

function Icon({ k }: { k: BlogRubric }) {
  const p = {
    width: 18,
    height: 18,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  if (k === "cases")
    return (
      <svg {...p}>
        <rect x="3" y="5" width="18" height="14" rx="3" />
        <path d="M10 9.5v5l4.5-2.5z" fill="currentColor" />
      </svg>
    );
  if (k === "trends")
    return (
      <svg {...p}>
        <path d="M3 17l6-6 4 4 8-8" />
        <path d="M15 7h6v6" />
      </svg>
    );
  if (k === "tools")
    return (
      <svg {...p}>
        <path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" />
        <path d="M19 17v4M17 19h4" />
      </svg>
    );
  return (
    <svg {...p}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3 20c0-3.4 2.7-5.5 6-5.5s6 2.1 6 5.5" />
      <circle cx="17.5" cy="9" r="2.4" />
      <path d="M17 14.5c2.6 0 4 1.7 4 4" />
    </svg>
  );
}

function Tile({ k, tone, size }: { k: BlogRubric; tone: string; size: number }) {
  return (
    <span
      className="grid shrink-0 place-items-center rounded-xl"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(145deg, ${tone}, color-mix(in srgb, ${tone} 45%, #000))`,
        color: "#0b0b10",
      }}
    >
      <Icon k={k} />
    </span>
  );
}

function Row({ post, tone, children }: { post: BlogPost; tone: string; children: ReactNode }) {
  const cls =
    "group flex items-center gap-4 rounded-2xl px-4 py-4 transition-colors duration-300 hover:bg-white/[0.08] sm:px-5";
  const style: CSSProperties = {
    background: "rgba(255,255,255,0.04)",
    boxShadow: `inset 3px 0 0 ${tone}, inset 0 0 0 1px rgba(255,255,255,0.09)`,
  };
  return post.url ? (
    <a href={post.url} target="_blank" rel="noopener noreferrer" className={cls} style={style}>
      {children}
    </a>
  ) : (
    <div className={cls} style={style}>
      {children}
    </div>
  );
}

export default function FooterBlog() {
  const [active, setActive] = useState<BlogRubric | null>(rubrics[0]?.key ?? null);
  if (!active) return null;

  const rubric = rubrics.find((r) => r.key === active) ?? rubrics[0];
  const posts = allPosts.filter((p) => p.rubric === rubric.key).slice(0, 3);

  return (
    <div className="border-b border-paper/10">
      <Container className="py-14 sm:py-20">
        <div className="font-display text-[11px] font-semibold uppercase tracking-[0.2em] text-[#c8f169]">
          Блог · обновляем каждую неделю
        </div>
        <h2 className="mt-2 font-display text-[1.7rem] font-bold uppercase leading-none tracking-tight text-paper sm:text-4xl">
          Читайте,{" "}
          <span
            style={{
              background: "linear-gradient(92deg,#ff6a3d,#00d2ff)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              color: "transparent",
            }}
          >
            растите
          </span>
        </h2>

        <div
          role="tablist"
          aria-label="Рубрики блога"
          className="mt-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {rubrics.map((r) => {
            const on = r.key === rubric.key;
            const count = allPosts.filter((p) => p.rubric === r.key).length;
            return (
              <button
                key={r.key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setActive(r.key)}
                style={
                  {
                    "--sp-from": r.tone,
                    "--sp-to": r.tone,
                    background: `linear-gradient(150deg, ${r.tone}${on ? "55" : "26"}, rgba(11,11,16,0.6) 70%)`,
                    boxShadow: on ? undefined : `inset 0 0 0 1px ${r.tone}44`,
                  } as CSSProperties
                }
                className={`${on ? "spotlight-strip " : ""}relative flex h-[104px] flex-col justify-between overflow-hidden rounded-[22px] p-4 text-left transition-transform duration-300 hover:-translate-y-0.5 sm:h-[116px]`}
              >
                <span className="flex items-center justify-between">
                  <Tile k={r.key} tone={r.tone} size={32} />
                  <b className="font-display text-3xl font-extrabold leading-none text-white">
                    {count}
                  </b>
                </span>
                <span className="font-display text-[11px] font-bold uppercase tracking-wide text-white sm:text-[12px]">
                  {r.label}
                </span>
              </button>
            );
          })}
        </div>

        <div role="tabpanel" key={rubric.key} className="mt-4 grid gap-2.5">
          {posts.map((p) => {
            const metric = p.metrics?.[0];
            const date = formatBlogDate(p.date);
            return (
              <Row key={p.id} post={p} tone={rubric.tone}>
                <span
                  className="hidden w-16 shrink-0 font-display text-[11px] font-semibold uppercase tracking-wider sm:block"
                  style={{ color: rubric.tone }}
                >
                  {date}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block font-display text-[0.95rem] font-bold leading-snug text-white">
                    {p.title}
                  </span>
                  <span className="mt-0.5 block text-[13px] font-semibold leading-snug text-white/70 sm:truncate">
                    {p.excerpt}
                  </span>
                  <span
                    className="mt-1 block font-display text-[10.5px] font-semibold uppercase tracking-wider sm:hidden"
                    style={{ color: rubric.tone }}
                  >
                    {date}
                  </span>
                </span>
                {metric && (
                  <b
                    className="hidden shrink-0 rounded-full px-3 py-1 font-display text-[11px] sm:block"
                    style={{ background: `${rubric.tone}26`, color: rubric.tone }}
                  >
                    {metric.value}
                  </b>
                )}
                {p.url && (
                  <i
                    className="not-italic text-lg transition-transform duration-300 group-hover:translate-x-1"
                    style={{ color: rubric.tone }}
                    aria-hidden="true"
                  >
                    →
                  </i>
                )}
              </Row>
            );
          })}
        </div>
      </Container>
    </div>
  );
}
