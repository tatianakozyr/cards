import { GoogleGenAI } from "@google/genai";
import { GeneratedImage, Language, ReviewSettings } from "../types";
import { translations } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip the data:image/...;base64, prefix
const stripBase64Header = (base64: string): string => {
  return base64.split(',')[1] || base64;
};

// We store prompt keys to map them to translations later
// Moved outside so it can be accessed by both functions
export const PROMPTS_CONFIG = [
  // --- 3 MODEL SHOTS (Faceless, Ukrainian Appearance) ---
  {
    type: 'model-front',
    key: 'modelFront',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a model wearing this exact clothing item. \n\nCRITICAL MODEL INSTRUCTION:\n- The model MUST have UKRAINIAN APPEARANCE (Slavic features, fair to olive skin tone).\n- IGNORE the ethnicity/race of the model in the original reference photo.\n\nVIEWPOINT: FRONT view.\n\nCOMPOSITION:\n- The model's face must NOT be visible (crop just below nose).\n- The frame MUST include the model's feet.\n- Focus entirely on how the clothes fit.\n\nBackground: Clean neutral studio wall. Keep the exact color/pattern. High resolution."
  },
  {
    type: 'model-back',
    key: 'modelBack',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a model wearing this exact clothing item. \n\nCRITICAL MODEL INSTRUCTION:\n- The model MUST have UKRAINIAN APPEARANCE (Slavic features, fair to olive skin tone).\n- IGNORE the ethnicity/race of the model in the original reference photo.\n\nVIEWPOINT: BACK view.\n\nCOMPOSITION:\n- The model's face must NOT be visible.\n- Focus on the fit from behind.\n\nBackground: Clean neutral studio wall. Keep the exact color/pattern."
  },
  {
    type: 'model-profile',
    key: 'modelProfile',
    text: "Generate a professional 1:1 SQUARE format fashion photography shot of a model wearing this exact clothing item. \n\nCRITICAL MODEL INSTRUCTION:\n- The model MUST have UKRAINIAN APPEARANCE (Slavic features, fair to olive skin tone).\n- IGNORE the ethnicity/race of the model in the original reference photo.\n\nVIEWPOINT: SIDE PROFILE view.\n\nCOMPOSITION:\n- The model's face must NOT be visible.\n- Show the silhouette and fit from the side.\n\nBackground: Clean neutral studio wall. Keep the exact color/pattern."
  },

  // --- 3 FLATLAY SHOTS (Different Backgrounds) ---
  {
    type: 'flatlay-decor',
    key: 'flatlayDecor',
    text: "Generate a professional 1:1 SQUARE format STYLED FLAT LAY. The item is laid flat and neat. Background: CONTRASTING PASTEL PAPER (e.g., soft pink, mint, or beige depending on item color). Decor: Minimalist magazines and dried flowers. The item is the star. No folds."
  },
  {
    type: 'flatlay-shoes',
    key: 'flatlayShoes',
    text: "Generate a professional 1:1 SQUARE format STYLED FLAT LAY. The item is laid flat. Background: SMOOTH CONCRETE or WHITE MARBLE texture. Props: Pair of stylish SHOES/SNEAKERS that match the outfit perfectly placed nearby. Modern street style vibe."
  },
  {
    type: 'flatlay-accessories',
    key: 'flatlayAccessories',
    text: "Generate a professional 1:1 SQUARE format STYLED FLAT LAY. The item is laid flat. Background: WARM WOODEN SURFACE. Props: Matching ACCESSORIES (bag, sunglasses, or jewelry) arranged artistically around the item. Warm, cozy boutique vibe."
  },

  // --- 3 MACRO SHOTS ---
  {
    type: 'macro-collar',
    key: 'macroCollar',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP focusing strictly on the COLLAR or NECKLINE. Extreme detail on stitching and label. Soft studio lighting."
  },
  {
    type: 'macro-cuff',
    key: 'macroCuff',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP focusing strictly on the SLEEVE CUFF or ARM HEM. Extreme detail on ribbing/buttons. Soft studio lighting."
  },
  {
    type: 'macro-pocket',
    key: 'macroPocket',
    text: "Generate a 1:1 SQUARE high-end MACRO CLOSE-UP focusing strictly on a POCKET or unique TEXTURE detail. Shallow depth of field (bokeh)."
  },

  // --- 3 GHOST MANNEQUIN SHOTS (Far, Close, Angle) ---
  {
    type: 'mannequin-far',
    key: 'mannequinFar',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect (floating in air). \n\nDISTANCE: FAR / FULL VIEW.\n- Show the ENTIRE item from top to bottom with some margin.\n- The clothes appear 3D and voluminous as if worn by an invisible person. Clean gradient background."
  },
  {
    type: 'mannequin-close',
    key: 'mannequinClose',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect (floating in air). \n\nDISTANCE: CLOSE-UP / ZOOMED IN.\n- Focus on the upper body/torso fit.\n- Crop tight to show fabric drape.\n- The clothes appear 3D and voluminous. Clean gradient background."
  },
  {
    type: 'mannequin-angle',
    key: 'mannequinAngle',
    text: "Generate a 1:1 SQUARE 'GHOST MANNEQUIN' effect (floating in air). \n\nANGLE: 3/4 TURN / SIDE ANGLE.\n- Show the item slightly turned to reveal depth and side construction.\n- Dynamic voluminous look. Clean gradient background."
  },

  // --- 3 NATURE SHOTS (Specific Surfaces) ---
  {
    type: 'nature-1',
    key: 'nature1',
    text: "Generate a professional 1:1 SQUARE product photo. The item is laid out naturally on CLEAN WHITE BEACH SAND. Bright sunlight, summer vibe. Minimalist nature texture."
  },
  {
    type: 'nature-2',
    key: 'nature2',
    text: "Generate a professional 1:1 SQUARE product photo. The item is laid out on GREY RIVER STONES / PEBBLES. High texture contrast. Zen nature vibe."
  },
  {
    type: 'nature-3',
    key: 'nature3',
    text: "Generate a professional 1:1 SQUARE product photo. The item is laid out on FRESH GREEN GRASS / LAWN. Dappled sunlight. Organic eco-friendly vibe."
  }
];

