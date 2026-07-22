import UploadTest from "../components/upload-test";

export default function UploadPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <main className="flex flex-col items-center gap-8 text-center px-6 py-32">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
          Upload File
        </h1>
        <p className="max-w-md text-lg text-zinc-500 dark:text-zinc-400">
          Stream large files (up to 100GB) directly to disk. No buffering, no blocking.
        </p>
        <UploadTest />
      </main>
    </div>
  );
}
