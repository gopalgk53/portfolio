import type { Metadata } from "next";
import { StoryExperience } from "../../components/3d/story/story-experience";

export const metadata: Metadata = {
  title: "The Scroll Story",
  description: "A scroll-bound cinematic walkthrough of the AI workflow — from data pipelines to autonomous agents.",
  alternates: { canonical: "/story" },
  robots: { index: false, follow: true },
};

export default function StoryPage() {
  return (
    <main id="main-content" className="story-page" tabIndex={-1}>
      <StoryExperience />
    </main>
  );
}
