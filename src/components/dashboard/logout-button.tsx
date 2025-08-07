// components/logout-button.tsx
"use client"

import { signOut } from "next-auth/react"
import { Button } from  "@/components/ui/button"

export function LogoutButton() {
  return (
    <Button 
      variant="ghost"
      onClick={() => signOut({ callbackUrl: "/login" })}
    >
      Sign Out
    </Button>
  )
}