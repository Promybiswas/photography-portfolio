import AIPhotoStudio from "./AIPhotoStudio";

export default function AIPhotoStudioPage() {
  return (
    <section
      className="flex min-h-[calc(100vh-8rem)] items-center justify-center px-6 py-12"
      style={{ background: "var(--background)" }}
    >
      <AIPhotoStudio />
    </section>
  );
}
