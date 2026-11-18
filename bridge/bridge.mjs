#!/usr/bin/env node
/**
 * Pit Stop 2.0 — Bridge Locale Stampante Termica Epson TM (ESC/POS CP858)
 *
 * Funzionamento:
 * 1. Legge config.env nella stessa cartella
 * 2. Interroga ogni 2,5 secondi GET /api/bridge/jobs con Bearer BRIDGE_TOKEN
 * 3. Stampa i job pendenti via TCP porta 9100 oppure coda di sistema (spooler)
 * 4. Conferma la stampa con POST /api/bridge/ack
 *
 * Uso test locale: node bridge.mjs --test
 */

import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CONFIG_PATH = path.join(__dirname, 'config.env');

function loadEnvFile(filePath) {
  const env = {};
  if (!fs.existsSync(filePath)) {
    return env;
  }
  const lines = fs.readFileSync(filePath, 'utf8').split(/\r?\n/);
  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim();
    let val = line.slice(eq + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    env[key] = val;
  }
  return env;
}

const fileEnv = loadEnvFile(CONFIG_PATH);
const cfg = {
  SERVER_URL: (process.env.SERVER_URL || fileEnv.SERVER_URL || 'https://comande.pitstop2.it').replace(/\/$/, ''),
  BRIDGE_TOKEN: process.env.BRIDGE_TOKEN || fileEnv.BRIDGE_TOKEN || '',
  PRINTER_KITCHEN_HOST: process.env.PRINTER_KITCHEN_HOST || fileEnv.PRINTER_KITCHEN_HOST || '192.168.1.100',
  PRINTER_BAR_HOST: process.env.PRINTER_BAR_HOST || fileEnv.PRINTER_BAR_HOST || '',
  PRINTER_CASHIER_HOST: process.env.PRINTER_CASHIER_HOST || fileEnv.PRINTER_CASHIER_HOST || '',
  PRINTER_PORT: Number(process.env.PRINTER_PORT || fileEnv.PRINTER_PORT || 9100),
  PRINT_MODE: (process.env.PRINT_MODE || fileEnv.PRINT_MODE || 'tcp').toLowerCase(), // 'tcp' | 'spooler'
  SYSTEM_PRINTER_NAME: process.env.SYSTEM_PRINTER_NAME || fileEnv.SYSTEM_PRINTER_NAME || 'EPSON_TM',
  POLL_INTERVAL_MS: Number(process.env.POLL_INTERVAL_MS || fileEnv.POLL_INTERVAL_MS || 2500),
};

function resolveHostForType(jobType) {
  if (jobType === 'BAR' && cfg.PRINTER_BAR_HOST) return cfg.PRINTER_BAR_HOST;
  if ((jobType === 'CASSA' || jobType === 'CONTO') && cfg.PRINTER_CASHIER_HOST) return cfg.PRINTER_CASHIER_HOST;
  return cfg.PRINTER_KITCHEN_HOST;
}

function sendViaTcp(host, port, buffer) {
  return new Promise((resolve, reject) => {
    const socket = new net.Socket();
    let settled = false;
    socket.setTimeout(5000);

    socket.on('timeout', () => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(new Error(`Timeout connessione stampante TCP ${host}:${port}`));
    });

    socket.on('error', (err) => {
      if (settled) return;
      settled = true;
      socket.destroy();
      reject(new Error(`Errore TCP ${host}:${port} - ${err.message}`));
    });

    socket.connect(port, host, () => {
      socket.write(buffer, (writeErr) => {
        if (writeErr) {
          if (!settled) {
            settled = true;
            socket.destroy();
            reject(writeErr);
          }
          return;
        }
        socket.end();
        if (!settled) {
          settled = true;
          resolve();
        }
      });
    });
  });
}

function sendViaSpooler(printerName, buffer) {
  return new Promise((resolve, reject) => {
    const tmpFile = path.join(os.tmpdir(), `pitstop2-${Date.now()}-${Math.random().toString(16).slice(2)}.bin`);
    fs.writeFileSync(tmpFile, buffer);

    const cleanup = () => {
      try {
        fs.unlinkSync(tmpFile);
      } catch {
        // ignore
      }
    };

    if (process.platform === 'win32') {
      // Invia file binario alla coda stampante condivisa Windows (es. \\localhost\EPSON_TM o nome stampante)
      const psScript = `
        $bytes = [System.IO.File]::ReadAllBytes('${tmpFile.replace(/'/g, "''")}');
        $port = New-Object System.IO.Ports.SerialPort;
        Copy-Item -Path '${tmpFile.replace(/'/g, "''")}' -Destination '\\\\localhost\\${printerName.replace(/'/g, "''")}' -Force;
      `;
      execFile('powershell.exe', ['-NoProfile', '-Command', psScript], (err, _stdout, stderr) => {
        cleanup();
        if (err) {
          reject(new Error(`Errore spooler Windows (${printerName}): ${stderr || err.message}`));
        } else {
          resolve();
        }
      });
    } else {
      // macOS / Linux CUPS raw queue
      execFile('lp', ['-d', printerName, '-o', 'raw', tmpFile], (err, _stdout, stderr) => {
        cleanup();
        if (err) {
          reject(new Error(`Errore CUPS lp (${printerName}): ${stderr || err.message}`));
        } else {
          resolve();
        }
      });
    }
  });
}

async function printBuffer(jobType, buffer) {
  if (cfg.PRINT_MODE === 'spooler') {
    await sendViaSpooler(cfg.SYSTEM_PRINTER_NAME, buffer);
  } else {
    const host = resolveHostForType(jobType);
    await sendViaTcp(host, cfg.PRINTER_PORT, buffer);
  }
}

