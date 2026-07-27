# Three.js — Kiến trúc & Luồng hoạt động

## Tổng quan
Trang `/threejs` hiển thị một khối lập phương 3D tương tác, xây dựng bằng `@react-three/fiber` (React renderer cho Three.js). Người dùng có thể kéo để xoay, scroll để zoom, right-click để pan. Cube tự xoay khi không tương tác.

## Mục tiêu kỹ thuật
- **3D rendering** — khối lập phương với ánh sáng, bóng đổ, chất liệu PBR
- **Tương tác** — OrbitControls: rotate, zoom, pan; auto-rotate khi idle
- **Code splitting** — toàn bộ Three.js bundle chỉ tải khi vào trang (`next/dynamic` + `ssr: false`)
- **Responsive** — Canvas 500px cao, max-w-2xl, bo góc

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/threejs/page.tsx` | Server component: title + description + `<ThreeJSLoader />` + legend |
| `src/app/components/threejs-loader.tsx` | Client component wrapper: `next/dynamic(ssr: false)` với skeleton loading |
| `src/app/components/threejs-scene.tsx` | Client component: `<Canvas>` R3F, cube, lights, ground, controls |

## Các gói sử dụng

| Gói | Vai trò |
|---|---|
| `three` | Thư viện 3D gốc: geometries, materials, lights, shadows |
| `@react-three/fiber` | React renderer: `<Canvas>`, `<mesh>`, hooks (`useThree`, `useFrame`) |
| `@types/three` | TypeScript type definitions cho three |

## Luồng hoạt động

### 1. Code splitting
```
Người dùng vào /threejs
  → page.tsx (Server Component) render server-side: title + description + skeleton
  → threejs-loader.tsx (Client Component) mount
  → dynamic(() => import("./threejs-scene")) bắt đầu
  → Trong lúc load: skeleton animate-pulse "Loading 3D scene..."
  → Bundle load xong → threejs-scene.tsx mount
  → `<Canvas>` bắt đầu render
```

**Lý do cần `ssr: false`:**
- `three` sử dụng WebGL API (`HTMLCanvasElement.getContext('webgl2')`) — chỉ có trong browser
- `OrbitControls` cần `gl.domElement` — không tồn tại trên server
- Next.js 16 không cho phép `next/dynamic(ssr: false)` trong Server Component → cần wrapper Client Component

### 2. Canvas setup
```tsx
<Canvas
  shadows                              // Bật shadow map
  camera={{ position: [4, 3, 6], fov: 45 }}
  style={{ height: 500 }}
  gl={{ antialias: true }}            // Chống răng cưa
  onCreated={({ gl }) => {
    gl.setClearColor(new THREE.Color("#fafafa")); // Nền trắng
  }}
>
```

### 3. Ánh sáng
| Loại | Vị trí / Màu | Cường độ | Vai trò |
|---|---|---|---|
| `ambientLight` | — | 0.4 | Ánh sáng nền, tránh mặt tối đen hoàn toàn |
| `directionalLight` | [5, 8, 5] | 1.2 | Ánh sáng chính, có shadow, mô phỏng mặt trời |
| `pointLight` | [-3, 2, -3], màu `#c4b5fd` (violet nhạt) | 0.5 | Đèn điểm phụ, tạo hiệu ứng màu tím phản chiếu |

### 4. Cube
```tsx
<mesh position={[0, 1, 0]} castShadow receiveShadow>
  <boxGeometry args={[2, 2, 2]} />
  <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.1} />
</mesh>
```
- Kích thước: 2x2x2 units
- Vị trí: lơ lửng trên mặt đất (y=1)
- Màu: `#7c3aed` (violet-600, theme chính của app)
- Mặt gồ ghề nhẹ (roughness=0.3), ánh kim thấp (metalness=0.1)

### 5. OrbitControls — Tương tác
```tsx
function Controls() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.autoRotate = true;        // Tự xoay khi idle
    controls.autoRotateSpeed = 1.2;    // Tốc độ tự xoay
    controls.enableDamping = true;     // Giảm chấn (mượt mà)
    controls.dampingFactor = 0.08;     // Hệ số giảm chấn
    controls.minDistance = 3;          // Zoom-in tối đa
    controls.maxDistance = 12;         // Zoom-out tối đa

    return () => controls.dispose();   // Cleanup khi unmount
  }, [camera, gl]);

  return null;  // Component không render gì, chỉ side effect
}
```

**Tại sao dùng imperative thay vì JSX `<orbitControls />`:**
- Tránh vấn đề TypeScript `JSX.IntrinsicElements` với R3F custom elements
- Code đơn giản hơn, không cần `extend()`, `useFrame()`, `declare global`
- OrbitControls tự xử lý render loop (không cần `useFrame` gọi `controls.update()`)

### 6. Ground + grid + axes
- **Ground plane:** `planeGeometry 20x20` màu `#e4e4e7`, nhận bóng
- **Grid:** `20x20` ô, đường `#d4d4d8`, nền `#e4e4e7`
- **Axes:** `5 units` dài (đỏ=X, xanh=Y, xanh dương=Z)

## Flow tổng

```
GET /threejs
  → page.tsx (SSR): title + description + skeleton
  → Client hydrate
  → threejs-loader.tsx: dynamic import bundle
  → threejs-scene.tsx mount
  → requestAnimationFrame loop starts
  → WebGL render: lights → cube → ground → grid → axes
  → User tương tác:
      - mouseDown + move → OrbitControls.rotate()
      - scroll/wheel → OrbitControls.dollyZoom()
      - rightClick + move → OrbitControls.pan()
      - sau 0 delay → controls.autoRotate tiếp tục
  → User rời trang / unmount
      → controls.dispose()
      → Canvas cleanup (R3F tự động)
```
