"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import {
  importKey,
  encryptRow as _encryptRow,
  decryptRow as _decryptRow,
  decryptRows as _decryptRows,
} from "@/lib/crypto";

/* eslint-disable @typescript-eslint/no-explicit-any */

interface CryptoContextValue {
  key: CryptoKey | null;
  isReady: boolean;
  encryptRow: (table: string, row: any) => Promise<any>;
  decryptRow: (table: string, row: any) => Promise<any>;
  decryptRows: (table: string, rows: any[]) => Promise<any[]>;
}

const CryptoContext = createContext<CryptoContextValue>({
  key: null,
  isReady: false,
  encryptRow: async (_, row) => row,
  decryptRow: async (_, row) => row,
  decryptRows: async (_, rows) => rows,
});

export function useCrypto() {
  return useContext(CryptoContext);
}

export function CryptoProvider({ children }: { children: ReactNode }) {
  const [cryptoKey, setCryptoKey] = useState<CryptoKey | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchKey() {
      try {
        const res = await fetch("/api/encryption-key");
        if (!res.ok) throw new Error("Failed to fetch encryption key");
        const { key: base64Key } = await res.json();
        const ck = await importKey(base64Key);
        if (!cancelled) {
          setCryptoKey(ck);
          setIsReady(true);
        }
      } catch (err) {
        console.error("CryptoProvider: failed to load key", err);
        // Allow app to render even without encryption (graceful degradation)
        if (!cancelled) setIsReady(true);
      }
    }

    fetchKey();
    return () => {
      cancelled = true;
    };
  }, []);

  const encryptRow = useCallback(
    async (table: string, row: any) => {
      if (!cryptoKey) return row;
      return _encryptRow(table, row, cryptoKey);
    },
    [cryptoKey]
  );

  const decryptRow = useCallback(
    async (table: string, row: any) => {
      if (!cryptoKey) return row;
      return _decryptRow(table, row, cryptoKey);
    },
    [cryptoKey]
  );

  const decryptRows = useCallback(
    async (table: string, rows: any[]) => {
      if (!cryptoKey) return rows;
      return _decryptRows(table, rows, cryptoKey);
    },
    [cryptoKey]
  );

  if (!isReady) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <CryptoContext.Provider
      value={{ key: cryptoKey, isReady, encryptRow, decryptRow, decryptRows }}
    >
      {children}
    </CryptoContext.Provider>
  );
}
