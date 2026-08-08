import type { Metadata } from "next";
import { Bricolage_Grotesque, DM_Sans } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import "./globals.css";

const display = Bricolage_Grotesque({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["600", "700", "800"],
});

const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "UwTornooi — Marketing ideas",
    template: "%s · UwTornooi ideas",
  },
  description:
    "Working overview of marketing and sales ideas for UwTornooi.be — club data, cold outreach, social alerts, and Tournify SEO/SEA content.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${body.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="ut-atmosphere flex min-h-full flex-col"
      >
        <SiteHeader />
        {children}
        <footer className="mt-auto border-t border-border/80 py-6 text-center text-xs text-ink-faint">
          Internal ideas board for{" "}
          <a
            href="https://uwtornooi.be"
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-dark underline-offset-2 hover:underline"
          >
            uwtornooi.be
          </a>
        </footer>
      </body>
    </html>
  );
}
