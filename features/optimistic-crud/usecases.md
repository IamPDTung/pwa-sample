# Optimistic UI (CRUD) — Các trường hợp sử dụng

## UC-OP-01: Load danh sách items

**Mô tả:** Người dùng vào trang `/optimistic`, danh sách items được load từ API.

**Các bước:**
1. Vào `/optimistic`
2. Hiển thị loading spinner
3. Sau ~400ms (simulated latency) → 8 items hiển thị trong bảng
4. Bảng có các cột: ID, Title, Status, Created At, Actions

**Kết quả mong đợi:** Bảng hiển thị 8 items với các status khác nhau (active, inactive, draft).

---

## UC-OP-02: Thêm item mới (optimistic add)

**Mô tả:** Người dùng thêm item mới, UI cập nhật ngay lập tức.

**Các bước:**
1. Nhập "New Feature" vào ô input
2. Chọn status "draft" từ dropdown
3. Click "Add"
4. **Ngay lập tức:** dòng mới xuất hiện ở đầu bảng với:
   - Title: "New Feature"
   - Status: draft (màu cam nhạt)
   - ID: "optimistic-..." (tạm thời)
   - Độ mờ: opacity-60 (để phân biệt với dữ liệu đã confirm)
5. Sau ~300ms: server trả về item thật với ID thực
6. `onSettled` invalidateQueries → dòng optimistic được thay bằng dòng thật
7. Toast xanh: "Item added"

**Kết quả mong đợi:** UI phản hồi ngay lập tức, không cần chờ server. Sau đó đồng bộ với server.

---

## UC-OP-03: Thêm item thất bại + rollback

**Mô tả:** Thêm item nhưng server trả lỗi, UI tự động rollback.

**Các bước:**
1. Nhập "Will Fail" → click Add
2. **Ngay lập tức:** dòng mới xuất hiện (optimistic)
3. Tắt mạng (offline mode) trước khi server phản hồi
4. XHR fail
5. `onError`: rollback → dòng optimistic biến mất
6. Toast đỏ: "Failed to add item"

**Kết quả mong đợi:** Dữ liệu trở về trạng thái trước khi add. Không có dòng thừa.

---

## UC-OP-04: Xóa item (optimistic delete)

**Mô tả:** Người dùng xóa một item, dòng biến mất ngay lập tức.

**Các bước:**
1. Bảng đang hiển thị 8 items
2. Click "Delete" trên item đầu tiên
3. **Ngay lập tức:** dòng biến mất khỏi bảng
4. Sau ~300ms: server xác nhận xóa
5. Toast xanh: "Item deleted"

**Kết quả mong đợi:** UI mượt, không có lag khi xóa.

---

## UC-OP-05: Xóa item thất bại + rollback

**Mô tả:** Xóa item nhưng server lỗi, dòng xuất hiện lại.

**Các bước:**
1. Tạo item mới → server trả về ID thật (VD: id=15)
2. Click "Delete" trên item đó
3. **Ngay lập tức:** dòng biến mất
4. Tắt mạng
5. DELETE request fail
6. `onError`: rollback → dòng xuất hiện lại với dữ liệu cũ
7. Toast đỏ: "Failed to delete"

**Kết quả mong đợi:** Dữ liệu khôi phục chính xác. Không mất item.

---

## UC-OP-06: Đổi trạng thái item (optimistic update)

**Mô tả:** Người dùng thay đổi status của item qua dropdown.

**Các bước:**
1. Item có status "active" (xanh lá)
2. Click dropdown → chọn "inactive"
3. **Ngay lập tức:** status đổi thành "inactive" (đỏ nhạt) trong bảng
4. Sau ~300ms: server xác nhận
5. Toast xanh: "Status updated"

**Kết quả mong đợi:** Status thay đổi ngay, không cần chờ.

---

## UC-OP-07: Đổi trạng thái thất bại + rollback

**Mô tả:** Đổi status nhưng server lỗi, status quay về cũ.

**Các bước:**
1. Item có status "active"
2. Đổi sang "draft" → UI cập nhật ngay
3. Tắt mạng
4. PUT request fail
5. `onError`: rollback → status quay về "active"
6. Toast đỏ: "Failed to update status"

