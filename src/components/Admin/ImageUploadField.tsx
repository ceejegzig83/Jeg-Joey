import React, { useState, useRef } from 'react';
import { Upload, X, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  presetImages?: Array<{ label: string; url: string; division?: string }>;
  currentDivision?: string;
}

// 2 MB Maximum File Size constraint
const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2,097,152 bytes (2 MB)
const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png'];
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/pjpeg'];

export const ImageUploadField: React.FC<ImageUploadFieldProps> = ({
  value,
  onChange,
  label = 'Product Image',
  presetImages = [],
  currentDivision
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successInfo, setSuccessInfo] = useState<{ name: string; size: string } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMessage(null);
    setSuccessInfo(null);

    // 1. File format / extension validation: only .jpg, .jpeg, and .png
    const fileName = file.name.toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
    const hasValidMime = ALLOWED_MIME_TYPES.includes(file.type.toLowerCase());

    if (!hasValidExtension && !hasValidMime) {
      setErrorMessage(
        `Invalid file format ("${file.name}"). Only .jpg, .jpeg, and .png image formats are accepted.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return false;
    }

    // 2. File size limit check: strictly maximum 2 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      const actualSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setErrorMessage(
        `File size exceeds the 2 MB limit (${actualSizeMB} MB selected). Please choose or compress an image smaller than 2 MB.`
      );
      if (fileInputRef.current) fileInputRef.current.value = '';
      return false;
    }

    // 3. Process image as Data URL
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        onChange(result);
        const readableSize = file.size > 1024 * 1024 
          ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` 
          : `${Math.round(file.size / 1024)} KB`;
        setSuccessInfo({
          name: file.name,
          size: readableSize
        });
      }
    };
    reader.onerror = () => {
      setErrorMessage('Failed to read the selected file. Please try again.');
    };
    reader.readAsDataURL(file);
    return true;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      validateAndProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const clearImage = () => {
    onChange('');
    setSuccessInfo(null);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const filteredPresets = currentDivision 
    ? presetImages.filter(p => !p.division || p.division === currentDivision)
    : presetImages;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block font-bold text-stone-700 text-xs">
          {label} *
        </label>
        <span className="text-[10px] font-semibold text-stone-500">
          Format: .JPG, .JPEG, .PNG • Max Size: 2 MB
        </span>
      </div>

      {/* Error Message Alert Banner */}
      {errorMessage && (
        <div 
          id="image-upload-error"
          role="alert"
          className="p-3 bg-rose-50 border border-rose-300 rounded-2xl flex items-start gap-2.5 text-rose-900 text-xs animate-in fade-in duration-200"
        >
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <strong className="font-bold block text-rose-950">Upload Rejected</strong>
            <span>{errorMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="text-rose-500 hover:text-rose-800 p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Upload Zone & Preview Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
        {/* Dropzone Container */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
          className={`sm:col-span-8 p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-2 ${
            isDragging
              ? 'border-amber-500 bg-amber-50/80 scale-[0.99]'
              : errorMessage
              ? 'border-rose-300 bg-rose-50/40 hover:bg-rose-50/70'
              : 'border-stone-300 bg-stone-50 hover:bg-stone-100/80 hover:border-amber-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".jpg,.jpeg,.png,image/jpeg,image/png"
            onChange={handleFileChange}
            className="sr-only"
          />

          <div className="p-3 rounded-full bg-white text-amber-700 shadow-xs border border-stone-200">
            <Upload className="w-5 h-5" />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-bold text-stone-800">
              Click to browse or drag &amp; drop product image
            </p>
            <p className="text-[11px] text-stone-500">
              Strictly accepts <strong className="text-stone-700">.jpg, .jpeg, .png</strong> up to <strong className="text-stone-700">2 MB</strong>
            </p>
          </div>

          <button
            type="button"
            className="mt-1 px-3 py-1 rounded-lg bg-stone-900 text-white text-[11px] font-bold shadow-xs hover:bg-stone-800 transition-colors"
          >
            Select from Device
          </button>
        </div>

        {/* 1:1 Square CenterCrop Preview Box */}
        <div className="sm:col-span-4 flex flex-col items-center">
          <div className="w-full aspect-square rounded-2xl border border-stone-300 overflow-hidden bg-stone-100 relative group flex items-center justify-center shadow-xs">
            {value ? (
              <>
                <img
                  src={value}
                  alt="Product Preview (1:1 centerCrop)"
                  className="w-full h-full object-cover object-center"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-stone-950/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearImage();
                    }}
                    className="p-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md text-xs font-bold flex items-center gap-1"
                    title="Remove Image"
                  >
                    <X className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
                <span className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded bg-stone-900/80 text-[10px] font-bold text-white backdrop-blur-xs">
                  1:1 Square
                </span>
              </>
            ) : (
              <div className="text-center p-3 text-stone-400">
                <ImageIcon className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <span className="text-[10px] font-semibold block">1:1 Square Preview</span>
                <span className="text-[9px] block text-stone-400">(centerCrop)</span>
              </div>
            )}
          </div>

          {successInfo && (
            <div className="mt-1.5 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              <span className="truncate max-w-[130px]">{successInfo.name}</span>
              <span>({successInfo.size})</span>
            </div>
          )}
        </div>
      </div>

      {/* Direct URL input fallback */}
      <div className="space-y-1 pt-1">
        <div className="flex items-center justify-between text-[11px] text-stone-500">
          <span>Or enter direct CDN image link:</span>
        </div>
        <input
          type="url"
          value={value}
          onChange={(e) => {
            setErrorMessage(null);
            onChange(e.target.value);
          }}
          placeholder="https://..."
          className="w-full p-2 bg-stone-50 border border-stone-300 rounded-xl text-stone-900 font-mono text-[11px] focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
        />
      </div>

      {/* Preset High-Res Photos Selector */}
      {filteredPresets.length > 0 && (
        <div className="pt-1">
          <span className="text-[11px] text-stone-500 block mb-1.5 font-semibold">
            Or pick from curated catalog photos:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {filteredPresets.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setErrorMessage(null);
                  onChange(preset.url);
                }}
                className="px-2.5 py-1 rounded-lg bg-stone-100 hover:bg-amber-100 text-stone-800 hover:text-amber-900 border border-stone-200 text-[10px] font-bold transition-colors"
              >
                📷 {preset.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
