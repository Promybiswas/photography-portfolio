import { getSupabase } from "@/lib/supabase";
import UploadPhotos from "./UploadPhotos";
import PortfolioGallery from "./PortfolioGallery";

export const metadata = {
  title: "Portfolio | Photography Portfolio",
  description: "Gallery of fine art and portrait photography.",
};

export const dynamic = "force-dynamic";

async function getGallery(): Promise<{ src: string; title: string }[]> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("gallery")
    .select("src, title");

  if (error) {
    console.error("Gallery fetch error:", error);
    return [];
  }
  const list = data ?? [];
  return [...list].reverse();
}

export default async function Portfolio() {
  const gallery = await getGallery();

  return (
    <div className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
        Portfolio
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        A selection of recent and favorite work
      </p>

      <UploadPhotos />

      <PortfolioGallery gallery={gallery} />
    </div>
  );
}
