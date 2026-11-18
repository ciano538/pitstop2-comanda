# Pit Stop 2.0 — Sistema Comande Pizzeria

Web app mobile-first per la gestione delle comande ai tavoli della pizzeria **Pit Stop 2.0**, con menu multilingua (**IT / EN / DE**) da QR al tavolo, gestione turno e cassa, e stampa termica automatica **Epson TM (ESC/POS CP858)** tramite bridge locale.

---

## Architettura

- **Frontend & API**: Next.js 14 (App Router, TypeScript, Tailwind CSS) pronto per deploy su **Vercel** (`comande.pitstop2.it`).
- **Archivio Condiviso**: **Upstash Redis (REST API)** per stato turno, 15 tavoli, storico giornaliero e coda di stampa, con fallback automatico in memoria per sviluppo locale.
- **Bridge Stampante (`bridge/bridge.mjs`)**: Micro-servizio Node.js nella pizzeria che legge la coda su Redis tramite il server ogni 2,5 secondi, stampa su Epson TM (TCP porta `9100` o coda di sistema) e invia conferma (`ack`) + heartbeat.

---

## Pagine Principali

| Percorso | Funzione | Accesso |
| :--- | :--- | :--- |
| `/` | Home Cameriere: griglia 15 tavoli + invio comande rapido (apre tavolo in automatico) | PIN Staff |
| `/cassa` | Apertura tavoli (genera codice 4 cifre), riepilogo conti, stampa conto non fiscale e chiusura tavolo | PIN Staff |
| `/turno` | Apertura/chiusura turno (chiusura automatica dopo 14h), stato stampante Bridge, export ZIP GitHub | PIN Staff |
| `/turno/qr` | Stampa fogli QR per i 15 tavoli (2 card per riga su A4) con firma HMAC | PIN Staff |
| `/storico` | Comande e scontrini di oggi, ristampa immediata e **Prova Stampa** | PIN Staff |
| `/t/N?k=...` | Menu Cliente dal QR (IT/EN/DE), avviso allergie, codice tavolo 4 cifre, note e invio | Pubblico (QR firmato + codice 4 cifre) |

---

## Installazione & Deploy su Vercel (`comande.pitstop2.it`)

### 1. Crea database Upstash Redis
1. Crea un account gratuito su [Upstash Console](https://console.upstash.com/).
2. Crea un nuovo database **Redis** (regione consigliata: `eu-central-1` Francoforte o Milano/EU).
3. Copia `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`.

### 2. Carica il progetto su GitHub e Vercel
1. Scarica lo ZIP dal pannello `/turno` (oppure clona questo repository).
2. Carica i file su un repository GitHub privato.
3. Su **Vercel**, importa il repository GitHub e configura le seguenti **Environment Variables**:

```env
UPSTASH_REDIS_REST_URL="https://...upstash.io"
UPSTASH_REDIS_REST_TOKEN="AX..."
STAFF_PIN="1234"
TABLE_SECRET="stringa-casuale-lunga-almeno-32-caratteri"
BRIDGE_TOKEN="token-segreto-condiviso-con-la-pizzeria"
PRINT_COLS="48"
APP_URL="https://comande.pitstop2.it"
```

4. Esegui il **Deploy**.
5. In **Vercel -> Settings -> Domains**, aggiungi `comande.pitstop2.it` e imposta il record DNS CNAME indicato dal tuo provider verso `cname.vercel-dns.com`.

---

## Configurazione Stampante in Pizzeria (Bridge Epson TM)

Il PC della cassa/cucina (Windows o Mac) deve avere **Node.js 18 o superiore** installato.

1. Copia la cartella `bridge/` sul PC della pizzeria.
2. Duplica `bridge/config.env.example` e rinominalo in `bridge/config.env`.
3. Modifica `bridge/config.env`:
   - `SERVER_URL="https://comande.pitstop2.it"`
   - `BRIDGE_TOKEN="..."` (uguale a quello su Vercel)
   - `PRINT_MODE="tcp"` (oppure `"spooler"` se collegata via USB e condivisa nel sistema operativo)
   - `PRINTER_KITCHEN_HOST="192.168.1.100"` (IP statico della Epson TM sulla rete locale)
   - `PRINTER_PORT="9100"`

### Test e Avvio su Windows
- **Test stampa**: doppio clic su `bridge/test-windows.bat`
- **Avvio servizio**: doppio clic su `bridge/start-windows.bat` (lascia la finestra aperta durante il servizio)

### Test e Avvio su Mac
- Al primo utilizzo da Terminale rendi eseguibili gli script: `chmod +x bridge/*.command`
- **Test stampa**: doppio clic su `bridge/test-mac.command`
- **Avvio servizio**: doppio clic su `bridge/start-mac.command`

---

## Sicurezza & Anti-Abuso

- **Turno & Tavoli**: i clienti possono ordinare solo se il turno è aperto, il tavolo è aperto, la firma `?k=` del QR è valida e inseriscono il **codice di 4 cifre** generato all'apertura del tavolo (che cambia a ogni nuovo tavolo).
- **Rate Limit**: max 1 invio ogni **15 secondi** per tavolo, **8 ogni 10 minuti** per tavolo, **25 ogni 10 minuti** per rete/IP.
- **Anti doppio invio**: deduplicazione automatica tramite `clientId` univoco.
- **Auto-chiusura 14h**: turno e tavoli dimenticati aperti si chiudono automaticamente dopo 14 ore.
