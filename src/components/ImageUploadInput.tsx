import React, { useState, useRef } from 'react';
import { Upload, Image as ImageIcon, Camera, X, Check, Link, Sparkles } from 'lucide-react';

interface ImageUploadInputProps {
  label?: string;
  value: string;
  onChange: (newImageUrl: string) => void;
  className?: string;
  id?: string;
}

export const processImageFile = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Check type or extension (allow all standard image formats including webp, avif, svg, gif, png, jpg, etc.)
    const isImage =
      file.type.startsWith('image/') ||
      /\.(png|jpe?g|webp|gif|svg|avif|bmp|jfif|ico|tiff|heic)$/i.test(file.name);

    if (!isImage && file.type) {
      reject(new Error('Please select an image file (PNG, JPG, WebP, GIF, SVG, etc.)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (!result) {
        reject(new Error('Failed to read image file'));
        return;
      }

      // Preserve 100% of the original image data and quality without any canvas downscaling or JPEG re-compression
      resolve(result);
    };

    reader.onerror = () => reject(new Error('Error reading image file'));
    reader.readAsDataURL(file);
  });
};

export const ImageUploadInput: React.FC<ImageUploadInputProps> = ({
  label = 'Account Cover Image / Taswira d l-compte',
  value,
  onChange,
  className = '',
  id = 'account-image-upload'
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showUrlInput, setShowUrlInput] = useState(false);

  // Quick preset covers for convenience
  const presets = [
    { label: 'Steam', url: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80' },
    { label: 'Xbox', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80' },
    { label: 'Action / RPG', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=800&q=80' },
    { label: 'Shooter', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&w=800&q=80' }
  ];

  const handleFile = async (file: File) => {
    setErrorMsg(null);
    setIsProcessing(true);
    try {
      const dataUrl = await processImageFile(file);
      onChange(dataUrl);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process image');
    } finally {
      setIsProcessing(false);
    }
  };

  const onFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className={`space-y-2 font-mono text-xs ${className}`}>
      <div className="flex items-center justify-between">
        <label htmlFor={id} className="block text-slate-300 font-semibold">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-purple-400 hover:text-purple-300 flex items-center gap-1 transition-colors"
        >
          <Link className="w-3 h-3" />
          <span>{showUrlInput ? 'Hide URL field' : 'Enter URL instead'}</span>
        </button>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        id={id}
        type="file"
        accept="image/*,.png,.jpg,.jpeg,.webp,.gif,.svg,.avif,.bmp,.jfif"
        onChange={onFileInputChange}
        className="hidden"
      />

      {/* Upload Zone & Preview Card */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative p-3.5 rounded-2xl border-2 transition-all ${
          isDragging
            ? 'border-purple-400 bg-purple-950/40 shadow-lg shadow-purple-900/30 scale-[1.01]'
            : 'border-dashed border-slate-700 hover:border-purple-500/60 bg-[#0c0e15]'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Thumbnail Preview */}
          <div className="relative group shrink-0 w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-slate-900 border border-slate-700 shadow-md">
            {value ? (
              <img
                src={value}
                alt="Account Preview"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-slate-600">
                <ImageIcon className="w-8 h-8 mb-1" />
                <span className="text-[10px]">No image</span>
              </div>
            )}

            {/* Quick change hover overlay */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="absolute inset-0 bg-black/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white cursor-pointer"
            >
              <Camera className="w-5 h-5 mb-1 text-purple-400" />
              <span className="text-[9px] font-bold uppercase">Change</span>
            </div>
          </div>

          {/* Action buttons & Drag-and-Drop Area */}
          <div className="flex-1 text-center sm:text-left space-y-2 w-full">
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                id="btn-browse-image"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessing}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 active:scale-95 text-white font-gaming text-xs font-bold flex items-center gap-1.5 shadow-md shadow-purple-600/30 transition-all cursor-pointer"
              >
                {isProcessing ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Upload className="w-3.5 h-3.5" />
                )}
                <span>Upload Image from Device</span>
              </button>

              {value && (
                <button
                  type="button"
                  onClick={() => onChange('')}
                  className="px-2.5 py-2 rounded-xl bg-slate-800 hover:bg-rose-950/50 hover:text-rose-400 hover:border-rose-800/60 border border-slate-700 text-slate-400 text-xs transition-colors flex items-center gap-1"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Clear</span>
                </button>
              )}
            </div>

            <p className="text-[11px] text-slate-400">
              Drag and drop any picture here, or click <strong className="text-purple-300">Upload Image</strong> (supports JPG, PNG, WebP).
            </p>

            {/* Quick Presets */}
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] text-slate-500 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-purple-400" /> Quick Samples:
              </span>
              {presets.map((preset) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => onChange(preset.url)}
                  className={`px-2 py-0.5 rounded text-[10px] border transition-all ${
                    value === preset.url
                      ? 'bg-purple-950 border-purple-500 text-purple-300 font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {errorMsg && (
          <div className="mt-2 text-[11px] text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-900/40 flex items-center justify-between">
            <span>{errorMsg}</span>
            <button type="button" onClick={() => setErrorMsg(null)}>
              <X className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* Manual URL field if toggled */}
      {showUrlInput && (
        <div className="p-3 rounded-xl bg-[#0c0e15] border border-slate-800 space-y-1 animate-in fade-in">
          <label className="block text-[11px] text-slate-400">Direct Image Web URL (Optional)</label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder="https://images.unsplash.com/photo-..."
              className="flex-1 px-3 py-1.5 rounded-lg bg-[#141824] border border-slate-700 text-white text-xs outline-none focus:border-purple-500"
            />
            {value && (
              <span className="text-emerald-400 flex items-center gap-1 text-[11px]">
                <Check className="w-3.5 h-3.5" /> Ready
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
