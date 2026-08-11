import "./globals.css";

export const metadata = {
  title: "Gopalakrishna Maddipalli | Generative AI Engineer",
  description:
    "Generative AI Engineer building production RAG systems, autonomous agents, and intelligent workflows.",
  metadataBase: new URL("https://gopalakrishnagenai.in"),
  alternates: { canonical: "/" },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
