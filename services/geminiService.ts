import { GoogleGenAI } from "@google/genai";
import { GeneratedImage, Language, ReviewSettings, ImageCategory } from "../types";
import { translations } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const stripBase64Header = (base64: string): string => {
  return base64.split(',')[1] || base64;
};

export const PROMPTS_CONFIG = [
  // --- 3 MODEL SHOTS ---
  {
    category: 'model',
    type: 'model-front',
    key: 'modelFront',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a model wearing this exact clothing item. \n\nCRITICAL MODEL INSTRUCTION:\n- The model MUST have UKRAINIAN APPEARANCE (Slavic features).\n- IGNORE original model ethnicity.\n\nVIEWPOINT: FRONT view.\n\nCROP & COMPOSITION (CRITICAL):\n- The camera must be positioned so that the FACE DOES NOT FIT into the top of the frame.\n- Start the frame from the NECK or COLLARBONES downward.\n- The head is physically outside the image bounds.\n- Include model's feet. Clean neutral studio wall."
  },
  {
    category: 'model',
    type: 'model-back',
    key: 'modelBack',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a model wearing this exact clothing item. \n\nCRITICAL MODEL INSTRUCTION: UKRAINIAN APPEARANCE.\n\nVIEWPOINT: BACK view.\n\nCROP & COMPOSITION:\n- The frame must be cropped below head level.\n- Focus on the fit from behind. The head and hair are excluded from the frame. Clean neutral studio wall."
  },
  {
    category: 'model',
    type: 'model-profile',
    key: 'modelProfile',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a model wearing this exact clothing item. \n\nCRITICAL MODEL INSTRUCTION: UKRAINIAN APPEARANCE.\n\nVIEWPOINT: SIDE PROFILE view.\n\nCROP & COMPOSITION:\n- The frame starts from the shoulders/neck downward.\n- Ensure the face is completely outside the top border of the shot. Clean neutral studio wall."
  },

  // --- 3 FLATLAY SHOTS ---
  {
    category: 'flatlay',
    type: 'flatlay-decor',
    key: 'flatlayDecor',
    text: "Generate a professional 1:1 SQUARE format STYLED FLAT LAY. Background: CONTRASTING PASTEL PAPER. Decor: Minimalist magazines and dried flowers."
  },
  {
    category: 'flatlay',
    type: 'flatlay-shoes',
    key: 'flatlayShoes',
    text: "Generate a professional 1:1 SQUARE format STYLED FLAT LAY. Background: SMOOTH CONCRETE or WHITE MARBLE texture. Props: Pair of stylish SHOES/SNEAKERS nearby."
  },
  {
    category: 'flatlay',
    type: 'flatlay-accessories',
    key: 'flatlayAccessories',
    text: "Generate a professional 1:1 SQUARE format STYLED FLAT LAY. Background: WARM WOODEN SURFACE. Props: Matching ACCESSORIES arranged artistically."
  },

  // --- 3 MACRO SHOTS ---
  {
    category: 'macro',
    type: 'macro-collar',
    key: 'macroCollar',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP focusing strictly on the COLLAR or NECKLINE. Extreme detail on stitching and label."
  },
  {
    category: 'macro',
    type: 'macro-cuff',
    key: 'macroCuff',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP focusing strictly on the SLEEVE CUFF. Extreme detail on ribbing/buttons."
  },
  {
    category: 'macro',
    type: 'macro-pocket',
    key: 'macroPocket',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP focusing strictly on a POCKET or unique TEXTURE detail."
  },

  // --- 3 GHOST MANNEQUIN SHOTS ---
  {
    category: 'mannequin',
    type: 'mannequin-far',
    key: 'mannequinFar',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect (floating). FAR / FULL VIEW. Clean gradient background."
  },
  {
    category: 'mannequin',
    type: 'mannequin-close',
    key: 'mannequinClose',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect. CLOSE-UP / ZOOMED IN on torso fit."
  },
  {
    category: 'mannequin',
    type: 'mannequin-angle',
    key: 'mannequinAngle',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect. 3/4 TURN / SIDE ANGLE revealing depth."
  },

  // --- 3 NATURE SHOTS ---
  {
    category: 'nature',
    type: 'nature-1',
    key: 'nature1',
    text: "Generate a professional 1:1 SQUARE product photo. The item is laid out naturally on FRESH GREEN GRASS / LAWN. Bright sunlight, organic vibe."
  },
  {
    category: 'nature',
    type: 'nature-2',
    key: 'nature2',
    text: "Generate a professional 1:1 SQUARE product photo. The item is laid out on GREY CRUSHED STONE / GRAVEL surface. High texture contrast, urban outdoor vibe."
  },
  {
    category: 'nature',
    type: 'nature-3',
    key: 'nature3',
    text: "Generate a professional 1:1 SQUARE product photo. The item is laid out on a NATURAL DARK SLATE or STONE SLAB surface. Luxury natural texture, high detail."
  }
];

