"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgetPassword } from "@/lib/auth-client";
import { ArrowLeft, KeyRound, Mail } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await forgetPassword({
      email,
      redirectTo: "/reset-password",
    });

    if (error) {
      setError(error.message || "Terjadi kesalahan saat mengirim email");
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    return (
      <div className="flex min-h-screen">
        {/* Left Panel */}
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
                Cek Email
                <br />
                <span className="text-cyan-300">Anda</span>
              </h1>
              <p className="mt-4 text-sky-100/80 text-lg max-w-md">
                Kami telah mengirimkan instruksi untuk reset password ke email Anda.
              </p>
            </div>
            <p className="text-sky-200/50 text-sm">
              &copy; {new Date().getFullYear()} RISKA HD. All rights reserved.
            </p>
          </div>
        </div>

        {/* Right Panel - Success */}
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
              <Mail className="h-8 w-8 text-green-600" />
            </div>

            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Email Terkirim
              </h2>
              <p className="text-gray-500">
                Kami telah mengirimkan link reset password ke{" "}
                <span className="font-medium text-gray-900">{email}</span>.
                Silakan cek inbox atau folder spam Anda.
              </p>
            </div>

            <Link href="/sign-in">
              <Button
                variant="outline"
                className="w-full h-11 border-gray-200 mt-4"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke halaman login
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
              Lupa
              <br />
              Password?
              <br />
              <span className="text-cyan-300">Tenang saja.</span>
            </h1>
            <p className="mt-4 text-sky-100/80 text-lg max-w-md">
              Masukkan alamat email Anda dan kami akan mengirimkan link untuk mengatur ulang password.
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
            <KeyRound className="h-7 w-7 text-sky-600" />
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Lupa Password
            </h2>
            <p className="text-gray-500">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset password
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
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-sky-500 focus:ring-sky-500"
              />
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
                  Mengirim...
                </span>
              ) : (
                "Kirim Link Reset"
              )}
            </Button>
          </form>

          <div className="text-center">
            <Link
              href="/sign-in"
              className="text-sm text-gray-500 hover:text-gray-700 font-medium inline-flex items-center transition-colors"
            >
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Kembali ke halaman login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
