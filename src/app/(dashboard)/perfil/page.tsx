"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  LogOut,
  Moon,
  Camera,
  MessageCircle,
  CreditCard,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
}

const settingsItems = [
  {
    icon: MessageCircle,
    label: "WhatsApp",
    description: "Lançar transações por mensagem",
    href: "/configuracoes/whatsapp",
  },
  {
    icon: CreditCard,
    label: "Assinatura",
    description: "Gerenciar seu plano",
    href: "/configuracoes/assinatura",
  },
];

export default function PerfilPage() {
  const router = useRouter();
  const supabase = createClient();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [darkMode, setDarkMode] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name")
          .eq("id", user.id)
          .single();

        setProfile({
          id: user.id,
          full_name: profileData?.full_name || null,
          email: user.email || null,
        });
      }
      setIsLoading(false);
    };

    fetchProfile();

    // Check for dark mode
    const isDark = document.documentElement.classList.contains("dark");
    setDarkMode(isDark);
  }, [supabase]);

  const handleDarkModeToggle = (enabled: boolean) => {
    setDarkMode(enabled);
    if (enabled) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  const initials = profile?.full_name
    ? profile.full_name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "U";

  if (isLoading) {
    return (
      <div className="px-4 py-6 space-y-6 animate-pulse md:max-w-2xl md:mx-auto">
        <div className="flex flex-col items-center gap-4">
          <div className="h-24 w-24 rounded-full bg-muted" />
          <div className="h-6 w-32 bg-muted rounded" />
          <div className="h-4 w-48 bg-muted rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 space-y-6 md:max-w-2xl md:mx-auto lg:max-w-4xl">
      {/* Profile Header */}
      <div className="flex flex-col items-center gap-3 pt-4 md:flex-row md:gap-6 md:pt-0">
        <div className="relative">
          <Avatar className="h-24 w-24 border-4 border-background shadow-lg md:h-28 md:w-28">
            <AvatarFallback className="bg-primary text-primary-foreground text-2xl font-bold md:text-3xl">
              {initials}
            </AvatarFallback>
          </Avatar>
          <button className="absolute bottom-0 right-0 p-2 rounded-full bg-primary text-primary-foreground shadow-md hover:bg-primary-light transition-colors">
            <Camera className="h-4 w-4" />
          </button>
        </div>
        <div className="text-center md:text-left">
          <h1 className="text-xl font-bold md:text-2xl">{profile?.full_name || "Usuário"}</h1>
          <p className="text-sm text-muted-foreground md:text-base">{profile?.email}</p>
        </div>
      </div>

      {/* Desktop: Two Column Layout */}
      <div className="md:grid md:grid-cols-2 md:gap-6">
        {/* Settings Card */}
        <Card className="md:col-span-1">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Configurações
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {settingsItems.map((item) => (
                <button
                  key={item.label}
                  onClick={() => router.push(item.href)}
                  className="w-full flex items-center gap-4 px-4 py-3.5 hover:bg-accent/50 transition-colors"
                >
                  <div className="p-2 rounded-xl bg-primary/10">
                    <item.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="font-medium">{item.label}</p>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Preferences + Actions */}
        <div className="space-y-6 mt-6 md:mt-0">
          {/* Preferences Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Preferências
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="flex items-center gap-4 px-4 py-3.5">
                <div className="p-2 rounded-xl bg-primary/10">
                  <Moon className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Modo Escuro</p>
                  <p className="text-sm text-muted-foreground">Tema da interface</p>
                </div>
                <Switch
                  checked={darkMode}
                  onCheckedChange={handleDarkModeToggle}
                />
              </div>
            </CardContent>
          </Card>

          {/* Sign Out Button */}
          <Button
            variant="outline"
            className="w-full h-12 text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/30"
            onClick={handleSignOut}
          >
            <LogOut className="h-5 w-5 mr-2" />
            Sair da Conta
          </Button>

          {/* App Version */}
          <p className="text-center text-xs text-muted-foreground">
            KYN App v1.0.0
          </p>
        </div>
      </div>
    </div>
  );
}
