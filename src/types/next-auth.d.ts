// types/next-auth.d.ts
import NextAuth from "next-auth";

console.log("next-auth.d.ts", NextAuth);
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
  }
}
