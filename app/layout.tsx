import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LinkFlow — Orquestração de Backlinks",
  description:
    "SaaS de orquestração de backlinks internos para sua rede de blogs.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