function buildLocalDiagnosticEscPos() {
  const bytes = [
    0x1b, 0x40,       // ESC @
    0x1b, 0x74, 19,   // CP858
    0x1b, 0x61, 1,    // Center
    0x1d, 0x21, 0x11, // Double W+H
    ...Buffer.from('PIT STOP 2.0\n', 'ascii'),
    0x1d, 0x21, 0x00, // Normal
    ...Buffer.from('TEST LOCALE BRIDGE OK\n', 'ascii'),
    ...Buffer.from(`Modalita: ${cfg.PRINT_MODE.toUpperCase()}\n`, 'ascii'),
    ...Buffer.from(`Host: ${cfg.PRINTER_KITCHEN_HOST}:${cfg.PRINTER_PORT}\n`, 'ascii'),
    ...Buffer.from('Accenti CP858: ', 'ascii'),
    0x85, 0x20, 0x8a, 0x20, 0x82, 0x20, 0xd5, 0x0a, // à è é €
    0x0a, 0x0a, 0x0a,
    0x1d, 0x56, 66, 12, // Partial cut
  ];
  return Buffer.from(bytes);
}

async function runSelfTest() {
  console.log('=== PIT STOP 2.0 BRIDGE — TEST STAMPA ===');
  console.log(`Modalita: ${cfg.PRINT_MODE}`);
  if (cfg.PRINT_MODE === 'tcp') {
    console.log(`Target TCP: ${cfg.PRINTER_KITCHEN_HOST}:${cfg.PRINTER_PORT}`);
  } else {
    console.log(`Stampante di sistema: ${cfg.SYSTEM_PRINTER_NAME}`);
  }

  try {
    await printBuffer('TEST', buildLocalDiagnosticEscPos());
    console.log('[OK] Scontrino di prova inviato con successo alla stampante!');
  } catch (err) {
    console.error('[ERRORE] Impossibile stampare in locale:', err.message);
    process.exitCode = 1;
  }

  if (cfg.SERVER_URL && cfg.BRIDGE_TOKEN) {
    try {
      const res = await fetch(`${cfg.SERVER_URL}/api/bridge/heartbeat`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.BRIDGE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          printerHost: cfg.PRINT_MODE === 'tcp' ? `${cfg.PRINTER_KITCHEN_HOST}:${cfg.PRINTER_PORT}` : cfg.SYSTEM_PRINTER_NAME,
          mode: cfg.PRINT_MODE,
          lastError: null,
        }),
      });
      if (res.ok) {
        console.log(`[OK] Connessione al server ${cfg.SERVER_URL} verificata!`);
      } else {
        console.error(`[WARN] Server risponde HTTP ${res.status} (controlla BRIDGE_TOKEN).`);
      }
    } catch (err) {
      console.error(`[ERRORE] Server non raggiungibile (${cfg.SERVER_URL}):`, err.message);
    }
  }
}

let lastErrorReported = null;

async function pollOnce() {
  const qs = new URLSearchParams({
    printerHost: cfg.PRINT_MODE === 'tcp' ? `${cfg.PRINTER_KITCHEN_HOST}:${cfg.PRINTER_PORT}` : cfg.SYSTEM_PRINTER_NAME,
    mode: cfg.PRINT_MODE,
  });

  const res = await fetch(`${cfg.SERVER_URL}/api/bridge/jobs?${qs.toString()}`, {
    headers: {
      Authorization: `Bearer ${cfg.BRIDGE_TOKEN}`,
    },
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status} da /api/bridge/jobs`);
  }

  const data = await res.json();
  const jobs = Array.isArray(data.jobs) ? data.jobs : [];
  if (jobs.length === 0) return;

  const ackedIds = [];
  for (const job of jobs) {
    try {
      const rawBuf = Buffer.from(job.payloadBase64, 'base64');
      await printBuffer(job.type, rawBuf);
      ackedIds.push(job.id);
      lastErrorReported = null;
      console.log(`[STAMPATO] ${job.type} Tavolo ${job.tableNumber} (${job.id})`);
    } catch (err) {
      console.error(`[ERRORE STAMPA ${job.id}] ${err.message}`);
      lastErrorReported = err.message;
      // Report error on heartbeat
      await fetch(`${cfg.SERVER_URL}/api/bridge/ack`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${cfg.BRIDGE_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobIds: ackedIds, error: err.message }),
      }).catch(() => {});
      return;
    }
  }

  if (ackedIds.length > 0) {
    await fetch(`${cfg.SERVER_URL}/api/bridge/ack`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${cfg.BRIDGE_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ jobIds: ackedIds, error: null }),
    });
  }
}

async function main() {
  if (process.argv.includes('--test')) {
    await runSelfTest();
    return;
  }

  if (!cfg.BRIDGE_TOKEN) {
    console.error('ERRORE: BRIDGE_TOKEN mancante in config.env!');
    process.exit(1);
  }

  console.log('==============================================');
  console.log('  PIT STOP 2.0 — BRIDGE STAMPANTE ATTIVO');
  console.log(`  Server: ${cfg.SERVER_URL}`);
  console.log(`  Modalita: ${cfg.PRINT_MODE.toUpperCase()} (${cfg.PRINT_MODE === 'tcp' ? `${cfg.PRINTER_KITCHEN_HOST}:${cfg.PRINTER_PORT}` : cfg.SYSTEM_PRINTER_NAME})`);
  console.log(`  Intervallo polling: ${cfg.POLL_INTERVAL_MS} ms`);
  console.log('==============================================');

  const loop = async () => {
    try {
      await pollOnce();
    } catch (err) {
      if (lastErrorReported !== err.message) {
        console.error(`[RETE] ${err.message}`);
        lastErrorReported = err.message;
      }
    }
    setTimeout(loop, cfg.POLL_INTERVAL_MS);
  };

  loop();
}

main();
