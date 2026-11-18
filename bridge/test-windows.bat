@echo off
title Pit Stop 2.0 - Test Stampante
cd /d "%~dp0"
if not exist "config.env" (
  echo ATTENZIONE: File config.env non trovato!
  echo Copia config.env.example in config.env prima di eseguire il test.
  pause
  exit /b 1
)
node bridge.mjs --test
pause
