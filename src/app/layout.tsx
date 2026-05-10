import type { Metadata } from "next";
import Script from "next/script";
import { Inter } from "next/font/google";
import "./globals.css";
import { siteConfig } from "@/lib/site";
import { Navigation } from "@/components/navigation";
import { Footer } from "@/components/footer";
import { ServiceWorkerRegister } from "@/components/sw-register";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: siteConfig.title,
    template: "%s | OmniTools",
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  manifest: "/manifest.webmanifest",
  openGraph: {
    type: "website",
    url: siteConfig.url,
    title: siteConfig.title,
    description: siteConfig.description,
    siteName: siteConfig.name,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.title,
    description: siteConfig.description,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script
          id="theme-init"
          strategy="beforeInteractive"
        >{`(() => { try { const stored = localStorage.getItem('omnitools-theme'); const dark = stored ? stored === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches; document.documentElement.classList.toggle('dark', dark); document.documentElement.style.colorScheme = dark ? 'dark' : 'light'; } catch (e) {} })();`}</Script>
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <div className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.9),transparent_28%)] transition-colors dark:bg-[radial-gradient(circle_at_top,rgba(15,23,42,0.72),transparent_30%)]">
            <Navigation />
            <main className="pb-16 pt-6 sm:pt-8">{children}</main>
            <Footer />
            <ServiceWorkerRegister />
          </div>

          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
