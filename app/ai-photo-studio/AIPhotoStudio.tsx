"use client";

import * as React from "react";
import {
  AdvancedChatInput,
  type FileAttachment,
} from "@/components/ui/advanced-ai-chat-input";
import { Button } from "@/components/ui/button";
import { Download, FileText, Paperclip, Upload, X } from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";
const STYLE_OPTIONS = [
  { label: "Oil painting", value: "oil" },
  { label: "Watercolor", value: "watercolor" },
  { label: "Anime", value: "anime" },
  { label: "Vintage", value: "vintage" },
  { label: "Cinematic", value: "cinematic" },
] as const;
type StyleValue = (typeof STYLE_OPTIONS)[number]["value"];

export default function AIPhotoStudio() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const referenceInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = React.useState<"preset" | "custom">("preset");
  const [preset, setPreset] = React.useState<StyleValue>("oil");
  const [customPrompt, setCustomPrompt] = React.useState("");
  const [files, setFiles] = React.useState<FileAttachment[]>([]);
  const [uploadedImage, setUploadedImage] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [successMessage, setSuccessMessage] = React.useState("");
  const [resultUrl, setResultUrl] = React.useState("");

  const handleAddFile = () => referenceInputRef.current?.click();

  const handleRemoveFile = (id: string | number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    if (referenceInputRef.current) {
      referenceInputRef.current.value = "";
    }
  };

  const actionIcons = [
    <Button
      key="attachment"
      type="button"
      variant="ghost"
      aria-label="Attach file"
      onClick={handleAddFile}
      className="gap-2 px-3"
    >
      <Paperclip className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm text-muted-foreground">Add reference</span>
    </Button>,
  ];

  const handleCreateAIImage = async () => {
    if (!uploadedImage) {
      setErrorMessage("Upload an image before generating.");
      setSuccessMessage("");
      return;
    }

    if (activeTab === "custom" && !customPrompt.trim()) {
      setErrorMessage("Enter a custom prompt before generating.");
      setSuccessMessage("");
      return;
    }

    setIsGenerating(true);
    setErrorMessage("");
    setSuccessMessage("");

    try {
      const formData = new FormData();
      formData.append("image", uploadedImage);
      formData.append("mode", activeTab === "custom" ? "prompt" : "style");

      if (activeTab === "custom") {
        formData.append("prompt", customPrompt.trim());
      } else {
        formData.append("style", preset);
      }

      const response = await fetch("/api/ai-photo", {
        method: "POST",
        body: formData,
      });

      const data = (await response.json().catch(() => ({}))) as {
        error?: string;
        message?: string;
        resultUrl?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Failed to generate AI image.");
      }

      setResultUrl(data.resultUrl ?? "");
      setSuccessMessage(data.message ?? "Your AI photo is ready.");
    } catch (error) {
      setResultUrl("");
      setErrorMessage(
        error instanceof Error ? error.message : "Failed to generate AI image."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please upload a JPEG, PNG, WebP or GIF image.");
      setSuccessMessage("");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      setSuccessMessage("");
      return;
    }
    setErrorMessage("");
    setUploadedImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please drop a JPEG, PNG, WebP or GIF image.");
      setSuccessMessage("");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setErrorMessage(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      setSuccessMessage("");
      return;
    }
    setErrorMessage("");
    setUploadedImage(file);
  };

  const openFilePicker = () => fileInputRef.current?.click();
  const handleReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files ?? []);
    if (!selectedFiles.length) return;

    setFiles((prev) => [
      ...prev,
      ...selectedFiles.map((file, index) => ({
        id: `${file.name}-${file.lastModified}-${index}`,
        name: file.name,
        icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      })),
    ]);
  };

  const handleClearImage = () => {
    setUploadedImage(null);
    setResultUrl("");
    setSuccessMessage("");
    setErrorMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleDownloadResult = () => {
    if (!resultUrl) return;

    const link = document.createElement("a");
    link.href = resultUrl;
    link.download = `ai-photo-${Date.now()}.png`;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <main className="min-h-screen bg-neutral-200 flex items-center justify-center p-6">
      <div className="w-full max-w-xl rounded-3xl bg-white p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]">
        {/* Title */}
        <h1 className="text-3xl font-semibold text-neutral-900 text-center">
          Transform your photo with AI
        </h1>

        {/* Upload Box */}
        <div className="mt-8">
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            onChange={handleFileChange}
            className="hidden"
            aria-hidden
          />
          <input
            ref={referenceInputRef}
            type="file"
            accept={ACCEPTED_TYPES}
            multiple
            onChange={handleReferenceChange}
            className="hidden"
            aria-hidden
          />
          <div
            role="button"
            tabIndex={0}
            onClick={openFilePicker}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                openFilePicker();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`overflow-hidden rounded-2xl border-2 px-6 text-center transition-colors ${
              resultUrl
                ? "border-solid border-neutral-200 bg-neutral-50"
                : isDragging
                  ? "flex min-h-[220px] cursor-pointer flex-col items-center justify-center border-dashed border-neutral-500 bg-neutral-100"
                  : `flex min-h-[220px] cursor-pointer flex-col items-center justify-center border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 ${
                      uploadedImage ? "border-solid border-green-400 bg-green-50/50" : ""
                    }`
            }`}
          >
            {resultUrl ? (
              <img
                src={resultUrl}
                alt="AI-generated result"
                className="h-auto w-full object-cover"
              />
            ) : uploadedImage ? (
              <>
                <p className="text-[15px] font-medium text-neutral-700">
                  {uploadedImage.name}
                </p>
                <p className="mt-1 text-sm text-neutral-500">
                  Click or drop another image to replace
                </p>
              </>
            ) : (
              <>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-neutral-200">
                  <Upload className="h-6 w-6 text-neutral-500" />
                </div>
                <p className="text-[15px] font-medium text-neutral-700 leading-snug">
                  Drag & drop your image here,
                  <br />
                  or click to upload
                </p>
                <p className="mt-2 text-sm text-neutral-400">
                  JPEG, PNG, WebP or GIF · Max 10MB
                </p>
              </>
            )}
          </div>
          {resultUrl ? (
            <div className="mt-3 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleDownloadResult}
                disabled={isGenerating}
                aria-label="Download generated image"
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearImage}
                disabled={isGenerating}
              >
                <X className="mr-2 h-4 w-4" />
                Clear result
              </Button>
            </div>
          ) : uploadedImage ? (
            <div className="mt-3 flex justify-end">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleClearImage}
                disabled={isGenerating}
              >
                <X className="mr-2 h-4 w-4" />
                {uploadedImage.name}
              </Button>
            </div>
          ) : null}
        </div>

        {/* Style Preset Section */}
        <div className="mt-8">
          <p className="text-base font-semibold text-neutral-900 mb-3">
            Style preset
          </p>

          <div className="flex w-full rounded-full bg-neutral-100 p-1">
            <button
              onClick={() => setActiveTab("preset")}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
                activeTab === "preset"
                  ? "bg-black text-white"
                  : "text-neutral-500"
              }`}
            >
              Style preset
            </button>
            <button
              onClick={() => setActiveTab("custom")}
              className={`flex-1 rounded-full py-2.5 text-sm font-medium transition-all ${
                activeTab === "custom"
                  ? "bg-black text-white"
                  : "text-neutral-500"
              }`}
            >
              Custom prompt
            </button>
          </div>

          {activeTab === "preset" && (
            <div className="relative mt-4">
              <select
                value={preset}
                onChange={(e) => setPreset(e.target.value as StyleValue)}
                className="w-full appearance-none rounded-xl border border-neutral-300 bg-neutral-50 py-3.5 pl-4 pr-10 text-[15px] font-medium text-neutral-800 focus:outline-none"
              >
                {STYLE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-500">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </span>
            </div>
          )}

          {activeTab === "custom" && (
            <div className="mt-4">
              <AdvancedChatInput
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the style or effect you want..."
                files={files}
                onFileRemove={handleRemoveFile}
                actionIcons={actionIcons}
                textareaProps={{
                  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                    }
                  },
                }}
              />
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleCreateAIImage}
            disabled={isGenerating}
            className="w-full rounded-2xl bg-gradient-to-b from-neutral-900 to-black py-4 text-lg font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isGenerating ? "Generating..." : "Create AI image"}
          </button>
        </div>

        {errorMessage ? (
          <p className="mt-4 text-sm text-red-600">{errorMessage}</p>
        ) : null}

        {successMessage ? (
          <p className="mt-4 text-sm text-green-700">{successMessage}</p>
        ) : null}
      </div>
    </main>
  );
}
