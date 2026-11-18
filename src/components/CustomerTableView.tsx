'use client';

import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  Search,
  Plus,
  Minus,
  ShoppingBag,
  CheckCircle2,
  X,
  KeyRound,
  Send,
  Utensils,
} from 'lucide-react';
import { CUSTOMER_I18N } from '../shared/i18n';
import { MENU_CATEGORIES } from '../shared/menu';
import type { Department, Lang, MenuItem } from '../shared/types';
import { ItemConfigModal } from './ItemConfigModal';

interface CustomerCartLine {
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

interface CustomerTableViewProps {
  tableNumber: number;
  qrToken: string;
}

export function CustomerTableView({ tableNumber, qrToken }: CustomerTableViewProps) {
  const [lang, setLang] = useState<Lang>('it');
  const t = CUSTOMER_I18N[lang];

  const [statusState, setStatusState] = useState<
    'loading' | 'invalid_qr' | 'shift_closed' | 'table_closed' | 'ready'
  >('loading');
  const [tableTotalSoFar, setTableTotalSoFar] = useState(0);
  const [covers, setCovers] = useState(2);

  const [sessionCode, setSessionCode] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.sessionStorage.getItem(`pitstop2:code:${tableNumber}`) || '';
    }
    return '';
  });

  const [activeCatId, setActiveCatId] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CustomerCartLine[]>([]);
  const [generalNote, setGeneralNote] = useState('');
  const [cartDrawerOpen, setCartDrawerOpen] = useState(false);
  const [configuringItem, setConfiguringItem] = useState<{ item: MenuItem; department: Department } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [heroImgFailed, setHeroImgFailed] = useState(false);

  const fetchTableStatus = useCallback(async () => {
    try {
      const res = await fetch(
        `/api/customer/table/${tableNumber}?k=${encodeURIComponent(qrToken)}`
      );
      if (res.status === 403 || res.status === 400) {
        setStatusState('invalid_qr');
        return;
      }
      if (!res.ok) {
        setStatusState('invalid_qr');
        return;
      }
      const data = await res.json();
      if (!data.shiftOpen) {
        setStatusState('shift_closed');
        return;
      }
      if (data.table.status !== 'open') {
        setStatusState('table_closed');
        return;
      }
      setTableTotalSoFar(data.table.total || 0);
      setCovers(data.table.covers || 2);
      setStatusState('ready');
    } catch {
      setStatusState('invalid_qr');
    }
  }, [tableNumber, qrToken]);

  useEffect(() => {
    fetchTableStatus();
  }, [fetchTableStatus]);

  useEffect(() => {
    if (typeof window !== 'undefined' && sessionCode.length === 4) {
      window.sessionStorage.setItem(`pitstop2:code:${tableNumber}`, sessionCode);
    }
  }, [sessionCode, tableNumber]);

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return MENU_CATEGORIES.filter((c) => activeCatId === 'ALL' || c.id === activeCatId)
      .map((c) => ({
        ...c,
        items: q
          ? c.items.filter(
              (item) =>
                item.name[lang].toLowerCase().includes(q) ||
                item.description[lang].toLowerCase().includes(q)
            )
          : c.items,
      }))
      .filter((c) => c.items.length > 0);
  }, [activeCatId, searchQuery, lang]);

  const addItem = (item: MenuItem, department: Department) => {
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
          name: item.name[lang],
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
        name: payload.item.name[lang],
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

  const updateCartQty = (lineId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((l) => (l.lineId === lineId ? { ...l, qty: l.qty + delta } : l))
        .filter((l) => l.qty > 0)
    );
  };

  const cartCount = useMemo(() => cart.reduce((s, l) => s + l.qty, 0), [cart]);
  const cartTotal = useMemo(() => cart.reduce((s, l) => s + l.qty * l.unitPrice, 0), [cart]);

  const handleSendCustomerOrder = async () => {
    if (submitting || cart.length === 0) return;
    if (!/^\d{4}$/.test(sessionCode.trim())) {
      setSubmitError(t.codeError);
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    // Deterministic clientId per cart submission attempt to prevent double-submits
    const clientId = `cust-${tableNumber}-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;

    try {
      const res = await fetch('/api/customer/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tableNumber,
          qrToken,
          sessionCode: sessionCode.trim(),
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
        if (data.code === 'INVALID_SESSION_CODE') {
          setSubmitError(t.codeError);
        } else if (data.code?.startsWith('RATE_LIMIT')) {
          setSubmitError(t.rateLimitError);
        } else {
          setSubmitError(data.error || t.rateLimitError);
        }
        return;
      }

      setCart([]);
      setGeneralNote('');
      setCartDrawerOpen(false);
      setOrderSuccess(true);
      await fetchTableStatus();
    } catch {
      setSubmitError('Errore di rete. Riprova tra qualche secondo.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] text-[#141413] pb-24">
      {/* Compact Sticky Top Header (< 8% mobile viewport height) */}
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-[#E4E2DC]">
        <div className="max-w-3xl mx-auto h-full px-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-[var(--font-display)] text-xl font-bold tracking-tight whitespace-nowrap">
            <span className="inline-block w-2 h-4 bg-[#D9231F] rounded-sm" aria-hidden="true" />
            PIT STOP 2.0
          </div>

          <div className="font-[var(--font-display)] text-lg font-bold text-[#141413] whitespace-nowrap">
            {t.tableLabel} {tableNumber}
          </div>

          {/* IT / EN / DE Switcher */}
          <div className="flex items-center gap-1 bg-[#F7F6F3] p-1 rounded-lg border border-[#E4E2DC] shrink-0">
            {(['it', 'en', 'de'] as Lang[]).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`px-2 py-1 text-xs font-bold uppercase rounded-md transition-colors cursor-pointer ${
                  lang === l ? 'bg-[#141413] text-white' : 'text-[#64625B] hover:text-[#141413]'
                }`}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 pt-4 space-y-5">
        {/* Hero Visual */}
        <div className="relative rounded-2xl overflow-hidden border border-[#E4E2DC] h-40 sm:h-48 bg-[#141413]">
          {!heroImgFailed ? (
            <img
              src="/src/assets/images/pitstop_pizza_hero_1794928809600.jpg"
              alt="Pit Stop 2.0 Wood-Fired Pizza"
              referrerPolicy="no-referrer"
              onError={() => setHeroImgFailed(true)}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#141413] via-[#27272A] to-[#D9231F]/40 flex items-center justify-center">
              <Utensils className="w-10 h-10 text-white/30" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-transparent flex flex-col justify-end p-4 sm:p-5">
            <div className="text-xs font-medium text-white/80">
              {t.brandTag} · {t.tableLabel} {tableNumber}
            </div>
            <h1 className="font-[var(--font-display)] text-3xl sm:text-4xl font-bold text-white tracking-tight">
              PIZZERIA PIT STOP 2.0
            </h1>
          </div>
        </div>

        {/* Non-ready gating states */}
        {statusState === 'loading' && (
          <div className="bg-white border border-[#E4E2DC] rounded-2xl p-8 text-center text-sm text-[#64625B]">
            Caricamento menu...
          </div>
        )}

        {statusState === 'invalid_qr' && (
          <div className="bg-white border border-red-200 rounded-2xl p-6 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-[#D9231F] mx-auto" />
            <h2 className="font-bold text-lg">{t.invalidQrTitle}</h2>
            <p className="text-sm text-[#64625B]">{t.invalidQrBody}</p>
          </div>
        )}

        {statusState === 'shift_closed' && (
          <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 text-center space-y-2">
            <AlertTriangle className="w-8 h-8 text-amber-600 mx-auto" />
            <h2 className="font-bold text-lg">{t.shiftClosedTitle}</h2>
            <p className="text-sm text-[#64625B]">{t.shiftClosedBody}</p>
          </div>
        )}

        {statusState === 'table_closed' && (
          <div className="bg-white border border-[#E4E2DC] rounded-2xl p-6 text-center space-y-3">
            <KeyRound className="w-8 h-8 text-[#D9231F] mx-auto" />
            <h2 className="font-bold text-lg">{t.tableClosedTitle}</h2>
            <p className="text-sm text-[#64625B]">{t.tableClosedBody}</p>
            <button
              type="button"
              onClick={fetchTableStatus}
              className="min-h-[44px] px-4 rounded-xl bg-[#141413] text-white text-sm font-semibold cursor-pointer"
            >
              Riprova / Refresh
            </button>
          </div>
        )}

        {statusState === 'ready' && (
          <>
            {orderSuccess && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 font-bold text-emerald-900">
                  <CheckCircle2 className="w-5 h-5" />
                  <span>{t.orderSentTitle}</span>
                </div>
                <p className="text-sm text-emerald-800">{t.orderSentBody}</p>
                <button
                  type="button"
                  onClick={() => setOrderSuccess(false)}
                  className="min-h-[40px] px-3 rounded-lg bg-emerald-700 text-white text-xs font-semibold cursor-pointer"
                >
                  {t.orderMore}
                </button>
              </div>
            )}

            {/* Allergies Warning */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <div className="text-sm font-bold text-amber-950">{t.allergyTitle}</div>
                <p className="text-xs text-amber-900 leading-relaxed">{t.allergyBody}</p>
              </div>
            </div>

            {/* 4-digit Table Code + Table Summary */}
            <div className="bg-white border border-[#E4E2DC] rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 flex-1">
                <label
                  htmlFor="table-session-code"
                  className="block text-sm font-bold text-[#141413]"
                >
                  {t.sessionCodeLabel}
                </label>
                <p className="text-xs text-[#64625B]">{t.sessionCodeHint}</p>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="table-session-code"
                  type="text"
                  inputMode="numeric"
                  maxLength={4}
                  value={sessionCode}
                  onChange={(e) => {
                    setSessionCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                    setSubmitError(null);
                  }}
                  placeholder={t.sessionCodePlaceholder}
                  className="w-32 h-12 text-center font-mono text-xl font-bold tracking-[0.25em] rounded-xl bg-[#F7F6F3] border border-[#E4E2DC] focus:outline-none focus:border-[#D9231F]"
                />
                {tableTotalSoFar > 0 && (
                  <div className="text-right">
                    <div className="text-[11px] text-[#64625B]">{t.tableTotalSoFar}</div>
                    <div className="font-mono font-bold text-sm tabular-nums">
                      € {tableTotalSoFar.toFixed(2).replace('.', ',')}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Search & 21 Categories Scroller */}
            <div className="space-y-3">
              <div className="relative">
                <Search className="w-4 h-4 text-[#64625B] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  className="w-full h-11 pl-10 pr-4 rounded-xl bg-white border border-[#E4E2DC] text-sm focus:outline-none focus:border-[#D9231F]"
                />
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                <button
                  type="button"
                  onClick={() => setActiveCatId('ALL')}
                  className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCatId === 'ALL'
                      ? 'bg-[#141413] text-white'
                      : 'bg-white border border-[#E4E2DC] text-[#141413]'
                  }`}
                >
                  {t.allCategories}
                </button>
                {MENU_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setActiveCatId(cat.id)}
                    className={`min-h-[40px] px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap shrink-0 cursor-pointer ${
                      activeCatId === cat.id
                        ? 'bg-[#D9231F] text-white font-semibold'
                        : 'bg-white border border-[#E4E2DC] text-[#141413]'
                    }`}
                  >
                    {cat.name[lang]}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu List */}
            <div className="space-y-6">
              {filteredCategories.map((cat) => (
                <section key={cat.id} className="space-y-2.5">
                  <div className="flex items-baseline justify-between border-b border-[#E4E2DC] pb-1.5">
                    <h2 className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-[#141413]">
                      {cat.name[lang]}
                    </h2>
                    <span className="text-xs font-medium text-[#64625B]">
                      {cat.department === 'CUCINA' ? t.kitchenTag : t.barTag}
                    </span>
                  </div>

                  <div className="bg-white border border-[#E4E2DC] rounded-2xl divide-y divide-[#E4E2DC]">
                    {cat.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-start justify-between gap-3">
                        <div
                          onClick={() => setConfiguringItem({ item, department: cat.department })}
                          className="flex-1 min-w-0 cursor-pointer"
                        >
                          <div className="font-bold text-base text-[#141413]">{item.name[lang]}</div>
                          {item.description[lang] && (
                            <p className="text-xs text-[#64625B] mt-0.5 leading-relaxed">
                              {item.description[lang]}
                            </p>
                          )}
                          <div className="flex flex-wrap items-center gap-2 mt-1.5 text-xs">
                            <span className="font-mono font-bold text-sm tabular-nums text-[#141413]">
                              € {item.price.toFixed(2).replace('.', ',')}
                            </span>
                            {item.allergens && item.allergens.length > 0 && (
                              <>
                                <span className="text-[#64625B]">·</span>
                                <span className="text-[#64625B]">
                                  {t.allergensPrefix}: {item.allergens.join(', ')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => addItem(item, cat.department)}
                          className="min-h-[44px] px-3.5 rounded-xl bg-[#141413] hover:bg-[#D9231F] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 cursor-pointer transition-colors"
                        >
                          <Plus className="w-4 h-4" />
                          <span>{item.optionGroups ? t.customize : t.add}</span>
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </main>

      {/* Compact Sticky Bottom Cart CTA Bar (<= 15% mobile viewport height) */}
      {statusState === 'ready' && cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-3 bg-gradient-to-t from-[#F7F6F3] via-[#F7F6F3] to-transparent">
          <div className="max-w-3xl mx-auto">
            <button
              type="button"
              onClick={() => setCartDrawerOpen(true)}
              className="w-full h-13 rounded-2xl bg-[#D9231F] hover:bg-[#B81D1A] text-white font-bold text-sm px-4 flex items-center justify-between shadow-lg cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>
                  {t.cartTitle} · {cartCount} {t.itemsCount}
                </span>
              </span>
              <span className="font-mono text-base tabular-nums">
                € {cartTotal.toFixed(2).replace('.', ',')}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Cart Checkout Bottom Sheet */}
      {cartDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={() => setCartDrawerOpen(false)}
        >
          <div
            className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-[#E4E2DC] max-h-[90vh] flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sm:hidden w-10 h-1.5 bg-[#E4E2DC] rounded-full mx-auto mt-3" />
            <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-center justify-between">
              <div>
                <h3 className="font-[var(--font-display)] text-2xl font-bold">{t.cartTitle}</h3>
                <div className="text-xs text-[#64625B]">
                  {t.tableLabel} {tableNumber} · {covers} {t.coversLabel}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setCartDrawerOpen(false)}
                className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded-xl hover:bg-[#F7F6F3] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4">
              {cart.length === 0 ? (
                <p className="text-sm text-[#64625B] text-center py-6">{t.emptyCart}</p>
              ) : (
                <div className="divide-y divide-[#E4E2DC] border border-[#E4E2DC] rounded-xl">
                  {cart.map((line) => (
                    <div key={line.lineId} className="p-3 flex items-center justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="font-semibold text-sm text-[#141413]">{line.name}</div>
                        {(line.selectedOptions.length > 0 || line.quickNotes.length > 0 || line.customNote) && (
                          <div className="text-xs text-[#64625B] mt-0.5">
                            {[...line.selectedOptions, ...line.quickNotes, line.customNote]
                              .filter(Boolean)
                              .join(' · ')}
                          </div>
                        )}
                        <div className="text-xs font-mono tabular-nums text-[#141413] mt-0.5">
                          € {(line.qty * line.unitPrice).toFixed(2).replace('.', ',')}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => updateCartQty(line.lineId, -1)}
                          className="w-10 h-10 rounded-xl border border-[#E4E2DC] bg-[#F7F6F3] flex items-center justify-center cursor-pointer"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="w-6 text-center font-mono text-sm font-bold tabular-nums">
                          {line.qty}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateCartQty(line.lineId, 1)}
                          className="w-10 h-10 rounded-xl border border-[#E4E2DC] bg-[#F7F6F3] flex items-center justify-center cursor-pointer"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-[#64625B] mb-1.5">
                  {t.generalNoteLabel}
                </label>
                <input
                  type="text"
                  value={generalNote}
                  onChange={(e) => setGeneralNote(e.target.value)}
                  placeholder={t.generalNotePlaceholder}
                  maxLength={240}
                  className="w-full h-11 px-3 rounded-xl bg-[#F7F6F3] border border-[#E4E2DC] text-sm focus:outline-none focus:border-[#D9231F]"
                />
              </div>

              {!/^\d{4}$/.test(sessionCode.trim()) && (
                <div className="bg-[#F7F6F3] border border-[#E4E2DC] rounded-xl p-3 space-y-2">
                  <div className="text-xs font-semibold text-[#141413]">{t.sessionCodeLabel}</div>
                  <input
                    type="text"
                    inputMode="numeric"
                    maxLength={4}
                    value={sessionCode}
                    onChange={(e) => {
                      setSessionCode(e.target.value.replace(/\D/g, '').slice(0, 4));
                      setSubmitError(null);
                    }}
                    placeholder={t.sessionCodePlaceholder}
                    className="w-full h-11 px-3 text-center font-mono text-lg font-bold tracking-[0.25em] rounded-lg bg-white border border-[#E4E2DC] focus:outline-none focus:border-[#D9231F]"
                  />
                </div>
              )}

              {submitError && (
                <div
                  role="alert"
                  className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-sm font-medium"
                >
                  {submitError}
                </div>
              )}
            </div>

            <div className="p-4 border-t border-[#E4E2DC] bg-white">
              <button
                type="button"
                disabled={submitting || cart.length === 0}
                onClick={handleSendCustomerOrder}
                className="w-full h-13 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] disabled:opacity-40 text-white font-bold text-sm px-4 flex items-center justify-between cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Send className="w-4 h-4" />
                  {submitting ? t.sendingOrder : t.sendOrder}
                </span>
                <span className="font-mono text-base tabular-nums">
                  € {cartTotal.toFixed(2).replace('.', ',')}
                </span>
              </button>
            </div>
          </div>
        </div>
      )}

      <ItemConfigModal
        item={configuringItem?.item || null}
        department={configuringItem?.department || 'CUCINA'}
        lang={lang}
        onClose={() => setConfiguringItem(null)}
        onConfirm={handleConfirmConfigured}
      />
    </div>
  );
}
