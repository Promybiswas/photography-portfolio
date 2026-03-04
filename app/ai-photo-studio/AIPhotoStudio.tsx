"use client";

import * as React from "react";
import {
  AdvancedChatInput,
  type FileAttachment,
} from "@/components/ui/advanced-ai-chat-input";
import { Button } from "@/components/ui/button";
import { FileText, Link, Mic, Upload } from "lucide-react";

const MAX_FILE_SIZE_MB = 10;
const ACCEPTED_TYPES = "image/jpeg,image/png,image/webp,image/gif";

export default function AIPhotoStudio() {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = React.useState<"preset" | "custom">("preset");
  const [preset, setPreset] = React.useState("Oil painting");
  const [customPrompt, setCustomPrompt] = React.useState("");
  const [files, setFiles] = React.useState<FileAttachment[]>([]);
  const [uploadedImage, setUploadedImage] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const handleAddFile = () => {
    const newFile: FileAttachment = {
      id: Date.now(),
      name: `reference_${files.length + 1}.jpg`,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
    };
    setFiles((prev) => [...prev, newFile]);
  };

  const handleRemoveFile = (id: string | number) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const handleSendPrompt = () => {
    if (!customPrompt && files.length === 0) return;
    console.log("AI Photo Studio — prompt:", {
      prompt: customPrompt,
      attachments: files.map((f) => f.name),
    });
    setCustomPrompt("");
    setFiles([]);
  };

  const actionIcons = [
    <Button key="link" variant="ghost" size="icon" aria-label="Attach link">
      <Link className="h-4 w-4 text-muted-foreground" />
    </Button>,
    <Button key="mic" variant="ghost" size="icon" aria-label="Use microphone">
      <Mic className="h-4 w-4 text-muted-foreground" />
    </Button>,
  ];

  const handleCreateAIImage = () => {
    const promptToUse =
      activeTab === "custom" ? customPrompt : preset;
    console.log("Create AI image:", { style: promptToUse, attachments: files, image: uploadedImage?.name });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setUploadedImage(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Please drop an image file (JPEG, PNG, WebP or GIF).");
      return;
    }
    if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      alert(`File is too large. Max size is ${MAX_FILE_SIZE_MB}MB.`);
      return;
    }
    setUploadedImage(file);
  };

  const openFilePicker = () => fileInputRef.current?.click();

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
            className={`flex min-h-[220px] cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed px-6 text-center transition-colors ${
              isDragging
                ? "border-neutral-500 bg-neutral-100"
                : "border-neutral-300 bg-neutral-50 hover:bg-neutral-100"
            } ${uploadedImage ? "border-solid border-green-400 bg-green-50/50" : ""}`}
          >
            {uploadedImage ? (
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
                onChange={(e) => setPreset(e.target.value)}
                className="w-full appearance-none rounded-xl border border-neutral-300 bg-neutral-50 py-3.5 pl-4 pr-10 text-[15px] font-medium text-neutral-800 focus:outline-none"
              >
                <option>Oil painting</option>
                <option>Watercolor</option>
                <option>Anime</option>
                <option>Vintage</option>
                <option>Cinematic</option>
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
            <div className="mt-4 space-y-2">
              <AdvancedChatInput
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                placeholder="Describe the style or effect you want..."
                files={files}
                onFileRemove={handleRemoveFile}
                onSend={handleSendPrompt}
                actionIcons={actionIcons}
                textareaProps={{
                  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSendPrompt();
                    }
                  },
                }}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddFile}
                className="w-full"
              >
                <FileText className="mr-2 h-4 w-4" />
                Attach reference
              </Button>
            </div>
          )}
        </div>

        {/* Create Button */}
        <div className="mt-8">
          <button
            type="button"
            onClick={handleCreateAIImage}
            className="w-full rounded-2xl bg-gradient-to-b from-neutral-900 to-black py-4 text-lg font-semibold text-white shadow-[0_2px_8px_rgba(0,0,0,0.2)] transition hover:opacity-90"
          >
            Create AI image
          </button>
        </div>
      </div>
    </main>
  );
}
