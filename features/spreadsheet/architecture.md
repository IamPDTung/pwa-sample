# Bảng Tính — Spreadsheet

## Tổng quan
Trang `/spreadsheet` là một bảng tính nhẹ có thể chỉnh sửa, chạy hoàn toàn trên client (không cần backend). Hỗ trợ:
- Nhập/xuất CSV
- Chỉnh sửa ô trực tiếp
- Gợi ý công thức (SUM, AVERAGE, COUNT, MAX, MIN, IF)
- Đánh giá công thức (formula evaluation)
- Đánh dấu ô đã chỉnh sửa (màu vàng)
- Thêm/xóa hàng và cột

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/spreadsheet/page.tsx` | Server component |
| `src/app/components/spreadsheet.tsx` | Client component: toàn bộ logic bảng tính |

## Mô hình dữ liệu

```ts
type Grid = string[][]; // Mảng 2 chiều các giá trị ô

// Mặc định: 30 dòng x 10 cột, tất cả giá trị rỗng
const grid = [
  ["", "", "", "", "", "", "", "", "", ""],
  ["", "", "", "", "", "", "", "", "", ""],
  // ... 28 dòng nữa
];
```

## State quản lý

```tsx
const [grid, setGrid] = useState<Grid>(() => createGrid(30, 10));
const [activeCell, setActiveCell] = useState({ row: 0, col: 0 });
const [editing, setEditing] = useState(false);
const [barValue, setBarValue] = useState("");
const [modifiedCells, setModifiedCells] = useState<Set<string>>(new Set());
const [showSuggestions, setShowSuggestions] = useState(false);
const [suggestionIdx, setSuggestionIdx] = useState(0);
```

- `grid` — dữ liệu bảng tính
- `activeCell` — ô đang được chọn (viền tím)
- `editing` — đang ở chế độ chỉnh sửa (formula bar active)
- `barValue` — giá trị trong formula bar khi đang edit
- `modifiedCells` — Set các ô đã thay đổi (key: "row,col")
- `showSuggestions` — hiển thị dropdown gợi ý công thức
- `suggestionIdx` — vị trí được highlight trong dropdown

## Luồng tương tác

### 1. Điều hướng ô
```
User nhấn phím mũi tên / Tab
  → handleGridKeyDown (khi không edit)
  → moveCell(dRow, dCol)
  → setActiveCell(row, col mới)
  → Formula bar cập nhật giá trị ô mới (derived từ activeCell)
```

### 2. Chỉnh sửa ô
```
User double-click / Enter / F2 / gõ phím bất kỳ
  → startEditing(row, col, initial?)
  → setEditing(true)
  → setBarValue(giá trị hiện tại của ô)
  → Focus vào formula bar
  ↓
User gõ giá trị mới trong formula bar
  → handleBarChange → setBarValue
  → Nếu bắt đầu bằng "=" → setShowSuggestions(true)
  ↓
User nhấn Enter
  → commitEdit()
  → setCell(row, col, barValue) → cập nhật grid
  → markModified(row, col) → đánh dấu ô đã sửa
  → moveCell(1, 0) → chuyển xuống dòng dưới
```

### 3. Gợi ý công thức
```
User gõ "=" trong formula bar
  → handleBarChange → setShowSuggestions(true)
  → filteredFormulas = FORMULAS.filter(f => f.name.startsWith(query))
  → Dropdown hiển thị các công thức phù hợp
  ↓
User gõ tiếp "=S"
  → Filtered: [SUM]
  ↓
User ↑↓ để chọn, Enter để chấp nhận
  → acceptSuggestion(formula)
  → setBarValue("=SUM(")
  → Focus lại formula bar để gõ tiếp range
```

Danh sách công thức:
| Công thức | Cú pháp | Mô tả |
|---|---|---|
| SUM | `=SUM(A1:A5)` | Tổng các số trong range |
| AVERAGE | `=AVERAGE(A1:A5)` | Trung bình cộng |
| COUNT | `=COUNT(A1:A5)` | Đếm số ô có giá trị |
| MAX | `=MAX(A1:A5)` | Giá trị lớn nhất |
| MIN | `=MIN(A1:A5)` | Giá trị nhỏ nhất |
| IF | `=IF(A1>10, "yes", "no")` | Điều kiện (chưa implement) |

### 4. Đánh giá công thức (Formula Evaluation)

Khi hiển thị ô, giá trị được evaluate tự động:
```tsx
const display = evaluateFormula(cell, grid);
```

**Flow evaluate:**
```
Input: "=SUM(A1:A3)"
  → Kiểm tra có bắt đầu bằng "=" không
  → Match pattern ^(SUM|AVERAGE|COUNT|MAX|MIN)\(([A-Z]+\d+:[A-Z]+\d+)\)$
  → Nếu match → parse range "A1:A3"
    → Lấy giá trị các ô A1, A2, A3 từ grid
    → Tính SUM(values)
    → Trả về kết quả dạng string
  → Nếu không match range function:
    → Tìm tất cả cell references (A1, B2, ...) trong expression
    → Replace với giá trị số của ô tương ứng
    → Sanitize (chỉ giữ phép toán + số)
    → new Function("return (" + expr + ")")() → tính toán
    → Trả về kết quả
  → Nếu lỗi → trả về "#ERR"
```

**Giới hạn hiện tại:**
- Range functions chỉ hỗ trợ 1 range duy nhất (không hỗ trợ `=SUM(A1:A3, B1:B3)`)
- Arithmetic chỉ hỗ trợ phép toán cơ bản (+, -, *, /, %, ())
- IF chưa được implement (hiển thị #ERR)
- Không hỗ trợ tham chiếu chéo giữa các sheet

### 5. Đánh dấu ô đã sửa
```tsx
const markModified = (row, col) => {
  setModifiedCells(prev => new Set([...prev, `${row},${col}`]));
};

// Trong render:
const isModified = modifiedCells.has(`${r},${c}`);
// CSS: bg-amber-100 dark:bg-amber-950/30
```

- Mỗi lần `setCell()` được gọi → tự động gọi `markModified()`
- Ô đã sửa có nền vàng nhạt (amber)
- Reset khi import file CSV mới

### 6. Import/Export CSV

**Import:**
```
User click "Import CSV"
  → Chọn file .csv
  → FileReader đọc nội dung
  → parseCSV(text) → string[][]
  → setGrid(csv)
  → Reset modifiedCells, activeCell
```

Parser CSV hỗ trợ:
- Dấu phẩy làm delimiter
- Giá trị trong ngoặc kép (`"hello, world"`)
- Escape quote (`"he said ""hi"""` → `he said "hi"`)
- Dòng mới trong quoted field

**Export:**
```
User click "Export CSV"
  → gridToCSV(grid) → string
  → downloadBlob(csvString, "filename.csv", "text/csv")
  → Trình duyệt tải file
```

### 7. Thêm hàng/cột
```tsx
const addRow = () => setGrid(prev => [...prev, Array(cols).fill("")]);
const addCol = () => setGrid(prev => prev.map(row => [...row, ""]));
```

- Row: thêm mảng rỗng vào cuối grid
- Col: thêm `""` vào mỗi row hiện có

## Tại sao không dùng thư viện spreadsheet?
- `@iddan/react-spreadsheet` quá cũ (React 16), không tương thích React 19
- `handsontable` quá nặng (~500KB)
- Custom implementation: ~300 dòng code, kiểm soát hoàn toàn, không dependency
