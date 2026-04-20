import { Focus, UseCase, Skill, Intent, Budget, FormFactor, MustHave, CameraModel } from "./data/cameras";

export type AnswerState = {
  step: number;
  focus: Focus | null;
  useCase: UseCase | null;
  skill: Skill | null;
  intent: Intent | null;
  budget: Budget | null;
  formFactor: FormFactor | null;
  mustHaves: MustHave[];
};

export const INITIAL_STATE: AnswerState = {
  step: 1,
  focus: null,
  useCase: null,
  skill: null,
  intent: null,
  budget: null,
  formFactor: null,
  mustHaves: [],
};

export interface RecommendationResult {
  camera: CameraModel;
  score: number;
  isOverBudget: boolean;
  isStretchPick?: boolean;
  baseScore?: number;
}

export interface FinalRecommendations {
  best: RecommendationResult | null;
  alternatives: RecommendationResult[];
}
