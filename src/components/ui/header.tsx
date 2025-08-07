// components/layout/Header.tsx (Server Component)
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { UserMenu } from "./userName";

export default async function Header() {
  const session = await getServerSession(authOptions);

  return (
    <header className="w-full border-b bg-white/90 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-black">
          FlowBuilder
        </Link>
        <UserMenu session={session} />
      </div>
    </header>
  );
}