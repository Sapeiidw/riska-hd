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
import api from "@/lib/api/axios";
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

async function fetchProfile() {
  const { data } = await api.get("/api/profile");
  return data.data;
}

async function fetchSessions(): Promise<SessionData[]> {
  const { data } = await api.get("/api/profile/sessions");
  return data.data;
}

async function deleteSession(sessionId: string) {
  const { data } = await api.delete(`/api/profile/sessions?sessionId=${sessionId}`);
  return data;
}

function parseUserAgent(userAgent: string | null): { device: string; browser: string; os: string } {
  if (!userAgent) return { device: "Unknown", browser: "Unknown", os: "Unknown" };

  let device = "Desktop";
  if (/Mobile|Android|iPhone|iPad/i.test(userAgent)) {
    device = /iPad/i.test(userAgent) ? "Tablet" : "Mobile";
  }

  let browser = "Unknown";
  if (/Chrome/i.test(userAgent) && !/Edg/i.test(userAgent)) browser = "Chrome";
  else if (/Firefox/i.test(userAgent)) browser = "Firefox";
  else if (/Safari/i.test(userAgent) && !/Chrome/i.test(userAgent)) browser = "Safari";
  else if (/Edg/i.test(userAgent)) browser = "Edge";
  else if (/Opera|OPR/i.test(userAgent)) browser = "Opera";

  let os = "Unknown";
  if (/Windows/i.test(userAgent)) os = "Windows";
  else if (/Mac OS/i.test(userAgent)) os = "macOS";
  else if (/Linux/i.test(userAgent)) os = "Linux";
  else if (/Android/i.test(userAgent)) os = "Android";
  else if (/iOS|iPhone|iPad/i.test(userAgent)) os = "iOS";

  return { device, browser, os };
}

async function updateProfile(data: ProfileFormData) {
  const { data: res } = await api.patch("/api/profile", data);
  return res;
}

