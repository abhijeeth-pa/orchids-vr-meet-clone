"use client";

import { useRef, useState, useEffect, Suspense } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import {
  Environment,
  Text,
  Html,
  PerspectiveCamera,
  Stars,
  Grid,
  Float,
  Billboard,
} from "@react-three/drei";
import * as THREE from "three";
import { Participant } from "@/hooks/useMeeting";

// ─── Avatar Component ──────────────────────────────────────────────────────────
function Avatar({
  participant,
  isLocal,
}: {
  participant: Participant;
  isLocal: boolean;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.PointLight>(null);
  const [pos] = useState<[number, number, number]>(participant.vrPosition);
  const color = new THREE.Color(participant.avatarColor);

  useFrame((state) => {
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;

    // Gentle floating animation
    groupRef.current.position.y = pos[1] + Math.sin(t * 1.5 + pos[0]) * 0.08;
    groupRef.current.position.x = THREE.MathUtils.lerp(
      groupRef.current.position.x,
      participant.vrPosition[0],
      0.05
    );
    groupRef.current.position.z = THREE.MathUtils.lerp(
      groupRef.current.position.z,
      participant.vrPosition[2],
      0.05
    );

    // Speaking ring pulse
    if (ringRef.current) {
      const scale = participant.isSpeaking
        ? 1 + Math.sin(t * 8) * 0.15
        : 1;
      ringRef.current.scale.setScalar(scale);
    }

    // Glow when speaking
    if (glowRef.current) {
      glowRef.current.intensity = participant.isSpeaking
        ? 2 + Math.sin(t * 6) * 0.5
        : 0.5;
    }
  });

  const initial = participant.name.charAt(0).toUpperCase();

  return (
    <group
      ref={groupRef}
      position={[
        participant.vrPosition[0],
        participant.vrPosition[1],
        participant.vrPosition[2],
      ]}
    >
      {/* Glow light */}
      <pointLight
        ref={glowRef}
        color={participant.avatarColor}
        intensity={0.5}
        distance={3}
      />

      {/* Speaking ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.85, 0]}>
        <torusGeometry args={[0.6, 0.04, 8, 32]} />
        <meshStandardMaterial
          color={participant.isSpeaking ? "#06b6d4" : participant.avatarColor}
          emissive={participant.isSpeaking ? "#06b6d4" : participant.avatarColor}
          emissiveIntensity={participant.isSpeaking ? 2 : 0.3}
          transparent
          opacity={participant.isSpeaking ? 0.9 : 0.4}
        />
      </mesh>

      {/* Avatar body */}
      <mesh position={[0, -0.3, 0]}>
        <capsuleGeometry args={[0.25, 0.7, 8, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.2}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Avatar head */}
      <mesh position={[0, 0.6, 0]}>
        <sphereGeometry args={[0.28, 16, 16]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.3}
          roughness={0.2}
          metalness={0.7}
        />
      </mesh>

      {/* VR headset (visor) */}
      <mesh position={[0, 0.6, 0.2]}>
        <boxGeometry args={[0.4, 0.15, 0.12]} />
        <meshStandardMaterial
          color="#0a0a1a"
          emissive="#06b6d4"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>

      {/* Holographic name tag */}
      <Billboard position={[0, 1.15, 0]}>
        <mesh>
          <planeGeometry args={[1.4, 0.3]} />
          <meshStandardMaterial
            color="#000010"
            transparent
            opacity={0.7}
            emissive={participant.avatarColor}
            emissiveIntensity={0.1}
          />
        </mesh>
        <Text
          position={[0, 0, 0.01]}
          fontSize={0.12}
          color={participant.isSpeaking ? "#06b6d4" : "white"}
          anchorX="center"
          anchorY="middle"
          font={undefined}
        >
          {participant.name}
          {!participant.audioEnabled ? " 🔇" : ""}
          {!participant.videoEnabled ? " 📷" : ""}
          {isLocal ? " (You)" : ""}
        </Text>
      </Billboard>

      {/* Initial letter on head */}
      <Billboard position={[0, 0.6, 0.29]}>
        <Text
          fontSize={0.22}
          color="white"
          anchorX="center"
          anchorY="middle"
        >
          {initial}
        </Text>
      </Billboard>

      {/* Particle orbit */}
      <OrbitParticle color={participant.avatarColor} radius={0.8} speed={1.2} offset={0} />
      <OrbitParticle color={participant.avatarColor} radius={0.8} speed={1.2} offset={Math.PI} />
    </group>
  );
}

function OrbitParticle({
  color,
  radius,
  speed,
  offset,
}: {
  color: string;
  radius: number;
  speed: number;
  offset: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.elapsedTime * speed + offset;
    meshRef.current.position.x = Math.cos(t) * radius;
    meshRef.current.position.z = Math.sin(t) * radius;
    meshRef.current.position.y = Math.sin(t * 2) * 0.2;
  });
  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[0.04, 6, 6]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2}
      />
    </mesh>
  );
}

