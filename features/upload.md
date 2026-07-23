# Upload File Lớn

## Tổng quan
Trang `/upload` cho phép upload file với kích thước lớn (5GB - 100GB) lên server mà **không buffer toàn bộ file vào RAM**. Sử dụng streaming từ request body thẳng vào ổ đĩa.

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/upload/page.tsx` | Server component, render `<UploadTest />` |
| `src/app/components/upload-test.tsx` | Client component: file input + progress bar |
| `src/app/components/upload-context.tsx` | Context provider: giữ state upload qua route navigation |
| `src/app/api/upload/route.ts` | API POST: stream request body → file |

## Luồng hoạt động

### 1. Người dùng chọn file
```tsx
const [selectedFile, setSelectedFile] = useState<File | null>(null);

<input type="file" onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />

<button disabled={!selectedFile} onClick={startUpload}>
  Upload
</button>
```

**Fix quan trọng:** Trước đây button dùng `state.fileSize === 0` để check disabled, nhưng `fileSize` chỉ được cập nhật khi click upload → deadlock. Fix bằng cách dùng local state `selectedFile`.

### 2. Bắt đầu upload (XMLHttpRequest)
```tsx
const startUpload = () => {
  if (!selectedFile) return;

  const xhr = new XMLHttpRequest();
  xhr.upload.addEventListener("progress", (e) => {
    if (e.lengthComputable) {
      const pct = Math.round((e.loaded / e.total) * 100);
      dispatch({ type: "UPLOAD_PROGRESS", payload: pct });
    }
  });

  xhr.addEventListener("load", () => {
    if (xhr.status >= 200 && xhr.status < 300) {
      dispatch({ type: "UPLOAD_SUCCESS", payload: xhr.responseText });
    } else {
      dispatch({ type: "UPLOAD_ERROR", payload: `HTTP ${xhr.status}` });
    }
  });

  xhr.addEventListener("error", () => {
    dispatch({ type: "UPLOAD_ERROR", payload: "Network error" });
  });

  xhr.open("POST", "/api/upload");
  xhr.send(selectedFile);
};
```

**Tại sao dùng XMLHttpRequest thay vì fetch?**
- `fetch` không hỗ trợ upload progress tracking
- `XMLHttpRequest.upload.onprogress` cung cấp `loaded` và `total` bytes
- Phù hợp cho progress bar real-time

### 3. Upload Context (giữ state qua navigation)
```tsx
// upload-context.tsx
interface UploadState {
  uploading: boolean;
  progress: number;
  fileSize: number;
  result: string | null;
  error: string | null;
}
```

- `UploadProvider` wrap toàn bộ layout trong `layout.tsx`
- Layout không bao giờ unmount trong client-side navigation
- XHR + progress bar tiếp tục chạy khi user chuyển trang

### 4. API Route (Backend streaming)
```tsx
// api/upload/route.ts
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import fs from "node:fs";

export async function POST(request: NextRequest) {
  const filePath = `uploads/${Date.now()}-upload.bin`;

  // Ép kiểu as any vì DOM ReadableStream ≠ Node.js ReadableStream
  const nodeStream = Readable.fromWeb(request.body as any);
  const writeStream = fs.createWriteStream(filePath);

  await pipeline(nodeStream, writeStream);

  return NextResponse.json({ ok: true, path: filePath });
}
```

**Tại sao `as any`?**
TypeScript có 2 định nghĩa `ReadableStream`: một từ DOM (dùng bởi `request.body`) và một từ Node.js. `Readable.fromWeb()` yêu cầu DOM ReadableStream nhưng TypeScript hiểu sai kiểu. `as any` là workaround an toàn.

**Tại sao dùng `pipeline()`?**
- `pipeline()` xử lý backpressure tự động
- Nếu disk write chậm hơn network read, nó tự động pause stream
- Không bao giờ buffer toàn bộ file vào RAM
- Hỗ trợ file lên đến 100GB

### 5. Flow hoàn chỉnh

```
User chọn file (5GB video.mp4)
  → Click Upload
  → XHR.open("POST", "/api/upload")
  → XHR.send(file)
  → API route nhận request.body (ReadableStream)
  → Readable.fromWeb() chuyển thành Node.js Readable
  → pipeline( readable → writable )
  → Dữ liệu stream trực tiếp vào ổ đĩa
  → Từng chunk: XHR upload.onprogress fires
  → UI cập nhật progress bar (%)
  → Khi stream kết thúc → XHR load event → hiển thị kết quả
```

## Lưu ý
- Thư mục `uploads/` cần tồn tại và có quyền ghi
- Upload context state được lưu trong `localStorage` để dashboard có thể hiển thị stats
- Không có giới hạn kích thước file trong code (có thể cấu hình qua `next.config.ts` nếu cần)
