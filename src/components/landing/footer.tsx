import Link from "next/link";
import { Wallet } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-card">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <Wallet className="h-4 w-4 text-primary-foreground" />
            </div>
            <span className="font-semibold">KYN App</span>
          </div>

          <nav className="flex flex-wrap justify-center gap-6 text-sm">
            <Link
              href="/pricing"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Preços
            </Link>
            <Link
              href="/termos"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Termos de Uso
            </Link>
            <Link
              href="/privacidade"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacidade
            </Link>
          </nav>

          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KYN App
          </p>
        </div>
      </div>
    </footer>
  );
}
