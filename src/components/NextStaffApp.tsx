'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import type { AppStateResponse } from '../shared/types';
import { PinGate } from './PinGate';
import { StaffShell, type StaffRoute } from './StaffShell';
import { StaffHomeView } from './StaffHomeView';
import { CashierView } from './CashierView';
import { ShiftView } from './ShiftView';
import { QrPrintView } from './QrPrintView';
import { HistoryView } from './HistoryView';

export function NextStaffApp({ currentPath }: { currentPath: StaffRoute }) {
  const router = useRouter();
  const [authenticated, setAuthenticated] = useState<boolean | null>(null);
  const [appState, setAppState] = useState<AppStateResponse | null>(null);

  const fetchState = useCallback(async () => {
    try {
      const res = await fetch('/api/state', { cache: 'no-store' });
      if (res.status === 401) {
        setAuthenticated(false);
        return;
      }
      if (res.ok) {
        const data = (await res.json()) as AppStateResponse;
        setAppState(data);
        setAuthenticated(true);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchState();
    const timer = setInterval(fetchState, 5000);
    return () => clearInterval(timer);
  }, [fetchState]);

  const handleNavigate = (path: StaffRoute) => {
    router.push(path);
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
    setAuthenticated(false);
    setAppState(null);
  };

  if (authenticated === false) {
    return <PinGate onSuccess={fetchState} />;
  }

  if (authenticated === null || !appState) {
    return (
      <div className="min-h-screen bg-[#F7F6F3] flex items-center justify-center text-sm text-[#64625B]">
        Caricamento Pit Stop 2.0...
      </div>
    );
  }

  return (
    <StaffShell
      currentPath={currentPath}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      bridge={appState.bridge}
      shift={appState.shift}
      pendingJobsCount={appState.pendingJobsCount}
    >
      {currentPath === '/' && (
        <StaffHomeView
          shift={appState.shift}
          tables={appState.tables}
          onRefresh={fetchState}
          onNavigate={handleNavigate}
        />
      )}
      {currentPath === '/cassa' && (
        <CashierView shift={appState.shift} tables={appState.tables} onRefresh={fetchState} />
      )}
      {currentPath === '/turno' && (
        <ShiftView
          shift={appState.shift}
          bridge={appState.bridge}
          pendingJobsCount={appState.pendingJobsCount}
          storageMode={appState.storageMode}
          storageWarning={appState.storageWarning}
          showZipExport={false}
          onRefresh={fetchState}
          onNavigate={handleNavigate}
        />
      )}
      {currentPath === '/turno/qr' && (
        <QrPrintView tables={appState.tables} onNavigate={handleNavigate} />
      )}
      {currentPath === '/storico' && <HistoryView />}
    </StaffShell>
  );
}
