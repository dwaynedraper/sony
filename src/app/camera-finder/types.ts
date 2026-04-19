export type AnswerState = {
  step: number;
  primaryUse: string | null;
  genre: string | null;
  experience: string | null;
  seriousness: string | null;
  budgetTier: number | null;
  formFactor: string | null;
  lensPreference: string | null;
  evfPreference: string | null;
  sensorPreference: string | null;
  mustHaves: string[];
  frustration: string | null;
};

export const INITIAL_STATE: AnswerState = {
  step: 1,
  primaryUse: null,
  genre: null,
  experience: null,
  seriousness: null,
  budgetTier: null,
  formFactor: null,
  lensPreference: null,
  evfPreference: null,
  sensorPreference: null,
  mustHaves: [],
  frustration: null,
};

import { CameraModel } from "./data/cameras";

export interface RecommendationResult {
  camera: CameraModel;
  score: number;
  reasons: string[];
  tradeoff: string;
}

export interface FinalRecommendations {
  best: RecommendationResult | null;
  save: RecommendationResult | null;
  upgrade: RecommendationResult | null;
}
