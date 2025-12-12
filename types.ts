export interface GeneratedImage {
  id: string;
  url: string;
  type: 
    | 'model-front' 
    | 'model-back' 
    | 'model-profile' 
    | 'flatlay-decor' 
    | 'flatlay-shoes' 
    | 'flatlay-accessories' 
    | 'mannequin' 
    | 'macro-collar' 
    | 'macro-cuff' 
    | 'macro-pocket' 
    | 'nature-1' 
    | 'nature-2' 
    | 'review';
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
// Updated age groups per request
export type AgeGroup = '20-30' | '30-40' | '40-50' | '50+';

export interface ReviewSettings {
  gender: Gender;
  age: AgeGroup;
  // Ethnicity removed
}