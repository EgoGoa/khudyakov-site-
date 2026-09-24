import Container from "@/components/ui/Container";

// Общая вёрстка юридических страниц — та же, что у /privacy, чтобы
// документы кабинета (соглашение, правила бонуса) выглядели одной серией.
export type LegalSection = { title: string; body: string[] };

export default function LegalPage({ title, since, sections }: { title: string; since: string; sections: LegalSection[] }) {
  return (
    <section className="py-24 sm:py-32">
      <Container className="max-w-3xl">
        <h1 className="font-display text-[1.688rem] uppercase tracking-tight text-paper sm:text-[2.025rem]">{title}</h1>
        <p className="mt-4 text-sm text-paper">{since}</p>
        <div className="mt-12 space-y-10">
          {sections.map((s) => (
            <div key={s.title}>
              <h2 className="font-display text-lg uppercase tracking-tight text-glow">{s.title}</h2>
              <div className="mt-3 space-y-3 text-sm leading-relaxed text-paper">
                {s.body.map((p) => (
                  <p key={p}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
