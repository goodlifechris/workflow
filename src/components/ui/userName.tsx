// components/layout/UserMenu.tsx
'use client';

import { signOut } from "next-auth/react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function UserMenu({ session }: { session: any }) {
  return (
    <div className="flex items-center space-x-4">
      {!session?.user ? (
        <>
          <Link href="/login">
            <Button variant="outline">Sign In</Button>
          </Link>
          <Link href="/signup">
            <Button>Sign Up</Button>
          </Link>
        </>
      ) : (
        <>
          <div className="flex items-center space-x-2">
            <Avatar className="w-8 h-8">
              <AvatarImage src={session.user.image || ""} alt={session.user.name || "User"} />
              <AvatarFallback>
                {session.user.name?.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm font-medium">{session.user.name}</span>
          </div>
          <Button variant="ghost" onClick={() => signOut()}>
            Sign Out
          </Button>
        </>
      )}
    </div>
  );
}