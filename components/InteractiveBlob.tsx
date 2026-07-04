"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

export default function InteractiveBlob() {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });
  const uniformsRef = useRef<{
    u_color1: { value: THREE.Color };
    u_color2: { value: THREE.Color };
    u_color3: { value: THREE.Color };
  } | null>(null);

  // Sync uniforms on theme changes
  useEffect(() => {
    if (uniformsRef.current) {
      if (resolvedTheme === "light") {
        uniformsRef.current.u_color1.value.setHex(0xd9ebf5); // Soft pastel blue/cyan
        uniformsRef.current.u_color2.value.setHex(0xf0e6f5); // Soft pastel purple/pink
        uniformsRef.current.u_color3.value.setHex(0x008f8c); // Deep teal peak highlights
      } else {
        uniformsRef.current.u_color1.value.setHex(0x002035); // Dark blue/cyan
        uniformsRef.current.u_color2.value.setHex(0x120028); // Dark purple
        uniformsRef.current.u_color3.value.setHex(0x00fff6); // Electric neon cyan peaks
      }
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 300;

    // Orthographic camera for 2D plane rendering
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
    camera.position.z = 1;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    container.appendChild(renderer.domElement);

    // --- Shader Logic ---
    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform vec3 u_color1;
      uniform vec3 u_color2;
      uniform vec3 u_color3;
      varying vec2 vUv;

      // Cosine based palette generators by Inigo Quilez
      vec3 palette( in float t, in vec3 a, in vec3 b, in vec3 c, in vec3 d ) {
        return a + b*cos( 6.28318*(c*t+d) );
      }

      // Simple 2D Noise
      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }
      
      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f*f*(3.0-2.0*f);
        return mix(mix(hash(i + vec2(0.0,0.0)), hash(i + vec2(1.0,0.0)), u.x),
                   mix(hash(i + vec2(0.0,1.0)), hash(i + vec2(1.0,1.0)), u.x), u.y);
      }

      void main() {
        vec2 st = gl_FragCoord.xy / u_resolution.xy;
        
        // Center coordinates
        vec2 p = vUv - 0.5;
        p.x *= u_resolution.x / u_resolution.y;

        // Mouse influence distortion
        float d = length(p - u_mouse);
        float mouseWarp = smoothstep(0.6, 0.0, d) * 0.28;

        // Multi-layered fractional noise warps
        float angle = noise(p * 2.0 + u_time * 0.12) * 6.28;
        vec2 warp = vec2(cos(angle), sin(angle)) * (0.15 + mouseWarp);
        
        float n = noise(p * 3.5 + warp + vec2(u_time * 0.15));
        
        vec3 finalColor = mix(u_color1, u_color2, n * 1.2);
        finalColor += u_color3 * pow(n, 4.2) * 0.8; // Bright fluid highlight peaks

        // Vignette
        float vign = smoothstep(0.7, 0.22, length(p));
        finalColor *= mix(0.2, 1.0, vign);

        // Subtle organic alpha transparency boundary mask
        float alpha = smoothstep(0.48, 0.15, length(p - warp * 0.4));

        gl_FragColor = vec4(finalColor, alpha * 0.85);
      }
    `;

    const uniforms = {
      u_resolution: { value: new THREE.Vector2(width, height) },
      u_mouse: { value: new THREE.Vector2(0, 0) },
      u_time: { value: 0 },
      u_color1: { value: new THREE.Color(resolvedTheme === "light" ? 0xd9ebf5 : 0x002035) },
      u_color2: { value: new THREE.Color(resolvedTheme === "light" ? 0xf0e6f5 : 0x120028) },
      u_color3: { value: new THREE.Color(resolvedTheme === "light" ? 0x008f8c : 0x00fff6) },
    };
    uniformsRef.current = uniforms;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
      transparent: true,
      depthWrite: false,
      depthTest: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // --- Mouse Listeners ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Normalize coordinate uniforms between -0.5 and 0.5
      mouseRef.current.targetX = (x / rect.width) - 0.5;
      mouseRef.current.targetY = -((y / rect.height) - 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // --- Animation loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Lerp mouse uniforms for buttery smooth deceleration lags
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      uniforms.u_mouse.value.set(mouseRef.current.x, mouseRef.current.y);
      uniforms.u_time.value = clock.getElapsedTime();

      renderer.render(scene, camera);
    };

    animate();

    // --- Handle Resize ---
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      uniforms.u_resolution.value.set(w, h);
    };

    const resizeObserver = new ResizeObserver(() => handleResize());
    resizeObserver.observe(container);

    // --- Cleanup ---
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("mousemove", handleMouseMove);
      resizeObserver.disconnect();
      
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[300px] md:min-h-[400px] pointer-events-auto"
      style={{ overflow: "hidden" }}
    />
  );
}
