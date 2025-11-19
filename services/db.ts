
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
// Punycode for детскиекроватки.рф
const DB_URL = 'https://xn--80adfeardlcc5bxinj.xn--p1ai/upload/db.json';

export const loadDatabase = async (): Promise<Database | null> => {
    const timestamp = new Date().getTime();
    // Adding timestamp param to bypass browser cache
    const fullUrl = `${DB_URL}?v=${timestamp}`;

    console.groupCollapsed("🔍 DIAGNOSTIC: Database Connection");
    console.log(`Target URL: ${fullUrl}`);

    // METHOD 1: Direct Fetch
    // This is the preferred method but requires the server to have CORS headers configured.
    try {
        console.time("Direct Fetch");
        const response = await fetch(fullUrl, { 
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });
        console.timeEnd("Direct Fetch");
        
        if (response.ok) {
            const text = await response.text();
            try {
                const data = JSON.parse(text);
                console.log("✅ Success: Database loaded directly.");
                console.groupEnd();
                return data;
            } catch (parseError) {
                console.warn("⚠️ Direct fetch JSON parse error, attempting proxies...");
            }
        } else {
            console.warn(`⚠️ Direct fetch status: ${response.status}`);
        }
    } catch (directError) {
        console.warn("⚠️ Direct fetch failed (CORS/Network). Switching to proxies.");
    }

    // METHOD 2: Multi-Proxy Fallback strategy
    const proxies = [
        { 
            name: "AllOrigins", 
            url: (u: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}` 
        },
        {
            name: "CodeTabs",
            url: (u: string) => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(u)}`
        },
        { 
            name: "CorsProxy.io", 
            url: (u: string) => `https://corsproxy.io/?${encodeURIComponent(u)}` 
        }
    ];

    for (const proxy of proxies) {
        console.log(`🔄 Attempting via ${proxy.name}...`);
        try {
            const proxyUrl = proxy.url(fullUrl);
            // Set a timeout for proxies to avoid hanging
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 5000); // 5s timeout per proxy

            const response = await fetch(proxyUrl, { signal: controller.signal });
            clearTimeout(id);
            
            if (response.ok) {
                const text = await response.text();
                try {
                    const data = JSON.parse(text);
                    console.log(`✅ Success: Database loaded via ${proxy.name}.`);
                    console.groupEnd();
                    return data;
                } catch (parseError) {
                     console.warn(`⚠️ JSON Parse Error (${proxy.name}):`, parseError);
                }
            } else {
                console.warn(`⚠️ ${proxy.name} returned status: ${response.status}`);
            }
        } catch (proxyError) {
            // Log as warn, not error, to avoid cluttering console with red text for expected fallbacks
            console.warn(`⚠️ ${proxy.name} fetch failed:`, (proxyError as any).message || proxyError);
        }
    }

    console.error("❌ All connection methods failed. Using local fallback data.");
    console.groupEnd();
    return null;
};
