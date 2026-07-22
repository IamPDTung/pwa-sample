"use client";

import { createContext, useContext, useState, useCallback, useRef } from "react";

export interface UploadState {
  uploading: boolean;
  progress: number;
  fileSize: number;
  fileName: string;
  result: string | null;
  error: string | null;
}

const initialState: UploadState = {
  uploading: false,
  progress: 0,
  fileSize: 0,
  fileName: "",
  result: null,
  error: null,
};

const UploadContext = createContext<{
  state: UploadState;
  startUpload: (file: File) => void;
} | null>(null);

export function UploadProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<UploadState>(initialState);
  const xhrRef = useRef<XMLHttpRequest | null>(null);

  const startUpload = useCallback((file: File) => {
    xhrRef.current?.abort();

    setState({
      uploading: true,
      progress: 0,
      fileSize: file.size,
      fileName: file.name,
      result: null,
      error: null,
    });

    const xhr = new XMLHttpRequest();
    xhrRef.current = xhr;

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setState((prev) => ({
          ...prev,
          progress: Math.round((e.loaded / e.total) * 100),
        }));
      }
    });

    xhr.addEventListener("load", () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        const res = JSON.parse(xhr.responseText) as { path: string };
        setState((prev) => ({ ...prev, uploading: false, result: res.path }));
      } else {
        setState((prev) => ({
          ...prev,
          uploading: false,
          error: `HTTP ${xhr.status}`,
        }));
      }
    });

    xhr.addEventListener("error", () => {
      setState((prev) => ({
        ...prev,
        uploading: false,
        error: "Network error",
      }));
    });

    xhr.addEventListener("abort", () => {
      setState((prev) => ({ ...prev, uploading: false }));
    });

    xhr.open("POST", "/api/upload");
    xhr.setRequestHeader("x-file-name", file.name);
    xhr.send(file);
  }, []);

  return (
    <UploadContext value={{ state, startUpload }}>
      {children}
    </UploadContext>
  );
}

export function useUpload() {
  const ctx = useContext(UploadContext);
  if (!ctx) throw new Error("useUpload must be used within UploadProvider");
  return ctx;
}
