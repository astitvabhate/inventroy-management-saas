import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-foreground selection:text-background">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 backdrop-blur-sm bg-background/80 border-b border-border/50">
        <nav className="flex items-center justify-between px-4 md:px-12 py-4 md:py-5">
          <Link href="/" className="text-lg font-medium tracking-tight">
            Dhuni Decor<span className="text-muted-foreground">.</span>
          </Link> 
          <div className="flex items-center gap-4 md:gap-8">
            <Link
              href="/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="text-sm px-4 md:px-5 py-2 md:py-2.5 bg-foreground text-background hover:opacity-90 transition-opacity"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col justify-center px-4 md:px-12 pt-24 md:pt-32 pb-12 md:pb-20">
        <div className="max-w-4xl mx-auto w-full">
          {/* Eyebrow */}
          <p className="text-xs md:text-sm text-muted-foreground tracking-widest uppercase mb-6 md:mb-8 animate-fade-in">
            Inventory Management
          </p>

          {/* Main headline */}
          <h1 className="text-4xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight mb-6 md:mb-8 animate-slide-up opacity-0 stagger-1">
            Track your
            <br />
            <span className="italic">decorations</span>
            <br />
            with clarity.
          </h1>

          {/* Subtext */}
          <p className="text-base md:text-xl text-muted-foreground max-w-lg mb-8 md:mb-12 animate-slide-up opacity-0 stagger-2">
            A refined system for managing inventory, tracking allocations,
            and understanding where every piece goes.
          </p>

          {/* CTA */}
          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 animate-slide-up opacity-0 stagger-3">
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-3 bg-foreground text-background px-6 md:px-8 py-3 md:py-4 text-sm font-medium hover:opacity-90 transition-all"
            >
              Enter Dashboard
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-3 border border-border px-6 md:px-8 py-3 md:py-4 text-sm font-medium hover:bg-accent transition-colors"
            >
              Create Account
            </Link>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-4xl mx-auto w-full mt-16 md:mt-24 pt-8 md:pt-12 border-t border-border animate-fade-in opacity-0 stagger-4">
          <div className="grid grid-cols-3 gap-4 md:gap-8">
            <div>
              <p className="text-2xl md:text-4xl font-light mb-1 md:mb-2">—</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Items</p>
            </div>
            <div>
              <p className="text-2xl md:text-4xl font-light mb-1 md:mb-2">—</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Rentals</p>
            </div>
            <div>
              <p className="text-2xl md:text-4xl font-light mb-1 md:mb-2">—</p>
              <p className="text-[10px] md:text-xs text-muted-foreground uppercase tracking-wider">Customers</p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 md:px-12 py-6 md:py-8 border-t border-border">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-muted-foreground">
          <p>© 2026 Dhuni Decor. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-foreground cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-foreground cursor-pointer transition-colors">Terms</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
