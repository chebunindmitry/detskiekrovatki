
import React, { useState, useEffect } from 'react';
import { enrichProductsWithDescriptions } from './services/geminiService';
import { searchProductsApi } from './services/storeService';
import { Product, Category, Screen, Tab, Sticker } from './types';
import ProductCard from './components/ProductCard';
import BottomNav from './components/BottomNav';
import ProductGallery from './components/ProductGallery';
import AdminPanel from './components/AdminPanel';
import { mockCategories, mockProducts } from './constants';

// Enum for Sorting
enum SortOption {
  DEFAULT = 'DEFAULT',
  PRICE_ASC = 'PRICE_ASC', // Low to High
  PRICE_DESC = 'PRICE_DESC', // High to Low
  DISCOUNT_DESC = 'DISCOUNT_DESC', // Biggest discount first
  DISCOUNT_ASC = 'DISCOUNT_ASC' // Smallest discount first
}

// Store Settings Interface
interface StoreSettings {
    name: string;
    description: string;
    logoUrl: string;
    managerContact: string;
    showSku: boolean;
    // Real Photos Gallery Settings
    realPhotosEnabled: boolean;
    realPhotosLabel: string;
    realPhotos: string[];
    // Catalog Settings
    showProductsFromSubcategories: boolean;
}

// Statistics Interface
interface StoreStats {
    favoritesCount: number; // Total times items were favorited
    consultationsCount: number; // Total consultations submitted
}

