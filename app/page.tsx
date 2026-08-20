import { Hero } from "../components/hero";
import { Portfolio } from "../components/portfolio";
import { ClientExtras } from "../components/client-extras";
import { Preloader } from "../components/preloader";
import { SceneProvider } from "../components/3d/scene-state";

export default function Home() {
  return (
    <SceneProvider>
      <Preloader />
      <main id="page-content">
        <Hero />
        <Portfolio />
        <ClientExtras />
      </main>
    </SceneProvider>
  );
}
