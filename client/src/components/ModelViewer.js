import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const ModelViewer = ({ modelPath, className = "" }) => {
  const containerRef = useRef(null);
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!modelPath || !containerRef.current) return;

    // --- 1. Scene & Camera Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xfdfcfb); // Match your site's soft white bg

    const camera = new THREE.PerspectiveCamera(45, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(0, 0.5, 4); // Positioned to frame a bottle perfectly

    // --- 2. Renderer (The Brightness Fix) ---
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    
    // CRITICAL: These settings fix the "Dark" look
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.5; // Brightness boost
    renderer.outputColorSpace = THREE.SRGBColorSpace; // Correct color reproduction
    
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // --- 3. Studio Lighting ---
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2); // Soft fill
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 2.5); // Sharp highlight
    mainLight.position.set(5, 10, 7);
    scene.add(mainLight);

    const rimLight = new THREE.DirectionalLight(0xffffff, 1.0); // Separates model from background
    rimLight.position.set(-5, 2, -5);
    scene.add(rimLight);

    // --- 4. Controls ---
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.autoRotate = true;
    controls.autoRotateSpeed = 3;
    controls.enablePan = false;
    controls.minDistance = 2;
    controls.maxDistance = 6;

    // --- 5. Model Loading & Auto-Centering ---
    const loader = new GLTFLoader();
    loader.load(modelPath, (gltf) => {
      const model = gltf.scene;
      
      // Center and scale the model automatically
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center); // Centers the bottle at (0,0,0)
      
      scene.add(model);
    }, undefined, (error) => {
      console.error('Error loading 3D model:', error);
    });

    // --- 6. Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // --- 7. Handle Resize ---
    const handleResize = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.clientWidth;
      const height = containerRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };
    window.addEventListener('resize', handleResize);

    // Cleanup
    return () => {
      window.removeEventListener('resize', handleResize);
      if (rendererRef.current) {
        rendererRef.current.dispose();
      }
      if (containerRef.current && renderer.domElement) {
        containerRef.current.removeChild(renderer.domElement);
      }
    };
  }, [modelPath]);

  return (
    <div 
      ref={containerRef} 
      className={`w-full h-full relative ${className}`}
      style={{ minHeight: '400px' }}
    />
  );
};

export default ModelViewer;