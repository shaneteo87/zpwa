export enum KarmaType {
  MERIT = 'MERIT',
  BAD_LUCK = 'BAD_LUCK'
}

export type Language = 'en' | 'zh' | 'vi' | 'th' | 'ko' | 'ja' | 'es';

export interface KarmaEntry {
  id: string;
  type: KarmaType;
  description: string;
  timestamp: number;
  aiFeedback: string;
  scoreImpact: number;
  symbol: string;
}

export interface AIResponse {
  feedback: string;
  scoreImpact: number;
  symbol: string;
}

export interface RankTier {
  name: string;
  minScore: number;
  icon: string;
  color: string;
}

export interface UserData {
  nameEn: string;
  nameCn?: string;
  gender: 'Male' | 'Female';
  dob: string;
  tob: string;
  isTobUnknown: boolean;
  mobile: string;
  location: string;
}