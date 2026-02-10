"use client";

import { useState } from "react";
import Image from "next/image";

type GalleryItem = { src: string; title: string };

export default function PortfolioGallery({ gallery }: { gallery: GalleryItem[] }) {
  const [selected, setSelected] = useState<number | null>(null);

  if (gallery.length === 0) {
    return (
      <div className="mt-12 rounded-2xl border border-dashed border-[var(--border)] bg-[var(--background)]/50 py-16 text-center">
        <p className="text-[var(--muted)]">No photos in the gallery yet.</p>
        <p className="mt-1 text-sm text-[var(--muted)]">Upload photos above to see them here.</p>
      </div>
    );
  }

  return (
    <>
      <h2 className="mt-12 font-serif text-2xl font-medium text-[var(--foreground)]">Gallery</h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {gallery.map((item, i) => (
          <button
            type="button"
            key={`${item.src}-${i}`}
            onClick={() => setSelected(i)}
            className="group relative aspect-[4/5] overflow-hidden rounded-lg bg-[var(--border)] text-left"
          >
            <Image
              src={item.src}
              alt={item.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
            <span className="absolute bottom-4 left-4 font-serif text-lg font-medium text-white opacity-0 drop-shadow-lg transition-opacity group-hover:opacity-100">
              {item.title}
            </span>
          </button>
        ))}
      </div>

      {selected !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4"
          onClick={() => setSelected(null)}
          role="dialog"
          aria-modal="true"
          aria-label="View image"
        >
          <button
            type="button"
            onClick={() => setSelected(null)}
            className="absolute left-4 top-4 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Close"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
          <div
            className="relative h-[90vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={gallery[selected].src}
              alt=""
              fill
              className="object-contain"
              sizes="100vw"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </>
  );
}
