export interface GeneratedImage {
  id: string;
  url: string;
  type: 'model' | 'flatlay' | 'mannequin' | 'creative';
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