// ─── Screen Share Panel ───────────────────────────────────────────────────────
function ScreenSharePanel({
  stream,
  position,
}: {
  stream: MediaStream;
  position: [number, number, number];
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);
  const meshRef = useRef<THREE.Mesh>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play();
    const texture = new THREE.VideoTexture(video);
    textureRef.current = texture;
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).map = texture;
      (meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
    return () => {
      texture.dispose();
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <Float speed={0.5} rotationIntensity={0.02} floatIntensity={0.1}>
      <group position={position}>
        {/* Screen frame */}
        <mesh>
          <boxGeometry args={[4.2, 2.6, 0.05]} />
          <meshStandardMaterial color="#0d0f2a" emissive="#3b82f6" emissiveIntensity={0.3} />
        </mesh>
        {/* Screen */}
        <mesh ref={meshRef} position={[0, 0, 0.03]}>
          <planeGeometry args={[4, 2.4]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        {/* Label */}
        <Text position={[0, -1.4, 0.1]} fontSize={0.14} color="#3b82f6">
          SCREEN SHARE
        </Text>
        {/* Corner lights */}
        {[[-2, 1.2], [2, 1.2], [-2, -1.2], [2, -1.2]].map(([x, y], i) => (
          <pointLight
            key={i}
            position={[x as number, y as number, 0.2]}
            color="#3b82f6"
            intensity={0.5}
            distance={1}
          />
        ))}
      </group>
    </Float>
  );
}

// ─── VR Room Environment ──────────────────────────────────────────────────────
function VRRoom() {
  const floorRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!floorRef.current) return;
    // Animate floor shader offset
    const mat = floorRef.current.material as THREE.MeshStandardMaterial;
    if (mat.emissiveMap) {
      // subtle animation handled by grid helper
    }
  });

  return (
    <>
      {/* Ambient environment */}
      <ambientLight intensity={0.2} color="#1a1040" />
      <directionalLight position={[10, 10, 5]} intensity={0.5} color="#ffffff" />
      <pointLight position={[0, 5, 0]} intensity={1} color="#7c3aed" distance={20} />
      <pointLight position={[5, 3, -5]} intensity={0.8} color="#06b6d4" distance={15} />
      <pointLight position={[-5, 3, 5]} intensity={0.6} color="#ec4899" distance={12} />

      {/* Stars */}
      <Stars
        radius={50}
        depth={50}
        count={3000}
        factor={2}
        saturation={0.5}
        fade
        speed={0.3}
      />

      {/* Grid floor */}
      <Grid
        position={[0, -1, 0]}
        args={[30, 30]}
        cellColor="#7c3aed"
        sectionColor="#7c3aed"
        cellSize={1}
        sectionSize={5}
        fadeDistance={25}
        fadeStrength={1.5}
      />

      {/* Floor plane */}
      <mesh ref={floorRef} rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.01, 0]}>
        <planeGeometry args={[30, 30]} />
        <meshStandardMaterial
          color="#040610"
          roughness={0.8}
          metalness={0.3}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Holographic pillars */}
      {[
        [-6, 6], [6, 6], [-6, -6], [6, -6],
      ].map(([x, z], i) => (
        <HoloPillar key={i} position={[x as number, -1, z as number]} />
      ))}

      {/* Central hologram orb */}
      <CentralOrb />
    </>
  );
}

