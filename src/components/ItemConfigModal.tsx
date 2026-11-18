'use client';

import React, { useState, useEffect } from 'react';
import { X, Minus, Plus, Check } from 'lucide-react';
import { QUICK_NOTES } from '../shared/menu';
import type { Department, Lang, MenuItem } from '../shared/types';
import { CUSTOMER_I18N } from '../shared/i18n';

interface ItemConfigModalProps {
  item: MenuItem | null;
  department: Department;
  lang: Lang;
  onClose: () => void;
  onConfirm: (payload: {
    item: MenuItem;
    department: Department;
    qty: number;
    unitPrice: number;
    selectedOptions: string[];
    quickNotes: string[];
    customNote: string;
  }) => void;
}

export function ItemConfigModal({
  item,
  department,
  lang,
  onClose,
  onConfirm,
}: ItemConfigModalProps) {
  const t = CUSTOMER_I18N[lang];
  const [qty, setQty] = useState(1);
  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string>>({});
  const [quickNotes, setQuickNotes] = useState<string[]>([]);
  const [customNote, setCustomNote] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!item) return;
    setQty(1);
    setQuickNotes([]);
    setCustomNote('');
    setError(null);
    const defaults: Record<string, string> = {};
    if (item.optionGroups) {
      for (const g of item.optionGroups) {
        if (g.choices.length > 0) {
          defaults[g.id] = g.choices[0].id;
        }
      }
    }
    setSelectedByGroup(defaults);
  }, [item]);

  if (!item) return null;

  const availableQuickNotes = QUICK_NOTES.filter(
    (n) => n.department === 'ALL' || n.department === department
  );

  // Compute current unit price with option deltas
  let unitPrice = item.price;
  const selectedLabels: string[] = [];
  if (item.optionGroups) {
    for (const group of item.optionGroups) {
      const choiceId = selectedByGroup[group.id];
      const choice = group.choices.find((c) => c.id === choiceId);
      if (choice) {
        if (choice.priceDelta) unitPrice += choice.priceDelta;
        selectedLabels.push(choice.label[lang]);
      }
    }
  }
  unitPrice = Math.max(0.5, Number(unitPrice.toFixed(2)));

  const toggleNote = (labelIt: string) => {
    setQuickNotes((prev) =>
      prev.includes(labelIt) ? prev.filter((n) => n !== labelIt) : [...prev, labelIt]
    );
  };

  const handleSubmit = () => {
    if (item.optionGroups) {
      for (const group of item.optionGroups) {
        if (group.required && !selectedByGroup[group.id]) {
          setError(t.requiredOptionError);
          return;
        }
      }
    }
    onConfirm({
      item,
      department,
      qty,
      unitPrice,
      selectedOptions: selectedLabels,
      quickNotes,
      customNote: customNote.trim(),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-lg bg-white rounded-t-3xl sm:rounded-2xl border border-[#E4E2DC] max-h-[88vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sm:hidden w-10 h-1.5 bg-[#E4E2DC] rounded-full mx-auto mt-3" />

        <div className="px-5 py-4 border-b border-[#E4E2DC] flex items-start justify-between gap-4">
          <div>
            <div className="text-xs font-medium text-[#64625B]">
              {department === 'CUCINA' ? t.kitchenTag : t.barTag}
            </div>
            <h3 className="text-lg font-bold text-[#141413] leading-snug">
              {item.name[lang]}
            </h3>
            {item.description[lang] && (
              <p className="text-sm text-[#64625B] mt-0.5">{item.description[lang]}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Chiudi"
            className="min-h-[44px] min-w-[44px] -mr-2 -mt-1 flex items-center justify-center rounded-xl hover:bg-[#F7F6F3] text-[#64625B] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-5">
          {item.optionGroups && item.optionGroups.length > 0 && (
            <div className="space-y-4">
              {item.optionGroups.map((group) => (
                <div key={group.id}>
                  <div className="text-xs font-semibold uppercase tracking-wide text-[#64625B] mb-2">
                    {group.label[lang]}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {group.choices.map((choice) => {
                      const active = selectedByGroup[group.id] === choice.id;
                      return (
                        <button
                          key={choice.id}
                          type="button"
                          onClick={() => {
                            setSelectedByGroup((prev) => ({ ...prev, [group.id]: choice.id }));
                            setError(null);
                          }}
                          className={`min-h-[44px] px-3 py-2 rounded-xl border text-sm font-medium text-left flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                            active
                              ? 'border-[#D9231F] bg-[#D9231F]/5 text-[#141413]'
                              : 'border-[#E4E2DC] bg-white text-[#141413] hover:bg-[#F7F6F3]'
                          }`}
                        >
                          <span className="truncate">{choice.label[lang]}</span>
                          {choice.priceDelta ? (
                            <span className="text-xs font-mono tabular-nums text-[#64625B] shrink-0">
                              {choice.priceDelta > 0 ? `+€${choice.priceDelta.toFixed(2)}` : `-€${Math.abs(choice.priceDelta).toFixed(2)}`}
                            </span>
                          ) : active ? (
                            <Check className="w-4 h-4 text-[#D9231F] shrink-0" />
                          ) : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Quick notes */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wide text-[#64625B] mb-2">
              {t.quickNotesTitle}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableQuickNotes.map((note) => {
                // Canonical Italian label stored for kitchen readability
                const canonical = note.label.it;
                const active = quickNotes.includes(canonical);
                return (
                  <button
                    key={note.id}
                    type="button"
                    onClick={() => toggleNote(canonical)}
                    className={`min-h-[40px] px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                      active
                        ? 'border-[#141413] bg-[#141413] text-white'
                        : 'border-[#E4E2DC] bg-[#F7F6F3] text-[#141413] hover:bg-[#ECEAE4]'
                    }`}
                  >
                    {note.label[lang]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom note */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wide text-[#64625B] mb-1.5">
              {t.customNoteLabel}
            </label>
            <input
              type="text"
              value={customNote}
              onChange={(e) => setCustomNote(e.target.value)}
              placeholder={t.customNotePlaceholder}
              maxLength={140}
              className="w-full h-11 px-3 rounded-xl bg-[#F7F6F3] border border-[#E4E2DC] text-sm focus:outline-none focus:border-[#D9231F]"
            />
          </div>

          {error && (
            <div className="text-sm text-red-700 font-medium">{error}</div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E2DC] bg-white flex items-center gap-3">
          <div className="flex items-center border border-[#E4E2DC] rounded-xl bg-[#F7F6F3]">
            <button
              type="button"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              aria-label="Riduci quantità"
              className="w-11 h-12 flex items-center justify-center text-[#141413] cursor-pointer"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="w-8 text-center font-mono font-bold tabular-nums text-base">
              {qty}
            </span>
            <button
              type="button"
              onClick={() => setQty((q) => Math.min(50, q + 1))}
              aria-label="Aumenta quantità"
              className="w-11 h-12 flex items-center justify-center text-[#141413] cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          <button
            type="button"
            onClick={handleSubmit}
            className="flex-1 h-12 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] active:scale-[0.99] text-white font-semibold text-sm flex items-center justify-between px-4 transition-all cursor-pointer"
          >
            <span>{t.confirmAdd}</span>
            <span className="font-mono tabular-nums">
              € {(unitPrice * qty).toFixed(2).replace('.', ',')}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
