"use client";

import { useEffect, useRef } from "react";

declare global { interface Window { THREE?: any } }

const THREE_CDN = "https://cdn.jsdelivr.net/npm/three@0.160.1/build/three.min.js";

function loadThree(): Promise<any> {
  if (window.THREE) return Promise.resolve(window.THREE);
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${THREE_CDN}"]`);
    if (existing) { existing.addEventListener("load", () => resolve(window.THREE), { once: true }); return; }
    const script = document.createElement("script");
    script.src = THREE_CDN; script.crossOrigin = "anonymous"; script.async = true;
    script.onload = () => resolve(window.THREE); script.onerror = reject;
    document.head.appendChild(script);
  });
}

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let disposed = false, frame = 0, cleanup = () => {};

    loadThree().then((THREE) => {
      if (disposed || !THREE) return;
      const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(58, innerWidth / innerHeight, .1, 100);
      camera.position.z = 12;
      const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, powerPreference: "high-performance" });
      renderer.setClearColor(0x000000, 1);
      renderer.setPixelRatio(Math.min(devicePixelRatio, innerWidth < 760 ? 1 : 1.35));
      renderer.setSize(innerWidth, innerHeight, false);

      const network = new THREE.Group();
      scene.add(network);
      const count = 1500, positions = new Float32Array(count * 3), colors = new Float32Array(count * 3);
      const centers = [[-3,-1,0],[2.8,-1,-1],[-1,2,-2],[3,2,1],[0,0,2]];
      const cyan = new THREE.Color(0x00f2fe), green = new THREE.Color(0x00ff66);
      for (let i=0;i<count;i++) {
        const center=centers[i%centers.length], radius=Math.pow(Math.random(),.55)*2.7, a=Math.random()*Math.PI*2, b=Math.acos(2*Math.random()-1);
        positions[i*3]=center[0]+radius*Math.sin(b)*Math.cos(a);
        positions[i*3+1]=center[1]+radius*Math.cos(b);
        positions[i*3+2]=center[2]+radius*Math.sin(b)*Math.sin(a);
        const color=i%3===0?green:cyan; colors[i*3]=color.r;colors[i*3+1]=color.g;colors[i*3+2]=color.b;
      }
      const particleGeometry=new THREE.BufferGeometry();
      particleGeometry.setAttribute("position",new THREE.BufferAttribute(positions,3));
      particleGeometry.setAttribute("color",new THREE.BufferAttribute(colors,3));
      const particles=new THREE.Points(particleGeometry,new THREE.PointsMaterial({size:.035,vertexColors:true,transparent:true,opacity:.72,depthWrite:false,blending:THREE.AdditiveBlending,sizeAttenuation:true}));
      network.add(particles);

      // A capped neighbor scan creates a dense-looking web without expensive all-pairs checks.
      const linePoints:number[]=[]; let connections=0;
      for(let i=0;i<count&&connections<1900;i+=2){for(let offset=5;offset<65&&connections<1900;offset+=5){const j=(i+offset)%count,dx=positions[i*3]-positions[j*3],dy=positions[i*3+1]-positions[j*3+1],dz=positions[i*3+2]-positions[j*3+2];if(dx*dx+dy*dy+dz*dz<2.1){linePoints.push(positions[i*3],positions[i*3+1],positions[i*3+2],positions[j*3],positions[j*3+1],positions[j*3+2]);connections++;}}}
      const lineGeometry=new THREE.BufferGeometry();lineGeometry.setAttribute("position",new THREE.Float32BufferAttribute(linePoints,3));
      const lines=new THREE.LineSegments(lineGeometry,new THREE.LineBasicMaterial({color:0x00f2fe,transparent:true,opacity:.075,depthWrite:false,blending:THREE.AdditiveBlending}));network.add(lines);

      // A small glyph texture is reused by all sprites to keep matrix streams inexpensive.
      const textureCanvas=document.createElement("canvas");textureCanvas.width=64;textureCanvas.height=64;
      const textureContext=textureCanvas.getContext("2d")!;textureContext.fillStyle="#00ff66";textureContext.font="bold 36px monospace";textureContext.textAlign="center";textureContext.fillText("01",32,43);
      const glyphTexture=new THREE.CanvasTexture(textureCanvas), glyphMaterial=new THREE.SpriteMaterial({map:glyphTexture,transparent:true,opacity:.22,depthWrite:false,blending:THREE.AdditiveBlending});
      const glyphs: any[]=[];
      for(let i=0;i<42;i++){const sprite=new THREE.Sprite(glyphMaterial);sprite.position.set((Math.random()-.5)*14,(Math.random()-.5)*10,(Math.random()-.5)*9);sprite.scale.set(.18,.34,1);sprite.userData.speed=.18+Math.random()*.32;glyphs.push(sprite);network.add(sprite);}

      const pointer={x:0,y:0}, target={x:0,y:0};let scrollTarget=0,last=performance.now();
      const onPointer=(event:PointerEvent)=>{target.x=(event.clientX/innerWidth-.5)*2;target.y=(event.clientY/innerHeight-.5)*2;};
      const onScroll=()=>{scrollTarget=Math.min(scrollY/Math.max(innerHeight,1),4);};
      const onResize=()=>{camera.aspect=innerWidth/innerHeight;camera.updateProjectionMatrix();renderer.setPixelRatio(Math.min(devicePixelRatio,innerWidth<760?1:1.35));renderer.setSize(innerWidth,innerHeight,false);};
      const render=(now:number)=>{const dt=Math.min((now-last)/1000,.04);last=now;pointer.x+=(target.x-pointer.x)*.045;pointer.y+=(target.y-pointer.y)*.045;if(!reduced){network.rotation.y+=dt*.035;network.rotation.x+=dt*.012;glyphs.forEach(sprite=>{sprite.position.y-=sprite.userData.speed*dt;if(sprite.position.y < -5)sprite.position.y=5;});}camera.position.x+=(pointer.x*.45-camera.position.x)*.035;camera.position.y+=(-pointer.y*.32-camera.position.y)*.035;camera.position.z+=(12-scrollTarget*.7-camera.position.z)*.035;camera.lookAt(0,0,0);renderer.render(scene,camera);if(!reduced&&!document.hidden)frame=requestAnimationFrame(render);};
      const visibility=()=>{cancelAnimationFrame(frame);if(!document.hidden&&!reduced){last=performance.now();frame=requestAnimationFrame(render);}};
      addEventListener("pointermove",onPointer,{passive:true});addEventListener("scroll",onScroll,{passive:true});addEventListener("resize",onResize,{passive:true});document.addEventListener("visibilitychange",visibility);onScroll();frame=requestAnimationFrame(render);
      cleanup=()=>{cancelAnimationFrame(frame);removeEventListener("pointermove",onPointer);removeEventListener("scroll",onScroll);removeEventListener("resize",onResize);document.removeEventListener("visibilitychange",visibility);particleGeometry.dispose();particles.material.dispose();lineGeometry.dispose();lines.material.dispose();glyphTexture.dispose();glyphMaterial.dispose();renderer.dispose();};
    }).catch(() => { canvas.style.background="#000"; });

    return () => { disposed=true;cleanup(); };
  }, []);

  return <canvas id="webgl-canvas" ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 h-screen w-screen bg-black opacity-75" aria-hidden="true" />;
}
