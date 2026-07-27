"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import * as THREE from "three";

const cars = [
  {
    id: "coupe",
    name: "Red Coupe",
    color: "#dc2626",
    body: { w: 2.8, h: 0.8, d: 1.3 },
    cabin: { w: 1.0, h: 0.5, d: 1.1, z: -0.35, y: 0.65 },
    wheelR: 0.32,
    wheelY: -0.4,
    wheelX: 1.0,
    wheelZ: 0.75,
    spoiler: false,
  },
  {
    id: "sedan",
    name: "Blue Sedan",
    color: "#2563eb",
    body: { w: 3.2, h: 0.75, d: 1.25 },
    cabin: { w: 1.3, h: 0.55, d: 1.05, z: -0.1, y: 0.65 },
    wheelR: 0.3,
    wheelY: -0.38,
    wheelX: 1.1,
    wheelZ: 0.72,
    spoiler: false,
  },
  {
    id: "hatchback",
    name: "Green Hatch",
    color: "#16a34a",
    body: { w: 2.5, h: 0.85, d: 1.2 },
    cabin: { w: 1.2, h: 0.6, d: 1.05, z: -0.3, y: 0.72 },
    wheelR: 0.28,
    wheelY: -0.42,
    wheelX: 0.85,
    wheelZ: 0.7,
    spoiler: false,
  },
  {
    id: "muscle",
    name: "Orange Muscle",
    color: "#ea580c",
    body: { w: 3.6, h: 0.7, d: 1.35 },
    cabin: { w: 0.9, h: 0.45, d: 1.15, z: -0.8, y: 0.58 },
    wheelR: 0.35,
    wheelY: -0.35,
    wheelX: 1.3,
    wheelZ: 0.78,
    spoiler: false,
  },
  {
    id: "racing",
    name: "Yellow Racer",
    color: "#eab308",
    body: { w: 2.8, h: 0.55, d: 1.2 },
    cabin: { w: 0.8, h: 0.35, d: 0.85, z: -0.5, y: 0.45 },
    wheelR: 0.3,
    wheelY: -0.28,
    wheelX: 1.0,
    wheelZ: 0.7,
    spoiler: true,
  },
];

type CarDef = (typeof cars)[number];

const MAP_SIZE = 80;
const HALF_MAP = MAP_SIZE / 2;
const MOVE_SPEED = 40;
const ROTATE_SPEED = 20;
const CAR_RADIUS = 2.0;
const TREE_RADIUS = 1.3;
const CLAMP = (v: number) => Math.max(-HALF_MAP + 3, Math.min(HALF_MAP - 3, v));

function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateEnvironment(seed: number) {
  const rng = seededRandom(seed);
  const trees: { x: number; z: number; scale: number }[] = [];
  const grass: { x: number; z: number; scale: number }[] = [];

  const range = HALF_MAP - 4;
  let attempts = 0;

  while (trees.length < 35 && attempts < 500) {
    attempts++;
    const x = (rng() * 2 - 1) * range;
    const z = (rng() * 2 - 1) * range;
    if (Math.abs(x) < 6 && Math.abs(z) < 6) continue;
    const tooClose = trees.some(
      (t) => Math.hypot(t.x - x, t.z - z) < 4
    );
    if (!tooClose) {
      trees.push({ x, z, scale: 0.7 + rng() * 0.6 });
    }
  }

  for (let i = 0; i < 250; i++) {
    const x = (rng() * 2 - 1) * (range + 2);
    const z = (rng() * 2 - 1) * (range + 2);
    if (Math.abs(x) < 5 && Math.abs(z) < 5) continue;
    if (trees.some((t) => Math.hypot(t.x - x, t.z - z) < 2.5)) continue;
    grass.push({ x, z, scale: 0.5 + rng() * 0.8 });
  }

  return { trees, grass };
}

function treeCollides(x: number, z: number, trees: typeof envData.trees) {
  return trees.some((t) => Math.hypot(t.x - x, t.z - z) < CAR_RADIUS + TREE_RADIUS);
}

const envData = generateEnvironment(42);

function Wheel({ radius, color = "#1a1a1a" }: { radius: number; color?: string }) {
  return (
    <group rotation={[Math.PI / 2, 0, 0]}>
      <mesh>
        <cylinderGeometry args={[radius, radius, 0.3, 24]} />
        <meshStandardMaterial color={color} roughness={0.7} />
      </mesh>
      <mesh>
        <cylinderGeometry args={[radius * 0.65, radius * 0.65, 0.31, 8]} />
        <meshStandardMaterial color="#666" roughness={0.5} metalness={0.4} />
      </mesh>
    </group>
  );
}

