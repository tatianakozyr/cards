import { GoogleGenAI } from "@google/genai";
import { GeneratedImage, Language } from "../types";
import { translations } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip the data:image/...;base64, prefix
const stripBase64Header = (base64: string): string => {
  return base64.split(',')[1] || base64;
};

// We store prompt keys to map them to translations later
const PROMPTS_CONFIG = [
  {
    type: 'model',
    key: 'model',
    text: "Generate a professional FULL-BODY fashion photography shot of a model wearing this exact clothing item. Viewpoint: Front view. IMPORTANT: The model's face must NOT be visible (crop just below nose). The frame MUST include the model's feet and shoes. Do not cut off legs. Focus entirely on how the clothes fit. The background should be neutral studio lighting. Keep the exact color, pattern, and shape of the clothing from the reference image. High resolution."
  },
  {
    type: 'flatlay',
    key: 'flatlay',
    text: "Generate a professional flat lay photograph of this exact clothing item. Viewpoint: Directly from above (90 degrees). The item must be laid out completely FLAT on a surface, as if carefully arranged before packaging. It must look 2D and neat. CRITICAL: 1) The entire item must be clearly visible and centered. 2) STRICTLY PRESERVE THE ORIGINAL CUT AND STYLE. Do not change sleeve length, neck shape, or fit. 3) Use a contrasting background to make the item pop. 4) Add minimal, high-end decor (like a simple branch or stone) on the periphery to enhance the aesthetic without distracting from the clothes. Bright studio lighting."
  },
  {
    type: 'mannequin',
    key: 'mannequin',
    text: "Generate a 'ghost mannequin' effect image of this exact clothing item. Viewpoint: 3/4 turned angle (semi-profile). The clothes should appear 3D and voluminous as if worn by an invisible person, floating in the air against a clean, subtle gradient background. Emphasize the cut and fit from this semi-turned perspective. Do not change the color or texture of the item."
  },
  {
    type: 'creative',
    key: 'creativeDetails',
    text: "Generate a stunning, creative product advertisement image for this clothing item. Viewpoint: Close-up side angle / Macro shot. Focus on high-quality details, fabric texture, and craftsmanship. Use dramatic lighting to make the product look expensive. Keep the clothing exactly as is. Cinematic quality."
  },
  {
    type: 'creative',
    key: 'creativeLifestyle',
    text: "Generate a vibrant lifestyle image featuring this clothing item in a natural setting. Viewpoint: Dynamic candid angle, capturing movement. The focus must remain on the product. Ensure the colors pop and contrast well. Keep the clothing authentic to the reference."
  }
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
        model: 'gemini-2.5-flash-image', // Using the standard image generation/editing model
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
        throw new Error("No image data returned");
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