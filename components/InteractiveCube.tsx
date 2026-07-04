"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useTheme } from "next-themes";

export default function InteractiveCube() {
  const { resolvedTheme } = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0 });

  const materialRef = useRef<THREE.MeshPhysicalMaterial | null>(null);
  const lineMaterialRef = useRef<THREE.LineBasicMaterial | null>(null);
  const ambientLightRef = useRef<THREE.AmbientLight | null>(null);

  // Sync mesh & wireframe colors when theme toggles
  useEffect(() => {
    if (materialRef.current && lineMaterialRef.current && ambientLightRef.current) {
      if (resolvedTheme === "light") {
        materialRef.current.color.setHex(0xe8f0f5);
        materialRef.current.opacity = 0.55;
        lineMaterialRef.current.color.setHex(0x008f8c); // Readable teal
        ambientLightRef.current.intensity = 0.7; // Brighter default base
      } else {
        materialRef.current.color.setHex(0x0c1015);
        materialRef.current.opacity = 0.85;
        lineMaterialRef.current.color.setHex(0x00fff6); // Neon cyan edges
        ambientLightRef.current.intensity = 0.4;
      }
    }
  }, [resolvedTheme]);

  useEffect(() => {
    if (!containerRef.current) return;
    const container = containerRef.current;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    const width = container.clientWidth || 300;
    const height = container.clientHeight || 280;

    // Perspective camera for true 3D depth rendering
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // --- Lighting ---
    const ambientLight = new THREE.AmbientLight(
      0xffffff,
      resolvedTheme === "light" ? 0.7 : 0.4
    );
    ambientLightRef.current = ambientLight;
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0x00fff6, 2.5); // Cyan light
    dirLight1.position.set(5, 5, 4);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x00ff26, 1.5); // Green highlight light
    dirLight2.position.set(-5, -5, 2);
    scene.add(dirLight2);

    const pointLight = new THREE.PointLight(0xffffff, 1.5, 10);
    pointLight.position.set(0, 0, 2);
    scene.add(pointLight);

    // --- Cube Geometry & Glass Material ---
    const geometry = new THREE.BoxGeometry(1.4, 1.4, 1.4);
    
    // Premium refractive/reflective glass physical material
    const glassMaterial = new THREE.MeshPhysicalMaterial({
      color: resolvedTheme === "light" ? 0xe8f0f5 : 0x0c1015,
      metalness: 0.1,
      roughness: 0.1,
      transmission: 0.65, // Glass transparency
      ior: 1.5, // Refractive index of glass
      thickness: 1.0, // Optical thickness
      specularIntensity: 1.0,
      clearcoat: 1.0,
      clearcoatRoughness: 0.1,
      transparent: true,
      opacity: resolvedTheme === "light" ? 0.55 : 0.85,
    });
    materialRef.current = glassMaterial;

    const cube = new THREE.Mesh(geometry, glassMaterial);
    scene.add(cube);

    // --- Wireframe Glowing Edges ---
    const edges = new THREE.EdgesGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial({
      color: resolvedTheme === "light" ? 0x008f8c : 0x00fff6,
      linewidth: 2,
      transparent: true,
      opacity: 0.8,
    });
    lineMaterialRef.current = lineMaterial;

    const wireframe = new THREE.LineSegments(edges, lineMaterial);
    cube.add(wireframe);

    // --- Mouse interaction ---
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      // Calculate coordinates from -1 to 1
      mouseRef.current.targetX = (x / rect.width) * 2 - 1;
      mouseRef.current.targetY = -((y / rect.height) * 2 - 1);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // --- Animation loop ---
    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      const elapsedTime = clock.getElapsedTime();

      // Lerp mouse coordinates
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.05;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.05;

      // Base rotation + mouse tilt influence
      cube.rotation.x = elapsedTime * 0.15 + mouseRef.current.y * 0.4;
      cube.rotation.y = elapsedTime * 0.2 + mouseRef.current.x * 0.4;

      // Subtle scaling pulse
      const pulse = 1.0 + Math.sin(elapsedTime * 1.5) * 0.03;
      cube.scale.set(pulse, pulse, pulse);

      renderer.render(scene, camera);
    };

    animate();

    // --- Handle Resize ---
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
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
      edges.dispose();
      glassMaterial.dispose();
      lineMaterial.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="w-full h-full min-h-[280px] pointer-events-auto"
      style={{ overflow: "hidden" }}
    />
  );
}


