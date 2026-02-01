"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { signIn } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error } = await signIn.email({
      email,
      password,
    });

    if (error) {
      setError(error.message || "Terjadi kesalahan saat masuk");
      setLoading(false);
      return;
    }

    router.push("/dashboard");
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-cyan-50">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-500 via-sky-600 to-cyan-500 text-white font-bold text-xl shadow-lg shadow-sky-500/30">
            RH
          </div>
          <div>
            <CardTitle className="text-2xl font-bold bg-gradient-to-r from-sky-500 via-sky-600 to-cyan-500 bg-clip-text text-transparent">
              RISKA HD
            </CardTitle>
            <p className="text-xs text-gray-500 mt-1">
              <span className="font-semibold text-sky-600">R</span>uang{" "}
              <span className="font-semibold text-sky-600">I</span>nformasi &{" "}
              <span className="font-semibold text-sky-600">S</span>istem{" "}
              <span className="font-semibold text-sky-600">K</span>elola{" "}
              <span className="font-semibold text-sky-600">A</span>ktivitas{" "}
              <span className="font-semibold text-sky-600">H</span>emo
              <span className="font-semibold text-sky-600">d</span>ialisa
            </p>
          </div>
          <CardDescription className="pt-2">
            Masuk ke akun Anda untuk melanjutkan
          </CardDescription>
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
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-sky-600 hover:underline"
                >
                  Lupa password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-600 hover:to-cyan-600"
              disabled={loading}
            >
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
          <div className="mt-4 text-center text-sm">
            Belum punya akun?{" "}
            <Link href="/sign-up" className="text-sky-600 hover:underline font-medium">
              Daftar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
