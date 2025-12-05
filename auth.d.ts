import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string        // ← AGGIUNGI QUESTA RIGA
      role: string
    } & DefaultSession["user"]
  }

  interface User {
    id: string          // ← AGGIUNGI QUESTA RIGA
    role: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string          // ← AGGIUNGI QUESTA RIGA
    role: string
  }
}