
export type ImageCategory = 'model' | 'flatlay' | 'macro' | 'mannequin' | 'nature' | 'review' | 'promo';

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
    | 'flatlay-gym'
    | 'flatlay-street'
    | 'flatlay-running'
    | 'flatlay-cold'
    | 'flatlay-home'
    | 'flatlay-minimal'
    | 'flatlay-outdoor'
    | 'flatlay-power'
    | 'flatlay-after'
    | 'flatlay-active'
    | 'mannequin-far' 
    | 'mannequin-close'
    | 'mannequin-angle'
    | 'macro-collar' 
    | 'macro-cuff' 
    | 'macro-pocket' 
    | 'macro-fastener'
    | 'macro-fabric'
    | 'macro-lining'
    | 'nature-eco' 
    | 'nature-industrial' 
    | 'nature-abstract'
    | 'nature-home'
    | 'nature-street'
    | 'nature-grass'
    | 'review'
    | 'promo-1'
    | 'promo-2'
    | 'promo-3'
    | 'promo-4'
    | 'promo-5'
    | 'promo-6';
  description: string;
  textReview?: string;
  slogan?: string;
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
  situations: string[];
  reviewLanguage: Language;
  age: AgeGroup;
}
