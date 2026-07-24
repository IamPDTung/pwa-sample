# Bảng Tính (Spreadsheet) — Các trường hợp sử dụng

## UC-SS-01: Chỉnh sửa một ô

**Mô tả:** Người dùng nhập giá trị vào một ô trong bảng tính.

**Các bước:**
1. Vào `/spreadsheet` → bảng 30×10 được tạo sẵn
2. Click vào ô bất kỳ → ô được chọn (viền tím)
3. Double-click hoặc nhấn Enter → ô chuyển sang chế độ edit
4. Formula bar nhận focus, hiển thị giá trị hiện tại của ô
5. Gõ "Hello World" → formula bar cập nhật
6. Nhấn Enter → giá trị được lưu vào ô, ô chuyển sang màu vàng (đã sửa)

**Kết quả mong đợi:** Ô hiển thị "Hello World", có nền vàng nhạt (amber), active cell chuyển xuống dòng dưới.

---

## UC-SS-02: Điều hướng bằng phím

**Mô tả:** Người dùng di chuyển giữa các ô bằng phím mũi tên và Tab.

**Các bước:**
1. Ô A1 đang được chọn
2. Nhấn ↓ → A2 được chọn
3. Nhấn → → B2 được chọn
4. Nhấn Tab → C2 được chọn
5. Nhấn Enter → chuyển sang chế độ edit ô hiện tại
6. Đang edit → nhấn Enter → commit + xuống dòng dưới
7. Đang edit → nhấn Escape → hủy edit, giữ nguyên giá trị cũ

**Kết quả mong đợi:** Navigation mượt mà, không cần dùng chuột.

---

## UC-SS-03: Sử dụng công thức SUM

**Mô tả:** Người dùng tính tổng các giá trị trong một range.

**Các bước:**
1. Nhập số vào các ô A1=10, A2=20, A3=30, A4=40, A5=50
2. Chọn ô A6
3. Gõ `=` → dropdown suggestions xuất hiện
4. Gõ tiếp `SUM` → suggestions filter còn SUM
5. Nhấn Enter để chọn SUM → formula bar hiển thị `=SUM(`
6. Gõ tiếp `A1:A5)` → `=SUM(A1:A5)`
7. Nhấn Enter

**Kết quả mong đợi:** Ô A6 hiển thị `150` (10+20+30+40+50). Ô A6 có nền vàng (đã chỉnh sửa).

---

## UC-SS-04: Sử dụng các công thức khác

**Mô tả:** Người dùng thử các công thức AVERAGE, COUNT, MAX, MIN.

**Các bước:**
1. Dữ liệu có sẵn: A1=10, A2=20, A3=30, A4=40, A5=50
2. B1: `=AVERAGE(A1:A5)` → hiển thị `30`
3. B2: `=COUNT(A1:A5)` → hiển thị `5`
4. B3: `=MAX(A1:A5)` → hiển thị `50`
5. B4: `=MIN(A1:A5)` → hiển thị `10`

**Kết quả mong đợi:** Tất cả công thức hoạt động chính xác.

---

## UC-SS-05: Công thức với tham chiếu ô riêng lẻ

**Mô tả:** Người dùng dùng phép toán với các ô riêng lẻ (không dùng range).

**Các bước:**
1. A1=10, A2=20
2. Chọn A3, nhập `=A1+A2`
3. Nhấn Enter

**Kết quả mong đợi:** A3 hiển thị `30`.

**Các phép toán hỗ trợ:** `+`, `-`, `*`, `/`, `%`, `()`

---

## UC-SS-06: Công thức lỗi — hiển thị #ERR

**Mô tả:** Người dùng nhập công thức không hợp lệ.

**Các bước:**
1. Chọn ô, nhập `=IF(A1>10, "yes", "no")`
2. Nhấn Enter

**Kết quả mong đợi:** Ô hiển thị `#ERR` (IF chưa được implement).

**Các trường hợp khác:**
- `=SUM()` (thiếu range) → `#ERR`
- `=1/0` → `Infinity` (JavaScript, không phải lỗi SP)
- `=abc` → `#ERR`

---

## UC-SS-07: Import file CSV

**Mô tả:** Người dùng import dữ liệu từ file CSV có sẵn.

**Các bước:**
1. Chuẩn bị file CSV (VD: data.csv với 5 dòng, 3 cột)
2. Click "Import CSV"
3. Chọn file CSV
4. FileReader đọc nội dung → `parseCSV()` → grid mới
5. Grid được thay thế bằng dữ liệu từ CSV

