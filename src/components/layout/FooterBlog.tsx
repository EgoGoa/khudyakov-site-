"use client";

import { useState } from "react";
import Container from "@/components/ui/Container";
import {
  blogRubrics,
  formatBlogDate,
  getBlogPosts,
  type BlogPost,
  type BlogRubric,
} from "@/lib/blog";

// Витрина блога над основной частью подвала: слева рубрики со счётчиками,
// справа свежие материалы выбранной рубрики. Данные — content/blog/posts.json
// (обновляет агент раз в неделю). Пустая рубрика скрывается, нет материалов
// совсем — блок не выводится.

const allPosts = getBlogPosts();
const rubrics = blogRubrics.filter((r) => allPosts.some((p) => p.rubric === r.key));

function Card({ post, tone, big = false }: { post: BlogPost; tone: string; big?: boolean }) {
  const meta = [formatBlogDate(post.date), post.readMin ? `${post.readMin} мин` : ""]
    .filter(Boolean)
    .join(" · ");
  const body = (
    <>
      <span
        className="block h-1 w-full"
        style={{ background: `linear-gradient(90deg, ${tone}, transparent)` }}
        aria-hidden="true"
      />
      <span className={`block ${big ? "p-6" : "p-5"}`}>
        <span className="block font-display text-[1.05rem] leading-snug text-paper">
          {post.title}
        </span>
        <span className="mt-3 block text-sm leading-relaxed text-paper/55">{post.excerpt}</span>
        {post.metrics && post.metrics.length > 0 && (
          <span className="mt-5 block space-y-3">
            {post.metrics.slice(0, 3).map((m) => (
              <span key={m.label} className="block">
                <span className="flex justify-between text-xs text-paper/55">
                  <span>{m.label}</span>
                  <b className="font-semibold text-paper">{m.value}</b>
                </span>
                <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-paper/10">
                  <span
                    className="block h-full rounded-full"
                    style={{
                      width: `${Math.min(100, Math.max(0, m.percent))}%`,
                      background: `linear-gradient(90deg, ${tone}, #34d399)`,
                    }}
                  />
                </span>
              </span>
            ))}
          </span>
        )}
        {(meta || post.source) && (
          <span className="mt-4 block text-xs text-paper/35">
            {[meta, post.source ? `Источник: ${post.source}` : ""].filter(Boolean).join(" · ")}
          </span>
        )}
      </span>
    </>
  );
  const cls =
    "block overflow-hidden rounded-2xl border border-paper/10 bg-paper/[0.03] transition-colors duration-300";
  return post.url ? (
    <a
      href={post.url}
      target="_blank"
      rel="noopener noreferrer"
      className={`${cls} hover:border-glow/50`}
    >
      {body}
    </a>
  ) : (
    <div className={cls}>{body}</div>
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
        <div className="grid gap-8 lg:grid-cols-[300px_1fr] lg:gap-12">
          <div>
            <div className="font-display text-xs uppercase tracking-[0.2em] text-paper/40">
              Блог · обновляем каждую неделю
            </div>
            <h2 className="mt-3 font-display text-[1.6rem] uppercase leading-tight tracking-tight text-paper sm:text-3xl">
              Читайте,
              <br />
              растите
            </h2>
            <div
              role="tablist"
              aria-label="Рубрики блога"
              className="-mx-6 mt-6 flex gap-2 overflow-x-auto px-6 pb-2 lg:mx-0 lg:flex-col lg:gap-1 lg:overflow-visible lg:px-0 lg:pb-0"
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
                    className="flex shrink-0 items-center justify-between gap-4 rounded-full border px-4 py-2.5 text-left text-sm transition-colors duration-300 lg:rounded-2xl lg:py-3.5"
                    style={{
                      borderColor: on ? r.tone : "rgba(220,221,239,0.12)",
                      color: on ? r.tone : "rgba(220,221,239,0.7)",
                      background: on ? "rgba(255,255,255,0.04)" : "transparent",
                    }}
                  >
                    <span className="font-semibold">{r.label}</span>
                    <span className="text-xs opacity-50">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            role="tabpanel"
            key={rubric.key}
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
          >
            {posts.map((post, i) => (
              <div
                key={post.id}
                className={i === 0 && posts.length === 1 ? "sm:col-span-2 xl:col-span-3" : i === 0 && posts.length === 2 ? "sm:col-span-2 xl:col-span-2" : ""}
              >
                <Card post={post} tone={rubric.tone} big={i === 0} />
              </div>
            ))}
          </div>
        </div>
      </Container>
    </div>
  );
}
