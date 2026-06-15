import { useEffect, useRef } from 'react';
import * as THREE from 'three';

export default function ThreeLandingBg({ interactive = false }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    camera.position.z = 80;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    // Group to hold all 3D components
    const mainGroup = new THREE.Group();
    scene.add(mainGroup);

    // 1. Orbiting Particles (Telemetry Starfield)
    const particleCount = 2000;
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const colorA = new THREE.Color('#06b6d4'); // Cyan
    const colorB = new THREE.Color('#0d9488'); // Teal

    for (let i = 0; i < particleCount; i++) {
      // Sphere coordinate distribution
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 35 * Math.cbrt(Math.random());

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      // Mix colors
      const mixedColor = colorA.clone().lerp(colorB, Math.random());
      colors[i * 3] = mixedColor.r;
      colors[i * 3 + 1] = mixedColor.g;
      colors[i * 3 + 2] = mixedColor.b;
    }

    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    // Glow shader material for points
    const particleMaterial = new THREE.ShaderMaterial({
      uniforms: {
        pointSize: { value: 2.0 },
      },
      vertexShader: `
        attribute vec3 color;
        varying vec3 vColor;
        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = 40.0 / -mvPosition.z;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        void main() {
          if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.5) {
            discard;
          }
          gl_FragColor = vec4(vColor, 0.75);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const starfield = new THREE.Points(particleGeometry, particleMaterial);
    mainGroup.add(starfield);

    // 2. Central Satellite Wireframe Node (Octahedron inside multiple rings)
    let nodeMesh;
    let ring1, ring2;

    if (interactive) {
      // Wireframe core
      const coreGeom = new THREE.OctahedronGeometry(12, 1);
      const coreMat = new THREE.MeshBasicMaterial({
        color: '#06b6d4',
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      });
      nodeMesh = new THREE.Mesh(coreGeom, coreMat);
      mainGroup.add(nodeMesh);

      // Outer Ring 1
      const ringGeom1 = new THREE.RingGeometry(18, 18.5, 64);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: '#0d9488',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.4,
      });
      ring1 = new THREE.Mesh(ringGeom1, ringMat1);
      ring1.rotation.x = Math.PI / 2;
      mainGroup.add(ring1);

      // Outer Ring 2 (Orthogonal)
      const ringGeom2 = new THREE.RingGeometry(22, 22.3, 64);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: '#0891b2',
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.25,
      });
      ring2 = new THREE.Mesh(ringGeom2, ringMat2);
      ring2.rotation.y = Math.PI / 4;
      mainGroup.add(ring2);
    }

    // Mouse interactive movement
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      const x = event.clientX - rect.left - rect.width / 2;
      const y = event.clientY - rect.top - rect.height / 2;
      mouseX = x * 0.05;
      mouseY = y * 0.05;
    };

    if (interactive) {
      window.addEventListener('mousemove', handleMouseMove);
    }

    // Resize Handler
    const handleResize = () => {
      const width = container.clientWidth;
      const height = container.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    };
    window.addEventListener('resize', handleResize);

    // Animation Loop
    let count = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse camera interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      mainGroup.rotation.y = targetX * 0.01 + count * 0.15;
      mainGroup.rotation.x = targetY * 0.01 + count * 0.1;

      starfield.rotation.y = -count * 0.05;

      if (interactive && nodeMesh) {
        nodeMesh.rotation.y = count * 0.8;
        nodeMesh.rotation.z = -count * 0.4;
        ring1.rotation.z = count * 0.5;
        ring2.rotation.z = -count * 0.3;
      }

      renderer.render(scene, camera);
      count += 0.01;
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        window.removeEventListener('mousemove', handleMouseMove);
      }
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [interactive]);

  return <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden" />;
}
