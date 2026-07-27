# Three.js — Kiến trúc & Luồng hoạt động

## Tổng quan
Trang `/threejs` là một **car viewer + driving game** với 5 mẫu xe thể thao built từ Three.js primitives. Người dùng chọn xe, lái bằng phím mũi tên trên bản đồ xanh 80×80 có cây (chướng ngại), cỏ (đi xuyên qua), và 10 nhẫn vàng (thu thập). Camera bám theo xe mượt mà. Khi xe chạm nhẫn, phát âm thanh "ting tong" qua Web Audio API và nhẫn mới xuất hiện ở vị trí ngẫu nhiên khác.

## Mục tiêu kỹ thuật
- **5 mẫu xe thể thao** — Coupe, Sedan, Hatchback, Muscle, Racing — built từ box/cylinder primitives
- **Car selector** — thanh thumbnail bên dưới canvas, click để đổi xe
- **Arrow-key driving** — ↑ tiến, ↓ lùi, ←→ lái trái/phải, tốc độ 8u/s, xoay 3rad/s
- **Bản đồ 80×80** — nền cỏ xanh, grid, 35 cây, 250 bụi cỏ
- **Tree collision** — xe không thể đi xuyên cây (car radius 2.0 + tree radius 1.3)
- **Grass passable** — xe đi xuyên qua cỏ bình thường
- **Camera follow** — OrbitControls target lerp theo vị trí xe (0.12 factor)
- **Ring collectible** — 10 nhẫn vàng (torus) rải trên bản đồ, thu thập để tăng điểm
- **Sound effect** — Web Audio API synthesized "ting tong" (880Hz → 660Hz) khi chạm nhẫn
- **Code splitting** — toàn bộ Three.js bundle chỉ tải khi vào trang (`next/dynamic` + `ssr: false`)

## Cấu trúc file

| File | Vai trò |
|---|---|
| `src/app/threejs/page.tsx` | Server component: title + description + `<ThreeJSLoader />` |
| `src/app/components/threejs-loader.tsx` | Client component wrapper: `next/dynamic(ssr: false)` với skeleton loading |
| `src/app/components/car-viewer.tsx` | Client component: `<Canvas>` R3F, car models, selector, driving, map, controls |

## Các gói sử dụng

| Gói | Vai trò |
|---|---|
| `three` | Thư viện 3D gốc: geometries, materials, lights, shadows |
| `@react-three/fiber` | React renderer: `<Canvas>`, hooks (`useThree`, `useFrame`) |
| `@types/three` | TypeScript type definitions |

## 5 mẫu xe

| # | Tên | Màu | Body (WxHxD) | Cabin | Wheel R | wheelY | Đặc điểm |
|---|---|---|---|---|---|---|---|
| 1 | Red Coupe | `#dc2626` | 2.8 × 0.8 × 1.3 | 1.0 × 0.5, z:-0.35 | 0.32 | -0.4 | Dáng thấp, cabin lùi sau |
| 2 | Blue Sedan | `#2563eb` | 3.2 × 0.75 × 1.25 | 1.3 × 0.55, z:-0.1 | 0.30 | -0.38 | Dài nhất, cabin giữa |
| 3 | Green Hatch | `#16a34a` | 2.5 × 0.85 × 1.2 | 1.2 × 0.6, z:-0.3 | 0.28 | -0.42 | Ngắn, cao, cabin lớn |
| 4 | Orange Muscle | `#ea580c` | 3.6 × 0.7 × 1.35 | 0.9 × 0.45, z:-0.8 | 0.35 | -0.35 | Mũi dài, cabin nhỏ lùi xa |
| 5 | Yellow Racer | `#eab308` | 2.8 × 0.55 × 1.2 | 0.8 × 0.35, z:-0.5 | 0.30 | -0.28 | Cực thấp, spoiler sau |

## Vị trí xe trên mặt đất

Mặt đất nằm ở y = -1.2. Xe được đặt sao cho **đáy bánh xe chạm mặt đất**:

