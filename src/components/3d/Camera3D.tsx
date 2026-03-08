import { useRef, useMemo, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';

// Procedural Camera Model Component
function CameraModel({ scrollProgress }: { scrollProgress: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const lensRef = useRef<THREE.Mesh>(null);
  const bodyRef = useRef<THREE.Mesh>(null);

  // Create camera body geometry
  const cameraBody = useMemo(() => {
    const shape = new THREE.Shape();
    const width = 2.4;
    const height = 1.6;
    const depth = 0.8;
    const radius = 0.15;

    // Rounded rectangle shape
    shape.moveTo(-width/2 + radius, -height/2);
    shape.lineTo(width/2 - radius, -height/2);
    shape.quadraticCurveTo(width/2, -height/2, width/2, -height/2 + radius);
    shape.lineTo(width/2, height/2 - radius);
    shape.quadraticCurveTo(width/2, height/2, width/2 - radius, height/2);
    shape.lineTo(-width/2 + radius, height/2);
    shape.quadraticCurveTo(-width/2, height/2, -width/2, height/2 - radius);
    shape.lineTo(-width/2, -height/2 + radius);
    shape.quadraticCurveTo(-width/2, -height/2, -width/2 + radius, -height/2);

    const extrudeSettings = {
      depth,
      bevelEnabled: true,
      bevelSegments: 3,
      bevelSize: 0.05,
      bevelThickness: 0.05,
    };

    return new THREE.ExtrudeGeometry(shape, extrudeSettings);
  }, []);

  // Lens geometry
  const lensGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.7, 0.7, 0.6, 64);
  }, []);

  // Lens glass geometry
  const lensGlassGeometry = useMemo(() => {
    return new THREE.SphereGeometry(0.5, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.3);
  }, []);

  // Viewfinder geometry
  const viewfinderGeometry = useMemo(() => {
    return new THREE.BoxGeometry(0.6, 0.4, 0.3);
  }, []);

  // Shutter button geometry
  const shutterGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.15, 0.15, 0.15, 32);
  }, []);

  // Mode dial geometry
  const dialGeometry = useMemo(() => {
    return new THREE.CylinderGeometry(0.2, 0.2, 0.1, 32);
  }, []);

  // Materials
  const bodyMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1a1a1a'),
      roughness: 0.3,
      metalness: 0.7,
    });
  }, []);

  const lensMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0d0d0d'),
      roughness: 0.2,
      metalness: 0.8,
    });
  }, []);

  const lensGlassMaterial = useMemo(() => {
    return new THREE.MeshPhysicalMaterial({
      color: new THREE.Color('#1a3a5c'),
      metalness: 0.9,
      roughness: 0.05,
      transmission: 0.2,
      thickness: 0.5,
      envMapIntensity: 1.5,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
    });
  }, []);

  const goldAccentMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: new THREE.Color('#d4af37'),
      roughness: 0.2,
      metalness: 1,
    });
  }, []);

  // Scroll-based animation
  useFrame((state) => {
    if (!groupRef.current) return;

    const time = state.clock.getElapsedTime();
    
    // Base floating animation
    const floatY = Math.sin(time * 0.5) * 0.1;
    
    // Scroll-based rotation and scale
    const scrollRotation = scrollProgress * Math.PI * 2;
    const scrollScale = 1 - scrollProgress * 0.3;
    const scrollY = -scrollProgress * 3;

    groupRef.current.position.y = floatY + scrollY;
    groupRef.current.rotation.y = scrollRotation + time * 0.1;
    groupRef.current.rotation.x = Math.sin(time * 0.2) * 0.05 + scrollProgress * 0.3;
    groupRef.current.rotation.z = Math.cos(time * 0.15) * 0.03;
    groupRef.current.scale.setScalar(scrollScale);
  });

  // Lens pulse animation
  useFrame((state) => {
    if (!lensRef.current) return;
    const time = state.clock.getElapsedTime();
    const pulse = 1 + Math.sin(time * 2) * 0.02;
    lensRef.current.scale.setScalar(pulse);
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Camera Body */}
      <mesh 
        ref={bodyRef}
        geometry={cameraBody} 
        material={bodyMaterial}
        position={[0, 0, -0.4]}
        rotation={[0, 0, Math.PI]}
        castShadow
      />

      {/* Lens Mount Ring */}
      <mesh position={[0, 0, 0.45]} castShadow>
        <cylinderGeometry args={[0.75, 0.75, 0.1, 64]} />
        <meshStandardMaterial color="#2a2a2a" roughness={0.3} metalness={0.8} />
      </mesh>

      {/* Main Lens */}
      <mesh 
        ref={lensRef}
        geometry={lensGeometry} 
        material={lensMaterial}
        position={[0, 0, 0.7]}
        rotation={[Math.PI / 2, 0, 0]}
        castShadow
      />

      {/* Lens Glass */}
      <mesh 
        geometry={lensGlassGeometry} 
        material={lensGlassMaterial}
        position={[0, 0, 0.95]}
        rotation={[Math.PI / 2, 0, 0]}
      />

      {/* Lens Ring Detail */}
      <mesh position={[0, 0, 0.55]} castShadow>
        <torusGeometry args={[0.72, 0.03, 16, 64]} />
        <meshStandardMaterial color="#d4af37" roughness={0.2} metalness={1} />
      </mesh>

      {/* Viewfinder */}
      <mesh 
        geometry={viewfinderGeometry} 
        material={bodyMaterial}
        position={[-0.6, 0.5, 0.1]}
        castShadow
      />

      {/* Viewfinder Glass */}
      <mesh position={[-0.6, 0.5, 0.26]}>
        <planeGeometry args={[0.4, 0.25]} />
        <meshPhysicalMaterial 
          color="#111" 
          roughness={0.1} 
          metalness={0.9}
          envMapIntensity={2}
        />
      </mesh>

      {/* Shutter Button */}
      <mesh 
        geometry={shutterGeometry} 
        material={goldAccentMaterial}
        position={[0.8, 0.85, 0]}
        castShadow
      />

      {/* Mode Dial */}
      <mesh 
        geometry={dialGeometry} 
        material={bodyMaterial}
        position={[-0.8, 0.85, 0]}
        castShadow
      />

      {/* Mode Dial Markings */}
      {Array.from({ length: 8 }, (_, i) => {
        const angle = (i * Math.PI * 2) / 8;
        return (
          <mesh
            key={i}
            position={[
              -0.8 + Math.cos(angle) * 0.12,
              0.9,
              Math.sin(angle) * 0.12
            ]}
          >
            <boxGeometry args={[0.02, 0.02, 0.02]} />
            <meshStandardMaterial color="#d4af37" />
          </mesh>
        );
      })}

      {/* Brand Logo Area */}
      <mesh position={[0, 0.3, 0.42]}>
        <planeGeometry args={[0.8, 0.2]} />
        <meshStandardMaterial color="#0a0a0a" roughness={0.4} />
      </mesh>

      {/* Grip Texture */}
      <mesh position={[1, 0, 0]} castShadow>
        <boxGeometry args={[0.3, 1.2, 0.6]} />
        <meshStandardMaterial color="#111" roughness={0.8} />
      </mesh>

      {/* Flash Hotshoe */}
      <mesh position={[0, 0.85, -0.2]} castShadow>
        <boxGeometry args={[0.4, 0.05, 0.2]} />
        <meshStandardMaterial color="#222" metalness={0.8} />
      </mesh>
    </group>
  );
}

// Scene lighting and environment
function Scene({ scrollProgress }: { scrollProgress: number }) {
  const { camera } = useThree();

  useEffect(() => {
    // Initial camera position
    camera.position.set(0, 0, 6);
  }, [camera]);

  return (
    <>
      {/* Ambient Light */}
      <ambientLight intensity={0.3} />

      {/* Main Directional Light */}
      <directionalLight
        position={[5, 5, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
      />

      {/* Rim Light */}
      <spotLight
        position={[-5, 5, -5]}
        intensity={1}
        angle={Math.PI / 6}
        penumbra={1}
        color="#d4af37"
      />

      {/* Fill Light */}
      <pointLight
        position={[-3, -2, 3]}
        intensity={0.5}
        color="#ffffff"
      />

      {/* Camera Model with Float Animation */}
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

// Main Camera3D Component
interface Camera3DProps {
  scrollProgress?: number;
  className?: string;
}

export default function Camera3D({ scrollProgress = 0, className = '' }: Camera3DProps) {
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
        <Scene scrollProgress={scrollProgress} />
      </Canvas>
    </div>
  );
}
