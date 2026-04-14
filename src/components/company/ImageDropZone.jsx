import { useRef, useState } from "react";
import { Check, Upload } from "lucide-react";

export default function ImageDropZone({
  fileName,
  preview,
  onChange,
  error,
}) {
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file) => {
    if (file) onChange(file);
  };

  return (
    <div>
      <p className="mb-1.5 text-xs font-medium tracking-wider text-gray-500 uppercase">
        Logo
      </p>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragOver(true);
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragOver(false);
          handleFile(e.dataTransfer.files?.[0]);
        }}
        className={`relative flex h-36 w-full cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${
          isDragOver
            ? "border-blue-500 bg-[rgba(59,130,246,0.06)]"
            : preview
              ? "border-blue-500/25 bg-[rgba(59,130,246,0.03)]"
              : "border-white/[0.08] bg-white/[0.02]"
        }`}
      >
        {preview ? (
          <>
            <img
              src={preview}
              alt="Logo preview"
              className="h-full w-full rounded-xl object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 opacity-0 transition-opacity hover:opacity-100">
              <p className="text-xs font-medium text-white">O'zgartirish</p>
            </div>
          </>
        ) : (
          <>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04]">
              <Upload size={16} className="text-gray-500" />
            </div>
            <p className="text-xs text-gray-600">Logo yuklang yoki tashlang</p>
            <p className="text-[10px] text-gray-700">PNG, JPG, WEBP (2MB)</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          className="hidden"
          onChange={(e) => handleFile(e.target.files?.[0])}
        />
      </div>
      {fileName ? (
        <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-green-400">
          <Check size={11} /> {fileName}
        </p>
      ) : null}
      {error ? <p className="mt-1 text-[11px] text-red-400">{error}</p> : null}
    </div>
  );
}
