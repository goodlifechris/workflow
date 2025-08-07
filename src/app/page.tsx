/* eslint-disable @next/next/no-async-client-component */
import { Button } from "@/components/ui/button";
import Header from "@/components/ui/header";
import { authOptions } from "@/lib/auth";
import { getServerSession, Session } from "next-auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";


export default async function LandingPage() {

 
  const session = await getServerSession(authOptions);
  
  // Redirect to dashboard if logged in
  if (session) {
    redirect("/dashboard");
  }
  // Redirect to login if not logged in
  redirect("/login");

  // Redirect to login if not logged in
  return (
    <>

    <main className="flex flex-col min-h-screen items-center justify-between bg-gradient-to-br from-white to-blue-50 text-gray-900">

<section className="flex-grow flex flex-col items-center justify-center px-6 text-center">
  <h2 className="text-4xl md:text-5xl font-extrabold leading-tight max-w-3xl">
    Build workflows smarter.
  </h2>
  <p className="mt-4 text-lg text-gray-600 max-w-xl">
    Automate tasks, connect systems, and streamline your team&apos;s productivity with just a few clicks.
  </p>

  <div className="mt-6 flex gap-4">
    <Link href="/signup">
      <Button className="text-lg px-6 py-3">Get Started</Button>
    </Link>
    <Link href="/login">
      <Button variant="outline" className="text-lg px-6 py-3">
        I already have an account
      </Button>
    </Link>
  </div>
</section>

<footer className="w-full py-6 text-center text-sm text-gray-500">
  © {new Date().getFullYear()} FlowBuilder Inc. All rights reserved.
</footer>
</main>
    </>

  );
}
