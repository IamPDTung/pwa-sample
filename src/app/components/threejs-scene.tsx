"use client";

import { useRef, useEffect } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

function Controls() {
  const { camera, gl } = useThree();

  useEffect(() => {
    const controls = new OrbitControls(camera, gl.domElement);
    controls.autoRotate = true;
    controls.autoRotateSpeed = 1.2;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 12;

    return () => controls.dispose();
  }, [camera, gl]);

  return null;
}

function Cube() {
  const meshRef = useRef<THREE.Mesh>(null);

  return (
    <mesh
      ref={meshRef}
      position={[0, 1, 0]}
      castShadow
      receiveShadow
    >
      <boxGeometry args={[2, 2, 2]} />
      <meshStandardMaterial
        color="#7c3aed"
        roughness={0.3}
        metalness={0.1}
      />
    </mesh>
  );
}

function Ground() {
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.5, 0]}
      receiveShadow
    >
      <planeGeometry args={[20, 20]} />
      <meshStandardMaterial
        color="#e4e4e7"
        roughness={0.8}
        metalness={0}
      />
    </mesh>
  );
}

export default function ThreeJSScene() {
  return (
    <div className="w-full max-w-2xl mx-auto rounded-xl border border-zinc-200 dark:border-zinc-700 overflow-hidden shadow-sm">
      <Canvas
        shadows={{ type: THREE.PCFShadowMap }}
        camera={{ position: [4, 3, 6], fov: 45 }}
        style={{ height: 500 }}
        gl={{ antialias: true }}
        onCreated={({ gl }) => {
          gl.setClearColor(new THREE.Color("#fafafa"));
          gl.shadowMap.type = THREE.PCFShadowMap;
        }}
      >
        <ambientLight intensity={0.4} />
        <directionalLight
          position={[5, 8, 5]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
          shadow-camera-far={30}
          shadow-camera-left={-10}
          shadow-camera-right={10}
          shadow-camera-top={10}
          shadow-camera-bottom={-10}
        />
        <pointLight position={[-3, 2, -3]} intensity={0.5} color="#c4b5fd" />

        <Cube />
        <Ground />
        <Controls />

        <gridHelper
          args={[20, 20, "#d4d4d8", "#e4e4e7"]}
          position={[0, -0.49, 0]}
        />
        <axesHelper args={[5]} />
      </Canvas>
    </div>
  );
}