```ts
carY = -1.2 - design.wheelY + design.wheelR
```

Ví dụ coupe: carY = -1.2 - (-0.4) + 0.32 = -0.48

## Cấu trúc xe (CarModel)

Mỗi xe gồm:
```
group (position, rotationY + PI/2 offset quay về +Z)
├── body mesh (boxGeometry) — thân xe, castShadow
├── cabin mesh (boxGeometry) — kính cabin, màu #111
├── headlights ×2 — box nhỏ phía trước, emissive #ffa
├── taillights ×2 — box nhỏ phía sau, emissive #f00
├── wheels ×4 (group quay PI/2 trên X)
│   ├── cylinder tire (đen, roughness 0.7)
│   └── cylinder hub (xám, metalness 0.4)
└── spoiler (chỉ racing) — box phía sau
```

## Hướng xe (rotation)

- Xe được built với **đầu hướng +X** (headlights tại +body.w/2)
- `rotationY + Math.PI/2` offset quay xe về **hướng +Z** (forward trên màn hình khi rotationY=0)
- ↑ tiến theo +Z, ↓ lùi theo -Z
- ← tăng rotation → lái trái, → giảm rotation → lái phải

## Bản đồ & Môi trường

### Map
- **Ground**: `planeGeometry 80×80`, màu xanh cỏ `#5a8f3c`, roughness 0.95
- **Grid**: `gridHelper 80×80`, màu `#4a7a30`

### Cây (35 cây)
- **Trunk**: `cylinderGeometry` màu nâu `#6b4226`, cao 2.5×scale
- **Canopy**: `coneGeometry` màu xanh đậm `#2d5a1e`, bán kính 1.2×scale
- Collision: `Math.hypot(tree.x - car.x, tree.z - car.z) < CAR_RADIUS + TREE_RADIUS`

### Cỏ (250 bụi)
- 3 `planeGeometry` màu xanh khác nhau (`#4a8c2a`, `#3d7a20`, `#55992e`) đặt chéo nhau
- `DoubleSide` rendering để thấy từ mọi góc
- Không có collision — xe đi xuyên qua

### Sinh vị trí
- Seeded random với `seed = 42` → deterministic
- Clear zone 6×6 quanh gốc tọa độ (xe khởi đầu)
- Cây cách nhau tối thiểu 4 units

## Driving system

### State
```ts
type CarState = { x: number; z: number; rotation: number }
const [car, setCar] = useState<CarState>({ x: 0, z: 0, rotation: 0 })
```

### Keyboard handler
- `keydown` thêm phím vào `keysRef.current` (Set)
- `keyup` xóa phím khỏi Set
- `useEffect` mount/unmount event listeners

### Movement loop (`setInterval` 16ms)
```ts
setCar((c) => {
  // Rotation
  ArrowLeft  → rotation += 3 * 0.016
  ArrowRight → rotation -= 3 * 0.016

  // Forward vector (car faces +Z at rotation=0)
  forwardZ = cos(rotation)
  forwardX = sin(rotation)

  // Movement
  ArrowUp   → newX += forwardX * 8 * 0.016, newZ += forwardZ * 8 * 0.016
  ArrowDown → newX -= ..., newZ -= ...

  // Collision check
  if treeCollides(newX, newZ) → revert to old position
})
```

### Collision detection
```ts
function treeCollides(x, z) {
  return trees.some(t => Math.hypot(t.x - x, t.z - z) < CAR_RADIUS + TREE_RADIUS)
}
```
- `CAR_RADIUS = 2.0`, `TREE_RADIUS = 1.3`
- Chỉ chặn di chuyển position — rotation vẫn hoạt động khi đứng sát cây
- Clamp trong phạm vi bản đồ (`±HALF_MAP - 3`)

## Camera follow