async function uploadPhoto(file: File) {
  const formData = new FormData();
  formData.append("photo", file);
  const { data: res } = await api.post("/api/profile/upload-photo", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res;
}

async function changePassword(data: ChangePasswordFormData) {
  const { data: res } = await api.post("/api/profile/change-password", data);
  return res;
}

async function activateAccount(data: ActivateFormData) {
  const { data: res } = await api.post("/api/profile/activate", data);
  return res;
}

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
    <div className="col-span-12 space-y-4">
      <Skeleton className="h-32 w-full rounded-2xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
      <Skeleton className="h-48 w-full rounded-xl" />
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
    <div className="col-span-12 space-y-4">
      {/* Header dengan Profil - Compact di Mobile */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-sky-50 via-cyan-50 to-white border border-sky-100 shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiLz48cGF0aCBkPSJNMjAgMjBjMC0xMS4wNDYgOC45NTQtMjAgMjAtMjB2NDBoLTQwYzExLjA0NiAwIDIwLTguOTU0IDIwLTIweiIgZmlsbD0iIzBFQTVFOSIgZmlsbC1vcGFjaXR5PSIuMDMiLz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative p-4 sm:p-6">
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Avatar */}
            <div className="relative group shrink-0">
              <Avatar className="h-14 w-14 sm:h-16 sm:w-16 ring-2 ring-white shadow-md">
                <AvatarImage src={userData.image || undefined} alt={userData.name} />
                <AvatarFallback className="text-lg sm:text-xl bg-gradient-to-br from-sky-500 to-cyan-500 text-white font-semibold">
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
                  <Loader2 className="h-5 w-5 text-white animate-spin" />
                ) : (
                  <Camera className="h-5 w-5 text-white" />
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

            {/* Name & Badges */}
            <div className="flex-1 min-w-0">
              <h1 className="text-base sm:text-xl font-bold text-gray-800 truncate">
                {userData.name}
              </h1>
              <p className="text-xs sm:text-sm text-gray-500 truncate mb-1.5">
                {userData.email}
              </p>
              <div className="flex flex-wrap gap-1.5">
                <Badge className={`${roleInfo.color} text-[10px] sm:text-xs`}>{roleInfo.label}</Badge>
                {isActivated ? (
                  <Badge className="bg-emerald-100 text-emerald-700 text-[10px] sm:text-xs">Aktif</Badge>
                ) : (
                  <Badge variant="outline" className="text-amber-600 border-amber-300 text-[10px] sm:text-xs">
                    Belum Aktif
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Activation Banner - Compact */}
      {!isActivated && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 sm:p-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-800">Akun Belum Diaktivasi</p>
              <p className="text-xs text-amber-700 mt-0.5 mb-2">
                Aktivasi dengan NIK untuk fitur lengkap
              </p>
              <Button
                size="sm"
                className="h-7 text-xs"
                onClick={() => setShowActivateDialog(true)}
              >
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                Aktivasi
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Informasi Akun Card */}
      <Card>
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
              <CardTitle className="text-sm sm:text-base">Informasi Akun</CardTitle>
            </div>
            {!isEditing && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-xs"
                onClick={() => {
                  reset({ name: userData.name });
                  setIsEditing(true);
                }}
              >
                <Pencil className="h-3.5 w-3.5 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
            {/* Info Grid di Mobile */}
            <div className="space-y-2.5">
              <div className="flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600 truncate">{userData.email}</span>
              </div>
              {profile?.nik && (
                <div className="flex items-center gap-2.5 text-sm">
                  <CreditCard className="h-4 w-4 text-gray-400 shrink-0" />
                  <span className="text-gray-600">NIK: {profile.nik.slice(0, 4)}****{profile.nik.slice(-4)}</span>
                </div>
              )}
              <div className="flex items-center gap-2.5 text-sm">
                {userData.emailVerified ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                    <span className="text-emerald-600">Email Terverifikasi</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-amber-500 shrink-0" />
                    <span className="text-amber-600">Email Belum Terverifikasi</span>
                  </>
                )}
              </div>
              <div className="flex items-center gap-2.5 text-sm">
                <Calendar className="h-4 w-4 text-gray-400 shrink-0" />
                <span className="text-gray-600">
                  Bergabung {format(new Date(userData.createdAt), "dd MMM yyyy", { locale: localeId })}
                </span>
              </div>
            </div>

            {isEditing && (
              <>
                <Separator className="my-3" />
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-xs">Nama Lengkap</Label>
                  <Input
                    id="name"
                    {...register("name")}
                    placeholder="Masukkan nama lengkap"
                    className="h-9 text-sm"
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">{errors.name.message}</p>
                  )}
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="flex-1 h-8 text-xs"
                    onClick={handleCancel}
                    disabled={updateMutation.isPending}
                  >
                    <X className="h-3.5 w-3.5 mr-1" />
                    Batal
                  </Button>
                  <Button type="submit" size="sm" className="flex-1 h-8 text-xs" disabled={updateMutation.isPending}>
                    <Save className="h-3.5 w-3.5 mr-1" />
                    {updateMutation.isPending ? "Menyimpan..." : "Simpan"}
                  </Button>
                </div>
              </>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Keamanan Card */}
      <Card>
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
            <CardTitle className="text-sm sm:text-base">Keamanan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          <div className="grid grid-cols-2 gap-2 mb-3">
            <div className="p-2.5 rounded-lg bg-gray-50 border">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Email</p>
              <div className="flex items-center gap-1.5">
                {userData.emailVerified ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">Verified</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600">Pending</span>
                  </>
                )}
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-gray-50 border">
              <p className="text-[10px] sm:text-xs text-gray-500 mb-1">Status</p>
              <div className="flex items-center gap-1.5">
                {isActivated ? (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-xs font-medium text-emerald-600">Aktif</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" />
                    <span className="text-xs font-medium text-amber-600">Pending</span>
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs flex-1"
              onClick={() => setShowPasswordDialog(true)}
            >
              <Key className="h-3.5 w-3.5 mr-1.5" />
              Ganti Password
            </Button>
            {!isActivated && (
              <Button size="sm" className="h-8 text-xs flex-1" onClick={() => setShowActivateDialog(true)}>
                <CreditCard className="h-3.5 w-3.5 mr-1.5" />
                Aktivasi Akun
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Session Card */}
      <Card>
        <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-4">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-sky-600" />
            <CardTitle className="text-sm sm:text-base">Sesi Login</CardTitle>
          </div>
          <CardDescription className="text-xs mt-1">
            Perangkat yang sedang login
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
          {sessionsLoading ? (
            <div className="space-y-2">
              {[1, 2].map((i) => (
                <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg border">
                  <Skeleton className="h-8 w-8 rounded-full shrink-0" />
                  <div className="flex-1 space-y-1.5">
                    <Skeleton className="h-3.5 w-24" />
                    <Skeleton className="h-3 w-32" />
                  </div>
                </div>
              ))}
            </div>
          ) : sessions && sessions.length > 0 ? (
            <div className="space-y-2">
              {sessions.map((s) => {
                const { browser, os } = parseUserAgent(s.userAgent);
                const DeviceIcon = s.userAgent && /Mobile|Android|iPhone/i.test(s.userAgent) ? Smartphone : Monitor;
                const isExpired = new Date(s.expiresAt) < new Date();

                return (
                  <div
                    key={s.id}
                    className={`flex items-center gap-2.5 p-2.5 rounded-lg border ${
                      s.isCurrent ? "border-sky-200 bg-sky-50/50" : ""
                    } ${isExpired ? "opacity-50" : ""}`}
                  >
                    <div className={`p-1.5 rounded-full shrink-0 ${s.isCurrent ? "bg-sky-100" : "bg-gray-100"}`}>
                      <DeviceIcon className={`h-4 w-4 ${s.isCurrent ? "text-sky-600" : "text-gray-500"}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <p className="text-xs font-medium">{browser} - {os}</p>
                        {s.isCurrent && (
                          <Badge className="bg-sky-100 text-sky-700 text-[10px] px-1.5 py-0">
                            Sesi Ini
                          </Badge>
                        )}
                      </div>
                      <p className="text-[10px] text-gray-500 mt-0.5">
                        {s.ipAddress || "IP tidak diketahui"} • {format(new Date(s.createdAt), "dd MMM, HH:mm", { locale: localeId })}
                      </p>
                    </div>
                    {!s.isCurrent && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0"
                        onClick={() => deleteSessionMutation.mutate(s.id)}
                        disabled={deleteSessionMutation.isPending}
                      >
                        {deleteSessionMutation.isPending ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Trash2 className="h-3.5 w-3.5" />
                        )}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400">
              <Globe className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-xs">Tidak ada sesi aktif</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-base">Ganti Password</DialogTitle>
            <DialogDescription className="text-xs">
              Masukkan password lama dan baru
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitPassword(onSubmitPassword)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="currentPassword" className="text-xs">Password Saat Ini</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showPassword.current ? "text" : "password"}
                  {...registerPassword("currentPassword")}
                  placeholder="Password saat ini"
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => ({ ...p, current: !p.current }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.currentPassword && (
                <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="newPassword" className="text-xs">Password Baru</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showPassword.new ? "text" : "password"}
                  {...registerPassword("newPassword")}
                  placeholder="Password baru (min 8 karakter)"
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => ({ ...p, new: !p.new }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.newPassword && (
                <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirmPassword" className="text-xs">Konfirmasi Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showPassword.confirm ? "text" : "password"}
                  {...registerPassword("confirmPassword")}
                  placeholder="Ulangi password baru"
                  className="h-9 text-sm pr-9"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => ({ ...p, confirm: !p.confirm }))}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordErrors.confirmPassword && (
                <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => {
                  setShowPasswordDialog(false);
                  resetPassword();
                }}
                disabled={passwordMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="flex-1 h-8 text-xs" disabled={passwordMutation.isPending}>
                {passwordMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
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
        <AlertDialogContent className="max-w-[calc(100vw-2rem)] sm:max-w-md rounded-xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-base">Aktivasi Akun</AlertDialogTitle>
            <AlertDialogDescription className="text-xs">
              Masukkan NIK untuk verifikasi identitas
            </AlertDialogDescription>
          </AlertDialogHeader>
          <form onSubmit={handleSubmitActivate(onSubmitActivate)} className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="nik" className="text-xs">NIK (16 digit)</Label>
              <Input
                id="nik"
                {...registerActivate("nik")}
                placeholder="Masukkan 16 digit NIK"
                maxLength={16}
                className="h-9 text-sm"
              />
              {activateErrors.nik && (
                <p className="text-xs text-destructive">{activateErrors.nik.message}</p>
              )}
            </div>
            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex-1 h-8 text-xs"
                onClick={() => setShowActivateDialog(false)}
                disabled={activateMutation.isPending}
              >
                Batal
              </Button>
              <Button type="submit" size="sm" className="flex-1 h-8 text-xs" disabled={activateMutation.isPending}>
                {activateMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" />
                    Aktivasi...
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
