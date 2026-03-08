import { useRef, useLayoutEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

// Camera model using GLB - using a professional DSLR model
function CameraModel({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);

  // Using a high-quality camera model from a reliable CDN
  const { scene } = useGLTF('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/camera/model.gltf');

  // Clone the scene only once (not on every render) to avoid repeated material mutations
  const model = useMemo(() => scene.clone(), [scene]);

  // Apply materials and setup
  useLayoutEffect(() => {
    model.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.castShadow = true;
        child.receiveShadow = true;

        // Enhance materials for better appearance
        if (child.material) {
          const mat = child.material as THREE.MeshStandardMaterial;
          mat.roughness = Math.max(0.2, mat.roughness * 0.8);
          mat.metalness = Math.min(1, mat.metalness * 1.2);
        }
      }
    });
  }, [model]);

  // Animation frame
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Floating animation
    const floatY = Math.sin(time * 0.5) * 0.1;
    
    // Scroll-based transforms
    const scrollRotation = scrollProgress * Math.PI * 2;
    const scrollScale = 1 - scrollProgress * 0.2;
    const scrollY = -scrollProgress * 3;

    groupRef.current.position.y = floatY + scrollY;
    groupRef.current.rotation.y = scrollRotation + time * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.05 + scrollProgress * 0.3;
    groupRef.current.scale.setScalar(scrollScale * 2.5);
  });

  return (
    <group ref={groupRef}>
      <primitive object={model} />
    </group>
  );
}

// Scene setup
function Scene({ scrollProgress }: { scrollProgress: number }) {
  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={0.5} />

      {/* Main Key Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Fill Light */}
      <pointLight position={[-3, 2, 3]} intensity={0.5} />

      {/* Rim Light (Gold accent) */}
      <spotLight
        position={[-4, 4, -4]}
        intensity={0.8}
        angle={Math.PI / 6}
        penumbra={0.5}
        color="#d4af37"
      />

      {/* Camera Model */}
      <Float
        speed={2}
        rotationIntensity={0.3}
        floatIntensity={0.5}
      >
        <CameraModel scrollProgress={scrollProgress} />
      </Float>

      {/* Contact Shadows */}
      <ContactShadows
        position={[0, -2, 0]}
        opacity={0.4}
        scale={10}
        blur={2.5}
        far={4}
      />

      {/* Environment */}
      <Environment preset="city" />
    </>
  );
}

// Preload the model
useGLTF.preload('https://vazxmixjsiawhamofees.supabase.co/storage/v1/object/public/models/camera/model.gltf');

// Main Component
interface RealCameraGLBProps {
  scrollProgress?: number;
  className?: string;
}

export default function RealCameraGLB({ scrollProgress = 0, className = '' }: RealCameraGLBProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Suspense fallback={null}>
          <Scene scrollProgress={scrollProgress} />
        </Suspense>
      </Canvas>
    </div>
  );
}
