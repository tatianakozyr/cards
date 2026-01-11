
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
    type: 'flatlay-gym',
    key: 'flatlayGym',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: flat lay with training sneakers, sports bottle, and towel. Background: dark grey concrete gym floor. High contrast lighting. Authentic athletic vibe."
  },
  {
    category: 'flatlay',
    type: 'flatlay-street',
    key: 'flatlayStreet',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: street/chunky sneakers, baseball cap, and over-ear headphones. Background: cold grey asphalt. Urban sport style, cool neutral tones."
  },
  {
    category: 'flatlay',
    type: 'flatlay-running',
    key: 'flatlayRunning',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: lightweight running shoes, sports watch, and headband/buff. Background: matte light grey studio surface. Breathable and movement-oriented atmosphere."
  },
  {
    category: 'flatlay',
    type: 'flatlay-cold',
    key: 'flatlayCold',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: winter training gloves, neck buff, and a metal thermos. Background: dark graphite concrete. Cold-weather training theme."
  },
  {
    category: 'flatlay',
    type: 'flatlay-home',
    key: 'flatlayHome',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: fitness resistance bands, bottle of water, and a sports timer/watch. Background: warm natural wood surface. Home discipline theme."
  },
  {
    category: 'flatlay',
    type: 'flatlay-minimal',
    key: 'flatlayMinimal',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: minimal sneakers, sleek digital watch, and a smartphone. Background: perfectly clean solid grey surface. Functional and modern aesthetic."
  },
  {
    category: 'flatlay',
    type: 'flatlay-outdoor',
    key: 'flatlayOutdoor',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: trail running shoes, folded lightweight windbreaker, and an outdoor flask. Background: dark wood and natural stone elements. Wilderness and freedom theme."
  },
  {
    category: 'flatlay',
    type: 'flatlay-power',
    key: 'flatlayPower',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: weightlifting straps/gloves, protein shaker, and a rugged watch. Background: industrial rough concrete. Strength and power vibe."
  },
  {
    category: 'flatlay',
    type: 'flatlay-after',
    key: 'flatlayAfter',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: folded towel, thermos, and sneakers. Background: warm grey-brown aesthetic surface. Recovery and post-training calm theme."
  },
  {
    category: 'flatlay',
    type: 'flatlay-active',
    key: 'flatlayActive',
    text: "Professional 1:1 SQUARE flatlay. The central focus is the GARMENT. Composition: lifestyle sneakers, urban backpack, and wireless headphones. Background: city urban concrete. All-day active movement theme."
  },
  {
    category: 'macro',
    type: 'macro-collar',
    key: 'macroCollar',
    text: "1:1 SQUARE MACRO CLOSE-UP. COLLAR detail. Sharp stitching."
  },
  {
    category: 'macro',
    type: 'macro-fastener',
    key: 'macroFastener',
    text: "1:1 SQUARE MACRO CLOSE-UP. FASTENER detail, buttons or zipper. High precision."
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
    category: 'macro',
    type: 'macro-fabric',
    key: 'macroFabric',
    text: "1:1 SQUARE MACRO CLOSE-UP. Extreme focus on the MAIN FABRIC TEXTURE and weave pattern. Show the high quality of the material and fiber detail."
  },
  {
    category: 'macro',
    type: 'macro-lining',
    key: 'macroLining',
    text: "1:1 SQUARE MACRO CLOSE-UP. Focus on the INTERNAL LINING fabric. Show the inside detail, stitching of the lining, and inner material texture."
  },
  {
    category: 'mannequin',
    type: 'mannequin-far',
    key: 'mannequinFar',
    text: "Professional 1:1 SQUARE ghost mannequin product photo. FRONT VIEW, ONLY the garment is visible, floating in the air. Remote full shot of the entire garment. Perfectly centered. NO body parts, NO face, NO hands, NO shoes, NO mannequin stand. Purely the garment alone. Clean white studio background. Sharp shadows."
  },
  {
    category: 'mannequin',
    type: 'mannequin-close',
    key: 'mannequinClose',
    text: "Professional 1:1 SQUARE ghost mannequin product photo. FRONT VIEW, close-up zoomed shot of the garment torso, floating in air. ONLY the garment is visible. NO body parts, NO shoes, NO mannequin visible. High fabric detail. Clean white background."
  },
  {
    category: 'mannequin',
    type: 'mannequin-angle',
    key: 'mannequinAngle',
    text: "Professional 1:1 SQUARE ghost mannequin product photo. 3/4 TURN ANGLE VIEW, close-up zoomed shot of the garment floating in the air. ONLY the garment is visible. NO body parts, NO shoes, NO accessories, NO mannequin visible. Clean white studio background."
  },
  {
    category: 'nature',
    type: 'nature-1',
    key: 'nature1',
    text: "Professional 1:1 SQUARE outdoor product shot. The GARMENT is laid flat on FRESH GREEN GRASS. Clean composition. NO person, NO mannequin, NO body parts. Pure product photography in nature. Soft daylight."
  },
  {
    category: 'nature',
    type: 'nature-2',
    key: 'nature2',
    text: "Professional 1:1 SQUARE outdoor product shot. The GARMENT is laid flat on GREY CRUSHED STONE / GRAVEL. NO person, NO mannequin, NO body parts. Rugged and authentic texture focus. Sharp shadows."
  },
  {
    category: 'nature',
    type: 'nature-3',
    key: 'nature3',
    text: "Professional 1:1 SQUARE outdoor product shot. The GARMENT is laid flat on a slab of DARK SLATE or textured rock. NO person, NO mannequin, NO body parts. High-end natural aesthetic. Moody lighting."
  },
  {
    category: 'promo',
    type: 'promo-1',
    key: 'promo1',
    text: "COMMERCIAL AD: Lifestyle (Urban). 1:1 SQUARE. A charismatic man of UKRAINIAN appearance wearing this exact garment. Sitting in a modern cafe or walking in a Kyiv-style contemporary urban setting. Realistic lifestyle context. COMPOSITION: Leave a clear SAFE ZONE (empty space) on the left side for marketing text. High quality, authentic colors."
  },
  {
    category: 'promo',
    type: 'promo-2',
    key: 'promo2',
    text: "COMMERCIAL AD: Minimalist Studio. 1:1 SQUARE. Premium fashion aesthetic. Clean centered shot of a UKRAINIAN model wearing the garment. Background: solid light neutral grey or beige. Soft diffused lighting, minimal shadows. COMPOSITION: Balanced with space at the top for a brand logo. Elegant and high-end look."
  },
  {
    category: 'promo',
    type: 'promo-3',
    key: 'promo3',
    text: "COMMERCIAL AD: Dynamic Action. 1:1 SQUARE. UKRAINIAN model in a dynamic pose (walking fast or jumping). Background has subtle MOTION BLUR. Highlight the movement of the fabric. COMPOSITION: Subject shifted to the right, leaving a SAFE ZONE on the left for a 'LIMITED OFFER' text overlay. Energetic vibe."
  },
  {
    category: 'promo',
    type: 'promo-4',
    key: 'promo4',
    text: "COMMERCIAL AD: Texture & Material. 1:1 SQUARE. A sophisticated artistic composition showing a close-up detail of the fabric texture (stitching, weave) blended with a full view of the garment on a man. Focus on premium quality materials. Studio lighting highlighting fibers. COMPOSITION: Clear space for a 'QUALITY GUARANTEED' seal."
  },
  {
    category: 'promo',
    type: 'promo-5',
    key: 'promo5',
    text: "COMMERCIAL AD: Editorial / High Fashion. 1:1 SQUARE. Bold and trendy журнальна стилістика. UKRAINIAN model. Hard lighting with deep shadows. Creative camera angle (low angle). Background: textured concrete or bold contrast color. COMPOSITION: Edgy layout, leave space at the bottom for an 'AUTUMN COLLECTION' title."
  },
  {
    category: 'promo',
    type: 'promo-6',
    key: 'promo6',
    text: "COMMERCIAL AD: Thematic Environment. 1:1 SQUARE. Atmospheric scene matching the garment's purpose. If it's warm: cold blue tones, frost/pine background. If it's light: warm sunny backyard or industrial interior. Use natural elements (wood/stone). COMPOSITION: Wide shot, man is part of the environment. Safe zone for call-to-action button."
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

  const promises = configToRun.map(async (promptData, index): Promise<GeneratedImage | null> => {
    try {
      let finalPrompt = promptData.text;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: {
          parts: [
            { inlineData: { data: cleanBase64, mimeType: mimeType } },
            { text: finalPrompt },
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
      const description = t.prompts[promptData.key as keyof typeof t.prompts] || promptData.key;

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

  const contents = {
    parts: [
      { text: "This is the source garment for reference:" },
      { inlineData: { data: cleanSource, mimeType: sourceMimeType } },
      { text: "This is the current image that needs fixing:" },
      { inlineData: { data: cleanCurrent, mimeType: 'image/png' } },
      { 
        text: `USER INSTRUCTION: ${userFeedback}. 
        Keep the garment from the first reference image identical. 
        Modify the second image (current image) strictly following the user instruction. 
        Focus on background, lighting, or atmosphere changes while preserving the product details.` 
      },
    ]
  };

  try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image', 
        contents: contents,
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
    console.error("Single image edit failed:", error);
    throw error;
  }
};

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

const getManPersona = (ageGroup: string, index: number): string => {
  const physiques = ["Average build", "Slightly muscular but realistic", "Round tummy (dad bod)", "Tall and lean", "Stocky and broad-supported"];
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
          temperature: 0.9 
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