// Explicit physical traits to ensure diversity in reviews
const DISTINCT_LOOKS = [
  "wearing stylish glasses and hair tied back",
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
  "Candid photo with friends in nature/park. The person is laughing.",
  "Relaxing at a country house (dacha) garden, sitting on a chair.",
  "In a shopping mall, looking in a mirror or walking.",
  "Walking outside in the city, casual street photo.",
  "Playing with a dog outside.",
  "During a light sport activity or at a gym (casual).",
  "Sitting in a cafe with a drink.",
  "Standing next to a car in a parking lot.",
  "Holding the item up or looking at it (Unboxing style/Review).",
  "Trying on the clothes at home in front of a mirror (messy room).",
  "Standing near a river or lake, outdoors."
];

export const generateProductImages = async (
  base64Image: string, 
  mimeType: string,
  lang: Language
): Promise<GeneratedImage[]> => {
  const cleanBase64 = stripBase64Header(base64Image);
  const t = translations[lang];
  
  // Create an array of promises to run in parallel
  const promises = PROMPTS_CONFIG.map(async (promptData, index) => {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: promptData.text,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1" // Enforce Square format
          }
        }
      });

      // Extract image from response
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

      if (!imageUrl) {
        console.warn(`No image generated for prompt: ${promptData.key}`);
        // Return null instead of throwing to allow partial success
        return null;
      }

      // Get localized description based on the key
      const description = t.prompts[promptData.key as keyof typeof t.prompts];

      return {
        id: `img-${index}-${Date.now()}`,
        url: imageUrl,
        type: promptData.type as any,
        description: description
      };

    } catch (error) {
      console.error(`Error generating image ${index + 1}:`, error);
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
  
  let basePromptText = PROMPTS_CONFIG[0].text;
  const config = PROMPTS_CONFIG.find(p => p.type === imageType);
  if (config) {
     basePromptText = config.text; 
  }

  // Construct a new prompt that prioritizes user feedback
  const refinedPrompt = `
    ORIGINAL TASK: ${basePromptText}
    
    CRITICAL USER ADJUSTMENT / CORRECTION: ${userFeedback}
    
    INSTRUCTION: Re-generate the image based on the ORIGINAL PHOTO provided, but strictly applying the USER ADJUSTMENT. 
    Maintain the same style, lighting, and composition as the intended task (SQUARE 1:1 Format), but fix the specific detail mentioned.
  `;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: refinedPrompt,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
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

  // Pick top 10 scenarios
  const scenarios = REVIEW_PROMPTS_MAP.slice(0, 10); 

  const promises = scenarios.map(async (scenario, index) => {
    // Select a distinct look for this index to enforce variety
    const distinctLook = DISTINCT_LOOKS[index % DISTINCT_LOOKS.length];

    // Construct a prompt that enforces realism, demographics, and body type
    // Explicitly ask for variation to avoid same-face syndrome
    const promptText = `
      Generate a REALISTIC, CANDID CLIENT REVIEW PHOTO of a person wearing this exact clothing item.
      
      OUTPUT FORMAT: Square 1:1 Aspect Ratio.
      
      DEMOGRAPHICS:
      - Gender: ${settings.gender}
      - Age Range: ${settings.age}
      - APPEARANCE: Ukrainian appearance (Slavic features).
      
      BODY TYPE (IMPORTANT):
      - Slightly overweight.
      - Realistic "average" body type. 
      - NOT a skinny fashion model. 
      - Looks like a real customer.
      
      IDENTITY INSTRUCTION (CRITICAL - MUST BE UNIQUE):
      - This person MUST look different from others.
      - **SPECIFIC TRAIT TO APPLY**: Person is ${distinctLook}.
      - VARY facial features significantly.
      
      SCENARIO: ${scenario}
      
      STYLE:
      - Amateur smartphone photography style.
      - Poor/Natural lighting (flash or daylight).
      - Domestic/Everyday life setting.
      - The clothing item must be clearly visible on the person.
      
      Random Seed: ${Date.now()}-${index}-${Math.random()}
    `;

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            {
              inlineData: {
                data: cleanBase64,
                mimeType: mimeType,
              },
            },
            {
              text: promptText,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: "1:1"
          }
        }
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

      if (!imageUrl) {
        return null;
      }

      return {
        id: `review-${index}-${Date.now()}`,
        url: imageUrl,
        type: 'review',
        description: t.reviews.scenarios[index] || scenario // Map to translated scenario name
      };

    } catch (error) {
      console.error(`Error generating review image ${index}:`, error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is GeneratedImage => res !== null);
};