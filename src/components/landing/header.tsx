import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Wallet } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <Wallet className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-lg">KYN App</span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/pricing"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Preços
          </Link>
        </nav>

        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Entrar</Link>
          </Button>
          <Button asChild size="sm">
            <Link href="/cadastro">Começar grátis</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
