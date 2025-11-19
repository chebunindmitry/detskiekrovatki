
import { Product, Category, Sticker } from '../types';

export interface Database {
    products: Product[];
    categories: Category[];
    settings?: any;
    stickers?: Sticker[];
    stats?: any;
    _generatedAt?: number; // Timestamp verification
}

// Absolute URL to the database on the external server
const DB_URL = 'https://xn--80adfeardlcc5bxinj.xn--p1ai/upload/db.json';

export const loadDatabase = async (): Promise<Database | null> => {
    try {
        // Generate a unique timestamp to bust cache
        const timestamp = new Date().getTime();
        
        console.log(`Fetching DB from: ${DB_URL}`);
        
        // Fetch from external URL
        // Note: The server hosting this file MUST support CORS (Access-Control-Allow-Origin: *)
        // if this app is running on a different domain (like localhost or github.io).
        const response = await fetch(`${DB_URL}?v=${timestamp}`);
        
        if (!response.ok) {
            console.warn(`DB Fetch failed: ${response.status} ${response.statusText}`);
            return null;
        }
        
        const data = await response.json();
        return data;
    } catch (e) {
        console.warn("Could not load remote database (db.json). Using local/demo data.", e);
        return null;
    }
};