function CarModel({
  design,
  position = [0, 0, 0],
  rotationY = 0,
}: {
  design: CarDef;
  position?: [number, number, number];
  rotationY?: number;
}) {
  const { body, cabin, wheelR, wheelY, wheelX, wheelZ, spoiler } = design;

  return (
    <group position={position} rotation={[0, rotationY + Math.PI / 2, 0]}>
      {/* Body */}
      <mesh castShadow>
        <boxGeometry args={[body.w, body.h, body.d]} />
        <meshStandardMaterial color={design.color} roughness={0.25} metalness={0.15} />
      </mesh>

      {/* Cabin */}
      <mesh castShadow position={[cabin.z, cabin.y, 0]}>
        <boxGeometry args={[cabin.w, cabin.h, cabin.d]} />
        <meshStandardMaterial color="#111" roughness={0.15} metalness={0.3} />
      </mesh>

      {/* Headlights */}
      <mesh position={[body.w / 2 - 0.05, 0.1, body.d / 2 - 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.15, 0.15]} />
        <meshStandardMaterial color="#ffd" roughness={0.1} emissive="#ffa" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[body.w / 2 - 0.05, 0.1, -body.d / 2 + 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.15, 0.15]} />
        <meshStandardMaterial color="#ffd" roughness={0.1} emissive="#ffa" emissiveIntensity={0.5} />
      </mesh>

      {/* Tail lights */}
      <mesh position={[-body.w / 2 + 0.05, 0.1, body.d / 2 - 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.15, 0.15]} />
        <meshStandardMaterial color="#f00" roughness={0.1} emissive="#f00" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[-body.w / 2 + 0.05, 0.1, -body.d / 2 + 0.05]} castShadow>
        <boxGeometry args={[0.08, 0.15, 0.15]} />
        <meshStandardMaterial color="#f00" roughness={0.1} emissive="#f00" emissiveIntensity={0.5} />
      </mesh>

      {/* Wheels */}
      <group position={[wheelX, wheelY, wheelZ]}>
        <Wheel radius={wheelR} />
      </group>
      <group position={[wheelX, wheelY, -wheelZ]}>
        <Wheel radius={wheelR} />
      </group>
      <group position={[-wheelX, wheelY, wheelZ]}>
        <Wheel radius={wheelR} />
      </group>
      <group position={[-wheelX, wheelY, -wheelZ]}>
        <Wheel radius={wheelR} />
      </group>

      {/* Spoiler */}
      {spoiler && (
        <group position={[-body.w / 2 + 0.1, body.h / 2 + 0.2, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.15, 0.4, body.d * 1.1]} />
            <meshStandardMaterial color={design.color} roughness={0.2} metalness={0.2} />
          </mesh>
          <mesh position={[0.1, 0, 0]} castShadow>
            <boxGeometry args={[0.1, 0.1, body.d * 1.1]} />
            <meshStandardMaterial color={design.color} roughness={0.2} metalness={0.2} />
          </mesh>
        </group>
      )}
    </group>
  );
}

function Controls({ x, z }: { x: number; z: number }) {
  const { camera, gl } = useThree();
  const controlsRef = useRef<OrbitControls | null>(null);
  const targetPos = useRef(new THREE.Vector3(x, 0.3, z));

  // eslint-disable-next-line react-hooks/refs
  targetPos.current.set(x, 0.3, z);

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.target.set(x, 0.3, z);
    controls.autoRotate = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 5;
    controls.maxDistance = 30;
    controls.maxPolarAngle = Math.PI / 2.5;
    controlsRef.current = controls;

    return () => controls.dispose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [camera, gl]);

  useFrame(() => {
    const c = controlsRef.current;
    if (!c) return;
    c.target.lerp(targetPos.current, 0.12);
    c.update();
  });

  return null;
}

function MapGround() {
  return (
    <>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.2, 0]} receiveShadow>
        <planeGeometry args={[MAP_SIZE, MAP_SIZE]} />
        <meshStandardMaterial color="#5a8f3c" roughness={0.95} />
      </mesh>
      <gridHelper
        args={[MAP_SIZE, MAP_SIZE, "#4a7a30", "#4a7a30"]}
        position={[0, -1.19, 0]}
      />
    </>
  );
}

function Tree({ x, z, scale }: { x: number; z: number; scale: number }) {
  const h = 2.5 * scale;
  const r = 0.25 * scale;
  return (
    <group position={[x, -1.2, z]}>
      <mesh castShadow position={[0, h / 2, 0]}>
        <cylinderGeometry args={[r * 0.7, r, h, 8]} />
        <meshStandardMaterial color="#6b4226" roughness={0.9} />
      </mesh>
      <mesh castShadow position={[0, h + 0.8 * scale, 0]}>
        <coneGeometry args={[1.2 * scale, 2.5 * scale, 8]} />
        <meshStandardMaterial color="#2d5a1e" roughness={0.7} />
      </mesh>
    </group>
  );
}

