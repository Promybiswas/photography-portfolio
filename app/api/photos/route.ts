import { NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";

const GALLERY_PATH = "data/gallery.json";

export async function GET() {
  try {
    const galleryPath = path.join(process.cwd(), GALLERY_PATH);
    const raw = await readFile(galleryPath, "utf-8");
    const gallery = JSON.parse(raw);
    return NextResponse.json(gallery);
  } catch (err) {
    console.error("Photos list error:", err);
    return NextResponse.json([], { status: 200 });
  }
}
