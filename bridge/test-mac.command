#!/bin/bash
cd "$(dirname "$0")"
if [ ! -f "config.env" ]; then
  echo "ATTENZIONE: File config.env non trovato!"
  echo "Copia config.env.example in config.env prima di eseguire il test."
  read -p "Premi Invio per chiudere..."
  exit 1
fi
node bridge.mjs --test
read -p "Test completato. Premi Invio per chiudere..."