function HoloPillar({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const glowRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (glowRef.current) {
      glowRef.current.scale.y = 1 + Math.sin(t * 2 + position[0]) * 0.1;
    }
  });

  return (
    <group position={position}>
      {/* Pillar base */}
      <mesh>
        <cylinderGeometry args={[0.15, 0.2, 3, 8]} />
        <meshStandardMaterial
          color="#0d0f2a"
          emissive="#7c3aed"
          emissiveIntensity={0.5}
          roughness={0.1}
          metalness={0.9}
          transparent
          opacity={0.8}
        />
      </mesh>
      {/* Top cap */}
      <mesh position={[0, 1.6, 0]}>
        <boxGeometry args={[0.3, 0.1, 0.3]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={2}
        />
      </mesh>
      {/* Energy beam */}
      <mesh ref={glowRef} position={[0, 1.6, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 6, 6]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={3}
          transparent
          opacity={0.4}
        />
      </mesh>
      <pointLight position={[0, 1.5, 0]} color="#7c3aed" intensity={1.5} distance={4} />
    </group>
  );
}

function CentralOrb() {
  const orbRef = useRef<THREE.Mesh>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const ring2Ref = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (orbRef.current) {
      orbRef.current.rotation.y = t * 0.5;
      orbRef.current.position.y = 0 + Math.sin(t) * 0.15;
    }
    if (ringRef.current) {
      ringRef.current.rotation.z = t * 0.3;
      ringRef.current.rotation.x = Math.PI / 3 + Math.sin(t * 0.5) * 0.2;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.z = -t * 0.4;
      ring2Ref.current.rotation.y = t * 0.2;
    }
  });

  return (
    <group position={[0, 0.5, 0]}>
      <mesh ref={orbRef}>
        <icosahedronGeometry args={[0.5, 2]} />
        <meshStandardMaterial
          color="#7c3aed"
          emissive="#7c3aed"
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.9}
          wireframe
        />
      </mesh>
      <mesh ref={ringRef}>
        <torusGeometry args={[0.8, 0.02, 8, 64]} />
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={2} />
      </mesh>
      <mesh ref={ring2Ref}>
        <torusGeometry args={[1.1, 0.02, 8, 64]} />
        <meshStandardMaterial color="#ec4899" emissive="#ec4899" emissiveIntensity={1.5} />
      </mesh>
      <pointLight color="#7c3aed" intensity={2} distance={6} />
    </group>
  );
}

// ─── Camera Controller ────────────────────────────────────────────────────────
function CameraController({
  position,
  onPositionChange,
}: {
  position: [number, number, number];
  onPositionChange: (pos: [number, number, number], rot: [number, number, number]) => void;
}) {
  const { camera } = useThree();
  const keysRef = useRef<Set<string>>(new Set());
  const rotationRef = useRef({ y: 0 });
  const isDraggingRef = useRef(false);
  const lastMouseRef = useRef({ x: 0, y: 0 });
  const posRef = useRef<[number, number, number]>([...position] as [number, number, number]);

  useEffect(() => {
    camera.position.set(position[0], position[1] + 0.6, position[2]);

    const onKeyDown = (e: KeyboardEvent) => keysRef.current.add(e.key.toLowerCase());
    const onKeyUp = (e: KeyboardEvent) => keysRef.current.delete(e.key.toLowerCase());
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseRef.current.x;
      rotationRef.current.y -= dx * 0.003;
      lastMouseRef.current = { x: e.clientX, y: e.clientY };
    };
    const onMouseUp = () => { isDraggingRef.current = false; };

    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    window.addEventListener("mousedown", onMouseDown);
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("mousedown", onMouseDown);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, [camera, position]);

  useFrame((_, delta) => {
    const speed = 3 * delta;
    const ry = rotationRef.current.y;
    const keys = keysRef.current;

    let moved = false;
    const p = posRef.current;

    if (keys.has("w") || keys.has("arrowup")) {
      p[0] += Math.sin(ry) * speed;
      p[2] += Math.cos(ry) * speed;
      moved = true;
    }
    if (keys.has("s") || keys.has("arrowdown")) {
      p[0] -= Math.sin(ry) * speed;
      p[2] -= Math.cos(ry) * speed;
      moved = true;
    }
    if (keys.has("a") || keys.has("arrowleft")) {
      p[0] += Math.cos(ry) * speed;
      p[2] -= Math.sin(ry) * speed;
      moved = true;
    }
    if (keys.has("d") || keys.has("arrowright")) {
      p[0] -= Math.cos(ry) * speed;
      p[2] += Math.sin(ry) * speed;
      moved = true;
    }

    // Clamp to room bounds
    p[0] = THREE.MathUtils.clamp(p[0], -12, 12);
    p[2] = THREE.MathUtils.clamp(p[2], -12, 12);

    camera.position.set(p[0], 0.6, p[2]);
    camera.rotation.y = ry;
    camera.rotation.order = "YXZ";

    if (moved) {
      onPositionChange([...p] as [number, number, number], [0, ry, 0]);
    }
  });

  return null;
}