const App: React.FC = () => {
  // Telegram Integration
  const [isTelegram, setIsTelegram] = useState(false);

  // Theme State
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('theme_preference');
    return saved ? saved === 'dark' : true; // Default to dark
  });

  // Navigation State
  const [currentScreen, setCurrentScreen] = useState<Screen>(Screen.START);
  const [activeTab, setActiveTab] = useState<Tab>(Screen.CATALOG);
  
  // Lightbox State
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  
  // Store Settings State
  const [storeSettings, setStoreSettings] = useState<StoreSettings>(() => {
      const defaults: StoreSettings = {
          name: 'Детские Кроватки.рф',
          description: 'Уютная и безопасная мебель для вашего малыша. Поможем выбрать лучшее!',
          logoUrl: 'https://детскиекроватки.рф/image/catalog/logoyellowupdate.png',
          managerContact: 'https://t.me/+79959060223',
          showSku: true,
          realPhotosEnabled: false,
          realPhotosLabel: 'Фото от наших покупателей',
          realPhotos: [],
          showProductsFromSubcategories: true // Default to legacy behavior
      };

      try {
          const saved = localStorage.getItem('store_settings');
          if (saved) {
              const parsed = JSON.parse(saved);
              return { ...defaults, ...parsed };
          }
      } catch (e) {
          console.error("Error loading settings", e);
      }
      return defaults;
  });

  // Statistics State
  const [stats, setStats] = useState<StoreStats>(() => {
      const defaults = { favoritesCount: 0, consultationsCount: 0 };
      try {
          const saved = localStorage.getItem('store_stats');
          if (saved) return JSON.parse(saved);
          return defaults;
      } catch (e) {
          return defaults;
      }
  });

  // Stickers State
  const [stickers, setStickers] = useState<Sticker[]>(() => {
      const defaults: Sticker[] = [
          { id: 'sale', name: 'Акция', bgColor: '#ef4444', textColor: '#ffffff' },
          { id: 'new', name: 'Новинка', bgColor: '#22c55e', textColor: '#ffffff' },
          { id: 'hit', name: 'Популярное', bgColor: '#a855f7', textColor: '#ffffff' },
          { id: 'rec', name: 'Рекомендуем', bgColor: '#f97316', textColor: '#ffffff' },
      ];
      try {
          const saved = localStorage.getItem('store_stickers');
          if (saved) return JSON.parse(saved);
          return defaults;
      } catch (e) {
          return defaults;
      }
  });

  // Data State
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const savedProducts = localStorage.getItem('db_products');
      if (savedProducts) {
        const parsed = JSON.parse(savedProducts);
        if (Array.isArray(parsed)) {
             return parsed;
        }
      }
      return mockProducts; 
    } catch (e) {
      console.error("Error loading DB", e);
      return mockProducts;
    }
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    try {
        const savedCategories = localStorage.getItem('db_categories');
        if (savedCategories) {
            const parsed = JSON.parse(savedCategories);
            if (Array.isArray(parsed)) return parsed;
        }
        return mockCategories;
    } catch (e) {
        console.error("Error loading Categories", e);
        return mockCategories;
    }
  });

  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sorting State
  const [sortOption, setSortOption] = useState<SortOption>(SortOption.DEFAULT);
  const [isSortMenuOpen, setIsSortMenuOpen] = useState(false);
  
  // Admin State
  const [isAdmin, setIsAdmin] = useState(false);

  // Form State
  const [consultationForm, setConsultationForm] = useState({
    name: '',
    phone: '',
    question: ''
  });

  // --- Effects ---

  useEffect(() => {
    // Telegram Web App Initialization
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
        tg.ready();
        
        // Check if running inside Telegram
        if (tg.platform !== 'unknown') {
            setIsTelegram(true);
            tg.expand(); // Expand to full height
            
            // Sync Theme with Telegram
            if (tg.colorScheme) {
                setIsDarkMode(tg.colorScheme === 'dark');
            }
            
            // Optional: Listen to theme changes
            tg.onEvent('themeChanged', () => {
                setIsDarkMode(tg.colorScheme === 'dark');
            });
        }
    }

    // Check for persistent admin session
    const storedPhone = localStorage.getItem('admin_phone');
    if (storedPhone === '89203718545') {
      setIsAdmin(true);
    }
  }, []);

  // Theme Effect
  useEffect(() => {
    localStorage.setItem('theme_preference', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Internal Database Sync
  useEffect(() => {
    localStorage.setItem('db_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
      localStorage.setItem('db_categories', JSON.stringify(categories));
  }, [categories]);
  
  useEffect(() => {
      localStorage.setItem('store_settings', JSON.stringify(storeSettings));
  }, [storeSettings]);
  
  useEffect(() => {
      localStorage.setItem('store_stickers', JSON.stringify(stickers));
  }, [stickers]);

  useEffect(() => {
      localStorage.setItem('store_stats', JSON.stringify(stats));
  }, [stats]);

  // --- Logic ---

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
    setCurrentScreen(tab);
    if (tab === Screen.CATALOG) {
      if (currentScreen !== Screen.CATALOG) {
          setSelectedCategory(null);
          setSearchQuery('');
      }
    }
  };

  const handleProductClick = async (product: Product) => {
    setSelectedProduct(product);
    setCurrentScreen(Screen.PRODUCT_DETAILS);
    
    if (!product.description || product.description.length < 20) {
         try {
             const [enriched] = await enrichProductsWithDescriptions([product], "Подробное описание карточки товара");
             if (enriched) {
                 setProducts(prev => prev.map(p => p.id === enriched.id ? enriched : p));
                 setSelectedProduct(enriched);
             }
         } catch (e) {
             console.error("AI enrichment failed", e);
         }
    }
  };

  const toggleFavorite = (id: number) => {
    const isAdding = !favorites.includes(id);
    
    setFavorites(prev => 
      isAdding ? [...prev, id] : prev.filter(favId => favId !== id)
    );

    if (isAdding) {
        setStats(prev => ({ ...prev, favoritesCount: prev.favoritesCount + 1 }));
    }
  };

  const handleConsultationRequest = (prefillProduct?: Product) => {
    if (prefillProduct) {
      setConsultationForm(prev => ({
        ...prev,
        question: `Здравствуйте! Меня интересует товар "${prefillProduct.name}" (Арт: ${prefillProduct.sku}). Хотел бы узнать...`
      }));
    }
    setActiveTab(Screen.CONSULTATION);
    setCurrentScreen(Screen.CONSULTATION);
  };

  const submitConsultation = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API submission
    setTimeout(() => {
      setStats(prev => ({ ...prev, consultationsCount: prev.consultationsCount + 1 }));
      setCurrentScreen(Screen.CONFIRMATION);
      setConsultationForm({ name: '', phone: '', question: '' });
      
      // If in Telegram, we could use tg.sendData() here to send form data back to bot
      const tg = (window as any).Telegram?.WebApp;
      if (tg && isTelegram) {
          // Optional: Close app or send data
          // tg.sendData(JSON.stringify(consultationForm));
      }
    }, 500);
  };

  // --- Product CRUD ---
  const updateProduct = (updatedProduct: Product) => {
      if (updatedProduct.variants && updatedProduct.variants.length > 0) {
          const relatedIds = updatedProduct.variants.map(v => v.productId);
          if (!relatedIds.includes(updatedProduct.id)) relatedIds.push(updatedProduct.id);
          
          setProducts(prev => prev.map(p => {
              if (p.id === updatedProduct.id) return updatedProduct;
              
              if (relatedIds.includes(p.id)) {
                  return {
                      ...p,
                      variantLabels: updatedProduct.variantLabels,
                      variants: updatedProduct.variants
                  };
              }
              return p;
          }));
      } else {
          setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      }
  };

  const deleteProduct = (id: number) => {
      setProducts(prev => prev.filter(p => p.id !== id));
      setFavorites(prev => prev.filter(favId => favId !== id));
  };

  const addProducts = (newProducts: Product[]) => {
      setProducts(prev => [...newProducts, ...prev]);
  };
  
  const importProducts = (importedProducts: Product[]) => {
      setProducts(prev => {
          const currentProducts = [...prev];
          
          importedProducts.forEach(imported => {
              const existingIndex = currentProducts.findIndex(p => 
                  p.sku.toLowerCase() === imported.sku.toLowerCase()
              );
              
              if (existingIndex >= 0) {
                  currentProducts[existingIndex] = { ...imported, id: currentProducts[existingIndex].id };
              } else {
                  currentProducts.push(imported);
              }
          });
          
          return currentProducts;
      });
  };

  // --- Category CRUD ---
  const addCategory = (newCategory: Category) => {
      setCategories(prev => [...prev, newCategory]);
  };

  const updateCategory = (updatedCategory: Category) => {
      setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };

  const updateCategories = (updatedCategories: Category[]) => {
      setCategories(prev => {
          const newCats = [...prev];
          updatedCategories.forEach(u => {
              const idx = newCats.findIndex(c => c.id === u.id);
              if (idx !== -1) newCats[idx] = u;
          });
          return newCats;
      });
  };

  const deleteCategory = (id: number) => {
      setCategories(prev => {
          const newCats = prev.filter(c => c.id !== id).map(c => {
              if (c.parentId === id) {
                  return { ...c, parentId: null };
              }
              return c;
          });
          return newCats;
      });
      if (selectedCategory === id) setSelectedCategory(null);
  };

  // --- Data Management ---
  const resetDatabase = () => {
      if (window.confirm("Вы уверены, что хотите сбросить базу данных до начальных демо-товаров? Все ваши изменения будут потеряны.")) {
          setProducts(mockProducts);
          setCategories(mockCategories);
          localStorage.removeItem('db_products');
          localStorage.removeItem('db_categories');
          localStorage.removeItem('store_stats');
          window.location.reload();
      }
  };
  
  const deleteAllProducts = () => {
      if (window.confirm("ВНИМАНИЕ: Это удалит ВСЕ товары из базы данных. Вы уверены?")) {
          setProducts([]);
      }
  };

  const restoreDatabase = (data: any) => {
    if (!data || typeof data !== 'object') {
        alert("Неверный формат файла бэкапа.");
        return;
    }
    
    if (window.confirm("ВНИМАНИЕ: Это действие полностью заменит текущую базу данных (товары, категории, настройки) данными из файла. Текущие данные будут потеряны. Продолжить?")) {
        try {
            if (Array.isArray(data.products)) setProducts(data.products);
            if (Array.isArray(data.categories)) setCategories(data.categories);
            if (data.settings && typeof data.settings === 'object') setStoreSettings(data.settings);
            if (Array.isArray(data.stickers)) setStickers(data.stickers);
            if (data.stats) setStats(data.stats);
            
            alert("База данных успешно восстановлена!");
        } catch (e) {
            console.error("Restore error", e);
            alert("Ошибка при восстановлении данных.");
        }
    }
  };

  const handleAdminLoginSuccess = () => {
    setIsAdmin(true);
    localStorage.setItem('admin_phone', '89203718545');
    setCurrentScreen(Screen.ADMIN_DASHBOARD);
  };

  const handleAdminLogout = () => {
    setIsAdmin(false);
    localStorage.removeItem('admin_phone');
    setCurrentScreen(Screen.START);
  };

  // Filter logic
  const getCategoryIdsIncludingChildren = (rootId: number): number[] => {
      const result = [rootId];
      const children = categories.filter(c => c.parentId === rootId);
      children.forEach(child => {
          result.push(...getCategoryIdsIncludingChildren(child.id));
      });
      return result;
  };

  const getEffectivePrice = (p: Product) => p.specialPrice ?? p.price;
  const getDiscountAmount = (p: Product) => p.specialPrice ? (p.price - p.specialPrice) : 0;

  const getFilteredProducts = () => {
    if (searchQuery.trim().length > 0) {
        return products.filter(p => 
            (p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
             p.sku.toLowerCase().includes(searchQuery.toLowerCase())) &&
            p.status
        );
    }

    if (selectedCategory === null) {
        return []; 
    }

    return products.filter(p => {
        if (storeSettings.showProductsFromSubcategories) {
             const allowedIds = getCategoryIdsIncludingChildren(selectedCategory);
             return allowedIds.includes(p.categoryId) && p.status;
        } else {
             return p.categoryId === selectedCategory && p.status;
        }
    });
  };
  
  const filteredProducts = getFilteredProducts().sort((a, b) => {
      switch (sortOption) {
          case SortOption.PRICE_ASC:
              return getEffectivePrice(a) - getEffectivePrice(b);
          case SortOption.PRICE_DESC:
              return getEffectivePrice(b) - getEffectivePrice(a);
          case SortOption.DISCOUNT_DESC:
              return getDiscountAmount(b) - getDiscountAmount(a);
          case SortOption.DISCOUNT_ASC:
              return getDiscountAmount(a) - getDiscountAmount(b);
          default:
              return 0; 
      }
  });

  const favoriteProducts = products.filter(p => favorites.includes(p.id) && p.status);

  // --- Screens ---

  const renderStartScreen = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-gradient-to-b from-blue-50 to-gray-200 dark:from-[#17212b] dark:to-[#0e1621] relative transition-colors duration-300">
      
      {/* Theme Toggle */}
      <button 
        onClick={toggleTheme}
        className="absolute top-4 right-4 p-2 rounded-full bg-white/20 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white/40 transition-all"
      >
        {isDarkMode ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
        )}
      </button>

      <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-6 shadow-lg animate-bounce-slow p-1">
        <img src={storeSettings.logoUrl} alt="Logo" className="w-full h-full rounded-full object-contain" />
      </div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">{storeSettings.name}</h1>
      <p className="text-gray-600 dark:text-gray-400 mb-8 text-lg transition-colors">{storeSettings.description}</p>
      
      <button 
        onClick={() => handleTabChange(Screen.CATALOG)}
        className="w-full max-w-xs bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded-2xl shadow-lg transition-all transform hover:scale-105 mb-4 flex items-center justify-center"
      >
        <svg className="w-6 h-6 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
        Перейти в каталог
      </button>
      
      <button 
        onClick={() => handleTabChange(Screen.CONSULTATION)}
        className="w-full max-w-xs bg-white dark:bg-[#2b343f] hover:bg-gray-100 dark:hover:bg-[#35404d] text-blue-500 dark:text-blue-400 font-bold py-4 px-6 rounded-2xl shadow-lg transition-all border border-gray-200 dark:border-gray-700 mb-8"
      >
        Запросить консультацию
      </button>

      {isAdmin ? (
        <button 
          onClick={() => setCurrentScreen(Screen.ADMIN_DASHBOARD)}
          className="w-full max-w-xs bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-800 dark:text-green-400 font-bold py-3 px-6 rounded-2xl shadow-lg transition-all border border-gray-300 dark:border-gray-600 flex items-center justify-center mt-auto pb-4"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Панель администратора
        </button>
      ) : (
        <button 
          onClick={() => setCurrentScreen(Screen.ADMIN_LOGIN)}
          className="text-xs text-gray-500 dark:text-gray-600 hover:text-gray-700 dark:hover:text-gray-400 flex items-center justify-center mt-auto pb-4 opacity-50 hover:opacity-100 transition-opacity"
        >
          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
          Администратор
        </button>
      )}
    </div>
  );

  const renderCatalog = () => {
    const visibleCategories = searchQuery.trim().length > 0 
        ? [] 
        : categories
            .filter(c => {
                if (selectedCategory === null) return c.parentId === null || c.parentId === undefined;
                return c.parentId === selectedCategory;
            })
            .filter(c => c.status !== false)
            .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));

    const currentCategoryObj = selectedCategory ? categories.find(c => c.id === selectedCategory) : null;

    const handleGoBack = () => {
        if (currentCategoryObj && currentCategoryObj.parentId) {
            setSelectedCategory(currentCategoryObj.parentId);
        } else {
            setSelectedCategory(null);
        }
    };

    return (
        <div className="flex flex-col h-full relative bg-gray-50 dark:bg-[#0e1621] transition-colors">
        <div className="p-4 bg-white dark:bg-[#17212b] sticky top-0 z-10 shadow-md transition-colors">
            <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                    {selectedCategory !== null && (
                         <button onClick={handleGoBack} className="mr-1 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
                             <svg className="w-6 h-6 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                         </button>
                    )}
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors">
                        {selectedCategory !== null ? currentCategoryObj?.name : 'Каталог'}
                    </h2>
                </div>
                
                <div className="flex gap-2">
                    <button 
                        onClick={toggleTheme}
                        className="bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 p-2 rounded-lg transition-colors"
                    >
                        {isDarkMode ? (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                        ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                        )}
                    </button>
                    {isAdmin && (
                        <button 
                            onClick={() => setCurrentScreen(Screen.ADMIN_DASHBOARD)}
                            className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-green-600 dark:text-green-400 p-2 rounded-lg transition-colors"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </button>
                    )}
                </div>
            </div>
            
            {/* Search and Sort */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <input 
                        type="text" 
                        placeholder="Поиск..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-gray-100 dark:bg-[#0e1621] text-gray-900 dark:text-white border border-gray-300 dark:border-gray-700 rounded-xl py-3 pl-10 pr-4 focus:outline-none focus:border-blue-500 transition-colors placeholder-gray-500 dark:placeholder-gray-500"
                    />
                    <svg className="absolute left-3 top-3.5 text-gray-500 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                </div>
                <button 
                    onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                    className={`px-3 rounded-xl border transition-colors flex items-center justify-center ${sortOption !== SortOption.DEFAULT ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-100 dark:bg-[#0e1621] border-gray-300 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" /></svg>
                </button>
            </div>

            {/* Sort Menu Overlay */}
            {isSortMenuOpen && (
                <div className="absolute top-[130px] right-4 z-50 bg-white dark:bg-[#242d37] border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl w-64 p-2 animate-fade-in">
                    <div className="text-xs text-gray-500 font-bold px-3 py-2">Сортировка</div>
                    {[
                        { id: SortOption.DEFAULT, label: 'По умолчанию' },
                        { id: SortOption.PRICE_ASC, label: 'Сначала дешевые' },
                        { id: SortOption.PRICE_DESC, label: 'Сначала дорогие' },
                        { id: SortOption.DISCOUNT_DESC, label: 'Сначала с большой скидкой' },
                        { id: SortOption.DISCOUNT_ASC, label: 'Сначала с меньшей скидкой' },
                    ].map((opt) => (
                        <button
                            key={opt.id}
                            onClick={() => { setSortOption(opt.id); setIsSortMenuOpen(false); }}
                            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${sortOption === opt.id ? 'bg-blue-600 text-white' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
                        >
                            {opt.label}
                        </button>
                    ))}
                </div>
            )}
            
            {/* Backdrop for sort menu */}
            {isSortMenuOpen && <div className="fixed inset-0 z-40" onClick={() => setIsSortMenuOpen(false)}></div>}
        </div>

        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {/* Categories Grid (Tiles) */}
            {visibleCategories.length > 0 && (
                <div className="mb-6">
                    <div className="grid grid-cols-2 gap-3">
                        {visibleCategories.map(cat => (
                            <div 
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className="bg-white dark:bg-[#17212b] rounded-xl p-3 border border-gray-200 dark:border-gray-700 shadow-sm active:scale-95 transition-transform cursor-pointer flex flex-col items-center text-center h-full"
                            >
                                <div className="w-16 h-16 mb-2 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                                    {cat.showImage && cat.image ? (
                                        <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                                    )}
                                </div>
                                <span className="text-sm font-bold text-gray-800 dark:text-gray-200 leading-tight">{cat.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Products Grid */}
            {filteredProducts.length > 0 && (
                <>
                    {visibleCategories.length > 0 && (
                         <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-3">Товары</h3>
                    )}
                    <div className="grid grid-cols-2 gap-4 pb-20">
                        {filteredProducts.map(product => (
                            <ProductCard key={product.id} product={product} onClick={handleProductClick} allStickers={stickers} />
                        ))}
                    </div>
                </>
            )}

            {/* Empty State */}
            {filteredProducts.length === 0 && visibleCategories.length === 0 && (
                 <div className="col-span-2 text-center text-gray-500 mt-10">
                     <svg className="w-16 h-16 mx-auto mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                     <p>Ничего не найдено 😔</p>
                     {selectedCategory !== null && !searchQuery && (
                         <p className="text-xs mt-2">В этой категории пока нет товаров</p>
                     )}
                 </div>
            )}
        </div>
        </div>
    );
  };

  // ... (Product Details, Consultation, Confirmation, Favorites, Admin Logic remains the same)
  // Retaining all original logic for these functions, just ensuring `renderMainContent` is called correctly below.

  const renderProductDetails = () => {
    if (!selectedProduct) return null;
    const isFav = favorites.includes(selectedProduct.id);

    let displayPrice = selectedProduct.price;
    let displaySpecialPrice = selectedProduct.specialPrice;
    let displayStock = selectedProduct.stock;

    if (selectedProduct.isBundle && selectedProduct.bundleItems && selectedProduct.bundleItems.length > 0) {
        let calculatedPrice = 0;
        let minStock = 999999;
        selectedProduct.bundleItems.forEach(itemId => {
            const item = products.find(p => p.id === itemId);
            if (item) {
                calculatedPrice += (item.specialPrice ?? item.price);
                if (item.stock < minStock) minStock = item.stock;
            }
        });
        displayPrice = calculatedPrice;
        displaySpecialPrice = undefined;
        displayStock = minStock === 999999 ? 0 : minStock;
    }
    
    const handleVariantSwitch = (labelIndex: number, selectedValue: string) => {
        if (!selectedProduct.variants) return;
        const currentValues = selectedProduct.variantValues || [];
        const targetValues = [...currentValues];
        targetValues[labelIndex] = selectedValue;
        let bestMatch = selectedProduct.variants.find(v => v.values.every((val, idx) => val === targetValues[idx]));
        if (!bestMatch) bestMatch = selectedProduct.variants.find(v => v.values[labelIndex] === selectedValue);
        if (bestMatch) {
            const targetProduct = products.find(p => p.id === bestMatch?.productId);
            if (targetProduct) handleProductClick(targetProduct);
        }
    };

    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0e1621] overflow-y-auto custom-scrollbar relative transition-colors">
        <button 
            onClick={() => setCurrentScreen(activeTab)}
            className="absolute top-4 left-4 z-20 bg-black/40 backdrop-blur-md p-2 rounded-full text-white hover:bg-black/60 transition-colors"
        >
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        </button>

        <div className="w-full bg-gray-200 dark:bg-gray-800 relative">
             <ProductGallery images={selectedProduct.images && selectedProduct.images.length > 0 ? selectedProduct.images : [selectedProduct.image]} alt={selectedProduct.name} />
        </div>

        <div className="p-6 relative z-10 flex-1">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <div className="flex flex-wrap gap-1 mb-2">
                        {selectedProduct.stickerIds && selectedProduct.stickerIds.map(sid => {
                            const sticker = stickers.find(s => s.id === sid);
                            if (!sticker) return null;
                            return (
                                <span 
                                    key={sid}
                                    className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide"
                                    style={{ backgroundColor: sticker.bgColor, color: sticker.textColor }}
                                >
                                    {sticker.name}
                                </span>
                            );
                        })}
                        {selectedProduct.isBundle && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-600 text-white">
                                КОМПЛЕКТ
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white leading-tight mb-1">{selectedProduct.name}</h1>
                    {storeSettings.showSku && (
                        <p className="text-gray-500 dark:text-gray-400 text-sm">Артикул: {selectedProduct.sku}</p>
                    )}
                </div>
                <div className="text-right">
                     {displaySpecialPrice ? (
                         <div className="flex flex-col">
                             <span className="text-2xl font-bold text-red-500 whitespace-nowrap">{displaySpecialPrice.toLocaleString()} ₽</span>
                             <span className="text-sm text-gray-400 dark:text-gray-500 line-through">{displayPrice.toLocaleString()} ₽</span>
                         </div>
                     ) : (
                         <span className="text-2xl font-bold text-blue-600 dark:text-blue-400 whitespace-nowrap">{displayPrice.toLocaleString()} ₽</span>
                     )}
                </div>
            </div>
            
            <div className="flex items-center mb-6">
                 <div className={`w-2 h-2 rounded-full mr-2 ${displayStock > 0 ? 'bg-green-500' : 'bg-red-500'}`}></div>
                 <span className={`text-sm ${displayStock > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {displayStock > 0 ? `В наличии: ${displayStock}` : 'Нет в наличии'}
                 </span>
            </div>

             {/* --- BUNDLE CONTENTS --- */}
             {selectedProduct.isBundle && selectedProduct.bundleItems && selectedProduct.bundleItems.length > 0 && (
                <div className="mb-6 bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
                    <h4 className="text-gray-900 dark:text-white text-sm font-bold mb-3">В этот комплект входит:</h4>
                    <div className="space-y-3">
                        {selectedProduct.bundleItems.map(itemId => {
                            const item = products.find(p => p.id === itemId);
                            if (!item) return null;
                            return (
                                <div 
                                    key={itemId} 
                                    onClick={() => handleProductClick(item)}
                                    className="flex items-center gap-3 bg-white dark:bg-[#17212b] p-2 rounded-lg shadow-sm cursor-pointer hover:shadow-md transition-shadow"
                                >
                                    <img src={item.image} alt={item.name} className="w-12 h-12 rounded object-cover" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-xs font-bold text-gray-800 dark:text-white truncate">{item.name}</div>
                                        <div className="text-[10px] text-gray-500">{(item.specialPrice ?? item.price).toLocaleString()} ₽</div>
                                    </div>
                                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                </div>
                            );
                        })}
                    </div>
                    <div className="mt-3 pt-2 border-t border-purple-200 dark:border-purple-800 flex justify-between items-center text-xs">
                        <span className="text-gray-600 dark:text-gray-400">Общая стоимость:</span>
                        <span className="font-bold text-gray-900 dark:text-white text-sm">{displayPrice.toLocaleString()} ₽</span>
                    </div>
                </div>
            )}
            
            {!selectedProduct.isBundle && selectedProduct.variants && selectedProduct.variants.length > 0 && selectedProduct.variantLabels && (
                <div className="mb-6 space-y-4">
                    {selectedProduct.variantLabels.map((label, labelIdx) => {
                        const availableValues = Array.from(new Set(
                            selectedProduct.variants?.map(v => v.values[labelIdx]).filter(Boolean)
                        ));
                        const currentValue = selectedProduct.variantValues?.[labelIdx];
                        if (availableValues.length === 0) return null;

                        return (
                            <div key={labelIdx}>
                                <h4 className="text-gray-900 dark:text-white text-sm font-bold mb-2">{label}:</h4>
                                <div className="flex flex-wrap gap-2">
                                   {availableValues.map(val => {
                                      const isActive = val === currentValue;
                                      return (
                                         <button
                                            key={val}
                                            onClick={() => handleVariantSwitch(labelIdx, val)}
                                            className={`px-4 py-2 rounded-lg border text-sm transition-all ${
                                                isActive 
                                                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold' 
                                                    : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-400 dark:hover:border-gray-500'
                                            }`}
                                         >
                                           {val}
                                         </button>
                                      )
                                   })}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {selectedProduct.attributes && selectedProduct.attributes.length > 0 && (
                <div className="mb-6 bg-gray-100 dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                    <h4 className="text-gray-900 dark:text-white text-sm font-bold mb-2 border-b border-gray-300 dark:border-gray-600 pb-1">Характеристики</h4>
                    <ul className="space-y-1">
                        {selectedProduct.attributes.map((attr, idx) => (
                            <li key={idx} className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">{attr.name}</span>
                                <span className="text-gray-800 dark:text-gray-200 text-right ml-2">{attr.text}</span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="prose prose-sm mb-8 max-w-none">
                <h3 className="text-gray-900 dark:text-white font-semibold mb-2">Описание</h3>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {selectedProduct.description || "Загрузка описания..."}
                </p>
            </div>

            {/* --- REAL PHOTOS GALLERY --- */}
            {storeSettings.realPhotosEnabled && storeSettings.realPhotos && storeSettings.realPhotos.length > 0 && (
                <div className="mb-8">
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg mb-3 flex items-center">
                        <svg className="w-5 h-5 mr-2 text-yellow-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                        {storeSettings.realPhotosLabel || "Фото от покупателей"}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {storeSettings.realPhotos.map((photo, index) => (
                            <div 
                                key={index} 
                                className="aspect-square rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-800 cursor-pointer relative group"
                                onClick={() => setLightboxImage(photo)}
                            >
                                <img src={photo} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="Real photo" />
                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                     <svg className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="grid grid-cols-4 gap-3 pb-8">
                <button 
                    onClick={() => toggleFavorite(selectedProduct.id)}
                    className={`col-span-1 flex items-center justify-center rounded-xl border ${isFav ? 'border-red-500 bg-red-50 dark:bg-red-500/20 text-red-500' : 'border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'} transition-colors h-14`}
                >
                     <svg className="w-6 h-6" fill={isFav ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                </button>
                <button 
                    onClick={() => handleConsultationRequest(selectedProduct)}
                    className="col-span-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-colors h-14 flex items-center justify-center"
                >
                    Запросить информацию
                </button>
            </div>
        </div>
      </div>
    );
  };

  const renderConsultation = () => (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0e1621] p-6 overflow-y-auto custom-scrollbar transition-colors">
       <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Консультация</h2>

       <div className="mb-8 bg-white dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
          <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">Нужен быстрый ответ?</p>
          <a 
            href={storeSettings.managerContact}
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center w-full bg-gray-100 dark:bg-[#242d37] hover:bg-gray-200 dark:hover:bg-[#2f3a49] text-blue-500 dark:text-blue-400 font-bold py-3 rounded-xl border border-blue-500/30 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            Написать менеджеру
          </a>
       </div>

       <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 border-b border-gray-200 dark:border-gray-700 pb-2">Или оставьте заявку</h3>
       <form onSubmit={submitConsultation} className="flex flex-col space-y-4 pb-20">
          <div>
              <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Ваше имя</label>
              <input 
                required
                type="text"
                className="w-full bg-white dark:bg-[#17212b] border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                value={consultationForm.name}
                onChange={e => setConsultationForm({...consultationForm, name: e.target.value})}
                placeholder="Иван Иванов"
              />
          </div>
          <div>
              <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Телефон</label>
              <input 
                required
                type="tel"
                className="w-full bg-white dark:bg-[#17212b] border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                value={consultationForm.phone}
                onChange={e => setConsultationForm({...consultationForm, phone: e.target.value})}
                placeholder="+7 (999) 000-00-00"
              />
          </div>
          <div>
              <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Ваш вопрос</label>
              <textarea 
                required
                rows={5}
                className="w-full bg-white dark:bg-[#17212b] border border-gray-300 dark:border-gray-700 rounded-xl p-3 text-gray-900 dark:text-white focus:border-blue-500 focus:outline-none resize-none transition-colors"
                value={consultationForm.question}
                onChange={e => setConsultationForm({...consultationForm, question: e.target.value})}
                placeholder="Опишите, что вас интересует..."
              />
          </div>
          <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg mt-4">
              Отправить запрос
          </button>
       </form>
    </div>
  );

  const renderConfirmation = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-white dark:bg-[#0e1621] transition-colors">
        <div className="w-20 h-20 bg-green-100 dark:bg-green-500/20 rounded-full flex items-center justify-center mb-6">
            <svg className="w-10 h-10 text-green-600 dark:text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Заявка принята!</h2>
        <p className="text-gray-600 dark:text-gray-400 mb-8">Мы свяжемся с вами в течение 24 часов для уточнения деталей.</p>
        <button 
            onClick={() => handleTabChange(Screen.CATALOG)}
            className="bg-gray-100 dark:bg-[#2b343f] hover:bg-gray-200 dark:hover:bg-[#35404d] text-gray-900 dark:text-white font-bold py-3 px-8 rounded-xl border border-gray-300 dark:border-gray-700 transition-colors"
        >
            Вернуться в каталог
        </button>
    </div>
  );

  const renderFavorites = () => (
      <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0e1621] transition-colors">
          <div className="p-4 bg-white dark:bg-[#17212b] border-b border-gray-200 dark:border-gray-700 transition-colors">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Избранное ({favoriteProducts.length})</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {favoriteProducts.length > 0 ? (
                <div className="grid grid-cols-2 gap-4 pb-20">
                    {favoriteProducts.map(product => (
                        <ProductCard key={product.id} product={product} onClick={handleProductClick} allStickers={stickers} />
                    ))}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 pb-20">
                    <svg className="w-16 h-16 mb-4 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    <p>В избранном пока пусто</p>
                </div>
            )}
          </div>
      </div>
  );

  const renderMainContent = () => {
    switch (currentScreen) {
        case Screen.START: return renderStartScreen();
        case Screen.CATALOG: return renderCatalog();
        case Screen.PRODUCT_DETAILS: return renderProductDetails();
        case Screen.CONSULTATION: return renderConsultation();
        case Screen.CONFIRMATION: return renderConfirmation();
        case Screen.FAVORITES: return renderFavorites();
        case Screen.ADMIN_LOGIN: 
        case Screen.ADMIN_DASHBOARD:
            return (
              <AdminPanel 
                 products={products} 
                 categories={categories}
                 storeSettings={storeSettings}
                 stickers={stickers}
                 stats={stats}
                 onUpdateStickers={setStickers}
                 onUpdateStoreSettings={setStoreSettings}
                 onUpdateProduct={updateProduct} 
                 onDeleteProduct={deleteProduct}
                 onAddProducts={addProducts}
                 onImportProducts={importProducts}
                 onAddCategory={addCategory}
                 onUpdateCategory={updateCategory}
                 onUpdateCategories={updateCategories}
                 onDeleteCategory={deleteCategory}
                 onResetDB={resetDatabase}
                 onDeleteAll={deleteAllProducts}
                 onRestoreDatabase={restoreDatabase}
                 onExit={() => handleTabChange(Screen.CATALOG)}
                 onLogout={handleAdminLogout}
                 onLoginSuccess={handleAdminLoginSuccess}
                 isAdmin={isAdmin}
              />
            );
        default: return renderCatalog();
    }
  };

  const shouldShowBottomNav = () => {
    return [Screen.CATALOG, Screen.CONSULTATION, Screen.FAVORITES].includes(activeTab) 
           && currentScreen !== Screen.START 
           && currentScreen !== Screen.CONFIRMATION
           && currentScreen !== Screen.PRODUCT_DETAILS
           && currentScreen !== Screen.ADMIN_LOGIN
           && currentScreen !== Screen.ADMIN_DASHBOARD;
  };

  // If running in Telegram, we want full width and no border/shadow simulation
  // If running in Browser (default), we keep the mobile simulation frame
  const containerClasses = isTelegram 
     ? "relative flex flex-col w-full h-screen bg-gray-50 dark:bg-[#0e1621] overflow-hidden transition-colors duration-300"
     : "relative flex flex-col w-full h-[100vh] md:h-[95vh] md:w-[400px] bg-gray-50 dark:bg-[#0e1621] md:rounded-3xl shadow-2xl overflow-hidden md:border border-gray-300 dark:border-gray-700 transition-colors duration-300";

  return (
    <div className={isDarkMode ? 'dark' : ''}>
        <div className={`flex justify-center items-center min-h-screen ${isTelegram ? 'bg-gray-50 dark:bg-[#0e1621]' : 'bg-gray-200 dark:bg-gray-900'} font-sans text-gray-900 dark:text-gray-100 transition-colors duration-300`}>
        <div className={containerClasses}>
            
            <main className="flex-1 overflow-hidden relative">
            {renderMainContent()}
            </main>

            {shouldShowBottomNav() && (
            <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />
            )}

            {/* Lightbox Overlay */}
            {lightboxImage && (
                <div 
                    className="absolute inset-0 z-[100] bg-black/95 flex items-center justify-center animate-fade-in cursor-zoom-out"
                    onClick={() => setLightboxImage(null)}
                >
                    <button 
                        className="absolute top-4 right-4 text-white/70 hover:text-white bg-white/10 rounded-full p-2"
                        onClick={() => setLightboxImage(null)}
                    >
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                    <img 
                        src={lightboxImage} 
                        alt="Full screen" 
                        className="max-w-full max-h-full object-contain p-2" 
                        onClick={(e) => e.stopPropagation()} 
                    />
                </div>
            )}

        </div>
        </div>
    </div>
  );
};

export default App;
