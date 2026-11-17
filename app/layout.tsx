import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkFlow — Central Editorial Inteligente",
  description: "Plataforma privada LinkFlow de orquestração editorial, SEO e inteligência para gestão multi-blog.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className="dark">
      <body className="bg-background text-foreground antialiased selection:bg-emerald-500/30 selection:text-emerald-300">
        {children}
      </body>
    </html>
  );
}
