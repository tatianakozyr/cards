
import { GoogleGenAI } from "@google/genai";
import { GeneratedImage, Language, ReviewSettings, ImageCategory } from "../types";
import { translations } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const stripBase64Header = (base64: string): string => {
  return base64.split(',')[1] || base64;
};

// Standard product shot prompts
export const PROMPTS_CONFIG = [
  {
    category: 'model',
    type: 'model-front',
    key: 'modelFront',
    text: "Professional 1:1 SQUARE fashion shot. MAN wearing this exact item. SLAVIC appearance. Neck downward. FACE OUTSIDE FRAME. Studio wall."
  },
  {
    category: 'model',
    type: 'model-back',
    key: 'modelBack',
    text: "Professional 1:1 SQUARE fashion shot. MAN wearing this item. BACK view. Head excluded. Studio wall."
  },
  {
    category: 'model',
    type: 'model-profile',
    key: 'modelProfile',
    text: "Professional 1:1 SQUARE fashion shot. MAN wearing this item. SIDE PROFILE. Face outside top border. Studio wall."
  },
  {
    category: 'flatlay',
    type: 'flatlay-decor',
    key: 'flatlayDecor',
    text: "1:1 SQUARE STYLED FLAT LAY. Background: PASTEL PAPER. Decor: Magazines."
  },
  {
    category: 'flatlay',
    type: 'flatlay-shoes',
    key: 'flatlayShoes',
    text: "1:1 SQUARE STYLED FLAT LAY. Background: CONCRETE. Props: Sneakers."
  },
  {
    category: 'flatlay',
    type: 'flatlay-accessories',
    key: 'flatlayAccessories',
    text: "1:1 SQUARE STYLED FLAT LAY. Background: WOOD. Props: Men's accessories."
  },
  {
    category: 'macro',
    type: 'macro-collar',
    key: 'macroCollar',
    text: "1:1 SQUARE MACRO CLOSE-UP. COLLAR detail. Sharp stitching."
  },
  {
    category: 'macro',
    type: 'macro-cuff',
    key: 'macroCuff',
    text: "1:1 SQUARE MACRO CLOSE-UP. SLEEVE CUFF detail. Texture focus."
  },
  {
    category: 'macro',
    type: 'macro-pocket',
    key: 'macroPocket',
    text: "1:1 SQUARE MACRO CLOSE-UP. POCKET detail."
  },
  {
    category: 'mannequin',
    type: 'mannequin-far',
    key: 'mannequinFar',
    text: "Professional 1:1 SQUARE product photo of the garment worn by an INVISIBLE GHOST MANNEQUIN. Remote full shot. Perfectly centered. Clean white studio background. Sharp shadows."
  },
  {
    category: 'mannequin',
    type: 'mannequin-close',
    key: 'mannequinClose',
    text: "Professional 1:1 SQUARE product photo of the garment worn by an INVISIBLE GHOST MANNEQUIN. Close-up zoomed shot of the torso and chest area. High detail. White background."
  },
  {
    category: 'mannequin',
    type: 'mannequin-angle',
    key: 'mannequinAngle',
    text: "Professional 1:1 SQUARE product photo of the garment worn by an INVISIBLE GHOST MANNEQUIN. 3/4 turn (half-turn) angle view. Dynamic lighting. White studio background."
  },
  {
    category: 'nature',
    type: 'nature-1',
    key: 'nature1',
    text: "1:1 SQUARE product photo. On FRESH GREEN GRASS. Natural light."
  },
  {
    category: 'nature',
    type: 'nature-2',
    key: 'nature2',
    text: "1:1 SQUARE product photo. On GREY CRUSHED STONE."
  },
  {
    category: 'nature',
    type: 'nature-3',
    key: 'nature3',
    text: "1:1 SQUARE product photo. On DARK SLATE."
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
    IMPORTANT TASK: You are an expert photo editor. 
    You must MODIFY the 'Current Generated Image' based strictly on this USER FEEDBACK: "${userFeedback}".
    
    GUIDELINES:
    1. The change MUST be clearly visible. If requested to change background, replace it entirely. If requested to change lighting, make a dramatic adjustment.
    2. DO NOT change the design of the clothing. Use the 'Source Garment Reference' to ensure the product remains exactly the same.
    3. Keep the general composition of the 'Current Generated Image' but transform the specific elements mentioned in the feedback.
    4. Provide the result as a new high-quality image.
    
    User wants: ${userFeedback}
  `;

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            { inlineData: { data: cleanSource, mimeType: sourceMimeType }, text: "Source Garment Reference (Keep the product identical to this)" },
            { inlineData: { data: cleanCurrent, mimeType: 'image/png' }, text: "Current Generated Image (Modify this image)" },
            { text: refinedPrompt },
          ],
        },
        config: { 
          imageConfig: { aspectRatio: currentAspectRatio as any },
          temperature: 0.8 
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
    console.error("Error regeneration failed", error);
    throw error;
  }
};

/**
 * Generates specific details for a location to ensure clarity in AI output.
 */
const getLocationDetails = (situationKey: string): string => {
  const s = situationKey.toLowerCase();
  if (s.includes("рибал") || s.includes("fishing")) {
    return "Outdoor at a river bank or lake. Visible reeds, water reflection, fishing rods, bucket, tackle box. Natural overcast daylight.";
  }
  if (s.includes("парк") || s.includes("park") || s.includes("nature")) {
    return "Public park with paved paths, green benches, tall autumn trees, falling leaves. Soft morning sunlight filtering through branches.";
  }
  if (s.includes("спортзал") || s.includes("gym")) {
    return "Indoor modern gym. Background: dumbbells, weight racks, mirror with gym branding, industrial ceiling lights, rubber flooring.";
  }
  if (s.includes("магазин") || s.includes("store") || s.includes("supermarket")) {
    return "Inside a bright supermarket. Background: shelves with colorful groceries, price tags, freezer sections, linoleum floor.";
  }
  if (s.includes("машин") || s.includes("car") || s.includes("garage")) {
    return "Next to a parked silver SUV in a typical residential parking lot. Asphalt ground, other cars blurred in distance. Bright daylight.";
  }
  if (s.includes("дача") || s.includes("dacha") || s.includes("yard")) {
    return "Backyard of a cozy private house. Wooden fence, garden tools, fruit trees, a plastic chair. Warm evening 'golden hour' light.";
  }
  if (s.includes("вдома") || s.includes("home")) {
    return "Inside a realistic messy living room. Sofa with pillows, TV stand, plant on the shelf. Warm domestic indoor lighting.";
  }
  if (s.includes("ринок") || s.includes("market")) {
    return "Outdoor busy local market. Background stalls with clothes or produce, crowds of people blurred, tent roofs. Harsh direct sunlight.";
  }
  if (s.includes("військ") || s.includes("military")) {
    return "Field conditions. Muddy ground, camouflage netting in background, sandbags, military equipment. Grey cloudy sky.";
  }
  return "Realistic middle-class environment, authentic textures, no studio perfection.";
};

/**
 * Generates a unique persona description for a man to ensure variety.
 */
const getManPersona = (ageGroup: string, index: number): string => {
  const physiques = ["Average build", "Slightly muscular but realistic", "Round tummy (dad bod)", "Tall and lean", "Stocky and broad-shouldered"];
  const hairStyles = ["Short black hair", "Buzz cut", "Slightly balding", "Greyish hair", "Brown hair", "Messy casual hair"];
  const features = ["glasses", "trimmed beard", "stubble", "clean-shaven", "friendly smile"];

  const physique = physiques[index % physiques.length];
  const hair = hairStyles[(index + 1) % hairStyles.length];
  const feature = features[(index + 2) % features.length];

  return `${physique}, ${hair}, ${feature}. Not a professional model.`;
};

export const generateReviewImages = async (
  base64Image: string,
  mimeType: string,
  settings: ReviewSettings,
  lang: Language
): Promise<GeneratedImage[]> => {
  const cleanBase64 = stripBase64Header(base64Image);
  
  const promises = settings.situations.map(async (situation, index): Promise<GeneratedImage | null> => {
    try {
      let appearance = "SLAVIC (Ukrainian) ethnicity.";
      let region = "Ukraine";
      if (settings.reviewLanguage === 'en') {
        appearance = "Western (American/European) ethnicity.";
        region = "USA/Europe";
      }

      const envDetails = getLocationDetails(situation);
      const manPersona = getManPersona(settings.age, index);

      const imagePromptText = `
        STYLE: RAW CANDID SMARTPHONE PHOTO for a product review. 
        SITUATION: A real man is ${situation}.
        LOCATION/ENVIRONMENT: ${envDetails} 
        
        SUBJECT: 
        - A MAN, ${settings.age} years old. 
        - ETHNICITY: ${appearance}
        - PERSONA: ${manPersona}
        - HE IS WEARING THE EXACT CLOTHING FROM THE SOURCE IMAGE.
        - The clothing is the main focus but fits naturally in the scene.
        
        PHOTO QUALITY: 
        - Amateur composition. 
        - Shot on iPhone/Android. 
        - Slightly soft focus on background. 
        - No professional studio lights, no white background, no modeling poses.
        
        FORMAT: Vertical 3:4 portrait.
      `;

      const textPromptText = `
        Write a short, realistic 5-star customer review (1-2 sentences) in ${settings.reviewLanguage === 'uk' ? 'Ukrainian' : settings.reviewLanguage === 'ru' ? 'Russian' : 'English'}. 
        Subject: A ${settings.age} year old man who is ${situation} and happy with the garment quality. 
        Tone: Genuine customer, practical, informal.
        ONLY output the review text.
      `;

      const imgResp = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType } },
            { text: imagePromptText },
          ],
        },
        config: { 
          imageConfig: { aspectRatio: "3:4" },
          temperature: 0.9 // Higher temperature for better variety in personas and backgrounds
        }
      });

      const txtResp = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: textPromptText,
      });

      let imageUrl = '';
      const parts = imgResp.candidates?.[0]?.content?.parts;
      if (parts) {
        for (const p of parts) {
          if (p.inlineData) imageUrl = `data:${p.inlineData.mimeType};base64,${p.inlineData.data}`;
        }
      }

      if (!imageUrl) return null;

      return {
        id: `review-${index}-${Date.now()}`,
        url: imageUrl,
        type: 'review',
        description: situation,
        textReview: txtResp.text?.trim() || "Great quality!",
        correctionCount: 0
      };
    } catch (error) {
      console.error("Error generating review image:", error);
      return null;
    }
  });

  const results = await Promise.all(promises);
  return results.filter((res): res is GeneratedImage => res !== null);
};
