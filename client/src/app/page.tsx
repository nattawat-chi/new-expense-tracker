import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SignedIn, SignedOut } from "@clerk/nextjs";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#f8fafc] to-[#f1f5f9] dark:from-[#18181b] dark:to-[#27272a] flex flex-col items-center">
      <header className="w-full max-w-5xl mx-auto flex justify-between items-center py-8 px-4">
        <div className="text-2xl font-bold tracking-tight text-primary">
          Binder
        </div>
        <div>
          <SignedOut>
            <Link href="/login">
              <Button>Sign in</Button>
            </Link>
          </SignedOut>
          <SignedIn>
            <Link href="/dashboard">
              <Button variant="secondary">Go to Dashboard</Button>
            </Link>
          </SignedIn>
        </div>
      </header>
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-4xl md:text-6xl font-extrabold mb-6 text-primary">
          Know where your money goes
        </h1>
        <p className="text-lg md:text-2xl text-muted-foreground mb-8 max-w-2xl">
          Spend less than you earn, achieve financial dreams, and experience a
          brighter financial future. <br />
          <span className="text-primary font-semibold">Binder</span> helps you
          track, budget, and control your expenses with ease.
        </p>
        <Link href="/login">
          <Button size="lg" className="text-lg px-8 py-6">
            Get Started
          </Button>
        </Link>
      </section>
      <section className="w-full max-w-5xl mx-auto py-12 px-4 grid md:grid-cols-3 gap-8">
        <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl mb-2">📊</div>
          <div className="font-bold mb-1">Budgeting</div>
          <div className="text-muted-foreground text-sm">
            Flexible budgeting tools, custom categories, and rollovers to stay
            on track.
          </div>
        </div>
        <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl mb-2">💡</div>
          <div className="font-bold mb-1">Spending Insights</div>
          <div className="text-muted-foreground text-sm">
            Analyze your spending data to better adjust your budget and habits.
          </div>
        </div>
        <div className="bg-card rounded-xl shadow p-6 flex flex-col items-center">
          <div className="text-3xl mb-2">🔒</div>
          <div className="font-bold mb-1">Security</div>
          <div className="text-muted-foreground text-sm">
            Your data is protected with industry-leading security and privacy
            standards.
          </div>
        </div>
      </section>
      <footer className="w-full text-center py-6 text-muted-foreground text-xs">
        © {new Date().getFullYear()} Binder. Inspired by{" "}
        <a
          href="https://pocketguard.com/"
          className="underline"
          target="_blank"
        >
          PocketGuard
        </a>
      </footer>
    </main>
  );
}
