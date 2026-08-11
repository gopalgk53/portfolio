import { Hero } from "../components/hero";
import { Portfolio } from "../components/portfolio";
import { AIAssistant } from "../components/ai-assistant";
import { SiteEnhancements } from "../components/site-enhancements";

export default function Home() {
  return <main><Hero /><Portfolio /><AIAssistant /><SiteEnhancements /></main>;
}