// ─── Video Texture Avatar ─────────────────────────────────────────────────────
function VideoAvatar({
  stream,
  position,
  name,
  color,
  isSpeaking,
}: {
  stream: MediaStream;
  position: [number, number, number];
  name: string;
  color: string;
  isSpeaking: boolean;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const textureRef = useRef<THREE.VideoTexture | null>(null);

  useEffect(() => {
    const video = document.createElement("video");
    video.srcObject = stream;
    video.play().catch(() => {});
    const texture = new THREE.VideoTexture(video);
    texture.minFilter = THREE.LinearFilter;
    textureRef.current = texture;
    if (meshRef.current) {
      (meshRef.current.material as THREE.MeshBasicMaterial).map = texture;
      (meshRef.current.material as THREE.MeshBasicMaterial).needsUpdate = true;
    }
    return () => {
      texture.dispose();
      video.srcObject = null;
    };
  }, [stream]);

  return (
    <Float speed={1} rotationIntensity={0.05} floatIntensity={0.1}>
      <group position={[position[0], position[1] + 0.8, position[2]]}>
        {/* Video circle frame */}
        <mesh rotation={[0, Math.PI, 0]}>
          <circleGeometry args={[0.4, 32]} />
          <meshBasicMaterial color="#111" />
        </mesh>
        <mesh ref={meshRef} rotation={[0, Math.PI, 0]} position={[0, 0, 0.01]}>
          <circleGeometry args={[0.38, 32]} />
          <meshBasicMaterial />
        </mesh>
        {/* Speaking ring */}
        <mesh rotation={[0, Math.PI, 0]}>
          <torusGeometry args={[0.42, 0.03, 8, 32]} />
          <meshStandardMaterial
            color={isSpeaking ? "#06b6d4" : color}
            emissive={isSpeaking ? "#06b6d4" : color}
            emissiveIntensity={isSpeaking ? 3 : 0.5}
          />
        </mesh>
      </group>
    </Float>
  );
}

// ─── Main VR Space Component ──────────────────────────────────────────────────
interface VRSpaceProps {
  participants: Participant[];
  localParticipant: Participant;
  screenStream: MediaStream | null;
  onPositionChange: (pos: [number, number, number], rot: [number, number, number]) => void;
}

export default function VRSpace({
  participants,
  localParticipant,
  screenStream,
  onPositionChange,
}: VRSpaceProps) {
  return (
    <div className="w-full h-full">
      <Canvas
        shadows
        gl={{ antialias: true, alpha: false }}
        camera={{ fov: 75, near: 0.1, far: 100 }}
        style={{ background: "#040610" }}
      >
        <Suspense fallback={null}>
          <VRRoom />

          {/* Local avatar */}
          <Avatar participant={localParticipant} isLocal={true} />

          {/* Remote participants */}
          {participants.map((p) => (
            <Avatar key={p.id} participant={p} isLocal={false} />
          ))}

          {/* Video streams for remote participants */}
          {participants
            .filter((p) => p.stream && p.videoEnabled)
            .map((p) => (
              <VideoAvatar
                key={`video-${p.id}`}
                stream={p.stream!}
                position={p.vrPosition}
                name={p.name}
                color={p.avatarColor}
                isSpeaking={p.isSpeaking}
              />
            ))}

          {/* Screen share panel */}
          {screenStream && (
            <ScreenSharePanel
              stream={screenStream}
              position={[0, 1.5, -5]}
            />
          )}

          {/* Camera controller */}
          <CameraController
            position={localParticipant.vrPosition}
            onPositionChange={onPositionChange}
          />
        </Suspense>
      </Canvas>

      {/* VR HUD Overlay */}
      <div className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-3 pointer-events-none">
        <div className="px-4 py-2 rounded-full bg-black/50 backdrop-blur-sm border border-purple-500/30 text-xs text-purple-300 font-mono">
          VR MODE • WASD/ARROWS to move • DRAG to look
        </div>
      </div>

      {/* Crosshair */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="w-4 h-4 relative">
          <div className="absolute top-1/2 left-0 right-0 h-px bg-white/30" />
          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-white/30" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-white/50" />
        </div>
      </div>

      {/* Mini-map */}
      <div className="absolute bottom-20 right-4 w-24 h-24 rounded-xl bg-black/60 border border-purple-500/30 overflow-hidden">
        <div className="relative w-full h-full">
          <div className="absolute inset-0" style={{
            backgroundImage: "linear-gradient(rgba(124,58,237,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(124,58,237,0.1) 1px, transparent 1px)",
            backgroundSize: "12px 12px",
          }} />
          {/* Local dot */}
          <div
            className="absolute w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_#7c3aed]"
            style={{
              left: `${((localParticipant.vrPosition[0] + 12) / 24) * 100}%`,
              top: `${((localParticipant.vrPosition[2] + 12) / 24) * 100}%`,
              transform: "translate(-50%, -50%)",
            }}
          />
          {participants.map((p) => (
            <div
              key={p.id}
              className="absolute w-1.5 h-1.5 rounded-full"
              style={{
                backgroundColor: p.avatarColor,
                left: `${((p.vrPosition[0] + 12) / 24) * 100}%`,
                top: `${((p.vrPosition[2] + 12) / 24) * 100}%`,
                transform: "translate(-50%, -50%)",
                boxShadow: `0 0 4px ${p.avatarColor}`,
              }}
            />
          ))}
          <div className="absolute bottom-1 left-1 text-[8px] text-purple-400/60">MAP</div>
        </div>
      </div>
    </div>
  );
}
