#!/bin/bash
cd "$(dirname "$0")"
if [ ! -f "config.env" ]; then
  echo "ATTENZIONE: File config.env non trovato!"
  echo "Copia config.env.example in config.env e compila SERVER_URL, BRIDGE_TOKEN e IP stampante."
  read -p "Premi Invio per chiudere..."
  exit 1
fi
echo "Avvio Pit Stop 2.0 Bridge Stampante..."
node bridge.mjs
read -p "Bridge terminato. Premi Invio per chiudere..."
