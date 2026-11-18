'use client';

import React from 'react';
import {
  UtensilsCrossed,
  Receipt,
  Clock,
  QrCode,
  History,
  LogOut,
  Printer,
} from 'lucide-react';
import type { BridgeHeartbeat, ShiftState } from '../shared/types';

export type StaffRoute = '/' | '/cassa' | '/turno' | '/turno/qr' | '/storico';

interface StaffShellProps {
  currentPath: StaffRoute;
  onNavigate: (path: StaffRoute) => void;
  onLogout: () => void;
  bridge: BridgeHeartbeat;
  shift: ShiftState;
  pendingJobsCount: number;
  children: React.ReactNode;
}

const NAV_ITEMS: Array<{ path: StaffRoute; label: string; icon: React.ComponentType<{ className?: string }> }> = [
  { path: '/', label: 'Tavoli', icon: UtensilsCrossed },
  { path: '/cassa', label: 'Cassa', icon: Receipt },
  { path: '/turno', label: 'Turno', icon: Clock },
  { path: '/turno/qr', label: 'QR', icon: QrCode },
  { path: '/storico', label: 'Storico', icon: History },
];

export function StaffShell({
  currentPath,
  onNavigate,
  onLogout,
  bridge,
  shift,
  pendingJobsCount,
  children,
}: StaffShellProps) {
  const bridgeColor =
    bridge.status === 'online'
      ? 'bg-emerald-600'
      : bridge.status === 'warning'
        ? 'bg-amber-500'
        : 'bg-red-600';

  const bridgeLabel =
    bridge.status === 'online'
      ? 'Stampante Online'
      : bridge.status === 'warning'
        ? 'Stampante Lenta'
        : 'Stampante Offline';

  return (
    <div className="min-h-screen flex flex-col bg-[#F7F6F3] text-[#141413]">
      {/* Top Bar strictly following 3-zone contract */}
      <header className="no-print sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-[#E4E2DC]">
        <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-8">
          {/* Zone 1: Brand wordmark */}
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="font-[var(--font-display)] text-2xl font-bold tracking-tight text-[#141413] whitespace-nowrap shrink-0 flex items-center gap-2"
          >
            <span className="inline-block w-2.5 h-5 bg-[#D9231F] rounded-sm" aria-hidden="true" />
            PIT STOP 2.0
          </a>

          {/* Zone 2: Desktop nav links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            {NAV_ITEMS.map((item) => {
              const active = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.path);
                  }}
                  className={`py-1 whitespace-nowrap shrink-0 border-b-2 transition-colors ${
                    active
                      ? 'border-[#D9231F] text-[#141413] font-semibold'
                      : 'border-transparent text-[#64625B] hover:text-[#141413]'
                  }`}
                >
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* Zone 3: Primary live telemetry + lock action */}
          <div className="flex items-center gap-3 shrink-0">
            <div
              title={
                bridge.lastError
                  ? `Errore: ${bridge.lastError}`
                  : bridge.printerHost
                    ? `Bridge: ${bridge.printerHost}`
                    : 'In attesa di connessione bridge'
              }
              className="flex items-center gap-2 text-xs font-medium text-[#141413] whitespace-nowrap"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${bridgeColor}`} aria-hidden="true" />
              <Printer className="w-3.5 h-3.5 text-[#64625B] hidden sm:block" />
              <span className="hidden sm:inline">{bridgeLabel}</span>
              <span className="sm:hidden">{bridge.status === 'online' ? 'Online' : bridge.status === 'warning' ? 'Lenta' : 'Offline'}</span>
              {pendingJobsCount > 0 && (
                <span className="text-[#D9231F] font-mono tabular-nums">({pendingJobsCount})</span>
              )}
            </div>

            <span className="text-[#E4E2DC] hidden sm:inline" aria-hidden="true">|</span>

            <span className={`text-xs font-medium hidden lg:inline whitespace-nowrap ${shift.isOpen ? 'text-emerald-700' : 'text-red-700'}`}>
              {shift.isOpen ? 'Turno Aperto' : 'Turno Chiuso'}
            </span>

            <button
              type="button"
              onClick={onLogout}
              title="Blocca con PIN"
              className="min-h-[40px] px-3 py-1.5 rounded-lg border border-[#E4E2DC] hover:bg-[#F7F6F3] text-xs font-medium text-[#141413] flex items-center gap-1.5 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Blocca</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 py-5 pb-24 md:pb-8">
        {children}
      </main>

      {/* Mobile Bottom Thumb-Zone Navigation (height 60px, <15% viewport cap) */}
      <nav
        aria-label="Menu rapido mobile"
        className="no-print md:hidden fixed bottom-0 left-0 right-0 z-40 h-15 bg-white/95 backdrop-blur-md border-t border-[#E4E2DC] grid grid-cols-5 items-center"
      >
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = currentPath === item.path;
          return (
            <button
              key={item.path}
              type="button"
              onClick={() => onNavigate(item.path)}
              className={`h-full min-h-[44px] flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                active ? 'text-[#D9231F] font-semibold' : 'text-[#64625B]'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[11px] leading-none">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
