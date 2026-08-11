"use client";

import { useEffect, useState } from "react";
import type { ChangeEvent, FormEvent, ReactNode } from "react";
import { motion } from "framer-motion";
import Container from "@/components/ui/Container";
import Reveal from "@/components/ui/Reveal";
import Eyebrow from "@/components/ui/Eyebrow";
import { useService } from "@/lib/service-context";
import { projectTypeByCategory } from "@/lib/service-content";

const projectTypes = [
  "Рекламный ролик",
  "Имиджевое видео",
  "Съёмка мероприятия",
  "Motion design",
  "Контент для соцсетей",
  "AI-контент",
  "AI-решения и автоматизация",
  "Другое",
];

const budgets = [
  "до 75 000 ₽",
  "75 000 – 255 000 ₽",
  "от 900 000 ₽",
  "обсудим индивидуально",
];

type FormState = {
  name: string;
  contact: string;
  projectType: string;
  budget: string;
  message: string;
};

const initialState: FormState = {
  name: "",
  contact: "",
  projectType: projectTypes[0],
  budget: budgets[0],
  message: "",
};

type Errors = Partial<Record<keyof FormState, string>>;

const inputClass =
  "w-full rounded-lg border border-paper/15 bg-paper/[0.04] px-4 py-3 text-sm text-paper placeholder:text-paper/40 focus:border-glow focus:outline-none";

export default function Contact() {
  const { active } = useService();
  const [form, setForm] = useState<FormState>(initialState);
  const [errors, setErrors] = useState<Errors>({});
  const [submitted, setSubmitted] = useState(false);

  // prefill "project type" to match whichever service is active on the
  // homepage picker, but only before the visitor has touched the form —
  // don't clobber a choice they already made
  useEffect(() => {
    setForm((prev) =>
      prev.projectType === initialState.projectType
        ? { ...prev, projectType: projectTypeByCategory[active] }
        : prev
    );
  }, [active]);

  const update =
    (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
      setForm((prev) => ({ ...prev, [field]: event.target.value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!form.name.trim()) next.name = "Укажите имя или компанию";
    if (!form.contact.trim()) next.contact = "Укажите email или Telegram";
    if (!form.message.trim()) next.message = "Расскажите пару слов о проекте";
    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const validation = validate();
    setErrors(validation);
    if (Object.keys(validation).length === 0) {
      setSubmitted(true);
    }
  };

  return (
    <section id="contact" className="py-10 sm:py-14">
      <Container className="max-w-4xl">
        <Reveal>
          <Eyebrow index="07" label="Контакты" />
          <h2 className="font-sans text-3xl font-light uppercase tracking-[0.01em] text-paper sm:text-4xl md:text-5xl">
            Расскажите о проекте
          </h2>
          <p className="mt-4 max-w-2xl text-sm text-paper/60 sm:text-base">
            Начнём с бесплатной консультации, сметы и подготовки концепций.
            Ответим в течение одного рабочего дня.
          </p>
        </Reveal>

        <Reveal delay={0.1}>
          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="liquid-glass mt-8 p-8 text-center sm:p-12"
            >
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rec/15 text-2xl text-rec">
                ✓
              </div>
              <h3 className="mt-6 font-display text-2xl uppercase text-paper sm:text-3xl">
                Заявка отправлена
              </h3>
              <p className="mt-3 text-paper/60">
                Спасибо, {form.name}! Мы изучим бриф и свяжемся с вами по
                контакту «{form.contact}» в течение одного рабочего дня.
              </p>
            </motion.div>
          ) : (
            <form
              onSubmit={handleSubmit}
              noValidate
              className="liquid-glass mt-8 grid gap-5 p-6 sm:p-8 md:grid-cols-2"
            >
              <Field label="Имя / компания" required error={errors.name}>
                <input
                  value={form.name}
                  onChange={update("name")}
                  placeholder="Как к вам обращаться"
                  className={inputClass}
                />
              </Field>

              <Field label="Email или Telegram" required error={errors.contact}>
                <input
                  value={form.contact}
                  onChange={update("contact")}
                  placeholder="hello@company.com"
                  className={inputClass}
                />
              </Field>

              <Field label="Тип проекта">
                <select
                  value={form.projectType}
                  onChange={update("projectType")}
                  className={inputClass}
                >
                  {projectTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Бюджет">
                <select value={form.budget} onChange={update("budget")} className={inputClass}>
                  {budgets.map((budget) => (
                    <option key={budget} value={budget}>
                      {budget}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Расскажите о проекте" required error={errors.message} className="md:col-span-2">
                <textarea
                  value={form.message}
                  onChange={update("message")}
                  rows={5}
                  placeholder="Цели, референсы, формат, площадки размещения…"
                  className={`${inputClass} resize-none`}
                />
              </Field>

              <div className="md:col-span-2">
                <button
                  type="submit"
                  className="w-full rounded-full bg-rec px-8 py-4 text-sm font-medium text-white transition hover:bg-rec-light sm:w-auto"
                >
                  Отправить
                </button>
              </div>
            </form>
          )}
        </Reveal>
      </Container>
    </section>
  );
}

function Field({
  label,
  required,
  error,
  className = "",
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-2 block text-sm font-medium text-paper/70">
        {label}
        {required && <span className="text-rec"> *</span>}
      </span>
      {children}
      {error && <span className="mt-1.5 block text-xs text-rec">{error}</span>}
    </label>
  );
}
