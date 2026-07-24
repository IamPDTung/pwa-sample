# Upload File Lớn — Các trường hợp sử dụng

## UC-UPLOAD-01: Upload file nhỏ (< 100MB)

**Mô tả:** Người dùng upload một file có kích thước nhỏ.

**Các bước:**
1. Vào `/upload`
2. Click "Choose File" → chọn file từ máy
3. Thông tin file hiển thị: tên file, kích thước
4. Click "Upload"
5. Progress bar chạy từ 0% → 100%
6. Hiển thị: "Upload complete: {kết quả JSON từ server}"

**Kết quả mong đợi:** File được lưu vào `uploads/` trên server. UI hiển thị progress và kết quả.

---

## UC-UPLOAD-02: Upload file lớn (5GB+)

**Mô tả:** Người dùng upload một file rất lớn, stream trực tiếp không dùng RAM.

**Các bước:**
1. Chọn file 5GB
2. Click "Upload"
3. XHR mở connection đến `/api/upload`
4. Server bắt đầu nhận stream → `Readable.fromWeb()` → `pipeline()` → `fs.createWriteStream()`
5. Progress bar cập nhật real-time qua `xhr.upload.onprogress`
6. Upload hoàn tất → server trả về JSON `{ ok: true, path: "uploads/..." }`

**Kết quả mong đợi:** Upload thành công, RAM server không thay đổi đáng kể (streaming).

**Kiểm tra:** Dùng Task Manager / `htop` để xác nhận RAM không tăng.

---

## UC-UPLOAD-03: Progress bar real-time

**Mô tả:** Người dùng theo dõi tiến trình upload qua progress bar.

**Các bước:**
1. Bắt đầu upload file 500MB
2. Quan sát progress bar
3. Progress bar có nhãn hiển thị % (ví dụ: "45%")
4. Thanh màu tím fill dần từ trái sang phải
5. Khi đạt 100% → hiển thị "Complete"

**Kết quả mong đợi:** Progress bar cập nhật mượt mà, phản ánh đúng tiến trình upload.

**Lưu ý:** Có thể thấy progress "nhảy" do chunk size của network. Đây là hành vi bình thường.

---

## UC-UPLOAD-04: Chuyển trang trong khi đang upload (state tồn tại)

**Mô tả:** Người dùng bắt đầu upload, sau đó chuyển sang trang khác. Upload vẫn tiếp tục.

**Điều kiện tiên quyết:** `UploadProvider` wrap toàn bộ layout.

**Các bước:**
1. Bắt đầu upload file 1GB tại `/upload`
2. Progress bar đang ở 30%
3. Click Navbar → chuyển sang `/push`
4. Xem nội dung `/push`
5. Click Navbar → quay lại `/upload`
6. Progress bar vẫn hiển thị đúng tiến trình (không bị reset)

**Kết quả mong đợi:** Upload tiếp tục chạy trong nền. Khi quay lại `/upload`, state vẫn chính xác.

**Giải thích:** Layout không unmount khi chuyển trang (client-side navigation của Next.js). XHR object vẫn tồn tại vì nó được giữ trong context state.

---

## UC-UPLOAD-05: Upload thất bại do mất mạng

**Mô tả:** Mất kết nối mạng trong khi đang upload.

**Các bước:**
1. Bắt đầu upload
2. Progress bar đang chạy
3. Ngắt kết nối mạng (WiFi off, airplane mode)
4. XHR phát hiện lỗi → `xhr.onerror` fire
5. Context dispatch `UPLOAD_ERROR` → state.error = "Network error"
6. Progress bar dừng, hiển thị thông báo lỗi màu đỏ

**Kết quả mong đợi:** Upload dừng, hiển thị lỗi "Network error".

**Lưu ý:** Hiện tại chưa có chức năng resume upload. Người dùng cần chọn lại file và upload từ đầu.

---

## UC-UPLOAD-06: Server trả về lỗi HTTP

**Mô tả:** Server gặp lỗi trong quá trình xử lý upload.

**Các bước:**
1. Bắt đầu upload
2. Server không thể ghi file (VD: hết dung lượng ổ đĩa)
3. Server trả về HTTP 500
4. `xhr.onload` fire với status 500
5. Context dispatch `UPLOAD_ERROR` → "HTTP 500"

**Kết quả mong đợi:** Hiển thị lỗi server, không crash.

---

## UC-UPLOAD-07: Chưa chọn file — nút disabled

**Mô tả:** Nút Upload bị vô hiệu hóa khi chưa chọn file.

**Các bước:**
1. Vào `/upload` lần đầu
2. Không chọn file
3. Nút "Upload" có màu xám và không click được
4. Chọn file → nút "Upload" chuyển sang màu tím và click được

**Kết quả mong đợi:** Nút Upload chỉ active khi đã chọn file.

---

## UC-UPLOAD-08: Đang upload — không thể chọn file mới

**Mô tả:** Khi đang upload, input file và nút Upload bị disabled.

**Các bước:**
1. Bắt đầu upload
2. Input file bị disabled
3. Nút Upload bị disabled
4. Upload hoàn tất hoặc lỗi → input file và nút enabled trở lại

**Kết quả mong đợi:** Không thể bắt đầu upload mới khi đang upload.

---

## UC-UPLOAD-09: Upload thành công — hiển thị kết quả

**Mô tả:** Upload hoàn tất, hiển thị thông tin file đã lưu.

**Các bước:**
1. Upload hoàn tất
2. Context dispatch `UPLOAD_SUCCESS`
3. Progress bar biến mất
4. Hiển thị kết quả từ server: `{ ok: true, path: "uploads/1712345678-upload.bin" }`

**Kết quả mong đợi:** Người dùng biết file đã được lưu ở đâu trên server.

---

## UC-UPLOAD-10: Reset state sau khi xem kết quả

**Mô tả:** Người dùng có thể chọn file mới sau khi upload hoàn tất.

**Các bước:**
1. Upload hoàn tất → kết quả hiển thị
2. State dispatch không tự reset
3. Người dùng chọn file mới → bắt đầu upload mới
4. `UPLOAD_START` dispatch → reset progress, result, error

**Kết quả mong đợi:** Có thể upload nhiều file liên tiếp.
