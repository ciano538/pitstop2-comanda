import type { Lang } from './types';

export const CUSTOMER_I18N: Record<
  Lang,
  {
    brandTag: string;
    tableLabel: string;
    shiftClosedTitle: string;
    shiftClosedBody: string;
    tableClosedTitle: string;
    tableClosedBody: string;
    invalidQrTitle: string;
    invalidQrBody: string;
    allergyTitle: string;
    allergyBody: string;
    sessionCodeLabel: string;
    sessionCodeHint: string;
    sessionCodePlaceholder: string;
    coversLabel: string;
    searchPlaceholder: string;
    allCategories: string;
    add: string;
    customize: string;
    optionsTitle: string;
    quickNotesTitle: string;
    customNoteLabel: string;
    customNotePlaceholder: string;
    confirmAdd: string;
    cartTitle: string;
    emptyCart: string;
    generalNoteLabel: string;
    generalNotePlaceholder: string;
    sendOrder: string;
    sendingOrder: string;
    orderSentTitle: string;
    orderSentBody: string;
    orderMore: string;
    totalLabel: string;
    tableTotalSoFar: string;
    itemsCount: string;
    requiredOptionError: string;
    codeError: string;
    rateLimitError: string;
    kitchenTag: string;
    barTag: string;
    allergensPrefix: string;
    remove: string;
  }
