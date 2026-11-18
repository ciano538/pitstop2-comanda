'use client';

import React, { useState } from 'react';
import {
  Play,
  Square,
  QrCode,
  Printer,
  Download,
  Database,
  Clock,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import type { BridgeHeartbeat, ShiftState } from '../shared/types';
import type { StaffRoute } from './StaffShell';

interface ShiftViewProps {
  shift: ShiftState;
  bridge: BridgeHeartbeat;
  pendingJobsCount: number;
  storageMode: 'upstash' | 'memory' | 'upstash-readonly-fallback';
  storageWarning?: string;
  showZipExport?: boolean;
  onRefresh: () => Promise<void>;
  onNavigate: (path: StaffRoute) => void;
}

export function ShiftView({
  shift,
  bridge,
  pendingJobsCount,
  storageMode,
  storageWarning,
  showZipExport = true,
  onRefresh,
  onNavigate,
}: ShiftViewProps) {
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const toggleShift = async (action: 'open' | 'close') => {
    if (busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch('/api/shift', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setNotice({ type: 'err', msg: data.error || 'Errore aggiornamento turno.' });
        return;
      }
      setNotice({
        type: 'ok',
        msg: action === 'open' ? 'Turno aperto! I tavoli e i QR sono ora attivi.' : 'Turno chiuso e tavoli azzerati.',
      });
      await onRefresh();
    } catch {
      setNotice({ type: 'err', msg: 'Errore di rete durante aggiornamento turno.' });
    } finally {
      setBusy(false);
    }
  };

  const fmtTime = (ts: number | null) =>
    ts
      ? new Date(ts).toLocaleString('it-IT', {
          day: '2-digit',
          month: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        })
      : 'Mai';

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E4E2DC] pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight">
            GESTIONE TURNO &amp; BRIDGE
          </h1>
          <p className="text-sm text-[#64625B] mt-0.5">
            Apri il turno 10 minuti prima del servizio. Chiusura automatica di sicurezza dopo 14 ore.
          </p>
        </div>

        <button
          type="button"
          onClick={() => onNavigate('/turno/qr')}
          className="min-h-[44px] px-4 py-2 rounded-xl bg-[#141413] hover:bg-black text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
        >
          <QrCode className="w-4 h-4" />
          Stampa QR Tavoli (2 per riga)
        </button>
      </div>

      {notice && (
        <div
          role="status"
          className={`rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2 border ${
            notice.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          {notice.type === 'ok' ? (
            <CheckCircle2 className="w-4 h-4 shrink-0" />
          ) : (
            <AlertTriangle className="w-4 h-4 shrink-0" />
          )}
          <span>{notice.msg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shift Card */}
        <section className="bg-white border border-[#E4E2DC] rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Clock className="w-5 h-5 text-[#D9231F]" />
              <h2 className="font-[var(--font-display)] text-2xl font-bold">STATO TURNO</h2>
            </div>
            <span
              className={`text-sm font-bold ${
                shift.isOpen ? 'text-emerald-700' : 'text-red-700'
              }`}
            >
              {shift.isOpen ? 'APERTO' : 'CHIUSO'}
            </span>
          </div>

          <div className="bg-[#F7F6F3] border border-[#E4E2DC] rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64625B]">Apertura</span>
              <span className="font-mono tabular-nums">{fmtTime(shift.openedAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64625B]">Auto-chiusura (14h)</span>
              <span className="font-mono tabular-nums">{fmtTime(shift.autoClosesAt)}</span>
            </div>
            <div className="flex justify-between gap-2">
              <span className="text-[#64625B]">Archivio condiviso</span>
              <span className="font-medium flex items-center gap-1.5 text-right">
                <Database className="w-3.5 h-3.5 text-[#64625B] shrink-0" />
                {storageMode === 'upstash'
                  ? 'Upstash Redis (REST)'
                  : storageMode === 'upstash-readonly-fallback'
                    ? 'Memoria locale (Upstash Read-Only)'
                    : 'Memoria locale (Dev)'}
              </span>
            </div>
          </div>

          {storageWarning && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2 leading-relaxed">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-700" />
              <span>{storageWarning}</span>
            </div>
          )}

          {!shift.isOpen ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => toggleShift('open')}
              className="w-full h-13 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              Apri Turno di Servizio
            </button>
          ) : (
            <button
              type="button"
              disabled={busy}
              onClick={() => toggleShift('close')}
              className="w-full h-13 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              <Square className="w-4 h-4" />
              Chiudi Turno e Azzera Tavoli
            </button>
          )}
        </section>

        {/* Bridge Printer Telemetry */}
        <section className="bg-white border border-[#E4E2DC] rounded-2xl p-5 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Printer className="w-5 h-5 text-[#141413]" />
              <h2 className="font-[var(--font-display)] text-2xl font-bold">BRIDGE STAMPANTE</h2>
            </div>
            <div className="flex items-center gap-2 text-xs font-bold">
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  bridge.status === 'online'
                    ? 'bg-emerald-600'
                    : bridge.status === 'warning'
                      ? 'bg-amber-500'
                      : 'bg-red-600'
                }`}
              />
              <span>
                {bridge.status === 'online'
                  ? 'ONLINE'
                  : bridge.status === 'warning'
                    ? 'SEGNALE DEBOLE'
                    : 'OFFLINE'}
              </span>
            </div>
          </div>

          <div className="bg-[#F7F6F3] border border-[#E4E2DC] rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-[#64625B]">Ultimo contatto</span>
              <span className="font-mono tabular-nums">{fmtTime(bridge.lastSeenAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64625B]">Ultima stampa confermata</span>
              <span className="font-mono tabular-nums">{fmtTime(bridge.lastAckAt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64625B]">Stampante / Modalità</span>
              <span className="font-mono">
                {bridge.printerHost || 'Non configurata'} {bridge.mode ? `(${bridge.mode.toUpperCase()})` : ''}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64625B]">Lavori in coda</span>
              <span className="font-mono font-bold tabular-nums">{pendingJobsCount}</span>
            </div>
          </div>

          {bridge.lastError && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>Ultimo errore stampante: {bridge.lastError}</span>
            </div>
          )}

          <div className="text-xs text-[#64625B] leading-relaxed">
            Avvia <code className="font-mono text-[#141413]">bridge/start-windows.bat</code> o{' '}
            <code className="font-mono text-[#141413]">bridge/start-mac.command</code> sul PC della pizzeria con{' '}
            <code className="font-mono text-[#141413]">config.env</code> compilato.
          </div>
        </section>
      </div>

      {/* GitHub / Vercel Export ZIP Section */}
      {showZipExport && (
        <section className="bg-white border border-[#E4E2DC] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="font-[var(--font-display)] text-2xl font-bold">
              PACCHETTO GITHUB &amp; VERCEL (NEXT.JS 14)
            </h2>
            <p className="text-sm text-[#64625B] mt-1">
              Scarica l’archivio <code className="font-mono text-[#141413]">.zip</code> completo pronto per GitHub e Vercel (<code className="font-mono text-[#141413]">comande.pitstop2.it</code>), inclusivo di App Router, Bridge Epson TM, script Windows/Mac, <code className="font-mono text-[#141413]">.env.example</code> e <code className="font-mono text-[#141413]">README.md</code> in italiano.
            </p>
          </div>

          <a
            href="/api/download-zip"
            download="pitstop2-comande-nextjs14.zip"
            className="min-h-[48px] px-5 py-3 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] text-white font-semibold text-sm flex items-center justify-center gap-2 whitespace-nowrap shrink-0"
          >
            <Download className="w-4 h-4" />
            Scarica ZIP GitHub / Vercel
          </a>
        </section>
      )}
    </div>
  );
}
