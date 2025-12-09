import { GoogleGenAI } from "@google/genai";
import { GeneratedImage, Language } from "../types";
import { translations } from "../translations";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to strip the data:image/...;base64, prefix
const stripBase64Header = (base64: string): string => {
  return base64.split(',')[1] || base64;
};

// We store prompt keys to map them to translations later
// Moved outside so it can be accessed by both functions
export const PROMPTS_CONFIG = [
  {
    type: 'model',
    key: 'model',
    text: "Generate a professional FULL-BODY fashion photography shot of a model wearing this exact clothing item. Viewpoint: Front view. IMPORTANT: The model's face must NOT be visible (crop just below nose). The frame MUST include the model's feet and shoes. Do not cut off legs. Focus entirely on how the clothes fit. The background should be neutral studio lighting. Keep the exact color, pattern, and shape of the clothing from the reference image. High resolution."
  },
  {
    type: 'flatlay',
    key: 'flatlay',
    text: "Generate a professional STYLED FLAT LAY photograph of this exact clothing item. Viewpoint: Directly from above (90 degrees). The item must be laid out completely FLAT and neat. CRITICAL: 1) Place the item on a CONTRASTING TEXTURED BACKGROUND (such as pastel colored paper, smooth concrete, or warm wood) to make it pop. 2) SURROUND the item with TASTEFUL DECOR ITEMS that match the style (e.g., magazines, dried flowers, sunglasses, coffee cup, or minimal accessories). 3) The clothing must be the clear center of attention. 4) STRICTLY PRESERVE THE ORIGINAL CUT AND STYLE. High-end social media aesthetic."
  },
  {
    type: 'mannequin',
    key: 'mannequin',
    text: "Generate a 'ghost mannequin' effect image of this exact clothing item. Viewpoint: 3/4 turned angle (semi-profile). The clothes should appear 3D and voluminous as if worn by an invisible person, floating in the air against a clean, subtle gradient background. Emphasize the cut and fit from this semi-turned perspective. Do not change the color or texture of the item."
  },
  {
    type: 'creative',
    key: 'creativeDetails',
    text: "Generate a high-end MACRO CLOSE-UP photograph of the specific details of this clothing item. Focus intently on the craftsmanship: show the zipper, the collar texture, the cuff buttons, or the pocket stitching. Viewpoint: Extreme close-up with shallow depth of field (blurred background). Lighting: Soft, directional studio light that reveals the fabric's weave and texture. The goal is to show the premium quality of the materials."
  },
  {
    type: 'creative',
    key: 'creativeLifestyle',
    text: "Generate a professional product photograph of this clothing item MAXIMALLY SPREAD OUT AND UNFOLDED on a natural surface. The setting should be outdoors in nature: placed on smooth river stones, on fresh green grass, or on clean earth. Viewpoint: Top-down or high angle to capture the full shape. The item must NOT be folded; it should be laid flat to show its full cut and silhouette against the natural texture. Lighting: Natural daylight, organic shadows, creating a sustainable and eco-friendly aesthetic. Keep the item's color exact."
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

export const regenerateSingleImage = async (
  base64Image: string,
  mimeType: string,
  imageType: string, // 'model', 'flatlay', etc.
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
    Maintain the same style, lighting, and composition as the intended task, but fix the specific detail mentioned.
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

export const generateProductVideo = async (
  base64Image: string, 
  mimeType: string,
  feedback?: string
): Promise<string | null> => {
  // Always create a new instance right before API call
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const cleanBase64 = stripBase64Header(base64Image);
  
  let prompt = 'Cinematic product review video of this clothing item. The camera pans closely and slowly over the fabric, showing texture, buttons, and stitching details. The item is laid out neatly on a clean, neutral surface or hanging. No people are visible. The camera movement is smooth and professional, highlighting the quality of the garment.';

  if (feedback) {
    prompt = `ORIGINAL VIDEO CONCEPT: ${prompt} 
    USER REVISION REQUEST: ${feedback}
    INSTRUCTION: Generate a new video that follows the original concept but STRICTLY applies the user's revision request.`;
  }

  try {
    let operation = await ai.models.generateVideos({
      model: 'veo-3.1-fast-generate-preview',
      prompt: prompt,
      image: {
        imageBytes: cleanBase64,
        mimeType: mimeType,
      },
      config: {
        numberOfVideos: 1,
        resolution: '720p',
        aspectRatio: '9:16' // Mobile format
      }
    });

    // Polling loop
    while (!operation.done) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // Poll every 5 seconds
      operation = await ai.operations.getVideosOperation({operation: operation});
    }

    const uri = operation.response?.generatedVideos?.[0]?.video?.uri;
    
    // Append API key to the URL as per documentation for Veo
    if (uri && process.env.API_KEY) {
      return `${uri}&key=${process.env.API_KEY}`;
    }
    
    return uri || null;

  } catch (error) {
    console.error("Error generating video:", error);
    return null;
  }
};