import type { Metadata } from "next";
import "./globals.css";
import { display, body } from "@/lib/fonts";

export const metadata: Metadata = {
  title: {
    default: "Duel Standby · North Celebeast",
    template: "%s · DSCB",
  },
  description:
    "Competitive Yu-Gi-Oh! team hub — deck tier list, player stats, tournament results and matchup data for Duel Standby North Celebeast.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${display.variable} ${body.variable} h-full`}>
      <body className="flex min-h-full flex-col">{children}</body>
    </html>
  );
}
