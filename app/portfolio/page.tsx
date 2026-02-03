import { readFile } from "fs/promises";
import path from "path";
import UploadPhotos from "./UploadPhotos";
import PortfolioGallery from "./PortfolioGallery";

export const metadata = {
  title: "Portfolio | Photography Portfolio",
  description: "Gallery of fine art and portrait photography.",
};

async function getGallery(): Promise<{ src: string; title: string }[]> {
  try {
    const galleryPath = path.join(process.cwd(), "data", "gallery.json");
    const raw = await readFile(galleryPath, "utf-8");
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default async function Portfolio() {
  const gallery = await getGallery();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
        Portfolio
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        A selection of recent and favorite work.
      </p>

      <UploadPhotos />

      <PortfolioGallery gallery={gallery} />
    </div>
  );
}
