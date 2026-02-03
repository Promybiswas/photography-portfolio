import Image from "next/image";

export const metadata = {
  title: "About | Photography Portfolio",
  description: "Learn about the photographer behind the lens.",
};

export default function About() {
  return (
    <div className="mx-auto max-w-4xl px-6 py-16 md:py-24">
      <div className="grid gap-12 md:grid-cols-2 md:items-center">
        <div className="relative aspect-[3/4] overflow-hidden rounded-lg">
          <Image
            src="/Photos/IMG_1247.jpg"
            alt="Promy"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>
        <div className="space-y-4">
          <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
            Hi I&apos;m Promy
          </h1>
          <p className="leading-relaxed text-[var(--foreground)]">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor
            incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud
            exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
          </p>
        </div>
      </div>
    </div>
  );
}
