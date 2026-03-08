import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

// Realistic DSLR Camera Model
function CameraModel({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const lensGroupRef = useRef<THREE.Group>(null);

  // Materials
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a1a1a'),
      roughness: 0.4,
      metalness: 0.6,
    });
  }, []);

  const gripMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0d0d0d'),
      roughness: 0.8,
      metalness: 0.2,
    });
  }, []);

  const lensBodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#111111'),
      roughness: 0.2,
      metalness: 0.8,
    });
  }, []);

  const lensGlassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#0a1a3a'),
      metalness: 1,
      roughness: 0.02,
      transmission: 0.3,
      thickness: 1,
      envMapIntensity: 2,
      clearcoat: 1,
      clearcoatRoughness: 0.02,
      ior: 1.5,
    });
  }, []);

  const chromeMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#c0c0c0'),
      roughness: 0.2,
      metalness: 1,
    });
  }, []);

  const goldAccentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d4af37'),
      roughness: 0.15,
      metalness: 1,
    });
  }, []);

  const buttonMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2a2a2a'),
      roughness: 0.4,
      metalness: 0.5,
    });
  }, []);

  // Scroll-based animation
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Base floating animation
    const floatY = Math.sin(time * 0.4) * 0.08;
    
    // Scroll-based rotation and scale
    const scrollRotation = scrollProgress * Math.PI * 1.5;
    const scrollScale = 1 - scrollProgress * 0.2;
    const scrollY = -scrollProgress * 2.5;

    groupRef.current.position.y = floatY + scrollY;
    groupRef.current.rotation.y = scrollRotation + time * 0.08;
    groupRef.current.rotation.x = Math.sin(time * 0.15) * 0.03 + scrollProgress * 0.2;
    groupRef.current.rotation.z = Math.cos(time * 0.1) * 0.02;
    groupRef.current.scale.setScalar(scrollScale);
  });

  // Lens breathing animation
  useFrame((state) => {
    if (!lensGroupRef.current) return;
    const time = state.clock.getElapsedTime();
    const breathe = 1 + Math.sin(time * 1.5) * 0.015;
    lensGroupRef.current.scale.set(breathe, breathe, 1);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Main Camera Body */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.2, 1.2]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* Grip (Right side) */}
      <mesh position={[1.3, -0.3, 0.4]} castShadow>
        <boxGeometry args={[0.6, 1.6, 0.8]} />
        <meshStandardMaterial {...gripMaterial} />
      </mesh>
      
      {/* Grip Texture Lines */}
      {Array.from({ length: 5 }, (_, i) => (
        <mesh key={i} position={[1.3, -0.3 + i * 0.25, 0.85]}>
          <boxGeometry args={[0.5, 0.02, 0.05]} />
          <meshStandardMaterial color="#050505" />
        </mesh>
      ))}

      {/* Prism / Viewfinder Hump */}
      <mesh position={[0, 1.3, -0.2]} castShadow>
        <boxGeometry args={[1.2, 0.5, 0.8]} />
        <meshStandardMaterial {...bodyMaterial} />
      </mesh>

      {/* Viewfinder Window */}
      <mesh position={[0, 1.3, 0.22]}>
        <boxGeometry args={[0.8, 0.3, 0.05]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} metalness={0.9} />
      </mesh>

      {/* Lens Mount Ring */}
      <mesh position={[0, 0, 0.7]} castShadow>
        <cylinderGeometry args={[0.9, 0.9, 0.15, 64]} />
        <meshStandardMaterial {...chromeMaterial} />
      </mesh>

      {/* Lens Group */}
      <group ref={lensGroupRef} position={[0, 0, 0]}>
        {/* Main Lens Barrel */}
        <mesh position={[0, 0, 1.1]} castShadow>
          <cylinderGeometry args={[0.75, 0.85, 0.6, 64]} />
          <meshStandardMaterial {...lensBodyMaterial} />
        </mesh>

        {/* Lens Focus Ring */}
        <mesh position={[0, 0, 1.3]} castShadow>
          <cylinderGeometry args={[0.72, 0.72, 0.25, 64]} />
          <meshStandardMaterial color="#1a1a1a" roughness={0.6} />
        </mesh>
        
        {/* Focus Ring Texture */}
        {Array.from({ length: 30 }, (_, i) => {
          const angle = (i * Math.PI * 2) / 30;
          return (
            <mesh
              key={i}
              position={[
                Math.cos(angle) * 0.73,
                1.3,
                Math.sin(angle) * 0.73
              ]}
              rotation={[0, -angle, 0]}
            >
              <boxGeometry args={[0.01, 0.2, 0.02]} />
              <meshStandardMaterial color="#0a0a0a" />
            </mesh>
          );
        })}

        {/* Front Lens Element */}
        <mesh position={[0, 0, 1.45]}>
          <cylinderGeometry args={[0.65, 0.65, 0.1, 64]} />
          <meshStandardMaterial {...lensBodyMaterial} />
        </mesh>

        {/* Lens Glass */}
        <mesh position={[0, 0, 1.51]}>
          <circleGeometry args={[0.6, 64]} />
          <meshPhysicalMaterial {...lensGlassMaterial} />
        </mesh>

        {/* Lens Reflection */}
        <mesh position={[0.2, 0.2, 1.52]}>
          <circleGeometry args={[0.15, 32]} />
          <meshBasicMaterial color="#4a6fa5" transparent opacity={0.3} />
        </mesh>

        {/* Gold Ring (Premium Lens Indicator) */}
        <mesh position={[0, 0, 0.85]}>
          <torusGeometry args={[0.88, 0.02, 16, 64]} />
          <meshStandardMaterial {...goldAccentMaterial} />
        </mesh>
      </group>

      {/* Shutter Button */}
      <mesh position={[1.2, 1.2, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.12, 0.08, 32]} />
        <meshStandardMaterial {...buttonMaterial} />
      </mesh>
      
      {/* Shutter Button Top */}
      <mesh position={[1.2, 1.25, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.1, 0.02, 32]} />
        <meshStandardMaterial color="#d4af37" />
      </mesh>

      {/* Mode Dial */}
      <mesh position={[-1, 1.15, -0.3]} castShadow>
        <cylinderGeometry args={[0.25, 0.25, 0.15, 32]} />
        <meshStandardMaterial {...buttonMaterial} />
      </mesh>
      
      {/* Mode Dial Markings */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        return (
          <mesh
            key={i}
            position={[
              -1 + Math.cos(angle) * 0.18,
              1.23,
              -0.3 + Math.sin(angle) * 0.18
            ]}
          >
            <boxGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial color="#d4af37" />
          </mesh>
        );
      })}

      {/* Rear LCD Screen */}
      <mesh position={[0, 0, -0.61]}>
        <boxGeometry args={[2.4, 1.6, 0.02]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.1} />
      </mesh>

      {/* LCD Screen Glow */}
      <mesh position={[0, 0, -0.62]}>
        <planeGeometry args={[2.2, 1.4]} />
        <meshBasicMaterial color="#1a1a2e" />
      </mesh>

      {/* Control Buttons (Back) */}
      <mesh position={[1.2, -0.6, -0.61]} castShadow>
        <circleGeometry args={[0.12, 32]} />
        <meshStandardMaterial {...buttonMaterial} />
      </mesh>

      <mesh position={[0.8, -0.6, -0.61]} castShadow>
        <circleGeometry args={[0.1, 32]} />
        <meshStandardMaterial {...buttonMaterial} />
      </mesh>

      {/* AF Assist Lamp */}
      <mesh position={[1.3, 0.7, 0.61]}>
        <circleGeometry args={[0.06, 32]} />
        <meshStandardMaterial color="#1a1a1a" />
      </mesh>

      {/* Red Eye Reduction Lamp */}
      <mesh position={[1.15, 0.7, 0.61]}>
        <circleGeometry args={[0.04, 32]} />
        <meshStandardMaterial color="#330000" />
      </mesh>

      {/* Flash Hotshoe */}
      <mesh position={[0, 1.6, -0.2]} castShadow>
        <boxGeometry args={[0.5, 0.08, 0.3]} />
        <meshStandardMaterial {...chromeMaterial} />
      </mesh>

      {/* Brand Logo Area */}
      <mesh position={[0, 0.7, 0.61]}>
        <planeGeometry args={[0.6, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" />
      </mesh>

      {/* Microphone Holes */}
      {Array.from({ length: 3 }, (_, i) => (
        <mesh key={i} position={[-1.2 + i * 0.08, 0.9, 0.61]}>
          <circleGeometry args={[0.015, 16]} />
          <meshStandardMaterial color="#0a0a0a" />
        </mesh>
      ))}

      {/* Strap Loops */}
      <mesh position={[-1.7, 0.8, 0]} castShadow>
        <torusGeometry args={[0.08, 0.03, 16, 32]} />
        <meshStandardMaterial {...chromeMaterial} />
      </mesh>
      
      <mesh position={[1.7, 0.8, 0]} castShadow>
        <torusGeometry args={[0.08, 0.03, 16, 32]} />
        <meshStandardMaterial {...chromeMaterial} />
      </mesh>
    </group>
  );
}

