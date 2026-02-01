import Link from "next/link";
import { Newspaper } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/informasi" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-sky-400 to-cyan-500 text-white">
                <Newspaper className="h-5 w-5" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">RISKA HD</h1>
                <p className="text-xs text-muted-foreground">Ruang Informasi</p>
              </div>
            </Link>
            <nav className="flex items-center gap-4">
              <Link
                href="/informasi"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Semua Artikel
              </Link>
              <Link
                href="/login"
                className="text-sm font-medium text-sky-600 hover:text-sky-700"
              >
                Masuk
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main>{children}</main>

      {/* Footer */}
      <footer className="bg-white border-t mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} RISKA HD. All rights reserved.</p>
            <p className="mt-1">
              Ruang Informasi & Kelola Aktifitas Hemodialisa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
