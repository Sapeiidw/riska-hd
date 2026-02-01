"use client";

import { useState, useRef, useCallback } from "react";
import { useSession } from "@/lib/auth-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v4";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as localeId } from "date-fns/locale";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Pencil,
  Save,
  X,
  CheckCircle2,
  AlertCircle,
  Camera,
  Key,
  CreditCard,
  Loader2,
  Eye,
  EyeOff,
  Smartphone,
  Monitor,
  Trash2,
  Globe,
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const profileSchema = z.object({
  name: z.string().min(2, "Nama minimal 2 karakter"),
});

const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Password saat ini wajib diisi"),
    newPassword: z.string().min(8, "Password baru minimal 8 karakter"),
    confirmPassword: z.string().min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password tidak cocok",
    path: ["confirmPassword"],
  });

const activateSchema = z.object({
  nik: z
    .string()
    .length(16, "NIK harus 16 digit")
    .regex(/^\d+$/, "NIK harus berupa angka"),
});

type ProfileFormData = z.infer<typeof profileSchema>;
type ChangePasswordFormData = z.infer<typeof changePasswordSchema>;
type ActivateFormData = z.infer<typeof activateSchema>;

const roleLabels: Record<string, { label: string; color: string }> = {
  admin: { label: "Administrator", color: "bg-red-100 text-red-700" },
  dokter: { label: "Dokter", color: "bg-blue-100 text-blue-700" },
  perawat: { label: "Perawat", color: "bg-green-100 text-green-700" },
  pasien: { label: "Pasien", color: "bg-purple-100 text-purple-700" },
  edukator: { label: "Edukator", color: "bg-orange-100 text-orange-700" },
  user: { label: "User", color: "bg-gray-100 text-gray-700" },
};

interface SessionData {
  id: string;
  createdAt: string;
  expiresAt: string;
  ipAddress: string | null;
  userAgent: string | null;
  isCurrent: boolean;
}

function redirectToLogin() {
  if (typeof window !== "undefined") {
    window.location.href = "/sign-in";
  }
}

async function fetchProfile() {
  const res = await fetch("/api/profile");
  const data = await res.json();
  if (!res.ok) {
    if (data.error?.code === "UNAUTHORIZED") {
      redirectToLogin();
      throw new Error("Authentication required");
    }
    throw new Error("Gagal memuat profil");
  }
  return data.data;
}

async function fetchSessions(): Promise<SessionData[]> {
  const res = await fetch("/api/profile/sessions");
  const data = await res.json();
  if (!res.ok) {
    if (data.error?.code === "UNAUTHORIZED") {
      redirectToLogin();
      throw new Error("Authentication required");
    }
    throw new Error("Gagal memuat sesi");
  }
  return data.data;
}

