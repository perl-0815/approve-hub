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
