import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial } from "@react-three/drei";
import type * as THREE from "three";

function EarthSphere() {
    const meshRef = useRef<THREE.Mesh>(null);
    const cloudRef = useRef<THREE.Mesh>(null);

    useFrame((_, delta) => {
        if (meshRef.current) {
            meshRef.current.rotation.y += delta * 0.08;
        }
        if (cloudRef.current) {
            cloudRef.current.rotation.y += delta * 0.05;
            cloudRef.current.rotation.x += delta * 0.01;
        }
    });

    return (
        <group>
            {/* Earth core */}
            <Sphere ref={meshRef} args={[1.4, 64, 64]}>
                <meshPhongMaterial
                    color="#1a6b8a"
                    emissive="#0a2a40"
                    specular="#4ecdc4"
                    shininess={30}
                />
            </Sphere>

            {/* Land masses — green patches using a second sphere with holes */}
            <Sphere args={[1.41, 32, 32]}>
                <MeshDistortMaterial
                    color="#2d7a3a"
                    distort={0.15}
                    speed={0.3}
                    transparent
                    opacity={0.45}
                    roughness={0.8}
                />
            </Sphere>

            {/* Atmosphere glow */}
            <Sphere args={[1.55, 32, 32]}>
                <meshPhongMaterial
                    color="#66ccff"
                    transparent
                    opacity={0.08}
                    side={2}
                />
            </Sphere>

            {/* Cloud layer */}
            <Sphere ref={cloudRef} args={[1.48, 32, 32]}>
                <MeshDistortMaterial
                    color="#ffffff"
                    distort={0.25}
                    speed={0.5}
                    transparent
                    opacity={0.18}
                />
            </Sphere>

            {/* Outer glow */}
            <Sphere args={[1.65, 32, 32]}>
                <meshPhongMaterial
                    color="#6366F1"
                    transparent
                    opacity={0.04}
                    side={2}
                />
            </Sphere>
        </group>
    );
}

function GlobeFallback() {
    return (
        <div className="w-full h-full flex items-center justify-center">
            <div className="w-48 h-48 rounded-full bg-gradient-to-br from-[#1a6b8a] to-[#6366F1] animate-pulse opacity-60" />
        </div>
    );
}

export default function Globe3D() {
    return (
        <div className="w-full h-full min-h-[320px]" aria-hidden="true">
            <Suspense fallback={<GlobeFallback />}>
                <Canvas
                    camera={{ position: [0, 0, 4], fov: 45 }}
                    style={{ width: "100%", height: "100%" }}
                    gl={{ antialias: true, alpha: true }}
                >
                    <ambientLight intensity={0.4} />
                    <pointLight position={[5, 5, 5]} intensity={1.2} color="#ffffff" />
                    <pointLight position={[-5, -2, -3]} intensity={0.3} color="#66ccff" />
                    <pointLight position={[0, -5, 2]} intensity={0.2} color="#6366F1" />
                    <EarthSphere />
                </Canvas>
            </Suspense>
        </div>
    );
}
