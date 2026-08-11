"use client";

import { useEffect, useRef } from "react";

type Point3D = { x: number; y: number; z: number; cluster: number; phase: number };
type Projected = Point3D & { sx: number; sy: number; scale: number; depth: number };

const COLORS = [[82,214,255],[164,104,255],[28,232,177],[255,74,177]] as const;
const CENTERS = [[-2.4,-.8,0],[2.1,-1.1,-1.2],[-1,1.7,-2],[2.5,1.4,.4]] as const;

export function NeuralBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d")!;
    if (!canvas || !ctx) return;
    const activeCanvas = canvas;
    const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lowPower = innerWidth < 760 || (navigator.hardwareConcurrency || 4) <= 4;
    const frameInterval = 1000 / (lowPower ? 30 : 45);
    let width = innerWidth, height = innerHeight, raf = 0, last = 0, lastPaint = 0, elapsed = 0;
    let points: Point3D[] = [];
    let pointerX = 0, pointerY = 0, targetX = 0, targetY = 0;

    function seed() {
      const count = lowPower ? 88 : 190;
      points = Array.from({length: count}, (_, i) => {
        const cluster = i % 4, center = CENTERS[cluster];
        // Box-Muller produces dense Gaussian neighborhoods, like a projected embedding space.
        const u = Math.max(Math.random(), .001), v = Math.random();
        const radius = Math.sqrt(-2 * Math.log(u)) * .62;
        const angle = Math.PI * 2 * v;
        return {x:center[0]+Math.cos(angle)*radius,y:center[1]+Math.sin(angle)*radius,z:center[2]+(Math.random()-.5)*1.8,cluster,phase:Math.random()*Math.PI*2};
      });
    }

    function resize() {
      const dpr = Math.min(devicePixelRatio, lowPower ? 1 : 1.25);
      width = innerWidth; height = innerHeight;
      activeCanvas.width = width*dpr; activeCanvas.height = height*dpr;
      activeCanvas.style.width = `${width}px`; activeCanvas.style.height = `${height}px`;
      ctx.setTransform(dpr,0,0,dpr,0,0); seed();
    }

    function project(point: Point3D, time: number): Projected {
      const ax = reduced ? .18 : time*.055 + pointerX*.18;
      const ay = reduced ? -.18 : time*.035 + pointerY*.12;
      const ca=Math.cos(ax),sa=Math.sin(ax),cb=Math.cos(ay),sb=Math.sin(ay);
      const x1=point.x*ca-point.z*sa, z1=point.x*sa+point.z*ca;
      const y1=point.y*cb-z1*sb, z2=point.y*sb+z1*cb;
      const camera=9, scale=Math.min(width,height)*.095*(camera/(camera+z2));
      return {...point,sx:width*.5+x1*scale,sy:height*.5+y1*scale,scale:camera/(camera+z2),depth:z2};
    }

    function grid(time: number) {
      ctx.save(); ctx.translate(width*.5,height*.73); ctx.strokeStyle="rgba(104,175,255,.055)"; ctx.lineWidth=.7;
      const horizon=Math.min(width*.55,520);
      for(let i=-8;i<=8;i++){ctx.beginPath();ctx.moveTo(i*14,0);ctx.lineTo(i*horizon/8,height*.32);ctx.stroke();}
      for(let i=0;i<9;i++){const p=i/8;ctx.beginPath();ctx.moveTo(-horizon*p,height*.32*p);ctx.lineTo(horizon*p,height*.32*p);ctx.stroke();}
      ctx.restore();
      if(!reduced){const scan=(time*.08)%1;const g=ctx.createLinearGradient(0,height*scan-30,0,height*scan+30);g.addColorStop(0,"transparent");g.addColorStop(.5,"rgba(89,190,255,.045)");g.addColorStop(1,"transparent");ctx.fillStyle=g;ctx.fillRect(0,height*scan-30,width,60);}
    }

    function draw(now: number) {
      if (!reduced && now - lastPaint < frameInterval) { raf=requestAnimationFrame(draw); return; }
      lastPaint=now;
      const dt=Math.min((now-last)/1000,.04); last=now; elapsed+=reduced?0:dt;
      pointerX+=(targetX-pointerX)*.035; pointerY+=(targetY-pointerY)*.035;
      ctx.clearRect(0,0,width,height); grid(elapsed);
      const projected=points.map(p=>project(p,elapsed)).sort((a,b)=>b.depth-a.depth);
      // Sparse same-cluster edges suggest high-similarity relationships without visual noise.
      ctx.globalCompositeOperation="lighter";
      for(let i=0;i<projected.length;i+=5){const a=projected[i];for(let j=i+1;j<Math.min(i+12,projected.length);j++){const b=projected[j];if(a.cluster!==b.cluster)continue;const dx=a.sx-b.sx,dy=a.sy-b.sy,d2=dx*dx+dy*dy;if(d2<5184){const d=Math.sqrt(d2),c=COLORS[a.cluster];ctx.strokeStyle=`rgba(${c[0]},${c[1]},${c[2]},${(1-d/72)*.07})`;ctx.beginPath();ctx.moveTo(a.sx,a.sy);ctx.lineTo(b.sx,b.sy);ctx.stroke();}}}
      projected.forEach((p,i)=>{const c=COLORS[p.cluster];const highlight=i%23===0,pulse=reduced?1:.75+Math.sin(elapsed*1.7+p.phase)*.25;const r=Math.max(.45,(highlight?2:1)*p.scale*pulse);ctx.shadowBlur=highlight?9:0;ctx.shadowColor=`rgb(${c[0]},${c[1]},${c[2]})`;ctx.fillStyle=`rgba(${c[0]},${c[1]},${c[2]},${Math.min(.7,.27+p.scale*.2)})`;ctx.beginPath();ctx.arc(p.sx,p.sy,r,0,Math.PI*2);ctx.fill();});
      // Animated inference path travels across cluster centroids.
      if(!reduced){const path=CENTERS.map((c,i)=>project({x:c[0],y:c[1],z:c[2],cluster:i,phase:0},elapsed));const progress=(elapsed*.12)%1,segment=progress*3,index=Math.min(2,Math.floor(segment)),mix=segment-index,a=path[index],b=path[index+1],x=a.sx+(b.sx-a.sx)*mix,y=a.sy+(b.sy-a.sy)*mix;ctx.shadowBlur=18;ctx.shadowColor="#ffffff";ctx.fillStyle="rgba(255,255,255,.8)";ctx.beginPath();ctx.arc(x,y,2.2,0,Math.PI*2);ctx.fill();}
      ctx.shadowBlur=0;ctx.globalCompositeOperation="source-over";
      if(!reduced) raf=requestAnimationFrame(draw);
    }

    const move=(event:PointerEvent)=>{targetX=event.clientX/width-.5;targetY=event.clientY/height-.5;};
    const visibility=()=>{cancelAnimationFrame(raf);if(!document.hidden&&!reduced){last=performance.now();raf=requestAnimationFrame(draw);}};
    resize(); addEventListener("resize",resize,{passive:true}); addEventListener("pointermove",move,{passive:true}); document.addEventListener("visibilitychange",visibility);
    if(reduced) draw(0); else raf=requestAnimationFrame(draw);
    return()=>{cancelAnimationFrame(raf);removeEventListener("resize",resize);removeEventListener("pointermove",move);document.removeEventListener("visibilitychange",visibility);};
  }, []);

  return <canvas ref={canvasRef} className="pointer-events-none fixed inset-0 z-0 opacity-80" aria-hidden="true" />;
}
