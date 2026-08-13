"use client";

import { useEffect, useRef } from "react";

export function NeuralBackground() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    let dispose = () => {};

    (async () => {
      const THREE = await import("three");
      if (cancelled) return;

      const compact = innerWidth < 760;
      const coarsePointer = matchMedia("(pointer: coarse)").matches;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      let effectsOff = localStorage.getItem("gopal-reduced-effects") === "true";
      let frame = 0;
      let last = performance.now();
      let scrollTarget = 0;

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, 0.1, 100);
      camera.position.z = 12;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      renderer.setClearColor(0xf8fafc, 1);
      renderer.setPixelRatio(Math.min(devicePixelRatio, 1));
      renderer.setSize(innerWidth, innerHeight, false);

      const network = new THREE.Group();
      scene.add(network);
      const count = compact ? 460 : 1450;
      const positions = new Float32Array(count * 3);
      const origins = new Float32Array(count * 3);
      const colors = new Float32Array(count * 3);
      const phases = new Float32Array(count);
      const centers = [[-4.4,-1.8,-1.2],[3.6,-1.4,-1.8],[-1.7,2.6,-2.6],[4.5,2.2,.4],[.3,-.1,2.1],[-4.8,2.8,.9]];
      const palette = [new THREE.Color(0x2563eb), new THREE.Color(0x059669), new THREE.Color(0x60a5fa)];

      // Uneven cluster sizes and elliptical distributions resemble embedding neighborhoods.
      for (let i = 0; i < count; i++) {
        const cluster = i % centers.length;
        const center = centers[cluster];
        const radius = Math.pow(Math.random(), 0.58) * (cluster % 2 ? 2.15 : 2.75);
        const angle = Math.random() * Math.PI * 2;
        const elevation = Math.acos(2 * Math.random() - 1);
        const x = center[0] + radius * Math.sin(elevation) * Math.cos(angle) * (cluster === 2 ? 1.7 : 1);
        const y = center[1] + radius * Math.cos(elevation) * (cluster === 4 ? 0.55 : 1);
        const z = center[2] + radius * Math.sin(elevation) * Math.sin(angle) * (cluster === 1 ? 1.45 : 1);
        positions.set([x, y, z], i * 3);
        origins.set([x, y, z], i * 3);
        const color = palette[cluster % palette.length];
        colors.set([color.r, color.g, color.b], i * 3);
        phases[i] = Math.random() * Math.PI * 2;
      }

      const particleGeometry = new THREE.BufferGeometry();
      particleGeometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
      const particleMaterial = new THREE.PointsMaterial({ size: compact ? 0.035 : 0.028, vertexColors: true, transparent: true, opacity: 0.66, depthWrite: false });
      const particles = new THREE.Points(particleGeometry, particleMaterial);
      network.add(particles);

      // Sparse links keep the neural topology visible without obscuring text.
      const lineData: number[] = [];
      let links = 0;
      const linkLimit = compact ? 360 : 1500;
      for (let i = 0; i < count && links < linkLimit; i += 3) {
        for (let offset = 6; offset < 60 && links < linkLimit; offset += 6) {
          const j = (i + offset) % count;
          const dx = origins[i*3] - origins[j*3];
          const dy = origins[i*3+1] - origins[j*3+1];
          const dz = origins[i*3+2] - origins[j*3+2];
          if (dx*dx + dy*dy + dz*dz < 2.15) {
            lineData.push(origins[i*3],origins[i*3+1],origins[i*3+2],origins[j*3],origins[j*3+1],origins[j*3+2]);
            links++;
          }
        }
      }
      const lineGeometry = new THREE.BufferGeometry();
      lineGeometry.setAttribute("position", new THREE.Float32BufferAttribute(lineData, 3));
      const lineMaterial = new THREE.LineBasicMaterial({ color: 0x2563eb, transparent: true, opacity: 0.11, depthWrite: false });
      network.add(new THREE.LineSegments(lineGeometry, lineMaterial));

      // The agent core reads as attention, tool routing and vector memory layers.
      const core = new THREE.Group();
      core.position.set(compact ? 2.35 : 4.05, 0.55, -1.1);
      scene.add(core);
      const material = (color:number, opacity:number) => new THREE.MeshBasicMaterial({ color, transparent:true, opacity, wireframe:true, depthWrite:false });
      const layers = [
        new THREE.Mesh(new THREE.IcosahedronGeometry(0.78, 2), material(0x2563eb, 0.42)),
        new THREE.Mesh(new THREE.TorusGeometry(1.2, 0.05, 10, 72), material(0x059669, 0.5)),
        new THREE.Mesh(new THREE.TorusKnotGeometry(0.86, 0.03, 90, 8, 2, 3), material(0x2563eb, 0.3)),
      ];
      layers[1].rotation.x = Math.PI / 2.5;
      layers[2].rotation.x = Math.PI / 4;
      layers.forEach(layer => core.add(layer));

      // A cursor attention field makes the interaction legible without replacing the OS cursor.
      const cursorField = new THREE.Mesh(
        new THREE.RingGeometry(0.19, 0.23, 40),
        new THREE.MeshBasicMaterial({ color:0x2563eb, transparent:true, opacity:0.35, side:THREE.DoubleSide, depthWrite:false }),
      );
      cursorField.visible = !coarsePointer;
      scene.add(cursorField);

      const pointer = { x:0, y:0, active:false };
      const target = { x:0, y:0 };
      const worldPointer = new THREE.Vector3();
      const move = (event:PointerEvent) => {
        target.x = (event.clientX / innerWidth - 0.5) * 2;
        target.y = (event.clientY / innerHeight - 0.5) * 2;
        pointer.active = true;
      };
      const leave = () => { pointer.active = false; target.x = 0; target.y = 0; };
      const scroll = () => { scrollTarget = Math.min(scrollY / innerHeight, 5); };
      const resize = () => { camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); renderer.setSize(innerWidth, innerHeight, false); };

      const render = (now:number) => {
        if (effectsOff) return;
        const dt = Math.min((now - last) / 1000, 0.04);
        const time = now * 0.00035;
        last = now;
        pointer.x += (target.x - pointer.x) * 0.055;
        pointer.y += (target.y - pointer.y) * 0.055;

        worldPointer.set(pointer.x, -pointer.y, 0.15).unproject(camera);
        const direction = worldPointer.sub(camera.position).normalize();
        worldPointer.copy(camera.position).add(direction.multiplyScalar((0 - camera.position.z) / direction.z));
        cursorField.position.lerp(worldPointer, 0.16);
        cursorField.scale.setScalar(1 + Math.sin(now * 0.004) * 0.12);

        // Only nearby points are displaced. They spring back to their stored embedding positions.
        if (!reduced && !compact) {
          for (let i = 0; i < count; i++) {
            const p = i * 3;
            const dx = worldPointer.x - positions[p];
            const dy = worldPointer.y - positions[p+1];
            const distance2 = dx*dx + dy*dy;
            const influence = pointer.active && distance2 < 5 ? (1 - distance2 / 5) * 0.035 : 0;
            positions[p] += dx * influence + (origins[p] - positions[p]) * 0.032;
            positions[p+1] += dy * influence + Math.sin(time * 2 + phases[i]) * 0.0009 + (origins[p+1] - positions[p+1]) * 0.032;
            positions[p+2] += (origins[p+2] - positions[p+2]) * 0.032;
          }
          particleGeometry.attributes.position.needsUpdate = true;
        }

        network.rotation.y += reduced ? 0 : dt * 0.025;
        network.rotation.x = Math.sin(time * 0.6) * 0.025 + pointer.y * 0.025;
        core.rotation.y += reduced ? 0 : dt * 0.2;
        core.rotation.x += reduced ? 0 : dt * 0.06;
        const progress = Math.min(scrollTarget / 3, 1);
        layers[0].position.y += (progress*2.25 - layers[0].position.y) * 0.04;
        layers[0].position.x += (-progress*0.85 - layers[0].position.x) * 0.04;
        layers[1].position.x += (progress*1.65 - layers[1].position.x) * 0.04;
        layers[1].position.y += (-progress*0.35 - layers[1].position.y) * 0.04;
        layers[2].position.x += (-progress*1.55 - layers[2].position.x) * 0.04;
        layers[2].position.y += (-progress*1.55 - layers[2].position.y) * 0.04;
        core.position.x += ((compact?2.35:4.05) + pointer.x*0.5 - core.position.x) * 0.035;
        core.position.y += (0.55 - pointer.y*0.35 - core.position.y) * 0.035;
        core.scale.setScalar(1 - progress*0.18);
        camera.position.x += (pointer.x*0.52 - camera.position.x) * 0.03;
        camera.position.y += (-pointer.y*0.38 - camera.position.y) * 0.03;
        camera.position.z += (12 - scrollTarget*0.65 - camera.position.z) * 0.03;
        camera.lookAt(0,0,0);
        renderer.render(scene,camera);
        if (!reduced && !document.hidden) frame = requestAnimationFrame(render);
      };

      const visibility = () => { cancelAnimationFrame(frame); if (!document.hidden && !reduced && !effectsOff) { last=performance.now(); frame=requestAnimationFrame(render); } };
      const effects = (event:Event) => { effectsOff=(event as CustomEvent).detail.reduced; cancelAnimationFrame(frame); if (!effectsOff) { last=performance.now(); frame=requestAnimationFrame(render); } };
      addEventListener("pointermove",move,{passive:true});
      addEventListener("pointerleave",leave,{passive:true});
      addEventListener("scroll",scroll,{passive:true});
      addEventListener("resize",resize,{passive:true});
      addEventListener("gopal-effects",effects);
      document.addEventListener("visibilitychange",visibility);
      scroll();
      if (!effectsOff) frame=requestAnimationFrame(render);

      dispose = () => {
        cancelAnimationFrame(frame);
        removeEventListener("pointermove",move); removeEventListener("pointerleave",leave); removeEventListener("scroll",scroll); removeEventListener("resize",resize); removeEventListener("gopal-effects",effects);
        document.removeEventListener("visibilitychange",visibility);
        particleGeometry.dispose(); particleMaterial.dispose(); lineGeometry.dispose(); lineMaterial.dispose();
        layers.forEach(layer => { layer.geometry.dispose(); layer.material.dispose(); });
        cursorField.geometry.dispose(); cursorField.material.dispose(); renderer.dispose();
      };
    })();

    return () => { cancelled = true; dispose(); };
  }, []);

  return <canvas id="webgl-canvas" ref={ref} className="pointer-events-none fixed inset-0 z-0 h-screen w-screen bg-[#F8FAFC]" aria-hidden="true"/>;
}