function GrassPatch({ x, z, scale }: { x: number; z: number; scale: number }) {
  return (
    <group position={[x, -1.18, z]}>
      <mesh>
        <planeGeometry args={[0.6 * scale, 0.3 * scale]} />
        <meshStandardMaterial color="#4a8c2a" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, Math.PI / 3, 0]}>
        <planeGeometry args={[0.5 * scale, 0.25 * scale]} />
        <meshStandardMaterial color="#3d7a20" roughness={1} side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[0, -Math.PI / 3, 0]}>
        <planeGeometry args={[0.5 * scale, 0.25 * scale]} />
        <meshStandardMaterial color="#55992e" roughness={1} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Scene({ design, car }: { design: CarDef; car: CarState }) {
  const { x, z, rotation } = car;

  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[20, 30, 20]}
        intensity={1.5}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-far={80}
        shadow-camera-left={-50}
        shadow-camera-right={50}
        shadow-camera-top={50}
        shadow-camera-bottom={-50}
      />
      <directionalLight position={[-10, 15, -10]} intensity={0.6} />
      <pointLight position={[0, 15, 0]} intensity={0.4} color="#c4b5fd" />

      <CarModel design={design} position={[x, -1.2 - design.wheelY + design.wheelR, z]} rotationY={rotation} />

      <MapGround />

      {envData.grass.map((g, i) => (
        <GrassPatch key={`g-${i}`} x={g.x} z={g.z} scale={g.scale} />
      ))}
      {envData.trees.map((t, i) => (
        <Tree key={`t-${i}`} x={t.x} z={t.z} scale={t.scale} />
      ))}

      <Controls x={x} z={z} />
    </>
  );
}

function CarThumbnail({
  car,
  active,
  onClick,
}: {
  car: CarDef;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1.5 px-4 py-3 rounded-xl border transition-all min-w-[90px] ${
        active
          ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-sm"
          : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
      }`}
    >
      <div
        className="w-10 h-6 rounded-md border border-zinc-300 dark:border-zinc-600"
        style={{ backgroundColor: car.color }}
      />
      <span
        className={`text-xs font-medium whitespace-nowrap ${
          active
            ? "text-violet-700 dark:text-violet-300"
            : "text-zinc-600 dark:text-zinc-400"
        }`}
      >
        {car.name}
      </span>
    </button>
  );
}

type CarState = { x: number; z: number; rotation: number };

export default function CarViewer() {
  const [selected, setSelected] = useState(cars[0]);
  const [car, setCar] = useState<CarState>({ x: 0, z: 0, rotation: 0 });
  const keysRef = useRef(new Set<string>());

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
      e.preventDefault();
      keysRef.current.add(e.key);
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    keysRef.current.delete(e.key);
  }, []);

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  const moveCar = useCallback(() => {
    const keys = keysRef.current;
    if (keys.size === 0) return;

    setCar((c) => {
      const { x: oldX, z: oldZ } = c;
      let rotation = c.rotation;

      if (keys.has("ArrowLeft")) {
        rotation += ROTATE_SPEED * 0.016;
      }
      if (keys.has("ArrowRight")) {
        rotation -= ROTATE_SPEED * 0.016;
      }

      let newX = oldX;
      let newZ = oldZ;

      const forwardZ = Math.cos(rotation);
      const forwardX = Math.sin(rotation);

      if (keys.has("ArrowUp")) {
        newX = oldX + forwardX * MOVE_SPEED * 0.016;
        newZ = oldZ + forwardZ * MOVE_SPEED * 0.016;
      }
      if (keys.has("ArrowDown")) {
        newX = oldX - forwardX * MOVE_SPEED * 0.016;
        newZ = oldZ - forwardZ * MOVE_SPEED * 0.016;
      }

      newX = CLAMP(newX);
      newZ = CLAMP(newZ);

      if (newX !== oldX || newZ !== oldZ) {
        if (treeCollides(newX, newZ, envData.trees)) {
          newX = oldX;
          newZ = oldZ;
        }
      }

      return { x: newX, z: newZ, rotation };
    });
  }, []);

  useEffect(() => {
    const id = setInterval(moveCar, 16);
    return () => clearInterval(id);
  }, [moveCar]);

  const switchCar = (car: CarDef) => {
    setSelected(car);
    setCar({ x: 0, z: 0, rotation: 0 });
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-4">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
        <Canvas
          shadows={{ type: THREE.PCFShadowMap }}
          camera={{ position: [6, 10, 12], fov: 50 }}
          style={{ height: 500, background: "#fafafa" }}
          gl={{ antialias: true }}
          onCreated={({ gl }) => {
            gl.shadowMap.type = THREE.PCFShadowMap;
          }}
        >
          <Scene design={selected} car={car} />
        </Canvas>
      </div>

      {/* Car selector */}
      <div className="flex flex-wrap justify-center gap-2">
        {cars.map((car) => (
          <CarThumbnail
            key={car.id}
            car={car}
            active={selected.id === car.id}
            onClick={() => switchCar(car)}
          />
        ))}
      </div>

      {/* Instructions */}
      <div className="flex flex-wrap justify-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
        <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 font-medium text-violet-600">
          ←↑↓→ Drive
        </span>
        <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
          🖱 Drag — Rotate
        </span>
        <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
          🔍 Scroll — Zoom
        </span>
        <span className="px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800">
          ✋ Right-click — Pan
        </span>
      </div>
    </div>
  );
}
