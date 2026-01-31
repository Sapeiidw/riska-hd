"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSession } from "@/lib/auth-client";

export default function DashboardPage() {
  const { data: session } = useSession();

  return (
    <div className="col-span-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-gray-500">
          Selamat datang{session?.user?.name ? `, ${session.user.name}` : ""}!
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              Mulai tambahkan data
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              Sesi aktif saat ini
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Online</div>
            <p className="text-xs text-muted-foreground">
              Sistem berjalan normal
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Version</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.1.0</div>
            <p className="text-xs text-muted-foreground">
              Starter template
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Mulai dari sini</CardTitle>
          <CardDescription>
            Template ini sudah siap digunakan untuk membangun aplikasi Anda
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-2">
            <h3 className="font-semibold">Fitur yang tersedia:</h3>
            <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
              <li>Authentication dengan Better Auth (email/password)</li>
              <li>Database PostgreSQL dengan Drizzle ORM</li>
              <li>UI Components dari shadcn/ui</li>
              <li>Sidebar navigation</li>
              <li>Dark mode ready</li>
              <li>React Query untuk data fetching</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
