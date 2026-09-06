import type { DirectionContent } from "./types";
import { presentationContent } from "./content/presentation";
import { advertisingContent } from "./content/advertising";
import { imageContent } from "./content/image";
import { aiVideoContent } from "./content/ai-video";
import { graphicsContent } from "./content/graphics";

// Все пять направлений внутри /content, у каждого — полная страница.
//
// Вёрстка общая (DirectionPage), различаются данные и раскладка блоков.
// Чтобы поднять новое направление, достаточно добавить файл в content/ и
// строку сюда.
export const directionPages: Record<string, DirectionContent> = {
  [presentationContent.slug]: presentationContent,
  [advertisingContent.slug]: advertisingContent,
  [imageContent.slug]: imageContent,
  [aiVideoContent.slug]: aiVideoContent,
  [graphicsContent.slug]: graphicsContent,
};