const DISTINCT_LOOKS = [
  "with a clean-shaven or bearded face and short masculine hair",
  "with curly / wavy voluminous hair",
  "with short, modern chic hair",
  "wearing a beanie or hat",
  "with long straight hair and a bright smile",
  "wearing statement earrings/accessories",
  "with a casual messy bun hairstyle",
  "with dyed or highlighted hair strands",
  "with a fringe / bangs hairstyle",
  "with a very natural, no-makeup look"
];

const REVIEW_PROMPTS_MAP = [
  "Selfie in a mirror at home.",
  "Standing in a fitting room.",
  "Outdoors in a park.",
  "Sitting on a couch at home.",
  "Full body shot in a mirror.",
  "Walking on the street.",
  "Close up selfie.",
  "In a car.",
  "With a pet at home.",
  "Picnic style outdoors."
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
  base64Image: string,
  mimeType: string,
  imageType: string, 
  userFeedback: string,
  lang: Language
): Promise<string | null> => {
  const cleanBase64 = stripBase64Header(base64Image);
  const currentAspectRatio = imageType === 'review' ? "3:4" : "1:1";

  const refinedPrompt = `
    TASK: Generate an image of the clothing item. 
    FORMAT: ${currentAspectRatio}.
    USER FEEDBACK: ${userFeedback}
    ${imageType === 'review' ? 'STYLE: Amateur smartphone photo, candid, realistic noise.' : 'STYLE: Professional studio/product photo.'}
  `;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType } },
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
    console.error("Error regenerating single image:", error);
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
  const scenarios = REVIEW_PROMPTS_MAP.slice(0, 10); 

  const promises = scenarios.map(async (scenario, index): Promise<GeneratedImage | null> => {
    let distinctLook = DISTINCT_LOOKS[index % DISTINCT_LOOKS.length];

    const genderConstraint = settings.gender === 'male'
      ? "The person is a man and MUST HAVE SHORT HAIR. No long hair, no ponytails, no braids."
      : "The person is a woman and MUST NOT WEAR ANY HATS, CAPS, BEANIES, OR HEADWEAR.";
    
    if (settings.gender === 'male' && distinctLook.includes('hair tied back')) {
        distinctLook = "with masculine short hair";
    }
    if (settings.gender === 'female' && (distinctLook.includes('beanie') || distinctLook.includes('hat'))) {
        distinctLook = "with long healthy natural hair";
    }

    const imagePromptText = `
      Generate a REALISTIC, CANDID USER GENERATED CONTENT (UGC) photo.
      The person is wearing this exact clothing item.
      FORMAT: Vertical Portrait (3:4).
      STYLE: AMATEUR SMARTPHONE PHOTO, digital noise, realistic lighting.
      DEMOGRAPHICS: ${settings.gender}, ${settings.age} years old, Ukrainian appearance.
      IDENTITY: Person is ${distinctLook}.
      ${genderConstraint}
      SCENARIO: ${scenario}
      Random Seed: ${Date.now()}-${index}-${Math.random()}
    `;

    const textPromptText = `
      Write a short, enthusiastic, 5-star customer review (1-2 sentences) in ${lang === 'uk' ? 'Ukrainian' : lang === 'ru' ? 'Russian' : 'English'}.
      Context: ${scenario}. Use emojis.
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
        model: 'gemini-2.5-flash',
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
      const textReview = textResponse.text?.trim() || "⭐⭐⭐⭐⭐";

      return {
        id: `review-${index}-${Date.now()}`,
        url: imageUrl,
        type: 'review',
        description: t.reviews.scenarios[index] || scenario,
        textReview: textReview,
        correctionCount: 0
      };
    } catch (error) {
      console.error(`Error generating review ${index}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is GeneratedImage => res !== null);
};