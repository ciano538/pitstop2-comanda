'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Printer, RefreshCw, Eye, CheckCircle2, Clock } from 'lucide-react';
import type { Order, PrintJob, PrintJobType } from '../shared/types';

export function HistoryView() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<'ALL' | PrintJobType>('ALL');
  const [filterTable, setFilterTable] = useState<string>('ALL');
  const [previewJob, setPreviewJob] = useState<PrintJob | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders || []);
        setPrintJobs(data.printJobs || []);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleTestPrint = async () => {
    setBusyId('test');
    setNotice(null);
    try {
      const res = await fetch('/api/print/test', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setNotice('Prova di stampa inviata alla coda del Bridge.');
        setPreviewJob(data.printJob);
        await loadHistory();
      }
    } finally {
      setBusyId(null);
    }
  };

  const handleReprint = async (jobId: string) => {
    setBusyId(jobId);
    setNotice(null);
    try {
      const res = await fetch('/api/print/reprint', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      });
      if (res.ok) {
        setNotice('Ristampa accodata per la stampante termica.');
        await loadHistory();
      }
    } finally {
      setBusyId(null);
    }
  };

  const filteredJobs = printJobs.filter((j) => {
    if (filterType !== 'ALL' && j.type !== filterType) return false;
    if (filterTable !== 'ALL' && String(j.tableNumber) !== filterTable) return false;
    return true;
  });

  const todayTotal = orders.reduce((sum, o) => sum + o.total, 0);

  return (
    <div className="space-y-6">
      <div className="border-b border-[#E4E2DC] pb-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight">
            STORICO DI OGGI &amp; STAMPE
          </h1>
          <p className="text-sm text-[#64625B] mt-0.5">
            Solo comande e scontrini della giornata corrente · {orders.length} comande · Totale € {todayTotal.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadHistory}
            className="min-h-[44px] px-3.5 rounded-xl border border-[#E4E2DC] bg-white hover:bg-[#F7F6F3] text-sm font-medium flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Aggiorna
          </button>

          <button
            type="button"
            disabled={busyId === 'test'}
            onClick={handleTestPrint}
            className="min-h-[44px] px-4 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] disabled:opacity-40 text-white text-sm font-semibold flex items-center gap-2 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            Prova Stampa
          </button>
        </div>
      </div>

      {notice && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl px-4 py-3 text-sm font-medium flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {(['ALL', 'CUCINA', 'BAR', 'CASSA', 'CONTO', 'TEST'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setFilterType(t)}
              className={`min-h-[40px] px-3 rounded-lg text-xs font-semibold cursor-pointer ${
                filterType === t
                  ? 'bg-[#141413] text-white'
                  : 'bg-white border border-[#E4E2DC] text-[#141413] hover:bg-[#F7F6F3]'
              }`}
            >
              {t === 'ALL' ? 'Tutti i reparti' : t}
            </button>
          ))}
        </div>

        <select
          value={filterTable}
          onChange={(e) => setFilterTable(e.target.value)}
          aria-label="Filtra per tavolo"
          className="h-10 px-3 rounded-xl bg-white border border-[#E4E2DC] text-sm font-medium focus:outline-none focus:border-[#D9231F]"
        >
          <option value="ALL">Tutti i tavoli</option>
          {Array.from({ length: 15 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={String(n)}>
              Tavolo {n}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-sm text-[#64625B] py-12 text-center">Caricamento storico...</div>
      ) : filteredJobs.length === 0 ? (
        <div className="bg-white border border-[#E4E2DC] rounded-2xl p-10 text-center text-sm text-[#64625B]">
          Nessuna stampa registrata oggi con questi filtri.
        </div>
      ) : (
        <div className="bg-white border border-[#E4E2DC] rounded-2xl divide-y divide-[#E4E2DC]">
          {filteredJobs.map((job) => (
            <div
              key={job.id}
              className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <span className="font-bold text-[#141413]">{job.type}</span>
                  <span className="text-[#64625B]">·</span>
                  <span className="font-semibold">
                    {job.tableNumber > 0 ? `Tavolo ${job.tableNumber}` : 'Diagnostica'}
                  </span>
                  {job.source === 'customer' && (
                    <>
                      <span className="text-[#64625B]">·</span>
                      <span className="text-xs font-semibold text-[#D9231F]">DA CLIENTE</span>
                    </>
                  )}
                  {job.reprintOf && (
                    <>
                      <span className="text-[#64625B]">·</span>
                      <span className="text-xs text-[#64625B]">Ristampa</span>
                    </>
                  )}
                </div>

                <div className="text-xs text-[#64625B] font-mono tabular-nums flex items-center gap-2">
                  <span>
                    {new Date(job.createdAt).toLocaleTimeString('it-IT', {
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </span>
                  <span>·</span>
                  <span className={`inline-flex items-center gap-1 font-sans font-semibold ${job.status === 'printed' ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {job.status === 'printed' ? (
                      <>
                        <CheckCircle2 className="w-3.5 h-3.5" /> Stampato
                      </>
                    ) : (
                      <>
                        <Clock className="w-3.5 h-3.5" /> In coda Bridge
                      </>
                    )}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => setPreviewJob(job)}
                  className="min-h-[44px] px-3.5 rounded-xl border border-[#E4E2DC] hover:bg-[#F7F6F3] text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Eye className="w-4 h-4" />
                  Anteprima
                </button>
                <button
                  type="button"
                  disabled={busyId === job.id}
                  onClick={() => handleReprint(job.id)}
                  className="min-h-[44px] px-3.5 rounded-xl bg-[#141413] hover:bg-black disabled:opacity-40 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  Ristampa
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

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
              <span className="font-semibold text-sm">
                Scontrino {previewJob.type} {previewJob.tableNumber > 0 ? `· Tavolo ${previewJob.tableNumber}` : ''}
              </span>
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
