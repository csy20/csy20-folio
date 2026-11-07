import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import localFont from "next/font/local";
import Script from "next/script";
import { config } from "@/config";
import { portraits, profile, socialLinks } from "@/data/siteContent";
import { Providers } from "@/site/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const spaceGrotesk = localFont({
  src: "../../public/fonts/space-grotesk.woff2",
  variable: "--font-space-grotesk",
  weight: "400 700",
  display: "swap",
});

const title = "Chitresh Yadav — Backend · Applied ML";
const description = "Building useful software, from model to product.";

export const metadata: Metadata = {
  metadataBase: new URL(config.siteUrl),
  title,
  description,
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: "csy20",
    title,
    description,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f5f1" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
};

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: profile.name,
  alternateName: profile.handle,
  jobTitle: profile.role,
  description: profile.heroDescription,
  url: config.siteUrl,
  image: `${config.siteUrl}${portraits.twitter.src}`,
  sameAs: socialLinks
    .filter((link) => link.icon !== "email")
    .map((link) => link.href),
};

const themeScript = `(() => {
  let theme = "dark";
  try {
    if (window.matchMedia("(prefers-color-scheme: light)").matches) theme = "light";
  } catch (e) {}
  try {
    const stored = localStorage.getItem("csy20-theme");
    if (stored === "light" || stored === "dark") theme = stored;
  } catch (e) {}
  document.documentElement.setAttribute("data-theme", theme);
  document.documentElement.style.colorScheme = theme;
  const content = theme === "light" ? "#f6f5f1" : "#0a0a0a";
  document.querySelectorAll('meta[name="theme-color"]').forEach((meta) => {
    meta.setAttribute("content", content);
  });
  let seen = false;
  try {
    seen = sessionStorage.getItem("csy20-opened") === "1";
  } catch (e) {}
  if (!seen && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    document.documentElement.classList.add("is-opening");
    window.setTimeout(() => {
      document.documentElement.classList.remove("is-opening");
    }, 2500);
  }
})();`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-theme="dark"
      className={`${geistSans.variable} ${geistMono.variable} ${spaceGrotesk.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
        />
        <Script
          id="theme-prepaint"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{ __html: themeScript }}
        />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
