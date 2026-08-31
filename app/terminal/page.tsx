import type { Metadata } from "next";
import { TerminalShell } from "../../components/terminal-shell";

export const metadata: Metadata = {
  title: "Terminal",
  description: "An easter-egg CLI over this portfolio's real content.",
  robots: { index: false, follow: true },
};

export default function TerminalPage() {
  return <TerminalShell />;
}
