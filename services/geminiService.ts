
import { GoogleGenAI } from "@google/genai";
import { GeneratedImage, Language, ReviewSettings, ImageCategory } from "../types";
import { translations } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const stripBase64Header = (base64: string): string => {
  return base64.split(',')[1] || base64;
};

export const PROMPTS_CONFIG = [
  {
    category: 'model',
    type: 'model-front',
    key: 'modelFront',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a MAN wearing this exact clothing item. SLAVIC appearance. Camera starts from the NECK downward. FACE IS OUTSIDE THE FRAME. Clean studio wall."
  },
  {
    category: 'model',
    type: 'model-back',
    key: 'modelBack',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a MAN wearing this exact clothing item. SLAVIC appearance. BACK view. The head and hair are excluded from the frame. Clean neutral studio wall."
  },
  {
    category: 'model',
    type: 'model-profile',
    key: 'modelProfile',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a MAN wearing this exact clothing item. SIDE PROFILE view. Slavic features. Face is completely outside the top border. Clean studio wall."
  },
  {
    category: 'flatlay',
    type: 'flatlay-decor',
    key: 'flatlayDecor',
    text: "Generate a 1:1 SQUARE STYLED FLAT LAY of this item. Background: CONTRASTING PASTEL PAPER. Decor: Minimalist magazines."
  },
  {
    category: 'flatlay',
    type: 'flatlay-shoes',
    key: 'flatlayShoes',
    text: "Generate a 1:1 SQUARE STYLED FLAT LAY of this item. Background: SMOOTH CONCRETE. Props: Stylish sneakers nearby."
  },
  {
    category: 'flatlay',
    type: 'flatlay-accessories',
    key: 'flatlayAccessories',
    text: "Generate a 1:1 SQUARE STYLED FLAT LAY. Background: WARM WOODEN SURFACE. Props: Matching men's accessories."
  },
  {
    category: 'macro',
    type: 'macro-collar',
    key: 'macroCollar',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP of the COLLAR of this item. Extreme detail on stitching."
  },
  {
    category: 'macro',
    type: 'macro-cuff',
    key: 'macroCuff',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP of the SLEEVE CUFF. Extreme detail on ribbing."
  },
  {
    category: 'macro',
    type: 'macro-pocket',
    key: 'macroPocket',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP of a POCKET or TEXTURE detail."
  },
  {
    category: 'mannequin',
    type: 'mannequin-far',
    key: 'mannequinFar',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect (floating). Full view. Clean gradient background."
  },
  {
    category: 'mannequin',
    type: 'mannequin-close',
    key: 'mannequinClose',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect. Zoomed in on torso."
  },
  {
    category: 'mannequin',
    type: 'mannequin-angle',
    key: 'mannequinAngle',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect. 3/4 turn revealing depth."
  },
  {
    category: 'nature',
    type: 'nature-1',
    key: 'nature1',
    text: "Professional 1:1 SQUARE product photo. Laid out naturally on FRESH GREEN GRASS. Bright sunlight."
  },
  {
    category: 'nature',
    type: 'nature-2',
    key: 'nature2',
    text: "Professional 1:1 SQUARE product photo. Laid out on GREY CRUSHED STONE. Urban outdoor vibe."
  },
  {
    category: 'nature',
    type: 'nature-3',
    key: 'nature3',
    text: "Professional 1:1 SQUARE product photo. Laid out on a NATURAL DARK SLATE stone slab."
  }
];

