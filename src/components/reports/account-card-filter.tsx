"use client";

import { useBankAccounts } from "@/lib/hooks/use-bank-accounts";
import { useCreditCards } from "@/lib/hooks/use-credit-cards";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Filter, ChevronDown, X, Building2, CreditCard } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface AccountCardFilterProps {
  selectedAccounts: string[];
  selectedCards: string[];
  onAccountsChange: (ids: string[]) => void;
  onCardsChange: (ids: string[]) => void;
}

export function AccountCardFilter({
  selectedAccounts,
  selectedCards,
  onAccountsChange,
  onCardsChange,
}: AccountCardFilterProps) {
  const [open, setOpen] = useState(false);
  const [accountsOpen, setAccountsOpen] = useState(true);
  const [cardsOpen, setCardsOpen] = useState(true);

  const { data: accounts } = useBankAccounts();
  const { data: cards } = useCreditCards();

  const totalFilters = selectedAccounts.length + selectedCards.length;

  const toggleAccount = (id: string) => {
    if (selectedAccounts.includes(id)) {
      onAccountsChange(selectedAccounts.filter((a) => a !== id));
    } else {
      onAccountsChange([...selectedAccounts, id]);
    }
  };

  const toggleCard = (id: string) => {
    if (selectedCards.includes(id)) {
      onCardsChange(selectedCards.filter((c) => c !== id));
    } else {
      onCardsChange([...selectedCards, id]);
    }
  };

  const clearAll = () => {
    onAccountsChange([]);
    onCardsChange([]);
  };

  const hasAccounts = accounts && accounts.length > 0;
  const hasCards = cards && cards.length > 0;

  if (!hasAccounts && !hasCards) {
    return null;
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
          {totalFilters > 0 && (
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {totalFilters}
            </Badge>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[320px] sm:w-[400px]">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filtrar por Conta/Cartão</SheetTitle>
            {totalFilters > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="text-muted-foreground hover:text-foreground"
              >
                Limpar tudo
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-4">
          {hasAccounts && (
            <Collapsible open={accountsOpen} onOpenChange={setAccountsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Contas Bancárias</span>
                  {selectedAccounts.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedAccounts.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    accountsOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {accounts?.map((account) => (
                  <label
                    key={account.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedAccounts.includes(account.id)}
                      onCheckedChange={() => toggleAccount(account.id)}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: account.color || "#6366F1" }}
                    />
                    <span className="text-sm">{account.name}</span>
                  </label>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {hasCards && (
            <Collapsible open={cardsOpen} onOpenChange={setCardsOpen}>
              <CollapsibleTrigger className="flex w-full items-center justify-between py-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cartões de Crédito</span>
                  {selectedCards.length > 0 && (
                    <Badge variant="secondary" className="text-xs">
                      {selectedCards.length}
                    </Badge>
                  )}
                </div>
                <ChevronDown
                  className={cn(
                    "h-4 w-4 transition-transform",
                    cardsOpen && "rotate-180"
                  )}
                />
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {cards?.map((card) => (
                  <label
                    key={card.id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted cursor-pointer"
                  >
                    <Checkbox
                      checked={selectedCards.includes(card.id)}
                      onCheckedChange={() => toggleCard(card.id)}
                    />
                    <div
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: card.color || "#EF4444" }}
                    />
                    <span className="text-sm">{card.name}</span>
                  </label>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </div>

        <div className="mt-6 pt-4 border-t">
          <Button className="w-full" onClick={() => setOpen(false)}>
            Aplicar Filtros
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

interface ActiveFiltersProps {
  selectedAccounts: string[];
  selectedCards: string[];
  onRemoveAccount: (id: string) => void;
  onRemoveCard: (id: string) => void;
  onClearAll: () => void;
}

export function ActiveFilters({
  selectedAccounts,
  selectedCards,
  onRemoveAccount,
  onRemoveCard,
  onClearAll,
}: ActiveFiltersProps) {
  const { data: accounts } = useBankAccounts();
  const { data: cards } = useCreditCards();

  const hasFilters = selectedAccounts.length > 0 || selectedCards.length > 0;

  if (!hasFilters) return null;

  return (
    <div className="flex flex-wrap gap-2 items-center">
      <span className="text-xs text-muted-foreground">Filtros:</span>

      {selectedAccounts.map((id) => {
        const account = accounts?.find((a) => a.id === id);
        if (!account) return null;
        return (
          <Badge
            key={id}
            variant="secondary"
            className="gap-1 pr-1"
          >
            <Building2 className="h-3 w-3" />
            {account.name}
            <button
              onClick={() => onRemoveAccount(id)}
              className="ml-1 hover:bg-muted rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      {selectedCards.map((id) => {
        const card = cards?.find((c) => c.id === id);
        if (!card) return null;
        return (
          <Badge
            key={id}
            variant="secondary"
            className="gap-1 pr-1"
          >
            <CreditCard className="h-3 w-3" />
            {card.name}
            <button
              onClick={() => onRemoveCard(id)}
              className="ml-1 hover:bg-muted rounded p-0.5"
            >
              <X className="h-3 w-3" />
            </button>
          </Badge>
        );
      })}

      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="h-6 px-2 text-xs"
      >
        Limpar
      </Button>
    </div>
  );
}