// Scene lighting and environment
function Scene({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useEffect(() => {
    camera.position.set(0, 0, 7);
  }, [camera]);

  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={0.4} />

      {/* Main Key Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.2}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-near={0.1}
        shadow-camera-far={20}
      />

      {/* Fill Light */}
      <directionalLight
        position={[-3, 2, 3]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Rim Light (Gold accent) */}
      <spotLight
        position={[-4, 4, -4]}
        intensity={0.8}
        angle={Math.PI / 6}
        penumbra={0.5}
        color="#d4af37"
      />

      {/* Bottom Fill */}
      <pointLight
        position={[0, -3, 2]}
        intensity={0.3}
        color="#ffffff"
      />

      {/* Camera Model with Float Animation */}
      <Float
        speed={1.5}
        rotationIntensity={0.2}
        floatIntensity={0.4}
      >
        <CameraModel scrollProgress={scrollProgress} />
      </Float>

      {/* Contact Shadows */}
      <ContactShadows
        position={[0, -2.5, 0]}
        opacity={0.3}
        scale={12}
        blur={3}
        far={5}
      />

      {/* Environment */}
      <Environment preset="city" />
    </>
  );
}

// Main RealisticCamera Component
interface RealisticCameraProps {
  scrollProgress?: number;
  className?: string;
}

export default function RealisticCamera({ scrollProgress = 0, className = '' }: RealisticCameraProps) {
  return (
    <div className={`w-full h-full ${className}`}>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0, 7], fov: 45 }}
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
      >
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
