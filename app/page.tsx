import { Hero } from "../components/hero";
import { Portfolio } from "../components/portfolio";
import { ClientExtras } from "../components/client-extras";
import { Preloader } from "../components/preloader";
import { SceneProvider } from "../components/3d/scene-state";

export default function Home() {
  return (
    <SceneProvider>
      <Preloader />
      <main id="main-content" tabIndex={-1}>
        <Hero />
        <Portfolio />
        <ClientExtras />
      </main>
    </SceneProvider>
  );
}
