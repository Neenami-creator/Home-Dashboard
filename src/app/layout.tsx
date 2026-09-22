import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import { IdleScreensaver } from "@/components/IdleScreensaver";
import { TimeOfDayTheme } from "@/components/TimeOfDayTheme";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { MotionProvider } from "@/components/MotionProvider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// A display face for the clock, temperature, and other large numerals -
// gives the dashboard its own identity rather than reading as a generic
// Tailwind/Vercel-template app. Its optical-size axis is tuned per use via
// font-variation-settings in globals.css rather than separate font weights.
const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz", "SOFT"],
});

export const metadata: Metadata = {
  title: "Home Dashboard",
  description: "Wall-mounted home dashboard: lights, music, weather and recipes.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Home Dashboard",
  },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#0a0a0a",
};

// Runs before paint to feature-detect real flexbox `gap` support (Safari
// only gained this in 14.1 - the "old iPad on outdated iOS" this dashboard
// targets tops out at iOS 12.5.7). `CSS.supports('gap', '1px')` alone can't
// tell flex-gap from grid-gap (Safari has supported the latter since 10.1),
// so this measures a real flex container instead. globals.css uses the
// data-no-flexgap attribute this sets to apply a margin-based fallback.
const FLEXGAP_DETECTION_SCRIPT = `
(function () {
  try {
    var flex = document.createElement("div");
    flex.style.cssText = "position:absolute;visibility:hidden;display:flex;flex-direction:row;gap:10px;";
    var a = document.createElement("div");
    a.style.cssText = "width:1px;height:1px;flex:none;";
    var b = a.cloneNode();
    flex.appendChild(a);
    flex.appendChild(b);
    document.documentElement.appendChild(flex);
    var supported = flex.scrollWidth >= 6;
    document.documentElement.removeChild(flex);
    if (!supported) document.documentElement.setAttribute("data-no-flexgap", "");
  } catch (e) {}
})();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Script id="flexgap-detect" strategy="beforeInteractive">
          {FLEXGAP_DETECTION_SCRIPT}
        </Script>
        <ServiceWorkerRegistration />
        <TimeOfDayTheme />
        <MotionProvider>
          <IdleScreensaver>{children}</IdleScreensaver>
        </MotionProvider>
      </body>
    </html>
  );
}
