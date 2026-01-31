"use client";

import { Button } from "@/components/ui/button";
import { useSession, signOut } from "@/lib/auth-client";
import Link from "next/link";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LogOut, User } from "lucide-react";

export function AuthButtons() {
  const { data: session, isPending } = useSession();

  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-gray-200" />;
  }

  if (!session) {
    return (
      <Link href="/sign-in">
        <Button size="sm">Masuk</Button>
      </Link>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarImage src={session.user.image || ""} alt={session.user.name} />
            <AvatarFallback>
              {session.user.name?.charAt(0).toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild>
          <Link href="/user" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => signOut()}
          className="flex items-center gap-2 text-red-600"
        >
          <LogOut className="h-4 w-4" />
          Keluar
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
