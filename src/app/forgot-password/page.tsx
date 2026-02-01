"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { forgetPassword } from "@/lib/auth-client";
import { ArrowLeft, Mail } from "lucide-react";
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
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center space-y-4 pb-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-green-600">
              <Mail className="h-7 w-7" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Email Terkirim
              </CardTitle>
              <CardDescription className="pt-2">
                Kami telah mengirimkan link reset password ke{" "}
                <span className="font-medium text-gray-900">{email}</span>.
                Silakan cek inbox atau folder spam Anda.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Link href="/sign-in">
              <Button
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke halaman login
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-500 text-white font-bold text-xl shadow-lg shadow-sky-500/30">
            RH
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 bg-clip-text text-transparent">
              Lupa Password
            </CardTitle>
            <CardDescription className="pt-2">
              Masukkan email Anda dan kami akan mengirimkan link untuk reset
              password
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="nama@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
              disabled={loading}
            >
              {loading ? "Mengirim..." : "Kirim Link Reset"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Link
              href="/sign-in"
              className="text-sm text-sky-600 hover:underline font-medium inline-flex items-center"
            >
              <ArrowLeft className="mr-1 h-4 w-4" />
              Kembali ke halaman login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
