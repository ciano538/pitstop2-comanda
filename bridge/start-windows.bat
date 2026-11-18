@echo off
title Pit Stop 2.0 - Bridge Stampante
cd /d "%~dp0"
if not exist "config.env" (
  echo ATTENZIONE: File config.env non trovato!
  echo Copia config.env.example in config.env e inserisci SERVER_URL, BRIDGE_TOKEN e IP stampante.
  pause
  exit /b 1
)
echo Avvio Pit Stop 2.0 Bridge Stampante...
node bridge.mjs
pause