export const generateCategoryImages = async (
  base64Image: string,
  mimeType: string,
  category: Exclude<ImageCategory, 'review'>,
  lang: Language
): Promise<GeneratedImage[]> => {
  const cleanBase64 = stripBase64Header(base64Image);
  const t = translations[lang];
  const configToRun = PROMPTS_CONFIG.filter(item => item.category === category);

  const promises = configToRun.map(async (promptData, index) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType } },
            { text: promptData.text },
          ],
        },
        config: { imageConfig: { aspectRatio: "1:1" } }
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts;
      let imageUrl = '';
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
             imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
             break;
          }
        }
      }

      if (!imageUrl) return null;
      const description = t.prompts[promptData.key as keyof typeof t.prompts];

      return {
        id: `img-${category}-${index}-${Date.now()}`,
        url: imageUrl,
        type: promptData.type as any,
        description: description,
        correctionCount: 0
      };
    } catch (error) {
      console.error(`Error generating image in category ${category}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is GeneratedImage => res !== null);
};

export const regenerateSingleImage = async (
  sourceBase64: string,
  sourceMimeType: string,
  currentGeneratedBase64: string,
  imageType: string, 
  userFeedback: string,
  lang: Language
): Promise<string | null> => {
  const cleanSource = stripBase64Header(sourceBase64);
  const cleanCurrent = stripBase64Header(currentGeneratedBase64);
  const currentAspectRatio = imageType === 'review' ? "3:4" : "1:1";

  const refinedPrompt = `
    INSTRUCTION: I am providing two images. 
    1. A 'source clothing photo' (the actual garment reference).
    2. A 'current generated image' (the existing AI result that needs fixing).
    
    TASK: Modify the 'current generated image' based on: "${userFeedback}".
    
    CONSISTENCY RULES:
    - KEEP THE POSE, CAMERA ANGLE, AND BACKGROUND EXACTLY AS THEY ARE in the 'current generated image'.
    - DO NOT CHANGE THE ENVIRONMENT.
    - ONLY edit the requested detail (e.g., if changing ethnicity, keep the body position and lighting environment identical).
    - Ensure the garment on the model stays consistent with the 'source clothing photo'.
    - NO TEXT, NO LABELS, NO OVERLAYS.
    - Result format must be ${currentAspectRatio}.
  `;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            { inlineData: { data: cleanSource, mimeType: sourceMimeType }, text: "source clothing photo" },
            { inlineData: { data: cleanCurrent, mimeType: 'image/png' }, text: "current generated image to be fixed" },
            { text: refinedPrompt },
          ],
        },
        config: { imageConfig: { aspectRatio: currentAspectRatio as any } }
      });

      const candidate = response.candidates?.[0];
      const parts = candidate?.content?.parts;
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
             return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
          }
        }
      }
      return null;
  } catch (error) {
    console.error("Error regeneration failed", error);
    throw error;
  }
};

export const generateReviewImages = async (
  base64Image: string,
  mimeType: string,
  settings: ReviewSettings,
  lang: Language
): Promise<GeneratedImage[]> => {
  const cleanBase64 = stripBase64Header(base64Image);
  const t = translations[lang];
  
  const promises = settings.situations.map(async (situation, index): Promise<GeneratedImage | null> => {
    
    let appearance = "SLAVIC (Ukrainian/Eastern European) appearance. Not a model. Real person look.";
    let cultureTag = "Ukraine / Eastern Europe";
    let middleClassContext = "Authentic local architecture, slightly cluttered domestic setting, middle-class household items.";
    
    if (settings.reviewLanguage === 'en') {
      appearance = "WESTERN (European/North American) appearance. Not a model. Real person look.";
      cultureTag = "Western Europe / North America / USA";
      middleClassContext = "Standard Western suburban or urban home, realistic middle-class interior style.";
    }

    const imagePromptText = `
      ULTRA-REALISTIC CANDID SMARTPHONE PHOTO FOR A PRODUCT REVIEW. 
      
      CRITICAL AESTHETIC:
      - THE PHOTO MUST LOOK LIKE A RAW, AMATEUR MOBILE PHONE SHOT (low dynamic range, digital noise, slight motion blur, or imperfect focus).
      - ABSOLUTELY NON-COMMERCIAL. NO STUDIO LIGHTING. No professional composition.
      - THE ENVIRONMENT MUST BE FULLY REALISTIC: Physically place the man in the situation: ${situation}.
      - Atmosphere: Typical middle-class life in ${cultureTag}. ${middleClassContext}
      
      SUBJECT:
      - A MAN, approximately ${settings.age} years old.
      - BODY TYPE: NON-MODEL, REALISTIC, slightly OVERWEIGHT, "dad bod", imperfect physique, not athletic.
      - APPEARANCE: ${appearance}. Genuine, non-posed facial expression (maybe a slight squint or a casual smile).
      
      CLOTHING:
      - The man is wearing the EXACT clothing item from the reference photo.
      - THE CLOTHING MUST BE FULLY AND CLEARLY VISIBLE in the center of the frame. It should look like he's showing it off to the camera.
      
      TECHNICAL SPECS:
      - VERTICAL PORTRAIT (3:4 aspect ratio).
      - LIGHTING: Harsh overhead room lights, natural light from a window, or outdoor sunlight. No softboxes.
      - ABSOLUTELY NO TEXT, NO LABELS, NO CAPTIONS, NO WATERMARKS, NO LOGOS, NO NUMBERS. The image must be 100% clean of characters.
      
      Random Seed: ${Date.now()}-${index}-${Math.random()}
    `;

    const textPromptText = `
      Write a short, realistic 5-star customer review (1-2 sentences) in ${settings.reviewLanguage === 'uk' ? 'Ukrainian' : settings.reviewLanguage === 'ru' ? 'Russian' : 'English'}.
      Context: The user is wearing or showing the SPECIFIC clothing item (fabric, fit, appearance) while in the situation: ${situation}.
      Tone: Genuine, natural, like a regular guy sharing a good purchase. Mention quality or how it feels.
      Output ONLY the text review.
    `;

    try {
      const imagePromise = ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType } },
            { text: imagePromptText },
          ],
        },
        config: { imageConfig: { aspectRatio: "3:4" } }
      });

      const textPromise = ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPromptText,
      });

      const [imageResponse, textResponse] = await Promise.all([imagePromise, textPromise]);

      const candidate = imageResponse.candidates?.[0];
      const parts = candidate?.content?.parts;
      let imageUrl = '';
      if (parts) {
        for (const part of parts) {
          if (part.inlineData && part.inlineData.data) {
             imageUrl = `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
             break;
          }
        }
      }

      if (!imageUrl) return null;
      const textReview = textResponse.text?.trim() || "Good quality! ⭐⭐⭐⭐⭐";

      return {
        id: `review-${index}-${Date.now()}`,
        url: imageUrl,
        type: 'review',
        description: situation,
        textReview: textReview,
        correctionCount: 0
      };
    } catch (error) {
      console.error(`Error generating review for ${situation}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is GeneratedImage => res !== null);
};
