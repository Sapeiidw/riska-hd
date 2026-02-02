"use client";

import Link from "next/link";
import { Logo } from "@/components/Logo";
import { useSession } from "@/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LayoutDashboard, LogIn } from "lucide-react";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session } = useSession();

  // Determine dashboard URL based on user role
  const getDashboardUrl = () => {
    const user = session?.user as { role?: string } | undefined;
    if (user?.role === "pasien") {
      return "/portal";
    }
    return "/dashboard";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b shadow-sm">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/">
              <Logo size="sm" showTagline />
            </Link>
            <nav className="flex items-center gap-3">
              <Link
                href="/informasi"
                className="text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Semua Artikel
              </Link>

              {session ? (
                <>
                  <Link href={getDashboardUrl()}>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 rounded-full text-[13px] border-sky-200 text-sky-600 hover:bg-sky-50 hover:text-sky-700"
                    >
                      <LayoutDashboard className="h-4 w-4" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Avatar className="h-8 w-8 cursor-pointer ring-2 ring-transparent hover:ring-sky-200 transition-all">
                      <AvatarImage src={session.user.image || ""} />
                      <AvatarFallback className="bg-gradient-to-br from-sky-400 to-cyan-500 text-white text-sm">
                        {session.user.name?.charAt(0).toUpperCase() || "U"}
                      </AvatarFallback>
                    </Avatar>
                  </Link>
                </>
              ) : (
                <Link href="/sign-in">
                  <Button
                    size="sm"
                    className="gap-2 rounded-full text-[13px] bg-sky-500 hover:bg-sky-600"
                  >
                    <LogIn className="h-4 w-4" />
                    Masuk
                  </Button>
                </Link>
              )}
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
              Ruang Informasi & Sistem Kelola Aktivitas Hemodialisa
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
