"use client";

import { useRef, useState, DragEvent, ChangeEvent } from "react";
import Image from "next/image";
import { X } from "lucide-react";

interface ProfileImageUploadProps {
  preview: string | null;
  fileName?: string;
  onChange: (file: File | null) => void;
  name?: string;
}

export function ProfileImageUpload({
  preview,
  fileName,
  onChange,
  name,
}: ProfileImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDragOver(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file && file.type.startsWith("image/")) {
      onChange(file);
    }
  }

  function handleInputChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(e.target.files?.[0] ?? null);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        id="profile_image"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleInputChange}
        name={name}
      />

      {preview ? (
        <div className="flex items-center gap-4 rounded-xl border border-border bg-surface/60 p-3">
          <div className="relative shrink-0">
            <Image
              src={preview}
              alt="Profile preview"
              width={64}
              height={64}
              unoptimized
              className="h-16 w-16 rounded-full border-2 border-primary object-cover shadow-md"
            />
            <button
              type="button"
              onClick={handleRemove}
              aria-label="Remove image"
              className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-white shadow transition hover:bg-red-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-text-primary">Profile image set</p>
            <p className="mt-0.5 truncate text-xs text-text-secondary">{fileName}</p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-1 text-xs font-medium text-primary underline underline-offset-2 hover:text-primary-dark"
            >
              Change photo
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload profile image"
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={[
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-5 transition-colors duration-200",
            isDragging
              ? "border-primary bg-primary/10"
              : "border-border bg-surface/60 hover:border-primary/60 hover:bg-surface",
          ].join(" ")}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            strokeWidth={1.5}
            stroke="currentColor"
            className={[
              "h-9 w-9 transition-colors duration-200",
              isDragging ? "text-primary" : "text-text-secondary",
            ].join(" ")}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M12 16.5V9.75m0 0 3 3m-3-3-3 3M6.75 19.5a4.5 4.5 0 0 1-1.41-8.775 5.25 5.25 0 0 1 10.338-2.32 5.75 5.75 0 0 1 5.014 7.783A4.498 4.498 0 0 1 17.25 19.5H6.75Z"
            />
          </svg>

          <div className="text-center">
            <p className="text-xs font-semibold text-text-primary">
              {isDragging ? "Drop image here" : "Upload profile photo"}
            </p>
            <p className="mt-0.5 text-xs text-text-secondary">
              Drag &amp; drop or{" "}
              <span className="font-medium text-primary">browse</span>
            </p>
            <p className="mt-0.5 text-[10px] text-text-secondary/70">
              PNG, JPG, GIF up to 10 MB
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
