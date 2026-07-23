import SpreadsheetView from "../components/spreadsheet";

export default function SpreadsheetPage() {
  return (
    <main className="flex-1 p-6 pt-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Spreadsheet</h1>
        <p className="text-sm text-zinc-500 mt-1">
          Lightweight editor. Import CSV, edit cells, export when done.
        </p>
      </div>
      <SpreadsheetView />
    </main>
  );
}
