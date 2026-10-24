import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';

interface Studio3DViewerProps {
  currentProjectTitle?: string;
  currentStage?: string;
  isRendering?: boolean;
}

export const Studio3DViewer: React.FC<Studio3DViewerProps> = ({
  currentProjectTitle = 'Automation Project #1',
  currentStage = 'VIDEO_ASSEMBLY',
  isRendering = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCameraPreset, setActiveCameraPreset] = useState<'director' | 'camera' | 'trophy' | 'overhead'>('director');
  const [lightPreset, setLightPreset] = useState<'broadcast' | 'cyber' | 'warm'>('broadcast');
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  // References to smoothly animate camera to target
  const cameraTargetPos = useRef(new THREE.Vector3(3.8, 2.4, 4.2));
  const cameraLookAt = useRef(new THREE.Vector3(0, 1.2, 0));

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Detect software WebGL per Three.js skill
    const isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 1. Scene & Color Pipeline
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0c0e14);
    scene.fog = new THREE.FogExp2(0x0c0e14, 0.08);

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(
      45,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(3.8, 2.4, 4.2);

    // 3. Renderer with ACESFilmicToneMapping & sRGB
    const renderer = new THREE.WebGLRenderer({
      antialias: !isSoftwareGl,
      powerPreference: 'high-performance',
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    renderer.shadowMap.enabled = !isSoftwareGl;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    container.appendChild(renderer.domElement);

    // 4. Studio Environment Reflection via RoomEnvironment
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Setup: Warm key light + Cool fill light
    const keyLight = new THREE.DirectionalLight(0xfff0dd, 2.6);
    keyLight.position.set(4, 5, 3);
    keyLight.castShadow = !isSoftwareGl;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.bias = -0.0005;
    scene.add(keyLight);

    const hemiLight = new THREE.HemisphereLight(0x7390b0, 0x1a1c23, 1.2);
    scene.add(hemiLight);

    const rimLight = new THREE.SpotLight(0x4f46e5, 3.5, 12, Math.PI / 4, 0.5);
    rimLight.position.set(-3.5, 4, -2.5);
    rimLight.target.position.set(0, 1, 0);
    scene.add(rimLight);
    scene.add(rimLight.target);

    // 6. Procedural Studio Floor with Acoustic Grid Pattern (Zero 404 dependencies)
    const floorCanvas = document.createElement('canvas');
    floorCanvas.width = 512;
    floorCanvas.height = 512;
    const ctx = floorCanvas.getContext('2d')!;
    ctx.fillStyle = '#11131a';
    ctx.fillRect(0, 0, 512, 512);
    // Draw subtle studio floor grid
    ctx.strokeStyle = '#1e2333';
    ctx.lineWidth = 2;
    for (let i = 0; i <= 512; i += 64) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, 512);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(512, i);
      ctx.stroke();
    }
    // Subtle circular stage guide
    ctx.strokeStyle = '#312e81';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(256, 256, 180, 0, Math.PI * 2);
    ctx.stroke();

    const floorTexture = new THREE.CanvasTexture(floorCanvas);
    floorTexture.wrapS = THREE.RepeatWrapping;
    floorTexture.wrapT = THREE.RepeatWrapping;
    floorTexture.repeat.set(4, 4);

    const floorGeo = new THREE.PlaneGeometry(24, 24);
    const floorMat = new THREE.MeshStandardMaterial({
      map: floorTexture,
      roughness: 0.85,
      metalness: 0.15,
    });
    const floorMesh = new THREE.Mesh(floorGeo, floorMat);
    floorMesh.rotation.x = -Math.PI / 2;
    floorMesh.receiveShadow = !isSoftwareGl;
    scene.add(floorMesh);

    // 7. COMPOSITE HERO SUBJECT 1: Studio Cinema Camera Rig (Group of 8 parts)
    const cameraRig = new THREE.Group();
    cameraRig.position.set(-1.2, 0, 0.6);

    // Radial contact shadow under camera rig
    const shadowCanvas = document.createElement('canvas');
    shadowCanvas.width = 128;
    shadowCanvas.height = 128;
    const sCtx = shadowCanvas.getContext('2d')!;
    const grad = sCtx.createRadialGradient(64, 64, 10, 64, 64, 60);
    grad.addColorStop(0, 'rgba(0,0,0,0.75)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    sCtx.fillStyle = grad;
    sCtx.fillRect(0, 0, 128, 128);
    const shadowTex = new THREE.CanvasTexture(shadowCanvas);

    const contactShadowGeo = new THREE.PlaneGeometry(1.4, 1.4);
    const contactShadowMat = new THREE.MeshBasicMaterial({
      map: shadowTex,
      transparent: true,
      depthWrite: false,
    });
    const camShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    camShadow.rotation.x = -Math.PI / 2;
    camShadow.position.y = 0.005;
    cameraRig.add(camShadow);

    // Part 1: Cast-iron pedestal base
    const baseGeo = new THREE.CylinderGeometry(0.45, 0.5, 0.08, 32);
    const castIronMat = new THREE.MeshStandardMaterial({ color: 0x1e2025, roughness: 0.8, metalness: 0.3 });
    const baseMesh = new THREE.Mesh(baseGeo, castIronMat);
    baseMesh.position.y = 0.04;
    cameraRig.add(baseMesh);

    // Part 2: Telescopic riser column
    const columnGeo = new THREE.CylinderGeometry(0.08, 0.1, 1.2, 24);
    const chromeMat = new THREE.MeshStandardMaterial({ color: 0xd4d8e0, roughness: 0.15, metalness: 0.9 });
    const columnMesh = new THREE.Mesh(columnGeo, chromeMat);
    columnMesh.position.y = 0.68;
    cameraRig.add(columnMesh);

    // Part 3: Fluid head mounting plate
    const headGeo = new THREE.BoxGeometry(0.3, 0.14, 0.26);
    const headMat = new THREE.MeshStandardMaterial({ color: 0x2b2e36, roughness: 0.4, metalness: 0.6 });
    const headMesh = new THREE.Mesh(headGeo, headMat);
    headMesh.position.y = 1.34;
    cameraRig.add(headMesh);

    // Part 4: Main camera body (Red cinema style)
    const bodyGeo = new THREE.BoxGeometry(0.32, 0.3, 0.44);
    const bodyMat = new THREE.MeshStandardMaterial({ color: 0x181a20, roughness: 0.5, metalness: 0.5 });
    const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
    bodyMesh.position.set(0, 1.54, 0);
    cameraRig.add(bodyMesh);

    // Part 5: Cine prime lens barrel with glass element
    const lensGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.36, 32);
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x0a0a0c, roughness: 0.2, metalness: 0.85 });
    const lensMesh = new THREE.Mesh(lensGeo, lensMat);
    lensMesh.rotation.x = Math.PI / 2;
    lensMesh.position.set(0, 1.54, 0.38);
    cameraRig.add(lensMesh);

    const glassGeo = new THREE.CylinderGeometry(0.11, 0.11, 0.02, 32);
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0x4f46e5,
      roughness: 0.05,
      metalness: 0.95,
      emissive: 0x1e1b4b,
      emissiveIntensity: 0.4,
    });
    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
    glassMesh.rotation.x = Math.PI / 2;
    glassMesh.position.set(0, 1.54, 0.56);
    cameraRig.add(glassMesh);

    // Part 6: Top handle rails
    const handleGeo = new THREE.BoxGeometry(0.06, 0.08, 0.38);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xef4444, roughness: 0.3, metalness: 0.7 });
    const handleMesh = new THREE.Mesh(handleGeo, handleMat);
    handleMesh.position.set(0, 1.74, -0.02);
    cameraRig.add(handleMesh);

    // Part 7: Articulated Director Monitor (Procedural texture showing video pipeline)
    const monitorCanvas = document.createElement('canvas');
    monitorCanvas.width = 256;
    monitorCanvas.height = 160;
    const mCtx = monitorCanvas.getContext('2d')!;
    mCtx.fillStyle = '#0f172a';
    mCtx.fillRect(0, 0, 256, 160);
    mCtx.fillStyle = '#ef4444';
    mCtx.font = 'bold 16px sans-serif';
    mCtx.fillText('● REC 4K 60FPS', 16, 28);
    mCtx.fillStyle = '#38bdf8';
    mCtx.font = '14px sans-serif';
    mCtx.fillText(`STAGE: ${currentStage}`, 16, 60);
    mCtx.fillStyle = '#e2e8f0';
    mCtx.font = '12px sans-serif';
    mCtx.fillText(currentProjectTitle.slice(0, 22), 16, 85);
    // Draw audio visualizer bars
    mCtx.fillStyle = '#10b981';
    for (let b = 0; b < 18; b++) {
      const barH = 12 + Math.sin(b * 0.8) * 16 + (isRendering ? Math.random() * 20 : 6);
      mCtx.fillRect(16 + b * 12, 140 - barH, 8, barH);
    }
    const monitorTexture = new THREE.CanvasTexture(monitorCanvas);

    const monitorGeo = new THREE.BoxGeometry(0.34, 0.22, 0.02);
    const monitorMat = new THREE.MeshStandardMaterial({
      map: monitorTexture,
      roughness: 0.2,
      emissive: 0x111827,
      emissiveIntensity: 0.8,
    });
    const monitorMesh = new THREE.Mesh(monitorGeo, monitorMat);
    monitorMesh.position.set(0.24, 1.7, 0.05);
    monitorMesh.rotation.y = -Math.PI / 4;
    cameraRig.add(monitorMesh);

    // Part 8: Tally Red Recording Light
    const tallyGeo = new THREE.SphereGeometry(0.04, 16, 16);
    const tallyMat = new THREE.MeshStandardMaterial({
      color: 0xff0000,
      emissive: 0xff0000,
      emissiveIntensity: 2.2,
      roughness: 0.1,
    });
    const tallyMesh = new THREE.Mesh(tallyGeo, tallyMat);
    tallyMesh.position.set(0, 1.8, -0.16);
    cameraRig.add(tallyMesh);

    scene.add(cameraRig);

    // 8. COMPOSITE HERO SUBJECT 2: YouTube Golden Creator Award Trophy (Group of 5 parts)
    const trophyGroup = new THREE.Group();
    trophyGroup.position.set(1.1, 0, -0.4);

    // Trophy contact shadow
    const trophyShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    trophyShadow.rotation.x = -Math.PI / 2;
    trophyShadow.position.y = 0.005;
    trophyGroup.add(trophyShadow);

    // Part 1: Black Marble Plinth
    const plinthGeo = new THREE.BoxGeometry(0.7, 0.5, 0.5);
    const plinthMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: 0.2, metalness: 0.4 });
    const plinthMesh = new THREE.Mesh(plinthGeo, plinthMat);
    plinthMesh.position.y = 0.25;
    trophyGroup.add(plinthMesh);

    // Part 2: Engraved brass plaque
    const plaqueGeo = new THREE.BoxGeometry(0.5, 0.16, 0.02);
    const plaqueMat = new THREE.MeshStandardMaterial({ color: 0xd4af37, roughness: 0.35, metalness: 0.8 });
    const plaqueMesh = new THREE.Mesh(plaqueGeo, plaqueMat);
    plaqueMesh.position.set(0, 0.25, 0.26);
    trophyGroup.add(plaqueMesh);

    // Part 3 & 4: 24k Gold YouTube Play Button Triangular Symbol
    const playShape = new THREE.Shape();
    playShape.moveTo(-0.24, -0.2);
    playShape.lineTo(0.28, 0);
    playShape.lineTo(-0.24, 0.2);
    playShape.closePath();

    const extrudeSettings = {
      depth: 0.12,
      bevelEnabled: true,
      bevelSegments: 4,
      steps: 1,
      bevelSize: 0.03,
      bevelThickness: 0.03,
    };
    const playGeo = new THREE.ExtrudeGeometry(playShape, extrudeSettings);
    const goldMat = new THREE.MeshStandardMaterial({
      color: 0xffd700,
      roughness: 0.15,
      metalness: 0.95,
      emissive: 0x785e00,
      emissiveIntensity: 0.2,
    });
    const playMesh = new THREE.Mesh(playGeo, goldMat);
    playMesh.position.set(0.04, 0.8, -0.06);
    trophyGroup.add(playMesh);

    // Part 5: High-gloss display glass enclosure frame
    const frameGeo = new THREE.BoxGeometry(0.66, 0.72, 0.46);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      roughness: 0.1,
      metalness: 0.9,
      wireframe: true,
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    frameMesh.position.y = 0.85;
    trophyGroup.add(frameMesh);

    scene.add(trophyGroup);

    // 9. COMPOSITE HERO SUBJECT 3: Studio Softbox Lighting Rig (Group of 6 parts)
    const softboxRig = new THREE.Group();
    softboxRig.position.set(2.4, 0, 1.8);
    softboxRig.rotation.y = -Math.PI / 3;

    // Contact shadow
    const lightShadow = new THREE.Mesh(contactShadowGeo, contactShadowMat);
    lightShadow.rotation.x = -Math.PI / 2;
    lightShadow.position.y = 0.005;
    softboxRig.add(lightShadow);

    // C-Stand base & riser
    const standBaseGeo = new THREE.CylinderGeometry(0.3, 0.35, 0.06, 16);
    const standBaseMat = new THREE.MeshStandardMaterial({ color: 0x22242b, roughness: 0.7, metalness: 0.4 });
    const standBase = new THREE.Mesh(standBaseGeo, standBaseMat);
    standBase.position.y = 0.03;
    softboxRig.add(standBase);

    const riserGeo = new THREE.CylinderGeometry(0.04, 0.05, 2.2, 16);
    const riser = new THREE.Mesh(riserGeo, chromeMat);
    riser.position.y = 1.13;
    softboxRig.add(riser);

    // Softbox housing & diffuser panel
    const boxGeo = new THREE.BoxGeometry(0.8, 0.6, 0.4);
    const boxMat = new THREE.MeshStandardMaterial({ color: 0x111216, roughness: 0.8, metalness: 0.2 });
    const softbox = new THREE.Mesh(boxGeo, boxMat);
    softbox.position.set(0, 2.1, 0);
    softboxRig.add(softbox);

    const panelGeo = new THREE.PlaneGeometry(0.76, 0.56);
    const panelMat = new THREE.MeshStandardMaterial({
      color: 0xfff7ed,
      emissive: 0xffedd5,
      emissiveIntensity: 1.6,
      roughness: 0.2,
    });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    panel.position.set(0, 2.1, -0.21);
    panel.rotation.y = Math.PI;
    softboxRig.add(panel);

    scene.add(softboxRig);

    // Animation & Smooth Damping Camera Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();

      // Smooth camera interpolation using exponential damping: 1 - Math.exp(-k * dt)
      const dampFactor = 1 - Math.exp(-4 * delta);
      camera.position.lerp(cameraTargetPos.current, dampFactor);
      camera.lookAt(cameraLookAt.current);

      // Subtle rotation on trophy when rendering
      if (isRendering) {
        trophyGroup.rotation.y += delta * 0.8;
        tallyMat.emissiveIntensity = 1.5 + Math.sin(clock.getElapsedTime() * 6) * 1.5;
      } else {
        trophyGroup.rotation.y = Math.sin(clock.getElapsedTime() * 0.4) * 0.15;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Handle Resize
    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameId);
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentStage, currentProjectTitle, isRendering]);

  // Handle Preset Switching
  const handleSelectPreset = (preset: 'director' | 'camera' | 'trophy' | 'overhead') => {
    setActiveCameraPreset(preset);
    if (preset === 'director') {
      cameraTargetPos.current.set(3.8, 2.4, 4.2);
      cameraLookAt.current.set(0, 1.2, 0);
    } else if (preset === 'camera') {
      cameraTargetPos.current.set(-0.2, 1.8, 2.0);
      cameraLookAt.current.set(-1.2, 1.5, 0.6);
    } else if (preset === 'trophy') {
      cameraTargetPos.current.set(1.4, 1.2, 0.8);
      cameraLookAt.current.set(1.1, 0.8, -0.4);
    } else if (preset === 'overhead') {
      cameraTargetPos.current.set(0, 5.5, 0.1);
      cameraLookAt.current.set(0, 0, 0);
    }
  };

  return (
    <div className="relative w-full h-full min-h-[360px] rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 shadow-2xl">
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="w-full h-full absolute inset-0 cursor-grab active:cursor-grabbing" />

      {/* Floating Status Bar - Viewport presence */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-3 bg-slate-900/90 border border-slate-700/60 px-3.5 py-1.5 rounded-full text-xs text-slate-200 shadow-lg pointer-events-none">
        <span className="flex h-2.5 w-2.5 relative">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isRendering ? 'bg-amber-400' : 'bg-emerald-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isRendering ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
        </span>
        <span className="font-semibold text-slate-100">Virtual 3D Stage</span>
        <span className="text-slate-500">•</span>
        <span className="text-indigo-300 font-mono text-[11px] uppercase tracking-wider">{currentStage}</span>
      </div>

      {/* Collapsible Viewport Controls Dock (<= 15% viewport footprint) */}
      <div className="absolute bottom-4 right-4 z-10 flex flex-col items-end gap-2">
        {isExpanded && (
          <div className="bg-slate-900/95 border border-slate-700/80 rounded-xl p-3 shadow-2xl text-xs text-slate-300 w-56 flex flex-col gap-2.5">
            <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase">
              Camera Angles
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {[
                { id: 'director', label: 'Director' },
                { id: 'camera', label: 'Rig View' },
                { id: 'trophy', label: 'Gold Trophy' },
                { id: 'overhead', label: 'Overhead' },
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => handleSelectPreset(btn.id as any)}
                  className={`px-2.5 py-1.5 rounded-lg font-medium text-left transition-colors ${
                    activeCameraPreset === btn.id
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
              <span>PBR Studio Mode</span>
              <span className="text-emerald-400 font-mono">60 FPS</span>
            </div>
          </div>
        )}

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="bg-slate-900/90 hover:bg-slate-800 border border-slate-700 text-slate-300 px-3 py-1.5 rounded-lg text-xs font-medium shadow-md transition-colors"
        >
          {isExpanded ? 'Minimize Viewport' : 'Camera Controls'}
        </button>
      </div>
    </div>
  );
};
