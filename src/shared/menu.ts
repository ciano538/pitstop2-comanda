import type { MenuCategory, MenuItem, MenuOptionGroup, QuickNote } from './types';

export const WATER_OPTIONS: MenuOptionGroup[] = [
  {
    id: 'water-gas',
    label: { it: 'Tipologia', en: 'Type', de: 'Sorte' },
    required: true,
    choices: [
      { id: 'naturale', label: { it: 'Naturale', en: 'Still', de: 'Still' } },
      { id: 'frizzante', label: { it: 'Frizzante', en: 'Sparkling', de: 'Mit Kohlensäure' } },
    ],
  },
  {
    id: 'water-temp',
    label: { it: 'Temperatura', en: 'Temperature', de: 'Temperatur' },
    required: true,
    choices: [
      { id: 'fresca', label: { it: 'Fresca (da frigo)', en: 'Chilled', de: 'Gekühlt' } },
      { id: 'ambiente', label: { it: 'Temperatura ambiente', en: 'Room temperature', de: 'Zimmertemperatur' } },
    ],
  },
];

export const SOFT_DRINK_OPTIONS: MenuOptionGroup[] = [
  {
    id: 'ice-lemon',
    label: { it: 'Servizio', en: 'Serving', de: 'Servierart' },
    required: true,
    choices: [
      { id: 'ghiaccio-limone', label: { it: 'Con ghiaccio e limone', en: 'With ice & lemon', de: 'Mit Eis & Zitrone' } },
      { id: 'solo-ghiaccio', label: { it: 'Solo ghiaccio', en: 'Ice only', de: 'Nur mit Eis' } },
      { id: 'senza-ghiaccio', label: { it: 'Senza ghiaccio', en: 'No ice', de: 'Ohne Eis' } },
      { id: 'solo-limone', label: { it: 'Solo limone (no ghiaccio)', en: 'Lemon only (no ice)', de: 'Nur Zitrone (ohne Eis)' } },
    ],
  },
];

export const JUICE_FLAVOR_OPTIONS: MenuOptionGroup[] = [
  {
    id: 'juice-flavor',
    label: { it: 'Gusto Succo', en: 'Juice Flavor', de: 'Saftgeschmack' },
    required: true,
    choices: [
      { id: 'pesca', label: { it: 'Pesca', en: 'Peach', de: 'Pfirsich' } },
      { id: 'pera', label: { it: 'Pera', en: 'Pear', de: 'Birne' } },
      { id: 'albicocca', label: { it: 'Albicocca', en: 'Apricot', de: 'Aprikose' } },
      { id: 'ace', label: { it: 'ACE', en: 'ACE Multivitamin', de: 'ACE Multivitamin' } },
      { id: 'arancia', label: { it: 'Arancia Rossa', en: 'Blood Orange', de: 'Blutorange' } },
      { id: 'ananas', label: { it: 'Ananas', en: 'Pineapple', de: 'Ananas' } },
      { id: 'mela', label: { it: 'Mela', en: 'Apple', de: 'Apfel' } },
    ],
  },
];

export const MACCHIATO_OPTIONS: MenuOptionGroup[] = [
  {
    id: 'macchiato-temp',
    label: { it: 'Latte & Temperatura', en: 'Milk & Temperature', de: 'Milch & Temperatur' },
    required: true,
    choices: [
      { id: 'caldo', label: { it: 'Macchiato Caldo', en: 'Hot milk', de: 'Warme Milch' } },
      { id: 'freddo', label: { it: 'Macchiato Freddo', en: 'Cold milk', de: 'Kalte Milch' } },
      { id: 'senza-lattosio', label: { it: 'Latte Senza Lattosio', en: 'Lactose-free milk', de: 'Laktosefreie Milch' } },
      { id: 'soia', label: { it: 'Latte di Soia', en: 'Soy milk', de: 'Sojamilch' } },
    ],
  },
  {
    id: 'coffee-caffeine',
    label: { it: 'Miscela', en: 'Blend', de: 'Mischung' },
    required: true,
    choices: [
      { id: 'normale', label: { it: 'Normale', en: 'Regular', de: 'Normal' } },
      { id: 'dek', label: { it: 'Decaffeinato', en: 'Decaf', de: 'Entkoffeiniert' } },
    ],
  },
];

export const DRAFT_BEER_OPTIONS: MenuOptionGroup[] = [
  {
    id: 'beer-size',
    label: { it: 'Formato', en: 'Size', de: 'Größe' },
    required: true,
    choices: [
      { id: 'piccola', label: { it: 'Piccola 0,2L', en: 'Small 0.2L', de: 'Klein 0,2L' }, priceDelta: -1.5 },
      { id: 'media', label: { it: 'Media 0,4L', en: 'Medium 0.4L', de: 'Mittel 0,4L' }, priceDelta: 0 },
      { id: 'caraffa', label: { it: 'Caraffa 1L', en: 'Pitcher 1L', de: 'Krug 1L' }, priceDelta: 6.0 },
    ],
  },
];

export const WINE_SERVE_OPTIONS: MenuOptionGroup[] = [
  {
    id: 'wine-size',
    label: { it: 'Formato', en: 'Size', de: 'Größe' },
    required: true,
    choices: [
      { id: 'calice', label: { it: 'Calice', en: 'Glass', de: 'Glas' }, priceDelta: 0 },
      { id: 'quartino', label: { it: 'Quartino 0,25L', en: 'Carafe 0.25L', de: 'Karaffe 0,25L' }, priceDelta: 2.5 },
      { id: 'mezzo', label: { it: 'Caraffa 0,5L', en: 'Carafe 0.5L', de: 'Karaffe 0,5L' }, priceDelta: 6.0 },
      { id: 'bottiglia', label: { it: 'Bottiglia 0,75L', en: 'Bottle 0.75L', de: 'Flasche 0,75L' }, priceDelta: 11.0 },
    ],
  },
];

export const QUICK_NOTES: QuickNote[] = [
  { id: 'no-cipolla', department: 'CUCINA', label: { it: 'Senza cipolla', en: 'No onion', de: 'Ohne Zwiebeln' } },
  { id: 'ben-cotta', department: 'CUCINA', label: { it: 'Ben cotta', en: 'Well done', de: 'Gut durchgebacken' } },
  { id: 'poca-mozzarella', department: 'CUCINA', label: { it: 'Poca mozzarella', en: 'Light mozzarella', de: 'Wenig Mozzarella' } },
  { id: 'senza-mozzarella', department: 'CUCINA', label: { it: 'Senza mozzarella', en: 'No mozzarella', de: 'Ohne Mozzarella' } },
  { id: 'no-origano', department: 'CUCINA', label: { it: 'Senza origano', en: 'No oregano', de: 'Ohne Oregano' } },
  { id: 'tagliata', department: 'CUCINA', label: { it: 'Tagliata a spicchi', en: 'Pre-sliced', de: 'Vorgeschnitten' } },
  { id: 'senza-piccante', department: 'CUCINA', label: { it: 'Poco piccante', en: 'Mild spice', de: 'Wenig scharf' } },
  { id: 'extra-piccante', department: 'CUCINA', label: { it: 'Extra piccante', en: 'Extra spicy', de: 'Extra scharf' } },
  { id: 'senza-ghiaccio', department: 'BAR', label: { it: 'Senza ghiaccio', en: 'No ice', de: 'Ohne Eis' } },
  { id: 'con-limone', department: 'BAR', label: { it: 'Con fettina di limone', en: 'With lemon slice', de: 'Mit Zitronenscheibe' } },
  { id: 'vetro-lungo', department: 'BAR', label: { it: 'In tazza grande', en: 'Large cup', de: 'Große Tasse' } },
  { id: 'subito', department: 'ALL', label: { it: 'Portare subito', en: 'Bring immediately', de: 'Sofort bringen' } },
];

