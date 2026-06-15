import { useEffect, useRef } from 'react';
import * as THREE from 'three';


// JSDoc: ThreeCanvasBg renders a responsive WebGL background
export default function ThreeCanvasBg() {
  const containerRef = useRef(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Scene
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    camera.position.z = 120;
    camera.position.y = 70;
    camera.lookAt(0, 0, 0);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Variables for wave particle grid
    const SEPARATION = 8;
    const AMOUNTX = 60;
    const AMOUNTY = 60;
    const numParticles = AMOUNTX * AMOUNTY;

    const positions = new Float32Array(numParticles * 3);
    const scales = new Float32Array(numParticles);

    let i = 0;
    let j = 0;

    for (let ix = 0; ix < AMOUNTX; ix++) {
      for (let iy = 0; iy < AMOUNTY; iy++) {
        positions[i] = ix * SEPARATION - (AMOUNTX * SEPARATION) / 2; // x
        positions[i + 1] = 0; // y
        positions[i + 2] = iy * SEPARATION - (AMOUNTY * SEPARATION) / 2; // z

        scales[j] = 1;

        i += 3;
        j++;
      }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    // Custom Particle Material with high-end glow shader
    const material = new THREE.ShaderMaterial({
      uniforms: {
        color: { value: new THREE.Color('#00f2fe') }, // Neon Cyan
        colorB: { value: new THREE.Color('#4facfe') }, // Deep Electric Blue
      },
      vertexShader: `
        attribute float scale;
        varying float vScale;
        void main() {
          vScale = scale;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = scale * (300.0 / -mvPosition.z);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        uniform vec3 color;
        uniform vec3 colorB;
        varying float vScale;
        void main() {
          if (length(gl_PointCoord - vec2(0.5, 0.5)) > 0.47) {
            discard;
          }
          vec3 mixedColor = mix(colorB, color, vScale * 0.3 + 0.5);
          gl_FragColor = vec4(mixedColor, 0.85);
        }
      `,
      transparent: true,
      depthWrite: false,
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Mouse movement state
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    const handleMouseMove = (event) => {
      mouseX = (event.clientX - window.innerWidth / 2) * 0.08;
      mouseY = (event.clientY - window.innerHeight / 2) * 0.08;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Resize Handler
    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', handleResize);

    // Render loop
    let count = 0;
    let animationFrameId;

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);

      // Smooth mouse camera interpolation
      targetX += (mouseX - targetX) * 0.05;
      targetY += (mouseY - targetY) * 0.05;

      camera.position.x = targetX;
      camera.position.y = 70 - targetY;
      camera.lookAt(0, 0, 0);

      const positionsAttr = particles.geometry.attributes.position.array;
      const scalesAttr = particles.geometry.attributes.scale.array;

      let idx = 0;
      let sIdx = 0;

      for (let ix = 0; ix < AMOUNTX; ix++) {
        for (let iy = 0; iy < AMOUNTY; iy++) {
          // Double sine wave combination for rich fluid flow
          const wave1 = Math.sin((ix + count) * 0.3) * 12;
          const wave2 = Math.sin((iy + count) * 0.5) * 12;
          positionsAttr[idx + 1] = wave1 + wave2;

          // React particle scale to height
          scalesAttr[sIdx] = (Math.sin((ix + count) * 0.3) + 1) * 1.5 + (Math.sin((iy + count) * 0.5) + 1) * 1.5;

          idx += 3;
          sIdx++;
        }
      }

      particles.geometry.attributes.position.needsUpdate = true;
      particles.geometry.attributes.scale.needsUpdate = true;

      renderer.render(scene, camera);
      count += 0.04;
    };

    animate();

    // Clean up
    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden bg-radial-gradient"
      style={{
        background: 'radial-gradient(circle at center, #060d1b 0%, #020610 100%)',
      }}
    />
  );
}
