# Bảng Ảo (Virtual Table) — Các trường hợp sử dụng

## UC-VT-01: Scroll xuống để load thêm dữ liệu

**Mô tả:** Người dùng scroll dọc bảng, dữ liệu mới tự động load khi chạm gần cuối.

**Các bước:**
1. Vào `/virtual`
2. Bảng hiển thị ~50 dòng đầu tiên
3. Scroll xuống chậm → các dòng mới render liên tục
4. Khi scroll gần cuối (cách dòng cuối <10) → fetch thêm 50 dòng
5. Dữ liệu append vào cuối bảng
6. Tiếp tục scroll → lặp lại cho đến hết 100k dòng

**Kết quả mong đợi:** Scroll mượt, không lag, không cần reload trang. Có thể scroll hết 100k dòng.

---

## UC-VT-02: Sắp xếp theo cột

**Mô tả:** Người dùng click header cột để sắp xếp dữ liệu.

**Các bước:**
1. Bảng đã load một số dữ liệu
2. Click header "Name" → mũi tên ↑ xuất hiện (ascending)
3. Bảng reset về đầu, load dữ liệu đã sort A→Z
4. Click header "Name" lần nữa → mũi tên ↓ (descending)
5. Bảng reset, load dữ liệu sort Z→A
6. Click header "Age" → sort ascending theo tuổi

**Kết quả mong đợi:**
- Sort được xử lý trên server (API sort parameter)
- Khi sort, dữ liệu cũ bị xóa, bắt đầu load từ đầu
- Có thể sort theo bất kỳ cột nào: ID, Name, Age, Email, City, Score

---

## UC-VT-03: Export CSV dữ liệu đã load

**Mô tả:** Người dùng tải dữ liệu đã load về file CSV.

**Các bước:**
1. Đã scroll và load ~500 dòng dữ liệu
2. Click nút "Export CSV" (hiển thị khi rows.length > 0)
3. Trình duyệt download file `table-export-500-rows.csv`
4. Mở file bằng Excel / Google Sheets

**Kết quả mong đợi:** File CSV chứa đúng 500 dòng đã load, đúng cột, đúng dữ liệu.

**Lưu ý:** Chỉ export dữ liệu đã load (không phải toàn bộ 100k). Cần scroll load thêm nếu muốn export nhiều hơn.

---

## UC-VT-04: Xử lý khi mất mạng (offline)

**Mô tả:** Mất kết nối mạng trong khi đang scroll bảng.

**Các bước:**
1. Đã load 200 dòng, đang scroll tiếp
2. Mất mạng (offline mode)
3. Scroll gần cuối → trigger fetch
4. Fetch fail → hiển thị lỗi "Network error"
5. Nút "Retry" xuất hiện
6. 200 dòng đã load vẫn hiển thị bình thường

**Kết quả mong đợi:** Không infinite loop, không crash. Có thể xem dữ liệu đã load, nút Retry để thử lại.

---

## UC-VT-05: Retry sau khi lỗi

**Mô tả:** Sau khi mất mạng và có mạng lại, người dùng thử load tiếp.

**Các bước:**
1. Đang ở trạng thái lỗi (mất mạng), lỗi hiển thị
2. Bật mạng trở lại
3. Click "Retry"
4. `handleRetry()`: reset error state → fetchPage()
5. Dữ liệu load thành công, lỗi biến mất

**Kết quả mong đợi:** Tiếp tục load dữ liệu bình thường. Nút Retry biến mất.

---

## UC-VT-06: Loading indicator khi fetch

**Mô tả:** Hiển thị spinner khi đang load dữ liệu.

**Các bước:**
1. Scroll xuống cuối bảng
2. Fetch bắt đầu
3. Hàng cuối cùng của bảng hiển thị spinner/loading text
4. Fetch hoàn tất → spinner biến mất, dữ liệu mới append

**Kết quả mong đợi:** Người dùng biết dữ liệu đang được load.

---

## UC-VT-07: Hiệu suất với 100k dòng

**Mô tả:** Có tới 100k dòng dữ liệu, chỉ render các dòng trong viewport.

**Các bước:**
1. Scroll nhanh qua hàng nghìn dòng
2. Chỉ ~20-30 dòng được render trong DOM cùng lúc
3. Scroll mượt, không bị giật lag

**Kết quả mong đợi:** DOM node count thấp (<50 dòng), bộ nhớ thấp, FPS cao (>30fps khi scroll).

**Kiểm tra:** DevTools → Performance → record khi scroll → xác nhận frame rate.

---

## UC-VT-08: Scroll nhanh đến giữa bảng

**Mô tả:** Người dùng kéo scrollbar xuống nhanh đến vị trí ~50.000.

**Các bước:**
1. Bảng đã load ~100 dòng
2. Kéo scrollbar xuống mạnh (nhảy vài nghìn dòng)
3. TanStack Virtual ước lượng vị trí dựa trên `estimateSize`
4. Khi dừng ở ~50.000, các dòng đó được fetch (không cần load tuần tự từ đầu)

**Kết quả mong đợi:** Vị trí ước lượng gần đúng. Dữ liệu có thể load sai vị trí nhưng sau đó tự điều chỉnh. TanStack Virtual không yêu cầu load tuần tự.

**Lưu ý:** Đây là giới hạn của cursor pagination — không thể "nhảy" chính xác đến dòng N. Cần biết vị trí tuyệt đối (offset-based pagination) nếu muốn chính xác.

---

## UC-VT-09: Responsive — bảng hoạt động trên mobile

**Mô tả:** Xem bảng trên màn hình nhỏ.

**Các bước:**
1. Mở `/virtual` trên mobile (hoặc resize browser < 640px)
2. Bảng có horizontal scroll nếu không vừa
3. Có thể scroll dọc và ngang

**Kết quả mong đợi:** Bảng có thể scroll ngang. Các cột không bị cắt.
