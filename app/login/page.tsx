import Link from "next/link";
import { Button } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="min-h-dvh app-background flex items-center justify-center p-6">
      <form className="glass rounded-xl p-6 w-full max-w-md">
        <h1 className="text-xl font-semibold mb-4">Sign in</h1>
        <label className="block text-sm mb-1">Email</label>
        <input
          required
          type="email"
          className="w-full glass px-3 py-2 rounded-md mb-3"
          placeholder="you@example.com"
        />
        <label className="block text-sm mb-1">Password</label>
        <input
          required
          type="password"
          className="w-full glass px-3 py-2 rounded-md mb-4"
          placeholder="••••••••"
        />
        <Button variant="primary" type="submit">
          {" "}
          Sign In
        </Button>
        <Link href="/dashboard" className="ml-3 text-sm underline">
          Skip to dashboard
        </Link>
      </form>
    </main>
  );
}
