"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function UploadPhotos() {
  const [files, setFiles] = useState<File[]>([]);
  const [titles, setTitles] = useState<Record<number, string>>({});
  const [status, setStatus] = useState<"idle" | "uploading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function onSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = Array.from(e.target.files ?? []);
    const allowed = selected.filter(
      (f) => f.type.startsWith("image/") && f.size <= 10 * 1024 * 1024
    );
    setFiles((prev) => [...prev, ...allowed]);
    setTitles((prev) => {
      const next = { ...prev };
      allowed.forEach((_, i) => {
        const idx = Object.keys(prev).length + i;
        next[idx] = next[idx] ?? selected[i]?.name?.replace(/\.[^.]+$/, "") ?? "";
      });
      return next;
    });
    setStatus("idle");
    if (inputRef.current) inputRef.current.value = "";
  }

  function remove(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setTitles((prev) => {
      const next = { ...prev };
      delete next[index];
      return next;
    });
  }

  async function upload() {
    if (!files.length) {
      setMessage("Select at least one image.");
      setStatus("error");
      return;
    }
    setStatus("uploading");
    setMessage("");
    const formData = new FormData();
    files.forEach((f) => formData.append("files", f));
    files.forEach((_, i) => formData.append("titles", titles[i] ?? files[i].name ?? ""));
    try {
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) {
        setMessage(data.error ?? "Upload failed");
        setStatus("error");
        return;
      }
      setMessage(`Uploaded ${data.added?.length ?? 0} photo(s).`);
      setStatus("success");
      setFiles([]);
      setTitles({});
      router.refresh();
    } catch {
      setMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <section className="mt-8 rounded-xl border border-[var(--border)] bg-white/50 p-6">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-[var(--foreground)]">
        Upload photos
      </h2>
      <p className="mt-1 text-sm text-[var(--muted)]">
        JPEG, PNG, WebP or GIF. Max 10MB per file.
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        multiple
        onChange={onSelect}
        className="mt-4 block w-full text-sm text-[var(--muted)] file:mr-4 file:rounded-full file:border-0 file:bg-[var(--foreground)] file:px-4 file:py-2 file:text-sm file:font-medium file:text-[var(--background)] file:hover:opacity-90"
      />
      {files.length > 0 && (
        <ul className="mt-4 space-y-2">
          {files.map((file, i) => (
            <li key={`${file.name}-${i}`} className="flex items-center gap-3 text-sm">
              <span className="min-w-0 flex-1 truncate text-[var(--foreground)]">{file.name}</span>
              <input
                type="text"
                placeholder="Title (optional)"
                value={titles[i] ?? ""}
                onChange={(e) => setTitles((p) => ({ ...p, [i]: e.target.value }))}
                className="w-40 rounded border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => remove(i)}
                className="text-[var(--muted)] hover:text-red-600"
                aria-label="Remove"
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
      {files.length > 0 && (
        <button
          type="button"
          onClick={upload}
          disabled={status === "uploading"}
          className="mt-4 rounded-full bg-[var(--foreground)] px-6 py-2 text-sm font-medium text-[var(--background)] hover:opacity-90 disabled:opacity-60"
        >
          {status === "uploading" ? "Uploading…" : "Upload"}
        </button>
      )}
      {message && (
        <p
          className={`mt-3 text-sm ${status === "error" ? "text-red-600" : "text-[var(--muted)]"}`}
        >
          {message}
        </p>
      )}
    </section>
  );
}
