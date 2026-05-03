/**
 * Generates category images for the homepage package cards using Google Gemini Imagen.
 * Run once: node --env-file=.env.local scripts/generate-pakket-images.mjs
 */

import { GoogleGenAI } from "@google/genai";
import { writeFileSync, mkdirSync } from "fs";
import { join } from "path";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const categories = [
  {
    filename: "baby-0-3-jaar.png",
    prompt:
      "Wide landscape photo of an adorable smiling baby (around 1 year old) centered in frame, sitting upright on a soft pastel play mat, both hands holding and playing with colorful soft rattles and plush toys that are clearly visible. Baby's full face and upper body visible. Bright natural light, pastel nursery background, photorealistic, warm and cheerful atmosphere.",
  },
  {
    filename: "jongens-3-5-jaar.png",
    prompt:
      "Wide landscape photo of a happy smiling boy around 4 years old, centered in frame from waist up, actively pushing colorful toy cars and holding building blocks that are clearly visible in his hands. Full face visible with big smile, wearing a casual t-shirt. Bright playroom background, photorealistic, warm cheerful lighting.",
  },
  {
    filename: "jongens-6-8-jaar.png",
    prompt:
      "Wide landscape photo of an excited boy around 7 years old, centered in frame from waist up, holding up and playing with a Lego set or action figures that are clearly visible and prominent in the image. Full face visible with enthusiastic expression, wearing a casual hoodie. Bright playroom background, photorealistic, dynamic and energetic mood.",
  },
  {
    filename: "meisjes-3-5-jaar.png",
    prompt:
      "Wide landscape photo of a cheerful smiling girl around 4 years old, centered in frame from waist up, actively playing with colorful stacking toys or a toy kitchen set that are clearly visible in her hands. Full face visible with big happy smile, wearing a cute pink dress. Bright soft playroom background with pastel colors, photorealistic, warm inviting atmosphere.",
  },
  {
    filename: "meisjes-6-8-jaar.png",
    prompt:
      "Wide landscape photo of a stylish smiling girl around 7 years old, centered in frame from waist up, engaged in creative play with an arts and crafts kit or jewelry making set clearly visible in her hands in front of her. Full face visible with a joyful expression, wearing a trendy casual outfit. Soft purple and pink background tones, photorealistic, bright warm lighting.",
  },
];

const outputDir = join(process.cwd(), "public", "images", "pakketten");
mkdirSync(outputDir, { recursive: true });

for (const cat of categories) {
  console.log(`Generating: ${cat.filename}...`);
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: cat.prompt,
      config: {
        responseModalities: ["IMAGE"],
      },
    });

    const parts = response.candidates?.[0]?.content?.parts ?? [];
    const imagePart = parts.find((p) => p.inlineData);
    if (!imagePart?.inlineData) throw new Error("No image in response");

    const buffer = Buffer.from(imagePart.inlineData.data, "base64");
    writeFileSync(join(outputDir, cat.filename), buffer);
    console.log(`  ✓ Saved ${cat.filename}`);
  } catch (err) {
    console.error(`  ✗ Failed: ${err.message}`);
  }
}

console.log("\nDone! Images saved to public/images/pakketten/");
