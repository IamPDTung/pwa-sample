"use client";

import { useState, useRef, useCallback } from "react";
import { useUpload } from "./upload-context";

export default function UploadTest() {
  const { state, startUpload } = useUpload();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback(() => {
    const file = inputRef.current?.files?.[0];
    setSelectedFile(file ?? null);
  }, []);

  const handleUpload = useCallback(() => {
    if (!selectedFile) return;
    startUpload(selectedFile);
    setSelectedFile(null);
    if (inputRef.current) inputRef.current.value = "";
  }, [selectedFile, startUpload]);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const showFileInfo = selectedFile ?? (state.fileSize > 0 ? { name: state.fileName, size: state.fileSize } : null);

  return (
    <div className="flex flex-col items-center gap-4 w-full max-w-md">
      <input
        ref={inputRef}
        type="file"
        onChange={handleFileChange}
        disabled={state.uploading}
        className="block w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100 disabled:opacity-50 dark:file:bg-violet-900/30 dark:file:text-violet-300"
      />

      {showFileInfo && !state.uploading && (
        <p className="text-sm text-zinc-500">
          {showFileInfo.name} ({formatSize(showFileInfo.size)})
        </p>
      )}

      <button
        onClick={handleUpload}
        disabled={state.uploading || !selectedFile}
        className="px-6 py-2 rounded-full bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {state.uploading ? "Uploading..." : "Upload"}
      </button>

      {state.uploading && (
        <div className="w-full">
          <div className="flex justify-between text-sm text-zinc-500 mb-1">
            <span>{state.progress}%</span>
            <span>
              {formatSize((state.fileSize * state.progress) / 100)} /{" "}
              {formatSize(state.fileSize)}
            </span>
          </div>
          <div className="w-full h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-violet-600 transition-all duration-300 rounded-full"
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>
      )}

      {state.result && (
        <p className="text-sm text-emerald-600 dark:text-emerald-400">
          Uploaded: {state.result}
        </p>
      )}

      {state.error && (
        <p className="text-sm text-red-600 dark:text-red-400">
          Error: {state.error}
        </p>
      )}
    </div>
  );
}
