"use client";

import { useState, useRef, useCallback, useEffect, useMemo, type KeyboardEvent } from "react";

type Grid = string[][];
const DEFAULT_ROWS = 30;
const DEFAULT_COLS = 10;

const FORMULAS = [
  { name: "SUM", desc: "Adds all numbers in a range", syntax: "SUM(A1:A5)" },
  { name: "AVERAGE", desc: "Calculates average of a range", syntax: "AVERAGE(A1:A5)" },
  { name: "COUNT", desc: "Counts numeric values in a range", syntax: "COUNT(A1:A5)" },
  { name: "MAX", desc: "Returns the largest value", syntax: "MAX(A1:A5)" },
  { name: "MIN", desc: "Returns the smallest value", syntax: "MIN(A1:A5)" },
  { name: "IF", desc: "Returns value based on condition", syntax: "IF(A1>10, yes, no)" },
];

function createGrid(rows: number, cols: number): Grid {
  return Array.from({ length: rows }, () => Array(cols).fill(""));
}

function colLetter(n: number): string {
  let s = "";
  while (n >= 0) { s = String.fromCharCode(65 + (n % 26)) + s; n = Math.floor(n / 26) - 1; }
  return s;
}

function colIndex(letter: string): number {
  let n = 0;
  for (let i = 0; i < letter.length; i++) { n = n * 26 + (letter.charCodeAt(i) - 64); }
  return n - 1;
}

function parseRef(ref: string): [number, number] {
  const m = ref.match(/^([A-Z]+)(\d+)$/i);
  if (!m) return [-1, -1];
  return [colIndex(m[1].toUpperCase()), parseInt(m[2], 10) - 1];
}

function getCellNumeric(grid: Grid, ref: string): number {
  const [c, r] = parseRef(ref);
  if (c === -1 || r < 0 || r >= grid.length || c < 0 || c >= (grid[r]?.length ?? 0)) return 0;
  const v = parseFloat(grid[r][c]);
  return isNaN(v) ? 0 : v;
}

function getRangeValues(grid: Grid, rangeStr: string): number[] {
  const parts = rangeStr.split(":");
  if (parts.length !== 2) return [];
  const [cs, rs] = parseRef(parts[0]);
  const [ce, re] = parseRef(parts[1]);
  if (cs === -1 || ce === -1) return [];
  const cStart = Math.min(cs, ce), cEnd = Math.max(cs, ce);
  const rStart = Math.min(rs, re), rEnd = Math.max(rs, re);
  const values: number[] = [];
  for (let r = rStart; r <= rEnd; r++) {
    for (let c = cStart; c <= cEnd; c++) {
      const v = parseFloat(grid[r]?.[c] ?? "");
      if (!isNaN(v)) values.push(v);
    }
  }
  return values;
}

function safeEval(expr: string): number {
  if (!/^[\d+\-*/().%\s]+$/.test(expr)) throw new Error("Invalid");
  const result = new Function("return (" + (expr || "0") + ")")();
  if (typeof result !== "number" || !isFinite(result)) return 0;
  return result;
}

function evaluateFormula(formula: string, grid: Grid): string {
  if (!formula.startsWith("=")) return formula;
  const expr = formula.slice(1).trim();
  try {
    const funcMatch = expr.match(/^(SUM|AVERAGE|COUNT|MAX|MIN)\(([A-Z]+\d+:[A-Z]+\d+)\)$/i);
    if (funcMatch) {
      const fn = funcMatch[1].toUpperCase();
      const values = getRangeValues(grid, funcMatch[2]);
      if (values.length === 0) return "#N/A";
      switch (fn) {
        case "SUM": return String(values.reduce((a, b) => a + b, 0));
        case "AVERAGE": return String(values.reduce((a, b) => a + b, 0) / values.length);
        case "COUNT": return String(values.length);
        case "MAX": return String(Math.max(...values));
        case "MIN": return String(Math.min(...values));
      }
    }
    let resolved = expr;
    const refs = expr.matchAll(/\b([A-Z]+\d+)\b/gi);
    for (const m of refs) {
      resolved = resolved.replace(new RegExp("\\b" + m[1] + "\\b", "gi"), String(getCellNumeric(grid, m[1])));
    }
    const cleaned = resolved.replace(/[^0-9+\-*/().%\s]/g, "");
    if (!cleaned.trim()) return "#ERR";
    return String(Math.round(safeEval(cleaned) * 1e10) / 1e10);
  } catch { return "#ERR"; }
}

