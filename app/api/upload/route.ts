import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getSupabase } from "@/lib/supabase";

const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const BUCKET_NAME = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "photos";

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80) || "image";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const titles = formData.getAll("titles") as string[];

    if (!files?.length) {
      return NextResponse.json({ error: "No files provided" }, { status: 400 });
    }

    const added: { src: string; title: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file?.size) continue;

      // Validate file
      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          {
            error: `File "${file.name}" has unsupported type. Use JPEG, PNG, WebP, or GIF.`,
          },
          { status: 400 }
        );
      }

      // Prepare file name
      const ext = file.name.split(".").pop() || "jpg";
      const base = sanitize(file.name.replace(/\.[^/.]+$/, ""));
      const uniqueName = `${base}_${Date.now()}_${i}.${ext}`;

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await getSupabase().storage
        .from(BUCKET_NAME)
        .upload(uniqueName, file, { cacheControl: "3600", upsert: false });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: publicUrlData } = getSupabase().storage
        .from(BUCKET_NAME)
        .getPublicUrl(uniqueName);

      const title = (titles[i]?.toString() || base).trim() || `Photo ${i + 1}`;

      // Insert into gallery table
      const { error: insertError } = await getSupabase()
        .from("gallery")
        .insert([{ src: publicUrlData.publicUrl, title }]);

      if (insertError) throw insertError;

      added.push({ src: publicUrlData.publicUrl, title });
    }

    revalidatePath("/portfolio");
    return NextResponse.json({ success: true, added });
  } catch (err) {
    console.error("Upload error:", err);
    const message =
      err && typeof err === "object" && "message" in err
        ? String((err as { message: string }).message)
        : "Upload failed";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}

