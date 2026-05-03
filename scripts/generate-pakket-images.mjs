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
      "A cute smiling baby (around 1 year old) sitting on a soft play mat, happily playing with colorful soft toys and rattles. Warm pastel colors, soft lighting, photorealistic style, cheerful and inviting, white background with subtle pastel elements.",
  },
  {
    filename: "jongens-3-5-jaar.png",
    prompt:
      "A happy energetic boy around 4 years old, playing with toy cars and building blocks on the floor, big smile, wearing casual clothes. Bright cheerful colors, photorealistic style, warm inviting lighting, white or light background.",
  },
  {
    filename: "jongens-6-8-jaar.png",
    prompt:
      "A cool boy around 7 years old, enthusiastically playing with an adventure action figure set or Lego construction set, excited expression, wearing casual clothes. Dynamic composition, bright colors, photorealistic style, light background.",
  },
  {
    filename: "meisjes-3-5-jaar.png",
    prompt:
      "A sweet girl around 4 years old, playing with colorful creative toys like building blocks or a toy kitchen, big happy smile, wearing a cute outfit. Bright pink and purple tones, photorealistic style, warm soft lighting, light background.",
  },
  {
    filename: "meisjes-6-8-jaar.png",
    prompt:
      "A stylish girl around 7 years old, happily playing with creative arts and crafts toys or a jewelry making kit, smiling and engaged, wearing a trendy casual outfit. Soft purple and pink tones, photorealistic style, bright warm lighting, light background.",
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
