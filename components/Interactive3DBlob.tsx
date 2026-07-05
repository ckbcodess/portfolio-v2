"use client";

import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { useTheme } from "next-themes";
import { Settings, X, ChevronDown, RefreshCw, Eye, EyeOff, Save, Trash2, Copy } from "lucide-react";

// --- 3D Simplex Noise Implementation ---
const F3 = 1.0 / 3.0;
const G3 = 1.0 / 6.0;
const grad3 = new Float32Array([
  1, 1, 0,  -1, 1, 0,  1, -1, 0,  -1, -1, 0,
  1, 0, 1,  -1, 0, 1,  1,  0, -1, -1,  0, -1,
  0, 1, 1,  0, -1, 1,  0,  1, -1,  0, -1, -1
]);

function createNoise3D(random = Math.random) {
  const p = new Uint8Array(256);
  for (let i = 0; i < 256; i++) p[i] = i;
  for (let i = 0; i < 255; i++) {
    const r = i + Math.floor(random() * (256 - i));
    const aux = p[i];
    p[i] = p[r];
    p[r] = aux;
  }
  const perm = new Uint8Array(512);
  const permMod12 = new Uint8Array(512);
  for (let i = 0; i < 512; i++) {
    perm[i] = p[i & 255];
    permMod12[i] = (perm[i] % 12);
  }

  return function noise3D(x: number, y: number, z: number) {
    let s = (x + y + z) * F3;
    let i = Math.floor(x + s);
    let j = Math.floor(y + s);
    let k = Math.floor(z + s);
    let t = (i + j + k) * G3;
    let X0 = i - t;
    let Y0 = j - t;
    let Z0 = k - t;
    let x0 = x - X0;
    let y0 = y - Y0;
    let z0 = z - Z0;

    let i1, j1, k1;
    let i2, j2, k2;

    if (x0 >= y0) {
      if (y0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
      else if (x0 >= z0) { i1 = 1; j1 = 0; k1 = 0; i2 = 1; j2 = 0; k2 = 1; }
      else { i1 = 0; j1 = 0; k1 = 1; i2 = 1; j2 = 0; k2 = 1; }
    } else {
      if (y0 < z0) { i1 = 0; j1 = 0; k1 = 1; i2 = 0; j2 = 1; k2 = 1; }
      else if (x0 < z0) { i1 = 0; j1 = 1; k1 = 0; i2 = 0; j2 = 1; k2 = 1; }
      else { i1 = 0; j1 = 1; k1 = 0; i2 = 1; j2 = 1; k2 = 0; }
    }

    let x1 = x0 - i1 + G3;
    let y1 = y0 - j1 + G3;
    let z1 = z0 - k1 + G3;
    let x2 = x0 - i2 + 2.0 * G3;
    let y2 = y0 - j2 + 2.0 * G3;
    let z2 = z0 - k2 + 2.0 * G3;
    let x3 = x0 - 1.0 + 3.0 * G3;
    let y3 = y0 - 1.0 + 3.0 * G3;
    let z3 = z0 - 1.0 + 3.0 * G3;

    let ii = i & 255;
    let jj = j & 255;
    let kk = k & 255;

    let n0, n1, n2, n3;

    let t0 = 0.6 - x0 * x0 - y0 * y0 - z0 * z0;
    if (t0 < 0) n0 = 0.0;
    else {
      t0 *= t0;
      let gi = permMod12[ii + perm[jj + perm[kk]]] * 3;
      n0 = t0 * t0 * (grad3[gi] * x0 + grad3[gi + 1] * y0 + grad3[gi + 2] * z0);
    }

    let t1 = 0.6 - x1 * x1 - y1 * y1 - z1 * z1;
    if (t1 < 0) n1 = 0.0;
    else {
      t1 *= t1;
      let gi = permMod12[ii + i1 + perm[jj + j1 + perm[kk + k1]]] * 3;
      n1 = t1 * t1 * (grad3[gi] * x1 + grad3[gi + 1] * y1 + grad3[gi + 2] * z1);
    }

    let t2 = 0.6 - x2 * x2 - y2 * y2 - z2 * z2;
    if (t2 < 0) n2 = 0.0;
    else {
      t2 *= t2;
      let gi = permMod12[ii + i2 + perm[jj + j2 + perm[kk + k2]]] * 3;
      n2 = t2 * t2 * (grad3[gi] * x2 + grad3[gi + 1] * y2 + grad3[gi + 2] * z2);
    }

    let t3 = 0.6 - x3 * x3 - y3 * y3 - z3 * z3;
    if (t3 < 0) n3 = 0.0;
    else {
      t3 *= t3;
      let gi = permMod12[ii + 1 + perm[jj + 1 + perm[kk + 1]]] * 3;
      n3 = t3 * t3 * (grad3[gi] * x3 + grad3[gi + 1] * y3 + grad3[gi + 2] * z3);
    }

    return 32.0 * (n0 + n1 + n2 + n3);
  };
}

// --- Shader Shaders with Twist Support ---
const vertexShader = `
  uniform float twistX;
  uniform float twistY;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPosition;

  mat4 rotationMatrixX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, c,   -s,  0.0,
      0.0, s,   c,   0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }

  mat4 rotationMatrixY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat4(
      c,   0.0, s,   0.0,
      0.0, 1.0, 0.0, 0.0,
      -s,  0.0, c,   0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }

  void main() {
    vec4 twistedPos = vec4(position, 1.0);
    
    // Twist deformation rotates coordinates along the axes
    if (twistY != 0.0) {
      float angleY = position.y * twistY;
      twistedPos = rotationMatrixY(angleY) * twistedPos;
    }
    if (twistX != 0.0) {
      float angleX = position.x * twistX;
      twistedPos = rotationMatrixX(angleX) * twistedPos;
    }

    vLocalPosition = twistedPos.xyz;
    
    // Recalculate normal orientation based on twist rotation
    vec4 twistedNormal = vec4(normal, 0.0);
    if (twistY != 0.0) {
      twistedNormal = rotationMatrixY(position.y * twistY) * twistedNormal;
    }
    if (twistX != 0.0) {
      twistedNormal = rotationMatrixX(position.x * twistX) * twistedNormal;
    }
    vNormal = normalize(normalMatrix * twistedNormal.xyz);

    vec4 worldPosition = modelMatrix * twistedPos;
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const fragmentShader = `
  uniform vec3 baseColor;
  uniform vec3 baseColor2;
  uniform vec3 rimColor;
  uniform float rimStrength;
  uniform float rimPower;

  // Molten heat parameters (smoothly mixed during hold transition)
  uniform float heat;
  uniform vec3 moltenColor;
  uniform vec3 moltenCoreColor;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPosition;

  void main() {
    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float facing = max(dot(viewDirection, normalize(vNormal)), 0.0);
    float fresnel = 1.0 - facing;

    // Linear vertical gradient along local Y position
    float gradT = clamp(vLocalPosition.y * 0.5 + 0.5, 0.0, 1.0);
    vec3 baseColorGrad = mix(baseColor, baseColor2, gradT);

    // Linearly mix parameters into molten colors based on hold heat
    vec3 base = mix(baseColorGrad, moltenColor, heat);
    vec3 rim = mix(rimColor, moltenCoreColor, heat);
    
    // Additive fresnel glow
    float rimAmount = pow(fresnel, rimPower) * (rimStrength + heat * 3.0);
    vec3 color = base + rim * rimAmount;

    // Optional molten core bleed
    color += moltenCoreColor * heat * pow(facing, 1.5) * 0.6;

    gl_FragColor = vec4(color, 1.0);
  }
`;

// --- Glow (Bloom / Halo) Shaders matching Twist ---
const glowVertexShader = `
  uniform float twistX;
  uniform float twistY;

  varying vec3 vNormal;
  varying vec3 vWorldPosition;
  varying vec3 vLocalPosition;

  mat4 rotationMatrixX(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat4(
      1.0, 0.0, 0.0, 0.0,
      0.0, c,   -s,  0.0,
      0.0, s,   c,   0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }

  mat4 rotationMatrixY(float angle) {
    float s = sin(angle);
    float c = cos(angle);
    return mat4(
      c,   0.0, s,   0.0,
      0.0, 1.0, 0.0, 0.0,
      -s,  0.0, c,   0.0,
      0.0, 0.0, 0.0, 1.0
    );
  }

  void main() {
    vec4 twistedPos = vec4(position, 1.0);
    if (twistY != 0.0) {
      twistedPos = rotationMatrixY(position.y * twistY) * twistedPos;
    }
    if (twistX != 0.0) {
      twistedPos = rotationMatrixX(position.x * twistX) * twistedPos;
    }

    vLocalPosition = twistedPos.xyz;
    
    vec4 twistedNormal = vec4(normal, 0.0);
    if (twistY != 0.0) {
      twistedNormal = rotationMatrixY(position.y * twistY) * twistedNormal;
    }
    if (twistX != 0.0) {
      twistedNormal = rotationMatrixX(position.x * twistX) * twistedNormal;
    }
    vNormal = normalize(normalMatrix * twistedNormal.xyz);

    vec4 worldPosition = modelMatrix * twistedPos;
    vWorldPosition = worldPosition.xyz;
    gl_Position = projectionMatrix * viewMatrix * worldPosition;
  }
`;

const glowFragmentShader = `
  uniform vec3 glowColor;
  uniform float uRadius;
  uniform float uGlowWidth;
  uniform float uGlowIntensity;
  uniform float uGlowPower;

  varying vec3 vLocalPosition;
  varying vec3 vNormal;
  varying vec3 vWorldPosition;

  void main() {
    float dist = (length(vLocalPosition) - uRadius) / (uRadius * uGlowWidth);
    float fade = clamp(1.0 - dist, 0.0, 1.0);
    float glow = pow(fade, uGlowPower) * uGlowIntensity;

    vec3 viewDirection = normalize(cameraPosition - vWorldPosition);
    float facing = max(dot(viewDirection, normalize(vNormal)), 0.0);
    float rim = pow(1.0 - facing, 2.0);

    gl_FragColor = vec4(glowColor, glow * (0.3 + 0.7 * rim));
  }
`;

export default function Interactive3DBlob() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();

  // Set mounted flag to prevent Next.js hydration mismatches
  useEffect(() => {
    setMounted(true);
  }, []);

  // --- 1. Preset Definitions (Mapped independent Light & Dark mode colors) ---
  const presets = {
    Soft: {
      name: "Soft",
      radius: 1.32,
      noiseScale: 0.70,
      noiseStrength: 0.10,
      speed: 0.50,
      lightColor: "#d4cde5",
      lightColor2: "#d0d8e1",
      lightRimColor: "#FFFFFF",
      lightGlowColor: "#FFFFFF",
      darkColor: "#0f4966",
      darkColor2: "#474176",
      darkRimColor: "#4e6179",
      darkGlowColor: "#333333",
      rimStrength: 0.53,
      rimPower: 1.56,
      followPointer: true,
      pointerTilt: 1.00,
      pointerFollow: 5.00,
      autoRotationSpeed: 0.002,
      bloomEnabled: false,
      holdEnabled: true,
      twistX: 0.85,
      twistY: 0.45,
      textureMode: 0, // None
      textureScale: 15.0,
      textureStrength: 0.04,
      textureRoundness: 1.00,
      pressScale: 1.20,
      pressNoiseMultiplier: 2.50,
      pressDuration: 2.00,
      moltenColor: "#2b65ee",
      moltenCoreColor: "#38f2ff"
    },
    Aurora: {
      name: "Aurora",
      radius: 1.05,
      noiseScale: 0.70,
      noiseStrength: 0.10,
      speed: 0.58,
      lightColor: "#14B8A6",
      lightColor2: "#27D6C7",
      lightRimColor: "#84CC16",
      lightGlowColor: "#A3E635",
      darkColor: "#0F766E",
      darkColor2: "#115E59",
      darkRimColor: "#4D7C0F",
      darkGlowColor: "#3F6212",
      rimStrength: 1.35,
      rimPower: 1.90,
      followPointer: true,
      pointerTilt: 0.42,
      pointerFollow: 5.00,
      autoRotationSpeed: 0.004,
      bloomEnabled: false,
      holdEnabled: true,
      twistX: 0.00,
      twistY: 0.00,
      textureMode: 0,
      textureScale: 15.0,
      textureStrength: 0.04,
      textureRoundness: 1.00
    },
    Molten: {
      name: "Molten",
      radius: 1.05,
      noiseScale: 0.70,
      noiseStrength: 0.10,
      speed: 0.72,
      lightColor: "#F97316",
      lightColor2: "#EA580C",
      lightRimColor: "#F59E0B",
      lightGlowColor: "#FBBF24",
      darkColor: "#C2410C",
      darkColor2: "#9A3412",
      darkRimColor: "#B45309",
      darkGlowColor: "#92400E",
      rimStrength: 2.10,
      rimPower: 2.80,
      followPointer: true,
      pointerTilt: 0.28,
      pointerFollow: 5.00,
      autoRotationSpeed: 0.002,
      bloomEnabled: false,
      holdEnabled: true,
      twistX: 0.00,
      twistY: 0.00,
      textureMode: 0,
      textureScale: 15.0,
      textureStrength: 0.04,
      textureRoundness: 1.00
    },
    NeonSunset: {
      name: "Neon Sunset",
      radius: 1.10,
      noiseScale: 0.85,
      noiseStrength: 0.12,
      speed: 0.45,
      lightColor: "#8B5CF6",
      lightColor2: "#D946EF",
      lightRimColor: "#F43F5E",
      lightGlowColor: "#FB7185",
      darkColor: "#4C1D95",
      darkColor2: "#701A75",
      darkRimColor: "#881337",
      darkGlowColor: "#4C0519",
      rimStrength: 2.50,
      rimPower: 2.50,
      followPointer: true,
      pointerTilt: 0.80,
      pointerFollow: 5.00,
      autoRotationSpeed: 0.003,
      bloomEnabled: true,
      holdEnabled: true,
      twistX: 0.20,
      twistY: 0.40,
      textureMode: 0,
      textureScale: 15.0,
      textureStrength: 0.04,
      textureRoundness: 1.00
    },
    CosmicJade: {
      name: "Cosmic Jade",
      radius: 1.10,
      noiseScale: 0.90,
      noiseStrength: 0.15,
      speed: 0.35,
      lightColor: "#0284C7",
      lightColor2: "#10B981",
      lightRimColor: "#FBBF24",
      lightGlowColor: "#FDE047",
      darkColor: "#0369A1",
      darkColor2: "#047857",
      darkRimColor: "#D97706",
      darkGlowColor: "#CA8A04",
      rimStrength: 1.80,
      rimPower: 3.00,
      followPointer: true,
      pointerTilt: 0.60,
      pointerFollow: 4.00,
      autoRotationSpeed: 0.002,
      bloomEnabled: true,
      holdEnabled: true,
      twistX: 0.50,
      twistY: 0.50,
      textureMode: 2, // Wavy displacement
      textureScale: 20.0,
      textureStrength: 0.06,
      textureRoundness: 1.00
    },
    Holographic: {
      name: "Holographic",
      radius: 1.08,
      noiseScale: 1.20,
      noiseStrength: 0.18,
      speed: 0.60,
      lightColor: "#FCA5A5",
      lightColor2: "#93C5FD",
      lightRimColor: "#FBCFE8",
      lightGlowColor: "#FFFFFF",
      darkColor: "#7F1D1D",
      darkColor2: "#1E3A8A",
      darkRimColor: "#701A75",
      darkGlowColor: "#312E81",
      rimStrength: 2.30,
      rimPower: 2.00,
      followPointer: true,
      pointerTilt: 0.90,
      pointerFollow: 6.00,
      autoRotationSpeed: 0.005,
      bloomEnabled: true,
      holdEnabled: true,
      twistX: -0.30,
      twistY: -0.30,
      textureMode: 3, // Beaded / Bumpy displacement
      textureScale: 35.0,
      textureStrength: 0.05,
      textureRoundness: 1.00
    },
    ChromeMetal: {
      name: "Chrome Metal",
      radius: 1.05,
      noiseScale: 0.65,
      noiseStrength: 0.08,
      speed: 0.30,
      lightColor: "#E5E7EB",
      lightColor2: "#9CA3AF",
      lightRimColor: "#FFFFFF",
      lightGlowColor: "#FFFFFF",
      darkColor: "#374151",
      darkColor2: "#1F2937",
      darkRimColor: "#9CA3AF",
      darkGlowColor: "#6B7280",
      rimStrength: 2.80,
      rimPower: 1.80,
      followPointer: true,
      pointerTilt: 0.70,
      pointerFollow: 5.00,
      autoRotationSpeed: 0.001,
      bloomEnabled: true,
      holdEnabled: true,
      twistX: 0.80,
      twistY: 0.80,
      textureMode: 1, // Ribbed / Striped displacement
      textureScale: 24.0,
      textureStrength: 0.07,
      textureRoundness: 1.00
    },
    CyberSlime: {
      name: "Cyber Slime",
      radius: 1.12,
      noiseScale: 1.40,
      noiseStrength: 0.22,
      speed: 0.75,
      lightColor: "#0D9488",
      lightColor2: "#10B981",
      lightRimColor: "#DB2777",
      lightGlowColor: "#F472B6",
      darkColor: "#115E59",
      darkColor2: "#064E3B",
      darkRimColor: "#9D174D",
      darkGlowColor: "#831843",
      rimStrength: 2.20,
      rimPower: 2.50,
      followPointer: true,
      pointerTilt: 1.10,
      pointerFollow: 5.00,
      autoRotationSpeed: 0.006,
      bloomEnabled: true,
      holdEnabled: true,
      twistX: 0.60,
      twistY: -0.60,
      textureMode: 4, // Diamond displacement
      textureScale: 25.0,
      textureStrength: 0.08,
      textureRoundness: 1.00
    }
  };

  // --- 2. State & Parameter Values ---
  const [isOpen, setIsOpen] = useState(false);
  const [activePreset, setActivePreset] = useState<string>("Soft");
  const [customPresets, setCustomPresets] = useState<any[]>([]);
  const [newPresetName, setNewPresetName] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Accordion UI State
  const [shapeOpen, setShapeOpen] = useState(true);
  const [materialOpen, setMaterialOpen] = useState(true);
  const [textureOpen, setTextureOpen] = useState(false);
  const [motionOpen, setMotionOpen] = useState(false);
  const [bloomOpen, setBloomOpen] = useState(false);
  const [holdOpen, setHoldOpen] = useState(false);
  const [presetManagerOpen, setPresetManagerOpen] = useState(true);

  // Material Toggle Tab for configuring Light Mode vs Dark Mode colors
  const [colorThemeConfig, setColorThemeConfig] = useState<"light" | "dark">("dark");

  // Sync colorThemeConfig on mount with resolvedTheme
  useEffect(() => {
    if (resolvedTheme === "light" || resolvedTheme === "dark") {
      setColorThemeConfig(resolvedTheme);
    }
  }, [resolvedTheme]);


  // Shape State
  const [radius, setRadius] = useState(presets.Soft.radius);
  const [noiseScale, setNoiseScale] = useState(presets.Soft.noiseScale);
  const [noiseStrength, setNoiseStrength] = useState(presets.Soft.noiseStrength);
  const [twistX, setTwistX] = useState(presets.Soft.twistX);
  const [twistY, setTwistY] = useState(presets.Soft.twistY);
  
  // Material Colors (Theme Aware)
  const [lightColor, setLightColor] = useState(presets.Soft.lightColor);
  const [lightColor2, setLightColor2] = useState(presets.Soft.lightColor2);
  const [lightRimColor, setLightRimColor] = useState(presets.Soft.lightRimColor);
  const [lightGlowColor, setLightGlowColor] = useState(presets.Soft.lightGlowColor);

  const [darkColor, setDarkColor] = useState(presets.Soft.darkColor);
  const [darkColor2, setDarkColor2] = useState(presets.Soft.darkColor2);
  const [darkRimColor, setDarkRimColor] = useState(presets.Soft.darkRimColor);
  const [darkGlowColor, setDarkGlowColor] = useState(presets.Soft.darkGlowColor);

  const [rimStrength, setRimStrength] = useState(presets.Soft.rimStrength);
  const [rimPower, setRimPower] = useState(presets.Soft.rimPower);

  // Surface Displacement Texture State (Physical height maps)
  const [textureMode, setTextureMode] = useState(presets.Soft.textureMode);
  const [textureScale, setTextureScale] = useState(presets.Soft.textureScale);
  const [textureStrength, setTextureStrength] = useState(presets.Soft.textureStrength);
  const [textureRoundness, setTextureRoundness] = useState(presets.Soft.textureRoundness);

  // Motion State
  const [speed, setSpeed] = useState(presets.Soft.speed);
  const [autoRotationSpeed, setAutoRotationSpeed] = useState(presets.Soft.autoRotationSpeed);
  const [followPointer, setFollowPointer] = useState(presets.Soft.followPointer);
  const [pointerTilt, setPointerTilt] = useState(presets.Soft.pointerTilt);
  const [pointerFollow, setPointerFollow] = useState(presets.Soft.pointerFollow);

  // Bloom Overlay state
  const [bloomEnabled, setBloomEnabled] = useState(presets.Soft.bloomEnabled);
  const [glowWidth, setGlowWidth] = useState(0.22);
  const [glowIntensity, setGlowIntensity] = useState(1.80);
  const [glowPower, setGlowPower] = useState(3.00);

  // Press Hold morphing state
  const [holdEnabled, setHoldEnabled] = useState(presets.Soft.holdEnabled);
  const [pressScale, setPressScale] = useState(presets.Soft.pressScale ?? 1.20);
  const [pressNoiseMultiplier, setPressNoiseMultiplier] = useState(presets.Soft.pressNoiseMultiplier ?? 2.50);
  const [pressDuration, setPressDuration] = useState(presets.Soft.pressDuration ?? 2.00);
  const [moltenColor, setMoltenColor] = useState(presets.Soft.moltenColor ?? "#2b65ee");
  const [moltenCoreColor, setMoltenCoreColor] = useState(presets.Soft.moltenCoreColor ?? "#38f2ff");

  // Animation Refs
  const isPressedRef = useRef(false);
  const pointerRef = useRef(new THREE.Vector2(0, 0));
  const heatRef = useRef(0.0);
  const timeOffsetRef = useRef(0.0);
  const themeRef = useRef(resolvedTheme);

  // Sync refs to avoid re-constructing WebGL loop
  const noiseScaleRef = useRef(noiseScale);
  const noiseStrengthRef = useRef(noiseStrength);
  const twistXRef = useRef(twistX);
  const twistYRef = useRef(twistY);
  const speedRef = useRef(speed);
  const autoRotationSpeedRef = useRef(autoRotationSpeed);
  
  const lightColorRef = useRef(lightColor);
  const lightColor2Ref = useRef(lightColor2);
  const lightRimColorRef = useRef(lightRimColor);
  const lightGlowColorRef = useRef(lightGlowColor);

  const darkColorRef = useRef(darkColor);
  const darkColor2Ref = useRef(darkColor2);
  const darkRimColorRef = useRef(darkRimColor);
  const darkGlowColorRef = useRef(darkGlowColor);

  const rimStrengthRef = useRef(rimStrength);
  const rimPowerRef = useRef(rimPower);

  const textureModeRef = useRef(textureMode);
  const textureScaleRef = useRef(textureScale);
  const textureStrengthRef = useRef(textureStrength);
  const textureRoundnessRef = useRef(textureRoundness);

  const followPointerRef = useRef(followPointer);
  const pointerTiltRef = useRef(pointerTilt);
  const pointerFollowRef = useRef(pointerFollow);

  const bloomEnabledRef = useRef(bloomEnabled);
  const glowWidthRef = useRef(glowWidth);
  const glowIntensityRef = useRef(glowIntensity);
  const glowPowerRef = useRef(glowPower);

  const holdEnabledRef = useRef(holdEnabled);
  const pressScaleRef = useRef(pressScale);
  const pressNoiseMultiplierRef = useRef(pressNoiseMultiplier);
  const pressDurationRef = useRef(pressDuration);
  const moltenColorRef = useRef(moltenColor);
  const moltenCoreColorRef = useRef(moltenCoreColor);

  useEffect(() => { noiseScaleRef.current = noiseScale; }, [noiseScale]);
  useEffect(() => { noiseStrengthRef.current = noiseStrength; }, [noiseStrength]);
  useEffect(() => { twistXRef.current = twistX; }, [twistX]);
  useEffect(() => { twistYRef.current = twistY; }, [twistY]);
  useEffect(() => { speedRef.current = speed; }, [speed]);
  useEffect(() => { autoRotationSpeedRef.current = autoRotationSpeed; }, [autoRotationSpeed]);
  
  useEffect(() => { lightColorRef.current = lightColor; }, [lightColor]);
  useEffect(() => { lightColor2Ref.current = lightColor2; }, [lightColor2]);
  useEffect(() => { lightRimColorRef.current = lightRimColor; }, [lightRimColor]);
  useEffect(() => { lightGlowColorRef.current = lightGlowColor; }, [lightGlowColor]);

  useEffect(() => { darkColorRef.current = darkColor; }, [darkColor]);
  useEffect(() => { darkColor2Ref.current = darkColor2; }, [darkColor2]);
  useEffect(() => { darkRimColorRef.current = darkRimColor; }, [darkRimColor]);
  useEffect(() => { darkGlowColorRef.current = darkGlowColor; }, [darkGlowColor]);

  useEffect(() => { rimStrengthRef.current = rimStrength; }, [rimStrength]);
  useEffect(() => { rimPowerRef.current = rimPower; }, [rimPower]);

  useEffect(() => { textureModeRef.current = textureMode; }, [textureMode]);
  useEffect(() => { textureScaleRef.current = textureScale; }, [textureScale]);
  useEffect(() => { textureStrengthRef.current = textureStrength; }, [textureStrength]);
  useEffect(() => { textureRoundnessRef.current = textureRoundness; }, [textureRoundness]);

  useEffect(() => { followPointerRef.current = followPointer; }, [followPointer]);
  useEffect(() => { pointerTiltRef.current = pointerTilt; }, [pointerTilt]);
  useEffect(() => { pointerFollowRef.current = pointerFollow; }, [pointerFollow]);
  
  useEffect(() => { bloomEnabledRef.current = bloomEnabled; }, [bloomEnabled]);
  useEffect(() => { glowWidthRef.current = glowWidth; }, [glowWidth]);
  useEffect(() => { glowIntensityRef.current = glowIntensity; }, [glowIntensity]);
  useEffect(() => { glowPowerRef.current = glowPower; }, [glowPower]);
  
  useEffect(() => { holdEnabledRef.current = holdEnabled; }, [holdEnabled]);
  useEffect(() => { pressScaleRef.current = pressScale; }, [pressScale]);
  useEffect(() => { pressNoiseMultiplierRef.current = pressNoiseMultiplier; }, [pressNoiseMultiplier]);
  useEffect(() => { pressDurationRef.current = pressDuration; }, [pressDuration]);
  useEffect(() => { moltenColorRef.current = moltenColor; }, [moltenColor]);
  useEffect(() => { moltenCoreColorRef.current = moltenCoreColor; }, [moltenCoreColor]);
  useEffect(() => { themeRef.current = resolvedTheme; }, [resolvedTheme]);

  // Load Preset helper
  const loadPreset = (presetKey: keyof typeof presets) => {
    setActivePreset(presetKey);
    const p = presets[presetKey] as any;
    setRadius(p.radius);
    setNoiseScale(p.noiseScale);
    setNoiseStrength(p.noiseStrength);
    setTwistX(p.twistX);
    setTwistY(p.twistY);
    
    // Load light/dark mode colors
    setLightColor(p.lightColor);
    setLightColor2(p.lightColor2);
    setLightRimColor(p.lightRimColor);
    setLightGlowColor(p.lightGlowColor);

    setDarkColor(p.darkColor);
    setDarkColor2(p.darkColor2);
    setDarkRimColor(p.darkRimColor);
    setDarkGlowColor(p.darkGlowColor);

    setRimStrength(p.rimStrength);
    setRimPower(p.rimPower);
    setTextureMode(p.textureMode);
    setTextureScale(p.textureScale);
    setTextureStrength(p.textureStrength);
    setTextureRoundness(p.textureRoundness);
    setSpeed(p.speed);
    setAutoRotationSpeed(p.autoRotationSpeed);
    setFollowPointer(p.followPointer);
    setPointerTilt(p.pointerTilt);
    setPointerFollow(p.pointerFollow);
    setBloomEnabled(p.bloomEnabled);
    setHoldEnabled(p.holdEnabled);
    setGlowWidth(p.glowWidth ?? 0.22);
    setGlowIntensity(p.glowIntensity ?? 1.80);
    setGlowPower(p.glowPower ?? 3.00);
    setPressScale(p.pressScale ?? 1.30);
    setPressNoiseMultiplier(p.pressNoiseMultiplier ?? 5.00);
    setPressDuration(p.pressDuration ?? 1.60);
    setMoltenColor(p.moltenColor ?? "#FF3A00");
    setMoltenCoreColor(p.moltenCoreColor ?? "#FFD23A");

    if (p.bloomEnabled) {
      setBloomOpen(true);
    }
    if (p.textureMode !== 0) {
      setTextureOpen(true);
    }
  };

  const loadPresetObj = (p: any) => {
    setActivePreset(p.name);
    setRadius(p.radius);
    setNoiseScale(p.noiseScale);
    setNoiseStrength(p.noiseStrength);
    setTwistX(p.twistX);
    setTwistY(p.twistY);
    
    setLightColor(p.lightColor);
    setLightColor2(p.lightColor2);
    setLightRimColor(p.lightRimColor);
    setLightGlowColor(p.lightGlowColor ?? p.lightRimColor);

    setDarkColor(p.darkColor);
    setDarkColor2(p.darkColor2);
    setDarkRimColor(p.darkRimColor);
    setDarkGlowColor(p.darkGlowColor ?? p.darkRimColor);

    setRimStrength(p.rimStrength);
    setRimPower(p.rimPower);
    setTextureMode(p.textureMode);
    setTextureScale(p.textureScale);
    setTextureStrength(p.textureStrength);
    setTextureRoundness(p.textureRoundness ?? 1.0);
    setSpeed(p.speed);
    setAutoRotationSpeed(p.autoRotationSpeed);
    setFollowPointer(p.followPointer);
    setPointerTilt(p.pointerTilt);
    setPointerFollow(p.pointerFollow);
    setBloomEnabled(p.bloomEnabled);
    setHoldEnabled(p.holdEnabled);
    setGlowWidth(p.glowWidth ?? 0.22);
    setGlowIntensity(p.glowIntensity ?? 1.80);
    setGlowPower(p.glowPower ?? 3.00);
    setPressScale(p.pressScale ?? 1.30);
    setPressNoiseMultiplier(p.pressNoiseMultiplier ?? 5.00);
    setPressDuration(p.pressDuration ?? 1.60);
    setMoltenColor(p.moltenColor ?? "#FF3A00");
    setMoltenCoreColor(p.moltenCoreColor ?? "#FFD23A");

    if (p.bloomEnabled) {
      setBloomOpen(true);
    }
    if (p.textureMode !== 0) {
      setTextureOpen(true);
    }
  };

  const handlePresetSelect = (key: string) => {
    if (key in presets) {
      loadPreset(key as keyof typeof presets);
    } else {
      const custom = customPresets.find(p => p.name === key);
      if (custom) {
        loadPresetObj(custom);
      }
    }
  };

  // Load custom presets on mount (and auto-load the most recently saved preset as default)
  useEffect(() => {
    const saved = localStorage.getItem("rg_blob_presets");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setCustomPresets(parsed);
        if (parsed.length > 0) {
          loadPresetObj(parsed[parsed.length - 1]);
        }
      } catch (e) {}
    }
  }, []);

  const handleSavePreset = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newPresetName.trim();
    if (!name) return;

    if (presets[name as keyof typeof presets] || customPresets.some(p => p.name.toLowerCase() === name.toLowerCase())) {
      alert("A preset with this name already exists.");
      return;
    }

    const newPreset = {
      name,
      radius,
      noiseScale,
      noiseStrength,
      twistX,
      twistY,
      lightColor,
      lightColor2,
      lightRimColor,
      lightGlowColor,
      darkColor,
      darkColor2,
      darkRimColor,
      darkGlowColor,
      rimStrength,
      rimPower,
      textureMode,
      textureScale,
      textureStrength,
      textureRoundness,
      speed,
      autoRotationSpeed,
      followPointer,
      pointerTilt,
      pointerFollow,
      bloomEnabled,
      holdEnabled,
      pressScale,
      pressNoiseMultiplier,
      pressDuration,
      moltenColor,
      moltenCoreColor
    };

    const updated = [...customPresets, newPreset];
    setCustomPresets(updated);
    localStorage.setItem("rg_blob_presets", JSON.stringify(updated));
    setNewPresetName("");
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2000);
    setActivePreset(name);
  };

  const handleDeletePreset = (presetName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = customPresets.filter(p => p.name !== presetName);
    setCustomPresets(updated);
    localStorage.setItem("rg_blob_presets", JSON.stringify(updated));
    if (activePreset === presetName) {
      loadPreset("Soft");
    }
  };

  const handleExportConfig = () => {
    const config = {
      radius,
      noiseScale,
      noiseStrength,
      twistX,
      twistY,
      lightColor,
      lightColor2,
      lightRimColor,
      lightGlowColor,
      darkColor,
      darkColor2,
      darkRimColor,
      darkGlowColor,
      rimStrength,
      rimPower,
      textureMode,
      textureScale,
      textureStrength,
      textureRoundness,
      speed,
      autoRotationSpeed,
      followPointer,
      pointerTilt,
      pointerFollow,
      bloomEnabled,
      holdEnabled,
      pressScale,
      pressNoiseMultiplier,
      pressDuration,
      moltenColor,
      moltenCoreColor
    };
    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
      .then(() => alert("Configuration copied to clipboard! You can paste it into the presets list in the code to make it permanent."))
      .catch(() => alert("Failed to copy configuration."));
  };

  const handleReset = () => {
    loadPreset("Soft");
  };

  // --- 3. WebGL Canvas Init ---
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const scene = new THREE.Scene();
    
    // Position camera slightly outward to guarantee no geometry clipping
    const camera = new THREE.PerspectiveCamera(42, canvas.clientWidth / canvas.clientHeight, 0.1, 100);
    camera.position.set(0, 0, 6.5);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance"
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(canvas.clientWidth, canvas.clientHeight, false);

    // Create detailed sphere and merge seam vertices using official Three.js utility
    const baseGeo = new THREE.SphereGeometry(radius, 80, 80);
    baseGeo.deleteAttribute("uv");
    baseGeo.deleteAttribute("normal");
    const geometry = mergeVertices(baseGeo);
    baseGeo.dispose();
    geometry.computeVertexNormals();

    const originalPositions = new Float32Array(geometry.attributes.position.array);

    // Color interpolation trackers (init with current active theme targets)
    const isDarkInit = themeRef.current === "dark";
    const activeColorVal = new THREE.Color(isDarkInit ? darkColorRef.current : lightColorRef.current);
    const activeColor2Val = new THREE.Color(isDarkInit ? darkColor2Ref.current : lightColor2Ref.current);
    const activeRimColorVal = new THREE.Color(isDarkInit ? darkRimColorRef.current : lightRimColorRef.current);
    const activeGlowColorVal = new THREE.Color(isDarkInit ? darkGlowColorRef.current : lightGlowColorRef.current);

    const targetColorVal = new THREE.Color();
    const targetColor2Val = new THREE.Color();
    const targetRimColorVal = new THREE.Color();
    const targetGlowColorVal = new THREE.Color();

    // Main Shader Material setup
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms: {
        baseColor: { value: activeColorVal },
        baseColor2: { value: activeColor2Val },
        rimColor: { value: activeRimColorVal },
        rimStrength: { value: rimStrengthRef.current },
        rimPower: { value: rimPowerRef.current },
        heat: { value: 0.0 },
        moltenColor: { value: new THREE.Color(moltenColorRef.current) },
        moltenCoreColor: { value: new THREE.Color(moltenCoreColorRef.current) },
        // Twist parameters
        twistX: { value: twistXRef.current },
        twistY: { value: twistYRef.current }
      }
    });

    const mainMesh = new THREE.Mesh(geometry, material);
    scene.add(mainMesh);

    // Backlight Bloom (glow shell) setup
    const glowMaterial = new THREE.ShaderMaterial({
      vertexShader: glowVertexShader,
      fragmentShader: glowFragmentShader,
      uniforms: {
        glowColor: { value: activeGlowColorVal },
        uRadius: { value: radius },
        uGlowWidth: { value: glowWidthRef.current },
        uGlowIntensity: { value: glowIntensityRef.current },
        uGlowPower: { value: glowPowerRef.current },
        twistX: { value: twistXRef.current },
        twistY: { value: twistYRef.current }
      },
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide
    });

    const glowMesh = new THREE.Mesh(geometry, glowMaterial);
    scene.add(glowMesh);

    const noise = createNoise3D();
    const vecPos = new THREE.Vector3();
    const vecNormal = new THREE.Vector3();
    const clock = new THREE.Clock();

    let animationFrameId: number;
    let loadScaleProgress = 0.0;

    const easeBackOut = (t: number) => {
      const s = 1.2; // overshoot factor
      const t1 = t - 1;
      return t1 * t1 * ((s + 1) * t1 + s) + 1;
    };

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const dt = Math.min(clock.getDelta(), 0.03);

      const isDark = themeRef.current === "dark";

      // 1. Set target colors based on the current active theme
      targetColorVal.set(isDark ? darkColorRef.current : lightColorRef.current);
      targetColor2Val.set(isDark ? darkColor2Ref.current : lightColor2Ref.current);
      targetRimColorVal.set(isDark ? darkRimColorRef.current : lightRimColorRef.current);
      targetGlowColorVal.set(isDark ? darkGlowColorRef.current : lightGlowColorRef.current);

      // Lerp active colors towards target colors for a smooth theme morph transition
      const colorEase = Math.min(1.0, dt * 5.0); 
      activeColorVal.lerp(targetColorVal, colorEase);
      activeColor2Val.lerp(targetColor2Val, colorEase);
      activeRimColorVal.lerp(targetRimColorVal, colorEase);
      activeGlowColorVal.lerp(targetGlowColorVal, colorEase);

      // Update uniforms
      material.uniforms.rimStrength.value = rimStrengthRef.current;
      material.uniforms.rimPower.value = rimPowerRef.current;
      material.uniforms.moltenColor.value.set(moltenColorRef.current);
      material.uniforms.moltenCoreColor.value.set(moltenCoreColorRef.current);
      material.uniforms.twistX.value = twistXRef.current;
      material.uniforms.twistY.value = twistYRef.current;

      glowMaterial.uniforms.uGlowWidth.value = glowWidthRef.current;
      glowMaterial.uniforms.uGlowIntensity.value = glowIntensityRef.current;
      glowMaterial.uniforms.uGlowPower.value = glowPowerRef.current;
      glowMaterial.uniforms.twistX.value = twistXRef.current;
      glowMaterial.uniforms.twistY.value = twistYRef.current;

      glowMesh.visible = bloomEnabledRef.current;

      if (holdEnabledRef.current) {
        const targetHeat = isPressedRef.current ? 1.0 : -1.0;
        const nextProgress = heatRef.current + (targetHeat * dt) / pressDurationRef.current;
        heatRef.current = Math.min(1.0, Math.max(0.0, nextProgress));
      } else {
        heatRef.current = 0.0;
      }
      
      const smoothHeat = heatRef.current * heatRef.current * (3.0 - 2.0 * heatRef.current);
      material.uniforms.heat.value = smoothHeat;

      const currentNoiseStrengthScale = 1.0 + (pressNoiseMultiplierRef.current - 1.0) * smoothHeat;
      const currentNoiseScaleScale = 1.0 + 0.6 * smoothHeat;
      const currentSpeedScale = 1.0 + (3.0 / speedRef.current - 1.0) * smoothHeat;
      const currentMeshScale = 1.0 + (pressScaleRef.current - 1.0) * smoothHeat;

      if (loadScaleProgress < 1.0) {
        loadScaleProgress += dt / 1.2; // 1.2s duration
        if (loadScaleProgress > 1.0) loadScaleProgress = 1.0;
      }
      const loadScale = easeBackOut(loadScaleProgress);

      mainMesh.scale.setScalar(currentMeshScale * loadScale);
      glowMesh.scale.setScalar(currentMeshScale * (1.0 + glowWidthRef.current) * loadScale);

      mainMesh.rotation.y += autoRotationSpeedRef.current;
      glowMesh.rotation.y += autoRotationSpeedRef.current;

      if (followPointerRef.current) {
        const followEase = Math.min(1.0, dt * pointerFollowRef.current);
        const targetRotX = -pointerRef.current.y * pointerTiltRef.current;
        const targetRotY = pointerRef.current.x * pointerTiltRef.current;

        mainMesh.rotation.x += (targetRotX - mainMesh.rotation.x) * followEase;
        mainMesh.rotation.y += (targetRotY - mainMesh.rotation.y) * followEase;
        glowMesh.rotation.x += (targetRotX - glowMesh.rotation.x) * followEase;
        glowMesh.rotation.y += (targetRotY - glowMesh.rotation.y) * followEase;
      } else {
        const returnEase = Math.min(1.0, dt * 4.0);
        mainMesh.rotation.x += (0 - mainMesh.rotation.x) * returnEase;
        glowMesh.rotation.x += (0 - glowMesh.rotation.x) * returnEase;
      }

      // CPU Simplex Noise & Heightmap Displacement Texture deformation
      const currentNoiseScale = noiseScaleRef.current * currentNoiseScaleScale;
      const currentNoiseStrength = noiseStrengthRef.current * currentNoiseStrengthScale;
      const currentSpeed = speedRef.current * currentSpeedScale;

      timeOffsetRef.current += dt * currentSpeed;

      const positionAttr = geometry.attributes.position;
      const posArray = positionAttr.array as Float32Array;

      // Extract current texture parameters
      const mode = textureModeRef.current;
      const tScale = textureScaleRef.current;
      const tStrength = textureStrengthRef.current;
      const tRoundness = textureRoundnessRef.current;

      for (let i = 0; i < positionAttr.count; i++) {
        const idx = i * 3;
        const x = originalPositions[idx];
        const y = originalPositions[idx + 1];
        const z = originalPositions[idx + 2];

        vecPos.set(x, y, z);
        vecNormal.copy(vecPos).normalize();

        // 1. Base Simplex wave displacement
        const noiseVal = noise(
          vecNormal.x * currentNoiseScale,
          vecNormal.y * currentNoiseScale,
          vecNormal.z * currentNoiseScale + timeOffsetRef.current
        ) * currentNoiseStrength;

        // 2. Physical geometric heightmap texture displacement
        let textureDisplacement = 0.0;
        if (mode !== 0) {
          const px = vecNormal.x * tScale;
          const py = vecNormal.y * tScale;
          const pz = vecNormal.z * tScale;

          if (mode === 1) { // Ribbed / Striped (horizontal grooves along Y)
            textureDisplacement = Math.sin(py);
          } else if (mode === 2) { // Wavy ridges
            textureDisplacement = Math.sin(py + Math.sin(px * 0.5) * 2.0);
          } else if (mode === 3) { // Beaded bumps
            textureDisplacement = Math.sin(px) * Math.sin(py) * Math.sin(pz);
          } else if (mode === 4) { // Diamond facets
            textureDisplacement = Math.cos(px) + Math.cos(py) + Math.cos(pz);
          } else if (mode === 5) { // Linoleum ridged veins
            textureDisplacement = Math.sin(px + Math.cos(py)) * Math.cos(py + Math.sin(pz));
          }

          // Apply Texture Roundness profile shaping exponent
          if (textureDisplacement !== 0.0) {
            textureDisplacement = Math.sign(textureDisplacement) * Math.pow(Math.abs(textureDisplacement), 1.0 / tRoundness);
          }
        }

        // Add displacements together and multiply texture by strength
        const totalDisplacement = noiseVal + textureDisplacement * tStrength;
        const newRadius = radius + totalDisplacement;
        vecPos.copy(vecNormal).multiplyScalar(newRadius);

        posArray[idx] = vecPos.x;
        posArray[idx + 1] = vecPos.y;
        posArray[idx + 2] = vecPos.z;
      }

      positionAttr.needsUpdate = true;
      geometry.computeVertexNormals();

      renderer.render(scene, camera);
    };

    clock.start();
    animate();

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const width = Math.round(entry.contentRect.width * 1.6);
        const height = Math.round(entry.contentRect.height * 1.6);
        if (width === 0 || height === 0) continue;

        renderer.setSize(width, height, false);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }
    });
    resizeObserver.observe(container);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      geometry.dispose();
      material.dispose();
      glowMaterial.dispose();
      renderer.dispose();
    };
  }, [radius]);

  // Pointer Handlers
  const handlePointerDown = () => {
    isPressedRef.current = true;
    if (canvasRef.current) canvasRef.current.style.cursor = "grabbing";
  };

  const handlePointerUp = () => {
    isPressedRef.current = false;
    if (canvasRef.current) canvasRef.current.style.cursor = "grab";
  };

  const handlePointerOver = () => {
    if (canvasRef.current) {
      canvasRef.current.style.cursor = isPressedRef.current ? "grabbing" : "grab";
    }
  };

  const handlePointerOut = () => {
    if (canvasRef.current) canvasRef.current.style.cursor = "default";
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const container = containerRef.current;
    if (!container) return;
    const rect = container.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
    const y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    pointerRef.current.set(x, y);
  };

  // --- 4. Sidebar Content Portal Template ---
  const sidebarContent = isOpen && (
    <div className="fixed top-0 right-0 h-screen w-80 bg-neutral-950/90 border-l border-white/10 flex flex-col z-[100000] text-xs text-white select-none shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/5 shrink-0">
        <div>
          <h2 className="font-semibold text-white tracking-wide text-sm">Blob Editor</h2>
          <p className="text-[10px] text-white/40 mt-0.5 font-normal">Tune the organic shader and motion</p>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-lg hover:bg-white/5 text-white/55 hover:text-white cursor-pointer transition-colors"
        >
          <X size={16} />
        </button>
      </div>

      {/* Preset Section (Relocated into the Sidebar Header) */}
      <div className="p-4 border-b border-white/5 bg-neutral-950/40 shrink-0">
        <h3 className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 mb-2">Select Preset</h3>
        
        {/* Preset Selector Grid */}
        <div className="grid grid-cols-2 gap-1 mb-3 max-h-36 overflow-y-auto pr-1 scrollbar-thin">
          {/* Built-in Presets */}
          {(Object.keys(presets) as Array<keyof typeof presets>).map((key) => (
            <button
              key={key}
              type="button"
              onClick={() => handlePresetSelect(key)}
              className={`rounded px-2.5 py-1.5 text-[10px] font-semibold text-left transition-all truncate cursor-pointer ${
                activePreset === key
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-white/50 bg-white/5 hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              {presets[key].name}
            </button>
          ))}

          {/* Custom Saved Presets */}
          {customPresets.map((p) => (
            <div
              key={p.name}
              onClick={() => handlePresetSelect(p.name)}
              className={`group relative rounded px-2.5 py-1.5 text-[10px] font-semibold text-left transition-all truncate cursor-pointer flex items-center justify-between ${
                activePreset === p.name
                  ? "bg-white/10 text-white border border-white/10"
                  : "text-white/50 bg-white/5 hover:bg-white/10 hover:text-white border border-transparent"
              }`}
            >
              <span className="truncate pr-4">{p.name}</span>
              <button
                type="button"
                onClick={(e) => handleDeletePreset(p.name, e)}
                className="opacity-0 group-hover:opacity-100 hover:text-red-400 p-0.5 transition-opacity absolute right-1 bg-neutral-900 rounded"
                title="Delete preset"
              >
                <Trash2 size={10} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Form Scroll Container */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-white/10">
        
        {/* Preset Creator / Export Panel */}
        <div className="border-b border-white/5 pb-2">
          <button
            onClick={() => setPresetManagerOpen(!presetManagerOpen)}
            className="flex w-full items-center justify-between py-2 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <span>Preset Manager</span>
            <ChevronDown size={14} className={`transform transition-transform ${presetManagerOpen ? "rotate-180" : ""}`} />
          </button>
          {presetManagerOpen && (
            <div className="flex flex-col gap-3 pt-2 pb-4 animate-in fade-in slide-in-from-top-1 duration-150">
              <form onSubmit={handleSavePreset} className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="New preset name..."
                  value={newPresetName}
                  onChange={(e) => setNewPresetName(e.target.value)}
                  className="bg-white/5 border border-white/10 rounded px-2.5 py-1.5 text-[10px] font-medium text-white/90 focus:outline-none focus:border-white/35 flex-1 min-w-0"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-white/10 border border-white/10 hover:bg-white/20 text-white rounded text-[10px] font-semibold flex items-center gap-1 cursor-pointer transition-colors active:scale-95 shrink-0"
                >
                  <Save size={11} />
                  Save
                </button>
              </form>
              
              {saveSuccess && (
                <p className="text-[10px] text-green-400 font-medium animate-pulse">Preset saved successfully!</p>
              )}

              <button
                type="button"
                onClick={handleExportConfig}
                className="w-full py-1.5 bg-neutral-900 border border-white/10 hover:border-white/20 text-neutral-300 hover:text-white rounded text-[10px] font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors active:scale-95"
              >
                <Copy size={11} />
                Copy Config JSON to Clipboard
              </button>
            </div>
          )}
        </div>

        {/* Shape Section */}
        <div className="border-b border-white/5 pb-2">
          <button
            onClick={() => setShapeOpen(!shapeOpen)}
            className="flex w-full items-center justify-between py-2 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <span>Shape & Twist</span>
            <ChevronDown size={14} className={`transform transition-transform ${shapeOpen ? "rotate-180" : ""}`} />
          </button>
          {shapeOpen && (
            <div className="flex flex-col gap-3.5 pt-2 pb-4 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Radius</span>
                  <span className="font-mono">{radius.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="1.00"
                  max="2.20"
                  step="0.01"
                  value={radius}
                  onChange={(e) => setRadius(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Noise scale</span>
                  <span className="font-mono">{noiseScale.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.40"
                  max="3.50"
                  step="0.01"
                  value={noiseScale}
                  onChange={(e) => setNoiseScale(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Noise strength</span>
                  <span className="font-mono">{noiseStrength.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="0.80"
                  step="0.01"
                  value={noiseStrength}
                  onChange={(e) => setNoiseStrength(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Twist X</span>
                  <span className="font-mono">{twistX.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.00"
                  max="2.00"
                  step="0.05"
                  value={twistX}
                  onChange={(e) => setTwistX(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Twist Y</span>
                  <span className="font-mono">{twistY.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="-2.00"
                  max="2.00"
                  step="0.05"
                  value={twistY}
                  onChange={(e) => setTwistY(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Material & Gradient Section */}
        <div className="border-b border-white/5 pb-2">
          <button
            onClick={() => setMaterialOpen(!materialOpen)}
            className="flex w-full items-center justify-between py-2 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <span>Material & Gradients</span>
            <ChevronDown size={14} className={`transform transition-transform ${materialOpen ? "rotate-180" : ""}`} />
          </button>
          {materialOpen && (
            <div className="flex flex-col gap-3.5 pt-2 pb-4 animate-in fade-in slide-in-from-top-1 duration-150">
              
              {/* Light vs Dark Config Tabs */}
              <div className="flex rounded bg-neutral-900 p-0.5 border border-white/5 mb-1.5">
                <button
                  type="button"
                  onClick={() => setColorThemeConfig("light")}
                  className={`flex-1 py-1 rounded text-[10px] font-semibold text-center cursor-pointer transition-colors ${
                    colorThemeConfig === "light"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Light Mode Colors
                </button>
                <button
                  type="button"
                  onClick={() => setColorThemeConfig("dark")}
                  className={`flex-1 py-1 rounded text-[10px] font-semibold text-center cursor-pointer transition-colors ${
                    colorThemeConfig === "dark"
                      ? "bg-white/10 text-white shadow-sm"
                      : "text-white/40 hover:text-white"
                  }`}
                >
                  Dark Mode Colors
                </button>
              </div>

              {/* Theme Aware Color Pickers */}
              {colorThemeConfig === "light" ? (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/50">Light Gradient Color 1</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={lightColor}
                        onChange={(e) => setLightColor(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/50">Light Gradient Color 2</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lightColor2}
                        onChange={(e) => setLightColor2(e.target.value)}
                        className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={lightColor2}
                        onChange={(e) => setLightColor2(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/50">Light Rim Glow Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={lightRimColor}
                        onChange={(e) => setLightRimColor(e.target.value)}
                        className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={lightRimColor}
                        onChange={(e) => setLightRimColor(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  {bloomEnabled && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-white/50">Light Bloom Halo Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={lightGlowColor}
                          onChange={(e) => setLightGlowColor(e.target.value)}
                          className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                        />
                        <input
                          type="text"
                          value={lightGlowColor}
                          onChange={(e) => setLightGlowColor(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/50">Dark Gradient Color 1</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={darkColor}
                        onChange={(e) => setDarkColor(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/50">Dark Gradient Color 2</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={darkColor2}
                        onChange={(e) => setDarkColor2(e.target.value)}
                        className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={darkColor2}
                        onChange={(e) => setDarkColor2(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/50">Dark Rim Glow Color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={darkRimColor}
                        onChange={(e) => setDarkRimColor(e.target.value)}
                        className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={darkRimColor}
                        onChange={(e) => setDarkRimColor(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  {bloomEnabled && (
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] text-white/50">Dark Bloom Halo Color</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={darkGlowColor}
                          onChange={(e) => setDarkGlowColor(e.target.value)}
                          className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                        />
                        <input
                          type="text"
                          value={darkGlowColor}
                          onChange={(e) => setDarkGlowColor(e.target.value)}
                          className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                        />
                      </div>
                    </div>
                  )}
                </>
              )}

              {/* Rim Settings */}
              <div className="flex flex-col gap-1 border-t border-white/5 pt-3">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Rim strength</span>
                  <span className="font-mono">{rimStrength.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="4.00"
                  step="0.01"
                  value={rimStrength}
                  onChange={(e) => setRimStrength(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Rim power</span>
                  <span className="font-mono">{rimPower.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.50"
                  max="6.00"
                  step="0.01"
                  value={rimPower}
                  onChange={(e) => setRimPower(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>
            </div>
          )}
        </div>

        {/* Surface Heightmap Texture Section */}
        <div className="border-b border-white/5 pb-2">
          <button
            onClick={() => setTextureOpen(!textureOpen)}
            className="flex w-full items-center justify-between py-2 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <span>Surface Textures (Physical)</span>
            <ChevronDown size={14} className={`transform transition-transform ${textureOpen ? "rotate-180" : ""}`} />
          </button>
          {textureOpen && (
            <div className="flex flex-col gap-3.5 pt-2 pb-4 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] text-white/50">Deformer Pattern</label>
                <select
                  value={textureMode}
                  onChange={(e) => setTextureMode(parseInt(e.target.value))}
                  className="bg-neutral-900 border border-white/10 text-white rounded p-1.5 w-full text-[10px] focus:outline-none focus:border-white/35 cursor-pointer"
                >
                  <option value={0}>None</option>
                  <option value={1}>Ribbed (Striped)</option>
                  <option value={2}>Wavy</option>
                  <option value={3}>Beaded (Bumpy)</option>
                  <option value={4}>Diamond Facets</option>
                  <option value={5}>Linoleum Veins</option>
                </select>
                <p className="text-[9px] text-white/35">Physically deforms and ridges the 3D mesh surface.</p>
              </div>

              {textureMode !== 0 && (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Texture Scale (Density)</span>
                      <span className="font-mono">{textureScale.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="5.0"
                      max="60.0"
                      step="0.5"
                      value={textureScale}
                      onChange={(e) => setTextureScale(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Displacement Height</span>
                      <span className="font-mono">{textureStrength.toFixed(3)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.000"
                      max="0.250"
                      step="0.001"
                      value={textureStrength}
                      onChange={(e) => setTextureStrength(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Texture Roundness</span>
                      <span className="font-mono">{textureRoundness.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.20"
                      max="3.00"
                      step="0.05"
                      value={textureRoundness}
                      onChange={(e) => setTextureRoundness(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                    <p className="text-[9px] text-white/35">Shapes the ridge profiles (0.2 is sharp/pointed, 1.0 is smooth, 3.0 is flat/blocky).</p>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Motion Section */}
        <div className="border-b border-white/5 pb-2">
          <button
            onClick={() => setMotionOpen(!motionOpen)}
            className="flex w-full items-center justify-between py-2 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <span>Motion & Tilt</span>
            <ChevronDown size={14} className={`transform transition-transform ${motionOpen ? "rotate-180" : ""}`} />
          </button>
          {motionOpen && (
            <div className="flex flex-col gap-3.5 pt-2 pb-4 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Surface speed</span>
                  <span className="font-mono">{speed.toFixed(2)}</span>
                </div>
                <input
                  type="range"
                  min="0.00"
                  max="1.20"
                  step="0.01"
                  value={speed}
                  onChange={(e) => setSpeed(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex flex-col gap-1">
                <div className="flex justify-between text-[10px] text-white/50">
                  <span>Auto rotation</span>
                  <span className="font-mono">{autoRotationSpeed.toFixed(3)}</span>
                </div>
                <input
                  type="range"
                  min="0.000"
                  max="0.012"
                  step="0.001"
                  value={autoRotationSpeed}
                  onChange={(e) => setAutoRotationSpeed(parseFloat(e.target.value))}
                  className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between py-1 bg-white/5 px-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-neutral-300">Follow pointer</span>
                <input
                  type="checkbox"
                  checked={followPointer}
                  onChange={(e) => setFollowPointer(e.target.checked)}
                  className="accent-white cursor-pointer w-3.5 h-3.5"
                />
              </div>

              {followPointer && (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Pointer tilt</span>
                      <span className="font-mono">{pointerTilt.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.00"
                      max="2.00"
                      step="0.01"
                      value={pointerTilt}
                      onChange={(e) => setPointerTilt(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Pointer follow speed</span>
                      <span className="font-mono">{pointerFollow.toFixed(2)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.5"
                      max="12.0"
                      step="0.1"
                      value={pointerFollow}
                      onChange={(e) => setPointerFollow(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Backlit Bloom Volumetric Glow */}
        <div className="border-b border-white/5 pb-2">
          <button
            onClick={() => setBloomOpen(!bloomOpen)}
            className="flex w-full items-center justify-between py-2 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-1.5">
              <span>Backlit Bloom</span>
              {bloomEnabled ? <Eye size={12} className="text-white/60" /> : <EyeOff size={12} className="text-white/35" />}
            </div>
            <ChevronDown size={14} className={`transform transition-transform ${bloomOpen ? "rotate-180" : ""}`} />
          </button>
          {bloomOpen && (
            <div className="flex flex-col gap-3.5 pt-2 pb-4 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between py-1 bg-white/5 px-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-neutral-300">Enable halo glow</span>
                <input
                  type="checkbox"
                  checked={bloomEnabled}
                  onChange={(e) => setBloomEnabled(e.target.checked)}
                  className="accent-white cursor-pointer w-3.5 h-3.5"
                />
              </div>

              {bloomEnabled && (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Halo width</span>
                      <span className="font-mono">{(glowWidth * 100).toFixed(0)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0.05"
                      max="0.50"
                      step="0.01"
                      value={glowWidth}
                      onChange={(e) => setGlowWidth(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Halo intensity</span>
                      <span className="font-mono">{glowIntensity.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="0.0"
                      max="5.0"
                      step="0.1"
                      value={glowIntensity}
                      onChange={(e) => setGlowIntensity(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Halo drop-off power</span>
                      <span className="font-mono">{glowPower.toFixed(1)}</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="8.0"
                      step="0.1"
                      value={glowPower}
                      onChange={(e) => setGlowPower(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Click and Hold Morph Section */}
        <div className="border-b border-white/5 pb-2">
          <button
            onClick={() => setHoldOpen(!holdOpen)}
            className="flex w-full items-center justify-between py-2 text-neutral-400 hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <span>Click & Hold morph</span>
            <ChevronDown size={14} className={`transform transition-transform ${holdOpen ? "rotate-180" : ""}`} />
          </button>
          {holdOpen && (
            <div className="flex flex-col gap-3.5 pt-2 pb-4 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="flex items-center justify-between py-1 bg-white/5 px-2.5 rounded-lg border border-white/5">
                <span className="text-[10px] text-neutral-300">Enable morphing transition</span>
                <input
                  type="checkbox"
                  checked={holdEnabled}
                  onChange={(e) => setHoldEnabled(e.target.checked)}
                  className="accent-white cursor-pointer w-3.5 h-3.5"
                />
              </div>

              {holdEnabled && (
                <>
                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Hold scale</span>
                      <span className="font-mono">{pressScale.toFixed(2)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.00"
                      max="2.00"
                      step="0.05"
                      value={pressScale}
                      onChange={(e) => setPressScale(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Hold noise multiplier</span>
                      <span className="font-mono">{pressNoiseMultiplier.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="1.0"
                      max="8.0"
                      step="0.5"
                      value={pressNoiseMultiplier}
                      onChange={(e) => setPressNoiseMultiplier(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex justify-between text-[10px] text-white/50">
                      <span>Hold morph speed</span>
                      <span className="font-mono">{pressDuration.toFixed(1)}s</span>
                    </div>
                    <input
                      type="range"
                      min="0.2"
                      max="4.0"
                      step="0.1"
                      value={pressDuration}
                      onChange={(e) => setPressDuration(parseFloat(e.target.value))}
                      className="w-full accent-white h-1 bg-white/10 rounded-lg cursor-pointer"
                    />
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/50">Molten base color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={moltenColor}
                        onChange={(e) => setMoltenColor(e.target.value)}
                        className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={moltenColor}
                        onChange={(e) => setMoltenColor(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] text-white/50">Molten core color</label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        value={moltenCoreColor}
                        onChange={(e) => setMoltenCoreColor(e.target.value)}
                        className="w-10 h-7 rounded bg-transparent border-0 cursor-pointer p-0.5 shrink-0"
                      />
                      <input
                        type="text"
                        value={moltenCoreColor}
                        onChange={(e) => setMoltenCoreColor(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded px-2 py-1 w-full text-[10px] font-mono text-white/80 focus:outline-none"
                      />
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer Reset button */}
      <div className="shrink-0 p-4 border-t border-white/5 bg-neutral-950/90 flex gap-2">
        <button
          onClick={handleReset}
          className="flex-1 py-2 rounded bg-neutral-900 border border-white/10 hover:border-white/20 text-white/80 hover:text-white font-semibold text-center cursor-pointer transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
        >
          <RefreshCw size={12} />
          Reset to Soft
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Canvas wrapper container */}
      <div
        ref={containerRef}
        data-cursor="hold"
        className="relative w-full h-full select-none overflow-visible"
        onPointerMove={handlePointerMove}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onPointerLeave={handlePointerUp}
        onPointerOver={handlePointerOver}
        onPointerOut={handlePointerOut}
      >
        <canvas
          ref={canvasRef}
          className="absolute block pointer-events-none"
          style={{
            width: "160%",
            height: "160%",
            top: "-30%",
            left: "-30%"
          }}
        />
      </div>

      {/* Settings Gear Overlay Toggle (Only in Development) */}
      {process.env.NODE_ENV === "development" && (
        <>
          <div className="fixed top-6 right-6 z-[9999] flex items-center pointer-events-auto">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-3 rounded-full bg-neutral-900/80 border border-white/10 hover:border-white/20 text-white/80 hover:text-white backdrop-blur-md cursor-pointer transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center"
              title="Open Editor Options"
            >
              {isOpen ? <X size={18} /> : <Settings size={18} />}
            </button>
          </div>

          {/* Render sidebar fixed directly to document body via portal (stops scrolling with page) */}
          {mounted && typeof document !== "undefined" && createPortal(sidebarContent, document.body)}
        </>
      )}
    </>
  );
}
