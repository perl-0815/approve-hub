import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_JP } from "next/font/google";
import "./globals.css";

const notoSansJp = Noto_Sans_JP({
  variable: "--font-noto-sans-jp",
  subsets: ["latin"],
});

const jetBrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: "Approve Hub",
    template: "%s | Approve Hub",
  },
  description: "複数人で承認フローを管理するためのグループ承認システム",
  applicationName: "Approve Hub",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    siteName: "Approve Hub",
    title: "Approve Hub",
    description: "複数人で承認フローを管理するためのグループ承認システム",
    locale: "ja_JP",
    url: "/",
  },
  twitter: {
    card: "summary",
    title: "Approve Hub",
    description: "複数人で承認フローを管理するためのグループ承認システム",
  },
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicons/favicon-48x48.png", sizes: "48x48", type: "image/png" },
      { url: "/favicons/favicon-64x64.png", sizes: "64x64", type: "image/png" },
      { url: "/favicons/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicons/favicon-128x128.png", sizes: "128x128", type: "image/png" },
      { url: "/favicons/favicon-180x180.png", sizes: "180x180", type: "image/png" },
      { url: "/favicons/favicon-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicons/favicon-256x256.png", sizes: "256x256", type: "image/png" },
      { url: "/favicons/favicon-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
    shortcut: ["/favicon-32x32.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className={`${notoSansJp.variable} ${jetBrainsMono.variable}`}>
        <div className="app-shell">
          {children}
          <footer className="app-footer">© 2026 Kozyutu</footer>
        </div>
      </body>
    </html>
  );
}
