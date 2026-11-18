'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  Send,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowLeft,
  SlidersHorizontal,
} from 'lucide-react';
import { MENU_CATEGORIES } from '../shared/menu';
import type { Department, MenuItem, ShiftState, TableState } from '../shared/types';
import { ItemConfigModal } from './ItemConfigModal';
import type { StaffRoute } from './StaffShell';

interface StaffCartLine {
  lineId: string;
  itemId: string;
  name: string;
  department: Department;
  qty: number;
  unitPrice: number;
  selectedOptions: string[];
  quickNotes: string[];
  customNote: string;
}

interface StaffHomeViewProps {
  shift: ShiftState;
  tables: TableState[];
  onRefresh: () => Promise<void>;
  onNavigate: (path: StaffRoute) => void;
}

export function StaffHomeView({ shift, tables, onRefresh, onNavigate }: StaffHomeViewProps) {
  const [selectedTableNum, setSelectedTableNum] = useState<number | null>(null);
  const [covers, setCovers] = useState<number>(2);
  const [activeCategoryId, setActiveCategoryId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<StaffCartLine[]>([]);
  const [generalNote, setGeneralNote] = useState('');
  const [configuringItem, setConfiguringItem] = useState<{ item: MenuItem; department: Department } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'ok' | 'err'; msg: string } | null>(null);

  const selectedTable = useMemo(
    () => tables.find((t) => t.tableNumber === selectedTableNum) || null,
    [tables, selectedTableNum]
  );

  const handleSelectTable = (tbl: TableState) => {
    setSelectedTableNum(tbl.tableNumber);
    setCovers(tbl.status === 'open' ? tbl.covers : 2);
    setCart([]);
    setGeneralNote('');
    setFeedback(null);
  };

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MENU_CATEGORIES.filter((c) => activeCategoryId === 'ALL' || c.id === activeCategoryId)
      .map((c) => ({
        ...c,
        items: q
          ? c.items.filter(
              (item) =>
                item.name.it.toLowerCase().includes(q) ||
                item.description.it.toLowerCase().includes(q)
            )
          : c.items,
      }))
      .filter((c) => c.items.length > 0);
  }, [activeCategoryId, searchQuery]);

  const addQuickItem = (item: MenuItem, department: Department) => {
    if (item.optionGroups && item.optionGroups.length > 0) {
      setConfiguringItem({ item, department });
      return;
    }
    setCart((prev) => {
      const idx = prev.findIndex(
        (l) =>
          l.itemId === item.id &&
          l.selectedOptions.length === 0 &&
          l.quickNotes.length === 0 &&
          !l.customNote
      );
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + 1 };
        return next;
      }
      return [
        ...prev,
        {
          lineId: `${item.id}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          itemId: item.id,
          name: item.name.it,
          department,
          qty: 1,
          unitPrice: item.price,
          selectedOptions: [],
          quickNotes: [],
          customNote: '',
        },
      ];
    });
  };

  const handleConfirmConfigured = (payload: {
    item: MenuItem;
    department: Department;
    qty: number;
    unitPrice: number;
    selectedOptions: string[];
    quickNotes: string[];
    customNote: string;
  }) => {
    setCart((prev) => [
      ...prev,
      {
        lineId: `${payload.item.id}-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
        itemId: payload.item.id,
        name: payload.item.name.it,
        department: payload.department,
        qty: payload.qty,
        unitPrice: payload.unitPrice,
        selectedOptions: payload.selectedOptions,
        quickNotes: payload.quickNotes,
        customNote: payload.customNote,
      },
    ]);
    setConfiguringItem(null);
  };

  const updateLineQty = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const cartTotal = useMemo(
    () => cart.reduce((sum, l) => sum + l.qty * l.unitPrice, 0),
    [cart]
  );

  const handleSubmitOrder = async () => {
    if (!selectedTable || cart.length === 0 || submitting) return;
    setSubmitting(true);
    setFeedback(null);
    const clientId = `staff-${selectedTable.tableNumber}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber: selectedTable.tableNumber,
          covers,
          generalNote,
          clientId,
          items: cart.map((c) => ({
            itemId: c.itemId,
            qty: c.qty,
            selectedOptions: c.selectedOptions,
            quickNotes: c.quickNotes,
            customNote: c.customNote,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setFeedback({ type: 'err', msg: data.error || 'Impossibile inviare la comanda' });
        return;
      }
      setCart([]);
      setGeneralNote('');
      setFeedback({
        type: 'ok',
        msg: `Comanda Tavolo ${selectedTable.tableNumber} inviata in stampa (Codice tavolo: ${data.table?.sessionCode || ''}).`,
      });
      await onRefresh();
    } catch {
      setFeedback({ type: 'err', msg: 'Errore di rete durante l’invio' });
    } finally {
      setSubmitting(false);
    }
  };

  const openCount = tables.filter((t) => t.status === 'open').length;

  return (
    <div className="space-y-5">
      {!shift.isOpen && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-amber-950 text-sm">Turno non ancora aperto</div>
              <div className="text-xs text-amber-800 mt-0.5">
                Apri il turno circa 10 minuti prima del servizio per abilitare le comande ai tavoli e i QR clienti.
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('/turno')}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-[#141413] text-white text-sm font-semibold whitespace-nowrap shrink-0 cursor-pointer"
          >
            Vai a Gestione Turno
          </button>
        </div>
      )}

      {feedback && (
        <div
          role="status"
          className={`rounded-2xl px-4 py-3 border flex items-center justify-between gap-3 text-sm font-medium ${
            feedback.type === 'ok'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-red-50 border-red-200 text-red-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === 'ok' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertTriangle className="w-4 h-4 shrink-0" />}
            <span>{feedback.msg}</span>
          </div>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            className="text-xs underline shrink-0 cursor-pointer"
          >
            Chiudi
          </button>
        </div>
      )}

      {/* Desktop 2-column layout; Mobile toggles smoothly between Tables grid and Order Taking */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Tables Grid */}
        <section className={`lg:col-span-5 space-y-3 ${selectedTable ? 'hidden lg:block' : 'block'}`}>
          <div className="flex items-baseline justify-between">
            <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight">
              TAVOLI SALA
            </h1>
            <span className="text-xs font-medium text-[#64625B] tabular-nums">
              {openCount} / {tables.length} aperti
            </span>
          </div>

          <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-3 gap-2.5">
            {tables.map((tbl) => {
              const isOpen = tbl.status === 'open';
              const isSelected = selectedTableNum === tbl.tableNumber;
              return (
                <button
                  key={tbl.tableNumber}
                  type="button"
                  onClick={() => handleSelectTable(tbl)}
                  className={`min-h-[92px] p-3 rounded-2xl border text-left flex flex-col justify-between transition-all active:scale-[0.98] cursor-pointer ${
                    isSelected
                      ? 'bg-[#141413] text-white border-[#141413] shadow-sm'
                      : isOpen
                        ? 'bg-white border-[#D9231F]/40 hover:border-[#D9231F]'
                        : 'bg-white border-[#E4E2DC] hover:border-[#141413]/40'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-[var(--font-display)] text-2xl font-bold tabular-nums leading-none">
                      T{tbl.tableNumber}
                    </span>
                    <span
                      className={`text-[11px] font-semibold ${
                        isSelected
                          ? isOpen
                            ? 'text-emerald-300'
                            : 'text-zinc-400'
                          : isOpen
                            ? 'text-emerald-700'
                            : 'text-[#64625B]'
                      }`}
                    >
                      {isOpen ? 'Aperto' : 'Libero'}
                    </span>
                  </div>

                  {isOpen ? (
                    <div className="mt-2 space-y-0.5">
                      <div className="font-mono text-sm font-bold tabular-nums">
                        € {tbl.total.toFixed(2).replace('.', ',')}
                      </div>
                      <div
                        className={`text-[11px] tabular-nums ${
                          isSelected ? 'text-zinc-300' : 'text-[#64625B]'
                        }`}
                      >
                        {tbl.covers} cop · #{tbl.sessionCode}
                      </div>
                    </div>
                  ) : (
                    <div className={`text-[11px] mt-2 ${isSelected ? 'text-zinc-300' : 'text-[#64625B]'}`}>
                      Tocca per ordinare
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Order Builder Panel */}
        <section className={`lg:col-span-7 ${selectedTable ? 'block' : 'hidden lg:block'}`}>
          {!selectedTable ? (
            <div className="bg-white border border-[#E4E2DC] rounded-2xl p-10 text-center">
              <div className="font-[var(--font-display)] text-2xl font-bold text-[#141413]">
                Seleziona un tavolo
              </div>
              <p className="text-sm text-[#64625B] mt-1 max-w-sm mx-auto">
                Tocca un tavolo a sinistra per prendere una comanda. Se il tavolo è chiuso verrà aperto automaticamente.
              </p>
            </div>
          ) : (
            <div className="bg-white border border-[#E4E2DC] rounded-2xl overflow-hidden">
              {/* Order header */}
              <div className="px-4 py-3.5 border-b border-[#E4E2DC] bg-[#F7F6F3]/60 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSelectedTableNum(null)}
                    className="lg:hidden min-h-[44px] min-w-[44px] -ml-2 flex items-center justify-center rounded-xl hover:bg-[#ECEAE4] cursor-pointer"
                    aria-label="Torna ai tavoli"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="font-[var(--font-display)] text-2xl font-bold tracking-tight">
                        TAVOLO {selectedTable.tableNumber}
                      </h2>
                      <span className="text-xs text-[#64625B]">
                        · {selectedTable.status === 'open' ? `Aperto · Codice ${selectedTable.sessionCode}` : 'Apertura automatica all’invio'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Covers selector */}
                <div className="flex items-center gap-2 bg-white border border-[#E4E2DC] rounded-xl px-2 py-1">
                  <Users className="w-4 h-4 text-[#64625B] ml-1" />
                  <span className="text-xs font-medium text-[#64625B]">Coperti</span>
                  <button
                    type="button"
                    onClick={() => setCovers((c) => Math.max(1, c - 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F6F3] cursor-pointer"
                    aria-label="Meno coperti"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="w-6 text-center font-mono font-bold tabular-nums text-sm">
                    {covers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCovers((c) => Math.min(30, c + 1))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F7F6F3] cursor-pointer"
                    aria-label="Più coperti"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Search & Category tabs */}
              <div className="p-4 border-b border-[#E4E2DC] space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-[#64625B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Cerca piatto, pizza o bevanda..."
                    className="w-full h-11 pl-10 pr-4 rounded-xl bg-[#F7F6F3] border border-[#E4E2DC] text-sm focus:outline-none focus:border-[#D9231F]"
                  />
                </div>

                <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                  <button
                    type="button"
                    onClick={() => setActiveCategoryId('ALL')}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                      activeCategoryId === 'ALL'
                        ? 'bg-[#141413] text-white'
                        : 'bg-[#F7F6F3] text-[#141413] hover:bg-[#ECEAE4]'
                    }`}
                  >
                    Tutte (21)
                  </button>
                  {MENU_CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setActiveCategoryId(cat.id)}
                      className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                        activeCategoryId === cat.id
                          ? 'bg-[#D9231F] text-white font-semibold'
                          : 'bg-[#F7F6F3] text-[#141413] hover:bg-[#ECEAE4]'
                      }`}
                    >
                      {cat.name.it}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items List */}
              <div className="max-h-[42vh] overflow-y-auto divide-y divide-[#E4E2DC]">
                {filteredCategories.map((cat) => (
                  <div key={cat.id} className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#64625B]">
                      <span>{cat.name.it}</span>
                      <span>{cat.department}</span>
                    </div>
                    <div className="space-y-1.5">
                      {cat.items.map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-3 py-2 border-b border-[#F7F6F3] last:border-0"
                        >
                          <button
                            type="button"
                            onClick={() => addQuickItem(item, cat.department)}
                            className="flex-1 text-left min-h-[44px] flex flex-col justify-center cursor-pointer"
                          >
                            <div className="font-medium text-sm text-[#141413]">
                              {item.name.it}
                            </div>
                            <div className="text-xs text-[#64625B] font-mono tabular-nums">
                              € {item.price.toFixed(2).replace('.', ',')}
                              {item.optionGroups ? ' · con opzioni' : ''}
                            </div>
                          </button>

                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={() => setConfiguringItem({ item, department: cat.department })}
                              title="Opzioni e note"
                              className="min-h-[44px] px-2.5 rounded-xl border border-[#E4E2DC] hover:bg-[#F7F6F3] text-xs font-medium text-[#64625B] flex items-center gap-1 cursor-pointer"
                            >
                              <SlidersHorizontal className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Note</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => addQuickItem(item, cat.department)}
                              aria-label={`Aggiungi ${item.name.it}`}
                              className="min-h-[44px] min-w-[44px] rounded-xl bg-[#141413] hover:bg-[#D9231F] text-white flex items-center justify-center transition-colors cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Active Cart & Send */}
              <div className="border-t border-[#E4E2DC] bg-[#F7F6F3] p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[#64625B]">
                    Comanda in preparazione ({cart.reduce((s, l) => s + l.qty, 0)} pz)
                  </span>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setCart([])}
                      className="text-xs text-red-700 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      Svuota
                    </button>
                  )}
                </div>

                {cart.length > 0 && (
                  <div className="bg-white border border-[#E4E2DC] rounded-xl divide-y divide-[#E4E2DC] max-h-48 overflow-y-auto">
                    {cart.map((line) => (
                      <div key={line.lineId} className="p-2.5 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="text-sm font-semibold text-[#141413] truncate">
                            {line.name}
                          </div>
                          <div className="text-xs text-[#64625B] truncate">
                            {line.department}
                            {line.selectedOptions.length > 0 && ` · ${line.selectedOptions.join(', ')}`}
                            {(line.quickNotes.length > 0 || line.customNote) &&
                              ` · Nota: ${[...line.quickNotes, line.customNote].filter(Boolean).join(', ')}`}
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => updateLineQty(line.lineId, -1)}
                            className="w-9 h-9 rounded-lg border border-[#E4E2DC] bg-[#F7F6F3] flex items-center justify-center cursor-pointer"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-6 text-center font-mono text-sm font-bold tabular-nums">
                            {line.qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateLineQty(line.lineId, 1)}
                            className="w-9 h-9 rounded-lg border border-[#E4E2DC] bg-[#F7F6F3] flex items-center justify-center cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                <input
                  type="text"
                  value={generalNote}
                  onChange={(e) => setGeneralNote(e.target.value)}
                  placeholder="Nota generale comanda (es. uscire pizze insieme, allergia...)"
                  className="w-full h-11 px-3 rounded-xl bg-white border border-[#E4E2DC] text-sm focus:outline-none focus:border-[#D9231F]"
                />

                <button
                  type="button"
                  disabled={!shift.isOpen || cart.length === 0 || submitting}
                  onClick={handleSubmitOrder}
                  className="w-full h-13 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] disabled:opacity-40 active:scale-[0.99] text-white font-bold text-sm px-4 flex items-center justify-between transition-all cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Send className="w-4 h-4" />
                    {submitting ? 'Invio & Stampa...' : `Invia Comanda Tavolo ${selectedTable.tableNumber}`}
                  </span>
                  <span className="font-mono text-base tabular-nums">
                    € {cartTotal.toFixed(2).replace('.', ',')}
                  </span>
                </button>
              </div>
            </div>
          )}
        </section>
      </div>

      <ItemConfigModal
        item={configuringItem?.item || null}
        department={configuringItem?.department || 'CUCINA'}
        lang="it"
        onClose={() => setConfiguringItem(null)}
        onConfirm={handleConfirmConfigured}
      />
    </div>
  );
}
