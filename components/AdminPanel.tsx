
import React, { useState, useRef, useEffect } from 'react';
import { Product, Category, ProductVariant, Sticker } from '../types';

interface AdminPanelProps {
  products: Product[];
  categories: Category[];
  storeSettings: {
      name: string;
      description: string;
      logoUrl: string;
      managerContact: string;
      showSku: boolean;
      realPhotosEnabled: boolean;
      realPhotosLabel: string;
      realPhotos: string[];
      showProductsFromSubcategories: boolean;
  };
  stickers: Sticker[];
  stats: {
      favoritesCount: number;
      consultationsCount: number;
  };
  onUpdateStickers: (stickers: Sticker[]) => void;
  onUpdateStoreSettings: (settings: any) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (id: number) => void;
  onAddProducts: (products: Product[]) => void;
  onImportProducts: (products: Product[]) => void;
  onAddCategory: (category: Category) => void;
  onUpdateCategory: (category: Category) => void;
  onUpdateCategories: (categories: Category[]) => void; // Batch update
  onDeleteCategory: (id: number) => void;
  onResetDB: () => void;
  onDeleteAll: () => void;
  onRestoreDatabase: (data: any) => void;
  onExit: () => void;
  onLoginSuccess: () => void;
  onLogout: () => void;
  isAdmin: boolean;
}

