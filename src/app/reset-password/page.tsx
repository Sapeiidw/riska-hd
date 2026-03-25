"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resetPassword } from "@/lib/auth-client";
import { AlertTriangle, CheckCircle, Eye, EyeOff, Lock } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password dan konfirmasi password tidak cocok");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal 8 karakter");
      return;
    }

    if (!token) {
      setError("Token reset password tidak valid");
      return;
    }

    setLoading(true);

    const { error } = await resetPassword({
      newPassword: password,
      token,
    });

    if (error) {
      setError(error.message || "Terjadi kesalahan saat reset password");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  // Invalid token state
  if (!token) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-800">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm font-bold text-lg">
                RH
              </div>
              <span className="text-2xl font-bold tracking-tight">RISKA HD</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold leading-tight">
                Link
                <br />
                <span className="text-cyan-300">Tidak Valid</span>
              </h1>
              <p className="mt-4 text-sky-100/80 text-lg max-w-md">
                Link reset password tidak valid atau sudah kadaluarsa.
              </p>
            </div>
            <p className="text-sky-200/50 text-sm">
              &copy; {new Date().getFullYear()} RISKA HD. All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-white">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25">
                RH
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                RISKA HD
              </span>
            </div>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50 ring-8 ring-red-50/50">
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Link Tidak Valid
              </h2>
              <p className="text-gray-500">
                Link reset password tidak valid atau sudah kadaluarsa. Silakan request link baru.
              </p>
            </div>

            <Link href="/forgot-password">
              <Button className="w-full h-11 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg shadow-sky-500/25 mt-4">
                Request Link Baru
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Success state
  if (success) {
    return (
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-800">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
          </div>
          <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm font-bold text-lg">
                RH
              </div>
              <span className="text-2xl font-bold tracking-tight">RISKA HD</span>
            </div>
            <div>
              <h1 className="text-4xl font-bold leading-tight">
                Password
                <br />
                <span className="text-cyan-300">Berhasil Direset</span>
              </h1>
              <p className="mt-4 text-sky-100/80 text-lg max-w-md">
                Anda sekarang dapat login dengan password baru Anda.
              </p>
            </div>
            <p className="text-sky-200/50 text-sm">
              &copy; {new Date().getFullYear()} RISKA HD. All rights reserved.
            </p>
          </div>
        </div>

        <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-white">
          <div className="w-full max-w-md space-y-8 text-center">
            <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25">
                RH
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
                RISKA HD
              </span>
            </div>

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-50 ring-8 ring-green-50/50">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Password Berhasil Direset
              </h2>
              <p className="text-gray-500">
                Password Anda telah berhasil diubah. Silakan login dengan password baru Anda.
              </p>
            </div>

            <Link href="/sign-in">
              <Button className="w-full h-11 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg shadow-sky-500/25 mt-4">
                Login Sekarang
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Reset form
  return (
    <div className="flex min-h-screen">
      {/* Left Panel */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm font-bold text-lg">
              RH
            </div>
            <span className="text-2xl font-bold tracking-tight">RISKA HD</span>
          </div>
          <div>
            <h1 className="text-4xl font-bold leading-tight">
              Atur Ulang
              <br />
              Password
              <br />
              <span className="text-cyan-300">Anda</span>
            </h1>
            <p className="mt-4 text-sky-100/80 text-lg max-w-md">
              Buat password baru yang kuat untuk melindungi akun Anda.
            </p>
          </div>
          <p className="text-sky-200/50 text-sm">
            &copy; {new Date().getFullYear()} RISKA HD. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25">
              RH
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              RISKA HD
            </span>
          </div>

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-sky-50 ring-8 ring-sky-50/50 lg:mx-0">
            <Lock className="h-7 w-7 text-sky-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Reset Password
            </h2>
            <p className="text-gray-500">
              Masukkan password baru Anda
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password Baru
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Minimal 8 karakter"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 border-gray-200 focus:border-sky-500 focus:ring-sky-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Konfirmasi Password
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Ulangi password baru"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={8}
                  className="h-11 border-gray-200 focus:border-sky-500 focus:ring-sky-500 pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-11 bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600 shadow-lg shadow-sky-500/25 transition-all duration-200 font-medium"
              disabled={loading}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memproses...
                </span>
              ) : (
                "Reset Password"
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-white">
          <div className="flex items-center gap-2 text-gray-400">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Memuat...
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
