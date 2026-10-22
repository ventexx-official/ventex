"use client";

import React, { useState, useRef } from "react";
import { Upload, X, Loader2, Camera } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface AvatarUploadProps {
  userId: string;
  currentUrl?: string | null;
  onUploaded: (url: string) => void;
  className?: string;
}

export function AvatarUpload({
  userId,
  currentUrl,
  onUploaded,
  className = "",
}: AvatarUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    // Validate size (max 2MB = 2 * 1024 * 1024)
    if (file.size > 2 * 1024 * 1024) {
      setError("Avatar image must be under 2MB.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Validate type (jpg, png, webp)
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (!allowed.includes(file.type)) {
      setError("Please choose a JPG, PNG, or WebP image.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }

    // Get file extension
    let ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    if (ext === "jpeg") ext = "jpg";
    if (!["jpg", "png", "webp"].includes(ext)) {
      ext = "jpg";
    }

    const path = `${userId}/avatar.${ext}`;

    setUploading(true);

    try {
      // 1. Upload to Supabase avatars bucket
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, {
          upsert: true,
          contentType: file.type,
          cacheControl: "3600",
        });

      if (uploadError) throw uploadError;

      // 2. Get public URL
      const { data: publicUrlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(path);

      // Append timestamp query parameter to bust cache if re-uploading
      const freshUrl = `${publicUrlData.publicUrl}?t=${Date.now()}`;
      setPreview(freshUrl);
      onUploaded(freshUrl);
    } catch (err: any) {
      console.error("Avatar upload error:", err);
      setError(err.message || "Failed to upload avatar. Try again.");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUploaded("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <label className="block text-xs font-mono uppercase tracking-wider text-[var(--paper-dim)]">
        Profile Photo (Optional)
      </label>

      <div className="flex items-center gap-4">
        <div className="relative w-16 h-16 rounded-full overflow-hidden bg-[var(--ink)] border border-[var(--line)] flex items-center justify-center flex-shrink-0">
          {preview ? (
            <img
              src={preview}
              alt="Avatar preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <Camera className="w-6 h-6 text-[var(--smoke)]" />
          )}

          {uploading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <Loader2 className="w-5 h-5 text-[var(--red)] animate-spin" />
            </div>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-3.5 py-1.5 text-xs font-mono uppercase tracking-wider rounded-full border border-[var(--line)] text-[var(--paper)] hover:border-[var(--red)] hover:text-[var(--red)] transition-colors cursor-pointer disabled:opacity-50 min-h-[36px]"
            >
              {uploading ? "Uploading..." : preview ? "Change Photo" : "Upload Photo"}
            </button>

            {preview && !uploading && (
              <button
                type="button"
                onClick={handleRemove}
                className="p-1.5 text-[var(--smoke)] hover:text-red-400 rounded-full transition-colors cursor-pointer"
                aria-label="Remove avatar"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <span className="text-[11px] font-mono text-[var(--smoke)]">
            JPG, PNG or WebP · Max 2MB
          </span>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handleFileSelect}
        />
      </div>

      {error && (
        <p className="text-[11px] font-mono text-red-400 mt-1">{error}</p>
      )}
    </div>
  );
}
