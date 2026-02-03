import { NextResponse } from "next/server";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

const PHOTOS_DIR = "public/Photos";
const GALLERY_PATH = "data/gallery.json";
const MAX_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9.-]/g, "_").slice(0, 80) || "image";
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const files = formData.getAll("files") as File[];
    const titles = formData.getAll("titles") as string[];

    if (!files?.length) {
      return NextResponse.json(
        { error: "No files provided" },
        { status: 400 }
      );
    }

    const cwd = process.cwd();
    const photosDir = path.join(cwd, PHOTOS_DIR);

    await mkdir(photosDir, { recursive: true });

    const galleryPath = path.join(cwd, GALLERY_PATH);
    let gallery: { src: string; title: string }[] = [];
    try {
      const raw = await readFile(galleryPath, "utf-8");
      gallery = JSON.parse(raw);
    } catch {
      gallery = [];
    }

    const added: { src: string; title: string }[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!file?.size) continue;

      if (file.size > MAX_SIZE) {
        return NextResponse.json(
          { error: `File "${file.name}" exceeds 10MB limit` },
          { status: 400 }
        );
      }
      if (!ALLOWED_TYPES.includes(file.type)) {
        return NextResponse.json(
          { error: `File "${file.name}" has unsupported type. Use JPEG, PNG, WebP, or GIF.` },
          { status: 400 }
        );
      }

      const ext = path.extname(file.name) || ".jpg";
      const base = sanitize(path.basename(file.name, ext));
      const unique = `${base}_${Date.now()}_${i}${ext}`;
      const filePath = path.join(photosDir, unique);

      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);
      await writeFile(filePath, buffer);

      const src = `/Photos/${unique}`;
      const title = (titles[i]?.toString() || base).trim() || `Photo ${gallery.length + 1}`;
      gallery.push({ src, title });
      added.push({ src, title });
    }

    await writeFile(galleryPath, JSON.stringify(gallery, null, 2), "utf-8");

    return NextResponse.json({ success: true, added });
  } catch (err) {
    console.error("Upload error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Upload failed" },
      { status: 500 }
    );
  }
}
