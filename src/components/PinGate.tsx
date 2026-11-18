'use client';

import React, { useState } from 'react';
import { Lock, Delete, ArrowRight } from 'lucide-react';

interface PinGateProps {
  onSuccess: () => void;
}

export function PinGate({ onSuccess }: PinGateProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submitPin = async (code: string) => {
    if (!code.trim() || loading) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'PIN non valido');
        setPin('');
        return;
      }
      onSuccess();
    } catch {
      setError('Errore di connessione al server');
    } finally {
      setLoading(false);
    }
  };

  const handleDigit = (d: string) => {
    if (pin.length >= 8) return;
    const next = pin + d;
    setPin(next);
    setError(null);
  };

  const handleBackspace = () => {
    setPin((prev) => prev.slice(0, -1));
    setError(null);
  };

  return (
    <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white border border-[#E4E2DC] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 rounded-xl bg-[#141413] text-white flex items-center justify-center mb-3">
            <Lock className="w-5 h-5" />
          </div>
          <h1 className="font-[var(--font-display)] text-3xl font-bold tracking-tight text-[#141413]">
            PIT STOP 2.0
          </h1>
          <p className="text-sm text-[#64625B] mt-1">
            Inserisci il PIN personale per accedere alle comande
          </p>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            submitPin(pin);
          }}
        >
          <div className="mb-4">
            <input
              type="password"
              inputMode="numeric"
              autoComplete="one-time-code"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value.replace(/\D/g, '').slice(0, 8));
                setError(null);
              }}
              placeholder="••••"
              aria-label="PIN Staff"
              className="w-full h-14 text-center font-mono text-2xl tracking-[0.5em] bg-[#F7F6F3] border border-[#E4E2DC] rounded-xl focus:outline-none focus:border-[#D9231F] focus:ring-2 focus:ring-[#D9231F]/15"
            />
          </div>

          {error && (
            <div
              role="alert"
              className="mb-4 px-3 py-2.5 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm text-center font-medium"
            >
              {error}
            </div>
          )}

          <div className="grid grid-cols-3 gap-2.5 mb-4">
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
              <button
                key={digit}
                type="button"
                onClick={() => handleDigit(digit)}
                className="h-14 rounded-xl bg-[#F7F6F3] hover:bg-[#ECEAE4] active:scale-[0.98] border border-[#E4E2DC] text-xl font-bold tabular-nums text-[#141413] transition-transform cursor-pointer"
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              onClick={handleBackspace}
              aria-label="Cancella cifra"
              className="h-14 rounded-xl bg-[#F7F6F3] hover:bg-[#ECEAE4] active:scale-[0.98] border border-[#E4E2DC] flex items-center justify-center text-[#64625B] transition-transform cursor-pointer"
            >
              <Delete className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={() => handleDigit('0')}
              className="h-14 rounded-xl bg-[#F7F6F3] hover:bg-[#ECEAE4] active:scale-[0.98] border border-[#E4E2DC] text-xl font-bold tabular-nums text-[#141413] transition-transform cursor-pointer"
            >
              0
            </button>
            <button
              type="submit"
              disabled={!pin || loading}
              className="h-14 rounded-xl bg-[#D9231F] hover:bg-[#B81D1A] disabled:opacity-40 active:scale-[0.98] text-white font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>

          <button
            type="submit"
            disabled={!pin || loading}
            className="w-full h-12 rounded-xl bg-[#141413] hover:bg-black disabled:opacity-40 text-white font-semibold text-sm transition-colors cursor-pointer"
          >
            {loading ? 'Verifica in corso...' : 'Sblocca Area Staff'}
          </button>
        </form>
      </div>
    </div>
  );
}