### Controls component
```tsx
function Controls({ x, z }) {
  const targetPos = useRef(new Vector3(x, 0.3, z))

  // Cập nhật targetPos.current mỗi render
  targetPos.current.set(x, 0.3, z)

  // OrbitControls tạo 1 lần với [camera, gl]
  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement)
    controls.autoRotate = false  // tắt auto-rotate — bám theo xe
    controls.minDistance = 3
    controls.maxDistance = 20
    return () => controls.dispose()
  }, [camera, gl])

  // Lerp target theo xe mỗi frame
  useFrame(() => { controls.target.lerp(targetPos.current, 0.12) })
}
```

### Camera params
- Starting position: `[4, 6, 8]`, fov: 50
- Target: lerp về `[car.x, 0.3, car.z]` factor 0.12
- Distance: 3–20, maxPolarAngle: PI/2.5

## Rings (nhẫn thu thập)

### Ring model
- `torusGeometry(0.8, 0.12, 16, 32)` — nhẫn vàng nhỏ, nằm ngang
- Vật liệu emissive `#ffa000`, roughness 0.1, metalness 0.8
- Vị trí Y = 0.3 (lơ lửng trên mặt đất)
- Spinning animation: `rotation.y += delta * 2.5` (xoay như đồng xu)

### State & spawn
```ts
type RingData = { id: number; x: number; z: number }
const RING_COUNT = 10

function spawnRings(count, trees): RingData[]  // sinh N nhẫn lúc khởi tạo
function spawnOneRing(carX, carZ, trees, existing): RingData | null  // sinh 1 nhẫn mới
```
- Sinh vị trí ngẫu nhiên (`Math.random()`, không seeded)
- Tránh vùng origin 6×6, cây (CAR_RADIUS + TREE_RADIUS + 2), các nhẫn khác
- Cách xe tối thiểu 12 units (`RING_SPAWN_DISTANCE`)
- Mỗi nhẫn có `id` tăng dần để làm React key

### Collision & thu thập
```ts
useEffect(() => {
  const collected = rings.filter(
    (r) => Math.hypot(r.x - car.x, r.z - car.z) < CAR_RADIUS + RING_RADIUS
  );
  if (collected.length > 0) {
    setRingCount(c => c + collected.length);
    playCollectSound(audioCtxRef);
    setRings(prev => {
      let updated = prev.filter(r => !collected.includes(r));
      for (let i = 0; i < collected.length; i++) {
        const rep = spawnOneRing(car.x, car.z, trees, updated);
        if (rep) updated = [...updated, rep];
      }
      return updated;
    });
  }
}, [car]);
```
- `CAR_RADIUS = 2.0`, `RING_RADIUS = 3.0`
- Khi thu thập: tăng điểm, phát âm thanh, xóa nhẫn cũ, sinh nhẫn mới

### Sound effect (Web Audio API)
```ts
function playCollectSound(audioCtxRef) {
  // AudioContext lazy init (tránh autoplay policy)
  const osc1 = oscillator(880Hz Sine, 0.3→0 gain trong 100ms)
  const osc2 = oscillator(660Hz Sine, 0→0.3→0 gain trong 200ms, delay 80ms)
  // Kết quả: âm "ting" cao → "tong" thấp
}
```

### Score UI
- Badge `🏆 Rings: N` màu amber, hiển thị bên dưới car selector
- Điểm tích lũy, không reset khi đổi xe

## Ánh sáng
| Loại | Vị trí | Cường độ | Vai trò |
|---|---|---|---|
| `ambientLight` | — | 0.6 | Ánh sáng nền |
| `directionalLight` | [20, 30, 20] | 1.5 | Ánh sáng chính, có shadow (2048×2048 map) |
| `directionalLight` | [-10, 15, -10] | 0.6 | Fill light |
| `pointLight` | [0, 15, 0] #c4b5fd | 0.4 | Đèn violet phụ |

## Code splitting flow
```
Người dùng vào /threejs
  → page.tsx (Server Component): title + skeleton
  → threejs-loader.tsx (Client Component) mount
  → dynamic(() => import("./car-viewer")) bắt đầu
  → Skeleton "Loading 3D scene..." (animate-pulse, 450px)
  → Bundle load xong → <Canvas> render
```
