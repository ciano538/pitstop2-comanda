'use client';

import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Printer, ArrowLeft, ExternalLink } from 'lucide-react';
import type { TableState } from '../shared/types';
import type { StaffRoute } from './StaffShell';

interface QrPrintViewProps {
  tables: TableState[];
  onNavigate: (path: StaffRoute) => void;
}

export function QrPrintView({ tables, onNavigate }: QrPrintViewProps) {
  const [baseUrl, setBaseUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') return window.location.origin;
    return 'https://comande.pitstop2.it';
  });
  const [qrImages, setQrImages] = useState<Record<number, string>>({});

  useEffect(() => {
    let active = true;
    const cleanBase = baseUrl.trim().replace(/\/$/, '');
    async function generateAll() {
      const next: Record<number, string> = {};
      for (const tbl of tables) {
        const target = `${cleanBase}/t/${tbl.tableNumber}?k=${tbl.qrToken || ''}`;
        try {
          next[tbl.tableNumber] = await QRCode.toDataURL(target, {
            width: 280,
            margin: 1,
            color: { dark: '#141413', light: '#FFFFFF' },
          });
        } catch {
          next[tbl.tableNumber] = '';
        }
      }
      if (active) setQrImages(next);
    }
    generateAll();
    return () => {
      active = false;
    };
  }, [tables, baseUrl]);

  return (
    <div className="space-y-6">
      {/* Controls hidden when printing */}
      <div className="no-print border-b border-[#E4E2DC] pb-4 flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={() => onNavigate('/turno')}
            className="text-xs font-semibold text-[#64625B] hover:text-[#141413] flex items-center gap-1 mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Torna a Turno
          </button>
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight">
            QR TAVOLI STAMPABILI (2 PER RIGA)
          </h1>
          <p className="text-sm text-[#64625B] mt-0.5">
            Ogni QR contiene la firma HMAC univoca del tavolo. Richiede comunque il codice di 4 cifre all’apertura.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <input
            type="url"
            value={baseUrl}
            onChange={(e) => setBaseUrl(e.target.value)}
            aria-label="Dominio base QR"
            className="h-11 px-3 rounded-xl bg-white border border-[#E4E2DC] text-sm font-mono w-64 focus:outline-none focus:border-[#D9231F]"
          />
          <button
            type="button"
            onClick={() => setBaseUrl('https://comande.pitstop2.it')}
            className="min-h-[44px] px-3 rounded-xl border border-[#E4E2DC] bg-white hover:bg-[#F7F6F3] text-xs font-medium cursor-pointer"
          >
            Usa comande.pitstop2.it
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="min-h-[44px] px-5 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Stampa Fogli A4
          </button>
        </div>
      </div>

      {/* Strictly 2 cards per row on desktop & print */}
      <div className="grid grid-cols-1 md:grid-cols-2 print-qr-grid gap-5">
        {tables.map((tbl) => {
          const cleanBase = baseUrl.trim().replace(/\/$/, '');
          const link = `${cleanBase}/t/${tbl.tableNumber}?k=${tbl.qrToken || ''}`;
          return (
            <article
              key={tbl.tableNumber}
              className="print-qr-card bg-white border border-[#E4E2DC] rounded-2xl p-5 flex items-center gap-5"
            >
              <div className="w-36 h-36 shrink-0 bg-white border border-[#E4E2DC] rounded-xl p-1.5 flex items-center justify-center">
                {qrImages[tbl.tableNumber] ? (
                  <img
                    src={qrImages[tbl.tableNumber]}
                    alt={`QR Tavolo ${tbl.tableNumber}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <span className="text-xs text-[#64625B]">QR...</span>
                )}
              </div>

              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-[var(--font-display)] text-xs font-bold tracking-wider uppercase text-[#D9231F]">
                    PIZZERIA PIT STOP 2.0
                  </span>
                  <a
                    href={`/t/${tbl.tableNumber}?k=${tbl.qrToken || ''}`}
                    target="_blank"
                    rel="noreferrer"
                    className="no-print text-xs text-[#64625B] hover:text-[#141413] flex items-center gap-1"
                  >
                    Apri <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="font-[var(--font-display)] text-4xl font-bold leading-none text-[#141413]">
                  TAVOLO {tbl.tableNumber}
                </div>

                <div className="text-xs text-[#141413] space-y-0.5 leading-snug">
                  <div>IT · Scansiona e ordina dal telefono</div>
                  <div>EN · Scan to order from your phone</div>
                  <div>DE · Scannen &amp; direkt bestellen</div>
                </div>

                <div className="text-[10px] font-mono text-[#64625B] truncate pt-1 border-t border-[#E4E2DC]">
                  {link}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
