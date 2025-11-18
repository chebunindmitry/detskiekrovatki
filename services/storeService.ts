
import { Product } from '../types';
import { mockProducts, mockCategories } from '../constants';

/**
 * Simulates a search against the shop API.
 * Endpoint: https://мой-магазин.ru/index.php?route=api/products
 */
export const searchProductsApi = async (query: string): Promise<Product[]> => {
  console.log(`Searching API [https://мой-магазин.ru/index.php?route=api/products] for query: "${query}"`);

  // Simulate network latency
  await new Promise(resolve => setTimeout(resolve, 800));

  const lowerQuery = query.toLowerCase().trim();

  // 1. Check if query matches a category name exactly or partially
  const matchedCategory = mockCategories.find(c => c.name.toLowerCase().includes(lowerQuery));
  
  let results: Product[] = [];

  if (matchedCategory) {
     results = mockProducts.filter(p => p.categoryId === matchedCategory.id);
  } else {
    // 2. Search by Name or SKU
    results = mockProducts.filter(p => 
      p.name.toLowerCase().includes(lowerQuery) || 
      p.sku.toLowerCase().includes(lowerQuery)
    );
  }

  // Limit to 5 top results as requested
  return results.slice(0, 5);
};