async function deleteSession(sessionId: string) {
  const res = await fetch(`/api/profile/sessions?sessionId=${sessionId}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) {
    if (data.error?.code === "UNAUTHORIZED") {
      redirectToLogin();
      throw new Error("Authentication required");
    }
    throw new Error(data.error?.message || "Gagal menghapus sesi");
  }
  return data;
}

function parseUserAgent(userAgent: string | null): { device: string; browser: string; os: string } {
  if (!userAgent) return { device: "Unknown", browser: "Unknown", os: "Unknown" };

  // Detect device type
  let device = "Desktop";
  if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
    device = /iPad/i.test(userAgent) ? "Tablet" : "Mobile";
  }

  // Detect browser
  let browser = "Unknown";
  if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) browser = "Chrome";
  else if (/Firefox/i.test(userAgent)) browser = "Firefox";
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = "Safari";
  else if (/Edg/i.test(userAgent)) browser = "Edge";
  else if (/Opera|OPR/i.test(userAgent)) browser = "Opera";

  // Detect OS
  let os = "Unknown";
  if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Mac OS/i.test(userAgent)) os = "macOS";
  else if (/Linux/i.test(userAgent)) os = "Linux";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/iOS|iPhone|iPad/i.test(userAgent)) os = "iOS";

  return { device, browser, os };
}

async function updateProfile(data: ProfileFormData) {
  const res = await fetch("/api/profile", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Gagal mengupdate profil");
  }
  return res.json();
}

async function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  const res = await fetch("/api/profile/upload-photo", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Gagal mengupload foto");
  }
  return res.json();
}

async function changePassword(data: ChangePasswordFormData) {
  const res = await fetch("/api/profile/change-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Gagal mengubah password");
  }
  return res.json();
}

async function activateAccount(data: ActivateFormData) {
  const res = await fetch("/api/profile/activate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Gagal mengaktivasi akun");
  }
  return res.json();
}

// Compress image using canvas
async function compressImage(
  file: File,
  maxWidth = 400,
  maxHeight = 400,
  quality = 0.8
): Promise<File> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let { width, height } = img;

        if (width > height) {
          if (width > maxWidth) {
            height = (height * maxWidth) / width;
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = (width * maxHeight) / height;
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(new File([blob], file.name, { type: "image/jpeg" }));
            } else {
              reject(new Error("Gagal mengkompresi gambar"));
            }
          },
          "image/jpeg",
          quality
        );
      };
      img.onerror = () => reject(new Error("Gagal memuat gambar"));
    };
    reader.onerror = () => reject(new Error("Gagal membaca file"));
  });
}

function ProfileSkeleton() {
  return (
    <div className="col-span-12 space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64 mt-2" />
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <Skeleton className="h-6 w-32" />
              <Skeleton className="h-4 w-24" />
            </div>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { data: session, isPending: sessionPending } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showActivateDialog, setShowActivateDialog] = useState(false);
  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
    enabled: !!session?.user,
  });

  const { data: sessions, isLoading: sessionsLoading } = useQuery({
    queryKey: ["sessions"],
    queryFn: fetchSessions,
    enabled: !!session?.user,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: profile?.name || session?.user?.name || "",
    },
  });

  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
  });

  const {
    register: registerActivate,
    handleSubmit: handleSubmitActivate,
    formState: { errors: activateErrors },
  } = useForm<ActivateFormData>({
    resolver: zodResolver(activateSchema),
  });

  const updateMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      toast.success("Profil berhasil diperbarui");
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadPhoto,
    onSuccess: () => {
      toast.success("Foto profil berhasil diupload");
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const passwordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success("Password berhasil diubah");
      setShowPasswordDialog(false);
      resetPassword();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const activateMutation = useMutation({
    mutationFn: activateAccount,
    onSuccess: () => {
      toast.success("Akun berhasil diaktivasi");
      setShowActivateDialog(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      window.location.reload();
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const deleteSessionMutation = useMutation({
    mutationFn: deleteSession,
    onSuccess: () => {
      toast.success("Sesi berhasil dihapus");
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleFileChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Format file harus JPG, PNG, atau WebP");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }

      try {
        const compressedFile = await compressImage(file);
        uploadMutation.mutate(compressedFile);
      } catch {
        toast.error("Gagal memproses gambar");
      }
    },
    [uploadMutation]
  );

  const onSubmit = (data: ProfileFormData) => {
    updateMutation.mutate(data);
  };

  const onSubmitPassword = (data: ChangePasswordFormData) => {
    passwordMutation.mutate(data);
  };

  const onSubmitActivate = (data: ActivateFormData) => {
    activateMutation.mutate(data);
  };

  const handleCancel = () => {
    reset({ name: profile?.name || session?.user?.name || "" });
    setIsEditing(false);
  };

  if (sessionPending || profileLoading) {
    return <ProfileSkeleton />;
  }

  if (!session?.user) {
    return (
      <div className="col-span-12 flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Silakan login untuk melihat profil Anda
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const userData = profile || session.user;
  const roleInfo = roleLabels[userData.role || "user"] || roleLabels.user;
  const initials = userData.name
    ?.split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const isActivated = profile?.isActivated ?? false;

  return (
    <div className="col-span-12 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profil Saya</h1>
        <p className="text-muted-foreground">
          Lihat dan kelola informasi profil Anda
        </p>
      </div>

      {/* Activation Banner */}
      {!isActivated && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <AlertCircle className="h-6 w-6 text-amber-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="font-semibold text-amber-800">
                  Akun Belum Diaktivasi
                </h3>
                <p className="text-sm text-amber-700 mt-1">
                  Untuk menggunakan fitur lengkap RISKA HD (jadwal HD, monitoring, dll),
                  Anda perlu mengaktivasi akun dengan mengisi NIK.
                  Tanpa aktivasi, Anda hanya dapat melihat artikel informasi.
                </p>
                <Button
                  className="mt-3"
                  size="sm"
                  onClick={() => setShowActivateDialog(true)}
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Aktivasi Sekarang
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        {/* Profile Card */}
        <Card className="md:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative group">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={userData.image || undefined} alt={userData.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white">
                    {initials}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadMutation.isPending}
                  className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  {uploadMutation.isPending ? (
                    <Loader2 className="h-6 w-6 text-white animate-spin" />
                  ) : (
                    <Camera className="h-6 w-6 text-white" />
                  )}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Klik foto untuk mengubah
              </p>
              <div className="text-center space-y-1">
                <h2 className="text-xl font-semibold">{userData.name}</h2>
                <div className="flex items-center justify-center gap-2">
                  <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                  {isActivated ? (
                    <Badge className="bg-emerald-100 text-emerald-700">Aktif</Badge>
                  ) : (
                    <Badge variant="outline" className="text-amber-600 border-amber-300">
                      Belum Aktif
                    </Badge>
                  )}
                </div>
              </div>
              <Separator />
              <div className="w-full space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground truncate">
                    {userData.email}
                  </span>
                </div>
                {profile?.nik && (
                  <div className="flex items-center gap-3 text-sm">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      NIK: {profile.nik.slice(0, 4)}****{profile.nik.slice(-4)}
                    </span>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  {userData.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      <span className="text-emerald-600">Email Terverifikasi</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-amber-500" />
                      <span className="text-amber-600">Email Belum Terverifikasi</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-muted-foreground">
                    Bergabung{" "}
                    {format(new Date(userData.createdAt), "dd MMMM yyyy", {
                      locale: localeId,
                    })}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informasi Akun
                </CardTitle>
                <CardDescription>
                  Kelola informasi dasar akun Anda
                </CardDescription>
              </div>
              {!isEditing && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    reset({ name: userData.name });
                    setIsEditing(true);
                  }}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nama Lengkap</Label>
                {isEditing ? (
                  <div>
                    <Input
                      id="name"
                      {...register("name")}
                      placeholder="Masukkan nama lengkap"
                    />
                    {errors.name && (
                      <p className="text-sm text-destructive mt-1">
                        {errors.name.message}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50">
                    <span>{userData.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50">
                  <span className="text-muted-foreground">{userData.email}</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  Email tidak dapat diubah
                </p>
              </div>

              <div className="space-y-2">
                <Label>NIK</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50">
                  {profile?.nik ? (
                    <span className="text-muted-foreground">
                      {profile.nik.slice(0, 4)}****{profile.nik.slice(-4)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground italic">Belum diisi</span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  NIK diperlukan untuk aktivasi akun
                </p>
              </div>

              <div className="space-y-2">
                <Label>Role</Label>
                <div className="flex items-center h-10 px-3 rounded-md border bg-muted/50">
                  <Badge className={roleInfo.color}>{roleInfo.label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Role diatur oleh administrator
                </p>
              </div>

              {isEditing && (
                <div className="flex justify-end gap-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Batal
                  </Button>
                  <Button type="submit" disabled={updateMutation.isPending}>
                    <Save className="h-4 w-4 mr-2" />
                    {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Security Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Keamanan Akun
            </CardTitle>
            <CardDescription>
              Kelola keamanan dan akses akun Anda
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="p-4 rounded-lg border bg-muted/30">
                <h3 className="font-medium mb-2">Status Verifikasi Email</h3>
                <div className="flex items-center gap-2">
                  {userData.emailVerified ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-emerald-600">Terverifikasi</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="text-amber-600">Belum Terverifikasi</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <h3 className="font-medium mb-2">Status Aktivasi</h3>
                <div className="flex items-center gap-2">
                  {isActivated ? (
                    <>
                      <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      <span className="text-emerald-600">Aktif</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      <span className="text-amber-600">Belum Aktif</span>
                    </>
                  )}
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-muted/30">
                <h3 className="font-medium mb-2">Terakhir Diperbarui</h3>
                <p className="text-muted-foreground">
                  {format(new Date(userData.updatedAt), "dd MMMM yyyy, HH:mm", {
                    locale: localeId,
                  })}
                </p>
              </div>
            </div>
            <Separator className="my-4" />
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                onClick={() => setShowPasswordDialog(true)}
              >
                <Key className="h-4 w-4 mr-2" />
                Ganti Password
              </Button>
              {!isActivated && (
                <Button onClick={() => setShowActivateDialog(true)}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Aktivasi Akun
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Session Management Card */}
        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Sesi Login Aktif
            </CardTitle>
            <CardDescription>
              Kelola perangkat yang sedang login ke akun Anda. Anda dapat menghapus sesi dari perangkat lain jika diperlukan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {sessionsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4 p-4 rounded-lg border">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            ) : sessions && sessions.length > 0 ? (
              <div className="space-y-3">
                {sessions.map((s) => {
                  const { device, browser, os } = parseUserAgent(s.userAgent);
                  const DeviceIcon = device === "Mobile" ? Smartphone : Monitor;
                  const isExpired = new Date(s.expiresAt) < new Date();

                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-4 p-4 rounded-lg border ${
                        s.isCurrent ? "border-sky-200 bg-sky-50/50" : ""
                      } ${isExpired ? "opacity-50" : ""}`}
                    >
                      <div className={`p-2 rounded-full ${s.isCurrent ? "bg-sky-100" : "bg-muted"}`}>
                        <DeviceIcon className={`h-5 w-5 ${s.isCurrent ? "text-sky-600" : "text-muted-foreground"}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm">
                            {browser} di {os}
                          </p>
                          {s.isCurrent && (
                            <Badge className="bg-sky-100 text-sky-700 text-xs">
                              Sesi Ini
                            </Badge>
                          )}
                          {isExpired && (
                            <Badge variant="outline" className="text-xs text-amber-600 border-amber-300">
                              Kadaluarsa
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground mt-1">
                          <span>
                            {s.ipAddress || "IP tidak diketahui"}
                          </span>
                          <span>
                            Login: {format(new Date(s.createdAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                          </span>
                          <span>
                            Berlaku sampai: {format(new Date(s.expiresAt), "dd MMM yyyy, HH:mm", { locale: localeId })}
                          </span>
                        </div>
                      </div>
                      {!s.isCurrent && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                          onClick={() => deleteSessionMutation.mutate(s.id)}
                          disabled={deleteSessionMutation.isPending}
                        >
                          {deleteSessionMutation.isPending ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4" />
                          )}
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Tidak ada sesi aktif</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ganti Password</DialogTitle>
            <DialogDescription>
              Masukkan password lama dan password baru Anda
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  {...registerPassword("currentPassword")}
                  placeholder="Masukkan password saat ini"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((p) => ({ ...p, current: !p.current }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.currentPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  {...registerPassword("newPassword")}
                  placeholder="Masukkan password baru"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((p) => ({ ...p, new: !p.new }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.newPassword.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Konfirmasi Password Baru</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  {...registerPassword("confirmPassword")}
                  placeholder="Masukkan ulang password baru"
                />
                <button
                  type="button"
                  onClick={() =>
                    setShowPassword((p) => ({ ...p, confirm: !p.confirm }))
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {passwordErrors.confirmPassword.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowPasswordDialog(false);
                  resetPassword();
                }}
                disabled={passwordMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Menyimpan...
                  </>
                ) : (
                  "Simpan"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Activate Account Dialog */}
      <AlertDialog open={showActivateDialog} onOpenChange={setShowActivateDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Aktivasi Akun</AlertDialogTitle>
            <AlertDialogDescription>
              Masukkan NIK (Nomor Induk Kependudukan) Anda untuk mengaktivasi akun.
              NIK diperlukan untuk verifikasi identitas dan mengakses fitur lengkap RISKA HD.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmitActivate(onSubmitActivate)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nik">NIK (16 digit)</Label>
              <Input
                id="nik"
                {...registerActivate("nik")}
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
              />
              {activateErrors.nik && (
                <p className="text-sm text-destructive">
                  {activateErrors.nik.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowActivateDialog(false)}
                disabled={activateMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" disabled={activateMutation.isPending}>
                {activateMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengaktivasi...
                  </>
                ) : (
                  "Aktivasi"
                )}
              </Button>
            </div>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