**Kết quả mong đợi:**
- Dữ liệu từ CSV hiển thị trong bảng
- Kích thước grid tự động khớp với file CSV
- `modifiedCells` được reset (không còn ô vàng)
- `activeCell` reset về A1

**CSV mẫu:**
```csv
Name,Age,City
Alice,30,New York
Bob,25,London
Charlie,35,Tokyo
"O'Brien, Jr.",40,Dublin
```

---

## UC-SS-08: Export ra file CSV

**Mô tả:** Người dùng lưu bảng tính hiện tại ra file CSV.

**Các bước:**
1. Đã chỉnh sửa một số ô trong bảng
2. Click "Export CSV"
3. `gridToCSV()` chuyển grid thành string CSV
4. Trình duyệt download file `spreadsheet-export.csv`
5. Mở file bằng Excel/Google Sheets

**Kết quả mong đợi:** File CSV chứa đúng dữ liệu hiện tại của bảng, bao gồm cả ô đã sửa và ô trống.

---

## UC-SS-09: Thêm dòng mới

**Mô tả:** Người dùng thêm dòng vào cuối bảng.

**Các bước:**
1. Bảng hiện tại có 30 dòng
2. Click "＋ Row"
3. Dòng 31 xuất hiện (tất cả ô trống)

**Kết quả mong đợi:** Bảng tăng lên 31 dòng. Có thể thêm không giới hạn.

---

## UC-SS-10: Thêm cột mới

**Mô tả:** Người dùng thêm cột vào bên phải bảng.

**Các bước:**
1. Bảng hiện tại có 10 cột (A-J)
2. Click "＋ Col"
3. Cột K xuất hiện (tất cả ô trống)

**Kết quả mong đợi:** Bảng tăng lên 11 cột. Tất cả dòng hiện có được thêm 1 ô trống.

---

## UC-SS-11: Highlight ô đã chỉnh sửa

**Mô tả:** Các ô đã được thay đổi có màu nền vàng để dễ theo dõi.

**Các bước:**
1. Chỉnh sửa các ô: A1, B3, C5
2. Các ô này có nền amber (vàng nhạt)
3. Import CSV mới → tất cả highlight biến mất

**Kết quả mong đợi:** Chỉ các ô đã qua `setCell()` mới có highlight. Các ô được fill từ import hoặc khởi tạo không bị highlight.

---

## UC-SS-12: Gợi ý công thức khi gõ "="

**Mô tả:** Khi người dùng bắt đầu gõ công thức, dropdown suggestions xuất hiện.

**Các bước:**
1. Chọn ô bất kỳ, bắt đầu edit
2. Gõ `=` → suggestions dropdown xuất hiện với tất cả 6 công thức
3. Gõ `=S` → dropdown filter còn SUM (các công thức bắt đầu bằng S)
4. Dùng ↑↓ để di chuyển trong dropdown
5. Nhấn Enter → chọn công thức, hoàn thành `=SUM(`

**Kết quả mong đợi:**
- Dropdown chỉ hiện khi formula bar có giá trị bắt đầu bằng `=`
- Suggestions được lọc theo text sau dấu `=`
- Highlight suggestion được chọn (màu tím)

---

## UC-SS-13: Hủy chỉnh sửa (Escape)

**Mô tả:** Người dùng đang edit ô nhưng muốn hủy thay đổi.

**Các bước:**
1. Ô A1 đang có giá trị "Hello"
2. Double-click A1 → chế độ edit, formula bar hiển thị "Hello"
3. Gõ thêm " World" → formula bar hiển thị "Hello World"
4. Nhấn Escape
5. Ô A1 vẫn hiển thị "Hello" (giá trị cũ)

**Kết quả mong đợi:** Giữ nguyên giá trị cũ, thoát chế độ edit.

---

## UC-SS-14: Focus ô bằng cách click

**Mô tả:** Click chuột để chọn ô.

**Các bước:**
1. Click vào ô D5 → ô D5 được chọn (viền tím)
2. Formula bar hiển thị giá trị của D5 (hoặc evaluate nếu là công thức)
3. Click vào ô A1 → A1 được chọn, D5 mất focus

**Kết quả mong đợi:** Chỉ 1 ô được active tại một thời điểm.
