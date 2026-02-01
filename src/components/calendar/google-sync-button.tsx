"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { RefreshCw, Unlink, Link2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface GoogleSyncButtonProps {
  type: "nurse" | "patient" | "all";
}

async function checkSyncStatus() {
  const res = await fetch("/api/google/sync");
  if (!res.ok) throw new Error("Failed to check status");
  return res.json();
}

async function getAuthUrl(returnUrl: string) {
  const res = await fetch(`/api/google/auth?returnUrl=${encodeURIComponent(returnUrl)}`);
  if (!res.ok) throw new Error("Failed to get auth URL");
  return res.json();
}

async function syncToGoogle(type: string) {
  const res = await fetch("/api/google/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type }),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error?.message || "Sync failed");
  }
  return res.json();
}

async function disconnectGoogle() {
  const res = await fetch("/api/google/sync", { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to disconnect");
  return res.json();
}

export function GoogleSyncButton({ type }: GoogleSyncButtonProps) {
  const [showDisconnectDialog, setShowDisconnectDialog] = useState(false);
  const queryClient = useQueryClient();

  const { data: status, isLoading: statusLoading } = useQuery({
    queryKey: ["google-sync-status"],
    queryFn: checkSyncStatus,
  });

  const connectMutation = useMutation({
    mutationFn: () => getAuthUrl(window.location.pathname),
    onSuccess: (data) => {
      if (data.url) {
        window.location.href = data.url;
      }
    },
    onError: () => {
      toast.error("Gagal menghubungkan ke Google Calendar");
    },
  });

  const syncMutation = useMutation({
    mutationFn: () => syncToGoogle(type),
    onSuccess: (data) => {
      toast.success(data.data?.message || "Berhasil sync ke Google Calendar");
      queryClient.invalidateQueries({ queryKey: ["google-sync-status"] });
    },
    onError: (error: Error) => {
      toast.error(error.message || "Gagal sync ke Google Calendar");
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: disconnectGoogle,
    onSuccess: () => {
      toast.success("Google Calendar berhasil diputus");
      queryClient.invalidateQueries({ queryKey: ["google-sync-status"] });
      setShowDisconnectDialog(false);
    },
    onError: () => {
      toast.error("Gagal memutus koneksi");
    },
  });

  // Check URL params for success/error
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("google_connected") === "true") {
      toast.success("Google Calendar berhasil terhubung");
      // Clean URL
      window.history.replaceState({}, "", window.location.pathname);
    }
    if (params.get("error")) {
      toast.error("Gagal menghubungkan Google Calendar");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  const isConnected = status?.data?.connected;
  const isLoading =
    statusLoading ||
    connectMutation.isPending ||
    syncMutation.isPending ||
    disconnectMutation.isPending;

  if (!isConnected) {
    return (
      <Button
        variant="outline"
        onClick={() => connectMutation.mutate()}
        disabled={isLoading}
        className="gap-2"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="currentColor"
            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1.41 16.09V7.5h2.82v10.59h-2.82zm4.25-4.25L12 16.68l-2.84-2.84 2-2 .84.84.84-.84 2 2z"
          />
        </svg>
        <svg className="h-4 w-4" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          />
        </svg>
        {isLoading ? "Menghubungkan..." : "Hubungkan Google Calendar"}
      </Button>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" disabled={isLoading} className="gap-2">
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            {syncMutation.isPending ? "Syncing..." : "Google Calendar"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Sync Sekarang
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={() => setShowDisconnectDialog(true)}
            className="text-destructive focus:text-destructive"
          >
            <Unlink className="mr-2 h-4 w-4" />
            Putuskan Koneksi
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDisconnectDialog} onOpenChange={setShowDisconnectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Putuskan Google Calendar?</AlertDialogTitle>
            <AlertDialogDescription>
              Jadwal yang sudah di-sync akan tetap ada di Google Calendar Anda, tetapi
              tidak akan di-update lagi dari aplikasi ini.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => disconnectMutation.mutate()}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Putuskan
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