const AdminPanel: React.FC<AdminPanelProps> = ({ 
    products, 
    categories,
    storeSettings,
    stickers,
    stats,
    onUpdateStickers,
    onUpdateStoreSettings,
    onUpdateProduct, 
    onDeleteProduct, 
    onAddProducts,
    onImportProducts,
    onAddCategory,
    onUpdateCategory,
    onUpdateCategories,
    onDeleteCategory,
    onResetDB,
    onDeleteAll,
    onRestoreDatabase,
    onExit, 
    onLoginSuccess, 
    onLogout, 
    isAdmin 
}) => {
  const [phone, setPhone] = useState('');
  const [activeSection, setActiveSection] = useState<'products' | 'categories' | 'settings' | 'interface' | 'statistics'>('products');
  
  // Filter State
  const [filterCategoryId, setFilterCategoryId] = useState<number | null>(null);
  
  // Notification State
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Modal States
  const [showImportModal, setShowImportModal] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddCategoryModal, setShowAddCategoryModal] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  
  // DnD State
  const [draggedItemId, setDraggedItemId] = useState<number | null>(null);
  
  // Editing State
  const [editingId, setEditingId] = useState<number | null>(null);
  
  // Store Settings Local State
  const [localSettings, setLocalSettings] = useState(storeSettings);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const realPhotoInputRef = useRef<HTMLInputElement>(null);

  // Sticker Management State
  const [newSticker, setNewSticker] = useState({ name: '', bgColor: '#3b82f6', textColor: '#ffffff' });

  // Variant/Bundle UI State
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [showProductSearchResults, setShowProductSearchResults] = useState(false);

  // Product Form Helper State for Split Category Selection
  const [formParentCategory, setFormParentCategory] = useState<number | 'root'>('root');

  useEffect(() => {
      setLocalSettings(storeSettings);
  }, [storeSettings]);
  
  // Add/Edit Product State
  const [newProduct, setNewProduct] = useState<{
    name: string;
    sku: string;
    price: string;
    specialPrice: string;
    stock: string;
    description: string;
    mainImage: string;
    additionalImages: string; // Comma separated
    categoryId: number;
    attributes: { name: string; text: string }[];
    variantLabels: string[]; // Array of labels
    variantValues: string[]; // Array of own values
    variants: ProductVariant[];
    stickerIds: string[];
    isBundle: boolean;
    bundleItems: number[];
  }>({
    name: '',
    sku: '',
    price: '',
    specialPrice: '',
    stock: '10',
    description: '',
    mainImage: 'https://picsum.photos/seed/new/600/600',
    additionalImages: '',
    categoryId: 1,
    attributes: [{ name: '', text: '' }],
    variantLabels: ['Цвет'], // Default 1 dimension
    variantValues: [''],
    variants: [],
    stickerIds: [],
    isBundle: false,
    bundleItems: []
  });

  // Add/Edit Category State
  const [newCategory, setNewCategory] = useState<{
      name: string;
      parentId: string;
      image: string;
      showImage: boolean;
      sortOrder: number;
      status: boolean;
  }>({
      name: '',
      parentId: '',
      image: '',
      showImage: true,
      sortOrder: 0,
      status: true
  });

  const ADMIN_PHONE = '89203718545';
  const fileInputRef = useRef<HTMLInputElement>(null);
  const catFileInputRef = useRef<HTMLInputElement>(null);
  const importFileRef = useRef<HTMLInputElement>(null);
  const restoreInputRef = useRef<HTMLInputElement>(null);

  // --- Helpers ---
  const showToastMessage = (message: string, type: 'success' | 'error' = 'success') => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3000);
  };

  // --- Auth ---
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.replace(/\D/g, '').includes(ADMIN_PHONE)) {
        onLoginSuccess();
    } else {
        showToastMessage('Неверный номер телефона', 'error');
    }
  };

  // --- Generic Helpers ---
  const processFile = (file: File, callback: (base64: string) => void) => {
      if (!file.type.startsWith('image/')) {
          showToastMessage('Пожалуйста, загрузите изображение.', 'error');
          return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
          callback(reader.result as string);
      };
      reader.readAsDataURL(file);
  };

  // --- BACKUP / RESTORE Logic ---
  const handleDownloadStaticDB = () => {
    const dbData = {
        products,
        categories,
        settings: storeSettings,
        stickers,
        stats
    };
    const blob = new Blob([JSON.stringify(dbData, null, 2)], {type : 'application/json'});
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "db.json");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToastMessage('Файл db.json готов! Загрузите его на сервер.');
  };

  const handleBackup = () => {
      const backup = {
          version: 1,
          timestamp: Date.now(),
          products,
          categories,
          settings: storeSettings,
          stickers,
          stats // Include stats in backup
      };
      const blob = new Blob([JSON.stringify(backup, null, 2)], {type : 'application/json'});
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `store_backup_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToastMessage('Бэкап базы данных успешно скачан');
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (event) => {
          try {
            const text = event.target?.result as string;
            if (!text) return;
            const data = JSON.parse(text);
            onRestoreDatabase(data);
          } catch (e) {
              showToastMessage("Ошибка чтения файла бэкапа", "error");
          } finally {
              if (restoreInputRef.current) restoreInputRef.current.value = '';
          }
      };
      reader.readAsText(file);
  };

  // --- EXPORT / IMPORT Logic ---
  
  const handleExport = () => {
      const headers = [
          "Артикул", "Название", "Цена", "Цена по акции", "Категория (ID)", "Остаток", "Статус", "Описание", "Главное фото", "Доп. фото", "Характеристики"
      ];

      const escapeCsv = (val: string | undefined | null) => {
          if (!val) return "";
          const str = String(val);
          if (str.includes(";") || str.includes("\n") || str.includes('"')) {
              return `"${str.replace(/"/g, '""')}"`;
          }
          return str;
      };

      const rows = products.map(p => {
          const attrStr = p.attributes?.map(a => `${a.name}:${a.text}`).join('|') || "";
          const imgsStr = p.images?.join(',') || "";
          
          return [
              escapeCsv(p.sku),
              escapeCsv(p.name),
              p.price,
              p.specialPrice || "",
              p.categoryId,
              p.stock,
              p.status ? 1 : 0,
              escapeCsv(p.description),
              escapeCsv(p.image),
              escapeCsv(imgsStr),
              escapeCsv(attrStr)
          ].join(";");
      });

      const csvContent = "\uFEFF" + [headers.join(";"), ...rows].join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "products_export.csv");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToastMessage('Экспорт успешно завершен');
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      setIsImporting(true);

      const reader = new FileReader();
      reader.onload = (event) => {
          const text = event.target?.result as string;
          if (!text) return;

          // Simple CSV parser
          const lines = text.split(/\r?\n/);
          const newProducts: Product[] = [];
          
          // Skip header (index 0)
          for (let i = 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (!line) continue;

              const matches = line.match(/(".*?"|[^";]+)(?=\s*;|\s*$)/g);
              const cols = matches ? matches.map(m => m.replace(/^"|"$/g, '').replace(/""/g, '"')) : line.split(';');
              
              if (!cols || cols.length < 2) continue;

              if (!cols[0] || !cols[1]) continue;

              const sku = cols[0].trim();
              const name = cols[1].trim();
              const price = parseFloat(cols[2]) || 0;
              const specialPrice = cols[3] ? parseFloat(cols[3]) : undefined;
              const categoryId = parseInt(cols[4]) || 1;
              const stock = parseInt(cols[5]) || 0;
              const status = cols[6] === '1' || cols[6].toLowerCase() === 'true';
              const description = cols[7] || '';
              const mainImage = cols[8] || 'https://picsum.photos/200';
              const addImages = cols[9] ? cols[9].split(',').map(s => s.trim()).filter(s => s) : [];
              
              const rawAttrs = cols[10] || "";
              const attributes = rawAttrs.split('|').map(pair => {
                  const [k, v] = pair.split(':');
                  if (k && v) return { name: k.trim(), text: v.trim() };
                  return null;
              }).filter(a => a !== null) as {name: string, text: string}[];

              newProducts.push({
                  id: Date.now() + i, 
                  sku,
                  name,
                  price,
                  specialPrice,
                  categoryId,
                  stock,
                  status,
                  description,
                  image: mainImage,
                  images: [mainImage, ...addImages],
                  attributes
              });
          }

          if (newProducts.length > 0) {
              onImportProducts(newProducts);
              showToastMessage(`Обработано ${newProducts.length} товаров`);
          } else {
              showToastMessage('Не удалось прочитать товары', 'error');
          }
          setIsImporting(false);
          setShowImportModal(false);
          if (importFileRef.current) importFileRef.current.value = '';
      };
      reader.readAsText(file);
  };

  // --- Product Logic ---
  const toggleProductStatus = (product: Product) => {
    const updated = { ...product, status: !product.status };
    onUpdateProduct(updated);
  };

  const handleProductDelete = (id: number) => {
      if (window.confirm('Вы уверены, что хотите удалить этот товар навсегда?')) {
          onDeleteProduct(id);
          showToastMessage('Товар удален');
      }
  };

  const handleEditProductClick = (product: Product) => {
      setEditingId(product.id);

      // Determine parent category for form
      const currentCat = categories.find(c => c.id === product.categoryId);
      let derivedParent: number | 'root' = 'root';
      if (currentCat && currentCat.parentId) {
          derivedParent = currentCat.parentId;
      } else if (currentCat) {
          // It is a root category itself
          derivedParent = 'root';
      }
      setFormParentCategory(derivedParent);

      setNewProduct({
          name: product.name,
          sku: product.sku,
          price: product.price.toString(),
          specialPrice: product.specialPrice ? product.specialPrice.toString() : '',
          stock: product.stock.toString(),
          description: product.description || '',
          mainImage: product.image,
          additionalImages: product.images ? product.images.slice(1).join(', ') : '',
          categoryId: product.categoryId,
          attributes: product.attributes && product.attributes.length > 0 ? product.attributes : [{ name: '', text: '' }],
          variantLabels: product.variantLabels || ['Цвет'],
          variantValues: product.variantValues || [''],
          variants: product.variants || [],
          stickerIds: product.stickerIds || [],
          isBundle: product.isBundle || false,
          bundleItems: product.bundleItems || []
      });
      setShowAddModal(true);
  };

  const handleNewProductClick = () => {
      setEditingId(null);
      setFormParentCategory('root');
      setNewProduct({
          name: '', sku: '', price: '', specialPrice: '', stock: '10', description: '',
          mainImage: '', additionalImages: '',
          categoryId: 1, attributes: [{ name: '', text: '' }],
          variantLabels: ['Цвет'], variantValues: [''], variants: [], stickerIds: [],
          isBundle: false, bundleItems: []
      });
      setShowAddModal(true);
  };

  const handleAddProductSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newProduct.name) return;
      if (!newProduct.mainImage) { showToastMessage("Добавьте фото товара", "error"); return; }

      let price = parseInt(newProduct.price) || 0;
      let stock = parseInt(newProduct.stock) || 0;
      const specialPrice = newProduct.specialPrice ? parseInt(newProduct.specialPrice) : undefined;

      // Bundle Logic Calculation
      if (newProduct.isBundle && newProduct.bundleItems.length > 0) {
          let calculatedPrice = 0;
          let minStock = 999999;
          
          newProduct.bundleItems.forEach(itemId => {
              const item = products.find(p => p.id === itemId);
              if (item) {
                  calculatedPrice += (item.specialPrice ?? item.price);
                  if (item.stock < minStock) minStock = item.stock;
              }
          });
          
          price = calculatedPrice;
          stock = minStock === 999999 ? 0 : minStock;
      }

      const additionalImgs = newProduct.additionalImages
          ? newProduct.additionalImages.split(',').map(s => s.trim()).filter(s => s)
          : [];
      const allImages = [newProduct.mainImage, ...additionalImgs];
      const finalAttributes = newProduct.attributes.filter(a => a.name.trim() !== '');
      
      // Ensure consistency:
      // 1. Labels are filtered (no empty strings)
      const validLabels = newProduct.variantLabels.filter(l => l.trim() !== '');
      
      // 2. If we have labels, ensure own values match length
      let validValues = [...newProduct.variantValues];
      if (validValues.length < validLabels.length) {
          // Pad with empty
          validValues = [...validValues, ...Array(validLabels.length - validValues.length).fill('')];
      }
      validValues = validValues.slice(0, validLabels.length); // Trim excess

      // 3. Ensure current product is in variant list if variants exist
      let finalVariants = [...newProduct.variants];
      if (finalVariants.length > 0 && editingId) {
          // Check if self is in list
          const selfIndex = finalVariants.findIndex(v => v.productId === editingId);
          if (selfIndex >= 0) {
              finalVariants[selfIndex] = { productId: editingId, values: validValues };
          } else {
              finalVariants.push({ productId: editingId, values: validValues });
          }
      }
      
      // 4. Ensure all variants have values array matching labels length
      finalVariants = finalVariants.map(v => {
          let vVals = [...v.values];
          if (vVals.length < validLabels.length) vVals = [...vVals, ...Array(validLabels.length - vVals.length).fill('')];
          return { ...v, values: vVals.slice(0, validLabels.length) };
      });

      const productData: Product = {
          id: editingId ? editingId : Date.now(),
          categoryId: newProduct.categoryId,
          name: newProduct.name,
          price: price,
          specialPrice: specialPrice,
          sku: newProduct.sku || `MAN-${Date.now().toString().slice(-4)}`,
          stock: stock,
          status: true,
          image: newProduct.mainImage,
          images: allImages,
          description: newProduct.description,
          attributes: finalAttributes,
          variantLabels: validLabels,
          variantValues: validValues,
          variants: finalVariants,
          stickerIds: newProduct.stickerIds,
          isBundle: newProduct.isBundle,
          bundleItems: newProduct.isBundle ? newProduct.bundleItems : []
      };

      if (editingId) {
          onUpdateProduct(productData);
          showToastMessage('Товар обновлен');
      } else {
          onAddProducts([productData]);
          showToastMessage('Товар добавлен');
      }

      setShowAddModal(false);
  };

  const handleProductDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault(); e.stopPropagation();
      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0], (res) => setNewProduct(p => ({...p, mainImage: res})));
  };

  const handleProductPaste = (e: React.ClipboardEvent) => {
      if (e.clipboardData.files?.[0]) {
          e.preventDefault();
          processFile(e.clipboardData.files[0], (res) => setNewProduct(p => ({...p, mainImage: res})));
      }
  };
  
  const toggleStickerSelection = (id: string) => {
      setNewProduct(prev => {
          const exists = prev.stickerIds.includes(id);
          if (exists) {
              return { ...prev, stickerIds: prev.stickerIds.filter(sid => sid !== id) };
          } else {
              return { ...prev, stickerIds: [...prev.stickerIds, id] };
          }
      });
  };

  // --- Attributes Logic ---
  const handleAttributeChange = (index: number, field: 'name' | 'text', value: string) => {
      const updatedAttributes = newProduct.attributes.map((attr, i) => 
          i === index ? { ...attr, [field]: value } : attr
      );
      setNewProduct(prev => ({ ...prev, attributes: updatedAttributes }));
  };

  const addAttribute = () => {
      setNewProduct(prev => ({ ...prev, attributes: [...prev.attributes, { name: '', text: '' }] }));
  };

  const removeAttribute = (index: number) => {
      setNewProduct(prev => ({ ...prev, attributes: prev.attributes.filter((_, i) => i !== index) }));
  };

  // --- Variants & Bundles Search Logic ---
  const searchProducts = (excludeSelf: boolean = true, excludeVariants: boolean = true, excludeBundleItems: boolean = false) => {
      if (!productSearchQuery.trim()) return [];
      return products.filter(p => {
         const matchesQuery = p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) || p.sku.toLowerCase().includes(productSearchQuery.toLowerCase());
         const isNotSelf = excludeSelf ? p.id !== editingId : true;
         const isNotVariant = excludeVariants ? !newProduct.variants.find(v => v.productId === p.id) : true;
         const isNotBundleItem = excludeBundleItems ? !newProduct.bundleItems.includes(p.id) : true;
         const isNotBundleItSelf = !p.isBundle; // Cannot add a bundle inside a bundle/variant to prevent recursion loops for now

         return matchesQuery && isNotSelf && isNotVariant && isNotBundleItem && isNotBundleItSelf;
      });
  };

  const addVariant = (product: Product) => {
     // Default empty values based on label count
     const emptyVals = Array(newProduct.variantLabels.length).fill('');
     // If target product already has values, use them
     const initialVals = (product.variantValues && product.variantValues.length === emptyVals.length) 
         ? product.variantValues 
         : emptyVals;

     setNewProduct(prev => ({
         ...prev,
         variants: [...prev.variants, { productId: product.id, values: initialVals }]
     }));
     setProductSearchQuery('');
     setShowProductSearchResults(false);
  };

  const addBundleItem = (product: Product) => {
      setNewProduct(prev => ({
          ...prev,
          bundleItems: [...prev.bundleItems, product.id]
      }));
      setProductSearchQuery('');
      setShowProductSearchResults(false);
  };

  const removeVariant = (productId: number) => {
      setNewProduct(prev => ({
          ...prev,
          variants: prev.variants.filter(v => v.productId !== productId)
      }));
  };
  
  const removeBundleItem = (productId: number) => {
      setNewProduct(prev => ({
          ...prev,
          bundleItems: prev.bundleItems.filter(id => id !== productId)
      }));
  };
  
  const updateVariantValue = (productId: number, index: number, newValue: string) => {
       setNewProduct(prev => ({
          ...prev,
          variants: prev.variants.map(v => {
              if (v.productId === productId) {
                  const newVals = [...v.values];
                  newVals[index] = newValue;
                  return { ...v, values: newVals };
              }
              return v;
          })
      }));
  };

  const updateOwnVariantValue = (index: number, newValue: string) => {
      const newVals = [...newProduct.variantValues];
      newVals[index] = newValue;
      setNewProduct(prev => ({ ...prev, variantValues: newVals }));
  };

  const updateVariantLabel = (index: number, newValue: string) => {
      const newLabels = [...newProduct.variantLabels];
      newLabels[index] = newValue;
      setNewProduct(prev => ({ ...prev, variantLabels: newLabels }));
  };

  const addVariantLabel = () => {
      if (newProduct.variantLabels.length >= 2) return;
      setNewProduct(prev => ({ 
          ...prev, 
          variantLabels: [...prev.variantLabels, 'Размер'],
          variantValues: [...prev.variantValues, ''],
          // Update existing variants to have an empty string for the new dimension
          variants: prev.variants.map(v => ({...v, values: [...v.values, '']}))
      }));
  };

  const removeVariantLabel = (index: number) => {
      setNewProduct(prev => ({
          ...prev,
          variantLabels: prev.variantLabels.filter((_, i) => i !== index),
          variantValues: prev.variantValues.filter((_, i) => i !== index),
          variants: prev.variants.map(v => ({
              ...v,
              values: v.values.filter((_, i) => i !== index)
          }))
      }));
  };
  
  const addSelfToVariants = () => {
      if (!editingId) {
          alert("Сначала сохраните товар, чтобы добавить его в варианты.");
          return;
      }
      // Only add if not exists
      if (!newProduct.variants.find(v => v.productId === editingId)) {
          setNewProduct(prev => ({
             ...prev,
             variants: [...prev.variants, { productId: editingId, values: prev.variantValues }]
         }));
      }
  };

  // --- Category Logic ---
  
  const toggleCategoryStatus = (category: Category) => {
      const currentStatus = category.status !== false; // Default to true if undefined
      const updated = { ...category, status: !currentStatus };
      onUpdateCategory(updated);
  };

  // Drag and Drop Handlers (Keep as is...)
  const handleDragStart = (e: React.DragEvent, id: number) => {
      setDraggedItemId(id);
      e.dataTransfer.setData('text/plain', id.toString());
      e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetId: number, targetParentId: number | null) => {
      e.preventDefault();
      const draggedId = parseInt(e.dataTransfer.getData('text/plain'));
      if (draggedId === targetId) return;
      const draggedCat = categories.find(c => c.id === draggedId);
      if (!draggedCat) return;
      const siblings = categories.filter(c => c.parentId === (targetParentId ?? null));
      const sortedSiblings = [...siblings].sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      const filteredSiblings = sortedSiblings.filter(c => c.id !== draggedId);
      const targetIndex = filteredSiblings.findIndex(c => c.id === targetId);
      if (targetIndex === -1) return;
      filteredSiblings.splice(targetIndex, 0, draggedCat);
      const updates: Category[] = [];
      filteredSiblings.forEach((cat, index) => {
          const newOrder = index + 1;
          if (cat.sortOrder !== newOrder || cat.parentId !== targetParentId) {
              updates.push({ ...cat, sortOrder: newOrder, parentId: targetParentId });
          }
      });
      if (updates.length > 0) {
          onUpdateCategories(updates);
          showToastMessage('Порядок категорий обновлен');
      }
      setDraggedItemId(null);
  };

  const handleNewCategoryClick = () => {
      setEditingId(null);
      const maxOrder = Math.max(0, ...categories.map(c => c.sortOrder || 0));
      setNewCategory({ name: '', parentId: '', image: '', showImage: true, sortOrder: maxOrder + 1, status: true });
      setShowAddCategoryModal(true);
  };

  const handleEditCategoryClick = (cat: Category) => {
      setEditingId(cat.id);
      setNewCategory({
          name: cat.name,
          parentId: cat.parentId ? cat.parentId.toString() : '',
          image: cat.image || '',
          showImage: cat.showImage ?? true,
          sortOrder: cat.sortOrder || 0,
          status: cat.status !== false
      });
      setShowAddCategoryModal(true);
  };

  const handleCategoryDelete = (id: number) => {
      if (window.confirm('Удалить категорию? Вложенные категории переместятся в корень.')) {
          onDeleteCategory(id);
          showToastMessage('Категория удалена');
      }
  };

  const handleCategorySubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newCategory.name) return;
      const parentId = newCategory.parentId ? parseInt(newCategory.parentId) : null;
      const categoryData: Category = {
          id: editingId ? editingId : Date.now(),
          name: newCategory.name,
          parentId: parentId,
          image: newCategory.image,
          showImage: newCategory.showImage,
          sortOrder: Number(newCategory.sortOrder),
          status: newCategory.status
      };
      if (editingId) {
          onUpdateCategory(categoryData);
          showToastMessage('Категория обновлена');
      } else {
          onAddCategory(categoryData);
          showToastMessage('Категория создана');
      }
      setShowAddCategoryModal(false);
  };

  const handleCategoryDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault(); e.stopPropagation();
      if (e.dataTransfer.files?.[0]) processFile(e.dataTransfer.files[0], (res) => setNewCategory(c => ({...c, image: res})));
  };

  const handleCategoryPaste = (e: React.ClipboardEvent) => {
      if (e.clipboardData.files?.[0]) {
          e.preventDefault();
          processFile(e.clipboardData.files[0], (res) => setNewCategory(c => ({...c, image: res})));
      }
  };
  
  // --- Sticker Logic ---
  const handleAddSticker = (e: React.FormEvent) => {
      e.preventDefault();
      if (!newSticker.name) return;
      const sticker: Sticker = {
          id: `s_${Date.now()}`,
          name: newSticker.name,
          bgColor: newSticker.bgColor,
          textColor: newSticker.textColor
      };
      onUpdateStickers([...stickers, sticker]);
      setNewSticker({ name: '', bgColor: '#3b82f6', textColor: '#ffffff' });
      showToastMessage('Стикер создан');
  };

  const handleDeleteSticker = (id: string) => {
      if (window.confirm('Удалить стикер?')) {
          onUpdateStickers(stickers.filter(s => s.id !== id));
      }
  };
  
  // --- Settings Logic ---
  const handleSettingsSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onUpdateStoreSettings(localSettings);
      showToastMessage('Настройки успешно сохранены!');
  };
  
  const handleLogoDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault(); e.stopPropagation();
      if (e.dataTransfer.files?.[0]) {
          processFile(e.dataTransfer.files[0], (res) => setLocalSettings(s => ({...s, logoUrl: res})));
      }
  };
  
  // --- Real Photos Logic ---
  const handleRealPhotoDrop = (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault(); e.stopPropagation();
      if (e.dataTransfer.files?.[0]) {
          processFile(e.dataTransfer.files[0], (res) => {
              setLocalSettings(s => ({...s, realPhotos: [...(s.realPhotos || []), res]}));
          });
      }
  };

  const handleRemoveRealPhoto = (index: number) => {
      setLocalSettings(s => ({
          ...s,
          realPhotos: s.realPhotos.filter((_, i) => i !== index)
      }));
  };

  // Recursive render for categories in list
  const renderCategoryTree = (parentId: number | null = null, depth = 0) => {
      const cats = categories
        .filter(c => (c.parentId ?? null) === parentId)
        .sort((a, b) => (a.sortOrder || 0) - (b.sortOrder || 0));
      if (cats.length === 0) return null;

      return cats.map(cat => (
          <React.Fragment key={cat.id}>
              <div 
                className={`bg-white dark:bg-[#242d37] rounded-xl p-3 flex items-center border transition-all duration-200 mb-2 ${draggedItemId === cat.id ? 'opacity-50 border-dashed border-blue-500' : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500'} ${cat.status === false ? 'opacity-60' : ''}`} 
                style={{ marginLeft: `${depth * 20}px` }}
                draggable
                onDragStart={(e) => handleDragStart(e, cat.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, cat.id, parentId)}
              >
                  <div className="mr-3 text-gray-400 cursor-move">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" /></svg>
                  </div>
                  {depth > 0 && (
                      <div className="text-gray-400 mr-2">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </div>
                  )}
                  <div className="w-10 h-10 bg-gray-100 dark:bg-gray-800 rounded overflow-hidden flex-shrink-0 relative mr-3">
                       {cat.image ? (
                           <img src={cat.image} alt="" className={`w-full h-full object-cover ${!cat.showImage && 'opacity-30 grayscale'}`} />
                       ) : (
                           <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                       )}
                       {!cat.showImage && <div className="absolute inset-0 flex items-center justify-center"><div className="w-full h-px bg-red-500 rotate-45 absolute"></div></div>}
                  </div>
                  <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-gray-900 dark:text-white font-medium text-sm">{cat.name}</h4>
                        <span className="text-[10px] bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded text-gray-600 dark:text-gray-300">#{cat.sortOrder}</span>
                      </div>
                      <div className="text-[10px] text-gray-500">{products.filter(p => p.categoryId === cat.id).length} товаров</div>
                  </div>
                  <div className="flex items-center space-x-1">
                       <button 
                          onClick={() => toggleCategoryStatus(cat)} 
                          className={`text-[10px] px-2 py-1 rounded font-bold transition-colors mr-2 ${cat.status !== false ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}
                       >
                          {cat.status !== false ? 'ON' : 'OFF'}
                       </button>
                      <button onClick={() => handleEditCategoryClick(cat)} className="p-2 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded-lg transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                      </button>
                      <button onClick={() => handleCategoryDelete(cat.id)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors">
                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                  </div>
              </div>
              {renderCategoryTree(cat.id, depth + 1)}
          </React.Fragment>
      ));
  };
  
  const renderSettings = () => (
      <form onSubmit={handleSettingsSubmit} className="space-y-6 p-2">
          <div>
              <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Название магазина</label>
              <input type="text" value={localSettings.name} onChange={e => setLocalSettings({...localSettings, name: e.target.value})} className="w-full bg-white dark:bg-[#17212b] border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white" />
          </div>
          <div>
              <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Описание</label>
              <textarea rows={3} value={localSettings.description} onChange={e => setLocalSettings({...localSettings, description: e.target.value})} className="w-full bg-white dark:bg-[#17212b] border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white resize-none" />
          </div>
          <div>
              <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Контакты менеджера</label>
              <input type="text" value={localSettings.managerContact} onChange={e => setLocalSettings({...localSettings, managerContact: e.target.value})} className="w-full bg-white dark:bg-[#17212b] border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white font-mono text-sm" />
          </div>
          <div>
              <label className="block text-gray-600 dark:text-gray-400 text-sm mb-2">Логотип</label>
              <div className="flex gap-4 items-start">
                   <div onDrop={handleLogoDrop} onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={() => logoInputRef.current?.click()} className="w-32 h-32 bg-white dark:bg-[#17212b] border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-full flex items-center justify-center cursor-pointer hover:border-blue-500 transition-colors overflow-hidden flex-shrink-0">
                       {localSettings.logoUrl ? <img src={localSettings.logoUrl} alt="Logo" className="w-full h-full object-cover" /> : <span className="text-xs text-gray-500">Logo</span>}
                       <input type="file" ref={logoInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], (res) => setLocalSettings(s => ({...s, logoUrl: res})))} className="hidden" accept="image/*" />
                   </div>
                   <div className="flex-1">
                       <input type="text" value={localSettings.logoUrl} onChange={e => setLocalSettings({...localSettings, logoUrl: e.target.value})} className="w-full bg-white dark:bg-[#17212b] border border-gray-300 dark:border-gray-700 rounded-lg p-3 text-gray-900 dark:text-white text-sm mb-2" placeholder="URL изображения..." />
                   </div>
              </div>
          </div>
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
              <button type="submit" className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all">Сохранить настройки</button>
          </div>

          {/* Backup Section */}
          <div className="pt-6 border-t border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Синхронизация с сайтом</h3>
              <button 
                type="button"
                onClick={handleDownloadStaticDB}
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 rounded-xl shadow mb-2 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" /></svg>
                💾 Скачать db.json
              </button>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-6">
                1. Скачайте файл. <br/>
                2. Загрузите его в корень вашего сайта через FTP. <br/>
                3. Все изменения станут доступны на всех устройствах.
              </p>

              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Резервное копирование (Локально)</h3>
              <div className="flex gap-4">
                  <button 
                      type="button"
                      onClick={handleBackup}
                      className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center"
                  >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
                      Бэкап
                  </button>
                  <button 
                      type="button"
                      onClick={() => restoreInputRef.current?.click()}
                      className="flex-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-white font-bold py-3 rounded-xl shadow transition-colors flex items-center justify-center"
                  >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                      Восстановить
                  </button>
                  <input 
                      type="file" 
                      ref={restoreInputRef} 
                      onChange={handleRestoreFile} 
                      className="hidden" 
                      accept=".json" 
                  />
              </div>
          </div>
      </form>
  );

  const renderStatistics = () => (
      <div className="p-2 space-y-4">
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Общая статистика магазина</h3>
          
          <div className="grid grid-cols-2 gap-4">
              <div className="bg-white dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Всего товаров</div>
                  <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{products.length}</div>
              </div>
              
              <div className="bg-white dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Категорий</div>
                  <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">{categories.length}</div>
              </div>

              <div className="bg-white dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Добавлений в избранное</div>
                  <div className="text-3xl font-bold text-red-500 dark:text-red-400">{stats.favoritesCount}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Суммарно за все время</div>
              </div>

              <div className="bg-white dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
                  <div className="text-gray-500 dark:text-gray-400 text-xs mb-1">Обращений клиентов</div>
                  <div className="text-3xl font-bold text-green-600 dark:text-green-400">{stats.consultationsCount}</div>
                  <div className="text-[10px] text-gray-400 mt-1">Заявок на консультацию</div>
              </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl text-xs text-gray-600 dark:text-gray-300 mt-4">
              <p>Примечание: Статистика активности (избранное, обращения) сохраняется локально в этом браузере. При очистке данных или сбросе базы счетчики могут обнулиться.</p>
          </div>
      </div>
  );

  const renderInterface = () => (
      <div className="p-2 space-y-6">
           <div className="bg-white dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Отображение</h3>
                
                <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700">
                    <div>
                        <div className="text-gray-900 dark:text-white font-medium">Показывать Артикул (SKU)</div>
                        <div className="text-xs text-gray-500">Отображает код товара на странице просмотра</div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={localSettings.showSku} 
                            onChange={(e) => setLocalSettings(prev => ({...prev, showSku: e.target.checked}))}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                <div className="flex items-center justify-between py-2">
                    <div>
                        <div className="text-gray-900 dark:text-white font-medium">Показывать товары из подкатегорий</div>
                        <div className="text-xs text-gray-500 max-w-[200px]">
                            Если включено, в родительской категории видны товары всех вложенных категорий
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                            type="checkbox" 
                            checked={localSettings.showProductsFromSubcategories} 
                            onChange={(e) => setLocalSettings(prev => ({...prev, showProductsFromSubcategories: e.target.checked}))}
                            className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
           </div>

            {/* Real Photos Management */}
           <div className="bg-white dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Галерея реальных фото</h3>
                
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-gray-900 dark:text-white font-medium text-sm">Включить галерею</div>
                            <div className="text-xs text-gray-500">Отображается в каждом товаре</div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={localSettings.realPhotosEnabled || false} 
                                onChange={(e) => setLocalSettings(prev => ({...prev, realPhotosEnabled: e.target.checked}))}
                                className="sr-only peer" 
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div>
                         <label className="block text-xs text-gray-500 mb-1">Заголовок блока</label>
                         <input 
                            type="text" 
                            value={localSettings.realPhotosLabel || ''}
                            onChange={(e) => setLocalSettings({...localSettings, realPhotosLabel: e.target.value})}
                            placeholder="Например: Фото от покупателей"
                            className="w-full bg-gray-50 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-600 rounded px-3 py-2 text-sm text-gray-900 dark:text-white"
                         />
                    </div>

                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Загрузить фото</label>
                        <div onDrop={handleRealPhotoDrop} onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={() => realPhotoInputRef.current?.click()} className="border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-4 text-center bg-gray-50 dark:bg-[#242d37] cursor-pointer hover:border-blue-500 transition-colors">
                            <span className="text-gray-500 text-xs">Нажмите или перетащите сюда фото</span>
                            <input type="file" ref={realPhotoInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], (res) => setLocalSettings(s => ({...s, realPhotos: [...(s.realPhotos || []), res]})))} className="hidden" accept="image/*" />
                        </div>
                    </div>

                    {/* Grid of photos */}
                    {localSettings.realPhotos && localSettings.realPhotos.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mt-2">
                            {localSettings.realPhotos.map((photo, idx) => (
                                <div key={idx} className="relative aspect-square group">
                                    <img src={photo} className="w-full h-full object-cover rounded border border-gray-200 dark:border-gray-600" />
                                    <button 
                                        onClick={() => handleRemoveRealPhoto(idx)}
                                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
           </div>

           <div className="bg-white dark:bg-[#17212b] p-4 rounded-xl border border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Управление стикерами</h3>
                
                {/* New Sticker Form */}
                <form onSubmit={handleAddSticker} className="flex gap-2 mb-6 p-3 bg-gray-50 dark:bg-[#242d37] rounded-lg items-end">
                    <div className="flex-1">
                        <label className="block text-xs text-gray-500 mb-1">Название</label>
                        <input 
                            type="text" 
                            required
                            placeholder="Например: TOP"
                            value={newSticker.name} 
                            onChange={e => setNewSticker({...newSticker, name: e.target.value})}
                            className="w-full bg-white dark:bg-[#0e1621] border border-gray-300 dark:border-gray-600 rounded px-2 py-2 text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-xs text-gray-500 mb-1">Цвет</label>
                        <input 
                            type="color" 
                            value={newSticker.bgColor}
                            onChange={e => setNewSticker({...newSticker, bgColor: e.target.value})}
                            className="h-9 w-16 rounded cursor-pointer"
                        />
                    </div>
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold h-9 flex items-center">
                        +
                    </button>
                </form>

                {/* List */}
                <div className="space-y-2">
                    {stickers.map(sticker => (
                        <div key={sticker.id} className="flex items-center justify-between bg-gray-50 dark:bg-[#242d37] p-2 rounded border border-gray-200 dark:border-gray-600">
                            <div className="flex items-center gap-3">
                                <span 
                                    className="px-2 py-1 rounded text-xs font-bold uppercase"
                                    style={{ backgroundColor: sticker.bgColor, color: sticker.textColor }}
                                >
                                    {sticker.name}
                                </span>
                            </div>
                            <button 
                                onClick={() => handleDeleteSticker(sticker.id)}
                                className="text-red-500 hover:bg-red-100 dark:hover:bg-red-900/20 p-1 rounded"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
           </div>

           <div className="pt-4">
              <button 
                onClick={handleSettingsSubmit}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg transition-all"
              >
                  Сохранить настройки интерфейса
              </button>
          </div>
      </div>
  );
  
  const filteredAdminProducts = filterCategoryId ? products.filter(p => p.categoryId === filterCategoryId) : products;

  // --- Render ---

  if (!isAdmin) {
    return (
      <div className="flex flex-col h-full bg-white dark:bg-[#0e1621] p-6 overflow-y-auto transition-colors">
        {toast && <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-2xl flex items-center animate-bounce-in ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}><span className="font-bold">{toast.message}</span></div>}
        <div className="flex justify-between items-center mb-8">
             <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Panel</h2>
             <button onClick={onExit} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">Закрыть</button>
        </div>
        <div className="bg-gray-100 dark:bg-[#17212b] p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-2xl">
            <div className="mb-6 text-center">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Вход</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Введите номер администратора</p>
            </div>
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="89203718545" className="w-full bg-white dark:bg-[#0e1621] border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-gray-900 dark:text-white text-center text-lg" />
                <button type="submit" className="w-full py-3 rounded-xl font-bold bg-blue-600 text-white">Войти</button>
            </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0e1621] relative transition-colors">
        {toast && <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 z-[60] px-6 py-3 rounded-xl shadow-2xl flex items-center animate-bounce-in ${toast.type === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white`}><span className="font-bold">{toast.message}</span></div>}
        
        {showImportModal && (
            <div className="absolute inset-0 z-50 bg-black/50 dark:bg-black/80 backdrop-blur-sm p-4 flex items-center justify-center">
                <div className="bg-white dark:bg-[#17212b] w-full max-w-sm rounded-xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xl">
                    <h3 className="text-gray-900 dark:text-white font-bold mb-2">Импорт CSV</h3>
                    <div className="space-y-4">
                        <input type="file" accept=".csv" ref={importFileRef} onChange={handleImportFile} disabled={isImporting} className="w-full text-sm text-gray-500 dark:text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700" />
                        {isImporting && <p className="text-yellow-500 text-sm animate-pulse">Обработка...</p>}
                        <div className="flex gap-2 mt-4"><button onClick={() => setShowImportModal(false)} className="flex-1 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded hover:bg-gray-300 dark:hover:bg-gray-600">Закрыть</button></div>
                    </div>
                </div>
            </div>
        )}

        {showAddCategoryModal && (
            <div className="absolute inset-0 z-50 bg-black/50 dark:bg-black/90 backdrop-blur-sm flex flex-col overflow-hidden">
                 <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between bg-white dark:bg-[#17212b]">
                    <h3 className="text-gray-900 dark:text-white font-bold">{editingId ? 'Редактировать категорию' : 'Новая категория'}</h3>
                    <button onClick={() => setShowAddCategoryModal(false)} className="text-gray-500 dark:text-gray-400">Закрыть</button>
                </div>
                <div className="flex-1 overflow-y-auto p-4" onPaste={handleCategoryPaste}>
                    <form onSubmit={handleCategorySubmit} className="space-y-4">
                        <div><label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Название</label><input required value={newCategory.name} onChange={e => setNewCategory({...newCategory, name: e.target.value})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white" /></div>
                        <div><label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Порядок сортировки</label><input type="number" value={newCategory.sortOrder} onChange={e => setNewCategory({...newCategory, sortOrder: parseInt(e.target.value) || 0})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white" /></div>
                        <div>
                            <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Родительская категория</label>
                            <select value={newCategory.parentId} onChange={e => setNewCategory({...newCategory, parentId: e.target.value})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white">
                                <option value="">-- Корневая --</option>
                                {categories.filter(c => c.id !== editingId).map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Изображение</label>
                             <div onDrop={handleCategoryDrop} onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={() => catFileInputRef.current?.click()} className="border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-4 text-center bg-gray-50 dark:bg-[#17212b] cursor-pointer hover:border-blue-500 transition-colors">
                                {newCategory.image ? <img src={newCategory.image} className="h-24 mx-auto object-contain" alt="Preview" /> : <span className="text-gray-500 text-xs">Drop image here</span>}
                                <input type="file" ref={catFileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], (res) => setNewCategory(c => ({...c, image: res})))} className="hidden" accept="image/*" />
                             </div>
                        </div>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="flex items-center gap-2"><input type="checkbox" id="showImg" checked={newCategory.showImage} onChange={e => setNewCategory({...newCategory, showImage: e.target.checked})} className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" /><label htmlFor="showImg" className="text-gray-900 dark:text-white text-sm">Показывать картинку</label></div>
                             <div className="flex items-center gap-2"><input type="checkbox" id="catStatus" checked={newCategory.status} onChange={e => setNewCategory({...newCategory, status: e.target.checked})} className="w-4 h-4 rounded bg-gray-200 dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" /><label htmlFor="catStatus" className="text-gray-900 dark:text-white text-sm">Активная категория</label></div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 py-3 rounded-xl text-white font-bold mt-6">Сохранить</button>
                    </form>
                </div>
            </div>
        )}

        {/* Product Modal */}
        {showAddModal && (
            <div className="absolute inset-0 z-50 bg-black/50 dark:bg-black/90 backdrop-blur-sm flex flex-col overflow-hidden">
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-[#17212b]">
                    <h3 className="text-gray-900 dark:text-white font-bold text-lg">{editingId ? 'Редактировать товар' : 'Новый товар'}</h3>
                    <button onClick={() => setShowAddModal(false)} className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar" onPaste={handleProductPaste}>
                    <form onSubmit={handleAddProductSubmit} className="space-y-4 pb-10">
                        {/* Product Type Toggle */}
                        <div className="flex gap-4 p-1 bg-gray-100 dark:bg-[#0e1621] rounded-lg">
                            <button 
                                type="button"
                                onClick={() => setNewProduct({...newProduct, isBundle: false})}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${!newProduct.isBundle ? 'bg-white dark:bg-[#242d37] shadow text-blue-600' : 'text-gray-500'}`}
                            >
                                Обычный товар
                            </button>
                            <button 
                                type="button"
                                onClick={() => setNewProduct({...newProduct, isBundle: true})}
                                className={`flex-1 py-2 text-sm font-bold rounded-md transition-all ${newProduct.isBundle ? 'bg-white dark:bg-[#242d37] shadow text-purple-600' : 'text-gray-500'}`}
                            >
                                Комплект (Сет)
                            </button>
                        </div>

                        <div><label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Название *</label><input required value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white" /></div>
                        
                        {!newProduct.isBundle ? (
                            <div className="grid grid-cols-2 gap-4">
                                <div><label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Цена *</label><input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white" /></div>
                                <div><label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Акция</label><input type="number" value={newProduct.specialPrice} onChange={e => setNewProduct({...newProduct, specialPrice: e.target.value})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white" /></div>
                            </div>
                        ) : (
                            <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-sm text-gray-600 dark:text-gray-300 mb-2">
                                Цена и остаток комплекта рассчитываются автоматически на основе добавленных товаров.
                            </div>
                        )}

                        <div className="grid grid-cols-2 gap-4">
                             <div><label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Артикул</label><input value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white" /></div>
                             {!newProduct.isBundle && (
                                <div><label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Количество</label><input type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white" /></div>
                             )}
                        </div>
                        
                        {/* Split Category Selection */}
                        <div className="bg-gray-50 dark:bg-[#242d37] p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                            <label className="block text-gray-600 dark:text-gray-400 text-xs mb-2 font-bold">Расположение товара</label>
                            <div className="grid grid-cols-2 gap-2">
                                <div>
                                    <label className="block text-gray-500 text-[10px] mb-1">Раздел (Родитель)</label>
                                    <select 
                                        value={formParentCategory} 
                                        onChange={e => {
                                            const val = e.target.value === 'root' ? 'root' : Number(e.target.value);
                                            setFormParentCategory(val);
                                            // If switching parent, reset subcategory selection to first child or parent itself
                                            if (val === 'root') {
                                                // Picking a root category that isn't actually a category object isn't possible here except 'root' string which means "Top Level" context
                                                // Actually, if user selects 'root', it implies creating a root item, but products must belong to a category.
                                                // If 'root' is selected, we might filter for top-level categories to pick from in the second box.
                                                // Let's simplify:
                                            } else {
                                                // Auto-select the parent itself as default
                                                setNewProduct({...newProduct, categoryId: val as number});
                                            }
                                        }} 
                                        className="w-full bg-white dark:bg-[#0e1621] border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-xs"
                                    >
                                        <option value="root">-- Все разделы --</option>
                                        {categories.filter(c => !c.parentId).map(c => (
                                            <option key={c.id} value={c.id}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-gray-500 text-[10px] mb-1">Категория</label>
                                    <select 
                                        value={newProduct.categoryId} 
                                        onChange={e => setNewProduct({...newProduct, categoryId: Number(e.target.value)})} 
                                        className="w-full bg-white dark:bg-[#0e1621] border border-gray-300 dark:border-gray-600 rounded-lg p-2 text-gray-900 dark:text-white text-xs"
                                    >
                                        {formParentCategory === 'root' ? (
                                            // Show all root categories if no parent selected (allow placing in root)
                                            categories.filter(c => !c.parentId).map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                                        ) : (
                                            <>
                                                <option value={formParentCategory}>-- В корень раздела --</option>
                                                {categories.filter(c => c.parentId === formParentCategory).map(c => (
                                                    <option key={c.id} value={c.id}>{c.name}</option>
                                                ))}
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>
                        
                        {/* Stickers Selection */}
                        <div className="bg-gray-50 dark:bg-[#242d37] p-3 rounded-lg border border-gray-200 dark:border-gray-700">
                             <label className="block text-gray-600 dark:text-gray-400 text-xs mb-2">Стикеры</label>
                             <div className="flex flex-wrap gap-2">
                                 {stickers.map(sticker => {
                                     const isSelected = newProduct.stickerIds.includes(sticker.id);
                                     return (
                                         <button
                                            key={sticker.id}
                                            type="button"
                                            onClick={() => toggleStickerSelection(sticker.id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold uppercase border transition-all ${
                                                isSelected 
                                                  ? 'border-transparent shadow-md scale-105' 
                                                  : 'border-gray-300 dark:border-gray-600 opacity-50 grayscale hover:opacity-100 hover:grayscale-0'
                                            }`}
                                            style={{ 
                                                backgroundColor: isSelected ? sticker.bgColor : 'transparent', 
                                                color: isSelected ? sticker.textColor : 'inherit'
                                            }}
                                         >
                                             {sticker.name}
                                             {isSelected && <span className="ml-1">✓</span>}
                                         </button>
                                     );
                                 })}
                             </div>
                        </div>

                        <div><label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Описание</label><textarea rows={4} value={newProduct.description} onChange={e => setNewProduct({...newProduct, description: e.target.value})} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white text-sm" placeholder="Подробное описание товара..." /></div>

                        {/* Attributes */}
                        <div>
                            <div className="flex justify-between items-center mb-2"><label className="block text-gray-600 dark:text-gray-400 text-xs">Характеристики</label><button type="button" onClick={addAttribute} className="text-blue-500 text-xs hover:underline">+ Добавить</button></div>
                            <div className="space-y-2">{newProduct.attributes.map((attr, index) => (<div key={index} className="flex gap-2"><input placeholder="Название" value={attr.name} onChange={(e) => handleAttributeChange(index, 'name', e.target.value)} className="flex-1 bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white text-xs" /><input placeholder="Значение" value={attr.text} onChange={(e) => handleAttributeChange(index, 'text', e.target.value)} className="flex-1 bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded p-2 text-gray-900 dark:text-white text-xs" /><button type="button" onClick={() => removeAttribute(index)} className="text-red-500 p-1 hover:bg-red-500/10 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button></div>))}</div>
                        </div>
                        
                        {/* --- BUNDLE MANAGEMENT --- */}
                        {newProduct.isBundle && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <label className="block text-gray-900 dark:text-white font-bold text-sm mb-2">Состав комплекта</label>
                                <div className="bg-gray-50 dark:bg-[#242d37] rounded-lg p-3 mb-3">
                                    {newProduct.bundleItems.length > 0 ? (
                                        <div className="space-y-2">
                                            {newProduct.bundleItems.map(itemId => {
                                                const p = products.find(prod => prod.id === itemId);
                                                if (!p) return null;
                                                return (
                                                    <div key={itemId} className="flex items-center justify-between bg-white dark:bg-[#17212b] p-2 rounded border border-gray-200 dark:border-gray-600">
                                                        <div className="flex items-center gap-2">
                                                            <img src={p.image} className="w-8 h-8 rounded object-cover bg-gray-100" />
                                                            <div>
                                                                <div className="text-xs font-bold text-gray-800 dark:text-gray-200">{p.name}</div>
                                                                <div className="text-[10px] text-gray-500">
                                                                    {(p.specialPrice ?? p.price).toLocaleString()} ₽ | Ост: {p.stock}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <button type="button" onClick={() => removeBundleItem(itemId)} className="text-red-500 p-1">
                                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                        </button>
                                                    </div>
                                                )
                                            })}
                                            <div className="text-right text-xs font-bold text-gray-900 dark:text-white pt-2">
                                                Итого: {newProduct.bundleItems.reduce((acc, id) => {
                                                    const p = products.find(prod => prod.id === id);
                                                    return acc + (p ? (p.specialPrice ?? p.price) : 0);
                                                }, 0).toLocaleString()} ₽
                                            </div>
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center">Добавьте товары в комплект</p>
                                    )}
                                </div>

                                {/* Bundle Search */}
                                <div className="relative">
                                    <input 
                                        placeholder="Найти товар для комплекта..."
                                        value={productSearchQuery}
                                        onChange={(e) => {
                                            setProductSearchQuery(e.target.value);
                                            setShowProductSearchResults(true);
                                        }}
                                        className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white text-xs"
                                    />
                                    {showProductSearchResults && productSearchQuery && (
                                        <div className="absolute bottom-full mb-1 left-0 right-0 bg-white dark:bg-[#242d37] border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-40 overflow-y-auto z-10">
                                            {searchProducts(true, false, true).map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => addBundleItem(p)}
                                                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs border-b border-gray-100 dark:border-gray-700 last:border-0 text-gray-800 dark:text-gray-200"
                                                >
                                                    <div className="flex justify-between">
                                                        <span className="font-bold">{p.name}</span>
                                                        <span>{(p.specialPrice ?? p.price).toLocaleString()} ₽</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Multi-Dimensional Variants Management (Hidden for Bundles to avoid complexity) */}
                        {!newProduct.isBundle && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                                <div className="flex justify-between items-center mb-2">
                                    <label className="block text-gray-900 dark:text-white font-bold text-sm">Варианты товара</label>
                                    <button type="button" onClick={addVariantLabel} disabled={newProduct.variantLabels.length >= 2} className="text-xs text-blue-500 hover:underline disabled:opacity-50">+ Параметр (макс 2)</button>
                                </div>
                                
                                {/* Labels Configuration */}
                                <div className="grid grid-cols-2 gap-2 mb-4">
                                    {newProduct.variantLabels.map((label, idx) => (
                                        <div key={idx} className="relative">
                                            <label className="block text-[10px] text-gray-500 mb-1">Параметр {idx+1} (напр: Цвет)</label>
                                            <div className="flex">
                                                <input 
                                                    value={label}
                                                    onChange={(e) => updateVariantLabel(idx, e.target.value)}
                                                    className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-l-lg p-2 text-gray-900 dark:text-white text-xs"
                                                />
                                                {idx > 0 && (
                                                    <button type="button" onClick={() => removeVariantLabel(idx)} className="px-2 bg-red-100 text-red-500 rounded-r-lg border-y border-r border-gray-300">X</button>
                                                )}
                                            </div>
                                            {/* Current Value for This Dimension */}
                                            <div className="mt-1">
                                                 <input 
                                                    placeholder={`Мой ${label}`}
                                                    value={newProduct.variantValues[idx] || ''}
                                                    onChange={(e) => updateOwnVariantValue(idx, e.target.value)}
                                                    className="w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-2 text-gray-900 dark:text-white text-xs font-medium"
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="bg-gray-50 dark:bg-[#242d37] rounded-lg p-3 mb-3">
                                    <h4 className="text-xs text-gray-500 mb-2">Связанные товары:</h4>
                                    {newProduct.variants.length > 0 ? (
                                        <div className="space-y-2">
                                            {newProduct.variants.map(v => {
                                                const p = products.find(prod => prod.id === v.productId);
                                                const name = p ? p.name : (v.productId === editingId ? '(Этот товар)' : 'Unknown');
                                                const isSelf = v.productId === editingId;
                                                
                                                return (
                                                    <div key={v.productId} className={`flex flex-col gap-1 bg-white dark:bg-[#17212b] p-2 rounded border ${isSelf ? 'border-blue-400' : 'border-gray-200 dark:border-gray-600'}`}>
                                                        <div className="flex justify-between items-center">
                                                            <div className="text-xs font-medium text-gray-800 dark:text-gray-200 truncate w-48">
                                                                {isSelf && <span className="font-bold text-blue-500 mr-1">[SELF]</span>}
                                                                {name}
                                                            </div>
                                                            <button type="button" onClick={() => removeVariant(v.productId)} className="text-red-500 p-1">
                                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                                            </button>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            {newProduct.variantLabels.map((lbl, dimIdx) => (
                                                                 <input 
                                                                    key={dimIdx}
                                                                    placeholder={lbl}
                                                                    value={v.values[dimIdx] || ''}
                                                                    onChange={(e) => updateVariantValue(v.productId, dimIdx, e.target.value)}
                                                                    disabled={isSelf} // Self values are edited in the header block above
                                                                    className={`flex-1 bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded px-2 py-1 text-xs text-gray-900 dark:text-white ${isSelf ? 'opacity-50' : ''}`}
                                                                />
                                                            ))}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-xs text-gray-400 text-center">Нет вариантов</p>
                                    )}
                                </div>
                                
                                {editingId && !newProduct.variants.find(v => v.productId === editingId) && (
                                    <button 
                                        type="button" 
                                        onClick={addSelfToVariants}
                                        className="w-full mb-2 border border-dashed border-blue-300 text-blue-500 py-1 rounded text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20"
                                    >
                                        + Добавить этот товар в список
                                    </button>
                                )}

                                <div className="relative">
                                    <div className="flex gap-2">
                                        <input 
                                            placeholder="Найти товар для добавления..."
                                            value={productSearchQuery}
                                            onChange={(e) => {
                                                setProductSearchQuery(e.target.value);
                                                setShowProductSearchResults(true);
                                            }}
                                            className="flex-1 bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white text-xs"
                                        />
                                    </div>
                                    {showProductSearchResults && productSearchQuery && (
                                        <div className="absolute bottom-full mb-1 left-0 right-0 bg-white dark:bg-[#242d37] border border-gray-200 dark:border-gray-600 rounded-lg shadow-xl max-h-40 overflow-y-auto z-10">
                                            {searchProducts().map(p => (
                                                <button
                                                    key={p.id}
                                                    type="button"
                                                    onClick={() => addVariant(p)}
                                                    className="w-full text-left p-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-xs border-b border-gray-100 dark:border-gray-700 last:border-0 text-gray-800 dark:text-gray-200"
                                                >
                                                    <div className="font-bold">{p.name}</div>
                                                    <div className="text-gray-500">{p.sku}</div>
                                                </button>
                                            ))}
                                            {searchProducts().length === 0 && (
                                                <div className="p-2 text-xs text-gray-400 text-center">Не найдено</div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="block text-gray-600 dark:text-gray-400 text-xs mb-1">Фото (Drop/Paste/URL)</label>
                            <div className="mb-2">
                                <input 
                                    type="text" 
                                    placeholder="Или вставьте ссылку на фото (например: /images/photo.jpg)" 
                                    value={newProduct.mainImage} 
                                    onChange={e => setNewProduct({...newProduct, mainImage: e.target.value})}
                                    className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-700 rounded-lg p-2 text-gray-900 dark:text-white text-sm"
                                />
                            </div>
                            <div onDrop={handleProductDrop} onDragOver={(e) => {e.preventDefault(); e.stopPropagation();}} onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-gray-400 dark:border-gray-600 rounded-lg p-4 text-center hover:border-blue-500 transition-colors mb-2 bg-gray-50 dark:bg-[#17212b] cursor-pointer">
                                {newProduct.mainImage ? <img src={newProduct.mainImage} alt="Preview" className="h-32 mx-auto object-contain rounded" /> : <span className="text-gray-500 text-xs">Перетащите файл сюда</span>}
                                <input type="file" ref={fileInputRef} onChange={(e) => e.target.files?.[0] && processFile(e.target.files[0], (res) => setNewProduct(p => ({...p, mainImage: res})))} className="hidden" accept="image/*" />
                            </div>
                        </div>
                        <button type="submit" className="w-full bg-green-600 text-white font-bold py-3 rounded-xl shadow-lg">
                            {editingId ? 'Сохранить' : 'Создать'}
                        </button>
                    </form>
                </div>
            </div>
        )}

        {/* --- HEADER --- */}
        <div className="p-4 bg-white dark:bg-[#17212b] border-b border-gray-200 dark:border-gray-700 flex flex-col gap-3 shadow-md z-10 transition-colors">
            <div className="flex justify-between items-center">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500 mr-2 animate-pulse"></div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">Admin</h2>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={onExit} className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold shadow transition-colors flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        В магазин
                    </button>
                    <div className="flex items-center gap-1 border-l border-gray-300 dark:border-gray-600 pl-3">
                         <button onClick={onDeleteAll} className="text-red-500 hover:text-red-400 p-2" title="Удалить ВСЕ товары"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                        <button onClick={onResetDB} className="text-yellow-500 hover:text-yellow-400 p-2" title="Сбросить базу (Демо)"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg></button>
                    </div>
                    <button onClick={onLogout} className="text-red-500 dark:text-red-400 text-xs hover:text-red-400 dark:hover:text-red-300 ml-1">Выход</button>
                </div>
            </div>
            <div className="flex bg-gray-100 dark:bg-[#0e1621] p-1 rounded-lg overflow-x-auto">
                <button onClick={() => setActiveSection('products')} className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeSection === 'products' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Товары</button>
                <button onClick={() => setActiveSection('categories')} className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeSection === 'categories' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Категории</button>
                <button onClick={() => setActiveSection('settings')} className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeSection === 'settings' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Настройки</button>
                <button onClick={() => setActiveSection('interface')} className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeSection === 'interface' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Интерфейс</button>
                <button onClick={() => setActiveSection('statistics')} className={`flex-1 py-2 px-3 rounded-md text-sm font-bold transition-all whitespace-nowrap ${activeSection === 'statistics' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'}`}>Статистика</button>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
                {activeSection === 'products' && (
                    <>
                        <button onClick={handleNewProductClick} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors">+ Товар</button>
                        <button onClick={() => setShowImportModal(true)} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 rounded-lg text-gray-800 dark:text-white transition-colors" title="Импорт CSV"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg></button>
                         <button onClick={handleExport} className="bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 px-3 rounded-lg text-gray-800 dark:text-white transition-colors" title="Экспорт CSV"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg></button>
                    </>
                )}
                
                {activeSection === 'categories' && (
                    <button onClick={handleNewCategoryClick} className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 rounded-lg text-sm font-bold flex items-center justify-center transition-colors">+ Категория</button>
                )}
            </div>

            {/* Filter Row */}
            {activeSection === 'products' && (
                <div className="relative">
                    <select value={filterCategoryId || ''} onChange={(e) => setFilterCategoryId(e.target.value ? Number(e.target.value) : null)} className="w-full bg-gray-100 dark:bg-[#0e1621] border border-gray-300 dark:border-gray-600 rounded-lg py-2 px-3 text-gray-900 dark:text-white text-sm focus:outline-none focus:border-blue-500 appearance-none">
                        <option value="">Все категории ({products.length})</option>
                        {categories.map(cat => {
                            const count = products.filter(p => p.categoryId === cat.id).length;
                            return <option key={cat.id} value={cat.id}>{cat.name} ({count})</option>;
                        })}
                    </select>
                    <div className="absolute right-3 top-2.5 pointer-events-none text-gray-500"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg></div>
                </div>
            )}
        </div>

        {/* --- CONTENT LIST --- */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="pb-20">
                {activeSection === 'products' && (
                    <div className="space-y-3">
                        <div className="text-xs text-gray-500 text-right mb-1">Показано: {filteredAdminProducts.length} из {products.length}</div>
                        {filteredAdminProducts.length > 0 ? (
                            filteredAdminProducts.map(p => (
                                <div key={p.id} className={`bg-white dark:bg-[#242d37] rounded-xl p-3 flex items-center border ${p.status ? 'border-gray-200 dark:border-gray-700' : 'border-red-200 dark:border-red-900/50 opacity-60'}`}>
                                    <div className="w-14 h-14 bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden flex-shrink-0 relative">
                                        <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                                        {p.stickerIds && p.stickerIds.length > 0 && (
                                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>
                                        )}
                                    </div>
                                    <div className="ml-3 flex-1 min-w-0">
                                        <div className="flex justify-between">
                                            <h4 className="text-gray-900 dark:text-white font-medium text-sm truncate">
                                                {p.isBundle && <span className="text-purple-600 mr-1 text-xs font-bold">[СЕТ]</span>}
                                                {p.name}
                                            </h4>
                                            <div className="flex space-x-1">
                                                <button onClick={() => handleEditProductClick(p)} className="text-blue-500 p-1 hover:bg-blue-50 dark:hover:bg-blue-500/10 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg></button>
                                                <button onClick={() => handleProductDelete(p.id)} className="text-red-500 p-1 hover:bg-red-50 dark:hover:bg-red-500/10 rounded"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></button>
                                            </div>
                                        </div>
                                        <div className="flex justify-between mt-1">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-gray-500">{p.stock} шт. | Арт: {p.sku}</span>
                                                {p.stickerIds && p.stickerIds.length > 0 && (
                                                    <div className="flex gap-1 mt-1">
                                                        {p.stickerIds.slice(0,3).map(sid => {
                                                            const s = stickers.find(st => st.id === sid);
                                                            return s ? <span key={sid} className="w-2 h-2 rounded-full" style={{backgroundColor: s.bgColor}}></span> : null;
                                                        })}
                                                    </div>
                                                )}
                                            </div>
                                            <button onClick={() => toggleProductStatus(p)} className={`text-[10px] px-2 rounded h-fit ${p.status ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>{p.status ? 'ON' : 'OFF'}</button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 py-10"><p>Товары не найдены</p></div>
                        )}
                    </div>
                )}
                
                {activeSection === 'categories' && (
                    <div className="space-y-1">
                        <p className="text-xs text-gray-500 mb-2 text-center">Перетащите категорию, чтобы изменить порядок</p>
                        {renderCategoryTree(null)}
                    </div>
                )}
                
                {activeSection === 'settings' && renderSettings()}
                
                {activeSection === 'interface' && renderInterface()}

                {activeSection === 'statistics' && renderStatistics()}
            </div>
        </div>
    </div>
  );
};

export default AdminPanel;
