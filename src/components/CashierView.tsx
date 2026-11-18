'use client';

import React, { useState, useMemo } from 'react';
import {
  DoorOpen,
  Receipt,
  CheckCircle2,
  XCircle,
  Users,
  ExternalLink,
  Printer,
  Minus,
  Plus,
} from 'lucide-react';
import type { PrintJob, ShiftState, TableState } from '../shared/types';

interface CashierViewProps {
  shift: ShiftState;
  tables: TableState[];
  onRefresh: () => Promise<void>;
}

export function CashierView({ shift, tables, onRefresh }: CashierViewProps) {
  const [selectedNum, setSelectedNum] = useState<number>(1);
  const [openCovers, setOpenCovers] = useState<number>(2);
  const [busy, setBusy] = useState(false);
  const [previewJob, setPreviewJob] = useState<PrintJob | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const selectedTable = useMemo(
    () => tables.find((t) => t.tableNumber === selectedNum) || tables[0],
    [tables, selectedNum]
  );

  const openTables = tables.filter((t) => t.status === 'open');
  const totalRevenueOpen = openTables.reduce((sum, t) => sum + t.total, 0);

  const handleOpenTable = async () => {
    if (!selectedTable || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/tables/${selectedTable.tableNumber}/open`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ covers: openCovers }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || 'Errore apertura tavolo');
        return;
      }
      setNotice(`Tavolo ${selectedTable.tableNumber} aperto. Codice di sessione: ${data.table.sessionCode}`);
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const handlePrintBill = async () => {
    if (!selectedTable || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/tables/${selectedTable.tableNumber}/bill`, {
        method: 'POST',
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || 'Errore stampa conto');
        return;
      }
      setPreviewJob(data.printJob);
      setNotice(`Conto Tavolo ${selectedTable.tableNumber} accodato per la stampa (Documento non fiscale).`);
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const handleCloseTable = async (printBill: boolean) => {
    if (!selectedTable || busy) return;
    setBusy(true);
    setNotice(null);
    try {
      const res = await fetch(`/api/tables/${selectedTable.tableNumber}/close`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ printBill }),
      });
      const data = await res.json();
      if (!res.ok) {
        setNotice(data.error || 'Errore chiusura tavolo');
        return;
      }
      if (data.printJob) setPreviewJob(data.printJob);
      setNotice(`Tavolo ${selectedTable.tableNumber} chiuso e azzerato.`);
      await onRefresh();
    } finally {
      setBusy(false);
    }
  };

  const qrUrl = selectedTable
    ? `${window.location.origin}/t/${selectedTable.tableNumber}?k=${selectedTable.qrToken || ''}`
    : '';

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#E4E2DC] pb-4">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight">
            CASSA &amp; CHIUSURA TAVOLI
          </h1>
          <p className="text-sm text-[#64625B] mt-0.5">
            Apri i tavoli per generare il codice di 4 cifre, stampa i conti non fiscali e azzera a fine pasto.
          </p>
        </div>
        <div className="text-right">
          <div className="text-xs text-[#64625B]">Totale tavoli aperti</div>
          <div className="font-mono text-2xl font-bold tabular-nums text-[#141413]">
            € {totalRevenueOpen.toFixed(2).replace('.', ',')}
          </div>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Table Selector */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-2.5">
          {tables.map((tbl) => {
            const active = selectedTable?.tableNumber === tbl.tableNumber;
            const isOpen = tbl.status === 'open';
            return (
              <button
                key={tbl.tableNumber}
                type="button"
                onClick={() => {
                  setSelectedNum(tbl.tableNumber);
                  setOpenCovers(tbl.status === 'open' ? tbl.covers : 2);
                }}
                className={`min-h-[86px] p-3 rounded-2xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                  active
                    ? 'bg-[#141413] text-white border-[#141413]'
                    : isOpen
                      ? 'bg-white border-[#D9231F]/40 hover:border-[#D9231F]'
                      : 'bg-white border-[#E4E2DC] hover:border-[#141413]/40'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="font-[var(--font-display)] text-2xl font-bold tabular-nums">
                    T{tbl.tableNumber}
                  </span>
                  <span className={`text-[11px] font-semibold ${active ? 'text-zinc-300' : isOpen ? 'text-emerald-700' : 'text-[#64625B]'}`}>
                    {isOpen ? 'Aperto' : 'Chiuso'}
                  </span>
                </div>
                <div className="font-mono text-sm font-bold tabular-nums">
                  {isOpen ? `€ ${tbl.total.toFixed(2).replace('.', ',')}` : '—'}
                </div>
              </button>
            );
          })}
        </div>

        {/* Table Control Detail */}
        {selectedTable && (
          <div className="lg:col-span-7 bg-white border border-[#E4E2DC] rounded-2xl overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-[var(--font-display)] text-3xl font-bold">
                  TAVOLO {selectedTable.tableNumber}
                </h2>
                <div className="text-xs text-[#64625B] mt-0.5">
                  {selectedTable.status === 'open'
                    ? `Aperto · ${selectedTable.covers} coperti · ${selectedTable.orders.length} comande`
                    : 'Tavolo attualmente libero'}
                </div>
              </div>

              {selectedTable.status === 'open' && (
                <div className="bg-[#F7F6F3] border border-[#E4E2DC] rounded-xl px-4 py-2 text-center">
                  <div className="text-[11px] font-medium text-[#64625B]">Codice Cliente (4 cifre)</div>
                  <div className="font-mono text-2xl font-bold tracking-widest text-[#D9231F] tabular-nums">
                    {selectedTable.sessionCode}
                  </div>
                </div>
              )}
            </div>

            {selectedTable.status === 'closed' ? (
              <div className="p-6 space-y-5">
                <div className="flex items-center justify-between bg-[#F7F6F3] border border-[#E4E2DC] rounded-xl p-4">
                  <div className="flex items-center gap-2.5">
                    <Users className="w-5 h-5 text-[#64625B]" />
                    <span className="font-medium text-sm">Numero di coperti</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setOpenCovers((c) => Math.max(1, c - 1))}
                      className="w-11 h-11 rounded-xl bg-white border border-[#E4E2DC] flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-8 text-center font-mono text-lg font-bold tabular-nums">
                      {openCovers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setOpenCovers((c) => Math.min(30, c + 1))}
                      className="w-11 h-11 rounded-xl bg-white border border-[#E4E2DC] flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  disabled={!shift.isOpen || busy}
                  onClick={handleOpenTable}
                  className="w-full h-13 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] disabled:opacity-40 text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <DoorOpen className="w-5 h-5" />
                  {shift.isOpen
                    ? `Apri Tavolo ${selectedTable.tableNumber} e Genera Codice`
                    : 'Apri prima il Turno da /turno'}
                </button>
              </div>
            ) : (
              <div className="p-5 space-y-5">
                {/* QR test link for staff verification */}
                <div className="flex flex-wrap items-center justify-between gap-2 bg-[#F7F6F3] border border-[#E4E2DC] rounded-xl px-3.5 py-2.5 text-xs">
                  <span className="text-[#64625B] truncate">
                    Link QR Cliente: <span className="font-mono text-[#141413]">/t/{selectedTable.tableNumber}?k={selectedTable.qrToken}</span>
                  </span>
                  <a
                    href={qrUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="font-semibold text-[#D9231F] hover:underline flex items-center gap-1 shrink-0"
                  >
                    Apri Menu Cliente <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>

                {/* Orders breakdown */}
                <div className="space-y-3 max-h-72 overflow-y-auto">
                  {selectedTable.orders.length === 0 ? (
                    <div className="text-sm text-[#64625B] text-center py-6 border border-dashed border-[#E4E2DC] rounded-xl">
                      Tavolo aperto. Nessuna comanda inviata finora.
                    </div>
                  ) : (
                    selectedTable.orders.map((ord) => (
                      <div key={ord.id} className="border border-[#E4E2DC] rounded-xl p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs text-[#64625B]">
                          <span className="font-semibold text-[#141413]">
                            {ord.source === 'customer' ? 'COMANDA DA CLIENTE' : 'COMANDA CAMERIERE'}
                          </span>
                          <span className="font-mono tabular-nums">
                            {new Date(ord.createdAt).toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })}
                            {' · '}€ {ord.total.toFixed(2).replace('.', ',')}
                          </span>
                        </div>
                        <ul className="space-y-1 text-sm">
                          {ord.items.map((item) => (
                            <li key={item.lineId} className="flex justify-between gap-2">
                              <span className="text-[#141413]">
                                <span className="font-mono font-semibold">{item.qty}x</span> {item.name}
                                {item.selectedOptions.length > 0 && (
                                  <span className="text-xs text-[#64625B]"> ({item.selectedOptions.join(', ')})</span>
                                )}
                              </span>
                              <span className="font-mono tabular-nums text-[#64625B] shrink-0">
                                € {(item.qty * item.unitPrice).toFixed(2).replace('.', ',')}
                              </span>
                            </li>
                          ))}
                        </ul>
                        {ord.generalNote && (
                          <div className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-lg">
                            Nota: {ord.generalNote}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>

                {/* Total & Actions */}
                <div className="border-t border-[#E4E2DC] pt-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-medium text-[#64625B]">Totale attuale tavolo</span>
                    <span className="font-mono text-3xl font-bold tabular-nums text-[#141413]">
                      € {selectedTable.total.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      disabled={busy || selectedTable.orders.length === 0}
                      onClick={handlePrintBill}
                      className="min-h-[48px] px-4 rounded-xl border border-[#141413] bg-white hover:bg-[#F7F6F3] disabled:opacity-40 text-[#141413] font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Printer className="w-4 h-4" />
                      Stampa Conto (Non fiscale)
                    </button>

                    <button
                      type="button"
                      disabled={busy}
                      onClick={() => handleCloseTable(true)}
                      className="min-h-[48px] px-4 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] disabled:opacity-40 text-white font-semibold text-sm flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Receipt className="w-4 h-4" />
                      Stampa Conto e Chiudi Tavolo
                    </button>
                  </div>

                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleCloseTable(false)}
                    className="w-full min-h-[44px] rounded-xl border border-[#E4E2DC] hover:bg-[#F7F6F3] text-xs font-medium text-[#64625B] flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <XCircle className="w-4 h-4" />
                    Chiudi tavolo senza ristampare conto
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Thermal Receipt Preview Modal */}
      {previewJob && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setPreviewJob(null)}
        >
          <div
            className="bg-white border border-[#E4E2DC] rounded-2xl max-w-md w-full overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="px-4 py-3 border-b border-[#E4E2DC] flex items-center justify-between">
              <span className="font-semibold text-sm">Anteprima Scontrino ({previewJob.type})</span>
              <button
                type="button"
                onClick={() => setPreviewJob(null)}
                className="text-xs font-semibold text-[#D9231F] cursor-pointer"
              >
                Chiudi
              </button>
            </div>
            <div className="p-4 bg-[#F7F6F3] max-h-[70vh] overflow-y-auto">
              <pre className="bg-white border border-[#E4E2DC] p-4 rounded-xl font-mono text-xs leading-relaxed whitespace-pre overflow-x-auto text-[#141413]">
                {previewJob.previewText}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
