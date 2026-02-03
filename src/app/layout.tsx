import { Provider } from "@/components/Provider";
import { Toaster } from "@/components/ui/sonner";
import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const plusJakartaSans = Plus_Jakarta_Sans({
  variable: "--font-plus-jakarta",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://riska-hd.vercel.app";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: "RISKA HD - Ruang Informasi & Sistem Kelola Aktivitas Hemodialisa",
    template: "%s | RISKA HD",
  },
  description:
    "RISKA HD adalah platform digital terintegrasi untuk manajemen layanan hemodialisis. Kelola pasien, jadwal cuci darah, dokumentasi medis, dan edukasi kesehatan ginjal dalam satu sistem.",
  keywords: [
    "hemodialisis",
    "cuci darah",
    "manajemen rumah sakit",
    "gagal ginjal",
    "dialisis",
    "kesehatan ginjal",
    "sistem informasi kesehatan",
    "RISKA HD",
    "aplikasi hemodialisa",
    "rekam medis dialisis",
  ],
  authors: [{ name: "RISKA HD Team" }],
  creator: "RISKA HD",
  publisher: "RISKA HD",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: BASE_URL,
    siteName: "RISKA HD",
    title: "RISKA HD - Ruang Informasi & Sistem Kelola Aktivitas Hemodialisa",
    description:
      "Platform digital terintegrasi untuk manajemen layanan hemodialisis. Kelola pasien, jadwal, dokumentasi, dan edukasi dalam satu sistem.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RISKA HD - Sistem Manajemen Hemodialisis",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RISKA HD - Ruang Informasi & Sistem Kelola Aktivitas Hemodialisa",
    description:
      "Platform digital terintegrasi untuk manajemen layanan hemodialisis.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: "healthcare",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "RISKA HD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <html lang="id">
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="theme-color" content="#0ea5e9" />
        </head>
        <body
          className={`${plusJakartaSans.variable} font-sans antialiased bg-neutral-200`}
        >
          {children}
          <Toaster />
        </body>
      </html>
    </Provider>
  );
}
