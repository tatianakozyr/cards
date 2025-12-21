export type ImageCategory = 'model' | 'flatlay' | 'macro' | 'mannequin' | 'nature' | 'review';

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
    | 'mannequin-far' 
    | 'mannequin-close'
    | 'mannequin-angle'
    | 'macro-collar' 
    | 'macro-cuff' 
    | 'macro-pocket' 
    | 'nature-1' 
    | 'nature-2' 
    | 'nature-3'
    | 'review';
  description: string;
  textReview?: string;
  correctionCount: number;
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

export type AgeGroup = '30-40' | '40-50' | '50+';

export interface ReviewSettings {
  situations: string[]; // Changed from single situation to multiple
  reviewLanguage: Language;
  age: AgeGroup;
}