**Kết quả mong đợi:** Status quay về giá trị cũ chính xác.

---

## UC-OP-08: Test intentional fail endpoint

**Mô tả:** Dùng endpoint `intentional-fail` để test rollback một cách có chủ đích.

**Các bước:**
1. Thêm item mới → có ID thật (VD: id=12)
2. Dùng tool (Postman/console) gọi: `DELETE /api/items/intentional-fail`
3. Endpoint này luôn trả về HTTP 500
4. Hoặc: chưa có cách gọi trực tiếp từ UI — cần dùng console/browser dev tools
5. Kết quả: toast đỏ hiển thị lỗi

**Kết quả mong đợi:** Rollback hoạt động chính xác khi server trả lỗi có chủ đích.

**Lưu ý:** Endpoint `intentional-fail` tồn tại trong API route như một test helper.

---

## UC-OP-09: Status color coding

**Mô tả:** Mỗi status có màu sắc riêng để dễ nhận diện.

**Các bước:**
1. Quan sát bảng → các status có màu khác nhau:
   - `active` → xanh lá (green)
   - `inactive` → đỏ/xám (red/gray)
   - `draft` → cam (orange/amber)

**Kết quả mong đợi:** Nhận biết trạng thái nhanh chóng qua màu sắc.

---

## UC-OP-10: Refetch tự động sau mutation

**Mô tả:** Sau mỗi mutation (add/update/delete), dữ liệu được refetch để đồng bộ.

**Các bước:**
1. Thêm item → optimistic add → sau 300ms server trả về
2. `onSettled` chạy → `invalidateQueries(["items"])`
3. Query refetch → bảng cập nhật với dữ liệu mới từ server
4. ID optimistic được thay bằng ID thật
5. Item mới không còn bị mờ (opacity trở lại 100%)

**Kết quả mong đợi:** Dữ liệu luôn đồng bộ với server sau mỗi thao tác.

---

## UC-OP-11: Form validation — không được để trống title

**Mô tả:** Người dùng không thể thêm item với title rỗng.

**Các bước:**
1. Để trống ô input title
2. Click "Add" → button disabled (hoặc không submit)
3. Nhập title → click Add → hoạt động bình thường

**Kết quả mong đợi:** Chỉ thêm được item khi title không rỗng.

---

## UC-OP-12: Toast notifications auto-dismiss

**Mô tả:** Toast tự động biến mất sau 3.5 giây.

**Các bước:**
1. Thêm item → toast xanh "Item added" xuất hiện
2. Đợi 3.5s → toast tự biến mất (slide up + fade out)
3. Thêm item khác → toast mới xuất hiện (stack nếu toast cũ còn)

**Kết quả mong đợi:** Toast tự động dismiss, không cần click để đóng.

---

## UC-OP-13: Nhiều mutation liên tiếp

**Mô tả:** Người dùng thực hiện nhiều thao tác liên tiếp nhanh.

**Các bước:**
1. Click "Add" 3 lần liên tiếp (không đợi server)
2. Ba dòng optimistic xuất hiện ngay
3. Server xử lý từng request một
4. Mỗi request thành công → dòng optimistic được thay bằng dòng thật
5. Sau khi cả 3 hoàn tất → bảng có 3 items mới, không trùng lặp

**Kết quả mong đợi:** Các mutation độc lập, không conflict. `cancelQueries` đảm bảo refetch không chạy song song.

---

## UC-OP-14: Stale time — không refetch khi chuyển tab

**Mô tả:** Dữ liệu không bị refetch khi chuyển tab rồi quay lại trong 10s.

**Các bước:**
1. Vào `/optimistic` → load items
2. Chuyển sang tab `/push` 
3. Trong vòng 10s, quay lại `/optimistic`
4. Dữ liệu cũ hiển thị ngay (không refetch, không loading spinner)
5. Nếu quá 10s → refetch khi quay lại

**Kết quả mong đợi:** Trải nghiệm nhanh, không chờ loading khi chuyển tab trong thời gian ngắn.

**Cấu hình:** `staleTime: 10_000` trong QueryClient.