> = {
  it: {
    brandTag: 'Ordina dal tuo tavolo',
    tableLabel: 'Tavolo',
    shiftClosedTitle: 'Servizio momentaneamente chiuso',
    shiftClosedBody: 'Il turno non è ancora stato aperto dal personale. Rivolgiti al cameriere per ordinare.',
    tableClosedTitle: 'Tavolo non ancora attivo',
    tableClosedBody: 'Chiedi al cameriere di aprire il tavolo e fornirti il codice di 4 cifre per ordinare dal telefono.',
    invalidQrTitle: 'QR non valido o scaduto',
    invalidQrBody: 'La firma di sicurezza del QR non corrisponde. Scansiona il QR presente sul tavolo o chiama il personale.',
    allergyTitle: 'Avviso Allergie e Intolleranze',
    allergyBody: 'Prima di ordinare, segnala sempre eventuali allergie o intolleranze nelle note o direttamente al personale di sala (glutine, lattosio, frutta a guscio, crostacei, uova, sesamo).',
    sessionCodeLabel: 'Codice tavolo (4 cifre)',
    sessionCodeHint: 'Chiedi o leggi il codice di 4 cifre fornito all’apertura del tavolo.',
    sessionCodePlaceholder: 'Es. 4821',
    coversLabel: 'Persone al tavolo',
    searchPlaceholder: 'Cerca pizza, piatto o bibita...',
    allCategories: 'Tutte',
    add: 'Aggiungi',
    customize: 'Opzioni',
    optionsTitle: 'Scegli variante',
    quickNotesTitle: 'Note rapide',
    customNoteLabel: 'Nota personale per questo piatto',
    customNotePlaceholder: 'Es. senza origano, ben cotta...',
    confirmAdd: 'Aggiungi alla comanda',
    cartTitle: 'La tua comanda',
    emptyCart: 'Seleziona i piatti dal menu per iniziare.',
    generalNoteLabel: 'Nota generale per cucina/bar',
    generalNotePlaceholder: 'Es. portare tutto insieme, allergia alle noci...',
    sendOrder: 'Invia comanda in cucina',
    sendingOrder: 'Invio in corso...',
    orderSentTitle: 'Comanda inviata!',
    orderSentBody: 'La tua comanda è stata ricevuta e stampata subito in cucina e al bar. Puoi continuare a ordinare durante la serata.',
    orderMore: 'Ordina ancora',
    totalLabel: 'Totale invio',
    tableTotalSoFar: 'Conto tavolo attuale',
    itemsCount: 'articoli',
    requiredOptionError: 'Seleziona un’opzione obbligatoria.',
    codeError: 'Inserisci il codice tavolo di 4 cifre corretto.',
    rateLimitError: 'Attendi qualche secondo prima di inviare una nuova comanda.',
    kitchenTag: 'Cucina',
    barTag: 'Bar',
    allergensPrefix: 'Allergeni',
    remove: 'Rimuovi',
  },
  en: {
    brandTag: 'Order from your table',
    tableLabel: 'Table',
    shiftClosedTitle: 'Service currently closed',
    shiftClosedBody: 'The shift has not been opened by staff yet. Please ask your waiter to place an order.',
    tableClosedTitle: 'Table not active yet',
    tableClosedBody: 'Please ask your waiter to open this table and give you the 4-digit table code to order from your phone.',
    invalidQrTitle: 'Invalid or expired QR code',
    invalidQrBody: 'The table QR security signature could not be verified. Please scan the card on your table or ask staff.',
    allergyTitle: 'Allergies & Intolerances Notice',
    allergyBody: 'Before ordering, please always report any food allergies or intolerances in the notes or directly to our staff (gluten, dairy, nuts, shellfish, eggs, sesame).',
    sessionCodeLabel: '4-digit table code',
    sessionCodeHint: 'Enter the 4-digit code provided by staff when your table was opened.',
    sessionCodePlaceholder: 'e.g. 4821',
    coversLabel: 'Guests at table',
    searchPlaceholder: 'Search pizza, dishes or drinks...',
    allCategories: 'All',
    add: 'Add',
    customize: 'Options',
    optionsTitle: 'Choose option',
    quickNotesTitle: 'Quick notes',
    customNoteLabel: 'Special request for this item',
    customNotePlaceholder: 'e.g. well done, no oregano...',
    confirmAdd: 'Add to order',
    cartTitle: 'Your order',
    emptyCart: 'Tap items from the menu to build your order.',
    generalNoteLabel: 'General note for kitchen / bar',
    generalNotePlaceholder: 'e.g. serve all together, nut allergy...',
    sendOrder: 'Send order now',
    sendingOrder: 'Sending...',
    orderSentTitle: 'Order received!',
    orderSentBody: 'Your order has been printed immediately at the kitchen and bar. You can place additional orders anytime tonight.',
    orderMore: 'Order more',
    totalLabel: 'Order total',
    tableTotalSoFar: 'Current table total',
    itemsCount: 'items',
    requiredOptionError: 'Please choose a required option.',
    codeError: 'Please enter the valid 4-digit table code.',
    rateLimitError: 'Please wait a few seconds before sending another order.',
    kitchenTag: 'Kitchen',
    barTag: 'Bar',
    allergensPrefix: 'Allergens',
    remove: 'Remove',
  },
  de: {
    brandTag: 'Direkt am Tisch bestellen',
    tableLabel: 'Tisch',
    shiftClosedTitle: 'Service derzeit geschlossen',
    shiftClosedBody: 'Die Schicht wurde vom Personal noch nicht eröffnet. Bitte wenden Sie sich an Ihren Kellner.',
    tableClosedTitle: 'Tisch noch nicht freigeschaltet',
    tableClosedBody: 'Bitte bitten Sie das Personal, Ihren Tisch zu öffnen und Ihnen den 4-stelligen Tischcode zu nennen.',
    invalidQrTitle: 'Ungültiger QR-Code',
    invalidQrBody: 'Die Sicherheitssignatur des QR-Codes ist ungültig. Bitte scannen Sie den Code auf Ihrem Tisch erneut.',
    allergyTitle: 'Hinweis zu Allergien & Unverträglichkeiten',
    allergyBody: 'Bitte geben Sie Allergien oder Unverträglichkeiten immer in den Notizen an oder informieren Sie direkt unser Personal (Gluten, Laktose, Schalenfrüchte, Krebstiere, Eier, Sesam).',
    sessionCodeLabel: '4-stelliger Tischcode',
    sessionCodeHint: 'Geben Sie den 4-stelligen Code ein, den Sie bei der Tischöffnung erhalten haben.',
    sessionCodePlaceholder: 'z. B. 4821',
    coversLabel: 'Personen am Tisch',
    searchPlaceholder: 'Pizza, Gericht oder Getränk suchen...',
    allCategories: 'Alle',
    add: 'Hinzufügen',
    customize: 'Optionen',
    optionsTitle: 'Variante wählen',
    quickNotesTitle: 'Schnellnotizen',
    customNoteLabel: 'Sonderwunsch für dieses Gericht',
    customNotePlaceholder: 'z. B. gut durchgebacken, ohne Oregano...',
    confirmAdd: 'Zur Bestellung hinzufügen',
    cartTitle: 'Ihre Bestellung',
    emptyCart: 'Wählen Sie Speisen oder Getränke aus dem Menü.',
    generalNoteLabel: 'Allgemeiner Hinweis für Küche / Bar',
    generalNotePlaceholder: 'z. B. alles zusammen servieren, Nussallergie...',
    sendOrder: 'Bestellung absenden',
    sendingOrder: 'Wird gesendet...',
    orderSentTitle: 'Bestellung gesendet!',
    orderSentBody: 'Ihre Bestellung wurde sofort in Küche und Bar gedruckt. Sie können den ganzen Abend über nachbestellen.',
    orderMore: 'Weiter bestellen',
    totalLabel: 'Bestellsumme',
    tableTotalSoFar: 'Aktueller Tischbetrag',
    itemsCount: 'Artikel',
    requiredOptionError: 'Bitte wählen Sie eine Pflichtoption aus.',
    codeError: 'Bitte geben Sie den gültigen 4-stelligen Tischcode ein.',
    rateLimitError: 'Bitte warten Sie einige Sekunden vor der nächsten Bestellung.',
    kitchenTag: 'Küche',
    barTag: 'Bar',
    allergensPrefix: 'Allergene',
    remove: 'Entfernen',
  },
};
