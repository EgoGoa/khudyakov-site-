// Английские подписи разделов (page-sections.ts): та же структура, только
// тексты. Ключ — "<страница>#<id>" для блоков и id для общих страниц.
type Copy = { label: string; description: string };

export const PAGE_BLOCK_COPY_EN: Record<string, Copy> = {
  "/content#opening": { label: "Intro", description: "Our core message and results in numbers — the opening shot." },
  "/content#works": { label: "Work", description: "78 portfolio projects: ads, showreels, 3D and motion." },
  "/content#why": { label: "Why us", description: "What sets us apart: experience, approach and what you get." },
  "/content#services": { label: "What we do", description: "Production, AI, websites and social — our full service stack." },
  "/content#process": { label: "How we work", description: "Six steps, from project estimate to delivery and support." },
  "/content#contact": { label: "Pricing & inquiry", description: "Timelines, budget and the fastest way to reach us." },

  "/ai#pitch": { label: "AI solutions", description: "Your pain points, 10 AI services and our track record." },
  "/ai#portfolio": { label: "AI portfolio", description: "AI project cases — the first ones are in progress." },
  "/ai#segments": { label: "Who it's for", description: "4 business segments and a case for each." },
  "/ai#trust": { label: "Why us", description: "Full-cycle production house — 60% of clients come back." },
  "/ai#offer": { label: "What we do", description: "10 AI services: bots, content, analytics." },
  "/ai#guarantees": { label: "Terms & guarantees", description: "Rights, SLA, timelines and the team behind it." },
  "/ai#process": { label: "How rollout works", description: "Six steps, from process audit to ongoing support." },
  "/ai#close": { label: "Pricing & inquiry", description: "Plans for your task and project kickoff." },

  "/sites#pitch": { label: "AI-built websites", description: "Custom design and code instead of templates." },
  "/sites#method": { label: "Method & fit", description: "How AI speeds up the draft, and three segments it suits." },
  "/sites#offer": { label: "What we do", description: "From a landing page to a turnkey site with integrations." },
  "/sites#process": { label: "How it works", description: "Five steps, from brief to launch." },
  "/sites#guarantees": { label: "Why us", description: "Fixed timelines, money-back guarantee and code you own." },
  "/sites#close": { label: "Pricing & inquiry", description: "Three packages and project kickoff." },

  "/smm#pitch": { label: "Social by a production team", description: "Shooting, editing and account management by one team." },
  "/smm#method": { label: "Not just a contractor", description: "How we compare to freelancers and agencies — and who it suits." },
  "/smm#offer": { label: "What we do", description: "Full-cycle management: from shooting and editing to ads and reports." },
  "/smm#process": { label: "How it works", description: "Five steps, from audit to weekly reports." },
  "/smm#guarantees": { label: "What's included", description: "A fixed package, content approval and a weekly report." },
  "/smm#close": { label: "Management plans", description: "Three monthly plans and kickoff." },
};

export const CROSS_PAGE_COPY_EN: Record<string, Copy> = {
  calculator: { label: "Calculator", description: "Estimate your budget by format, length and timeline." },
  brief: { label: "Brief", description: "Outline your task — that's where every project starts." },
};
