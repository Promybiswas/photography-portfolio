"use client";

import { useState } from "react";

const inputClass =
  "mt-2 w-full rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]";
const labelClass = "block text-sm font-medium text-[var(--foreground)]";

export default function Contact() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    setErrorMessage("");
    const form = e.currentTarget;
    const formData = new FormData(form);
    const preferredDate = formData.get("preferredDate");
    const body = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone") || null,
      location: formData.get("location") || null,
      preferred_date: preferredDate || null,
      message: formData.get("message"),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMessage(data.error ?? "Something went wrong");
        setStatus("error");
        return;
      }
      setStatus("sent");
    } catch {
      setErrorMessage("Network error. Please try again.");
      setStatus("error");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <h1 className="font-serif text-4xl font-semibold tracking-tight text-[var(--foreground)] md:text-5xl">
        Contact
      </h1>
      <p className="mt-4 text-[var(--muted)]">
        For commissions, print inquiries, or collaborations. I&apos;ll get back to you as soon as possible.
      </p>

      <form onSubmit={handleSubmit} className="mt-12 space-y-6">
        <div>
          <label htmlFor="name" className={labelClass}>
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className={inputClass}
            placeholder="Your name"
          />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className={inputClass}
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>
            Phone
          </label>
          <input
            id="phone"
            name="phone"
            type="tel"
            className={inputClass}
            placeholder="Your phone number"
          />
        </div>
        <div>
          <label htmlFor="location" className={labelClass}>
            Location
          </label>
          <input
            id="location"
            name="location"
            type="text"
            className={inputClass}
            placeholder="Your location"
          />
        </div>
        <div>
          <label htmlFor="preferred-date" className={labelClass}>
            Preferred date
          </label>
          <input
            id="preferred-date"
            name="preferredDate"
            type="date"
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="message" className={labelClass}>
            Message
          </label>
          <textarea
            id="message"
            name="message"
            required
            rows={5}
            className={inputClass}
            placeholder="Tell me about your project or inquiry..."
          />
        </div>

        <div className="flex justify-center pt-2">
          <button
            type="submit"
            disabled={status === "sending"}
            className="rounded-full bg-[var(--foreground)] px-8 py-3 text-sm font-medium text-[var(--background)] transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {status === "sending"
              ? "Sending..."
              : status === "sent"
                ? "Message sent"
                : "Send message"}
          </button>
        </div>
        {status === "sent" && (
          <p className="text-center text-sm text-[var(--muted)]">
            Thanks! I&apos;ll be in touch soon.
          </p>
        )}
        {status === "error" && errorMessage && (
          <p className="text-center text-sm text-red-600">{errorMessage}</p>
        )}
      </form>
    </div>
  );
}
