# Three.js — Kiến trúc & Luồng hoạt động

## Tổng quan
Trang `/threejs` hiển thị một **car viewer** với 5 mẫu xe thể thao built từ Three.js primitives (box, cylinder). Người dùng có thể chọn xe từ thanh selector, xoay, zoom, pan. Studio lighting via `@react-three/drei`.

## Mục tiêu kỹ thuật
- **5 mẫu xe thể thao** — Coupe, Sedan, Hatchback, Muscle, Racing — built từ box/cylinder primitives
- **Car selector** — thanh thumbnail bên dưới canvas, click để đổi xe
- **Tương tác** — OrbitControls: rotate, zoom, pan; auto-rotate khi idle
- **Studio lighting** — `<Environment preset="studio" />` + spot lights + contact shadows
- **Code splitting** — toàn bộ Three.js bundle chỉ tải khi vào trang (`next/dynamic` + `ssr: false`)
- **Responsive** — Canvas 450px cao, max-w-3xl

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/threejs/page.tsx` | Server component: title + description + `<ThreeJSLoader />` |
| `src/app/components/threejs-loader.tsx` | Client component wrapper: `next/dynamic(ssr: false)` với skeleton loading |
| `src/app/components/car-viewer.tsx` | Client component: `<Canvas>` R3F, car models, selector, controls, environment |

## Các gói sử dụng

| Gói | Vai trò |
|---|---|
| `three` | Thư viện 3D gốc: geometries, materials, lights, shadows |
| `@react-three/fiber` | React renderer: `<Canvas>`, hooks (`useThree`) |
| `@react-three/drei` | Utility helpers: `<Environment>`, `<ContactShadows>` |
| `@types/three` | TypeScript type definitions |

## 5 mẫu xe

| # | Tên | Màu | Body (WxHxD) | Cabin | Wheel R | Đặc điểm |
|---|---|---|---|---|---|---|
| 1 | Red Coupe | `#dc2626` | 2.8 x 0.8 x 1.3 | 1.0 x 0.5, z:-0.35 | 0.32 | Dáng thấp, cabin lùi sau |
| 2 | Blue Sedan | `#2563eb` | 3.2 x 0.75 x 1.25 | 1.3 x 0.55, z:-0.1 | 0.30 | Dài nhất, cabin giữa |
| 3 | Green Hatch | `#16a34a` | 2.5 x 0.85 x 1.2 | 1.2 x 0.6, z:-0.3 | 0.28 | Ngắn, cao, cabin lớn |
| 4 | Orange Muscle | `#ea580c` | 3.6 x 0.7 x 1.35 | 0.9 x 0.45, z:-0.8 | 0.35 | Mũi dài, cabin nhỏ lùi xa |
| 5 | Yellow Racer | `#eab308` | 2.8 x 0.55 x 1.2 | 0.8 x 0.35, z:-0.5 | 0.30 | Cực thấp, spoiler sau |

## Cấu trúc xe (CarModel)

Mỗi xe gồm:
```
group
├── body mesh (boxGeometry) — thân xe, castShadow
├── cabin mesh (boxGeometry) — kính cabin, màu #111
├── headlights ×2 — box nhỏ phía trước, emissive #ffa
├── taillights ×2 — box nhỏ phía sau, emissive #f00
├── wheels ×4 (group)
│   ├── cylinder tire (đen, roughness 0.7)
│   └── cylinder hub (xám, metalness 0.4)
└── spoiler (optional, chỉ racing) — box phía sau
```

## Luồng hoạt động

### 1. Code splitting
```
Người dùng vào /threejs
  → page.tsx (Server Component): title + skeleton
  → threejs-loader.tsx (Client Component) mount
  → dynamic(() => import("./car-viewer")) bắt đầu
  → Skeleton "Loading 3D scene..." (animate-pulse)
  → Bundle load xong → <Canvas> render
```

### 2. Canvas setup
```tsx
<Canvas shadows camera={{ position: [6, 3, 6], fov: 40 }} style={{ height: 450 }}>
  <Environment preset="studio" />
  <spotLight position={[10, 10, 10]} intensity={2} castShadow />
  <spotLight position={[-5, 8, -5]} intensity={1.2} />
  <ContactShadows position={[0, -1.2, 0]} opacity={0.4} scale={10} />
  <CarModel design={selected} />
  <Controls />
</Canvas>
```

### 3. Car selector
```tsx
const [selected, setSelected] = useState(cars[0]);
// Thanh thumbnail bên dưới canvas
// Click → setSelected(car) → CarModel re-render với design mới
```

### 4. OrbitControls
- Imperative creation trong useEffect (giống như cube scene)
- `autoRotate: true`, `autoRotateSpeed: 1.5`
- `minDistance: 4`, `maxDistance: 14`
- `maxPolarAngle: PI/2.2` — giới hạn góc nhìn từ trên xuống (không lật ngược)

### 5. Environment & Lighting
- `<Environment preset="studio" />` — HDR environment map, tạo phản xạ metallic trên xe
- 2 x `spotLight` — ánh sáng chính + fill light
- `<ContactShadows>` — bóng đổ mềm dưới xe (không cần shadow map phức tạp)
- `ambientLight intensity={0.3}` — ánh sáng nền
