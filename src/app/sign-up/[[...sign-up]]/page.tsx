"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signUp } from "@/lib/auth-client";
import { Activity, Eye, EyeOff, HeartPulse, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [nik, setNik] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateNik = (value: string) => {
    if (!value) {
      return "NIK wajib diisi";
    }
    if (!/^\d{16}$/.test(value)) {
      return "NIK harus 16 digit angka";
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const nikError = validateNik(nik);
    if (nikError) {
      setError(nikError);
      return;
    }

    setLoading(true);

    const { error } = await signUp.email({
      name,
      email,
      password,
      nik,
    });

    if (error) {
      setError(error.message || "Terjadi kesalahan saat mendaftar");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-sky-600 via-sky-700 to-cyan-800">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-300 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-sky-300 rounded-full blur-3xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm font-bold text-lg">
                RH
              </div>
              <span className="text-2xl font-bold tracking-tight">RISKA HD</span>
            </div>
          </div>

          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-bold leading-tight">
                Bergabung
                <br />
                dengan
                <br />
                <span className="text-cyan-300">RISKA HD</span>
              </h1>
              <p className="mt-4 text-sky-100/80 text-lg max-w-md">
                Daftarkan akun Anda untuk mengakses sistem pengelolaan hemodialisa yang terintegrasi.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4 max-w-md">
              <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Manajemen Pasien</p>
                  <p className="text-sky-200/70 text-xs">Data pasien hemodialisa terpusat</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Monitoring Sesi</p>
                  <p className="text-sky-200/70 text-xs">Pantau sesi HD secara real-time</p>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-xl bg-white/10 backdrop-blur-sm p-4">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/20">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <p className="font-medium text-sm">Keamanan Data</p>
                  <p className="text-sky-200/70 text-xs">Perlindungan data pasien terjamin</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sky-200/50 text-sm">
            &copy; {new Date().getFullYear()} RISKA HD. All rights reserved.
          </p>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="flex w-full lg:w-1/2 items-center justify-center p-6 sm:p-12 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-3 mb-4">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-bold text-sm shadow-lg shadow-sky-500/25">
              RH
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-sky-600 to-cyan-600 bg-clip-text text-transparent">
              RISKA HD
            </span>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">
              Buat Akun Baru
            </h2>
            <p className="text-gray-500">
              Lengkapi data berikut untuk mendaftar
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
                <svg className="h-4 w-4 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="name" className="text-gray-700 font-medium">
                Nama Lengkap
              </Label>
              <Input
                id="name"
                type="text"
                placeholder="Masukkan nama lengkap"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="h-11 border-gray-200 focus:border-sky-500 focus:ring-sky-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="nik" className="text-gray-700 font-medium">
                NIK (Nomor Induk Kependudukan)
              </Label>
              <Input
                id="nik"
                type="text"
                placeholder="16 digit NIK"
                value={nik}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, "").slice(0, 16);
                  setNik(value);
                }}
                maxLength={16}
                required
                className="h-11 border-gray-200 focus:border-sky-500 focus:ring-sky-500"
              />
              <p className="text-xs text-gray-400">
                NIK diperlukan untuk verifikasi identitas
              </p>
            </div>

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

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Password
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
                "Daftar"
              )}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white px-4 text-gray-400">atau</span>
            </div>
          </div>

          <p className="text-center text-sm text-gray-500">
            Sudah punya akun?{" "}
            <Link
              href="/sign-in"
              className="text-sky-600 hover:text-sky-700 font-semibold transition-colors"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
