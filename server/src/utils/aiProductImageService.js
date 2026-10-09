import MasterProduct from "../models/MasterProduct.js";
import uploadToCloudinary from "./uploadToCloudinary.js";

/**
 * Intelligent AI product image generation & catalog matching service.
 * Sourced to accurately depict the uploaded product with realistic commercial packaging.
 */
export const generateOrMatchProductImage = async ({
  name,
  description,
  brand,
  category,
  variant,
  packSize,
  barcode,
  forceAi = false,
}) => {
  const cleanName = String(name || "").trim();
  const cleanDescription = String(description || "").trim();
  const cleanBrand = String(brand || "").trim();
  const cleanCategory = String(category || "").trim();
  const cleanVariant = String(variant || "").trim();
  const cleanPackSize = String(packSize || "").trim();
  const cleanBarcode = String(barcode || "").trim();

  // Helper: check if a catalog image is merely an Unsplash stock placeholder or generic dummy
  const isGenericStockImage = (url) => {
    if (!url || typeof url !== "string") return true;
    const lower = url.toLowerCase();
    return (
      lower.includes("unsplash.com") ||
      lower.includes("via.placeholder") ||
      lower.includes("placeholder") ||
      lower.includes("picsum.photos") ||
      lower.includes("dummyimage")
    );
  };

  // 1. TIER 1: Check Master Product Catalog for verified authentic photo
  // Only accept verified CDN/Cloudinary images, not placeholder Unsplash stock images
  if (!forceAi && (cleanBarcode || cleanName)) {
    if (cleanBarcode) {
      const barcodeMatch = await MasterProduct.findOne({
        barcode: cleanBarcode,
        imageUrl: { $exists: true, $ne: "" },
      });
      if (barcodeMatch?.imageUrl && !isGenericStockImage(barcodeMatch.imageUrl)) {
        return {
          url: barcodeMatch.imageUrl,
          source: "catalog_verified",
          matchedName: barcodeMatch.name,
        };
      }
    }

    // Try exact name match
    const exactNameMatch = await MasterProduct.findOne({
      name: new RegExp(`^${cleanName}$`, "i"),
      imageUrl: { $exists: true, $ne: "" },
    });
    if (exactNameMatch?.imageUrl && !isGenericStockImage(exactNameMatch.imageUrl)) {
      return {
        url: exactNameMatch.imageUrl,
        source: "catalog_verified",
        matchedName: exactNameMatch.name,
      };
    }
  }

  // 2. TIER 2: Intelligent Product Image Generation Using Product Name & Description
  // Build a clean, precise packaging prompt matching the exact product name and seller description
  let subject = cleanName;
  if (
    cleanBrand &&
    !cleanName.toLowerCase().includes(cleanBrand.toLowerCase()) &&
    cleanBrand.toLowerCase() !== "local brand" &&
    cleanBrand.toLowerCase() !== "local / homemade"
  ) {
    subject = `${cleanBrand} ${subject}`;
  }
  if (cleanVariant && !cleanName.toLowerCase().includes(cleanVariant.toLowerCase())) {
    subject = `${subject} ${cleanVariant}`;
  }
  if (cleanPackSize && !cleanName.toLowerCase().includes(cleanPackSize.toLowerCase())) {
    subject = `${subject} ${cleanPackSize}`;
  }

  const promptParts = [];
  promptParts.push(`${subject} packaging`);

  // Product Description: Core visual appearance details specified by seller
  if (cleanDescription) {
    const sanitizedDesc = cleanDescription
      .replace(/[\r\n]+/g, " ")
      .replace(/["'`;]/g, "")
      .replace(/[^\w\s.,%()/-]/g, "")
      .trim()
      .slice(0, 180);

    if (sanitizedDesc) {
      promptParts.push(sanitizedDesc);
    }
  }

  if (cleanCategory && !subject.toLowerCase().includes(cleanCategory.toLowerCase())) {
    promptParts.push(`${cleanCategory} retail product`);
  }

  promptParts.push("retail product packaging photo, centered, clean white background");

  const prompt = promptParts.join(", ");

  const fetchImageWithPrompt = async (promptText) => {
    const encodedPrompt = encodeURIComponent(promptText);
    const seed = Math.floor(Math.random() * 800000) + 100000;
    const pollUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=512&height=512&nologo=true&seed=${seed}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(pollUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent": "ShopLocal-AI-Product-Image-Engine/1.0",
          Accept: "image/*",
        },
      });
      clearTimeout(timeoutId);
      return response;
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  };

  try {
    let response = await fetchImageWithPrompt(prompt);

    // If initial fetch failed, attempt fallback prompt with name and description
    if (!response.ok) {
      await new Promise((r) => setTimeout(r, 1500));
      const fallbackDesc = cleanDescription ? cleanDescription.slice(0, 80) : "";
      const fallbackPrompt = `${cleanName} packaging${fallbackDesc ? `, ${fallbackDesc}` : ""}, retail product photo, white background`;
      response = await fetchImageWithPrompt(fallbackPrompt);
    }

    // Fallback 2: Trademark-sanitized prompt in case a brand name triggered a filter
    if (!response.ok) {
      await new Promise((r) => setTimeout(r, 1500));
      const sanitizedName = cleanName
        .replace(/\b(maggi|nestle|coca-cola|pepsi|cadbury)\b/gi, (m) => {
          const map = {
            maggi: "instant noodles",
            nestle: "dairy grocery",
            "coca-cola": "cola beverage",
            pepsi: "cola beverage",
            cadbury: "chocolate bar",
          };
          return map[m.toLowerCase()] || "grocery product";
        });
      const fallback2Prompt = `${sanitizedName} packaging packet, clean white background, product photo`;
      response = await fetchImageWithPrompt(fallback2Prompt);
    }

    if (!response.ok) {
      throw new Error(`AI generation service returned status ${response.status}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);

    if (imageBuffer.length < 1000) {
      throw new Error("Received incomplete or invalid image from AI service");
    }

    // Upload to Cloudinary for permanent high-speed CDN delivery
    const uploadResult = await uploadToCloudinary(
      imageBuffer,
      "shoplocal/ai-products",
    );

    // If an exact name match exists in master catalog, upgrade it with the new authentic photo
    try {
      await MasterProduct.updateOne(
        {
          name: new RegExp(`^${cleanName}$`, "i"),
          $or: [
            { imageUrl: { $exists: false } },
            { imageUrl: "" },
            { imageUrl: { $regex: /unsplash|placeholder/i } },
          ],
        },
        { $set: { imageUrl: uploadResult.url } },
      );
    } catch (dbErr) {
      // Non-blocking
    }

    return {
      url: uploadResult.url,
      source: "ai_generated",
      promptUsed: prompt,
      publicId: uploadResult.publicId,
    };
  } catch (error) {
    clearTimeout(timeoutId);
    console.error("AI image generation error:", error.message);
    throw new Error(
      `Failed to generate AI product image: ${error.message || "Service unavailable"}`,
    );
  }
};

export default generateOrMatchProductImage;
