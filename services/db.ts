
import { Product, Category, Sticker } from '../types';

export interface Database {
    products: Product[];
    categories: Category[];
    settings?: any;
    stickers?: Sticker[];
    stats?: any;
    _generatedAt?: number;
}

// Absolute URL to the database on the external server
const DB_URL = 'https://xn--80adfeardlcc5bxinj.xn--p1ai/upload/db.json';

// --- EMBEDDED FALLBACK DATA ---
// This ensures the app ALWAYS loads even if the server/proxies are down.
const EMBEDDED_DB: Database = {
  "_generatedAt": 1715600000000,
  "settings": {
    "name": "Детские Кроватки.рф",
    "description": "Уютная и безопасная мебель для вашего малыша. Поможем выбрать лучшее!",
    "logoUrl": "https://детскиекроватки.рф/image/catalog/logoyellowupdate.png",
    "managerContact": "https://t.me/+79959060223",
    "showSku": true,
    "realPhotosEnabled": false,
    "realPhotosLabel": "Фото от наших покупателей",
    "realPhotos": [],
    "showProductsFromSubcategories": true
  },
  "stats": {
    "favoritesCount": 0,
    "consultationsCount": 0
  },
  "stickers": [
    { "id": "sale", "name": "Акция", "bgColor": "#ef4444", "textColor": "#ffffff" },
    { "id": "new", "name": "Новинка", "bgColor": "#22c55e", "textColor": "#ffffff" },
    { "id": "hit", "name": "Популярное", "bgColor": "#a855f7", "textColor": "#ffffff" },
    { "id": "rec", "name": "Рекомендуем", "bgColor": "#f97316", "textColor": "#ffffff" }
  ],
  "categories": [
    { "id": 1, "name": "Детские кроватки", "showImage": true, "image": "https://picsum.photos/seed/cat1/300/200", "sortOrder": 1, "status": true },
    { "id": 2, "name": "Комоды и пеленальные столики", "showImage": true, "image": "https://picsum.photos/seed/cat2/300/200", "sortOrder": 2, "status": true },
    { "id": 3, "name": "Детские матрасы", "showImage": false, "sortOrder": 3, "status": true },
    { "id": 4, "name": "Постельное белье", "showImage": true, "image": "https://picsum.photos/seed/cat4/300/200", "sortOrder": 4, "status": true }
  ],
  "products": [
    { 
      "id": 101, 
      "categoryId": 1, 
      "name": "Кроватка \"Bambini Classic\" (Белая)", 
      "price": 6490, 
      "specialPrice": 5990,
      "image": "https://picsum.photos/seed/crib1/600/600", 
      "images": [
        "https://picsum.photos/seed/crib1/600/600",
        "https://picsum.photos/seed/crib1-2/600/600",
        "https://picsum.photos/seed/crib1-3/600/600"
      ],
      "sku": "BAM-001-W",
      "stock": 12,
      "status": true,
      "attributes": [
         { "name": "Материал", "text": "Береза" },
         { "name": "Тип качания", "text": "Колесо-качалка" }
      ],
      "variantLabels": ["Цвет"],
      "variantValues": ["Белый"],
      "variants": [
          { "productId": 101, "values": ["Белый"] },
          { "productId": 105, "values": ["Слоновая кость"] }
      ]
    },
    { 
      "id": 105, 
      "categoryId": 1, 
      "name": "Кроватка \"Bambini Classic\" (Слоновая кость)", 
      "price": 6490, 
      "image": "https://picsum.photos/seed/crib1-ivory/600/600", 
      "images": [
        "https://picsum.photos/seed/crib1-ivory/600/600"
      ],
      "sku": "BAM-001-I",
      "stock": 8,
      "status": true,
      "attributes": [
         { "name": "Материал", "text": "Береза" },
         { "name": "Тип качания", "text": "Колесо-качалка" }
      ],
      "variantLabels": ["Цвет"],
      "variantValues": ["Слоновая кость"],
      "variants": [
          { "productId": 101, "values": ["Белый"] },
          { "productId": 105, "values": ["Слоновая кость"] }
      ]
    },
    { 
      "id": 102, 
      "categoryId": 1, 
      "name": "Кроватка-трансформер \"Evolvo 7в1\"", 
      "price": 11990, 
      "image": "https://picsum.photos/seed/crib2/600/600",
      "images": [
          "https://picsum.photos/seed/crib2/600/600",
          "https://picsum.photos/seed/crib2-detail/600/600"
      ],
      "sku": "EVO-7IN1",
      "stock": 5,
      "status": true,
      "attributes": [
          { "name": "Форма", "text": "Круглая/Овальная" }
      ]
    },
    { 
      "id": 103, 
      "categoryId": 1, 
      "name": "Кроватка \"Mimi с маятником\"", 
      "price": 8990, 
      "image": "https://picsum.photos/seed/crib3/600/600",
      "images": ["https://picsum.photos/seed/crib3/600/600"],
      "sku": "MIMI-PEN",
      "stock": 0,
      "status": true,
      "options": [{ "name": "Механизм", "values": ["Поперечный", "Продольный"] }] 
    },
    { 
      "id": 201, 
      "categoryId": 2, 
      "name": "Пеленальный комод \"Comfort\"", 
      "price": 7200, 
      "image": "https://picsum.photos/seed/dresser1/600/600",
      "images": ["https://picsum.photos/seed/dresser1/600/600"],
      "sku": "COMF-DR",
      "stock": 8,
      "status": true,
      "options": [{ "name": "Ящики", "values": ["3", "4"] }] 
    },
    { 
      "id": 202, 
      "categoryId": 2, 
      "name": "Комод \"Teddy Bear\"", 
      "price": 8500, 
      "image": "https://picsum.photos/seed/dresser2/600/600",
      "images": ["https://picsum.photos/seed/dresser2/600/600"],
      "sku": "TED-BEAR",
      "stock": 3,
      "status": true
    },
    { 
      "id": 203, 
      "categoryId": 2, 
      "name": "Пеленальный столик \"Simple\"", 
      "price": 3900, 
      "image": "https://picsum.photos/seed/dresser3/600/600",
      "images": ["https://picsum.photos/seed/dresser3/600/600"],
      "sku": "SIM-TAB",
      "stock": 15,
      "status": false 
    },
    { 
      "id": 301, 
      "categoryId": 3, 
      "name": "Матрас \"Baby Dream\" 120x60", 
      "price": 3500, 
      "image": "https://picsum.photos/seed/mattress1/600/600",
      "images": ["https://picsum.photos/seed/mattress1/600/600"],
      "sku": "MAT-120",
      "stock": 20,
      "status": true,
      "variantLabels": ["Размер"],
      "variantValues": ["120x60"],
      "variants": [
          { "productId": 301, "values": ["120x60"] },
          { "productId": 302, "values": ["125x65"] }
      ]
    },
    { 
      "id": 302, 
      "categoryId": 3, 
      "name": "Матрас \"Baby Dream\" 125x65", 
      "price": 3800, 
      "image": "https://picsum.photos/seed/mattress2/600/600",
      "images": ["https://picsum.photos/seed/mattress2/600/600"],
      "sku": "MAT-125",
      "stock": 7,
      "status": true,
      "variantLabels": ["Размер"],
      "variantValues": ["125x65"],
      "variants": [
          { "productId": 301, "values": ["120x60"] },
          { "productId": 302, "values": ["125x65"] }
      ]
    },
    { 
      "id": 401, 
      "categoryId": 4, 
      "name": "Комплект белья \"Звездная ночь\"", 
      "price": 4200, 
      "image": "https://picsum.photos/seed/bedding1/600/600",
      "images": ["https://picsum.photos/seed/bedding1/600/600"],
      "sku": "SET-STAR",
      "stock": 10,
      "status": true,
      "options": [{ "name": "Расцветка", "values": ["Голубой", "Розовый"] }] 
    },
    { 
      "id": 402, 
      "categoryId": 4, 
      "name": "Бортики в кроватку \"Облака\"", 
      "price": 3100, 
      "image": "https://picsum.photos/seed/bedding2/600/600",
      "images": ["https://picsum.photos/seed/bedding2/600/600"],
      "sku": "BORT-CLD",
      "stock": 2,
      "status": true
    }
  ]
};

