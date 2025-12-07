"use client";

import { Button } from "@/components/ui/button";
import { SignInButton, SignedIn, SignedOut, UserButton } from "@clerk/nextjs";

export function AuthButtons() {
  return (
    <>
      <SignedOut>
        <SignInButton>
          <Button size={"sm"}>Masuk</Button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
