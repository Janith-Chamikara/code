"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type DropzoneProps = {
  accept?: string;
  maxSizeBytes?: number;
  onFileSelected: (file: File | null) => void;
  className?: string;
  value?: File | null;
};

export function Dropzone({ accept = "image/*", maxSizeBytes = 5_000_000, onFileSelected, className, value }: DropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (!file) return;
    if (accept && !file.type.match(accept.replace("*", ".*"))) return;
    if (file.size > maxSizeBytes) return;
    onFileSelected(file);
  };

  const onBrowse = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return onFileSelected(null);
    if (accept && !file.type.match(accept.replace("*", ".*"))) return;
    if (file.size > maxSizeBytes) return;
    onFileSelected(file);
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
      className={cn(
        "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center cursor-pointer",
        isDragging ? "bg-accent/40" : "bg-transparent",
        className
      )}
      onClick={() => inputRef.current?.click()}
      role="button"
      aria-label="Upload image"
    >
      <p className="text-sm">
        Drag & drop an image here, or <span className="underline">browse</span>
      </p>
      <p className="text-xs text-muted-foreground">Max 5MB. JPG, PNG, GIF.</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={onBrowse}
      />
      {value && (
        <div className="mt-2 flex items-center gap-2 text-sm">
          <img
            src={URL.createObjectURL(value)}
            alt="preview"
            className="size-12 rounded object-cover border"
          />
          <span className="truncate max-w-[220px]">{value.name}</span>
        </div>
      )}
    </div>
  );
}
