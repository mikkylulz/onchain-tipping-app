import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MiniKitProvider } from "@/components/MiniKitProvider";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Onchain Tipping",
  description: "A seamless onchain tipping experience on Base",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const suppress = (msg) => 
                  typeof msg === 'string' && (
                    msg.includes('runtime.sendMessage') || 
                    msg.includes('Extension ID') ||
                    msg.includes('chrome-extension')
                  );

                const originalError = console.error;
                console.error = (...args) => {
                  if (args[0] && suppress(args[0])) return;
                  originalError.apply(console, args);
                };

                const originalWarn = console.warn;
                console.warn = (...args) => {
                  if (args[0] && suppress(args[0])) return;
                  originalWarn.apply(console, args);
                };

                window.addEventListener('error', (event) => {
                  if (event.message && suppress(event.message)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);

                window.addEventListener('unhandledrejection', (event) => {
                  if (event.reason && suppress(event.reason.message || event.reason)) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);

                // Aggressively remove Next.js error overlay
                if (typeof window !== 'undefined') {
                  const observer = new MutationObserver((mutations) => {
                    for (const mutation of mutations) {
                      for (const node of mutation.addedNodes) {
                        if (node.nodeName === 'NEXTJS-PORTAL' || node.nodeName === 'NEXT-JS-INTERNAL-ERROR-OVERLAY') {
                          node.remove();
                        }
                      }
                    }
                    const overlays = document.querySelectorAll('nextjs-portal, [data-nextjs-dialog-overlay]');
                    overlays.forEach(o => o.remove());
                  });
                  observer.observe(document.documentElement, { childList: true, subtree: true });
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans`}
      >
        <MiniKitProvider>
          {/* Soft Fade Mask: Fades out scrolling content before it reaches the Header */}
          <div className="fixed top-0 inset-x-0 h-40 bg-gradient-to-b from-black via-black to-transparent pointer-events-none z-[90] opacity-100" />
          
          <Navbar />
          {children}
        </MiniKitProvider>
      </body>
    </html>
  );
}
