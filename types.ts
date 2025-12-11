export interface GeneratedImage {
  id: string;
  url: string;
  type: 'model' | 'flatlay' | 'mannequin' | 'macro-collar' | 'macro-cuff' | 'macro-pocket' | 'creative-lifestyle' | 'review';
  description: string;
}

export enum GenerationStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export interface GenerationRequest {
  image: string; // Base64
  mimeType: string;
}

export type Language = 'uk' | 'en' | 'ru';

export type Gender = 'female' | 'male';
export type AgeGroup = 'young' | 'middle' | 'senior';
export type Ethnicity = 'white' | 'black' | 'asian' | 'latino' | 'mixed';

export interface ReviewSettings {
  gender: Gender;
  age: AgeGroup;
  ethnicity: Ethnicity;
}