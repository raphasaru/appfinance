"use client";

import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Bell, Settings, Share2, LogOut, RefreshCw, CreditCard, MessageCircle } from "lucide-react";
import { PlanBadge } from "@/components/subscription/plan-badge";

interface HeaderProps {
  userName?: string | null;
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "BOM DIA";
  if (hour < 18) return "BOA TARDE";
  return "BOA NOITE";
}

export function Header({ userName }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  const firstName = userName?.split(" ")[0] || "Usuário";

  // Don't render header for profile page (avatar is in content)
  if (pathname === "/perfil") {
    return null;
  }

  // Determine header content based on route
  const getHeaderContent = () => {
    if (pathname === "/carteira") {
      return {
        title: "MINHA CARTEIRA",
        rightIcon: (
          <Link href="/perfil">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <Settings className="h-5 w-5 text-muted-foreground" />
            </Button>
          </Link>
        ),
      };
    }

    if (pathname === "/relatorios") {
      return {
        title: "RELATÓRIOS",
        rightIcon: (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Share2 className="h-5 w-5 text-muted-foreground" />
          </Button>
        ),
      };
    }

    // Default: Dashboard and other pages
    return {
      title: null,
      greeting: true,
    };
  };

  const headerContent = getHeaderContent();

  return (
    <header className="sticky top-0 z-40 bg-background safe-top">
      <div className="flex h-16 items-center justify-between px-4">
        {headerContent.greeting ? (
          // Dashboard greeting header
          <>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-muted-foreground tracking-wide">
                {getGreeting()},
              </span>
              <span className="text-lg font-bold text-foreground">
                {firstName}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <PlanBadge className="hidden xs:inline-flex" />
              <Button variant="ghost" size="icon" className="h-9 w-9 relative">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-primary" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={() => router.push("/configuracoes/assinatura")}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Assinatura
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/configuracoes/whatsapp")}>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    WhatsApp
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/perfil")}>
                    <Settings className="mr-2 h-4 w-4" />
                    Perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push("/recorrentes")}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Recorrentes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </>
        ) : (
          // Page title header
          <>
            <h1 className="text-lg font-bold tracking-wide">
              {headerContent.title}
            </h1>
            {headerContent.rightIcon}
          </>
        )}
      </div>
    </header>
  );
}