export const MENU_CATEGORIES: MenuCategory[] = [
  // 1 - ANTIPASTI (CUCINA)
  {
    id: 'cat-01-antipasti',
    order: 1,
    department: 'CUCINA',
    name: { it: 'Antipasti', en: 'Starters', de: 'Vorspeisen' },
    items: [
      {
        id: 'ant-bruschetta',
        categoryId: 'cat-01-antipasti',
        name: { it: 'Bruschetta Classica (4 pz)', en: 'Classic Bruschetta (4 pcs)', de: 'Klassische Bruschetta (4 Stk.)' },
        description: {
          it: 'Pane casereccio tostato con pomodorini freschi, aglio, basilico e olio EVO',
          en: 'Toasted country bread with cherry tomatoes, garlic, basil and extra virgin olive oil',
          de: 'Geröstetes Landbrot mit Kirschtomaten, Knoblauch, Basilikum und Olivenöl',
        },
        price: 6.5,
        allergens: ['Glutine'],
      },
      {
        id: 'ant-caprese',
        categoryId: 'cat-01-antipasti',
        name: { it: 'Caprese di Bufala', en: 'Buffalo Mozzarella Caprese', de: 'Caprese mit Büffelmozzarella' },
        description: {
          it: 'Mozzarella di bufala campana DOP, pomodoro cuore di bue, origano e basilico',
          en: 'Campania DOP buffalo mozzarella, beefsteak tomatoes, oregano and basil',
          de: 'Büffelmozzarella DOP, Fleischtomaten, Oregano und frisches Basilikum',
        },
        price: 10.0,
        allergens: ['Lattosio'],
      },
      {
        id: 'ant-tagliere',
        categoryId: 'cat-01-antipasti',
        name: { it: 'Tagliere Pit Stop (x2)', en: 'Pit Stop Platter (for 2)', de: 'Pit Stop Platte (für 2 Pers.)' },
        description: {
          it: 'Prosciutto crudo di Parma, salame nostrano, coppa, grana, olive e focaccina calda',
          en: 'Parma ham, local salami, coppa, Grana Padano, olives and warm focaccia',
          de: 'Parmaschinken, Salami, Coppa, Grana Padano, Oliven und warme Focaccia',
        },
        price: 18.0,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'ant-prosciutto-melone',
        categoryId: 'cat-01-antipasti',
        name: { it: 'Prosciutto Crudo e Bufala', en: 'Parma Ham & Buffalo Mozzarella', de: 'Parmaschinken & Büffelmozzarella' },
        description: {
          it: 'Prosciutto crudo stagionato 24 mesi accompagnato da mozzarella di bufala',
          en: '24-month aged Parma ham served with fresh buffalo mozzarella',
          de: '24 Monate gereifter Parmaschinken mit frischem Büffelmozzarella',
        },
        price: 12.5,
        allergens: ['Lattosio'],
      },
    ],
  },
  // 2 - FRITTI & STUZZICHERIE (CUCINA)
  {
    id: 'cat-02-fritti',
    order: 2,
    department: 'CUCINA',
    name: { it: 'Fritti & Stuzzicherie', en: 'Fried Bites & Snacks', de: 'Frittiertes & Snacks' },
    items: [
      {
        id: 'fri-patatine',
        categoryId: 'cat-02-fritti',
        name: { it: 'Patatine Fritte', en: 'French Fries', de: 'Pommes Frites' },
        description: {
          it: 'Porzione abbondante di patatine dorate e croccanti',
          en: 'Generous portion of crispy golden French fries',
          de: 'Große Portion knusprig goldene Pommes Frites',
        },
        price: 4.5,
      },
      {
        id: 'fri-suppli',
        categoryId: 'cat-02-fritti',
        name: { it: 'Supplì al Telefono (3 pz)', en: 'Fried Rice Supplì (3 pcs)', de: 'Frittierte Reisbällchen (3 Stk.)' },
        description: {
          it: 'Supplì romani al ragù con cuore filante di mozzarella',
          en: 'Traditional Roman meat-sauce rice croquettes with melted mozzarella core',
          de: 'Römische Reisbällchen mit Fleischragout und geschmolzenem Mozzarellakern',
        },
        price: 6.0,
        allergens: ['Glutine', 'Lattosio', 'Uova'],
      },
      {
        id: 'fri-ascolane',
        categoryId: 'cat-02-fritti',
        name: { it: 'Olive all’Ascolana (8 pz)', en: 'Stuffed Fried Olives (8 pcs)', de: 'Gefüllte Oliven Ascolana (8 Stk.)' },
        description: {
          it: 'Olive verdi ripiene di carne speziata, impanate e fritte',
          en: 'Green olives stuffed with seasoned meat, breaded and fried',
          de: 'Grüne Oliven mit gewürzter Fleischfüllung, paniert und frittiert',
        },
        price: 6.5,
        allergens: ['Glutine', 'Uova'],
      },
      {
        id: 'fri-mix',
        categoryId: 'cat-02-fritti',
        name: { it: 'Fritto Misto Paddock', en: 'Paddock Mixed Fried Basket', de: 'Gemischter Frittierkorb' },
        description: {
          it: 'Patatine, mozzarelline, anelli di cipolla, crocchette e olive ascolane',
          en: 'Fries, mozzarella bites, onion rings, potato croquettes and stuffed olives',
          de: 'Pommes, Mozzarella-Sticks, Zwiebelringe, Kroketten und gefüllte Oliven',
        },
        price: 11.0,
        allergens: ['Glutine', 'Lattosio', 'Uova'],
      },
    ],
  },
  // 3 - INSALATONE (CUCINA)
  {
    id: 'cat-03-insalatone',
    order: 3,
    department: 'CUCINA',
    name: { it: 'Insalatone', en: 'Fresh Salads', de: 'Große Salate' },
    items: [
      {
        id: 'ins-mista',
        categoryId: 'cat-03-insalatone',
        name: { it: 'Insalata Mista', en: 'Mixed Garden Salad', de: 'Gemischter Salat' },
        description: {
          it: 'Lattuga, radicchio, rucola, pomodorini, carote e mais',
          en: 'Lettuce, radicchio, rocket, cherry tomatoes, carrots and sweetcorn',
          de: 'Kopfsalat, Radicchio, Rucola, Kirschtomaten, Karotten und Mais',
        },
        price: 6.0,
      },
      {
        id: 'ins-caesar',
        categoryId: 'cat-03-insalatone',
        name: { it: 'Caesar Salad Pit Stop', en: 'Pit Stop Caesar Salad', de: 'Caesar Salat Pit Stop' },
        description: {
          it: 'Lattuga romana, pollo alla piastra, scaglie di grana, crostini e salsa Caesar',
          en: 'Romaine lettuce, grilled chicken, Grana shavings, croutons and Caesar dressing',
          de: 'Römersalat, gegrilltes Hähnchen, Grana-Späne, Croutons und Caesar-Dressing',
        },
        price: 11.5,
        allergens: ['Glutine', 'Lattosio', 'Uova', 'Pesce'],
      },
      {
        id: 'ins-tonno',
        categoryId: 'cat-03-insalatone',
        name: { it: 'Mediterranea Tonno e Cipolla', en: 'Mediterranean Tuna Salad', de: 'Salat mit Thunfisch & Zwiebeln' },
        description: {
          it: 'Insalata verde, tonno in olio EVO, cipolla rossa di Tropea, olive taggiasche e pomodorini',
          en: 'Green salad, tuna in olive oil, Tropea red onion, Taggiasca olives and cherry tomatoes',
          de: 'Grüner Salat, Thunfisch, rote Zwiebeln, Oliven und Kirschtomaten',
        },
        price: 10.5,
        allergens: ['Pesce'],
      },
    ],
  },
  // 4 - PRIMI PIATTI (CUCINA)
  {
    id: 'cat-04-primi',
    order: 4,
    department: 'CUCINA',
    name: { it: 'Primi Piatti', en: 'Pasta Dishes', de: 'Nudelgerichte' },
    items: [
      {
        id: 'pri-pomodoro',
        categoryId: 'cat-04-primi',
        name: { it: 'Spaghetti al Pomodoro Fresco', en: 'Spaghetti Tomato & Basil', de: 'Spaghetti mit Tomate & Basilikum' },
        description: {
          it: 'Salsa di pomodoro San Marzano, basilico fresco e olio extravergine',
          en: 'San Marzano tomato sauce, fresh basil and extra virgin olive oil',
          de: 'San-Marzano-Tomatensauce, frisches Basilikum und Olivenöl',
        },
        price: 9.0,
        allergens: ['Glutine'],
      },
      {
        id: 'pri-ragu',
        categoryId: 'cat-04-primi',
        name: { it: 'Tagliatelle al Ragù Bolognese', en: 'Tagliatelle Bolognese', de: 'Tagliatelle Bolognese' },
        description: {
          it: 'Pasta fresca all’uovo con ragù lento della tradizione emiliana',
          en: 'Fresh egg pasta with slow-cooked traditional Bolognese meat sauce',
          de: 'Frische Eiernudeln mit langsam gekochter Bolognese-Fleischsauce',
        },
        price: 11.5,
        allergens: ['Glutine', 'Uova', 'Sedano'],
      },
      {
        id: 'pri-lasagna',
        categoryId: 'cat-04-primi',
        name: { it: 'Lasagna al Forno a Legna', en: 'Wood-Fired Lasagna', de: 'Hausgemachte Lasagne' },
        description: {
          it: 'Sfoglia all’uovo, ragù di manzo, besciamella e Parmigiano Reggiano',
          en: 'Egg pasta layers, beef ragù, béchamel and Parmigiano Reggiano',
          de: 'Teigplatten, Rinderragout, Béchamelsauce und Parmigiano Reggiano',
        },
        price: 12.0,
        allergens: ['Glutine', 'Uova', 'Lattosio'],
      },
      {
        id: 'pri-sorrentina',
        categoryId: 'cat-04-primi',
        name: { it: 'Gnocchi alla Sorrentina', en: 'Gnocchi Sorrentina', de: 'Gnocchi alla Sorrentina' },
        description: {
          it: 'Gnocchi di patate gratinati al forno con pomodoro, mozzarella filante e basilico',
          en: 'Oven-baked potato gnocchi with tomato sauce, melted mozzarella and basil',
          de: 'Im Ofen überbackene Kartoffel-Gnocchi mit Tomatensauce und Mozzarella',
        },
        price: 11.0,
        allergens: ['Glutine', 'Lattosio'],
      },
    ],
  },
  // 5 - SECONDI & CONTORNI (CUCINA)
  {
    id: 'cat-05-secondi',
    order: 5,
    department: 'CUCINA',
    name: { it: 'Secondi & Contorni', en: 'Main Courses & Sides', de: 'Hauptgerichte & Beilagen' },
    items: [
      {
        id: 'sec-cotoletta',
        categoryId: 'cat-05-secondi',
        name: { it: 'Cotoletta alla Milanese con Patatine', en: 'Breaded Veal/Chicken Cutlet & Fries', de: 'Schnitzel Mailänder Art mit Pommes' },
        description: {
          it: 'Petto di pollo dorato e croccante servito con patatine fritte e limone',
          en: 'Crispy golden breaded chicken breast served with fries and lemon',
          de: 'Knusprig paniertes Schnitzel serviert mit Pommes Frites und Zitrone',
        },
        price: 13.5,
        allergens: ['Glutine', 'Uova'],
      },
      {
        id: 'sec-tagliata',
        categoryId: 'cat-05-secondi',
        name: { it: 'Tagliata di Manzo Rucola e Grana', en: 'Sliced Beef Steak, Rocket & Grana', de: 'Rindersteak-Streifen mit Rucola & Grana' },
        description: {
          it: 'Controfiletto alla griglia con rucola fresca, scaglie di grana e glassa balsamica',
          en: 'Grilled sirloin sliced with fresh rocket, Grana shavings and balsamic glaze',
          de: 'Gegrilltes Rinderhüftsteak in Streifen mit Rucola, Grana und Balsamico',
        },
        price: 18.5,
        allergens: ['Lattosio'],
      },
      {
        id: 'sec-verdure',
        categoryId: 'cat-05-secondi',
        name: { it: 'Verdure Grigliate', en: 'Grilled Seasonal Vegetables', de: 'Gegrilltes Gemüse' },
        description: {
          it: 'Zucchine, melanzane e peperoni alla piastra con olio al prezzemolo',
          en: 'Chargrilled courgettes, aubergines and bell peppers with parsley oil',
          de: 'Gegrillte Zucchini, Auberginen und Paprika mit Petersilienöl',
        },
        price: 6.0,
      },
    ],
  },
  // 6 - PIZZE CLASSICHE (CUCINA)
  {
    id: 'cat-06-pizze-classiche',
    order: 6,
    department: 'CUCINA',
    name: { it: 'Pizze Classiche', en: 'Classic Pizzas', de: 'Klassische Pizzen' },
    items: [
      {
        id: 'piz-marinara',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Marinara', en: 'Marinara', de: 'Marinara' },
        description: {
          it: 'Pomodoro San Marzano, aglio, origano di montagna e olio EVO',
          en: 'San Marzano tomato, garlic, mountain oregano and olive oil',
          de: 'Tomatensauce, Knoblauch, Bergoregano und Olivenöl',
        },
        price: 6.0,
        allergens: ['Glutine'],
      },
      {
        id: 'piz-margherita',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Margherita', en: 'Margherita', de: 'Margherita' },
        description: {
          it: 'Pomodoro, mozzarella fior di latte, basilico fresco e olio EVO',
          en: 'Tomato sauce, fior di latte mozzarella, fresh basil and olive oil',
          de: 'Tomatensauce, Fior-di-Latte-Mozzarella, frisches Basilikum',
        },
        price: 7.0,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'piz-bufalina',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Bufalina DOP', en: 'Buffalo Margherita', de: 'Bufalina DOP' },
        description: {
          it: 'Pomodoro, mozzarella di bufala campana DOP a crudo e basilico',
          en: 'Tomato sauce, fresh Campania DOP buffalo mozzarella and basil',
          de: 'Tomatensauce, frischer Büffelmozzarella DOP und Basilikum',
        },
        price: 9.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'piz-napoli',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Napoli', en: 'Napoli (Anchovies)', de: 'Napoli (Sardellen)' },
        description: {
          it: 'Pomodoro, mozzarella, acciughe del Cantabrico e origano',
          en: 'Tomato sauce, mozzarella, Cantabrian anchovies and oregano',
          de: 'Tomatensauce, Mozzarella, Sardellen und Oregano',
        },
        price: 8.5,
        allergens: ['Glutine', 'Lattosio', 'Pesce'],
      },
      {
        id: 'piz-prosciutto',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Prosciutto Cotto', en: 'Cooked Ham', de: 'Prosciutto (Kochschinken)' },
        description: {
          it: 'Pomodoro, mozzarella fior di latte e prosciutto cotto alta qualità',
          en: 'Tomato sauce, fior di latte mozzarella and roasted cooked ham',
          de: 'Tomatensauce, Mozzarella und gekochter Schinken',
        },
        price: 8.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'piz-funghi',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Prosciutto e Funghi', en: 'Ham & Mushrooms', de: 'Schinken & Champignons' },
        description: {
          it: 'Pomodoro, mozzarella, prosciutto cotto e funghi champignon freschi',
          en: 'Tomato sauce, mozzarella, cooked ham and fresh champignon mushrooms',
          de: 'Tomatensauce, Mozzarella, Kochschinken und frische Champignons',
        },
        price: 9.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'piz-diavola',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Diavola', en: 'Diavola (Spicy Salami)', de: 'Diavola (Scharfe Salami)' },
        description: {
          it: 'Pomodoro, mozzarella fior di latte e salame piccante calabrese',
          en: 'Tomato sauce, mozzarella and spicy Calabrian salami',
          de: 'Tomatensauce, Mozzarella und scharfe kalabrische Salami',
        },
        price: 9.0,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'piz-capricciosa',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Capricciosa', en: 'Capricciosa', de: 'Capricciosa' },
        description: {
          it: 'Pomodoro, mozzarella, prosciutto cotto, funghi, carciofini e olive',
          en: 'Tomato, mozzarella, cooked ham, mushrooms, artichokes and olives',
          de: 'Tomaten, Mozzarella, Schinken, Champignons, Artischocken und Oliven',
        },
        price: 10.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'piz-tonno-cipolla',
        categoryId: 'cat-06-pizze-classiche',
        name: { it: 'Tonno e Cipolla', en: 'Tuna & Red Onion', de: 'Thunfisch & Zwiebeln' },
        description: {
          it: 'Pomodoro, mozzarella, tonno a filetti e cipolla rossa di Tropea',
          en: 'Tomato sauce, mozzarella, tuna fillets and sweet Tropea red onion',
          de: 'Tomatensauce, Mozzarella, Thunfisch und rote Zwiebeln',
        },
        price: 9.5,
        allergens: ['Glutine', 'Lattosio', 'Pesce'],
      },
    ],
  },
  // 7 - PIZZE SPECIALI PIT STOP (CUCINA)
  {
    id: 'cat-07-pizze-speciali',
    order: 7,
    department: 'CUCINA',
    name: { it: 'Pizze Speciali Pit Stop', en: 'Pit Stop Signature Pizzas', de: 'Pit Stop Spezial-Pizzen' },
    items: [
      {
        id: 'spe-pitstop',
        categoryId: 'cat-07-pizze-speciali',
        name: { it: 'Pit Stop 2.0', en: 'Pit Stop 2.0 Signature', de: 'Pit Stop 2.0 Spezial' },
        description: {
          it: 'Fior di latte, mortadella Bologna IGP, burrata pugliese, granella di pistacchio di Bronte',
          en: 'Fior di latte, Mortadella IGP, creamy Burrata and crushed Bronte pistachios',
          de: 'Fior di Latte, Mortadella IGP, cremige Burrata und Bronte-Pistazien',
        },
        price: 13.5,
        allergens: ['Glutine', 'Lattosio', 'Frutta a guscio'],
      },
      {
        id: 'spe-turbo',
        categoryId: 'cat-07-pizze-speciali',
        name: { it: 'Turbo GP', en: 'Turbo GP (Extra Spicy)', de: 'Turbo GP (Feurig Scharf)' },
        description: {
          it: 'Pomodoro, fior di latte, ’nduja di Spilinga, salame piccante, cipolla rossa e peperoni',
          en: 'Tomato, mozzarella, spicy ’nduja, Calabrian salami, red onion and peppers',
          de: 'Tomate, Mozzarella, scharfe ’Nduja, Salami, rote Zwiebeln und Paprika',
        },
        price: 12.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'spe-pole',
        categoryId: 'cat-07-pizze-speciali',
        name: { it: 'Pole Position', en: 'Pole Position', de: 'Pole Position' },
        description: {
          it: 'Pomodoro, mozzarella, prosciutto crudo di Parma 24 mesi, rucola, pomodorini e grana',
          en: 'Tomato, mozzarella, 24-month Parma ham, wild rocket, cherry tomatoes and Grana',
          de: 'Tomate, Mozzarella, Parmaschinken, Rucola, Kirschtomaten und Grana',
        },
        price: 13.0,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'spe-valtellina',
        categoryId: 'cat-07-pizze-speciali',
        name: { it: 'Valtellina', en: 'Valtellina (Bresaola)', de: 'Valtellina (Bresaola)' },
        description: {
          it: 'Pomodoro, mozzarella, bresaola IGP, rucola selvatica e scaglie di Parmigiano',
          en: 'Tomato, mozzarella, cured beef bresaola, rocket and Parmigiano shavings',
          de: 'Tomate, Mozzarella, Bresaola-Rinderschinken, Rucola und Parmigiano',
        },
        price: 12.5,
        allergens: ['Glutine', 'Lattosio'],
      },
    ],
  },
  // 8 - PIZZE BIANCHE (CUCINA)
  {
    id: 'cat-08-pizze-bianche',
    order: 8,
    department: 'CUCINA',
    name: { it: 'Pizze Bianche', en: 'White Pizzas (No Tomato)', de: 'Weiße Pizzen (ohne Tomate)' },
    items: [
      {
        id: 'bia-4formaggi',
        categoryId: 'cat-08-pizze-bianche',
        name: { it: '4 Formaggi', en: 'Four Cheese', de: 'Vier Käsesorten' },
        description: {
          it: 'Mozzarella fior di latte, gorgonzola dolce DOP, fontina e Parmigiano',
          en: 'Fior di latte mozzarella, sweet Gorgonzola, Fontina and Parmigiano',
          de: 'Mozzarella, milder Gorgonzola, Fontina und Parmigiano',
        },
        price: 10.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'bia-boscaiola',
        categoryId: 'cat-08-pizze-bianche',
        name: { it: 'Boscaiola', en: 'Woodsman (Sausage & Mushrooms)', de: 'Boscaiola (Salsiccia & Pilze)' },
        description: {
          it: 'Mozzarella, salsiccia fresca sbriciolata e funghi champignon saltati',
          en: 'Mozzarella, crumbled Italian pork sausage and sautéed mushrooms',
          de: 'Mozzarella, italienische Bratwurst und gebratene Champignons',
        },
        price: 10.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'bia-friarielli',
        categoryId: 'cat-08-pizze-bianche',
        name: { it: 'Salsiccia e Friarielli', en: 'Sausage & Broccoli Rabe', de: 'Salsiccia & Stängelkohl' },
        description: {
          it: 'Provola affumicata, salsiccia napoletana e friarielli saltati con aglio e peperoncino',
          en: 'Smoked provola, Neapolitan sausage and sautéed broccoli rabe',
          de: 'Geräucherter Provola-Käse, Salsiccia und neapolitanischer Stängelkohl',
        },
        price: 11.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'bia-patate',
        categoryId: 'cat-08-pizze-bianche',
        name: { it: 'Patate, Rosmarino e Pancetta', en: 'Potato, Rosemary & Pancetta', de: 'Kartoffeln, Rosmarin & Pancetta' },
        description: {
          it: 'Mozzarella, patate al forno a fette sottili, rosmarino fresco e pancetta croccante',
          en: 'Mozzarella, thinly sliced roasted potatoes, rosemary and crispy pancetta',
          de: 'Mozzarella, dünne Ofenkartoffeln, Rosmarin und knuspriger Pancetta',
        },
        price: 10.5,
        allergens: ['Glutine', 'Lattosio'],
      },
    ],
  },
  // 9 - CALZONI & FOCACCE (CUCINA)
  {
    id: 'cat-09-calzoni',
    order: 9,
    department: 'CUCINA',
    name: { it: 'Calzoni & Focacce', en: 'Calzones & Focaccias', de: 'Calzone & Focaccia' },
    items: [
      {
        id: 'cal-classico',
        categoryId: 'cat-09-calzoni',
        name: { it: 'Calzone Classico', en: 'Classic Calzone', de: 'Klassische Calzone' },
        description: {
          it: 'Ripieno di pomodoro, mozzarella fior di latte e prosciutto cotto',
          en: 'Folded pizza filled with tomato sauce, mozzarella and cooked ham',
          de: 'Gefüllte Pizza mit Tomatensauce, Mozzarella und Kochschinken',
        },
        price: 9.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'cal-farcito',
        categoryId: 'cat-09-calzoni',
        name: { it: 'Calzone Farcito Ricotta e Salame', en: 'Stuffed Calzone (Ricotta & Salami)', de: 'Gefüllte Calzone (Ricotta & Salami)' },
        description: {
          it: 'Ricotta fresca, mozzarella, salame napoli, pepe nero e pomodoro sopra',
          en: 'Fresh ricotta, mozzarella, Naples salami, black pepper and tomato topping',
          de: 'Frischer Ricotta, Mozzarella, Salami, schwarzer Pfeffer und Tomatensauce',
        },
        price: 10.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'foc-rosmarino',
        categoryId: 'cat-09-calzoni',
        name: { it: 'Focaccia Olio e Rosmarino', en: 'Rosemary & Sea Salt Focaccia', de: 'Focaccia mit Rosmarin & Meersalz' },
        description: {
          it: 'Base pizza croccante con olio EVO, sale grosso e rosmarino',
          en: 'Crispy wood-fired flatbread with extra virgin olive oil, sea salt and rosemary',
          de: 'Knuspriges Pizzabrot mit Olivenöl, grobem Meersalz und Rosmarin',
        },
        price: 4.5,
        allergens: ['Glutine'],
      },
      {
        id: 'foc-crudo',
        categoryId: 'cat-09-calzoni',
        name: { it: 'Focaccia Stracciatella e Crudo', en: 'Focaccia Stracciatella & Parma Ham', de: 'Focaccia mit Stracciatella & Parmaschinken' },
        description: {
          it: 'Focaccia calda condita fuori forno con stracciatella fresca e prosciutto crudo',
          en: 'Warm focaccia topped with creamy stracciatella cheese and Parma ham',
          de: 'Warme Focaccia belegt mit cremiger Stracciatella und Parmaschinken',
        },
        price: 12.0,
        allergens: ['Glutine', 'Lattosio'],
      },
    ],
  },
  // 10 - PIZZE BABY & BAMBINI (CUCINA)
  {
    id: 'cat-10-baby',
    order: 10,
    department: 'CUCINA',
    name: { it: 'Pizze Baby & Bambini', en: 'Kids Menu', de: 'Kindermenü' },
    items: [
      {
        id: 'bab-margherita',
        categoryId: 'cat-10-baby',
        name: { it: 'Baby Margherita', en: 'Kids Mini Margherita', de: 'Kinder-Margherita' },
        description: {
          it: 'Formato ridotto con pomodoro e mozzarella fior di latte',
          en: 'Smaller size with tomato sauce and mild mozzarella',
          de: 'Kleine Pizza mit Tomatensauce und Mozzarella',
        },
        price: 5.5,
        allergens: ['Glutine', 'Lattosio'],
      },
      {
        id: 'bab-wurstel-patatine',
        categoryId: 'cat-10-baby',
        name: { it: 'Baby Wurstel e Patatine', en: 'Kids Hot Dog & Fries Pizza', de: 'Kinderpizza Würstchen & Pommes' },
        description: {
          it: 'Formato baby con pomodoro, mozzarella, wurstel e patatine fritte',
          en: 'Kids pizza with tomato, mozzarella, sliced frankfurter and French fries',
          de: 'Kleine Pizza mit Tomaten, Mozzarella, Würstchen und Pommes Frites',
        },
        price: 7.0,
        allergens: ['Glutine', 'Lattosio'],
      },
    ],
  },
  // 11 - AGGIUNTE & IMPASTI (CUCINA)
  {
    id: 'cat-11-aggiunte',
    order: 11,
    department: 'CUCINA',
    name: { it: 'Aggiunte & Impasti', en: 'Extras & Doughs', de: 'Extras & Teigsorten' },
    items: [
      {
        id: 'agg-integrale',
        categoryId: 'cat-11-aggiunte',
        name: { it: 'Supplemento Impasto Integrale', en: 'Wholegrain Dough Upgrade', de: 'Aufpreis Vollkornteig' },
        description: {
          it: 'Impasto ai cereali macinato a pietra ad alta digeribilità',
          en: 'Stone-ground wholegrain dough upgrade',
          de: 'Stein-gemahlener Vollkornteig',
        },
        price: 1.5,
        allergens: ['Glutine'],
      },
      {
        id: 'agg-senzaglutine',
        categoryId: 'cat-11-aggiunte',
        name: { it: 'Supplemento Base Senza Glutine', en: 'Gluten-Free Base Upgrade', de: 'Aufpreis Glutenfreier Teig' },
        description: {
          it: 'Base artigianale senza glutine cotta in teglia dedicata',
          en: 'Artisanal gluten-free base baked in a dedicated tray',
          de: 'Glutenfreier Pizzaboden in separater Form gebacken',
        },
        price: 3.0,
      },
      {
        id: 'agg-bufala',
        categoryId: 'cat-11-aggiunte',
        name: { it: 'Aggiunta Mozzarella di Bufala / Burrata', en: 'Extra Buffalo Mozzarella / Burrata', de: 'Extra Büffelmozzarella / Burrata' },
        description: {
          it: 'Porzione extra aggiunta a crudo o in cottura',
          en: 'Extra fresh cheese portion',
          de: 'Extra Portion frischer Käse',
        },
        price: 3.0,
        allergens: ['Lattosio'],
      },
      {
        id: 'agg-ingrediente',
        categoryId: 'cat-11-aggiunte',
        name: { it: 'Aggiunta Ingrediente Standard', en: 'Extra Topping (Veg / Ham / Salami)', de: 'Extra Belag (Gemüse / Wurst)' },
        description: {
          it: 'Specifica l’ingrediente desiderato nella nota',
          en: 'Specify your extra topping in the note field',
          de: 'Bitte gewünschten Belag in der Notiz angeben',
        },
        price: 1.5,
      },
    ],
  },
  // 12 - DOLCI DELLA CASA (CUCINA)
  {
    id: 'cat-12-dolci',
    order: 12,
    department: 'CUCINA',
    name: { it: 'Dolci della Casa', en: 'Homemade Desserts', de: 'Hausgemachte Desserts' },
    items: [
      {
        id: 'dol-tiramisu',
        categoryId: 'cat-12-dolci',
        name: { it: 'Tiramisù della Casa', en: 'Homemade Tiramisù', de: 'Hausgemachtes Tiramisu' },
        description: {
          it: 'Savoiardi al caffè espresso, crema al mascarpone e cacao amaro',
          en: 'Espresso-soaked ladyfingers, mascarpone cream and bitter cocoa',
          de: 'Löffelbiskuit mit Espresso, Mascarponecreme und Kakao',
        },
        price: 6.0,
        allergens: ['Glutine', 'Lattosio', 'Uova'],
      },
      {
        id: 'dol-pannacotta',
        categoryId: 'cat-12-dolci',
        name: { it: 'Panna Cotta ai Frutti di Bosco', en: 'Berry Panna Cotta', de: 'Panna Cotta mit Waldbeeren' },
        description: {
          it: 'Panna cotta alla vaniglia Bourbon con coulis ai frutti di bosco',
          en: 'Bourbon vanilla panna cotta with wild berry coulis',
          de: 'Bourbon-Vanille Panna Cotta mit Waldbeersauce',
        },
        price: 5.5,
        allergens: ['Lattosio'],
      },
      {
        id: 'dol-nutella',
        categoryId: 'cat-12-dolci',
        name: { it: 'Pizza alla Nutella', en: 'Nutella Sweet Pizza', de: 'Nutella-Pizza' },
        description: {
          it: 'Pasta pizza calda farcita con Nutella e zucchero a velo (ideale da condividere)',
          en: 'Warm pizza dough topped with Nutella and icing sugar (great for sharing)',
          de: 'Warmer Pizzateig mit Nutella und Puderzucker (ideal zum Teilen)',
        },
        price: 8.5,
        allergens: ['Glutine', 'Lattosio', 'Frutta a guscio'],
      },
    ],
  },
  // 13 - ACQUA (BAR)
  {
    id: 'cat-13-acqua',
    order: 13,
    department: 'BAR',
    name: { it: 'Acqua', en: 'Water', de: 'Wasser' },
    items: [
      {
        id: 'acq-075',
        categoryId: 'cat-13-acqua',
        name: { it: 'Acqua Minerale 0,75L (Vetro)', en: 'Mineral Water 0.75L (Glass)', de: 'Mineralwasser 0,75L (Glas)' },
        description: {
          it: 'Bottiglia in vetro da 75cl (scegli Naturale o Frizzante)',
          en: '750ml glass bottle (choose Still or Sparkling)',
          de: '0,75L Glasflasche (Still oder Sprudelnd wählen)',
        },
        price: 3.0,
        optionGroups: WATER_OPTIONS,
      },
      {
        id: 'acq-050',
        categoryId: 'cat-13-acqua',
        name: { it: 'Acqua Minerale 0,5L', en: 'Mineral Water 0.5L', de: 'Mineralwasser 0,5L' },
        description: {
          it: 'Bottiglietta da 50cl (scegli Naturale o Frizzante)',
          en: '500ml bottle (choose Still or Sparkling)',
          de: '0,5L Flasche (Still oder Sprudelnd wählen)',
        },
        price: 2.0,
        optionGroups: WATER_OPTIONS,
      },
    ],
  },
  // 14 - BIBITE IN LATTINA & BOTTIGLIA (BAR)
  {
    id: 'cat-14-bibite',
    order: 14,
    department: 'BAR',
    name: { it: 'Bibite', en: 'Soft Drinks', de: 'Erfrischungsgetränke' },
    items: [
      {
        id: 'bib-coca',
        categoryId: 'cat-14-bibite',
        name: { it: 'Coca-Cola (33cl)', en: 'Coca-Cola (330ml)', de: 'Coca-Cola (0,33L)' },
        description: {
          it: 'Bottiglia o lattina in vetro 33cl',
          en: '330ml bottle or can',
          de: '0,33L Flasche oder Dose',
        },
        price: 3.5,
        optionGroups: SOFT_DRINK_OPTIONS,
      },
      {
        id: 'bib-cocazero',
        categoryId: 'cat-14-bibite',
        name: { it: 'Coca-Cola Zero (33cl)', en: 'Coca-Cola Zero (330ml)', de: 'Coca-Cola Zero (0,33L)' },
        description: {
          it: 'Senza zuccheri, 33cl',
          en: 'Zero sugar, 330ml',
          de: 'Ohne Zucker, 0,33L',
        },
        price: 3.5,
        optionGroups: SOFT_DRINK_OPTIONS,
      },
      {
        id: 'bib-fanta',
        categoryId: 'cat-14-bibite',
        name: { it: 'Fanta Aranciata (33cl)', en: 'Fanta Orange (330ml)', de: 'Fanta Orange (0,33L)' },
        description: {
          it: 'Aranciata frizzante 33cl',
          en: 'Sparkling orange soda 330ml',
          de: 'Orangenlimonade 0,33L',
        },
        price: 3.5,
        optionGroups: SOFT_DRINK_OPTIONS,
      },
      {
        id: 'bib-sprite',
        categoryId: 'cat-14-bibite',
        name: { it: 'Sprite (33cl)', en: 'Sprite (330ml)', de: 'Sprite (0,33L)' },
        description: {
          it: 'Bibita al gusto limone e lime 33cl',
          en: 'Lemon-lime soda 330ml',
          de: 'Zitronen-Limetten-Limonade 0,33L',
        },
        price: 3.5,
        optionGroups: SOFT_DRINK_OPTIONS,
      },
      {
        id: 'bib-estathe',
        categoryId: 'cat-14-bibite',
        name: { it: 'Tè Freddo (Limone / Pesca)', en: 'Iced Tea (Lemon / Peach)', de: 'Eistee (Zitrone / Pfirsich)' },
        description: {
          it: 'Estathé in lattina / bottiglia 33cl',
          en: 'Italian iced tea 330ml',
          de: 'Italienischer Eistee 0,33L',
        },
        price: 3.5,
        optionGroups: [
          {
            id: 'tea-flavor',
            label: { it: 'Gusto Tè', en: 'Tea Flavor', de: 'Geschmack' },
            required: true,
            choices: [
              { id: 'limone', label: { it: 'Al Limone', en: 'Lemon', de: 'Zitrone' } },
              { id: 'pesca', label: { it: 'Alla Pesca', en: 'Peach', de: 'Pfirsich' } },
            ],
          },
          ...SOFT_DRINK_OPTIONS,
        ],
      },
      {
        id: 'bib-chinotto',
        categoryId: 'cat-14-bibite',
        name: { it: 'Chinotto / Lemon Soda', en: 'Chinotto / Lemon Soda', de: 'Chinotto / Zitronenlimonade' },
        description: {
          it: 'Scegli la variante italiana preferita',
          en: 'Choose your favorite Italian soda',
          de: 'Wählen Sie Ihre italienische Limonade',
        },
        price: 3.5,
        optionGroups: [
          {
            id: 'soda-type',
            label: { it: 'Bibita', en: 'Drink', de: 'Getränk' },
            required: true,
            choices: [
              { id: 'chinotto', label: { it: 'Chinotto', en: 'Chinotto', de: 'Chinotto' } },
              { id: 'lemonsoda', label: { it: 'Lemon Soda', en: 'Lemon Soda', de: 'Lemon Soda' } },
            ],
          },
          ...SOFT_DRINK_OPTIONS,
        ],
      },
    ],
  },
  // 15 - SUCCHI DI FRUTTA (BAR)
  {
    id: 'cat-15-succhi',
    order: 15,
    department: 'BAR',
    name: { it: 'Succhi di Frutta', en: 'Fruit Juices', de: 'Fruchtsäfte' },
    items: [
      {
        id: 'suc-bottiglia',
        categoryId: 'cat-15-succhi',
        name: { it: 'Succo di Frutta (20cl)', en: 'Fruit Juice Bottle (200ml)', de: 'Fruchtsaft (0,2L)' },
        description: {
          it: 'Bottiglietta di vetro 20cl — seleziona il gusto desiderato',
          en: '200ml glass bottle — choose your flavor',
          de: '0,2L Glasflasche — wählen Sie Ihre Sorte',
        },
        price: 3.5,
        optionGroups: [
          ...JUICE_FLAVOR_OPTIONS,
          {
            id: 'juice-ice',
            label: { it: 'Bicchiere', en: 'Glass', de: 'Glas' },
            required: true,
            choices: [
              { id: 'senza-ghiaccio', label: { it: 'Senza ghiaccio', en: 'No ice', de: 'Ohne Eis' } },
              { id: 'con-ghiaccio', label: { it: 'Con ghiaccio', en: 'With ice', de: 'Mit Eis' } },
            ],
          },
        ],
      },
      {
        id: 'suc-spremuta',
        categoryId: 'cat-15-succhi',
        name: { it: 'Spremuta Fresca d’Arancia', en: 'Freshly Squeezed Orange Juice', de: 'Frisch gepresster Orangensaft' },
        description: {
          it: 'Arance fresche spremute al momento',
          en: 'Freshly squeezed oranges made to order',
          de: 'Frisch gepresste Orangen',
        },
        price: 4.5,
      },
    ],
  },
  // 16 - BIRRE ALLA SPINA (BAR)
  {
    id: 'cat-16-birre-spina',
    order: 16,
    department: 'BAR',
    name: { it: 'Birre alla Spina', en: 'Draft Beers', de: 'Bier vom Fass' },
    items: [
      {
        id: 'bir-bionda',
        categoryId: 'cat-16-birre-spina',
        name: { it: 'Birra Bionda Lager alla Spina', en: 'Draft Blonde Lager', de: 'Helles Lager vom Fass' },
        description: {
          it: 'Birra chiara fresca e dissetante (prezzo base Media 0,4L)',
          en: 'Crisp, refreshing blonde lager (base price Medium 0.4L)',
          de: 'Frisches helles Lagerbier (Grundpreis Mittel 0,4L)',
        },
        price: 5.0,
        allergens: ['Glutine'],
        optionGroups: DRAFT_BEER_OPTIONS,
      },
      {
        id: 'bir-rossa',
        categoryId: 'cat-16-birre-spina',
        name: { it: 'Birra Rossa Doppio Malto alla Spina', en: 'Draft Amber / Red Ale', de: 'Rotes Doppelmalzbier vom Fass' },
        description: {
          it: 'Note caramellate e corpo rotondo (prezzo base Media 0,4L)',
          en: 'Rich caramel notes and full body (base price Medium 0.4L)',
          de: 'Malziges Rotbier mit feiner Karamellnote (Grundpreis 0,4L)',
        },
        price: 5.5,
        allergens: ['Glutine'],
        optionGroups: DRAFT_BEER_OPTIONS,
      },
    ],
  },
  // 17 - BIRRE IN BOTTIGLIA & ARTIGIANALI (BAR)
  {
    id: 'cat-17-birre-bottiglia',
    order: 17,
    department: 'BAR',
    name: { it: 'Birre in Bottiglia & Artigianali', en: 'Bottled & Craft Beers', de: 'Flaschen- & Craftbiere' },
    items: [
      {
        id: 'bir-ichnusa',
        categoryId: 'cat-17-birre-bottiglia',
        name: { it: 'Ichnusa Non Filtrata (33cl)', en: 'Ichnusa Unfiltered (330ml)', de: 'Ichnusa Naturtrüb (0,33L)' },
        description: {
          it: 'Birra sarda non filtrata dal gusto morbido',
          en: 'Sardinian unfiltered lager with smooth taste',
          de: 'Sardisches unfiltriertes Lagerbier',
        },
        price: 4.5,
        allergens: ['Glutine'],
      },
      {
        id: 'bir-corona',
        categoryId: 'cat-17-birre-bottiglia',
        name: { it: 'Corona Extra con Lime (35,5cl)', en: 'Corona Extra with Lime', de: 'Corona Extra mit Limette' },
        description: {
          it: 'Servita ghiacciata con spicchio di lime fresco',
          en: 'Served ice-cold with a fresh lime wedge',
          de: 'Eiskalt serviert mit frischer Limette',
        },
        price: 5.0,
        allergens: ['Glutine'],
      },
      {
        id: 'bir-ipa',
        categoryId: 'cat-17-birre-bottiglia',
        name: { it: 'Birra Artigianale IPA (33cl)', en: 'Craft IPA (330ml)', de: 'Craft IPA (0,33L)' },
        description: {
          it: 'Luppolatura agrumata e amaro equilibrato',
          en: 'Citrus-hopped artisanal India Pale Ale',
          de: 'Fruchtig-hopfiges Craft IPA',
        },
        price: 6.0,
        allergens: ['Glutine'],
      },
      {
        id: 'bir-analcolica',
        categoryId: 'cat-17-birre-bottiglia',
        name: { it: 'Birra Analcolica 0.0% (33cl)', en: 'Alcohol-Free Beer 0.0%', de: 'Alkoholfreies Bier 0,0%' },
        description: {
          it: 'Gusto di birra lager senza alcool',
          en: 'Full lager taste, 0.0% alcohol',
          de: 'Vollmundiger Biergeschmack, 0,0% Alkohol',
        },
        price: 4.0,
        allergens: ['Glutine'],
      },
    ],
  },
  // 18 - VINI AL CALICE & BOTTIGLIA (BAR)
  {
    id: 'cat-18-vini',
    order: 18,
    department: 'BAR',
    name: { it: 'Vini & Bollicine', en: 'Wines & Prosecco', de: 'Weine & Prosecco' },
    items: [
      {
        id: 'vin-bianco',
        categoryId: 'cat-18-vini',
        name: { it: 'Vino Bianco della Casa (Pinot Grigio)', en: 'House White Wine (Pinot Grigio)', de: 'Hauswein Weiß (Pinot Grigio)' },
        description: {
          it: 'Fresco e minerale, ideale con pizze bianche e antipasti',
          en: 'Crisp and mineral, ideal with white pizzas and starters',
          de: 'Frisch und mineralisch, ideal zu Vorspeisen',
        },
        price: 4.5,
        allergens: ['Solfiti'],
        optionGroups: WINE_SERVE_OPTIONS,
      },
      {
        id: 'vin-rosso',
        categoryId: 'cat-18-vini',
        name: { it: 'Vino Rosso della Casa (Chianti / Sangiovese)', en: 'House Red Wine (Chianti)', de: 'Hauswein Rot (Chianti)' },
        description: {
          it: 'Rosso toscano morbido ed equilibrato',
          en: 'Smooth, balanced Tuscan red wine',
          de: 'Weicher, ausgewogener toskanischer Rotwein',
        },
        price: 4.5,
        allergens: ['Solfiti'],
        optionGroups: WINE_SERVE_OPTIONS,
      },
      {
        id: 'vin-prosecco',
        categoryId: 'cat-18-vini',
        name: { it: 'Prosecco Valdobbiadene DOCG', en: 'Prosecco Valdobbiadene DOCG', de: 'Prosecco Valdobbiadene DOCG' },
        description: {
          it: 'Bollicina elegante e asciutta',
          en: 'Crisp, fine sparkling Italian wine',
          de: 'Feinperliger, trockener Schaumwein',
        },
        price: 5.5,
        allergens: ['Solfiti'],
        optionGroups: [
          {
            id: 'prosecco-size',
            label: { it: 'Formato', en: 'Size', de: 'Größe' },
            required: true,
            choices: [
              { id: 'calice', label: { it: 'Calice', en: 'Glass', de: 'Glas' }, priceDelta: 0 },
              { id: 'bottiglia', label: { it: 'Bottiglia 0,75L', en: 'Bottle 0.75L', de: 'Flasche 0,75L' }, priceDelta: 16.5 },
            ],
          },
        ],
      },
    ],
  },
  // 19 - APERITIVI & COCKTAIL (BAR)
  {
    id: 'cat-19-aperitivi',
    order: 19,
    department: 'BAR',
    name: { it: 'Aperitivi & Cocktail', en: 'Aperitifs & Cocktails', de: 'Aperitifs & Cocktails' },
    items: [
      {
        id: 'ape-aperol',
        categoryId: 'cat-19-aperitivi',
        name: { it: 'Aperol Spritz', en: 'Aperol Spritz', de: 'Aperol Spritz' },
        description: {
          it: 'Prosecco DOC, Aperol, soda e fettina d’arancia',
          en: 'Prosecco, Aperol, splash of soda and orange slice',
          de: 'Prosecco, Aperol, Soda und Orangenscheibe',
        },
        price: 6.5,
        allergens: ['Solfiti'],
      },
      {
        id: 'ape-campari',
        categoryId: 'cat-19-aperitivi',
        name: { it: 'Campari Spritz', en: 'Campari Spritz', de: 'Campari Spritz' },
        description: {
          it: 'Prosecco DOC, Campari Bitter e soda',
          en: 'Prosecco, Campari Bitter and soda water',
          de: 'Prosecco, Campari Bitter und Sodawasser',
        },
        price: 7.0,
        allergens: ['Solfiti'],
      },
      {
        id: 'ape-hugo',
        categoryId: 'cat-19-aperitivi',
        name: { it: 'Hugo Spritz', en: 'Hugo Spritz', de: 'Hugo Spritz' },
        description: {
          it: 'Prosecco, sciroppo di fiori di sambuco, menta fresca e lime',
          en: 'Prosecco, elderflower syrup, fresh mint and lime',
          de: 'Prosecco, Holunderblütensirup, frische Minze und Limette',
        },
        price: 6.5,
        allergens: ['Solfiti'],
      },
      {
        id: 'ape-analcolico',
        categoryId: 'cat-19-aperitivi',
        name: { it: 'Analcolico Pit Stop', en: 'Virgin Pit Stop Cocktail', de: 'Alkoholfreier Cocktail' },
        description: {
          it: 'Mix fresco di agrumi, zenzero, menta e succo di arancia rossa',
          en: 'Refreshing citrus, ginger, mint and blood orange mocktail',
          de: 'Erfrischender Zitrus-, Ingwer-, Minz- und Blutorangen-Mocktail',
        },
        price: 5.5,
      },
    ],
  },
  // 20 - CAFFETTERIA (BAR)
  {
    id: 'cat-20-caffetteria',
    order: 20,
    department: 'BAR',
    name: { it: 'Caffetteria', en: 'Coffee & Hot Drinks', de: 'Kaffee & Heißgetränke' },
    items: [
      {
        id: 'caf-espresso',
        categoryId: 'cat-20-caffetteria',
        name: { it: 'Caffè Espresso', en: 'Espresso', de: 'Espresso' },
        description: {
          it: 'Miscela arabica tostata italiana',
          en: 'Italian roasted Arabica espresso',
          de: 'Italienischer Arabica-Espresso',
        },
        price: 1.5,
        optionGroups: [
          {
            id: 'espresso-type',
            label: { it: 'Variante', en: 'Style', de: 'Variante' },
            required: true,
            choices: [
              { id: 'normale', label: { it: 'Normale', en: 'Regular', de: 'Normal' } },
              { id: 'lungo', label: { it: 'Lungo', en: 'Lungo', de: 'Lungo' } },
              { id: 'ristretto', label: { it: 'Ristretto', en: 'Ristretto', de: 'Ristretto' } },
              { id: 'dek', label: { it: 'Decaffeinato', en: 'Decaf', de: 'Entkoffeiniert' } },
            ],
          },
        ],
      },
      {
        id: 'caf-macchiato',
        categoryId: 'cat-20-caffetteria',
        name: { it: 'Caffè Macchiato', en: 'Espresso Macchiato', de: 'Espresso Macchiato' },
        description: {
          it: 'Espresso con latte montato caldo o freddo (disponibile senza lattosio o soia)',
          en: 'Espresso topped with hot or cold milk (lactose-free & soy available)',
          de: 'Espresso mit warmer oder kalter Milch (auch laktosefrei oder Soja)',
        },
        price: 1.7,
        allergens: ['Lattosio'],
        optionGroups: MACCHIATO_OPTIONS,
      },
      {
        id: 'caf-corretto',
        categoryId: 'cat-20-caffetteria',
        name: { it: 'Caffè Corretto', en: 'Spiked Espresso (Grappa/Sambuca)', de: 'Caffè Corretto (mit Grappa/Sambuca)' },
        description: {
          it: 'Espresso con correzione al liquore',
          en: 'Espresso with your choice of spirit',
          de: 'Espresso mit Schuss nach Wahl',
        },
        price: 2.8,
        optionGroups: [
          {
            id: 'corretto-spirit',
            label: { it: 'Correzione', en: 'Spirit', de: 'Spirituose' },
            required: true,
            choices: [
              { id: 'sambuca', label: { it: 'Sambuca', en: 'Sambuca', de: 'Sambuca' } },
              { id: 'grappa', label: { it: 'Grappa', en: 'Grappa', de: 'Grappa' } },
              { id: 'cognac', label: { it: 'Brandy / Vecchia Romagna', en: 'Brandy', de: 'Brandy' } },
            ],
          },
        ],
      },
      {
        id: 'caf-orzo-ginseng',
        categoryId: 'cat-20-caffetteria',
        name: { it: 'Orzo o Ginseng', en: 'Barley Coffee / Ginseng', de: 'Gerstenkaffee / Ginseng' },
        description: {
          it: 'Scegli tra orzo tostato o caffè al ginseng',
          en: 'Choose roasted barley coffee or ginseng coffee',
          de: 'Wählen Sie Gerstenkaffee oder Ginseng-Kaffee',
        },
        price: 2.0,
        optionGroups: [
          {
            id: 'orzo-type',
            label: { it: 'Tipologia', en: 'Type', de: 'Sorte' },
            required: true,
            choices: [
              { id: 'orzo', label: { it: 'Orzo', en: 'Barley (Orzo)', de: 'Gerstenkaffee' } },
              { id: 'ginseng', label: { it: 'Ginseng', en: 'Ginseng', de: 'Ginseng' } },
            ],
          },
        ],
      },
    ],
  },
  // 21 - AMARI & DIGESTIVI (BAR)
  {
    id: 'cat-21-amari',
    order: 21,
    department: 'BAR',
    name: { it: 'Amari & Digestivi', en: 'Bitters & Digestifs', de: 'Kräuterliköre & Digestifs' },
    items: [
      {
        id: 'ama-limoncello',
        categoryId: 'cat-21-amari',
        name: { it: 'Limoncello di Sorrento', en: 'Sorrento Limoncello', de: 'Limoncello aus Sorrent' },
        description: {
          it: 'Servito ghiacciato',
          en: 'Served ice-cold',
          de: 'Eiskalt serviert',
        },
        price: 4.0,
      },
      {
        id: 'ama-capo',
        categoryId: 'cat-21-amari',
        name: { it: 'Amaro del Capo / Montenegro', en: 'Italian Herbal Amaro', de: 'Italienischer Kräuterbitter' },
        description: {
          it: 'Amaro alle erbe italiane',
          en: 'Traditional Italian herbal digestif',
          de: 'Traditioneller italienischer Kräuterlikör',
        },
        price: 4.5,
        optionGroups: [
          {
            id: 'amaro-brand',
            label: { it: 'Amaro', en: 'Selection', de: 'Auswahl' },
            required: true,
            choices: [
              { id: 'capo', label: { it: 'Vecchio Amaro del Capo', en: 'Amaro del Capo', de: 'Amaro del Capo' } },
              { id: 'montenegro', label: { it: 'Amaro Montenegro', en: 'Amaro Montenegro', de: 'Amaro Montenegro' } },
              { id: 'jager', label: { it: 'Jägermeister', en: 'Jägermeister', de: 'Jägermeister' } },
            ],
          },
          {
            id: 'amaro-ice',
            label: { it: 'Servizio', en: 'Serving', de: 'Servierart' },
            required: true,
            choices: [
              { id: 'liscio', label: { it: 'Liscio', en: 'Neat', de: 'Pur' } },
              { id: 'con-ghiaccio', label: { it: 'Con ghiaccio', en: 'On the rocks', de: 'Auf Eis' } },
            ],
          },
        ],
      },
      {
        id: 'ama-grappa',
        categoryId: 'cat-21-amari',
        name: { it: 'Grappa Artigianale', en: 'Artisanal Grappa', de: 'Grappa' },
        description: {
          it: 'Grappa bianca morbida o invecchiata in botte',
          en: 'Smooth white or oak-aged Italian grappa',
          de: 'Milder weißer oder im Fass gereifter Grappa',
        },
        price: 5.0,
        optionGroups: [
          {
            id: 'grappa-type',
            label: { it: 'Tipologia', en: 'Style', de: 'Sorte' },
            required: true,
            choices: [
              { id: 'bianca', label: { it: 'Grappa Bianca', en: 'White Grappa', de: 'Grappa Bianca' } },
              { id: 'barricata', label: { it: 'Grappa Barricata', en: 'Aged Barrique Grappa', de: 'Grappa Barricata' } },
            ],
          },
        ],
      },
    ],
  },
];

export const ALL_MENU_ITEMS_MAP = new Map<string, { item: MenuItem; category: MenuCategory }>();
for (const cat of MENU_CATEGORIES) {
  for (const item of cat.items) {
    ALL_MENU_ITEMS_MAP.set(item.id, { item, category: cat });
  }
}

export const TOTAL_TABLES = 15;