function parseCSV(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = "", inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"') {
      if (inQuotes && text[i + 1] === '"') { cell += '"'; i++; }
      else inQuotes = !inQuotes;
    } else if (ch === "," && !inQuotes) { row.push(cell); cell = ""; }
    else if (ch === "\n" && !inQuotes) { row.push(cell); rows.push(row); row = []; cell = ""; }
    else if (ch !== "\r") { cell += ch; }
  }
  row.push(cell);
  if (row.some((c) => c !== "")) rows.push(row);
  return rows;
}

function gridToCSV(grid: Grid): string {
  return grid.map((row) =>
    row.map((v) => {
      if (v.includes(",") || v.includes('"') || v.includes("\n"))
        return '"' + v.replace(/"/g, '""') + '"';
      return v;
    }).join(",")
  ).join("\n");
}

function downloadBlob(content: string, filename: string, mime: string) {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function SpreadsheetView() {
  const [grid, setGrid] = useState<Grid>(() => createGrid(DEFAULT_ROWS, DEFAULT_COLS));
  const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
  const [editing, setEditing] = useState(false);
  const [barValue, setBarValue] = useState("");
  const [fileName, setFileName] = useState("untitled");
  const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionIdx, setSuggestionIdx] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);
  const barRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const filteredFormulas = useMemo(() => {
    if (!barValue.startsWith("=")) return [];
    const q = barValue.slice(1).toLowerCase();
    return FORMULAS.filter((f) => f.name.toLowerCase().startsWith(q));
  }, [barValue]);

  useEffect(() => { if (editing) barRef.current?.focus(); }, [editing]);

  const markModified = useCallback((r: number, c: number) => {
    setModifiedCells((prev) => { const n = new Set(prev); n.add(r + "," + c); return n; });
  }, []);

  const setCell = useCallback((r: number, c: number, value: string) => {
    const cur = grid[r]?.[c] ?? "";
    if (cur === value) return;
    setGrid((prev) => {
      const next = prev.map((row) => [...row]);
      if (c >= next[r].length) next[r] = [...next[r], ...Array(c - next[r].length + 1).fill("")];
      next[r][c] = value;
      return next;
    });
    markModified(r, c);
  }, [grid, markModified]);

  const commitEdit = useCallback(() => {
    if (!editing) return;
    setCell(activeCell.row, activeCell.col, barValue);
    setEditing(false); setShowSuggestions(false);
  }, [editing, activeCell, barValue, setCell]);

  const cancelEdit = useCallback(() => { setEditing(false); setShowSuggestions(false); }, []);

  const selectCell = useCallback((r: number, c: number) => {
    if (editing && (activeCell.row !== r || activeCell.col !== c)) {
      setCell(activeCell.row, activeCell.col, barValue);
      setEditing(false); setShowSuggestions(false);
    }
    setActiveCell({ row: r, col: c });
    if (!editing) setBarValue(grid[r]?.[c] ?? "");
  }, [editing, activeCell, barValue, grid, setCell]);

  const startEditing = useCallback((r: number, c: number, initial?: string) => {
    setActiveCell({ row: r, col: c });
    const val = initial ?? grid[r]?.[c] ?? "";
    setBarValue(val); setEditing(true); setShowSuggestions(val.startsWith("="));
  }, [grid]);

  const moveCell = useCallback((dr: number, dc: number) => {
    if (editing) commitEdit();
    setActiveCell((prev) => ({
      row: Math.max(0, Math.min(prev.row + dr, rows - 1)),
      col: Math.max(0, Math.min(prev.col + dc, cols - 1)),
    }));
  }, [rows, cols, editing, commitEdit]);

  const acceptSuggestion = useCallback((f: typeof FORMULAS[number]) => {
    setBarValue("=" + f.name + "("); setShowSuggestions(false); barRef.current?.focus();
  }, []);

  const handleBarKeyDown = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
    if (showSuggestions && filteredFormulas.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setSuggestionIdx((i) => Math.min(i + 1, filteredFormulas.length - 1)); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); setSuggestionIdx((i) => Math.max(i - 1, 0)); return; }
      if (e.key === "Enter" || e.key === "Tab") { e.preventDefault(); acceptSuggestion(filteredFormulas[suggestionIdx]); return; }
      if (e.key === "Escape") { e.preventDefault(); setShowSuggestions(false); return; }
    }
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); commitEdit(); moveCell(1, 0); }
    else if (e.key === "Tab") { e.preventDefault(); commitEdit(); moveCell(0, e.shiftKey ? -1 : 1); }
    else if (e.key === "Escape") { e.preventDefault(); cancelEdit(); gridRef.current?.focus(); }
  }, [showSuggestions, filteredFormulas, suggestionIdx, acceptSuggestion, commitEdit, moveCell, cancelEdit]);

  const handleGridKeyDown = useCallback((e: KeyboardEvent) => {
    if (editing) return;
    switch (e.key) {
      case "ArrowUp": e.preventDefault(); moveCell(-1, 0); break;
      case "ArrowDown": e.preventDefault(); moveCell(1, 0); break;
      case "ArrowLeft": e.preventDefault(); moveCell(0, -1); break;
      case "ArrowRight": e.preventDefault(); moveCell(0, 1); break;
      case "Tab": e.preventDefault(); moveCell(0, e.shiftKey ? -1 : 1); break;
      case "Enter": e.preventDefault(); startEditing(activeCell.row, activeCell.col); break;
      case "F2": e.preventDefault(); startEditing(activeCell.row, activeCell.col); break;
      case "Delete": case "Backspace": setCell(activeCell.row, activeCell.col, ""); break;
      default:
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey) {
          e.preventDefault(); startEditing(activeCell.row, activeCell.col, e.key);
        }
    }
  }, [editing, activeCell, moveCell, startEditing, setCell]);

  const handleBarChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setBarValue(val);
    setSuggestionIdx(0);
    if (!editing) setEditing(true);
    setShowSuggestions(val.startsWith("="));
  }, [editing]);

  const handleBarFocus = useCallback(() => {
    if (!editing) { setBarValue(grid[activeCell.row]?.[activeCell.col] ?? ""); setEditing(true); setShowSuggestions(false); }
  }, [editing, activeCell, grid]);

  const handleBarBlur = useCallback(() => { if (editing) commitEdit(); }, [editing, commitEdit]);

  const handleImport = useCallback(() => { fileRef.current?.click(); }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name.replace(/\.\w+$/, ""));
    const reader = new FileReader();
    reader.onload = () => {
      const csv = parseCSV(reader.result as string);
      if (csv.length > 0) {
        setGrid(csv); setActiveCell({ row: 0, col: 0 });
        setBarValue(csv[0]?.[0] ?? ""); setEditing(false);
        setModifiedCells(new Set()); setShowSuggestions(false);
      }
    };
    reader.readAsText(file);
    if (fileRef.current) fileRef.current.value = "";
  }, []);

  const handleExport = useCallback(() => {
    downloadBlob(gridToCSV(grid), fileName + ".csv", "text/csv;charset=utf-8;");
  }, [grid, fileName]);

  const addRow = useCallback(() => {
    setGrid((prev) => [...prev, Array(prev[0]?.length ?? 10).fill("")]);
  }, []);

  const addCol = useCallback(() => {
    setGrid((prev) => prev.map((row) => [...row, ""]));
  }, []);

  const cellRef = colLetter(activeCell.col) + (activeCell.row + 1);
  const cellValue = grid[activeCell.row]?.[activeCell.col] ?? "";
  const inputValue = editing ? barValue : cellValue;
  const headerH = 34;
  const rowW = 52;
  const cellW = 104;
  const totalW = rowW + cols * cellW;

  return (
    <div ref={gridRef} className="w-full max-w-6xl mx-auto outline-none" onKeyDown={handleGridKeyDown} tabIndex={0}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <button onClick={handleImport} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/></svg>
          Import CSV
        </button>
        <button onClick={handleExport} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-900/30 dark:text-violet-300 dark:hover:bg-violet-900/50 transition-colors">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"/></svg>
          Export CSV
        </button>
        <button onClick={addRow} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">+ Row</button>
        <button onClick={addCol} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800 transition-colors">+ Col</button>
        <span className="ml-auto text-sm text-zinc-400 tabular-nums">{rows} x {cols}</span>
        <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFileChange} className="hidden"/>
      </div>

      <div className="relative mb-2">
        <div className="flex items-center gap-3 px-1">
          <span className="w-10 text-right text-xs font-mono font-semibold text-violet-600 dark:text-violet-400 select-none">{cellRef}</span>
          <div className="flex-1 relative">
            <input
              ref={barRef}
              value={inputValue}
              onChange={handleBarChange}
              onFocus={handleBarFocus}
              onBlur={handleBarBlur}
              onKeyDown={handleBarKeyDown}
              className="w-full px-2.5 py-1.5 text-sm font-mono border border-zinc-300 dark:border-zinc-600 rounded-md bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
              placeholder="Enter value or =SUM(A1:A5) ..."
            />
            {showSuggestions && filteredFormulas.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-30 overflow-hidden">
                {filteredFormulas.map((f, i) => (
                  <button
                    key={f.name}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => acceptSuggestion(f)}
                    className={"w-full text-left px-3 py-2 flex items-center gap-3 hover:bg-violet-50 dark:hover:bg-violet-900/20 transition-colors" + (i === suggestionIdx ? " bg-violet-50 dark:bg-violet-900/20" : "")}
                  >
                    <span className="text-xs font-bold text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/30 px-1.5 py-0.5 rounded">{f.name}</span>
                    <span className="text-xs text-zinc-400 font-mono">{f.syntax}</span>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 ml-auto hidden sm:block">{f.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-auto bg-white dark:bg-zinc-900" style={{ maxHeight: "70vh" }}>
        <div style={{ width: totalW, minWidth: "100%" }}>
          <table className="border-collapse table-fixed" style={{ width: totalW }}>
            <thead>
              <tr>
                <th className="sticky top-0 z-20 bg-zinc-100 dark:bg-zinc-800 border-r border-b border-zinc-200 dark:border-zinc-700" style={{ width: rowW, height: headerH }} />
                {Array.from({ length: cols }, (_, c) => (
                  <th key={c} className="sticky top-0 z-20 bg-zinc-100 dark:bg-zinc-800 border-r border-b border-zinc-200 dark:border-zinc-700 px-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 text-center select-none" style={{ width: cellW, height: headerH }}>
                    {colLetter(c)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {grid.map((row, r) => (
                <tr key={r}>
                  <td className="sticky left-0 z-10 bg-zinc-100 dark:bg-zinc-800 border-r border-b border-zinc-200 dark:border-zinc-700 px-1 text-xs font-semibold text-zinc-500 dark:text-zinc-400 text-right select-none" style={{ width: rowW, height: 32 }}>
                    {r + 1}
                  </td>
                  {row.map((cell, c) => {
                    const isActive = activeCell.row === r && activeCell.col === c;
                    const isModified = modifiedCells.has(r + "," + c);
                    const display = evaluateFormula(cell, grid);
                    const isErr = display === "#ERR" || display === "#N/A";
                    let cellClass = "border-r border-b border-zinc-100 dark:border-zinc-800 p-0 cursor-cell relative";
                    if (isActive) cellClass += " ring-2 ring-violet-500 ring-inset";
                    let textClass = "w-full h-full px-2 text-sm flex items-center truncate";
                    if (isModified) textClass += " bg-amber-100 dark:bg-amber-950/30";
                    if (isErr) textClass += " text-red-500";
                    else textClass += " text-zinc-700 dark:text-zinc-300";
                    return (
                      <td key={c} className={cellClass} style={{ width: cellW, height: 32 }}
                        onClick={() => selectCell(r, c)} onDoubleClick={() => startEditing(r, c)}>
                        <div className={textClass}>{display}</div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