export const loadDatabase = async (): Promise<Database> => {
    const timestamp = new Date().getTime();
    const fullUrl = `${DB_URL}?v=${timestamp}`;

    console.groupCollapsed("🔍 Database Connection Strategy");

    // 1. Try Direct Fetch
    try {
        const response = await fetch(fullUrl, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        if (response.ok) {
            const data = await response.json();
            console.log("✅ Loaded via Direct Fetch");
            console.groupEnd();
            return data;
        }
    } catch (e) {
        console.log("⚠️ Direct fetch failed, trying proxies...");
    }

    // 2. Try Proxies
    const proxies = [
        (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
        (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`,
        (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}`
    ];

    for (const proxy of proxies) {
        try {
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 3000); // 3s timeout
            
            const response = await fetch(proxy(fullUrl), { signal: controller.signal });
            clearTimeout(id);

            if (response.ok) {
                const data = await response.json();
                console.log("✅ Loaded via Proxy");
                console.groupEnd();
                return data;
            }
        } catch (e) {
            // Silent fail for proxies
        }
    }

    // 3. Fallback to Embedded Data
    console.warn("⚠️ All network attempts failed. Using Embedded Fallback Data.");
    console.groupEnd();
    
    // Simulate a small delay so the UI doesn't flicker too instantly
    await new Promise(resolve => setTimeout(resolve, 500));
    return EMBEDDED_DB;
};
