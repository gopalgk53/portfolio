import { Hero } from "../components/hero";
import { Portfolio } from "../components/portfolio";
import { AIAssistant } from "../components/ai-assistant";
import { SiteEnhancements } from "../components/site-enhancements";
import { Preloader } from "../components/preloader";
import { SceneProvider } from "../components/3d/scene-state";
import { ThreeCanvas } from "../components/3d/three-canvas";

export default function Home() {
  return (
    <SceneProvider>
      <Preloader />
      <ThreeCanvas />
      <main id="page-content">
        <Hero />
        <Portfolio />
        <AIAssistant />
        <SiteEnhancements />
      </main>
    </SceneProvider>
  );
}
