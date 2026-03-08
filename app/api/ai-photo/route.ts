import { NextResponse } from "next/server";
import { getSupabaseServer } from "@/lib/supabase-server";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const AI_INPUT_BUCKET = process.env.SUPABASE_AI_INPUT_BUCKET ?? "ai_photo_studio";
const FAL_EDIT_URL = "https://fal.run/fal-ai/nano-banana-pro/edit";

const STYLE_PROMPTS: Record<string, string> = {
  oil: "Transform this photo into an oil painting style.",
  anime: "Transform this photo into anime style.",
  vintage: "Make this photo look vintage and retro.",
  watercolor: "Transform this photo into a watercolor painting.",
  cinematic: "Make this photo look cinematic, like a movie still.",
};

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80) || "image";
}

export async function POST(request: Request) {
  try {
    const supabase = getSupabaseServer();
    const apiKey = process.env.FAL_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "AI photo service is not configured. Add FAL_KEY to .env.local." },
        { status: 500 }
      );
    }

    const formData = await request.formData();
    const image = formData.get("image");
    const mode = formData.get("mode")?.toString() ?? "style";
    const style = formData.get("style")?.toString() ?? "oil";
    const promptInput = formData.get("prompt")?.toString()?.trim() ?? "";

    if (!image || !(image instanceof File) || image.size === 0) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    if (image.size > MAX_SIZE) {
      return NextResponse.json(
        { error: "Image must be under 10MB." },
        { status: 400 }
      );
    }
    if (!ALLOWED_TYPES.includes(image.type)) {
      return NextResponse.json(
        { error: "Use JPEG, PNG, WebP, or GIF." },
        { status: 400 }
      );
    }

    if (mode === "prompt" && !promptInput) {
      return NextResponse.json(
        { error: "Enter a prompt describing how you want to transform the photo." },
        { status: 400 }
      );
    }

    const promptText =
      mode === "prompt" ? promptInput : STYLE_PROMPTS[style] ?? STYLE_PROMPTS.oil;

    // 1. Upload image to Supabase Storage to get a public URL
    const ext = image.name.split(".").pop() || "jpg";
    const base = sanitize(image.name.replace(/\.[^/.]+$/, ""));
    const uniqueName = `ai-input/${base}_${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(AI_INPUT_BUCKET)
      .upload(uniqueName, image, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      console.error("Supabase upload error:", uploadError);
      return NextResponse.json(
        { error: "Failed to upload image. Check that the storage bucket exists and is public." },
        { status: 500 }
      );
    }

    const { data: publicUrlData } = supabase.storage
      .from(AI_INPUT_BUCKET)
      .getPublicUrl(uniqueName);

    const imageUrl = publicUrlData.publicUrl;

    // 2. Call Fal Nano Banana Pro Edit
    const falRes = await fetch(FAL_EDIT_URL, {
      method: "POST",
      headers: {
        Authorization: `Key ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        prompt: promptText,
        image_urls: [imageUrl],
        num_images: 1,
        resolution: "1K",
      }),
    });

    const falData = await falRes.json().catch(() => ({}));

    if (!falRes.ok) {
      const msg =
        falData?.detail ?? falData?.message ?? falData?.error ?? "AI editing failed.";
      return NextResponse.json(
        { error: typeof msg === "string" ? msg : "AI editing failed. Try again." },
        { status: 502 }
      );
    }

    // 3. Get result image URL (Fal may return images[0].url or similar)
    const resultImage =
      falData?.images?.[0] ?? falData?.image ?? falData?.data?.images?.[0];
    const resultUrl =
      typeof resultImage === "string"
        ? resultImage
        : resultImage?.url ?? resultImage?.content;

    if (!resultUrl) {
      return NextResponse.json(
        { error: "No image returned from AI. Try a different prompt or image." },
        { status: 502 }
      );
    }

    // If Fal returns base64, we'd need to upload to Supabase and return that URL.
    // Most Fal edit APIs return a URL.
    const finalUrl =
      typeof resultUrl === "string" && resultUrl.startsWith("data:")
        ? resultUrl
        : resultUrl;

    return NextResponse.json({
      success: true,
      resultUrl: finalUrl,
      message: "Your AI photo is ready.",
    });
  } catch (err) {
    console.error("AI photo error:", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Something went wrong. Try again.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
