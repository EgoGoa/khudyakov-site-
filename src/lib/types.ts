export type Service = {
  title: string;
  description: string;
};

export type Work = {
  id: string;
  title: string;
  client: string;
  category: string;
  youtubeId?: string;
};

export type ProcessStep = {
  title: string;
  description: string;
};

export type PricingTier = {
  name: string;
  price: string;
  tagline: string;
  team: string;
  features: string[];
  pro: boolean;
};
