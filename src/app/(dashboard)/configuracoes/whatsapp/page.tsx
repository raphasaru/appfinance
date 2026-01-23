"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  useWhatsAppLink,
  useLinkWhatsApp,
  useUnlinkWhatsApp,
  useRegenerateVerificationCode,
} from "@/lib/hooks/use-whatsapp";
import {
  MessageCircle,
  Link2,
  Unlink,
  Loader2,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Copy,
  Clock,
} from "lucide-react";
import { toast } from "sonner";

export default function WhatsAppConfigPage() {
  const [phoneInput, setPhoneInput] = useState("");
  const { data: whatsappLink, isLoading } = useWhatsAppLink();
  const linkMutation = useLinkWhatsApp();
  const unlinkMutation = useUnlinkWhatsApp();
  const regenerateMutation = useRegenerateVerificationCode();

  const handleLink = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!phoneInput.trim()) {
      toast.error("Digite seu número de WhatsApp");
      return;
    }

    // Basic validation for Brazilian phone number
    const digits = phoneInput.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 13) {
      toast.error("Número inválido. Use o formato: (11) 99999-9999");
      return;
    }

    try {
      await linkMutation.mutateAsync(phoneInput);
      toast.success("Número cadastrado! Agora envie o código pelo WhatsApp.");
      setPhoneInput("");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao vincular WhatsApp");
      }
    }
  };

  const handleUnlink = async () => {
    if (!confirm("Deseja desvincular seu WhatsApp? Você não poderá mais lançar transações por mensagem.")) {
      return;
    }

    try {
      await unlinkMutation.mutateAsync();
      toast.success("WhatsApp desvinculado");
    } catch {
      toast.error("Erro ao desvincular");
    }
  };

  const handleRegenerate = async () => {
    try {
      await regenerateMutation.mutateAsync();
      toast.success("Novo código gerado!");
    } catch {
      toast.error("Erro ao gerar novo código");
    }
  };

  const handleCopyCode = () => {
    if (whatsappLink?.verification_code) {
      navigator.clipboard.writeText(whatsappLink.verification_code);
      toast.success("Código copiado!");
    }
  };

  const formatPhoneDisplay = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    if (digits.startsWith("55") && digits.length >= 12) {
      const ddd = digits.slice(2, 4);
      const part1 = digits.slice(4, 9);
      const part2 = digits.slice(9);
      return `+55 (${ddd}) ${part1}-${part2}`;
    }
    return phone;
  };

  const formatPhoneInput = (value: string) => {
    const digits = value.replace(/\D/g, "");

    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 11) return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7, 11)}`;
  };

  const isCodeExpired = whatsappLink?.verification_expires_at
    ? new Date(whatsappLink.verification_expires_at) < new Date()
    : false;

  const isVerified = !!whatsappLink?.verified_at && !!whatsappLink?.whatsapp_lid;
  const needsVerification = whatsappLink && !isVerified;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-4">
      <div className="flex items-center gap-2">
        <MessageCircle className="h-6 w-6 text-green-500" />
        <h1 className="text-xl font-semibold">WhatsApp</h1>
      </div>

      <p className="text-sm text-muted-foreground">
        Vincule seu WhatsApp para lançar transações por mensagem de texto, áudio ou foto de comprovante.
      </p>

      {isVerified && whatsappLink ? (
        // Verified state - WhatsApp fully connected
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-500" />
              <CardTitle className="text-base">WhatsApp vinculado</CardTitle>
            </div>
            <CardDescription>
              Seu número está conectado e pronto para receber transações
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="font-medium">
                {formatPhoneDisplay(whatsappLink.phone_number)}
              </span>
              <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
                Verificado
              </span>
            </div>

            <Button
              variant="outline"
              className="w-full text-destructive hover:text-destructive"
              onClick={handleUnlink}
              disabled={unlinkMutation.isPending}
            >
              {unlinkMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Unlink className="h-4 w-4 mr-2" />
              )}
              Desvincular WhatsApp
            </Button>
          </CardContent>
        </Card>
      ) : needsVerification && whatsappLink ? (
        // Needs verification - show code
        <Card className="border-amber-200">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">Aguardando verificação</CardTitle>
            </div>
            <CardDescription>
              Envie o código abaixo via WhatsApp para o número +55 11 5198-8345
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-1">Seu número:</p>
              <span className="font-medium">
                {formatPhoneDisplay(whatsappLink.phone_number)}
              </span>
            </div>

            {whatsappLink.verification_code && !isCodeExpired ? (
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Código de verificação:</p>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-4 bg-primary/5 border-2 border-dashed border-primary/20 rounded-lg text-center">
                    <span className="text-2xl font-mono font-bold tracking-widest text-primary">
                      {whatsappLink.verification_code}
                    </span>
                  </div>
                  <Button variant="outline" size="icon" onClick={handleCopyCode}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  Código válido por 1 hora
                </p>
              </div>
            ) : (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg text-center">
                <p className="text-sm text-amber-800">
                  {isCodeExpired ? "Código expirado." : "Gere um código de verificação."}
                </p>
              </div>
            )}

            <div className="flex gap-2">
              <Button
                variant="outline"
                className="flex-1"
                onClick={handleRegenerate}
                disabled={regenerateMutation.isPending}
              >
                {regenerateMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                {isCodeExpired ? "Gerar código" : "Novo código"}
              </Button>
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive"
                onClick={handleUnlink}
                disabled={unlinkMutation.isPending}
              >
                {unlinkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Unlink className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        // No link - show form to register
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Vincular WhatsApp</CardTitle>
            <CardDescription>
              Digite seu número de celular com DDD
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLink} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Número do WhatsApp</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="(11) 99999-9999"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(formatPhoneInput(e.target.value))}
                  className="h-12"
                  inputMode="tel"
                  maxLength={16}
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12"
                disabled={linkMutation.isPending}
              >
                {linkMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Link2 className="h-4 w-4 mr-2" />
                )}
                Vincular número
              </Button>
            </form>
          </CardContent>
        </Card>
      )}

      {needsVerification && (
        <Card className="bg-blue-50/50 border-blue-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Como verificar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="text-sm text-blue-900">
                  Abra o WhatsApp e envie uma mensagem para <strong>+55 11 5198-8345</strong>
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="text-sm text-blue-900">
                  Envie apenas o código de 6 caracteres mostrado acima
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="text-sm text-blue-900">
                  Você receberá uma confirmação quando estiver vinculado
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {isVerified && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Como usar</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <p className="font-medium text-sm">Texto</p>
                <p className="text-sm text-muted-foreground">
                  Envie "gastei 50 no uber" ou "recebi 3000 de salário"
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <p className="font-medium text-sm">Áudio</p>
                <p className="text-sm text-muted-foreground">
                  Grave um áudio descrevendo a transação
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <p className="font-medium text-sm">Foto</p>
                <p className="text-sm text-muted-foreground">
                  Envie foto de cupom fiscal ou comprovante
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-amber-200 bg-amber-50/50">
        <CardContent className="pt-4">
          <div className="flex gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Importante</p>
              <p className="text-amber-700 mt-1">
                As transações são lançadas automaticamente com status "planejado".
                Você receberá uma confirmação após cada lançamento.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
