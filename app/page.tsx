import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <section className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center bg-white px-4 py-8 text-center">
      <div className="flex flex-col items-center w-full max-w-4xl">
        <div className="relative w-full aspect-[2/1] max-h-[65vh] flex items-center justify-center">
          <Image
            src="/Photos/Logo Design.jpg"
            alt="Logo"
            fill
            className="object-contain"
            priority
            sizes="(max-width: 896px) 100vw, 896px"
          />
        </div>
        <div className="mt-1 flex flex-wrap items-center justify-center gap-4 w-full">
        <Link
          href="/portfolio"
          className="min-w-[200px] rounded-full bg-[var(--foreground)] px-8 py-3 text-center text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
        >
          View Portfolio
        </Link>
        <Link
          href="/contact"
          className="min-w-[200px] rounded-full bg-[var(--foreground)] px-8 py-3 text-center text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90"
        >
          Let&apos;s collaborate
        </Link>
        </div>
      </div>
    </section>
  );
}
