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

export const metadata: Metadata = {
  title: "RISKA HD - Ruang Informasi & Kelola Aktifitas Hemodialisa",
  description: "Manajemen dokter, perawat, pasien, dan edukasi hemodialisis dalam satu platform. Terstruktur, terintegrasi, dan aman.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Provider>
      <html lang="en">
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
