"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { trackGoal } from "@/lib/ym";
import type { Answer, Answers, BriefConfig } from "../types";
import { canProceed, storageKey, visibleSteps } from "../lib/logic";

export type Stage = "intro" | "steps" | "review" | "success";

type Saved = { answers: Answers; stepId: string | null };

function readSaved(id: string): Saved | null {
  try {
    const raw = localStorage.getItem(storageKey(id));
    if (!raw) return null;
    const s = JSON.parse(raw) as Saved;
    if (s && typeof s === "object" && s.answers && Object.keys(s.answers).length) return s;
  } catch {
    /* localStorage недоступен или данные битые — начинаем с нуля */
  }
  return null;
}

export function useBriefState(config: BriefConfig) {
  const [stage, setStage] = useState<Stage>("intro");
  const [answers, setAnswers] = useState<Answers>({});
  const [stepId, setStepId] = useState<string | null>(null);
  const [saved, setSaved] = useState<Saved | null>(null);
  const [fromReview, setFromReview] = useState(false);
  const started = useRef(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- localStorage недоступен при SSR: чтение только после монтирования
    setSaved(readSaved(config.id));
  }, [config.id]);

  const visible = useMemo(() => visibleSteps(config, answers), [config, answers]);
  const index = Math.max(0, visible.findIndex((s) => s.id === stepId));
  const step = visible[index];

  const persist = useCallback(
    (nextAnswers: Answers, nextStepId: string | null) => {
      try {
        localStorage.setItem(storageKey(config.id), JSON.stringify({ answers: nextAnswers, stepId: nextStepId }));
      } catch {
        /* без localStorage бриф тоже работает */
      }
    },
    [config.id]
  );

  const goTo = useCallback(
    (id: string) => {
      setStepId(id);
      setStage("steps");
      persist(answers, id);
      const n = visibleSteps(config, answers).findIndex((s) => s.id === id) + 1;
      if (n > 0) trackGoal(`brief_step_${n}`, { briefId: config.id });
    },
    [answers, config, persist]
  );

  const start = useCallback(() => {
    if (!started.current) {
      started.current = true;
      trackGoal("brief_start", { briefId: config.id });
    }
    goTo(config.steps[0].id);
  }, [config, goTo]);

  const resume = useCallback(() => {
    if (!saved) return;
    started.current = true;
    setAnswers(saved.answers);
    const vis = visibleSteps(config, saved.answers);
    const id = vis.find((s) => s.id === saved.stepId)?.id ?? vis[0].id;
    setStepId(id);
    setStage("steps");
  }, [saved, config]);

  const restart = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(config.id));
    } catch {
      /* нечего чистить */
    }
    setSaved(null);
    setAnswers({});
  }, [config.id]);

  const setAnswer = useCallback(
    (id: string, patch: Partial<Answer>) => {
      setAnswers((prev) => {
        const next = { ...prev, [id]: { ...prev[id], ...patch } };
        persist(next, stepId);
        return next;
      });
    },
    [persist, stepId]
  );

  const next = useCallback(() => {
    if (!step) return;
    if (fromReview) {
      setFromReview(false);
      setStage("review");
      return;
    }
    const nxt = visible[index + 1];
    if (nxt) goTo(nxt.id);
    else setStage("review");
  }, [step, fromReview, visible, index, goTo]);

  const back = useCallback(() => {
    if (fromReview) {
      setFromReview(false);
      setStage("review");
      return;
    }
    if (index > 0) goTo(visible[index - 1].id);
    else setStage("intro");
  }, [fromReview, index, visible, goTo]);

  const edit = useCallback(
    (id: string) => {
      setFromReview(true);
      goTo(id);
    },
    [goTo]
  );

  const finish = useCallback(() => {
    try {
      localStorage.removeItem(storageKey(config.id));
    } catch {
      /* нечего чистить */
    }
    trackGoal("brief_submit", { briefId: config.id });
    setStage("success");
  }, [config.id]);

  return {
    stage,
    setStage,
    answers,
    visible,
    index,
    step,
    saved,
    fromReview,
    canNext: step ? canProceed(step, answers[step.id]) : false,
    start,
    resume,
    restart,
    setAnswer,
    next,
    back,
    edit,
    finish,
  };
}
